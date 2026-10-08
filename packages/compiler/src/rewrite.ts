import ts from 'typescript';

/** How a front end's bindings read inside the virtual class. */
export interface Scope {
  /** name → replacement for a bare reference (`count` → `this.count.value`). */
  names: Map<string, string>;
  /** names whose `.value` is the binding itself (`total.value` → `this.total`). */
  unwrapValue?: Map<string, string>;
  /** A member path read through another object (`route.params.recipe` → `this.recipe`). */
  members?: { object: string; replacement: string };
}

/**
 * Rewrites the free references in a snippet of TypeScript (an expression,
 * a statement list, a function) to how the virtual class reads them. A name
 * declared inside the snippet (a parameter, a local) shadows the binding.
 */
export function rewrite(code: string, scope: Scope, kind: 'expression' | 'statements' = 'expression'): string {
  const wrapped = kind === 'expression' ? `(${code})` : code;
  const file = ts.createSourceFile('snippet.ts', wrapped, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits: { start: number; end: number; text: string }[] = [];

  const visit = (node: ts.Node, shadowed: Set<string>) => {
    if (ts.isFunctionLike(node)) {
      const inner = new Set(shadowed);
      for (const p of node.parameters ?? []) collectBindingNames(p.name, inner);
      if (node.body) collectDeclared(node.body, inner);
      for (const p of node.parameters ?? []) if (p.initializer) visit(p.initializer, shadowed);
      if (node.body) visit(node.body, inner);
      return;
    }
    if (ts.isBlock(node) || ts.isSourceFile(node)) {
      const inner = new Set(shadowed);
      collectDeclared(node, inner);
      ts.forEachChild(node, (c) => visit(c, inner));
      return;
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.name.text === 'value') {
      const target = scope.unwrapValue?.get(node.expression.text);
      if (target && !shadowed.has(node.expression.text)) {
        edits.push({ start: node.getStart(), end: node.getEnd(), text: target });
        return;
      }
    }
    if (scope.members && ts.isPropertyAccessExpression(node) && node.expression.getText() === scope.members.object) {
      edits.push({ start: node.getStart(), end: node.getEnd(), text: `${scope.members.replacement}.${node.name.text}` });
      return;
    }
    if (ts.isShorthandPropertyAssignment(node)) {
      const replacement = scope.names.get(node.name.text);
      if (replacement && !shadowed.has(node.name.text)) edits.push({ start: node.getStart(), end: node.getEnd(), text: `${node.name.text}: ${replacement}` });
      return;
    }
    if (ts.isIdentifier(node) && isReference(node)) {
      const replacement = scope.names.get(node.text);
      if (replacement && !shadowed.has(node.text)) edits.push({ start: node.getStart(), end: node.getEnd(), text: replacement });
      return;
    }
    ts.forEachChild(node, (c) => visit(c, shadowed));
  };
  visit(file, new Set());

  let out = wrapped;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

function isReference(id: ts.Identifier): boolean {
  const p = id.parent;
  if (ts.isPropertyAccessExpression(p) && p.name === id) return false;
  if (ts.isPropertyAssignment(p) && p.name === id) return false;
  if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isBindingElement(p)) && p.name === id) return false;
  if (ts.isTypeReferenceNode(p) || ts.isQualifiedName(p) || ts.isTypeQueryNode(p)) return false;
  if ((ts.isPropertySignature(p) || ts.isMethodDeclaration(p) || ts.isPropertyDeclaration(p)) && p.name === id) return false;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p)) return false;
  return true;
}

function collectBindingNames(name: ts.BindingName, into: Set<string>) {
  if (ts.isIdentifier(name)) into.add(name.text);
  else for (const el of name.elements) if (!ts.isOmittedExpression(el)) collectBindingNames(el.name, into);
}

/** Names declared directly in a block (not in nested functions). */
function collectDeclared(node: ts.Node, into: Set<string>) {
  const walk = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n)) collectBindingNames(n.name, into);
    if (ts.isFunctionDeclaration(n) && n.name) into.add(n.name.text);
    if (ts.isFunctionLike(n) && n !== node) return;
    ts.forEachChild(n, walk);
  };
  ts.forEachChild(node, walk);
}
