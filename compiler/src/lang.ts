import ts from 'typescript';

// JavaScript semantics both translators share, decided from the syntax tree and the checker.

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
