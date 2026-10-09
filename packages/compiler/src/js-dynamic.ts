import ts from 'typescript';
import { AsyncLowering, containsAwait, type AsyncCtx, type AsyncTranslator } from './async.ts';
import { SWIFT_SYNTAX, swiftString } from './swift.ts';
import type { SourceLines } from './source-lines.ts';
import { boundNames, hasUseStrict, type JsExport, type JsGraph, type JsModule } from './js-modules.ts';

/**
 * Untyped JavaScript (an npm package's published code) as Swift over the
 * runtime's dynamic values: every value is `Any?`, every operation a runtime
 * call with JavaScript's semantics (Runtime/Script.swift). Functions are
 * function objects taking `this` and their arguments; `var` and function
 * declarations are hoisted to the top of their function, `let`, `const` and
 * `class` to the top of their block, each binding a Swift variable of its own.
 * An ES module's top-level bindings are Swift globals, which its importers
 * read directly; a CommonJS module is a function its first `require` runs.
 */

interface Binding {
  swift: string;
  /** An ES module's import: what it reads. */
  imported?: JsExport;
  /** A binding the emitter declares for itself (`arguments`): not in the declaration lists. */
  implicit?: boolean;
}

interface FnInfo {
  arrow: boolean;
  strict: boolean;
  /** The Swift names of the receiver and the argument list, as the closure declares them. */
  thisName: string;
  argsName: string;
  usesThis: boolean;
  usesArguments: boolean;
  argumentsName: string;
  /** In a class's methods: the class's Swift variable and whether the method is static, for `super`. */
  classVar?: string;
  isStatic?: boolean;
  /** A constructor: new.target's Swift name, and whether `super(...)` makes `this`. */
  newTarget?: string;
  derived?: boolean;
  isConstructor?: boolean;
  /** The object literal a method belongs to, for `super` in it. */
  homeVar?: string;
}

class Scope {
  readonly vars = new Map<string, Binding>();
  readonly parent: Scope | null;
  readonly fn: FnInfo;
  constructor(parent: Scope | null, fn: FnInfo) {
    this.parent = parent;
    this.fn = fn;
  }
  lookup(name: string): Binding | null {
    for (let s: Scope | null = this; s; s = s.parent) {
      const b = s.vars.get(name);
      if (b) return b;
    }
    return null;
  }
}

/** A jump out of a `try` whose `finally` must run first: what the jump does once the finally has. */
interface FinallyRegion {
  label: string;
  jump: string;
  value: string;
  jumps: { code: string; target: ts.Node | null }[];
  loops: Set<ts.Node>;
}

export class JsEmitter implements AsyncTranslator {
  indent = '';
  readonly subst = new Map<ts.Node, string>();
  readonly syntax = SWIFT_SYNTAX;
  readonly checker = { getSymbolAtLocation: () => undefined } as unknown as ts.TypeChecker;
  private readonly lowering = new AsyncLowering(this);
  private tmp = 0;
  private scope!: Scope;
  private module!: JsModule;
  private asyncCtx: AsyncCtx | null = null;
  private plainLoops = 0;
  private finallies: FinallyRegion[] = [];
  /** The loops and labeled statements a `break`/`continue` may target, innermost last. */
  private targets: { node: ts.Node; label: string | null; loop: boolean; swift: string }[] = [];
  /** Module records (and their ES bindings) the module reads; each read evaluates nothing, the module's init runs them first. */
  readonly errors: string[] = [];

  readonly graph: JsGraph;
  lines: SourceLines | null;

  constructor(graph: JsGraph, lines: SourceLines | null) {
    this.graph = graph;
    this.lines = lines;
  }

  fresh(prefix: string): string { return `${prefix}${this.tmp++}`; }

  /**
   * Local functions the current statement declares before it: every function value is a Swift
   * local function, whose body Swift type-checks on its own, not as part of an expression.
   */
  private pending: string[][] = [];

  private withPending(body: () => string): string {
    this.pending.push([]);
    let code: string, funcs: string[];
    try { code = body(); } finally { funcs = this.pending.pop()!; }
    return funcs.length ? [...funcs, code].filter(Boolean).join('\n') : code;
  }

  private declareLocal(code: string) {
    this.pending.at(-1)!.push(code);
  }

  nested<T>(body: () => T): T {
    const saved = this.indent;
    this.indent += '    ';
    try { return body(); } finally { this.indent = saved; }
  }

  withAsync<T>(ctx: AsyncCtx, body: () => T): T {
    const saved = [this.asyncCtx, this.plainLoops] as const;
    this.asyncCtx = ctx;
    this.plainLoops = 0;
    try { return body(); } finally { [this.asyncCtx, this.plainLoops] = saved; }
  }

  withLoweredLoop<T>(body: () => T): T {
    const saved = this.plainLoops;
    this.plainLoops = 0;
    try { return body(); } finally { this.plainLoops = saved; }
  }

  error(n: ts.Node | undefined, what: string): Error {
    const sf = n?.getSourceFile();
    const at = sf && n ? `${sf.fileName}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}: ` : '';
    return new Error(`${at}${what} is not supported in compiled JavaScript yet`);
  }

  // ---- AsyncTranslator: every value is untyped

  typeOf(): string { return 'Any?'; }
  isAny(): boolean { return true; }
  tryPrefix(): string { return 'try '; }
  coerce(e: ts.Expression): string { return this.expr(e); }
  elementTypeOf(): string { return 'Any?'; }
  fromAnyCode(code: string): string { return code; }
  resumedValue(code: string): string { return code; }
  deferredDeclaration(name: string): string { return `var ${name}: Any? = nil`; }
  isPromiseType(): boolean { return false; }
  iterable(e: ts.Expression): string { return `jsItemsOf(${this.expr(e)})`; }
  jsIteration(e: ts.Expression): string { return `jsForOfIterator(${this.expr(e)})`; }
  asyncIteration(e: ts.Expression): string { return `jsAsyncIteratorOf(${this.expr(e)})`; }
  delegateIteration(e: ts.Expression, isAsync: boolean): string { return isAsync ? `try jsAsyncIteratorOf(${this.expr(e)})` : `try jsIteratorOf(${this.expr(e)})`; }
  paramPrelude(): string[] { return []; }
  exprStatement(e: ts.Expression): string { return this.statementExpr(e); }
  declarationList(list: ts.VariableDeclarationList): string { return list.declarations.map((d) => this.declaration(d)).filter(Boolean).join('\n'); }
  declaration(d: ts.VariableDeclaration): string {
    if (!d.initializer) {
      // `let x;` in a loop body is undefined again each time round.
      return list(d) !== 'var' && ts.isIdentifier(d.name) ? `${this.indent}${this.binding(d.name).swift} = nil` : '';
    }
    return this.assignPattern(d.name, this.expr(d.initializer), d.initializer).map((l) => this.indent + l).join('\n');
  }
  bindTo(name: ts.BindingName, value: string): string {
    return this.assignPattern(name, value).map((l) => this.indent + l).join('\n');
  }

  // ---- Modules

  /** A module as one Swift file's text: its record, and for an ES module its top-level bindings. */
  emitModule(m: JsModule): string {
    this.module = m;
    const out: string[] = [];
    const fn: FnInfo = { arrow: false, strict: m.strict, thisName: '__this', argsName: '__args', usesThis: false, usesArguments: false, argumentsName: '' };
    this.scope = new Scope(null, fn);
    const statements = [...m.sf.statements];
    const esm = m.kind === 'esm';
    // Top-level bindings: an ES module's are globals; a CommonJS module's are its function's locals.
    const names = this.declareHoisted(statements, true, (n) => (esm ? `${m.name}_${safe(n)}` : this.local(n)));
    if (esm) {
      for (const st of statements) if (ts.isImportDeclaration(st)) this.declareImport(st);
      // `export default <expression>` holds its value in a binding of its own.
      if (statements.some((s) => ts.isExportAssignment(s) || ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && !s.name && hasDefault(s)))) this.scope.vars.set('*default*', { swift: `${m.name}_default` });
    }
    this.pending = [[]];
    const body = this.nested(() => {
      const lines: string[] = [];
      if (!esm) {
        lines.push(`${this.indent}let module: Any? = __m.module`, `${this.indent}var exports: Any? = __m.exports`, `${this.indent}let __this: Any? = exports`);
        this.scope.vars.set('module', { swift: 'module', implicit: true });
        this.scope.vars.set('exports', { swift: 'exports', implicit: true });
        lines.push(...names.map((n) => `${this.indent}var ${n}: Any? = nil`));
      } else {
        lines.push(`${this.indent}let __this: Any? = nil`);
        for (const dep of this.evaluatedFirst(m)) lines.push(`${this.indent}try ${dep}.evaluate()`);
      }
      lines.push(...this.hoistedFunctions(statements));
      for (const st of statements) {
        const code = this.withPending(() => this.moduleStatement(st));
        if (code) lines.push(code);
      }
      return [...this.pending.pop()!, ...lines];
    });
    if (esm) {
      for (const n of names) out.push(`nonisolated(unsafe) var ${n}: Any? = nil`);
      if (this.scope.vars.has('*default*')) out.push(`nonisolated(unsafe) var ${m.name}_default: Any? = nil`);
      const exports = this.graph.exportNames(m).sort().flatMap((n) => {
        const t = this.graph.resolveExport(m, n);
        // A barrel's export whose module the app does not reach is not part of the program.
        if (t && t.kind !== 'unresolved' && t.module !== m && !this.graph.isNeeded(t.module)) return [];
        return [`(${swiftString(n)}, { ${this.selfRef(this.exportRead(t, n), m)} })`];
      });
      out.push(`private func ${m.name}_exports(_ __m: JSScriptModule) -> [(String, () -> Any?)] {`, `    [${exports.join(', ')}]`, '}');
      out.push(`private func ${m.name}_body(_ __m: JSScriptModule) throws {`, ...body, '}');
      out.push(`let ${m.name}: JSScriptModule = JSScriptModule(${swiftString(this.moduleId(m))}, esm: true, exports: ${m.name}_exports, ${m.name}_body)`);
    } else {
      out.push(`private func ${m.name}_body(_ __m: JSScriptModule) throws {`, ...body, '}');
      out.push(`let ${m.name}: JSScriptModule = JSScriptModule(${swiftString(this.moduleId(m))}, esm: false, ${m.name}_body)`);
    }
    return out.join('\n') + '\n';
  }

  /** A module's own record inside its initializer, where Swift cannot name the global being initialized. */
  private selfRef(code: string, m: JsModule): string {
    return code.replace(new RegExp(`\\b${m.name}\\b`, 'g'), '__m');
  }

  private moduleId(m: JsModule): string {
    const at = m.file.lastIndexOf('/node_modules/');
    return at >= 0 ? m.file.slice(at + '/node_modules/'.length) : m.file;
  }

  /** The modules an ES module's own evaluation runs first, in import order: through barrels, the modules defining what it imports. */
  private evaluatedFirst(m: JsModule): string[] {
    const out: string[] = [];
    const add = (x: JsModule) => { if (x !== m && !out.includes(x.name) && this.graph.isNeeded(x)) out.push(x.name); };
    for (const st of m.sf.statements) {
      if (!(ts.isImportDeclaration(st) || (ts.isExportDeclaration(st) && st.moduleSpecifier))) continue;
      const dep = m.deps.get((st.moduleSpecifier as ts.StringLiteral).text);
      if (!dep) continue;
      if ('error' in dep) throw new Error(dep.error);
      if (!('module' in dep)) continue;
      for (const name of this.evaluationTargets(dep.module, st)) if (name !== m.name && !out.includes(name)) out.push(name);
    }
    void add;
    return out;
  }

  /** The module records importing `dep` evaluates: through a barrel the program does not otherwise reach, the modules defining what the import reads. */
  evaluationTargets(dep: JsModule, st: ts.ImportDeclaration | ts.ExportDeclaration): string[] {
    if (dep.kind === 'esm' && dep.barrel && !this.graph.isNeeded(dep)) {
      return [...new Set(this.targetsThrough(st, dep).filter((t) => this.graph.isNeeded(t)).map((t) => t.name))];
    }
    return this.graph.isNeeded(dep) ? [dep.name] : [];
  }

  /** What reading an export gives the app's typed code: a module's global, or a CommonJS module's exports, never throwing. */
  bindingRead(t: JsExport): string {
    if (t.kind === 'unresolved') throw new Error(`${this.moduleId(t.module)} does not export '${t.name}'`);
    return this.exportRead(t, '');
  }

  /** The modules defining what an import or re-export reads through a barrel. */
  private targetsThrough(st: ts.ImportDeclaration | ts.ExportDeclaration, barrel: JsModule): JsModule[] {
    const names: string[] = [];
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      if (c?.name) names.push('default');
      if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) for (const el of c.namedBindings.elements) names.push((el.propertyName ?? el.name).text);
      if (c?.namedBindings && ts.isNamespaceImport(c.namedBindings)) names.push(...this.graph.exportNames(barrel));
    } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) names.push((el.propertyName ?? el.name).text);
    } else names.push(...this.graph.exportNames(barrel));
    return names.map((n) => this.graph.resolveExport(barrel, n)).filter((t): t is JsExport => !!t && t.kind !== 'unresolved').map((t) => t.module);
  }

  private declareImport(st: ts.ImportDeclaration) {
    const dep = this.module.deps.get((st.moduleSpecifier as ts.StringLiteral).text)!;
    const c = st.importClause;
    if (!c) return;
    const target = (name: string): JsExport => {
      if (!('module' in dep)) return { kind: 'unresolved', module: this.module, name: 'error' in dep ? `\u0000${dep.error}` : name };
      if (name === '*') return { kind: 'namespace', module: dep.module };
      if (dep.module.kind !== 'esm') return name === 'default' ? { kind: 'cjs-default', module: dep.module } : { kind: 'cjs', module: dep.module, key: name };
      return this.graph.resolveExport(dep.module, name) ?? { kind: 'unresolved', module: dep.module, name };
    };
    if (c.name) this.scope.vars.set(c.name.text, { swift: '', imported: target('default') });
    if (c.namedBindings && ts.isNamespaceImport(c.namedBindings)) this.scope.vars.set(c.namedBindings.name.text, { swift: '', imported: target('*') });
    if (c.namedBindings && ts.isNamedImports(c.namedBindings)) for (const el of c.namedBindings.elements) this.scope.vars.set(el.name.text, { swift: '', imported: target((el.propertyName ?? el.name).text) });
  }

  /** What reading an export gives, as Swift: the defining module's global, or a CommonJS module's exports. */
  exportRead(t: JsExport | null, name: string): string {
    if (!t) return 'nil';
    switch (t.kind) {
      case 'local': return t.local === '*default*' ? `${t.module.name}_default` : `${t.module.name}_${safe(t.local)}`;
      case 'cjs': return `(try? jsGet(${t.module.name}.exports, ${swiftString(t.key)})) ?? nil`;
      case 'cjs-default': return `${t.module.name}.interopDefault`;
      case 'namespace': return `${t.module.name}.namespace`;
      case 'unresolved': return 'nil';
    }
    void name;
  }

  /** An import binding read in an expression. */
  private importRead(t: JsExport): string {
    switch (t.kind) {
      case 'cjs': return `jsGet(${t.module.name}.exports, ${swiftString(t.key)})`;
      case 'unresolved':
        if (t.name.startsWith('\u0000')) return `jsThrowing(${swiftString(t.name.slice(1))})`;
        return `jsThrowing(${swiftString(`${this.moduleId(t.module)} does not export '${t.name}'`)})`;
      default: return this.exportRead(t, '');
    }
  }

  private moduleStatement(st: ts.Statement): string {
    if (ts.isImportDeclaration(st)) return '';
    if (ts.isExportDeclaration(st)) return '';
    if (ts.isExportAssignment(st)) return `${this.mark(st)}${this.indent}${this.module.name}_default = try ${this.expr(st.expression)}`;
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && !st.name && hasDefault(st)) {
      return `${this.mark(st)}${this.indent}${this.module.name}_default = try ${ts.isFunctionDeclaration(st) ? this.functionValue(st, 'default') : this.classValue(st, 'default')}`;
    }
    return this.stmt(st);
  }

  private mark(st: ts.Node): string {
    return this.lines ? this.lines.mark(st) : '';
  }

  // ---- Declarations and scopes

  private local(name: string): string { return `${safe(name)}_${this.tmp++}`; }

  /**
   * Declares the bindings a function (or module) body hoists: `var`s anywhere in it outside nested
   * functions, its top-level function declarations, and its top-level `let`/`const`/`class`.
   * The Swift names, for the declarations the caller writes.
   */
  private declareHoisted(statements: ts.Statement[], functionTop: boolean, name: (n: string) => string): string[] {
    const out: string[] = [];
    const add = (n: string) => {
      if (this.scope.vars.has(n)) return;
      const swift = name(n);
      this.scope.vars.set(n, { swift });
      out.push(swift);
    };
    if (functionTop) for (const n of varNames(statements)) add(n);
    for (const st of statements) {
      if (ts.isFunctionDeclaration(st) && st.name) add(st.name.text);
      else if (ts.isClassDeclaration(st) && st.name) add(st.name.text);
      else if (ts.isVariableStatement(st) && list(st.declarationList.declarations[0]) !== 'var') for (const d of st.declarationList.declarations) for (const n of boundNames(d.name)) add(n);
    }
    return out;
  }

  /** A block's lexical declarations, declared in a new scope: their Swift declarations. */
  private blockScope<T>(statements: ts.Statement[], body: (decls: string[]) => T): T {
    const outer = this.scope;
    this.scope = new Scope(outer, outer.fn);
    try {
      const names = this.declareHoisted(statements, false, (n) => this.local(n));
      return body(names.map((n) => `${this.indent}var ${n}: Any? = nil`));
    } finally { this.scope = outer; }
  }

  /** Function declarations in a statement list, assigned first: JavaScript hoists them to the top. */
  private hoistedFunctions(statements: ts.Statement[]): string[] {
    const out: string[] = [];
    for (const st of statements) {
      if (!ts.isFunctionDeclaration(st) || !st.name || !st.body) continue;
      out.push(this.withPending(() => `${this.mark(st)}${this.indent}${this.binding(st.name).swift} = ${this.functionValue(st, st.name.text)}`));
    }
    return out;
  }

  private binding(id: ts.Identifier): Binding {
    const b = this.scope.lookup(id.text);
    if (!b) throw this.error(id, `the undeclared binding '${id.text}'`);
    return b;
  }

  // ---- Statements

  statements(list: ts.Statement[]): string[] {
    const out: string[] = [];
    for (const s of list) {
      const code = this.stmt(s);
      if (code) out.push(code);
    }
    return out;
  }

  stmt(s: ts.Statement): string {
    return this.withPending(() => {
      const code = this.statementCode(s);
      if (!code || !this.lines || ts.isBlock(s)) return code;
      return this.mark(s) + code;
    });
  }

  cond(e: ts.Expression): string {
    e = skipParens(e);
    const K = ts.SyntaxKind;
    if (ts.isPrefixUnaryExpression(e) && e.operator === K.ExclamationToken) return `!(${this.cond(e.operand)})`;
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === K.AmpersandAmpersandToken) return `(${this.cond(e.left)} && ${this.cond(e.right)})`;
      if (op === K.BarBarToken) return `(${this.cond(e.left)} || ${this.cond(e.right)})`;
      const compare = this.comparison(e);
      if (compare) return compare;
    }
    if (e.kind === K.TrueKeyword) return 'true';
    if (e.kind === K.FalseKeyword) return 'false';
    return `jsIsTruthy(${this.expr(e)})`;
  }

  /** A comparison as a Swift `Bool`, or null for another operator. */
  private comparison(e: ts.BinaryExpression): string | null {
    const K = ts.SyntaxKind;
    const op = e.operatorToken.kind;
    const l = () => this.expr(e.left), r = () => this.expr(e.right);
    // `typeof x === 'string'`: the type's name compared as a string.
    const typeofCompare = (eq: boolean) => {
      const [t, lit] = ts.isTypeOfExpression(skipParens(e.left)) && ts.isStringLiteral(skipParens(e.right)) ? [skipParens(e.left) as ts.TypeOfExpression, skipParens(e.right) as ts.StringLiteral]
        : ts.isTypeOfExpression(skipParens(e.right)) && ts.isStringLiteral(skipParens(e.left)) ? [skipParens(e.right) as ts.TypeOfExpression, skipParens(e.left) as ts.StringLiteral] : [null, null];
      if (!t || !lit) return null;
      return `(${this.typeofCode(t)} ${eq ? '==' : '!='} ${swiftString(lit.text)})`;
    };
    switch (op) {
      case K.EqualsEqualsEqualsToken: return typeofCompare(true) ?? `jsStrictEquals(${l()}, ${r()})`;
      case K.ExclamationEqualsEqualsToken: return typeofCompare(false) ?? `!jsStrictEquals(${l()}, ${r()})`;
      case K.EqualsEqualsToken: return typeofCompare(true) ?? `jsLooseEquals(${l()}, ${r()})`;
      case K.ExclamationEqualsToken: return typeofCompare(false) ?? `!jsLooseEquals(${l()}, ${r()})`;
      case K.LessThanToken: return `jsLT(${l()}, ${r()})`;
      case K.GreaterThanToken: return `jsGT(${l()}, ${r()})`;
      case K.LessThanEqualsToken: return `jsLE(${l()}, ${r()})`;
      case K.GreaterThanEqualsToken: return `jsGE(${l()}, ${r()})`;
      case K.InstanceOfKeyword: return `jsInstanceOf(${l()}, ${r()})`;
      case K.InKeyword: return `jsHasProperty(${ts.isPrivateIdentifier(e.left) ? swiftString(this.privateKey(e.left)) : l()}, ${r()})`;
      default: return null;
    }
  }

  private statementCode(s: ts.Statement): string {
    const i = this.indent;
    const K = ts.SyntaxKind;
    if (ts.isEmptyStatement(s)) return '';
    if (ts.isFunctionDeclaration(s)) {
      // Hoisted: assigned where its block begins. A declaration without a body declares nothing.
      return '';
    }
    if (ts.isClassDeclaration(s)) return `${i}${this.binding(s.name!).swift} = try ${this.classValue(s, s.name!.text)}`;
    if (ts.isVariableStatement(s)) return this.declarationList(s.declarationList);
    if (ts.isExpressionStatement(s)) {
      if (ts.isStringLiteral(s.expression) && s.parent && (ts.isSourceFile(s.parent) || ts.isBlock(s.parent)) && isDirective(s)) return '';
      return `${i}${this.statementExpr(s.expression)}`;
    }
    if (ts.isReturnStatement(s)) return this.returnStatement(s);
    if (ts.isIfStatement(s)) {
      const then = this.blockOf(s.thenStatement);
      if (!s.elseStatement) return `${i}if try ${this.cond(s.expression)} ${then}`;
      if (ts.isIfStatement(s.elseStatement)) return `${i}if try ${this.cond(s.expression)} ${then} else {\n${this.nested(() => this.stmt(s.elseStatement!))}\n${i}}`;
      return `${i}if try ${this.cond(s.expression)} ${then} else ${this.blockOf(s.elseStatement)}`;
    }
    if (ts.isBlock(s)) return this.blockScope([...s.statements], (decls) => {
      const body = this.nested(() => [...decls.map((d) => '    ' + d.trimStart()).map((d) => this.indent + d.trimStart()), ...this.hoistedFunctions([...s.statements]), ...this.statements([...s.statements])]);
      return `${i}do {\n${body.join('\n')}\n${i}}`;
    });
    if (ts.isThrowStatement(s)) return `${i}throw jsThrow(try ${this.expr(s.expression)})`;
    if (ts.isTryStatement(s)) return this.tryStatement(s);
    if (ts.isWhileStatement(s)) return this.loop(s, (label) => `${i}${label}while try ${this.cond(s.expression)} ${this.loopBody(s.statement)}`);
    if (ts.isDoStatement(s)) return this.loop(s, (label) => `${i}${label}repeat ${this.loopBody(s.statement)} while try ${this.cond(s.expression)}`);
    if (ts.isForStatement(s)) return this.forStatement(s);
    if (ts.isForInStatement(s) || ts.isForOfStatement(s)) return this.forEach(s);
    if (ts.isSwitchStatement(s)) return this.switchStatement(s);
    if (ts.isLabeledStatement(s)) {
      if (ts.isIterationStatement(s.statement, false)) return this.stmt(s.statement);
      const label = `L_${safe(s.label.text)}_${this.tmp++}`;
      for (const f of this.finallies) f.loops.add(s);
      this.targets.push({ node: s, label: s.label.text, loop: false, swift: label });
      try { return `${i}${label}: do ${this.blockOf(s.statement)}`; } finally { this.targets.pop(); }
    }
    if (s.kind === K.BreakStatement || s.kind === K.ContinueStatement) return this.jump(s as ts.BreakOrContinueStatement);
    if (ts.isDebuggerStatement(s)) return '';
    if (ts.isWithStatement(s)) throw this.error(s, 'a with statement');
    throw this.error(s, `the statement ${ts.SyntaxKind[s.kind]}`);
  }

  /** A statement as a braced Swift block, its lexical declarations in its own scope. */
  private blockOf(s: ts.Statement): string {
    const i = this.indent;
    const list = ts.isBlock(s) ? [...s.statements] : [s];
    return this.blockScope(list, (decls) => {
      const body = this.nested(() => [...decls.map((d) => this.indent + d.trimStart()), ...this.hoistedFunctions(list), ...this.statements(list)]);
      return body.length ? `{\n${body.join('\n')}\n${i}}` : '{}';
    });
  }

  private loopBody(s: ts.Statement): string {
    this.plainLoops++;
    try { return this.blockOf(s); } finally { this.plainLoops--; }
  }

  /** A loop, with the Swift label a `break`/`continue` naming it (or crossing a switch) uses. */
  private loop(s: ts.IterationStatement, emit: (label: string) => string): string {
    const label = this.labelOf(s);
    for (const f of this.finallies) f.loops.add(s);
    this.targets.push({ node: s, label: ts.isLabeledStatement(s.parent) ? s.parent.label.text : null, loop: true, swift: label });
    try { return emit(`${label}: `); } finally { this.targets.pop(); }
  }

  private labelOf(s: ts.Node): string {
    return ts.isLabeledStatement(s.parent) ? `L_${safe(s.parent.label.text)}_${this.tmp++}` : this.fresh('L');
  }

  private jump(s: ts.BreakOrContinueStatement): string {
    const i = this.indent;
    const isBreak = s.kind === ts.SyntaxKind.BreakStatement;
    const a = this.asyncCtx;
    if (a && !this.plainLoops && (isBreak ? a.brk : a.cont) && !s.label) return `${i}${isBreak ? a.brk : a.cont}\n${i}return`;
    let target = null;
    for (let k = this.targets.length - 1; k >= 0; k--) {
      const t = this.targets[k];
      if (s.label ? t.label === s.label.text : isBreak ? t.loop || ts.isSwitchStatement(t.node) : t.loop) { target = t; break; }
    }
    if (!target) throw this.error(s, 'a break or continue with no target');
    const code = `${isBreak ? 'break' : 'continue'} ${target.swift}`;
    // Out of a try whose finally must run first.
    return `${i}${this.jumpThrough(code, target.node, this.finallies.length)}`;
  }

  private returnStatement(s: ts.ReturnStatement): string {
    const i = this.indent;
    const a = this.asyncCtx;
    const fn = this.scope.fn;
    if (a) {
      if (!s.expression) return `${i}${a.ret(null, false)}\n${i}return`;
      if (a.generator === 'async') return `${i}${this.lowering.returnIn(a, s.expression)}\n${i}return`;
      return `${i}try ${a.ret(this.expr(s.expression), false)}\n${i}return`;
    }
    let value = s.expression ? `try ${this.expr(s.expression)}` : 'nil';
    if (fn.isConstructor) value = s.expression ? `jsConstructorResult(${value}, ${fn.thisName})` : fn.thisName;
    const region = this.finallies.at(-1);
    if (region) {
      region.jumps.push({ code: 'return', target: null });
      return `${i}${region.value} = ${value}; ${region.jump} = ${region.jumps.length}; break ${region.label}`;
    }
    return `${i}return ${value}`;
  }

  /** A break or continue to `target`, through the finally blocks (of the first `depth` regions) it leaves, innermost first. */
  private jumpThrough(code: string, target: ts.Node, depth: number): string {
    for (let k = depth - 1; k >= 0; k--) {
      const f = this.finallies[k];
      if (f.loops.has(target)) break;
      f.jumps.push({ code, target });
      return `${f.jump} = ${f.jumps.length}; break ${f.label}`;
    }
    return code;
  }

  private tryStatement(s: ts.TryStatement): string {
    const i = this.indent;
    const catchPart = () => {
      if (!s.catchClause) return '';
      const binding = s.catchClause.variableDeclaration;
      return this.blockScope([], () => {
        let bind = '';
        if (binding) {
          for (const n of boundNames(binding.name)) this.scope.vars.set(n, { swift: this.local(n) });
          bind = this.nested(() => [...boundNames(binding.name).map((n) => `${this.indent}var ${this.scope.vars.get(n)!.swift}: Any? = nil`), ...this.assignPattern(binding.name, 'jsCaught(error)').map((l) => this.indent + l)].join('\n')) + '\n';
        }
        const body = this.blockOf(s.catchClause!.block);
        return body === '{}' ? ` catch {\n${bind}${this.indent}}` : ` catch {\n${bind}${body.slice(2)}`;
      });
    };
    if (!s.finallyBlock) {
      if (!s.catchClause) return `${i}do ${this.blockOf(s.tryBlock)}`;
      const tryBlock = this.blockOf(s.tryBlock);
      return `${i}do ${tryBlock}${catchPart()}`;
    }
    // A finally runs on every way out: an error, a return or a jump is recorded, the finally runs, then it resumes.
    const region: FinallyRegion = { label: this.fresh('__try'), jump: this.fresh('__jump'), value: this.fresh('__value'), jumps: [], loops: new Set() };
    this.finallies.push(region);
    let inner: string;
    try {
      inner = this.nested(() => this.nested(() => {
        const tryBlock = this.blockOf(s.tryBlock);
        return `${this.indent}do ${tryBlock}${catchPart()}`;
      }));
    } finally { this.finallies.pop(); }
    const fin = this.nested(() => this.blockOf(s.finallyBlock!));
    const resume = region.jumps.map((j, k) => {
      if (j.code !== 'return') return `${i}    if ${region.jump} == ${k + 1} { ${this.jumpThrough(j.code, j.target!, this.finallies.length)} }`;
      const outer = this.finallies.at(-1);
      if (outer) { outer.jumps.push({ code: 'return', target: null }); return `${i}    if ${region.jump} == ${k + 1} { ${outer.value} = ${region.value}; ${outer.jump} = ${outer.jumps.length}; break ${outer.label} }`; }
      if (this.asyncCtx) return `${i}    if ${region.jump} == ${k + 1} { return }`;
      return `${i}    if ${region.jump} == ${k + 1} { return ${region.value} }`;
    });
    return [
      `${i}do {`,
      `${i}    var __error: Error? = nil`,
      `${i}    var ${region.jump} = 0`,
      `${i}    var ${region.value}: Any? = nil`,
      `${i}    _ = ${region.value}`,
      `${i}    ${region.label}: do {`,
      inner,
      `${i}    } catch {`,
      `${i}        __error = error`,
      `${i}    }`,
      `${i}    do ${fin.trimStart()}`,
      `${i}    if let __error { throw __error }`,
      ...resume,
      `${i}}`,
    ].join('\n');
  }

  private forStatement(s: ts.ForStatement): string {
    const i = this.indent;
    const init = s.initializer;
    const lexical = init && ts.isVariableDeclarationList(init) && !!(init.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const));
    return this.blockScope(lexical ? [ts.factory.createVariableStatement(undefined, init as ts.VariableDeclarationList)] : [], (decls) => {
      const head: string[] = decls.map((d) => i + d.trimStart());
      if (init) head.push(ts.isVariableDeclarationList(init) ? this.declarationList(init) : `${i}${this.statementExpr(init)}`);
      const first = this.fresh('__first');
      // A closure in the body captures the iteration's own copy of each `let` the head declares.
      const perIteration = lexical && capturesIn(s.statement);
      const names = lexical ? (init as ts.VariableDeclarationList).declarations.flatMap((d) => boundNames(d.name)) : [];
      const update = s.incrementor ? this.statementExpr(s.incrementor) : '';
      return this.loop(s, (label) => {
        let body: string;
        if (perIteration) {
          const outer = names.map((n) => this.scope.lookup(n)!.swift);
          const copies = names.map((n) => this.local(n));
          const saved = names.map((n) => this.scope.vars.get(n)!);
          names.forEach((n, k) => this.scope.vars.set(n, { swift: copies[k] }));
          try {
            const inner = this.nested(() => [
              ...copies.map((c, k) => `${this.indent}var ${c}: Any? = ${outer[k]}`),
              `${this.indent}defer { ${copies.map((c, k) => `${outer[k]} = ${c}`).join('; ')} }`,
              ...(s.incrementor ? [`${this.indent}if !${first} { ${this.statementExpr(s.incrementor)} }`] : []),
              `${this.indent}${first} = false`,
              ...(s.condition ? [`${this.indent}if !(try ${this.cond(s.condition)}) { break }`] : []),
              this.loopBody(s.statement).replace(/^\{\n?/, '').replace(/\n?\s*\}$/, ''),
            ]);
            body = `{\n${inner.join('\n')}\n${i}}`;
          } finally { names.forEach((n, k) => this.scope.vars.set(n, saved[k])); }
        } else {
          const inner = this.nested(() => [
            ...(s.incrementor ? [`${this.indent}if !${first} { ${update} }`] : []),
            `${this.indent}${first} = false`,
            ...(s.condition ? [`${this.indent}if !(try ${this.cond(s.condition)}) { break }`] : []),
            this.loopBody(s.statement).replace(/^\{\n?/, '').replace(/\n?\s*\}$/, ''),
          ]);
          body = `{\n${inner.join('\n')}\n${i}}`;
        }
        return [`${i}do {`, ...this.nested(() => [...head.map((h) => '    ' + h), `${i}    var ${first} = true`, `${i}    ${label}while true ${body.replace(/\n/g, '\n    ')}`]), `${i}}`].join('\n');
      });
    });
  }

  private forEach(s: ts.ForInStatement | ts.ForOfStatement): string {
    const i = this.indent;
    if (ts.isForOfStatement(s) && s.awaitModifier) throw this.error(s, 'for await outside an async function');
    const init = s.initializer;
    const lexical = ts.isVariableDeclarationList(init) && !!(init.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const));
    const item = this.fresh('__item');
    const source = this.fresh('__source');
    const header = ts.isForInStatement(s)
      ? `let ${source} = try jsForInKeys(${this.expr(s.expression)})`
      : `let ${source} = try jsForOfIterator(${this.expr(s.expression)})`;
    return this.loop(s, (label) => this.blockScope(lexical ? [ts.factory.createVariableStatement(undefined, init as ts.VariableDeclarationList)] : [], (decls) => {
      const target = ts.isVariableDeclarationList(init) ? init.declarations[0].name : init;
      const bind = this.nested(() => this.nested(() => (ts.isVariableDeclarationList(init) || !ts.isExpression(target)
        ? this.assignPattern(target as ts.BindingName, item)
        : this.assignTarget(target as ts.Expression, item)).map((l) => this.indent + l)));
      const body = this.nested(() => this.loopBody(s.statement));
      const loop = ts.isForInStatement(s)
        ? `${i}    ${label}for ${item} in ${source} {`
        : `${i}    ${label}while try ${source}.jsAdvance() {\n${i}        let ${item}: Any? = ${source}.jsCurrent`;
      return [`${i}do {`, `${i}    ${header}`, loop, ...decls.map((d) => `${i}        ${d.trimStart()}`), ...bind, `${i}        do ${body.trimStart()}`, `${i}    }`, `${i}}`].join('\n');
    }));
  }

  private switchStatement(s: ts.SwitchStatement): string {
    const i = this.indent;
    const clauses = s.caseBlock.clauses;
    const all = clauses.flatMap((c) => [...c.statements]);
    return this.blockScope(all, (decls) => {
      const subject = this.fresh('__switch');
      const k = this.fresh('__case');
      const label = this.fresh('S');
      const lines = [`${i}do {`, ...decls.map((d) => `${i}    ${d.trimStart()}`), ...this.nested(() => this.hoistedFunctions(all)), `${i}    let ${subject}: Any? = try ${this.expr(s.expression)}`, `${i}    var ${k} = -1`];
      clauses.forEach((c, n) => {
        if (!ts.isCaseClause(c)) return;
        lines.push(`${i}    if ${k} == -1, jsStrictEquals(${subject}, try ${this.expr(c.expression)}) { ${k} = ${n} }`);
      });
      const fallback = clauses.findIndex(ts.isDefaultClause);
      lines.push(`${i}    if ${k} == -1 { ${k} = ${fallback >= 0 ? fallback : clauses.length} }`);
      lines.push(`${i}    ${label}: switch ${k} {`);
      this.targets.push({ node: s, label: null, loop: false, swift: label });
      for (const f of this.finallies) f.loops.add(s);
      try {
        clauses.forEach((c, n) => {
          lines.push(`${i}    case ${n}:`);
          const body = this.nested(() => this.nested(() => this.statements([...c.statements])));
          lines.push(...body);
          if (n < clauses.length - 1) lines.push(`${i}        fallthrough`);
          else lines.push(`${i}        break`);
        });
      } finally { this.targets.pop(); }
      lines.push(`${i}    default: break`, `${i}    }`, `${i}}`);
      return lines.join('\n');
    });
  }

  // ---- Assignment targets and patterns

  /** Assigns `value` (Swift code) to a binding pattern's names, as declarations bind them. */
  private assignPattern(name: ts.BindingName, value: string, _init?: ts.Expression): string[] {
    if (ts.isIdentifier(name)) return [`${this.writeBinding(name, `try ${value}`)}`];
    const tmp = this.fresh('__d');
    const out = [`let ${tmp}: Any? = try ${value}`];
    if (ts.isObjectBindingPattern(name)) {
      const taken: string[] = [];
      for (const el of name.elements) {
        if (el.dotDotDotToken) { out.push(...this.assignPattern(el.name, `jsObjectRest(${tmp}, [${taken.join(', ')}])`)); continue; }
        const keyNode = el.propertyName ?? (el.name as ts.Identifier);
        const key = ts.isComputedPropertyName(keyNode) ? `jsPropertyKey(try ${this.expr(keyNode.expression)})` : swiftString(propertyNameText(keyNode as ts.PropertyName));
        taken.push(key);
        let read = `jsGetKey(${tmp}, ${key})`;
        if (el.initializer) read = `jsDefault(try ${read}, try ${this.expr(el.initializer)})`;
        out.push(...this.assignPattern(el.name, read));
      }
      if (!name.elements.length) out.push(`try jsRequireObjectCoercibleValue(${tmp})`);
      return out;
    }
    const items = this.fresh('__items');
    out.push(`let ${items} = try jsSpread(${tmp})`);
    name.elements.forEach((el, k) => {
      if (ts.isOmittedExpression(el)) return;
      if (el.dotDotDotToken) { out.push(...this.assignPattern(el.name, `JSArray<Any?>(Array(${items}.dropFirst(${k})))`)); return; }
      let read = `jsArg(${items}, ${k})`;
      if (el.initializer) read = `jsDefault(${read}, try ${this.expr(el.initializer)})`;
      out.push(...this.assignPattern(el.name, read));
    });
    return out;
  }

  /** Assigns `value` to an assignment target: an identifier, a member, or a destructuring literal. */
  private assignTarget(target: ts.Expression, value: string): string[] {
    target = skipParens(target);
    if (ts.isIdentifier(target)) return [this.writeBinding(target, `try ${value}`)];
    if (ts.isPropertyAccessExpression(target)) return [`try ${this.setter()}(${this.expr(target.expression)}, ${this.memberKey(target)}, try ${value})`];
    if (ts.isElementAccessExpression(target)) return [`try ${this.setter()}(${this.expr(target.expression)}, ${this.expr(target.argumentExpression)}, try ${value})`];
    const tmp = this.fresh('__d');
    const out = [`let ${tmp}: Any? = try ${value}`];
    if (ts.isObjectLiteralExpression(target)) {
      const taken: string[] = [];
      for (const p of target.properties) {
        if (ts.isSpreadAssignment(p)) { out.push(...this.assignTarget(p.expression, `jsObjectRest(${tmp}, [${taken.join(', ')}])`)); continue; }
        if (ts.isShorthandPropertyAssignment(p)) {
          taken.push(swiftString(p.name.text));
          let read = `jsGet(${tmp}, ${swiftString(p.name.text)})`;
          if (p.objectAssignmentInitializer) read = `jsDefault(try ${read}, try ${this.expr(p.objectAssignmentInitializer)})`;
          out.push(...this.assignTarget(p.name, read));
          continue;
        }
        if (!ts.isPropertyAssignment(p)) throw this.error(p, 'this destructuring assignment');
        const key = ts.isComputedPropertyName(p.name) ? `jsPropertyKey(try ${this.expr(p.name.expression)})` : swiftString(propertyNameText(p.name));
        taken.push(key);
        let t = p.initializer, read = `jsGetKey(${tmp}, ${key})`;
        if (ts.isBinaryExpression(t) && t.operatorToken.kind === ts.SyntaxKind.EqualsToken) { read = `jsDefault(try ${read}, try ${this.expr(t.right)})`; t = t.left; }
        out.push(...this.assignTarget(t, read));
      }
      return out;
    }
    if (ts.isArrayLiteralExpression(target)) {
      const items = this.fresh('__items');
      out.push(`let ${items} = try jsSpread(${tmp})`);
      target.elements.forEach((el, k) => {
        if (ts.isOmittedExpression(el)) return;
        if (ts.isSpreadElement(el)) { out.push(...this.assignTarget(el.expression, `JSArray<Any?>(Array(${items}.dropFirst(${k})))`)); return; }
        let t: ts.Expression = el, read = `jsArg(${items}, ${k})`;
        if (ts.isBinaryExpression(t) && t.operatorToken.kind === ts.SyntaxKind.EqualsToken) { read = `jsDefault(${read}, try ${this.expr(t.right)})`; t = t.left; }
        out.push(...this.assignTarget(t, read));
      });
      return out;
    }
    throw this.error(target, 'this assignment target');
  }

  /** The runtime's member write for the current function: sloppy code's writes fail silently where strict code's throw. */
  private setter(): string { return this.scope.fn.strict ? 'jsSetKey' : 'jsSloppySetKey'; }

  /** `name = value` for a binding (a global where no scope declares it). */
  private writeBinding(id: ts.Identifier, value: string): string {
    const b = this.scope.lookup(id.text);
    if (!b) return `jsGlobalWrite(${swiftString(id.text)}, ${value})`;
    if (b.imported) return `throw jsThrow(JSTypeError("Assignment to constant variable."))`;
    return `${b.swift} = ${value}`;
  }

  // ---- Expressions

  /** An expression in statement position: assignments as Swift assignments, the rest evaluated and dropped. */
  private statementExpr(e: ts.Expression): string {
    e = skipParens(e);
    const K = ts.SyntaxKind;
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === K.EqualsToken) {
      const lines = this.assignTarget(e.left, this.expr(e.right));
      return lines.join(`\n${this.indent}`);
    }
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === K.CommaToken) return `${this.statementExpr(e.left)}\n${this.indent}${this.statementExpr(e.right)}`;
    if (ts.isCallExpression(e) && e.expression.kind === K.SuperKeyword) return `${this.scope.fn.thisName} = try ${this.superCall(e)}`;
    if (ts.isVoidExpression(e)) return this.statementExpr(e.expression);
    return `_ = try ${this.expr(e)}`;
  }

  expr(e: ts.Expression): string {
    const s = this.subst.get(e);
    if (s) return s;
    const K = ts.SyntaxKind;
    switch (e.kind) {
      case K.NumericLiteral: return numberLiteral((e as ts.NumericLiteral).text);
      case K.BigIntLiteral: return `JSBigInt(literal: ${swiftString((e as ts.BigIntLiteral).text.replace(/n$/, ''))})`;
      case K.StringLiteral: case K.NoSubstitutionTemplateLiteral: return swiftString((e as ts.StringLiteral).text);
      case K.TrueKeyword: return 'true';
      case K.FalseKeyword: return 'false';
      case K.NullKeyword: return 'jsNull';
      case K.ThisKeyword: return this.thisRef();
      case K.RegularExpressionLiteral: {
        const text = (e as ts.RegularExpressionLiteral).text;
        const end = text.lastIndexOf('/');
        return `try jsRegExpLiteralChecked(${swiftString(text.slice(1, end))}, ${swiftString(text.slice(end + 1))})`;
      }
    }
    if (ts.isParenthesizedExpression(e)) return this.expr(e.expression);
    if (ts.isIdentifier(e)) return this.identifier(e);
    if (ts.isTemplateExpression(e)) {
      const parts = [swiftString(e.head.text), ...e.templateSpans.flatMap((sp) => [`try jsTemplateString(${this.expr(sp.expression)})`, swiftString(sp.literal.text)])].filter((p) => p !== '""');
      return parts.length ? `jsConcat([${parts.join(', ')}])` : '""';
    }
    if (ts.isTaggedTemplateExpression(e)) return this.taggedTemplate(e);
    if (ts.isArrayLiteralExpression(e)) return this.arrayLiteral(e);
    if (ts.isObjectLiteralExpression(e)) return this.objectLiteral(e);
    if (ts.isFunctionExpression(e)) return this.functionValue(e, e.name?.text ?? this.inferredName(e));
    if (ts.isArrowFunction(e)) return this.functionValue(e, this.inferredName(e));
    if (ts.isClassExpression(e)) return `try ${this.classValue(e, e.name?.text ?? this.inferredName(e))}`;
    if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isCallExpression(e)) {
      if (isOptionalChainRoot(e)) return this.optionalChain(e);
      return this.chainPart(e, null);
    }
    if (ts.isNewExpression(e)) return `try jsNew(${this.expr(e.expression)}, ${this.argList(e.arguments ?? ts.factory.createNodeArray())})`;
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) return this.step(e.operand, e.operator === K.PlusPlusToken ? 1 : -1, true);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isConditionalExpression(e)) return `jsChoose(${this.cond(e.condition)}, ${this.expr(e.whenTrue)}, ${this.expr(e.whenFalse)})`;
    if (ts.isTypeOfExpression(e)) return `(${this.typeofCode(e)} as Any?)`;
    if (ts.isVoidExpression(e)) return `jsVoid(try ${this.expr(e.expression)})`;
    if (ts.isDeleteExpression(e)) return this.deleteExpr(e);
    if (ts.isAwaitExpression(e) || ts.isYieldExpression(e)) throw this.error(e, ts.isAwaitExpression(e) ? 'await outside an async function' : 'yield outside a generator');
    if (ts.isSpreadElement(e)) throw this.error(e, 'a spread here');
    if (ts.isMetaProperty(e)) {
      if (e.keywordToken === K.NewKeyword) return this.newTargetRef(e);
      return `JSObject([("url", ${swiftString('file://' + this.module.file)})])`;
    }
    if (ts.isCommaListExpression(e)) return `jsComma(${e.elements.map((x) => `try ${this.expr(x)}`).join(', ')})`;
    throw this.error(e, `the expression ${ts.SyntaxKind[e.kind]}`);
  }

  private inferredName(e: ts.Node): string {
    const p = e.parent;
    if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name)) return p.name.text;
    if (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) return propertyNameText(p.name);
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(p.left)) return p.left.text;
    if (ts.isParameter(p) && ts.isIdentifier(p.name)) return p.name.text;
    return '';
  }

  private identifier(e: ts.Identifier): string {
    const name = e.text;
    if (name === 'arguments' && !this.scope.lookup('arguments')) return this.argumentsRef(e);
    const b = this.scope.lookup(name);
    if (b) {
      if (b.imported) return this.importRead(b.imported);
      return b.swift;
    }
    switch (name) {
      case 'undefined': return 'nil';
      case 'NaN': return 'Double.nan';
      case 'Infinity': return 'Double.infinity';
      case 'globalThis': case 'global': return 'JSScriptGlobal.object';
      case 'require': return `jsRequireFunction(${swiftString(this.moduleId(this.module))})`;
    }
    return `jsGlobalRead(${swiftString(name)})`;
  }

  private thisRef(): string {
    const fn = this.scope.fn;
    fn.usesThis = true;
    return fn.thisName;
  }

  private argumentsRef(e: ts.Node): string {
    const fn = this.scope.fn;
    if (!fn.argumentsName) throw this.error(e, '`arguments` at the top of a module');
    fn.usesArguments = true;
    return fn.argumentsName;
  }

  private newTargetRef(e: ts.Node): string {
    const fn = this.scope.fn;
    if (fn.newTarget) return fn.newTarget;
    throw this.error(e, 'new.target outside a constructor');
  }

  typeofCode(e: ts.TypeOfExpression): string {
    const x = skipParens(e.expression);
    if (ts.isIdentifier(x) && !this.scope.lookup(x.text) && !['undefined', 'NaN', 'Infinity', 'globalThis', 'global', 'require', 'arguments'].includes(x.text)) return `jsTypeof(jsGlobalLookup(${swiftString(x.text)}))`;
    return `jsTypeof(try ${this.expr(x)})`;
  }

  private memberKey(e: ts.PropertyAccessExpression): string {
    return ts.isPrivateIdentifier(e.name) ? swiftString(this.privateKey(e.name)) : swiftString(e.name.text);
  }

  /** A class's private name (`#x`): a key no other class and no script spells. */
  private privateKey(n: ts.PrivateIdentifier): string {
    const cls = ts.findAncestor(n, ts.isClassLike);
    return `\u0000${n.text}@${cls ? cls.pos : 0}`;
  }

  /** `a?.b.c(…)`: the whole chain undefined once a link is undefined or null. */
  private optionalChain(e: ts.Expression): string {
    const out = this.fresh('__chain');
    const guards: string[] = [];
    const code = this.chainPart(e, guards);
    return `({ () throws -> Any? in\n${guards.map((g) => `    ${g}`).join('\n')}\n    return try ${code}\n})()`.replace(/__chain\d+/, out);
  }

  /**
   * A member read, element read or call; `guards` (inside an optional chain) collects the
   * statements that end the chain at a `?.` whose left side is undefined or null.
   */
  private chainPart(e: ts.Expression, guards: string[] | null): string {
    e = skipParens(e);
    const link = (x: ts.Expression): string => {
      x = skipParens(x);
      if (guards && (ts.isPropertyAccessExpression(x) || ts.isElementAccessExpression(x) || ts.isCallExpression(x)) && x.flags & ts.NodeFlags.OptionalChain) return this.chainPart(x, guards);
      return this.expr(x);
    };
    const guarded = (x: ts.Expression, optional: boolean): string => {
      const code = link(x);
      if (!optional || !guards) return code;
      const v = this.fresh('__o');
      guards.push(`let ${v}: Any? = try ${code}`, `if jsIsNullish(${v}) { return nil }`);
      return v;
    };
    if (ts.isPropertyAccessExpression(e)) {
      if (e.expression.kind === ts.SyntaxKind.SuperKeyword) return `jsSuperGet(${this.homeObject(e)}, ${this.memberKey(e)}, ${this.thisRef()})`;
      const folded = this.folded(e);
      if (folded) return folded;
      const target = guarded(e.expression, !!e.questionDotToken);
      return `jsGet(${target}, ${this.memberKey(e)})`;
    }
    if (ts.isElementAccessExpression(e)) {
      if (e.expression.kind === ts.SyntaxKind.SuperKeyword) return `jsSuperGet(${this.homeObject(e)}, try ${this.expr(e.argumentExpression)}, ${this.thisRef()})`;
      const target = guarded(e.expression, !!e.questionDotToken);
      return `jsGetKey(${target}, try ${this.expr(e.argumentExpression)})`;
    }
    const call = e as ts.CallExpression;
    const callee = skipParens(call.expression);
    if (callee.kind === ts.SyntaxKind.SuperKeyword) return `jsAssign(&${this.scope.fn.thisName}, try ${this.superCall(call)})`;
    if (callee.kind === ts.SyntaxKind.ImportKeyword) return this.dynamicImport(call);
    if (ts.isIdentifier(callee) && callee.text === 'require' && !this.scope.lookup('require')) return this.requireCall(call);
    const args = this.argList(call.arguments);
    if (ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) {
      if (callee.expression.kind === ts.SyntaxKind.SuperKeyword) {
        const key = ts.isPropertyAccessExpression(callee) ? this.memberKey(callee) : `try ${this.expr(callee.argumentExpression)}`;
        return `jsSuperCall(${this.homeObject(callee)}, ${key}, ${this.thisRef()}, ${args})`;
      }
      const target = guarded(callee.expression, !!callee.questionDotToken);
      const key = ts.isPropertyAccessExpression(callee) ? this.memberKey(callee) : `try ${this.expr(callee.argumentExpression)}`;
      if (call.questionDotToken && guards) {
        const f = this.fresh('__f');
        guards.push(`let ${f}: Any? = try jsGetKey(${target}, ${key})`, `if jsIsNullish(${f}) { return nil }`);
        return `jsInvoke(${f}, ${target}, ${args})`;
      }
      return `jsInvokeMember(${target}, ${key}, ${args})`;
    }
    const f = guarded(callee, !!call.questionDotToken);
    return `jsInvoke(${f}, nil, ${args}${ts.isIdentifier(callee) ? `, ${swiftString(callee.text)}` : ''})`;
  }

  /** What the bundler replaces at build time (`process.env.NODE_ENV`). */
  private folded(e: ts.PropertyAccessExpression): string | null {
    if (e.name.text === 'NODE_ENV' && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'env' && ts.isIdentifier(e.expression.expression) && e.expression.expression.text === 'process' && !this.scope.lookup('process')) return '"production"';
    return null;
  }

  private argList(args: ts.NodeArray<ts.Expression>): string {
    if (!args.some(ts.isSpreadElement)) return `[${args.map((a) => `try ${this.expr(a)}`).join(', ')}]`;
    const parts: string[] = [];
    let run: string[] = [];
    for (const a of args) {
      if (ts.isSpreadElement(a)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`(try jsSpread(${this.expr(a.expression)}))`);
      } else run.push(`try ${this.expr(a)}`);
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `jsConcatArguments([${parts.join(', ')}])`;
  }

  private requireCall(call: ts.CallExpression): string {
    const arg = call.arguments[0];
    if (!arg || !ts.isStringLiteralLike(arg)) {
      this.graph.warnings.push(`${this.moduleId(this.module)}: require() of a computed name, which a native release cannot load; it throws if it runs`);
      return `jsThrowing("require() of a computed module name is not available in a compiled app")`;
    }
    const dep = this.module.deps.get(arg.text);
    if (!dep) return `jsThrowing(${swiftString(`Cannot find module '${arg.text}'`)})`;
    if ('error' in dep) return `jsThrowing(${swiftString(`Cannot find module '${arg.text}': ${dep.error}`)})`;
    if (!('module' in dep)) return 'JSObject()';
    return `jsRequire(${dep.module.name})`;
  }

  private dynamicImport(call: ts.CallExpression): string {
    const arg = call.arguments[0];
    const dep = arg && ts.isStringLiteralLike(arg) ? this.module.deps.get(arg.text) : undefined;
    if (!dep || !('module' in dep)) return `JSPromise<Any?>.reject(JSError(${swiftString(`Cannot load module '${arg && ts.isStringLiteralLike(arg) ? arg.text : '?'}' in a compiled app`)}))`;
    return `jsDynamicImport(${dep.module.name})`;
  }

  private taggedTemplate(e: ts.TaggedTemplateExpression): string {
    const t = e.template;
    const cooked = ts.isNoSubstitutionTemplateLiteral(t) ? [t.text] : [t.head.text, ...t.templateSpans.map((s) => s.literal.text)];
    const raw = ts.isNoSubstitutionTemplateLiteral(t) ? [t.rawText ?? t.text] : [t.head.rawText ?? t.head.text, ...t.templateSpans.map((s) => s.literal.rawText ?? s.literal.text)];
    const subs = ts.isNoSubstitutionTemplateLiteral(t) ? [] : t.templateSpans.map((s) => `try ${this.expr(s.expression)}`);
    const strings = `jsTemplateObject([${cooked.map(swiftString).join(', ')}], raw: [${raw.map(swiftString).join(', ')}])`;
    const tag = skipParens(e.tag);
    if (ts.isPropertyAccessExpression(tag)) return `jsInvokeMember(${this.expr(tag.expression)}, ${this.memberKey(tag)}, [${[strings, ...subs].join(', ')}])`;
    return `jsInvoke(${this.expr(tag)}, nil, [${[strings, ...subs].join(', ')}])`;
  }

  private arrayLiteral(e: ts.ArrayLiteralExpression): string {
    if (!e.elements.some(ts.isSpreadElement)) return `JSArray<Any?>([${e.elements.map((x) => (ts.isOmittedExpression(x) ? 'nil' : `try ${this.expr(x)}`)).join(', ')}] as [Any?])`;
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`(try jsSpread(${this.expr(x.expression)}))`);
      } else run.push(ts.isOmittedExpression(x) ? 'nil' : `try ${this.expr(x)}`);
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `JSArray<Any?>(jsConcatArguments([${parts.join(', ')}]))`;
  }

  private objectLiteral(e: ts.ObjectLiteralExpression): string {
    const simple = e.properties.every((p) => (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) || ts.isShorthandPropertyAssignment(p));
    const value = (p: ts.ObjectLiteralElementLike): string => (ts.isShorthandPropertyAssignment(p) ? this.identifier(p.name) : `try ${this.expr((p as ts.PropertyAssignment).initializer)}`);
    const keyOf = (p: ts.ObjectLiteralElementLike) => propertyNameText(p.name as ts.PropertyName);
    if (simple && !e.properties.some((p) => usesSuper(p))) {
      if (!e.properties.length) return 'JSObject()';
      return `jsObjectLiteral([${e.properties.map((p) => `(${swiftString(keyOf(p))}, ${value(p)})`).join(', ')}])`;
    }
    const o = this.fresh('__obj');
    const lines: string[] = [`let ${o} = JSObject()`];
    const saved = this.scope.fn.homeVar;
    for (const p of e.properties) {
      if (ts.isSpreadAssignment(p)) { lines.push(`jsObjectSpread(${o}, try ${this.expr(p.expression)})`); continue; }
      const key = ts.isComputedPropertyName(p.name!) ? `try ${this.expr(p.name.expression)}` : swiftString(propertyNameText(p.name!));
      if (ts.isPropertyAssignment(p)) {
        if (!ts.isComputedPropertyName(p.name) && propertyNameText(p.name) === '__proto__') { lines.push(`try jsSetPrototypeOfLiteral(${o}, try ${this.expr(p.initializer)})`); continue; }
        lines.push(`try jsSetKey(${o}, ${key}, try ${this.expr(p.initializer)})`);
      } else if (ts.isShorthandPropertyAssignment(p)) lines.push(`try jsSetKey(${o}, ${key}, ${this.identifier(p.name)})`);
      else if (ts.isMethodDeclaration(p)) lines.push(`try jsSetKey(${o}, ${key}, ${this.methodValue(p, ts.isComputedPropertyName(p.name) ? '' : propertyNameText(p.name), { homeVar: o })})`);
      else if (ts.isGetAccessor(p) || ts.isSetAccessor(p)) {
        const f = this.methodValue(p, ts.isComputedPropertyName(p.name) ? '' : propertyNameText(p.name), { homeVar: o });
        lines.push(`try jsDefineAccessor(${o}, ${key}, get: ${ts.isGetAccessor(p) ? f : 'nil'}, set: ${ts.isSetAccessor(p) ? f : 'nil'}, enumerable: true)`);
      }
    }
    this.scope.fn.homeVar = saved;
    return `({ () throws -> Any? in\n${lines.map((l) => '    ' + l).join('\n')}\n    return ${o}\n})()`;
  }

  private prefix(e: ts.PrefixUnaryExpression): string {
    const K = ts.SyntaxKind;
    switch (e.operator) {
      case K.PlusPlusToken: return this.step(e.operand, 1, false);
      case K.MinusMinusToken: return this.step(e.operand, -1, false);
      case K.ExclamationToken: return `(!(${this.cond(e.operand)}) as Any?)`;
      case K.MinusToken: return ts.isNumericLiteral(e.operand) ? `(-${numberLiteral(e.operand.text)})` : `jsNeg(try ${this.expr(e.operand)})`;
      case K.PlusToken: return `jsPlus(try ${this.expr(e.operand)})`;
      case K.TildeToken: return `jsBNot(try ${this.expr(e.operand)})`;
    }
    throw this.error(e, 'this unary operator');
  }

  private step(target: ts.Expression, delta: number, postfix: boolean): string {
    target = skipParens(target);
    if (ts.isIdentifier(target)) {
      const b = this.scope.lookup(target.text);
      if (!b || b.imported) return `jsGlobalStep(${swiftString(target.text)}, ${delta}.0, postfix: ${postfix})`;
      return `jsStep(&${b.swift}, ${delta}.0, postfix: ${postfix})`;
    }
    if (ts.isPropertyAccessExpression(target)) return `jsStepKey(try ${this.expr(target.expression)}, ${this.memberKey(target)}, ${delta}.0, postfix: ${postfix})`;
    if (ts.isElementAccessExpression(target)) return `jsStepKey(try ${this.expr(target.expression)}, try ${this.expr(target.argumentExpression)}, ${delta}.0, postfix: ${postfix})`;
    throw this.error(target, 'this update target');
  }

  private deleteExpr(e: ts.DeleteExpression): string {
    const x = skipParens(e.expression);
    const strict = this.scope.fn.strict;
    if (ts.isPropertyAccessExpression(x)) return `(try jsDeleteKey(${this.expr(x.expression)}, ${this.memberKey(x)}, strict: ${strict}) as Any?)`;
    if (ts.isElementAccessExpression(x)) return `(try jsDeleteKey(${this.expr(x.expression)}, try ${this.expr(x.argumentExpression)}, strict: ${strict}) as Any?)`;
    return `(true as Any?)`;
  }

  private binary(e: ts.BinaryExpression): string {
    const K = ts.SyntaxKind;
    const op = e.operatorToken.kind;
    const l = () => `try ${this.expr(e.left)}`, r = () => `try ${this.expr(e.right)}`;
    const compare = this.comparison(e);
    if (compare) return `(try ${compare} as Any?)`;
    switch (op) {
      case K.PlusToken: return `jsAdd(${l()}, ${r()})`;
      case K.MinusToken: return `jsSub(${l()}, ${r()})`;
      case K.AsteriskToken: return `jsMul(${l()}, ${r()})`;
      case K.SlashToken: return `jsDiv(${l()}, ${r()})`;
      case K.PercentToken: return `jsRem(${l()}, ${r()})`;
      case K.AsteriskAsteriskToken: return `jsExp(${l()}, ${r()})`;
      case K.BarToken: return `jsBOr(${l()}, ${r()})`;
      case K.AmpersandToken: return `jsBAnd(${l()}, ${r()})`;
      case K.CaretToken: return `jsBXor(${l()}, ${r()})`;
      case K.LessThanLessThanToken: return `jsShl(${l()}, ${r()})`;
      case K.GreaterThanGreaterThanToken: return `jsShr(${l()}, ${r()})`;
      case K.GreaterThanGreaterThanGreaterThanToken: return `jsUShr(${l()}, ${r()})`;
      case K.AmpersandAmpersandToken: return `jsLogicalAnd(${l()}, ${r()})`;
      case K.BarBarToken: return `jsLogicalOr(${l()}, ${r()})`;
      case K.QuestionQuestionToken: return `jsCoalesce(${l()}, ${r()})`;
      case K.CommaToken: return `jsComma(${l()}, ${r()})`;
      case K.EqualsToken: return this.assignmentExpr(e.left, () => r());
    }
    if (op >= K.FirstCompoundAssignment && op <= K.LastCompoundAssignment) return this.compound(e);
    throw this.error(e, `the operator ${ts.tokenToString(op)}`);
  }

  /** `target = value` as an expression: the value. */
  private assignmentExpr(target: ts.Expression, value: () => string): string {
    target = skipParens(target);
    if (ts.isIdentifier(target)) {
      const b = this.scope.lookup(target.text);
      if (!b) return `jsGlobalWrite(${swiftString(target.text)}, ${value()})`;
      return `jsAssign(&${b.swift}, ${value()})`;
    }
    if (ts.isPropertyAccessExpression(target)) return `${this.setter()}(try ${this.expr(target.expression)}, ${this.memberKey(target)}, ${value()})`;
    if (ts.isElementAccessExpression(target)) return `${this.setter()}(try ${this.expr(target.expression)}, try ${this.expr(target.argumentExpression)}, ${value()})`;
    const v = this.fresh('__v');
    const lines = this.assignTarget(target, v);
    return `({ () throws -> Any? in\n    let ${v}: Any? = ${value()}\n${lines.map((l) => '    ' + l).join('\n')}\n    return ${v}\n})()`;
  }

  private compound(e: ts.BinaryExpression): string {
    const K = ts.SyntaxKind;
    const op = e.operatorToken.kind;
    const fns: Partial<Record<ts.SyntaxKind, string>> = {
      [K.PlusEqualsToken]: 'jsAdd', [K.MinusEqualsToken]: 'jsSub', [K.AsteriskEqualsToken]: 'jsMul', [K.SlashEqualsToken]: 'jsDiv', [K.PercentEqualsToken]: 'jsRem',
      [K.AsteriskAsteriskEqualsToken]: 'jsExp', [K.BarEqualsToken]: 'jsBOr', [K.AmpersandEqualsToken]: 'jsBAnd', [K.CaretEqualsToken]: 'jsBXor',
      [K.LessThanLessThanEqualsToken]: 'jsShl', [K.GreaterThanGreaterThanEqualsToken]: 'jsShr', [K.GreaterThanGreaterThanGreaterThanEqualsToken]: 'jsUShr',
    };
    const logical = op === K.BarBarEqualsToken ? 'jsLogicalOr' : op === K.AmpersandAmpersandEqualsToken ? 'jsLogicalAnd' : op === K.QuestionQuestionEqualsToken ? 'jsCoalesce' : null;
    const target = skipParens(e.left);
    if (ts.isIdentifier(target)) {
      const b = this.scope.lookup(target.text);
      const read = b ? (b.imported ? this.importRead(b.imported) : b.swift) : `try jsGlobalRead(${swiftString(target.text)})`;
      const write = (v: string) => (b ? `jsAssign(&${b.swift}, ${v})` : `jsGlobalWrite(${swiftString(target.text)}, ${v})`);
      if (logical) return `${logical}(${read}, ${write(`try ${this.expr(e.right)}`)})`;
      return write(`${fns[op]}(${read}, try ${this.expr(e.right)})`);
    }
    if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
      const obj = `try ${this.expr(target.expression)}`;
      const key = ts.isPropertyAccessExpression(target) ? this.memberKey(target) : `try ${this.expr(target.argumentExpression)}`;
      if (logical) {
        const o = this.fresh('__o'), k = this.fresh('__k'), v = this.fresh('__v');
        return `({ () throws -> Any? in\n    let ${o}: Any? = ${obj}\n    let ${k}: Any? = ${key}\n    let ${v}: Any? = try jsGetKey(${o}, ${k})\n    return try ${logical}(${v}, try jsSetKey(${o}, ${k}, try ${this.expr(e.right)}))\n})()`;
      }
      return `jsUpdateKey(${obj}, ${key}) { (__old: Any?) throws -> Any? in try ${fns[op]}(__old, try ${this.expr(e.right)}) }`;
    }
    throw this.error(e, 'this compound assignment target');
  }

  // ---- Functions

  /** A function expression, arrow function or function declaration as a function object. */
  functionValue(fn: ts.FunctionLikeDeclaration, name: string): string {
    const arrow = ts.isArrowFunction(fn);
    const kind = arrow ? 'jsArrow' : 'jsFunction';
    // A named function expression sees itself under its name.
    if (ts.isFunctionExpression(fn) && fn.name) {
      const self = `__self${this.tmp++}`;
      this.declareLocal(`${this.indent}var ${self}: Any? = nil`);
      const f = this.withBinding(fn.name.text, self, () => this.localFunction(fn, { arrow }));
      return `jsAssign(&${self}, ${kind}(${swiftString(name)}, ${arity(fn)}, ${f}))`;
    }
    return `${kind}(${swiftString(name)}, ${arity(fn)}, ${this.localFunction(fn, { arrow })})`;
  }

  private withBinding<T>(name: string, swift: string, body: () => T): T {
    const outer = this.scope;
    this.scope = new Scope(outer, outer.fn);
    this.scope.vars.set(name, { swift });
    try { return body(); } finally { this.scope = outer; }
  }

  /** A method of a class or object literal: a function object that is not a constructor. */
  private methodValue(m: ts.MethodDeclaration | ts.AccessorDeclaration, name: string, home: { homeVar?: string; classVar?: string; isStatic?: boolean }): string {
    const label = ts.isGetAccessor(m) ? `get ${name}` : ts.isSetAccessor(m) ? `set ${name}` : name;
    return `jsMethodFunction(${swiftString(label)}, ${arity(m)}, ${this.localFunction(m, { arrow: false, ...home })})`;
  }

  /** Declares a function's body as a local function before the current statement: its name. */
  private localFunction(fn: ts.FunctionLikeDeclaration, opts: { arrow: boolean; homeVar?: string; classVar?: string; isStatic?: boolean }): string {
    const name = this.fresh('__f');
    this.declareLocal(this.functionClosure(fn, opts, name));
    return name;
  }

  /** `func name(_ this: Any?, _ args: [Any?]) throws -> Any? { … }` for a function's parameters and body. */
  private functionClosure(fn: ts.FunctionLikeDeclaration, opts: { arrow: boolean; homeVar?: string; classVar?: string; isStatic?: boolean }, swiftName: string): string {
    const outer = this.scope;
    const id = this.tmp++;
    const body = fn.body;
    const strict = this.scope.fn.strict || (!!body && ts.isBlock(body) && hasUseStrict(body.statements)) || !!opts.classVar;
    const info: FnInfo = opts.arrow
      ? { ...outer.fn, arrow: true, argsName: `args${id}`, isConstructor: false }
      : { arrow: false, strict, thisName: `this${id}`, argsName: `args${id}`, usesThis: false, usesArguments: false, argumentsName: `arguments${id}`, homeVar: opts.homeVar, classVar: opts.classVar, isStatic: opts.isStatic };
    if (opts.arrow) {
      // An arrow reads its enclosing function's `this` and `arguments`: the same record, so the reads mark it.
      Object.defineProperty(info, 'usesThis', { get: () => outer.fn.usesThis, set: (v) => { outer.fn.usesThis = v; } });
      Object.defineProperty(info, 'usesArguments', { get: () => outer.fn.usesArguments, set: (v) => { outer.fn.usesArguments = v; } });
    }
    this.scope = new Scope(outer, info);
    const savedTargets = this.targets, savedFinallies = this.finallies, savedAsync = this.asyncCtx, savedLoops = this.plainLoops;
    this.pending.push([]);
    this.targets = [];
    this.finallies = [];
    this.asyncCtx = null;
    this.plainLoops = 0;
    try {
      const statements = body ? (ts.isBlock(body) ? [...body.statements] : null) : [];
      const lines = this.nested(() => {
        const out: string[] = [];
        // Parameters, then what the body hoists; a parameter and a `var` of one name are one binding.
        const params: string[] = [];
        for (const p of fn.parameters) for (const n of boundNames(p.name)) if (!this.scope.vars.has(n)) { const s = this.local(n); this.scope.vars.set(n, { swift: s }); params.push(s); }
        const hoisted = this.declareHoisted(statements ?? [], true, (n) => this.local(n));
        // A body split at its awaits or yields declares every binding first: its continuations are closures reading them.
        const suspends = !!fn.asteriskToken || !!fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
        if (suspends) for (const n of lexicalNamesDeep(statements ?? [])) if (!this.scope.vars.has(n)) { const s = this.local(n); this.scope.vars.set(n, { swift: s }); hoisted.push(s); }
        for (const s of params) out.push(`${this.indent}var ${s}: Any? = nil`);
        fn.parameters.forEach((p, k) => {
          if (p.dotDotDotToken) { out.push(...this.assignPattern(p.name, `JSArray<Any?>(Array(${info.argsName}.dropFirst(${k})))`).map((l) => this.indent + l)); return; }
          const read = p.initializer ? `jsDefault(jsArg(${info.argsName}, ${k}), try ${this.expr(p.initializer)})` : `jsArg(${info.argsName}, ${k})`;
          out.push(...this.assignPattern(p.name, read).map((l) => this.indent + l));
        });
        for (const s of hoisted) out.push(`${this.indent}var ${s}: Any? = nil`);
        // What parameter defaults and an async body's split expressions declare goes after the declarations they may read.
        const marker = out.length;
        const isAsync = !!fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
        const flush = () => { out.splice(marker, 0, ...this.pending.at(-1)!.splice(0)); };
        if (fn.asteriskToken) {
          if (!statements) throw this.error(fn, 'a generator arrow');
          out.push(...this.hoistedFunctions(statements));
          out.push(...this.lowering.generatorBody(fn, 'Any?', isAsync));
          flush();
          return out;
        }
        if (isAsync) {
          out.push(...this.hoistedFunctions(statements ?? []));
          out.push(...this.lowering.body(fn, 'Any?'));
          flush();
          return out;
        }
        if (!statements) {
          out.push(`${this.indent}return try ${this.expr(body as ts.Expression)}`);
          flush();
          return out;
        }
        out.push(...this.hoistedFunctions(statements));
        out.push(...this.statements(statements));
        out.push(`${this.indent}return nil`);
        flush();
        return out;
      });
      const prelude: string[] = [];
      const pad = this.indent + '    ';
      if (!opts.arrow) {
        if (info.usesArguments) prelude.push(`${pad}let ${info.argumentsName}: Any? = jsArgumentsObject(${info.argsName})`);
        if (info.usesThis && !info.strict) prelude.push(`${pad}let ${info.thisName}: Any? = jsSloppyThis(__receiver${id})`);
      }
      const receiver = opts.arrow ? '_' : info.usesThis && !info.strict ? `__receiver${id}` : info.usesThis ? info.thisName : '_';
      const argsUsed = lines.some((l) => l.includes(info.argsName)) || prelude.some((l) => l.includes(info.argsName));
      return `${this.indent}func ${swiftName}(_ ${receiver}: Any?, _ ${argsUsed ? info.argsName : '_'}: [Any?]) throws -> Any? {\n${[...prelude, ...lines].join('\n')}\n${this.indent}}`;
    } finally {
      this.pending.pop();
      this.scope = outer;
      this.targets = savedTargets;
      this.finallies = savedFinallies;
      this.asyncCtx = savedAsync;
      this.plainLoops = savedLoops;
    }
  }

  // ---- Classes

  /**
   * A class declaration or expression: a call of a local function that makes the constructor and
   * defines its prototype's methods, its fields and its statics.
   */
  classValue(c: ts.ClassLikeDeclaration, name: string): string {
    const outer = this.scope;
    const id = this.tmp++;
    const cls = `__class${id}`;
    const maker = `__makeClass${id}`;
    const heritage = c.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
    const ctor = c.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    // The class's own name, inside it, is the class.
    this.scope = new Scope(outer, outer.fn);
    if (c.name) this.scope.vars.set(c.name.text, { swift: cls });
    const lines = this.nested(() => {
      const i = this.indent;
      const out: string[] = [`${i}var ${cls}: Any? = nil`];
      const step = (code: () => string) => { const x = this.withPending(code); if (x) out.push(x); };
      const parent = heritage ? `try ${this.expr(heritage)}` : 'nil';
      const newTarget = `__newTarget${id}`, thisName = `this${id}`, argsName = `args${id}`;
      const info: FnInfo = { arrow: false, strict: true, thisName, argsName, usesThis: true, usesArguments: false, argumentsName: `arguments${id}`, classVar: cls, isStatic: false, newTarget, derived: !!heritage, isConstructor: true };
      const ctorName = `__ctor${id}`;
      const ctorBody = this.withFunction(info, () => this.nested(() => {
        const body: string[] = [];
        body.push(`${this.indent}var ${thisName}: Any? = ${heritage ? 'nil' : `try jsClassInstance(${cls}, ${newTarget})`}`);
        if (!ctor) {
          if (heritage) body.push(`${this.indent}${thisName} = try jsSuperConstruct(${cls}, ${newTarget}, ${argsName})`);
          body.push(`${this.indent}return ${thisName}`);
          return body;
        }
        const statements = [...ctor.body!.statements];
        const params: string[] = [];
        for (const p of ctor.parameters) for (const n of boundNames(p.name)) if (!this.scope.vars.has(n)) { const v = this.local(n); this.scope.vars.set(n, { swift: v }); params.push(v); }
        const hoisted = this.declareHoisted(statements, true, (n) => this.local(n));
        for (const v of params) body.push(`${this.indent}var ${v}: Any? = nil`);
        for (const v of hoisted) body.push(`${this.indent}var ${v}: Any? = nil`);
        ctor.parameters.forEach((p, k) => {
          const x = this.withPending(() => {
            if (p.dotDotDotToken) return this.assignPattern(p.name, `JSArray<Any?>(Array(${argsName}.dropFirst(${k})))`).map((l) => this.indent + l).join('\n');
            const read = p.initializer ? `jsDefault(jsArg(${argsName}, ${k}), try ${this.expr(p.initializer)})` : `jsArg(${argsName}, ${k})`;
            return this.assignPattern(p.name, read).map((l) => this.indent + l).join('\n');
          });
          if (x) body.push(x);
        });
        body.push(...this.hoistedFunctions(statements), ...this.statements(statements), `${this.indent}return ${thisName}`);
        return body;
      }));
      const prelude = info.usesArguments ? [`${i}    let ${info.argumentsName}: Any? = jsArgumentsObject(${argsName})`] : [];
      out.push(`${i}func ${ctorName}(_ ${newTarget}: JSFunctionObject, _ ${argsName}: [Any?]) throws -> Any? {`, ...prelude, ...ctorBody, `${i}}`);
      step(() => `${i}${cls} = try jsClass(${swiftString(name)}, ${ctor ? arity(ctor) : 0}, parent: ${parent}, hasParent: ${!!heritage}, ${ctorName})`);
      // Instance fields, set as the base makes the instance (before a derived constructor's own code after `super`).
      const fields = c.members.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !isStatic(m));
      if (fields.length) {
        const fieldThis = `this${this.tmp++}`;
        const fieldsName = `__fields${id}`;
        const finfo: FnInfo = { arrow: false, strict: true, thisName: fieldThis, argsName: '_', usesThis: true, usesArguments: false, argumentsName: '', classVar: cls, isStatic: false };
        const body = this.withFunction(finfo, () => this.nested(() => fields.map((f) => this.withPending(() => `${this.indent}try jsDefineField(${fieldThis}, ${this.propertyKeyCode(f.name)}, ${f.initializer ? `try ${this.expr(f.initializer)}` : 'nil'})`))));
        out.push(`${i}func ${fieldsName}(_ ${fieldThis}: Any?) throws {`, ...body, `${i}}`, `${i}try jsSetFields(${cls}, ${fieldsName})`);
      }
      for (const m of c.members) {
        if (ts.isConstructorDeclaration(m) || ts.isSemicolonClassElement(m) || ts.isIndexSignatureDeclaration(m)) continue;
        const stat = isStatic(m);
        const target = stat ? cls : `try jsGet(${cls}, "prototype")`;
        if (ts.isMethodDeclaration(m)) {
          if (!m.body) continue;
          step(() => `${i}try jsDefineMethod(${target}, ${this.propertyKeyCode(m.name)}, ${this.methodValue(m, this.nameText(m.name), { classVar: cls, isStatic: stat })})`);
        } else if (ts.isGetAccessor(m) || ts.isSetAccessor(m)) {
          step(() => {
            const f = this.methodValue(m, this.nameText(m.name), { classVar: cls, isStatic: stat });
            return `${i}try jsDefineAccessor(${target}, ${this.propertyKeyCode(m.name)}, get: ${ts.isGetAccessor(m) ? f : 'nil'}, set: ${ts.isSetAccessor(m) ? f : 'nil'}, enumerable: false)`;
          });
        } else if (ts.isPropertyDeclaration(m) && stat) {
          const sinfo: FnInfo = { arrow: false, strict: true, thisName: cls, argsName: '_', usesThis: true, usesArguments: false, argumentsName: '', classVar: cls, isStatic: true };
          step(() => this.withFunction(sinfo, () => `${i}try jsDefineField(${cls}, ${this.propertyKeyCode(m.name)}, ${m.initializer ? `try ${this.expr(m.initializer)}` : 'nil'})`));
        } else if (ts.isClassStaticBlockDeclaration(m)) {
          const sinfo: FnInfo = { arrow: false, strict: true, thisName: cls, argsName: '_', usesThis: true, usesArguments: false, argumentsName: '', classVar: cls, isStatic: true };
          step(() => this.withFunction(sinfo, () => `${i}do ${this.blockOf(m.body)}`));
        }
      }
      out.push(`${i}return ${cls}`);
      return out;
    });
    this.scope = outer;
    this.declareLocal(`${this.indent}func ${maker}() throws -> Any? {\n${lines.join('\n')}\n${this.indent}}`);
    return `${maker}()`;
  }

  private withFunction<T>(info: FnInfo, body: () => T): T {
    const outer = this.scope;
    this.scope = new Scope(outer, info);
    const saved = [this.targets, this.finallies, this.asyncCtx, this.plainLoops] as const;
    this.targets = [];
    this.finallies = [];
    this.asyncCtx = null;
    this.plainLoops = 0;
    try { return body(); } finally { this.scope = outer; [this.targets, this.finallies, this.asyncCtx, this.plainLoops] = saved; }
  }

  private nameText(n: ts.PropertyName): string {
    return ts.isComputedPropertyName(n) ? '' : ts.isPrivateIdentifier(n) ? n.text : propertyNameText(n);
  }

  private propertyKeyCode(n: ts.PropertyName): string {
    if (ts.isComputedPropertyName(n)) return `try ${this.expr(n.expression)}`;
    if (ts.isPrivateIdentifier(n)) return swiftString(this.privateKey(n));
    return swiftString(propertyNameText(n));
  }

  /** The object `super` reads from in the current method: its class's prototype, the class for a static one, or its object literal. */
  private homeObject(e: ts.Node): string {
    for (let s: Scope | null = this.scope; s; s = s.parent) {
      const fn = s.fn;
      if (fn.arrow) continue;
      fn.usesThis = true;
      if (fn.classVar) return fn.isStatic ? fn.classVar : `try jsGet(${fn.classVar}, "prototype")`;
      if (fn.homeVar) return fn.homeVar;
      break;
    }
    throw this.error(e, 'super outside a method');
  }

  private superCall(call: ts.CallExpression): string {
    let fn: FnInfo | null = null;
    for (let s: Scope | null = this.scope; s; s = s.parent) if (!s.fn.arrow) { fn = s.fn; break; }
    if (!fn?.isConstructor || !fn.derived) throw this.error(call, 'super() outside a derived constructor');
    return `jsSuperConstruct(${fn.classVar}, ${fn.newTarget}, ${this.argList(call.arguments)})`;
  }
}

// ---- Helpers

function list(d: ts.VariableDeclaration): 'var' | 'let' | 'const' {
  const flags = (d.parent as ts.VariableDeclarationList).flags;
  return flags & ts.NodeFlags.Const ? 'const' : flags & ts.NodeFlags.Let ? 'let' : 'var';
}

/** The names `var` declares in a function body, outside nested functions. */
function varNames(statements: ts.Statement[]): string[] {
  const out: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isFunctionLike(n) || ts.isClassLike(n)) return;
    if (ts.isVariableDeclarationList(n) && !(n.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const))) for (const d of n.declarations) out.push(...boundNames(d.name));
    ts.forEachChild(n, visit);
  };
  for (const s of statements) visit(s);
  return out;
}

/** The `let`, `const`, `class` and catch bindings anywhere in a body outside nested functions. */
function lexicalNamesDeep(statements: ts.Statement[]): string[] {
  const out: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isFunctionLike(n) || ts.isClassExpression(n)) return;
    if (ts.isVariableDeclarationList(n) && n.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)) for (const d of n.declarations) out.push(...boundNames(d.name));
    if (ts.isClassDeclaration(n) && n.name) { out.push(n.name.text); return; }
    if (ts.isCatchClause(n) && n.variableDeclaration) out.push(...boundNames(n.variableDeclaration.name));
    ts.forEachChild(n, visit);
  };
  for (const s of statements) visit(s);
  return out;
}

/** Whether a statement makes a function or class that may capture the loop's bindings. */
function capturesIn(n: ts.Node): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found) return;
    if (ts.isFunctionLike(c) || ts.isClassLike(c)) { found = true; return; }
    ts.forEachChild(c, visit);
  };
  visit(n);
  return found;
}

function hasDefault(s: ts.Statement): boolean {
  return ts.canHaveModifiers(s) && (ts.getModifiers(s) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
}

function isStatic(m: ts.ClassElement): boolean {
  return ts.canHaveModifiers(m) && (ts.getModifiers(m) ?? []).some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

function isDirective(s: ts.ExpressionStatement): boolean {
  const list = (s.parent as ts.SourceFile | ts.Block).statements;
  for (const st of list) {
    if (st === s) return true;
    if (!ts.isExpressionStatement(st) || !ts.isStringLiteral(st.expression)) return false;
  }
  return false;
}

function usesSuper(n: ts.Node): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found) return;
    if (c.kind === ts.SyntaxKind.SuperKeyword) { found = true; return; }
    if (ts.isFunctionExpression(c) || ts.isFunctionDeclaration(c) || ts.isClassLike(c)) return;
    ts.forEachChild(c, visit);
  };
  ts.forEachChild(n, visit);
  return found || ts.isMethodDeclaration(n) || ts.isAccessor(n);
}

function isOptionalChainRoot(e: ts.Expression): boolean {
  if (!(e.flags & ts.NodeFlags.OptionalChain)) return false;
  const p = e.parent;
  return !((ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p) || ts.isCallExpression(p)) && p.expression === e && p.flags & ts.NodeFlags.OptionalChain);
}

function skipParens(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  return e;
}

function propertyNameText(n: ts.PropertyName): string {
  if (ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) return n.text;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isNumericLiteral(n)) return String(Number(n.text.replace(/_/g, '')));
  if (ts.isBigIntLiteral(n)) return n.text.replace(/n$/, '');
  return n.getText();
}

/** A function's `length`: its parameters before the first with a default or a rest. */
function arity(fn: ts.SignatureDeclarationBase): number {
  let n = 0;
  for (const p of fn.parameters) {
    if (p.initializer || p.dotDotDotToken) break;
    n++;
  }
  return n;
}

/** A JavaScript identifier as part of a Swift one. */
export function safe(name: string): string {
  return name.replace(/\$/g, '_S').replace(/[^\w]/g, (ch) => `_u${ch.charCodeAt(0).toString(16)}`).replace(/^(?=\d)/, '_');
}

function numberLiteral(text: string): string {
  const clean = text.replace(/_/g, '');
  const v = /^0[0-7]+$/.test(clean) ? parseInt(clean, 8) : Number(clean);
  if (Number.isNaN(v)) return 'Double.nan';
  if (!Number.isFinite(v)) return 'Double.infinity';
  if (Number.isInteger(v) && Math.abs(v) < 2 ** 53) return `${v}.0`;
  const s = String(v);
  return /[.e]/.test(s) ? s : `${s}.0`;
}

void containsAwait;
