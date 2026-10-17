import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * ES5 subclasses made by a factory (rxjs's `createErrorClass`):
 *
 *     export const EmptyError: EmptyErrorCtor = createErrorClass((_super) => function EmptyErrorImpl(this: any) { _super(this); … });
 *
 * where the factory calls its argument with a function that calls the base on the instance, sets the result's
 * `prototype` to `Object.create(Base.prototype)` and returns it. Such a declaration is written as the class it makes:
 *
 *     export class EmptyError extends Error { constructor() { super(); … } }
 *
 * The rewrite keeps every line where it was, so diagnostics and source lines still point at the original.
 */
export function desugarConstructorFactories(text: string, fileName: string): string {
  if (!/=>\s*function\s+\w+\s*\(\s*this\b/.test(text)) return text;
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits: { start: number; end: number; text: string }[] = [];
  const keepLines = (start: number, end: number, replacement: string) => edits.push({ start, end, text: replacement + '\n'.repeat((text.slice(start, end).match(/\n/g) ?? []).length) });
  const used = new Map<ts.ImportSpecifier, number>();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || !(st.declarationList.flags & ts.NodeFlags.Const) || st.declarationList.declarations.length !== 1) continue;
    const decl = st.declarationList.declarations[0];
    const call = decl.initializer;
    if (!ts.isIdentifier(decl.name) || !call || !ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || call.arguments.length !== 1) continue;
    const arrow = call.arguments[0];
    if (!ts.isArrowFunction(arrow) || arrow.parameters.length !== 1 || !ts.isIdentifier(arrow.parameters[0].name)) continue;
    let fn: ts.Node = arrow.body;
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    if (!ts.isFunctionExpression(fn) || fn.asteriskToken || fn.modifiers?.length || !fn.body || fn.parameters[0]?.name.getText() !== 'this') continue;
    const superCall = fn.body.statements[0];
    const callsSuper = !!superCall && ts.isExpressionStatement(superCall) && ts.isCallExpression(superCall.expression) && superCall.expression.arguments.length === 1
      && superCall.expression.expression.getText() === arrow.parameters[0].name.text && superCall.expression.arguments[0].kind === ts.SyntaxKind.ThisKeyword;
    if (!callsSuper) continue;
    const factory = findFactory(sf, call.expression.text, fileName);
    if (!factory) continue;
    if (factory.specifier) used.set(factory.specifier, (used.get(factory.specifier) ?? 0) + 1);
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? 'export ' : '';
    keepLines(st.getStart(), fn.getStart(), `${exported}class ${decl.name.text} extends ${factory.base} {`);
    const params = fn.parameters.slice(1).map((p) => p.getText()).join(', ');
    keepLines(fn.getStart(), fn.body.getStart(), `constructor(${params}) `);
    keepLines(superCall.getStart(), superCall.end, 'super();');
    keepLines(fn.end, st.end, '}');
  }
  if (!edits.length) return text;
  // The factory's import, once nothing else names it.
  for (const [spec, calls] of used) {
    const decl = spec.parent.parent.parent;
    let named = 0;
    const count = (n: ts.Node): void => { if (ts.isIdentifier(n) && n.text === spec.name.text) named++; ts.forEachChild(n, count); };
    count(sf);
    if (spec.parent.elements.length === 1 && !decl.importClause?.name && named === calls + 1) keepLines(decl.getStart(), decl.end, '');
  }
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) text = text.slice(0, e.start) + e.text + text.slice(e.end);
  return text;
}

/**
 * The factory a call names, declared in the file or imported by name from a relative module: one parameter, called with
 * one argument into a `const`, whose `prototype` is set to `Object.create(Base.prototype)` before it is returned.
 */
function findFactory(sf: ts.SourceFile, name: string, fileName: string): { base: string; specifier?: ts.ImportSpecifier } | null {
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name?.text === name) return factoryShape(st) && { base: factoryShape(st)! };
    if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier) || !st.moduleSpecifier.text.startsWith('.') || st.importClause?.isTypeOnly) continue;
    const bindings = st.importClause?.namedBindings;
    const spec = bindings && ts.isNamedImports(bindings) ? bindings.elements.find((e) => e.name.text === name && !e.isTypeOnly) : undefined;
    if (!spec) continue;
    const base = resolve(dirname(fileName), st.moduleSpecifier.text);
    const file = [base + '.ts', base + '/index.ts'].find((f) => existsSync(f));
    if (!file) return null;
    const other = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const exported = (spec.propertyName ?? spec.name).text;
    const decl = other.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === exported && !!s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
    const found = decl && factoryShape(decl);
    return found ? { base: found, specifier: spec } : null;
  }
  return null;
}

function factoryShape(fn: ts.FunctionDeclaration): string | null {
  if (!fn.body || fn.parameters.length !== 1 || !ts.isIdentifier(fn.parameters[0].name)) return null;
  const impl = fn.parameters[0].name.text;
  let ctor: string | undefined;
  let base: string | undefined;
  for (const st of fn.body.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.initializer && ts.isCallExpression(d.initializer) && d.initializer.expression.getText() === impl && d.initializer.arguments.length === 1) ctor = d.name.text;
      }
    } else if (ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const { left, right } = st.expression;
      const created = ts.isCallExpression(right) && right.expression.getText() === 'Object.create' && right.arguments.length === 1 ? right.arguments[0] : undefined;
      if (ctor && left.getText() === `${ctor}.prototype` && created && ts.isPropertyAccessExpression(created) && created.name.text === 'prototype' && ts.isIdentifier(created.expression)) base = created.expression.text;
    } else if (ts.isReturnStatement(st)) {
      return ctor && base && st.expression?.getText() === ctor ? base : null;
    }
  }
  return null;
}
