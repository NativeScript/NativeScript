import type { SourceLines } from './source-lines.ts';
import ts from 'typescript';
import { AsyncLowering, usedBefore, type AsyncCtx, type AsyncSyntax, type AsyncTranslator } from './async.ts';
import { isAsync, isStatic } from './throws.ts';
import { intlConstructor, isObjectToStringCall, isStringRaw, redeclaredBeside, iteratedType, iterationThrows, jsKeyOrder, literalKey, neverDefined, templateParts, unsafeReceiver, wellKnownMember, WELL_KNOWN_MEMBERS, ignoresThisArg, implementedInterfaces } from './lang.ts';
import { isCoreDeclaration } from './core.ts';
import type { Properties } from './properties.ts';
import { recognizePatterns, type Patterns } from './patterns.ts';
import type { Reach } from './reach.ts';

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

/** A nullable Kotlin type (`T?`, `((A) -> B)?`), not a function returning one. */
const isNullable = (t: string) => t.endsWith('?') && !isFunctionType(t);

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
  /** Whether a variable only names a Java class (`const GestureHandler = com.swmansion.gesturehandler.GestureHandler`): its uses are the class's. */
  isClassAlias(d: ts.VariableDeclaration): boolean;
  /** The Kotlin class a variable holding NativeScript's `Base.extend({ … })` declares in its place. */
  extensionClass(d: ts.VariableDeclaration): string | null;
  /** The nearest class `from` extends that is also a `to`, when `from` is not one itself. */
  sharedClass(from: string, to: string): string | null;
  toNumber(e: ts.Expression, t: string): string | null;
}

/** @nativescript/core's API through the Android kit. */
export interface KotlinCore {
  /** Whether kit-android declares a type of this name. */
  has(name: string): boolean;
  /** Whether a kit type is a view (extends View). */
  isKitView(name: string): boolean;
  /** A member of a kit type or a type it extends, as the kit declares it. */
  kitMember(owner: string, name: string): { kind: string; type: string; params?: string; static: boolean } | null;
  isKitMethod(callee: ts.Expression): boolean;
  nativeClassOf(e: ts.Expression): string | null;
  type(t: ts.Type): string | null;
  property(e: ts.PropertyAccessExpression): string | null;
  lvalue(e: ts.PropertyAccessExpression): string | null;
  call(e: ts.CallExpression): string | null;
  construct(e: ts.NewExpression): string | null;
  assign(left: ts.PropertyAccessExpression, right: ts.Expression): string | null;
}

// No prototype: a name like `toString` is no error class.
const BUILTIN_CLASSES: Record<string, string> = Object.assign(Object.create(null), { Promise: 'JSPromise<*>', Array: 'JSArray<*>', Map: 'JSMap<*, *>', Set: 'JSSet<*>', Date: 'JSDate' });
const ERRORS: Record<string, string> = Object.assign(Object.create(null), { Error: 'JSError', TypeError: 'JSTypeError', RangeError: 'JSRangeError', SyntaxError: 'JSSyntaxError', ReferenceError: 'JSReferenceError', AggregateError: 'JSAggregateError' });
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date', 'WeakRef', 'Symbol', 'WeakMap', 'WeakSet', 'BigInt']);
/** Core classes kit-android implements under another name. */
export const KIT_NAMES_ANDROID: Record<string, string> = { ViewBase: 'View', ViewCommon: 'View', EditableTextBase: 'TextBase', LayoutBaseCommon: 'LayoutBase' };
/** iOS SDK declarations an Android build types app code with: NativeScript leaves them undefined on Android. */
const IOS_TYPINGS = /[\\/]@nativescript[\\/]types-ios[\\/]/;
const VALUE_TYPES = new Set(['Double', 'String', 'Boolean', 'Any?', 'Any', 'Unit', 'Nothing', 'JSBigInt', 'JSSymbol']);

/**
 * A module-level property: its JVM accessors would clash with a function the
 * module declares by that name (`state` and `getState()`), so it has none.
 */
/** The implementation of an overload signature (one without a body) in source; null for anything else. */
function implementationOf(d: ts.SignatureDeclaration | ts.JSDocSignature): ts.FunctionLikeDeclaration | null {
  if (ts.isJSDocSignature(d) || d.getSourceFile().isDeclarationFile || ('body' in d && d.body)) return null;
  if (ts.isConstructorDeclaration(d)) return d.parent.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body) ?? null;
  if ((ts.isMethodDeclaration(d) || ts.isFunctionDeclaration(d)) && d.name) {
    const siblings = ts.isMethodDeclaration(d) ? d.parent.members : (d.parent as ts.SourceFile | ts.ModuleBlock).statements;
    return (siblings as ts.NodeArray<ts.Node>).find((m): m is ts.FunctionLikeDeclaration => (ts.isMethodDeclaration(m) || ts.isFunctionDeclaration(m)) && !!m.body && m.name?.getText() === d.name!.getText()) ?? null;
  }
  return null;
}

/** Whether an expression's value is unused: a statement of its own, or a for loop's clause. */
function statementLevel(e: ts.Expression): boolean {
  let n: ts.Node = e;
  while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
  const p = n.parent;
  return ts.isExpressionStatement(p) || (ts.isForStatement(p) && (p.incrementor === n || p.initializer === n)) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.CommaToken && p.left === n);
}

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
  /** `--allow-unimplemented-properties`: a core property the kit does not apply is set by name, with a warning. */
  allowUnapplied = false;

  readonly checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  /** Files of the plugins compiled from source. */
  readonly pluginFiles: Set<string>;
  /** What of the plugins the app reaches; everything when absent. */
  readonly reach: Reach | null;
  /** The view properties the program registers with core's `Property`. */
  readonly properties: Properties | null;
  readonly patterns: Patterns;
  /** Classes some class extends, by declaration (an import may rename them). */
  private extendedDecls = new Set<ts.Node>();
  /**
   * Parameters and fields Kotlin declares nullable where TypeScript's type is
   * not: plugin code checked without strictNullChecks passes null and
   * undefined for objects, and a property a plugin registers may be unset.
   * A read unwraps them unless it only tests or passes the value on.
   */
  private nullableDecls = new Set<ts.Symbol>();
  /** Expressions whose value lands where null is fine (an optional slot): a nullable declaration is read as it is. */
  private nullOk = new Set<ts.Node>();
  /** What `this` is in an arrow function inside a Kotlin object expression, where Kotlin's `this` is the object. */
  thisAlias: string | null = null;

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[], options: { pluginFiles?: Iterable<string>; reach?: Reach; properties?: Properties } = {}) {
    this.checker = checker;
    this.components = components;
    this.sourceFiles = files;
    this.pluginFiles = new Set(options.pluginFiles ?? []);
    this.reach = options.reach ?? null;
    this.properties = options.properties ?? null;
    this.patterns = recognizePatterns(checker, files);
    this.lowering = new AsyncLowering(this);
    for (const f of files) {
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          const base = n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
          if (base && ts.isIdentifier(base.expression)) {
            this.extended.add(base.expression.text);
            const d = this.resolve(base.expression)?.valueDeclaration;
            if (d) this.extendedDecls.add(d);
          }
          for (const i of implementedInterfaces(this.checker, n)) this.protocols.add(i.expression.getText());
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
    // A namespace as a value (`{ Kinds: Trace.Kinds }`): its object.
    const nsDecl = t.flags & F.Object && t.getSymbol()?.flags! & ts.SymbolFlags.ValueModule ? t.getSymbol()!.valueDeclaration : undefined;
    if (nsDecl && ts.isModuleDeclaration(nsDecl) && !nsDecl.getSourceFile().isDeclarationFile) return this.namespacePath(nsDecl)!;
    // `OptionsTypeMap[T]` over a type parameter: whatever the call passes.
    if (t.flags & F.IndexedAccess) return 'Any?';
    if (t.flags & F.Never) return 'Nothing';
    if (t.flags & (F.Void | F.Undefined)) return 'Unit';
    if (t.flags & F.Null) return 'Any?';
    if (t.flags & F.TypeParameter) {
      const name = t.symbol?.name;
      const constraint = (t as ts.TypeParameter & { isThisType?: boolean }).isThisType ? t.getConstraint() : undefined;
      if (constraint) return this.type(constraint, where);
      if (name === 'this') {
        const cls = where && ts.findAncestor(where, ts.isClassLike);
        if (cls?.name) return this.className(cls);
      }
      const decl = t.symbol?.declarations?.[0];
      if (decl && this.pluginFiles.has(decl.getSourceFile().fileName)) return 'Any?';
      return name ?? 'Any?';
    }
    // `UIView & { nsView?: … }`, `View & { … }`: the class; the members the literal adds are read by name.
    if (t.isIntersection()) {
      const cls = t.types.find((u) => this.native?.type(u) || (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class);
      if (cls) return this.type(cls, where);
      // `T & string`, a type parameter narrowed by typeof: the primitive.
      const primitive = t.types.find((u) => u.flags & (F.StringLike | F.NumberLike | F.BooleanLike));
      if (primitive && t.types.every((u) => u === primitive || u.flags & F.TypeParameter)) return this.type(primitive, where);
    }
    if (t.isUnion()) {
      let parts = t.types.filter((u) => !(u.flags & (F.Undefined | F.Null | F.Void)));
      if (!parts.length) return 'Any?';
      const optional = parts.length < t.types.length;
      // `xs || []`: the empty literal's `never[]` takes the other side's type.
      const empty = (u: ts.Type) => c.isArrayType(u) && !!(c.getTypeArguments(u as ts.TypeReference)[0]?.flags & F.Never);
      if (parts.length > 1 && parts.some((u) => !empty(u))) parts = parts.filter((u) => !empty(u));
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
    if (c.isArrayType(t)) {
      const el = c.getTypeArguments(t as ts.TypeReference)[0];
      return el.flags & F.Never ? 'JSArray<Any?>' : `JSArray<${this.type(el, where)}>`;
    }
    const sym = t.aliasSymbol ?? t.getSymbol();
    if (sym?.declarations?.some((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return 'Any?';
    const declName = sym?.declarations?.[0] && (ts.isClassDeclaration(sym.declarations[0]) || ts.isInterfaceDeclaration(sym.declarations[0])) ? sym.declarations[0].name?.text : undefined;
    // A default-exported class is known by its declared name.
    const name = sym?.getName() === 'default' ? declName ?? 'default' : sym?.getName();
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
      // Script writes animation definitions as object literals; the kit's Animation reads them by key.
      case 'AnimationDefinition': if (isCoreDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
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
    if (name === 'NonNullable' && t.aliasSymbol && args().length === 1) {
      const inner = this.type(args()[0], where);
      return inner === 'Any?' ? inner : inner.replace(/\?$/, '');
    }
    if (name === 'Object' && sym?.declarations?.every((d) => /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName))) return 'Any?';
    const native = this.native?.type(t);
    if (native) return native;
    const core = this.core?.type(t);
    if (core) return core;
    const index = t.getStringIndexType() ?? t.getNumberIndexType();
    if (index && !t.getProperties().length) return `JSRecord<${this.type(index, where)}>`;
    // A literal with computed keys beside named ones (`{ [k]: 1, a: 2 }`): its keys are known only when it runs.
    if (index && sym?.getName() === '__object') return 'Any?';
    // A mapped type (`Partial<…>`, `{ [k in Side]: number }`) is read by computed keys: an untyped object.
    if (name && ['Partial', 'Required', 'Readonly', 'Pick', 'Omit'].includes(name) && t.aliasSymbol) {
      const of = t.aliasTypeArguments?.[0];
      if (of && of.getSymbol()?.flags! & ts.SymbolFlags.Class) return this.type(of, where);
      return 'Any?';
    }
    if ((t as ts.ObjectType).objectFlags & ts.ObjectFlags.Mapped) return 'Any?';
    // `{}` (what `unknown` narrows to once tested truthy) is any value but null and undefined, a native object included.
    if (!t.getProperties().length && !t.getCallSignatures().length && !t.getConstructSignatures().length && !index) return 'Any?';
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
    const extended = sym && sym.flags & ts.SymbolFlags.Interface ? this.extendedClass(t) : null;
    if (extended) return this.type(extended, where);
    if (sym && this.isDynamicShape(sym)) return 'Any?';
    if (this.isEventData(t)) return 'EventData';
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    // RxJS's classes are the kit's Rx classes: core has an Observable of its own.
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/rxjs.d.ts') return `Rx${name}${(t as ts.TypeReference).typeArguments?.length ? `<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>` : ''}`;
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    if (name && Object.hasOwn(KIT_NAMES_ANDROID, name) && isCoreDeclaration(sym?.declarations?.[0])) return KIT_NAMES_ANDROID[name];
    const renamed = sym?.valueDeclaration && this.topNames().get(sym.valueDeclaration);
    if (renamed) return renamed;
    // A mixin's class is the core class it is applied to.
    const mixin = this.mixinOf(sym);
    if (mixin) return mixin;
    if (name && name !== '__type' && name !== '__object') {
      if (sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) this.used.add(name);
      const classDecl = sym?.declarations?.find((d): d is ts.ClassDeclaration => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile);
      // A plugin's generic class is untyped in its parameters, as its code treats them.
      const declared = classDecl && !this.pluginFiles.has(classDecl.getSourceFile().fileName) ? classDecl.typeParameters?.length ?? 0 : 0;
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
    if (this.isArguments(n)) return 'JSArray<Any?>';
    if (this.untypedThis.has(n)) return 'Any?';
    // A value declared `unknown` stays untyped where checks narrow it (`value !== null` makes it `{}`, which is no object shape).
    if (ts.isIdentifier(n)) {
      const decl = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
      if (decl && (ts.isParameter(decl) || ts.isVariableDeclaration(decl)) && decl.type?.kind === ts.SyntaxKind.UnknownKeyword) return 'Any?';
    }
    const t = this.type(this.checker.getTypeAtLocation(n), n);
    if (!t.includes('.')) return t;
    const sym = ts.isIdentifier(n) ? this.checker.getSymbolAtLocation(n) : undefined;
    const decl = sym?.valueDeclaration;
    const init = decl && ts.isVariableDeclaration(decl) && !decl.type ? decl.initializer : ts.isAsExpression(n) ? n : undefined;
    return (init && this.uncheckedCast(init)) ?? t;
  }

  /**
   * A script cast of a core view's native view to a Java class that view is
   * not (`scrollView.android as android.widget.ScrollView`, a NestedScrollView):
   * unchecked in script, here a cast to the nearest class both extend.
   */
  private uncheckedCast(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (!ts.isAsExpression(e) || !this.core || !this.native) return null;
    let inner = e.expression;
    while (ts.isParenthesizedExpression(inner) || ts.isNonNullExpression(inner)) inner = inner.expression;
    const made = this.core.nativeClassOf(inner);
    const to = this.type(this.checker.getTypeAtLocation(e), e);
    return made ? this.native.sharedClass(made, to.replace(/\?$/, '')) : null;
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
    // A shorthand property (`{ positions }`) names the variable it reads.
    const sym = ts.isIdentifier(e) && ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e
      ? this.checker.getShorthandAssignmentValueSymbol(e.parent)
      : this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    // A member of a mapped type (`Partial<T>`): optional where `T` declares it required.
    if (sym && !sym.valueDeclaration && sym.flags & ts.SymbolFlags.Optional && sym.declarations?.length) {
      return optionalType(this.type(this.checker.getNonNullableType(this.checker.getTypeOfSymbol(sym)), sym.declarations[0]));
    }
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    if (!(ts.isVariableDeclaration(decl) || ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isBindingElement(decl) || ts.isGetAccessorDeclaration(decl) || ts.isPropertyAssignment(decl))) return null;
    let t = this.type(this.checker.getTypeOfSymbolAtLocation(sym, decl), decl);
    // A parameter with a default is nullable in its signature only; the body sees it filled in.
    if (ts.isParameter(decl) && decl.questionToken) t = optionalType(t);
    if (this.nullableDecls.has(sym) && t !== 'Any?') t = optionalType(t);
    return t;
  }

  /** Whether a read of `e` only tests or passes on its value, so a nullable declaration needs no unwrap there. */
  nullTolerant(e: ts.Expression): boolean {
    let n: ts.Node = e;
    while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
    if (this.nullOk.has(n) || this.nullOk.has(e)) return true;
    const p = n.parent;
    const K = ts.SyntaxKind;
    if ((ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) && p.expression === n) return true;
    if (ts.isConditionalExpression(p) && p.condition === n) return true;
    if (ts.isPrefixUnaryExpression(p) && p.operator === K.ExclamationToken) return true;
    if (ts.isTypeOfExpression(p)) return true;
    if (ts.isBinaryExpression(p)) {
      const op = p.operatorToken.kind;
      if (op === K.AmpersandAmpersandToken || op === K.BarBarToken) return true;
      if (op === K.QuestionQuestionToken && p.left === n) return true;
      // An identity or equality test takes a missing value as it is.
      if ([K.EqualsEqualsToken, K.EqualsEqualsEqualsToken, K.ExclamationEqualsToken, K.ExclamationEqualsEqualsToken].includes(op)) return true;
    }
    if ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) && p.expression === n && p.questionDotToken) return true;
    if (ts.isCallExpression(p) && p.expression === n && p.questionDotToken) return true;
    return false;
  }

  /** The app's interfaces, for object literals TypeScript checks against one without naming it. */
  private appInterfaces: { name: string; type: ts.Type }[] | null = null;

  /**
   * The one app interface an object literal's type conforms to (every key of
   * the literal is one of its fields, of an assignable type, and every field
   * the literal lacks is optional): what the literal is, where it flows into
   * that interface through an inferred type (`.map(e => ({ … }))`).
   */
  private conformingInterface(t: ts.Type): string | null {
    const c = this.checker;
    this.appInterfaces ??= this.sourceFiles.filter((f) => !this.pluginFiles.has(f.fileName)).flatMap((f) => f.statements.filter(ts.isInterfaceDeclaration))
      .filter((d) => !d.typeParameters?.length).map((d) => ({ name: d.name.text, type: c.getDeclaredTypeOfSymbol(c.getSymbolAtLocation(d.name)!) }));
    const own = t.getProperties();
    if (!own.length) return null;
    const matches = this.appInterfaces.filter(({ type }) => {
      const fields = type.getProperties();
      if (!own.every((p) => fields.some((f) => f.name === p.name))) return false;
      if (!fields.every((f) => own.some((p) => p.name === f.name) || f.flags & ts.SymbolFlags.Optional)) return false;
      return (c as any).isTypeAssignableTo?.(t, type) ?? false;
    });
    return matches.length === 1 ? matches[0].name : null;
  }

  private shape(t: ts.Type, where?: ts.Node): string {
    const conforming = this.conformingInterface(t);
    if (conforming) { this.used.add(conforming); return conforming; }
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
        // A class file's name has to fit the file system's limit.
        if (name.length > 80) name = `${name.slice(0, 64)}_${fields.length}`;
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
  private isBool(n: ts.Node) {
    if (this.typeOf(n) !== 'Boolean') return false;
    return !((ts.isIdentifier(n) || ts.isPropertyAccessExpression(n)) && this.declaredTypeOf(n) === 'Boolean?');
  }
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
      if (this.reach && !this.reach.keeps(st)) continue;
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, sf.fileName, st.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, sf.fileName, st.type.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isEnumDeclaration(st)) {
        // A namespace merged into the enum: members of its object.
        const merged = (this.checker.getSymbolAtLocation(st.name)?.declarations ?? []).filter((d): d is ts.ModuleDeclaration => ts.isModuleDeclaration(d) && d.getSourceFile() === sf).flatMap((md) => this.namespaceMembers(md, later) ?? []);
        out.push(this.enumDecl(st, merged));
        continue;
      }
      if (ts.isModuleDeclaration(st) && this.mergedClass(st)) continue;
      if (ts.isModuleDeclaration(st)) { const ns = this.namespaceDecl(st, this.topName(st, st.name.text), later); if (ns) out.push(ns); continue; }
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) out.push(this.func(st, ident(this.topName(st, st.name.text)))); continue; }
      if (ts.isClassDeclaration(st)) {
        const target = this.patterns.mixinTarget(st);
        if (target) { out.push(this.mixinDecl(st, target)); continue; }
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component'));
        if (!component && st.name) {
          // A namespace merged into the class: its companion's members.
          this.mergedStatics = (this.checker.getSymbolAtLocation(st.name)?.declarations ?? []).filter((d): d is ts.ModuleDeclaration => ts.isModuleDeclaration(d) && d.getSourceFile() === sf).flatMap((md) => this.namespaceMembers(md, later) ?? []);
          this.staticInits = [];
          try { out.push(this.classDecl(st)); } finally {
            this.mergedStatics = [];
            for (const line of this.staticInits) later(() => line);
            this.staticInits = null;
          }
        }
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
          const extension = this.native?.extensionClass(d);
          if (extension) { out.push(extension); continue; }
          if (this.patterns.requiredCore(d) || this.native?.isClassAlias(d)) continue;
          const name = ident(this.topName(d, d.name.text));
          const t = this.typeOf(d.name);
          // A plugin's unset object variable (`let vibrator: Vibrator`, tested before it is assigned): nullable, unwrapped where it is read.
          if (!d.initializer && this.pluginFiles.has(sf.fileName) && !t.endsWith('?') && this.isObjectType(t) && !isFunctionType(t)) {
            const sym = this.checker.getSymbolAtLocation(d.name);
            if (sym) this.nullableDecls.add(sym);
            out.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
            continue;
          }
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

  /**
   * `namespace N { … }` as `object N`: its functions and variables are
   * members, read as `N.member`; its statements run with the module's.
   * A namespace that declares only types has no value and no object.
   */
  private namespaceDecl(md: ts.ModuleDeclaration, name: string, later: (code: () => string) => void): string {
    const lines = this.namespaceMembers(md, later);
    if (!lines) return '';
    return [`object ${ident(name)} {`, ...lines.map((l) => l.split('\n').map((x) => (x ? '    ' + x : x)).join('\n')), '}'].join('\n');
  }

  /** A namespace's members as an object's (or, merged into a class, its companion's); null when it has no values. */
  private namespaceMembers(md: ts.ModuleDeclaration, later: (code: () => string) => void): string[] | null {
    if (!md.body || !ts.isModuleBlock(md.body)) throw this.error(md, 'a dotted namespace');
    const path = this.namespacePath(md)!;
    const lines: string[] = [];
    let values = false;
    for (const st of md.body.statements) {
      if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
      // A namespace's interfaces are the module's: a class of the interface's name.
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, md.getSourceFile().fileName, st.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, md.getSourceFile().fileName, st.type.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      values = true;
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) lines.push(this.func(st, ident(st.name.text))); continue; }
      if (ts.isModuleDeclaration(st)) { const inner = this.namespaceDecl(st, st.name.text, later); if (inner) lines.push(inner); continue; }
      if (ts.isEnumDeclaration(st)) { lines.push(this.enumDecl(st)); continue; }
      if (ts.isVariableStatement(st)) {
        const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) throw this.error(d, 'a destructuring declaration in a namespace');
          const name = ident(d.name.text);
          const t = this.typeOf(d.name);
          if (d.initializer && this.pure(d.initializer)) { lines.push(`@JvmField ${constant ? 'val' : 'var'} ${name}: ${t} = ${this.coerce(d.initializer, t)}`); continue; }
          lines.push(this.deferredDeclaration(name, t));
          if (d.initializer) later(() => `    ${path}.${name} = ${this.coerce(d.initializer!, t)}`);
        }
        continue;
      }
      if (ts.isClassDeclaration(st)) { lines.push(this.classDecl(st)); continue; }
      later(() => this.stmt(st));
    }
    return values ? lines : null;
  }

  private mergedStatics: string[] = [];
  /** The assignments of a module-level class's static fields whose initializers read changing state, run in the module's order. */
  private staticInits: string[] | null = null;
  /** Whether a namespace merges into a class of its name in its file. */
  private mergedClass(md: ts.ModuleDeclaration): boolean {
    return (this.checker.getSymbolAtLocation(md.name)?.declarations ?? []).some((d) => (ts.isClassDeclaration(d) || ts.isEnumDeclaration(d)) && d.getSourceFile() === md.getSourceFile());
  }

  /** The Kotlin path of a namespace declaration (`CoreTypes.AnimationCurve`). */
  private namespacePath(md: ts.ModuleDeclaration): string | null {
    if (!ts.isIdentifier(md.name)) return null;
    const outer = ts.isModuleBlock(md.parent) ? md.parent.parent : null;
    return outer ? `${this.namespacePath(outer)}.${ident(md.name.text)}` : ident(this.topName(md, md.name.text));
  }

  /** A reference to a namespace's member: `N.member`; null for any other declaration. */
  private qualifiedDecl(decl: ts.Declaration, name: string): string | null {
    if (decl.getSourceFile().isDeclarationFile) return null;
    const statement = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
    if (!ts.isModuleBlock(statement.parent) || !ts.isModuleDeclaration(statement.parent.parent)) return null;
    const outer = this.namespacePath(statement.parent.parent);
    return outer ? `${outer}.${ident(name)}` : null;
  }

  /** An identifier as a reference to what it names: qualified where its declaration is a namespace's. */
  private refName(e: ts.Identifier): string {
    const local = this.checker.getSymbolAtLocation(e);
    const target = local && local.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration;
    return (decl && this.qualifiedDecl(decl, target!.name)) ?? this.unshadowed(e, decl, ident(this.declaredName(e)));
  }

  /** A module-level name read inside a namespace with a member of the same name: qualified by the app's module. */
  private unshadowed(at: ts.Node, decl: ts.Declaration | undefined, name: string): string {
    if (!this.appModule || !decl) return name;
    const statement = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
    if (!ts.isSourceFile(statement.parent)) return name;
    for (let n: ts.Node | undefined = at.parent; n; n = n.parent) {
      if (!ts.isModuleBlock(n)) continue;
      const shadows = n.statements.some((st) => (ts.isFunctionDeclaration(st) || ts.isModuleDeclaration(st) || ts.isEnumDeclaration(st)) ? st.name?.getText() === name
        : ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => d.name.getText() === name));
      if (shadows) return `${this.appModule}.${name}`;
    }
    return name;
  }

  /** `ns.member` where `ns` is a namespace or a module imported as one (`import * as types`): the member's own reference. */
  private namespaceMember(e: ts.PropertyAccessExpression): string | null {
    const recv = this.resolve(e.expression);
    const d = recv?.valueDeclaration;
    if (!recv || !(recv.flags & ts.SymbolFlags.ValueModule) || !d || d.getSourceFile().isDeclarationFile) return null;
    const member = this.checker.getSymbolAtLocation(e.name);
    const target = member && member.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(member) : member;
    const decl = target?.valueDeclaration;
    // A class's static member or an enum's member, where a namespace merges into the class or enum.
    if (!decl || ts.isClassElement(decl) || ts.isEnumMember(decl)) return null;
    if (ts.isModuleDeclaration(decl)) return this.namespacePath(decl);
    if (ts.isClassDeclaration(decl)) return this.className(decl);
    return this.qualifiedDecl(decl, target!.name) ?? this.unshadowed(e, decl, ident(this.topName(decl, target!.name)));
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
    // A spread reads what the array holds when it runs.
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => (ts.isSpreadElement(x) ? ts.isArrayLiteralExpression(x.expression) && this.pure(x.expression) : this.pure(x)));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? this.pure(p.initializer) && (!ts.isComputedPropertyName(p.name) || this.pure(p.name.expression)) : ts.isShorthandPropertyAssignment(p) ? this.pure(p.name) : ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return e.operator !== ts.SyntaxKind.PlusPlusToken && e.operator !== ts.SyntaxKind.MinusMinusToken && this.pure(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && this.pure(e.left) && this.pure(e.right);
    if (ts.isPropertyAccessExpression(e)) return this.pure(e.expression) && !(ts.isIdentifier(e.expression) && this.isLibGlobal(e.expression) && !LIB_CONSTANTS[`${e.expression.text}.${e.name.text}`]);
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every((a) => this.pure(a));
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every((a) => this.pure(a));
    return false;
  }

  /** Whether an initializer gives the same value whenever it runs: pure, reading nothing that can change except constants. */
  private constantInit(e: ts.Expression, seen = new Set<ts.Node>()): boolean {
    const c = (x: ts.Expression) => this.constantInit(x, seen);
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return c(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return !ts.isRegularExpressionLiteral(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isIdentifier(e)) {
      if (['undefined', 'NaN', 'Infinity'].includes(e.text)) return true;
      const sym = this.resolve(e);
      if (!sym) return false;
      if (sym.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.ValueModule)) return true;
      const d = sym.valueDeclaration;
      if (!d) return false;
      if (d.getSourceFile().isDeclarationFile) return isLibDeclaration(d) || !(sym.flags & ts.SymbolFlags.Variable) || !!(d.parent && d.parent.flags & ts.NodeFlags.Const);
      if (ts.isVariableDeclaration(d) && d.parent.flags & ts.NodeFlags.Const && d.initializer && !seen.has(d)) { seen.add(d); return c(d.initializer); }
      return false;
    }
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((x) => c(x.expression));
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => (ts.isSpreadElement(x) ? ts.isArrayLiteralExpression(x.expression) && c(x.expression) : c(x)));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? c(p.initializer) && !ts.isComputedPropertyName(p.name) : ts.isShorthandPropertyAssignment(p) ? c(p.name) : ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return e.operator !== ts.SyntaxKind.PlusPlusToken && e.operator !== ts.SyntaxKind.MinusMinusToken && c(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && c(e.left) && c(e.right);
    if (ts.isPropertyAccessExpression(e)) {
      const sym = this.resolve(e.name);
      const d = sym?.valueDeclaration;
      if (sym && sym.flags & ts.SymbolFlags.EnumMember) return true;
      if (d && (ts.isMethodDeclaration(d) || ts.isFunctionDeclaration(d) || ts.isClassDeclaration(d) || ts.isEnumDeclaration(d) || ts.isModuleDeclaration(d))) return c(e.expression);
      if (ts.isIdentifier(e.expression) && this.isLibGlobal(e.expression)) return !!LIB_CONSTANTS[`${e.expression.text}.${e.name.text}`];
      if (d && ts.isPropertyDeclaration(d) && isStatic(d) && hasModifier(d, ts.SyntaxKind.ReadonlyKeyword) && !!d.initializer && !seen.has(d)) { seen.add(d); return c(d.initializer); }
      return false;
    }
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every(c);
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
    const params = [...fields, ...allFields.filter((f) => f.symbol)].map((f) => `${overrides?.has(f.name) ? 'override ' : ''}var ${ident(f.name)}: ${f.type}${isNullable(f.type) ? ' = null' : ''}`);
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
    lines.push(`        get() = (jsOrder ?: listOf(${fields.map((f) => kotlinString(f.name)).join(', ')})).let { order -> order + (jsExtra?.jsKeys ?: listOf()).filter { it !in order } }.filter { key -> ${optional.length ? `when (key) { ${optional.map((f) => `${kotlinString(f.name)} -> ${ident(f.name)} != null`).join('; ')}; else -> true }` : 'true'} }`);
    // Keys set beyond the type's (`Object.assign(shape, more)`) are kept with the extra ones.
    lines.push(...this.dynamicMembers(fields, className, false, 'jsExtra?.jsGet(key)', '(jsExtra ?: JSObject().also { jsExtra = it }).jsSet(key, value)').slice(1));
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
  private dynamicMembers(fields: { name: string; type: string }[], className: string | null, inherits: boolean, fallbackGet = 'null', fallbackSet = '', symbols: { key: string; member: string; type: string }[] = [], methods: { name: string; params: string[]; ret: string }[] = []): string[] {
    const keys = fields.map((f) => (f.type.endsWith('?') ? `(if (${ident(f.name)} == null) listOf() else listOf(${kotlinString(f.name)}))` : `listOf(${kotlinString(f.name)})`));
    // A method read by name is a script function calling it with the arguments it is given.
    const method = (m: { name: string; params: string[]; ret: string }) => {
      const args = m.params.map((t, k) => this.fromAnyCode(`__a.getOrNull(${k})`, t, true));
      const call = `this.${ident(m.name)}(${args.join(', ')})`;
      return `        ${kotlinString(m.name)} -> jsFunction { __a -> ${m.ret === 'Unit' ? `${call}; null` : call} }`;
    };
    return [
      `    override val jsKeys: List<String> get() = ${[inherits ? 'super.jsKeys' : '', ...keys].filter(Boolean).join(' + ') || 'listOf()'}`,
      ...(symbols.length ? [`    override val jsSymbolKeys: List<String> get() = listOf(${symbols.map((f) => f.key).join(', ')})`] : []),
      `    override val jsClassName: String? get() = ${className ? kotlinString(className) : 'null'}`,
      `    override fun jsGet(key: String): Any? = when (key) {`,
      ...fields.map((f) => `        ${kotlinString(f.name)} -> this.${ident(f.name)}`),
      ...symbols.map((f) => `        ${f.key} -> this.${f.member}`),
      ...methods.filter((m) => !fields.some((f) => f.name === m.name)).map(method),
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
    const record = /^JSRecord<(.*)>(\??)$/.exec(type);
    if (record) return `${record[2] ? 'jsRecordOrNull' : 'jsRecord'}<${record[1]}>(${code})`;
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
    // A function held untyped (a script function, a method read by name): callable as the typed function.
    const fn = functionTypeParts(type.replace(/^\((.*)\)\?$/, '$1'));
    if (fn && fn.params.length <= 7) return /\)\?$/.test(type) ? `run { val __f = ${code}; if (jsIsNullish(__f)) null else (jsFunction${fn.params.length}(__f) as ${type}) }` : `(jsFunction${fn.params.length}(${code}) as ${type})`;
    return `(${code} as ${type})`;
  }

  private enumDecl(e: ts.EnumDeclaration, merged: string[] = []): string {
    const lines = [`object ${ident(e.name.text)} {`];
    for (const m of e.members) {
      const v = this.checker.getConstantValue(m);
      if (v === undefined) throw this.error(m, 'an enum member without a constant value');
      lines.push(`    const val ${ident(m.name.getText())}: ${typeof v === 'string' ? 'String' : 'Double'} = ${typeof v === 'string' ? kotlinString(v) : numberLiteral(String(v))}`);
    }
    // The object JavaScript makes of the enum: each name to its value, and each number back to its name.
    const entries = e.members.flatMap((m) => {
      const v = this.checker.getConstantValue(m)!, n = m.name.getText();
      const pair = `Pair<String, Any?>(${kotlinString(n)}, ${typeof v === 'string' ? kotlinString(v) : numberLiteral(String(v))})`;
      return typeof v === 'number' ? [pair, `Pair<String, Any?>(${kotlinString(String(v))}, ${kotlinString(n)})`] : [pair];
    });
    lines.push(`    val jsEnumObject: JSObject by lazy { JSObject(listOf<Pair<String, Any?>>(${entries.join(', ')})) }`);
    lines.push(...merged.map((l) => l.split('\n').map((x) => (x ? '    ' + x : x)).join('\n')));
    lines.push('}');
    return lines.join('\n');
  }

  // ---- Functions -----------------------------------------------------------------------------

  /**
   * An object or string parameter of a plugin, whose code is checked without
   * strictNullChecks: callers pass null and undefined for it (core's
   * `valueChanged(target, oldValue, newValue)` starts from undefined; ui-drawer
   * applies a closing drawer's data with no side).
   */
  private mayBeNull(p: ts.ParameterDeclaration): boolean {
    if (!this.pluginFiles.has(p.getSourceFile().fileName) || p.dotDotDotToken || !ts.isIdentifier(p.name)) return false;
    const t = this.typeOf(p.name);
    return !t.endsWith('?') && !['Double', 'Boolean', 'Unit', 'Nothing'].includes(t) && !isFunctionType(t) && (t === 'String' || this.isObjectType(t));
  }

  private params(fn: ts.SignatureDeclaration, closure: boolean): string {
    if (this.readsArguments(fn)) return '__arguments: JSArray<Any?>';
    return fn.parameters.map((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.dotDotDotToken) return `${name}: ${this.typeOf(p.name)}`;
      let t = this.typeOf(p.name);
      if (this.mayBeNull(p)) {
        const sym = this.checker.getSymbolAtLocation(p.name);
        if (sym) this.nullableDecls.add(sym);
        t = optionalType(t);
      }
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
    if (this.readsArguments(fn)) {
      // The parameters read from the arguments the call passed, undefined where it passed none.
      fn.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this')).forEach((p, k) => {
        if (!ts.isIdentifier(p.name)) throw this.error(p, 'a destructured parameter of a function reading `arguments`');
        const assigned = !!(fn as ts.FunctionLikeDeclaration).body && assignsTo((fn as ts.FunctionLikeDeclaration).body!, this.checker.getSymbolAtLocation(p.name), this.checker);
        const arg = `__arguments.storage.getOrNull(${k})`;
        const pt = this.typeOf(p.name);
        const declared = p.questionToken && !p.initializer ? optionalType(pt) : pt;
        const value = p.dotDotDotToken ? `JSArray(__arguments.storage.drop(${k}).map { ${this.fromAnyCode('it', pt.replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
          : p.initializer ? `(if (${arg} == null) ${this.coerce(p.initializer, pt)} else ${this.fromAnyCode(arg, pt, true)})`
          : this.fromAnyCode(arg, declared, true);
        lines.push(`${i}${assigned ? 'var' : 'val'} ${ident(p.name.text)}: ${declared} = ${value}`);
      });
      return lines;
    }
    fn.parameters.forEach((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      const closure = ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || (ts.isMethodDeclaration(fn) && ts.isObjectLiteralExpression(fn.parent));
      // A parameter the body assigns is a variable of its own (Kotlin parameters are constants).
      const assigned = ts.isIdentifier(p.name) && !!(fn as ts.FunctionLikeDeclaration).body && assignsTo((fn as ts.FunctionLikeDeclaration).body!, this.checker.getSymbolAtLocation(p.name), this.checker);
      if (p.initializer && !this.templateParams && (closure || !this.isConstant(p.initializer))) {
        lines.push(`${i}${assigned ? 'var' : 'val'} ${name}: ${this.typeOf(p.name)} = ${name} ?: ${this.coerce(p.initializer, this.typeOf(p.name))}`);
      } else if (assigned) {
        const sym = this.checker.getSymbolAtLocation(p.name);
        lines.push(`${i}var ${name}${sym && this.nullableDecls.has(sym) ? '' : `: ${this.typeOf(p.name)}`} = ${name}`);
      }
      // A destructured parameter the body assigns binds variables.
      const body = (fn as ts.FunctionLikeDeclaration).body;
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, name, '', !!body && boundNames(p.name).some((b) => assignsTo(body, this.checker.getSymbolAtLocation(b), this.checker))));
    });
    return lines;
  }

  returnTypeOf(fn: ts.SignatureDeclaration): string {
    return this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    if (this.pluginFiles.has(fn.getSourceFile().fileName)) return '';
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
    const params = modifiers.includes('override') ? this.params(fn, true) : this.params(fn, false);
    return `${modifiers}fun ${this.generics(fn)}${this.generics(fn) ? ' ' : ''}${name}(${params})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
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
        if (name === '$passed') {
          // The props the parent gave, for a spread that passes on only those.
          params.push('_passed: Set<String> = emptySet()');
          lines.push('    val _passed: Set<String> = _passed');
          continue;
        }
        if (!m.initializer) {
          // A prop the parent may leave out is undefined.
          params.push(`${ident(name)}: ${t}${m.questionToken && isNullable(t) ? ' = null' : ''}`);
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
  private overridden(cls: ts.ClassLikeDeclaration, implemented?: string[]): Set<string> {
    const out = new Set<string>();
    const c = this.checker;
    const addInterface = (h: ts.ExpressionWithTypeArguments) => {
      if (implemented && h.parent.parent === cls && !implemented.includes(h.expression.getText())) return;
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

  /**
   * Whether a class can implement an interface. A method whose untyped
   * parameters the interface types (`handle(error)` for `handle(error: Error)`)
   * implements it through a witness of the interface's signature that calls
   * it; any other difference leaves the interface out.
   */
  private protocolWitnesses(cls: ts.ClassLikeDeclaration, i: ts.ExpressionWithTypeArguments, out: string[], notOverrides: Set<string>): boolean {
    const decl = this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration);
    if (!decl || !this.protocols.has(i.expression.getText())) return true;
    const own = (name: string) => cls.members.find((x) => x.name?.getText() === name);
    const added: string[] = [];
    const skipped: string[] = [];
    for (const req of decl.members) {
      const name = req.name?.getText();
      const m = name ? own(name) : undefined;
      if (!name || !m || !ts.isMethodSignature(req)) continue;
      if (!ts.isMethodDeclaration(m)) return false;
      const want = req.parameters.map((p) => (p.questionToken ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name)));
      const have = m.parameters.map((p) => this.paramType(p));
      const ret = this.returnTypeOf(req), ownRet = this.returnTypeOf(m);
      if (want.length === have.length && want.every((t, k) => t === have[k]) && ret === ownRet) continue;
      if (want.length !== have.length || have.some((t, k) => t !== want[k] && t !== 'Any?') || (ret !== ownRet && ret !== 'Any?') || want.every((t, k) => t === have[k])) return false;
      const args = want.map((_, k) => `__p${k}`);
      const call = `${ident(name)}(${args.map((a, k) => (have[k] === want[k] ? a : `${a} as Any?`)).join(', ')})`;
      added.push(`    override fun ${ident(name)}(${want.map((t, k) => `${args[k]}: ${t}`).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} { ${ret === 'Unit' ? call : ownRet === 'Unit' ? `${call}; return null` : `return ${call}`} }`);
      skipped.push(name);
    }
    out.push(...added);
    for (const n of skipped) notOverrides.add(n);
    return true;
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const nativeSubclass = this.native?.classDecl(cls);
    if (nativeSubclass) return nativeSubclass;
    // A namespace's class is declared in its object, by its own name.
    const name = ts.isModuleBlock(cls.parent) ? ident(cls.name!.text) : this.className(cls);
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    if (service) {
      const { params, lines } = this.componentMembers(cls, []);
      return [`class ${name}(${params.join(', ')}) {`, ...lines, '', '    companion object {', `        val shared = ${name}()`, '    }', '}'].join('\n');
    }
    const c = this.checker;
    const plugin = this.pluginFiles.has(cls.getSourceFile().fileName);
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const baseDecl = heritage && c.getTypeAtLocation(heritage.expression).getSymbol()?.valueDeclaration;
    const appBase = baseDecl && ts.isClassLike(baseDecl) && !baseDecl.getSourceFile().isDeclarationFile ? baseDecl : undefined;
    // A core class the class extends (directly or through the app's and plugins' classes): kit-android's class of that name.
    const kitRoot = this.kitRootOf(cls);
    let base: string | null = null;
    if (heritage) {
      const baseName = heritage.expression.getText();
      if (appBase) base = this.type(c.getTypeAtLocation(heritage), heritage);
      else if (kitRoot && isCoreDeclaration(baseDecl as ts.Declaration)) base = kitRoot;
      else if (ERRORS[baseName]) base = ERRORS[baseName];
      else throw this.error(heritage, `extending ${baseName}`);
    }
    const isError = !!base && !appBase && !kitRoot;
    const isView = !!kitRoot && !!this.core?.isKitView(kitRoot);
    const registered = (n: string) => isView && !!this.properties?.isRegistered(cls, n);
    const abstract = hasModifier(cls, ts.SyntaxKind.AbstractKeyword);
    const open = this.extended.has(cls.name!.text) || this.extendedDecls.has(cls) || abstract;
    // The library's interfaces (`Iterable<T>`, `Iterator<T>`) are interfaces of the kit's, implemented below.
    const witnesses: string[] = [];
    const notOverrides = new Set<string>();
    const implemented = implementedInterfaces(this.checker, cls).filter((i) => !isLibDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0]))
      // An interface the class's signatures cannot meet is left out; untyped parameters meet it through a witness.
      .filter((i) => this.protocolWitnesses(cls, i, witnesses, notOverrides))
      .map((i) => i.expression.getText());
    for (const i of implemented) this.used.add(i);
    const ownToString = cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls);
    const supertypes = [...implemented, ...(ownToString ? ['JSStringConvertible'] : [])];
    if (!base && !implemented.length) supertypes.push('JSDynamic');
    const overridden = this.overridden(cls, implemented);
    for (const n of notOverrides) overridden.delete(n);
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
      // `[Symbol.toStringTag] = 'TextDecoder'`: what Object.prototype.toString reports.
      if (keyed?.member === 'jsToStringTag' && !isStatic(m) && m.initializer) {
        supertypes.push('JSToStringTag');
        lines.push(`    override var jsToStringTag: String = ${this.coerce(m.initializer, 'String')}`);
        continue;
      }
      if (keyed) throw this.error(m.name, 'a field named by this symbol');
      const n = m.name.getText();
      const t = this.typeOf(m.name);
      if (isStatic(m)) {
        this.indent = '        ';
        // An initializer reading changing state runs with the module's statements, where the class is defined; a companion's run when it is first used.
        if (m.initializer && this.staticInits && !this.constantInit(m.initializer)) {
          const st = t === 'Any?' || t.endsWith('?') || this.zero(t) ? t : optionalType(t);
          const ssym = c.getSymbolAtLocation(m.name);
          if (ssym && st !== t) this.nullableDecls.add(ssym);
          statics.push(`        var ${ident(n)}: ${st} = ${this.zero(t) ?? 'null'}`);
          this.indent = '    ';
          this.staticInits.push(`    ${name}.${ident(n)} = ${this.coerce(m.initializer, t)}`);
          continue;
        }
        const st = t === 'Any?' || t.endsWith('?') ? t : this.zero(t) || m.initializer ? t : optionalType(t);
        const ssym = c.getSymbolAtLocation(m.name);
        if (ssym && st !== t) this.nullableDecls.add(ssym);
        statics.push(`        var ${ident(n)}: ${st} = ${m.initializer ? this.coerce(m.initializer, t) : this.zero(t) ?? 'null'}`);
        this.indent = '    ';
        continue;
      }
      const nativeProperty = this.nativePropertyOf(m);
      if (nativeProperty) { lines.push(nativeProperty); continue; }
      const sym = c.getSymbolAtLocation(m.name);
      if (registered(n)) {
        // A field under a registered property's name is the property: core's accessor on the prototype.
        const kt = t === 'Any?' || t.endsWith('?') ? t : optionalType(t);
        if (sym && kt !== t) this.nullableDecls.add(sym);
        lines.push(`    ${mods(n)}var ${ident(n)}: ${kt}`, `        get() = ${this.fromAnyCode(`get(${kotlinString(n)})`, kt)}`, `        set(value) { set(${kotlinString(n)}, value) }`);
        if (m.initializer) {
          this.indent = '        ';
          lines.push('    init {', `        this.${ident(n)} = ${this.coerce(m.initializer, t)}`, '    }');
          this.indent = '    ';
        }
        continue;
      }
      // A field no subclass redeclares is a JVM field: its accessors would clash with methods of the same JVM names (`tag` and `getTag()`).
      const fieldMods = overridden.has(n) ? 'override ' : this.subclassFields(cls).has(n) ? 'open ' : plugin ? '@JvmField ' : mods(n);
      const nullInit = !!m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined'));
      if ((plugin || (!m.initializer && chainedThrough(cls, n))) && (nullInit || !m.initializer) && !t.endsWith('?') && t !== 'Any?' && t !== 'Unit') {
        // Unset (or `null`) in code checked without strictNullChecks: nullable, unwrapped where it is read.
        if (sym) this.nullableDecls.add(sym);
        fields.push({ name: n, type: optionalType(t) });
        lines.push(`    ${fieldMods}var ${ident(n)}: ${optionalType(t)} = null`);
        continue;
      }
      fields.push({ name: n, type: t });
      if (m.initializer) lines.push(`    ${fieldMods}var ${ident(n)}: ${t} = ${this.coerce(m.initializer, t)}`);
      else {
        const d = this.deferredDeclaration(ident(n), t);
        lines.push(`    ${d.startsWith('lateinit') && fieldMods === '@JvmField ' ? '' : fieldMods}${d}`);
      }
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
      if (baseCtor) lines.push(`    constructor(${this.params(baseCtor, false)}) : super(${this.readsArguments(baseCtor) ? '__arguments' : baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})`);
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
    // A view class's type selector: its `@CSSType` name, else its class name, as core's `cssType` falls back to `typeName`.
    if (isView) {
      const cssType = (ts.getDecorators(cls) ?? []).map((d) => d.expression).find((e): e is ts.CallExpression => ts.isCallExpression(e) && e.expression.getText() === 'CSSType');
      const typeName = cssType && ts.isStringLiteralLike(cssType.arguments[0]) ? cssType.arguments[0].text : cls.name!.text;
      lines.push(`    override val cssType: String get() = ${kotlinString(typeName)}`);
    }
    for (const d of ts.getDecorators(cls) ?? []) {
      if (!/^(CSSType|NativeClass|Injectable)\b/.test(d.expression.getText())) throw this.error(d, `the class decorator ${d.expression.getText()}`);
    }
    // `[fooProperty.setNative](value)`: the class's native setter for that registered property.
    const setters: { property: string; method: string; param: string }[] = [];
    for (const m of cls.members) {
      if (!ts.isMethodDeclaration(m) || !m.body || !ts.isComputedPropertyName(m.name)) continue;
      const property = this.setNativeOf(m.name.expression);
      if (!property) {
        if (!this.symbolMember(m.name)) throw this.error(m.name, 'a computed method name');
        continue;
      }
      const method = `__setNative_${property}`;
      setters.push({ property, method, param: m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Unit' });
      lines.push('    ' + this.func(m, method, open ? 'open ' : ''));
    }
    if (setters.length) {
      if (!isView) throw this.error(cls, 'native setters on a class that is not a view');
      lines.push('    override fun setProperty(name: String, value: Any?) {', '        when (name) {');
      for (const st of setters) {
        const call = st.param === 'Unit' ? `${st.method}()` : `${st.method}(${this.fromAnyCode('value', st.param, true)})`;
        // What a native setter throws is reported, as core reports an error applying a property.
        lines.push(`            ${kotlinString(st.property)} -> jsReport { ${call} }`);
      }
      lines.push('            else -> super.setProperty(name, value)', '        }', '    }');
    }
    // Members whose names a base class declares too.
    const inherited = new Set<string>();
    for (let b = appBase; b; b = this.baseClassOf(b)) for (const m of b.members) if (m.name) inherited.add(m.name.getText());
    const dynMethods: { name: string; params: string[]; ret: string }[] = [];
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && m.body && ts.isComputedPropertyName(m.name) && this.setNativeOf(m.name.expression)) continue;
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
      if (plugin && !inherited.has(n) && !(kitRoot && this.core?.kitMember(kitRoot, n)) && !this.isNamed(n)) continue;
      if (isStatic(m)) { this.indent = '        '; statics.push('        ' + this.func(m, ident(n))); this.indent = '    '; continue; }
      if (n === 'toString' && !m.parameters.length) { lines.push('    ' + this.func(m, 'toString', 'override ')); continue; }
      const kit = kitRoot && !inherited.has(n) ? this.core?.kitMember(kitRoot, n) : null;
      if (kit && kit.kind === 'func' && !kit.static) { lines.push(this.kitOverride(m, kit, open)); continue; }
      // An override whose parameters TypeScript types more narrowly than the method it overrides: the base's Kotlin signature.
      const base = inherited.has(n) ? this.inheritedMethod(cls, n) : undefined;
      if (base && (base.parameters.length !== m.parameters.length || base.parameters.some((p, k) => this.paramType(p) !== this.paramType(m.parameters[k])) || this.returnTypeOf(base) !== this.returnTypeOf(m))) {
        lines.push(this.appOverride(m, base));
        continue;
      }
      lines.push('    ' + this.func(m, ident(n), mods(n)));
      // A plugin's objects are read untyped too (`handler.attachToView(view)` on an `any`): their methods by name.
      if (plugin && !m.parameters.some((p) => p.dotDotDotToken)) dynMethods.push({ name: n, params: m.parameters.map((p) => this.paramType(p)), ret: this.returnTypeOf(m) });
    }
    if (isView) {
      const own = fields.map((f) => f.name);
      if (own.length) lines.push(`    override fun hasJSProperty(name: String): Boolean = name in setOf(${own.map(kotlinString).join(', ')}) || super.hasJSProperty(name)`);
    }
    const protocol = this.iteratorProtocol(cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && !isStatic(m) && ['next', 'return', 'throw'].includes(m.name.getText())).map((m) => ({
      name: m.name.getText(), params: m.parameters.length, ret: this.returnTypeOf(m),
    })));
    if (protocol && !appBase) { supertypes.push(protocol.conformance); lines.push(...protocol.lines); }
    lines.push(...witnesses);
    if (!isError) lines.push(...this.dynamicMembers(fields, name, !!appBase || !!kitRoot, 'null', '', symbolFields, dynMethods));
    if (symbolFields.length) supertypes.push('JSSymbolKeyed');
    statics.push(...this.mergedStatics.map((l) => l.split('\n').map((x) => (x ? '        ' + x : x)).join('\n')));
    this.mergedStatics = [];
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

  private subclassFieldNames: Map<ts.Node, Set<string>> | null = null;

  /** The fields some subclass of `cls` (in the program) declares again. */
  private subclassFields(cls: ts.ClassLikeDeclaration): Set<string> {
    if (!this.subclassFieldNames) {
      const map = new Map<ts.Node, Set<string>>();
      for (const sf of this.sourceFiles) {
        const visit = (n: ts.Node) => {
          if (ts.isClassLike(n)) {
            const names = n.members.filter(ts.isPropertyDeclaration).map((m) => m.name.getText());
            for (let b = this.baseClassOf(n); b; b = this.baseClassOf(b)) {
              const set = map.get(b) ?? new Set<string>();
              for (const name of names) set.add(name);
              map.set(b, set);
            }
          }
          ts.forEachChild(n, visit);
        };
        visit(sf);
      }
      this.subclassFieldNames = map;
    }
    return this.subclassFieldNames.get(cls) ?? new Set();
  }

  /** A parameter's Kotlin type as `params` declares it. */
  private paramType(p: ts.ParameterDeclaration): string {
    const t = this.typeOf(p.name);
    if (p.questionToken || (p.initializer && !this.templateParams)) return p.initializer && this.isConstant(p.initializer) ? t : optionalType(t);
    return this.mayBeNull(p) ? optionalType(t) : t;
  }

  /** Member names the program's code reads anywhere, and the string fragments it builds names from. */
  private namesUsed: { names: Set<string>; fragments: string[] } | null = null;

  /** Whether code could reach a member of this name: read by name, or built from a string (`this[side + 'LayoutChanged']`). */
  private isNamed(member: string): boolean {
    if (!this.namesUsed) {
      const names = new Set<string>();
      const fragments = new Set<string>();
      for (const sf of this.sourceFiles) {
        const visit = (n: ts.Node) => {
          if (ts.isPropertyAccessExpression(n)) names.add(n.name.text);
          if (ts.isIdentifier(n) && !ts.isMethodDeclaration(n.parent)) names.add(n.text);
          if (ts.isStringLiteralLike(n)) { names.add(n.text); if (n.text.length >= 4) fragments.add(n.text); }
          ts.forEachChild(n, visit);
        };
        visit(sf);
      }
      this.namesUsed = { names, fragments: [...fragments] };
    }
    const { names, fragments } = this.namesUsed;
    return names.has(member) || fragments.some((f) => member.startsWith(f) || member.endsWith(f));
  }

  /**
   * A field decorated with a native-property decorator (gesturehandler's
   * `@nativeProperty`): a decorator that defines, with `Object.defineProperty`,
   * a getter reading `this.native[getterName]()` (else `this.options[key]`,
   * else the default) and a setter writing `this.options[key]` and calling
   * `this.native[setterName](value)`, each through an optional converter.
   * The accessor goes through the native object by name.
   */
  private nativePropertyOf(m: ts.PropertyDeclaration): string | null {
    const d = (ts.getDecorators(m) ?? [])[0];
    if (!d) return null;
    const call = ts.isCallExpression(d.expression) ? d.expression : null;
    const fnName = call ? call.expression : d.expression;
    const fn = this.resolve(fnName)?.declarations?.find((x): x is ts.FunctionDeclaration => ts.isFunctionDeclaration(x) && !!x.body);
    if (!fn) throw this.error(d, `the property decorator ${d.expression.getText()}`);
    const file = fn.getSourceFile();
    const generator = file.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && !!s.body && /Object\.defineProperty\(\s*target\s*,\s*key\s*,\s*\{\s*get:\s*\w+\(key, options\),\s*set:\s*\w+\(key, options\)/.test(s.body.getText()));
    const getter = generator && /get:\s*(\w+)\(/.exec(generator.body!.getText())?.[1];
    const setter = generator && /set:\s*(\w+)\(/.exec(generator.body!.getText())?.[1];
    const bodyOf = (name?: string) => file.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)?.body?.getText() ?? '';
    if (!generator || !/this\.native\[nativeGetterName\]\(\)/.test(bodyOf(getter)) || !/this\.options\[key\] = newVal/.test(bodyOf(setter)) || !fn.body!.getText().includes(generator.name!.text)) {
      throw this.error(d, `the property decorator ${d.expression.getText()} (not a native-property decorator this build recognizes)`);
    }
    const key = m.name.getText();
    const options = call?.arguments[0] && ts.isObjectLiteralExpression(call.arguments[0]) ? call.arguments[0] : undefined;
    const option = (o: ts.ObjectLiteralExpression | undefined, name: string) => o?.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === name)?.initializer;
    const android = option(options, 'android');
    const own = android && ts.isObjectLiteralExpression(android) ? android : options;
    const text = (e?: ts.Expression) => (e && ts.isStringLiteralLike(e) ? e.text : null);
    const cap = key[0].toUpperCase() + key.slice(1);
    const getterName = text(option(own, 'nativeGetterName')) ?? `get${cap}`;
    const setterName = text(option(own, 'nativeSetterName')) ?? `set${cap}`;
    const converter = option(options, 'converter');
    const fromNative = converter && ts.isObjectLiteralExpression(converter) ? option(converter, 'fromNative') : undefined;
    const toNative = converter && ts.isObjectLiteralExpression(converter) ? option(converter, 'toNative') : undefined;
    const fallback = option(options, 'defaultValue');
    const t = optionalType(this.typeOf(m.name));
    const read = `jsNativePropertyGet(this.native, ${kotlinString(getterName)}, jsOr(jsField(this.options, ${kotlinString(key)}), ${fallback ? this.coerce(fallback, 'Any?') : 'null'}))`;
    const converted = fromNative ? `jsCall(${this.coerce(fromNative, 'Any?')}, ${read}, ${kotlinString(key)})` : read;
    const write = toNative ? `jsCall(${this.coerce(toNative, 'Any?')}, value, ${kotlinString(key)})` : 'value';
    return [
      `    var ${ident(key)}: ${t}`,
      `        get() = ${this.fromAnyCode(converted, t)}`,
      '        set(__value) {',
      '            val value: Any? = __value',
      `            jsReport { jsSet(this.options, ${kotlinString(key)}, value) }`,
      `            jsReport { jsNativePropertySet(this.native, ${kotlinString(setterName)}, ${write}) }`,
      '        }',
    ].join('\n');
  }

  /**
   * A mixin class (`applyMixins(View, [ViewGestureExtended])`): its methods
   * extend the core class; its native-view lifecycle methods run as hooks
   * when a view of that class sets up and disposes its native view; its
   * native setters are the class's setters for those properties. Its fields
   * are not copied by the mixin: the methods keep them on the view by name.
   */
  private mixinDecl(cls: ts.ClassDeclaration, target: string): string {
    const name = cls.name!.text;
    const lines: string[] = [];
    const hooks: { init?: string; dispose?: string } = {};
    const setters: string[] = [];
    const members: string[] = [];
    this.indent = '';
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m)) {
        const n = m.name.getText();
        const t = optionalType(this.typeOf(m.name));
        const sym = this.checker.getSymbolAtLocation(m.name);
        if (sym && t !== this.typeOf(m.name)) this.nullableDecls.add(sym);
        lines.push(`var ${target}.${ident(n)}: ${t}`, `    get() = ${this.fromAnyCode(`this.jsGet(${kotlinString(n)})`, t)}`, `    set(value) { this.jsSet(${kotlinString(n)}, value) }`);
        continue;
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const t = this.returnTypeOf(m);
        const n = m.name.getText();
        lines.push(`val ${target}.${ident(n)}: ${t}`, `    get() ${this.functionBody(m, t, '    ')}`);
        // Read by name too (`this.findRootView(view)?.registry` on what core types as a view).
        members.push(`    View.mixinMembers[${kotlinString(n)}] = { view -> (view as? ${target})?.${ident(n)} }`);
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      if (ts.isComputedPropertyName(m.name)) {
        const property = this.setNativeOf(m.name.expression);
        if (!property) throw this.error(m.name, 'a computed method name');
        const param = m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Unit';
        lines.push(this.func(m, `${target}.__setNative_${property}`));
        setters.push(`    View.nativeSetterHooks[${kotlinString(property)}] = { view, value -> (view as? ${target})?.__setNative_${property}(${param === 'Unit' ? '' : this.fromAnyCode('value', param, true)}) }`);
        continue;
      }
      const n = m.name.getText();
      if (n === 'initNativeView' || n === 'disposeNativeView') {
        lines.push(this.func(m, `${target}.__${name}_${n}`));
        hooks[n === 'initNativeView' ? 'init' : 'dispose'] = `{ view -> jsReport { (view as? ${target})?.__${name}_${n}() } }`;
        continue;
      }
      lines.push(this.func(m, `${target}.${ident(n)}`));
      if (!m.parameters.length) {
        const ret = this.returnTypeOf(m);
        members.push(`    View.mixinMembers[${kotlinString(n)}] = { view -> jsFunction { (view as? ${target})?.${ident(n)}()${ret === 'Unit' ? '; null' : ''} } }`);
      }
    }
    lines.push('', `fun __install_${name}() {`);
    if (hooks.init || hooks.dispose) lines.push(`    View.lifecycleHooks.add(View.LifecycleHook(${hooks.init ?? 'null'}, ${hooks.dispose ?? 'null'}))`);
    lines.push(...setters, ...members, '}');
    return lines.join('\n');
  }

  /** The core class at the root of a class's chain of app and plugin classes, when kit-android has it. */
  kitRootOf(cls: ts.ClassLikeDeclaration): string | null {
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      if (!h) return null;
      const d = this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      if (d && isCoreDeclaration(d) && ts.isClassLike(d) && d.name) {
        const kit = Object.hasOwn(KIT_NAMES_ANDROID, d.name.text) ? KIT_NAMES_ANDROID[d.name.text] : d.name.text;
        if (this.core?.has(kit)) return kit;
      }
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return null;
  }

  /** The Kotlin name of a class the program declares. */
  private className(decl: ts.ClassLikeDeclaration): string {
    return decl.name ? this.topName(decl, decl.name.text).split('.').map(ident).join('.') : 'AnonymousClass';
  }

  /** `fooProperty.setNative`: the registered name of the property it belongs to. */
  setNativeOf(e: ts.Expression): string | null {
    if (!ts.isPropertyAccessExpression(e) || e.name.text !== 'setNative') return null;
    return this.properties?.name(this.resolve(e.expression)) ?? null;
  }

  /** The kit class a mixin class (`applyMixins(View, [Extended])`) is applied to. */
  mixinOf(sym: ts.Symbol | undefined): string | null {
    const d = sym?.valueDeclaration;
    return d && ts.isClassDeclaration(d) ? this.patterns.mixinTarget(d) : null;
  }

  /**
   * A method overriding kit-android's: the kit's Kotlin signature, the
   * TypeScript body seeing its own types; what it throws is reported, as an
   * error escaping a native callback is.
   */
  private kitOverride(m: ts.MethodDeclaration, kit: { type: string; params?: string }, open: boolean): string {
    const kitParams = (kit.params ?? '').trim() ? splitTopLevel(kit.params!) : [];
    const parsed = kitParams.map((p, k) => {
      const colon = p.indexOf(':');
      const type = withoutDefault(p.slice(colon + 1)).trim();
      return { decl: `__k${k}: ${type}`, type };
    });
    const tsRet = this.returnTypeOf(m);
    const ret = kit.type.trim();
    const binds = m.parameters.map((p, k) => {
      const tsType = this.typeOf(p.name);
      const value = parsed[k] ? this.convert(`__k${k}`, parsed[k].type, tsType) : (this.zero(tsType) ?? 'null');
      return ts.isIdentifier(p.name) ? `        val ${ident(p.name.text)}: ${tsType} = ${value}` : '';
    }).filter(Boolean);
    const body = this.inFunction(tsRet, () => this.functionBody(m, tsRet, '        '));
    const call = `(fun(): ${tsRet} ${body})()`;
    const result = ret === 'Unit'
      ? `        jsReport { ${call} }`
      : `        val __result: ${tsRet} = ${call}\n        return ${this.convert('__result', tsRet, ret)}`;
    return [`    override fun ${ident(m.name.getText())}(${parsed.map((p) => p.decl).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} {`, ...binds, result, '    }'].join('\n');
  }

  /** Kotlin code of type `from` where Kotlin needs `to`. */
  convert(code: string, from: string, to: string): string {
    if (from === to || to === 'Any?') return code;
    if (from === 'Any?') return this.fromAny(code, to);
    if (to === optionalType(from)) return code;
    if (from === optionalType(to)) return `${code}!!`;
    const numeric = /^(Int|Long|Float|Short|Byte)\??$/.exec(from);
    if (numeric && to.startsWith('Double')) return from.endsWith('?') ? `${code}?.toDouble()` : `${code}.toDouble()`;
    // One object shape where another is declared (a wider shape an override returns): not a subclass, read by its keys.
    const shape = to.replace(/\?$/, '');
    if (from.replace(/\?$/, '') !== shape && (this.interfaces.has(shape) || [...this.shapes.values()].some((s) => s.name === shape))) return this.fromAny(code, to);
    if (this.isObjectType(from) && this.isObjectType(to) && from.replace(/\?$/, '') !== to.replace(/\?$/, '')) return `(${code} as ${to})`;
    return code;
  }

  /** The method of this name a class's app or plugin base classes declare. */
  private inheritedMethod(cls: ts.ClassLikeDeclaration, name: string): ts.MethodDeclaration | undefined {
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) {
      const m = b.members.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && x.name.getText() === name);
      if (m) return m;
    }
    return undefined;
  }

  /** An override taking the overridden method's Kotlin parameters, bound to its own as TypeScript types them. */
  private appOverride(m: ts.MethodDeclaration, base: ts.MethodDeclaration): string {
    const baseTypes = base.parameters.map((p) => this.paramType(p));
    const baseRet = this.returnTypeOf(base);
    const ret = this.returnTypeOf(m);
    const binds = m.parameters.map((p, k) => {
      if (!ts.isIdentifier(p.name)) return '';
      const own = this.paramType(p);
      const sym = this.checker.getSymbolAtLocation(p.name);
      if (sym && this.mayBeNull(p)) this.nullableDecls.add(sym);
      const value = k < baseTypes.length ? this.convert(`__o${k}`, baseTypes[k], own) : (this.zero(own) ?? 'null');
      return `        val ${ident(p.name.text)}: ${own} = ${value}`;
    }).filter(Boolean);
    const body = this.inFunction(ret, () => this.functionBody(m, ret, '        '));
    const call = `(fun()${ret === 'Unit' ? '' : `: ${ret}`} ${body})()`;
    const result = baseRet === 'Unit' ? `        ${call}` : `        return ${this.convert(call, ret, baseRet)}`;
    return [`    override fun ${ident(m.name.getText())}(${baseTypes.map((t, k) => `__o${k}: ${t}`).join(', ')})${baseRet === 'Unit' ? '' : `: ${baseRet}`} {`, ...binds, result, '    }'].join('\n');
  }

  private baseClassOf(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  }

  /**
   * A shape only a library or a plugin declares (an options interface, a
   * class its `.d.ts` describes): an untyped JavaScript object, as the code
   * that declared it treats it. The app's own interfaces keep their classes,
   * and so do the core types kit-android models.
   */
  private isDynamicShape(sym: ts.Symbol): boolean {
    const decls = sym.declarations ?? [];
    if (!decls.length) return false;
    const sf = decls[0].getSourceFile();
    const shape = decls.every((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d) || ts.isTypeLiteralNode(d) || (ts.isClassDeclaration(d) && d.getSourceFile().isDeclarationFile));
    if (!shape || sf.fileName.startsWith('/__shims__/') || this.native?.isNativeDeclaration(decls[0]) || /[\\/]typescript[\\/]lib[\\/]/.test(sf.fileName)) return false;
    if (isCoreDeclaration(decls[0])) return decls.every((d) => !ts.isClassDeclaration(d)) && !this.core?.has(sym.name) && !this.isEventDataSymbol(sym);
    return this.pluginFiles.has(sf.fileName) || sf.isDeclarationFile;
  }

  private isEventDataSymbol(sym: ts.Symbol): boolean {
    const t = this.checker.getDeclaredTypeOfSymbol(sym);
    return sym.name === 'EventData' || (t.isClassOrInterface() && this.isEventData(t));
  }

  /** The class an interface extends, when it extends exactly one and adds nothing Kotlin could not read by name. */
  private extendedClass(t: ts.Type): ts.Type | null {
    if (!t.isClassOrInterface()) return null;
    const bases = this.checker.getBaseTypes(t as ts.InterfaceType);
    if (bases.length !== 1 || !(bases[0].getSymbol()?.flags! & ts.SymbolFlags.Class)) return null;
    return bases[0];
  }

  /** A member script adds to a native object (`nativeView.nsView`): declared by the code itself, not by the SDK. */
  private isExpando(e: ts.PropertyAccessExpression): boolean {
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    if (!decl || !(ts.isPropertySignature(decl) && ts.isTypeLiteralNode(decl.parent))) return false;
    const target = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    return [target, ...(target.isIntersection() ? target.types : [])].some((t) => !!this.native?.type(t));
  }

  /**
   * The name a translated declaration has: an import renamed (`install as
   * installGestureHandler`) names its export, and a module-level name that
   * several modules declare is the module's own (`topName`).
   */
  private declaredName(e: ts.Identifier): string {
    const local = this.checker.getSymbolAtLocation(e);
    if (!local) return e.text;
    const alias = !!(local.flags & ts.SymbolFlags.Alias);
    const target = alias ? this.checker.getAliasedSymbol(local) : local;
    const decl = target.valueDeclaration;
    if (decl && this.topNames().has(decl)) return this.topNames().get(decl)!;
    if (!alias || !decl || decl.getSourceFile().isDeclarationFile || target.name === 'default' || target.flags & ts.SymbolFlags.ValueModule) return e.text;
    return target.name;
  }

  /** A module-level function, class or variable's Kotlin name. */
  topName(decl: ts.Node, name: string): string {
    return this.topNames().get(decl) ?? name;
  }

  private renamedTop: Map<ts.Node, string> | null = null;
  /**
   * Module-level functions, classes and variables of the same name in several
   * modules (a plugin's `install` in its common and Android files): all but
   * one take the module's name as a suffix, as the app's Kotlin is one package.
   */
  private topNames(): Map<ts.Node, string> {
    if (this.renamedTop) return this.renamedTop;
    const byName = new Map<string, { decl: ts.Node; file: ts.SourceFile }[]>();
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const add = (name: string, decl: ts.Node) => {
        const list = byName.get(name) ?? [];
        if (!list.some((x) => x.file === sf)) list.push({ decl, file: sf });
        else if (ts.isFunctionDeclaration(decl)) list.find((x) => x.file === sf)!.decl = decl.body ? decl : list.find((x) => x.file === sf)!.decl;
        byName.set(name, list);
      };
      for (const st of sf.statements) {
        if (ts.isClassDeclaration(st) && st.name) add(st.name.text, st);
        if (ts.isModuleDeclaration(st) && ts.isIdentifier(st.name) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) add(st.name.text, st);
        if (ts.isFunctionDeclaration(st) && st.name) add(st.name.text, st);
        if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) add(d.name.text, d);
      }
    }
    this.renamedTop = new Map();
    for (const [name, list] of byName) {
      // A plugin class named as a kit-android class (one extending core's `Observable`) takes its module's name too.
      const kitClash = list.some((x) => ts.isClassDeclaration(x.decl)) && !!this.core?.has(name);
      if (list.length < 2 && !kitClash) continue;
      // The app's declaration keeps its name; plugin modules' take theirs.
      const keep = kitClash ? undefined : list.find((x) => !this.pluginFiles.has(x.file.fileName)) ?? list[0];
      for (const x of list) {
        if (x === keep || !this.pluginFiles.has(x.file.fileName)) continue;
        const module = x.file.fileName.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/\W/g, '_');
        this.renamedTop.set(x.decl, `${name}__${module}`);
        // Every declaration of an overloaded function names the same Kotlin function.
        if (ts.isFunctionDeclaration(x.decl)) for (const st of x.file.statements) if (ts.isFunctionDeclaration(st) && st.name?.text === name) this.renamedTop.set(st, `${name}__${module}`);
      }
    }
    // A class a namespace declares is the namespace's nested class.
    const nested = (md: ts.ModuleDeclaration) => {
      if (!md.body || !ts.isModuleBlock(md.body)) return;
      for (const st of md.body.statements) {
        if (ts.isClassDeclaration(st) && st.name) this.renamedTop!.set(st, `${this.namespacePath(md)}.${st.name.text}`);
        if (ts.isModuleDeclaration(st)) nested(st);
      }
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) for (const st of sf.statements) if (ts.isModuleDeclaration(st)) nested(st);
    return this.renamedTop;
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

  /** Variables a function declared before them reads: declared first, assigned where they are declared. */
  private forwardDeclared = new Set<ts.VariableDeclaration>();

  statements(list: ts.Statement[]): string[] {
    const hoisted = list.filter((s, k) => ts.isFunctionDeclaration(s) && usedBefore(list, k));
    const forward: string[] = [];
    list.forEach((st, k) => {
      if (!ts.isVariableStatement(st)) return;
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name) || !d.initializer) continue;
        const sym = this.checker.getSymbolAtLocation(d.name);
        let early = false;
        const visit = (n: ts.Node, inFn: boolean) => {
          if (early) return;
          if (inFn && ts.isIdentifier(n) && n !== d.name && this.checker.getSymbolAtLocation(n) === sym) { early = true; return; }
          ts.forEachChild(n, (c) => visit(c, inFn || ts.isFunctionLike(c)));
        };
        list.forEach((other, j) => { if (j < k || hoisted.includes(other)) visit(other, ts.isFunctionLike(other)); });
        if (!early) continue;
        this.forwardDeclared.add(d);
        forward.push(`${this.indent}${this.deferredDeclaration(ident(d.name.text), this.typeOf(d.name))}`);
      }
    });
    return [...forward, ...[...hoisted, ...list.filter((s) => !hoisted.includes(s))].map((s) => this.stmt(s)).filter(Boolean)];
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
      if (!s.expression) return this.returnType.endsWith('?') ? `${i}return null` : `${i}return`;
      if (this.returnType === 'Unit') return `${i}${this.exprStatement(s.expression)}\n${i}return`;
      return `${i}return ${this.coerce(s.expression, this.returnType)}`;
    }
    if (ts.isIfStatement(s)) {
      // A condition the parameters' constant values decide: only the branch that runs.
      const fixed = this.reach?.constant(s.expression);
      if (fixed !== undefined) {
        const live = fixed ? s.thenStatement : s.elseStatement;
        return live ? `${i}run ${this.block(live)}` : '';
      }
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
    const extension = this.native?.extensionClass(d);
    if (extension) return extension;
    if (this.patterns.requiredCore(d) || this.native?.isClassAlias(d)) return '';
    if (ts.isIdentifier(d.name)) {
      const t = this.typeOf(d.name);
      const name = ident(d.name.text);
      if (this.forwardDeclared.has(d)) return `${i}${name} = ${this.coerce(d.initializer!, t)}`;
      // `var m` again in the same block: the same variable, assigned.
      if (redeclaredVar(d, this.checker)) return d.initializer ? `${i}${name} = ${this.coerce(d.initializer, t)}` : '';
      const nullInit = !!d.initializer && (d.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d.initializer) && d.initializer.text === 'undefined'));
      if ((nullInit || (!d.initializer && !lowered)) && this.pluginFiles.has(d.getSourceFile().fileName) && !t.endsWith('?') && this.isObjectType(t)) {
        // Unset (or `null`) in code checked without strictNullChecks: nullable, unwrapped where it is read.
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}var ${name}: ${optionalType(t)} = null`;
      }
      // A plugin's copy of a value declared nullable (`const side = this.mShowingSide`): nullable as well.
      if (d.initializer && !lowered && this.pluginFiles.has(d.getSourceFile().fileName) && !t.endsWith('?') && t !== 'Any' && this.declaredTypeOf(d.initializer)?.endsWith('?')) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.coerce(d.initializer, optionalType(t))}`;
      }
      // A plugin's object variable that code assigns again (`parent = parent.parent` until there is none): nullable as well.
      if (d.initializer && !constant && !lowered && this.pluginFiles.has(d.getSourceFile().fileName) && !t.endsWith('?') && this.isObjectType(t) && !isFunctionType(t)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}var ${name}: ${optionalType(t)} = ${this.coerce(d.initializer, optionalType(t))}`;
      }
      if (!d.initializer) return `${i}${lowered || !t.endsWith('?') ? this.deferredDeclaration(name, t) : `var ${name}: ${t} = null`}`;
      // A function that calls itself: declared first, so its body can name it.
      if ((ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) && refersTo(d.initializer, this.checker.getSymbolAtLocation(d.name), this.checker)) {
        return `${i}lateinit var ${name}: ${t}\n${i}${name} = ${this.coerce(d.initializer, t)}`;
      }
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
        const record = /^JSRecord<(.*)>$/.exec(this.typeOf(name).replace(/\?$/, ''));
        read = this.isAny(name) ? `jsGet(${value}, ${kotlinString(key)})` : record ? this.undefinedAs(`${value}[${kotlinString(key)}]`, ts.isIdentifier(el.name) ? this.typeOf(el.name) : record[1]) : `${value}.${ident(key)}`;
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
    if (this.typeOf(e) === 'Any?') return `jsIteratorOf(${this.expr(e)}).jsCollect()`;
    const t = this.typeOf(e).replace(/\?$/, '');
    if (t === 'String') return `jsCodePoints(${this.expr(e)})`;
    if (t.startsWith('JSMap<')) return `${this.expr(e)}.entries()`;
    if (t === 'JSMatch') return `${this.expr(e)}.values`;
    if (t.startsWith('Pair<') || t.startsWith('Triple<')) return `jsTupleList(${this.expr(e)})`;
    // An untyped value: whatever its iteration gives, a TypeError where it has none.
    if (this.typeOf(e) === 'Any?') return `jsIteratorOf(${this.expr(e)}).jsCollect()`;
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
    // A match reads its values as an array does.
    const js = ts.isArrayBindingPattern(name) && !/^JSMatch\??$/.test(this.typeOf(init)) ? this.jsIteration(init) : null;
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
    const replaced = this.patterns.prototypeMethod(e);
    if (replaced) {
      // A Page's native view made by a plugin (gesturehandler's PageLayout): the kit's factory hook, `this` the page.
      if (replaced.target !== 'Page' || replaced.method !== 'createNativeView') throw this.error(e, `replacing ${replaced.target}.prototype.${replaced.method}`);
      const ret = this.returnTypeOf(replaced.fn);
      return `Page.nativeViewFactory = fun Page.(): ${ret} ${this.functionBody(replaced.fn, ret, this.indent)}`;
    }
    // Assigning a class alias its class (`PageLayout = com.….PageLayout`): its uses already name the class.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(e.left)) {
      const decl = this.resolve(e.left)?.valueDeclaration;
      if (decl && ts.isVariableDeclaration(decl) && this.native?.isClassAlias(decl)) return '';
    }
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
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !this.subst.has(e)) return this.binary(e);
    return this.expr(e);
  }

  tryPrefix(_e: ts.Node): string {
    return '';
  }

  /** An expression where Kotlin needs a value of `target`. */
  coerce(e: ts.Expression, target: string): string {
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text) && !e.arguments?.length && /^JS(Map|Set)</.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    while (ts.isParenthesizedExpression(e) && (ts.isArrowFunction(e.expression) || ts.isFunctionExpression(e.expression) || ts.isParenthesizedExpression(e.expression))) e = e.expression;
    if (target.endsWith('?')) {
      let x = e;
      while (ts.isParenthesizedExpression(x)) x = x.expression;
      this.nullOk.add(x);
    }
    const source = this.typeOf(e);
    // An iterable where the type names only its iteration: the kit's iterable of it.
    const iterableSlot = /^JS(Async)?Iterable<.*>\??$/.exec(target);
    if (iterableSlot && !/^JS(Async)?(Iterable|Iterator|Generator)</.test(source)) return `${iterableSlot[1] ? 'jsAsyncIterable' : 'jsIterable'}(${this.expr(e)})`;
    if (target.endsWith('?') && target !== 'Any?' && !source.endsWith('?')) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?') {
      // Null kept as untyped values hold it, apart from undefined.
      let bare = e;
      while (ts.isParenthesizedExpression(bare)) bare = bare.expression;
      if (bare.kind === ts.SyntaxKind.NullKeyword) return 'jsNull';
      if (ts.isConditionalExpression(bare) && [bare.whenTrue, bare.whenFalse].some((x) => x.kind === ts.SyntaxKind.NullKeyword)) {
        return `(if (${this.cond(bare.condition)}) ${this.coerce(bare.whenTrue, 'Any?')} else ${this.coerce(bare.whenFalse, 'Any?')})`;
      }
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
    {
      // A function value taking fewer parameters than the slot passes (JavaScript ignores the rest).
      const f = functionTypeParts(source.replace(/^\((.*)\)\?$/, '$1'));
      const g = functionTypeParts(target.replace(/^\((.*)\)\?$/, '$1'));
      // A declared function where one of fewer parameters is wanted: called by name, so the rest take their defaults.
      const decl = f && g && f.params.length > g.params.length && ts.isIdentifier(e) ? this.resolve(e)?.valueDeclaration : undefined;
      if (decl && ts.isFunctionDeclaration(decl) && decl.body && !decl.getSourceFile().isDeclarationFile && decl.parameters.slice(g!.params.length).every((p) => (p.questionToken || p.initializer) && !p.dotDotDotToken)) {
        const names = g!.params.map((_, k) => `__a${k}`);
        const call = `${ident((e as ts.Identifier).text)}(${names.map((n, k) => this.convert(n, g!.params[k], f!.params[k])).join(', ')})`;
        return `{ ${g!.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${g!.ret === 'Unit' ? `${call}; Unit` : call} }`;
      }
      if (f && g && f.params.length <= g.params.length && (f.params.length < g.params.length || f.params.some((p, k) => p !== g.params[k] && this.convert('x', g.params[k], p) !== 'x')) && f.params.length <= g.params.length && (g.ret === 'Unit' || g.ret === f.ret)) {
        const names = g.params.map((_, k) => `__a${k}`);
        const fn = this.functionValue(e);
        const call = `${fn.includes('::') ? `(${fn})` : fn}(${names.slice(0, f.params.length).map((n, k) => this.convert(n, g.params[k], f.params[k])).join(', ')})`;
        const adapter = `{ ${g.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${g.ret === 'Unit' ? `${call}; Unit` : call} }`;
        return /\)\?$/.test(source) ? `${this.expr(e)}?.let { __f -> ${adapter.replace(fn.includes('::') ? `(${fn})` : fn, '__f')} }` : adapter;
      }
    }
    if (/^JSArray<.*>$/.test(source) && /^JSArray<.*>\??$/.test(target) && source !== target.replace(/\?$/, '') && source === 'JSArray<Any?>') return `(${this.expr(e)} as ${target})`;
    // A value TypeScript's strict typing calls possibly undefined where the code expects one (checked without strictNullChecks).
    if (source === optionalType(target) && target !== 'Any?' && !isNullable(target) && !isFunctionType(target)) return this.undefinedAs(this.expr(e), target);
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
  functionValue(e: ts.Expression): string {
    if (ts.isIdentifier(e)) {
      const decl = this.resolve(e)?.valueDeclaration;
      if (decl && ts.isFunctionDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) return `::${ident(e.text)}`;
    }
    if (ts.isPropertyAccessExpression(e) && this.namespaceMember(e)) {
      const decl = this.resolve(e.name)?.valueDeclaration;
      if (decl && ts.isFunctionDeclaration(decl)) {
        const ref = this.namespaceMember(e)!;
        const dot = ref.lastIndexOf('.');
        return dot < 0 ? `::${ref}` : `${ref.slice(0, dot)}::${ref.slice(dot + 1)}`;
      }
    }
    return this.expr(e);
  }

  /** A condition: Kotlin needs a Boolean where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    let x = e;
    while (ts.isParenthesizedExpression(x)) x = x.expression;
    if (ts.isBinaryExpression(x) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(x.operatorToken.kind) && !(this.isBool(x.left) && this.isBool(x.right))) {
      return `(${this.cond(x.left)} ${x.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? '&&' : '||'} ${this.cond(x.right)})`;
    }
    if (ts.isPrefixUnaryExpression(x) && x.operator === ts.SyntaxKind.ExclamationToken) return `!(${this.cond(x.operand)})`;
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsTruthy(${maybe})`;
    return this.isBool(e) ? this.expr(e) : `jsTruthy(${this.expr(e)})`;
  }

  // ---- Expressions -----------------------------------------------------------------------------

  expr(e: ts.Expression): string {
    const s = this.subst.get(e);
    if (s) return s;
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    // `return (s += x)`: a compound assignment's value is its target after it (Kotlin's assignment has none).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind >= ts.SyntaxKind.FirstCompoundAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastCompoundAssignment && !statementLevel(e)) {
      return `run { ${this.binary(e)}; ${this.expr(e.left)} }`;
    }
    // `(info.name = v)` as a value: the value assigned, evaluated once (Kotlin's assignment has none).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !statementLevel(e) && !ts.isArrayLiteralExpression(e.left) && !this.subst.has(e.right)) {
      const t = this.typeOf(e.right) === 'Unit' ? 'Any?' : this.typeOf(e.right);
      const v = this.fresh('__assigned');
      const value = this.coerce(e.right, t);
      this.subst.set(e.right, v);
      try {
        return `run { val ${v}: ${t} = ${value}; ${this.binary(e)}; ${v} }`;
      } finally { this.subst.delete(e.right); }
    }
    if (ts.isNumericLiteral(e)) return numberLiteral(e.text);
    if (ts.isBigIntLiteral(e)) return `JSBigInt.literal(${kotlinString(e.text.replace(/n$/, ''))})`;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return kotlinString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (e.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (e.kind === ts.SyntaxKind.NullKeyword) return this.typeOf(e) === 'Any?' && !this.optionalContext(e) ? 'jsNull' : 'null';
    if (e.kind === ts.SyntaxKind.ThisKeyword) return this.thisAlias ?? 'this';
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
      const shared = this.uncheckedCast(e);
      if (shared) return `(${this.expr(e.expression)} as ${shared})`;
      if (from === 'Any?' && to !== 'Any?') return this.fromAny(this.expr(e.expression), to);
      if (from !== to && from.replace(/\?$/, '') !== to.replace(/\?$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) return `(${this.expr(e.expression)} as ${to})`;
      if (from.endsWith('?') && !to.endsWith('?') && from.replace(/\?$/, '') === to) return `${this.expr(e.expression)}!!`;
      return this.expr(e.expression);
    }
    // `f<T>`: the function, its type arguments only TypeScript's.
    if (ts.isExpressionWithTypeArguments(e)) return this.functionValue(e.expression);
    if (ts.isNonNullExpression(e)) {
      const maybe = this.maybeUndefined(e.expression);
      if (maybe) return `${maybe}!!`;
      const inner = this.expr(e.expression);
      return this.typeOf(e.expression).endsWith('?') || this.declaredTypeOf(e.expression)?.endsWith('?') ? `${inner}!!` : inner;
    }
    if (ts.isPropertyAccessExpression(e)) {
      const member = this.namespaceMember(e);
      // A namespace's class as a value: the class.
      const decl = member ? this.resolve(e.name)?.valueDeclaration : undefined;
      if (decl && ts.isClassDeclaration(decl)) return `${member}::class.java`;
      return member ? this.narrowed(e, member) : this.property(e);
    }
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
      if (ts.isElementAccessExpression(target) && (this.isAny(target.expression) || this.isObjectRef(target.expression))) return `jsDelete(${this.expr(target.expression)}, ${this.propertyKey(target.argumentExpression)})`;
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

  private argumentsReaders = new Map<ts.Node, boolean>();
  /** Whether a function reads its `arguments`: it then takes the call's arguments as one list, and its parameters read from it. */
  readsArguments(fn: ts.SignatureDeclaration): boolean {
    if (!('body' in fn) || !fn.body || ts.isArrowFunction(fn)) return false;
    let found = this.argumentsReaders.get(fn);
    if (found !== undefined) return found;
    found = false;
    const visit = (n: ts.Node) => {
      if (found || (n !== fn.body && ts.isFunctionLike(n) && !ts.isArrowFunction(n)) || ts.isClassLike(n)) return;
      if (ts.isIdentifier(n) && this.isArguments(n)) found = true;
      ts.forEachChild(n, visit);
    };
    visit(fn.body);
    this.argumentsReaders.set(fn, found);
    return found;
  }

  /** The `arguments` of the function around, not a variable of that name. */
  private isArguments(e: ts.Node): boolean {
    if (!ts.isIdentifier(e) || e.text !== 'arguments') return false;
    const sym = this.checker.getSymbolAtLocation(e);
    return !!sym && !sym.declarations?.length;
  }

  private identifier(e: ts.Identifier): string {
    // `parseInt`, `parseFloat` as values: functions taking the parameters their slot gives (`map` passes an index, parseInt's radix).
    if ((e.text === 'parseInt' || e.text === 'parseFloat') && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && this.resolve(e)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) {
      const context = this.checker.getContextualType(e);
      const slot = (context && this.checker.getNonNullableType(context).getCallSignatures()[0]) ?? this.checker.getTypeAtLocation(e).getCallSignatures()[0];
      const types = (slot?.getParameters() ?? []).map((p) => {
        const t = this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e);
        return p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.questionToken ? optionalType(t) : t;
      });
      const params = (types.length ? types : ['String']).map((t, k) => `__p${k}: ${k === 0 ? 'String' : t}`);
      const radix = types.length > 1 ? '__p1' : 'null';
      return `{ ${params.join(', ')} -> ${e.text === 'parseInt' ? `jsParseInt(__p0, ${radix})` : 'jsParseFloat(__p0)'} }`;
    }
    const name = e.text;
    if (this.isArguments(e)) {
      const fn = ts.findAncestor(e.parent, (n) => ts.isFunctionLike(n) && !ts.isArrowFunction(n)) as ts.SignatureDeclaration | undefined;
      if (!fn || !this.readsArguments(fn) || ts.isFunctionExpression(fn)) throw this.error(e, '`arguments` of a function expression');
      return '__arguments';
    }
    if (name === 'undefined') return 'null';
    if (name === 'NaN') return 'Double.NaN';
    if (name === 'Infinity') return 'Double.POSITIVE_INFINITY';
    const native = this.native?.identifier(e);
    if (native) return native;
    const sym = this.resolve(e);
    // An iOS API an Android build reaches: undefined at run time, as in NativeScript on Android.
    if (sym?.declarations?.length && sym.declarations.every((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return `jsUndefinedGlobal(${kotlinString(name)})`;
    const required = this.patterns.requiredCore(sym?.valueDeclaration);
    if (required) return `${KIT_NAMES_ANDROID[required] ?? required}::class.java`;
    // A function core exports (`booleanConverter`) used as a value: kit-android's function of that name.
    if (sym && sym.flags & ts.SymbolFlags.Function && isCoreDeclaration(sym.declarations?.[0]) && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) return `::${name}`;
    const p = e.parent;
    if (sym && sym.flags & ts.SymbolFlags.Class && !(ts.isPropertyAccessExpression(p) && p.expression === e) && !(ts.isNewExpression(p) && p.expression === e)
        && !(ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && p.right === e) && !ts.isHeritageClause(p.parent ?? p)) {
      // A class used as a value (`prop.register(Drawer)`, `registerElement('drawer', Drawer)`): its Java class.
      const decl = sym.valueDeclaration;
      const kit = decl && isCoreDeclaration(decl) ? (KIT_NAMES_ANDROID[sym.name] ?? sym.name) : null;
      return `${kit ?? ident(this.declaredName(e))}::class.java`;
    }
    return this.narrowed(e, this.globalAlias(e) ?? this.refName(e));
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
    if (declared === optionalType(actual)) return this.nullTolerant(e) ? code : `${code}!!`;
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && (this.isObjectRef(e) || ['Double', 'String', 'Boolean'].includes(actual))) return `(${code} as ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isParenthesizedExpression(e)) return this.lvalue(e.expression);
    if (ts.isPropertyAccessExpression(e) && this.isSelf(e.expression) && this.props.has(e.name.text)) return `this.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e)) {
      const member = this.namespaceMember(e);
      if (member) return member;
      const core = this.core?.lvalue(e);
      if (core) return core;
      const target = this.typeOf(e.expression).endsWith('?') ? `${this.expr(e.expression)}!!` : this.expr(e.expression);
      return `${target}.${ident(e.name.text)}`;
    }
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return this.globalAlias(e) ?? this.refName(e);
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
    if (this.isExpando(e)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, t, true);
    }
    const native = this.native?.property(e);
    if (native) return native;
    const base = this.typeOf(target);
    // An event's data beyond its name, object and value (a drawer's `side`): read by key.
    if (base === 'EventData' && !['value', 'item', 'eventName', 'object', 'index', 'view', 'type', 'state', 'deltaX', 'deltaY', 'scale', 'rotation', 'direction', 'action', 'newValue'].includes(name)) {
      const t = this.typeOf(e);
      const code = `${this.expr(target)}.jsGet(${kotlinString(name)})`;
      return t === 'Any?' ? code : this.fromAnyCode(code, t, true);
    }
    // Inside an optional chain (`a?.b.c`) an undefined link ends the chain.
    const inChain = !!(e.flags & ts.NodeFlags.OptionalChain) && base.endsWith('?');
    const dot = e.questionDotToken || inChain ? '?.' : '.';
    const recv = () => this.receiver(target, name) ?? (base.endsWith('?') && !e.questionDotToken && !inChain ? `${this.expr(target)}!!` : this.expr(target));
    if (name === 'length' && this.isString(target)) {
      return e.questionDotToken || inChain ? `${this.expr(target)}?.length?.toDouble()` : `${recv()}.length.toDouble()`;
    }
    if (name === 'length' && (base.startsWith('Pair<') || base.startsWith('Triple<'))) return base.startsWith('Pair<') ? '2.0' : '3.0';
    if (this.isAny(target)) {
      const t = this.typeOf(e);
      const code = `${e.questionDotToken || inChain ? 'jsGetOptional' : 'jsGet'}(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, isCompared(e) ? optionalType(t) : t);
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
    if (symbol && symbol.flags & ts.SymbolFlags.Method && !called && !this.isFunctionField(symbol)) return `${recv()}::${ident(name)}`;
    return this.narrowed(e, `${recv()}${dot}${ident(name)}`);
  }

  /** A method an object type declares, which its class for object literals holds as a function-typed field. */
  private isFunctionField(symbol: ts.Symbol): boolean {
    return !!symbol.declarations?.length && symbol.declarations.every((d) => {
      if (!ts.isMethodSignature(d)) return false;
      const owner = ts.isInterfaceDeclaration(d.parent) ? d.parent.name.text : ts.isTypeLiteralNode(d.parent) && ts.isTypeAliasDeclaration(d.parent.parent) ? d.parent.parent.name.text : null;
      return !!owner && this.interfaces.has(owner) && !this.protocols.has(owner);
    });
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
    const key = e.argumentExpression;
    // `Enum[name]`, `Enum[value]`: the object JavaScript makes of the enum, by key.
    const enumDecl = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (enumDecl && ts.isEnumDeclaration(enumDecl) && !enumDecl.getSourceFile().isDeclarationFile && !ts.isStringLiteral(key) && !isWriteTarget(e)) {
      const rt = this.typeOf(e);
      const code = `${this.expr(e.expression)}.jsEnumObject.jsGet(${this.propertyKey(key)})`;
      return rt === 'Any?' ? code : this.fromAny(code, rt);
    }
    const target = this.expr(e.expression);
    const t = this.typeOf(e.expression).replace(/\?$/, '');
    const q = e.questionDotToken ? '?' : '';
    if (t === 'String') return `jsCharAt(${target}, ${this.toNumber(key)})`;
    if (t.startsWith('JSArray<')) {
      if (isWriteTarget(e)) return `${target}${q}[${this.toNumber(key)}]`;
      // An untyped element the checker narrows (`Array.isArray(xs[0])`): read as the narrowed type.
      const rt = this.typeOf(e);
      if (t === 'JSArray<Any?>' && rt !== 'Any?') return this.fromAny(this.maybeUndefined(e)!, rt);
      return this.undefinedAs(this.maybeUndefined(e)!, rt);
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
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, isCompared(e) ? optionalType(rt) : rt);
    }
    if (ts.isStringLiteral(key)) return `${target}${q}.${ident(key.text)}`;
    const keyed = ts.isIdentifier(key) && this.typeOf(key) === 'JSSymbol' ? this.checker.getTypeAtLocation(e.expression).getProperties().find((p) => {
      const n = p.valueDeclaration && (p.valueDeclaration as ts.NamedDeclaration).name;
      return !!n && ts.isComputedPropertyName(n) && this.resolve(n.expression) === this.resolve(key);
    }) : undefined;
    if (keyed) return `${target}${q}.__symbol_${(key as ts.Identifier).text}`;
    // `x[Symbol.toStringTag]` on a class declaring it (a field or a getter).
    const tag = ts.isPropertyAccessExpression(key) && key.name.text === 'toStringTag' && ts.isIdentifier(key.expression) && key.expression.text === 'Symbol' && this.isLibGlobal(key.expression);
    if (tag && !isWriteTarget(e) && this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)).getProperties().some((p) => wellKnownMember(p.escapedName.toString()) === 'jsToStringTag')) return `${target}${q}.jsToStringTag`;
    // A computed key on an object (`this[side + 'Drawer']`): its members by name.
    if (this.isObjectRef(e.expression)) {
      const code = `jsGet(${target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, rt, true);
    }
    throw this.error(e, 'indexing this type');
  }

  /**
   * An expression that may be undefined though TypeScript types it as its element
   * (`xs[i]` past the end, or a variable holding one), as a Kotlin nullable; null otherwise.
   */
  private maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (this.subst.has(e)) return null;
    // `a?.b as T` from an untyped value: undefined where the chain stops, whatever the assertion says.
    if (ts.isAsExpression(e) && ts.isOptionalChain(e.expression) && this.typeOf(e.expression) === 'Any?' && !isNullable(this.typeOf(e))) {
      return this.fromAny(this.expr(e.expression), optionalType(this.typeOf(e)));
    }
    // A key of a dictionary-typed object, read before its type's zero stands in for a missing one.
    if ((ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) && !e.questionDotToken && !isWriteTarget(e)
        && /^JSRecord<.*>$/.test(this.typeOf(e.expression)) && !this.typeOf(e).endsWith('?')) {
      const key = ts.isPropertyAccessExpression(e) ? kotlinString(e.name.text) : this.str(e.argumentExpression);
      return `${this.expr(e.expression)}[${key}]`;
    }
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
    // An overload's call is the implementation's in Kotlin: its parameters take the arguments.
    const impl = sig?.getDeclaration() && implementationOf(sig.getDeclaration());
    const params = impl ? impl.parameters.map((p) => this.checker.getSymbolAtLocation(p.name)!).filter(Boolean) : sig?.getParameters() ?? [];
    const target = impl ?? sig?.getDeclaration();
    if (target && !ts.isJSDocSignature(target) && this.readsArguments(target)) return [this.packed(all, 'JSArray<Any?>')];
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
      // A plugin's object parameter is nullable in Kotlin: what is passed needs no unwrap.
      if (decl && ts.isParameter(decl) && appDeclared && !!(decl.parent as ts.FunctionLikeDeclaration).body && this.mayBeNull(decl)) pt = optionalType(pt);
      const constantDefault = !!decl && ts.isParameter(decl) && !!decl.initializer && this.isConstant(decl.initializer) && appDeclared && !this.templateParams;
      if (decl && ts.isParameter(decl) && (decl.questionToken || decl.initializer) && appDeclared && !constantDefault) pt = optionalType(pt);
      // An argument that may be undefined where Kotlin's parameter has the constant default JavaScript would use.
      if (constantDefault && this.typeOf(a) === optionalType(pt)) { out.push(`(${this.coerce(a, optionalType(pt))} ?: ${this.coerce((decl as ts.ParameterDeclaration).initializer!, pt)})`); continue; }
      out.push(this.coerce(a, pt));
    }
    if (restAt >= 0 && appDeclared && list.length <= restAt) out.push(`${this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name)}()`);
    const decl = sig?.getDeclaration();
    if (count === undefined && decl && !ts.isJSDocSignature(decl) && (ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl) || ts.isArrowFunction(decl) || ts.isFunctionExpression(decl))) {
      for (let k = list.length; k < params.length; k++) {
        const pt = this.type(this.checker.getTypeOfSymbolAtLocation(params[k], e), e);
        out.push(pt === 'Unit' ? 'Unit' : 'null');
      }
    }
    return out;
  }

  /** The arguments of a call on an untyped value, after its leading ones: each, or with spreads, all spread from one list. */
  private untypedArgs(args: readonly ts.Expression[]): string {
    if (args.some(ts.isSpreadElement)) return `, *${this.packed(args, 'JSArray<Any?>')}.storage.toTypedArray()`;
    return args.map((a) => `, ${this.coerce(a, 'Any?')}`).join('');
  }

  /** Arguments (spreads included) as one `JSArray` of `arrayType`. */
  private packed(items: readonly ts.Expression[], arrayType: string): string {
    const el = arrayType.replace(/^JSArray<(.*)>$/, '$1');
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of items) {
      if (ts.isSpreadElement(x) && ts.isArrayLiteralExpression(x.expression) && !x.expression.elements.some(ts.isSpreadElement)) run.push(...x.expression.elements.map((y) => this.coerce(y, el)));
      else if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`listOf<${el}>(${run.join(', ')})`); run = []; }
        const list = `(${this.iterable(x.expression)}).toList()`;
        // A tuple's elements are untyped in Kotlin.
        parts.push(/^(Pair|Triple)</.test(this.typeOf(x.expression)) ? `(${list} as List<${el}>)` : list);
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
    // `getWindow<UIWindow>?.()`: the type arguments are only TypeScript's, and a function declaration is always there.
    const declaredFunction = (x: ts.Expression) => ts.isIdentifier(x) && !!this.resolve(x)?.declarations?.some(ts.isFunctionDeclaration);
    if (ts.isExpressionWithTypeArguments(callee) && (!e.questionDotToken || declaredFunction(callee.expression))) return this.call(ts.factory.updateCallExpression(e, callee.expression, callee.typeArguments, e.arguments));
    if (e.questionDotToken && this.isAny(callee)) return `jsCallOptional(${this.expr(callee)}${this.untypedArgs(e.arguments)})`;
    if (e.questionDotToken && !this.core?.isKitMethod(callee) && !declaredFunction(callee)) return `${this.expr(callee)}?.invoke(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) return this.core?.call(e) ?? this.globalCall(callee, e);
    const nsMember = ts.isPropertyAccessExpression(callee) ? this.namespaceMember(callee) : null;
    if (nsMember) {
      const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
      const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
      return `${this.narrowed(callee, nsMember)}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
    }
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    if (isObjectToStringCall(callee, this.checker)) return `jsObjectToString(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : 'null'})`;
    if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) {
      const unwrap = /^\(.*\)\?$/.test(this.declaredTypeOf(callee) ?? '') ? '!!' : '';
      return `this.${ident(callee.name.text)}.value${unwrap}(${this.args(e, this.arity(e)).join(', ')})`;
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
      // `String.fromCharCode.apply(_, codes)`, `Math.max.apply(_, xs)`: the library function of the list's elements.
      if (method === 'apply' && e.arguments.length === 2 && this.pure(e.arguments[0]) && ts.isPropertyAccessExpression(target) && ts.isIdentifier(target.expression) && this.isLibGlobal(target.expression)) {
        const listed = ({ 'String.fromCharCode': 'jsFromCharCodeList', 'Math.max': 'jsMathMaxList', 'Math.min': 'jsMathMinList' } as Record<string, string>)[`${target.expression.text}.${target.name.text}`];
        if (listed) return `${listed}(${this.coerce(e.arguments[1], 'Any?')})`;
      }
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      const core = this.core?.call(e) ?? this.native?.call(e);
      if (core) return core;
      if (this.isAny(target)) {
        const code = `${callee.questionDotToken ? 'jsCallMethodIfPresent' : 'jsCallMethod'}(${this.expr(target)}, ${kotlinString(method)}${this.untypedArgs(e.arguments)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' || callee.questionDotToken ? code : this.fromAnyCode(code, rt, true);
      }
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
      // `this.method.bind(this)`: the method, bound to its object.
      if (method === 'bind' && e.arguments.length === 1 && e.arguments[0].kind === ts.SyntaxKind.ThisKeyword && ts.isPropertyAccessExpression(target) && target.expression.kind === ts.SyntaxKind.ThisKeyword) {
        return `${this.expr(target.expression)}::${ident(target.name.text)}`;
      }
      // A property holding an optional function, called (`this.onDone(x)` after a check TypeScript does not keep).
      const held = this.checker.getSymbolAtLocation(callee.name)?.valueDeclaration;
      const optionalFn = !!held && (ts.isPropertyDeclaration(held) || ts.isPropertySignature(held)) && /^\(.*\)\?$/.test(this.declaredTypeOf(callee) ?? '') && isFunctionType((this.declaredTypeOf(callee) ?? '').slice(1, -2));
      const checked = !callee.questionDotToken ? this.receiver(target, method) : null;
      const call = `${checked ?? `${this.expr(target)}${q === '!!' ? '!!' : q ? '?' : ''}`}.${ident(method)}${optionalFn ? '!!' : ''}(${this.args(e, this.arity(e)).join(', ')})`;
      // An override taking its base's signature gives what the base's result type holds.
      const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
      if (decl && ts.isMethodDeclaration(decl) && decl.body && ts.isClassLike(decl.parent) && !q) {
        let root: ts.MethodDeclaration = decl;
        for (let b = this.inheritedMethod(root.parent as ts.ClassLikeDeclaration, method); b; b = this.inheritedMethod(b.parent as ts.ClassLikeDeclaration, method)) root = b;
        const emitted = this.returnTypeOf(root), own = this.typeOf(e);
        if (root !== decl && emitted !== 'Unit' && emitted !== this.returnTypeOf(decl)) return this.convert(this.fromPluginCall(e, call), emitted, own);
      }
      return this.fromPluginCall(e, call);
    }
    if (ts.isElementAccessExpression(callee) && isSymbolIterator(callee.argumentExpression, this.checker) && !e.arguments.length) return this.iteratorCode(callee.expression);
    if (ts.isElementAccessExpression(callee)) {
      const property = this.setNativeOf(callee.argumentExpression);
      if (property) return `${this.expr(callee.expression)}.__setNative_${property}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
      if (this.typeOf(callee) === 'Any?') return `jsCall(${this.expr(callee)}${this.untypedArgs(e.arguments)})`;
    }
    let fn: ts.Expression = callee;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    // `(function () { … })()`: the function, called.
    if (ts.isFunctionExpression(fn) || ts.isArrowFunction(fn)) return `(${this.closure(fn)})(${this.args(e).join(', ')})`;
    // `(value as F)(…)`: the value read as the function type, called (the factory would parenthesize the cast again).
    if (ts.isParenthesizedExpression(callee) && (ts.isAsExpression(callee.expression) || ts.isTypeAssertionExpression(callee.expression) || ts.isSatisfiesExpression(callee.expression))) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    if (ts.isParenthesizedExpression(callee)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    // A function read from a record may be missing: calling it then throws, as calling undefined does.
    if (ts.isElementAccessExpression(callee) && /^JSRecord</.test(this.typeOf(callee.expression))) return `jsCallable(${this.expr(callee)})(${this.args(e).join(', ')})`;
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    throw this.error(e, 'call');
  }

  /** A call of a plugin function Kotlin types more loosely (a generic result is `Any?`): the value as the call site's type. */
  private fromPluginCall(e: ts.CallExpression, code: string): string {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl) || !this.pluginFiles.has(decl.getSourceFile().fileName)) return code;
    const declared = this.returnTypeOf(decl as ts.SignatureDeclaration);
    const site = this.typeOf(e);
    return declared === 'Any?' && site !== 'Any?' && site !== 'Unit' ? this.fromAnyCode(code, site, true) : code;
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
    const mixed = this.patterns.isMixinCall(e);
    if (mixed) return mixed.map((c) => `__install_${c.name!.text}()`).join('; ');
    const declFile = this.resolve(callee)?.declarations?.[0]?.getSourceFile().fileName ?? '';
    if (callee.text === 'renderNativeScriptApp' && /[\\/]@nativescript-community[\\/]octane[\\/]/.test(declFile)) return this.octaneRoot(e);
    if (callee.text === 'useSyncExternalStore' && /[\\/](octane|@nativescript-community[\\/]octane)[\\/]/.test(declFile)) {
      // One subscription per call site: its listener bumps a version every reader tracks, then the snapshot is read.
      const [subscribe, snapshot] = e.arguments;
      const site = `${e.getSourceFile().fileName}:${e.getStart()}`;
      const bare = (x: ts.Expression) => { while (ts.isParenthesizedExpression(x)) x = x.expression; return x; };
      const read = this.functionValue(bare(snapshot));
      return `jsExternalStore(${kotlinString(site)}, ${this.functionValue(bare(subscribe))}) { ${read.startsWith('::') ? read.slice(2) : `(${read})`}() }`;
    }
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
        case 'unescape': return `jsUnescape(${this.str(arg(0))})`;
      }
      // `Error('x')` constructs as `new Error('x')` does.
      if (ERRORS[name]) return this.errorValue(name, e.arguments);
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve(${resolvers.type === 'Unit' ? 'Unit' : 'null'})`;
      if (this.isPromiseType(this.typeOf(arg(0)))) return `${resolvers.name}.resolvePromise(${this.expr(arg(0))})`;
      return `${resolvers.name}.resolve(${this.coerce(arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
    const fnType = this.declaredTypeOf(callee) ?? this.typeOf(callee);
    // A function held untyped (one of several function types): called as script calls it.
    if (fnType === 'Any?' || this.typeOf(callee) === 'Any?') {
      const code = `jsCall(${this.expr(callee)}${this.untypedArgs(e.arguments)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
    }
    const own = this.refName(callee);
    const qualified = this.appModule && shadowedByMember(e, this.resolve(callee)?.declarations?.[0], own, ident) ? `${this.appModule}.${own}` : own;
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
        if (e.arguments.some(ts.isSpreadElement)) return `${fn}(*${this.packed(e.arguments, 'JSArray<Any?>')}.storage.toTypedArray())`;
        return `${fn}(${e.arguments.map((x) => this.coerce(x, 'Any?')).join(', ')})`;
      }
      case 'JSON':
        if (method === 'parse') return `jsJSONParse(${this.expr(arg(0))})`;
        // Undefined, a function or a symbol stringifies to undefined.
        if (method === 'stringify') return this.undefinedAs(`jsJSONStringify(${this.coerce(arg(0), 'Any?')}${arg(2) ? `, ${this.coerce(arg(2), 'Any?')}` : ''})`, T());
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
        // `Object.create(null)`: the runtime's objects inherit no keys, so an empty one.
        if (method === 'create' && arg(0)?.kind === ts.SyntaxKind.NullKeyword && e.arguments.length === 1) return 'JSObject()';
        if (method === 'defineProperty') {
          const d = arg(2);
          const code = `jsDefineProperty(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'assign') {
          // The target is an open JavaScript object: a literal there is untyped, so the sources' keys all land.
          const target = ts.isObjectLiteralExpression(arg(0)) ? this.dynamicObject(arg(0) as ts.ObjectLiteralExpression) : this.coerce(arg(0), 'Any?');
          const code = `jsAssign(${[target, ...e.arguments.slice(1).map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
          return T() === 'Any?' ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'is') return `jsSameValue(${this.coerce(arg(0), 'Any?')}, ${this.coerce(arg(1), 'Any?')})`;
        break;
      }
      case 'Array':
        if (method === 'create') {
          const native = this.native?.call(e);
          if (native) return native;
        }
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
        // `Array.apply(thisArg, list)`: `Array(...list)`, a length when the list is one number.
        if (method === 'apply' && e.arguments.length === 2) {
          const made = `jsArrayConstruct(${this.coerce(arg(1), 'JSArray<Any?>')}.storage)`;
          return T() === 'JSArray<Any?>' ? made : this.fromAny(made, T());
        }
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

  /** `renderNativeScriptApp(host, Component, props)`: the component rendered into the host as Octane's root. */
  private octaneRoot(e: ts.CallExpression): string {
    const [host, component, props] = e.arguments;
    const name = component && ts.isIdentifier(component) ? component.text : '';
    const info = this.components.get(name) as (ComponentInfo & { optional?: string[] }) | undefined;
    if (!info) throw this.error(e, `rendering ${component?.getText() ?? 'nothing'}: not a component`);
    if (props && !ts.isObjectLiteralExpression(props)) throw this.error(props, 'root props other than an object literal');
    const given = new Map<string, ts.Expression>();
    for (const p of (props as ts.ObjectLiteralExpression | undefined)?.properties ?? []) {
      if (ts.isPropertyAssignment(p)) given.set(p.name.getText(), p.initializer);
      else if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, p.name);
      else throw this.error(p, 'a root prop');
    }
    const args = info.props.flatMap((p) => {
      const v = given.get(p);
      if (!v) {
        if (info.optional?.includes(p)) return [];
        throw this.error(e, `rendering ${name} without its prop ${p}`);
      }
      return [`${ident(p)} = ${this.coerce(v, this.typeOf(v))}`];
    });
    return `OctaneRoot(${this.expr(host)}) { ${name}(${args.join(', ')}).render() }`;
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
      sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround', clz32: 'jsClz32',
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
      case 'toLocaleString': if (!e.arguments.length) return `${t}.toLocaleString()`; break;
      case 'toString': return `${t}.join()`;
      case 'flat': return e.arguments.length || !/^JSArray<JSArray</.test(this.typeOf(target)) ? `${t}.flatAny(${e.arguments[0] ? this.toNumber(e.arguments[0]) : ''})` : `${t}.flat()`;
      case 'splice': {
        if (e.arguments.slice(2).some(ts.isSpreadElement)) return `${t}.spliceAll(${e.arguments.slice(0, 2).map((x) => this.toNumber(x)).join(', ')}, ${this.packed(e.arguments.slice(2), `JSArray<${element}>`)}.storage)`;
        const parts = [...e.arguments.slice(0, 2).map((x) => this.toNumber(x)), ...e.arguments.slice(2).map((x) => this.coerce(x, element))];
        return `${t}.splice(${parts.join(', ')})`;
      }
      case 'fill': return `${t}.fill(${[this.coerce(e.arguments[0], element), ...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'slice': case 'at': return `${t}.${name}(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
      case 'indexOf': case 'lastIndexOf': case 'includes': return `${t}.${name}(${[this.coerce(e.arguments[0], optionalType(element)),...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'join': return `${t}.join(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      case 'concat':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.concatSpread(${this.packed(e.arguments, `JSArray<${element}>`)}.storage)`;
        return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.expr(x) : `jsArrayOf<${element}>(${this.coerce(x, element)})`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap': {
        const f = e.arguments[0];
        const arity = ts.isArrowFunction(f) || ts.isFunctionExpression(f) ? Math.max(1, f.parameters.length) : this.functionArity(f);
        const ret = name === 'forEach' ? 'Unit' : ['map', 'flatMap'].includes(name) ? null : 'Boolean';
        const slot = ret ? `(${[element, 'Double', `JSArray<${element}>`].slice(0, Math.min(3, arity)).join(', ')}) -> ${ret}` : undefined;
        const code = this.ignoringThisArg(e, target, `${t}.${name}(${this.fn(f, slot)})`);
        // A type-guard filter or find (`(s): s is Circle => …`): its elements as the guard narrows them.
        const own = this.typeOf(e);
        if (name === 'filter' && /^JSArray<\w+>$/.test(own) && own !== `JSArray<${element}>`) return `(${code} as ${own})`;
        if (name === 'find' && /^\w+\??$/.test(own) && own.replace(/\?$/, '') !== element.replace(/\?$/, '') && own !== 'Any?') return `(${code} as ${own.endsWith('?') ? own : own + '?'})`;
        return code;
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

  /** An array method's call with a thisArg its callback ignores: the thisArg is still evaluated, before the call. */
  private ignoringThisArg(e: ts.CallExpression, target: ts.Expression, code: string): string {
    const [callback, thisArg] = e.arguments;
    if (!thisArg) return code;
    if (!ignoresThisArg(callback, thisArg, this.checker)) throw this.error(e, 'a thisArg its callback reads');
    const quiet = (x: ts.Expression): boolean => x.kind === ts.SyntaxKind.ThisKeyword || this.pure(x) || (ts.isPropertyAccessExpression(x) && quiet(x.expression));
    if (quiet(thisArg)) return code;
    // Evaluated before the receiver, which must not tell.
    if (!quiet(target)) throw this.error(thisArg, 'a thisArg beside a receiver with effects');
    return `run { ${this.exprStatement(thisArg)}; ${code} }`;
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
      case 'substr': return `jsSubstr(${t}, ${first ? n(0) : '0.0'}${opt(1)})`;
      case 'match': return `jsMatch(${t}, jsRegExpFrom(${first ? this.coerce(first, 'Any?') : 'null'}))`;
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
        // A function value: called with the match, each group (undefined where it took no part), the match's index and the string.
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second)) && this.checker.getTypeAtLocation(second).getCallSignatures().length) {
          if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
          return `${fn}(${s}, ${r}, fun(__m: JSMatch): String = jsToString(jsCall(${this.functionValue(second)}, *(__m.values.storage + listOf<Any?>(__m.index, __m.input)).toTypedArray())))`;
        }
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
    if (ts.isParenthesizedExpression(e.expression)) return this.newExpr(ts.factory.updateNewExpression(e, e.expression.expression, e.typeArguments, e.arguments));
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
      if (!appError) return this.errorValue(name, args);
    }
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    if (name === 'RegExp') return `JSRegExp(${this.str(args[0])}${args[1] ? `, ${this.str(args[1])}` : ''})`;
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${args.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    // `new Object()`: an empty object.
    if (name === 'Object' && this.isLibGlobal(callee as ts.Identifier) && !args.length) return 'JSObject()';
    if (name === 'WeakRef' && this.isLibGlobal(callee as ts.Identifier)) return `${t}(${this.expr(args[0])})`;
    if ((name === 'WeakMap' || name === 'WeakSet') && this.isLibGlobal(callee as ts.Identifier)) return args.length ? `${t}(${this.iterable(args[0])})` : `${t}()`;
    if (name === 'Array' && this.isLibGlobal(callee as ts.Identifier)) {
      const el = t.replace(/^JSArray<(.*)>$/, '$1');
      if (args.length !== 1) return args.length ? `jsArrayOf<${el}>(${args.map((a) => this.coerce(a, el)).join(', ')})` : `${t}()`;
      if (this.typeOf(args[0]) !== 'Double') {
        if (this.typeOf(args[0]) === 'Any?') throw this.error(e, 'new Array of one untyped value (a length or an element)');
        return `jsArrayOf<${el}>(${this.coerce(args[0], el)})`;
      }
      // n empty slots: a number, string or boolean cannot hold undefined, so its zero stands in until written.
      if (el.endsWith('?') || ['Double', 'String', 'Boolean'].includes(el)) return `jsArrayFilled<${el}>(${this.expr(args[0])}, ${this.zero(el)})`;
      throw this.error(e, `new Array of a length, of ${el} (empty slots need an optional element type)`);
    }
    const core = this.core?.construct(e) ?? this.native?.construct(e);
    if (core) return core;
    // `new Trace.Writer()`: a namespace's class.
    if (ts.isPropertyAccessExpression(callee) && this.namespaceMember(callee)) return `${t}(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t}(${this.args(e).join(', ')})`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'new');
  }

  /** One of the library's error classes, constructed: an AggregateError takes its errors first. */
  private errorValue(name: string, args: readonly ts.Expression[]): string {
    const [first, second] = name === 'AggregateError' ? [args[1], args[0]] : [args[0]];
    const errors = name === 'AggregateError' ? [second ? `JSArray<Any?>((${this.iterable(second)}).toList())` : 'JSArray<Any?>()'] : [];
    return `${ERRORS[name]}(${[...errors, ...(first ? [this.str(first)] : [])].join(', ')})`;
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

  /** `left = right` (also the assignment `??=` and `||=` make). */
  private assignment(left: ts.Expression, right: ts.Expression): string {
    if (ts.isPropertyAccessExpression(left) && this.symbolName(left.expression) === 'VueRef' && left.name.text === 'value') return `${this.lvalue(left)} = ${this.signalWrite(left.expression, right, this.typeOf(left))}`;
    if (ts.isArrayLiteralExpression(left)) throw this.error(left, 'a destructuring assignment');
    if (ts.isPropertyAccessExpression(left)) {
      const special = this.core?.assign(left, right) ?? this.native?.assign(left, right);
      if (special) return special;
    }
    if (ts.isPropertyAccessExpression(left) && (this.isExpando(left) || this.isAny(left.expression))) return `jsSet(${this.expr(left.expression)}, ${kotlinString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isElementAccessExpression(left) && (this.isAny(left.expression) || (!ts.isStringLiteral(left.argumentExpression) && this.isObjectRef(left.expression)
        && !/^(JSArray|JSRecord|JSMatch|Pair|Triple)\b/.test(this.typeOf(left.expression).replace(/\?$/, ''))))) {
      return `jsSet(${this.expr(left.expression)}, ${this.propertyKey(left.argumentExpression)}, ${this.coerce(right, 'Any?')})`;
    }
    return `${this.lvalue(left)} = ${this.coerce(right, this.declaredTypeOf(left) ?? this.typeOf(left))}`;
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
        const assigned = this.assignment(e.left, e.right);
        const plain = /^(jsSet\(|\w+\.set\()/.test(assigned) || !assigned.includes(' = ');
        return ts.isExpressionStatement(e.parent) || (ts.isParenthesizedExpression(e.parent) && ts.isExpressionStatement(e.parent.parent)) || ts.isForStatement(e.parent) || plain ? assigned : `run { ${assigned}; ${target()} }`;
      }
      // An untyped variable holds whatever the operation gives: a string, or a number.
      case K.PlusEqualsToken:
        if (this.isAny(e.left)) return `${target()} = jsAdd(${l()}, ${this.coerce(e.right, 'Any?')})`;
        return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} - ${this.toNumber(e.right)}` : `${target()} -= ${this.toNumber(e.right)}`;
      case K.AsteriskEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} * ${this.toNumber(e.right)}` : `${target()} *= ${this.toNumber(e.right)}`;
      case K.SlashEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} / ${this.toNumber(e.right)}` : `${target()} /= ${this.toNumber(e.right)}`;
      case K.PercentEqualsToken: return `${target()} %= ${this.toNumber(e.right)}`;
      case K.AsteriskAsteriskEqualsToken: return `${target()} = jsPow(${l()}, ${this.toNumber(e.right)})`;
      case K.QuestionQuestionEqualsToken: return `if (jsIsNullish(${l()})) ${this.assignment(e.left, e.right)}`;
      case K.BarBarEqualsToken: return `if (!jsTruthy(${l()})) ${this.assignment(e.left, e.right)}`;
      case K.AmpersandAmpersandEqualsToken: return `if (jsTruthy(${l()})) ${this.assignment(e.left, e.right)}`;
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
        // TypeScript types `s ?? 1` as the string `s` is declared; a missing `s` gives the fallback as a string.
        if (maybe) return `(${maybe} ?: ${t === 'String' && this.typeOf(e.right) !== 'String' ? this.str(e.right) : this.coerce(e.right, t)})`;
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
        // A nullable declaration read as its non-null type: present when truthy, else the type's undefined.
        const nullableLeft = (ts.isIdentifier(e.left) || ts.isPropertyAccessExpression(e.left)) && this.declaredTypeOf(e.left) === optionalType(leftType) && leftType !== optionalType(leftType);
        let leftValue = leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? `${v}!!` : leftType === 'Any?' ? this.fromAny(v, t) : t === 'Boolean' ? `jsTruthy(${v})` : v;
        const left = this.maybeUndefined(e.left) ?? l();
        // `a && a.get()` with an object `a`: undefined when it is missing.
        if (op === K.AmpersandAmpersandToken && leftValue === v && this.isObjectType(leftType) && leftType.replace(/\?$/, '') !== t.replace(/\?$/, '') && t !== 'Any?' && t !== 'Boolean') {
          return `(if (jsTruthy(${left})) ${right} else null)${isNullable(t) ? '' : '!!'}`;
        }
        if (nullableLeft && leftValue === v && t !== 'Any?') leftValue = op === K.BarBarToken ? `${v}!!` : this.undefinedAs(v, t);
        // `a?.b || x`: the chain is undefined where it stops; a truthy one is present.
        if (op === K.BarBarToken && ts.isOptionalChain(e.left) && leftValue === v && !isNullable(t) && t !== 'Any?') leftValue = `${v}!!`;
        return op === K.BarBarToken
          ? `run { val ${v} = ${left}; if (jsTruthy(${v})) ${leftValue} else ${right} }`
          : `run { val ${v} = ${left}; if (jsTruthy(${v})) ${right} else ${leftValue} }`;
      }
      case K.InstanceOfKeyword: {
        const name = e.right.getText();
        // A compiled program makes no String, Number or Boolean wrapper objects.
        if (['String', 'Number', 'Boolean'].includes(name) && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) return `run { ${this.coerce(e.left, 'Any?')}; false }`;
        // The library's classes: the runtime's type of any of their instances (a promise of any result).
        const builtin = BUILTIN_CLASSES[name];
        if (builtin && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) return `(${l()} is ${builtin})`;
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
    // A spread's length is known only when it runs: no tuple.
    if (context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) && !(this.checker.isTupleType(context) && e.elements.some(ts.isSpreadElement))) {
      const c = this.type(context, e).replace(/\?$/, '');
      if (c.startsWith('JSArray<') || c.startsWith('Pair<') || c.startsWith('Triple<') || !e.elements.length) t = c;
      // Where an array or other kinds of value go (`data: string[][] | string`): that array.
      const arrays = context.isUnion() ? context.types.filter((u) => this.checker.isArrayType(u)) : [];
      if (c === 'Any' && arrays.length === 1) t = this.type(arrays[0], e);
    }
    if (t === 'Any?' || (context && context.flags & ts.TypeFlags.Any && this.pluginFiles.has(e.getSourceFile().fileName))) t = 'JSArray<Any?>';
    // `[]` where a match array goes (`text.match(re) || []`): an empty match.
    if (t === 'JSMatch' && !e.elements.length) return 'JSMatch.empty()';
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
    // `{ … } as unknown as T`: an object script reads and extends untyped.
    if (contextual && contextual.flags & ts.TypeFlags.Unknown) return this.dynamicObject(e);
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
    if (name === 'Any?' || name === 'Any' || name === 'Nothing' || name === 'JSObject' || name === 'EventData') return this.dynamicObject(e);
    if (/^JS(Iterator|AsyncIterator)</.test(name)) return this.scriptIterator(e, name);
    let decl = this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0];
    // A literal that conforms to an app interface it is not declared as.
    const conforming = this.appInterfaces?.find((i) => i.name === name);
    if (conforming && !(decl && ts.isInterfaceDeclaration(decl) && decl.name.text === name)) decl = conforming.type.getSymbol()?.declarations?.[0];
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
    const spreadTemps: string[] = [];
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
        if (this.isAny(p.expression)) {
          // An untyped source (a `Partial<…>` patch): each field it has replaces the one before.
          const tmp = this.fresh('__spread');
          spreadTemps.push(`val ${tmp}: Any? = ${src}`);
          for (const f of order) {
            const prev = given.get(f.name) ?? (f.type.endsWith('?') ? 'null' : this.zero(f.type) ?? 'null');
            given.set(f.name, `(if (jsHasKey(${tmp}, ${kotlinString(f.name)})) ${this.fromAnyCode(`jsField(${tmp}, ${kotlinString(f.name)})`, f.type, true)} else ${prev})`);
          }
          continue;
        }
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
    // A spread of a typed object copies its keys in the order that object holds them, known when it runs.
    const spreads = e.properties.filter(ts.isSpreadAssignment).filter((p) => !this.isAny(p.expression) && this.pure(p.expression));
    const parts = e.properties.map((p) => ts.isSpreadAssignment(p) ? `((${this.expr(p.expression)}) as? JSDynamic)?.jsKeys ?: listOf()` : `listOf(${p.name ? kotlinString(literalKey(p.name, this.checker) ?? p.name.getText()) : ''})`);
    const reorder = spreads.length
      ? `jsOrder = jsLiteralKeyOrder(listOf(${parts.join(', ')}), listOf(${order.map((f) => kotlinString(f.name)).join(', ')}))`
      : inOrder.join() !== declared.join() ? `jsOrder = listOf(${inOrder.map(kotlinString).join(', ')})` : '';
    const args = order.flatMap((f) => {
      const a = (f as ShapeField).accessor;
      if (a) return [...(a.get ? [`__get_${f.name} = ${given.get(`__get_${f.name}`)}`] : []), ...(a.set ? [`__set_${f.name} = ${given.get(`__set_${f.name}`)}`] : [])];
      return given.has(f.name) ? [`${ident(f.label ?? f.name)} = ${given.get(f.name)}`] : [];
    });
    const made = `${target}(${[...args, reorder].filter(Boolean).join(', ')})`;
    const built = self ? `run { lateinit var ${self}: ${target}; val __made = ${made}; ${self} = __made; __made }` : made;
    return spreadTemps.length ? `run { ${spreadTemps.join('; ')}; ${built} }` : built;
  }

  dynamicObject(e: ts.ObjectLiteralExpression): string {
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
    const rest = p.parameters.some((q) => q.dotDotDotToken);
    if (!thisNodes(p).length && !rest) return this.closure(p);
    const ret = this.returnTypeOf(p);
    const binds = p.parameters.map((q, k) => `val ${ident((q.name as ts.Identifier).text)}: ${this.typeOf(q.name)} = ${q.dotDotDotToken
      ? `JSArray(__a.drop(${k}).map { ${this.fromAnyCode('it', this.typeOf(q.name).replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
      : this.fromAnyCode(`__a.getOrNull(${k})`, this.typeOf(q.name), true)}`);
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
  nextStep: (item, iterator, type, otherwise, i, current) => [`${i}if (!${iterator}.jsAdvance()) { ${otherwise} }`, `${i}val ${item}: ${type} = ${current ?? `${iterator}.jsCurrent`}`],
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

/** An operand of `==`, `===`, `!=` or `!==`: a dynamic read there may be undefined whatever its declared type. */
function isCompared(e: ts.Expression): boolean {
  let n: ts.Node = e;
  while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
  const p = n.parent;
  return ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind);
}

/** A Kotlin parameter's type without its default value (`= null`). */
function withoutDefault(text: string): string {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === '=' && depth === 0 && text[i + 1] !== '=') return text.slice(0, i);
  }
  return text;
}

/** Whether code assigns to a symbol (`x = …`, `x += …`, `x++`). */
function assignsTo(node: ts.Node, sym: ts.Symbol | undefined, checker: ts.TypeChecker): boolean {
  if (!sym) return false;
  let found = false;
  const target = (x: ts.Expression) => ts.isIdentifier(x) && checker.getSymbolAtLocation(x) === sym;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && target(n.left)) { found = true; return; }
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(n.operator) && target(n.operand)) { found = true; return; }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/** Whether `node` names `sym`. */
function refersTo(node: ts.Node, sym: ts.Symbol | undefined, checker: ts.TypeChecker): boolean {
  if (!sym) return false;
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isIdentifier(n) && checker.getSymbolAtLocation(n) === sym) { found = true; return; }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/** Whether a module function `fn` called at `at` is shadowed by a member of the class around it, as a bare name is in Swift and Kotlin. */
function shadowedByMember(at: ts.Node, decl: ts.Declaration | undefined, fn: string, ident: (name: string) => string): boolean {
  if (!decl || !ts.isFunctionDeclaration(decl) || !ts.isSourceFile(decl.parent)) return false;
  const cls = ts.findAncestor(at, ts.isClassLike);
  return !!cls && cls.members.some((m) => !!m.name && ts.isIdentifier(m.name) && ident(m.name.text) === fn);
}

/** Whether a class reads `this.name?.…`: a field it leaves unset until later is tested for being there. */
function chainedThrough(cls: ts.ClassDeclaration, name: string): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n)) && n.questionDotToken
        && ts.isPropertyAccessExpression(n.expression) && n.expression.expression.kind === ts.SyntaxKind.ThisKeyword && n.expression.name.text === name) { found = true; return; }
    ts.forEachChild(n, visit);
  };
  visit(cls);
  return found;
}

/** A `var` declaring a variable an earlier `var` of the same block declared. */
function redeclaredVar(d: ts.VariableDeclaration, checker: ts.TypeChecker): boolean {
  if (d.parent.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const) || !ts.isVariableStatement(d.parent.parent)) return false;
  const block = d.parent.parent.parent;
  const earlier = checker.getSymbolAtLocation(d.name)?.declarations?.filter((x) => x.pos < d.pos);
  return !!earlier?.some((x) => ts.isVariableDeclaration(x) && ts.isVariableStatement(x.parent.parent) && x.parent.parent.parent === block);
}
