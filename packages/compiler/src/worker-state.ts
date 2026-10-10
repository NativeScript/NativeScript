import ts from 'typescript';
import { relative } from 'node:path';
import { evaluatedImports } from './modules.ts';

/** Methods that change the array, map, set or typed array they are called on. */
const MUTATORS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'set', 'fill', 'sort', 'reverse', 'copyWithin', 'delete', 'clear', 'add']);

export interface SharedStateWrite {
  /** Where the write is. */
  file: string;
  line: number;
  column: number;
  /** The module whose binding is written, and the binding. */
  module: string;
  binding: string;
  what: string;
  worker: string;
}

/**
 * Writes to module state a worker shares with the app. A worker's imports are the app's modules
 * (file statics), not fresh instances, so the worker thread reads the same objects the main thread
 * does: that is sound only while nothing changes them once their module has evaluated. Reported:
 * a module-level `let`/`var` assigned, and a write or mutating call through a module-level binding
 * (`X[i] =`, `X.p =`, `delete X.p`, `X.push(…)`), anywhere in the app's modules except the binding's own
 * module's top level, which runs before any worker starts. A write through an alias (`const a = X`) is
 * not seen.
 */
export function sharedWorkerState(program: ts.Program, workers: readonly string[], modules: ReadonlySet<string>, resolved?: (containing: string, specifier: string) => string | undefined): SharedStateWrite[] {
  const checker = program.getTypeChecker();
  const shared = new Map<ts.Symbol, { file: string; name: string; assignable: boolean; worker: string }>();
  for (const worker of workers) {
    const reached = new Set<string>();
    const queue = [worker];
    while (queue.length) {
      for (const file of evaluatedImports(program, queue.pop()!, modules, resolved)) {
        if (!reached.has(file)) { reached.add(file); queue.push(file); }
      }
    }
    for (const file of reached) {
      if (workers.includes(file)) continue;
      for (const st of program.getSourceFile(file)?.statements ?? []) {
        if (!ts.isVariableStatement(st)) continue;
        const assignable = !(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          for (const n of boundNames(d.name)) {
            const s = checker.getSymbolAtLocation(n);
            if (s && !shared.has(s)) shared.set(s, { file, name: n.text, assignable, worker });
          }
        }
      }
    }
  }
  if (!shared.size) return [];

  const resolve = (n: ts.Node) => {
    const s = checker.getSymbolAtLocation(n);
    return s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  };
  /** The module binding an access chain starts from: `X` of `X.a[i]`, or `CHORDS` of `chords.CHORDS.x` through a namespace import. */
  const bindingOf = (e: ts.Expression): ts.Node | null => {
    const chain: ts.Expression[] = [];
    for (;;) {
      if (ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e) || ts.isAsExpression(e)) e = e.expression;
      else if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) { chain.push(e); e = e.expression; }
      else break;
    }
    if (!ts.isIdentifier(e)) return null;
    const outer = chain.at(-1);
    if (outer && ts.isPropertyAccessExpression(outer) && resolve(e)?.flags && resolve(e)!.flags & ts.SymbolFlags.ValueModule) return outer.name;
    return e;
  };

  const out: SharedStateWrite[] = [];
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile || !modules.has(sf.fileName)) continue;
    const report = (node: ts.Node | null, what: string, assignment: boolean, deferred: boolean) => {
      if (!node) return;
      const s = resolve(node);
      const b = s && shared.get(s);
      if (!b || (assignment && !b.assignable) || (!deferred && sf.fileName === b.file)) return;
      const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      out.push({ file: sf.fileName, line: line + 1, column: character + 1, module: b.file, binding: b.name, what, worker: b.worker });
    };
    const target = (e: ts.Expression, deferred: boolean) => {
      while (ts.isParenthesizedExpression(e)) e = e.expression;
      if (ts.isIdentifier(e)) report(e, 'assigned', true, deferred);
      else if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) report(bindingOf(e), `written (\`${e.getText(sf)}\`)`, false, deferred);
      else if (ts.isArrayLiteralExpression(e)) e.elements.forEach((x) => target(ts.isSpreadElement(x) ? x.expression : x, deferred));
      else if (ts.isObjectLiteralExpression(e)) {
        for (const p of e.properties) {
          if (ts.isShorthandPropertyAssignment(p)) report(p.name, 'assigned', true, deferred);
          else if (ts.isPropertyAssignment(p)) target(p.initializer, deferred);
          else if (ts.isSpreadAssignment(p)) target(p.expression, deferred);
        }
      }
    };
    const visit = (n: ts.Node, deferred: boolean): void => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) target(n.left, deferred);
      else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken)) target(n.operand, deferred);
      else if (ts.isDeleteExpression(n)) report(bindingOf(n.expression), `deleted from (\`${n.getText(sf)}\`)`, false, deferred);
      else if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && MUTATORS.has(n.expression.name.text)) {
        report(bindingOf(n.expression.expression), `mutated by ${n.expression.name.text}()`, false, deferred);
      }
      // Functions and classes run later, perhaps while a worker runs; a module's own top level runs once, first.
      const later = deferred || ts.isFunctionLike(n) || ts.isClassLike(n);
      ts.forEachChild(n, (c) => visit(c, later));
    };
    visit(sf, false);
  }
  return out;
}

/** The compile error for writes `sharedWorkerState` found, relative to `root`. */
export function sharedWorkerStateError(writes: readonly SharedStateWrite[], root: string): Error {
  const lines = writes.map((w) => `${relative(root, w.file)}:${w.line}:${w.column}: \`${w.binding}\` of ${relative(root, w.module)} is ${w.what}, and the worker ${relative(root, w.worker)} shares that module`);
  return new Error(`${lines.join('\n')}\nA worker shares the modules it imports with the app: move this state into the worker script, or pass it with postMessage.`);
}

function boundNames(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : boundNames(e.name)));
}
