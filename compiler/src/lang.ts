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
 * bundler defines (`__DEV__`, `__IOS__`): nothing defines it at run time, so
 * `typeof` reads it as undefined.
 */
export function neverDefined(e: ts.Expression, checker: ts.TypeChecker): boolean {
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

/** A type's `[Symbol.iterator]` (or `[Symbol.asyncIterator]`) member. */
function iteratorMember(t: ts.Type, async: boolean): ts.Symbol | undefined {
  return t.getProperties().find((p) => p.escapedName.toString().startsWith(async ? '__@asyncIterator@' : '__@iterator@'));
}

const ITERATING_SCRIPT = new Set(['Generator', 'Iterator', 'IterableIterator', 'IteratorObject', 'Iterable']);
const ITERATING_BUILTIN = new Set(['Array', 'ReadonlyArray', 'Map', 'ReadonlyMap', 'Set', 'ReadonlySet', 'String', 'ArrayIterator', 'MapIterator', 'SetIterator', 'StringIterator', 'RegExpStringIterator', 'TemplateStringsArray']);

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
  return !!iteratorMember(t, false);
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
