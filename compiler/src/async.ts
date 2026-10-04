import ts from 'typescript';
import type { Translator } from './swift.ts';

/**
 * Async functions as Swift over `JSPromise`, without Swift concurrency. The
 * body runs synchronously up to its first `await`; everything after an
 * await is a continuation closure that the awaited promise's reaction job
 * calls, so each await takes the ticks ECMAScript's Await() takes. A loop
 * whose body awaits is a trampolined `JSAsyncLoop`, a `try` around awaits
 * routes errors to a catch closure, and `finally` runs on every way out.
 */
export interface AsyncCtx {
  /** The function's `JSAsync` capability. */
  cap: string;
  /** The promise's value type (Swift). */
  result: string;
  /** Run when the current statement list completes; null completes the function. */
  next: string | null;
  /** A `(Any?) -> Void` that takes what the current region throws. */
  onError: string;
  /** A statement completing the function with an already translated value (null: none). */
  ret: (value: string | null, isPromise: boolean) => string;
  /** Statements for `break`/`continue` of the innermost lowered loop. */
  brk?: string;
  cont?: string;
}

export function containsAwait(n: ts.Node): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found) return;
    if (ts.isAwaitExpression(c) || (ts.isForOfStatement(c) && c.awaitModifier)) { found = true; return; }
    if (ts.isFunctionLike(c) || ts.isClassLike(c)) return;
    ts.forEachChild(c, visit);
  };
  visit(n);
  return found;
}

export class AsyncLowering {
  private t: Translator;

  constructor(t: Translator) {
    this.t = t;
  }

  /** The Swift body (inside the braces) of an async function returning `JSPromise<result>`. */
  body(fn: ts.FunctionLikeDeclaration, result: string): string[] {
    const t = this.t;
    const cap = t.fresh('__async');
    const i = t.indent;
    const ctx: AsyncCtx = {
      cap, result, next: null, onError: `${cap}.throwValue`,
      ret: (v, isPromise) => (v === null ? `${cap}.returnValue(${result === 'Void' ? '()' : 'nil'})` : `${cap}.${isPromise ? 'returnPromise' : 'returnValue'}(${v})`),
    };
    const out = [`${i}let ${cap} = JSAsync<${result}>()`];
    const inner = t.nested(() => {
      const prelude = t.paramPrelude(fn);
      if (fn.body && ts.isBlock(fn.body)) return [...prelude, ...this.list([...fn.body.statements], ctx)];
      const e = fn.body as ts.Expression;
      return [...prelude, ...this.linearize([e], ctx, () => [t.indent + this.retStatement(ctx, e)])];
    });
    out.push(`${i}${cap}.body {`, ...inner, `${i}}`, `${i}return ${cap}.promise`);
    return out;
  }

  private retStatement(ctx: AsyncCtx, e: ts.Expression | undefined): string {
    const t = this.t;
    if (!e) return ctx.ret(null, false);
    const isPromise = t.typeOf(e).startsWith('JSPromise<');
    return t.tryPrefix(e) + ctx.ret(isPromise ? t.expr(e) : t.coerce(e, ctx.result), isPromise);
  }

  /** A statement list, its tail moved into a continuation at the first statement that awaits. */
  list(list: ts.Statement[], ctx: AsyncCtx): string[] {
    const t = this.t;
    const out: string[] = [];
    for (const [ix, fn] of hoistedFunctions(list)) { out.push(t.withAsync(ctx, () => t.stmt(fn))); list = list.filter((_, k) => k !== ix); }
    for (let k = 0; k < list.length; k++) {
      const s = list[k];
      if (!containsAwait(s)) { out.push(t.withAsync(ctx, () => t.stmt(s))); continue; }
      let inner = ctx;
      const rest = list.slice(k + 1);
      // A simple statement's continuation is the rest of the list itself, in the scope of what it declares.
      if (ts.isExpressionStatement(s) || ts.isVariableStatement(s) || ts.isReturnStatement(s) || ts.isThrowStatement(s)) {
        out.push(...this.statement(s, ctx, () => this.list(rest, ctx)));
        return out;
      }
      if (rest.length) {
        const name = t.fresh('__next');
        const body = t.nested(() => this.list(rest, ctx));
        out.push(`${t.indent}let ${name}: () -> Void = ${this.closure('()', body, ctx.onError)}`);
        inner = { ...ctx, next: `${name}()` };
      }
      out.push(...this.statement(s, inner));
      return out;
    }
    const last = list.at(-1);
    if (!last || !(ts.isReturnStatement(last) || ts.isThrowStatement(last))) out.push(t.indent + (ctx.next ?? ctx.ret(null, false)));
    return out;
  }

  /** `{ params -> Void in body }`, errors in the body going to `onError`. */
  closure(params: string, body: string[], onError: string): string {
    const t = this.t;
    const i = t.indent;
    if (!body.some((l) => /\btry\b|\bthrow\b/.test(l))) return `{ ${params} -> Void in\n${body.join('\n')}\n${i}}`;
    const deeper = body.map((l) => '    ' + l);
    return `{ ${params} -> Void in\n${i}    do {\n${deeper.join('\n')}\n${i}    } catch {\n${i}        ${onError}(jsCaught(error))\n${i}    }\n${i}}`;
  }

  private statement(s: ts.Statement, ctx: AsyncCtx, then?: () => string[]): string[] {
    const t = this.t;
    const i = t.indent;
    const next = then ?? (() => [t.indent + (ctx.next ?? ctx.ret(null, false))]);
    if (ts.isBlock(s)) return [`${i}do {`, ...t.nested(() => this.list([...s.statements], ctx)), `${i}}`];
    if (ts.isExpressionStatement(s)) return this.linearize([s.expression], ctx, () => [i + t.tryPrefix(s.expression) + t.exprStatement(s.expression), ...next()]);
    if (ts.isReturnStatement(s)) return this.linearize(s.expression ? [s.expression] : [], ctx, () => [i + this.retStatement(ctx, s.expression)]);
    if (ts.isThrowStatement(s)) return this.linearize([s.expression], ctx, () => [i + t.withAsync(ctx, () => t.stmt(s)).trim()]);
    if (ts.isVariableStatement(s)) return this.declarations([...s.declarationList.declarations], s, ctx, next);
    if (ts.isIfStatement(s)) {
      return this.linearize([s.expression], ctx, () => {
        const branch = (b: ts.Statement) => t.nested(() => this.list(ts.isBlock(b) ? [...b.statements] : [b], ctx));
        return [`${i}if ${t.tryPrefix(s.expression)}${t.cond(s.expression)} {`, ...branch(s.thenStatement), `${i}} else {`, ...(s.elseStatement ? branch(s.elseStatement) : t.nested(() => [t.indent + (ctx.next ?? ctx.ret(null, false))])), `${i}}`];
      });
    }
    if (ts.isWhileStatement(s)) return this.loop(ctx, { cond: s.expression, body: s.statement });
    if (ts.isDoStatement(s)) return this.loop(ctx, { cond: s.expression, body: s.statement, condAfter: true });
    if (ts.isForStatement(s)) {
      const out: string[] = [];
      if (s.initializer) {
        if (containsAwait(s.initializer)) throw t.error(s.initializer, 'await in a for loop initializer');
        out.push(ts.isVariableDeclarationList(s.initializer)
          ? t.withAsync(ctx, () => t.declarationList(s.initializer as ts.VariableDeclarationList, true))
          : i + t.exprStatement(s.initializer as ts.Expression));
      }
      return [...out, ...this.loop(ctx, { cond: s.condition, body: s.statement, step: s.incrementor })];
    }
    if (ts.isForOfStatement(s)) {
      if (s.awaitModifier) throw t.error(s, 'for await');
      const it = t.fresh('__it');
      return this.linearize([s.expression], ctx, () => [`${i}var ${it} = ${t.tryPrefix(s.expression)}${t.iterable(s.expression)}.makeIterator()`, ...this.loop(ctx, { body: s.statement, iterator: it, binding: s.initializer as ts.VariableDeclarationList, of: s.expression })]);
    }
    if (ts.isTryStatement(s)) return this.tryStatement(s, ctx);
    if (ts.isLabeledStatement(s)) throw t.error(s, 'a labeled statement that awaits');
    if (ts.isSwitchStatement(s)) throw t.error(s, 'a switch that awaits');
    throw t.error(s, 'this statement with await');
  }

  private declarations(decls: ts.VariableDeclaration[], s: ts.VariableStatement, ctx: AsyncCtx, then: () => string[]): string[] {
    const t = this.t;
    if (!decls.length) return then();
    const [d, ...more] = decls;
    const rest = () => this.declarations(more, s, ctx, then);
    const constant = !!(s.declarationList.flags & ts.NodeFlags.Const);
    if (!d.initializer || !containsAwait(d.initializer)) return [t.withAsync(ctx, () => t.declaration(d, constant, true)), ...rest()];
    return this.linearize([d.initializer], ctx, () => [t.withAsync(ctx, () => t.declaration(d, constant, true)), ...rest()]);
  }

  /**
   * Evaluates `exprs` up to their awaits: each await's operand, and whatever
   * JavaScript evaluates before it, is computed first; the rest of the work
   * (`finish`) runs in the continuation with the awaited values substituted.
   */
  linearize(exprs: ts.Expression[], ctx: AsyncCtx, finish: () => string[]): string[] {
    const t = this.t;
    // Suspension points in evaluation order: awaits, and conditional operators whose conditional part awaits.
    const points: ts.Expression[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isFunctionLike(n) || ts.isClassLike(n)) return;
      if (conditionallyAwaits(n)) {
        visit(ts.isConditionalExpression(n) ? n.condition : (n as ts.BinaryExpression).left);
        points.push(n as ts.Expression);
        return;
      }
      ts.forEachChild(n, visit);
      if (ts.isAwaitExpression(n)) points.push(n);
    };
    for (const e of exprs) visit(e);
    const step = (k: number): string[] => {
      if (k === points.length) return finish();
      const a = points[k];
      const i = t.indent;
      const lines: string[] = [];
      for (const h of this.evaluatedBefore(a, exprs)) {
        const name = t.fresh('__v');
        lines.push(`${i}let ${name}: ${t.typeOf(h)} = ${t.tryPrefix(h)}${t.expr(h)}`);
        t.subst.set(h, name);
      }
      if (!ts.isAwaitExpression(a)) return [...lines, ...this.conditional(a, ctx, () => step(k + 1))];
      const operand = a.expression;
      const isPromise = t.typeOf(operand).startsWith('JSPromise<');
      const code = `${t.tryPrefix(operand)}${t.expr(operand)}`;
      const v = t.fresh('__t');
      const type = t.typeOf(a);
      t.subst.set(a, v);
      const body = t.nested(() => step(k + 1));
      lines.push(`${i}jsAwait(${isPromise ? code : `value: ${code}`}, ${this.closure(`(${v}: ${type})`, body, ctx.onError)}, ${ctx.onError})`);
      return lines;
    };
    return step(0);
  }

  /** `c ? await a : b`, `x && await y`: the operator as an if, both ways joining the rest of the work with the value. */
  private conditional(e: ts.Expression, ctx: AsyncCtx, rest: () => string[]): string[] {
    const t = this.t;
    const i = t.indent;
    const type = t.typeOf(e);
    const value = t.fresh('__c');
    const join = t.fresh('__join');
    const lines = [`${i}var ${value}: ${t.deferredType(type)}`];
    t.subst.set(e, value);
    lines.push(`${i}let ${join}: () -> Void = ${this.closure('()', t.nested(rest), ctx.onError)}`);
    const branch = (x: ts.Expression) => t.nested(() => this.linearize([x], ctx, () => [`${t.indent}${value} = ${t.tryPrefix(x)}${t.coerce(x, type)}`, `${t.indent}${join}()`]));
    if (ts.isConditionalExpression(e)) {
      lines.push(`${i}if ${t.tryPrefix(e.condition)}${t.cond(e.condition)} {`, ...branch(e.whenTrue), `${i}} else {`, ...branch(e.whenFalse), `${i}}`);
      return lines;
    }
    const b = e as ts.BinaryExpression;
    const left = t.fresh('__l');
    lines.push(`${i}let ${left}: ${t.typeOf(b.left)} = ${t.tryPrefix(b.left)}${t.expr(b.left)}`);
    const K = ts.SyntaxKind;
    const test = b.operatorToken.kind === K.QuestionQuestionToken ? `jsIsNullish(${left})` : b.operatorToken.kind === K.AmpersandAmpersandToken ? `jsTruthy(${left})` : `!jsTruthy(${left})`;
    const keep = t.typeOf(b.left) === type || type === 'Any?' ? left : `${left}!`;
    lines.push(`${i}if ${test} {`, ...branch(b.right), `${i}} else {`, `${i}    ${value} = ${keep}`, `${i}    ${join}()`, `${i}}`);
    return lines;
  }

  /** The operands JavaScript evaluates before `a` that a continuation would otherwise read late. */
  private evaluatedBefore(a: ts.Expression, roots: ts.Expression[]): ts.Expression[] {
    const t = this.t;
    const out: ts.Expression[] = [];
    for (let n: ts.Node = a; n.parent && !roots.includes(n as ts.Expression); n = n.parent) {
      const p = n.parent;
      const children: ts.Node[] = [];
      ts.forEachChild(p, (c) => { children.push(c); });
      for (const c of children.slice(0, children.indexOf(n))) {
        let e = c as ts.Expression;
        if (!ts.isExpression(c) || ts.isTypeNode(c as ts.Node)) continue;
        if (ts.isPropertyAccessExpression(p) && c === p.name) continue;
        // A method call's receiver, not the method value, is what is read early.
        if (ts.isCallExpression(p) && c === p.expression && ts.isPropertyAccessExpression(c)) e = c.expression;
        if (ts.isBinaryExpression(p) && c === p.left && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) continue;
        if (!t.subst.has(e) && !this.stable(e)) out.push(e);
      }
    }
    return out;
  }

  private stable(e: ts.Expression): boolean {
    if (ts.isLiteralExpression(e) || e.kind === ts.SyntaxKind.ThisKeyword || e.kind === ts.SyntaxKind.SuperKeyword || e.kind === ts.SyntaxKind.TrueKeyword || e.kind === ts.SyntaxKind.FalseKeyword || e.kind === ts.SyntaxKind.NullKeyword) return true;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isIdentifier(e)) {
      const decl = this.t.checker.getSymbolAtLocation(e)?.valueDeclaration;
      if (!decl || decl.getSourceFile().isDeclarationFile) return true;
      if (ts.isFunctionDeclaration(decl) || ts.isClassDeclaration(decl) || ts.isEnumDeclaration(decl)) return true;
      if (ts.isVariableDeclaration(decl) && ts.isVariableDeclarationList(decl.parent) && decl.parent.flags & ts.NodeFlags.Const) return true;
    }
    return false;
  }

  private loop(ctx: AsyncCtx, o: { cond?: ts.Expression; body: ts.Statement; step?: ts.Expression; condAfter?: boolean; iterator?: string; binding?: ts.VariableDeclarationList; of?: ts.Expression }): string[] {
    const t = this.t;
    const i = t.indent;
    const brk = t.fresh('__break');
    const cont = t.fresh('__continue');
    const first = t.fresh('__first');
    const out = [`${i}let ${brk}: () -> Void = ${this.closure('()', t.nested(() => [t.indent + (ctx.next ?? ctx.ret(null, false))]), ctx.onError)}`];
    if (o.condAfter) out.push(`${i}var ${first} = true`);
    const iteration = t.nested(() => {
      const j = t.indent;
      const lines: string[] = [];
      const again = o.step ? `${t.exprStatement(o.step)}; ${cont}()` : `${cont}()`;
      const inner: AsyncCtx = { ...ctx, next: again, brk: `${brk}()`, cont: again };
      if (o.iterator) {
        const decl = o.binding!.declarations[0];
        const item = t.fresh('__item');
        lines.push(`${j}guard let ${item} = ${o.iterator}.next() else { ${brk}(); return }`);
        lines.push(t.withAsync(inner, () => t.bindTo(decl.name, item, t.elementTypeOf(o.of!), !(o.binding!.flags & ts.NodeFlags.Const))));
        lines.push(...t.withLoweredLoop(() => this.list(ts.isBlock(o.body) ? [...o.body.statements] : [o.body], inner)));
        return lines;
      }
      const check = (rest: () => string[]) => (o.cond
        ? this.linearize([o.cond], ctx, () => [`${t.indent}if !(${t.tryPrefix(o.cond!)}${t.cond(o.cond!)}) { ${brk}(); return }`, ...rest()])
        : rest());
      const body = () => t.withLoweredLoop(() => this.list(ts.isBlock(o.body) ? [...o.body.statements] : [o.body], inner));
      if (o.condAfter) {
        if (containsAwait(o.cond!)) throw t.error(o.cond!, 'await in a do-while condition');
        lines.push(`${j}if !${first} && !(${t.tryPrefix(o.cond!)}${t.cond(o.cond!)}) { ${brk}(); return }`, `${j}${first} = false`);
        lines.push(...body());
        return lines;
      }
      return check(body);
    });
    out.push(`${i}JSAsyncLoop().run ${this.closure(`(${cont}: @escaping () -> Void)`, iteration, ctx.onError)}`);
    return out;
  }

  private tryStatement(s: ts.TryStatement, ctx: AsyncCtx): string[] {
    const t = this.t;
    const i = t.indent;
    const out: string[] = [];
    let region = ctx;
    if (s.finallyBlock) {
      const fin = t.fresh('__finally');
      const resume = t.fresh('__resume');
      const body = t.nested(() => this.list([...s.finallyBlock!.statements], { ...ctx, next: `${resume}()` }));
      out.push(`${i}let ${fin}: (@escaping () -> Void) -> Void = ${this.closure(`(${resume}: @escaping () -> Void)`, body, ctx.onError)}`);
      const through = (stmt: string) => `${fin}({ ${stmt} })`;
      const err = t.fresh('__error');
      out.push(`${i}let ${err}: (Any?) -> Void = { (e: Any?) -> Void in ${fin}({ ${ctx.onError}(e) }) }`);
      region = {
        ...ctx, onError: err,
        next: through(ctx.next ?? ctx.ret(null, false)),
        ret: (v, p) => (v === null ? through(ctx.ret(null, false)) : `do { let __value = ${v}; ${through(ctx.ret('__value', p))} }`),
        brk: ctx.brk && through(ctx.brk), cont: ctx.cont && through(ctx.cont),
      };
    }
    let tryCtx = region;
    if (s.catchClause) {
      const name = t.fresh('__catch');
      const caught = t.fresh('__e');
      const body = t.nested(() => {
        const lines: string[] = [];
        const binding = s.catchClause!.variableDeclaration;
        if (binding) lines.push(t.withAsync(region, () => t.bindTo(binding.name, caught, 'Any?', true)));
        return [...lines, ...this.list([...s.catchClause!.block.statements], region)];
      });
      out.push(`${i}let ${name}: (Any?) -> Void = ${this.closure(`(${caught}: Any?)`, body, region.onError)}`);
      tryCtx = { ...region, onError: name };
    }
    const body = t.nested(() => this.list([...s.tryBlock.statements], tryCtx));
    if (body.some((l) => /\btry\b|\bthrow\b/.test(l))) out.push(`${i}do {`, ...body.map((l) => '    ' + l), `${i}} catch {`, `${i}    ${tryCtx.onError}(jsCaught(error))`, `${i}}`);
    else out.push(`${i}do {`, ...body, `${i}}`);
    return out;
  }
}

function conditionallyAwaits(n: ts.Node): boolean {
  if (ts.isConditionalExpression(n)) return containsAwait(n.whenTrue) || containsAwait(n.whenFalse);
  const K = ts.SyntaxKind;
  return ts.isBinaryExpression(n) && [K.AmpersandAmpersandToken, K.BarBarToken, K.QuestionQuestionToken].includes(n.operatorToken.kind) && containsAwait(n.right);
}

/** Function declarations in a list, which JavaScript hoists to its top. */
function hoistedFunctions(list: ts.Statement[]): [number, ts.FunctionDeclaration][] {
  return list.flatMap((s, k) => (ts.isFunctionDeclaration(s) ? [[k, s] as [number, ts.FunctionDeclaration]] : [])).reverse();
}
