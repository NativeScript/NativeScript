import type { SourceLines } from './source-lines.ts';
import ts from 'typescript';
import { dirname as pathDirname, resolve as pathResolve } from 'node:path';
import { AsyncLowering, usedBefore, type AsyncCtx, type AsyncSyntax, type AsyncTranslator } from './async.ts';
import { isAsync, isStatic } from './throws.ts';
import { assignedMembers } from './sharing.ts';
import { assignedValues, openSpreadType, spreadsArrays, definitelyAssignedFields, forwardedSetter, initializedNull, intersectionAliasMembers, isRegExpProtocol, assertedPattern, unsupportedPattern, intlConstructor, isObjectToStringCall, isStringRaw, redeclaredBeside, iteratedType, iterationThrows, literalKey, neverDefined, templateParts, wellKnownMember, WELL_KNOWN_MEMBERS, ignoresThisArg, implementedInterfaces, undeclaredMemberOf, classesGivenUndeclaredMembers, classesHeldUntyped, type TrustScope, literalPattern, patternGroups, unsetGroupTyping, type UnsetGroupTyping, keysDefinedUntyped, KOTLIN_NATIVE_TYPES, runtimeTypeName, definesRunTimeKey, readKeyOf, reassigned, givenBy, onlyNullOrPresent, statementLevel, readWrite, asOperation, type ReadWrite } from './lang.ts';
import { memberName } from './stable-names.ts';
import { shadowConversions } from './conversion-shadow.ts';
import { parseNativeType, type Mark, type Value } from './conversion.ts';
import { argumentSlot, awaitSlot, conditionCell, type ConditionBackend, negatedCell, type AwaitSlot, isEnumObject, place, resultSlot, returnCell, type ParamSlot, type PlacementBackend, type ResultSlot, type ReturnBackend, type ReturnCell, type Store, type StoreSlot, assignedTo, codeStoreSlot, placeCode, storeSlot, emptyComparison, observerSlot, scriptComparison, type ElementStore, elementStoreOf, bindingSlot } from './placement.ts';
import { convertedRead, onlyNull, ValueStates, type StateBackend, type NulledRead } from './value-states.ts';
import type { Form } from './forms.ts';
import { isCoreDeclaration } from './core.ts';
import { nonVirtualName } from './swift.ts';
import type { Properties } from './properties.ts';
import { type Held, holdsNil, isFunctionHeld, keyOf, nilIsNull, notedField, notesNull, type Nulls, nullNames, rootKeepsExpando, literalNotes, type ShapeFacts, type ShapePlan, shapePlanOfClass, shapePlanOfLiteral, spelledOptional } from './shapes.ts';
import { shadowLiteral, shadowShapes } from './shape-shadow.ts';
import { shadowTypeSteps } from './type-step-shadow.ts';
import { type TypeStep, boxStep, unboxStep } from './type-step.ts';
import { recognizePatterns, type Patterns } from './patterns.ts';
import type { Reach } from './reach.ts';
import { awaitedCell, receiverCell, receiverSlot, type ReceiverBackend, type ReceiverCell } from './placement.ts';
import { allowedDeprecation, calledOnAnyThread } from './android-deprecations.ts';
import type { ModuleThread } from './threading.ts';

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

/** Whether code's parentheses balance with none closing before its end (`a(b) ?: c` splits, `(a ?: b)` does not). */
function wrapsWhole(code: string): boolean {
  let depth = 0;
  for (const ch of code) {
    if (ch === '(') depth++;
    else if (ch === ')' && --depth < 0) return false;
  }
  return depth === 0 && !/ \?: /.test(code.replace(/\([^()]*\)/g, ''));
}

/** Whether a postfix member can follow code as is: a name or member chain, optionally ending in one call. */
function postfixable(code: string): boolean {
  const name = /^[\w.]+(?=\(|$)/.exec(code);
  if (!name) return false;
  let depth = 0;
  for (let i = name[0].length; i < code.length; i++) {
    if (code[i] === '(') depth++;
    else if (code[i] === ')' && --depth === 0 && i < code.length - 1) return false;
  }
  return depth === 0;
}

/** Whether code is one expression: its brackets balance with none closing before its end, and no `;` between them. */
function oneExpression(code: string): boolean {
  let depth = 0;
  for (const ch of code) {
    if ('({['.includes(ch)) depth++;
    else if (')}]'.includes(ch) && --depth < 0) return false;
    else if (ch === ';' && depth === 0) return false;
  }
  return depth === 0;
}

/** A Kotlin type with type parameters replaced (`JSArray<T>` with T as Label). */
function substituteTypes(type: string, args: Map<string, string>): string {
  let out = type;
  for (const [n, t] of args) out = out.replace(new RegExp(`\\b${n}\\b`, 'g'), t);
  return out.replace(/\?\?/g, '?');
}

/** The key script reads an accessor by: a computed name's string (`get ['class']()` is `class`). */
function accessorKey(name: string): string {
  return /^\[(['"])(.*)\1\]$/.exec(name)?.[2] ?? name;
}

/** The method holding the body of a setter that takes more than its getter gives (`setterTakes`). */
function setterMethod(name: string): string {
  return `__set_${accessorKey(name).replace(/\W/g, '_')}`;
}

/**
 * Code that gives the same value however often it is read: names, literals, the translator's temporaries. Kept by the code
 * where it is made (a string carries no fields), so a conversion that reads its value twice need not bind it first.
 */
const pureCodes = new Set<string>();

export function pure(code: string): string {
  pureCodes.add(code);
  return code;
}

export function ident(name: string): string {
  if (name === '_') return pure('__underscore');
  // Kotlin reserves names of underscores alone.
  if (/^_+$/.test(name)) return pure(`__underscore${name.length}`);
  // A name of punctuation alone (`'+'`, `'!'` keys) spells its characters, or every such name would be `_`.
  if (!/[\w$#]/.test(name)) return pure('__k' + [...name].map((c) => c.codePointAt(0)!.toString(16)).join('_'));
  const n = name.replace(/^#/, '_p_').replace(/\$/g, '_').replace(/^(?=\d)/, '_').replace(/[^\w]/g, '_');
  return pure(KEYWORDS.has(n) ? `\`${n}\`` : n);
}

const OBJECT_REQUIRED = ' ?: jsObjectRequired())';


export function kotlinString(text: string): string {
  return pure('"' + escapeText(text) + '"');
}

function escapeText(text: string): string {
  // A lone surrogate is escaped: written to the UTF-8 source as itself, it would read as U+FFFD.
  return text.replace(/[\\"$\n\r\t\b]|[\u0000-\u001f\u007f]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, (c) => {
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

/** Code for a branch of an `if` expression: Kotlin reads a leading `{` there as a block, not as a lambda. */
function branch(code: string): string {
  return code.startsWith('{') ? `(${code})` : code;
}

/** `T?`, keeping an already nullable type and parenthesizing a function type. */
export function optionalType(t: string): string {
  if ((t.endsWith('?') && !isFunctionType(t)) || t === 'Nothing') return t;
  return isFunctionType(t) ? `(${t})?` : `${t}?`;
}

/** `JSNullish<T>` of a type its optional form spells `T?` (or `(F)?`). */
function nullishType(t: string): string {
  const present = /^\((.*)\)\?$/.exec(t)?.[1] ?? t.replace(/\?$/, '');
  return `JSNullish<${present}>`;
}

/** An array, Set or Map type (`JSArray<T?>`, `JSMap<K, T?>`) with its elements or values held as `JSNullish<T>`. */
function nullishElementsType(t: string): string {
  const m = /^(JSArray|JSSet|JSMap)<(.*)>(\??)$/.exec(t);
  if (!m) return t;
  const args = splitTopLevel(m[2]);
  const k = args.length - 1;
  if (!isNullable(args[k]) && !/^\(.*\)\?$/.test(args[k]) || args[k].startsWith('JSNullish<')) return t;
  args[k] = nullishType(args[k]);
  return `${m[1]}<${args.join(', ')}>${m[3]}`;
}

/** A nullable Kotlin type (`T?`, `((A) -> B)?`), not a function returning one. */
const isNullable = (t: string) => t.endsWith('?') && !isFunctionType(t);

/** How a Kotlin type holds a value (`ShapeFacts.held`). */
function heldOf(t: string): Held {
  if (t === 'Any?') return 'any';
  if (isFunctionType(t)) return t.endsWith('?') ? 'optional-result' : 'function';
  return t.endsWith('?') ? 'optional' : 'present';
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
  /** The class above the asserted one a variable's uses need (`view.android as ScrollView` used as a View). */
  assertedWiderClass?(d: ts.VariableDeclaration): string | null;
  isValueType(t: string): boolean;
  isNativeDeclaration(d: ts.Node): boolean;
  /** Whether a typings declaration's Java binding holds null: a field's value, a method's result, a parameter's argument. */
  holdsNil?(d: ts.Declaration): boolean;
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
  /** A value where a Java parameter of descriptor `desc` takes it. */
  toJava(e: ts.Expression, desc: string, nullableParam?: boolean, nonNullParam?: boolean, signature?: string, typeVar?: (name: string) => string): string;
}

/** What the kit generated from core leaves out of core's modules, or implements itself. */
export interface KotlinLibrary {
  /** Functions that return their last argument, and as decorators leave what they decorate as it is (`profile`). */
  identities: Set<string>;
  /** The kit's Kotlin implementing a core module's function (`ColorMix.argbFromColorMix`), or null. */
  counterpart(file: string, name: string): string | null;
  /** The object holding a compiled module's functions and variables (`Core_ui_core_view_index`), or null for a file not compiled. */
  moduleName?(file: string): string | null;
  /** Types the hand-written kit beside the generated code declares (Signals' `Source`), which a generated one must not take. */
  internalTypes?: Set<string>;
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
  coreVariable?(e: ts.Identifier): string | null;
  superArgs?(base: string, e: ts.CallExpression, args: string[]): string[];
  kitExtends?(name: string, base: string): boolean;
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
const TYPED_ARRAYS = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'];
const BUFFER_TYPES = new Set(['ArrayBuffer', ...TYPED_ARRAYS, 'DataView']);
/** WinterTC's web classes as NativeScript's globals declare them: the runtime's class of each name with a `JS` prefix. */
const WEB_CLASSES = ['TextEncoder', 'TextDecoder', 'Crypto', 'SubtleCrypto', 'CryptoKey', 'CryptoKeyPair', 'KeyAlgorithm', 'Worker', 'MessageEvent', 'ErrorEvent', 'URL'];
/** The web's option and algorithm dictionaries, which script writes as object literals and the runtime reads by key. */
const WEB_DICTIONARIES = ['TextDecoderOptions', 'Algorithm', 'HmacKeyGenParams', 'RsaKeyGenParams', 'RsaHashedKeyGenParams', 'RsaOaepParams'];
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date', 'WeakRef', 'Symbol', 'WeakMap', 'WeakSet', 'BigInt']);
/** Core classes kit-android implements under another name. */
export const KIT_NAMES_ANDROID: Record<string, string> = { ViewBase: 'View', ViewCommon: 'View', EditableTextBase: 'TextBase', LayoutBaseCommon: 'LayoutBase' };
/** iOS SDK declarations an Android build types app code with: NativeScript leaves them undefined on Android. */
const IOS_TYPINGS = /[\\/]@nativescript[\\/]types-ios[\\/]/;
/** The nullable property beside a field read before it is set (`Translator.earlyField`). */
const earlyBacking = (name: string) => `__early_${name.replace(/\W/g, '_')}`;

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

function moduleProperty(decl: string): string {
  const name = /(?:var|val) (\S+):/.exec(decl)![1];
  return decl.startsWith('lateinit ') ? `@get:JvmName("__get_${name.replace(/`/g, '')}") @set:JvmName("__set_${name.replace(/`/g, '')}") ${decl}` : `@JvmField ${decl}`;
}

export class Translator implements AsyncTranslator {
  readonly syntax: AsyncSyntax = { ...KOTLIN_SYNTAX, unwrap: (code) => this.asserted(code) };
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
  /** Interfaces an app class meets without naming them, where its objects are given for one (`measure(box)`): implemented as if named. */
  private structural = new Map<ts.ClassLikeDeclaration, Set<ts.InterfaceDeclaration>>();
  /** App classes whose objects are given where an object type is taken, which reads them by name: their methods and getters readable by name. */
  private readByName = new Set<ts.ClassLikeDeclaration>();
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
  /** Android: the worker scripts compiled with the app, by file, and the name the entry registers each under. */
  workerScripts: Map<string, string> | null = null;
  /** The generated kit: a module's name for `AppModules.runImport`, set where modules `await import(…)` reaches run when imported. */
  moduleKey?: (file: string) => string;
  /** The app's package, which qualifies a module function a class member's name shadows. */
  appModule = '';
  /** `--allow-unimplemented-properties`: a core property the kit does not apply is set by name, with a warning. */
  allowUnapplied = false;

  readonly checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  /** Files of the plugins compiled from source. */
  readonly pluginFiles: Set<string>;
  /** Which empty states a value or slot may hold (value-states.ts). */
  readonly states: ValueStates;
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
  private nullableDecls = (() => {
    // By declaration: a generic class's member is another symbol where an instantiation reads it.
    const decls = new Set<ts.Node | ts.Symbol>();
    const key = (s: ts.Symbol) => s.valueDeclaration ?? s;
    return { add: (s: ts.Symbol) => { decls.add(key(s)); }, has: (s: ts.Symbol) => decls.has(key(s)) };
  })();
  /** Expressions whose value lands where null is fine (an optional slot): a nullable declaration is read as it is. */
  nullOk = new Set<ts.Node>();
  /** What `this` is in an arrow function inside a Kotlin object expression, where Kotlin's `this` is the object. */
  thisAlias: string | null = null;

  /** Classes declared under Java names of other packages (`com.tns.NativeScriptActivity`), each in a file of its package. */
  readonly foreign: { name: string; code: string }[] = [];
  /** Translating core itself (kit-gen-kotlin.ts): what of core's modules the kit leaves out or replaces. */
  readonly library: KotlinLibrary | null;
  /** Code checked without strictNullChecks, as core is: any declaration may hold null or undefined. */
  readonly lenient: boolean;
  /** The app's own configuration is not strict. */
  readonly lenientApp: boolean;
  /** The app's configuration assigns class fields in the constructor rather than defining them (`useDefineForClassFields` off). */
  readonly assignFields: boolean;

  private trustScope: TrustScope | null = null;
  /** The trust rule's view of this program (lang.ts): which files are strict, which declarations are the platform's. */
  get trust(): TrustScope {
    return this.trustScope ??= {
      checker: this.checker,
      strictFile: (f) => !this.lenient && !this.pluginFiles.has(f.fileName) && !this.lenientApp,
      nativeDeclaration: (d) => !!this.native?.isNativeDeclaration(d),
      looseSlot: (d) => this.states.looseSlots.has(d),
    };
  }

  private unsetTyping?: UnsetGroupTyping;
  /** App mode: a match's groups that took no part, though TypeScript types them strings (see `unsetGroupTyping`). */
  private get unset(): UnsetGroupTyping {
    return (this.unsetTyping ??= unsetGroupTyping(this.checker, (n) => this.resolve(n), (e) => this.typeOf(e).replace(/\?$/, '') === 'JSMatch'));
  }

  /** App mode: a `string[]` a group that took no part may have put undefined in, held `JSArray<String?>`. */
  private unsetGroups(n: ts.Node): boolean {
    return !this.library && this.unset.groups(n);
  }

  /** App mode: a match whose groups may include one that took no part. */
  private unsetMatch(e: ts.Expression): boolean {
    return !this.library && this.unset.match(e);
  }

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[], options: { pluginFiles?: Iterable<string>; reach?: Reach; properties?: Properties; lenient?: boolean; lenientApp?: boolean; assignFields?: boolean; library?: KotlinLibrary } = {}) {
    this.checker = checker;
    this.library = options.library ?? null;
    this.lenient = options.lenient ?? false;
    this.lenientApp = options.lenientApp ?? false;
    this.assignFields = options.assignFields ?? false;
    this.components = components;
    this.sourceFiles = files;
    this.states = new ValueStates(this.stateBackend());
    if (process.env.NS_CONVERSION_SHADOW) shadowConversions(this, this.states);
    if (process.env.NS_SHAPE_SHADOW) shadowShapes(this, this.states);
    if (process.env.NS_TYPESTEP_SHADOW) shadowTypeSteps(this, this.states);
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
          // `class Cache extends common.Cache`: a module's class read through its namespace import.
          if (base && ts.isPropertyAccessExpression(base.expression)) {
            const d = this.resolve(base.expression.name)?.valueDeclaration;
            if (d) this.extendedDecls.add(d);
          }
          // `implements TKUnit.TestInfoEntry`: the interface by its own name, as its module declares it.
          for (const i of implementedInterfaces(this.checker, n)) this.protocols.add(this.implementedName(i));
          // @angular/forms' controls, read untyped as often as typed (`form.get('name').value`): their accessors by name too.
          if (f.fileName.endsWith('/runtime/angular-forms.ts')) this.readByName.add(n);
        }
        if (!this.library) {
          const given = ts.isCallExpression(n) || ts.isNewExpression(n) ? n.arguments ?? [] : ts.isVariableDeclaration(n) && n.type && n.initializer ? [n.initializer]
            : ts.isReturnStatement(n) && n.expression ? [n.expression] : ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken ? [n.right] : [];
          for (const x of given) this.noteStructural(x);
        }
        ts.forEachChild(n, visit);
      };
      visit(f);
    }
  }

  private noteStructural(x: ts.Expression): void {
    const bare = ts.skipParentheses(x);
    if (ts.isConditionalExpression(bare)) {
      this.noteStructural(bare.whenTrue);
      this.noteStructural(bare.whenFalse);
      return;
    }
    const wanted = this.checker.getContextualType(x)?.getSymbol();
    const given = this.checker.getTypeAtLocation(x).getSymbol()?.valueDeclaration;
    if (wanted && wanted.flags & (ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.Interface) && !(wanted.flags & ts.SymbolFlags.Class) && given && ts.isClassLike(given)) {
      for (let b: ts.ClassLikeDeclaration | undefined = given; b && !b.getSourceFile().isDeclarationFile; b = this.baseClassOf(b)) this.readByName.add(b);
    }
    const iface = wanted?.declarations?.find(ts.isInterfaceDeclaration);
    if (!iface || iface.getSourceFile().isDeclarationFile || iface.typeParameters?.length || iface.heritageClauses?.length) return;
    const cls = this.checker.getTypeAtLocation(x).getSymbol()?.valueDeclaration;
    if (!cls || !ts.isClassLike(cls) || cls.getSourceFile().isDeclarationFile || cls.typeParameters?.length || implementedInterfaces(this.checker, cls).some((i) => i.expression.getText() === iface.name.text)) return;
    if (!this.meetsFields(cls, iface)) return;
    (this.structural.get(cls) ?? this.structural.set(cls, new Set()).get(cls)!).add(iface);
    this.protocols.add(this.topName(iface, iface.name.text));
  }

  /** Whether a class's own members hold every property of an interface as Kotlin can override it: the same type, writable where the interface's is. */
  private meetsFields(cls: ts.ClassLikeDeclaration, iface: ts.InterfaceDeclaration): boolean {
    const ctor = cls.members.find(ts.isConstructorDeclaration);
    for (const req of iface.members) {
      const name = req.name?.getText();
      if (!name || (!ts.isPropertySignature(req) && !ts.isMethodSignature(req)) || req.questionToken) return false;
      const own = cls.members.filter((m) => m.name?.getText() === name && !isStatic(m));
      const param = ctor?.parameters.find((p) => ts.isIdentifier(p.name) && p.name.text === name && ts.canHaveModifiers(p) && !!ts.getModifiers(p)?.length);
      if (ts.isMethodSignature(req)) { if (!own.some(ts.isMethodDeclaration)) return false; continue; }
      const field = own.find(ts.isPropertyDeclaration) ?? param;
      const getter = own.find(ts.isGetAccessor);
      if (!field && !getter) return false;
      const writable = field ? !hasModifier(field, ts.SyntaxKind.ReadonlyKeyword) : own.some(ts.isSetAccessor);
      if (!hasModifier(req, ts.SyntaxKind.ReadonlyKeyword) && !writable) return false;
      if (this.typeOf(req) !== (field ? this.typeOf(field.name) : this.returnTypeOf(getter!))) return false;
    }
    return true;
  }

  /** Code this translator emitted with its outermost operation, kept by the code (see `pureCodes`); no reader parses the text. */
  private readonly made = new Map<string, Value>();

  /** Code, recorded with its outermost operation. */
  marked(code: string, mark: Mark): string {
    this.made.set(code, { code, throws: false, pure: pureCodes.has(code), mark });
    return code;
  }

  valueOf(code: string): Value {
    return this.made.get(code) ?? { code, throws: false, pure: pureCodes.has(code) };
  }

  private markOf(code: string): Mark | undefined {
    return this.made.get(code)?.mark;
  }

  /** Whether reading code twice is reading it once (else it is bound first). */
  private isPure(code: string): boolean {
    return pureCodes.has(code);
  }

  /** A name, or a chain of member reads from one (`this.page`). */
  private isPath(code: string): boolean {
    const m = this.markOf(code);
    return this.isPure(code) || (m?.op === 'member' && this.isPath(m.of.code));
  }

  /** A value Kotlin holds nullable where JavaScript goes on with it as an object: the value, or V8's TypeError when it is missing. */
  asserted(code: string): string {
    return this.isAsserted(code) ? code : this.marked(`(${code}${OBJECT_REQUIRED}`, { op: 'asserted', of: this.valueOf(code) });
  }

  /** `jsUnchecked<T>(x)`: the value passed for a `T` whatever it holds. */
  unchecked(type: string, code: string): string {
    return this.marked(`jsUnchecked<${type}>(${code})`, { op: 'cast', to: parseNativeType(type), optional: type.endsWith('?'), implicit: false, of: this.valueOf(code), unchecked: true });
  }

  /** `x!!`: the value Kotlin's own assertion unwraps. */
  private unwrapped(code: string): string {
    return this.marked(`${code}!!`, { op: 'unwrap', of: this.valueOf(code) });
  }

  /** Whether code is a value asserted present (`asserted`, or a `!!` its producer wrote). */
  isAsserted(code: string): boolean {
    const op = this.markOf(code)?.op;
    return op === 'asserted' || op === 'unwrap';
  }

  /** The value an asserted one asserts. */
  unasserted(code: string): string {
    const m = this.markOf(code);
    return m && (m.op === 'asserted' || m.op === 'unwrap') ? m.of.code : code;
  }

  /** The temporaries each prefix has numbered in the function being translated, and outside any function in the module. */
  private temporaries = new Map<string, number>();
  private moduleTemporaries = new Map<string, number>();
  /** Declarations being translated, outermost first: a temporary's number starts again in each top-level one. */
  private declarationDepth = 0;

  /**
   * A temporary's name, numbered within its declaration (`__switch1`). A one-letter prefix takes a `_` before its number,
   * apart from the `__a0` parameters and arguments the translator writes itself.
   */
  fresh(prefix: string): string {
    const taken = this.declarationDepth > 0 ? this.temporaries : this.moduleTemporaries;
    const n = (taken.get(prefix) ?? 0) + 1;
    taken.set(prefix, n);
    return pure(/^__[a-z]$/.test(prefix) ? `${prefix}_${n}` : `${prefix}${n}`);
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

  /** A constructor's `return`, inside the labeled block its `init` runs: Kotlin's `init` takes no `return`. */
  private returnLabel: string | null = null;

  /** `return`, or in a lambda `return@` its label. */
  private returnKeyword(): string {
    return this.lambdaReturn ? `return@${this.lambdaReturn}` : 'return';
  }

  /** The label a lambda being translated returns to (`return@fn1`), as a lambda's `return` would leave its caller. */
  private lambdaReturn: string | null = null;

  private inFunction<T>(returnType: string, body: () => T, lambdaLabel: string | null = null): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.jumps, this.returnLabel, this.lambdaReturn] as const;
    this.returnLabel = null;
    this.lambdaReturn = lambdaLabel;
    this.asyncCtx = null;
    this.plainBreak = 0;
    this.plainContinue = 0;
    this.returnType = returnType;
    this.jumps = [];
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType, this.jumps, this.returnLabel, this.lambdaReturn] = saved; }
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
    const alias = !this.library && t.getSymbol()?.flags! & ts.SymbolFlags.Class ? this.collectionAlias(t.getSymbol()?.valueDeclaration) : null;
    if (alias) return alias;
    // An iOS class (`page.ios as UIViewController` in code shared by both platforms): what this platform's code holds is no such thing.
    const iosDecls = t.getSymbol()?.declarations;
    if (iosDecls?.length && iosDecls.every((d) => /[\\/]@nativescript[\\/]types-ios[\\/]/.test(d.getSourceFile().fileName))) return 'Any?';
    // A namespace as a value (`{ Kinds: Trace.Kinds }`): its object.
    const nsDecl = t.flags & F.Object && t.getSymbol()?.flags! & ts.SymbolFlags.ValueModule ? t.getSymbol()!.valueDeclaration : undefined;
    if (nsDecl && ts.isModuleDeclaration(nsDecl) && !nsDecl.getSourceFile().isDeclarationFile) return this.namespacePath(nsDecl)!;
    // An enum as a value (`typeof Color`) in app code: the object JavaScript makes of it. Not the enum's own name, through
    // which its members are read (`Color.Red`).
    const enumObject = !this.library && t.flags & F.Object && (t.getSymbol()?.flags ?? 0) & ts.SymbolFlags.RegularEnum ? t.getSymbol()!.valueDeclaration : undefined;
    const named = where && (ts.isIdentifier(where) || ts.isPropertyAccessExpression(where)) && this.resolve(ts.isPropertyAccessExpression(where) ? where.name : where)?.valueDeclaration === enumObject;
    if (enumObject && !named && ts.isEnumDeclaration(enumObject) && !enumObject.getSourceFile().isDeclarationFile && !hasModifier(enumObject, ts.SyntaxKind.ConstKeyword)) return 'JSObject';
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
      // A parameter of a lambda (Kotlin's take none) or of an interface the translation erases: its constraint.
      if (decl && !this.library && (ts.isArrowFunction(decl.parent) || ts.isFunctionExpression(decl.parent) || ts.isInterfaceDeclaration(decl.parent) || ts.isTypeAliasDeclaration(decl.parent))) {
        const base = this.checker.getBaseConstraintOfType(t);
        return base && base !== t && !(base.flags & F.Unknown) ? optionalType(this.type(base, where)) : 'Any?';
      }
      // Library mode: a type parameter of the library's own signatures (ClassDecorator's `TFunction`), which no Kotlin declaration has.
      if (this.library && decl?.getSourceFile().isDeclarationFile) return 'Any?';
      if (!this.library && decl && ts.isTypeParameterDeclaration(decl) && erasedTypeParameter(decl)) return 'Any?';
      // Inside an object shape, a class of its own outside every generic scope: any value.
      if (!this.library && this.shaping.size) return 'Any?';
      return name ?? 'Any?';
    }
    // `UIView & { nsView?: … }`, `View & { … }`: the class; the members the literal adds are read by name.
    if (t.isIntersection()) {
      // Library mode: `Color & number`, a value declared a class that `typeof` found a number: the number.
      const sym = this.library && where && ts.isIdentifier(where) ? this.checker.getSymbolAtLocation(where) : undefined;
      const declared = sym?.valueDeclaration ? this.checker.getTypeOfSymbolAtLocation(sym, sym.valueDeclaration) : undefined;
      const tested = declared && !(declared.flags & (F.StringLike | F.NumberLike | F.BooleanLike)) ? t.types.find((u) => u.flags & (F.StringLike | F.NumberLike | F.BooleanLike)) : undefined;
      if (tested) return this.type(tested, where);
      const cls = t.types.find((u) => this.native?.type(u) || (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class);
      if (cls) return this.type(cls, where);
      // `T & string`, a type parameter narrowed by typeof: the primitive.
      const primitive = t.types.find((u) => u.flags & (F.StringLike | F.NumberLike | F.BooleanLike));
      if (primitive && t.types.every((u) => u === primitive || u.flags & F.TypeParameter)) return this.type(primitive, where);
      // A function carrying properties (`((p: P) => R) & { type: string }`): an untyped value, called as script calls it.
      if (t.types.some((u) => u.getCallSignatures().length) && t.types.some((u) => !u.getCallSignatures().length && u.getProperties().length) && !t.types.some((u) => isLibDeclaration(u.getSymbol()?.declarations?.[0]))) return 'Any?';
      // Interfaces each held untyped (core's `BackstackEntry & ExpandedEntry`): untyped too. A shape would be a copy, so
      // the caller's object would not see the writes and `===` would not find it.
      if (t.types.every((u) => { const s = u.getSymbol(); return !!s && this.isDynamicShape(s); })) return 'Any?';
    }
    if (t.isUnion()) {
      let parts = t.types.filter((u) => !(u.flags & (F.Undefined | F.Null | F.Void)));
      if (!parts.length) return 'Any?';
      const optional = parts.length < t.types.length;
      // `xs || []`: the empty literal's `never[]` takes the other side's type; beside a primitive (`['a', []]`'s elements) it is an array still.
      const empty = (u: ts.Type) => c.isArrayType(u) && !!(c.getTypeArguments(u as ts.TypeReference)[0]?.flags & F.Never);
      const primitive = (u: ts.Type) => !!(u.flags & (F.StringLike | F.NumberLike | F.BooleanLike | F.BigIntLike));
      if (parts.length > 1 && parts.some((u) => !empty(u)) && !parts.some(primitive)) parts = parts.filter((u) => !empty(u));
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
    // A class as a value (`typeof Style`, `new () => T`): its Java class, untyped.
    if (this.library && t.getConstructSignatures().length && !t.getCallSignatures().length && (!((t.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class) || !this.namesClass(where))) return 'Any?';
    if (this.library && t.getProperties().length === 1 && t.getProperties()[0].name === 'prototype') return 'Any?';
    if (t.flags & F.BigIntLike) return 'JSBigInt';
    if (c.isTupleType(t)) {
      const args = c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where));
      const variadic = ((t as ts.TypeReference).target as ts.TupleType).hasRestElement;
      if (args.length === 2 && !variadic) return `Pair<${args.join(', ')}>`;
      if (args.length === 3 && !variadic) return `Triple<${args.join(', ')}>`;
      const same = args.every((a) => a === args[0]);
      return `JSArray<${same && args.length ? args[0] : 'Any?'}>`;
    }
    if (c.isArrayType(t)) {
      const el = c.getTypeArguments(t as ts.TypeReference)[0];
      // Lenient code types `[]` as `undefined[]`: an array of anything.
      return el.flags & F.Never || (this.lenient && el.flags & (F.Undefined | F.Null)) ? 'JSArray<Any?>' : `JSArray<${this.type(el, where)}>`;
    }
    if (isRegExpProtocol(t)) return 'JSRegExp';
    // An alias of a class's type (`type UntypedFormGroup = FormGroup<any>`) is that class.
    const sym = t.aliasSymbol && !((t.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class && t.aliasSymbol.flags & ts.SymbolFlags.TypeAlias && !(t.aliasSymbol.flags & ts.SymbolFlags.Class)) ? t.aliasSymbol : t.getSymbol();
    if (sym?.declarations?.some((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return 'Any?';
    // An Angular component class as a value (`typeof SheetComponent`) is what creating and rendering it gives.
    const classDecl = sym?.valueDeclaration;
    if (classDecl && ts.isClassDeclaration(classDecl) && t.getConstructSignatures().length && isAngularComponent(classDecl)) return 'ComponentFactory';
    // An app class as a value (`[Plain]`): its Java class, untyped.
    if (!this.library && classDecl && ts.isClassDeclaration(classDecl) && !classDecl.getSourceFile().isDeclarationFile && t.getConstructSignatures().length && !t.getCallSignatures().length && !this.pluginFiles.has(classDecl.getSourceFile().fileName) && !this.namesClass(where)) return 'Any?';
    // Library mode: a class a module declares for what it makes at run time (`declare class NativeScriptLifecycleCallbacks extends …`): the class it extends.
    if (this.library && sym && sym.flags & ts.SymbolFlags.Class && sym.declarations?.length && sym.declarations.every((d) => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile && hasModifier(d, ts.SyntaxKind.DeclareKeyword))) {
      const base = (t as ts.InterfaceType).isClassOrInterface?.() ? c.getBaseTypes(t as ts.InterfaceType)[0] : undefined;
      return base ? this.type(base, where) : 'Any?';
    }
    // Library mode: a class expression's instances are of the class it extends.
    if (this.library && sym && sym.flags & ts.SymbolFlags.Class && sym.valueDeclaration && ts.isClassExpression(sym.valueDeclaration) && (t as ts.InterfaceType).isClassOrInterface?.()) {
      const base = c.getBaseTypes(t as ts.InterfaceType)[0];
      return base ? this.type(base, where) : 'Any?';
    }
    // Library mode: a class of fields alone that nothing constructs (`UnparsedKeyframe`), the type of plain objects: untyped.
    if (this.library && sym && sym.flags & ts.SymbolFlags.Class && this.plainObjectClasses().has(sym.valueDeclaration as ts.Node)) return 'Any?';
    // Library mode: a class only core's declarations describe (`NativeScriptLifecycleCallbacks`, made at run time), untyped.
    if (this.library && sym && sym.flags & ts.SymbolFlags.Class && sym.declarations?.length && sym.declarations.every((d) => d.getSourceFile().isDeclarationFile && !isLibDeclaration(d) && !this.native?.isNativeDeclaration(d)) && !this.core?.type(t)
        && !this.sourceClassNames().has(sym.name)) return 'Any?';
    // Library mode: a class a module declares ambiently for the runtime to provide (`com.tns.NativeScriptApplication`), untyped.
    if (this.library && sym?.declarations?.length && sym.declarations.every((d) => !d.getSourceFile().isDeclarationFile && !!ts.findAncestor(d, (a) => ts.isModuleDeclaration(a) && hasModifier(a, ts.SyntaxKind.DeclareKeyword)))) return 'Any?';
    // Library mode: an interface core declares over Java interfaces alone (`EditTextListeners`): what implements them, untyped.
    const ifaces = this.library && sym && sym.flags & ts.SymbolFlags.Interface ? (sym.declarations ?? []).filter(ts.isInterfaceDeclaration) : [];
    if (ifaces.length && ifaces.every((d) => !d.getSourceFile().isDeclarationFile && !d.members.length && !!d.heritageClauses?.length
        && d.heritageClauses.every((h) => h.types.every((x) => (this.checker.getTypeAtLocation(x).getSymbol()?.declarations ?? []).some((b) => !!this.native?.isNativeDeclaration(b)))))) return 'Any?';
    // Library mode: what only the DOM's typings declare (`MediaQueryList`) is no class of the kit's.
    if (this.library && sym?.declarations?.length && sym.declarations.every((d) => /[\\/]lib\.dom[\w.]*\.d\.ts$/.test(d.getSourceFile().fileName))) return 'Any?';
    const declName = sym?.declarations?.[0] && (ts.isClassDeclaration(sym.declarations[0]) || ts.isInterfaceDeclaration(sym.declarations[0])) ? sym.declarations[0].name?.text : undefined;
    // A default-exported class is known by its declared name.
    const name = sym?.getName() === 'default' ? declName ?? 'default' : sym?.getName();
    const args = () => t.aliasTypeArguments ?? c.getTypeArguments(t as ts.TypeReference);
    const arg = (k: number) => { const a = args()[k]; return a ? this.type(a, where) : 'Any?'; };
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/globals.d.ts') {
      if (WEB_CLASSES.includes(name)) return `JS${name}`;
      if (WEB_DICTIONARIES.includes(name)) return 'Any?';
    }
    // Library mode: a Java class named as a library type (`java.util.Map`, `java.util.Iterator`) is the Java class.
    const javaClass = this.library && !!sym?.declarations?.length && sym.declarations.every((d) => this.native?.isNativeDeclaration(d)) ? this.native?.type(t) : null;
    if (javaClass) return javaClass;
    // A program type renamed for a name Kotlin has already (`Iterator`, `Pair`) is not the library's type of that name.
    const clashing = !this.library && sym?.valueDeclaration && this.nativeClash(sym.name) ? this.topNames().get(sym.valueDeclaration) : undefined;
    if (clashing) return `${clashing}${this.declaredTypeArguments(t, sym!.valueDeclaration!, where)}`;
    switch (name) {
      case 'Sig': case 'Ref': case 'VueRef': case 'WritableSignal': case 'InputSignal': case 'ModelSignal': case 'Writable': return `Signal<${arg(0)}>`;
      case 'Signal': return arg(0);
      case 'EventData': return 'EventData';
      case 'Function': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'OutputEmitterRef': case 'EventEmitter': return `Emitter<${arg(0)}>`;
      case 'RouterExtensions': return 'Router';
      case 'EnvironmentInjector': if (sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/')) return 'Injector'; break;
      // kit-android's NativeDialogService takes its config as script gives it.
      case 'NativeDialogConfig': if (sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/')) return 'Any?'; break;
      // `Promise.allSettled`'s results are the plain objects it makes (either of them, a union, is untyped).
      case 'PromiseFulfilledResult': case 'PromiseRejectedResult': return 'JSObject';
      case 'NativeDialogRef': case 'NativeDialogService': case 'DestroyRef': case 'Injector': case 'InjectionToken': case 'ErrorHandler': case 'NgZone': case 'HttpClient': case 'ChangeDetectorRef': case 'PurePipeCache': case 'NodeInjector': case 'ElementRef': case 'SimpleChange':
      case 'RxSubscription': case 'NavigationEnd': case 'NavigationStart': case 'NavigationCancel': case 'NavigationError': case 'RoutesRecognized': case 'ResolveStart': case 'ResolveEnd':
      case 'HttpParams': case 'HttpHeaders': case 'HttpResponse': case 'HttpErrorResponse': case 'HttpRequest': case 'HttpContext': case 'HttpContextToken':
      case 'ParamMap': case 'UrlSegment': case 'UrlTree': case 'DefaultUrlSerializer': case 'ActivatedRouteSnapshot':
      case 'ViewContainerRef': case 'TemplateRef': case 'ComponentRef': case 'EmbeddedViewRef': case 'ApplicationRef': case 'Location':
        if (sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/')) return name;
        break;
      case 'Promise': case 'PromiseLike': return `JSPromise<${arg(0)}>`;
      case 'AnimationPromise': return 'JSPromise<Unit>';
      // Script writes animation definitions as object literals; the kit's Animation reads them by key.
      case 'AnimationDefinition': if (isCoreDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'Map': case 'ReadonlyMap': return `JSMap<${arg(0)}, ${arg(1)}>`;
      case 'Set': case 'ReadonlySet': return `JSSet<${arg(0)}>`;
      case 'Date': return 'JSDate';
      case 'RegExp': return 'JSRegExp';
      // The library's constructors held as values: an error class is its Java class; Number, String and Boolean convert.
      case 'ErrorConstructor': case 'TypeErrorConstructor': case 'RangeErrorConstructor': case 'SyntaxErrorConstructor': case 'ReferenceErrorConstructor': case 'AggregateErrorConstructor':
        if (isLibDeclaration(sym?.declarations?.[0])) return 'Class<out JSError>';
        break;
      case 'NumberConstructor': if (isLibDeclaration(sym?.declarations?.[0])) return '(Any?) -> Double'; break;
      case 'StringConstructor': if (isLibDeclaration(sym?.declarations?.[0])) return '(Any?) -> String'; break;
      case 'BooleanConstructor': if (isLibDeclaration(sym?.declarations?.[0])) return '(Any?) -> Boolean'; break;
      case 'RegExpMatchArray': case 'RegExpExecArray': return 'JSMatch';
      case 'RegExpStringIterator': return 'JSArray<JSMatch>';
      case 'TemplateStringsArray': return 'JSArray<String>';
      case 'PromiseWithResolvers': if (isLibDeclaration(sym?.declarations?.[0])) return `JSPromiseWithResolvers<${arg(0)}>`; break;
      case 'PropertyDescriptor': case 'PropertyDescriptorMap': case 'TypedPropertyDescriptor': if (sym?.declarations?.[0] && /[\\/]typescript[\\/]lib[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'Any?'; break;

      case 'Generator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSGenerator<${arg(0)}>`; break;
      case 'NumberFormat': case 'DateTimeFormat': if (isLibDeclaration(sym?.declarations?.[0])) return `JS${name}`; break;
      case 'NumberFormatOptions': case 'DateTimeFormatOptions': case 'CollatorOptions': case 'ResolvedNumberFormatOptions': case 'ResolvedDateTimeFormatOptions': case 'LocalesArgument':
        if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?';
        break;
      case 'IterableIterator': case 'MapIterator': case 'SetIterator': case 'ArrayIterator': case 'Iterator': case 'IteratorObject': case 'StringIterator': return `JSIterator<${arg(0)}>`;
      case 'Iterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSIterable<${arg(0)}>`; break;
      case 'AsyncGenerator': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncGenerator<${arg(0)}>`; break;
      case 'AsyncIterator': case 'AsyncIterableIterator': case 'AsyncIteratorObject': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterator<${arg(0)}>`; break;
      case 'AsyncIterable': if (isLibDeclaration(sym?.declarations?.[0])) return `JSAsyncIterable<${arg(0)}>`; break;
      case 'IteratorResult': case 'IteratorYieldResult': case 'IteratorReturnResult': if (isLibDeclaration(sym?.declarations?.[0])) return 'Any?'; break;
      case 'ArrayBufferView': if (sym?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return 'JSArrayBufferView'; break;
      case 'WeakMap': return `JSWeakMap<${arg(0)}, ${arg(1)}>`;
      case 'WeakSet': return `JSWeakSet<${arg(0)}>`;
      case 'WeakRef': return `JSWeakRef<${arg(0).replace(/\?$/, '')}>`;
      case 'Symbol': if (sym?.declarations?.[0] && /[\\/]typescript[\\/]lib[\\/]/.test(sym.declarations[0].getSourceFile().fileName)) return 'JSSymbol'; break;
    }
    if (name && ERRORS[name] && sym?.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return ERRORS[name];
    if (name && BUFFER_TYPES.has(name) && sym?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return `JS${name}`;
    if (name === 'NonNullable' && t.aliasSymbol && args().length === 1) {
      const inner = this.type(args()[0], where);
      return inner === 'Any?' ? inner : inner.replace(/\?$/, '');
    }
    if (name === 'Object' && sym?.declarations?.every((d) => /[\\/]typescript[\\/]lib[\\/]/.test(d.getSourceFile().fileName))) return 'Any?';
    const native = this.native?.type(t);
    if (native) return native;
    // Library mode: a native type no class file has, untyped.
    if (this.library && sym?.declarations?.length && sym.declarations.every((d) => this.native?.isNativeDeclaration(d)) && sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) return 'Any?';
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
    const appClass = !!sym && !!(sym.flags & ts.SymbolFlags.Class) && !!sym.valueDeclaration && ts.isClassLike(sym.valueDeclaration) && !sym.valueDeclaration.getSourceFile().isDeclarationFile;
    if (!t.getProperties().length && !t.getCallSignatures().length && !t.getConstructSignatures().length && !index && !appClass) return 'Any?';
    const calls = t.getCallSignatures();
    // Properties script assigns a function (`fn.tag = …`) are the function value's own, not its type's.
    if (calls.length && t.getProperties().every((p) => p.declarations?.every((d) => ts.isPropertyAccessExpression(d) || ts.isBinaryExpression(d)))) {
      const s = calls[0];
      // App mode: a function type reading the receiver it is called with (`(this: Action, state) => void`) is a script
      // function (a JSMethod), as `call`/`apply` pass that receiver.
      if (!this.library && this.takesOwnThis(s.getDeclaration())) return 'Any?';
      const self = this.library ? (s as ts.Signature & { thisParameter?: ts.Symbol }).thisParameter : undefined;
      const selfType = self && this.type(c.getTypeOfSymbolAtLocation(self, where ?? self.valueDeclaration!), where);
      const params = [...(selfType && selfType !== 'Unit' ? [self!] : []), ...s.getParameters()].map((p) => {
        if (p.valueDeclaration && this.states.nullish().held.has(p.valueDeclaration)) return 'Any?';
        const pt = this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (p.valueDeclaration && this.states.nullishHeld(p.valueDeclaration)) return nullishType(pt);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && (p.valueDeclaration.questionToken || p.valueDeclaration.initializer || this.states.widened(p.valueDeclaration))) return optionalType(pt);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && ['String', 'Double', 'Boolean'].includes(pt) && this.states.undefinedParameter(p.valueDeclaration)) return optionalType(pt);
        return pt;
      });
      // A generic signature held as a value (`assertEqual<T>` of a module object): its type parameters are whatever script passes.
      const generic = (s.typeParameters ?? []).map((p) => p.symbol.name);
      const erase = (x: string) => generic.reduce((acc, n) => acc.replace(new RegExp(`\\b${n}\\b`, 'g'), 'Any?'), x).replace(/\?\?/g, '?');
      const sd = s.getDeclaration() as ts.Declaration | undefined;
      return erase(`(${params.join(', ')}) -> ${sd && this.states.nullish().held.has(sd) ? 'Any?' : sd && this.states.nullishHeld(sd) ? nullishType(this.type(s.getReturnType(), where)) : this.widenedResultType(sd, this.type(s.getReturnType(), where))}`);
    }
    // An interface extending a class; one merged into a class (`interface ListViewBase { on(…) }`) is the class.
    // An interface typing a variable of its name a lazily defined class is assigned to (`interface PagerAdapter` with
    // `let PagerAdapter: PagerAdapter`): that class.
    const lazyHolder = !this.library && sym && sym.flags & ts.SymbolFlags.Interface ? sym.declarations?.find(ts.isVariableDeclaration) : undefined;
    const lazyClass = lazyHolder ? this.assignedClass(lazyHolder) : null;
    if (lazyClass) return this.className(lazyClass);
    const extended = sym && sym.flags & ts.SymbolFlags.Interface && !(sym.flags & ts.SymbolFlags.Class) ? this.extendedClass(t) : null;
    if (extended) return this.type(extended, where);
    if (sym && this.isDynamicShape(sym)) return 'Any?';
    if (this.isEventData(t)) return 'EventData';
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    // RxJS's classes are the kit's Rx classes: core has an Observable of its own.
    if (name && sym?.declarations?.[0]?.getSourceFile().fileName === '/__shims__/rxjs.d.ts') return `Rx${name}${(t as ts.TypeReference).typeArguments?.length ? `<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>` : ''}`;
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    if (name && Object.hasOwn(KIT_NAMES_ANDROID, name) && isCoreDeclaration(sym?.declarations?.[0])) return KIT_NAMES_ANDROID[name];
    const renamed = sym?.valueDeclaration && this.topNames().get(sym.valueDeclaration);
    if (renamed) return `${renamed}${this.declaredTypeArguments(t, sym!.valueDeclaration!, where)}`;
    const renamedType = sym && !sym.valueDeclaration && sym.declarations?.[0] ? this.topNames().get(sym.declarations[0]) : undefined;
    if (renamedType) { this.used.add(renamedType); return renamedType; }
    // A mixin's class is the core class it is applied to.
    const mixin = this.mixinOf(sym);
    if (mixin) return mixin;
    // An object rest's type (`const { a, ...rest } = x`) is named by the binding: a shape like a literal's.
    const restType = !!sym?.declarations?.length && sym.declarations.every((d) => ts.isBindingElement(d) || ts.isVariableDeclaration(d) || ts.isParameter(d));
    if (name && name !== '__type' && name !== '__object' && !restType) {
      if (sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) this.used.add(name);
      const classDecl = sym?.declarations?.find((d): d is ts.ClassDeclaration => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile);
      // A plugin's generic class is untyped in its parameters, as its code treats them.
      return classDecl ? `${name}${this.declaredTypeArguments(t, classDecl, where)}` : name;
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

  private stateBackend(): StateBackend {
    const t = this;
    return {
      name: 'kotlin',
      get checker() { return t.checker; },
      get sourceFiles() { return t.sourceFiles; },
      get pluginFiles() { return t.pluginFiles; },
      get pluginRoots() { return t.pluginRoots; },
      get trust() { return t.trust; },
      get lenient() { return t.lenient; },
      get lenientApp() { return t.lenientApp; },
      get library() { return t.library; },
      get native() { return t.native; },
      spelling: { boolean: 'Boolean', void: 'Unit' },
      rules: {
        appNullResults: true, optionalParametersTakeUndefined: false, looseReads: false,
        checkedParameters: { truthTested: (name) => this.truthTested(name), unsetElement: (d) => this.unset.element(d) },
      },
      typeOf: (n) => this.typeOf(n),
      type: (type, at) => this.type(type, at),
      returnTypeOf: (d) => this.returnTypeOf(d),
      resolve: (n) => this.resolve(n),
      programBase: (cls) => this.programBase(cls),
      error: (n, what) => this.error(n, what),
      optional: isNullable,
      functionType: isFunctionType,
      unemitted: (f) => f(),
      ownSignature: (fn) => this.ownSignatureMethod(fn),
      looseObjectType: (type) => !isNullable(type) && !isFunctionType(type) && !['Any', 'Unit', 'Nothing'].includes(type) && this.isObjectType(type),
      resultHoldsNull: (d) => this.isObjectType(this.returnTypeOf(d)) && !['String', 'Double', 'Boolean'].includes(this.returnTypeOf(d)),
      nullableParameter: (type) => !type.endsWith('?') && !['Double', 'Boolean', 'Unit', 'Nothing'].includes(type) && !isFunctionType(type) && (type === 'String' || this.isObjectType(type)),
      nulledEntry: (read, code) => this.nulledEntry(read, code),
      optionalShapeField: (e) => this.optionalShapeField(e),
      heldOptional: (x) => {
        const sym = ts.isIdentifier(x) ? this.resolve(x) : undefined;
        return (!!sym && (this.undefinedVars.get(sym)?.endsWith('?') || !!this.declaredTypeOf(x)?.endsWith('?'))) || (ts.isCallExpression(x) && this.unwrapsResult(x));
      },
      declaredOptional: (x) => { const sym = this.resolve(x); return !!sym && (!!this.undefinedVars.get(sym)?.endsWith('?') || !!this.declaredTypeOf(x)?.endsWith('?')); },
    };
  }

  private widenedVars = new Map<ts.VariableDeclaration, string | null>();
  private widerAsserted(d: ts.VariableDeclaration): string | null {
    if (!this.widenedVars.has(d)) this.widenedVars.set(d, this.native?.assertedWiderClass?.(d) ?? null);
    return this.widenedVars.get(d)!;
  }

  typeOf(n: ts.Node): string {
    const narrowed = this.narrowedHeld(n);
    if (narrowed) return this.type(narrowed.type, n);
    const t = this.heldElements(n, this.plainTypeOf(n));
    return ts.isIdentifier(n) && n.parent && ts.isVariableDeclaration(n.parent) && n.parent.name === n && this.states.nullishHeld(n.parent) ? nullishType(t) : t;
  }

  /** `t`, the type of `n`, with the elements `ValueStates.nullishElements` holds as `JSNullish<T>` so. */
  private heldElements(n: ts.Node, t: string): string {
    return this.states.nullishElements(n) ? nullishElementsType(t) : t;
  }

  private plainTypeOf(n: ts.Node): string {
    if (this.isArguments(n)) return 'JSArray<Any?>';
    if (ts.isCallExpression(n) && this.states.lenientAsyncCall(n)) return this.returnTypeOf(this.checker.getResolvedSignature(n)!.getDeclaration() as ts.SignatureDeclaration);
    if (this.states.heldNullish(n) || this.nullishReadUntyped(n)) return 'Any?';
    const held = this.heldSignal(n);
    if (held) return held;
    if (!this.library && ts.isIdentifier(n)) {
      const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
      const wider = d && ts.isVariableDeclaration(d) && d.initializer && (ts.isAsExpression(ts.skipOuterExpressions(d.initializer, ts.OuterExpressionKinds.Parentheses)) || ts.isTypeAssertionExpression(ts.skipOuterExpressions(d.initializer, ts.OuterExpressionKinds.Parentheses))) ? this.widerAsserted(d) : null;
      if (wider) return wider;
    }
    if (ts.isMetaProperty(n) && n.keywordToken === ts.SyntaxKind.ImportKeyword) return 'Any?';
    if (this.library && this.isThisValue(n)) return 'Any?';
    if (this.library && ts.isIdentifier(n) && this.passedParams.size) {
      const d = ts.isShorthandPropertyAssignment(n.parent) ? this.checker.getShorthandAssignmentValueSymbol(n.parent)?.valueDeclaration : this.checker.getSymbolAtLocation(n)?.valueDeclaration;
      if (d && ts.isParameter(d) && this.passedParams.has(d)) return 'Any?';
    }
    if (this.library && this.widenedAccessors.size) {
      // A read of such a getter, or a variable it initializes (`const nativeView = this.nativeTextViewProtected`).
      const d = ts.isIdentifier(n) ? this.checker.getSymbolAtLocation(n)?.valueDeclaration : undefined;
      if (d && ts.isParameter(d) && this.widenedAccessors.has(d)) return this.widenedAccessors.get(d)!;
      const read = ts.isPropertyAccessExpression(n) ? n : d && ts.isVariableDeclaration(d) && !d.type && d.initializer && ts.isPropertyAccessExpression(d.initializer) ? d.initializer : undefined;
      const widened = read ? (this.checker.getSymbolAtLocation(read.name)?.declarations ?? []).map((x) => this.widenedAccessors.get(x)).find(Boolean) : undefined;
      if (widened) return widened;
    }
    // Library mode: a parameter destructuring an object (`({ property, value }: KeyframeDeclaration)`, `({ x, y }) => …`), which script
    // gives plain objects as well as typed ones: read by name.
    if (this.library && ts.isObjectBindingPattern(n) && ts.isParameter(n.parent)) {
      const sym = this.checker.getTypeAtLocation(n).getSymbol();
      const decl = sym?.valueDeclaration;
      const fieldsOnly = !!decl && ts.isClassDeclaration(decl) && !decl.getSourceFile().isDeclarationFile && decl.members.every((m) => ts.isPropertyDeclaration(m));
      if (fieldsOnly || !sym || sym.flags & (ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.ObjectLiteral | ts.SymbolFlags.Interface)) return 'Any?';
    }
    if (this.library && (ts.isIdentifier(n) || ts.isPropertyAccessExpression(n)) && this.untypedJavaFields().size) {
      const d = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n) ? n.name : n)?.valueDeclaration;
      if (d && this.untypedJavaFields().has(d)) return 'Any?';
    }
    const call = this.library ? (ts.isCallExpression(n) ? n : ts.isIdentifier(n) ? this.untypedInitializer(n) : undefined) : undefined;
    if (call) {
      const d = this.checker.getResolvedSignature(call)?.getDeclaration();
      if (d && !ts.isJSDocSignature(d) && this.returnsNullApart(implementationOf(d) ?? d)) return 'Any?';
    }
    if (this.library && (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && this.checker.getTypeAtLocation(n).flags & ts.TypeFlags.Never) return 'Any?';
    // Library mode: a class's prototype is the runtime's object for it, whatever the class's type says.
    if (this.library && ts.isPropertyAccessExpression(n) && n.name.text === 'prototype' && !(ts.isIdentifier(n.expression) && BUFFER_TYPES.has(n.expression.text))) return 'Any?';
    if (this.isPrototypeRef(n) || (ts.isPropertyAccessExpression(n) && this.isPrototypeRef(n.expression)) || this.isAmbient(n)) return 'Any?';
    if (this.library && ts.isIdentifier(n) && n.text === 'Reflect' && isLibDeclaration(this.resolve(n)?.declarations?.[0])) return 'Any?';
    // A Java package read on through `?.` (`org.nativescript?.Bootstrap`), untyped.
    if ((ts.isIdentifier(n) || ts.isPropertyAccessExpression(n)) && this.isJavaPackage(this.resolve(ts.isPropertyAccessExpression(n) ? n.name : n)) && ts.isPropertyAccessExpression(n.parent) && n.parent.expression === n && n.parent.questionDotToken) return 'Any?';
    // Library mode: a variable holding a Java package (`const androidxGraphics = androidx.core.graphics`), read untyped.
    if (this.library && ts.isIdentifier(n)) {
      const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
      const init = d && ts.isVariableDeclaration(d) && d.initializer;
      if (init && ts.isPropertyAccessExpression(init) && this.isJavaPackage(this.resolve(init.name))) return 'Any?';
    }
    if (this.untypedThis.has(n) || this.holdsFunctionObject(n)) return 'Any?';
    // A value declared `unknown` stays untyped where checks narrow it (`value !== null` makes it `{}`, which is no object shape).
    if (ts.isIdentifier(n)) {
      const decl = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
      if (decl && (ts.isParameter(decl) || ts.isVariableDeclaration(decl)) && decl.type?.kind === ts.SyntaxKind.UnknownKeyword) return 'Any?';
      // App mode: a variable a function it declares sets (`let page: Page` set by a page factory), which the checker's flow
      // reads as unset after the call: its declared type.
      if (!this.library && decl && ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name) && (n.parent as ts.NamedDeclaration | undefined)?.name !== n
          && this.checker.getTypeAtLocation(n).flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never) && this.setInClosure(decl)) {
        const declared = this.checker.getTypeOfSymbolAtLocation(this.checker.getSymbolAtLocation(n)!, decl);
        if (!(declared.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never))) return this.type(declared, decl.name);
      }
    }
    // Library mode: a read checks narrow to nothing (`value` past `typeof value === 'string'` of a string): untyped, as unchecked code may reach it.
    if (this.library && ts.isIdentifier(n) && this.checker.getTypeAtLocation(n).flags & ts.TypeFlags.Never && (n.parent as ts.NamedDeclaration | undefined)?.name !== n) return 'Any?';
    const declared = this.type(this.checker.getTypeAtLocation(n), n);
    const own = ts.isPropertySignature(n) || ts.isPropertyDeclaration(n) ? n : (n.parent as ts.NamedDeclaration | undefined)?.name === n ? n.parent : undefined;
    const t = this.isLenientDecl(own) ? this.lenientRef(declared) : this.states.looseDeclaration(own) ? optionalType(declared) : declared;
    if (this.holdingNull(t, n)) return t.replace(/>$/, '?>');
    if (['String', 'Double', 'Boolean'].includes(t) && this.givenNullSignalValue(n)) return `${t}?`;
    if (t === 'JSArray<String>' && this.unsetGroups(n)) return 'JSArray<String?>';
    if (t === 'String' && !this.library && ts.isIdentifier(n) && this.unset.element(n)) return 'String?';
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

  /**
   * App mode: a function-typed field script reads as a function object (`entry.testFunc.length`, `.apply(…)`, `.call(…)`),
   * held untyped as the function object it is given, with the fields of that name its interface and the classes
   * implementing it declare, which Kotlin has of one type.
   */
  private holdsFunctionObject(n: ts.Node): boolean {
    if (this.library) return false;
    const decl = ts.isPropertyDeclaration(n) || ts.isPropertySignature(n) ? n
      : ts.isIdentifier(n) && n.parent && (ts.isPropertyDeclaration(n.parent) || ts.isPropertySignature(n.parent)) && n.parent.name === n ? n.parent
      : ts.isPropertyAccessExpression(n) ? this.checker.getSymbolAtLocation(n.name)?.valueDeclaration : undefined;
    return !!decl && this.functionObjectFields().has(decl);
  }

  private functionObjectFieldSet?: Set<ts.Node>;
  private functionObjectFields(): Set<ts.Node> {
    if (this.functionObjectFieldSet) return this.functionObjectFieldSet;
    const held = new Set<ts.PropertyDeclaration | ts.PropertySignature>();
    this.functionObjectFieldSet = held;
    const field = (d: ts.Node | undefined): d is ts.PropertyDeclaration | ts.PropertySignature => !!d && (ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) && !d.getSourceFile().isDeclarationFile && ts.isIdentifier(d.name);
    const files = this.sourceFiles.filter((sf) => !sf.isDeclarationFile);
    const visit = (x: ts.Node): void => {
      if (ts.isPropertyAccessExpression(x) && ['length', 'apply', 'call'].includes(x.name.text) && ts.isPropertyAccessExpression(x.expression)) {
        const d = this.checker.getSymbolAtLocation(x.expression.name)?.valueDeclaration;
        if (field(d) && this.checker.getTypeAtLocation(x.expression).getCallSignatures().length) held.add(d);
      }
      ts.forEachChild(x, visit);
    };
    files.forEach(visit);
    if (!held.size) return held;
    // The same field of the interfaces and classes a type implements or extends.
    const types = files.flatMap((sf) => sf.statements.flatMap(function all(st: ts.Node): (ts.ClassDeclaration | ts.InterfaceDeclaration)[] {
      if (ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st)) return [st];
      return ts.isModuleDeclaration(st) && st.body && ts.isModuleBlock(st.body) ? st.body.statements.flatMap(all) : [];
    }));
    const bases = (t: ts.ClassDeclaration | ts.InterfaceDeclaration) => (t.heritageClauses ?? []).flatMap((h) => h.types.map((x) => {
      const sym = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(x.expression) ? x.expression.name : x.expression);
      return (sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym)?.declarations?.find((d) => ts.isClassDeclaration(d) || ts.isInterfaceDeclaration(d));
    })).filter((d): d is ts.ClassDeclaration | ts.InterfaceDeclaration => !!d);
    const member = (t: ts.ClassDeclaration | ts.InterfaceDeclaration, name: string) => (t.members as ts.NodeArray<ts.Node>).find((m): m is ts.PropertyDeclaration | ts.PropertySignature => field(m) && (m.name as ts.Identifier).text === name);
    for (let grew = true; grew;) {
      grew = false;
      for (const t of types) {
        for (const b of bases(t)) {
          for (const d of [...held]) {
            const name = (d.name as ts.Identifier).text;
            const own = member(t, name), base = member(b, name);
            if (!own || !base || held.has(own) === held.has(base)) continue;
            held.add(own); held.add(base); grew = true;
          }
        }
      }
    }
    return held;
  }

  /** An element of an array Kotlin holds untyped (`views[1]` of a tuple of more than three), whatever TypeScript types it. */
  private untypedElement(e: ts.Expression): boolean {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    return ts.isElementAccessExpression(e) && this.typeOf(e.expression).replace(/\?$/, '') === 'JSArray<Any?>' && this.typeOf(e) !== 'Any?';
  }

  /** The module `{ a: __import0_a, … }` reads the names of (the build's rewrite of `await import(…)`), or null. */
  private dynamicImport(arg: ts.Expression | undefined): string | null {
    if (!arg || !ts.isObjectLiteralExpression(arg) || !arg.properties.length) return null;
    const files = arg.properties.map((p) => {
      if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.initializer) || !/^__import\d+_/.test(p.initializer.text)) return null;
      const sym = this.checker.getSymbolAtLocation(p.initializer);
      const target = sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
      return target?.declarations?.[0]?.getSourceFile().fileName ?? null;
    });
    return files.every((f) => f && f === files[0]) ? files[0] : null;
  }

  /** A call of the program's function declared to give its type parameter, which returns undefined or null. */
  private givesNothing(e: ts.Expression): boolean {
    if (!ts.isCallExpression(e)) return false;
    const fn = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!fn || ts.isJSDocSignature(fn) || !ts.isFunctionDeclaration(fn) || !fn.body || !fn.type || !ts.isTypeReferenceNode(fn.type) || !ts.isIdentifier(fn.type.typeName)) return false;
    const param = (fn.type.typeName as ts.Identifier).text;
    if (!fn.typeParameters?.some((p) => p.name.text === param)) return false;
    let found = false;
    const visit = (n: ts.Node): void => {
      if (found || (n !== fn && ts.isFunctionLike(n))) return;
      if (ts.isReturnStatement(n) && n.expression && (n.expression.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(n.expression) && n.expression.text === 'undefined'))) found = true;
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(fn.body, visit);
    return found;
  }

  /** A call of a Java method whose result is an object (Kotlin's null for Java's null). */
  private javaObjectResult(e: ts.CallExpression): boolean {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl) || !this.native?.isNativeDeclaration(decl)) return false;
    const t = this.typeOf(e);
    return t !== 'Any?' && t !== 'Unit' && !['Double', 'Boolean'].includes(t.replace(/\?$/, ''));
  }

  /** Whether a function inside a variable's scope assigns it. */
  private setInClosure(decl: ts.VariableDeclaration): boolean {
    const scope = ts.findAncestor(decl, (x) => ts.isFunctionLike(x) || ts.isSourceFile(x));
    const sym = this.checker.getSymbolAtLocation(decl.name);
    if (!scope || !sym) return false;
    let found = false;
    const visit = (x: ts.Node, inner: boolean): void => {
      if (found) return;
      if (inner && ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(x.left) && this.checker.getSymbolAtLocation(x.left) === sym) { found = true; return; }
      ts.forEachChild(x, (c) => visit(c, inner || (ts.isFunctionLike(c) && c !== scope)));
    };
    visit(scope, false);
    return found;
  }

  /** `this` nodes that read an untyped object (a method of an object literal typed `any`). */
  private untypedThis = new Set<ts.Node>();

  /**
   * Lenient code: a declaration of an object type holds null and undefined as well, as Swift's implicitly unwrapped
   * declarations do. Kotlin declares it nullable, and a read unwraps it unless it only tests or passes the value on.
   */
  lenientRef(t: string): string {
    return this.lenient && !t.endsWith('?') && !['Nothing', 'JSSymbol', 'JSBigInt'].includes(t) && this.isObjectType(t) ? optionalType(t) : t;
  }

  /** A variable, parameter or field the program declares, in lenient code. */
  private isLenientDecl(d: ts.Node | undefined): boolean {
    return this.lenient && !!d && (ts.isVariableDeclaration(d) || ts.isParameter(d) || ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) && !d.getSourceFile().isDeclarationFile && !(ts.isParameter(d) && d.dotDotDotToken) && !presentConst(d);
  }

  /** A call of a lenient function declared to give an object: unwrapped unless the value is only tested or passed on. */
  private lenientResult(e: ts.CallExpression, code: string): string {
    if (this.rawResults.has(e) || !this.unwrapsResult(e)) return code;
    // A string, number or boolean that may be missing reads as what undefined converts to; an object is required present.
    const site = this.typeOf(e);
    // A non-strict app's null-only result: its null is carried as the app's other nulls are (`jsUncheckedNull`).
    if (this.lenientApp && this.isObjectType(site) && this.states.nullResult(e)) return `(${code} ?: jsUncheckedNull<${site}>())`;
    const field = this.states.placedField(e);
    if (field) return `jsRequired(${code}, ${kotlinString(field.name)})`;
    return ['String', 'Double', 'Boolean'].includes(site) ? this.undefinedAs(code, site) : this.asserted(code);
  }

  /** Calls whose nullable result is wanted as it is (see `maybeUndefined`). */
  private rawResults = new Set<ts.Node>();

  /** Whether a call's result Kotlin holds nullable, though its type says present, is unwrapped where it is read (see `lenientResult`). */
  private unwrapsResult(e: ts.CallExpression): boolean {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!this.lenient && !(decl && !ts.isJSDocSignature(decl) && (this.states.looseDeclaration(decl) || this.states.widenedResult(decl)))) return false;
    if (!decl || ts.isJSDocSignature(decl) || decl.getSourceFile().isDeclarationFile || !(ts.isFunctionDeclaration(decl) || ts.isMethodDeclaration(decl) || ts.isArrowFunction(decl) || ts.isFunctionExpression(decl))) return false;
    // A result nothing reads, or an optional chain's (undefined where it stops), is not unwrapped.
    const chainGoesOn = (ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent) || ts.isCallExpression(e.parent)) && e.parent.expression === e && !!(e.parent.flags & ts.NodeFlags.OptionalChain);
    if (ts.isExpressionStatement(e.parent) || (e.flags & ts.NodeFlags.OptionalChain && !chainGoesOn)) return false;
    const site = this.typeOf(e);
    return this.returnTypeOf(decl) === optionalType(site) && site !== optionalType(site) && !this.nullTolerant(e);
  }

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
    const t = this.plainDeclaredTypeOf(e);
    return t && this.heldElements(e, t);
  }

  private plainDeclaredTypeOf(e: ts.Expression): string | null {
    if (this.holdsFunctionObject(e) || this.states.heldNullish(e)) return 'Any?';
    // A shorthand property (`{ positions }`) names the variable it reads.
    let sym = ts.isIdentifier(e) && ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e
      ? this.checker.getShorthandAssignmentValueSymbol(e.parent)
      : this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    // An imported variable is the module's.
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = this.checker.getAliasedSymbol(sym);
    // A member of a mapped type (`Partial<T>`): optional where `T` declares it required.
    if (sym && !sym.valueDeclaration && sym.flags & ts.SymbolFlags.Optional && sym.declarations?.length) {
      return optionalType(this.type(this.checker.getNonNullableType(this.checker.getTypeOfSymbol(sym)), sym.declarations[0]));
    }
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    if (this.library && (this.thisValues().symbols.has(declOf(sym)) || sym.declarations?.some((d) => this.thisValues().symbols.has(d)))) return 'Any?';
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    if (ts.isIdentifier(e) && this.unsetGroups(e) && this.typeOf(decl).replace(/\?$/, '') !== 'JSMatch') return 'JSArray<String?>';
    if (!(ts.isVariableDeclaration(decl) || ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isBindingElement(decl) || ts.isGetAccessorDeclaration(decl) || ts.isPropertyAssignment(decl))) return null;
    if (ts.isParameter(decl) && this.typeTested(decl)) return 'Any?';
    if (this.library && this.untypedJavaFields().has(decl)) return 'Any?';
    let t = this.type(this.checker.getTypeOfSymbolAtLocation(sym, decl), decl);
    if (this.isLenientDecl(decl) || ts.isGetAccessorDeclaration(decl)) t = this.lenientRef(t);
    // Library mode: a getter declared `string | undefined` is read as it returns, missing or not.
    if (this.library && ts.isGetAccessorDeclaration(decl) && this.nullablePrimitiveReturn(decl)) t = optionalType(t);
    // Library mode: a member core's declarations describe (`Frame.currentPage` of `index.d.ts`) is its compiled class's, lenient as all of core.
    else if (this.library && decl.getSourceFile().isDeclarationFile && (ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isGetAccessorDeclaration(decl)) && !isLibDeclaration(decl) && !this.native?.isNativeDeclaration(decl)) t = this.lenientRef(t);
    // Lenient code: an optional member's type does not say it may be missing.
    if (this.lenient && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.questionToken) t = optionalType(t);
    // A parameter with a default is nullable in its signature only; the body sees it filled in.
    if (ts.isParameter(decl) && decl.questionToken) t = optionalType(t);
    if ((this.nullableDecls.has(sym) || this.states.looseDeclaration(decl)) && t !== 'Any?') t = optionalType(t);
    if (this.holdingNull(t, e)) t = t.replace(/>$/, '?>');
    return this.heldSignal(e) ?? t;
  }

  /** Library mode: an argument to a parameter the program's method declares nullable in Kotlin (lenient, `bundle: Bundle?`), which takes it unwrapped or not. */
  private nullableArgument(e: ts.Expression): boolean {
    if (!this.library || !ts.isCallExpression(e.parent) || !e.parent.arguments.includes(e)) return false;
    const callee = e.parent.expression;
    if (ts.isPropertyAccessExpression(callee) && this.namespaceMember(callee)) return false;
    const d = this.checker.getResolvedSignature(e.parent)?.getDeclaration();
    if (!d || ts.isJSDocSignature(d) || !(ts.isMethodDeclaration(d) || ts.isFunctionDeclaration(d)) || !d.body || d.getSourceFile().isDeclarationFile) return false;
    // Called as itself, not through a field or object holding it (`ad.showSoftInput`, of another signature).
    const named = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(callee) ? callee.name : callee);
    if (!named?.declarations?.includes(d)) return false;
    const root = ts.isMethodDeclaration(d) ? this.rootMethod(d) : d;
    const p = root.parameters[e.parent.arguments.indexOf(e)];
    return !!p && !p.dotDotDotToken && this.paramType(p).endsWith('?') && !isFunctionType(this.paramType(p).replace(/^\((.*)\)\?$/, '$1'));
  }

  /** Whether a read of `e` only tests or passes on its value, so a nullable declaration needs no unwrap there. */
  nullTolerant(e: ts.Expression): boolean {
    let n: ts.Node = e;
    while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
    if (this.nullOk.has(n) || this.nullOk.has(e) || this.states.observedAsIs(e)) return true;
    const p = n.parent;
    const K = ts.SyntaxKind;
    // A branch of a conditional, or `a ?? b`'s `b`, where the whole goes where missing is taken; or a result a function gives as nullable.
    if (ts.isConditionalExpression(p) && (p.whenTrue === n || p.whenFalse === n)) return this.nullTolerant(p);
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === K.QuestionQuestionToken && p.right === n) return this.nullTolerant(p);
    if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === n)) {
      const fn = ts.isArrowFunction(p) ? p : ts.findAncestor(p, ts.isFunctionLike);
      if (fn && (ts.isMethodDeclaration(fn) || ts.isFunctionDeclaration(fn) || ts.isGetAccessorDeclaration(fn))) {
        const rt = this.returnTypeOf(fn);
        if (isNullable(rt) || rt === 'Any?') return true;
      }
    }
    // `for (k in x)` of nothing runs no iteration.
    if (ts.isForInStatement(p) && p.expression === n) return true;
    return ts.isBinaryExpression(p) && (p.operatorToken.kind === K.AmpersandAmpersandToken || p.operatorToken.kind === K.BarBarToken);
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
      .filter((d) => !d.typeParameters?.length).map((d) => ({ name: this.topName(d, d.name.text), type: c.getDeclaredTypeOfSymbol(c.getSymbolAtLocation(d.name)!) }));
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
    // Library mode: a constructor takes at most 255 JVM argument slots (a number takes two): a literal of many fields is a record.
    if (this.library && t.getProperties().length > 96 && (t.getSymbol()?.flags ?? 0) & ts.SymbolFlags.ObjectLiteral) return 'JSRecord<Any?>';
    const conforming = this.conformingInterface(t);
    if (conforming) { this.used.add(conforming); return conforming; }
    // A plugin's (`bytes` narrowed by `Array.isArray` to a typed array that is also an array): read untyped.
    if (this.shaping.has(t) && where && this.pluginFiles.has(where.getSourceFile().fileName)) return 'Any?';
    if (this.shaping.has(t)) throw this.error(where, 'a recursive object type without a name');
    this.shaping.add(t);
    try {
      const ordered = where && ts.isObjectLiteralExpression(where) ? shapePlanOfLiteral(where, this.states).keys.map((k) => k.name) : [];
      const rank = (n: string) => (ordered.includes(n) ? ordered.indexOf(n) : ordered.length);
      const props = [...t.getProperties()].sort((a, b) => rank(a.name) - rank(b.name));
      const literal = t.getSymbol()?.declarations?.[0];
      const fields = props.map((p): ShapeField => {
        const ptype = this.checker.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!);
        let pt = this.type(ptype, where);
        if (p.valueDeclaration && ts.isPropertySignature(p.valueDeclaration)) pt = this.heldElements(p.valueDeclaration, pt);
        // A class as a value (`{ MyComponent }`, a module's exports): its Java class, untyped.
        if (pt === 'Unit' || (!this.library && pt !== 'ComponentFactory' && ptype.getConstructSignatures().length && (ptype.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class)) pt = 'Any?';
        const symbolic = wellKnownMember(p.name);
        if (symbolic) return { name: symbolic, type: pt, symbol: true };
        // Accessors of the literal itself; a spread copies an accessor's value into a plain property.
        const getter = p.declarations?.find((d) => ts.isGetAccessorDeclaration(d) && d.parent === literal);
        const setter = p.declarations?.find((d) => ts.isSetAccessorDeclaration(d) && d.parent === literal);
        if (getter || setter) return { name: memberName(p, this.checker), type: getter ? pt : optionalType(pt), accessor: { get: !!getter, set: !!setter, value: pt } };
        // Library mode: a Java object a literal holds may be missing (unchecked for null, `savedInstanceState` on a fresh start).
        return { name: memberName(p, this.checker), type: p.flags & ts.SymbolFlags.Optional || (this.library && /^[a-z]\w*[._][\w.]*[A-Z]\w*$/.test(pt)) ? optionalType(pt) : pt };
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
    // `a?.flag`: undefined where the chain stops.
    if (n.flags & ts.NodeFlags.OptionalChain && !ts.isNonNullExpression(n)) return false;
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
    return !VALUE_TYPES.has(t) && !isFunctionType(t) && !t.startsWith('(') && !this.isTypeParameterName(t) && !this.native?.isValueType(t);
  }
  isPromiseType(t: string): boolean { return t.startsWith('JSPromise<'); }

  zero(t: string): string | null {
    if (isNullable(t) || t === 'Any?') return 'null';
    if (t.startsWith('JSNullish<')) return 'JSNullish.Undefined';
    if (t === 'Double') return '0.0';
    if (t === 'String') return '""';
    if (t === 'Boolean') return 'false';
    if (/^JS(Array|Map|Set|Record)</.test(t)) return `${t}()`;
    return null;
  }

  /** `var name: type` holding a value assigned later. */
  /** A function declaration reading a `this` it does not declare (a property descriptor's `get`, a test's `this.name`): it takes the caller's first. */
  private implicitThis(fn: ts.Node): fn is ts.FunctionDeclaration {
    return ts.isFunctionDeclaration(fn) && !!fn.body && !fn.parameters.some(isThisParameter) && thisNodes(fn).length > 0 && !this.readsArguments(fn);
  }

  private plainObjectClassSet: Set<ts.Node> | null = null;
  /** Classes of uninitialized fields alone, which no code constructs, extends or tests: the declared type of plain objects. */
  private plainObjectClasses(): Set<ts.Node> {
    if (this.plainObjectClassSet) return this.plainObjectClassSet;
    const candidates = new Set<ts.Node>();
    const used = new Set<ts.Node>();
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const visit = (n: ts.Node): void => {
        if (ts.isClassDeclaration(n) && n.name && !n.heritageClauses && n.members.length && n.members.every((m) => ts.isPropertyDeclaration(m) && !m.initializer && !isStatic(m)) && !ts.getDecorators(n)?.length) candidates.add(n);
        const target = ts.isNewExpression(n) ? n.expression : ts.isHeritageClause(n) ? n.types[0]?.expression : ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword ? n.right : undefined;
        const d = target ? this.resolve(target as ts.Identifier)?.valueDeclaration : undefined;
        if (d) used.add(d);
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    for (const u of used) candidates.delete(u);
    return (this.plainObjectClassSet = candidates);
  }

  /** Whether code sets the variable to null or undefined itself. */
  private assignedNull(d: ts.VariableDeclaration): boolean {
    const sym = this.checker.getSymbolAtLocation(d.name);
    const visit = (n: ts.Node): boolean => (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left) && this.checker.getSymbolAtLocation(n.left) === sym
      && (n.right.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(n.right) && n.right.text === 'undefined'))) || !!ts.forEachChild(n, visit);
    return !!sym && visit(d.parent.parent.parent);
  }

  /** Whether code compares the variable with undefined or null (`density === undefined`), or tests its `typeof`. */
  private testedForUndefined(d: ts.VariableDeclaration): boolean {
    const sym = this.checker.getSymbolAtLocation(d.name);
    const nullish = (x: ts.Expression) => x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    const refers = (x: ts.Expression) => ts.isIdentifier(x) && this.checker.getSymbolAtLocation(x) === sym;
    const typeofOf = (x: ts.Expression, other: ts.Expression) => ts.isTypeOfExpression(x) && refers(x.expression) && ts.isStringLiteralLike(other);
    const visit = (n: ts.Node): boolean => (ts.isBinaryExpression(n) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(n.operatorToken.kind)
      && ((refers(n.left) && nullish(n.right)) || (refers(n.right) && nullish(n.left)) || typeofOf(n.left, n.right) || typeofOf(n.right, n.left))) || !!ts.forEachChild(n, visit);
    return !!sym && visit(d.getSourceFile());
  }

  /** Whether a binding is read as a condition or compared with null or undefined anywhere in its scope. */
  private truthTested(name: ts.Identifier): boolean {
    const sym = this.checker.getSymbolAtLocation(name);
    if (!sym) return false;
    const refers = (x: ts.Node | undefined): boolean => {
      while (x && ts.isParenthesizedExpression(x)) x = x.expression;
      return !!x && ts.isIdentifier(x) && this.checker.getSymbolAtLocation(x) === sym;
    };
    const scope = ts.findAncestor(name, (n) => ts.isFunctionLike(n) || ts.isSourceFile(n)) ?? name.getSourceFile();
    return this.testedIn(scope, refers);
  }

  /** Whether a class's code tests a field of its own for being there (`if (!this.field)`, `this.field?.x`). */
  private memberTruthTested(cls: ts.ClassLikeDeclaration, name: string): boolean {
    const refers = (x: ts.Node | undefined): boolean => {
      while (x && ts.isParenthesizedExpression(x)) x = x.expression;
      return !!x && ts.isPropertyAccessExpression(x) && x.expression.kind === ts.SyntaxKind.ThisKeyword && x.name.text === name;
    };
    let chained = false;
    const visit = (n: ts.Node): void => {
      if (chained) return;
      if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n)) && n.questionDotToken && refers(n.expression)) chained = true;
      else ts.forEachChild(n, visit);
    };
    visit(cls);
    return chained || this.testedIn(cls, refers);
  }

  private testedIn(scope: ts.Node, refers: (x: ts.Node | undefined) => boolean): boolean {
    const nullish = (x: ts.Expression) => x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    const logical = [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken];
    const equality = [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken];
    const visit = (n: ts.Node): boolean =>
      (ts.isConditionalExpression(n) && refers(n.condition))
      || ((ts.isIfStatement(n) || ts.isWhileStatement(n) || ts.isDoStatement(n)) && refers(n.expression))
      || (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken && refers(n.operand))
      || (ts.isBinaryExpression(n) && logical.includes(n.operatorToken.kind) && refers(n.left))
      || (ts.isBinaryExpression(n) && equality.includes(n.operatorToken.kind) && ((refers(n.left) && nullish(n.right)) || (refers(n.right) && nullish(n.left))))
      || !!ts.forEachChild(n, visit);
    return visit(scope);
  }

  /** Component fields without an initializer are state, not props (Angular). */
  plainFields = false;
  /**
   * The app's objects are read by name at run time (an XML app's bindings and `{{ onTap }}` handlers, through core's
   * Builder): every class's accessors and methods by name, not only those of classes extending the kit's.
   */
  appMembersByName = false;

  /**
   * Whether a variable declared without a value is set on every path before anything reads it (a closure naming it
   * counts as a read), as Kotlin requires of a variable declared without one, and whether only once (a `val`).
   * Conservative: loops, switches and try statements naming it count as reads.
   */
  /** `destructured`: a destructuring assignment's plain target (`[a, b] = …`) counts as set. */
  private assignedBeforeUse(d: ts.VariableDeclaration, destructured = false): 'once' | 'more' | null {
    const sym = ts.isIdentifier(d.name) ? this.checker.getSymbolAtLocation(d.name) : undefined;
    const statement = d.parent.parent;
    if (!sym || !ts.isVariableStatement(statement) || !ts.isBlock(statement.parent)) return null;
    const names = (n: ts.Node) => refersTo(n, sym, this.checker);
    const own = statement.declarationList.declarations;
    if (own.slice(own.indexOf(d) + 1).some(names)) return null;
    // Whether each path sets it before reading it, and sets it only once then.
    type Flow = { kind: 'assigned' | 'read' | 'none'; once?: boolean };
    const flow = (s: ts.Statement): Flow => {
      if (ts.isExpressionStatement(s)) {
        let e = s.expression;
        while (ts.isParenthesizedExpression(e)) e = e.expression;
        if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(e.left) && this.checker.getSymbolAtLocation(e.left) === sym) return { kind: names(e.right) ? 'read' : 'assigned', once: true };
        if (destructured && ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !names(e.right)) {
          const targets = ts.isArrayLiteralExpression(e.left) ? e.left.elements : ts.isObjectLiteralExpression(e.left) ? e.left.properties.map((p) => (ts.isShorthandPropertyAssignment(p) && !p.objectAssignmentInitializer ? p.name : ts.isPropertyAssignment(p) ? p.initializer : p)) : [];
          if (targets.some((x) => ts.isIdentifier(x) && this.checker.getSymbolAtLocation(x) === sym)) return { kind: 'assigned', once: false };
        }
        return { kind: names(s) ? 'read' : 'none' };
      }
      if (ts.isBlock(s)) return sequence(s.statements);
      if (ts.isIfStatement(s)) {
        if (names(s.expression)) return { kind: 'read' };
        const branch = (b: ts.Statement | undefined): Flow => (!b ? { kind: 'none' } : this.exits(b) && !names(b) ? { kind: 'assigned', once: true } : flow(b));
        const a = branch(s.thenStatement), b = branch(s.elseStatement);
        if (a.kind === 'read' || b.kind === 'read') return { kind: 'read' };
        return a.kind === 'assigned' && b.kind === 'assigned' ? { kind: 'assigned', once: a.once && b.once } : { kind: 'none' };
      }
      if (ts.isDoStatement(s)) {
        const body = flow(s.statement);
        return body.kind === 'assigned' ? { kind: 'assigned', once: false } : { kind: body.kind === 'read' || names(s.expression) ? 'read' : 'none' };
      }
      // A loop setting it before reading it in each pass: read nowhere else, it is set where it is read.
      if (ts.isWhileStatement(s) || ts.isForStatement(s) || ts.isForOfStatement(s) || ts.isForInStatement(s)) {
        const head = ts.isWhileStatement(s) ? [s.expression] : ts.isForStatement(s) ? [s.initializer, s.condition, s.incrementor] : [s.initializer, s.expression];
        if (head.some((x) => x && names(x))) return { kind: 'read' };
        return { kind: flow(s.statement).kind === 'read' ? 'read' : 'none' };
      }
      if (ts.isTryStatement(s)) {
        if (s.finallyBlock && names(s.finallyBlock)) return { kind: 'read' };
        const body = flow(s.tryBlock), caught = s.catchClause ? (this.exits(s.catchClause.block) && !names(s.catchClause.block) ? { kind: 'assigned' as const } : flow(s.catchClause.block)) : { kind: 'none' as const };
        if (body.kind === 'read' || caught.kind === 'read') return { kind: 'read' };
        return { kind: body.kind === 'assigned' && (!s.catchClause || caught.kind === 'assigned') ? 'assigned' : 'none', once: false };
      }
      return { kind: names(s) ? 'read' : 'none' };
    };
    const sequence = (list: readonly ts.Statement[]): Flow => {
      for (let k = 0; k < list.length; k++) {
        const f = flow(list[k]);
        if (f.kind === 'assigned') return { kind: 'assigned', once: f.once && !list.some((x, j) => j !== k && assignsTo(x, sym, this.checker)) };
        if (f.kind === 'read') return f;
        if (this.exits(list[k])) return { kind: 'assigned', once: !list.slice(0, k + 1).some((x) => assignsTo(x, sym, this.checker)) };
      }
      return { kind: 'none' };
    };
    const rest = statement.parent.statements;
    const f = sequence(rest.slice(rest.indexOf(statement) + 1));
    return f.kind === 'read' ? null : f.kind === 'assigned' && f.once ? 'once' : 'more';
  }

  private letterTypes: Set<string> | null = null;
  /** A one-letter Kotlin type that is not one of the program's classes, interfaces or enums. */
  isTypeParameterName(t: string): boolean {
    if (!/^[A-Z]$/.test(t)) return false;
    if (!this.letterTypes) {
      this.letterTypes = new Set();
      const visit = (n: ts.Node): void => {
        if ((ts.isClassDeclaration(n) || ts.isInterfaceDeclaration(n) || ts.isEnumDeclaration(n)) && n.name && n.name.text.length === 1) this.letterTypes!.add(this.topName(n, n.name.text));
        ts.forEachChild(n, visit);
      };
      for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    }
    return !this.letterTypes.has(t);
  }

  private definiteFieldSets = new Map<ts.ClassLikeDeclaration, Set<ts.PropertyDeclaration>>();
  private definiteFields(cls: ts.ClassLikeDeclaration): Set<ts.PropertyDeclaration> {
    let set = this.definiteFieldSets.get(cls);
    if (!set) this.definiteFieldSets.set(cls, set = definitelyAssignedFields(cls));
    return set;
  }

  deferredDeclaration(name: string, t: string): string {
    const z = this.zero(t);
    if (z) return `var ${name}: ${t} = ${z}`;
    if (t === 'Unit') return `var ${name}: Unit = Unit`;
    if (this.isTypeParameterName(t) || t === 'Nothing') return `var ${name}: ${optionalType(t)} = null`;
    return `lateinit var ${name}: ${t}`;
  }

  // ---- Modules -------------------------------------------------------------------------------

  /** A module's declarations, and the statements that run when it is first imported. */
  module(sf: ts.SourceFile): { code: string; init: string[] } {
    const refused = this.states.nullish().refused.filter(([n]) => n.getSourceFile() === sf).sort(([a], [b]) => a.getStart() - b.getStart())[0];
    if (refused) throw this.error(refused[0], refused[1]);
    this.props = new Set();
    this.moduleTemporaries.clear();
    const out: string[] = [];
    const init: string[] = [];
    // Library mode: the module's functions and variables are its object's members; its init runs in that object.
    const moduleObject = this.library?.moduleName?.(sf.fileName) ?? null;
    const members: string[] = moduleObject ? [] : out;
    const lexical: string[] = [];
    let current: ts.Statement | null = null;
    const later = (code: () => string) => { this.indent = '    '; try { init.push((current && this.lines ? this.lines.mark(current) : '') + code()); } finally { this.indent = ''; } };
    for (const st of sf.statements) {
      current = st;
      try {
        if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) continue;
        if (this.givesPrototypeDefault(st)) continue;
        if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
        if (this.reach && !this.reach.keeps(st)) continue;
        if (ts.isInterfaceDeclaration(st) && this.library && this.checker.getSymbolAtLocation(st.name)?.declarations?.some(ts.isClassDeclaration)) continue;
        if (ts.isInterfaceDeclaration(st)) { this.registerInterface(this.topName(st, st.name.text), sf.fileName, st.members, st); continue; }
        if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type) && !isRegExpProtocol(this.checker.getTypeAtLocation(st.type))) { this.registerInterface(this.topName(st, st.name.text), sf.fileName, st.type.members, st); continue; }
        if (ts.isTypeAliasDeclaration(st) && intersectionAliasMembers(st, this.checker)) { this.registerInterface(this.topName(st, st.name.text), sf.fileName, ts.factory.createNodeArray(intersectionAliasMembers(st, this.checker)!), st); continue; }
        if (ts.isTypeAliasDeclaration(st)) continue;
        if (ts.isEnumDeclaration(st)) {
          // A namespace merged into the enum: members of its object.
          const merged = (this.checker.getSymbolAtLocation(st.name)?.declarations ?? []).filter((d): d is ts.ModuleDeclaration => ts.isModuleDeclaration(d) && d.getSourceFile() === sf).flatMap((md) => this.namespaceMembers(md, later) ?? []);
          out.push(this.enumDecl(st, merged));
          continue;
        }
        if (ts.isModuleDeclaration(st) && this.mergedClass(st)) continue;
        if (ts.isModuleDeclaration(st)) { const ns = this.namespaceDecl(st, this.topName(st, st.name.text), later); if (ns) out.push(ns); continue; }
        if (ts.isFunctionDeclaration(st) && st.name && this.library?.counterpart(sf.fileName, st.name.text)) continue;
        if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) members.push(this.func(st, ident(this.topName(st, st.name.text)))); continue; }
        if (ts.isClassDeclaration(st)) {
          const target = this.patterns.mixinTarget(st);
          if (target) { out.push(this.mixinDecl(st, target)); continue; }
          const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component')) || (!!st.name && this.components.has(st.name.text));
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
              for (const n of boundNames(d.name)) {
                if (ts.isBindingElement(n.parent) && this.matchGroupBinding(n.parent)) {
                  const sym = this.resolve(n);
                  if (sym) this.undefinedVars.set(sym, 'String?');
                  members.push(moduleProperty(`var ${ident(this.topName(n.parent, n.text))}: String? = null`));
                } else members.push(moduleProperty(this.deferredDeclaration(ident(this.topName(n.parent, n.text)), this.typeOf(n))));
              }
              const tmp = this.fresh('__d');
              later(() => `    val ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, '', 'assign')}`);
              continue;
            }
            const extension = this.native?.extensionClass(d);
            if (extension) { out.push(extension); continue; }
            if (this.patterns.requiredCore(d) || this.native?.isClassAlias(d)) continue;
            const name = ident(this.topName(d, d.name.text));
            // A variable only ever undefined (this platform's half of `isIOS ? x : undefined`) holds nothing: any value.
            const t = this.typeOf(d.name) === 'Unit' ? 'Any?' : this.typeOf(d.name);
            if (redeclaredVar(d, this.checker)) {
              if (d.initializer) later(() => `    ${name} = ${this.stored(d.initializer!, d, t)}`);
              continue;
            }
            if (this.states.nullishHeld(d)) {
              members.push(moduleProperty(`var ${name}: ${t} = JSNullish.Undefined`));
              if (d.initializer) later(() => `    ${name} = ${this.stored(d.initializer!, d, t)}`);
              continue;
            }
            // A plugin's unset object variable (`let vibrator: Vibrator`, tested before it is assigned): nullable, unwrapped where it is read.
            // So is an app's one its code tests (`let instance: Sdk;` … `if (!instance)`).
            if (!d.initializer && (this.pluginFiles.has(sf.fileName) || this.truthTested(d.name)) && !t.endsWith('?') && this.isObjectType(t) && !isFunctionType(t)) {
              const sym = this.checker.getSymbolAtLocation(d.name);
              if (sym) this.nullableDecls.add(sym);
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              continue;
            }
            // Lenient code: `let callback: () => void = null`, or unset, nullable, unwrapped where it is read.
            if (this.lenient && !isNullable(t) && t !== 'Any?' && (this.zero(t) ?? 'null') === 'null' && (d.initializer ? d.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d.initializer) && d.initializer.text === 'undefined') : isFunctionType(t))) {
              const sym = this.checker.getSymbolAtLocation(d.name);
              if (sym) this.nullableDecls.add(sym);
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              continue;
            }
            // Library mode: `let density: number;` (or `= undefined`) that code tests for undefined before setting it: nullable.
            const unset = !d.initializer || d.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d.initializer) && d.initializer.text === 'undefined');
            if (this.library && unset && ['Double', 'Boolean', 'String'].includes(t) && this.testedForUndefined(d)) {
              const sym = this.checker.getSymbolAtLocation(d.name);
              if (sym) this.nullableDecls.add(sym);
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              continue;
            }
            if (!d.initializer && this.lenientApp && !this.library && ['Double', 'Boolean', 'String'].includes(t) && this.states.appCode(d)) {
              const sym = this.resolve(d.name);
              if (sym) this.undefinedVars.set(sym, optionalType(t));
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              continue;
            }
            if (!d.initializer) { members.push(moduleProperty(this.deferredDeclaration(name, t))); continue; }
            const maybe = !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
            if (maybe) {
              const sym = this.resolve(d.name);
              if (sym) this.undefinedVars.set(sym, optionalType(t));
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              later(() => `    ${name} = ${(this.typeOf(d.initializer!) === 'Any?' || this.untypedElement(d.initializer!)) && t !== 'Any?' ? this.checkedPlacement(d.initializer!, optionalType(t), maybe, this.storeSlot(d.initializer!, optionalType(t), d)) ?? this.fromAny(maybe, optionalType(t)) : maybe}`);
              continue;
            }
            // A module's Angular `computed(fn)`: read through `x()`, its value is fn's whenever it is read.
            const computedFn = ts.isCallExpression(d.initializer) && this.calleeName(d.initializer) === 'computed' && this.isLibCall(d.initializer) ? d.initializer.arguments[0] : undefined;
            if (computedFn && (ts.isArrowFunction(computedFn) || ts.isFunctionExpression(computedFn))) {
              const rt = this.computedType(d.initializer as ts.CallExpression);
              const saved = this.indent;
              this.indent = '    ';
              try { members.push(`val ${name}: ${rt}\n    get() ${this.functionBody(computedFn, rt, '    ')}`); } finally { this.indent = saved; }
              continue;
            }
            if (this.pure(d.initializer)) { members.push(moduleProperty(`${constant && !this.mutatedLater(d) ? 'val' : 'var'} ${name}: ${t} = ${this.stored(d.initializer, d, t)}`)); continue; }
            // App mode: the result of a function that gives undefined for its type parameter (`ios(f)`, this platform's half
            // of `__APPLE__ ? f : undefined`): nullable.
            if (!this.library && !isNullable(t) && this.givesNothing(d.initializer)) {
              const sym = this.checker.getSymbolAtLocation(d.name);
              if (sym) this.nullableDecls.add(sym);
              members.push(moduleProperty(`var ${name}: ${optionalType(t)} = null`));
              later(() => `    ${name} = ${this.expr(d.initializer!)}`);
              continue;
            }
            // A lateinit property's setter throws on the null a non-strict app's function gives where its type says an object.
            if (this.givenNullResult(d)) {
              this.noteNullVar(d);
              members.push(moduleProperty(`var ${name}: ${t} = jsUncheckedNull()`));
              later(() => `    ${name} = ${this.stored(d.initializer!, d, t)}`);
              continue;
            }
            const deferred = this.deferredDeclaration(name, t);
            // A `let` or `const` read before its declaration runs is JavaScript's ReferenceError: the runtime knows its name.
            if (deferred.startsWith('lateinit ') && st.declarationList.flags & ts.NodeFlags.BlockScoped) {
              const kotlinName = name.replace(/`/g, '');
              lexical.push(kotlinName === d.name.text ? kotlinName : `${kotlinName}:${d.name.text}`);
            }
            members.push(moduleProperty(deferred));
            later(() => `    ${name} = ${this.stored(d.initializer!, d, t)}`);
          }
          continue;
        }
        later(() => this.stmt(st));
      } catch (e) {
        const located = this.located(e, st);
        if (!this.errors) throw located;
        this.errors.push((located as Error).message ?? String(located));
      } finally { out.push(...this.hoisted.splice(0)); }
    }
    const names = lexical.map(kotlinString).join(', ');
    if (lexical.length && !moduleObject) out.push(`private val __lexical_${ident(sf.fileName.replace(/^.*[\\/]/, '').replace(/\W+/g, '_'))} = jsLexical(${names})`);
    if (moduleObject) {
      const body = [...(lexical.length ? [`init {\n    jsLexical(${names})\n}`] : []), ...members, ...(init.length ? [`fun __init() {\n${reportedInit(init)}\n}`] : [])];
      out.push([`${this.threadAnnotation(sf)}object ${moduleObject} {`, ...body.map((m) => m.split('\n').map((x) => (x ? '    ' + x : x)).join('\n')), '}'].join('\n'));
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
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(this.topName(st, st.name.text), md.getSourceFile().fileName, st.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type) && !isRegExpProtocol(this.checker.getTypeAtLocation(st.type))) { this.registerInterface(this.topName(st, st.name.text), md.getSourceFile().fileName, st.type.members, st); continue; }
      if (ts.isTypeAliasDeclaration(st) && intersectionAliasMembers(st, this.checker)) { this.registerInterface(this.topName(st, st.name.text), md.getSourceFile().fileName, ts.factory.createNodeArray(intersectionAliasMembers(st, this.checker)!), st); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      values = true;
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) lines.push(this.func(st, ident(st.name.text))); continue; }
      // A namespace merged into a class of this namespace's (`xml2ui.TemplateParser`): its companion's members, below.
      if (ts.isModuleDeclaration(st) && md.body.statements.some((x) => ts.isClassDeclaration(x) && x.name?.text === st.name.getText())) continue;
      if (ts.isModuleDeclaration(st)) { const inner = this.namespaceDecl(st, st.name.text, later); if (inner) lines.push(inner); continue; }
      if (ts.isEnumDeclaration(st)) { lines.push(this.enumDecl(st)); continue; }
      if (ts.isVariableStatement(st)) {
        const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) throw this.error(d, 'a destructuring declaration in a namespace');
          const name = ident(d.name.text);
          const t = this.typeOf(d.name);
          if (d.initializer && this.pure(d.initializer)) { lines.push(`@JvmField ${constant ? 'val' : 'var'} ${name}: ${t} = ${this.stored(d.initializer, d, t)}`); continue; }
          lines.push(this.deferredDeclaration(name, t));
          if (d.initializer) later(() => `    ${path}.${name} = ${this.stored(d.initializer!, d, t)}`);
        }
        continue;
      }
      if (ts.isClassDeclaration(st)) {
        const merged = (md.body as ts.ModuleBlock).statements.filter((x): x is ts.ModuleDeclaration => ts.isModuleDeclaration(x) && x.name.getText() === st.name?.text);
        const saved = this.mergedStatics;
        this.mergedStatics = merged.flatMap((x) => this.namespaceMembers(x, later) ?? []);
        try { lines.push(this.classDecl(st)); } finally { this.mergedStatics = saved; }
        continue;
      }
      later(() => this.stmt(st));
    }
    return values ? lines : null;
  }

  private mergedStatics: string[] = [];
  /** Classes declared inside functions, declared at the module's top level. */
  private hoisted: string[] = [];

  /** Whether a class declared in a function reads nothing the function declares. */
  /** What a class declared in a function reads of the function's, which keeps it from the top level. */
  private captured = new Map<ts.Node, string>();
  private capturesNothing(cls: ts.ClassDeclaration, seen = new Set<ts.Node>()): boolean {
    const fn = ts.findAncestor(cls.parent, ts.isFunctionLike);
    if (!fn) return true;
    seen.add(cls);
    let captures = false;
    const visit = (n: ts.Node): void => {
      if (captures) return;
      if (ts.isIdentifier(n)) {
        const d = this.resolve(n)?.declarations?.[0];
        // Another class of the function's declared at the top level too, and its types, are no capture.
        // A member's name is no capture; a local alias of a Java class (`const AccessibilityDelegate = android.view.View.AccessibilityDelegate`) names that class.
        const local = !!d && (ts.isParameter(d) || ts.isFunctionDeclaration(d) || ts.isBindingElement(d) || (ts.isVariableDeclaration(d) && !this.native?.isClassAlias(d)) || ts.isClassDeclaration(d));
        const hoisted = !local || (ts.isClassDeclaration(d!) && (seen.has(d!) || this.capturesNothing(d as ts.ClassDeclaration, seen)));
        if (d && !hoisted && d.getSourceFile() === cls.getSourceFile() && d.pos >= fn.pos && d.end <= fn.end && !(d.pos >= cls.pos && d.end <= cls.end)) { captures = true; this.captured.set(cls, n.text); }
      }
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(cls, visit);
    return !captures;
  }

  private prototypeStatements = new Set<ts.Node>();
  /** A statement `prototypeDefaults` gives to the class it assigns. */
  private givesPrototypeDefault(st: ts.Statement): boolean {
    this.prototypeDefaults();
    return this.prototypeStatements.has(st);
  }
  private prototypeFields: Map<ts.Node, { field: ts.PropertyDeclaration; value: ts.Expression }[]> | null = null;
  /**
   * Library code's `View.prototype.row = 0` at a module's top level: a field no class initializes, given a value
   * every instance reads until it sets its own. Each instance of the class starts with it.
   */
  private prototypeDefaults(): Map<ts.Node, { field: ts.PropertyDeclaration; value: ts.Expression }[]> {
    if (this.prototypeFields) return this.prototypeFields;
    this.prototypeFields = new Map();
    if (!this.library) return this.prototypeFields;
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      for (const st of sf.statements) {
        const x = ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken ? st.expression : null;
        const target = x && ts.isPropertyAccessExpression(x.left) && ts.isPropertyAccessExpression(x.left.expression) && x.left.expression.name.text === 'prototype' ? x.left : null;
        if (!x || !target || !this.constantInit(x.right)) continue;
        const cls = this.resolve((target.expression as ts.PropertyAccessExpression).expression)?.valueDeclaration;
        if (!cls || !ts.isClassDeclaration(cls) || cls.getSourceFile().isDeclarationFile) continue;
        const field = this.checker.getTypeAtLocation(cls).getProperty(target.name.text) ?? this.checker.getDeclaredTypeOfSymbol(this.resolve(cls.name!)!).getProperty(target.name.text);
        const decls = field?.declarations ?? [];
        if (!decls.length || !decls.every((d) => ts.isPropertyDeclaration(d) && !d.initializer && !isStatic(d) && !d.getSourceFile().isDeclarationFile)) continue;
        (this.prototypeFields.get(cls) ?? this.prototypeFields.set(cls, []).get(cls)!).push({ field: decls[0] as ts.PropertyDeclaration, value: x.right });
        this.prototypeStatements.add(st);
      }
    }
    return this.prototypeFields;
  }
  private protoKeys: { data: Set<string>; accessors: Set<string> } | null = null;
  /** The names `X.prototype.name = v` writes and `Object.defineProperty(X.prototype, 'name', …)` defines, anywhere in the program. */
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
    // `View.prototype[setter] = …` with the name a value (`setter: '_setMinWidthNative'`): the names the file spells as strings.
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      let dynamic = false;
      const find = (n: ts.Node): void => {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(n.left) && isPrototype(n.left.expression) && !ts.isStringLiteralLike(n.left.argumentExpression)) dynamic = true;
        if (!dynamic) ts.forEachChild(n, find);
      };
      find(sf);
      if (!dynamic) continue;
      const strings = (n: ts.Node): void => {
        if (ts.isPropertyAssignment(n) && ts.isStringLiteralLike(n.initializer) && /^[A-Za-z_$][\w$]*$/.test(n.initializer.text)) data.add(n.initializer.text);
        ts.forEachChild(n, strings);
      };
      strings(sf);
    }
    return (this.protoKeys = { data, accessors });
  }
  /** The fields `prototypeDefaults` gives each instance a value for. */
  private prototypeDefaulted(): Set<ts.Node> {
    return new Set([...this.prototypeDefaults().values()].flatMap((list) => list.map((d) => d.field)));
  }
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
    if (outer) return `${this.namespacePath(outer)}.${ident(md.name.text)}`;
    // Library mode: by the package, as a parameter or member of the same name (`encoding`) hides the namespace.
    const own = ident(this.topName(md, md.name.text));
    return this.library && this.appModule ? `${this.appModule}.${own}` : own;
  }

  /** A reference to a namespace's member (`N.member`) or, in library mode, a module's function or variable (`<module object>.name`); null for the rest. */
  private qualifiedDecl(decl: ts.Declaration, name: string): string | null {
    if (decl.getSourceFile().isDeclarationFile) return null;
    const statement = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
    const owner = ts.isSourceFile(statement.parent) && (ts.isFunctionDeclaration(statement) || ts.isVariableStatement(statement)) ? this.library?.moduleName?.(decl.getSourceFile().fileName) : null;
    // `export default function lazy`: the function's own name.
    const own = (ts.isFunctionDeclaration(decl) || ts.isVariableDeclaration(decl)) && decl.name && ts.isIdentifier(decl.name) ? decl.name.text : name;
    if (owner) return `${owner}.${ident(own)}`;
    if (!ts.isModuleBlock(statement.parent) || !ts.isModuleDeclaration(statement.parent.parent)) return null;
    const outer = this.namespacePath(statement.parent.parent);
    return outer ? `${outer}.${ident(name)}` : null;
  }

  /** An identifier as a reference to what it names: qualified where its declaration is a namespace's. */
  refName(e: ts.Identifier): string {
    // Library mode: `{ prompt }` names the variable or function it reads, not the property.
    const local = this.library && ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e ? this.checker.getShorthandAssignmentValueSymbol(e.parent) : this.checker.getSymbolAtLocation(e);
    // An imported type merged with a module's own variable of its name (`let WebViewClient: WebViewClient`): the variable.
    const target = local && local.flags & ts.SymbolFlags.Alias && !local.valueDeclaration ? this.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration;
    const counterpart = decl && ts.isFunctionDeclaration(decl) && ts.isSourceFile(decl.parent) ? this.library?.counterpart(decl.getSourceFile().fileName, target!.name) : null;
    if (counterpart) return counterpart;
    return (decl && this.qualifiedDecl(decl, target!.name)) ?? this.unshadowed(e, decl, ident(this.declaredName(e)));
  }

  /** `{ name }`'s value: in library mode what the name reads (a module's variable, a class, a function) as any read of it is. */
  private shorthandValue(e: ts.Identifier): string {
    return this.library ? this.expr(e) : this.shorthandFunction(e) ?? ident(e.text);
  }

  /** App mode: `{ flag }` of a function declaration, a reference to it; the name's own symbol is the property's. */
  private shorthandFunction(e: ts.Identifier): string | null {
    const local = ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e ? this.checker.getShorthandAssignmentValueSymbol(e.parent) : undefined;
    const target = local && local.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration;
    if (!decl || !ts.isFunctionDeclaration(decl) || !decl.body || decl.getSourceFile().isDeclarationFile || this.implicitThis(decl)) return null;
    const ref = this.unshadowed(e, decl, ident(this.topNames().get(decl) ?? target!.name));
    const dot = ref.lastIndexOf('.');
    return dot < 0 ? `::${ref}` : `${ref.slice(0, dot)}::${ref.slice(dot + 1)}`;
  }

  /** A module-level name read inside a namespace with a member of the same name: qualified by the app's module. */
  private unshadowed(at: ts.Node, decl: ts.Declaration | undefined, name: string): string {
    if (!this.appModule || !decl || ts.isSourceFile(decl)) return name;
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
    // A class's static member or an enum's member, where a namespace merges into the class or enum; a property script
    // assigns a function (`fn.tag = …`), which is the function value's.
    if (!decl || ts.isClassElement(decl) || ts.isEnumMember(decl) || ts.isPropertyAccessExpression(decl) || ts.isBinaryExpression(decl)) return null;
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
      const decl = (ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e ? this.checker.getShorthandAssignmentValueSymbol(e.parent) : this.resolve(e))?.valueDeclaration;
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
    if (ts.isPropertyAccessExpression(e)) {
      // A namespace's variable is set at load only when its own initializer is.
      const member = this.resolve(e.name)?.valueDeclaration;
      if (member && ts.isVariableDeclaration(member) && ts.isModuleBlock(member.parent.parent.parent) && !member.getSourceFile().isDeclarationFile) return member.getSourceFile() === e.getSourceFile() && !!member.initializer && this.pure(member.initializer);
      return this.pure(e.expression) && !(ts.isIdentifier(e.expression) && this.isLibGlobal(e.expression) && !LIB_CONSTANTS[`${e.expression.text}.${e.name.text}`]);
    }
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
      const sym = ts.isShorthandPropertyAssignment(e.parent) && e.parent.name === e ? this.checker.getShorthandAssignmentValueSymbol(e.parent) : this.resolve(e);
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
    if (this.protocols.has(name)) { this.interfaces.set(name, { file, code: () => this.protocolCode(name, this.library ? this.withInherited(decl, members) : members) }); return; }
    const typeParams = (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) ? decl.typeParameters : undefined;
    // Its type parameters erased (`Cached<T>`, `PropertyOptions<T, U>`): one class of fields for every instantiation, its
    // fields of a parameter read as each use types them. Parameters constrained to a primitive (`Option extends string`) erase to it.
    const all = this.withInherited(decl, members);
    this.interfaces.set(name, { file, code: () => this.objectClass(name, all.filter((m, k) => (ts.isPropertySignature(m) || ts.isMethodSignature(m)) && all.findIndex((x) => x.name?.getText() === m.name?.getText()) === k).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t };
    }), null) });
  }

  /** Library mode: an interface's members with those of the program's interfaces it extends (`PinchGestureEventData extends GestureEventData`), its own first. */
  private withInherited(decl: ts.Node, members: ts.NodeArray<ts.TypeElement>): ts.NodeArray<ts.TypeElement> {
    if (!ts.isInterfaceDeclaration(decl) || !decl.heritageClauses) return members;
    const all = [...members];
    const seen = new Set(members.map((m) => m.name?.getText()));
    for (const h of decl.heritageClauses) for (const x of h.types) {
      const base = this.checker.getTypeAtLocation(x).getSymbol()?.declarations?.find((d): d is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(d) && !d.getSourceFile().isDeclarationFile);
      if (!base) continue;
      for (const m of this.withInherited(base, base.members)) if (!seen.has(m.name?.getText())) { seen.add(m.name?.getText()); all.push(m); }
    }
    return ts.factory.createNodeArray(all);
  }

  /** An interface classes implement: a Kotlin interface, and `<Name>Object` for the object literals of its type. */
  private protocolCode(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t, readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) };
    });
    const methods = members.filter(ts.isMethodSignature).map((m) => {
      const params = m.parameters.map((p, k) => ({ name: ts.isIdentifier(p.name) ? ident(p.name.text) : `p${k}`, type: this.requirementParamType(p) }));
      return { name: ident(m.name.getText()), params, ret: this.returnTypeOf(m) };
    });
    const signature = (m: (typeof methods)[0]) => `fun ${m.name}(${m.params.map((p) => `${p.name}: ${p.type}`).join(', ')})${m.ret === 'Unit' ? '' : `: ${m.ret}`}`;
    const fnType = (m: (typeof methods)[0]) => `(${m.params.map((p) => p.type).join(', ')}) -> ${m.ret}`;
    const lines = [`interface ${name} : JSDynamic {`];
    // Library mode: read-only in the interface, so a class implementing it may hold a narrower type (`android: MotionEvent` for `any`).
    for (const f of fields) lines.push(`    ${f.readonly || this.library ? 'val' : 'var'} ${ident(f.name)}: ${f.type}`);
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

  private setLater: Set<string> | null = null;
  /** Names of members the program assigns on objects that are not class instances (`options.width = 2`). */
  private membersSetLater(): Set<string> {
    return (this.setLater ??= assignedMembers(this.checker, this.sourceFiles));
  }

  /** A plain JavaScript object of a known shape: a class with named fields, readable as a dynamic object. */
  private objectClass(name: string, allFields: ShapeField[], className: string | null, implementing?: string, overrides?: Set<string>): string {
    if (allFields.some((f) => f.accessor)) return this.accessorClass(name, allFields);
    const fields = allFields.filter((f) => !f.symbol);
    const protocols = this.shapeProtocols(allFields);
    // Keys apart only in their first letter's case (`vert`, `Vert`) have one JVM accessor name: fields, without accessors.
    const firsts = new Map<string, number>();
    for (const f of fields) { const k = f.name[0].toLowerCase() + f.name.slice(1); firsts.set(k, (firsts.get(k) ?? 0) + 1); }
    const jvmField = (f: ShapeField) => !overrides?.has(f.name) && (firsts.get(f.name[0].toLowerCase() + f.name.slice(1)) ?? 0) > 1;
    const optional = fields.filter((f) => holdsNil(heldOf(f.type)));
    // An optional member set after the object is made becomes its last key, as a property JavaScript adds does.
    const symbolic = allFields.some((f) => f.symbol);
    const tracked = new Set(symbolic ? [] : optional.filter((f) => (!overrides?.has(f.name) || !this.library) && !jvmField(f)).map((f) => f.name));
    const modifiers = (f: ShapeField) => (overrides?.has(f.name) ? 'override ' : jvmField(f) ? '@JvmField ' : '');
    // A literal stores what it is given, undefined included (`{ …, view } as ItemEventData` before the view exists). Kotlin
    // checks a non-null constructor parameter at the call, so such a field is set from a nullable one inside the class.
    const loose = (f: ShapeField) => !this.library && !tracked.has(f.name) && !holdsNil(heldOf(f.type)) && this.zero(f.type) === null && f.type !== 'Unit' && !this.isTypeParameterName(f.type);
    // A field the program writes, on an object read from another (an event's data), writes that object too.
    const through = new Set(this.library || symbolic ? [] : fields.filter((f) => !jvmField(f) && this.membersSetLater().has(f.name)).map((f) => f.name));
    const own = (f: ShapeField) => tracked.has(f.name) || through.has(f.name);
    const params = [...fields, ...allFields.filter((f) => f.symbol)].map((f) => (loose(f) ? `${ident(f.name)}: ${optionalType(f.type)}` : `${own(f) ? '' : `${modifiers(f)}var `}${ident(f.name)}: ${f.type}${holdsNil(heldOf(f.type)) ? ' = null' : ''}`));
    const lines = [`class ${name}(${[...params, `${tracked.size ? '' : 'private val '}jsOrder: List<String>? = null`].join(', ')}) : ${[implementing ?? 'JSDynamic', ...protocols.map((x) => x.conformance)].join(', ')} {`];
    const writes = (f: ShapeField) => (through.has(f.name) ? `; jsWriteThrough(${kotlinString(f.name)})` : '');
    for (const f of [...fields, ...allFields.filter((f) => f.symbol)]) if (loose(f)) lines.push(`    ${modifiers(f)}var ${ident(f.name)}: ${f.type} = jsUnchecked(${ident(f.name)})`, ...(through.has(f.name) ? [`        set(value) { field = value${writes(f)} }`] : []));
    for (const x of protocols) lines.push(...x.lines);
    if (symbolic) {
      lines.push(...this.dynamicMembers({}, { fields, className }), '}');
      return lines.join('\n');
    }
    const declared = `listOf(${fields.map((f) => kotlinString(f.name)).join(', ')})`;
    if (tracked.size) {
      lines.push('    private var jsOrder: List<String>? = jsOrder');
      for (const f of fields) {
        if (!tracked.has(f.name)) continue;
        lines.push(`    ${modifiers(f)}var ${ident(f.name)}: ${f.type} = ${ident(f.name)}`, `        set(value) { field = jsKeySet(field, value, ${kotlinString(f.name)})${writes(f)} }`);
      }
      lines.push(`    private fun <T> jsKeySet(old: T?, value: T?, key: String): T? = value.also {`,
        '        val was = old != null || jsNulls?.contains(key) == true || jsUnset?.contains(key) == true',
        '        if (it == null) { jsNulls?.remove(key); jsUnset = (jsUnset ?: mutableSetOf()).also { s -> s.add(key) } } else jsUnset?.remove(key)',
        `        if (!was) jsOrder = (jsOrder ?: ${declared}).filter { k -> k != key && jsHas(k) } + key`,
        '    }');
    }
    for (const f of fields) if (through.has(f.name) && !tracked.has(f.name) && !loose(f)) lines.push(`    ${modifiers(f)}var ${ident(f.name)}: ${f.type} = ${ident(f.name)}`, `        set(value) { field = value${writes(f)} }`);
    // The optional fields holding undefined as an own key (`o.a = undefined`), which a missing one doesn't.
    if (optional.length) lines.push('    var jsUnset: MutableSet<String>? = null');
    // Read from an untyped object (a cast of JSON.parse): the keys it has beyond the type's stay readable, in its order.
    lines.push('    private var jsExtra: JSDynamic? = null');
    if (through.size) lines.push('    private var jsSourced = false', '    private fun jsWriteThrough(key: String) { if (jsSourced) jsExtra?.jsSet(key, jsGet(key)) }');
    // Kotlin's null is undefined: the optional fields holding JavaScript's null are noted by key.
    if (optional.length) lines.push('    var jsNulls: MutableSet<String>? = null');
    lines.push('    companion object {');
    // Library mode: a class-typed field a caller fills with another class's object (core's application as an event's `object`): none.
    // A string, number or boolean the object lacks (parsed JSON missing a field) reads as its zero, as on iOS.
    const zero: Record<string, string> = { String: '""', Double: 'Double.NaN', Boolean: 'false' };
    const field = (f: ShapeField) => (this.library && /^[A-Z]\w*\?$/.test(f.type) && !f.type.startsWith('JS') && this.isObjectType(f.type) ? `(jsField(o, ${kotlinString(f.name)}) as? ${f.type.slice(0, -1)})`
      : !this.library && zero[f.type] ? this.fromAny(`(jsField(o, ${kotlinString(f.name)}) ?: ${zero[f.type]})`, f.type, f.name) : this.fromAny(`jsField(o, ${kotlinString(f.name)})`, f.type, f.name));
    lines.push(`        fun fromJS(o: Any?): ${name} = ${name}(${[...fields.map((f) => `${ident(f.name)} = ${field(f)}`), 'jsOrder = (o as? JSDynamic)?.jsKeys'].join(', ')}).also { it.jsExtra = o as? JSDynamic${through.size ? '; it.jsSourced = it.jsExtra != null' : ''}${optional.length ? `; it.jsNulls = jsNullKeys(o, listOf(${optional.map((f) => kotlinString(f.name)).join(', ')})); it.jsUnset = jsUnsetKeys(o, listOf(${optional.map((f) => kotlinString(f.name)).join(', ')}))` : ''} }`);
    lines.push('    }');
    if (optional.length) lines.push(`    private fun jsHas(key: String): Boolean = when (key) { ${optional.map((f) => `${kotlinString(f.name)} -> this.${ident(f.name)} != null || jsNulls?.contains(${kotlinString(f.name)}) == true || jsUnset?.contains(${kotlinString(f.name)}) == true`).join('; ')}; else -> true }`);
    lines.push(`    override val jsKeys: List<String>`);
    lines.push(`        get() = (jsOrder ?: ${declared}).let { order -> order + (jsExtra?.jsKeys ?: listOf()).filter { it !in order } }${optional.length ? '.filter(::jsHas)' : ''}`);
    // Keys set beyond the type's (`Object.assign(shape, more)`) are kept with the extra ones.
    lines.push(...this.dynamicMembers({ nulls: new Map(optional.map((f) => [f.name, 'noted'])), rewritten: through, extra: true }, { fields, className }).slice(1));
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
      if (!a) { params.push(`var ${n}: ${f.type}${spelledOptional(heldOf(f.type)) ? ' = null' : ''}`); continue; }
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
    for (const f of fields) if (!f.accessor || f.accessor.set) lines.push(`            ${kotlinString(f.name)} -> this.${ident(f.name)} = ${this.fromAny(pure('value'), f.type, f.name)}`);
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
      const parts = f && functionTypeParts(f.type);
      return f && parts ? { name: n, params: parts.params.length, ret: parts.ret, param: parts.params[0] } : undefined;
    };
    const methods = ['next', 'return', 'throw'].map(fn).filter((m): m is NonNullable<typeof m> => !!m);
    const protocol = this.iteratorProtocol(methods);
    if (protocol) out.push(protocol);
    // Its own `toString()`/`valueOf()`, which string and number conversion call (the field holds the function).
    const toStr = fn('toString'), valueOf = fn('valueOf');
    if (toStr && !toStr.params) out.push({ conformance: 'JSStringConvertible', lines: ['    override fun toString(): String = jsToString(this.toString.invoke())'] });
    if (valueOf && !valueOf.params) out.push({ conformance: 'JSValueOf', lines: ['    override fun jsValueOf(): Any? = this.valueOf.invoke()'] });
    const toPrimitive = fn('jsToPrimitive');
    if (toPrimitive && toPrimitive.params <= 1) {
      const call = `this.jsToPrimitive.invoke(${toPrimitive.params ? 'hint' : ''})`;
      out.push({ conformance: 'JSToPrimitive', lines: [`    override fun jsToPrimitive(hint: String): Any? = ${toPrimitive.ret === 'Unit' ? `run { ${call}; null }` : call}`] });
    }
    if (fields.some((f) => f.name === 'jsSymbolIterator')) out.push({ conformance: 'JSIterableValue', lines: ['    override fun jsAnyIterator(): JSIteratorProtocol = jsSymbolIterator() as JSIteratorProtocol'] });
    if (fields.some((f) => f.name === 'jsSymbolAsyncIterator')) out.push({ conformance: 'JSAsyncIterableValue', lines: ['    override fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol = jsSymbolAsyncIterator() as JSAsyncIteratorProtocol'] });
    return out;
  }

  /** `JSDynamic`: the object's keys (`plan`, its plan's state) and members by name, for printing, JSON and untyped access. */
  private dynamicMembers(plan: MemberKeys, members: DynamicMembers): string[] {
    const { fields, className, inherits = false, symbols = [], methods = [], superclass, receiver } = members;
    const { keyed = null, rewritten = new Set<string>(), defined = new Set<string>(), expando = false, expandoAbove = false, extra = false } = plan;
    const noted = (n: string) => notesNull(plan.nulls?.get(n)), nilNull = (n: string) => nilIsNull(plan.nulls?.get(n));
    const fallbackGet = expando ? 'jsExpandoGet(this, key)' : extra ? 'jsExtra?.jsGet(key)' : 'null';
    const fallbackSet = expando ? 'jsExpandoSet(this, key, value)' : extra ? '(jsExtra ?: JSObject().also { jsExtra = it }).jsSet(key, value)' : '';
    const accessors = (members.accessors ?? []).filter((a) => !fields.some((f) => f.name === a.name) && !methods.some((m) => m.name === a.name));
    const hasMembers = [...new Set([...accessors.map((a) => accessorKey(a.name)), ...methods.filter((m) => !m.key).map((m) => m.name)])];
    const at = (n: string) => { const k = keyed?.order.indexOf(n) ?? -1; return k < 0 ? Infinity : k; };
    const sorted = keyed ? [...fields].sort((a, b) => at(a.name) - at(b.name)) : fields;
    const fieldKeys = sorted.map((f) => {
      if (!keyed) return holdsNil(heldOf(f.type)) && !nilNull(f.name) ? `(if (${ident(f.name)} == null${noted(f.name) ? ` && jsNulls?.contains(${kotlinString(f.name)}) != true` : ''}) listOf() else listOf(${kotlinString(f.name)}))` : `listOf(${kotlinString(f.name)})`;
      const present = keyed.present(f.name);
      return present ? `(if (${present}) listOf(${kotlinString(f.name)}) else listOf())` : `listOf(${kotlinString(f.name)})`;
    }).map((k, i) => (defined.has(sorted[i].name) ? `jsDefinedKeys(this, ${kotlinString(sorted[i].name)}, ${k})` : k));
    const expandoKeys = expando ? ['(jsExpando?.jsKeys ?: listOf())'] : [];
    const keys = [...fieldKeys, ...expandoKeys];
    const keyLines = !keyed?.ordered
      // A subclass adding no keys has its superclass's.
      ? (inherits && !keys.length ? [] : [`    override val jsKeys: List<String> get() = ${expandoAbove && inherits ? `jsKeysBeforeExpando(super.jsKeys, ${keys.join(' + ')}, jsExpando)` : [inherits ? 'super.jsKeys' : '', ...keys].filter(Boolean).join(' + ') || 'listOf()'}`])
      : keyed.appBase
        ? (fieldKeys.length ? [`    override val jsFieldKeys: List<String> get() = ${['super.jsFieldKeys', ...fieldKeys].join(' + ')}`] : [])
        : [`    override val jsFieldKeys: List<String> get() = ${[inherits ? 'super.jsKeys' : '', ...fieldKeys].filter(Boolean).join(' + ') || 'listOf()'}`, `    override val jsKeys: List<String> get() = jsOrderedKeys(jsOrder, jsFieldKeys${expandoKeys.length ? ' + jsAddedKeys' : ''})`];
    const definedGet = (f: { name: string }, read: string) => (defined.has(f.name) ? `jsDefinedGet(this, ${kotlinString(f.name)}).let { if (it != null) it.value else ${read} }` : read);
    const definedSet = (f: { name: string }, write: string) => (defined.has(f.name) ? `{ if (!jsDefinedSet(this, ${kotlinString(f.name)}, value)) ${write.startsWith('{') ? write : `{ ${write} }`} }` : write);
    const withDefined = (f: { name: string }, line: string, wrap: (f: { name: string }, code: string) => string) => {
      const at = line.indexOf(' -> ');
      return line.slice(0, at + 4) + wrap(f, line.slice(at + 4));
    };
    const ownNames = new Set([...this.instanceKeys()].map((d) => d.name.getText()));
    // A method read by name is a script function calling it with the arguments it is given.
    const method = (m: { name: string; key?: string; params: string[]; ret: string }) => {
      const args = m.params.map((t, k) => this.fromAnyCode(pure(`__a.getOrNull(${k})`), t, true));
      // An app class's method sees the object it is called on as `this` when that is one of the class's (`obj[k].call(other)`).
      const call = `${receiver && !m.key ? `jsMethodReceiver(__s, this, ${receiver}::class.java)` : 'this'}.${this.methodIdent(m.name)}(${args.join(', ')})`;
      const fn = receiver && !m.key ? `JSMethod(${m.params.length}) ${lambda(['__s', '__a'], m.ret === 'Unit' ? `${call}; null` : call)}` : `jsFunction ${lambda(['__a'], m.ret === 'Unit' ? `${call}; null` : call)}`;
      return `        ${m.key ?? kotlinString(m.name)} -> ${!m.key && ownNames.has(m.name) ? `(jsOwnProperty(this, ${kotlinString(m.name)}) ?: JSFound(${fn})).value` : fn}`;
    };
    return [
      ...keyLines,
      ...(symbols.length ? [`    override val jsSymbolKeys: List<String> get() = listOf(${symbols.map((f) => f.key).join(', ')})`] : []),
      `    override val jsClassName: String? get() = ${className ? kotlinString(className) : 'null'}`,
      `    override fun jsGet(key: String): Any? = when (key) {`,
      // A field Kotlin declares `lateinit` (an object type, unset): undefined until set.
      ...fields.map((f) => withDefined(f, noted(f.name) ? `        ${kotlinString(f.name)} -> jsNullable(jsUnsetIsUndefined { this.${ident(f.name)} }, jsNulls, ${kotlinString(f.name)})`
        : !this.library && !holdsNil(heldOf(f.type)) && this.zero(f.type) === null && f.type !== 'Unit' && !this.isTypeParameterName(f.type) ? `        ${kotlinString(f.name)} -> jsUnsetIsUndefined { this.${ident(f.name)} }` : `        ${kotlinString(f.name)} -> ${nilNull(f.name) ? `jsNulled(this.${ident(f.name)})` : `this.${ident(f.name)}`}`, definedGet)),
      ...accessors.filter((a) => a.readable).map((a) => `        ${kotlinString(accessorKey(a.name))} -> this.${ident(a.name)}`),
      ...symbols.map((f) => `        ${f.key} -> this.${f.member}`),
      ...methods.filter((m) => !fields.some((f) => f.name === m.name)).map(method),
      `        else -> ${inherits ? 'super.jsGet(key)' : fallbackGet}`,
      '    }',
      `    override fun jsSet(key: String, value: Any?) {`,
      '        when (key) {',
      // A registered property's accessor is the prototype's, which converts what script sets (`col = "1"`): the value as it is.
      // A null is noted after the store, whose setter reads the key's state from before it; a field written through to its
      // source (`rewritten`) is written again once the null is noted.
      ...fields.map((f) => withDefined(f, `            ${kotlinString(f.name)} -> ${(f as { expando?: boolean }).expando ? `jsExpandoSet(this, ${kotlinString(f.name)}, value)` : noted(f.name) ? `{ this.${ident(f.name)} = ${holdsNil(heldOf(f.type)) ? this.storeFromAny(f) : `if (jsIsNullish(value)) jsUncheckedNull<${f.type}>() else ${this.storeFromAny(f)}`}; jsNulls = jsNoteNull(jsNulls, ${kotlinString(f.name)}, value)${rewritten.has(f.name) ? `; jsWriteThrough(${kotlinString(f.name)})` : ''} }` : `this.${ident(f.name)} = ${this.storeFromAny(f)}`}`, definedSet)),
      // A setter takes what script gives it (`textWrap = "true"`): as JavaScript reads it as the setter's type.
      ...accessors.filter((a) => a.settable).map((a) => `            ${kotlinString(accessorKey(a.name))} -> ${a.set ?? `this.${ident(a.name)} = ${a.type === 'Boolean' ? 'jsTruthy(value)' : a.type === 'Double' ? 'jsToNumber(value)' : this.fromAnyCode('value', a.type, true)}`}`),
      ...symbols.map((f) => `            ${f.key} -> this.${f.member} = ${this.fromAny('value', f.type)}`),
      `            else -> ${inherits ? 'super.jsSet(key, value)' : fallbackSet || '{}'}`,
      '        }',
      '    }',
      // `key in object` of a member its class declares (an accessor, a method), not only of its own keys.
      ...(hasMembers.length ? [`    override fun jsHasMember(key: String): Boolean = when (key) { ${hasMembers.map(kotlinString).join(', ')} -> true; else -> ${inherits && superclass ? `super<${superclass}>.jsHasMember(key)` : 'false'} }`] : []),
    ];
  }

  /** A dynamic setter's `value` (`obj[key] = v`, a binding's write) where Kotlin holds the field `f`. */
  private storeFromAny(f: { name: string; type: string; at?: ts.PropertyDeclaration }): string {
    return placeCode(this.placement, pure('value'), codeStoreSlot(this.placement, f.type, f.at)) ?? this.fromAny(pure('value'), f.type, f.name);
  }

  fromAnyCode(code: string, type: string, orZero = false): string {
    const zero = this.zero(type);
    // Library mode: another primitive converts, as JavaScript reads it where it is used, and an object is a TypeError.
    if (orZero && type === 'Double') return `${this.library ? 'jsConvertedNumberOrZero' : 'jsNumberOrZero'}(${code})`;
    if (orZero && this.library && type === 'String') return `jsConvertedStringOrEmpty(${code})`;
    if (orZero && this.library && type === 'Boolean') return `jsConvertedBooleanOrFalse(${code})`;
    // App code: an untyped string or boolean is converted as JavaScript converts it where it is used, never refused.
    if (orZero && (type === 'String' || type === 'Boolean')) return this.fromAny(code, type);
    if (orZero && zero && zero !== 'null' && !type.endsWith('?')) return `(${safeCast(code, type)} ?: ${zero})`;
    return this.fromAny(code, type);
  }

  /** Kotlin code reading an untyped value (`Any?`) as `type`; `name` is the field or variable it goes to, for the TypeError. */
  fromAny(code: string, type: string, name?: string): string {
    if (type === 'Any?') return code;
    const nullish = /^JSNullish<(.*)>$/.exec(type);
    if (nullish) return this.nullishOfAny(code, nullish[1]);
    // An Error held untyped (a caught or rejected value): the error, or a view of what was thrown instead.
    if (type === 'JSError' && !this.lenient) return `jsErrorOf(${code})`;
    // A call's value read as nothing: the call still runs.
    if (type === 'Unit') return this.isPure(code) ? pure('Unit') : this.marked(`run { ${code}; Unit }`, { op: 'discarded', of: this.valueOf(code) });
    if (code === 'null' && type.endsWith('?')) return 'null';
    const unbox = this.unboxStep(type);
    const m = unbox.composite === 'array' ? /^JSArray<(.*)>(\??)$/.exec(type) : null;
    if (m) {
      const read = (x: string) => `jsArrayFrom(${x}) { ${this.fromAny('it', m[1])} }`;
      if (!m[2]) return read(code);
      return this.isPure(code) ? `(if (jsIsNullish(${code})) null else ${read(code)})` : `jsUnlessNullish(${code}) { ${read('it')} }`;
    }
    const record = unbox.composite === 'record' ? /^JSRecord<(.*)>(\??)$/.exec(type) : null;
    if (record) return `${record[2] ? 'jsRecordOrNull' : 'jsRecord'}<${record[1]}>(${code})`;
    const pair = /^(Pair|Triple)<(.*)>$/.exec(type);
    if (pair) {
      const parts = splitTopLevel(pair[2]);
      return `run { val __a = ${code}; ${pair[1]}(${parts.map((t, k) => this.fromAny(`jsField(__a, "${k}")`, t)).join(', ')}) }`;
    }
    const base = type.replace(/\?$/, '');
    if (this.interfaces.has(base) || [...this.shapes.values()].some((s) => s.name === base)) {
      this.used.add(base);
      // An object of a class implementing the interface is itself; anything else is read into the interface's class.
      const read = (x: string) => (this.protocols.has(base) ? `${x}.let { it as? ${base} ?: ${base}Object.fromJS(it) }` : `${base}.fromJS(${x})`);
      if (!type.endsWith('?')) return read(code);
      return this.isPure(code) ? `(if (jsIsNullish(${code})) null else ${read(code)})` : `jsUnlessNullish(${code}) { ${read('it')} }`;
    }
    if (!this.library && /^[A-Z]\w*\??$/.test(type)) {
      const reified = this.reifiedRead(code, type);
      if (reified) return reified;
    }
    // A function held untyped (a script function, a method read by name): callable as the typed function.
    const fn = unbox.composite === 'function' ? functionTypeParts(type.replace(/^\((.*)\)\?$/, '$1')) : null;
    if (fn && fn.params.length <= 7) {
      const typed = `jsFunction${fn.params.length}<${[...fn.params, fn.ret].join(', ')}>`;
      return /\)\?$/.test(type) ? `jsUnlessNullish(${code}) { ${typed}(it) }` : `${typed}(${code})`;
    }
    // A promise its type promises may be any thenable: adopted, as awaiting it or `Promise.resolve` would.
    const promised = unbox.composite === 'promise' ? /^JSPromise<(.*)>$/.exec(base) : null;
    if (promised) return type.endsWith('?') ? `jsUnlessNullish(${code}) { jsPromiseOf<${promised[1]}>(it) }` : `jsPromiseOf<${promised[1]}>(${code})`;
    // Library mode: JavaScript's null where an object goes (`cond ? entry.fragment : null`) is Kotlin's.
    // A string, number or boolean slot given another primitive converts it (a binding's 5 for a string is "5"); an empty
    // marker (`unsetValue`) holds none, and any object is a TypeError.
    if (this.library && /^(String|Double|Boolean)\?$/.test(type)) return `${({ 'String?': 'jsConvertedStringOrNull', 'Double?': 'jsConvertedNumberOrNull', 'Boolean?': 'jsConvertedBooleanOrNull' } as Record<string, string>)[type]}(${code}${name ? `, ${kotlinString(name)}` : ''})`;
    // App code: an untyped string, number or boolean is converted as JavaScript converts it where it is used; undefined and null stay null.
    if (/^(String|Double|Boolean)\?$/.test(type)) return `${({ 'String?': 'jsAssertedStringOrNull', 'Double?': 'jsAssertedNumberOrNull', 'Boolean?': 'jsAssertedBooleanOrNull' } as Record<string, string>)[type]}(${code})`;
    // JavaScript's null (JSNull in an untyped object) where a nullable slot goes is Kotlin's.
    if (isNullable(type)) return this.checkedCast(code, type);
    // A Date its type promises that JSON gave as text (`createdAt: Date` of a parsed payload): the date the text names, as `new Date(text)` reads it.
    if (!this.library && type === 'JSDate') return `jsDateFrom(${code})`;
    if (!this.library && type === 'JSRegExp') return `jsRegExpFrom(${code})`;
    // An object slot its declarations call non-null may still get null (`getAncestor` finding none), which JavaScript passes on.
    // Core's own code: null is carried so, and an instance of another class is a TypeError (§2.3b M6).
    if (this.isObjectType(type) && !/^(String|Double|Boolean)$/.test(type)) {
      const cls = this.library && !['JSError', 'JSDate'].includes(type) ? this.castClass(type) : null;
      if (cls) return this.marked(`jsCastCarried(${code}, ${cls})`, { op: 'cast', to: parseNativeType(type), optional: false, implicit: false, of: this.valueOf(code), unchecked: true });
      return this.unchecked(type, `jsJavaArgument(${code})`);
    }
    const converted = this.library ? ({ String: 'jsConvertedString', Double: 'jsConvertedNumber', Boolean: 'jsConvertedBoolean' } as Record<string, string>)[type] : undefined;
    if (converted) return `${converted}(${code}${name ? `, ${kotlinString(name)}` : ''})`;
    return this.checkedCast(code, type, name);
  }

  /**
   * `code as type` checked by the runtime: a string, number, boolean or class instance of another type is a TypeError
   * naming `name` where given. A nullable class takes JavaScript's null and undefined as null.
   */
  checkedCast(code: string, type: string, name?: string): string {
    // A string, number or boolean is converted as JavaScript converts it where it is used, never refused.
    const primitive = this.library ? ({ String: 'jsAsString', Double: 'jsAsNumber', Boolean: 'jsAsBoolean' } as Record<string, string>)[type] : ({ String: 'jsAssertedString', Double: 'jsAssertedNumber', Boolean: 'jsAssertedBoolean' } as Record<string, string>)[type];
    if (primitive) return this.library ? `${primitive}(${code}${name ? `, ${kotlinString(name)}` : ''})` : `${primitive}(${code})`;
    const cls = this.castClass(type);
    if (!cls) return cast(isNullable(type) ? `jsJavaArgument(${code})` : code, type);
    return `${isNullable(type) ? 'jsCast' : 'jsCastPresent'}(${code}, ${cls})`;
  }

  /** The class `jsCast` tests a value of `type` against, or null where Kotlin has none to test (generics, `Any`). */
  private castClass(type: string): string | null {
    const base = type.replace(/\?$/, '');
    if (!/^[A-Za-z_][\w.]*$/.test(base) || this.isTypeParameterName(base) || ['Any', 'Unit', 'Nothing'].includes(base)) return null;
    return ['Double', 'Boolean', 'Int', 'Long', 'Float', 'Short', 'Byte', 'Char'].includes(base) ? `${base}::class.javaObjectType` : `${base}::class.java`;
  }

  private enumDecl(e: ts.EnumDeclaration, merged: string[] = []): string {
    const lines = [`object ${ident(this.topName(e, e.name.text))} {`];
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
    lines.push(`    val jsEnumObject: JSObject by kotlin.lazy { JSObject(listOf<Pair<String, Any?>>(${entries.join(', ')})) }`);
    lines.push(...merged.map((l) => l.split('\n').map((x) => (x ? '    ' + x : x)).join('\n')));
    lines.push('}');
    return lines.join('\n');
  }

  // ---- Functions -----------------------------------------------------------------------------

  /** `override`: an override's, which takes a constant default from the method it overrides. */
  private params(fn: ts.SignatureDeclaration, closure: boolean, override = false): string {
    if (this.readsArguments(fn)) return '__arguments: JSArray<Any?>';
    const implicit = this.implicitThis(fn) ? ['__this: Any?'] : [];
    return [...implicit, ...fn.parameters.map((p, k) => {
      // `this: void` declares there is none; a `this` the function reads is its first parameter.
      if (isThisParameter(p)) return this.voidThis(p) ? '' : `__this: ${this.type(this.checker.getTypeAtLocation(p.name), p)}`;
      const name = this.baseParamNames.get(p) ?? (ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`);
      if (p.dotDotDotToken) return `${name}: ${this.typeOf(p.name)}`;
      if (this.typeTested(p)) return `${name}: Any?`;
      let t = this.typeOf(p.name);
      if (this.states.nullishHeld(p)) return `${name}: ${nullishType(t)}${!closure && (p.questionToken || p.initializer) ? ' = JSNullish.Undefined' : ''}`;
      // Library mode: a local function's object parameter it tests (`const addDrawable = (is) => { if (is) … }`) takes null, as script passes it.
      const localFunction = (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent);
      if (this.library && localFunction && ts.isIdentifier(p.name) && !t.endsWith('?') && this.isObjectType(t) && !isFunctionType(t) && this.truthTested(p.name)) {
        const sym = this.checker.getSymbolAtLocation(p.name);
        if (sym) this.nullableDecls.add(sym);
        t = optionalType(t);
      }
      if (this.states.mayBeNull(p)) {
        const sym = this.checker.getSymbolAtLocation(p.name);
        if (sym) this.nullableDecls.add(sym);
        t = optionalType(t);
      }
      let given = '';
      if (p.questionToken || (p.initializer && !this.templateParams)) {
        if (!closure && this.constantDefault(p)) given = ` = ${this.stored(p.initializer!, p, t)}`;
        else if (!(override && this.constantDefault(p))) { t = optionalType(t); if (!closure) given = ' = null'; }
      }
      return `${name}: ${t}${given}`;
    })].filter(Boolean).join(', ');
  }

  /** `this: void`, a `this` of no type, and any outside library mode: no parameter. */
  private voidThis(p: ts.ParameterDeclaration): boolean {
    return !this.library || !p.type || p.type.kind === ts.SyntaxKind.VoidKeyword;
  }

  private isConstant(e: ts.Expression): boolean {
    return ts.isLiteralExpression(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(e.kind) || (ts.isPrefixUnaryExpression(e) && ts.isNumericLiteral(e.operand));
  }

  /**
   * A parameter Kotlin gives its constant default itself. Not where another method of its override family declares the
   * parameter otherwise: Kotlin overrides take the root's default, where JavaScript applies the default of the method that runs.
   */
  private constantDefault(p: ts.ParameterDeclaration): boolean {
    return !!p.initializer && this.isConstant(p.initializer) && !this.familyDefaultsDiffer(p) && !this.states.defaultTakesUndefined(p);
  }

  private familyDefaultsDiffer(p: ts.ParameterDeclaration): boolean {
    const m = p.parent;
    if (!ts.isMethodDeclaration(m) || isStatic(m) || !ts.isClassLike(m.parent)) return false;
    const k = m.parameters.indexOf(p);
    const family = this.methodFamily(this.rootMethod(m));
    const text = (x: ts.MethodDeclaration) => x.parameters[k]?.initializer?.getText();
    return family.some((x) => x.parameters.length > k && text(x) !== text(m));
  }

  private methodFamilies: Map<ts.MethodDeclaration, ts.MethodDeclaration[]> | null = null;
  /** A root method with every method overriding it, directly or through others. */
  private methodFamily(root: ts.MethodDeclaration): ts.MethodDeclaration[] {
    if (!this.methodFamilies) {
      this.methodFamilies = new Map();
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          for (const m of n.members) {
            if (!ts.isMethodDeclaration(m) || isStatic(m) || (!m.body && !hasModifier(m, ts.SyntaxKind.AbstractKeyword))) continue;
            const top = this.rootMethod(m);
            this.methodFamilies.set(top, [...(this.methodFamilies.get(top) ?? [top]), ...(top === m ? [] : [m])]);
          }
        }
        ts.forEachChild(n, visit);
      };
      for (const f of this.sourceFiles) if (!f.isDeclarationFile) visit(f);
    }
    return this.methodFamilies.get(root) ?? [root];
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
        const arg = pure(`__arguments.storage.getOrNull(${k})`);
        const pt = this.typeOf(p.name);
        const declared = p.questionToken && !p.initializer ? optionalType(pt) : pt;
        const value = p.dotDotDotToken ? `JSArray(__arguments.storage.drop(${k}).map { ${this.fromAnyCode('it', pt.replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
          : p.initializer ? `(if (${arg} == null) ${branch(this.stored(p.initializer, p, pt))} else ${this.fromAnyCode(arg, pt, true)})`
          : this.fromAnyCode(arg, declared, true);
        lines.push(`${i}${assigned ? 'var' : 'val'} ${ident(p.name.text)}: ${declared} = ${value}`);
      });
      return lines;
    }
    fn.parameters.forEach((p, k) => {
      if (isThisParameter(p)) return;
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      // The parameter as the signature names it: the overridden method's name, where that differs.
      const given = this.baseParamNames.get(p) ?? name;
      const closure = ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || (ts.isMethodDeclaration(fn) && ts.isObjectLiteralExpression(fn.parent));
      // A parameter the body assigns is a variable of its own (Kotlin parameters are constants).
      const assigned = ts.isIdentifier(p.name) && !!(fn as ts.FunctionLikeDeclaration).body && assignsTo((fn as ts.FunctionLikeDeclaration).body!, this.checker.getSymbolAtLocation(p.name), this.checker, (e) => this.staticTruth(e));
      if (p.initializer && !this.templateParams && (closure || !this.constantDefault(p))) {
        const t = this.typeOf(p.name);
        // Library mode: NaN is how a number slot carries undefined (`return index` of an unset `index?: number`), which the default fills in for.
        const value = this.library && t === 'Double' ? `${given}.let { if (it == null || it.isNaN()) ${this.stored(p.initializer, p, t)} else it }` : `${given} ?: ${this.stored(p.initializer, p, t)}`;
        lines.push(`${i}${assigned ? 'var' : 'val'} ${name}: ${t} = ${value}`);
      } else if (assigned) {
        const sym = this.checker.getSymbolAtLocation(p.name);
        const pt = this.lenient ? this.paramType(p) : this.typeOf(p.name);
        const known = sym && this.nullableDecls.has(sym);
        // Read where its type says it is set, as the parameter it stands for is.
        if (sym && this.library && pt !== this.typeOf(p.name)) this.nullableDecls.add(sym);
        lines.push(`${i}var ${name}${known ? '' : `: ${pt}`} = ${given}`);
      } else if (given !== name && ts.isIdentifier(p.name) && (fn as ts.FunctionLikeDeclaration).body && refersTo((fn as ts.FunctionLikeDeclaration).body!, this.checker.getSymbolAtLocation(p.name), this.checker)) lines.push(`${i}val ${name} = ${given}`);
      // A destructured parameter the body assigns binds variables.
      const body = (fn as ts.FunctionLikeDeclaration).body;
      let whole = given;
      if (!ts.isIdentifier(p.name) && this.lenient && !p.initializer && isNullable(this.typeOf(p.name))) {
        const first = ts.isObjectBindingPattern(p.name) ? p.name.elements[0] : undefined;
        const key = first && !first.dotDotDotToken ? (first.propertyName ?? first.name) : undefined;
        const keyText = key && (ts.isIdentifier(key) || ts.isStringLiteral(key)) ? kotlinString(key.text) : 'null';
        if (/^\w+$/.test(given) && (ts.isArrayBindingPattern(p.name) || keyText !== 'null')) lines.push(`${i}jsDestructurable(${given}, ${ts.isArrayBindingPattern(p.name) ? 'null' : keyText})`);
        else whole = this.asserted(given);
      }
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, whole, '', !!body && boundNames(p.name).some((b) => assignsTo(body, this.checker.getSymbolAtLocation(b), this.checker))));
    });
    return lines;
  }

  /** A call of an object `widenedResult` that may give undefined: missing where it gives nothing, as a string's is. One giving only null is `nullResult`'s. */
  private widenedObjectCall(e: ts.CallExpression): boolean {
    const d = this.checker.getResolvedSignature(e)?.getDeclaration(), t = this.typeOf(e);
    return !!d && !ts.isJSDocSignature(d) && this.isObjectType(t) && !isFunctionType(t) && t !== 'Any?' && this.states.widenedResult(d) && !this.states.nullOnlyResult(d);
  }

  /** A function type's result as its group holds it (`widenedResult`). */
  private widenedResultType(sd: ts.Declaration | undefined, t: string): string {
    return sd && ts.isFunctionLike(sd) && !ts.isJSDocSignature(sd as ts.Node) && !['Unit', 'Any?', 'Nothing'].includes(t) && !t.endsWith('?') && this.states.widenedResult(sd as ts.SignatureDeclaration) ? optionalType(t) : t;
  }

  returnTypeOf(fn: ts.SignatureDeclaration): string {
    const context = this.states.widenedContext(fn);
    if (context) return this.returnTypeOf(context);
    if (this.states.nullish().held.has(fn) || (this.library && this.thisValues().returning.has(fn))) return 'Any?';
    if (this.states.nullishHeld(fn)) return nullishType(this.type(this.states.resultType(fn), fn));
    if (this.library && this.returnsNullApart(fn)) return 'Any?';
    const t = this.heldElements(fn, this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn));
    if (this.library && this.nullablePrimitiveReturn(fn) && ['String', 'Double', 'Boolean'].includes(t)) return optionalType(t);
    if (this.states.looseDeclaration(fn) || this.widenedResultType(fn, t) !== t || (!this.library && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && this.unset.returnsElement(fn))) return optionalType(t);
    if (this.states.lenientAsync(fn)) return t.replace(/^JSPromise<(String|Double|Boolean)>$/, 'JSPromise<$1?>');
    return fn.getSourceFile().isDeclarationFile || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) ? t : this.lenientRef(t);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    if (this.pluginFiles.has(fn.getSourceFile().fileName)) return '';
    // A bounded type parameter (`T extends View`) is held to its bound, which code reads it as; a function's only to a class's,
    // as an object type (`U extends { root: View }`) has no Kotlin class the arguments share (its members are read by name).
    const bound = (p: ts.TypeParameterDeclaration) => (!this.library && p.constraint && (ts.isClassLike(fn) || this.classConstraint(p)) ? this.type(this.checker.getTypeFromTypeNode(p.constraint), p).replace(/\?$/, '') : '');
    const kept = (fn.typeParameters ?? []).filter((p) => !erasedTypeParameter(p));
    return kept.length ? `<${kept.map((p) => (bound(p) && bound(p) !== 'Any' ? `${p.name.text} : ${bound(p)}` : p.name.text)).join(', ')}>` : '';
  }

  private classConstraint(p: ts.TypeParameterDeclaration): boolean {
    const t = p.constraint && this.checker.getTypeFromTypeNode(p.constraint);
    return !!t && !t.isUnion() && !t.isIntersection() && !!((t.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class);
  }

  /** A value typed by a function's type parameter whose constraint is an object type (`ui: U`, `U extends { root: View }`). */
  private structuralTypeParam(e: ts.Expression): boolean {
    if (this.library) return false;
    const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e));
    if (!(t.flags & ts.TypeFlags.TypeParameter) || (t as ts.TypeParameter & { isThisType?: boolean }).isThisType) return false;
    const decl = t.symbol?.declarations?.[0];
    if (!decl || !ts.isTypeParameterDeclaration(decl) || !decl.constraint || !ts.isFunctionLike(decl.parent) || ts.isClassLike(decl.parent)) return false;
    return !this.classConstraint(decl) && !!(this.checker.getTypeFromTypeNode(decl.constraint).flags & ts.TypeFlags.Object);
  }

  /** A function's body block (`{ … }`), lowered when the function is async. */
  functionBody(fn: ts.FunctionLikeDeclaration, ret: string, base: string, lambdaLabel: string | null = null): string {
    const self = fn.parameters.find((p) => isThisParameter(p) && !this.voidThis(p));
    if (self && !thisNodes(fn).every((n) => this.subst.has(n))) return this.withThis(fn, '__this', false, () => this.functionBody(fn, ret, base, lambdaLabel));
    if (this.implicitThis(fn) && !thisNodes(fn).every((n) => this.subst.has(n))) return this.withThis(fn, '__this', true, () => this.functionBody(fn, ret, base, lambdaLabel));
    return this.inFunction(ret, () => {
      const saved = this.indent;
      this.indent = base + '    ';
      try {
        let lines: string[];
        if (fn.asteriskToken) lines = this.lowering.generatorBody(fn, ret.replace(/^JS\w+<(.*)>\??$/, '$1'), isAsync(fn));
        else if (isAsync(fn) && ret === 'Unit') {
          // Where nothing is returned (an async Promise executor): run for its effects, its promise left alone.
          lines = this.lowering.body(fn, this.returnTypeOf(fn).replace(/^JSPromise<(.*)>\??$/, '$1'));
          lines.pop();
        } else if (isAsync(fn)) lines = this.lowering.body(fn, ret.replace(/^JSPromise<(.*)>\??$/, '$1'));
        else if (fn.body && ts.isBlock(fn.body)) {
          lines = [...this.paramPrelude(fn), ...this.statements([...fn.body.statements])];
          // JavaScript returns undefined at the end; Kotlin needs a return where the checker proved one is never reached.
          if (!['Unit', 'Nothing'].includes(ret) && !this.exits(fn.body)) {
            lines.push(ret.endsWith('?') ? `${this.indent}${this.returnKeyword()} null` : `${this.indent}jsThrow(JSTypeError("no value returned where the declared type needs one"))`);
          }
        } else {
          const e = fn.body as ts.Expression;
          const slot = this.resultSlot(e);
          lines = [...this.paramPrelude(fn), this.bodyReturned(returnCell(this.returns, e, slot, true), slot)];
        }
        return `{\n${lines.filter(Boolean).join('\n')}\n${base}}`;
      } catch (e) { throw this.located(e, fn); } finally { this.indent = saved; }
    }, lambdaLabel);
  }

  func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers = ''): string {
    return this.docOf(fn) + this.suppressingDeprecations(() => this.funcCode(fn, name, modifiers));
  }

  /**
   * A declaration's doc comment, as KDoc before its Kotlin declaration (`indent` before each line but the first), or ''.
   * A `/*` inside it would open a nested comment in Kotlin: it is spaced apart.
   */
  docOf(n: ts.Node, indent = ''): string {
    const sf = n.getSourceFile();
    const at = ts.isVariableDeclaration(n) && ts.isVariableDeclarationList(n.parent) && n.parent.declarations[0] === n ? n.parent.parent : n;
    const doc = (ts.getLeadingCommentRanges(sf.text, at.getFullStart()) ?? []).filter((r) => r.kind === ts.SyntaxKind.MultiLineCommentTrivia && sf.text.startsWith('/**', r.pos) && !sf.text.startsWith('/**/', r.pos)).at(-1);
    if (!doc) return '';
    const text = sf.text.slice(doc.pos + 3, doc.end - 2).replace(/\/\*/g, '/ *');
    const lines = text.split('\n').map((l) => l.trim().replace(/^\* ?/, ''));
    while (lines.length && !lines[0]) lines.shift();
    while (lines.length && !lines.at(-1)) lines.pop();
    if (!lines.length) return '';
    return lines.length === 1 ? `/** ${lines[0]} */\n${indent}` : `/**\n${lines.map((l) => `${indent} *${l ? ' ' + l : ''}`).join('\n')}\n${indent} */\n${indent}`;
  }

  private funcCode(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers: string): string {
    const ret = this.returnTypeOf(fn);
    const params = modifiers.includes('override') ? this.params(fn, true, true) : this.params(fn, false);
    // A type parameter an untyped value is read as (`cached.data` of `T[]`) is reified: the value is converted to the class the call
    // instantiates it with, as Kotlin's erased generics cannot.
    const reifiable = !this.library && !/\b(override|open|abstract)\b/.test(modifiers) && !!fn.typeParameters?.length && !fn.asteriskToken && !isAsync(fn) && !this.isRecursive(fn);
    this.reifying.push(reifiable ? fn : null);
    let body: string;
    try { body = this.functionBody(fn, ret, this.indent); } finally { this.reifying.pop(); }
    let generics = this.generics(fn);
    const reified = this.reified.get(fn);
    if (reified?.size) generics = generics.replace(/([<,]\s*)(\w+)/g, (m, sep, n) => (reified.has(n) ? `${sep}reified ${n}` : m));
    // An inline function's function parameters are values it keeps or passes on: not inlined.
    const kept = reified?.size ? splitTopLevel(params).map((p) => (/^[\w`$]+: \(/.test(p.trim()) ? `noinline ${p.trim()}` : p.trim())).join(', ') : params;
    return `${modifiers}${reified?.size ? 'inline ' : ''}fun ${generics}${generics ? ' ' : ''}${name}(${kept})${ret === 'Unit' ? '' : `: ${ret}`} ${body}`;
  }

  /** The functions being translated whose type parameters may be reified, innermost last. */
  private reifying: (ts.SignatureDeclaration | null)[] = [];
  private reified = new Map<ts.Node, Set<string>>();

  /** A function read untyped as one of its type parameters (`T`): `jsCastTo<T>`, the function then reified. */
  private reifiedRead(code: string, type: string): string | null {
    const name = type.replace(/\?$/, '');
    for (let k = this.reifying.length - 1; k >= 0; k--) {
      const fn = this.reifying[k];
      if (!fn || !fn.typeParameters?.some((p) => p.name.text === name && !erasedTypeParameter(p))) continue;
      if (!this.reified.has(fn)) this.reified.set(fn, new Set());
      this.reified.get(fn)!.add(name);
      return `jsCastTo<${type}>(${code})`;
    }
    return null;
  }

  private isRecursive(fn: ts.FunctionDeclaration | ts.MethodDeclaration): boolean {
    const sym = fn.name && this.checker.getSymbolAtLocation(fn.name);
    return !!sym && !!fn.body && refersTo(fn.body, sym, this.checker);
  }

  /** `(r) => r.id` as a Kotlin anonymous function, where `return` means what it does in JavaScript. */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration, slot?: string): string {
    if (ts.isFunctionExpression(fn) && (this.library ? this.thisValues().functions.has(fn) : this.takesOwnThis(fn) || this.givenThis(fn))) return this.thisMethod(fn);
    const contextual = this.checker.getContextualType(fn)?.getCallSignatures()[0];
    const slotRet = slot ? functionTypeParts(slot)?.ret : undefined;
    // An async function where a void callback is taken (`onTap: async () => …`): called for its effects, its promise left alone.
    if (slotRet === 'Unit' && isAsync(fn) && fn.parameters.every((p) => ts.isIdentifier(p.name))) {
      const names = fn.parameters.map((p) => ident((p.name as ts.Identifier).text));
      return `fun(${this.params(fn, true)}) { (${this.closure(fn)})(${names.join(', ')}) }`;
    }
    // A slot taking the arguments as a rest (`callback: (...args: any[]) => void`) given a function of separate parameters: each read from the rest.
    const slotParts = slot ? functionTypeParts(slot.replace(/^\((.*)\)\?$/, '$1')) : undefined;
    const restAt = contextual?.getParameters().findIndex((p) => !!p.valueDeclaration && ts.isParameter(p.valueDeclaration) && !!p.valueDeclaration.dotDotDotToken) ?? -1;
    if (slotParts && restAt >= 0 && restAt === slotParts.params.length - 1 && /^JSArray<.*>$/.test(slotParts.params[restAt]) && fn.parameters.length > restAt
        && !fn.parameters.some((p) => p.dotDotDotToken) && !ts.isMethodDeclaration(fn)) {
      const own = fn.parameters.map((p) => this.paramType(p));
      const args = own.map((t, k) => (k < restAt ? (slotParts.params[k] === 'Any?' && t !== 'Any?' ? this.fromAnyCode(`__p${k}`, t, true) : `__p${k}`) : this.fromAnyCode(`__rest.element(${k - restAt}.0)`, t, true)));
      const params = [...slotParts.params.slice(0, restAt).map((t, k) => `__p${k}: ${t}`), `__rest: ${slotParts.params[restAt]}`];
      const call = `__f(${args.join(', ')})`;
      return `run { val __f = ${this.closure(fn)}; fun(${params.join(', ')})${slotParts.ret === 'Unit' ? ` { ${call} }` : `: ${slotParts.ret} = ${call}`} }`;
    }
    const ret = this.closureResult(fn, slotRet).target;
    if (!ts.isMethodDeclaration(fn) && fn.name && fn.body && refersTo(fn.body, this.checker.getSymbolAtLocation(fn.name), this.checker)) throw this.error(fn, 'a named function expression');
    let params = this.params(fn, true);
    // A slot's function type may take more parameters than the literal declares (JavaScript ignores extras).
    const slotParams = slot ? functionTypeParts(slot)?.params ?? [] : [];
    for (let k = fn.parameters.length; k < slotParams.length; k++) params += `${params ? ', ' : ''}__u${k}: ${slotParams[k]}`;
    return this.asLambda(fn, params, ret) ?? `fun(${params})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  /** A function literal's result slot, where `slotRet` is the result of the function type it is given as: nothing where that returns void, else its own type. */
  private closureResult(fn: ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration, slotRet: string | undefined): ResultSlot {
    const contextual = this.checker.getContextualType(fn)?.getCallSignatures()[0];
    const voidSlot = (!!contextual && !!(contextual.getReturnType().flags & ts.TypeFlags.Void) && !isAsync(fn)) || slotRet === 'Unit';
    let ret = voidSlot ? 'Unit' : slotRet ?? this.returnTypeOf(fn);
    // Library mode: a function returning null where TypeScript (unchecked for null) infers an object: nullable.
    if (this.library && !slotRet && !voidSlot && this.isObjectType(ret) && !isNullable(ret) && fn.body && returnsNull(fn.body)) ret = optionalType(ret);
    return resultSlot(ret, fn);
  }

  /**
   * A function literal as a Kotlin lambda: its last `return` is the lambda's value, an earlier one returns to its label
   * (`return@fn1`). Null where only an anonymous function will do: an async function or a generator, which suspend through
   * `return`s of their own, or one with a result whose body does not end in a `return`, which Kotlin would type by it.
   */
  private asLambda(fn: ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration, params: string, ret: string): string | null {
    if (isAsync(fn) || fn.asteriskToken || !fn.body || this.readsArguments(fn)) return null;
    // A lambda checks its non-null parameters, which an anonymous function does not: script may pass undefined (null) to one
    // it uses, so such a function stays anonymous; an unused one takes the nullable type, which fits the same slot.
    const declared = splitTopLevel(params).map((p) => p.trim()).filter(Boolean).map((p) => { const [name, type] = p.split(/:\s*(.*)/s); return { name: name.trim(), type: type.trim() }; });
    const checked = (t: string) => !t.endsWith('?') && !['Double', 'Boolean'].includes(t);
    const read = (p: ts.ParameterDeclaration) => !ts.isIdentifier(p.name) || refersTo(fn.body!, this.checker.getSymbolAtLocation(p.name), this.checker);
    if (fn.parameters.some((p) => read(p) && checked(declared.find((d) => ts.isIdentifier(p.name) && d.name === ident(p.name.text))?.type ?? ''))) return null;
    const last = ts.isBlock(fn.body) ? fn.body.statements.at(-1) : undefined;
    if (ret !== 'Unit' && ts.isBlock(fn.body) && !(last && ts.isReturnStatement(last) && last.expression)) return null;
    const label = this.fresh('fn');
    const body = this.functionBody(fn, ret, this.indent, label);
    const inner = this.indent + '    ';
    let lines = body.slice(2, body.lastIndexOf('\n')).split('\n');
    // The last statement's `return` is the lambda's value; a `return` alone there is its end.
    const end = lines.map((l, k) => [l, k] as const).filter(([l]) => l.replace(/^(\/\*@ns:[^*]*\*\/)/, '').startsWith(`${inner}return@${label}`)).at(-1);
    if (end && !lines.slice(end[1] + 1).some((l) => l.startsWith(inner) && !l.startsWith(inner + ' ') && !/^\s*[})\]]/.test(l))) {
      const [l, k] = end;
      lines[k] = l.replace(`return@${label} `, '').replace(new RegExp(`return@${label}$`), '');
      if (!lines[k].trim() || /^\/\*@ns:[^*]*\*\/\s*$/.test(lines[k].trim())) lines.splice(k, 1);
    } else if (ret !== 'Unit') return null;
    lines = lines.filter((l, k) => !(k === lines.length - 1 && l.trim() === ''));
    const text = lines.join('\n');
    const head = declared.length ? ` ${declared.map((p) => (mentions(text, p.name) ? `${p.name}: ${p.type}` : `_: ${checked(p.type) ? optionalType(p.type) : p.type}`)).join(', ')} ->` : '';
    return `${mentions(text, `return@${label}`) || text.includes(`return@${label}`) ? `${label}@` : ''}{${head}\n${text}\n${this.indent}}`;
  }

  /** A callback for a timer or microtask: a closure, a function value called with nothing, or a Promise's resolve. */
  private callback(e: ts.Expression): string {
    // An async function: called for its effects, the promise it gives left alone.
    if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && isAsync(e)) return `run { val __f = ${this.closure(e)}; { __f(); Unit } }`;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e, '() -> Unit');
    const resolvers = ts.isIdentifier(e) ? this.resolvers.get(this.resolve(e)!) : undefined;
    if (resolvers) return `{ ${resolvers.name}.resolve(${resolvers.type === 'Unit' ? 'Unit' : this.zero(resolvers.type) ?? 'null'}) }`;
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const pads = (sig?.getParameters() ?? []).map((p) => (this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e) === 'Unit' ? 'Unit' : 'null'));
    const fn = this.functionValue(e);
    return `{ ${fn.includes('::') ? `(${fn})` : fn}(${pads.join(', ')}) }`;
  }

  // ---- Classes -------------------------------------------------------------------------------

  /** Whether a member of `cls` assigns `this.name`. */
  private erasedCall = new Set<ts.CallExpression>();
  /** Methods a witness of an erasing interface's signature calls, which take another JVM name than the witness's. */
  private erasedSignatureMethods = new Set<ts.MethodDeclaration>();
  private assignedProps: Set<ts.Node> | null = null;
  /** The declarations of the properties the program's code assigns anywhere (`this.navigator.tabView = view` of a service's field). */
  private assignedProperties(): Set<ts.Node> {
    if (this.assignedProps) return this.assignedProps;
    const out = new Set<ts.Node>();
    const visit = (n: ts.Node): void => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isPropertyAccessExpression(n.left)) {
        for (const d of this.checker.getSymbolAtLocation(n.left.name)?.declarations ?? []) out.add(d);
      }
      ts.forEachChild(n, visit);
    };
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return (this.assignedProps = out);
  }

  private isAssigned(cls: ts.ClassDeclaration, name: string): boolean {
    let found = false;
    const visit = (n: ts.Node): void => {
      if (found) return;
      const own = (x: ts.Expression) => ts.isPropertyAccessExpression(x) && x.expression.kind === ts.SyntaxKind.ThisKeyword && x.name.text === name;
      if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && own(n.left)) found = true;
      else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) && own(n.operand)) found = true;
      else ts.forEachChild(n, visit);
    };
    for (const m of cls.members) if (!ts.isPropertyDeclaration(m) || m.initializer) ts.forEachChild(m, visit);
    return found;
  }

  private isInjectableClass(decl: ts.Declaration | undefined): boolean {
    if (!decl || !ts.isClassDeclaration(decl) || decl.getSourceFile().isDeclarationFile) return false;
    const fn = decl.getSourceFile().fileName;
    if (fn.endsWith('/runtime/angular-rx.ts') || fn.endsWith('/runtime/angular.ts')) return true;
    // @angular/forms' builders: services whose root instance is their static `shared`.
    if (fn.endsWith('/runtime/angular-forms.ts')) return decl.members.some((m) => (ts.isPropertyDeclaration(m) || ts.isGetAccessorDeclaration(m)) && isStatic(m) && m.name.getText() === 'shared');
    if (this.pluginFiles.has(fn)) return false;
    return (ts.getDecorators(decl) ?? []).some((d) => /^Injectable\b/.test(d.expression.getText()));
  }

  /** An app's @Injectable class extending another class: translated as any class is, and made by the injector as a service is. */
  private isBasedService(cls: ts.ClassDeclaration): boolean {
    return !this.pluginFiles.has(cls.getSourceFile().fileName) && (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable')) && !!cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
  }

  private parameterInject(p: ts.ParameterDeclaration): string {
    const pt = this.typeOf(p.name);
    let injectArg: ts.Expression | undefined;
    let optional = !!(p.questionToken || p.initializer);
    let skipSelf = false;
    for (const d of ts.getDecorators(p) ?? []) {
      const e = d.expression;
      const which = ts.isCallExpression(e) ? e.expression.getText() : e.getText();
      if (which === 'Inject' && ts.isCallExpression(e) && e.arguments[0]) injectArg = e.arguments[0];
      else if (which === 'Optional') optional = true;
      else if (which === 'SkipSelf') skipSelf = true;
    }
    if (optional && skipSelf) return isNullable(pt) || pt === 'Any?' ? 'null' : this.fromAny('null', pt);
    if (injectArg && ts.isCallExpression(injectArg) && injectArg.expression.getText() === 'forwardRef' && injectArg.arguments[0] && (ts.isArrowFunction(injectArg.arguments[0]) || ts.isFunctionExpression(injectArg.arguments[0])) && !ts.isBlock(injectArg.arguments[0].body)) {
      injectArg = injectArg.arguments[0].body;
    }
    const builtins = ['RouterExtensions', 'ActivatedRoute', 'Page', 'DestroyRef', 'ChangeDetectorRef', 'ElementRef', 'NativeDialogRef', 'NativeDialogService', 'Router', 'HttpClient', 'Injector', 'EnvironmentInjector', 'NgZone', 'ErrorHandler', 'Location', 'ViewContainerRef', 'ApplicationRef'];
    if (injectArg) {
      const target = ts.isExpressionWithTypeArguments(injectArg) ? injectArg.expression : injectArg;
      const token = this.tokenName(target);
      if (token === 'NATIVE_DIALOG_DATA') return this.fromAny('NativeDialogRef.current.data', pt);
      const tokenDecl = this.resolve(target)?.declarations?.[0];
      if (builtins.includes(token) || this.isInjectableClass(tokenDecl)) return injected(token);
      const raw = `Injector.inject(${this.coerce(injectArg, 'Any?')}${optional ? ', JSObject(mapOf("optional" to true))' : ''})`;
      return pt === 'Any?' ? raw : this.fromAny(raw, pt);
    }
    const ref = p.type && ts.isTypeReferenceNode(p.type)
      ? p.type
      : p.type && ts.isUnionTypeNode(p.type)
        ? p.type.types.find(ts.isTypeReferenceNode)
        : undefined;
    if (ref) {
      const token = this.tokenName(ref.typeName);
      const tokenDecl = this.resolve(ref.typeName)?.declarations?.[0];
      if (builtins.includes(token) || this.isInjectableClass(tokenDecl)) return injected(token);
      if (tokenDecl && ts.isClassDeclaration(tokenDecl)) {
        const raw = `Injector.inject(${token}::class.java${optional ? ', JSObject(mapOf("optional" to true))' : ''})`;
        return pt === 'Any?' ? raw : this.fromAny(raw, pt);
      }
    }
    if (p.initializer) return this.stored(p.initializer, p, pt);
    return isNullable(pt) || pt === 'Any?' ? 'null' : this.fromAny('null', pt);
  }

  /** A component's members; the caller adds `render()`. Returns the constructor parameters and the lines inside the class. */
  componentMembers(cls: ts.ClassDeclaration, props: string[]): { params: string[]; lines: string[]; statics: string[] } {
    this.props = new Set(props);
    this.computed = new Set(cls.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && ['computed', 'toSignal'].includes(this.calleeName(m.initializer))).map((m) => (m.name as ts.Identifier).text));
    const lines: string[] = [];
    const params: string[] = [];
    // A component's or service's static members, in its companion object.
    const statics: string[] = [];
    const staticAccessors = new Set<string>();
    this.indent = '        ';
    for (const m of cls.members) {
      if (!isStatic(m)) continue;
      if (ts.isPropertyDeclaration(m) && ts.isIdentifier(m.name)) {
        const t = this.typeOf(m.name);
        const constant = hasModifier(m, ts.SyntaxKind.ReadonlyKeyword);
        statics.push(m.initializer ? `        ${constant ? 'val' : 'var'} ${ident(m.name.text)}: ${t} = ${this.stored(m.initializer, m, t)}` : `        ${this.deferredDeclaration(ident(m.name.text), t)}`);
      } else if (ts.isMethodDeclaration(m) && m.body) statics.push('        ' + this.func(m, ident(m.name.getText())));
      else if ((ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) && ts.isIdentifier(m.name)) {
        const n = m.name.text;
        if (staticAccessors.has(n)) continue;
        staticAccessors.add(n);
        const get = cls.members.find((x): x is ts.GetAccessorDeclaration => ts.isGetAccessorDeclaration(x) && isStatic(x) && x.name.getText() === n);
        const set = cls.members.find((x): x is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(x) && isStatic(x) && x.name.getText() === n);
        const t = get ? this.returnTypeOf(get) : this.typeOf(set!.parameters[0].name);
        statics.push(`        ${set ? 'var' : 'val'} ${ident(n)}: ${t}`, get ? `            get() ${this.functionBody(get, t, '            ')}` : `            get() = ${isNullable(t) || t === 'Any?' ? 'null' : this.zero(t) ?? 'null'}`);
        if (set) statics.push(`            set(${ident((set.parameters[0].name as ts.Identifier).text)}) ${this.functionBody(set, 'Unit', '            ')}`);
      } else if (m.kind !== ts.SyntaxKind.ClassStaticBlockDeclaration || (m as ts.ClassStaticBlockDeclaration).body.statements.length) throw this.error(m, 'a static member of this kind in a component or service');
    }
    this.indent = '    ';
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    if (ctor?.parameters.length && !props.length) {
      for (const p of ctor.parameters) {
        const pName = (p.name as ts.Identifier).text;
        const pt = this.typeOf(p.name);
        const val = this.parameterInject(p);
        const isParamProp = (ts.getModifiers(p) ?? []).some((mod) =>
          mod.kind === ts.SyntaxKind.PrivateKeyword ||
          mod.kind === ts.SyntaxKind.ProtectedKeyword ||
          mod.kind === ts.SyntaxKind.PublicKeyword ||
          mod.kind === ts.SyntaxKind.ReadonlyKeyword
        );
        if (isParamProp) {
          const reassigned = !hasModifier(p, ts.SyntaxKind.ReadonlyKeyword) && (this.isAssigned(cls, pName) || this.assignedProperties().has(p));
          params.push(`${reassigned ? 'var' : 'val'} ${ident(pName)}: ${pt} = ${val}`);
        } else {
          params.push(`${ident(pName)}: ${pt} = ${val}`);
        }
      }
    }
    const seenAccessors = new Set<string>();
    for (const m of cls.members) {
      if (isStatic(m)) continue;
      if (ts.isPropertyDeclaration(m)) {
        const name = (m.name as ts.Identifier).text;
        const callee = m.initializer ? this.calleeName(m.initializer) : '';
        if (callee === 'input' || callee === 'input.required' || callee === 'model' || callee === 'model.required') {
          const t = this.typeOf(m.name).replace(/^Signal<(.*)>$/, '$1');
          const given = (m.initializer as ts.CallExpression).arguments[0];
          const def = given ? ` = ${this.coerce(given, t)}` : callee === 'input' || callee === 'model' ? ' = null' : '';
          params.push(`${ident(name)}: ${t}${def}`);
          lines.push(`    val ${ident(name)}: Signal<${t}> = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        if (callee === 'toSignal') {
          // A signal of the source's latest value, read as a computed is: by its name.
          const [source, options] = (m.initializer as ts.CallExpression).arguments;
          const t = this.typeOf(m.name);
          const initial = options && ts.isObjectLiteralExpression(options) ? options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'initialValue') : undefined;
          if (!initial) throw this.error(m, 'toSignal without an initialValue');
          lines.push(`    private val __${name}: Signal<${t}> = toSignal(${this.expr(source)}, ${this.coerce(initial.initializer, t)})`, `    val ${ident(name)}: ${t}`, `        get() = __${name}.value`);
          continue;
        }
        // A field holding another signal (`dayColor = ink`, a module's `computed`): read through it, so each read is the signal's current value.
        if (!this.library && m.initializer && !ts.isCallExpression(m.initializer) && this.symbolName(m.initializer) === 'Signal' && (ts.isIdentifier(m.initializer) || ts.isPropertyAccessExpression(m.initializer))) {
          this.computed.add(name);
          lines.push(`    val ${ident(name)}: ${this.typeOf(m.name)}`, `        get() = ${this.expr(m.initializer)}`);
          continue;
        }
        // `signal.asReadonly()`: a field reading the signal it wraps.
        if (/\.asReadonly$/.test(callee) && ts.isPropertyAccessExpression((m.initializer as ts.CallExpression).expression)) {
          const source = ((m.initializer as ts.CallExpression).expression as ts.PropertyAccessExpression).expression;
          lines.push(`    val ${ident(name)}: ${this.typeOf(m.name)}`, `        get() = ${this.expr(source)}.value`);
          continue;
        }
        if (callee === 'computed') {
          const fn = (m.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
          const t = this.computedType(m.initializer as ts.CallExpression);
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
        // An Angular component's field without an initializer is a field like any other: its inputs are `input()`s.
        if (!m.initializer && this.plainFields && !this.props.has(name)) {
          // One the class tests for (a view kept from its `loaded` event): missing until then, unwrapped where it is read.
          if (this.isObjectType(t) && !isNullable(t) && !isFunctionType(t) && this.memberTruthTested(cls, name)) {
            const sym = this.checker.getSymbolAtLocation(m.name);
            if (sym) this.nullableDecls.add(sym);
            lines.push(`    var ${ident(name)}: ${optionalType(t)} = null`);
            continue;
          }
          lines.push(`    ${this.deferredDeclaration(ident(name), t)}`);
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
        const reassigned = !hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) && (this.isAssigned(cls, name) || this.assignedProperties().has(m));
        lines.push(`    ${reassigned ? 'var' : 'val'} ${ident(name)}: ${t} = ${this.stored(m.initializer, m, t)}`);
        this.indent = '    ';
        continue;
      }
      if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
        const aName = (m.name as ts.Identifier).text;
        if (seenAccessors.has(aName)) continue;
        seenAccessors.add(aName);
        const get = cls.members.find((x): x is ts.GetAccessorDeclaration => ts.isGetAccessorDeclaration(x) && x.name.getText() === aName && !isStatic(x));
        const set = cls.members.find((x): x is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(x) && x.name.getText() === aName && !isStatic(x));
        if (get && !set) {
          const t = this.returnTypeOf(get);
          lines.push(`    val ${ident(aName)}: ${t}`, `        get() ${this.functionBody(get, t, '        ')}`);
        } else if (set) {
          const t = get ? this.returnTypeOf(get) : this.typeOf(set.parameters[0].name);
          const p = set.parameters[0].name as ts.Identifier;
          const getLine = get ? `        get() ${this.functionBody(get, t, '        ')}` : `        get() = ${isNullable(t) || t === 'Any?' ? 'null' : this.zero(t) ?? 'null'}`;
          const setLine = `        set(${ident(p.text)}) ${this.functionBody(set, 'Unit', '        ')}`;
          lines.push(`    var ${ident(aName)}: ${t}`, getLine, setLine);
        }
        continue;
      }
      if (ts.isMethodDeclaration(m)) {
        // An overload's signature: Kotlin's one function is the implementation's.
        if (!m.body) continue;
        this.templateParams = /^\$[be]\d+$/.test(m.name.getText());
        try { lines.push('    ' + this.func(m, ident((m.name as ts.Identifier).text))); } finally { this.templateParams = false; }
        continue;
      }
    }
    // The constructor's body runs once every field has its value, as TypeScript's class fields come first.
    if (ctor?.body?.statements.length && ownReturns(ctor.body)) {
      this.returnLabel = '__ctor';
      this.indent = '        ';
      try { lines.push(`    init {\n        run __ctor@${this.block(ctor.body, '        ')}\n    }`); } finally { this.returnLabel = null; }
    } else if (ctor?.body?.statements.length) lines.push(`    init ${this.block(ctor.body, '    ')}`);
    this.indent = '';
    return { params, lines, statics };
  }

  /**
   * `Object.defineProperty` on an app class's instance that makes one of its declared fields an accessor, read-only,
   * hidden or fixed: the class's Kotlin field keeps none of these.
   */
  private checkFieldDefinition(target: ts.Expression, key: ts.Node | undefined, descriptor: ts.Node): void {
    if (this.library) return;
    const cls = this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)).getSymbol()?.valueDeclaration;
    if (!cls || !ts.isClassLike(cls) || cls.getSourceFile().isDeclarationFile || this.pluginFiles.has(cls.getSourceFile().fileName)) return;
    const restricts = !ts.isObjectLiteralExpression(descriptor) || descriptor.properties.some((p) => {
      const name = p.name && !ts.isComputedPropertyName(p.name) ? p.name.getText().replace(/^['"]|['"]$/g, '') : undefined;
      if (name === 'get' || name === 'set') return true;
      if (name === 'value') return false;
      if (name === 'writable' || name === 'enumerable' || name === 'configurable') return !ts.isPropertyAssignment(p) || p.initializer.kind !== ts.SyntaxKind.TrueKeyword;
      return !name;
    });
    if (!restricts) return;
    const keyText = key && (ts.isStringLiteralLike(key) || ts.isIdentifier(key) || ts.isNumericLiteral(key)) ? key.text : undefined;
    const field = keyText !== undefined ? this.checker.getTypeAtLocation(target).getProperty(keyText)?.valueDeclaration : undefined;
    const declared = !!field && (ts.isPropertyDeclaration(field) || ts.isParameter(field)) && !field.getSourceFile().isDeclarationFile;
    if (keyText !== undefined && !declared) return;
    throw this.error(key ?? target, keyText === undefined ? 'Object.defineProperty with a key known only at run time on a class instance, with a descriptor that may restrict a declared field' : `Object.defineProperty making a class's declared field (${keyText}) an accessor, read-only, hidden or fixed`);
  }

  /** A method of an app's generic interface that is a Kotlin interface, which holds the interface's type parameters as `Any?`. */
  private erasingInterface(m: ts.MethodSignature): boolean {
    const iface = m.parent;
    return ts.isInterfaceDeclaration(iface) && !!iface.typeParameters?.length && !iface.getSourceFile().isDeclarationFile && this.protocols.has(iface.name.text);
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  /** The names an app class's members override: its app base classes' and its interfaces'. */
  private overridden(cls: ts.ClassLikeDeclaration, implemented?: string[]): Set<string> {
    const out = new Set<string>();
    const c = this.checker;
    const addInterface = (h: ts.ExpressionWithTypeArguments) => {
      if (implemented && h.parent.parent === cls && !implemented.includes(this.implementedName(h))) return;
      const t = c.getTypeAtLocation(h);
      if (isLibDeclaration(t.getSymbol()?.declarations?.[0])) return;
      // A class implemented as an interface (core's `implements ListViewDefinition`, a subclass of its own) is no supertype.
      if (this.library && t.getSymbol()?.declarations?.some((d) => ts.isClassDeclaration(d) && !d.getSourceFile().isDeclarationFile)) return;
      // Library mode: an interface only a declaration file has is no Kotlin interface (`implementedInterfaces` leaves it out).
      if (this.library && (t.getSymbol()?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile)) return;
      for (const p of t.getProperties()) out.add(p.name);
    };
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      if (b !== cls) for (const m of b.members) if (m.name) out.add(m.name.getText());
      for (const i of b.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) addInterface(i);
      for (const d of this.structural.get(b) ?? []) if (b !== cls || !implemented || implemented.includes(this.topName(d, d.name.text))) for (const m of d.members) if (m.name) out.add(m.name.getText());
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && c.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return out;
  }

  /** The Kotlin name of an interface a class names in its `implements` clause. */
  private implementedName(i: ts.ExpressionWithTypeArguments): string {
    const text = ts.isPropertyAccessExpression(i.expression) ? i.expression.name.text : i.expression.getText();
    const d = this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration);
    return d && !d.getSourceFile().isDeclarationFile ? this.topName(d, text) : text;
  }

  /** The interfaces a class implements, named or met, that are Kotlin interfaces it implements; `witnesses` gets the adapters its methods need. */
  private implementedProtocols(cls: ts.ClassLikeDeclaration, witnesses: string[], notOverrides: Set<string>): string[] {
    const implemented: string[] = implementedInterfaces(this.checker, cls).filter((i) => !isLibDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0]))
      // Library mode: an interface only a declaration file has is no Kotlin interface.
      .filter((i) => !this.library || !(this.checker.getTypeAtLocation(i).getSymbol()?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile))
      // What an app implements of @angular/forms (`Validator`) is called untyped: no Kotlin interface.
      .filter((i) => !(this.checker.getTypeAtLocation(i).getSymbol()?.declarations ?? []).every((d) => d.getSourceFile().fileName === '/__shims__/_angular#forms.d.ts'))
      // The generated kit: an interface core declares that the kit has no type for (`TraceWriter`, which core holds untyped).
      .filter((i) => !this.generatedKit || !isCoreDeclaration(this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.[0]) || !!this.core?.has(ts.isPropertyAccessExpression(i.expression) ? i.expression.name.text : i.expression.getText()))
      // An interface the class's signatures cannot meet is left out; untyped parameters meet it through a witness.
      .filter((i) => this.protocolWitnesses(cls, this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration), this.implementedName(i), witnesses, notOverrides))
      .map((i) => this.implementedName(i));
    for (const d of this.structural.get(cls) ?? []) {
      const name = this.topName(d, d.name.text);
      if (!implemented.includes(name) && this.protocolWitnesses(cls, d, name, witnesses, notOverrides)) implemented.push(name);
    }
    return implemented;
  }

  /**
   * A component class's supertypes for the app interfaces it implements, the names its members override, and the
   * members it adds: every app interface extends JSDynamic, which here reads and writes the interfaces' fields only.
   */
  componentConformance(cls: ts.ClassDeclaration): { supertypes: string[]; overrides: Set<string>; lines: string[] } {
    const witnesses: string[] = [];
    const notOverrides = new Set<string>();
    const appInterface = (n: string) => this.protocols.has(n) && [...implementedInterfaces(this.checker, cls).map((i) => this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration)), ...this.structural.get(cls) ?? []]
      .some((d) => !!d && this.topName(d, d.name.text) === n && !d.getSourceFile().isDeclarationFile);
    const supertypes = this.implementedProtocols(cls, witnesses, notOverrides).filter(appInterface);
    if (!supertypes.length) return { supertypes, overrides: new Set(), lines: [] };
    for (const i of supertypes) this.used.add(i);
    const overrides = this.overridden(cls, supertypes);
    for (const n of notOverrides) overrides.delete(n);
    const fields: { name: string; type: string }[] = [];
    const accessors: { name: string; type: string; readable: boolean; settable: boolean }[] = [];
    const seen = new Set<string>();
    for (const i of implementedInterfaces(this.checker, cls)) {
      const d = this.checker.getTypeAtLocation(i).getSymbol()?.declarations?.find(ts.isInterfaceDeclaration);
      if (!d || !supertypes.includes(this.topName(d, d.name.text))) continue;
      for (const m of this.withInherited(d, d.members)) {
        if (!ts.isPropertySignature(m) || !ts.isIdentifier(m.name) || seen.has(m.name.text)) continue;
        seen.add(m.name.text);
        const type = m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m);
        const own = cls.members.find((x) => x.name?.getText() === m.name.getText());
        const readOnly = hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) || (!!own && hasModifier(own, ts.SyntaxKind.ReadonlyKeyword));
        if (readOnly) accessors.push({ name: m.name.text, type, readable: true, settable: false });
        else fields.push({ name: m.name.text, type });
      }
    }
    return { supertypes, overrides, lines: [...witnesses, ...this.dynamicMembers({}, { fields, className: cls.name?.text ?? null, accessors })] };
  }

  /**
   * Whether a class can implement an interface. A method whose untyped
   * parameters the interface types (`handle(error)` for `handle(error: Error)`)
   * implements it through a witness of the interface's signature that calls
   * it; any other difference leaves the interface out.
   */
  private protocolWitnesses(cls: ts.ClassLikeDeclaration, decl: ts.InterfaceDeclaration | undefined, name: string, out: string[], notOverrides: Set<string>): boolean {
    if (!decl || !this.protocols.has(name)) return true;
    const own = (name: string) => cls.members.find((x) => x.name?.getText() === name);
    const added: string[] = [];
    const skipped: string[] = [];
    for (const req of decl.members) {
      const name = req.name?.getText();
      const m = name ? own(name) : undefined;
      // A writable field the interface erases to any value, which a field typed by the class's type parameter can't override.
      if (name && ts.isPropertySignature(req) && !hasModifier(req, ts.SyntaxKind.ReadonlyKeyword) && this.typeOf(req) === 'Any?') {
        const field = m ?? cls.members.find(ts.isConstructorDeclaration)?.parameters.find((p) => ts.isIdentifier(p.name) && p.name.text === name && ts.getModifiers(p)?.length);
        const t = field && (ts.isPropertyDeclaration(field) || ts.isParameter(field) || ts.isGetAccessorDeclaration(field) || ts.isSetAccessorDeclaration(field)) ? this.checker.getTypeAtLocation(field.name) : undefined;
        if (t && t.flags & ts.TypeFlags.TypeParameter && t.symbol?.declarations?.[0]?.parent === cls) throw this.error(field, 'a field typed by a generic class\'s type parameter, met as a generic interface\'s field');
      }
      if (!name || !m || !ts.isMethodSignature(req)) continue;
      if (!ts.isMethodDeclaration(m)) return false;
      const want = req.parameters.map((p) => this.requirementParamType(p));
      const have = m.parameters.map((p) => this.paramType(p));
      const ret = this.returnTypeOf(req), ownRet = this.returnTypeOf(m);
      if (want.length === have.length && want.every((t, k) => t === have[k]) && ret === ownRet) continue;
      // A generic class's own type parameter where the interface, which erases its own, takes or gives any value.
      const typeParameter = (t: string) => !!cls.typeParameters?.some((p) => p.name.text === t);
      const erased = (t: string, k: number) => want[k] === 'Any?' && typeParameter(t);
      // Kotlin overrides with a narrower result.
      if (want.length === have.length && want.every((t, k) => t === have[k]) && ret === 'Any?' && typeParameter(ownRet)) continue;
      if (want.length !== have.length || have.some((t, k) => t !== want[k] && t !== 'Any?' && !erased(t, k)) || (ret !== ownRet && ret !== 'Any?') || want.every((t, k) => t === have[k])) return false;
      if (have.some(erased)) {
        // The witness and the method erase to one JVM signature: the method takes another JVM name, which an open one can't.
        if (this.extended.has(cls.name?.text ?? '') || (ts.isClassDeclaration(cls) && this.extendedDecls.has(cls)) || hasModifier(cls, ts.SyntaxKind.AbstractKeyword) || (ts.isClassDeclaration(cls) && this.literalClasses().has(cls))) throw this.error(m, 'a method of a generic class that is extended, met as a generic interface\'s method');
        this.erasedSignatureMethods.add(m);
      }
      const args = req.parameters.map((p, k) => (ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`));
      const call = `${ident(name)}(${args.map((a, k) => (have[k] === want[k] ? a : erased(have[k], k) ? `jsUnchecked<${have[k]}>(${a})` : `${a} as Any?`)).join(', ')})`;
      added.push(`    override fun ${ident(name)}(${want.map((t, k) => `${args[k]}: ${t}`).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} { ${ret === 'Unit' ? call : ownRet === 'Unit' ? `${call}; return null` : `return ${call}`} }`);
      skipped.push(name);
    }
    out.push(...added);
    for (const n of skipped) notOverrides.add(n);
    return true;
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const code = this.suppressingDeprecations(() => this.classDeclCode(cls), false);
    return code ? this.docOf(cls) + this.threadAnnotation(cls) + code : code;
  }

  private classDeclCode(cls: ts.ClassDeclaration): string {
    // '' where the class is declared in a file of its own package.
    const nativeSubclass = this.native?.classDecl(cls);
    if (nativeSubclass != null) return nativeSubclass;
    // A namespace's class is declared in its object, by its own name.
    const name = ts.isModuleBlock(cls.parent) ? ident(cls.name!.text) : this.className(cls);
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable')) && !this.isBasedService(cls);
    // A plugin's @Injectable class is a final service with no base (ngrx's Store extends rxjs' Observable, ComponentStore is extended).
    const extendsOf = (c: ts.ClassDeclaration) => c.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (service && this.pluginFiles.has(cls.getSourceFile().fileName) && extendsOf(cls)) throw this.error(extendsOf(cls), `on Android, a plugin's @Injectable class extending another (${cls.name?.text ?? 'class'})`);
    const pluginService = (d: ts.Node | undefined) => !!d && ts.isClassDeclaration(d) && this.pluginFiles.has(d.getSourceFile().fileName) && (ts.getDecorators(d) ?? []).some((x) => x.expression.getText().startsWith('Injectable'));
    const extendedService = extendsOf(cls) && this.checker.getTypeAtLocation(extendsOf(cls)!.expression).getSymbol()?.valueDeclaration;
    if (pluginService(extendedService)) throw this.error(extendsOf(cls), `on Android, extending a plugin's @Injectable class (${(extendedService as ts.ClassDeclaration).name?.text})`);
    if (service) {
      const { params, lines, statics } = this.componentMembers(cls, []);
      return [`class ${name}(${params.join(', ')}) {`, ...lines, '', '    companion object {', `        val shared: ${name} get() = AppInjector.service(${name}::class.java) { ${name}() }`, ...statics, '    }', '}'].join('\n');
    }
    if (!this.library && this.collectionAlias(cls)) {
      this.indent = '    ';
      const statics = cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && isStatic(m) && !!m.body).map((m) => '    ' + this.func(m, ident(m.name.getText())));
      this.indent = '';
      const alias = this.collectionAlias(cls)!;
      const methods = cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !isStatic(m) && !!m.body).map((m) => this.func(m, ident(m.name.getText())).replace(/^fun /, `fun ${alias}.`));
      return [`object ${name} {`, ...statics, '}', ...methods].join('\n');
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
      if (appBase) {
        base = this.type(c.getTypeAtLocation(heritage), heritage);
        // `any` for a bounded type parameter (`Test<any>` of `Test<T extends View>`): its bound, as Kotlin holds the parameter to it.
        const bounds = appBase.typeParameters?.map((p) => (p.constraint && !this.library && !this.pluginFiles.has(appBase.getSourceFile().fileName) ? this.type(c.getTypeFromTypeNode(p.constraint), p) : null));
        if (bounds?.some(Boolean) && heritage.typeArguments?.some((a) => a.kind === ts.SyntaxKind.AnyKeyword)) {
          const kargs = heritage.typeArguments.map((a, k) => (a.kind === ts.SyntaxKind.AnyKeyword && bounds[k] ? bounds[k]!.replace(/\?$/, '') : this.type(c.getTypeFromTypeNode(a), a)));
          base = `${base.replace(/<.*$/, '')}<${kargs.join(', ')}>`;
        }
      } else if (kitRoot && isCoreDeclaration(baseDecl as ts.Declaration)) base = kitRoot;
      else if (ERRORS[baseName]) base = ERRORS[baseName];
      else throw this.error(heritage, `extending ${baseName}`);
    }
    const isError = !!base && !appBase && !kitRoot;
    const isView = !!kitRoot && !!this.core?.isKitView(kitRoot);
    const registered = (n: string) => isView && !!this.properties?.isRegistered(cls, n);
    const abstract = hasModifier(cls, ts.SyntaxKind.AbstractKeyword) || (!!this.library && this.leavesAbstract(cls));
    // Library mode: a class core exports is one an app may extend (`class Card extends StackLayout`).
    const exported = !!this.library && hasModifier(cls, ts.SyntaxKind.ExportKeyword);
    const open = this.extended.has(cls.name!.text) || this.extendedDecls.has(cls) || abstract || this.literalClasses().has(cls) || exported;
    // The library's interfaces (`Iterable<T>`, `Iterator<T>`) are interfaces of the kit's, implemented below.
    const witnesses: string[] = [];
    const notOverrides = new Set<string>();
    const implemented = this.implementedProtocols(cls, witnesses, notOverrides);
    for (const i of implemented) this.used.add(i);
    const ownToString = cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls);
    const ownValueOf = cls.members.some((m) => ts.isMethodDeclaration(m) && !isStatic(m) && !!m.body && m.name.getText() === 'valueOf' && !m.parameters.length) && !this.inheritedMethod(cls, 'valueOf');
    // A class's own toJSON is what JSON.stringify serializes in its instances' place.
    const ownToJSON = cls.members.find((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !isStatic(m) && !!m.body && m.name.getText() === 'toJSON' && m.parameters.length <= 1);
    const toJSON = ownToJSON && !this.inheritedMethod(cls, 'toJSON') ? ownToJSON : undefined;
    const supertypes = [...implemented, ...(ownToString ? ['JSStringConvertible'] : []), ...(ownValueOf ? ['JSValueOf'] : []), ...(toJSON ? ['JSToJSON'] : [])];
    // Library mode: a class at the root of its hierarchy keeps what script adds to its instances, and reads its prototype's.
    // An app's class does where script gives its instances members it doesn't declare.
    const expando = (!!this.library || this.givenUndeclared().has(cls)) && !base;
    if (expando) supertypes.push('JSExpando');
    else if (!base && !implemented.length) supertypes.push('JSDynamic');
    const overridden = this.overridden(cls, implemented);
    // Library mode: a field script leaves untyped (`object` of an event's class) where an interface it implements types it: the interface's type.
    const interfaceFields = new Map<string, string>();
    if (this.library) for (const i of implementedInterfaces(c, cls).filter((x) => implemented.includes(x.expression.getText()))) {
      const d = c.getTypeAtLocation(i).getSymbol()?.declarations?.find((x): x is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(x));
      if (d) for (const m of this.withInherited(d, d.members)) if (ts.isPropertySignature(m) && ts.isIdentifier(m.name)) interfaceFields.set(m.name.text, m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m));
    }

    for (const n of notOverrides) overridden.delete(n);
    // An accessor over a property of the generated kit's class (`get width()` of a view, its open `var width`).
    if (this.generatedKit && kitRoot) for (const m of cls.members) if (ts.isAccessor(m) && !isStatic(m) && this.core?.kitMember(kitRoot, m.name.getText())?.kind === 'var') overridden.add(m.name.getText());
    const memberOpen = open ? 'open ' : '';
    const mods = (n: string, member = true) => (overridden.has(n) ? 'override ' : member ? memberOpen : '');
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    const paramProps = (ctor?.parameters ?? []).filter((p) => ts.canHaveModifiers(p) && ts.getModifiers(p)?.some((m) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(m.kind)));
    const fields: { name: string; type: string; expando?: boolean; at?: ts.PropertyDeclaration }[] = [];
    // Before the fields: a constructor's writes note into it, which a later initializer would reset.
    const lines: string[] = [];
    const keyedInfo = isError ? null : this.keyedMembers(cls, !!appBase, lines, supertypes);
    const statics: string[] = [];
    this.indent = '    ';
    const narrowedParams = new Map<ts.ParameterDeclaration, string>();
    for (const p of paramProps) {
      const n = (p.name as ts.Identifier).text;
      const narrower = this.typeOf(p.name) === 'Any?' ? interfaceFields.get(n) : undefined;
      // Lenient code: the property holds what the parameter may (null or undefined), as its declaration does.
      const t = narrower && narrower !== 'Any?' ? optionalType(narrower) : this.states.mayBeNull(p) ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name);
      if (t !== this.typeOf(p.name)) { const sym = c.getSymbolAtLocation(p.name); if (sym) this.nullableDecls.add(sym); }
      if (narrower && narrower !== 'Any?') narrowedParams.set(p, t);
      // A property a subclass may override needs a value of its own before the constructor runs.
      lines.push(`    ${mods(n)}${open || overridden.has(n) ? this.deferredDeclaration(ident(n), t) : `var ${ident(n)}: ${t}`}`);
      fields.push({ name: n, type: t });
    }
    const symbolFields: { key: string; member: string; type: string }[] = [];
    // Where each field's lines start, for its doc comment.
    const fieldStarts: [number, ts.PropertyDeclaration][] = [];
    for (const m of cls.members) {
      // `static { … }`: with the static initializers the module runs where the class is defined, in their order, or
      // where there are none, the companion's own initialization; `this` is the class.
      if (ts.isClassStaticBlockDeclaration(m)) {
        for (const t of thisNodes(m.body)) this.subst.set(t, name);
        const deferred = !!this.staticInits;
        const saved = this.indent;
        this.indent = deferred ? '    ' : '            ';
        let body: string[];
        try { body = this.statements([...m.body.statements]); } finally { this.indent = saved; for (const t of thisNodes(m.body)) this.subst.delete(t); }
        if (deferred) this.staticInits!.push(...body);
        else statics.push(`        init {\n${body.join('\n')}\n        }`);
        continue;
      }
      if (!ts.isPropertyDeclaration(m)) continue;
      fieldStarts.push([lines.length, m]);
      // `declare width: number` in an app class: the base's field, typed anew.
      if (!this.library && hasModifier(m, ts.SyntaxKind.DeclareKeyword)) continue;
      const keyed = this.symbolMember(m.name);
      if (keyed?.key && !isStatic(m)) {
        const t = this.typeOf(m.name);
        symbolFields.push({ key: keyed.key, member: keyed.member, type: t });
        lines.push(`    var ${keyed.member}: ${t} = ${m.initializer ? this.stored(m.initializer, m, t) : this.zero(t) ?? 'null'}`);
        continue;
      }
      // `[Symbol.toStringTag] = 'TextDecoder'`: what Object.prototype.toString reports.
      if (keyed?.member === 'jsToStringTag' && !isStatic(m) && m.initializer) {
        supertypes.push('JSToStringTag');
        lines.push(`    override var jsToStringTag: String = ${this.stored(m.initializer, m, 'String')}`);
        continue;
      }
      // `static [native_];`: a static field of that symbol, unset.
      if (keyed?.key && isStatic(m)) {
        const t = optionalType(this.typeOf(m.name));
        this.indent = '        ';
        statics.push(`        @JvmStatic var ${keyed.member}: ${t} = ${m.initializer ? this.stored(m.initializer, m, t) : 'null'}`);
        this.indent = '    ';
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
          this.staticInits.push(`    ${name}.${ident(n)} = ${this.stored(m.initializer, m, t)}`);
          continue;
        }
        const st = t === 'Any?' || t.endsWith('?') ? t : this.zero(t) || m.initializer ? t : optionalType(t);
        const ssym = c.getSymbolAtLocation(m.name);
        if (ssym && st !== t) this.nullableDecls.add(ssym);
        statics.push(`        var ${ident(n)}: ${st} = ${m.initializer ? this.stored(m.initializer, m, t) : this.zero(t) ?? 'null'}`);
        this.indent = '    ';
        continue;
      }
      const nativeProperty = this.nativePropertyOf(m);
      if (nativeProperty) { lines.push(nativeProperty); continue; }
      // A function field implementing a base method (`_handler = (args) => …` for `abstract _handler(arg)`): an override running the function.
      const implemented = !this.library && m.initializer && (ts.isArrowFunction(m.initializer) || ts.isFunctionExpression(m.initializer)) ? this.inheritedMethod(cls, n) : undefined;
      if (implemented && m.initializer && (ts.isArrowFunction(m.initializer) || ts.isFunctionExpression(m.initializer)) && implemented.parameters.length === m.initializer.parameters.length && m.initializer.parameters.every((p) => ts.isIdentifier(p.name))) {
        const fn = m.initializer;
        const ret = this.returnTypeOf(implemented);
        const params = implemented.parameters.map((p, k) => `${ident((fn.parameters[k].name as ts.Identifier).text)}: ${this.paramType(p)}`);
        lines.push(`    override fun ${this.methodIdent(n)}(${params.join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, '    ')}`);
        continue;
      }
      const sym = c.getSymbolAtLocation(m.name);
      const narrower = t === 'Any?' && !isStatic(m) ? interfaceFields.get(n) : undefined;
      if (narrower && narrower !== 'Any?') {
        const it = optionalType(narrower);
        fields.push({ name: n, type: it });
        lines.push(`    override var ${ident(n)}: ${it} = ${m.initializer ? this.stored(m.initializer, m, it) : 'null'}`);
        continue;
      }
      // The generated kit: a field only typed again (`nativeViewProtected: NativeButton`) is the kit class's, read as this one's type.
      if (this.kitRedeclared(m)) continue;
      // Library mode: a field a base class declares already (`nativeViewProtected: Toolbar` over `any`) is the base's, read as this one's type.
      const root = this.library ? this.redeclaredField(m) : null;
      if (root) {
        if (sym) this.nullableDecls.add(sym);
        if (m.initializer) {
          this.indent = '        ';
          lines.push('    init {', `        this.${ident(n)} = ${this.stored(m.initializer, m, t)}`, '    }');
          this.indent = '    ';
        }
        continue;
      }
      // Library mode: a field under a name core registers a property as (`col`, registered on View, declared on ViewBase), or one
      // `Object.defineProperty(X.prototype, …)` defines, is the accessor on the prototype chain. Undefined until set: only a
      // string, number or boolean reads as its zero.
      if (this.library && (this.properties?.isRegistered(cls, n) || this.properties?.isRegisteredAnywhere(n) || this.prototypeKeys().accessors.has(n))) {
        const kt = t === 'Any?' || isNullable(t) || (this.zero(t) && !/^JS(Array|Map|Set|Record)</.test(t)) ? t : optionalType(t);
        if (sym && kt !== t) this.nullableDecls.add(sym);
        fields.push({ name: n, type: kt, expando: true });
        // A string property a template or script set to a number (`[text]="index + 1"`) reads as that number's string, as core's `text + ''` does.
        const read = kt === 'String' ? `jsStringOrEmpty(jsExpandoGet(this, ${kotlinString(n)}))` : this.fromAnyCode(`jsExpandoGet(this, ${kotlinString(n)})`, kt, true);
        lines.push(`    ${mods(n)}var ${ident(n)}: ${kt}`, `        get() = ${read}`, `        set(value) { jsExpandoSet(this, ${kotlinString(n)}, value) }`);
        if (m.initializer) {
          this.indent = '        ';
          lines.push('    init {', `        this.${ident(n)} = ${this.stored(m.initializer, m, t)}`, '    }');
          this.indent = '    ';
        }
        continue;
      }
      // Library mode: a field `X.prototype.name = v` gives a value, which reads through the prototype chain until the instance has its own.
      if (this.library && !m.initializer && this.prototypeKeys().data.has(n) && !this.prototypeDefaulted().has(m)) {
        const kt = t === 'Any?' || isNullable(t) ? t : optionalType(t);
        if (sym && kt !== t) this.nullableDecls.add(sym);
        const own = `__own_${n.replace(/\W/g, '_')}`;
        fields.push({ name: n, type: kt });
        lines.push(`    private var ${own}: ${kt} = null`, `    private var ${own}_set = false`, `    ${mods(n)}var ${ident(n)}: ${kt}`, `        get() = if (${own}_set) ${own} else ${this.fromAnyCode(isFunctionType(kt.replace(/^\((.*)\)\?$/, '$1')) ? `jsBoundTo(JSPrototypes.value(this.javaClass, ${kotlinString(n)}, this), this)` : `JSPrototypes.value(this.javaClass, ${kotlinString(n)}, this)`, kt, true)}`, `        set(value) { ${own} = value; ${own}_set = true }`);
        continue;
      }
      if (registered(n)) {
        // A field under a registered property's name is the property: core's accessor on the prototype.
        const kt = t === 'Any?' || t.endsWith('?') ? t : optionalType(t);
        if (sym && kt !== t) this.nullableDecls.add(sym);
        lines.push(`    ${mods(n)}var ${ident(n)}: ${kt}`, `        get() = ${this.fromAnyCode(`get(${kotlinString(n)})`, kt)}`, `        set(value) { set(${kotlinString(n)}, value) }`);
        if (m.initializer) {
          this.indent = '        ';
          lines.push('    init {', `        this.${ident(n)} = ${this.stored(m.initializer, m, t)}`, '    }');
          this.indent = '    ';
        }
        continue;
      }
      // A field no subclass redeclares is a JVM field: its accessors would clash with methods of the same JVM names (`tag` and `getTag()`).
      const fieldMods = overridden.has(n) ? 'override ' : this.subclassFields(cls).has(n) ? 'open ' : plugin ? '@JvmField ' : mods(n);
      const nullInit = !!m.initializer && (m.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(m.initializer) && m.initializer.text === 'undefined'));
      // A field of a class with no base that something may read before the constructor assigns it (see `definitelyAssignedFields`).
      const readEarly = !m.initializer && !this.library && !cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword) && !this.definiteFields(cls).has(m) && this.deferredDeclaration('x', t).startsWith('lateinit ');
      // A field whose writes note its key has a setter, which `lateinit` can't.
      const setter = this.keySetter(cls, n);
      const lateSetter = setter.length > 0 && !m.initializer && this.deferredDeclaration('x', t).startsWith('lateinit ');
      if ((plugin || readEarly || lateSetter || (!m.initializer && chainedThrough(cls, n))) && (nullInit || !m.initializer) && !isNullable(t) && t !== 'Any?' && t !== 'Unit') {
        // Unset (or `null`) in code checked without strictNullChecks: nullable, unwrapped where it is read.
        if (sym) this.nullableDecls.add(sym);
        fields.push({ name: n, type: optionalType(t), at: m });
        lines.push(`    ${fieldMods}var ${ident(n)}: ${optionalType(t)} = null`, ...setter);
        continue;
      }
      fields.push({ name: n, type: t, at: m });
      // Read early by a base class's constructor: null (undefined) until the class's own initialization sets it.
      if (m.initializer && fieldMods !== '@JvmField ' && this.earlyField(m)) {
        const backing = earlyBacking(n);
        lines.push(`    var ${backing}: ${t}? = ${this.stored(m.initializer, m, t)}`, `    ${fieldMods}var ${ident(n)}: ${t}`, `        get() = ${this.undefinedAs(backing, t)}`, setter.length ? setter[0].replace('field = value', `${backing} = value`) : `        set(value) { ${backing} = value }`);
        continue;
      }
      if (m.initializer) lines.push(`    ${fieldMods}var ${ident(n)}: ${t} = ${this.stored(m.initializer, m, t)}`, ...setter);
      // A non-strict app's array, map or set field holds undefined until given one.
      else if (this.lenientApp && !this.library && /^JS(Array|Map|Set)</.test(t)) lines.push(`    ${fieldMods}var ${ident(n)}: ${t} = jsUncheckedNull<${t}>()`, ...setter);
      else {
        const d = this.deferredDeclaration(ident(n), t);
        lines.push(`    ${d.startsWith('lateinit') && fieldMods === '@JvmField ' ? '' : fieldMods}${d}`, ...setter);
      }
    }
    fieldStarts.forEach(([at, m], k) => { if ((fieldStarts[k + 1]?.[0] ?? lines.length) > at) fieldStarts[k][0] = -1 - at; });
    for (const [at, m] of fieldStarts.reverse()) { const doc = at < 0 ? this.docOf(m, '    ') : ''; if (doc) lines.splice(-1 - at, 0, `    ${doc.trimEnd()}`); }
    const defaults = this.prototypeDefaults().get(cls) ?? [];
    if (defaults.length) {
      this.indent = '        ';
      lines.push('    init {', ...defaults.map((d) => `        this.${ident(d.field.name.getText())} = ${this.coerce(d.value, this.typeOf(d.field.name))}`), '    }');
      this.indent = '    ';
    }
    const baseCtor = appBase && this.constructorOf(appBase);
    const early = ctor ? this.statementsBeforeSuper(ctor) : null;
    if (ctor && early) {
      // Statements before `super(…)` (Kotlin's delegation comes first) run in a function of the class's; the
      // super arguments, the parameters and the locals they declare go to a private constructor, which runs the rest.
      const { pre, superCall, rest } = early;
      const helper = `__beforeSuper${this.tmp++}`;
      const names = ctor.parameters.map((p, k) => (ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`));
      const locals = pre.flatMap((st) => (ts.isVariableStatement(st) ? st.declarationList.declarations.flatMap((d) => boundNames(d.name)) : []));
      const sig = this.checker.getResolvedSignature(superCall);
      const superTypes = (sig?.getParameters() ?? []).slice(0, superCall.arguments.length).map((p) => {
        const d = p.valueDeclaration;
        const t = this.type(this.checker.getTypeOfSymbolAtLocation(p, superCall), superCall);
        // As `args` passes them: optional where the program's constructor declares no constant default.
        const declared = !!d && ts.isParameter(d) && !d.getSourceFile().isDeclarationFile;
        return declared && (d as ts.ParameterDeclaration).questionToken || (declared && (d as ts.ParameterDeclaration).initializer && !this.isConstant((d as ts.ParameterDeclaration).initializer!)) ? optionalType(t) : t;
      });
      this.indent = '            ';
      const helperBody = this.inFunction('Unit', () => [...this.paramPrelude(ctor), ...this.statements(pre)]);
      const superArgs = superCall.arguments.map((a) => this.restArgument(superCall, a, 'Any?'));
      statics.push(`        private fun ${helper}(${this.params(ctor, true)}): Array<Any?> {`, ...helperBody, `            return arrayOf(${[...superArgs, ...names, ...locals.map((n) => ident(n.text))].join(', ')})`, '        }');
      this.indent = '        ';
      const restBody = this.inFunction('Unit', () => {
        const binds = [...ctor.parameters.map((p, k) => `        ${assignsTo(ctor.body!, this.checker.getSymbolAtLocation(p.name), this.checker) ? 'var' : 'val'} ${names[k]}: ${this.paramType(p)} = (__s[${superArgs.length + k}] as ${this.paramType(p)})`),
          ...locals.map((n, k) => `        var ${ident(n.text)}: ${optionalType(this.typeOf(n))} = (__s[${superArgs.length + names.length + k}] as ${optionalType(this.typeOf(n))})`)];
        const own = paramProps.map((p) => `        this.${ident((p.name as ts.Identifier).text)} = ${ident((p.name as ts.Identifier).text)}`);
        const notes = this.keyNotes;
        this.keyNotes = this.initKeyNotes(cls);
        try { return [...binds, ...this.levelStart(cls), ...own, ...this.statements(rest)]; } finally { this.keyNotes = notes; }
      });
      for (const n of locals) { const sym = this.checker.getSymbolAtLocation(n); if (sym) this.nullableDecls.add(sym); }
      this.indent = '    ';
      lines.push(`    constructor(${this.params(ctor, false)}) : this(${helper}(${names.join(', ')}), Unit)`);
      lines.push(`    private constructor(__s: Array<Any?>, @Suppress("UNUSED_PARAMETER") __m: Unit) : super(${superTypes.map((t, k) => this.fromAnyCode(`__s[${k}]`, t, true)).join(', ')}) {`, ...restBody, '    }');
    } else if (ctor) {
      const body = this.inFunction('Unit', () => {
        this.indent = '        ';
        const out: string[] = [...this.paramPrelude(ctor)];
        const stmts = [...ctor.body!.statements];
        const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
        if (superAt > 0) throw this.error(stmts[0], 'statements before super() in a constructor');
        const own = paramProps.flatMap((p) => {
          const n = ident((p.name as ts.Identifier).text);
          if (!this.states.nullishHeld(p)) return [`        this.${n} = ${narrowedParams.has(p) ? `(${n} as ${narrowedParams.get(p)})` : n}`];
          const note = notesNull(this.classPlan(cls)?.fieldNulls.get((p.name as ts.Identifier).text)) ? [`        jsNulls = jsNoteNull(jsNulls, ${kotlinString((p.name as ts.Identifier).text)}, ${n}.jsAny)`] : [];
          return [`        this.${n} = ${n}.${this.typeOf(p.name) === 'Any?' ? 'jsAny' : 'optional'}`, ...note];
        });
        const notes = this.keyNotes;
        this.keyNotes = this.initKeyNotes(cls);
        try { out.push(...this.levelStart(cls), ...own, ...this.statements(stmts.slice(superAt + 1))); } finally { this.keyNotes = notes; }
        return out;
      });
      const superCall = superAt(ctor);
      const errorName = isError ? Object.keys(ERRORS).find((k) => ERRORS[k] === base) : undefined;
      const superArgs = !superCall ? [] : errorName ? this.errorArgs(errorName, superCall.arguments) : kitRoot && !appBase && this.core?.superArgs ? this.core.superArgs(kitRoot, superCall, this.args(superCall)) : this.args(superCall);
      const delegation = superCall ? ` : super(${superArgs.join(', ')})` : base ? ' : super()' : '';
      this.indent = '    ';
      lines.push(`    constructor(${this.params(ctor, false)})${delegation} {`, ...body, '    }');
    } else if (base) {
      const level = this.levelStart(cls);
      if (baseCtor) lines.push(`    constructor(${this.params(baseCtor, false)}) : super(${this.readsArguments(baseCtor) ? '__arguments' : baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})${level.length ? ' {' : ''}`, ...(level.length ? [...level, '    }'] : []));
      // `new HttpError(message, { cause })` of a class that declares no constructor: Error's.
      else if (isError && base !== 'JSAggregateError') lines.push('    constructor(message: Any? = null, options: Any? = null) : super(if (message == null) "" else jsToString(message), jsGetOptional(options, "cause"))');
      else lines.push(`    constructor() : super()${level.length ? ' {' : ''}`, ...(level.length ? [...level, '    }'] : []));
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
    const dynAccessors: { name: string; type: string; readable: boolean; settable: boolean; set?: string }[] = [];
    // An app class extending the generated kit's (a page's view model, a custom view): read by name as core reads it (bindings, the Builder).
    const byName = !this.library && ((this.generatedKit && !!kitRoot) || this.appMembersByName);
    // A getter over a base class's field holds the field's Kotlin type: optional where the field is, unwrapped where it is read.
    const overField = (a: { get?: ts.GetAccessorDeclaration }) => (!this.library && a.get && !isStatic(a.get) ? this.redeclaredField(a.get as unknown as ts.PropertyDeclaration) : null);
    for (const a of accessors.values()) {
      const f = overField(a);
      if (!f || !ts.isPropertyDeclaration(f) || f.parent === cls) continue;
      const gsym = this.checker.getSymbolAtLocation(a.get!.name);
      if (gsym && isNullable(this.declaredTypeOf(f.name) ?? '') && !isNullable(this.typeOf(f.name))) this.nullableDecls.add(gsym);
    }
    for (const [n, a] of accessors) {
      let t = a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name));
      // Library mode: an accessor over a base's optional field (`accessibilityServiceEnabled?: boolean`) keeps the field's type.
      const root = this.library && a.get ? this.redeclaredField(a.get as unknown as ts.PropertyDeclaration) : null;
      const rootSym = root && this.checker.getSymbolAtLocation(root.name);
      if (root && ts.isPropertyDeclaration(root) && optionalType(this.typeOf(root.name)) === optionalType(t) && (root.questionToken || (rootSym && this.nullableDecls.has(rootSym)))) t = optionalType(t);
      // `get x(): Narrower { return super.x; }`, a type script asserts and the value need not have (an EditText as a StyleableTextView): the base's.
      const only = a.get?.body?.statements.length === 1 ? a.get.body.statements[0] : undefined;
      const passes = !!only && ts.isReturnStatement(only) && !!only.expression && ts.isPropertyAccessExpression(only.expression) && only.expression.expression.kind === ts.SyntaxKind.SuperKeyword && only.expression.name.text === n;
      if (passes && !a.set && this.native && 'sharedClassType' in this.native) {
        // A subclass redeclaring the member as another Java class (`nativeTextViewProtected: EditText`): the class both extend.
        const redeclared = this.sourceFiles.flatMap((f) => f.isDeclarationFile ? [] : f.statements.filter(ts.isClassDeclaration)).filter((c) => { for (let b = this.baseClassOf(c); b; b = this.baseClassOf(b)) if (b === cls) return true; return false; })
          .flatMap((c) => c.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && m.name.getText() === n && !!m.type));
        if (redeclared.length) {
          const shared = (this.native as unknown as { sharedClassType(parts: ts.Type[]): string | null }).sharedClassType([this.checker.getSignatureFromDeclaration(a.get!)!.getReturnType(), ...redeclared.map((m) => this.checker.getTypeAtLocation(m.name))]);
          if (shared) { t = optionalType(shared); this.widenedAccessors.set(a.get!, t); }
        }
      }
      // App mode: a getter over a base class's field (`get _childrenCount()` for `_childrenCount: number`): the field's Kotlin
      // property, overridden; a write with no setter here changes nothing, as the getter-only accessor on the prototype takes none.
      const baseField = overField(a);
      if (baseField && ts.isPropertyDeclaration(baseField) && baseField.parent !== cls) {
        const ft = this.declaredTypeOf(baseField.name) ?? this.typeOf(baseField.name);
        const body = this.functionBody(a.get!, ft, '        ');
        const setter = a.set ? `        set(${ident((a.set.parameters[0].name as ts.Identifier).text)}) ${this.functionBody(a.set, 'Unit', '        ')}` : '        set(@Suppress("UNUSED_PARAMETER") value) {}';
        lines.push(`    override var ${ident(n)}: ${ft}`, `        get() ${body}`, setter);
        continue;
      }
      const target = a.get && isStatic(a.get) ? statics : lines;
      const pad = a.get && isStatic(a.get) ? '        ' : '    ';
      const parts: string[] = [];
      // `abstract get name(): T`: each subclass's.
      if (a.get && !a.get.body && hasModifier(a.get, ts.SyntaxKind.AbstractKeyword)) { target.push(`${pad}${overridden.has(n) ? 'override ' : ''}abstract ${a.set ? 'var' : 'val'} ${ident(n)}: ${t}`); continue; }
      if (a.get) parts.push(`${pad}    get() ${this.functionBody(a.get, t, pad + '    ')}`);
      else parts.push(`${pad}    get() = null`);
      const takes = a.get && a.set ? this.setterTakes(a.set, t) : null;
      if (a.set && takes) {
        const p = a.set.parameters[0].name;
        let body = this.functionBody(a.set, 'Unit', pad);
        // A destructured parameter is bound from `__p0`, which the body's prelude takes apart.
        if (!ts.isIdentifier(p)) body = body.replace('{\n', `{\n${pad}    val __p0: ${this.typeOf(p)} = ${this.fromAnyCode('__v', this.typeOf(p), true)}\n`);
        target.push(`${pad}${this.setterTakesMods(cls, n, memberOpen)}fun ${setterMethod(n)}(${ts.isIdentifier(p) ? ident(p.text) : '__v'}: ${takes}) ${body}`);
        parts.push(`${pad}    set(__value) { ${setterMethod(n)}(__value) }`);
      } else if (a.set) {
        const p = a.set.parameters[0].name;
        const name = ts.isIdentifier(p) ? ident(p.text) : '__p0';
        const body = this.functionBody(a.set, 'Unit', pad + '    ');
        // The setter's parameter is the declared one: a body assigning it declares a variable of its own.
        parts.push(a.get ? `${pad}    set(${name}) ${body}` : `${pad}    set(__value) {\n${pad}        val ${name} = ${['String', 'Double', 'Boolean'].includes(t.replace(/\?$/, '')) ? this.checkedCast('__value', t.replace(/\?$/, ''), n) : this.asserted('__value')}${body.slice(1)}`);
        // A base's setter method is what writes through its type and by name call: here, this class's setter.
        if (!isStatic(a.set) && this.baseSetterMethod(cls, n)) target.push(`${pad}override fun ${setterMethod(n)}(value: Any?) { this.${ident(n)} = ${t === 'Boolean' ? 'jsTruthy(value)' : t === 'Double' ? 'jsToNumber(value)' : this.fromAnyCode('value', t, true)} }`);
      }
      target.push(`${pad}${a.get && isStatic(a.get) ? '' : n === 'jsToStringTag' ? 'override ' : mods(n)}${a.set ? 'var' : 'val'} ${ident(n)}: ${t}`, ...parts);
      // Library mode: read and set by name as well (`node.cssType` of an untyped node), as the prototype's accessor is.
      const own = (a.get ?? a.set)!;
      if ((this.library || byName || this.readByName.has(cls) || this.states.downcastClass(cls) || this.states.byNameClass(cls)) && !isStatic(own) && !this.symbolMember(own.name)) {
        // A write by name gives the setter what script gave (`style="color: red"` and `color="red"` from the Builder); one
        // passing it to another object's member (`this.style.color = value`) passes it on by name, as that member converts it.
        const forwarded = a.set && !takes ? forwardedSetter(a.set) : null;
        const forward = forwarded && forwarded.expression.kind !== ts.SyntaxKind.ThisKeyword ? forwarded : null;
        const set = takes ? `this.${setterMethod(n)}(${this.fromAnyCode('value', takes, true)})` : forward ? `jsSet(${this.expr(forward.expression)}, ${kotlinString(forward.name.text)}, value)` : undefined;
        dynAccessors.push({ name: n, type: t, readable: !!a.get, settable: !!set || (!!a.set && optionalType(this.typeOf(a.set.parameters[0].name)) === optionalType(t)), set });
      }
    }
    // A view class's type selector: its `@CSSType` name, else its class name, as core's `cssType` falls back to `typeName`.
    // The generated kit is core: without a `@CSSType` of its own, a class takes the nearest one above it, which core's decorator
    // sets on the prototype through `cssType`'s lowercasing setter (a plugin's `MenuButton` is a `button`), else core's `typeName` one.
    const cssType = (ts.getDecorators(cls) ?? []).map((d) => d.expression).find((e): e is ts.CallExpression => ts.isCallExpression(e) && e.expression.getText() === 'CSSType');
    if (isView && this.generatedKit && !cssType) lines.push('    override var cssType: String', '        get() = (JSPrototypes.value(javaClass, "cssType", this) as? String)?.lowercase() ?: super.cssType', '        set(value) { super.cssType = value }');
    if (isView && (!this.generatedKit || cssType)) {
      const typeName = cssType && ts.isStringLiteralLike(cssType.arguments[0]) ? cssType.arguments[0].text : cls.name!.text;
      // The generated kit's `cssType` is core's settable accessor.
      lines.push(this.generatedKit ? `    override var cssType: String\n        get() = ${kotlinString(typeName)}\n        set(@Suppress("UNUSED_PARAMETER") value) {}` : `    override val cssType: String get() = ${kotlinString(typeName)}`);
    }
    const decorators: ts.Decorator[] = [];
    for (const d of ts.getDecorators(cls) ?? []) {
      if (this.library?.identities.has(d.expression.getText().replace(/\(.*$/s, ''))) continue;
      // Library mode: a module-level class's decorators run with the module's statements, on its prototype (`@CSSType`, `@SelectorProperties`).
      if (this.library && this.staticInits && !/^(NativeClass|Injectable)\b/.test(d.expression.getText())) { decorators.push(d); continue; }
      // An NgModule's metadata is Angular's compiler's: a compiled build reads what it declares from the components.
      if (!/^(CSSType|NativeClass|Injectable|NgModule)\b/.test(d.expression.getText())) throw this.error(d, `the class decorator ${d.expression.getText()}`);
    }
    if (decorators.length) {
      this.indent = '    ';
      this.staticInits!.push(`    jsDecorate(${name}::class.java, listOf(${decorators.map((d) => this.coerce(d.expression, 'Any?')).join(', ')}))`);
      this.indent = '    ';
    }
    // Statics script reads by name (`(Registry as any)[key]`), which a companion's members are not to reflection.
    if (this.staticInits && this.states.byNameStatics(cls)) {
      const owner = name.replace(/<.*$/, '');
      const entries = cls.members.flatMap((m): string[] => {
        if (!isStatic(m) || !m.name || !ts.isIdentifier(m.name)) return [];
        const n = m.name.text, ref = `${owner}.${ident(n)}`;
        if (ts.isMethodDeclaration(m)) {
          if (!m.body || m.typeParameters?.length || m.asteriskToken || m.parameters.some((p) => p.dotDotDotToken) || this.readsArguments(m) || cls.members.filter((x) => ts.isMethodDeclaration(x) && x.name.getText() === n).length > 1) return [];
          const call = `${ref}(${m.parameters.map((p, k) => this.fromAnyCode(pure(`__a.getOrNull(${k})`), this.paramType(p), true)).join(', ')})`;
          return [`${kotlinString(n)} to { jsFunction ${lambda(['__a'], this.returnTypeOf(m) === 'Unit' ? `${call}; null` : call)} }`];
        }
        return ts.isPropertyDeclaration(m) || ts.isGetAccessorDeclaration(m) ? [`${kotlinString(n)} to { ${ref} }`] : [];
      });
      if (entries.length) this.staticInits.push(`    JSPrototypes.declareStatics(${owner}::class.java, listOf(${entries.join(', ')}))`);
    }
    // `[fooProperty.setNative](value)`: the class's native setter for that registered property. The generated kit
    // reaches any property's setter by its symbol, core's (`isUserInteractionEnabledProperty`) included.
    const nativeSetter = (x: ts.Expression): string | null => this.library ? null : this.setNativeOf(x) ?? (this.generatedKit && ts.isPropertyAccessExpression(x) && x.name.text === 'setNative' ? x.expression.getText().replace(/\W+/g, '_') : null);
    const setters: { property: string; method: string; param: string; key: ts.Expression }[] = [];
    for (const m of cls.members) {
      if (!ts.isMethodDeclaration(m) || !m.body || !ts.isComputedPropertyName(m.name)) continue;
      const property = nativeSetter(m.name.expression);
      if (!property) {
        if (!this.symbolMember(m.name)) throw this.error(m.name, 'a computed method name');
        continue;
      }
      const method = `__setNative_${property}`;
      setters.push({ property, method, param: m.parameters[0] ? this.typeOf(m.parameters[0].name) : 'Unit', key: m.name.expression });
      lines.push('    ' + this.func(m, method, open ? 'open ' : ''));
    }
    // The generated kit applies a property as core does: through the method its `setNative` symbol names (`jsGet`, below).
    if (setters.length && !this.generatedKit) {
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
    const dynMethods: { name: string; key?: string; params: string[]; ret: string }[] = [];
    if (this.generatedKit) {
      for (const st of setters) dynMethods.push({ name: st.method, key: `(${this.expr(st.key)} as JSSymbol).key`, params: st.param === 'Unit' ? [] : [st.param], ret: 'Unit' });
    }
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && m.body && ts.isComputedPropertyName(m.name) && nativeSetter(m.name.expression)) continue;
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
        const made = async ? 'jsSymbolAsyncIterator()' : 'jsSymbolIterator()';
        const iterator = this.library ? `(${made} ?: jsNoIterator())` : made;
        lines.push(async ? `    override fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol = ${iterator}` : `    override fun jsAnyIterator(): JSIteratorProtocol = ${iterator}`);
        continue;
      }
      if (keyed?.key) {
        // An override of a symbol-named method takes the topmost declaration's Kotlin signature.
        let root = this.library && inherited.has(m.name.getText()) ? this.inheritedMethod(cls, m.name.getText()) : undefined;
        for (let up = root && this.inheritedMethod(root.parent as ts.ClassLikeDeclaration, m.name.getText()); up; up = this.inheritedMethod(up.parent as ts.ClassLikeDeclaration, m.name.getText())) root = up;
        if (root && (root.parameters.length !== m.parameters.length || root.parameters.some((p, k) => this.paramType(p) !== this.paramType(m.parameters[k])) || this.returnTypeOf(root) !== this.returnTypeOf(m))) lines.push(this.appOverride(m, root, keyed.member));
        else {
          if (root) this.takeBaseNames(m, this.paramNames(root));
          lines.push('    ' + this.func(m, keyed.member, this.library ? mods(m.name.getText()) : ''));
        }
        // Called by its symbol with the Kotlin signature it has: the overridden one's.
        const sig = root && root !== m ? root : m;
        if ((this.library || byName) && !sig.parameters.some((p) => p.dotDotDotToken)) dynMethods.push({ name: keyed.member, key: keyed.key, params: sig.parameters.map((p) => this.paramType(p)), ret: this.returnTypeOf(sig) });
        continue;
      }
      if (keyed) throw this.error(m.name, 'a method named by this symbol');
      const n = m.name.getText();
      if (plugin && !this.library && !inherited.has(n) && !(kitRoot && this.core?.kitMember(kitRoot, n)) && !this.isNamed(n)) continue;
      if (isStatic(m)) { this.indent = '        '; statics.push('        ' + this.func(m, ident(n))); this.indent = '    '; continue; }
      if (n === 'toString' && !m.parameters.length) { lines.push('    ' + this.func(m, 'toString', 'override ')); continue; }
      const kit = kitRoot && !inherited.has(n) ? this.core?.kitMember(kitRoot, n) : null;
      if (kit && kit.kind === 'func' && !kit.static) { lines.push(this.kitOverride(m, kit, open)); continue; }
      if (this.nonVirtualEntry(m)) lines.push('    ' + this.func(m, ident(nonVirtualName(n, cls.name!.text))));
      // An override whose parameters TypeScript types more narrowly than the method it overrides: the base's Kotlin signature.
      // The signature Kotlin has is the topmost declaration's: each override in between takes it too.
      let base = inherited.has(n) ? this.inheritedMethod(cls, n) : undefined;
      for (let up = base && this.inheritedMethod(base.parent as ts.ClassLikeDeclaration, n); up; up = this.inheritedMethod(up.parent as ts.ClassLikeDeclaration, n)) base = up;
      // Library mode: an override taking more parameters than the method it overrides (`accessibilityScreenChanged(refocus)`) is an
      // overload of its own, which the overridden signature calls and subclasses taking as many override in turn.
      if (this.library && base && m.parameters.length > base.parameters.length && !m.parameters.some((p) => p.dotDotDotToken) && !this.readsArguments(m)) {
        let wider: ts.MethodDeclaration | undefined;
        for (let up = this.inheritedMethod(cls, n); up && up !== base && !wider; up = this.inheritedMethod(up.parent as ts.ClassLikeDeclaration, n)) if (up.parameters.length === m.parameters.length) wider = up;
        if (wider && !wider.parameters.some((p, k) => this.paramType(p) !== this.paramType(m.parameters[k])) && this.returnTypeOf(wider) === this.returnTypeOf(m)) this.takeBaseNames(m, this.paramNames(wider));
        if (wider) lines.push(wider.parameters.some((p, k) => this.paramType(p) !== this.paramType(m.parameters[k])) || this.returnTypeOf(wider) !== this.returnTypeOf(m) ? this.appOverride(m, wider) : '    ' + this.func(m, this.methodIdent(n), 'override '));
        else lines.push(this.overloadBridge(m, base), '    ' + this.func(m, this.methodIdent(n), 'open '));
        continue;
      }
      const args = base ? this.baseTypeArgs(cls, base.parent as ts.ClassLikeDeclaration) : new Map<string, string>();
      if (base && (base.parameters.length !== m.parameters.length || base.parameters.some((p, k) => substituteTypes(this.paramType(p), args) !== this.paramType(m.parameters[k])) || substituteTypes(this.returnTypeOf(base), args) !== this.returnTypeOf(m))) {
        lines.push(this.appOverride(m, base));
        continue;
      }
      // `equals(value)`: Kotlin's own `equals`, which it overrides.
      const kotlinEquals = this.library && n === 'equals' && m.parameters.length === 1 && this.paramType(m.parameters[0]) === 'Any?' && this.returnTypeOf(m) === 'Boolean';
      if (kotlinEquals) this.takeBaseNames(m, ['other']);
      else if (base) this.takeBaseNames(m, this.paramNames(base));
      lines.push('    ' + this.func(m, this.methodIdent(n), (this.erasedSignatureMethods.has(m) ? `@JvmName("${n}__typed") ` : '') + (kotlinEquals ? 'override ' : mods(n))));
      // A plugin's objects are read untyped too (`handler.attachToView(view)` on an `any`): their methods by name.
      if (plugin && !m.parameters.some((p) => p.dotDotDotToken)) dynMethods.push({ name: n, params: m.parameters.map((p) => this.paramType(p)), ret: this.returnTypeOf(m) });
    }
    if (isView && !this.generatedKit) {
      const own = fields.map((f) => f.name);
      if (own.length) lines.push(`    override fun hasJSProperty(name: String): Boolean = name in setOf(${own.map(kotlinString).join(', ')}) || super.hasJSProperty(name)`);
    }
    const protocol = this.iteratorProtocol(cls.members.filter((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && !isStatic(m) && ['next', 'return', 'throw'].includes(m.name.getText())).map((m) => ({
      name: m.name.getText(), params: m.parameters.length, ret: this.returnTypeOf(m), param: m.parameters[0] ? this.paramType(m.parameters[0]) : undefined,
    })));
    if (protocol && !appBase) { supertypes.push(protocol.conformance); lines.push(...protocol.lines); }
    lines.push(...witnesses);
    if (expando) lines.push('    override var jsExpando: JSObject? = null');
    if (ownValueOf) lines.push(`    override fun jsValueOf(): Any? = jsBox(this.${this.methodIdent('valueOf')}())`);
    if (toJSON) lines.push(`    override fun jsToJSON(key: String): Any? = jsBox(this.${this.methodIdent('toJSON')}(${toJSON.parameters.length ? 'key' : ''}))`);
    // Library mode: every method of the class is read by name as well (`font.getAndroidTypeface()` on an untyped font), overrides included.
    if (this.library || byName || this.readByName.has(cls) || this.states.downcastClass(cls) || this.states.byNameClass(cls)) {
      for (const m of cls.members) {
        if (!ts.isMethodDeclaration(m) || !m.body || isStatic(m) || ts.isComputedPropertyName(m.name) || m.parameters.some((p) => p.dotDotDotToken) || this.readsArguments(m)) continue;
        const n = m.name.getText();
        if (dynMethods.some((d) => d.name === n && !d.key) || n === 'toString' || n === 'equals') continue;
        // A plugin's method nothing names is not compiled; one overriding the kit's is read through the kit's own table.
        if (plugin && !this.library && !inherited.has(n) && !(kitRoot && this.core?.kitMember(kitRoot, n)) && !this.isNamed(n)) continue;
        if (!this.library && kitRoot && this.core?.kitMember(kitRoot, n)) continue;
        let root: ts.MethodDeclaration = m;
        for (let up = this.inheritedMethod(cls, n); up; up = this.inheritedMethod(up.parent as ts.ClassLikeDeclaration, n)) root = up;
        if (root.parameters.length !== m.parameters.length) continue;
        dynMethods.push({ name: n, params: root.parameters.map((p) => this.paramType(p)), ret: this.returnTypeOf(root) });
      }
    }
    const plan = this.classPlan(cls), nulls = isError ? new Set<string>() : nullNames(plan, notesNull);
    if (!isError && plan?.declaresNulls) {
      const initial = cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && nulls.has(m.name.getText()) && initializedNull(m));
      lines.push(`    var jsNulls: MutableSet<String>? = ${initial.length ? `mutableSetOf(${initial.map((m) => kotlinString(m.name.getText())).join(', ')})` : 'null'}`);
    }
    const definable = isError ? [] : this.definableNames(cls).filter((n) => fields.some((f) => f.name === n));
    if (!isError) {
      const keys: MemberKeys = { nulls: plan?.fieldNulls, keyed: keyedInfo, defined: new Set(definable), expando, expandoAbove: !!appBase && rootKeepsExpando(cls, this.states, this.shapeFacts()) };
      lines.push(...this.dynamicMembers(keys, { fields, className: this.scriptClassName(cls) ?? name, inherits: !!appBase || !!kitRoot, symbols: symbolFields, methods: dynMethods, accessors: dynAccessors, superclass: base?.replace(/<.*$/, ''), receiver: this.states.byNameClass(cls) ? name.replace(/<.*$/, '') : undefined }));
    }
    // An error's own fields by name, after JSError's `name`/`message`/`stack`; what script adds to it comes after the fields, and it prints as an error, not as `Name { … }`.
    else lines.push(...this.dynamicMembers({}, { fields, className: name, inherits: true, symbols: symbolFields, methods: dynMethods, accessors: dynAccessors, superclass: base!.replace(/<.*$/, '') })
      .filter((l) => !l.startsWith('    override val jsClassName'))
      .map((l) => (l.startsWith('    override val jsKeys') && l.includes('super.jsKeys + ') ? l.replace('super.jsKeys + ', '') + ' + super.jsKeys' : l)));
    if (definable.length) {
      let inherited = false;
      for (let b = this.baseClassOf(cls); b && !inherited; b = this.baseClassOf(b)) inherited = this.definableNames(b).length > 0;
      if (!inherited) supertypes.push('JSDefinable');
      lines.push(...(inherited ? [] : ['    override var jsDefined: JSObject? = null']), `    override fun jsDefinable(key: String): Boolean = when (key) { ${definable.map(kotlinString).join(', ')} -> true; else -> ${inherited ? 'super.jsDefinable(key)' : 'false'} }`);
    }
    if (symbolFields.length) supertypes.push('JSSymbolKeyed');
    // A merged namespace's enums and classes are the class's nested ones (`TemplateParser.State`), its values the companion's.
    const nestedType = (l: string) => /^(?:(?:open|abstract|enum|data)\s+)*(?:class|interface|object)\s/.test(l);
    lines.push(...this.mergedStatics.filter(nestedType).map((l) => l.split('\n').map((x) => (x ? '    ' + x : x)).join('\n')));
    statics.push(...this.mergedStatics.filter((l) => !nestedType(l)).map((l) => l.split('\n').map((x) => (x ? '        ' + x : x)).join('\n')));
    this.mergedStatics = [];
    if (this.isBasedService(cls)) {
      const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
      const made = `${ident(name)}(${(ctor?.parameters ?? []).map((p) => this.parameterInject(p)).join(', ')})`;
      statics.push(`        val shared: ${ident(name)} get() = AppInjector.service(${ident(name)}::class.java) { ${made} }`);
    }
    if (statics.length) lines.push('    companion object {', ...statics, '    }');
    this.indent = '';
    const scriptName = this.scriptClassName(cls);
    const head = `${scriptName ? `@JSClassName(${kotlinString(scriptName)}) ` : ''}${abstract ? 'abstract ' : open ? 'open ' : ''}class ${ident(name)}${this.generics(cls)}`;
    const supers = [...(base ? [base] : []), ...supertypes];
    return [`${head}${supers.length ? ` : ${supers.join(', ')}` : ''} {`, ...lines, '}'].join('\n');
  }

  /**
   * A class or object with `next` (and `return`, `throw`) is an iterator
   * script wrote: the kit steps it through these, async when `next` returns a promise.
   */
  private iteratorProtocol(methods: { name: string; params: number; ret: string; param?: string }[]): { conformance: string; lines: string[] } | null {
    const next = methods.find((m) => m.name === 'next');
    if (!next || next.params > 1) return null;
    const call = (m: { name: string; params: number; param?: string }, arg: string) => `this.${ident(m.name)}(${m.params ? (m.param && m.param !== 'Any?' ? this.fromAnyCode(arg, m.param, true) : arg) : ''})`;
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
    if (ts.isIdentifier(e) && this.typeOf(e) === 'JSSymbol') return { member: `__symbol_${e.text}`, key: this.symbolKey(this.expr(e)) };
    // `[fooProperty.setNative]`: core's property system finds the method by its symbol (an app's class too, on the generated kit).
    if ((this.library || this.generatedKit) && this.typeOf(e) === 'JSSymbol') return { member: `__symbol_${e.getText().replace(/\W+/g, '_')}`, key: this.symbolKey(this.expr(e)) };
    return null;
  }

  private subclassFieldNames: Map<ts.Node, Set<string>> | null = null;

  private earlyFields = new Map<ts.PropertyDeclaration, boolean>();
  /**
   * An app class's string, number or boolean field with an initializer, in a class whose base class runs a method or getter
   * the class declares (`this.kind()`) from its constructor or a field initializer: that code runs before the field is set,
   * and reads it as undefined. It is held nullable beside the field (`earlyBacking`), which reads it as its type does undefined.
   */
  earlyField(m: ts.PropertyDeclaration): boolean {
    let found = this.earlyFields.get(m);
    if (found !== undefined) return found;
    const cls = m.parent;
    found = !this.library && ts.isClassLike(cls) && !isStatic(m) && !!m.initializer && !hasModifier(m, ts.SyntaxKind.DeclareKeyword) && ts.isIdentifier(m.name)
      && !this.pluginFiles.has(m.getSourceFile().fileName) && ['String', 'Double', 'Boolean'].includes(this.typeOf(m.name)) && !this.properties?.isRegistered(cls, m.name.text) && !ts.getDecorators(m)?.length && this.readsFieldsEarly(cls);
    this.earlyFields.set(m, found);
    return found;
  }

  private readsFieldsEarly(cls: ts.ClassLikeDeclaration): boolean {
    const own = new Set(cls.members.filter((m) => (ts.isMethodDeclaration(m) || ts.isGetAccessorDeclaration(m)) && !isStatic(m) && m.name && ts.isIdentifier(m.name)).map((m) => (m.name as ts.Identifier).text));
    if (!own.size) return false;
    const baseOf = (c: ts.ClassLikeDeclaration) => {
      const h = c.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    };
    let found = false;
    const visit = (n: ts.Node): void => {
      if (found || (ts.isFunctionLike(n) && !ts.isArrowFunction(n)) || ts.isClassLike(n)) return;
      if (ts.isPropertyAccessExpression(n) && n.expression.kind === ts.SyntaxKind.ThisKeyword && own.has(n.name.text)) found = true;
      ts.forEachChild(n, visit);
    };
    for (let up = baseOf(cls); up && !found; up = baseOf(up)) {
      for (const m of up.members) {
        if (ts.isConstructorDeclaration(m) && m.body) ts.forEachChild(m.body, visit);
        else if (ts.isPropertyDeclaration(m) && !isStatic(m) && m.initializer) visit(m.initializer);
      }
    }
    return found;
  }

  /** The fields some subclass of `cls` (in the program) declares again. */
  /** A method no base or subclass declares a member of its name for, so its return type is its own to choose. */
  private onlyMethodOfName(fn: ts.Node): boolean {
    if (!ts.isMethodDeclaration(fn) || !ts.isIdentifier(fn.name) || !ts.isClassLike(fn.parent)) return false;
    const name = fn.name.text, cls = fn.parent;
    const declares = (c: ts.ClassLikeDeclaration) => c.members.some((m) => m !== fn && m.name?.getText() === name);
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) if (declares(b)) return false;
    if (cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword) && !this.baseClassOf(cls)) return false;
    if (!this.subclassMethodNames) {
      const map = new Map<ts.Node, Set<string>>();
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          const names = n.members.map((m) => m.name?.getText()).filter((x): x is string => !!x);
          for (let b = this.baseClassOf(n); b; b = this.baseClassOf(b)) map.set(b, new Set([...(map.get(b) ?? []), ...names]));
        }
        ts.forEachChild(n, visit);
      };
      for (const sf of this.sourceFiles) visit(sf);
      this.subclassMethodNames = map;
    }
    return !this.subclassMethodNames.get(cls)?.has(name);
  }
  private subclassMethodNames: Map<ts.Node, Set<string>> | null = null;

  private subclassFields(cls: ts.ClassLikeDeclaration): Set<string> {
    if (!this.subclassFieldNames) {
      const map = new Map<ts.Node, Set<string>>();
      for (const sf of this.sourceFiles) {
        const visit = (n: ts.Node) => {
          if (ts.isClassLike(n)) {
            // A subclass's field or accessor of the name overrides the base's.
            const names = n.members.filter((m) => ts.isPropertyDeclaration(m) || ts.isAccessor(m)).map((m) => m.name!.getText());
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

  /** A constructor's statements before its `super(…)` when none reads `this`, the call, and what follows it. */
  private statementsBeforeSuper(ctor: ts.ConstructorDeclaration): { pre: ts.Statement[]; superCall: ts.CallExpression; rest: ts.Statement[] } | null {
    const stmts = [...(ctor.body?.statements ?? [])];
    const at = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
    if (at <= 0) return null;
    const pre = stmts.slice(0, at);
    const readsThis = (n: ts.Node): boolean => n.kind === ts.SyntaxKind.ThisKeyword || n.kind === ts.SyntaxKind.SuperKeyword || (!ts.isFunctionLike(n) && !!ts.forEachChild(n, readsThis));
    if (pre.some(readsThis)) return null;
    return { pre, superCall: (stmts[at] as ts.ExpressionStatement).expression as ts.CallExpression, rest: stmts.slice(at + 1) };
  }

  /** A parameter's Kotlin type as `params` declares it. */
  /**
   * Library mode: a parameter typed as a class whose body tests what it holds (`typeof value === 'number'`,
   * `value instanceof Color`), as callers pass other values: untyped, each tested read as what the test proves.
   */
  typeTested(p: ts.ParameterDeclaration): boolean {
    if (!this.library || !ts.isIdentifier(p.name) || p.getSourceFile().isDeclarationFile) return false;
    const known = this.typeTestedParams.get(p);
    if (known !== undefined) return known;
    const fn = p.parent as ts.FunctionLikeDeclaration;
    let result = false;
    if (fn.body && this.isObjectType(this.type(this.checker.getTypeAtLocation(p.name), p))) {
      const sym = this.checker.getSymbolAtLocation(p.name);
      const tested = (x: ts.Expression) => ts.isIdentifier(x) && this.checker.getSymbolAtLocation(x) === sym;
      const visit = (n: ts.Node): boolean => (ts.isTypeOfExpression(n) && tested(n.expression)) || (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && tested(n.left)) || !!ts.forEachChild(n, visit);
      result = visit(fn.body);
    }
    // A callback's number, string or boolean it only passes on (`scale: (value: number) => ({ property: 'scale', value })`),
    // which callers may give any value: untyped, as script holds it.
    if (!result && fn.body && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ['Double', 'String', 'Boolean'].includes(this.typeOf(p.name))) {
      const sym = this.checker.getSymbolAtLocation(p.name);
      let refs = 0;
      const passed = (n: ts.Identifier): boolean => {
        const at = n.parent;
        return (ts.isPropertyAssignment(at) && at.initializer === n) || ts.isShorthandPropertyAssignment(at) || ((ts.isCallExpression(at) || ts.isNewExpression(at)) && at.expression !== n) || ts.isReturnStatement(at) || (ts.isArrowFunction(at) && at.body === n);
      };
      const all = (n: ts.Node): boolean => {
        const refSym = ts.isIdentifier(n) && n !== p.name ? (ts.isShorthandPropertyAssignment(n.parent) ? this.checker.getShorthandAssignmentValueSymbol(n.parent) : this.checker.getSymbolAtLocation(n)) : undefined;
        if (refSym && refSym === sym) { refs++; return passed(n as ts.Identifier); }
        return !ts.forEachChild(n, (c) => (all(c) ? undefined : true));
      };
      result = all(fn.body) && refs > 0;
      if (result) this.passedParams.add(p);
    }
    this.typeTestedParams.set(p, result);
    return result;
  }
  private typeTestedParams = new Map<ts.ParameterDeclaration, boolean>();
  /** Parameters `typeTested` holds untyped because the body only passes them on: read untyped too. */
  private passedParams = new Set<ts.ParameterDeclaration>();
  /** Library mode: getters typed as the Java class every override's value has, wider than script declares them. */
  widenedAccessors = new Map<ts.Node, string>();
  private widenedParams = new Map<ts.Node, { base: ts.Type; own: string }>();
  /** The thread each module's code runs on (threading.ts): a `ui` module's classes and functions are main-thread only. */
  moduleThread: ((file: string) => ModuleThread | undefined) | null = null;

  /** The thread annotation before a declaration of a classified module (`@UiThread `, `@AnyThread `), which Android lint checks callers against, or ''. */
  threadAnnotation(n: ts.Node): string {
    const thread = this.moduleThread?.(n.getSourceFile().fileName);
    return thread === 'ui' ? '@UiThread ' : thread === 'any' ? '@AnyThread ' : '';
  }

  /** The `@Suppress` keys each declaration being translated needs for the Android APIs it uses, innermost last. */
  private suppressionScopes: Set<string>[] = [];

  /** A use of a deprecated Android API (`android/view/View#setSystemUiVisibility`, or a class), suppressed where core may use it. */
  noteDeprecated(api: string): void {
    if (allowedDeprecation(api)) this.suppressionScopes.at(-1)?.add('DEPRECATION');
  }

  /** A call of an Android API (`class#member`): one lint restricts to worker threads is suppressed where core may call it. */
  noteThreadRestricted(api: string): void {
    if (calledOnAnyThread(api)) this.suppressionScopes.at(-1)?.add('WrongThread');
  }

  /**
   * A declaration's code, marked `@Suppress("DEPRECATION")` where it uses an allowed deprecated API, and
   * `@Suppress("WrongThread")` where it calls an allowed worker-thread API. `numbering`: a function, whose temporaries
   * are numbered apart from any other top-level one's.
   */
  suppressingDeprecations(make: () => string, numbering = true): string {
    const scope = new Set<string>();
    this.suppressionScopes.push(scope);
    if (numbering && this.declarationDepth === 0) this.temporaries.clear();
    if (numbering) this.declarationDepth++;
    let code: string;
    try { code = make(); } finally { this.suppressionScopes.pop(); if (numbering) this.declarationDepth--; }
    if (!scope.size) return code;
    const keys = [...scope].sort().map((k) => `"${k}"`).join(', ');
    // One @Suppress per declaration: joined with one the code starts with.
    return /^\s*@Suppress\(/.test(code) ? code.replace(/^(\s*)@Suppress\(/, `$1@Suppress(${keys}, `) : code.replace(/^(\s*)/, `$1@Suppress(${keys}) `);
  }

  /** Parameters an override takes under the overridden method's names (Kotlin's, for named arguments), each to that name. */
  private baseParamNames = new Map<ts.ParameterDeclaration, string>();

  /**
   * An override's Kotlin parameter names: the overridden method's (Kotlin's, for named arguments), or `fallback` where
   * that name would hide another the body reads, or another parameter's.
   */
  private signatureNames(m: ts.FunctionLikeDeclaration | ts.Expression, names: (string | null)[], fallback: (k: number) => string): string[] {
    const own = ts.isFunctionLike(m) ? m.parameters.map((p) => (ts.isIdentifier(p.name) ? p.name.text : null)) : [];
    const named = new Set<string>();
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n) && !(ts.isPropertyAccessExpression(n.parent) && n.parent.name === n) && !(ts.isPropertyAssignment(n.parent) && n.parent.name === n)) named.add(n.text);
      ts.forEachChild(n, visit);
    };
    const body = ts.isFunctionLike(m) ? (m as ts.FunctionLikeDeclaration).body : m;
    if (body) visit(body);
    return names.map((n, k) => (n && (own[k] === n || (!named.has(n) && !own.includes(n))) ? ident(n) : fallback(k)));
  }

  /** An override's parameters under the overridden method's `names` where its own differ: the body binds its own to them. */
  private takeBaseNames(m: ts.FunctionLikeDeclaration, names: (string | null)[]): void {
    if (m.parameters.some((p) => isThisParameter(p) || p.dotDotDotToken) || this.readsArguments(m)) return;
    const own = m.parameters.map((p, k) => (ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`));
    const sig = this.signatureNames(m, names.slice(0, own.length), (k) => own[k]);
    sig.forEach((n, k) => { if (n !== own[k]) this.baseParamNames.set(m.parameters[k], n); });
  }

  /** A method's parameter names, null for a destructured one. */
  private paramNames(m: ts.SignatureDeclaration): (string | null)[] {
    return m.parameters.map((p) => (ts.isIdentifier(p.name) ? p.name.text : null));
  }


  /**
   * A setter taking values its getter's type can't hold (`set tint(value: Color | string)`, or core's `set style(value: Style)`
   * testing for a CSS string): the type its parameter holds, else null. Its body is then a method of its own, which writes reach.
   */
  setterTakes(set: ts.SetAccessorDeclaration, t: string): string | null {
    const p = set.parameters[0];
    if (!p || !set.body || optionalType(t) === 'Any?') return null;
    // A destructured parameter takes apart whatever object it is given (`set offset({ x, y })` beside `get offset(): Point`).
    if (!ts.isIdentifier(p.name)) return optionalType(this.typeOf(p.name)) !== optionalType(t) ? 'Any?' : null;
    return this.paramType(p) === 'Any?' ? 'Any?' : null;
  }

  /** A write to an accessor of the program's whose setter takes more than its getter gives: what the setter takes. */
  private setterTakesAt(left: ts.PropertyAccessExpression): string | null {
    const decls = this.checker.getSymbolAtLocation(left.name)?.declarations ?? [];
    const set = decls.find((d): d is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(d) && !d.getSourceFile().isDeclarationFile && !isStatic(d));
    const get = decls.find((d): d is ts.GetAccessorDeclaration => ts.isGetAccessorDeclaration(d) && d.parent === set?.parent);
    return set && get && !(get.body === undefined && hasModifier(get, ts.SyntaxKind.AbstractKeyword)) ? this.setterTakes(set, this.returnTypeOf(get)) : null;
  }

  /** The modifiers of a class's setter method (`setterTakes`): an override of the one a base class declares for the same accessor. */
  private setterTakesMods(cls: ts.ClassLikeDeclaration, n: string, open: string): string {
    const own = cls.members.find((m): m is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(m) && m.name.getText() === n);
    if (own && isStatic(own)) return '';
    return this.baseSetterMethod(cls, n) ? 'override ' : open;
  }

  /** Whether a base class of `cls` declares `setterMethod(n)` (`setterTakes`): the program's, or the generated kit's. */
  private baseSetterMethod(cls: ts.ClassLikeDeclaration, n: string): boolean {
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) {
      const set = b.members.find((m): m is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(m) && m.name.getText() === n && !isStatic(m));
      const get = b.members.find((m): m is ts.GetAccessorDeclaration => ts.isGetAccessorDeclaration(m) && m.name.getText() === n && !isStatic(m));
      if (set && get?.body && this.setterTakes(set, this.returnTypeOf(get))) return true;
    }
    const kitRoot = !this.library && this.generatedKit ? this.kitRootOf(cls) : null;
    return !!kitRoot && !!this.core?.kitMember(kitRoot, setterMethod(n));
  }

  /** An interface method's parameter as the interface spells it: optional where it is, or where its group's form widens it. */
  private requirementParamType(p: ts.ParameterDeclaration): string {
    return p.questionToken || this.states.widened(p) ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name);
  }

  paramType(p: ts.ParameterDeclaration): string {
    if (this.typeTested(p)) return 'Any?';
    const t = this.typeOf(p.name);
    if (this.states.nullishHeld(p)) return nullishType(t);
    if (p.questionToken || (p.initializer && !this.templateParams)) return this.constantDefault(p) ? t : optionalType(t);
    return this.states.mayBeNull(p) ? optionalType(t) : t;
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
  /** App mode on the generated kit: a field declared without a value under the name of a property the kit class it extends has. */
  private kitRedeclared(d: ts.Node | undefined): d is ts.PropertyDeclaration {
    if (!this.generatedKit || !d || !ts.isPropertyDeclaration(d) || d.initializer || isStatic(d) || !ts.isIdentifier(d.name) || !ts.isClassLike(d.parent) || d.getSourceFile().isDeclarationFile) return false;
    const root = this.kitRootOf(d.parent);
    return !!root && this.core?.kitMember(root, d.name.text)?.kind === 'var';
  }

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

  /** `<A, B>` for a program class's type `t` with the type arguments its declaration takes; a plugin's generic class is untyped in them. */
  private declaredTypeArguments(t: ts.Type, decl: ts.Declaration, where?: ts.Node): string {
    if (!ts.isClassDeclaration(decl) || decl.getSourceFile().isDeclarationFile || this.pluginFiles.has(decl.getSourceFile().fileName)) return '';
    const declared = decl.typeParameters?.length ?? 0;
    return declared ? `<${this.checker.getTypeArguments(t as ts.TypeReference).slice(0, declared).map((a) => this.type(a, where)).join(', ')}>` : '';
  }

  /** An app class's name as script knows it, where its Kotlin name is another (it took its module's): null where they are one. */
  private scriptClassName(cls: ts.ClassLikeDeclaration): string | null {
    const renamed = this.library || !cls.name ? undefined : this.topNames().get(cls);
    return renamed && !renamed.includes('.') ? cls.name!.text : null;
  }

  /** The Kotlin name of a class the program declares. */
  private className(decl: ts.ClassLikeDeclaration): string {
    return decl.name ? this.topName(decl, decl.name.text).split('.').map(ident).join('.') : 'AnonymousClass';
  }

  /** `fooProperty.setNative`: the registered name of the property it belongs to. */
  /**
   * A class extending Array or Set that adds no instance state (`class TouchList extends Array { static empty() … }`):
   * its instances are the kit's collection, its static members an object of its name.
   */
  collectionAlias(decl: ts.Node | undefined): string | null {
    if (!decl || !ts.isClassDeclaration(decl) || decl.getSourceFile().isDeclarationFile) return null;
    const heritage = decl.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (!heritage || !ts.isIdentifier(heritage.expression) || !['Array', 'Set'].includes(heritage.expression.text) || !this.isLibGlobal(heritage.expression)) return null;
    // Instance methods are extensions of the collection; a getter it has already (`length`) is its own.
    const instance = decl.members.filter((m) => !isStatic(m) && !(m.name && ts.isComputedPropertyName(m.name) && /Symbol\.toStringTag/.test(m.name.getText())) && !ts.isMethodDeclaration(m) && !(ts.isGetAccessorDeclaration(m) && ['length', 'size'].includes(m.name.getText())));
    if (instance.length) return null;
    const arg = heritage.typeArguments?.[0];
    const el = arg ? this.type(this.checker.getTypeFromTypeNode(arg), arg) : 'Any?';
    return heritage.expression.text === 'Array' ? `JSArray<${el}>` : `JSSet<${el}>`;
  }

  /** `global` or `globalThis` as declarations give them: the program's global object. */
  private isGlobalObject(e: ts.Expression): boolean {
    while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e)) e = e.expression;
    return ts.isIdentifier(e) && (e.text === 'global' || e.text === 'globalThis') && (this.resolve(e)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile);
  }

  /** Whether the app is built on the kit compiled from core, whose classes are core's own. */
  get generatedKit(): boolean {
    return !this.library && !!(this.core as { generated?: boolean } | null)?.generated;
  }

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
    return this.suppressingDeprecations(() => this.kitOverrideCode(m, kit, open));
  }

  private kitOverrideCode(m: ts.MethodDeclaration, kit: { type: string; params?: string }, open: boolean): string {
    const kitParams = (kit.params ?? '').trim() ? splitTopLevel(kit.params!) : [];
    const parsed = kitParams.map((p, k) => {
      const colon = p.indexOf(':');
      const type = withoutDefault(p.slice(colon + 1)).trim();
      return { name: p.slice(0, colon).trim().replace(/^`|`$/g, ''), type };
    });
    const sig = this.signatureNames(m, parsed.map((p) => p.name), (k) => `__k${k}`);
    const tsRet = this.returnTypeOf(m);
    const ret = kit.type.trim();
    const binds = m.parameters.map((p, k) => {
      const tsType = this.typeOf(p.name);
      const value = parsed[k] ? this.convert(sig[k], parsed[k].type, tsType) : (this.zero(tsType) ?? 'null');
      return ts.isIdentifier(p.name) && !(value === ident(p.name.text) && tsType === parsed[k]?.type) ? `        val ${ident(p.name.text)}: ${tsType} = ${value}` : '';
    }).filter(Boolean);
    const body = this.inFunction(tsRet, () => this.functionBody(m, tsRet, '        '));
    const call = `(fun(): ${tsRet} ${body})()`;
    const result = ret === 'Unit'
      ? `        jsReport { ${call} }`
      : `        val __result: ${tsRet} = ${call}\n        return ${this.convert('__result', tsRet, ret)}`;
    return [`    override fun ${ident(m.name.getText())}(${parsed.map((p, k) => `${sig[k]}: ${p.type}`).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} {`, ...binds, result, '    }'].join('\n');
  }

  /** Kotlin code of type `from` where Kotlin needs `to`. */
  convert(code: string, from: string, to: string): string {
    if (from === to || to === 'Any?') return code;
    // A function of other parameter or result types (`(EventData) -> Unit` where `(Any?) -> Unit` is declared): adapted, each value converted.
    const f = isFunctionType(from) ? functionTypeParts(from) : null, g = isFunctionType(to) ? functionTypeParts(to) : null;
    if (this.library && f && g && f.params.length === g.params.length) {
      const names = g.params.map((_, k) => pure(`__c${k}`));
      const call = `__f(${f.params.map((p, k) => this.convert(names[k], g.params[k], p)).join(', ')})`;
      const result = g.ret !== 'Unit' ? this.convert(call, f.ret, g.ret) : f.ret === 'Unit' ? call : `${call}; Unit`;
      return `${code}.let { __f -> { ${g.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${result} } }`;
    }
    if (from === 'Any?') return this.fromAny(code, to);
    if (to === optionalType(from)) return code;
    // An array of one element type where another is declared (`string[]` given as `any[]`): the same array, as script shares it.
    if (/^JSArray<.*>$/.test(from.replace(/\?$/, '')) && /^JSArray<.*>$/.test(to.replace(/\?$/, '')) && from.replace(/\?$/, '') !== to.replace(/\?$/, '')) return this.unchecked(to, code);
    // A tuple where an array is declared: its elements.
    const tuple = /^(Pair|Triple)<.*>$/.exec(from), array = /^JSArray<(.*)>\??$/.exec(to);
    if (tuple && array) return `${code}.let { __t -> jsArrayOf<${array[1]}>(${(tuple[1] === 'Triple' ? ['first', 'second', 'third'] : ['first', 'second']).map((m) => `__t.${m}`).join(', ')}) }`;
    if (from === optionalType(to)) return this.asserted(code);
    const numeric = /^(Int|Long|Float|Short|Byte)\??$/.exec(from);
    if (numeric && to.startsWith('Double')) return from.endsWith('?') ? `${code}?.toDouble()` : `${code}.toDouble()`;
    // One object shape where another is declared (a wider shape an override returns): not a subclass, read by its keys.
    const shape = to.replace(/\?$/, '');
    if (from.replace(/\?$/, '') !== shape && (this.interfaces.has(shape) || [...this.shapes.values()].some((s) => s.name === shape))) return this.fromAny(code, to);
    if (this.isObjectType(from) && this.isObjectType(to) && from.replace(/\?$/, '') !== to.replace(/\?$/, '')) return this.classCast(code, from, to);
    return code;
  }

  /** A field of this name the program's class declares on a type or a type it extends (an interface's method may stand for it). */
  private fieldIn(t: ts.Type, name: string, seen = new Set<ts.Type>()): ts.PropertyDeclaration | undefined {
    if (seen.has(t)) return undefined;
    seen.add(t);
    const own = t.getProperty(name)?.declarations?.find((d): d is ts.PropertyDeclaration => ts.isPropertyDeclaration(d) && !d.getSourceFile().isDeclarationFile);
    if (own) return own;
    const target = (t as ts.TypeReference).target ?? t;
    for (const b of target.isClassOrInterface() ? this.checker.getBaseTypes(target as ts.InterfaceType) : []) {
      const found = this.fieldIn(b, name, seen);
      if (found) return found;
    }
    return undefined;
  }

  /** The field of this name the compiled class of a type core's declarations describe (by its name) or one it extends declares. */
  private compiledField(t: ts.Type, name: string): ts.PropertyDeclaration | undefined {
    const cls = this.compiledClasses().get(t.getSymbol()?.name ?? '');
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; b = this.baseClassOf(b)) {
      const m = b.members.find((x): x is ts.PropertyDeclaration => ts.isPropertyDeclaration(x) && x.name.getText() === name);
      if (m) return m;
    }
    return undefined;
  }
  /**
   * Library mode: a name imported from a module a compiled app has no use for (an npm package, the debugger): the kit's
   * counterpart where it has one, else undefined.
   */
  private mootImport(e: ts.Identifier): string | null {
    if (!this.library) return null;
    const decl = this.checker.getSymbolAtLocation(e)?.declarations?.[0];
    const imported = decl && ts.findAncestor(decl, ts.isImportDeclaration);
    const module = imported && this.checker.getSymbolAtLocation(imported.moduleSpecifier)?.valueDeclaration;
    const file = module?.getSourceFile().fileName;
    if (!decl || !file?.startsWith('/__moot__/')) return null;
    const name = ts.isImportSpecifier(decl) ? (decl.propertyName ?? decl.name).text : ts.isNamespaceImport(decl) ? '*' : 'default';
    return this.library.counterpart(file, name) ?? 'null';
  }

  /** Whether a compiled class or one it extends declares a member of this name. */
  private compiledMember(cls: ts.ClassLikeDeclaration, name: string): boolean {
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; b = this.baseClassOf(b)) if (b.members.some((m) => m.name?.getText() === name) || this.prototypeKeys().data.has(name) || this.prototypeKeys().accessors.has(name)) return true;
    return false;
  }
  private compiledByName: Map<string, ts.ClassDeclaration> | null = null;
  private compiledClasses(): Map<string, ts.ClassDeclaration> {
    if (this.compiledByName) return this.compiledByName;
    this.compiledByName = new Map();
    for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) for (const st of sf.statements) if (ts.isClassDeclaration(st) && st.name && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) this.compiledByName.set(st.name.text, st);
    return this.compiledByName;
  }

  /** The topmost declaration a method overrides in the program's base classes, or the method itself. */
  private rootMethod(m: ts.MethodDeclaration): ts.MethodDeclaration {
    if (!ts.isClassLike(m.parent)) return m;
    let root = m;
    for (let up = this.inheritedMethod(m.parent, m.name.getText()); up; up = this.inheritedMethod(up.parent as ts.ClassLikeDeclaration, m.name.getText())) root = up;
    return root;
  }

  private clashNames: Set<string> | null = null;
  /**
   * Library mode: a method's Kotlin name. One named as a property's JVM accessor (`setNativeView` beside `nativeView`,
   * `setAutoSystemAppearanceChanged`) clashes with it on the JVM, and takes a suffix wherever it is declared or called.
   */
  methodIdent(name: string): string {
    if (!this.library) return ident(name);
    if (!this.clashNames) {
      const props = new Set<string>();
      const methods: string[] = [];
      for (const sf of this.sourceFiles) {
        if (sf.isDeclarationFile) continue;
        const visit = (n: ts.Node): void => {
          if (ts.isClassLike(n)) {
            for (const m of n.members) {
              if (!m.name || !ts.isIdentifier(m.name) || isStatic(m)) continue;
              if (ts.isPropertyDeclaration(m) || ts.isAccessor(m)) props.add(m.name.text);
              else if (ts.isMethodDeclaration(m)) methods.push(m.name.text);
              else if (ts.isConstructorDeclaration(m)) for (const p of m.parameters) if (ts.isIdentifier(p.name) && ts.getModifiers(p)?.length) props.add(p.name.text);
            }
          }
          ts.forEachChild(n, visit);
        };
        visit(sf);
      }
      this.clashNames = new Set(methods.filter((m) => {
        const a = /^(get|set)([A-Z]\w*)$/.exec(m);
        return (a && props.has(a[2][0].toLowerCase() + a[2].slice(1))) || (/^is[A-Z]/.test(m) && props.has(m));
      }));
    }
    return ident(this.clashNames.has(name) ? `${name}_` : name);
  }

  /** Whether a method is the compiled kit's (the program's, or core's declarations of it), not a Java or library one. */
  private isCompiledMethod(sym: ts.Symbol): boolean {
    const d = sym.valueDeclaration ?? sym.declarations?.[0];
    return !!d && (ts.isMethodDeclaration(d) || ts.isMethodSignature(d)) && !isLibDeclaration(d) && !this.native?.isNativeDeclaration(d);
  }

  /** Library mode: a class leaving an abstract method of its base unimplemented (`TextFieldBase` over `EditableTextBase`), abstract in Kotlin. */
  private leavesAbstract(cls: ts.ClassLikeDeclaration): boolean {
    const implemented = new Set<string>();
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; b = this.baseClassOf(b)) {
      for (const m of b.members) {
        if (!m.name || !(ts.isMethodDeclaration(m) || ts.isPropertyDeclaration(m) || ts.isAccessor(m))) continue;
        const n = m.name.getText();
        if (hasModifier(m, ts.SyntaxKind.AbstractKeyword) && !implemented.has(n)) return true;
        implemented.add(n);
      }
    }
    return false;
  }

  /** The method of this name a class's app or plugin base classes declare. */
  private inheritedMethod(cls: ts.ClassLikeDeclaration, name: string): ts.MethodDeclaration | undefined {
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) {
      // An overloaded method's implementation is the one Kotlin declares.
      const all = b.members.filter((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && x.name.getText() === name);
      const m = all.find((x) => !!x.body) ?? all[0];
      if (m) return m;
    }
    return undefined;
  }

  /** An override taking the overridden method's Kotlin parameters, bound to its own as TypeScript types them. */
  private appOverride(m: ts.MethodDeclaration, base: ts.MethodDeclaration, name = this.methodIdent(m.name.getText())): string {
    return this.suppressingDeprecations(() => this.appOverrideCode(m, base, name));
  }

  private appOverrideCode(m: ts.MethodDeclaration, base: ts.MethodDeclaration, name: string): string {
    // The base's signature as the subclass instantiates it (`create(): T` of `Test<Label>` is `create(): Label`).
    const args = ts.isClassLike(m.parent) && ts.isClassLike(base.parent) ? this.baseTypeArgs(m.parent, base.parent) : new Map<string, string>();
    const baseTypes = base.parameters.map((p) => substituteTypes(this.paramType(p), args));
    const baseRet = substituteTypes(this.returnTypeOf(base), args);
    // A number, string or boolean where the base gives an object (`getDefault(): number { return null }` over a Drawable): the base's.
    const ret = ['Double', 'String', 'Boolean'].includes(this.returnTypeOf(m)) && isNullable(baseRet) && baseRet !== 'Any?' && !['Double?', 'String?', 'Boolean?'].includes(baseRet) ? baseRet : this.returnTypeOf(m);
    const sig = this.signatureNames(m, this.paramNames(base), (k) => `__o${k}`);
    const binds = m.parameters.map((p, k) => {
      if (!ts.isIdentifier(p.name)) return '';
      const own = this.paramType(p);
      const sym = this.checker.getSymbolAtLocation(p.name);
      if (sym && this.states.mayBeNull(p)) this.nullableDecls.add(sym);
      // A parameter the body never reads is never checked against its declared type, as in script
      // (`[backgroundInternalProperty.setNative](value: Color) {}` given a Background).
      const reads = (n: ts.Node): boolean => (ts.isIdentifier(n) && this.checker.getSymbolAtLocation(n) === sym) || !!ts.forEachChild(n, reads);
      if (this.library && sym && m.body && !reads(m.body) && k < baseTypes.length) return '';
      // A rest parameter over the base's fixed ones (`showModal(...args)`): the arguments from here on, as many as script
      // passed, which code reads through `args.length`.
      if (p.dotDotDotToken) {
        const rest = baseTypes.slice(k).map((_, j) => sig[k + j] ?? `__o${k + j}`);
        return `        val ${ident(p.name.text)}: ${own} = (JSArray<Any?>(listOf<Any?>(${rest.join(', ')}).dropLastWhile { it == null }) as ${own.replace(/\?$/, '')})`;
      }
      // Library mode: a class narrower than the base's (`child: View` where core passes any ViewBase, a NavigationButton):
      // held as the base's, cast only where code needs the narrower class, as script trusts it.
      if (this.library && k < baseTypes.length && this.isObjectType(own) && this.isObjectType(baseTypes[k]) && own.replace(/\?$/, '') !== baseTypes[k].replace(/\?$/, '') && /^[A-Z]\w*\??$/.test(own) && /^[A-Z]\w*\??$/.test(baseTypes[k])) {
        this.widenedAccessors.set(p, optionalType(baseTypes[k]));
        this.widenedParams.set(p, { base: this.checker.getTypeAtLocation(base.parameters[k].name), own: optionalType(own) });
        return sig[k] === ident(p.name.text) && optionalType(baseTypes[k]) === baseTypes[k] ? '' : `        val ${ident(p.name.text)}: ${optionalType(baseTypes[k])} = ${sig[k]}`;
      }
      const value = k < baseTypes.length ? this.convert(sig[k], baseTypes[k], own) : (this.zero(own) ?? 'null');
      return value === ident(p.name.text) && own === baseTypes[k] ? '' : `        val ${ident(p.name.text)}: ${own} = ${value}`;
    }).filter(Boolean);
    const head = `    override fun ${name}(${baseTypes.map((t, k) => `${sig[k] ?? `__o${k}`}: ${t}`).join(', ')})${baseRet === 'Unit' ? '' : `: ${baseRet}`} {`;
    // A result the base's signature takes as it is: the body is the override's own.
    if ((ret === baseRet || (ret !== 'Unit' && baseRet !== 'Unit' && this.convert('__r', ret, baseRet) === '__r')) && !(binds.length && this.paramPrelude(m).length)) {
      const body = this.functionBody(m, ret, '    ');
      return [head, ...binds, body.slice(2)].join('\n');
    }
    const body = this.inFunction(ret, () => this.functionBody(m, ret, '        '));
    const call = `(fun()${ret === 'Unit' ? '' : `: ${ret}`} ${body})()`;
    const result = baseRet === 'Unit' ? `        ${call}` : `        return ${this.convert(call, ret, baseRet)}`;
    return [head, ...binds, result, '    }'].join('\n');
  }

  /** Whether a class (or a class it extends) names the interface in its `implements` or `extends`, which its Kotlin class then implements. */
  private declaresInterface(type: ts.Type, name: string): boolean {
    const decl = this.checker.getNonNullableType(type).getSymbol()?.valueDeclaration;
    if (!decl || !ts.isClassLike(decl)) return false;
    if ([...this.structural.get(decl) ?? []].some((d) => d.name.text === name && this.protocolWitnesses(decl, d, name, [], new Set()))) return true;
    for (const h of decl.heritageClauses ?? []) {
      for (const x of h.types) {
        if (x.expression.getText() === name) return true;
        if (h.token === ts.SyntaxKind.ExtendsKeyword && this.declaresInterface(this.checker.getTypeAtLocation(x), name)) return true;
      }
    }
    return false;
  }

  /** A generic base class's type parameters as a subclass extends it (`Test<Label>`: T is Label), in Kotlin. */
  private baseTypeArgs(sub: ts.ClassLikeDeclaration, base: ts.ClassLikeDeclaration): Map<string, string> {
    const out = new Map<string, string>();
    if (!base.typeParameters?.length || sub === base) return out;
    const target = this.checker.getSymbolAtLocation(base.name!) ?? (base as unknown as { symbol?: ts.Symbol }).symbol;
    const find = (t: ts.Type): ts.TypeReference | undefined => {
      for (const b of this.checker.getBaseTypes(t as ts.InterfaceType) ?? []) {
        if (b.getSymbol() === target) return b as ts.TypeReference;
        const up = find(b);
        if (up) return up;
      }
      return undefined;
    };
    const ref = find(this.checker.getTypeAtLocation(sub.name ?? sub));
    const typeArgs = ref ? this.checker.getTypeArguments(ref) : [];
    base.typeParameters.forEach((p, k) => {
      const a = typeArgs[k];
      if (!a) return;
      // `any` for a bounded parameter is its bound, as the class's Kotlin heritage gives it.
      out.set(p.name.text, a.flags & ts.TypeFlags.Any && p.constraint && !this.library ? this.type(this.checker.getTypeFromTypeNode(p.constraint), p).replace(/\?$/, '') : this.type(a, sub));
    });
    return out;
  }

  /** The overridden signature of a method taking more parameters: its overload, the parameters script leaves out undefined. */
  private overloadBridge(m: ts.MethodDeclaration, base: ts.MethodDeclaration): string {
    return this.suppressingDeprecations(() => this.overloadBridgeCode(m, base));
  }

  private overloadBridgeCode(m: ts.MethodDeclaration, base: ts.MethodDeclaration): string {
    const name = this.methodIdent(m.name.getText());
    const baseTypes = base.parameters.map((p) => this.paramType(p));
    const baseRet = this.returnTypeOf(base);
    const ret = this.returnTypeOf(m);
    const names = base.parameters.map((p, k) => (ts.isIdentifier(p.name) ? ident(p.name.text) : `__o${k}`));
    const args = m.parameters.map((p, k) => {
      const t = this.paramType(p);
      if (k < baseTypes.length) return this.convert(names[k], baseTypes[k], t);
      if (this.constantDefault(p)) return this.stored(p.initializer!, p, t);
      return isNullable(t) || t === 'Any?' ? 'null' : this.zero(t) ?? 'null';
    });
    const call = `this.${name}(${args.join(', ')})`;
    const body = baseRet === 'Unit' ? `        ${call}` : `        return ${this.convert(call, ret, baseRet)}`;
    return [`    override fun ${name}(${baseTypes.map((t, k) => `${names[k]}: ${t}`).join(', ')})${baseRet === 'Unit' ? '' : `: ${baseRet}`} {`, body, '    }'].join('\n');
  }

  /** Library mode: the field or accessor a source base class declares under a field's name, which the field redeclares. */
  private redeclaredField(m: ts.PropertyDeclaration): ts.PropertyDeclaration | ts.AccessorDeclaration | null {
    if (isStatic(m) || !ts.isClassLike(m.parent)) return null;
    const name = m.name.getText();
    let found: ts.PropertyDeclaration | ts.AccessorDeclaration | null = null;
    for (let b = this.baseClassOf(m.parent); b; b = this.baseClassOf(b)) {
      const own = b.members.find((x): x is ts.PropertyDeclaration | ts.AccessorDeclaration => (ts.isPropertyDeclaration(x) || ts.isAccessor(x)) && !isStatic(x) && x.name.getText() === name);
      if (own) found = own;
    }
    return found;
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
  /**
   * Library mode: what a module declares ambiently for the runtime to provide (`declare namespace com.tns { class NativeScriptApplication }`),
   * read from the global object, undefined where nothing provides it.
   */
  private isAmbient(e: ts.Node): boolean {
    if (!this.library) return false;
    if (ts.isPropertyAccessExpression(e)) return this.isAmbient(e.expression);
    if (!ts.isIdentifier(e)) return false;
    const decls = this.resolve(e)?.declarations ?? [];
    return decls.length > 0 && decls.every((d) => !d.getSourceFile().isDeclarationFile && ((ts.isModuleDeclaration(d) && hasModifier(d, ts.SyntaxKind.DeclareKeyword))
      || (ts.isVariableDeclaration(d) && ts.isVariableStatement(d.parent.parent) && hasModifier(d.parent.parent, ts.SyntaxKind.DeclareKeyword))));
  }

  private isJavaPackage(sym: ts.Symbol | undefined): boolean {
    return !!sym && !!(sym.flags & ts.SymbolFlags.Namespace) && !(sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum)) && !!sym.declarations?.length && sym.declarations.every((d) => !!this.native?.isNativeDeclaration(d));
  }

  /** Library mode: a place read and written by key (`info.runCount` of an untyped object, a Java object's expando), for `+=` and `++`. */
  private untypedPlace(e: ts.Expression): { obj: string; key: string } | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    // App mode: a member of an untyped object (`(<any>args.object).returnPress++`).
    if (!this.library) {
      if (ts.isPropertyAccessExpression(e) && (this.isAny(e.expression) || undeclaredMemberOf(e, this.checker) || this.definedAccess(e))) return { obj: this.expr(e.expression), key: kotlinString(e.name.text) };
      // A key the object's type does not declare (`obj['count']++` of an Observable): the object's by name.
      const undeclared = ts.isElementAccessExpression(e) && ts.isStringLiteral(e.argumentExpression) && !this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)).getProperty(e.argumentExpression.text);
      return ts.isElementAccessExpression(e) && (this.isAny(e.expression) || undeclared) ? { obj: this.expr(e.expression), key: this.propertyKey(e.argumentExpression) } : null;
    }
    if (ts.isPropertyAccessExpression(e) && (this.isAny(e.expression) || this.isExpando(e))) return { obj: this.expr(e.expression), key: kotlinString(e.name.text) };
    if (ts.isElementAccessExpression(e) && this.isAny(e.expression)) return { obj: this.expr(e.expression), key: this.propertyKey(e.argumentExpression) };
    return null;
  }

  /** `X.prototype` (library mode) of a class the program compiles: an untyped object. */
  private isPrototypeRef(e: ts.Node): boolean {
    if (!ts.isPropertyAccessExpression(e) || e.name.text !== 'prototype') return false;
    const sym = this.resolve(e.expression);
    return !!(sym && sym.flags & ts.SymbolFlags.Class) && !sym.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
  }

  private undeclaredRoots: Set<ts.ClassLikeDeclaration> | null = null;
  private givenUndeclared(): Set<ts.ClassLikeDeclaration> {
    if (this.undeclaredRoots) return this.undeclaredRoots;
    if (this.library) return (this.undeclaredRoots = new Set());
    const roots = new Set([...classesGivenUndeclaredMembers(this.sourceFiles, this.checker), ...classesHeldUntyped(this.sourceFiles, this.checker)]);
    // An instance's own value for a method lives in its hierarchy root's expando.
    for (const d of this.instanceKeys()) {
      let cls = d.parent as ts.ClassLikeDeclaration;
      for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) cls = b;
      roots.add(cls);
    }
    return (this.undeclaredRoots = roots);
  }

  private ownKeys: Set<ts.MethodDeclaration> | null = null;
  /** App mode: the program's instance methods some `obj.m = fn` gives an instance its own value for. */
  private instanceKeys(): Set<ts.MethodDeclaration> {
    if (this.ownKeys) return this.ownKeys;
    const keys = new Set<ts.MethodDeclaration>();
    const visit = (n: ts.Node) => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left)) {
        const d = this.replacedMethod(n.left);
        if (d && !isStatic(d)) keys.add(d);
      }
      ts.forEachChild(n, visit);
    };
    if (!this.library) for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
    return (this.ownKeys = keys);
  }

  /** The program class's method `obj.m = …` writes over. */
  private replacedMethod(left: ts.PropertyAccessExpression): ts.MethodDeclaration | undefined {
    if (this.library || this.isPrototypeRef(left.expression) || left.expression.kind === ts.SyntaxKind.SuperKeyword) return undefined;
    return this.checker.getSymbolAtLocation(left.name)?.declarations?.find((d): d is ts.MethodDeclaration => ts.isMethodDeclaration(d) && !!d.body && ts.isClassLike(d.parent) && !d.getSourceFile().isDeclarationFile);
  }

  /** A method an instance may hold its own value for (see `instanceKeys`), or one overriding such a method. */
  private isInstanceKey(name: ts.MemberName): boolean {
    const keys = this.instanceKeys();
    if (!keys.size) return false;
    const decls = this.resolve(name)?.declarations?.filter((d): d is ts.MethodDeclaration => ts.isMethodDeclaration(d) && ts.isClassLike(d.parent)) ?? [];
    for (let d = decls.find((x) => !!x.body) ?? decls[0]; d; d = this.inheritedMethod(d.parent as ts.ClassLikeDeclaration, name.text)) if (keys.has(d)) return true;
    return false;
  }

  private ownCalls = new Set<ts.Node>();
  /** `recv.m(…)` of an instance key: the instance's own value, with `recv` as its `this`, else the class's method. */
  private ownValueCall(e: ts.CallExpression, callee: ts.PropertyAccessExpression): string {
    const recv = callee.expression;
    const self = recv.kind === ts.SyntaxKind.ThisKeyword;
    const recvCode = this.expr(recv);
    const o = self ? recvCode : this.fresh('__o'), own = this.fresh('__own');
    const args = e.arguments.some(ts.isSpreadElement) ? [`*${this.packed(e.arguments, 'JSArray<Any?>', this.restSlot(e, 'Any?'))}.storage.toTypedArray()`] : e.arguments.map((a) => this.restArgument(e, a, 'Any?'));
    this.ownCalls.add(e);
    if (!self) this.subst.set(recv, o);
    let plain: string;
    try { plain = this.call(e); } finally { this.ownCalls.delete(e); if (!self) this.subst.delete(recv); }
    const value = this.fromAnyCode(`jsCallValue(${[`${own}.value`, o, String(!!e.questionDotToken), ...args].join(', ')})`, this.typeOf(e), true);
    return `run { ${self ? '' : `val ${o} = ${recvCode}; `}val ${own} = jsOwnProperty(${o}, ${kotlinString(callee.name.text)}); if (${own} != null) ${value} else ${plain} }`;
  }

  private definedKeySet: Set<string> | null = null;
  /** App mode: the keys `Object.defineProperty` names on untyped objects, which a program class's field of that name keeps a descriptor for. */
  private definedKeys(): Set<string> {
    return (this.definedKeySet ??= this.library ? new Set() : keysDefinedUntyped(this.sourceFiles, this.checker));
  }

  /** The class's own fields whose objects `Object.defineProperty` may give a descriptor (`JSDefinable`). */
  private definableNames(cls: ts.ClassLikeDeclaration): string[] {
    if (this.library || !this.definedKeys().size || cls.getSourceFile().isDeclarationFile || this.pluginFiles.has(cls.getSourceFile().fileName)) return [];
    let root = cls;
    for (let b = this.baseClassOf(cls); b; b = this.baseClassOf(b)) root = b;
    const h = root.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (h && ERRORS[h.expression.getText()]) return [];
    const ctor = cls.members.find(ts.isConstructorDeclaration);
    const own = [...cls.members.filter((m) => ts.isPropertyDeclaration(m) && !isStatic(m) && ts.isIdentifier(m.name)), ...(ctor?.parameters.filter((p) => ts.isParameterPropertyDeclaration(p, ctor)) ?? [])];
    return own.map((m) => (m.name as ts.Identifier).text).filter((n) => this.definedKeys().has(n));
  }

  /** The field `definableNames` lists that `key` of the object names, if any (`const { field } = obj`, `obj['field']`). */
  private definedField(object: ts.Node, key: string): ts.NamedDeclaration | undefined {
    if (this.library || !this.definedKeys().has(key)) return undefined;
    const d = this.checker.getNonNullableType(this.checker.getTypeAtLocation(object)).getProperty(key)?.valueDeclaration;
    const cls = d && (ts.isPropertyDeclaration(d) ? d.parent : ts.isParameter(d) && ts.isConstructorDeclaration(d.parent) ? d.parent.parent : undefined);
    return cls && ts.isClassLike(cls) && this.definableNames(cls).includes(key) ? (d as ts.NamedDeclaration) : undefined;
  }

  /**
   * `obj.field` of a field `definableNames` lists, read or written by key so that a descriptor it was given applies. The
   * class's own constructor writes `this.field` directly: nothing has been defined on the object it is making.
   */
  private definedAccess(e: ts.PropertyAccessExpression): boolean {
    if (e.expression.kind === ts.SyntaxKind.SuperKeyword || !this.definedField(e.expression, e.name.text)) return false;
    if (e.expression.kind === ts.SyntaxKind.ThisKeyword) {
      const fn = ts.getThisContainer(e, false, false);
      if (ts.isConstructorDeclaration(fn) || ts.isPropertyDeclaration(fn)) return false;
    }
    return true;
  }

  private isExpando(e: ts.PropertyAccessExpression): boolean {
    if (this.definedAccess(e)) return true;
    if (!this.library && undeclaredMemberOf(e, this.checker)) return true;
    const decl = this.checker.getSymbolAtLocation(e.name)?.declarations?.[0];
    // A property script adds to a function it declares (`fn.tag = …`), which TypeScript declares by that assignment.
    if (decl && (ts.isPropertyAccessExpression(decl) || ts.isBinaryExpression(decl)) && this.checker.getTypeAtLocation(e.expression).getCallSignatures().length) return true;
    // A field an interface of the program adds to a native class (`interface ExpandedAnimator extends android.animation.Animator { entry }`).
    if (decl && ts.isPropertySignature(decl) && ts.isInterfaceDeclaration(decl.parent) && !decl.getSourceFile().isDeclarationFile) {
      return (decl.parent.heritageClauses ?? []).some((h) => h.types.some((x) => !!this.native?.type(this.checker.getTypeAtLocation(x))));
    }
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
  private typeRenames = new Map<ts.Node, string>();
  /**
   * Module-level functions, classes and variables of the same name in several
   * modules (a plugin's `install` in its common and Android files): all but
   * one take the module's name as a suffix, as the app's Kotlin is one package.
   */
  /** App mode: a type name Kotlin code already has unqualified (a default import's, the runtime's). */
  private nativeClash(name: string): boolean {
    return !this.library && (KOTLIN_NATIVE_TYPES.has(name) || runtimeTypeName(name));
  }

  private openFieldsClass: ts.ClassLikeDeclaration | null | undefined;
  /**
   * App mode: a program class declaring instance fields whose objects the program holds untyped somewhere (any, unknown,
   * object, a type parameter), so that `Object.defineProperty` with a key known only at run time may name one of its fields.
   */
  private heldOpenWithFields(): ts.ClassLikeDeclaration | null {
    if (this.openFieldsClass !== undefined) return this.openFieldsClass;
    const roots = classesHeldUntyped(this.sourceFiles, this.checker, true);
    const rootOf = (c: ts.ClassLikeDeclaration) => { let r = c; for (let b = this.baseClassOf(r); b; b = this.baseClassOf(b)) r = b; return r; };
    const hasFields = (c: ts.ClassLikeDeclaration) => c.members.some((m) => (ts.isPropertyDeclaration(m) && !hasModifier(m, ts.SyntaxKind.StaticKeyword) && !hasModifier(m, ts.SyntaxKind.DeclareKeyword))
      || (ts.isConstructorDeclaration(m) && m.parameters.some((p) => ts.isParameterPropertyDeclaration(p, m))));
    const classes: ts.ClassLikeDeclaration[] = [];
    const visit = (n: ts.Node): void => { if (ts.isClassLike(n)) classes.push(n); ts.forEachChild(n, visit); };
    for (const f of this.sourceFiles) if (!f.isDeclarationFile && !this.pluginFiles.has(f.fileName)) visit(f);
    return (this.openFieldsClass = this.library ? null : classes.find((c) => roots.has(rootOf(c)) && hasFields(c)) ?? null);
  }

  /** Refuses `definesRunTimeKey`'s calls in app code where a program class's declared field may be the key (`heldOpenWithFields`). */
  private refuseRunTimeDefine(e: ts.CallExpression): void {
    if (this.library || this.pluginFiles.has(e.getSourceFile().fileName) || !definesRunTimeKey(e, this.checker)) return;
    const cls = this.heldOpenWithFields();
    if (cls) throw this.error(e, `Object.${(e.expression as ts.PropertyAccessExpression).name.text} with a key known only at run time on an untyped object that may be a \`${cls.name?.text ?? 'class'}\`, whose declared fields keep no descriptor`);
  }

  private topNames(): Map<ts.Node, string> {
    if (this.renamedTop) return this.renamedTop;
    const byName = new Map<string, { decl: ts.Node; file: ts.SourceFile }[]>();
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const add = (name: string, decl: ts.Node) => {
        const list = byName.get(name) ?? [];
        // An interface beside a variable of its name (`let TabChangeListener: TabChangeListener`): the interface's class takes another.
        const same = list.find((x) => x.file === sf);
        const isType = (d: ts.Node) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d);
        if (this.library && same && isType(same.decl) !== isType(decl)) { this.typeRenames.set(isType(decl) ? decl : same.decl, `${name}Interface`); if (isType(same.decl)) same.decl = decl; return; }
        if (!list.some((x) => x.file === sf)) list.push({ decl, file: sf });
        else if (ts.isFunctionDeclaration(decl)) list.find((x) => x.file === sf)!.decl = decl.body ? decl : list.find((x) => x.file === sf)!.decl;
        byName.set(name, list);
      };
      for (const st of sf.statements) {
        if (ts.isClassDeclaration(st) && st.name) add(st.name.text, st);
        // An interface becomes a class of its name too; outside the kit, one named as a kit class takes its module's name (below).
        const shape = ts.isInterfaceDeclaration(st) || (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) ? st : null;
        if (shape && (this.library || ((this.core?.has(shape.name.text) || this.nativeClash(shape.name.text)) && !(this.checker.getSymbolAtLocation(shape.name)!.flags & ts.SymbolFlags.Class)))) add(shape.name.text, shape);
        if (ts.isModuleDeclaration(st) && ts.isIdentifier(st.name) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) add(st.name.text, st);
        if (ts.isEnumDeclaration(st) && !hasModifier(st, ts.SyntaxKind.DeclareKeyword)) add(st.name.text, st);
        // Library mode: a module's functions and variables are its object's, named by it.
        if (ts.isFunctionDeclaration(st) && st.name && !this.library) add(st.name.text, st);
        if (ts.isVariableStatement(st) && !this.library) for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name)) add(d.name.text, d);
          else for (const n of boundNames(d.name)) add(n.text, n.parent);
        }
      }
      // Classes declared in functions are declared at the top level too.
      const local = (n: ts.Node): void => {
        if (ts.isClassDeclaration(n) && n.name && !ts.isSourceFile(n.parent) && ts.findAncestor(n.parent, ts.isFunctionLike)) add(n.name.text, n);
        ts.forEachChild(n, local);
      };
      if (this.library) ts.forEachChild(sf, local);
    }
    this.renamedTop = new Map(this.typeRenames);
    // Core's functions the program imports (`booleanConverter`), which kit-android declares at its top level: a program's
    // function or variable of that name would hide them from every file of the app's package.
    const coreFunctions = new Set<string>();
    if (!this.library) {
      for (const sf of this.sourceFiles) {
        if (sf.isDeclarationFile) continue;
        for (const st of sf.statements) {
          if (!ts.isImportDeclaration(st) || !st.importClause?.namedBindings || !ts.isNamedImports(st.importClause.namedBindings)) continue;
          for (const el of st.importClause.namedBindings.elements) {
            const sym = this.resolve(el.name);
            if (sym && sym.flags & ts.SymbolFlags.Function && isCoreDeclaration(sym.declarations?.[0])) coreFunctions.add(sym.name);
          }
        }
      }
    }
    // A renamed declaration takes its module's name: the shortest end of its path no other name has taken
    // (`label__index`, else `label__two_index` for another folder's index.ts).
    const taken = new Set(byName.keys());
    const renamed = (name: string, file: ts.SourceFile) => {
      const segs = file.fileName.replace(/\.[^./]+$/, '').split('/').filter(Boolean);
      for (let k = 1; k <= segs.length; k++) {
        const candidate = `${name}__${segs.slice(-k).join('_').replace(/\W/g, '_')}`;
        if (!taken.has(candidate)) { taken.add(candidate); return candidate; }
      }
      let n = 2;
      while (taken.has(`${name}__${n}`)) n++;
      taken.add(`${name}__${n}`);
      return `${name}__${n}`;
    };
    for (const [name, list] of byName) {
      // A plugin's or the app's type named as a kit-android type takes its module's name too: a class (one extending core's
      // `Observable`), and outside the kit a namespace, enum, interface or object type (ui-chart's `Utils`), since a declaration
      // of the app's package hides the kit's of its name, imported with `org.nativescript.kit.*`, from every file of the app.
      const typeLike = (d: ts.Node) => ts.isClassDeclaration(d) || (!this.library && (ts.isModuleDeclaration(d) || ts.isEnumDeclaration(d) || ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d)));
      const kitClash = (list.some((x) => typeLike(x.decl)) && !!this.core?.has(name)) || (coreFunctions.has(name) && list.some((x) => ts.isFunctionDeclaration(x.decl) || ts.isVariableDeclaration(x.decl)));
      // A type the hand-written kit declares for itself, or an app's type named as one Kotlin has already (`Pair`): the
      // generated one takes its module's name.
      const internalClash = !!this.library?.internalTypes?.has(name) || (list.some((x) => typeLike(x.decl) || ts.isInterfaceDeclaration(x.decl)) && this.nativeClash(name));
      if (list.length < 2 && !kitClash && !internalClash) continue;
      // The app's declaration keeps its name (the first app module's, of several); the others take their module's.
      const keep = kitClash || internalClash ? undefined : (this.library ? list.find((x) => ts.isClassDeclaration(x.decl)) : undefined) ?? list.find((x) => !this.pluginFiles.has(x.file.fileName)) ?? list[0];
      for (const x of list) {
        if (x === keep) continue;
        const to = renamed(name, x.file);
        this.renamedTop.set(x.decl, to);
        // Every declaration of an overloaded function names the same Kotlin function.
        if (ts.isFunctionDeclaration(x.decl)) for (const st of x.file.statements) if (ts.isFunctionDeclaration(st) && st.name?.text === name) this.renamedTop.set(st, to);
      }
    }
    // Library mode: names apart only in case (`ios`, `iOS`) are one class file on a case-insensitive disk: all but the first take their module's name.
    if (this.library) {
      const byLower = new Map<string, string>();
      for (const [name, list] of byName) {
        const first = byLower.get(name.toLowerCase());
        if (first === undefined) { byLower.set(name.toLowerCase(), name); continue; }
        if (first === name) continue;
        for (const x of list) {
          if (this.renamedTop.has(x.decl)) continue;
          this.renamedTop.set(x.decl, renamed(name, x.file));
        }
      }
    }
    // Library mode: `@JavaProxy('org.nativescript.NativeScriptLifecycleCallbacks')`, the Java name a class is declared under.
    if (this.library) for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const visit = (n: ts.Node): void => {
        if (ts.isClassDeclaration(n)) {
          const proxy = (ts.getDecorators(n) ?? []).map((d) => d.expression).find((x): x is ts.CallExpression => ts.isCallExpression(x) && ts.isIdentifier(x.expression) && x.expression.text === 'JavaProxy');
          if (proxy && ts.isStringLiteralLike(proxy.arguments[0])) this.renamedTop!.set(n, proxy.arguments[0].text);
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
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
    // A namespace's interface is a class of the app's package (see `namespaceDecl`): where another declaration of the package,
    // another namespace's interface or the kit has its name, it takes its namespace's.
    if (!this.library) {
      const hoisted = new Map<string, { decl: ts.Node; ns: ts.ModuleDeclaration }[]>();
      const collect = (md: ts.ModuleDeclaration) => {
        if (!md.body || !ts.isModuleBlock(md.body) || hasModifier(md, ts.SyntaxKind.DeclareKeyword)) return;
        for (const st of md.body.statements) {
          if (ts.isInterfaceDeclaration(st) || (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type))) hoisted.set(st.name.text, [...(hoisted.get(st.name.text) ?? []), { decl: st, ns: md }]);
          if (ts.isModuleDeclaration(st)) collect(st);
        }
      };
      for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) for (const st of sf.statements) if (ts.isModuleDeclaration(st)) collect(st);
      for (const [name, list] of hoisted) {
        if (!byName.has(name) && list.length < 2 && !this.core?.has(name)) continue;
        for (const x of list) this.renamedTop.set(x.decl, `${name}__${(this.namespacePath(x.ns) ?? '').replace(/\./g, '_')}`);
      }
    }
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
  /** A function's `var`s declared at the top of its body (see `scopedVars`). */
  private scopedDeclared = new Set<ts.VariableDeclaration>();

  statements(list: ts.Statement[]): string[] {
    const hoisted = list.filter((s, k) => ts.isFunctionDeclaration(s) && usedBefore(list, k));
    // What follows a statement that never completes never runs: left out, as Kotlin would flag it.
    const end = list.findIndex((s) => this.exits(s));
    const live = end < 0 ? list : list.slice(0, end + 1);
    return [...this.scopedVars(list), ...this.forwardDeclarations(list), ...[...hoisted, ...live.filter((s) => !hoisted.includes(s))].map((s) => this.stmt(s)).filter(Boolean)];
  }

  /**
   * A function's `var`s declared in an inner block (a loop's head, a branch) and used or declared again outside it:
   * declared at the top of the function body, as JavaScript hoists them, and assigned where they are declared.
   */
  private scopedVars(list: ts.Statement[]): string[] {
    const body = list[0]?.parent;
    if (!body || !ts.isBlock(body) || !ts.isFunctionLike(body.parent)) return [];
    const scope = (n: ts.Node) => ts.findAncestor(n.parent, (a) => ts.isBlock(a) || ts.isIterationStatement(a, false) || ts.isCaseBlock(a) || ts.isCatchClause(a) || ts.isFunctionLike(a))!;
    const decls = new Map<ts.Symbol, ts.VariableDeclaration[]>();
    const refs = new Map<ts.Symbol, ts.Identifier[]>();
    const collect = (n: ts.Node): void => {
      if (ts.isVariableDeclarationList(n) && !(n.flags & ts.NodeFlags.BlockScoped) && !ts.isForInStatement(n.parent) && !ts.isForOfStatement(n.parent)) {
        for (const d of n.declarations) {
          const sym = ts.isIdentifier(d.name) ? this.checker.getSymbolAtLocation(d.name) : undefined;
          if (sym && !ts.isFunctionLike(scope(d))) decls.set(sym, [...(decls.get(sym) ?? []), d]);
        }
      }
      if (!ts.isFunctionLike(n)) ts.forEachChild(n, collect);
    };
    const collectRefs = (n: ts.Node): void => {
      const sym = ts.isIdentifier(n) ? this.checker.getSymbolAtLocation(n) : undefined;
      if (sym && decls.has(sym)) refs.set(sym, [...(refs.get(sym) ?? []), n as ts.Identifier]);
      ts.forEachChild(n, collectRefs);
    };
    list.forEach(collect);
    if (!decls.size) return [];
    list.forEach(collectRefs);
    const out: string[] = [];
    for (const [sym, ds] of decls) {
      // Declared in a for-in or for-of head too: Kotlin's loop declares its own.
      if (sym.declarations?.some((d) => ts.isVariableDeclaration(d) && (ts.isForInStatement(d.parent.parent) || ts.isForOfStatement(d.parent.parent)))) continue;
      const inner = ds.filter((d) => scope(d) !== body);
      const escapes = inner.some((d) => (refs.get(sym) ?? []).some((r) => !ts.findAncestor(r, (a) => a === scope(d))));
      if (!escapes) continue;
      for (const d of sym.declarations ?? []) if (ts.isVariableDeclaration(d)) this.scopedDeclared.add(d);
      out.push(`${this.indent}${this.deferredDeclaration(ident((ds[0].name as ts.Identifier).text), this.typeOf(ds[0].name))}`);
    }
    return out;
  }

  /** Whether a statement never completes normally (it returns, throws or calls what never returns), as Kotlin's flow analysis finds. */
  exits(s: ts.Statement): boolean {
    if (ts.isReturnStatement(s) || ts.isThrowStatement(s)) return true;
    if (ts.isExpressionStatement(s)) return ts.isCallExpression(s.expression) && this.typeOf(s.expression) === 'Nothing';
    if (ts.isBlock(s)) return s.statements.some((x) => this.exits(x));
    if (ts.isIfStatement(s)) {
      const fixed = this.staticTruth(s.expression);
      if (fixed !== undefined) {
        const live = fixed ? s.thenStatement : s.elseStatement;
        return !!live && this.exits(live);
      }
      return !!s.elseStatement && this.exits(s.thenStatement) && this.exits(s.elseStatement);
    }
    if (ts.isTryStatement(s)) return (!!s.finallyBlock && this.exits(s.finallyBlock)) || (this.exits(s.tryBlock) && (!s.catchClause || this.exits(s.catchClause.block)));
    // A loop whose condition always holds, left by no `break`.
    if ((ts.isWhileStatement(s) || ts.isDoStatement(s)) && this.staticTruth(s.expression) === true) return !breaksOut(s);
    if (ts.isForStatement(s) && (!s.condition || this.staticTruth(s.condition) === true)) return !breaksOut(s);
    return false;
  }

  /** The variables of a list that a function declared before them reads, declared up front (see `forwardDeclared`). */
  forwardDeclarations(list: ts.Statement[]): string[] {
    const hoisted = list.filter((s, k) => ts.isFunctionDeclaration(s) && usedBefore(list, k));
    const forward: string[] = [];
    list.forEach((st, k) => {
      if (!ts.isVariableStatement(st)) return;
      // A `var` is its function's from the start (hoisted), undefined until its declaration runs.
      const isVar = !(st.declarationList.flags & ts.NodeFlags.BlockScoped);
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name) || !d.initializer || this.scopedDeclared.has(d)) continue;
        const sym = this.checker.getSymbolAtLocation(d.name);
        const hoistedVar = isVar && (sym?.declarations?.length ?? 0) < 2;
        let early = false, read = false;
        const visit = (n: ts.Node, inFn: boolean) => {
          if (early) return;
          if ((inFn || hoistedVar) && ts.isIdentifier(n) && n !== d.name && this.checker.getSymbolAtLocation(n) === sym) { early = true; read = !inFn; return; }
          ts.forEachChild(n, (c) => visit(c, inFn || ts.isFunctionLike(c)));
        };
        list.forEach((other, j) => { if (j < k || hoisted.includes(other)) visit(other, ts.isFunctionLike(other)); });
        if (!early) continue;
        this.forwardDeclared.add(d);
        const t = this.typeOf(d.name);
        // Read before it is set: undefined, which a number reads as NaN.
        forward.push(`${this.indent}${read && t === 'Double' ? `var ${ident(d.name.text)}: Double = Double.NaN` : this.deferredDeclaration(ident(d.name.text), t)}`);
      }
    });
    return forward;
  }

  block(b: ts.Statement, base = this.indent): string {
    const saved = this.indent;
    this.indent = base + '    ';
    try {
      const body = this.statements(ts.isBlock(b) ? [...b.statements] : [b]);
      return `{\n${body.join('\n')}\n${base}}`;
    } finally { this.indent = saved; }
  }

  /** With `--all-errors`: what each statement could not translate, collected so one run reports them all. */
  errors: string[] | null = null;

  stmt(s: ts.Statement): string {
    let code: string;
    try { code = this.statementCode(s); } catch (e) {
      const located = this.located(e, s);
      if (!this.errors) throw located;
      this.errors.push((located as Error).message ?? String(located));
      return '';
    }
    if (this.lambdaReturn && ts.isReturnStatement(s)) code = code.replace(/(^|\n)(\s*)return\b(?!@)/g, `$1$2return@${this.lambdaReturn}`);
    // A block's statements in place carry their own lines.
    return code && this.lines && !code.startsWith('/*@ns:') ? this.lines.mark(s) + code : code;
  }

  private statementCode(s: ts.Statement): string {
    const i = this.indent;
    const a = this.asyncCtx;
    if (ts.isExpressionStatement(s)) {
      const code = this.exprStatement(s.expression);
      const note = this.keyNotes?.get(s);
      if (note) return [note.before, code, note.after].filter(Boolean).map((l) => i + l).join('\n');
      return this.isPure(code) ? '' : i + code;
    }
    if (ts.isReturnStatement(s)) {
      const slot = this.resultSlot(s);
      return this.returned(returnCell(this.returns, s.expression, slot), slot);
    }
    if (ts.isIfStatement(s)) {
      // A condition the parameters' constant values decide: only the branch that runs.
      const fixed = this.staticTruth(s.expression);
      if (fixed !== undefined) {
        const live = fixed ? s.thenStatement : s.elseStatement;
        if (!live) return '';
        // A branch declaring nothing runs in the enclosing scope; one declaring names keeps a scope of its own.
        const scoped = (ts.isBlock(live) ? live.statements : [live]).some((x) => ts.isVariableStatement(x) || ts.isFunctionDeclaration(x) || ts.isClassDeclaration(x));
        return scoped ? `${i}run ${this.block(live)}` : this.statements(ts.isBlock(live) ? [...live.statements] : [live]).join('\n');
      }
      let out = `${i}if (${this.cond(s.expression)}) ${this.block(s.thenStatement)}`;
      // An `else if` the types decide is its live branch, or nothing.
      let other: ts.Statement | undefined = s.elseStatement;
      while (other && ts.isIfStatement(other) && this.staticTruth(other.expression) !== undefined) other = this.staticTruth(other.expression) ? other.thenStatement : other.elseStatement;
      if (other) out += ts.isIfStatement(other) ? ` else ${this.stmt(other).trimStart()}` : ` else ${this.block(other)}`;
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
      if (!ts.isVariableDeclarationList(list)) return this.forOfExisting(s, list);
      const decl = list.declarations[0];
      const mutable = !(list.flags & ts.NodeFlags.Const);
      const js = this.jsIteration(s.expression);
      if (js) {
        // The iterator protocol: a loop that leaves early closes the iterator.
        const it = this.fresh('__it');
        return this.loopBody(() => {
          const label = this.takeLabel();
          const body = this.nested(() => this.nested(() => this.block(s.statement)));
          // Library mode: an untyped iterable's values, read as the binding types them.
          const untyped = this.library && js.startsWith('jsIteratorOf(') ? 'Any?' : '';
          const bind = this.nested(() => this.nested(() => this.nested(() => this.bindTo(decl.name, `${it}.jsCurrent`, untyped, mutable))));
          return `${i}run {\n${i}    val ${it} = ${js}\n${i}    try {\n${i}        ${label}while (${it}.jsAdvance()) {\n${bind}\n${i}            run ${body}\n${i}        }\n${i}    } finally { ${it}.jsClose() }\n${i}}`;
        });
      }
      const seq = this.iterable(s.expression);
      const indexed = this.typeOf(s.expression);
      const typedArray = new RegExp(`^JS(${TYPED_ARRAYS.join('|')})$`).test(indexed);
      if (typedArray || /^JSArray<.*>$/.test(indexed)) {
        // An array's iteration reads by index up to its live length; an Iterator object per loop is garbage on hot paths.
        return this.loopBody(() => {
          const label = this.takeLabel();
          const array = this.fresh('__a');
          const k = this.fresh('__k');
          const read = `${array}[${k}++]`;
          const body = this.block(s.statement);
          const simple = ts.isIdentifier(decl.name) && !mutable;
          const item = simple ? '' : this.fresh('__item');
          const bind = simple
            ? `${i}    val ${ident((decl.name as ts.Identifier).text)} = ${read}`
            : `${i}    val ${item} = ${read}\n${this.nested(() => this.bindTo(decl.name, item, '', mutable))}`;
          return `${i}val ${array} = ${seq}\n${i}var ${k} = 0\n${i}${label}while (${k} < ${array}.${typedArray ? 'jsLength' : 'size'}) {\n${bind}\n${body.slice(2)}`;
        });
      }
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
      if (!assignsTo(s.statement, this.checker.getSymbolAtLocation(list.declarations[0].name), this.checker)) return this.loopBody(() => `${i}${this.takeLabel()}for (${name} in jsKeysOf(${this.expr(s.expression)})) ${this.block(s.statement)}`);
      // A key the body reassigns: a variable of each key (Kotlin's loop variable is a val).
      return this.loopBody(() => {
        const label = this.takeLabel();
        const key = this.fresh('__key');
        const body = this.block(s.statement);
        return `${i}${label}for (${key} in jsKeysOf(${this.expr(s.expression)})) {\n${this.nested(() => this.bindTo(list.declarations[0].name, key, '', true))}\n${body.slice(2)}`;
      });
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
    // A block declaring nothing needs no scope of its own: its statements, in place.
    if (ts.isBlock(s) && !s.statements.some((x) => ts.isVariableStatement(x) || ts.isFunctionDeclaration(x) || ts.isClassDeclaration(x))) return this.statements([...s.statements]).join('\n');
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
      if (ts.isClassDeclaration(s) && this.capturesNothing(s)) {
        // Core's and plugins' lazily defined classes (`@NativeClass class Impl extends android.…` inside `initializeX()`): declared once, at the top level.
        const saved = this.indent;
        try { this.hoisted.push(this.classDecl(s)); } finally { this.indent = saved; }
        return '';
      }
      // Library mode: one reading the function's locals (`RoleTypeMap`) is Kotlin's local class, which captures them.
      if (ts.isClassDeclaration(s) && this.library) {
        const saved = this.indent;
        try { return this.classDecl(s).split('\n').map((l) => saved + l).join('\n'); } finally { this.indent = saved; }
      }
      if (ts.isClassDeclaration(s)) throw this.error(s, `a class declared inside a function${this.captured.has(s) ? ` (reading its ${this.captured.get(s)})` : ''}`);
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
    // A `let` or `var` set once, where it is declared, is a constant too.
    const once = (d: ts.VariableDeclaration) => (!lowered || ts.isForStatement(list.parent)) && !!d.initializer && ts.isIdentifier(d.name) && !redeclaredVar(d, this.checker)
      && (this.checker.getSymbolAtLocation(d.name)?.declarations?.length ?? 0) === 1
      && !assignsTo(ts.findAncestor(d, (n) => ts.isFunctionLike(n) || ts.isSourceFile(n))!, this.checker.getSymbolAtLocation(d.name), this.checker);
    return list.declarations.map((d) => this.declaration(d, constant || once(d), lowered)).join('\n');
  }

  declaration(d: ts.VariableDeclaration, constant: boolean, lowered: boolean): string {
    const i = this.indent;
    const extension = this.native?.extensionClass(d);
    if (extension) return extension;
    if (this.patterns.requiredCore(d) || this.native?.isClassAlias(d)) return '';
    if (ts.isIdentifier(d.name)) {
      // A variable only ever undefined (this platform's half of `__APPLE__ ? x : undefined`) holds nothing: any value.
      let t = this.typeOf(d.name) === 'Unit' ? 'Any?' : this.typeOf(d.name);
      const parts = this.literalFunctionLocal(d) ? functionTypeParts(t) : null;
      if (parts) t = `(${parts.params.map((p) => (this.isObjectType(p) ? optionalType(p) : p)).join(', ')}) -> ${parts.ret}`;
      const name = ident(d.name.text);
      if (this.forwardDeclared.has(d) || this.scopedDeclared.has(d)) return d.initializer ? `${i}${name} = ${this.stored(d.initializer, d, t)}` : '';
      // `var m` again in the same block: the same variable, assigned.
      if (redeclaredVar(d, this.checker)) return d.initializer ? `${i}${name} = ${this.stored(d.initializer, d, t)}` : '';
      if (this.states.nullishHeld(d)) return `${i}${constant && (!lowered || ts.isForStatement(d.parent.parent)) ? 'val' : 'var'} ${name}: ${t} = ${d.initializer ? this.stored(d.initializer, d, t) : 'JSNullish.Undefined'}`;
      const nullInit = !!d.initializer && (d.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d.initializer) && d.initializer.text === 'undefined'));
      if ((nullInit || (!d.initializer && !lowered)) && this.pluginFiles.has(d.getSourceFile().fileName) && !t.endsWith('?') && this.isObjectType(t)) {
        // Unset (or `null`) in code checked without strictNullChecks: nullable, unwrapped where it is read.
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}var ${name}: ${optionalType(t)} = null`;
      }
      // Library mode: a string declared unset and set null somewhere (`let uri: string; ... uri = null`): null until set, as Java takes it.
      if (this.library && !d.initializer && !lowered && t === 'String' && this.assignedNull(d)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}var ${name}: String? = null`;
      }
      // Library mode: `a ?? null`, `a || null`: nullable, whatever the type (unchecked for null) says.
      const orNull = !!d.initializer && ts.isBinaryExpression(d.initializer) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(d.initializer.operatorToken.kind) && d.initializer.right.kind === ts.SyntaxKind.NullKeyword;
      if (this.library && orNull && !lowered && !t.endsWith('?') && t !== 'Any' && (this.isObjectType(t) || isFunctionType(t))) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer!, d, optionalType(t))}`;
      }
      // Library mode: `const title = view['title'] as string`, `let result = this._cache[key]`: nullable, as the member may be missing.
      const recordRead = !!d.initializer && ts.isElementAccessExpression(d.initializer) && !d.initializer.questionDotToken && (/^JSRecord<.*>\??$/.test(this.typeOf(d.initializer.expression)) || (this.typeOf(d.initializer.expression) === 'Any?' && ['String', 'Double', 'Boolean'].includes(t))) && !isNullable(t) && t !== 'Any';
      // So is a function read from an untyped object (`const getItem = (<ItemsSource>src).getItem`), which it may lack.
      let read = d.initializer;
      while (read && (ts.isParenthesizedExpression(read) || ts.isAsExpression(read) || ts.isTypeAssertionExpression(read))) read = read.expression;
      const untypedRead = (x: ts.Expression): boolean => {
        while (ts.isParenthesizedExpression(x) || ts.isAsExpression(x) || ts.isTypeAssertionExpression(x)) x = x.expression;
        if (ts.isPropertyAccessExpression(x)) return this.typeOf(x.expression) === 'Any?';
        if (ts.isBinaryExpression(x) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(x.operatorToken.kind)) return untypedRead(x.left) || untypedRead(x.right);
        if (ts.isConditionalExpression(x)) return untypedRead(x.whenTrue) || untypedRead(x.whenFalse);
        return false;
      };
      const untypedFunction = !!read && isFunctionType(t) && untypedRead(read);
      if (this.library && d.initializer && !lowered && (this.untypedAssertion(d.initializer) || recordRead || untypedFunction)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer, d, optionalType(t))}`;
      }
      // Library mode: a call's `string | null`, compared with null: nullable.
      const call = read && ts.isCallExpression(read) ? this.checker.getResolvedSignature(read)?.declaration : undefined;
      if (this.library && d.initializer && !lowered && ['String', 'Double', 'Boolean'].includes(t) && this.nullablePrimitiveReturn(call) && this.testedForUndefined(d)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer, d, optionalType(t))}`;
      }
      // Library mode: a copy of a getter's `string | undefined` the code tests or unsets (`namespace = undefined`): nullable.
      if (this.library && read && ts.isPropertyAccessExpression(read) && !lowered && ['String', 'Double', 'Boolean'].includes(t) && isNullable(this.declaredTypeOf(read) ?? '') && (this.testedForUndefined(d) || this.assignedNull(d))) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer!, d, optionalType(t))}`;
      }
      // Library mode: `a && b`, compared with null: whatever `b`'s type, null where `a` is.
      if (this.library && read && ts.isBinaryExpression(read) && read.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && !lowered && ['String', 'Double', 'Boolean'].includes(t) && this.testedForUndefined(d)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer!, d, optionalType(t))}`;
      }
      // Library mode: a registered property's string, number or boolean (`const title = this.title`), compared with undefined:
      // undefined while unset, which its accessor reads as the type's zero.
      const registered = read && ts.isPropertyAccessExpression(read) ? this.resolve(read.name)?.valueDeclaration : undefined;
      if (this.library && read && ts.isPropertyAccessExpression(read) && !lowered && ['String', 'Double', 'Boolean'].includes(t) && registered && ts.isPropertyDeclaration(registered) && ts.isClassLike(registered.parent)
          && (this.properties?.isRegistered(registered.parent, read.name.text) || this.properties?.isRegisteredAnywhere(read.name.text)) && this.testedForUndefined(d)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        const value = `jsExpandoGet(${this.expr(read.expression)}, ${kotlinString(read.name.text)})`;
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${t === 'String' ? `jsStringOrNull(${value})` : `(${value} as? ${t})`}`;
      }
      // A plugin's copy of a value declared nullable (`const side = this.mShowingSide`): nullable as well.
      if (d.initializer && !lowered && this.pluginFiles.has(d.getSourceFile().fileName) && !isNullable(t) && t !== 'Any' && t !== 'Any?' && isNullable(this.declaredTypeOf(d.initializer) ?? '')) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${this.stored(d.initializer, d, optionalType(t))}`;
      }
      // A plugin's object variable that code assigns again (`parent = parent.parent` until there is none): nullable as well.
      if (d.initializer && !constant && !lowered && this.pluginFiles.has(d.getSourceFile().fileName) && !t.endsWith('?') && this.isObjectType(t) && !isFunctionType(t)) {
        const sym = this.checker.getSymbolAtLocation(d.name);
        if (sym) this.nullableDecls.add(sym);
        return `${i}var ${name}: ${optionalType(t)} = ${this.stored(d.initializer, d, optionalType(t))}`;
      }
      // A literal first value nothing reads (`let fps = 0` set again before any read) is left out.
      const deadLiteral = !!d.initializer && !constant && this.isConstant(d.initializer) && !this.pluginFiles.has(d.getSourceFile().fileName);
      const set = (!d.initializer || deadLiteral) && !lowered ? this.assignedBeforeUse(d) : null;
      if (set) return `${i}${set === 'once' ? 'val' : 'var'} ${name}: ${t}`;
      // Lenient code may read it before any assignment (`let found: boolean; … typeof found`): undefined until assigned.
      if (!d.initializer && (this.lenient || this.lenientApp) && !lowered && ['String', 'Double', 'Boolean'].includes(t) && !this.assignedBeforeUse(d, true)) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        return `${i}var ${name}: ${optionalType(t)} = null`;
      }
      if (!d.initializer) return `${i}${lowered || !t.endsWith('?') ? this.deferredDeclaration(name, t) : `var ${name}: ${t} = null`}`;
      // A value whose functions name it (a function calling itself, a listener removing itself): declared first, so they can.
      if (refersTo(d.initializer, this.checker.getSymbolAtLocation(d.name), this.checker)) {
        return `${i}${t.endsWith('?') ? `var ${name}: ${t} = null` : this.deferredDeclaration(name, t)}\n${i}${name} = ${this.stored(d.initializer, d, t)}`;
      }
      const maybe = (!lowered || ts.isAwaitExpression(ts.skipOuterExpressions(d.initializer))) && !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
      this.noteNullVar(d);
      if (maybe) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        // An untyped value (`args[1]` of `...args`) where the declaration names a type: as that type.
        const read = (this.typeOf(d.initializer) === 'Any?' || this.untypedElement(d.initializer)) && t !== 'Any?' ? this.checkedPlacement(d.initializer, optionalType(t), maybe, this.storeSlot(d.initializer, optionalType(t), d)) ?? this.fromAny(maybe, optionalType(t)) : maybe;
        return `${i}${constant ? 'val' : 'var'} ${name}: ${optionalType(t)} = ${read}`;
      }
      // An untyped value asserted a Java class its uses need only a superclass of: held as that class, unchecked as script's assertion is.
      const wider = !this.library && ts.isIdentifier(d.name) ? this.widerAsserted(d) : null;
      if (wider) {
        const inner = (ts.skipOuterExpressions(d.initializer, ts.OuterExpressionKinds.Parentheses) as ts.AsExpression).expression;
        return `${i}${constant && (!lowered || ts.isForStatement(d.parent.parent)) ? 'val' : 'var'} ${name}: ${wider} = jsUnchecked<${wider}>(jsJavaArgument(${this.coerce(inner, 'Any?')}))`;
      }
      // Library mode: a function value's own Kotlin type, its parameters as lenient as its calls pass them.
      if (this.library && constant && !lowered && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) && d.initializer.parameters.some((p) => this.states.mayBeNull(p))) return `${i}val ${name} = ${this.stored(d.initializer, d, t)}`;
      if (parts && !lowered) {
        let literal = d.initializer;
        while (ts.isParenthesizedExpression(literal)) literal = literal.expression;
        return `${i}val ${name}: ${t} = ${this.closure(literal as ts.ArrowFunction | ts.FunctionExpression)}`;
      }
      return `${i}${constant && (!lowered || ts.isForStatement(d.parent.parent)) ? 'val' : 'var'} ${name}: ${t} = ${this.stored(d.initializer, d, t)}`;
    }
    const tmp = this.fresh('__d');
    return `${i}val ${tmp}${this.destructured(d.name, d.initializer!)}\n${this.bindTo(d.name, tmp, this.untypedPattern(d.name, d.initializer!) ? 'Any?' : '', !constant)}`;
  }

  /** Declarations binding `name` (an identifier or a destructuring pattern) to the Kotlin value `value`. */
  /** `type` is `Any?` where the value is untyped whatever the pattern's type says. */
  bindTo(name: ts.BindingName, value: string, type: string, mutable: boolean | 'assign'): string {
    const i = this.indent;
    const kw = mutable === 'assign' ? '' : mutable ? 'var ' : 'val ';
    const declare = (n: ts.Identifier, t: string, v: string) => {
      if (mutable === 'assign') return `${i}${ident(this.topName(n.parent, n.text))} = ${v}`;
      // Lenient code: an object a destructuring binds may be undefined (a field left unset): nullable, unwrapped where it is read.
      if (this.library && ((ts.isObjectBindingPattern(name) && this.isObjectType(t)) || (ts.isArrayBindingPattern(name) && ['String', 'Double', 'Boolean'].includes(t))) && !isNullable(t) && !isFunctionType(t)) {
        const sym = this.checker.getSymbolAtLocation(n);
        if (sym) this.nullableDecls.add(sym);
        return `${i}${kw}${ident(n.text)}: ${optionalType(t)} = ${v}`;
      }
      return `${i}${kw}${ident(n.text)}: ${t} = ${v}`;
    };
    if (ts.isIdentifier(name)) return declare(name, this.typeOf(name), type === 'Any?' && this.typeOf(name) !== 'Any?' ? this.fromAnyCode(value, this.typeOf(name), true) : value);
    const lines: string[] = [];
    const source = this.checker.getTypeAtLocation(name);
    const tuple = this.checker.isTupleType(source) ? this.checker.getTypeArguments(source as ts.TypeReference).length : 0;
    // A tuple of more than three elements is an untyped array: each element read as the pattern types it.
    const elementType = (k: number) => this.typeOf((name.elements[k] as ts.BindingElement).name);
    const tupleField = (k: number) => (type === 'Any?' ? this.fromAnyCode(`jsField(${value}, "${k}")`, elementType(k), true) : tuple === 2 || tuple === 3 ? `${value}.${['first', 'second', 'third'][k]}`
      : elementType(k) === 'Any?' ? `${value}[${k}]` : this.fromAnyCode(`${value}[${k}]`, elementType(k), true));
    name.elements.forEach((el, k) => {
      if (ts.isOmittedExpression(el)) return;
      if (el.dotDotDotToken) {
        if (ts.isObjectBindingPattern(name)) {
          const taken = name.elements.filter((x) => x !== el).map((x) => {
            const key = x.propertyName ?? x.name;
            if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) throw this.error(x, 'a computed key beside an object rest pattern');
            return kotlinString(key.text);
          });
          lines.push(this.bindTo(el.name, `jsObjectRest(${value}, listOf(${taken.join(', ')}))`, 'Any?', mutable));
          return;
        }
        // A Pair or Triple's fields from here on, as the array the rest element makes.
        if ((tuple === 2 || tuple === 3) && type !== 'Any?') {
          const restType = this.typeOf(el.name).replace(/\?$/, '');
          const args = this.checker.getTypeArguments(source as ts.TypeReference);
          const field = (j: number) => `${value}.${['first', 'second', 'third'][j]}`;
          // What remains is a tuple again (a Pair) where two fields do, else an array.
          const pairLike = /^(Pair|Triple)</.test(restType);
          const element = restType.replace(/^JSArray<(.*)>$/, '$1');
          const fields = Array.from({ length: tuple - k }, (_, j) => (pairLike ? field(k + j) : this.convert(field(k + j), this.type(args[k + j], el), element)));
          lines.push(this.bindTo(el.name, pairLike ? `${restType}(${fields.join(', ')})` : `jsArrayOf<${element}>(${fields.join(', ')})`, '', mutable));
          return;
        }
        lines.push(this.bindTo(el.name, `${value}.slice(${k}.0)`, '', mutable));
        return;
      }
      let read: string;
      const t = this.typeOf(el.name);
      if (ts.isObjectBindingPattern(name)) {
        const key = (el.propertyName ?? el.name).getText();
        const record = /^JSRecord<(.*)>$/.exec(this.typeOf(name).replace(/\?$/, ''));
        const defined = this.definedField(name, key);
        read = this.isAny(name) || type === 'Any?' ? `jsGet(${value}, ${kotlinString(key)})` : defined ? this.fromAnyCode(`jsGet(${value}, ${kotlinString(key)})`, this.typeOf(defined.name!), true) : record ? this.undefinedAs(`${value}[${kotlinString(key)}]`, ts.isIdentifier(el.name) ? this.typeOf(el.name) : record[1]) : `${value}.${ident(key)}`;
        // Lenient code: a field Kotlin declares nullable (optional, or left unset) binds as its type reads undefined.
        const field = !this.isAny(name) && !record && this.lenient ? this.checker.getTypeAtLocation(name).getProperty(key) : undefined;
        const fd = field?.valueDeclaration;
        if (field && !el.initializer && !isNullable(t) && t !== 'Any?' && (this.nullableDecls.has(field) || (fd && (ts.isPropertySignature(fd) || ts.isPropertyDeclaration(fd)) && fd.questionToken))) read = this.undefinedAs(read, t);
        // Library mode: a literal the pattern gives untyped fields (`{ m: r, m: g } = { m: … }`) builds them as `Any?`.
        const literal = ts.isVariableDeclaration(name.parent) && name.parent.initializer && ts.isObjectLiteralExpression(name.parent.initializer) ? name.parent.initializer : undefined;
        const built = literal && this.checker.getContextualType(literal)?.getProperty(key);
        if (this.library && built && t !== 'Any?' && this.type(this.checker.getTypeOfSymbolAtLocation(built, literal!), literal) === 'Any?') read = this.fromAnyCode(read, t, true);
      } else if (tuple && type === 'Any?' && !ts.isIdentifier(el.name) && !this.isAny(el.name)) read = `jsField(${value}, "${k}")`;
      else if (tuple) read = (type === 'Any?' && ts.isIdentifier(el.name) && !el.initializer && this.checkedBinding(el, `jsField(${value}, "${k}")`, elementType(k))) || tupleField(k);
      else if (type === 'Any?') read = `jsGet(${value}, "${k}")`;
      else {
        // An array pattern past the array's end binds undefined.
        read = `${value}.element(${k}.0)`;
        if (this.matchGroupBinding(el) && ts.isIdentifier(el.name)) {
          const sym = this.resolve(el.name);
          if (sym) this.undefinedVars.set(sym, 'String?');
          lines.push(mutable === 'assign' ? `${i}${ident(this.topName(el, el.name.text))} = ${read}` : `${i}${kw}${ident(el.name.text)}: String? = ${read}`);
          return;
        }
        // Library mode: past the array's end binds undefined, which the binding holds as null.
        if (!el.initializer && !t.endsWith('?') && !(this.library && ['String', 'Double', 'Boolean'].includes(t) && mutable !== 'assign')) {
          // A string, number or boolean the code tests (`second ? … : …`) is held as null past the end: undefined is falsy, "undefined" is not.
          if (!this.library && mutable !== 'assign' && ts.isIdentifier(el.name) && ['String', 'Double', 'Boolean'].includes(t) && this.truthTested(el.name)) {
            const sym = this.checker.getSymbolAtLocation(el.name);
            if (sym) this.nullableDecls.add(sym);
            lines.push(`${i}${kw}${ident(el.name.text)}: ${optionalType(t)} = ${read}`);
            return;
          }
          read = this.undefinedAs(read, t);
        }
      }
      if (el.initializer) read = `(${read} ?: ${this.coerce(el.initializer, t)})`;
      if (ts.isIdentifier(el.name)) {
        const fromAny = (this.isAny(name) || (type === 'Any?' && !tuple)) && t !== 'Any?' ? this.checkedBinding(el, read, t) ?? this.fromAny(read, t) : read;
        lines.push(declare(el.name, t, fromAny));
      } else {
        const tmp = this.fresh('__d');
        // A typed pattern's part of an untyped value is untyped too.
        const untypedPart = (this.isAny(name) || type === 'Any?') && !this.isAny(el.name);
        lines.push(`${i}val ${tmp} = ${read}`, this.bindTo(el.name, tmp, untypedPart ? 'Any?' : '', mutable));
      }
    });
    return lines.join('\n');
  }

  /** `for (x of xs)` and `for ([k, v] of map)`: each value assigned to variables or members declared elsewhere. */
  private forOfExisting(s: ts.ForOfStatement, target: ts.Expression): string {
    const i = this.indent;
    const item = this.fresh('__item');
    const iterated = this.forOfValueType(s.expression);
    const typed = !!iterated && !this.jsIteration(s.expression) && this.typeOf(s.expression) !== 'Any?';
    const seq = typed ? this.iterable(s.expression) : `jsIteratorOf(${this.coerce(s.expression, 'Any?')}).jsCollect()`;
    const assigns: string[] = [];
    const to = ts.skipOuterExpressions(target, ts.OuterExpressionKinds.Parentheses);
    if (ts.isArrayLiteralExpression(to) || ts.isObjectLiteralExpression(to)) this.assignPattern(to, item, typed ? iterated : null, assigns);
    else {
      const want = this.typeOf(to);
      const from = typed ? this.type(iterated!, to) : 'Any?';
      assigns.push(`${this.lvalue(to)} = ${from === 'Any?' ? this.checkedBinding(to, item, want) ?? this.fromAnyCode(item, want, true) : this.convert(item, from, want)}`);
    }
    return this.loopBody(() => {
      const label = this.takeLabel();
      const body = this.block(s.statement);
      return `${i}${label}for (${item} in ${seq}) {\n${assigns.map((a) => `${i}    ${a}`).join('\n')}\n${body.slice(2)}`;
    });
  }

  /** The type of the values `for…of` gives, by the iterable's type; null where its iteration is unknown. */
  private forOfValueType(e: ts.Expression): ts.Type | null {
    const t = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e));
    if (this.checker.isArrayType(t)) return this.checker.getTypeArguments(t as ts.TypeReference)[0];
    if (t.flags & ts.TypeFlags.StringLike) return this.checker.getStringType();
    return iteratedType(t, this.checker, e) ?? null;
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

  /** A groupBy callback's function type: the item and its index, as many as a literal declares (at least the item, as the runtime's overloads take). */
  private groupKeySlot(items: ts.Expression, f: ts.Expression, key: string): string {
    const arity = ts.isArrowFunction(f) || ts.isFunctionExpression(f) ? Math.max(1, f.parameters.length) : this.functionArity(f);
    return `(${[this.elementTypeOf(items), 'Double'].slice(0, Math.min(2, arity)).join(', ')}) -> ${key}`;
  }

  elementTypeOf(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (/^JS(Array|Set|Iterator|Generator|Iterable|AsyncIterator|AsyncGenerator|AsyncIterable)<.*>\??$/.test(t)) return t.replace(/^JS\w+<(.*)>\??$/, '$1');
    const async = ts.isForOfStatement(e.parent) && !!e.parent.awaitModifier;
    const el = iteratedType(this.checker.getTypeAtLocation(e), this.checker, e, async);
    return el ? this.type(el, e) : 'Any?';
  }

  /** An app's method whose Kotlin signature is its own: no base, interface or override shares it. */
  private ownSignatureMethod(m: ts.Node): m is ts.MethodDeclaration {
    if (!ts.isMethodDeclaration(m) || isStatic(m) || !ts.isClassDeclaration(m.parent) || /^\$[be]\d+$/.test(m.name.getText()) || this.pluginFiles.has(m.getSourceFile().fileName)) return false;
    let known = this.ownSignatures.get(m);
    if (known !== undefined) return known;
    const name = m.name.getText(), cls = m.parent;
    const t = this.checker.getTypeAtLocation(cls);
    const inherited = (t.isClassOrInterface() ? this.checker.getBaseTypes(t) : []).some((b) => !!b.getProperty(name))
      || (cls.heritageClauses ?? []).some((h) => h.token === ts.SyntaxKind.ImplementsKeyword && h.types.some((x) => !!this.checker.getTypeAtLocation(x).getProperty(name)));
    const overridden = this.sourceFiles.some((sf) => !sf.isDeclarationFile && sf.statements.some((st) => ts.isClassDeclaration(st) && st !== cls
      && st.members.some((x) => x.name?.getText() === name) && (() => { for (let b = this.baseClassOf(st); b; b = this.baseClassOf(b)) if (b === cls) return true; return false; })()));
    known = !inherited && !overridden;
    this.ownSignatures.set(m, known);
    return known;
  }
  private ownSignatures = new Map<ts.Node, boolean>();

  heldAwait(a: ts.AwaitExpression, v: string): [string, string] | undefined {
    // Objects are held as their type says (an unchecked null): only strings, numbers and booleans are nullable.
    const slot = awaitSlot(this.placement, a, v, (t) => ['String', 'Double', 'Boolean'].includes(t));
    if (!slot) return undefined;
    this.awaitSlots.set(a, slot);
    return [slot.target, this.awaitedValue(slot)];
  }
  /** The await's value read from its slot (U → P by kind): a null-only body's nothing reads as null does. */
  private awaitedValue(slot: AwaitSlot): string {
    const t = this.typeOf(slot.a);
    if (!slot.isNull) return this.undefinedAs(slot.raw, t);
    return `(${slot.raw} ?: ${t === 'Double' ? '0.0' : t === 'String' ? '"null"' : 'false'})`;
  }
  private readonly awaitSlots = new Map<ts.Node, AwaitSlot>();
  /** The slot of the await `e` is, where its continuation holds the value nullable. */
  private awaited(e: ts.Expression): AwaitSlot | undefined {
    return this.awaitSlots.get(ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses));
  }
  private noteNullVar(d: ts.VariableDeclaration): void {
    const init = d.initializer && ts.skipOuterExpressions(d.initializer, ts.OuterExpressionKinds.Parentheses);
    const sym = ts.isIdentifier(d.name) ? this.resolve(d.name) : undefined;
    if (!init || !sym || !this.states.nullResult(init)) return;
    if (!reassigned(d, this.checker) || (!ts.isAwaitExpression(init) && onlyNullOrPresent(d, this.checker, (v) => !ts.isAwaitExpression(v) && this.states.nullResult(v)))) this.states.nullVars.add(sym);
    else if (ts.isAwaitExpression(init)) throw this.error(d, 'a variable holding the null a non-strict async function may give, assigned again');
  }

  /** A variable given a non-strict app's null-only result, by its initializer or a later `=`. */
  private givenNullResult(d: ts.VariableDeclaration): boolean {
    return givenBy(d, this.checker, (v) => !ts.isAwaitExpression(v) && this.states.nullResult(v));
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
    if (t === 'JSMatch') {
      const values = `${this.typeOf(e).endsWith('?') ? this.present(code, 'values', e) : code}.values`;
      return this.elementTypeOf(e) === 'String' && !this.unsetMatch(e) ? `jsIterator(JSArray(ArrayList(${values}.storage.map { it ?: "undefined" })))` : `jsIterator(${values})`;
    }
    // The generated kit's class gives its own generator, its element type erased.
    if (this.generatedKit && this.core?.has(t) && this.core.kitMember(t, 'jsSymbolIterator')?.type.startsWith('JSGenerator<')) return this.unchecked(`JSGenerator<${this.elementTypeOf(e)}>`, `${code}.jsSymbolIterator()`);
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

  /** A group an array pattern binds from a match (`const [, key, value] = re.exec(s)`): undefined where the group took no part. */
  private matchGroupBinding(el: ts.BindingElement): boolean {
    const pattern = el.parent;
    return !this.library && ts.isArrayBindingPattern(pattern) && pattern.elements.indexOf(el) > 0 && !el.initializer && !el.dotDotDotToken && ts.isIdentifier(el.name)
      && this.typeOf(el.name) === 'String' && this.typeOf(pattern).replace(/\?$/, '') === 'JSMatch';
  }

  /** A pattern reading from a value held `Any?` (`destructured` keeps it so) whose own type is not untyped. */
  private untypedPattern(name: ts.BindingName, init: ts.Expression): boolean {
    return !this.isAny(name) && !ts.isObjectLiteralExpression(init) && this.typeOf(init) === 'Any?' && !(ts.isArrayBindingPattern(name) && this.jsIteration(init));
  }

  /** The type and value a destructuring pattern reads from: an iterator yields only as many values as an array pattern names. */
  private destructured(name: ts.BindingName, init: ts.Expression): string {
    // A match reads its values as an array does.
    const js = ts.isArrayBindingPattern(name) && !/^JSMatch\??$/.test(this.typeOf(init)) ? this.jsIteration(init) : null;
    // A literal builds a shape class of its own, which the pattern's contextual shape need not be.
    if (!js) return ts.isObjectLiteralExpression(init) ? ` = ${this.expr(init)}` : `: ${this.typeOf(init)} = ${this.coerce(init, this.typeOf(init))}`;
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
    const captured = list && list.flags & ts.NodeFlags.Let && list.declarations.some((d) => ts.isIdentifier(d.name) && capturedIn(d.name, s.statement, this.checker));
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
        lines.push(`${i}        try {`, `${i}            if (!${first}) { ${step} }`, `${i}            ${first} = false`, ...(cond === 'true' ? [] : [`${i}            if (!(${cond})) break`]), `${i}            run ${body}`, `${i}        } finally { ${names.map((n, k) => `${outer[k]} = ${n}`).join('; ')} }`, `${i}    }`, `${i}}`);
        return lines.join('\n');
      }
      if (!step) return `${init ? init + '\n' : ''}${i}${label}while (${cond}) ${this.block(s.statement)}`;
      if (hasContinue) {
        const first = this.fresh('__first');
        return `${init ? init + '\n' : ''}${i}var ${first} = true\n${i}${label}while (true) {\n${i}    if (!${first}) { ${step} }\n${i}    ${first} = false\n${cond === 'true' ? '' : `${i}    if (!(${cond})) break\n`}${i}    run ${this.nested(() => this.block(s.statement))}\n${i}}`;
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
    const clauses = s.caseBlock.clauses;
    const missing = (x: ts.Expression) => x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    // `case undefined:` on a string or boolean: the subject held nullable, as its missing value reads "undefined" otherwise.
    const nullCase = clauses.some((c) => ts.isCaseClause(c) && missing(c.expression));
    const declared = this.typeOf(s.expression);
    const st = nullCase && ['String', 'Boolean'].includes(declared) ? `${declared}?` : declared;
    const lines = [`${i}run ${label}@ {`, `${i}    val ${subject}: ${st} = ${st === declared ? this.expr(s.expression) : this.coerce(s.expression, st)}`];
    // A case testing what an earlier one tests (`case undefined: case null:`) is never the one chosen: left out.
    const tests = new Map<string, number>();
    clauses.forEach((c, k) => {
      if (!ts.isCaseClause(c)) return;
      const eq = missing(c.expression) && st !== 'Any?' && isNullable(st) ? `${subject} == null`
        : missing(c.expression) && st === 'Double' ? `${subject}.isNaN()`
        : st === 'Any?' || this.typeOf(c.expression) === 'Any?' || /^[A-Z]\??$/.test(st) ? `jsStrictEquals(${subject}, ${this.coerce(c.expression, 'Any?')})` : this.isObjectType(st) ? `${subject} === ${this.expr(c.expression)}` : `${subject} == ${this.coerce(c.expression, st.replace(/\?$/, ''))}`;
      if (!tests.has(eq)) tests.set(eq, k);
    });
    const fallback = clauses.findIndex(ts.isDefaultClause);
    lines.push(`${i}    val ${start} = when {`, ...[...tests].map(([eq, k]) => `${i}        ${eq} -> ${k}`), `${i}        else -> ${fallback >= 0 ? fallback : clauses.length}`, `${i}    }`);
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
      const body = this.block(s.catchClause.block);
      const block = s.catchClause.block;
      const names = binding ? boundNames(binding.name) : [];
      const bind = names.some((n) => mentions(body, ident(n.text)))
        ? this.nested(() => this.bindTo(binding!.name, `jsCaught(${caught})`, '', names.some((n) => assignsTo(block, this.checker.getSymbolAtLocation(n), this.checker)))) + '\n'
        : '';
      code += ` catch (${caught}: Throwable) {\n${bind}${body.slice(2)}`;
    }
    if (s.finallyBlock) code += ` finally ${this.block(s.finallyBlock)}`;
    return code;
  }

  exprStatement(e: ts.Expression): string {
    const rw = readWrite(e, this.checker);
    if (rw?.held.length && !rw.held.some((h) => this.subst.has(h))) return this.readWriteCode(e, rw);
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
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isObjectLiteralExpression(e.left) || ts.isArrayLiteralExpression(e.left))) {
      // The right side is evaluated before any target is written (`[a, b] = [b, a]`).
      const tmp = this.fresh('__swap');
      const assigns: string[] = [];
      this.assignPattern(e.left, tmp, this.untypedSource(e.right) ? null : this.checker.getTypeAtLocation(e.right), assigns);
      return `run { val ${tmp} = ${this.expr(e.right)}; ${assigns.join('; ')} }`;
    }
    if ((ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(e.operator)) {
      if (ts.isElementAccessExpression(e.operand) && this.typeOf(e.operand.expression).replace(/\?$/, '').startsWith('JSRecord<')) return this.readWriteValue(e);
      const place = this.untypedPlace(e.operand);
      if (place) return `jsSet(${place.obj}, ${place.key}, jsToNumber(jsGet(${place.obj}, ${place.key})) ${e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} 1.0)`;
      // Lenient code: a number left unset (Kotlin's `Double?`), NaN until assigned.
      if (this.lenient && this.typeOf(e.operand) === 'Double' && this.declaredTypeOf(e.operand) === 'Double?') return `${this.lvalue(e.operand)} = ${this.undefinedAs(this.expr(e.operand), 'Double')} ${e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} 1.0`;
    }
    if (ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) {
      // An untyped variable (`let i = recursiveIndex`) holds the number the operation gives.
      if (this.isAny(e.operand) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(e.operator)) return `${this.lvalue(e.operand)} = ${this.toNumber(e.operand)} ${e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} 1.0`;
      if (e.operator === ts.SyntaxKind.PlusPlusToken) return `${this.lvalue(e.operand)} += ${this.one(e.operand)}`;
      if (e.operator === ts.SyntaxKind.MinusMinusToken) return `${this.lvalue(e.operand)} -= ${this.one(e.operand)}`;
    }
    if (ts.isAwaitExpression(e) && this.subst.has(e)) return this.subst.get(e)!;
    if (ts.isParenthesizedExpression(e)) return this.exprStatement(e.expression);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.CommaToken) return `${this.exprStatement(e.left)}; ${this.exprStatement(e.right)}`;
    if (ts.isVoidExpression(e)) return this.exprStatement(e.expression);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !this.subst.has(e)) return this.binary(e);
    const code = this.expr(e);
    // A value converted to nothing (`run { call(); Unit }`) where nothing reads it: what gives the value, alone.
    const m = ts.isCallExpression(e) ? this.markOf(code) : undefined;
    const inner = m?.op === 'discarded' ? m.of.code : null;
    return inner && oneExpression(inner) ? inner : code;
  }

  /** Whether a destructuring assignment's source is read by key, as script holds it. */
  private untypedSource(e: ts.Expression): boolean {
    return this.isAny(e) || this.typeOf(e) === 'Any?';
  }

  /**
   * Statements assigning `value` to a destructuring assignment's target: a variable or member, or a nested array or
   * object pattern whose elements take their defaults where the value reads undefined. `source` is the value's
   * TypeScript type, which decides how Kotlin holds it (a Pair or Triple for a short tuple); null where it is untyped.
   */
  private assignPattern(target: ts.Expression, value: string, source: ts.Type | null, out: string[]): void {
    type Read = { code: string; type: string; ts: ts.Type | null };
    const held = source ? this.type(source, target).replace(/\?$/, '') : 'Any?';
    const untyped = !source || held === 'Any' || held === 'JSObject';
    const fields = ['first', 'second', 'third'];
    const tupleArgs = source && this.checker.isTupleType(source) ? this.checker.getTypeArguments(source as ts.TypeReference) : null;
    const pairLike = /^(Pair|Triple)</.test(held) && !!tupleArgs;
    const element = (k: number): Read => {
      if (untyped) return { code: `jsField(${value}, "${k}")`, type: 'Any?', ts: null };
      if (pairLike) return { code: `${value}.${fields[k]}`, type: this.type(tupleArgs![k], target), ts: tupleArgs![k] };
      const array = /^JSArray<(.*)>$/.exec(held);
      if (!array) throw this.error(target, `destructuring a ${held}`);
      // Past the end reads undefined.
      const el = tupleArgs ? tupleArgs[k] ?? null : this.checker.isArrayType(source!) ? this.checker.getTypeArguments(source as ts.TypeReference)[0] : null;
      return { code: `${value}.element(${k}.0)`, type: optionalType(array[1]), ts: array[1] === 'Any?' ? null : el };
    };
    const property = (key: string, at: ts.Node): Read => {
      const record = /^JSRecord<(.*)>$/.exec(held);
      if (record) return { code: `${value}[${kotlinString(key)}]`, type: optionalType(record[1]), ts: source!.getStringIndexType() ?? null };
      const prop = untyped ? undefined : source!.getProperty(key);
      if (!prop) return { code: `jsGet(${value}, ${kotlinString(key)})`, type: 'Any?', ts: null };
      const t = this.checker.getTypeOfSymbolAtLocation(prop, at);
      return { code: `${value}.${ident(key)}`, type: this.type(t, at), ts: t };
    };
    const assign = (to: ts.Expression, read: Read, init?: ts.Expression) => {
      to = ts.skipOuterExpressions(to, ts.OuterExpressionKinds.Parentheses);
      if (ts.isArrayLiteralExpression(to) || ts.isObjectLiteralExpression(to)) {
        const inner = read.ts && read.type !== 'Any?' ? this.checker.getNonNullableType(read.ts) : null;
        const want = inner ? this.type(inner, to) : 'Any?';
        // A nested pattern of undefined throws, as JavaScript's destructuring does.
        const code = !inner ? (init ? `(${read.code} ?: ${this.coerce(init, 'Any?')})` : read.code)
          : !isNullable(read.type) ? read.code
          : init ? `(${read.code} ?: ${this.coerce(init, want)})` : this.asserted(read.code);
        const tmp = this.fresh('__d');
        out.push(`val ${tmp} = ${code}`);
        this.assignPattern(to, tmp, inner, out);
        return;
      }
      const want = this.typeOf(to);
      let code: string;
      const untypedRead = (c: string) => (['String', 'Double', 'Boolean'].includes(want) ? this.fromAnyCode(c, want, true) : this.fromAny(c, want));
      if (read.type === 'Any?') {
        const c = init ? `(${read.code} ?: ${this.coerce(init, 'Any?')})` : read.code;
        code = this.checkedBinding(to, c, want) ?? untypedRead(c);
      }
      else if (init && isNullable(read.type)) code = `(${this.convert(read.code, read.type, optionalType(want))} ?: ${this.coerce(init, want)})`;
      else if (read.type === optionalType(want) && read.type !== want) code = this.undefinedAs(read.code, want);
      else code = this.convert(read.code, read.type, want);
      const place = this.untypedPlace(to);
      out.push(place ? `jsSet(${place.obj}, ${place.key}, ${code})` : `${this.lvalue(to)} = ${code}`);
    };
    const withDefault = (x: ts.Expression): [ts.Expression, ts.Expression | undefined] =>
      ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken ? [x.left, x.right] : [x, undefined];
    if (ts.isArrayLiteralExpression(target)) {
      target.elements.forEach((x, k) => {
        if (ts.isOmittedExpression(x)) return;
        if (!ts.isSpreadElement(x)) {
          const [to, init] = withDefault(x);
          assign(to, element(k), init);
          return;
        }
        const want = this.typeOf(x.expression);
        let rest: string;
        if (untyped) rest = this.fromAnyCode(`jsCallMethod(${value}, "slice", ${k}.0)`, want, true);
        else if (pairLike) {
          // A Pair's or Triple's fields from here on, as an array.
          const el = want.replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1');
          rest = `jsArrayOf<${el}>(${tupleArgs!.slice(k).map((a, j) => this.convert(`${value}.${fields[k + j]}`, this.type(a, x), el)).join(', ')})`;
        } else rest = this.convert(`${value}.slice(${k}.0)`, held, want);
        out.push(`${this.lvalue(x.expression)} = ${rest}`);
      });
      return;
    }
    if (!ts.isObjectLiteralExpression(target)) throw this.error(target, 'this destructuring target');
    const keys: string[] = [];
    for (const p of target.properties) {
      if (ts.isShorthandPropertyAssignment(p)) {
        keys.push(p.name.text);
        assign(p.name, property(p.name.text, p), p.objectAssignmentInitializer);
      } else if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name))) {
        keys.push(p.name.text);
        const [to, init] = withDefault(p.initializer);
        assign(to, property(p.name.text, p), init);
      } else if (ts.isSpreadAssignment(p)) {
        out.push(`${this.lvalue(p.expression)} = ${this.fromAny(`jsObjectRest(${value}, listOf(${keys.map(kotlinString).join(', ')}))`, this.typeOf(p.expression))}`);
      } else throw this.error(p, 'this member of a destructuring assignment');
    }
  }

  tryPrefix(_e: ts.Node): string {
    return '';
  }

  /** `x.hasOwnProperty`, `x.toString`: a method every object inherits, read on the object itself. */
  private objectMethod(e: ts.Node): boolean {
    return ts.isPropertyAccessExpression(e) && !!this.resolve(e.name)?.declarations?.every((d) => isLibDeclaration(d));
  }

  /** App code: an app enum named as a value (`Color`, `Shapes.Kind`), which is the object JavaScript makes of it. */
  private isEnumObject(e: ts.Expression): boolean {
    return isEnumObject(this.placement, e);
  }

  /** An expression where Kotlin needs a value of `target`. */
  coerce(e: ts.Expression, target: string | ResultSlot): string {
    return place(this.placement, e, target);
  }

  /** `e` stored by `at` (a declaration, an object literal's field, an assignment's target) where Kotlin holds `target`; `checks` as `storeSlot` has it. */
  private stored(e: ts.Expression, at: Store, target: string, checks = true): string {
    return place(this.placement, e, this.storeSlot(e, target, at, checks));
  }

  private storeSlot(e: ts.Expression, target: string, at: Store, checks = true): StoreSlot {
    return storeSlot(this.placement, target, at, e, checks);
  }

  /** The result slot of the function being translated, where `at` (a `return`, an expression body) gives its value. */
  private resultSlot(at: ts.Node): ResultSlot {
    return resultSlot(this.asyncCtx ? this.asyncCtx.result : this.returnType, ts.findAncestor(at.parent, ts.isFunctionLike), !!this.asyncCtx);
  }

  private returnsSet?: ReturnBackend;

  /** What the shared `return` cells (placement.ts) read of this translator. */
  private get returns(): ReturnBackend {
    const t = this;
    return this.returnsSet ??= {
      typeOf: (n) => t.typeOf(n),
      emptyReturn: (e, slot) => {
        const ret = slot.target;
        const primitive = ['String', 'Double', 'Boolean'].includes(ret);
        if (!e) {
          if (t.returnLabel) return '';
          // Lenient code returning nothing from a function of a string, number or boolean: its zero value, as Swift's kit gives.
          if (t.lenient && primitive) return t.zero(ret);
          return ret.endsWith('?') ? 'null' : '';
        }
        // App mode: undefined or null where a type parameter or a string, number or boolean is declared (`ios<T>(f): T`, this
        // platform's half of `__APPLE__ ? f : undefined`): no value of it, which callers test for.
        const nothing = e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined');
        if (t.library || !nothing) return null;
        if (/^[A-Z]\w*$/.test(ret) && slot.fn?.typeParameters?.some((p) => p.name.text === ret)) return `jsUnchecked<${ret}>(null)`;
        return primitive ? t.zero(ret) : null;
      },
      // A void expression body (`(err) => sig.set(x)`) where a value is wanted (`then`'s onRejected): undefined.
      voidValue: (_e, slot, body) => (body && isNullable(slot.target) ? 'null' : null),
    };
  }

  /** A `return` statement's cell, as Kotlin writes it. */
  private returned(cell: ReturnCell, slot: ResultSlot): string {
    const i = this.indent, a = this.asyncCtx;
    switch (cell.step) {
      case 'empty': return a ? `${i}${a.ret(null, false)}\n${i}return` : cell.code ? `${i}return ${cell.code}` : this.returnLabel ? `${i}return@${this.returnLabel}` : `${i}return`;
      case 'drop': {
        const code = this.exprStatement(cell.e);
        return this.isPure(code) ? `${i}return` : `${i}${code}\n${i}return`;
      }
      case 'never': return `${i}${this.exprStatement(cell.e)}`;
      case 'voidCall': return `${i}${this.exprStatement(cell.e)}\n${i}return ${cell.empty}`;
    }
    const e = cell.e;
    if (cell.code !== undefined) return `${i}return ${cell.code}`;
    if (a) {
      if (a.generator === 'async') return `${i}${this.lowering.returnIn(a, e)}\n${i}return`;
      return `${i}${a.ret(...this.loweredReturn(e, slot))}\n${i}return`;
    }
    return `${i}return ${place(this.placement, e, slot)}`;
  }

  loweredReturn(e: ts.Expression, slot: ResultSlot): [string, boolean] {
    const isPromise = this.isPromiseType(this.typeOf(e));
    return [isPromise ? this.expr(e) : place(this.placement, e, slot), isPromise];
  }

  /** An expression body's cell, as Kotlin writes it. */
  private bodyReturned(cell: ReturnCell, slot: ResultSlot): string {
    const i = this.indent, back = this.returnKeyword();
    switch (cell.step) {
      case 'empty': case 'drop': return i + this.exprStatement(cell.e!);
      case 'voidCall': return `${i}${this.exprStatement(cell.e)}\n${i}${back} ${cell.empty}`;
      case 'never': throw new Error('unreachable: an expression body never ends the function by its call');
    }
    return `${i}${back} ${cell.code ?? place(this.placement, cell.e, slot)}`;
  }

  private placementSet?: PlacementBackend;

  /** What the shared placement front (placement.ts) reads of this translator, and Kotlin's spelling of its cells. */
  get placement(): PlacementBackend {
    const t = this;
    return this.placementSet ??= {
      get checker() { return t.checker; },
      get sourceFiles() { return t.sourceFiles; },
      get library() { return t.library; },
      get lenient() { return t.lenient; },
      get states() { return t.states; },
      cells: {
        jsAny: (name) => `${name}.jsAny`,
        type: (_target, _into, code) => `JSNullish.of(${code})`,
        nullishOf: (_target, into, code, isNull) => `JSNullish.${isNull ? 'ofNull' : 'of'}<${into}>(${code})`,
        nullishOfAny: (_target, into, code) => this.nullishOfAny(code, into),
        empty: (isNull) => (isNull ? 'JSNullish.Null' : 'JSNullish.Undefined'),
        nulled: (code) => `jsNulled(${code})`,
        checked: (e, target, slot) => this.checkedPlacement(e, target, undefined, slot),
        checkedCode: (code, slot) => this.checkedCode(code, slot),
        marker: (code) => `jsEmptyMarker(${code})`,
      },
      typeOf: (n) => this.typeOf(n),
      expr: (e) => this.expr(e),
      resolve: (n) => this.resolve(n),
      error: (n, what) => this.error(n, what),
      optionalType,
      coerce: (e, target) => this.coerce(e, target),
      coerceTyped: (e, target) => this.coerceTyped(e, target),
      convert: (code, from, to) => this.convert(code, from, to),
      fromAnyCode: (code, type) => this.fromAnyCode(code, type),
      unsetGroups: (n) => this.unsetGroups(n),
      unsetMatch: (e) => this.unsetMatch(e),
      nullishCode: (e) => this.nullishCode(e),
      nullishSlotType: (d) => this.nullishSlotType(d),
      nullishBefore: (e, target, held) => {
        if (target !== 'Any?') return null;
        if (this.states.nullishElementRead(e)) return `jsBox(${this.expr(e)})`;
        return held ? null : this.nullishFunction(e);
      },
      argument: (e, slot) => this.argumentCell(e, slot),
      observed: (e) => this.observed(e),
      branches: (bare, target) => {
        const fixed = this.staticTruth(bare.condition);
        if (fixed !== undefined) return this.coerce(fixed ? bare.whenTrue : bare.whenFalse, target);
        return `(if (${this.cond(bare.condition)}) ${branch(this.coerce(bare.whenTrue, target))} else ${branch(this.coerce(bare.whenFalse, target))})`;
      },
    };
  }

  /** An untyped value into `JSNullish<into>`: its present value converted as an untyped value into `into` is (a TypeError where it isn't one). */
  private nullishOfAny(code: string, into: string): string {
    return `JSNullish.ofAny<${into}>(${code}) { ${this.fromAny('it', into)} }`;
  }

  /**
   * A function value taking or giving `JSNullish` placed untyped: script calls it with values as it holds them and reads
   * its result so, which the function's own Kotlin type can't take or give.
   */
  private nullishFunction(e: ts.Expression): string | null {
    const from = this.typeOf(e);
    const f = from.includes('JSNullish<') ? functionTypeParts(from.replace(/^\((.*)\)\?$/, '$1')) : null;
    const sig = this.checker.getTypeAtLocation(e).getNonNullableType().getCallSignatures()[0]?.getDeclaration();
    // A declared function named is held untyped by `untypedFunction`, whose results `jsCall` reads as script holds them.
    if (!f || !sig || ts.isJSDocSignature(sig) || ts.isFunctionDeclaration(sig) || ts.isMethodDeclaration(sig) || sig.parameters.some((p) => p.dotDotDotToken || isThisParameter(p))) return null;
    const names = f.params.map((_, k) => pure(`__n${k}`));
    const call = `__f(${f.params.map((p, k) => this.fromAny(names[k], p)).join(', ')})`;
    const adapter = `{ ${names.map((n) => `${n}: Any?`).join(', ')}${names.length ? ' ' : ''}-> ${f.ret === 'Unit' ? `${call}; Unit` : `jsBox(${call})`} }`;
    return `${this.expr(e)}.let { __f -> ${adapter} }`;
  }

  /** Calls of a `JSNullish` result being written as they are, not read as the optional. */
  private nullishCalls = new Set<ts.Node>();

  /** A `nullishHeld` variable's, parameter's or function result's `JSNullish<T>`. */
  private nullishSlotType(d: ts.Declaration): string {
    if (ts.isVariableDeclaration(d)) return this.typeOf(d.name);
    return ts.isParameter(d) ? this.paramType(d) : this.returnTypeOf(d as ts.SignatureDeclaration);
  }

  /** A read of a `nullishHeld` slot as script holds it: non-strict app code reads it untyped, as it reads every value its type may not hold. */
  private nullishReadUntyped(e: ts.Node): boolean {
    if (!this.lenientApp || !ts.isExpression(e) || !e.parent || ((ts.isParameter(e.parent) || ts.isVariableDeclaration(e.parent)) && e.parent.name === e)) return false;
    return !!this.states.nullishRead(e);
  }

  /** A `nullishRead` value as its `JSNullish<T>`. */
  private nullishCode(e: ts.Expression): string {
    if (!ts.isCallExpression(e)) return this.refName(e as ts.Identifier);
    this.nullishCalls.add(e);
    try { return this.expr(e); } finally { this.nullishCalls.delete(e); }
  }

  /** `nullableEntry`'s read: `jsNulledEntry` of the Map value `code` reads, `jsNulledElement` of the element, or the field by its key. */
  private nulledEntry(read: NulledRead, code: () => string): string | null {
    if (read.kind === 'field') return `${this.expr(read.read.expression)}.jsGet(${kotlinString(read.name)})`;
    if (read.kind === 'element') return `jsNulledElement(${this.expr(read.read.expression)}, ${this.toNumber(read.read.argumentExpression)})`;
    const entry = this.markOf(code());
    return entry?.op === 'entry' ? `jsNulledEntry(${entry.of.code}, ${entry.key.code})` : null;
  }

  /** `nullishShapeField`'s field: one of a shape or interface object class whose Kotlin type is nullable and not a function. */
  private optionalShapeField(e: ts.PropertyAccessExpression): string | null {
    const held = this.typeOf(e.expression).replace(/[?!]$/, '');
    const shape = [...this.shapes.values()].find((x) => x.name === held);
    if (!shape) {
      // An interface's object class, whose fields are its property signatures.
      const d = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
      if (!d || !ts.isPropertySignature(d) || !ts.isInterfaceDeclaration(d.parent) || d.parent.name.text !== held) return null;
      const t = this.typeOf(d);
      const h = heldOf(t);
      return (d.questionToken || spelledOptional(h)) && h !== 'any' && !isFunctionHeld(h) ? e.name.text : null;
    }
    const f = shape.fields.find((x) => x.name === e.name.text);
    return f && heldOf(f.type) === 'optional' && !shape.fields.some((x) => x.symbol || x.accessor) ? f.name : null;
  }

  private coerceTyped(e: ts.Expression, target: string): string {
    if (target === 'Any?' && notedField(this.states, e) && !isWriteTarget(e)) return `${this.expr(e.expression)}.jsGet(${kotlinString(e.name.text)})`;
    // An erased assertion where the place takes undefined: the value as it is, or the nullable it may be.
    const assertion = this.assertedUntyped(e);
    if (assertion && target === 'Any?' && this.typeOf(assertion.expression) === 'Any?') return this.expr(assertion.expression);
    if (assertion && isNullable(target) && target === optionalType(this.typeOf(assertion))) return this.assertedOptional(assertion);
    // `view && view.describe()` where the place takes undefined and the object may be missing: undefined then.
    const bare = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (!this.library && (target === 'Any?' || isNullable(target)) && ts.isBinaryExpression(bare) && bare.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && this.isObjectRef(bare.left) && !isNullable(this.typeOf(bare.left))) {
      const left = this.maybeUndefined(bare.left);
      if (left) return `(if (jsTruthy(${left})) ${this.coerce(bare.right, target)} else null)`;
    }
    // A plugin's string, number or boolean where the kit's slot types an array (`valueConverter` returning what it was given):
    // as script passes it, unchecked.
    if (!this.library && this.inPluginFile(e) && /^JSArray<.*>\??$/.test(target) && ['String', 'String?', 'Double', 'Boolean', 'Nothing'].includes(this.typeOf(e))) return this.unchecked(target, this.expr(e));
    // App mode: a string, number or boolean asserted untyped (`<any>1`) where another of them goes: converted as script converts it.
    if (!this.library && ['String', 'Double', 'Boolean'].includes(target) && (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) && this.typeOf(e) === 'Any?') {
      const inner = this.typeOf(e.expression);
      if (['String', 'Double', 'Boolean'].includes(inner) && inner !== target) return target === 'String' ? this.str(e.expression) : target === 'Double' ? this.toNumber(e.expression) : this.cond(e.expression);
    }
    // App mode: a value of a type parameter Kotlin holds nullable (a field left null, a weak reference's target) where the
    // type parameter goes: as it is, as script passes it.
    if (!this.library && /^[A-Z]\w*$/.test(target) && this.checker.getTypeAtLocation(e).flags & ts.TypeFlags.TypeParameter) {
      const weak = ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && ['get', 'deref'].includes(e.expression.name.text) && /^JSWeakRef</.test(this.typeOf(e.expression.expression));
      // A field of the type parameter declared without a value is Kotlin's nullable (`_testView: T`).
      const field = ts.isPropertyAccessExpression(e) ? this.checker.getSymbolAtLocation(e.name)?.valueDeclaration : undefined;
      const unset = !!field && ts.isPropertyDeclaration(field) && !field.initializer && !field.getSourceFile().isDeclarationFile;
      if (weak || unset || this.declaredTypeOf(e) === `${target}?`) return this.unchecked(target, this.expr(e));
    }
    // Library mode: undefined as a number is NaN, as JavaScript reads it (`return undefined` of a number method).
    if (this.library && target === 'Double' && ts.isIdentifier(e) && e.text === 'undefined') return 'Double.NaN';
    if (this.lenient && ['String', 'Double', 'Boolean'].includes(target) && (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined'))) return this.zero(target)!;
    // Lenient code: null where an object type goes (`signal<Person>(null)`), which its checks let through.
    if ((this.lenient || this.lenientApp) && !this.library && !isNullable(target) && (this.isObjectType(target) || (this.lenientApp && isFunctionType(target))) && (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined'))) return `jsUncheckedNull<${target}>()`;
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text) && !e.arguments?.length && /^JS(Map|Set)</.test(target.replace(/\?$/, ''))) return `${target.replace(/\?$/, '')}()`;
    while (ts.isParenthesizedExpression(e) && (ts.isArrowFunction(e.expression) || ts.isFunctionExpression(e.expression) || ts.isParenthesizedExpression(e.expression))) e = e.expression;
    if (isNullable(target) || target === 'Any?') {
      let x = e;
      while (ts.isParenthesizedExpression(x)) x = x.expression;
      this.nullOk.add(x);
    }
    // An app function held untyped (a page module's export, which core's Builder calls by name): its arguments read as it types them.
    if (!this.library && target === 'Any?' && ts.isIdentifier(e) && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && this.boxStep(this.typeOf(e)).composite === 'function') {
      const decl = this.resolve(e)?.valueDeclaration;
      if (decl && ts.isFunctionDeclaration(decl) && decl.body && !decl.getSourceFile().isDeclarationFile && !decl.parameters.some((p) => p.dotDotDotToken || isThisParameter(p)) && !this.implicitThis(decl)) {
        const fn = this.functionValue(e);
        return this.untypedFunction(decl, fn.includes('::') ? `(${fn})` : fn);
      }
    }
    // A conditional's branches each placed in a shape slot: a class's object is read into the shape by itself, and
    // neither branch is held untyped on the way.
    if (ts.isConditionalExpression(bare) && this.isShapeType(target.replace(/\?$/, '')) && [bare.whenTrue, bare.whenFalse].some((x) => this.typeOf(x).replace(/\?$/, '') !== target.replace(/\?$/, ''))) {
      return `(if (${this.cond(bare.condition)}) ${branch(this.coerce(bare.whenTrue, target))} else ${branch(this.coerce(bare.whenFalse, target))})`;
    }
    const source = this.typeOf(e);
    const structural = this.structuralCopy(e, source, target);
    if (structural) return structural;
    // A tuple (a Kotlin Pair) where an array goes: an array of its elements; a conditional's branches each so.
    const array = /^JSArray<(.*)>\??$/.exec(target);
    if (!this.library && array && ts.isConditionalExpression(e) && [e.whenTrue, e.whenFalse].some((x) => /^(Pair|Triple)</.test(this.typeOf(x)))) {
      return `(if (${this.cond(e.condition)}) ${branch(this.coerce(e.whenTrue, target))} else ${branch(this.coerce(e.whenFalse, target))})`;
    }
    if (!this.library && array && /^(Pair|Triple)</.test(source)) {
      const parts = source.startsWith('Triple') ? ['first', 'second', 'third'] : ['first', 'second'];
      return `(${this.expr(e)})${isNullable(source) ? '?' : ''}.let { __t -> jsArrayOf<${array[1]}>(${parts.map((p) => `__t.${p}`).join(', ')}) }`;
    }
    // Library mode and non-strict apps: each branch where the slot goes, as Kotlin types the `if` by its branches; a nullable
    // string, number or boolean slot (`scale(): number` returning `c ? 2 : null`) takes a missing branch as it is.
    if ((this.library || this.lenientApp) && ts.isConditionalExpression(e) && (isFunctionType(target.replace(/^\((.*)\)\?$/, '$1')) || ['String?', 'Double?', 'Boolean?'].includes(target))) {
      return `(if (${this.cond(e.condition)}) ${branch(this.coerce(e.whenTrue, target))} else ${branch(this.coerce(e.whenFalse, target))})`;
    }
    // Lenient code: `a ?? b` where `b` may be unset itself, read as the type says.
    if (this.lenient && ['String', 'Double', 'Boolean'].includes(target) && ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) return this.library ? this.fromAnyCode(this.expr(e), target, true) : this.undefinedAs(this.expr(e), target);
    // Library mode: a module's function as a value (`alert` in `{ alert, confirm }`), its Kotlin signature (a lenient result
    // nullable, optional parameters) apart from the slot's: adapted.
    const fnRef = this.library ? this.functionRefAdapter(e, target) : null;
    if (fnRef) return fnRef;
    // Library mode: a string where core's code declares a number (`toString(eventNames)` of GestureTypes), as script's operators read it.
    if (this.library && target === 'Double' && /^String\??$/.test(this.declaredTypeOf(e) ?? source)) return `jsToNumber(${this.expr(e)})`;
    if (!this.library && source.replace(/\?$/, '') === 'JSMatch' && /^JSArray<String\?>\??$/.test(target)) return `${this.expr(e)}${source.endsWith('?') ? '?' : ''}.values`;
    // Library mode: a match where its type is a list of strings (`RegExpMatchArray` as `string[]`): its values, null where none matched.
    if (this.library && source.replace(/\?$/, '') === 'JSMatch' && /^JSArray<String\??>\??$/.test(target)) {
      const values = cast(`${this.expr(e)}?.values`, optionalType(target));
      return isNullable(target) ? values : this.asserted(values);
    }
    // Lenient code: `a?.b` ends undefined where `a` is, whatever the type says.
    if ((this.lenient || !this.library) && ['String', 'Double', 'Boolean'].includes(target) && source === target && this.optionalChainEnd(e)) return this.undefinedAs(this.expr(e), target);
    // Library mode: `a && b`, `a || b` of operands Kotlin types apart (a nullable field, a string): the value, read as the type says.
    if (this.library && ['String', 'Double', 'Boolean'].includes(target) && ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind) && source === target
        && [e.left, e.right].some((x) => (this.declaredTypeOf(x) ?? this.typeOf(x)) !== target)) return this.fromAnyCode(this.expr(e), target, true);
    // Library mode: an array literal of tuples, its elements typed apart from the slot's (`JSArray<Pair<CssProperty, Any?>>`).
    if (this.library && ts.isArrayLiteralExpression(e) && e.elements.length && e.elements.every(ts.isArrayLiteralExpression) && /^JSArray<(Pair|Triple)</.test(target)) {
      const code = this.expr(e);
      const m = this.markOf(code);
      const made = m?.op === 'array' ? m.element : undefined;
      return made && `JSArray<${made}>` !== target.replace(/\?$/, '') ? cast(code, target) : code;
    }
    // Library mode: a call of a function declared `number` that returns undefined (as NaN), where a nullable number goes: null for it.
    if (this.library && target === 'Double?' && source === 'Double' && ts.isCallExpression(e)) {
      const fn = this.checker.getResolvedSignature(e)?.declaration;
      if (fn && (ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn)) && fn.body && fn.type?.kind === ts.SyntaxKind.NumberKeyword && returnsNull(fn.body)) {
        // One Kotlin declares nullable gives null itself.
        if (isNullable(this.returnTypeOf(fn))) return this.maybeUndefined(e) ?? this.expr(e);
        return `(${this.expr(e)}).takeUnless { it.isNaN() }`;
      }
    }
    // Library mode: a Java enum's constant where core's code declares a number (its typings' enums are numbers): its ordinal.
    if (this.library && target === 'Double' && source !== 'Double' && this.checker.getTypeAtLocation(e).flags & ts.TypeFlags.EnumLike && this.native?.type(this.checker.getTypeAtLocation(e))) return `(${this.expr(e)}).ordinal.toDouble()`;
    // Library mode: a typed record or array where an untyped one goes (`Record<string, unknown>` set from a `Record<string, string>`).
    if (this.library && /^JS(Record|Array)<Any\?>\??$/.test(target) && /^JS(Record|Array)<.+>\??$/.test(source) && source.replace(/\?$/, '') !== target.replace(/\?$/, '') && source.slice(0, 8) === target.slice(0, 8)) return cast(this.expr(e), target);
    const missing = this.library && ['String', 'Double', 'Boolean'].includes(target) && source === target ? this.maybeUndefined(e) : null;
    if (missing) return this.undefinedAs(missing, target);
    // An iterable where the type names only its iteration: the kit's iterable of it.
    const iterableSlot = /^JS(Async)?Iterable<.*>\??$/.exec(target);
    if (iterableSlot && !/^JS(Async)?(Iterable|Iterator|Generator)</.test(source)) return `${iterableSlot[1] ? 'jsAsyncIterable' : 'jsIterable'}(${this.expr(e)})`;
    if (target.endsWith('?') && target !== 'Any?' && (!source.endsWith('?') || (this.library && isNullable(target) && !isNullable(source)))) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?') {
      const box = this.boxStep(source);
      // Null kept as untyped values hold it, apart from undefined.
      let bare = e;
      while (ts.isParenthesizedExpression(bare)) bare = bare.expression;
      if (!this.library) {
        const rest = this.restCallable(bare);
        if (rest) return rest;
      }
      // Library mode: a member of an untyped object, kept as it is (whatever class this use's type says it has).
      if (this.library && ts.isPropertyAccessExpression(bare) && !isWriteTarget(bare) && this.typeOf(bare.expression) === 'Any?' && bare.name.text !== 'prototype' && !(ts.isIdentifier(bare.expression) && (this.isLibGlobal(bare.expression) || this.namesClass(bare.expression)))) {
        return `${bare.questionDotToken ? 'jsGetOptional' : 'jsGet'}(${this.expr(bare.expression)}, ${kotlinString(bare.name.text)})`;
      }
      // Library mode: `a || b` held untyped: either operand as it is.
      if (this.library && ts.isBinaryExpression(bare) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(bare.operatorToken.kind) && this.typeOf(bare) !== 'Any?') {
        const v = this.fresh('__v');
        const [l, r] = [this.coerce(bare.left, 'Any?'), branch(this.coerce(bare.right, 'Any?'))];
        return bare.operatorToken.kind === ts.SyntaxKind.BarBarToken ? `run { val ${v}: Any? = ${l}; if (jsTruthy(${v})) ${v} else ${r} }` : `run { val ${v}: Any? = ${l}; if (jsTruthy(${v})) ${r} else ${v} }`;
      }
      // A function reading `arguments`, held untyped: called as script calls it, with however many arguments.
      if (this.library && (ts.isArrowFunction(bare) || ts.isFunctionExpression(bare)) && this.readsArguments(bare)) return `run { val __f = ${this.expr(bare)}; JSMethod { _, __a -> __f(jsArrayOf<Any?>(*__a)) } }`;
      // A function of a rest parameter held untyped (`(...args) => {}`): called with however many arguments, the rest packed.
      if (this.library && (ts.isArrowFunction(bare) || ts.isFunctionExpression(bare)) && bare.parameters.at(-1)?.dotDotDotToken && !bare.parameters.some((q) => isThisParameter(q) || !ts.isIdentifier(q.name))) {
        const types = bare.parameters.map((q) => this.paramType(q));
        const ret = this.returnTypeOf(bare);
        const n = types.length - 1;
        const lead = types.slice(0, n).map((t, k) => (t === 'Any?' ? pure(`__a.getOrNull(${k})`) : this.fromAnyCode(pure(`__a.getOrNull(${k})`), t, true)));
        const call = `__f(${[...lead, `(JSArray<Any?>(__a.drop(${n})) as ${types[n].replace(/\?$/, '')})`].join(', ')})`;
        return `run { val __f = ${this.closure(bare, `(${types.join(', ')}) -> ${ret}`)}; JSMethod ${lambda(['_', '__a'], ret === 'Unit' ? `${call}; null` : call)} }`;
      }
      if (bare.kind === ts.SyntaxKind.NullKeyword) return 'jsNull';
      // Library mode: a function declaring the `this` it takes, held untyped (a property descriptor's `get`): a JSMethod, given its receiver.
      const takesThis = (x: ts.Expression) => ts.isFunctionExpression(x) && x.parameters.some((q) => isThisParameter(q) && !this.voidThis(q));
      if (this.library && takesThis(bare)) return this.thisMethod(bare as ts.FunctionExpression);
      // Library mode and plugins: a function of numbers, strings or booleans held untyped (an options object's `valueChanged`), which core may call with undefined.
      if ((this.library || this.pluginFiles.has(bare.getSourceFile().fileName)) && (ts.isArrowFunction(bare) || ts.isFunctionExpression(bare)) && !bare.parameters.some((q) => q.dotDotDotToken || isThisParameter(q) || !ts.isIdentifier(q.name))) {
        const types = bare.parameters.map((q) => this.paramType(q));
        if (types.some((t) => ['Double', 'Boolean', 'String'].includes(t))) {
          const ret = this.returnTypeOf(bare);
          const names = types.map((_, k) => pure(`__u${k}`));
          const call = `__f(${types.map((t, k) => (t === 'Any?' ? names[k] : this.fromAnyCode(names[k], t, true))).join(', ')})`;
          return `run { val __f = ${this.closure(bare, `(${types.join(', ')}) -> ${ret}`)}; { ${names.map((n) => `${n}: Any?`).join(', ')} -> ${ret === 'Unit' ? `${call}; Unit` : call} } }`;
        }
      }
      if (ts.isConditionalExpression(bare) && ([bare.whenTrue, bare.whenFalse].some((x) => x.kind === ts.SyntaxKind.NullKeyword) || this.states.nullBranches(bare) || (this.library && [bare.whenTrue, bare.whenFalse].some(takesThis)))) {
        return `(if (${this.cond(bare.condition)}) ${branch(this.coerce(bare.whenTrue, 'Any?'))} else ${branch(this.coerce(bare.whenFalse, 'Any?'))})`;
      }
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
      if (box.composite === 'void' && source === 'Unit' && !(ts.isIdentifier(e) && e.text === 'undefined')) return `jsBox(${this.expr(e)})`;
      // Library mode: a Java method's object result held untyped (`line = reader.readLine()`): Java's null is script's null.
      if (this.library && ts.isCallExpression(bare) && this.javaObjectResult(bare)) return `(${this.expr(e)} ?: JSNull)`;
      return this.expr(e);
    }
    if (source === 'Any?' && target !== 'Unit') {
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e, target);
      if (e.kind === ts.SyntaxKind.NullKeyword) return 'null';
      // Library mode: a function declaring the `this` it takes (`setFunc(…)`), its Kotlin type taking that first: a JSMethod's receiver.
      const parts = this.library ? functionTypeParts(target.replace(/^\((.*)\)\?$/, '$1')) : null;
      const thisTaking = parts && parts.params.length >= 1 && parts.params.length <= 5 && this.checker.getTypeAtLocation(e).getCallSignatures().some((sig) => !!sig.thisParameter);
      if (thisTaking) {
        const code = cast(`jsThisFunction(__f, ${parts!.params.length})`, target.replace(/^\((.*)\)\?$/, '$1'));
        return `run { val __f = ${this.expr(e)}; ${/\)\?$/.test(target) ? `if (jsIsNullish(__f)) null else ${code}` : code} }`;
      }
      // Library mode: an untyped value where a string, number or boolean goes is that type's undefined when missing.
      return this.library ? this.fromAnyCode(this.expr(e), target, true) : this.fromAny(this.expr(e), target);
    }
    if ((ts.isArrowFunction(e) || ts.isFunctionExpression(e)) && isFunctionType(target.replace(/^\((.*)\)\?$/, '$1'))) {
      const slot = target.replace(/^\((.*)\)\?$/, '$1');
      // Library mode: a slot of wider parameter types than the literal's (a generic function's, its type parameters erased): the literal, adapted.
      const want = functionTypeParts(slot);
      const declared = functionTypeParts(this.typeOf(e));
      // So is one declaring an array where the slot passes a tuple (`(views: View[])` for `[T, Page]`).
      const tupleAsArray = !!declared && !!want && declared.params.some((p, k) => /^JSArray</.test(p) && /^(Pair|Triple)</.test(want.params[k] ?? ''));
      // So is one passed where the generated kit's signature takes other parameter types (its generics erased) or more of them.
      const kitSlot = this.generatedKit && !!declared && !!want && (declared.params.length < want.params.length || declared.params.some((p, k) => p !== want.params[k]));
      const typed = this.library || tupleAsArray || kitSlot ? declared : null;
      // Its parameters as the closure declares them (`typeTested` ones untyped).
      const own = typed && { ...typed, params: typed.params.map((p, k) => (e.parameters[k] && this.typeTested(e.parameters[k]) ? 'Any?' : p)) };
      if (own && want && own.params.length <= want.params.length && ((kitSlot && own.params.length < want.params.length) || own.params.some((p, k) => p !== want.params[k] && this.convert('x', want.params[k], p) !== 'x'))) {
        const names = want.params.map((_, k) => pure(`__a${k}`));
        const call = `__f(${own.params.map((p, k) => this.convert(names[k], want.params[k], p)).join(', ')})`;
        // A parameter the function ignores takes any value: Kotlin's function types take a supertype there.
        const params = want.params.map((p, k) => (k < own.params.length ? p : 'Any?'));
        // `run` typed explicitly: an inferred one leaves the argument's type open, and overloads of the callee that
        // differ only in their function parameter's arity (rxjs `filter`, `map`) are then ambiguous.
        return `run<(${params.join(', ')}) -> ${want.ret}> { val __f = ${this.closure(e, `(${own.params.join(', ')}) -> ${want.ret}`)}; { ${params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${call} } }`;
      }
      return this.closure(e, slot);
    }
    {
      // A function value taking fewer parameters than the slot passes (JavaScript ignores the rest).
      const f = functionTypeParts(source.replace(/^\((.*)\)\?$/, '$1'));
      const g = functionTypeParts(target.replace(/^\((.*)\)\?$/, '$1'));
      // A function of a rest parameter (`throttle`'s result) where a fixed list is wanted: what the slot passes, packed.
      const sd = f && g ? this.checker.getTypeAtLocation(e).getCallSignatures()[0]?.getDeclaration() : undefined;
      if (sd && !ts.isJSDocSignature(sd) && sd.parameters.length === 1 && sd.parameters[0].dotDotDotToken && f!.params.length === 1 && /^JSArray</.test(f!.params[0]) && f!.params[0] !== g!.params[0]) {
        const names = g!.params.map((_, k) => pure(`__a${k}`));
        const call = `__f(jsArrayOf<Any?>(${names.map((n, k) => (g!.params[k] === 'Unit' ? `jsBox(${n})` : n)).join(', ')}) as ${f!.params[0]})`;
        const value = this.functionValue(e);
        return `${value.includes('::') ? `(${value})` : value}.let { __f -> { ${g!.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${g!.ret === 'Unit' ? call : this.convert(call, f!.ret, g!.ret)} } }`;
      }
      // A declared function where one of fewer parameters is wanted: called by name, so the rest take their defaults.
      const decl = f && g && f.params.length > g.params.length && ts.isIdentifier(e) ? this.resolve(e)?.valueDeclaration : undefined;
      if (decl && ts.isFunctionDeclaration(decl) && decl.body && !decl.getSourceFile().isDeclarationFile && decl.parameters.slice(g!.params.length).every((p) => (p.questionToken || p.initializer) && !p.dotDotDotToken)) {
        const names = g!.params.map((_, k) => pure(`__a${k}`));
        const call = `${this.library ? this.refName(e as ts.Identifier) : ident((e as ts.Identifier).text)}(${names.map((n, k) => this.convert(n, g!.params[k], f!.params[k])).join(', ')})`;
        return `{ ${g!.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${call} }`;
      }
      if (f && g && f.params.length <= g.params.length && (f.params.length < g.params.length || f.params.some((p, k) => p !== g.params[k] && this.convert('x', g.params[k], p) !== 'x')) && f.params.length <= g.params.length && (g.ret === 'Unit' || g.ret === f.ret || (this.library && g.ret === 'Any?'))) {
        const names = g.params.map((_, k) => pure(`__a${k}`));
        const fn = this.functionValue(e);
        // A function field Kotlin declares nullable (one left unset): unwrapped where it is called.
        const unwrap = /^\(.*\)\?$/.test(this.declaredTypeOf(e) ?? '') && !/\)\?$/.test(source) ? '!!' : '';
        const call = `${fn.includes('::') ? `(${fn})` : fn}${unwrap}(${names.slice(0, f.params.length).map((n, k) => this.convert(n, g.params[k], f.params[k])).join(', ')})`;
        const adapter = `{ ${g.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${call} }`;
        // An optional member (`closeCallback?: …`) given to an optional parameter (`cb?: …`): undefined stays undefined,
        // as the checker without strictNullChecks types neither as optional.
        const member = ts.isPropertyAccessExpression(e) ? this.resolve(e.name)?.valueDeclaration : undefined;
        const outer = ts.isCallExpression(e.parent) ? e.parent : undefined;
        const sig = outer ? this.checker.getResolvedSignature(outer)?.getDeclaration() : undefined;
        const param = sig && !ts.isJSDocSignature(sig) ? sig.parameters[outer!.arguments.indexOf(e)] : undefined;
        const optional = !!member && (ts.isPropertySignature(member) || ts.isPropertyDeclaration(member)) && !!member.questionToken && (/\)\?$/.test(target) || !!param?.questionToken || !!param?.initializer);
        // The function as it is now, equal to its other adaptations and to itself (a listener added and later removed).
        if (g.params.length <= 4 && !ts.isArrowFunction(e) && !ts.isFunctionExpression(e)) {
          const held = adapter.replace(`${fn.includes('::') ? `(${fn})` : fn}${unwrap}(`, '__f(');
          const adapt = `jsAdapt${g.params.length}<${[...g.params, g.ret].join(', ')}>(__f) ${held}`;
          if (/\)\?$/.test(source) || unwrap || optional) {
            const value = this.expr(e);
            if (/\)\?$/.test(target)) return `${value}?.let { __f -> ${adapt} }`;
            return this.isAsserted(value) ? `${value}.let { __f -> ${adapt} }` : this.asserted(`${value}?.let { __f -> ${adapt} }`);
          }
          return `${fn.includes('::') ? `(${fn})` : fn}.let { __f -> ${adapt} }`;
        }
        return /\)\?$/.test(source) || optional ? `${this.expr(e)}?.let { __f -> ${adapter.replace(fn.includes('::') ? `(${fn})` : fn, '__f')} }` : adapter;
      }
    }
    if (/^JSArray<.*>$/.test(source) && /^JSArray<.*>\??$/.test(target) && source !== target.replace(/\?$/, '') && source === 'JSArray<Any?>') return cast(this.expr(e), target);
    // A value TypeScript's strict typing calls possibly undefined where the code expects one (checked without strictNullChecks).
    if (source === optionalType(target) && target !== 'Any?' && !isNullable(target) && !isFunctionType(target)) {
      const field = this.states.placedField(e);
      return field ? `jsRequired(${this.expr(e)}, ${kotlinString(field.name)})` : this.undefinedAs(this.expr(e), target);
    }
    if (isFunctionType(source) && isFunctionType(target.replace(/^\((.*)\)\?$/, '$1')) && / -> Unit$/.test(target.replace(/^\((.*)\)\?$/, '$1')) && !/ -> Unit$/.test(source)) {
      // A function value whose result a void slot ignores.
      const params = functionTypeParts(source)!.params;
      const names = params.map((_, k) => pure(`__a${k}`));
      if (params.length <= 4 && !ts.isArrowFunction(e) && !ts.isFunctionExpression(e)) {
        const fn = this.functionValue(e);
        return `${fn.includes('::') ? `(${fn})` : fn}.let { __f -> jsAdapt${params.length}<${[...params, 'Unit'].join(', ')}>(__f) { ${params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> __f(${names.join(', ')}) } }`;
      }
      return `{ ${params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${this.functionValue(e)}(${names.join(', ')}) }`;
    }
    if (target === 'Boolean' && source !== 'Boolean' && source !== 'Nothing') return `jsTruthy(${this.expr(e)})`;
    // Core's common code typing a value by its platform's subclass (`picker: TimePicker` given a `TimePickerBase`): cast, as TypeScript checks it structurally.
    const [sb, tb] = [source.replace(/\?$/, ''), target.replace(/\?$/, '')];
    if (this.lenient && sb !== tb && this.sourceClassNames().has(sb) && this.sourceClassNames().has(tb)) return this.classCast(this.functionValue(e), source, target);
    // Library mode: one of the kit's generic containers of another element type (`JSPromise<ImageSource>` where `JSPromise<Any?>` is declared),
    // invariant in Kotlin, the same value to script.
    // Library mode: one Java class where script declares another (`getActivity()`'s FragmentActivity for an AppCompatActivity): cast, as script trusts it.
    if (this.library && sb !== tb && /^[a-z]\w*(\.\w+)+$/.test(sb) && /^[a-z]\w*(\.\w+)+$/.test(tb)) return cast(this.functionValue(e), target);
    // Library mode: a Java collection where Java's wildcard (`Map<String, ?>`) is Kotlin's star projection: the declared one, unchecked.
    if (this.library && /^Mutable(Map|List|Set|Collection|Iterator|Iterable)</.test(tb)) return cast(this.functionValue(e), target);
    // The generated kit: a base class's instance where script's type names a subclass (an ActionItem as a NavigationButton),
    // which script lets through: cast, failing where it is no such instance.
    if (this.generatedKit && sb !== tb && this.core?.has(sb) && this.core.has(tb) && this.core.kitExtends?.(tb, sb)) return cast(this.functionValue(e), target);
    const head = (t: string) => /^(JS(?:Promise|Array|Map|Set|Generator|Iterator|WeakRef))</.exec(t)?.[1];
    if (head(sb) && head(sb) === head(tb) && sb !== tb) return cast(this.functionValue(e), target);
    if (sb !== tb && anyArguments(sb, tb)) return this.unchecked(target, this.functionValue(e));
    // An object given where an object type of the program's is declared, which it meets without naming it (`btn` as a `MeasuredView`): read through it by name.
    const wanted = this.checker.getContextualType(e)?.getSymbol();
    const programInterface = !!wanted && !!(wanted.flags & ts.SymbolFlags.Interface) && !(wanted.flags & ts.SymbolFlags.Class) && !!wanted.declarations?.every((d) => !d.getSourceFile().isDeclarationFile) && wanted.name === tb;
    if (!this.library && sb !== tb && this.isObjectType(sb) && (programInterface || this.interfaces.has(tb) || [...this.shapes.values()].some((s) => s.name === tb)) && !this.declaresInterface(this.checker.getTypeAtLocation(e), tb)) {
      const reader = this.protocols.has(tb) ? `${tb}Object` : tb;
      return isNullable(target) ? `${this.expr(e)}?.let { ${reader}.fromJS(it) }` : `${reader}.fromJS(${this.expr(e)})`;
    }
    return this.functionValue(e);
  }

  private functionRefAdapter(e: ts.Expression, target: string): string | null {
    // `xml2ui.PositionErrorFormat`: a namespace's function, as a value.
    const member = this.library && ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.name) ? e.name : undefined;
    if ((!ts.isIdentifier(e) && !member) || ts.isCallExpression(e.parent) && e.parent.expression === e) return null;
    const g = functionTypeParts(target.replace(/^\((.*)\)\?$/, '$1'));
    const decl = this.resolve(member ?? e)?.declarations?.find((d): d is ts.FunctionDeclaration => ts.isFunctionDeclaration(d) && !!d.body && !d.getSourceFile().isDeclarationFile);
    const rest = decl?.parameters.findIndex((p) => p.dotDotDotToken) ?? -1;
    // Library mode: a generic function's Kotlin signature has its type parameters erased.
    if (!g || !decl || (decl.typeParameters?.length && !this.library) || this.readsArguments(decl) || decl.parameters.some((p, k) => (p.dotDotDotToken && k !== decl.parameters.length - 1) || isThisParameter(p)) || (rest < 0 && decl.parameters.length > g.params.length)) return null;
    const params = decl.parameters.map((p) => (p.dotDotDotToken ? this.typeOf(p.name) : this.paramType(p)));
    const ret = this.returnTypeOf(decl);
    if (rest < 0 && params.every((p, k) => p === g.params[k]) && params.length === g.params.length && (ret === g.ret || g.ret === 'Unit')) return null;
    const names = g.params.map((_, k) => pure(`__r${k}`));
    // A rest parameter takes what the slot passes from its position on.
    const el = rest >= 0 ? params[rest].replace(/^JSArray<(.*)>$/, '$1') : '';
    const args = rest < 0 ? params.map((p, k) => this.convert(names[k], g.params[k], p)) : [...params.slice(0, rest).map((p, k) => this.convert(names[k], g.params[k], p)), `jsArrayOf<${el}>(${names.slice(rest).map((n, k) => this.convert(n, g.params[rest + k], el)).join(', ')})`];
    const ref = member ? this.expr(e) : '';
    if (member && !/^[\w.]+::\w+$/.test(ref)) return null;
    const call = `${member ? ref.replace('::', '.') : this.refName(e as ts.Identifier)}(${args.join(', ')})`;
    return lambda(g.params.map((p, k) => `${names[k]}: ${p}`), g.ret === 'Unit' ? call : this.convert(call, ret, g.ret));
  }

  /** `Color` in `Color.equals(…)`: a class by its name, not a value holding one. */
  private namesClass(e: ts.Node | undefined): boolean {
    if (!e || !(ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) || isDeclarationName(e)) return false;
    return !!((this.resolve(ts.isPropertyAccessExpression(e) ? e.name : e)?.flags ?? 0) & ts.SymbolFlags.Class);
  }

  private classNames: Set<string> | null = null;
  /** The Kotlin names of the classes the program declares. */
  private sourceClassNames(): Set<string> {
    return (this.classNames ??= new Set(this.sourceClasses().keys()));
  }

  private classDeclarations: Map<string, ts.ClassDeclaration> | null = null;
  private sourceClasses(): Map<string, ts.ClassDeclaration> {
    if (this.classDeclarations) return this.classDeclarations;
    this.classDeclarations = new Map();
    const visit = (n: ts.Node): void => {
      if (ts.isClassDeclaration(n) && n.name) this.classDeclarations!.set(this.className(n), n);
      ts.forEachChild(n, visit);
    };
    for (const f of this.sourceFiles) if (!f.isDeclarationFile) visit(f);
    return this.classDeclarations;
  }

  /** Whether the program's class `sub` extends `base`, so Kotlin takes one where the other goes without a cast. */
  private extendsClass(sub: string, base: string): boolean {
    const seen = new Set<ts.ClassDeclaration>();
    for (let d = this.sourceClasses().get(sub); d && !seen.has(d);) {
      seen.add(d);
      if (this.className(d) === base) return true;
      const ext = d.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      d = ext && this.resolve(ext.expression)?.declarations?.find(ts.isClassDeclaration);
    }
    return false;
  }

  /** `code` of class `from` where class `to` goes: a cast only where it narrows, to a subclass or out of null. */
  classCast(code: string, from: string, to: string): string {
    if (this.extendsClass(from.replace(/\?$/, ''), to.replace(/\?$/, '')) && (isNullable(to) || !isNullable(from))) return code;
    return cast(code, to);
  }

  /** An expression as a value: a declared function named by a reference. */
  /**
   * App code: a function value whose last parameter is a rest, held untyped, which jsCall calls with however many
   * arguments: the rest packed from its position on. A conditional's branches are each held so.
   */
  private restCallable(e: ts.Expression): string | null {
    const hasRest = (x: ts.Expression): boolean => {
      const sig = this.checker.getTypeAtLocation(x).getNonNullableType().getCallSignatures();
      const d = sig.length === 1 ? sig[0].getDeclaration() : undefined;
      return !!d && !ts.isJSDocSignature(d) && !!d.parameters.at(-1)?.dotDotDotToken && !d.parameters.some((p) => isThisParameter(p))
        && /^JSArray</.test(functionTypeParts(this.typeOf(x).replace(/^\((.*)\)\?$/, '$1'))?.params.at(-1) ?? '');
    };
    // Parentheses only: an assertion (`v as Replacer`) is held as the type it asserts.
    const held = (x: ts.Expression): boolean => {
      const b = ts.skipParentheses(x);
      return ts.isConditionalExpression(b) ? held(b.whenTrue) || held(b.whenFalse) : !ts.isArrowFunction(b) && !ts.isFunctionExpression(b) && hasRest(b);
    };
    const bare = ts.skipParentheses(e);
    if (!held(bare)) return null;
    if (ts.isConditionalExpression(bare)) return `(if (${this.cond(bare.condition)}) ${branch(this.coerce(bare.whenTrue, 'Any?'))} else ${branch(this.coerce(bare.whenFalse, 'Any?'))})`;
    const asserted = ts.isAsExpression(bare) || ts.isTypeAssertionExpression(bare) ? ts.skipOuterExpressions(bare) : null;
    if (asserted && this.typeOf(asserted) === 'Any?') return this.expr(asserted);
    const type = this.typeOf(bare);
    const g = functionTypeParts(type.replace(/^\((.*)\)\?$/, '$1'))!;
    const n = g.params.length - 1;
    const lead = g.params.slice(0, n).map((t, k) => (t === 'Any?' ? pure(`__a.getOrNull(${k})`) : this.fromAnyCode(pure(`__a.getOrNull(${k})`), t, true)));
    const packed = `JSArray<Any?>(ArrayList(__a.drop(${n})))`;
    const call = `__f(${[...lead, g.params[n] === 'JSArray<Any?>' ? packed : this.fromAnyCode(packed, g.params[n], true)].join(', ')})`;
    const fn = `jsFunction(${n}, __f) { __a -> ${g.ret === 'Unit' ? `${call}; null` : call} }`;
    // A variable narrowed to its function is still held nullable when declared so.
    const sym = ts.isIdentifier(bare) ? this.resolve(bare) : undefined;
    const declared = sym?.valueDeclaration ? this.checker.getTypeOfSymbol(sym) : undefined;
    const nullable = /\)\?$/.test(type) || (!!declared && declared.isUnion() && declared.types.some((t) => t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
    return `run { val __f = ${this.expr(bare)}; ${nullable ? `if (__f == null) null else ${fn}` : fn} }`;
  }

  functionValue(e: ts.Expression): string {
    if (ts.isIdentifier(e)) {
      const decl = this.resolve(e)?.valueDeclaration;
      if (decl && ts.isFunctionDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) {
        // By the name it is declared under: an import's alias (`runAll as __import0_runAll`) or a renamed top-level name is not it.
        const ref = this.refName(e);
        const dot = ref.lastIndexOf('.');
        return dot < 0 ? `::${ref}` : `${ref.slice(0, dot)}::${ref.slice(dot + 1)}`;
      }
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
  cond(e: ts.Expression, c = conditionCell(this.conditions, e)): string {
    switch (c.step) {
      case 'fixed': return String(c.value);
      case 'logical': {
        const l = this.cond(c.e.left), r = this.cond(c.e.right);
        return l === r ? l : `(${l} ${c.and ? '&&' : '||'} ${r})`;
      }
      case 'not': return `!(${this.cond(c.e)})`;
      case 'missing': return `jsTruthy(${c.code})`;
      case 'bool': return this.expr(c.e);
    }
    const code = this.expr(c.e);
    // A missing string read as "undefined" (a match's unmatched group) is falsy as the value it stands for.
    const m = this.markOf(code);
    const raw = m?.op === 'undefinedAs' && m.to.kind === 'string' ? m.of.code : undefined;
    return `jsTruthy(${raw && wrapsWhole(raw) ? raw : code})`;
  }

  private get conditions(): ConditionBackend {
    return this.conditionSet ??= {
      bare: true,
      isBool: (n) => this.isBool(n),
      maybeUndefined: (e) => this.maybeUndefined(e),
      fixed: (e) => this.staticTruth(e),
      decided: (e) => {
        const and = e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
        return this.staticTruth(e.left) === and ? e.right : this.staticTruth(e.right) === and && this.pure(e.left) ? e.left : null;
      },
    };
  }
  private conditionSet?: ConditionBackend;

  // ---- Expressions -----------------------------------------------------------------------------

  /** Held parts of a member's compound assignment (`readWriteCode`): their code, bound in their place, is final. */
  private readonly heldParts = new Set<ts.Node>();

  expr(e: ts.Expression): string {
    if (this.heldParts.has(e)) return this.subst.get(e)!;
    if (ts.isCallExpression(e) && !this.nullishCalls.has(e) && !this.subst.has(e) && this.states.nullishRead(e)) return `${this.nullishCode(e)}${this.lenientApp ? '.jsAny' : '.optional'}`;
    const awaited = this.awaitSlots.get(e), key = awaited ? readKeyOf(e) : null;
    if (awaited && key !== null) return this.receiverCode(awaitedCell(awaited), key)!;
    const s = this.subst.get(e);
    if (s) return s;
    const narrowed = this.narrowedHeld(e);
    if (narrowed) {
      this.rawHeld.add(e);
      try {
        const raw = this.expr(e);
        return this.checkedConvert(raw, narrowed, e) ?? this.checkedCast(raw, this.type(narrowed.type, e));
      } finally { this.rawHeld.delete(e); }
    }
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    const rw = readWrite(e, this.checker);
    if (rw && ((rw.value && !rw.stored) || rw.held.length) && !rw.held.some((h) => this.subst.has(h))) return this.readWriteCode(e, rw);
    // An accessor's getter need not give back what its setter took, so the value is the one read or the one assigned.
    const logical = ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandEqualsToken, ts.SyntaxKind.BarBarEqualsToken, ts.SyntaxKind.QuestionQuestionEqualsToken].includes(e.operatorToken.kind);
    if (logical && ts.isPropertyAccessExpression(e.left) && !statementLevel(e) && (this.checker.getSymbolAtLocation(e.left.name)?.flags ?? 0) & ts.SymbolFlags.Accessor) {
      const read = this.fresh('__read'), value = this.fresh('__value');
      const op = e.operatorToken.kind;
      const test = op === ts.SyntaxKind.AmpersandAmpersandEqualsToken ? `jsTruthy(${read})` : op === ts.SyntaxKind.BarBarEqualsToken ? `!jsTruthy(${read})` : `jsIsNullish(${read})`;
      const target = this.declaredTypeOf(e.left) ?? this.typeOf(e.left);
      const assigned = `val ${value} = ${this.stored(e.right, e.left, target)}`;
      const kept = isNullable(target) ? this.undefinedAs(read, this.typeOf(e)) : read;
      this.subst.set(e.right, value);
      try {
        return `run { val ${read} = ${this.expr(e.left)}; if (${test}) { ${assigned}; ${this.assignment(e.left, e.right)}; ${value} } else ${kept} }`;
      } finally {
        this.subst.delete(e.right);
      }
    }
    // `return (s += x)`: a compound assignment's value is its target after it (Kotlin's assignment has none).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind >= ts.SyntaxKind.FirstCompoundAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastCompoundAssignment && !statementLevel(e)) {
      // `(slot ??= new Map()).set(…)`: the target as the expression's type, which the target itself may hold untyped.
      const after = this.expr(e.left);
      const t = this.typeOf(e);
      const untyped = this.typeOf(e.left) === 'Any?' || after.startsWith('jsGet(');
      // A record's entry reads back nullable, though TypeScript types it as the value.
      const entry = ts.isElementAccessExpression(e.left) && this.typeOf(e.left.expression).replace(/\?$/, '').startsWith('JSRecord<') && t !== 'Unit' && !isNullable(t);
      return `run { ${this.binary(e)}; ${untyped && t !== 'Any?' && t !== 'Unit' ? this.checkedCast(after, t) : entry ? this.asserted(after) : after} }`;
    }
    // `x = ([a, b] = [b, a])`: the right side's value.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !statementLevel(e) && (ts.isArrayLiteralExpression(e.left) || ts.isObjectLiteralExpression(e.left)) && !this.subst.has(e.right)) {
      const tmp = this.fresh('__swap');
      const assigns: string[] = [];
      this.assignPattern(e.left, tmp, this.untypedSource(e.right) ? null : this.checker.getTypeAtLocation(e.right), assigns);
      return `run { val ${tmp} = ${this.expr(e.right)}; ${assigns.join('; ')}; ${tmp} }`;
    }
    // `(info.name = v)` as a value: the value assigned, evaluated once (Kotlin's assignment has none).
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && !statementLevel(e) && !ts.isArrayLiteralExpression(e.left) && !this.subst.has(e.right)) {
      // An object literal is held as the script object it is made as (`a = b = { value: 10, unit: 'px' }`).
      let last: ts.Expression = e.right;
      while (ts.isBinaryExpression(last) && last.operatorToken.kind === ts.SyntaxKind.EqualsToken) last = last.right;
      let t = this.typeOf(e.right) === 'Unit' || (!this.library && ts.isObjectLiteralExpression(last)) ? 'Any?' : this.typeOf(e.right);
      // `a = b = null`: null of the target's type.
      const unset = e.right.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e.right) && e.right.text === 'undefined');
      if (this.library && unset && this.typeOf(e.left) !== 'Any?') t = optionalType(this.typeOf(e.left));
      // Library mode: a target declared nullable (`let match: RegExpExecArray` set from `exec`) holds what may be missing.
      if (this.library && this.isObjectType(t) && this.declaredTypeOf(e.left) === optionalType(t) && this.nullTolerant(e)) t = optionalType(t);
      // `(map[k] = [])`: TypeScript types the empty literal `never[]`; it is made as the target's array, the one stored.
      const target = (this.declaredTypeOf(e.left) ?? this.typeOf(e.left)).replace(/\?$/, '');
      if (ts.isArrayLiteralExpression(last) && !last.elements.length && t === 'JSArray<Any?>' && target.startsWith('JSArray<')) t = target;
      const v = this.fresh('__assigned');
      const value = this.stored(e.right, e.left, t);
      this.subst.set(e.right, v);
      try {
        return `run { val ${v}: ${t} = ${value}; ${this.binary(e)}; ${v} }`;
      } finally { this.subst.delete(e.right); }
    }
    if (ts.isNumericLiteral(e)) return numberLiteral(e.text);
    if (ts.isBigIntLiteral(e)) return `JSBigInt.literal(${kotlinString(e.text.replace(/n$/, ''))})`;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return kotlinString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return pure('true');
    if (e.kind === ts.SyntaxKind.FalseKeyword) return pure('false');
    if (e.kind === ts.SyntaxKind.NullKeyword) return pure(this.typeOf(e) === 'Any?' && !this.optionalContext(e) ? 'jsNull' : 'null');
    if (e.kind === ts.SyntaxKind.ThisKeyword) {
      // App mode: a function expression called plainly, as module code (strict) calls it, has no `this`.
      if (!this.library && !this.thisAlias && ts.findAncestor(e.parent, (n) => ts.isFunctionLike(n) && !ts.isArrowFunction(n))?.kind === ts.SyntaxKind.FunctionExpression) return pure('null');
      return pure(this.thisAlias ?? 'this');
    }
    // `import.meta` of the bundled app's module, in the app's files.
    if (ts.isMetaProperty(e) && e.keywordToken === ts.SyntaxKind.ImportKeyword) return 'jsImportMeta';
    if (e.kind === ts.SyntaxKind.SuperKeyword) return 'super';
    if (ts.isIdentifier(e)) {
      if (this.states.nullishRead(e)) {
        if (isWriteTarget(e)) throw this.error(e, 'a compound assignment to a slot that may be null or undefined both');
        if (this.lenientApp) return `${this.refName(e)}.jsAny`;
        return this.narrowed(e, `${this.refName(e)}.optional`);
      }
      return this.identifier(e);
    }
    if (ts.isTemplateExpression(e)) {
      // `${x}` alone: the conversion itself, where it gives a string (a String value may still hold null, which the template prints).
      if (!e.head.text && e.templateSpans.length === 1 && !e.templateSpans[0].literal.text) {
        const only = this.str(e.templateSpans[0].expression);
        if (/^js(ToString)?\(/.test(only)) return only;
      }
      let out = escapeText(e.head.text);
      for (const span of e.templateSpans) out += `\${${this.str(span.expression)}}` + escapeText(span.literal.text);
      return `"${out}"`;
    }
    // `{ … } satisfies T`: the literal's own type, which `satisfies` only checks against T.
    if (ts.isSatisfiesExpression(e) && ts.isObjectLiteralExpression(e.expression)) return this.coerce(e.expression, this.typeOf(e));
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) {
      // `x as never`, which script writes to pass anything: the value as it is.
      if (this.library && this.typeOf(e) === 'Any?' && this.checker.getTypeAtLocation(e).flags & ts.TypeFlags.Never) return this.coerce(e.expression, 'Any?');
      const from = this.typeOf(e.expression);
      const to = this.typeOf(e);
      const shared = this.uncheckedCast(e);
      if (shared) return cast(this.expr(e.expression), shared);
      const wider = from === 'Any?' ? this.widenedAssertion(e) : null;
      if (wider) return this.fromAny(this.expr(e.expression), isNullable(to) ? optionalType(wider) : wider);
      // The assertion is erased in JavaScript: where Kotlin needs the type, the value is converted as script converts it there.
      const entry = from === 'Any?' && !this.library && !this.lenient ? this.states.foreignEntry(e) : null;
      const checked = entry && this.type(entry.type, e) === to ? this.checkedConvert(this.expr(e.expression), entry, e) : null;
      if (checked) return checked;
      if (!this.library && from === 'Any?' && ['String', 'Double', 'Boolean'].includes(to)) return `jsAsserted${to === 'Double' ? 'Number' : to}(${this.expr(e.expression)})`;
      if (from === 'Any?' && to !== 'Any?') {
        // A script function asserted to a function type taking a rest (`as (...a: unknown[]) => unknown`): the rest is spread
        // into its arguments, as JavaScript calls it.
        const g = functionTypeParts(to.replace(/^\((.*)\)\?$/, '$1'));
        const sig = this.checker.getTypeAtLocation(e).getNonNullableType().getCallSignatures()[0]?.getDeclaration();
        const rest = g && sig && !ts.isJSDocSignature(sig) && sig.parameters.at(-1)?.dotDotDotToken ? sig.parameters.length - 1 : -1;
        if (g && rest >= 0 && rest === g.params.length - 1) {
          const names = g.params.map((_, k) => pure(`__c${k}`));
          const call = `jsCall(__f, ${[...names.slice(0, rest), `*${names[rest]}.toList().toTypedArray()`].join(', ')})`;
          const lam = `{ ${g.params.map((t, k) => `${names[k]}: ${t}`).join(', ')} -> ${g.ret === 'Unit' ? `${call}; Unit` : this.fromAny(call, g.ret)} }`;
          return `run { val __f = ${this.expr(e.expression)}; ${/\)\?$/.test(to) ? `if (jsIsNullish(__f)) null else ${lam}` : lam} }`;
        }
        return this.fromAny(this.expr(e.expression), to);
      }
      // `<androidx.fragment.app.Fragment>object` of a `java.lang.Object`.
      if (from === 'Any' && to !== 'Any' && to !== 'Any?') return this.fromAny(this.expr(e.expression), to);
      // `x as string` of a string that may be undefined: the value as JavaScript then reads it as one.
      if (['String', 'Double', 'Boolean'].includes(to) && from === `${to}?`) return this.undefinedAs(this.expr(e.expression), to);
      // An object of one shape asserted another's (`cur as ICalEvent` of a `Partial<ICalEvent> & {…}`): Kotlin's classes are apart, so
      // the object is read as the asserted interface's, by its keys.
      const [fromName, toName] = [from.replace(/\?$/, ''), to.replace(/\?$/, '')];
      const fieldClass = (n: string) => (this.interfaces.has(n) && !this.protocols.has(n)) || [...this.shapes.values()].some((x) => x.name === n);
      if (!this.library && fromName !== toName && fieldClass(fromName) && this.interfaces.has(toName) && !this.protocols.has(toName)) {
        return from.endsWith('?') ? `${this.expr(e.expression)}?.let { ${toName}.fromJS(it) }` : `${toName}.fromJS(${this.expr(e.expression)})`;
      }
      if (from !== to && from.replace(/\?$/, '') !== to.replace(/\?$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) {
        // Library mode: a script assertion never fails, so a value of another class (a TabViewItem walked up to as a parent) reads as null where null fits.
        if (this.library && this.isClassDowncast(e) && (isNullable(to) || this.functionLiteralArgument(e))) return safeCast(this.expr(e.expression), to.replace(/\?$/, ''));
        return this.classCast(this.expr(e.expression), from, to);
      }
      if (from.endsWith('?') && !to.endsWith('?') && from.replace(/\?$/, '') === to) return this.asserted(this.expr(e.expression));
      // A function asserted to a function type of other parameter or result types: adapted, each value converted.
      const fnOf = (t: string) => t.replace(/^\((.*)\)\?$/, '$1');
      const f = from !== to ? functionTypeParts(fnOf(from)) : null, g = f ? functionTypeParts(fnOf(to)) : null;
      if (f && g && f.params.length === g.params.length) {
        const names = g.params.map((_, k) => pure(`__c${k}`));
        const call = `__f(${f.params.map((p, k) => this.convert(names[k], g.params[k], p)).join(', ')})`;
        const result = g.ret !== 'Unit' ? this.convert(call, f.ret, g.ret) : f.ret === 'Unit' ? call : `${call}; Unit`;
        return `${this.expr(e.expression)}${from.endsWith('?') ? '?' : ''}.let { __f -> { ${g.params.map((p, k) => `${names[k]}: ${p}`).join(', ')} -> ${result} } }`;
      }
      return this.expr(e.expression);
    }
    // `f<T>`: the function, its type arguments only TypeScript's.
    if (ts.isExpressionWithTypeArguments(e)) return this.functionValue(e.expression);
    if (ts.isNonNullExpression(e)) {
      const maybe = this.maybeUndefined(e.expression);
      // `!` asserts nothing at run time: a missing string, number or boolean converts as JavaScript converts undefined.
      const primitive = !this.library && !this.lenient && ['String', 'Double', 'Boolean'].includes(this.typeOf(e)) && convertedRead(e);
      if (maybe) return primitive ? this.undefinedAs(this.unasserted(maybe), this.typeOf(e)) : this.asserted(maybe);
      const inner = this.expr(e.expression);
      const optional = this.typeOf(e.expression).endsWith('?') || this.declaredTypeOf(e.expression)?.endsWith('?');
      return optional ? (primitive ? this.undefinedAs(this.unasserted(inner), this.typeOf(e)) : this.asserted(inner)) : inner;
    }
    if (ts.isPropertyAccessExpression(e) && this.isAmbient(e)) return `jsGetOptional(${this.expr(e.expression)}, ${kotlinString(e.name.text)})`;
    // `ArrayBuffer.prototype`: the runtime class's.
    if (ts.isPropertyAccessExpression(e) && e.name.text === 'prototype' && ts.isIdentifier(e.expression) && BUFFER_TYPES.has(e.expression.text) && isLibDeclaration(this.resolve(e.expression)?.declarations?.[0])) return `JS${e.expression.text}.jsPrototype`;
    if (ts.isPropertyAccessExpression(e)) {
      const member = this.namespaceMember(e);
      // A namespace's class as a value: the class.
      const decl = member ? this.resolve(e.name)?.valueDeclaration : undefined;
      if (decl && ts.isClassDeclaration(decl)) return (ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e) || (ts.isNewExpression(e.parent) && e.parent.expression === e) ? member! : `${member}::class.java`;
      // A namespace's enum as a value (`Object.keys(Shapes.Kind)`): the object JavaScript makes of it.
      const p0 = e.parent;
      if (!this.library && decl && ts.isEnumDeclaration(decl) && this.isEnumObject(e) && !((ts.isPropertyAccessExpression(p0) || ts.isElementAccessExpression(p0)) && p0.expression === e) && !ts.isTypeOfExpression(p0)) return `${member}.jsEnumObject`;
      // A namespace's function as a value (`valueConverter: Length.parse`): a reference to it.
      if (member && this.library && decl && ts.isFunctionDeclaration(decl) && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) {
        const dot = member.lastIndexOf('.');
        return dot < 0 ? `::${member}` : `${member.slice(0, dot)}::${member.slice(dot + 1)}`;
      }
      return member ? this.narrowed(e, member) : this.property(e);
    }
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isCallExpression(e)) {
      const p = ts.walkUpParenthesizedExpressions(e.parent);
      if (this.lenientApp && !ts.isAwaitExpression(p) && !ts.isExpressionStatement(p) && !this.states.returnedAsIs(e) && this.states.lenientAsyncCall(e)) throw this.error(e, 'the promise of a non-strict async function that may give null or undefined, used other than by `await`,');
      return this.erasedResult(e, this.call(e));
    }
    if (ts.isNewExpression(e)) return this.newExpr(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) {
      const place = this.untypedPlace(e.operand);
      if (place) return this.keyedStep(place, e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-', true);
      const target = this.lvalue(e.operand);
      return `${target}.also { ${target} = it ${e.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} ${this.one(e.operand)} }`;
    }
    if (ts.isConditionalExpression(e)) {
      const t = this.typeOf(e);
      const fixed = this.staticTruth(e.condition);
      if (fixed !== undefined) return this.coerce(fixed ? e.whenTrue : e.whenFalse, t);
      return `(if (${this.cond(e.condition)}) ${branch(this.coerce(e.whenTrue, t))} else ${branch(this.coerce(e.whenFalse, t))})`;
    }
    // Library mode: `class { [property: string]: string }`, a constructor of plain objects.
    if (this.library && ts.isClassExpression(e) && !e.heritageClauses && e.members.every(ts.isIndexSignatureDeclaration)) return 'JSObject::class.java';
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
      // A field of a program class some code deletes: its flag (`keyPlan`).
      const decl = ts.isPropertyAccessExpression(target) ? this.checker.getSymbolAtLocation(target.name)?.valueDeclaration : undefined;
      if (decl && ts.isPropertyDeclaration(decl) && ts.isClassLike(decl.parent) && this.keyPlan(decl.parent)?.flagged.has((target as ts.PropertyAccessExpression).name.text)) {
        const t = target as ts.PropertyAccessExpression;
        if (!ts.isIdentifier(t.expression) && t.expression.kind !== ts.SyntaxKind.ThisKeyword) throw this.error(e, 'delete of a field of an object this expression makes');
        const o = this.expr(t.expression), n = t.name.text;
        return `run { if (${o}.__has_${n}) { ${o}.${ident(n)} = null; ${o}.__has_${n} = false }; true }`;
      }
      throw this.error(e, 'delete of this member');
    }
    if (ts.isVoidExpression(e)) {
      const code = this.exprStatement(e.expression);
      return this.isPure(code) ? 'null' : `run { ${code}; null }`;
    }
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
    return (this.isObjectRef(e) || this.typeOf(e) === 'Any?') && !this.maybeUndefined(e) && this.typeOf(e) !== 'JSSymbol' ? `jsToStringDefault(${this.coerce(e, 'Any?')})` : this.str(e);
  }

  /** A property key: a symbol's own key, anything else as a string. */
  private propertyKey(e: ts.Expression): string {
    if (this.library && this.typeOf(e) === 'Any?') return `jsPropertyKey(${this.expr(e)})`;
    return this.typeOf(e) === 'JSSymbol' ? this.symbolKey(this.expr(e)) : this.str(e);
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
    // A built-in constructor as a value: `TypeError` (`e.constructor === TypeError`) its class, as an instance's
    // constructor reads; `Number`, `String`, `Boolean` (`map(Number)`, `filter(Boolean)`) the conversion they call.
    const p0 = e.parent;
    const asValue = !((ts.isCallExpression(p0) || ts.isNewExpression(p0)) && p0.expression === e) && !(ts.isBinaryExpression(p0) && p0.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && p0.right === e)
      && !(ts.isPropertyAccessExpression(p0) && p0.expression === e) && !ts.isTypeOfExpression(p0);
    if (asValue && (ERRORS[e.text] || ['Number', 'String', 'Boolean'].includes(e.text)) && isLibDeclaration(this.resolve(e)?.declarations?.[0])) {
      if (ERRORS[e.text]) return `${ERRORS[e.text]}::class.java`;
      return `{ value: Any? -> ${e.text === 'Number' ? 'jsToNumber' : e.text === 'String' ? 'jsToString' : 'jsTruthy'}(value) }`;
    }
    // A function of the program compared (`cb === fn`), asserted untyped (`fn as any`) or given properties (`fn.tag = …`):
    // a reference to it. Where a value of another type is wanted, coerce adapts it instead.
    const outer = ts.walkUpParenthesizedExpressions(p0);
    const referenced = (ts.isPropertyAccessExpression(p0) && p0.expression === e && this.isExpando(p0)) || ts.isAsExpression(outer) || ts.isTypeAssertionExpression(outer)
      || (ts.isBinaryExpression(outer) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(outer.operatorToken.kind));
    // Where no function type is wanted (`Object.keys(fn)`, an `object` parameter).
    const objectWanted = (c: ts.Type | undefined) => !!c && !c.getCallSignatures().length && !(c.isUnion() && c.types.some((u) => u.getCallSignatures().length));
    const declared = !this.library && (referenced || (asValue && objectWanted(this.checker.getContextualType(e)))) ? this.resolve(e)?.valueDeclaration : undefined;
    if (declared && ts.isFunctionDeclaration(declared) && declared.body && !declared.typeParameters?.length && !declared.getSourceFile().isDeclarationFile && !this.implicitThis(declared) && !declared.parameters.some(isThisParameter)) return this.functionValue(e);
    // A core variable imported under another name (`Device as __platform_Device`): the kit's top-level one of its own name.
    const alias = this.checker.getSymbolAtLocation(e);
    const imported = alias && alias.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(alias) : undefined;
    if (imported && imported.name !== e.text && imported.flags & ts.SymbolFlags.Variable && isCoreDeclaration(imported.declarations?.[0]) && this.core?.kitMember('', imported.name)?.kind === 'var') return imported.name;
    const moduleVariable = !this.library ? this.core?.coreVariable?.(e) : null;
    if (moduleVariable) return moduleVariable;
    // An enum as a value (`Object.keys(Color)`): the object JavaScript makes of it.
    const enumDecl = this.library ? undefined : this.resolve(e)?.valueDeclaration;
    if (enumDecl && ts.isEnumDeclaration(enumDecl) && !enumDecl.getSourceFile().isDeclarationFile && !hasModifier(enumDecl, ts.SyntaxKind.ConstKeyword)
        && !((ts.isPropertyAccessExpression(p0) || ts.isElementAccessExpression(p0)) && p0.expression === e && !this.objectMethod(p0)) && !ts.isTypeOfExpression(p0)) return `${this.refName(e)}.jsEnumObject`;
    // A module of the program held as a value (`import * as tests`, handed to a runner): an object of its exports.
    const held = this.resolve(e);
    if (held && held.flags & ts.SymbolFlags.ValueModule && held.valueDeclaration && ts.isSourceFile(held.valueDeclaration) && !held.valueDeclaration.isDeclarationFile
        && !(ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e)) return this.moduleValue(e, held);
    // A function's literal constant read in a class the function declares: the literal, as a captured local would add a
    // constructor parameter that a class held as a value (`PagerAdapter = FragmentPagerAdapter`, made by `new`) is not given.
    const local = this.resolve(e)?.valueDeclaration;
    if (local && ts.isVariableDeclaration(local) && local.parent.flags & ts.NodeFlags.Const && local.initializer && ts.findAncestor(local, ts.isFunctionLike)) {
      let init: ts.Expression = local.initializer;
      while (ts.isParenthesizedExpression(init)) init = init.expression;
      const literal = ts.isNumericLiteral(init) || ts.isStringLiteral(init) || (ts.isPrefixUnaryExpression(init) && init.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(init.operand));
      const cls = ts.findAncestor(e, ts.isClassLike);
      if (literal && cls && ts.findAncestor(cls, ts.isFunctionLike) === ts.findAncestor(local, ts.isFunctionLike)) return this.expr(init);
    }
    // A parameter held as its base's class (`appOverride`), read for a member only the narrower class declares: cast to it.
    if (this.widenedParams.size && ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e) {
      const d = this.checker.getSymbolAtLocation(e)?.valueDeclaration;
      const w = d && ts.isParameter(d) ? this.widenedParams.get(d) : undefined;
      if (w && !this.checker.getPropertyOfType(w.base, e.parent.name.text)) return `(${ident(e.text)} as ${w.own})`;
    }
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
    // The global timer functions as values (`const schedule: any = setTimeout`).
    const timerValue = ({ setTimeout: 'jsSetTimeoutValue', setInterval: 'jsSetIntervalValue', clearTimeout: 'jsClearTimeoutValue', clearInterval: 'jsClearIntervalValue' } as Record<string, string>)[e.text];
    if (timerValue && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && !ts.isTypeOfExpression(e.parent)) {
      const decls = this.resolve(e)?.declarations ?? [];
      const global = (d: ts.Node) => d.getSourceFile().isDeclarationFile && (!ts.isExternalModule(d.getSourceFile()) || !!ts.findAncestor(d, (n) => ts.isModuleDeclaration(n) && n.name.text === 'global'));
      // Where a typed function is wanted (`pending.forEach(clearTimeout)`), the runtime's function itself.
      const typed = (e.text === 'clearTimeout' || e.text === 'clearInterval') && !!this.checker.getContextualType(e)?.getCallSignatures().length;
      if (decls.every(global)) return typed ? `::js${e.text[0].toUpperCase()}${e.text.slice(1)}` : timerValue;
    }
    const name = e.text;
    const shorthandFunction = this.library ? null : this.shorthandFunction(e);
    if (shorthandFunction) return shorthandFunction;
    if (this.isArguments(e)) {
      const fn = ts.findAncestor(e.parent, (n) => ts.isFunctionLike(n) && !ts.isArrowFunction(n)) as ts.SignatureDeclaration | undefined;
      if (!fn || !this.readsArguments(fn) || (ts.isFunctionExpression(fn) && !this.library)) throw this.error(e, '`arguments` of a function expression');
      return '__arguments';
    }
    if (name === 'undefined') return pure('null');
    if (name === 'NaN') return 'Double.NaN';
    if (name === 'Infinity') return 'Double.POSITIVE_INFINITY';
    if (name === 'Intl' && isLibDeclaration(this.resolve(e)?.declarations?.[0])) return 'jsIntl';
    // Before the global object's names: an import from an untyped package resolves to nothing.
    const moot = this.mootImport(e);
    if (moot) return moot;
    if (this.isAmbient(e)) return `jsGetOptional(jsGlobalThis, ${kotlinString(name)})`;
    if (!this.library) {
      const declared = this.resolve(e)?.declarations?.[0];
      // The bundled app's module is in the app's folder.
      if (name === '__dirname' && (!declared || declared.getSourceFile().isDeclarationFile)) return '(org.nativescript.kit.knownFolders.currentApp()?.path ?: "")';
      // A global a module declares itself (`declare var System: any`) or the app's declarations file (`declare var __CI__`, which its
      // bundler defines) is the global object's, undefined where nothing sets it; so is a function only core or the app declares
      // (`zonedCallback`, which core's globals set) as a value.
      const appAmbient = isAppDeclarationFile(declared);
      const ambientVar = !!declared && ts.isVariableDeclaration(declared) && ((!declared.getSourceFile().isDeclarationFile && hasModifier(declared.parent.parent, ts.SyntaxKind.DeclareKeyword)) || appAmbient);
      const ambientFn = !!declared && ts.isFunctionDeclaration(declared) && !declared.body && (appAmbient || isCoreDeclaration(declared)) && ts.isSourceFile(declared.parent) && !ts.isExternalModule(declared.parent) && !(ts.isCallExpression(e.parent) && e.parent.expression === e);
      if ((ambientVar || ambientFn) && !isWriteTarget(e)) {
        const t = this.typeOf(e);
        const code = `jsGetOptional(jsGlobalThis, ${kotlinString(name)})`;
        return t === 'Any?' || ambientFn ? code : this.fromAnyCode(code, t, true);
      }
    }
    // Library mode: `if (!console)`: a compiled program always has its console; `Reflect`, which it lacks, read from the global object.
    if (this.library && name === 'console' && isLibDeclaration(this.resolve(e)?.declarations?.[0]) && !(ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e)) return '(true as Any?)';
    if (this.library && name === 'Reflect' && isLibDeclaration(this.resolve(e)?.declarations?.[0])) return `jsGetOptional(jsGlobalThis, "Reflect")`;
    // `global` and `globalThis` are the program's global object, whatever declares them.
    if ((name === 'global' || name === 'globalThis') && (this.resolve(e)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile)) return pure('jsGlobalThis');
    // Library mode: a name nothing declares (an iOS global, `NSSearchPathDirectory`) is the global object's, undefined.
    if (this.library && !this.resolve(e)?.declarations?.length && !this.isArguments(e)) return `jsGetOptional(jsGlobalThis, ${kotlinString(name)})`;
    // Library mode: core's `global` and `globalThis` are the program's global object.
    if (this.library && (name === 'global' || name === 'globalThis') && (this.resolve(e)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile)) return pure('jsGlobalThis');
    const native = this.native?.identifier(e);
    if (native) return native;
    const sym = this.resolve(e);
    // Library mode: a Java package read as a value (`(<any>androidx).core`), the runtime's view of it.
    if (this.library && this.isJavaPackage(sym) && (!ts.isPropertyAccessExpression(e.parent) || ts.isAsExpression(e.parent.parent) || ts.isParenthesizedExpression(e.parent) || !!e.parent.questionDotToken)) return `JSJavaPackage(${kotlinString(name)})`;
    // A Java package read on through `?.` (`org.nativescript?.streamdown?.SyntaxHighlighter`, testing a class is there): the runtime's view of it.
    if (!this.library && this.isJavaPackage(sym) && ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e && !!e.parent.questionDotToken) return `JSJavaPackage(${kotlinString(name)})`;
    // An iOS API an Android build reaches: undefined at run time, as in NativeScript on Android.
    if (sym?.declarations?.length && sym.declarations.every((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return `jsUndefinedGlobal(${kotlinString(name)})`;
    const required = this.patterns.requiredCore(sym?.valueDeclaration);
    if (required) return `${KIT_NAMES_ANDROID[required] ?? required}::class.java`;
    // A core enum or class imported under another name (`AndroidDirectory as __fs_AndroidDirectory`): the kit's of its own name.
    if (!this.library && sym && sym.flags & (ts.SymbolFlags.Enum | ts.SymbolFlags.Class) && sym.name !== name && isCoreDeclaration(sym.declarations?.[0]) && this.core?.has(sym.name)) return sym.name;
    // A function core exports (`booleanConverter`) used as a value: kit-android's function of that name.
    if (!this.library && sym && sym.flags & ts.SymbolFlags.Function && isCoreDeclaration(sym.declarations?.[0]) && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) {
      // The timer functions are the runtime's (`pending.forEach(clearTimeout)`); an import under another name is the function it names.
      const own = sym.name === 'default' ? name : sym.name;
      const runtime = ({ setTimeout: 'jsSetTimeout', setInterval: 'jsSetInterval', clearTimeout: 'jsClearTimeout', clearInterval: 'jsClearInterval' } as Record<string, string>)[own];
      return `::${runtime ?? own}`;
    }
    // A module's function used as a value (`valueConverter: booleanConverter`): a reference to it.
    const value = sym;
    const fnDecl = value && value.flags & ts.SymbolFlags.Function ? value.declarations?.find((d): d is ts.FunctionDeclaration => ts.isFunctionDeclaration(d) && !!d.body) : undefined;
    if (fnDecl && (this.library || this.implicitThis(fnDecl)) && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) {
      const ref = this.refName(e);
      const self = fnDecl.parameters.find((q) => isThisParameter(q) && !this.voidThis(q));
      // A function taking `this` as a value (a property descriptor's `set`): the receiver is the caller's.
      if ((self || this.implicitThis(fnDecl)) && !this.readsArguments(fnDecl)) {
        const thisType = self ? this.type(this.checker.getTypeAtLocation(self.name), self) : 'Any?';
        const args = fnDecl.parameters.filter((q) => !isThisParameter(q)).map((q, k) => q.dotDotDotToken
          ? `JSArray(__a.drop(${k}).map { ${this.fromAnyCode('it', this.typeOf(q.name).replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
          : this.fromAnyCode(pure(`__a.getOrNull(${k})`), this.paramType(q), true));
        return `JSMethod ${lambda(['__self', '__a'], `${ref}(${[thisType === 'Any?' ? '__self' : `(__self as ${thisType})`, ...args].join(', ')})`)}`;
      }
      // Library mode: a function of an optional string, number or boolean held as a value (a shorthand's converter) may be given
      // anything (core probes converters with `unsetValue`): another kind of value is none of them, as `typeof` finds it.
      const kinds = fnDecl.parameters.map((p) => this.paramType(p));
      if (this.library && kinds.length && kinds.every((k) => /^(String|Double|Boolean)\?$/.test(k) || k === 'Any?') && kinds.some((k) => k !== 'Any?') && !fnDecl.parameters.some((p) => p.dotDotDotToken)) {
        const names = kinds.map((_, k) => pure(`__v${k}`));
        return `{ ${names.map((n) => `${n}: Any?`).join(', ')} -> ${ref}(${names.map((n, k) => (kinds[k] === 'Any?' ? n : `(${n} as? ${kinds[k].slice(0, -1)})`)).join(', ')}) }`;
      }
      const dot = ref.lastIndexOf('.');
      return dot < 0 ? `::${ref}` : `${ref.slice(0, dot)}::${ref.slice(dot + 1)}`;
    }
    const p = e.parent;
    // `Color.equals(…)` where ColorBase declares the static: Kotlin's companion members are not inherited.
    if (sym && sym.flags & ts.SymbolFlags.Class && ts.isPropertyAccessExpression(p) && p.expression === e) {
      const member = this.resolve(p.name)?.valueDeclaration;
      const owner = member && (ts.isMethodDeclaration(member) || ts.isPropertyDeclaration(member) || ts.isAccessor(member)) && isStatic(member) && ts.isClassDeclaration(member.parent) && !member.getSourceFile().isDeclarationFile ? member.parent : undefined;
      if (owner && owner !== sym.valueDeclaration) return this.className(owner);
    }
    if (sym && sym.flags & ts.SymbolFlags.Class && !(ts.isPropertyAccessExpression(p) && p.expression === e) && !(ts.isNewExpression(p) && p.expression === e)
        && !(ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && p.right === e) && !ts.isHeritageClause(p.parent ?? p)) {
      // A class used as a value (`prop.register(Drawer)`, `registerElement('drawer', Drawer)`): its Java class.
      const decl = sym.valueDeclaration;
      // An Angular component as a value (`dialog.open(Sheet)`): what creating and rendering it gives.
      if (decl && ts.isClassDeclaration(decl) && isAngularComponent(decl)) return `ComponentFactory { ${ident(this.declaredName(e))}().render() }`;
      const kit = decl && isCoreDeclaration(decl) && !this.library ? (KIT_NAMES_ANDROID[sym.name] ?? sym.name) : null;
      return `${kit ?? this.declaredName(e).split('.').map(ident).join('.')}::class.java`;
    }
    const ref = this.globalAlias(e) ?? this.refName(e);
    // Library mode: a class named where a member of that name is in scope (ApplicationCommon's `AndroidApplication` getter) by its package.
    if (this.library && this.appModule && sym && sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum) && !ref.includes('.') && this.memberInScope(e, name)) return `${this.appModule}.${ref}`;
    return this.narrowed(e, ref);
  }

  /** Whether a class enclosing `at`, or one it extends, has a member of this name. */
  private memberInScope(at: ts.Node, name: string): boolean {
    for (let cls = ts.findAncestor(at.parent, ts.isClassLike); cls; cls = ts.findAncestor(cls.parent, ts.isClassLike)) {
      if (this.checker.getTypeAtLocation(cls).getProperty(name)) return true;
    }
    return false;
  }

  private globalAlias(e: ts.Identifier): string | null {
    if (this.library) return null;
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

  /** A function value Kotlin holds nullable, called: V8's TypeError where it is missing. */
  private callable(code: string, callee: ts.Expression): string {
    return `(${this.unasserted(code)} ?: jsNotAFunction(${kotlinString(callee.getText().replace(/\s+/g, ''))}))`;
  }

  /** A read the checker has narrowed (`if (x) x.length`, `if (e instanceof Error) e.message`): Kotlin needs the unwrap or cast. */
  /** Names read as Kotlin holds them, optional, by a check of their own (`optionalRead`). */
  private readonly rawNames = new Set<ts.Node>();

  private narrowed(e: ts.Expression, code: string): string {
    if (isWriteTarget(e) || this.rawNames.has(e)) return code;
    const sym = ts.isIdentifier(e) ? this.resolve(e) : undefined;
    if (sym && this.undefinedVars.has(sym)) {
      const actual = this.typeOf(e);
      // Library mode: narrowed to another type by a guard (`_isCssPendingSubstitution(value)` of a string): cast.
      if (this.library && actual !== 'Any?' && this.undefinedVars.get(sym)!.replace(/\?$/, '') !== actual.replace(/\?$/, '') && this.isObjectType(actual)) return `(${code} as ${actual})`;
      if (this.states.nullVars.has(sym) && ['Double', 'String', 'Boolean'].includes(actual)) return `(${code} ?: ${actual === 'Double' ? '0.0' : actual === 'String' ? '"null"' : 'false'})`;
      return actual.endsWith('?') ? code : this.undefinedAs(code, actual);
    }
    const declared = this.declaredTypeOf(e);
    if (!declared) return code;
    const actual = this.typeOf(e);
    if (declared === actual || actual === 'Any?') return code;
    // A string, number or boolean that may be undefined reads as JavaScript reads undefined there; never refused.
    if (declared === optionalType(actual)) {
      if (this.nullTolerant(e) || this.nullableArgument(e) || this.states.takesUndefined(e)) return code;
      const field = isWriteTarget(e) ? null : this.states.placedField(e);
      if (field) return `jsRequired(${code}, ${kotlinString(field.name)})`;
      return this.lenient || ['String', 'Double', 'Boolean'].includes(actual) ? this.undefinedAs(code, actual) : this.asserted(code);
    }
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && (this.isObjectRef(e) || ['Double', 'String', 'Boolean'].includes(actual))) return `(${code} as ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isParenthesizedExpression(e)) return this.lvalue(e.expression);
    if (ts.isPropertyAccessExpression(e) && this.isSelf(e.expression) && this.props.has(e.name.text)) return `this.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e) && this.isAmbient(e)) return `jsGetOptional(${this.expr(e.expression)}, ${kotlinString(e.name.text)})`;
    if (ts.isPropertyAccessExpression(e)) {
      const member = this.namespaceMember(e);
      if (member) return member;
      const core = this.core?.lvalue(e);
      if (core) return core;
      const code = this.expr(e.expression);
      const target = this.typeOf(e.expression).endsWith('?') || this.isAsserted(code) ? this.present(code, e.name.text, e.expression, true) : code;
      return `${target}.${ident(e.name.text)}`;
    }
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return this.globalAlias(e) ?? this.refName(e);
    return this.expr(e);
  }

  /** A value as JavaScript converts it to a string (`String(x)`, `${x}`, `'' + x`). */
  str(e: ts.Expression): string {
    if (notedField(this.states, e) || this.states.nullDistinct(e)) return `jsToString(${this.coerce(e, 'Any?')})`;
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsToString(${maybe})`;
    // An app's `a?.b` typed present: Kotlin's chain gives a nullable, undefined where it stops.
    if (!this.library && ['String', 'Double', 'Boolean'].includes(this.typeOf(e)) && this.optionalChainEnd(e)) return `jsToString(${this.expr(e)})`;
    const t = this.typeOf(e);
    // A number or boolean an untrusted value was placed in converts as JavaScript converts undefined.
    if (!this.library && (t === 'Double' || t === 'Boolean') && this.heldNullable(e, t)) {
      this.nullOk.add(e);
      return `jsToString(${this.expr(e)})`;
    }
    // A string declared nullable converts as JavaScript converts undefined.
    if (t === 'String') {
      const code = this.expr(e);
      // A string the code asserts present (a call declared `string` returning null) converts as JavaScript converts null.
      if (this.isAsserted(code)) return `jsToString(${this.unasserted(code)})`;
      return this.declaredTypeOf(e)?.endsWith('?') ? `jsToString(${code})` : code;
    }
    if (t === 'Double' || t === 'Boolean') return `js(${this.expr(e)})`;
    // A value read as present (`${savedInstanceState}` of a Bundle that may be null): converted as it is.
    const code = this.expr(e);
    // A string only null may be missing from (`string | null`): null, as Kotlin holds both as one.
    if (t === 'String?' && onlyNull(this.checker.getTypeAtLocation(e))) return `(${code} ?: "null")`;
    return `jsToString(${this.isAsserted(code) && this.isPath(this.unasserted(code)) ? this.unasserted(code) : code})`;
  }

  /** A symbol's property key; a symbol Kotlin holds nullable keys as undefined does when it is missing. */
  private symbolKey(code: string): string {
    return this.isAsserted(code) ? `(${this.unasserted(code)}?.key ?: "undefined")` : `${code}.key`;
  }

  private property(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    if (!e.questionDotToken && !isWriteTarget(e)) {
      const continued = this.continuedChain(e, target, () => this.property(e));
      if (continued) return continued;
    }
    // A field of an erased type parameter (`Cached<T>.data`) holds any value: read as this instantiation types it.
    const fieldDecl = !this.library ? this.checker.getSymbolAtLocation(e.name)?.valueDeclaration : undefined;
    const fieldParam = fieldDecl && (ts.isPropertySignature(fieldDecl) || ts.isPropertyDeclaration(fieldDecl)) && fieldDecl.type && ts.isTypeReferenceNode(fieldDecl.type)
      ? this.checker.getSymbolAtLocation(fieldDecl.type.typeName)?.declarations?.[0] : undefined;
    if (fieldParam && ts.isTypeParameterDeclaration(fieldParam) && erasedTypeParameter(fieldParam) && !this.erasedReads.has(e)) {
      const want = this.typeOf(e);
      this.erasedReads.add(e);
      try {
        const read = this.expr(e);
        return want === 'Any?' ? read : e.questionDotToken || isNullable(want) ? this.fromAny(read, optionalType(want)) : /^JSArray</.test(want) ? this.fromAny(read, want) : this.fromAnyCode(read, want, true);
      } finally { this.erasedReads.delete(e); }
    }
    // A name of the global object (`global.CanvasModule`, which a binding installs): read by name, as script reads it.
    if (!this.library && this.isGlobalObject(target)) {
      // A Java package's root (`global.android`): the runtime's package object, as NativeScript's global has it.
      if (this.isJavaPackage(this.resolve(e.name))) return `JSJavaPackage(${kotlinString(name)})`;
      const t = this.typeOf(e);
      return t === 'Any?' ? `jsGet(jsGlobalThis, ${kotlinString(name)})` : this.fromAnyCode(`jsGet(jsGlobalThis, ${kotlinString(name)})`, t, true);
    }
    // A dynamic object (an allSettled result, an enum's object): its field read by name, as its type says.
    if (!this.library && this.typeOf(target).replace(/\?$/, '') === 'JSObject' && !e.questionDotToken && this.resolve(e.name)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile || ts.isEnumMember(d))) {
      const t = this.typeOf(e);
      const read = `jsField(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' ? read : this.fromAnyCode(read, t, true);
    }
    if (this.isSelf(target) && this.props.has(name)) return `this.${ident(name)}.value`;
    // A value this platform's code never has (the iOS half of `__APPLE__ ? x : null`, narrowed to never): read by name.
    if (!this.library && this.typeOf(target) === 'Nothing' && !isWriteTarget(e)) return `jsGet(${ts.isIdentifier(target) ? ident(target.text) : this.coerce(target, 'Any?')}, ${kotlinString(name)})`;
    if (name === 'raw' && this.symbolName(target) === 'TemplateStringsArray') return `jsTemplateRaw(${this.expr(target)})`;
    if (name === 'description' && this.typeOf(target) === 'JSSymbol') return `${this.expr(target)}.jsDescription`;
    if (this.isAmbient(e)) return `jsGetOptional(${this.expr(target)}, ${kotlinString(name)})`;
    // Library mode: a Java package used as a value (`const graphics = androidx.core.graphics`), or read on through `?.`.
    if (this.isJavaPackage(this.resolve(e.name)) && (this.library ? !ts.isPropertyAccessExpression(e.parent) || !!e.parent.questionDotToken : ts.isPropertyAccessExpression(e.parent) && !!e.parent.questionDotToken)) return `JSJavaPackage(${kotlinString(e.getText().replace(/\s+|\?/g, ''))})`;
    // `Function.prototype`: a function doing nothing.
    if (name === 'prototype' && ts.isIdentifier(target) && target.text === 'Function' && this.resolve(target)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return 'JSFunction { null }';
    // Library mode: a class's prototype, the registry's object for it.
    if (name === 'prototype' && this.resolve(target)?.flags! & ts.SymbolFlags.Class && !this.resolve(target)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return `JSPrototypes.of(${this.expr(target)}::class.java)`;
    if (ts.isIdentifier(target) && this.isLibGlobal(target)) {
      const constant = LIB_CONSTANTS[`${target.text}.${name}`];
      if (constant) return constant;
      if (`${target.text}.${name}` === 'Date.now') return '{ JSDate.now() }';
      // `const round = Math.round`: the function as a value.
      if (target.text === 'Math' && MATH_UNARY[name]) return `{ __x: Double -> ${MATH_UNARY[name]}(__x) }`;
      throw this.error(e, `${target.text}.${name}`);
    }
    const enumMember = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const constant = enumMember && ts.isEnumMember(enumMember) ? this.checker.getConstantValue(enumMember) : undefined;
    if (constant !== undefined && enumMember!.getSourceFile().isDeclarationFile && !this.native?.isNativeDeclaration(enumMember!)) {
      return typeof constant === 'string' ? kotlinString(constant) : numberLiteral(String(constant));
    }
    // `object.constructor`, the class of the instance.
    if (name === 'constructor' && this.typeOf(target) !== 'Any?' && this.checker.getSymbolAtLocation(e.name)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return `${this.typeOf(target).endsWith('?') ? this.present(this.expr(target), name, target) : this.expr(target)}.javaClass`;
    // A constructor's name: the library's error classes by their JavaScript names, a class held as a value by its own.
    if (name === 'name' && !isWriteTarget(e)) {
      if (ts.isIdentifier(target) && ERRORS[target.text] && isLibDeclaration(this.resolve(target)?.declarations?.[0])) return kotlinString(target.text);
      const ctor = ts.isPropertyAccessExpression(target) && target.name.text === 'constructor' && this.typeOf(target.expression) !== 'Any?' && !!this.checker.getSymbolAtLocation(target.name)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
      if (ctor || this.typeOf(target).replace(/\?$/, '').startsWith('Class<')) return `jsConstructorName(${this.expr(target)})`;
    }
    // A match's `groups` is the runtime's plain object: read as the dictionary its type says.
    if (name === 'groups' && !isWriteTarget(e) && this.typeOf(target).replace(/\?$/, '') === 'JSMatch' && /^JSRecord<.*>\??$/.test(this.typeOf(e))) {
      const value = this.typeOf(e).replace(/\?$/, '').replace(/^JSRecord<(.*)>$/, '$1');
      return `jsRecordOrNull<${value}>(${this.expr(target)}${e.questionDotToken || this.typeOf(target).endsWith('?') ? '?' : ''}.groups)`;
    }
    const maybeChain = e.questionDotToken ? this.maybeUndefined(e) : null;
    // An array the chain reads an element of (`group?.items[i]`): the element read goes on with the chain.
    const intoElement = ts.isElementAccessExpression(e.parent) && e.parent.expression === e && !!(e.parent.flags & ts.NodeFlags.OptionalChain) && !isWriteTarget(e.parent) && this.typeOf(e).startsWith('JSArray<');
    if (maybeChain) return intoElement ? maybeChain : this.undefinedAs(maybeChain, this.typeOf(e));
    const core = this.core?.property(e);
    if (core) return core;
    if (this.isExpando(e)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, t, true);
    }
    const native = this.native?.property(e);
    if (native) return native;
    // Library mode: a Java class used as a value (`const compat = androidx.core.view.ViewCompat`).
    const p = e.parent;
    const cls = this.library ? this.resolve(e.name) : undefined;
    if (cls && cls.flags & ts.SymbolFlags.Class && cls.declarations?.some((d) => this.native?.isNativeDeclaration(d)) && !((ts.isPropertyAccessExpression(p) || ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression === e)
        && !(ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) && !ts.isExpressionWithTypeArguments(p)) return `${e.getText().replace(/\s+/g, '')}::class.java`;
    // A field the app's class only types again: the kit class's property, read as the app declares it.
    const retyped = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    if (!isWriteTarget(e) && this.kitRedeclared(retyped)) {
      const kitType = this.core!.kitMember(this.kitRootOf(retyped.parent as ts.ClassLikeDeclaration)!, name)!.type;
      const own = this.typeOf(e);
      const read = `${this.typeOf(target).endsWith('?') ? (e.questionDotToken ? `${this.expr(target)}?` : this.present(this.expr(target), name, target)) : this.expr(target)}.${ident(name)}`;
      return kitType === own ? read : kitType.replace(/\?$/, '') === own.replace(/\?$/, '') ? this.convert(read, kitType, own) : this.unchecked(own, read);
    }
    if (this.structuralTypeParam(target)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${kotlinString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, t, true);
    }
    const base = this.typeOf(target);
    // An event's data beyond its name, object and value (a drawer's `side`): read by key.
    if (base.replace(/\?$/, '') === 'EventData' && !(this.library ? ['eventName', 'object'] : ['value', 'item', 'eventName', 'object', 'index', 'view', 'type', 'state', 'deltaX', 'deltaY', 'scale', 'rotation', 'direction', 'action', 'newValue']).includes(name)) {
      if (this.library) {
        const t = this.typeOf(e);
        const code = `jsGet(${this.expr(target)}, ${kotlinString(name)})`;
        return t === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, t, true);
      }
      const t = this.typeOf(e);
      const code = `${this.expr(target)}.jsGet(${kotlinString(name)})`;
      return t === 'Any?' ? code : this.fromAnyCode(code, t, true);
    }
    // An event's object typed as the view that raises it (`args: { object: Canvas }`): the generated kit's EventData holds an Observable.
    if (this.generatedKit && name === 'object' && base.replace(/\?$/, '') === 'EventData' && !e.questionDotToken && !isWriteTarget(e)) {
      const t = this.typeOf(e);
      if (t !== 'Any?' && !/^Observable\??$/.test(t)) return `(${base.endsWith('?') ? this.present(this.expr(target), 'object', target) : this.expr(target)}.\`object\` as ${t})`;
    }
    // The generated kit's EventData holds its object nullable: a member read through it (`args.object.get(…)`) reads it present.
    if (this.generatedKit && name === 'object' && base.replace(/\?$/, '') === 'EventData' && !e.questionDotToken && !isWriteTarget(e) && ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e && !e.parent.questionDotToken) {
      return this.asserted(`${base.endsWith('?') ? this.present(this.expr(target), 'object', target) : this.expr(target)}.\`object\``);
    }
    // Inside an optional chain (`a?.b.c`) an undefined link ends the chain.
    const inChain = !!(e.flags & ts.NodeFlags.OptionalChain) && base.endsWith('?');
    const dot = e.questionDotToken || inChain ? '?.' : '.';
    const recv = () => {
      const checked = this.receiver(target, name);
      if (checked) return checked;
      const code = this.expr(target);
      return (base.endsWith('?') && !e.questionDotToken && !inChain && !this.isSelf(target)) || this.isAsserted(code) ? this.present(code, name, target, isWriteTarget(e)) : code;
    };
    if (name === 'length' && this.isString(target)) {
      return e.questionDotToken || inChain ? `${this.expr(target)}?.length?.toDouble()` : `${recv()}.length.toDouble()`;
    }
    if (name === 'length' && (base.startsWith('Pair<') || base.startsWith('Triple<'))) return base.startsWith('Pair<') ? '2.0' : '3.0';
    // `this.x` in a static method, of a static field the class declares: the companion's.
    const staticOwn = target.kind === ts.SyntaxKind.ThisKeyword && !!this.resolve(e.name)?.declarations?.some((d) => ts.isPropertyDeclaration(d) && isStatic(d));
    if (this.isAny(target) && !staticOwn) {
      const t = this.typeOf(e);
      const code = `${e.questionDotToken || inChain ? 'jsGetOptional' : 'jsGet'}(${this.expr(target)}, ${kotlinString(name)})`;
      // Library mode: a member an untyped object may lack, as script reads it (its type's undefined).
      return t === 'Any?' || isWriteTarget(e) ? code : isCompared(e) || (this.library && (e.questionDotToken || inChain) && this.isObjectType(t) && !((ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression === e && !e.parent.questionDotToken)) ? this.fromAny(code, optionalType(t)) : this.library || t === 'Double' ? this.fromAnyCode(code, t, true) : this.fromAny(code, t);
    }
    if (base.replace(/\?$/, '').startsWith('JSRecord<')) {
      const read = base.endsWith('?') ? `${this.expr(target)}?.get(${kotlinString(name)})` : `${this.expr(target)}[${kotlinString(name)}]`;
      const t = this.typeOf(e);
      if (isWriteTarget(e) || t.endsWith('?')) return read;
      const z = this.zero(t);
      return z && z !== 'null' ? `(${read} ?: ${z})` : this.asserted(read);
    }
    if (base === 'EventData' && (name === 'value' || name === 'item')) {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.${name}` : this.fromAny(`${this.expr(target)}.${name}`, t);
    }
    // A method used as a value is a bound reference.
    const symbol = this.checker.getSymbolAtLocation(e.name);
    const called = ts.isCallExpression(e.parent) && e.parent.expression === e;
    // Library mode: a promise's method, its Kotlin overloads generic: the method as script reads it.
    if (this.library && symbol && symbol.flags & ts.SymbolFlags.Method && !called && isLibDeclaration(symbol.declarations?.[0]) && /^JSPromise</.test(base)) return this.fromAnyCode(`jsGet(${this.coerce(target, 'Any?')}, ${kotlinString(name)})`, this.typeOf(e), true);
    if (symbol && symbol.flags & ts.SymbolFlags.Method && !called && !this.isFunctionField(symbol)) {
      // A static method of a class the program declares: its companion's, not the instance method of that name (`ColorBase.equals`).
      const decl = symbol.valueDeclaration;
      const method = this.isCompiledMethod(symbol) ? this.methodIdent(name) : ident(name);
      if (this.library && decl && ts.isMethodDeclaration(decl) && isStatic(decl) && ts.isClassDeclaration(decl.parent) && !decl.getSourceFile().isDeclarationFile && !decl.parameters.some((q) => q.dotDotDotToken || isThisParameter(q))) {
        const params = decl.parameters.map((q, k) => `__s${k}: ${this.paramType(q)}`);
        return `{ ${params.join(', ')} -> ${this.className(decl.parent)}.${method}(${decl.parameters.map((_, k) => `__s${k}`).join(', ')}) }`;
      }
      const r = recv();
      if (target.kind !== ts.SyntaxKind.SuperKeyword && !isWriteTarget(e) && this.isInstanceKey(e.name)) {
        const o = this.fresh('__o'), own = this.fresh('__own');
        const read = `val ${own} = jsOwnProperty(${o}, ${kotlinString(name)}); if (${own} != null) ${this.fromAnyCode(`${own}.value`, this.typeOf(e).replace(/\?$/, ''), true)} else ${o}::${method}`;
        return r.endsWith('?') ? `${r.slice(0, -1)}?.let { ${o} -> ${read} }` : `${r}.let { ${o} -> ${read} }`;
      }
      // Read through `?.` (`child?.getChildAt`): undefined where the receiver is.
      return r.endsWith('?') ? `${r.slice(0, -1)}?.let { __r -> __r::${method} }` : `${r}::${method}`;
    }
    // Library mode: a member core's declarations type otherwise than its compiled class (`parent: View` of `index.d.ts`, `ViewBase` compiled): cast.
    const described = this.library && symbol?.valueDeclaration?.getSourceFile().isDeclarationFile && !isLibDeclaration(symbol.valueDeclaration) && !this.native?.isNativeDeclaration(symbol.valueDeclaration) && !isWriteTarget(e)
      ? this.fieldIn(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)), name) ?? this.compiledField(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)), name) : undefined;
    // Library mode: a field of a generic class (`Property<T, U>.defaultValue`), its type parameters erased: read as this use's type.
    // So is any field compiled untyped that this read types (`Style.fontStyle`, a union of strings and an enum's).
    // So is a field or getter of a package's source (`FormGroup.controls`) read outside it, its class's type parameters erased.
    const vd = symbol?.valueDeclaration;
    const packageMember = !this.library && !!vd && (ts.isPropertyDeclaration(vd) || ts.isGetAccessorDeclaration(vd)) && this.pluginFiles.has(vd.getSourceFile().fileName) && !this.pluginFiles.has(e.getSourceFile().fileName);
    const erased = (this.library || packageMember) && vd && (ts.isPropertyDeclaration(vd) || (packageMember && ts.isGetAccessorDeclaration(vd))) && !vd.getSourceFile().isDeclarationFile
      && ts.isClassLike(vd.parent) && !isWriteTarget(e)
      && this.typeOf(vd.name) === 'Any?' && this.typeOf(e) !== 'Any?';
    // A package's record or array is read as script reads it, a plain object shared rather than refused.
    if (erased) return packageMember && /^JS(Record|Array)</.test(this.typeOf(e)) ? this.fromAny(`${recv()}${dot}${ident(name)}`, this.typeOf(e)) : this.fromAnyCode(`${recv()}${dot}${ident(name)}`, this.typeOf(e), true);
    // Library mode: a member core's declarations give a class whose compiled code has none (`Transition.androidFragmentTransactionCallback`,
    // its subclasses'): read by name.
    const describedClass = this.library && symbol?.valueDeclaration?.getSourceFile().isDeclarationFile && !isLibDeclaration(symbol.valueDeclaration) && !this.native?.isNativeDeclaration(symbol.valueDeclaration)
      ? this.compiledClasses().get(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)).getSymbol()?.name ?? '') : undefined;
    // Library mode: a member TypeScript does not find on the type (lenient code reading what the type omits): read by name.
    const unknown = this.library && !symbol && !e.name.text.startsWith('#') && this.isObjectRef(target);
    if ((describedClass && !this.compiledMember(describedClass, name) || unknown) && !(ts.isCallExpression(e.parent) && e.parent.expression === e && !e.parent.questionDotToken)) {
      const t = this.typeOf(e);
      const code = `${e.questionDotToken || inChain ? 'jsGetOptional' : 'jsGet'}(${this.expr(target)}, ${kotlinString(name)})`;
      // Called (`x.callback?.(…)`): the function as script holds it, which the call reads.
      return t === 'Any?' || isWriteTarget(e) || (ts.isCallExpression(e.parent) && e.parent.expression === e) ? code : this.fromAnyCode(code, t, true);
    }
    if (described) {
      const t = this.typeOf(e);
      const own = this.typeOf(described.name);
      // Compiled untyped (a union of strings and an enum's): as this read's type, the type's zero where it is missing.
      if (own === 'Any?' && t !== 'Any?' && !isWriteTarget(e)) return this.fromAnyCode(`${recv()}${dot}${ident(name)}`, t, true);
      if (t !== 'Any?' && own.replace(/\?$/, '') !== t.replace(/\?$/, '') && this.isObjectType(t)) return this.narrowed(e, `(${recv()}${dot}${ident(name)} as ${optionalType(t)})`);
    }
    // Library mode: a field a subclass redeclares more narrowly is its base's, cast to the subclass's type.
    const redeclared = this.library && symbol?.valueDeclaration && ts.isPropertyDeclaration(symbol.valueDeclaration) && this.redeclaredField(symbol.valueDeclaration);
    if (redeclared && !isWriteTarget(e)) {
      const t = this.typeOf(e);
      const base = this.typeOf(redeclared.name);
      // Over an untyped base field, which may hold JavaScript's null.
      if (t !== 'Any?' && t !== base) return this.narrowed(e, base === 'Any?' ? this.fromAny(`${recv()}${dot}${ident(name)}`, optionalType(t)) : `(${recv()}${dot}${ident(name)} as ${optionalType(t)})`);
    }
    const receiver = recv();
    const plain = `${receiver}${dot}${ident(name)}`;
    const read = dot === '.' ? this.marked(plain, { op: 'member', of: this.valueOf(receiver), name }) : plain;
    // A non-strict app's optional member is held optional though its type says present: a value read reads its undefined.
    if (this.optionalMember(e) && !isWriteTarget(e) && ['String', 'Double', 'Boolean'].includes(this.typeOf(e))) return this.undefinedAs(read, this.typeOf(e));
    return this.narrowed(e, read);
  }

  /** A method an object type declares, which its class for object literals holds as a function-typed field. */
  private isFunctionField(symbol: ts.Symbol): boolean {
    return !!symbol.declarations?.length && symbol.declarations.every((d) => {
      if (!ts.isMethodSignature(d)) return false;
      const owner = ts.isInterfaceDeclaration(d.parent) ? d.parent.name.text : ts.isTypeLiteralNode(d.parent) && ts.isTypeAliasDeclaration(d.parent.parent) ? d.parent.parent.name.text : null;
      return !!owner && this.interfaces.has(owner) && !this.protocols.has(owner);
    });
  }

  /** A key as its message names it. */
  private keyText(key: ts.Expression): string {
    return ts.isNumericLiteral(key) || ts.isStringLiteral(key) ? kotlinString(key.text) : this.str(key);
  }

  /** `re.exec(s)` or `s.match(re)` where a non-strict program's types leave out the null of no match. */
  private uncheckedMatch(e: ts.Expression): boolean {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (this.typeOf(e) !== 'JSMatch' || !ts.isCallExpression(e) || !ts.isPropertyAccessExpression(e.expression)) return false;
    const { name, expression } = e.expression;
    return name.text === 'exec' ? this.isRegExp(expression) : name.text === 'match' && this.typeOf(expression).replace(/\?$/, '') === 'String';
  }

  /** A receiver that can be missing though its type says not (`x!`, `items[i]`): JavaScript's TypeError when it is. */
  private receiver(target: ts.Expression, key: string): string | null {
    return this.receiverCode(receiverCell(this.receivers, receiverSlot(target, key)), key);
  }

  /** A receiver cell as Kotlin writes it: null where the access reads it as it is. */
  private receiverCode(c: ReceiverCell, key: string): string | null {
    return c.cell === 'asIs' ? null : `(${c.code} ?: ${c.isNull ? 'jsCannotReadNull' : 'jsCannotRead'}(${kotlinString(key)}))`;
  }

  private receiversSet?: ReceiverBackend;

  /** What the shared receiver cells (placement.ts) read of this translator. */
  private get receivers(): ReceiverBackend {
    const t = this;
    return this.receiversSet ??= {
      checker: t.checker,
      states: t.states,
      expr: (e) => t.expr(e),
      maybeUndefined: (e) => t.maybeUndefined(e),
      awaited: (e) => t.awaited(e),
      held: (x) => t.optionalRead(x) ?? t.heldResult(x),
      receiverBefore: ({ target }) => (t.uncheckedMatch(target) ? { cell: 'present', code: t.expr(target), isNull: true } : null),
    };
  }

  /** A call whose result Kotlin holds nullable though its type says present, read as it is held. */
  private heldResult(x: ts.Expression): string | null {
    if (!ts.isCallExpression(x) || !this.unwrapsResult(x)) return null;
    this.rawResults.add(x);
    try { return this.expr(x); } finally { this.rawResults.delete(x); }
  }

  /** A parameter or member Kotlin declares optional, read as it is held. */
  private optionalRead(x: ts.Expression): string | null {
    // Library code reads its own interfaces' members by key (`jsGet`): they have no Kotlin field to read as held.
    if (ts.isPropertyAccessExpression(x) && this.library && this.resolve(x.name)?.declarations?.some((d) => ts.isPropertySignature(d) && !isLibDeclaration(d))) return null;
    if (ts.isPropertyAccessExpression(x)) return this.optionalMember(x) || (!this.typeOf(x).endsWith('?') && !!this.declaredTypeOf(x)?.endsWith('?')) ? `${this.expr(x.expression)}.${ident(x.name.text)}` : null;
    const d = ts.isIdentifier(x) ? this.resolve(x)?.valueDeclaration : undefined;
    if (!d || !(ts.isParameter(d) || ts.isVariableDeclaration(d)) || !this.declaredTypeOf(x)?.endsWith('?')) return null;
    this.rawNames.add(x);
    try { return this.expr(x); } finally { this.rawNames.delete(x); }
  }

  /** A non-strict app's read of an object type's optional member (`o.a`, `a?: string`), which Kotlin holds optional. */
  private optionalMember(x: ts.PropertyAccessExpression): boolean {
    if (!this.lenientApp || this.library || x.questionDotToken || x.flags & ts.NodeFlags.OptionalChain || this.typeOf(x).endsWith('?')) return false;
    const d = this.resolve(x.name)?.valueDeclaration;
    return !!d && ts.isPropertySignature(d) && !!d.questionToken && !d.getSourceFile().isDeclarationFile;
  }

  /**
   * A receiver Kotlin holds nullable, where JavaScript reads `key` of it: the value, or V8's TypeError when it is
   * missing. An assertion the code carries (`x!!`) is taken over.
   */
  present(code: string, key: string | ts.Expression, target?: ts.Expression, write = false): string {
    const value = this.unasserted(code);
    const missing = write ? 'jsCannotSet' : target && onlyNull(this.checker.getTypeAtLocation(target)) ? 'jsCannotReadNull' : 'jsCannotRead';
    // A key read through the receiver itself (`a[a.length - 1]`) is named as written: past the `?:`, Kotlin knows the receiver null.
    const keyCode = typeof key === 'string' ? kotlinString(key) : this.keyText(key);
    const named = typeof key !== 'string' && keyCode.includes(value) ? kotlinString(key.getText()) : keyCode;
    return `(${value} ?: ${missing}(${named}))`;
  }

  private elementAccess(e: ts.ElementAccessExpression): string {
    const key = e.argumentExpression;
    // `Enum[name]`, `Enum[value]`: the object JavaScript makes of the enum, by key.
    const enumDecl = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (((enumDecl && ts.isEnumDeclaration(enumDecl) && !enumDecl.getSourceFile().isDeclarationFile) || this.isEnumObject(e.expression)) && !ts.isStringLiteral(key) && !isWriteTarget(e)) {
      const rt = this.typeOf(e);
      const code = `${this.expr(e.expression)}.jsEnumObject.jsGet(${this.propertyKey(key)})`;
      return rt === 'Any?' ? code : this.fromAny(code, rt);
    }
    // Library mode: an untyped variable narrowed by `key in owner` to a shape, read by key as it is.
    const raw = this.library && ts.isIdentifier(e.expression) && this.declaredTypeOf(e.expression) === 'Any?' && this.isObjectRef(e.expression) && !this.typeOf(e.expression).startsWith('JS');
    const read = raw ? ident((e.expression as ts.Identifier).text) : this.expr(e.expression);
    const target = this.isAsserted(read) ? this.present(read, key, e.expression, isWriteTarget(e)) : read;
    const t = raw ? 'Any?' : this.typeOf(e.expression).replace(/\?$/, '');
    const q = e.questionDotToken ? '?' : '';
    if (raw) {
      const code = `jsGet(${target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      if (!isWriteTarget(e)) return rt === 'Any?' ? code : this.fromAnyCode(code, rt, true);
    }
    if (t === 'String' && !isWriteTarget(e) && !ts.isStringLiteral(key)) {
      // A string Kotlin holds nullable (a pattern's unset group) though its type says not: JavaScript's TypeError where it is missing.
      const present = !this.library && this.typeOf(e.expression) === 'String?' && !q && !(e.flags & ts.NodeFlags.OptionalChain) && ts.isIdentifier(e.expression) && this.unset.element(e.expression);
      const checked = !present && !q ? this.receiver(e.expression, ts.isNumericLiteral(key) || ts.isStringLiteral(key) ? key.text : key.getText()) : null;
      return this.undefinedAs(`jsCharAtOrNull(${present ? this.present(target, key, e.expression) : checked ?? target}, ${this.toNumber(key)})`, this.typeOf(e));
    }
    if (t === 'String') return `jsCharAt(${target}, ${this.toNumber(key)})`;
    // A typed array's element by index: a number, read and written in place.
    if (/^JS(Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float32|Float64)Array$/.test(t) && !ts.isStringLiteral(key)) return `${target}${q}[${this.toNumber(key)}]`;
    if (t.startsWith('JSArray<')) {
      if (isWriteTarget(e)) return `${target}${q}[${this.toNumber(key)}]`;
      // An untyped element the checker narrows (`Array.isArray(xs[0])`): read as the narrowed type.
      const rt = this.typeOf(e);
      if (t === 'JSArray<Any?>' && rt !== 'Any?') return this.fromAny(this.maybeUndefined(e)!, rt);
      return this.undefinedAs(this.maybeUndefined(e)!, rt);
    }
    if (t === 'JSMatch') {
      const read = `${this.uncheckedMatch(e.expression) ? `(${target} ?: jsCannotReadNull(${this.keyText(key)}))` : target}${q}.get(${this.toNumber(key)})`;
      return this.typeOf(e).endsWith('?') ? read : this.undefinedAs(read, this.typeOf(e));
    }
    if ((t.startsWith('Pair<') || t.startsWith('Triple<')) && ts.isNumericLiteral(key)) return `${target}.${['first', 'second', 'third'][Number(key.text)]}`;
    if (t.startsWith('JSRecord<')) {
      if (isWriteTarget(e)) return `${target}[${this.str(key)}]`;
      const vt = this.typeOf(e);
      const z = this.zero(vt);
      const optional = q || (e.flags & ts.NodeFlags.OptionalChain && this.typeOf(e.expression).endsWith('?'));
      const read = optional ? `${target}?.get(${this.str(key)})` : `${target}[${this.str(key)}]`;
      // Library mode: an untyped value narrowed where it is read (`Array.isArray(headers[key])`).
      if (this.library && /^JSRecord<Any\?>\??$/.test(t) && vt !== 'Any?') return this.fromAnyCode(read, vt, true);
      if (!this.library && !this.lenient && ['String', 'Double', 'Boolean'].includes(vt) && !optional && convertedRead(e)) return this.undefinedAs(read, vt);
      return vt.endsWith('?') || optional ? read : z && z !== 'null' ? `(${read} ?: ${z})` : this.asserted(read);
    }
    if (this.typeOf(e.expression) === 'Any?') {
      const code = `jsGet(${target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, isCompared(e) ? optionalType(rt) : rt);
    }
    // A key the type does not declare (`activity['_callbacks']` on a Java object, `button['testAttr']`), the object's by name.
    if (ts.isStringLiteral(key) && !this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)).getProperty(key.text)) {
      const code = `jsGet(${target}, ${kotlinString(key.text)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, rt, true);
    }
    if (ts.isStringLiteral(key) && this.definedField(e.expression, key.text)) {
      if (isWriteTarget(e)) throw this.error(e, `a write of a field Object.defineProperty may restrict by an element access (write \`.${key.text}\`)`);
      if (!q) return this.fromAnyCode(`jsGet(${target}, ${kotlinString(key.text)})`, this.typeOf(e), true);
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
      // Library mode: the object as it is, whatever shape its type gives it (a generic `owner: T`).
      const code = `jsGet(${this.library && !isWriteTarget(e) ? this.coerce(e.expression, 'Any?') : target}, ${this.propertyKey(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAnyCode(code, rt, true);
    }
    throw this.error(e, 'indexing this type');
  }

  /**
   * An expression that may be undefined though TypeScript types it as its element
   * (`xs[i]` past the end, or a variable holding one), as a Kotlin nullable; null otherwise.
   */
  private optionalReads = new Set<ts.Node>();

  /**
   * `x as T` of an untyped value: JavaScript erases the assertion, so the value may be missing, though Kotlin holds the
   * result as `T`. App code only; library code reads those itself.
   */
  private assertedUntyped(e: ts.Expression): ts.AsExpression | ts.TypeAssertion | null {
    e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (!(ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) || isWriteTarget(e)) return null;
    try {
      const t = this.typeOf(e), from = this.typeOf(e.expression);
      if (t === 'Any?' || t === 'Nothing' || t === 'Unit' || isNullable(t) || isFunctionType(t)) return null;
      if (['String', 'Double', 'Boolean'].includes(t)) return from === 'Any?' && !this.library ? e : null;
      if (this.library || !this.isObjectType(t)) return null;
      return from === 'Any?' && !/^JS(Array|Record|Promise|Date|Error)\b/.test(t) ? e : null;
    } catch { return null; }
  }

  /** An `assertedUntyped` assertion read as the nullable it may be: null where the value is undefined or null. */
  private assertedOptional(e: ts.AsExpression | ts.TypeAssertion): string {
    const t = this.typeOf(e), code = this.expr(e.expression);
    const entry = !this.library && !this.lenient ? this.states.foreignEntry(e) : null;
    const checked = entry && this.type(entry.type, e) === t ? this.checkedConvert(code, entry, e, true) : null;
    if (checked) return checked;
    if (['String', 'Double', 'Boolean'].includes(t)) return `jsAsserted${t === 'Double' ? 'Number' : t}OrNull(${code})`;
    return this.fromAny(code, optionalType(this.widenedAssertion(e) ?? t));
  }

  /**
   * The class above the asserted one that the variable `e` initializes is held as (`view.android as
   * android.widget.ScrollView` kept as a View, a NestedScrollView at run time): what the value is checked as, since
   * script never checks the assertion.
   */
  private widenedAssertion(e: ts.AsExpression | ts.TypeAssertion | ts.SatisfiesExpression): string | null {
    if (this.library) return null;
    const holder = ts.findAncestor(e.parent, (p) => !ts.isParenthesizedExpression(p));
    return holder && ts.isVariableDeclaration(holder) ? this.widerAsserted(holder) : null;
  }

  /** `x` read by an equality or `typeof` (`ObserverSlot`). */
  private observe(x: ts.Expression, read: 'untyped' | 'asIs' = 'untyped'): string {
    return place(this.placement, x, observerSlot(read));
  }

  /**
   * A read `observedAsIs` (an identity operand, `instanceof`'s left): the nullable it may be, never asserted present.
   * Library mode reads an untyped value as it is held: `maybeUndefined` would cast it to the declared type.
   */
  private observed(e: ts.Expression): string {
    return (this.library ? null : this.maybeUndefined(e)) ?? this.unasserted(this.expr(e));
  }

  private maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    // `a ?? b` of objects where `b` may be missing too: missing then.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && !this.library && this.isObjectRef(e) && !isNullable(this.typeOf(e)) && this.states.missingObject(e)) {
      const code = this.expr(e);
      if (this.isAsserted(code)) return this.unasserted(code);
    }
    const assertion = this.assertedUntyped(e);
    if (assertion) return this.assertedOptional(assertion);
    // Library mode: `<T[]>record[key]`, an assertion of the type the read has: the read.
    if (this.library && (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) && !this.subst.has(e) && this.typeOf(e) === this.typeOf(e.expression)) return this.maybeUndefined(e.expression);
    const awaited = this.awaited(e);
    if (awaited) return awaited.raw;
    if (this.subst.has(e)) return null;
    // A call of a function Kotlin declares to give a nullable string, number or boolean (`'dark' | 'light' | null`): as it gives it.
    if (ts.isCallExpression(e) && (['String', 'Double', 'Boolean'].includes(this.typeOf(e)) || this.widenedObjectCall(e)) && this.unwrapsResult(e)) {
      this.rawResults.add(e);
      try { return this.expr(e); } finally { this.rawResults.delete(e); }
    }
    if (this.library && this.untypedAssertion(e)) return this.fromAny(this.expr((e as ts.AsExpression).expression), optionalType(this.typeOf(e)));
    // `a?.b as T` from an untyped value: undefined where the chain stops, whatever the assertion says.
    if (ts.isAsExpression(e) && ts.isOptionalChain(e.expression) && this.typeOf(e.expression) === 'Any?' && !isNullable(this.typeOf(e))) {
      return this.fromAny(this.expr(e.expression), optionalType(this.typeOf(e)));
    }
    // `Enum[value]` of a value no member has: undefined, though TypeScript types it a string.
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && !ts.isStringLiteral(e.argumentExpression) && this.isEnumObject(e.expression) && !this.typeOf(e).endsWith('?')) {
      const code = `${this.expr(e.expression)}.jsEnumObject.jsGet(${this.propertyKey(e.argumentExpression)})`;
      return this.typeOf(e) === 'Any?' ? code : this.fromAny(code, optionalType(this.typeOf(e)));
    }
    // A key of a dictionary-typed object, read before its type's zero stands in for a missing one.
    if ((ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) && !e.questionDotToken && !isWriteTarget(e)
        && (this.library ? /^JSRecord<.*>\??$/ : /^JSRecord<.*>$/).test(this.typeOf(e.expression)) && !this.typeOf(e).endsWith('?')) {
      const key = ts.isPropertyAccessExpression(e) ? kotlinString(e.name.text) : this.str(e.argumentExpression);
      const record = this.expr(e.expression);
      // Library mode: a record field core declares and sets (`this._observers`), read as script reads it.
      const read = `${this.typeOf(e.expression).endsWith('?') || this.isAsserted(record) ? this.present(record, ts.isPropertyAccessExpression(e) ? e.name.text : e.argumentExpression, e.expression) : record}[${key}]`;
      // Library mode: an untyped value narrowed where it is read.
      return this.library && this.typeOf(e.expression).replace(/\?$/, '') === 'JSRecord<Any?>' && this.typeOf(e) !== 'Any?' ? this.fromAnyCode(read, optionalType(this.typeOf(e)), true) : read;
    }
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression) === 'String' && !ts.isStringLiteral(e.argumentExpression) && this.typeOf(e.argumentExpression) === 'Double') {
      const k = e.argumentExpression;
      return `jsCharAtOrNull(${this.receiver(e.expression, ts.isNumericLiteral(k) || ts.isStringLiteral(k) ? k.text : k.getText()) ?? this.expr(e.expression)}, ${this.toNumber(k)})`;
    }
    // A match's group that took no part in it: undefined, though TypeScript types every element a string.
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '') === 'JSMatch' && !this.typeOf(e).endsWith('?')) {
      const q = e.questionDotToken || this.typeOf(e.expression).endsWith('?') ? '?' : '';
      const match = this.uncheckedMatch(e.expression) ? `(${this.expr(e.expression)} ?: jsCannotReadNull(${this.keyText(e.argumentExpression)}))` : this.expr(e.expression);
      return `${match}${q}.get(${this.toNumber(e.argumentExpression)})`;
    }
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '').startsWith('JSArray<')) {
      const q = e.questionDotToken || this.typeOf(e.expression).endsWith('?') || (e.flags & ts.NodeFlags.OptionalChain && ts.isPropertyAccessExpression(e.expression) && e.expression.questionDotToken) ? '?' : '';
      const array = this.expr(e.expression);
      return `${this.isAsserted(array) ? this.present(array, e.argumentExpression, e.expression) : array}${q}.element(${this.toNumber(e.argumentExpression)})`;
    }
    if (ts.isIdentifier(e)) {
      const sym = this.resolve(e);
      if (sym && this.undefinedVars.has(sym)) return ident(e.text);
      if (this.states.narrowedMissing(e) && !this.rawNames.has(e)) {
        this.rawNames.add(e);
        try { return this.expr(e); } finally { this.rawNames.delete(e); }
      }
    }
    if (ts.isPropertyAccessExpression(e) && e.expression.kind === ts.SyntaxKind.ThisKeyword && !isWriteTarget(e)) {
      const d = this.resolve(e.name)?.valueDeclaration;
      if (d && ts.isPropertyDeclaration(d) && this.earlyField(d)) return `${this.expr(e.expression)}.${earlyBacking(e.name.text)}`;
    }
    // Library mode: an optional chain's string, number or boolean (`bundle?.getString(key)`) is undefined where the chain stops.
    // Library mode: `<View>view.parent`, cast where a nullable slot takes it: missing as null.
    if (this.library && (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) && this.isObjectType(this.typeOf(e)) && !isNullable(this.typeOf(e)) && !this.native?.type(this.checker.getTypeAtLocation(e))) {
      let inner = e.expression;
      while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
      if ((ts.isPropertyAccessExpression(inner) || ts.isIdentifier(inner)) && this.typeOf(inner) !== 'Any?' && isNullable(this.declaredTypeOf(inner) ?? '')) {
        this.nullOk.add(inner);
        try {
          const target = optionalType(this.typeOf(e));
          return this.isClassDowncast(e) ? safeCast(this.expr(inner), target.slice(0, -1)) : cast(this.expr(inner), target);
        } finally { this.nullOk.delete(inner); }
      }
    }
    // `a && a.b()` of objects: missing where `a` is.
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && this.isObjectType(this.typeOf(e)) && !isNullable(this.typeOf(e)) && !isFunctionType(this.typeOf(e))
        && (this.isObjectType(this.typeOf(e.left)) || ['String', 'Double', 'Boolean'].includes(this.typeOf(e.left).replace(/\?$/, ''))) && this.typeOf(e.left).replace(/\?$/, '') !== this.typeOf(e).replace(/\?$/, '')) {
      return `(if (${this.cond(e.left)}) ${this.coerce(e.right, optionalType(this.typeOf(e)))} else null)`;
    }
    // `a || b` of objects: missing where both are.
    if (!this.library && ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.BarBarToken && this.isObjectType(this.typeOf(e)) && !isNullable(this.typeOf(e)) && !isFunctionType(this.typeOf(e)) && this.typeOf(e.left) === this.typeOf(e)) {
      const v = this.fresh('__v');
      return `run { val ${v} = ${this.maybeUndefined(e.left) ?? this.expr(e.left)}; if (jsTruthy(${v})) ${v} else ${this.coerce(e.right, optionalType(this.typeOf(e)))} }`;
    }
    // An optional chain's object (`this.owner?.get()`, typed present where null checks are off) is missing where the chain stops.
    if (!this.library && (ts.isCallExpression(e) || ts.isPropertyAccessExpression(e)) && e.flags & ts.NodeFlags.OptionalChain && !this.optionalReads.has(e) && this.isObjectType(this.typeOf(e)) && !isNullable(this.typeOf(e)) && !isFunctionType(this.typeOf(e))) {
      this.optionalReads.add(e);
      try {
        const code = this.expr(e);
        return this.unasserted(code);
      } finally { this.optionalReads.delete(e); }
    }
    // So is a map's `get` of a key it may lack.
    const mapGet = (this.library || this.lenientApp) && ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'get' && /^JS(Weak)?Map</.test(this.typeOf(e.expression.expression));
    if ((this.library || mapGet) && ts.isCallExpression(e) && (e.flags & ts.NodeFlags.OptionalChain || mapGet) && !this.optionalReads.has(e) && (mapGet || ['String', 'Double', 'Boolean'].includes(this.typeOf(e)))) {
      this.optionalReads.add(e);
      try {
        const code = this.expr(e);
        if (this.isAsserted(code)) return this.unasserted(code);
        const m = this.markOf(code);
        // An entry read, or that read converted (`(m.get(k) ?: false)`).
        const entry = m?.op === 'entry' || (m?.op === 'undefinedAs' && m.of.mark?.op === 'entry');
        if (mapGet && entry) return code;
      } finally { this.optionalReads.delete(e); }
    }
    // Library mode: a member of an untyped object, where a nullable slot takes it: missing as null.
    if (this.library && ts.isPropertyAccessExpression(e) && !isWriteTarget(e) && e.name.text !== 'prototype' && this.typeOf(e.expression) === 'Any?' && (['String', 'Double', 'Boolean'].includes(this.typeOf(e)) || ((this.isObjectType(this.typeOf(e)) || isFunctionType(this.typeOf(e))) && !isNullable(this.typeOf(e))))
        && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && !((ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression === e)
        && !(ts.isIdentifier(e.expression) && (this.isLibGlobal(e.expression) || this.namesClass(e.expression)))) {
      return this.fromAny(`${e.questionDotToken ? 'jsGetOptional' : 'jsGet'}(${this.expr(e.expression)}, ${kotlinString(e.name.text)})`, optionalType(this.typeOf(e)));
    }
    // So is an element of one (`this._gestureObservers[type]`), an array or object it may not have.
    if (this.library && ts.isElementAccessExpression(e) && !e.questionDotToken && !isWriteTarget(e) && this.typeOf(e.expression) === 'Any?' && this.isObjectType(this.typeOf(e)) && !isNullable(this.typeOf(e))
        && !(ts.isCallExpression(e.parent) && e.parent.expression === e) && !((ts.isPropertyAccessExpression(e.parent) || ts.isElementAccessExpression(e.parent)) && e.parent.expression === e)) {
      return this.fromAny(`jsGet(${this.expr(e.expression)}, ${this.propertyKey(e.argumentExpression)})`, optionalType(this.typeOf(e)));
    }
    // Library mode: a member core's declarations type that its compiled class holds untyped (`Style.fontStyle`): missing as null.
    if (this.library && ts.isPropertyAccessExpression(e) && !e.questionDotToken && !isWriteTarget(e) && this.typeOf(e) !== 'Any?') {
      const sym = this.checker.getSymbolAtLocation(e.name);
      const d = sym?.valueDeclaration;
      const own = d && ts.isPropertyDeclaration(d) && !d.getSourceFile().isDeclarationFile && ts.isClassLike(d.parent) ? d
        : d && d.getSourceFile().isDeclarationFile && !isLibDeclaration(d) && !this.native?.isNativeDeclaration(d) ? this.compiledField(this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression)), e.name.text) : undefined;
      if (own && this.typeOf(own.name) === 'Any?') return this.fromAny(`${this.typeOf(e.expression).endsWith('?') ? this.present(this.expr(e.expression), e.name.text, e.expression) : this.expr(e.expression)}.${ident(e.name.text)}`, optionalType(this.typeOf(e)));
    }
    // Lenient code: `list.pop()`, `list.shift()`, `list.find(…)` give undefined when there is none, whatever the type says.
    if ((this.lenient || this.lenientApp) && ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && ['pop', 'shift', 'find', 'findLast'].includes(e.expression.name.text)
        && this.typeOf(e.expression.expression).replace(/\?$/, '').startsWith('JSArray<') && !isNullable(this.typeOf(e)) && this.typeOf(e) !== 'Any?') return this.expr(e);
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && !this.typeOf(e.expression).endsWith('?')) {
      const target = this.maybeUndefined(e.expression);
      if (target) return `${target}?.${ident(e.name.text)}`;
    }
    return null;
  }

  /** `a?.b`, `a?.b()`, `a?.[k]` (in parentheses or not): Kotlin's chain gives a nullable whatever TypeScript's type says. */
  private optionalChainEnd(e: ts.Expression): boolean {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    return (ts.isPropertyAccessExpression(e) || ts.isCallExpression(e) || ts.isElementAccessExpression(e)) && !!(e.flags & ts.NodeFlags.OptionalChain);
  }

  /**
   * A member read or call that continues an optional chain (`items?.getItems().forEach(…)`) past a link Kotlin holds
   * nullable though TypeScript types it present: where the chain stopped nothing more of it runs, as in JavaScript.
   */
  private continuedChain(e: ts.Expression, target: ts.Expression, translate: () => string): string | null {
    if (this.subst.has(target) || !ts.isOptionalChain(target) || !(e.flags & ts.NodeFlags.OptionalChain)) return null;
    const code = this.expr(target);
    if (!this.isAsserted(code)) return null;
    const v = this.fresh('__c');
    this.subst.set(target, v);
    let inner: string;
    try { inner = translate(); } finally { this.subst.delete(target); }
    // Nullable, as the end of any optional chain is (`optionalChainEnd`).
    return `${this.unasserted(code)}?.let { ${v} -> ${inner} }`;
  }

  /**
   * The one conversion of a foreign value into the form it enters as (§2.3b M6): a value of the form's type passes, an
   * empty state as the slot holds it, any other is JavaScript's TypeError. Null where the form's type has none yet.
   */
  private checkedConvert(code: string, to: Form, at: ts.Node, optional = false): string | null {
    const checked: Record<string, string> = { String: 'jsCheckedString', Double: 'jsCheckedNumber', Boolean: 'jsCheckedBoolean' };
    const t = this.type(to.type, at), fn = checked[t];
    if (fn) return `${fn}${optional ? 'OrNull' : ''}(${code})`;
    const element = /^JSArray<(\w+)>$/.exec(t)?.[1];
    if (!element || !checked[element] || !to.element?.foreign || to.element.typeObserved) return null;
    return optional ? `jsUnlessNullish(${code}) { __v -> jsCheckedArray(__v) { ${checked[element]}(it) } }` : `jsCheckedArray(${code}) { ${checked[element]}(it) }`;
  }

  /** A held read its own type test narrows (`ValueStates.narrowedRead`), read as that type through its checked convert. */
  private narrowedHeld(n: ts.Node): Form | null {
    if (this.lenient || this.library || this.rawHeld.has(n)) return null;
    const form = this.states.narrowedRead(n);
    if (!form) return null;
    if (this.checkedConvert('', form, n)) return form;
    const d = this.checker.getNonNullableType(form.type).getSymbol()?.valueDeclaration;
    return d && ts.isClassDeclaration(d) && /^[A-Za-z_][\w.]*$/.test(this.type(form.type, n)) ? form : null;
  }

  private readonly rawHeld = new Set<ts.Node>();

  /** An untyped value placed where its slot holds its declared type (`foreignPlacement`): converted checked, or null. */
  private checkedPlacement(a: ts.Expression, to: string, code?: string, slot?: ParamSlot | StoreSlot): string | null {
    const entry = slot ? slot.checked ?? null : this.lenient || this.library ? null : this.states.foreignPlacement(a);
    if (!entry || this.typeOf(a) !== 'Any?' || this.type(entry.type, a) !== to.replace(/\?$/, '')) return null;
    return this.checkedConvert(code ?? this.expr(a), entry, a, isNullable(to));
  }

  /** A call's untyped result `code`, of the program's type `to`: checked where its slot takes a foreign value (`foreignResult`), else asserted. */
  private untypedResult(e: ts.CallExpression, code: string, to: string): string {
    const entry = this.lenient || this.library ? null : this.states.foreignResult(e);
    return (entry && this.type(entry.type, e) === to.replace(/\?$/, '') ? this.checkedConvert(code, entry, e, isNullable(to)) : null) ?? this.fromAnyCode(code, to, true);
  }

  /** An untyped value only Kotlin's code has, stored in a field `slot` (`placeCode`): converted checked, or null. */
  private checkedCode(code: string, slot: StoreSlot): string | null {
    const entry = slot.checked!;
    return this.type(entry.type, slot.at) === slot.target.replace(/\?$/, '') ? this.checkedConvert(code, entry, slot.at, isNullable(slot.target)) : null;
  }

  /** A variable a pattern binds or assigns from an untyped value (`bindingSlot`): its value `code` converted checked, or null. */
  private checkedBinding(at: ts.BindingElement | ts.Expression, code: string, to: string): string | null {
    const entry = this.lenient || this.library ? null : bindingSlot(this, to, at).checked;
    if (!entry || this.type(entry.type, at) !== to.replace(/\?$/, '')) return null;
    return this.checkedConvert(code, entry, at, isNullable(to));
  }

  /** An undefined-or-value as the TypeScript type reads it: NaN, "undefined" and false are what undefined converts to. */
  private undefinedAs(code: string, type: string): string {
    if (isNullable(type) || type === 'Any?') return code;
    const zero = type === 'Double' ? 'Double.NaN' : type === 'String' ? '"undefined"' : type === 'Boolean' ? 'false' : null;
    return zero ? this.marked(`(${code} ?: ${zero})`, { op: 'undefinedAs', to: parseNativeType(type), of: this.valueOf(code) }) : this.asserted(code);
  }

  /** The slot the `k`th parameter of `call` is at call `e`: Kotlin's type of it there; `a` is the argument given there, absent for an element a spread gives. */
  private paramSlot(e: ts.CallExpression | ts.NewExpression, call: CallParams, k: number, a?: ts.Expression): ParamSlot {
    const { sig, impl, params, appDeclared } = call;
    const p = params[Math.min(k, params.length - 1)];
    const decl = p?.valueDeclaration;
    const at = { call: e, k, a };
    if (decl && this.states.nullishHeld(decl)) return argumentSlot(this.placement, nullishType(this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e)), decl, at, { nullish: true });
    let pt = decl && this.states.nullish().held.has(decl) ? 'Any?' : this.heldElements(decl && ts.isParameter(decl) ? decl : e, this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e));
    // A generic implementation's parameter is not instantiated by an overload's call: the overload's, as this call instantiates it.
    const implTypes = impl && impl !== sig?.getDeclaration() ? impl.typeParameters?.map((t) => t.name.text) ?? [] : [];
    const resolved = sig?.getParameters()[k];
    if (resolved && implTypes.some((t) => new RegExp(`\\b${t}\\b`).test(pt))) pt = this.type(this.checker.getTypeOfSymbolAtLocation(resolved, e), e);
    // Library mode: a generic function's parameter is its declaration's Kotlin type, the type parameters erased.
    // So is any parameter whose type reads otherwise here (an alias of a union resolving apart at the call).
    const generic = this.library && appDeclared && decl && ts.isParameter(decl) && (!!(decl.parent as ts.SignatureDeclaration).typeParameters?.length || (ts.isClassLike(decl.parent.parent) && !!decl.parent.parent.typeParameters?.length) || pt === 'Any?');
    // So is a parameter of a package's source called from outside it (`new FormArray(controls)`), its class's type parameters erased.
    const packageParam = !this.library && !!decl && ts.isParameter(decl) && this.pluginFiles.has(decl.getSourceFile().fileName) && !this.pluginFiles.has(e.getSourceFile().fileName);
    if (generic || packageParam) pt = this.typeOf((decl as ts.ParameterDeclaration).name);
    // A parameter typed from type parameters (`handler: Delegate[K]`, core's too) is untyped in Kotlin, whatever this call instantiates.
    else if (decl && ts.isParameter(decl) && decl.type && pt !== 'Any?' && this.untypedGeneric(decl.type)) pt = 'Any?';
    // Library mode: an override's parameter is the topmost declaration's, which Kotlin's signature has (`appOverride`).
    const root = this.library && decl && ts.isParameter(decl) && ts.isMethodDeclaration(decl.parent) ? this.rootMethod(decl.parent) : null;
    if (root && root !== decl.parent && root.parameters[k] && !root.parameters[k].dotDotDotToken) pt = this.paramType(root.parameters[k]);
    // A plugin's object parameter is nullable in Kotlin: what is passed needs no unwrap.
    if (decl && ts.isParameter(decl) && appDeclared && ((!!(decl.parent as ts.FunctionLikeDeclaration).body && this.states.mayBeNull(decl)) || this.states.widened(decl))) pt = optionalType(pt);
    // Library mode: a parameter the method declares nullable in Kotlin takes what may be missing as it is.
    else if (this.library && !isNullable(pt) && pt !== 'Any?' && !!a && this.nullableArgument(a)) pt = optionalType(pt);
    // So does a local function's parameter its body tests (`params`).
    else if (this.library && !isNullable(pt) && decl && ts.isParameter(decl) && ts.isVariableDeclaration(decl.parent.parent) && ts.isIdentifier(decl.name) && (this.nullableDecls.has(p) || (isNullable(this.typeOf(decl.name)) && this.truthTested(decl.name)))) pt = optionalType(pt);
    // So does one the compiled function declares nullable (`toString(settings: …[] | null)`), whatever the checker strips.
    else if (this.library && appDeclared && !isNullable(pt) && this.isObjectType(pt) && !['String', 'Double', 'Boolean'].includes(pt) && decl && ts.isParameter(decl) && ts.isIdentifier(decl.name) && !decl.questionToken && !decl.initializer
      && ts.isFunctionDeclaration(decl.parent) && !decl.getSourceFile().isDeclarationFile && isNullable(this.paramType(decl))
      && ts.isCallExpression(e) && (ts.isIdentifier(e.expression) || (ts.isPropertyAccessExpression(e.expression) && !!this.namespaceMember(e.expression)))) pt = optionalType(pt);
    const constantDefault = !!decl && ts.isParameter(decl) && this.constantDefault(decl) && appDeclared && !this.templateParams;
    if (decl && ts.isParameter(decl) && ['String', 'Double', 'Boolean'].includes(pt) && this.states.undefinedParameter(decl)) pt = optionalType(pt);
    if (decl && ts.isParameter(decl) && (decl.questionToken || decl.initializer) && appDeclared && !constantDefault) pt = optionalType(pt);
    return argumentSlot(this.placement, pt, decl, at, { constantDefault, packaged: packageParam });
  }

  /** The slot of the `k`th parameter, `p`, that call `e` leaves out (`ParamSlot.missing`); null where none is given. */
  private missingSlot(e: ts.CallExpression | ts.NewExpression, p: ts.Symbol, k: number, missing: 'empty' | 'undefined'): ParamSlot | null {
    const pd = p.valueDeclaration;
    if (missing === 'undefined' && pd && ts.isParameter(pd) && (pd.questionToken || pd.initializer)) return null;
    const pt = this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e);
    // Undefined only where Kotlin's parameter can hold it.
    if (missing === 'undefined' && !isNullable(pt) && pt !== 'Any?') return null;
    return argumentSlot(this.placement, pt, pd, { call: e, k }, { missing });
  }

  /** Kotlin's own cells of an argument, before the shared front; null where it is placed in the slot's type. */
  private argumentCell(a: ts.Expression, slot: ParamSlot): string | null {
    const pt = slot.target, decl = slot.decl;
    const native = slot.native;
    if (native) return this.native!.toJava(a, pt, native.nullable, native.nonNull, native.signature, native.typeVar);
    if (slot.rest) return null;
    if (slot.nullish) return this.coerce(a, pt);
    // An argument that may be undefined where Kotlin's parameter has the constant default JavaScript would use.
    if (slot.constantDefault && this.typeOf(a) === optionalType(pt)) return `(${this.coerce(a, optionalType(pt))} ?: ${this.coerce((decl as ts.ParameterDeclaration).initializer!, pt)})`;
    // Library mode: a value a library collection holds (`cache.set(key, result)` with a null result), as script stores it.
    if (this.library && decl && isLibDeclaration(decl) && this.isObjectType(pt) && !isNullable(pt) && !['String', 'Double', 'Boolean'].includes(pt) && !isFunctionType(pt)
        && (isNullable(this.declaredTypeOf(a) ?? this.typeOf(a)) || this.maybeUndefined(a))) return this.unchecked(pt, this.coerce(a, optionalType(pt)));
    // An object or a record of other values where a package's parameter takes a record of any: as script passes it.
    const record = slot.packaged ? /^JSRecord<(.*)>(\??)$/.exec(pt) : null;
    if (record && this.typeOf(a).replace(/\?$/, '') !== pt.replace(/\?$/, '')) return `${record[2] ? 'jsRecordOrNull' : 'jsRecord'}<${record[1]}>(${this.expr(a)})`;
    return (pt === 'Any?' && this.untypedArrow(a)) || null;
  }

  args(e: ts.CallExpression | ts.NewExpression, count?: number): string[] {
    const all = e.arguments ?? ts.factory.createNodeArray();
    const list = count === undefined ? all : all.slice(0, count);
    const sig = this.checker.getResolvedSignature(e);
    // An overload's call is the implementation's in Kotlin: its parameters take the arguments.
    let impl = sig?.getDeclaration() && implementationOf(sig.getDeclaration());
    // Library mode: `new Font(…)` the checker resolves no constructor for (a base's protected one): the compiled class's.
    if (!impl && this.library && ts.isNewExpression(e) && !sig?.getDeclaration() && e.arguments?.length) {
      const made = this.checker.getTypeAtLocation(e.expression).getSymbol()?.valueDeclaration;
      const ctor = made && ts.isClassLike(made) && !made.getSourceFile().isDeclarationFile ? this.constructorOf(made) : undefined;
      if (ctor) impl = ctor;
    }
    const params = impl ? impl.parameters.map((p) => this.checker.getSymbolAtLocation(p.name)!).filter(Boolean) : sig?.getParameters() ?? [];
    const target = impl ?? sig?.getDeclaration();
    if (target && !ts.isJSDocSignature(target) && this.readsArguments(target)) return [this.packed(all, 'JSArray<Any?>', this.restSlot(e, 'Any?'))];
    const out: string[] = [];
    const restAt = params.findIndex((p) => p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken);
    // A function type's rest parameter too (`bind`'s `(...args: A) => R`): Kotlin's function type takes it as one array.
    const appDeclared = (!!sig?.getDeclaration() && !sig!.getDeclaration().getSourceFile().isDeclarationFile) || (!!impl && !impl.getSourceFile().isDeclarationFile) || (!this.library && !!sig?.getDeclaration() && ts.isFunctionTypeNode(sig!.getDeclaration()));
    const call: CallParams = { sig, impl, params, appDeclared };
    const slot = (k: number, a?: ts.Expression) => this.paramSlot(e, call, k, a);
    let covered = list.length;
    for (let k = 0; k < list.length; k++) {
      const a = list[k];
      if (restAt >= 0 && k >= restAt && appDeclared) {
        const rest = this.restType(params[restAt]);
        out.push(this.packed(list.slice(k), rest, this.restSlot(e, rest.replace(/^JSArray<(.*)>$/, '$1'), params[restAt].valueDeclaration)));
        break;
      }
      if (ts.isSpreadElement(a)) {
        const spread = k === list.length - 1 ? this.spreadArgs(e, a, k, params, restAt, appDeclared, slot) : null;
        if (!spread) throw this.error(a, 'a spread argument');
        out.push(...spread);
        covered = k + spread.length;
        break;
      }
      const p = params[Math.min(k, params.length - 1)];
      const decl = p?.valueDeclaration;
      if (!p || (decl && ts.isParameter(decl) && decl.dotDotDotToken)) {
        const pt = decl && ts.isParameter(decl) ? this.typeOf(decl.name).replace(/^JSArray<(.*)>$/, '$1') : 'Any?';
        out.push(place(this.placement, a, this.restSlot(e, pt, decl)(a)));
        continue;
      }
      out.push(place(this.placement, a, slot(k, a)));
    }
    if (restAt >= 0 && appDeclared && covered <= restAt) out.push(`${this.restType(params[restAt])}()`);
    const decl = sig?.getDeclaration();
    // A function value takes every parameter; a plugin's call (its code unchecked) may leave out one the callee requires.
    const missing = count !== undefined || restAt >= 0 || !decl || ts.isJSDocSignature(decl) ? undefined
      : ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl) || ts.isArrowFunction(decl) || ts.isFunctionExpression(decl) ? 'empty'
      : !this.library && this.inPluginFile(e) ? 'undefined' : undefined;
    for (let k = covered; missing && k < params.length; k++) {
      const s = this.missingSlot(e, params[k], k, missing);
      if (!s) break;
      out.push(s.missing === 'empty' && s.target === 'Unit' ? 'Unit' : 'null');
    }
    return out;
  }

  /**
   * App code: a function literal given to an untyped parameter, taking what untyped callers give it (null, an object
   * literal) as its parameters' types have it; null when it needs no reading. Only for an argument: a slot Kotlin types
   * as a function (`worker.onmessage`) needs the literal itself.
   */
  private untypedArrow(e: ts.Expression): string | null {
    let bare = e;
    while (ts.isParenthesizedExpression(bare)) bare = bare.expression;
    if (this.library || !ts.isArrowFunction(bare) || bare.parameters.length > 4 || this.readsArguments(bare) || bare.parameters.some((q) => q.dotDotDotToken || isThisParameter(q) || !ts.isIdentifier(q.name))) return null;
    const types = bare.parameters.map((q) => this.paramType(q));
    // A string, number or boolean arrives as the type it has, but null as script's.
    const primitive = (t: string) => t === 'Any?' || /^(Double|String|Boolean)\??$/.test(t);
    if (!types.some((t) => !primitive(t) || (t.endsWith('?') && t !== 'Any?'))) return null;
    const read = (t: string, x: string) => (t === 'Any?' ? x : !primitive(t) ? this.fromAny(x, t) : t.endsWith('?') ? `(if (jsIsNullish(${x})) null else jsUnchecked<${t}>(${x}))` : this.unchecked(t, x));
    const ret = this.returnTypeOf(bare);
    const names = types.map((_, k) => pure(`__u${k}`));
    const call = `__f(${types.map((t, k) => read(t, names[k])).join(', ')})`;
    return `run<Any?> { val __f = ${this.closure(bare, `(${types.join(', ')}) -> ${ret}`)}; jsAdapt${types.length}<${[...types.map(() => 'Any?'), ret].join(', ')}>(__f) { ${names.map((n) => `${n}: Any?`).join(', ')} -> ${call} } }`;
  }

  /** A parameter type computed from type parameters (indexed access, conditional), which Kotlin has as `Any?`. */
  private untypedGeneric(node: ts.TypeNode): boolean {
    const t = this.checker.getTypeFromTypeNode(node);
    return !!(t.flags & (ts.TypeFlags.IndexedAccess | ts.TypeFlags.Conditional | ts.TypeFlags.Substitution)) && this.type(t, node) === 'Any?';
  }

  private restType(p: ts.Symbol): string {
    const d = p.valueDeclaration as ts.ParameterDeclaration;
    const bare = !!d.type && ts.isTypeReferenceNode(d.type) && !d.type.typeArguments && !!(this.checker.getTypeFromTypeNode(d.type).flags & ts.TypeFlags.TypeParameter);
    return bare ? 'JSArray<Any?>' : this.typeOf(d.name);
  }

  /**
   * The arguments a name spread last gives the parameters from `k` on, each element read in place: a tuple's into fixed
   * parameters, or (an app function) the leading elements into fixed parameters and the others as the rest parameter's
   * array; null for any other spread.
   */
  private spreadArgs(e: ts.CallExpression | ts.NewExpression, a: ts.SpreadElement, k: number, params: ts.Symbol[], restAt: number, appDeclared: boolean,
      slot: (k: number) => ParamSlot): string[] | null {
    const x = a.expression;
    if (!ts.isIdentifier(x)) return null;
    const st = this.checker.getTypeAtLocation(x);
    // A rest parameter of a tuple type is an array in Kotlin where its reads are typed as a Pair or Triple.
    const d = this.resolve(x)?.valueDeclaration;
    if (d && ts.isParameter(d) && d.dotDotDotToken && /^(Pair|Triple)</.test(this.typeOf(x))) return null;
    const tuple = this.checker.isTupleType(st) ? ((st as ts.TypeReference).target as ts.TupleType) : null;
    const length = tuple && !tuple.hasRestElement ? this.checker.getTypeArguments(st as ts.TypeReference).length : null;
    const present = tuple ? tuple.minLength : 0;
    if (restAt >= 0 ? !appDeclared || k >= restAt : length === null || k + length > params.length) return null;
    const held = this.typeOf(x), code = this.expr(x);
    const pair = /^(Pair|Triple)<(.*)>$/.exec(held), array = /^JSArray<(.*)>$/.exec(held);
    if (!pair && !array) return null;
    const fields = pair ? splitTopLevel(pair[2]) : [];
    const read = (i: number): { code: string; type: string } | null =>
      pair ? (i < fields.length ? { code: `${code}.${['first', 'second', 'third'][i]}`, type: fields[i] } : null)
        : i < present ? { code: `${code}[${i}]`, type: array![1] } : { code: `${code}.element(${i}.0)`, type: optionalType(array![1]) };
    const out: string[] = [];
    for (let i = 0; k + i < (restAt >= 0 ? restAt : k + length!); i++) {
      const s = slot(k + i);
      const el = read(i);
      if (s.nullish) return null;
      if (!el) {
        if (!isNullable(s.target) && s.target !== 'Any?') return null;
        out.push('null');
        continue;
      }
      const decl = params[k + i].valueDeclaration as ts.ParameterDeclaration;
      if (s.constantDefault && isNullable(el.type)) out.push(`(${this.convert(el.code, el.type, optionalType(s.target))} ?: ${this.coerce(decl.initializer!, s.target)})`);
      else if (isNullable(el.type) && !isNullable(s.target) && s.target !== 'Any?' && el.type !== 'Any?') return null;
      else out.push(this.convert(el.code, el.type, s.target));
    }
    if (restAt < 0) return out;
    const rest = this.restType(params[restAt]), element = rest.replace(/^JSArray<(.*)>$/, '$1');
    const from = restAt - k;
    if (pair) out.push(fields.length > from ? `jsArrayOf<${element}>(${fields.slice(from).map((t, j) => this.convert(`${code}.${['first', 'second', 'third'][from + j]}`, t, element)).join(', ')})` : `${rest}()`);
    else out.push(this.convert(`${code}.slice(${from}.0)`, held, rest));
    return out;
  }

  /** The arguments of a call on an untyped value from its `from`th: each, or with spreads, all spread from one list. */
  private untypedArgs(e: ts.CallExpression | ts.NewExpression, from = 0): string {
    const args = (e.arguments ?? []).slice(from);
    const slot = this.restSlot(e, 'Any?');
    if (args.some(ts.isSpreadElement)) return `, *${this.packed(args, 'JSArray<Any?>', slot)}.storage.toTypedArray()`;
    return args.map((a) => `, ${place(this.placement, a, slot(a))}`).join('');
  }

  /** An argument of `call` with no declared parameter's cell, as `element`: a built-in's (`Math.max`) or one an untyped callee takes. */
  private restArgument(call: ts.CallExpression | ts.NewExpression, a: ts.Expression, element: string): string {
    return place(this.placement, a, this.restSlot(call, element)(a));
  }

  /** The slot of each value `at` stores as a container's element (`elementStoreOf`), held as `element`. */
  private elementSlot(at: ElementStore, element: string): (a: ts.Expression) => StoreSlot {
    return (a) => storeSlot(this.placement, element, at, a);
  }

  /** A value `call` stores as an element of its receiver (`push`'s, `add`'s), held as `element`. */
  private elementArgument(call: ts.CallExpression, a: ts.Expression, element: string): string {
    return place(this.placement, a, this.elementSlot(call, element)(a));
  }

  /** The slot of each argument `call` gives a rest parameter (`decl`), or an untyped callee: one `element` each, placed with no declared parameter's cell. */
  private restSlot(call: ts.CallExpression | ts.NewExpression, element: string, decl?: ts.Declaration): (a: ts.Expression) => ParamSlot {
    return (a) => {
      const k = call.arguments?.indexOf(a) ?? -1;
      return argumentSlot(this.placement, element, decl, { call, k, a: k < 0 ? undefined : a }, { rest: true });
    };
  }

  /** Arguments (spreads included) as one `JSArray` of `arrayType`; `slot` places each element where they are a call's. */
  packed(items: readonly ts.Expression[], arrayType: string, slot?: (a: ts.Expression) => ParamSlot | StoreSlot): string {
    const el = arrayType.replace(/^JSArray<(.*)>$/, '$1');
    const placed = (x: ts.Expression) => (slot ? place(this.placement, x, slot(x)) : this.coerce(x, el));
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of items) {
      if (ts.isSpreadElement(x) && ts.isArrayLiteralExpression(x.expression) && !x.expression.elements.some(ts.isSpreadElement)) run.push(...x.expression.elements.map(placed));
      else if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`listOf<${el}>(${run.join(', ')})`); run = []; }
        const list = `(${this.iterable(x.expression)}).toList()`;
        // A tuple's elements are untyped in Kotlin.
        parts.push(/^(Pair|Triple)</.test(this.typeOf(x.expression)) ? `(${list} as List<${el}>)` : list);
      } else run.push(placed(x));
    }
    if (run.length) parts.push(`listOf<${el}>(${run.join(', ')})`);
    return parts.length ? `${arrayType}(${parts.join(' + ')})` : `${arrayType}()`;
  }

  private arity(e: ts.CallExpression): number | undefined {
    const sig = this.checker.getResolvedSignature(e);
    const decl = sig?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl)) return undefined;
    if (decl.parameters.some((p) => p.dotDotDotToken)) return undefined;
    // Library mode: a method core's declarations describe with more parameters than its compiled class takes (`accessibilityScreenChanged(refocus)`).
    if (this.library && decl.getSourceFile().isDeclarationFile && ts.isMethodDeclaration(decl) && ts.isClassDeclaration(decl.parent) && decl.parent.name) {
      const compiled = this.compiledClasses().get(decl.parent.name.text);
      const name = decl.name.getText();
      const own = compiled?.members.find((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && m.name.getText() === name) ?? (compiled && this.inheritedMethod(compiled, name));
      if (own && !own.parameters.some((p) => p.dotDotDotToken) && !this.readsArguments(own)) return Math.min(decl.parameters.length, own.parameters.length);
    }
    return decl.parameters.length;
  }

  isLibGlobal(id: ts.Identifier): boolean {
    if (!LIB_GLOBALS.has(id.text)) return false;
    const decl = this.resolve(id)?.declarations?.[0];
    return !decl || decl.getSourceFile().isDeclarationFile;
  }

  resolve(n: ts.Node): ts.Symbol | undefined {
    // Library mode: `{ name }` resolves to what it reads.
    const sym = this.library && ts.isShorthandPropertyAssignment(n.parent) && n.parent.name === n ? this.checker.getShorthandAssignmentValueSymbol(n.parent) : this.checker.getSymbolAtLocation(n);
    return sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
  }

  /** Receivers a call reads its method of, held as their checked form while the call is emitted. */
  private checkedReceivers: ts.Expression[] = [];

  private call(e: ts.CallExpression): string {
    const mark = this.checkedReceivers.length;
    try {
      return this.callExpr(e);
    } finally {
      while (this.checkedReceivers.length > mark) this.subst.delete(this.checkedReceivers.pop()!);
    }
  }

  private callExpr(e: ts.CallExpression): string {
    const callee = e.expression;
    if (ts.isPropertyAccessExpression(callee) && !callee.questionDotToken && !e.questionDotToken) {
      const continued = this.continuedChain(e, callee.expression, () => this.callExpr(e));
      if (continued) return continued;
    }
    const onPrototype = this.prototypeMethodCall(e);
    if (onPrototype) return onPrototype;
    if (ts.isPropertyAccessExpression(callee) && callee.expression.kind !== ts.SyntaxKind.SuperKeyword && !this.ownCalls.has(e) && this.isInstanceKey(callee.name)) return this.ownValueCall(e, callee);
    // A static method of a class whose instances are the kit's collection: its object's.
    const aliasClass = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) ? this.resolve(callee.expression)?.valueDeclaration : undefined;
    if (!this.library && aliasClass && ts.isClassDeclaration(aliasClass) && this.collectionAlias(aliasClass)) return `${this.className(aliasClass)}.${ident((callee as ts.PropertyAccessExpression).name.text)}(${this.args(e).join(', ')})`;
    // `require` of the global object (`__non_webpack_require__('system_lib://libx.so')`): the runtime's.
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'require' && ts.isIdentifier(callee.expression) && ['global', 'globalThis'].includes(callee.expression.text) && e.arguments.length === 1) return `jsRequire(${this.coerce(e.arguments[0], 'Any?')})`;
    // A generic lambda (`const find = <T extends View>(name) => …`), its type parameters erased to their constraints: its result as this call types it.
    const lambda = ts.isIdentifier(callee) ? this.resolve(callee)?.valueDeclaration : undefined;
    const init = lambda && ts.isVariableDeclaration(lambda) ? lambda.initializer : undefined;
    if (!this.library && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.typeParameters?.length && !this.erasedCall.has(e)) {
      this.erasedCall.add(e);
      try {
        const t = this.typeOf(e);
        const code = this.call(e);
        return t === 'Unit' || t === 'Any?' ? code : cast(code, t);
      } finally { this.erasedCall.delete(e); }
    }
    // A method of an app's generic interface, whose Kotlin interface erases its type parameters: its result as this call types it.
    const member = !this.library && ts.isPropertyAccessExpression(callee) && !this.erasedCall.has(e) ? this.checker.getResolvedSignature(e)?.getDeclaration() : undefined;
    if (member && !ts.isJSDocSignature(member) && ts.isMethodSignature(member) && this.erasingInterface(member)) {
      this.erasedCall.add(e);
      try {
        const t = this.typeOf(e), declared = this.returnTypeOf(member);
        const code = this.call(e);
        return t === 'Unit' || t === declared || declared !== 'Any?' ? code : cast(code, t);
      } finally { this.erasedCall.delete(e); }
    }
    if (!e.arguments.length && ['WritableSignal', 'InputSignal', 'Signal'].includes(this.symbolName(callee))) {
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.computed.has(callee.name.text)) return `this.${ident(callee.name.text)}`;
      if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) return `this.${ident(callee.name.text)}.value`;
      return this.symbolName(callee) === 'Signal' && !this.heldSignal(callee) ? this.expr(callee) : `${this.expr(callee)}.value`;
    }
    if (callee.kind === ts.SyntaxKind.SuperKeyword) throw this.error(e, 'super() outside the start of a constructor');
    // `getWindow<UIWindow>?.()`: the type arguments are only TypeScript's, and a function declaration is always there.
    const declaredFunction = (x: ts.Expression) => ts.isIdentifier(x) && !!this.resolve(x)?.declarations?.some(ts.isFunctionDeclaration);
    if (ts.isExpressionWithTypeArguments(callee) && (!e.questionDotToken || declaredFunction(callee.expression))) return this.call(ts.factory.updateCallExpression(e, callee.expression, callee.typeArguments, e.arguments));
    if (e.questionDotToken && this.isAny(callee)) return `jsCallOptional(${this.expr(callee)}${this.untypedArgs(e)})`;
    // `obj.method?.()`: a method the program declares is always there.
    const declaredMethod = ts.isPropertyAccessExpression(callee) && !!this.resolve(callee.name)?.declarations?.some((d) => ts.isMethodDeclaration(d) && !!d.body);
    // `iterator.next?.()`: a method the library declares on a typed value is always there too.
    const libMethod = !this.library && ts.isPropertyAccessExpression(callee) && !this.isAny(callee.expression) && !!this.resolve(callee.name)?.declarations?.length
      && this.resolve(callee.name)!.declarations!.every((d) => isLibDeclaration(d) && (ts.isMethodSignature(d) || ts.isMethodDeclaration(d)));
    if (e.questionDotToken && !declaredMethod && !libMethod && !this.core?.isKitMethod(callee) && !declaredFunction(callee)) {
      const fn = this.expr(callee);
      // A Java method read untyped (`window.getInsetsController?.()`): called as script calls it.
      if (/^js(Java)?Get(Optional)?\(/.test(fn)) return this.fromAnyCode(`jsCallOptional(${fn}${this.untypedArgs(e)})`, this.typeOf(e), true);
      return `${fn}?.invoke(${this.args(e).join(', ')})`;
    }
    // A function taking an implicit `this`, called plainly: undefined is its `this`.
    const implicitCallee = ts.isIdentifier(callee) ? this.resolve(callee)?.declarations?.find((d) => this.implicitThis(d)) : undefined;
    if (implicitCallee) return `${this.refName(callee as ts.Identifier)}(${['null', ...this.args(e)].join(', ')})`;
    // The module registry, where modules only `await import(…)` reaches run when imported: each module's exports read when
    // they are first loaded, the module run first.
    if (this.moduleKey && ts.isIdentifier(callee) && callee.text === '__nsRegisterAppModules' && e.arguments[0] && ts.isObjectLiteralExpression(e.arguments[0])) {
      const entries = e.arguments[0].properties.filter(ts.isPropertyAssignment).map((p) => {
        const first = ts.isObjectLiteralExpression(p.initializer) ? p.initializer.properties.find(ts.isPropertyAssignment) : undefined;
        const ref = first && (ts.isIdentifier(first.initializer) ? first.initializer : ts.isCallExpression(first.initializer) && ts.isArrowFunction(first.initializer.arguments[0]) && ts.isNewExpression(first.initializer.arguments[0].body) ? first.initializer.arguments[0].body.expression : undefined);
        const sym = ref && ts.isIdentifier(ref) ? this.checker.getSymbolAtLocation(ref) : undefined;
        const file = (sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym)?.declarations?.[0]?.getSourceFile().fileName;
        const run = file ? `AppModules.runImport(${kotlinString(this.moduleKey!(file))}); ` : '';
        return `AppModules.register(${kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())}) { ${run}${ts.isObjectLiteralExpression(p.initializer) ? this.dynamicObject(p.initializer) : this.stored(p.initializer, p, 'Any?')} }`;
      });
      return `run { ${entries.join('; ')} }`;
    }
    if (ts.isIdentifier(callee)) return this.core?.call(e) ?? this.globalCall(callee, e);
    const nsMember = ts.isPropertyAccessExpression(callee) ? this.namespaceMember(callee) : null;
    if (nsMember) {
      if (this.typeOf(callee) === 'Any?') {
        const code = `jsCall(${this.narrowed(callee, nsMember)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
      const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
      const call = `${this.narrowed(callee, nsMember)}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
      return this.library ? this.fromPluginCall(e, call) : call;
    }
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${e.arguments.map((a) => this.restArgument(e, a, 'Any?')).join(', ')})`;
    if (isObjectToStringCall(callee, this.checker)) return `jsObjectToString(${e.arguments[0] ? this.coerce(e.arguments[0], 'Any?') : 'null'})`;
    if (ts.isPropertyAccessExpression(callee) && this.isSelf(callee.expression) && this.props.has(callee.name.text)) {
      const fn = `this.${ident(callee.name.text)}.value`;
      return `${/^\(.*\)\?$/.test(this.declaredTypeOf(callee) ?? '') ? this.callable(fn, callee) : fn}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'then' && ts.isCallExpression(callee.expression)
        && ts.isIdentifier(callee.expression.expression) && callee.expression.expression.text === '$showModal') {
      return this.showModal(callee.expression, e.arguments[0]);
    }
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      const target = callee.expression;
      // `await import('./x')`, which the build reads as `Promise.resolve({ a: __import0_a })`: the module runs first, if it has not.
      const imported = this.moduleKey && method === 'resolve' && ts.isIdentifier(target) && target.text === 'Promise' && this.isLibGlobal(target) ? this.dynamicImport(e.arguments[0]) : null;
      if (imported) return `run { AppModules.runImport(${kotlinString(this.moduleKey!(imported))}); ${this.staticCall('Promise', method, e)} }`;
      // `(super[prop.setNative] as any).call(this, value)`: the base class's method under the key, called on this object.
      let inner: ts.Expression = target;
      while (ts.isParenthesizedExpression(inner) || ts.isAsExpression(inner) || ts.isTypeAssertionExpression(inner) || ts.isNonNullExpression(inner)) inner = inner.expression;
      if (!this.library && method === 'call' && ts.isElementAccessExpression(inner) && inner.expression.kind === ts.SyntaxKind.SuperKeyword && e.arguments[0]?.kind === ts.SyntaxKind.ThisKeyword) {
        const code = `jsCall(super.jsGet(${this.propertyKey(inner.argumentExpression)})${this.untypedArgs(e, 1)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      const owner = this.symbolName(target);
      const signalValue = () => this.typeOf(target).replace(/^Signal<(.*)>$/, '$1');
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'set') return `${this.expr(target)}.value = ${this.signalWrite(target, e.arguments[0], signalValue(), true, e)}`;
      // A prop (`this.x`) reads as its value: the signal itself is the field.
      if (owner === 'InputSignal' && method === '$assign') return `${ts.isPropertyAccessExpression(target) && this.isSelf(target.expression) && this.props.has(target.name.text) ? `this.${ident(target.name.text)}` : this.expr(target)}.value = ${this.signalWrite(target, e.arguments[0], signalValue(), true, e)}`;
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'update') return `${this.expr(target)}.update(${this.closure(e.arguments[0] as ts.ArrowFunction, `(${signalValue()}) -> ${signalValue()}`)})`;
      if (owner === 'WritableSignal' && method === '$write') {
        const a = e.arguments[0];
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return `${this.expr(target)}.update(${this.closure(a)})`;
        return `${this.expr(target)}.value = ${this.coerce(a, signalValue())}`;
      }
      if ((owner === 'OutputEmitterRef' || owner === 'EventEmitter') && (method === 'emit' || method === 'next')) return `${this.expr(target)}.emit(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      if (owner === 'Injector' && method === 'get' && e.arguments[0]) {
        let rawArg0 = e.arguments[0];
        if (ts.isCallExpression(rawArg0) && rawArg0.expression.getText() === 'forwardRef' && rawArg0.arguments[0] && (ts.isArrowFunction(rawArg0.arguments[0]) || ts.isFunctionExpression(rawArg0.arguments[0])) && !ts.isBlock(rawArg0.arguments[0].body)) {
          rawArg0 = rawArg0.arguments[0].body;
        }
        const raw = `${this.expr(target)}.get(${this.coerce(rawArg0, 'Any?')}${e.arguments[1] ? `, ${this.coerce(e.arguments[1], 'Any?')}` : ''}${e.arguments[2] ? `, ${this.coerce(e.arguments[2], 'Any?')}` : ''})`;
        const t = this.typeOf(e);
        return t === 'Any?' ? raw : this.fromAny(raw, t);
      }
      // `http.get<T>(url, options)` / `http.post<T>(url, body, options)`: the parsed body read as T.
      if (owner === 'HttpClient' && ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'request'].includes(method) && this.typeOf(e).startsWith('RxObservable<')) {
        const value = /^RxObservable<(.*)>$/.exec(this.typeOf(e))?.[1] ?? 'Any?';
        const call = method === 'request'
          ? `${this.expr(target)}.request(${this.str(e.arguments[0])}, ${e.arguments[1] ? this.str(e.arguments[1]) : '""'}${e.arguments[2] ? `, ${this.coerce(e.arguments[2], 'Any?')}` : ''})`
          : ['post', 'put', 'patch'].includes(method)
            ? `${this.expr(target)}.${method}(${this.str(e.arguments[0])}${e.arguments[1] ? `, ${this.coerce(e.arguments[1], 'Any?')}` : ', null'}${e.arguments[2] ? `, ${this.coerce(e.arguments[2], 'Any?')}` : ''})`
            : `${this.expr(target)}.${method}(${this.str(e.arguments[0])}${e.arguments[1] ? `, ${this.coerce(e.arguments[1], 'Any?')}` : ''})`;
        return value === 'Any?' ? call : `${call}.mapValues { __v: Any? -> ${this.fromAny('__v', value)} }`;
      }
      if ((owner === 'WritableSignal' || owner === 'Signal') && method === 'asReadonly') return this.expr(target);
      // `String.fromCharCode.apply(_, codes)`, `Math.max.apply(_, xs)`: the library function of the list's elements.
      if (method === 'apply' && e.arguments.length === 2 && this.pure(e.arguments[0]) && ts.isPropertyAccessExpression(target) && ts.isIdentifier(target.expression) && this.isLibGlobal(target.expression)) {
        const listed = ({ 'String.fromCharCode': 'jsFromCharCodeList', 'Math.max': 'jsMathMaxList', 'Math.min': 'jsMathMinList' } as Record<string, string>)[`${target.expression.text}.${target.name.text}`];
        if (listed) return `${listed}(${this.coerce(e.arguments[1], 'Any?')})`;
      }
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      // `object.hasOwnProperty(key)`, Object.prototype's.
      if (method === 'hasOwnProperty' && e.arguments.length === 1 && this.resolve(callee.name)?.declarations?.every((d) => isLibDeclaration(d))) return `jsHasOwn(${this.coerce(target, 'Any?')}, ${this.propertyKey(e.arguments[0])})`;
      // Core's `timer` module imported whole (`timer.setTimeout(…)`): the runtime's timers.
      const timers = ts.isIdentifier(target) ? this.resolve(target)?.declarations?.[0] : undefined;
      if (timers && ts.isSourceFile(timers) && /[\\/]timer[\\/]index(\.d)?(\.android)?\.ts$/.test(timers.fileName) && ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'].includes(method)) {
        const Name = `js${method[0].toUpperCase()}${method.slice(1)}`;
        const a = e.arguments;
        return method.startsWith('set') ? `${Name}(${this.callback(a[0])}, ${a[1] ? this.toNumber(a[1]) : '0.0'})` : `${Name}(${a[0] ? this.coerce(a[0], 'Double?') : 'null'})`;
      }
      // `ArrayBuffer.from(byteBuffer)` (NativeScript's), `ArrayBuffer.isView(x)`, `Uint8Array.from(list)`.
      if (ts.isIdentifier(target) && BUFFER_TYPES.has(target.text) && ['from', 'isView'].includes(method) && e.arguments.length === 1 && this.resolve(target)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) {
        const a = e.arguments[0];
        return `JS${target.text}.${method}(${target.text === 'ArrayBuffer' && method === 'from' ? this.expr(a) : this.coerce(a, 'Any?')})`;
      }
      // Library mode: `super.m(…)` of a Java class script reaches untyped (through a local alias of the class): Kotlin's super call.
      if (this.library && target.kind === ts.SyntaxKind.SuperKeyword && this.isAny(target)) return this.native?.call(e) ?? `super.${ident(method)}(${e.arguments.map((a) => this.expr(a)).join(', ')})`;
      // A member the receiver's type does not have (a plugin's code for the other platform, typed against this one's stub): called by name.
      if (!this.library && this.inPluginFile(e) && !this.checker.getSymbolAtLocation(callee.name) && !this.isAny(target)) {
        const recv = ts.isIdentifier(target) && (this.resolve(target)?.flags ?? 0) & ts.SymbolFlags.Class ? `${this.expr(target)}::class.java` : this.coerce(target, 'Any?');
        const code = `jsCallMethod(${recv}, ${kotlinString(method)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      const bound = this.library && (method === 'call' || method === 'bind') ? this.boundCall(method, target, e) : null;
      if (bound) return bound;
      // `fn.apply(thisArg, args)`, `fn.call(thisArg, …)` of a function value: as script calls it.
      if ((method === 'apply' || method === 'call' || (method === 'bind' && !this.library)) && isFunctionType(this.typeOf(target).replace(/^\((.*)\)\?$/, '$1')) && this.resolve(callee.name)?.declarations?.every((d) => isLibDeclaration(d))) {
        const code = `jsCallMethod(${this.coerce(target, 'Any?')}, ${kotlinString(method)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      const untypedJavaField = this.library && ts.isPropertyAccessExpression(target) && this.untypedJavaFields().has(this.checker.getSymbolAtLocation(target.name)?.valueDeclaration as ts.Node);
      const core = untypedJavaField ? null : this.core?.call(e) ?? this.native?.call(e);
      if (core) return core;
      let bare: ts.Expression = target;
      while (ts.isParenthesizedExpression(bare) || ts.isAsExpression(bare) || ts.isTypeAssertionExpression(bare)) bare = bare.expression;
      if (method === 'create' && e.arguments.length === 2 && ts.isIdentifier(bare) && bare.text === 'Array' && this.isLibGlobal(bare)) return `jsArrayCreate(${this.coerce(e.arguments[0], 'Any?')}, ${this.toNumber(e.arguments[1])})`;
      if (method === 'from' && e.arguments.length === 1 && ts.isIdentifier(bare) && bare.text === 'ArrayBuffer' && bare !== target) return `JSArrayBuffer.from((${this.coerce(e.arguments[0], 'Any?')} as java.nio.ByteBuffer))`;
      // `this.m(…)` in a static method, of a static method the class declares: the companion's.
      const staticOwn = target.kind === ts.SyntaxKind.ThisKeyword && !!this.resolve(callee.name)?.declarations?.some((d) => ts.isMethodDeclaration(d) && !!d.body && isStatic(d));
      // `(<any>Object).entries(x)`: the library's own function, whatever the assertion says.
      if (!this.library && inner !== target && ts.isIdentifier(inner) && this.isLibGlobal(inner)) return this.staticCall(inner.text, method, e);
      if ((this.isAny(target) && !staticOwn) || (!this.library && this.isGlobalObject(target))) {
        const code = `${callee.questionDotToken ? 'jsCallMethodIfPresent' : 'jsCallMethod'}(${this.isGlobalObject(target) ? 'jsGlobalThis' : this.expr(target)}, ${kotlinString(method)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : callee.questionDotToken ? (this.library ? this.fromAnyCode(code, optionalType(rt), true) : code) : this.untypedResult(e, code, rt);
      }
      // An untyped field holding a function (`private _resolve;`, `_loader: Function`), called as script calls it.
      const untypedField = this.library || this.holdsFunctionObject(callee) || this.typeOf(callee) === 'Any?' ? this.checker.getSymbolAtLocation(callee.name)?.valueDeclaration : undefined;
      // A namespace's const among them, reached through an alias of the namespace.
      const namespaceConst = !!untypedField && ts.isVariableDeclaration(untypedField) && ts.isModuleBlock(untypedField.parent.parent.parent);
      if (untypedField && (ts.isPropertyDeclaration(untypedField) || ts.isPropertySignature(untypedField) || namespaceConst) && this.typeOf(callee) === 'Any?') {
        const code = `jsCall(${this.expr(callee)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      const t = this.typeOf(target).replace(/\?$/, '');
      let q = callee.questionDotToken || (callee.flags & ts.NodeFlags.OptionalChain && this.typeOf(target).endsWith('?')) ? '?' : this.typeOf(target).endsWith('?') ? '!!' : '';
      // A call of a function an untrusted value may be returned from, too: its member read is JavaScript's TypeError where it gives undefined.
      const looseCall = ts.isCallExpression(target) && !this.library && this.unwrapsResult(target);
      const missing = (t === 'String' || t === 'Double') && q !== '?' && !this.subst.has(target) ? this.receiver(target, method) : null;
      if (missing) {
        this.subst.set(target, missing);
        this.checkedReceivers.push(target);
        q = '';
      }
      if (!this.subst.has(target) && !t.startsWith('JSMatch') && (q === '!!' || (q === '' && (ts.isIdentifier(target) || ts.isPropertyAccessExpression(target) || ts.isNonNullExpression(target) || looseCall)))) {
        const code = this.expr(target);
        this.subst.set(target, q === '!!' || this.isAsserted(code) ? this.present(code, method, target) : code);
        this.checkedReceivers.push(target);
        q = '';
      }
      if (method === 'fill' && (ts.isNewExpression(target) || ts.isCallExpression(target)) && ts.isIdentifier(target.expression) && target.expression.text === 'Array' && target.arguments?.length === 1 && e.arguments.length === 1) {
        return `jsArrayFilled<${t.replace(/^JSArray<(.*)>$/, '$1')}>(${this.toNumber(target.arguments[0])}, ${this.coerce(e.arguments[0], t.replace(/^JSArray<(.*)>$/, '$1'))})`;
      }
      if (t.startsWith('JSArray<')) return this.arrayMethod(method, target, e, q);
      if (t === 'JSMatch' && method !== 'toString') {
        const chain = q === '?' || (q === '' && this.typeOf(target).endsWith('?'));
        this.subst.set(target, `${q === '!!' ? this.present(this.expr(target), method, target) : `${this.expr(target)}${chain ? '?' : ''}`}.values`);
        try { return this.arrayMethod(method, target, e, chain ? '?' : ''); } finally { this.subst.delete(target); }
      }
      if (t.startsWith('Pair<') || t.startsWith('Triple<')) {
        const el = splitTopLevel(t.replace(/^(Pair|Triple)<(.*)>$/, '$2'));
        const element = el.every((x) => x === el[0]) ? el[0] : 'Any?';
        this.subst.set(target, `JSArray<${element}>(${cast(`jsTupleList(${this.expr(target)})`, `List<${element}>`)})`);
        try { return this.arrayMethod(method, target, e, ''); } finally { this.subst.delete(target); }
      }
      // Library mode: an untyped member asserted a string (`(ctor[KNOWN_FUNCTIONS] as string).indexOf(name)`, an array): called as script calls it.
      let asserted: ts.Expression = target;
      while (ts.isParenthesizedExpression(asserted)) asserted = asserted.expression;
      const operand = (ts.isAsExpression(asserted) || ts.isTypeAssertionExpression(asserted)) ? asserted.expression : undefined;
      if (this.library && t === 'String' && operand && ['indexOf', 'includes', 'slice', 'concat', 'lastIndexOf', 'at'].includes(method) && this.typeOf(operand) === 'Any?') {
        const call = `jsCallMethod(${this.expr(operand)}, ${kotlinString(method)}${e.arguments.map((a) => `, ${this.coerce(a, 'Any?')}`).join('')})`;
        return this.fromAnyCode(call, this.typeOf(e), true);
      }
      // `s?.trim()` of an optional string: nothing where it is missing.
      if (t === 'String' && q === '?' && this.typeOf(target).endsWith('?')) return `${this.expr(target)}?.let { __s -> ${this.stringMethod(method, target, e, '__s')} }`;
      if (t === 'String') return this.stringMethod(method, target, e);
      if (t === 'Double') return this.numberMethod(method, target, e);
      if (t === 'JSBigInt' && method === 'toLocaleString') return `jsBigIntToLocaleString(${[this.expr(target), ...e.arguments.map((x) => this.restArgument(e, x, 'Any?'))].join(', ')})`;
      // A typed array's predicate, which the library types `unknown`: a Boolean, as the kit's overloads take it.
      const predicate = e.arguments[0];
      if (/^JS(Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float32|Float64)Array$/.test(t) && ['some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'filter'].includes(method) && e.arguments.length === 1 && predicate && (ts.isArrowFunction(predicate) || ts.isFunctionExpression(predicate))) {
        return `${this.expr(target)}${q}.${method}(${this.closure(predicate, `(Double, Double, ${t}) -> Boolean`)})`;
      }
      if (t.startsWith('JSPromise<')) return this.promiseMethod(method, target, e);
      if (t.startsWith('JSMap<') || t.startsWith('JSSet<')) return this.collectionMethod(method, target, e, q);
      if (this.library && t.startsWith('JSWeakMap<') && method === 'get' && e.arguments.length === 1) {
        const k = splitTopLevel(t.slice('JSWeakMap<'.length, -1))[0];
        const map = `${this.expr(target)}${q}`, key = this.coerce(e.arguments[0], k);
        const read = this.marked(`${map}.get(${key})`, { op: 'entry', of: this.valueOf(map), key: this.valueOf(key) });
        const rt = this.typeOf(e);
        return rt.endsWith('?') ? read : this.undefinedAs(read, rt);
      }
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
      // Library mode: a method an interface declares (`interface ItemSpec { toJSON() }`) that the class holds as an optional function field.
      const memberField = this.library && held && !(ts.isPropertyDeclaration(held) || ts.isPropertySignature(held)) ? this.fieldIn(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)), method) : undefined;
      const optionalFn = (!!held && (ts.isPropertyDeclaration(held) || ts.isPropertySignature(held)) && /^\(.*\)\?$/.test(this.declaredTypeOf(callee) ?? '') && isFunctionType((this.declaredTypeOf(callee) ?? '').slice(1, -2)))
        || (!!memberField && (!!memberField.questionToken || !!(this.resolve(memberField.name) && this.nullableDecls.has(this.resolve(memberField.name)!))));
      const checked = !callee.questionDotToken ? this.receiver(target, method) : null;
      const args = this.args(e, this.arity(e));
      // A field holding a function (an overloaded method type, its first signature's): the arguments script leaves out are undefined.
      // So does an object type's method its class holds as a field (`waitUntilTestElementLayoutIsValid(timeoutSec?)`).
      const signatureField = !!held && ts.isMethodSignature(held) && this.isFunctionField(this.checker.getSymbolAtLocation(callee.name)!);
      const field = !!held && (ts.isPropertyDeclaration(held) || ts.isPropertySignature(held) || signatureField || (this.library && (ts.isPropertyAssignment(held) || ts.isShorthandPropertyAssignment(held)))) ? functionTypeParts((this.declaredTypeOf(callee) ?? this.typeOf(callee)).replace(/^\((.*)\)\?$/, '$1')) : null;
      for (let k = args.length; field && k < field.params.length; k++) args.push(field.params[k] === 'Unit' ? 'Unit' : 'null');
      // Kotlin's super calls take every argument: those script leaves out are the defaults the parameters declare.
      if (target.kind === ts.SyntaxKind.SuperKeyword) {
        const sd = this.checker.getResolvedSignature(e)?.getDeclaration();
        const impl = sd && !ts.isJSDocSignature(sd) ? implementationOf(sd) ?? sd : undefined;
        if (impl && ts.isMethodDeclaration(impl) && !impl.getSourceFile().isDeclarationFile && !this.readsArguments(impl)) {
          for (let k = args.length; k < impl.parameters.length && !impl.parameters[k].dotDotDotToken; k++) {
            const p = impl.parameters[k];
            args.push(this.constantDefault(p) ? this.stored(p.initializer!, p, this.typeOf(p.name)) : 'null');
          }
        }
      }
      // Library mode: a call of a field holding a JSMethod (`itemSpec.toJSON()`), as script calls it: the object is its `this`.
      const methodField = this.library ? this.compiledField(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)), method) : undefined;
      if (this.library && (this.isThisValue(callee) || (methodField && this.thisValues().symbols.has(methodField)))) {
        const code = `jsCallMethod(${this.coerce(target, 'Any?')}, ${kotlinString(method)}${this.untypedArgs(e)})`;
        return this.typeOf(e) === 'Unit' || this.typeOf(e) === 'Any?' ? code : this.fromAnyCode(code, this.typeOf(e), true);
      }
      // `subtle.generateKey(…)` giving a key pair: the runtime's method of its own name, as Kotlin overloads by parameters alone.
      const named = method === 'generateKey' && this.typeOf(target).replace(/\?$/, '') === 'JSSubtleCrypto' && this.typeOf(e) === 'JSPromise<JSCryptoKeyPair>' ? 'generateKeyPair' : method;
      const member = this.checker.getSymbolAtLocation(callee.name);
      const receiverCode = checked ?? (q === '!!' ? this.present(this.expr(target), method, target) : `${this.expr(target)}${q ? '?' : ''}`);
      const memberCode = `${receiverCode}.${member && this.isCompiledMethod(member) ? this.methodIdent(named) : ident(named)}`;
      let call = `${optionalFn ? `(${memberCode} ?: jsNotAFunction(${kotlinString(callee.getText().replace(/\s+/g, ''))}))` : memberCode}(${args.join(', ')})`;
      if (named === 'get' && args.length === 1 && !optionalFn) this.marked(call, { op: 'entry', of: this.valueOf(receiverCode), key: this.valueOf(args[0]) });
      // Library mode: `ref.get()` read on, as if the object were there (script throws reading a member of undefined).
      if (/^JSWeakRef</.test(this.typeOf(target)) && ['get', 'deref'].includes(method) && !q && ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e && !e.parent.questionDotToken) call = this.present(call, e.parent.name.text);
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
    if (ts.isElementAccessExpression(callee) && this.library && this.typeOf(callee.argumentExpression) === 'JSSymbol') {
      // `view[prop.setNative](value)`, `super[prop.setNative](value)`: the method under the symbol, found when the program runs.
      const key = this.propertyKey(callee.argumentExpression);
      if (callee.expression.kind === ts.SyntaxKind.SuperKeyword) {
        // The method is the one the key names (`super[whiteSpaceProperty.setNative]`): every such key has the type `symbol`,
        // so the signature TypeScript resolves may be another of them.
        const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
        const keyed = decl && !ts.isJSDocSignature(decl) && ts.isMethodDeclaration(decl) && !decl.getSourceFile().isDeclarationFile ? this.symbolMember(decl.name) : null;
        const named = keyed ? this.symbolMember(ts.factory.createComputedPropertyName(callee.argumentExpression)) : null;
        const own = keyed && named && named.member !== keyed.member ? named : keyed;
        return own ? `super.${own.member}(${this.args(e).join(', ')})` : `jsCall(super.jsGet(${key})${this.untypedArgs(e)})`;
      }
      return `jsCallMethod(${this.coerce(callee.expression, 'Any?')}, ${key}${this.untypedArgs(e)})`;
    }
    if (ts.isElementAccessExpression(callee)) {
      const property = this.setNativeOf(callee.argumentExpression);
      // One a subclass declares (a plugin's `PagerBase` calling its platform class's setter): by its symbol, as script calls it.
      const holder = this.checker.getNonNullableType(this.checker.getTypeAtLocation(callee.expression)).getSymbol()?.valueDeclaration;
      const declares = (c: ts.ClassLikeDeclaration | undefined): boolean => !!c && (c.members.some((m) => ts.isMethodDeclaration(m) && !!m.name && ts.isComputedPropertyName(m.name) && this.setNativeOf(m.name.expression) === property) || declares(this.baseClassOf(c) ?? undefined));
      if (property && !this.library && holder && ts.isClassDeclaration(holder) && !holder.getSourceFile().isDeclarationFile && !declares(holder)) {
        return `jsCallMethod(${this.coerce(callee.expression, 'Any?')}, (${this.expr(callee.argumentExpression)} as JSSymbol).key${this.untypedArgs(e)})`;
      }
      if (property) return `${this.expr(callee.expression)}.__setNative_${property}(${e.arguments.map((a) => this.restArgument(e, a, 'Any?')).join(', ')})`;
      // `obj[key](…)`: a method call, the object its `this`.
      if (this.typeOf(callee) === 'Any?' && !this.library && !ts.isOptionalChain(e) && this.checker.getTypeAtLocation(callee.argumentExpression).flags & ts.TypeFlags.StringLike && callee.expression.kind !== ts.SyntaxKind.SuperKeyword) {
        return `jsCallMethod(${this.coerce(callee.expression, 'Any?')}, ${this.str(callee.argumentExpression)}${this.untypedArgs(e)})`;
      }
      if (this.typeOf(callee) === 'Any?') return `jsCall(${this.expr(callee)}${this.untypedArgs(e)})`;
    }
    let fn: ts.Expression = callee;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    // `(function () { … })()`: the function, called.
    if (ts.isFunctionExpression(fn) || ts.isArrowFunction(fn)) return `(${this.closure(fn)})(${this.args(e).join(', ')})`;
    // `(value as F)(…)`: the value read as the function type, called (the factory would parenthesize the cast again).
    if (ts.isParenthesizedExpression(callee) && (ts.isAsExpression(callee.expression) || ts.isTypeAssertionExpression(callee.expression) || ts.isSatisfiesExpression(callee.expression))) {
      // A value held untyped (`(<Template>this.itemTemplate)()`, a field of a union type): called as script calls it.
      const inner = callee.expression.expression;
      if (this.library && (this.typeOf(inner) === 'Any?' || this.declaredTypeOf(inner) === 'Any?')) {
        const code = `jsCall(${this.expr(inner)}${this.untypedArgs(e)})`;
        const rt = this.typeOf(e);
        return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
      }
      return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    }
    // `(a || b)(…)`: the factory would parenthesize the operand again.
    if (ts.isParenthesizedExpression(callee) && (ts.isBinaryExpression(callee.expression) || ts.isConditionalExpression(callee.expression))) {
      const t = this.typeOf(callee);
      if (!isFunctionType(t.replace(/^\((.*)\)\?$/, '$1'))) return this.fromAnyCode(`jsCall(${this.expr(callee.expression)}${this.untypedArgs(e)})`, this.typeOf(e), true);
      return `${this.callable(this.coerce(callee.expression, t.replace(/^\((.*)\)\?$/, '$1')), callee)}(${this.args(e).join(', ')})`;
    }
    if (ts.isParenthesizedExpression(callee)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    // A function read from a record may be missing: calling it then throws, as calling undefined does.
    if (ts.isElementAccessExpression(callee) && /^JSRecord</.test(this.typeOf(callee.expression))) return `(${this.expr(callee)} ?: jsNotAFunction(${kotlinString(callee.getText().replace(/\s+/g, ''))}))(${this.args(e).join(', ')})`;
    // A call's untyped result called (`closeModalGetter(args)(result)`, a `Function`): as script calls it.
    if (ts.isCallExpression(callee) && this.typeOf(callee) === 'Any?') {
      const code = `jsCall(${this.expr(callee)}${this.untypedArgs(e)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
    }
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    // `handler!(…)`: the function, where undefined is not a function.
    if (ts.isNonNullExpression(callee) && /\?$/.test(this.typeOf(callee.expression))) return `(${this.expr(callee.expression)} ?: jsNotAFunction(${kotlinString(callee.expression.getText().replace(/\s+/g, ''))}))(${this.args(e).join(', ')})`;
    throw this.error(e, 'call');
  }

  /**
   * `f.call(thisArg, …)`, `f.bind(thisArg)` of a typed function: one declaring `this` takes it as its first
   * parameter; any other ignores it, as an arrow function does.
   */
  /**
   * `X.prototype.m.call(r, …)` and `X.prototype.m.apply(r, [ … ])` of a class the program declares: `m` called on `r`
   * as an `X`. A compiled class keeps its methods on the class, not on its prototype object.
   */
  private prototypeMethodCall(e: ts.CallExpression): string | null {
    const callee = e.expression;
    if (!ts.isPropertyAccessExpression(callee) || !['call', 'apply'].includes(callee.name.text) || !e.arguments.length) return null;
    const method = callee.expression;
    if (!ts.isPropertyAccessExpression(method) || !ts.isPropertyAccessExpression(method.expression) || method.expression.name.text !== 'prototype') return null;
    const cls = this.resolve(method.expression.expression)?.valueDeclaration;
    if (!cls || !ts.isClassDeclaration(cls)) return null;
    const rest = callee.name.text === 'call' ? e.arguments.slice(1) : e.arguments[1] && ts.isArrayLiteralExpression(e.arguments[1]) && !e.arguments[1].elements.some(ts.isSpreadElement) ? [...e.arguments[1].elements] : e.arguments.length === 1 ? [] : null;
    if (cls.getSourceFile().isDeclarationFile) return rest && this.kitPrototypeCall(cls, method.name.text, e, rest);
    const decl = this.declaringMethod(cls, method.name.text);
    if (!decl || !rest || decl.parameters.some((p) => p.dotDotDotToken) || rest.length > decl.parameters.length) return null;
    const receiver = this.coerce(e.arguments[0], 'Any?');
    const args = rest.map((a, k) => this.coerce(a, this.paramType(decl.parameters[k])));
    // Parameters left out are undefined: Kotlin's defaults for the trailing ones that declare one, null up to them.
    const left = decl.parameters.slice(rest.length);
    for (const p of left.slice(0, left.findLastIndex((x) => !x.initializer && !x.questionToken) + 1)) {
      if (p.initializer || !isNullable(this.paramType(p))) throw this.error(e, `${callee.name.text} of ${cls.name?.text}.prototype.${method.name.text} leaving out \`${p.name.getText()}\`, which can't hold undefined`);
      args.push('null');
    }
    const owner = decl.parent as ts.ClassDeclaration;
    const name = this.nonVirtualEntry(decl) ? ident(nonVirtualName(method.name.text, owner.name!.text)) : this.methodIdent(method.name.text);
    return `${this.checkedCast(receiver, this.className(owner))}.${name}(${args.join(', ')})`;
  }

  /** The method with a body `X.prototype.name` is: X's own, or the nearest base's of the program's. */
  private declaringMethod(cls: ts.ClassLikeDeclaration, name: string): ts.MethodDeclaration | undefined {
    for (let c: ts.ClassLikeDeclaration | undefined = cls; c; c = this.programBase(c)) {
      const m = c.members.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && !isStatic(x) && !!x.body && x.name.getText() === name);
      if (m) return m;
      if (c.members.some((x) => !isStatic(x) && x.name?.getText() === name)) return undefined;
    }
    return undefined;
  }

  private nonVirtualMethods: Set<ts.MethodDeclaration> | null = null;
  /**
   * A method some subclass overrides, which `X.prototype.m.call(obj, …)` calls as X has it whatever obj's class is: it
   * gets a final copy too, as Kotlin dispatches `m` by the object's class. Library mode: each such method, which an app
   * may name; otherwise those the program names.
   */
  private nonVirtualEntry(m: ts.MethodDeclaration): boolean {
    if (!this.nonVirtualMethods) {
      const set = new Set<ts.MethodDeclaration>();
      const classes: ts.ClassLikeDeclaration[] = [];
      const collect = (n: ts.Node) => { if (ts.isClassLike(n)) classes.push(n); ts.forEachChild(n, collect); };
      for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) collect(sf);
      const overriddenBelow = (m: ts.MethodDeclaration) => {
        const owner = m.parent as ts.ClassLikeDeclaration, name = m.name.getText();
        const below = (c: ts.ClassLikeDeclaration) => { for (let b = this.programBase(c); b; b = this.programBase(b)) if (b === owner) return true; return false; };
        return classes.some((c) => c !== owner && below(c) && c.members.some((x) => !isStatic(x) && x.name?.getText() === name));
      };
      const consider = (m: ts.MethodDeclaration | undefined) => { if (m && !m.typeParameters?.length && !m.parameters.some((p) => p.dotDotDotToken) && ts.isClassDeclaration(m.parent) && m.parent.name && overriddenBelow(m)) set.add(m); };
      if (this.library) {
        for (const c of classes) for (const x of c.members) if (ts.isMethodDeclaration(x) && !isStatic(x) && x.body && !ts.isComputedPropertyName(x.name)) consider(x);
      } else {
        const visit = (n: ts.Node) => {
          if (ts.isPropertyAccessExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'prototype') {
            const owner = this.resolve(n.expression.expression)?.valueDeclaration;
            if (owner && ts.isClassDeclaration(owner) && !owner.getSourceFile().isDeclarationFile) consider(this.declaringMethod(owner, n.name.text));
          }
          ts.forEachChild(n, visit);
        };
        for (const sf of this.sourceFiles) if (!sf.isDeclarationFile) visit(sf);
      }
      this.nonVirtualMethods = set;
    }
    return this.nonVirtualMethods.has(m);
  }

  /**
   * `KitClass.prototype.m.call(obj, …)` of a kit class: its final copy of `m` where the kit has one, and `super.m` for
   * `this` where neither the kit nor a program class between overrides it.
   */
  private kitPrototypeCall(cls: ts.ClassDeclaration, name: string, e: ts.CallExpression, rest: ts.Expression[]): string | null {
    const kit = cls.name && this.core?.has(cls.name.text) ? cls.name.text : null;
    const thisArg = e.arguments[0];
    if (!kit || !this.core) return null;
    const plain = (x: ts.Expression): boolean => x.kind === ts.SyntaxKind.ThisKeyword || ts.isIdentifier(x) || (ts.isPropertyAccessExpression(x) ? plain(x.expression) : this.pure(x));
    const isInstance = plain(thisArg) && this.checker.isTypeAssignableTo(this.checker.getTypeAtLocation(thisArg), this.checker.getDeclaredTypeOfSymbol(this.resolve(cls.name!)!));
    const target = ts.isPropertyAccessExpression(e.expression) ? e.expression.expression : undefined;
    const member = target && this.checker.getSymbolAtLocation((target as ts.PropertyAccessExpression).name);
    const params = member?.valueDeclaration && ts.isMethodDeclaration(member.valueDeclaration) ? member.valueDeclaration.parameters : undefined;
    if (isInstance && params && !params.some((p) => p.dotDotDotToken) && rest.length <= params.length && !rest.some(ts.isSpreadElement)) {
      const args = rest.map((a, k) => this.coerce(a, this.paramType(params[k])));
      const entry = this.core.nonVirtualEntry(kit, name);
      if (entry) return `${this.expr(thisArg)}.${ident(entry)}(${args.join(', ')})`;
      const host = thisArg.kind === ts.SyntaxKind.ThisKeyword ? ts.findAncestor(e, (n) => ts.isClassLike(n) || (ts.isFunctionLike(n) && !ts.isArrowFunction(n) && !ts.isMethodDeclaration(n) && !ts.isConstructorDeclaration(n) && !ts.isAccessor(n))) : undefined;
      if (host && ts.isClassLike(host) && this.core.kitMember(kit, name)) {
        let between = false;
        for (let b = this.programBase(host); b; b = this.programBase(b)) if (b.members.some((x) => !isStatic(x) && x.name?.getText() === name)) between = true;
        if (!between) return `super.${this.methodIdent(name)}(${args.join(', ')})`;
      }
    }
    throw this.error(e, `${ts.isPropertyAccessExpression(e.expression) ? e.expression.name.text : 'call'} of ${cls.name?.text}.prototype.${name} on an object whose class may override it`);
  }

  private boundCall(method: string, target: ts.Expression, e: ts.CallExpression): string | null {
    const member = this.checker.getSymbolAtLocation((e.expression as ts.PropertyAccessExpression).name);
    if (!member?.declarations?.every(isLibDeclaration)) return null;
    const sig = this.checker.getTypeAtLocation(target).getCallSignatures()[0];
    const declared = this.declaredTypeOf(target) ?? this.typeOf(target);
    const parts = functionTypeParts(declared.replace(/^\((.*)\)\?$/, '$1'));
    if (!sig || !parts || e.arguments.some(ts.isSpreadElement)) return null;
    const self = (sig as ts.Signature & { thisParameter?: ts.Symbol }).thisParameter;
    const takesThis = !!self && this.type(this.checker.getTypeOfSymbolAtLocation(self, target), target) !== 'Unit';
    const fn = /\)\?$/.test(declared) ? `(${this.unasserted(this.expr(target))} ?: jsCannotRead(${kotlinString(method)}))` : this.expr(target);
    const [thisArg, ...rest] = e.arguments;
    const effectless = (x: ts.Expression): boolean => x.kind === ts.SyntaxKind.ThisKeyword || ts.isIdentifier(x) || (ts.isPropertyAccessExpression(x) && effectless(x.expression)) || this.pure(x);
    if (!takesThis && thisArg && !effectless(thisArg)) return null;
    const given = [...(takesThis ? [thisArg] : []), ...rest];
    if (method === 'bind') {
      if (!takesThis && !rest.length) return fn;
      const names = parts.params.map((_, k) => pure(`__b${k}`));
      const fixed = given.map((a, k) => (a ? this.coerce(a, parts.params[k]) : 'null'));
      return `{ ${names.slice(given.length).map((n, k) => `${n}: ${parts.params[given.length + k]}`).join(', ')} -> ${fn}(${[...fixed, ...names.slice(given.length)].join(', ')}) }`;
    }
    const args = parts.params.map((t, k) => (given[k] ? this.coerce(given[k], t) : t.endsWith('?') ? 'null' : this.zero(t) ?? 'null'));
    return `${fn}(${args.join(', ')})`;
  }

  /** A call of a plugin function Kotlin types more loosely (a generic result is `Any?`): the value as the call site's type. */
  private fromPluginCall(e: ts.CallExpression, code: string): string {
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    code = this.lenientResult(e, code);
    if (!decl || ts.isJSDocSignature(decl)) return code;
    const site = this.typeOf(e);
    // An overload's call, where Kotlin's one function gives what the implementation returns (`getWindows`'s `WindowBase[]` for `NativeWindow[]`).
    const impl = implementationOf(decl as ts.SignatureDeclaration);
    const made = impl && impl !== decl ? this.returnTypeOf(impl) : null;
    const overloaded = !!made && made.replace(/\?$/, '') !== site.replace(/\?$/, '') && site !== 'Unit' && site !== 'Any?' && made !== 'Unit';
    const fromOverload = () => (made === 'Any?' ? this.fromAnyCode(code, site, true) : cast(code, this.isAsserted(code) || (!this.library && !isNullable(made!)) ? site : optionalType(site)));
    if (!this.pluginFiles.has(decl.getSourceFile().fileName)) return overloaded && !this.library ? fromOverload() : code;
    const declared = this.returnTypeOf(decl as ts.SignatureDeclaration);
    if (declared === 'Any?' && site !== 'Any?' && site !== 'Unit') return this.fromAnyCode(code, site, true);
    if (overloaded) return fromOverload();
    // A generic function's result, its type parameters erased (`makeParser<T>` gives `(Any?) -> Any?`): what this call instantiates.
    const generic = !!(decl as ts.SignatureDeclaration).typeParameters?.length && declared !== site && site !== 'Unit' && site !== 'Any?' && declared.includes('Any?');
    return generic && (isFunctionType(declared.replace(/^\((.*)\)\?$/, '$1')) || /^JS\w+</.test(declared)) ? cast(code, site) : code;
  }

  /** The new value of a signal, stored by `at` (`checks` as `storeSlot` has it). */
  private signalWrite(target: ts.Expression, value: ts.Expression, t: string, checks: boolean, at: Store = target): string {
    let code = this.stored(value, at, t, checks);
    // A non-strict app's signal of an object takes undefined (`items.find(…)`) as it holds its initial null: unchecked.
    if (this.lenientApp && !this.library && this.isAsserted(code) && this.isObjectType(t) && !isNullable(t)) code = `(${this.unasserted(code)} ?: jsUncheckedNull<${t}>())`;
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
    // Library mode: a function returning its last argument (`zonedCallback(fn)`).
    if (this.library?.identities.has(callee.text) && e.arguments.length && (this.resolve(callee)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile)) return this.restArgument(e, e.arguments[e.arguments.length - 1], this.typeOf(e));
    // NativeScript's `gc()`: the JVM's collector.
    if (callee.text === 'gc' && !e.arguments.length && (this.resolve(callee)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile) && !!declFile) return 'java.lang.System.gc()';
    // NativeScript's `float(n)`, `long(n)`: a number the native call converts to its parameter's Java type.
    if (['float', 'long', 'short', 'byte', 'double'].includes(callee.text) && (this.resolve(callee)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile) && !!declFile && e.arguments.length === 1) return this.toNumber(e.arguments[0]);
    // Library mode: a global function only core's declarations describe (`gc()`, `__startCPUProfiler()`): the runtime's, found on the global object.
    // App mode: a function the program only declares (`declare function __startCPUProfiler(name)`, which the runtime may provide): the global object's.
    const appDeclared = !this.library ? this.resolve(callee)?.declarations?.[0] : undefined;
    if (appDeclared && ts.isFunctionDeclaration(appDeclared) && !appDeclared.body && hasModifier(appDeclared, ts.SyntaxKind.DeclareKeyword) && (!appDeclared.getSourceFile().isDeclarationFile || isAppDeclarationFile(appDeclared))) {
      const code = `jsCall(jsGetOptional(jsGlobalThis, ${kotlinString(callee.text)})${this.untypedArgs(e)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
    }
    const globals = this.library ? this.resolve(callee)?.declarations ?? [] : [];
    if (globals.length && globals.every((d) => d.getSourceFile().isDeclarationFile && !isLibDeclaration(d) && (ts.isFunctionDeclaration(d) || ts.isVariableDeclaration(d))
        && (!ts.isExternalModule(d.getSourceFile()) || !!ts.findAncestor(d, (a) => ts.isModuleDeclaration(a) && a.name.getText() === 'global')))) {
      const code = `jsCall(jsGetOptional(jsGlobalThis, ${kotlinString(callee.text)})${this.untypedArgs(e)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
    }
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
    const arg = (k: number) => e.arguments[k];
    const decl = this.resolve(callee)?.declarations?.[0];
    // Core's timers imported from their module under another name (`setTimeout as __timer_setTimeout`): the runtime's.
    const timer = decl && /[\\/]timer[\\/]index(\.d)?(\.android)?\.ts$/.test(decl.getSourceFile().fileName) ? this.resolve(callee)!.name : undefined;
    const name = timer && ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'].includes(timer) ? timer : callee.text;
    const lib = !decl || decl.getSourceFile().isDeclarationFile;
    if (name === 'get' && e.arguments.length === 1 && this.symbolName(arg(0)) === 'Writable') return `${this.expr(arg(0))}.value`;
    if (name === 'navigate' && arg(0) && ts.isObjectLiteralExpression(arg(0))) return this.navigate(e);
    if (['$signal', 'ref', '$ref', 'signal', 'model', 'writable', '$writable'].includes(name) && lib) {
      const t = this.typeOf(e).replace(/^Signal<(.*)>$/, '$1');
      const kind = name === 'ref' || name === '$ref' ? 'vue' : name === '$signal' || name === 'writable' ? 'svelte' : 'identity';
      return this.newSignal(t, arg(0) ? this.restArgument(e, arg(0), t) : 'null', kind);
    }
    if (name === 'linkedSignal' && lib) {
      const t = this.typeOf(e).replace(/^Signal<(.*)>$/, '$1');
      const reference = !['Double', 'String', 'Boolean'].includes(t.replace(/\?$/, '')) && !isFunctionType(t);
      return `Signal.linked<${t}>(${this.expr(arg(0))}${reference ? ', ::jsSame' : ''})`;
    }
    if (name === '$state' && lib) return `stateSignal(${this.expr(arg(0))})`;
    if (name === 'untracked' && lib) return `(${this.expr(arg(0))})()`;
    if (name === 'runInInjectionContext' && lib) {
      const fn = arg(1);
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
        const t = this.typeOf(e);
        return `Injector.runInContext(${this.restArgument(e, arg(0), 'Any?')}, ${this.closure(fn, `() -> ${t}`)})`;
      }
      const raw = `Injector.runInContext(${this.restArgument(e, arg(0), 'Any?')}) { jsCall(${this.restArgument(e, arg(1), 'Any?')}) }`;
      const t = this.typeOf(e);
      return t === 'Any?' || t === 'Unit' ? raw : this.fromAny(raw, t);
    }
    if ((name === 'forwardRef' || name === 'resolveForwardRef') && lib) {
      if (arg(0) && (ts.isArrowFunction(arg(0)) || ts.isFunctionExpression(arg(0))) && !ts.isBlock(arg(0).body)) return this.expr(arg(0).body);
      return `resolveForwardRef(${arg(0) ? this.restArgument(e, arg(0), 'Any?') : 'null'})`;
    }
    if (name === 'isDevMode' && lib) return 'false';
    const shimmed = decl && ts.isFunctionDeclaration(decl) && decl.getSourceFile().fileName.startsWith('/__shims__/') ? decl.name?.text : undefined;
    if (shimmed === 'enableProdMode') return 'Unit';
    if (shimmed === 'isAngularHmrRestoringRoute') return 'false';
    // Angular's `effect()`.
    if (name === 'effect' && lib && arg(0)) return `Effect.deferred(${this.callback(arg(0))})`;
    if ((name === 'nextTick' || name === 'tick') && !e.arguments.length && lib) return `Reactivity.${name}()`;
    if (name === 'output' && lib) return `${this.typeOf(e)}()`;
    if (name === 'inject' && lib) {
      let rawArg0 = arg(0);
      if (rawArg0 && ts.isCallExpression(rawArg0) && rawArg0.expression.getText() === 'forwardRef' && rawArg0.arguments[0] && (ts.isArrowFunction(rawArg0.arguments[0]) || ts.isFunctionExpression(rawArg0.arguments[0])) && !ts.isBlock(rawArg0.arguments[0].body)) {
        rawArg0 = rawArg0.arguments[0].body;
      }
      const target = ts.isExpressionWithTypeArguments(rawArg0) ? rawArg0.expression : rawArg0;
      const token = this.tokenName(target);
      if (token === 'NATIVE_DIALOG_DATA') return this.fromAny('NativeDialogRef.current.data', this.typeOf(e));
      const tokenDecl = this.resolve(target)?.declarations?.[0];
      const builtin = ['RouterExtensions', 'ActivatedRoute', 'Page', 'DestroyRef', 'ChangeDetectorRef', 'ElementRef', 'NativeDialogRef', 'NativeDialogService', 'Router', 'HttpClient', 'Injector', 'EnvironmentInjector', 'NgZone', 'ErrorHandler', 'Location', 'ViewContainerRef', 'ApplicationRef'].includes(token);
      const appService = this.isInjectableClass(tokenDecl);
      if (builtin || appService) return injected(token);
      const raw = `Injector.inject(${this.coerce(rawArg0, 'Any?')}${arg(1) ? `, ${this.restArgument(e, arg(1), 'Any?')}` : ''})`;
      const t = this.typeOf(e);
      return t === 'Any?' ? raw : this.fromAny(raw, t);
    }
    if (name === 'firstValueFrom' && lib) return `rxFirstValueFrom(${this.expr(arg(0))})`;
    if (name === '$navigateTo' && lib) return this.navigate(e);
    if (name === '$showModal' && lib) return this.showModal(e);
    if (name === '$closeModal' && lib) return `Modal.close(${arg(0) ? this.restArgument(e, arg(0), 'Any?') : ''})`;
    if (lib) {
      switch (name) {
        case 'String': return arg(0) ? this.str(arg(0)) : '""';
        case 'Number': return arg(0) ? this.toNumber(arg(0)) : '0.0';
        case 'Boolean': return arg(0) ? this.cond(arg(0)) : 'false';
        case 'parseInt': return `jsParseInt(${this.str(arg(0))}${arg(1) ? `, ${this.toNumber(arg(1))}` : ''})`;
        case 'parseFloat': return `jsParseFloat(${this.str(arg(0))})`;
        case 'isNaN': return this.nanTest(arg(0));
        case 'isFinite': return `jsIsFinite(${this.toNumber(arg(0))})`;
        case 'setTimeout': case 'setInterval': {
          const timer = `js${name[0].toUpperCase()}${name.slice(1)}`;
          const ms = arg(1) ? this.toNumber(arg(1)) : '0.0';
          // The arguments after the delay are the callback's.
          const params = e.arguments.length > 2 ? functionTypeParts(this.typeOf(arg(0)).replace(/^\((.*)\)\?$/, '$1'))?.params : undefined;
          if (params) {
            const given = e.arguments.slice(2, 2 + params.length).map((x, k) => `val __x${k} = ${this.coerce(x, params[k])}; `);
            return `run { val __f = ${this.fn(arg(0))}; ${given.join('')}${timer}({ __f(${params.map((_, k) => (k < given.length ? `__x${k}` : 'null')).join(', ')}); Unit }, ${ms}) }`;
          }
          return `${timer}(${this.callback(arg(0))}, ${ms})`;
        }
        case 'clearTimeout': case 'clearInterval': return `js${name[0].toUpperCase()}${name.slice(1)}(${arg(0) ? this.restArgument(e, arg(0), 'Double?') : 'null'})`;
        case 'queueMicrotask': return `jsQueueMicrotask(${this.callback(arg(0))})`;
        case 'Symbol': return `jsSymbol(${arg(0) ? this.str(arg(0)) : 'null'})`;
        case 'BigInt': return `JSBigInt.convert(${this.restArgument(e, arg(0), 'Any?')})`;
        case 'unescape': return `jsUnescape(${this.str(arg(0))})`;
        case 'atob': case 'btoa': return `js${name[0].toUpperCase()}${name.slice(1)}(${this.str(arg(0))})`;
        case 'encodeURIComponent': case 'encodeURI': case 'decodeURIComponent': case 'decodeURI':
          return `js${name[0].toUpperCase()}${name.slice(1)}(${this.str(arg(0))})`;
      }
      // `Error('x')` constructs as `new Error('x')` does; so does `Array(n)`.
      if (ERRORS[name]) return this.errorValue(name, e.arguments);
      if (name === 'Array' && this.isLibGlobal(callee as ts.Identifier)) return this.arrayConstruct(e, this.typeOf(e), e.arguments);
      // `RegExp(re)` without flags is `re` itself; otherwise it constructs as `new RegExp` does.
      if (name === 'RegExp' && decl && isLibDeclaration(decl)) return e.arguments.length === 1 && this.isRegExp(e.arguments[0]) ? this.expr(e.arguments[0]) : this.regExpConstruct(e.arguments, true);
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve(${resolvers.type === 'Unit' ? 'Unit' : 'null'})`;
      if (this.isPromiseType(this.typeOf(arg(0)))) return `${resolvers.name}.resolvePromise(${this.restArgument(e, arg(0), `JSPromise<${resolvers.type}>`)})`;
      return `${resolvers.name}.resolve(${this.restArgument(e, arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body) || ts.isArrowFunction(declared) || ts.isFunctionExpression(declared);
    const fnType = this.declaredTypeOf(callee) ?? this.typeOf(callee);
    // A function held untyped (one of several function types): called as script calls it.
    if (fnType === 'Any?' || this.typeOf(callee) === 'Any?') {
      const code = `jsCall(${this.expr(callee)}${this.untypedArgs(e)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || rt === 'Unit' ? code : this.fromAnyCode(code, rt, true);
    }
    const own = `${this.refName(callee)}${this.states.nullishRead(callee) ? '.optional' : ''}`;
    const qualified = this.appModule && shadowedByMember(e, this.resolve(callee)?.declarations?.[0], own, ident) ? `${this.appModule}.${own}` : own;
    const fn = this.narrowed(callee, qualified);
    const nullable = /^\(.*\)\?$/.test(fnType) && isFunctionType(fnType.slice(1, -2));
    // A function value of a rest parameter (`(...args) => void`, Kotlin's of one list): the arguments packed.
    const parts = functionTypeParts(fnType.replace(/^\((.*)\)\?$/, '$1'));
    const restValue = !this.library && isFunctionValue && !!declared && !ts.isJSDocSignature(declared) && declared.parameters.length === 1 && !!declared.parameters[0].dotDotDotToken && parts?.params.length === 1 && /^JSArray</.test(parts.params[0]);
    const call = `${nullable || this.isAsserted(fn) ? `(${this.unasserted(fn)} ?: jsNotAFunction(${kotlinString(callee.getText().replace(/\s+/g, ''))}))` : fn}(${restValue ? this.packed(e.arguments, parts!.params[0]) : this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
    return this.library ? this.fromPluginCall(e, call) : this.lenientResult(e, call);
  }

  /** `computed<T>(fn)`'s value type: the type argument it is given, else what fn returns. */
  private computedType(e: ts.CallExpression): string {
    const given = e.typeArguments?.[0];
    return given ? this.type(this.checker.getTypeFromTypeNode(given), given) : this.returnTypeOf(e.arguments[0] as ts.ArrowFunction);
  }

  private erasedReads = new Set<ts.Node>();

  /** A generic function compiled with its type parameters erased (`loadCache<T>`): its result as this call instantiates it. */
  private erasedResult(e: ts.CallExpression, code: string): string {
    if (this.library) return code;
    const decl = this.checker.getResolvedSignature(e)?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl) || !decl.typeParameters?.some(erasedTypeParameter) || decl.getSourceFile().isDeclarationFile) return code;
    const declared = this.returnTypeOf(decl as ts.SignatureDeclaration), actual = this.typeOf(e);
    if (declared === actual || actual === 'Unit' || actual === 'Any?') return code;
    return isNullable(actual) ? this.fromAny(code, actual) : this.fromAnyCode(code, actual, true);
  }

  /** The plugins' source directories, whose Angular components compile with the app's but are typed by the plugin's own build. */
  pluginRoots: string[] = [];

  /** Whether a node is a plugin's code, a component of its included (a node the translation made has no source file: not one). */
  private inPluginFile(n: ts.Node): boolean {
    let at: ts.Node | undefined = n;
    while (at && !ts.isSourceFile(at)) at = at.parent;
    return !!at && (this.pluginFiles.has(at.fileName) || this.pluginRoots.some((r) => (at as ts.SourceFile).fileName.startsWith(r)));
  }

  /** A call of a function the program's declarations give (`computed` from @angular/core), not one of its own. */
  private isLibCall(e: ts.CallExpression): boolean {
    const decl = this.resolve(e.expression)?.declarations?.[0];
    return !decl || decl.getSourceFile().isDeclarationFile;
  }

  /** An injection token's name: a framework class by the name it is declared with (`NativeDialog` is `NativeDialogService`). */
  private tokenName(e: ts.Expression): string {
    const decl = this.resolve(e)?.declarations?.[0];
    return decl && ts.isClassDeclaration(decl) && decl.name && decl.getSourceFile().fileName.startsWith('/__shims__/') ? decl.name.text : e.getText();
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
          if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, this.shorthandValue(p.name));
          else if (ts.isPropertyAssignment(p)) given.set((p.name as ts.Identifier).text, this.expr(p.initializer));
        }
      }
    }
    const args = info.props.map((p) => `${ident(p)} = ${given.get(p) ?? 'null'}`).join(', ');
    return `kitNavigate { ${component}(${args}).render() }`;
  }

  nanTest(e: ts.Expression): string {
    const n = this.toNumber(e);
    return `${postfixable(n) ? n : `(${n})`}.isNaN()`;
  }

  toNumber(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'JSBigInt') return `${this.expr(e)}.toDouble()`;
    // `a?.length` is undefined, NaN as a number, where `a` is (the type says number where null checks are off).
    if (t === 'Double' && e.flags & ts.NodeFlags.OptionalChain && (ts.isPropertyAccessExpression(e) || ts.isCallExpression(e) || ts.isElementAccessExpression(e))) return this.undefinedAs(this.expr(e), 'Double');
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
        if (e.arguments.some(ts.isSpreadElement)) return `${fn}(*${this.packed(e.arguments, 'JSArray<Any?>', this.restSlot(e, 'Any?'))}.storage.toTypedArray())`;
        return `${fn}(${e.arguments.map((x) => this.restArgument(e, x, 'Any?')).join(', ')})`;
      }
      case 'JSON':
        if (method === 'parse') return `jsJSONParse(${this.str(arg(0))}${arg(1) ? `, ${this.restArgument(e, arg(1), 'Any?')}` : ''})`;
        // Undefined, a function or a symbol stringifies to undefined.
        if (method === 'stringify') {
          const replacer = arg(1) && arg(1).kind !== ts.SyntaxKind.NullKeyword && !(ts.isIdentifier(arg(1)) && arg(1).getText() === 'undefined') ? `, replacer = ${this.restArgument(e, arg(1), 'Any?')}` : '';
          return this.undefinedAs(`jsJSONStringify(${this.restArgument(e, arg(0), 'Any?')}${arg(2) ? `, ${this.restArgument(e, arg(2), 'Any?')}` : ''}${replacer})`, T());
        }
        break;
      case 'Object': {
        // A literal there is built untyped (the parameter is `{}`): its keys read by name.
        const record = this.typeOf(arg(0)).startsWith('JSRecord<') && !ts.isObjectLiteralExpression(ts.skipOuterExpressions(arg(0)));
        if (record && ['keys', 'values', 'entries'].includes(method)) return `${this.expr(arg(0))}.${method}`;
        if (method === 'keys') return `jsObjectKeys(${this.expr(arg(0))})`;
        if (method === 'values' || method === 'entries') {
          // Untyped (`(<any>Object).entries(o)`): an array of untyped values, or of key and value pairs.
          const array = T() === 'Any?' ? (method === 'values' ? 'JSArray<Any?>' : 'JSArray<Pair<String, Any?>>') : T();
          const el = array.replace(/^JSArray<(.*)>$/, '$1');
          const value = method === 'values' ? el : el.replace(/^Pair<String, (.*)>$/, '$1');
          const read = this.fromAnyCode('jsField(__o, it)', value);
          return `run { val __o: Any? = ${this.expr(arg(0))}; ${array}(jsKeysOf(__o).map { ${method === 'values' ? read : `Pair(it, ${read})`} }) }`;
        }
        if (method === 'freeze') return `jsFreeze(${this.expr(arg(0))})`;
        if (method === 'seal' || method === 'preventExtensions') return `jsRestrict(${this.expr(arg(0))}, ${method === 'seal'})`;
        const untyped: Record<string, string> = { isFrozen: 'jsIsFrozen', isSealed: 'jsIsSealed', isExtensible: 'jsIsExtensible', getOwnPropertySymbols: 'jsOwnPropertySymbols', getOwnPropertyNames: 'jsOwnPropertyNames' };
        if (untyped[method]) return `${untyped[method]}(${this.restArgument(e, arg(0), 'Any?')})`;
        // A declared function by its reference, which every read of it gives (its properties are keyed by it).
        const definedOn = (x: ts.Expression) => (ts.isIdentifier(x) && this.resolve(x)?.valueDeclaration && ts.isFunctionDeclaration(this.resolve(x)!.valueDeclaration!) ? this.functionValue(x) : this.coerce(x, 'Any?'));
        if (method === 'getOwnPropertyDescriptor') return `jsOwnPropertyDescriptor(${definedOn(arg(0))}, ${this.propertyKey(arg(1))})`;
        if (method === 'fromEntries') return `jsObjectFromEntries(${this.iterable(arg(0))})`;
        if (method === 'groupBy') return `jsObjectGroupBy<${this.elementTypeOf(arg(0))}, ${T().replace(/^JSRecord<(.*)>\??$/, '$1')}>(${this.iterable(arg(0))}, ${this.fn(arg(1), this.groupKeySlot(arg(0), arg(1), 'Any?'))})`;
        // `Object.create(null)`: the runtime's objects inherit no keys, so an empty one.
        if (method === 'create' && arg(0)?.kind === ts.SyntaxKind.NullKeyword && e.arguments.length === 1) return 'JSObject()';
        if (method === 'defineProperty' || method === 'defineProperties') this.refuseRunTimeDefine(e);
        if (method === 'defineProperty') {
          const d = arg(2);
          this.checkFieldDefinition(arg(0), arg(1), d);
          const code = `jsDefineProperty(${definedOn(arg(0))}, ${this.propertyKey(arg(1))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' || ts.isExpressionStatement(e.parent) ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'assign') {
          // The target is an open JavaScript object: a literal there is untyped, so the sources' keys all land.
          const target = ts.isObjectLiteralExpression(arg(0)) ? this.dynamicObject(arg(0) as ts.ObjectLiteralExpression) : this.restArgument(e, arg(0), 'Any?');
          const sources = e.arguments.slice(1);
          const code = sources.some(ts.isSpreadElement)
            ? `jsAssign(${target}, *${this.packed(sources, 'JSArray<Any?>')}.storage.toTypedArray())`
            : `jsAssign(${[target, ...sources.map((x) => this.coerce(x, 'Any?'))].join(', ')})`;
          return T() === 'Any?' || ts.isExpressionStatement(e.parent) ? code : this.fromAnyCode(code, T(), true);
        }
        if (method === 'hasOwn') return `jsHasOwn(${this.restArgument(e, arg(0), 'Any?')}, ${this.propertyKey(arg(1))})`;
        if (method === 'is') return `jsSameValue(${this.restArgument(e, arg(0), 'Any?')}, ${this.restArgument(e, arg(1), 'Any?')})`;
        if (method === 'getPrototypeOf') return `jsGetPrototypeOf(${this.restArgument(e, arg(0), 'Any?')})`;
        if (method === 'defineProperties') {
          const d = arg(1);
          if (!ts.isObjectLiteralExpression(d)) this.checkFieldDefinition(arg(0), undefined, d);
          else for (const p of d.properties) this.checkFieldDefinition(arg(0), ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name) ? p.name : undefined, ts.isPropertyAssignment(p) ? p.initializer : p);
          const code = `jsDefineProperties(${definedOn(arg(0))}, ${ts.isObjectLiteralExpression(d) ? this.dynamicObject(d) : this.coerce(d, 'Any?')})`;
          return T() === 'Any?' || ts.isExpressionStatement(e.parent) ? code : this.fromAnyCode(code, T(), true);
        }
        break;
      }
      case 'Array':
        if (method === 'create') {
          const native = this.native?.call(e);
          if (native) return native;
        }
        if (method === 'isArray') return `JSArray.isArray(${this.restArgument(e, arg(0), 'Any?')})`;
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
          const made = `jsArrayConstruct(${this.restArgument(e, arg(1), 'JSArray<Any?>')}.storage)`;
          return T() === 'JSArray<Any?>' ? made : this.fromAny(made, T());
        }
        break;
      case 'Number':
        if (method === 'isInteger') return `jsIsInteger(${this.toNumber(arg(0))})`;
        if (method === 'isSafeInteger') return `jsIsSafeInteger(${this.toNumber(arg(0))})`;
        if (method === 'isFinite') return `jsIsFinite(${this.toNumber(arg(0))})`;
        if (method === 'isNaN') return this.nanTest(arg(0));
        if (method === 'parseFloat') return `jsParseFloat(${this.expr(arg(0))})`;
        if (method === 'parseInt') return `jsParseInt(${this.expr(arg(0))}${arg(1) ? `, ${this.toNumber(arg(1))}` : ''})`;
        break;
      case 'String':
        if (method === 'fromCharCode' && e.arguments.some(ts.isSpreadElement)) return `jsFromCharCodeList(${this.packed(e.arguments, 'JSArray<Double>')})`;
        if (method === 'fromCharCode') return `jsFromCharCode(${a().join(', ')})`;
        if (method === 'fromCodePoint') return `jsFromCodePoint(${a().join(', ')})`;
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
      case 'Map': if (method === 'groupBy') return `jsMapGroupBy(${this.iterable(arg(0))}, ${this.fn(arg(1), this.groupKeySlot(arg(0), arg(1), T().replace(/^JSMap<(.*), JSArray<.*>>\??$/, '$1')))})`; break;
      case 'Promise': {
        const t = T();
        if (method === 'withResolvers') return `${t}()`;
        const v = t.replace(/^JSPromise<(.*)>$/, '$1');
        if (method === 'resolve') return arg(0) ? (this.isPromiseType(this.typeOf(arg(0))) ? this.expr(arg(0)) : `JSPromise.resolve<${v}>(${this.restArgument(e, arg(0), v)})`) : `JSPromise.resolve<Unit>(Unit)`;
        if (method === 'reject') return `JSPromise.reject<${v}>(${arg(0) ? this.restArgument(e, arg(0), 'Any?') : 'null'})`;
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
            if (ts.isShorthandPropertyAssignment(q)) given.set(q.name.text, this.shorthandValue(q.name));
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
      const read = t in undefinedValue ? `((value as? ${t}) ?: ${undefinedValue[t]})` : `(value as ${t})`;
      const call = !first ? `{ _ -> (${closure})() }` : t === 'Any?' ? closure : t.endsWith('?') ? `{ value -> (${closure})(value as? ${t.slice(0, -1)}) }` : `{ value -> (${closure})(${read}) }`;
      settings.push(`closeCallback = ${call}`);
    }
    const args = info.props.map((p) => `${ident(p)} = ${given.get(p) ?? 'null'}`).join(', ');
    return `Modal.show(${settings.join(', ')}) { ${component}(${args}).render() }`;
  }

  private math(name: string, e: ts.CallExpression): string {
    if ((name === 'max' || name === 'min') && e.arguments.some(ts.isSpreadElement)) return `jsMath${name === 'max' ? 'Max' : 'Min'}Of(${this.packed(e.arguments, 'JSArray<Double>')})`;
    const a = e.arguments.map((x) => (this.typeOf(x) === 'Any?' ? this.toNumber(x) : this.coerce(x, 'Double')));
    const one = MATH_UNARY;
    if (one[name]) return `${one[name]}(${a[0]})`;
    switch (name) {
      case 'pow': return `jsPow(${a[0]}, ${a[1]})`;
      case 'atan2': return `Math.atan2(${a[0]}, ${a[1]})`;
      case 'imul': return `jsImul(${a[0] ?? 'Double.NaN'}, ${a[1] ?? 'Double.NaN'})`;
      case 'hypot': return `jsHypot(${a.join(', ')})`;
      case 'min': return `jsMathMin(${a.join(', ')})`;
      case 'max': return `jsMathMax(${a.join(', ')})`;
      case 'random': return 'Math.random()';
    }
    throw this.error(e, `Math.${name}`);
  }

  /** A function argument for a library method: a closure literal typed for its slot, or a function value. */
  private fn(e: ts.Expression, slot?: string): string {
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.library && slot ? this.coerce(e, slot) : this.closure(e, slot);
    // `filter(Boolean)`: truthiness.
    if (ts.isIdentifier(e) && e.text === 'Boolean' && this.isLibGlobal(e) && slot) return `{ __v: ${functionTypeParts(slot)?.params[0] ?? 'Any?'} -> jsTruthy(__v) }`;
    // Library mode: a function value of another signature than the slot's (a callback taking the index and array too): adapted.
    if (this.library && slot) return this.coerce(e, slot);
    // A function held untyped (an untyped `done` parameter): callable as the slot's function.
    if (slot && this.isAny(e)) return this.fromAny(this.expr(e), slot);
    // A function of a rest parameter (`promise.then(log)`): what the slot passes, packed.
    if (slot && ts.isIdentifier(e) && this.resolve(e)?.declarations?.some((d) => ts.isFunctionDeclaration(d) && !!d.body && d.parameters.length === 1 && !!d.parameters[0].dotDotDotToken)) return this.coerce(e, slot);
    // A function of fewer parameters than the slot passes (`promise.then(next)`, `next()` taking none): adapted.
    const fewer = slot && ts.isIdentifier(e) ? this.resolve(e)?.declarations?.find((d): d is ts.FunctionDeclaration => ts.isFunctionDeclaration(d) && !!d.body) : undefined;
    if (fewer && fewer.parameters.length < (functionTypeParts(slot!)?.params.length ?? 0)) return this.functionRefAdapter(e, slot!) ?? this.functionValue(e);
    return this.functionValue(e);
  }

  private arrayMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const typedCallback = !this.library ? this.unset.typedCallback(e) : undefined;
    if (typedCallback) throw this.error(typedCallback, 'a function whose element parameter is declared to hold no undefined, given strings a pattern\'s unset group may leave undefined (declare the parameter `string | undefined`)');
    const t = `${this.expr(target)}${q}`;
    const a = () => this.args(e);
    const el = this.typeOf(target).replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1').replace(/^(Pair|Triple)<.*>$/, 'Any?');
    const elOf = () => (this.subst.has(target) ? (/^JSArray<(.*)>\(/.exec(this.subst.get(target)!)?.[1] ?? el) : el);
    const element = elOf();
    switch (name) {
      case 'push': case 'unshift':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.${name}All(${this.packed(e.arguments, `JSArray<${element}>`, this.elementSlot(e, element))})`;
        return `${t}.${name}(${e.arguments.map((x) => this.elementArgument(e, x, element)).join(', ')})`;
      case 'pop': case 'shift': case 'reverse': case 'keys': case 'entries': case 'values': return `${t}.${name}()`;
      case 'toLocaleString': if (!e.arguments.length) return `${t}.toLocaleString()`; break;
      case 'toString': return `${t}.join()`;
      case 'flat': return e.arguments.length || !/^JSArray<JSArray</.test(this.typeOf(target)) ? `${t}.flatAny(${e.arguments[0] ? this.toNumber(e.arguments[0]) : ''})` : `${t}.flat()`;
      case 'splice': {
        if (e.arguments.slice(2).some(ts.isSpreadElement)) return `${t}.spliceAll(${e.arguments.slice(0, 2).map((x) => this.toNumber(x)).join(', ')}, ${this.packed(e.arguments.slice(2), `JSArray<${element}>`, this.elementSlot(e, element))}.storage)`;
        const parts = [...e.arguments.slice(0, 2).map((x) => this.toNumber(x)), ...e.arguments.slice(2).map((x) => this.elementArgument(e, x, element))];
        return `${t}.splice(${parts.join(', ')})`;
      }
      case 'fill': return `${t}.fill(${[this.elementArgument(e, e.arguments[0], element), ...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'slice': case 'at': return `${t}.${name}(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
      case 'indexOf': case 'lastIndexOf': case 'includes': return `${t}.${name}(${[this.restArgument(e, e.arguments[0], element.startsWith('JSNullish<') ? element : optionalType(element)),...e.arguments.slice(1).map((x) => this.toNumber(x))].join(', ')})`;
      case 'join': return `${t}.join(${e.arguments[0] ? (this.library ? this.str(e.arguments[0]) : this.expr(e.arguments[0])) : ''})`;
      case 'concat':
        // Arrays spread as arguments are concatenated, which the runtime tells apart from elements as script does.
        if (e.arguments.some((x) => ts.isSpreadElement(x) && spreadsArrays(x.expression, this.checker))) return `${t}.concatSpread(${this.unchecked(`List<${element}>`, `${this.packed(e.arguments, 'JSArray<Any?>', this.restSlot(e, 'Any?'))}.storage`)})`;
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.concatSpread(${this.packed(e.arguments, `JSArray<${element}>`, this.restSlot(e, element))}.storage)`;
        return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.restArgument(e, x, `JSArray<${element}>`) : `jsArrayOf<${element}>(${this.restArgument(e, x, element)})`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap': {
        const f = e.arguments[0];
        const arity = ts.isArrowFunction(f) || ts.isFunctionExpression(f) ? Math.max(1, f.parameters.length) : this.functionArity(f);
        // Library mode: map's result is the element type the call gives, so a function value can be adapted to it.
        // So is `map<U>(…)`'s, whose U the callback's results are held as.
        const mapped = name === 'map' && ((this.library && !(ts.isArrowFunction(f) || ts.isFunctionExpression(f))) || !!e.typeArguments?.length) ? this.typeOf(e).replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1') : null;
        // A literal declaring no parameters still takes the element: the runtime's overloads start at one.
        const bare = (ts.isArrowFunction(f) || ts.isFunctionExpression(f)) && !f.parameters.length ? this.returnTypeOf(f) : null;
        const ret = name === 'forEach' ? 'Unit' : ['map', 'flatMap'].includes(name) ? mapped ?? bare : 'Boolean';
        const slot = ret ? `(${[element, 'Double', `JSArray<${element}>`].slice(0, Math.min(3, arity)).join(', ')}) -> ${ret}` : undefined;
        const code = this.ignoringThisArg(e, target, `${t}.${name}(${this.fn(f, slot)})`);
        // A type-guard filter or find (`(s): s is Circle => …`): its elements as the guard narrows them.
        const own = this.typeOf(e);
        if (name === 'filter' && /^JSArray<\w+>$/.test(own) && own !== `JSArray<${element}>`) return cast(code, own);
        if (name === 'find' && /^\w+\??$/.test(own) && own.replace(/\?$/, '') !== element.replace(/\?$/, '') && own !== 'Any?' && !element.startsWith('JSNullish<')) return `(${code} as ${own.endsWith('?') ? own : own + '?'})`;
        return code;
      }
      case 'sort': return e.arguments[0] ? `${t}.sort(${this.fn(e.arguments[0], `(${element}, ${element}) -> Double`)})` : `${t}.sort()`;
      case 'toSorted': return e.arguments[0] ? `${t}.toSorted(${this.fn(e.arguments[0], `(${element}, ${element}) -> Double`)})` : `${t}.toSorted()`;
      case 'toReversed': return `${t}.toReversed()`;
      case 'toSpliced': {
        if (!e.arguments.length) return `${t}.toSpliced(0.0, 0.0)`;
        if (e.arguments.slice(2).some(ts.isSpreadElement)) return `${t}.toSplicedAll(${e.arguments.slice(0, 2).map((x) => this.toNumber(x)).join(', ')}, ${this.packed(e.arguments.slice(2), `JSArray<${element}>`, this.restSlot(e, element))}.storage)`;
        return `${t}.toSpliced(${[...e.arguments.slice(0, 2).map((x) => this.toNumber(x)), ...e.arguments.slice(2).map((x) => this.restArgument(e, x, element))].join(', ')})`;
      }
      case 'with': return `${t}.with(${this.toNumber(e.arguments[0])}, ${this.restArgument(e, e.arguments[1], element)})`;
      case 'reduce': case 'reduceRight': {
        const init = e.arguments[1];
        const f = e.arguments[0];
        const literal = ts.isArrowFunction(f) || ts.isFunctionExpression(f);
        const arity = literal ? f.parameters.length : this.library ? functionTypeParts(this.typeOf(f).replace(/^\((.*)\)\?$/, '$1'))?.params.length ?? 2 : 2;
        const types = (acc: string) => [acc, element, 'Double', `JSArray<${element}>`].slice(0, Math.max(2, Math.min(literal ? 3 : 4, arity)));
        if (init) {
          const acc = this.typeOf(e);
          return `${t}.${name}(${this.fn(f, `(${types(acc).join(', ')}) -> ${acc}`)}, ${this.coerce(init, acc)})`;
        }
        return `${t}.${name}(${this.fn(f, `(${this.library ? types(element).join(', ') : `${element}, ${element}`}) -> ${element}`)})`;
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

  private stringMethod(name: string, target: ts.Expression, e: ts.CallExpression, receiver?: string): string {
    const t = receiver ?? this.expr(target);
    const first = e.arguments[0];
    const unsupported = unsupportedPattern(name, e, this.checker);
    if (unsupported) throw this.error(first, unsupported);
    const asserted = !!first && name !== 'matchAll' && assertedPattern(first, this.checker);
    if (first && this.typeOf(first) === 'JSRegExp' && !asserted) return this.regexpStringMethod(name, t, e);
    const s = (k: number) => this.str(e.arguments[k]);
    const untyped = !first ? undefined : asserted ? this.assertedPatternValue(first) : this.isAny(first) ? this.expr(first) : undefined;
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
      case 'split': {
        const call = untyped ? `jsSplitUntyped(${t}, ${untyped}${opt(1)})` : `jsSplit(${t}, ${first ? s(0) : 'null'}${opt(1)})`;
        return this.unsetGroups(e) ? this.unchecked('JSArray<String?>', call) : call;
      }
      case 'indexOf': return `jsIndexOf(${t}, ${s(0)}${opt(1)})`;
      case 'lastIndexOf': return `jsLastIndexOf(${t}, ${s(0)}${opt(1)})`;
      case 'slice': return `jsSlice(${t}${e.arguments.map((_, k) => `, ${n(k)}`).join('')})`;
      case 'substring': return `jsSubstring(${t}, ${first ? n(0) : '0.0'}${opt(1)})`;
      case 'substr': return `jsSubstr(${t}, ${first ? n(0) : '0.0'}${opt(1)})`;
      case 'match': return `jsMatch(${t}, jsRegExpFrom(${untyped ?? (first ? this.coerce(first, 'Any?') : 'null')}))`;
      case 'replace': return untyped ? `jsReplaceUntyped(${t}, ${untyped}, ${s(1)})` : `jsReplace(${t}, ${s(0)}, ${s(1)})`;
      case 'replaceAll': return untyped ? `jsReplaceAllUntyped(${t}, ${untyped}, ${s(1)})` : `jsReplaceAll(${t}, ${s(0)}, ${s(1)})`;
      case 'charAt': return `jsCharAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'charCodeAt': return `jsCharCodeAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'codePointAt': return `jsCodePointAt(${t}, ${first ? n(0) : '0.0'})`;
      case 'at': return `jsStringAt(${t}, ${n(0)})`;
      case 'repeat': return `jsRepeat(${t}, ${n(0)})`;
      case 'padStart': return `jsPadStart(${t}, ${n(0)}${e.arguments[1] ? `, ${s(1)}` : ''})`;
      case 'padEnd': return `jsPadEnd(${t}, ${n(0)}${e.arguments[1] ? `, ${s(1)}` : ''})`;
      case 'concat': return `(${[t, ...e.arguments.map((x) => this.str(x))].join(' + ')})`;
      case 'localeCompare': return e.arguments.length > 1 ? `jsLocaleCompare(${[t, s(0), ...e.arguments.slice(1).map((x) => this.coerce(x, 'Any?'))].join(', ')})` : `jsLocaleCompare(${t}, ${s(0)})`;
      // A string searches as `new RegExp(x)` does.
      case 'search': return untyped ? `jsSearch(${t}, jsRegExpFrom(${untyped}))` : `jsSearch(${t}, JSRegExp(${e.arguments[0] ? s(0) : '"(?:)"'}))`;
      case 'toString': case 'valueOf': return t;
    }
    throw this.error(e, `String.${name}`);
  }

  /** A pattern an assertion from untyped gives (`assertedPattern`), as its untyped value. */
  private assertedPatternValue(x: ts.Expression): string {
    x = ts.skipParentheses(x);
    if (ts.isConditionalExpression(x)) return `(if (${this.cond(x.condition)}) ${this.assertedPatternValue(x.whenTrue)} else ${this.assertedPatternValue(x.whenFalse)})`;
    if ((ts.isAsExpression(x) || ts.isTypeAssertionExpression(x)) && this.checker.getTypeAtLocation(x.expression).flags & ts.TypeFlags.Any) return this.expr(x.expression);
    return this.coerce(x, 'Any?');
  }

  private regexpStringMethod(name: string, s: string, e: ts.CallExpression): string {
    const [re, second] = e.arguments;
    const r = this.expr(re);
    switch (name) {
      case 'match': return `jsMatch(${s}, ${r})`;
      case 'matchAll': return `jsMatchAll(${s}, ${r})`;
      case 'search': return `jsSearch(${s}, ${r})`;
      case 'split': {
        const call = `jsSplit(${s}, ${r}${second ? `, ${this.toNumber(second)}` : ''})`;
        return this.unsetGroups(e) ? this.unchecked('JSArray<String?>', call) : call;
      }
      case 'replace': case 'replaceAll': {
        const fn = name === 'replace' ? 'jsReplace' : 'jsReplaceAll';
        // A function value: called with the match, each group (undefined where it took no part), the match's index and the string.
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second)) && this.checker.getTypeAtLocation(second).getCallSignatures().length) {
          if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
          // A rest parameter takes the arguments from its position on, which a call by script cannot give it.
          const decl = this.checker.getTypeAtLocation(second).getCallSignatures()[0]?.getDeclaration();
          const restAt = decl && !ts.isJSDocSignature(decl) ? decl.parameters.findIndex((p) => p.dotDotDotToken) : -1;
          const branched = ts.isConditionalExpression(ts.skipOuterExpressions(second));
          if (decl && !ts.isJSDocSignature(decl) && !branched && restAt >= 0 && restAt === decl.parameters.length - 1) {
            const args = decl.parameters.map((p, k) => {
              if (k < restAt) return this.fromAnyCode(pure(`__m.replacerArguments.getOrNull(${k})`), this.paramType(p), true);
              const rest = `JSArray<Any?>(ArrayList(__m.replacerArguments.drop(${k})))`, t = this.typeOf(p.name);
              return t === 'JSArray<Any?>' ? rest : this.fromAnyCode(rest, t, true);
            });
            return `${fn}(${s}, ${r}, fun(__m: JSMatch): String = jsToString((${this.functionValue(second)})(${args.join(', ')})))`;
          }
          const callee = !this.library && branched ? this.coerce(second, 'Any?') : this.functionValue(second);
          return `${fn}(${s}, ${r}, fun(__m: JSMatch): String = jsToString(jsCall(${callee}, *__m.replacerArguments.toTypedArray())))`;
        }
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second))) return `${fn}(${s}, ${r}, ${this.str(second)})`;
        if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
        // The replacer gets the match, then each group, then the offset.
        const m = this.fresh('__match');
        // The match, each group (undefined where it took no part), the index, the input, then the groups object.
        const source = literalPattern(re, this.checker);
        const groups = source === null ? null : patternGroups(source);
        const binds = second.parameters.map((p, k) => {
          const name = ident((p.name as ts.Identifier).text), t = this.typeOf(p.name);
          const bind = (code: string) => `val ${name}: ${t} = ${code}`;
          if (p.dotDotDotToken) {
            const rest = `JSArray<Any?>(ArrayList(${m}.replacerArguments.drop(${k})))`;
            return bind(t === 'JSArray<Any?>' ? rest : this.fromAnyCode(rest, t, true));
          }
          const group = (code: string) => (t.endsWith('?') ? code : `(${code} ?: "undefined")`);
          if (k === 0 || (groups && k <= groups.count)) return bind(group(`${m}[${k}]`));
          if (groups && k === groups.count + 1) return bind(t.replace(/\?$/, '') === 'Double' ? `${m}.index` : this.fromAnyCode(`${m}.index`, t, true));
          if (groups && k === groups.count + 2) return bind(t.replace(/\?$/, '') === 'String' ? `${m}.input` : this.fromAnyCode(`${m}.input`, t, true));
          return bind(this.fromAnyCode(pure(`${m}.replacerArguments.getOrNull(${k})`), t, true));
        });
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
      case 'toLocaleString': return `jsNumberToLocaleString(${[t, ...e.arguments.map((x) => this.restArgument(e, x, 'Any?'))].join(', ')})`;
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

  /** A handler's promise result: nullable where the handler may give undefined instead (`n > 0 ? promise : undefined`). */
  private adoptedResult(handlers: (ts.Expression | undefined)[], result: string): string {
    const maybeUndefined = handlers.some((h) => {
      const sig = h && this.checker.getTypeAtLocation(h).getCallSignatures()[0];
      return !!sig && this.isPromiseType(this.type(sig.getReturnType(), h)) && isNullable(this.type(sig.getReturnType(), h));
    });
    return `JSPromise<${result}>${maybeUndefined ? '?' : ''}`;
  }

  /** A rejection handler: it takes the reason untyped, whatever its parameter declares. */
  private rejectionHandler(e: ts.Expression, ret?: string): string {
    if (!(ts.isArrowFunction(e) || ts.isFunctionExpression(e))) return this.isAny(e) ? this.fn(e, `(Any?) -> ${ret ?? 'Any?'}`) : this.fn(e);
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
    // A promise of an optional chain (`this.hud?.animate(…).catch(…)`): the chain's undefined passes through.
    const t = `${this.expr(target)}${this.typeOf(target).endsWith('?') ? '?' : ''}`;
    const [f, g] = e.arguments;
    const value = this.typeOf(target).replace(/^JSPromise<(.*)>\??$/, '$1');
    const result = this.typeOf(e).replace(/^JSPromise<(.*)>\??$/, '$1');
    switch (name) {
      case 'then': {
        const adopt = (f && this.returnsPromise(f)) || (g && this.returnsPromise(g));
        const ret = adopt ? this.adoptedResult([f, g], result) : result;
        const onF = f && this.fn(f, `(${value}) -> ${ret}`);
        return `${t}.${adopt ? 'thenAdopt' : 'then'}<${result}>(${[onF, g && this.rejectionHandler(g, ret)].filter(Boolean).join(', ')})`;
      }
      case 'catch': {
        const adopt = this.returnsPromise(f);
        if (result === value) return `${t}.${adopt ? 'catchAdopt' : 'catch'}(${this.rejectionHandler(f, adopt ? this.adoptedResult([f], result) : result)})`;
        if (result === 'Any?' && !adopt) return `${t}.catchAny(${this.rejectionHandler(f, 'Any?')})`;
        const pass = `{ __value: ${value} -> ${adopt ? `JSPromise.resolve<${result}>(__value)` : '__value'} }`;
        return `${t}.${adopt ? 'thenAdopt' : 'then'}<${result}>(${pass}, ${this.rejectionHandler(f, adopt ? this.adoptedResult([f], result) : result)})`;
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
    // Library mode: a value or key that may be null where the collection's type says not (`cache.set(key, null)`), stored as script stores it.
    const given = (n: number, as: string) => (elementStoreOf(this.checker, e.arguments[n]) ? this.elementArgument(e, e.arguments[n], as) : this.restArgument(e, e.arguments[n], as));
    const arg = (n: number, as: string) => this.library && this.isObjectType(as) && !isNullable(as) && !['String', 'Double', 'Boolean'].includes(as) && !isFunctionType(as)
      && (isNullable(this.declaredTypeOf(e.arguments[n]) ?? this.typeOf(e.arguments[n])) || !!this.maybeUndefined(e.arguments[n]))
      ? this.unchecked(as, given(n, optionalType(as))) : given(n, as);
    switch (name) {
      case 'get': {
        const key = arg(0, k);
        const read = this.marked(`${t}.get(${key})`, { op: 'entry', of: this.valueOf(t), key: this.valueOf(key) });
        const rt = this.typeOf(e);
        return rt.endsWith('?') || rt === 'Any?' || this.optionalReads.has(e) ? read : this.undefinedAs(read, rt);
      }
      case 'has': case 'delete': return `${t}.${name}(${arg(0, k)})`;
      case 'set': return `${t}.set(${arg(0, k)}, ${arg(1, v)})`;
      case 'add': return `${t}.add(${arg(0, k)})`;
      case 'clear': case 'keys': case 'values': case 'entries': return `${t}.${name}()`;
      case 'forEach': {
        const f = e.arguments[0];
        const types = v ? [v, k] : [k, k];
        // The collection itself, third, where the callback names it.
        if ((ts.isArrowFunction(f) || ts.isFunctionExpression(f)) && f.parameters.length > 2) types.push(type);
        return `${t}.forEach(${this.fn(f, `(${types.join(', ')}) -> Unit`)})`;
      }
    }
    throw this.error(e, `${type.startsWith('JSMap') ? 'Map' : 'Set'}.${name}`);
  }

  /** `new ArrayBuffer(n)`, `new Uint8Array(…)`, `new DataView(buffer, …)`: the runtime's of each, by what the first argument is. */
  private newBuffer(name: string, args: readonly ts.Expression[]): string {
    const t = `JS${name}`;
    const [a, ...rest] = args;
    const numbers = rest.map((x) => this.toNumber(x));
    if (!a) return `${t}()`;
    const at = this.typeOf(a).replace(/\?$/, '');
    if (name === 'ArrayBuffer') return `${t}(${this.toNumber(a)})`;
    if (at === 'JSArrayBuffer') return `${t}(${[this.expr(a), ...numbers].join(', ')})`;
    if (name === 'DataView') return `${t}((${this.coerce(a, 'Any?')} as JSArrayBufferView).buffer, ${numbers.join(', ')})`;
    if (at === 'Double') return `${t}(${this.expr(a)})`;
    if (at.startsWith('JSArray<')) return `${t}(${this.expr(a)})`;
    return `${t}.from(${this.coerce(a, 'Any?')})`;
  }

  /** Library mode: `new (class extends View { createNativeView() { … } })()`, its methods overriding the base's: a Kotlin object. */
  private classExpressionObject(cls: ts.ClassExpression): string {
    const base = this.baseClassOf(cls);
    if (!base || cls.members.some((m) => !ts.isMethodDeclaration(m) || !m.body || isStatic(m))) throw this.error(cls, 'a class expression other than one overriding methods of a class the program declares');
    const members = (cls.members as ts.NodeArray<ts.MethodDeclaration>).map((m) => {
      const n = m.name.getText();
      const root = this.inheritedMethod(cls, n) && this.rootMethod(m);
      if (!root || root === m) return '    ' + this.func(m, this.methodIdent(n), 'open ');
      if (root.parameters.length !== m.parameters.length || root.parameters.some((p, k) => this.paramType(p) !== this.paramType(m.parameters[k])) || this.returnTypeOf(root) !== this.returnTypeOf(m)) return this.appOverride(m, root);
      return '    ' + this.func(m, this.methodIdent(n), 'override ');
    });
    return `object : ${this.className(base)}() {\n${members.join('\n')}\n}`;
  }

  /** `new URL('./x.worker', import.meta.url)`: the worker script it names, when the app compiled it. */
  private workerScript(e: ts.Expression): string | null {
    if (!ts.isNewExpression(e) || !ts.isIdentifier(e.expression) || e.expression.text !== 'URL') return null;
    const [spec, base] = e.arguments ?? [];
    if (!spec || !ts.isStringLiteralLike(spec) || !base || base.getText() !== 'import.meta.url') return null;
    const stem = pathResolve(pathDirname(e.getSourceFile().fileName), spec.text).replace(/\.(ts|js)$/, '');
    for (const f of [stem + '.ts', stem + '.android.ts', stem + '/index.ts']) {
      const script = this.workerScripts?.get(f);
      if (script) return script;
    }
    return null;
  }

  /**
   * A function literal stored where untyped code calls it (`global.onmessage = (m: Msg) => …`): jsCall passes
   * JavaScript values, so typed parameters are converted from them inside.
   */
  private untypedCallable(e: ts.Expression): string {
    let f = e;
    while (ts.isParenthesizedExpression(f)) f = f.expression;
    // A function declaring `this` is a JSMethod already, which takes its receiver and arguments as given.
    if (!(ts.isArrowFunction(f) || ts.isFunctionExpression(f)) || f.parameters.some((p, k) => !ts.isIdentifier(p.name) || (p.dotDotDotToken && k < f.parameters.length - 1) || p.name.text === 'this')) return this.coerce(e, 'Any?');
    const types = f.parameters.map((p) => this.typeOf(p.name));
    // A rest parameter takes every argument from its position on, which a fixed-arity lambda cannot.
    if (f.parameters.at(-1)?.dotDotDotToken) {
      const k = f.parameters.length - 1;
      const args = types.map((t, i) => (i < k ? this.fromAny(pure(`__a.getOrNull(${i})`), t) : this.fromAny(`JSArray<Any?>(__a.drop(${k}))`, t)));
      return `run { val __f = ${this.closure(f)}; jsFunction(${k}) { __a -> __f(${args.join(', ')}) } }`;
    }
    if (types.every((t) => t === 'Any?')) return this.coerce(e, 'Any?');
    const names = types.map((_, k) => pure(`__a${k}`));
    return `run { val __f = ${this.closure(f)}; { ${names.map((n) => `${n}: Any?`).join(', ')} -> __f(${types.map((t, k) => this.fromAny(names[k], t)).join(', ')}) } }`;
  }

  /** `<T>x` where T is a subclass of x's own class, neither of them native: what JavaScript may hold there is not always a T. */
  private isClassDowncast(e: ts.AsExpression | ts.TypeAssertion | ts.SatisfiesExpression): boolean {
    if (ts.isSatisfiesExpression(e)) return false;
    const to = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e));
    const from = this.checker.getNonNullableType(this.checker.getTypeAtLocation(e.expression));
    const isClass = (t: ts.Type) => !!(t.getSymbol()?.flags & ts.SymbolFlags.Class) && !this.native?.type(t);
    return to !== from && isClass(to) && isClass(from) && this.checker.isTypeAssignableTo(to, from) && !this.checker.isTypeAssignableTo(from, to);
  }

  /** Library mode: an argument to a local function literal (`const matcher = (v: T) => …; matcher(<T>x)`), whose parameters are nullable there. */
  private functionLiteralArgument(e: ts.Expression): boolean {
    let arg: ts.Node = e;
    while (ts.isParenthesizedExpression(arg.parent)) arg = arg.parent;
    const call = arg.parent;
    if (!ts.isCallExpression(call) || !call.arguments.includes(arg as ts.Expression) || !ts.isIdentifier(call.expression)) return false;
    const d = this.resolve(call.expression)?.valueDeclaration;
    return !!d && this.literalFunctionLocal(d);
  }

  private literalFunctionLocal(d: ts.Declaration): d is ts.VariableDeclaration {
    if (!this.library || !ts.isVariableDeclaration(d) || d.type || !d.initializer || this.forwardDeclared.has(d) || !(ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const)) return false;
    let init = d.initializer;
    while (ts.isParenthesizedExpression(init)) init = init.expression;
    if (!ts.isArrowFunction(init) && !ts.isFunctionExpression(init)) return false;
    const sym = this.checker.getSymbolAtLocation(d.name);
    const refers = (n: ts.Node): boolean => (ts.isIdentifier(n) && this.checker.getSymbolAtLocation(n) === sym) || !!ts.forEachChild(n, refers);
    return !refers(init);
  }

  private isRegExp(e: ts.Expression): boolean {
    return this.typeOf(e).replace(/\?$/, '') === 'JSRegExp';
  }

  /** `new RegExp(…)`: from a pattern, or a copy of an expression with its flags unless others are given. */
  private regExpConstruct(args: readonly ts.Expression[], call = false): string {
    if (args[0] && this.isRegExp(args[0])) return `${this.expr(args[0])}.let { __re -> JSRegExp(__re.source, ${args[1] ? this.str(args[1]) : '__re.flags'}) }`;
    if (args[0] && !this.isString(args[0])) return `jsRegExpConstruct(${[this.coerce(args[0], 'Any?'), ...(args[1] ? [this.coerce(args[1], 'Any?')] : []), ...(call ? ['call = true'] : [])].join(', ')})`;
    return `JSRegExp(${args[0] ? this.str(args[0]) : '"(?:)"'}${args[1] ? `, ${this.str(args[1])}` : ''})`;
  }

  private newExpr(e: ts.NewExpression): string {
    const t = this.typeOf(e);
    let callee = e.expression;
    while (ts.isParenthesizedExpression(callee)) callee = callee.expression;
    const name = ts.isIdentifier(callee) ? callee.text : '';
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (this.library && ts.isClassExpression(callee) && !args.length) return this.classExpressionObject(callee);
    if (name === 'Worker' && this.workerScripts && args.length) {
      const script = this.workerScript(args[0]);
      if (script) return `JSWorker(${this.coerce(args[0], 'Any?')}, ${kotlinString(script)})`;
    }
    if (BUFFER_TYPES.has(name) && this.resolve(callee)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return this.newBuffer(name, args);
    if (/^JS(Map|Set)</.test(t)) {
      if (!args.length) return `${t}()`;
      const src = args[0];
      if (ts.isArrayLiteralExpression(src) && t.startsWith('JSMap<')) {
        const [k, v] = splitTopLevel(/^JSMap<(.*)>$/.exec(t)![1]);
        return `${t}(listOf(${src.elements.map((x) => (ts.isArrayLiteralExpression(x) ? `Pair<${k}, ${v}>(${this.coerce(x.elements[0], k)}, ${this.coerce(x.elements[1], v)})` : this.expr(x))).join(', ')}))`;
      }
      // An untyped source: nothing for null or undefined, each value converted to the collection's types.
      if (this.typeOf(src) === 'Any?' && !this.library) {
        const set = /^JSSet<(.*)>$/.exec(t)?.[1];
        if (set) return `${t}(jsCollectionSource(${this.expr(src)})${set === 'Any?' ? '' : `.map { ${this.fromAnyCode('it', set, true)} }`})`;
        const [k, v] = splitTopLevel(/^JSMap<(.*)>$/.exec(t)![1]);
        return `${t}(jsMapEntries(${this.expr(src)})${k === 'Any?' && v === 'Any?' ? '' : `.map { Pair<${k}, ${v}>(${this.fromAnyCode('it.first', k, true)}, ${this.fromAnyCode('it.second', v, true)}) }`})`;
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
      if (res) { this.resolvers.set(this.resolve(res)!, { name: r, type: v }); binds.push(v === 'Unit' ? `val ${ident(res.text)}: (${v}) -> Unit = { _: Unit? -> ${r}.resolve(Unit) }` : `val ${ident(res.text)}: (${v}) -> Unit = { ${r}.resolve(it) }`); }
      if (rej) binds.push(`val ${ident(rej.text)}: (Any?) -> Unit = { ${r}.reject(it) }`);
      const label = this.fresh('executor');
      const body = this.functionBody(ex, 'Unit', this.indent, label);
      const inner = this.indent + '    ';
      // `resolve(x)` calls the resolvers directly: a binding only where the body takes the function itself.
      const used = binds.filter((b) => mentions(body, /^val (\S+):/.exec(b)![1]));
      const lines = body.slice(2, body.lastIndexOf('\n')).split('\n');
      if (lines.at(-1)?.replace(/^\/\*@ns:[^*]*\*\//, '') === `${inner}return@${label}`) lines.pop();
      const text = [...used.map((b) => inner + b), ...lines].join('\n');
      return `JSPromise<${v}> ${text.includes(`return@${label}`) ? `${label}@` : ''}{ ${r}: JSResolvers<${v}> ->\n${text}\n${this.indent}}`;
    }
    if (ERRORS[name]) {
      const appError = ts.isIdentifier(callee) && !this.isLibGlobal(callee) && !(this.resolve(callee)?.declarations ?? []).every((d) => isLibDeclaration(d));
      if (!appError) return this.errorValue(name, args);
    }
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      // An untyped value (a JSON field): a string parsed, anything else as its number, as the constructor tells them apart at run time.
      if (args.length === 1 && this.typeOf(args[0]) === 'Any?') return `jsNewDate(${this.expr(args[0])})`;
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    // `new String(x)`, `new Number(x)`, `new Boolean(x)`: script's wrapper objects, held as the value they wrap.
    if (this.library && ['String', 'Number', 'Boolean'].includes(name) && this.isLibGlobal(callee as ts.Identifier) && args.length === 1) return name === 'String' ? this.str(args[0]) : name === 'Number' ? this.toNumber(args[0]) : this.cond(args[0]);
    if (name === 'RegExp') return this.regExpConstruct(args);
    const intl = intlConstructor(callee, this.checker);
    if (intl) return `JS${intl}(${args.map((a) => this.coerce(a, 'Any?')).join(', ')})`;
    // `new Object()`: an empty object.
    if (name === 'Object' && this.isLibGlobal(callee as ts.Identifier) && !args.length) return 'JSObject()';
    if (name === 'WeakRef' && this.isLibGlobal(callee as ts.Identifier)) {
      const target = this.expr(args[0]);
      return `${t}(${this.library && (this.typeOf(args[0]) === 'Any?' || isNullable(this.declaredTypeOf(args[0]) ?? this.typeOf(args[0]))) ? `jsWeakRefTarget(${this.unasserted(target)})` : target})`;
    }
    if ((name === 'WeakMap' || name === 'WeakSet') && this.isLibGlobal(callee as ts.Identifier)) return args.length ? `${t}(${this.iterable(args[0])})` : `${t}()`;
    if (name === 'Array' && this.isLibGlobal(callee as ts.Identifier)) return this.arrayConstruct(e, t, args);
    const core = this.core?.construct(e) ?? this.native?.construct(e);
    if (core) return core;
    return this.newExprRest(e, t, callee, name, args);
  }

  /** `new Array(…)`, or `Array(…)`, which constructs the same. */
  private arrayConstruct(e: ts.NewExpression | ts.CallExpression, t: string, args: ts.NodeArray<ts.Expression>): string {
    {
      const el = t.replace(/^JSArray<(.*)>$/, '$1');
      if (args.length !== 1) return args.length ? `jsArrayOf<${el}>(${args.map((a) => this.coerce(a, el)).join(', ')})` : `${t}()`;
      if (this.typeOf(args[0]) !== 'Double') {
        // Lenient code: a length or the one element, as the value is when this runs.
        if (this.typeOf(args[0]) === 'Any?' && this.lenient && (el === 'Any?' || el.endsWith('?'))) return `run { val __n: Any? = ${this.expr(args[0])}; if (__n is Double) jsArrayFilled<${el}>(__n, null) else jsArrayOf<${el}>(__n as ${el}) }`;
        // A value TypeScript types as no number (a core interface Kotlin holds untyped): the one element.
        const declared = this.checker.getTypeAtLocation(args[0]);
        const element = !(declared.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NumberLike | ts.TypeFlags.TypeParameter)) && !(declared.isUnion() && declared.types.some((u) => u.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.Any)));
        if (this.typeOf(args[0]) === 'Any?' && !element && !(this.lenient && el !== 'Any?' && el !== 'Double')) throw this.error(e, 'new Array of one untyped value (a length or an element)');
        return `jsArrayOf<${el}>(${this.coerce(args[0], el)})`;
      }
      if (el.endsWith('?') || ['Double', 'String', 'Boolean'].includes(el)) return `jsArrayOfHoles<${el}>(${this.toNumber(args[0])})`;
      throw this.error(e, `new Array of a length, of ${el} (empty slots need an optional element type)`);
    }
  }

  private newExprRest(e: ts.NewExpression, t: string, callee: ts.Expression, name: string, args: ts.NodeArray<ts.Expression>): string {
    // `new Trace.Writer()`: a namespace's class.
    if (ts.isPropertyAccessExpression(callee) && this.namespaceMember(callee)) return `${t}(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t === 'Any?' && ts.isClassDeclaration(decl) ? this.className(decl) : t}(${this.args(e).join(', ')})`;
      // Library mode: a variable holding a class (`new ListViewAdapterClass(this)`): the class its instances have, else the one it holds when this runs.
      const held = this.resolve(callee)?.valueDeclaration;
      if (this.library && held && ts.isVariableDeclaration(held) && !held.getSourceFile().isDeclarationFile) {
        const made = this.checker.getTypeAtLocation(e).getSymbol()?.valueDeclaration;
        if (made && ts.isClassDeclaration(made) && !made.getSourceFile().isDeclarationFile && !this.native?.isNativeDeclaration(made)) return `${this.className(made)}(${this.args(e).join(', ')})`;
        const code = `jsNew(${this.expr(callee)}${this.untypedArgs(e)})`;
        return t === 'Any?' ? code : this.fromAnyCode(code, t);
      }
      // What script constructs untyped (a class looked up in a table).
      if (t === 'Any?' && (this.library || this.typeOf(callee) === 'Any?')) return `jsNew(${this.coerce(callee, 'Any?')}${this.untypedArgs(e)})`;
      // A variable a lazily defined class is assigned to (`PagerAdapter = PagerAdapterImpl as any` in `initPagerAdapter()`): that class.
      const lazy = !this.library && held && ts.isVariableDeclaration(held) ? this.assignedClass(held) : null;
      if (lazy) return `${this.className(lazy)}(${this.args(e).join(', ')})`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    // `new (initializeImpl())()`: the class a value of that class's type holds, once the value is computed.
    const made = this.checker.getTypeAtLocation(e).getSymbol()?.valueDeclaration;
    if (this.library && made && ts.isClassDeclaration(made) && !made.getSourceFile().isDeclarationFile && !hasModifier(made, ts.SyntaxKind.DeclareKeyword)) return `run { ${this.exprStatement(callee)}; ${t}(${this.args(e).join(', ')}) }`;
    // Library mode: `new (initNativeScriptLifecycleCallbacks())()`, the class the call gives, constructed when this runs; and
    // what any code constructs untyped (`new global.CanvasModule.Path2D()`).
    if (this.library || this.typeOf(callee) === 'Any?') {
      const code = `jsNew(${this.coerce(callee, 'Any?')}${this.untypedArgs(e)})`;
      return t === 'Any?' ? code : this.fromAnyCode(code, t);
    }
    throw this.error(e, 'new');
  }

  /** The one source class a module variable is ever assigned, as plugins define their Java subclasses lazily. */
  private assignedClass(d: ts.VariableDeclaration): ts.ClassDeclaration | null {
    if (!ts.isIdentifier(d.name) || d.initializer || !ts.isVariableDeclarationList(d.parent) || !ts.isVariableStatement(d.parent.parent) || !ts.isSourceFile(d.parent.parent.parent)) return null;
    const sym = this.checker.getSymbolAtLocation(d.name);
    const found = new Set<ts.ClassDeclaration>();
    let other = false;
    const visit = (n: ts.Node): void => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left) && this.checker.getSymbolAtLocation(n.left) === sym) {
        const decl = this.resolve(ts.skipOuterExpressions(n.right))?.valueDeclaration;
        if (decl && ts.isClassDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) found.add(decl); else other = true;
      }
      ts.forEachChild(n, visit);
    };
    visit(d.getSourceFile());
    return !other && found.size === 1 ? [...found][0] : null;
  }

  /** One of the library's error classes, constructed: an AggregateError takes its errors first. */
  private errorValue(name: string, args: readonly ts.Expression[]): string {
    return `${ERRORS[name]}(${this.errorArgs(name, args).join(', ')})`;
  }

  /** The runtime error class's constructor arguments for a library error class's (`new Error(…)`, `super(…)`). */
  private errorArgs(name: string, args: readonly ts.Expression[]): string[] {
    const [first, second] = name === 'AggregateError' ? [args[1], args[0]] : [args[0]];
    const errors = name === 'AggregateError' ? [second ? `JSArray<Any?>((${this.iterable(second)}).toList())` : 'JSArray<Any?>()'] : [];
    // An optional string parameter left out (`new Error(message)` of `message?: string`): no message, as undefined gives none.
    const param = first && ts.isIdentifier(first) ? this.resolve(first)?.valueDeclaration : undefined;
    const message = first && param && ts.isParameter(param) && /^String\??$/.test(this.typeOf(first)) && isNullable(this.paramType(param)) ? `(${this.expr(first)} ?: "")` : first ? this.str(first) : null;
    const cause = name === 'Error' && args[1] ? [`jsGetOptional(${this.coerce(args[1], 'Any?')}, "cause")`] : [];
    return [...errors, ...(message ? [message] : cause.length ? ['""'] : []), ...cause];
  }

  /**
   * `x instanceof C` where x's class decides it (C itself, or a class outside C's hierarchy): Kotlin calls such an `is`
   * always true or false, though an unset value (null) still fails it.
   */
  private decidedInstanceOf(e: ts.BinaryExpression): boolean {
    const own = this.typeOf(e.left);
    if (ERRORS[e.right.getText()] === own) return true;
    const sym = this.resolve(ts.isPropertyAccessExpression(e.right) ? e.right.name : e.right);
    const leftSym = this.checker.getTypeAtLocation(e.left).getSymbol();
    if (own === 'Any?' || own === 'Any' || !sym || !(sym.flags & ts.SymbolFlags.Class) || !leftSym || !(leftSym.flags & ts.SymbolFlags.Class)) return false;
    const left = this.checker.getTypeAtLocation(e.left), right = this.checker.getDeclaredTypeOfSymbol(sym);
    return this.checker.isTypeAssignableTo(left, right) || !this.checker.isTypeAssignableTo(right, left);
  }

  /** An expression that only reads: pure, or `typeof` and comparisons of such reads. */
  private readsOnly(e: ts.Expression): boolean {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isTypeOfExpression(e)) return ts.isIdentifier(e.expression);
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind)) return this.readsOnly(e.left) && this.readsOnly(e.right);
    return this.pure(e);
  }

  /** What `typeof x` gives where x's type decides it (`typeof size` of a number), or null. */
  private typeofConstant(e: ts.TypeOfExpression): string | null {
    if (neverDefined(e.expression, this.checker)) return 'undefined';
    const decls = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.declarations : undefined;
    if (decls?.length && decls.every((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return 'undefined';
    if (this.namesClass(e.expression)) return 'function';
    const param = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (param && ts.isParameter(param) && (this.typeTested(param) || this.untypedNarrowed(param))) return null;
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Unit') return 'undefined';
    const known = typeofName(base);
    if (t === 'Any?' || !known || t.endsWith('?') || this.heldNullable(e.expression, t)) return null;
    return this.maybeUndefined(e.expression) ? null : known;
  }

  /**
   * Library mode: a read the checker's types call present that Kotlin holds nullable, as unchecked code may leave it
   * undefined (an optional parameter, an unset `let enabled: boolean`, a boolean function that returns undefined).
   */
  private heldNullable(e: ts.Expression, t: string): boolean {
    if (!this.library) {
      const x = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
      if (this.lenientApp && ts.isIdentifier(x) && this.declaredTypeOf(x) === optionalType(t)) return true;
      const d = ts.isCallExpression(x) ? this.checker.getResolvedSignature(x)?.getDeclaration() : ts.isIdentifier(x) || ts.isPropertyAccessExpression(x) ? this.resolve(ts.isPropertyAccessExpression(x) ? x.name : x)?.valueDeclaration : undefined;
      return !!d && !ts.isJSDocSignature(d) && this.states.looseDeclaration(d);
    }
    if (ts.isIdentifier(e)) {
      if (this.declaredTypeOf(e) === optionalType(t)) return true;
      // A copy of such a call's result, which flow analysis may ask about before its declaration is translated.
      const d = this.resolve(e)?.valueDeclaration;
      return !!d && ts.isVariableDeclaration(d) && !!d.initializer && ts.isCallExpression(ts.skipOuterExpressions(d.initializer)) && this.heldNullable(ts.skipOuterExpressions(d.initializer), t);
    }
    if (!ts.isCallExpression(e)) return false;
    const d = this.checker.getResolvedSignature(e)?.getDeclaration();
    return !!d && !ts.isJSDocSignature(d) && this.nullablePrimitiveReturn(implementationOf(d) ?? d);
  }

  /**
   * The value a condition always has where the program's types decide it (`typeof size === 'number'` of a number,
   * a number or boolean compared with undefined, which Kotlin's never is), or undefined.
   */
  staticTruth(e: ts.Expression): boolean | undefined {
    const fixed = this.reach?.constant(e);
    if (fixed !== undefined) return fixed;
    const K = ts.SyntaxKind;
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (e.kind === K.TrueKeyword) return true;
    if (e.kind === K.FalseKeyword) return false;
    if (ts.isPrefixUnaryExpression(e) && e.operator === K.ExclamationToken) {
      const inner = this.staticTruth(e.operand);
      return inner === undefined ? undefined : !inner;
    }
    if (!ts.isBinaryExpression(e)) return undefined;
    const op = e.operatorToken.kind;
    if (op === K.AmpersandAmpersandToken || op === K.BarBarToken) {
      const l = this.staticTruth(e.left);
      if (l === (op === K.BarBarToken)) return l;
      if (l !== undefined) return this.staticTruth(e.right);
      // `typeof Reflect === 'object' && typeof Reflect.construct === 'function'` of an API Android lacks: the read alone decides nothing.
      const r = this.staticTruth(e.right);
      return r === (op === K.BarBarToken) && this.readsOnly(e.left) ? r : undefined;
    }
    if (![K.EqualsEqualsEqualsToken, K.ExclamationEqualsEqualsToken, K.EqualsEqualsToken, K.ExclamationEqualsToken].includes(op)) return undefined;
    const negate = op === K.ExclamationEqualsEqualsToken || op === K.ExclamationEqualsToken;
    const skip = (x: ts.Expression) => { while (ts.isParenthesizedExpression(x)) x = x.expression; return x; };
    const [a, b] = [skip(e.left), skip(e.right)];
    const typeofAgainst = (t: ts.Expression, lit: ts.Expression) => (ts.isTypeOfExpression(t) && ts.isStringLiteralLike(lit) ? this.typeofConstant(t) : null);
    const known = typeofAgainst(a, b) ?? typeofAgainst(b, a);
    if (known !== null) return (known === (ts.isStringLiteralLike(b) ? b.text : (a as ts.StringLiteral).text)) !== negate;
    const nullish = (x: ts.Expression) => x.kind === K.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    const operand = nullish(b) ? a : nullish(a) ? b : null;
    // A read that cannot throw (a variable, `this.x`) of a number or boolean Kotlin holds as one: never null.
    const plain = operand && (ts.isIdentifier(operand) || (ts.isPropertyAccessExpression(operand) && operand.expression.kind === K.ThisKeyword && !operand.questionDotToken));
    if (plain && ['Double', 'Boolean'].includes(this.typeOf(operand)) && ['Double', 'Boolean'].includes(this.declaredTypeOf(operand) ?? this.typeOf(operand)) && !this.maybeUndefined(operand)) return negate;
    return undefined;
  }

  private typeofExpr(e: ts.TypeOfExpression): string {
    if (neverDefined(e.expression, this.checker)) return '"undefined"';
    // An iOS API (`typeof NSDate`): undefined on Android, without the ReferenceError reading it throws.
    const decls = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.declarations : undefined;
    if (decls?.length && decls.every((d) => IOS_TYPINGS.test(d.getSourceFile().fileName))) return '"undefined"';
    if (this.namesClass(e.expression)) return '"function"';
    // A parameter callers give other values than its type (`typeTested`): what it holds, never its declared type's.
    const tested = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (tested && ts.isParameter(tested) && (this.typeTested(tested) || this.untypedNarrowed(tested))) return `jsTypeof(${ident((e.expression as ts.Identifier).text)})`;
    if (this.states.nullDistinct(e.expression)) return `jsTypeof(${this.observe(e.expression)})`;
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Unit') return '"undefined"';
    const known = typeofName(base);
    if (t === 'Any?' || !known) return `jsTypeof(${this.expr(e.expression)})`;
    // Code unchecked for null, or a parameter of a function script calls: undefined when left out, though read as its type.
    const param = ts.isIdentifier(e.expression) ? this.resolve(e.expression)?.valueDeclaration : undefined;
    if (param && ts.isParameter(param) && (this.library || this.lenient || this.lenientApp || this.states.scriptCalledParameter(param)) && !t.endsWith('?') && this.declaredTypeOf(e.expression as ts.Identifier) === optionalType(t)) return this.rawTypeof(e.expression);
    // A call whose result Kotlin holds nullable though its type says present: what it gives.
    const callee = ts.isCallExpression(e.expression) && !this.library ? this.checker.getResolvedSignature(e.expression)?.getDeclaration() : undefined;
    if (callee && !ts.isJSDocSignature(callee) && !callee.getSourceFile().isDeclarationFile && !t.endsWith('?') && this.returnTypeOf(callee) === optionalType(t)) return `jsTypeof(${this.expr(e.expression)})`;
    const maybe = this.maybeUndefined(e.expression);
    // A value that may be missing: the runtime's typeof, as a test before it may already prove it present.
    if (maybe) return `jsTypeof(${maybe})`;
    if (!t.endsWith('?') && this.heldNullable(e.expression, t)) return this.rawTypeof(e.expression);
    if (!t.endsWith('?') && this.states.missingObject(e.expression)) return `jsTypeof(${this.observe(e.expression, 'asIs')})`;
    return t.endsWith('?') ? `jsTypeof(${this.expr(e.expression)})` : kotlinString(known);
  }

  /**
   * Lenient code: a parameter Kotlin holds untyped (`val: string | string[]`) that the checker narrows to one type, which
   * unchecked for null leaves undefined possible (`Array.isArray(val)` false).
   */
  private untypedNarrowed(p: ts.ParameterDeclaration): boolean {
    return this.lenient && ts.isIdentifier(p.name) && this.declaredTypeOf(p.name) === 'Any?';
  }

  /** `typeof x` of a value Kotlin holds nullable, read as it is held. */
  private rawTypeof(e: ts.Expression): string {
    this.nullOk.add(e);
    try { return `jsTypeof(${this.expr(e)})`; } finally { this.nullOk.delete(e); }
  }

  /** The 1 that `++` and `--` step a number or a BigInt by. */
  private one(e: ts.Expression): string { return this.typeOf(e) === 'JSBigInt' ? 'JSBigInt(1L)' : '1.0'; }

  private prefix(e: ts.PrefixUnaryExpression): string {
    const K = ts.SyntaxKind;
    switch (e.operator) {
      case K.ExclamationToken: {
        const cell = negatedCell(this.conditions, e.operand);
        return `!(${cell.step === 'bool' ? this.expr(cell.e) : this.cond(e.operand, cell)})`;
      }
      case K.MinusToken:
        if (this.typeOf(e.operand) === 'JSBigInt') return `(-${this.expr(e.operand)})`;
        return ts.isNumericLiteral(e.operand) ? `-${this.expr(e.operand)}` : `-(${this.toNumber(e.operand)})`;
      case K.PlusToken: return this.toNumber(e.operand);
      case K.TildeToken: return this.typeOf(e.operand) === 'JSBigInt' ? `${this.expr(e.operand)}.inv()` : `jsBitNot(${this.toNumber(e.operand)})`;
      case K.PlusPlusToken:
      case K.MinusMinusToken: {
        const sign = e.operator === K.PlusPlusToken ? '+' : '-';
        const place = this.untypedPlace(e.operand);
        if (place) return this.keyedStep(place, sign, false);
        const t = this.lvalue(e.operand);
        return `run { ${t} ${sign}= ${this.one(e.operand)}; ${t} }`;
      }
    }
    throw this.error(e, 'prefix operator');
  }

  /** A member's compound, logical or update assignment (`readWrite`): its held parts evaluated once, its value the one computed. */
  private readWriteCode(e: ts.Expression, rw: ReadWrite): string {
    const names = rw.held.map((h) => this.fresh(h === rw.target.expression ? '__o' : '__k'));
    const binds = rw.held.map((h, k) => `val ${names[k]} = ${this.expr(h)}`);
    rw.held.forEach((h, k) => { this.subst.set(h, names[k]); this.heldParts.add(h); });
    try {
      const body = rw.value ? this.readWriteValue(e) : this.exprStatement(e);
      const lost = names.find((n) => !new RegExp(`\\b${n}\\b`).test(body));
      if (lost) throw this.error(e, `a compound assignment whose target the translation evaluates apart from its parts (${lost})`);
      return binds.length ? `run { ${[...binds, body].join('; ')} }` : body;
    } finally {
      rw.held.forEach((h) => { this.subst.delete(h); this.heldParts.delete(h); });
    }
  }

  /** `f()` reading a record's entry as present, though Kotlin reads it back nullable. */
  /** A record's entry declared present, though Kotlin reads it back nullable. */
  private recordEntry(target: ts.Expression): ts.ElementAccessExpression | null {
    while (ts.isParenthesizedExpression(target)) target = target.expression;
    return ts.isElementAccessExpression(target) && this.typeOf(target.expression).replace(/\?$/, '').startsWith('JSRecord<') && !isNullable(this.typeOf(target)) ? target : null;
  }

  private entryRead(e: ts.Expression, f: () => string): string {
    const target = this.recordEntry(e);
    if (!target) return f();
    this.subst.set(target, this.asserted(this.expr(target)));
    try { return f(); } finally { this.subst.delete(target); }
  }

  /** A member's compound, logical or update assignment as a value: one read, the write, and the value computed or kept. */
  private readWriteValue(e: ts.Expression): string {
    const K = ts.SyntaxKind;
    if (ts.isBinaryExpression(e) && [K.AmpersandAmpersandEqualsToken, K.BarBarEqualsToken, K.QuestionQuestionEqualsToken].includes(e.operatorToken.kind)) {
      const read = this.fresh('__read'), value = this.fresh('__value');
      const op = e.operatorToken.kind;
      const test = op === K.AmpersandAmpersandEqualsToken ? `jsTruthy(${read})` : op === K.BarBarEqualsToken ? `!jsTruthy(${read})` : `jsIsNullish(${read})`;
      const target = this.declaredTypeOf(e.left) ?? this.typeOf(e.left);
      const t = this.typeOf(e.left) === 'Any?' ? 'Any?' : this.typeOf(e);
      const assigned = `val ${value} = ${this.stored(e.right, e.left, t === 'Any?' ? 'Any?' : target)}`;
      const kept = isNullable(target) && t !== 'Any?' ? this.undefinedAs(read, t) : this.recordEntry(e.left) ? this.asserted(read) : read;
      this.subst.set(e.right, value);
      try {
        return `run { val ${read} = ${this.expr(e.left)}; if (${test}) { ${assigned}; ${this.assignment(e.left, e.right)}; ${value} } else ${kept} }`;
      } finally {
        this.subst.delete(e.right);
      }
    }
    const value = this.fresh('__value');
    let computed: string, given = value, old = '';
    if (ts.isBinaryExpression(e)) computed = this.entryRead(e.left, () => this.binary(asOperation(e)));
    else {
      const u = e as ts.PrefixUnaryExpression | ts.PostfixUnaryExpression;
      old = this.fresh('__old');
      computed = `${old} ${u.operator === K.PlusPlusToken ? '+' : '-'} ${this.one(u.operand)}`;
      old = `val ${old} = ${this.entryRead(u.operand, () => this.typeOf(u.operand) === 'JSBigInt' ? this.expr(u.operand) : this.toNumber(u.operand))}; `;
      if (ts.isPostfixUnaryExpression(e)) given = /val (\w+)/.exec(old)![1];
    }
    const left = ts.isBinaryExpression(e) ? e.left : (e as ts.PrefixUnaryExpression).operand;
    this.subst.set(e, value);
    try {
      return `run { ${old}val ${value} = ${computed}; ${this.assignment(left, e)}; ${given} }`;
    } finally {
      this.subst.delete(e);
    }
  }

  /** `++`/`--` of a member read and written by key, as a value: the old number (postfix) or the new one. */
  private keyedStep(place: { obj: string; key: string }, sign: string, postfix: boolean): string {
    const o = this.fresh('__o');
    return `run { val ${o} = ${place.obj}; val __old = jsToNumber(jsGet(${o}, ${place.key})); jsSet(${o}, ${place.key}, __old ${sign} 1.0); ${postfix ? '__old' : `__old ${sign} 1.0`} }`;
  }

  /** `left = right` (also the assignment `??=` and `||=` make). */
  private assignment(left: ts.Expression, right: ts.Expression): string {
    // A right side the translation converted already (`subst`) is not given again.
    const checks = assignedTo(left, right) && !this.subst.has(right);
    const nullish = ts.isIdentifier(left) ? this.states.nullishRead(left) : null;
    if (nullish) return `${this.refName(left as ts.Identifier)} = ${this.stored(right, left, this.nullishSlotType(nullish), checks)}`;
    if (notedField(this.states, left)) return `${this.expr(left.expression)}.jsSet(${kotlinString(left.name.text)}, ${this.stored(right, left, 'Any?', checks)})`;
    const keyed = ts.isPropertyAccessExpression(left) && !this.lenient && !this.library ? this.states.nullishShapeField(left, true) : null;
    if (keyed) return `${this.expr((left as ts.PropertyAccessExpression).expression)}.jsSet(${kotlinString(keyed)}, ${this.stored(right, left, 'Any?', checks)})`;
    if (ts.isPropertyAccessExpression(left) && this.symbolName(left.expression) === 'VueRef' && left.name.text === 'value') return `${this.lvalue(left)} = ${this.signalWrite(left.expression, right, this.typeOf(left), checks, left)}`;
    if (ts.isArrayLiteralExpression(left)) throw this.error(left, 'a destructuring assignment');
    // `super.style = value` over the kit's `__set_style`: the kit's body, since its property calls this class's override.
    const enclosing = ts.findAncestor(left, ts.isClassLike);
    const overKit = !this.library && !!enclosing && ts.isPropertyAccessExpression(left) && left.expression.kind === ts.SyntaxKind.SuperKeyword
      && (this.checker.getSymbolAtLocation(left.name)?.declarations ?? []).every((d) => d.getSourceFile().isDeclarationFile) && this.baseSetterMethod(enclosing, left.name.text);
    const takes = ts.isPropertyAccessExpression(left) ? this.setterTakesAt(left) ?? (overKit ? 'Any?' : null) : null;
    if (takes) {
      const place = this.lvalue(left);
      const member = `.${ident(left.name.text)}`;
      if (place.endsWith(member)) return `${place.slice(0, -member.length)}.${setterMethod(left.name.text)}(${this.stored(right, left, takes, checks)})`;
    }
    // An object Kotlin holds untyped, or none this platform's code can reach (the iOS half of `__APPLE__ ? x : undefined`, narrowed to never), is set by name.
    // `this.x = …` in a static block or method, of a static field the class declares: the companion's.
    const staticOwn = ts.isPropertyAccessExpression(left) && left.expression.kind === ts.SyntaxKind.ThisKeyword && !!this.resolve(left.name)?.declarations?.some((d) => ts.isPropertyDeclaration(d) && isStatic(d));
    if (staticOwn) return `${this.expr(left.expression)}.${ident(left.name.text)} = ${this.stored(right, left, this.typeOf(left), checks)}`;
    // A static method is called straight on the companion, which keeps no value under its name.
    const ownMethod = ts.isPropertyAccessExpression(left) ? this.replacedMethod(left) : undefined;
    if (ownMethod && isStatic(ownMethod)) throw this.error(left.parent, `giving ${(ownMethod.parent as ts.ClassLikeDeclaration).name?.text ?? 'a class'}.${ownMethod.name.getText()} a value in place of the class's static method`);
    if (ts.isPropertyAccessExpression(left) && !this.library && !staticOwn && ['Any?', 'Nothing'].includes(this.typeOf(left.expression)) && !this.isExpando(left)) return `jsSet(${this.expr(left.expression)}, ${kotlinString(left.name.text)}, ${this.untypedCallable(right)})`;
    // A method of a class replaced on an instance (`image.requestLayout = () => …`): set by name, which the class's own calls do not see.
    if (ts.isPropertyAccessExpression(left) && !this.library && (this.checker.getSymbolAtLocation(left.name)?.flags ?? 0) & ts.SymbolFlags.Method && !this.isPrototypeRef(left.expression)) return `jsSet(${this.expr(left.expression)}, ${kotlinString(left.name.text)}, ${this.untypedCallable(right)})`;
    if (ts.isPropertyAccessExpression(left)) {
      const special = this.core?.assign(left, right) ?? this.native?.assign(left, right);
      if (special) return special;
    }
    // Library mode: a function taking `this` put on a prototype (`View.prototype[prop.setNative] = function (this: View, v) {…}`): a method, called with its instance.
    if ((ts.isPropertyAccessExpression(left) || ts.isElementAccessExpression(left)) && this.isPrototypeRef(left.expression)) {
      const sig = this.checker.getTypeAtLocation(right).getCallSignatures()[0] as (ts.Signature & { thisParameter?: ts.Symbol }) | undefined;
      const parts = sig?.thisParameter ? functionTypeParts(this.typeOf(right)) : null;
      if (parts?.params.length) {
        const key = ts.isPropertyAccessExpression(left) ? kotlinString(left.name.text) : this.propertyKey(left.argumentExpression);
        const args = parts.params.map((p, k) => this.fromAnyCode(k === 0 ? '__t' : pure(`__a.getOrNull(${k - 1})`), p, true));
        return `jsSet(${this.expr(left.expression)}, ${key}, run { val __f = ${this.stored(right, left, this.typeOf(right), checks)}; JSMethod ${lambda(['__t', '__a'], `__f(${args.join(', ')})`)} })`;
      }
    }
    const eventData = this.library && ts.isPropertyAccessExpression(left) && ((this.typeOf(left.expression).replace(/\?$/, '') === 'EventData' && !['eventName', 'object'].includes(left.name.text))
      // `promise.cancel = …` on the kit's promise: kept beside it, as script adds it.
      || this.isPromiseType(this.typeOf(left.expression).replace(/\?$/, '')));
    if (ts.isPropertyAccessExpression(left) && !this.library && this.isGlobalObject(left.expression)) return `jsSet(jsGlobalThis, ${kotlinString(left.name.text)}, ${this.untypedCallable(right)})`;
    // `record.key = v` of a `Record<string, T>`: its entry.
    const record = ts.isPropertyAccessExpression(left) ? /^JSRecord<(.*)>\??$/.exec(this.typeOf(left.expression)) : null;
    if (record && ts.isPropertyAccessExpression(left)) return `${this.typeOf(left.expression).endsWith('?') ? this.present(this.expr(left.expression), left.name.text, left.expression, true) : this.expr(left.expression)}[${kotlinString(left.name.text)}] = ${this.stored(right, left, record[1], checks)}`;
    // A method replaced on an instance (`image.requestLayout = () => …`): kept beside it by name, as Kotlin's methods are fixed.
    const method = ts.isPropertyAccessExpression(left) && !this.library && this.checker.getSymbolAtLocation(left.name)?.declarations?.every((d) => ts.isMethodDeclaration(d) || ts.isMethodSignature(d));
    if (method && ts.isPropertyAccessExpression(left)) return `jsSet(${this.expr(left.expression)}, ${kotlinString(left.name.text)}, ${this.stored(right, left, 'Any?', checks)})`;
    if (ts.isPropertyAccessExpression(left) && !staticOwn && (this.isExpando(left) || this.isAny(left.expression) || eventData)) return `jsSet(${this.expr(left.expression)}, ${kotlinString(left.name.text)}, ${this.stored(right, left, 'Any?', checks)})`;
    const undeclared = ts.isElementAccessExpression(left) && ts.isStringLiteral(left.argumentExpression) && !this.checker.getNonNullableType(this.checker.getTypeAtLocation(left.expression)).getProperty(left.argumentExpression.text);
    // A typed array's element by a numeric index is its own operator, not a dynamic store through the index's string.
    const typedElement = ts.isElementAccessExpression(left) && TYPED_ARRAYS.includes(this.typeOf(left.expression).replace(/\?$/, '').replace(/^JS/, '')) && this.typeOf(left.argumentExpression) === 'Double';
    if (ts.isElementAccessExpression(left) && !typedElement && (this.isAny(left.expression) || undeclared || (!ts.isStringLiteral(left.argumentExpression) && this.isObjectRef(left.expression)
        && !/^(JSArray|JSRecord|JSMatch|Pair|Triple)\b/.test(this.typeOf(left.expression).replace(/\?$/, ''))))) {
      return `jsSet(${this.expr(left.expression)}, ${this.propertyKey(left.argumentExpression)}, ${this.stored(right, left, 'Any?', checks)})`;
    }
    const element = ts.isElementAccessExpression(left) && this.states.nullishElements(left.expression) ? this.elementTypeOf(left.expression) : null;
    return `${this.lvalue(left)} = ${this.stored(right, left, element ?? this.declaredTypeOf(left) ?? this.typeOf(left), checks)}`;
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
    // A member written by key, or a record's entry (read back nullable): the operation's value, assigned as `=` assigns it.
    const keyed = (compound[op] || op === K.PercentEqualsToken || op === K.AsteriskAsteriskEqualsToken) && this.untypedPlace(e.left);
    const entry = op >= K.FirstCompoundAssignment && op <= K.LastCompoundAssignment && ![K.QuestionQuestionEqualsToken, K.BarBarEqualsToken, K.AmpersandAmpersandEqualsToken].includes(op)
      && ts.isElementAccessExpression(e.left) && this.typeOf(e.left.expression).replace(/\?$/, '').startsWith('JSRecord<');
    if (keyed || entry) {
      this.subst.set(e, this.entryRead(e.left, () => this.binary(asOperation(e))));
      try { return this.assignment(e.left, e); } finally { this.subst.delete(e); }
    }
    if (compound[op]) return `${target()} = ${bit[compound[op]!]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
    switch (op) {
      case K.EqualsToken: {
        const assigned = this.assignment(e.left, e.right);
        const plain = /^(jsSet\(|\w+\.set\()/.test(assigned) || !assigned.includes(' = ');
        return ts.isExpressionStatement(e.parent) || (ts.isParenthesizedExpression(e.parent) && ts.isExpressionStatement(e.parent.parent)) || ts.isForStatement(e.parent) || plain ? assigned : `run { ${assigned}; ${target()} }`;
      }
      // An untyped variable holds whatever the operation gives: a string, or a number.
      case K.PlusEqualsToken:
        if (this.untypedPlace(e.left)) { const p = this.untypedPlace(e.left)!; return `jsSet(${p.obj}, ${p.key}, jsAdd(jsGet(${p.obj}, ${p.key}), ${this.coerce(e.right, 'Any?')}))`; }
        if (this.lenient && this.typeOf(e.left) === 'Double' && this.declaredTypeOf(e.left) === 'Double?') return `${target()} = ${this.undefinedAs(this.expr(e.left), 'Double')} + ${this.toNumber(e.right)}`;
        if (this.isAny(e.left)) return `${target()} = jsAdd(${l()}, ${this.coerce(e.right, 'Any?')})`;
        // A string that may be missing converts first: Kotlin's `+` on a null string writes "null" for undefined too.
        if (this.isString(e.left) && isNullable(this.declaredTypeOf(e.left) ?? this.typeOf(e.left))) return `${target()} = ${this.str(e.left)} + ${this.str(e.right)}`;
        return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: case K.AsteriskEqualsToken: case K.SlashEqualsToken: if (this.lenient && this.typeOf(e.left) === 'Double' && this.declaredTypeOf(e.left) === 'Double?') {
        return `${target()} = ${this.undefinedAs(this.expr(e.left), 'Double')} ${({ [K.MinusEqualsToken]: '-', [K.AsteriskEqualsToken]: '*', [K.SlashEqualsToken]: '/' } as Record<number, string>)[op]} ${this.toNumber(e.right)}`;
      }
      if (this.untypedPlace(e.left)) {
        const p = this.untypedPlace(e.left)!;
        return `jsSet(${p.obj}, ${p.key}, jsToNumber(jsGet(${p.obj}, ${p.key})) ${({ [K.MinusEqualsToken]: '-', [K.AsteriskEqualsToken]: '*', [K.SlashEqualsToken]: '/' } as Record<number, string>)[op]} ${this.toNumber(e.right)})`;
      }
      if (op === K.MinusEqualsToken) return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} - ${this.toNumber(e.right)}` : `${target()} -= ${this.toNumber(e.right)}`;
      if (op === K.AsteriskEqualsToken) return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} * ${this.toNumber(e.right)}` : `${target()} *= ${this.toNumber(e.right)}`;
      if (op === K.SlashEqualsToken) return this.isAny(e.left) ? `${target()} = ${this.toNumber(e.left)} / ${this.toNumber(e.right)}` : `${target()} /= ${this.toNumber(e.right)}`;
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
        // An untyped or object operand: compared as strings or as numbers by what it holds when the program runs.
        const dynamic = (x: ts.Expression) => { const t = this.typeOf(x); return t === 'Any?' || t === 'Any' || t === 'String?' || /^[A-Z]\??$/.test(t) || (this.isObjectType(t) && !/^JSDate\??$/.test(t)); };
        if (dynamic(e.left) || dynamic(e.right)) {
          const fn = ({ [K.LessThanToken]: 'jsLess', [K.GreaterThanToken]: 'jsGreater', [K.LessThanEqualsToken]: 'jsLessOrEqual', [K.GreaterThanEqualsToken]: 'jsGreaterOrEqual' } as Partial<Record<ts.SyntaxKind, string>>)[op];
          return `${fn}(${this.coerce(e.left, 'Any?')}, ${this.coerce(e.right, 'Any?')})`;
        }
        return `${this.toNumber(e.left)} ${sym} ${this.toNumber(e.right)}`;
      }
      case K.QuestionQuestionToken: {
        const t = this.typeOf(e);
        const maybe = this.maybeUndefined(e.left);
        if (maybe && t === 'Any?') return `jsNullishCoalesce(${maybe}) { ${this.coerce(e.right, 'Any?')} }`;
        // An object the right operand may leave missing: required present by what reads the whole, not here.
        if (maybe && !this.library && this.isObjectRef(e) && !isNullable(t) && !isFunctionType(t)) {
          const right = this.coerce(e.right, t);
          return this.isAsserted(right) ? this.asserted(`(${maybe} ?: ${this.unasserted(right)})`) : `(${maybe} ?: ${right})`;
        }
        // TypeScript types `s ?? 1` as the string `s` is declared; a missing `s` gives the fallback as a string.
        if (maybe) return `(${maybe} ?: ${t === 'String' && this.typeOf(e.right) !== 'String' ? this.str(e.right) : this.coerce(e.right, t)})`;
        if (this.isAny(e.left)) {
          const code = `jsNullishCoalesce(${l()}) { ${this.coerce(e.right, 'Any?')} }`;
          return (this.library || this.states.heldNullish(ts.skipOuterExpressions(e.left))) && t !== 'Any?' ? this.fromAnyCode(code, t, true) : code;
        }
        const left = l(), right = this.coerce(e.right, t);
        if (!this.library && this.isObjectRef(e) && !isNullable(t) && !isFunctionType(t) && this.isAsserted(right)) return this.asserted(`(${left} ?: ${this.unasserted(right)})`);
        return `(${left} ?: ${right})`;
      }
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        const assertedLeft = this.assertedUntyped(e.left);
        if (this.isBool(e.left) && this.isBool(e.right) && !assertedLeft) {
          const fixed = this.staticTruth(e);
          if (fixed !== undefined) return String(fixed);
          if (this.staticTruth(e.left) === (sym === '&&')) return r();
          if (this.staticTruth(e.right) === (sym === '&&') && this.pure(e.left)) return l();
          const left = l(), right = r();
          return left === right ? left : `${left} ${sym} ${right}`;
        }
        // JavaScript returns an operand, not a Boolean.
        // Library mode: a function `a && a.getItem` gives may be missing: nullable where a nullable variable takes it.
        const declared = ts.isVariableDeclaration(e.parent) && e.parent.initializer === e && ts.isIdentifier(e.parent.name) ? this.declaredTypeOf(e.parent.name) : null;
        const t = this.library && declared && isNullable(declared) && (isFunctionType(declared.replace(/^\((.*)\)\?$/, '$1')) || ['String?', 'Double?', 'Boolean?'].includes(declared)) ? declared : this.typeOf(e);
        const v = this.fresh('__v');
        // Library mode: a right operand declared nullable (a field left unset) is the result as its type reads undefined.
        const right = this.library && ['String', 'Double', 'Boolean'].includes(t) && this.declaredTypeOf(e.right) === optionalType(t) ? this.undefinedAs(this.expr(e.right), t) : this.coerce(e.right, t);
        const leftType = this.typeOf(e.left);
        // A nullable declaration read as its non-null type: present when truthy, else the type's undefined.
        const nullableLeft = (!!assertedLeft || ((ts.isIdentifier(e.left) || ts.isPropertyAccessExpression(e.left)) && this.declaredTypeOf(e.left) === optionalType(leftType))) && leftType !== optionalType(leftType);
        let leftValue = leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? this.unwrapped(v) : leftType === 'Any?' ? (this.library ? this.fromAnyCode(v, t, true) : this.fromAny(v, t)) : t === 'Boolean' ? `jsTruthy(${v})` : v;
        const left = this.maybeUndefined(e.left) ?? l();
        // `a && a.get()` with an object `a`: undefined when it is missing.
        // Tested for truth (`a && b && b.c`, `if (a && b)`): the missing value as it is.
        let at: ts.Node = e.parent;
        while (ts.isParenthesizedExpression(at)) at = at.parent;
        const tested = (ts.isBinaryExpression(at) && [K.AmpersandAmpersandToken, K.BarBarToken].includes(at.operatorToken.kind) && ts.skipOuterExpressions(at.left) === e) || ((ts.isIfStatement(at) || ts.isConditionalExpression(at)) && ts.skipOuterExpressions(ts.isIfStatement(at) ? at.expression : at.condition) === e) || (ts.isPrefixUnaryExpression(at) && at.operator === K.ExclamationToken);
        if (op === K.AmpersandAmpersandToken && leftValue === v && this.isObjectType(leftType) && leftType.replace(/\?$/, '') !== t.replace(/\?$/, '') && t !== 'Any?' && t !== 'Boolean') {
          return isNullable(t) || tested ? `(if (jsTruthy(${left})) ${right} else null)` : this.asserted(`(if (jsTruthy(${left})) ${right} else null)`);
        }
        // Library mode: `s && s.match(re)` of a string `s`: the object, else none (a falsy string is no match).
        if (this.library && op === K.AmpersandAmpersandToken && leftValue === v && ['String', 'Double', 'Boolean'].includes(leftType) && this.isObjectType(t.replace(/\?$/, '')) && !['String', 'Double', 'Boolean'].includes(t.replace(/\?$/, ''))) {
          return isNullable(t) || tested ? `(if (jsTruthy(${left})) ${right} else null)` : this.asserted(`(if (jsTruthy(${left})) ${right} else null)`);
        }
        if (nullableLeft && leftValue === v && t !== 'Any?') leftValue = op === K.BarBarToken ? this.unwrapped(v) : this.undefinedAs(v, t);
        // A truthy left operand is present, whatever Kotlin types its read (`a?.b`, a record's value).
        if (op === K.BarBarToken && leftValue === v && !isNullable(t) && t !== 'Any?') leftValue = this.unwrapped(v);
        if (leftValue === v) return `${op === K.BarBarToken ? 'jsOr' : 'jsAnd'}(${left}) { ${right} }`;
        // A boolean of a value's truth: the truth itself, as the operator gives it.
        if (leftValue === `jsTruthy(${v})` && t === 'Boolean') return `(jsTruthy(${left}) ${sym} ${right})`;
        // jsTruthy's contract makes the tested value non-null where it holds.
        return op === K.BarBarToken
          ? `run { val ${v} = ${left}; if (jsTruthy(${v})) ${leftValue === `${v}!!` ? v : leftValue} else ${branch(right)} }`
          : `run { val ${v} = ${left}; if (jsTruthy(${v})) ${branch(right)} else ${leftValue} }`;
      }
      case K.InstanceOfKeyword: {
        // A class held as a value (`C: ErrorConstructor`): tested by the class it holds.
        const libraryClass = ts.isIdentifier(e.right) && isLibDeclaration(this.resolve(e.right)?.declarations?.[0]);
        if (!libraryClass && this.typeOf(e.right).replace(/\?$/, '').startsWith('Class<')) return `${this.expr(e.right)}.isInstance(${this.coerce(e.left, 'Any?')})`;
        const name = e.right.getText();
        // A compiled program makes no String, Number or Boolean wrapper objects.
        if (['String', 'Number', 'Boolean'].includes(name) && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) {
          const left = this.coerce(e.left, 'Any?');
          return this.isPure(left) ? 'false' : `run { ${left}; false }`;
        }
        // The library's classes: the runtime's type of any of their instances (a promise of any result).
        const builtin = BUILTIN_CLASSES[name];
        if (builtin && isLibDeclaration(this.resolve(e.right)?.declarations?.[0])) return `(${this.observed(e.left)} is ${builtin})`;
        // Library mode: an untyped parameter tested as it is, as a cast here would narrow it in Kotlin past the test.
        const param = ts.isIdentifier(e.left) ? this.resolve(e.left)?.valueDeclaration : undefined;
        let left = this.library && param && ts.isParameter(param) && this.typeTested(param) ? ident((e.left as ts.Identifier).text) : this.observed(e.left);
        // An untyped value read as the class its type names passes for one whatever it holds: the value itself is tested.
        const cast = this.markOf(left);
        if (cast?.op === 'cast' && cast.unchecked) left = ts.isIdentifier(e.left) ? this.refName(e.left) : cast.to.args.length || cast.optional || cast.to.kind === 'function' ? left : cast.of.code;
        // Library mode: a class the program declares, by its Kotlin name; a class held in a value, tested when the program runs.
        const cls = this.library && !ERRORS[name] ? this.resolve(e.right)?.valueDeclaration : undefined;
        if (cls && ts.isClassDeclaration(cls) && !cls.getSourceFile().isDeclarationFile) return this.decidedInstanceOf(e) ? `jsIs<${this.className(cls)}>(${left})` : `(${left} is ${this.className(cls)})`;
        const rightSym = this.resolve(ts.isPropertyAccessExpression(e.right) ? e.right.name : e.right);
        // A generic class is tested whatever its type arguments: `is Box<*>`.
        const generic = rightSym?.valueDeclaration && ts.isClassDeclaration(rightSym.valueDeclaration) ? rightSym.valueDeclaration.typeParameters?.length ?? 0 : 0;
        const tested = ERRORS[name] ?? this.typeOf(e.right).replace(/^typeof /, '').replace(/\?$/, '').replace(/<>$/, generic ? `<${Array(generic).fill('*').join(', ')}>` : '');
        if (this.library && (tested === 'Any' || !tested) && !(rightSym && (rightSym.flags & ts.SymbolFlags.Class || isLibDeclaration(rightSym.declarations?.[0])))) {
          const alias = ts.isIdentifier(e.right) ? this.native?.identifier(e.right) : null;
          return `jsInstanceOf(${this.coerce(e.left, 'Any?')}, ${alias ?? this.coerce(e.right, 'Any?')})`;
        }
        return this.decidedInstanceOf(e) ? `jsIs<${tested ?? name}>(${left})` : `(${left} is ${tested ?? name})`;
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
    // A `T | null` value compared strictly with undefined, or a `T | undefined` one with null: never the same.
    const empty = emptyComparison(this.placement, e);
    if (empty?.cell === 'empty') return `${negate ? '!' : ''}jsStrictEquals(${this.observe(empty.x)}, ${empty.isNull ? 'jsNull' : 'null'})`;
    const maybe = isNullish(b) ? this.maybeUndefined(a) : isNullish(a) ? this.maybeUndefined(b) : null;
    if (maybe) return `${maybe} ${negate ? '!=' : '=='} null`;
    // A value its type calls present that script may still leave out (a field core never set): tested as it is.
    const absent = (x: ts.Expression, t: string) => {
      const code = this.expr(x);
      const cast = this.markOf(code);
      const unchecked = cast?.op === 'cast' && !!cast.unchecked && !cast.optional;
      const present = (!isNullable(t) && !isFunctionType(t) && !isNullable(this.declaredTypeOf(x) ?? t)) || unchecked;
      return present ? `${negate ? '!' : ''}jsIsNullish(${code})` : `${code} ${negate ? '!=' : '=='} null`;
    };
    if (isNullish(b) && lt !== 'Any?') return absent(a, lt);
    if (isNullish(a) && rt !== 'Any?') return absent(b, rt);
    const script = scriptComparison(this.placement, e, (_, t) => /^[A-Z]\??$/.test(t));
    if (script?.cell === 'nullish') return `${negate ? '!' : ''}jsIsNullish(${this.observe(script.x)})`;
    if (script) return `${negate ? '!' : ''}${strict ? 'jsStrictEquals' : 'jsLooseEquals'}(${this.observe(a)}, ${this.observe(b)})`;
    // A function reference (`::fn`) is made where it is read, equal to every other of its function: compared by equality.
    const fnType = (t: string) => isFunctionType(t.replace(/^\((.*)\)\?$/, '$1'));
    if (this.isObjectRef(a) && this.isObjectRef(b) && !fnType(lt) && !fnType(rt)) return `${this.observe(a, 'asIs')} ${negate ? '!==' : '==='} ${this.observe(b, 'asIs')}`;
    // An adaptation (`JSAdapted`) is its original either way round, which `==` on the original does not see.
    if (fnType(lt) || fnType(rt)) return `${negate ? '!' : ''}jsStrictEquals(${this.expr(a)}, ${this.expr(b)})`;
    return `${this.expr(a)} ${negate ? '!=' : '=='} ${this.expr(b)}`;
  }

  private array(e: ts.ArrayLiteralExpression): string {
    // A destructuring pattern's implied type (`const [a, b] = [0, 1]`) types nothing: the literal's own does.
    const destructured = (ts.isVariableDeclaration(e.parent) && e.parent.initializer === e && ts.isArrayBindingPattern(e.parent.name)) || destructuringSource(e);
    const context = destructured ? undefined : this.checker.getContextualType(e);
    let t = this.typeOf(e);
    // A spread's length is known only when it runs: no tuple.
    if (context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)) && !(this.checker.isTupleType(context) && e.elements.some(ts.isSpreadElement))) {
      const c = this.heldElements(e, this.type(context, e)).replace(/\?$/, '');
      if (c.startsWith('JSArray<') || c.startsWith('Pair<') || c.startsWith('Triple<') || !e.elements.length) t = c;
      // Where an array or other kinds of value go (`data: string[][] | string`): that array.
      const arrays = context.isUnion() ? context.types.filter((u) => this.checker.isArrayType(u)) : [];
      if (c === 'Any' && arrays.length === 1) t = this.type(arrays[0], e);
    }
    const placedElement = this.states.literalElementType(e);
    if (placedElement) t = this.heldElements(e, `JSArray<${this.type(placedElement, e)}>`);
    // Held untyped, its object literals are script objects (`set('items', [{ subItems: [1] }])`): an untyped array.
    if (t === 'Any?' || (context && context.flags & ts.TypeFlags.Any && (this.inPluginFile(e) || (!this.library && e.elements.some(ts.isObjectLiteralExpression))))) t = 'JSArray<Any?>';
    // `[]` where a match array goes (`text.match(re) || []`): an empty match.
    if (t === 'JSMatch' && !e.elements.length) return 'JSMatch.empty()';
    if (t.startsWith('Pair<') || t.startsWith('Triple<')) {
      const types = splitTopLevel(t.replace(/^(Pair|Triple)<(.*)>$/, '$2'));
      return `${t.replace(/<.*/, '')}(${e.elements.map((x, k) => this.coerce(x, types[k])).join(', ')})`;
    }
    const el = t.replace(/^JSArray<(.*)>$/, '$1');
    if (!e.elements.length) return `${t}()`;
    // An array of objects holds a Kotlin null, which reads as undefined.
    const nulled = !isNullable(el) && e.elements.find((x) => !ts.isSpreadElement(x) && this.states.nullResult(ts.skipOuterExpressions(x, ts.OuterExpressionKinds.Parentheses)));
    if (nulled) throw this.error(nulled, `the null a non-strict function may give, in an array of ${el}`);
    if (!e.elements.some(ts.isSpreadElement)) {
      if (e.elements.some(ts.isOmittedExpression)) throw this.error(e, 'an array hole');
      const slot = this.elementSlot(e, el);
      return this.marked(`jsArrayOf<${el}>(${e.elements.map((x) => place(this.placement, x, slot(x))).join(', ')})`, { op: 'array', element: el });
    }
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`listOf<${el}>(${run.join(', ')})`); run = []; }
        const items = `(${this.iterable(x.expression)}).toList()`;
        // Library mode: an array of untyped values (`const cssClasses = []`) spread where the literal's elements are typed.
        parts.push(this.library && el !== 'Any?' && this.elementTypeOf(x.expression) === 'Any?' ? `${items}.map { ${this.fromAny('it', el)} }` : items);
      } else if (ts.isOmittedExpression(x)) throw this.error(x, 'an array hole');
      else run.push(place(this.placement, x, this.elementSlot(e, el)(x)));
    }
    if (run.length) parts.push(`listOf<${el}>(${run.join(', ')})`);
    return `${t}(${parts.join(' + ')})`;
  }

  private object(e: ts.ObjectLiteralExpression): string {
    // `{ … } satisfies T` is of the literal's own type, and so are the literals in it: T only checks them.
    let outer: ts.Node = e;
    while (ts.isPropertyAssignment(outer.parent) && ts.isObjectLiteralExpression(outer.parent.parent)) outer = outer.parent.parent;
    let contextual = ts.isSatisfiesExpression(outer.parent) || destructuringSource(e) ? undefined : this.checker.getContextualType(e);
    // An async function's result (`T | PromiseLike<T>` where it returns): the T a literal can be.
    if (contextual?.isUnion()) {
      const plain = contextual.types.filter((t) => !t.getProperty('then'));
      if (plain.length === 1 && plain.length < contextual.types.length) contextual = plain[0];
    }
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
        if (ts.isPropertyAssignment(p)) return `Pair(${ts.isComputedPropertyName(p.name) ? this.propertyKey(p.name.expression) : kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${this.stored(p.initializer, p, v)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `Pair(${kotlinString(p.name.text)}, ${this.shorthandValue(p.name)})`;
        throw this.error(p, 'this member in a dictionary literal');
      });
      return entries.length ? `${name}(listOf(${entries.join(', ')}))` : `${name}()`;
    }
    // Library mode: core's own EventData, holding what the literal adds beyond its fields.
    if (name === 'EventData' && this.library) return `EventData.fromJS(${this.dynamicObject(e)})`;
    if (name === 'Any?' || name === 'Any' || name === 'Nothing' || name === 'JSObject' || name === 'EventData') return this.dynamicObject(e);
    // The generated kit: an object of an interface core declares (`TraceErrorHandler`), which core holds untyped and calls by name.
    if (this.generatedKit && this.core?.has(`${name}Object`) && isCoreDeclaration(this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0])) return this.dynamicObject(e);
    if (/^JS(Iterator|AsyncIterator)</.test(name)) return this.scriptIterator(e, name);
    // A spread of an open type (`{ ...state, x }` with `state: T`) carries keys no shape declares; the shape keeps them as extras.
    if (e.properties.some((p) => ts.isSpreadAssignment(p) && openSpreadType(this.checker.getTypeAtLocation(p.expression)))) return this.fromAnyCode(this.dynamicObject(e), name);
    // So does an untyped spread, with keys holding undefined or null besides, in its order.
    if (!this.lenient && !this.library && !this.pluginFiles.has(e.getSourceFile().fileName) && e.properties.some((p) => ts.isSpreadAssignment(p) && this.isAny(p.expression))) {
      // Members reading `this` would read the untyped object, not the one made of it.
      const own = e.properties.find((p) => ts.isMethodDeclaration(p) || ts.isAccessor(p) || (ts.isPropertyAssignment(p) && ts.isFunctionExpression(p.initializer) && thisNodes(p.initializer).length > 0));
      if (own) throw this.error(own, 'a method beside an untyped spread in a typed object literal');
      return this.fromAnyCode(this.dynamicObject(e), name);
    }
    let decl = this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0];
    // A literal that conforms to an app interface it is not declared as.
    const conforming = this.appInterfaces?.find((i) => i.name === name);
    if (conforming && !(decl && ts.isInterfaceDeclaration(decl) && decl.name.text === name)) decl = conforming.type.getSymbol()?.declarations?.[0];
    const shape = [...this.shapes.values()].find((s) => s.name === name);
    const alias = this.checker.getNonNullableType(type).aliasSymbol?.declarations?.[0];
    const joined = alias && ts.isTypeAliasDeclaration(alias) ? intersectionAliasMembers(alias, this.checker) : null;
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
    } else if (joined) {
      order = joined.map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) }));
    } else if (this.library && this.literalClassOf(type)) return this.classLiteral(e, this.literalClassOf(type)!, name);
    else throw this.error(e, `an object literal of type ${name}`);
    const given = new Map<string, string>();
    // Methods that read `this` see the object through a variable the literal sets once it exists.
    // A function expression as a member (`onViewLoaded: function () { this.loadedCount++ }`) reads the object as `this` too.
    const thisFunction = (p: ts.ObjectLiteralElementLike): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isFunctionExpression(p.initializer) && thisNodes(p.initializer).length > 0;
    const self = e.properties.some((p) => (ts.isMethodDeclaration(p) && thisNodes(p).length) || thisFunction(p)) ? this.fresh('__self') : null;
    const spreadTemps: string[] = [];
    // A field the literal sets to null, which the shape holds as Kotlin's null, is noted as null (JSON, keys, untyped reads).
    const protocolObject = target === `${name}Object` && !this.library;
    const nullFields = (shape?.fields ?? (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl)) && (!this.protocols.has(name) || protocolObject) ? order : null)) as ShapeField[] | null;
    const tracksNulls = !!nullFields && (target === name || protocolObject) && !nullFields.some((f) => f.symbol || f.accessor);
    // An optional field given undefined is a key all the same, as one given null is: the shape notes which (`jsUnset`,
    // `jsNulls`), from the value's type, or as it runs (`JSLiteralKeys`) where only the run tells.
    const notesKeys = tracksNulls && !this.lenient && !this.library && !this.pluginFiles.has(e.getSourceFile().fileName);
    const notes = literalNotes(e, this.states, this.shapeFacts(), { fields: (nullFields ?? []).map((f) => ({ name: f.name, type: f.type, holds: f.type })), tracks: tracksNulls && !this.library, notes: notesKeys, wholeLiterals: false });
    const unsetKeys: string[] = [], keyNotes: string[] = [];
    let keysVar: string | null = null;
    const noteKey = (p: ts.ObjectLiteralElementLike, key: string, value: ts.Expression, code: () => string): string => {
      const noting = notes.get(p)?.unset;
      if (noting !== 'run' && noting !== 'given') return code();
      const f = order.find((x) => x.name === key)!;
      const split = this.states.nullBranches(value);
      if (split) {
        const k = keysVar ??= this.fresh('__keys');
        const branch = (x: ts.Expression) => (split.nulls.includes(x) ? `${k}.nulled(${kotlinString(key)}, ${this.coerce(x, f.type)})` : this.coerce(x, f.type));
        return `(if (${this.cond(split.cond.condition)}) ${branch(split.cond.whenTrue)} else ${branch(split.cond.whenFalse)})`;
      }
      if (noting === 'given') { unsetKeys.push(key); return code(); }
      const k = keysVar ??= this.fresh('__keys');
      const how = this.typeOf(value) === 'Any?' && heldOf(f.type) !== 'any' ? 'untyped' : 'typed';
      // The value as the field takes it: `expr` would hold it to its narrowed type (`?: jsObjectRequired()`), never nil.
      if (ts.isIdentifier(value)) { keyNotes.push(`${k}.${how}(${kotlinString(key)}, ${how === 'typed' && f.type !== 'Any?' ? this.coerce(value, f.type) : this.expr(value)})`); return code(); }
      if (how === 'typed') return `${k}.typed(${kotlinString(key)}, ${code()})`;
      // Null and undefined apart before the value is converted to the field's type, which holds both as null.
      this.subst.set(value, `${k}.untyped(${kotlinString(key)}, ${this.expr(value)})`);
      try {
        const made = code();
        if (!made.includes(`${k}.untyped(`)) throw this.error(value, 'this untyped value for an optional field of an object literal');
        return made;
      } finally { this.subst.delete(value); }
    };
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
        const want = order.find((f) => f.name === key)?.type ?? 'Any?';
        given.set(key, self && thisFunction(p) ? this.withThis(p.initializer, self, false, () => this.stored(p.initializer, p, want)) : noteKey(p, key, p.initializer, () => this.stored(p.initializer, p, want)));
      } else if (ts.isShorthandPropertyAssignment(p)) {
        noteKey(p, p.name.text, p.name, () => '');
        const ft = order.find((f) => f.name === p.name.text)?.type ?? 'Any?';
        // A class (`{ MyComponent }`, a module's exports): its Java class, as a class held as a value is.
        const classDecl = this.checker.getShorthandAssignmentValueSymbol(p)?.valueDeclaration;
        if (!this.library && classDecl && ts.isClassDeclaration(classDecl) && !classDecl.getSourceFile().isDeclarationFile) { given.set(p.name.text, `${this.className(classDecl)}::class.java`); continue; }
        given.set(p.name.text, ft === 'Any?' ? (this.library ? this.expr(p.name) : this.states.nilIsNull(p.name) ? `jsNulled(${this.narrowed(p.name, ident(p.name.text))})` : this.narrowed(p.name, ident(p.name.text))) : this.coerce(p.name, ft));
      } else if (ts.isSpreadAssignment(p)) {
        const src = this.expr(p.expression);
        if (this.isAny(p.expression)) {
          // An untyped source (a `Partial<…>` patch): each field it has replaces the one before.
          const tmp = this.fresh('__spread');
          spreadTemps.push(`val ${tmp}: Any? = ${src}`);
          for (const f of order) {
            const prev = given.get(f.name) ?? (spelledOptional(heldOf(f.type)) ? 'null' : this.zero(f.type) ?? 'null');
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
    const inOrder = shapePlanOfLiteral(e, this.states).keys.map((k) => k.name).filter((k) => order.some((f) => f.name === k));
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
    const nullKeys = e.properties.filter((p): p is ts.PropertyAssignment | ts.ShorthandPropertyAssignment => !!notes.get(p)?.null).map((p) => literalKey(p.name, this.checker) ?? p.name.getText());
    // An untyped value may be null, which only the run can tell.
    const untypedKeys = e.properties.filter((p): p is ts.PropertyAssignment | ts.ShorthandPropertyAssignment => notes.get(p)?.unset === 'untyped')
      .map((p) => `${kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())} to ${this.expr(ts.isPropertyAssignment(p) ? p.initializer : p.name)}`);
    const keySet = (keys: string[]) => `mutableSetOf(${keys.map(kotlinString).join(', ')})`;
    if (keysVar) spreadTemps.unshift(`val ${keysVar} = JSLiteralKeys(${[...(nullKeys.length ? [`nulls = ${keySet(nullKeys)}`] : []), ...(unsetKeys.length ? [`unset = ${keySet(unsetKeys)}`] : [])].join(', ')})`, ...keyNotes);
    const noted = keysVar ? `.also { it.jsNulls = ${keysVar}.nulls; it.jsUnset = ${keysVar}.unset }`
      : untypedKeys.length ? `.also { it.jsNulls = jsNullKeysOf(listOf(${nullKeys.map(kotlinString).join(', ')}), ${untypedKeys.join(', ')})${unsetKeys.length ? `; it.jsUnset = ${keySet(unsetKeys)}` : ''} }`
      : nullKeys.length || unsetKeys.length ? `.also { ${[...(nullKeys.length ? [`it.jsNulls = ${keySet(nullKeys)}`] : []), ...(unsetKeys.length ? [`it.jsUnset = ${keySet(unsetKeys)}`] : [])].join('; ')} }` : '';
    if (process.env.NS_SHAPE_SHADOW) shadowLiteral(this, e, { fields: nullFields ?? order, tracks: tracksNulls && !this.library, notes: notesKeys, nullKeys, unsetKeys, untypedKeys, runtime: keysVar ? [...given.values(), ...keyNotes] : [], written: inOrder });
    const made = `${target}(${[...args, reorder].filter(Boolean).join(', ')})${noted}`;
    const built = self ? `run { lateinit var ${self}: ${target}; val __made = ${made}; ${self} = __made; __made }` : made;
    return spreadTemps.length ? `run { ${spreadTemps.join('; ')}; ${built} }` : built;
  }

  private literalTargets: Set<ts.Node> | null = null;
  /** Library mode: the program's classes an object literal is typed as (`emptyMatch: SelectorsMatch = { … }`), open for the literal's subclass. */
  private literalClasses(): Set<ts.Node> {
    if (this.literalTargets) return this.literalTargets;
    this.literalTargets = new Set();
    if (!this.library) return this.literalTargets;
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const visit = (n: ts.Node) => {
        if (ts.isObjectLiteralExpression(n)) {
          const t = this.checker.getContextualType(n);
          const d = t && this.literalClassOf(t);
          if (d) this.literalTargets!.add(d);
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    return this.literalTargets;
  }

  /** The program's class a literal's type names (`SelectorsMatch`, `Readonly<SelectorsMatch>`), if any. */
  private literalClassOf(type: ts.Type): ts.ClassDeclaration | undefined {
    const t = this.checker.getNonNullableType(type);
    const inner = t.aliasSymbol?.name === 'Readonly' && t.aliasTypeArguments?.length === 1 ? t.aliasTypeArguments[0] : t;
    return inner.getSymbol()?.declarations?.find((x): x is ts.ClassDeclaration => ts.isClassDeclaration(x) && !x.getSourceFile().isDeclarationFile);
  }

  /**
   * Library mode: an object literal typed as one of the program's classes: an instance of an anonymous subclass, its
   * functions overriding the class's methods (the literal's run, as in JavaScript, never the class's) and its values set.
   */
  private classLiteral(e: ts.ObjectLiteralExpression, cls: ts.ClassDeclaration, name: string): string {
    const lines: string[] = [];
    const inits: string[] = [];
    const method = (n: string) => cls.members.find((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && !!m.body && m.name.getText() === n) ?? this.inheritedMethod(cls, n);
    for (const p of e.properties) {
      if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p) && !ts.isMethodDeclaration(p)) throw this.error(p, `this member of an object literal of type ${name}`);
      const key = p.name.getText();
      const m = method(key);
      if (m) {
        const root = this.rootMethod(m);
        const params = root.parameters.map((x) => this.paramType(x));
        const ret = this.returnTypeOf(root);
        const names = this.signatureNames(ts.isMethodDeclaration(p) ? p : ts.isPropertyAssignment(p) ? p.initializer : p.name, this.paramNames(root), (k) => `__p${k}`);
        // `properties: null`: no function, which calling throws, as JavaScript's TypeError.
        const none = ts.isPropertyAssignment(p) && (p.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(p.initializer) && p.initializer.text === 'undefined'));
        if (none) { lines.push(`override fun ${ident(key)}(${params.map((t, k) => `${names[k]}: ${t}`).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} = throw JSException(JSTypeError(${kotlinString(`${key} is not a function`)}))`); continue; }
        const value = ts.isMethodDeclaration(p) ? this.closure(p, `(${params.join(', ')}) -> ${ret}`) : this.coerce(ts.isPropertyAssignment(p) ? p.initializer : p.name, `(${params.join(', ')}) -> ${ret}`);
        lines.push(`override fun ${ident(key)}(${params.map((t, k) => `${names[k]}: ${t}`).join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} = (${value})(${names.join(', ')})`);
        continue;
      }
      const field = this.fieldIn(this.checker.getTypeAtLocation(e), key);
      const t = field ? this.typeOf(field.name) : 'Any?';
      inits.push(`this.${ident(key)} = ${this.coerce(ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name, t)}`);
    }
    if (inits.length) lines.push(`init { ${inits.join('; ')} }`);
    return `object : ${this.className(cls)}() { ${lines.join('; ')} }`;
  }

  /** An interface's or object shape's Kotlin class. */
  /** The step of a value of `from` held untyped: what its box is, which `coerceTyped`'s `'Any?'` path spells. */
  private boxStep(from: string): TypeStep {
    return boxStep(from, this.library ? 'library' : this.lenient ? 'lenient' : 'checked');
  }

  /** The step of an untyped value read as `to`: which composite `fromAny` reads it into. */
  private unboxStep(to: string): TypeStep {
    return unboxStep(to, this.library ? 'library' : this.lenient ? 'lenient' : 'checked');
  }

  private isShapeType(name: string): boolean {
    return this.interfaces.has(name) || [...this.shapes.values()].some((s) => s.name === name);
  }

  /**
   * A value of one of the app's object types where another goes (`DuoFold` passed as a `StageFold`): TypeScript's
   * types are structural, Kotlin's classes are not, so the slot gets an object of its class with the value's fields.
   */
  private structuralCopy(e: ts.Expression, source: string, target: string): string | null {
    if (this.library) return null;
    const from = source.replace(/\?$/, ''), to = target.replace(/\?$/, '');
    if (from === to || !this.isShapeType(from) || !this.isShapeType(to)) return null;
    const contextual = this.checker.getContextualType(e);
    const props = contextual ? this.checker.getNonNullableType(contextual).getProperties() : [];
    if (!props.length) return null;
    // A literal is made as its contextual type already; a copy would lose the keys it notes.
    if (ts.isObjectLiteralExpression(ts.skipOuterExpressions(e))) {
      // Naming the contextual type registers its shape, which only a literal made as it may emit.
      const known = new Set(this.shapes.keys());
      if (this.type(this.checker.getNonNullableType(contextual!)).replace(/\?$/, '') === to) return this.expr(e);
      for (const k of [...this.shapes.keys()]) if (!known.has(k)) this.shapes.delete(k);
    }
    const fields = props.map((p) => `${ident(p.name)} = __s.${ident(p.name)}`).join(', ');
    const notesNulls = (n: string) => [...this.shapes.values()].some((s) => s.name === n && !s.fields.some((f) => f.symbol || f.accessor) && s.fields.some((f) => holdsNil(heldOf(f.type))));
    const nulls = notesNulls(from) && notesNulls(to) ? '.also { it.jsNulls = __s.jsNulls?.toMutableSet() }' : '';
    return `(${this.expr(e)})${holdsNil(heldOf(source)) ? '?' : ''}.let { __s -> ${to}(${fields})${nulls} }`;
  }

  dynamicObject(e: ts.ObjectLiteralExpression): string {
    const simple = e.properties.every((p) => (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) || ts.isShorthandPropertyAssignment(p));
    if (simple) {
      const entries = e.properties.map((p) => {
        // A function expression reading `this` is a method of the object, given it as its receiver.
        const method = ts.isPropertyAssignment(p) && ts.isFunctionExpression(p.initializer) && !p.initializer.name && thisNodes(p.initializer).length > 0;
        if (ts.isPropertyAssignment(p)) return `Pair(${kotlinString(literalKey(p.name, this.checker) ?? p.name.getText())}, ${method ? this.untypedMethod(p.initializer as unknown as ts.MethodDeclaration) : ts.isObjectLiteralExpression(p.initializer) ? this.dynamicObject(p.initializer) : this.stored(p.initializer, p, 'Any?')})`;
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
      if (ts.isPropertyAssignment(p)) return [`${o}[${key(p.name)}] = ${this.stored(p.initializer, p, 'Any?')}`];
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

  /**
   * Library mode: a function script calls with a `this` of its choosing (`fn.call(view, value)`, a property descriptor's
   * `set`) that core holds in a function-typed field (`Property.set`): a JSMethod, which takes the receiver.
   */
  private takesOwnThis(d: ts.Declaration | undefined): boolean {
    return !!d && (ts.isFunctionTypeNode(d) || ts.isFunctionExpression(d)) && d.parameters.some((q) => isThisParameter(q) && !!q.type && q.type.kind !== ts.SyntaxKind.VoidKeyword);
  }

  /**
   * A `signal<T>(null)` whose `T` must be typed `T?` to hold the null. An object type holds it unchecked
   * (`jsUncheckedNull`), as a non-strict app's other object slots do, so its reads stay `T`.
   */
  private holdingNull(t: string, n: ts.Node): boolean {
    return /^Signal<(String|Double|Boolean)>$/.test(t) && this.madeHoldingNull(n);
  }

  /** Whether `n` is, names or declares a `signal(null)` or `signal(undefined)`: code checked without strictNullChecks, whose type leaves the null out. */
  private madeHoldingNull(n: ts.Node): boolean {
    const declaration = (ts.isVariableDeclaration(n.parent) || ts.isPropertyDeclaration(n.parent)) && n.parent.name === n ? n.parent
      : ts.isIdentifier(n) || ts.isPropertyAccessExpression(n) ? this.resolve(ts.isPropertyAccessExpression(n) ? n.name : n)?.valueDeclaration : undefined;
    const made = ts.isCallExpression(n) ? n : declaration && (ts.isVariableDeclaration(declaration) || ts.isPropertyDeclaration(declaration)) ? declaration.initializer : undefined;
    if (!made || !ts.isCallExpression(made) || this.calleeName(made) !== 'signal' || !this.resolve(made.expression)?.declarations?.[0]?.getSourceFile().isDeclarationFile) return false;
    const value = made.arguments[0];
    return !!value && (value.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(value) && value.text === 'undefined'));
  }

  /** A variable declared without a type whose value is a read of a signal holding null (`const card = this.morning()`). */
  private givenNullSignalValue(n: ts.Node): boolean {
    const d = ts.isVariableDeclaration(n) ? n : ts.isIdentifier(n) ? (ts.isVariableDeclaration(n.parent) && n.parent.name === n ? n.parent : this.resolve(n)?.valueDeclaration) : undefined;
    if (!d || !ts.isVariableDeclaration(d) || d.type || !d.initializer) return false;
    const read = ts.skipOuterExpressions(d.initializer, ts.OuterExpressionKinds.Parentheses);
    return ts.isCallExpression(read) && !read.arguments.length && /^Signal<.*\?>$/.test(this.typeOf(read.expression));
  }

  /** The constructor being written's statements that make keys the walk predicts: what runs before and after each (`initKeyNotes`). */
  private keyNotes: Map<ts.Statement, { before: string; after: string }> | null = null;
  private shapeFactSet: ShapeFacts | null = null;

  /** How this backend writes a class, which the key plans ask (shapes.ts). */
  private shapeFacts(): ShapeFacts {
    return this.shapeFactSet ??= {
      defines: !this.assignFields,
      byName: (c) => !(ts.getDecorators(c) ?? []).some((d) => d.expression.getText().startsWith('Component')) && !this.components.has(c.name!.text) && !this.patterns.mixinTarget(c) && !(!this.library && !!this.collectionAlias(c))
        && !((ts.getDecorators(c) ?? []).some((d) => d.expression.getText().startsWith('Injectable')) && !this.isBasedService(c)),
      kitBased: (c) => !ERRORS[c.heritageClauses!.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)!.types[0].expression.getText()] && !!this.kitRootOf(c),
      kitHeld: (c, m) => {
        const kitRoot = this.kitRootOf(c);
        return !!this.kitRedeclared(m) || (!!kitRoot && !!this.core?.isKitView(kitRoot) && !!this.properties?.isRegistered(c, m.name.getText()));
      },
      expando: (c) => this.givenUndeclared().has(c),
      held: heldOf,
      typeOf: (e) => this.typeOf(e),
    };
  }

  /** An app class's key plan, or null where its keys are its declared fields. */
  private keyPlan(cls: ts.ClassLikeDeclaration): ShapePlan | null {
    const plan = this.classPlan(cls);
    return plan?.keyed ? plan : null;
  }

  /** An app class's plan, keyed or not: its fields' null states. */
  private classPlan(cls: ts.ClassLikeDeclaration): ShapePlan | null {
    return shapePlanOfClass(cls, this.states, this.shapeFacts());
  }

  /** The test of whether a key made now must be noted, as the plans' order no longer places it. */
  private keysNoted(plan: ShapePlan): string {
    return plan.noted === 'keys' ? 'jsKeysNoted' : 'jsOrder != null';
  }

  /** A flagged field's setter, which notes its key when a write makes it. */
  private keySetter(cls: ts.ClassLikeDeclaration, n: string): string[] {
    const p = this.keyPlan(cls);
    if (!p?.flagged.has(n) || !p.ordered) return [];
    // A subclass's field made by its base's constructor (a method it overrides) goes before the keys of the subclass's own
    // level, which its static place is after.
    const early = p.depth > 0 && p.gated ? `, early = jsLevel < ${p.depth}` : '';
    return [`        set(value) { field = value; if (!__has_${n}) { __has_${n} = true; jsKeyMade(${kotlinString(n)}${early}) } }`];
  }

  /** A keyed class's keys for `dynamicMembers`, declaring the state they read: its flags, and in the root `jsOrder` and `jsLevel`. */
  private keyedMembers(cls: ts.ClassLikeDeclaration, appBase: boolean, lines: string[], supertypes: string[]): KeyedMembers | null {
    const p = this.keyPlan(cls);
    if (!p) return null;
    const { ordered, gated } = p;
    const written = (n: string) => keyOf(p, n)?.presence === 'written';
    if (ordered) {
      for (const n of p.flagged) lines.push(`    var __has_${n} = ${!written(n)}`);
      if (!appBase) {
        lines.push('    override var jsOrder: List<String>? = null');
        if (gated) lines.push('    var jsLevel = 0');
        if (p.expando) lines.push('    override val jsAddedKeys: List<String> get() = jsExpando?.jsKeys ?: listOf()');
        supertypes.push('JSKeyOrdered');
      }
    }
    const gate = gated && p.depth > 0 ? `jsLevel >= ${p.depth}` : '';
    const present = (n: string) => [written(n) ? '' : gate, p.flagged.has(n) ? `__has_${n}` : ''].filter(Boolean).join(' && ') || null;
    return { order: p.keys.map((k) => k.name), present, ordered, appBase };
  }

  /**
   * The statements of a constructor whose writes the walk predicts (`classKeyPlan`): a flagged field's flag is set before,
   * so its setter notes nothing, and below a base, whose constructor may have made keys out of order, the key goes last
   * after. Every other write makes its key through the setter.
   */
  private initKeyNotes(cls: ts.ClassLikeDeclaration): Map<ts.Statement, { before: string; after: string }> {
    const notes = new Map<ts.Statement, { before: string; after: string }>();
    const p = this.keyPlan(cls);
    if (!p?.ordered) return notes;
    const based = !!cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
    for (const [x, w] of p.walked) {
      const flagged = p.flagged.has(w.field);
      if (!flagged && !(w.first && based)) continue;
      const made = `__made${this.tmp++}`;
      const before = !flagged ? '' : based ? `val ${made} = !__has_${w.field}; __has_${w.field} = true` : `__has_${w.field} = true`;
      const after = based ? `if (${flagged ? `${made} && ` : ''}${this.keysNoted(p)}) jsKeyMade(${kotlinString(w.field)})` : '';
      notes.set(x.parent as ts.Statement, { before, after });
    }
    return notes;
  }

  /** A subclass's start of its level of the constructor: its keys from there on (`jsLevel`), and its keys made now. */
  private levelStart(cls: ts.ClassLikeDeclaration): string[] {
    const p = this.keyPlan(cls);
    if (!p || p.depth === 0 || !p.gated) return [];
    const now = p.keys.filter((k) => k.presence === 'always').map((k) => k.name);
    return [`        jsLevel = ${p.depth}`, ...(now.length ? [`        if (${this.keysNoted(p)}) { ${now.map((n) => `jsKeyMade(${kotlinString(n)})`).join('; ')} }`] : [])];
  }

  private programBase(cls: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | undefined {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  }

  private heldSignalVisits = new Set<ts.Node>();

  /**
   * A field declared a read-only `Signal<T>` (a value here) that its class gives a signal (`this.morning = s.morning`):
   * that signal's type, so reads follow it.
   */
  private heldSignal(n: ts.Node): string | null {
    if (this.library) return null;
    const named = ts.isPropertyAccessExpression(n) || ts.isPropertyDeclaration(n) ? n.name : n;
    const d = ts.isIdentifier(named) || ts.isPrivateIdentifier(named) ? this.checker.getSymbolAtLocation(named)?.valueDeclaration : undefined;
    if (!d || !ts.isPropertyDeclaration(d) || !d.type || !ts.isTypeReferenceNode(d.type) || d.type.typeName.getText() !== 'Signal' || this.heldSignalVisits.has(d)) return null;
    this.heldSignalVisits.add(d);
    try {
      for (const v of assignedValues(d)) { const t = this.typeOf(v); if (t.startsWith('Signal<')) return t; }
      return null;
    } finally { this.heldSignalVisits.delete(d); }
  }

  /** A function expression reading a `this` it does not declare, where it is given to a function type declaring one. */
  private givenThis(fn: ts.FunctionExpression): boolean {
    return thisNodes(fn).length > 0 && this.takesOwnThis(this.checker.getContextualType(fn)?.getCallSignatures()[0]?.getDeclaration());
  }

  private thisMethod(fn: ts.FunctionExpression): string {
    const self = fn.parameters.find((q) => isThisParameter(q) && (this.library ? !this.voidThis(q) : this.takesOwnThis(fn)));
    const params = fn.parameters.filter((q) => !isThisParameter(q));
    const ret = this.returnTypeOf(fn);
    // A string, number or boolean the body reads as one (`switch (value)`): its type's, as a missing argument reads.
    const bound = (q: ts.ParameterDeclaration) => (['String', 'Double', 'Boolean'].includes(this.typeOf(q.name)) ? this.typeOf(q.name) : this.paramType(q));
    const binds = params.map((q, k) => `val ${ident((q.name as ts.Identifier).text)}: ${bound(q)} = ${q.dotDotDotToken
      ? `JSArray(__a.drop(${k}).map { ${this.fromAnyCode('it', this.typeOf(q.name).replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
      : this.fromAnyCode(pure(`__a.getOrNull(${k})`), bound(q), true)}`);
    const thisType = self ? this.type(this.checker.getTypeAtLocation(self.name), self) : 'Any?';
    if (thisType !== 'Any?') binds.unshift(`val __this: ${thisType} = (__self as ${thisType})`);
    else binds.unshift('val __this: Any? = __self');
    const body = this.withThis(fn, '__this', thisType === 'Any?', () => this.functionBody(fn, ret, this.indent));
    return `JSMethod ${lambda(['__self', '__a'], `${binds.map((b) => b + '; ').join('')}(fun()${ret === 'Unit' ? '' : `: ${ret}`} ${body})()`)}`;
  }

  /**
   * Library mode: a function declared to give `T | null` (`notifyLaunch(): View | null`), which callers test with `=== null`
   * apart from undefined: untyped, holding JavaScript's null apart from undefined, as Kotlin's null is only one of them.
   */
  /** Library mode: a function declared to return `string | null` (or a number or boolean): null kept, as callers test for it. */
  private nullablePrimitiveReturn(fn: ts.Node | undefined): boolean {
    if (!fn || !(ts.isMethodDeclaration(fn) || ts.isFunctionDeclaration(fn) || ts.isGetAccessorDeclaration(fn)) || fn.getSourceFile().isDeclarationFile || !fn.type) return false;
    // An abstract method's declared union says what its overrides give.
    if (!fn.body && !ts.isUnionTypeNode(fn.type)) return false;
    // `getString(key, defaultValue?: string): string` returning the default it may not be given: undefined then.
    if (fn.type.kind === ts.SyntaxKind.StringKeyword) {
      const optional = new Set(fn.parameters.filter((p) => p.questionToken && !p.initializer && ts.isIdentifier(p.name)).map((p) => this.checker.getSymbolAtLocation(p.name)));
      let found = false;
      const visit = (n: ts.Node): void => {
        if (found || (ts.isFunctionLike(n) && n !== fn)) return;
        if (ts.isReturnStatement(n) && n.expression && ts.isIdentifier(n.expression) && optional.has(this.checker.getSymbolAtLocation(n.expression))) found = true;
        else ts.forEachChild(n, visit);
      };
      if (optional.size) ts.forEachChild(fn.body, visit);
      return found;
    }
    // `isA11yEnabled(): boolean` that says `return undefined` while it knows nothing yet. Not a method, whose
    // overrides and supers must keep one return type.
    if (fn.type.kind === ts.SyntaxKind.BooleanKeyword || fn.type.kind === ts.SyntaxKind.NumberKeyword) return (ts.isFunctionDeclaration(fn) || this.onlyMethodOfName(fn)) && returnsNull(fn.body);
    if (!ts.isUnionTypeNode(fn.type)) return false;
    const missing = (x: ts.TypeNode) => (ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword) || x.kind === ts.SyntaxKind.UndefinedKeyword;
    const rest = fn.type.types.filter((x) => !missing(x));
    // `'dark' | 'light' | null`: the literals' primitive, as one keyword would be.
    const kind = (x: ts.TypeNode) => !ts.isLiteralTypeNode(x) ? x.kind : ts.isStringLiteral(x.literal) ? ts.SyntaxKind.StringKeyword : ts.isNumericLiteral(x.literal) ? ts.SyntaxKind.NumberKeyword
      : x.literal.kind === ts.SyntaxKind.TrueKeyword || x.literal.kind === ts.SyntaxKind.FalseKeyword ? ts.SyntaxKind.BooleanKeyword : x.kind;
    const kinds = new Set(rest.map(kind));
    return rest.length < fn.type.types.length && kinds.size === 1 && [ts.SyntaxKind.StringKeyword, ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.BooleanKeyword].includes([...kinds][0]);
  }

  private returnsNullApart(fn: ts.SignatureDeclaration): boolean {
    if (!(ts.isMethodDeclaration(fn) || ts.isFunctionDeclaration(fn)) || !fn.body || fn.getSourceFile().isDeclarationFile || !fn.type || !ts.isUnionTypeNode(fn.type)) return false;
    const parts = fn.type.types;
    return parts.some((x) => ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword) && parts.every((x) => (ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword) || (ts.isTypeReferenceNode(x) && ts.isIdentifier(x.typeName)));
  }

  private untypedJavaFieldSet: Set<ts.Node> | null = null;
  /**
   * Library mode: fields of a Java class that code also gives an object of an unrelated Java class, asserted
   * (`this._simpleGestureDetector = <any>new GestureDetectorCompat(…)` of a `GestureDetector` field): untyped, their
   * methods found on the object when called, as NativeScript's runtime finds them.
   */
  private untypedJavaFields(): Set<ts.Node> {
    if (this.untypedJavaFieldSet) return this.untypedJavaFieldSet;
    const out = new Set<ts.Node>();
    this.untypedJavaFieldSet = out;
    const shared = this.native && 'sharedClassType' in this.native ? (parts: ts.Type[]) => (this.native as unknown as { sharedClassType(parts: ts.Type[]): string | null }).sharedClassType(parts) : null;
    if (!this.library || !shared) return out;
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const visit = (n: ts.Node): void => {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left)) {
          let right = n.right;
          while (ts.isBinaryExpression(right) && right.operatorToken.kind === ts.SyntaxKind.EqualsToken) right = right.right;
          while (ts.isParenthesizedExpression(right)) right = right.expression;
          const d = this.checker.getSymbolAtLocation(n.left.name)?.valueDeclaration;
          if (d && ts.isPropertyDeclaration(d) && !d.getSourceFile().isDeclarationFile && (ts.isAsExpression(right) || ts.isTypeAssertionExpression(right)) && right.type.kind === ts.SyntaxKind.AnyKeyword) {
            const declared = this.checker.getTypeAtLocation(d.name);
            const own = shared([declared]);
            const given = this.checker.getTypeAtLocation(right.expression);
            if (own && shared([given]) && shared([declared, given]) !== own) out.add(d);
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    return out;
  }

  /** `view['title'] as string`: a primitive asserted of an untyped object's member, which may be missing. */
  private untypedAssertion(e: ts.Expression): boolean {
    if (!ts.isAsExpression(e) && !ts.isTypeAssertionExpression(e)) return false;
    let inner = e.expression;
    while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
    return (ts.isPropertyAccessExpression(inner) || ts.isElementAccessExpression(inner)) && !inner.questionDotToken && this.typeOf(inner.expression) === 'Any?'
      && ['String', 'Double', 'Boolean'].includes(this.typeOf(e));
  }

  /** A constant's initializer call, where the constant holds what the call gives (`const root = this.notifyLaunch()`). */
  private untypedInitializer(n: ts.Identifier): ts.CallExpression | undefined {
    const d = this.checker.getSymbolAtLocation(n)?.valueDeclaration;
    return d && ts.isVariableDeclaration(d) && !d.type && d.initializer && ts.isCallExpression(d.initializer) && d.parent.flags & ts.NodeFlags.Const ? d.initializer : undefined;
  }

  /** Whether a read is of a value `thisValues` holds untyped: such a field or variable, or a call giving one. */
  private isThisValue(n: ts.Node): boolean {
    const { symbols, returning, functions } = this.thisValues();
    if (!symbols.size && !functions.size) return false;
    if (ts.isFunctionExpression(n)) return functions.has(n);
    if (ts.isCallExpression(n)) {
      const callee = ts.isIdentifier(n.expression) ? this.checker.getSymbolAtLocation(n.expression) : undefined;
      return !!callee && symbols.has(declOf(callee)!) || [...(callee?.declarations ?? [])].some((d) => returning.has(d) || (ts.isVariableDeclaration(d) && !!d.initializer && returning.has(d.initializer)));
    }
    const sym = ts.isIdentifier(n) ? this.checker.getSymbolAtLocation(n) : ts.isPropertyAccessExpression(n) ? this.checker.getSymbolAtLocation(n.name) : undefined;
    // A member of a union of classes is each class's.
    return !!sym && (symbols.has(declOf(sym)) || !!sym.declarations?.some((d) => symbols.has(d)));
  }

  private thisValueSets: { symbols: Set<ts.Node | undefined>; functions: Set<ts.Node>; returning: Set<ts.Node> } | null = null;
  /**
   * Library mode: function-typed fields given functions that take a `this` their declared type omits (`this.set =
   * function (this: T, value) { … }`), with the variables and functions those values pass through. Each is untyped in
   * Kotlin, holding a JSMethod.
   */
  private thisValues(): { symbols: Set<ts.Node | undefined>; functions: Set<ts.Node>; returning: Set<ts.Node> } {
    if (this.thisValueSets) return this.thisValueSets;
    const sets = { symbols: new Set<ts.Node | undefined>(), functions: new Set<ts.Node>(), returning: new Set<ts.Node>() };
    this.thisValueSets = sets;
    if (!this.library) return sets;
    const c = this.checker;
    // By declaration: a generic class's member read through `this` is a symbol of its own.
    const assigned = new Map<ts.Node, ts.Expression[]>();
    const fields: ts.Node[] = [];
    const prototypeValues: ts.Expression[] = [];
    const symbolOf = (e: ts.Node) => declOf(ts.isIdentifier(e) ? c.getSymbolAtLocation(e) : ts.isPropertyAccessExpression(e) ? c.getSymbolAtLocation(e.name) : undefined);
    const add = (d: ts.Node | undefined, e: ts.Expression) => { if (d) (assigned.get(d) ?? assigned.set(d, []).get(d)!).push(e); };
    for (const sf of this.sourceFiles) {
      if (sf.isDeclarationFile) continue;
      const visit = (n: ts.Node): void => {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) add(symbolOf(n.left), n.right);
        // A prototype's method given as a value (`View.prototype[prop.setNative] = makeNativeSetter(…)`), called with the instance as `this`.
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isElementAccessExpression(n.left) || ts.isPropertyAccessExpression(n.left)) && ts.isPropertyAccessExpression(n.left.expression) && n.left.expression.name.text === 'prototype') prototypeValues.push(n.right);
        if (ts.isVariableDeclaration(n) && n.initializer && ts.isIdentifier(n.name)) add(n, n.initializer);
        if (ts.isPropertyDeclaration(n) && !isStatic(n) && ts.isClassLike(n.parent) && c.getTypeAtLocation(n.name).getCallSignatures().length) fields.push(n);
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    const known = new Map<ts.Node, boolean>();
    const returnsOf = (f: ts.FunctionLikeDeclaration): ts.Expression[] => {
      if (!f.body) return [];
      if (!ts.isBlock(f.body)) return [f.body];
      const out: ts.Expression[] = [];
      const visit = (n: ts.Node): void => {
        if (ts.isReturnStatement(n) && n.expression) out.push(n.expression);
        if (!ts.isFunctionLike(n)) ts.forEachChild(n, visit);
      };
      ts.forEachChild(f.body, visit);
      return out;
    };
    const binds = (e: ts.Expression): boolean => {
      while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
      const seen = known.get(e);
      if (seen !== undefined) return seen;
      known.set(e, false);
      const result = bindsOnce(e);
      known.set(e, result);
      return result;
    };
    const bindsOnce = (e: ts.Expression): boolean => {
      if (ts.isFunctionExpression(e)) {
        const takes = e.parameters.some((q) => isThisParameter(q) && !this.voidThis(q)) || thisNodes(e).length > 0;
        if (takes) sets.functions.add(e);
        return takes;
      }
      if (ts.isConditionalExpression(e)) return [binds(e.whenTrue), binds(e.whenFalse)].some(Boolean);
      if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) {
        const sym = c.getSymbolAtLocation(e.expression);
        const d = sym?.valueDeclaration;
        const f = d && ts.isFunctionDeclaration(d) ? d : d && ts.isVariableDeclaration(d) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) ? d.initializer : undefined;
        if (!f || f.getSourceFile().isDeclarationFile) return false;
        const gives = returnsOf(f).map(binds).some(Boolean);
        if (gives) { sets.returning.add(f); if (d && ts.isVariableDeclaration(d)) sets.symbols.add(d); }
        return gives;
      }
      const sym = ts.isIdentifier(e) || ts.isPropertyAccessExpression(e) ? symbolOf(e) : undefined;
      if (!sym) return false;
      if (sets.symbols.has(sym)) return true;
      const gives = (assigned.get(sym) ?? []).map(binds).some(Boolean);
      if (gives) sets.symbols.add(sym);
      return gives;
    };
    for (const f of fields) if ((assigned.get(f) ?? []).map(binds).some(Boolean)) sets.symbols.add(f);
    for (const v of prototypeValues) binds(v);
    // A library method held as a value (`const toString = {}.toString`), which script calls with `.call(x)`.
    for (const [d, values] of assigned) {
      if (!ts.isVariableDeclaration(d)) continue;
      if (values.some((v) => {
        while (ts.isParenthesizedExpression(v)) v = v.expression;
        const sym = ts.isPropertyAccessExpression(v) ? c.getSymbolAtLocation(v.name) : undefined;
        return !!sym && !!(sym.flags & ts.SymbolFlags.Method) && isLibDeclaration(sym.declarations?.[0]);
      })) sets.symbols.add(d);
    }
    // What reads one of them (`const setBase = this.set`) holds it as well.
    for (let grew = true; grew; ) {
      grew = false;
      for (const [sym, values] of assigned) {
        if (sets.symbols.has(sym) || sym.getSourceFile().isDeclarationFile) continue;
        if (values.some((v) => { const s = symbolOf(v); return !!s && sets.symbols.has(s); })) { sets.symbols.add(sym); grew = true; }
      }
    }
    return sets;
  }

  /** A method of an untyped object literal: a function value, or one taking `this` when its body reads it. */
  private untypedMethod(p: ts.MethodDeclaration): string {
    const rest = p.parameters.some((q) => q.dotDotDotToken);
    if (!thisNodes(p).length && !rest) {
      // Called untyped (an options object's `valueChanged`), with undefined where a number, string or boolean goes, and
      // an app's object, or null where it may be one, as the script value it is.
      const types = p.parameters.map((q) => this.paramType(q));
      const kit = this.library || this.pluginFiles.has(p.getSourceFile().fileName);
      const converted = (t: string) => (kit ? ['Double', 'Boolean', 'String'].includes(t) : t !== 'Any?' && (this.isObjectType(t) || /^(Double|Boolean|String)\?$/.test(t)) && !isFunctionType(t));
      if (!types.some(converted) || p.parameters.some((q) => isThisParameter(q) || !ts.isIdentifier(q.name))) return this.closure(p);
      const ret = this.returnTypeOf(p);
      const names = types.map((_, k) => pure(`__u${k}`));
      const call = `__f(${types.map((t, k) => (t === 'Any?' ? names[k] : this.fromAnyCode(names[k], t, true))).join(', ')})`;
      return `run { val __f = ${this.closure(p, `(${types.join(', ')}) -> ${ret}`)}; { ${names.map((n) => `${n}: Any?`).join(', ')} -> ${ret === 'Unit' ? `${call}; Unit` : call} } }`;
    }
    const ret = this.returnTypeOf(p);
    const binds = p.parameters.filter((q) => !isThisParameter(q)).map((q, k) => `val ${ident((q.name as ts.Identifier).text)}: ${this.typeOf(q.name)} = ${q.dotDotDotToken
      ? `JSArray(__a.drop(${k}).map { ${this.fromAnyCode('it', this.typeOf(q.name).replace(/^JSArray<(.*)>$/, '$1'), true)} }.toMutableList())`
      : this.fromAnyCode(pure(`__a.getOrNull(${k})`), this.typeOf(q.name), true)}`);
    const body = this.withThis(p, '__this', true, () => this.functionBody(p, ret, this.indent));
    return `JSMethod ${lambda(['__this', '__a'], `${binds.map((b) => b + '; ').join('')}(fun()${ret === 'Unit' ? '' : `: ${ret}`} ${body})()`)}`;
  }

  /** A function of the program called with untyped arguments (`fn.length` its required parameters), each read as it types it. */
  private untypedFunction(decl: ts.FunctionDeclaration, name: string): string {
    // A generic function's type parameters are whatever script passes.
    const generic = decl.typeParameters?.length ? `<${decl.typeParameters.map((p) => (!this.library && this.classConstraint(p) ? this.type(this.checker.getTypeFromTypeNode(p.constraint!), p).replace(/\?$/, '') : 'Any?')).join(', ')}>` : '';
    const args = decl.parameters.map((q, k) => generic ? `jsUnchecked(__a.getOrNull(${k}))` : this.fromAnyCode(pure(`__a.getOrNull(${k})`), this.paramType(q), true));
    const arity = decl.parameters.findIndex((q) => !!q.questionToken || !!q.initializer);
    if (this.implicitThis(decl)) return `JSMethod(${arity < 0 ? decl.parameters.length : arity}) ${lambda(['__self', '__a'], `${name}${generic}(${['__self', ...args].join(', ')})${this.returnTypeOf(decl) === 'Unit' ? '; null' : ''}`)}`;
    const call = `${name}${generic}(${args.join(', ')})`;
    // The function's own reference keys what script sets on it, as each wrapper is made where it is read.
    const original = generic ? undefined : /^\((\S*::[\w`]+)\)$/.exec(name)?.[1] ?? /^(?:([\w`.]+)\.)?([\w`]+)$/.exec(name)?.slice(1).map((x) => x ?? '').join('::');
    return `jsFunction(${arity < 0 ? decl.parameters.length : arity}${original ? `, ${original}` : ''}) ${lambda(['__a'], this.returnTypeOf(decl) === 'Unit' ? `${call}; null` : call)}`;
  }

  /** A module's exports as script's namespace object holds them: functions callable with untyped arguments, variables as they are now, classes. */
  private moduleValue(at: ts.Identifier, mod: ts.Symbol): string {
    const entries: string[] = [];
    for (const ex of this.checker.getExportsOfModule(mod)) {
      const target = ex.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(ex) : ex;
      const decl = target.valueDeclaration;
      if (!decl || decl.getSourceFile().isDeclarationFile) continue;
      const name = () => this.qualifiedDecl(decl, target.name) ?? this.unshadowed(at, decl, ident(this.topName(decl, target.name)));
      let value: string;
      if (ts.isFunctionDeclaration(decl) && decl.body && !decl.parameters.some((q) => q.dotDotDotToken || isThisParameter(q))) value = this.untypedFunction(decl, name()); else if (ts.isVariableDeclaration(decl)) value = this.convert(name(), this.declaredTypeOf(decl.name as ts.Identifier) ?? this.typeOf(decl.name as ts.Identifier), 'Any?');
      else if (ts.isClassDeclaration(decl) && decl.name) value = `${this.className(decl)}::class.java`;
      else continue;
      entries.push(`Pair(${kotlinString(ex.name)}, ${value})`);
    }
    return `JSObject(listOf<Pair<String, Any?>>(${entries.join(', ')}))`;
  }

  /** An error the translation of `n` failed with, at `n` unless it says where already. */
  private located(e: unknown, n: ts.Node): unknown {
    if (!(e instanceof Error) || /^\/[^:]+:\d+:\d+: /.test(e.message)) return e;
    if (process.env.NS_NATIVE_STACKS) console.error(e.stack?.split('\n').filter((l) => !l.includes('typescript.js')).slice(0, 80).join('\n'));
    return Object.assign(this.error(n, `what fails translating with "${e.message.split('\n')[0]}"`), { cause: e });
  }

  error(n: ts.Node | undefined, what: string): Error {
    if (!n) return new Error(`${what} is not supported in a release build yet`);
    const sf = n.getSourceFile();
    const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
    return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${what} is not supported in a release build yet: ${n.getText().slice(0, 80)}`);
  }
}

/** Kotlin's spelling of what the async lowering writes. */
const KOTLIN_SYNTAX: Omit<AsyncSyntax, 'unwrap'> = {
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
  makeIterator: (name, seq) => `val ${name} = (${seq}).iterator()`,
  nextItem: (item, iterator, otherwise, i) => [`${i}if (!${iterator}.hasNext()) { ${otherwise} }`, `${i}val ${item} = ${iterator}.next()`],
  awaitCall: (operand, isPromise, continuation, onError) => `${isPromise ? 'jsAwait' : 'jsAwaitValue'}(${operand}, ${continuation}, ${onError})`,
  asyncStart: (cap, result) => `val ${cap} = JSAsync<${result}>()`,
  asyncBody: (cap) => [`${cap}.body(fun() {`, '})'],
  asyncReturn: (cap, value, isPromise, result) => (value === null ? `${cap}.returnValue(${result === 'Unit' ? 'Unit' : isNullable(result) || ['String', 'Double', 'Boolean'].includes(result) ? 'null' : `jsUncheckedNull<${result}>()`})` : `${cap}.${isPromise ? 'returnPromise' : 'returnValue'}(${value})`),
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

/** A symbol's declaration, the same for every instantiation of a generic class's member. */
function declOf(sym: ts.Symbol | undefined): ts.Node | undefined {
  return sym?.valueDeclaration ?? sym?.declarations?.[0];
}

/** Whether a function body returns `null` or `undefined` itself, outside the functions it declares. */
/** `null`, `undefined`, or a conditional with either as a branch. */
function givesNull(e: ts.Expression): boolean {
  e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return true;
  return ts.isConditionalExpression(e) && (givesNull(e.whenTrue) || givesNull(e.whenFalse));
}

function returnsNull(body: ts.Node): boolean {
  const visit = (n: ts.Node): boolean => {
    if (ts.isFunctionLike(n)) return false;
    if (ts.isReturnStatement(n) && n.expression && givesNull(n.expression)) return true;
    return !!ts.forEachChild(n, visit);
  };
  return !!ts.forEachChild(body, visit);
}

/** A field of an object literal's class; an accessor runs functions the literal gives. */
/** An app class's keys in `dynamicMembers`: in plan order, each present by `present` (null: always). */
/** A call's parameters as `args` reads them: the signature it resolves to, an overload's implementation, and whether the program declares them. */
interface CallParams { sig: ts.Signature | undefined; impl: ts.FunctionLikeDeclaration | null | undefined; params: ts.Symbol[]; appDeclared: boolean }
interface KeyedMembers { order: string[]; present: (name: string) => string | null; ordered: boolean; appBase: boolean }
/** The key state `dynamicMembers` spells: a class's from its plan, a shape class's from its fields. */
interface MemberKeys {
  /** Each field's null state; a field it lacks is `none`. */
  nulls?: ReadonlyMap<string, Nulls>;
  keyed?: KeyedMembers | null;
  /** Fields written through to their source once a null is noted (`jsWriteThrough`). */
  rewritten?: ReadonlySet<string>;
  /** Fields `Object.defineProperty` may give a descriptor (`JSDefinable`). */
  defined?: ReadonlySet<string>;
  /** Keys script adds are kept in the object's expando. */
  expando?: boolean;
  /** A program base keeps the object's expando, whose keys come after every class's fields, as JavaScript defines fields before script adds keys. */
  expandoAbove?: boolean;
  /** Keys beyond the shape's are kept in `jsExtra`. */
  extra?: boolean;
}
/** What `dynamicMembers` reads and writes by name besides the keys' state. */
interface DynamicMembers {
  fields: { name: string; type: string; at?: ts.PropertyDeclaration }[];
  className: string | null;
  /** Below a class that has these members: its keys come first and its members take the rest. */
  inherits?: boolean;
  symbols?: { key: string; member: string; type: string }[];
  methods?: { name: string; key?: string; params: string[]; ret: string }[];
  accessors?: { name: string; type: string; readable: boolean; settable: boolean; set?: string }[];
  /** The base whose `jsHasMember` takes the rest. */
  superclass?: string;
  /** An app class's methods see the object they are called on as `this` when it is one of this class's. */
  receiver?: string;
}
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

/** Math's one-argument functions, as Kotlin calls them. */
const MATH_UNARY: Record<string, string> = {
  floor: 'Math.floor', ceil: 'Math.ceil', abs: 'Math.abs', sqrt: 'Math.sqrt', cbrt: 'Math.cbrt', trunc: 'jsTrunc',
  sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos', atan: 'Math.atan',
  exp: 'Math.exp', log: 'Math.log', log2: 'jsLog2', log10: 'Math.log10', log1p: 'Math.log1p', expm1: 'Math.expm1',
  sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround', clz32: 'jsClz32',
};

const LIB_CONSTANTS: Record<string, string> = {
  'Math.PI': 'Math.PI', 'Math.E': 'Math.E', 'Math.LN2': '0.6931471805599453', 'Math.LN10': '2.302585092994046', 'Math.LOG2E': '1.4426950408889634', 'Math.LOG10E': '0.4342944819032518', 'Math.SQRT2': '1.4142135623730951', 'Math.SQRT1_2': '0.7071067811865476',
  'Number.MAX_SAFE_INTEGER': '9007199254740991.0', 'Number.MIN_SAFE_INTEGER': '-9007199254740991.0', 'Number.EPSILON': 'Math.ulp(1.0)',
  'Number.MAX_VALUE': 'Double.MAX_VALUE', 'Number.MIN_VALUE': 'Double.MIN_VALUE', 'Number.POSITIVE_INFINITY': 'Double.POSITIVE_INFINITY',
  'Number.NEGATIVE_INFINITY': 'Double.NEGATIVE_INFINITY', 'Number.NaN': 'Double.NaN',
  'Symbol.iterator': 'JSSymbol.iterator', 'Symbol.asyncIterator': 'JSSymbol.asyncIterator', 'Symbol.toPrimitive': 'JSSymbol.toPrimitive',
  'Symbol.toStringTag': 'JSSymbol.toStringTag', 'Symbol.hasInstance': 'JSSymbol.hasInstance', 'Object.prototype': 'JSPrototypes.objectPrototype',
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
  return pure(/[.e]/.test(s) ? s : `${s}.0`);
}

function superAt(ctor: ts.ConstructorDeclaration): ts.CallExpression | null {
  for (const s of ctor.body?.statements ?? []) {
    if (ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword) return s.expression;
  }
  return null;
}

/** The name a parameter, variable or field declares. */
function isDeclarationName(n: ts.Node | undefined): boolean {
  const d = n?.parent;
  return !!d && (ts.isParameter(d) || ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d) || ts.isPropertySignature(d)) && d.name === n;
}

/** A function's `this: T` parameter, which only TypeScript sees. */
function isThisParameter(p: ts.ParameterDeclaration): boolean {
  return ts.isIdentifier(p.name) && p.name.text === 'this';
}

function isWriteTarget(e: ts.Node): boolean {
  const p = e.parent;
  if (ts.isBinaryExpression(p) && p.left === e && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
  if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) return true;
  return inAssignmentPattern(e);
}

/**
 * Whether a literal is (or is nested in) the value a destructuring declaration or assignment destructures: typed as its
 * own, since the pattern's implied type would drop what a rest element takes (`({ a, ...rest } = { a: 1, b: 2 })`).
 */
function destructuringSource(e: ts.Expression): boolean {
  let n: ts.Node = e;
  for (;;) {
    const p = n.parent;
    if (ts.isParenthesizedExpression(p) || ts.isArrayLiteralExpression(p)) n = p;
    else if (ts.isPropertyAssignment(p) && p.initializer === n) n = p.parent;
    else return (ts.isBinaryExpression(p) && p.right === n && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isArrayLiteralExpression(ts.skipOuterExpressions(p.left)) || ts.isObjectLiteralExpression(ts.skipOuterExpressions(p.left))))
      || (ts.isVariableDeclaration(p) && p.initializer === n && ts.isBindingPattern(p.name));
  }
}

/** Whether a node is a target inside a destructuring assignment's pattern (`[o.a, arr[0]] = …`, `for ({ x } of …)`). */
function inAssignmentPattern(e: ts.Node): boolean {
  let n = e;
  let inside = false;
  for (;;) {
    const p = n.parent;
    if (ts.isParenthesizedExpression(p) || ts.isSpreadElement(p) || ts.isSpreadAssignment(p)) n = p;
    else if ((ts.isPropertyAssignment(p) && p.initializer === n) || ts.isShorthandPropertyAssignment(p)) { n = p.parent; inside = true; }
    else if (ts.isArrayLiteralExpression(p)) { n = p; inside = true; }
    else if (ts.isBinaryExpression(p) && p.left === n && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isArrayLiteralExpression(p.parent) || ts.isPropertyAssignment(p.parent))) n = p;
    else return inside && ((ts.isBinaryExpression(p) && p.left === n && p.operatorToken.kind === ts.SyntaxKind.EqualsToken) || (ts.isForOfStatement(p) && p.initializer === n));
  }
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

/** Whether Kotlin code names `name` (a whole word, not part of another, nor a member of something else). */
export function mentions(code: string, name: string): boolean {
  return new RegExp(`(?<![\\w$\`.])${name.replace(/[$`]/g, '\\$&')}(?![\\w$\`])`).test(code);
}

/** Whether a `break` inside a loop leaves it: an unlabeled one not in a nested loop or switch, or one naming the loop's label. */
function breaksOut(loop: ts.IterationStatement): boolean {
  const label = ts.isLabeledStatement(loop.parent) ? loop.parent.label.text : null;
  let found = false;
  const visit = (n: ts.Node, nested: boolean) => {
    if (found || ts.isFunctionLike(n) || ts.isClassLike(n)) return;
    if (ts.isBreakStatement(n) && (n.label ? n.label.text === label : !nested)) { found = true; return; }
    const inner = nested || ts.isIterationStatement(n, false) || ts.isSwitchStatement(n);
    ts.forEachChild(n, (c) => visit(c, inner));
  };
  ts.forEachChild(loop, (c) => visit(c, false));
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

/**
 * `{ a, b -> body }`, a parameter the body doesn't use written `_`. A lone unused parameter is left out (`{ body }`)
 * unless the body names an outer `it`, which an implicit one would shadow.
 */
export function lambda(params: string[], body: string): string {
  const uses = (name: string) => new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(body);
  const written = params.map((p) => { const [name, type] = p.split(/:\s*(.*)/s); return uses(name.trim()) ? p : type ? `_: ${type}` : '_'; });
  if (params.length === 1 && written[0] === '_' && !uses('it')) return `{ ${body} }`;
  return `{ ${written.join(', ')} -> ${body} }`;
}

/** A type whose arguments Kotlin cannot check a cast against (`JSArray<View>`, `(String) -> Unit`): the JVM erases them. */
function erased(type: string): boolean {
  return /<|->/.test(type.replace(/<\*(, \*)*>/g, ''));
}

/**
 * Whether `target` is `source` with some of its generic types' arguments `Any?` (`Stream<any>` for `Stream<Event>`):
 * TypeScript's `any` takes any instantiation, Kotlin's invariant generics only by an unchecked cast.
 */
function anyArguments(source: string, target: string): boolean {
  let pattern = '', depth = 0;
  for (let i = 0; i < target.length; i++) {
    if (depth > 0 && target.startsWith('Any?', i) && /[<(,]\s*$/.test(target.slice(0, i)) && /^\s*[>),]/.test(target.slice(i + 4))) {
      pattern += '(.+?)';
      i += 3;
      continue;
    }
    if (target[i] === '<') depth++;
    else if (target[i] === '>' && target[i - 1] !== '-') depth--;
    pattern += target[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return pattern !== target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') && new RegExp(`^${pattern}$`).test(source);
}

/** `code as type`, through the runtime's reified jsAs where only the class can be checked. */
export function cast(code: string, type: string): string {
  // A type parameter (`T`) is checked nowhere: the value is taken as one.
  if (/^[A-Z]\??$/.test(type)) return `jsUnchecked<${type}>(${code})`;
  return erased(type) ? `jsAs<${type}>(${code})` : `(${code} as ${type})`;
}

/** `code as? type`, as cast. */
export function safeCast(code: string, type: string): string {
  return erased(type) ? `jsAsOrNull<${type.replace(/\?$/, '')}>(${code})` : `(${code} as? ${type})`;
}

/** What `typeof` gives of a value Kotlin holds as `type` (non-null), or null where the value decides it. */
function typeofName(type: string): string | null {
  if (type === 'Double') return 'number';
  if (type === 'String') return 'string';
  if (type === 'Boolean') return 'boolean';
  if (type === 'JSSymbol') return 'symbol';
  if (type === 'JSBigInt') return 'bigint';
  if (isFunctionType(type) || /^\(.*\) -> /.test(type)) return 'function';
  return type === 'Any' || /^[A-Z]$/.test(type) ? null : 'object';
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

/**
 * Whether code assigns to a symbol (`x = …`, `x += …`, `x++`). `truth`: what a condition always is, where the
 * translation leaves out the branch that never runs.
 */
function assignsTo(node: ts.Node, sym: ts.Symbol | undefined, checker: ts.TypeChecker, truth?: (e: ts.Expression) => boolean | undefined): boolean {
  if (!sym) return false;
  let found = false;
  // A name, or a destructuring pattern (`[a, b] = …`, `({ a } = …)`) naming it.
  const target = (x: ts.Node): boolean => {
    if (ts.isIdentifier(x)) return checker.getSymbolAtLocation(x) === sym;
    if (ts.isParenthesizedExpression(x) || ts.isSpreadElement(x) || ts.isSpreadAssignment(x)) return target(x.expression);
    if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken) return target(x.left);
    if (ts.isArrayLiteralExpression(x)) return x.elements.some(target);
    if (ts.isObjectLiteralExpression(x)) return x.properties.some((p) => (ts.isPropertyAssignment(p) ? target(p.initializer) : ts.isShorthandPropertyAssignment(p) ? checker.getShorthandAssignmentValueSymbol(p) === sym : ts.isSpreadAssignment(p) && target(p)));
    return false;
  };
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && target(n.left)) { found = true; return; }
    if ((ts.isForOfStatement(n) || ts.isForInStatement(n)) && !ts.isVariableDeclarationList(n.initializer) && target(n.initializer)) { found = true; return; }
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(n.operator) && target(n.operand)) { found = true; return; }
    const fixed = truth && ts.isIfStatement(n) ? truth(n.expression) : undefined;
    if (fixed !== undefined) {
      const live = fixed ? (n as ts.IfStatement).thenStatement : (n as ts.IfStatement).elseStatement;
      visit((n as ts.IfStatement).expression);
      if (live) visit(live);
      return;
    }
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
    // `{ name }` reads the variable `name`, though the checker gives the property's symbol there.
    const read = ts.isIdentifier(n) && (ts.isShorthandPropertyAssignment(n.parent) && n.parent.name === n ? checker.getShorthandAssignmentValueSymbol(n.parent) : checker.getSymbolAtLocation(n));
    if (read === sym) { found = true; return; }
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

/** A `const` made an object where it is declared (`new`, a literal, a function): never missing, whatever lenient code may hold elsewhere. */
function presentConst(d: ts.Node): boolean {
  if (!ts.isVariableDeclaration(d) || !ts.isIdentifier(d.name) || !d.initializer || !(ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const)) return false;
  const init = ts.skipOuterExpressions(d.initializer);
  return ts.isNewExpression(init) || ts.isObjectLiteralExpression(init) || ts.isArrayLiteralExpression(init) || ts.isArrowFunction(init) || ts.isFunctionExpression(init) || ts.isClassExpression(init);
}

/** A `var` declaring a variable an earlier `var` of the same block declared. */
function redeclaredVar(d: ts.VariableDeclaration, checker: ts.TypeChecker): boolean {
  if (d.parent.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const) || !ts.isVariableStatement(d.parent.parent)) return false;
  const block = d.parent.parent.parent;
  const earlier = checker.getSymbolAtLocation(d.name)?.declarations?.filter((x) => x.pos < d.pos);
  return !!earlier?.some((x) => ts.isVariableDeclaration(x) && ts.isVariableStatement(x.parent.parent) && x.parent.parent.parent === block);
}

/** A declarations file of the app's own (`globals.d.ts`), not a package's or TypeScript's. */
function isAppDeclarationFile(d: ts.Node | undefined): boolean {
  const f = d?.getSourceFile();
  return !!f && f.isDeclarationFile && !/[\\/]node_modules[\\/]/.test(f.fileName) && !f.fileName.startsWith('/__shims__/') && !isLibDeclaration(d);
}

/** What `inject(token)` gives: the kit's instance for a framework token, else the app's service. */
function injected(token: string): string {
  switch (token) {
    case 'RouterExtensions': return 'Router.shared';
    case 'EnvironmentInjector': return 'Injector.shared';
    case 'ActivatedRoute': return 'ActivatedRoute.current';
    case 'Page': return 'injectedPage()';
    case 'DestroyRef': return 'DestroyRef.current()';
    case 'ChangeDetectorRef': return 'ChangeDetectorRef.current()';
    case 'ElementRef': return 'ElementRef.current()';
    case 'NativeDialogRef': return 'NativeDialogRef.current';
    default: return `${token}.shared`;
  }
}

function isAngularComponent(decl: ts.ClassDeclaration): boolean {
  return (ts.getDecorators(decl) ?? []).some((d) => /^Component\(/.test(d.expression.getText()));
}

/**
 * A function's type parameter its parameters do not name (`loadCache<T>(key: string): Cached<T>`): Kotlin infers type
 * parameters from arguments and the expected type only, so the function holds any value there and its callers read the value as they type it.
 */
function erasedTypeParameter(p: ts.TypeParameterDeclaration): boolean {
  const fn = p.parent;
  // An interface is a class of fields: one class for every instantiation.
  if (ts.isInterfaceDeclaration(fn) || ts.isTypeAliasDeclaration(fn)) return true;
  if (!ts.isFunctionDeclaration(fn) && !ts.isMethodDeclaration(fn)) return false;
  const named = new RegExp(`\\b${p.name.text}\\b`);
  return !fn.parameters.some((q) => q.type && named.test(q.type.getText()));
}

/** Whether a function body has a `return` of its own (not one of a function inside it). */
function ownReturns(body: ts.Node): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found || ts.isFunctionLike(n) || ts.isClassLike(n)) return;
    if (ts.isReturnStatement(n)) found = true;
    else ts.forEachChild(n, visit);
  };
  ts.forEachChild(body, visit);
  return found;
}

/**
 * A module's top-level statements, run once at startup: what they throw is reported as uncaught and the app goes on,
 * as the Swift kit's module initializers do; an exception escaping the app's start would end it.
 */
export function reportedInit(init: string[]): string {
  // try, not jsReport { }: a lambda would capture every module field it sets, and lint's WrongThreadInterprocedural
  // fails on a lambda capturing a few dozen of them (it builds the product of each capture's possible values).
  return ['    try {', ...init.map((l) => (l ? '    ' + l : l)), '    } catch (__e: Throwable) {', '        jsReportThrown(__e)', '    }'].join('\n');
}
