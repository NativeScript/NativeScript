import ts from 'typescript';

// JavaScript semantics both translators share, decided from the syntax tree and the checker.

/** `Intl.NumberFormat` or `Intl.DateTimeFormat`, as the library declares `Intl`: which one. */
export function intlConstructor(e: ts.Expression, checker: ts.TypeChecker): 'NumberFormat' | 'DateTimeFormat' | null {
  if (!ts.isPropertyAccessExpression(e) || !ts.isIdentifier(e.expression) || e.expression.text !== 'Intl') return null;
  if (!checker.getSymbolAtLocation(e.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return null;
  return e.name.text === 'NumberFormat' || e.name.text === 'DateTimeFormat' ? e.name.text : null;
}

/** A setter that only assigns its value to a member of `this`'s (`this.style.color = value`): that member. */
export function forwardedSetter(set: ts.FunctionLikeDeclaration): ts.PropertyAccessExpression | null {
  const params = set.parameters.filter((q) => !(ts.isIdentifier(q.name) && q.name.text === 'this'));
  const p = params.length === 1 ? params[0] : undefined;
  const only = set.body && ts.isBlock(set.body) && set.body.statements.length === 1 ? set.body.statements[0] : undefined;
  if (!p || !ts.isIdentifier(p.name) || !only || !ts.isExpressionStatement(only)) return null;
  const e = only.expression;
  if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier(e.right) || e.right.text !== p.name.text || !ts.isPropertyAccessExpression(e.left)) return null;
  let base: ts.Expression = e.left.expression;
  while (ts.isPropertyAccessExpression(base) || ts.isParenthesizedExpression(base) || ts.isAsExpression(base)) base = base.expression;
  return base.kind === ts.SyntaxKind.ThisKeyword ? e.left : null;
}

/** `String.raw` as the library declares it. */
export function isStringRaw(tag: ts.Expression, checker: ts.TypeChecker): boolean {
  if (!ts.isPropertyAccessExpression(tag) || tag.name.text !== 'raw' || !ts.isIdentifier(tag.expression) || tag.expression.text !== 'String') return false;
  return !!checker.getSymbolAtLocation(tag.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
}

/**
 * A name the app only declares (`declare const x`), outside the names a
 * bundler defines (`__DEV__`, `__IOS__`), or a member the language's library
 * does not declare on one of its globals (`Reflect.metadata`, which a shim
 * adds): nothing defines it at run time, so `typeof` reads it as undefined.
 */
export function neverDefined(e: ts.Expression, checker: ts.TypeChecker): boolean {
  if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)) {
    const decls = checker.getSymbolAtLocation(e.expression)?.declarations;
    return !!decls?.length && decls.every((d) => /[\\/]lib\.[\w.]*\.d\.ts$/.test(d.getSourceFile().fileName)) && !checker.getTypeAtLocation(e.expression).getProperty(e.name.text);
  }
  if (!ts.isIdentifier(e) || e.text.startsWith('__')) return false;
  const decls = checker.getSymbolAtLocation(e)?.declarations;
  return !!decls?.length && decls.every((d) => !d.getSourceFile().isDeclarationFile && !!(d.flags & ts.NodeFlags.Ambient));
}

/** A template's cooked and raw strings and its substitutions. */
export function templateParts(t: ts.TemplateLiteral): { cooked: string[]; raw: string[]; values: ts.Expression[] } {
  if (ts.isNoSubstitutionTemplateLiteral(t)) return { cooked: [t.text], raw: [t.rawText ?? t.text], values: [] };
  return {
    cooked: [t.head.text, ...t.templateSpans.map((s) => s.literal.text)],
    raw: [t.head.rawText ?? t.head.text, ...t.templateSpans.map((s) => s.literal.rawText ?? s.literal.text)],
    values: t.templateSpans.map((s) => s.expression),
  };
}

/** `Object.prototype.toString.call`, as the library declares `Object`. */
export function isObjectToStringCall(callee: ts.Expression, checker: ts.TypeChecker): boolean {
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'call') return false;
  const fn = callee.expression;
  if (!ts.isPropertyAccessExpression(fn) || fn.name.text !== 'toString' || !ts.isPropertyAccessExpression(fn.expression) || fn.expression.name.text !== 'prototype') return false;
  const owner = fn.expression.expression;
  return ts.isIdentifier(owner) && owner.text === 'Object' && !!checker.getSymbolAtLocation(owner)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
}

/** A property name as the key it makes: computed names only when the checker knows their literal value. */
export function literalKey(name: ts.PropertyName, checker: ts.TypeChecker): string | null {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
  if (ts.isNumericLiteral(name)) return String(Number(name.text.replace(/_/g, '')));
  if (ts.isComputedPropertyName(name)) {
    const t = checker.getTypeAtLocation(name.expression);
    if (t.isStringLiteral()) return t.value;
    if (t.isNumberLiteral()) return String(t.value);
  }
  return null;
}

/** Keys in the order JavaScript enumerates an object's own keys: array indexes ascending, then the rest as written. */
export function jsKeyOrder(keys: string[]): string[] {
  const index = (k: string) => /^(0|[1-9]\d{0,9})$/.test(k) && Number(k) < 4294967295;
  return [...keys.filter(index).sort((a, b) => Number(a) - Number(b)), ...keys.filter((k) => !index(k))];
}

/** The kit's names for members a well-known symbol names (`[Symbol.iterator]`, `__@iterator@12` in the checker). */
export const WELL_KNOWN_MEMBERS: Record<string, string> = { iterator: 'jsSymbolIterator', asyncIterator: 'jsSymbolAsyncIterator', toPrimitive: 'jsToPrimitive', toStringTag: 'jsToStringTag' };

/** A property's name as the checker spells a well-known symbol's (`__@iterator@12`): the kit's member name. */
export function wellKnownMember(name: string): string | null {
  const m = /^__@(\w+)@\d+$/.exec(name);
  return m ? WELL_KNOWN_MEMBERS[m[1]] ?? null : null;
}

/** An object type of only RegExp's protocol methods (the string methods' `{ [Symbol.replace](…) }` overloads): a RegExp, the one object the kits give them. */
export function isRegExpProtocol(t: ts.Type): boolean {
  if (!(t.flags & ts.TypeFlags.Object) || !((t as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous)) return false;
  const own = t.getProperties();
  return own.length > 0 && own.every((p) => /^__@(replace|split|match|matchAll|search)@\d+$/.test(p.name));
}

/** An assertion from untyped to RegExp's protocol methods (`x as any as { [Symbol.replace](…) }`), alone or as a `? :` branch: its value may be anything, not only a RegExp. */
export function assertedPattern(x: ts.Expression, checker: ts.TypeChecker): boolean {
  x = ts.skipParentheses(x);
  if (ts.isConditionalExpression(x)) return assertedPattern(x.whenTrue, checker) || assertedPattern(x.whenFalse, checker);
  return (ts.isAsExpression(x) || ts.isTypeAssertionExpression(x)) && isRegExpProtocol(checker.getTypeAtLocation(x)) && !!(checker.getTypeAtLocation(x.expression).flags & ts.TypeFlags.Any);
}

/**
 * Why a string method's pattern argument can't be translated, or null: a replacement that may be a function for a
 * pattern that may be a string (JavaScript calls it with the match, its index and the string).
 */
export function unsupportedPattern(name: string, call: ts.CallExpression, checker: ts.TypeChecker): string | null {
  const [pattern, replacement] = call.arguments;
  if ((name !== 'replace' && name !== 'replaceAll') || !pattern || !replacement) return null;
  const r = checker.getTypeAtLocation(replacement);
  if (!(r.flags & ts.TypeFlags.Any) && !r.getCallSignatures().length) return null;
  const t = checker.getTypeAtLocation(pattern);
  const regexp = (x: ts.Type) => x.getSymbol()?.name === 'RegExp' || isRegExpProtocol(x);
  if ((t.isUnion() ? t.types.every(regexp) : regexp(t)) && !assertedPattern(pattern, checker)) return null;
  return 'a replacement that may be a function, for a pattern that may be a string';
}

/**
 * `type A = B & { x: T }` over non-generic interfaces and type literals only: the members of the type it names, each
 * property's first declaration, as one interface's. Null for any other alias.
 */
// A spread source whose fields are only known when it runs (`T`, `T & U`, `Partial<T>`): no fixed shape holds them all.
export function openSpreadType(t: ts.Type): boolean {
  if (t.isUnionOrIntersection()) return t.types.some(openSpreadType);
  if (t.flags & ts.TypeFlags.Instantiable) return true;
  return !!t.aliasTypeArguments?.some(openSpreadType) && !!(ts.getObjectFlags(t) & ts.ObjectFlags.Mapped);
}

export function intersectionAliasMembers(st: ts.TypeAliasDeclaration, checker: ts.TypeChecker): ts.TypeElement[] | null {
  if (!ts.isIntersectionTypeNode(st.type) || st.typeParameters?.length) return null;
  const sym = checker.getSymbolAtLocation(st.name);
  const t = sym && checker.getDeclaredTypeOfSymbol(sym);
  if (!t?.isIntersection()) return null;
  const plain = (u: ts.Type) => {
    const decls = u.getSymbol()?.declarations ?? [];
    return !!(u.flags & ts.TypeFlags.Object) && decls.length > 0 && !u.getCallSignatures().length && !u.getConstructSignatures().length && !u.getStringIndexType() && !u.getNumberIndexType()
      && decls.every((d) => ts.isTypeLiteralNode(d) || (ts.isInterfaceDeclaration(d) && !d.typeParameters?.length));
  };
  if (!t.types.every(plain)) return null;
  return t.getProperties().flatMap((p) => p.declarations?.filter((d): d is ts.TypeElement => ts.isPropertySignature(d) || ts.isMethodSignature(d)).slice(0, 1) ?? []);
}

/** A type's `[Symbol.iterator]` (or `[Symbol.asyncIterator]`) member. */
function iteratorMember(t: ts.Type, async: boolean): ts.Symbol | undefined {
  return t.getProperties().find((p) => p.escapedName.toString().startsWith(async ? '__@asyncIterator@' : '__@iterator@'));
}

const ITERATING_SCRIPT = new Set(['Generator', 'Iterator', 'IterableIterator', 'IteratorObject', 'Iterable', 'AsyncGenerator', 'AsyncIterator', 'AsyncIterableIterator', 'AsyncIteratorObject', 'AsyncIterable']);
const ITERATING_BUILTIN = new Set(['Array', 'ReadonlyArray', 'Map', 'ReadonlyMap', 'Set', 'ReadonlySet', 'String', 'ArrayIterator', 'MapIterator', 'SetIterator', 'StringIterator', 'RegExpStringIterator', 'TemplateStringsArray',
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array']);

/**
 * Whether iterating a value of this type runs script (a generator's body, an
 * iterator class's `next`), which can throw: `for…of`, spread and
 * destructuring over it step the iteration protocol. Arrays, strings, maps,
 * sets and their built-in iterators iterate natively.
 */
export function iterationThrows(t: ts.Type, checker: ts.TypeChecker): boolean {
  if (t.isUnion()) return t.types.some((u) => !(u.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) && iterationThrows(u, checker));
  if (t.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return false;
  if (checker.isArrayType(t) || checker.isTupleType(t)) return false;
  const name = (t.aliasSymbol ?? t.getSymbol())?.getName() ?? '';
  if (ITERATING_BUILTIN.has(name)) return false;
  if (ITERATING_SCRIPT.has(name)) return true;
  return !!iteratorMember(t, false) || !!iteratorMember(t, true);
}

/** The type of the values an iterable yields (`T` of its `[Symbol.iterator]().next()`'s `IteratorYieldResult<T>`). */
export function iteratedType(t: ts.Type, checker: ts.TypeChecker, where: ts.Node, async = false): ts.Type | undefined {
  const member = iteratorMember(t, async);
  const iterator = member ? checker.getTypeOfSymbolAtLocation(member, where).getCallSignatures()[0]?.getReturnType() : t;
  if (!iterator) return undefined;
  const next = iterator.getProperty('next');
  let result = next && checker.getTypeOfSymbolAtLocation(next, where).getCallSignatures()[0]?.getReturnType();
  if (!result) return undefined;
  if (async) result = checker.getAwaitedType(result) ?? result;
  const parts = result.isUnion() ? result.types : [result];
  const yielded = parts.filter((p) => {
    const done = p.getProperty('done');
    const dt = done && checker.getTypeOfSymbolAtLocation(done, where);
    return !dt || !(dt.flags & ts.TypeFlags.BooleanLiteral) || checker.typeToString(dt) !== 'true';
  });
  const values = yielded.map((p) => p.getProperty('value')).filter((v): v is ts.Symbol => !!v).map((v) => checker.getTypeOfSymbolAtLocation(v, where));
  if (!values.length) return undefined;
  return values.length === 1 ? values[0] : (checker as unknown as { getUnionType(types: ts.Type[]): ts.Type }).getUnionType(values);
}

/**
 * A member read's receiver that TypeScript's types let through though it can
 * be missing at run time: a non-null assertion (`x!.name`), or an array
 * element of an object type (`items[i].name`, read past the end). The read
 * throws JavaScript's TypeError there; which value is missing names it in the message.
 */
export function unsafeReceiver(target: ts.Expression, checker: ts.TypeChecker): 'undefined' | 'null' | null {
  while (ts.isParenthesizedExpression(target)) target = target.expression;
  const objectLike = (t: ts.Type) => !(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.ESSymbolLike | ts.TypeFlags.EnumLike | ts.TypeFlags.TypeParameter));
  if (ts.isNonNullExpression(target)) {
    // A front end's own assertion on a signal it set before any template reads it (`this.x.value!`).
    const held = ts.isPropertyAccessExpression(target.expression) ? checker.getSymbolAtLocation(target.expression.name)?.declarations?.[0] : undefined;
    if (held?.getSourceFile().fileName.startsWith('/__shims__/')) return null;
    const t = checker.getTypeAtLocation(target.expression);
    const parts = t.isUnion() ? t.types : [t];
    const undefinedOk = parts.some((p) => p.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void));
    const nullOk = parts.some((p) => p.flags & ts.TypeFlags.Null);
    if (!undefinedOk && !nullOk) return null;
    return objectLike(checker.getNonNullableType(t)) ? (nullOk && !undefinedOk ? 'null' : 'undefined') : null;
  }
  if (ts.isElementAccessExpression(target) && !target.questionDotToken && checker.isArrayType(checker.getNonNullableType(checker.getTypeAtLocation(target.expression)))) {
    const el = checker.getTypeAtLocation(target);
    return objectLike(el) && !(el.isUnion() && el.types.some((p) => p.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))) ? 'undefined' : null;
  }
  return null;
}

/**
 * `re.exec(s)` or `s.match(re)` typed without the null of no match, as a program checked without strictNullChecks
 * types it: a member read of it is JavaScript's TypeError where there is no match.
 */
export function uncheckedMatch(target: ts.Expression, checker: ts.TypeChecker): boolean {
  while (ts.isParenthesizedExpression(target)) target = target.expression;
  if (!ts.isCallExpression(target) || !ts.isPropertyAccessExpression(target.expression) || !['exec', 'match'].includes(target.expression.name.text)) return false;
  const decl = checker.getResolvedSignature(target)?.declaration;
  const owner = decl && ts.isMethodSignature(decl) && ts.isInterfaceDeclaration(decl.parent) ? decl.parent.name.text : null;
  if (!decl || !/[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName) || owner !== (target.expression.name.text === 'exec' ? 'RegExp' : 'String')) return false;
  const t = checker.getTypeAtLocation(target);
  return !(t.isUnion() && t.types.some((p) => p.flags & ts.TypeFlags.Null));
}

/**
 * The member read a statement starts with when its receiver is narrowed to
 * `never` (`x.android` in the else of `if (x)`, x an object, as folding
 * `if (__APPLE__ && x)` leaves it): that code runs only when x is null or
 * undefined, so it throws there before anything else in it runs.
 */
export function leadingNeverRead(st: ts.Statement, checker: ts.TypeChecker): ts.PropertyAccessExpression | null {
  let e: ts.Expression | undefined = ts.isExpressionStatement(st) ? st.expression
    : ts.isVariableStatement(st) ? st.declarationList.declarations[0]?.initializer
    : ts.isReturnStatement(st) || ts.isThrowStatement(st) ? st.expression : undefined;
  while (e) {
    if (ts.isPropertyAccessExpression(e) && !e.questionDotToken && checker.getTypeAtLocation(e.expression).flags & ts.TypeFlags.Never) return e;
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isNonNullExpression(e) || ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isCallExpression(e)) e = e.expression;
    else if (ts.isBinaryExpression(e) && !(e.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastAssignment)) e = e.left;
    else return null;
  }
  return null;
}

/** Whether a statement beside a `for` declares one of the loop's variable names. */
export function redeclaredBeside(loop: ts.ForStatement, list: ts.VariableDeclarationList): boolean {
  const names = new Set(list.declarations.flatMap((d) => (ts.isIdentifier(d.name) ? [d.name.text] : [])));
  const parent = ts.isLabeledStatement(loop.parent) ? loop.parent.parent : loop.parent;
  const siblings = ts.isBlock(parent) || ts.isSourceFile(parent) || ts.isModuleBlock(parent) || ts.isCaseClause(parent) || ts.isDefaultClause(parent) ? parent.statements : [];
  const declares = (st: ts.Statement): boolean => {
    const inner = ts.isLabeledStatement(st) ? st.statement : st;
    const l = ts.isVariableStatement(inner) ? inner.declarationList : ts.isForStatement(inner) && inner.initializer && ts.isVariableDeclarationList(inner.initializer) ? inner.initializer : null;
    return !!l && l.declarations.some((d) => ts.isIdentifier(d.name) && names.has(d.name.text));
  };
  return siblings.some((st) => st !== loop && st !== loop.parent && declares(st));
}

/**
 * Whether an array method's callback runs the same whatever thisArg gives it as `this`: an arrow,
 * a function that never reads `this`, or `this.method` beside `this` (a method value is bound to its object).
 */
export function ignoresThisArg(callback: ts.Expression, thisArg: ts.Expression, checker: ts.TypeChecker): boolean {
  while (ts.isParenthesizedExpression(callback)) callback = callback.expression;
  if (ts.isArrowFunction(callback)) return true;
  if (ts.isFunctionExpression(callback)) return !readsThis(callback);
  if (ts.isPropertyAccessExpression(callback)) return callback.expression.kind === ts.SyntaxKind.ThisKeyword && thisArg.kind === ts.SyntaxKind.ThisKeyword;
  if (!ts.isIdentifier(callback)) return false;
  let sym = checker.getSymbolAtLocation(callback);
  if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
  const decl = sym?.valueDeclaration;
  return !!decl && ts.isFunctionDeclaration(decl) && !!decl.body && !readsThis(decl);
}

/** Whether a function's own `this` is read: in its body or an arrow function's inside it. */
function readsThis(fn: ts.FunctionLikeDeclaration): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (n.kind === ts.SyntaxKind.ThisKeyword) { found = true; return; }
    if (ts.isFunctionLike(n) && !ts.isArrowFunction(n)) return;
    if (ts.isClassLike(n)) return;
    ts.forEachChild(n, visit);
  };
  for (const p of fn.parameters) visit(p);
  if (fn.body) visit(fn.body);
  return found;
}

/** A class's `implements` types that are interfaces: implementing a class (even itself) only checks its shape. */
export function implementedInterfaces(checker: ts.TypeChecker, cls: ts.ClassLikeDeclaration): ts.ExpressionWithTypeArguments[] {
  return (cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []).filter((i) => {
    let s = checker.getSymbolAtLocation(i.expression);
    if (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
    return !(s && s.flags & ts.SymbolFlags.Class);
  });
}

/**
 * Types the generated Swift names without qualification (the standard library's, the Foundation types it uses): a program
 * type of one of these names would hide it from the module's code, so it takes its module's name. Other native classes keep
 * the program's name for its type and are written with their module (`Foundation.ProcessInfo`).
 */
export const SWIFT_NATIVE_TYPES = new Set(`Any AnyClass AnyHashable AnyObject Array ArraySlice AsyncSequence AsyncStream Bool
  CGFloat CGRect Character ClosedRange Codable Collection Comparable ContiguousArray CustomStringConvertible Data Date Decodable Dictionary
  Double Duration Encodable Equatable Error Float Float32 Float64 Hashable Hasher Int Int16 Int32 Int64 Int8
  IteratorProtocol KeyPath MainActor Mirror NSArray NSData NSDate NSDictionary NSError NSNumber NSObject NSString
  NSURL Never ObjectIdentifier Optional Range RawRepresentable Regex Result Selector Sendable Sequence Set
  StaticString String Substring Task UInt UInt16 UInt32 UInt64 UInt8 Unicode Void`.split(/\s+/));

/** As `SWIFT_NATIVE_TYPES`, Kotlin's: its default imports (kotlin.*, kotlin.collections.*, kotlin.text.*, …, java.lang.*). */
export const KOTLIN_NATIVE_TYPES = new Set(`AbstractCollection AbstractIterator AbstractList AbstractMap AbstractSet Annotation
  Any Appendable ArithmeticException Array ArrayDeque ArrayList AssertionError AutoCloseable Boolean BooleanArray Byte
  ByteArray Char CharArray CharRange CharSequence Character Charsets Class ClassCastException ClassLoader Cloneable
  ClosedRange Collection Comparable Comparator ConcurrentModificationException Deprecated Double DoubleArray Enum Error
  Exception Float FloatArray Function Grouping HashMap HashSet IllegalArgumentException IllegalStateException
  IndexOutOfBoundsException IndexedValue Int IntArray IntRange Integer InterruptedException Iterable Iterator JvmField
  JvmName JvmOverloads JvmStatic Lazy LinkedHashMap LinkedHashSet List ListIterator Long LongArray LongRange Map MatchGroup
  MatchResult Math Metadata Module MustBeDocumented MutableCollection MutableIterable MutableIterator MutableList
  MutableListIterator MutableMap MutableSet NoSuchElementException NotImplementedError Nothing NullPointerException Number
  NumberFormatException Object OptIn Override Package Pair Process ProcessBuilder Readable Record Regex RegexOption
  ReplaceWith Repeatable Result Retention Runnable Runtime RuntimeException Sequence SequenceScope Set Short ShortArray
  StackTraceElement StrictMath String StringBuffer StringBuilder Suppress Synchronized System Target Thread ThreadLocal
  Throwable Throws Transient Triple Typography UByte UInt ULong UShort UnsupportedOperationException Unit Void
  Volatile`.split(/\s+/));

/**
 * `Object.defineProperty(target, key, …)` with a key known only at run time, or `Object.defineProperties(target, map)` with
 * a map that is no literal of literal keys, on an untyped target (any, unknown, object, a type parameter).
 */
export function definesRunTimeKey(call: ts.CallExpression, checker: ts.TypeChecker): boolean {
  const [target, key] = call.arguments;
  if (!target || !key || !ts.isPropertyAccessExpression(call.expression) || !ts.isIdentifier(call.expression.expression) || call.expression.expression.text !== 'Object') return false;
  if (ts.isPropertyAccessExpression(target) && target.name.text === 'prototype') return false;
  const t = checker.getTypeAtLocation(target);
  if (!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive | ts.TypeFlags.TypeParameter))) return false;
  if (call.expression.name.text === 'defineProperty') {
    const k = checker.getTypeAtLocation(key);
    return !(k.isUnion() ? k.types : [k]).every((x) => x.isStringLiteral() || x.isNumberLiteral());
  }
  if (call.expression.name.text !== 'defineProperties') return false;
  return !ts.isObjectLiteralExpression(key) || key.properties.some((p) => !p.name || literalKey(p.name, checker) == null);
}

/** Whether a program type of this name would hide one of the runtime's from the generated code. */
export function runtimeTypeName(name: string): boolean {
  return /^JS[A-Z]/.test(name);
}

/**
 * `object.name` where the object is an instance of a program class and the type checker finds no member `name`: an own
 * property of the instance, read and written by name. Only code checked leniently reaches here: a plugin's component is
 * typed by the plugin's declarations but compiled against its platform file, whose stub class may declare none of them.
 */
export function undeclaredMemberOf(e: ts.PropertyAccessExpression, checker: ts.TypeChecker): ts.ClassLikeDeclaration | null {
  if (checker.getSymbolAtLocation(e.name)) return null;
  const t = checker.getNonNullableType(checker.getTypeAtLocation(e.expression));
  if (t.getConstructSignatures().length) return null;
  const decl = t.getSymbol()?.valueDeclaration;
  return decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile ? decl : null;
}

/**
 * The program classes, each the root of its program hierarchy, whose instances the program holds untyped (`as any`, an
 * `any` variable or parameter given one), where script may give them members their classes don't declare. `open`: held as
 * `object`, `{}` or a type parameter as well, by any expression.
 */
export function classesHeldUntyped(files: readonly ts.SourceFile[], checker: ts.TypeChecker, open = false): Set<ts.ClassLikeDeclaration> {
  const roots = new Set<ts.ClassLikeDeclaration>();
  const classOf = (n: ts.Expression) => {
    const d = checker.getNonNullableType(checker.getTypeAtLocation(n)).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  };
  const untyped = (t: ts.Type | undefined) => !!t && (!!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))
    || (open && (!!(t.flags & (ts.TypeFlags.NonPrimitive | ts.TypeFlags.TypeParameter)) || (!!(t.flags & ts.TypeFlags.Object) && !t.getProperties().length && !t.getCallSignatures().length && !t.getConstructSignatures().length && !checker.getIndexInfosOfType(t).length))));
  // An argument of a library function (`JSON.stringify(x)`, `Object.keys(x)`) goes nowhere else, but Object.defineProperty's target.
  const givenToLibrary = (n: ts.Expression) => {
    const call = n.parent;
    if (!(ts.isCallExpression(call) || ts.isNewExpression(call)) || !call.arguments?.includes(n)) return false;
    const d = checker.getResolvedSignature(call)?.declaration;
    if (!d || !d.getSourceFile().isDeclarationFile) return false;
    return !(ts.isCallExpression(call) && call.arguments[0] === n && ts.isPropertyAccessExpression(call.expression) && ['defineProperty', 'defineProperties'].includes(call.expression.name.text));
  };
  const visit = (n: ts.Node) => {
    let held: ts.Expression | undefined;
    if ((ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && untyped(checker.getTypeFromTypeNode(n.type))) held = n.expression;
    else if ((ts.isNewExpression(n) || ts.isIdentifier(n) || n.kind === ts.SyntaxKind.ThisKeyword || (open && (ts.isPropertyAccessExpression(n) || ts.isCallExpression(n) || ts.isElementAccessExpression(n))))
      && ts.isExpression(n) && !ts.isPropertyAccessExpression(n.parent) && untyped(checker.getContextualType(n)) && !(open && givenToLibrary(n))) held = n;
    // `Object.assign(instance, …)` gives it the sources' keys.
    else if (ts.isCallExpression(n) && n.arguments.length && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'assign' && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === 'Object') held = n.arguments[0];
    // A class with a string index signature takes any key.
    let cls = held ? classOf(held) : ts.isClassLike(n) && n.members.some((m) => ts.isIndexSignatureDeclaration(m) && !hasStatic(m)) ? n : undefined;
    for (let h = cls?.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]; cls && h; h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]) {
      const d = checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      if (!d || !ts.isClassLike(d) || d.getSourceFile().isDeclarationFile) break;
      cls = d;
    }
    if (cls) roots.add(cls);
    ts.forEachChild(n, visit);
  };
  for (const sf of files) if (!sf.isDeclarationFile) visit(sf);
  return roots;
}

/** The program classes, each the root of its program hierarchy, whose instances are given members their classes don't declare. */
export function classesGivenUndeclaredMembers(files: readonly ts.SourceFile[], checker: ts.TypeChecker): Set<ts.ClassLikeDeclaration> {
  const roots = new Set<ts.ClassLikeDeclaration>();
  const baseOf = (cls: ts.ClassLikeDeclaration) => {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  };
  const visit = (n: ts.Node) => {
    if (ts.isPropertyAccessExpression(n)) {
      let cls = undeclaredMemberOf(n, checker);
      for (let b = cls && baseOf(cls); b; b = baseOf(b)) cls = b;
      if (cls) roots.add(cls);
    }
    // A member written through a downcast (`(view as TextField).hint = …`, held untyped): the object may be another class's.
    if (ts.isPropertyAccessExpression(n) && ts.isBinaryExpression(n.parent) && n.parent.left === n && n.parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      let r: ts.Node = ts.skipParentheses(n.expression);
      const v = ts.isIdentifier(r) ? checker.getSymbolAtLocation(r)?.valueDeclaration : undefined;
      if (v && ts.isVariableDeclaration(v) && !v.type && v.initializer && ts.isVariableStatement(v.parent.parent)) r = ts.skipParentheses(v.initializer);
      if ((ts.isAsExpression(r) || ts.isTypeAssertionExpression(r)) && downcast(checker, r, (d) => !!d && !d.getSourceFile().isDeclarationFile)) {
        const from = checker.getNonNullableType(checker.getTypeAtLocation(r.expression));
        const visitClasses = (x: ts.Node): void => {
          if (ts.isClassLike(x) && checker.isTypeAssignableTo(checker.getTypeAtLocation(x.name ?? x), from)) {
            let cls: ts.ClassLikeDeclaration | undefined = x;
            for (let b = baseOf(x); b; b = baseOf(b)) cls = b;
            roots.add(cls);
          }
          ts.forEachChild(x, visitClasses);
        };
        for (const sf of files) if (!sf.isDeclarationFile) visitClasses(sf);
      }
    }
    // `Object.defineProperty(instance, key, …)`, `Object.defineProperties(instance, …)`: members its class does not declare.
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === 'Object'
        && ['defineProperty', 'defineProperties'].includes(n.expression.name.text) && n.arguments.length) {
      let cls: ts.ClassLikeDeclaration | undefined;
      const d = checker.getTypeAtLocation(n.arguments[0]).getSymbol()?.valueDeclaration;
      if (d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile) cls = d;
      for (let b = cls && baseOf(cls); b; b = baseOf(b)) cls = b;
      if (cls) roots.add(cls);
    }
    ts.forEachChild(n, visit);
  };
  for (const sf of files) if (!sf.isDeclarationFile) visit(sf);
  return roots;
}

/**
 * The keys `Object.defineProperty`/`defineProperties` names on an object of no class type (`any`, `unknown`, `object`, a
 * type parameter): any program class's field of that name may be the one it defines, so its objects keep the descriptor.
 */
export function keysDefinedUntyped(files: readonly ts.SourceFile[], checker: ts.TypeChecker): Set<string> {
  const keys = new Set<string>();
  const untyped = (t: ts.Type) => !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive | ts.TypeFlags.TypeParameter));
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === 'Object' && n.arguments.length >= 2
      && untyped(checker.getTypeAtLocation(n.arguments[0]))) {
      if (n.expression.name.text === 'defineProperty') {
        const t = checker.getTypeAtLocation(n.arguments[1]);
        for (const part of t.isUnion() ? t.types : [t]) if (part.isStringLiteral()) keys.add(part.value);
      } else if (n.expression.name.text === 'defineProperties' && ts.isObjectLiteralExpression(n.arguments[1])) {
        for (const p of n.arguments[1].properties) {
          const k = p.name && literalKey(p.name, checker);
          if (k !== null && k !== undefined) keys.add(k);
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  for (const sf of files) if (!sf.isDeclarationFile) visit(sf);
  return keys;
}

// ---- The trust rule ------------------------------------------------------------------------------------------------
// A TypeScript type is a contract only where TypeScript proves it. A value whose type it cannot prove may be anything
// JavaScript allows there, so the slot it is placed in holds whatever it is, converted where it is used; the compiled
// code checks only where JavaScript itself throws (a member of undefined, a call of a non-function).

/** Where an unproven type comes from. */
export type Origin =
  | 'any' // any or unknown
  | 'asserted' // `x as T`, `<T>x` or `x!` that narrows what x is
  | 'lenient' // declared in code checked without strictNullChecks (core, most plugins, a non-strict app)
  | 'native' // a platform declaration's result or field
  | 'dynamic' // an element or index read
  | 'callback' // a parameter of a function that code not checked strictly calls
  | 'loose'; // a read of a slot an untrusted value was placed in

/** What the trust rule asks of a translator. */
export interface TrustScope {
  readonly checker: ts.TypeChecker;
  /** Whether a program file is checked with strictNullChecks. */
  strictFile(file: ts.SourceFile): boolean;
  /** Whether a declaration is a platform's (an iOS or Android typing). */
  nativeDeclaration(d: ts.Declaration): boolean;
  /** Whether an untrusted value was placed in this declaration somewhere in the program (see `LooseSlots`). */
  looseSlot?(d: ts.Declaration): boolean;
}

const LIB_FILE = /[\\/]typescript[\\/]lib[\\/]|[\\/]lib\.[\w.]*\.d\.ts$/;

/** Where a value's type comes from when TypeScript cannot prove it; null when it can. */
export function originOf(e: ts.Expression, scope: TrustScope): Origin | null {
  const { checker } = scope;
  e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
  const untyped = (t: ts.Type) => !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  if (untyped(checker.getTypeAtLocation(e))) return 'any';
  if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e)) {
    const from = checker.getTypeAtLocation(e.expression), to = checker.getTypeAtLocation(e);
    if (untyped(from)) return 'asserted';
    // An upcast (`label as View`) proves itself; anything narrower is the assertion's word only.
    return checker.isTypeAssignableTo(from, to) ? originOf(e.expression, scope) : 'asserted';
  }
  if (ts.isNonNullExpression(e)) return 'asserted';
  if (ts.isElementAccessExpression(e)) {
    const target = checker.getNonNullableType(checker.getTypeAtLocation(e.expression));
    // A tuple's element at a literal index is what the tuple declares.
    if (checker.isTupleType(target) && ts.isNumericLiteral(e.argumentExpression)) return originOf(e.expression, scope);
    return 'dynamic';
  }
  if (ts.isCallExpression(e) || ts.isNewExpression(e)) {
    if (ts.isNewExpression(e)) return null;
    const decl = checker.getResolvedSignature(e)?.getDeclaration();
    return decl && !ts.isJSDocSignature(decl) ? declarationOrigin(decl, scope) : null;
  }
  if (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e)) {
    let sym = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    const decl = sym?.valueDeclaration ?? sym?.declarations?.[0];
    if (!decl) return ts.isPropertyAccessExpression(e) ? 'dynamic' : null;
    if (ts.isParameter(decl) && calledByUntrusted(decl, scope)) return 'callback';
    return declarationOrigin(decl, scope);
  }
  return null;
}

/** Where a declaration's type comes from, as `originOf` reads a value it declares. */
export function declarationOrigin(d: ts.Declaration, scope: TrustScope): Origin | null {
  const file = d.getSourceFile();
  if (file.isDeclarationFile) {
    if (LIB_FILE.test(file.fileName)) return null;
    return scope.nativeDeclaration(d) ? 'native' : 'lenient';
  }
  if (!scope.strictFile(file)) return 'lenient';
  return scope.looseSlot?.(d) ? 'loose' : null;
}

/**
 * A parameter of a function that is passed as a value to a callee code not checked strictly declares (`view.on('tap',
 * (args: GestureEventData) => …)`, a delegate's method): what it is given is that code's choice, whatever the type says.
 */
function calledByUntrusted(p: ts.ParameterDeclaration, scope: TrustScope): boolean {
  const fn = p.parent;
  if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return false;
  let x: ts.Node = fn;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const call = x.parent;
  if (!(ts.isCallExpression(call) || ts.isNewExpression(call)) || !call.arguments?.includes(x as ts.Expression)) return false;
  const callee = scope.checker.getResolvedSignature(call)?.getDeclaration();
  return !!callee && !ts.isJSDocSignature(callee) && declarationOrigin(callee, scope) !== null && declarationOrigin(callee, scope) !== 'loose';
}

/**
 * Strict code's functions whose value reaches an untyped slot (`callbacks.push(cb)` for `cb: (v: string) => void`), itself
 * or through function-typed slots it is placed in: script calls them with whatever it passes. Given a function type node,
 * an arrow function, a function expression or a function declaration.
 */
export function scriptCalledFunction(trust: TrustScope): (sig: ts.Node) => boolean {
  const checker = trust.checker;
  const known = new Map<ts.Node, boolean>();
  const untyped = (t: ts.Type) => !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  /** Whether a function value is placed in an untyped slot, or in a function-typed one whose value reaches one. */
  const reachesScript = (x: ts.Expression, own: ts.Node): boolean => {
    let slot: ts.Type | undefined;
    const field = (ts.isShorthandPropertyAssignment(x.parent) && x.parent.name === x) || (ts.isPropertyAssignment(x.parent) && x.parent.initializer === x) ? x.parent : null;
    if (field) {
      const obj = checker.getContextualType(field.parent);
      const key = field.name && literalKey(field.name, checker);
      const prop = obj && !untyped(obj) && key ? obj.getProperty(key) : undefined;
      slot = obj && untyped(obj) ? obj : prop && checker.getTypeOfSymbolAtLocation(prop, x);
    } else slot = checker.getContextualType(x);
    if (!slot) return false;
    if (untyped(slot)) return true;
    // A replacer given a pattern's groups, any of which may be undefined.
    const call = ts.walkUpParenthesizedExpressions(x.parent);
    if (ts.isCallExpression(call) && call.arguments[1] === ts.walkUpParenthesizedExpressions(x) && ts.isPropertyAccessExpression(call.expression) && ['replace', 'replaceAll'].includes(call.expression.name.text)
      && checker.getNonNullableType(checker.getTypeAtLocation(call.expression.expression)).flags & ts.TypeFlags.StringLike && regexpMayLeaveGroupUnset(call.arguments[0], checker)) return true;
    const decl = checker.getNonNullableType(slot).getCallSignatures()[0]?.getDeclaration();
    return !!decl && !ts.isJSDocSignature(decl) && decl !== own && scriptCalled(decl);
  };
  const scriptCalled = (sig: ts.Node): boolean => {
    if (sig.getSourceFile().isDeclarationFile || !trust.strictFile(sig.getSourceFile())) return false;
    if (!(ts.isFunctionTypeNode(sig) || ts.isArrowFunction(sig) || ts.isFunctionExpression(sig) || (ts.isFunctionDeclaration(sig) && sig.body && sig.name))) return false;
    let found = known.get(sig);
    if (found !== undefined) return found;
    known.set(sig, false);
    const refs = (d: ts.Node, name: ts.Identifier, scope: ts.Node | undefined): boolean => {
      const sym = checker.getSymbolAtLocation(name);
      const named = (x: ts.Identifier) => (ts.isShorthandPropertyAssignment(x.parent) && x.parent.name === x ? checker.getShorthandAssignmentValueSymbol(x.parent) : checker.getSymbolAtLocation(x)) === sym;
      const visit = (x: ts.Node): boolean => (ts.isIdentifier(x) && x !== name && named(x) && reachesScript(x, d)) || !!ts.forEachChild(x, visit);
      return !!sym && !!scope && visit(scope);
    };
    found = false;
    if (ts.isFunctionTypeNode(sig)) {
      const d = sig.parent;
      if ((ts.isParameter(d) || ts.isVariableDeclaration(d)) && d.type === sig && ts.isIdentifier(d.name)) found = refs(sig, d.name, ts.isParameter(d) ? d.parent : ts.findAncestor(d.parent, (x) => ts.isFunctionLike(x) || ts.isSourceFile(x)));
    } else if (ts.isFunctionDeclaration(sig)) {
      found = refs(sig, sig.name!, sig.getSourceFile());
    } else {
      let x: ts.Expression = sig as ts.Expression;
      while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
      found = reachesScript(x, sig);
      // A constant holding the function (`const f = (s: string) => …`): wherever the constant is given.
      const d = x.parent;
      if (!found && ts.isVariableDeclaration(d) && d.initializer === x && !d.type && ts.isIdentifier(d.name) && ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const) {
        found = refs(sig, d.name, ts.findAncestor(d.parent, (n) => ts.isFunctionLike(n) || ts.isSourceFile(n)));
      }
    }
    known.set(sig, found);
    return found;
  };
  return scriptCalled;
}

/** The slot a value is placed in: a variable, field, parameter, literal field or a function's result. */
export function slotOf(e: ts.Expression, checker: ts.TypeChecker): ts.Declaration | null {
  let x: ts.Node = e;
  while (ts.isParenthesizedExpression(x.parent)) x = x.parent;
  const p = x.parent;
  if ((ts.isVariableDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isParameter(p)) && p.initializer === x && ts.isIdentifier(p.name)) return p;
  if (ts.isBinaryExpression(p) && p.right === x && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && (ts.isIdentifier(p.left) || ts.isPropertyAccessExpression(p.left))) {
    const sym = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(p.left) ? p.left.name : p.left);
    return sym?.valueDeclaration ?? null;
  }
  if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(x as ts.Expression)) {
    const sig = checker.getResolvedSignature(p)?.getDeclaration();
    if (!sig || ts.isJSDocSignature(sig)) return null;
    const k = p.arguments.indexOf(x as ts.Expression);
    const param = sig.parameters[Math.min(k, sig.parameters.length - 1)];
    return param && !(param.dotDotDotToken && k >= sig.parameters.length - 1 && param !== sig.parameters[k]) ? param : null;
  }
  if (ts.isPropertyAssignment(p) && p.initializer === x) {
    const sym = checker.getContextualType(p.parent)?.getProperty(literalKey(p.name, checker) ?? '');
    return sym?.valueDeclaration ?? sym?.declarations?.[0] ?? null;
  }
  if (ts.isReturnStatement(p) || (ts.isArrowFunction(p) && p.body === x)) {
    const fn = ts.isArrowFunction(p) ? p : ts.findAncestor(p, ts.isFunctionLike);
    return fn && (ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isGetAccessorDeclaration(fn)) ? fn : null;
  }
  return null;
}

/**
 * The declarations (variables, fields, parameters, literal fields, functions' results) of the program's own code that
 * an untrusted value is placed in anywhere, closed over reads of them: a slot holds what JavaScript can put there, so a
 * translator holds these in a form that takes undefined and null as well. `untrusted` is the translator's own reading
 * of `originOf`: whether the value, as it holds it, may be what the slot's own form cannot hold.
 */
export class LooseSlots {
  private loose = new Set<ts.Declaration>();
  private built = false;
  private files: readonly ts.SourceFile[];
  private checker: ts.TypeChecker;
  private untrusted: (e: ts.Expression) => boolean;
  private holds: (d: ts.Declaration) => boolean;

  constructor(files: readonly ts.SourceFile[], checker: ts.TypeChecker, untrusted: (e: ts.Expression) => boolean, holds: (d: ts.Declaration) => boolean) {
    this.files = files;
    this.checker = checker;
    this.untrusted = untrusted;
    this.holds = holds;
  }

  has(d: ts.Declaration): boolean {
    if (!this.built) this.build();
    return this.loose.has(d);
  }

  /** The fields of the program's interfaces a type (or its array's elements) names. */
  private fieldsOf(t: ts.Type | null): ts.Declaration[] {
    if (!t) return [];
    const parts = t.isUnion() ? t.types : [t];
    const out: ts.Declaration[] = [];
    for (const p of parts) {
      const el = this.checker.isArrayType(p) ? this.checker.getTypeArguments(p as ts.TypeReference)[0] : p;
      const sym = el?.getSymbol();
      if (!sym || !(sym.flags & ts.SymbolFlags.Interface) || !sym.declarations?.some((d) => ts.isInterfaceDeclaration(d) && !d.getSourceFile().isDeclarationFile)) continue;
      for (const prop of el.getProperties()) if (prop.valueDeclaration) out.push(prop.valueDeclaration);
    }
    return out;
  }

  private build() {
    this.built = true;
    const placements: [ts.Expression, ts.Declaration][] = [];
    const destructured: [ts.Declaration, ts.Declaration][] = [];
    const visit = (n: ts.Node) => {
      if (ts.isExpression(n) && !ts.isParenthesizedExpression(n)) {
        const slot = slotOf(n, this.checker);
        let value = n;
        while (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.EqualsToken) value = ts.skipOuterExpressions(value.right, ts.OuterExpressionKinds.Parentheses);
        if (slot && !slot.getSourceFile().isDeclarationFile) placements.push([value, slot]);
      } else if (ts.isBindingElement(n) && ts.isIdentifier(n.name) && ts.isObjectBindingPattern(n.parent)) {
        if (n.initializer) placements.push([n.initializer, n]);
        const prop = this.checker.getTypeAtLocation(n.parent).getProperty((n.propertyName ?? n.name).getText())?.valueDeclaration;
        if (prop && !prop.getSourceFile().isDeclarationFile) destructured.push([prop, n]);
      }
      ts.forEachChild(n, visit);
    };
    for (const f of this.files) if (!f.isDeclarationFile) visit(f);
    // A slot read is untrusted once it is loose, which may loosen the slots its value goes to.
    const opened = new Set<ts.Declaration>();
    for (let changed = true; changed;) {
      changed = false;
      for (const [value, slot] of placements) {
        const own = this.holds(slot) && !this.loose.has(slot);
        if ((!own && opened.has(slot)) || !this.untrusted(value)) continue;
        if (own) this.loose.add(slot);
        // An untrusted object where an interface is declared (`const p: Point = JSON.parse(s)`): its fields are untrusted too.
        if (!opened.has(slot)) {
          opened.add(slot);
          for (const field of this.fieldsOf(slotType(slot, this.checker))) if (this.holds(field)) this.loose.add(field);
        }
        changed = true;
      }
      for (const [prop, binding] of destructured) {
        if (!this.loose.has(binding) && this.holds(binding) && this.loose.has(prop)) {
          this.loose.add(binding);
          changed = true;
        }
      }
    }
  }

}

/**
 * A declaration whose form a translator may choose alone: a variable, a field, a parameter or a function's result that
 * no other declaration must match. Not a method's parameter or result (overrides share one signature), a rest
 * parameter, a parameter property, an async or generator function's result, or the field of an interface a class
 * implements (its implementations declare it too).
 */
export function ownSlot(d: ts.Declaration, checker: ts.TypeChecker, implemented: Set<ts.Declaration>): boolean {
  if (d.getSourceFile().isDeclarationFile) return false;
  if (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d)) {
    if (ts.isMethodDeclaration(d) && !hasStatic(d)) return false;
    return !d.asteriskToken && !ts.getModifiers(d)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
  }
  if (ts.isPropertySignature(d)) return ts.isInterfaceDeclaration(d.parent) && !implemented.has(d.parent) && ts.isIdentifier(d.name);
  if (ts.isParameter(d)) {
    const fn = d.parent;
    if (d.dotDotDotToken || !ts.isIdentifier(d.name) || (ts.isMethodDeclaration(fn) && !hasStatic(fn))) return false;
    if (ts.isConstructorDeclaration(fn) && ts.getModifiers(d)?.length) return false;
    return ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn) || ts.isConstructorDeclaration(fn);
  }
  return (ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d) || ts.isBindingElement(d)) && ts.isIdentifier(d.name);
}

function hasStatic(d: ts.Declaration): boolean {
  return !!ts.canHaveModifiers(d) && !!ts.getModifiers(d)?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
}

/** Whether a value of type `t` may be undefined when it runs: its type admits undefined or void, or it is untyped. */
export function admitsUndefined(t: ts.Type): boolean {
  return (t.isUnion() ? t.types : [t]).some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

/** Whether a value is undefined whatever it runs as (`undefined`, `void 0`). */
export function onlyUndefined(t: ts.Type): boolean {
  return !t.isUnion() && !!(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void));
}

/**
 * A class's own instance keys and the order its constructor makes them (Node's, for one level of a hierarchy: a subclass's
 * keys follow everything its base's constructor made).
 * - `always`: keys once the class's level of the constructor starts: parameter properties and initialized fields, or every
 *   declared field where the app's configuration defines class fields (`useDefineForClassFields`).
 * - `sure`: fields without an initializer the constructor assigns on every path before anything else can run (`walked`).
 * - `written`: the others, each a key at its first write, undefined too.
 * - `order`: `always` (parameter properties first), then the fields in the order the walk first writes them, then the rest
 *   as declared. A key made out of this order (a `written` field's first write anywhere but `walked`) is noted as it runs.
 * - `walked`: the constructor's `this.f = v` writes up to the first statement that could run other code with `this` (a base
 *   class's constructor may have let `this` out, so there any call ends the walk too); `first`: the path's first write of `f`.
 */
export interface ClassKeyPlan { order: string[]; always: Set<string>; sure: Set<string>; written: ts.PropertyDeclaration[]; walked: Map<ts.Node, { field: string; first: boolean }> }

export function classKeyPlan(cls: ts.ClassLikeDeclaration, defines: boolean): ClassKeyPlan {
  const always = new Set<string>(), written: ts.PropertyDeclaration[] = [], order: string[] = [];
  const sure = new Set<string>(), walked = new Map<ts.Node, { field: string; first: boolean }>();
  const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
  for (const p of ctor?.parameters ?? []) if (ts.isParameterPropertyDeclaration(p, ctor!) && ts.isIdentifier(p.name)) { always.add(p.name.text); order.push(p.name.text); }
  const fields = new Map<string, ts.PropertyDeclaration>();
  for (const m of cls.members) {
    if (!ts.isPropertyDeclaration(m) || hasStatic(m) || !ts.isIdentifier(m.name)) continue;
    if (ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.DeclareKeyword || x.kind === ts.SyntaxKind.AbstractKeyword)) continue;
    if (always.has(m.name.text)) continue;
    if (defines || m.initializer) { always.add(m.name.text); order.push(m.name.text); }
    else fields.set(m.name.text, m);
  }
  const based = !!cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
  const stmts = ctor ? [...ctor.body!.statements] : [];
  const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
  // A field holding a function that uses `this` (`onTap = () => this.x = 1`) lets it out when read; any other initializer
  // using it lets it out at once.
  const holdsThis = new Set<string>();
  let initializerEscapes = false;
  for (const m of cls.members) {
    if (!ts.isPropertyDeclaration(m) || hasStatic(m) || !m.initializer) continue;
    const init = ts.skipOuterExpressions(m.initializer);
    if ((ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && ts.isIdentifier(m.name) && !(based && runsCode(init))) { if (containsThis(init) || ts.isFunctionExpression(init)) holdsThis.add(m.name.text); }
    else if (containsThis(m.initializer) || (based && runsCode(m.initializer))) initializerEscapes = true;
  }
  if (fields.size && ctor && (!based || superAt >= 0) && !initializerEscapes) {
    const plain = new Set<string>();
    for (const m of cls.members) if (ts.isPropertyDeclaration(m) && !hasStatic(m) && ts.isIdentifier(m.name)) plain.add(m.name.text);
    for (const p of ctor.parameters) if (ts.isIdentifier(p.name) && ts.getModifiers(p)?.length) plain.add(p.name.text);
    const isThis = (n: ts.Node) => n.kind === ts.SyntaxKind.ThisKeyword;
    // Whether `n` may make a key: `this` used other than to read a field or write one that is a key already, or (below a
    // base) any call.
    const escapes = (n: ts.Node): boolean => {
      let escaped = false;
      const visit = (x: ts.Node) => {
        if (escaped) return;
        if (ts.isFunctionLike(x) || ts.isClassLike(x)) { if (containsThis(x)) escaped = true; return; }
        if (based && runsCode(x, false)) { escaped = true; return; }
        if (ts.isPropertyAccessExpression(x) && isThis(x.expression)) {
          const p = ts.walkUpParenthesizedExpressions(x.parent);
          const written = (ts.isBinaryExpression(p) && p.left === ts.skipOuterExpressions(x) && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
            || ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p) || ts.isDeleteExpression(p);
          if (!ts.isIdentifier(x.name) || !plain.has(x.name.text) || holdsThis.has(x.name.text) || (ts.isCallExpression(p) && p.expression === x) || (written && fields.has(x.name.text))) escaped = true;
          return;
        }
        if (isThis(x) || x.kind === ts.SyntaxKind.SuperKeyword) { escaped = true; return; }
        ts.forEachChild(x, visit);
      };
      visit(n);
      return escaped;
    };
    type State = { assigned: Set<string>; firsts: string[]; done: boolean };
    const all = () => new Set(fields.keys());
    // Each path's first writes must run in `order`: a branch that writes them otherwise ends the walk before its `if`.
    const inOrder = (firsts: string[]) => firsts.every((f, k) => k === 0 || order.indexOf(firsts[k - 1]) < order.indexOf(f));
    const walk = (list: readonly ts.Statement[], s: State): State => {
      for (const st of list) {
        if (s.done) return s;
        if (ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          const left = ts.skipOuterExpressions(st.expression.left);
          const f = ts.isPropertyAccessExpression(left) && isThis(left.expression) && ts.isIdentifier(left.name) && fields.has(left.name.text) ? left.name.text : null;
          if (f !== null) {
            if (escapes(st.expression.right)) return { ...s, done: true };
            const first = !s.assigned.has(f) && !s.firsts.includes(f);
            walked.set(st.expression, { field: f, first });
            if (!order.includes(f)) order.push(f);
            s = { assigned: new Set([...s.assigned, f]), firsts: first ? [...s.firsts, f] : s.firsts, done: false };
            continue;
          }
        }
        if (ts.isIfStatement(st)) {
          if (escapes(st.expression)) return { ...s, done: true };
          const before = { order: order.length, walked: new Map(walked) };
          const branch = (b: ts.Statement | undefined) => (b ? walk(ts.isBlock(b) ? b.statements : [b], { assigned: new Set(s.assigned), firsts: [...s.firsts], done: false }) : { assigned: new Set(s.assigned), firsts: [...s.firsts], done: false });
          const a = branch(st.thenStatement), b = branch(st.elseStatement);
          if (!inOrder(a.firsts) || !inOrder(b.firsts)) {
            order.length = before.order;
            walked.clear();
            for (const [n, w] of before.walked) walked.set(n, w);
            return { ...s, done: true };
          }
          const ends = (x: State, br: ts.Statement | undefined) => !!br && !x.done && alwaysThrows(br);
          const left = ends(a, st.thenStatement) ? all() : a.assigned, right = ends(b, st.elseStatement) ? all() : b.assigned;
          s = { assigned: new Set([...left].filter((f) => right.has(f))), firsts: [...a.firsts, ...b.firsts.filter((f) => !a.firsts.includes(f))].sort((x, y) => order.indexOf(x) - order.indexOf(y)), done: a.done || b.done };
          continue;
        }
        if (ts.isBlock(st)) { s = walk(st.statements, s); continue; }
        if (ts.isThrowStatement(st)) return { ...s, assigned: all(), done: true };
        // Any other statement that can't make a key or leave the constructor (a loop filling an array field) changes nothing.
        if (!escapes(st) && !mayLeave(st)) continue;
        return { ...s, done: true };
      }
      return s;
    };
    const end = walk(stmts.slice(superAt + 1), { assigned: new Set(), firsts: [], done: false });
    for (const f of end.assigned) if (fields.has(f)) sure.add(f);
  }
  for (const [name, m] of fields) {
    if (!order.includes(name)) order.push(name);
    if (!sure.has(name)) written.push(m);
  }
  return { order, always, sure, written, walked };
}

/** Whether a statement may end its function early (`return`, `throw`), outside the functions it declares. */
function mayLeave(st: ts.Statement): boolean {
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isFunctionLike(x) || ts.isClassLike(x)) return;
    if (ts.isReturnStatement(x) || ts.isThrowStatement(x)) { found = true; return; }
    ts.forEachChild(x, visit);
  };
  visit(st);
  return found;
}

/** Whether evaluating `n` may run code beyond reading values: a call, `new`, a tagged template, `await`, `yield` or iteration. */
function runsCode(n: ts.Node, deep = true): boolean {
  const at = (x: ts.Node) => ts.isCallExpression(x) || ts.isNewExpression(x) || ts.isTaggedTemplateExpression(x) || ts.isAwaitExpression(x) || ts.isYieldExpression(x)
    || ts.isForOfStatement(x) || ts.isSpreadElement(x) || ts.isArrayBindingPattern(x);
  if (!deep) return at(n);
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isFunctionLike(x) || ts.isClassLike(x)) return;
    if (at(x)) { found = true; return; }
    ts.forEachChild(x, visit);
  };
  visit(n);
  return found;
}

/** The program's interfaces a class implements, whose fields its classes declare as well. */
export function implementedInterfaceDeclarations(files: readonly ts.SourceFile[], checker: ts.TypeChecker): Set<ts.Declaration> {
  const out = new Set<ts.Declaration>();
  const visit = (n: ts.Node) => {
    if (ts.isClassLike(n)) for (const i of implementedInterfaces(checker, n)) for (const d of checker.getTypeAtLocation(i).getSymbol()?.declarations ?? []) out.add(d);
    ts.forEachChild(n, visit);
  };
  for (const f of files) if (!f.isDeclarationFile) visit(f);
  return out;
}

/** The type a slot declares: a function's result, or the declaration's own type. */
export function slotType(d: ts.Declaration, checker: ts.TypeChecker): ts.Type | null {
  if (ts.isFunctionLike(d)) return checker.getSignatureFromDeclaration(d as ts.SignatureDeclaration)?.getReturnType() ?? null;
  const name = (d as ts.NamedDeclaration).name;
  return name ? checker.getTypeAtLocation(name) : null;
}

/**
 * The fields of a class its code sets to null though their written type leaves null out (`colors: string[] = null`,
 * `this.indices = h.length ? h : null`): code checked without strictNullChecks, where such a field holds null apart from undefined.
 */
export function nullSetFields(cls: ts.ClassLikeDeclaration): ts.PropertyDeclaration[] {
  const givesNull = (e: ts.Expression): boolean => {
    e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (e.kind === ts.SyntaxKind.NullKeyword) return true;
    if (ts.isConditionalExpression(e)) return givesNull(e.whenTrue) || givesNull(e.whenFalse);
    return ts.isBinaryExpression(e) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind) && givesNull(e.right);
  };
  const nullable = (t: ts.TypeNode) => t.kind === ts.SyntaxKind.AnyKeyword || t.kind === ts.SyntaxKind.UnknownKeyword
    || (ts.isUnionTypeNode(t) && t.types.some((x) => x.kind === ts.SyntaxKind.UndefinedKeyword || (ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword)));
  return cls.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !m.modifiers?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword)
    && ts.isIdentifier(m.name) && !!m.type && !nullable(m.type) && ((!!m.initializer && givesNull(m.initializer)) || assignedValues(m).some(givesNull)));
}

/** Whether a field's initializer is null. */
export function initializedNull(m: ts.PropertyDeclaration): boolean {
  return !!m.initializer && ts.skipOuterExpressions(m.initializer, ts.OuterExpressionKinds.Parentheses).kind === ts.SyntaxKind.NullKeyword;
}

/** The values a class's own code assigns its field (`this.name = value`). */
export function assignedValues(field: ts.PropertyDeclaration): ts.Expression[] {
  const name = field.name.getText(), out: ts.Expression[] = [];
  const visit = (x: ts.Node): void => {
    if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(x.left)
      && x.left.expression.kind === ts.SyntaxKind.ThisKeyword && x.left.name.text === name) out.push(x.right);
    ts.forEachChild(x, visit);
  };
  ts.forEachChild(field.parent, visit);
  return out;
}

/**
 * The fields of a class with no base that its constructor assigns on every path before any read of them and before
 * `this` escapes it (a method called on it, `this` passed or stored, a function that captures it): a backend may hold
 * them as their type, never undefined. Anything the walk cannot follow ends it, keeping only what was assigned before.
 */
export function definitelyAssignedFields(cls: ts.ClassLikeDeclaration): Set<ts.PropertyDeclaration> {
  const out = new Set<ts.PropertyDeclaration>();
  if (cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword)) return out;
  const fields = new Map<string, ts.PropertyDeclaration>();
  for (const m of cls.members) {
    if (ts.isPropertyDeclaration(m) && !m.initializer && !hasStatic(m) && ts.isIdentifier(m.name) && !m.questionToken) fields.set(m.name.text, m);
  }
  const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
  if (!fields.size || !ctor?.body) return out;
  // The class's other fields and parameter properties: reading or writing one runs nothing.
  const plain = new Set<string>();
  for (const m of cls.members) if (ts.isPropertyDeclaration(m) && !hasStatic(m) && ts.isIdentifier(m.name) && !fields.has(m.name.text)) plain.add(m.name.text);
  for (const p of ctor.parameters) if (ts.isIdentifier(p.name) && ts.getModifiers(p)?.length) plain.add(p.name.text);
  const unsafe = new Set<string>();
  type State = { assigned: Set<string>; done: boolean };
  const isThis = (n: ts.Node) => n.kind === ts.SyntaxKind.ThisKeyword;
  const fieldOf = (n: ts.Node): string | null =>
    ts.isPropertyAccessExpression(n) && isThis(n.expression) && ts.isIdentifier(n.name) && fields.has(n.name.text) ? n.name.text : null;
  // Whether `n` uses `this` other than reading a field: an escape. A read of a field not yet assigned marks it unsafe.
  const escapes = (n: ts.Node, s: State): boolean => {
    let escaped = false;
    const visit = (x: ts.Node) => {
      if (escaped) return;
      if (ts.isFunctionLike(x) || ts.isClassLike(x)) {
        if (containsThis(x)) escaped = true;
        return;
      }
      const f = fieldOf(x);
      if (f !== null) {
        const p = ts.walkUpParenthesizedExpressions(x.parent);
        // A field written, or a method it holds called on `this`: more than a read.
        if ((ts.isBinaryExpression(p) && p.left === ts.skipOuterExpressions(x) && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
          || ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p) || (ts.isCallExpression(p) && p.expression === x) || ts.isDeleteExpression(p)) { escaped = true; return; }
        if (!s.assigned.has(f)) unsafe.add(f);
        return;
      }
      if (ts.isPropertyAccessExpression(x) && isThis(x.expression)) {
        const p = ts.walkUpParenthesizedExpressions(x.parent);
        // Another field read or written; anything else (an accessor, a method, a function a field holds called) may run anything.
        if (ts.isIdentifier(x.name) && plain.has(x.name.text) && !(ts.isCallExpression(p) && p.expression === x)) return;
        escaped = true;
        return;
      }
      if (isThis(x) || x.kind === ts.SyntaxKind.SuperKeyword) { escaped = true; return; }
      ts.forEachChild(x, visit);
    };
    visit(n);
    return escaped;
  };
  const all = () => new Set(fields.keys());
  const walk = (stmts: readonly ts.Statement[], s: State): State => {
    for (const st of stmts) {
      if (s.done) return s;
      if (ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        const f = fieldOf(ts.skipOuterExpressions(st.expression.left));
        if (f !== null) {
          if (escapes(st.expression.right, s)) return { assigned: s.assigned, done: true };
          s = { assigned: new Set([...s.assigned, f]), done: false };
          continue;
        }
      }
      if (ts.isIfStatement(st)) {
        if (escapes(st.expression, s)) return { assigned: s.assigned, done: true };
        const a = walk(ts.isBlock(st.thenStatement) ? st.thenStatement.statements : [st.thenStatement], { assigned: new Set(s.assigned), done: false });
        const b = st.elseStatement ? walk(ts.isBlock(st.elseStatement) ? st.elseStatement.statements : [st.elseStatement], { assigned: new Set(s.assigned), done: false }) : { assigned: new Set(s.assigned), done: false };
        const ends = (x: State, branch: ts.Statement | undefined) => !!branch && !x.done && alwaysThrows(branch);
        const left = ends(a, st.thenStatement) ? all() : a.assigned, right = ends(b, st.elseStatement) ? all() : b.assigned;
        s = { assigned: new Set([...left].filter((f) => right.has(f))), done: a.done || b.done };
        continue;
      }
      if (ts.isBlock(st)) { s = walk(st.statements, s); continue; }
      if (ts.isThrowStatement(st)) return { assigned: all(), done: true };
      if (ts.isVariableStatement(st) || ts.isExpressionStatement(st)) {
        if (escapes(st, s)) return { assigned: s.assigned, done: true };
        continue;
      }
      // A loop, a switch, a try, a return: not followed. Whatever it does with `this` ends the walk.
      escapes(st, s);
      return { assigned: s.assigned, done: true };
    }
    return s;
  };
  // Field initializers run before the body: one that lets `this` escape leaves every field unsure.
  const start: State = { assigned: new Set(), done: false };
  for (const m of cls.members) if (ts.isPropertyDeclaration(m) && m.initializer && !hasStatic(m) && escapes(m.initializer, start)) return out;
  const end = walk(ctor.body.statements, start);
  for (const [name, d] of fields) if (end.assigned.has(name) && !unsafe.has(name)) out.add(d);
  return out;
}

function containsThis(n: ts.Node): boolean {
  let found = false;
  const visit = (x: ts.Node) => {
    if (found) return;
    if (x.kind === ts.SyntaxKind.ThisKeyword || x.kind === ts.SyntaxKind.SuperKeyword) { found = true; return; }
    // A nested function or class has its own `this`, except an arrow function.
    if ((ts.isFunctionDeclaration(x) || ts.isFunctionExpression(x) || ts.isClassLike(x)) && x !== n) return;
    ts.forEachChild(x, visit);
  };
  ts.forEachChild(n, visit);
  return found;
}

function alwaysThrows(st: ts.Statement): boolean {
  if (ts.isThrowStatement(st)) return true;
  if (ts.isBlock(st)) return st.statements.some((s) => ts.isThrowStatement(s));
  return false;
}

/**
 * Strict code's slots that may hold null and undefined both, which a backend's optional alone can't tell apart:
 * one whose type admits both, one typed `T | null` that receives an untyped value, and a field typed `T | null` that may be
 * read before it is written. `held` (variables, parameters, function returns, and the parameters and results of function
 * types, function values and override families that admit both) are held untyped; `fields` (class fields, object-type
 * members) note which of their nils is null. `refused` are such slots neither can cover (an element of an array, Map or
 * Set, a function or native value, a slot whose signature a library or an interface fixes), each with what it is.
 */
export interface NullishSlots { held: Set<ts.Declaration>; fields: Set<ts.Declaration>; refused: [ts.Node, string][] }

export function nullishSlots(checker: ts.TypeChecker, files: readonly ts.SourceFile[], skip: (file: ts.SourceFile) => boolean): NullishSlots {
  const held = new Set<ts.Declaration>(), fields = new Set<ts.Declaration>();
  const refused: [ts.Node, string][] = [];
  const refuse = (n: ts.Node, what: string) => { if (!refused.some(([m]) => m === n)) refused.push([n, what]); };
  const parts = (t: ts.Type) => (t.isUnion() ? t.types : [t]);
  const loose = (t: ts.Type) => parts(t).some((x) => x.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  const hasNull = (t: ts.Type) => !loose(t) && parts(t).some((x) => x.flags & ts.TypeFlags.Null);
  const both = (t: ts.Type) => hasNull(t) && parts(t).some((x) => x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void));
  // A result typed `void | null` is one callers ignore.
  const bothResult = (t: ts.Type) => both(t) && !parts(t).some((x) => x.flags & ts.TypeFlags.Void);
  const nullish = ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void;
  // Held untyped, a function would be called through the runtime and a library or native object reached by name: such
  // slots are refused.
  const primitive = ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike | nullish;
  const value = (t: ts.Type) => parts(t).every((x) => x.flags & primitive || (!x.getCallSignatures().length && !!x.getSymbol()?.declarations?.length && x.getSymbol()!.declarations!.every((d) => own(d))));
  const untyped = (e: ts.Expression | undefined) => !!e && e.kind !== ts.SyntaxKind.NullKeyword && !!(checker.getTypeAtLocation(e).flags & ts.TypeFlags.Any);
  const own = (d: ts.Declaration | undefined) => !!d && !d.getSourceFile().isDeclarationFile && !skip(d.getSourceFile());
  const typeOf = (d: ts.Declaration) => {
    const name = (d as ts.NamedDeclaration).name, sym = name && checker.getSymbolAtLocation(name);
    return sym ? checker.getTypeOfSymbolAtLocation(sym, d) : checker.getTypeAtLocation(d);
  };
  const text = (t: ts.Type) => checker.typeToString(t);
  const NATIVE = 'a function or library object that may be null or undefined both';
  // Values of more than one kind (`number | string`) are held untyped already, null apart from undefined.
  const oneKind = (t: ts.Type) => {
    const kinds = new Set(parts(t).filter((x) => !(x.flags & nullish)).map((x) => (x.flags & ts.TypeFlags.StringLike ? 's' : x.flags & ts.TypeFlags.NumberLike ? 'n' : x.flags & ts.TypeFlags.BooleanLike ? 'b' : x.flags & ts.TypeFlags.BigIntLike ? 'g' : x.getSymbol() ?? x)));
    return kinds.size === 1;
  };
  // A variable only compared, assigned, passed or returned: held untyped, a library object is never reached by name.
  const refs = new Map<ts.Symbol, ts.Identifier[]>();
  const opaque = (d: ts.Declaration) => {
    const sym = (d as ts.NamedDeclaration).name && checker.getSymbolAtLocation((d as ts.NamedDeclaration).name!);
    return !!sym && (refs.get(sym) ?? []).every((r) => {
      let x: ts.Node = r;
      while (ts.isParenthesizedExpression(x.parent) || ts.isNonNullExpression(x.parent) || ts.isAsExpression(x.parent)) x = x.parent;
      const p = x.parent;
      if (ts.isBinaryExpression(p)) return [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.EqualsToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(p.operatorToken.kind);
      return ts.isReturnStatement(p) || ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.expression !== x) || ts.isVariableDeclaration(p) || ts.isIfStatement(p) || ts.isConditionalExpression(p) || ts.isPrefixUnaryExpression(p);
    });
  };
  // A variable or parameter whose code tells null from undefined: compared strictly with either, or `typeof`.
  const observes = (d: ts.Declaration) => {
    const sym = (d as ts.NamedDeclaration).name && checker.getSymbolAtLocation((d as ts.NamedDeclaration).name!);
    return !sym || (refs.get(sym) ?? []).some((r) => {
      let x: ts.Node = r;
      while (ts.isParenthesizedExpression(x.parent) || ts.isNonNullExpression(x.parent)) x = x.parent;
      const p = x.parent;
      if (ts.isTypeOfExpression(p)) return true;
      if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind)) {
        const other = p.left === x ? p.right : p.left;
        return other.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(other) && other.text === 'undefined');
      }
      return false;
    });
  };
  // Where `x`'s value is only tested: null and undefined give the same there.
  const tested = (x: ts.Node): boolean => {
    while (ts.isParenthesizedExpression(x.parent) || ts.isNonNullExpression(x.parent)) x = x.parent;
    const p = x.parent;
    if (ts.isPrefixUnaryExpression(p)) return p.operator === ts.SyntaxKind.ExclamationToken;
    if ((ts.isIfStatement(p) || ts.isWhileStatement(p) || ts.isDoStatement(p)) && p.expression === x) return true;
    if ((ts.isConditionalExpression(p) || ts.isForStatement(p)) && p.condition === x) return true;
    if ((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p) || ts.isCallExpression(p)) && p.expression === x && !!p.questionDotToken) return true;
    if (ts.isCallExpression(p) && p.arguments.length === 1 && p.expression.getText() === 'Array.isArray') return true;
    if (!ts.isBinaryExpression(p)) return false;
    const op = p.operatorToken.kind;
    if (op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsToken) return true;
    if ((op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) && p.left === x) return true;
    return (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.QuestionQuestionToken) && tested(p);
  };
  // A parameter whose value goes on (printed, stored, passed) where it may still be null or undefined both.
  const escapes = (d: ts.Declaration) => {
    const sym = (d as ts.NamedDeclaration).name && checker.getSymbolAtLocation((d as ts.NamedDeclaration).name!);
    return !sym || (refs.get(sym) ?? []).some((r) => both(checker.getTypeAtLocation(r)) && !tested(r));
  };
  /**
   * Holds `d` when its type admits both; refuses it when that type isn't one a held slot can carry and its code tells
   * them apart. A function or library object held untyped would be reached by name.
   */
  const hold = (d: ts.Declaration, t: ts.Type | undefined, at: ts.Node = d) => {
    if (!t || !(ts.isFunctionLike(d) ? bothResult(t) : both(t)) || !oneKind(t)) return;
    if (value(t) || (ts.isVariableDeclaration(d) && !parts(t).some((x) => x.getCallSignatures().length) && opaque(d))) held.add(d);
    else if (ts.isFunctionLike(d) || observes(d)) refuse(at, `${NATIVE} (\`${text(t)}\`)`);
  };
  // Functions whose signature only this program's direct calls see.
  const fixed = new Set<ts.Node>();
  const fns: ts.FunctionLikeDeclaration[] = [];
  const values: ts.SignatureDeclaration[] = [];
  const signatures: ts.SignatureDeclaration[] = [];
  const classes: ts.ClassLikeDeclaration[] = [];
  const anyArgs: [ts.ParameterDeclaration, ts.Expression][] = [];
  const anyStores: [ts.Declaration, ts.Expression][] = [];
  const isCallee = (n: ts.Node) => {
    let x: ts.Node = n;
    while (ts.isPropertyAccessExpression(x.parent) && x.parent.name === x) x = x.parent;
    return (ts.isCallExpression(x.parent) || ts.isNewExpression(x.parent)) && x.parent.expression === x;
  };
  const extended = new Set<ts.Symbol>();
  const visit = (n: ts.Node): void => {
    if (ts.isClassLike(n)) {
      classes.push(n);
      for (const h of n.heritageClauses ?? []) for (const x of h.types) { const b = checker.getTypeAtLocation(x.expression).getSymbol(); if (b) extended.add(b); }
    }
    if ((ts.isFunctionDeclaration(n) || (ts.isMethodDeclaration(n) && ts.isClassLike(n.parent)) || ts.isConstructorDeclaration(n)) && n.body) fns.push(n);
    if (ts.isArrowFunction(n) || ts.isFunctionExpression(n) || (ts.isMethodDeclaration(n) && ts.isObjectLiteralExpression(n.parent))) values.push(n);
    if (ts.isFunctionTypeNode(n) || ts.isCallSignatureDeclaration(n) || ts.isMethodSignature(n)) signatures.push(n);
    if (ts.isIdentifier(n)) { const sym = checker.getSymbolAtLocation(n); if (sym && sym.valueDeclaration && (sym.valueDeclaration as ts.NamedDeclaration).name !== n) refs.set(sym, [...(refs.get(sym) ?? []), n]); }
    if ((ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) && !isCallee(n)) {
      const d = checker.getSymbolAtLocation(n)?.valueDeclaration;
      if (d && (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d)) && (d.name !== n)) fixed.add(d);
    }
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const d = checker.getResolvedSignature(n)?.getDeclaration();
      if (d && !ts.isJSDocSignature(d)) (n.arguments ?? []).forEach((a, k) => {
        const p = d.parameters[k];
        if (p && !p.dotDotDotToken && !ts.isSpreadElement(a) && untyped(a)) anyArgs.push([p, a]);
      });
    }
    if (ts.isVariableDeclaration(n) && untyped(n.initializer)) anyStores.push([n, n.initializer!]);
    if (ts.isPropertyDeclaration(n) && untyped(n.initializer)) anyStores.push([n, n.initializer!]);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && untyped(n.right)) {
      const d = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n.left) ? n.left.name : n.left)?.valueDeclaration;
      if (d) anyStores.push([d, n.right]);
    }
    ts.forEachChild(n, visit);
  };
  for (const f of files) if (!f.isDeclarationFile && !skip(f)) visit(f);
  const isAsync = (fn: ts.SignatureDeclaration) => !!ts.getModifiers(fn)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) || !!(fn as ts.FunctionLikeDeclaration).asteriskToken;
  const named = (p: ts.ParameterDeclaration) => ts.isIdentifier(p.name) && !p.dotDotDotToken;
  const returnOf = (fn: ts.SignatureDeclaration) => checker.getSignatureFromDeclaration(fn)?.getReturnType();
  const holdSignature = (fn: ts.SignatureDeclaration) => {
    for (const p of fn.parameters) if (named(p)) hold(p, typeOf(p));
    if (fn.type && !isAsync(fn) && !ts.isConstructorDeclaration(fn)) hold(fn, returnOf(fn), fn.type);
  };
  const openSignature = (fn: ts.FunctionLikeDeclaration): boolean => {
    if (fixed.has(fn) || !fn.body || (ts.canHaveDecorators(fn) && ts.getDecorators(fn)?.length)) return true;
    const sym = ts.isConstructorDeclaration(fn) ? undefined : checker.getSymbolAtLocation(fn.name!);
    if (sym && (sym.declarations?.length ?? 0) > 1) return true;
    if (ts.isMethodDeclaration(fn)) {
      const cls = fn.parent;
      if (!ts.isClassLike(cls) || cls.heritageClauses?.length || ts.getDecorators(cls)?.length) return true;
      // Another class extending this one may override it.
      if (extended.has(checker.getTypeAtLocation(cls).getSymbol()!)) return true;
    }
    if (ts.isConstructorDeclaration(fn) && (fn.parent.heritageClauses?.length || ts.getDecorators(fn.parent)?.length)) return true;
    return false;
  };
  // Any parameter or result of `fn` that may hold both, refused as `why`.
  const refuseBoth = (fn: ts.SignatureDeclaration, why: string) => {
    for (const p of fn.parameters) { const t = typeOf(p); if (both(t) && oneKind(t)) refuse(p, `${why} (\`${text(t)}\`)`); }
    const ret = returnOf(fn);
    if (fn.type && !ts.isConstructorDeclaration(fn) && ret && bothResult(ret) && oneKind(ret)) refuse(fn.type, `${why} (\`${text(ret)}\`)`);
  };
  // A function type's parameters and result: what every function of that type, and every call through it, uses.
  for (const sig of signatures) if (own(sig)) holdSignature(sig);
  const ownBase = (c: ts.ClassLikeDeclaration): ts.ClassLikeDeclaration | 'library' | undefined => {
    const h = c.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (!h) return undefined;
    const d = checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && own(d) ? d : 'library';
  };
  const memberName = (m: ts.MethodDeclaration) => (ts.isIdentifier(m.name) || ts.isPrivateIdentifier(m.name) ? m.name.text : undefined);
  const isStatic = (m: ts.Node) => !!ts.getModifiers(m as ts.HasModifiers)?.some((k) => k.kind === ts.SyntaxKind.StaticKeyword);
  type Family = { members: ts.MethodDeclaration[]; why?: string };
  const families = new Map<ts.MethodDeclaration, Family>();
  // Angular's class decorators. Their classes' plain methods are called only from this program (templates compile to
  // methods of the class itself); the framework calls lifecycle hooks and the template's own `$` members by name.
  const ANGULAR = new Set(['Component', 'Directive', 'Pipe', 'Injectable', 'NgModule']);
  const HOOKS = new Set(['ngOnChanges', 'ngOnInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy']);
  const angularDecorator = (d: ts.Decorator) => {
    const e = ts.isCallExpression(d.expression) ? d.expression.expression : d.expression;
    let s = checker.getSymbolAtLocation(e);
    if (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
    return !!s && ANGULAR.has(s.name) && !!s.declarations?.some((x) => /^\/__shims__\/_angular_core\.d\.ts$|[\\/]@angular[\\/]core[\\/]/.test(x.getSourceFile().fileName));
  };
  const frameworkCalled = (c: ts.ClassLikeDeclaration, name: string): string | undefined => {
    const decorators = ts.getDecorators(c);
    if (!decorators?.length) return undefined;
    if (!decorators.every(angularDecorator)) return 'a method of a decorated class';
    if (HOOKS.has(name)) return 'an Angular lifecycle hook';
    if (name.startsWith('$')) return "a template's binding";
    return undefined;
  };
  /** The methods overriding one another with `m`, and why their signatures are fixed elsewhere if they are. */
  const familyOf = (m: ts.MethodDeclaration): Family => {
    const name = memberName(m), cls = m.parent as ts.ClassLikeDeclaration;
    if (!name) return { members: [m], why: 'a method with a computed name' };
    let top = cls, why: string | undefined;
    for (let c: ts.ClassLikeDeclaration | 'library' | undefined = cls; c; c = ownBase(c)) {
      if (c === 'library') { const h = top.heritageClauses!.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)!.types[0]; if (checker.getTypeAtLocation(h).getProperty(name)) why = 'a method overriding a library class\'s'; break; }
      top = c;
    }
    const tree = [top];
    for (let k = 0; k < tree.length; k++) for (const c of classes) if (ownBase(c) === tree[k] && !tree.includes(c)) tree.push(c);
    const members = tree.flatMap((c) => c.members.filter((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && !isStatic(x) && memberName(x) === name));
    for (const c of tree) for (const h of c.heritageClauses ?? []) if (h.token === ts.SyntaxKind.ImplementsKeyword && h.types.some((x) => checker.getTypeAtLocation(x).getProperty(name))) why ??= 'a method an interface declares';
    if (members.some((x) => !x.body || (ts.canHaveDecorators(x) && ts.getDecorators(x)?.length) || (checker.getSymbolAtLocation(x.name)?.declarations?.length ?? 0) > 1)) why ??= 'an overloaded or decorated method';
    for (const c of tree) why ??= frameworkCalled(c, name);
    const result = { members, why };
    for (const x of members) families.set(x, result);
    return result;
  };
  for (const fn of fns) {
    if (!own(fn)) continue;
    if (ts.isMethodDeclaration(fn) && !isStatic(fn)) {
      if (families.has(fn)) continue;
      const { members: family, why } = familyOf(fn);
      if (why) { for (const x of family) refuseBoth(x, why); continue; }
      const width = Math.max(...family.map((x) => x.parameters.length));
      for (let k = 0; k < width; k++) {
        const ps = family.map((x) => x.parameters[k]).filter((p): p is ts.ParameterDeclaration => !!p);
        const wide = ps.find((p) => both(typeOf(p)) && oneKind(typeOf(p)));
        if (!wide) continue;
        // A slot no member tells apart or lets go on while it may be either keeps one nil.
        if (!ps.every(named) || !ps.every((p) => value(typeOf(p)))) { if (ps.some((p) => observes(p) || escapes(p))) refuse(wide, `${NATIVE} (\`${text(typeOf(wide))}\`)`); continue; }
        for (const p of ps) held.add(p);
      }
      const wide = family.find((x) => { const r = returnOf(x); return !!r && bothResult(r) && oneKind(r) && !isAsync(x); });
      if (wide) {
        if (family.every((x) => { const r = returnOf(x); return !r || value(r); }) && family.every((x) => !isAsync(x))) for (const x of family) held.add(x);
        else refuse(wide.type ?? wide, `${NATIVE} (\`${text(returnOf(wide)!)}\`)`);
      }
      continue;
    }
    if (ts.isConstructorDeclaration(fn) && (fn.parent.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ExtendsKeyword) || ts.getDecorators(fn.parent)?.length)) { refuseBoth(fn, 'a constructor parameter of a class that extends another or is decorated'); continue; }
    if (ts.isFunctionDeclaration(fn) && (checker.getSymbolAtLocation(fn.name!)?.declarations?.length ?? 0) > 1) { refuseBoth(fn, 'an overloaded function'); continue; }
    if (ts.canHaveDecorators(fn) && ts.getDecorators(fn)?.length) { refuseBoth(fn, 'a decorated member'); continue; }
    for (const p of fn.parameters) {
      if (!named(p) || (ts.isConstructorDeclaration(fn) && ts.isParameterPropertyDeclaration(p, fn))) continue;
      hold(p, typeOf(p));
    }
    if (!ts.isConstructorDeclaration(fn) && fn.type && !isAsync(fn)) hold(fn, returnOf(fn), fn.type);
  }
  // A function value takes the slots of the function type it is given as: held where that type's are, else refused where
  // that type may pass (or take) both.
  for (const fn of values) {
    if (!own(fn)) continue;
    const contextual = ts.isMethodDeclaration(fn)
      ? (() => { const o = checker.getContextualType(fn.parent as ts.ObjectLiteralExpression); const m = o && ts.isIdentifier(fn.name) ? o.getProperty(fn.name.text) : undefined; return m ? checker.getTypeOfSymbolAtLocation(m, fn) : undefined; })()
      : checker.getContextualType(fn as ts.Expression);
    const ctx = contextual?.getNonNullableType().getCallSignatures()[0];
    if (!ctx) { holdSignature(fn); continue; }
    const decl = ctx.getDeclaration() as ts.SignatureDeclaration | undefined;
    const ownDecl = !!decl && !ts.isJSDocSignature(decl) && own(decl);
    fn.parameters.forEach((p, k) => {
      const sym = ctx.getParameters()[k];
      const given = sym && checker.getTypeOfSymbolAtLocation(sym, fn);
      if (!given || !both(given) || !oneKind(given)) return;
      const slot = ownDecl ? decl!.parameters[k] : undefined;
      if (slot && held.has(slot) && named(p)) held.add(p);
      else refuse(p, `a callback parameter that may be null or undefined both (\`${text(given)}\`)`);
    });
    const ret = ctx.getReturnType();
    if (bothResult(ret) && oneKind(ret) && !isAsync(fn)) {
      if (ownDecl && held.has(decl!)) held.add(fn);
      else refuse(fn, `a callback that may return null or undefined both (\`${text(ret)}\`)`);
    }
  }
  for (const [p] of anyArgs) {
    const fn = p.parent;
    if (own(p) && ts.isIdentifier(p.name) && (ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn) || ts.isConstructorDeclaration(fn)) && !(ts.isConstructorDeclaration(fn) && ts.isParameterPropertyDeclaration(p, fn))
      && fns.includes(fn) && !openSignature(fn) && hasNull(typeOf(p)) && value(typeOf(p))) held.add(p);
  }
  const local = (d: ts.VariableDeclaration) => ts.isVariableDeclarationList(d.parent) && ts.isVariableStatement(d.parent.parent);
  const fieldLike = (d: ts.Declaration): d is ts.PropertyDeclaration | ts.PropertySignature => (ts.isPropertyDeclaration(d) && ts.isClassLike(d.parent) && !d.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)) || ts.isPropertySignature(d);
  for (const [d] of anyStores) {
    if (!own(d) || !(d as ts.NamedDeclaration).name || !ts.isIdentifier((d as ts.NamedDeclaration).name!) || !hasNull(typeOf(d))) continue;
    if (ts.isVariableDeclaration(d)) { if (local(d) && value(typeOf(d))) held.add(d); }
    else if (fieldLike(d)) fields.add(d);
  }
  /** An element, entry or type argument of `t` that may be null or undefined both (what no held slot carries). */
  const nested = (t: ts.Type, depth = 0, seen = new Set<ts.Type>()): ts.Type | undefined => {
    if (seen.has(t) || depth > 4 || loose(t)) return undefined;
    seen.add(t);
    if (depth > 0 && both(t) && oneKind(t)) return t;
    for (const x of parts(t)) {
      if (!(x.flags & ts.TypeFlags.Object) || x.getCallSignatures().length) continue;
      const args = (x as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(x as ts.TypeReference) : x.aliasTypeArguments ?? [];
      for (const a of [...args, ...checker.getIndexInfosOfType(x).map((i) => i.type)]) { const r = nested(a, depth + 1, seen); if (r) return r; }
    }
    return undefined;
  };
  const checkNested = (n: ts.Node, t: ts.Type | undefined) => {
    const inner = t && nested(t);
    if (inner) refuse(n, `an array, Map or Set element (or other type argument) that may be null or undefined both (\`${text(inner)}\` in \`${text(t!)}\`)`);
  };
  for (const f of files) {
    if (f.isDeclarationFile || skip(f)) continue;
    const scan = (n: ts.Node): void => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && local(n) && both(typeOf(n))) hold(n, typeOf(n));
      else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && both(typeOf(n)) && oneKind(typeOf(n))) refuse(n, `a loop variable that may be null or undefined both (\`${text(typeOf(n))}\`)`);
      else if (ts.isBindingElement(n) && ts.isIdentifier(n.name) && both(typeOf(n)) && oneKind(typeOf(n))) refuse(n, `a destructured binding that may be null or undefined both (\`${text(typeOf(n))}\`)`);
      else if (ts.isPropertyDeclaration(n) && fieldLike(n) && ts.isIdentifier(n.name) && hasNull(typeOf(n)) && (!n.initializer || both(typeOf(n)))) fields.add(n);
      else if (ts.isPropertySignature(n) && ts.isIdentifier(n.name) && both(typeOf(n))) fields.add(n);
      else if ((ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n)) && n.body) refuseBoth(n, 'an accessor that may take or give null or undefined both');
      if ((ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isPropertyDeclaration(n) || ts.isPropertySignature(n)) && (n as ts.NamedDeclaration).name && checker.getSymbolAtLocation((n as ts.NamedDeclaration).name!)) checkNested(n, typeOf(n));
      if (ts.isFunctionLike(n) && !ts.isConstructorDeclaration(n)) checkNested(n.type ?? n, returnOf(n as ts.SignatureDeclaration));
      ts.forEachChild(n, scan);
    };
    scan(f);
  }
  missingAndNull(checker, files, skip, held, (fn) => fns.includes(fn) && own(fn) && !openSignature(fn), (d) => {
    if (!ts.isFunctionLike(d) && !ts.isIdentifier((d as ts.NamedDeclaration).name!)) return false;
    const t = ts.isFunctionLike(d) ? checker.getSignatureFromDeclaration(d)?.getReturnType() : typeOf(d);
    return own(d) && !!t && !hasNull(t) && value(t);
  }, local);
  // `const field = args.view as TextField`: TypeScript checks no class at run time, so the value may be another class's object
  // (a SearchBar), which script reads by name. Only the program's own classes are read so in every backend.
  for (const f of files) {
    if (f.isDeclarationFile || skip(f)) continue;
    const scan = (n: ts.Node): void => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && !n.type && local(n) && n.initializer) {
        const init = ts.skipOuterExpressions(n.initializer, ts.OuterExpressionKinds.Parentheses);
        if ((ts.isAsExpression(init) || ts.isTypeAssertionExpression(init)) && downcast(checker, init, own)) held.add(n);
      }
      ts.forEachChild(n, scan);
    };
    scan(f);
  }
  return { held, fields, refused };
}

/**
 * Code checked without strictNullChecks: what a function's body gives where it gives nothing, which its type can't say.
 * `null`: only `null` itself; `missing`: undefined (a bare `return`, `undefined`, a void call, a library result typed
 * `T | undefined`, an optional parameter, a body whose end may be reached); `unknown`: a value that may be either (a
 * local, a signal, a library result typed with both).
 */
export function nothingGiven(fn: ts.FunctionLikeDeclaration, checker: ts.TypeChecker, seen = new Set<ts.Node>()): { null: boolean; missing: boolean; unknown: boolean } {
  const out = { null: false, missing: false, unknown: false };
  if (!fn.body || !ts.isBlock(fn.body)) return out;
  seen.add(fn);
  const optional = new Set(fn.parameters.filter((p) => p.questionToken && !p.initializer).map((p) => checker.getSymbolAtLocation(p.name)));
  const gives = (e: ts.Expression | undefined): void => {
    if (!e) { out.missing = true; return; }
    e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses);
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken || e.operatorToken.kind === ts.SyntaxKind.BarBarToken)) return gives(e.right);
    if (ts.isConditionalExpression(e)) { gives(e.whenTrue); gives(e.whenFalse); return; }
    if (e.kind === ts.SyntaxKind.NullKeyword) { out.null = true; return; }
    if ((ts.isIdentifier(e) && e.text === 'undefined') || ts.isVoidExpression(e)) { out.missing = true; return; }
    if (ts.isIdentifier(e)) {
      const sym = checker.getSymbolAtLocation(e);
      if (optional.has(sym)) { out.missing = true; return; }
      const d = sym?.valueDeclaration;
      // A local declared without a value may still be undefined; one starting null may still be null.
      if (d && ts.isVariableDeclaration(d) && ts.findAncestor(d, (n) => n === fn) && !ts.isForOfStatement(d.parent.parent) && !ts.isForInStatement(d.parent.parent)) {
        if (!d.initializer) out.missing = true;
        else gives(d.initializer.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d.initializer) && d.initializer.text === 'undefined') ? d.initializer : ts.factory.createTrue());
      }
      return;
    }
    if (ts.isCallExpression(e)) {
      const t = checker.getTypeAtLocation(e);
      if (t.flags & ts.TypeFlags.Void) { out.missing = true; return; }
      const sig = checker.getResolvedSignature(e)?.getDeclaration();
      const declared = sig && !ts.isJSDocSignature(sig) && sig.getSourceFile().isDeclarationFile ? sig.type : undefined;
      // The program's own function: what its body gives.
      if (sig && !ts.isJSDocSignature(sig) && (ts.isFunctionDeclaration(sig) || ts.isMethodDeclaration(sig)) && sig.body && !sig.getSourceFile().isDeclarationFile) {
        if (seen.has(sig)) return;
        const inner = nothingGiven(sig, checker, seen);
        out.null ||= inner.null; out.missing ||= inner.missing; out.unknown ||= inner.unknown;
      } else if (declared && ts.isUnionTypeNode(declared)) {
        const n = declared.types.some((x) => ts.isLiteralTypeNode(x) && x.literal.kind === ts.SyntaxKind.NullKeyword);
        const u = declared.types.some((x) => x.kind === ts.SyntaxKind.UndefinedKeyword);
        if (n && u) out.unknown = true;
        else if (n) out.null = true;
        else if (u) out.missing = true;
      }
      // A function's or signal's result read without its own declaration's evidence (a signal made with null).
      else if (!e.arguments.length && !(sig && !ts.isJSDocSignature(sig) && !sig.getSourceFile().isDeclarationFile)) out.unknown = true;
    }
  };
  const visit = (n: ts.Node): void => {
    if (ts.isFunctionLike(n) || ts.isClassLike(n)) return;
    if (ts.isReturnStatement(n)) gives(n.expression);
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  if (!leaves(fn.body)) out.missing = true;
  return out;
}

/** Whether a statement always returns or throws, as far as its last statements, both branches of an `if` and a `try`'s blocks show. */
function leaves(st: ts.Statement | undefined): boolean {
  if (!st) return false;
  if (ts.isReturnStatement(st) || ts.isThrowStatement(st)) return true;
  if (ts.isBlock(st)) return leaves(st.statements[st.statements.length - 1]);
  if (ts.isTryStatement(st)) return (!!st.finallyBlock && leaves(st.finallyBlock)) || (leaves(st.tryBlock) && (!st.catchClause || leaves(st.catchClause.block)));
  return ts.isIfStatement(st) && !!st.elseStatement && leaves(st.thenStatement) && leaves(st.elseStatement);
}

/** Whether code assigns a variable anywhere after its declaration. */
export function reassigned(d: ts.VariableDeclaration, checker: ts.TypeChecker): boolean {
  if (!ts.isIdentifier(d.name)) return true;
  const sym = checker.getSymbolAtLocation(d.name);
  if (!sym) return true;
  const target = (x: ts.Expression) => ts.isIdentifier(ts.skipOuterExpressions(x)) && checker.getSymbolAtLocation(ts.skipOuterExpressions(x)) === sym;
  const visit = (n: ts.Node): boolean => {
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && target(n.left)) return true;
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) && target(n.operand)) return true;
    return !!ts.forEachChild(n, visit);
  };
  return visit(d.getSourceFile());
}

/** Whether a variable's initializer or a later `=` to it gives a value `test` accepts. */
export function givenBy(d: ts.VariableDeclaration, checker: ts.TypeChecker, test: (e: ts.Expression) => boolean): boolean {
  const sym = ts.isIdentifier(d.name) ? checker.getSymbolAtLocation(d.name) : undefined;
  if (!sym) return false;
  if (d.initializer && test(ts.skipOuterExpressions(d.initializer))) return true;
  const visit = (n: ts.Node): boolean => (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(ts.skipOuterExpressions(n.left))
    && checker.getSymbolAtLocation(ts.skipOuterExpressions(n.left)) === sym && test(ts.skipOuterExpressions(n.right))) || !!ts.forEachChild(n, visit);
  return visit(d.getSourceFile());
}

/**
 * A variable whose every value, its initializer's and each `=`'s, is one `nullOnly` accepts or one never null or undefined
 * (`new`, a literal other than null, a function): where it holds nothing, that is null. Any other write (compound, `++`,
 * destructuring, a `for … of` target) makes it false.
 */
export function onlyNullOrPresent(d: ts.VariableDeclaration, checker: ts.TypeChecker, nullOnly: (e: ts.Expression) => boolean): boolean {
  if (!ts.isIdentifier(d.name) || !d.initializer) return false;
  const sym = checker.getSymbolAtLocation(d.name);
  if (!sym) return false;
  const given = (e: ts.Expression) => {
    const v = ts.skipOuterExpressions(e);
    return nullOnly(v) || v.kind === ts.SyntaxKind.NullKeyword || ts.isNewExpression(v) || ts.isObjectLiteralExpression(v) || ts.isArrayLiteralExpression(v)
      || ts.isStringLiteralLike(v) || ts.isNumericLiteral(v) || ts.isTemplateExpression(v) || ts.isArrowFunction(v) || ts.isFunctionExpression(v);
  };
  if (!given(d.initializer)) return false;
  let ok = true;
  const visit = (n: ts.Node): void => {
    if (!ok) return;
    const named = ts.isShorthandPropertyAssignment(n) ? checker.getShorthandAssignmentValueSymbol(n) : ts.isIdentifier(n) && n !== d.name ? checker.getSymbolAtLocation(n) : undefined;
    if (named === sym) {
      let t: ts.Node = n;
      while (ts.isParenthesizedExpression(t.parent)) t = t.parent;
      const p = t.parent;
      if (ts.isBinaryExpression(p) && p.left === t && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        if (p.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !given(p.right) || ts.isArrayLiteralExpression(p.parent) || ts.isPropertyAssignment(p.parent)) ok = false;
      } else if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) ok = false;
      else if ((ts.isForOfStatement(p) || ts.isForInStatement(p)) && p.initializer === t) ok = false;
      else if (inPattern(ts.isShorthandPropertyAssignment(n) ? n : t)) ok = false;
    }
    ts.forEachChild(n, visit);
  };
  const inPattern = (n: ts.Node): boolean => {
    for (let p = n.parent; p; n = p, p = p.parent) {
      if (ts.isParenthesizedExpression(p) || ts.isSpreadElement(p) || ts.isSpreadAssignment(p) || ts.isShorthandPropertyAssignment(p) || (ts.isPropertyAssignment(p) && p.initializer === n)) continue;
      if (!ts.isArrayLiteralExpression(p) && !ts.isObjectLiteralExpression(p)) return false;
      const q = p.parent;
      if ((ts.isBinaryExpression(q) && q.left === p && q.operatorToken.kind === ts.SyntaxKind.EqualsToken) || ((ts.isForOfStatement(q) || ts.isForInStatement(q)) && q.initializer === p)) return true;
    }
    return false;
  };
  visit(d.getSourceFile());
  return ok;
}

/** The key JavaScript reads of `e` where `e` (parenthesized or not) is a member read's receiver, without `?.`. */
export function readKeyOf(e: ts.Expression): string | null {
  const p = ts.walkUpParenthesizedExpressions(e.parent);
  if (ts.isPropertyAccessExpression(p) && !p.questionDotToken && ts.skipOuterExpressions(p.expression, ts.OuterExpressionKinds.Parentheses) === e) return p.name.text;
  if (ts.isElementAccessExpression(p) && !p.questionDotToken && ts.skipOuterExpressions(p.expression, ts.OuterExpressionKinds.Parentheses) === e) {
    const k = p.argumentExpression;
    return ts.isStringLiteralLike(k) || ts.isNumericLiteral(k) ? k.text : k.getText();
  }
  return null;
}

/**
 * Downcasts read untyped (`const field = view as TextField`, `(view as TextField).text`): `receivers`, the ones read for a
 * member in place, and `classes`, the program's classes whose objects any of them may hold (each one assignable to the type
 * cast from), whose members are read and called by name.
 */
export function heldDowncasts(checker: ts.TypeChecker, files: readonly ts.SourceFile[], skip: (file: ts.SourceFile) => boolean, held: Set<ts.Declaration>): { receivers: Set<ts.Expression>; classes: Set<ts.ClassLikeDeclaration> } {
  const own = (d: ts.Declaration | undefined) => !!d && !d.getSourceFile().isDeclarationFile && !skip(d.getSourceFile());
  const receivers = new Set<ts.Expression>(), classes = new Set<ts.ClassLikeDeclaration>(), cast: ts.Expression[] = [], declared: ts.ClassLikeDeclaration[] = [];
  const visit = (n: ts.Node): void => {
    if ((ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && downcast(checker, n, own)) {
      const holder = ts.findAncestor(n.parent, (p) => !ts.isParenthesizedExpression(p));
      const inPlace = !!holder && ts.isPropertyAccessExpression(holder) && ts.skipParentheses(holder.expression) === n;
      if (inPlace) receivers.add(n);
      if (inPlace || (holder && ts.isVariableDeclaration(holder) && held.has(holder))) cast.push(n.expression);
    }
    if (ts.isClassLike(n)) declared.push(n);
    ts.forEachChild(n, visit);
  };
  for (const f of files) if (!f.isDeclarationFile && !skip(f)) visit(f);
  const from = cast.map((e) => checker.getNonNullableType(checker.getTypeAtLocation(e)));
  for (const c of declared) if (from.some((f) => checker.isTypeAssignableTo(checker.getTypeAtLocation(c.name ?? c), f))) classes.add(c);
  return { receivers, classes };
}

/** `x as C` of an object typed as a class or interface above C, C a class of the program's own. */
function downcast(checker: ts.TypeChecker, e: ts.AsExpression | ts.TypeAssertion, own: (d: ts.Declaration | undefined) => boolean): boolean {
  const to = checker.getTypeAtLocation(e), from = checker.getNonNullableType(checker.getTypeAtLocation(e.expression));
  const cls = to.getSymbol();
  if (!cls || !(cls.flags & ts.SymbolFlags.Class) || !own(cls.valueDeclaration) || from.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) || from === to) return false;
  // A class extending a native or the kit's class keeps its checked cast: such objects are not all read by name.
  for (let t: ts.Type | undefined = to; t; t = checker.getBaseTypes(t as ts.InterfaceType)[0]) {
    if (!own(t.getSymbol()?.valueDeclaration)) return false;
    if (!(t.flags & ts.TypeFlags.Object) || !((t as ts.ObjectType).objectFlags & ts.ObjectFlags.ClassOrInterface)) break;
  }
  if (!(from.flags & ts.TypeFlags.Object) || from.getCallSignatures().length) return false;
  return checker.isTypeAssignableTo(to, from) && !checker.isTypeAssignableTo(from, to);
}

/**
 * Non-strict code, whose checker types no slot with null: a parameter, local or function result the program gives both a null
 * and a missing value (`getString(key, fallback?: string)` called with `null` and without it, and returning `fallback`), held
 * untyped as strict code's `T | null | undefined` is. `fixed`: a function whose every call the program shows.
 */
function missingAndNull(checker: ts.TypeChecker, files: readonly ts.SourceFile[], skip: (file: ts.SourceFile) => boolean, held: Set<ts.Declaration>,
  fixed: (fn: ts.FunctionLikeDeclaration) => boolean, slot: (d: ts.Declaration) => boolean, local: (d: ts.VariableDeclaration) => boolean): void {
  const NULL = 1, MISSING = 2;
  const given = new Map<ts.Declaration, (ts.Expression | undefined)[]>();
  const give = (d: ts.Declaration, e: ts.Expression | undefined) => { const list = given.get(d) ?? []; list.push(e); given.set(d, list); };
  const declarationOf = (n: ts.Node) => checker.getSymbolAtLocation(n)?.valueDeclaration;
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const d = checker.getResolvedSignature(n)?.getDeclaration();
      const args = n.arguments ?? ts.factory.createNodeArray();
      if (d && !ts.isJSDocSignature(d) && (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d) || ts.isConstructorDeclaration(d)) && fixed(d) && !args.some(ts.isSpreadElement)) {
        d.parameters.forEach((p, k) => { if (!p.dotDotDotToken) give(p, args[k]); });
      }
    }
    if (ts.isReturnStatement(n)) {
      const fn = ts.findAncestor(n.parent, ts.isFunctionLike);
      if (fn && (ts.isFunctionDeclaration(fn) || ts.isMethodDeclaration(fn))) give(fn, n.expression);
    }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && ts.isVariableDeclarationList(n.parent) && local(n)) give(n, n.initializer);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left)) {
      const d = declarationOf(n.left);
      if (d && ts.isVariableDeclaration(d)) give(d, n.right);
    }
    ts.forEachChild(n, visit);
  };
  for (const f of files) if (!f.isDeclarationFile && !skip(f)) visit(f);
  const kinds = (e: ts.Expression | undefined): number => {
    if (!e) return MISSING;
    e = ts.skipOuterExpressions(e, ts.OuterExpressionKinds.Parentheses | ts.OuterExpressionKinds.Assertions);
    if (e.kind === ts.SyntaxKind.NullKeyword) return NULL;
    if (ts.isVoidExpression(e)) return MISSING;
    if (ts.isIdentifier(e)) {
      const d = declarationOf(e);
      if (e.text === 'undefined' && !d) return MISSING;
      return d && held.has(d) ? NULL | MISSING : 0;
    }
    if (ts.isCallExpression(e)) {
      const d = checker.getResolvedSignature(e)?.getDeclaration();
      return d && held.has(d as ts.Declaration) ? NULL | MISSING : 0;
    }
    if (ts.isConditionalExpression(e)) return kinds(e.whenTrue) | kinds(e.whenFalse);
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return kinds(e.right);
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return kinds(e.left) | kinds(e.right);
    }
    return 0;
  };
  // A body whose end a call may reach returns undefined there.
  const ends = (st: ts.Statement | undefined): boolean => {
    if (!st) return false;
    if (ts.isReturnStatement(st) || ts.isThrowStatement(st)) return true;
    if (ts.isBlock(st)) return ends(st.statements[st.statements.length - 1]);
    if (ts.isIfStatement(st)) return ends(st.thenStatement) && ends(st.elseStatement);
    if (ts.isTryStatement(st)) return (!!st.finallyBlock && ends(st.finallyBlock)) || (ends(st.tryBlock) && (!st.catchClause || ends(st.catchClause.block)));
    if (ts.isSwitchStatement(st)) {
      const clauses = st.caseBlock.clauses;
      return clauses.some(ts.isDefaultClause) && clauses.every((c, k) => (c.statements.length ? ends(c.statements[c.statements.length - 1]) : k < clauses.length - 1));
    }
    return false;
  };
  const fallsThrough = (fn: ts.FunctionLikeDeclaration) => !fn.body || (ts.isBlock(fn.body) && !ends(fn.body));
  for (let changed = true; changed;) {
    changed = false;
    for (const [d, list] of given) {
      if (held.has(d) || !slot(d)) continue;
      let mask = list.reduce((m, e) => m | kinds(e), 0);
      if (ts.isParameter(d)) {
        if (!ts.isIdentifier(d.name) || (ts.isConstructorDeclaration(d.parent) && ts.isParameterPropertyDeclaration(d, d.parent))) continue;
        if (d.questionToken) mask |= MISSING;
        // A default takes the place of a missing value.
        if (d.initializer) mask &= NULL;
      } else if (ts.isFunctionDeclaration(d) || ts.isMethodDeclaration(d)) {
        if (!fixed(d) || d.asteriskToken || ts.getModifiers(d)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) continue;
        if (fallsThrough(d)) mask |= MISSING;
      }
      if (mask === (NULL | MISSING)) { held.add(d); changed = true; }
    }
  }
}

/**
 * A pattern's capture groups: how many, which (by number) can take no part in a match (inside an alternative, under a
 * quantifier that allows none, or in a negative lookaround), and whether any is named.
 */
export function patternGroups(source: string): { count: number; unset: Set<number>; named: boolean } {
  type Frame = { capturing: boolean; alternates: boolean; optional: boolean; negative: boolean; parent: Frame | null };
  const top: Frame = { capturing: false, alternates: false, optional: false, negative: false, parent: null };
  const groups: Frame[] = [];
  let frame = top, named = false;
  let closed: Frame | null = null;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '\\') { i++; closed = null; continue; }
    if (c === '[') {
      for (i++; i < source.length && source[i] !== ']'; i++) if (source[i] === '\\') i++;
      closed = null;
      continue;
    }
    if (c === '(') {
      const name = source[i + 1] === '?' && source[i + 2] === '<' && source[i + 3] !== '=' && source[i + 3] !== '!';
      const capturing = source[i + 1] !== '?' || name;
      const negative = source.startsWith('?!', i + 1) || source.startsWith('?<!', i + 1);
      frame = { capturing, alternates: false, optional: false, negative, parent: frame };
      if (capturing) groups.push(frame);
      named ||= name;
      closed = null;
      continue;
    }
    if (c === ')' && frame.parent) { closed = frame; frame = frame.parent; continue; }
    if (c === '|') frame.alternates = true;
    else if (closed && (c === '?' || c === '*' || (c === '{' && /^\{0+(,\d*)?\}/.test(source.slice(i, i + 24))))) closed.optional = true;
    closed = null;
  }
  const unset = new Set<number>();
  groups.forEach((g, k) => {
    let may = g.optional || g.negative;
    for (let f = g.parent; f && !may; f = f.parent) may = f.alternates || f.optional || f.negative;
    if (may) unset.add(k + 1);
  });
  return { count: groups.length, unset, named };
}

export function patternMayLeaveGroupUnset(source: string): boolean {
  return patternGroups(source).unset.size > 0;
}

/** The flags of a pattern argument known when compiling (`/x/g`, `new RegExp(source, 'g')`, or a constant holding one). */
export function literalFlags(e: ts.Expression, checker: ts.TypeChecker): string | null {
  e = ts.skipOuterExpressions(e);
  if (ts.isRegularExpressionLiteral(e)) return e.text.slice(e.text.lastIndexOf('/') + 1);
  if ((ts.isNewExpression(e) || ts.isCallExpression(e)) && ts.isIdentifier(e.expression) && e.expression.text === 'RegExp') {
    const flags = e.arguments?.[1];
    return flags && ts.isStringLiteralLike(flags) ? flags.text : null;
  }
  if (ts.isIdentifier(e)) {
    const d = checker.getSymbolAtLocation(e)?.valueDeclaration;
    if (d && ts.isVariableDeclaration(d) && d.initializer && ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const) return literalFlags(d.initializer, checker);
  }
  return null;
}

/** The source of a pattern argument known when compiling: a literal, `new RegExp('…')`, or a constant holding one. */
export function literalPattern(e: ts.Expression, checker: ts.TypeChecker): string | null {
  e = ts.skipOuterExpressions(e);
  if (ts.isRegularExpressionLiteral(e)) return e.text.slice(1, e.text.lastIndexOf('/'));
  if ((ts.isNewExpression(e) || ts.isCallExpression(e)) && ts.isIdentifier(e.expression) && e.expression.text === 'RegExp') {
    const [p] = e.arguments ?? [];
    if (p && ts.isStringLiteralLike(p)) return p.text;
    if (p && ts.isRegularExpressionLiteral(ts.skipOuterExpressions(p))) return literalPattern(p, checker);
    return null;
  }
  if (ts.isIdentifier(e)) {
    const d = checker.getSymbolAtLocation(e)?.valueDeclaration;
    if (d && ts.isVariableDeclaration(d) && d.initializer && ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const) return literalPattern(d.initializer, checker);
  }
  return null;
}

/**
 * Whether a split, match or exec over this pattern argument can give a group that took no part (undefined): a literal
 * pattern (or a constant holding one) by its source; any other RegExp, made at run time, is taken to.
 */
export function regexpMayLeaveGroupUnset(e: ts.Expression, checker: ts.TypeChecker): boolean {
  const source = literalPattern(e, checker);
  if (source !== null) return patternMayLeaveGroupUnset(source);
  const t = checker.getTypeAtLocation(e);
  return !(t.flags & ts.TypeFlags.StringLike) && !(t.isUnion() && t.types.every((p) => p.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.Null | ts.TypeFlags.Undefined)));
}

export interface UnsetGroupTyping {
  /**
   * A string array a group that took no part in a match may have put undefined in, though TypeScript types it `string[]`:
   * a split over a pattern that can leave a group unset, a match of one copied (spread, `Array.from`, slice, filter…),
   * and a variable initialized with one.
   */
  groups(n: ts.Node): boolean;
  /** A match whose groups may include one that took no part: from a pattern that can leave one unset, or of unknown origin. */
  match(e: ts.Expression): boolean;
  /** An element-visiting callback's element parameter (`m.map((v) => …)`), or a loop's variable, over such strings. */
  element(n: ts.Node): boolean;
  /** A map callback over such elements that may give one back (`(v) => v`). */
  returnsElement(f: ts.ArrowFunction | ts.FunctionExpression): boolean;
  /** A function value (no literal) given to visit such elements, whose element parameter is declared to hold no undefined. */
  typedCallback(call: ts.CallExpression): ts.Expression | undefined;
}

/** `isMatch`: whether the backend holds a value as a match (RegExpMatchArray, RegExpExecArray). */
export function unsetGroupTyping(checker: ts.TypeChecker, resolve: (n: ts.Node) => ts.Symbol | undefined, isMatch: (e: ts.Expression) => boolean): UnsetGroupTyping {
  const memo = new Map<ts.Node, boolean>();
  const outer = ts.OuterExpressionKinds.Parentheses | ts.OuterExpressionKinds.NonNullAssertions;
  const groups = (n: ts.Node): boolean => {
    let found = memo.get(n);
    if (found !== undefined) return found;
    memo.set(n, false);
    found = findGroups(n);
    memo.set(n, found);
    return found;
  };
  const copied = (x: ts.Expression) => groups(x) || match(x);
  const findGroups = (n: ts.Node): boolean => {
    if (ts.isIdentifier(n) && n.parent && ts.isVariableDeclaration(n.parent) && n.parent.name === n) n = n.parent;
    if (ts.isIdentifier(n)) {
      const d = resolve(n)?.valueDeclaration;
      return !!d && ts.isVariableDeclaration(d) && groups(d);
    }
    if (ts.isVariableDeclaration(n)) return ts.isIdentifier(n.name) && !!n.initializer && !ts.isForInOrOfStatement(n.parent.parent) && copied(n.initializer);
    if (!ts.isExpression(n)) return false;
    const e = ts.skipOuterExpressions(n, outer);
    if (ts.isArrayLiteralExpression(e)) return e.elements.some((x) => ts.isSpreadElement(x) && copied(x.expression));
    if (!ts.isCallExpression(e) || !ts.isPropertyAccessExpression(e.expression)) return false;
    const name = e.expression.name.text, receiver = e.expression.expression;
    if (name === 'split') return !!e.arguments[0] && !!(checker.getNonNullableType(checker.getTypeAtLocation(receiver)).flags & ts.TypeFlags.StringLike) && regexpMayLeaveGroupUnset(e.arguments[0], checker);
    if (name === 'from' && ts.isIdentifier(receiver) && receiver.text === 'Array') return e.arguments.length === 1 && copied(e.arguments[0]);
    if (['slice', 'filter', 'concat', 'reverse', 'sort', 'splice', 'toReversed', 'toSorted', 'toSpliced'].includes(name)) return copied(receiver);
    if (name === 'map') {
      const f = e.arguments[0] && ts.skipOuterExpressions(e.arguments[0]);
      return !!f && (ts.isArrowFunction(f) || ts.isFunctionExpression(f)) && returnsElement(f);
    }
    return false;
  };
  const match = (e: ts.Expression): boolean => {
    if (!isMatch(e)) return false;
    let x = ts.skipOuterExpressions(e, outer);
    if (ts.isIdentifier(x)) {
      const d = resolve(x)?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d) && ts.isIdentifier(d.name) && ts.isForOfStatement(d.parent.parent) && d.parent.parent.initializer === d.parent) x = d.parent.parent.expression;
      else if (d && ts.isVariableDeclaration(d) && ts.isIdentifier(d.name) && d.initializer && ts.getCombinedNodeFlags(d) & ts.NodeFlags.Const) x = d.initializer;
      x = ts.skipOuterExpressions(x, outer);
    }
    if (!ts.isCallExpression(x) || !ts.isPropertyAccessExpression(x.expression)) return true;
    const name = x.expression.name.text;
    const re = name === 'exec' ? x.expression.expression : ['match', 'matchAll'].includes(name) ? x.arguments[0] : undefined;
    if (!re) return true;
    // A global match lists whole matches only.
    if (name === 'match' && literalFlags(re, checker)?.includes('g')) return false;
    return regexpMayLeaveGroupUnset(re, checker);
  };
  const ELEMENT_METHODS = ['map', 'filter', 'forEach', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap'];
  const typedCallback = (call: ts.CallExpression): ts.Expression | undefined => {
    const f = call.arguments[0];
    if (!f || !ts.isPropertyAccessExpression(call.expression) || !ELEMENT_METHODS.includes(call.expression.name.text)) return undefined;
    const bare = ts.skipOuterExpressions(f);
    if (ts.isArrowFunction(bare) || ts.isFunctionExpression(bare) || !copied(call.expression.expression)) return undefined;
    const param = checker.getTypeAtLocation(f).getNonNullableType().getCallSignatures()[0]?.getParameters()[0];
    if (!param) return undefined;
    const t = checker.getTypeOfSymbolAtLocation(param, f);
    const holds = (x: ts.Type) => !!(x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Any | ts.TypeFlags.Unknown));
    return holds(t) || (t.isUnion() && t.types.some(holds)) ? undefined : f;
  };
  const elementCallback = (f: ts.Node): boolean => {
    if (!(ts.isArrowFunction(f) || ts.isFunctionExpression(f)) || !f.parameters.length) return false;
    const call = ts.walkUpParenthesizedExpressions(f.parent);
    if (!ts.isCallExpression(call) || call.arguments[0] !== ts.walkUpParenthesizedExpressions(f) || !ts.isPropertyAccessExpression(call.expression)) return false;
    if (!ELEMENT_METHODS.includes(call.expression.name.text)) return false;
    return copied(call.expression.expression);
  };
  const element = (n: ts.Node): boolean => {
    const p = ts.isParameter(n) || ts.isVariableDeclaration(n) ? n : ts.isIdentifier(n) ? ((ts.isParameter(n.parent) || ts.isVariableDeclaration(n.parent)) && n.parent.name === n ? n.parent : resolve(n)?.valueDeclaration) : undefined;
    if (p && ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && ts.isForOfStatement(p.parent.parent) && p.parent.parent.initializer === p.parent) return copied(p.parent.parent.expression);
    return !!p && ts.isParameter(p) && p.parent.parameters[0] === p && ts.isIdentifier(p.name) && elementCallback(p.parent);
  };
  const returnsElement = (f: ts.ArrowFunction | ts.FunctionExpression): boolean => {
    if (!elementCallback(f) || !ts.isIdentifier(f.parameters[0].name)) return false;
    const sym = resolve(f.parameters[0].name);
    const gives = (x: ts.Expression) => { x = ts.skipOuterExpressions(x); return ts.isIdentifier(x) && resolve(x) === sym; };
    if (!ts.isBlock(f.body)) return gives(f.body);
    const visit = (x: ts.Node): boolean => (ts.isReturnStatement(x) && !!x.expression && gives(x.expression)) || (!ts.isFunctionLike(x) && !!ts.forEachChild(x, visit));
    return visit(f.body);
  };
  return { groups, match, element, returnsElement, typedCallback };
}
