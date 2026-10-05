import type { SourceLines } from './source-lines.ts';
import ts from 'typescript';
import { Throws, isAsync, isStatic } from './throws.ts';
import { intlConstructor, isObjectToStringCall, isStringRaw, leadingNeverRead, redeclaredBeside, iteratedType, iterationThrows, jsKeyOrder, literalKey, neverDefined, templateParts, unsafeReceiver, wellKnownMember, WELL_KNOWN_MEMBERS, ignoresThisArg, implementedInterfaces } from './lang.ts';
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

/** Code one level deeper; a `#sourceLocation` directive stays where it is. */
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

/** Library functions applied to a list (`f.apply(null, list)`): the runtime's function of an array-like. */
const LIST_APPLIED: Record<string, string> = { 'String.fromCharCode': 'jsFromCharCodeList', 'Math.max': 'jsMathMaxList', 'Math.min': 'jsMathMinList' };

/** The ES library's decorator and property descriptor interfaces: plain objects in library mode. */
const DESCRIPTORS = new Set(['PropertyDescriptor', 'TypedPropertyDescriptor', 'PropertyDescriptorMap', 'ClassDecorator', 'MethodDecorator', 'PropertyDecorator', 'ParameterDecorator']);

/** A function type `(…) throws -> R` returning `Any?` instead. */
function returningAny(type: string): string {
  let depth = 0;
  for (let i = 0; i < type.length; i++) {
    if (type[i] === '(') depth++;
    else if (type[i] === ')' && --depth === 0) return type.slice(0, i + 1) + ' throws -> Any?';
  }
  return type;
}

/** A function expression that declares a `this` parameter or reads `this`: a method value, called with a receiver. */
function isMethodValue(fn: ts.FunctionExpression): boolean {
  const first = fn.parameters[0];
  return (!!first && ts.isIdentifier(first.name) && first.name.text === 'this' && first.type?.kind !== ts.SyntaxKind.VoidKeyword) || thisNodes(fn).length > 0;
}

/** Whether an expression's value is unused: a statement of its own, or a for loop's clause. */
function statementLevel(e: ts.Expression): boolean {
  let n: ts.Node = e;
  while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
  const p = n.parent;
  return ts.isExpressionStatement(p) || (ts.isForStatement(p) && (p.incrementor === n || p.initializer === n)) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.CommaToken && p.left === n);
}

function isCompoundAssignment(op: ts.SyntaxKind): boolean {
  return op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment;
}

function isNullish(e: ts.Expression): boolean {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined') || ts.isVoidExpression(e);
}

/** A dotted path (`Trace.ConsoleWriter`), each part an identifier. */
function identPath(name: string): string {
  return name.split('.').map(ident).join('.');
}

function indented(code: string): string {
  return code.split('\n').map((l) => (l && !l.startsWith('#sourceLocation') ? '    ' + l : l)).join('\n');
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

export const CF_CLASSES = new Set(['CGPath', 'CGMutablePath', 'CGColor', 'CGImage', 'CGContext', 'CGColorSpace', 'CGGradient', 'CTFont', 'CTLine', 'CTFrame', 'CFString', 'CFData', 'CFRunLoop', 'CFRunLoopTimer', 'CFRunLoopSource', 'CFRunLoopObserver']);

/** An optional value type: `T?`, `(…)?`, but not a function returning an optional. */
const isOptional = (t: string) => t.endsWith('?') && !hasTopLevelArrow(t);
const isFunctionLiteral = (e: ts.Expression): boolean => (ts.isParenthesizedExpression(e) ? isFunctionLiteral(e.expression) : ts.isArrowFunction(e) || ts.isFunctionExpression(e));

const isFunctionType = (t: string) => hasTopLevelArrow(t) && !t.startsWith('[') && !/^\w+</.test(t);

export interface ComponentInfo {
  name: string;
  props: string[];
}

// No prototype: a name like `toString` is no error class.
const BUILTIN_CLASSES: Record<string, string> = Object.assign(Object.create(null), { Promise: 'JSThenable', Array: 'JSArrayProtocol', Map: 'JSMapProtocol', Set: 'JSSetProtocol', Date: 'JSDate', ArrayBuffer: 'JSArrayBuffer', Uint8Array: 'JSUint8Array' });
const ERRORS: Record<string, string> = Object.assign(Object.create(null), { Error: 'JSError', TypeError: 'JSTypeError', RangeError: 'JSRangeError', SyntaxError: 'JSSyntaxError', ReferenceError: 'JSReferenceError', AggregateError: 'JSAggregateError' });
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date', 'WeakRef', 'Symbol', 'WeakMap', 'WeakSet', 'BigInt', 'ArrayBuffer', 'Uint8Array']);

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
  /** Optional chain reads whose undefined the context tests rather than converts (`a?.b || x`). */
  private optionalReads = new Map<ts.Node, boolean>();
  /** The names of the type parameters the translated code declares. */
  private genericNames = new Set<string>();

  /** A binding Swift holds as optional though TypeScript types it present (a native method's nullable parameter): reads unwrap it as undefined would read. */
  bindsOptional(name: ts.Node, type: string): string {
    const sym = this.resolve(name);
    const t = optionalType(type);
    if (sym) this.undefinedVars.set(sym, t);
    return t;
  }
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
  /** Inside a class extending a native one, whose base's nested types (`UIViewController.Transition`) hide the module's of their names. */
  inNativeClassBody = false;
  /**
   * Library mode (the kit generated from core): each module's functions and
   * variables are static members of an enum named for the module, so modules
   * never collide with each other or shadow Swift's own functions (`round`).
   */
  library: { moduleName(file: string): string | null; counterpart?(file: string, name: string): string | null; isMoot?(file: string): boolean; identities?: Set<string>; internalTypes?: Set<string>; sourceOf?(declarationFile: string): string | null; strict?(file: string): boolean } | null = null;
  /**
   * Library mode, in a file written for strictNullChecks (a package core compiles): a variable or
   * parameter declared `T | null`, which the lenient checker reads as `T`, holds null apart from undefined: untyped.
   */
  private declaredNullable(n: ts.Node): boolean {
    if (!this.library?.strict || !ts.isIdentifier(n) || !this.library.strict(n.getSourceFile().fileName)) return false;
    const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
    if (!d || !(ts.isVariableDeclaration(d) || ts.isParameter(d)) || !d.type || !this.library.strict(d.getSourceFile().fileName)) return false;
    const nullable = (t: ts.TypeNode): boolean => ts.isUnionTypeNode(t) && t.types.some((x) => ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword);
    return nullable(d.type);
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

  /**
   * A static field a class declares where a class it extends declares a static of that name
   * (`static default = new Font()` over FontBase's): a field of its own, as JavaScript's
   * constructors each hold theirs, which Swift's statics cannot redeclare.
   */
  private staticName(m: ts.ClassElement): string | null {
    if (!isStatic(m) || !ts.isPropertyDeclaration(m) || !m.name || ts.isComputedPropertyName(m.name) || !ts.isClassLike(m.parent)) return null;
    const name = m.name.getText();
    for (let b = this.sourceBase(m.parent); b; b = this.sourceBase(b)) {
      if (b.members.some((x) => isStatic(x) && x.name?.getText() === name)) return `${name}__${(m.parent.name?.text ?? 'class').replace(/\W/g, '_')}`;
    }
    return null;
  }

  /** A member's Swift name as `e` reaches it: a shadowing static's own name (see `staticName`). */
  private memberName(e: ts.PropertyAccessExpression): string {
    const decl = this.resolve(e.name)?.valueDeclaration;
    return ident((decl && ts.isClassElement(decl) && this.staticName(decl)) || e.name.text);
  }

  private ownCalls = new Set<ts.Node>();
  /** A call of a method an instance can replace (see `instanceKeys`): through the instance's own value, which may throw. */
  private replaceableCall(e: ts.CallExpression): boolean {
    return !!this.library && ts.isPropertyAccessExpression(e.expression) && this.instanceKeys().has(this.methodDecl(e.expression.name) as ts.Node)
      && !!this.resolve(e.expression.name)?.declarations?.some((d) => ts.isMethodDeclaration(d) && !!d.body);
  }
  private ownKeys: Set<ts.Node> | null = null;
  /** The method a member name resolves to, through a mapped type (`Readonly<Match>`) too. */
  private methodDecl(name: ts.MemberName): ts.Declaration | undefined {
    const sym = this.resolve(name);
    return sym?.valueDeclaration ?? sym?.declarations?.find(ts.isMethodDeclaration);
  }
  /** Methods an instance may hold a value in place of: given by `Object.defineProperty(this, …)` or `Object.defineProperties(this, …)` in their class, or by an object literal of their class. */
  private instanceKeys(): Set<ts.Node> {
    if (this.ownKeys) return this.ownKeys;
    const methods = new Set<ts.Node>();
    const methodOf = (cls: ts.ClassLikeDeclaration | undefined, key: string) => {
      const sym = cls?.name && this.checker.getSymbolAtLocation(cls.name);
      const d = sym && this.checker.getDeclaredTypeOfSymbol(sym).getProperty(key)?.valueDeclaration;
      if (d && ts.isMethodDeclaration(d)) methods.add(d);
    };
    const visit = (n: ts.Node) => {
      if (ts.isCallExpression(n) && n.arguments[0]?.kind === ts.SyntaxKind.ThisKeyword) {
        const callee = n.expression.getText();
        const cls = ts.findAncestor(n, ts.isClassLike);
        if (callee === 'Object.defineProperty' && n.arguments[1] && ts.isStringLiteralLike(n.arguments[1])) methodOf(cls, n.arguments[1].text);
        if (callee === 'Object.defineProperties' && n.arguments[1] && ts.isObjectLiteralExpression(n.arguments[1])) for (const p of n.arguments[1].properties) if (p.name && !ts.isComputedPropertyName(p.name)) methodOf(cls, literalKey(p.name, this.checker) ?? p.name.getText());
      }
      // A method an object literal of its class gives a value for.
      if (ts.isObjectLiteralExpression(n)) {
        const cls = this.literalClassOf(n);
        if (cls) for (const p of n.properties) if (p.name && !ts.isComputedPropertyName(p.name)) methodOf(cls, p.name.getText());
      }
      ts.forEachChild(n, visit);
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return (this.ownKeys = methods);
  }

  private protoKeys: { data: Set<string>; accessors: Set<string> } | null = null;
  /** Names the program writes on prototypes: `X.prototype.name = v` (data), `Object.defineProperty(X.prototype, 'name', …)` (accessors). */
  private prototypeKeys(): { data: Set<string>; accessors: Set<string> } {
    if (this.protoKeys) return this.protoKeys;
    const data = new Set<string>(), accessors = new Set<string>();
    const isPrototype = (x: ts.Node) => ts.isPropertyAccessExpression(x) && x.name.text === 'prototype';
    const visit = (n: ts.Node) => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left) && isPrototype(n.left.expression)) data.add(n.left.name.text);
      if (ts.isCallExpression(n) && n.expression.getText() === 'Object.defineProperty' && n.arguments.length >= 2 && isPrototype(n.arguments[0]) && ts.isStringLiteralLike(n.arguments[1])) accessors.add(n.arguments[1].text);
      ts.forEachChild(n, visit);
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return (this.protoKeys = { data, accessors });
  }

  /** Whether a class above (the program's own) declares a member of this name. */
  private baseDeclares(base: ts.ClassLikeDeclaration | undefined, name: string): boolean {
    for (let b = base; b; b = this.sourceBase(b)) if (b.members.some((m) => m.name?.getText() === name)) return true;
    return false;
  }

  /** Library mode: the field or accessor a source base class declares under a field's name, which the field redeclares. */
  private redeclaredField(m: ts.PropertyDeclaration): ts.PropertyDeclaration | ts.AccessorDeclaration | null {
    if (!this.library || isStatic(m) || !ts.isClassLike(m.parent)) return null;
    const name = m.name.getText();
    let found: ts.PropertyDeclaration | ts.AccessorDeclaration | null = null;
    for (let b = this.sourceBase(m.parent); b; b = this.sourceBase(b)) {
      const own = b.members.find((x): x is ts.PropertyDeclaration | ts.AccessorDeclaration => (ts.isPropertyDeclaration(x) || ts.isAccessor(x)) && !isStatic(x) && x.name.getText() === name);
      if (own) found = own;
    }
    return found;
  }

  /** The Swift type a redeclared field has where its base declares it. */
  private redeclaredType(root: ts.PropertyDeclaration | ts.AccessorDeclaration): string {
    return ts.isGetAccessorDeclaration(root) ? this.returnTypeOf(root) : ts.isSetAccessorDeclaration(root) ? this.typeOf(root.parameters[0].name) : this.typeOf(root.name);
  }

  /** `X.prototype` (library mode) of a class or of `Object`: an untyped object. */
  private isPrototypeRef(e: ts.Node): boolean {
    if (!this.library || !ts.isPropertyAccessExpression(e) || e.name.text !== 'prototype') return false;
    const target = e.expression;
    return (ts.isIdentifier(target) && target.text === 'Object' && this.isLibGlobal(target)) || !!((this.resolve(target)?.flags ?? 0) & ts.SymbolFlags.Class);
  }

  /** A method read off a prototype (`Object.prototype.hasOwnProperty`), or a variable holding one: a method value, untyped. */
  private isPrototypeMember(n: ts.Node): boolean {
    if (ts.isPropertyAccessExpression(n)) return this.isPrototypeRef(n.expression);
    if (!ts.isIdentifier(n) || !this.library) return false;
    const decl = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
    return !!decl && ts.isVariableDeclaration(decl) && !!decl.initializer && ts.isPropertyAccessExpression(decl.initializer) && this.isPrototypeRef(decl.initializer.expression);
  }

  private compiledSymbols = new Map<ts.Symbol, ts.Symbol | null>();
  /**
   * Library mode: what a name core's published declarations give (`import { ActionItem } from '.'`) is
   * in the program, when the module those declarations describe is compiled with it: its export of that name.
   */
  compiledCounterpart(sym: ts.Symbol | undefined): ts.Symbol | null {
    if (!sym || !this.library?.sourceOf) return null;
    let found = this.compiledSymbols.get(sym);
    if (found !== undefined) return found;
    found = null;
    const decl = sym.declarations?.[0];
    const source = decl?.parent && ts.isSourceFile(decl.parent) && decl.getSourceFile().isDeclarationFile ? this.library.sourceOf(decl.getSourceFile().fileName) : null;
    const sf = source ? this.sourceFiles.find((f) => f.fileName === source) : undefined;
    const module = sf && this.checker.getSymbolAtLocation(sf);
    const exported = module && this.checker.getExportsOfModule(module).find((x) => x.name === sym.name);
    const target = exported && (exported.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(exported) : exported);
    if (target && target.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface | ts.SymbolFlags.Enum) && target.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) found = target;
    this.compiledSymbols.set(sym, found);
    return found;
  }
  /** Library mode: the compiled method or constructor a published declaration's class member stands for. */
  private compiledMember(decl: ts.Declaration): ts.Declaration | null {
    const cls = decl.parent;
    if (!this.library || !cls || !ts.isClassDeclaration(cls) || !cls.name) return null;
    const compiled = this.compiledCounterpart(this.checker.getSymbolAtLocation(cls.name))?.declarations?.find((d): d is ts.ClassDeclaration => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile);
    if (!compiled) return null;
    if (ts.isConstructorDeclaration(decl)) return compiled.members.find((m) => ts.isConstructorDeclaration(m) && !!m.body) ?? null;
    const name = (decl as ts.NamedDeclaration).name?.getText();
    const member = name ? this.checker.getTypeAtLocation(compiled).getProperty(name) : undefined;
    return member?.declarations?.find((d) => (ts.isMethodDeclaration(d) || ts.isGetAccessorDeclaration(d)) && !!d.body) ?? null;
  }
  /** Library mode: generated classes whose names the hand-ported kit also declares. */
  readonly kitClashes: string[] = [];

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[], options: { pluginFiles?: Iterable<string>; reach?: Reach; properties?: Properties; library?: Translator['library']; lenient?: boolean } = {}) {
    this.library = options.library ?? null;
    this.lenient = options.lenient ?? false;
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
    this.throwsInfo = new Throws(checker, files, (n) => { try { return this.typeOf(n) === 'Any?'; } catch { return false; } }, (c) => this.native.throwingCall(c) || this.replaceableCall(c) || (!!this.library && ts.isElementAccessExpression(c.expression) && !!this.setNativeOf(c.expression.argumentExpression)), (d) => this.compiledMember(d), (e) => { try { return this.declaredOnly(e); } catch { return false; } });
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

  /** Translates a function's body: no async region or loop of the enclosing function reaches into it. */
  private inFunction<T>(returnType: string, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.breakTargets, this.pendingReturn] as const;
    this.pendingReturn = null;
    this.asyncCtx = null;
    this.plainBreak = 0;
    this.plainContinue = 0;
    this.returnType = returnType;
    this.breakTargets = [];
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.breakTargets, this.pendingReturn] = saved; }
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
    // A namespace as a value (`{ Accuracy: CoreTypes.Accuracy }`): its enum's metatype.
    const nsDecl = t.flags & F.Object && t.getSymbol()?.flags! & ts.SymbolFlags.ValueModule ? t.getSymbol()!.valueDeclaration : undefined;
    if (nsDecl && ts.isModuleDeclaration(nsDecl) && !nsDecl.getSourceFile().isDeclarationFile) return `${this.namespacePath(nsDecl)}.Type`;
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
      // A library's generic signature (`ClassDecorator`'s `TFunction`) in library mode: erased as the program's own are.
      if (decl && this.library && decl.getSourceFile().isDeclarationFile) return 'Any?';
      if (decl && ts.isTypeParameterDeclaration(decl) && erasedTypeParameter(decl)) return 'Any?';
      return t.symbol?.name ?? 'Any?';
    }
    // `UIView & { nsView?: … }`, `ScrollView & { … }`: the class; the members the literal adds are read by name.
    if (t.isIntersection()) {
      const cls = t.types.find((u) => this.native.type(u) || (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class);
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
    // An Angular component class as a value (`typeof SheetComponent`) is what creating and rendering it gives.
    const classDecl = sym?.valueDeclaration;
    if (classDecl && ts.isClassDeclaration(classDecl) && t.getConstructSignatures().length && (ts.getDecorators(classDecl) ?? []).some((d) => /^Component\(/.test(d.expression.getText()))) return 'ComponentFactory';
    // An Android type in an iOS build names a value only Android code holds: here it is always undefined.
    if (sym?.declarations?.[0] && /[\\/]@nativescript[\\/]types-android[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'Any?';
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
      // A weak reference holds an object: an untyped target is any object.
      case 'WeakRef': { const target = arg(0); return `JSWeakRef<${target === 'Any?' ? 'AnyObject' : target.replace(/[?!]$/, '')}>`; }
      case 'TemplateStringsArray': return 'JSArray<String>';
      case 'ArrayBuffer': case 'Uint8Array': if (isLibDeclaration(sym?.declarations?.[0])) return `JS${name}`; break;
      // The views the runtime has are bytes.
      case 'ArrayBufferView': if (isLibDeclaration(sym?.declarations?.[0])) return 'JSUint8Array'; break;
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
      // Any function, called with whatever arguments it is given.
      case 'Function': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
    }
    if (name && ERRORS[name] && sym?.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return ERRORS[name];
    if (name === 'NonNullable' && t.aliasSymbol && args().length === 1) {
      const inner = this.type(args()[0], where);
      return inner === 'Any?' ? inner : inner.replace(/\?$/, '');
    }
    if (name === 'Object' && sym?.declarations?.every((d) => /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName))) return 'Any?';
    // `typeof UIGestureRecognizer`: the native class as a value.
    if (sym && sym.flags & ts.SymbolFlags.Class && t.getConstructSignatures().length && !t.getCallSignatures().length && sym.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) {
      const instance = this.native.type(c.getDeclaredTypeOfSymbol(sym));
      if (instance) return `${instance}.Type`;
    }
    const native = this.native.type(t);
    if (native) return native;
    // An Android class (`android.view.View`) is only ever held, never made, on iOS.
    if (sym?.declarations?.[0] && /[\\/]@nativescript[\\/]types-android[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'Any?';
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
    // Library mode: a constructor held as a value (`PropertyBag: { new (): Bag }`) is constructed untyped.
    if (this.library && t.getConstructSignatures().length && !t.getCallSignatures().length && !((sym?.flags ?? 0) & ts.SymbolFlags.Class)) return 'Any?';
    const calls = t.getCallSignatures();
    if (calls.length && !t.getProperties().length) {
      const s = calls[0];
      const params = s.getParameters().filter((p) => p.name !== 'this').map((p) => {
        const pt = this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && (p.valueDeclaration.questionToken || p.valueDeclaration.initializer || nullableTypeNode(p.valueDeclaration.type))) return optionalType(pt);
        // Lenient code may pass null for an object: the parameter is optional, as a closure's implicitly unwrapped one is.
        if (this.lenientRef(pt) !== pt && !(p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken)) return optionalType(pt);
        return isFunctionType(pt) ? `@escaping ${pt}` : pt;
      });
      return `(${params.join(', ')}) throws -> ${this.type(s.getReturnType(), where)}`;
    }
    // An interface extending one class is that class; one merged into a class of its name is the class.
    const extended = sym && sym.flags & ts.SymbolFlags.Interface && !(sym.flags & ts.SymbolFlags.Class) ? this.extendedClass(t) : null;
    if (extended) return this.type(extended, where);
    if (sym && this.isDynamicShape(sym)) return 'Any?';
    if (this.isEventData(t)) return 'EventData';
    // A generic type the kit declares (`ListItem<Recipe>`) keeps its arguments.
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    // RxJS's classes are the kit's Rx classes: core has an Observable of its own.
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/rxjs.d.ts') return `Rx${name}${(t as ts.TypeReference).typeArguments?.length ? `<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>` : ''}`;
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    const compiled = this.compiledCounterpart(sym);
    if (compiled) return this.type(this.checker.getDeclaredTypeOfSymbol(compiled), where);
    if (name && Object.hasOwn(KIT_NAMES, name) && isCoreDeclaration(sym?.declarations?.[0])) return KIT_NAMES[name];
    // `typeof Cls`: the class itself.
    if (sym && sym.flags & ts.SymbolFlags.Class && t.getConstructSignatures().length && classDecl && !classDecl.getSourceFile().isDeclarationFile) return `${this.type(c.getDeclaredTypeOfSymbol(sym), where)}.Type`;
    const renamed = sym && this.topNames().get(sym.valueDeclaration ?? sym.declarations?.[0]!);
    if (renamed) return renamed;
    // A mixin's class is the core class it is applied to.
    const mixin = this.mixinOf(sym);
    if (mixin) return mixin;
    if (name && name !== '__type' && name !== '__object' && this.inNativeClassBody && this.appModule && sym?.flags! & ts.SymbolFlags.Class && sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) {
      return `${this.appModule}.${this.topNames().get(sym!.valueDeclaration ?? sym!.declarations![0]) ?? name}`;
    }
    if (name && name !== '__type' && name !== '__object') {
      // Library mode: an interface only a declaration file has (the DOM's `MediaQueryListEvent`, core's `AddChildFromBuilder`) has no Swift type.
      if (this.library && sym && sym.flags & ts.SymbolFlags.Interface && !(sym.flags & ts.SymbolFlags.Class) && sym.declarations?.every((d) => d.getSourceFile().isDeclarationFile && ((isLibDeclaration(d) && (/lib\.dom/.test(d.getSourceFile().fileName) || DESCRIPTORS.has(name))) || isCoreDeclaration(d)))) return 'Any?';
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
    if (this.declaredOnly(e)) return true;
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    const target = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    if (!decl || !(ts.isPropertySignature(decl) && ts.isTypeLiteralNode(decl.parent))) return false;
    return [target, ...(target.isIntersection() ? target.types : [])].some((t) => !!this.native.type(t));
  }

  /** `type ItemView = View & ViewItemIndex`: what the program's interface adds to a class's objects, kept as script adds it. */
  private isAddedMember(e: ts.PropertyAccessExpression): boolean {
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    const target = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    if (!decl || !ts.isPropertySignature(decl) || !ts.isInterfaceDeclaration(decl.parent) || decl.getSourceFile().isDeclarationFile || !target.isIntersection()) return false;
    return target.types.some((t) => !!(t.getSymbol()?.flags! & ts.SymbolFlags.Class) && !t.getProperty(e.name.text));
  }

  private compiledClasses: Map<string, ts.ClassDeclaration[]> | null = null;
  /**
   * Library mode: a member a core declaration file declares on a class whose
   * compiled implementation does not (`Transition.sharedElements`): what script
   * keeps on the instance, read by name.
   */
  private declaredOnly(e: ts.PropertyAccessExpression): boolean {
    if (!this.library) return false;
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    let name: string | undefined;
    if (!decl) name = this.typeOf(e.expression).replace(/[?!]$/, '').replace(/^\w+\./, '');
    else {
      const cls = decl.parent;
      if (!ts.isClassDeclaration(cls) || !cls.name || !decl.getSourceFile().isDeclarationFile || isLibDeclaration(decl) || /[\\/]objc![^\\/]+\.d\.ts$/.test(decl.getSourceFile().fileName)) return false;
      name = cls.name.text;
    }
    if (!this.compiledClasses) {
      this.compiledClasses = new Map();
      for (const f of this.sourceFiles) for (const st of f.statements) if (ts.isClassDeclaration(st) && st.name) this.compiledClasses.set(st.name.text, [...(this.compiledClasses.get(st.name.text) ?? []), st]);
    }
    const impls = this.compiledClasses.get(name);
    if (!impls?.length) return false;
    return impls.every((c) => !this.checker.getTypeAtLocation(c).getProperty(e.name.text));
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
    if (this.isArguments(n)) return 'JSArray<Any?>';
    if (this.isPrototypeRef(n) || this.isPrototypeMember(n) || (ts.isMetaProperty(n) && n.keywordToken === ts.SyntaxKind.ImportKeyword) || this.declaredNullable(n)) return 'Any?';
    if (this.untypedThis.has(n) || (ts.isIdentifier(n) && n.text === 'globalThis' && this.isGlobalThis(n))) return 'Any?';
    if (this.library && (this.holdsMethods(n) || ((ts.isIdentifier(n) || ts.isVariableDeclaration(n) || ts.isCallExpression(n) || ts.isFunctionExpression(n)) && this.carriesMethod(n)))) return 'Any?';
    if (this.library && (ts.isIdentifier(n) || ts.isVariableDeclaration(n))) {
      const own = ts.isVariableDeclaration(n) ? n : ts.isVariableDeclaration(n.parent) && n.parent.name === n ? n.parent : this.resolve(n)?.valueDeclaration;
      const init = own && ts.isVariableDeclaration(own) && !own.type ? own.initializer : undefined;
      if (init && (ts.isArrowFunction(init) || (ts.isFunctionExpression(init) && !isMethodValue(init))) && this.returnsMethod(init)) return returningAny(this.type(this.checker.getTypeAtLocation(init), init));
    }
    // A choice between function literals is the function type they are written for: each literal takes its slot's signature.
    if (ts.isConditionalExpression(n) && [n.whenTrue, n.whenFalse].every(isFunctionLiteral)) {
      const context = this.checker.getContextualType(n);
      if (context?.getCallSignatures().length) return this.type(context, n);
    }
    return this.type(this.checker.getTypeAtLocation(n), n);
  }

  private methodValued = new Map<ts.Node, boolean>();
  /**
   * Library mode: a field that holds functions reading the `this` they are called
   * with (`this.set = function (this: T, value) { … }`, as core's Property does) holds
   * method values, untyped: script calls them with a receiver (`prop.set.call(view, v)`).
   */
  private holdsMethods(n: ts.Node): boolean {
    const target = ts.isPropertyAccessExpression(n) ? n.name : ts.isPropertyDeclaration(n) ? n.name : n;
    const decl = ts.isPropertyDeclaration(n) ? n : this.checker.getSymbolAtLocation(target)?.valueDeclaration;
    if (!decl || !ts.isPropertyDeclaration(decl) || !ts.isClassLike(decl.parent)) return false;
    let found = this.methodValued.get(decl);
    if (found !== undefined) return found;
    found = false;
    this.methodValued.set(decl, false);
    const name = decl.name.getText();
    const visit = (x: ts.Node) => {
      if (found) return;
      if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(x.left) && x.left.expression.kind === ts.SyntaxKind.ThisKeyword
          && x.left.name.text === name && this.carriesMethod(x.right)) found = true;
      ts.forEachChild(x, visit);
    };
    visit(decl.parent);
    this.methodValued.set(decl, found);
    return found;
  }

  private methodCarried = new Map<ts.Node, boolean>();
  /**
   * Library mode: an expression whose value is a method value — a function
   * expression reading `this`, a field holding them, a variable or a call of a
   * local function that gives one.
   */
  private carriesMethod(n: ts.Node): boolean {
    if (!this.library) return false;
    while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) n = n.expression;
    if (ts.isFunctionExpression(n)) return isMethodValue(n);
    if (ts.isPropertyAccessExpression(n) || ts.isPropertyDeclaration(n)) return this.holdsMethods(n);
    const known = this.methodCarried.get(n);
    if (known !== undefined) return known;
    this.methodCarried.set(n, false);
    let found = false;
    if (ts.isIdentifier(n) && this.thisFunction(n)) found = true;
    else if (ts.isIdentifier(n) || ts.isVariableDeclaration(n)) {
      const decl = ts.isVariableDeclaration(n) ? n : this.resolve(n)?.valueDeclaration;
      found = !!decl && ts.isVariableDeclaration(decl) && !decl.type && !!decl.initializer && this.carriesMethod(decl.initializer);
    } else if (ts.isCallExpression(n)) {
      const fn = this.localFunction(n.expression);
      found = !!fn && this.returnsMethod(fn);
    }
    this.methodCarried.set(n, found);
    return found;
  }

  /** A function of the program's own, by the name or variable it is called through. */
  private localFunction(e: ts.Expression): ts.FunctionLikeDeclaration | null {
    const decl = ts.isIdentifier(e) ? this.resolve(e)?.valueDeclaration : undefined;
    if (decl && ts.isFunctionDeclaration(decl)) return decl;
    const init = decl && ts.isVariableDeclaration(decl) ? decl.initializer : undefined;
    return init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? init : null;
  }

  /** Whether static accessors only read and write the static field a base class declares under their name. */
  private forwardsToBaseStatic(cls: ts.ClassLikeDeclaration, name: string, a: { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }): boolean {
    const field = (() => { for (let b = this.sourceBase(cls); b; b = this.sourceBase(b)) { const f = b.members.find((m) => ts.isPropertyDeclaration(m) && isStatic(m) && m.name.getText() === name); if (f) return b; } return null; })();
    if (!field || !field.name) return false;
    const target = (e: ts.Expression) => ts.isPropertyAccessExpression(e) && e.name.text === name && ts.isIdentifier(e.expression) && this.resolve(e.expression)?.valueDeclaration === field;
    const get = a.get?.body?.statements;
    const getOk = !!get && get.length === 1 && ts.isReturnStatement(get[0]) && !!get[0].expression && target(get[0].expression);
    const set = a.set?.body?.statements;
    const p = a.set?.parameters[0]?.name;
    const setOk = !a.set || (!!set && set.length === 1 && ts.isExpressionStatement(set[0]) && ts.isBinaryExpression(set[0].expression) && set[0].expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && target(set[0].expression.left) && !!p && ts.isIdentifier(p) && ts.isIdentifier(set[0].expression.right) && set[0].expression.right.text === p.text);
    return getOk && setOk;
  }

  /** Library mode: a function declaration with a `this` parameter, named as a value rather than called. */
  private thisFunction(e: ts.Identifier): ts.FunctionDeclaration | null {
    if (!this.library || (ts.isCallExpression(e.parent) && e.parent.expression === e)) return null;
    const decl = this.resolve(e)?.valueDeclaration;
    const first = decl && ts.isFunctionDeclaration(decl) && decl.body ? decl.parameters[0] : undefined;
    return first && ts.isIdentifier(first.name) && first.name.text === 'this' && first.type?.kind !== ts.SyntaxKind.VoidKeyword ? decl as ts.FunctionDeclaration : null;
  }

  /** Whether a function returns method values. */
  private returnsMethod(fn: ts.FunctionLikeDeclaration): boolean {
    if (!this.library || !fn.body) return false;
    if (!ts.isBlock(fn.body)) return this.carriesMethod(fn.body);
    let found = false;
    const visit = (x: ts.Node) => {
      if (found || (x !== fn && ts.isFunctionLike(x))) return;
      if (ts.isReturnStatement(x) && x.expression && this.carriesMethod(x.expression)) found = true;
      ts.forEachChild(x, visit);
    };
    ts.forEachChild(fn.body, visit);
    return found;
  }

  /** A function expression reading the `this` it is called with, as a method value (`JSMethod`) taking it. */
  private methodValue(fn: ts.FunctionExpression): string {
    const params = fn.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this'));
    const ret = this.returnTypeOf(fn);
    // A function reading `arguments` binds its parameters from them itself.
    const binds = this.readsArguments(fn) ? ['let __arguments = JSArray<Any?>(__a)']
      : params.map((p, k) => `let ${ident((p.name as ts.Identifier).text)}: ${this.paramType(p)} = ${this.fromAnyCode(`jsArg(__a, ${k})`, this.paramType(p), true)}`);
    const body = this.withThis(fn, '__this', true, () => this.functionBody(fn, ret, this.indent + '    '));
    const call = `try { () throws -> ${ret} in${body.slice(1)}()`;
    const result = ret === 'Void' ? `${call}; return nil` : `return ${this.convert(call, ret, 'Any?')}`;
    return `({ (__this: Any?, __a: [Any?]) throws -> Any? in ${binds.join('; ')}${binds.length ? '; ' : ''}${result} } as JSMethod)`;
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
  declaredTypeOf(e: ts.Expression): string | null {
    if (this.library && this.holdsMethods(e)) return 'Any?';
    const sym = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    // A member of a mapped type (`Partial<T>`): optional where `T` declares it required.
    if (sym && !sym.valueDeclaration && sym.flags & ts.SymbolFlags.Optional && sym.declarations?.length) {
      return optionalType(this.type(this.checker.getNonNullableType(this.checker.getTypeOfSymbol(sym)), sym.declarations[0]));
    }
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    const root = ts.isPropertyDeclaration(decl) ? this.redeclaredField(decl) : null;
    if (root) return this.redeclaredType(root);
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
    if (t.getProperties().some((p) => !p.name.startsWith('__@') && !/^[A-Za-z$][\w$]*$|^_[\w$]+$/.test(p.name))) return 'JSObject';
    // Library mode: `{}` is an object script adds keys to (`symbolPropertyMap[key] = property`).
    if (this.library && !t.getProperties().length && !t.getCallSignatures().length) return 'JSObject';
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
  isAny(n: ts.Node) { return this.typeOf(n) === 'Any?'; }
  private isArray(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '').startsWith('JSArray<'); }
  private isObjectRef(n: ts.Node) {
    const t = this.typeOf(n).replace(/[?!]$/, '');
    return !['Double', 'String', 'Bool', 'Any?', 'Any', 'Void', 'JSBigInt', 'JSSymbol'].includes(t) && !t.startsWith('(') && !t.startsWith('[') && !this.native.isEnumType(t) && !this.native.isStructType(t);
  }
  /**
   * Lenient code: a declaration of an object type holds undefined as well, read
   * as JavaScript reads it (`x?.y`, `if (x)`), so Swift declares it implicitly unwrapped.
   */
  lenientRef(t: string): string {
    if (!this.lenient || t.endsWith('?') || t.endsWith('!') || isFunctionType(t)) return t;
    if (t.startsWith('any ')) return `(${t})!`;
    if (['Double', 'String', 'Bool', 'Any', 'Void', 'Never', 'JSBigInt', 'JSSymbol'].includes(t) || t.startsWith('(') || t.startsWith('[') || this.native.isEnumType(t) || this.native.isStructType(t) || this.genericNames.has(t)) return t;
    return `${t}!`;
  }
  zero(t: string): string | null {
    if (isOptional(t)) return 'nil';
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
  /** A field's type and initial value before its initializer runs: lenient code's object fields hold undefined too. */
  private fieldType(t: string): string {
    const declared = this.lenientRef(t);
    if (declared === t) return this.deferred(t);
    const z = this.zero(t);
    return z ? `${declared} = ${z}` : declared;
  }
  private deferred(t: string): string {
    const z = this.zero(t);
    return z ? `${t} = ${z}` : isFunctionType(t) ? `(${t})!` : `${t}!`;
  }

  // ---- Modules -------------------------------------------------------------------------------

  /** A module's declarations, and the statements that run when it is first imported. */
  module(sf: ts.SourceFile): { code: string; init: string[] } {
    this.props = new Set();
    this.hoisted = [];
    const out: string[] = [];
    const init: string[] = [];
    // Library mode: the module's functions and variables are an enum's static members.
    const library = this.library?.moduleName(sf.fileName) ?? null;
    const members: string[] = [];
    const member = (code: string) => (library ? members : out).push(code);
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
      // An interface merged into a class of its name only types it: the class is the declaration.
      if (ts.isInterfaceDeclaration(st) && this.checker.getSymbolAtLocation(st.name)?.flags! & ts.SymbolFlags.Class) continue;
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(this.topName(st, st.name.text), sf.fileName, st.members); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(this.topName(st, st.name.text), sf.fileName, st.type.members); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isEnumDeclaration(st)) { out.push(this.enumDecl(st)); continue; }
      if (ts.isModuleDeclaration(st)) { const ns = this.namespaceDecl(st, this.topName(st, st.name.text), later); if (ns) out.push(ns); continue; }
      // A function the kit implements in its place (core calling an npm package): references call the kit's.
      if (ts.isFunctionDeclaration(st) && st.name && this.library?.counterpart?.(sf.fileName, st.name.text)) continue;
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) member(this.func(st, ident(library ? st.name.text : this.topName(st, st.name.text)), library ? 'static ' : '')); continue; }
      if (ts.isClassDeclaration(st)) {
        const target = this.patterns.mixinTarget(st);
        if (target) { out.push(this.mixinDecl(st, target)); continue; }
        // Components are translated with their templates; other classes are services and models.
        // A component's class is written with its render function, in its own file.
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component')) || (!!st.name && this.components.has(st.name.text));
        if (!component && st.name) {
          this.staticInits = [];
          try { out.push(this.classDecl(st)); } finally {
            for (const line of this.staticInits) later(() => line);
            this.staticInits = null;
          }
          // Library mode: the class's accessors are its prototype's, and its decorators run once it is defined.
          if (library && (st.members.some((m) => ts.isAccessor(m) && !isStatic(m)) || ts.getDecorators(st)?.length)) later(() => this.classDefinition(st));
        }
        continue;
      }
      if (ts.isVariableStatement(st)) {
        if (library && st.declarationList.declarations.some((d) => !ts.isIdentifier(d.name))) throw this.error(st, 'a destructuring declaration at the top of a library module');
        this.variables(st, member, (d) => (library ? `${library}.${ident(d.name.getText())}` : ident(this.topName(d, d.name.getText()))), (d) => ident(library ? d.name.getText() : this.topName(d, d.name.getText())), library ? 'static ' : '', later);
        continue;
      }
      later(() => this.stmt(st));
    }
    if (library && members.length) out.push([`enum ${library} {`, ...members.map((m) => indented(m)), '}'].join('\n'));
    out.push(...this.hoisted.splice(0));
    return { code: out.join('\n\n') + '\n', init };
  }

  /**
   * A module's (or namespace's) variables: constants and pure initializers
   * as declared, the rest assigned by the module's initializer in order.
   */
  private variables(st: ts.VariableStatement, emit: (code: string) => void, ref: (d: ts.VariableDeclaration) => string, declName: (d: ts.VariableDeclaration) => string, modifiers: string, later: (code: () => string) => void) {
    const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name)) {
        for (const n of boundNames(d.name)) emit(`${modifiers}var ${ident(n.text)}: ${this.deferred(this.typeOf(n))}`);
        const tmp = this.fresh('__d');
        later(() => `    let ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', 'assign')}`);
        continue;
      }
      const name = declName(d);
      const target = ref(d);
      const t = this.typeOf(d.name);
      if (!d.initializer) { emit(`${modifiers}var ${name}: ${this.fieldType(t)}`); continue; }
      // A module's Angular `computed(fn)`: read through `x()`, its value is fn's whenever it is read.
      const fn = ts.isCallExpression(d.initializer) && this.calleeName(d.initializer) === 'computed' ? d.initializer.arguments[0] : undefined;
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
        const rt = this.computedType(d.initializer as ts.CallExpression);
        emit(this.throwsInfo.fn(fn) ? `${modifiers}var ${name}: ${rt} {\n    get throws ${this.functionBody(fn, rt, '    ')}\n}` : `${modifiers}var ${name}: ${rt} ${this.functionBody(fn, rt, '')}`);
        continue;
      }
      const maybe = !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
      if (maybe) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        emit(`${modifiers}var ${name}: ${optionalType(t)} = nil`);
        later(() => `    ${target} = ${maybe}`);
        continue;
      }
      // An object variable starting undefined or null holds one later.
      if (isNullish(d.initializer) && !t.endsWith('?') && t !== 'Any?' && this.zero(t) === null) { emit(`${modifiers}var ${name}: ${this.deferred(t)}`); continue; }
      if (this.pure(d.initializer) && this.constantInit(d.initializer)) { emit(`${modifiers}${constant ? 'let' : 'var'} ${name}: ${constant ? t : this.lenientRef(t)} = ${this.coerce(d.initializer, t)}`); continue; }
      emit(`${modifiers}var ${name}: ${this.fieldType(t)}`);
      later(() => `    ${target} = ${this.tryPrefix(d.initializer!)}${this.coerce(d.initializer!, t)}`);
    }
  }

  /**
   * `namespace N { … }` as `enum N`: its functions and variables are static
   * members, read as `N.member`; its statements run with the module's.
   * A namespace that declares only types has no value and no enum.
   */
  private namespaceDecl(md: ts.ModuleDeclaration, name: string, later: (code: () => string) => void): string {
    if (!md.body || !ts.isModuleBlock(md.body)) throw this.error(md, 'a dotted namespace');
    const path = this.namespacePath(md)!;
    const lines: string[] = [];
    let values = false;
    for (const st of md.body.statements) {
      if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
      // A namespace's interfaces are the module's: a class of the interface's name.
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, md.getSourceFile().fileName, st.members); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, md.getSourceFile().fileName, st.type.members); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      values = true;
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) lines.push(this.func(st, ident(st.name.text), 'static ')); continue; }
      if (ts.isModuleDeclaration(st)) { const inner = this.namespaceDecl(st, st.name.text, later); if (inner) lines.push(inner); continue; }
      if (ts.isEnumDeclaration(st)) { lines.push(this.enumDecl(st)); continue; }
      if (ts.isVariableStatement(st)) {
        this.variables(st, (code) => lines.push(code), (d) => `${path}.${ident(d.name.getText())}`, (d) => ident(d.name.getText()), 'static ', later);
        continue;
      }
      if (ts.isClassDeclaration(st)) { lines.push(this.classDecl(st)); continue; }
      later(() => this.stmt(st));
    }
    if (!values) return '';
    // A namespace merged into a class or enum of its name: the type's static members.
    const merged = (this.checker.getSymbolAtLocation(md.name)?.flags ?? 0) & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum);
    return [`${merged ? 'extension' : 'enum'} ${ident(name)} {`, ...lines.map((l) => indented(l)), '}'].join('\n');
  }

  /** The Swift path of a namespace declaration (`CoreTypes.AnimationCurve`). */
  private namespacePath(md: ts.ModuleDeclaration): string | null {
    if (!ts.isIdentifier(md.name)) return null;
    const outer = ts.isModuleBlock(md.parent) ? md.parent.parent : null;
    if (outer) return `${this.namespacePath(outer)}.${ident(md.name.text)}`;
    // Library mode: by the module's name, as a class's member of the same name (View's `layout()`) hides the namespace.
    const own = ident(this.topName(md, md.name.text));
    return this.library && this.appModule ? `${this.appModule}.${own}` : own;
  }

  /**
   * A reference to a namespace's member (`N.member`) or, in library mode, to
   * a module's function or variable (`<module enum>.name`); null for the rest.
   */
  private qualifiedDecl(decl: ts.Declaration, name: string): string | null {
    if (decl.getSourceFile().isDeclarationFile) return null;
    const statement = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
    if (ts.isModuleBlock(statement.parent) && ts.isModuleDeclaration(statement.parent.parent)) {
      const outer = this.namespacePath(statement.parent.parent);
      return outer ? `${outer}.${ident(name)}` : null;
    }
    const counterpart = ts.isFunctionDeclaration(statement) && ts.isSourceFile(statement.parent) ? this.library?.counterpart?.(decl.getSourceFile().fileName, name) : null;
    if (counterpart) return counterpart;
    const library = this.library?.moduleName(decl.getSourceFile().fileName);
    if (library && ts.isSourceFile(statement.parent) && (ts.isFunctionDeclaration(statement) || ts.isVariableStatement(statement))) return `${library}.${ident(name)}`;
    return null;
  }

  /** `{ name }`'s value: the variable or function it names, qualified as a reference to it is. */
  private shorthandValue(p: ts.ShorthandPropertyAssignment): string {
    const sym = this.checker.getShorthandAssignmentValueSymbol(p);
    const target = sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
    const decl = target?.valueDeclaration;
    return (decl && this.qualifiedDecl(decl, target!.name)) ?? ident(decl && this.topNames().has(decl) ? this.topNames().get(decl)! : p.name.text);
  }

  /** An identifier as a reference to what it names: qualified where its declaration is a namespace's or a library module's. */
  private refName(e: ts.Identifier): string {
    const local = this.checker.getSymbolAtLocation(e);
    const target = local && local.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration;
    return (decl && this.qualifiedDecl(decl, target!.name)) ?? this.unshadowed(e, decl, identPath(this.declaredName(e)));
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
    if (ts.isClassDeclaration(decl) || ts.isEnumDeclaration(decl)) return identPath(this.topName(decl, target!.name));
    if (ts.isModuleDeclaration(decl)) return this.namespacePath(decl);
    return this.qualifiedDecl(decl, target!.name) ?? this.unshadowed(e, decl, ident(this.topName(decl, target!.name)));
  }

  /**
   * Whether a module-level or static initializer gives the same value whenever Swift's lazy
   * global first runs it: pure, and reading nothing that can change (a variable, an object's
   * member) except constants (enum members, a namespace's or class's constant, the library's).
   */
  constantInit(e: ts.Expression, seen = new Set<ts.Node>()): boolean {
    const c = (x: ts.Expression) => this.constantInit(x, seen);
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return c(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isIdentifier(e)) return this.constantName(e, seen);
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((x) => c(x.expression));
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => (ts.isSpreadElement(x) ? ts.isArrayLiteralExpression(x.expression) && c(x.expression) : c(x)));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? c(p.initializer) : ts.isShorthandPropertyAssignment(p) ? this.constantName(p.name, seen) : ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return e.operator !== ts.SyntaxKind.PlusPlusToken && e.operator !== ts.SyntaxKind.MinusMinusToken && c(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && c(e.left) && c(e.right);
    if (ts.isPropertyAccessExpression(e)) {
      const sym = this.resolve(e.name);
      const d = sym?.valueDeclaration;
      if (sym && sym.flags & ts.SymbolFlags.EnumMember) return true;
      if (d && (ts.isMethodDeclaration(d) || ts.isFunctionDeclaration(d) || ts.isClassDeclaration(d) || ts.isEnumDeclaration(d) || ts.isModuleDeclaration(d))) return c(e.expression);
      // The library's constants (`Math.PI`, `Number.MAX_SAFE_INTEGER`).
      if (d && isLibDeclaration(d) && ts.isIdentifier(e.expression) && this.isLibGlobal(e.expression)) return true;
      if (d && ts.isPropertyDeclaration(d) && isStatic(d) && hasModifier(d, ts.SyntaxKind.ReadonlyKeyword) && !!d.initializer && !seen.has(d)) { seen.add(d); return c(d.initializer); }
      if (d && ts.isVariableDeclaration(d) && ts.isModuleBlock(d.parent.parent.parent) && d.parent.flags & ts.NodeFlags.Const && !!d.initializer && !seen.has(d)) { seen.add(d); return c(d.initializer); }
      return false;
    }
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every(c);
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every(c);
    return false;
  }

  /** A name whose value never changes: a function, class, enum or namespace, a library global, or a constant of a constant initializer. */
  private constantName(id: ts.Identifier, seen: Set<ts.Node>): boolean {
    if (id.text === 'undefined' || id.text === 'NaN' || id.text === 'Infinity') return true;
    const sym = this.resolve(id);
    if (!sym) return false;
    if (sym.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.ValueModule)) return true;
    const d = sym.valueDeclaration;
    if (!d) return false;
    if (d.getSourceFile().isDeclarationFile) return isLibDeclaration(d) || !(sym.flags & ts.SymbolFlags.Variable) || !!(d.parent && d.parent.flags & ts.NodeFlags.Const);
    if (ts.isVariableDeclaration(d) && d.parent.flags & ts.NodeFlags.Const && d.initializer && !seen.has(d)) { seen.add(d); return this.constantInit(d.initializer, seen); }
    return false;
  }

  /** Whether evaluating `e` early (Swift initializes globals lazily) cannot be observed. */
  pure(e: ts.Expression): boolean {
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return this.pure(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
    if (ts.isIdentifier(e) || ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((s) => this.pure(s.expression));
    // A spread reads what the array holds when it runs.
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => (ts.isSpreadElement(x) ? ts.isArrayLiteralExpression(x.expression) && this.pure(x.expression) : this.pure(x)));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? this.pure(p.initializer) : ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return e.operator !== ts.SyntaxKind.PlusPlusToken && e.operator !== ts.SyntaxKind.MinusMinusToken && this.pure(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && this.pure(e.left) && this.pure(e.right);
    // Reading a member of an untyped value can throw.
    if (ts.isPropertyAccessExpression(e)) return this.pure(e.expression) && !this.isAny(e.expression);
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every((a) => this.pure(a));
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every((a) => this.pure(a));
    return false;
  }

  private registerInterface(name: string, file: string, members: ts.NodeArray<ts.TypeElement>) {
    if (this.protocols.has(name)) { this.interfaces.set(name, { file, code: () => this.protocolCode(name, members) }); return; }
    this.interfaces.set(name, { file, code: () => this.objectClass(name, this.interfaceFields(members), null) });
  }

  /** An object type's fields: its properties, and its methods as fields holding functions. */
  private interfaceFields(members: ts.NodeArray<ts.TypeElement>): { name: string; type: string }[] {
    const out: { name: string; type: string }[] = [];
    for (const m of members) {
      if (!(ts.isPropertySignature(m) || ts.isMethodSignature(m)) || !(ts.isIdentifier(m.name) || ts.isStringLiteral(m.name))) continue;
      if (out.some((f) => f.name === (m.name as ts.Identifier).text)) continue;
      const t = this.typeOf(m);
      out.push({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t });
    }
    return out;
  }

  /** An interface classes implement: a protocol, and `<Name>Object` for the object literals of its type. */
  private implementedReadOnly(iface: string, field: string): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found) return;
      if (ts.isClassDeclaration(n) && n.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ImplementsKeyword && h.types.some((x) => x.expression.getText() === iface))) {
        const accessors = n.members.filter((x): x is ts.AccessorDeclaration => ts.isAccessor(x) && x.name.getText() === field);
        if (accessors.length && accessors.every(ts.isGetAccessorDeclaration)) found = true;
      }
      ts.forEachChild(n, visit);
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return found;
  }

  private protocolCode(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      // A field a class implementing the interface has only a getter for is read-only through it.
      const own = (m.name as ts.Identifier).text;
      return { name: own, type: m.questionToken ? optionalType(t) : t, readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) || this.implementedReadOnly(name, own) };
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
      .replace(/^final class (\w+): JSDynamic(, JSObjectConvertible)? \{/, `final class $1: ${name}$2 {`)
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
    const lines = [`final class ${name}: ${['JSDynamic', ...this.shapeProtocols(allFields).map((x) => x.conformance), ...(symbolic.length ? [] : ['JSObjectConvertible'])].join(', ')} {`];
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
  private dynamicMembers(fields: { name: string; type: string }[], className: string | null, override: boolean, methods: { name: string; type: string; available?: number }[] = [], symbols: { key: string; member: string; type: string }[] = [], expando = false, raw = new Set<string>()): string[] {
    const o = override ? 'override ' : '';
    const keys = fields.map((f) => (f.type.endsWith('?') ? `(self.${ident(f.name)} == nil ? [] : [${swiftString(f.name)}])` : `[${swiftString(f.name)}]`));
    const lines = [
      `    ${o}var jsKeys: [String] { ${[override ? 'super.jsKeys' : '', ...keys, expando ? '(jsExpando?.jsKeys ?? [])' : ''].filter(Boolean).join(' + ') || '[]'} }`,
      ...(symbols.length ? [`    var jsSymbolKeys: [String] { [${symbols.map((f) => f.key).join(', ')}] }`] : []),
      `    ${o}var jsClassName: String? { ${className ? swiftString(className) : 'nil'} }`,
      `    ${o}subscript(jsKey key: String) -> Any? {`,
      '        get {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: return ${raw.has(f.name) ? `jsExpandoGet(self, ${swiftString(f.name)})` : this.untypedEnum(`self.${ident(f.name)}`, f.type)}`),
      ...symbols.map((f) => `            case ${f.key}: return ${f.member}`),
      ...methods.filter((m) => !fields.some((f) => f.name === m.name)).map((m) => m.available
        ? `            case ${swiftString(m.name)}: if #available(iOS ${m.available}, *) { return ${this.boxFunction(`self.${ident(m.name)}`, m.type)} } else { return nil }`
        : `            case ${swiftString(m.name)}: return ${this.boxFunction(`self.${ident(m.name)}`, m.type)}`),
      `            default: return ${override ? 'super[jsKey: key]' : expando ? 'jsExpandoGet(self, key)' : 'nil'}`,
      '            }',
      '        }',
      '        set {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: ${raw.has(f.name) ? `jsExpandoSet(self, ${swiftString(f.name)}, newValue)` : `self.${ident(f.name)} = ${this.fromAny('newValue', f.type)}`}`),
      ...symbols.map((f) => `            case ${f.key}: ${f.member} = ${this.fromAny('newValue', f.type)}`),
      `            default: ${override ? 'super[jsKey: key] = newValue' : expando ? 'jsExpandoSet(self, key, newValue)' : 'break'}`,
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
  fromAny(code: string, type: string): string {
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
    if (type === 'JSDate') return `jsDateOf(${code})`;
    if (type === 'JSDate?') return `{ (__d: Any?) -> JSDate? in jsIsNullish(__d) ? nil : jsDateOf(__d) }(${code})`;
    const om = /^JSArray<(.*)>\?$/.exec(type);
    if (om) return `{ (__a: Any?) -> ${type} in jsIsNullish(__a) ? nil : jsArrayOf(__a) { ${this.fromAny('$0', om[1])} } }(${code})`;
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
    // A type parameter may stand for an interface: an object read untyped becomes one (`JSON.parse` of a cached `T[]`).
    if (this.genericNames.has(base)) return type.endsWith('?') ? `jsCast(${code}, to: ${base}.self)` : `jsCast(${code}, to: ${base}.self)!`;
    if (type.endsWith('?')) return `(${code} as? ${base})`;
    // Lenient code: an untyped value read as an object may be undefined.
    return this.lenientRef(type) !== type ? `jsImplicit(${code} as? ${type})` : `(${code} as! ${type})`;
  }

  /** A typed function value as an untyped JavaScript function, callable through `jsCall`. */
  boxFunction(code: string, type: string, restAt = -1): string {
    let fn = functionParts(isOptional(type) ? type.replace(/\?$/, '').replace(/^\((.*)\)$/, '$1') : type)!;
    // Lenient code: the function's own declaration may give undefined for an object.
    if (this.lenientRef(fn.result) !== fn.result) fn = functionParts(`(${fn.params.join(', ')}) throws -> ${optionalType(fn.result)}`)!;
    const args = fn.params.map((p, k) => k === restAt ? `${p}(__a.dropFirst(${k}).map { ${this.fromAnyCode('$0', p.replace(/^JSArray<(.*)>$/, '$1'), true)} })` : this.fromAnyCode(`jsArg(__a, ${k})`, p.replace(/^@escaping /, ''), true));
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
    // Library mode: an object literal of an event type (`{ eventName, object, value }`) is core's EventData over it, its other keys read by name.
    if (this.library && from === 'JSObject' && to.replace(/[?!]$/, '') === 'EventData') return `EventData(jsObject: ${code})`;
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
      const params = g.params.map((p, k) => { const q = p.replace(/^@escaping /, ''); return `__q${k}: ${isFunctionType(q) ? `@escaping ${q}` : q}`; });
      const args = f.params.map((p, k) => this.convert(`__q${k}`, g.params[k].replace(/^@escaping /, ''), p.replace(/^@escaping /, '')));
      const call = `try __h(${args.join(', ')})`;
      const body = g.result === 'Void' ? `_ = ${call}` : `return ${this.convert(call, f.result, g.result)}`;
      const wrap = `{ (__h: @escaping ${f.text}) -> ${g.text} in { (${params.join(', ')}) throws -> ${g.result} in ${body} } }`;
      return isOptional(from) ? `(${code}).map(${wrap})` : `${wrap}(${code})`;
    }
    if (to === optionalType(from)) return code;
    if (from === optionalType(to)) return `${code}!`;
    // Lenient code: one class where another is declared (a base class's value where a subclass is wanted): the value as it, undefined where it is not.
    const fb = from.replace(/[?!]$/, ''), tb = to.replace(/[?!]$/, '');
    if (fb !== tb && /^[A-Z]\w*$/.test(fb) && /^[A-Z]\w*$/.test(tb) && this.lenientRef(fb) !== fb && this.lenientRef(tb) !== tb && !['JSObject', 'EventData'].includes(fb)) return `jsImplicit(${code} as? ${tb})`;
    return code;
  }

  private enumDecl(e: ts.EnumDeclaration): string {
    const lines = [`enum ${ident(this.topName(e, e.name.text))} {`];
    for (const m of e.members) {
      const v = this.checker.getConstantValue(m);
      if (v === undefined) throw this.error(m, 'an enum member without a constant value');
      lines.push(`    static let ${ident(m.name.getText())}: ${typeof v === 'string' ? 'String' : 'Double'} = ${typeof v === 'string' ? swiftString(v) : String(v)}`);
    }
    // The object JavaScript makes of the enum, for its use as a value: a numeric member maps back to its name too.
    if (!hasModifier(e, ts.SyntaxKind.ConstKeyword)) {
      const entries = e.members.flatMap((m) => {
        const v = this.checker.getConstantValue(m)!;
        const key = swiftString(m.name.getText().replace(/^['"](.*)['"]$/, '$1'));
        return typeof v === 'string' ? [`(${key}, ${swiftString(v)} as Any?)`] : [`(${key}, Double(${v}) as Any?)`, `(${swiftString(String(v))}, ${key} as Any?)`];
      });
      lines.push(`    static let jsEnumObject = JSObject([${entries.join(', ')}])`);
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
    if (p.questionToken || (p.initializer && !this.templateParams)) return this.constantDefault(p) ? t : optionalType(t);
    return this.mayBeNull(p) ? optionalType(t) : t;
  }

  /**
   * An object parameter of a plugin, whose code is checked without
   * strictNullChecks: callers pass null and undefined for it (core's
   * `valueChanged(target, oldValue, newValue)` starts from undefined), so
   * Swift takes it as an implicitly unwrapped optional.
   */
  mayBeNull(p: ts.ParameterDeclaration): boolean {
    if (!this.pluginFiles.has(p.getSourceFile().fileName) || p.dotDotDotToken || !ts.isIdentifier(p.name)) return false;
    const t = this.typeOf(p.name);
    return !t.endsWith('?') && !t.endsWith('!') && !['Double', 'String', 'Bool', 'Void', 'Never'].includes(t) && !hasTopLevelArrow(t) && !t.startsWith('(')
      && !this.native.isEnumType(t) && !this.native.isStructType(t);
  }

  private params(fn: ts.SignatureDeclaration, closure: boolean): string {
    if (this.readsArguments(fn)) return `${closure ? '' : '_ '}__arguments: JSArray<Any?>`;
    // `this: void` only says the function reads no `this`: no parameter.
    return fn.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this' && p.type?.kind === ts.SyntaxKind.VoidKeyword)).map((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.dotDotDotToken) return `${closure ? '' : '_ '}${name}: ${this.typeOf(p.name)}`;
      let t = this.typeOf(p.name);
      // `accessory: UITabAccessory | null`, checked without strictNullChecks: null still passes; the body reads it unwrapped.
      if (this.mayBeNull(p) || (closure && nullableTypeNode(p.type) && !isOptional(t) && t !== 'Any?' && this.lenientRef(t) !== t)) t = `${t}!`;
      let given = '';
      if (p.questionToken || (p.initializer && !this.templateParams)) {
        if (!closure && this.constantDefault(p)) given = ` = ${this.coerce(p.initializer!, t)}`;
        else { t = optionalType(t); if (!closure) given = ' = nil'; }
      }
      if (isFunctionType(t)) t = '@escaping ' + t;
      return closure ? `${name}: ${t}` : `_ ${name}: ${t}${given}`;
    }).join(', ');
  }

  /** A parameter Swift gives its default value itself: a constant, unless the method it overrides takes the parameter as optional. */
  private constantDefault(p: ts.ParameterDeclaration): boolean {
    return !!p.initializer && this.isConstant(p.initializer) && !this.optionalDefaults.has(p);
  }
  private optionalDefaults = new Set<ts.ParameterDeclaration>();

  private isConstant(e: ts.Expression): boolean {
    return ts.isLiteralExpression(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(e.kind) || (ts.isPrefixUnaryExpression(e) && ts.isNumericLiteral(e.operand));
  }

  /** Statements a function body starts with: rest arrays, computed defaults, destructured parameters. */
  paramPrelude(fn: ts.SignatureDeclaration): string[] {
    const i = this.indent;
    const lines: string[] = [];
    if (this.readsArguments(fn)) {
      // The parameters read from the arguments the call passed, undefined where it passed none.
      fn.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this')).forEach((p, k) => {
        if (!ts.isIdentifier(p.name)) throw this.error(p, 'a destructured parameter of a function reading `arguments`');
        const name = ident(p.name.text);
        const assigned = !!fn.body && assignsTo(fn.body, this.checker.getSymbolAtLocation(p.name), this.checker);
        const arg = `jsArg(__arguments.storage, ${k})`;
        const pt = this.typeOf(p.name);
        let value: string;
        if (p.dotDotDotToken) value = `JSArray(__arguments.storage.dropFirst(${k}).map { ${this.fromAnyCode('$0', pt.replace(/^JSArray<(.*)>$/, '$1'), true)} })`;
        else if (p.initializer) value = `(jsFlat(${arg}) == nil ? ${this.coerce(p.initializer, pt)} : ${this.fromAnyCode(arg, pt, true)})`;
        else value = this.fromAnyCode(arg, p.questionToken ? optionalType(pt) : pt, true);
        lines.push(`${i}${assigned ? 'var' : 'let'} ${name}: ${p.questionToken && !p.initializer ? optionalType(pt) : pt} = ${value}`);
      });
      return lines;
    }
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
      } else if (p.initializer && !this.templateParams && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || !this.constantDefault(p))) {
        lines.push(`${i}${assigned ? 'var' : 'let'} ${name}: ${this.typeOf(p.name)} = ${this.tryPrefix(p.initializer)}${name} ?? ${this.coerce(p.initializer, this.typeOf(p.name))}`);
      } else if (assigned) lines.push(this.mayBeNull(p) ? `${i}var ${name}: ${pt}! = ${name}` : `${i}var ${name} = ${name}`);
      // A destructured parameter the body assigns binds variables.
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, name, '', !!fn.body && boundNames(p.name).some((b) => assignsTo(fn.body!, this.checker.getSymbolAtLocation(b), this.checker))));
    });
    return lines;
  }

  /** The Swift type a function returns: `JSPromise<T>` for an async one. */
  returnTypeOf(fn: ts.SignatureDeclaration): string {
    if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isFunctionDeclaration(fn)) && this.returnsMethod(fn)) return 'Any?';
    const t = this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
    return this.mayReturnUndefined(fn) && t !== 'Void' && t !== 'Any?' && !t.endsWith('?') && !t.endsWith('!') && !isFunctionType(t) ? optionalType(t) : t;
  }

  /** A member of a class extending a native one, whose signatures are the SDK's. */
  private inNativeClass(fn: ts.Node): boolean {
    const cls = fn.parent;
    if (!cls || !ts.isClassLike(cls)) return false;
    for (let t: ts.Type | undefined = this.checker.getTypeAtLocation(cls); t; ) {
      const base: ts.Type | undefined = this.checker.getBaseTypes(t as ts.InterfaceType)[0];
      if (!base) return false;
      if (base.getSymbol()?.declarations?.every((d) => d.getSourceFile().isDeclarationFile) && this.native.type(base)) return true;
      t = base;
    }
    return false;
  }

  private undefinedReturns = new Map<ts.Node, boolean>();
  /**
   * Code checked without strictNullChecks: whether a function or static method
   * returns undefined somewhere though its type says otherwise (a bare
   * `return`, `return null`, an optional parameter's value). Swift returns an
   * optional, and each caller reads it as JavaScript reads undefined there.
   */
  /** Lenient code: an optional parameter TypeScript types without undefined is optional in Swift; reads convert it. */
  lenientParams(fn: ts.SignatureDeclaration) {
    if (!this.lenient) return;
    for (const p of fn.parameters) {
      // A parameter property is the field it declares as well: its reads are the field's.
      if (!p.questionToken || p.initializer || !ts.isIdentifier(p.name) || (ts.canHaveModifiers(p) && ts.getModifiers(p)?.length)) continue;
      const t = this.typeOf(p.name);
      const sym = this.checker.getSymbolAtLocation(p.name);
      if (sym && !isOptional(t) && t !== 'Any?') this.undefinedVars.set(sym, optionalType(t));
    }
  }

  private mayReturnUndefined(fn: ts.SignatureDeclaration): boolean {
    if (!this.lenient || !(ts.isFunctionDeclaration(fn) || (ts.isMethodDeclaration(fn) && isStatic(fn))) || !fn.body || fn.getSourceFile().isDeclarationFile) return false;
    let found = this.undefinedReturns.get(fn);
    if (found !== undefined) return found;
    found = false;
    const optionalParams = new Set(fn.parameters.filter((p) => p.questionToken && !p.initializer).map((p) => this.checker.getSymbolAtLocation(p.name)));
    const visit = (n: ts.Node) => {
      if (found || (n !== fn && ts.isFunctionLike(n))) return;
      if (ts.isReturnStatement(n)) {
        const e = n.expression;
        const local = e && ts.isIdentifier(e) ? this.checker.getSymbolAtLocation(e)?.valueDeclaration : undefined;
        // A library call that may give undefined (`map.get(key)`), which the lenient checker reads as its value type.
        const sig = e && ts.isCallExpression(e) ? this.checker.getResolvedSignature(e)?.getDeclaration() : undefined;
        const declared = sig && !ts.isJSDocSignature(sig) ? sig.type : undefined;
        if (declared && isLibDeclaration(sig as ts.Declaration) && ts.isUnionTypeNode(declared) && declared.types.some((y) => y.kind === ts.SyntaxKind.UndefinedKeyword)) found = true;
        // An optional parameter, or a local declared without a value, may still be undefined.
        if (!e || isNullish(e) || (ts.isCallExpression(e) && this.typeOf(e) === 'Void') || (ts.isIdentifier(e) && optionalParams.has(this.checker.getSymbolAtLocation(e))) || (local && ts.isVariableDeclaration(local) && !local.initializer && ts.findAncestor(local, (n) => n === fn))) found = true;
      }
      ts.forEachChild(n, visit);
    };
    visit(fn.body);
    this.undefinedReturns.set(fn, found);
    return found;
  }

  /** A generic function compiled with its type parameters erased (`makeParser<T>`): its result as this call instantiates it. */
  private erasedResult(e: ts.CallExpression, code: string): string {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    // An overload's result is the implementation's in Swift: read as the overload types it (`getWindows(): NativeWindow[]` of a `WindowBase[]`).
    const impl = decl && !ts.isJSDocSignature(decl) && !decl.getSourceFile().isDeclarationFile && !('body' in decl && decl.body) ? implementationOf(decl) : null;
    if (impl && (ts.isMethodDeclaration(impl) || ts.isFunctionDeclaration(impl))) {
      const declared = this.returnTypeOf(impl), actual = this.typeOf(e);
      if (declared !== actual && actual !== 'Void' && this.classCast('', declared, actual) !== null) return this.classCast(code, declared, actual)!;
    }
    // A method of a generic class, which library mode erases: what it gives is untyped.
    if (this.library && decl && !ts.isJSDocSignature(decl) && ts.isMethodDeclaration(decl) && ts.isClassLike(decl.parent) && decl.parent.typeParameters?.length && !decl.getSourceFile().isDeclarationFile) {
      const declared = this.returnTypeOf(decl), actual = this.typeOf(e);
      return declared === actual || actual === 'Void' ? code : this.convert(code, declared, actual);
    }
    if (!decl || ts.isJSDocSignature(decl) || !decl.typeParameters?.length || decl.getSourceFile().isDeclarationFile) return code;
    if (!this.pluginFiles.has(decl.getSourceFile().fileName) && !decl.typeParameters.some(erasedTypeParameter)) return code;
    const declared = this.returnTypeOf(decl), actual = this.typeOf(e);
    return declared === actual || actual === 'Void' ? code : this.convert(code, declared, actual);
  }

  private untypedLinks = new Set<ts.Node>();

  /** Calls whose undefined result the context reads as an optional (see `maybeUndefined`). */
  private rawOptional = new Set<ts.Node>();

  /** A call of a function that may return undefined, read where its declared type is wanted: as JavaScript converts undefined there. */
  /** Checked without strictNullChecks, a library call's `T | undefined` (`map.get(k)`) reads as `T`; Swift still says it may be missing. */
  private libMayBeUndefined(e: ts.CallExpression): boolean {
    if (!this.lenient || isOptional(this.typeOf(e)) || this.typeOf(e) === 'Any?') return false;
    const sig = this.checker.getResolvedSignature(e)?.getDeclaration();
    const t = sig && !ts.isJSDocSignature(sig) ? sig.type : undefined;
    return !!t && isLibDeclaration(sig as ts.Declaration) && ts.isUnionTypeNode(t) && t.types.some((x) => x.kind === ts.SyntaxKind.UndefinedKeyword || (ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword));
  }

  private undefinedResult(e: ts.CallExpression, code: string): string {
    if (this.rawOptional.has(e)) return code;
    // A receiver (`f().x`): the member read unwraps it, as for any call that may give undefined.
    if ((ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression === e) return code;
    // A map's value read where a value of its type is wanted: a missing one as the type reads undefined.
    if (this.libMayBeUndefined(e) && ts.isPropertyAccessExpression(e.expression) && /^JS(Map|WeakMap)</.test(this.typeOf(e.expression.expression).replace(/[?!]$/, ''))) return this.undefinedAs(code, this.typeOf(e));
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl) || !this.mayReturnUndefined(decl) || !this.returnTypeOf(decl).endsWith('?')) return code;
    const t = this.typeOf(e);
    return t.endsWith('?') || t === 'Any?' ? code : this.undefinedAs(code, t);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    if (this.pluginFiles.has(fn.getSourceFile().fileName)) return '';
    const kept = (fn.typeParameters ?? []).filter((p) => !erasedTypeParameter(p));
    for (const p of kept) this.genericNames.add(p.name.text);
    return kept.length ? `<${kept.map((p) => p.name.text).join(', ')}>` : '';
  }

  /** A function's body block (`{ … }`), lowered when the function is async. */
  /** The newest iOS version an API used by the function being translated needs, innermost function last. */
  private availability: number[] = [];

  /** A type newer than the deployment target named inside a function body: the body runs only where the OS has it. Outside a body, nothing. */
  requireTypeAvailability(version: number) {
    if (this.availability.length) this.requireAvailability(version);
  }

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
    this.lenientParams(fn);
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
          // The checker proved every path returns (an exhaustive switch), or one that falls off the end returns undefined; Swift cannot see either.
          const last = fn.body.statements.at(-1);
          if (!['Void', 'Never'].includes(ret) && last && ts.isSwitchStatement(last)) lines.push(ret.endsWith('?') ? `${this.indent}return nil` : `${this.indent}fatalError("unreachable: every case returns")`);
          else if (ret === 'Any?' && this.returnTypeOf(fn) === 'Void' && !(last && (ts.isReturnStatement(last) || ts.isThrowStatement(last)))) lines.push(`${this.indent}return nil`);
        }
        else {
          const e = fn.body as ts.Expression;
          const none = this.typeOf(e) === 'Void' && ret !== 'Void' && ts.isCallExpression(e) ? (isOptional(ret) || ret === 'Any?' ? 'nil' : this.zero(ret)) : null;
          lines = [...this.paramPrelude(fn), ret === 'Void' || none ? this.indent + this.tryPrefix(e) + this.exprStatement(e) : `${this.indent}return ${this.tryPrefix(e)}${this.coerce(e, ret)}`];
          if (none) lines.push(`${this.indent}return ${none}`);
        }
        return `{\n${lines.filter(Boolean).join('\n')}\n${base}}`;
      } finally { this.indent = saved; }
    });
  }

  func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers = '', extraParams: string[] = []): string {
    const base = ts.isMethodDeclaration(fn) && /\boverride\b/.test(modifiers) ? this.baseMethod(fn) : null;
    if (base && ts.isMethodDeclaration(fn)) {
      const b = this.emittedSignature(base), own = this.signatureOf(fn);
      if (b.ret !== own.ret || b.params.length !== own.params.length || b.params.some((p, k) => p.type !== own.params[k].type)) return this.adaptedOverride(fn, name, modifiers, b);
    }
    // A signature naming a native type newer than the deployment target: the function exists only where the OS has it.
    this.availability.push(0);
    const ret = this.returnTypeOf(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? ' throws' : '';
    const widened = ts.isMethodDeclaration(fn) && !base ? this.hierarchyExtras(fn).map((p) => p.decl) : [];
    const params = [this.params(fn, false), ...extraParams, ...widened].filter(Boolean).join(', ');
    const declared = this.inNativeClass(fn) ? ret : this.lenientRef(ret);
    const needs = this.availability.pop()!;
    if (needs) { this.gatedFunctions.set(fn, needs); modifiers = `@available(iOS ${needs}, *) ${modifiers}`; }
    // A function declaring `this` reads it as its first parameter.
    const first = fn.parameters[0];
    const body = ts.isFunctionDeclaration(fn) && first && ts.isIdentifier(first.name) && first.name.text === 'this' && first.type?.kind !== ts.SyntaxKind.VoidKeyword
      ? this.withThis(fn, ident('this'), true, () => this.functionBody(fn, ret, this.indent))
      : this.functionBody(fn, ret, this.indent);
    return `${modifiers}func ${name}${this.generics(fn)}(${params})${throws}${ret === 'Void' ? '' : ` -> ${declared}`} ${body}`;
  }

  /** Functions whose signatures name native types newer than the deployment target: the iOS version they need. */
  private gatedFunctions = new Map<ts.Node, number>();

  /** The nearest method of the same name a source base class declares. */
  private baseMethod(m: ts.MethodDeclaration): ts.MethodDeclaration | null {
    const name = m.name.getText();
    for (let c = this.sourceBase(m.parent as ts.ClassLikeDeclaration); c; c = this.sourceBase(c)) {
      const named = c.members.filter((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && x.name.getText() === name && !isStatic(x));
      // An overloaded method's implementation is the one Swift has.
      const b = named.find((x) => !!x.body) ?? named.find((x) => hasModifier(x, ts.SyntaxKind.AbstractKeyword));
      if (b) return b;
    }
    return null;
  }

  /** The Swift signature a method is emitted with: its root's, which every override in Swift matches. */
  private emittedSignature(m: ts.MethodDeclaration): { params: { decl: string; type: string }[]; ret: string } {
    const base = this.baseMethod(m);
    if (base) return this.emittedSignature(base);
    const own = this.signatureOf(m);
    return { params: [...own.params, ...this.hierarchyExtras(m)], ret: own.ret };
  }

  private methodFamilies: Map<ts.MethodDeclaration, ts.MethodDeclaration[]> | null = null;
  /**
   * Library mode: the parameters overrides add past their root method's
   * (`layout(l, t, r, b, setFrame)` over `layout(l, t, r, b)`), which the root
   * takes too, optional, so every override has one Swift signature and a call
   * passing them reaches the override that reads them.
   */
  private hierarchyExtras(root: ts.MethodDeclaration): { decl: string; type: string }[] {
    if (!this.library || !ts.isClassLike(root.parent)) return [];
    if (!this.methodFamilies) {
      this.methodFamilies = new Map();
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          for (const m of n.members) {
            if (!ts.isMethodDeclaration(m) || isStatic(m) || (!m.body && !hasModifier(m, ts.SyntaxKind.AbstractKeyword))) continue;
            let top: ts.MethodDeclaration = m;
            for (let b = this.baseMethod(top); b; b = this.baseMethod(top)) top = b;
            if (top !== m) this.methodFamilies.set(top, [...(this.methodFamilies.get(top) ?? []), m]);
          }
        }
        ts.forEachChild(n, visit);
      };
      for (const f of this.sourceFiles) visit(f);
    }
    const n = root.parameters.length;
    if (root.parameters.some((p) => p.dotDotDotToken)) return [];
    const extras: { decl: string; type: string }[] = [];
    for (const m of this.methodFamilies.get(root) ?? []) {
      for (let k = n; k < m.parameters.length; k++) {
        const p = m.parameters[k];
        if (p.dotDotDotToken || !ts.isIdentifier(p.name)) break;
        if (extras[k - n]) continue;
        const t = optionalType(this.typeOf(p.name).replace(/!$/, ''));
        extras[k - n] = { decl: `_ __extra${k - n}: ${t} = nil`, type: t };
      }
    }
    const dense: { decl: string; type: string }[] = [];
    for (const e of extras) { if (!e) break; dense.push(e); }
    return dense;
  }

  /** A function value's Swift type: a function declaration's as it is emitted (see `functionValueType`). */
  private functionValueOf(e: ts.Expression): string {
    const decl = this.resolve(ts.isPropertyAccessExpression(e) ? e.name : e)?.valueDeclaration;
    return decl && ts.isFunctionDeclaration(decl) && decl.body ? this.functionValueType(decl) : this.typeOf(e);
  }

  /** A function declaration's Swift type as a value: lenient code's object results and parameters may be undefined. */
  private functionValueType(fn: ts.FunctionDeclaration): string {
    const params = fn.parameters.length ? splitTopLevel(this.params(fn, false)).map((decl) => withoutDefault(decl.slice(decl.indexOf(':') + 1)).trim().replace(/^@escaping /, '').replace(/!$/, '?')) : [];
    const ret = this.returnTypeOf(fn);
    return `(${params.join(', ')}) throws -> ${ret === 'Void' ? ret : this.lenientRef(ret).replace(/!$/, '?').replace(/^\((.*)\)\?$/, '($1)?')}`;
  }

  /** A method's Swift signature as declared: each parameter's type, and the result. */
  private signatureOf(m: ts.MethodDeclaration): { params: { decl: string; type: string }[]; ret: string } {
    const params = m.parameters.length ? splitTopLevel(this.params(m, false)).map((decl) => ({ decl: withoutDefault(decl).trim(), type: withoutDefault(decl.slice(decl.indexOf(':') + 1)).trim().replace(/^@escaping /, '') })) : [];
    const ret = !m.body && !m.type ? 'Void' : this.returnTypeOf(m);
    return { params, ret: ret === 'Void' || this.inNativeClass(m) ? ret : this.lenientRef(ret) };
  }

  /**
   * A method overriding one whose Swift signature differs (a narrower result, a
   * parameter typed otherwise): Swift's override takes the base's signature, and
   * the method's own parameters and result are converted to and from it.
   */
  private adaptedOverride(fn: ts.MethodDeclaration, name: string, modifiers: string, base: { params: { decl: string; type: string }[]; ret: string }): string {
    const plain = (t: string) => t.replace(/!$/, '?');
    const own = this.signatureOf(fn);
    const ret = this.returnTypeOf(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn);
    const pad = this.indent + '    ';
    const binds = fn.parameters.map((p, k) => {
      if (!ts.isIdentifier(p.name)) return '';
      const t = own.params[k].type;
      // A rest parameter over the base's: the arguments from here on, as one array.
      if (p.dotDotDotToken) {
        const el = t.replace(/^JSArray<(.*)>$/, '$1');
        const rest = base.params.slice(k).map((b, j) => this.convert(`__b${k + j}`, plain(b.type), el));
        return `${pad}let ${ident(p.name.text)}: ${t} = ${t}([${rest.join(', ')}])`;
      }
      const from = base.params[k] ? plain(base.params[k].type) : null, to = plain(t);
      // An argument the base takes as optional, for a parameter with a default: the default when it is missing.
      if (from && p.initializer && from.endsWith('?') && !to.endsWith('?')) return `${pad}let ${ident(p.name.text)}: ${t} = ${this.convert(`__b${k}`, from, optionalType(to))} ?? ${this.coerce(p.initializer, to)}`;
      const converted = from ? this.convert(`__b${k}`, from, to) : (this.zero(t) ?? 'nil');
      // A parameter narrowed to a subclass: the argument as that class, undefined where it is not one.
      const value = from && converted === `__b${k}` && from !== to && this.lenientRef(to.replace(/\?$/, '')) !== to.replace(/\?$/, '') ? `(__b${k} as? ${to.replace(/\?$/, '')})` : converted;
      return `${pad}let ${ident(p.name.text)}: ${t} = ${value}`;
    }).filter(Boolean);
    const params = base.params.map((p, k) => `_ __b${k}: ${p.decl.slice(p.decl.indexOf(':') + 1).trim()}`).join(', ');
    const body = this.functionBody(fn, ret, pad);
    const call = `${throws ? 'try ' : ''}{ () ${throws ? 'throws ' : ''}-> ${ret} in${body.slice(1)}()`;
    const result = base.ret === 'Void' ? `${pad}_ = ${call}` : `${pad}let __result: ${ret} = ${call}\n${pad}return ${this.convert('__result', plain(ret), plain(base.ret))}`;
    return `${modifiers}func ${name}(${params})${throws ? ' throws' : ''}${base.ret === 'Void' ? '' : ` -> ${base.ret}`} {\n${[...binds, result].join('\n')}\n${this.indent}}`;
  }

  /** `(r) => r.id` as a Swift closure with explicit types. */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression, pad: string[] = []): string {
    if (this.library && ts.isFunctionExpression(fn) && (isMethodValue(fn) || this.readsArguments(fn))) return this.methodValue(fn);
    // A callback whose slot returns void returns nothing, whatever its expression body evaluates to.
    const ret = this.closureReturn(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? 'throws ' : '';
    // A function expression's name is only for itself: one that never refers to itself is an anonymous function.
    if (fn.name && refersTo(fn.body, this.checker.getSymbolAtLocation(fn.name), this.checker)) throw this.error(fn, 'a named function expression');
    const extra = this.unusedParameters(fn).map((t, k) => `_ __unused${k}: ${t}`);
    return `{ (${[this.params(fn, true), ...extra, ...pad].filter(Boolean).join(', ')}) ${throws}-> ${ret} in${this.functionBody(fn, ret, this.indent).slice(1)}`;
  }

  /** The types of the arguments a callback's slot passes past those the closure declares, which Swift closures still take. */
  private unusedParameters(fn: ts.ArrowFunction | ts.FunctionExpression): string[] {
    const slot = this.slotOf(fn);
    const coreSlot = !!slot?.getDeclaration() && isCoreDeclaration(slot.getDeclaration() as ts.Declaration);
    // The app's own function types are Swift's as declared: every parameter, whatever the closure uses.
    const appSlot = !!slot?.getDeclaration() && !slot.getDeclaration().getSourceFile().isDeclarationFile;
    if (!((coreSlot && !fn.parameters.length) || appSlot)) return [];
    return slot!.getParameters().filter((p) => !(p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken)).slice(fn.parameters.length).map((p) => {
      const pt = this.type(this.checker.getTypeOfSymbolAtLocation(p, fn), fn);
      const optional = p.valueDeclaration && ts.isParameter(p.valueDeclaration) && (p.valueDeclaration.questionToken || p.valueDeclaration.initializer);
      return optional ? optionalType(pt) : pt;
    });
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
    // A callback returning nothing where its slot takes any value (a decorator's `TFunction | void`) returns undefined.
    if (own === 'Void' && slotType === 'Any?' && !voidSlot) return 'Any?';
    // A closure giving an untyped value where its slot says a type (lenient code): the slot's type, its value read as that.
    if (!voidSlot && slotType && own === 'Any?' && slotType !== 'Void' && this.lenient) return slotType;
    return voidSlot ? 'Void' : slotType && slotType !== own && /^Object_/.test(own) ? slotType : own;
  }

  /** A closure literal's Swift function type, as `closure` writes it. */
  private closureType(fn: ts.ArrowFunction | ts.FunctionExpression): string {
    const params = fn.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this' && p.type?.kind === ts.SyntaxKind.VoidKeyword));
    const own = params.map((p) => (p.questionToken || this.mayBeNull(p) || nullableTypeNode(p.type) ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name)));
    return `(${[...own, ...(this.library && ts.isFunctionExpression(fn) && (isMethodValue(fn) || this.readsArguments(fn)) ? [] : this.unusedParameters(fn))].join(', ')}) throws -> ${this.closureReturn(fn)}`;
  }

  /** A callback for an API that does not take throwing closures (a timer): what it throws is reported. */
  callback(e: ts.Expression): string {
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const code = this.closure(e);
      // An async callback's promise is dropped; its rejection is the promise's.
      if (isAsync(e)) return `{ _ = (${code})() }`;
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
    const isThisName = (e: ts.Expression) => ts.isPropertyAccessExpression(e) && e.expression.kind === ts.SyntaxKind.ThisKeyword && e.name.text === name;
    const visit = (n: ts.Node): void => {
      if (found) return;
      if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && isThisName(n.left)) found = true;
      else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) && isThisName(n.operand)) found = true;
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
          const t = this.computedType(m.initializer as ts.CallExpression);
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
        // Swift lets a closure capture self, or a method run, only once every stored property has a
        // value: from the first initializer that needs `this` so, fields start nil.
        late ||= capturesThis(m.initializer);
        if (late) lines.push(`    var ${ident(name)}: ${t.endsWith('?') ? t : isFunctionType(t) ? `(${t})!` : `${t}!`}`);
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

  /** What a component's method returning an array (a loop's items) holds, as Swift spells it. */
  memberElementType(cls: ts.ClassDeclaration, name: string): string | null {
    const m = cls.members.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && ts.isIdentifier(x.name) && x.name.text === name);
    if (!m) return null;
    const t = this.returnTypeOf(m);
    return t === 'Any?' ? t : /^JSArray<(.*)>\??$/.exec(t)?.[1] ?? null;
  }

  /** Whether a component's method or getter throws, so its caller in `render()` reports what it throws. */
  memberThrows(cls: ts.ClassDeclaration, name: string): boolean {
    const m = cls.members.find((x) => x.name && ts.isIdentifier(x.name) && x.name.text === name);
    return !!m && !isAsync(m) && this.throwsInfo.fn(m);
  }

  /** A `computed()`'s value type: its type argument where given (`computed<MenuAction[]>(…)`), else its function's. */
  private computedType(e: ts.CallExpression): string {
    const given = e.typeArguments?.[0];
    return given ? this.type(this.checker.getTypeFromTypeNode(given), given) : this.returnTypeOf(e.arguments[0] as ts.ArrowFunction);
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const nativeSubclass = this.native.classDecl(cls);
    if (nativeSubclass) return nativeSubclass;
    const name = ts.isModuleBlock(cls.parent) ? cls.name!.text : this.topName(cls, cls.name!.text);
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    if (service) {
      const members = this.componentMembers(cls, []);
      // Angular's injector reports a throwing constructor as a fatal error.
      const make = members.some((m) => /^\s*init\(\) throws/m.test(m)) ? `try! ${name}()` : `${name}()`;
      return [`final class ${name} {`, `    static let shared = ${make}`, '', ...members, '}'].join('\n');
    }
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
    // Library mode: a class at the root of its hierarchy keeps what script adds to its instances (JSExpando).
    const expando = !!this.library && !base;
    const isView = !!kitRoot && this.core.isKitView(kitRoot);
    const registered = (n: string) => isView && !!this.properties?.isRegistered(cls, n);
    // The library's interfaces (`Iterable<T>`, `Iterator<T>`) are protocols of the kit's, conformed to below.
    const witnesses: string[] = [];
    const implemented = implementedInterfaces(this.checker, cls).filter((i) => !isLibDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0]))
      // Library mode: an interface only a declaration file has is no Swift protocol.
      .filter((i) => !this.library || !(this.checker.getTypeAtLocation(i).getSymbol()?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile))
      // A protocol a base class conforms to is inherited; one the class's signatures cannot meet is left out.
      .filter((i) => !this.baseImplements(cls, i.expression.getText()) && this.protocolWitnesses(cls, i, witnesses))
      .map((i) => i.expression.getText());
    for (const i of implemented) this.used.add(i);
    const conformances = [...(base ? [base] : []), ...implemented];
    // A class's own toString is what JavaScript's string conversion calls.
    if (cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls)) conformances.push('JSStringConvertible');
    const header = () => `${this.extended.has(name) || this.extendedDecls.has(cls) || this.library ? '' : 'final '}class ${ident(name)}${this.generics(cls)}: ${[...(base || implemented.length ? [] : ['JSDynamic']), ...conformances].join(', ')} {`;
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
      // `[Symbol.toStringTag] = 'TextDecoder'`: what Object.prototype.toString reports.
      if (keyed?.member === 'jsToStringTag' && !isStatic(m) && m.initializer) {
        conformances.push('JSToStringTag');
        lines.push(`    var jsToStringTag: String = ${this.coerce(m.initializer, 'String')}`);
        continue;
      }
      if (keyed) throw this.error(m.name, 'a field named by this symbol');
      const n = this.staticName(m) ?? m.name.getText();
      const t = this.typeOf(m.name);
      if (isStatic(m)) {
        const nullInit = !!m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined'));
        if (nullInit && !isOptional(t) && this.zero(t) === null) { lines.push(`    static var ${ident(n)}: ${this.deferred(t)} = nil`); continue; }
        if (!m.initializer && !isOptional(t) && this.zero(t) === null) { lines.push(`    static var ${ident(n)}: ${this.deferred(t)}`); continue; }
        // A static initializer that throws or reads changing state runs with the module's statements, where the class is defined; Swift's run lazily and cannot throw.
        if (m.initializer && this.staticInits && !nullInit && (this.throwsInfo.expr(m.initializer) || !this.constantInit(m.initializer))) {
          lines.push(`    static var ${ident(n)}: ${this.deferred(t)}`);
          this.indent = '    ';
          this.staticInits.push(`    ${ident(name)}.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
          continue;
        }
        lines.push(`    static var ${ident(n)}: ${t}${m.initializer ? ` = ${this.coerce(m.initializer, t)}` : isOptional(t) ? '' : ` = ${this.zero(t) ?? 'nil'}`}`);
        continue;
      }
      // A view class narrowing its native view's type (`nativeViewProtected: CHIBasePageControl`) reads the kit's `nativeView`.
      if (isView && !m.initializer && (n === 'nativeViewProtected' || n === 'ios')) {
        const native = t.replace(/[?!]$/, '');
        lines.push(`    var ${ident(n)}: ${native}! { nativeView as? ${native} }`);
        continue;
      }
      const nativeProperty = this.nativePropertyOf(m);
      if (nativeProperty) { lines.push(nativeProperty); continue; }
      // A field its base declares already (`nativeViewProtected: UIView` over `any`): the base's, read as this field's type.
      const root = this.redeclaredField(m);
      if (root) {
        if (m.initializer) {
          this.indent = '        ';
          fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, this.redeclaredType(root))}`);
          this.indent = '    ';
        }
        continue;
      }
      // Library mode: a field under a name some class registers a property as (`col`, registered on View, declared on ViewBase) reads through the prototype chain.
      const registeredName = !!this.library && (!!this.properties?.isRegistered(cls, n) || !!this.properties?.isRegisteredAnywhere(n));
      const keys = this.library && !m.initializer && !registeredName ? this.prototypeKeys() : null;
      if (keys?.data.has(n) && !keys.accessors.has(n)) {
        // A field `Cls.prototype.name = v` writes: the instance's own value once it has one, else its prototype chain's.
        if (this.baseDeclares(appBase, n)) continue;
        const z = isFunctionType(t) ? null : this.zero(t);
        const stored = isOptional(t) || z ? t : optionalType(t);
        const vt = isOptional(t) || z ? t : isFunctionType(t) ? `(${t})!` : `${t}!`;
        const read = `JSPrototypes.value(type(of: self), ${swiftString(n)}, self)`;
        const own = `__own_${n.replace(/\W/g, '_')}`;
        lines.push(`    var ${own}: Optional<${stored}> = nil`, `    var ${ident(n)}: ${vt} {`, `        get { if let v = ${own} { return v }; return ${z ? this.fromAnyCode(read, t, true) : this.fromAny(read, stored)} }`, `        set { ${own} = .some(newValue) }`, '    }');
        fields.push({ name: n, type: t });
        continue;
      }
      if (keys?.accessors.has(n) && this.baseDeclares(appBase, n)) continue;
      if (this.library && (registeredName || keys?.accessors.has(n))) {
        // A field under a registered property's name is the accessor `register` defines on the prototype.
        const unset = !t.endsWith('?') && !t.endsWith('!') && this.zero(t) === null && !isFunctionType(t);
        const vt = unset ? optionalType(t) : t;
        lines.push(`    var ${ident(n)}: ${unset && this.lenient ? this.lenientRef(t) : vt} {`, `        get { ${this.fromAnyCode(`jsExpandoGet(self, ${swiftString(n)})`, vt, true)} }`, `        set { jsExpandoSet(self, ${swiftString(n)}, ${this.convert('newValue', vt, 'Any?')}) }`, '    }');
        if (m.initializer) {
          this.indent = '        ';
          fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
          this.indent = '    ';
        }
        continue;
      }
      if (registered(n)) {
        // A field under a registered property's name is the property: core's accessor on the prototype.
        // A property registered without a default is undefined until set: an object-typed one reads as nil.
        const unset = !t.endsWith('?') && !t.endsWith('!') && this.zero(t) === null && !isFunctionType(t);
        lines.push(`    var ${ident(n)}: ${unset ? this.deferred(t) : t} {`, `        get { ${this.fromAnyCode(`get(${swiftString(n)})`, unset ? optionalType(t) : t, true)} }`, `        set { set(${swiftString(n)}, ${this.convert('newValue', unset ? optionalType(t) : t, 'Any?')}) }`, '    }');
        if (m.initializer) {
          this.indent = '        ';
          fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
          this.indent = '    ';
        }
        continue;
      }
      fields.push({ name: n, type: t });
      // `field: string = null` in code checked without strictNullChecks: unset, read as the type's zero or an unwrapped nil.
      if (m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined')) && !isOptional(t)) { lines.push(`    var ${ident(n)}: ${this.fieldType(t)}`); continue; }
      if (m.initializer && this.pure(m.initializer) && !refersToThis(m.initializer)) { lines.push(`    var ${ident(n)}: ${this.lenientRef(t)} = ${this.coerce(m.initializer, t)}`); continue; }
      lines.push(`    var ${ident(n)}: ${this.fieldType(t)}`);
      if (m.initializer) {
        this.indent = '        ';
        fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
      }
    }
    // Members whose names a base class declares too.
    const inherited = new Set<string>();
    for (let b = appBase; b; ) {
      // What the base emits: not an overload's signature, a bodiless declaration or a static member.
      for (const m of b.members) if (m.name && !(ts.isMethodDeclaration(m) && !m.body && !hasModifier(m, ts.SyntaxKind.AbstractKeyword)) && !isStatic(m)) inherited.add(m.name.getText());
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && c.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    // The constructor: super() first, then parameter properties and field initializers, then the body (JavaScript's order).
    const baseCtor = appBase && this.constructorOf(appBase);
    if (ctor) {
      const throws = this.throwsInfo.fn(ctor) ? ' throws' : '';
      // Swift matches an initializer by its labels and types, not its parameters' names.
      const signature = (fn: ts.ConstructorDeclaration) => this.params(fn, false).replace(/_ [\w`]+: /g, '_: ').replace(/ = [^,]*(?=,|$)/g, '');
      const sameAsBase = baseCtor ? signature(baseCtor) === signature(ctor) : ctor.parameters.length === 0 && (!!appBase || !!kitRoot);
      const body = this.inFunction('Void', () => {
        this.indent = '        ';
        this.lenientParams(ctor);
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
    } else if (fieldInits.length || this.throwsInfo.initThrows(cls)) {
      const baseThrows = !!appBase && this.throwsInfo.initThrows(appBase);
      if (baseCtor) lines.push(`    override init(${this.params(baseCtor, false)})${baseThrows || this.throwsInfo.initThrows(cls) ? ' throws' : ''} {`, `        ${baseThrows ? 'try ' : ''}super.init(${this.readsArguments(baseCtor) ? '__arguments' : baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})`, ...fieldInits, '    }');
      else lines.push(`    ${appBase || kitRoot ? 'override ' : ''}init()${this.throwsInfo.initThrows(cls) ? ' throws' : ''} {`, ...(appBase || kitRoot ? [`        ${baseThrows ? 'try ' : ''}super.init()`] : []), ...fieldInits, '    }');
    }
    // A class object literals are typed as (`const info = <Info>{}`): an instance made without its constructor or field initializers, as such a literal has none.
    if (this.library && !base && this.literalClasses().has(cls)) {
      const resets = cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !isStatic(m) && !!m.initializer && this.pure(m.initializer) && !refersToThis(m.initializer) && fields.some((f) => f.name === m.name.getText()))
        .flatMap((m) => { const z = this.zero(this.typeOf(m.name)); return z ? [`        self.${ident(m.name.getText())} = ${z}`] : []; });
      lines.push('    init(jsLiteral: Void) {', ...resets, '    }');
      // A class Swift gave `init()` only while it declared no other.
      if (!ctor && !fieldInits.length) lines.push('    init() {}');
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
      // A static accessor pair that reads and writes a base class's static field of its name: the field, which Swift's subclass inherits.
      if (a.get && isStatic(a.get) && this.forwardsToBaseStatic(cls, n, a)) continue;
      // A property with only a setter reads as undefined in JavaScript.
      // An override that narrows its type (`get ios(): UIColor` over `get ios(): any`) keeps the type it overrides, as Swift requires.
      const t = (a.get && this.narrowedFrom(a.get)) ?? (a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name)));
      // Library mode: a class's static accessors are `class` ones, which a subclass's can override.
      const mods = `${a.get && isStatic(a.get) ? (this.library ? 'class ' : 'static ') : ''}${inherited.has(n) ? 'override ' : ''}`;
      const declared = a.get && this.inNativeClass(a.get) ? t : this.lenientRef(t);
      const parts: string[] = [];
      // Library mode: what an accessor of a pair throws is reported, as the JavaScript runtime reports what nothing catches; Swift's setters cannot throw.
      const reported = !!this.library && !!a.set && ((!!a.get && this.throwsInfo.fn(a.get)) || this.throwsInfo.fn(a.set));
      if (a.get && reported && this.throwsInfo.fn(a.get)) {
        const fallback = t.endsWith('?') ? 'nil' : this.zero(t) ?? null;
        parts.push(`        get { jsReported { () throws -> ${t} in${this.functionBody(a.get, t, '        ').slice(1)}${fallback ? ` ?? ${fallback}` : '!'} }`);
      } else if (a.get) parts.push(`        get${this.throwsInfo.fn(a.get) ? ' throws' : ''} ${this.functionBody(a.get, t, '        ')}`);
      else parts.push('        get { nil }');
      if (a.set) {
        if (this.throwsInfo.fn(a.set) && !reported) throw this.error(a.set, 'a setter that throws');
        const p = a.set.parameters[0].name as ts.Identifier;
        const body = this.functionBody(a.set, 'Void', '        ');
        // A setter taking more than its getter gives (`set style(value: Style | string)`): its parameter as declared, from the property's value.
        const own = this.typeOf(p);
        const value = a.get && own !== t && own.replace(/[?!]$/, '') !== t.replace(/[?!]$/, '') ? `let ${ident(p.text)}: ${own} = ${this.convert('newValue', declared.replace(/!$/, '?'), own)}`
          : declared !== t ? `let ${ident(p.text)}: ${declared} = newValue` : `let ${ident(p.text)} = newValue${a.get ? '' : '!'}`;
        parts.push(this.throwsInfo.fn(a.set)
          ? `        set {\n            ${value}\n            jsReport ${body.trimStart()}\n        }`
          : `        set {\n            ${value}${body.slice(1)}`);
      }
      lines.push(`    ${mods}var ${ident(n)}: ${declared} {`, ...parts, '    }');
    }
    // A view class's type selector: its `@CSSType` name, else its class name, as core's `cssType` falls back to `typeName`.
    if (isView) {
      const cssType = (ts.getDecorators(cls) ?? []).map((d) => d.expression).find((e): e is ts.CallExpression => ts.isCallExpression(e) && e.expression.getText() === 'CSSType');
      const typeName = cssType && ts.isStringLiteralLike(cssType.arguments[0]) ? cssType.arguments[0].text : name;
      lines.push(`    override class var cssType: String { ${swiftString(typeName)} }`);
    }
    for (const d of ts.getDecorators(cls) ?? []) {
      if (ts.isIdentifier(d.expression) && this.library?.identities?.has(d.expression.text)) continue;
      if (this.library && ts.isSourceFile(cls.parent)) continue;
      if (!/^(CSSType|NativeClass|ObjCClass)\b/.test(d.expression.getText())) throw this.error(d, `the class decorator ${d.expression.getText()}`);
    }
    const symbolMethods: { key: string; method: string; params: string[]; ret: string; throws: boolean }[] = [];
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
      if (this.library) {
        // `[prop.setNative](value)`: a method under a symbol known when the program runs, found by its key.
        const method = this.fresh('__symbol_');
        symbolMethods.push({ key: this.propertyKey(m.name.expression), method, params: m.parameters.map((p) => this.paramType(p)), ret: this.returnTypeOf(m), throws: this.throwsInfo.fn(m) });
        lines.push('    ' + this.func(m, method));
        continue;
      }
      const property = this.setNativeOf(m.name.expression);
      if (!property) throw this.error(m.name, 'a computed method name');
      const method = `__setNative_${property}`;
      setters.push({ property, method, param: m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Void', throws: this.throwsInfo.fn(m) });
      lines.push('    ' + this.func(m, method));
    }
    if (symbolMethods.length || expando) {
      lines.push(`    ${expando ? '' : 'override '}func jsSymbolMethod(_ key: String) -> JSMethod? {`);
      for (const sm of symbolMethods) {
        const args = sm.params.map((p, k) => this.fromAnyCode(`jsArg(__a, ${k})`, p, true));
        const call = `${sm.throws ? 'try ' : ''}(__this as! ${ident(name)}).${sm.method}(${args.join(', ')})`;
        lines.push(`        if key == ${sm.key} { return { __this, __a in ${sm.ret === 'Void' ? `${call}; return nil` : `return ${this.convert(call, sm.ret, 'Any?')}`} } }`);
      }
      lines.push(`        return ${expando ? 'nil' : 'super.jsSymbolMethod(key)'}`, '    }');
    }
    if (expando) {
      conformances.push('JSExpando');
      lines.push('    var jsExpando: JSObject?', '    var jsSymbolKeys: [String] { jsExpando?.jsSymbolKeys ?? [] }', '    func jsDeleteOwn(_ key: String) -> Bool { jsExpando?.delete(key) ?? true }');
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
    const dynMethods: { name: string; type: string; available?: number }[] = [];
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && m.body && ts.isComputedPropertyName(m.name)) continue;
      if (ts.isMethodDeclaration(m) && !m.body && hasModifier(m, ts.SyntaxKind.AbstractKeyword)) {
        // An abstract method: subclasses override it.
        // Without a declared type (implicitly any) it returns nothing, as overrides declared for effect do: Swift overrides match exactly.
        const ret = this.signatureOf(m).ret;
        lines.push(`    func ${ident(m.name.getText())}(${this.params(m, false)})${this.throwsInfo.fn(m) ? ' throws' : ''}${ret === 'Void' ? '' : ` -> ${ret}`} { fatalError("abstract method ${name}.${m.name.getText()}") }`);
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      const n = m.name.getText();
      // A class's toString is what JavaScript's string conversion calls, named or not.
      if (!this.library && this.pluginFiles.has(cls.getSourceFile().fileName) && !inherited.has(n) && !(kitRoot && this.core.kitMember(kitRoot, n)) && !this.isNamed(n) && n !== 'toString') continue;
      const kit = kitRoot && !isStatic(m) && !inherited.has(n) ? this.core.kitMember(kitRoot, n) : null;
      if (kit && kit.kind === 'func') { lines.push(this.kitOverride(m, kit)); continue; }
      // An override declaring fewer parameters than the method it overrides takes the rest unused, as Swift matches signatures.
      const overridden = inherited.has(n) && !isStatic(m) ? this.inheritedMethod(cls, n) : undefined;
      if (overridden) m.parameters.forEach((p, k) => { const b = overridden.parameters[k]; if (b && (b.questionToken || (b.initializer && !this.constantDefault(b))) && this.constantDefault(p)) this.optionalDefaults.add(p); });
      const extra = overridden ? overridden.parameters.slice(m.parameters.length).map((p, k) => `_ __unused${k}: ${p.questionToken || p.initializer ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name)}`) : [];
      lines.push('    ' + this.func(m, ident(n), `${isStatic(m) ? 'static ' : ''}${inherited.has(n) && !isStatic(m) ? 'override ' : ''}`, extra));
      // A plugin's objects are read untyped too (`handler.attachToView(view)` on an `any`): their methods by name.
      if (this.pluginFiles.has(cls.getSourceFile().fileName) && !isStatic(m) && !m.parameters.some((p) => p.dotDotDotToken) && !extra.length) {
        // The signature Swift has for the method: an override's is its root's.
        const sig = this.emittedSignature(m);
        const plain = (t: string) => t.replace(/^\((any .*)\)!$/, '$1?').replace(/!$/, '?');
        dynMethods.push({ name: n, type: `(${sig.params.map((p) => (isFunctionType(p.type) ? `@escaping ${p.type}` : plain(p.type))).join(', ')}) throws -> ${plain(sig.ret)}`, available: this.gatedFunctions.get(m) });
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
    lines.push(...witnesses);
    // Library mode: a registered property's value reaches its accessor as it is, which converts it (`col = "1"`).
    const raw = new Set(this.library ? fields.filter((f) => this.properties?.isRegistered(cls, f.name) || this.properties?.isRegisteredAnywhere(f.name)).map((f) => f.name) : []);
    if (!isError) lines.push(...this.dynamicMembers(fields, name, !!appBase || !!kitRoot, dynMethods, symbolFields, expando, raw));
    // Library mode: the class's `name`, which a static method reads of the class it is called on.
    if (this.library && !this.errorBased(cls)) lines.push(`    ${appBase ? 'override ' : ''}class var jsName: String { ${swiftString(cls.name!.text)} }`);
    if (symbolFields.length) conformances.push('JSSymbolKeyed');
    // Library mode: the static members script can test for by name (`'tapEvent' in view.constructor`).
    if (this.library && !this.inNativeClass(cls.members[0] ?? cls)) {
      const statics = cls.members.filter((m) => m.name && isStatic(m) && !ts.isComputedPropertyName(m.name)).map((m) => m.name!.getText().replace(/^['"]|['"]$/g, ''));
      const own = `[${[...new Set(statics)].map(swiftString).join(', ')}]`;
      if (!appBase) { conformances.push('JSStaticKeyed'); lines.push(`    open class var jsStaticKeys: [String] { ${own} }`); }
      else lines.push(`    open override class var jsStaticKeys: [String] { super.jsStaticKeys + ${own} }`);
    }
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

  /** What defining a class does beyond declaring it (library mode): its accessors on its prototype, then its decorators, the last first. */
  private classDefinition(cls: ts.ClassDeclaration): string {
    const i = this.indent;
    const name = this.className(cls);
    const lines: string[] = [];
    const accessors = new Map<string, { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }>();
    for (const m of cls.members) {
      if (!(ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) || isStatic(m) || ts.isComputedPropertyName(m.name)) continue;
      const a = accessors.get(m.name.getText()) ?? {};
      if (ts.isGetAccessorDeclaration(m)) a.get = m; else a.set = m;
      accessors.set(m.name.getText(), a);
    }
    if (accessors.size && !this.native.classDecl(cls)) {
      const entries = [...accessors].map(([n, a]) => {
        const t = (a.get && this.narrowedFrom(a.get)) ?? (a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name)));
        const self = `guard let __o = __this as? ${name} else { throw JSException(JSTypeError("Illegal invocation")) }`;
        const get = a.get ? `{ (__this: Any?) throws -> Any? in ${self}; return ${this.convert(`${this.throwsInfo.fn(a.get) ? 'try ' : ''}__o.${ident(n)}`, t, 'Any?')} }` : 'nil';
        const set = a.set ? `{ (__this: Any?, __v: Any?) throws -> Void in ${self}; __o.${ident(n)} = ${this.fromAny('__v', t)} }` : 'nil';
        return `${i}JSPrototypes.declare(${name}.self, ${swiftString(n)}, get: ${get}, set: ${set})`;
      });
      lines.push(...entries);
    }
    const decorators = (ts.getDecorators(cls) ?? []).filter((d) => !(ts.isIdentifier(d.expression) && this.library?.identities?.has(d.expression.text)) && !/^(CSSType|NativeClass|ObjCClass)\b/.test(d.expression.getText()));
    if (decorators.length) lines.push(`${i}try jsDecorate(${name}.self, [${decorators.map((d) => this.coerce(d.expression, 'Any?')).join(', ')}])`);
    return lines.join('\n');
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
    return decl.name ? identPath(this.topName(decl, decl.name.text)) : 'AnonymousClass';
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
  /** Variables a function declared before them reads: declared first, assigned where they are declared. */
  private forwardDeclared = new Set<ts.VariableDeclaration>();

  statements(list: ts.Statement[]): string[] {
    const fns = list.filter(ts.isFunctionDeclaration);
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
        list.forEach((other, j) => { if (j < k || ts.isFunctionDeclaration(other)) visit(other, ts.isFunctionLike(other)); });
        if (!early) continue;
        this.forwardDeclared.add(d);
        forward.push(`${this.indent}var ${ident(d.name.text)}: ${this.deferred(this.typeOf(d.name))}`);
      }
    });
    // What follows a read of a null receiver never runs.
    const throwsAt = list.findIndex((s) => !ts.isFunctionDeclaration(s) && leadingNeverRead(s, this.checker));
    const rest = list.filter((s, k) => !ts.isFunctionDeclaration(s) && (throwsAt < 0 || k < throwsAt));
    const out = [...forward, ...[...fns, ...rest].map((s) => this.stmt(s)).filter(Boolean)];
    if (throwsAt >= 0) {
      const read = leadingNeverRead(list[throwsAt], this.checker)!;
      out.push(`${this.indent}throw JSException(JSTypeError(${swiftString(`Cannot read properties of undefined (reading '${read.name.text}')`)}))`);
    }
    return out;
  }

  block(b: ts.Statement, base = this.indent): string {
    const saved = this.indent;
    this.indent = base + '    ';
    try {
      const body = this.statements(ts.isBlock(b) ? [...b.statements] : [b]);
      return `{\n${body.join('\n')}\n${base}}`;
    } finally { this.indent = saved; }
  }

  /** The app's own Swift classes, and those an untyped `declare const X: any` names (`__AppNative.swift`). */
  appNativeClasses = new Set<string>();
  readonly usedAppNative = new Set<string>();

  /** An identifier naming one of the app's Swift classes through an untyped ambient declaration. */
  appNativeOf(e: ts.Node): string | null {
    if (!ts.isIdentifier(e) || !this.appNativeClasses.has(e.text)) return null;
    const decl = this.resolve(e)?.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl) || !(this.checker.getTypeAtLocation(decl).flags & ts.TypeFlags.Any)) return null;
    this.usedAppNative.add(e.text);
    return `__AppNative_${e.text}.shared`;
  }

  /** Classes whose translated `init` throws (a field initializer that can). */
  readonly throwingInits = new Set<string>();
  initThrows(name: string): boolean { return this.throwingInits.has(name); }

  /** Component fields without an initializer are state, not props (Angular). */
  plainFields = false;

  /** `--allow-unimplemented-properties`: a core property the kit does not apply is set by name, with a warning. */
  allowUnapplied = false;

  /** Code checked without strictNullChecks (core): an undefined where a value type is declared reads as the type's zero. */
  lenient = false;

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
    let code = this.statementCode(s);
    // A return inside a try whose finally throws: recorded, and the finally runs before it is made.
    const pending = this.pendingReturn;
    if (pending && ts.isReturnStatement(s) && !this.asyncCtx) {
      const lines = code.split('\n');
      const m = /^(\s*)return(?: (.*))?$/.exec(lines.at(-1)!);
      if (!m) throw this.error(s, 'a return in a try whose finally block throws');
      lines[lines.length - 1] = `${m[1]}${m[2] !== undefined && pending.value ? `${pending.value} = ${m[2]}; ` : ''}${pending.flag} = true; break ${pending.label}`;
      code = lines.join('\n');
    }
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
      // A value returned where nothing is (a Promise executor's `return p.then(…)`): evaluated, then dropped.
      if (s.expression && this.returnType === 'Void' && this.typeOf(s.expression) !== 'Void' && !isNullish(s.expression)) return `${i}${this.tryPrefix(s.expression)}_ = ${this.expr(s.expression)}\n${i}return`;
      // `return log(x)` of a function returning nothing: the call, then undefined.
      if (s.expression && this.returnType && this.returnType !== 'Void' && this.typeOf(s.expression) === 'Void' && ts.isCallExpression(s.expression)) {
        const none = isOptional(this.returnType) || this.returnType === 'Any?' ? 'nil' : this.zero(this.returnType);
        if (none) return `${i}${this.tryPrefix(s.expression)}${this.exprStatement(s.expression)}\n${i}return ${none}`;
      }
      // Code checked without strictNullChecks returns undefined from a function of a value type: read as the type's zero, as its fields are.
      if (s.expression && this.returnType.endsWith('?') && this.returnType !== 'Any?') {
        const maybe = this.maybeUndefined(s.expression);
        if (maybe) return `${i}return ${this.tryPrefix(s.expression)}${maybe}`;
      }
      const missing = !s.expression || (this.lenient && isNullish(s.expression) && !this.returnType.endsWith('?') && this.returnType !== 'Any?');
      if (missing && this.lenient && this.returnType !== 'Void' && !this.returnType.endsWith('?') && this.zero(this.returnType) !== null) return `${i}return ${this.zero(this.returnType)}`;
      // A native struct has no undefined: its zero value.
      if (missing && this.lenient && this.native.isStructType(this.returnType)) return `${i}return ${this.returnType}()`;
      // `return undefined` from a function returning nothing.
      if (this.returnType === 'Void' && s.expression && isNullish(s.expression)) return `${i}return`;
      // A library call that may give undefined (`map.get(key)`) returned where a value type is declared: as such a slot reads undefined.
      if (s.expression && !isOptional(this.returnType) && this.returnType !== 'Any?' && this.returnType !== 'Void' && ts.isCallExpression(s.expression)) {
        const maybe = this.maybeUndefined(s.expression);
        if (maybe) return `${i}return ${this.tryPrefix(s.expression)}${this.undefinedAs(maybe, this.returnType)}`;
      }
      return i + (s.expression ? `return ${this.tryPrefix(s.expression)}${this.coerce(s.expression, this.returnType)}` : this.returnType?.endsWith('?') ? 'return nil' : 'return');
    }
    if (ts.isIfStatement(s)) {
      // A condition the parameters' constant values decide: only the branch that runs.
      const fixed = this.reach?.constant(s.expression) ?? this.staticTypeof(s.expression);
      if (fixed !== undefined) {
        const live = fixed ? s.thenStatement : s.elseStatement;
        return live ? `${i}do ${this.block(live)}` : '';
      }
      let out = `${i}if ${this.tryPrefix(s.expression)}${this.cond(s.expression)} ${this.block(s.thenStatement)}`;
      if (s.elseStatement && ts.isIfStatement(s.elseStatement)) {
        // An `else if` decided now is its live branch's block, or nothing.
        const rest = this.statementCode(s.elseStatement).trimStart();
        out += rest.startsWith('if ') ? ` else ${rest}` : rest.startsWith('do {') ? ` else ${rest.slice(3)}` : '';
      } else if (s.elseStatement) out += ` else ${this.block(s.elseStatement)}`;
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
          const bind = this.nested(() => this.nested(() => this.bindTo(decl.name, `${it}.jsCurrent`, /^Any\??$/.test(this.typeOf(s.expression)) ? 'Any?' : '', mutable)));
          return `${i}do {\n${i}    let ${it} = try ${js}\n${i}    defer { ${it}.jsClose() }\n${i}    ${label}while try ${it}.jsAdvance() {\n${bind}\n${i}        do ${body}\n${i}    }\n${i}}`;
        });
      }
      const iterable = this.iterable(s.expression);
      // A sequence that starts with a closure would read as the loop's body: parenthesized.
      const seq = (this.tryPrefix(s.expression) || (this.isAny(s.expression) ? 'try ' : '')) + (/^\{/.test(iterable) ? `(${iterable})` : iterable);
      return this.loopBody(() => {
        const label = this.takeLabel();
        if (ts.isIdentifier(decl.name)) return `${i}${label}for ${mutable ? 'var ' : ''}${ident(decl.name.text)} in ${seq} ${this.block(s.statement)}`;
        const item = this.fresh('__item');
        const body = this.block(s.statement);
        return `${i}${label}for ${item} in ${seq} {\n${this.nested(() => this.bindTo(decl.name, item, this.isAny(s.expression) ? 'Any?' : '', mutable))}\n${body.slice(2)}`;
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
      if (ts.isClassDeclaration(s)) {
        // A native class (`@NativeClass class Impl extends NSObject`) that uses nothing of the function around it is the module's.
        if (!this.capturesLocals(s)) {
          const saved = this.indent;
          this.indent = '';
          try {
            const native = this.native.classDecl(s);
            if (native) { this.hoisted.push(native); return ''; }
          } finally { this.indent = saved; }
        }
        throw this.error(s, 'a class declared inside a function');
      }
      return '';
    }
    throw this.error(s, 'statement');
  }

  /** Classes declared inside functions that the module declares instead. */
  private hoisted: string[] = [];

  /** Whether a declaration refers to anything a function around it declares. */
  private capturesLocals(decl: ts.Node): boolean {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found) return;
      if (ts.isIdentifier(n)) {
        const d = this.resolve(n)?.declarations?.[0];
        if (d && d.getSourceFile() === decl.getSourceFile() && !(d.pos >= decl.pos && d.end <= decl.end) && ts.findAncestor(d, (x) => ts.isFunctionLike(x) && x.pos <= decl.pos && x.end >= decl.end)) found = true;
      }
      ts.forEachChild(n, visit);
    };
    visit(decl);
    return found;
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
      if (this.forwardDeclared.has(d)) return `${i}${name} = ${this.tryPrefix(d.initializer!)}${this.coerce(d.initializer!, t)}`;
      // `var m` again in the same block: the same variable, assigned.
      if (this.redeclaredVar(d)) return d.initializer ? `${i}${name} = ${this.tryPrefix(d.initializer)}${this.coerce(d.initializer, t)}` : '';
      // Lenient code may read it before any assignment (`let result: string; if (!result) …`): undefined until assigned.
      if (!d.initializer && this.lenient && !lowered && !t.endsWith('?') && t !== 'Any?' && this.zero(t) !== null) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        return `${i}var ${name}: ${optionalType(t)} = nil`;
      }
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
      // A native struct is a value in Swift: a constant one's fields can still be assigned in JavaScript.
      const binding = constant && !this.native.isStructType(t) ? 'let' : 'var';
      return `${i}${binding} ${name}: ${this.lenientRef(t)} = ${this.tryPrefix(d.initializer)}${this.coerce(d.initializer, t)}`;
    }
    const tmp = this.fresh('__d');
    return `${i}let ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, ts.isArrayBindingPattern(d.name) && this.jsIteration(d.initializer!) && !/^JSMatch[?!]?$/.test(this.typeOf(d.initializer!)) ? 'iterated' : this.typeOf(d.initializer!), !constant)}`;
  }

  /** A `var` declaring a variable an earlier `var` of the same block declared. */
  private redeclaredVar(d: ts.VariableDeclaration): boolean {
    if (d.parent.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const) || !ts.isVariableStatement(d.parent.parent)) return false;
    const block = d.parent.parent.parent;
    const earlier = this.checker.getSymbolAtLocation(d.name)?.declarations?.filter((x) => x.pos < d.pos);
    return !!earlier?.some((x) => ts.isVariableDeclaration(x) && ts.isVariableStatement(x.parent.parent) && x.parent.parent.parent === block);
  }

  /** The type and value a destructuring pattern reads from: an iterator yields only as many values as an array pattern names. */
  private destructured(name: ts.BindingName, init: ts.Expression): string {
    // A match reads its values as an array does.
    const js = ts.isArrayBindingPattern(name) && !/^JSMatch[?!]?$/.test(this.typeOf(init)) ? this.jsIteration(init) : null;
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
    const arrayValue = (_type || this.typeOf(name)).replace(/\?$/, '').startsWith('JSArray<');
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
        read = this.isAny(name) || _type === 'Any?' ? `(try jsGet(${value}, ${swiftString(key)}))`
          : record ? this.undefinedAs(`${value}[${swiftString(key)}]`, ts.isIdentifier(el.name) ? this.typeOf(el.name) : record[1])
          : `${this.getterThrows(source, key) ? 'try ' : ''}${value}.${ident(key)}`;
      } else if (_type === 'Any?') read = `(try jsGet(${value}, "${k}"))`;
      else if (/^JSMatch[?!]?$/.test(_type)) read = this.undefinedAs(`(${value}.values.element(${k}) ?? nil)`, ts.isIdentifier(el.name) ? this.typeOf(el.name) : 'Any?');
      else if (this.checker.isTupleType(source) && !arrayValue) read = `${value}.${k}`;
      // Past the end is undefined.
      else if (this.isAny(name)) read = `(try jsGet(${value}, "${k}"))`;
      else read = arrayValue && ts.isIdentifier(el.name) ? this.undefinedAs(`${value}.element(${k})`, this.typeOf(el.name)) : `${value}[${k}]`;
      if (el.initializer) read = `(${read} ?? ${this.coerce(el.initializer, this.typeOf(el.name))})`;
      if (ts.isIdentifier(el.name)) {
        const t = this.typeOf(el.name);
        const fromAny = (this.isAny(name) || _type === 'Any?') && t !== 'Any?' ? this.fromAny(read, t) : read;
        lines.push(declare(el.name, t, fromAny));
      } else {
        const tmp = this.fresh('__d');
        lines.push(`${i}let ${tmp} = ${read}`, this.bindTo(el.name, tmp, '', mutable));
      }
    });
    return lines.join('\n');
  }

  /** Whether reading a member of a type runs a getter that throws. */
  private getterThrows(type: ts.Type, key: string): boolean {
    const decls = this.checker.getNonNullableType(type).getProperty(key)?.declarations ?? [];
    return decls.some((d) => ts.isGetAccessorDeclaration(d) && !!d.body && this.throwsInfo.fn(d));
  }

  /** What `for…of` iterates in Swift: arrays, sets and iterators as they are, a map's entries, a string's code points. */
  iterable(e: ts.Expression): string {
    // A Foundation collection Swift bridges (`NSArray` as `[Any]`): its elements, as the runtime iterates them.
    if (/^\[[^:]*\][?!]?$/.test(this.typeOf(e))) return /[?!]$/.test(this.typeOf(e)) ? `(${this.expr(e)} ?? [])` : this.expr(e);
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
    // An untyped value iterates as script would: an array's elements, an iterable's values.
    if (t === 'Any?') return `jsIteratorOf(${this.expr(e)}).jsCollect()`;
    if (t.startsWith('JSMap<')) return `${this.expr(e)}.entries()`;
    if (t === 'JSMatch') return `${this.expr(e)}.values`;
    // An untyped value: whatever its iteration gives, a TypeError where it has none.
    if (t === 'Any?') return `(try jsIteratorOf(${this.expr(e)}))`;
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
          lines.push(`${i}case _ where ${labels.map((l) => `${subject} == ${this.coerce(l, subjectType)}`).join(' || ')}:`);
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
        // The last clause runs from every start: unconditional, so Swift sees what it returns.
        lines.push(k === clauses.length - 1 ? `${i}    do {` : `${i}    if ${start} <= ${k} {`, ...code, `${i}    }`);
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
    if (!this.throwsInfo.expr(s.finallyBlock) || this.asyncCtx) {
      const inner = this.nested(() => this.tryStatement(ts.factory.updateTryStatement(s, s.tryBlock, s.catchClause, undefined)));
      return `${i}do {\n${i}    defer ${fin}\n${inner}\n${i}}`;
    }
    // A finally that throws, which a Swift `defer` cannot: the try's completion (an error, a return) is
    // recorded, the finally runs, and the completion is resumed after it, unless the finally throws first.
    const guarded = [s.tryBlock, s.catchClause?.block].filter((b): b is ts.Block => !!b);
    if (guarded.some((b) => containsJump(b, ts.SyntaxKind.BreakStatement) || containsJump(b, ts.SyntaxKind.ContinueStatement))) throw this.error(s, 'break or continue in a try whose finally block throws');
    const label = this.fresh('__try'), error = this.fresh('__error'), flag = this.fresh('__returned');
    const value = this.returnType && this.returnType !== 'Void' ? this.fresh('__value') : null;
    const saved = this.pendingReturn;
    this.pendingReturn = { label, flag, value };
    let inner: string;
    try { inner = this.nested(() => this.nested(() => this.tryStatement(ts.factory.updateTryStatement(s, s.tryBlock, s.catchClause, undefined)))); } finally { this.pendingReturn = saved; }
    const returns = guarded.some((b) => containsJump(b, ts.SyntaxKind.ReturnStatement));
    const made = value ? `${value}${isOptional(this.returnType) ? '' : '!'}` : '';
    // The function's last statement, whose end the checker finds unreachable: every completion that gets past the finally is a return.
    const fn = ts.findAncestor(s.parent, ts.isFunctionLike);
    const body = fn && 'body' in fn && fn.body && ts.isBlock(fn.body) ? fn.body : undefined;
    const ends = !!body && body.statements.at(-1) === s && !(fn!.flags & ts.NodeFlags.HasImplicitReturn);
    // Inside another such try, the return goes on to that one's finally.
    const resume = saved ? `${saved.value && value ? `${saved.value} = ${made}; ` : ''}${saved.flag} = true; break ${saved.label}` : `return${made ? ` ${made}` : ''}`;
    return [
      `${i}do {`,
      `${i}    var ${error}: Error? = nil`,
      ...(returns ? [`${i}    var ${flag} = false`, ...(value ? [`${i}    var ${value}: ${optionalType(this.returnType)} = nil`] : [])] : []),
      `${i}    ${label}: do {`,
      inner,
      `${i}    } catch {`,
      `${i}        ${error} = error`,
      `${i}    }`,
      `${i}    do ${fin.trimStart()}`,
      `${i}    if let ${error} { throw ${error} }`,
      ...(returns ? [ends && !saved ? `${i}    ${resume}` : `${i}    if ${flag} { ${resume} }`] : []),
      `${i}}`,
    ].join('\n');
  }

  /** The return a `try` whose finally throws turns into: the flag and value it records, the block it leaves. */
  private pendingReturn: { label: string; flag: string; value: string | null } | null = null;

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
      const member = step ? this.untypedMember(e.operand) : null;
      if (member) return `jsPostUpdate(${member.object}, ${member.key}, ${step}1)`;
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
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !this.subst.has(e)) return this.binary(e);
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
    // A Promise executor's resolve passed on as a function: a function of the promise's value type.
    const resolvers = ts.isIdentifier(e) ? this.resolvers.get(this.resolve(e)!) : undefined;
    if (resolvers && (target === 'Any?' || functionParts(target.replace(/^\((.*)\)[?!]$/, '$1')))) {
      const own = `(${resolvers.type === 'Void' ? '' : resolvers.type}) throws -> Void`;
      const fn = resolvers.type === 'Void' ? `{ ${resolvers.name}.resolve() }` : this.expr(e);
      return target === 'Any?' ? this.boxFunction(fn, own) : this.convert(fn, own, target);
    }
    // An iterable where the type names only its iteration: the kit's iterable of it.
    const iterableSlot = /^JS(Async)?Iterable<.*>\??$/.exec(target);
    if (iterableSlot && !/^JS(Async)?(Iterable|Iterator|Generator)</.test(this.typeOf(e))) return `${iterableSlot[1] ? 'jsAsyncIterable' : 'jsIterable'}(${this.expr(e)})`;
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text) && !e.arguments?.length && /^JS(Map|Set)</.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    // `[]` where an array of a type is wanted is an empty array of it.
    let bare: ts.Expression = e;
    while (ts.isParenthesizedExpression(bare) || ts.isAsExpression(bare)) bare = bare.expression;
    if (ts.isArrayLiteralExpression(bare) && !bare.elements.length && /^JSArray<.*>$/.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    // An array of tuples where the slot's type has them typed (`[[property, color]]` for `[any, any][]` returned as `[CssProperty, Color][]`).
    const tuples = /^(JSArray<)?(\(.*\))>?$/.exec(target.replace(/\?$/, ''));
    const arity = tuples && !hasTopLevelArrow(tuples[2]) ? splitTopLevel(tuples[2].slice(1, -1)).length : 0;
    const fits = (x: ts.Expression) => ts.isArrayLiteralExpression(x) && x.elements.length === arity && !x.elements.some(ts.isSpreadElement);
    if (ts.isArrayLiteralExpression(bare) && arity > 1 && (tuples![1] ? bare.elements.every(fits) : fits(bare))) return this.array(bare, target.replace(/\?$/, ''));
    // Branches typed otherwise than where the value goes: each as it is taken.
    if (ts.isConditionalExpression(bare) && tuples && arity > 1 && this.typeOf(bare) !== target && ![bare.whenTrue, bare.whenFalse].some(isNullish)) {
      return `(${this.cond(bare.condition)} ? ${this.coerce(bare.whenTrue, target)} : ${this.coerce(bare.whenFalse, target)})`;
    }
    // `new Array<Base>()` where an array of a subclass is wanted: an empty array of it.
    if (ts.isNewExpression(bare) && ts.isIdentifier(bare.expression) && bare.expression.text === 'Array' && !bare.arguments?.length && /^JSArray<.*>[?!]?$/.test(target)) return `${target.replace(/[?!]$/, '')}()`;
    // Lenient code passing null or undefined where a string, number or boolean is declared: the type's zero, as such a slot reads it.
    if (this.lenient && isNullish(bare) && ['String', 'Double', 'Bool'].includes(target)) return this.zero(target)!;
    // Null where a native struct is declared: its zero value, as the iOS runtime marshals null for one.
    if (this.lenient && isNullish(bare) && this.native.isStructType(target)) return `${target}()`;
    // Library mode: an object literal of an event type is core's EventData over it.
    if (this.library && ts.isObjectLiteralExpression(bare) && target.replace(/[?!]$/, '') === 'EventData') return `EventData(jsObject: ${this.coerce(e, 'Any?')})`;
    // Library mode: a function literal for a slot an erased generic types otherwise (`(value: Span) => …` where `(Any?) -> Void` is taken): adapted.
    if (this.library && (ts.isArrowFunction(bare) || ts.isFunctionExpression(bare)) && !this.carriesMethod(bare) && functionParts(target)) {
      const own = this.closureType(bare);
      const want = functionParts(target)!, have = functionParts(own);
      if (have && have.params.length <= want.params.length && have.params.some((p, k) => p.replace(/^@escaping /, '') !== want.params[k].replace(/^@escaping /, ''))) return this.convert(this.expr(e), own, target);
    }
    // An async function where a function returning nothing is wanted (a callback typed `() => void`): its promise is dropped.
    const want = functionParts(target.replace(/^\((.*)\)[?!]$/, '$1')), have = functionParts(this.typeOf(e).replace(/^\((.*)\)[?!]$/, '$1'));
    if (want && have && want.result === 'Void' && /^JSPromise</.test(have.result) && want.params.length === have.params.length) {
      const names = want.params.map((_, k) => `__p${k}`);
      return `{ (${want.params.map((p, k) => `${names[k]}: ${p.replace(/^@escaping /, '')}`).join(', ')}) throws -> Void in _ = try (${this.expr(e)})(${names.join(', ')}) }`;
    }
    // An array of a type where an array of any value is wanted: its elements, as a new array of them.
    if (target === 'JSArray<Any?>' && /^JSArray<.*>$/.test(this.typeOf(e)) && this.typeOf(e) !== 'JSArray<Any?>') return `JSArray<Any?>(${this.expr(e)}.storage.map { $0 as Any? })`;
    const source = this.typeOf(e);
    // An untyped array where an array of a type is wanted: its elements as that type, in a new array.
    if (source === 'JSArray<Any?>' && /^JSArray<.+>$/.test(target) && target !== source && !ts.isArrayLiteralExpression(bare)) return `jsArrayOf(${this.expr(e)}) { ${this.fromAny('$0', target.slice(8, -1))} }`;
    if (target.endsWith('?') && target !== 'Any?' && !source.endsWith('?')) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?' && this.untypedEnum('', source)) return this.untypedEnum(this.expr(e), source);
    if (target === 'Any?') {
      // Null kept as untyped values hold it, apart from undefined.
      if (bare.kind === ts.SyntaxKind.NullKeyword) return 'jsNull';
      // A Promise executor's resolve held untyped: a function resolving the promise.
      const resolvers = ts.isIdentifier(bare) ? this.resolvers.get(this.resolve(bare)!) : undefined;
      if (resolvers) return `({ (__a: [Any?]) throws -> Any? in ${resolvers.name}.resolve(${resolvers.type === 'Void' ? '' : this.fromAnyCode('jsArg(__a, 0)', resolvers.type, true)}); return nil } as JSFunction)`;
      if (ts.isConditionalExpression(bare) && [bare.whenTrue, bare.whenFalse].some((x) => x.kind === ts.SyntaxKind.NullKeyword)) {
        return `(${this.cond(bare.condition)} ? ${this.coerce(bare.whenTrue, 'Any?')} : ${this.coerce(bare.whenFalse, 'Any?')})`;
      }
      const maybe = this.maybeUndefined(e);
      if (maybe) return `(${maybe} as Any?)`;
      if (source === 'Double' && numericLiteralOnly(e)) return `Double(${this.expr(e)})`;
      // A method value is untyped already.
      if (this.library && ts.isFunctionExpression(bare) && (this.carriesMethod(bare) || this.readsArguments(bare))) return this.expr(e);
      if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && !e.parameters.some((p) => !ts.isIdentifier(p.name))) {
        const rest = e.parameters.findIndex((p) => p.dotDotDotToken);
        return rest < 0 ? this.convert(this.expr(e), this.closureType(e), 'Any?') : this.boxFunction(this.expr(e), this.closureType(e), rest);
      }
      if (functionParts(source.replace(/\?$/, '').replace(/^\((.*)\)$/, '$1'))) return this.convert(this.expr(e), source, 'Any?');
      // An object read with an unwrap (`view.parent!`) is undefined where it is missing, as an untyped value can be.
      const code = this.expr(e);
      return /[\w)\]]!$/.test(code) && this.isObjectRef(e) ? code.slice(0, -1) : code;
    }
    // A number where Swift has a native enum or option set (`UIMenuOptions.A | UIMenuOptions.B`).
    if (source === 'Double' && target !== 'Double' && this.native.isEnumType(target.replace(/\?$/, ''))) return this.native.enumFromNumber(this.expr(e), target);
    // A native enum or option set where a number is wanted: its raw value; a missing one is undefined, NaN as a number.
    const enumBase = source.replace(/[?!]$/, '');
    if ((target === 'Double' || target === 'Double?') && enumBase !== 'Double' && this.native.isEnumType(enumBase)) {
      const code = this.expr(e);
      if (source === enumBase) return `Double(${code}.rawValue)`;
      return target === 'Double?' ? `(${code}).map { Double($0.rawValue) }` : `((${code}).map { Double($0.rawValue) } ?? .nan)`;
    }
    // A value TypeScript's strict typing calls possibly undefined where the code expects one (`map.get(k)` after `has(k)`).
    if (source === optionalType(target) && target !== 'Any?' && !target.endsWith('?') && !isFunctionType(target)) return this.undefinedAs(this.expr(e), target);
    // Lenient code: a library call Swift gives as optional (`map.get(k)`), which the checker reads as its value type.
    const raw = this.lenient && ts.isCallExpression(bare) && source === target && target !== 'Any?' && !isOptional(target) && !isFunctionType(target) ? this.maybeUndefined(bare) : null;
    if (raw) return this.undefinedAs(raw, target);
    // A Foundation mutable collection where Swift's bridged collection is declared (`NSDictionary` returned as an `NSMutableDictionary`).
    if (/^NSMutable(Array|Dictionary)[?!]?$/.test(source) && /^\[.*\]$/.test(target)) return `(${this.expr(e)} as! ${target})`;
    // A new array of a subclass's objects where one of the base class's is wanted (`this._windows.filter(…)` as `WindowBase[]`).
    if (/^JSArray<\w+>$/.test(source) && /^JSArray<\w+>[?!]?$/.test(target) && source !== target.replace(/[?!]$/, '') && (ts.isCallExpression(bare) || ts.isArrayLiteralExpression(bare))) {
      const cast = this.classCast(this.expr(e), source, target);
      if (cast) return cast;
    }
    if (/^JSPromise<(Any\?|JSArray<Any\?>)>$/.test(source) && /^JSPromise<.*>[?!]?$/.test(target) && source !== target.replace(/[?!]$/, '')) {
      const all = ts.isCallExpression(bare) && ts.isPropertyAccessExpression(bare.expression) && bare.expression.name.text === 'all' && ts.isIdentifier(bare.expression.expression) && bare.expression.expression.text === 'Promise' && this.isLibGlobal(bare.expression.expression) && bare.arguments.length === 1 && !ts.isArrayLiteralExpression(bare.arguments[0]) ? bare : null;
      return all ? this.untypedAll(all.arguments[0], target) : this.promiseAs(this.expr(e), source, target);
    }
    const spread = source !== target ? this.restFunction(e, source, target) ?? this.defaultedFunction(e, source, target) : null;
    if (spread) return spread;
    // A function declaration giving undefined where its type says a value (lenient code): its Swift result is optional.
    const fnDecl = ts.isIdentifier(bare) ? this.resolve(bare)?.valueDeclaration : undefined;
    if (fnDecl && ts.isFunctionDeclaration(fnDecl) && functionParts(target.replace(/^\((.*)\)\?$/, '$1'))) {
      const actual = this.functionValueType(fnDecl);
      if (actual !== target) return this.convert(this.expr(e), actual, target);
    }
    if (source !== target && !ts.isArrowFunction(e) && !ts.isFunctionExpression(e) && functionParts(source.replace(/^\((.*)\)\?$/, '$1')) && functionParts(target.replace(/^\((.*)\)\?$/, '$1'))) return this.convert(this.expr(e), source, target);
    if (source === 'Any?' && target !== 'Void') {
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.expr(e);
      return this.fromAny(this.expr(e), target);
    }
    // Library mode: an object of a literal's shape where a class object literals are typed as goes (`{ ...args, delay: undefined }` as AnimationInfo): one made of its fields.
    const make = !(ts.isObjectLiteralExpression(bare) && this.literalClassOf(bare)) ? this.shapeToClass(source.replace(/[?!]$/, ''), target.replace(/[?!]$/, '')) : null;
    if (make) return source.endsWith('?') ? `(${this.expr(e)}).map(${make})` : `${make}(${this.expr(e)})`;
    // An array of such objects where an array of the class is taken: each made so.
    const elements = /^JSArray<(Object_\w+)>\??$/.exec(source)?.[1];
    const each = elements && this.shapeToClass(elements, /^JSArray<(\w+)>\??$/.exec(target)?.[1] ?? '');
    const missing = isOptional(source) || (this.lenient && ts.isConditionalExpression(bare) && [bare.whenTrue, bare.whenFalse].some(isNullish));
    if (each) return missing ? `(${this.expr(e)})?.map(${each})` : `${this.expr(e)}.map(${each})`;
    // Library mode: a class where a subclass is declared (`this` of ViewCommon where core's declarations say View).
    if (this.library && this.isSubclassOf(target.replace(/[?!]$/, ''), source.replace(/[?!]$/, ''))) return `(${this.expr(e)} as${target.endsWith('?') || source.endsWith('?') ? '?' : '!'} ${target.replace(/[?!]$/, '')})`;
    return this.expr(e);
  }

  /** A function taking a rest parameter (`(...args) => void`) where a function of fixed parameters is wanted: those past the rest's start packed into its array. */
  private restFunction(e: ts.Expression, source: string, target: string): string | null {
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const last = sig?.getParameters().at(-1)?.valueDeclaration;
    if (!last || !ts.isParameter(last) || !last.dotDotDotToken) return null;
    const have = functionParts(source), want = functionParts(target);
    const fixed = (have?.params.length ?? 0) - 1;
    const element = have && /^JSArray<(.*)>$/.exec(have.params[fixed] ?? '')?.[1];
    if (!have || !want || !element || want.params.length < fixed) return null;
    const p = (t: string) => t.replace(/^@escaping /, '');
    const params = want.params.map((t, k) => `__q${k}: ${p(t)}`);
    const args = [...want.params.slice(0, fixed).map((t, k) => this.convert(`__q${k}`, p(t), p(have.params[k]))),
      `JSArray<${element}>([${want.params.slice(fixed).map((t, k) => this.convert(`__q${fixed + k}`, p(t), element)).join(', ')}])`];
    const call = `try __h(${args.join(', ')})`;
    const body = want.result === 'Void' ? `_ = ${call}` : `return ${this.convert(call, have.result, want.result)}`;
    return `{ (__h: @escaping ${have.text}) -> ${want.text} in { (${params.join(', ')}) throws -> ${want.result} in ${body} } }(${this.expr(e)})`;
  }

  /** A declared function where a function of fewer parameters is wanted: called by name, so the rest take their defaults. */
  private defaultedFunction(e: ts.Expression, source: string, target: string): string | null {
    if (!ts.isIdentifier(e) && !ts.isPropertyAccessExpression(e)) return null;
    const decl = this.resolve(ts.isPropertyAccessExpression(e) ? e.name : e)?.valueDeclaration;
    if (!decl || !(ts.isFunctionDeclaration(decl) || ts.isMethodDeclaration(decl)) || !decl.body || decl.getSourceFile().isDeclarationFile) return null;
    const have = functionParts(source), want = functionParts(target);
    if (!have || !want || want.params.length >= have.params.length || want.params.length >= decl.parameters.length) return null;
    if (!decl.parameters.slice(want.params.length).every((p) => (p.questionToken || p.initializer) && !p.dotDotDotToken)) return null;
    const p = (t: string) => t.replace(/^@escaping /, '');
    const params = want.params.map((t, k) => `__q${k}: ${p(t)}`);
    const call = `try ${this.expr(e)}(${want.params.map((t, k) => this.convert(`__q${k}`, p(t), p(have.params[k]))).join(', ')})`;
    const body = want.result === 'Void' ? `_ = ${call}` : `return ${this.convert(call, have.result, want.result)}`;
    return `{ (${params.join(', ')}) throws -> ${want.result} in ${body} }`;
  }

  /**
   * A value of one program class (or an array of them) read as another of its hierarchy: an
   * object as itself, cast; an array as a new array of its elements, Swift's generic classes
   * not being covariant. Null when the types are not so related.
   */
  private classCast(code: string, from: string, to: string): string | null {
    const bare = (t: string) => t.replace(/[?!]$/, '');
    const related = (a: string, b: string) => this.isSubclassOf(a, b) || this.isSubclassOf(b, a);
    const fa = /^JSArray<(\w+)>$/.exec(bare(from))?.[1], ta = /^JSArray<(\w+)>$/.exec(bare(to))?.[1];
    if (fa && ta && fa !== ta && related(fa, ta)) {
      const up = this.isSubclassOf(fa, ta);
      const map = `JSArray<${ta}>(${code}${/[?!]$/.test(from) ? '!' : ''}.storage.map { $0 as${up ? '' : '!'} ${ta} })`;
      return isOptional(from) && isOptional(to) ? `(${code}).map { JSArray<${ta}>($0.storage.map { $0 as${up ? '' : '!'} ${ta} }) }` : map;
    }
    const f = bare(from), t = bare(to);
    if (f !== t && /^\w+$/.test(f) && /^\w+$/.test(t) && related(f, t)) return this.isSubclassOf(f, t) ? code : `(${code} as${isOptional(to) ? '?' : '!'} ${t})`;
    return null;
  }

  private classesByName: Map<string, ts.ClassLikeDeclaration> | null = null;

  /** Library mode: the program's class an object literal is typed as (`Readonly<SelectorsMatch>` included). */
  private literalClassOf(e: ts.ObjectLiteralExpression): ts.ClassDeclaration | null {
    let t = this.checker.getContextualType(e) ?? this.checker.getTypeAtLocation(e);
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return null;
    t = this.checker.getNonNullableType(t);
    if (t.aliasSymbol?.name === 'Readonly' && t.aliasTypeArguments?.length === 1) t = t.aliasTypeArguments[0];
    const decl = t.getSymbol()?.declarations?.find(ts.isClassDeclaration);
    return decl && !decl.getSourceFile().isDeclarationFile && this.library?.moduleName(decl.getSourceFile().fileName) ? decl : null;
  }

  /** Library mode: a function making an instance of a class object literals are typed as from an object of a literal's shape, its fields copied. */
  private shapeToClass(source: string, target: string): string | null {
    if (!this.library || !/^Object_\w+$/.test(source)) return null;
    const cls = [...this.literalClasses()].find((c) => this.className(c) === target);
    const shape = cls && [...this.shapes.values()].find((x) => x.name === source);
    if (!cls || !shape) return null;
    const type = this.checker.getDeclaredTypeOfSymbol(this.checker.getSymbolAtLocation(cls.name!)!);
    const copies = shape.fields.flatMap((f) => {
      const d = type.getProperty(f.name)?.valueDeclaration;
      return d && ts.isPropertyDeclaration(d) && !isStatic(d) ? [`__o.${ident(f.name)} = ${this.convert(`__s.${ident(f.name)}`, f.type, this.typeOf(d.name))}`] : [];
    });
    return `{ (__s: ${source}) -> ${target} in let __o = ${target}(jsLiteral: ()); ${[...copies, 'return __o'].join('; ')} }`;
  }

  /** Library mode: the program's class an array of object literals' shape goes where an array of it is taken (`keys.map((k) => ({ ... }))` returned as `KeyframeDeclaration[]`). */
  private shapesClassOf(e: ts.Expression): ts.ClassDeclaration | null {
    const want = this.checker.getContextualType(e);
    const have = this.checker.getTypeAtLocation(e);
    if (!want || !this.checker.isArrayType(want) || !this.checker.isArrayType(have)) return null;
    const element = this.checker.getTypeArguments(have as ts.TypeReference)[0];
    if (!(element?.getSymbol()?.flags & ts.SymbolFlags.ObjectLiteral)) return null;
    const decl = this.checker.getTypeArguments(want as ts.TypeReference)[0]?.getSymbol()?.declarations?.find(ts.isClassDeclaration);
    return decl && !decl.getSourceFile().isDeclarationFile && this.library?.moduleName(decl.getSourceFile().fileName) ? decl : null;
  }

  private literalTargets: Set<ts.ClassDeclaration> | null = null;
  /** The classes object literals of the program are typed as. */
  private literalClasses(): Set<ts.ClassDeclaration> {
    if (this.literalTargets) return this.literalTargets;
    const out = new Set<ts.ClassDeclaration>();
    const visit = (n: ts.Node) => {
      if (ts.isObjectLiteralExpression(n)) { const c = this.literalClassOf(n); if (c) out.add(c); }
      if (ts.isReturnStatement(n) && n.expression) { const c = this.shapesClassOf(n.expression); if (c) out.add(c); }
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'map') { const c = this.shapesClassOf(n); if (c) out.add(c); }
      ts.forEachChild(n, visit);
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return (this.literalTargets = out);
  }

  /**
   * An object literal typed as a class: an instance made without the constructor, the literal's keys
   * written in order. A function the literal gives for a method is the instance's own, which calls of it
   * reach; the instance is still of the class (`instanceof` holds, unlike the literal's).
   */
  private classLiteral(e: ts.ObjectLiteralExpression, cls: ts.ClassDeclaration): string {
    if (cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword)) throw this.error(e, `an object literal of the class ${cls.name?.text} that extends another`);
    const name = this.className(cls);
    const o = this.fresh('__literal');
    const type = this.checker.getDeclaredTypeOfSymbol(this.checker.getSymbolAtLocation(cls.name!)!);
    const write = (key: string, value: ts.Expression): string => {
      const decl = type.getProperty(key)?.valueDeclaration;
      if (decl && ts.isPropertyDeclaration(decl) && !isStatic(decl)) return `${o}.${ident(key)} = ${this.tryPrefix(value)}${this.coerce(value, this.typeOf(decl.name))}`;
      // A function for a method takes the method's parameters, as its callers pass them.
      if (decl && ts.isMethodDeclaration(decl) && (ts.isArrowFunction(value) || ts.isFunctionExpression(value))) {
        const slot = this.slotOf(value)?.getParameters() ?? [];
        const params = [...value.parameters.map((q) => this.typeOf(q.name)), ...slot.slice(value.parameters.length).map((q) => this.type(this.checker.getTypeOfSymbolAtLocation(q, value), value))];
        return `jsExpandoSet(${o}, ${swiftString(key)}, ${this.boxFunction(this.expr(value), `(${params.join(', ')}) throws -> ${this.closureReturn(value)}`)})`;
      }
      return `jsExpandoSet(${o}, ${swiftString(key)}, ${this.tryPrefix(value)}${this.coerce(value, 'Any?')})`;
    };
    const steps = e.properties.flatMap((p) => {
      if (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) return [write(literalKey(p.name, this.checker) ?? p.name.getText(), p.initializer)];
      if (ts.isShorthandPropertyAssignment(p)) return [write(p.name.text, p.name)];
      if (ts.isSpreadAssignment(p)) {
        const source = this.checker.getNonNullableType(this.checker.getTypeAtLocation(p.expression));
        if (this.isAny(p.expression) || !source.getSymbol()?.declarations?.some(ts.isClassDeclaration)) throw this.error(p, 'a spread of anything but a class instance into an object literal of a class');
        const s = this.fresh('__spread');
        const copied = source.getProperties().filter((x) => x.valueDeclaration && ts.isPropertyDeclaration(x.valueDeclaration) && !isStatic(x.valueDeclaration) && type.getProperty(x.name)?.valueDeclaration && ts.isPropertyDeclaration(type.getProperty(x.name)!.valueDeclaration!));
        return [`let ${s}: ${this.typeOf(p.expression).replace(/[?!]$/, '')} = ${this.tryPrefix(p.expression)}${this.expr(p.expression)}`, ...copied.map((x) => `${o}.${ident(x.name)} = ${s}.${ident(x.name)}`)];
      }
      throw this.error(p, 'this member in an object literal of a class');
    });
    return `{ () ${this.throwsInfo.expr(e) ? 'throws ' : ''}-> ${name} in ${[`let ${o} = ${name}(jsLiteral: ())`, ...steps, `return ${o}`].join('; ')} }()`;
  }
  /** Whether one class the program declares extends another, by their Swift names. */
  private isSubclassOf(sub: string, base: string): boolean {
    if (sub === base || !/^[A-Za-z_][\w.]*$/.test(sub) || !/^[A-Za-z_][\w.]*$/.test(base)) return false;
    if (!this.classesByName) {
      this.classesByName = new Map();
      for (const sf of this.sourceFiles) {
        if (sf.isDeclarationFile) continue;
        const visit = (n: ts.Node) => { if (ts.isClassDeclaration(n) && n.name) this.classesByName!.set(this.className(n), n); ts.forEachChild(n, visit); };
        visit(sf);
      }
    }
    for (let c = this.classesByName.get(sub); c; c = this.sourceBase(c)) if (this.className(c) === base && c !== this.classesByName.get(sub)) return true;
    return false;
  }

  /** A condition: Swift needs a Bool where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsTruthy(${maybe} as Any?)`;
    // `a && b` as a condition is whether both are truthy, whatever values the operands have.
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind) && !(this.isBool(e.left) && this.isBool(e.right))) {
      return `(${this.cond(e.left)} ${e.operatorToken.getText()} ${this.cond(e.right)})`;
    }
    if (this.isBool(e)) return this.expr(e);
    // A member of an untyped value is tested as read, before any conversion to its declared type (`!!descriptor.set`).
    if ((ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) && !e.questionDotToken && this.isAny(e.expression) && !this.isAny(e)) {
      return `jsTruthy(jsGet(${this.expr(e.expression)}, ${ts.isPropertyAccessExpression(e) ? swiftString(e.name.text) : this.propertyKey(e.argumentExpression)}))`;
    }
    const code = this.expr(e);
    // An object read with an unwrap (`this.page!`) tests whether it is there.
    if (/[\w)\]]!$/.test(code) && this.isObjectRef(e)) return `jsTruthy(${code.slice(0, -1)} as Any?)`;
    return `jsTruthy(${code})`;
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
      return `({ () ${tp ? 'throws ' : ''}-> ${t} in ${tp}${this.binary(a)}; return ${this.expr(a.left)} }())`;
    }
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    // `(info.name = v)` as a value: the value assigned, evaluated once (Swift's assignment has none).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !statementLevel(e) && !ts.isArrayLiteralExpression(e.left) && !this.subst.has(e.right)) {
      const t = this.typeOf(e.right) === 'Void' ? 'Any?' : this.typeOf(e.right);
      const v = this.fresh('__assigned');
      const tp = this.tryPrefix(e);
      const value = `${this.tryPrefix(e.right)}${this.coerce(e.right, t)}`;
      this.subst.set(e.right, v);
      try {
        return `({ () ${tp ? 'throws ' : ''}-> ${t} in let ${v}: ${t} = ${value}; ${tp}${this.assignment(e)}; return ${v} }())`;
      } finally { this.subst.delete(e.right); }
    }
    // `return (s += x)`: a compound assignment's value is its target after it (Swift's assignment has none).
    if (ts.isBinaryExpression(e) && isCompoundAssignment(e.operatorToken.kind) && !statementLevel(e)) {
      const t = this.declaredTypeOf(e.left) ?? this.typeOf(e.left);
      const tp = this.tryPrefix(e);
      return `({ () ${tp ? 'throws ' : ''}-> ${t} in ${tp}${this.binary(e)}; return ${this.expr(e.left)} }())`;
    }
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
      if (from !== to && from.replace(/[?!]$/, '') !== to.replace(/[?!]$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) {
        // An object of another shape asserted to an interface (`cur as ICalEvent`): the interface's class read from it.
        const target = this.checker.getTypeAtLocation(e).getSymbol();
        const shaped = !!target && !!(target.flags & ts.SymbolFlags.Interface) && !(target.flags & ts.SymbolFlags.Class) && !to.endsWith('?') && /^[A-Z]\w*$/.test(to)
          && !target.declarations?.some((d) => d.getSourceFile().isDeclarationFile);
        if (shaped) return `{ (__o: Any?) -> ${to} in (__o as? ${to}) ?? ${to}(jsObject: __o) }(${this.expr(e.expression)})`;
        return `(${this.expr(e.expression)} as! ${to})`;
      }
      return this.expr(e.expression);
    }
    // `f<T>`: the function, its type arguments only TypeScript's.
    if (ts.isExpressionWithTypeArguments(e)) return this.expr(e.expression);
    if (ts.isNonNullExpression(e)) {
      const inner = this.expr(e.expression);
      return this.typeOf(e.expression).endsWith('?') ? `${inner}!` : inner;
    }
    if (ts.isPropertyAccessExpression(e)) {
      const member = this.namespaceMember(e);
      const decl = member ? this.resolve(e.name)?.valueDeclaration : undefined;
      if (member && (this.isNamespace(e) || (decl && ts.isClassDeclaration(decl)))) return `${member}.self`;
      return member ? this.narrowed(e, member) : this.property(e);
    }
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isCallExpression(e)) return this.undefinedResult(e, this.erasedResult(e, this.call(e)));
    if (ts.isNewExpression(e)) return this.newExpr(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) {
      const member = this.untypedMember(e.operand);
      if (member) return `jsPostUpdate(${member.object}, ${member.key}, ${e.operator === ts.SyntaxKind.PlusPlusToken ? '1' : '-1'})`;
      const fn = e.operator === ts.SyntaxKind.PlusPlusToken ? 'jsPostIncrement' : 'jsPostDecrement';
      return `${fn}(&${this.lvalue(e.operand)})`;
    }
    if (ts.isConditionalExpression(e)) {
      let t = this.typeOf(e);
      // Lenient code choosing an object or null: an optional, as the variable holding it is.
      if (this.lenient && [e.whenTrue, e.whenFalse].some(isNullish) && !['String', 'Double', 'Bool'].includes(t) && !isFunctionType(t) && t !== 'Any?' && !t.endsWith('!') && !this.native.isStructType(t)) t = optionalType(t);
      // Branches of different types are untyped values alike.
      const branch = (x: ts.Expression) => (t === 'Any?' && !['Any?', 'Void'].includes(this.typeOf(x)) && x.kind !== ts.SyntaxKind.NullKeyword ? `(${this.coerce(x, t)} as Any?)` : this.coerce(x, t));
      return `(${this.cond(e.condition)} ? ${branch(e.whenTrue)} : ${branch(e.whenFalse)})`;
    }
    if (ts.isArrayLiteralExpression(e)) return this.array(e);
    if (ts.isObjectLiteralExpression(e)) return this.object(e);
    if (ts.isTaggedTemplateExpression(e)) return this.taggedTemplate(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e);
    // A class whose instances are plain objects of any keys (`class { [key: string]: string }`), held as a value.
    if (ts.isClassExpression(e) && this.library && !e.heritageClauses?.length && e.members.every(ts.isIndexSignatureDeclaration)) return 'JSConstructor { _ in JSObject() }';
    if (ts.isTypeOfExpression(e)) return this.typeofExpr(e);
    if (ts.isAwaitExpression(e)) throw this.error(e, 'await outside a statement of an async function');
    if (ts.isDeleteExpression(e)) {
      const target = e.expression;
      if (ts.isElementAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${this.str(target.argumentExpression)})`;
      if (ts.isPropertyAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${swiftString(target.name.text)})`;
      if (ts.isPropertyAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${swiftString(target.name.text)})`;
      if (ts.isElementAccessExpression(target) && this.isAny(target.expression)) return `jsDelete(${this.expr(target.expression)}, ${this.propertyKey(target.argumentExpression)})`;
      // Library mode: what script added to an instance of a compiled class, or to an object used as a map.
      if (this.library && ts.isElementAccessExpression(target)) return `((try? jsDelete(${this.expr(target.expression)}, ${this.propertyKey(target.argumentExpression)})) ?? false)`;
      if (this.library && ts.isPropertyAccessExpression(target)) return `((try? jsDelete(${this.expr(target.expression)}, ${swiftString(target.name.text)})) ?? false)`;
      throw this.error(e, 'delete of this member');
    }
    if (ts.isVoidExpression(e)) return `{ _ = ${this.expr(e.expression)}; return nil as Any? }()`;
    // `import.meta` of the bundled app's module, in the app bundle.
    if (ts.isMetaProperty(e) && e.keywordToken === ts.SyntaxKind.ImportKeyword) return 'jsImportMeta';
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
    // `parseInt`, `parseFloat` as values (`valueConverter: parseInt`): functions of the string they are given.
    if ((name === 'parseInt' || name === 'parseFloat') && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && isLibDeclaration(this.resolve(e)?.declarations?.[0])) {
      // The closure takes the parameters its slot gives (`map` passes an index, which parseInt reads as the radix).
      // Without a slot (`static parse = parseInt`), the function's own parameters.
      const slot = (this.checker.getContextualType(e) && this.checker.getNonNullableType(this.checker.getContextualType(e)!).getCallSignatures()[0]) ?? this.checker.getTypeAtLocation(e).getCallSignatures()[0];
      const types = (slot?.getParameters() ?? []).map((p) => {
        const t = this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e);
        return p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.questionToken ? optionalType(t) : t;
      });
      const params = types.map((t, k) => `__p${k}: ${k === 0 ? 'String' : t}`);
      const radix = types.length > 1 ? (types[1].endsWith('?') ? '__p1' : 'Optional(__p1)') : 'nil';
      const body = name === 'parseInt' ? `jsParseInt(__p0, ${radix})` : 'jsParseFloat(__p0)';
      return `{ (${(params.length ? params : ['__p0: String']).join(', ')}) -> Double in ${body} }`;
    }
    // A function declaring `this`, as a value: a method value calling it with the receiver it is given.
    const thisFn = this.thisFunction(e);
    if (thisFn) {
      const params = thisFn.parameters.slice(1);
      const args = params.map((p, k) => this.fromAnyCode(`jsArg(__a, ${k})`, this.paramType(p), true));
      const call = `${this.throwsInfo.fn(thisFn) ? 'try ' : ''}${this.refName(e)}(${['__this', ...args].join(', ')})`;
      const ret = this.returnTypeOf(thisFn);
      return `({ (__this: Any?, __a: [Any?]) throws -> Any? in ${ret === 'Void' ? `${call}; return nil` : `return ${this.convert(call, ret, 'Any?')}`} } as JSMethod)`;
    }
    if (this.isArguments(e)) {
      const fn = ts.findAncestor(e.parent, (n) => ts.isFunctionLike(n) && !ts.isArrowFunction(n)) as ts.SignatureDeclaration | undefined;
      if (!fn || !this.readsArguments(fn) || (ts.isFunctionExpression(fn) && !this.library)) throw this.error(e, '`arguments` of a function expression');
      return '__arguments';
    }
    const moot = this.mootImport(e);
    if (moot) return moot;
    const appNative = this.appNativeOf(e);
    if (appNative) return appNative;
    if (name === 'undefined') return 'nil';
    if (name === 'NaN') return 'Double.nan';
    if (name === 'Infinity') return 'Double.infinity';
    if (name === 'Intl' && isLibDeclaration(this.resolve(e)?.declarations?.[0])) return 'jsIntl';
    if (name === 'globalThis' && this.isGlobalThis(e)) return 'jsGlobalThis';
    const libDecl = this.resolve(e)?.declarations?.[0];
    // Library mode: core's `global` is the program's global object; the Android SDK's namespaces exist only there.
    // A name nothing declares for iOS (`android`, `java`, Node's `__dirname`) is a value whose use throws.
    if (this.library && name === 'global' && (!libDecl || libDecl.getSourceFile().isDeclarationFile)) return 'jsGlobalThis';
    // The runtime gives the bundled app's module its folder in the app bundle.
    if (this.library && name === '__dirname' && (!libDecl || libDecl.getSourceFile().isDeclarationFile)) return 'jsAppDirectory';
    if (this.library && (!libDecl || /[\\/]types-android[\\/]/.test(libDecl.getSourceFile().fileName))) return `jsMoot(${swiftString(name)})`;
    // Library mode: a global a module declares itself (`declare let __startCPUProfiler: any`) is the global object's, set by whatever provides it.
    if (this.library && libDecl && ts.isVariableDeclaration(libDecl) && !libDecl.getSourceFile().isDeclarationFile && hasModifier(libDecl.parent.parent, ts.SyntaxKind.DeclareKeyword)) {
      return this.fromAnyCode(`jsGlobalThis[jsKey: ${swiftString(name)}]`, this.typeOf(e));
    }
    if (name === 'parseFloat' && isLibDeclaration(libDecl) && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) return 'jsParseFloat';
    // `if (!console)`: a compiled program always has its console.
    if (name === 'console' && isLibDeclaration(this.resolve(e)?.declarations?.[0])) return '(true as Any?)';
    const native = this.native.identifier(e);
    if (native) return native;
    const sym = this.resolve(e);
    const required = this.patterns.requiredCore(sym?.valueDeclaration);
    if (required) return `${required}.self`;
    const p = e.parent;
    if (name === 'Application' && sym?.declarations?.some((d) => isCoreDeclaration(d)) && ts.isAsExpression(p)) return 'ApplicationValue.shared';
    // An enum as a value (`Object.entries(Role)`): the object JavaScript makes of it.
    const enumDecl = sym?.valueDeclaration;
    if (enumDecl && ts.isEnumDeclaration(enumDecl) && !enumDecl.getSourceFile().isDeclarationFile && !(ts.isPropertyAccessExpression(p) && p.expression === e)) {
      return `${identPath(this.declaredName(e))}.jsEnumObject`;
    }
    if (sym && sym.flags & ts.SymbolFlags.Class && !(ts.isPropertyAccessExpression(p) && p.expression === e) && !(ts.isNewExpression(p) && p.expression === e)
        && !(ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && p.right === e) && !ts.isHeritageClause(p.parent ?? p)) {
      // An Angular component as a value (`dialog.open(Sheet)`): what creating and rendering it gives.
      const decl = sym.valueDeclaration;
      if (decl && ts.isClassDeclaration(decl) && (ts.getDecorators(decl) ?? []).some((d) => /^Component\(/.test(d.expression.getText()))) {
        return `ComponentFactory { ${this.initThrows(ident(this.declaredName(e))) ? 'try! ' : ''}${ident(this.declaredName(e))}().render() }`;
      }
      return `${identPath(this.declaredName(e))}.self`;
    }
    if (this.isNamespace(e)) return `${this.refName(e)}.self`;
    return this.narrowed(e, this.globalAlias(e) ?? this.refName(e));
  }

  /** A name imported from a module a compiled app has no use for (library mode): a value whose use throws. */
  private mootImport(e: ts.Identifier): string | null {
    if (!this.library?.isMoot) return null;
    const local = this.checker.getSymbolAtLocation(e);
    const decl = local?.declarations?.[0];
    const imported = decl && ts.findAncestor(decl, ts.isImportDeclaration);
    const module = imported && this.checker.getSymbolAtLocation(imported.moduleSpecifier)?.valueDeclaration;
    if (!module || !this.library.isMoot(module.getSourceFile().fileName)) return null;
    const name = ts.isImportSpecifier(decl) ? (decl.propertyName ?? decl.name).text : ts.isNamespaceImport(decl) ? '*' : 'default';
    return this.library.counterpart?.(module.getSourceFile().fileName, name) ?? `jsMoot(${swiftString(e.text)})`;
  }

  /** Whether an expression names a namespace the program declares (its enum, used as a value). */
  private isNamespace(e: ts.Expression): boolean {
    const sym = this.resolve(ts.isPropertyAccessExpression(e) ? e.name : e);
    const d = sym?.valueDeclaration;
    return !!d && ts.isModuleDeclaration(d) && !d.getSourceFile().isDeclarationFile;
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
  topName(decl: ts.Node, name: string): string {
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
      const library = !!this.library?.moduleName(sf.fileName);
      for (const st of sf.statements) {
        if ((ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) add(st.name.text, st);
        if (ts.isModuleDeclaration(st) && ts.isIdentifier(st.name) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) add(st.name.text, st);
        // Library mode: an interface becomes a class of its name, so it shares the namespace with the classes.
        if (library && (ts.isInterfaceDeclaration(st) || (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)))) add(st.name.text, st);
        if (library) continue;
        if (ts.isFunctionDeclaration(st) && st.name) add(st.name.text, st);
        if (ts.isVariableStatement(st) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) add(d.name.text, d);
      }
    }
    this.renamedTop = new Map();
    for (const [name, list] of byName) {
      // A plugin class named as a NativeScriptKit class (one extending core's `Observable`) takes its module's name too.
      const kitClash = list.some((x) => ts.isClassDeclaration(x.decl)) && (this.library ? this.core.declares(name) : this.core.has(name));
      // A generated class and a hand-ported one of the same name: the hand port of that module has to go first.
      if (kitClash && list.some((x) => this.library?.moduleName(x.file.fileName))) this.kitClashes.push(name);
      // A type the hand-written kit declares for itself (Signals' `Source`): the generated one takes its module's name.
      const internalClash = !!this.library?.internalTypes?.has(name);
      if (list.length < 2 && !kitClash && !internalClash) continue;
      // The app's first declaration keeps its name; the others take their module's.
      // Library mode: a class keeps its name over an interface of the same name, as it is the public API.
      const keep = kitClash || internalClash ? undefined : (this.library && list.find((x) => ts.isClassDeclaration(x.decl))) || list.find((x) => !this.pluginFiles.has(x.file.fileName)) || list[0];
      for (const x of list) {
        if (x === keep) continue;
        const module = x.file.fileName.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/\W/g, '_');
        this.renamedTop.set(x.decl, `${name}__${module}`);
        // Every declaration of an overloaded function names the same Swift function.
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

  /**
   * A module-level variable read inside a class with a member of the same name
   * (`readonly fruits = fruits`): Swift would resolve the name to the member,
   * so the read goes through a global alias of the variable.
   */
  private globalAlias(e: ts.Identifier): string | null {
    const decl = this.resolve(e)?.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl) || decl.getSourceFile().isDeclarationFile || this.qualifiedDecl(decl, e.text)) return null;
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
      // `x?.m`: the chain reads the optional itself.
      const p = e.parent;
      if ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p) || ts.isCallExpression(p)) && p.expression === e && p.questionDotToken) return code;
      const actual = this.typeOf(e);
      // Narrowed by a test (`value instanceof LinearGradient`): what the test found.
      const held = this.undefinedVars.get(sym)!.replace(/[?!]$/, '');
      if (held !== actual.replace(/[?!]$/, '') && actual !== 'Any?' && this.isObjectRef(e) && /^[A-Z][\w.]*$/.test(held)) return `(${code} as! ${actual.replace(/[?!]$/, '')})`;
      return isOptional(actual) ? code : this.undefinedAs(code, actual);
    }
    const declared = this.declaredTypeOf(e);
    if (!declared) return code;
    const actual = this.typeOf(e);
    // Narrowed to `never` (a branch the checker deems unreachable): the declared value as it is.
    if (declared === actual || actual === 'Any?' || actual === 'Never') return code;
    if (declared === optionalType(actual)) return `${code}!`;
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && this.isObjectRef(e)) return `(${code} as! ${actual})`;
    if (sym && this.checker.getTypeOfSymbol(sym).flags & ts.TypeFlags.TypeParameter) return `(${code} as! ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isPropertyAccessExpression(e) && this.isSelf(e.expression) && this.props.has(e.name.text)) return `self.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e)) return this.namespaceMember(e) ?? `${this.expr(e.expression)}.${this.memberName(e)}`;
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return this.refName(e);
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
    const root = decl && !isWriteTarget(e) ? this.narrowedFrom(decl) : null;
    if (root) return root === 'Any?' ? this.fromAny(this.propertyRead(e), this.typeOf(e)) : `(${this.propertyRead(e)} as! ${this.typeOf(e).replace(/[?!]$/, '')})`;
    return this.propertyRead(e);
  }

  /** Whether a class's source base class (or one above it) implements an interface. */
  private baseImplements(cls: ts.ClassLikeDeclaration, iface: string): boolean {
    for (let c = this.sourceBase(cls); c; c = this.sourceBase(c)) {
      if ((c.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []).some((t) => t.expression.getText() === iface)) return true;
    }
    return false;
  }

  private sourceBase(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  }

  /**
   * Whether a class can conform to an interface's protocol. A method whose
   * untyped parameters the protocol types (`handlerError(error)` for
   * `handlerError(error: Error)`) conforms through a witness of the protocol's
   * signature that calls it; any other difference leaves the protocol out.
   */
  private protocolWitnesses(cls: ts.ClassLikeDeclaration, i: ts.ExpressionWithTypeArguments, out: string[]): boolean {
    const decl = this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration);
    if (!decl || !this.protocols.has(i.expression.getText())) return true;
    const own = (name: string) => {
      for (let c: ts.ClassLikeDeclaration | undefined = cls; c; c = this.sourceBase(c)) {
        const m = c.members.find((x) => x.name?.getText() === name);
        if (m) return m;
      }
    };
    const added: string[] = [];
    for (const req of decl.members) {
      const name = req.name?.getText();
      if (!name) continue;
      const m = own(name);
      // A parameter property or an inherited member the class does not declare: Swift checks it.
      if (!m) continue;
      if (ts.isPropertySignature(req)) {
        const want = req.questionToken ? optionalType(this.typeOf(req)) : this.typeOf(req);
        const have = ts.isGetAccessorDeclaration(m) ? this.narrowedFrom(m) ?? this.returnTypeOf(m) : ts.isPropertyDeclaration(m) ? this.typeOf(m.name) : null;
        if (have !== want) return false;
        continue;
      }
      if (!ts.isMethodSignature(req) || !ts.isMethodDeclaration(m)) return false;
      const want = req.parameters.map((p) => (p.questionToken ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name)));
      const have = m.parameters.map((p) => this.paramType(p));
      const ret = this.returnTypeOf(req), ownRet = this.returnTypeOf(m);
      if (want.length === have.length && want.every((t, k) => t === have[k]) && ret === ownRet) continue;
      if (want.length !== have.length || have.some((t, k) => t !== want[k] && t !== 'Any?') || (ret !== ownRet && !(ret === 'Any?'))) return false;
      if (want.every((t, k) => t === have[k])) return false;
      const args = want.map((_, k) => `__p${k}`);
      const call = `try self.${ident(name)}(${args.map((a, k) => (have[k] === want[k] ? a : `${a} as Any?`)).join(', ')})`;
      const body = ret === 'Void' ? call : ownRet === 'Void' ? `${call}; return nil` : `return ${call}`;
      added.push(`    func ${ident(name)}(${want.map((t, k) => `_ ${args[k]}: ${t}`).join(', ')}) throws${ret === 'Void' ? '' : ` -> ${ret}`} { ${body} }`);
    }
    out.push(...added);
    return true;
  }

  /** The Swift type of the declaration a getter overrides, when the override narrows it; null otherwise. */
  private narrowedFrom(decl: ts.Declaration): string | null {
    if (!ts.isGetAccessorDeclaration(decl) || !ts.isClassLike(decl.parent) || decl.getSourceFile().isDeclarationFile) return null;
    const name = decl.name.getText();
    let root: ts.GetAccessorDeclaration | ts.PropertyDeclaration | null = null;
    for (let cls: ts.ClassLikeDeclaration | undefined = decl.parent; cls; ) {
      const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const base = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      cls = base && ts.isClassLike(base) && !base.getSourceFile().isDeclarationFile ? base : undefined;
      const m = cls?.members.find((x): x is ts.GetAccessorDeclaration | ts.PropertyDeclaration => (ts.isGetAccessorDeclaration(x) || ts.isPropertyDeclaration(x)) && x.name.getText() === name);
      if (m) root = m;
    }
    if (!root) return null;
    const rootType = ts.isGetAccessorDeclaration(root) ? this.returnTypeOf(root) : this.typeOf(root.name);
    return rootType !== this.returnTypeOf(decl) ? rootType : null;
  }

  private propertyRead(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    if (this.isNativeExpando(e)) {
      const t = this.typeOf(e);
      const read = `jsNativeExpando(${this.expr(target)}, ${swiftString(name)})`;
      return t === 'Any?' ? read : this.lenientRef(t) !== t ? `jsImplicit(${read} as? ${t})` : this.fromAnyCode(read, t, true);
    }
    // A dynamic object (an allSettled result, a lookup table): its field read by name, as its type says.
    if (this.typeOf(target).replace(/[?!]$/, '') === 'JSObject' && !e.questionDotToken) return this.fromAnyCode(`jsField(${this.expr(target)}, ${swiftString(name)})`, this.typeOf(e), true);
    if (this.isSelf(target) && this.props.has(name)) return `self.${ident(name)}.value`;
    if (name === 'raw' && this.symbolName(target) === 'TemplateStringsArray') return `jsTemplateRaw(${this.expr(target)})`;
    if (name === 'description' && this.typeOf(target) === 'JSSymbol') return `${this.expr(target)}.jsDescription`;
    // `Cls.name`, `this.name` in a static member and `this.constructor.name` (library mode): the class's name, of the class the code runs for.
    if (name === 'name' && this.library) {
      const cls = this.classValueOf(target);
      if (cls) return `${cls}.jsName`;
    }
    // `ArrayBuffer.prototype`: an object of the class's tag, all a program reads of it.
    if (name === 'prototype' && ts.isIdentifier(target) && ['ArrayBuffer', 'Uint8Array'].includes(target.text) && this.isLibGlobal(target)) return `JS${target.text}.jsPrototype`;
    // `Cls.prototype` (library mode): what script defines there, which the class's instances read.
    if (name === 'prototype' && this.library && this.resolve(target)?.flags! & ts.SymbolFlags.Class) return `JSPrototypes.of(${this.expr(target).replace(/(\.self)?$/, '.self')})`;
    if (name === 'prototype' && this.library && this.typeOf(target).endsWith('.Type')) return `JSPrototypes.of(${this.expr(target)})`;
    // `value.constructor`: its class, which script tests for static members.
    if (name === 'constructor' && this.library && !isWriteTarget(e) && !(ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e && e.parent.name.text === 'name')) return `jsConstructor(${this.coerce(target, 'Any?')})`;
    // `value.constructor.name`: its class's name.
    if (name === 'name' && ts.isPropertyAccessExpression(target) && target.name.text === 'constructor' && !isWriteTarget(e)) return `jsConstructorName(${this.coerce(target.expression, 'Any?')})`;
    // `Function.prototype`: a function that does nothing.
    if (name === 'prototype' && ts.isIdentifier(target) && target.text === 'Function' && isLibDeclaration(this.resolve(target)?.declarations?.[0])) return '({ (_: [Any?]) throws -> Any? in nil } as JSFunction)';
    if (ts.isIdentifier(target) && this.isLibGlobal(target)) {
      const constant = LIB_CONSTANTS[`${target.text}.${name}`];
      if (constant) return constant;
      throw this.error(e, `${target.text}.${name}`);
    }
    // A member of an enum a library declares (core's GestureStateTypes.began): its value.
    const enumMember = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const constant = enumMember && ts.isEnumMember(enumMember) ? this.checker.getConstantValue(enumMember) : undefined;
    // A member named as a Swift keyword (`Specificity.Type`) cannot be written after a dot: its value.
    if (constant !== undefined && (enumMember!.getSourceFile().isDeclarationFile || ident(name) !== name) && !this.native.module(enumMember)) {
      return typeof constant === 'string' ? swiftString(constant) : `Double(${constant})`;
    }
    const maybeChain = e.questionDotToken ? this.maybeUndefined(e) : null;
    if (maybeChain) return this.undefinedAs(maybeChain, this.typeOf(e));
    const core = this.core.property(e);
    if (core) return core;
    if (this.isAddedMember(e)) {
      const t = this.typeOf(e);
      const code = `jsField(${this.expr(target)}, ${swiftString(name)})`;
      return t === 'Any?' ? code : this.undefinedAs(this.fromAny(code, optionalType(t)), t);
    }
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
      const code = `${ts.isOptionalChain(e) && !isWriteTarget(e) ? 'jsGetIfPresent' : 'jsGet'}(${this.expr(target)}, ${swiftString(name)})`;
      // `a?.b?.c`: the chain goes on from what `a?.b` may be, undefined included.
      const p = e.parent;
      const chained = ts.isPropertyAccessExpression(p) && p.expression === e && !!p.questionDotToken && !hasTopLevelArrow(t);
      return t === 'Any?' || isWriteTarget(e) ? code : chained ? `(${this.fromAny(code, optionalType(t))})` : this.fromAny(code, t);
    }
    const base = this.typeOf(target);
    if (base.replace(/\?$/, '').startsWith('JSRecord<')) {
      // A key of a dictionary-typed object: undefined when missing.
      const read = `${this.expr(target)}${base.endsWith('?') ? '?' : ''}[${swiftString(name)}]`;
      const t = this.typeOf(e);
      if (isWriteTarget(e)) return read;
      if (isOptional(t)) return `(${read} ?? nil)`;
      const z = isFunctionType(t) ? null : this.zero(t);
      return z ? `(${read} ?? ${z})` : `${read}!`;
    }
    // A handler typing its event's sender (`args: { object: Canvas }`).
    if (base === 'EventData' && name === 'object' && !isWriteTarget(e)) {
      const t = this.typeOf(e).replace(/\?$/, '');
      if (!['Observable', 'Any'].includes(t) && this.isObjectRef(e)) return `(${this.expr(target)}.object as! ${t})`;
    }
    if (base === 'EventData' && !(this.library ? ['eventName', 'object'] : ['value', 'item', 'eventName', 'object', 'index', 'view', 'type', 'state', 'deltaX', 'deltaY', 'scale', 'rotation', 'direction', 'action', 'scrollX', 'scrollY', 'newValue']).includes(name)) {
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
    if (checked) return this.narrowed(e, `${checked}${dot}${this.memberName(e)}`);
    // `x?.name` on a value Swift has as non-optional: cast to optional, valid for an implicitly unwrapped one too.
    const tt = this.typeOf(target);
    if (e.questionDotToken && tt !== 'Any?' && !tt.endsWith('?') && !tt.endsWith('!') && !hasTopLevelArrow(tt) && !ts.isOptionalChain(target) && !isWriteTarget(e)
        && !(ts.isCallExpression(target) && this.maybeUndefined(target))) {
      const code = `(${this.expr(target)} as ${optionalType(tt)})?.${ident(name)}`;
      // The chain goes on (`a?.b?.c`): it reads the optional.
      if (ts.isOptionalChain(e.parent) && (e.parent as ts.PropertyAccessExpression).expression === e && (e.parent as ts.PropertyAccessExpression).questionDotToken) return code;
      if (ts.isOptionalChain(e.parent) && (e.parent as ts.PropertyAccessExpression).expression === e) return `${this.expr(target)}.${ident(name)}`;
      const rt = this.typeOf(e);
      if (this.optionalReads.has(e) && !rt.endsWith('?') && rt !== 'Any?') { this.optionalReads.set(e, true); return code; }
      return rt.endsWith('?') || rt === 'Any?' ? code : this.undefinedAs(`(${code})`, rt);
    }
    const unwrap = (this.continuesOptional(target) || (ts.isCallExpression(target) && this.maybeUndefined(target))) && !e.questionDotToken;
    return this.narrowed(e, `${this.expr(target)}${unwrap ? '!' : ''}${dot}${this.memberName(e)}`);
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
      // An untyped element the checker narrows (`Array.isArray(xs[0])`): read as the narrowed type.
      const rt = this.typeOf(e);
      if (t === 'JSArray<Any?>' && rt !== 'Any?') return this.fromAny(`(${this.maybeUndefined(e)!} ?? nil)`, rt);
      return this.undefinedAs(this.maybeUndefined(e)!, rt);
    }
    if (t === 'JSMatch') return `${target}${q}[Int(${this.expr(key)})]`;
    if (t === 'JSUint8Array') {
      const code = `${target}${q}[jsIndex: ${this.toNumber(key)}]`;
      return isWriteTarget(e) ? code : this.undefinedAs(code, this.typeOf(e));
    }
    if (t.startsWith('(') && ts.isNumericLiteral(key)) return `${target}.${key.text}`;
    // A tuple at a computed index (`pool[next++ % 5]`): its elements as an array, undefined past them.
    if (t.startsWith('(') && this.checker.isTupleType(this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression))) && !isWriteTarget(e)) {
      const parts = splitTopLevel(t.slice(1, -1));
      const el = parts.every((x) => x === parts[0]) ? parts[0] : 'Any?';
      const tuple = this.fresh('__tuple');
      const read = `{ (${tuple}: ${t}) -> ${optionalType(el)} in JSArray<${el}>([${parts.map((_, k) => `${tuple}.${k}`).join(', ')}]).element(${this.toNumber(key)}) }(${target})`;
      const rt = this.typeOf(e);
      return el === 'Any?' && rt !== 'Any?' ? this.fromAny(`(${read} ?? nil)`, rt) : this.undefinedAs(read, rt);
    }
    // A native array (`view.subviews[0]`): undefined past its end.
    if (/^\[[^:]*\]$/.test(t) && !isWriteTarget(e)) {
      const read = `jsNativeElement(${target}, ${this.toNumber(key)})`;
      const rt = this.typeOf(e);
      if (['String', 'Double', 'Bool'].includes(rt)) return this.undefinedAs(`(${read} as? ${rt})`, rt);
      return rt === 'Any?' ? read : this.fromAny(read, rt);
    }
    if (t.startsWith('JSRecord<')) {
      // A missing key is undefined in JavaScript; its declared type here is the value type.
      const read = `${target}${this.typeOf(e.expression).endsWith('?') ? '?' : ''}[${this.str(key)}]`;
      if (isWriteTarget(e)) return read;
      const vt = this.typeOf(e);
      if (isOptional(vt)) return `(${read} ?? nil)`;
      const z = isFunctionType(vt) ? null : this.zero(vt);
      return z ? `(${read} ?? ${z})` : `${read}!`;
    }
    // `Enum[name]`, `Enum[value]`: the object JavaScript makes of the enum, by key.
    const enumDecl = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (enumDecl && ts.isEnumDeclaration(enumDecl) && !enumDecl.getSourceFile().isDeclarationFile && !ts.isStringLiteral(key) && !isWriteTarget(e)) {
      const rt = this.typeOf(e);
      const code = `${identPath(this.declaredName(e.expression as ts.Identifier))}.jsEnumObject[jsKey: ${this.propertyKey(key)}]`;
      return rt === 'Any?' ? code : this.fromAny(code, rt);
    }
    if (this.typeOf(e.expression) === 'Any?') {
      const code = `jsGet(${target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, rt);
    }
    // A key the type does not declare (`view?.['setIndicator']` on a View): looked up by name, as JavaScript does.
    const declared = !ts.isStringLiteral(key) || !!this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)).getProperty(key.text);
    if (ts.isStringLiteral(key) && declared) return `${target}${q}.${ident(key.text)}`;
    const keyed = ts.isIdentifier(key) && this.typeOf(key) === 'JSSymbol' ? this.checker.getTypeAtLocation(e.expression).getProperties().find((p) => {
      const n = p.valueDeclaration && (p.valueDeclaration as ts.NamedDeclaration).name;
      return !!n && ts.isComputedPropertyName(n) && this.resolve(n.expression) === this.resolve(key);
    }) : undefined;
    if (keyed) return `${target}${q}.__symbol_${(key as ts.Identifier).text}`;
    // `x[Symbol.toStringTag]` on a class declaring it (a field or a getter).
    const tag = ts.isPropertyAccessExpression(key) && key.name.text === 'toStringTag' && ts.isIdentifier(key.expression) && key.expression.text === 'Symbol' && this.isLibGlobal(key.expression);
    if (tag && !isWriteTarget(e) && this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)).getProperties().some((p) => wellKnownMember(p.escapedName.toString()) === 'jsToStringTag')) return `${target}${q}.jsToStringTag`;
    // A computed key on a native object (`view[property]`): its Objective-C property by name, as the runtime reads and writes it.
    const receiverType = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    if (!ts.isStringLiteral(key) && ['String', 'Any?'].includes(this.typeOf(key)) && (this.native.isClassType(receiverType) || this.native.extendsNative(receiverType))) {
      const code = `JSNativeKeyed(${target}${/[?!]$/.test(this.typeOf(e.expression)) ? '!' : ''})[jsKey: ${this.propertyKey(key)}]`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, rt, true);
    }
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
  maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isCallExpression(e) && !this.typeOf(e).endsWith('?')) {
      const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
      if (decl && !ts.isJSDocSignature(decl) && this.mayReturnUndefined(decl) && this.returnTypeOf(decl).endsWith('?')) {
        this.rawOptional.add(e);
        try { return this.expr(e); } finally { this.rawOptional.delete(e); }
      }
    }
    if (ts.isPropertyAccessExpression(e) && !isWriteTarget(e) && this.isAddedMember(e)) {
      const t = this.typeOf(e);
      if (t !== 'Any?' && !isOptional(t)) return this.fromAny(`jsField(${this.expr(e.expression)}, ${swiftString(e.name.text)})`, optionalType(t));
    }
    // `c ? value : null`, checked without strictNullChecks: the value or nothing.
    if (ts.isConditionalExpression(e) && [e.whenTrue, e.whenFalse].some(isNullish) && ![e.whenTrue, e.whenFalse].every(isNullish)) {
      const t = this.typeOf(e);
      if (t !== 'Any?' && t !== 'Void' && !isOptional(t) && !t.endsWith('!')) {
        const branch = (x: ts.Expression) => (isNullish(x) ? 'nil' : this.coerce(x, optionalType(t)));
        return `(${this.cond(e.condition)} ? ${branch(e.whenTrue)} : ${branch(e.whenFalse)})`;
      }
    }
    // `x?.m()` on an untyped value: undefined where x is, whatever its declared result.
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.questionDotToken && this.isAny(e.expression.expression)) {
      const t = this.typeOf(e);
      if (t !== 'Any?' && t !== 'Void' && !isOptional(t)) {
        this.rawOptional.add(e);
        try { return this.fromAny(this.expr(e), optionalType(t)); } finally { this.rawOptional.delete(e); }
      }
    }
    if (ts.isCallExpression(e) && this.libMayBeUndefined(e)) {
      this.rawOptional.add(e);
      try { return this.expr(e); } finally { this.rawOptional.delete(e); }
    }
    // `a?.b() as T`: undefined where the chain stops, whatever the assertion says.
    if (ts.isAsExpression(e) && ts.isOptionalChain(e.expression) && !this.typeOf(e).endsWith('?') && this.isObjectRef(e)) {
      return this.typeOf(e.expression) === 'Any?' ? this.fromAny(this.expr(e.expression), optionalType(this.typeOf(e))) : `(${this.expr(e.expression)} as? ${this.typeOf(e)})`;
    }
    // A key of a dictionary-typed object, read before its type's zero stands in for a missing one.
    if ((ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) && !e.questionDotToken && !isWriteTarget(e)
        && /^JSRecord<.*>$/.test(this.typeOf(e.expression)) && !isOptional(this.typeOf(e))) {
      const key = ts.isPropertyAccessExpression(e) ? swiftString(e.name.text) : this.str(e.argumentExpression);
      return `${this.expr(e.expression)}[${key}]`;
    }
    // `a || undefined`, `a && null`: the left operand or undefined, which a value type cannot hold.
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(e.operatorToken.kind) && isNullish(e.right)) {
      const t = this.typeOf(e);
      const left = this.maybeUndefined(e.left);
      const lt = left ? optionalType(this.typeOf(e.left)) : this.typeOf(e.left);
      if (!isOptional(t) && t !== 'Any?' && t !== 'Void' && (lt === t || lt === optionalType(t))) {
        const v = this.fresh('__v');
        const tr = this.tryPrefix(e.left);
        const [truthy, falsy] = e.operatorToken.kind === ts.SyntaxKind.BarBarToken ? [v, 'nil'] : ['nil', v];
        return `({ () ${tr ? 'throws ' : ''}-> ${optionalType(t)} in let ${v}: ${optionalType(t)} = ${tr}${left ?? this.expr(e.left)}; return jsTruthy(${v} as Any?) ? ${truthy} : ${falsy} }())`;
      }
    }
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/[?!]$/, '') === 'JSUint8Array') {
      return `${this.expr(e.expression)}${e.questionDotToken || this.continuesOptional(e.expression) ? '?' : ''}[jsIndex: ${this.toNumber(e.argumentExpression)}]`;
    }
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '').startsWith('JSArray<')) {
      const q = e.questionDotToken || this.continuesOptional(e.expression) ? '?' : '';
      const code = `${this.expr(e.expression)}${q}.element(${this.toNumber(e.argumentExpression)})`;
      return this.typeOf(e).endsWith('?') || q ? `(${code} ?? nil)` : code;
    }
    if (ts.isIdentifier(e)) {
      const sym = this.resolve(e);
      if (sym && this.undefinedVars.has(sym)) return this.refName(e);
    }
    // `a?.b` of an untyped `a` where the chain goes on (`a?.b?.c`): the optional the chain continues from.
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && this.isAny(e.expression) && !isOptional(this.typeOf(e)) && this.typeOf(e) !== 'Any?' && !this.untypedLinks.has(e)) {
      const p = e.parent;
      this.untypedLinks.add(e);
      try {
        if (ts.isPropertyAccessExpression(p) && p.expression === e && p.questionDotToken) return this.expr(e);
      } finally { this.untypedLinks.delete(e); }
    }
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && !this.typeOf(e.expression).endsWith('?')) {
      const target = this.maybeUndefined(e.expression);
      if (target) return this.native.chainedProperty(e, target) ?? `${target}?.${ident(e.name.text)}`;
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
  undefinedAs(code: string, type: string): string {
    if (isOptional(type)) return code.endsWith('?? nil)') ? code : `(${code} ?? nil)`;
    if (type === 'Double') return `(${code} ?? .nan)`;
    if (type === 'String') return `(${code} ?? "undefined")`;
    if (type === 'Bool') return `(${code} ?? false)`;
    return this.lenient ? `jsImplicit(${code})` : `${code}!`;
  }

  args(e: ts.CallExpression | ts.NewExpression, count?: number): string[] {
    const all = e.arguments ?? ts.factory.createNodeArray();
    const list = count === undefined ? all : all.slice(0, count);
    const sig = this.checker.getResolvedSignature(e);
    // An overload's call is the implementation's in Swift: its parameters take the arguments.
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
        // An app function's rest parameter is one array: the arguments packed, spreads included.
        const rest = this.restType(params[restAt]);
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
      // A method of a generic class, which library mode erases: the parameter's type as the method declares it.
      const erased = this.library && decl && ts.isParameter(decl) && ts.isClassLike(decl.parent.parent) && !!decl.parent.parent.typeParameters?.length && !decl.getSourceFile().isDeclarationFile;
      // In code the checker finds unreachable a parameter's type is never: its declared type.
      const at = this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e);
      // An override emitted with its root's signature (library mode): the parameter as Swift has it.
      const method = this.library && decl && ts.isParameter(decl) && ts.isMethodDeclaration(decl.parent) && !isStatic(decl.parent) && !decl.getSourceFile().isDeclarationFile ? decl.parent : null;
      const emitted = method && this.baseMethod(method) ? this.emittedSignature(method).params[k]?.type.replace(/!$/, '?') : undefined;
      out.push(this.coerce(a, emitted ?? (erased ? this.paramType(decl as ts.ParameterDeclaration) : at === 'Never' ? this.type(this.checker.getTypeOfSymbol(p), e) : at)));
    }
    if (restAt >= 0 && appDeclared && list.length <= restAt) out.push(`${this.restType(params[restAt])}()`);
    // A function declaring `this`, called plainly: its `this` is undefined.
    const own = sig?.getDeclaration();
    const thisParam = own && ts.isFunctionDeclaration(own) ? own.parameters[0] : undefined;
    if (thisParam && ts.isIdentifier(thisParam.name) && thisParam.name.text === 'this' && thisParam.type?.kind !== ts.SyntaxKind.VoidKeyword && ts.isCallExpression(e) && ts.isIdentifier(e.expression)) out.unshift('nil');
    // A function value takes every parameter: the ones JavaScript leaves out are undefined.
    const decl = sig?.getDeclaration();
    const held = ts.isCallExpression(e) && this.isClosureValue(e.expression);
    if ((count === undefined || held) && restAt < 0 && decl && !ts.isJSDocSignature(decl) && (held || ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl) || ts.isArrowFunction(decl) || ts.isFunctionExpression(decl))) {
      for (let k = list.length; k < params.length; k++) {
        const pt = this.type(this.checker.getTypeOfSymbolAtLocation(params[k], e), e);
        out.push(pt === 'Void' ? '()' : 'nil');
      }
    }
    return out;
  }

  /** A callee Swift holds as a closure: a field, variable or parameter of a function type (`on: Events['on']`), not a function or method. */
  private isClosureValue(callee: ts.Expression): boolean {
    const name = ts.isPropertyAccessExpression(callee) ? callee.name : ts.isIdentifier(callee) ? callee : null;
    const d = name && this.resolve(name)?.valueDeclaration;
    return !!d && !d.getSourceFile().isDeclarationFile && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d) || ts.isVariableDeclaration(d) || ts.isParameter(d));
  }

  /** The assignments of a module-level class's static fields whose initializers throw, run in the module's order. */
  private staticInits: string[] | null = null;

  /** Whether a class extends one of the library's error classes, directly or through the program's. */
  private errorBased(cls: ts.ClassLikeDeclaration): boolean {
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (!heritage) return false;
    const base = this.checker.getTypeAtLocation(heritage.expression).getSymbol()?.valueDeclaration;
    if (base && ts.isClassLike(base) && !base.getSourceFile().isDeclarationFile) return this.errorBased(base);
    return !!ERRORS[heritage.expression.getText()];
  }

  /**
   * A member the program's own interface adds to a native class (`interface NSUINavigationBar extends
   * UINavigationBar { gradientLayer?: … }`): kept with the native object, as the runtime keeps what script adds.
   */
  private isNativeExpando(e: ts.PropertyAccessExpression): boolean {
    const d = this.resolve(e.name)?.valueDeclaration;
    if (!d || d.getSourceFile().isDeclarationFile || !(ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) || !ts.isInterfaceDeclaration(d.parent)) return false;
    return (d.parent.heritageClauses ?? []).some((h) => h.types.some((x) => this.native.isClassType(this.checker.getTypeAtLocation(x))));
  }

  /** A program class as a value whose `name` the class declares (`Cls`, `this` in a static member, `this.constructor`), as Swift's metatype; null for anything else. */
  private classValueOf(x: ts.Expression): string | null {
    const generated = (d: ts.Node | undefined) => !!d && ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile && !this.native.extendsNative(d as ts.ClassDeclaration) && !this.errorBased(d as ts.ClassDeclaration) && !!this.library?.moduleName(d.getSourceFile().fileName);
    if (x.kind === ts.SyntaxKind.ThisKeyword) {
      const container = ts.getThisContainer(x, false, false);
      return isStatic(container) && generated(container.parent) ? 'self' : null;
    }
    if (ts.isIdentifier(x)) {
      const sym = this.resolve(x);
      return sym && sym.flags & ts.SymbolFlags.Class && generated(sym.valueDeclaration) ? this.expr(x).replace(/\.self$/, '') : null;
    }
    if (ts.isPropertyAccessExpression(x) && x.name.text === 'constructor' && x.expression.kind === ts.SyntaxKind.ThisKeyword) {
      const container = ts.getThisContainer(x.expression, false, false);
      return !isStatic(container) && ts.isClassLike(container.parent) && generated(container.parent) ? 'type(of: self)' : null;
    }
    return null;
  }

  /** A rest parameter's array type; one typed `any` (`...args: any`) holds an array of anything. */
  private restType(p: ts.Symbol): string {
    const t = this.typeOf((p.valueDeclaration as ts.ParameterDeclaration).name);
    return t === 'Any?' ? 'JSArray<Any?>' : t;
  }

  /** The arguments of a call on an untyped value, after its leading ones: each, or with spreads, all as one list. */
  private untypedArgs(args: readonly ts.Expression[]): string {
    if (args.some(ts.isSpreadElement)) return `, spread: ${this.packed(args, 'JSArray<Any?>')}.storage`;
    return args.map((a) => `, ${this.coerce(a, 'Any?')}`).join('');
  }

  /** Arguments (spreads included) as one `JSArray` of `arrayType`. */
  private packed(items: readonly ts.Expression[], arrayType: string): string {
    const el = arrayType.replace(/^JSArray<(.*)>$/, '$1');
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of items) {
      // A literal spread in place (`f(...[a, b])`) is its elements.
      if (ts.isSpreadElement(x) && ts.isArrayLiteralExpression(x.expression) && !x.expression.elements.some((y) => ts.isSpreadElement(y) || ts.isOmittedExpression(y))) run.push(...x.expression.elements.map((y) => this.coerce(y, el)));
      else if (ts.isSpreadElement(x)) {
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
  private isGlobalThis(e: ts.Node): boolean {
    const sym = this.checker.getSymbolAtLocation(e);
    return !!sym && sym.name === 'globalThis' && !!(sym.flags & ts.SymbolFlags.ValueModule) && (sym.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile);
  }

  /** An injection token's name: a framework class by the name it is declared with (`NativeDialog` is `NativeDialogService`). */
  private tokenName(e: ts.Expression): string {
    const decl = this.resolve(e)?.declarations?.[0];
    return decl && ts.isClassDeclaration(decl) && decl.name && decl.getSourceFile().fileName.startsWith('/__shims__/') ? decl.name.text : e.getText();
  }

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
    // `getWindow<UIWindow>?.()`: the type arguments are only TypeScript's, and a function declaration is always there.
    const declaredFunction = (x: ts.Expression) => ts.isIdentifier(x) && !!this.resolve(x)?.declarations?.some(ts.isFunctionDeclaration);
    if (ts.isExpressionWithTypeArguments(callee) && (!e.questionDotToken || declaredFunction(callee.expression))) return this.call(ts.factory.updateCallExpression(e, callee.expression, callee.typeArguments, e.arguments));
    if (e.questionDotToken && this.isAny(callee)) return `jsCallOptional(${this.expr(callee)}${this.untypedArgs(e.arguments)})`;
    if (ts.isPropertyAccessExpression(callee) && this.declaredOnly(callee)) {
      const o = this.fresh('__o'), key = swiftString(callee.name.text);
      const call = `try jsCallMethod(${[o, key, ...e.arguments.map((a) => this.coerce(a, 'Any?'))].join(', ')})`;
      const value = `({ () throws -> Any? in let ${o}: Any? = ${this.tryPrefix(callee.expression)}${this.coerce(callee.expression, 'Any?')}; return ${e.questionDotToken || callee.questionDotToken ? `jsIsNullish(${callee.questionDotToken ? o : `try jsGet(${o}, ${key})`}) ? nil : ` : ''}${call} }())`;
      const t = this.typeOf(e);
      return t === 'Void' || t === 'Any?' || statementLevel(e) ? value : this.fromAnyCode(value, t, true);
    }
    // `obj.method?.(…)` on a method a declaration file or a class declares: the method is always there, so the call is a plain one.
    const declaredMethod = ts.isPropertyAccessExpression(callee) && this.resolve(callee.name)?.declarations?.some((d) => ((ts.isMethodDeclaration(d) || ts.isMethodSignature(d)) && d.getSourceFile().isDeclarationFile)
      || (ts.isMethodDeclaration(d) && ts.isClassLike(d.parent) && !d.questionToken));
    // A method an instance may be given a property in place of (`Object.defineProperty(this, 'm', …)`): the instance's, when it has one.
    if (this.library && ts.isPropertyAccessExpression(callee) && !this.ownCalls.has(e) && this.instanceKeys().has(this.methodDecl(callee.name) as ts.Node)) {
      if (!this.pure(callee.expression) && callee.expression.kind !== ts.SyntaxKind.ThisKeyword) throw this.error(callee, 'a method an instance can replace, on an object with effects');
      const t = this.typeOf(e);
      this.ownCalls.add(e);
      try {
        const own = this.fresh('__own');
        const args = e.arguments.some(ts.isSpreadElement) ? `${this.packed(e.arguments, 'JSArray<Any?>')}.storage` : `[${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')}]`;
        const ownCall = `try jsCallValue(${own}, this: ${this.coerce(callee.expression, 'Any?')}, optional: ${!!e.questionDotToken || !!callee.questionDotToken}, ${args})`;
        if (t === 'Void') return `({ () throws -> Void in if let ${own} = jsOwnProperty(${this.coerce(callee.expression, 'Any?')}, ${swiftString(callee.name.text)}) { ${ownCall} } else { ${this.tryPrefix(e)}${this.call(e)} } }())`;
        return `({ () throws -> ${t} in if let ${own} = jsOwnProperty(${this.coerce(callee.expression, 'Any?')}, ${swiftString(callee.name.text)}) { return ${t === 'Any?' ? ownCall : this.fromAnyCode(`(${ownCall})`, t, true)} }; return ${this.tryPrefix(e)}${this.call(e)} }())`;
      } finally { this.ownCalls.delete(e); }
    }
    // `callback?.(x)` of a parameter declared present: Swift has it as non-optional, and the call is a plain one.
    const param = ts.isIdentifier(callee) ? this.resolve(callee)?.valueDeclaration : undefined;
    const presentParam = !!param && ts.isParameter(param) && !param.questionToken && !param.initializer && !this.mayBeNull(param) && !nullableTypeNode(param.type) && isFunctionType(this.typeOf(callee));
    if (e.questionDotToken && !presentParam && !this.core.isKitMethod(callee) && !declaredMethod && !declaredFunction(callee)) return `${this.expr(callee)}?(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) return this.globalCall(callee, e);
    const nsMember = ts.isPropertyAccessExpression(callee) ? this.namespaceMember(callee) : null;
    if (nsMember) {
      const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
      const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
      return `${this.narrowed(callee, nsMember)}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
    }
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
      if (owner === 'Injector' && method === 'get' && e.arguments[0] && ts.isIdentifier(e.arguments[0])) return injected(this.tokenName(e.arguments[0]));
      // `http.get<T>(url, options)`: the parsed body read as T.
      if (owner === 'HttpClient' && method === 'get') {
        const value = /^RxObservable<(.*)>$/.exec(this.typeOf(e))?.[1] ?? 'Any?';
        const call = `${this.expr(target)}.get(${this.str(e.arguments[0])}${e.arguments[1] ? `, ${this.coerce(e.arguments[1], 'Any?')}` : ''})`;
        return value === 'Any?' ? call : `${call}.mapValues { (__v: Any?) -> ${value} in ${this.fromAny('__v', value)} }`;
      }
      if ((owner === 'WritableSignal' || owner === 'Signal') && method === 'asReadonly') return this.expr(target);
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      // `Cls.class()`: the class itself.
      if (method === 'class' && !e.arguments.length && this.resolve(target)?.flags! & ts.SymbolFlags.Class && this.resolve(callee.name)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return `${this.expr(target).replace(/\.self$/, '')}.self`;
      // A native enum's value is a number to script: its raw value's digits.
      if (method === 'toString' && !e.arguments.length && this.native.isEnumType(this.typeOf(target).replace(/[?!]$/, ''))) return `String(${this.expr(target)}${/[?!]$/.test(this.typeOf(target)) ? '!' : ''}.rawValue)`;
      // `String.fromCharCode.apply(_, codes)`, `Math.max.apply(_, xs)`: the library function of the list's elements.
      if (method === 'apply' && e.arguments.length === 2 && this.pure(e.arguments[0]) && ts.isPropertyAccessExpression(target) && ts.isIdentifier(target.expression) && this.isLibGlobal(target.expression)) {
        const listed = LIST_APPLIED[`${target.expression.text}.${target.name.text}`];
        if (listed) return `${listed}(${this.coerce(e.arguments[1], 'Any?')})`;
      }
      if (['call', 'apply', 'bind'].includes(method) && isLibDeclaration(this.checker.getResolvedSignature(e)?.getDeclaration()) && functionParts(this.typeOf(target).replace(/^\((.*)\)[?!]$/, '$1'))) return this.functionMethod(method, target, e);
      const core = this.core.call(e) ?? this.native.call(e);
      if (core) return core;
      // A member holding an untyped value (`closedCallback: Function`), called: with the object as `this`.
      if (this.library && !e.questionDotToken && !this.isAny(target) && this.typeOf(callee) === 'Any?' && !this.resolve(callee.name)?.declarations?.some((d) => ts.isMethodDeclaration(d) || ts.isMethodSignature(d))) {
        const call = `${callee.questionDotToken ? 'jsCallMethodIfPresent' : 'jsCallMethod'}(${this.coerce(target, 'Any?')}, ${swiftString(method)}${this.untypedArgs(e.arguments)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Void' ? call : this.fromAny(call, rt);
      }
      if (this.isAny(target)) {
        const code = `${callee.questionDotToken ? 'jsCallMethodIfPresent' : 'jsCallMethod'}(${this.expr(target)}, ${swiftString(method)}${this.untypedArgs(e.arguments)})`;
        // An untyped receiver of a typed interface (`value: IColor` with no protocol): the result as the interface types it.
        const t = this.typeOf(e);
        if (t === 'Any?' || t === 'Void' || this.rawOptional.has(e)) return code;
        return callee.questionDotToken ? this.undefinedAs(this.fromAny(code, optionalType(t)), t) : this.fromAnyCode(code, t, true);
      }
      // A field holding a function untyped (`private _resolve;`): called with the object as `this`.
      const field = this.resolve(callee.name)?.valueDeclaration;
      if (this.typeOf(callee) === 'Any?' && field && (ts.isPropertyDeclaration(field) || ts.isPropertySignature(field) || ts.isParameter(field))) {
        const args = e.arguments.some(ts.isSpreadElement) ? `${this.packed(e.arguments, 'JSArray<Any?>')}.storage` : `[${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')}]`;
        const code = `jsCallValue(${this.expr(callee)}, this: ${this.coerce(target, 'Any?')}, optional: ${!!e.questionDotToken}, ${args})`;
        const t = this.typeOf(e);
        return t === 'Any?' || t === 'Void' ? code : this.fromAnyCode(code, t, true);
      }
      const t = this.typeOf(target).replace(/\?$/, '');
      // `xs?.find(…)` on a value Swift holds as present (a lenient array that starts empty): a plain call.
      const receiverType = this.typeOf(target);
      const q = callee.questionDotToken ? (receiverType.endsWith('?') || receiverType.endsWith('!') || ts.isOptionalChain(target) ? '?' : '') : receiverType.endsWith('?') || (ts.isCallExpression(target) && this.maybeUndefined(target)) ? '!' : '';
      if (method === 'fill' && ts.isNewExpression(target) && ts.isIdentifier(target.expression) && target.expression.text === 'Array' && target.arguments?.length === 1 && e.arguments.length === 1) {
        // `new Array(n).fill(v)`: n copies of v, typed as the array is declared (`const widths: number[] = …`).
        const context = this.checker.getContextualType(e);
        const declared = context ? this.type(context, e) : null;
        const at = t === 'JSArray<Any?>' && declared?.startsWith('JSArray<') ? declared : t;
        return `${at}(Array(repeating: ${this.coerce(e.arguments[0], at.replace(/^JSArray<(.*)>$/, '$1'))}, count: Int(${this.expr(target.arguments[0])})))`;
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
      const plain = `${checked ?? `${this.expr(target)}${q}`}.${ident(method)}${optionalFn ? '!' : ''}(${this.args(e, this.arity(e)).join(', ')})`;
      // An override emitted with its base's signature gives what the base's result type holds.
      const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
      if (decl && ts.isMethodDeclaration(decl) && decl.body && !decl.getSourceFile().isDeclarationFile && !isStatic(decl) && this.baseMethod(decl)) {
        const emitted = this.emittedSignature(decl).ret, own = this.typeOf(e);
        if (emitted !== 'Void' && emitted.replace(/!$/, '') !== own.replace(/!$/, '') && !q) return this.convert(plain, emitted.replace(/!$/, '?'), own);
      }
      return plain;
    }
    if (ts.isElementAccessExpression(callee) && isSymbolIterator(callee.argumentExpression, this.checker) && !e.arguments.length) return this.iteratorCode(callee.expression);
    if (ts.isElementAccessExpression(callee) && this.library && this.setNativeOf(callee.argumentExpression)) {
      // `super[prop.setNative](value)`: the base class's method under the symbol, with this object as `this`.
      const args = `[${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')}]`;
      if (callee.expression.kind === ts.SyntaxKind.SuperKeyword) return `jsCallFound(super.jsSymbolMethod(${this.propertyKey(callee.argumentExpression)}), self, ${args})`;
      return `jsCallMethod(${this.coerce(callee.expression, 'Any?')}, ${this.propertyKey(callee.argumentExpression)}${this.untypedArgs(e.arguments)})`;
    }
    if (ts.isElementAccessExpression(callee)) {
      const property = this.setNativeOf(callee.argumentExpression);
      if (property) return `${this.expr(callee.expression)}.__setNative_${property}(${e.arguments.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    }
    let fn: ts.Expression = callee;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    // `(function () { … })()`: the closure, called.
    if (ts.isFunctionExpression(fn) || ts.isArrowFunction(fn)) return `${this.closure(fn)}(${this.args(e).join(', ')})`;
    // A callee the factory would parenthesize again (`(f as F)(…)`) is called through its own translation.
    if (ts.isParenthesizedExpression(callee) && (ts.isIdentifier(callee.expression) || ts.isPropertyAccessExpression(callee.expression) || ts.isElementAccessExpression(callee.expression) || ts.isCallExpression(callee.expression) || ts.isParenthesizedExpression(callee.expression))) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    // `(value as F)(…)` of an untyped value: called as script calls it, its result read as F gives it.
    if (ts.isParenthesizedExpression(callee) && (ts.isAsExpression(callee.expression) || ts.isTypeAssertionExpression(callee.expression)) && this.isAny(callee.expression.expression)) {
      const code = `jsCall(${[this.expr(callee.expression.expression), ...e.arguments.map((a) => this.coerce(a, 'Any?'))].join(', ')})`;
      const t = this.typeOf(e);
      return t === 'Any?' || t === 'Void' ? code : this.fromAnyCode(code, t, true);
    }
    // `(value as F)(…)`: the value read as the function type, called.
    if (ts.isParenthesizedExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    // `view[setNative](value)` (library mode): the method under that key, called with the object as `this`.
    if (this.library && ts.isElementAccessExpression(callee) && (this.isAny(callee.expression) || this.typeOf(callee) === 'Any?')) {
      return `jsCallMethod(${this.coerce(callee.expression, 'Any?')}, ${this.propertyKey(callee.argumentExpression)}${this.untypedArgs(e.arguments)})`;
    }
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) {
      // A function that may be missing (`handlers.get(key)()`): undefined is not a function.
      const maybe = !isOptional(this.typeOf(callee)) ? this.maybeUndefined(callee) : null;
      return `${maybe ? `jsCallee(${maybe})` : this.expr(callee)}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'call');
  }

  /**
   * `f.call(thisArg, …)`, `f.apply(thisArg, [ … ])` and `f.bind(thisArg, …)` on a typed function value.
   * A Swift closure has no `this` of its own, and a method reference is bound to its object already:
   * the receiver must be that object, or the function one that reads no `this`.
   */
  private functionMethod(method: string, target: ts.Expression, e: ts.CallExpression): string {
    const [thisArg, ...rest] = e.arguments;
    // `const toString = {}.toString; toString.call(x)`: Object.prototype.toString of x.
    const init = ts.isIdentifier(target) ? this.resolve(target)?.valueDeclaration : undefined;
    const source = init && ts.isVariableDeclaration(init) && init.parent.flags & ts.NodeFlags.Const ? init.initializer : undefined;
    if (method === 'call' && source && ts.isPropertyAccessExpression(source) && source.name.text === 'toString' && ((ts.isObjectLiteralExpression(source.expression) && !source.expression.properties.length) || source.expression.getText() === 'Object.prototype')) {
      return `jsObjectToString(${thisArg ? this.coerce(thisArg, 'Any?') : 'nil'})`;
    }
    // A method taken from its object (`const f = obj.method`) stays bound to it in Swift: called with that object, it is the same call.
    if (source && ts.isPropertyAccessExpression(source) && !(thisArg && source.expression.getText() === thisArg.getText())) throw this.error(e, `${method} of a method taken from its object, with another receiver`);
    const plain = (x: ts.Expression): boolean => x.kind === ts.SyntaxKind.ThisKeyword || (ts.isPropertyAccessExpression(x) ? plain(x.expression) : this.pure(x));
    let held: ts.Expression = target;
    while (ts.isParenthesizedExpression(held) || ts.isNonNullExpression(held)) held = held.expression;
    const decl = ts.isPropertyAccessExpression(held) || ts.isIdentifier(held) ? this.resolve(ts.isPropertyAccessExpression(held) ? held.name : held)?.valueDeclaration : undefined;
    const bound = !!decl && (ts.isMethodDeclaration(decl) || ts.isMethodSignature(decl) || (ts.isFunctionDeclaration(decl) && thisNodes(decl).length > 0));
    if (bound) {
      const receiver = ts.isPropertyAccessExpression(held) ? held.expression : null;
      if (!receiver || !thisArg || receiver.getText() !== thisArg.getText() || !plain(thisArg)) throw this.error(e, `${method} with a receiver other than the method's object`);
    } else if (ts.isFunctionExpression(held) && thisNodes(held).length) throw this.error(e, `${method} of a function that reads this`);
    if (thisArg && !plain(thisArg)) throw this.error(thisArg, `${method} with a receiver that has side effects`);
    // A method of the program's own is referred to with the signature Swift emits it with (an override's is its root's).
    const own = decl && ts.isMethodDeclaration(decl) && !decl.getSourceFile().isDeclarationFile && ts.isClassLike(decl.parent) ? this.emittedSignature(decl) : null;
    // Implicitly unwrapped in a signature, optional in a function type.
    const plainOpt = (t: string) => t.replace(/^\((.*)\)!$/, '($1)?').replace(/!$/, '?');
    const type = own ? `(${own.params.map((p) => (isFunctionType(p.type) && !p.type.startsWith('@escaping') ? `@escaping ${p.type}` : plainOpt(p.type))).join(', ')}) throws -> ${plainOpt(own.ret)}` : this.typeOf(target);
    const fn = functionParts(type.replace(/^\((.*)\)[?!]$/, '$1'))!;
    const optional = !own && (isOptional(type) || type.endsWith('!'));
    let items: readonly ts.Expression[] = rest;
    if (method === 'apply') {
      if (rest.length && !ts.isArrayLiteralExpression(rest[0])) {
        // A list known only when it runs (`arguments`, a rest array): each parameter its element, undefined past its end.
        const list = this.fresh('__list');
        const f = `${this.expr(target)}${isOptional(type) || type.endsWith('!') ? '!' : ''}`;
        const call = `${f}(${fn.params.map((p, k) => this.fromAnyCode(`jsArg(${list}.storage, ${k})`, p.replace(/^@escaping /, ''), true)).join(', ')})`;
        return this.convert(`{ (${list}: JSArray<Any?>) throws -> ${fn.result} in try ${call} }(${this.coerce(rest[0], 'JSArray<Any?>')})`, fn.result, this.typeOf(e));
      }
      items = rest.length ? (rest[0] as ts.ArrayLiteralExpression).elements : [];
    }
    if (items.some(ts.isSpreadElement)) throw this.error(e, `${method} with a spread argument`);
    if (items.length > fn.params.length && !items.slice(fn.params.length).every((x) => this.pure(x))) throw this.error(items[fn.params.length], 'an extra argument that has side effects');
    const param = (k: number) => fn.params[k].replace(/^@escaping /, '');
    const given = items.slice(0, fn.params.length).map((x, k) => this.coerce(x, param(k)));
    const f = `${this.expr(target)}${optional && !e.questionDotToken && !ts.isOptionalChain(e) ? '!' : ''}`;
    if (method !== 'bind') {
      const missing = fn.params.slice(given.length).map((p) => (p === 'Void' ? '()' : 'nil'));
      return this.convert(`${f}${e.questionDotToken ? '?' : ''}(${[...given, ...missing].join(', ')})`, fn.result, this.typeOf(e));
    }
    const left = fn.params.slice(given.length);
    const result = left.length === fn.params.length ? f : (() => {
      const captured = given.map((_, k) => `__b${k}`);
      const params = left.map((p, k) => `__p${k}: ${p.replace(/^@escaping /, '')}`);
      const inner = `{ (${params.join(', ')}) throws -> ${fn.result} in try __f(${[...captured, ...left.map((_, k) => `__p${k}`)].join(', ')}) }`;
      return `{ (__f: @escaping ${fn.text}${given.map((_, k) => `, __b${k}: ${param(k)}`).join('')}) -> (${left.join(', ')}) throws -> ${fn.result} in ${inner} }(${[f, ...given].join(', ')})`;
    })();
    const boundType = `(${left.join(', ')}) throws -> ${fn.result}`;
    return this.convert(result, boundType, this.typeOf(e));
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
    // `profile('name', fn)` and the like (library mode): the function itself.
    if (this.library?.identities?.has(callee.text) && e.arguments.length) return this.coerce(e.arguments[e.arguments.length - 1], this.typeOf(e));
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
    if (name === 'inject' && lib) {
      const token = this.tokenName(ts.isExpressionWithTypeArguments(arg(0)) ? arg(0).expression : arg(0));
      if (token === 'NATIVE_DIALOG_DATA') return this.fromAny('NativeDialogRef.current.data', this.typeOf(e));
      return injected(token);
    }
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
      // `Error('x')` constructs as `new Error('x')` does.
      if (ERRORS[name]) return this.errorValue(name, e.arguments);
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve()`;
      if (this.typeOf(arg(0)).startsWith('JSPromise<')) return `${resolvers.name}.resolve(promise: ${this.expr(arg(0))})`;
      return `${resolvers.name}.resolve(${this.coerce(arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
    // A function held untyped (one of several function types): called as script calls it.
    if (this.typeOf(callee) === 'Any?') return `jsCall(${this.expr(callee)}${this.untypedArgs(e.arguments)})`;
    const fn = ts.isIdentifier(callee) ? this.refName(callee) : ident(name);
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
          if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, this.shorthandValue(p));
          else if (ts.isPropertyAssignment(p)) given.set((p.name as ts.Identifier).text, this.expr(p.initializer));
        }
      }
    }
    const args = info.props.map((p) => `${ident(p)}: ${given.get(p) ?? 'nil'}`).join(', ');
    return `kitNavigate { ${component}(${args}).render() }`;
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
      case 'ArrayBuffer': if (method === 'isView') return `JSArrayBuffer.isView(${arg(0) ? this.coerce(arg(0), 'Any?') : 'nil'})`; break;
      case 'console': {
        const fn = ['warn', 'error'].includes(method) ? 'jsError' : 'jsLog';
        if (e.arguments.some(ts.isSpreadElement)) return `${fn}(spread: ${this.packed(e.arguments, 'JSArray<Any?>')}.storage)`;
        return `${fn}(${e.arguments.map((x) => this.coerce(x, 'Any?')).join(', ')})`;
      }
      case 'JSON':
        if (method === 'parse') return `jsJSONParse(${this.expr(arg(0))})`;
        // Undefined, a function or a symbol stringifies to undefined.
        if (method === 'stringify') return this.undefinedAs(`jsJSONStringifyChecked(${this.coerce(arg(0), 'Any?')}${arg(2) ? `, ${this.coerce(arg(2), 'Any?')}` : ''})`, T());
        break;
      case 'Object': {
        // A literal (with spreads) is built as an untyped object whatever record type it has.
        const record = this.typeOf(arg(0)).startsWith('JSRecord<') && !ts.isObjectLiteralExpression(arg(0));
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
        if (method === 'getPrototypeOf') return `(try jsGetPrototypeOf(${this.coerce(arg(0), 'Any?')}))`;
        if (method === 'defineProperties' && ts.isObjectLiteralExpression(arg(1))) return this.defineProperties(arg(0), arg(1) as ts.ObjectLiteralExpression);
        if (method === 'fromEntries') return `jsObjectFromEntries(${this.iterable(arg(0))})`;
        // `Object.create(null)`: the runtime's objects inherit no keys, so an empty one.
        if (method === 'create' && arg(0)?.kind === ts.SyntaxKind.NullKeyword && e.arguments.length === 1) return 'JSObject()';
        if (method === 'defineProperty') {
          const d = arg(2);
          const code = `try jsDefineProperty(${this.coerce(arg(0), 'Any?')}, ${this.propertyKey(arg(1))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' || statementLevel(e) ? code : this.fromAnyCode(code, T(), true);
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
        // `Array.apply(thisArg, list)`: `Array(...list)`, a length when the list is one number.
        if (method === 'apply' && e.arguments.length === 2) {
          const made = `(try jsArrayConstruct(${this.coerce(arg(1), 'JSArray<Any?>')}.storage))`;
          return T() === 'JSArray<Any?>' ? made : this.fromAny(`(${made} as Any?)`, T());
        }
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
          const typed = /^JSArray<JSPromise<(.*)>>$/.exec(this.typeOf(src));
          if (typed) return `JSPromise<${typed[1]}>.${method}(${this.expr(src)})`;
          // An array of untyped values (`const toClose = []`): the dynamic combinator, its result read as TypeScript types it.
          const code = `JSPromise<Any?>.${method}(${this.coerce(src, 'JSArray<Any?>')})`;
          const made = method === 'all' ? 'JSPromise<JSArray<Any?>>' : method === 'allSettled' ? 'JSPromise<JSArray<JSObject>>' : 'JSPromise<Any?>';
          return t === made ? code : method === 'all' ? this.untypedAll(src, t) : this.promiseAs(code, made, t);
        }
        break;
      }
    }
    throw this.error(e, `${owner}.${method}`);
  }

  /**
   * `Object.defineProperties(object, { key: descriptor, … })`, key by key. A field the object's
   * class declares takes the descriptor's value; its attributes (writable, enumerable) are not kept.
   */
  private defineProperties(target: ts.Expression, map: ts.ObjectLiteralExpression): string {
    if (!this.pure(target) && target.kind !== ts.SyntaxKind.ThisKeyword) throw this.error(target, 'Object.defineProperties on an object with effects');
    const type = this.checker.getNonNullableType(this.checker.getTypeAtLocation(target));
    const steps = map.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer) || ts.isComputedPropertyName(p.name)) throw this.error(p, 'a property of Object.defineProperties other than a literal descriptor');
      const key = literalKey(p.name, this.checker) ?? p.name.getText();
      const field = type.getProperty(key)?.valueDeclaration;
      if (field && ts.isPropertyDeclaration(field) && !field.getSourceFile().isDeclarationFile && !this.isAny(target)) {
        const value = p.initializer.properties.find((q): q is ts.PropertyAssignment => ts.isPropertyAssignment(q) && q.name.getText() === 'value');
        return value ? `${this.tryPrefix(value.initializer)}${this.expr(target)}.${ident(key)} = ${this.coerce(value.initializer, this.typeOf(field.name))}` : '';
      }
      return `try jsDefineProperty(${this.coerce(target, 'Any?')}, ${swiftString(key)}, ${this.dynamicObject(p.initializer)})`;
    }).filter(Boolean);
    return `({ () throws -> Any? in ${steps.join('; ')}; return ${this.coerce(target, 'Any?')} }())`;
  }

  /** `Promise.all(values)` of untyped values whose result is typed (`Promise<void[]>`): read as that type when it settles, with no further step. */
  private untypedAll(src: ts.Expression, result: string): string {
    const to = result.replace(/[?!]$/, '').slice(10, -1);
    const value = to === 'JSArray<Void>' ? 'JSArray<Void>(Array(repeating: (), count: __v.count))' : to === 'JSArray<Any?>' ? 'JSArray<Any?>(__v)' : this.fromAny('(JSArray<Any?>(__v) as Any?)', to);
    return `JSPromise<Any?>.all(${this.coerce(src, 'JSArray<Any?>')}, as: { (__v: [Any?]) -> ${to} in ${value} })`;
  }

  /** A promise of untyped values read as a promise of a type (`Promise<any[]>` returned as `Promise<void[]>`): its value converted when it settles. */
  private promiseAs(code: string, from: string, to: string): string {
    const f = from.replace(/[?!]$/, '').slice(10, -1), t = to.replace(/[?!]$/, '').slice(10, -1);
    const value = t === 'JSArray<Void>' ? 'JSArray<Void>(Array(repeating: (), count: Int(jsToNumber(try jsGet(__v as Any?, "length")))))' : t === 'Void' ? '()' : this.fromAny('(__v as Any?)', t);
    return `${code}.then { (__v: ${f}) throws -> ${t} in ${value} }`;
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
            if (ts.isShorthandPropertyAssignment(q)) given.set(q.name.text, this.shorthandValue(q));
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
      sinh: 'Foundation.sinh', cosh: 'Foundation.cosh', tanh: 'Foundation.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround', clz32: 'jsClz32',
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
    const held = this.typeOf(target);
    // Lenient code holds arrays implicitly unwrapped, where `map` and `flatMap` would be Optional's.
    const t = !q && this.lenient && ['map', 'flatMap'].includes(name) && /^JSArray<.*>$/.test(held) ? `(${this.expr(target)} as ${held})` : `${this.expr(target)}${q}`;
    const a = () => this.args(e);
    const el = held.replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1');
    switch (name) {
      case 'push': case 'unshift':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.${name}(contentsOf: ${this.packed(e.arguments, `JSArray<${el}>`)})`;
        return `${t}.${name}(${e.arguments.map((x) => this.coerce(x, el)).join(', ')})`;
      case 'pop': case 'shift': case 'reverse': case 'toString': case 'keys': case 'entries': case 'values': case 'flat': return `${t}.${name}()`;
      case 'toLocaleString': if (!e.arguments.length) return `${t}.toLocaleString()`; break;
      case 'splice':
        if (e.arguments.slice(2).some(ts.isSpreadElement)) return `${t}.splice(${e.arguments.slice(0, 2).map((x) => this.coerce(x, 'Double')).join(', ')}, contentsOf: ${this.packed(e.arguments.slice(2), `JSArray<${el}>`)}.storage)`;
        return `${t}.splice(${[...a().slice(0, 2), ...e.arguments.slice(2).map((x) => this.coerce(x, el))].join(', ')})`;
      case 'fill': return `${t}.fill(${a().join(', ')})`;
      case 'slice': case 'indexOf': case 'lastIndexOf': case 'includes': case 'at': return `${t}.${name}(${a().join(', ')})`;
      case 'join': return `${t}.join(${!e.arguments[0] ? '' : this.isAny(e.arguments[0]) ? `jsJoinSeparator(${this.expr(e.arguments[0])})` : this.expr(e.arguments[0])})`;
      case 'concat':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.concat(spread: ${this.packed(e.arguments, `JSArray<${el}>`)}.storage)`;
        return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.expr(x) : `[${this.coerce(x, el)}]`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap': {
        const callback = e.arguments[0];
        const call = () => {
          if (ts.isIdentifier(callback) && callback.text === 'Boolean' && this.isLibGlobal(callback)) return `${t}.${name}({ (__e: ${el}) -> Bool in jsTruthy(__e) })`;
          const result = this.checker.getTypeAtLocation(callback).getCallSignatures()[0]?.getReturnType();
          // A predicate returning any value (`labels.find((l) => GROUPS[l])`) decides by its truthiness.
          if (['filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'some', 'every'].includes(name) && result && !(result.flags & ts.TypeFlags.BooleanLike)) {
            const arity = ts.isArrowFunction(callback) || ts.isFunctionExpression(callback) ? Math.min(3, callback.parameters.length) : 1;
            const params = ['__e', '__i', '__a'].slice(0, Math.max(1, arity));
            const types = [el, 'Double', `JSArray<${el}>`];
            const throwing = !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) || this.throwsInfo.fn(callback);
            return `${t}.${name}({ (${params.map((p, k) => `${p}: ${types[k]}`).join(', ')}) ${throwing ? 'throws ' : ''}-> Bool in jsTruthy(${throwing ? 'try ' : ''}(${this.fn(callback)})(${params.join(', ')})) })`;
          }
          // A function value taking elements of another Swift type (an untyped array's): each element converted.
          const held = !ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback) ? functionParts(this.functionValueOf(callback)) : null;
          const want = held && name === 'map' ? this.typeOf(e).replace(/^JSArray<(.*)>$/, '$1') : held?.result;
          if (held?.params.length === 1 && (held.params[0] !== el || held.result !== want)) {
            return `${t}.${name}({ (__e: ${el}) throws -> ${want} in ${held.result === 'Void' ? '' : 'return '}${this.convert(`try (${this.expr(callback)})(${this.convert('__e', el, held.params[0])})`, held.result, want!)} })`;
          }
          return `${t}.${name}(${this.fn(callback)})`;
        };
        // A type-guard filter (`(s): s is UIWindowScene => …`): its elements as the guard narrows them.
        const narrowed = name === 'filter' ? /^JSArray<(\w+)>$/.exec(this.typeOf(e))?.[1] : undefined;
        if (narrowed && narrowed !== el && /^\w+$/.test(el)) return `JSArray<${narrowed}>(${this.ignoringThisArg(e, target, call())}.storage.map { $0 as! ${narrowed} })`;
        if (name === 'find' && /^\w+$/.test(el)) {
          const found = this.typeOf(e).replace(/[?!]$/, '');
          if (/^\w+$/.test(found) && found !== el && found !== 'Any') return `(${this.ignoringThisArg(e, target, call())}.map { $0 as! ${found} })`;
        }
        return this.ignoringThisArg(e, target, call());
      }
      case 'sort': return e.arguments[0] ? `${t}.sort(${this.fn(e.arguments[0])})` : `${t}.sort()`;
      case 'reduce': case 'reduceRight': {
        const init = e.arguments[1];
        const callback = e.arguments[0];
        let f = this.fn(callback);
        // A function value typed otherwise than the accumulator and elements: each converted.
        const held = !ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback) ? functionParts(this.functionValueOf(callback)) : null;
        const acc = init ? this.typeOf(e) : el;
        if (held?.params.length === 2 && (held.params[0] !== acc || held.params[1] !== el || held.result !== acc)) {
          f = `{ (__a: ${acc}, __e: ${el}) throws -> ${acc} in ${this.convert(`try (${this.expr(callback)})(${this.convert('__a', acc, held.params[0])}, ${this.convert('__e', el, held.params[1])})`, held.result, acc)} }`;
        }
        return init ? `${t}.${name}(${f}, ${this.coerce(init, this.typeOf(e))})` : `${t}.${name}(${f})`;
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
    return `({ ${this.tryPrefix(thisArg)}${this.exprStatement(thisArg)}; return ${this.tryPrefix(e)}${code} }())`;
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
      case 'split': return first && this.isAny(first) ? `jsSplit(${t}, untyped: ${this.expr(first)}, ${opt(1)})` : `jsSplit(${t}, ${a[0] ?? 'nil'}, ${opt(1)})`;
      case 'indexOf': return `jsIndexOf(${t}, ${a[0]}, ${opt(1)})`;
      case 'lastIndexOf': return `jsLastIndexOf(${t}, ${a[0]})`;
      case 'slice': return `jsSlice(${t}, ${a.join(', ')})`;
      case 'substring': return `jsSubstring(${t}, ${a[0] ?? '0'}, ${opt(1)})`;
      case 'substr': return `jsSubstr(${t}, ${a[0] ?? '0'}, ${opt(1)})`;
      case 'match': return `jsMatch(${t}, jsRegExpFrom(${first ? this.coerce(first, 'Any?') : 'nil'}))`;
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
        // A function value: called with the match, each group (undefined where it took no part), the match's index and the string.
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second)) && this.checker.getTypeAtLocation(second).getCallSignatures().length) {
          if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
          const f = this.typeOf(second) === 'Any?' ? this.expr(second) : this.convert(this.expr(second), this.typeOf(second), 'Any?');
          return `${fn}(${s}, ${r}) { (__m: JSMatch) throws -> String in jsToString(try jsCall(${f}, spread: __m.values.storage.map { $0 as Any? } + [__m.index, __m.input])) }`;
        }
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
        // A handler returning nothing settles the wider promise with undefined.
        const handlerResult = this.checker.getTypeAtLocation(f).getCallSignatures()[0]?.getReturnType();
        const handler = !adopt && handlerResult && handlerResult.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined) && result.endsWith('?')
          ? `{ (__reason: Any?) throws -> ${result} in try (${this.rejectionHandler(f)})(__reason); return nil }`
          : this.rejectionHandler(f);
        return `${t}.${adopt ? 'thenAdopt' : 'then'}(${pass}, ${handler})`;
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
    if (ts.isParenthesizedExpression(e.expression)) return this.newExpr(ts.factory.updateNewExpression(e, e.expression.expression, e.typeArguments, e.arguments));
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
    if (ERRORS[name]) return this.errorValue(name, args);
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    if (name === 'RegExp') return `JSRegExp(${this.str(args[0])}${args[1] ? `, ${this.str(args[1])}` : ''})`;
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${args.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    // `new Object()`: an empty object.
    if (name === 'Object' && this.isLibGlobal(callee as ts.Identifier) && !args.length) return 'JSObject()';
    // `new Number(x)`, `new Boolean(x)`, `new String(x)`: a compiled program makes no wrapper objects; the primitive.
    if (['Number', 'Boolean', 'String'].includes(name) && this.isLibGlobal(callee as ts.Identifier)) {
      const value = args[0] ? this.coerce(args[0], 'Any?') : 'nil';
      const primitive = name === 'Number' ? `jsToNumber(${value})` : name === 'Boolean' ? `jsTruthy(${value})` : args[0] ? `jsToString(${value})` : '""';
      return t === 'Any?' ? `(${primitive} as Any?)` : primitive;
    }
    if (name === 'WeakRef' && this.isLibGlobal(callee as ts.Identifier)) {
      // Where a weak reference to any object is declared (`instance: WeakRef<any>`), made as one.
      const context = this.checker.getContextualType(e);
      const wanted = context ? this.type(context, e).replace(/[?!]$/, '') : '';
      // A reference to a subclass's object where one to the base class's is wanted, made as that.
      const ref = wanted === 'JSWeakRef<AnyObject>' || (/^JSWeakRef<\w+>$/.test(wanted) && this.isSubclassOf(t.slice(10, -1), wanted.slice(10, -1))) ? wanted : t;
      if (ref !== 'JSWeakRef<AnyObject>') return `${ref}(${this.expr(args[0])})`;
      return `${ref}(${this.isAny(args[0]) ? `try jsWeakTarget(${this.expr(args[0])})` : `(${this.coerce(args[0], 'Any?')} as AnyObject)`})`;
    }
    if ((name === 'WeakMap' || name === 'WeakSet') && this.isLibGlobal(callee as ts.Identifier)) return args.length ? `${t}(${this.iterable(args[0])})` : `${t}()`;
    // `new interop.Reference(type, value)`: the type is only the runtime's; a sole argument of `interop.types` is a type too.
    if (t === 'InteropReference') {
      const isType = (x: ts.Expression) => ts.isPropertyAccessExpression(x) && x.expression.getText() === 'interop.types';
      const value = args.length > 1 ? args[1] : args[0] && !isType(args[0]) ? args[0] : undefined;
      return `InteropReference(${value ? this.coerce(value, 'Any?') : ''})`;
    }
    if (name === 'ArrayBuffer' && this.isLibGlobal(callee as ts.Identifier)) return `JSArrayBuffer(${args[0] ? this.toNumber(args[0]) : ''})`;
    if (name === 'Uint8Array' && this.isLibGlobal(callee as ts.Identifier)) {
      const a = args[0];
      if (!a) return 'JSUint8Array(length: 0)';
      const at = this.typeOf(a).replace(/[?!]$/, '');
      if (at === 'Double') return `JSUint8Array(length: ${this.expr(a)})`;
      if (at === 'JSArrayBuffer') return `JSUint8Array(buffer: ${[this.expr(a), ...args.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      if (/^JSArray<.*>$/.test(at)) return `JSUint8Array(${this.coerce(a, 'JSArray<Any?>')}.storage)`;
      return `JSUint8Array.from(${this.coerce(a, 'Any?')})`;
    }
    // `new Array(n)` of a type holding undefined: n holes, each read as undefined.
    if (name === 'Array' && args.length === 1 && !this.isString(args[0]) && /^JSArray<(Any\?|.*\?)>$/.test(t)) return `${t}(Array(repeating: nil, count: Int(${this.toNumber(args[0])})))`;
    if (name === 'Array' && this.isLibGlobal(callee as ts.Identifier)) {
      const el = t.replace(/^JSArray<(.*)>$/, '$1');
      if (args.length !== 1) return `${t}([${args.map((a) => this.coerce(a, el)).join(', ')}])`;
      if (this.typeOf(args[0]) !== 'Double') {
        if (this.typeOf(args[0]) === 'Any?') throw this.error(e, 'new Array of one untyped value (a length or an element)');
        return `${t}([${this.coerce(args[0], el)}])`;
      }
      // n empty slots: a number, string or boolean cannot hold undefined, so its zero stands in until written.
      if (['Double', 'String', 'Bool'].includes(el)) return `${t}(Array(repeating: ${this.zero(el)}, count: Int(${this.expr(args[0])})))`;
      throw this.error(e, `new Array of a length, of ${el} (empty slots need an optional element type)`);
    }
    const core = this.core.construct(e) ?? this.native.construct(e);
    if (core) return core;
    // `new UIEdgeInsets({ top, left, bottom, right })`: the struct from its fields.
    if (this.native.isStructType(t) && args.length === 1 && ts.isObjectLiteralExpression(args[0])) return this.coerce(args[0], t);
    // `new CATransform3D(CATransform3DIdentity)`: a copy of the struct, which a Swift value is.
    if (this.native.isStructType(t) && args.length === 1 && this.typeOf(args[0]) === t) return this.expr(args[0]);
    if (this.native.isStructType(t) && !args.length) return `${t}()`;
    // An untyped constructor (a moot module's class): constructed as script would, which a moot value refuses.
    if (this.typeOf(callee) === 'Any?') return t === 'Any?' ? `(try jsConstruct(${this.expr(callee)}${this.untypedArgs(args)}))` : this.fromAny(`(try jsConstruct(${this.expr(callee)}${this.untypedArgs(args)}))`, t);
    // `new Trace.Writer()`: a namespace's class.
    if (ts.isPropertyAccessExpression(callee) && this.namespaceMember(callee)) return `${t}(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t}(${this.args(e).join(', ')})`;
      if (!args.length) return `${t}()`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'new');
  }

  /** One of the library's error classes, constructed: an AggregateError takes its errors first. */
  private errorValue(name: string, args: readonly ts.Expression[]): string {
    const [first, second] = name === 'AggregateError' ? [args[1], args[0]] : [args[0]];
    const errors = name === 'AggregateError' ? [`errors: ${second ? this.coerce(second, 'JSArray<Any?>') : 'JSArray<Any?>()'}`] : [];
    return `${ERRORS[name]}(${[...errors, ...(first ? [this.str(first)] : [])].join(', ')})`;
  }

  /** `typeof x === 'number'` where Swift knows x's type: decided now (a branch TypeScript narrows to never never runs). */
  private staticTypeof(e: ts.Expression): boolean | undefined {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (!ts.isBinaryExpression(e) || ![ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(e.operatorToken.kind)) return undefined;
    const [t, lit] = ts.isTypeOfExpression(e.left) ? [e.left, e.right] : ts.isTypeOfExpression(e.right) ? [e.right, e.left] : [null, null];
    if (!t || !lit || !ts.isStringLiteral(lit)) return undefined;
    const known = /^"(\w+)"$/.exec(this.typeofExpr(t))?.[1];
    if (!known || this.maybeUndefined(t.expression)) return undefined;
    const same = known === lit.text;
    return e.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken || e.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ? same : !same;
  }

  private typeofExpr(e: ts.TypeOfExpression): string {
    // One of the app's own Swift classes: a class, as NativeScript's runtime exposes it.
    if (this.appNativeOf(e.expression)) return '"function"';
    if (neverDefined(e.expression, this.checker)) return '"undefined"';
    const newer = this.native.introducedAfterDeployment(e.expression);
    if (newer) return `(jsOSAtLeast(${newer}) ? "function" : "undefined")`;
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Void') return '"undefined"';
    const known = base === 'Double' ? 'number' : base === 'String' ? 'string' : base === 'Bool' ? 'boolean' : base === 'JSSymbol' ? 'symbol' : base === 'JSBigInt' ? 'bigint' : base.includes('->') ? 'function' : base === 'Any' ? null : 'object';
    const generic = this.checker.getTypeAtLocation(e.expression).flags & ts.TypeFlags.TypeParameter;
    if (t === 'Any?' || !known || generic) return `jsTypeof(${this.expr(e.expression)})`;
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
      case K.PlusPlusToken: case K.MinusMinusToken: {
        const member = this.untypedMember(e.operand);
        const step = e.operator === K.PlusPlusToken ? '+' : '-';
        if (member) return `jsToNumber(${this.untypedUpdate(member, `jsToNumber(__old) ${step} 1`)})`;
        return `${step === '+' ? 'jsPreIncrement' : 'jsPreDecrement'}(&${this.lvalue(e.operand)})`;
      }
    }
    throw this.error(e, 'prefix operator');
  }

  /** A member of an untyped object as an update's target: the object and the key, each evaluated once. */
  private untypedMember(x: ts.Expression): { object: string; key: string } | null {
    while (ts.isParenthesizedExpression(x)) x = x.expression;
    if (ts.isPropertyAccessExpression(x) && (this.isAny(x.expression) || this.isExpando(x))) return { object: this.expr(x.expression), key: swiftString(x.name.text) };
    if (ts.isElementAccessExpression(x) && this.isAny(x.expression)) return { object: this.expr(x.expression), key: this.propertyKey(x.argumentExpression) };
    return null;
  }

  /** `o.k op= v` on an untyped object: `value` makes the new value of the old one (`__old`). */
  private untypedUpdate(member: { object: string; key: string }, value: string): string {
    return `jsUpdate(${member.object}, ${member.key}) { (__old: Any?) throws -> Any? in try ${value} }`;
  }

  /** `left = right` (also the assignment `??=` and `||=` make). */
  private assignment(e: ts.BinaryExpression): string {
    const left = e.left, right = e.right;
    if (ts.isPropertyAccessExpression(left) && this.symbolName(left.expression) === 'VueRef' && left.name.text === 'value') return `${this.lvalue(left)} = ${this.signalWrite(left.expression, right, this.typeOf(left))}`;
    if (ts.isArrayLiteralExpression(left)) throw this.error(left, 'a destructuring assignment');
    if (ts.isPropertyAccessExpression(left) && this.isAddedMember(left)) return `(${this.expr(left.expression)} as JSDynamic)[jsKey: ${swiftString(left.name.text)}] = ${this.coerce(right, 'Any?')}`;
    if (ts.isPropertyAccessExpression(left) && this.isNativeExpando(left)) return `jsSetNativeExpando(${this.expr(left.expression)}, ${swiftString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isPropertyAccessExpression(left) && this.isExpando(left)) return `jsSet(${this.expr(left.expression)}, ${swiftString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isPropertyAccessExpression(left)) {
      const special = this.core.assign(left, right) ?? this.native.assign(left, right);
      if (special) return special;
    }
    if (ts.isPropertyAccessExpression(left) && this.isAny(left.expression)) return `jsSet(${this.expr(left.expression)}, ${swiftString(left.name.text)}, ${this.coerce(right, 'Any?')})`;
    // An array written at a key that may be no index (`frames[time]`, time untyped): as script writes it.
    if (ts.isElementAccessExpression(left) && this.typeOf(left.expression).replace(/[?!]$/, '').startsWith('JSArray<') && this.typeOf(left.argumentExpression) !== 'Double') return `try jsSet(${this.expr(left.expression)}, ${this.propertyKey(left.argumentExpression)}, ${this.coerce(right, 'Any?')})`;
    if (ts.isElementAccessExpression(left) && this.isAny(left.expression)) return `jsSet(${this.expr(left.expression)}, ${this.propertyKey(left.argumentExpression)}, ${this.coerce(right, 'Any?')})`;
    if (this.library && this.holdsMethods(left) && this.carriesMethod(right)) return `${this.lvalue(left)} = ${this.expr(right)}`;
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
    const member = this.untypedMember(e.left);
    if (member) {
      const n = (x: string) => `jsToNumber(${x})`;
      const arithmetic: Partial<Record<ts.SyntaxKind, (old: string, v: string) => string>> = {
        [K.PlusEqualsToken]: (o) => `jsAdd(${o}, ${this.coerce(e.right, 'Any?')})`,
        [K.MinusEqualsToken]: (o, v) => `${n(o)} - ${v}`, [K.AsteriskEqualsToken]: (o, v) => `${n(o)} * ${v}`, [K.SlashEqualsToken]: (o, v) => `${n(o)} / ${v}`,
        [K.PercentEqualsToken]: (o, v) => `jsMod(${n(o)}, ${v})`, [K.AsteriskAsteriskEqualsToken]: (o, v) => `jsPow(${n(o)}, ${v})`,
      };
      for (const [k, b] of Object.entries(compound)) arithmetic[+k as ts.SyntaxKind] = (o, v) => `${bit[b!]}(${n(o)}, ${v})`;
      const make = arithmetic[op];
      if (make) return this.untypedUpdate(member, make('__old', op === K.PlusEqualsToken ? '' : this.toNumber(e.right)));
      if (op === K.BarBarEqualsToken || op === K.AmpersandAmpersandEqualsToken) {
        return `if ${op === K.BarBarEqualsToken ? '!' : ''}jsTruthy(${this.tryPrefix(e.left)}${l()}) { ${this.tryPrefix(e)}${this.assignment(e)} }`;
      }
    }
    if (compound[op]) {
      const value = `${bit[compound[op]!]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      // `options |= UIMenuOptions.Destructive` on a native option set: the set of the combined raw value.
      const lt = this.declaredTypeOf(e.left) ?? this.typeOf(e.left);
      return `${target()} = ${this.native.isEnumType(lt.replace(/\?$/, '')) ? this.native.enumFromNumber(value, lt) : value}`;
    }
    // A number variable lenient code may read before it is assigned (held optional): the operation on what it holds, NaN when undefined.
    const arithmetic: Partial<Record<ts.SyntaxKind, string>> = { [K.PlusEqualsToken]: '+', [K.MinusEqualsToken]: '-', [K.AsteriskEqualsToken]: '*', [K.SlashEqualsToken]: '/' };
    const held = ts.isIdentifier(e.left) ? this.resolve(e.left) : undefined;
    if (arithmetic[op] && held && this.undefinedVars.get(held) === 'Double?' && !this.isString(e.right)) return `${target()} = (${target()} ?? .nan) ${arithmetic[op]} ${this.toNumber(e.right)}`;
    switch (op) {
      case K.EqualsToken: return this.assignment(e);
      // An untyped variable holds whatever the operation gives: a string, or a number.
      case K.PlusEqualsToken:
        if (this.isAny(e.left)) return `${target()} = jsAdd(${l()}, ${this.coerce(e.right, 'Any?')})`;
        return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} - ${this.toNumber(e.right)}` : `${target()} -= ${this.toNumber(e.right)}`;
      case K.AsteriskEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} * ${this.toNumber(e.right)}` : `${target()} *= ${this.toNumber(e.right)}`;
      case K.SlashEqualsToken: return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} / ${this.toNumber(e.right)}` : `${target()} /= ${this.toNumber(e.right)}`;
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
        // TypeScript types `s ?? 1` as the string `s` is declared; a missing `s` gives the fallback as a string.
        if (maybe) return `(${maybe} ?? ${t === 'String' && this.typeOf(e.right) !== 'String' ? this.str(e.right) : this.coerce(e.right, t)})`;
        if (this.isAny(e.left)) return `jsNullishCoalesce(${l()}, ${this.coerce(e.right, 'Any?')})`;
        return `(${l()} ?? ${this.coerce(e.right, t)})`;
      }
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        const orUndefined = isNullish(e.right) ? this.maybeUndefined(e) : null;
        if (orUndefined) return this.undefinedAs(orUndefined, this.typeOf(e));
        if (this.isBool(e.left) && this.isBool(e.right)) return `${l()} ${sym} ${r()}`;
        // JavaScript returns an operand, not a Bool.
        const t = this.typeOf(e);
        const v = this.fresh('__v');
        const right = this.coerce(e.right, t);
        const lt = this.tryPrefix(e.left) ? 'try ' : '';
        const rt = this.tryPrefix(e.right) ? 'try ' : '';
        const throws = lt || rt ? 'throws ' : '';
        // `a?.b || x`: the chain's undefined is falsy here, not the string or number it would convert to elsewhere.
        let inner = e.left;
        while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
        const chain = op === K.BarBarToken && ts.isPropertyAccessExpression(inner) && !!inner.questionDotToken;
        if (chain) this.optionalReads.set(inner, false);
        // A call that may give undefined (lenient code): the operand is the optional itself, falsy when missing.
        const missing = (ts.isCallExpression(inner) || ts.isElementAccessExpression(inner) || ts.isIdentifier(inner)) && !isOptional(this.typeOf(e.left)) ? this.maybeUndefined(inner) : null;
        const leftCode = missing ?? this.expr(e.left);
        const leftType = missing || this.optionalReads.get(inner) ? optionalType(this.typeOf(e.left)) : this.typeOf(e.left);
        this.optionalReads.delete(inner);
        // The left operand is evaluated once; the result is it, unwrapped or boxed as the result's type needs.
        // A falsy left operand of another type is undefined or null where the result is optional.
        const leftValue = leftType === t && !t.endsWith('?') && t !== 'Void' ? `jsPresent(${v})` : leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? `${v}!` : leftType === 'Any?' ? this.fromAny(v, t) : t === 'Bool' ? `jsTruthy(${v})`
          : t.endsWith('?') && leftType.endsWith('?') && op === K.AmpersandAmpersandToken ? 'nil' : v;
        // Lenient code: `a && a.b` where a is an object and the result is not: a falsy a is undefined, read as the result's type reads it.
        if (this.lenient && op === K.AmpersandAmpersandToken && leftValue === v && leftType.replace(/[?!]$/, '') !== t.replace(/[?!]$/, '') && t !== 'Any?') {
          const z = this.zero(t);
          if (z) return `({ () ${throws}-> ${t} in let ${v} = ${lt}${leftCode}; return jsTruthy(${v}) ? ${rt}${right} : ${z} }())`;
          if (this.lenientRef(t) !== t) return `jsImplicit(({ () ${throws}-> ${optionalType(t)} in let ${v} = ${lt}${leftCode}; return jsTruthy(${v}) ? ${rt}${right} : nil }()))`;
        }
        return op === K.BarBarToken
          ? `({ () ${throws}-> ${t} in let ${v} = ${lt}${leftCode}; return jsTruthy(${v}) ? ${leftValue} : ${rt}${right} }())`
          : `({ () ${throws}-> ${t} in let ${v} = ${lt}${leftCode}; return jsTruthy(${v}) ? ${rt}${right} : ${leftValue} }())`;
      }
      case K.InstanceOfKeyword: {
        const name = e.right.getText();
        // A compiled program makes no String, Number or Boolean wrapper objects.
        if (['String', 'Number', 'Boolean'].includes(name) && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) return `({ _ = ${this.coerce(e.left, 'Any?')}; return false }())`;
        // The library's classes: the runtime's type of any of their instances (a promise of any result).
        const builtin = BUILTIN_CLASSES[name];
        if (builtin && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) return `(${l()} is ${builtin})`;
        return `(${l()} is ${ERRORS[name] ?? this.typeOf(e.right).replace(/^typeof /, '').replace(/\.Type$/, '') ?? name})`;
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
    // Two typed function values: the same function when they hold the same closure.
    if (!isNullish(a) && !isNullish(b) && (isFunctionType(lt.replace(/^\((.*)\)[?!]$/, '$1')) || isFunctionType(rt.replace(/^\((.*)\)[?!]$/, '$1')))) {
      return `${negate ? '!' : ''}jsSameFunction(${this.expr(a)}, ${this.expr(b)})`;
    }
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
    // Swift's comparisons do not associate: an operand that is one is parenthesized (`flag !== n > 0`).
    const K2 = ts.SyntaxKind;
    const compared = (x: ts.Expression) => (ts.isBinaryExpression(x) && x.operatorToken.kind >= K2.LessThanToken && x.operatorToken.kind <= K2.ExclamationEqualsEqualsToken ? `(${this.expr(x)})` : this.expr(x));
    return `${compared(a)} ${negate ? '!=' : '=='} ${compared(b)}`;
  }

  private array(e: ts.ArrayLiteralExpression, want?: string): string {
    // `[]` alone is never[]; its element type comes from where it goes.
    const context = this.checker.getContextualType(e);
    let t = want ?? this.typeOf(e);
    if (!want && context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))) {
      const full = this.type(context, e);
      const c = full.replace(/\?$/, '');
      // A spread's length is known only when it runs: no tuple.
      if (full !== 'Any?' && (c.startsWith('JSArray<') || (c.startsWith('(') && !e.elements.some(ts.isSpreadElement)) || !e.elements.length)) t = c;
      // Where an array or other kinds of value go (`data: Selector[][] | string`): that array.
      const arrays = context.isUnion() ? context.types.filter((u) => this.checker.isArrayType(u)) : [];
      if (full === 'Any?' && arrays.length === 1) t = this.type(arrays[0], e);
    }
    if (t === 'JSArray<Void>') t = 'JSArray<Any?>';
    if (t === 'Any?' || t === 'JSArray<Never>') t = 'JSArray<Any?>';
    if (t.startsWith('(')) {
      const types = want ? splitTopLevel(t.slice(1, -1)) : [];
      return `(${e.elements.map((x, k) => (types[k] ? this.coerce(x, types[k]) : this.expr(x))).join(', ')})`;
    }
    const el = t.replace(/^JSArray<(.*)>$/, '$1');
    if (!e.elements.length) return `${t}()`;
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        // The spread's elements as this array's (`[name, ...untyped]` into a `string[]`).
        const from = this.elementTypeOf(x.expression);
        parts.push(from !== el && from === 'Any?' ? `Array(${this.iterable(x.expression)}).map { ${this.fromAny('$0', el)} }` : `Array(${this.iterable(x.expression)})`);
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
    const literalClass = this.library ? this.literalClassOf(e) : null;
    if (literalClass) return this.classLiteral(e, literalClass);
    const name = this.type(this.checker.getNonNullableType(type), e).replace(/\?$/, '');
    if (name.startsWith('JSRecord<')) {
      const v = name.replace(/^JSRecord<(.*)>$/, '$1');
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `(${ts.isComputedPropertyName(p.name) ? this.propertyKey(p.name.expression) : swiftString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${this.coerce(p.initializer, v)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `(${swiftString(p.name.text)}, ${this.shorthandValue(p)})`;
        throw this.error(p, 'this member in a dictionary literal');
      });
      return entries.length ? `${name}([${entries.join(', ')}])` : `${name}()`;
    }
    // Library mode: an event's literal is core's EventData over it, its other keys read by name.
    if (name === 'EventData' && this.library) return `EventData(jsObject: ${this.dynamicObject(e)})`;
    if (name === 'Any?' || name === 'Any' || name === 'Never' || name === 'EventData' || name === 'JSObject') return this.dynamicObject(e);
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
    else if (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl))) order = this.interfaceFields(decl.members);
    else throw this.error(e, `an object literal of type ${name}`);
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
      } else if (ts.isShorthandPropertyAssignment(p)) {
        const held = this.checker.getShorthandAssignmentValueSymbol(p);
        const fn = (held && held.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(held) : held)?.valueDeclaration;
        const code = fn && (ts.isClassDeclaration(fn) || ts.isModuleDeclaration(fn)) ? `${identPath(this.topNames().get(fn) ?? p.name.text)}.self` : this.narrowed(p.name, this.shorthandValue(p));
        const want = order.find((f) => f.name === p.name.text)?.type;
        const actual = fn && ts.isFunctionDeclaration(fn) ? this.functionValueType(fn) : null;
        given.set(p.name.text, actual && want && functionParts(want) && actual !== want ? this.convert(code, actual, want) : code);
      }
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
    // A spread of a typed object copies its keys in the order that object holds them, known when it runs.
    const spreads = e.properties.filter(ts.isSpreadAssignment).filter((p) => !this.isAny(p.expression) && this.pure(p.expression));
    const parts = e.properties.map((p) => ts.isSpreadAssignment(p) ? `((${this.expr(p.expression)}) as? JSDynamic)?.jsKeys ?? []` : `[${p.name ? swiftString(literalKey(p.name, this.checker) ?? p.name.getText()) : ''}]`);
    const reorder = spreads.length
      ? `, jsOrder: jsLiteralKeyOrder([${parts.join(', ')}], fields: [${order.map((f) => swiftString(f.name)).join(', ')}])`
      : inOrder.join() !== declared.join() ? `, jsOrder: [${inOrder.map(swiftString).join(', ')}]` : '';
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
      if (ts.isMethodDeclaration(p)) {
        const own = p.parameters.filter((q) => !(ts.isIdentifier(q.name) && q.name.text === 'this'));
        return { code: this.closure(p as unknown as ts.FunctionExpression), type: `(${own.map((q) => this.typeOf(q.name)).join(', ')}) throws -> ${this.returnTypeOf(p)}`, params: own.length };
      }
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
    // A `this` parameter is no argument.
    const own = p.parameters.filter((q) => !(ts.isIdentifier(q.name) && q.name.text === 'this'));
    const type = `(${own.map((q) => this.typeOf(q.name)).join(', ')}) throws -> ${ret}`;
    if (!thisNodes(p).length) return this.boxFunction(`{ (${this.params(p, true)}) throws -> ${ret} in${this.functionBody(p, ret, this.indent).slice(1)}`, type, own.findIndex((q) => q.dotDotDotToken));
    const fn = functionParts(type)!;
    const binds = fn.params.map((t, k) => `let ${ident((own[k].name as ts.Identifier).text)}: ${t} = ${own[k].dotDotDotToken ? `${t}(__a.dropFirst(${k}).map { ${this.fromAnyCode('$0', t.replace(/^JSArray<(.*)>$/, '$1'), true)} })` : this.fromAnyCode(`jsArg(__a, ${k})`, t, true)}`);
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
  nextStep: (item, iterator, type, otherwise, i, current) => [`${i}guard try ${iterator}.jsAdvance() else { ${otherwise} }`, `${i}let ${item}: ${type} = ${current ?? `${iterator}.jsCurrent`}`],
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
  'Symbol.toStringTag': 'JSSymbol.toStringTag', 'Symbol.hasInstance': 'JSSymbol.hasInstance', 'Object.prototype': 'JSPrototypes.objectPrototype',
  'Date.now': '({ () throws -> Double in JSDate.now() } as () throws -> Double)',
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

/** A type written with `| null` or `| undefined`, which code checked without strictNullChecks types without them. */
function nullableTypeNode(t: ts.TypeNode | undefined): boolean {
  return !!t && ts.isUnionTypeNode(t) && t.types.some((x) => x.kind === ts.SyntaxKind.UndefinedKeyword || (ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword));
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
    // Reading a field is allowed while fields are still being set; a method call or `this` as a value is not.
    const fieldRead = ts.isPropertyAccessExpression(n.parent) && n.parent.expression === n && !(ts.isCallExpression(n.parent.parent) && n.parent.parent.expression === n.parent);
    if (n.kind === ts.SyntaxKind.ThisKeyword && (inFunction || !fieldRead)) { found = true; return; }
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
