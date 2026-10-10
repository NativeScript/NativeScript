import ts from 'typescript';
import { CF_CLASSES, functionParts, optionalType, splitTopLevel, type Translator } from './swift.ts';
import {
  categoryModule, conformsTo, isSubframework, lookupClass, lookupConstant, lookupConstructor, lookupEnum, lookupFunction, lookupInit, lookupMember, lookupStruct, lookupTypealias, moduleOfDeclaration, nativeTable,
  type NativeMethod, type NativeProperty, type SwiftType,
} from './natives/symbols.ts';

/** A buffer, a view of one, or an untyped value that may be either. */
const BUFFER_SOURCE = /^(JSArrayBuffer|JSDataView|JSArrayBufferView|JS(Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float32|Float64|BigInt64|BigUint64)Array|Any)\??$/;

const NUMBERS = new Set(['CGFloat', 'Double', 'Float', 'Float32', 'Float64', 'Int', 'UInt', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'TimeInterval', 'NSInteger', 'NSUInteger']);
const INTEGERS = new Set(['Int', 'UInt', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'NSInteger', 'NSUInteger']);
const base = (t: SwiftType) => t.replace(/[?!]$/, '').replace(/^\((.*)\)$/, '$1');
const optional = (t: SwiftType) => /[?!]$/.test(t);
/** Foundation's classes Swift imports as its value types where an API takes or returns one (`NSURL` as `URL`). */
const BRIDGED: Record<string, string> = {
  NSURL: 'URL', NSDate: 'Date', NSData: 'Data', NSIndexPath: 'IndexPath', NSNotification: 'Notification', NSUUID: 'UUID', NSLocale: 'Locale',
  NSTimeZone: 'TimeZone', NSCalendar: 'Calendar', NSURLRequest: 'URLRequest', NSDateComponents: 'DateComponents', NSCharacterSet: 'CharacterSet',
  NSURLComponents: 'URLComponents', NSIndexSet: 'IndexSet', NSPersonNameComponents: 'PersonNameComponents', UTTypeReference: 'UTType', NSError: 'any Error', CFString: 'String',
};
/** `code` of Objective-C class or Swift value type `from` as `to`, the other one of a bridged pair; null when they are not one. */
function bridge(code: string, from: SwiftType, to: SwiftType): string | null {
  const f = base(from), b = base(to);
  // A Core Foundation array is an NSArray, which Swift reads as an array of its elements.
  if (f === 'CFArray' && /^\[[^:]*\]$/.test(b)) return optional(to) ? `(${code}).map { $0 as NSArray as! ${b} }` : `(${code}${optional(from) ? '!' : ''} as NSArray as! ${b})`;
  // `NSSet` and Swift's `Set<T>`: toward the typed set the cast checks the elements.
  const typedSet = /^NS(Mutable)?Set$/.test(f) && /^Set<.+>$/.test(b);
  // A mutable request where a request is taken: Swift bridges it as its immutable base.
  if (f === 'NSMutableURLRequest' && b === 'URLRequest') return `(${code} as URLRequest${optional(to) ? '?' : ''})`;
  if (BRIDGED[f] !== b && BRIDGED[b] !== f && !typedSet && !(/^Set<.+>$/.test(f) && b === 'NSSet')) return null;
  const want = b === 'any Error' ? '(any Error)' : b;
  if (optional(to)) return `(${code} as${typedSet ? '?' : ''} ${want}${typedSet ? '' : '?'})`;
  return `(${code}${optional(from) ? '!' : ''} as${typedSet ? '!' : ''} ${want})`;
}
/**
 * A member a Swift module isolates to the main actor, reached from the
 * translated code's nonisolated functions: the app's code runs on the main
 * thread, as NativeScript's does.
 */
const isolated = (code: string, m: { mainActor?: boolean }) => (m.mainActor ? `${/\btry\b/.test(code) ? 'try ' : ''}MainActor.assumeIsolated { ${code} }` : code);
/** Classes NativeScript's typings rename where TypeScript's DOM library declares the name. */
const RENAMED: Record<string, string> = { _UIEvent: 'UIEvent' };
/** The iOS version the app targets: newer APIs need `if #available` the translation cannot add. */
export const DEPLOYMENT = 17;

/**
 * Direct calls to iOS APIs, as NativeScript apps write them in TypeScript
 * (`UIImage.systemImageNamed('star')`, `view.layer.cornerRadius = 8`), in
 * their Swift spelling from the module's symbol table (natives/symbols.ts):
 * selectors become Swift names and labels, factories become initializers,
 * enum members become cases, and numbers convert to the CGFloat, Int or
 * enum the Swift API takes.
 */
export class NativeAPI {
  private t: Translator;

  constructor(t: Translator) {
    this.t = t;
  }

  /** The module a native declaration comes from ('UIKit'), or null for anything else. */
  module(decl: ts.Declaration | undefined): string | null {
    if (!decl) return null;
    const known = moduleOfDeclaration(decl.getSourceFile().fileName);
    if (known) return known;
    // An app's own declaration of an SDK type newer than the published typings (`declare class UIArrangementViewController`
    // in its uikit-duo.d.ts): the SDK module whose table has a type of that name.
    const file = decl.getSourceFile();
    if (!file.isDeclarationFile || /[\\/]node_modules[\\/]/.test(file.fileName)) return null;
    const named = (ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl) || ts.isEnumDeclaration(decl)) && decl.name ? decl.name.text : null;
    if (!named) return null;
    for (const m of new Set(['UIKit', 'Foundation', ...this.modules])) {
      if (lookupClass(m, named) || lookupEnum(m, named)) return m;
    }
    return null;
  }

  private symbolModule(sym: ts.Symbol | undefined): { module: string; name: string } | null {
    const decl = sym?.declarations?.[0];
    const module = this.module(decl);
    if (module) this.uses(module);
    return module && sym ? { module, name: RENAMED[sym.name] ?? sym.name } : null;
  }

  private uses(module: string) {
    this.modules.add(module);
    this.used.add(module);
  }

  /** A member found in a table: the module of a category adding it is used too. */
  private found<T extends NativeMethod | NativeProperty | null>(m: T): T {
    const category = m && categoryModule(m);
    if (category) this.uses(category);
    return m;
  }

  /** Modules the program's native declarations come from: where enum types are looked up by their Swift name. */
  private modules = new Set<string>();

  /** The modules used since this was last cleared: those a file of the translation imports. */
  readonly used = new Set<string>();

  /** The SDK frameworks among them, as Swift imports them. */
  sdkModules(): string[] {
    return [...this.modules].filter((m) => /^[A-Z]\w*$/.test(m) && !m.startsWith('NSPlugin_') && !isSubframework(m)).sort();
  }

  /** The Swift type for a native TypeScript type (a class, protocol, struct or enum), or null. */
  /** Whether a type is an Objective-C class (not a protocol, struct or enum) of the native declarations. */
  isClassType(t: ts.Type): boolean {
    const native = this.symbolModule(t.getSymbol());
    const cls = native && lookupClass(native.module, native.name);
    return !!cls && cls.kind === 'class';
  }

  type(t: ts.Type): string | null {
    const sym = t.aliasSymbol ?? t.getSymbol();
    // A member's own type (`UIHingeStatus.Closed`): its enum's, found through the declaration where the symbol has no parent (a `declare const enum` of the app's).
    const enumDecl = sym && sym.flags & ts.SymbolFlags.EnumMember && sym.valueDeclaration && ts.isEnumDeclaration(sym.valueDeclaration.parent) ? sym.valueDeclaration.parent : null;
    const enumOfLiteral = sym && sym.flags & ts.SymbolFlags.EnumMember ? this.symbolModule((sym as any).parent ?? (enumDecl && this.t.checker.getSymbolAtLocation(enumDecl.name))) : null;
    const native = enumOfLiteral ?? this.symbolModule(sym);
    if (!native) return null;
    const en = enumOfLiteral ? lookupEnum(enumOfLiteral.module, enumOfLiteral.name) : t.flags & ts.TypeFlags.EnumLike || sym!.flags & ts.SymbolFlags.Enum ? lookupEnum(native.module, native.name) : undefined;
    if (en !== undefined) {
      this.typeAvailable(en);
      return en?.swift ?? null;
    }
    // Mutable ones stay classes: script mutates them in place.
    if (native.name === 'NSArray') return '[Any]';
    if (native.name === 'NSDictionary') return '[AnyHashable: Any]';
    const cls = lookupClass(native.module, native.name);
    if (cls) return cls.kind === 'protocol' ? `any ${this.className(cls)}` : this.className(cls);
    const struct = lookupStruct(native.module, native.name);
    if (struct) return struct.swift;
    return null;
  }

  /** A native type newer than the deployment target, named in a function: the function's body runs only where the OS has it. */
  private typeAvailable(t: { introduced?: string; swift?: string } | null | undefined) {
    if (t?.introduced && parseFloat(t.introduced) > DEPLOYMENT) this.t.requireTypeAvailability(parseFloat(t.introduced), t.swift);
  }

  /** A native class's Swift name, qualified by its module where the kit declares a type of that name (`Foundation.Progress`). */
  private className(cls: { swift: string; module?: string; introduced?: string; generics?: string[] }): string {
    this.typeAvailable(cls);
    const name = cls.module && (this.t.isKitType(cls.swift) || this.internalTypes.has(cls.swift)) ? `${cls.module}.${cls.swift}` : cls.swift;
    return cls.generics?.length ? `${name}<${cls.generics.map(() => 'AnyObject').join(', ')}>` : name;
  }

  /** The kit's internal types, which shadow native types of their names in code compiled into the kit. */
  internalTypes = new Set<string>();

  /** The kit's types among `names` that a module the app's code imports also declares: the app's module names them as the kit's. */
  kitClashes(names: Iterable<string>): string[] {
    const declared = new Set<string>();
    for (const m of new Set(['Foundation', 'UIKit', ...this.searchModules()])) {
      const t = nativeTable(m);
      for (const x of [...Object.values(t.classes), ...Object.values(t.structs), ...Object.values(t.enums)]) if (x.swift) declared.add(x.swift);
      for (const x of Object.keys(t.typealiases ?? {})) declared.add(x);
    }
    return [...names].filter((n) => declared.has(n));
  }

  /** The class or struct a native-typed expression is: its module and JS name. */
  private receiver(e: ts.Expression): { module: string; name: string; isStatic: boolean } | null {
    const c = this.t.checker;
    const sym = this.t.resolve(e);
    // `super` resolves to the base class, and is it only in a static member.
    if (sym && sym.flags & ts.SymbolFlags.Class && (e.kind !== ts.SyntaxKind.SuperKeyword || inStaticMember(e))) {
      const native = this.symbolModule(sym);
      if (native) return { ...native, isStatic: true };
    }
    // `this` in an app class extending a native one is the class.
    let type = c.getApparentType(c.getNonNullableType(c.getTypeAtLocation(e)));
    // A class narrowed by instanceof to another it does not extend (`UISearchBar & UIControl`): the first native one.
    if (type.isIntersection()) type = type.types.find((u) => this.symbolModule(u.getSymbol()) || this.nativeBase(u)) ?? type;
    const native = this.symbolModule(type.getSymbol()) ?? this.nativeBase(type);
    return native ? { ...native, isStatic: false } : null;
  }

  /** Whether a program class extends a native class, directly or through others. */
  extendsNative(cls: ts.ClassLikeDeclaration): boolean {
    const sym = cls.name && this.t.checker.getSymbolAtLocation(cls.name);
    return !!sym && !!this.nativeBase(this.t.checker.getDeclaredTypeOfSymbol(sym));
  }

  /** Whether a type is an app class extending a native one. */
  extendsNative(type: ts.Type): boolean {
    const c = this.t.checker;
    if (typeof type.isTypeParameter !== 'function') return false;
    return !!this.nativeBase(type.isTypeParameter() ? c.getBaseConstraintOfType(type) ?? type : c.getApparentType(type));
  }

  /** The nearest native class an app class extends (`class Sparkline extends UIView`). */
  private nativeBase(of: ts.Type): { module: string; name: string } | null {
    // A class's own `this` is a reference to the class.
    const type = (of as ts.TypeReference).target ?? of;
    if (typeof type.isClassOrInterface !== 'function' || !type.isClassOrInterface()) return null;
    for (const b of this.t.checker.getBaseTypes(type)) {
      const found = this.symbolModule(b.getSymbol()) ?? this.nativeBase(b);
      if (found) return found;
    }
    return null;
  }

  /** An API newer than the deployment target: the function using it runs it only where the OS has it. */
  private checkAvailable(m: { introduced?: string; selector?: string }, _e: ts.Node, _what: string) {
    if (m.introduced && parseFloat(m.introduced) > DEPLOYMENT) this.t.requireAvailability(parseFloat(m.introduced));
  }

  /** A Swift typealias the SDK declares (`UIActivityViewController.CompletionWithItemsHandler`), as the type it names. */
  private unalias(type: SwiftType): SwiftType {
    const optionalType = /[?!]$/.test(type);
    const name = type.replace(/[?!]$/, '');
    for (const m of this.modules) {
      const found = lookupTypealias(m, name);
      if (found) return optionalType ? `(${found})?` : found;
    }
    return type;
  }

  /** The iOS version a native class was introduced in, when newer than the deployment target. */
  introducedAfterDeployment(e: ts.Expression): number | null {
    const r = this.receiver(e);
    const cls = r?.isStatic ? lookupClass(r.module, r.name) : null;
    const v = cls && (cls as { introduced?: string }).introduced ? parseFloat((cls as { introduced?: string }).introduced!) : null;
    return v && v > DEPLOYMENT ? v : null;
  }

  // ---- Reads, writes, calls ----------------------------------------------------------------

  /** `x.prop` and `X.classProp` on native types; also enum members (`UIViewContentMode.Center`). */
  /** A member the app's own class declares (on a subclass of a native class): an ordinary Swift member. */
  private appMember(name: ts.Node): boolean {
    const decl = this.t.checker.getSymbolAtLocation(name)?.declarations?.[0];
    return !!decl && !decl.getSourceFile().isDeclarationFile;
  }

  /** An app class's override of its native base's method (`setViewControllersAnimated` in a UINavigationController subclass): called by the native name. */
  private nativeOverride(name: ts.Node): boolean {
    const decl = this.t.checker.getSymbolAtLocation(name)?.declarations?.[0];
    if (!decl || !ts.isMethodDeclaration(decl) || !ts.isClassLike(decl.parent)) return false;
    const base = this.nativeBase(this.t.checker.getTypeAtLocation(decl.parent));
    return !!base && !!lookupMember(base.module, base.name, decl.name.getText(), false);
  }

  property(e: ts.PropertyAccessExpression): string | null {
    const enumCase = this.enumMember(e);
    if (enumCase) return enumCase;
    if (this.appMember(e.name)) return null;
    const r = this.receiver(e.expression);
    if (!r) return null;
    const struct = !r.isStatic && lookupStruct(r.module, r.name);
    if (struct) {
      const field = struct.fields[e.name.text];
      if (!field) throw this.t.error(e, `${r.name}.${e.name.text} (not a field of ${struct.swift})`);
      if (e.questionDotToken || ts.isOptionalChain(e)) return this.chainEnd(e, `${this.chainHead(e.expression)}${e.name.text}`, field);
      return this.fromSwift(`${this.t.expr(e.expression)}.${e.name.text}`, field, e);
    }
    const collection = !r.isStatic ? this.collectionMember(e.expression, e.name.text, null, e) : null;
    if (collection) return collection;
    const m = this.found(lookupMember(r.module, r.name, e.name.text, r.isStatic));
    if (!m) throw this.t.error(e, `${r.name}.${e.name.text} (no Swift counterpart in ${r.module})`);
    this.checkAvailable(m, e, `${r.name}.${e.name.text}`);
    if ((e.questionDotToken || ts.isOptionalChain(e)) && !r.isStatic && m.kind === 'property') return this.chainEnd(e, isolated(`${this.chainHead(e.expression)}${m.swift}`, m), m.type);
    const target = r.isStatic ? this.className(lookupClass(r.module, r.name)!) : this.unwrapped(e.expression);
    if (m.kind === 'property') return this.fromSwift(isolated(`${target}.${m.swift}`, m), m.type, e);
    // A no-argument method read as a property in the d.ts (`UIColor.redColor` is a class property there).
    if (m.kind === 'method' && !m.params.length) return this.fromSwift(`${target}.${m.swift}()`, m.returns, e);
    if (m.kind === 'init' && !m.params.length) return this.fromSwift(`${target}()`, m.returns, e);
    // A method tested for (`x.method && x.method(y)`): whether the object has it, as the runtime finds it on the object.
    if (m.kind === 'method' && tested(e)) return `${r.isStatic ? `(${target}.self as AnyObject)` : target}.responds(to: NSSelectorFromString(${JSON.stringify(m.selector)}))`;
    throw this.t.error(e, `${r.name}.${e.name.text} read as a value`);
  }

  /**
   * A native receiver read without `?.` that TypeScript types as possibly
   * null (an app checked without strictNullChecks): JavaScript would throw on
   * null, so Swift unwraps. The cast makes the unwrap valid whether or not
   * Swift has the value as optional.
   */
  private unwrapped(x: ts.Expression): string {
    const code = this.t.expr(x);
    const t = this.t.typeOf(x);
    // `x?.objectForKey(k)`: the chain continues past a value Swift may hold as optional.
    const p = x.parent;
    if (ts.isPropertyAccessExpression(p) && p.expression === x && p.questionDotToken && t !== 'Any?' && !t.includes('->')) return `(${code} as ${t.replace(/\?$/, '')}?)?`;
    if (this.t.givesUndefined(x) && t !== 'Any?' && !t.includes('->')) return `(${code} as ${optionalType(t.replace(/[?!]$/, ''))})!`;
    if (!t.endsWith('?') || t === 'Any?' || t.includes('->')) return code;
    return `(${code} as ${t})!`;
  }

  /**
   * The receiver of `x?.member` up to the member, as Swift continues an
   * optional chain: `?.` past an optional link, `.` past a member Swift has
   * as non-optional, and a value outside a chain cast to optional, which is
   * valid whether Swift has it as optional, implicitly unwrapped or neither
   * (a kit member TypeScript declares non-null may be optional in Swift).
   */
  private chainHead(x: ts.Expression): string {
    let inner = x;
    while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
    if (ts.isCallExpression(inner) || (ts.isPropertyAccessExpression(inner) && ts.isOptionalChain(inner))) {
      const own = ts.isPropertyAccessExpression(inner) ? this.memberType(inner) : null;
      this.keepOptional.add(inner);
      try {
        const code = this.t.expr(x);
        // A field redeclared with a native type over its base's untyped one (`nativeViewProtected: UIView`).
        const t = this.t.typeOf(x).replace(/[?!]$/, '');
        if (ts.isPropertyAccessExpression(inner) && this.t.declaredTypeOf(inner) === 'Any?' && /^[A-Z]\w*$/.test(t) && this.receiver(x)) return `(${code} as? ${t})?.`;
        return `${code}${own !== null && !optional(own) ? '.' : '?.'}`;
      } finally { this.keepOptional.delete(inner); }
    }
    const t = this.t.typeOf(x);
    if (t === 'Any?' || t.endsWith('!')) return `${this.t.expr(x)}?.`;
    return `(${this.t.expr(x)} as ${optionalType(t)})?.`;
  }

  /** `x?.prop` of a native property on a receiver Swift holds as optional (`receiver`): its Swift name, a number as script reads it; null for anything else. */
  chainedProperty(e: ts.PropertyAccessExpression, receiver: string, dot = '?.'): string | null {
    const type = this.memberType(e);
    if (type === null || this.receiver(e.expression)?.isStatic) return null;
    const r = this.receiver(e.expression)!;
    const m = lookupMember(r.module, r.name, e.name.text, false);
    const chained = `${receiver}${dot}${m && m.kind === 'property' ? m.swift : e.name.text}`;
    const b = base(type);
    return NUMBERS.has(b) && b !== 'Double' && b !== 'TimeInterval' && this.t.typeOf(e).replace(/\?$/, '') === 'Double' ? `(${chained}).map { Double($0) }` : chained;
  }

  /** The Swift type of a native property or struct field `x.name`, or null for anything else. */
  private memberType(e: ts.PropertyAccessExpression): SwiftType | null {
    if (this.appMember(e.name)) return null;
    const r = this.receiver(e.expression);
    if (!r) return null;
    const struct = !r.isStatic && lookupStruct(r.module, r.name);
    if (struct) return struct.fields[e.name.text] ?? null;
    const m = lookupMember(r.module, r.name, e.name.text, r.isStatic);
    return m?.kind === 'property' ? m.type : null;
  }

  /** The Swift type a native instance method call `x.m()` returns, or null for anything else. */
  methodReturns(call: ts.CallExpression): SwiftType | null {
    const callee = call.expression;
    if (!ts.isPropertyAccessExpression(callee) || this.appMember(callee.name)) return null;
    const r = this.receiver(callee.expression);
    if (!r || r.isStatic) return null;
    const m = lookupMember(r.module, r.name, callee.name.text, false);
    return m?.kind === 'method' ? m.returns : null;
  }

  /** The value an optional chain ending in a native member of Swift type `type` reads, as TypeScript types it. */
  private chainEnd(e: ts.PropertyAccessExpression, chained: string, type: SwiftType): string {
    const b = base(type);
    // A Swift collection TypeScript reads as its Foundation class (`Set<NSUserActivity>` as `NSSet`).
    const bridged = bridge(chained, optionalType(type), optionalType(this.t.typeOf(e).replace(/[?!]$/, '')));
    const code = bridged ?? (NUMBERS.has(b) && b !== 'Double' && b !== 'TimeInterval' && this.t.typeOf(e).replace(/\?$/, '') === 'Double' ? `(${chained}).map { Double($0) }` : chained);
    // A link the chain continues past stays Swift's; the chain's value is a number as script reads it, still optional.
    if (this.keepOptional.has(e)) return ts.isPropertyAccessExpression(e.parent) && e.parent.expression === e ? chained : code;
    const coalesced = ts.isBinaryExpression(e.parent) && e.parent.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && e.parent.left === e;
    if (coalesced || this.t.typeOf(e).endsWith('?') || this.t.typeOf(e) === 'Any?') return code;
    // Lenient code: an object the chain does not reach is undefined, which an object declaration holds.
    return this.t.lenient && this.t.lenientRef(this.t.typeOf(e)) !== this.t.typeOf(e) ? `jsImplicit(${code})` : `(${code})!`;
  }

  /** Native calls whose optional Swift result an optional chain reads. */
  private keepOptional = new Set<ts.Node>();

  /** What `read` translates `e` to, an optional chain's end read as the optional it is. */
  readOptional(e: ts.Node, read: () => string): string {
    this.keepOptional.add(e);
    try { return read(); } finally { this.keepOptional.delete(e); }
  }

  /**
   * Foundation's collection methods on what Swift imports as its own
   * collections (`NSArray` as `[T]`, `NSDictionary` as `[K: V]`).
   */
  private collectionMember(target: ts.Expression, name: string, args: readonly ts.Expression[] | null, read: ts.Expression): string | null {
    const st = this.t.typeOf(target).replace(/\?$/, '');
    const isArray = /^\[[^:]*\]$/.test(st), isDict = /^\[.*:.*\]$/.test(st);
    if (!isArray && !isDict) return null;
    const recv = this.unwrapped(target);
    // An element of `NSArray<UIViewReservedRegion>`, which Swift has as `[Any]`: the native class the declaration names.
    const element = isArray ? this.type(this.t.checker.getNonNullableType(this.t.checker.getTypeAtLocation(read))) : null;
    const cls = element && /^[A-Za-z_][\w.]*$/.test(element) && !this.isEnumType(element) && !this.isStructType(element) ? element : null;
    const result = (code: string) => (cls ? `(${code.replace(/ as Any\?\)$/, ')')} as? ${cls})` : code);
    // `xs?.count`: the chain's count, when there is one.
    const count = recv.endsWith('?') ? `(${recv}.count).map { Double($0) }` : `Double(${recv}.count)`;
    if (isArray) {
      // `xs?.count`: undefined, read as a number, where the array is missing.
      if (args === null && name === 'count') return recv.endsWith('?') ? `(${count} ?? .nan)` : count;
      if (args === null && name === 'firstObject') return result(`(${recv}.first as Any?)`);
      if (args === null && name === 'lastObject') return result(`(${recv}.last as Any?)`);
      if (args && name === 'objectAtIndex') return cls ? `(${recv}[Int(${this.t.expr(args[0])})] as! ${cls})` : `(${recv}[Int(${this.t.expr(args[0])})] as Any?)`;
      if (args && !args.length && name === 'mutableCopy') return `NSMutableArray(array: ${recv})`;
      // By Foundation's own lookup: isEqual:, and NSNotFound where the array lacks the object.
      if (args && name === 'indexOfObject' && args.length === 1 && !recv.endsWith('?')) return `Double((${recv} as NSArray).index(of: ${this.t.coerce(args[0], 'Any?')} as Any))`;
    }
    if (isDict) {
      if (args === null && name === 'count') return count;
      if (args === null && name === 'allKeys') return `${recv}.keys.map { $0 as Any }`;
      if (args && !args.length && name === 'mutableCopy') return `NSMutableDictionary(dictionary: ${recv})`;
      if (args && (name === 'objectForKey' || name === 'valueForKey')) return `(${recv}[${this.t.expr(args[0])}] as Any?)`;
    }
    return null;
  }

  private enumMember(e: ts.PropertyAccessExpression): string | null {
    const sym = this.t.resolve(e.expression);
    if (!sym || !(sym.flags & ts.SymbolFlags.Enum)) return null;
    const native = this.symbolModule(sym);
    if (!native) return null;
    const en = lookupEnum(native.module, native.name);
    const c = en?.cases[e.name.text];
    // An option set's zero member has no Swift case: it is the empty set.
    if (en && !c && en.kind === 'options' && this.t.checker.getConstantValue(e) === 0) return `${en.swift}([])`;
    // A C enum Swift imports as constants of no table (`qos_class_t.QOS_CLASS_DEFAULT`) where a number goes: its value, as the runtime gives it.
    const value = this.t.checker.getConstantValue(e);
    if (!en && typeof value === 'number' && ((this.t.checker.getContextualType(e)?.flags ?? 0) & ts.TypeFlags.NumberLike)) return `Double(${value})`;
    if (!en || !c) throw this.t.error(e, `${native.name}.${e.name.text} (no Swift counterpart)`);
    this.typeAvailable(en);
    if (!en.swift) return c.swift;
    return `${en.swift}.${c.swift}`;
  }

  /** `x.prop = value` on a native type. */
  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    if (this.appMember(left.name)) return null;
    let r = this.receiver(left.expression);
    if (!r) return null;
    // `view instanceof UIControl` narrowing a UISearchBar: the member is the narrowed class's, the object cast to it.
    let cast: string | null = null;
    const it = this.t.checker.getNonNullableType(this.t.checker.getTypeAtLocation(left.expression));
    if (it.isIntersection() && !lookupMember(r.module, r.name, left.name.text, false)) {
      for (const u of it.types) {
        const n = this.symbolModule(u.getSymbol()) ?? this.nativeBase(u);
        const c = n && lookupClass(n.module, n.name);
        if (n && c && lookupMember(n.module, n.name, left.name.text, false)) { r = { ...n, isStatic: false }; cast = this.className(c); break; }
      }
    }
    const struct = !r.isStatic && lookupStruct(r.module, r.name);
    if (struct) {
      const field = struct.fields[left.name.text];
      if (!field) throw this.t.error(left, `${r.name}.${left.name.text} (not a field of ${struct.swift})`);
      return `${this.t.expr(left.expression)}.${left.name.text} = ${this.toSwift(value, field)}`;
    }
    const m = this.found(lookupMember(r.module, r.name, left.name.text, r.isStatic));
    if (!m || m.kind !== 'property') throw this.t.error(left, `${r.name}.${left.name.text} (no settable Swift property)`);
    if (m.readonly) throw this.t.error(left, `${r.name}.${left.name.text} (read-only)`);
    this.checkAvailable(m, left, `${r.name}.${left.name.text}`);
    // An object Swift holds as optional (`this.delay.wetDryMix = …`, `delay: AVAudioUnitDelay | null`): JavaScript's TypeError where it is missing.
    const held = this.t.typeOf(left.expression);
    const unwrap = !r.isStatic && !cast && held.endsWith('?') && held !== 'Any?' && !left.questionDotToken ? '!' : '';
    const target = r.isStatic ? this.className(lookupClass(r.module, r.name)!) : cast ? `(${this.t.expr(left.expression)} as! ${cast})` : `${this.t.expr(left.expression)}${unwrap}`;
    if (m.optional && !r.isStatic && !cast && lookupClass(r.module, r.name)?.kind === 'protocol') {
      return isolated(`jsSetOptionalNativeProperty(${target}, ${JSON.stringify(left.name.text)}, ${this.toSwift(value, m.type)})`, m);
    }
    return isolated(`${target}.${m.swift} = ${this.toSwift(value, m.type)}`, m);
  }

  /** A call of a native method, class method, `alloc().initWith…()`, `new()`, or global function. */
  call(e: ts.CallExpression): string | null {
    const callee = e.expression;
    if (ts.isIdentifier(callee)) {
      const native = this.symbolModule(this.t.resolve(callee));
      if (!native) return null;
      // Swift manages Core Foundation memory: retain and release calls go away.
      if (/^CF(Retain|Release|Autorelease)$|^CG\w+(Retain|Release)$/.test(native.name)) return e.arguments[0] ? this.t.expr(e.arguments[0]) : '()';
      // `UIApplicationMain(0, null, …)`: Swift's overlay reads the process's arguments, which the runtime passes for it.
      if (native.name === 'UIApplicationMain' && e.arguments.length === 4) return `UIApplicationMain(CommandLine.argc, CommandLine.unsafeArgv, ${this.toSwift(e.arguments[2], 'String?')}, ${this.toSwift(e.arguments[3], 'String?')})`;
      const f = lookupFunction(native.module, native.name);
      if (!f) throw this.t.error(e, `${native.name}() (no Swift counterpart in ${native.module})`);
      this.checkAvailable(f, e, `${native.name}()`);
      const args = [...e.arguments];
      const selfCode = (x: ts.Expression) => (f.owner ? this.toSwift(x, f.owner) : this.t.expr(x));
      if (f.kind === 'property') return this.fromSwift(`${selfCode(args[f.self!])}.${f.swift}`, f.returns, e);
      if (f.kind === 'staticProperty') return this.fromSwift(`${f.owner}.${f.swift}`, f.returns, e);
      const self = f.self !== undefined ? args.splice(f.self, 1)[0] : undefined;
      const list = this.argList(args, f.labels, f.params);
      const code = f.kind === 'init' ? `${f.owner}(${list})`
        : f.kind === 'method' ? `${selfCode(self!)}.${f.swift}(${list})`
        : f.kind === 'staticMethod' ? `${f.owner}.${f.swift}(${list})`
        : `${f.swift}(${list})`;
      return this.fromSwift(code, f.returns, e);
    }
    if (!ts.isPropertyAccessExpression(callee)) return null;
    if (this.appMember(callee.name) && callee.name.text !== 'new' && !this.nativeOverride(callee.name)) return null;
    const name = callee.name.text;
    // `X.alloc().initWithFrame(r)`, `X.alloc().init()`
    if (ts.isCallExpression(callee.expression) && ts.isPropertyAccessExpression(callee.expression.expression) && callee.expression.expression.name.text === 'alloc') {
      const allocated = callee.expression.expression.expression;
      // An app class extending a native one inherits its initializers.
      const own = this.t.resolve(allocated)?.valueDeclaration;
      const ownBase = own && ts.isClassDeclaration(own) && own.name && !own.getSourceFile().isDeclarationFile ? this.nativeBase(this.t.checker.getDeclaredTypeOfSymbol(this.t.resolve(allocated)!)) : null;
      const r = ownBase ? { ...ownBase, isStatic: true } : this.receiver(allocated);
      if (!r) return null;
      const cls = lookupClass(r.module, r.name)!;
      // A class held as a value (`typeof UIGestureRecognizer`): its own initializer, which Objective-C dispatches.
      const classRef = !!((this.t.resolve(allocated)?.flags ?? 0) & ts.SymbolFlags.Class);
      const made = ownBase ? this.t.topName(own!, (own as ts.ClassDeclaration).name!.text) : r.isStatic || classRef ? this.className(cls) : `${this.t.expr(allocated)}.init`;
      if (name === 'init') return `${made}()`;
      const init = this.found(lookupInit(r.module, r.name, name));
      if (!init) throw this.t.error(e, `${r.name}.alloc().${name}() (no Swift initializer)`);
      const args = [...e.arguments];
      if (init.errorParam !== undefined) args.splice(init.errorParam, 1);
      return this.errorCall(`${made}(${this.argList(args, init.labels, init.params)})`, init, e);
    }
    const own = this.t.resolve(callee.expression);
    const ownDecl = own?.valueDeclaration;
    if (ownDecl && ts.isClassDeclaration(ownDecl) && !ownDecl.getSourceFile().isDeclarationFile && name === 'new' && this.nativeBase(this.t.checker.getDeclaredTypeOfSymbol(own!))) return `${this.t.topName(ownDecl, ownDecl.name!.text)}()`;
    // `super.new()` or `this.new()` in a static member of the class: an instance of that class, as the runtime makes one.
    if (name === 'new' && !e.arguments.length && (callee.expression.kind === ts.SyntaxKind.SuperKeyword || callee.expression.kind === ts.SyntaxKind.ThisKeyword) && inStaticMember(callee.expression)) {
      const cls = ts.findAncestor(callee.expression, ts.isClassDeclaration);
      if (cls?.name && !cls.getSourceFile().isDeclarationFile && this.nativeBase(this.t.checker.getTypeAtLocation(cls))) return `${this.t.topName(cls, cls.name.text)}()`;
    }
    if (ts.isCallExpression(callee.expression) && ts.isPropertyAccessExpression(callee.expression.expression) && callee.expression.expression.name.text === 'alloc' && name === 'init') {
      const allocated = this.t.resolve(callee.expression.expression.expression)?.valueDeclaration;
      if (allocated && ts.isClassDeclaration(allocated) && !allocated.getSourceFile().isDeclarationFile) return `${this.t.topName(allocated, allocated.name!.text)}()`;
    }
    const r = this.receiver(callee.expression);
    if (!r) return null;
    // `Cls.class()`: the class itself, which Swift names `Cls.self`.
    if (r.isStatic && name === 'class' && !e.arguments.length) {
      const cls = this.t.expr(callee.expression);
      return cls.endsWith('.self') ? cls : `${cls}.self`;
    }
    const collection = !r.isStatic ? this.collectionMember(callee.expression, name, e.arguments, e) : null;
    if (collection) return collection;
    const cls = lookupClass(r.module, r.name);
    if (r.isStatic && name === 'new' && cls) return `${this.className(cls)}()`;
    if (r.isStatic && name === 'alloc') throw this.t.error(e, `${r.name}.alloc() without an init`);
    if (!r.isStatic && name === 'objectForKeyedSubscript') return this.fromSwift(`${this.t.expr(callee.expression)}[${this.t.expr(e.arguments[0])}]`, 'Any?', e);
    if (!r.isStatic && name === 'setObjectForKeyedSubscript') return `${this.t.expr(callee.expression)}[${this.t.expr(e.arguments[1])}] = ${this.t.expr(e.arguments[0])}`;
    // A native enum's value is a number in JavaScript.
    const en = !r.isStatic && name === 'toString' && !e.arguments.length ? lookupEnum(r.module, r.name) : null;
    if (en) return `String(${this.unwrapped(callee.expression)}${en.swift ? '.rawValue' : ''})`;
    // The runtime's wrapper of a native object converts to its `description`.
    if (!r.isStatic && name === 'toString' && !e.arguments.length && cls?.kind === 'class') return this.fromSwift(`${this.unwrapped(callee.expression)}.description`, 'String', e);
    const m = this.found(lookupMember(r.module, r.name, name, r.isStatic)) ?? this.optionsSibling(r, name, e.arguments.length) ?? (r.isStatic ? this.factoryInit(r, name) : null);
    if (!m) {
      // `o.setX(v)` for a property `x` the d.ts also lists as a method.
      const setter = /^set([A-Z]\w*)$/.exec(name);
      const prop = setter && e.arguments.length === 1 ? this.found(lookupMember(r.module, r.name, setter[1][0].toLowerCase() + setter[1].slice(1), r.isStatic)) : null;
      if (prop && prop.kind === 'property') return `${r.isStatic ? this.className(lookupClass(r.module, r.name)!) : this.t.expr(callee.expression)}.${prop.swift} = ${this.toSwift(e.arguments[0], prop.type)}`;
      throw this.t.error(e, `${r.name}.${name}() (no Swift counterpart in ${r.module})`);
    }
    this.checkAvailable(m, e, `${r.name}.${name}()`);
    // An Objective-C method Swift imports as a property.
    const chained = ts.isPropertyAccessExpression(callee) && !!callee.questionDotToken;
    // Foundation's own methods (`enumerateKeysAndObjectsUsingBlock`) on what Swift imports as its collection.
    const st = this.t.typeOf(callee.expression);
    const bridged = !r.isStatic && !chained && ((r.name === 'NSDictionary' && /^\[.*:.*\][?!]?$/.test(st)) || (r.name === 'NSArray' && /^\[[^:]*\][?!]?$/.test(st)));
    const recv = r.isStatic ? '' : bridged ? `(${this.unwrapped(callee.expression)} as ${r.name})` : !chained ? this.unwrapped(callee.expression)
      : this.t.typeOf(callee.expression).endsWith('?') ? `${this.t.expr(callee.expression)}?` : this.chainHead(callee.expression).slice(0, -1);
    if (m.kind === 'property') return this.fromSwift(isolated(`${r.isStatic ? this.className(lookupClass(r.module, r.name)!) : recv}.${m.swift}`, m), m.type, e);
    const args = [...e.arguments];
    if (m.errorParam !== undefined) args.splice(m.errorParam, 1);
    const defaults = (m as NativeMethod & { defaults?: string[] }).defaults ?? [];
    const list = [this.argList(args, m.labels, m.params), ...defaults].filter(Boolean).join(', ');
    const target = r.isStatic ? this.className(cls!) : recv;
    // An optional requirement called through its protocol: the method where the object has one, a TypeError where not.
    const optionalCall = m.kind === 'method' && (m as NativeMethod).optional && !r.isStatic && lookupClass(r.module, r.name)?.kind === 'protocol' ? '!' : '';
    const code = isolated(m.kind === 'init' ? `${target}(${list})` : `${target}.${m.swift}${optionalCall}(${list})`, m);
    const result = this.errorCall(code, m, e);
    // A chain that stops before the call gives undefined, as a number, string or boolean reads it.
    const tsType = this.t.typeOf(e);
    return (chained || ts.isOptionalChain(e)) && !this.keepOptional.has(e) && ['Bool', 'Double', 'String'].includes(tsType) ? this.t.undefinedAs(result, tsType) : result;
  }

  /** `NSNumber.numberWithLong(n)`, a factory Swift imports only as its initializer (`initWithLong:`, `NSNumber(value:)`). */
  private factoryInit(r: { module: string; name: string }, name: string): NativeMethod | null {
    const factory = /^[a-z]+(With[A-Z]\w*)$/.exec(name);
    const init = factory && this.found(lookupInit(r.module, r.name, `init${factory[1]}`));
    return init && init.kind === 'init' ? init : null;
  }

  /**
   * `session.setActiveError(true)` where Swift has no `setActive:error:` of its own: its overlay folds it into
   * `setActive(_:options:)`, whose options default to none. The sibling taking the same leading arguments
   * and only option sets beyond them, those passed empty, as Swift's default does.
   */
  private optionsSibling(r: { module: string; name: string; isStatic: boolean }, name: string, given: number): (NativeMethod & { defaults: string[] }) | null {
    if (!name.endsWith('Error')) return null;
    const stem = name.slice(0, -'Error'.length);
    const cls = lookupClass(r.module, r.name);
    const members = cls ? (r.isStatic ? cls.static : cls.instance) : {};
    const candidates = Object.entries(members).filter(([k, v]) => k !== name && k.startsWith(`${stem}With`) && k.endsWith('Error') && v.kind === 'method' && v.throws && v.params.length > given
      && v.params.slice(given).every((p) => this.isOptionSet(base(p)))) as [string, NativeMethod][];
    const best = candidates.sort((a, b) => a[1].params.length - b[1].params.length)[0]?.[1];
    if (!best) return null;
    // The option sets beyond the given arguments are empty, as the overlay's defaults are; the error stays last.
    return { ...best, params: best.params.slice(0, given), labels: best.labels.slice(0, given), defaults: best.params.slice(given).map((_, k) => `${best.labels[given + k] ?? '_'}: []`), errorParam: given } as NativeMethod & { defaults: string[] };
  }

  /**
   * A method Swift imports as `throws` (an Objective-C NSError out-parameter). Left out, the
   * error argument makes the iOS runtime throw the error; passed as null, the call returns
   * false or null instead.
   */
  private errorCall(code: string, m: NativeMethod, e: ts.CallExpression): string {
    if (!m.throws) return this.fromSwift(code, m.returns, e);
    const at = m.errorParam!;
    if (e.arguments.length > at) {
      const arg = e.arguments[at];
      if (arg.kind !== ts.SyntaxKind.NullKeyword && !(ts.isIdentifier(arg) && arg.text === 'undefined')) throw this.t.error(arg, 'an NSError out-parameter');
      return m.returns === 'Void' ? `((try? ${code}) != nil)` : this.fromSwift(`(try? ${code})`, optional(m.returns) ? m.returns : `${m.returns}?`, e);
    }
    return m.returns === 'Void' ? `({ () throws -> Bool in try ${code}; return true }())` : this.fromSwift(`(try ${code})`, m.returns, e);
  }

  /** Whether a call is of a method Swift imports as `throws`, with the error argument left out: the iOS runtime throws the error. */
  throwingCall(e: ts.CallExpression): boolean {
    try {
      const m = this.calledMethod(e);
      return !!m?.throws && e.arguments.length <= m.errorParam!;
    } catch { return false; }
  }

  /** The native method or initializer a call runs, as `call` finds it; null for anything else. */
  private calledMethod(e: ts.CallExpression): NativeMethod | null {
    const callee = e.expression;
    if (!ts.isPropertyAccessExpression(callee) || this.appMember(callee.name)) return null;
    const name = callee.name.text;
    if (ts.isCallExpression(callee.expression) && ts.isPropertyAccessExpression(callee.expression.expression) && callee.expression.expression.name.text === 'alloc') {
      const r = this.receiver(callee.expression.expression.expression);
      return r ? lookupInit(r.module, r.name, name) : null;
    }
    const r = this.receiver(callee.expression);
    const m = r ? lookupMember(r.module, r.name, name, r.isStatic) ?? this.optionsSibling(r, name, e.arguments.length) ?? (r.isStatic ? this.factoryInit(r, name) : null) : null;
    return m && m.kind !== 'property' ? m : null;
  }

  /** `new UIView()`, `new UIView({ frame })`. */
  construct(e: ts.NewExpression): string | null {
    const r = this.receiver(e.expression);
    if (!r || !r.isStatic) return null;
    const cls = lookupClass(r.module, r.name);
    if (!cls) throw this.t.error(e, `new ${r.name} (no Swift class)`);
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (!args.length) return `${this.className(cls)}()`;
    const o = args[0];
    if (args.length !== 1 || !ts.isObjectLiteralExpression(o)) throw this.t.error(e, `new ${r.name} with arguments other than one object literal`);
    const keys = o.properties.map((p) => p.name!.getText());
    const init = this.found(lookupConstructor(r.module, r.name, keys));
    if (!init) throw this.t.error(e, `new ${r.name}({ ${keys.join(', ')} }) (no Swift initializer)`);
    const values = keys.map((k) => {
      const p = o.properties.find((x) => x.name!.getText() === k)!;
      return ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name;
    });
    return this.fromSwift(`${this.className(cls)}(${this.argList(values, init.labels, init.params)})`, init.returns, e);
  }

  /** A native constant or enum-like global (`UIFontWeightBold`), or null. */
  identifier(e: ts.Identifier): string | null {
    const sym = this.t.resolve(e);
    const native = this.symbolModule(sym);
    if (native && sym!.flags & ts.SymbolFlags.Function) return this.functionValue(e, native);
    if (!native || !(sym!.flags & ts.SymbolFlags.Variable)) return null;
    const k = lookupConstant(native.module, native.name);
    if (!k) throw this.t.error(e, `${native.name} (no Swift counterpart in ${native.module})`);
    return this.fromSwift(k.swift, k.type, e);
  }

  /**
   * A global a source file declares for itself (`declare const UIBarButtonItemVisibilityPriorityHigh: number`, a
   * constant typings newer than its own have) that an SDK module has as a constant: that constant, or null.
   */
  declaredConstant(e: ts.Identifier): string | null {
    for (const module of new Set(['UIKit', 'Foundation', ...this.modules])) {
      const k = lookupConstant(module, e.text);
      if (!k) continue;
      this.uses(module);
      return this.fromSwift(k.swift, k.type, e);
    }
    return null;
  }

  /** A native function of no arguments as a value (`isRunning = UIAccessibilityIsVoiceOverRunning`): a closure calling it, as Swift may have it as a property. */
  private functionValue(e: ts.Identifier, native: { module: string; name: string }): string | null {
    const f = lookupFunction(native.module, native.name);
    if (!f || f.params.length || !['function', 'staticMethod', 'staticProperty'].includes(f.kind)) return null;
    this.checkAvailable(f, e, native.name);
    const sig = this.t.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const ret = sig ? this.t.type(sig.getReturnType(), e) : null;
    if (ret !== f.returns) return null;
    const call = f.kind === 'staticProperty' ? `${f.owner}.${f.swift}` : f.kind === 'staticMethod' ? `${f.owner}.${f.swift}()` : `${f.swift}()`;
    return `{ () throws -> ${ret} in ${call} }`;
  }

  /** An object literal for a native struct (`{ origin: { x: 0, y: 0 }, size }` as a CGRect). */
  structLiteral(e: ts.ObjectLiteralExpression, type: ts.Type): string | null {
    const native = this.symbolModule(type.getSymbol());
    const struct = native && lookupStruct(native.module, native.name);
    if (!struct) return null;
    const args = Object.entries(struct.fields).map(([name, ft]) => {
      const p = e.properties.find((x) => x.name?.getText() === name);
      if (!p) throw this.t.error(e, `${native!.name} literal without ${name}`);
      const v = ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name;
      return `${name}: ${this.toSwift(v, ft)}`;
    });
    return `${struct.swift}(${args.join(', ')})`;
  }

  // ---- Conversions --------------------------------------------------------------------------

  private argList(args: readonly ts.Expression[], labels: (string | null)[], params: SwiftType[]): string {
    const out: string[] = [];
    let next = 0;
    params.forEach((type, k) => {
      const label = labels[k];
      // A `()` parameter (`init(toMemory: ())`) takes no JavaScript argument.
      const value = type === '()' ? '()' : next < args.length ? this.toSwift(args[next++], type) : null;
      if (value !== null) out.push(label ? `${label}: ${value}` : value);
    });
    for (; next < args.length; next++) out.push(this.t.expr(args[next]));
    return out.join(', ');
  }

  /** A TypeScript value where a Swift API takes `target`. */
  /** A typealias of a number (`AVAudioFrameCount`): the number type it names, which conversions know; any other type as it is. */
  private numericAlias(type: SwiftType): SwiftType {
    const b = base(type);
    if (NUMBERS.has(b) || !/^[A-Z]\w*$/.test(b)) return type;
    const u = base(this.unalias(b));
    return NUMBERS.has(u) ? type.replace(b, u) : type;
  }

  toSwift(e: ts.Expression, target: SwiftType): string {
    target = this.numericAlias(target);
    const t = this.t;
    while ((ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) && ['any', 'unknown', 'never'].includes(e.type.getText())) e = e.expression;
    const b = base(target);
    // null for a collection Swift marks nonnull: the empty one, as Objective-C reads nil.
    // null for a struct: its zero value, as the runtime marshals it.
    if ((e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) && !optional(target) && this.isStructType(b)) return `${b}()`;
    if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return optional(target) || !b.startsWith('[') ? 'nil' : b.includes(':') ? '[:]' : '[]';
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.block(e, target);
    // A Promise executor's resolve as the completion (`getNotificationSettingsWithCompletionHandler(resolve)`): the promise resolved with its argument.
    const resolver = t.promiseResolver(e);
    const block = resolver ? blockType(this.unalias(target)) : null;
    if (resolver && block && block.result === 'Void' && block.params.length <= 1) {
      const value = resolver.type === 'Void' ? '' : block.params.length ? this.blockParam('__b0', block.params[0], resolver.type) : (t.zero(resolver.type) ?? 'nil');
      return `{ (${block.params.map((p, k) => `__b${k}: ${p}`).join(', ')}) in ${resolver.name}.resolve(${value}) }`;
    }
    const source = t.typeOf(e);
    // A value Swift holds as optional though TypeScript types it present (a nullable parameter passed on): nil stays nil.
    const maybe = optional(target) && base(source) === b ? t.maybeUndefined(e) : null;
    if (maybe) return maybe;
    const bridged = bridge(t.expr(e), source, target);
    if (bridged) return bridged;
    const held = this.heldBlock(t.expr(e), source, target);
    if (held) return held;
    // An untyped value where Swift takes a string: a missing one reads as empty, as Objective-C reads nil; anything else as its string.
    if (source === 'Any?' && b === 'String') return optional(target) ? `{ (__s: Any?) -> String? in jsIsNullish(__s) ? nil : jsToString(__s) }(${t.expr(e)})` : `{ (__s: Any?) -> String in jsIsNullish(__s) ? "" : jsToString(__s) }(${t.expr(e)})`;
    // An object where a protocol is taken (`recognizer.delegate = navigationController`): Objective-C asks the object whether it conforms.
    if (/^any [A-Z]\w*$/.test(b) && /^[A-Z][\w.]*[?!]?$/.test(source) && !this.isEnumType(base(source)) && !this.isStructType(base(source)) && !['Double', 'String', 'Bool'].includes(base(source))) return `(${t.expr(e)} as? ${b})${optional(target) ? '' : '!'}`;
    // An untyped value where Swift takes a BOOL: its truthiness, as the runtime marshals it.
    if (source === 'Any?' && b === 'Bool') return `jsTruthy(${t.expr(e)})`;
    // A boolean or string held optional (declared `boolean | undefined`) where Swift takes one: a missing one as Objective-C reads nil.
    if (!optional(target) && (b === 'Bool' || b === 'String') && source === `${b}?`) return `(${t.expr(e)} ?? ${b === 'Bool' ? 'false' : '""'})`;
    // A dispatch queue, which TypeScript types as NSObject: the queue, cast.
    if (base(source) === 'NSObject' && (b === 'DispatchQueue' || base(this.unalias(b)) === 'DispatchQueue')) {
      return optional(target) ? `(${t.expr(e)} as? ${b})` : `(${t.expr(e)} as! ${b})`;
    }
    // An ArrayBuffer or a typed array where Swift takes bytes: a copy of them, or their address, as the iOS runtime passes them.
    if (b === 'Data' && BUFFER_SOURCE.test(source)) return `jsNativeData(${t.expr(e)})`;
    if (/^Unsafe(Mutable)?RawPointer$/.test(b) && BUFFER_SOURCE.test(source)) {
      const bytes = b === 'UnsafeRawPointer' ? `jsNativeBytes(${t.expr(e)})` : `jsNativeBytes(${t.expr(e)}).map { UnsafeMutableRawPointer(mutating: $0) }`;
      return `${bytes}${optional(target) ? '' : '!'}`;
    }
    // A script Date where Swift takes a Foundation Date: the same instant.
    if (b === 'Date' && base(source) === 'JSDate') return source.endsWith('?') ? `${t.expr(e)}.map { jsNativeDate($0) }` : `jsNativeDate(${t.expr(e)})`;
    // An untyped value where Swift takes a Foundation Date (`<any>date` of a `Date | NSDate`): whichever it holds.
    if (b === 'Date' && source === 'Any?') return optional(target) ? `jsNativeDate(any: ${t.expr(e)})` : `jsNativeDate(any: ${t.expr(e)})!`;
    // An out-parameter: the cell's storage of the pointee's type, written back.
    const pointee = /^UnsafeMutablePointer<(\w+)>$/.exec(b)?.[1];
    if (pointee && source === 'InteropReference') return `&${t.expr(e)}.${pointee === 'CGFloat' ? 'cgFloat' : pointee === 'Bool' || pointee === 'ObjCBool' ? 'bool' : NUMBERS.has(pointee) && pointee !== 'Double' ? 'int' : 'value'}`;
    if (source === 'InteropReference' && b === 'UnsafeMutablePointer<Unmanaged<CFError>?>') return `&${t.expr(e)}.cfError`;
    const pointed = /^UnsafePointer<(\w+)>$/.exec(b)?.[1];
    if (pointed && this.isStructType(pointed) && (source === 'Any?' || base(source) === pointed)) return `jsStructPointer(${t.expr(e)}, ${pointed}.self)${optional(target) ? '' : '!'}`;
    // By the function, not the type's initializer: core declares a class named Selector (CSS selectors).
    if (b === 'Selector' && ts.isStringLiteralLike(e)) return `NSSelectorFromString(${JSON.stringify(e.text + ':'.repeat(this.exposedArity(e.text)))})`;
    // A constant naming a method (`GestureEvents.touchDown`): its value, as a literal is; any other string as it is when it runs.
    if (b === 'Selector' && /^String\??$/.test(source)) {
      const literal = this.t.checker.getTypeAtLocation(e);
      if (literal.isStringLiteral()) return `NSSelectorFromString(${JSON.stringify(literal.value + ':'.repeat(this.exposedArity(literal.value)))})`;
      return `NSSelectorFromString(${t.expr(e)})`;
    }
    if (NUMBERS.has(b)) {
      // An integer from a number as the runtime marshals one: NaN (an unset `maxLines`) is 0, the rest truncated and clamped.
      if (source === 'Double' && INTEGERS.has(b)) return ts.isNumericLiteral(e) ? t.expr(e) : `jsNativeInteger(${t.expr(e)}, ${b}.self)`;
      // A floating-point number as the runtime marshals one: undefined, which Swift holds as NaN, is 0 (an unset duration or line height).
      if (source === 'Double' && b !== 'Double' && b !== 'TimeInterval') return ts.isNumericLiteral(e) ? t.expr(e) : `${b}(jsNativeNumber(${t.expr(e)}))`;
      // An untyped value: the number the runtime marshals it as.
      if (source === 'Any?') return b === 'Double' || b === 'TimeInterval' ? `jsNativeNumber(jsToNumber(${t.expr(e)}))` : INTEGERS.has(b) ? `jsNativeInteger(jsToNumber(${t.expr(e)}), ${b}.self)` : `${b}(jsNativeNumber(jsToNumber(${t.expr(e)})))`;
      return ts.isNumericLiteral(e) ? t.expr(e) : `jsNativeNumber(${t.expr(e)})`;
    }
    if (this.isNumericConstants(b) && ['Double', 'Double?', 'Any?'].includes(source)) {
      const raw = this.typedConstantsRaw(b)!;
      if (source === 'Double') return `${b}(rawValue: ${raw}(${t.expr(e)}))`;
      if (source === 'Any?') return `${b}(rawValue: ${raw}(jsToNumber(${t.expr(e)})))`;
      return `(${t.expr(e)}).map { ${b}(rawValue: ${raw}($0)) }${optional(target) ? '' : '!'}`;
    }
    if (source === 'Double' && this.isEnumType(b)) {
      // A number where Swift takes an enum or option set: its raw value.
      const raw = this.rawTypeOf(b);
      return `${b}(rawValue: ${raw}(${t.expr(e)}))${this.isOptionSet(b) ? '' : '!'}`;
    }
    // An untyped value where Swift takes a native enum or option set: the number the runtime marshals.
    if (source === 'Any?' && this.isEnumType(b)) return this.enumFromNumber(`jsToNumber(${t.expr(e)})`, b);
    // A BOOL the runtime marshals from any value: its truthiness.
    if (source === 'Any?' && b === 'Bool') return `jsTruthy(${t.expr(e)})`;
    // A string the runtime marshals from any value: its string, null and undefined as nil.
    if (source === 'Any?' && b === 'String') return optional(target) ? `jsNativeString(${t.expr(e)})` : `jsToString(${t.expr(e)})`;
    // A dictionary where Swift keys one by a string-backed type (`[NSAttributedString.Key: Any]`).
    const keyed = /^\[([\w.]+): Any\]$/.exec(b)?.[1];
    if (keyed && keyed !== 'String' && keyed !== 'AnyHashable' && source.replace(/[?!]$/, '') !== b && this.isStringConstants(keyed)) {
      return optional(target) ? `{ (__d: Any?) -> ${b}? in jsIsNullish(__d) ? nil : jsNativeKeyed(__d, ${keyed}.self) }(${t.expr(e)})` : `jsNativeKeyed(${t.expr(e)}, ${keyed}.self)`;
    }
    // An untyped value where Swift takes a native object (or one conforming to a protocol: `any UIInteraction`).
    const cls = b.replace(/^any /, '');
    if (source === 'Any?' && /^[A-Z]\w*$/.test(cls) && !this.isEnumType(cls) && !NUMBERS.has(cls) && cls !== 'String' && cls !== 'Bool') {
      if (CF_CLASSES.has(cls)) return optional(target) ? `jsFlat(${t.expr(e)}).map { $0 as! ${cls} }` : `(jsFlat(${t.expr(e)}) as! ${cls})`;
      // A geometry struct the runtime gives script as an object (`window.screen.bounds`): the struct again.
      if (['CGRect', 'CGSize', 'CGPoint', 'UIEdgeInsets'].includes(cls)) return optional(target) ? `jsNativeStruct(${t.expr(e)}, ${cls}.self)` : `jsNativeStruct(${t.expr(e)}, ${cls}.self)!`;
      return optional(target) ? `(jsFlat(${t.expr(e)}) as? ${b})` : `(jsFlat(${t.expr(e)}) as! ${b})`;
    }
    // An object where Swift takes one conforming to a protocol its class may not declare (a delegate the runtime would accept): checked when it runs.
    if (b.startsWith('any ') && source.replace(/[?!]$/, '') !== b && /^(\w+\.)?[A-Z]\w*$/.test(source.replace(/[?!]$/, ''))) return optional(target) ? `(${t.expr(e)} as? ${b})` : `(${t.expr(e)} as! ${b})`;
    if (/^NSMutable(Array|Dictionary)[?!]?$/.test(source) && b.startsWith('[')) {
      // Held implicitly unwrapped or not, alike; a missing one is nil where Swift takes an optional, else empty.
      const immutable = base(source).replace('Mutable', '');
      const cast = `(${t.expr(e)} as ${base(source)}?).map { $0 as ${immutable} as! ${b} }`;
      return optional(target) ? cast : `(${cast} ?? ${b.includes(':') ? '[:]' : '[]'})`;
    }
    if (source.startsWith('JSArray<') && b.startsWith('[') && !b.includes(':')) {
      if (ts.isArrayLiteralExpression(e) && !e.elements.length) return '[]';
      const array = source.endsWith('?') ? `(${t.expr(e)} ?? JSArray())` : t.expr(e);
      if (b === '[Any]') return `${array}.storage.map { $0 as Any }`;
      const from = source.replace(/\?$/, '').slice('JSArray<'.length, -1), to = b.slice(1, -1);
      if (from === to) return `${array}.storage`;
      if (from === 'Double' && NUMBERS.has(to)) return `${array}.storage.map { ${to}($0) }`;
      if (from === 'Double' && this.isEnumType(to)) return `${array}.storage.map { ${this.enumFromNumber('$0', to)} }`;
      return `(${array}.storage as! ${b})`;
    }
    // An array typed loosely in TypeScript where Swift takes typed elements (`[UIBarButtonItemGroup]`).
    if (source === '[Any]' && b.startsWith('[') && b !== '[Any]') return `(${t.expr(e)} as! ${b})`;
    // An untyped object where Swift takes a dictionary: its keys and values as the runtime marshals them.
    if (source === 'Any?' && /^\[\w+\s*:\s*Any\]$/.test(b)) return `jsToNativeDictionary(${t.expr(e)})`;
    // An object of a literal's shape likewise.
    if (/^(Object_\w+|JSObject|JSRecord<.*>)[?!]?$/.test(source) && b === '[AnyHashable: Any]') {
      return optional(target) && /[?!]$/.test(source) ? `{ (__o: Any?) -> ${b}? in jsIsNullish(__o) ? nil : jsToNativeDictionary(__o) }(${t.expr(e)})` : `jsToNativeDictionary(${t.expr(e)})`;
    }
    // A possibly missing option set where Swift takes one: none of the options.
    if (!optional(target) && source.endsWith('?') && this.isOptionSet(b)) return `(${t.expr(e)} ?? [])`;
    // A possibly missing string where Swift takes one: Objective-C would receive nil, which reads as empty.
    if (b === 'String' && !optional(target) && source === 'String?') return `(${t.expr(e)} ?? "")`;
    // A string where Swift has a string-backed type (`UIMenu.Identifier`); a constant of that type as Swift declares it.
    const native = ts.isIdentifier(e) ? this.symbolModule(this.t.resolve(e)) : null;
    const constant = native && lookupConstant(native.module, native.name);
    if (constant && base(constant.type) === b) return constant.swift;
    // A constant of a typed-constants struct (`CFRunLoopMode`) where Swift takes any object: its raw value.
    if (constant && /^(CFTypeRef|AnyObject|Any)$/.test(b) && this.isTypedConstants(base(constant.type))) return `(${constant.swift}.rawValue as CFTypeRef)`;
    if (/^String\??$/.test(source) && b !== 'String' && this.isStringConstants(b) && !native) {
      return source.endsWith('?') ? `{ (__s: String?) -> ${b}? in __s.map { ${b}(rawValue: $0) } }(${t.expr(e)})` : `${b}(rawValue: ${t.expr(e)})`;
    }
    // Null where Swift takes a collection it marks nonnull: Objective-C receives nil, which reads as empty.
    if (source.endsWith('?') && !optional(target) && b.startsWith('[') && source.slice(0, -1) === b) return `(${t.expr(e)} ?? ${b.includes(':') ? '[:]' : '[]'})`;
    if (source === 'Double' && b === 'NSNumber') return `NSNumber(value: ${t.expr(e)})`;
    const raw = source === 'Double' ? this.constantsRaw(b) : null;
    if (raw && NUMBERS.has(raw)) return `${b}(rawValue: ${raw}(${t.expr(e)}))`;
    // A string where Foundation takes a copyable key (`setObject(_:forKey:)`).
    if (/^String\??$/.test(source) && /^(any )?NSCopying$/.test(b)) return `(${t.expr(e)} as NSString)`;
    // A string or a number where a generic class takes any object (`NSCache<AnyObject, AnyObject>`): its Foundation object.
    if (b === 'AnyObject' && source === 'String') return `(${t.expr(e)} as NSString)`;
    if (b === 'AnyObject' && source === 'Double') return `NSNumber(value: ${t.expr(e)})`;
    // Null where Swift takes a collection it marks nonnull: Objective-C receives nil, which reads as empty.
    if (!optional(target) && source.endsWith('?') && ['NSDictionary', 'NSArray'].includes(b)) return `(${t.expr(e)} ?? ${b}())`;
    return t.expr(e);
  }

  /** A Swift API's value as TypeScript reads it: numbers are Double, an implicitly unwrapped or optional object is the object. */
  fromSwift(code: string, swiftType: SwiftType, e: ts.Expression): string {
    swiftType = this.numericAlias(swiftType);
    // A result nothing reads: a nil one is no error.
    if (this.keepOptional.has(e) || ts.isExpressionStatement(e.parent)) return code;
    // A value only tested (`if (controller.viewControllers)`): nil is falsy, not an error.
    if (optional(swiftType) && onlyTested(e)) return code;
    const tsType = this.t.typeOf(e);
    const b = base(swiftType);
    const bridged = bridge(code, swiftType, tsType);
    if (bridged) return bridged;
    // A member the code has narrowed (`layer.mask instanceof CAShapeLayer`): the subclass it tested for.
    const declared = ts.isPropertyAccessExpression(e) ? this.t.checker.getSymbolAtLocation(e.name) : undefined;
    const narrowedTo = base(tsType);
    if (declared && /^[A-Z]\w*$/.test(narrowedTo) && narrowedTo !== b && /^[A-Z]\w*$/.test(b) && !this.isEnumType(narrowedTo) && !this.isStructType(narrowedTo)
        && base(this.t.type(this.t.checker.getTypeOfSymbol(declared), e)) === b) return `(${code} as${optional(tsType) ? '?' : '!'} ${narrowedTo})`;
    if (b === 'Date' && base(tsType) === 'JSDate') return optional(swiftType) ? unwrapAs(`${code}.map { JSDate($0) }`, tsType, this.t.lenient && this.t.lenientRef(tsType) !== tsType) : `JSDate(${code})`;
    if (NUMBERS.has(b) && tsType.replace(/\?$/, '') === 'Double') {
      if (b === 'Double' || b === 'TimeInterval') return optional(swiftType) && !tsType.endsWith('?') ? `${code}!` : code;
      return optional(swiftType) ? unwrapAs(`${code}.map { Double($0) }`, tsType, this.t.lenient && this.t.lenientRef(tsType) !== tsType) : `Double(${code})`;
    }
    // The runtime gives script an NSNumber as the number it holds.
    if (b === 'NSNumber' && /^Double\??$/.test(tsType)) return optional(swiftType) ? `${code}${tsType.endsWith('?') ? '?' : '!'}.doubleValue` : `${code}.doubleValue`;
    if ((this.isEnumType(b) || this.isNumericConstants(b)) && tsType === 'Double') return optional(swiftType) ? `Double(${code}!.rawValue)` : `Double(${code}.rawValue)`;
    // A Core Foundation string (`kUTTypePlainText`), a string to TypeScript.
    if (b === 'CFString' && /^String\??$/.test(tsType)) return optional(swiftType) ? unwrapAs(`(${code} as String?)`, tsType, this.t.lenient && this.t.lenientRef(tsType) !== tsType) : `(${code} as String)`;
    // A string-backed constant (`NSNotification.Name`), a string to TypeScript.
    // A number-backed constant (`UIFontWeightBold`), a number to TypeScript.
    if (tsType === 'Double' && NUMBERS.has(this.constantsRaw(b) ?? '')) return optional(swiftType) ? `Double(${code}!.rawValue)` : `Double(${code}.rawValue)`;
    // Lenient code tests a missing one (`textField.textContentType !== undefined`): held as script holds undefined.
    if (/^String\??$/.test(tsType) && this.isStringConstants(b)) return optional(swiftType) ? (tsType.endsWith('?') ? `${code}?.rawValue` : this.t.lenient ? `jsImplicit(${code}?.rawValue)` : `${code}!.rawValue`) : `${code}.rawValue`;
    // A Foundation collection (`NSDictionary(dictionary:)`) where TypeScript reads the bridged Swift collection.
    if (/^NS(Mutable)?(Dictionary|Array|Set)$/.test(b) && tsType.startsWith('[')) return `(${code} as${optional(swiftType) ? '?' : '!'} ${tsType.replace(/\?$/, '')})`;
    if (b.startsWith('[') && tsType.startsWith('JSArray<')) return `JSArray(${code}${optional(swiftType) ? ' ?? []' : ''})`;
    // Lenient code: a native object that may be nil is held as script holds null, unwrapped only where used.
    if (swiftType.endsWith('?') && !tsType.endsWith('?') && tsType !== 'Any?') return this.t.lenient && this.t.lenientRef(tsType) !== tsType ? `jsImplicit(${code})` : `${code}!`;
    return code;
  }

  /** A TypeScript closure passed as an Objective-C block: Swift parameter types in, TypeScript's inside. */
  private block(fn: ts.ArrowFunction | ts.FunctionExpression, target: SwiftType): string {
    const t = this.t;
    const fnType = blockType(this.unalias(target));
    if (!fnType) return t.expr(fn);
    const sig = [fnType.text, fnType.params.join(', '), fnType.result];
    const params = fnType.params;
    const names = fn.parameters.map((p, k) => (ts.isIdentifier(p.name) ? p.name.text : `__p${k}`));
    // A block's own block parameters (`completion` of a deferred menu's provider) escape: Objective-C marks none noescape here.
    const swiftParams = params.map((p, k) => `__b${k}: ${/->/.test(p) && !/[?!]$/.test(p.trim()) && !p.startsWith('@escaping') ? `@escaping ${p}` : p}`);
    const binds = params.map((p, k) => {
      if (!names[k]) return '';
      const param = fn.parameters[k], type = t.typeOf(param.name);
      // A nil object argument reaches a closure that takes it implicitly unwrapped (core's `(image) => { if (image) … }`).
      if (optional(p) && base(p) === type && t.mayBeNull(param)) return `let ${names[k]}: ${type}? = __b${k}`;
      // Bridged or a subclass (`data: NSData` for `Data?`, `response: NSHTTPURLResponse` for `URLResponse?`): converted as an optional, nil kept.
      if (optional(p) && t.mayBeNull(param)) return `let ${names[k]}: ${type}? = ${this.blockParam(`__b${k}`, p, `${type}?`)}`;
      return `let ${names[k]}: ${type} = ${this.blockParam(`__b${k}`, p, type)}`;
    }).filter(Boolean);
    const body = t.closure(fn);
    const throws = t.throwsInfo.fn(fn);
    const call = `(${body})(${names.map((n) => n).join(', ')})`;
    const ret = sig[2].trim();
    const inner = ret === 'Void' ? (throws ? `jsReport { try ${call} }` : `${call}`) : `${throws ? 'try! ' : ''}${call}`;
    return `{ (${swiftParams.join(', ')}) -> ${ret} in ${binds.join('; ')}${binds.length ? '; ' : ''}${ret === 'Void' ? inner : `return ${inner}`} }`;
  }

  /** A function value (Swift's are `throws`) where Swift takes a block returning nothing: called through one, what it throws reported. */
  private heldBlock(code: string, source: string, target: SwiftType): string | null {
    const unwrapped = /^\(.*\)[?!]$/.test(source) && blockType(source.slice(1, -2)) ? source.slice(1, -2) : source;
    const fn = /\bthrows\b/.test(unwrapped) ? blockType(unwrapped) : null;
    const want = blockType(this.unalias(target));
    if (!fn || !want || want.result !== 'Void' || fn.params.length > want.params.length) return null;
    const args = fn.params.map((p, k) => this.blockParam(`__b${k}`, want.params[k], p.replace(/^@escaping /, '')));
    const wrap = `{ (__f: @escaping ${unwrapped}) -> ${want.text} in { (${want.params.map((p, k) => `__b${k}: ${p}`).join(', ')}) in jsReport { try __f(${args.join(', ')}) } } }`;
    // An optional block parameter takes the function through an optional: lenient code holds a missing one (`fn || null`) as nil though its type says present.
    if (unwrapped === source) return optional(target) ? `{ (__o: (${unwrapped})?) -> (${want.text})? in __o.map(${wrap}) }(${code})` : `${wrap}(${code})`;
    return `(${code}).map(${wrap})${optional(target) ? '' : '!'}`;
  }

  /** Whether a native class extends another (`AVURLAsset` of `AVAsset`). */
  private isSubclass(sub: string, base: string): boolean {
    const modules = new Set(['Foundation', 'UIKit', ...this.modules]);
    // By JavaScript name: a Foundation class Swift names without its prefix (`HTTPURLResponse`) is found under it.
    const js = (m: string, n: string) => (lookupClass(m, n) ? n : lookupClass(m, `NS${n}`)?.swift === n ? `NS${n}` : null);
    const b = [...modules].map((m) => js(m, base)).find(Boolean) ?? base;
    for (const m of modules) {
      const s = js(m, sub);
      if (s && lookupClass(m, s)?.kind === 'class') return conformsTo(m, s, b);
    }
    return false;
  }

  private blockParam(code: string, swiftType: SwiftType, tsType: string): string {
    const b = base(swiftType);
    if (NUMBERS.has(b) && tsType === 'Double') return b === 'Double' ? code : `Double(${code})`;
    // A block handed to the block (`completion([UIMenuElement])`) where TypeScript types it otherwise (`(items: any[]) => void`): called with its arguments converted.
    const plain = swiftType.replace(/^@escaping\s+/, '').trim();
    if (functionParts(plain) && functionParts(tsType) && plain !== tsType) return this.t.convert(code, plain, tsType);
    // A Foundation value type the TypeScript declarations name by its class (`Notification` as `NSNotification`).
    const bridged = bridge(code, swiftType, tsType);
    if (bridged) return bridged;
    if (b === 'Date' && base(tsType) === 'JSDate') return optional(swiftType) ? unwrapAs(`${code}.map { JSDate($0) }`, tsType, this.t.lenient && this.t.lenientRef(tsType) !== tsType) : `JSDate(${code})`;
    // A block parameter the handler declares as a subclass (`(urlAsset: AVURLAsset)` for an `AVAsset`): the object as it.
    const tb = tsType.replace(/[?!]$/, '');
    if (b !== tb && /^[A-Z]\w*$/.test(b) && /^[A-Z]\w*$/.test(tb) && this.isSubclass(tb, b)) return tsType.endsWith('?') ? `(${code} as? ${tb})` : `(${code} as! ${tb})`;
    if (optional(swiftType) && !tsType.endsWith('?') && tsType !== 'Any?') return `${code}!`;
    return code;
  }

  // ---- Subclasses of native classes ----------------------------------------------------------

  /**
   * The selector Objective-C calls for an exposed method that throws (a throwing `@objc` method's
   * selector takes an error out-parameter): the method, what it throws reported as script reports
   * what nothing catches.
   */
  private exposedEntry(method: string, jsName: string): string {
    const m = /func \w+\((.*)\)(?: throws)?(?: -> (.+?))? \{/.exec(method.split('\n')[0]);
    if (!m) throw new Error(`${jsName}: no signature to expose`);
    const params = m[1] ? splitTopLevel(m[1]).map((p, k) => `_ __a${k}: ${p.slice(p.indexOf(':') + 1).replace(/=.*$/, '').trim()}`) : [];
    const call = `try self.${jsName}(${params.map((_, k) => `__a${k}`).join(', ')})`;
    const ret = m[2];
    const body = ret ? `jsReported { ${call} }${/[?!]$/.test(ret) ? ' ?? nil' : '!'}` : `jsReport { ${call} }`;
    return `    @objc(${jsName}${':'.repeat(params.length)}) public func __objc_${jsName}(${params.join(', ')})${ret ? ` -> ${ret}` : ''} { ${body} }`;
  }

  /** Exposed method name → its parameter count, from every `static ObjCExposedMethods` in the program. */
  private exposed: Map<string, number> | null = null;

  private exposedArity(name: string): number {
    if (!this.exposed) {
      this.exposed = new Map();
      for (const sf of this.t.sourceFiles) {
        const visit = (n: ts.Node) => {
          if (ts.isPropertyDeclaration(n) && n.name.getText() === 'ObjCExposedMethods' && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
            for (const p of n.initializer.properties) {
              const spec = ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(p.initializer) ? p.initializer : null;
              const params = spec?.properties.find((x) => x.name?.getText() === 'params');
              const count = params && ts.isPropertyAssignment(params) && ts.isArrayLiteralExpression(params.initializer) ? params.initializer.elements.length : 0;
              this.exposed!.set(p.name!.getText(), count);
            }
          }
          ts.forEachChild(n, visit);
        };
        visit(sf);
      }
    }
    return this.exposed.get(name) ?? 0;
  }

  /**
   * A TypeScript class extending an Objective-C class (`@NativeClass() class
   * Delegate extends NSObject implements UITextFieldDelegate`): an NSObject
   * subclass whose methods that override the base class or implement an
   * adopted protocol take their Swift signatures from the SDK table, and whose
   * `ObjCExposedMethods` are `@objc` for target-action selectors.
   */
  classDecl(cls: ts.ClassDeclaration): string | null {
    const t = this.t;
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (!heritage) return null;
    const baseSym = t.resolve(heritage.expression);
    const base = this.symbolModule(baseSym);
    if (!base) return null;
    const baseCls = lookupClass(base.module, base.name);
    if (!baseCls) throw t.error(heritage, `extending ${base.name} (no Swift class)`);
    // A namespace's class is declared inside the namespace's enum, by its own name.
    const name = ts.isModuleBlock(cls.parent) ? cls.name!.text : t.topName(cls, cls.name!.text);
    const protocols: { module: string; name: string; swift: string }[] = [];
    const addProtocol = (e: ts.Expression) => {
      const p = this.symbolModule(t.resolve(e));
      const pc = p && lookupClass(p.module, p.name);
      if (!p || !pc || pc.kind !== 'protocol') throw t.error(e, `${e.getText()} (not an Objective-C protocol)`);
      if (!protocols.some((x) => x.name === p.name)) protocols.push({ ...p, swift: pc.swift });
    };
    for (const i of cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) addProtocol(i.expression);
    const statics = cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !!m.initializer && ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword) === true);
    // `@ObjCClass(UIScrollViewDelegate)`: protocols the class adopts, as ObjCProtocols lists them.
    for (const d of ts.getDecorators(cls) ?? []) if (ts.isCallExpression(d.expression) && d.expression.expression.getText() === 'ObjCClass') d.expression.arguments.forEach(addProtocol);
    const listed = statics.find((m) => m.name.getText() === 'ObjCProtocols');
    if (listed && ts.isArrayLiteralExpression(listed.initializer!)) for (const e of listed.initializer.elements) addProtocol(e);
    const exposedSpec = statics.find((m) => m.name.getText() === 'ObjCExposedMethods');
    const exposed = new Set(exposedSpec && ts.isObjectLiteralExpression(exposedSpec.initializer!) ? exposedSpec.initializer.properties.map((p) => p.name!.getText()) : []);

    // A protocol the native base conforms to already is its conformance.
    const lines = [`final class ${name}: ${[this.className(baseCls), ...protocols.filter((p) => !conformsTo(base.module, base.name, p.name)).map((p) => p.swift)].join(', ')} {`];
    t.indent = '    ';
    t.inNativeClassBody = true;
    for (const m of cls.members) {
      if (!ts.isPropertyDeclaration(m) || m === listed || m === exposedSpec) continue;
      const n = m.name.getText();
      const type = t.typeOf(m.name);
      const isStatic = ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
      if (isStatic) { lines.push(`    static var ${n}: ${type} = ${m.initializer ? t.coerce(m.initializer, type) : t.zero(type) ?? 'nil'}`); continue; }
      if (!m.initializer) { lines.push(`    var ${n}: ${t.deferredType(type)}`); continue; }
      // UIKit decides which initializer runs (init(frame:), init(coder:)…): fields initialize on first use instead.
      lines.push(`    ${t.pure(m.initializer) ? '' : 'lazy '}var ${n}: ${type} = ${t.tryPrefix(m.initializer) ? 'try! ' : ''}${t.coerce(m.initializer, type)}`);
    }
    if (cls.members.some((m) => ts.isConstructorDeclaration(m))) throw t.error(cls, `a constructor in a class extending ${base.name} (NativeScript creates these with new() or alloc().init())`);
    // Accessors of the app's own: Swift properties.
    const accessors = new Map<string, { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }>();
    for (const m of cls.members) {
      if (!ts.isGetAccessorDeclaration(m) && !ts.isSetAccessorDeclaration(m)) continue;
      if (ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword)) throw t.error(m, `a static accessor in a class extending ${base.name}`);
      const a = accessors.get(m.name.getText()) ?? {};
      if (ts.isGetAccessorDeclaration(m)) a.get = m; else a.set = m;
      accessors.set(m.name.getText(), a);
    }
    for (const [n, a] of accessors) {
      // A property the native base declares (`preferredStatusBarStyle`): its Swift override, the body's value converted, what it throws reported.
      const fromBase = this.found(lookupMember(base.module, base.name, n, false));
      // A property the native base or an adopted protocol declares (`UIApplicationDelegate.window`).
      const native = fromBase?.kind === 'property' ? fromBase : protocols.map((p) => lookupMember(p.module, p.name, n, false)).find((m) => m?.kind === 'property') ?? fromBase;
      const viaProtocol = native !== fromBase;
      if (native && native.kind === 'property' && a.get) {
        // Lenient code: an object the getter gives may be undefined, which an optional native property takes as nil.
        const declared = t.returnTypeOf(a.get);
        const own = optional(native.type) && t.lenientRef(declared) !== declared ? optionalType(declared) : declared;
        const body = t.functionBody(a.get, own, '            ');
        const value = t.throwsInfo.fn(a.get) ? `jsReported { () throws -> ${own} in${body.slice(1)}${own.endsWith('?') && own !== 'Any?' ? ' ?? nil' : ''}` : `{ () -> ${own} in${body.slice(1)}()`;
        const fallback = own.endsWith('?') || own === 'Any?' || optional(native.type) ? '' : t.zero(own) ? ` ?? ${t.zero(own)}` : '!';
        const get = `        get {\n            let __value: ${t.throwsInfo.fn(a.get) ? optionalType(own) : own} = ${value}\n            return ${this.toSwiftValue(`__value${t.throwsInfo.fn(a.get) ? fallback : ''}`, own, native.type)}\n        }`;
        const parts = [get];
        if (a.set) {
          if (native.readonly) throw t.error(a.set, `a setter of ${base.name}.${n}`);
          const p = a.set.parameters[0].name as ts.Identifier;
          const pt = t.typeOf(p);
          const body = t.functionBody(a.set, 'Void', '            ');
          const bt = optional(native.type) && !optional(pt) && !['Double', 'String', 'Bool'].includes(pt) ? t.bindsOptional(p, pt) : pt;
          const bind = `            let ${p.text}: ${bt} = ${this.fromSwiftValue('newValue', native.type, bt)}`;
          parts.push(t.throwsInfo.fn(a.set) ? `        set {\n${bind}\n            jsReport ${body.trimStart()}\n        }` : `        set {\n${bind}${body.slice(1)}`);
        }
        lines.push(`    ${viaProtocol ? '' : 'override '}var ${native.swift}: ${native.type} {`, ...parts, '    }');
        continue;
      }
      const type = a.get ? t.returnTypeOf(a.get) : optionalType(t.typeOf(a.set!.parameters[0].name));
      const parts = [a.get ? `        get${t.throwsInfo.fn(a.get) ? ' throws' : ''} ${t.functionBody(a.get, type, '        ')}` : '        get { nil }'];
      if (a.set) {
        const p = a.set.parameters[0].name as ts.Identifier;
        const body = t.functionBody(a.set, 'Void', '        ');
        parts.push(t.throwsInfo.fn(a.set) ? `        set {\n            let ${p.text}: ${type} = newValue\n            jsReport ${body.trimStart()}\n        }` : `        set {\n            let ${p.text}: ${type} = newValue${body.slice(1)}`);
      }
      lines.push(`    var ${n}: ${t.lenientRef(type)} {`, ...parts, '    }');
    }
    for (const m of cls.members) {
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      const jsName = m.name.getText();
      if (ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword)) {
        if (jsName === 'new' || jsName === 'alloc') continue;
        lines.push('    ' + t.func(m, jsName, 'static '));
        continue;
      }
      // Swift has no `dealloc` to override: the object's deinit, which runs the base's teardown after it.
      if (jsName === 'dealloc' && !m.parameters.length) {
        lines.push(t.throwsInfo.fn(m) ? `    deinit {\n        jsReport ${t.functionBody(m, 'Void', '        ').trimStart()}\n    }` : `    deinit ${t.functionBody(m, 'Void', '    ').trimStart()}`);
        continue;
      }
      const init = /^init/.test(jsName) ? lookupInit(base.module, base.name, jsName) : null;
      if (init) {
        lines.push(this.nativeInit(m, init));
        if (!lines.some((l) => /init\?\(coder/.test(l))) lines.push('    required init?(coder: NSCoder) { super.init(coder: coder) }');
        continue;
      }
      const fromProtocol = protocols.map((p) => lookupMember(p.module, p.name, jsName, false)).find(Boolean);
      const fromBase = lookupMember(base.module, base.name, jsName, false);
      const target = fromProtocol ?? fromBase;
      if (target && target.kind === 'method') {
        lines.push(this.nativeMethod(m, target, !!fromBase && fromBase.kind === 'method' && (!fromProtocol || fromBase.swift === fromProtocol.swift)));
        continue;
      }
      if (exposed.has(jsName) && t.throwsInfo.fn(m)) {
        lines.push('    ' + t.func(m, jsName), this.exposedEntry(t.func(m, jsName), jsName));
        continue;
      }
      lines.push('    ' + t.func(m, jsName, exposed.has(jsName) ? '@objc ' : ''));
    }
    // The class's own fields and getters, which Objective-C cannot see, read by name from untyped code (`(<any>controller).owner`).
    const native = (n: string) => !!lookupMember(base.module, base.name, n, false) || protocols.some((p) => lookupMember(p.module, p.name, n, false));
    const own = cls.members.filter((m): m is ts.PropertyDeclaration | ts.GetAccessorDeclaration => (ts.isPropertyDeclaration(m) || ts.isGetAccessorDeclaration(m)) && ts.isIdentifier(m.name)
      && m !== listed && m !== exposedSpec && !ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword) && !native(m.name.text) && !t.typeOf(m.name).includes('->'));
    if (own.length) {
      lines.push('    func jsMember(_ key: String) -> Any?? {', '        switch key {');
      for (const m of own) {
        const n = (m.name as ts.Identifier).text;
        lines.push(`        case ${JSON.stringify(n)}: return .some(${ts.isGetAccessorDeclaration(m) && t.throwsInfo.fn(m) ? `jsReported { try self.${n} } ?? nil` : `self.${n} as Any?`})`);
      }
      lines.push('        default: return nil', '        }', '    }');
      lines[0] = lines[0].replace(/ \{$/, ', JSNativeMembers {');
    }
    t.indent = '';
    t.inNativeClassBody = false;
    lines.push('}');
    return lines.join('\n');
  }

  /** A method with the Swift signature it overrides or implements; its body sees TypeScript's types. */
  private nativeMethod(m: ts.MethodDeclaration, target: NativeMethod, override: boolean): string {
    const t = this.t;
    const tsParams = m.parameters.map((p, k) => ({ name: ts.isIdentifier(p.name) ? p.name.text : `__p${k}`, type: t.typeOf(p.name) }));
    const swiftParams = target.params.map((type, k) => {
      const label = target.labels[k];
      const inner = `__a${k}`;
      return `${label ?? '_'} ${inner}: ${target.escaping?.includes(k) ? '@escaping ' : ''}${type}`;
    });
    const ownRet = t.returnTypeOf(m);
    // A parameter the body never reads is not bound: a non-escaping block could not be.
    const read = (k: number) => {
      const sym = this.t.checker.getSymbolAtLocation(m.parameters[k].name);
      let found = false;
      // `{ transitionContext }` reads the parameter through the shorthand's value.
      const reads = (n: ts.Identifier) => this.t.checker.getSymbolAtLocation(n) === sym || (ts.isShorthandPropertyAssignment(n.parent) && this.t.checker.getShorthandAssignmentValueSymbol(n.parent) === sym);
      const visit = (n: ts.Node): void => { if (!found && ts.isIdentifier(n) && reads(n)) found = true; else if (!found) ts.forEachChild(n, visit); };
      if (sym && m.body) visit(m.body);
      return found;
    };
    const binds = tsParams.map((p, k) => {
      const swift = target.params[k];
      if (!swift || !read(k)) return '';
      // A nullable native parameter TypeScript declares present (`launchOptions`) may be nil: the body reads it as undefined.
      if (optional(swift) && !p.type.endsWith('?') && !['Double', 'String', 'Bool'].includes(p.type) && !bridge('', swift, p.type)) {
        const type = t.bindsOptional(m.parameters[k].name, p.type);
        return `        let ${p.name}: ${type} = ${this.fromSwiftValue(`__a${k}`, swift, type)}`;
      }
      // A struct whose fields the body assigns (`size.width = 0`) is a variable of its own.
      return `        ${this.isStructType(p.type) && writesField(m.body!, this.t.checker.getSymbolAtLocation(m.parameters[k].name), this.t.checker) ? 'var' : 'let'} ${p.name}: ${p.type} = ${this.fromSwiftValue(`__a${k}`, swift, p.type)}`;
    }).filter(Boolean);
    const ret = target.returns;
    // A result Objective-C declares nullable: the body may give undefined.
    const tsRet = optional(ret) && ownRet !== 'Void' && !ownRet.endsWith('?') && ownRet !== 'Any?' ? optionalType(ownRet) : ownRet;
    const body = t.functionBody(m, tsRet, '        ');
    const throws = t.throwsInfo.fn(m);
    const call = `{ () ${throws ? 'throws ' : ''}-> ${tsRet} in${body.slice(1)}()`;
    // A Void method's body is the method's own (its returns return from it); a value goes through a closure to be converted.
    // A value the TypeScript method returns where Objective-C returns nothing is dropped.
    const result = ret === 'Void'
      ? (tsRet !== 'Void' ? `        ${throws ? 'jsReport { _ = try ' : '_ = '}${call}${throws ? ' }' : ''}` : throws ? `        jsReport { try ${call} }` : body.slice(2, -2).replace(/^ {8}/, '        '))
      : `        let __result: ${tsRet} = ${throws ? 'try! ' : ''}${call}\n        return ${this.toSwiftValue('__result', tsRet, ret)}`;
    const available = target.introduced && parseFloat(target.introduced) > DEPLOYMENT ? `@available(iOS ${target.introduced}, *) ` : '';
    return [`    ${available}${override ? 'override ' : ''}func ${target.swift}(${swiftParams.join(', ')})${ret === 'Void' ? '' : ` -> ${ret}`} {`, ...binds, result, '    }'].join('\n');
  }

  /**
   * An override of a native initializer (`initWithStyleReuseIdentifier`), written as NativeScript has it:
   * `const cell = super.initWith…(…)`, statements on the cell, `return cell`. In Swift the initializer
   * itself, the cell being `self`.
   */
  private nativeInit(m: ts.MethodDeclaration, init: NativeMethod): string {
    const t = this.t;
    const stmts = [...(m.body?.statements ?? [])];
    const first = stmts[0], last = stmts.at(-1);
    const decl = first && ts.isVariableStatement(first) && first.declarationList.declarations.length === 1 ? first.declarationList.declarations[0] : undefined;
    let value = decl?.initializer;
    while (value && (ts.isParenthesizedExpression(value) || ts.isAsExpression(value) || ts.isTypeAssertionExpression(value))) value = value.expression;
    const superCall = value && ts.isCallExpression(value) && ts.isPropertyAccessExpression(value.expression) && value.expression.expression.kind === ts.SyntaxKind.SuperKeyword && value.expression.name.text === m.name.getText() ? value : undefined;
    const sym = decl && ts.isIdentifier(decl.name) ? t.checker.getSymbolAtLocation(decl.name) : undefined;
    if (!superCall || !sym || !last || !ts.isReturnStatement(last) || !last.expression || !ts.isIdentifier(last.expression) || t.checker.getSymbolAtLocation(last.expression) !== sym) {
      throw t.error(m, `an initializer override not of the form \`const x = super.${m.name.getText()}(…); …; return x\``);
    }
    const swiftParams = init.params.map((type, k) => `${init.labels[k] ?? '_'} __a${k}: ${init.escaping?.includes(k) ? '@escaping ' : ''}${type}`);
    const middle = stmts.slice(1, -1);
    // Parameters the body reads, bound as TypeScript types them; ones passed straight on to super, as Swift has them.
    const readIn = (sym: ts.Symbol | undefined, nodes: ts.Node[]) => {
      let found = false;
      const visit = (n: ts.Node): void => { if (!found && ts.isIdentifier(n) && t.checker.getSymbolAtLocation(n) === sym) found = true; else if (!found) ts.forEachChild(n, visit); };
      nodes.forEach(visit);
      return found;
    };
    const params = m.parameters.map((p) => (ts.isIdentifier(p.name) ? t.checker.getSymbolAtLocation(p.name) : undefined));
    const binds = m.parameters.map((p, k) => (ts.isIdentifier(p.name) && init.params[k] && readIn(params[k], middle) ? `        let ${p.name.text}: ${t.typeOf(p.name)} = ${this.fromSwiftValue(`__a${k}`, init.params[k], t.typeOf(p.name))}` : '')).filter(Boolean);
    const passed = superCall.arguments.map((a, k) => {
      const at = ts.isIdentifier(a) ? params.indexOf(t.checker.getSymbolAtLocation(a)) : -1;
      return at >= 0 && init.params[k] === init.params[at] ? `__a${at}` : this.toSwift(a, init.params[k]);
    });
    const refs: ts.Node[] = [];
    const visit = (n: ts.Node) => { if (ts.isIdentifier(n) && t.checker.getSymbolAtLocation(n) === sym) refs.push(n); ts.forEachChild(n, visit); };
    middle.forEach(visit);
    for (const r of refs) t.subst.set(r, 'self');
    t.indent = '        ';
    let body: string[];
    try { body = t.statements(middle); } finally { for (const r of refs) t.subst.delete(r); t.indent = '    '; }
    const throws = middle.some((x) => t.throwsInfo.expr(x));
    return [`    override init${init.failable ? '?' : ''}(${swiftParams.join(', ')}) {`, ...binds,
      `        super.init(${passed.map((a, k) => (init.labels[k] ? `${init.labels[k]}: ${a}` : a)).join(', ')})`,
      ...(throws ? ['        jsReport {', ...body.map((l) => '    ' + l), '        }'] : body), '    }'].join('\n');
  }

  /** A Swift parameter value as the TypeScript body reads it. */
  private fromSwiftValue(code: string, swiftType: SwiftType, tsType: string): string {
    const b = base(swiftType);
    // A block given to script untyped (`decisionHandler: any`): a script function, its arguments converted to the block's types.
    if (tsType === 'Any?' && /->/.test(swiftType)) {
      const fn = swiftType.replace(/@\w+\s+/g, '').trim();
      const isOptional = /\)[?!]$/.test(fn) && fn.startsWith('((');
      const plain = isOptional ? fn.replace(/^\((.*)\)[?!]$/, '$1') : fn;
      return isOptional ? `${code}.map { ${this.t.boxFunction('$0', plain)} }` : this.t.boxFunction(code, plain);
    }
    if (NUMBERS.has(b) && tsType === 'Double') return b === 'Double' ? code : optional(swiftType) ? `Double(${code}!)` : `Double(${code})`;
    // A block whose parameters Swift bridges (`URLRequest?`) where TypeScript declares the Foundation class (`NSURLRequest`).
    const block = functionParts(swiftType.replace(/@\w+\s+/g, '').trim()), fn = functionParts(tsType);
    if (block && fn && block.params.some((p, k) => p !== fn.params[k])) return this.t.convert(code, block.text, tsType);
    // A parameter TypeScript declares as the app's own subclass (`navigationController: UINavigationControllerImpl`).
    const own = tsType.replace(/[?!]$/, '');
    if (own !== b && /^(\w+\.)?[A-Z]\w*$/.test(own) && /^[A-Z]\w*$/.test(b) && !this.isEnumType(b) && !this.isStructType(b) && this.t.lenientRef(own) !== own) return `jsImplicit(${code} as? ${own})`;
    const bridged = bridge(code, swiftType, tsType);
    if (bridged) return bridged;
    if (b === 'Date' && base(tsType) === 'JSDate') return optional(swiftType) ? unwrapAs(`${code}.map { JSDate($0) }`, tsType, this.t.lenient && this.t.lenientRef(tsType) !== tsType) : `JSDate(${code})`;
    // A native enum is a number in JavaScript.
    if (tsType === 'Double' && this.isEnumType(b)) return optional(swiftType) ? `Double(${code}!.rawValue)` : `Double(${code}.rawValue)`;
    if (optional(swiftType) && !tsType.endsWith('?') && tsType !== 'Any?') return `${code}!`;
    return code;
  }

  /** A TypeScript result as the Swift method returns it. */
  private toSwiftValue(code: string, tsType: string, swiftType: SwiftType): string {
    const b = base(swiftType);
    // An untyped result marshals as the runtime converts a JavaScript value: a BOOL by truthiness, a number by ToNumber.
    if (tsType === 'Any?' && swiftType !== 'Any?' && swiftType !== 'Any') {
      if (b === 'Bool' || b === 'ObjCBool') return `jsTruthy(${code})`;
      if (NUMBERS.has(b)) return b === 'Double' ? `jsToNumber(${code})` : `${b}(jsToNumber(${code}))`;
      // A BOOL the runtime marshals from any value: its truthiness.
      if (b === 'Bool' && !optional(swiftType)) return `jsTruthy(${code})`;
      return optional(swiftType) ? `(jsToNative(${code}) as? ${b})` : `(jsToNative(${code}) as! ${b})`;
    }
    if (NUMBERS.has(b) && tsType === 'Double' && b !== 'Double') return `${b}(${code})`;
    const bridged = bridge(code, tsType, swiftType);
    if (bridged) return bridged;
    if (b === 'Date' && base(tsType) === 'JSDate') return tsType.endsWith('?') ? `${code}.map { jsNativeDate($0) }` : `jsNativeDate(${code})`;
    // A Foundation array of objects where Swift has its element type (`NSArray<UIViewController>` as `[UIViewController]`).
    const elements = /^\[([\w.]+)\]$/.exec(b)?.[1];
    if (/^\[Any\][?!]?$/.test(tsType) && elements && elements !== 'Any') return optional(swiftType) ? `(${code} as? [${elements}])` : `(${code} as! [${elements}])`;
    if (tsType === 'Double' && this.isEnumType(b)) return `${b}(rawValue: ${this.rawTypeOf(b)}(${code}))${this.isOptionSet(b) ? '' : '!'}`;
    return code;
  }

  private enumTypes = new Map<string, { raw: string; options: boolean } | null>();

  /** A native struct by its Swift name (`CGRect`, `CATransform3D`): a value Swift compares by value. */
  isStructType(swift: string): boolean {
    if (!this.modules.size || !/^(__)?[A-Z][\w.]*$/.test(swift) || /^(Double|String|Bool|Void|Never|Signal|Emitter|EventData|Router)$|^JS/.test(swift)) return false;
    for (const m of this.searchModules()) if (Object.values(nativeTable(m).structs).some((x) => x.swift === swift)) return true;
    return false;
  }

  /** The modules the program's native declarations come from, and those their types live in (`UIRectEdge` is UIUtilities'). */
  private searchModules(): string[] {
    return [...new Set([...this.modules, ...(this.modules.has('UIKit') ? ['UIUtilities'] : [])])];
  }

  /** A JavaScript number where Swift has a native enum or option set: the value of that raw value. */
  enumFromNumber(code: string, swiftType: string): string {
    const b = swiftType.replace(/[?!]$/, '');
    return `${b}(rawValue: ${this.rawTypeOf(b)}(${code}))${this.isOptionSet(b) ? '' : '!'}`;
  }

  /** A type of named constants of any raw type (`CFRunLoopMode`, `NSNotification.Name`). */
  private isTypedConstants(swift: string): boolean {
    return this.typedConstantsRaw(swift) !== null;
  }

  /** The raw type of a type of named constants (`UIAccessibilityTraits` holds a UInt64), or null. */
  private typedConstantsRaw(swift: string): string | null {
    if (!this.modules.size || !/^(__)?[A-Z][\w.]*$/.test(swift)) return null;
    for (const m of this.searchModules()) {
      const e = Object.values(nativeTable(m).enums).find((x) => x.swift === swift && x.kind === 'typedConstants');
      if (e) return e.raw;
    }
    return null;
  }

  /** A type of named numbers (`UIAccessibilityTraits`), which script reads as numbers. */
  private isNumericConstants(swift: string): boolean {
    const raw = this.typedConstantsRaw(swift);
    return !!raw && NUMBERS.has(raw);
  }

  /** A string-valued type of named constants (`UIMenu.Identifier`, `NSAttributedString.Key`). */
  private isStringConstants(swift: string): boolean {
    return this.constantsRaw(swift) === 'String';
  }

  /** The raw type of a typed-constants struct (`UIFont.Weight` holds a CGFloat), or null. */
  private constantsRaw(swift: string): string | null {
    if (!this.modules.size || !/^(__)?[A-Z][\w.]*$/.test(swift)) return null;
    for (const m of this.searchModules()) for (const x of Object.values(nativeTable(m).enums)) if (x.swift === swift && x.kind === 'typedConstants' && x.raw) return x.raw;
    return null;
  }

  isEnumType(swift: string): boolean {
    return !!this.enumInfo(swift);
  }

  isOptionSetType(swift: string): boolean { return this.isOptionSet(swift); }

  private isOptionSet(swift: string): boolean {
    return this.enumInfo(swift)?.options ?? false;
  }

  private rawTypeOf(swift: string): string {
    return this.enumInfo(swift)?.raw ?? 'Int';
  }

  /** A native enum or option set by its Swift name, from the modules the program uses. */
  private enumInfo(swift: string): { raw: string; options: boolean } | null {
    if (!this.modules.size || !/^(__)?[A-Z][\w.]*$/.test(swift) || /^(Double|String|Bool|Void|Never|Signal|Emitter|EventData|Router)$|^JS/.test(swift)) return null;
    if (!this.enumTypes.has(swift)) {
      let found: { raw: string; options: boolean } | null = null;
      for (const m of this.searchModules()) {
        const e = Object.values(nativeTable(m).enums).find((x) => x.swift === swift && x.kind !== 'typedConstants');
        if (e) { found = { raw: e.raw, options: e.kind === 'options' }; break; }
      }
      this.enumTypes.set(swift, found);
    }
    return this.enumTypes.get(swift) ?? null;
  }
}

/** An expression whose value only decides a branch: a condition, the operand of `!`, or an operand of `&&`/`||` that is one or comes first. */
/** An expression whose value is only tested for truthiness: a condition, or what `!` negates. */
function onlyTested(e: ts.Expression): boolean {
  const p = e.parent;
  if (ts.isParenthesizedExpression(p)) return onlyTested(p);
  if (ts.isPrefixUnaryExpression(p)) return p.operator === ts.SyntaxKind.ExclamationToken;
  if (ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) return p.expression === e;
  if (ts.isConditionalExpression(p) || ts.isForStatement(p)) return p.condition === e;
  return false;
}

function tested(e: ts.Expression): boolean {
  const p = e.parent;
  if (ts.isParenthesizedExpression(p)) return tested(p);
  if (ts.isPrefixUnaryExpression(p)) return p.operator === ts.SyntaxKind.ExclamationToken;
  if (ts.isBinaryExpression(p) && (p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || p.operatorToken.kind === ts.SyntaxKind.BarBarToken)) return p.left === e || tested(p);
  if (ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) return p.expression === e;
  if (ts.isConditionalExpression(p) || ts.isForStatement(p)) return p.condition === e;
  return false;
}

function inStaticMember(n: ts.Node): boolean {
  for (let p = n.parent; p?.parent; p = p.parent) {
    if (ts.isClassLike(p.parent) && ts.isClassElement(p)) return ts.getModifiers(p as ts.ClassElement & ts.HasModifiers)?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword) ?? false;
  }
  return false;
}

function splitTypes(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out.filter(Boolean);
}

export type { NativeMethod, NativeProperty };

/** A block parameter's Swift type (`((A, B) -> R)?`, `@escaping (A) -> Void`) as parameter and result types. */
function blockType(type: SwiftType): { text: string; params: string[]; result: string } | null {
  // Attributes (`@escaping`, `@Sendable`, `@MainActor`) do not change how a closure is written.
  const bare = (x: string) => x.trim().replace(/^(?:@\w+\s*)+/, '');
  let t = bare(type);
  if (t.endsWith('?') || t.endsWith('!')) t = t.slice(0, -1);
  while (t.startsWith('(') && matching(t, 0) === t.length - 1) t = bare(t.slice(1, -1));
  if (!t.startsWith('(')) return null;
  const close = matching(t, 0);
  const rest = /^\s*(?:throws\s*)?->\s*(.+)$/.exec(t.slice(close + 1));
  if (!rest) return null;
  const inner = t.slice(1, close).trim();
  const params = inner ? splitTypes(inner) : [];
  return { text: `(${params.join(', ')}) -> ${rest[1]}`, params, result: rest[1].trim() };
}

function matching(t: string, open: number): number {
  let depth = 0;
  for (let i = open; i < t.length; i++) {
    if (t[i] === '(' || t[i] === '[' || t[i] === '<') depth++;
    else if (t[i] === ')' || t[i] === ']' || (t[i] === '>' && t[i - 1] !== '-')) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** Whether code assigns a field of the variable `sym` names (`size.width = 0`). */
function writesField(node: ts.Node, sym: ts.Symbol | undefined, checker: ts.TypeChecker): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isPropertyAccessExpression(n.left)
        && ts.isIdentifier(n.left.expression) && checker.getSymbolAtLocation(n.left.expression) === sym) { found = true; return; }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/**
 * An optional native value where script's type is `tsType`: optional stays optional; one lenient code holds implicitly
 * unwrapped (`implicit`, or a `T!` type) is read through `jsImplicit`, which unwraps only where a value is needed, as
 * JavaScript reads a missing one as undefined; anything else is unwrapped.
 */
function unwrapAs(optionalCode: string, tsType: string, implicit: boolean): string {
  if (tsType.endsWith('?')) return optionalCode;
  return implicit || tsType.endsWith('!') ? `jsImplicit(${optionalCode})` : `${optionalCode}!`;
}
