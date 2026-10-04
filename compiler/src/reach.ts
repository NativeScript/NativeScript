import ts from 'typescript';
import { runtimeRelative } from './plugins/resolve.ts';
import { recognizePatterns } from './patterns.ts';

/**
 * What a closed-world build compiles of the plugins: the declarations the
 * app reaches, the plugin modules that load (for their import-time effects),
 * and the branches no call can take.
 *
 * Starting from every statement of the app's own files and the import-time
 * statements of each plugin module that loads, a declaration is reached when
 * reached code names it; a class brings all its members. A plugin module
 * loads when reached code imports a value from it (or imports it for its
 * effects), as JavaScript's module graph does once type-only imports are
 * elided. A function parameter that every call passes the same literal for
 * (or leaves to the same literal default) is that constant inside the
 * function, so the branches it decides are dead (`install(true)` paths).
 */
export interface Reach {
  /** Plugin files that load, in no particular order. */
  modules: Set<string>;
  /** Reached top-level declarations of plugin files (statements). */
  declarations: Set<ts.Node>;
  /** The branch an `if`, `?:`, `&&` or `||` always takes: the node of the dead branch. */
  dead: Set<ts.Node>;
  /** Whether a top-level statement of a plugin file is compiled. */
  keeps(statement: ts.Statement): boolean;
  /** The value a condition always has, if constant parameters decide it. */
  constant(e: ts.Expression): boolean | undefined;
}

type Literal = boolean | number | string | undefined;

export function reachability(program: ts.Program, resolved: (containing: string, specifier: string) => string | undefined, appFiles: readonly string[], pluginFiles: ReadonlySet<string>, platform: 'ios' | 'android'): Reach {
  const checker = program.getTypeChecker();
  const isPlugin = (sf: ts.SourceFile) => pluginFiles.has(sf.fileName);
  const resolveSym = (n: ts.Node) => {
    const s = checker.getSymbolAtLocation(n);
    return s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  };

  // ---- Constant parameters: every call passes the same literal.
  const params = new Map<ts.Symbol, Literal | null>();
  const literal = (e: ts.Expression | undefined): Literal | null => {
    if (!e) return undefined;
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isNumericLiteral(e)) return Number(e.text);
    if (ts.isStringLiteralLike(e)) return e.text;
    if (ts.isIdentifier(e) && e.text === 'undefined') return undefined;
    return null;
  };
  const escaping = new Set<ts.Symbol>();
  const calls = new Map<ts.Symbol, ts.CallExpression[]>();
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile || !(isPlugin(sf) || appFiles.includes(sf.fileName))) continue;
    const visit = (n: ts.Node) => {
      if (ts.isIdentifier(n) && !isDeclarationName(n)) {
        const s = resolveSym(n);
        const decl = s?.valueDeclaration;
        if (s && decl && ts.isFunctionDeclaration(decl)) {
          if (ts.isCallExpression(n.parent) && n.parent.expression === n) calls.set(s, [...(calls.get(s) ?? []), n.parent]);
          else if (!ts.isExportSpecifier(n.parent) && !ts.isImportSpecifier(n.parent)) escaping.add(s);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  for (const [fn, sites] of calls) {
    if (escaping.has(fn)) continue;
    const decl = fn.valueDeclaration as ts.FunctionDeclaration;
    decl.parameters.forEach((p, k) => {
      if (!ts.isIdentifier(p.name) || p.dotDotDotToken) return;
      const fallback = literal(p.initializer);
      let value: Literal | null = null;
      let first = true;
      for (const call of sites) {
        if (call.arguments.some(ts.isSpreadElement)) { value = null; first = false; break; }
        const given = k < call.arguments.length ? literal(call.arguments[k]) : fallback;
        const v = given === undefined && p.initializer ? fallback : given;
        if (v === null) { value = null; first = false; break; }
        if (first) { value = v; first = false; } else if (v !== value) { value = null; break; }
      }
      const sym = checker.getSymbolAtLocation(p.name);
      if (sym && !first && value !== null && !assigned(decl, sym, checker)) params.set(sym, value);
    });
  }
  const valueOf = (e: ts.Expression): Literal | null => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    const l = literal(e);
    if (l !== null) return l;
    if (ts.isIdentifier(e)) {
      const s = checker.getSymbolAtLocation(e);
      if (s && params.has(s)) return params.get(s)!;
    }
    return null;
  };
  const constant = (e: ts.Expression): boolean | undefined => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    const v = valueOf(e);
    if (v !== null && (ts.isIdentifier(e))) return !!v;
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) {
      const inner = constant(e.operand);
      return inner === undefined ? undefined : !inner;
    }
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.EqualsEqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken) {
        const a = valueOf(e.left), b = valueOf(e.right);
        if (a !== null && b !== null) return (a === b) === (op === ts.SyntaxKind.EqualsEqualsEqualsToken);
        return undefined;
      }
      const l = constant(e.left);
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        if (l === false) return false;
        const r = constant(e.right);
        if (l === true) return r;
        return r === false && isPure(e.left) ? false : undefined;
      }
      if (op === ts.SyntaxKind.BarBarToken) {
        if (l === true) return true;
        const r = constant(e.right);
        if (l === false) return r;
        return r === true && isPure(e.left) ? true : undefined;
      }
    }
    return undefined;
  };

  // ---- Reachability.
  const patterns = recognizePatterns(checker, program.getSourceFiles().filter((sf) => !sf.isDeclarationFile && (isPlugin(sf) || appFiles.includes(sf.fileName))));
  const declarations = new Set<ts.Node>();
  const modules = new Set<string>();
  const dead = new Set<ts.Node>();
  const queue: ts.Node[] = [];
  const seen = new Set<ts.Node>();
  const push = (n: ts.Node) => { if (!seen.has(n)) { seen.add(n); queue.push(n); } };

  const topLevel = (decl: ts.Node): ts.Statement | null => {
    let n: ts.Node | undefined = decl;
    while (n && !ts.isSourceFile(n.parent)) n = n.parent;
    return n && ts.isSourceFile(n.parent) ? (n as ts.Statement) : null;
  };
  const load = (file: string) => {
    if (modules.has(file)) return;
    const sf = program.getSourceFile(file);
    if (!sf) return;
    modules.add(file);
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) && !st.importClause) loadImport(st, sf);
      else if (ts.isExportDeclaration(st) && st.moduleSpecifier && !st.isTypeOnly && (!st.exportClause || hasValueExports(st))) loadImport(st, sf);
      else if (hasEffects(st)) push(st);
    }
  };
  const loadImport = (st: ts.ImportDeclaration | ts.ExportDeclaration, sf: ts.SourceFile) => {
    const target = importedFile(st, sf);
    if (target && pluginFiles.has(target)) load(target);
  };
  const importedFile = (st: ts.ImportDeclaration | ts.ExportDeclaration, sf: ts.SourceFile): string | null => {
    const spec = (st.moduleSpecifier as ts.StringLiteral).text;
    const file = resolved(sf.fileName, spec);
    if (file && !file.endsWith('.d.ts')) return file;
    // A relative import that TypeScript types with a `.d.ts` loads the platform's source at run time.
    return spec.startsWith('.') && isPlugin(sf) ? runtimeRelative(spec, sf.fileName, platform) : file ?? null;
  };
  const hasValueExports = (st: ts.ExportDeclaration) => {
    const clause = st.exportClause;
    if (!clause || !ts.isNamedExports(clause)) return true;
    return clause.elements.some((e) => !e.isTypeOnly && isValue(checker.getExportSpecifierLocalTargetSymbol(e)));
  };

  // A name declared in a `.d.ts` beside a plugin's source is its platform file's export at run time.
  const runtimeOf = (sym: ts.Symbol, at: ts.Node): ts.Symbol => {
    const decl = sym.declarations?.[0];
    if (!decl || !decl.getSourceFile().isDeclarationFile) return sym;
    const local = checker.getSymbolAtLocation(at);
    const spec = local?.declarations?.[0];
    const importDecl = spec && ts.findAncestor(spec, ts.isImportDeclaration);
    if (!importDecl) return sym;
    const file = importedFile(importDecl, importDecl.getSourceFile());
    const target = file && program.getSourceFile(file);
    if (!target || !pluginFiles.has(file!)) return sym;
    load(file!);
    const exported = checker.getSymbolAtLocation(target)?.exports?.get(sym.escapedName);
    return exported ? (exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported) : sym;
  };

  const reachDecl = (sym: ts.Symbol, at: ts.Node) => {
    const s = runtimeOf(sym, at);
    for (const d of s.declarations ?? []) {
      const sf = d.getSourceFile();
      if (sf.isDeclarationFile || !isPlugin(sf)) continue;
      const st = topLevel(d);
      if (!st || declarations.has(st)) continue;
      declarations.add(st);
      load(sf.fileName);
      push(st);
    }
  };

  const walk = (n: ts.Node) => {
    if (ts.isIfStatement(n)) {
      const c = constant(n.expression);
      if (c !== undefined) {
        dead.add(c ? n.elseStatement ?? n.expression : n.thenStatement);
        walk(n.expression);
        const live = c ? n.thenStatement : n.elseStatement;
        if (live) walk(live);
        return;
      }
    }
    if (ts.isConditionalExpression(n)) {
      const c = constant(n.condition);
      if (c !== undefined) { dead.add(c ? n.whenFalse : n.whenTrue); walk(c ? n.whenTrue : n.whenFalse); return; }
    }
    if (ts.isTypeNode(n) && !ts.isExpressionWithTypeArguments(n)) return;
    // Decorators are applied at compile time: the patterns the translator recognizes, not code that runs.
    if (ts.isDecorator(n)) return;
    // A mixin application installs its classes; the copying function itself does not run.
    if (ts.isCallExpression(n) && patterns.isMixinCall(n)) { n.arguments.slice(1).forEach(walk); return; }
    if (ts.isVariableDeclaration(n) && patterns.requiredCore(n)) return;
    if (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) return;
    if (ts.isImportDeclaration(n)) return;
    if (ts.isIdentifier(n) && !isDeclarationName(n)) {
      const sym = resolveSym(n);
      if (sym && isValue(sym)) {
        reachDecl(sym, n);
        // Reading an imported name loads its module.
        const local = checker.getSymbolAtLocation(n);
        const importDecl = local?.declarations?.[0] && ts.findAncestor(local.declarations[0], ts.isImportDeclaration);
        if (importDecl) loadImport(importDecl, importDecl.getSourceFile());
      }
    }
    ts.forEachChild(n, walk);
  };

  for (const f of appFiles) {
    const sf = program.getSourceFile(f);
    if (!sf) continue;
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) && !st.importClause) loadImport(st, sf);
      push(st);
    }
  }
  // A loaded module still loads what it imports values from, even when no reached code reads them:
  // only an import whose target does something at load time matters to a closed world.
  for (let more = true; more; ) {
    while (queue.length) walk(queue.shift()!);
    more = false;
    for (const file of [...modules]) {
      const sf = program.getSourceFile(file)!;
      for (const st of sf.statements) {
        if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
        const target = importedFile(st, sf);
        const tsf = target && pluginFiles.has(target) && !modules.has(target) ? program.getSourceFile(target) : undefined;
        if (tsf && tsf.statements.some(hasEffects)) { load(target!); more = true; }
      }
    }
  }

  return {
    modules, declarations, dead,
    keeps: (st) => !isPlugin(st.getSourceFile()) || declarations.has(st) || (modules.has(st.getSourceFile().fileName) && hasEffects(st)),
    constant,
  };
}

function isValue(sym: ts.Symbol | undefined): boolean {
  return !!sym && !!(sym.flags & ts.SymbolFlags.Value);
}

function isDeclarationName(id: ts.Identifier): boolean {
  const p = id.parent;
  if (ts.isPropertyAccessExpression(p) && p.name === id) return true;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p) || ts.isEnumMember(p)) && p.name === id) return true;
  if ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p) || ts.isBindingElement(p) || ts.isEnumDeclaration(p)) && p.name === id) return true;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isExportSpecifier(p)) return true;
  if (ts.isTypeReferenceNode(p) || ts.isQualifiedName(p) || ts.isTypeQueryNode(p)) return true;
  return false;
}

/** Whether a top-level statement does something when its module loads, beyond declaring. */
function hasEffects(st: ts.Statement): boolean {
  if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isModuleDeclaration(st)) return false;
  if (ts.isEmptyStatement(st)) return false;
  if (ts.canHaveModifiers(st) && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword)) return false;
  // Classes and enums are declarations whose definition has no effect beyond itself (decorators register, though).
  if (ts.isClassDeclaration(st)) return !!ts.getDecorators(st)?.length && ts.getDecorators(st)!.some((d) => !/^NativeClass\b/.test(d.expression.getText()));
  if (ts.isEnumDeclaration(st)) return false;
  if (ts.isVariableStatement(st)) return st.declarationList.declarations.some((d) => d.initializer && !isPure(d.initializer, true));
  return true;
}

/** An expression whose evaluation has no effect anyone can observe; `new` of a value class counts, in a closed world. */
function isPure(e: ts.Expression, construct = false): boolean {
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
  if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || ts.isIdentifier(e) || ts.isArrowFunction(e) || ts.isFunctionExpression(e) || ts.isClassExpression(e)) return true;
  if ([ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword, ts.SyntaxKind.ThisKeyword].includes(e.kind)) return true;
  if (ts.isTemplateExpression(e)) return e.templateSpans.every((s) => isPure(s.expression, construct));
  if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => isPure(ts.isSpreadElement(x) ? x.expression : x, construct));
  if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? isPure(p.initializer, construct) && (!ts.isComputedPropertyName(p.name) || isPure(p.name.expression, construct)) : !ts.isSpreadAssignment(p) || isPure(p.expression, construct)));
  if (ts.isPrefixUnaryExpression(e)) return isPure(e.operand, construct);
  if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && isPure(e.left, construct) && isPure(e.right, construct);
  if (ts.isPropertyAccessExpression(e)) return isPure(e.expression, construct);
  if (construct && ts.isNewExpression(e)) return (e.arguments ?? []).every((a) => isPure(a, construct));
  if (construct && ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'Symbol') return true;
  return false;
}

function assigned(fn: ts.FunctionLikeDeclaration, sym: ts.Symbol, checker: ts.TypeChecker): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && ts.isIdentifier(n.left) && checker.getSymbolAtLocation(n.left) === sym) found = true;
    ts.forEachChild(n, visit);
  };
  if (fn.body) visit(fn.body);
  return found;
}
