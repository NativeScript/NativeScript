import type { SourceLines } from './source-lines.ts';
import ts from 'typescript';
import { AsyncLowering, usedBefore, type AsyncCtx, type AsyncSyntax, type AsyncTranslator } from './async.ts';
import { isAsync, isStatic } from './throws.ts';
import { intlConstructor, isObjectToStringCall, isStringRaw, redeclaredBeside, iteratedType, iterationThrows, jsKeyOrder, literalKey, neverDefined, templateParts, unsafeReceiver, wellKnownMember, WELL_KNOWN_MEMBERS } from './lang.ts';

/**
 * TypeScript to Kotlin, typed by the checker, with JavaScript's semantics
 * where Kotlin's differ: numbers are Double and print as JavaScript prints
 * them, arrays, maps, sets and objects are references (`JSArray`, `JSMap`,
 * `JSSet`, `JSRecord`, classes), `any` is `Any?`, exceptions carry the thrown
 * value (`JSException`), and async functions are continuations over
 * spec-exact promises (async.ts). Anything outside what is translated stops
 * the build with its file, line and construct.
 */

const KEYWORDS = new Set(['as', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if', 'in', 'interface', 'is', 'null', 'object', 'package', 'return', 'super', 'this', 'throw', 'true', 'try', 'typealias', 'typeof', 'val', 'var', 'when', 'while']);

export function ident(name: string): string {
  if (name === '_') return '__underscore';
  const n = name.replace(/^#/, '_p_').replace(/\$/g, '_').replace(/^(?=\d)/, '_').replace(/[^\w]/g, '_');
  return KEYWORDS.has(n) ? `\`${n}\`` : n;
}

export function kotlinString(text: string): string {
  return '"' + escapeText(text) + '"';
}

function escapeText(text: string): string {
  return text.replace(/[\\"$\n\r\t\b]|[\u0000-\u001f\u007f]/g, (c) => {
    switch (c) {
      case '\\': return '\\\\';
      case '"': return '\\"';
      case '$': return '\\$';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '\t': return '\\t';
      case '\b': return '\\b';
      default: return `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;
    }
  });
}

/** `T?`, keeping an already nullable type and parenthesizing a function type. */
export function optionalType(t: string): string {
  if (t.endsWith('?') || t === 'Nothing') return t;
  return isFunctionType(t) ? `(${t})?` : `${t}?`;
}

/** A Kotlin function type (`(A) -> B`), not a nullable one or a generic of one. */
export const isFunctionType = (t: string) => /^\(.*\) -> /.test(t) && !/^\(.*\)\?$/.test(t) && topLevelArrow(t);

function topLevelArrow(t: string): boolean {
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '(' || c === '<') depth++;
    else if ((c === ')' || c === '>') && t[i - 1] !== '-') depth--;
    else if (c === '-' && t[i + 1] === '>' && depth === 0) return true;
  }
  return false;
}

export interface ComponentInfo {
  name: string;
  props: string[];
}

/** Direct calls into the Android SDK (`android.*`, `java.*`), typed by @nativescript/types-android. */
export interface KotlinNative {
  type(t: ts.Type): string | null;
  isValueType(t: string): boolean;
  isNativeDeclaration(d: ts.Node): boolean;
  identifier(e: ts.Identifier): string | null;
  property(e: ts.PropertyAccessExpression): string | null;
  call(e: ts.CallExpression): string | null;
  construct(e: ts.NewExpression): string | null;
  assign(left: ts.PropertyAccessExpression, right: ts.Expression): string | null;
  structLiteral(e: ts.ObjectLiteralExpression, t: ts.Type): string | null;
  classDecl(c: ts.ClassDeclaration): string | null;
  toNumber(e: ts.Expression, t: string): string | null;
}

/** @nativescript/core's API through the Android kit. */
export interface KotlinCore {
  type(t: ts.Type): string | null;
  property(e: ts.PropertyAccessExpression): string | null;
  lvalue(e: ts.PropertyAccessExpression): string | null;
  call(e: ts.CallExpression): string | null;
  construct(e: ts.NewExpression): string | null;
  assign(left: ts.PropertyAccessExpression, right: ts.Expression): string | null;
}

const ERRORS: Record<string, string> = { Error: 'JSError', TypeError: 'JSTypeError', RangeError: 'JSRangeError', SyntaxError: 'JSSyntaxError', ReferenceError: 'JSReferenceError', AggregateError: 'JSAggregateError' };
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date', 'WeakRef', 'Symbol', 'WeakMap', 'WeakSet', 'BigInt']);
const VALUE_TYPES = new Set(['Double', 'String', 'Boolean', 'Any?', 'Any', 'Unit', 'Nothing', 'JSBigInt', 'JSSymbol']);

/**
 * A module-level property: its JVM accessors would clash with a function the
 * module declares by that name (`state` and `getState()`), so it has none.
 */
function moduleProperty(decl: string): string {
  const name = /(?:var|val) (\S+):/.exec(decl)![1];
  return decl.startsWith('lateinit ') ? `@get:JvmName("__get_${name.replace(/`/g, '')}") @set:JvmName("__set_${name.replace(/`/g, '')}") ${decl}` : `@JvmField ${decl}`;
}

export class Translator implements AsyncTranslator {
  readonly syntax = KOTLIN_SYNTAX;
  /** The component class being translated: its props read as `this.<prop>.value`. */
  props = new Set<string>();
  /** Named types translated code uses: an interface becomes a class only if something does. */
  readonly used = new Set<string>();
  private interfaces = new Map<string, { file: string; code: () => string }>();
  private shapes = new Map<string, { name: string; fields: ShapeField[] }>();
  private shaping = new Set<ts.Type>();
  /** Angular `computed()` fields, translated as getters: `this.total()` reads `this.total`. */
  private computed = new Set<string>();
  /** Variables initialized from an element read (`const r = xs[i]`): nullable, unwrapped where they are used. */
  private undefinedVars = new Map<ts.Symbol, string>();
  /** A tagged template's strings, one constant per call site, as JavaScript caches them. */
  private templateObjects: string[] = [];
  /** Labels of labeled blocks in scope: `break label` returns from the block's lambda. */
  private blockLabels = new Set<string>();
  /** Accessors for module-level variables a class member of the same name hides (`__global_fruits`). */
  private globalAliases = new Map<string, string>();
  /** App classes another app class extends: they stay open. */
  private extended = new Set<string>();
  /** Interfaces an app class implements: Kotlin interfaces, with a class for their object literals. */
  private protocols = new Set<string>();
  indent = '';
  private tmp = 0;
  /** Expressions already evaluated into a Kotlin name (awaited values, operands read before an await). */
  readonly subst = new Map<ts.Node, string>();
  asyncCtx: AsyncCtx | null = null;
  /** Marks each statement with its source line (`#sourceLocation` in Swift, a line table for Kotlin). */
  lines: SourceLines | null = null;
  private plainBreak = 0;
  private plainContinue = 0;
  private returnType = 'Unit';
  /**
   * The statements a plain `break`/`continue` targets, innermost last: a loop
   * (with the label its body has when `continue` must skip to a do-while's
   * condition) or a switch block, which `break` leaves.
   */
  private jumps: ({ kind: 'loop'; continueLabel?: string } | { kind: 'switch'; label: string })[] = [];
  /** A Promise executor's `resolve` parameter → its JSResolvers, so resolving with a promise adopts it. */
  private resolvers = new Map<ts.Symbol, { name: string; type: string }>();
  /** Template methods take their loop variables with defaults only so the checker can type them. */
  private templateParams = false;
  readonly sourceFiles: readonly ts.SourceFile[];
  private lowering: AsyncLowering;
  core: KotlinCore | null = null;
  native: KotlinNative | null = null;
  /** The app's package, which qualifies a module function a class member's name shadows. */
  appModule = '';

  readonly checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[]) {
    this.checker = checker;
    this.components = components;
    this.sourceFiles = files;
    this.lowering = new AsyncLowering(this);
    for (const f of files) {
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          const base = n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
          if (base && ts.isIdentifier(base.expression)) this.extended.add(base.expression.text);
          for (const i of n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) this.protocols.add(i.expression.getText());
        }
        ts.forEachChild(n, visit);
      };
      visit(f);
    }
  }

  fresh(prefix: string): string {
    return `${prefix}${this.tmp++}`;
  }

  nested<T>(body: () => T): T {
    const saved = this.indent;
    this.indent += '    ';
    try { return body(); } finally { this.indent = saved; }
  }

  withAsync<T>(ctx: AsyncCtx, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue] as const;
    this.asyncCtx = ctx;
    this.plainBreak = 0;
    this.plainContinue = 0;
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue] = saved; }
  }

  withLoweredLoop<T>(body: () => T): T {
    const saved = [this.plainBreak, this.plainContinue] as const;
    this.plainBreak = 0;
    this.plainContinue = 0;
    try { return body(); } finally { [this.plainBreak, this.plainContinue] = saved; }
  }

  private inFunction<T>(returnType: string, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.jumps] as const;
    this.asyncCtx = null;
    this.plainBreak = 0;
    this.plainContinue = 0;
    this.returnType = returnType;
    this.jumps = [];
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.jumps] = saved; }
  }

  // ---- Types -----------------------------------------------------------------------------

  type(t: ts.Type, where?: ts.Node): string {
    const c = this.checker;
    const F = ts.TypeFlags;
    if (t.flags & F.EnumLike) {
      const native = this.native?.type(t);
      if (native) return native;
    }
    if (t.flags & (F.Any | F.Unknown)) return 'Any?';
    if (t.flags & F.Never) return 'Nothing';
    if (t.flags & (F.Void | F.Undefined)) return 'Unit';
    if (t.flags & F.Null) return 'Any?';
    if (t.flags & F.TypeParameter) {
      const name = t.symbol?.name;
      if (name === 'this') {
        const cls = where && ts.findAncestor(where, ts.isClassLike);
        if (cls?.name) return cls.name.text;
      }
      return name ?? 'Any?';
    }
    if (t.isUnion()) {
      const parts = t.types.filter((u) => !(u.flags & (F.Undefined | F.Null | F.Void)));
      if (!parts.length) return 'Any?';
      const optional = parts.length < t.types.length;
      const translated = parts.flatMap((u) => { try { return [this.type(u, where)]; } catch { return []; } });
      if (!translated.length) return this.type(parts[0], where);
      const kinds = [...new Set(translated)];
      const base = kinds.length === 1 ? kinds[0] : this.native?.type(t) ?? 'Any?';
      return optional ? optionalType(base) : base;
    }
    if (t.flags & (F.Number | F.NumberLiteral)) return 'Double';
    if (t.flags & (F.String | F.StringLiteral | F.TemplateLiteral)) return 'String';
    if (t.flags & (F.Boolean | F.BooleanLiteral)) return 'Boolean';
    if (t.flags & (F.ESSymbol | F.UniqueESSymbol)) return 'JSSymbol';
    if (t.flags & F.NonPrimitive) return 'Any?';
    if (t.flags & F.BigIntLike) return 'JSBigInt';
    if (c.isTupleType(t)) {
      const args = c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where));
      if (args.length === 2) return `Pair<${args.join(', ')}>`;
      if (args.length === 3) return `Triple<${args.join(', ')}>`;
      const same = args.every((a) => a === args[0]);
      return `JSArray<${same && args.length ? args[0] : 'Any?'}>`;
    }
    if (c.isArrayType(t)) return `JSArray<${this.type(c.getTypeArguments(t as ts.TypeReference)[0], where)}>`;
    const sym = t.aliasSymbol ?? t.getSymbol();
    const name = sym?.getName();
    const args = () => t.aliasTypeArguments ?? c.getTypeArguments(t as ts.TypeReference);
    const arg = (k: number) => this.type(args()[k], where);
    switch (name) {
      case 'Sig': case 'Ref': case 'VueRef': case 'WritableSignal': case 'InputSignal': case 'Writable': return `Signal<${arg(0)}>`;
      case 'Signal': return arg(0);
      case 'EventData': return 'EventData';
      case 'OutputEmitterRef': return `Emitter<${arg(0)}>`;
      case 'RouterExtensions': return 'Router';
      case 'Promise': case 'PromiseLike': return `JSPromise<${arg(0)}>`;
      case 'AnimationPromise': return 'JSPromise<Unit>';
      case 'Map': case 'ReadonlyMap': return `JSMap<${arg(0)}, ${arg(1)}>`;
      case 'Set': case 'ReadonlySet': return `JSSet<${arg(0)}>`;
      case 'Date': return 'JSDate';
      case 'RegExp': return 'JSRegExp';
      case 'RegExpMatchArray': case 'RegExpExecArray': return 'JSMatch';
      case 'RegExpStringIterator': return 'JSArray<JSMatch>';
      case 'TemplateStringsArray': return 'JSArray<String>';
      case 'PropertyDescriptor': case 'PropertyDescriptorMap': if (sym?.declarations?.[0] && /[\\/]typescript[\\/]lib[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'Any?'; break;

      case 'Generator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSGenerator<${arg(0)}>`; break;
      case 'NumberFormat': case 'DateTimeFormat': if (isLibDeclaration(sym?.declarations?.[0])) return `JS${name}`; break;
      case 'NumberFormatOptions': case 'DateTimeFormatOptions': case 'ResolvedNumberFormatOptions': case 'ResolvedDateTimeFormatOptions': case 'LocalesArgument':
        if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?';
        break;
      case 'IterableIterator': case 'MapIterator': case 'SetIterator': case 'ArrayIterator': case 'Iterator': case 'IteratorObject': case 'StringIterator': return `JSIterator<${arg(0)}>`;
      case 'Iterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSIterable<${arg(0)}>`; break;
      case 'AsyncGenerator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncGenerator<${arg(0)}>`; break;
      case 'AsyncIterator': case 'AsyncIterableIterator': case 'AsyncIteratorObject': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterator<${arg(0)}>`; break;
      case 'AsyncIterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterable<${arg(0)}>`; break;
      case 'IteratorResult': case 'IteratorYieldResult': case 'IteratorReturnResult': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'WeakMap': return `JSWeakMap<${arg(0)}, ${arg(1)}>`;
      case 'WeakSet': return `JSWeakSet<${arg(0)}>`;
      case 'WeakRef': return `JSWeakRef<${arg(0).replace(/\?$/, '')}>`;
      case 'Symbol': if (sym?.declarations?.[0] && /[\\/]typescript[\\/]lib[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'JSSymbol'; break;
    }
    if (name && ERRORS[name] && sym?.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return ERRORS[name];
    const native = this.native?.type(t);
    if (native) return native;
    const core = this.core?.type(t);
    if (core) return core;
    const index = t.getStringIndexType() ?? t.getNumberIndexType();
    if (index && !t.getProperties().length) return `JSRecord<${this.type(index, where)}>`;
    // A literal with computed keys beside named ones (`{ [k]: 1, a: 2 }`): its keys are known only when it runs.
    if (index && sym?.getName() === '__object') return 'Any?';
    const calls = t.getCallSignatures();
    if (calls.length && !t.getProperties().length) {
      const s = calls[0];
      const params = s.getParameters().map((p) => {
        const pt = this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && (p.valueDeclaration.questionToken || p.valueDeclaration.initializer)) return optionalType(pt);
        return pt;
      });
      return `(${params.join(', ')}) -> ${this.type(s.getReturnType(), where)}`;
    }
    if (this.isEventData(t)) return 'EventData';
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    // RxJS's classes are the kit's Rx classes: core has an Observable of its own.
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/rxjs.d.ts') return `Rx${name}${(t as ts.TypeReference).typeArguments?.length ? `<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>` : ''}`;
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    if (name && name !== '__type' && name !== '__object') {
      if (sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) this.used.add(name);
      const classDecl = sym?.declarations?.find((d): d is ts.ClassDeclaration => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile);
      const declared = classDecl?.typeParameters?.length ?? 0;
      if (declared) return `${name}<${c.getTypeArguments(t as ts.TypeReference).slice(0, declared).map((a) => this.type(a, where)).join(', ')}>`;
      return name;
    }
    const props = t.getProperties().map((p) => p.name);
    if (props.length && props.every((p) => ['eventName', 'object', 'value'].includes(p))) return 'EventData';
    return this.shape(t, where);
  }

  private isEventData(t: ts.Type): boolean {
    const target = (t as ts.TypeReference).target ?? t;
    if (!(target.flags & ts.TypeFlags.Object) || !target.isClassOrInterface()) return false;
    const declared = target.getSymbol()?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
    if (declared && target.getProperty('eventName') && target.getProperty('object')) return true;
    return this.checker.getBaseTypes(target).some((b) => b.getSymbol()?.getName() === 'EventData' || this.isEventData(b));
  }

  typeOf(n: ts.Node): string {
    if (this.untypedThis.has(n)) return 'Any?';
    return this.type(this.checker.getTypeAtLocation(n), n);
  }

  /** `this` nodes that read an untyped object (a method of an object literal typed `any`). */
  private untypedThis = new Set<ts.Node>();

  /** `this` as the class being translated, not a value a function rebinds it to. */
  private isSelf(e: ts.Expression): boolean {
    return e.kind === ts.SyntaxKind.ThisKeyword && !this.subst.has(e);
  }

  /** Runs `body` with `this` in `fn` (and in the arrow functions inside it) read as `name`. */
  private withThis<T>(fn: ts.Node, name: string, untyped: boolean, body: () => T): T {
    const nodes = thisNodes(fn);
    for (const n of nodes) { this.subst.set(n, name); if (untyped) this.untypedThis.add(n); }
    try { return body(); } finally { for (const n of nodes) { this.subst.delete(n); this.untypedThis.delete(n); } }
  }

  private declaredTypeOf(e: ts.Expression): string | null {
    const sym = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    if (!(ts.isVariableDeclaration(decl) || ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isBindingElement(decl))) return null;
    let t = this.type(this.checker.getTypeOfSymbolAtLocation(sym, decl), decl);
    // A parameter with a default is nullable in its signature only; the body sees it filled in.
    if (ts.isParameter(decl) && decl.questionToken) t = optionalType(t);
    return t;
  }

  private shape(t: ts.Type, where?: ts.Node): string {
    if (this.shaping.has(t)) throw this.error(where, 'a recursive object type without a name');
    this.shaping.add(t);
    try {
      const order: string[] = [];
      if (where && ts.isObjectLiteralExpression(where)) {
        for (const p of where.properties) {
          const keys = ts.isSpreadAssignment(p) ? this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name) : p.name ? [literalKey(p.name, this.checker) ?? p.name.getText()] : [];
          for (const k of keys) if (!order.includes(k)) order.push(k);
        }
      }
      const ordered = jsKeyOrder(order);
      const rank = (n: string) => (ordered.includes(n) ? ordered.indexOf(n) : ordered.length);
      const props = [...t.getProperties()].sort((a, b) => rank(a.name) - rank(b.name));
      const literal = t.getSymbol()?.declarations?.[0];
      const fields = props.map((p): ShapeField => {
        let pt = this.type(this.checker.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (pt === 'Unit') pt = 'Any?';
        const symbolic = wellKnownMember(p.name);
        if (symbolic) return { name: symbolic, type: pt, symbol: true };
        // Accessors of the literal itself; a spread copies an accessor's value into a plain property.
        const getter = p.declarations?.find((d) => ts.isGetAccessorDeclaration(d) && d.parent === literal);
        const setter = p.declarations?.find((d) => ts.isSetAccessorDeclaration(d) && d.parent === literal);
        if (getter || setter) return { name: p.name, type: getter ? pt : optionalType(pt), accessor: { get: !!getter, set: !!setter, value: pt } };
        return { name: p.name, type: p.flags & ts.SymbolFlags.Optional ? optionalType(pt) : pt };
      });
      const key = fields.map((f) => `${f.name}:${f.type}${f.accessor ? `:${f.accessor.get ? 'get' : ''}${f.accessor.set ? 'set' : ''}` : ''}`).sort().join(',');
      let s = this.shapes.get(key);
      if (!s) {
        let name = 'Object_' + (fields.map((f) => f.name.replace(/\W/g, '')).join('_') || 'empty');
        while ([...this.shapes.values()].some((x) => x.name === name)) name += '_';
        s = { name, fields };
        this.shapes.set(key, s);
      }
      return s.name;
    } finally {
      this.shaping.delete(t);
    }
  }

  private isString(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '') === 'String'; }
  private isBool(n: ts.Node) { return this.typeOf(n) === 'Boolean'; }
  private isAny(n: ts.Node) { return this.typeOf(n) === 'Any?'; }
  private isArray(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '').startsWith('JSArray<'); }
  isObjectRef(n: ts.Node) {
    const t = this.typeOf(n).replace(/\?$/, '');
    return this.isObjectType(t);
  }
  isObjectType(t: string): boolean {
    t = t.replace(/\?$/, '');
    return !VALUE_TYPES.has(t) && !isFunctionType(t) && !t.startsWith('(') && !/^[A-Z]$/.test(t) && !this.native?.isValueType(t);
  }
  isPromiseType(t: string): boolean { return t.startsWith('JSPromise<'); }

  zero(t: string): string | null {
    if (t.endsWith('?')) return 'null';
    if (t === 'Double') return '0.0';
    if (t === 'String') return '""';
    if (t === 'Boolean') return 'false';
    if (/^JS(Array|Map|Set|Record)</.test(t)) return `${t}()`;
    return null;
  }

  /** `var name: type` holding a value assigned later. */
  deferredDeclaration(name: string, t: string): string {
    const z = this.zero(t);
    if (z) return `var ${name}: ${t} = ${z}`;
    if (t === 'Unit') return `var ${name}: Unit = Unit`;
    if (/^[A-Z]$/.test(t) || t === 'Nothing') return `var ${name}: ${optionalType(t)} = null`;
    return `lateinit var ${name}: ${t}`;
  }

  // ---- Modules -------------------------------------------------------------------------------

  /** A module's declarations, and the statements that run when it is first imported. */
  module(sf: ts.SourceFile): { code: string; init: string[] } {
    this.props = new Set();
    const out: string[] = [];
    const init: string[] = [];
    let current: ts.Statement | null = null;
    const later = (code: () => string) => { this.indent = '    '; try { init.push((current && this.lines ? this.lines.mark(current) : '') + code()); } finally { this.indent = ''; } };
    for (const st of sf.statements) {
      current = st;
      if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) continue;
      if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, sf.fileName, st.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, sf.fileName, st.type.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isEnumDeclaration(st)) { out.push(this.enumDecl(st)); continue; }
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) out.push(this.func(st, ident(st.name.text))); continue; }
      if (ts.isClassDeclaration(st)) {
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component'));
        if (!component && st.name) out.push(this.classDecl(st));
        continue;
      }
      if (ts.isVariableStatement(st)) {
        const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) {
            for (const n of boundNames(d.name)) out.push(moduleProperty(this.deferredDeclaration(ident(n.text), this.typeOf(n))));
            const tmp = this.fresh('__d');
            later(() => `    val ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', 'assign')}`);
            continue;
          }
          const name = ident(d.name.text);
          const t = this.typeOf(d.name);
          if (!d.initializer) { out.push(moduleProperty(this.deferredDeclaration(name, t))); continue; }
          const maybe = !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
          if (maybe) {
            const sym = this.resolve(d.name);
            if (sym) this.undefinedVars.set(sym, optionalType(t));
            out.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
            later(() => `    ${name} = ${maybe}`);
            continue;
          }
          if (this.pure(d.initializer)) { out.push(moduleProperty(`${constant && !this.mutatedLater(d) ? 'val' : 'var'} ${name}: ${t} = ${this.coerce(d.initializer, t)}`)); continue; }
          out.push(moduleProperty(this.deferredDeclaration(name, t)));
          later(() => `    ${name} = ${this.coerce(d.initializer!, t)}`);
        }
        continue;
      }
      later(() => this.stmt(st));
    }
    return { code: out.join('\n\n') + '\n', init };
  }

  /** Whether a module-level `const` is assigned again by name (never, in valid TypeScript), kept for symmetry with `let`. */
  private mutatedLater(_d: ts.VariableDeclaration): boolean { return false; }

  /** Whether evaluating `e` early (before the module's init runs) cannot be observed. */
  pure(e: ts.Expression): boolean {
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return this.pure(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return !ts.isRegularExpressionLiteral(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isIdentifier(e)) {
      // Another module's variable may not be initialized yet when this file's are.
      const decl = this.resolve(e)?.valueDeclaration;
      if (!decl || !ts.isVariableDeclaration(decl) || decl.getSourceFile().isDeclarationFile) return true;
      // A variable of this file is set at load only when its own initializer is.
      return decl.getSourceFile() === e.getSourceFile() && !!decl.initializer && ts.isSourceFile(decl.parent.parent.parent) && this.pure(decl.initializer);
    }
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((s) => this.pure(s.expression));
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => this.pure(ts.isSpreadElement(x) ? x.expression : x));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? this.pure(p.initializer) && (!ts.isComputedPropertyName(p.name) || this.pure(p.name.expression)) : ts.isShorthandPropertyAssignment(p) ? this.pure(p.name) : ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return this.pure(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && this.pure(e.left) && this.pure(e.right);
    if (ts.isPropertyAccessExpression(e)) return this.pure(e.expression) && !(ts.isIdentifier(e.expression) && this.isLibGlobal(e.expression) && !LIB_CONSTANTS[`${e.expression.text}.${e.name.text}`]);
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every((a) => this.pure(a));
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every((a) => this.pure(a));
    return false;
  }

  private registerInterface(name: string, file: string, members: ts.NodeArray<ts.TypeElement>, decl: ts.Node) {
    if (this.protocols.has(name)) { this.interfaces.set(name, { file, code: () => this.protocolCode(name, members) }); return; }
    const typeParams = (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) ? decl.typeParameters : undefined;
    if (typeParams?.length) throw this.error(decl, 'a generic interface used as an object type');
    this.interfaces.set(name, { file, code: () => this.objectClass(name, members.filter((m) => ts.isPropertySignature(m) || ts.isMethodSignature(m)).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t };
    }), null) });
  }

  /** An interface classes implement: a Kotlin interface, and `<Name>Object` for the object literals of its type. */
  private protocolCode(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t, readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) };
    });
    const methods = members.filter(ts.isMethodSignature).map((m) => {
      const params = m.parameters.map((p, k) => ({ name: ts.isIdentifier(p.name) ? ident(p.name.text) : `p${k}`, type: p.questionToken ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name) }));
      return { name: ident(m.name.getText()), params, ret: this.returnTypeOf(m) };
    });
    const signature = (m: (typeof methods)[0]) => `fun ${m.name}(${m.params.map((p) => `${p.name}: ${p.type}`).join(', ')})${m.ret === 'Unit' ? '' : `: ${m.ret}`}`;
    const fnType = (m: (typeof methods)[0]) => `(${m.params.map((p) => p.type).join(', ')}) -> ${m.ret}`;
    const lines = [`interface ${name} : JSDynamic {`];
    for (const f of fields) lines.push(`    ${f.readonly ? 'val' : 'var'} ${ident(f.name)}: ${f.type}`);
    for (const m of methods) lines.push(`    ${signature(m)}`);
    lines.push('}', '');
    const literal = this.objectClass(`${name}Object`, [...fields, ...methods.map((m) => ({ name: `_${m.name}`, type: fnType(m) }))], null, name, new Set(fields.map((f) => f.name)));
    const withMethods = literal.replace(/\n}$/, '\n' + methods.map((m) => `    override ${signature(m)} = _${m.name}(${m.params.map((p) => p.name).join(', ')})`).join('\n') + '\n}');
    return lines.join('\n') + withMethods;
  }

  interfacesOf(file: string): string {
    let out = '';
    const emitted = new Set<string>();
    for (let more = true; more; ) {
      more = false;
      for (const [name, decl] of this.interfaces) {
        if (decl.file !== file || emitted.has(name) || !this.used.has(name)) continue;
        out = decl.code() + '\n\n' + out;
        emitted.add(name);
        more = true;
      }
    }
    return out;
  }

  shapesCode(): string {
    return [...[...this.shapes.values()].map((s) => this.objectClass(s.name, s.fields, null)), ...this.globalAliases.values(), ...this.templateObjects].join('\n\n');
  }

  /** A plain JavaScript object of a known shape: a class with named fields, readable as a dynamic object. */
  private objectClass(name: string, allFields: ShapeField[], className: string | null, implementing?: string, overrides?: Set<string>): string {
    if (allFields.some((f) => f.accessor)) return this.accessorClass(name, allFields);
    const fields = allFields.filter((f) => !f.symbol);
    const protocols = this.shapeProtocols(allFields);
    const params = [...fields, ...allFields.filter((f) => f.symbol)].map((f) => `${overrides?.has(f.name) ? 'override ' : ''}var ${ident(f.name)}: ${f.type}${f.type.endsWith('?') && !isFunctionType(f.type) ? ' = null' : ''}`);
    const lines = [`class ${name}(${[...params, 'private val jsOrder: List<String>? = null'].join(', ')}) : ${[implementing ?? 'JSDynamic', ...protocols.map((x) => x.conformance)].join(', ')} {`];
    for (const x of protocols) lines.push(...x.lines);
    if (allFields.some((f) => f.symbol)) {
      lines.push(...this.dynamicMembers(fields, className, false), '}');
      return lines.join('\n');
    }
    // Read from an untyped object (a cast of JSON.parse): the keys it has beyond the type's stay readable, in its order.
    lines.push('    private var jsExtra: JSDynamic? = null');
    lines.push('    companion object {');
    lines.push(`        fun fromJS(o: Any?): ${name} = ${name}(${[...fields.map((f) => `${ident(f.name)} = ${this.fromAny(`jsField(o, ${kotlinString(f.name)})`, f.type)}`), 'jsOrder = (o as? JSDynamic)?.jsKeys'].join(', ')}).also { it.jsExtra = o as? JSDynamic }`);
    lines.push('    }');
    const optional = fields.filter((f) => f.type.endsWith('?') && !isFunctionType(f.type));
    lines.push(`    override val jsKeys: List<String>`);
    lines.push(`        get() = (jsOrder ?: listOf(${fields.map((f) => kotlinString(f.name)).join(', ')})).filter { key -> ${optional.length ? `when (key) { ${optional.map((f) => `${kotlinString(f.name)} -> ${ident(f.name)} != null`).join('; ')}; else -> true }` : 'true'} }`);
    lines.push(...this.dynamicMembers(fields, className, false, 'jsExtra?.jsGet(key)', 'jsExtra?.jsSet(key, value)').slice(1));
    lines.push('}');
    return lines.join('\n');
  }

  /**
   * An object literal's class when it has accessors: each accessor runs a
   * function the literal gives, with the object as `this`.
   */
  private accessorClass(name: string, fields: ShapeField[]): string {
    const params: string[] = [];
    const body: string[] = [];
    for (const f of fields) {
      const n = ident(f.name);
      const a = f.accessor;
      if (!a) { params.push(`var ${n}: ${f.type}${f.type.endsWith('?') ? ' = null' : ''}`); continue; }
      if (a.get) params.push(`private val __get_${f.name}: (${name}) -> ${f.type}`);
      if (a.set) params.push(`private val __set_${f.name}: (${name}, ${a.value}) -> Unit`);
      body.push(`    ${a.set ? 'var' : 'val'} ${n}: ${f.type}`, `        get() = ${a.get ? `__get_${f.name}(this)` : 'null'}`);
      if (a.set) body.push(`        set(v) { __set_${f.name}(this, v${a.get ? '' : '!!'}) }`);
    }
    const lines = [`class ${name}(${[...params, 'private val jsOrder: List<String>? = null'].join(', ')}) : JSDynamic, JSAccessorKeyed {`, ...body];
    lines.push(`    override val jsKeys: List<String> get() = jsOrder ?: listOf(${fields.map((f) => kotlinString(f.name)).join(', ')})`);
    lines.push('    override val jsClassName: String? get() = null');
    lines.push('    override fun jsGet(key: String): Any? = when (key) {', ...fields.map((f) => `        ${kotlinString(f.name)} -> this.${ident(f.name)}`), '        else -> null', '    }');
    lines.push('    override fun jsSet(key: String, value: Any?) {', '        when (key) {');
    for (const f of fields) if (!f.accessor || f.accessor.set) lines.push(`            ${kotlinString(f.name)} -> this.${ident(f.name)} = ${this.fromAny('value', f.type)}`);
    lines.push('            else -> {}', '        }', '    }');
    lines.push('    override fun jsAccessorKind(key: String): String? = when (key) {');
    for (const f of fields) if (f.accessor) lines.push(`        ${kotlinString(f.name)} -> ${kotlinString(f.accessor.get && f.accessor.set ? 'Getter/Setter' : f.accessor.get ? 'Getter' : 'Setter')}`);
    lines.push('        else -> null', '    }', '}');
    return lines.join('\n');
  }

  /** What an object literal's class implements by its members: an iterator (`next`), an iterable (`[Symbol.iterator]`). */
  private shapeProtocols(fields: ShapeField[]): { conformance: string; lines: string[] }[] {
    const out: { conformance: string; lines: string[] }[] = [];
    const fn = (n: string) => {
      const f = fields.find((x) => x.name === n && !x.accessor);
      const parts = f && /^\((.*)\) -> (.+)$/.exec(f.type);
      return f && parts ? { name: n, params: parts[1].trim() ? splitTopLevel(parts[1]).length : 0, ret: parts[2] } : undefined;
    };
    const methods = ['next', 'return', 'throw'].map(fn).filter((m): m is NonNullable<typeof m> => !!m);
    const protocol = this.iteratorProtocol(methods);
    if (protocol) out.push(protocol);
    if (fields.some((f) => f.name === 'jsSymbolIterator')) out.push({ conformance: 'JSIterableValue', lines: ['    override fun jsAnyIterator(): JSIteratorProtocol = jsSymbolIterator() as JSIteratorProtocol'] });
    if (fields.some((f) => f.name === 'jsSymbolAsyncIterator')) out.push({ conformance: 'JSAsyncIterableValue', lines: ['    override fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol = jsSymbolAsyncIterator() as JSAsyncIteratorProtocol'] });
    return out;
  }

  /** `JSDynamic`: the object's keys and members by name, for printing, JSON and untyped access. */
  private dynamicMembers(fields: { name: string; type: string }[], className: string | null, inherits: boolean, fallbackGet = 'null', fallbackSet = '', symbols: { key: string; member: string; type: string }[] = []): string[] {
    const keys = fields.map((f) => (f.type.endsWith('?') ? `(if (${ident(f.name)} == null) listOf() else listOf(${kotlinString(f.name)}))` : `listOf(${kotlinString(f.name)})`));
    return [
      `    override val jsKeys: List<String> get() = ${[inherits ? 'super.jsKeys' : '', ...keys].filter(Boolean).join(' + ') || 'listOf()'}`,
      ...(symbols.length ? [`    override val jsSymbolKeys: List<String> get() = listOf(${symbols.map((f) => f.key).join(', ')})`] : []),
      `    override val jsClassName: String? get() = ${className ? kotlinString(className) : 'null'}`,
      `    override fun jsGet(key: String): Any? = when (key) {`,
      ...fields.map((f) => `        ${kotlinString(f.name)} -> this.${ident(f.name)}`),
      ...symbols.map((f) => `        ${f.key} -> this.${f.member}`),
      `        else -> ${inherits ? 'super.jsGet(key)' : fallbackGet}`,
      '    }',
      `    override fun jsSet(key: String, value: Any?) {`,
      '        when (key) {',
      ...fields.map((f) => `            ${kotlinString(f.name)} -> this.${ident(f.name)} = ${this.fromAny('value', f.type)}`),
      ...symbols.map((f) => `            ${f.key} -> this.${f.member} = ${this.fromAny('value', f.type)}`),
      `            else -> ${inherits ? 'super.jsSet(key, value)' : fallbackSet || '{}'}`,
      '        }',
      '    }',
    ];
  }

  fromAnyCode(code: string, type: string, orZero = false): string {
    const zero = this.zero(type);
    if (orZero && zero && zero !== 'null' && !type.endsWith('?')) return `((${code} as? ${type}) ?: ${zero})`;
    return this.fromAny(code, type);
  }

  /** Kotlin code reading an untyped value (`Any?`) as `type`. */
  fromAny(code: string, type: string): string {
    if (type === 'Any?') return code;
    if (type === 'Unit') return 'Unit';
    if (code === 'null' && type.endsWith('?')) return 'null';
    const m = /^JSArray<(.*)>(\??)$/.exec(type);
    if (m) {
      const read = `jsArrayFrom(${code}) { ${this.fromAny('it', m[1])} }`;
      return m[2] ? `(if (jsIsNullish(${code})) null else ${read})` : read;
    }
    const pair = /^(Pair|Triple)<(.*)>$/.exec(type);
    if (pair) {
      const parts = splitTopLevel(pair[2]);
      return `run { val __a = ${code}; ${pair[1]}(${parts.map((t, k) => this.fromAny(`jsField(__a, "${k}")`, t)).join(', ')}) }`;
    }
    const base = type.replace(/\?$/, '');
    if (this.interfaces.has(base) || [...this.shapes.values()].some((s) => s.name === base)) {
      this.used.add(base);
      const target = this.protocols.has(base) ? `${base}Object` : base;
      return type.endsWith('?') ? `(if (jsIsNullish(${code})) null else ${target}.fromJS(${code}))` : `${target}.fromJS(${code})`;
    }
    return `(${code} as ${type})`;
  }

  private enumDecl(e: ts.EnumDeclaration): string {
    const lines = [`object ${ident(e.name.text)} {`];
    for (const m of e.members) {
      const v = this.checker.getConstantValue(m);
      if (v === undefined) throw this.error(m, 'an enum member without a constant value');
      lines.push(`    const val ${ident(m.name.getText())}: ${typeof v === 'string' ? 'String' : 'Double'} = ${typeof v === 'string' ? kotlinString(v) : numberLiteral(String(v))}`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  // ---- Functions -----------------------------------------------------------------------------

  private params(fn: ts.SignatureDeclaration, closure: boolean): string {
    return fn.parameters.map((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.dotDotDotToken) return `${name}: ${this.typeOf(p.name)}`;
      let t = this.typeOf(p.name);
      let given = '';
      if (p.questionToken || (p.initializer && !this.templateParams)) {
        if (!closure && p.initializer && this.isConstant(p.initializer)) given = ` = ${this.coerce(p.initializer, t)}`;
        else { t = optionalType(t); if (!closure) given = ' = null'; }
      }
      return `${name}: ${t}${given}`;
    }).join(', ');
  }

  private isConstant(e: ts.Expression): boolean {
    return ts.isLiteralExpression(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(e.kind) || (ts.isPrefixUnaryExpression(e) && ts.isNumericLiteral(e.operand));
  }

  /** Statements a function body starts with: computed defaults, destructured parameters. */
  paramPrelude(fn: ts.SignatureDeclaration): string[] {
    const i = this.indent;
    const lines: string[] = [];
    fn.parameters.forEach((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      const closure = ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || (ts.isMethodDeclaration(fn) && ts.isObjectLiteralExpression(fn.parent));
      if (p.initializer && !this.templateParams && (closure || !this.isConstant(p.initializer))) {
        lines.push(`${i}val ${name}: ${this.typeOf(p.name)} = ${name} ?: ${this.coerce(p.initializer, this.typeOf(p.name))}`);
      }
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, name, '', false));
    });
    return lines;
  }

  returnTypeOf(fn: ts.SignatureDeclaration): string {
    return this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    return fn.typeParameters?.length ? `<${fn.typeParameters.map((p) => p.name.text).join(', ')}>` : '';
  }

  /** A function's body block (`{ … }`), lowered when the function is async. */
  functionBody(fn: ts.FunctionLikeDeclaration, ret: string, base: string): string {
    return this.inFunction(ret, () => {
      const saved = this.indent;
      this.indent = base + '    ';
      try {
        let lines: string[];
        if (fn.asteriskToken) lines = this.lowering.generatorBody(fn, ret.replace(/^JS\w+<(.*)>$/, '$1'), isAsync(fn));
        else if (isAsync(fn)) lines = this.lowering.body(fn, ret.replace(/^JSPromise<(.*)>$/, '$1'));
        else if (fn.body && ts.isBlock(fn.body)) {
          lines = [...this.paramPrelude(fn), ...this.statements([...fn.body.statements])];
          const last = fn.body.statements.at(-1);
          // JavaScript returns undefined at the end; Kotlin needs a return where the checker proved one is never reached.
          if (!['Unit', 'Nothing'].includes(ret) && !(last && (ts.isReturnStatement(last) || ts.isThrowStatement(last)))) {
            lines.push(ret.endsWith('?') ? `${this.indent}return null` : `${this.indent}throw IllegalStateException("unreachable: every path returns")`);
          }
        } else {
          const e = fn.body as ts.Expression;
          lines = [...this.paramPrelude(fn), ret === 'Unit' ? this.indent + this.exprStatement(e) : `${this.indent}return ${this.coerce(e, ret)}`];
        }
        return `{\n${lines.filter(Boolean).join('\n')}\n${base}}`;
      } finally { this.indent = saved; }
    });
  }

  func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers = ''): string {
    const ret = this.returnTypeOf(fn);
    return `${modifiers}fun ${this.generics(fn)}${this.generics(fn) ? ' ' : ''}${name}(${this.params(fn, false)})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  /** `(r) => r.id` as a Kotlin anonymous function, where `return` means what it does in JavaScript. */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration, slot?: string): string {
    const contextual = this.checker.getContextualType(fn)?.getCallSignatures()[0];
    const slotRet = slot ? functionTypeParts(slot)?.ret : undefined;
    const voidSlot = (!!contextual && !!(contextual.getReturnType().flags & ts.TypeFlags.Void) && !isAsync(fn)) || slotRet === 'Unit';
    const ret = voidSlot ? 'Unit' : slotRet ?? this.returnTypeOf(fn);
    if (!ts.isMethodDeclaration(fn) && fn.name) throw this.error(fn, 'a named function expression');
    let params = this.params(fn, true);
    // A slot's function type may take more parameters than the literal declares (JavaScript ignores extras).
    const slotParams = slot ? functionTypeParts(slot)?.params ?? [] : [];
    for (let k = fn.parameters.length; k < slotParams.length; k++) params += `${params ? ', ' : ''}@Suppress("UNUSED_PARAMETER") __u${k}: ${slotParams[k]}`;
    return `fun(${params})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  /** A callback for a timer or microtask: a closure, a function value called with nothing, or a Promise's resolve. */
  private callback(e: ts.Expression): string {
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e, '() -> Unit');
    const resolvers = ts.isIdentifier(e) ? this.resolvers.get(this.resolve(e)!) : undefined;
    if (resolvers) return `{ ${resolvers.name}.resolve(${resolvers.type === 'Unit' ? 'Unit' : this.zero(resolvers.type) ?? 'null'}) }`;
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const pads = (sig?.getParameters() ?? []).map((p) => (this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e) === 'Unit' ? 'Unit' : 'null'));
    return `{ ${this.functionValue(e)}(${pads.join(', ')}) }`;
  }

  // ---- Classes -------------------------------------------------------------------------------

  /** Whether a member of `cls` assigns `this.name`. */
  private isAssigned(cls: ts.ClassDeclaration, name: string): boolean {
    let found = false;
    const visit = (n: ts.Node): void => {
      if (found) return;
      if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment
          && ts.isPropertyAccessExpression(n.left) && n.left.expression.kind === ts.SyntaxKind.ThisKeyword && n.left.name.text === name) found = true;
      else ts.forEachChild(n, visit);
    };
    for (const m of cls.members) if (!ts.isPropertyDeclaration(m) || m.initializer) ts.forEachChild(m, visit);
    return found;
  }

  /** A component's members; the caller adds `render()`. Returns the constructor parameters and the lines inside the class. */
  componentMembers(cls: ts.ClassDeclaration, props: string[]): { params: string[]; lines: string[] } {
    this.props = new Set(props);
    this.computed = new Set(cls.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && this.calleeName(m.initializer) === 'computed').map((m) => (m.name as ts.Identifier).text));
    const lines: string[] = [];
    const params: string[] = [];
    this.indent = '    ';
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m)) {
        const name = (m.name as ts.Identifier).text;
        const callee = m.initializer ? this.calleeName(m.initializer) : '';
        if (callee === 'input' || callee === 'input.required') {
          const t = this.typeOf(m.name).replace(/^Signal<(.*)>$/, '$1');
          const given = (m.initializer as ts.CallExpression).arguments[0];
          params.push(`${ident(name)}: ${t}${given ? ` = ${this.coerce(given, t)}` : ''}`);
          lines.push(`    val ${ident(name)}: Signal<${t}> = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        if (callee === 'computed') {
          const fn = (m.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
          const t = this.returnTypeOf(fn);
          lines.push(`    val ${ident(name)}: ${t}`, `        get() ${this.functionBody(fn, t, '        ')}`);
          continue;
        }
        const t = this.typeOf(m.name);
        if (!m.initializer) {
          params.push(`${ident(name)}: ${t}`);
          lines.push(`    val ${ident(name)}: Signal<${t}> = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        this.indent = '        ';
        // A field the class assigns after construction (a Vue `let`) is a Kotlin `var`.
        const reassigned = !hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) && this.isAssigned(cls, name);
        lines.push(`    ${reassigned ? 'var' : 'val'} ${ident(name)}: ${t} = ${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
        continue;
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const t = this.returnTypeOf(m);
        lines.push(`    val ${ident((m.name as ts.Identifier).text)}: ${t}`, `        get() ${this.functionBody(m, t, '        ')}`);
        continue;
      }
      if (ts.isMethodDeclaration(m)) {
        this.templateParams = /^\$[be]\d+$/.test(m.name.getText());
        try { lines.push('    ' + this.func(m, ident((m.name as ts.Identifier).text))); } finally { this.templateParams = false; }
        continue;
      }
    }
    this.indent = '';
    return { params, lines };
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  /** The names an app class's members override: its app base classes' and its interfaces'. */
  private overridden(cls: ts.ClassLikeDeclaration): Set<string> {
    const out = new Set<string>();
    const c = this.checker;
    const addInterface = (h: ts.ExpressionWithTypeArguments) => {
      const t = c.getTypeAtLocation(h);
      if (isLibDeclaration(t.getSymbol()?.declarations?.[0])) return;
      for (const p of t.getProperties()) out.add(p.name);
    };
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      if (b !== cls) for (const m of b.members) if (m.name) out.add(m.name.getText());
      for (const i of b.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) addInterface(i);
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && c.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return out;
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const nativeSubclass = this.native?.classDecl(cls);
    if (nativeSubclass) return nativeSubclass;
    const name = cls.name!.text;
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    if (service) {
      const { params, lines } = this.componentMembers(cls, []);
      return [`class ${name}(${params.join(', ')}) {`, ...lines, '', '    companion object {', `        val shared = ${name}()`, '    }', '}'].join('\n');
    }
    const c = this.checker;
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const baseDecl = heritage && c.getTypeAtLocation(heritage.expression).getSymbol()?.valueDeclaration;
    const appBase = baseDecl && ts.isClassLike(baseDecl) && !baseDecl.getSourceFile().isDeclarationFile ? baseDecl : undefined;
    let base: string | null = null;
    if (heritage) {
      const baseName = heritage.expression.getText();
      if (appBase) base = this.type(c.getTypeAtLocation(heritage), heritage);
      else if (ERRORS[baseName]) base = ERRORS[baseName];
      else throw this.error(heritage, `extending ${baseName}`);
    }
    const isError = !!base && !appBase;
    const abstract = hasModifier(cls, ts.SyntaxKind.AbstractKeyword);
    const open = this.extended.has(name) || abstract;
    // The library's interfaces (`Iterable<T>`, `Iterator<T>`) are interfaces of the kit's, implemented below.
    const implemented = (cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []).filter((i) => !isLibDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0])).map((i) => i.expression.getText());
    for (const i of implemented) this.used.add(i);
    const ownToString = cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls);
    const supertypes = [...implemented, ...(ownToString ? ['JSStringConvertible'] : [])];
    if (!base && !implemented.length) supertypes.push('JSDynamic');
    const overridden = this.overridden(cls);
    const memberOpen = open ? 'open ' : '';
    const mods = (n: string, member = true) => (overridden.has(n) ? 'override ' : member ? memberOpen : '');
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    const paramProps = (ctor?.parameters ?? []).filter((p) => ts.canHaveModifiers(p) && ts.getModifiers(p)?.some((m) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(m.kind)));
    const fields: { name: string; type: string }[] = [];
    const lines: string[] = [];
    const statics: string[] = [];
    this.indent = '    ';
    for (const p of paramProps) {
      const n = (p.name as ts.Identifier).text;
      const t = this.typeOf(p.name);
      // A property a subclass may override needs a value of its own before the constructor runs.
      lines.push(`    ${mods(n)}${open || overridden.has(n) ? this.deferredDeclaration(ident(n), t) : `var ${ident(n)}: ${t}`}`);
      fields.push({ name: n, type: t });
    }
    const symbolFields: { key: string; member: string; type: string }[] = [];
    for (const m of cls.members) {
      if (!ts.isPropertyDeclaration(m)) continue;
      const keyed = this.symbolMember(m.name);
      if (keyed?.key && !isStatic(m)) {
        const t = this.typeOf(m.name);
        symbolFields.push({ key: keyed.key, member: keyed.member, type: t });
        lines.push(`    var ${keyed.member}: ${t} = ${m.initializer ? this.coerce(m.initializer, t) : this.zero(t) ?? 'null'}`);
        continue;
      }
      if (keyed) throw this.error(m.name, 'a field named by this symbol');
      const n = m.name.getText();
      const t = this.typeOf(m.name);
      if (isStatic(m)) {
        this.indent = '        ';
        statics.push(`        var ${ident(n)}: ${t} = ${m.initializer ? this.coerce(m.initializer, t) : this.zero(t) ?? 'null'}`);
        this.indent = '    ';
        continue;
      }
      fields.push({ name: n, type: t });
      if (m.initializer) lines.push(`    ${mods(n)}var ${ident(n)}: ${t} = ${this.coerce(m.initializer, t)}`);
      else lines.push(`    ${mods(n)}${this.deferredDeclaration(ident(n), t).replace(/^lateinit /, 'lateinit ')}`);
    }
    const baseCtor = appBase && this.constructorOf(appBase);
    if (ctor) {
      const body = this.inFunction('Unit', () => {
        this.indent = '        ';
        const out: string[] = [...this.paramPrelude(ctor)];
        const stmts = [...ctor.body!.statements];
        const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
        if (superAt > 0) throw this.error(stmts[0], 'statements before super() in a constructor');
        const own = paramProps.map((p) => `        this.${ident((p.name as ts.Identifier).text)} = ${ident((p.name as ts.Identifier).text)}`);
        out.push(...own, ...this.statements(stmts.slice(superAt + 1)));
        return out;
      });
      const superCall = superAt(ctor);
      const delegation = superCall ? ` : super(${this.args(superCall).join(', ')})` : base ? ' : super()' : '';
      this.indent = '    ';
      lines.push(`    constructor(${this.params(ctor, false)})${delegation} {`, ...body, '    }');
    } else if (base) {
      if (baseCtor) lines.push(`    constructor(${this.params(baseCtor, false)}) : super(${baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})`);
      else lines.push('    constructor() : super()');
    }
    const accessors = new Map<string, { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }>();
    for (const m of cls.members) {
      if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
        const keyed = this.symbolMember(m.name);
        if (keyed && (keyed.member !== 'jsToStringTag' || ts.isSetAccessorDeclaration(m))) throw this.error(m.name, 'an accessor named by this symbol');
        const key = keyed ? keyed.member : m.name.getText();
        const a = accessors.get(key) ?? {};
        if (ts.isGetAccessorDeclaration(m)) a.get = m; else a.set = m;
        accessors.set(key, a);
      }
    }
    if (accessors.has('jsToStringTag')) supertypes.push('JSToStringTag');
    for (const [n, a] of accessors) {
      const t = a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name));
      const target = a.get && isStatic(a.get) ? statics : lines;
      const pad = a.get && isStatic(a.get) ? '        ' : '    ';
      const parts: string[] = [];
      if (a.get) parts.push(`${pad}    get() ${this.functionBody(a.get, t, pad + '    ')}`);
      else parts.push(`${pad}    get() = null`);
      if (a.set) {
        const p = a.set.parameters[0].name as ts.Identifier;
        const body = this.functionBody(a.set, 'Unit', pad + '    ');
        parts.push(`${pad}    set(__value) {\n${pad}        val ${ident(p.text)} = __value${a.get ? '' : '!!'}${body.slice(1)}`);
      }
      target.push(`${pad}${a.get && isStatic(a.get) ? '' : n === 'jsToStringTag' ? 'override ' : mods(n)}${a.set ? 'var' : 'val'} ${ident(n)}: ${t}`, ...parts);
    }
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && !m.body && hasModifier(m, ts.SyntaxKind.AbstractKeyword)) {
        const ret = this.returnTypeOf(m);
        lines.push(`    ${overridden.has(m.name.getText()) ? 'override ' : ''}abstract fun ${ident(m.name.getText())}(${this.params(m, false)})${ret === 'Unit' ? '' : `: ${ret}`}`);
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      const keyed = this.symbolMember(m.name);
      if (keyed?.member === 'jsToPrimitive') {
        const ret = this.returnTypeOf(m);
        lines.push('    ' + this.func(m, '__symbol_toPrimitive'));
        const call = `__symbol_toPrimitive(${m.parameters.length ? 'hint' : ''})`;
        lines.push(`    override fun jsToPrimitive(hint: String): Any? = ${ret === 'Unit' ? `run { ${call}; null }` : call}`);
        supertypes.push('JSToPrimitive');
        continue;
      }
      if (keyed?.member === 'jsSymbolIterator' || keyed?.member === 'jsSymbolAsyncIterator') {
        lines.push('    ' + this.func(m, keyed.member));
        const async = keyed.member === 'jsSymbolAsyncIterator';
        supertypes.push(async ? 'JSAsyncIterableValue' : 'JSIterableValue');
        lines.push(async ? '    override fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol = jsSymbolAsyncIterator()' : '    override fun jsAnyIterator(): JSIteratorProtocol = jsSymbolIterator()');
        continue;
      }
      if (keyed?.key) { lines.push('    ' + this.func(m, keyed.member)); continue; }
      if (keyed) throw this.error(m.name, 'a method named by this symbol');
      const n = m.name.getText();
      if (isStatic(m)) { this.indent = '        '; statics.push('        ' + this.func(m, ident(n))); this.indent = '    '; continue; }
      if (n === 'toString' && !m.parameters.length) { lines.push('    ' + this.func(m, 'toString', 'override ')); continue; }
      lines.push('    ' + this.func(m, ident(n), mods(n)));
    }
    const protocol = this.iteratorProtocol(cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && !isStatic(m) && ['next', 'return', 'throw'].includes(m.name.getText())).map((m) => ({
      name: m.name.getText(), params: m.parameters.length, ret: this.returnTypeOf(m),
    })));
    if (protocol && !appBase) { supertypes.push(protocol.conformance); lines.push(...protocol.lines); }
    if (!isError) lines.push(...this.dynamicMembers(fields, name, !!appBase, 'null', '', symbolFields));
    if (symbolFields.length) supertypes.push('JSSymbolKeyed');
    if (statics.length) lines.push('    companion object {', ...statics, '    }');
    this.indent = '';
    const head = `${abstract ? 'abstract ' : open ? 'open ' : ''}class ${ident(name)}${this.generics(cls)}`;
    const supers = [...(base ? [base] : []), ...supertypes];
    return [`${head}${supers.length ? ` : ${supers.join(', ')}` : ''} {`, ...lines, '}'].join('\n');
  }

  /**
   * A class or object with `next` (and `return`, `throw`) is an iterator
   * script wrote: the kit steps it through these, async when `next` returns a promise.
   */
  private iteratorProtocol(methods: { name: string; params: number; ret: string }[]): { conformance: string; lines: string[] } | null {
    const next = methods.find((m) => m.name === 'next');
    if (!next || next.params > 1) return null;
    const call = (m: { name: string; params: number }, arg: string) => `this.${ident(m.name)}(${m.params ? arg : ''})`;
    const ret = methods.find((m) => m.name === 'return'), thr = methods.find((m) => m.name === 'throw');
    if (next.ret.startsWith('JSPromise<')) {
      const promise = (m: { name: string; params: number; ret: string }, arg: string) => {
        const inner = m.ret.replace(/^JSPromise<(.*)>$/, '$1');
        const c = call(m, arg);
        return inner === 'Any?' ? c : `${c}.then<Any?> { it }`;
      };
      return { conformance: 'JSAsyncIteratorProtocol', lines: [
        `    override fun jsNextPromise(value: Any?): JSPromise<Any?> = ${promise(next, 'value')}`,
        `    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? = ${ret ? promise(ret, 'value') : 'null'}`,
        `    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? = ${thr ? promise(thr, 'error') : 'null'}`,
      ] };
    }
    return { conformance: 'JSIteratorProtocol', lines: [
      `    override fun jsNext(value: Any?): JSStep = jsStepOf(${call(next, 'value')})`,
      `    override fun jsReturn(value: Any?): JSStep = ${ret ? `jsStepOf(${call(ret, 'value')})` : 'JSStep(value, true)'}`,
      `    override fun jsThrow(error: Any?): JSStep = ${thr ? `jsStepOf(${call(thr, 'error')})` : 'throw JSException(error)'}`,
      `    override val jsHasReturn: Boolean get() = ${!!ret}`,
      `    override val jsHasThrow: Boolean get() = ${!!thr}`,
    ] };
  }

  /**
   * A member named by a symbol (`[Symbol.toPrimitive]`, `[key]` for a
   * `const key = Symbol()`): its Kotlin name, and for a symbol of the program,
   * the Kotlin code of its property key.
   */
  private symbolMember(name: ts.PropertyName): { member: string; key: string | null } | null {
    if (!ts.isComputedPropertyName(name)) return null;
    const e = name.expression;
    if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'Symbol' && this.isLibGlobal(e.expression)) {
      const member = WELL_KNOWN_MEMBERS[e.name.text];
      if (!member) throw this.error(name, `a member named Symbol.${e.name.text}`);
      return { member, key: null };
    }
    if (ts.isIdentifier(e) && this.typeOf(e) === 'JSSymbol') return { member: `__symbol_${e.text}`, key: `${this.expr(e)}.key` };
    return null;
  }

  private inheritsToString(cls: ts.ClassLikeDeclaration): boolean {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    if (!d || !ts.isClassLike(d)) return !!h && !!ERRORS[h.expression.getText()];
    return d.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString') || this.inheritsToString(d);
  }

  private constructorOf(cls: ts.ClassLikeDeclaration): ts.ConstructorDeclaration | undefined {
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      const ctor = b.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
      if (ctor) return ctor;
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return undefined;
  }

  // ---- Statements --------------------------------------------------------------------------------

  statements(list: ts.Statement[]): string[] {
    const hoisted = list.filter((s, k) => ts.isFunctionDeclaration(s) && usedBefore(list, k));
    return [...hoisted, ...list.filter((s) => !hoisted.includes(s))].map((s) => this.stmt(s)).filter(Boolean);
  }

  block(b: ts.Statement, base = this.indent): string {
    const saved = this.indent;
    this.indent = base + '    ';
    try {
      const body = this.statements(ts.isBlock(b) ? [...b.statements] : [b]);
      return `{\n${body.join('\n')}\n${base}}`;
    } finally { this.indent = saved; }
  }

  stmt(s: ts.Statement): string {
    const code = this.statementCode(s);
    return code && this.lines ? this.lines.mark(s) + code : code;
  }

  private statementCode(s: ts.Statement): string {
    const i = this.indent;
    const a = this.asyncCtx;
    if (ts.isExpressionStatement(s)) return i + this.exprStatement(s.expression);
    if (ts.isReturnStatement(s)) {
      if (a) {
        const e = s.expression;
        if (!e) return `${i}${a.ret(null, false)}\n${i}return`;
        if (a.generator === 'async') return `${i}${this.lowering.returnIn(a, e)}\n${i}return`;
        const isPromise = this.isPromiseType(this.typeOf(e));
        return `${i}${a.ret(isPromise ? this.expr(e) : this.coerce(e, a.result), isPromise)}\n${i}return`;
      }
      if (!s.expression) return `${i}return`;
      if (this.returnType === 'Unit') return `${i}${this.exprStatement(s.expression)}\n${i}return`;
      return `${i}return ${this.coerce(s.expression, this.returnType)}`;
    }
    if (ts.isIfStatement(s)) {
      let out = `${i}if (${this.cond(s.expression)}) ${this.block(s.thenStatement)}`;
      if (s.elseStatement) out += ts.isIfStatement(s.elseStatement) ? ` else ${this.stmt(s.elseStatement).trimStart()}` : ` else ${this.block(s.elseStatement)}`;
      return out;
    }
    if (ts.isVariableStatement(s)) return this.declarationList(s.declarationList, false);
    if (ts.isFunctionDeclaration(s)) {
      if (!s.name || !s.body) return '';
      return i + this.func(s, ident(s.name.text));
    }
    if (ts.isForOfStatement(s)) {
      if (s.awaitModifier) throw this.error(s, 'for await');
      const list = s.initializer;
      if (!ts.isVariableDeclarationList(list)) throw this.error(s, 'for…of over an existing variable');
      const decl = list.declarations[0];
      const mutable = !(list.flags & ts.NodeFlags.Const);
      const js = this.jsIteration(s.expression);
      if (js) {
        // The iterator protocol: a loop that leaves early closes the iterator.
        const it = this.fresh('__it');
        return this.loopBody(() => {
          const label = this.takeLabel();
          const body = this.nested(() => this.nested(() => this.block(s.statement)));
          const bind = this.nested(() => this.nested(() => this.nested(() => this.bindTo(decl.name, `${it}.jsCurrent`, '', mutable))));
          return `${i}run {\n${i}    val ${it} = ${js}\n${i}    try {\n${i}        ${label}while (${it}.jsAdvance()) {\n${bind}\n${i}            run ${body}\n${i}        }\n${i}    } finally { ${it}.jsClose() }\n${i}}`;
        });
      }
      const seq = this.iterable(s.expression);
      return this.loopBody(() => {
        const label = this.takeLabel();
        if (ts.isIdentifier(decl.name) && !mutable) return `${i}${label}for (${ident(decl.name.text)} in ${seq}) ${this.block(s.statement)}`;
        const item = this.fresh('__item');
        const body = this.block(s.statement);
        return `${i}${label}for (${item} in ${seq}) {\n${this.nested(() => this.bindTo(decl.name, item, '', mutable))}\n${body.slice(2)}`;
      });
    }
    if (ts.isForInStatement(s)) {
      const list = s.initializer as ts.VariableDeclarationList;
      const name = ident((list.declarations[0].name as ts.Identifier).text);
      return this.loopBody(() => `${i}${this.takeLabel()}for (${name} in jsKeysOf(${this.expr(s.expression)})) ${this.block(s.statement)}`);
    }
    if (ts.isForStatement(s)) return this.forStatement(s);
    if (ts.isWhileStatement(s)) return this.loopBody(() => `${i}${this.takeLabel()}while (${this.cond(s.expression)}) ${this.block(s.statement)}`);
    if (ts.isDoStatement(s)) {
      return this.loopBody(() => {
        const label = this.takeLabel();
        if (containsJump(s.statement, ts.SyntaxKind.ContinueStatement)) {
          // `continue` in a do-while goes to its condition: the body is a block that `continue` leaves.
          const inner = this.fresh('body');
          (this.jumps.at(-1) as { continueLabel?: string }).continueLabel = inner;
          return `${i}${label}do {\n${i}    ${inner}@ do ${this.nested(() => this.block(s.statement))} while (false)\n${i}} while (${this.cond(s.expression)})`;
        }
        return `${i}${label}do ${this.block(s.statement)} while (${this.cond(s.expression)})`;
      });
    }
    if (ts.isBreakStatement(s) || ts.isContinueStatement(s)) {
      const isBreak = ts.isBreakStatement(s);
      if (s.label && isBreak && this.blockLabels.has(s.label.text)) return `${i}return@${s.label.text}`;
      if (s.label) return `${i}${isBreak ? 'break' : 'continue'}@${s.label.text}`;
      if (a && (isBreak ? a.brk && !this.plainBreak : a.cont && !this.plainContinue)) return `${i}${isBreak ? a.brk : a.cont}\n${i}return`;
      const top = this.jumps.at(-1);
      if (isBreak && top?.kind === 'switch') return `${i}return@${top.label}`;
      if (!isBreak) {
        const loop = [...this.jumps].reverse().find((j) => j.kind === 'loop') as { continueLabel?: string } | undefined;
        if (loop?.continueLabel) return `${i}break@${loop.continueLabel}`;
      }
      return i + (isBreak ? 'break' : 'continue');
    }
    if (ts.isBlock(s)) return `${i}run ${this.block(s)}`;
    if (ts.isEmptyStatement(s)) return '';
    if (ts.isSwitchStatement(s)) return this.switchStatement(s);
    if (ts.isThrowStatement(s)) return `${i}throw JSException(${this.coerce(s.expression, 'Any?')})`;
    if (ts.isTryStatement(s)) return this.tryStatement(s);
    if (ts.isLabeledStatement(s)) {
      if (this.asyncCtx) throw this.error(s, 'a labeled statement in an async function');
      if (!ts.isIterationStatement(s.statement, false)) {
        // A labeled block, `if` or `switch` is a labeled lambda that `break label` returns from.
        const label = s.label.text;
        this.blockLabels.add(label);
        try { return `${i}run ${label}@ {\n${this.nested(() => this.stmt(s.statement))}\n${i}}`; } finally { this.blockLabels.delete(label); }
      }
      this.label = s.label.text;
      return this.stmt(s.statement);
    }
    if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      if (ts.isClassDeclaration(s)) throw this.error(s, 'a class declared inside a function');
      return '';
    }
    throw this.error(s, 'statement');
  }

  private label: string | null = null;
  private takeLabel(): string {
    const l = this.label;
    this.label = null;
    return l ? `${l}@ ` : '';
  }

  private loopBody(body: () => string): string {
    this.plainBreak++;
    this.plainContinue++;
    this.jumps.push({ kind: 'loop' });
    try { return body(); } finally { this.plainBreak--; this.plainContinue--; this.jumps.pop(); }
  }

  declarationList(list: ts.VariableDeclarationList, lowered: boolean): string {
    const constant = !!(list.flags & ts.NodeFlags.Const);
    return list.declarations.map((d) => this.declaration(d, constant, lowered)).join('\n');
  }

  declaration(d: ts.VariableDeclaration, constant: boolean, lowered: boolean): string {
    const i = this.indent;
    if (ts.isIdentifier(d.name)) {
      const t = this.typeOf(d.name);
      const name = ident(d.name.text);
      if (!d.initializer) return `${i}${lowered || !t.endsWith('?') ? this.deferredDeclaration(name, t) : `var ${name}: ${t} = null`}`;
      const maybe = !lowered && !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
      if (maybe) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${maybe}`;
      }
      return `${i}${constant && !lowered ? 'val' : 'var'} ${name}: ${t} = ${this.coerce(d.initializer, t)}`;
    }
    const tmp = this.fresh('__d');
    return `${i}val ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', !constant)}`;
  }

  /** Declarations binding `name` (an identifier or a destructuring pattern) to the Kotlin value `value`. */
  bindTo(name: ts.BindingName, value: string, _type: string, mutable: boolean | 'assign'): string {
    const i = this.indent;
    const kw = mutable === 'assign' ? '' : mutable ? 'var ' : 'val ';
    const declare = (n: ts.Identifier, t: string, v: string) => (mutable === 'assign' ? `${i}${ident(n.text)} = ${v}` : `${i}${kw}${ident(n.text)}: ${t} = ${v}`);
    if (ts.isIdentifier(name)) return declare(name, this.typeOf(name), value);
    const lines: string[] = [];
    const source = this.checker.getTypeAtLocation(name);
    const tuple = this.checker.isTupleType(source) ? this.checker.getTypeArguments(source as ts.TypeReference).length : 0;
    const tupleField = (k: number) => (tuple === 2 || tuple === 3 ? `${value}.${['first', 'second', 'third'][k]}` : `${value}[${k}]`);
    name.elements.forEach((el, k) => {
      if (ts.isOmittedExpression(el)) return;
      if (el.dotDotDotToken) {
        if (ts.isObjectBindingPattern(name)) throw this.error(el, 'an object rest pattern');
        if (tuple) throw this.error(el, 'a rest element in a tuple pattern');
        lines.push(this.bindTo(el.name, `${value}.slice(${k}.0)`, '', mutable));
        return;
      }
      let read: string;
      const t = this.typeOf(el.name);
      if (ts.isObjectBindingPattern(name)) {
        const key = (el.propertyName ?? el.name).getText();
        read = this.isAny(name) ? `jsGet(${value}, ${kotlinString(key)})` : `${value}.${ident(key)}`;
      } else if (tuple) read = tupleField(k);
      else {
        // An array pattern past the array's end binds undefined.
        read = `${value}.element(${k}.0)`;
        if (!el.initializer && !t.endsWith('?')) read = this.undefinedAs(read, t);
      }
      if (el.initializer) read = `(${read} ?: ${this.coerce(el.initializer, t)})`;
      if (ts.isIdentifier(el.name)) {
        const fromAny = this.isAny(name) && t !== 'Any?' ? this.fromAny(read, t) : read;
        lines.push(declare(el.name, t, fromAny));
      } else {
        const tmp = this.fresh('__d');
        lines.push(`${i}val ${tmp} = ${read}`, this.bindTo(el.name, tmp, '', mutable));
      }
    });
    return lines.join('\n');
  }

  /** What `for…of` iterates: arrays, sets and iterators as they are, a map's entries, a string's code points. */
  iterable(e: ts.Expression): string {
    const js = this.jsIteration(e);
    if (js) return `${js}.jsCollect()`;
    const t = this.typeOf(e).replace(/\?$/, '');
    if (t === 'String') return `jsCodePoints(${this.expr(e)})`;
    if (t.startsWith('JSMap<')) return `${this.expr(e)}.entries()`;
    if (t === 'JSMatch') return `${this.expr(e)}.values`;
    if (t.startsWith('Pair<') || t.startsWith('Triple<')) return `jsTupleList(${this.expr(e)})`;
    return this.expr(e);
  }

  elementTypeOf(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (/^JS(Array|Set|Iterator|Generator|Iterable|AsyncIterator|AsyncGenerator|AsyncIterable)<.*>\??$/.test(t)) return t.replace(/^JS\w+<(.*)>\??$/, '$1');
    const async = ts.isForOfStatement(e.parent) && !!e.parent.awaitModifier;
    const el = iteratedType(this.checker.getTypeAtLocation(e), this.checker, e, async);
    return el ? this.type(el, e) : 'Any?';
  }

  resumedValue(code: string, type: string): string {
    return ['String', 'Double', 'Boolean'].includes(type) ? this.undefinedAs(`(${code} as? ${type})`, type) : this.fromAnyCode(code, type, true);
  }

  /** A script iterator `for…of`, spread and destructuring step through `next()`; null when the value iterates natively. */
  jsIteration(e: ts.Expression): string | null {
    if (!iterationThrows(this.checker.getTypeAtLocation(e), this.checker)) return null;
    return this.iteratorCode(e);
  }

  /** `e[Symbol.iterator]()`: an iterator over any iterable. */
  private iteratorCode(e: ts.Expression): string {
    const t = this.typeOf(e).replace(/\?$/, '');
    const code = this.expr(e);
    if (/^JS(Iterator|Generator)</.test(t)) return code;
    if (t.startsWith('JSIterable<')) return `${code}.jsIterator()`;
    if (t === 'Any?' || t === 'Any') return `jsIteratorOf(${code})`;
    if (/^JS(Array|Set|Map)</.test(t) || t === 'String') return `jsIterator(${code})`;
    return `JSIteratorAdapter<${this.elementTypeOf(e)}>(${code}.jsSymbolIterator())`;
  }

  /** GetIterator(e, async), for `for await`: an async iterable's own iterator, or a sync one's adapted. */
  asyncIteration(e: ts.Expression): string {
    const t = this.typeOf(e).replace(/\?$/, '');
    const code = this.expr(e);
    if (/^JS(AsyncIterator|AsyncGenerator)</.test(t)) return code;
    if (t.startsWith('JSAsyncIterable<')) return `${code}.jsAsyncIterator()`;
    if (t === 'Any?' || t === 'Any') return `jsAsyncIteratorOf(${code})`;
    const el = this.elementTypeOf(e);
    if (this.checker.getTypeAtLocation(e).getProperties().some((p) => p.escapedName.toString().startsWith('__@asyncIterator@'))) return `JSAsyncIteratorAdapter<${el}>(${code}.jsSymbolAsyncIterator())`;
    return `JSAsyncFromSyncIterator<${el}>(${this.iteratorCode(e)})`;
  }

  /** The iterator `yield*` delegates to. */
  delegateIteration(e: ts.Expression, isAsync: boolean): string {
    return isAsync ? this.asyncIteration(e) : this.iteratorCode(e);
  }

  /** The type and value a destructuring pattern reads from: an iterator yields only as many values as an array pattern names. */
  private destructured(name: ts.BindingName, init: ts.Expression): string {
    const js = ts.isArrayBindingPattern(name) ? this.jsIteration(init) : null;
    if (!js) return `: ${this.typeOf(init)} = ${this.expr(init)}`;
    const rest = (name as ts.ArrayBindingPattern).elements.some((el) => ts.isBindingElement(el) && el.dotDotDotToken);
    return ` = JSArray(ArrayList(${js}.${rest ? 'jsCollect()' : `jsTake(${(name as ts.ArrayBindingPattern).elements.length})`}))`;
  }

  private forStatement(s: ts.ForStatement, scoped = false): string {
    const i = this.indent;
    const list = s.initializer && ts.isVariableDeclarationList(s.initializer) ? s.initializer : null;
    // A `let` loop variable is the loop's own: a sibling declaring the same name needs the loop in a scope of its own.
    if (!scoped && list && list.flags & ts.NodeFlags.BlockScoped && redeclaredBeside(s, list)) {
      return `${i}run {\n${this.nested(() => this.forStatement(s, true))}\n${i}}`;
    }
    const init = list ? this.declarationList(list, true) : s.initializer ? i + this.exprStatement(s.initializer as ts.Expression) : '';
    const cond = s.condition ? this.cond(s.condition) : 'true';
    const step = s.incrementor ? this.exprStatement(s.incrementor) : '';
    const captured = list && !(list.flags & ts.NodeFlags.Const) && list.declarations.some((d) => ts.isIdentifier(d.name) && capturedIn(d.name, s.statement, this.checker));
    const labelName = ts.isLabeledStatement(s.parent) ? s.parent.label.text : null;
    const hasContinue = containsJump(s.statement, ts.SyntaxKind.ContinueStatement) || (!!labelName && continuesTo(s.statement, labelName));
    const label = this.takeLabel();
    return this.loopBody(() => {
      if (captured) {
        // `let` loop variables a closure in the body captures are a fresh binding per iteration, as in JavaScript.
        const names = list!.declarations.map((d) => ident((d.name as ts.Identifier).text));
        const first = this.fresh('__first');
        const outer = names.map((n) => `__outer_${n}`);
        const types = list!.declarations.map((d) => this.typeOf(d.name));
        const lines = [`${i}run {`, ...init.split('\n').map((l) => '    ' + l)];
        lines.push(...names.map((n, k) => `${i}    var ${outer[k]}: ${types[k]} = ${n}`), `${i}    var ${first} = true`, `${i}    ${label}while (true) {`);
        lines.push(...names.map((n, k) => `${i}        var ${n}: ${types[k]} = ${outer[k]}`));
        const body = this.nested(() => this.nested(() => this.nested(() => this.block(s.statement))));
        lines.push(`${i}        try {`, `${i}            if (!${first}) { ${step} }`, `${i}            ${first} = false`, `${i}            if (!(${cond})) break`, `${i}            run ${body}`, `${i}        } finally { ${names.map((n, k) => `${outer[k]} = ${n}`).join('; ')} }`, `${i}    }`, `${i}}`);
        return lines.join('\n');
      }
      if (!step) return `${init ? init + '\n' : ''}${i}${label}while (${cond}) ${this.block(s.statement)}`;
      if (hasContinue) {
        const first = this.fresh('__first');
        return `${init ? init + '\n' : ''}${i}var ${first} = true\n${i}${label}while (true) {\n${i}    if (!${first}) { ${step} }\n${i}    ${first} = false\n${i}    if (!(${cond})) break\n${i}    run ${this.nested(() => this.block(s.statement))}\n${i}}`;
      }
      const body = this.block(s.statement).replace(/\n\s*}$/, '');
      return `${init ? init + '\n' : ''}${i}${label}while (${cond}) ${body}\n${i}    ${step}\n${i}}`;
    });
  }

  /**
   * A switch as a labeled block: the clause execution starts at is found
   * first, then each clause runs if it is at or after it (fallthrough), and
   * `break` leaves the block.
   */
  private switchStatement(s: ts.SwitchStatement): string {
    const i = this.indent;
    const label = this.fresh('switch');
    const subject = this.fresh('__switch');
    const start = this.fresh('__start');
    const st = this.typeOf(s.expression);
    const clauses = s.caseBlock.clauses;
    const lines = [`${i}run ${label}@ {`, `${i}    val ${subject}: ${st} = ${this.expr(s.expression)}`];
    const tests: string[] = [];
    clauses.forEach((c, k) => {
      if (!ts.isCaseClause(c)) return;
      const eq = st === 'Any?' || this.typeOf(c.expression) === 'Any?' || /^[A-Z]\??$/.test(st) ? `jsStrictEquals(${subject}, ${this.coerce(c.expression, 'Any?')})` : this.isObjectType(st) ? `${subject} === ${this.expr(c.expression)}` : `${subject} == ${this.coerce(c.expression, st.replace(/\?$/, ''))}`;
      tests.push(`${eq} -> ${k}`);
    });
    const fallback = clauses.findIndex(ts.isDefaultClause);
    lines.push(`${i}    val ${start} = when {`, ...tests.map((x) => `${i}        ${x}`), `${i}        else -> ${fallback >= 0 ? fallback : clauses.length}`, `${i}    }`);
    this.jumps.push({ kind: 'switch', label });
    this.plainBreak++;
    try {
      clauses.forEach((c, k) => {
        if (!c.statements.length) return;
        const body = [...c.statements];
        const last = body.at(-1)!;
        const leaves = ts.isBreakStatement(last) && !last.label;
        if (leaves) body.pop();
        const code = this.nested(() => this.nested(() => this.statements(body)));
        if (leaves && k < clauses.length - 1) code.push(`${i}        return@${label}`);
        if (code.length) lines.push(`${i}    if (${start} <= ${k}) {`, ...code, `${i}    }`);
      });
    } finally { this.jumps.pop(); this.plainBreak--; }
    lines.push(`${i}}`);
    return lines.join('\n');
  }

  private tryStatement(s: ts.TryStatement): string {
    const i = this.indent;
    let code = `${i}try ${this.block(s.tryBlock)}`;
    if (s.catchClause) {
      const binding = s.catchClause.variableDeclaration;
      const caught = this.fresh('__e');
      const bind = binding ? this.nested(() => this.bindTo(binding.name, `jsCaught(${caught})`, '', true)) + '\n' : '';
      const body = this.block(s.catchClause.block);
      code += ` catch (${caught}: Throwable) {\n${bind}${body.slice(2)}`;
    }
    if (s.finallyBlock) code += ` finally ${this.block(s.finallyBlock)}`;
    return code;
  }

  exprStatement(e: ts.Expression): string {
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(e.left)) {
      // `[a, b] = [b, a]`: the right side is evaluated before any target is written.
      const tmp = this.fresh('__swap');
      const tuple = this.checker.isTupleType(this.checker.getTypeAtLocation(e.right));
      const n = this.checker.isTupleType(this.checker.getTypeAtLocation(e.right)) ? this.checker.getTypeArguments(this.checker.getTypeAtLocation(e.right) as ts.TypeReference).length : 0;
      const field = (k: number) => (tuple && (n === 2 || n === 3) ? `${tmp}.${['first', 'second', 'third'][k]}` : `${tmp}[${k}]`);
      const assigns = e.left.elements.map((target, k) => (ts.isOmittedExpression(target) ? '' : `${this.lvalue(target)} = ${field(k)}`)).filter(Boolean);
      return `run { val ${tmp} = ${this.expr(e.right)}; ${assigns.join('; ')} }`;
    }
    if (ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) {
      if (e.operator === ts.SyntaxKind.PlusPlusToken) return `${this.lvalue(e.operand)} += ${this.one(e.operand)}`;
      if (e.operator === ts.SyntaxKind.MinusMinusToken) return `${this.lvalue(e.operand)} -= ${this.one(e.operand)}`;
    }
    if (ts.isAwaitExpression(e) && this.subst.has(e)) return this.subst.get(e)!;
    if (ts.isParenthesizedExpression(e)) return this.exprStatement(e.expression);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.CommaToken) return `${this.exprStatement(e.left)}; ${this.exprStatement(e.right)}`;
    if (ts.isVoidExpression(e)) return this.exprStatement(e.expression);
    return this.expr(e);
  }

  tryPrefix(_e: ts.Node): string {
    return '';
  }

  /** An expression where Kotlin needs a value of `target`. */
  coerce(e: ts.Expression, target: string): string {
    const source = this.typeOf(e);
    // An iterable where the type names only its iteration: the kit's iterable of it.
    const iterableSlot = /^JS(Async)?Iterable<.*>\??$/.exec(target);
    if (iterableSlot && !/^JS(Async)?(Iterable|Iterator|Generator)</.test(source)) return `${iterableSlot[1] ? 'jsAsyncIterable' : 'jsIterable'}(${this.expr(e)})`;
    if (target.endsWith('?') && target !== 'Any?' && !source.endsWith('?')) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?') {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
      if (source === 'Unit' && !(ts.isIdentifier(e) && e.text === 'undefined')) return `jsBox(${this.expr(e)})`;
      return this.expr(e);
    }
    if (source === 'Any?' && target !== 'Unit') {
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e, target);
      if (e.kind === ts.SyntaxKind.NullKeyword) return 'null';
      return this.fromAny(this.expr(e), target);
    }
    if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && isFunctionType(target.replace(/^\((.*)\)\?$/, '$1'))) return this.closure(e, target.replace(/^\((.*)\)\?$/, '$1'));
    if (isFunctionType(source) && isFunctionType(target.replace(/^\((.*)\)\?$/, '$1')) && / -> Unit$/.test(target.replace(/^\((.*)\)\?$/, '$1')) && !/ -> Unit$/.test(source)) {
      // A function value whose result a void slot ignores.
      const params = functionTypeParts(source)!.params;
      const names = params.map((_, k) => `__a${k}`);
      return `{ ${params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${this.functionValue(e)}(${names.join(', ')}); Unit }`;
    }
    if (target === 'Boolean' && source !== 'Boolean' && source !== 'Nothing') return `jsTruthy(${this.expr(e)})`;
    return this.functionValue(e);
  }

  /** An expression as a value: a declared function named by a reference. */
  private functionValue(e: ts.Expression): string {
    if (ts.isIdentifier(e)) {
      const decl = this.resolve(e)?.valueDeclaration;
      if (decl && ts.isFunctionDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) return `::${ident(e.text)}`;
    }
    return this.expr(e);
  }

  /** A condition: Kotlin needs a Boolean where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsTruthy(${maybe})`;
    return this.isBool(e) ? this.expr(e) : `jsTruthy(${this.expr(e)})`;
  }

  // ---- Expressions -----------------------------------------------------------------------------

  expr(e: ts.Expression): string {
    const s = this.subst.get(e);
    if (s) return s;
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    if (ts.isNumericLiteral(e)) return numberLiteral(e.text);
    if (ts.isBigIntLiteral(e)) return `JSBigInt.literal(${kotlinString(e.text.replace(/n$/, ''))})`;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return kotlinString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (e.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (e.kind === ts.SyntaxKind.NullKeyword) return this.typeOf(e) === 'Any?' && !this.optionalContext(e) ? 'jsNull' : 'null';
    if (e.kind === ts.SyntaxKind.ThisKeyword) return 'this';
    if (e.kind === ts.SyntaxKind.SuperKeyword) return 'super';
    if (ts.isIdentifier(e)) return this.identifier(e);
    if (ts.isTemplateExpression(e)) {
      let out = escapeText(e.head.text);
      for (const span of e.templateSpans) out += `\${${this.str(span.expression)}}` + escapeText(span.literal.text);
      return `"${out}"`;
    }
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) {
      const from = this.typeOf(e.expression);
      const to = this.typeOf(e);
      if (from === 'Any?' && to !== 'Any?') return this.fromAny(this.expr(e.expression), to);
      if (from !== to && from.replace(/\?$/, '') !== to.replace(/\?$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) return `(${this.expr(e.expression)} as ${to})`;
      if (from.endsWith('?') && !to.endsWith('?') && from.replace(/\?$/, '') === to) return `${this.expr(e.expression)}!!`;
      return this.expr(e.expression);
    }
    if (ts.isNonNullExpression(e)) {
      const maybe = this.maybeUndefined(e.expression);
      if (maybe) return `${maybe}!!`;
      const inner = this.expr(e.expression);
      return this.typeOf(e.expression).endsWith('?') || this.declaredTypeOf(e.expression)?.endsWith('?') ? `${inner}!!` : inner;
    }
    if (ts.isPropertyAccessExpression(e)) return this.property(e);
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isCallExpression(e)) return this.call(e);
    if (ts.isNewExpression(e)) return this.newExpr(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) {
      const target = this.lvalue(e.operand);
      return `${target}.also { ${target} = it ${e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} ${this.one(e.operand)} }`;
    }
    if (ts.isConditionalExpression(e)) {
      const t = this.typeOf(e);
      return `(if (${this.cond(e.condition)}) ${this.coerce(e.whenTrue, t)} else ${this.coerce(e.whenFalse, t)})`;
    }
    if (ts.isArrayLiteralExpression(e)) return this.array(e);
    if (ts.isObjectLiteralExpression(e)) return this.object(e);
    if (ts.isTaggedTemplateExpression(e)) return this.taggedTemplate(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e);
    if (ts.isTypeOfExpression(e)) return this.typeofExpr(e);
    if (ts.isAwaitExpression(e)) throw this.error(e, 'await outside a statement of an async function');
    if (ts.isDeleteExpression(e)) {
      const target = e.expression;
      if (ts.isElementAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${this.str(target.argumentExpression)})`;
      if (ts.isElementAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${this.propertyKey(target.argumentExpression)})`;
      if (ts.isPropertyAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${kotlinString(target.name.text)})`;
      if (ts.isPropertyAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${kotlinString(target.name.text)})`;
      if (ts.isPropertyAccessExpression(target) && this.typeOf(target.expression) === 'JSObject') return `${this.expr(target.expression)}.delete(${kotlinString(target.name.text)})`;
      throw this.error(e, 'delete of this member');
    }
    if (ts.isVoidExpression(e)) return `run { ${this.exprStatement(e.expression)}; null }`;
    if (ts.isRegularExpressionLiteral(e)) {
      const text = e.text;
      const end = text.lastIndexOf('/');
      return `jsRegExpLiteral(${kotlinString(text.slice(1, end))}, ${kotlinString(text.slice(end + 1))})`;
    }
    throw this.error(e, 'expression');
  }

  /** ``tag`a${x}b` ``: the tag called with the site's strings (cooked, and raw as `strings.raw`), then the values. */
  private taggedTemplate(e: ts.TaggedTemplateExpression): string {
    const { cooked, raw, values } = templateParts(e.template);
    if (isStringRaw(e.tag, this.checker)) return `(${raw.map((r, k) => kotlinString(r) + (k < values.length ? ` + ${this.str(values[k])}` : '')).join(' + ')})`;
    const site = `__template${this.templateObjects.length}`;
    this.templateObjects.push(`val ${site} = jsTemplateObject(listOf(${cooked.map(kotlinString).join(', ')}), listOf(${raw.map(kotlinString).join(', ')}))`);
    const params = this.checker.getResolvedSignature(e)?.getParameters() ?? [];
    const restAt = params.findIndex((p) => p.valueDeclaration && ts.isParameter(p.valueDeclaration) && !!p.valueDeclaration.dotDotDotToken);
    const restType = () => this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name);
    const args = [site];
    for (let k = 0; k < values.length; k++) {
      if (restAt >= 0 && k + 1 >= restAt) { args.push(this.packed(values.slice(k), restType())); break; }
      const p = params[k + 1];
      args.push(p ? this.coerce(values[k], this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e)) : this.expr(values[k]));
    }
    if (restAt > values.length) args.push(`${restType()}()`);
    return `${this.expr(e.tag)}(${args.join(', ')})`;
  }

  /** An operand of `+` beside a string: an object converts with the default hint. */
  private concatOperand(e: ts.Expression): string {
    return this.isObjectRef(e) && !this.maybeUndefined(e) && this.typeOf(e) !== 'JSSymbol' ? `jsToStringDefault(${this.expr(e)})` : this.str(e);
  }

  /** A property key: a symbol's own key, anything else as a string. */
  private propertyKey(e: ts.Expression): string {
    return this.typeOf(e) === 'JSSymbol' ? `${this.expr(e)}.key` : this.str(e);
  }

  private optionalContext(e: ts.Expression): boolean {
    const ctx = this.checker.getContextualType(e);
    return !!ctx && !(ctx.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) && this.type(ctx, e) !== 'Any?';
  }

  private identifier(e: ts.Identifier): string {
    const name = e.text;
    if (name === 'undefined') return 'null';
    if (name === 'NaN') return 'Double.NaN';
    if (name === 'Infinity') return 'Double.POSITIVE_INFINITY';
    const native = this.native?.identifier(e);
    if (native) return native;
    return this.narrowed(e, this.globalAlias(e) ?? ident(name));
  }

  private globalAlias(e: ts.Identifier): string | null {
    const decl = this.resolve(e)?.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl) || decl.getSourceFile().isDeclarationFile) return null;
    const statement = decl.parent.parent;
    if (!ts.isVariableStatement(statement) || !ts.isSourceFile(statement.parent)) return null;
    const cls = ts.findAncestor(e, ts.isClassLike);
    if (!cls || !cls.members.some((m) => m.name && !ts.isComputedPropertyName(m.name) && m.name.getText() === e.text)) return null;
    const alias = `__global_${e.text}`;
    if (!this.globalAliases.has(alias)) {
      const t = this.typeOf(decl.name);
      const constant = (decl.parent.flags & ts.NodeFlags.Const) !== 0;
      this.globalAliases.set(alias, constant ? `val ${alias}: ${t} get() = ${ident(e.text)}` : `var ${alias}: ${t}\n    get() = ${ident(e.text)}\n    set(value) { ${ident(e.text)} = value }`);
    }
    return alias;
  }

  /** A read the checker has narrowed (`if (x) x.length`, `if (e instanceof Error) e.message`): Kotlin needs the unwrap or cast. */
  private narrowed(e: ts.Expression, code: string): string {
    if (isWriteTarget(e)) return code;
    const sym = ts.isIdentifier(e) ? this.resolve(e) : undefined;
    if (sym && this.undefinedVars.has(sym)) {
      const actual = this.typeOf(e);
      return actual.endsWith('?') ? code : this.undefinedAs(code, actual);
    }
    const declared = this.declaredTypeOf(e);
    if (!declared) return code;
    const actual = this.typeOf(e);
    if (declared === actual || actual === 'Any?') return code;
    if (declared === optionalType(actual)) return `${code}!!`;
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && (this.isObjectRef(e) || ['Double', 'String', 'Boolean'].includes(actual))) return `(${code} as ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isParenthesizedExpression(e)) return this.lvalue(e.expression);
    if (ts.isPropertyAccessExpression(e) && this.isSelf(e.expression) && this.props.has(e.name.text)) return `this.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e)) {
      const core = this.core?.lvalue(e);
      if (core) return core;
      const target = this.typeOf(e.expression).endsWith('?') ? `${this.expr(e.expression)}!!` : this.expr(e.expression);
      return `${target}.${ident(e.name.text)}`;
    }
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return this.globalAlias(e) ?? ident(e.text);
    return this.expr(e);
  }

  /** A value as JavaScript converts it to a string (`String(x)`, `${x}`, `'' + x`). */
  str(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsToString(${maybe})`;
    const t = this.typeOf(e);
    if (t === 'String') return this.expr(e);
    if (t === 'Double' || t === 'Boolean') return `js(${this.expr(e)})`;
    return `jsToString(${this.expr(e)})`;
  }

  private property(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    if (this.isSelf(target) && this.props.has(name)) return `this.${ident(name)}.value`;
    if (name === 'raw' && this.symbolName(target) === 'TemplateStringsArray') return `jsTemplateRaw(${this.expr(target)})`;
    if (name === 'description' && this.typeOf(target) === 'JSSymbol') return `${this.expr(target)}.jsDescription`;
    if (ts.isIdentifier(target) && this.isLibGlobal(target)) {
      const constant = LIB_CONSTANTS[`${target.text}.${name}`];
      if (constant) return constant;
      throw this.error(e, `${target.text}.${name}`);
    }
    const enumMember = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const constant = enumMember && ts.isEnumMember(enumMember) ? this.checker.getConstantValue(enumMember) : undefined;
    if (constant !== undefined && enumMember!.getSourceFile().isDeclarationFile && !this.native?.isNativeDeclaration(enumMember!)) {
      return typeof constant === 'string' ? kotlinString(constant) : numberLiteral(String(constant));
    }
    const maybeChain = e.questionDotToken ? this.maybeUndefined(e) : null;
    if (maybeChain) return this.undefinedAs(maybeChain, this.typeOf(e));
    const core = this.core?.property(e);
    if (core) return core;
    const native = this.native?.property(e);
    if (native) return native;
    const base = this.typeOf(target);
    // Inside an optional chain (`a?.b.c`) an undefined link ends the chain.
    const inChain = !!(e.flags & ts.NodeFlags.OptionalChain) && base.endsWith('?');
    const dot = e.questionDotToken || inChain ? '?.' : '.';
    const recv = () => this.receiver(target, name) ?? (base.endsWith('?') && !e.questionDotToken && !inChain ? `${this.expr(target)}!!` : this.expr(target));
    if (name === 'length' && this.isString(target)) {
      return e.questionDotToken ? `${this.expr(target)}?.length?.toDouble()` : `${recv()}.length.toDouble()`;
    }
    if (name === 'length' && (base.startsWith('Pair<') || base.startsWith('Triple<'))) return base.startsWith('Pair<') ? '2.0' : '3.0';
    if (this.isAny(target)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, t);
    }
    if (base.replace(/\?$/, '').startsWith('JSRecord<')) {
      const read = base.endsWith('?') ? `${this.expr(target)}?.get(${kotlinString(name)})` : `${this.expr(target)}[${kotlinString(name)}]`;
      const t = this.typeOf(e);
      if (isWriteTarget(e) || t.endsWith('?')) return read;
      const z = this.zero(t);
      return z && z !== 'null' ? `(${read} ?: ${z})` : `${read}!!`;
    }
    if (base === 'EventData' && (name === 'value' || name === 'item')) {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.${name}` : this.fromAny(`${this.expr(target)}.${name}`, t);
    }
    // A method used as a value is a bound reference.
    const symbol = this.checker.getSymbolAtLocation(e.name);
    const called = ts.isCallExpression(e.parent) && e.parent.expression === e;
    if (symbol && symbol.flags & ts.SymbolFlags.Method && !called) return `${recv()}::${ident(name)}`;
    return this.narrowed(e, `${recv()}${dot}${ident(name)}`);
  }

  /** A receiver that can be missing though its type says not (`x!`, `items[i]`): JavaScript's TypeError when it is. */
  private receiver(target: ts.Expression, key: string): string | null {
    const kind = unsafeReceiver(target, this.checker);
    if (!kind) return null;
    let x = target;
    while (ts.isParenthesizedExpression(x)) x = x.expression;
    const value = ts.isNonNullExpression(x) ? (this.maybeUndefined(x.expression) ?? this.expr(x.expression)) : this.maybeUndefined(x);
    return value ? `jsUnwrap(${value}, ${kotlinString(key)}${kind === 'null' ? ', true' : ''})` : null;
  }

  private elementAccess(e: ts.ElementAccessExpression): string {
    const target = this.expr(e.expression);
    const key = e.argumentExpression;
    const t = this.typeOf(e.expression).replace(/\?$/, '');
    const q = e.questionDotToken ? '?' : '';
    if (t === 'String') return `jsCharAt(${target}, ${this.toNumber(key)})`;
    if (t.startsWith('JSArray<')) {
      if (isWriteTarget(e)) return `${target}${q}[${this.toNumber(key)}]`;
      return this.undefinedAs(this.maybeUndefined(e)!, this.typeOf(e));
    }
    if (t === 'JSMatch') {
      const read = `${target}${q}.get(${this.toNumber(key)})`;
      return this.typeOf(e).endsWith('?') ? read : this.undefinedAs(read, this.typeOf(e));
    }
    if ((t.startsWith('Pair<') || t.startsWith('Triple<')) && ts.isNumericLiteral(key)) return `${target}.${['first', 'second', 'third'][Number(key.text)]}`;
    if (t.startsWith('JSRecord<')) {
      if (isWriteTarget(e)) return `${target}[${this.str(key)}]`;
      const vt = this.typeOf(e);
      const z = this.zero(vt);
      const optional = q || (e.flags & ts.NodeFlags.OptionalChain && this.typeOf(e.expression).endsWith('?'));
      const read = optional ? `${target}?.get(${this.str(key)})` : `${target}[${this.str(key)}]`;
      return vt.endsWith('?') || optional ? read : z && z !== 'null' ? `(${read} ?: ${z})` : `${read}!!`;
    }
    if (this.typeOf(e.expression) === 'Any?') {
      const code = `jsGet(${target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, rt);
    }
    if (ts.isStringLiteral(key)) return `${target}${q}.${ident(key.text)}`;
    const keyed = ts.isIdentifier(key) && this.typeOf(key) === 'JSSymbol' ? this.checker.getTypeAtLocation(e.expression).getProperties().find((p) => {
      const n = p.valueDeclaration && (p.valueDeclaration as ts.NamedDeclaration).name;
      return !!n && ts.isComputedPropertyName(n) && this.resolve(n.expression) === this.resolve(key);
    }) : undefined;
    if (keyed) return `${target}${q}.__symbol_${(key as ts.Identifier).text}`;
    throw this.error(e, 'indexing this type');
  }

  /**
   * An expression that may be undefined though TypeScript types it as its element
   * (`xs[i]` past the end, or a variable holding one), as a Kotlin nullable; null otherwise.
   */
  private maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (this.subst.has(e)) return null;
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '').startsWith('JSArray<')) {
      const q = e.questionDotToken || this.typeOf(e.expression).endsWith('?') ? '?' : '';
      return `${this.expr(e.expression)}${q}.element(${this.toNumber(e.argumentExpression)})`;
    }
    if (ts.isIdentifier(e)) {
      const sym = this.resolve(e);
      if (sym && this.undefinedVars.has(sym)) return ident(e.text);
    }
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && !this.typeOf(e.expression).endsWith('?')) {
      const target = this.maybeUndefined(e.expression);
      if (target) return `${target}?.${ident(e.name.text)}`;
    }
    return null;
  }

  /** An undefined-or-value as the TypeScript type reads it: NaN, "undefined" and false are what undefined converts to. */
  private undefinedAs(code: string, type: string): string {
    if (type.endsWith('?') || type === 'Any?') return code;
    if (type === 'Double') return `(${code} ?: Double.NaN)`;
    if (type === 'String') return `(${code} ?: "undefined")`;
    if (type === 'Boolean') return `(${code} ?: false)`;
    return `${code}!!`;
  }

  args(e: ts.CallExpression | ts.NewExpression, count?: number): string[] {
    const all = e.arguments ?? ts.factory.createNodeArray();
    const list = count === undefined ? all : all.slice(0, count);
    const sig = this.checker.getResolvedSignature(e);
    const params = sig?.getParameters() ?? [];
    const out: string[] = [];
    const restAt = params.findIndex((p) => p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken);
    const appDeclared = !!sig?.getDeclaration() && !sig!.getDeclaration().getSourceFile().isDeclarationFile;
    for (let k = 0; k < list.length; k++) {
      const a = list[k];
      if (restAt >= 0 && k >= restAt && appDeclared) {
        const rest = this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name);
        out.push(this.packed(list.slice(k), rest));
        break;
      }
      if (ts.isSpreadElement(a)) throw this.error(a, 'a spread argument');
      const p = params[Math.min(k, params.length - 1)];
      const decl = p?.valueDeclaration;
      if (!p || (decl && ts.isParameter(decl) && decl.dotDotDotToken)) {
        const pt = decl && ts.isParameter(decl) ? this.typeOf(decl.name).replace(/^JSArray<(.*)>$/, '$1') : 'Any?';
        out.push(this.coerce(a, pt));
        continue;
      }
      let pt = this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e);
      if (decl && ts.isParameter(decl) && (decl.questionToken || decl.initializer) && appDeclared) pt = optionalType(pt);
      out.push(this.coerce(a, pt));
    }
    if (restAt >= 0 && appDeclared && list.length <= restAt) out.push(`${this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name)}()`);
    const decl = sig?.getDeclaration();
    if (count === undefined && decl && !ts.isJSDocSignature(decl) && !('body' in decl) && (ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl))) {
      for (let k = list.length; k < params.length; k++) {
        const pt = this.type(this.checker.getTypeOfSymbolAtLocation(params[k], e), e);
        out.push(pt === 'Unit' ? 'Unit' : 'null');
      }
    }
    return out;
  }

  /** Arguments (spreads included) as one `JSArray` of `arrayType`. */
  private packed(items: readonly ts.Expression[], arrayType: string): string {
    const el = arrayType.replace(/^JSArray<(.*)>$/, '$1');
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of items) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`listOf<${el}>(${run.join(', ')})`); run = []; }
        parts.push(`(${this.iterable(x.expression)}).toList()`);
      } else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`listOf<${el}>(${run.join(', ')})`);
    return parts.length ? `${arrayType}(${parts.join(' + ')})` : `${arrayType}()`;
  }

  private arity(e: ts.CallExpression): number | undefined {
    const sig = this.checker.getResolvedSignature(e);
    const decl = sig?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl)) return undefined;
    if (decl.parameters.some((p) => p.dotDotDotToken)) return undefined;
    return decl.parameters.length;
  }

  isLibGlobal(id: ts.Identifier): boolean {
    if (!LIB_GLOBALS.has(id.text)) return false;
    const decl = this.resolve(id)?.declarations?.[0];
    return !decl || decl.getSourceFile().isDeclarationFile;
  }

  resolve(n: ts.Node): ts.Symbol | undefined {
    const sym = this.checker.getSymbolAtLocation(n);
    return sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
  }

  private call(e: ts.CallExpression): string {
    const callee = e.expression;
    if (!e.arguments.length && ['WritableSignal', 'InputSignal', 'Signal'].includes(this.symbolName(callee))) {
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.computed.has(callee.name.text)) return `this.${ident(callee.name.text)}`;
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) return `this.${ident(callee.name.text)}.value`;
      return this.symbolName(callee) === 'Signal' ? this.expr(callee) : `${this.expr(callee)}.value`;
    }
    if (callee.kind === ts.SyntaxKind.SuperKeyword) throw this.error(e, 'super() outside the start of a constructor');
    if (e.questionDotToken) return `${this.expr(callee)}?.invoke(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) return this.core?.call(e) ?? this.globalCall(callee, e);
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    if (isObjectToStringCall(callee, this.checker)) return `jsObjectToString(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : 'null'})`;
    if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) {
      return `this.${ident(callee.name.text)}.value(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'then' && ts.isCallExpression(callee.expression)
        && ts.isIdentifier(callee.expression.expression) && callee.expression.expression.text === '$showModal') {
      return this.showModal(callee.expression, e.arguments[0]);
    }
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      const target = callee.expression;
      const owner = this.symbolName(target);
      const signalValue = () => this.typeOf(target).replace(/^Signal<(.*)>$/, '$1');
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'set') return `${this.expr(target)}.value = ${this.signalWrite(target, e.arguments[0], signalValue())}`;
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'update') return `${this.expr(target)}.update(${this.closure(e.arguments[0] as ts.ArrowFunction)})`;
      if (owner === 'WritableSignal' && method === '$write') {
        const a = e.arguments[0];
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return `${this.expr(target)}.update(${this.closure(a)})`;
        return `${this.expr(target)}.value = ${this.coerce(a, signalValue())}`;
      }
      if (owner === 'OutputEmitterRef' && method === 'emit') return `${this.expr(target)}.emit(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      const core = this.core?.call(e) ?? this.native?.call(e);
      if (core) return core;
      if (this.isAny(target)) return `jsCallMethod(${this.expr(target)}, ${kotlinString(method)}${e.arguments.map((a) => `, ${this.coerce(a, 'Any?')}`).join('')})`;
      const t = this.typeOf(target).replace(/\?$/, '');
      const q = callee.questionDotToken || (callee.flags & ts.NodeFlags.OptionalChain && this.typeOf(target).endsWith('?')) ? '?' : this.typeOf(target).endsWith('?') ? '!!' : '';
      if (method === 'fill' && ts.isNewExpression(target) && ts.isIdentifier(target.expression) && target.expression.text === 'Array' && target.arguments?.length === 1 && e.arguments.length === 1) {
        return `jsArrayFilled<${t.replace(/^JSArray<(.*)>$/, '$1')}>(${this.toNumber(target.arguments[0])}, ${this.coerce(e.arguments[0], t.replace(/^JSArray<(.*)>$/, '$1'))})`;
      }
      if (t.startsWith('JSArray<')) return this.arrayMethod(method, target, e, q);
      if (t === 'JSMatch' && method !== 'toString') {
        const chain = q === '?' || (q === '' && this.typeOf(target).endsWith('?'));
        this.subst.set(target, `${this.expr(target)}${q === '!!' ? '!!' : chain ? '?' : ''}.values`);
        try { return this.arrayMethod(method, target, e, chain ? '?' : ''); } finally { this.subst.delete(target); }
      }
      if (t.startsWith('Pair<') || t.startsWith('Triple<')) {
        const el = splitTopLevel(t.replace(/^(Pair|Triple)<(.*)>$/, '$2'));
        const element = el.every((x) => x === el[0]) ? el[0] : 'Any?';
        this.subst.set(target, `JSArray<${element}>(jsTupleList(${this.expr(target)}) as List<${element}>)`);
        try { return this.arrayMethod(method, target, e, ''); } finally { this.subst.delete(target); }
      }
      if (t === 'String') return this.stringMethod(method, target, e);
      if (t === 'Double') return this.numberMethod(method, target, e);
      if (t === 'JSBigInt' && method === 'toLocaleString') return `jsBigIntToLocaleString(${[this.expr(target), ...e.arguments.map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
      if (t.startsWith('JSPromise<')) return this.promiseMethod(method, target, e);
      if (t.startsWith('JSMap<') || t.startsWith('JSSet<')) return this.collectionMethod(method, target, e, q);
      if (t === 'JSDate' && method === 'toISOString') return `${this.expr(target)}${q}.toISOString()`;
      if (/^JS(Iterator|Generator)</.test(t) && ['next', 'return', 'throw'].includes(method)) {
        return `${this.expr(target)}${q}.js${method[0].toUpperCase()}${method.slice(1)}Result(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : method === 'throw' ? 'null' : ''})`;
      }
      if (/^JS(AsyncIterator|AsyncGenerator)</.test(t) && ['next', 'return', 'throw'].includes(method)) {
        return `${this.expr(target)}${q}.${ident(method)}(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : method === 'throw' ? 'null' : ''})`;
      }
      const checked = !callee.questionDotToken ? this.receiver(target, method) : null;
      return `${checked ?? `${this.expr(target)}${q === '!!' ? '!!' : q ? '?' : ''}`}.${ident(method)}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isElementAccessExpression(callee) && isSymbolIterator(callee.argumentExpression, this.checker) && !e.arguments.length) return this.iteratorCode(callee.expression);
    let fn: ts.Expression = callee;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    // `(function () { … })()`: the function, called.
    if (ts.isFunctionExpression(fn) || ts.isArrowFunction(fn)) return `(${this.closure(fn)})(${this.args(e).join(', ')})`;
    if (ts.isParenthesizedExpression(callee)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    throw this.error(e, 'call');
  }

  private signalWrite(target: ts.Expression, value: ts.Expression, t: string): string {
    const code = this.coerce(value, t);
    return this.symbolName(target) === 'VueRef' && this.isObjectRef(value) ? `jsReactive(${code})` : code;
  }

  /** `Signal(x)`: a write of an equal value is no change. Objects compare by identity (Object.is) except in Svelte, where a write of an object always notifies. */
  private newSignal(t: string, value: string, kind: 'vue' | 'svelte' | 'identity'): string {
    const reference = !['Double', 'String', 'Boolean'].includes(t.replace(/\?$/, '')) && !isFunctionType(t);
    if (kind === 'vue') return `Signal<${t}>(${reference ? `jsReactive(${value})` : value}${reference ? ', ::jsSame' : ''})`;
    if (kind === 'svelte' && reference) return `Signal<${t}>(${value}) { _, _ -> false }`;
    if (!reference) return `Signal<${t}>(${value})`;
    return `Signal<${t}>(${value}, ::jsSame)`;
  }

  private globalCall(callee: ts.Identifier, e: ts.CallExpression): string {
    const native = this.native?.call(e);
    if (native) return native;
    const name = callee.text;
    const arg = (k: number) => e.arguments[k];
    const decl = this.resolve(callee)?.declarations?.[0];
    const lib = !decl || decl.getSourceFile().isDeclarationFile;
    if (name === 'get' && e.arguments.length === 1 && this.symbolName(arg(0)) === 'Writable') return `${this.expr(arg(0))}.value`;
    if (name === 'navigate' && arg(0) && ts.isObjectLiteralExpression(arg(0))) return this.navigate(e);
    if (['$signal', 'ref', '$ref', 'signal', 'writable', '$writable'].includes(name) && lib) {
      const t = this.typeOf(e).replace(/^Signal<(.*)>$/, '$1');
      const kind = name === 'ref' || name === '$ref' ? 'vue' : name === '$signal' || name === 'writable' ? 'svelte' : 'identity';
      return this.newSignal(t, arg(0) ? this.coerce(arg(0), t) : 'null', kind);
    }
    if (name === '$state' && lib) return `stateSignal(${this.expr(arg(0))})`;
    if ((name === 'nextTick' || name === 'tick') && !e.arguments.length && lib) return `Reactivity.${name}()`;
    if (name === 'output' && lib) return `${this.typeOf(e)}()`;
    if (name === 'inject' && lib) {
      const token = (arg(0) as ts.Identifier).text;
      if (token === 'RouterExtensions') return 'Router.shared';
      if (token === 'ActivatedRoute') return 'ActivatedRoute.current';
      return `${token}.shared`;
    }
    if (name === '$navigateTo' && lib) return this.navigate(e);
    if (name === '$showModal' && lib) return this.showModal(e);
    if (name === '$closeModal' && lib) return `Modal.close(${arg(0) ? this.coerce(arg(0), 'Any?') : ''})`;
    if (lib) {
      switch (name) {
        case 'String': return arg(0) ? this.str(arg(0)) : '""';
        case 'Number': return arg(0) ? this.toNumber(arg(0)) : '0.0';
        case 'Boolean': return arg(0) ? this.cond(arg(0)) : 'false';
        case 'parseInt': return `jsParseInt(${this.str(arg(0))}${arg(1) ? `, ${this.toNumber(arg(1))}` : ''})`;
        case 'parseFloat': return `jsParseFloat(${this.str(arg(0))})`;
        case 'isNaN': return `${this.toNumber(arg(0))}.isNaN()`;
        case 'isFinite': return `jsIsFinite(${this.toNumber(arg(0))})`;
        case 'setTimeout': case 'setInterval':
          return `js${name[0].toUpperCase()}${name.slice(1)}(${this.callback(arg(0))}, ${arg(1) ? this.toNumber(arg(1)) : '0.0'})`;
        case 'clearTimeout': case 'clearInterval': return `js${name[0].toUpperCase()}${name.slice(1)}(${arg(0) ? this.coerce(arg(0), 'Double?') : 'null'})`;
        case 'queueMicrotask': return `jsQueueMicrotask(${this.callback(arg(0))})`;
        case 'Symbol': return `jsSymbol(${arg(0) ? this.str(arg(0)) : 'null'})`;
        case 'BigInt': return `JSBigInt.convert(${this.coerce(arg(0), 'Any?')})`;
      }
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve(${resolvers.type === 'Unit' ? 'Unit' : 'null'})`;
      if (this.isPromiseType(this.typeOf(arg(0)))) return `${resolvers.name}.resolvePromise(${this.expr(arg(0))})`;
      return `${resolvers.name}.resolve(${this.coerce(arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body);
    // A function held untyped (one of several function types): called as script calls it.
    if (this.typeOf(callee) === 'Any?') return `jsCall(${[this.expr(callee), ...e.arguments.map((a) => this.coerce(a, 'Any?'))].join(', ')})`;
    const fnType = this.declaredTypeOf(callee) ?? this.typeOf(callee);
    const qualified = this.appModule && shadowedByMember(e, this.resolve(callee)?.declarations?.[0], ident(name), ident) ? `${this.appModule}.${ident(name)}` : ident(name);
    const fn = this.narrowed(callee, qualified);
    const nullable = /^\(.*\)\?$/.test(fnType) && isFunctionType(fnType.slice(1, -2));
    return `${nullable && !fn.endsWith('!!') ? `${fn}!!` : fn}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
  }

  private symbolName(e: ts.Expression): string {
    const t = this.checker.getTypeAtLocation(e);
    return (t.aliasSymbol ?? t.getSymbol())?.getName() ?? '';
  }

  private navigate(e: ts.CallExpression): string {
    const first = e.arguments[0];
    const svelte = ts.isObjectLiteralExpression(first);
    const pageProp = svelte ? first.properties.find((p) => p.name && (p.name as ts.Identifier).text === 'page') : undefined;
    const component = svelte ? ((pageProp as ts.PropertyAssignment).initializer as ts.Identifier).text : (first as ts.Identifier).text;
    const info = this.components.get(component);
    if (!info) throw this.error(e, `navigation to ${component}: not a component`);
    const options = svelte ? first : e.arguments[1];
    const given = new Map<string, string>();
    if (options && ts.isObjectLiteralExpression(options)) {
      const props = options.properties.find((p) => p.name && (p.name as ts.Identifier).text === 'props');
      if (props && ts.isPropertyAssignment(props) && ts.isObjectLiteralExpression(props.initializer)) {
        for (const p of props.initializer.properties) {
          if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, ident(p.name.text));
          else if (ts.isPropertyAssignment(p)) given.set((p.name as ts.Identifier).text, this.expr(p.initializer));
        }
      }
    }
    const args = info.props.map((p) => `${ident(p)} = ${given.get(p) ?? 'null'}`).join(', ');
    return `Frame.topmost()?.navigate { ${component}(${args}).render() }`;
  }

  toNumber(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'JSBigInt') return `${this.expr(e)}.toDouble()`;
    if (t === 'Double') return this.expr(e);
    if (t === 'JSDate') return `${this.expr(e)}.valueOf()`;
    if (t === 'String') return `jsNumberFromString(${this.expr(e)})`;
    if (t === 'Boolean') return `(if (${this.expr(e)}) 1.0 else 0.0)`;
    const native = this.native?.toNumber(e, t);
    if (native) return native;
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsToNumber(${maybe})`;
    return `jsToNumber(${this.expr(e)})`;
  }

  private staticCall(owner: string, method: string, e: ts.CallExpression): string {
    const a = () => this.args(e);
    const arg = (k: number) => e.arguments[k];
    const T = () => this.typeOf(e);
    switch (owner) {
      case 'Math': return this.math(method, e);
      case 'console': {
        const fn = ['warn', 'error'].includes(method) ? 'jsError' : 'jsLog';
        return `${fn}(${e.arguments.map((x) => this.coerce(x, 'Any?')).join(', ')})`;
      }
      case 'JSON':
        if (method === 'parse') return `jsJSONParse(${this.expr(arg(0))})`;
        if (method === 'stringify') return `jsJSONStringify(${this.coerce(arg(0), 'Any?')}${arg(2) ? `, ${this.coerce(arg(2), 'Any?')}` : ''})${T().endsWith('?') ? '' : '!!'}`;
        break;
      case 'Object': {
        const record = this.typeOf(arg(0)).startsWith('JSRecord<');
        if (record && ['keys', 'values', 'entries'].includes(method)) return `${this.expr(arg(0))}.${method}`;
        if (method === 'keys') return `jsObjectKeys(${this.expr(arg(0))})`;
        if (method === 'values' || method === 'entries') {
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const value = method === 'values' ? el : el.replace(/^Pair<String, (.*)>$/, '$1');
          const read = this.fromAnyCode('jsField(__o, it)', value);
          return `run { val __o: Any? = ${this.expr(arg(0))}; ${T()}(jsKeysOf(__o).map { ${method === 'values' ? read : `Pair(it, ${read})`} }) }`;
        }
        if (method === 'freeze') return `jsFreeze(${this.expr(arg(0))})`;
        if (method === 'seal' || method === 'preventExtensions') return `jsRestrict(${this.expr(arg(0))}, ${method === 'seal'})`;
        const untyped: Record<string, string> = { isFrozen: 'jsIsFrozen', isSealed: 'jsIsSealed', isExtensible: 'jsIsExtensible', getOwnPropertySymbols: 'jsOwnPropertySymbols', getOwnPropertyNames: 'jsOwnPropertyNames' };
        if (untyped[method]) return `${untyped[method]}(${this.coerce(arg(0), 'Any?')})`;
        if (method === 'getOwnPropertyDescriptor') return `jsOwnPropertyDescriptor(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))})`;
        if (method === 'fromEntries') return `jsObjectFromEntries(${this.iterable(arg(0))})`;
        if (method === 'defineProperty') {
          const d = arg(2);
          const code = `jsDefineProperty(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'assign') {
          // The target is an open JavaScript object: a literal there is untyped, so the sources' keys all land.
          if (!ts.isObjectLiteralExpression(arg(0))) return `jsObjectAssign(${e.arguments.map((x) => this.expr(x)).join(', ')})`;
          const code = `jsObjectAssign(${[this.dynamicObject(arg(0) as ts.ObjectLiteralExpression), ...e.arguments.slice(1).map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
          return T() === 'Any?' ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'is') return `jsSameValue(${this.coerce(arg(0), 'Any?')}, ${this.coerce(arg(1), 'Any?')})`;
        break;
      }
      case 'Array':
        if (method === 'isArray') return `JSArray.isArray(${this.coerce(arg(0), 'Any?')})`;
        if (method === 'from' && e.arguments.length === 1) return `JSArray(${this.iterable(arg(0))}.toList())`;
        if (method === 'from' && e.arguments.length === 2 && ts.isObjectLiteralExpression(arg(0))) {
          const length = (arg(0) as ts.ObjectLiteralExpression).properties.find((p) => p.name?.getText() === 'length');
          const fn = arg(1);
          if (!length || !ts.isPropertyAssignment(length) || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) throw this.error(e, 'Array.from of this object');
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const index = fn.parameters[1] ? ident((fn.parameters[1].name as ts.Identifier).text) : '__i';
          const value = fn.parameters[0] && ts.isIdentifier(fn.parameters[0].name) && fn.parameters[0].name.text !== '_' ? `val ${ident(fn.parameters[0].name.text)}: Any? = null; ` : '';
          const body = ts.isBlock(fn.body) ? this.functionBody(fn, el, this.indent) : `{ return ${this.coerce(fn.body, el)} }`;
          return `JSArray.fromLength<${el}>(${this.toNumber(length.initializer)}, fun(${index}: Double): ${el} { ${value}${body.slice(1, -1)} })`;
        }
        if (method === 'from' && e.arguments.length === 2) return `JSArray(${this.iterable(arg(0))}.toList()).map(${this.fn(arg(1))})`;
        if (method === 'of') return `jsArrayOf<${T().replace(/^JSArray<(.*)>$/, '$1')}>(${a().join(', ')})`;
        break;
      case 'Number':
        if (method === 'isInteger') return `jsIsInteger(${this.toNumber(arg(0))})`;
        if (method === 'isSafeInteger') return `jsIsSafeInteger(${this.toNumber(arg(0))})`;
        if (method === 'isFinite') return `jsIsFinite(${this.toNumber(arg(0))})`;
        if (method === 'isNaN') return `${this.toNumber(arg(0))}.isNaN()`;
        if (method === 'parseFloat') return `jsParseFloat(${this.expr(arg(0))})`;
        if (method === 'parseInt') return `jsParseInt(${this.expr(arg(0))}${arg(1) ? `, ${this.toNumber(arg(1))}` : ''})`;
        break;
      case 'String':
        if (method === 'fromCharCode') return `jsFromCharCode(${a().join(', ')})`;
        break;
      case 'BigInt':
        if (method === 'asIntN' || method === 'asUintN') return `JSBigInt.${method}(${this.toNumber(arg(0))}, ${this.expr(arg(1))})`;
        break;
      case 'Symbol':
        if (method === 'for') return `JSSymbol.\`for\`(${this.str(arg(0))})`;
        if (method === 'keyFor') return `JSSymbol.keyFor(${this.expr(arg(0))})`;
        break;
      case 'Date':
        if (method === 'now') return 'JSDate.now()';
        if (method === 'parse') return `JSDate.parse(${this.str(arg(0))})`;
        if (method === 'UTC') return `JSDate.UTC(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
        break;
      case 'Promise': {
        const t = T();
        const v = t.replace(/^JSPromise<(.*)>$/, '$1');
        if (method === 'resolve') return arg(0) ? (this.isPromiseType(this.typeOf(arg(0))) ? this.expr(arg(0)) : `JSPromise.resolve<${v}>(${this.coerce(arg(0), v)})`) : `JSPromise.resolve<Unit>(Unit)`;
        if (method === 'reject') return `JSPromise.reject<${v}>(${arg(0) ? this.coerce(arg(0), 'Any?') : 'null'})`;
        if (['all', 'allSettled', 'race', 'any'].includes(method)) {
          const src = arg(0);
          if (ts.isArrayLiteralExpression(src)) return this.promiseCombinator(method, src, t);
          const inner = this.typeOf(src).replace(/^JSArray<JSPromise<(.*)>>$/, '$1');
          if (inner === this.typeOf(src)) return `JSPromise.${method}Any(${this.expr(src)})`;
          return `JSPromise.${method}<${inner}>(${this.expr(src)})`;
        }
        break;
      }
    }
    throw this.error(e, `${owner}.${method}`);
  }

  private promiseCombinator(method: string, list: ts.ArrayLiteralExpression, result: string): string {
    if (list.elements.some(ts.isSpreadElement)) throw this.error(list, `Promise.${method} over a spread`);
    const values = list.elements.map((x) => this.typeOf(x).replace(/^JSPromise<(.*)>$/, '$1'));
    const promise = (x: ts.Expression, k: number) => (this.isPromiseType(this.typeOf(x)) ? this.expr(x) : `JSPromise.resolve<${values[k]}>(${this.coerce(x, values[k])})`);
    const same = values.every((v) => v === values[0]);
    const n = values.length;
    if (method === 'all') {
      if (n === 2 || n === 3) return `jsPromiseAll(${list.elements.map(promise).join(', ')})`;
      if (n === 1) return `JSPromise.all<${values[0]}>(listOf(${promise(list.elements[0], 0)}))`;
      if (same) return `JSPromise.all<${values[0]}>(listOf(${list.elements.map(promise).join(', ')}))`;
      return `JSPromise.allAny(listOf<Any?>(${list.elements.map((x) => this.expr(x)).join(', ')}))`;
    }
    if (method === 'allSettled') {
      if (n === 2 || n === 3) return `jsPromiseAllSettled(${list.elements.map((x) => this.expr(x)).join(', ')})`;
      return `JSPromise.allSettledAny(listOf<Any?>(${list.elements.map((x) => this.expr(x)).join(', ')}))`;
    }
    if (!same) return `JSPromise.${method}Any(listOf<Any?>(${list.elements.map((x) => this.expr(x)).join(', ')}))`;
    return `JSPromise.${method}<${values[0]}>(listOf(${list.elements.map(promise).join(', ')}))`;
  }

  private showModal(e: ts.CallExpression, then?: ts.Expression): string {
    const component = (e.arguments[0] as ts.Identifier).text;
    const info = this.components.get(component);
    if (!info) throw this.error(e, `a modal of ${component}: not a component`);
    const options = e.arguments[1];
    const given = new Map<string, string>();
    const settings: string[] = [];
    let callback = then;
    if (options && ts.isObjectLiteralExpression(options)) {
      for (const p of options.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = (p.name as ts.Identifier).text;
        if (key === 'props' && ts.isObjectLiteralExpression(p.initializer)) {
          for (const q of p.initializer.properties) {
            if (ts.isShorthandPropertyAssignment(q)) given.set(q.name.text, ident(q.name.text));
            else if (ts.isPropertyAssignment(q)) given.set((q.name as ts.Identifier).text, this.expr(q.initializer));
          }
        } else if (key === 'fullscreen' || key === 'animated' || key === 'cancelable') {
          settings.push(`${key} = ${this.expr(p.initializer)}`);
        } else if (key === 'closeCallback') {
          callback = p.initializer;
        }
      }
    }
    if (callback) {
      if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) throw this.error(callback, 'a modal close callback that is not a function literal');
      const closure = this.closure(callback);
      const first = callback.parameters[0];
      const t = first ? this.typeOf(first.name) : '';
      const undefinedValue: Record<string, string> = { String: '"undefined"', Double: 'Double.NaN', Boolean: 'false' };
      const cast = t in undefinedValue ? `((value as? ${t}) ?: ${undefinedValue[t]})` : `(value as ${t})`;
      const call = !first ? `{ _ -> (${closure})() }` : t === 'Any?' ? closure : t.endsWith('?') ? `{ value -> (${closure})(value as? ${t.slice(0, -1)}) }` : `{ value -> (${closure})${`(${cast})`} }`;
      settings.push(`closeCallback = ${call}`);
    }
    const args = info.props.map((p) => `${ident(p)} = ${given.get(p) ?? 'null'}`).join(', ');
    return `Modal.show(${settings.join(', ')}) { ${component}(${args}).render() }`;
  }

  private math(name: string, e: ts.CallExpression): string {
    if ((name === 'max' || name === 'min') && e.arguments.some(ts.isSpreadElement)) return `jsMath${name === 'max' ? 'Max' : 'Min'}Of(${this.packed(e.arguments, 'JSArray<Double>')})`;
    const a = e.arguments.map((x) => this.coerce(x, 'Double'));
    const one: Record<string, string> = {
      floor: 'Math.floor', ceil: 'Math.ceil', abs: 'Math.abs', sqrt: 'Math.sqrt', cbrt: 'Math.cbrt', trunc: 'jsTrunc',
      sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan',
      exp: 'Math.exp', log: 'Math.log', log2: 'jsLog2', log10: 'Math.log10', log1p: 'Math.log1p', expm1: 'Math.expm1',
      sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround',
    };
    if (one[name]) return `${one[name]}(${a[0]})`;
    switch (name) {
      case 'pow': return `jsPow(${a[0]}, ${a[1]})`;
      case 'atan2': return `Math.atan2(${a[0]}, ${a[1]})`;
      case 'hypot': return `jsHypot(${a.join(', ')})`;
      case 'min': return `jsMathMin(${a.join(', ')})`;
      case 'max': return `jsMathMax(${a.join(', ')})`;
      case 'random': return 'Math.random()';
    }
    throw this.error(e, `Math.${name}`);
  }

  /** A function argument for a library method: a closure literal typed for its slot, or a function value. */
  private fn(e: ts.Expression, slot?: string): string {
    return ts.isArrowFunction(e) || ts.isFunctionExpression(e) ? this.closure(e, slot) : this.functionValue(e);
  }

  private arrayMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const a = () => this.args(e);
    const el = this.typeOf(target).replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1').replace(/^(Pair|Triple)<.*>$/, 'Any?');
    const elOf = () => (this.subst.has(target) ? (/^JSArray<(.*)>\(/.exec(this.subst.get(target)!)?.[1] ?? el) : el);
    const element = elOf();
    switch (name) {
      case 'push': case 'unshift':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.${name}All(${this.packed(e.arguments, `JSArray<${element}>`)})`;
        return `${t}.${name}(${e.arguments.map((x) => this.coerce(x, element)).join(', ')})`;
      case 'pop': case 'shift': case 'reverse': case 'keys': case 'entries': case 'values': return `${t}.${name}()`;
      case 'toString': return `${t}.join()`;
      case 'flat': return e.arguments.length || !/^JSArray<JSArray</.test(this.typeOf(target)) ? `${t}.flatAny(${e.arguments[0] ? this.toNumber(e.arguments[0]) : ''})` : `${t}.flat()`;
      case 'splice': {
        const parts = [...e.arguments.slice(0, 2).map((x) => this.toNumber(x)), ...e.arguments.slice(2).map((x) => this.coerce(x, element))];
        return `${t}.splice(${parts.join(', ')})`;
      }
      case 'fill': return `${t}.fill(${[this.coerce(e.arguments[0], element), ...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'slice': case 'at': return `${t}.${name}(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
      case 'indexOf': case 'lastIndexOf': case 'includes': return `${t}.${name}(${[this.coerce(e.arguments[0], element), ...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'join': return `${t}.join(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      case 'concat': return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.expr(x) : `jsArrayOf<${element}>(${this.coerce(x, element)})`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap': {
        if (e.arguments.length > 1) throw this.error(e, `${name} with a thisArg`);
        const f = e.arguments[0];
        const arity = ts.isArrowFunction(f) || ts.isFunctionExpression(f) ? Math.max(1, f.parameters.length) : this.functionArity(f);
        const ret = name === 'forEach' ? 'Unit' : ['map', 'flatMap'].includes(name) ? null : 'Boolean';
        const slot = ret ? `(${[element, 'Double', `JSArray<${element}>`].slice(0, Math.min(3, arity)).join(', ')}) -> ${ret}` : undefined;
        return `${t}.${name}(${this.fn(f, slot)})`;
      }
      case 'sort': return e.arguments[0] ? `${t}.sort(${this.fn(e.arguments[0], `(${element}, ${element}) -> Double`)})` : `${t}.sort()`;
      case 'toSorted': return e.arguments[0] ? `${t}.toSorted(${this.fn(e.arguments[0], `(${element}, ${element}) -> Double`)})` : `${t}.toSorted()`;
      case 'toReversed': return `${t}.toReversed()`;
      case 'reduce': case 'reduceRight': {
        const init = e.arguments[1];
        const f = e.arguments[0];
        if (init) {
          const acc = this.typeOf(e);
          const arity = ts.isArrowFunction(f) || ts.isFunctionExpression(f) ? f.parameters.length : 2;
          return `${t}.${name}(${this.fn(f, `(${[acc, element, 'Double'].slice(0, Math.max(2, Math.min(3, arity))).join(', ')}) -> ${acc}`)}, ${this.coerce(init, acc)})`;
        }
        return `${t}.${name}(${this.fn(f, `(${element}, ${element}) -> ${element}`)})`;
      }
    }
    throw this.error(e, `Array.${name}`);
  }

  private functionArity(e: ts.Expression): number {
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    return Math.max(1, sig?.getParameters().length ?? 1);
  }

  private stringMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const first = e.arguments[0];
    if (first && this.typeOf(first) === 'JSRegExp') return this.regexpStringMethod(name, t, e);
    const s = (k: number) => this.str(e.arguments[k]);
    const n = (k: number) => this.toNumber(e.arguments[k]);
    const opt = (k: number) => (e.arguments[k] ? `, ${n(k)}` : '');
    switch (name) {
      case 'toLowerCase': case 'toLocaleLowerCase': return `jsLowerCase(${t})`;
      case 'toUpperCase': case 'toLocaleUpperCase': return `jsUpperCase(${t})`;
      case 'includes': return `jsIncludes(${t}, ${s(0)}${opt(1)})`;
      case 'startsWith': return `jsStartsWith(${t}, ${s(0)}${opt(1)})`;
      case 'endsWith': return `jsEndsWith(${t}, ${s(0)}${opt(1)})`;
      case 'trim': return `jsTrim(${t})`;
      case 'trimStart': return `jsTrimStart(${t})`;
      case 'trimEnd': return `jsTrimEnd(${t})`;
      case 'split': return `jsSplit(${t}, ${first ? s(0) : 'null'}${opt(1)})`;
      case 'indexOf': return `jsIndexOf(${t}, ${s(0)}${opt(1)})`;
      case 'lastIndexOf': return `jsLastIndexOf(${t}, ${s(0)})`;
      case 'slice': return `jsSlice(${t}${e.arguments.map((_, k) => `, ${n(k)}`).join('')})`;
      case 'substring': return `jsSubstring(${t}, ${first ? n(0) : '0.0'}${opt(1)})`;
      case 'replace': return `jsReplace(${t}, ${s(0)}, ${s(1)})`;
      case 'replaceAll': return `jsReplaceAll(${t}, ${s(0)}, ${s(1)})`;
      case 'charAt': return `jsCharAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'charCodeAt': return `jsCharCodeAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'codePointAt': return `jsCodePointAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'at': return `jsStringAt(${t}, ${n(0)})`;
      case 'repeat': return `jsRepeat(${t}, ${n(0)})`;
      case 'padStart': return `jsPadStart(${t}, ${n(0)}${e.arguments[1] ? `, ${s(1)}` : ''})`;
      case 'padEnd': return `jsPadEnd(${t}, ${n(0)}${e.arguments[1] ? `, ${s(1)}` : ''})`;
      case 'concat': return `(${[t, ...e.arguments.map((x) => this.str(x))].join(' + ')})`;
      case 'localeCompare': return `jsLocaleCompare(${t}, ${s(0)})`;
      case 'toString': case 'valueOf': return t;
    }
    throw this.error(e, `String.${name}`);
  }

  private regexpStringMethod(name: string, s: string, e: ts.CallExpression): string {
    const [re, second] = e.arguments;
    const r = this.expr(re);
    switch (name) {
      case 'match': return `jsMatch(${s}, ${r})`;
      case 'matchAll': return `jsMatchAll(${s}, ${r})`;
      case 'search': return `jsSearch(${s}, ${r})`;
      case 'split': return `jsSplit(${s}, ${r}${second ? `, ${this.toNumber(second)}` : ''})`;
      case 'replace': case 'replaceAll': {
        const fn = name === 'replace' ? 'jsReplace' : 'jsReplaceAll';
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second))) return `${fn}(${s}, ${r}, ${this.str(second)})`;
        if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
        // The replacer gets the match, then each group, then the offset.
        const m = this.fresh('__match');
        const binds = second.parameters.map((p, k) => `val ${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)} = ${this.typeOf(p.name) === 'Double' ? `${m}.index` : this.typeOf(p.name).endsWith('?') ? `${m}[${k}]` : `(${m}[${k}] ?: "undefined")`}`);
        const body = this.inFunction('String', () => this.functionBody(second, 'String', this.indent));
        const inner = this.indent + '    ';
        return `${fn}(${s}, ${r}, fun(${m}: JSMatch): String {\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)})`;
      }
    }
    throw this.error(e, `String.${name} with a RegExp`);
  }

  private numberMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const a = e.arguments.map((x) => this.toNumber(x));
    switch (name) {
      case 'toFixed': return `jsToFixed(${t}${a[0] ? `, ${a[0]}` : ''})`;
      case 'toLocaleString': return `jsNumberToLocaleString(${[t, ...e.arguments.map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
      case 'toPrecision': return a[0] ? `jsToPrecision(${t}, ${a[0]})` : `js(${t})`;
      case 'toExponential': return `jsToExponential(${t}${a[0] ? `, ${a[0]}` : ''})`;
      case 'toString': return a[0] ? `jsNumberToString(${t}, ${a[0]})` : `js(${t})`;
      case 'valueOf': return t;
    }
    throw this.error(e, `Number.${name}`);
  }

  private returnsPromise(e: ts.Expression): boolean {
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    return !!sig && this.isPromiseType(this.type(sig.getReturnType(), e));
  }

  /** A rejection handler: it takes the reason untyped, whatever its parameter declares. */
  private rejectionHandler(e: ts.Expression, ret?: string): string {
    if (!(ts.isArrowFunction(e) || ts.isFunctionExpression(e))) return this.fn(e);
    if (!e.parameters.length) return this.closure(e, `(Any?) -> ${ret ?? this.returnTypeOf(e)}`);
    const p = e.parameters[0];
    const r = ret ?? this.returnTypeOf(e);
    if (this.typeOf(p.name) === 'Any?' && ts.isIdentifier(p.name)) return this.closure(e, `(Any?) -> ${r}`);
    const reason = this.fresh('__reason');
    const body = this.functionBody(e, r, this.indent);
    const bind = this.nested(() => this.bindTo(p.name, ts.isIdentifier(p.name) ? this.fromAny(reason, this.typeOf(p.name)) : reason, '', false));
    return `fun(${reason}: Any?)${r === 'Unit' ? '' : `: ${r}`} {\n${bind}${body.slice(1)}`;
  }

  private promiseMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const [f, g] = e.arguments;
    const value = this.typeOf(target).replace(/^JSPromise<(.*)>\??$/, '$1');
    const result = this.typeOf(e).replace(/^JSPromise<(.*)>$/, '$1');
    switch (name) {
      case 'then': {
        const adopt = (f && this.returnsPromise(f)) || (g && this.returnsPromise(g));
        const ret = adopt ? `JSPromise<${result}>` : result;
        const onF = f && this.fn(f, `(${value}) -> ${ret}`);
        return `${t}.${adopt ? 'thenAdopt' : 'then'}<${result}>(${[onF, g && this.rejectionHandler(g, ret)].filter(Boolean).join(', ')})`;
      }
      case 'catch': {
        const adopt = this.returnsPromise(f);
        if (result === value) return `${t}.${adopt ? 'catchAdopt' : 'catch'}(${this.rejectionHandler(f, adopt ? `JSPromise<${result}>` : result)})`;
        if (result === 'Any?' && !adopt) return `${t}.catchAny(${this.rejectionHandler(f, 'Any?')})`;
        const pass = `{ __value: ${value} -> ${adopt ? `JSPromise.resolve<${result}>(__value)` : '__value'} }`;
        return `${t}.${adopt ? 'thenAdopt' : 'then'}<${result}>(${pass}, ${this.rejectionHandler(f, adopt ? `JSPromise<${result}>` : result)})`;
      }
      case 'finally': return this.returnsPromise(f) ? `${t}.finallyAdopt(${this.fn(f)})` : `${t}.finally(${this.fn(f, '() -> Unit')})`;
      case 'cancel': return `${t}.cancel()`;
    }
    throw this.error(e, `Promise.${name}`);
  }

  private collectionMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const type = this.typeOf(target).replace(/\?$/, '');
    const [k, v] = (() => { const m = /^JSMap<(.*)>$/.exec(type); if (m) return splitTopLevel(m[1]); return [/^JSSet<(.*)>$/.exec(type)?.[1] ?? 'Any?', '']; })();
    const arg = (n: number, as: string) => this.coerce(e.arguments[n], as);
    switch (name) {
      case 'get': {
        const read = `${t}.get(${arg(0, k)})`;
        const rt = this.typeOf(e);
        return rt.endsWith('?') || rt === 'Any?' ? read : this.undefinedAs(read, rt);
      }
      case 'has': case 'delete': return `${t}.${name}(${arg(0, k)})`;
      case 'set': return `${t}.set(${arg(0, k)}, ${arg(1, v)})`;
      case 'add': return `${t}.add(${arg(0, k)})`;
      case 'clear': case 'keys': case 'values': case 'entries': return `${t}.${name}()`;
      case 'forEach': {
        const f = e.arguments[0];
        const types = v ? [v, k] : [k, k];
        return `${t}.forEach(${this.fn(f, `(${types.join(', ')}) -> Unit`)})`;
      }
    }
    throw this.error(e, `${type.startsWith('JSMap') ? 'Map' : 'Set'}.${name}`);
  }

  private newExpr(e: ts.NewExpression): string {
    const t = this.typeOf(e);
    const callee = e.expression;
    const name = ts.isIdentifier(callee) ? callee.text : '';
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (/^JS(Map|Set)</.test(t)) {
      if (!args.length) return `${t}()`;
      const src = args[0];
      if (ts.isArrayLiteralExpression(src) && t.startsWith('JSMap<')) {
        const [k, v] = splitTopLevel(/^JSMap<(.*)>$/.exec(t)![1]);
        return `${t}(listOf(${src.elements.map((x) => (ts.isArrayLiteralExpression(x) ? `Pair<${k}, ${v}>(${this.coerce(x.elements[0], k)}, ${this.coerce(x.elements[1], v)})` : this.expr(x))).join(', ')}))`;
      }
      return `${t}(${this.iterable(src)})`;
    }
    if (this.isPromiseType(t)) {
      const v = t.replace(/^JSPromise<(.*)>$/, '$1');
      const ex = args[0];
      if (!ex || !(ts.isArrowFunction(ex) || ts.isFunctionExpression(ex))) throw this.error(e, 'a Promise executor that is not a function literal');
      const r = this.fresh('__resolvers');
      const [res, rej] = ex.parameters.map((p) => p.name as ts.Identifier);
      const binds: string[] = [];
      if (res) { this.resolvers.set(this.resolve(res)!, { name: r, type: v }); binds.push(`val ${ident(res.text)}: (${v}) -> Unit = { ${r}.resolve(it) }`); }
      if (rej) binds.push(`val ${ident(rej.text)}: (Any?) -> Unit = { ${r}.reject(it) }`);
      const body = this.functionBody(ex, 'Unit', this.indent);
      const inner = this.indent + '    ';
      return `JSPromise<${v}>(fun(${r}: JSResolvers<${v}>) {\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)})`;
    }
    if (ERRORS[name]) {
      const appError = ts.isIdentifier(callee) && !this.isLibGlobal(callee);
      if (!appError) return `${ERRORS[name]}(${args.length ? this.str(args[0]) : ''})`;
    }
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    if (name === 'RegExp') return `JSRegExp(${this.str(args[0])}${args[1] ? `, ${this.str(args[1])}` : ''})`;
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${args.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    if (name === 'WeakRef' && this.isLibGlobal(callee as ts.Identifier)) return `${t}(${this.expr(args[0])})`;
    if ((name === 'WeakMap' || name === 'WeakSet') && this.isLibGlobal(callee as ts.Identifier)) return args.length ? `${t}(${this.iterable(args[0])})` : `${t}()`;
    if (name === 'Array') throw this.error(e, `new ${name}`);
    const core = this.core?.construct(e) ?? this.native?.construct(e);
    if (core) return core;
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t}(${this.args(e).join(', ')})`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'new');
  }

  private typeofExpr(e: ts.TypeOfExpression): string {
    if (neverDefined(e.expression, this.checker)) return '"undefined"';
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Unit') return '"undefined"';
    const known = base === 'Double' ? 'number' : base === 'String' ? 'string' : base === 'Boolean' ? 'boolean' : base === 'JSSymbol' ? 'symbol' : base === 'JSBigInt' ? 'bigint' : isFunctionType(base) || /^\(.*\) -> /.test(base) ? 'function' : base === 'Any' ? null : /^[A-Z]$/.test(base) ? null : 'object';
    if (t === 'Any?' || !known) return `jsTypeof(${this.expr(e.expression)})`;
    const maybe = this.maybeUndefined(e.expression);
    if (maybe) return `(if (${maybe} == null) "undefined" else ${kotlinString(known)})`;
    return t.endsWith('?') ? `(if (${this.expr(e.expression)} == null) "undefined" else ${kotlinString(known)})` : kotlinString(known);
  }

  /** The 1 that `++` and `--` step a number or a BigInt by. */
  private one(e: ts.Expression): string { return this.typeOf(e) === 'JSBigInt' ? 'JSBigInt(1L)' : '1.0'; }

  private prefix(e: ts.PrefixUnaryExpression): string {
    const K = ts.SyntaxKind;
    switch (e.operator) {
      case K.ExclamationToken: {
        const operand = this.isBool(e.operand) && !this.maybeUndefined(e.operand) ? this.expr(e.operand) : this.cond(e.operand);
        return `!(${operand})`;
      }
      case K.MinusToken:
        if (this.typeOf(e.operand) === 'JSBigInt') return `(-${this.expr(e.operand)})`;
        return ts.isNumericLiteral(e.operand) ? `-${this.expr(e.operand)}` : `-(${this.toNumber(e.operand)})`;
      case K.PlusToken: return this.toNumber(e.operand);
      case K.TildeToken: return this.typeOf(e.operand) === 'JSBigInt' ? `${this.expr(e.operand)}.inv()` : `jsBitNot(${this.toNumber(e.operand)})`;
      case K.PlusPlusToken: { const t = this.lvalue(e.operand); return `run { ${t} += ${this.one(e.operand)}; ${t} }`; }
      case K.MinusMinusToken: { const t = this.lvalue(e.operand); return `run { ${t} -= ${this.one(e.operand)}; ${t} }`; }
    }
    throw this.error(e, 'prefix operator');
  }

  private binary(e: ts.BinaryExpression): string {
    const op = e.operatorToken.kind;
    const K = ts.SyntaxKind;
    const l = () => this.expr(e.left);
    const r = () => this.expr(e.right);
    const target = () => this.lvalue(e.left);
    const bit: Partial<Record<ts.SyntaxKind, string>> = {
      [K.AmpersandToken]: 'jsBitAnd', [K.BarToken]: 'jsBitOr', [K.CaretToken]: 'jsBitXor',
      [K.LessThanLessThanToken]: 'jsShiftLeft', [K.GreaterThanGreaterThanToken]: 'jsShiftRight', [K.GreaterThanGreaterThanGreaterThanToken]: 'jsShiftRightUnsigned',
    };
    const compound: Partial<Record<ts.SyntaxKind, ts.SyntaxKind>> = {
      [K.AmpersandEqualsToken]: K.AmpersandToken, [K.BarEqualsToken]: K.BarToken, [K.CaretEqualsToken]: K.CaretToken,
      [K.LessThanLessThanEqualsToken]: K.LessThanLessThanToken, [K.GreaterThanGreaterThanEqualsToken]: K.GreaterThanGreaterThanToken,
      [K.GreaterThanGreaterThanGreaterThanEqualsToken]: K.GreaterThanGreaterThanGreaterThanToken,
    };
    const big = this.bigIntBinary(e);
    if (big) return big;
    if (bit[op]) return `${bit[op]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
    if (compound[op]) return `${target()} = ${bit[compound[op]!]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
    switch (op) {
      case K.EqualsToken: {
        if (ts.isPropertyAccessExpression(e.left) && this.symbolName(e.left.expression) === 'VueRef' && e.left.name.text === 'value') return `${target()} = ${this.signalWrite(e.left.expression, e.right, this.typeOf(e.left))}`;
        if (ts.isArrayLiteralExpression(e.left)) throw this.error(e, 'a destructuring assignment');
        if (ts.isPropertyAccessExpression(e.left)) {
          const special = this.core?.assign(e.left, e.right) ?? this.native?.assign(e.left, e.right);
          if (special) return special;
        }
        if (ts.isPropertyAccessExpression(e.left) && this.isAny(e.left.expression)) return `jsSet(${this.expr(e.left.expression)}, ${kotlinString(e.left.name.text)}, ${this.coerce(e.right, 'Any?')})`;
        if (ts.isElementAccessExpression(e.left) && this.isAny(e.left.expression)) return `jsSet(${this.expr(e.left.expression)}, ${this.propertyKey(e.left.argumentExpression)}, ${this.coerce(e.right, 'Any?')})`;
        const assigned = `${target()} = ${this.coerce(e.right, this.declaredTypeOf(e.left) ?? this.typeOf(e.left))}`;
        return ts.isExpressionStatement(e.parent) || (ts.isParenthesizedExpression(e.parent) && ts.isExpressionStatement(e.parent.parent)) || ts.isForStatement(e.parent) ? assigned : `run { ${assigned}; ${target()} }`;
      }
      case K.PlusEqualsToken: return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: return `${target()} -= ${this.toNumber(e.right)}`;
      case K.AsteriskEqualsToken: return `${target()} *= ${this.toNumber(e.right)}`;
      case K.SlashEqualsToken: return `${target()} /= ${this.toNumber(e.right)}`;
      case K.PercentEqualsToken: return `${target()} %= ${this.toNumber(e.right)}`;
      case K.AsteriskAsteriskEqualsToken: return `${target()} = jsPow(${l()}, ${this.toNumber(e.right)})`;
      case K.QuestionQuestionEqualsToken: return `if (jsIsNullish(${l()})) ${target()} = ${this.coerce(e.right, this.typeOf(e.left).replace(/\?$/, ''))}`;
      case K.BarBarEqualsToken: return `if (!jsTruthy(${l()})) ${target()} = ${this.coerce(e.right, this.typeOf(e.left))}`;
      case K.AmpersandAmpersandEqualsToken: return `if (jsTruthy(${l()})) ${target()} = ${this.coerce(e.right, this.typeOf(e.left))}`;
      case K.PlusToken: {
        if (this.isString(e.left) || this.isString(e.right)) return `${this.concatOperand(e.left)} + ${this.concatOperand(e.right)}`;
        if (this.isAny(e.left) || this.isAny(e.right)) return `jsAdd(${this.coerce(e.left, 'Any?')}, ${this.coerce(e.right, 'Any?')})`;
        return `${this.toNumber(e.left)} + ${this.toNumber(e.right)}`;
      }
      case K.MinusToken: return `${this.toNumber(e.left)} - ${this.toNumber(e.right)}`;
      case K.AsteriskToken: return `${this.toNumber(e.left)} * ${this.toNumber(e.right)}`;
      case K.SlashToken: return `${this.toNumber(e.left)} / ${this.toNumber(e.right)}`;
      case K.PercentToken: return `${this.toNumber(e.left)} % ${this.toNumber(e.right)}`;
      case K.AsteriskAsteriskToken: return `jsPow(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      case K.EqualsEqualsEqualsToken: case K.ExclamationEqualsEqualsToken: case K.EqualsEqualsToken: case K.ExclamationEqualsToken:
        return this.equality(e);
      case K.LessThanToken: case K.GreaterThanToken: case K.LessThanEqualsToken: case K.GreaterThanEqualsToken: {
        const sym = ts.tokenToString(op)!;
        if (this.isString(e.left) && this.isString(e.right)) return `${l()} ${sym} ${r()}`;
        return `${this.toNumber(e.left)} ${sym} ${this.toNumber(e.right)}`;
      }
      case K.QuestionQuestionToken: {
        const t = this.typeOf(e);
        const maybe = this.maybeUndefined(e.left);
        if (maybe && t === 'Any?') return `jsNullishCoalesce(${maybe}) { ${this.coerce(e.right, 'Any?')} }`;
        if (maybe) return `(${maybe} ?: ${this.coerce(e.right, t)})`;
        if (this.isAny(e.left)) return `jsNullishCoalesce(${l()}) { ${this.coerce(e.right, 'Any?')} }`;
        return `(${l()} ?: ${this.coerce(e.right, t)})`;
      }
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        if (this.isBool(e.left) && this.isBool(e.right)) return `${l()} ${sym} ${r()}`;
        // JavaScript returns an operand, not a Boolean.
        const t = this.typeOf(e);
        const v = this.fresh('__v');
        const right = this.coerce(e.right, t);
        const leftType = this.typeOf(e.left);
        const leftValue = leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? `${v}!!` : leftType === 'Any?' ? this.fromAny(v, t) : v;
        const left = this.maybeUndefined(e.left) ?? l();
        return op === K.BarBarToken
          ? `run { val ${v} = ${left}; if (jsTruthy(${v})) ${leftValue} else ${right} }`
          : `run { val ${v} = ${left}; if (jsTruthy(${v})) ${right} else ${leftValue} }`;
      }
      case K.InstanceOfKeyword: {
        const name = e.right.getText();
        return `(${l()} is ${ERRORS[name] ?? this.typeOf(e.right).replace(/^typeof /, '') ?? name})`;
      }
      case K.CommaToken: return `run { ${this.exprStatement(e.left)}; ${r()} }`;
      case K.InKeyword: return `jsHasKey(${this.coerce(e.right, 'Any?')}, ${this.propertyKey(e.left)})`;
    }
    throw this.error(e, `operator ${ts.tokenToString(op)}`);
  }

  /** An operator on BigInts (both sides, or a comparison with a number). */
  private bigIntBinary(e: ts.BinaryExpression): string | null {
    const K = ts.SyntaxKind;
    const lt = this.typeOf(e.left), rt = this.typeOf(e.right);
    if (lt !== 'JSBigInt' && rt !== 'JSBigInt') return null;
    const l = () => this.expr(e.left), r = () => this.expr(e.right);
    const op = e.operatorToken.kind;
    const both = lt === 'JSBigInt' && rt === 'JSBigInt';
    const ops: Partial<Record<ts.SyntaxKind, (a: string, b: string) => string>> = {
      [K.PlusToken]: (a, b) => `(${a} + ${b})`, [K.MinusToken]: (a, b) => `(${a} - ${b})`, [K.AsteriskToken]: (a, b) => `(${a} * ${b})`,
      [K.SlashToken]: (a, b) => `JSBigInt.divide(${a}, ${b})`, [K.PercentToken]: (a, b) => `JSBigInt.remainder(${a}, ${b})`, [K.AsteriskAsteriskToken]: (a, b) => `JSBigInt.power(${a}, ${b})`,
      [K.AmpersandToken]: (a, b) => `(${a} and ${b})`, [K.BarToken]: (a, b) => `(${a} or ${b})`, [K.CaretToken]: (a, b) => `(${a} xor ${b})`,
      [K.LessThanLessThanToken]: (a, b) => `JSBigInt.shiftLeft(${a}, ${b})`, [K.GreaterThanGreaterThanToken]: (a, b) => `JSBigInt.shiftRight(${a}, ${b})`,
    };
    const compound: Partial<Record<ts.SyntaxKind, ts.SyntaxKind>> = {
      [K.PlusEqualsToken]: K.PlusToken, [K.MinusEqualsToken]: K.MinusToken, [K.AsteriskEqualsToken]: K.AsteriskToken, [K.SlashEqualsToken]: K.SlashToken,
      [K.PercentEqualsToken]: K.PercentToken, [K.AsteriskAsteriskEqualsToken]: K.AsteriskAsteriskToken, [K.AmpersandEqualsToken]: K.AmpersandToken,
      [K.BarEqualsToken]: K.BarToken, [K.CaretEqualsToken]: K.CaretToken, [K.LessThanLessThanEqualsToken]: K.LessThanLessThanToken, [K.GreaterThanGreaterThanEqualsToken]: K.GreaterThanGreaterThanToken,
    };
    if (both && ops[op]) return ops[op]!(l(), r());
    if (both && compound[op]) return `${this.lvalue(e.left)} = ${ops[compound[op]!]!(l(), r())}`;
    const comparison: Partial<Record<ts.SyntaxKind, string>> = { [K.LessThanToken]: '<', [K.GreaterThanToken]: '>', [K.LessThanEqualsToken]: '<=', [K.GreaterThanEqualsToken]: '>=' };
    if (comparison[op]) {
      if (both) return `(${l()} ${comparison[op]} ${r()})`;
      // A BigInt against a number: exactly, NaN comparing false.
      const leftBig = lt === 'JSBigInt';
      const c = `JSBigInt.compare(${leftBig ? l() : r()}, ${this.toNumber(leftBig ? e.right : e.left)})`;
      return `(${c}?.let { ${leftBig ? 'it' : '-it'} ${comparison[op]} 0 } ?: false)`;
    }
    return null;
  }

  private equality(e: ts.BinaryExpression): string {
    const K = ts.SyntaxKind;
    const op = e.operatorToken.kind;
    const negate = op === K.ExclamationEqualsEqualsToken || op === K.ExclamationEqualsToken;
    const strict = op === K.EqualsEqualsEqualsToken || op === K.ExclamationEqualsEqualsToken;
    const isNullish = (x: ts.Expression) => x.kind === K.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    const [a, b] = [e.left, e.right];
    const lt = this.typeOf(a);
    const rt = this.typeOf(b);
    const maybe = isNullish(b) ? this.maybeUndefined(a) : isNullish(a) ? this.maybeUndefined(b) : null;
    if (maybe) return `${maybe} ${negate ? '!=' : '=='} null`;
    if (isNullish(b) && lt !== 'Any?') return `${this.expr(a)} ${negate ? '!=' : '=='} null`;
    if (isNullish(a) && rt !== 'Any?') return `${this.expr(b)} ${negate ? '!=' : '=='} null`;
    const generic = (x: string) => /^[A-Z]\??$/.test(x);
    if (lt === 'Any?' || rt === 'Any?' || generic(lt) || generic(rt) || (lt !== rt && lt.replace(/\?$/, '') !== rt.replace(/\?$/, ''))) {
      if (!strict && (isNullish(a) || isNullish(b))) return `${negate ? '!' : ''}jsIsNullish(${this.coerce(isNullish(a) ? b : a, 'Any?')})`;
      const fn = strict ? 'jsStrictEquals' : 'jsLooseEquals';
      return `${negate ? '!' : ''}${fn}(${this.coerce(a, 'Any?')}, ${this.coerce(b, 'Any?')})`;
    }
    if (this.isObjectRef(a) && this.isObjectRef(b)) return `${this.expr(a)} ${negate ? '!==' : '==='} ${this.expr(b)}`;
    return `${this.expr(a)} ${negate ? '!=' : '=='} ${this.expr(b)}`;
  }

  private array(e: ts.ArrayLiteralExpression): string {
    const context = this.checker.getContextualType(e);
    let t = this.typeOf(e);
    if (context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))) {
      const c = this.type(context, e).replace(/\?$/, '');
      if (c.startsWith('JSArray<') || c.startsWith('Pair<') || c.startsWith('Triple<') || !e.elements.length) t = c;
    }
    if (t === 'Any?') t = 'JSArray<Any?>';
    if (t.startsWith('Pair<') || t.startsWith('Triple<')) {
      const types = splitTopLevel(t.replace(/^(Pair|Triple)<(.*)>$/, '$2'));
      return `${t.replace(/<.*/, '')}(${e.elements.map((x, k) => this.coerce(x, types[k])).join(', ')})`;
    }
    const el = t.replace(/^JSArray<(.*)>$/, '$1');
    if (!e.elements.length) return `${t}()`;
    if (!e.elements.some(ts.isSpreadElement)) {
      if (e.elements.some(ts.isOmittedExpression)) throw this.error(e, 'an array hole');
      return `jsArrayOf<${el}>(${e.elements.map((x) => this.coerce(x, el)).join(', ')})`;
    }
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`listOf<${el}>(${run.join(', ')})`); run = []; }
        parts.push(`(${this.iterable(x.expression)}).toList()`);
      } else if (ts.isOmittedExpression(x)) throw this.error(x, 'an array hole');
      else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`listOf<${el}>(${run.join(', ')})`);
    return `${t}(${parts.join(' + ')})`;
  }

  private object(e: ts.ObjectLiteralExpression): string {
    const contextual = this.checker.getContextualType(e);
    // An object held untyped is extensible, as every script object is.
    if (contextual && contextual.flags & ts.TypeFlags.Any) return this.dynamicObject(e);
    const type = contextual ?? this.checker.getTypeAtLocation(e);
    const struct = this.native?.structLiteral(e, this.checker.getNonNullableType(type));
    if (struct) return struct;
    const name = this.type(this.checker.getNonNullableType(type), e).replace(/\?$/, '');
    if (name.startsWith('JSRecord<')) {
      const v = name.replace(/^JSRecord<(.*)>$/, '$1');
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `Pair(${ts.isComputedPropertyName(p.name) ? this.propertyKey(p.name.expression) : kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${this.coerce(p.initializer, v)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `Pair(${kotlinString(p.name.text)}, ${ident(p.name.text)})`;
        throw this.error(p, 'this member in a dictionary literal');
      });
      return entries.length ? `${name}(listOf(${entries.join(', ')}))` : `${name}()`;
    }
    if (name === 'Any?' || name === 'Any' || name === 'JSObject') return this.dynamicObject(e);
    if (/^JS(Iterator|AsyncIterator)</.test(name)) return this.scriptIterator(e, name);
    const decl = this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0];
    const shape = [...this.shapes.values()].find((s) => s.name === name);
    let order: { name: string; type: string; label?: string }[];
    let target = name;
    if (this.protocols.has(name) && decl && ts.isInterfaceDeclaration(decl)) {
      target = `${name}Object`;
      order = [
        ...decl.members.filter(ts.isPropertySignature).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) })),
        ...decl.members.filter(ts.isMethodSignature).map((m) => ({ name: m.name.getText(), type: this.typeOf(m), label: `_${m.name.getText()}` })),
      ];
    } else if (shape) order = shape.fields;
    else if (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl))) {
      order = decl.members.filter((m) => ts.isPropertySignature(m) || ts.isMethodSignature(m)).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) }));
    } else throw this.error(e, `an object literal of type ${name}`);
    const given = new Map<string, string>();
    // Methods that read `this` see the object through a variable the literal sets once it exists.
    const self = e.properties.some((p) => ts.isMethodDeclaration(p) && thisNodes(p).length) ? this.fresh('__self') : null;
    for (const p of e.properties) {
      if (ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)) {
        const key = literalKey(p.name, this.checker) ?? p.name.getText();
        const f = order.find((x) => x.name === key) as ShapeField | undefined;
        if (!f?.accessor) throw this.error(p, 'an accessor in an object literal of this type');
        if (ts.isGetAccessorDeclaration(p)) {
          const body = this.withThis(p, '__this', false, () => this.functionBody(p, f.type, this.indent));
          given.set(`__get_${key}`, `fun(__this: ${target}): ${f.type} ${body}`);
        } else {
          const v = p.parameters[0].name as ts.Identifier;
          const body = this.withThis(p, '__this', false, () => this.functionBody(p, 'Unit', this.indent));
          given.set(`__set_${key}`, `fun(__this: ${target}, ${ident(v.text)}: ${f.accessor.value}) ${body}`);
        }
        continue;
      }
      if (ts.isMethodDeclaration(p) && self && thisNodes(p).length) {
        given.set(literalKey(p.name, this.checker) ?? p.name.getText(), this.withThis(p, self, false, () => this.closure(p)));
        continue;
      }
      if (ts.isPropertyAssignment(p)) {
        const key = literalKey(p.name, this.checker) ?? p.name.getText();
        given.set(key, this.coerce(p.initializer, order.find((f) => f.name === key)?.type ?? 'Any?'));
      } else if (ts.isShorthandPropertyAssignment(p)) {
        const ft = order.find((f) => f.name === p.name.text)?.type ?? 'Any?';
        given.set(p.name.text, ft === 'Any?' ? this.narrowed(p.name, ident(p.name.text)) : this.coerce(p.name, ft));
      } else if (ts.isSpreadAssignment(p)) {
        const src = this.expr(p.expression);
        const fields = new Set(this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name));
        for (const f of order) if (fields.has(f.name)) given.set(f.name, `${src}.${ident(f.name)}`);
      } else if (ts.isMethodDeclaration(p)) {
        given.set(this.symbolMemberName(p.name) ?? p.name.getText(), this.closure(p));
      } else throw this.error(p, 'object member');
    }
    this.used.add(name);
    const written: string[] = [];
    for (const p of e.properties) {
      const keys = ts.isSpreadAssignment(p) ? this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name) : p.name ? [literalKey(p.name, this.checker) ?? p.name.getText()] : [];
      for (const k of keys) if (!written.includes(k) && order.some((f) => f.name === k)) written.push(k);
    }
    const inOrder = jsKeyOrder(written);
    const declared = order.map((f) => f.name).filter((n) => inOrder.includes(n));
    const reorder = inOrder.join() !== declared.join() ? `jsOrder = listOf(${inOrder.map(kotlinString).join(', ')})` : '';
    const args = order.flatMap((f) => {
      const a = (f as ShapeField).accessor;
      if (a) return [...(a.get ? [`__get_${f.name} = ${given.get(`__get_${f.name}`)}`] : []), ...(a.set ? [`__set_${f.name} = ${given.get(`__set_${f.name}`)}`] : [])];
      return given.has(f.name) ? [`${ident(f.label ?? f.name)} = ${given.get(f.name)}`] : [];
    });
    const made = `${target}(${[...args, reorder].filter(Boolean).join(', ')})`;
    return self ? `run { lateinit var ${self}: ${target}; val __made = ${made}; ${self} = __made; __made }` : made;
  }

  private dynamicObject(e: ts.ObjectLiteralExpression): string {
    const simple = e.properties.every((p) => (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) || ts.isShorthandPropertyAssignment(p));
    if (simple) {
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `Pair(${kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${ts.isObjectLiteralExpression(p.initializer) ? this.dynamicObject(p.initializer) : this.coerce(p.initializer, 'Any?')})`;
        const sh = p as ts.ShorthandPropertyAssignment;
        return `Pair(${kotlinString(sh.name.text)}, ${this.coerce(sh.name, 'Any?')})`;
      });
      return `JSObject(listOf<Pair<String, Any?>>(${entries.join(', ')}))`;
    }
    // Spreads, computed keys and methods: the object built key by key, in the literal's order.
    const o = this.fresh('__o');
    const key = (n: ts.PropertyName) => (ts.isComputedPropertyName(n) ? this.propertyKey(n.expression) : kotlinString(literalKey(n, this.checker) ?? n.getText()));
    const accessorsDone = new Set<string>();
    const steps = e.properties.flatMap((p) => {
      if (ts.isSpreadAssignment(p)) return [`jsObjectSpread(${o}, ${this.coerce(p.expression, 'Any?')})`];
      if (ts.isShorthandPropertyAssignment(p)) return [`${o}[${kotlinString(p.name.text)}] = ${this.coerce(p.name, 'Any?')}`];
      if (ts.isPropertyAssignment(p)) return [`${o}[${key(p.name)}] = ${this.coerce(p.initializer, 'Any?')}`];
      if (ts.isMethodDeclaration(p)) return [`${o}[${key(p.name)}] = ${this.untypedMethod(p)}`];
      if (ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)) {
        // A getter and a setter of one key make one property, where the first of them is.
        const name = p.name.getText();
        if (accessorsDone.has(name)) return [];
        accessorsDone.add(name);
        const pair = e.properties.filter((q): q is ts.AccessorDeclaration => (ts.isGetAccessorDeclaration(q) || ts.isSetAccessorDeclaration(q)) && q.name.getText() === name);
        const g = pair.find(ts.isGetAccessorDeclaration), st = pair.find(ts.isSetAccessorDeclaration);
        const get = g ? `get = fun(__this: Any?): Any? ${this.withThis(g, '__this', true, () => this.functionBody(g, 'Any?', this.indent))}` : '';
        const v = st && (st.parameters[0].name as ts.Identifier);
        const set = st && v ? `set = fun(__this: Any?, ${ident(v.text)}: Any?) ${this.withThis(st, '__this', true, () => this.functionBody(st, 'Unit', this.indent))}` : '';
        return [`${o}.defineProperty(${key(p.name)}, JSPropertyDescriptor(${[get, set, 'enumerable = true', 'configurable = true'].filter(Boolean).join(', ')}))`];
      }
      throw this.error(p, 'this member in an untyped object literal');
    });
    return `run { val ${o} = JSObject(); ${steps.join('; ')}; ${o} }`;
  }

  /** `{ [Symbol.iterator]() {…} }`: a well-known symbol's member name. */
  private symbolMemberName(name: ts.PropertyName): string | null {
    if (!ts.isComputedPropertyName(name)) return null;
    const e = name.expression;
    return ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'Symbol' && this.isLibGlobal(e.expression) ? WELL_KNOWN_MEMBERS[e.name.text] ?? null : null;
  }

  /** An object literal typed as an iterator (`{ next() {…}, return() {…} }`): its members are what the kit steps. */
  private scriptIterator(e: ts.ObjectLiteralExpression, type: string): string {
    const async = type.startsWith('JSAsyncIterator<');
    const element = type.replace(/^JS\w+<(.*)>$/, '$1');
    const slot = async ? '(Any?) -> JSPromise<Any?>' : '(Any?) -> Any?';
    const member = (key: string) => {
      const p = e.properties.find((x) => x.name && (literalKey(x.name, this.checker) ?? x.name.getText()) === key);
      if (!p) return null;
      if (ts.isMethodDeclaration(p)) return this.closure(p, slot);
      if (ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))) return this.closure(p.initializer, slot);
      throw this.error(p, 'this member of an iterator object');
    };
    for (const p of e.properties) {
      const key = p.name && (literalKey(p.name, this.checker) ?? p.name.getText());
      if (!key || !['next', 'return', 'throw'].includes(key)) throw this.error(p, 'this member of an iterator object');
    }
    const args = ['next', 'return', 'throw'].flatMap((k) => { const m = member(k); return m ? [`${k === 'next' ? 'nextResult' : k === 'return' ? 'returnResult' : 'throwResult'} = ${m}`] : []; });
    return `${async ? 'JSScriptAsyncIterator' : 'JSScriptIterator'}<${element}>(${args.join(', ')})`;
  }

  /** A method of an untyped object literal: a function value, or one taking `this` when its body reads it. */
  private untypedMethod(p: ts.MethodDeclaration): string {
    if (!thisNodes(p).length) return this.closure(p);
    const ret = this.returnTypeOf(p);
    const binds = p.parameters.map((q, k) => `val ${ident((q.name as ts.Identifier).text)}: ${this.typeOf(q.name)} = ${this.fromAnyCode(`__a.getOrNull(${k})`, this.typeOf(q.name), true)}`);
    const body = this.withThis(p, '__this', true, () => this.functionBody(p, ret, this.indent));
    return `JSMethod { __this, __a -> ${binds.map((b) => b + '; ').join('')}(fun()${ret === 'Unit' ? '' : `: ${ret}`} ${body})() }`;
  }

  error(n: ts.Node | undefined, what: string): Error {
    if (!n) return new Error(`${what} is not supported in a release build yet`);
    const sf = n.getSourceFile();
    const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
    return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${what} is not supported in a release build yet: ${n.getText().slice(0, 80)}`);
  }
}

/** Kotlin's spelling of what the async lowering writes. */
const KOTLIN_SYNTAX: AsyncSyntax = {
  voidType: 'Unit',
  fnType: (params, ret) => `(${params.join(', ')}) -> ${ret}`,
  constant: (name, type, value) => `val ${name}${type ? `: ${type}` : ''} = ${value}`,
  closure: (params, body, onError, i) => {
    const list = params.map(([n, t]) => `${n}: ${t}`).join(', ');
    const deeper = body.map((l) => '    ' + l);
    return `fun(${list}) {\n${i}    try {\n${deeper.join('\n')}\n${i}    } catch (__error: Throwable) {\n${i}        ${onError}(jsCaught(__error))\n${i}    }\n${i}}`;
  },
  inline: (statement, param) => (param ? `{ ${param[0]}: ${param[1]} -> ${statement} }` : `{ ${statement} }`),
  ifOpen: (cond) => `if (${cond}) {`,
  elseOpen: '} else {',
  ifLine: (cond, statements) => `if (${cond}) { ${statements} }`,
  scopeOpen: 'run {',
  tryBlock: (body, onError, i) => [`${i}try {`, ...body.map((l) => '    ' + l), `${i}} catch (__error: Throwable) {`, `${i}    ${onError}(jsCaught(__error))`, `${i}}`],
  unwrap: (code) => `${code}!!`,
  makeIterator: (name, seq) => `val ${name} = (${seq}).iterator()`,
  nextItem: (item, iterator, otherwise, i) => [`${i}if (!${iterator}.hasNext()) { ${otherwise} }`, `${i}val ${item} = ${iterator}.next()`],
  awaitCall: (operand, isPromise, continuation, onError) => `${isPromise ? 'jsAwait' : 'jsAwaitValue'}(${operand}, ${continuation}, ${onError})`,
  asyncStart: (cap, result) => `val ${cap} = JSAsync<${result}>()`,
  asyncBody: (cap) => [`${cap}.body(fun() {`, '})'],
  asyncReturn: (cap, value, isPromise, result) => (value === null ? `${cap}.returnValue(${result === 'Unit' ? 'Unit' : 'null'})` : `${cap}.${isPromise ? 'returnPromise' : 'returnValue'}(${value})`),
  asyncError: (cap) => `${cap}.onError`,
  loopRun: (iteration) => `JSAsyncLoop().run(${iteration})`,
  undefinedValue: 'null',
  generatorBody: (cap, element, isAsync) => [`return ${isAsync ? 'JSAsyncGenerator' : 'JSGenerator'}<${element}>(fun(${cap}: ${isAsync ? 'JSAsyncGeneratorContext' : 'JSGeneratorContext'}) {`, '})'],
  generatorReturn: (cap, value) => `${cap}.returnValue(${value ?? ''})`,
  yieldCall: (cap, operand, delegate, continuation, onError, onReturn) => `${cap}.${delegate ? 'delegate' : 'yield'}(${operand}, ${continuation}, ${onError}, ${onReturn})`,
  nextStep: (item, iterator, type, otherwise, i) => [`${i}if (!${iterator}.jsAdvance()) { ${otherwise} }`, `${i}val ${item}: ${type} = ${iterator}.jsCurrent`],
  closeIterator: (iterator) => `${iterator}.jsClose()`,
  awaitNext: (iterator, continuation, onError) => `jsAwait(${iterator}.jsNextPromise(null), ${continuation}, ${onError})`,
  asyncStep: (step, result, otherwise, i) => [`${i}val ${step} = jsStepOf(${result})`, `${i}if (${step}.done) { ${otherwise} }`],
  closeAsyncIterator: (iterator, next, onError) => `jsAsyncClose(${iterator}, ${next}, ${onError})`,
  closeAsyncIteratorThrowing: (iterator, error, onError) => `jsAsyncCloseThrowing(${iterator}, ${error}, ${onError})`,
  tryStatement: (statement) => statement,
};

/** A field of an object literal's class; an accessor runs functions the literal gives. */
interface ShapeField { name: string; type: string; label?: string; accessor?: { get: boolean; set: boolean; value: string }; symbol?: boolean }

/** `Symbol.iterator`, as the library declares `Symbol`. */
function isSymbolIterator(e: ts.Expression, checker: ts.TypeChecker): boolean {
  return ts.isPropertyAccessExpression(e) && e.name.text === 'iterator' && ts.isIdentifier(e.expression) && e.expression.text === 'Symbol'
    && !!checker.getSymbolAtLocation(e.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
}

function isLibDeclaration(d: ts.Node | undefined): boolean {
  return !!d && /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName);
}

/** The `this` nodes of a function, and of the arrow functions inside it. */
function thisNodes(fn: ts.Node): ts.Node[] {
  const out: ts.Node[] = [];
  const visit = (n: ts.Node) => {
    if (n.kind === ts.SyntaxKind.ThisKeyword) out.push(n);
    if (n !== fn && (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n) || ts.isAccessor(n) || ts.isClassLike(n) || ts.isConstructorDeclaration(n))) return;
    ts.forEachChild(n, visit);
  };
  visit(fn);
  return out;
}

const LIB_CONSTANTS: Record<string, string> = {
  'Math.PI': 'Math.PI', 'Math.E': 'Math.E', 'Math.LN2': '0.6931471805599453', 'Math.LN10': '2.302585092994046', 'Math.LOG2E': '1.4426950408889634', 'Math.LOG10E': '0.4342944819032518', 'Math.SQRT2': '1.4142135623730951', 'Math.SQRT1_2': '0.7071067811865476',
  'Number.MAX_SAFE_INTEGER': '9007199254740991.0', 'Number.MIN_SAFE_INTEGER': '-9007199254740991.0', 'Number.EPSILON': 'Math.ulp(1.0)',
  'Number.MAX_VALUE': 'Double.MAX_VALUE', 'Number.MIN_VALUE': 'Double.MIN_VALUE', 'Number.POSITIVE_INFINITY': 'Double.POSITIVE_INFINITY',
  'Number.NEGATIVE_INFINITY': 'Double.NEGATIVE_INFINITY', 'Number.NaN': 'Double.NaN',
  'Symbol.iterator': 'JSSymbol.iterator', 'Symbol.asyncIterator': 'JSSymbol.asyncIterator', 'Symbol.toPrimitive': 'JSSymbol.toPrimitive',
  'Symbol.toStringTag': 'JSSymbol.toStringTag', 'Symbol.hasInstance': 'JSSymbol.hasInstance',
};



function boundNames(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : boundNames(e.name)));
}

function hasModifier(n: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(n) && !!ts.getModifiers(n)?.some((m) => m.kind === kind);
}

/** A number literal as a Kotlin Double literal. */
export function numberLiteral(text: string): string {
  const n = Number(text.replace(/_/g, ''));
  if (Number.isNaN(n)) return 'Double.NaN';
  if (!Number.isFinite(n)) return n > 0 ? 'Double.POSITIVE_INFINITY' : 'Double.NEGATIVE_INFINITY';
  const s = String(n);
  return /[.e]/.test(s) ? s : `${s}.0`;
}

function superAt(ctor: ts.ConstructorDeclaration): ts.CallExpression | null {
  for (const s of ctor.body?.statements ?? []) {
    if (ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword) return s.expression;
  }
  return null;
}

function isWriteTarget(e: ts.Node): boolean {
  const p = e.parent;
  if (ts.isBinaryExpression(p) && p.left === e && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
  if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) return true;
  return false;
}

function continuesTo(n: ts.Node, label: string): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found || ts.isFunctionLike(c)) return;
    if (ts.isContinueStatement(c) && c.label?.text === label) { found = true; return; }
    ts.forEachChild(c, visit);
  };
  visit(n);
  return found;
}

function containsJump(n: ts.Node, kind: ts.SyntaxKind): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found || ts.isFunctionLike(c)) return;
    if (c.kind === kind) { found = true; return; }
    if ((kind === ts.SyntaxKind.ContinueStatement || kind === ts.SyntaxKind.BreakStatement) && ts.isIterationStatement(c, false)) return;
    ts.forEachChild(c, visit);
  };
  ts.forEachChild(n, visit);
  if (n.kind === kind) return true;
  return found;
}

function capturedIn(name: ts.Identifier, body: ts.Node, checker: ts.TypeChecker): boolean {
  const sym = checker.getSymbolAtLocation(name);
  let found = false;
  const visit = (n: ts.Node, inClosure: boolean) => {
    if (found) return;
    if (inClosure && ts.isIdentifier(n) && checker.getSymbolAtLocation(n) === sym) { found = true; return; }
    ts.forEachChild(n, (c) => visit(c, inClosure || ts.isFunctionLike(n)));
  };
  visit(body, false);
  return found;
}

/** A Kotlin function type's parameter types and result type. */
export function functionTypeParts(t: string): { params: string[]; ret: string } | null {
  if (!t.startsWith('(')) return null;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '(' || c === '<') depth++;
    else if ((c === ')' || c === '>') && t[i - 1] !== '-') {
      depth--;
      if (depth === 0) {
        if (c !== ')' || t.slice(i + 1, i + 5) !== ' -> ') return null;
        return { params: splitTopLevel(t.slice(1, i)).filter(Boolean), ret: t.slice(i + 5) };
      }
    }
  }
  return null;
}

/** `A, (B, C), D<E, F>` split at its top-level commas. */
export function splitTopLevel(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out.filter((x, k) => x || k < out.length - 1);
}

/** Whether a module function `fn` called at `at` is shadowed by a member of the class around it, as a bare name is in Swift and Kotlin. */
function shadowedByMember(at: ts.Node, decl: ts.Declaration | undefined, fn: string, ident: (name: string) => string): boolean {
  if (!decl || !ts.isFunctionDeclaration(decl) || !ts.isSourceFile(decl.parent)) return false;
  const cls = ts.findAncestor(at, ts.isClassLike);
  return !!cls && cls.members.some((m) => !!m.name && ts.isIdentifier(m.name) && ident(m.name.text) === fn);
}
