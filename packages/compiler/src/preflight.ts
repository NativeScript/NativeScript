// Preflight: the constructs a compiled release cannot run, found before any
// translation, each reported with the TypeScript file and line it is on and
// what to write instead. A construct listed here would otherwise either fail
// later inside swiftc or kotlinc, pointing into generated code, or compile and
// then fail at run time. Everything is reported at once.
//
// The rules are the documented subset's edges (docs: "Supported subset and
// known differences"); a rule is added with its diff case or probe.
import ts from 'typescript';

export interface PreflightFinding {
  file: string;
  line: number;
  column: number;
  what: string;
  hint: string;
  code: string;
}

/** Where a node is in the source the developer wrote (a component's own file for its virtual class). */
export type Locate = (n: ts.Node) => { file: string; line: number } | null;

/** Lib globals the runtimes do not provide, with what to write instead. */
const UNSUPPORTED_GLOBALS: Record<string, string> = {
  Proxy: 'a compiled release has no Proxy traps: use a class with explicit getters and setters, or a Map for dynamic keys',
  Reflect: 'use the operation directly (obj[key], key in obj, Object.keys(obj), new Cls(...args))',
  eval: 'there is no JavaScript engine to evaluate code: replace it with a lookup of known functions, or keep this app on the JavaScript release',
  Function: 'there is no JavaScript engine to compile a function from text: write the function in the source',
  FinalizationRegistry: 'finalizers do not run in a compiled release: release the resource explicitly (a dispose() method, or an unloaded/disposeNativeView hook)',
  SharedArrayBuffer: 'use an ArrayBuffer, and post copies between workers',
  Atomics: 'use an ArrayBuffer and post messages between workers instead of shared memory',
};

const isLibFile = (f: string) => /[\\/]typescript[\\/]lib[\\/]lib\.[\w.]+\.d\.ts$/.test(f);
const inNodeModules = (f: string) => /[\\/]node_modules[\\/]/.test(f);

/**
 * Names whose only declaration is the app's own ambient `declare const|let|var`,
 * written as a bundler constant (`__API_URL__`, `APP_VERSION`): a value only a
 * bundler `define` gives, read where nothing assigns it.
 */
const DEFINE_LIKE = /^(__[\w$]+__|[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)$/;

/**
 * The findings for `files`. `locate` maps a node to the source the developer wrote; without one, a node is
 * reported where it is in the program. `keeps` selects the top-level statements that are compiled.
 */
export function preflight(checker: ts.TypeChecker, files: readonly ts.SourceFile[], locate?: Locate, keeps?: (st: ts.Statement) => boolean): PreflightFinding[] {
  const out: PreflightFinding[] = [];
  const seen = new Set<string>();
  const report = (n: ts.Node, what: string, hint: string) => {
    const sf = n.getSourceFile();
    const at = locate?.(n);
    const lc = sf.getLineAndCharacterOfPosition(n.getStart(sf));
    const f: PreflightFinding = { file: at?.file ?? sf.fileName, line: at?.line ?? lc.line + 1, column: lc.character + 1, what, hint, code: n.getText(sf).split('\n')[0].slice(0, 80) };
    const key = `${f.file}:${f.line}:${f.column}:${what}`;
    if (!seen.has(key)) { seen.add(key); out.push(f); }
  };

  // Globals a module assigns (`globalThis.X = …`, `global.X = …`, `(global as any).X = …`): read at run time, not defined.
  const assignedGlobals = new Set<string>();
  const collectAssigned = (n: ts.Node): void => {
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      let target: ts.Expression = n.left;
      if (ts.isPropertyAccessExpression(target)) {
        let obj: ts.Expression = target.expression;
        while (ts.isParenthesizedExpression(obj) || ts.isAsExpression(obj) || ts.isNonNullExpression(obj)) obj = obj.expression;
        if (ts.isIdentifier(obj) && ['global', 'globalThis', 'window', 'self'].includes(obj.text)) assignedGlobals.add(target.name.text);
      } else if (ts.isElementAccessExpression(target) && ts.isStringLiteralLike(target.argumentExpression)) {
        assignedGlobals.add(target.argumentExpression.text);
      }
    }
    ts.forEachChild(n, collectAssigned);
  };
  files.forEach(collectAssigned);

  const visit = (n: ts.Node): void => {
    if (n.kind === ts.SyntaxKind.WithStatement) {
      report(n, '`with`', 'name the object explicitly (`obj.x` instead of `x` inside `with (obj)`)');
    } else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = n.arguments[0];
      if (!arg || !ts.isStringLiteralLike(arg)) report(n, 'import() of a computed specifier', "import each module by a literal path (`() => import('./pages/a')`), and choose among those functions at run time");
    } else if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'require' && n.arguments.length && !ts.isStringLiteralLike(n.arguments[0])) {
      report(n, 'require() of a computed specifier', 'require each module by a literal path, and choose among them at run time');
    } else if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'arguments' && n.name.text === 'callee') {
      report(n, '`arguments.callee`', 'name the function and call it by its name');
    } else if (ts.isPropertyAccessExpression(n) && n.name.text === '__proto__') {
      report(n, '`__proto__`', 'use Object.getPrototypeOf, or a class hierarchy declared in the source');
    } else if (ts.isPropertyAccessExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression)
      && n.expression.expression.text === 'process' && n.expression.name.text === 'env' && !declaredInApp(checker, n.expression.expression)) {
      report(n, `process.env.${n.name.text}, which the bundler did not define`, `a compiled release has no process environment: define process.env.${n.name.text} in the bundler config (Vite \`define\`, webpack DefinePlugin), which the compiled build reads too`);
    } else if (ts.isIdentifier(n) && isValueReference(n)) {
      const sym = checker.getSymbolAtLocation(n);
      const decls = sym?.declarations ?? [];
      const hint = UNSUPPORTED_GLOBALS[n.text];
      if (hint && decls.length && decls.every((d) => isLibFile(d.getSourceFile().fileName))) {
        report(n, n.text === 'eval' || n.text === 'Function' ? `\`${n.text}\`` : `\`${n.text}\` (not provided by the compiled runtime)`, hint);
      } else if (DEFINE_LIKE.test(n.text) && decls.length && !assignedGlobals.has(n.text) && decls.every((d) => isAmbientAppVariable(d))) {
        report(n, `${n.text}, declared but never given a value`, `if your bundler defines ${n.text} (Vite \`define\`, webpack DefinePlugin), the compiled build reads the same config: check the name there; otherwise assign globalThis.${n.text} before it is read`);
      }
    }
    ts.forEachChild(n, visit);
  };
  // A plugin module's statements the app never reaches are not compiled.
  for (const sf of files) if (!sf.isDeclarationFile) for (const st of sf.statements) if (!keeps || keeps(st)) visit(st);
  return out;
}

/** `file:line:col: what: code` then the hint, one finding per entry. */
export function formatPreflight(findings: PreflightFinding[]): string {
  return findings.map((f) => `${f.file}:${f.line}:${f.column}: ${f.what} is not supported in a compiled release: ${f.code}\n    hint: ${f.hint}`).join('\n');
}

function isAmbientAppVariable(d: ts.Declaration): boolean {
  const file = d.getSourceFile().fileName;
  if (inNodeModules(file) || isLibFile(file) || file.startsWith('/__shims__/')) return false;
  if (!ts.isVariableDeclaration(d)) return false;
  return d.getSourceFile().isDeclarationFile || !!(ts.getCombinedModifierFlags(d) & ts.ModifierFlags.Ambient);
}

/** `process` is the app's own (a module variable or parameter), not Node's. */
function declaredInApp(checker: ts.TypeChecker, id: ts.Identifier): boolean {
  const decls = checker.getSymbolAtLocation(id)?.declarations ?? [];
  return decls.some((d) => !d.getSourceFile().isDeclarationFile && !(ts.getCombinedModifierFlags(d) & ts.ModifierFlags.Ambient));
}

/** An identifier read as a value: not a declaration's name, a member name, a type or a label. */
function isValueReference(n: ts.Identifier): boolean {
  const p = n.parent;
  if (!p) return false;
  if ((ts.isPropertyAccessExpression(p) || ts.isQualifiedName(p)) && (p as ts.PropertyAccessExpression | ts.QualifiedName).name === n) return false;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p) || ts.isEnumMember(p)) && p.name === n) return false;
  if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p) || ts.isBindingElement(p)) && p.name === n) return false;
  if (ts.isBindingElement(p) && p.propertyName === n) return false;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isExportSpecifier(p) || ts.isLabeledStatement(p) || ts.isBreakOrContinueStatement(p)) return false;
  if (ts.isTypeReferenceNode(p) || ts.isTypeQueryNode(p) || ts.isExpressionWithTypeArguments(p) && ts.isHeritageClause(p.parent) && p.parent.token === ts.SyntaxKind.ImplementsKeyword) return false;
  return true;
}
