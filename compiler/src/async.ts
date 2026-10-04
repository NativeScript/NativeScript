import ts from 'typescript';

/**
 * Async functions as continuations over spec-exact promises, for either
 * target (`AsyncSyntax` spells the few constructs the lowering writes). The
 * body runs synchronously up to its first `await`; everything after an
 * await is a continuation closure that the awaited promise's reaction job
 * calls, so each await takes the ticks ECMAScript's Await() takes. A loop
 * whose body awaits is a trampolined `JSAsyncLoop`, a `try` around awaits
 * routes errors to a catch closure, and `finally` runs on every way out.
 */
export interface AsyncCtx {
  /** The function's `JSAsync` capability. */
  cap: string;
  /** The promise's value type, in the target language. */
  result: string;
  /** Run when the current statement list completes; null completes the function. */
  next: string | null;
  /** A function value taking what the current region throws. */
  onError: string;
  /** A statement completing the function with an already translated value (null: none). */
  ret: (value: string | null, isPromise: boolean) => string;
  /** Statements for `break`/`continue` of the innermost lowered loop. */
  brk?: string;
  cont?: string;
}

/** The target language's spelling of what the lowering writes. */
export interface AsyncSyntax {
  readonly voidType: string;
  /** A function type: `(A) -> Void`. */
  fnType(params: string[], ret: string): string;
  /** `let name: type = value` (no type: inferred). */
  constant(name: string, type: string | null, value: string): string;
  /** A closure whose body's errors go to `onError`; `return` leaves it. */
  closure(params: [string, string][], body: string[], onError: string, indent: string): string;
  /** A closure of one statement, optionally taking one parameter. */
  inline(statement: string, param?: [string, string]): string;
  ifOpen(cond: string): string;
  readonly elseOpen: string;
  /** `if cond { statements }` on one line. */
  ifLine(cond: string, statements: string): string;
  /** A nested scope: `do {` / `run {`. */
  readonly scopeOpen: string;
  /** Statements running `body`, errors going to `onError`. */
  tryBlock(body: string[], onError: string, indent: string): string[];
  /** `x!`: a value known not to be undefined. */
  unwrap(code: string): string;
  /** `var name` holding the iterator over a sequence, and the statements taking its next item or else running `otherwise`. */
  makeIterator(name: string, seq: string): string;
  nextItem(item: string, iterator: string, otherwise: string, indent: string): string[];
  awaitCall(operand: string, isPromise: boolean, continuation: string, onError: string): string;
  asyncStart(cap: string, result: string): string;
  asyncBody(cap: string): [string, string];
  asyncReturn(cap: string, value: string | null, isPromise: boolean, result: string): string;
  asyncError(cap: string): string;
  loopRun(iteration: string): string;
}

/** What the lowering needs from a translator. */
export interface AsyncTranslator {
  indent: string;
  readonly subst: Map<ts.Node, string>;
  readonly checker: ts.TypeChecker;
  readonly syntax: AsyncSyntax;
  fresh(prefix: string): string;
  nested<T>(body: () => T): T;
  withAsync<T>(ctx: AsyncCtx, body: () => T): T;
  withLoweredLoop<T>(body: () => T): T;
  paramPrelude(fn: ts.SignatureDeclaration): string[];
  typeOf(n: ts.Node): string;
  tryPrefix(e: ts.Node): string;
  coerce(e: ts.Expression, target: string): string;
  expr(e: ts.Expression): string;
  exprStatement(e: ts.Expression): string;
  cond(e: ts.Expression): string;
  stmt(s: ts.Statement): string;
  declarationList(list: ts.VariableDeclarationList, lowered: boolean): string;
  declaration(d: ts.VariableDeclaration, constant: boolean, lowered: boolean): string;
  bindTo(name: ts.BindingName, value: string, type: string, mutable: boolean | 'assign'): string;
  iterable(e: ts.Expression): string;
  elementTypeOf(e: ts.Expression): string;
  /** `var name: type` for a value assigned later. */
  deferredDeclaration(name: string, type: string): string;
  isPromiseType(type: string): boolean;
  error(n: ts.Node | undefined, what: string): Error;
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
  private t: AsyncTranslator;

  constructor(t: AsyncTranslator) {
    this.t = t;
  }

  private get s(): AsyncSyntax { return this.t.syntax; }

  private thunk(): string { return this.s.fnType([], this.s.voidType); }

  /** The body (inside the braces) of an async function returning a promise of `result`. */
  body(fn: ts.FunctionLikeDeclaration, result: string): string[] {
    const t = this.t;
    const s = this.s;
    const cap = t.fresh('__async');
    const i = t.indent;
    const ctx: AsyncCtx = {
      cap, result, next: null, onError: s.asyncError(cap),
      ret: (v, isPromise) => s.asyncReturn(cap, v, isPromise, result),
    };
    const out = [`${i}${s.asyncStart(cap, result)}`];
    const inner = t.nested(() => {
      const prelude = t.paramPrelude(fn);
      if (fn.body && ts.isBlock(fn.body)) return [...prelude, ...this.list([...fn.body.statements], ctx)];
      const e = fn.body as ts.Expression;
      return [...prelude, ...this.linearize([e], ctx, () => [t.indent + this.retStatement(ctx, e)])];
    });
    const [open, close] = s.asyncBody(cap);
    out.push(`${i}${open}`, ...inner, `${i}${close}`, `${i}return ${cap}.promise`);
    return out;
  }

  private retStatement(ctx: AsyncCtx, e: ts.Expression | undefined): string {
    const t = this.t;
    if (!e) return ctx.ret(null, false);
    const isPromise = t.isPromiseType(t.typeOf(e));
    return t.tryPrefix(e) + ctx.ret(isPromise ? t.expr(e) : t.coerce(e, ctx.result), isPromise);
  }

  /** A statement list, its tail moved into a continuation at the first statement that awaits. */
  list(list: ts.Statement[], ctx: AsyncCtx): string[] {
    const t = this.t;
    const out: string[] = [];
    for (const [ix, fn] of hoistedFunctions(list)) { out.push(t.withAsync(ctx, () => t.stmt(fn))); list = list.filter((_, k) => k !== ix); }
    for (let k = 0; k < list.length; k++) {
      const s = list[k];
      if (!containsAwait(s)) {
        out.push(t.withAsync(ctx, () => t.stmt(s)));
        // A line after `return` would read as its operand: nothing may follow a jump.
        if (jumps(s)) return out;
        continue;
      }
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
        out.push(`${t.indent}${this.s.constant(name, this.thunk(), this.closure([], body, ctx.onError))}`);
        inner = { ...ctx, next: `${name}()` };
      }
      out.push(...this.statement(s, inner));
      return out;
    }
    out.push(t.indent + (ctx.next ?? ctx.ret(null, false)));
    return out;
  }

  /** A closure, errors in the body going to `onError`. */
  closure(params: [string, string][], body: string[], onError: string): string {
    return this.s.closure(params, body, onError, this.t.indent);
  }

  private statement(s: ts.Statement, ctx: AsyncCtx, then?: () => string[]): string[] {
    const t = this.t;
    const x = this.s;
    const i = t.indent;
    const next = then ?? (() => [t.indent + (ctx.next ?? ctx.ret(null, false))]);
    if (ts.isBlock(s)) return [`${i}${x.scopeOpen}`, ...t.nested(() => this.list([...s.statements], ctx)), `${i}}`];
    if (ts.isExpressionStatement(s)) return this.linearize([s.expression], ctx, () => [i + t.tryPrefix(s.expression) + t.exprStatement(s.expression), ...next()]);
    if (ts.isReturnStatement(s)) return this.linearize(s.expression ? [s.expression] : [], ctx, () => [i + this.retStatement(ctx, s.expression)]);
    if (ts.isThrowStatement(s)) return this.linearize([s.expression], ctx, () => [i + t.withAsync(ctx, () => t.stmt(s)).trim()]);
    if (ts.isVariableStatement(s)) return this.declarations([...s.declarationList.declarations], s, ctx, next);
    if (ts.isIfStatement(s)) {
      return this.linearize([s.expression], ctx, () => {
        const branch = (b: ts.Statement) => t.nested(() => this.list(ts.isBlock(b) ? [...b.statements] : [b], ctx));
        return [`${i}${x.ifOpen(t.tryPrefix(s.expression) + t.cond(s.expression))}`, ...branch(s.thenStatement), `${i}${x.elseOpen}`, ...(s.elseStatement ? branch(s.elseStatement) : t.nested(() => [t.indent + (ctx.next ?? ctx.ret(null, false))])), `${i}}`];
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
      return this.linearize([s.expression], ctx, () => [`${i}${x.makeIterator(it, `${t.tryPrefix(s.expression)}${t.iterable(s.expression)}`)}`, ...this.loop(ctx, { body: s.statement, iterator: it, binding: s.initializer as ts.VariableDeclarationList, of: s.expression })]);
    }
    if (ts.isTryStatement(s)) return this.tryStatement(s, ctx);
    if (ts.isLabeledStatement(s)) throw t.error(s, 'a labeled statement that awaits');
    if (ts.isSwitchStatement(s)) return this.switchStatement(s, ctx);
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
        lines.push(`${i}${this.s.constant(name, t.typeOf(h), `${t.tryPrefix(h)}${t.expr(h)}`)}`);
        t.subst.set(h, name);
      }
      if (!ts.isAwaitExpression(a)) return [...lines, ...this.conditional(a, ctx, () => step(k + 1))];
      const operand = a.expression;
      const isPromise = t.isPromiseType(t.typeOf(operand));
      const code = `${t.tryPrefix(operand)}${t.expr(operand)}`;
      const v = t.fresh('__t');
      const type = t.typeOf(a);
      t.subst.set(a, v);
      const body = t.nested(() => step(k + 1));
      lines.push(`${i}${this.s.awaitCall(code, isPromise, this.closure([[v, type]], body, ctx.onError), ctx.onError)}`);
      return lines;
    };
    return step(0);
  }

  /** `c ? await a : b`, `x && await y`: the operator as an if, both ways joining the rest of the work with the value. */
  private conditional(e: ts.Expression, ctx: AsyncCtx, rest: () => string[]): string[] {
    const t = this.t;
    const x = this.s;
    const i = t.indent;
    const type = t.typeOf(e);
    const value = t.fresh('__c');
    const join = t.fresh('__join');
    const lines = [`${i}${t.deferredDeclaration(value, type)}`];
    t.subst.set(e, value);
    lines.push(`${i}${x.constant(join, this.thunk(), this.closure([], t.nested(rest), ctx.onError))}`);
    const branch = (y: ts.Expression) => t.nested(() => this.linearize([y], ctx, () => [`${t.indent}${value} = ${t.tryPrefix(y)}${t.coerce(y, type)}`, `${t.indent}${join}()`]));
    if (ts.isConditionalExpression(e)) {
      lines.push(`${i}${x.ifOpen(t.tryPrefix(e.condition) + t.cond(e.condition))}`, ...branch(e.whenTrue), `${i}${x.elseOpen}`, ...branch(e.whenFalse), `${i}}`);
      return lines;
    }
    const b = e as ts.BinaryExpression;
    const left = t.fresh('__l');
    lines.push(`${i}${x.constant(left, t.typeOf(b.left), `${t.tryPrefix(b.left)}${t.expr(b.left)}`)}`);
    const K = ts.SyntaxKind;
    const test = b.operatorToken.kind === K.QuestionQuestionToken ? `jsIsNullish(${left})` : b.operatorToken.kind === K.AmpersandAmpersandToken ? `jsTruthy(${left})` : `!jsTruthy(${left})`;
    const keep = t.typeOf(b.left) === type || type === 'Any?' ? left : x.unwrap(left);
    lines.push(`${i}${x.ifOpen(test)}`, ...branch(b.right), `${i}${x.elseOpen}`, `${i}    ${value} = ${keep}`, `${i}    ${join}()`, `${i}}`);
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
    const x = this.s;
    const i = t.indent;
    const brk = t.fresh('__break');
    const cont = t.fresh('__continue');
    const first = t.fresh('__first');
    const out = [`${i}${x.constant(brk, this.thunk(), this.closure([], t.nested(() => [t.indent + (ctx.next ?? ctx.ret(null, false))]), ctx.onError))}`];
    if (o.condAfter) out.push(`${i}var ${first} = true`);
    const iteration = t.nested(() => {
      const j = t.indent;
      const lines: string[] = [];
      const again = o.step ? `${t.exprStatement(o.step)}; ${cont}()` : `${cont}()`;
      const inner: AsyncCtx = { ...ctx, next: again, brk: `${brk}()`, cont: again };
      if (o.iterator) {
        const decl = o.binding!.declarations[0];
        const item = t.fresh('__item');
        lines.push(...x.nextItem(item, o.iterator, `${brk}(); return`, j));
        lines.push(t.withAsync(inner, () => t.bindTo(decl.name, item, t.elementTypeOf(o.of!), !(o.binding!.flags & ts.NodeFlags.Const))));
        lines.push(...t.withLoweredLoop(() => this.list(ts.isBlock(o.body) ? [...o.body.statements] : [o.body], inner)));
        return lines;
      }
      const check = (rest: () => string[]) => (o.cond
        ? this.linearize([o.cond], ctx, () => [`${t.indent}${x.ifLine(`!(${t.tryPrefix(o.cond!)}${t.cond(o.cond!)})`, `${brk}(); return`)}`, ...rest()])
        : rest());
      const body = () => t.withLoweredLoop(() => this.list(ts.isBlock(o.body) ? [...o.body.statements] : [o.body], inner));
      if (o.condAfter) {
        if (containsAwait(o.cond!)) throw t.error(o.cond!, 'await in a do-while condition');
        lines.push(`${j}${x.ifLine(`!${first} && !(${t.tryPrefix(o.cond!)}${t.cond(o.cond!)})`, `${brk}(); return`)}`, `${j}${first} = false`);
        lines.push(...body());
        return lines;
      }
      return check(body);
    });
    out.push(`${i}${x.loopRun(this.closure([[cont, this.thunk()]], iteration, ctx.onError))}`);
    return out;
  }

  /**
   * A switch whose cases await: the matching clause is found first, then
   * each clause runs if execution started at or before it (fallthrough), and
   * `break` continues after the switch.
   */
  private switchStatement(s: ts.SwitchStatement, ctx: AsyncCtx): string[] {
    const t = this.t;
    const x = this.s;
    const clauses = s.caseBlock.clauses;
    for (const c of clauses) if (ts.isCaseClause(c) && containsAwait(c.expression)) throw t.error(c, 'await in a case label');
    return this.linearize([s.expression], ctx, () => {
      const i = t.indent;
      const subject = t.fresh('__switch');
      const start = t.fresh('__start');
      const after = ctx.next ?? ctx.ret(null, false);
      const st = t.typeOf(s.expression);
      const out = [`${i}${x.constant(subject, st, `${t.tryPrefix(s.expression)}${t.expr(s.expression)}`)}`, `${i}var ${start} = ${clauses.length}`];
      const tests = clauses.map((c, k) => (ts.isCaseClause(c) ? `${k === 0 ? '' : 'else '}${x.ifLine(st === 'Any?' || t.typeOf(c.expression) === 'Any?' ? `jsStrictEquals(${subject}, ${t.coerce(c.expression, 'Any?')})` : `${subject} == ${t.coerce(c.expression, st)}`, `${start} = ${k}`)}` : ''));
      const caseTests = tests.filter(Boolean).map((y, k) => (k === 0 ? y.replace(/^else /, '') : y));
      if (caseTests.length) out.push(`${i}${caseTests.join(' ')}`);
      const fallback = clauses.findIndex(ts.isDefaultClause);
      if (fallback >= 0) out.push(`${i}${x.ifLine(`${start} == ${clauses.length}`, `${start} = ${fallback}`)}`);
      const names = clauses.map(() => t.fresh('__clause'));
      out.push(`${i}${x.constant(`${names.at(-1)}_end`, this.thunk(), x.inline(after))}`);
      for (let k = clauses.length - 1; k >= 0; k--) {
        const next = k + 1 < clauses.length ? `${names[k + 1]}()` : `${names.at(-1)}_end()`;
        const inner: AsyncCtx = { ...ctx, next, brk: after };
        const body = t.nested(() => [`${t.indent}${x.ifLine(`${start} > ${k}`, `${next}; return`)}`, ...t.withLoweredLoop(() => this.list([...clauses[k].statements], inner))]);
        out.push(`${i}${x.constant(names[k], this.thunk(), this.closure([], body, ctx.onError))}`);
      }
      out.push(`${i}${names[0]}()`);
      return out;
    });
  }

  private tryStatement(s: ts.TryStatement, ctx: AsyncCtx): string[] {
    const t = this.t;
    const x = this.s;
    const i = t.indent;
    const out: string[] = [];
    const thunk = this.thunk();
    let region = ctx;
    if (s.finallyBlock) {
      const fin = t.fresh('__finally');
      const resume = t.fresh('__resume');
      const body = t.nested(() => this.list([...s.finallyBlock!.statements], { ...ctx, next: `${resume}()` }));
      out.push(`${i}${x.constant(fin, x.fnType([thunk], x.voidType), this.closure([[resume, thunk]], body, ctx.onError))}`);
      const through = (stmt: string) => `${fin}(${x.inline(stmt)})`;
      const err = t.fresh('__error');
      out.push(`${i}${x.constant(err, x.fnType(['Any?'], x.voidType), x.inline(`${fin}(${x.inline(`${ctx.onError}(e)`)})`, ['e', 'Any?']))}`);
      region = {
        ...ctx, onError: err,
        next: through(ctx.next ?? ctx.ret(null, false)),
        ret: (v, p) => (v === null ? through(ctx.ret(null, false)) : `${x.scopeOpen} ${x.constant('__value', null, v)}; ${through(ctx.ret('__value', p))} }`),
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
      out.push(`${i}${x.constant(name, x.fnType(['Any?'], x.voidType), this.closure([[caught, 'Any?']], body, region.onError))}`);
      tryCtx = { ...region, onError: name };
    }
    const body = t.nested(() => this.list([...s.tryBlock.statements], tryCtx));
    out.push(...x.tryBlock(body, tryCtx.onError, i));
    return out;
  }
}

/** A statement that never completes normally (a return, throw, break or continue). */
function jumps(s: ts.Statement): boolean {
  return ts.isReturnStatement(s) || ts.isThrowStatement(s) || ts.isBreakStatement(s) || ts.isContinueStatement(s);
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
