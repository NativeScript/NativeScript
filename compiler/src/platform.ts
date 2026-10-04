import ts from 'typescript';

export type Platform = 'ios' | 'android';

/**
 * Platform folding: `isIOS`, `isAndroid`, `__IOS__`, `__ANDROID__` (bare, or
 * through `global`/`globalThis`) become literals for the target, and the
 * branches they decide are removed, so the other platform's code never
 * reaches the type checker. Removed text is blanked rather than deleted:
 * every position, and so every diagnostic's line and column, is unchanged.
 */
export function foldPlatform(text: string, fileName: string, platform: Platform): string {
  text = applyDefines(text, fileName);
  if (!/\b(isIOS|isAndroid|__IOS__|__ANDROID__|__APPLE__|__VISIONOS__|__DEV__)\b|import\.meta\.hot/.test(text)) return text;
  // A release build: `__DEV__` is false, as the bundlers define it for one.
  const flags: Record<string, boolean> = {
    isIOS: platform === 'ios', __IOS__: platform === 'ios', __APPLE__: platform === 'ios',
    isAndroid: platform === 'android', __ANDROID__: platform === 'android', __VISIONOS__: false, __DEV__: false,
  };
  const kind = fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  // One edit per pass, outermost first, until nothing folds.
  for (let pass = 0; pass < 10_000; pass++) {
    const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
    const edit = findFold(sf, (n) => {
      // A release build has no hot module replacement: `import.meta.hot` is undefined.
      if (isHot(n)) return false;
      if (ts.isIdentifier(n) && n.text in flags && isReference(n) && !declaredAround(n)) return flags[n.text];
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && ['global', 'globalThis'].includes(n.expression.text) && n.name.text in flags) return flags[n.name.text];
      return undefined;
    });
    if (!edit) return text;
    text = apply(text, edit);
  }
  throw new Error(`${fileName}: platform folding did not settle`);
}

let defines: [string, string][] = [];

/** The bundler's `define` replacements, applied to every source the build reads. */
export function setDefines(map: Record<string, string> | undefined) {
  // The platform flags are folded for the target being built, whatever the bundler defined them as.
  const folded = /^(global\.|globalThis\.)?(isIOS|isAndroid|__IOS__|__ANDROID__|__APPLE__|__VISIONOS__|__DEV__)$/;
  defines = Object.entries(map ?? {}).filter(([k]) => !folded.test(k)).sort((a, b) => b[0].length - a[0].length);
}

/** Each defined expression replaced as the bundler replaces it, padded so positions after it keep their columns where it fits. */
function applyDefines(text: string, fileName: string): string {
  if (!defines.length || /[\\/]node_modules[\\/]/.test(fileName)) return text;
  for (const [key, value] of defines) {
    if (!text.includes(key)) continue;
    const pattern = new RegExp(`(?<![\\w$.])${key.replace(/[.$]/g, (c) => '\\' + c)}(?![\\w$])`, 'g');
    text = text.replace(pattern, (m) => `(${value})`.padEnd(m.length, ' '));
  }
  return text;
}

type Edit = { keep: [number, number] | null; span: [number, number]; replacement?: string };

function findFold(sf: ts.SourceFile, flag: (n: ts.Node) => boolean | undefined): Edit | null {
  const constant = (e: ts.Expression): boolean | undefined => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    const f = flag(e);
    if (f !== undefined) return f;
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) {
      const v = constant(e.operand);
      return v === undefined ? undefined : !v;
    }
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      const l = constant(e.left), r = constant(e.right);
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        if (l === false) return false;
        if (l === true && r !== undefined) return r;
        if (r === false && pure(e.left)) return false;
      }
      if (op === ts.SyntaxKind.BarBarToken) {
        if (l === true) return true;
        if (l === false && r !== undefined) return r;
        if (r === true && pure(e.left)) return true;
      }
    }
    return undefined;
  };
  const span = (n: ts.Node): [number, number] => [n.getStart(sf), n.getEnd()];
  let found: Edit | null = null;
  const visit = (n: ts.Node): void => {
    if (found) return;
    // `import.meta.hot?.accept()` does nothing; `import.meta.hot?.data.x ?? fallback` is the fallback.
    if (ts.isExpressionStatement(n) && hotChain(n.expression)) { found = { span: span(n), keep: null }; return; }
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && hotChain(n.left)) { found = { span: span(n), keep: span(n.right) }; return; }
    if (ts.isIfStatement(n)) {
      const v = constant(n.expression);
      if (v !== undefined) {
        const kept = v ? n.thenStatement : n.elseStatement;
        // `if (isIOS) { …; return; }`: what follows in the block is the other platform's, unreachable.
        const block = n.parent;
        const rest = ts.isBlock(block) || ts.isSourceFile(block) ? block.statements.slice(block.statements.indexOf(n as ts.Statement) + 1) : [];
        if (kept && exits(kept) && rest.length && !rest.some(ts.isFunctionDeclaration)) {
          found = { span: [span(n)[0], rest[rest.length - 1].getEnd()], keep: span(kept) };
          return;
        }
        found = { span: span(n), keep: kept ? span(kept) : null };
        return;
      }
    }
    // `if (__APPLE__ && x) … else if (x) …` folded: the else's test is the one that just failed, so its branch never runs.
    if (ts.isIfStatement(n) && n.elseStatement && ts.isIfStatement(n.elseStatement) && pure(n.expression) && same(n.expression, n.elseStatement.expression, sf)) {
      const inner = n.elseStatement;
      found = { span: span(inner), keep: inner.elseStatement ? span(inner.elseStatement) : null };
      return;
    }
    if (ts.isConditionalExpression(n)) {
      const v = constant(n.condition);
      if (v !== undefined) { found = { span: span(n), keep: span(v ? n.whenTrue : n.whenFalse) }; return; }
    }
    if (ts.isBinaryExpression(n) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(n.operatorToken.kind)) {
      const l = constant(n.left);
      const and = n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken;
      // `true && x` is x; `false && x` is false (and `||` the other way round).
      if (l !== undefined) {
        found = l === and ? { span: span(n), keep: span(n.right) } : { span: span(n), keep: null, replacement: String(l) };
        return;
      }
    }
    if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.ExclamationToken) {
      const v = constant(n);
      if (v !== undefined) { found = { span: span(n), keep: null, replacement: String(v) }; return; }
    }
    const f = flag(n);
    if (f !== undefined) { found = { span: span(n), keep: null, replacement: String(f) }; return; }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

function apply(text: string, e: Edit): string {
  const blank = (s: string) => s.replace(/[^\n\r]/g, ' ');
  const [a, b] = e.span;
  if (e.replacement !== undefined) {
    const original = text.slice(a, b);
    // Keep the length where it fits; a longer literal only shifts the rest of its line.
    const r = e.replacement.length <= original.length ? e.replacement + blank(original.slice(e.replacement.length)) : e.replacement;
    return text.slice(0, a) + r + text.slice(b);
  }
  if (!e.keep) return text.slice(0, a) + blank(text.slice(a, b)) + (needsStatement(text, a) ? ';' : '') + text.slice(b);
  const [ka, kb] = e.keep;
  return text.slice(0, a) + blank(text.slice(a, ka)) + text.slice(ka, kb) + blank(text.slice(kb, b)) + text.slice(b);
}

/** A removed `if` that was the body of `else`, a loop or a label still needs a statement there. */
function needsStatement(text: string, at: number): boolean {
  const before = text.slice(0, at).trimEnd();
  return /(\belse|\)|:)$/.test(before);
}

function pure(e: ts.Expression): boolean {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(e.operatorToken.kind)) return pure(e.left) && pure(e.right);
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return pure(e.operand);
  return ts.isIdentifier(e) || (ts.isPropertyAccessExpression(e) && pure(e.expression)) || e.kind === ts.SyntaxKind.ThisKeyword || ts.isLiteralExpression(e);
}

function same(a: ts.Expression, b: ts.Expression, sf: ts.SourceFile): boolean {
  return a.getText(sf).replace(/\s+/g, '') === b.getText(sf).replace(/\s+/g, '');
}

function isReference(id: ts.Identifier): boolean {
  const p = id.parent;
  if (ts.isPropertyAccessExpression(p) && p.name === id) return false;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodDeclaration(p)) && p.name === id) return false;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isExportSpecifier(p) || ts.isNamespaceImport(p)) return false;
  if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isBindingElement(p)) && p.name === id) return false;
  if (ts.isTypeReferenceNode(p) || ts.isTypeQueryNode(p) || ts.isQualifiedName(p)) return false;
  return true;
}

/** Whether a scope around `id` declares its name itself (anything but an import from @nativescript/core). */
function declaredAround(id: ts.Identifier): boolean {
  const name = id.text;
  const binds = (b: ts.BindingName): boolean => (ts.isIdentifier(b) ? b.text === name : b.elements.some((e) => !ts.isOmittedExpression(e) && binds(e.name)));
  for (let scope: ts.Node | undefined = id.parent; scope; scope = scope.parent) {
    if (ts.isFunctionLike(scope) && scope.parameters.some((p) => binds(p.name))) return true;
    if ((ts.isForStatement(scope) || ts.isForOfStatement(scope) || ts.isForInStatement(scope)) && scope.initializer && ts.isVariableDeclarationList(scope.initializer) && scope.initializer.declarations.some((d) => binds(d.name))) return true;
    if (ts.isCatchClause(scope) && scope.variableDeclaration && binds(scope.variableDeclaration.name)) return true;
    if (!(ts.isBlock(scope) || ts.isSourceFile(scope) || ts.isModuleBlock(scope))) continue;
    for (const st of scope.statements) {
      if (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => binds(d.name))) return true;
      if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name?.text === name) return true;
      if (ts.isImportDeclaration(st) && !(st.moduleSpecifier as ts.StringLiteral).text.startsWith('@nativescript/core')) {
        const clause = st.importClause;
        const named = clause?.namedBindings;
        if (clause?.name?.text === name || (named && ts.isNamedImports(named) && named.elements.some((e) => e.name.text === name))) return true;
      }
    }
  }
  return false;
}

function isHot(n: ts.Node): boolean {
  return ts.isPropertyAccessExpression(n) && n.name.text === 'hot' && ts.isMetaProperty(n.expression) && n.expression.name.text === 'meta';
}

/** An optional chain that starts at `import.meta.hot`, which short-circuits to undefined. */
function hotChain(e: ts.Expression): boolean {
  let n: ts.Node = e;
  let optional = false;
  while (ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n) || ts.isNonNullExpression(n) || ts.isParenthesizedExpression(n)) {
    if (isHot(n)) return optional;
    if ((ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) || ts.isCallExpression(n)) && n.questionDotToken && isHot(n.expression)) optional = true;
    n = n.expression;
  }
  return false;
}

/** A statement after which control never continues: it ends in `return` or `throw`. */
function exits(st: ts.Statement): boolean {
  if (ts.isReturnStatement(st) || ts.isThrowStatement(st)) return true;
  if (ts.isBlock(st)) return st.statements.length > 0 && exits(st.statements[st.statements.length - 1]);
  if (ts.isIfStatement(st)) return !!st.elseStatement && exits(st.thenStatement) && exits(st.elseStatement);
  return false;
}
