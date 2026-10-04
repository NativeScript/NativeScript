import ts from 'typescript';

/**
 * TypeScript to Kotlin, typed by the checker. JavaScript's semantics are kept
 * where Kotlin's differ: numbers are Double, `+` with a string concatenates
 * the way JavaScript prints numbers, conditions test truthiness, and calls
 * drop arguments a function does not take. Arrays are read-only `List`s that
 * a mutation replaces, as the Swift target's value arrays behave.
 */

const KEYWORDS = new Set(['as', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if', 'in', 'interface', 'is', 'null', 'object', 'package', 'return', 'super', 'this', 'throw', 'true', 'try', 'typealias', 'typeof', 'val', 'var', 'when', 'while']);

export function ident(name: string): string {
  const n = name.startsWith('$') ? '_' + name.slice(1) : name;
  return KEYWORDS.has(n) ? `\`${n}\`` : n;
}

export function kotlinString(text: string): string {
  return '"' + escape(text) + '"';
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

export interface ComponentInfo {
  name: string;
  props: string[];
}

const VALUE_TYPES = ['Double', 'String', 'Boolean', 'Any?', 'Unit'];

export class Translator {
  /** The component class being translated: its props read as `this.<prop>.value`. */
  private props = new Set<string>();
  /** Named types translated code uses: an interface becomes a class only if something does. */
  readonly used = new Set<string>();
  private interfaces = new Map<string, { file: string; code: () => string }>();
  /** Angular `computed()` fields, translated as getters: `this.total()` reads `this.total`. */
  private computed = new Set<string>();
  private indent = '';
  private tmp = 0;

  private checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>) {
    this.checker = checker;
    this.components = components;
  }

  // ---- Types -----------------------------------------------------------------------------

  type(t: ts.Type, where?: ts.Node): string {
    const c = this.checker;
    if (t.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral)) return 'Double';
    if (t.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral | ts.TypeFlags.TemplateLiteral)) return 'String';
    if (t.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) return 'Boolean';
    if (t.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined)) return 'Unit';
    if (t.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return 'Any?';
    if (t.flags & ts.TypeFlags.Never) return 'Nothing';
    if (t.isUnion()) {
      const parts = t.types.filter((u) => !(u.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
      const optional = parts.length < t.types.length;
      const kinds = [...new Set(parts.map((u) => this.type(u, where)))];
      const base = kinds.length === 1 ? kinds[0] : 'Any?';
      return optional && !base.endsWith('?') ? `${base}?` : base;
    }
    if (c.isArrayType(t)) {
      const [el] = c.getTypeArguments(t as ts.TypeReference);
      return `List<${this.type(el, where)}>`;
    }
    const sym = t.aliasSymbol ?? t.getSymbol();
    const name = sym?.getName();
    if (name === 'Sig' || name === 'Ref') {
      const arg = (t.aliasTypeArguments ?? c.getTypeArguments(t as ts.TypeReference))[0];
      return `Signal<${this.type(arg, where)}>`;
    }
    if (name === 'EventData') return 'EventData';
    const args = () => t.aliasTypeArguments ?? c.getTypeArguments(t as ts.TypeReference);
    if (name === 'WritableSignal' || name === 'InputSignal' || name === 'Writable') return `Signal<${this.type(args()[0], where)}>`;
    if (name === 'Signal') return this.type(args()[0], where);
    if (name === 'OutputEmitterRef') return `Emitter<${this.type(args()[0], where)}>`;
    if (name === 'RouterExtensions') return 'Router';
    const index = t.getStringIndexType();
    if (index && !t.getProperties().length) return `Map<String, ${this.type(index, where)}>`;
    const calls = t.getCallSignatures();
    if (calls.length) {
      const s = calls[0];
      const params = s.getParameters().map((p) => this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where));
      return `(${params.join(', ')}) -> ${this.type(s.getReturnType(), where)}`;
    }
    if (name && name !== '__type' && name !== '__object') { this.used.add(name); return name; }
    // An inline object type in this subset is an event's data (`args: { value: boolean }`).
    return 'EventData';
  }

  typeOf(n: ts.Node): string {
    return this.type(this.checker.getTypeAtLocation(n), n);
  }

  private isString(n: ts.Node) { return this.typeOf(n) === 'String'; }
  private isBool(n: ts.Node) { return this.typeOf(n) === 'Boolean'; }
  private isArray(n: ts.Node) { return this.checker.isArrayType(this.checker.getNonNullableType(this.checker.getTypeAtLocation(n))); }
  private isObjectRef(n: ts.Node) {
    const t = this.typeOf(n).replace(/\?$/, '');
    return !VALUE_TYPES.includes(t) && t !== 'Any' && !t.startsWith('List<') && !t.startsWith('Map<');
  }
  private elementType(target: ts.Expression): string {
    const [el] = this.checker.getTypeArguments(this.checker.getNonNullableType(this.checker.getTypeAtLocation(target)) as ts.TypeReference);
    return this.type(el, target);
  }

  // ---- Modules -------------------------------------------------------------------------------

  module(sf: ts.SourceFile): string {
    this.props = new Set();
    const out: string[] = [];
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) continue;
      if (ts.isInterfaceDeclaration(st)) { const m = st.members; this.interfaces.set(st.name.text, { file: sf.fileName, code: () => this.interfaceClass(st.name.text, m) }); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { const m = st.type.members; this.interfaces.set(st.name.text, { file: sf.fileName, code: () => this.interfaceClass(st.name.text, m) }); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isFunctionDeclaration(st) && st.name) { out.push(this.func(st, ident(st.name.text))); continue; }
      if (ts.isVariableStatement(st)) {
        const mutable = !(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          const name = (d.name as ts.Identifier).text;
          // A field, not a getter: `val state` would otherwise clash with a function `getState()` on the JVM.
          out.push(`@JvmField ${mutable || this.mutatedLater(d, sf) ? 'var' : 'val'} ${ident(name)}: ${this.typeOf(d.name)} = ${this.expr(d.initializer!)}`);
        }
        continue;
      }
      if (ts.isClassDeclaration(st)) {
        // Components are translated with their templates; other classes are services and models.
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component'));
        if (!component && st.name) out.push(this.plainClass(st));
        continue;
      }
      throw this.error(st, 'top-level statement');
    }
    return out.join('\n\n') + '\n';
  }

  /** The classes for a module's interfaces that translated code used; call after translating everything. */
  interfacesOf(file: string): string {
    let out = '';
    let more = true;
    const emitted = new Set<string>();
    // An interface's own fields can use another one.
    while (more) {
      more = false;
      for (const [name, decl] of this.interfaces) {
        if (decl.file !== file || emitted.has(name) || !this.used.has(name)) continue;
        out = decl.code() + '\n\n' + out;
        emitted.add(name);
        more = true;
      }
    }
    return out;
  }

  private interfaceClass(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: ident((m.name as ts.Identifier).text), type: m.questionToken && !t.endsWith('?') ? `${t}?` : t };
    });
    return [`class ${name}(`, ...fields.map((f) => `    var ${f.name}: ${f.type}${f.type.endsWith('?') ? ' = null' : ''},`), ')'].join('\n');
  }

  private func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string): string {
    const sig = this.checker.getSignatureFromDeclaration(fn)!;
    const ret = this.type(sig.getReturnType(), fn);
    return `fun ${name}(${this.params(fn)})${ret === 'Unit' ? '' : `: ${ret}`} ${this.block(fn.body!, this.indent)}`;
  }

  private params(fn: ts.SignatureDeclaration): string {
    return fn.parameters.map((p) => `${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)}`).join(', ');
  }

  // ---- Component classes ----------------------------------------------------------------------

  /** The class's members; the caller adds `render()`. Returns the constructor parameters and the lines inside the class. */
  componentMembers(cls: ts.ClassDeclaration, props: string[]): { params: string[]; lines: string[] } {
    this.props = new Set(props);
    this.computed = new Set(cls.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && this.calleeName(m.initializer) === 'computed').map((m) => (m.name as ts.Identifier).text));
    const lines: string[] = [];
    const params: string[] = [];
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m)) {
        const name = (m.name as ts.Identifier).text;
        const callee = m.initializer ? this.calleeName(m.initializer) : '';
        if (callee === 'input' || callee === 'input.required') {
          // An Angular input is a prop: a signal the parent writes.
          const t = this.typeOf(m.name).replace(/^Signal<(.*)>$/, '$1');
          const given = (m.initializer as ts.CallExpression).arguments[0];
          params.push(`${ident(name)}: ${t}${given ? ` = ${this.expr(given)}` : ''}`);
          lines.push(`    val ${ident(name)}: Signal<${t}> = Signal(${ident(name)})`);
          continue;
        }
        if (callee === 'computed') {
          const fn = (m.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
          const t = this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
          lines.push(`    val ${ident(name)}: ${t}`, `        get() ${this.functionBody(fn, t, '        ')}`);
          continue;
        }
        const t = this.typeOf(m.name);
        if (!m.initializer) {
          params.push(`${ident(name)}: ${t}`);
          lines.push(`    val ${ident(name)}: Signal<${t}> = Signal(${ident(name)})`);
          continue;
        }
        lines.push(`    val ${ident(name)}: ${t} = ${this.expr(m.initializer)}`);
        continue;
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const t = this.type(this.checker.getSignatureFromDeclaration(m)!.getReturnType(), m);
        this.indent = '        ';
        lines.push(`    val ${ident((m.name as ts.Identifier).text)}: ${t}`, `        get() ${this.block(m.body!, '        ')}`);
        this.indent = '';
        continue;
      }
      if (ts.isMethodDeclaration(m)) {
        this.indent = '    ';
        lines.push('    ' + this.func(m, ident((m.name as ts.Identifier).text)));
        this.indent = '';
        continue;
      }
    }
    return { params, lines };
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  /** A class that is not a component (an `@Injectable` service, a model): its members, and `shared` for a service. */
  private plainClass(cls: ts.ClassDeclaration): string {
    const name = cls.name!.text;
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    const { params, lines } = this.componentMembers(cls, []);
    const companion = service ? ['', '    companion object {', `        val shared = ${name}()`, '    }'] : [];
    return [`class ${name}(${params.join(', ')}) {`, ...lines, ...companion, '}'].join('\n');
  }

  // ---- Statements --------------------------------------------------------------------------------

  block(b: ts.Block | ts.Statement, base = ''): string {
    const saved = this.indent;
    this.indent = base + '    ';
    const statements = ts.isBlock(b) ? [...b.statements] : [b];
    const body = statements.map((s) => this.stmt(s)).filter(Boolean).join('\n');
    this.indent = saved;
    return `{\n${body}\n${base}}`;
  }

  private stmt(s: ts.Statement): string {
    const i = this.indent;
    if (ts.isExpressionStatement(s)) return i + this.exprStatement(s.expression);
    if (ts.isReturnStatement(s)) return i + (s.expression ? `return ${this.expr(s.expression)}` : 'return');
    if (ts.isIfStatement(s)) {
      let out = `${i}if (${this.cond(s.expression)}) ${this.block(s.thenStatement, i)}`;
      if (s.elseStatement) out += ts.isIfStatement(s.elseStatement) ? ` else ${this.stmt(s.elseStatement).trimStart()}` : ` else ${this.block(s.elseStatement, i)}`;
      return out;
    }
    if (ts.isVariableStatement(s)) {
      const constant = !!(s.declarationList.flags & ts.NodeFlags.Const);
      return s.declarationList.declarations.map((d) => {
        const name = ident((d.name as ts.Identifier).text);
        // A const array that is pushed to is a var here, where a push replaces the list.
        const mutated = constant && this.mutatedLater(d, s);
        return `${i}${constant && !mutated ? 'val' : 'var'} ${name}: ${this.typeOf(d.name)}${d.initializer ? ` = ${this.expr(d.initializer)}` : ''}`;
      }).join('\n');
    }
    if (ts.isForOfStatement(s)) {
      const decl = (s.initializer as ts.VariableDeclarationList).declarations[0];
      return `${i}for (${ident((decl.name as ts.Identifier).text)} in ${this.expr(s.expression)}) ${this.block(s.statement, i)}`;
    }
    if (ts.isForStatement(s)) {
      const init = s.initializer && ts.isVariableDeclarationList(s.initializer)
        ? s.initializer.declarations.map((d) => `${i}var ${ident((d.name as ts.Identifier).text)}: ${this.typeOf(d.name)} = ${this.expr(d.initializer!)}`).join('\n')
        : s.initializer ? i + this.exprStatement(s.initializer as ts.Expression) : '';
      const body = this.block(s.statement, i).replace(/\n\s*}$/, '');
      const step = s.incrementor ? `\n${i}    ${this.exprStatement(s.incrementor)}` : '';
      return `${init}\n${i}while (${s.condition ? this.cond(s.condition) : 'true'}) ${body}${step}\n${i}}`;
    }
    if (ts.isWhileStatement(s)) return `${i}while (${this.cond(s.expression)}) ${this.block(s.statement, i)}`;
    if (ts.isBreakStatement(s)) return i + 'break';
    if (ts.isContinueStatement(s)) return i + 'continue';
    if (ts.isBlock(s)) return `${i}run ${this.block(s, i)}`;
    if (ts.isEmptyStatement(s)) return '';
    if (ts.isSwitchStatement(s)) {
      const lines = [`${i}when (${this.expr(s.expression)}) {`];
      for (const c of s.caseBlock.clauses) {
        const saved = this.indent;
        this.indent = i + '        ';
        const body = c.statements.filter((x) => !ts.isBreakStatement(x)).map((x) => this.stmt(x));
        this.indent = saved;
        lines.push(`${i}    ${ts.isCaseClause(c) ? this.expr(c.expression) : 'else'} -> {`, ...body, `${i}    }`);
      }
      lines.push(`${i}}`);
      return lines.join('\n');
    }
    throw this.error(s, 'statement');
  }

  private mutatedLater(d: ts.VariableDeclaration, scope: ts.Node): boolean {
    const name = (d.name as ts.Identifier).text;
    let found = false;
    const visit = (n: ts.Node) => {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ts.isIdentifier(n.expression.expression) && n.expression.expression.text === name && ['push', 'pop', 'splice', 'sort', 'reverse', 'shift', 'unshift'].includes(n.expression.name.text)) found = true;
      ts.forEachChild(n, visit);
    };
    visit(scope.parent ?? scope);
    return found;
  }

  private exprStatement(e: ts.Expression): string {
    if (ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) {
      if (e.operator === ts.SyntaxKind.PlusPlusToken) return `${this.expr(e.operand)} += 1`;
      if (e.operator === ts.SyntaxKind.MinusMinusToken) return `${this.expr(e.operand)} -= 1`;
    }
    return this.expr(e);
  }

  /** An untyped value (`any`, an event's value) where Kotlin needs the slot's type. */
  coerce(e: ts.Expression, target: string): string {
    const code = this.expr(e);
    return this.typeOf(e) === 'Any?' && target !== 'Any?' && target !== 'Unit' ? `(${code} as ${target})` : code;
  }

  /** A condition: Kotlin needs a Boolean where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    return this.isBool(e) ? this.expr(e) : `jsTruthy(${this.expr(e)})`;
  }

  // ---- Expressions -----------------------------------------------------------------------------

  expr(e: ts.Expression): string {
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    if (ts.isNumericLiteral(e)) return this.number(e.text);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return kotlinString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (e.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (e.kind === ts.SyntaxKind.NullKeyword) return 'null';
    if (e.kind === ts.SyntaxKind.ThisKeyword) return 'this';
    if (ts.isIdentifier(e)) return e.text === 'undefined' ? 'null' : ident(e.text);
    if (ts.isTemplateExpression(e)) {
      let out = escape(e.head.text);
      for (const span of e.templateSpans) out += `\${${this.str(span.expression)}}` + escape(span.literal.text);
      return `"${out}"`;
    }
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) {
      const from = this.typeOf(e.expression);
      const to = this.typeOf(e);
      return from === 'Any?' && to !== 'Any?' ? `(${this.expr(e.expression)} as ${to})` : this.expr(e.expression);
    }
    if (ts.isNonNullExpression(e)) return `${this.expr(e.expression)}!!`;
    if (ts.isPropertyAccessExpression(e)) return this.property(e);
    if (ts.isElementAccessExpression(e)) {
      if (this.isString(e.expression)) return `jsCharAt(${this.expr(e.expression)}, ${this.expr(e.argumentExpression)})`;
      if (this.typeOf(e.expression).startsWith('Map<')) {
        // A missing key is undefined in JavaScript; its declared type here is the value type.
        const t = this.typeOf(e);
        return `(${this.expr(e.expression)}[${this.expr(e.argumentExpression)}]${t === 'String' ? ' ?: ""' : t === 'Double' ? ' ?: 0.0' : ''})`;
      }
      return `${this.expr(e.expression)}[(${this.expr(e.argumentExpression)}).toInt()]`;
    }
    if (ts.isCallExpression(e)) return this.call(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) {
      if (e.operator === ts.SyntaxKind.ExclamationToken) return this.isBool(e.operand) ? `!${this.expr(e.operand)}` : `!jsTruthy(${this.expr(e.operand)})`;
      if (e.operator === ts.SyntaxKind.MinusToken) return `-${this.expr(e.operand)}`;
      if (e.operator === ts.SyntaxKind.PlusToken) return this.expr(e.operand);
      throw this.error(e, 'prefix operator');
    }
    if (ts.isConditionalExpression(e)) return `(if (${this.cond(e.condition)}) ${this.expr(e.whenTrue)} else ${this.expr(e.whenFalse)})`;
    if (ts.isArrayLiteralExpression(e)) return this.array(e);
    if (ts.isObjectLiteralExpression(e)) return this.object(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e);
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && !(e.arguments?.length)) return `${e.expression.text}()`;
    throw this.error(e, 'expression');
  }

  /** Every number is a Double. */
  private number(text: string): string {
    const n = Number(text.replace(/_/g, ''));
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return `${n}.0`;
    return String(n).replace(/e\+?/, 'e');
  }

  /** A value as JavaScript would print it inside a string. */
  str(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'String') return this.expr(e);
    if (t === 'Double' || t === 'Boolean') return `js(${this.expr(e)})`;
    return `${this.expr(e)}.toString()`;
  }

  private property(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    if (target.kind === ts.SyntaxKind.ThisKeyword && this.props.has(name)) return `this.${ident(name)}.value`;
    if (ts.isIdentifier(target) && target.text === 'Math') {
      if (name === 'PI') return 'Math.PI';
      throw this.error(e, `Math.${name}`);
    }
    const dot = e.questionDotToken ? '?.' : '.';
    if (name === 'length' && (this.isArray(target) || this.isString(target))) {
      const n = this.isString(target) ? 'length' : 'size';
      return e.questionDotToken ? `${this.expr(target)}?.${n}?.toDouble()` : `${this.expr(target)}.${n}.toDouble()`;
    }
    const base = this.typeOf(target);
    // An event's data: the value's type is the one the handler declared.
    if (base === 'EventData' && name === 'value') {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.value` : `(${this.expr(target)}.value as ${t})`;
    }
    // A method used as a value is a bound reference in Kotlin.
    const symbol = this.checker.getSymbolAtLocation(e.name);
    const called = ts.isCallExpression(e.parent) && e.parent.expression === e;
    if (symbol && symbol.flags & ts.SymbolFlags.Method && !called) return `${this.expr(target)}::${ident(name)}`;
    return `${this.expr(target)}${dot}${ident(name)}`;
  }

  private args(e: ts.CallExpression, count?: number): string[] {
    const list = count === undefined ? e.arguments : e.arguments.slice(0, count);
    const params = this.checker.getResolvedSignature(e)?.getParameters() ?? [];
    return list.map((a, i) => (params[i] ? this.coerce(a, this.type(this.checker.getTypeOfSymbolAtLocation(params[i], e), e)) : this.expr(a)));
  }

  /** How many parameters the called function declares (JavaScript ignores extra arguments). */
  private arity(e: ts.CallExpression): number | undefined {
    const sig = this.checker.getResolvedSignature(e);
    const decl = sig?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl)) return undefined;
    if (decl.parameters.some((p) => p.dotDotDotToken)) return undefined;
    return decl.parameters.length;
  }

  private call(e: ts.CallExpression): string {
    const callee = e.expression;
    // Reading a callable signal (Angular, Solid) (`count()`, an input, a computed field).
    if (!e.arguments.length && ['WritableSignal', 'InputSignal', 'Signal'].includes(this.symbolName(callee))) {
      if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.computed.has(callee.name.text)) return `this.${ident(callee.name.text)}`;
      if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.props.has(callee.name.text)) return `this.${ident(callee.name.text)}.value`;
      return this.symbolName(callee) === 'Signal' ? this.expr(callee) : `${this.expr(callee)}.value`;
    }
    if (ts.isIdentifier(callee)) {
      const name = callee.text;
      if (name === 'get' && e.arguments.length === 1 && this.symbolName(e.arguments[0]) === 'Writable') return `${this.expr(e.arguments[0])}.value`;
      if (name === 'navigate' && e.arguments[0] && ts.isObjectLiteralExpression(e.arguments[0])) return this.navigate(e);
      if (name === '$signal' || name === 'ref' || name === 'signal' || name === 'writable' || name === '$writable') return `Signal<${this.typeOf(e).replace(/^Signal<(.*)>$/, '$1')}>(${this.expr(e.arguments[0])})`;
      if (name === 'output') return `${this.typeOf(e)}()`;
      if (name === 'inject') {
        const token = (e.arguments[0] as ts.Identifier).text;
        if (token === 'RouterExtensions') return 'Router.shared';
        if (token === 'ActivatedRoute') return 'ActivatedRoute.current';
        return `${token}.shared`;
      }
      if (name === '$navigateTo') return this.navigate(e);
      if (name === 'String') return this.str(e.arguments[0]);
      if (name === 'Number' || name === 'parseInt') return this.isString(e.arguments[0]) ? `jsNumber(${this.expr(e.arguments[0])})` : this.expr(e.arguments[0]);
      return `${ident(name)}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    // A callback passed as a prop (`onTap: () => void`).
    if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.props.has(callee.name.text)) {
      return `this.${ident(callee.name.text)}.value(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      const target = callee.expression;
      const owner = this.symbolName(target);
      const signalValue = () => this.typeOf(target).replace(/^Signal<(.*)>$/, '$1');
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'set') return `${this.expr(target)}.value = ${this.coerce(e.arguments[0], signalValue())}`;
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'update') return `${this.expr(target)}.update(${this.closure(e.arguments[0] as ts.ArrowFunction)})`;
      if (owner === 'WritableSignal' && method === '$write') {
        // Solid's setter: a function updates, anything else is the new value.
        const a = e.arguments[0];
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return `${this.expr(target)}.update(${this.closure(a)})`;
        return `${this.expr(target)}.value = ${this.coerce(a, signalValue())}`;
      }
      if (owner === 'OutputEmitterRef' && method === 'emit') return `${this.expr(target)}.emit(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      if (ts.isIdentifier(target) && target.text === 'Math') return this.math(method, e);
      if (ts.isIdentifier(target) && target.text === 'console') return `println(${e.arguments.map((a) => this.str(a)).join(' + " " + ')})`;
      if (this.isArray(target)) return this.arrayMethod(method, target, e);
      if (this.isString(target)) return this.stringMethod(method, target, e);
      if (this.typeOf(target) === 'Double' && method === 'toFixed') return `jsToFixed(${this.expr(target)}${e.arguments[0] ? `, ${this.expr(e.arguments[0])}` : ''})`;
      return `${this.expr(target)}${callee.questionDotToken ? '?' : ''}.${ident(method)}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isParenthesizedExpression(callee)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    throw this.error(e, 'call');
  }

  private symbolName(e: ts.Expression): string {
    const t = this.checker.getTypeAtLocation(e);
    return (t.aliasSymbol ?? t.getSymbol())?.getName() ?? '';
  }

  private navigate(e: ts.CallExpression): string {
    // `$navigateTo(Page, { props })` (Vue) or `navigate({ page: Page, props })` (Svelte).
    const first = e.arguments[0];
    const svelte = ts.isObjectLiteralExpression(first);
    const pageProp = svelte ? first.properties.find((p) => p.name && (p.name as ts.Identifier).text === 'page') : undefined;
    const component = svelte ? ((pageProp as ts.PropertyAssignment).initializer as ts.Identifier).text : (first as ts.Identifier).text;
    const info = this.components.get(component);
    if (!info) throw this.error(e, `navigation to ${component}: not a component`);
    const options = svelte ? first : e.arguments[1];
    const given = new Map<string, string>();
    if (options && ts.isObjectLiteralExpression(options)) {
      const props = options.properties.find((p) => p.name && (p.name as ts.Identifier).text === 'props');
      if (props && ts.isPropertyAssignment(props) && ts.isObjectLiteralExpression(props.initializer)) {
        for (const p of props.initializer.properties) {
          if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, ident(p.name.text));
          else if (ts.isPropertyAssignment(p)) given.set((p.name as ts.Identifier).text, this.expr(p.initializer));
        }
      }
    }
    const args = info.props.map((p) => `${ident(p)} = ${given.get(p) ?? 'null'}`).join(', ');
    return `Frame.topmost?.navigate { ${component}(${args}).render() }`;
  }

  private math(name: string, e: ts.CallExpression): string {
    const a = this.args(e);
    switch (name) {
      case 'round': return `jsRound(${a[0]})`;
      case 'floor': return `Math.floor(${a[0]})`;
      case 'ceil': return `Math.ceil(${a[0]})`;
      case 'abs': return `Math.abs(${a[0]})`;
      case 'sqrt': return `Math.sqrt(${a[0]})`;
      case 'pow': return `Math.pow(${a[0]}, ${a[1]})`;
      case 'min': return a.length === 1 ? a[0] : `minOf(${a.join(', ')})`;
      case 'max': return a.length === 1 ? a[0] : `maxOf(${a.join(', ')})`;
      case 'random': return 'Math.random()';
    }
    throw this.error(e, `Math.${name}`);
  }

  private arrayMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const el = this.elementType(target);
    const fn = (i = 0) => this.closure(e.arguments[i] as ts.ArrowFunction, [el]);
    switch (name) {
      case 'filter': return `${t}.filter(${fn()})`;
      case 'map': return `${t}.map(${fn()})`;
      case 'find': return `${t}.firstOrNull(${fn()})`;
      case 'findIndex': return `${t}.indexOfFirst(${fn()}).toDouble()`;
      case 'some': return `${t}.any(${fn()})`;
      case 'every': return `${t}.all(${fn()})`;
      case 'forEach': return `${t}.forEach(${fn()})`;
      case 'includes': return `${t}.contains(${this.expr(e.arguments[0])})`;
      case 'indexOf': return `${t}.indexOf(${this.expr(e.arguments[0])}).toDouble()`;
      case 'join': return `${t}.joinToString(${e.arguments[0] ? this.expr(e.arguments[0]) : '","'}) { ${el === 'String' ? 'it' : el === 'Double' || el === 'Boolean' ? 'js(it)' : 'it.toString()'} }`;
      case 'slice': return `jsSlice(${t}${e.arguments.map((a) => `, ${this.expr(a)}`).join('')})`;
      case 'concat': return `(${[t, ...e.arguments.map((a) => (this.isArray(a) ? this.expr(a) : `listOf(${this.expr(a)})`))].join(' + ')})`;
      case 'push': return `${t} += listOf(${this.args(e).join(', ')})`;
      case 'reverse': return `${t}.reversed()`;
      case 'reduce': {
        const acc = this.typeOf(e.arguments[1]);
        return `${t}.fold(${this.expr(e.arguments[1])}, ${this.closure(e.arguments[0] as ts.ArrowFunction, [acc, el])})`;
      }
      case 'sort': return e.arguments[0]
        ? `${t}.sortedWith { a, b -> (${this.closure(e.arguments[0] as ts.ArrowFunction, [el, el])})(a, b).let { if (it < 0) -1 else if (it > 0) 1 else 0 } }`
        : `${t}.sortedBy { ${el === 'String' ? 'it' : 'js(it)'} }`;
    }
    throw this.error(e, `Array.${name}`);
  }

  private stringMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const a = this.args(e);
    switch (name) {
      case 'toLowerCase': return `${t}.lowercase()`;
      case 'toUpperCase': return `${t}.uppercase()`;
      case 'includes': return `jsIncludes(${t}, ${a[0]})`;
      case 'startsWith': return `${t}.startsWith(${a[0]})`;
      case 'endsWith': return `${t}.endsWith(${a[0]})`;
      case 'trim': return `${t}.trim()`;
      case 'split': return `${t}.split(${a[0]})`;
      case 'indexOf': return `jsIndexOf(${t}, ${a[0]})`;
      case 'slice': case 'substring': return `jsSlice(${t}${a.map((x) => `, ${x}`).join('')})`;
      case 'replace': return `jsReplace(${t}, ${a[0]}, ${a[1]})`;
      case 'charAt': return `jsCharAt(${t}, ${a[0]})`;
      case 'repeat': return `${t}.repeat((${a[0]}).toInt())`;
      case 'padStart': return `jsPadStart(${t}, ${a[0]}${a[1] ? `, ${a[1]}` : ''})`;
    }
    throw this.error(e, `String.${name}`);
  }

  private binary(e: ts.BinaryExpression): string {
    const op = e.operatorToken.kind;
    const K = ts.SyntaxKind;
    const l = () => this.expr(e.left);
    const r = () => this.expr(e.right);
    switch (op) {
      case K.EqualsToken: return `${l()} = ${this.coerce(e.right, this.typeOf(e.left))}`;
      case K.PlusEqualsToken: return this.isString(e.left) ? `${l()} += ${this.str(e.right)}` : `${l()} += ${r()}`;
      case K.MinusEqualsToken: return `${l()} -= ${r()}`;
      case K.AsteriskEqualsToken: return `${l()} *= ${r()}`;
      case K.SlashEqualsToken: return `${l()} /= ${r()}`;
      case K.PlusToken:
        if (this.isString(e.left) || this.isString(e.right)) return `${this.str(e.left)} + ${this.str(e.right)}`;
        return `${l()} + ${r()}`;
      case K.MinusToken: return `${l()} - ${r()}`;
      case K.AsteriskToken: return `${l()} * ${r()}`;
      case K.SlashToken: return `${l()} / ${r()}`;
      case K.PercentToken: return `${l()} % ${r()}`;
      case K.EqualsEqualsEqualsToken: case K.EqualsEqualsToken:
        return this.isObjectRef(e.left) && this.isObjectRef(e.right) ? `${l()} === ${r()}` : `${l()} == ${r()}`;
      case K.ExclamationEqualsEqualsToken: case K.ExclamationEqualsToken:
        return this.isObjectRef(e.left) && this.isObjectRef(e.right) ? `${l()} !== ${r()}` : `${l()} != ${r()}`;
      case K.LessThanToken: return `${l()} < ${r()}`;
      case K.GreaterThanToken: return `${l()} > ${r()}`;
      case K.LessThanEqualsToken: return `${l()} <= ${r()}`;
      case K.GreaterThanEqualsToken: return `${l()} >= ${r()}`;
      case K.QuestionQuestionToken: return `(${l()} ?: ${r()})`;
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        if (this.isBool(e.left) && this.isBool(e.right)) return `${l()} ${sym} ${r()}`;
        // JavaScript returns an operand, not a Boolean.
        const v = `__v${this.tmp++}`;
        return op === K.BarBarToken ? `run { val ${v} = ${l()}; if (jsTruthy(${v})) ${v} else ${r()} }` : `run { val ${v} = ${l()}; if (jsTruthy(${v})) ${r()} else ${v} }`;
      }
    }
    throw this.error(e, `operator ${ts.tokenToString(op)}`);
  }

  private array(e: ts.ArrayLiteralExpression): string {
    if (!e.elements.length) {
      // `[]` alone is never[]; its element type comes from where it goes.
      const context = this.checker.getContextualType(e);
      const t = context ? this.type(context, e) : this.typeOf(e);
      return `listOf<${/^List<(.*)>\??$/.exec(t)?.[1] ?? 'Any?'}>()`;
    }
    const parts: string[] = [];
    let run: string[] = [];
    for (const el of e.elements) {
      if (ts.isSpreadElement(el)) {
        if (run.length) { parts.push(`listOf(${run.join(', ')})`); run = []; }
        parts.push(this.expr(el.expression));
      } else run.push(this.expr(el));
    }
    if (run.length) parts.push(`listOf(${run.join(', ')})`);
    return parts.length === 1 ? parts[0] : `(${parts.join(' + ')})`;
  }

  private object(e: ts.ObjectLiteralExpression): string {
    const type = this.checker.getContextualType(e) ?? this.checker.getTypeAtLocation(e);
    const name = this.type(type, e).replace(/\?$/, '');
    const sym = this.checker.getNonNullableType(type).getSymbol();
    const decl = sym?.declarations?.[0];
    const order = decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl)) ? decl.members.filter(ts.isPropertySignature).map((m) => (m.name as ts.Identifier).text) : null;
    if (!order) throw this.error(e, 'object literal without an interface type');
    const given: string[] = [];
    for (const p of e.properties) {
      if (ts.isPropertyAssignment(p)) given.push(`${ident((p.name as ts.Identifier).text)} = ${this.expr(p.initializer)}`);
      else if (ts.isShorthandPropertyAssignment(p)) given.push(`${ident(p.name.text)} = ${ident(p.name.text)}`);
      else throw this.error(p, 'object member');
    }
    return `${name}(${given.join(', ')})`;
  }

  /**
   * `(r) => r.id` as a Kotlin anonymous function, where `return` means what it
   * does in JavaScript. `expected` are the parameter types the Kotlin API
   * passes; a callback that declares fewer still takes them.
   */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression, expected?: string[]): string {
    const sig = this.checker.getSignatureFromDeclaration(fn)!;
    const ret = this.type(sig.getReturnType(), fn);
    const params = fn.parameters.map((p) => `${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)}`);
    if (expected && params.length > expected.length) throw this.error(fn, `a callback with ${params.length} parameters (the index is not supported here)`);
    if (expected) for (let k = params.length; k < expected.length; k++) params.push(`@Suppress("UNUSED_PARAMETER") __unused${k}: ${expected[k]}`);
    return `fun(${params.join(', ')})${ret === 'Unit' ? '' : `: ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  private functionBody(fn: ts.ArrowFunction | ts.FunctionExpression, ret: string, base: string): string {
    if (ts.isBlock(fn.body)) return this.block(fn.body, base);
    const value = ret === 'Boolean' && !this.isBool(fn.body) ? this.cond(fn.body) : this.expr(fn.body);
    return `{ ${ret === 'Unit' ? value : `return ${value}`} }`;
  }

  private error(n: ts.Node, what: string): Error {
    const sf = n.getSourceFile();
    const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
    return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${what} is not supported in a release build yet: ${n.getText().slice(0, 80)}`);
  }
}
