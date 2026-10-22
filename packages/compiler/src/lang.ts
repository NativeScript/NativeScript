import ts from 'typescript';

// JavaScript semantics both translators share, decided from the syntax tree and the checker.

/** `Intl.NumberFormat` or `Intl.DateTimeFormat`, as the library declares `Intl`: which one. */
export function intlConstructor(e: ts.Expression, checker: ts.TypeChecker): 'NumberFormat' | 'DateTimeFormat' | null {
  if (!ts.isPropertyAccessExpression(e) || !ts.isIdentifier(e.expression) || e.expression.text !== 'Intl') return null;
  if (!checker.getSymbolAtLocation(e.expression)?.declarations?.every((d) => d.getSourceFile().isDeclarationFile)) return null;
  return e.name.text === 'NumberFormat' || e.name.text === 'DateTimeFormat' ? e.name.text : null;
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

/**
 * `type A = B & { x: T }` over non-generic interfaces and type literals only: the members of the type it names, each
 * property's first declaration, as one interface's. Null for any other alias.
 */
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
 * `any` variable or parameter given one), where script may give them members their classes don't declare.
 */
export function classesHeldUntyped(files: readonly ts.SourceFile[], checker: ts.TypeChecker): Set<ts.ClassLikeDeclaration> {
  const roots = new Set<ts.ClassLikeDeclaration>();
  const classOf = (n: ts.Expression) => {
    const d = checker.getNonNullableType(checker.getTypeAtLocation(n)).getSymbol()?.valueDeclaration;
    return d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
  };
  const untyped = (t: ts.Type | undefined) => !!t && !!(t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
  const visit = (n: ts.Node) => {
    let held: ts.Expression | undefined;
    if ((ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) && untyped(checker.getTypeFromTypeNode(n.type))) held = n.expression;
    else if ((ts.isNewExpression(n) || ts.isIdentifier(n) || n.kind === ts.SyntaxKind.ThisKeyword) && ts.isExpression(n) && !ts.isPropertyAccessExpression(n.parent) && untyped(checker.getContextualType(n))) held = n;
    let cls = held && classOf(held);
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
