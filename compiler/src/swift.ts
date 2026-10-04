import type { SourceLines } from './source-lines.ts';
import ts from 'typescript';
import { Throws, isAsync, isStatic } from './throws.ts';
import { intlConstructor, isObjectToStringCall, isStringRaw, redeclaredBeside, iteratedType, iterationThrows, jsKeyOrder, literalKey, neverDefined, templateParts, unsafeReceiver, wellKnownMember, WELL_KNOWN_MEMBERS } from './lang.ts';
import { AsyncLowering, type AsyncCtx, type AsyncSyntax, type AsyncTranslator } from './async.ts';
import { CoreAPI, isCoreDeclaration, KIT_NAMES } from './core.ts';
import type { KitMember } from './kit-index.ts';
import type { Properties } from './properties.ts';
import { recognizePatterns, type Patterns } from './patterns.ts';
import { NativeAPI } from './native-calls.ts';
import type { Reach } from './reach.ts';

/**
 * TypeScript to Swift, typed by the checker, with JavaScript's semantics
 * where Swift's differ: numbers are Double and print as JavaScript prints
 * them, arrays, maps, sets and objects are references, `any` is `Any?`,
 * exceptions are Swift errors carrying the thrown value, and async functions
 * are continuations over spec-exact promises (async.ts). Anything outside
 * what is translated stops the build with its file, line and construct.
 */

const KEYWORDS = new Set([
  'in', 'default', 'repeat', 'where', 'func', 'var', 'let', 'struct', 'enum', 'protocol', 'extension', 'internal', 'operator', 'self', 'Self',
  'Type', 'is', 'as', 'guard', 'defer', 'subscript', 'init', 'deinit', 'inout', 'associatedtype', 'fallthrough', 'super', 'true', 'false',
  'nil', 'class', 'import', 'static', 'Any', 'Protocol', 'rethrows', 'throws', 'precedencegroup', 'fileprivate', 'open', 'some', 'any',
  'return', 'throw', 'try', 'catch', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'do', 'typealias', 'private', 'public',
]);

export function ident(name: string): string {
  // A key no identifier spells (`1`, `aria-label`) keeps its string form in jsKeys and subscripts.
  const n = name.replace(/^#/, '_p_').replace(/\$/g, '_').replace(/^(?=\d)/, '_').replace(/[^\w]/g, '_');
  return KEYWORDS.has(n) ? `\`${n}\`` : n;
}

export function swiftString(text: string): string {
  return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    .replace(/[\u0000-\u001f\u007f]/g, (ch) => `\\u{${ch.charCodeAt(0).toString(16)}}`) + '"';
}

/** `T?`, keeping an already optional type and parenthesizing a function type. */
export function optionalType(t: string): string {
  if (t.endsWith('!')) return t;
  if (hasTopLevelArrow(t)) return `(${t})?`;
  return t.endsWith('?') ? t : `${t}?`;
}

/** A function type at the top level (`(A) throws -> B?`), not one inside parentheses or generic arguments. */
function hasTopLevelArrow(t: string): boolean {
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if ('([<'.includes(ch)) depth++;
    else if (ch === '-' && t[i + 1] === '>') { if (depth === 0) return true; i++; }
    else if (')]>'.includes(ch)) depth--;
  }
  return false;
}

export const CF_CLASSES = new Set(['CGPath', 'CGMutablePath', 'CGColor', 'CGImage', 'CGContext', 'CGColorSpace', 'CGGradient', 'CTFont', 'CTLine', 'CTFrame', 'CFString', 'CFData']);

/** An optional value type: `T?`, `(…)?`, but not a function returning an optional. */
const isOptional = (t: string) => t.endsWith('?') && !hasTopLevelArrow(t);

const isFunctionType = (t: string) => hasTopLevelArrow(t) && !t.startsWith('[') && !/^\w+</.test(t);

export interface ComponentInfo {
  name: string;
  props: string[];
}

const ERRORS: Record<string, string> = { Error: 'JSError', TypeError: 'JSTypeError', RangeError: 'JSRangeError', SyntaxError: 'JSSyntaxError', ReferenceError: 'JSReferenceError', AggregateError: 'JSAggregateError' };
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date', 'WeakRef', 'Symbol', 'WeakMap', 'WeakSet', 'BigInt']);

export class Translator implements AsyncTranslator {
  readonly syntax = SWIFT_SYNTAX;
  /** The component class being translated: its props read as `self.<prop>.value`. */
  props = new Set<string>();
  /** Named types translated code uses: an interface becomes a class only if something does. */
  readonly used = new Set<string>();
  private interfaces = new Map<string, { file: string; code: () => string }>();
  private shapes = new Map<string, { name: string; fields: ShapeField[] }>();
  private shaping = new Set<ts.Type>();
  /** Angular `computed()` fields, translated as getters: `this.total()` reads `self.total`. */
  private computed = new Set<string>();
  /** Variables initialized from an element read (`const r = xs[i]`): Swift optionals, unwrapped where they are used. */
  private undefinedVars = new Map<ts.Symbol, string>();
  /** A tagged template's strings, one constant per call site, as JavaScript caches them. */
  private templateObjects: string[] = [];
  /** Accessors for module-level variables a class member of the same name hides from Swift (`__global_fruits`). */
  private globalAliases = new Map<string, string>();
  /** App classes another app class extends: they stay open. */
  private extended = new Set<string>();
  /** Classes some class extends, by declaration (an import may rename them). */
  private extendedDecls = new Set<ts.Node>();
  /** Interfaces an app class implements: Swift protocols, with a class for their object literals. */
  private protocols = new Set<string>();
  indent = '';
  private tmp = 0;
  /** Expressions already evaluated into a Swift name (awaited values, operands read before an await). */
  readonly subst = new Map<ts.Node, string>();
  asyncCtx: AsyncCtx | null = null;
  /** Enclosing statements that own a plain `break` / `continue` inside a lowered async region. */
  private plainBreak = 0;
  private plainContinue = 0;
  /** What a plain `break` leaves, innermost last: a loop or Swift switch (null), or a switch lowered to a labeled block. */
  private breakTargets: (string | null)[] = [];
  private returnType = 'Void';
  /** A Promise executor's `resolve` parameter → its JSResolvers, so resolving with a promise adopts it. */
  private resolvers = new Map<ts.Symbol, { name: string; type: string }>();
  /** Template methods take their loop variables with defaults only so the checker can type them. */
  private templateParams = false;
  readonly throwsInfo: Throws;
  readonly sourceFiles: readonly ts.SourceFile[];
  private lowering: AsyncLowering;
  private core: CoreAPI;
  readonly native: NativeAPI;
  isKitType(name: string): boolean { return this.core.declares(name); }
  kitTypes(): string[] { return this.core.typeNames(); }

  readonly checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  /** Files of the plugins compiled from source. */
  readonly pluginFiles: Set<string>;
  /** What of the plugins the app reaches; everything when absent. */
  readonly reach: Reach | null;
  /** The view properties the program registers with core's `Property`. */
  readonly properties: Properties | null;
  readonly patterns: Patterns;
  /** Marks each statement with its source line (`#sourceLocation` in Swift, a line table for Kotlin). */
  lines: SourceLines | null = null;
  /** The app's Swift module, which qualifies a module function a class member's name shadows. */
  appModule = '';

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[], options: { pluginFiles?: Iterable<string>; reach?: Reach; properties?: Properties } = {}) {
    this.pluginFiles = new Set(options.pluginFiles ?? []);
    this.reach = options.reach ?? null;
    this.properties = options.properties ?? null;
    this.patterns = recognizePatterns(checker, files);
    this.checker = checker;
    this.components = components;
    this.sourceFiles = files;
    this.lowering = new AsyncLowering(this);
    this.core = new CoreAPI(this);
    this.native = new NativeAPI(this);
    this.throwsInfo = new Throws(checker, files, (n) => { try { return this.typeOf(n) === 'Any?'; } catch { return false; } });
    for (const f of files) {
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          const base = n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
          if (base && ts.isIdentifier(base.expression)) {
            this.extended.add(base.expression.text);
            const d = this.resolve(base.expression)?.valueDeclaration;
            if (d) this.extendedDecls.add(d);
          }
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

  /** Translates a function's body: no async region or loop of the enclosing function reaches into it. */
  private inFunction<T>(returnType: string, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.breakTargets] as const;
    this.asyncCtx = null;
    this.plainBreak = 0;
    this.plainContinue = 0;
    this.returnType = returnType;
    this.breakTargets = [];
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.breakTargets] = saved; }
  }

  // ---- Types -----------------------------------------------------------------------------

  type(t: ts.Type, where?: ts.Node): string {
    const c = this.checker;
    const F = ts.TypeFlags;
    if (t.flags & F.EnumLike) {
      const native = this.native.type(t);
      if (native) return native;
    }
    if (t.flags & (F.Any | F.Unknown)) return 'Any?';
    // `OptionsTypeMap[T]` over a type parameter: whatever the call passes.
    if (t.flags & F.IndexedAccess) return 'Any?';
    if (t.flags & F.Never) return 'Never';
    if (t.flags & (F.Void | F.Undefined)) return 'Void';
    if (t.flags & F.Null) return 'Any?';
    if (t.flags & F.TypeParameter) {
      // A method's `this` is its class.
      const constraint = (t as ts.TypeParameter & { isThisType?: boolean }).isThisType ? t.getConstraint() : undefined;
      if (constraint) return this.type(constraint, where);
      const decl = t.symbol?.declarations?.[0];
      if (decl && this.pluginFiles.has(decl.getSourceFile().fileName)) return 'Any?';
      if (decl && ts.isTypeParameterDeclaration(decl) && erasedTypeParameter(decl)) return 'Any?';
      return t.symbol?.name ?? 'Any?';
    }
    // `UIView & { nsView?: … }`, `ScrollView & { … }`: the class; the members the literal adds are read by name.
    if (t.isIntersection()) {
      const cls = t.types.find((u) => this.native.type(u) || (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class);
      if (cls) return this.type(cls, where);
    }
    if (t.isUnion()) {
      let parts = t.types.filter((u) => !(u.flags & (F.Undefined | F.Null | F.Void)));
      if (!parts.length) return 'Any?';
      const optional = parts.length < t.types.length;
      // `xs || []`: the empty literal's `never[]` takes the other side's type.
      const empty = (u: ts.Type) => c.isArrayType(u) && !!(c.getTypeArguments(u as ts.TypeReference)[0]?.flags & F.Never);
      if (parts.length > 1 && parts.some((u) => !empty(u))) parts = parts.filter((u) => !empty(u));
      // A union with a type the build cannot translate (`string | RegExp`) reads as the parts it can.
      const translated = parts.flatMap((u) => { try { return [this.type(u, where)]; } catch { return []; } });
      if (!translated.length) return this.type(parts[0], where);
      const kinds = [...new Set(translated)];
      const base = kinds.length === 1 ? kinds[0] : 'Any?';
      return optional ? optionalType(base) : base;
    }
    if (t.flags & (F.Number | F.NumberLiteral)) return 'Double';
    if (t.flags & (F.ESSymbol | F.UniqueESSymbol)) return 'JSSymbol';
    if (t.flags & F.NonPrimitive) return 'Any?';
    if (t.flags & (F.String | F.StringLiteral | F.TemplateLiteral)) return 'String';
    if (t.flags & (F.Boolean | F.BooleanLiteral)) return 'Bool';
    if (t.flags & F.BigIntLike) return 'JSBigInt';
    if (c.isTupleType(t)) return `(${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')})`;
    if (c.isArrayType(t)) {
      const el = c.getTypeArguments(t as ts.TypeReference)[0];
      // `[]`'s `never[]` holds anything once it is written to.
      return el.flags & F.Never ? 'JSArray<Any?>' : `JSArray<${this.type(el, where)}>`;
    }
    const sym = t.aliasSymbol ?? t.getSymbol();
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
      // `Promise.allSettled`'s results are the plain objects it makes.
      case 'PromiseSettledResult': case 'PromiseFulfilledResult': case 'PromiseRejectedResult': return 'JSObject';
      case 'NativeDialogRef': case 'NativeDialogService': case 'DestroyRef': case 'Injector': case 'NgZone': case 'HttpClient':
        if (sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/')) return name;
        break;
      case 'Promise': case 'PromiseLike': return `JSPromise<${arg(0)}>`;
      case 'AnimationPromise': if (isCoreDeclaration(sym?.declarations?.[0])) return 'JSPromise<Void>'; break;
      // Script writes animation definitions as object literals; the kit's Animation reads them by key.
      case 'AnimationDefinition': if (isCoreDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'Map': case 'ReadonlyMap': return `JSMap<${arg(0)}, ${arg(1)}>`;
      case 'Set': case 'ReadonlySet': return `JSSet<${arg(0)}>`;
      case 'Date': return 'JSDate';
      case 'RegExp': return 'JSRegExp';
      case 'RegExpMatchArray': case 'RegExpExecArray': return 'JSMatch';
      case 'RegExpStringIterator': return 'JSArray<JSMatch>';
      case 'WeakRef': return `JSWeakRef<${arg(0)}>`;
      case 'TemplateStringsArray': return 'JSArray<String>';
      case 'NumberFormat': case 'DateTimeFormat': if (isLibDeclaration(sym?.declarations?.[0])) return `JS${name}`; break;
      case 'NumberFormatOptions': case 'DateTimeFormatOptions': case 'ResolvedNumberFormatOptions': case 'ResolvedDateTimeFormatOptions': case 'LocalesArgument':
        if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?';
        break;
      case 'Generator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSGenerator<${arg(0)}>`; break;
      case 'Iterator': case 'IterableIterator': case 'IteratorObject': case 'MapIterator': case 'SetIterator': case 'ArrayIterator': case 'StringIterator':
        if (isLibDeclaration(sym?.declarations?.[0])) return `JSIterator<${arg(0)}>`;
        break;
      case 'Iterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSIterable<${arg(0)}>`; break;
      case 'AsyncGenerator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncGenerator<${arg(0)}>`; break;
      case 'AsyncIterator': case 'AsyncIterableIterator': case 'AsyncIteratorObject': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterator<${arg(0)}>`; break;
      case 'AsyncIterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterable<${arg(0)}>`; break;
      case 'IteratorResult': case 'IteratorYieldResult': case 'IteratorReturnResult': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'PropertyDescriptor': case 'PropertyDescriptorMap': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'Reference':
        if (sym?.declarations?.[0] && /[\\/]interop\.d\.ts$/.test(sym.declarations[0].getSourceFile().fileName)) return 'InteropReference';
        break;
      case 'WeakMap': return `JSWeakMap<${arg(0)}, ${arg(1)}>`;
      case 'WeakSet': return `JSWeakSet<${arg(0)}>`;
      case 'Symbol': if (isLibDeclaration(sym?.declarations?.[0])) return 'JSSymbol'; break;
    }
    if (name && ERRORS[name] && sym?.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return ERRORS[name];
    if (name === 'NonNullable' && t.aliasSymbol && args().length === 1) {
      const inner = this.type(args()[0], where);
      return inner === 'Any?' ? inner : inner.replace(/\?$/, '');
    }
    if (name === 'Object' && sym?.declarations?.every((d) => /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName))) return 'Any?';
    const native = this.native.type(t);
    if (native) return native;
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
    const calls = t.getCallSignatures();
    if (calls.length && !t.getProperties().length) {
      const s = calls[0];
      const params = s.getParameters().map((p) => {
        const pt = this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.questionToken) return optionalType(pt);
        return isFunctionType(pt) ? `@escaping ${pt}` : pt;
      });
      return `(${params.join(', ')}) throws -> ${this.type(s.getReturnType(), where)}`;
    }
    const extended = sym && sym.flags & ts.SymbolFlags.Interface ? this.extendedClass(t) : null;
    if (extended) return this.type(extended, where);
    if (sym && this.isDynamicShape(sym)) return 'Any?';
    if (this.isEventData(t)) return 'EventData';
    // A generic type the kit declares (`ListItem<Recipe>`) keeps its arguments.
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    // RxJS's classes are the kit's Rx classes: core has an Observable of its own.
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/rxjs.d.ts') return `Rx${name}${(t as ts.TypeReference).typeArguments?.length ? `<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>` : ''}`;
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    if (name && Object.hasOwn(KIT_NAMES, name) && isCoreDeclaration(sym?.declarations?.[0])) return KIT_NAMES[name];
    const renamed = sym?.valueDeclaration && this.topNames().get(sym.valueDeclaration);
    if (renamed) return renamed;
    // A mixin's class is the core class it is applied to.
    const mixin = this.mixinOf(sym);
    if (mixin) return mixin;
    if (name && name !== '__type' && name !== '__object') {
      if (sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) this.used.add(name);
      return name;
    }
    const props = t.getProperties().map((p) => p.name);
    // An inline object type naming only an event's fields is the event's data (`args: { value: boolean }`).
    if (props.length && props.every((p) => ['eventName', 'object', 'value'].includes(p))) return 'EventData';
    return this.shape(t, where);
  }

  /**
   * A shape only a library or a plugin declares (an options interface, a
   * class its `.d.ts` describes): an untyped JavaScript object, as the code
   * that declared it treats it. The app's own interfaces keep their classes,
   * and so do the core types NativeScriptKit models.
   */
  private isDynamicShape(sym: ts.Symbol): boolean {
    const decls = sym.declarations ?? [];
    if (!decls.length) return false;
    const sf = decls[0].getSourceFile();
    const shape = decls.every((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d) || ts.isTypeLiteralNode(d) || (ts.isClassDeclaration(d) && d.getSourceFile().isDeclarationFile));
    if (!shape || sf.fileName.startsWith('/__shims__/') || this.native.module(decls[0]) || /[\\/]typescript[\\/]lib[\\/]/.test(sf.fileName)) return false;
    if (isCoreDeclaration(decls[0])) return decls.every((d) => !ts.isClassDeclaration(d)) && !this.core.has(sym.name) && !this.isEventDataSymbol(sym);
    return this.pluginFiles.has(sf.fileName) || sf.isDeclarationFile;
  }

  private isEventDataSymbol(sym: ts.Symbol): boolean {
    const t = this.checker.getDeclaredTypeOfSymbol(sym);
    return sym.name === 'EventData' || (t.isClassOrInterface() && this.isEventData(t));
  }

  /** A member script adds to a native object (`nativeView.nsView`): declared by the code itself, not by the SDK. */
  private isExpando(e: ts.PropertyAccessExpression): boolean {
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    if (!decl || !(ts.isPropertySignature(decl) && ts.isTypeLiteralNode(decl.parent))) return false;
    const target = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    return [target, ...(target.isIntersection() ? target.types : [])].some((t) => !!this.native.type(t));
  }

  /** The class an interface extends, when it extends exactly one and adds nothing Swift could not read by name. */
  private extendedClass(t: ts.Type): ts.Type | null {
    if (!t.isClassOrInterface()) return null;
    const bases = this.checker.getBaseTypes(t as ts.InterfaceType);
    if (bases.length !== 1 || !(bases[0].getSymbol()?.flags! & ts.SymbolFlags.Class)) return null;
    return bases[0];
  }

  /** A framework's event type (`ListViewItemTapEvent`) is an `EventData` with typed members. */
  private isEventData(t: ts.Type): boolean {
    const target = (t as ts.TypeReference).target ?? t;
    if (!(target.flags & ts.TypeFlags.Object) || !target.isClassOrInterface()) return false;
    // Core declares some event types as classes of their own (`TouchGestureEventData`): an event names itself.
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

  /** A declared type, before the narrowing the checker applies at a use. */
  private declaredTypeOf(e: ts.Expression): string | null {
    const sym = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    if (!(ts.isVariableDeclaration(decl) || ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isBindingElement(decl) || ts.isGetAccessorDeclaration(decl))) return null;
    return this.type(this.checker.getTypeOfSymbolAtLocation(sym, decl), decl);
  }

  /**
   * Whether a member access continues from an optional Swift value. Inside an
   * optional chain (`a?.b.c`) TypeScript types `a?.b` as possibly undefined,
   * but Swift's chain already carries that: only `b`'s own type counts.
   */
  private continuesOptional(x: ts.Expression): boolean {
    if ((ts.isPropertyAccessExpression(x) || ts.isElementAccessExpression(x)) && ts.isOptionalChain(x)) {
      const own = ts.isPropertyAccessExpression(x) ? this.declaredTypeOf(x) : null;
      if (own) return own.endsWith('?');
      return this.type(this.checker.getNonNullableType(this.checker.getTypeAtLocation(x)), x).endsWith('?');
    }
    return this.typeOf(x).endsWith('?');
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

  /** An object type with no name: a final class named for its fields, shared by every literal of that shape. */
  private shape(t: ts.Type, where?: ts.Node): string {
    const conforming = this.conformingInterface(t);
    if (conforming) { this.used.add(conforming); return conforming; }
    // Keys that are no names (a lookup table: `{ '\\alpha': 'α', '0': '₀' }`) make a dynamic object.
    if (t.getProperties().some((p) => !/^[A-Za-z$][\w$]*$|^_[\w$]+$/.test(p.name))) return 'JSObject';
    if (this.shaping.has(t)) throw this.error(where, 'a recursive object type without a name');
    this.shaping.add(t);
    try {
      // A literal's keys are in the order JavaScript creates them: a spread's keys, then new ones; an overwritten key keeps its place.
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
        const ptype = this.checker.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!);
        // A field of a type parameter (`{ at, data: T }`): shared by every instantiation, it holds any value.
        let pt = ptype.flags & ts.TypeFlags.TypeParameter ? 'Any?' : this.type(ptype, where);
        const symbolic = wellKnownMember(p.name);
        if (symbolic) return { name: symbolic, type: pt, symbol: true };
        if (pt === 'Void' || pt === 'Never') pt = 'Any?';
        // Accessors of the literal itself; a spread copies an accessor's value into a plain property.
        const getter = p.declarations?.find((d) => ts.isGetAccessorDeclaration(d) && d.parent === literal);
        const setter = p.declarations?.find((d) => ts.isSetAccessorDeclaration(d) && d.parent === literal);
        if (getter || setter) return { name: p.name, type: getter ? pt : optionalType(pt), accessor: { get: !!getter, set: !!setter, throws: !!getter && this.throwsInfo.fn(getter as ts.GetAccessorDeclaration), value: pt } };
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
  private isBool(n: ts.Node) { return this.typeOf(n) === 'Bool'; }
  private isAny(n: ts.Node) { return this.typeOf(n) === 'Any?'; }
  private isArray(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '').startsWith('JSArray<'); }
  private isObjectRef(n: ts.Node) {
    const t = this.typeOf(n).replace(/[?!]$/, '');
    return !['Double', 'String', 'Bool', 'Any?', 'Any', 'Void', 'JSBigInt', 'JSSymbol'].includes(t) && !t.startsWith('(') && !t.startsWith('[') && !this.native.isEnumType(t) && !this.native.isStructType(t);
  }
  zero(t: string): string | null {
    if (t.endsWith('?')) return 'nil';
    if (t === 'Double') return '0';
    if (t === 'String') return '""';
    if (t === 'Bool') return 'false';
    if (/^JS(Array|Map|Set)</.test(t)) return `${t}()`;
    return null;
  }
  /** A declaration's type and initial value when its real value is assigned later. */
  deferredType(t: string): string { return this.deferred(t); }
  deferredDeclaration(name: string, t: string): string { return `var ${name}: ${this.deferred(t)}`; }
  isPromiseType(t: string): boolean { return t.startsWith('JSPromise<'); }
  private deferred(t: string): string {
    const z = this.zero(t);
    return z ? `${t} = ${z}` : isFunctionType(t) ? `(${t})!` : `${t}!`;
  }

  // ---- Modules -------------------------------------------------------------------------------

  /** A module's declarations, and the statements that run when it is first imported. */
  module(sf: ts.SourceFile): { code: string; init: string[] } {
    this.props = new Set();
    const out: string[] = [];
    const init: string[] = [];
    let current: ts.Statement | null = null;
    const later = (code: () => string) => {
      this.indent = '    ';
      this.moduleAvailability = 0;
      try {
        const line = (current && this.lines ? this.lines.mark(current) : '') + code();
        init.push(this.moduleAvailability ? this.availableOnly(this.moduleAvailability, line.replace(/^ {4}/gm, ''), '    ') : line);
      } finally { this.indent = ''; this.moduleAvailability = 0; }
    };
    for (const st of sf.statements) {
      current = st;
      if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) continue;
      if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
      if (this.reach && !this.reach.keeps(st)) continue;
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, sf.fileName, st.members); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, sf.fileName, st.type.members); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isEnumDeclaration(st)) { out.push(this.enumDecl(st)); continue; }
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) out.push(this.func(st, ident(this.topName(st, st.name.text)))); continue; }
      if (ts.isClassDeclaration(st)) {
        const target = this.patterns.mixinTarget(st);
        if (target) { out.push(this.mixinDecl(st, target)); continue; }
        // Components are translated with their templates; other classes are services and models.
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component'));
        if (!component && st.name) out.push(this.classDecl(st));
        continue;
      }
      if (ts.isVariableStatement(st)) {
        const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) {
            for (const n of boundNames(d.name)) out.push(`var ${ident(n.text)}: ${this.deferred(this.typeOf(n))}`);
            const tmp = this.fresh('__d');
            later(() => `    let ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', 'assign')}`);
            continue;
          }
          const name = ident(this.topName(d, d.name.text));
          const t = this.typeOf(d.name);
          if (!d.initializer) { out.push(`var ${name}: ${this.deferred(t)}`); continue; }
          // A module's Angular `computed(fn)`: read through `x()`, its value is fn's whenever it is read.
          const fn = ts.isCallExpression(d.initializer) && this.calleeName(d.initializer) === 'computed' ? d.initializer.arguments[0] : undefined;
          if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
            const rt = this.returnTypeOf(fn);
            out.push(this.throwsInfo.fn(fn) ? `var ${name}: ${rt} {\n    get throws ${this.functionBody(fn, rt, '    ')}\n}` : `var ${name}: ${rt} ${this.functionBody(fn, rt, '')}`);
            continue;
          }
          const maybe = !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
          if (maybe) {
            const sym = this.resolve(d.name);
            if (sym) this.undefinedVars.set(sym, optionalType(t));
            out.push(`var ${name}: ${optionalType(t)} = nil`);
            later(() => `    ${name} = ${maybe}`);
            continue;
          }
          if (this.pure(d.initializer)) { out.push(`${constant ? 'let' : 'var'} ${name}: ${t} = ${this.coerce(d.initializer, t)}`); continue; }
          out.push(`var ${name}: ${this.deferred(t)}`);
          later(() => `    ${name} = ${this.tryPrefix(d.initializer!)}${this.coerce(d.initializer!, t)}`);
        }
        continue;
      }
      later(() => this.stmt(st));
    }
    return { code: out.join('\n\n') + '\n', init };
  }

  /** Whether evaluating `e` early (Swift initializes globals lazily) cannot be observed. */
  pure(e: ts.Expression): boolean {
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return this.pure(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
    if (ts.isIdentifier(e) || ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((s) => this.pure(s.expression));
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => this.pure(ts.isSpreadElement(x) ? x.expression : x));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? this.pure(p.initializer) : ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return this.pure(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && this.pure(e.left) && this.pure(e.right);
    if (ts.isPropertyAccessExpression(e)) return this.pure(e.expression);
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every((a) => this.pure(a));
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every((a) => this.pure(a));
    return false;
  }

  private registerInterface(name: string, file: string, members: ts.NodeArray<ts.TypeElement>) {
    if (this.protocols.has(name)) { this.interfaces.set(name, { file, code: () => this.protocolCode(name, members) }); return; }
    this.interfaces.set(name, { file, code: () => this.objectClass(name, members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t };
    }), null) });
  }

  /** An interface classes implement: a protocol, and `<Name>Object` for the object literals of its type. */
  private protocolCode(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t, readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) };
    });
    const methods = members.filter(ts.isMethodSignature).map((m) => {
      const params = m.parameters.map((p, k) => ({ name: ts.isIdentifier(p.name) ? ident(p.name.text) : `p${k}`, type: p.questionToken ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name) }));
      return { name: ident(m.name.getText()), params, ret: this.returnTypeOf(m) };
    });
    const signature = (m: (typeof methods)[0]) => `func ${m.name}(${m.params.map((p) => `_ ${p.name}: ${p.type}`).join(', ')}) throws${m.ret === 'Void' ? '' : ` -> ${m.ret}`}`;
    const fnType = (m: (typeof methods)[0]) => `(${m.params.map((p) => p.type).join(', ')}) throws -> ${m.ret}`;
    const lines = [`protocol ${name}: JSDynamic {`];
    for (const f of fields) lines.push(`    var ${ident(f.name)}: ${f.type} { get${f.readonly ? '' : ' set'} }`);
    for (const m of methods) lines.push(`    ${signature(m)}`);
    lines.push('}', '');
    const literal = this.objectClass(`${name}Object`, [...fields, ...methods.map((m) => ({ name: `_${m.name}`, type: fnType(m) }))], null)
      .replace(/^final class (\w+): JSDynamic \{/, `final class $1: ${name} {`)
      .replace(/\n}$/, '\n' + methods.map((m) => `    ${signature(m)} { try _${m.name}(${m.params.map((p) => p.name).join(', ')}) }`).join('\n') + '\n}');
    return lines.join('\n') + literal;
  }

  /** The classes for a module's interfaces that translated code used; call after translating everything. */
  interfacesOf(file: string): string {
    let out = '';
    const emitted = new Set<string>();
    // An interface's own fields can use another one.
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

  /** Classes for object types without a name. */
  shapesCode(): string {
    return [...[...this.shapes.values()].map((s) => this.objectClass(s.name, s.fields, null)), ...this.globalAliases.values(), ...this.templateObjects].join('\n\n');
  }

  /** A plain JavaScript object of a known shape: a final class with a memberwise init, readable as a dynamic object. */
  private objectClass(name: string, allFields: ShapeField[], className: string | null): string {
    if (allFields.some((f) => f.accessor)) return this.accessorClass(name, allFields);
    const fields = allFields.filter((f) => !f.symbol);
    const symbolic = allFields.filter((f) => f.symbol);
    const lines = [`final class ${name}: ${['JSDynamic', ...this.shapeProtocols(allFields).map((x) => x.conformance)].join(', ')} {`];
    for (const f of fields) lines.push(`    var ${ident(f.name)}: ${f.type}`);
    for (const f of symbolic) lines.push(`    var ${f.name}: ${f.type}`);
    for (const x of this.shapeProtocols(allFields)) lines.push(...x.lines);
    // Keys in the order the literal that made this object wrote them, when not the declared order.
    lines.push('    private let jsOrder: [String]?');
    lines.push(`    init(${[...[...fields, ...symbolic].map((f) => `${ident(f.name)}: ${isFunctionType(f.type) ? '@escaping ' : ''}${f.type}${isOptional(f.type) ? ' = nil' : ''}`), 'jsOrder: [String]? = nil'].join(', ')}) {`);
    for (const f of [...fields, ...symbolic]) lines.push(`        self.${ident(f.name)} = ${ident(f.name)}`);
    lines.push('        self.jsOrder = jsOrder', '    }');
    // Read from an untyped object (a cast of JSON.parse): the keys it has beyond the type's stay readable, in its order.
    lines.push('    private var jsExtra: JSDynamic?');
    if (symbolic.length) { lines.push(...this.dynamicMembers(fields, className, false), '}'); return lines.join('\n'); }
    lines.push('    convenience init(jsObject: Any?) {');
    lines.push(`        self.init(${[...fields.map((f) => `${ident(f.name)}: ${this.fromAny(`jsField(jsObject, ${swiftString(f.name)})`, f.type)}`), 'jsOrder: (jsObject as? JSDynamic)?.jsKeys'].join(', ')})`);
    lines.push('        jsExtra = jsObject as? JSDynamic', '    }');
    const members = this.dynamicMembers(fields, className, false).map((l) => l.replace('default: return nil', 'default: return jsExtra?[jsKey: key] ?? nil').replace('default: break', 'default: jsExtra?[jsKey: key] = newValue'));
    const optional = fields.filter((f) => f.type.endsWith('?'));
    members[0] = `    var jsKeys: [String] {\n        let keys = jsOrder ?? [${fields.map((f) => swiftString(f.name)).join(', ')}]\n        return keys.filter { key in ${optional.length ? `switch key { ${optional.map((f) => `case ${swiftString(f.name)}: return ${ident(f.name)} != nil`).join('; ')}; default: return true }` : 'true'} }\n    }`;
    lines.push(...members);
    lines.push('}');
    return lines.join('\n');
  }

  /**
   * An object literal's class when it has accessors: each accessor runs a
   * closure the literal gives, with the object as `this`.
   */
  private accessorClass(name: string, fields: ShapeField[]): string {
    const lines = [`final class ${name}: JSDynamic, JSAccessorKeyed {`];
    const params: string[] = [];
    const inits: string[] = [];
    for (const f of fields) {
      const n = ident(f.name);
      if (!f.accessor) {
        lines.push(`    var ${n}: ${f.type}`);
        params.push(`${n}: ${isFunctionType(f.type) ? '@escaping ' : ''}${f.type}${isOptional(f.type) ? ' = nil' : ''}`);
        inits.push(`        self.${n} = ${n}`);
        continue;
      }
      const a = f.accessor;
      const getType = `(${name}) ${a.throws ? 'throws ' : ''}-> ${f.type}`;
      const setType = `(${name}, ${a.value}) -> Void`;
      if (a.get) { lines.push(`    private let __get_${f.name}: ${getType}`); params.push(`__get_${f.name}: @escaping ${getType}`); inits.push(`        self.__get_${f.name} = __get_${f.name}`); }
      if (a.set) { lines.push(`    private let __set_${f.name}: ${setType}`); params.push(`__set_${f.name}: @escaping ${setType}`); inits.push(`        self.__set_${f.name} = __set_${f.name}`); }
      const get = a.get ? `${a.throws ? 'try ' : ''}__get_${f.name}(self)` : 'nil';
      if (a.set) lines.push(`    var ${n}: ${f.type} {`, `        get { ${get} }`, `        set { __set_${f.name}(self, newValue${a.get ? '' : '!'}) }`, '    }');
      else lines.push(`    var ${n}: ${f.type} {`, `        get${a.throws ? ' throws' : ''} { ${get} }`, '    }');
    }
    lines.push('    private let jsOrder: [String]?');
    lines.push(`    init(${[...params, 'jsOrder: [String]? = nil'].join(', ')}) {`, ...inits, '        self.jsOrder = jsOrder', '    }');
    lines.push(`    var jsKeys: [String] { jsOrder ?? [${fields.map((f) => swiftString(f.name)).join(', ')}] }`);
    lines.push('    var jsClassName: String? { nil }');
    lines.push('    subscript(jsKey key: String) -> Any? {', '        get {', '            switch key {');
    for (const f of fields) lines.push(`            case ${swiftString(f.name)}: return ${f.accessor?.throws ? `(try? self.${ident(f.name)}) ?? nil` : `self.${ident(f.name)}`}`);
    lines.push('            default: return nil', '            }', '        }', '        set {', '            switch key {');
    for (const f of fields) if (!f.accessor || f.accessor.set) lines.push(`            case ${swiftString(f.name)}: self.${ident(f.name)} = ${this.fromAny('newValue', f.type)}`);
    lines.push('            default: break', '            }', '        }', '    }');
    lines.push('    func jsAccessorKind(_ key: String) -> String? {', '        switch key {');
    for (const f of fields) if (f.accessor) lines.push(`        case ${swiftString(f.name)}: return ${swiftString(f.accessor.get && f.accessor.set ? 'Getter/Setter' : f.accessor.get ? 'Getter' : 'Setter')}`);
    lines.push('        default: return nil', '        }', '    }', '}');
    return lines.join('\n');
  }

  /** What an object literal's class conforms to by its members: an iterator (`next`), an iterable (`[Symbol.iterator]`). */
  private shapeProtocols(fields: ShapeField[]): { conformance: string; lines: string[] }[] {
    const out: { conformance: string; lines: string[] }[] = [];
    const fn = (n: string) => {
      const f = fields.find((x) => x.name === n && !x.accessor);
      const parts = f && functionParts(f.type.replace(/^\((.*)\)\?$/, '$1'));
      return f && parts ? { name: n, params: parts.params.length, ret: parts.result, throws: true } : undefined;
    };
    const methods = ['next', 'return', 'throw'].map(fn).filter((m): m is NonNullable<typeof m> => !!m);
    const protocol = this.iteratorProtocol(methods);
    if (protocol) out.push(protocol);
    if (fields.some((f) => f.name === 'jsSymbolIterator')) out.push({ conformance: 'JSIterableValue', lines: ['    func jsAnyIterator() throws -> JSIteratorProtocol { try jsSymbolIterator() }'] });
    if (fields.some((f) => f.name === 'jsSymbolAsyncIterator')) out.push({ conformance: 'JSAsyncIterableValue', lines: ['    func jsAnyAsyncIterator() throws -> JSAsyncIteratorProtocol { try jsSymbolAsyncIterator() }'] });
    return out;
  }

  /** `JSDynamic`: the object's keys and members by name, for printing, JSON and untyped access. */
  private dynamicMembers(fields: { name: string; type: string }[], className: string | null, override: boolean, methods: { name: string; type: string }[] = [], symbols: { key: string; member: string; type: string }[] = []): string[] {
    const o = override ? 'override ' : '';
    const keys = fields.map((f) => (f.type.endsWith('?') ? `(self.${ident(f.name)} == nil ? [] : [${swiftString(f.name)}])` : `[${swiftString(f.name)}]`));
    const lines = [
      `    ${o}var jsKeys: [String] { ${[override ? 'super.jsKeys' : '', ...keys].filter(Boolean).join(' + ') || '[]'} }`,
      ...(symbols.length ? [`    var jsSymbolKeys: [String] { [${symbols.map((f) => f.key).join(', ')}] }`] : []),
      `    ${o}var jsClassName: String? { ${className ? swiftString(className) : 'nil'} }`,
      `    ${o}subscript(jsKey key: String) -> Any? {`,
      '        get {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: return ${this.untypedEnum(`self.${ident(f.name)}`, f.type)}`),
      ...symbols.map((f) => `            case ${f.key}: return ${f.member}`),
      ...methods.filter((m) => !fields.some((f) => f.name === m.name)).map((m) => `            case ${swiftString(m.name)}: return ${this.boxFunction(`self.${ident(m.name)}`, m.type)}`),
      `            default: return ${override ? 'super[jsKey: key]' : 'nil'}`,
      '            }',
      '        }',
      '        set {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: self.${ident(f.name)} = ${this.fromAny('newValue', f.type)}`),
      ...symbols.map((f) => `            case ${f.key}: ${f.member} = ${this.fromAny('newValue', f.type)}`),
      `            default: ${override ? 'super[jsKey: key] = newValue' : 'break'}`,
      '            }',
      '        }',
      '    }',
    ];
    return lines;
  }

  /** An untyped value read as `type`; with `orZero`, a missing value is the type's zero rather than a trap. */
  fromAnyCode(code: string, type: string, orZero = false): string {
    const zero = this.zero(type);
    if (orZero && zero && zero !== 'nil' && !type.endsWith('?')) return `((${code} as? ${type}) ?? ${zero})`;
    return this.fromAny(code, type);
  }

  /** Swift code reading an untyped value (`Any?`) as `type`. */
  private fromAny(code: string, type: string): string {
    if (type === 'Any?') return code;
    if (/^\(*(nil|jsNull)\)*$/.test(code)) {
      // Null where code checked without strictNullChecks declares a string, number or boolean: the type's zero, falsy as null is.
      if (type === 'String') return '""';
      if (type === 'Double') return '0';
      if (type === 'Bool') return 'false';
      return 'nil';
    }
    const m = /^JSArray<(.*)>$/.exec(type);
    if (m) return `jsArrayOf(${code}) { ${this.fromAny('$0', m[1])} }`;
    const r = /^JSRecord<(.*)>\??$/.exec(type);
    // A record's values are read as its type says where they have it (a gesture's extraData holds arrays beside its numbers).
    if (r) return type.endsWith('?') ? `{ (__r: Any?) -> ${type} in jsIsNullish(__r) ? nil : jsRecordOf(__r) { ${this.fromAnyCode('$0', r[1], true)} } }(${code})` : `jsRecordOf(${code}) { ${this.fromAnyCode('$0', r[1], true)} }`;
    const parts = /^\((.*)\)$/.exec(type) && splitTopLevel(type.slice(1, -1));
    if (parts && parts.length > 1 && !type.includes('->')) {
      // A tuple type reads an untyped array's elements.
      return `{ (__a: Any?) -> ${type} in (${parts.map((t, k) => this.fromAny(`jsField(__a, "${k}")`, t)).join(', ')}) }(${code})`;
    }
    const whole = hasTopLevelArrow(type) ? functionParts(type) : null;
    if (whole) return this.unboxFunction(code, whole);
    const base = type.replace(/\?$/, '');
    if (this.interfaces.has(base) || [...this.shapes.values()].some((s) => s.name === base)) {
      this.used.add(base);
      return type.endsWith('?') ? `jsIsNullish(${code}) ? nil : ${base}(jsObject: ${code})` : `${base}(jsObject: ${code})`;
    }
    const fn = functionParts(/^\(.*\)$/.test(base) && hasTopLevelArrow(base.slice(1, -1)) ? base.slice(1, -1) : base);
    if (fn) return type.endsWith('?') || type.endsWith(')?') ? `{ (__f: Any?) -> ${type} in jsIsNullish(__f) ? nil : ${this.unboxFunction('__f', fn)} }(${code})` : this.unboxFunction(code, fn);
    // A Core Foundation class casts unconditionally: `as?` to one is not a test Swift allows.
    if (/^(CG|CT|CF)[A-Z]\w*$/.test(base) && CF_CLASSES.has(base)) return type.endsWith('?') ? `(${code}).map { $0 as! ${base} }` : `(${code} as! ${base})`;
    return type.endsWith('?') ? `(${code} as? ${base})` : `(${code} as! ${type})`;
  }

  /** A typed function value as an untyped JavaScript function, callable through `jsCall`. */
  boxFunction(code: string, type: string): string {
    const fn = functionParts(isOptional(type) ? type.replace(/\?$/, '').replace(/^\((.*)\)$/, '$1') : type)!;
    const args = fn.params.map((p, k) => this.fromAnyCode(`jsArg(__a, ${k})`, p.replace(/^@escaping /, ''), true));
    const call = `try __f(${args.join(', ')})`;
    const body = fn.result === 'Void' ? `${call}; return nil` : `return ${this.convert(call, fn.result, 'Any?')}`;
    return `{ (__f: @escaping ${fn.text}) -> JSFunction in { (__a: [Any?]) throws -> Any? in ${body} } }(${code})`;
  }

  /** An untyped function value called as the typed function `fn`. */
  private unboxFunction(code: string, fn: FunctionParts): string {
    const params = fn.params.map((p, k) => `__p${k}: ${p}`);
    const call = `try jsCall(__f${fn.params.map((p, k) => `, ${this.convert(`__p${k}`, p.replace(/^@escaping /, ''), 'Any?')}`).join('')})`;
    const body = fn.result === 'Void' ? `_ = ${call}` : `return ${this.fromAnyCode(call, fn.result, true)}`;
    // A closure of exactly this type passes through as it is.
    return `{ (__f: Any?) -> ${fn.text} in (jsFlat(__f) as? ${fn.text}) ?? { (${params.join(', ')}) throws -> ${fn.result} in ${body} } }(${code})`;
  }

  /** Swift code of type `from` where Swift needs `to`: functions are adapted parameter by parameter. */
  convert(code: string, from: string, to: string): string {
    if (from === to) return code;
    if (to === 'Any?') {
      const opt = isOptional(from);
      const fn = functionParts(opt ? from.replace(/^\((.*)\)\?$/, '$1') : from);
      if (fn) return opt ? `{ (__g: ${from}) -> Any? in __g.map { ${this.boxFunction('$0', fn.text)} } }(${code})` : this.boxFunction(code, fn.text);
      return code;
    }
    if (from === 'Any?') return this.fromAny(code, to);
    // An event's data read as the object type a handler declares (`({ window }: { window: NativeWindow })`).
    if (from === 'EventData' && (this.interfaces.has(to.replace(/\?$/, '')) || [...this.shapes.values()].some((s) => s.name === to.replace(/\?$/, '')))) return this.fromAny(code, to);
    const f = functionParts(from.replace(/^\((.*)\)\?$/, '$1'));
    const g = functionParts(to.replace(/^\((.*)\)\?$/, '$1'));
    if (f && g && f.params.length <= g.params.length) {
      const params = g.params.map((p, k) => `__q${k}: ${p.replace(/^@escaping /, '')}`);
      const args = f.params.map((p, k) => this.convert(`__q${k}`, g.params[k].replace(/^@escaping /, ''), p.replace(/^@escaping /, '')));
      const call = `try __h(${args.join(', ')})`;
      const body = g.result === 'Void' ? `_ = ${call}` : `return ${this.convert(call, f.result, g.result)}`;
      const wrap = `{ (__h: @escaping ${f.text}) -> ${g.text} in { (${params.join(', ')}) throws -> ${g.result} in ${body} } }`;
      return from.endsWith('?') ? `(${code}).map(${wrap})` : `${wrap}(${code})`;
    }
    if (to === optionalType(from)) return code;
    if (from === optionalType(to)) return `${code}!`;
    return code;
  }

  private enumDecl(e: ts.EnumDeclaration): string {
    const lines = [`enum ${ident(e.name.text)} {`];
    for (const m of e.members) {
      const v = this.checker.getConstantValue(m);
      if (v === undefined) throw this.error(m, 'an enum member without a constant value');
      lines.push(`    static let ${ident(m.name.getText())}: ${typeof v === 'string' ? 'String' : 'Double'} = ${typeof v === 'string' ? swiftString(v) : String(v)}`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  // ---- Functions -----------------------------------------------------------------------------

  /** A native enum's value held untyped: its number, as the runtime marshals it; '' (from no code) when the type is not a native enum. */
  private untypedEnum(code: string, type: string): string {
    const base = type.replace(/\?$/, '');
    if (!this.native.isEnumType(base) || this.native.isOptionSetType(base)) return code;
    if (!code) return 'enum';
    return type.endsWith('?') ? `${code}.map { Double($0.rawValue) }` : `Double(${code}.rawValue)`;
  }

  /** A parameter's Swift type as `params` declares it (an unwrapped optional written as optional, as a function type has it). */
  private paramType(p: ts.ParameterDeclaration): string {
    const t = this.typeOf(p.name);
    if (p.questionToken || (p.initializer && !this.templateParams)) return p.initializer && this.isConstant(p.initializer) ? t : optionalType(t);
    return this.mayBeNull(p) ? optionalType(t) : t;
  }

  /**
   * An object parameter of a plugin, whose code is checked without
   * strictNullChecks: callers pass null and undefined for it (core's
   * `valueChanged(target, oldValue, newValue)` starts from undefined), so
   * Swift takes it as an implicitly unwrapped optional.
   */
  private mayBeNull(p: ts.ParameterDeclaration): boolean {
    if (!this.pluginFiles.has(p.getSourceFile().fileName) || p.dotDotDotToken || !ts.isIdentifier(p.name)) return false;
    const t = this.typeOf(p.name);
    return !t.endsWith('?') && !t.endsWith('!') && !['Double', 'String', 'Bool', 'Void', 'Never'].includes(t) && !hasTopLevelArrow(t) && !t.startsWith('(')
      && !this.native.isEnumType(t) && !this.native.isStructType(t);
  }

  private params(fn: ts.SignatureDeclaration, closure: boolean): string {
    return fn.parameters.map((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.dotDotDotToken) return `${closure ? '' : '_ '}${name}: ${this.typeOf(p.name)}`;
      let t = this.typeOf(p.name);
      if (this.mayBeNull(p)) t = `${t}!`;
      let given = '';
      if (p.questionToken || (p.initializer && !this.templateParams)) {
        if (!closure && p.initializer && this.isConstant(p.initializer)) given = ` = ${this.coerce(p.initializer, t)}`;
        else { t = optionalType(t); if (!closure) given = ' = nil'; }
      }
      if (isFunctionType(t)) t = '@escaping ' + t;
      return closure ? `${name}: ${t}` : `_ ${name}: ${t}${given}`;
    }).join(', ');
  }

  private isConstant(e: ts.Expression): boolean {
    return ts.isLiteralExpression(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(e.kind) || (ts.isPrefixUnaryExpression(e) && ts.isNumericLiteral(e.operand));
  }

  /** Statements a function body starts with: rest arrays, computed defaults, destructured parameters. */
  paramPrelude(fn: ts.SignatureDeclaration): string[] {
    const i = this.indent;
    const lines: string[] = [];
    fn.parameters.forEach((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      // A parameter the body assigns is a variable of its own (Swift parameters are constants).
      const assigned = ts.isIdentifier(p.name) && !!fn.body && assignsTo(fn.body, this.checker.getSymbolAtLocation(p.name), this.checker);
      const pt = this.typeOf(p.name);
      const untyped = !!p.initializer && (this.typeOf(p.initializer) === 'Any?' || ((ts.isElementAccessExpression(p.initializer) || ts.isPropertyAccessExpression(p.initializer)) && this.isAny(p.initializer.expression)));
      if (p.initializer && !this.templateParams && untyped && pt !== 'Any?' && !pt.endsWith('?') && ts.isIdentifier(p.name)) {
        // A default read from an untyped value (`mode = this.modes[side]`) may be undefined: the parameter is optional where Swift reads it.
        const sym = this.checker.getSymbolAtLocation(p.name);
        if (sym) this.undefinedVars.set(sym, optionalType(pt));
        const read = this.typeOf(p.initializer) === 'Any?' ? this.expr(p.initializer) : ts.isElementAccessExpression(p.initializer) ? `jsGet(${this.expr(p.initializer.expression)}, ${this.propertyKey(p.initializer.argumentExpression)})` : `jsGet(${this.expr((p.initializer as ts.PropertyAccessExpression).expression)}, ${swiftString((p.initializer as ts.PropertyAccessExpression).name.text)})`;
        lines.push(`${i}${assigned ? 'var' : 'let'} ${name}: ${optionalType(pt)} = ${this.tryPrefix(p.initializer)}${name} ?? ${this.fromAny(read, optionalType(pt))}`);
      } else if (p.initializer && !this.templateParams && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || !this.isConstant(p.initializer))) {
        lines.push(`${i}${assigned ? 'var' : 'let'} ${name}: ${this.typeOf(p.name)} = ${this.tryPrefix(p.initializer)}${name} ?? ${this.coerce(p.initializer, this.typeOf(p.name))}`);
      } else if (assigned) lines.push(`${i}var ${name} = ${name}`);
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, name, '', false));
    });
    return lines;
  }

  /** The Swift type a function returns: `JSPromise<T>` for an async one. */
  returnTypeOf(fn: ts.SignatureDeclaration): string {
    return this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    if (this.pluginFiles.has(fn.getSourceFile().fileName)) return '';
    const kept = (fn.typeParameters ?? []).filter((p) => !erasedTypeParameter(p));
    return kept.length ? `<${kept.map((p) => p.name.text).join(', ')}>` : '';
  }

  /** A function's body block (`{ … }`), lowered when the function is async. */
  /** The newest iOS version an API used by the function being translated needs, innermost function last. */
  private availability: number[] = [];

  requireAvailability(version: number) {
    if (this.availability.length) this.availability[this.availability.length - 1] = Math.max(this.availability[this.availability.length - 1], version);
    else this.moduleAvailability = Math.max(this.moduleAvailability, version);
  }
  private moduleAvailability = 0;

  /** Statements that use APIs newer than the deployment target, run only on an OS that has them (the app's own checks decide when). */
  availableOnly(version: number, lines: string, base: string): string {
    return `${base}if #available(iOS ${version}, *) {\n${lines.split('\n').map((l) => '    ' + l).join('\n')}\n${base}} else {\n${base}    fatalError("needs iOS ${version}")\n${base}}`;
  }

  functionBody(fn: ts.FunctionLikeDeclaration, ret: string, base: string): string {
    this.availability.push(0);
    let needs = 0;
    const body = this.functionBodyLines(fn, ret, base);
    needs = this.availability.pop()!;
    if (!needs) return body;
    const inner = body.slice(2, body.length - base.length - 2);
    return `{\n${this.availableOnly(needs, inner, base + '    ')}\n${base}}`;
  }

  private functionBodyLines(fn: ts.FunctionLikeDeclaration, ret: string, base: string): string {
    return this.inFunction(ret, () => {
      const saved = this.indent;
      this.indent = base + '    ';
      try {
        let lines: string[];
        if (fn.asteriskToken) lines = this.lowering.generatorBody(fn, ret.replace(/^JS\w+<(.*)>$/, '$1'), isAsync(fn));
        else if (isAsync(fn)) lines = this.lowering.body(fn, ret.replace(/^JSPromise<(.*)>$/, '$1'));
        else if (fn.body && ts.isBlock(fn.body)) {
          lines = [...this.paramPrelude(fn), ...this.statements([...fn.body.statements])];
          // The checker proved every path returns (an exhaustive switch); Swift cannot see that.
          const last = fn.body.statements.at(-1);
          if (!['Void', 'Never'].includes(ret) && !ret.endsWith('?') && last && ts.isSwitchStatement(last)) lines.push(`${this.indent}fatalError("unreachable: every case returns")`);
        }
        else {
          const e = fn.body as ts.Expression;
          lines = [...this.paramPrelude(fn), ret === 'Void' ? this.indent + this.tryPrefix(e) + this.exprStatement(e) : `${this.indent}return ${this.tryPrefix(e)}${this.coerce(e, ret)}`];
        }
        return `{\n${lines.filter(Boolean).join('\n')}\n${base}}`;
      } finally { this.indent = saved; }
    });
  }

  func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers = '', extraParams: string[] = []): string {
    const ret = this.returnTypeOf(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? ' throws' : '';
    const params = [this.params(fn, false), ...extraParams].filter(Boolean).join(', ');
    return `${modifiers}func ${name}${this.generics(fn)}(${params})${throws}${ret === 'Void' ? '' : ` -> ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  /** `(r) => r.id` as a Swift closure with explicit types. */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression, pad: string[] = []): string {
    // A callback whose slot returns void returns nothing, whatever its expression body evaluates to.
    const ret = this.closureReturn(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? 'throws ' : '';
    if (fn.name) throw this.error(fn, 'a named function expression');
    // A core callback slot passing more arguments than the closure declares: the rest unused, as Swift closures take every argument.
    const slot = this.slotOf(fn);
    const coreSlot = !!slot?.getDeclaration() && isCoreDeclaration(slot.getDeclaration() as ts.Declaration);
    const extra = coreSlot && !fn.parameters.length ? slot!.getParameters().filter((p) => !(p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken)).map((p, k) => `_ __unused${k}: ${this.type(this.checker.getTypeOfSymbolAtLocation(p, fn), fn)}`) : [];
    return `{ (${[this.params(fn, true), ...extra, ...pad].filter(Boolean).join(', ')}) ${throws}-> ${ret} in${this.functionBody(fn, ret, this.indent).slice(1)}`;
  }

  private slotOf(fn: ts.ArrowFunction | ts.FunctionExpression): ts.Signature | undefined {
    const context = this.checker.getContextualType(fn);
    return context ? this.checker.getNonNullableType(context).getCallSignatures()[0] : undefined;
  }

  /** What a closure literal returns in Swift: nothing where its slot returns void, else its own type. */
  private closureReturn(fn: ts.ArrowFunction | ts.FunctionExpression): string {
    const slot = this.slotOf(fn);
    const voidSlot = !!slot && !!(slot.getReturnType().flags & ts.TypeFlags.Void) && !isAsync(fn);
    const own = this.returnTypeOf(fn);
    const slotType = slot && !voidSlot && !(slot.getReturnType().flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) ? this.type(slot.getReturnType(), fn) : null;
    // An async callback's promise of a literal is the promise its slot declares (`Promise<IteratorResult<T>>`).
    if (isAsync(fn)) return slotType && slotType !== own && /^JSPromise<Object_/.test(own) && slotType.startsWith('JSPromise<') ? slotType : own;
    return voidSlot ? 'Void' : slotType && slotType !== own && /^Object_/.test(own) ? slotType : own;
  }

  /** A closure literal's Swift function type, as `closure` writes it. */
  private closureType(fn: ts.ArrowFunction | ts.FunctionExpression): string {
    return `(${fn.parameters.map((p) => (p.questionToken || this.mayBeNull(p) ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name))).join(', ')}) throws -> ${this.closureReturn(fn)}`;
  }

  /** A callback for an API that does not take throwing closures (a timer): what it throws is reported. */
  private callback(e: ts.Expression): string {
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const code = this.closure(e);
      return this.throwsInfo.fn(e) ? `{ jsReport(${code}) }` : code;
    }
    // A Promise executor's resolve passed as the callback (`setTimeout(resolve, ms)`) resolves with undefined.
    const resolvers = ts.isIdentifier(e) ? this.resolvers.get(this.resolve(e)!) : undefined;
    if (resolvers) return resolvers.type === 'Void' ? `{ ${resolvers.name}.resolve() }` : `{ ${resolvers.name}.resolve(${this.zero(resolvers.type) ?? 'nil'}) }`;
    // A function value is called with nothing, as the timer calls it: each parameter undefined.
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const pads = (sig?.getParameters() ?? []).map((p) => (this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e) === 'Void' ? '()' : 'nil'));
    return `{ jsReport { try ${this.expr(e)}(${pads.join(', ')}) } }`;
  }

  // ---- Classes -------------------------------------------------------------------------------

  /** The class's members; the caller adds `render()`. Returns the Swift lines inside the class. */
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

  componentMembers(cls: ts.ClassDeclaration, props: string[]): string[] {
    this.props = new Set(props);
    this.computed = new Set(cls.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && this.calleeName(m.initializer) === 'computed').map((m) => (m.name as ts.Identifier).text));
    const lines: string[] = [];
    const inits: string[] = [];
    const propParams: string[] = [];
    let late = false;
    this.indent = '    ';
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m) && isStatic(m)) {
        // A static field of a component or service (`static readonly PILL_HEIGHT = 44`): the class's.
        const name = (m.name as ts.Identifier).text;
        const t = this.typeOf(m.name);
        lines.push(m.initializer ? `    static ${hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) ? 'let' : 'var'} ${ident(name)}: ${t} = ${this.coerce(m.initializer, t)}` : `    static var ${ident(name)}: ${this.deferred(t)}`);
        continue;
      }
      if (ts.isPropertyDeclaration(m)) {
        const name = (m.name as ts.Identifier).text;
        const callee = m.initializer ? this.calleeName(m.initializer) : '';
        if (callee === 'input' || callee === 'input.required') {
          // An Angular input is a prop: a signal the parent writes.
          const t = this.typeOf(m.name).replace(/^Signal<(.*)>$/, '$1');
          const given = (m.initializer as ts.CallExpression).arguments[0];
          lines.push(`    let ${ident(name)}: Signal<${t}>`);
          propParams.push(`${ident(name)}: ${t}${given ? ` = ${this.expr(given)}` : ''}`);
          inits.push(`        self.${ident(name)} = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        // `signal.asReadonly()`: a field reading the signal it wraps.
        if (/\.asReadonly$/.test(callee) && ts.isPropertyAccessExpression((m.initializer as ts.CallExpression).expression)) {
          const source = ((m.initializer as ts.CallExpression).expression as ts.PropertyAccessExpression).expression;
          lines.push(`    var ${ident(name)}: ${this.typeOf(m.name)} { ${this.expr(source)}.value }`);
          continue;
        }
        if (callee === 'computed') {
          const fn = (m.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
          const t = this.returnTypeOf(fn);
          // A computed whose function throws rethrows to whoever reads it, as Angular's does.
          if (this.throwsInfo.fn(fn)) lines.push(`    var ${ident(name)}: ${t} {\n        get throws ${this.functionBody(fn, t, '        ')}\n    }`);
          else lines.push(`    var ${ident(name)}: ${t} ${this.functionBody(fn, t, '    ')}`);
          continue;
        }
        const t = this.typeOf(m.name);
        if (name === '$passed') {
          // The props the parent gave, for a spread that passes on only those.
          lines.push(`    let _passed: Set<String>`);
          propParams.push(`_passed: Set<String> = []`);
          inits.push(`        self._passed = _passed`);
          continue;
        }
        // An Angular component's field without an initializer is a field like any other: its inputs are `input()`s.
        if (!m.initializer && this.plainFields && !this.props.has(name)) {
          lines.push(`    var ${ident(name)}: ${this.deferred(t)}`);
          continue;
        }
        if (!m.initializer) {
          lines.push(`    let ${ident(name)}: Signal<${t}>`);
          // A callback prop is kept in its signal, so it outlives the initializer; a prop the parent may leave out is undefined.
          propParams.push(`${ident(name)}: ${isFunctionType(t) ? '@escaping ' : ''}${t}${m.questionToken && t.endsWith('?') ? ' = nil' : ''}`);
          inits.push(`        self.${ident(name)} = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        // A field the class assigns after construction (a Vue `let`) is a Swift `var`.
        const reassigned = !hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) && this.isAssigned(cls, name);
        // Swift lets a closure capture self only once every stored property has a value: from the
        // first initializer whose closure captures `this`, fields start nil.
        late ||= capturesThis(m.initializer);
        if (late) lines.push(`    var ${ident(name)}: ${t.endsWith('?') ? t : `${t}!`}`);
        else lines.push(`    ${reassigned ? 'var' : 'let'} ${ident(name)}: ${t}`);
        this.indent = '        ';
        inits.push(`        self.${ident(name)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
        continue;
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const t = this.returnTypeOf(m);
        const throws = this.throwsInfo.fn(m);
        const body = this.functionBody(m, t, '        ');
        lines.push(throws ? `    var ${ident((m.name as ts.Identifier).text)}: ${t} {\n        get throws ${body}\n    }` : `    var ${ident((m.name as ts.Identifier).text)}: ${t} ${this.functionBody(m, t, '    ')}`);
        continue;
      }
      if (ts.isMethodDeclaration(m)) {
        this.templateParams = /^\$[be]\d+$/.test(m.name.getText());
        try { lines.push('    ' + this.func(m, ident((m.name as ts.Identifier).text))); } finally { this.templateParams = false; }
        continue;
      }
    }
    // The constructor's body runs once every field is set; what it throws is reported, as a failed creation is.
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body?.statements.length);
    if (ctor) {
      this.indent = '            ';
      const body = this.statements([...ctor.body!.statements]);
      inits.push(`        ${body.some((l) => /\btry\b/.test(l)) ? 'jsReport' : 'do'} {\n${body.join('\n')}\n        }`);
    }
    this.indent = '';
    const throws = inits.some((l) => /\btry\b/.test(l) && !l.startsWith('        jsReport {')) ? ' throws' : '';
    if (throws && cls.name) this.throwingInits.add(cls.name.text);
    lines.push(`    init(${propParams.join(', ')})${throws} {`, ...inits, '    }');
    return lines;
  }

  /** Whether a component's method or getter throws, so its caller in `render()` reports what it throws. */
  memberThrows(cls: ts.ClassDeclaration, name: string): boolean {
    const m = cls.members.find((x) => x.name && ts.isIdentifier(x.name) && x.name.text === name);
    return !!m && !isAsync(m) && this.throwsInfo.fn(m);
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const nativeSubclass = this.native.classDecl(cls);
    if (nativeSubclass) return nativeSubclass;
    const name = this.topName(cls, cls.name!.text);
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    if (service) return [`final class ${name} {`, `    static let shared = ${name}()`, '', ...this.componentMembers(cls, []), '}'].join('\n');
    const c = this.checker;
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const baseDecl = heritage && c.getTypeAtLocation(heritage.expression).getSymbol()?.valueDeclaration;
    const appBase = baseDecl && ts.isClassLike(baseDecl) && !baseDecl.getSourceFile().isDeclarationFile ? baseDecl : undefined;
    let base: string | null = null;
    // A core class the class extends (directly or through the app's and plugins' classes): NativeScriptKit's class of that name.
    const kitRoot = this.kitRootOf(cls);
    if (heritage) {
      const baseName = heritage.expression.getText();
      if (appBase) base = this.className(appBase);
      else if (kitRoot && isCoreDeclaration(baseDecl)) base = kitRoot;
      else if (ERRORS[baseName]) base = ERRORS[baseName];
      else throw this.error(heritage, `extending ${baseName}`);
    }
    const isError = !!base && !appBase && !kitRoot;
    const isView = !!kitRoot && this.core.isKitView(kitRoot);
    const registered = (n: string) => isView && !!this.properties?.isRegistered(cls, n);
    // The library's interfaces (`Iterable<T>`, `Iterator<T>`) are protocols of the kit's, conformed to below.
    const implemented = (cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []).filter((i) => !isLibDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0])).map((i) => i.expression.getText());
    for (const i of implemented) this.used.add(i);
    const conformances = [...(base ? [base] : []), ...implemented];
    // A class's own toString is what JavaScript's string conversion calls.
    if (cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls)) conformances.push('JSStringConvertible');
    const header = () => `${this.extended.has(name) || this.extendedDecls.has(cls) ? '' : 'final '}class ${ident(name)}${this.generics(cls)}: ${[...(base || implemented.length ? [] : ['JSDynamic']), ...conformances].join(', ')} {`;
    const lines = [''];
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    const paramProps = (ctor?.parameters ?? []).filter((p) => ts.canHaveModifiers(p) && ts.getModifiers(p)?.some((m) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(m.kind)));
    const fieldInits: string[] = [];
    const fields: { name: string; type: string }[] = [];
    this.indent = '    ';
    for (const p of paramProps) {
      const n = (p.name as ts.Identifier).text;
      const t = this.typeOf(p.name);
      lines.push(`    var ${ident(n)}: ${this.deferred(t)}`);
      fields.push({ name: n, type: t });
    }
    const symbolFields: { key: string; member: string; type: string }[] = [];
    for (const m of cls.members) {
      if (!ts.isPropertyDeclaration(m)) continue;
      const keyed = this.symbolMember(m.name);
      if (keyed?.key && !isStatic(m)) {
        const t = this.typeOf(m.name);
        symbolFields.push({ key: keyed.key, member: keyed.member, type: t });
        lines.push(`    var ${keyed.member}: ${this.deferred(t)}`);
        if (m.initializer) {
          this.indent = '        ';
          fieldInits.push(`        self.${keyed.member} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
          this.indent = '    ';
        }
        continue;
      }
      if (keyed) throw this.error(m.name, 'a field named by this symbol');
      const n = m.name.getText();
      const t = this.typeOf(m.name);
      if (isStatic(m)) {
        const nullInit = !!m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined'));
        if (nullInit && !t.endsWith('?') && this.zero(t) === null) { lines.push(`    static var ${ident(n)}: ${this.deferred(t)} = nil`); continue; }
        if (!m.initializer && !t.endsWith('?') && this.zero(t) === null) { lines.push(`    static var ${ident(n)}: ${this.deferred(t)}`); continue; }
        lines.push(`    static var ${ident(n)}: ${t}${m.initializer ? ` = ${this.coerce(m.initializer, t)}` : t.endsWith('?') ? '' : ` = ${this.zero(t) ?? 'nil'}`}`);
        continue;
      }
      const nativeProperty = this.nativePropertyOf(m);
      if (nativeProperty) { lines.push(nativeProperty); continue; }
      if (registered(n)) {
        // A field under a registered property's name is the property: core's accessor on the prototype.
        lines.push(`    var ${ident(n)}: ${t} {`, `        get { ${this.fromAnyCode(`get(${swiftString(n)})`, t, true)} }`, `        set { set(${swiftString(n)}, ${this.convert('newValue', t, 'Any?')}) }`, '    }');
        if (m.initializer) {
          this.indent = '        ';
          fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
          this.indent = '    ';
        }
        continue;
      }
      fields.push({ name: n, type: t });
      // `field: string = null` in code checked without strictNullChecks: unset, read as the type's zero or an unwrapped nil.
      if (m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined')) && !t.endsWith('?')) { lines.push(`    var ${ident(n)}: ${this.deferred(t)}`); continue; }
      if (m.initializer && this.pure(m.initializer) && !refersToThis(m.initializer)) { lines.push(`    var ${ident(n)}: ${t} = ${this.coerce(m.initializer, t)}`); continue; }
      lines.push(`    var ${ident(n)}: ${this.deferred(t)}`);
      if (m.initializer) {
        this.indent = '        ';
        fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
      }
    }
    // Members whose names a base class declares too.
    const inherited = new Set<string>();
    for (let b = appBase; b; ) {
      for (const m of b.members) if (m.name) inherited.add(m.name.getText());
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && c.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    // The constructor: super() first, then parameter properties and field initializers, then the body (JavaScript's order).
    const baseCtor = appBase && this.constructorOf(appBase);
    if (ctor) {
      const throws = this.throwsInfo.fn(ctor) ? ' throws' : '';
      const sameAsBase = baseCtor ? this.params(baseCtor, false) === this.params(ctor, false) : ctor.parameters.length === 0 && (!!appBase || !!kitRoot);
      const body = this.inFunction('Void', () => {
        this.indent = '        ';
        const out: string[] = [...this.paramPrelude(ctor)];
        const stmts = [...ctor.body!.statements];
        const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
        const own = () => [...paramProps.map((p) => `        self.${ident((p.name as ts.Identifier).text)} = ${ident((p.name as ts.Identifier).text)}`), ...fieldInits];
        if (superAt < 0) out.push(...own(), ...this.statements(stmts));
        else {
          out.push(...this.statements(stmts.slice(0, superAt)));
          const call = (stmts[superAt] as ts.ExpressionStatement).expression as ts.CallExpression;
          out.push(`        ${this.tryPrefix(call)}super.init(${this.args(call).join(', ')})`, ...own(), ...this.statements(stmts.slice(superAt + 1)));
        }
        return out;
      });
      this.indent = '    ';
      lines.push(`    ${sameAsBase ? 'override ' : ''}init(${this.params(ctor, false)})${throws} {`, ...body, '    }');
    } else if (fieldInits.length) {
      if (baseCtor) lines.push(`    override init(${this.params(baseCtor, false)}) {`, `        super.init(${baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})`, ...fieldInits, '    }');
      else lines.push(`    ${appBase || kitRoot ? 'override ' : ''}init() {`, ...(appBase || kitRoot ? ['        super.init()'] : []), ...fieldInits, '    }');
    }
    // Accessors pair into one property.
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
    if (accessors.has('jsToStringTag')) conformances.push('JSToStringTag');
    for (const [n, a] of accessors) {
      // A property with only a setter reads as undefined in JavaScript.
      const t = a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name));
      const mods = `${a.get && isStatic(a.get) ? 'static ' : ''}${inherited.has(n) ? 'override ' : ''}`;
      const parts: string[] = [];
      if (a.get) parts.push(`        get${this.throwsInfo.fn(a.get) ? ' throws' : ''} ${this.functionBody(a.get, t, '        ')}`);
      else parts.push('        get { nil }');
      if (a.set) {
        if (this.throwsInfo.fn(a.set)) throw this.error(a.set, 'a setter that throws');
        const p = a.set.parameters[0].name as ts.Identifier;
        const body = this.functionBody(a.set, 'Void', '        ');
        parts.push(`        set {\n            let ${ident(p.text)} = newValue${a.get ? '' : '!'}${body.slice(1)}`);
      }
      lines.push(`    ${mods}var ${ident(n)}: ${t} {`, ...parts, '    }');
    }
    // A view class's type selector: its `@CSSType` name, else its class name, as core's `cssType` falls back to `typeName`.
    if (isView) {
      const cssType = (ts.getDecorators(cls) ?? []).map((d) => d.expression).find((e): e is ts.CallExpression => ts.isCallExpression(e) && e.expression.getText() === 'CSSType');
      const typeName = cssType && ts.isStringLiteralLike(cssType.arguments[0]) ? cssType.arguments[0].text : name;
      lines.push(`    override class var cssType: String { ${swiftString(typeName)} }`);
    }
    for (const d of ts.getDecorators(cls) ?? []) {
      if (!/^(CSSType|NativeClass)\b/.test(d.expression.getText())) throw this.error(d, `the class decorator ${d.expression.getText()}`);
    }
    // `[fooProperty.setNative](value)`: the class's native setter for that registered property.
    const setters: { property: string; method: string; param: string; throws: boolean }[] = [];
    for (const m of cls.members) {
      if (!ts.isMethodDeclaration(m) || !m.body || !ts.isComputedPropertyName(m.name)) continue;
      const keyed = this.symbolMember(m.name);
      if (keyed?.member === 'jsToPrimitive') {
        const ret = this.returnTypeOf(m);
        const throws = this.throwsInfo.fn(m);
        lines.push('    ' + this.func(m, '__symbol_toPrimitive'));
        const call = `${throws ? 'try ' : ''}__symbol_toPrimitive(${m.parameters.length ? 'hint' : ''})`;
        lines.push(`    func jsToPrimitive(_ hint: String) throws -> Any? { ${ret === 'Void' ? `${call}; return nil` : `return ${this.convert(call, ret, 'Any?')}`} }`);
        conformances.push('JSToPrimitive');
        continue;
      }
      if (keyed?.member === 'jsSymbolIterator' || keyed?.member === 'jsSymbolAsyncIterator') {
        lines.push('    ' + this.func(m, keyed.member));
        const async = keyed.member === 'jsSymbolAsyncIterator';
        conformances.push(async ? 'JSAsyncIterableValue' : 'JSIterableValue');
        lines.push(async ? `    func jsAnyAsyncIterator() throws -> JSAsyncIteratorProtocol { ${this.throwsInfo.fn(m) ? 'try ' : ''}jsSymbolAsyncIterator() }` : `    func jsAnyIterator() throws -> JSIteratorProtocol { ${this.throwsInfo.fn(m) ? 'try ' : ''}jsSymbolIterator() }`);
        continue;
      }
      if (keyed?.key) { lines.push('    ' + this.func(m, keyed.member)); continue; }
      if (keyed) throw this.error(m.name, 'a method named by this symbol');
      const property = this.setNativeOf(m.name.expression);
      if (!property) throw this.error(m.name, 'a computed method name');
      const method = `__setNative_${property}`;
      setters.push({ property, method, param: m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Void', throws: this.throwsInfo.fn(m) });
      lines.push('    ' + this.func(m, method));
    }
    if (setters.length) {
      if (!isView) throw this.error(cls, 'native setters on a class that is not a view');
      lines.push('    override func setProperty(_ name: String, _ value: Any?) {', '        switch name {');
      for (const st of setters) {
        const call = st.param === 'Void' ? `${st.method}()` : `${st.method}(${this.convert('value', 'Any?', st.param)})`;
        // What a native setter throws is reported, as core reports an error applying a property.
        lines.push(`        case ${swiftString(st.property)}: ${st.throws ? `jsReport { try ${call} }` : call}`);
      }
      lines.push('        default: super.setProperty(name, value)', '        }', '    }');
    }
    const dynMethods: { name: string; type: string }[] = [];
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && m.body && ts.isComputedPropertyName(m.name)) continue;
      if (ts.isMethodDeclaration(m) && !m.body && hasModifier(m, ts.SyntaxKind.AbstractKeyword)) {
        // An abstract method: subclasses override it.
        const ret = this.returnTypeOf(m);
        lines.push(`    func ${ident(m.name.getText())}(${this.params(m, false)})${this.throwsInfo.fn(m) ? ' throws' : ''}${ret === 'Void' ? '' : ` -> ${ret}`} { fatalError("abstract method ${name}.${m.name.getText()}") }`);
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      const n = m.name.getText();
      if (this.pluginFiles.has(cls.getSourceFile().fileName) && !inherited.has(n) && !(kitRoot && this.core.kitMember(kitRoot, n)) && !this.isNamed(n)) continue;
      const kit = kitRoot && !isStatic(m) && !inherited.has(n) ? this.core.kitMember(kitRoot, n) : null;
      if (kit && kit.kind === 'func') { lines.push(this.kitOverride(m, kit)); continue; }
      // An override declaring fewer parameters than the method it overrides takes the rest unused, as Swift matches signatures.
      const overridden = inherited.has(n) && !isStatic(m) ? this.inheritedMethod(cls, n) : undefined;
      const extra = overridden ? overridden.parameters.slice(m.parameters.length).map((p, k) => `_ __unused${k}: ${p.questionToken || p.initializer ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name)}`) : [];
      lines.push('    ' + this.func(m, ident(n), `${isStatic(m) ? 'static ' : ''}${inherited.has(n) && !isStatic(m) ? 'override ' : ''}`, extra));
      // A plugin's objects are read untyped too (`handler.attachToView(view)` on an `any`): their methods by name.
      if (this.pluginFiles.has(cls.getSourceFile().fileName) && !isStatic(m) && !m.parameters.some((p) => p.dotDotDotToken) && !extra.length) {
        dynMethods.push({ name: n, type: `(${m.parameters.map((p) => this.paramType(p)).join(', ')}) throws -> ${this.returnTypeOf(m)}` });
      }
    }
    if (isView) {
      const own = fields.map((f) => f.name);
      if (own.length) lines.push(`    override func hasJSProperty(_ name: String) -> Bool { [${own.map(swiftString).join(', ')}].contains(name) || super.hasJSProperty(name) }`);
    }
    const protocol = this.iteratorProtocol(cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && !isStatic(m) && ['next', 'return', 'throw'].includes(m.name.getText())).map((m) => ({
      name: m.name.getText(), params: m.parameters.length, ret: this.returnTypeOf(m), throws: this.throwsInfo.fn(m),
    })));
    if (protocol && !appBase && !kitRoot) { conformances.push(protocol.conformance); lines.push(...protocol.lines); }
    if (!isError) lines.push(...this.dynamicMembers(fields, name, !!appBase || !!kitRoot, dynMethods, symbolFields));
    if (symbolFields.length) conformances.push('JSSymbolKeyed');
    this.indent = '';
    lines.push('}');
    lines[0] = header();
    return lines.join('\n');
  }

  /**
   * A class or object with `next` (and `return`, `throw`) is an iterator
   * script wrote: the kit steps it through these, async when `next` returns a promise.
   */
  private iteratorProtocol(methods: { name: string; params: number; ret: string; throws: boolean }[]): { conformance: string; lines: string[] } | null {
    const next = methods.find((m) => m.name === 'next');
    if (!next || next.params > 1) return null;
    const call = (m: { name: string; params: number; throws: boolean }, arg: string) => `${m.throws ? 'try ' : ''}${ident(m.name)}(${m.params ? arg : ''})`;
    const ret = methods.find((m) => m.name === 'return'), thr = methods.find((m) => m.name === 'throw');
    if (next.ret.startsWith('JSPromise<')) {
      const promise = (m: { name: string; params: number; ret: string; throws: boolean }, arg: string) => {
        const c = call(m, arg);
        const body = m.ret === 'JSPromise<Any?>' ? c : `${c}.then { (__v: ${m.ret.replace(/^JSPromise<(.*)>$/, '$1')}) -> Any? in ${this.convert('__v', m.ret.replace(/^JSPromise<(.*)>$/, '$1'), 'Any?')} }`;
        return m.throws ? `{ do { return try { () throws -> JSPromise<Any?> in ${body} }() } catch { return JSPromise<Any?>.reject(jsCaught(error)) } }()` : body;
      };
      return { conformance: 'JSAsyncIteratorProtocol', lines: [
        `    func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { ${promise(next, 'value')} }`,
        `    func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? { ${ret ? promise(ret, 'value') : 'nil'} }`,
        `    func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? { ${thr ? promise(thr, 'error') : 'nil'} }`,
      ] };
    }
    const step = (m: { name: string; params: number; ret: string; throws: boolean }, arg: string) => `try jsStepOf(${this.convert(call(m, arg), m.ret, 'Any?')})`;
    return { conformance: 'JSIteratorProtocol', lines: [
      `    func jsNext(_ value: Any?) throws -> JSStep { ${step(next, 'value')} }`,
      `    func jsReturn(_ value: Any?) throws -> JSStep { ${ret ? step(ret, 'value') : 'JSStep(value, true)'} }`,
      `    func jsThrow(_ error: Any?) throws -> JSStep { ${thr ? step(thr, 'error') : 'throw JSException(error)'} }`,
      `    var jsHasReturn: Bool { ${!!ret} }`,
      `    var jsHasThrow: Bool { ${!!thr} }`,
    ] };
  }

  /**
   * A member named by a symbol (`[Symbol.toPrimitive]`, `[key]` for a
   * `const key = Symbol()`): its Swift name, and for a symbol of the program,
   * the Swift code of its property key.
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
   * The accessor goes through the native object by key.
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
    const ios = option(options, 'ios');
    const own = ios && ts.isObjectLiteralExpression(ios) ? ios : options;
    const text = (e?: ts.Expression) => (e && ts.isStringLiteralLike(e) ? e.text : null);
    const cap = key[0].toUpperCase() + key.slice(1);
    const getterName = text(option(own, 'nativeGetterName')) ?? `get${cap}`;
    const setterName = text(option(own, 'nativeSetterName')) ?? `set${cap}`;
    const converter = option(options, 'converter');
    const fromNative = converter && ts.isObjectLiteralExpression(converter) ? option(converter, 'fromNative') : undefined;
    const toNative = converter && ts.isObjectLiteralExpression(converter) ? option(converter, 'toNative') : undefined;
    const fallback = option(options, 'defaultValue');
    const t = this.typeOf(m.name);
    const read = `jsNativePropertyGet(self.native, ${swiftString(getterName)}, fallback: jsOr(jsField(self.options, ${swiftString(key)}), ${fallback ? this.coerce(fallback, 'Any?') : 'nil'}))`;
    const converted = fromNative ? `jsCall(${this.coerce(fromNative, 'Any?')}, ${read}, ${swiftString(key)})` : read;
    const write = toNative ? `jsCall(${this.coerce(toNative, 'Any?')}, value, ${swiftString(key)})` : 'value';
    return [
      `    var ${ident(key)}: ${optionalType(t)} {`,
      `        get { ${fromNative ? `(try? ${converted}).flatMap { ${this.fromAnyCode('$0', optionalType(t))} } ?? nil` : this.fromAnyCode(converted, optionalType(t))} }`,
      '        set {',
      `            let value: Any? = ${this.convert('newValue', optionalType(t), 'Any?')}`,
      `            jsReport { try jsSet(self.options, ${swiftString(key)}, value) }`,
      `            jsReport { jsNativePropertySet(self.native, ${swiftString(setterName)}, try ${write}) }`,
      '        }',
      '    }',
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
    const lines = [`extension ${target} {`];
    const hooks: string[] = [];
    const setters: string[] = [];
    this.indent = '    ';
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m)) {
        const n = m.name.getText();
        const t = optionalType(this.typeOf(m.name));
        lines.push(`    var ${ident(n)}: ${t} {`, `        get { ${this.fromAnyCode(`self[jsKey: ${swiftString(n)}]`, t)} }`, `        set { self[jsKey: ${swiftString(n)}] = ${this.convert('newValue', t, 'Any?')} }`, '    }');
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      if (ts.isComputedPropertyName(m.name)) {
        const property = this.setNativeOf(m.name.expression);
        if (!property) throw this.error(m.name, 'a computed method name');
        const param = m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Void';
        lines.push('    ' + this.func(m, `__setNative_${property}`));
        setters.push(`    View.nativeSetterHooks[${swiftString(property)}] = { view, value in (view as? ${target})?.__setNative_${property}(${param === 'Void' ? '' : this.convert('value', 'Any?', param)}) }`);
        continue;
      }
      const n = m.name.getText();
      if (n === 'initNativeView' || n === 'disposeNativeView') {
        lines.push('    ' + this.func(m, `__${name}_${n}`));
        hooks.push(`${n}: { view in jsReport { try (view as? ${target})?.__${name}_${n}() } }`);
        continue;
      }
      lines.push('    ' + this.func(m, ident(n)));
    }
    this.indent = '';
    lines.push('}', '', `func __install_${name}() {`);
    if (hooks.length) lines.push(`    View.lifecycleHooks.append(View.LifecycleHook(${hooks.join(', ')}))`);
    lines.push(...setters, '}');
    return lines.join('\n').replace(/__\w+_(initNativeView|disposeNativeView)\(\) throws/g, (x) => x);
  }

  /** The core class at the root of a class's chain of app and plugin classes, when NativeScriptKit has it. */
  kitRootOf(cls: ts.ClassLikeDeclaration): string | null {
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      if (!h) return null;
      const d = this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      if (d && isCoreDeclaration(d) && ts.isClassLike(d) && d.name && this.core.has(d.name.text)) return d.name.text;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return null;
  }

  /** The Swift name of a class the program declares. */
  private className(decl: ts.ClassLikeDeclaration): string {
    return decl.name ? ident(this.topName(decl, decl.name.text)) : 'AnonymousClass';
  }

  /** `fooProperty.setNative`: the registered name of the property it belongs to. */
  setNativeOf(e: ts.Expression): string | null {
    if (!ts.isPropertyAccessExpression(e) || e.name.text !== 'setNative') return null;
    return this.properties?.name(this.resolve(e.expression)) ?? null;
  }

  /**
   * A method overriding NativeScriptKit's: the kit's Swift signature, the
   * TypeScript body seeing its own types; what it throws is reported, as an
   * error escaping a native callback is.
   */
  private kitOverride(m: ts.MethodDeclaration, kit: KitMember): string {
    const kitParams = (kit.params ?? '').trim() ? splitTopLevel(kit.params!) : [];
    const parsed = kitParams.map((p, k) => {
      const colon = p.indexOf(':');
      const names = p.slice(0, colon).trim().split(/\s+/);
      const type = withoutDefault(p.slice(colon + 1)).trim();
      // `_ child: View` → `_ __k0: View`; `name: T` → `name __k0: T`; `label name: T` → `label __k0: T`.
      return { decl: `${names[0]} __k${k}: ${type}`, type: type.replace(/^@escaping\s+/, '') };
    });
    const tsRet = this.returnTypeOf(m);
    const ret = kit.type === 'Void' ? 'Void' : kit.type;
    const binds = m.parameters.map((p, k) => {
      const tsType = this.typeOf(p.name);
      const value = parsed[k] ? this.convert(`__k${k}`, parsed[k].type, tsType) : (this.zero(tsType) ?? 'nil');
      return ts.isIdentifier(p.name) ? `        let ${ident(p.name.text)}: ${tsType} = ${value}` : '';
    }).filter(Boolean);
    const throws = this.throwsInfo.fn(m);
    const body = this.inFunction(tsRet, () => this.functionBody(m, tsRet, '        '));
    const call = `{ () ${throws ? 'throws ' : ''}-> ${tsRet} in${body.slice(1)}()`;
    const result = ret === 'Void'
      ? (throws ? `        jsReport { _ = try ${call} }` : `        _ = ${call}`)
      : `        let __result: ${tsRet} = ${throws ? 'try! ' : ''}${call}\n        return ${this.convert('__result', tsRet, ret)}`;
    return [`    override func ${ident(m.name.getText())}(${parsed.map((p) => p.decl).join(', ')})${ret === 'Void' ? '' : ` -> ${ret}`} {`, ...binds, result, '    }'].join('\n');
  }

  /** The method of this name a class's app or plugin base classes declare. */
  private inheritedMethod(cls: ts.ClassLikeDeclaration, name: string): ts.MethodDeclaration | undefined {
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) {
      const m = b.members.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && x.name.getText() === name);
      if (m) return m;
    }
    return undefined;
  }

  private baseClassOf(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
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

  /** A list of statements at the current indent, function declarations hoisted as JavaScript hoists them. */
  statements(list: ts.Statement[]): string[] {
    const fns = list.filter(ts.isFunctionDeclaration);
    return [...fns, ...list.filter((s) => !ts.isFunctionDeclaration(s))].map((s) => this.stmt(s)).filter(Boolean);
  }

  block(b: ts.Statement, base = this.indent): string {
    const saved = this.indent;
    this.indent = base + '    ';
    try {
      const body = this.statements(ts.isBlock(b) ? [...b.statements] : [b]);
      return `{\n${body.join('\n')}\n${base}}`;
    } finally { this.indent = saved; }
  }

  /** Classes whose translated `init` throws (a field initializer that can). */
  readonly throwingInits = new Set<string>();
  initThrows(name: string): boolean { return this.throwingInits.has(name); }

  /** Component fields without an initializer are state, not props (Angular). */
  plainFields = false;

  /** With `--all-errors`: what each statement could not translate, collected so one run reports them all. */
  errors: string[] | null = null;

  stmt(s: ts.Statement): string {
    if (this.errors) {
      try { return this.stmtChecked(s); } catch (e) {
        const at = s.getSourceFile().getLineAndCharacterOfPosition(s.getStart());
        this.errors.push(e instanceof RangeError ? `${s.getSourceFile().fileName}:${at.line + 1}: ${e.message}${process.env.NS_NATIVE_STACKS ? '\n' + [...new Set((e.stack ?? '').split('\n').slice(1, 400).map((l) => l.trim().split(' ')[1]))].slice(0, 30).join(' ') : ''}` : (e as Error).message);
        return '';
      }
    }
    return this.stmtChecked(s);
  }

  private stmtChecked(s: ts.Statement): string {
    const code = this.statementCode(s);
    return code && this.lines ? this.lines.mark(s) + code : code;
  }

  private statementCode(s: ts.Statement): string {
    const i = this.indent;
    const a = this.asyncCtx;
    if (ts.isExpressionStatement(s)) {
      const code = this.exprStatement(s.expression);
      return i + (code.startsWith('do {') || code.startsWith('if ') ? '' : this.tryPrefix(s.expression)) + code;
    }
    if (ts.isReturnStatement(s)) {
      if (a) {
        const e = s.expression;
        if (!e) return `${i}${a.ret(null, false)}\n${i}return`;
        if (a.generator === 'async') return `${i}${this.lowering.returnIn(a, e)}\n${i}return`;
        const isPromise = this.typeOf(e).startsWith('JSPromise<');
        return `${i}${this.tryPrefix(e)}${a.ret(isPromise ? this.expr(e) : this.coerce(e, a.result), isPromise)}\n${i}return`;
      }
      return i + (s.expression ? `return ${this.tryPrefix(s.expression)}${this.coerce(s.expression, this.returnType)}` : this.returnType?.endsWith('?') ? 'return nil' : 'return');
    }
    if (ts.isIfStatement(s)) {
      // A condition the parameters' constant values decide: only the branch that runs.
      const fixed = this.reach?.constant(s.expression);
      if (fixed !== undefined) {
        const live = fixed ? s.thenStatement : s.elseStatement;
        return live ? `${i}do ${this.block(live)}` : '';
      }
      let out = `${i}if ${this.tryPrefix(s.expression)}${this.cond(s.expression)} ${this.block(s.thenStatement)}`;
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
          const body = this.nested(() => this.block(s.statement));
          const bind = this.nested(() => this.nested(() => this.bindTo(decl.name, `${it}.jsCurrent`, '', mutable)));
          return `${i}do {\n${i}    let ${it} = try ${js}\n${i}    defer { ${it}.jsClose() }\n${i}    ${label}while try ${it}.jsAdvance() {\n${bind}\n${i}        do ${body}\n${i}    }\n${i}}`;
        });
      }
      const iterable = this.iterable(s.expression);
      // A sequence that starts with a closure would read as the loop's body: parenthesized.
      const seq = this.tryPrefix(s.expression) + (/^\{/.test(iterable) ? `(${iterable})` : iterable);
      return this.loopBody(() => {
        const label = this.takeLabel();
        if (ts.isIdentifier(decl.name)) return `${i}${label}for ${mutable ? 'var ' : ''}${ident(decl.name.text)} in ${seq} ${this.block(s.statement)}`;
        const item = this.fresh('__item');
        const body = this.block(s.statement);
        return `${i}${label}for ${item} in ${seq} {\n${this.nested(() => this.bindTo(decl.name, item, '', mutable))}\n${body.slice(2)}`;
      });
    }
    if (ts.isForInStatement(s)) {
      const list = s.initializer as ts.VariableDeclarationList;
      const name = ident((list.declarations[0].name as ts.Identifier).text);
      return this.loopBody(() => `${i}${this.takeLabel()}for ${name} in jsKeysOf(${this.expr(s.expression)}) ${this.block(s.statement)}`);
    }
    if (ts.isForStatement(s)) return this.forStatement(s);
    if (ts.isWhileStatement(s)) return this.loopBody(() => `${i}${this.takeLabel()}while ${this.tryPrefix(s.expression)}${this.cond(s.expression)} ${this.block(s.statement)}`);
    if (ts.isDoStatement(s)) return this.loopBody(() => `${i}${this.takeLabel()}repeat ${this.block(s.statement)} while ${this.tryPrefix(s.expression)}${this.cond(s.expression)}`);
    if (ts.isBreakStatement(s) || ts.isContinueStatement(s)) {
      const isBreak = ts.isBreakStatement(s);
      if (s.label) return `${i}${isBreak ? 'break' : 'continue'} ${ident(s.label.text)}`;
      if (a && (isBreak ? a.brk && !this.plainBreak : a.cont && !this.plainContinue)) return `${i}${isBreak ? a.brk : a.cont}\n${i}return`;
      const target = isBreak ? this.breakTargets.at(-1) : null;
      return i + (isBreak ? (target ? `break ${target}` : 'break') : 'continue');
    }
    if (ts.isBlock(s)) return `${i}do ${this.block(s)}`;
    if (ts.isEmptyStatement(s)) return '';
    if (ts.isSwitchStatement(s)) return this.switchStatement(s);
    if (ts.isThrowStatement(s)) return `${i}throw ${this.tryPrefix(s.expression)}JSException(value: ${this.coerce(s.expression, 'Any?')})`;
    if (ts.isTryStatement(s)) return this.tryStatement(s);
    if (ts.isLabeledStatement(s)) {
      if (this.asyncCtx) throw this.error(s, 'a labeled statement in an async function');
      // A labeled block, `if` or `switch` is a labeled `do` that `break label` leaves.
      if (!ts.isIterationStatement(s.statement, false)) return `${i}${ident(s.label.text)}: do {\n${this.nested(() => this.stmt(s.statement))}\n${i}}`;
      this.label = ident(s.label.text);
      return this.stmt(s.statement);
    }
    if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      if (ts.isClassDeclaration(s)) throw this.error(s, 'a class declared inside a function');
      return '';
    }
    throw this.error(s, 'statement');
  }

  /** The label of the loop being translated (`outer:`), placed on the Swift loop that implements it. */
  private label: string | null = null;
  private takeLabel(): string {
    const l = this.label;
    this.label = null;
    return l ? `${l}: ` : '';
  }

  private loopBody(body: () => string): string {
    this.plainBreak++;
    this.plainContinue++;
    this.breakTargets.push(null);
    try { return body(); } finally { this.plainBreak--; this.plainContinue--; this.breakTargets.pop(); }
  }

  declarationList(list: ts.VariableDeclarationList, lowered: boolean): string {
    const constant = !!(list.flags & ts.NodeFlags.Const);
    return list.declarations.map((d) => this.declaration(d, constant, lowered)).join('\n');
  }

  /** One declaration; in lowered async code a later continuation may assign it, so it starts initialized. */
  declaration(d: ts.VariableDeclaration, constant: boolean, lowered: boolean): string {
    const i = this.indent;
    if (this.patterns.requiredCore(d)) return '';
    if (ts.isIdentifier(d.name)) {
      const t = this.typeOf(d.name);
      const name = ident(d.name.text);
      // Swift cannot always see that every path assigns a value TypeScript left undeclared (a switch without a default).
      if (!d.initializer) return `${i}var ${name}: ${lowered || t.endsWith('?') || this.zero(t) === null ? this.deferred(t) : t}`;
      if ((ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) && refersTo(d.initializer, this.checker.getSymbolAtLocation(d.name), this.checker)) {
        return `${i}var ${name}: ${this.deferred(t)}\n${i}${name} = ${this.coerce(d.initializer, t)}`;
      }
      const maybe = !lowered && !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
      if (maybe) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        return `${i}${constant ? 'let' : 'var'} ${name}: ${optionalType(t)} = ${this.tryPrefix(d.initializer)}${maybe}`;
      }
      return `${i}${constant ? 'let' : 'var'} ${name}: ${t} = ${this.tryPrefix(d.initializer)}${this.coerce(d.initializer, t)}`;
    }
    const tmp = this.fresh('__d');
    return `${i}let ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', !constant)}`;
  }

  /** The type and value a destructuring pattern reads from: an iterator yields only as many values as an array pattern names. */
  private destructured(name: ts.BindingName, init: ts.Expression): string {
    const js = ts.isArrayBindingPattern(name) ? this.jsIteration(init) : null;
    if (!js) return `: ${this.typeOf(init)} = ${this.tryPrefix(init)}${this.expr(init)}`;
    const rest = (name as ts.ArrayBindingPattern).elements.some((el) => ts.isBindingElement(el) && el.dotDotDotToken);
    return ` = try JSArray(${js}.${rest ? 'jsCollect()' : `jsTake(${(name as ts.ArrayBindingPattern).elements.length})`})`;
  }

  /** Declarations binding `name` (an identifier or a destructuring pattern) to the Swift value `value`. */
  bindTo(name: ts.BindingName, value: string, _type: string, mutable: boolean | 'assign'): string {
    const i = this.indent;
    const kw = mutable === 'assign' ? '' : mutable ? 'var ' : 'let ';
    const declare = (n: ts.Identifier, t: string, v: string) => (mutable === 'assign' ? `${i}${ident(n.text)} = ${v}` : `${i}${kw}${ident(n.text)}: ${t} = ${v}`);
    if (ts.isIdentifier(name)) return declare(name, this.typeOf(name), value);
    const lines: string[] = [];
    const source = this.checker.getTypeAtLocation(name);
    name.elements.forEach((el, k) => {
      if (ts.isOmittedExpression(el)) return;
      if (el.dotDotDotToken) {
        if (ts.isObjectBindingPattern(name)) {
          const named = name.elements.filter((x) => x !== el).map((x) => swiftString((x.propertyName ?? x.name).getText()));
          // The rest's type has no name of its own: a shape of its fields.
          const restType = this.shape(this.checker.getTypeAtLocation(el.name), el);
          const rest = this.fromAny(`jsObjectRest(${value}, [${named.join(', ')}])`, restType);
          lines.push(ts.isIdentifier(el.name) ? `${this.indent}${mutable === 'assign' ? '' : mutable ? 'var ' : 'let '}${ident(el.name.text)}${mutable === 'assign' ? '' : `: ${restType}`} = ${rest}` : this.bindTo(el.name, rest, '', mutable));
          return;
        }
        const tuple = this.checker.isTupleType(source) ? this.checker.getTypeArguments(source as ts.TypeReference).length : 0;
        const rest = tuple ? `(${Array.from({ length: Math.max(0, tuple - k) }, (_, n) => `${value}.${k + n}`).join(', ')})` : `${value}.slice(${k})`;
        lines.push(this.bindTo(el.name, rest, '', mutable));
        return;
      }
      let read: string;
      if (ts.isObjectBindingPattern(name)) {
        const key = (el.propertyName ?? el.name).getText();
        const record = /^JSRecord<(.*)>$/.exec(this.typeOf(name).replace(/\?$/, ''));
        read = this.isAny(name) ? `(try jsGet(${value}, ${swiftString(key)}))`
          : record ? this.undefinedAs(`${value}[${swiftString(key)}]`, ts.isIdentifier(el.name) ? this.typeOf(el.name) : record[1])
          : `${value}.${ident(key)}`;
      } else read = this.checker.isTupleType(source) ? `${value}.${k}` : `${value}[${k}]`;
      if (el.initializer) read = `(${read} ?? ${this.coerce(el.initializer, this.typeOf(el.name))})`;
      if (ts.isIdentifier(el.name)) {
        const t = this.typeOf(el.name);
        const fromAny = this.isAny(name) && t !== 'Any?' ? this.fromAny(read, t) : read;
        lines.push(declare(el.name, t, fromAny));
      } else {
        const tmp = this.fresh('__d');
        lines.push(`${i}let ${tmp} = ${read}`, this.bindTo(el.name, tmp, '', mutable));
      }
    });
    return lines.join('\n');
  }

  /** What `for…of` iterates in Swift: arrays, sets and iterators as they are, a map's entries, a string's code points. */
  iterable(e: ts.Expression): string {
    const js = this.jsIteration(e);
    if (js) return `${js}.jsCollect()`;
    const t = this.typeOf(e);
    // A tuple (`['a', 'b'] as const`) iterates its elements.
    if (t.startsWith('(') && this.checker.isTupleType(this.checker.getTypeAtLocation(e))) {
      const n = this.checker.getTypeArguments(this.checker.getTypeAtLocation(e) as ts.TypeReference).length;
      const el = splitTopLevel(t.slice(1, -1));
      const element = el.every((x) => x === el[0]) ? el[0] : 'Any?';
      return `({ (__t: ${t}) -> [${element}] in [${Array.from({ length: n }, (_, k) => `__t.${k}`).join(', ')}] }(${this.expr(e)}))`;
    }
    if (t === 'String') return `jsCodePoints(${this.expr(e)})`;
    if (t.startsWith('JSMap<')) return `${this.expr(e)}.entries()`;
    if (t === 'JSMatch') return `${this.expr(e)}.values`;
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
    return ['String', 'Double', 'Bool'].includes(type) ? this.undefinedAs(`(${code} as? ${type})`, type) : this.fromAnyCode(code, type, true);
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
    return `try ${isAsync ? this.asyncIteration(e) : this.iteratorCode(e)}`;
  }

  private forStatement(s: ts.ForStatement, scoped = false): string {
    const i = this.indent;
    const list = s.initializer && ts.isVariableDeclarationList(s.initializer) ? s.initializer : null;
    // A `let` loop variable is the loop's own: a sibling declaring the same name needs the loop in a scope of its own.
    if (!scoped && list && list.flags & ts.NodeFlags.BlockScoped && redeclaredBeside(s, list)) {
      return `${i}do {\n${this.nested(() => this.forStatement(s, true))}\n${i}}`;
    }
    const init = list ? this.declarationList(list, false) : s.initializer ? i + this.tryPrefix(s.initializer) + this.exprStatement(s.initializer as ts.Expression) : '';
    const cond = s.condition ? `${this.tryPrefix(s.condition)}${this.cond(s.condition)}` : 'true';
    const step = s.incrementor ? this.tryPrefix(s.incrementor) + this.exprStatement(s.incrementor) : '';
    // `let` loop variables a closure in the body captures are a fresh binding per iteration, as in JavaScript.
    const captured = list && !(list.flags & ts.NodeFlags.Const) && list.declarations.some((d) => ts.isIdentifier(d.name) && capturedIn(d.name, s.statement, this.checker));
    const labelName = ts.isLabeledStatement(s.parent) ? s.parent.label.text : null;
    const hasContinue = containsJump(s.statement, ts.SyntaxKind.ContinueStatement) || (!!labelName && continuesTo(s.statement, labelName));
    const label = this.takeLabel();
    return this.loopBody(() => {
      if (captured) {
        const names = list!.declarations.map((d) => ident((d.name as ts.Identifier).text));
        const first = this.fresh('__first');
        const outer = names.map((n) => `__outer_${n}`);
        const lines = [`${i}do {`, ...init.split('\n').map((l) => '    ' + l)];
        lines.push(...names.map((n, k) => `${i}    var ${outer[k]} = ${n}`), `${i}    var ${first} = true`, `${i}    ${label}while true {`);
        lines.push(...names.map((n, k) => `${i}        var ${n} = ${outer[k]}`));
        lines.push(`${i}        defer { ${names.map((n, k) => `${outer[k]} = ${n}`).join('; ')} }`);
        const body = this.nested(() => this.nested(() => this.block(s.statement)));
        lines.push(`${i}        if !${first} { ${step} }`, `${i}        ${first} = false`, `${i}        if !(${cond}) { break }`, `${i}        do ${body}`, `${i}    }`, `${i}}`);
        return lines.join('\n');
      }
      if (!step) return `${init ? init + '\n' : ''}${i}${label}while ${cond} ${this.block(s.statement)}`;
      if (hasContinue) {
        const first = this.fresh('__first');
        return `${init ? init + '\n' : ''}${i}var ${first} = true\n${i}${label}while true {\n${i}    if !${first} { ${step} }\n${i}    ${first} = false\n${i}    if !(${cond}) { break }\n${i}    do ${this.nested(() => this.block(s.statement))}\n${i}}`;
      }
      const body = this.block(s.statement).replace(/\n\s*}$/, '');
      return `${init ? init + '\n' : ''}${i}${label}while ${cond} ${body}\n${i}    ${step}\n${i}}`;
    });
  }

  private switchStatement(s: ts.SwitchStatement): string {
    const i = this.indent;
    const subject = this.fresh('__switch');
    const subjectType = this.typeOf(s.expression);
    const clauses = s.caseBlock.clauses;
    const fallback = clauses.findIndex(ts.isDefaultClause);
    if (fallback >= 0 && fallback < clauses.length - 1) return this.switchBlock(s, subject, subjectType);
    const lines = [`${i}let ${subject}: ${subjectType} = ${this.tryPrefix(s.expression)}${this.expr(s.expression)}`, `${i}switch ${subject} {`];
    let labels: ts.Expression[] = [];
    this.plainBreak++;
    this.breakTargets.push(null);
    try {
      clauses.forEach((c, k) => {
        if (ts.isCaseClause(c)) labels.push(c.expression);
        if (!c.statements.length && k < clauses.length - 1) return;
        if (ts.isDefaultClause(c)) {
          if (k < clauses.length - 1) throw this.error(c, 'a default clause before other cases');
          lines.push(`${i}default:`);
        } else if (subjectType === 'Any?') {
          // An untyped subject matches as `===` does.
          lines.push(`${i}case _ where ${labels.map((l) => `jsStrictEquals(${subject}, ${this.coerce(l, 'Any?')})`).join(' || ')}:`);
        } else if (labels.every((l) => ts.isLiteralExpression(l) || (ts.isPrefixUnaryExpression(l) && ts.isNumericLiteral(l.operand)))) {
          lines.push(`${i}case ${labels.map((l) => this.expr(l)).join(', ')}:`);
        } else {
          lines.push(`${i}case _ where ${labels.map((l) => `${subject} == ${this.expr(l)}`).join(' || ')}:`);
        }
        labels = [];
        const body = [...c.statements];
        const last = body.at(-1);
        const ends = last && (ts.isBreakStatement(last) || ts.isReturnStatement(last) || ts.isThrowStatement(last) || ts.isContinueStatement(last));
        if (last && ts.isBreakStatement(last) && !last.label) body.pop();
        const code = this.nested(() => this.statements(body));
        lines.push(...(code.length ? code : [`${i}    break`]));
        if (!ends && k < clauses.length - 1) lines.push(`${i}    fallthrough`);
      });
    } finally { this.plainBreak--; this.breakTargets.pop(); }
    if (!clauses.some(ts.isDefaultClause)) lines.push(`${i}default:`, `${i}    break`);
    lines.push(`${i}}`);
    return lines.join('\n');
  }

  /**
   * A switch whose default clause precedes cases, which Swift's switch cannot
   * say: the clause execution starts at is found first, then each clause runs
   * if it is at or after it (fallthrough), and `break` leaves the labeled block.
   */
  private switchBlock(s: ts.SwitchStatement, subject: string, subjectType: string): string {
    const i = this.indent;
    const label = this.fresh('__switchBlock');
    const start = this.fresh('__start');
    const clauses = s.caseBlock.clauses;
    const lines = [`${i}${label}: do {`, `${i}    let ${subject}: ${subjectType} = ${this.tryPrefix(s.expression)}${this.expr(s.expression)}`, `${i}    var ${start} = ${clauses.findIndex(ts.isDefaultClause)}`];
    const tests = clauses.flatMap((c, k) => {
      if (!ts.isCaseClause(c)) return [];
      const l = c.expression;
      const test = subjectType === 'Any?' || this.typeOf(l) === 'Any?' ? `jsStrictEquals(${subject}, ${this.coerce(l, 'Any?')})` : `${subject} == ${this.coerce(l, subjectType)}`;
      return [`if ${this.tryPrefix(l)}${test} { ${start} = ${k} }`];
    });
    lines.push(`${i}    ${tests.join(' else ')}`);
    this.plainBreak++;
    this.breakTargets.push(label);
    try {
      clauses.forEach((c, k) => {
        if (!c.statements.length) return;
        const code = this.nested(() => this.nested(() => this.statements([...c.statements])));
        lines.push(`${i}    if ${start} <= ${k} {`, ...code, `${i}    }`);
      });
    } finally { this.plainBreak--; this.breakTargets.pop(); }
    lines.push(`${i}}`);
    return lines.join('\n');
  }

  private tryStatement(s: ts.TryStatement): string {
    const i = this.indent;
    let code: string;
    if (s.catchClause) {
      const binding = s.catchClause.variableDeclaration;
      const bind = binding ? this.nested(() => this.bindTo(binding.name, 'jsCaught(error)', '', true)) + '\n' : '';
      const body = this.block(s.catchClause.block);
      code = `${i}do ${this.block(s.tryBlock)} catch {\n${bind}${body.slice(2)}`;
    } else code = `${i}do ${this.block(s.tryBlock)}`;
    if (!s.finallyBlock) return code;
    if (containsJump(s.finallyBlock, ts.SyntaxKind.ReturnStatement) || containsJump(s.finallyBlock, ts.SyntaxKind.ThrowStatement)) throw this.error(s.finallyBlock, 'return or throw in a finally block');
    const fin = this.nested(() => this.block(s.finallyBlock!));
    const inner = this.nested(() => this.tryStatement(ts.factory.updateTryStatement(s, s.tryBlock, s.catchClause, undefined)));
    return `${i}do {\n${i}    defer ${fin}\n${inner}\n${i}}`;
  }

  exprStatement(e: ts.Expression): string {
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(e.left)) {
      // `[a, b] = [b, a]`: the right side is evaluated before any target is written.
      const tmp = this.fresh('__swap');
      const tuple = this.checker.isTupleType(this.checker.getTypeAtLocation(e.right));
      const assigns = e.left.elements.map((target, k) => (ts.isOmittedExpression(target) ? '' : `${this.lvalue(target)} = ${tuple ? `${tmp}.${k}` : `${tmp}[${k}]`}`)).filter(Boolean);
      return `do { let ${tmp} = ${this.tryPrefix(e.right)}${this.expr(e.right)}; ${assigns.join('; ')} }`;
    }
    if (ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) {
      const step = e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : e.operator === ts.SyntaxKind.MinusMinusToken ? '-' : null;
      // An untyped variable counts as a number (`let i; … i++`).
      if (step && (this.isAny(e.operand) || this.declaredTypeOf(e.operand) === 'Any?')) return `${this.lvalue(e.operand)} = jsToNumber(${this.expr(e.operand)}) ${step} 1`;
      if (step) return `${this.lvalue(e.operand)} ${step}= 1`;
    }
    // `a = b = value`: the value once, then each target from the innermost out.
    const assignment = (x: ts.Expression): ts.BinaryExpression | null => {
      while (ts.isParenthesizedExpression(x)) x = x.expression;
      return ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken ? x : null;
    };
    if (assignment(e) && assignment(assignment(e)!.right)) {
      const chain: ts.BinaryExpression[] = [];
      for (let a = assignment(e); a; a = assignment(a.right)) chain.push(a);
      let value = chain.at(-1)!.right;
      while (ts.isParenthesizedExpression(value)) value = value.expression;
      const tmp = this.fresh('__assigned');
      const out = [`let ${tmp}: ${this.typeOf(value)} = ${this.tryPrefix(value)}${this.expr(value)}`];
      const read = [value, ...chain.slice(1)];
      this.subst.set(value, tmp);
      try {
        for (const a of [...chain].reverse()) {
          out.push(`${this.tryPrefix(a)}${this.expr(a)}`);
          this.subst.set(a, tmp);
        }
      } finally { for (const r of [...read, ...chain]) this.subst.delete(r); }
      return `do { ${out.join('; ')} }`;
    }
    // `i = 0, l = n`: each in turn.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.CommaToken) return `${this.exprStatement(e.left)}; ${this.tryPrefix(e.right)}${this.exprStatement(e.right)}`;
    if (ts.isAwaitExpression(e) && this.subst.has(e)) return `_ = ${this.subst.get(e)}`;
    const code = this.expr(e);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return code;
    // A call whose result is unused (`arr.push(x)` returns the length in JavaScript).
    return ts.isCallExpression(e) && !['Void', 'Never'].includes(this.typeOf(e)) ? `_ = ${code}` : ts.isCallExpression(e) || ts.isNewExpression(e) ? code : `_ = ${code}`;
  }

  /** `try ` when evaluating `e` can throw. */
  tryPrefix(e: ts.Node): string {
    return this.throwsInfo.expr(e) ? 'try ' : '';
  }

  /** An expression where Swift needs a value of `target`. */
  coerce(e: ts.Expression, target: string): string {
    // An iterable where the type names only its iteration: the kit's iterable of it.
    const iterableSlot = /^JS(Async)?Iterable<.*>\??$/.exec(target);
    if (iterableSlot && !/^JS(Async)?(Iterable|Iterator|Generator)</.test(this.typeOf(e))) return `${iterableSlot[1] ? 'jsAsyncIterable' : 'jsIterable'}(${this.expr(e)})`;
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text) && !e.arguments?.length && /^JS(Map|Set)</.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    // `[]` where an array of a type is wanted is an empty array of it.
    let bare: ts.Expression = e;
    while (ts.isParenthesizedExpression(bare) || ts.isAsExpression(bare)) bare = bare.expression;
    if (ts.isArrayLiteralExpression(bare) && !bare.elements.length && /^JSArray<.*>$/.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    const source = this.typeOf(e);
    if (target.endsWith('?') && target !== 'Any?' && !source.endsWith('?')) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?' && this.untypedEnum('', source)) return this.untypedEnum(this.expr(e), source);
    if (target === 'Any?') {
      const maybe = this.maybeUndefined(e);
      if (maybe) return `(${maybe} as Any?)`;
      if (source === 'Double' && numericLiteralOnly(e)) return `Double(${this.expr(e)})`;
      if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && !e.parameters.some((p) => p.dotDotDotToken || !ts.isIdentifier(p.name))) return this.convert(this.expr(e), this.closureType(e), 'Any?');
      if (functionParts(source.replace(/\?$/, '').replace(/^\((.*)\)$/, '$1'))) return this.convert(this.expr(e), source, 'Any?');
      // An object read with an unwrap (`view.parent!`) is undefined where it is missing, as an untyped value can be.
      const code = this.expr(e);
      return /[\w)\]]!$/.test(code) && this.isObjectRef(e) ? code.slice(0, -1) : code;
    }
    // A number where Swift has a native enum or option set (`UIMenuOptions.A | UIMenuOptions.B`).
    if (source === 'Double' && target !== 'Double' && this.native.isEnumType(target.replace(/\?$/, ''))) return this.native.enumFromNumber(this.expr(e), target);
    // A value TypeScript's strict typing calls possibly undefined where the code expects one (`map.get(k)` after `has(k)`).
    if (source === optionalType(target) && target !== 'Any?' && !target.endsWith('?') && !isFunctionType(target)) return this.undefinedAs(this.expr(e), target);
    if (source !== target && !ts.isArrowFunction(e) && !ts.isFunctionExpression(e) && functionParts(source.replace(/^\((.*)\)\?$/, '$1')) && functionParts(target.replace(/^\((.*)\)\?$/, '$1'))) return this.convert(this.expr(e), source, target);
    if (source === 'Any?' && target !== 'Void') {
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.expr(e);
      return this.fromAny(this.expr(e), target);
    }
    return this.expr(e);
  }

  /** A condition: Swift needs a Bool where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsTruthy(${maybe} as Any?)`;
    // `a && b` as a condition is whether both are truthy, whatever values the operands have.
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind) && !this.throwsInfo.expr(e.right)
        && !(this.isBool(e.left) && this.isBool(e.right))) {
      return `(${this.cond(e.left)} ${e.operatorToken.getText()} ${this.cond(e.right)})`;
    }
    if (this.isBool(e)) return this.expr(e);
    return `jsTruthy(${this.expr(e)})`;
  }

  // ---- Expressions -----------------------------------------------------------------------------

  expr(e: ts.Expression): string {
    const s = this.subst.get(e);
    if (s) return s;
    if (ts.isParenthesizedExpression(e) && ts.isBinaryExpression(e.expression) && e.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(e.expression.left)) {
      // `(match = re.exec(s)) !== null`: the assignment's value is the variable after it (Swift's assignment has none).
      const a = e.expression;
      const t = this.declaredTypeOf(a.left) ?? this.typeOf(a.left);
      const tp = this.tryPrefix(a);
      return `({ () ${tp ? 'throws ' : ''}-> ${t} in ${tp}${this.expr(a)}; return ${this.expr(a.left)} }())`;
    }
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    if (ts.isNumericLiteral(e)) return numberLiteral(e.text);
    if (ts.isBigIntLiteral(e)) return `JSBigInt(literal: ${swiftString(e.text.replace(/n$/, ''))})`;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return swiftString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (e.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (e.kind === ts.SyntaxKind.NullKeyword) return this.typeOf(e) === 'Any?' && !this.optionalContext(e) ? 'jsNull' : 'nil';
    if (e.kind === ts.SyntaxKind.ThisKeyword) return 'self';
    if (e.kind === ts.SyntaxKind.SuperKeyword) return 'super';
    if (ts.isIdentifier(e)) return this.identifier(e);
    if (ts.isTemplateExpression(e)) {
      const pieces = e.templateSpans.map((span) => this.str(span.expression));
      // A string literal's interpolation is one line in Swift: a multi-line piece (a closure) joins the literal's parts instead.
      if (pieces.some((p) => p.includes('\n'))) {
        const parts = [`"${this.escapeInterpolated(e.head.text)}"`];
        e.templateSpans.forEach((span, k) => parts.push(`(${pieces[k]})`, `"${this.escapeInterpolated(span.literal.text)}"`));
        return `[${parts.join(', ')}].joined()`;
      }
      let out = this.escapeInterpolated(e.head.text);
      e.templateSpans.forEach((span, k) => { out += `\\(${pieces[k]})` + this.escapeInterpolated(span.literal.text); });
      return `"${out}"`;
    }
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) {
      const from = this.typeOf(e.expression);
      const to = this.typeOf(e);
      if (from === 'Double' && this.native.isEnumType(to)) return this.native.toSwift(e.expression, to);
      if (to === 'Never') return this.expr(e.expression);
      if (from === 'Any?' && to !== 'Any?') return this.fromAny(this.expr(e.expression), to);
      if (from !== to && from.replace(/[?!]$/, '') !== to.replace(/[?!]$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) return `(${this.expr(e.expression)} as! ${to})`;
      return this.expr(e.expression);
    }
    if (ts.isNonNullExpression(e)) {
      const inner = this.expr(e.expression);
      return this.typeOf(e.expression).endsWith('?') ? `${inner}!` : inner;
    }
    if (ts.isPropertyAccessExpression(e)) return this.property(e);
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isCallExpression(e)) return this.call(e);
    if (ts.isNewExpression(e)) return this.newExpr(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) {
      const fn = e.operator === ts.SyntaxKind.PlusPlusToken ? 'jsPostIncrement' : 'jsPostDecrement';
      return `${fn}(&${this.lvalue(e.operand)})`;
    }
    if (ts.isConditionalExpression(e)) {
      const t = this.typeOf(e);
      // Branches of different types are untyped values alike.
      const branch = (x: ts.Expression) => (t === 'Any?' && !['Any?', 'Void'].includes(this.typeOf(x)) && x.kind !== ts.SyntaxKind.NullKeyword ? `(${this.coerce(x, t)} as Any?)` : this.coerce(x, t));
      return `(${this.cond(e.condition)} ? ${branch(e.whenTrue)} : ${branch(e.whenFalse)})`;
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
      if (ts.isPropertyAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${swiftString(target.name.text)})`;
      if (ts.isPropertyAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${swiftString(target.name.text)})`;
      if (ts.isElementAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${this.propertyKey(target.argumentExpression)})`;
      throw this.error(e, 'delete of this member');
    }
    if (ts.isVoidExpression(e)) return `{ _ = ${this.expr(e.expression)}; return nil as Any? }()`;
    if (ts.isRegularExpressionLiteral(e)) {
      const text = e.text;
      const end = text.lastIndexOf('/');
      return `jsRegExpLiteral(${swiftString(text.slice(1, end))}, ${swiftString(text.slice(end + 1))})`;
    }
    throw this.error(e, 'expression');
  }

  /** ``tag`a${x}b` ``: the tag called with the site's strings (cooked, and raw as `strings.raw`), then the values. */
  private taggedTemplate(e: ts.TaggedTemplateExpression): string {
    const { cooked, raw, values } = templateParts(e.template);
    if (isStringRaw(e.tag, this.checker)) return `(${raw.map((r, k) => swiftString(r) + (k < values.length ? ` + ${this.str(values[k])}` : '')).join(' + ')})`;
    const site = `__template${this.templateObjects.length}`;
    this.templateObjects.push(`let ${site} = jsTemplateObject([${cooked.map(swiftString).join(', ')}], raw: [${raw.map(swiftString).join(', ')}])`);
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

  /** Whether a `null` here lands in an optional typed slot rather than an untyped one. */
  private optionalContext(e: ts.Expression): boolean {
    const ctx = this.checker.getContextualType(e);
    return !!ctx && !(ctx.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) && this.type(ctx, e) !== 'Any?';
  }

  private identifier(e: ts.Identifier): string {
    const name = e.text;
    if (name === 'undefined') return 'nil';
    if (name === 'NaN') return 'Double.nan';
    if (name === 'Infinity') return 'Double.infinity';
    const native = this.native.identifier(e);
    if (native) return native;
    const sym = this.resolve(e);
    const required = this.patterns.requiredCore(sym?.valueDeclaration);
    if (required) return `${required}.self`;
    const p = e.parent;
    if (sym && sym.flags & ts.SymbolFlags.Class && !(ts.isPropertyAccessExpression(p) && p.expression === e) && !(ts.isNewExpression(p) && p.expression === e)
        && !(ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && p.right === e) && !ts.isHeritageClause(p.parent ?? p)) {
      // An Angular component as a value (`dialog.open(Sheet)`): what creating and rendering it gives.
      const decl = sym.valueDeclaration;
      if (decl && ts.isClassDeclaration(decl) && (ts.getDecorators(decl) ?? []).some((d) => /^Component\(/.test(d.expression.getText()))) {
        return `ComponentFactory { ${this.initThrows(ident(this.declaredName(e))) ? 'try! ' : ''}${ident(this.declaredName(e))}().render() }`;
      }
      return `${ident(this.declaredName(e))}.self`;
    }
    return this.narrowed(e, this.globalAlias(e) ?? ident(this.declaredName(e)));
  }

  /** The kit class a mixin class (`applyMixins(View, [Extended])`) is applied to. */
  mixinOf(sym: ts.Symbol | undefined): string | null {
    const d = sym?.valueDeclaration;
    return d && ts.isClassDeclaration(d) ? this.patterns.mixinTarget(d) : null;
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

  /** A module-level function or variable's Swift name. */
  private topName(decl: ts.Node, name: string): string {
    return this.topNames().get(decl) ?? name;
  }

  private renamedTop: Map<ts.Node, string> | null = null;
  /**
   * Module-level functions and variables of the same name in several modules
   * (a plugin's `install` in its common and iOS files): all but one take the
   * module's name as a suffix, as Swift has one namespace for the app.
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
        if (ts.isFunctionDeclaration(st) && st.name) add(st.name.text, st);
        if (ts.isVariableStatement(st) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) add(d.name.text, d);
      }
    }
    this.renamedTop = new Map();
    for (const [name, list] of byName) {
      // A plugin class named as a NativeScriptKit class (one extending core's `Observable`) takes its module's name too.
      const kitClash = list.some((x) => ts.isClassDeclaration(x.decl)) && this.core.has(name);
      if (list.length < 2 && !kitClash) continue;
      // The app's first declaration keeps its name; the others take their module's.
      const keep = kitClash ? undefined : list.find((x) => !this.pluginFiles.has(x.file.fileName)) ?? list[0];
      for (const x of list) {
        if (x === keep) continue;
        const module = x.file.fileName.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/\W/g, '_');
        this.renamedTop.set(x.decl, `${name}__${module}`);
        // Every declaration of an overloaded function names the same Swift function.
        if (ts.isFunctionDeclaration(x.decl)) for (const st of x.file.statements) if (ts.isFunctionDeclaration(st) && st.name?.text === name) this.renamedTop.set(st, `${name}__${module}`);
      }
    }
    return this.renamedTop;
  }

  /**
   * A module-level variable read inside a class with a member of the same name
   * (`readonly fruits = fruits`): Swift would resolve the name to the member,
   * so the read goes through a global alias of the variable.
   */
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
      this.globalAliases.set(alias, `var ${alias}: ${t} {${constant ? ` ${ident(e.text)} ` : ` get { ${ident(e.text)} } set { ${ident(e.text)} = newValue } `}}`);
    }
    return alias;
  }

  /** A read the checker has narrowed (`if (x) x.length`, `if (e instanceof Error) e.message`): Swift needs the unwrap or cast. */
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
    // Narrowed to `never` (a branch the checker deems unreachable): the declared value as it is.
    if (declared === actual || actual === 'Any?' || actual === 'Never') return code;
    if (declared === optionalType(actual)) return `${code}!`;
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && this.isObjectRef(e)) return `(${code} as! ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isPropertyAccessExpression(e) && this.isSelf(e.expression) && this.props.has(e.name.text)) return `self.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e)) return `${this.expr(e.expression)}.${ident(e.name.text)}`;
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return ident(this.declaredName(e));
    return this.expr(e);
  }

  private escapeInterpolated(text: string): string {
    return swiftString(text).slice(1, -1);
  }

  /** An operand of `+` beside a string: an object converts with the default hint. */
  private concatOperand(e: ts.Expression): string {
    return this.isObjectRef(e) && !this.maybeUndefined(e) && this.typeOf(e) !== 'JSSymbol' ? `jsToStringDefault(${this.expr(e)})` : this.str(e);
  }

  /** A property key: a symbol's own key, anything else as a string. */
  private propertyKey(e: ts.Expression): string {
    return this.typeOf(e) === 'JSSymbol' ? `${this.expr(e)}.key` : this.str(e);
  }

  /** A value as JavaScript converts it to a string (`String(x)`, `${x}`, `'' + x`). */
  str(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsToString(${maybe} as Any?)`;
    const t = this.typeOf(e);
    if (t === 'String') return this.expr(e);
    if (t === 'Double' || t === 'Bool') return `js(${this.expr(e)})`;
    return `jsToString(${this.expr(e)})`;
  }

  private property(e: ts.PropertyAccessExpression): string {
    // A field of an erased type parameter (`Cached<T>.data`) holds any value: read as this instantiation types it.
    const decl = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const declared = decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type && ts.isTypeReferenceNode(decl.type)
      ? this.checker.getSymbolAtLocation(decl.type.typeName)?.declarations?.[0] : undefined;
    if (declared && ts.isTypeParameterDeclaration(declared) && erasedTypeParameter(declared)) {
      const want = this.typeOf(e);
      const read = this.propertyRead(e);
      return want === 'Any?' ? read : this.fromAny(read, want);
    }
    return this.propertyRead(e);
  }

  private propertyRead(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    // A dynamic object (an allSettled result, a lookup table): its field read by name, as its type says.
    if (this.typeOf(target).replace(/[?!]$/, '') === 'JSObject' && !e.questionDotToken) return this.fromAnyCode(`jsField(${this.expr(target)}, ${swiftString(name)})`, this.typeOf(e), true);
    if (this.isSelf(target) && this.props.has(name)) return `self.${ident(name)}.value`;
    if (name === 'raw' && this.symbolName(target) === 'TemplateStringsArray') return `jsTemplateRaw(${this.expr(target)})`;
    if (name === 'description' && this.typeOf(target) === 'JSSymbol') return `${this.expr(target)}.jsDescription`;
    if (ts.isIdentifier(target) && this.isLibGlobal(target)) {
      const constant = LIB_CONSTANTS[`${target.text}.${name}`];
      if (constant) return constant;
      throw this.error(e, `${target.text}.${name}`);
    }
    // A member of an enum a library declares (core's GestureStateTypes.began): its value.
    const enumMember = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const constant = enumMember && ts.isEnumMember(enumMember) ? this.checker.getConstantValue(enumMember) : undefined;
    if (constant !== undefined && enumMember!.getSourceFile().isDeclarationFile && !this.native.module(enumMember)) {
      return typeof constant === 'string' ? swiftString(constant) : `Double(${constant})`;
    }
    const maybeChain = e.questionDotToken ? this.maybeUndefined(e) : null;
    if (maybeChain) return this.undefinedAs(maybeChain, this.typeOf(e));
    const core = this.core.property(e);
    if (core) return core;
    if (this.isExpando(e)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${swiftString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, t, true);
    }
    const native = this.native.property(e);
    if (native) return native;
    const dot = e.questionDotToken ? '?.' : '.';
    if (name === 'length' && this.isString(target)) {
      return this.typeOf(target).endsWith('?') ? `${this.expr(target)}.map { Double($0.utf16.count) }` : `Double(${this.expr(target)}.utf16.count)`;
    }
    if (this.isAny(target)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${swiftString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, t);
    }
    const base = this.typeOf(target);
    if (base.replace(/\?$/, '').startsWith('JSRecord<')) {
      // A key of a dictionary-typed object: undefined when missing.
      const read = `${this.expr(target)}${base.endsWith('?') ? '?' : ''}[${swiftString(name)}]`;
      const t = this.typeOf(e);
      if (isWriteTarget(e)) return read;
      if (t.endsWith('?')) return `(${read} ?? nil)`;
      const z = this.zero(t);
      return z ? `(${read} ?? ${z})` : `${read}!`;
    }
    if (base === 'EventData' && !['value', 'item', 'eventName', 'object', 'index', 'view', 'type', 'state', 'deltaX', 'deltaY', 'scale', 'rotation', 'direction', 'action', 'scrollX', 'scrollY', 'newValue'].includes(name)) {
      const t = this.typeOf(e);
      const code = `${this.expr(target)}[jsKey: ${swiftString(name)}]`;
      return t === 'Any?' ? code : this.fromAnyCode(code, t, true);
    }
    // An event's data: the value's type is the one the handler declared.
    // `ref.value` of an `interop.Reference<number>`: the cell's value as the type argument reads it.
    if (base === 'InteropReference' && name === 'value' && !isWriteTarget(e)) {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.value` : this.fromAnyCode(`${this.expr(target)}.value`, t, true);
    }
    if (base === 'EventData' && (name === 'value' || name === 'item' || name === 'newValue')) {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.${name}` : this.fromAny(`${this.expr(target)}.${name}`, t);
    }
    const checked = this.receiver(target, name);
    if (checked) return this.narrowed(e, `${checked}${dot}${ident(name)}`);
    // `x?.name` on a value Swift has as non-optional: cast to optional, valid for an implicitly unwrapped one too.
    const tt = this.typeOf(target);
    if (e.questionDotToken && tt !== 'Any?' && !tt.endsWith('?') && !tt.endsWith('!') && !hasTopLevelArrow(tt) && !ts.isOptionalChain(target) && !isWriteTarget(e)
        && !(ts.isCallExpression(target) && this.maybeUndefined(target)) && !(ts.isOptionalChain(e.parent) && (e.parent as ts.PropertyAccessExpression).expression === e)) {
      const code = `(${this.expr(target)} as ${optionalType(tt)})?.${ident(name)}`;
      const rt = this.typeOf(e);
      return rt.endsWith('?') || rt === 'Any?' ? code : this.undefinedAs(`(${code})`, rt);
    }
    const unwrap = (this.continuesOptional(target) || (ts.isCallExpression(target) && this.maybeUndefined(target))) && !e.questionDotToken;
    return this.narrowed(e, `${this.expr(target)}${unwrap ? '!' : ''}${dot}${ident(name)}`);
  }

  /** A receiver that can be missing though its type says not (`x!`, `items[i]`): JavaScript's TypeError when it is. */
  private receiver(target: ts.Expression, key: string): string | null {
    const kind = unsafeReceiver(target, this.checker);
    if (!kind) return null;
    let x = target;
    while (ts.isParenthesizedExpression(x)) x = x.expression;
    const value = ts.isNonNullExpression(x) ? (this.maybeUndefined(x.expression) ?? this.expr(x.expression)) : this.maybeUndefined(x);
    return value ? `(try jsUnwrap(${value}, ${swiftString(key)}${kind === 'null' ? ', null: true' : ''}))` : null;
  }

  private elementAccess(e: ts.ElementAccessExpression): string {
    const target = this.expr(e.expression);
    const key = e.argumentExpression;
    const t = this.typeOf(e.expression).replace(/\?$/, '');
    const q = e.questionDotToken ? '?' : '';
    if (t === 'String') return `jsCharAt(${target}, ${this.expr(key)})`;
    if (t.startsWith('JSArray<')) {
      if (isWriteTarget(e)) return `${target}${q}[Int(${this.expr(key)})]`;
      return this.undefinedAs(this.maybeUndefined(e)!, this.typeOf(e));
    }
    if (t === 'JSMatch') return `${target}${q}[Int(${this.expr(key)})]`;
    if (t.startsWith('(') && ts.isNumericLiteral(key)) return `${target}.${key.text}`;
    if (t.startsWith('JSRecord<')) {
      // A missing key is undefined in JavaScript; its declared type here is the value type.
      const read = `${target}${this.typeOf(e.expression).endsWith('?') ? '?' : ''}[${this.str(key)}]`;
      if (isWriteTarget(e)) return read;
      const vt = this.typeOf(e);
      if (vt.endsWith('?')) return `(${read} ?? nil)`;
      const z = this.zero(vt);
      return z ? `(${read} ?? ${z})` : `${read}!`;
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
    // A computed key on an object (`this[side + 'Drawer']`): its members by name.
    if (this.isObjectRef(e.expression)) {
      const code = `${target}${q}[jsKey: ${this.propertyKey(key)}]`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, rt, true);
    }
    throw this.error(e, 'indexing this type');
  }

  /**
   * An expression that may be undefined though TypeScript types it as its element
   * (`xs[i]` past the end, or a variable holding one), as a Swift optional; null otherwise.
   */
  private maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '').startsWith('JSArray<')) {
      const q = e.questionDotToken || this.continuesOptional(e.expression) ? '?' : '';
      const code = `${this.expr(e.expression)}${q}.element(${this.toNumber(e.argumentExpression)})`;
      return this.typeOf(e).endsWith('?') || q ? `(${code} ?? nil)` : code;
    }
    if (ts.isIdentifier(e)) {
      const sym = this.resolve(e);
      if (sym && this.undefinedVars.has(sym)) return ident(e.text);
    }
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && !this.typeOf(e.expression).endsWith('?')) {
      const target = this.maybeUndefined(e.expression);
      if (target) return `${target}?.${ident(e.name.text)}`;
    }
    // `this[side + 'Drawer']`: a member by computed key, missing when the object has none.
    let access: ts.Expression = e;
    while (ts.isParenthesizedExpression(access) || ts.isAsExpression(access)) access = access.expression;
    if (ts.isElementAccessExpression(access) && !isWriteTarget(access) && !ts.isStringLiteral(access.argumentExpression) && this.isObjectRef(access.expression)) {
      const t = this.typeOf(e);
      const base = this.typeOf(access.expression).replace(/\?$/, '');
      if (!t.endsWith('?') && t !== 'Any?' && this.isObjectRef(e) && !/^JS(Array|Record|Match)/.test(base) && !base.startsWith('(') && base !== 'String') {
        return `(${this.expr(access.expression)}${access.questionDotToken ? '?' : ''}[jsKey: ${this.propertyKey(access.argumentExpression)}] as? ${t})`;
      }
    }
    // `ref.get()`: undefined once the object is gone, though core's typings say `T`.
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && ['get', 'deref'].includes(e.expression.name.text)
        && this.typeOf(e.expression.expression).replace(/\?$/, '').startsWith('JSWeakRef<') && !this.typeOf(e).endsWith('?')) {
      return this.expr(e);
    }
    // `a && a.get()` where `a` may be missing: undefined then, whatever the right side's type.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      const t = this.typeOf(e), lt = this.typeOf(e.left);
      // An object operand is falsy only when missing.
      if (!t.endsWith('?') && t !== 'Bool' && lt !== t && lt !== optionalType(t) && lt !== 'Any?' && (lt.endsWith('?') || this.isObjectRef(e.left))) {
        const v = this.fresh('__v');
        const lt0 = this.tryPrefix(e.left), rt0 = this.tryPrefix(e.right);
        return `({ () ${lt0 || rt0 ? 'throws ' : ''}-> ${optionalType(t)} in let ${v} = ${lt0}${this.expr(e.left)}; return jsTruthy(${v}) ? ${rt0}${this.maybeUndefined(e.right) ?? this.coerce(e.right, t)} : nil }())`;
      }
    }
    return null;
  }

  /** An undefined-or-value as the TypeScript type reads it: NaN, "undefined" and false are what undefined converts to. */
  private undefinedAs(code: string, type: string): string {
    if (type.endsWith('?')) return code.endsWith('?? nil)') ? code : `(${code} ?? nil)`;
    if (type === 'Double') return `(${code} ?? .nan)`;
    if (type === 'String') return `(${code} ?? "undefined")`;
    if (type === 'Bool') return `(${code} ?? false)`;
    return `${code}!`;
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
        // An app function's rest parameter is one array: the arguments packed, spreads included.
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
      out.push(this.coerce(a, this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e)));
    }
    if (restAt >= 0 && appDeclared && list.length <= restAt) out.push(`${this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name)}()`);
    // A function value takes every parameter: the ones JavaScript leaves out are undefined.
    const decl = sig?.getDeclaration();
    if (count === undefined && decl && !ts.isJSDocSignature(decl) && !('body' in decl) && (ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl))) {
      for (let k = list.length; k < params.length; k++) {
        const pt = this.type(this.checker.getTypeOfSymbolAtLocation(params[k], e), e);
        out.push(pt === 'Void' ? '()' : 'nil');
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
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`Array(${this.iterable(x.expression)})`);
      } else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `${arrayType}(${parts.join(' + ') || '[]'})`;
  }

  /** How many parameters the called function declares (JavaScript ignores extra arguments). */
  private arity(e: ts.CallExpression): number | undefined {
    const sig = this.checker.getResolvedSignature(e);
    const decl = sig?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl)) return undefined;
    if (decl.parameters.some((p) => p.dotDotDotToken)) return undefined;
    return decl.parameters.length;
  }

  private isLibGlobal(id: ts.Identifier): boolean {
    if (!LIB_GLOBALS.has(id.text)) return false;
    const decl = this.resolve(id)?.declarations?.[0];
    return !decl || decl.getSourceFile().isDeclarationFile;
  }

  /** The symbol a name refers to, through imports. */
  resolve(n: ts.Node): ts.Symbol | undefined {
    const sym = this.checker.getSymbolAtLocation(n);
    return sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
  }

  private call(e: ts.CallExpression): string {
    const callee = e.expression;
    // Reading a callable signal (Angular, Solid) (`count()`, an input, a computed field).
    if (!e.arguments.length && ['WritableSignal', 'InputSignal', 'Signal'].includes(this.symbolName(callee))) {
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.computed.has(callee.name.text)) return `self.${ident(callee.name.text)}`;
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) return `self.${ident(callee.name.text)}.value`;
      return this.symbolName(callee) === 'Signal' ? this.expr(callee) : `${this.expr(callee)}.value`;
    }
    if (callee.kind === ts.SyntaxKind.SuperKeyword) throw this.error(e, 'super() outside the start of a constructor');
    if (e.questionDotToken && this.isAny(callee)) return `jsCallOptional(${[this.expr(callee), ...e.arguments.map((a) => this.coerce(a, 'Any?'))].join(', ')})`;
    // `obj.method?.(…)` on a method a declaration file declares: the method is always there, so the call is a plain one.
    const declaredMethod = ts.isPropertyAccessExpression(callee) && this.resolve(callee.name)?.declarations?.some((d) => (ts.isMethodDeclaration(d) || ts.isMethodSignature(d)) && d.getSourceFile().isDeclarationFile);
    if (e.questionDotToken && !this.core.isKitMethod(callee) && !declaredMethod) return `${this.expr(callee)}?(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) return this.globalCall(callee, e);
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    if (isObjectToStringCall(callee, this.checker)) return `jsObjectToString(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : 'nil'})`;
    // A callback passed as a prop (`onTap: () => void`).
    if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) {
      const unwrap = this.declaredTypeOf(callee)?.endsWith('?') ? '!' : '';
      return `self.${ident(callee.name.text)}.value${unwrap}(${this.args(e, this.arity(e)).join(', ')})`;
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
        // Solid's setter: a function updates, anything else is the new value.
        const a = e.arguments[0];
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return `${this.expr(target)}.update(${this.closure(a)})`;
        return `${this.expr(target)}.value = ${this.coerce(a, signalValue())}`;
      }
      if (owner === 'OutputEmitterRef' && method === 'emit') return `${this.expr(target)}.emit(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      if (owner === 'Injector' && method === 'get' && e.arguments[0] && ts.isIdentifier(e.arguments[0])) return injected(e.arguments[0].text);
      // `http.get<T>(url, options)`: the parsed body read as T.
      if (owner === 'HttpClient' && method === 'get') {
        const value = /^RxObservable<(.*)>$/.exec(this.typeOf(e))?.[1] ?? 'Any?';
        const call = `${this.expr(target)}.get(${this.str(e.arguments[0])}${e.arguments[1] ? `, ${this.coerce(e.arguments[1], 'Any?')}` : ''})`;
        return value === 'Any?' ? call : `${call}.mapValues { (__v: Any?) -> ${value} in ${this.fromAny('__v', value)} }`;
      }
      if ((owner === 'WritableSignal' || owner === 'Signal') && method === 'asReadonly') return this.expr(target);
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      const core = this.core.call(e) ?? this.native.call(e);
      if (core) return core;
      if (this.isAny(target)) return `jsCallMethod(${this.expr(target)}, ${swiftString(method)}${e.arguments.map((a) => `, ${this.coerce(a, 'Any?')}`).join('')})`;
      const t = this.typeOf(target).replace(/\?$/, '');
      const q = callee.questionDotToken ? '?' : this.typeOf(target).endsWith('?') || (ts.isCallExpression(target) && this.maybeUndefined(target)) ? '!' : '';
      if (method === 'fill' && ts.isNewExpression(target) && ts.isIdentifier(target.expression) && target.expression.text === 'Array' && target.arguments?.length === 1 && e.arguments.length === 1) {
        // `new Array(n).fill(v)`: n copies of v.
        return `${t}(Array(repeating: ${this.coerce(e.arguments[0], t.replace(/^JSArray<(.*)>$/, '$1'))}, count: Int(${this.expr(target.arguments[0])})))`;
      }
      if (t.startsWith('JSArray<')) return this.arrayMethod(method, target, e, q);
      if (t === 'JSMatch' && method !== 'toString') {
        this.subst.set(target, `${this.expr(target)}${q}.values`);
        try { return this.arrayMethod(method, target, e, ''); } finally { this.subst.delete(target); }
      }
      if (t.startsWith('(') && this.checker.isTupleType(this.checker.getTypeAtLocation(target))) {
        // A tuple used as an array: its elements as one.
        const n = this.checker.getTypeArguments(this.checker.getTypeAtLocation(target) as ts.TypeReference).length;
        const el = this.typeOf(target).slice(1, -1).split(', ');
        const element = el.every((x) => x === el[0]) ? el[0] : 'Any?';
        const tmp = this.fresh('__tuple');
        const value = this.expr(target);
        this.subst.set(target, `JSArray<${element}>([${Array.from({ length: n }, (_, k) => `${tmp}.${k}`).join(', ')}])`);
        try {
          const tr = this.tryPrefix(e);
          return `{ () ${tr ? 'throws ' : ''}-> ${this.typeOf(e)} in let ${tmp} = ${value}; return ${tr}${this.arrayMethod(method, target, e, '')} }()`;
        } finally { this.subst.delete(target); }
      }
      // `n?.toString()`: the method on the value when there is one.
      if ((t === 'String' || t === 'Double') && callee.questionDotToken && this.typeOf(target).endsWith('?')) {
        const recv = this.expr(target);
        const v = this.fresh('__v');
        this.subst.set(target, v);
        try {
          return `(${recv}).map { (${v}: ${t}) in ${t === 'String' ? this.stringMethod(method, target, e) : this.numberMethod(method, target, e)} }`;
        } finally { this.subst.delete(target); }
      }
      if (t === 'String') return this.stringMethod(method, target, e);
      if (t === 'Double') return this.numberMethod(method, target, e);
      if (t === 'JSBigInt' && method === 'toLocaleString') return `jsBigIntToLocaleString(${[this.expr(target), ...e.arguments.map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
      if (t.startsWith('JSPromise<')) return this.promiseMethod(method, target, e);
      if (/^JS(Iterator|Generator)</.test(t) && ['next', 'return', 'throw'].includes(method)) {
        return `${this.expr(target)}${q}.js${method[0].toUpperCase()}${method.slice(1)}Result(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : method === 'throw' ? 'nil' : ''})`;
      }
      if (/^JS(AsyncIterator|AsyncGenerator)</.test(t) && ['next', 'return', 'throw'].includes(method)) {
        return `${this.expr(target)}${q}.${ident(method)}(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : method === 'throw' ? 'nil' : ''})`;
      }
      if (t.startsWith('JSMap<') || t.startsWith('JSSet<')) return this.collectionMethod(method, target, e, q);
      // `this.method.bind(this)`: the method, which Swift binds to its object already.
      if (method === 'bind' && e.arguments.length === 1 && e.arguments[0].kind === ts.SyntaxKind.ThisKeyword && ts.isPropertyAccessExpression(target) && target.expression.kind === ts.SyntaxKind.ThisKeyword) {
        return this.expr(target);
      }
      // A property holding an optional function, called (`this.onDone(x)` after a check TypeScript does not keep).
      const held = this.checker.getSymbolAtLocation(callee.name)?.valueDeclaration;
      const optionalFn = !!held && (ts.isPropertyDeclaration(held) || ts.isPropertySignature(held)) && isOptional(this.declaredTypeOf(callee) ?? '') && hasTopLevelArrow(this.declaredTypeOf(callee)!.replace(/^\((.*)\)\?$/, '$1'));
      const checked = !callee.questionDotToken ? this.receiver(target, method) : null;
      // `x?.method()` on a value Swift has as non-optional: cast to optional, valid for an implicitly unwrapped one too.
      const tt = this.typeOf(target);
      if (callee.questionDotToken && !tt.endsWith('?') && !tt.endsWith('!') && !hasTopLevelArrow(tt) && !ts.isOptionalChain(target) && !(ts.isCallExpression(target) && this.maybeUndefined(target))) {
        const code = `(${this.expr(target)} as ${optionalType(tt)})?.${ident(method)}${optionalFn ? '!' : ''}(${this.args(e, this.arity(e)).join(', ')})`;
        const rt = this.typeOf(e);
        return rt.endsWith('?') || rt === 'Any?' || rt === 'Void' || ts.isExpressionStatement(e.parent) ? code : this.undefinedAs(`(${code})`, rt);
      }
      return `${checked ?? `${this.expr(target)}${q}`}.${ident(method)}${optionalFn ? '!' : ''}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isElementAccessExpression(callee) && isSymbolIterator(callee.argumentExpression, this.checker) && !e.arguments.length) return this.iteratorCode(callee.expression);
    if (ts.isElementAccessExpression(callee)) {
      const property = this.setNativeOf(callee.argumentExpression);
      if (property) return `${this.expr(callee.expression)}.__setNative_${property}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    }
    let fn: ts.Expression = callee;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    // `(function () { … })()`: the closure, called.
    if (ts.isFunctionExpression(fn) || ts.isArrowFunction(fn)) return `${this.closure(fn)}(${this.args(e).join(', ')})`;
    // A callee the factory would parenthesize again (`(f as F)(…)`) is called through its own translation.
    if (ts.isParenthesizedExpression(callee) && !ts.isAsExpression(callee.expression) && !ts.isTypeAssertionExpression(callee.expression) && !ts.isSatisfiesExpression(callee.expression)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    throw this.error(e, 'call');
  }

  /** The new value of a signal: Vue's refs are deeply reactive. */
  private signalWrite(target: ts.Expression, value: ts.Expression, t: string): string {
    const code = this.coerce(value, t);
    return this.symbolName(target) === 'VueRef' && this.isObjectRef(value) ? `jsReactive(${code})` : code;
  }

  /** `Signal(x)`: a write of an equal value is no change. Objects compare by identity (Object.is) except in Svelte, where a write of an object always notifies. */
  private newSignal(t: string, value: string, kind: 'vue' | 'svelte' | 'identity'): string {
    const reference = !['Double', 'String', 'Bool'].includes(t.replace(/\?$/, '')) && !isFunctionType(t);
    if (kind === 'vue') return `Signal<${t}>(${reference ? `jsReactive(${value})` : value}${reference ? ', equals: jsSame' : ''})`;
    if (kind === 'svelte' || !reference) return `Signal<${t}>(${value})`;
    return `Signal<${t}>(${value}, equals: jsSame)`;
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
      const t = this.typeOf(e);
      const subscribeType = this.typeOf(subscribe);
      let bare: ts.Expression = snapshot;
      while (ts.isParenthesizedExpression(bare)) bare = bare.expression;
      // A function declaration or literal that does not throw reads without `try`; a variable holding a function has Swift's throwing function type.
      const declared = this.resolve(bare)?.declarations?.find((d) => ts.isFunctionDeclaration(d) && !!d.body);
      const read = ts.isArrowFunction(bare) || ts.isFunctionExpression(bare) ? bare : declared;
      // A constant holding a closure that does not throw: Swift's function type says `throws`, the closure cannot.
      const held = this.resolve(bare)?.valueDeclaration;
      const heldFn = held && ts.isVariableDeclaration(held) && held.parent.flags & ts.NodeFlags.Const && held.initializer && (ts.isArrowFunction(held.initializer) || ts.isFunctionExpression(held.initializer)) ? held.initializer : undefined;
      const snap = read && !this.throwsInfo.fn(read) ? `{ () -> ${t} in ${this.expr(snapshot)}() }`
        : heldFn && !this.throwsInfo.fn(heldFn) ? `{ () -> ${t} in try! ${this.expr(snapshot)}() }`
        : `{ () throws -> ${t} in try ${this.expr(snapshot)}() }`;
      return `jsExternalStore(${swiftString(site)}, subscribe: ${this.convert(this.coerce(subscribe, subscribeType), subscribeType, 'Any?')}, snapshot: ${snap})`;
    }
    const native = this.native.call(e);
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
      return this.newSignal(t, arg(0) ? this.coerce(arg(0), t) : 'nil', kind);
    }
    if (name === '$state' && lib) return `stateSignal(${this.expr(arg(0))})`;
    if ((name === 'nextTick' || name === 'tick') && !e.arguments.length && lib) return `Reactivity.${name}()`;
    if (name === 'output' && lib) return `${this.typeOf(e)}()`;
    if (name === 'inject' && lib) return injected((ts.isExpressionWithTypeArguments(arg(0)) ? arg(0).expression : arg(0)).getText());
    if (name === 'effect' && lib) return `Effect.deferred(${this.callback(arg(0))})`;
    if (name === 'firstValueFrom' && lib) return `rxFirstValueFrom(${this.expr(arg(0))})`;
    if (name === 'registerElement' && lib) return '()';
    if (name === '$navigateTo' && lib) return this.navigate(e);
    if (name === '$showModal' && lib) return this.showModal(e);
    if (name === '$closeModal' && lib) return `Modal.close(${arg(0) ? this.coerce(arg(0), 'Any?') : ''})`;
    if (lib) {
      switch (name) {
        case 'String': return arg(0) ? this.str(arg(0)) : '""';
        case 'Number': return arg(0) ? this.toNumber(arg(0)) : '0';
        case 'Boolean': return arg(0) ? this.cond(arg(0)) : 'false';
        case 'parseInt': return `jsParseInt(${this.str(arg(0))}${arg(1) ? `, ${this.expr(arg(1))}` : ', nil'})`;
        case 'parseFloat': return `jsParseFloat(${this.str(arg(0))})`;
        case 'isNaN': return `${this.toNumber(arg(0))}.isNaN`;
        case 'isFinite': return `${this.toNumber(arg(0))}.isFinite`;
        case 'setTimeout': case 'setInterval':
          return `js${name[0].toUpperCase()}${name.slice(1)}(${this.callback(arg(0))}, ${arg(1) ? this.expr(arg(1)) : '0'})`;
        case 'clearTimeout': case 'clearInterval': return `js${name[0].toUpperCase()}${name.slice(1)}(${arg(0) ? this.coerce(arg(0), 'Double?') : 'nil'})`;
        case 'queueMicrotask': return `jsQueueMicrotask(${this.callback(arg(0))})`;
        case 'requestAnimationFrame': return `jsRequestAnimationFrame({ __t in jsReport { try ${this.expr(arg(0))}(__t) } })`;
        case 'cancelAnimationFrame': return `jsCancelAnimationFrame(${this.expr(arg(0))})`;
        case 'unescape': return `jsUnescape(${this.str(arg(0))})`;
        case 'encodeURIComponent': case 'encodeURI': case 'decodeURIComponent': case 'decodeURI':
          return `js${name[0].toUpperCase()}${name.slice(1)}(${this.str(arg(0))})`;
        case 'Symbol': return `jsSymbol(${arg(0) ? this.str(arg(0)) : 'nil'})`;
        case 'BigInt': return `JSBigInt(convert: ${this.coerce(arg(0), 'Any?')})`;
      }
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve()`;
      if (this.typeOf(arg(0)).startsWith('JSPromise<')) return `${resolvers.name}.resolve(promise: ${this.expr(arg(0))})`;
      return `${resolvers.name}.resolve(${this.coerce(arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body);
    // A function held untyped (one of several function types): called as script calls it.
    if (this.typeOf(callee) === 'Any?') return `jsCall(${[this.expr(callee), ...e.arguments.map((a) => this.coerce(a, 'Any?'))].join(', ')})`;
    const fn = ident(ts.isIdentifier(callee) ? this.declaredName(callee) : name);
    const qualified = this.appModule && shadowedByMember(e, this.resolve(callee)?.declarations?.[0], fn, ident) ? `${this.appModule}.${fn}` : fn;
    return `${this.narrowed(callee, qualified)}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
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
      return [`${ident(p)}: ${this.coerce(v, this.typeOf(v))}`];
    });
    return `OctaneRoot(host: ${this.expr(host)}) { ${name}(${args.join(', ')}).render() }`;
  }

  private symbolName(e: ts.Expression): string {
    const t = this.checker.getTypeAtLocation(e);
    return (t.aliasSymbol ?? t.getSymbol())?.getName() ?? '';
  }

  private navigate(e: ts.CallExpression): string {
    // `$navigateTo(Page, { props })` (Vue) or `navigate({ page: Page, props })` (Svelte).
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
    const args = info.props.map((p) => `${ident(p)}: ${given.get(p) ?? 'nil'}`).join(', ');
    return `Frame.topmost()?.navigate { ${component}(${args}).render() }`;
  }

  private toNumber(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'Double') return this.expr(e);
    if (t === 'JSBigInt') return `${this.expr(e)}.toDouble()`;
    if (t === 'JSDate') return `${this.expr(e)}.valueOf()`;
    if (this.native.isEnumType(t)) return `Double(${this.expr(e)}.rawValue)`;
    if (t.endsWith('?') && this.native.isEnumType(t.slice(0, -1))) return `Double(${this.expr(e)}?.rawValue ?? 0)`;
    if (t === 'String') return `jsNumberFromString(${this.expr(e)})`;
    if (t === 'Bool') return `(${this.expr(e)} ? 1 : 0)`;
    return `jsToNumber(${this.expr(e)})`;
  }

  /** `Math.max`, `JSON.parse`, `Object.keys`, `Promise.all`, `console.log`… */
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
        if (method === 'stringify') return `jsJSONStringifyChecked(${this.coerce(arg(0), 'Any?')}${arg(2) ? `, ${this.coerce(arg(2), 'Any?')}` : ''})!`;
        break;
      case 'Object': {
        const record = this.typeOf(arg(0)).startsWith('JSRecord<');
        if (record && ['keys', 'values', 'entries'].includes(method)) return `${this.expr(arg(0))}.${method}`;
        if (method === 'keys') return `JSArray(jsKeysOf(${this.expr(arg(0))}))`;
        if (method === 'values' || method === 'entries') {
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const value = method === 'values' ? el : el.replace(/^\(String, (.*)\)$/, '$1');
          const read = this.fromAnyCode('jsField(__o, $0)', value);
          return `{ (__o: Any?) -> ${T()} in JSArray(jsKeysOf(__o).map { ${method === 'values' ? read : `($0, ${read})`} }) }(${this.expr(arg(0))})`;
        }
        if (method === 'freeze') return `jsFreeze(${this.expr(arg(0))})`;
        if (method === 'seal' || method === 'preventExtensions') return `jsRestrict(${this.expr(arg(0))}, sealed: ${method === 'seal'})`;
        const untyped: Record<string, string> = { isFrozen: 'jsIsFrozen', isSealed: 'jsIsSealed', isExtensible: 'jsIsExtensible', getOwnPropertySymbols: 'jsOwnPropertySymbols', getOwnPropertyNames: 'jsOwnPropertyNames' };
        if (untyped[method]) return `${untyped[method]}(${this.coerce(arg(0), 'Any?')})`;
        if (method === 'is') return `jsSameValue(${this.coerce(arg(0), 'Any?')}, ${this.coerce(arg(1), 'Any?')})`;
        if (method === 'getOwnPropertyDescriptor') return `jsOwnPropertyDescriptor(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))})`;
        if (method === 'fromEntries') return `jsObjectFromEntries(${this.iterable(arg(0))})`;
        if (method === 'defineProperty') {
          const d = arg(2);
          const code = `try jsDefineProperty(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'assign') {
          // The target is an open JavaScript object: a literal there is untyped, so the sources' keys all land.
          const target = ts.isObjectLiteralExpression(arg(0)) ? this.dynamicObject(arg(0) as ts.ObjectLiteralExpression) : this.coerce(arg(0), 'Any?');
          const code = `try jsObjectAssign(${[target, ...e.arguments.slice(1).map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
          const t = T();
          return t === 'Any?' ? code : this.fromAnyCode(code, t, true);
        }
        break;
      }
      case 'Array':
        if (method === 'isArray') return `JSArray<Any?>.isArray(${this.coerce(arg(0), 'Any?')})`;
        if (method === 'from' && e.arguments.length === 1) return `${T()}.from(${this.iterable(arg(0))})`;
        if (method === 'from' && e.arguments.length === 2 && ts.isObjectLiteralExpression(arg(0))) {
          const length = (arg(0) as ts.ObjectLiteralExpression).properties.find((p) => p.name?.getText() === 'length');
          const fn = arg(1);
          if (!length || !ts.isPropertyAssignment(length) || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) throw this.error(e, 'Array.from of this object');
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const index = fn.parameters[1] ? ident((fn.parameters[1].name as ts.Identifier).text) : '_';
          const value = fn.parameters[0] && ts.isIdentifier(fn.parameters[0].name) && fn.parameters[0].name.text !== '_' ? `let ${ident(fn.parameters[0].name.text)}: Any? = nil; ` : '';
          const body = ts.isBlock(fn.body) ? this.functionBody(fn, el, this.indent).slice(1, -1) : ` return ${this.coerce(fn.body, el)} `;
          return `${T()}.from(length: ${this.expr(length.initializer)}) { (${index}: Double) ${this.throwsInfo.fn(fn) ? 'throws ' : ''}-> ${el} in ${value}${body}}`;
        }
        if (method === 'from' && e.arguments.length === 2) return `${T()}.from(${this.iterable(arg(0))}).map(${this.expr(arg(1))})`;
        if (method === 'of') return `${T()}([${a().join(', ')}])`;
        break;
      case 'Number':
        if (method === 'isInteger') return `jsIsInteger(${this.expr(arg(0))})`;
        if (method === 'isSafeInteger') return `jsIsSafeInteger(${this.expr(arg(0))})`;
        if (method === 'isFinite') return `${this.expr(arg(0))}.isFinite`;
        if (method === 'isNaN') return `${this.expr(arg(0))}.isNaN`;
        if (method === 'parseFloat') return `jsParseFloat(${this.expr(arg(0))})`;
        if (method === 'parseInt') return `jsParseInt(${this.expr(arg(0))}${arg(1) ? `, ${this.expr(arg(1))}` : ', nil'})`;
        break;
      case 'String':
        if (method === 'fromCharCode') return `jsFromCharCode(${a().join(', ')})`;
        break;
      case 'BigInt':
        if (method === 'asIntN' || method === 'asUintN') return `JSBigInt.${method}(${this.toNumber(arg(0))}, ${this.expr(arg(1))})`;
        break;
      case 'Symbol':
        if (method === 'for') return `JSSymbol.for(${this.str(arg(0))})`;
        if (method === 'keyFor') return `JSSymbol.keyFor(${this.expr(arg(0))})`;
        break;
      case 'Date':
        if (method === 'now') return 'JSDate.now()';
        if (method === 'parse') return `JSDate.parse(${this.str(arg(0))})`;
        if (method === 'UTC') return `JSDate.UTC(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
        break;
      case 'Promise': {
        const t = T();
        if (method === 'resolve') return arg(0) ? (this.typeOf(arg(0)).startsWith('JSPromise<') ? `${t}.resolve(${this.expr(arg(0))})` : `${t}.resolve(${this.coerce(arg(0), t.replace(/^JSPromise<(.*)>$/, '$1'))})`) : `${t}.resolve(())`;
        if (method === 'reject') return `${t}.reject(${arg(0) ? this.coerce(arg(0), 'Any?') : 'nil'})`;
        if (['all', 'allSettled', 'race', 'any'].includes(method)) {
          const src = arg(0);
          if (ts.isArrayLiteralExpression(src)) return this.promiseCombinator(method, src, t);
          const inner = this.typeOf(src).replace(/^JSArray<JSPromise<(.*)>>$/, '$1');
          return `JSPromise<${inner}>.${method}(${this.expr(src)})`;
        }
        break;
      }
    }
    throw this.error(e, `${owner}.${method}`);
  }

  /** `Promise.all([a, b])` and friends over a literal list, which TypeScript types as a tuple. */
  private promiseCombinator(method: string, list: ts.ArrayLiteralExpression, result: string): string {
    if (list.elements.some(ts.isSpreadElement)) throw this.error(list, `Promise.${method} over a spread`);
    const values = list.elements.map((x) => this.typeOf(x).replace(/^JSPromise<(.*)>$/, '$1'));
    const promise = (x: ts.Expression, k: number) => (this.typeOf(x).startsWith('JSPromise<') ? this.expr(x) : `JSPromise<${values[k]}>.resolve(${this.expr(x)})`);
    const same = values.every((v) => v === values[0]);
    const tuple = result.replace(/^JSPromise<(.*)>$/, '$1');
    const toTuple = (element: string) => `.then { (__a: JSArray<${element}>) -> ${tuple} in (${values.map((_, k) => `__a[${k}]`).join(', ')}) }`;
    if (method === 'all') {
      if (values.length >= 2 && values.length <= 4) return `jsPromiseAll(${list.elements.map(promise).join(', ')})`;
      if (values.length === 1) return `${promise(list.elements[0], 0)}`;
      if (same) return `JSPromise<${values[0]}>.all(JSArray<JSPromise<${values[0]}>>([${list.elements.map(promise).join(', ')}]))${toTuple(values[0])}`;
      throw this.error(list, 'Promise.all over more than four values of different types');
    }
    if (method === 'allSettled') return `JSPromise<Any?>.allSettled(JSArray<Any?>([${list.elements.map((x) => this.expr(x)).join(', ')}]))${toTuple('JSObject')}`;
    if (!same) return `JSPromise<Any?>.${method}(JSArray<Any?>([${list.elements.map((x) => this.expr(x)).join(', ')}]))`;
    return `JSPromise<${values[0]}>.${method}(JSArray<JSPromise<${values[0]}>>([${list.elements.map(promise).join(', ')}]))`;

  }

  /** `$showModal(Component, { props, fullscreen, animated, cancelable, closeCallback })`; a `.then(fn)` is the close callback. */
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
          settings.push(`${key}: ${this.expr(p.initializer)}`);
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
      // A modal closed without a result (swiped away) passes undefined, which reads as "undefined" or NaN.
      const undefinedValue: Record<string, string> = { String: '"undefined"', Double: '.nan', Bool: 'false' };
      const cast = t in undefinedValue ? `((value as? ${t}) ?? ${undefinedValue[t]})` : `(value as! ${t})`;
      const call = !first ? `{ _ in (${closure})() }` : t === 'Any' ? closure : t.endsWith('?') ? `{ value in (${closure})(value as? ${t.slice(0, -1)}) }` : `{ value in (${closure})${cast} }`;
      settings.push(`closeCallback: ${call}`);
    }
    const args = info.props.map((p) => `${ident(p)}: ${given.get(p) ?? 'nil'}`).join(', ');
    return `Modal.show(${settings.join(', ')}) { ${component}(${args}).render() }`;
  }

  private math(name: string, e: ts.CallExpression): string {
    if ((name === 'max' || name === 'min') && e.arguments.some(ts.isSpreadElement)) return `jsMath${name === 'max' ? 'Max' : 'Min'}(values: ${this.packed(e.arguments, 'JSArray<Double>')}.storage)`;
    const a = e.arguments.map((x) => this.coerce(x, 'Double'));
    const one: Record<string, string> = {
      floor: 'Foundation.floor', ceil: 'Foundation.ceil', abs: 'Swift.abs', sqrt: 'Foundation.sqrt', cbrt: 'Foundation.cbrt', trunc: 'Foundation.trunc',
      sin: 'Foundation.sin', cos: 'Foundation.cos', tan: 'Foundation.tan', asin: 'Foundation.asin', acos: 'Foundation.acos', atan: 'Foundation.atan',
      exp: 'Foundation.exp', log: 'Foundation.log', log2: 'Foundation.log2', log10: 'Foundation.log10', log1p: 'Foundation.log1p', expm1: 'Foundation.expm1',
      sinh: 'Foundation.sinh', cosh: 'Foundation.cosh', tanh: 'Foundation.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround',
    };
    if (one[name]) return `${one[name]}(${a[0]})`;
    switch (name) {
      case 'pow': return `jsPow(${a[0]}, ${a[1]})`;
      case 'atan2': return `Foundation.atan2(${a[0]}, ${a[1]})`;
      case 'hypot': return `jsHypot(${a.join(', ')})`;
      case 'min': return `jsMathMin(${a.join(', ')})`;
      case 'max': return `jsMathMax(${a.join(', ')})`;
      case 'random': return 'Double.random(in: 0..<1)';
    }
    throw this.error(e, `Math.${name}`);
  }

  /** A function argument for an array method: a closure literal with its declared parameters, or a function value. */
  private fn(e: ts.Expression): string {
    return ts.isArrowFunction(e) || ts.isFunctionExpression(e) ? this.closure(e) : this.expr(e);
  }

  private arrayMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const a = () => this.args(e);
    const el = this.typeOf(target).replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1');
    switch (name) {
      case 'push': case 'unshift':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.${name}(contentsOf: ${this.packed(e.arguments, `JSArray<${el}>`)})`;
        return `${t}.${name}(${e.arguments.map((x) => this.coerce(x, el)).join(', ')})`;
      case 'pop': case 'shift': case 'reverse': case 'toString': case 'keys': case 'entries': case 'values': case 'flat': return `${t}.${name}()`;
      case 'splice': return `${t}.splice(${[...a().slice(0, 2), ...e.arguments.slice(2).map((x) => this.coerce(x, el))].join(', ')})`;
      case 'fill': return `${t}.fill(${a().join(', ')})`;
      case 'slice': case 'indexOf': case 'lastIndexOf': case 'includes': case 'at': return `${t}.${name}(${a().join(', ')})`;
      case 'join': return `${t}.join(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      case 'concat': return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.expr(x) : `[${this.coerce(x, el)}]`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap': {
        if (e.arguments.length > 1) throw this.error(e, `${name} with a thisArg`);
        const callback = e.arguments[0];
        const result = this.checker.getTypeAtLocation(callback).getCallSignatures()[0]?.getReturnType();
        // A predicate returning any value (`labels.find((l) => GROUPS[l])`) decides by its truthiness.
        if (['filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'some', 'every'].includes(name) && result && !(result.flags & ts.TypeFlags.BooleanLike)) {
          const arity = ts.isArrowFunction(callback) || ts.isFunctionExpression(callback) ? Math.min(2, callback.parameters.length) : 1;
          const params = ['__e', '__i'].slice(0, Math.max(1, arity));
          const types = [el, 'Double'];
          return `${t}.${name}({ (${params.map((p, k) => `${p}: ${types[k]}`).join(', ')}) throws -> Bool in jsTruthy(try (${this.fn(callback)})(${params.join(', ')})) })`;
        }
        return `${t}.${name}(${this.fn(callback)})`;
      }
      case 'sort': return e.arguments[0] ? `${t}.sort(${this.fn(e.arguments[0])})` : `${t}.sort()`;
      case 'reduce': case 'reduceRight': {
        const init = e.arguments[1];
        return init ? `${t}.${name}(${this.fn(e.arguments[0])}, ${this.coerce(init, this.typeOf(e))})` : `${t}.${name}(${this.fn(e.arguments[0])})`;
      }
    }
    throw this.error(e, `Array.${name}`);
  }

  private stringMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const first = e.arguments[0];
    if (first && this.typeOf(first) === 'JSRegExp') return this.regexpStringMethod(name, t, e);
    const a = this.args(e);
    const opt = (k: number) => (a[k] !== undefined ? a[k] : 'nil');
    switch (name) {
      case 'toLowerCase': case 'toLocaleLowerCase': return `${t}.lowercased()`;
      case 'toUpperCase': case 'toLocaleUpperCase': return `${t}.uppercased()`;
      case 'includes': return `jsIncludes(${t}, ${a[0]})`;
      case 'startsWith': return `jsStartsWith(${t}, ${a[0]}, ${opt(1)})`;
      case 'endsWith': return `jsEndsWith(${t}, ${a[0]}, ${opt(1)})`;
      case 'trim': return `jsTrim(${t})`;
      case 'trimStart': return `jsTrimStart(${t})`;
      case 'trimEnd': return `jsTrimEnd(${t})`;
      case 'split': return `jsSplit(${t}, ${a[0] ?? 'nil'}, ${opt(1)})`;
      case 'indexOf': return `jsIndexOf(${t}, ${a[0]}, ${opt(1)})`;
      case 'lastIndexOf': return `jsLastIndexOf(${t}, ${a[0]})`;
      case 'slice': return `jsSlice(${t}, ${a.join(', ')})`;
      case 'substring': return `jsSubstring(${t}, ${a[0] ?? '0'}, ${opt(1)})`;
      case 'replace': return `jsReplace(${t}, ${a[0]}, ${a[1]})`;
      case 'replaceAll': return `jsReplaceAll(${t}, ${a[0]}, ${a[1]})`;
      case 'charAt': return `jsCharAt(${t}, ${a[0] ?? '0'})`;
      case 'charCodeAt': return `jsCharCodeAt(${t}, ${a[0] ?? '0'})`;
      case 'codePointAt': return `jsCodePointAt(${t}, ${a[0] ?? '0'})`;
      case 'at': return `jsStringAt(${t}, ${a[0]})`;
      case 'repeat': return `jsRepeat(${t}, ${a[0]})`;
      case 'padStart': return `jsPadStart(${t}, ${a[0]}, ${a[1] ?? '" "'})`;
      case 'padEnd': return `jsPadEnd(${t}, ${a[0]}, ${a[1] ?? '" "'})`;
      case 'concat': return `(${[t, ...e.arguments.map((x) => this.str(x))].join(' + ')})`;
      case 'localeCompare': return `jsLocaleCompare(${t}, ${a[0]})`;
      case 'toString': case 'valueOf': return t;
    }
    throw this.error(e, `String.${name}`);
  }

  /** `s.replace(/x/g, …)`, `s.match(re)`, `s.split(re)`… */
  private regexpStringMethod(name: string, s: string, e: ts.CallExpression): string {
    const [re, second] = e.arguments;
    const r = this.expr(re);
    switch (name) {
      case 'match': return `jsMatch(${s}, ${r})`;
      case 'matchAll': return `jsMatchAll(${s}, ${r})`;
      case 'search': return `jsSearch(${s}, ${r})`;
      case 'split': {
        const call = `jsSplit(${s}, ${r}${second ? `, ${this.expr(second)}` : ''})`;
        return this.typeOf(e) === 'JSArray<String>' ? `${call}.map { $0 ?? "" }` : call;
      }
      case 'replace': case 'replaceAll': {
        const fn = name === 'replace' ? 'jsReplace' : 'jsReplaceAll';
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second))) return `${fn}(${s}, ${r}, ${this.str(second)})`;
        if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
        // The replacer gets the match, then each group.
        const m = this.fresh('__match');
        const binds = second.parameters.map((p, k) => `let ${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)} = ${this.typeOf(p.name) === 'Double' ? `${m}.index` : `${m}[${k}]`}`);
        const body = this.functionBody(second, 'String', this.indent);
        const inner = this.indent + '    ';
        return `${fn}(${s}, ${r}) { (${m}: JSMatch) ${this.throwsInfo.fn(second) ? 'throws ' : ''}-> String in\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)}`;
      }
    }
    throw this.error(e, `String.${name} with a RegExp`);
  }

  private numberMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const a = this.args(e);
    switch (name) {
      case 'toFixed': return `jsToFixed(${t}, ${a[0] ?? '0'})`;
      case 'toLocaleString': return `jsNumberToLocaleString(${[t, ...e.arguments.map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
      case 'toPrecision': return a[0] ? `jsToPrecision(${t}, ${a[0]})` : `js(${t})`;
      case 'toString': return a[0] ? `jsNumberToString(${t}, radix: ${a[0]})` : `js(${t})`;
      case 'valueOf': return t;
    }
    throw this.error(e, `Number.${name}`);
  }

  private returnsPromise(e: ts.Expression): boolean {
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    return !!sig && this.type(sig.getReturnType(), e).startsWith('JSPromise<');
  }

  /** A rejection handler: it takes the reason untyped, whatever its parameter declares. */
  private rejectionHandler(e: ts.Expression): string {
    if (!(ts.isArrowFunction(e) || ts.isFunctionExpression(e))) return this.fn(e);
    if (!e.parameters.length) {
      // A handler that ignores the reason still takes it.
      const ret = this.returnTypeOf(e);
      return `{ (_: Any?) ${this.throwsInfo.fn(e) ? 'throws ' : ''}-> ${ret} in\n${this.functionBody(e, ret, this.indent).slice(1)}`;
    }
    const p = e.parameters[0];
    if (this.typeOf(p.name) === 'Any?' && ts.isIdentifier(p.name)) return this.closure(e);
    const ret = this.returnTypeOf(e);
    const reason = this.fresh('__reason');
    const body = this.functionBody(e, ret, this.indent);
    const bind = this.nested(() => this.bindTo(p.name, ts.isIdentifier(p.name) ? this.fromAny(reason, this.typeOf(p.name)) : reason, '', false));
    return `{ (${reason}: Any?) ${this.throwsInfo.fn(e) ? 'throws ' : ''}-> ${ret} in\n${bind}${body.slice(1)}`;
  }

  private promiseMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const [f, g] = e.arguments;
    const value = this.typeOf(target).replace(/^JSPromise<(.*)>\??$/, '$1');
    switch (name) {
      case 'then': {
        const adopt = (f && this.returnsPromise(f)) || (g && this.returnsPromise(g));
        // A handler that ignores the value still takes it.
        const ignores = f && (ts.isArrowFunction(f) || ts.isFunctionExpression(f)) && !f.parameters.length && value !== 'Void';
        const onFulfilled = ignores ? this.closure(f as ts.ArrowFunction, [`_ __unused: ${value}`]) : f && this.fn(f);
        return `${t}.${adopt ? 'thenAdopt' : 'then'}(${[onFulfilled, g && this.rejectionHandler(g)].filter(Boolean).join(', ')})`;
      }
      case 'catch': {
        const result = this.typeOf(e).replace(/^JSPromise<(.*)>$/, '$1');
        const adopt = this.returnsPromise(f);
        if (result === value) return `${t}.${adopt ? 'catchAdopt' : 'catch'}(${this.rejectionHandler(f)})`;
        // The fulfilled value passes through as the wider type the catch handler's result makes.
        const pass = `{ (__value: ${value}) -> ${adopt ? `JSPromise<${result}>` : result} in ${value === 'Never' ? 'switch __value {}' : adopt ? `JSPromise<${result}>.resolve(__value)` : 'return __value'} }`;
        return `${t}.${adopt ? 'thenAdopt' : 'then'}(${pass}, ${this.rejectionHandler(f)})`;
      }
      case 'finally': return `${t}.finally(${this.fn(f)})`;
      case 'cancel': return `${t}.cancel()`;
    }
    throw this.error(e, `Promise.${name}`);
  }

  private collectionMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const type = this.typeOf(target).replace(/\?$/, '');
    const [k, v] = /^JSMap<(.*), (.*)>$/.exec(type)?.slice(1) ?? [/^JSSet<(.*)>$/.exec(type)?.[1] ?? 'Any?', ''];
    const arg = (n: number, as: string) => this.coerce(e.arguments[n], as);
    switch (name) {
      case 'get': case 'has': case 'delete': return `${t}.${name}(${arg(0, k)})`;
      case 'set': return `${t}.set(${arg(0, k)}, ${arg(1, v)})`;
      case 'add': return `${t}.add(${arg(0, k)})`;
      case 'clear': case 'keys': case 'values': case 'entries': return `${t}.${name}()`;
      case 'forEach': {
        const f = e.arguments[0];
        if (!(ts.isArrowFunction(f) || ts.isFunctionExpression(f))) return `${t}.forEach(${this.expr(f)})`;
        // The map passes (value, key); a callback declaring fewer parameters ignores the rest.
        const params = f.parameters.map((p) => `${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)}`);
        const types = v ? [v, k] : [k, k];
        while (params.length < 2) params.push(`_: ${types[params.length]}`);
        const throws = this.throwsInfo.fn(f) ? 'throws ' : '';
        return `${t}.forEach { (${params.join(', ')}) ${throws}-> Void in${this.functionBody(f, 'Void', this.indent).slice(1)}`;
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
      return `${t}(${this.iterable(src)})`;
    }
    if (t.startsWith('JSPromise<')) {
      const v = t.replace(/^JSPromise<(.*)>$/, '$1');
      const ex = args[0];
      if (!ex || !(ts.isArrowFunction(ex) || ts.isFunctionExpression(ex))) throw this.error(e, 'a Promise executor that is not a function literal');
      const r = this.fresh('__resolvers');
      const [res, rej] = ex.parameters.map((p) => p.name as ts.Identifier);
      const binds: string[] = [];
      if (res) { this.resolvers.set(this.resolve(res)!, { name: r, type: v }); binds.push(`let ${ident(res.text)}: (${v}) -> Void = { ${r}.resolve($0) }`); }
      if (rej) binds.push(`let ${ident(rej.text)}: (Any?) -> Void = { ${r}.reject($0) }`);
      const body = this.functionBody(ex, 'Void', this.indent);
      const inner = this.indent + '    ';
      return `${t} { (${r}: JSResolvers<${v}>) throws -> Void in\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)}`;
    }
    if (ERRORS[name] && this.isLibGlobal(callee as ts.Identifier) === false && ERRORS[name] === t) {
      return `${t}(${args.length ? this.coerce(args[0], 'String') : ''})`;
    }
    if (ERRORS[name]) return `${ERRORS[name]}(${args.length ? this.str(args[0]) : ''})`;
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    if (name === 'RegExp') return `JSRegExp(${this.str(args[0])}${args[1] ? `, ${this.str(args[1])}` : ''})`;
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${args.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    if (name === 'WeakRef' && this.isLibGlobal(callee as ts.Identifier)) return `${t}(${this.expr(args[0])})`;
    if ((name === 'WeakMap' || name === 'WeakSet') && this.isLibGlobal(callee as ts.Identifier)) return args.length ? `${t}(${this.iterable(args[0])})` : `${t}()`;
    if (t === 'InteropReference') return `InteropReference(${args[0] ? this.coerce(args[0], 'Any?') : ''})`;
    // `new Array(n)` of a type holding undefined: n holes, each read as undefined.
    if (name === 'Array' && args.length === 1 && !this.isString(args[0]) && /^JSArray<(Any\?|.*\?)>$/.test(t)) return `${t}(Array(repeating: nil, count: Int(${this.toNumber(args[0])})))`;
    if (name === 'Array') throw this.error(e, `new ${name}`);
    const core = this.core.construct(e) ?? this.native.construct(e);
    if (core) return core;
    // `new UIEdgeInsets({ top, left, bottom, right })`: the struct from its fields.
    if (this.native.isStructType(t) && args.length === 1 && ts.isObjectLiteralExpression(args[0])) return this.coerce(args[0], t);
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t}(${this.args(e).join(', ')})`;
      if (!args.length) return `${t}()`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'new');
  }

  private typeofExpr(e: ts.TypeOfExpression): string {
    if (neverDefined(e.expression, this.checker)) return '"undefined"';
    const newer = this.native.introducedAfterDeployment(e.expression);
    if (newer) return `(jsOSAtLeast(${newer}) ? "function" : "undefined")`;
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Void') return '"undefined"';
    const known = base === 'Double' ? 'number' : base === 'String' ? 'string' : base === 'Bool' ? 'boolean' : base === 'JSSymbol' ? 'symbol' : base === 'JSBigInt' ? 'bigint' : base.includes('->') ? 'function' : base === 'Any' ? null : 'object';
    if (t === 'Any?' || !known) return `jsTypeof(${this.expr(e.expression)})`;
    const maybe = this.maybeUndefined(e.expression);
    if (maybe) return `(${maybe} == nil ? "undefined" : ${swiftString(known)})`;
    return t.endsWith('?') ? `(${this.expr(e.expression)} == nil ? "undefined" : ${swiftString(known)})` : swiftString(known);
  }

  private prefix(e: ts.PrefixUnaryExpression): string {
    const K = ts.SyntaxKind;
    switch (e.operator) {
      case K.ExclamationToken: {
        const operand = this.isBool(e.operand) && !this.maybeUndefined(e.operand) ? this.expr(e.operand) : this.cond(e.operand);
        return operand.startsWith('!') ? `!(${operand})` : `!${operand}`;
      }
      // `-0` is negative zero; Swift reads the literal `-0` as an integer zero.
      case K.MinusToken:
        if (this.typeOf(e.operand) === 'JSBigInt') return `(-${this.expr(e.operand)})`;
        return ts.isNumericLiteral(e.operand) ? (Number(e.operand.text) === 0 ? '-0.0' : `-${this.expr(e.operand)}`) : `-${this.toNumber(e.operand)}`;
      case K.PlusToken: return this.toNumber(e.operand);
      case K.TildeToken: return this.typeOf(e.operand) === 'JSBigInt' ? `(~${this.expr(e.operand)})` : `jsBitNot(${this.toNumber(e.operand)})`;
      case K.PlusPlusToken: return `jsPreIncrement(&${this.lvalue(e.operand)})`;
      case K.MinusMinusToken: return `jsPreDecrement(&${this.lvalue(e.operand)})`;
    }
    throw this.error(e, 'prefix operator');
  }

  /** `left = right` (also the assignment `??=` and `||=` make). */
  private assignment(e: ts.BinaryExpression): string {
    const left = e.left, right = e.right;
    if (ts.isPropertyAccessExpression(left) && this.symbolName(left.expression) === 'VueRef' && left.name.text === 'value') return `${this.lvalue(left)} = ${this.signalWrite(left.expression, right, this.typeOf(left))}`;
    if (ts.isArrayLiteralExpression(left)) throw this.error(left, 'a destructuring assignment');
    if (ts.isPropertyAccessExpression(left) && this.isExpando(left)) return `jsSet(${this.expr(left.expression)}, ${swiftString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isPropertyAccessExpression(left)) {
      const special = this.core.assign(left, right) ?? this.native.assign(left, right);
      if (special) return special;
    }
    if (ts.isPropertyAccessExpression(left) && this.isAny(left.expression)) return `jsSet(${this.expr(left.expression)}, ${swiftString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isElementAccessExpression(left) && this.isAny(left.expression)) return `jsSet(${this.expr(left.expression)}, ${this.propertyKey(left.argumentExpression)}, ${this.coerce(right, 'Any?')})`;
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
    if (compound[op]) {
      const value = `${bit[compound[op]!]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      // `options |= UIMenuOptions.Destructive` on a native option set: the set of the combined raw value.
      const lt = this.declaredTypeOf(e.left) ?? this.typeOf(e.left);
      return `${target()} = ${this.native.isEnumType(lt.replace(/\?$/, '')) ? this.native.enumFromNumber(value, lt) : value}`;
    }
    switch (op) {
      case K.EqualsToken: return this.assignment(e);
      case K.PlusEqualsToken: return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: return `${target()} -= ${this.toNumber(e.right)}`;
      case K.AsteriskEqualsToken: return `${target()} *= ${this.toNumber(e.right)}`;
      case K.SlashEqualsToken: return `${target()} /= ${this.toNumber(e.right)}`;
      case K.PercentEqualsToken: return `${target()} = jsMod(${l()}, ${this.toNumber(e.right)})`;
      case K.AsteriskAsteriskEqualsToken: return `${target()} = jsPow(${l()}, ${this.toNumber(e.right)})`;
      case K.QuestionQuestionEqualsToken:
        if (this.isAny(e.left)) return `if ${this.tryPrefix(e.left)}jsIsNullish(${l()}) { ${this.tryPrefix(e)}${this.assignment(e)} }`;
        return `${target()} = ${l()} ?? ${this.coerce(e.right, this.typeOf(e.left).replace(/\?$/, ''))}`;
      case K.BarBarEqualsToken: return `if !jsTruthy(${this.tryPrefix(e.left)}${l()}) { ${this.tryPrefix(e)}${target()} = ${this.coerce(e.right, this.typeOf(e.left))} }`;
      case K.AmpersandAmpersandEqualsToken: return `if jsTruthy(${this.tryPrefix(e.left)}${l()}) { ${this.tryPrefix(e)}${target()} = ${this.coerce(e.right, this.typeOf(e.left))} }`;
      case K.PlusToken: {
        if (this.isString(e.left) || this.isString(e.right)) return `${this.concatOperand(e.left)} + ${this.concatOperand(e.right)}`;
        if (this.isAny(e.left) || this.isAny(e.right)) return `jsAdd(${this.coerce(e.left, 'Any?')}, ${this.coerce(e.right, 'Any?')})`;
        return `${this.toNumber(e.left)} + ${this.toNumber(e.right)}`;
      }
      case K.MinusToken: return `${this.toNumber(e.left)} - ${this.toNumber(e.right)}`;
      case K.AsteriskToken: return `${this.toNumber(e.left)} * ${this.toNumber(e.right)}`;
      case K.SlashToken: return `${this.toNumber(e.left)} / ${this.toNumber(e.right)}`;
      case K.PercentToken: return `jsMod(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      case K.AsteriskAsteriskToken: return `jsPow(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      case K.EqualsEqualsEqualsToken: case K.ExclamationEqualsEqualsToken: case K.EqualsEqualsToken: case K.ExclamationEqualsToken:
        return this.equality(e);
      case K.LessThanToken: case K.GreaterThanToken: case K.LessThanEqualsToken: case K.GreaterThanEqualsToken: {
        const sym = ts.tokenToString(op)!;
        if (this.isString(e.left) && this.isString(e.right)) return `jsCompare(${l()}, ${r()}) ${sym} 0`;
        return `${this.toNumber(e.left)} ${sym} ${this.toNumber(e.right)}`;
      }
      case K.QuestionQuestionToken: {
        const t = this.typeOf(e);
        const maybe = this.maybeUndefined(e.left);
        if (maybe && t === 'Any?') return `jsNullishCoalesce(${maybe} as Any?, ${this.coerce(e.right, 'Any?')})`;
        if (maybe) return `(${maybe} ?? ${this.coerce(e.right, t)})`;
        if (this.isAny(e.left)) return `jsNullishCoalesce(${l()}, ${this.coerce(e.right, 'Any?')})`;
        return `(${l()} ?? ${this.coerce(e.right, t)})`;
      }
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        if (this.isBool(e.left) && this.isBool(e.right)) return `${l()} ${sym} ${r()}`;
        // JavaScript returns an operand, not a Bool.
        const t = this.typeOf(e);
        const v = this.fresh('__v');
        const right = this.coerce(e.right, t);
        const lt = this.tryPrefix(e.left) ? 'try ' : '';
        const rt = this.tryPrefix(e.right) ? 'try ' : '';
        const throws = lt || rt ? 'throws ' : '';
        const leftType = this.typeOf(e.left);
        // The left operand is evaluated once; the result is it, unwrapped or boxed as the result's type needs.
        // A falsy left operand of another type is undefined or null where the result is optional.
        const leftValue = leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? `${v}!` : leftType === 'Any?' ? this.fromAny(v, t) : t === 'Bool' ? `jsTruthy(${v})`
          : t.endsWith('?') && leftType.endsWith('?') && op === K.AmpersandAmpersandToken ? 'nil' : v;
        return op === K.BarBarToken
          ? `({ () ${throws}-> ${t} in let ${v} = ${lt}${this.expr(e.left)}; return jsTruthy(${v}) ? ${leftValue} : ${rt}${right} }())`
          : `({ () ${throws}-> ${t} in let ${v} = ${lt}${this.expr(e.left)}; return jsTruthy(${v}) ? ${rt}${right} : ${leftValue} }())`;
      }
      case K.InstanceOfKeyword: {
        const name = e.right.getText();
        return `(${l()} is ${ERRORS[name] ?? this.typeOf(e.right).replace(/^typeof /, '') ?? name})`;
      }
      case K.CommaToken: return `({ ${this.exprStatement(e.left)}; return ${r()} }())`;
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
      [K.AmpersandToken]: (a, b) => `(${a} & ${b})`, [K.BarToken]: (a, b) => `(${a} | ${b})`, [K.CaretToken]: (a, b) => `(${a} ^ ${b})`,
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
      return `(${c}.map { ${leftBig ? '$0' : '-$0'} ${comparison[op]} 0 } ?? false)`;
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
    // Comparing a typed optional with null or undefined.
    const maybe = isNullish(b) ? this.maybeUndefined(a) : isNullish(a) ? this.maybeUndefined(b) : null;
    if (maybe) return `${maybe} ${negate ? '!=' : '=='} nil`;
    // A member of an untyped object compared with null or undefined: the value as read, before any conversion to the declared type.
    const untypedRead = (x: ts.Expression) => (ts.isElementAccessExpression(x) || ts.isPropertyAccessExpression(x)) && this.isAny(x.expression) && this.typeOf(x) !== 'Any?';
    const raw = (x: ts.Expression) => {
      if (!untypedRead(x)) return this.coerce(x, 'Any?');
      const target = (x as ts.PropertyAccessExpression | ts.ElementAccessExpression).expression;
      const key = ts.isElementAccessExpression(x) ? this.propertyKey(x.argumentExpression) : swiftString((x as ts.PropertyAccessExpression).name.text);
      return `jsGet(${this.expr(target)}, ${key})`;
    };
    if ((isNullish(b) && untypedRead(a)) || (isNullish(a) && untypedRead(b))) {
      const [x, n] = isNullish(b) ? [a, b] : [b, a];
      return `${negate ? '!' : ''}${strict ? `jsStrictEquals(${raw(x)}, ${this.coerce(n, 'Any?')})` : `jsIsNullish(${raw(x)})`}`;
    }
    // A member of an untyped object compared with a value: the comparison JavaScript makes, which a missing member fails.
    if (untypedRead(a) || untypedRead(b)) return `${negate ? '!' : ''}${strict ? 'jsStrictEquals' : 'jsLooseEquals'}(${raw(a)}, ${raw(b)})`;
    if (isNullish(b) && lt !== 'Any?') return `${this.expr(a)} ${negate ? '!=' : '=='} nil`;
    if (isNullish(a) && rt !== 'Any?') return `${this.expr(b)} ${negate ? '!=' : '=='} nil`;
    if (lt === 'Any?' || rt === 'Any?' || (lt !== rt && lt.replace(/\?$/, '') !== rt.replace(/\?$/, ''))) {
      if (!strict && (isNullish(a) || isNullish(b))) return `${negate ? '!' : ''}jsIsNullish(${this.coerce(isNullish(a) ? b : a, 'Any?')})`;
      const fn = strict ? 'jsStrictEquals' : 'jsLooseEquals';
      return `${negate ? '!' : ''}${fn}(${this.coerce(a, 'Any?')}, ${this.coerce(b, 'Any?')})`;
    }
    if (this.isObjectRef(a) && this.isObjectRef(b)) return `${this.expr(a)} ${negate ? '!==' : '==='} ${this.expr(b)}`;
    return `${this.expr(a)} ${negate ? '!=' : '=='} ${this.expr(b)}`;
  }

  private array(e: ts.ArrayLiteralExpression): string {
    // `[]` alone is never[]; its element type comes from where it goes.
    const context = this.checker.getContextualType(e);
    let t = this.typeOf(e);
    if (context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))) {
      const full = this.type(context, e);
      const c = full.replace(/\?$/, '');
      if (full !== 'Any?' && (c.startsWith('JSArray<') || c.startsWith('(') || !e.elements.length)) t = c;
    }
    if (t === 'Any?' || t === 'JSArray<Never>') t = 'JSArray<Any?>';
    if (t.startsWith('(')) return `(${e.elements.map((x) => this.expr(x)).join(', ')})`;
    const el = t.replace(/^JSArray<(.*)>$/, '$1');
    if (!e.elements.length) return `${t}()`;
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`Array(${this.iterable(x.expression)})`);
      } else if (ts.isOmittedExpression(x)) throw this.error(x, 'an array hole');
      else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `${t}(${parts.join(' + ')})`;
  }

  private object(e: ts.ObjectLiteralExpression): string {
    const contextual = this.checker.getContextualType(e);
    // `{ … } as unknown as T`: an object script reads and extends untyped.
    if (contextual && contextual.flags & ts.TypeFlags.Unknown) return this.dynamicObject(e);
    // An object held untyped that code fills in by key (`node = {}; node[key] = …`): extensible, as every script object is.
    if (contextual && contextual.flags & ts.TypeFlags.Any) return this.dynamicObject(e);
    const type = contextual && !(contextual.flags & ts.TypeFlags.Any) ? contextual : this.checker.getTypeAtLocation(e);
    const struct = this.native.structLiteral(e, this.checker.getNonNullableType(type));
    if (struct) return struct;
    const name = this.type(this.checker.getNonNullableType(type), e).replace(/\?$/, '');
    if (name.startsWith('JSRecord<')) {
      const v = name.replace(/^JSRecord<(.*)>$/, '$1');
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `(${ts.isComputedPropertyName(p.name) ? this.propertyKey(p.name.expression) : swiftString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${this.coerce(p.initializer, v)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `(${swiftString(p.name.text)}, ${ident(p.name.text)})`;
        throw this.error(p, 'this member in a dictionary literal');
      });
      return entries.length ? `${name}([${entries.join(', ')}])` : `${name}()`;
    }
    if (name === 'Any?' || name === 'Any' || name === 'Never' || name === 'EventData') return this.dynamicObject(e);
    if (/^JS(Iterator|AsyncIterator)</.test(name)) return this.scriptIterator(e, name);
    let decl = this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0];
    // A literal that conforms to an app interface it is not declared as.
    const conforming = this.appInterfaces?.find((i) => i.name === name);
    if (conforming && !(decl && ts.isInterfaceDeclaration(decl) && decl.name.text === name)) decl = conforming.type.getSymbol()?.declarations?.[0];
    const shape = [...this.shapes.values()].find((s) => s.name === name);
    let order: { name: string; type: string }[];
    let target = name;
    if (this.protocols.has(name) && decl && ts.isInterfaceDeclaration(decl)) {
      target = `${name}Object`;
      order = [
        ...decl.members.filter(ts.isPropertySignature).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) })),
        ...decl.members.filter(ts.isMethodSignature).map((m) => ({ name: m.name.getText(), type: this.typeOf(m), label: `_${m.name.getText()}` })),
      ];
    } else if (shape) order = shape.fields;
    else if (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl))) {
      order = decl.members.filter(ts.isPropertySignature).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) }));
    } else throw this.error(e, `an object literal of type ${name}`);
    const given = new Map<string, string>();
    const spreadTemps: string[] = [];
    // Methods that read `this` see the object through a weak reference the literal sets once it exists.
    const self = e.properties.some((p) => ts.isMethodDeclaration(p) && thisNodes(p).length) ? this.fresh('__self') : null;
    for (const p of e.properties) {
      if (ts.isPropertyAssignment(p)) {
        const key = literalKey(p.name, this.checker) ?? p.name.getText();
        given.set(key, this.coerce(p.initializer, order.find((f) => f.name === key)?.type ?? 'Any?'));
      } else if (ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)) {
        const key = literalKey(p.name, this.checker) ?? p.name.getText();
        const f = order.find((x) => x.name === key) as ShapeField | undefined;
        if (!f?.accessor) throw this.error(p, 'an accessor in an object literal of this type');
        if (ts.isGetAccessorDeclaration(p)) {
          if (f.accessor.throws && f.accessor.set) throw this.error(p, 'a getter that throws beside a setter');
          const body = this.withThis(p, '__this', false, () => this.functionBody(p, f.type, this.indent));
          given.set(`__get_${key}`, `{ (__this: ${target}) ${f.accessor.throws ? 'throws ' : ''}-> ${f.type} in${body.slice(1)}`);
        } else {
          if (this.throwsInfo.fn(p)) throw this.error(p, 'a setter that throws');
          const v = p.parameters[0].name as ts.Identifier;
          const body = this.withThis(p, '__this', false, () => this.functionBody(p, 'Void', this.indent));
          given.set(`__set_${key}`, `{ (__this: ${target}, ${ident(v.text)}: ${f.accessor.value}) -> Void in${body.slice(1)}`);
        }
      } else if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, this.narrowed(p.name, ident(p.name.text)));
      else if (ts.isSpreadAssignment(p)) {
        const src = this.expr(p.expression);
        if (this.isAny(p.expression)) {
          const tmp = this.fresh('__spread');
          spreadTemps.push(`let ${tmp}: Any? = ${this.tryPrefix(p.expression)}${src}`);
          for (const f of order) {
            const prev = given.get(f.name) ?? (f.type.endsWith('?') ? 'nil' : this.zero(f.type) ?? 'nil');
            given.set(f.name, `(jsHasKey(${tmp}, ${swiftString(f.name)}) ? ${this.fromAnyCode(`jsField(${tmp}, ${swiftString(f.name)})`, f.type, true)} : ${prev})`);
          }
          continue;
        }
        const fields = new Set(this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name));
        for (const f of order) if (fields.has(f.name)) given.set(f.name, `${src}.${ident(f.name)}`);
      } else if (ts.isMethodDeclaration(p)) {
        const ret = this.returnTypeOf(p);
        const body = self ? this.withThis(p, `${self}!`, false, () => this.functionBody(p, ret, this.indent)) : this.functionBody(p, ret, this.indent);
        given.set(literalKey(p.name, this.checker) ?? this.symbolMemberName(p.name) ?? p.name.getText(), `{ (${this.params(p, true)}) ${this.throwsInfo.fn(p) ? 'throws ' : ''}-> ${ret} in${body.slice(1)}`);
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
    const reorder = inOrder.join() !== declared.join() ? `, jsOrder: [${inOrder.map(swiftString).join(', ')}]` : '';
    const args = order.flatMap((f) => {
      const a = (f as ShapeField).accessor;
      if (a) return [...(a.get ? [`__get_${f.name}: ${given.get(`__get_${f.name}`)}`] : []), ...(a.set ? [`__set_${f.name}: ${given.get(`__set_${f.name}`)}`] : [])];
      return given.has(f.name) ? [`${ident((f as { label?: string }).label ?? f.name)}: ${given.get(f.name)}`] : [];
    }).join(', ');
    const made = `${target}(${args}${args && reorder ? reorder : reorder.slice(2)})`;
    if (!spreadTemps.length && !self) return made;
    const throws = spreadTemps.some((x) => /\btry\b/.test(x)) || /\btry\b/.test(made);
    const made2 = `${throws && !/^try /.test(made) ? 'try ' : ''}${made}`;
    if (self) return `{ () ${throws ? 'throws ' : ''}-> ${target} in ${spreadTemps.map((x) => x + '; ').join('')}weak var ${self}: ${target}?; let __made = ${made2}; ${self} = __made; return __made }()`;
    return `{ () ${throws ? 'throws ' : ''}-> ${target} in ${spreadTemps.join('; ')}; return ${made2} }()`;
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
    const member = (key: string) => {
      const p = e.properties.find((x) => x.name && (literalKey(x.name, this.checker) ?? x.name.getText()) === key);
      if (!p) return null;
      if (ts.isMethodDeclaration(p)) return { code: this.closure(p as unknown as ts.FunctionExpression), type: `(${p.parameters.map((q) => this.typeOf(q.name)).join(', ')}) throws -> ${this.returnTypeOf(p)}`, params: p.parameters.length };
      if (ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))) return { code: this.closure(p.initializer), type: `(${p.initializer.parameters.map((q) => this.typeOf(q.name)).join(', ')}) throws -> ${this.closureReturn(p.initializer)}`, params: p.initializer.parameters.length };
      throw this.error(p, 'this member of an iterator object');
    };
    for (const p of e.properties) {
      const key = p.name && (literalKey(p.name, this.checker) ?? p.name.getText());
      if (!key || !['next', 'return', 'throw'].includes(key)) throw this.error(p, 'this member of an iterator object');
    }
    const adapt = (key: string, arg: string) => {
      const m = member(key);
      if (!m) return null;
      const ret = functionParts(m.type)!.result;
      const call = `try (${m.code})(${m.params ? arg : ''})`;
      if (!async) return `{ (${arg}: Any?) throws -> Any? in ${this.convert(call, ret, 'Any?')} }`;
      const inner = ret.replace(/^JSPromise<(.*)>$/, '$1');
      return `{ (${arg}: Any?) throws -> JSPromise<Any?> in ${inner === 'Any?' ? call : `${call}.then { (__v: ${inner}) -> Any? in ${this.convert('__v', inner, 'Any?')} }`} }`;
    };
    const args = [`next: ${adapt('next', '__v')}`, ...['return', 'throw'].flatMap((k) => { const a = adapt(k, '__v'); return a ? [`${k}: ${a}`] : []; })];
    return `${async ? 'JSScriptAsyncIterator' : 'JSScriptIterator'}<${element}>(${args.join(', ')})`;
  }

  /** An object literal typed `any`: a plain JavaScript object. */
  private dynamicObject(e: ts.ObjectLiteralExpression): string {
    const simple = e.properties.every((p) => (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) || ts.isShorthandPropertyAssignment(p));
    if (simple) {
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `(${swiftString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${ts.isObjectLiteralExpression(p.initializer) ? this.dynamicObject(p.initializer) : this.coerce(p.initializer, 'Any?')})`;
        const sh = p as ts.ShorthandPropertyAssignment;
        return `(${swiftString(sh.name.text)}, ${this.coerce(sh.name, 'Any?')} as Any?)`;
      });
      return `JSObject([${entries.join(', ')}])`;
    }
    // Spreads, computed keys and methods: the object built key by key, in the literal's order.
    const o = this.fresh('__o');
    const key = (n: ts.PropertyName) => (ts.isComputedPropertyName(n) ? `${this.tryPrefix(n.expression)}${this.propertyKey(n.expression)}` : swiftString(literalKey(n, this.checker) ?? n.getText()));
    const accessorsDone = new Set<string>();
    const steps = e.properties.flatMap((p) => {
      if (ts.isSpreadAssignment(p)) return [`${this.tryPrefix(p.expression)}jsObjectSpread(${o}, ${this.coerce(p.expression, 'Any?')})`];
      if (ts.isShorthandPropertyAssignment(p)) return [`${o}[${swiftString(p.name.text)}] = ${this.coerce(p.name, 'Any?')}`];
      if (ts.isPropertyAssignment(p)) return [`${o}[${key(p.name)}] = ${this.tryPrefix(p.initializer)}${this.coerce(p.initializer, 'Any?')}`];
      if (ts.isMethodDeclaration(p)) return [`${o}[${key(p.name)}] = ${this.untypedMethod(p)}`];
      if (ts.isGetAccessorDeclaration(p) || ts.isSetAccessorDeclaration(p)) {
        // A getter and a setter of one key make one property, where the first of them is.
        const name = p.name.getText();
        if (accessorsDone.has(name)) return [];
        accessorsDone.add(name);
        const pair = e.properties.filter((q): q is ts.AccessorDeclaration => (ts.isGetAccessorDeclaration(q) || ts.isSetAccessorDeclaration(q)) && q.name.getText() === name);
        const g = pair.find(ts.isGetAccessorDeclaration), st = pair.find(ts.isSetAccessorDeclaration);
        const get = g ? `get: { (__this: Any?) throws -> Any? in${this.withThis(g, '__this', true, () => this.functionBody(g, 'Any?', this.indent)).slice(1)}` : '';
        const v = st && (st.parameters[0].name as ts.Identifier);
        const set = st && v ? `set: { (__this: Any?, ${ident(v.text)}: Any?) throws -> Void in${this.withThis(st, '__this', true, () => this.functionBody(st, 'Void', this.indent)).slice(1)}` : '';
        return [`try ${o}.defineProperty(${key(p.name)}, JSPropertyDescriptor(${[get, set, 'enumerable: true', 'configurable: true'].filter(Boolean).join(', ')}))`];
      }
      throw this.error(p, 'this member in an untyped object literal');
    });
    // Whether building the object throws (closures it holds throw on their own).
    const throws = this.throwsInfo.expr(e) || steps.some((x) => x.startsWith('try '));
    return `{ () ${throws ? 'throws ' : ''}-> JSObject in let ${o} = JSObject(); ${steps.join('; ')}; return ${o} }()`;
  }

  /** A method of an untyped object literal: a function value, or one taking `this` when its body reads it. */
  private untypedMethod(p: ts.MethodDeclaration): string {
    const ret = this.returnTypeOf(p);
    const type = `(${p.parameters.map((q) => this.typeOf(q.name)).join(', ')}) throws -> ${ret}`;
    if (!thisNodes(p).length) return this.boxFunction(`{ (${this.params(p, true)}) throws -> ${ret} in${this.functionBody(p, ret, this.indent).slice(1)}`, type);
    const fn = functionParts(type)!;
    const binds = fn.params.map((t, k) => `let ${ident((p.parameters[k].name as ts.Identifier).text)}: ${t} = ${this.fromAnyCode(`jsArg(__a, ${k})`, t, true)}`);
    const body = this.withThis(p, '__this', true, () => this.functionBody(p, ret, this.indent + '    '));
    const call = `try { () throws -> ${ret} in${body.slice(1)}()`;
    const result = ret === 'Void' ? `${call}; return nil` : `return ${this.convert(call, ret, 'Any?')}`;
    return `({ (__this: Any?, __a: [Any?]) throws -> Any? in ${binds.join('; ')}${binds.length ? '; ' : ''}${result} } as JSMethod)`;
  }

  /** `return value` in an async generator: the value awaited first. */
  error(n: ts.Node | undefined, what: string): Error {
    if (!n) return new Error(`${what} is not supported in a release build yet`);
    const sf = n.getSourceFile();
    const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
    return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${what} is not supported in a release build yet: ${n.getText().slice(0, 80)}`);
  }
}

/** Swift's spelling of what the async lowering writes. */
const SWIFT_SYNTAX: AsyncSyntax = {
  voidType: 'Void',
  fnType: (params, ret) => `(${params.map((p) => (p === '() -> Void' ? `@escaping ${p}` : p)).join(', ')}) -> ${ret}`,
  constant: (name, type, value) => `let ${name}${type ? `: ${type}` : ''} = ${value}`,
  closure: (params, body, onError, i) => {
    const list = `(${params.map(([n, t]) => `${n}: ${t === '() -> Void' ? '@escaping ' : ''}${t}`).join(', ')})`;
    if (!body.some((l) => /\btry\b|\bthrow\b/.test(l))) return `{ ${list} -> Void in\n${body.join('\n')}\n${i}}`;
    const deeper = body.map((l) => '    ' + l);
    return `{ ${list} -> Void in\n${i}    do {\n${deeper.join('\n')}\n${i}    } catch {\n${i}        ${onError}(jsCaught(error))\n${i}    }\n${i}}`;
  },
  inline: (statement, param) => (param ? `{ (${param[0]}: ${param[1]}) -> Void in ${statement} }` : `{ ${statement} }`),
  ifOpen: (cond) => `if ${cond} {`,
  elseOpen: '} else {',
  ifLine: (cond, statements) => `if ${cond} { ${statements} }`,
  scopeOpen: 'do {',
  tryBlock: (body, onError, i) => (body.some((l) => /\btry\b|\bthrow\b/.test(l))
    ? [`${i}do {`, ...body.map((l) => '    ' + l), `${i}} catch {`, `${i}    ${onError}(jsCaught(error))`, `${i}}`]
    : [`${i}do {`, ...body, `${i}}`]),
  unwrap: (code) => `${code}!`,
  makeIterator: (name, seq) => `var ${name} = ${seq}.makeIterator()`,
  nextItem: (item, iterator, otherwise, i) => [`${i}guard let ${item} = ${iterator}.next() else { ${otherwise} }`],
  awaitCall: (operand, isPromise, continuation, onError) => `jsAwait(${isPromise ? operand : `value: ${operand}`}, ${continuation}, ${onError})`,
  asyncStart: (cap, result) => `let ${cap} = JSAsync<${result}>()`,
  asyncBody: (cap) => [`${cap}.body {`, '}'],
  asyncReturn: (cap, value, isPromise, result) => (value === null ? `${cap}.returnValue(${result === 'Void' ? '()' : 'nil'})` : `${cap}.${isPromise ? 'returnPromise' : 'returnValue'}(${value})`),
  asyncError: (cap) => `${cap}.throwValue`,
  loopRun: (iteration) => `JSAsyncLoop().run ${iteration}`,
  undefinedValue: 'nil',
  generatorBody: (cap, element, isAsync) => [`return ${isAsync ? 'JSAsyncGenerator' : 'JSGenerator'}<${element}> { (${cap}: ${isAsync ? 'JSAsyncGeneratorContext' : 'JSGeneratorContext'}) throws -> Void in`, '}'],
  generatorReturn: (cap, value) => `${cap}.returnValue(${value ?? ''})`,
  yieldCall: (cap, operand, delegate, continuation, onError, onReturn) => `${cap}.${delegate ? 'delegate' : 'yield'}(${operand}, ${continuation}, ${onError}, ${onReturn})`,
  nextStep: (item, iterator, type, otherwise, i) => [`${i}guard try ${iterator}.jsAdvance() else { ${otherwise} }`, `${i}let ${item}: ${type} = ${iterator}.jsCurrent`],
  closeIterator: (iterator) => `${iterator}.jsClose()`,
  awaitNext: (iterator, continuation, onError) => `jsAwait(${iterator}.jsNextPromise(nil), ${continuation}, ${onError})`,
  asyncStep: (step, result, otherwise, i) => [`${i}let ${step} = try jsStepOf(${result})`, `${i}if ${step}.done { ${otherwise} }`],
  closeAsyncIterator: (iterator, next, onError) => `jsAsyncClose(${iterator}, ${next}, ${onError})`,
  closeAsyncIteratorThrowing: (iterator, error, onError) => `jsAsyncCloseThrowing(${iterator}, ${error}, ${onError})`,
  tryStatement: (statement) => statement.replace(/^(let \w+(?:: [^=]+)? = )/, '$1try '),
};

const LIB_CONSTANTS: Record<string, string> = {
  'Math.PI': 'Double.pi', 'Math.E': 'M_E', 'Math.LN2': 'M_LN2', 'Math.LN10': 'M_LN10', 'Math.LOG2E': 'M_LOG2E', 'Math.LOG10E': 'M_LOG10E', 'Math.SQRT2': '2.0.squareRoot()', 'Math.SQRT1_2': '0.5.squareRoot()',
  'Number.MAX_SAFE_INTEGER': '9007199254740991', 'Number.MIN_SAFE_INTEGER': '-9007199254740991', 'Number.EPSILON': 'Double.ulpOfOne',
  'Number.MAX_VALUE': 'Double.greatestFiniteMagnitude', 'Number.MIN_VALUE': 'Double.leastNonzeroMagnitude', 'Number.POSITIVE_INFINITY': 'Double.infinity',
  'Number.NEGATIVE_INFINITY': '-Double.infinity', 'Number.NaN': 'Double.nan',
  'Symbol.iterator': 'JSSymbol.iterator', 'Symbol.asyncIterator': 'JSSymbol.asyncIterator', 'Symbol.toPrimitive': 'JSSymbol.toPrimitive',
  'Symbol.toStringTag': 'JSSymbol.toStringTag', 'Symbol.hasInstance': 'JSSymbol.hasInstance',
};

/** A field of an object literal's class; an accessor runs closures the literal gives. */
interface ShapeField { name: string; type: string; accessor?: { get: boolean; set: boolean; throws: boolean; value: string }; symbol?: boolean }

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

/** `Symbol.iterator`, as the library declares `Symbol`. */
function isSymbolIterator(e: ts.Expression, checker: ts.TypeChecker): boolean {
  return ts.isPropertyAccessExpression(e) && e.name.text === 'iterator' && ts.isIdentifier(e.expression) && e.expression.text === 'Symbol'
    && !!checker.getSymbolAtLocation(e.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
}

function isLibDeclaration(d: ts.Node | undefined): boolean {
  return !!d && /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName);
}

function boundNames(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : boundNames(e.name)));
}

function hasModifier(n: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(n) && !!ts.getModifiers(n)?.some((m) => m.kind === kind);
}

function numberLiteral(text: string): string {
  const t = text.replace(/_/g, '');
  if (/^0[xob]/i.test(t)) return String(Number(t));
  if (/^0\d+$/.test(t)) return String(parseInt(t, 8));
  if (t.startsWith('.')) return '0' + t;
  if (t.endsWith('.')) return t + '0';
  return t;
}

function numericLiteralOnly(e: ts.Expression): boolean {
  if (ts.isParenthesizedExpression(e)) return numericLiteralOnly(e.expression);
  if (ts.isNumericLiteral(e)) return true;
  if (ts.isPrefixUnaryExpression(e)) return numericLiteralOnly(e.operand);
  if (ts.isBinaryExpression(e)) return numericLiteralOnly(e.left) && numericLiteralOnly(e.right);
  return false;
}

function isWriteTarget(e: ts.Node): boolean {
  const p = e.parent;
  if (ts.isBinaryExpression(p) && p.left === e && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
  if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) return true;
  return false;
}

function refersToThis(e: ts.Node): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (n.kind === ts.SyntaxKind.ThisKeyword) found = true;
    if (!found && !ts.isFunctionDeclaration(n)) ts.forEachChild(n, visit);
  };
  visit(e);
  return found;
}

/** Whether a `continue label` inside `n` targets the loop labeled `label`. */
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
    if (c.kind === kind) {
      // A break or continue inside a nested loop belongs to that loop.
      found = true;
      return;
    }
    if ((kind === ts.SyntaxKind.ContinueStatement || kind === ts.SyntaxKind.BreakStatement) && (ts.isIterationStatement(c, false))) return;
    ts.forEachChild(c, visit);
  };
  ts.forEachChild(n, visit);
  if (n.kind === kind) return true;
  return found;
}

/** Whether a closure inside `body` refers to the variable `name` declares. */
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

/** `A, (B, C), D<E, F>` split at its top-level commas. */
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

/** A Swift parameter's type without its default value (`= nil`). */
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

function splitTopLevel(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}

interface FunctionParts { text: string; params: string[]; result: string }

/** `(A, B) throws -> R` split into its parameter and result types; null for any other type. */
function functionParts(type: string): FunctionParts | null {
  const t = type.trim();
  if (!t.startsWith('(')) return null;
  let depth = 0, close = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(' || t[i] === '[' || t[i] === '<') depth++;
    else if ((t[i] === ')' || t[i] === ']' || (t[i] === '>' && t[i - 1] !== '-'))) { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close < 0) return null;
  const rest = /^\s*(?:throws\s*)?->\s*(.+)$/.exec(t.slice(close + 1));
  if (!rest) return null;
  const inner = t.slice(1, close).trim();
  const params = inner ? splitTopLevel(inner) : [];
  return { text: `(${params.join(', ')}) throws -> ${rest[1]}`, params, result: rest[1] };
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

/** Whether an initializer holds a function that reads `this`. */
function capturesThis(e: ts.Expression): boolean {
  let found = false;
  const visit = (n: ts.Node, inFunction: boolean): void => {
    if (found) return;
    if (n.kind === ts.SyntaxKind.ThisKeyword && inFunction) { found = true; return; }
    // A `function` has a `this` of its own.
    if (ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n) || ts.isClassLike(n)) return;
    ts.forEachChild(n, (c) => visit(c, inFunction || ts.isArrowFunction(n)));
  };
  visit(e, false);
  return found;
}

/** Whether a module function `fn` called at `at` is shadowed by a member of the class around it, as a bare name is in Swift and Kotlin. */
function shadowedByMember(at: ts.Node, decl: ts.Declaration | undefined, fn: string, ident: (name: string) => string): boolean {
  if (!decl || !ts.isFunctionDeclaration(decl) || !ts.isSourceFile(decl.parent)) return false;
  const cls = ts.findAncestor(at, ts.isClassLike);
  return !!cls && cls.members.some((m) => !!m.name && ts.isIdentifier(m.name) && ident(m.name.text) === fn);
}

/** What `inject(token)` gives: the kit's instance for a framework token, else the app's service. */
function injected(token: string): string {
  switch (token) {
    case 'RouterExtensions': return 'Router.shared';
    case 'ActivatedRoute': return 'ActivatedRoute.current';
    case 'Page': return 'Page.injected()';
    case 'DestroyRef': return 'DestroyRef.current()';
    case 'NativeDialogRef': return 'NativeDialogRef.current';
    default: return `${token}.shared`;
  }
}

/**
 * A function's type parameter its parameters do not name (`loadCache<T>(key: string): Cached<T>`): Swift infers type
 * parameters from arguments only, so the function holds any value there and its callers read the value as they type it.
 */
function erasedTypeParameter(p: ts.TypeParameterDeclaration): boolean {
  const fn = p.parent;
  // An interface is a class of fields: one class for every instantiation.
  if (ts.isInterfaceDeclaration(fn) || ts.isTypeAliasDeclaration(fn)) return true;
  if (!ts.isFunctionDeclaration(fn) && !ts.isMethodDeclaration(fn) && !ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return false;
  const named = new RegExp(`\\b${p.name.text}\\b`);
  return !fn.parameters.some((q) => q.type && named.test(q.type.getText()));
}
