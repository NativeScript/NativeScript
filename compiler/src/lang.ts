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
