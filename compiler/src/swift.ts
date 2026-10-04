import ts from 'typescript';
import { Throws, isAsync, isStatic } from './throws.ts';
import { AsyncLowering, type AsyncCtx, type AsyncSyntax, type AsyncTranslator } from './async.ts';
import { CoreAPI } from './core.ts';
import { NativeAPI } from './native-calls.ts';

/**
 * TypeScript to Swift, typed by the checker, with JavaScript's semantics
 * where Swift's differ: numbers are Double and print as JavaScript prints
 * them, arrays, maps, sets and objects are references, `any` is `Any?`,
 * exceptions are Swift errors carrying the thrown value, and async functions
 * are continuations over spec-exact promises (async.ts). Anything outside
 * what is translated stops the build with its file, line and construct.
 */

const KEYWORDS = new Set([
  'in', 'default', 'repeat', 'where', 'func', 'var', 'let', 'struct', 'enum', 'protocol', 'extension', 'internal', 'operator', 'self', 'Self',
  'Type', 'is', 'as', 'guard', 'defer', 'subscript', 'init', 'deinit', 'inout', 'associatedtype', 'fallthrough', 'super', 'true', 'false',
  'nil', 'class', 'import', 'static', 'Any', 'Protocol', 'rethrows', 'throws', 'precedencegroup', 'fileprivate', 'open', 'some', 'any',
]);

export function ident(name: string): string {
  const n = name.replace(/^#/, '_p_').replace(/\$/g, '_');
  return KEYWORDS.has(n) ? `\`${n}\`` : n;
}

export function swiftString(text: string): string {
  return '"' + text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    .replace(/[\u0000-\u001f\u007f]/g, (ch) => `\\u{${ch.charCodeAt(0).toString(16)}}`) + '"';
}

/** `T?`, keeping an already optional type and parenthesizing a function type. */
export function optionalType(t: string): string {
  if (t.endsWith('?') || t.endsWith('!')) return t;
  return t.includes('->') ? `(${t})?` : `${t}?`;
}

const isFunctionType = (t: string) => t.includes('->') && !t.endsWith('?') && !t.startsWith('[') && !/^\w+</.test(t);

export interface ComponentInfo {
  name: string;
  props: string[];
}

const ERRORS: Record<string, string> = { Error: 'JSError', TypeError: 'JSTypeError', RangeError: 'JSRangeError', SyntaxError: 'JSSyntaxError', ReferenceError: 'JSReferenceError', AggregateError: 'JSAggregateError' };
const LIB_GLOBALS = new Set(['Math', 'JSON', 'Object', 'Array', 'Number', 'Promise', 'console', 'String', 'Boolean', 'Map', 'Set', 'Date']);

export class Translator implements AsyncTranslator {
  readonly syntax = SWIFT_SYNTAX;
  /** The component class being translated: its props read as `self.<prop>.value`. */
  props = new Set<string>();
  /** Named types translated code uses: an interface becomes a class only if something does. */
  readonly used = new Set<string>();
  private interfaces = new Map<string, { file: string; code: () => string }>();
  private shapes = new Map<string, { name: string; fields: { name: string; type: string }[] }>();
  private shaping = new Set<ts.Type>();
  /** Angular `computed()` fields, translated as getters: `this.total()` reads `self.total`. */
  private computed = new Set<string>();
  /** Variables initialized from an element read (`const r = xs[i]`): Swift optionals, unwrapped where they are used. */
  private undefinedVars = new Map<ts.Symbol, string>();
  /** Accessors for module-level variables a class member of the same name hides from Swift (`__global_fruits`). */
  private globalAliases = new Map<string, string>();
  /** App classes another app class extends: they stay open. */
  private extended = new Set<string>();
  /** Interfaces an app class implements: Swift protocols, with a class for their object literals. */
  private protocols = new Set<string>();
  indent = '';
  private tmp = 0;
  /** Expressions already evaluated into a Swift name (awaited values, operands read before an await). */
  readonly subst = new Map<ts.Node, string>();
  asyncCtx: AsyncCtx | null = null;
  /** Enclosing statements that own a plain `break` / `continue` inside a lowered async region. */
  private plainBreak = 0;
  private plainContinue = 0;
  private returnType = 'Void';
  /** A Promise executor's `resolve` parameter → its JSResolvers, so resolving with a promise adopts it. */
  private resolvers = new Map<ts.Symbol, { name: string; type: string }>();
  /** Template methods take their loop variables with defaults only so the checker can type them. */
  private templateParams = false;
  readonly throwsInfo: Throws;
  readonly sourceFiles: readonly ts.SourceFile[];
  private lowering: AsyncLowering;
  private core: CoreAPI;
  readonly native: NativeAPI;

  readonly checker: ts.TypeChecker;
  private components: Map<string, ComponentInfo>;

  constructor(checker: ts.TypeChecker, components: Map<string, ComponentInfo>, files: readonly ts.SourceFile[]) {
    this.checker = checker;
    this.components = components;
    this.sourceFiles = files;
    this.lowering = new AsyncLowering(this);
    this.core = new CoreAPI(this);
    this.native = new NativeAPI(this);
    this.throwsInfo = new Throws(checker, files, (n) => { try { return this.typeOf(n) === 'Any?'; } catch { return false; } });
    for (const f of files) {
      const visit = (n: ts.Node) => {
        if (ts.isClassLike(n)) {
          const base = n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
          if (base && ts.isIdentifier(base.expression)) this.extended.add(base.expression.text);
          for (const i of n.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) this.protocols.add(i.expression.getText());
        }
        ts.forEachChild(n, visit);
      };
      visit(f);
    }
  }

  fresh(prefix: string): string {
    return `${prefix}${this.tmp++}`;
  }

  nested<T>(body: () => T): T {
    const saved = this.indent;
    this.indent += '    ';
    try { return body(); } finally { this.indent = saved; }
  }

  withAsync<T>(ctx: AsyncCtx, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue] as const;
    this.asyncCtx = ctx;
    this.plainBreak = 0;
    this.plainContinue = 0;
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue] = saved; }
  }

  withLoweredLoop<T>(body: () => T): T {
    const saved = [this.plainBreak, this.plainContinue] as const;
    this.plainBreak = 0;
    this.plainContinue = 0;
    try { return body(); } finally { [this.plainBreak, this.plainContinue] = saved; }
  }

  /** Translates a function's body: no async region or loop of the enclosing function reaches into it. */
  private inFunction<T>(returnType: string, body: () => T): T {
    const saved = [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType] as const;
    this.asyncCtx = null;
    this.plainBreak = 0;
    this.plainContinue = 0;
    this.returnType = returnType;
    try { return body(); } finally { [this.asyncCtx, this.plainBreak, this.plainContinue, this.returnType] = saved; }
  }

  // ---- Types -----------------------------------------------------------------------------

  type(t: ts.Type, where?: ts.Node): string {
    const c = this.checker;
    const F = ts.TypeFlags;
    if (t.flags & F.EnumLike) {
      const native = this.native.type(t);
      if (native) return native;
    }
    if (t.flags & (F.Any | F.Unknown)) return 'Any?';
    if (t.flags & F.Never) return 'Never';
    if (t.flags & (F.Void | F.Undefined)) return 'Void';
    if (t.flags & F.Null) return 'Any?';
    if (t.flags & F.TypeParameter) return t.symbol?.name ?? 'Any?';
    if (t.isUnion()) {
      const parts = t.types.filter((u) => !(u.flags & (F.Undefined | F.Null | F.Void)));
      if (!parts.length) return 'Any?';
      const optional = parts.length < t.types.length;
      // A union with a type the build cannot translate (`string | RegExp`) reads as the parts it can.
      const translated = parts.flatMap((u) => { try { return [this.type(u, where)]; } catch { return []; } });
      if (!translated.length) return this.type(parts[0], where);
      const kinds = [...new Set(translated)];
      const base = kinds.length === 1 ? kinds[0] : 'Any?';
      return optional ? optionalType(base) : base;
    }
    if (t.flags & (F.Number | F.NumberLiteral)) return 'Double';
    if (t.flags & (F.String | F.StringLiteral | F.TemplateLiteral)) return 'String';
    if (t.flags & (F.Boolean | F.BooleanLiteral)) return 'Bool';
    if (t.flags & F.BigIntLike) return 'Double';
    if (c.isTupleType(t)) return `(${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')})`;
    if (c.isArrayType(t)) return `JSArray<${this.type(c.getTypeArguments(t as ts.TypeReference)[0], where)}>`;
    const sym = t.aliasSymbol ?? t.getSymbol();
    const name = sym?.getName();
    const args = () => t.aliasTypeArguments ?? c.getTypeArguments(t as ts.TypeReference);
    const arg = (k: number) => this.type(args()[k], where);
    switch (name) {
      case 'Sig': case 'Ref': case 'VueRef': case 'WritableSignal': case 'InputSignal': case 'Writable': return `Signal<${arg(0)}>`;
      case 'Signal': return arg(0);
      case 'EventData': return 'EventData';
      case 'OutputEmitterRef': return `Emitter<${arg(0)}>`;
      case 'RouterExtensions': return 'Router';
      case 'Promise': case 'PromiseLike': return `JSPromise<${arg(0)}>`;
      case 'Map': case 'ReadonlyMap': return `JSMap<${arg(0)}, ${arg(1)}>`;
      case 'Set': case 'ReadonlySet': return `JSSet<${arg(0)}>`;
      case 'Date': return 'JSDate';
      case 'RegExp': return 'JSRegExp';
      case 'RegExpMatchArray': case 'RegExpExecArray': return 'JSMatch';
      case 'RegExpStringIterator': return 'JSArray<JSMatch>';
      case 'WeakMap': case 'WeakSet': case 'Symbol':
        throw this.error(where, `the ${name} type`);
    }
    if (name && ERRORS[name] && sym?.declarations?.some((d) => d.getSourceFile().isDeclarationFile)) return ERRORS[name];
    const native = this.native.type(t);
    if (native) return native;
    const index = t.getStringIndexType() ?? t.getNumberIndexType();
    if (index && !t.getProperties().length) return `JSRecord<${this.type(index, where)}>`;
    const calls = t.getCallSignatures();
    if (calls.length && !t.getProperties().length) {
      const s = calls[0];
      const params = s.getParameters().map((p) => {
        const pt = this.type(c.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.questionToken) return optionalType(pt);
        return isFunctionType(pt) ? `@escaping ${pt}` : pt;
      });
      return `(${params.join(', ')}) throws -> ${this.type(s.getReturnType(), where)}`;
    }
    if (this.isEventData(t)) return 'EventData';
    // A generic type the kit declares (`ListItem<Recipe>`) keeps its arguments.
    const shim = sym?.declarations?.[0]?.getSourceFile().fileName.startsWith('/__shims__/');
    if (name && shim && (t as ts.TypeReference).typeArguments?.length) return `${name}<${c.getTypeArguments(t as ts.TypeReference).map((a) => this.type(a, where)).join(', ')}>`;
    if (name && name !== '__type' && name !== '__object') {
      if (sym?.declarations?.some((d) => !d.getSourceFile().isDeclarationFile)) this.used.add(name);
      return name;
    }
    const props = t.getProperties().map((p) => p.name);
    // An inline object type naming only an event's fields is the event's data (`args: { value: boolean }`).
    if (props.length && props.every((p) => ['eventName', 'object', 'value'].includes(p))) return 'EventData';
    return this.shape(t, where);
  }

  /** A framework's event type (`ListViewItemTapEvent`) is an `EventData` with typed members. */
  private isEventData(t: ts.Type): boolean {
    const target = (t as ts.TypeReference).target ?? t;
    if (!(target.flags & ts.TypeFlags.Object) || !target.isClassOrInterface()) return false;
    // Core declares some event types as classes of their own (`TouchGestureEventData`): an event names itself.
    const declared = target.getSymbol()?.declarations?.every((d) => d.getSourceFile().isDeclarationFile);
    if (declared && target.getProperty('eventName') && target.getProperty('object')) return true;
    return this.checker.getBaseTypes(target).some((b) => b.getSymbol()?.getName() === 'EventData' || this.isEventData(b));
  }

  typeOf(n: ts.Node): string {
    return this.type(this.checker.getTypeAtLocation(n), n);
  }

  /** A declared type, before the narrowing the checker applies at a use. */
  private declaredTypeOf(e: ts.Expression): string | null {
    const sym = this.checker.getSymbolAtLocation(ts.isPropertyAccessExpression(e) ? e.name : e);
    const decl = sym?.valueDeclaration;
    if (!sym || !decl) return null;
    const maybe = this.undefinedVars.get(sym);
    if (maybe) return maybe;
    if (!(ts.isVariableDeclaration(decl) || ts.isParameter(decl) || ts.isPropertyDeclaration(decl) || ts.isPropertySignature(decl) || ts.isBindingElement(decl))) return null;
    return this.type(this.checker.getTypeOfSymbolAtLocation(sym, decl), decl);
  }

  /** An object type with no name: a final class named for its fields, shared by every literal of that shape. */
  private shape(t: ts.Type, where?: ts.Node): string {
    if (this.shaping.has(t)) throw this.error(where, 'a recursive object type without a name');
    this.shaping.add(t);
    try {
      // A literal's keys are in the order JavaScript creates them: a spread's keys, then new ones; an overwritten key keeps its place.
      const order: string[] = [];
      if (where && ts.isObjectLiteralExpression(where)) {
        for (const p of where.properties) {
          const keys = ts.isSpreadAssignment(p) ? this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name) : p.name ? [p.name.getText().replace(/^['"]|['"]$/g, '')] : [];
          for (const k of keys) if (!order.includes(k)) order.push(k);
        }
      }
      const rank = (n: string) => (order.includes(n) ? order.indexOf(n) : order.length);
      const props = [...t.getProperties()].sort((a, b) => rank(a.name) - rank(b.name));
      const fields = props.map((p) => {
        let pt = this.type(this.checker.getTypeOfSymbolAtLocation(p, where ?? p.valueDeclaration!), where);
        if (pt === 'Void') pt = 'Any?';
        return { name: p.name, type: p.flags & ts.SymbolFlags.Optional ? optionalType(pt) : pt };
      });
      const key = fields.map((f) => `${f.name}:${f.type}`).sort().join(',');
      let s = this.shapes.get(key);
      if (!s) {
        let name = 'Object_' + (fields.map((f) => f.name.replace(/\W/g, '')).join('_') || 'empty');
        while ([...this.shapes.values()].some((x) => x.name === name)) name += '_';
        s = { name, fields };
        this.shapes.set(key, s);
      }
      return s.name;
    } finally {
      this.shaping.delete(t);
    }
  }

  private isString(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '') === 'String'; }
  private isBool(n: ts.Node) { return this.typeOf(n) === 'Bool'; }
  private isAny(n: ts.Node) { return this.typeOf(n) === 'Any?'; }
  private isArray(n: ts.Node) { return this.typeOf(n).replace(/\?$/, '').startsWith('JSArray<'); }
  private isObjectRef(n: ts.Node) {
    const t = this.typeOf(n).replace(/[?!]$/, '');
    return !['Double', 'String', 'Bool', 'Any?', 'Any', 'Void'].includes(t) && !t.startsWith('(') && !t.startsWith('[');
  }
  zero(t: string): string | null {
    if (t.endsWith('?')) return 'nil';
    if (t === 'Double') return '0';
    if (t === 'String') return '""';
    if (t === 'Bool') return 'false';
    if (/^JS(Array|Map|Set)</.test(t)) return `${t}()`;
    return null;
  }
  /** A declaration's type and initial value when its real value is assigned later. */
  deferredType(t: string): string { return this.deferred(t); }
  deferredDeclaration(name: string, t: string): string { return `var ${name}: ${this.deferred(t)}`; }
  isPromiseType(t: string): boolean { return t.startsWith('JSPromise<'); }
  private deferred(t: string): string {
    const z = this.zero(t);
    return z ? `${t} = ${z}` : isFunctionType(t) ? `(${t})!` : `${t}!`;
  }

  // ---- Modules -------------------------------------------------------------------------------

  /** A module's declarations, and the statements that run when it is first imported. */
  module(sf: ts.SourceFile): { code: string; init: string[] } {
    this.props = new Set();
    const out: string[] = [];
    const init: string[] = [];
    const later = (code: () => string) => { this.indent = '    '; try { init.push(code()); } finally { this.indent = ''; } };
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) continue;
      if (hasModifier(st, ts.SyntaxKind.DeclareKeyword)) continue;
      if (ts.isInterfaceDeclaration(st)) { this.registerInterface(st.name.text, sf.fileName, st.members); continue; }
      if (ts.isTypeAliasDeclaration(st) && ts.isTypeLiteralNode(st.type)) { this.registerInterface(st.name.text, sf.fileName, st.type.members); continue; }
      if (ts.isTypeAliasDeclaration(st)) continue;
      if (ts.isEnumDeclaration(st)) { out.push(this.enumDecl(st)); continue; }
      if (ts.isFunctionDeclaration(st)) { if (st.name && st.body) out.push(this.func(st, ident(st.name.text))); continue; }
      if (ts.isClassDeclaration(st)) {
        // Components are translated with their templates; other classes are services and models.
        const component = (ts.getDecorators(st) ?? []).some((d) => d.expression.getText().startsWith('Component'));
        if (!component && st.name) out.push(this.classDecl(st));
        continue;
      }
      if (ts.isVariableStatement(st)) {
        const constant = !!(st.declarationList.flags & ts.NodeFlags.Const);
        for (const d of st.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) {
            for (const n of boundNames(d.name)) out.push(`var ${ident(n.text)}: ${this.deferred(this.typeOf(n))}`);
            const tmp = this.fresh('__d');
            later(() => `    let ${tmp}: ${this.typeOf(d.initializer!)} = ${this.tryPrefix(d.initializer!)}${this.expr(d.initializer!)}\n${this.bindTo(d.name, tmp, '', 'assign')}`);
            continue;
          }
          const name = ident(d.name.text);
          const t = this.typeOf(d.name);
          if (!d.initializer) { out.push(`var ${name}: ${this.deferred(t)}`); continue; }
          const maybe = !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
          if (maybe) {
            const sym = this.resolve(d.name);
            if (sym) this.undefinedVars.set(sym, optionalType(t));
            out.push(`var ${name}: ${optionalType(t)} = nil`);
            later(() => `    ${name} = ${maybe}`);
            continue;
          }
          if (this.pure(d.initializer)) { out.push(`${constant ? 'let' : 'var'} ${name}: ${t} = ${this.coerce(d.initializer, t)}`); continue; }
          out.push(`var ${name}: ${this.deferred(t)}`);
          later(() => `    ${name} = ${this.tryPrefix(d.initializer!)}${this.coerce(d.initializer!, t)}`);
        }
        continue;
      }
      later(() => this.stmt(st));
    }
    return { code: out.join('\n\n') + '\n', init };
  }

  /** Whether evaluating `e` early (Swift initializes globals lazily) cannot be observed. */
  pure(e: ts.Expression): boolean {
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) return this.pure(e.expression);
    if (ts.isLiteralExpression(e) || ts.isNoSubstitutionTemplateLiteral(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(e.kind)) return true;
    if (ts.isIdentifier(e) || ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return true;
    if (ts.isTemplateExpression(e)) return e.templateSpans.every((s) => this.pure(s.expression));
    if (ts.isArrayLiteralExpression(e)) return e.elements.every((x) => this.pure(ts.isSpreadElement(x) ? x.expression : x));
    if (ts.isObjectLiteralExpression(e)) return e.properties.every((p) => (ts.isPropertyAssignment(p) ? this.pure(p.initializer) : ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)));
    if (ts.isPrefixUnaryExpression(e)) return this.pure(e.operand);
    if (ts.isBinaryExpression(e)) return e.operatorToken.kind !== ts.SyntaxKind.EqualsToken && this.pure(e.left) && this.pure(e.right);
    if (ts.isPropertyAccessExpression(e)) return this.pure(e.expression);
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && ['ref', '$ref', '$signal', 'signal', 'writable', '$writable', 'computed'].includes(e.expression.text)) return e.arguments.every((a) => this.pure(a));
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && ['Map', 'Set'].includes(e.expression.text)) return !e.arguments?.length || e.arguments.every((a) => this.pure(a));
    return false;
  }

  private registerInterface(name: string, file: string, members: ts.NodeArray<ts.TypeElement>) {
    if (this.protocols.has(name)) { this.interfaces.set(name, { file, code: () => this.protocolCode(name, members) }); return; }
    this.interfaces.set(name, { file, code: () => this.objectClass(name, members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t };
    }), null) });
  }

  /** An interface classes implement: a protocol, and `<Name>Object` for the object literals of its type. */
  private protocolCode(name: string, members: ts.NodeArray<ts.TypeElement>): string {
    const fields = members.filter(ts.isPropertySignature).map((m) => {
      const t = this.typeOf(m);
      return { name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(t) : t, readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword) };
    });
    const methods = members.filter(ts.isMethodSignature).map((m) => {
      const params = m.parameters.map((p, k) => ({ name: ts.isIdentifier(p.name) ? ident(p.name.text) : `p${k}`, type: p.questionToken ? optionalType(this.typeOf(p.name)) : this.typeOf(p.name) }));
      return { name: ident(m.name.getText()), params, ret: this.returnTypeOf(m) };
    });
    const signature = (m: (typeof methods)[0]) => `func ${m.name}(${m.params.map((p) => `_ ${p.name}: ${p.type}`).join(', ')}) throws${m.ret === 'Void' ? '' : ` -> ${m.ret}`}`;
    const fnType = (m: (typeof methods)[0]) => `(${m.params.map((p) => p.type).join(', ')}) throws -> ${m.ret}`;
    const lines = [`protocol ${name}: JSDynamic {`];
    for (const f of fields) lines.push(`    var ${ident(f.name)}: ${f.type} { get${f.readonly ? '' : ' set'} }`);
    for (const m of methods) lines.push(`    ${signature(m)}`);
    lines.push('}', '');
    const literal = this.objectClass(`${name}Object`, [...fields, ...methods.map((m) => ({ name: `_${m.name}`, type: fnType(m) }))], null)
      .replace(/^final class (\w+): JSDynamic \{/, `final class $1: ${name} {`)
      .replace(/\n}$/, '\n' + methods.map((m) => `    ${signature(m)} { try _${m.name}(${m.params.map((p) => p.name).join(', ')}) }`).join('\n') + '\n}');
    return lines.join('\n') + literal;
  }

  /** The classes for a module's interfaces that translated code used; call after translating everything. */
  interfacesOf(file: string): string {
    let out = '';
    const emitted = new Set<string>();
    // An interface's own fields can use another one.
    for (let more = true; more; ) {
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

  /** Classes for object types without a name. */
  shapesCode(): string {
    return [...[...this.shapes.values()].map((s) => this.objectClass(s.name, s.fields, null)), ...this.globalAliases.values()].join('\n\n');
  }

  /** A plain JavaScript object of a known shape: a final class with a memberwise init, readable as a dynamic object. */
  private objectClass(name: string, fields: { name: string; type: string }[], className: string | null): string {
    const lines = [`final class ${name}: JSDynamic {`];
    for (const f of fields) lines.push(`    var ${ident(f.name)}: ${f.type}`);
    // Keys in the order the literal that made this object wrote them, when not the declared order.
    lines.push('    private let jsOrder: [String]?');
    lines.push(`    init(${[...fields.map((f) => `${ident(f.name)}: ${isFunctionType(f.type) ? '@escaping ' : ''}${f.type}${f.type.endsWith('?') ? ' = nil' : ''}`), 'jsOrder: [String]? = nil'].join(', ')}) {`);
    for (const f of fields) lines.push(`        self.${ident(f.name)} = ${ident(f.name)}`);
    lines.push('        self.jsOrder = jsOrder', '    }');
    // Read from an untyped object (a cast of JSON.parse): the keys it has beyond the type's stay readable, in its order.
    lines.push('    private var jsExtra: JSDynamic?');
    lines.push('    convenience init(jsObject: Any?) {');
    lines.push(`        self.init(${[...fields.map((f) => `${ident(f.name)}: ${this.fromAny(`jsField(jsObject, ${swiftString(f.name)})`, f.type)}`), 'jsOrder: (jsObject as? JSDynamic)?.jsKeys'].join(', ')})`);
    lines.push('        jsExtra = jsObject as? JSDynamic', '    }');
    const members = this.dynamicMembers(fields, className, false).map((l) => l.replace('default: return nil', 'default: return jsExtra?[jsKey: key] ?? nil').replace('default: break', 'default: jsExtra?[jsKey: key] = newValue'));
    const optional = fields.filter((f) => f.type.endsWith('?'));
    members[0] = `    var jsKeys: [String] {\n        let keys = jsOrder ?? [${fields.map((f) => swiftString(f.name)).join(', ')}]\n        return keys.filter { key in ${optional.length ? `switch key { ${optional.map((f) => `case ${swiftString(f.name)}: return ${ident(f.name)} != nil`).join('; ')}; default: return true }` : 'true'} }\n    }`;
    lines.push(...members);
    lines.push('}');
    return lines.join('\n');
  }

  /** `JSDynamic`: the object's keys and members by name, for printing, JSON and untyped access. */
  private dynamicMembers(fields: { name: string; type: string }[], className: string | null, override: boolean): string[] {
    const o = override ? 'override ' : '';
    const keys = fields.map((f) => (f.type.endsWith('?') ? `(${ident(f.name)} == nil ? [] : [${swiftString(f.name)}])` : `[${swiftString(f.name)}]`));
    const lines = [
      `    ${o}var jsKeys: [String] { ${[override ? 'super.jsKeys' : '', ...keys].filter(Boolean).join(' + ') || '[]'} }`,
      `    ${o}var jsClassName: String? { ${className ? swiftString(className) : 'nil'} }`,
      `    ${o}subscript(jsKey key: String) -> Any? {`,
      '        get {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: return ${ident(f.name)}`),
      `            default: return ${override ? 'super[jsKey: key]' : 'nil'}`,
      '            }',
      '        }',
      '        set {',
      '            switch key {',
      ...fields.map((f) => `            case ${swiftString(f.name)}: ${ident(f.name)} = ${this.fromAny('newValue', f.type)}`),
      `            default: ${override ? 'super[jsKey: key] = newValue' : 'break'}`,
      '            }',
      '        }',
      '    }',
    ];
    return lines;
  }

  /** An untyped value read as `type`; with `orZero`, a missing value is the type's zero rather than a trap. */
  fromAnyCode(code: string, type: string, orZero = false): string {
    const zero = this.zero(type);
    if (orZero && zero && zero !== 'nil' && !type.endsWith('?')) return `((${code} as? ${type}) ?? ${zero})`;
    return this.fromAny(code, type);
  }

  /** Swift code reading an untyped value (`Any?`) as `type`. */
  private fromAny(code: string, type: string): string {
    if (type === 'Any?') return code;
    if ((code === 'nil' || code === 'jsNull') && type.endsWith('?')) return 'nil';
    const m = /^JSArray<(.*)>$/.exec(type);
    if (m) return `jsArrayOf(${code}) { ${this.fromAny('$0', m[1])} }`;
    const parts = /^\((.*)\)$/.exec(type) && splitTopLevel(type.slice(1, -1));
    if (parts && parts.length > 1 && !type.includes('->')) {
      // A tuple type reads an untyped array's elements.
      return `{ (__a: Any?) -> ${type} in (${parts.map((t, k) => this.fromAny(`jsField(__a, "${k}")`, t)).join(', ')}) }(${code})`;
    }
    const base = type.replace(/\?$/, '');
    if (this.interfaces.has(base) || [...this.shapes.values()].some((s) => s.name === base)) {
      this.used.add(base);
      return type.endsWith('?') ? `jsIsNullish(${code}) ? nil : ${base}(jsObject: ${code})` : `${base}(jsObject: ${code})`;
    }
    return type.endsWith('?') ? `(${code} as? ${base})` : `(${code} as! ${type})`;
  }

  private enumDecl(e: ts.EnumDeclaration): string {
    const lines = [`enum ${ident(e.name.text)} {`];
    for (const m of e.members) {
      const v = this.checker.getConstantValue(m);
      if (v === undefined) throw this.error(m, 'an enum member without a constant value');
      lines.push(`    static let ${ident(m.name.getText())}: ${typeof v === 'string' ? 'String' : 'Double'} = ${typeof v === 'string' ? swiftString(v) : String(v)}`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  // ---- Functions -----------------------------------------------------------------------------

  private params(fn: ts.SignatureDeclaration, closure: boolean): string {
    return fn.parameters.map((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.dotDotDotToken) return `${closure ? '' : '_ '}${name}: ${this.typeOf(p.name)}`;
      let t = this.typeOf(p.name);
      let given = '';
      if (p.questionToken || (p.initializer && !this.templateParams)) {
        if (!closure && p.initializer && this.isConstant(p.initializer)) given = ` = ${this.coerce(p.initializer, t)}`;
        else { t = optionalType(t); if (!closure) given = ' = nil'; }
      }
      if (isFunctionType(t)) t = '@escaping ' + t;
      return closure ? `${name}: ${t}` : `_ ${name}: ${t}${given}`;
    }).join(', ');
  }

  private isConstant(e: ts.Expression): boolean {
    return ts.isLiteralExpression(e) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(e.kind) || (ts.isPrefixUnaryExpression(e) && ts.isNumericLiteral(e.operand));
  }

  /** Statements a function body starts with: rest arrays, computed defaults, destructured parameters. */
  paramPrelude(fn: ts.SignatureDeclaration): string[] {
    const i = this.indent;
    const lines: string[] = [];
    fn.parameters.forEach((p, k) => {
      const name = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
      if (p.initializer && !this.templateParams && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || !this.isConstant(p.initializer))) {
        lines.push(`${i}let ${name}: ${this.typeOf(p.name)} = ${name} ?? ${this.coerce(p.initializer, this.typeOf(p.name))}`);
      }
      if (!ts.isIdentifier(p.name)) lines.push(this.bindTo(p.name, name, '', false));
    });
    return lines;
  }

  /** The Swift type a function returns: `JSPromise<T>` for an async one. */
  returnTypeOf(fn: ts.SignatureDeclaration): string {
    return this.type(this.checker.getSignatureFromDeclaration(fn)!.getReturnType(), fn);
  }

  private generics(fn: ts.SignatureDeclaration | ts.ClassLikeDeclaration): string {
    return fn.typeParameters?.length ? `<${fn.typeParameters.map((p) => p.name.text).join(', ')}>` : '';
  }

  /** A function's body block (`{ … }`), lowered when the function is async. */
  functionBody(fn: ts.FunctionLikeDeclaration, ret: string, base: string): string {
    return this.inFunction(ret, () => {
      const saved = this.indent;
      this.indent = base + '    ';
      try {
        let lines: string[];
        if (isAsync(fn)) lines = this.lowering.body(fn, ret.replace(/^JSPromise<(.*)>$/, '$1'));
        else if (fn.body && ts.isBlock(fn.body)) {
          lines = [...this.paramPrelude(fn), ...this.statements([...fn.body.statements])];
          // The checker proved every path returns (an exhaustive switch); Swift cannot see that.
          const last = fn.body.statements.at(-1);
          if (!['Void', 'Never'].includes(ret) && !ret.endsWith('?') && last && ts.isSwitchStatement(last)) lines.push(`${this.indent}fatalError("unreachable: every case returns")`);
        }
        else {
          const e = fn.body as ts.Expression;
          lines = [...this.paramPrelude(fn), ret === 'Void' ? this.indent + this.tryPrefix(e) + this.exprStatement(e) : `${this.indent}return ${this.tryPrefix(e)}${this.coerce(e, ret)}`];
        }
        return `{\n${lines.filter(Boolean).join('\n')}\n${base}}`;
      } finally { this.indent = saved; }
    });
  }

  func(fn: ts.FunctionDeclaration | ts.MethodDeclaration, name: string, modifiers = ''): string {
    const ret = this.returnTypeOf(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? ' throws' : '';
    return `${modifiers}func ${name}${this.generics(fn)}(${this.params(fn, false)})${throws}${ret === 'Void' ? '' : ` -> ${ret}`} ${this.functionBody(fn, ret, this.indent)}`;
  }

  /** `(r) => r.id` as a Swift closure with explicit types. */
  closure(fn: ts.ArrowFunction | ts.FunctionExpression): string {
    // A callback whose slot returns void returns nothing, whatever its expression body evaluates to.
    const slot = this.checker.getContextualType(fn)?.getCallSignatures()[0];
    const voidSlot = !!slot && !!(slot.getReturnType().flags & ts.TypeFlags.Void) && !isAsync(fn);
    const ret = voidSlot ? 'Void' : this.returnTypeOf(fn);
    const throws = !isAsync(fn) && this.throwsInfo.fn(fn) ? 'throws ' : '';
    if (fn.name) throw this.error(fn, 'a named function expression');
    return `{ (${this.params(fn, true)}) ${throws}-> ${ret} in${this.functionBody(fn, ret, this.indent).slice(1)}`;
  }

  /** A callback for an API that does not take throwing closures (a timer): what it throws is reported. */
  private callback(e: ts.Expression): string {
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const code = this.closure(e);
      return this.throwsInfo.fn(e) ? `{ jsReport(${code}) }` : code;
    }
    // A Promise executor's resolve passed as the callback (`setTimeout(resolve, ms)`) resolves with undefined.
    const resolvers = ts.isIdentifier(e) ? this.resolvers.get(this.resolve(e)!) : undefined;
    if (resolvers) return resolvers.type === 'Void' ? `{ ${resolvers.name}.resolve() }` : `{ ${resolvers.name}.resolve(${this.zero(resolvers.type) ?? 'nil'}) }`;
    // A function value is called with nothing, as the timer calls it: each parameter undefined.
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    const pads = (sig?.getParameters() ?? []).map((p) => (this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e) === 'Void' ? '()' : 'nil'));
    return `{ jsReport { try ${this.expr(e)}(${pads.join(', ')}) } }`;
  }

  // ---- Classes -------------------------------------------------------------------------------

  /** The class's members; the caller adds `render()`. Returns the Swift lines inside the class. */
  componentMembers(cls: ts.ClassDeclaration, props: string[]): string[] {
    this.props = new Set(props);
    this.computed = new Set(cls.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && this.calleeName(m.initializer) === 'computed').map((m) => (m.name as ts.Identifier).text));
    const lines: string[] = [];
    const inits: string[] = [];
    const propParams: string[] = [];
    this.indent = '    ';
    for (const m of cls.members) {
      if (ts.isPropertyDeclaration(m)) {
        const name = (m.name as ts.Identifier).text;
        const callee = m.initializer ? this.calleeName(m.initializer) : '';
        if (callee === 'input' || callee === 'input.required') {
          // An Angular input is a prop: a signal the parent writes.
          const t = this.typeOf(m.name).replace(/^Signal<(.*)>$/, '$1');
          const given = (m.initializer as ts.CallExpression).arguments[0];
          lines.push(`    let ${ident(name)}: Signal<${t}>`);
          propParams.push(`${ident(name)}: ${t}${given ? ` = ${this.expr(given)}` : ''}`);
          inits.push(`        self.${ident(name)} = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        if (callee === 'computed') {
          const fn = (m.initializer as ts.CallExpression).arguments[0] as ts.ArrowFunction;
          const t = this.returnTypeOf(fn);
          lines.push(`    var ${ident(name)}: ${t} ${this.functionBody(fn, t, '    ')}`);
          continue;
        }
        const t = this.typeOf(m.name);
        if (!m.initializer) {
          lines.push(`    let ${ident(name)}: Signal<${t}>`);
          // A callback prop is kept in its signal, so it outlives the initializer.
          propParams.push(`${ident(name)}: ${isFunctionType(t) ? '@escaping ' : ''}${t}`);
          inits.push(`        self.${ident(name)} = ${this.newSignal(t, ident(name), 'identity')}`);
          continue;
        }
        lines.push(`    let ${ident(name)}: ${t}`);
        this.indent = '        ';
        inits.push(`        self.${ident(name)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
        continue;
      }
      if (ts.isGetAccessorDeclaration(m)) {
        const t = this.returnTypeOf(m);
        const throws = this.throwsInfo.fn(m);
        const body = this.functionBody(m, t, '        ');
        lines.push(throws ? `    var ${ident((m.name as ts.Identifier).text)}: ${t} {\n        get throws ${body}\n    }` : `    var ${ident((m.name as ts.Identifier).text)}: ${t} ${this.functionBody(m, t, '    ')}`);
        continue;
      }
      if (ts.isMethodDeclaration(m)) {
        this.templateParams = /^\$[be]\d+$/.test(m.name.getText());
        try { lines.push('    ' + this.func(m, ident((m.name as ts.Identifier).text))); } finally { this.templateParams = false; }
        continue;
      }
    }
    this.indent = '';
    const throws = inits.some((l) => /\btry\b/.test(l)) ? ' throws' : '';
    lines.push(`    init(${propParams.join(', ')})${throws} {`, ...inits, '    }');
    return lines;
  }

  /** Whether a component's method or getter throws, so its caller in `render()` reports what it throws. */
  memberThrows(cls: ts.ClassDeclaration, name: string): boolean {
    const m = cls.members.find((x) => x.name && ts.isIdentifier(x.name) && x.name.text === name);
    return !!m && !isAsync(m) && this.throwsInfo.fn(m);
  }

  private calleeName(e: ts.Expression): string {
    return ts.isCallExpression(e) ? e.expression.getText() : '';
  }

  private classDecl(cls: ts.ClassDeclaration): string {
    const nativeSubclass = this.native.classDecl(cls);
    if (nativeSubclass) return nativeSubclass;
    const name = cls.name!.text;
    const service = (ts.getDecorators(cls) ?? []).some((d) => d.expression.getText().startsWith('Injectable'));
    if (service) return [`final class ${name} {`, `    static let shared = ${name}()`, '', ...this.componentMembers(cls, []), '}'].join('\n');
    const c = this.checker;
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const baseDecl = heritage && c.getTypeAtLocation(heritage.expression).getSymbol()?.valueDeclaration;
    const appBase = baseDecl && ts.isClassLike(baseDecl) && !baseDecl.getSourceFile().isDeclarationFile ? baseDecl : undefined;
    let base: string | null = null;
    if (heritage) {
      const baseName = heritage.expression.getText();
      if (appBase) base = baseName;
      else if (ERRORS[baseName]) base = ERRORS[baseName];
      else throw this.error(heritage, `extending ${baseName}`);
    }
    const isError = !!base && !appBase;
    const implemented = (cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []).map((i) => i.expression.getText());
    for (const i of implemented) this.used.add(i);
    const conformances = [...(base ? [base] : []), ...implemented];
    // A class's own toString is what JavaScript's string conversion calls.
    if (cls.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString' && !m.parameters.length) && !this.inheritsToString(cls)) conformances.push('JSStringConvertible');
    const lines = [`${this.extended.has(name) ? '' : 'final '}class ${ident(name)}${this.generics(cls)}: ${conformances.length ? conformances.join(', ') : 'JSDynamic'} {`];
    const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
    const paramProps = (ctor?.parameters ?? []).filter((p) => ts.canHaveModifiers(p) && ts.getModifiers(p)?.some((m) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(m.kind)));
    const fieldInits: string[] = [];
    const fields: { name: string; type: string }[] = [];
    this.indent = '    ';
    for (const p of paramProps) {
      const n = (p.name as ts.Identifier).text;
      const t = this.typeOf(p.name);
      lines.push(`    var ${ident(n)}: ${this.deferred(t)}`);
      fields.push({ name: n, type: t });
    }
    for (const m of cls.members) {
      if (!ts.isPropertyDeclaration(m)) continue;
      const n = m.name.getText();
      const t = this.typeOf(m.name);
      if (isStatic(m)) {
        lines.push(`    static var ${ident(n)}: ${t}${m.initializer ? ` = ${this.coerce(m.initializer, t)}` : t.endsWith('?') ? '' : ` = ${this.zero(t) ?? 'nil'}`}`);
        continue;
      }
      fields.push({ name: n, type: t });
      if (m.initializer && this.pure(m.initializer) && !refersToThis(m.initializer)) { lines.push(`    var ${ident(n)}: ${t} = ${this.coerce(m.initializer, t)}`); continue; }
      lines.push(`    var ${ident(n)}: ${this.deferred(t)}`);
      if (m.initializer) {
        this.indent = '        ';
        fieldInits.push(`        self.${ident(n)} = ${this.tryPrefix(m.initializer)}${this.coerce(m.initializer, t)}`);
        this.indent = '    ';
      }
    }
    // Members whose names a base class declares too.
    const inherited = new Set<string>();
    for (let b = appBase; b; ) {
      for (const m of b.members) if (m.name) inherited.add(m.name.getText());
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && c.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    // The constructor: super() first, then parameter properties and field initializers, then the body (JavaScript's order).
    const baseCtor = appBase && this.constructorOf(appBase);
    if (ctor) {
      const throws = this.throwsInfo.fn(ctor) ? ' throws' : '';
      const sameAsBase = baseCtor ? this.params(baseCtor, false) === this.params(ctor, false) : ctor.parameters.length === 0 && !!appBase;
      const body = this.inFunction('Void', () => {
        this.indent = '        ';
        const out: string[] = [...this.paramPrelude(ctor)];
        const stmts = [...ctor.body!.statements];
        const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
        const own = () => [...paramProps.map((p) => `        self.${ident((p.name as ts.Identifier).text)} = ${ident((p.name as ts.Identifier).text)}`), ...fieldInits];
        if (superAt < 0) out.push(...own(), ...this.statements(stmts));
        else {
          out.push(...this.statements(stmts.slice(0, superAt)));
          const call = (stmts[superAt] as ts.ExpressionStatement).expression as ts.CallExpression;
          out.push(`        ${this.tryPrefix(call)}super.init(${this.args(call).join(', ')})`, ...own(), ...this.statements(stmts.slice(superAt + 1)));
        }
        return out;
      });
      this.indent = '    ';
      lines.push(`    ${sameAsBase ? 'override ' : ''}init(${this.params(ctor, false)})${throws} {`, ...body, '    }');
    } else if (fieldInits.length) {
      if (baseCtor) lines.push(`    override init(${this.params(baseCtor, false)}) {`, `        super.init(${baseCtor.parameters.map((p) => ident((p.name as ts.Identifier).text)).join(', ')})`, ...fieldInits, '    }');
      else lines.push(`    ${appBase ? 'override ' : ''}init() {`, ...(appBase ? ['        super.init()'] : []), ...fieldInits, '    }');
    }
    // Accessors pair into one property.
    const accessors = new Map<string, { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }>();
    for (const m of cls.members) {
      if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
        const a = accessors.get(m.name.getText()) ?? {};
        if (ts.isGetAccessorDeclaration(m)) a.get = m; else a.set = m;
        accessors.set(m.name.getText(), a);
      }
    }
    for (const [n, a] of accessors) {
      // A property with only a setter reads as undefined in JavaScript.
      const t = a.get ? this.returnTypeOf(a.get) : optionalType(this.typeOf(a.set!.parameters[0].name));
      const mods = `${a.get && isStatic(a.get) ? 'static ' : ''}${inherited.has(n) ? 'override ' : ''}`;
      const parts: string[] = [];
      if (a.get) parts.push(`        get${this.throwsInfo.fn(a.get) ? ' throws' : ''} ${this.functionBody(a.get, t, '        ')}`);
      else parts.push('        get { nil }');
      if (a.set) {
        if (this.throwsInfo.fn(a.set)) throw this.error(a.set, 'a setter that throws');
        const p = a.set.parameters[0].name as ts.Identifier;
        const body = this.functionBody(a.set, 'Void', '        ');
        parts.push(`        set {\n            let ${ident(p.text)} = newValue${a.get ? '' : '!'}${body.slice(1)}`);
      }
      lines.push(`    ${mods}var ${ident(n)}: ${t} {`, ...parts, '    }');
    }
    for (const m of cls.members) {
      if (ts.isMethodDeclaration(m) && !m.body && hasModifier(m, ts.SyntaxKind.AbstractKeyword)) {
        // An abstract method: subclasses override it.
        const ret = this.returnTypeOf(m);
        lines.push(`    func ${ident(m.name.getText())}(${this.params(m, false)})${this.throwsInfo.fn(m) ? ' throws' : ''}${ret === 'Void' ? '' : ` -> ${ret}`} { fatalError("abstract method ${name}.${m.name.getText()}") }`);
        continue;
      }
      if (!ts.isMethodDeclaration(m) || !m.body) continue;
      const n = m.name.getText();
      lines.push('    ' + this.func(m, ident(n), `${isStatic(m) ? 'static ' : ''}${inherited.has(n) && !isStatic(m) ? 'override ' : ''}`));
    }
    if (!isError) lines.push(...this.dynamicMembers(fields, name, !!appBase));
    this.indent = '';
    lines.push('}');
    return lines.join('\n');
  }

  private inheritsToString(cls: ts.ClassLikeDeclaration): boolean {
    const h = cls.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
    if (!d || !ts.isClassLike(d)) return !!h && !!ERRORS[h.expression.getText()];
    return d.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'toString') || this.inheritsToString(d);
  }

  private constructorOf(cls: ts.ClassLikeDeclaration): ts.ConstructorDeclaration | undefined {
    for (let b: ts.ClassLikeDeclaration | undefined = cls; b; ) {
      const ctor = b.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
      if (ctor) return ctor;
      const h = b.heritageClauses?.find((x) => x.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const d = h && this.checker.getTypeAtLocation(h.expression).getSymbol()?.valueDeclaration;
      b = d && ts.isClassLike(d) && !d.getSourceFile().isDeclarationFile ? d : undefined;
    }
    return undefined;
  }

  // ---- Statements --------------------------------------------------------------------------------

  /** A list of statements at the current indent, function declarations hoisted as JavaScript hoists them. */
  statements(list: ts.Statement[]): string[] {
    const fns = list.filter(ts.isFunctionDeclaration);
    return [...fns, ...list.filter((s) => !ts.isFunctionDeclaration(s))].map((s) => this.stmt(s)).filter(Boolean);
  }

  block(b: ts.Statement, base = this.indent): string {
    const saved = this.indent;
    this.indent = base + '    ';
    try {
      const body = this.statements(ts.isBlock(b) ? [...b.statements] : [b]);
      return `{\n${body.join('\n')}\n${base}}`;
    } finally { this.indent = saved; }
  }

  stmt(s: ts.Statement): string {
    const i = this.indent;
    const a = this.asyncCtx;
    if (ts.isExpressionStatement(s)) return i + this.tryPrefix(s.expression) + this.exprStatement(s.expression);
    if (ts.isReturnStatement(s)) {
      if (a) {
        const e = s.expression;
        if (!e) return `${i}${a.ret(null, false)}\n${i}return`;
        const isPromise = this.typeOf(e).startsWith('JSPromise<');
        return `${i}${this.tryPrefix(e)}${a.ret(isPromise ? this.expr(e) : this.coerce(e, a.result), isPromise)}\n${i}return`;
      }
      return i + (s.expression ? `return ${this.tryPrefix(s.expression)}${this.coerce(s.expression, this.returnType)}` : 'return');
    }
    if (ts.isIfStatement(s)) {
      let out = `${i}if ${this.tryPrefix(s.expression)}${this.cond(s.expression)} ${this.block(s.thenStatement)}`;
      if (s.elseStatement) out += ts.isIfStatement(s.elseStatement) ? ` else ${this.stmt(s.elseStatement).trimStart()}` : ` else ${this.block(s.elseStatement)}`;
      return out;
    }
    if (ts.isVariableStatement(s)) return this.declarationList(s.declarationList, false);
    if (ts.isFunctionDeclaration(s)) {
      if (!s.name || !s.body) return '';
      return i + this.func(s, ident(s.name.text));
    }
    if (ts.isForOfStatement(s)) {
      if (s.awaitModifier) throw this.error(s, 'for await');
      const list = s.initializer;
      if (!ts.isVariableDeclarationList(list)) throw this.error(s, 'for…of over an existing variable');
      const decl = list.declarations[0];
      const mutable = !(list.flags & ts.NodeFlags.Const);
      const seq = this.tryPrefix(s.expression) + this.iterable(s.expression);
      return this.loopBody(() => {
        const label = this.takeLabel();
        if (ts.isIdentifier(decl.name)) return `${i}${label}for ${mutable ? 'var ' : ''}${ident(decl.name.text)} in ${seq} ${this.block(s.statement)}`;
        const item = this.fresh('__item');
        const body = this.block(s.statement);
        return `${i}${label}for ${item} in ${seq} {\n${this.nested(() => this.bindTo(decl.name, item, '', mutable))}\n${body.slice(2)}`;
      });
    }
    if (ts.isForInStatement(s)) {
      const list = s.initializer as ts.VariableDeclarationList;
      const name = ident((list.declarations[0].name as ts.Identifier).text);
      return this.loopBody(() => `${i}${this.takeLabel()}for ${name} in jsKeysOf(${this.expr(s.expression)}) ${this.block(s.statement)}`);
    }
    if (ts.isForStatement(s)) return this.forStatement(s);
    if (ts.isWhileStatement(s)) return this.loopBody(() => `${i}${this.takeLabel()}while ${this.tryPrefix(s.expression)}${this.cond(s.expression)} ${this.block(s.statement)}`);
    if (ts.isDoStatement(s)) return this.loopBody(() => `${i}${this.takeLabel()}repeat ${this.block(s.statement)} while ${this.tryPrefix(s.expression)}${this.cond(s.expression)}`);
    if (ts.isBreakStatement(s) || ts.isContinueStatement(s)) {
      const isBreak = ts.isBreakStatement(s);
      if (s.label) return `${i}${isBreak ? 'break' : 'continue'} ${ident(s.label.text)}`;
      if (a && (isBreak ? a.brk && !this.plainBreak : a.cont && !this.plainContinue)) return `${i}${isBreak ? a.brk : a.cont}\n${i}return`;
      return i + (isBreak ? 'break' : 'continue');
    }
    if (ts.isBlock(s)) return `${i}do ${this.block(s)}`;
    if (ts.isEmptyStatement(s)) return '';
    if (ts.isSwitchStatement(s)) return this.switchStatement(s);
    if (ts.isThrowStatement(s)) return `${i}throw ${this.tryPrefix(s.expression)}JSException(value: ${this.coerce(s.expression, 'Any?')})`;
    if (ts.isTryStatement(s)) return this.tryStatement(s);
    if (ts.isLabeledStatement(s)) {
      if (this.asyncCtx) throw this.error(s, 'a labeled statement in an async function');
      this.label = ident(s.label.text);
      return this.stmt(s.statement);
    }
    if (ts.isClassDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      if (ts.isClassDeclaration(s)) throw this.error(s, 'a class declared inside a function');
      return '';
    }
    throw this.error(s, 'statement');
  }

  /** The label of the loop being translated (`outer:`), placed on the Swift loop that implements it. */
  private label: string | null = null;
  private takeLabel(): string {
    const l = this.label;
    this.label = null;
    return l ? `${l}: ` : '';
  }

  private loopBody(body: () => string): string {
    this.plainBreak++;
    this.plainContinue++;
    try { return body(); } finally { this.plainBreak--; this.plainContinue--; }
  }

  declarationList(list: ts.VariableDeclarationList, lowered: boolean): string {
    const constant = !!(list.flags & ts.NodeFlags.Const);
    return list.declarations.map((d) => this.declaration(d, constant, lowered)).join('\n');
  }

  /** One declaration; in lowered async code a later continuation may assign it, so it starts initialized. */
  declaration(d: ts.VariableDeclaration, constant: boolean, lowered: boolean): string {
    const i = this.indent;
    if (ts.isIdentifier(d.name)) {
      const t = this.typeOf(d.name);
      const name = ident(d.name.text);
      if (!d.initializer) return `${i}var ${name}: ${lowered || t.endsWith('?') ? this.deferred(t) : t}`;
      const maybe = !lowered && !t.endsWith('?') ? this.maybeUndefined(d.initializer) : null;
      if (maybe) {
        const sym = this.resolve(d.name);
        if (sym) this.undefinedVars.set(sym, optionalType(t));
        return `${i}${constant ? 'let' : 'var'} ${name}: ${optionalType(t)} = ${this.tryPrefix(d.initializer)}${maybe}`;
      }
      return `${i}${constant ? 'let' : 'var'} ${name}: ${t} = ${this.tryPrefix(d.initializer)}${this.coerce(d.initializer, t)}`;
    }
    const tmp = this.fresh('__d');
    return `${i}let ${tmp}: ${this.typeOf(d.initializer!)} = ${this.tryPrefix(d.initializer!)}${this.expr(d.initializer!)}\n${this.bindTo(d.name, tmp, '', !constant)}`;
  }

  /** Declarations binding `name` (an identifier or a destructuring pattern) to the Swift value `value`. */
  bindTo(name: ts.BindingName, value: string, _type: string, mutable: boolean | 'assign'): string {
    const i = this.indent;
    const kw = mutable === 'assign' ? '' : mutable ? 'var ' : 'let ';
    const declare = (n: ts.Identifier, t: string, v: string) => (mutable === 'assign' ? `${i}${ident(n.text)} = ${v}` : `${i}${kw}${ident(n.text)}: ${t} = ${v}`);
    if (ts.isIdentifier(name)) return declare(name, this.typeOf(name), value);
    const lines: string[] = [];
    const source = this.checker.getTypeAtLocation(name);
    name.elements.forEach((el, k) => {
      if (ts.isOmittedExpression(el)) return;
      if (el.dotDotDotToken) {
        if (ts.isObjectBindingPattern(name)) throw this.error(el, 'an object rest pattern');
        const tuple = this.checker.isTupleType(source) ? this.checker.getTypeArguments(source as ts.TypeReference).length : 0;
        const rest = tuple ? `(${Array.from({ length: Math.max(0, tuple - k) }, (_, n) => `${value}.${k + n}`).join(', ')})` : `${value}.slice(${k})`;
        lines.push(this.bindTo(el.name, rest, '', mutable));
        return;
      }
      let read: string;
      if (ts.isObjectBindingPattern(name)) {
        const key = (el.propertyName ?? el.name).getText();
        read = this.isAny(name) ? `jsGet(${value}, ${swiftString(key)})` : `${value}.${ident(key)}`;
      } else read = this.checker.isTupleType(source) ? `${value}.${k}` : `${value}[${k}]`;
      if (el.initializer) read = `(${read} ?? ${this.coerce(el.initializer, this.typeOf(el.name))})`;
      if (ts.isIdentifier(el.name)) {
        const t = this.typeOf(el.name);
        const fromAny = this.isAny(name) && t !== 'Any?' ? this.fromAny(read, t) : read;
        lines.push(declare(el.name, t, fromAny));
      } else {
        const tmp = this.fresh('__d');
        lines.push(`${i}let ${tmp} = ${read}`, this.bindTo(el.name, tmp, '', mutable));
      }
    });
    return lines.join('\n');
  }

  /** What `for…of` iterates in Swift: arrays, sets and iterators as they are, a map's entries, a string's code points. */
  iterable(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'String') return `jsCodePoints(${this.expr(e)})`;
    if (t.startsWith('JSMap<')) return `${this.expr(e)}.entries()`;
    if (t === 'JSMatch') return `${this.expr(e)}.values`;
    return this.expr(e);
  }

  elementTypeOf(e: ts.Expression): string {
    const t = this.typeOf(e);
    return t.replace(/^JS(Array|Set)<(.*)>$/, '$2');
  }

  private forStatement(s: ts.ForStatement): string {
    const i = this.indent;
    const list = s.initializer && ts.isVariableDeclarationList(s.initializer) ? s.initializer : null;
    const init = list ? this.declarationList(list, false) : s.initializer ? i + this.exprStatement(s.initializer as ts.Expression) : '';
    const cond = s.condition ? `${this.tryPrefix(s.condition)}${this.cond(s.condition)}` : 'true';
    const step = s.incrementor ? this.tryPrefix(s.incrementor) + this.exprStatement(s.incrementor) : '';
    // `let` loop variables a closure in the body captures are a fresh binding per iteration, as in JavaScript.
    const captured = list && !(list.flags & ts.NodeFlags.Const) && list.declarations.some((d) => ts.isIdentifier(d.name) && capturedIn(d.name, s.statement, this.checker));
    const labelName = ts.isLabeledStatement(s.parent) ? s.parent.label.text : null;
    const hasContinue = containsJump(s.statement, ts.SyntaxKind.ContinueStatement) || (!!labelName && continuesTo(s.statement, labelName));
    const label = this.takeLabel();
    return this.loopBody(() => {
      if (captured) {
        const names = list!.declarations.map((d) => ident((d.name as ts.Identifier).text));
        const first = this.fresh('__first');
        const outer = names.map((n) => `__outer_${n}`);
        const lines = [`${i}do {`, ...init.split('\n').map((l) => '    ' + l)];
        lines.push(...names.map((n, k) => `${i}    var ${outer[k]} = ${n}`), `${i}    var ${first} = true`, `${i}    ${label}while true {`);
        lines.push(...names.map((n, k) => `${i}        var ${n} = ${outer[k]}`));
        lines.push(`${i}        defer { ${names.map((n, k) => `${outer[k]} = ${n}`).join('; ')} }`);
        const body = this.nested(() => this.nested(() => this.block(s.statement)));
        lines.push(`${i}        if !${first} { ${step} }`, `${i}        ${first} = false`, `${i}        if !(${cond}) { break }`, `${i}        do ${body}`, `${i}    }`, `${i}}`);
        return lines.join('\n');
      }
      if (!step) return `${init ? init + '\n' : ''}${i}${label}while ${cond} ${this.block(s.statement)}`;
      if (hasContinue) {
        const first = this.fresh('__first');
        return `${init ? init + '\n' : ''}${i}var ${first} = true\n${i}${label}while true {\n${i}    if !${first} { ${step} }\n${i}    ${first} = false\n${i}    if !(${cond}) { break }\n${i}    do ${this.nested(() => this.block(s.statement))}\n${i}}`;
      }
      const body = this.block(s.statement).replace(/\n\s*}$/, '');
      return `${init ? init + '\n' : ''}${i}${label}while ${cond} ${body}\n${i}    ${step}\n${i}}`;
    });
  }

  private switchStatement(s: ts.SwitchStatement): string {
    const i = this.indent;
    const subject = this.fresh('__switch');
    const lines = [`${i}let ${subject}: ${this.typeOf(s.expression)} = ${this.tryPrefix(s.expression)}${this.expr(s.expression)}`, `${i}switch ${subject} {`];
    const clauses = s.caseBlock.clauses;
    let labels: ts.Expression[] = [];
    this.plainBreak++;
    try {
      clauses.forEach((c, k) => {
        if (ts.isCaseClause(c)) labels.push(c.expression);
        if (!c.statements.length && k < clauses.length - 1) return;
        if (ts.isDefaultClause(c)) {
          if (k < clauses.length - 1) throw this.error(c, 'a default clause before other cases');
          lines.push(`${i}default:`);
        } else if (labels.every((l) => ts.isLiteralExpression(l) || (ts.isPrefixUnaryExpression(l) && ts.isNumericLiteral(l.operand)))) {
          lines.push(`${i}case ${labels.map((l) => this.expr(l)).join(', ')}:`);
        } else {
          lines.push(`${i}case _ where ${labels.map((l) => `${subject} == ${this.expr(l)}`).join(' || ')}:`);
        }
        labels = [];
        const body = [...c.statements];
        const last = body.at(-1);
        const ends = last && (ts.isBreakStatement(last) || ts.isReturnStatement(last) || ts.isThrowStatement(last) || ts.isContinueStatement(last));
        if (last && ts.isBreakStatement(last) && !last.label) body.pop();
        const code = this.nested(() => this.statements(body));
        lines.push(...(code.length ? code : [`${i}    break`]));
        if (!ends && k < clauses.length - 1) lines.push(`${i}    fallthrough`);
      });
    } finally { this.plainBreak--; }
    if (!clauses.some(ts.isDefaultClause)) lines.push(`${i}default:`, `${i}    break`);
    lines.push(`${i}}`);
    return lines.join('\n');
  }

  private tryStatement(s: ts.TryStatement): string {
    const i = this.indent;
    let code: string;
    if (s.catchClause) {
      const binding = s.catchClause.variableDeclaration;
      const bind = binding ? this.nested(() => this.bindTo(binding.name, 'jsCaught(error)', '', true)) + '\n' : '';
      const body = this.block(s.catchClause.block);
      code = `${i}do ${this.block(s.tryBlock)} catch {\n${bind}${body.slice(2)}`;
    } else code = `${i}do ${this.block(s.tryBlock)}`;
    if (!s.finallyBlock) return code;
    if (containsJump(s.finallyBlock, ts.SyntaxKind.ReturnStatement) || containsJump(s.finallyBlock, ts.SyntaxKind.ThrowStatement)) throw this.error(s.finallyBlock, 'return or throw in a finally block');
    const fin = this.nested(() => this.block(s.finallyBlock!));
    const inner = this.nested(() => this.tryStatement(ts.factory.updateTryStatement(s, s.tryBlock, s.catchClause, undefined)));
    return `${i}do {\n${i}    defer ${fin}\n${inner}\n${i}}`;
  }

  exprStatement(e: ts.Expression): string {
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isArrayLiteralExpression(e.left)) {
      // `[a, b] = [b, a]`: the right side is evaluated before any target is written.
      const tmp = this.fresh('__swap');
      const tuple = this.checker.isTupleType(this.checker.getTypeAtLocation(e.right));
      const assigns = e.left.elements.map((target, k) => (ts.isOmittedExpression(target) ? '' : `${this.lvalue(target)} = ${tuple ? `${tmp}.${k}` : `${tmp}[${k}]`}`)).filter(Boolean);
      return `do { let ${tmp} = ${this.expr(e.right)}; ${assigns.join('; ')} }`;
    }
    if (ts.isPostfixUnaryExpression(e) || ts.isPrefixUnaryExpression(e)) {
      if (e.operator === ts.SyntaxKind.PlusPlusToken) return `${this.lvalue(e.operand)} += 1`;
      if (e.operator === ts.SyntaxKind.MinusMinusToken) return `${this.lvalue(e.operand)} -= 1`;
    }
    if (ts.isAwaitExpression(e) && this.subst.has(e)) return `_ = ${this.subst.get(e)}`;
    const code = this.expr(e);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return code;
    // A call whose result is unused (`arr.push(x)` returns the length in JavaScript).
    return ts.isCallExpression(e) && !['Void', 'Never'].includes(this.typeOf(e)) ? `_ = ${code}` : ts.isCallExpression(e) || ts.isNewExpression(e) ? code : `_ = ${code}`;
  }

  /** `try ` when evaluating `e` can throw. */
  tryPrefix(e: ts.Node): string {
    return this.throwsInfo.expr(e) ? 'try ' : '';
  }

  /** An expression where Swift needs a value of `target`. */
  coerce(e: ts.Expression, target: string): string {
    const source = this.typeOf(e);
    if (target.endsWith('?') && target !== 'Any?' && !source.endsWith('?')) {
      const maybe = this.maybeUndefined(e);
      if (maybe) return maybe;
    }
    if (target === 'Any?') {
      const maybe = this.maybeUndefined(e);
      if (maybe) return `(${maybe} as Any?)`;
      if (source === 'Double' && numericLiteralOnly(e)) return `Double(${this.expr(e)})`;
      return this.expr(e);
    }
    if (source === 'Any?' && target !== 'Void') {
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.expr(e);
      return this.fromAny(this.expr(e), target);
    }
    return this.expr(e);
  }

  /** A condition: Swift needs a Bool where JavaScript tests truthiness. */
  cond(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsTruthy(${maybe} as Any?)`;
    return this.isBool(e) ? this.expr(e) : `jsTruthy(${this.expr(e)})`;
  }

  // ---- Expressions -----------------------------------------------------------------------------

  expr(e: ts.Expression): string {
    const s = this.subst.get(e);
    if (s) return s;
    if (ts.isParenthesizedExpression(e)) return `(${this.expr(e.expression)})`;
    if (ts.isNumericLiteral(e)) return numberLiteral(e.text);
    if (ts.isBigIntLiteral(e)) throw this.error(e, 'BigInt');
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return swiftString(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (e.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (e.kind === ts.SyntaxKind.NullKeyword) return this.typeOf(e) === 'Any?' && !this.optionalContext(e) ? 'jsNull' : 'nil';
    if (e.kind === ts.SyntaxKind.ThisKeyword) return 'self';
    if (e.kind === ts.SyntaxKind.SuperKeyword) return 'super';
    if (ts.isIdentifier(e)) return this.identifier(e);
    if (ts.isTemplateExpression(e)) {
      let out = this.escapeInterpolated(e.head.text);
      for (const span of e.templateSpans) out += `\\(${this.str(span.expression)})` + this.escapeInterpolated(span.literal.text);
      return `"${out}"`;
    }
    if (ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) {
      const from = this.typeOf(e.expression);
      const to = this.typeOf(e);
      if (from === 'Any?' && to !== 'Any?') return this.fromAny(this.expr(e.expression), to);
      if (from !== to && from.replace(/[?!]$/, '') !== to.replace(/[?!]$/, '') && this.isObjectRef(e) && this.isObjectRef(e.expression)) return `(${this.expr(e.expression)} as! ${to})`;
      return this.expr(e.expression);
    }
    if (ts.isNonNullExpression(e)) {
      const inner = this.expr(e.expression);
      return this.typeOf(e.expression).endsWith('?') ? `${inner}!` : inner;
    }
    if (ts.isPropertyAccessExpression(e)) return this.property(e);
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isCallExpression(e)) return this.call(e);
    if (ts.isNewExpression(e)) return this.newExpr(e);
    if (ts.isBinaryExpression(e)) return this.binary(e);
    if (ts.isPrefixUnaryExpression(e)) return this.prefix(e);
    if (ts.isPostfixUnaryExpression(e)) {
      const fn = e.operator === ts.SyntaxKind.PlusPlusToken ? 'jsPostIncrement' : 'jsPostDecrement';
      return `${fn}(&${this.lvalue(e.operand)})`;
    }
    if (ts.isConditionalExpression(e)) {
      const t = this.typeOf(e);
      return `(${this.cond(e.condition)} ? ${this.coerce(e.whenTrue, t)} : ${this.coerce(e.whenFalse, t)})`;
    }
    if (ts.isArrayLiteralExpression(e)) return this.array(e);
    if (ts.isObjectLiteralExpression(e)) return this.object(e);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.closure(e);
    if (ts.isTypeOfExpression(e)) return this.typeofExpr(e);
    if (ts.isAwaitExpression(e)) throw this.error(e, 'await outside a statement of an async function');
    if (ts.isDeleteExpression(e)) {
      const target = e.expression;
      if (ts.isElementAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${this.str(target.argumentExpression)})`;
      if (ts.isPropertyAccessExpression(target) && this.typeOf(target.expression).startsWith('JSRecord<')) return `${this.expr(target.expression)}.delete(${swiftString(target.name.text)})`;
      throw this.error(e, 'delete of this member');
    }
    if (ts.isVoidExpression(e)) return `{ _ = ${this.expr(e.expression)}; return nil as Any? }()`;
    if (ts.isRegularExpressionLiteral(e)) {
      const text = e.text;
      const end = text.lastIndexOf('/');
      return `jsRegExpLiteral(${swiftString(text.slice(1, end))}, ${swiftString(text.slice(end + 1))})`;
    }
    throw this.error(e, 'expression');
  }

  /** Whether a `null` here lands in an optional typed slot rather than an untyped one. */
  private optionalContext(e: ts.Expression): boolean {
    const ctx = this.checker.getContextualType(e);
    return !!ctx && !(ctx.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) && this.type(ctx, e) !== 'Any?';
  }

  private identifier(e: ts.Identifier): string {
    const name = e.text;
    if (name === 'undefined') return 'nil';
    if (name === 'NaN') return 'Double.nan';
    if (name === 'Infinity') return 'Double.infinity';
    const native = this.native.identifier(e);
    if (native) return native;
    return this.narrowed(e, this.globalAlias(e) ?? ident(name));
  }

  /**
   * A module-level variable read inside a class with a member of the same name
   * (`readonly fruits = fruits`): Swift would resolve the name to the member,
   * so the read goes through a global alias of the variable.
   */
  private globalAlias(e: ts.Identifier): string | null {
    const decl = this.resolve(e)?.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl) || decl.getSourceFile().isDeclarationFile) return null;
    const statement = decl.parent.parent;
    if (!ts.isVariableStatement(statement) || !ts.isSourceFile(statement.parent)) return null;
    const cls = ts.findAncestor(e, ts.isClassLike);
    if (!cls || !cls.members.some((m) => m.name && !ts.isComputedPropertyName(m.name) && m.name.getText() === e.text)) return null;
    const alias = `__global_${e.text}`;
    if (!this.globalAliases.has(alias)) {
      const t = this.typeOf(decl.name);
      const constant = (decl.parent.flags & ts.NodeFlags.Const) !== 0;
      this.globalAliases.set(alias, `var ${alias}: ${t} {${constant ? ` ${ident(e.text)} ` : ` get { ${ident(e.text)} } set { ${ident(e.text)} = newValue } `}}`);
    }
    return alias;
  }

  /** A read the checker has narrowed (`if (x) x.length`, `if (e instanceof Error) e.message`): Swift needs the unwrap or cast. */
  private narrowed(e: ts.Expression, code: string): string {
    if (isWriteTarget(e)) return code;
    const sym = ts.isIdentifier(e) ? this.resolve(e) : undefined;
    if (sym && this.undefinedVars.has(sym)) {
      const actual = this.typeOf(e);
      return actual.endsWith('?') ? code : this.undefinedAs(code, actual);
    }
    const declared = this.declaredTypeOf(e);
    if (!declared) return code;
    const actual = this.typeOf(e);
    if (declared === actual || actual === 'Any?') return code;
    if (declared === optionalType(actual)) return `${code}!`;
    if (declared === 'Any?') return this.fromAny(code, actual);
    if (declared.replace(/\?$/, '') !== actual.replace(/\?$/, '') && this.isObjectRef(e)) return `(${code} as! ${actual})`;
    return code;
  }

  /** An assignable place: a component prop is its signal's value. */
  private lvalue(e: ts.Expression): string {
    if (ts.isPropertyAccessExpression(e) && e.expression.kind === ts.SyntaxKind.ThisKeyword && this.props.has(e.name.text)) return `self.${ident(e.name.text)}.value`;
    if (ts.isPropertyAccessExpression(e)) return `${this.expr(e.expression)}.${ident(e.name.text)}`;
    if (ts.isElementAccessExpression(e)) return this.elementAccess(e);
    if (ts.isIdentifier(e)) return ident(e.text);
    return this.expr(e);
  }

  private escapeInterpolated(text: string): string {
    return swiftString(text).slice(1, -1);
  }

  /** A value as JavaScript converts it to a string (`String(x)`, `${x}`, `'' + x`). */
  str(e: ts.Expression): string {
    const maybe = this.maybeUndefined(e);
    if (maybe) return `jsToString(${maybe} as Any?)`;
    const t = this.typeOf(e);
    if (t === 'String') return this.expr(e);
    if (t === 'Double' || t === 'Bool') return `js(${this.expr(e)})`;
    return `jsToString(${this.expr(e)})`;
  }

  private property(e: ts.PropertyAccessExpression): string {
    const name = e.name.text;
    const target = e.expression;
    if (target.kind === ts.SyntaxKind.ThisKeyword && this.props.has(name)) return `self.${ident(name)}.value`;
    if (ts.isIdentifier(target) && this.isLibGlobal(target)) {
      const constant = LIB_CONSTANTS[`${target.text}.${name}`];
      if (constant) return constant;
      throw this.error(e, `${target.text}.${name}`);
    }
    // A member of an enum a library declares (core's GestureStateTypes.began): its value.
    const enumMember = this.checker.getSymbolAtLocation(e.name)?.valueDeclaration;
    const constant = enumMember && ts.isEnumMember(enumMember) ? this.checker.getConstantValue(enumMember) : undefined;
    if (constant !== undefined && enumMember!.getSourceFile().isDeclarationFile && !this.native.module(enumMember)) {
      return typeof constant === 'string' ? swiftString(constant) : `Double(${constant})`;
    }
    const maybeChain = e.questionDotToken ? this.maybeUndefined(e) : null;
    if (maybeChain) return this.undefinedAs(maybeChain, this.typeOf(e));
    const core = this.core.property(e);
    if (core) return core;
    const native = this.native.property(e);
    if (native) return native;
    const dot = e.questionDotToken ? '?.' : '.';
    if (name === 'length' && this.isString(target)) {
      return this.typeOf(target).endsWith('?') ? `${this.expr(target)}.map { Double($0.utf16.count) }` : `Double(${this.expr(target)}.utf16.count)`;
    }
    if (this.isAny(target)) {
      const t = this.typeOf(e);
      const code = `jsGet(${this.expr(target)}, ${swiftString(name)})`;
      return t === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, t);
    }
    const base = this.typeOf(target);
    if (base.replace(/\?$/, '').startsWith('JSRecord<')) {
      // A key of a dictionary-typed object: undefined when missing.
      const read = `${this.expr(target)}${base.endsWith('?') ? '?' : ''}[${swiftString(name)}]`;
      const t = this.typeOf(e);
      if (isWriteTarget(e) || t.endsWith('?')) return read;
      const z = this.zero(t);
      return z && z !== 'nil' ? `(${read} ?? ${z})` : `${read}!`;
    }
    // An event's data: the value's type is the one the handler declared.
    if (base === 'EventData' && (name === 'value' || name === 'item')) {
      const t = this.typeOf(e);
      return t === 'Any?' ? `${this.expr(target)}.${name}` : this.fromAny(`${this.expr(target)}.${name}`, t);
    }
    return this.narrowed(e, `${this.expr(target)}${base.endsWith('?') && !e.questionDotToken ? '!' : ''}${dot}${ident(name)}`);
  }

  private elementAccess(e: ts.ElementAccessExpression): string {
    const target = this.expr(e.expression);
    const key = e.argumentExpression;
    const t = this.typeOf(e.expression).replace(/\?$/, '');
    const q = e.questionDotToken ? '?' : '';
    if (t === 'String') return `jsCharAt(${target}, ${this.expr(key)})`;
    if (t.startsWith('JSArray<')) {
      if (isWriteTarget(e)) return `${target}${q}[Int(${this.expr(key)})]`;
      return this.undefinedAs(this.maybeUndefined(e)!, this.typeOf(e));
    }
    if (t === 'JSMatch') return `${target}${q}[Int(${this.expr(key)})]`;
    if (t.startsWith('(') && ts.isNumericLiteral(key)) return `${target}.${key.text}`;
    if (t.startsWith('JSRecord<')) {
      // A missing key is undefined in JavaScript; its declared type here is the value type.
      if (isWriteTarget(e)) return `${target}[${this.str(key)}]`;
      const vt = this.typeOf(e);
      const z = this.zero(vt);
      return z && z !== 'nil' ? `(${target}[${this.str(key)}] ?? ${z})` : `${target}[${this.str(key)}]!`;
    }
    if (this.typeOf(e.expression) === 'Any?') {
      const code = `jsGet(${target}, ${this.str(key)})`;
      const rt = this.typeOf(e);
      return rt === 'Any?' || isWriteTarget(e) ? code : this.fromAny(code, rt);
    }
    if (ts.isStringLiteral(key)) return `${target}${q}.${ident(key.text)}`;
    throw this.error(e, 'indexing this type');
  }

  /**
   * An expression that may be undefined though TypeScript types it as its element
   * (`xs[i]` past the end, or a variable holding one), as a Swift optional; null otherwise.
   */
  private maybeUndefined(e: ts.Expression): string | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isElementAccessExpression(e) && !isWriteTarget(e) && this.typeOf(e.expression).replace(/\?$/, '').startsWith('JSArray<')) {
      const q = e.questionDotToken || this.typeOf(e.expression).endsWith('?') ? '?' : '';
      const code = `${this.expr(e.expression)}${q}.element(${this.toNumber(e.argumentExpression)})`;
      return this.typeOf(e).endsWith('?') || q ? `(${code} ?? nil)` : code;
    }
    if (ts.isIdentifier(e)) {
      const sym = this.resolve(e);
      if (sym && this.undefinedVars.has(sym)) return ident(e.text);
    }
    if (ts.isPropertyAccessExpression(e) && e.questionDotToken && !this.typeOf(e.expression).endsWith('?')) {
      const target = this.maybeUndefined(e.expression);
      if (target) return `${target}?.${ident(e.name.text)}`;
    }
    return null;
  }

  /** An undefined-or-value as the TypeScript type reads it: NaN, "undefined" and false are what undefined converts to. */
  private undefinedAs(code: string, type: string): string {
    if (type.endsWith('?')) return code.endsWith('?? nil)') ? code : `(${code} ?? nil)`;
    if (type === 'Double') return `(${code} ?? .nan)`;
    if (type === 'String') return `(${code} ?? "undefined")`;
    if (type === 'Bool') return `(${code} ?? false)`;
    return `${code}!`;
  }

  args(e: ts.CallExpression | ts.NewExpression, count?: number): string[] {
    const all = e.arguments ?? ts.factory.createNodeArray();
    const list = count === undefined ? all : all.slice(0, count);
    const sig = this.checker.getResolvedSignature(e);
    const params = sig?.getParameters() ?? [];
    const out: string[] = [];
    const restAt = params.findIndex((p) => p.valueDeclaration && ts.isParameter(p.valueDeclaration) && p.valueDeclaration.dotDotDotToken);
    const appDeclared = !!sig?.getDeclaration() && !sig!.getDeclaration().getSourceFile().isDeclarationFile;
    for (let k = 0; k < list.length; k++) {
      const a = list[k];
      if (restAt >= 0 && k >= restAt && appDeclared) {
        // An app function's rest parameter is one array: the arguments packed, spreads included.
        const rest = this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name);
        out.push(this.packed(list.slice(k), rest));
        break;
      }
      if (ts.isSpreadElement(a)) throw this.error(a, 'a spread argument');
      const p = params[Math.min(k, params.length - 1)];
      const decl = p?.valueDeclaration;
      if (!p || (decl && ts.isParameter(decl) && decl.dotDotDotToken)) {
        const pt = decl && ts.isParameter(decl) ? this.typeOf(decl.name).replace(/^JSArray<(.*)>$/, '$1') : 'Any?';
        out.push(this.coerce(a, pt));
        continue;
      }
      out.push(this.coerce(a, this.type(this.checker.getTypeOfSymbolAtLocation(p, e), e)));
    }
    if (restAt >= 0 && appDeclared && list.length <= restAt) out.push(`${this.typeOf((params[restAt].valueDeclaration as ts.ParameterDeclaration).name)}()`);
    // A function value takes every parameter: the ones JavaScript leaves out are undefined.
    const decl = sig?.getDeclaration();
    if (count === undefined && decl && !ts.isJSDocSignature(decl) && !('body' in decl) && (ts.isFunctionTypeNode(decl) || ts.isCallSignatureDeclaration(decl))) {
      for (let k = list.length; k < params.length; k++) {
        const pt = this.type(this.checker.getTypeOfSymbolAtLocation(params[k], e), e);
        out.push(pt === 'Void' ? '()' : 'nil');
      }
    }
    return out;
  }

  /** Arguments (spreads included) as one `JSArray` of `arrayType`. */
  private packed(items: readonly ts.Expression[], arrayType: string): string {
    const el = arrayType.replace(/^JSArray<(.*)>$/, '$1');
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of items) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`Array(${this.iterable(x.expression)})`);
      } else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `${arrayType}(${parts.join(' + ') || '[]'})`;
  }

  /** How many parameters the called function declares (JavaScript ignores extra arguments). */
  private arity(e: ts.CallExpression): number | undefined {
    const sig = this.checker.getResolvedSignature(e);
    const decl = sig?.getDeclaration();
    if (!decl || ts.isJSDocSignature(decl)) return undefined;
    if (decl.parameters.some((p) => p.dotDotDotToken)) return undefined;
    return decl.parameters.length;
  }

  private isLibGlobal(id: ts.Identifier): boolean {
    if (!LIB_GLOBALS.has(id.text)) return false;
    const decl = this.resolve(id)?.declarations?.[0];
    return !decl || decl.getSourceFile().isDeclarationFile;
  }

  /** The symbol a name refers to, through imports. */
  resolve(n: ts.Node): ts.Symbol | undefined {
    const sym = this.checker.getSymbolAtLocation(n);
    return sym && sym.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(sym) : sym;
  }

  private call(e: ts.CallExpression): string {
    const callee = e.expression;
    // Reading a callable signal (Angular, Solid) (`count()`, an input, a computed field).
    if (!e.arguments.length && ['WritableSignal', 'InputSignal', 'Signal'].includes(this.symbolName(callee))) {
      if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.computed.has(callee.name.text)) return `self.${ident(callee.name.text)}`;
      if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.props.has(callee.name.text)) return `self.${ident(callee.name.text)}.value`;
      return this.symbolName(callee) === 'Signal' ? this.expr(callee) : `${this.expr(callee)}.value`;
    }
    if (callee.kind === ts.SyntaxKind.SuperKeyword) throw this.error(e, 'super() outside the start of a constructor');
    if (e.questionDotToken) return `${this.expr(callee)}?(${this.args(e).join(', ')})`;
    if (ts.isIdentifier(callee)) return this.globalCall(callee, e);
    // A callback passed as a prop (`onTap: () => void`).
    if (ts.isPropertyAccessExpression(callee) && callee.expression.kind === ts.SyntaxKind.ThisKeyword && this.props.has(callee.name.text)) {
      return `self.${ident(callee.name.text)}.value(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'then' && ts.isCallExpression(callee.expression)
        && ts.isIdentifier(callee.expression.expression) && callee.expression.expression.text === '$showModal') {
      return this.showModal(callee.expression, e.arguments[0]);
    }
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      const target = callee.expression;
      const owner = this.symbolName(target);
      const signalValue = () => this.typeOf(target).replace(/^Signal<(.*)>$/, '$1');
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'set') return `${this.expr(target)}.value = ${this.signalWrite(target, e.arguments[0], signalValue())}`;
      if ((owner === 'Writable' || owner === 'WritableSignal') && method === 'update') return `${this.expr(target)}.update(${this.closure(e.arguments[0] as ts.ArrowFunction)})`;
      if (owner === 'WritableSignal' && method === '$write') {
        // Solid's setter: a function updates, anything else is the new value.
        const a = e.arguments[0];
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return `${this.expr(target)}.update(${this.closure(a)})`;
        return `${this.expr(target)}.value = ${this.coerce(a, signalValue())}`;
      }
      if (owner === 'OutputEmitterRef' && method === 'emit') return `${this.expr(target)}.emit(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      if (ts.isIdentifier(target) && this.isLibGlobal(target)) return this.staticCall(target.text, method, e);
      const core = this.core.call(e) ?? this.native.call(e);
      if (core) return core;
      if (this.isAny(target)) return `jsCall(jsGet(${this.expr(target)}, ${swiftString(method)})${e.arguments.map((a) => `, ${this.coerce(a, 'Any?')}`).join('')})`;
      const t = this.typeOf(target).replace(/\?$/, '');
      const q = callee.questionDotToken ? '?' : this.typeOf(target).endsWith('?') ? '!' : '';
      if (method === 'fill' && ts.isNewExpression(target) && ts.isIdentifier(target.expression) && target.expression.text === 'Array' && target.arguments?.length === 1 && e.arguments.length === 1) {
        // `new Array(n).fill(v)`: n copies of v.
        return `${t}(Array(repeating: ${this.coerce(e.arguments[0], t.replace(/^JSArray<(.*)>$/, '$1'))}, count: Int(${this.expr(target.arguments[0])})))`;
      }
      if (t.startsWith('JSArray<')) return this.arrayMethod(method, target, e, q);
      if (t === 'JSMatch' && method !== 'toString') {
        this.subst.set(target, `${this.expr(target)}${q}.values`);
        try { return this.arrayMethod(method, target, e, ''); } finally { this.subst.delete(target); }
      }
      if (t.startsWith('(') && this.checker.isTupleType(this.checker.getTypeAtLocation(target))) {
        // A tuple used as an array: its elements as one.
        const n = this.checker.getTypeArguments(this.checker.getTypeAtLocation(target) as ts.TypeReference).length;
        const el = this.typeOf(target).slice(1, -1).split(', ');
        const element = el.every((x) => x === el[0]) ? el[0] : 'Any?';
        const tmp = this.fresh('__tuple');
        const value = this.expr(target);
        this.subst.set(target, `JSArray<${element}>([${Array.from({ length: n }, (_, k) => `${tmp}.${k}`).join(', ')}])`);
        try {
          const tr = this.tryPrefix(e);
          return `{ () ${tr ? 'throws ' : ''}-> ${this.typeOf(e)} in let ${tmp} = ${value}; return ${tr}${this.arrayMethod(method, target, e, '')} }()`;
        } finally { this.subst.delete(target); }
      }
      if (t === 'String') return this.stringMethod(method, target, e);
      if (t === 'Double') return this.numberMethod(method, target, e);
      if (t.startsWith('JSPromise<')) return this.promiseMethod(method, target, e);
      if (t.startsWith('JSMap<') || t.startsWith('JSSet<')) return this.collectionMethod(method, target, e, q);
      return `${this.expr(target)}${q}.${ident(method)}(${this.args(e, this.arity(e)).join(', ')})`;
    }
    if (ts.isParenthesizedExpression(callee)) return this.call(ts.factory.updateCallExpression(e, callee.expression, e.typeArguments, e.arguments));
    if (ts.isElementAccessExpression(callee) || ts.isCallExpression(callee)) return `${this.expr(callee)}(${this.args(e).join(', ')})`;
    throw this.error(e, 'call');
  }

  /** The new value of a signal: Vue's refs are deeply reactive. */
  private signalWrite(target: ts.Expression, value: ts.Expression, t: string): string {
    const code = this.coerce(value, t);
    return this.symbolName(target) === 'VueRef' && this.isObjectRef(value) ? `jsReactive(${code})` : code;
  }

  /** `Signal(x)`: a write of an equal value is no change. Objects compare by identity (Object.is) except in Svelte, where a write of an object always notifies. */
  private newSignal(t: string, value: string, kind: 'vue' | 'svelte' | 'identity'): string {
    const reference = !['Double', 'String', 'Bool'].includes(t.replace(/\?$/, '')) && !isFunctionType(t);
    if (kind === 'vue') return `Signal<${t}>(${reference ? `jsReactive(${value})` : value}${reference ? ', equals: jsSame' : ''})`;
    if (kind === 'svelte' || !reference) return `Signal<${t}>(${value})`;
    return `Signal<${t}>(${value}, equals: jsSame)`;
  }

  private globalCall(callee: ts.Identifier, e: ts.CallExpression): string {
    const native = this.native.call(e);
    if (native) return native;
    const name = callee.text;
    const arg = (k: number) => e.arguments[k];
    const decl = this.resolve(callee)?.declarations?.[0];
    const lib = !decl || decl.getSourceFile().isDeclarationFile;
    if (name === 'get' && e.arguments.length === 1 && this.symbolName(arg(0)) === 'Writable') return `${this.expr(arg(0))}.value`;
    if (name === 'navigate' && arg(0) && ts.isObjectLiteralExpression(arg(0))) return this.navigate(e);
    if (['$signal', 'ref', '$ref', 'signal', 'writable', '$writable'].includes(name) && lib) {
      const t = this.typeOf(e).replace(/^Signal<(.*)>$/, '$1');
      const kind = name === 'ref' || name === '$ref' ? 'vue' : name === '$signal' || name === 'writable' ? 'svelte' : 'identity';
      return this.newSignal(t, arg(0) ? this.coerce(arg(0), t) : 'nil', kind);
    }
    if (name === 'output' && lib) return `${this.typeOf(e)}()`;
    if (name === 'inject' && lib) {
      const token = (arg(0) as ts.Identifier).text;
      if (token === 'RouterExtensions') return 'Router.shared';
      if (token === 'ActivatedRoute') return 'ActivatedRoute.current';
      return `${token}.shared`;
    }
    if (name === '$navigateTo' && lib) return this.navigate(e);
    if (name === '$showModal' && lib) return this.showModal(e);
    if (name === '$closeModal' && lib) return `Modal.close(${arg(0) ? this.coerce(arg(0), 'Any?') : ''})`;
    if (lib) {
      switch (name) {
        case 'String': return arg(0) ? this.str(arg(0)) : '""';
        case 'Number': return arg(0) ? this.toNumber(arg(0)) : '0';
        case 'Boolean': return arg(0) ? this.cond(arg(0)) : 'false';
        case 'parseInt': return `jsParseInt(${this.str(arg(0))}${arg(1) ? `, ${this.expr(arg(1))}` : ', nil'})`;
        case 'parseFloat': return `jsParseFloat(${this.str(arg(0))})`;
        case 'isNaN': return `${this.toNumber(arg(0))}.isNaN`;
        case 'isFinite': return `${this.toNumber(arg(0))}.isFinite`;
        case 'setTimeout': case 'setInterval':
          return `js${name[0].toUpperCase()}${name.slice(1)}(${this.callback(arg(0))}, ${arg(1) ? this.expr(arg(1)) : '0'})`;
        case 'clearTimeout': case 'clearInterval': return `js${name[0].toUpperCase()}${name.slice(1)}(${arg(0) ? this.coerce(arg(0), 'Double?') : 'nil'})`;
        case 'queueMicrotask': return `jsQueueMicrotask(${this.callback(arg(0))})`;
      }
      if (decl && /[\\/]lib\.[\w.]*\.d\.ts$/.test(decl.getSourceFile().fileName)) throw this.error(e, `${name}()`);
    }
    const resolvers = this.resolvers.get(this.resolve(callee)!);
    if (resolvers) {
      if (!arg(0)) return `${resolvers.name}.resolve()`;
      if (this.typeOf(arg(0)).startsWith('JSPromise<')) return `${resolvers.name}.resolve(promise: ${this.expr(arg(0))})`;
      return `${resolvers.name}.resolve(${this.coerce(arg(0), resolvers.type)})`;
    }
    const declared = this.checker.getResolvedSignature(e)?.getDeclaration();
    const isFunctionValue = !declared || ts.isJSDocSignature(declared) || !('body' in declared && declared.body);
    return `${this.narrowed(callee, ident(name))}(${this.args(e, isFunctionValue ? undefined : this.arity(e)).join(', ')})`;
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
    const args = info.props.map((p) => `${ident(p)}: ${given.get(p) ?? 'nil'}`).join(', ');
    return `Frame.topmost?.navigate { ${component}(${args}).render() }`;
  }

  private toNumber(e: ts.Expression): string {
    const t = this.typeOf(e);
    if (t === 'Double') return this.expr(e);
    if (t === 'JSDate') return `${this.expr(e)}.valueOf()`;
    if (this.native.isEnumType(t)) return `Double(${this.expr(e)}.rawValue)`;
    if (t === 'String') return `jsNumberFromString(${this.expr(e)})`;
    if (t === 'Bool') return `(${this.expr(e)} ? 1 : 0)`;
    return `jsToNumber(${this.expr(e)})`;
  }

  /** `Math.max`, `JSON.parse`, `Object.keys`, `Promise.all`, `console.log`… */
  private staticCall(owner: string, method: string, e: ts.CallExpression): string {
    const a = () => this.args(e);
    const arg = (k: number) => e.arguments[k];
    const T = () => this.typeOf(e);
    switch (owner) {
      case 'Math': return this.math(method, e);
      case 'console': {
        const fn = ['warn', 'error'].includes(method) ? 'jsError' : 'jsLog';
        return `${fn}(${e.arguments.map((x) => this.coerce(x, 'Any?')).join(', ')})`;
      }
      case 'JSON':
        if (method === 'parse') return `jsJSONParse(${this.expr(arg(0))})`;
        if (method === 'stringify') return `jsJSONStringify(${this.coerce(arg(0), 'Any?')}${arg(2) ? `, ${this.coerce(arg(2), 'Any?')}` : ''})!`;
        break;
      case 'Object': {
        const record = this.typeOf(arg(0)).startsWith('JSRecord<');
        if (record && ['keys', 'values', 'entries'].includes(method)) return `${this.expr(arg(0))}.${method}`;
        if (method === 'keys') return `JSArray(jsKeysOf(${this.expr(arg(0))}))`;
        if (method === 'values' || method === 'entries') {
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const value = method === 'values' ? el : el.replace(/^\(String, (.*)\)$/, '$1');
          const read = this.fromAnyCode('jsField(__o, $0)', value);
          return `{ (__o: Any?) -> ${T()} in JSArray(jsKeysOf(__o).map { ${method === 'values' ? read : `($0, ${read})`} }) }(${this.expr(arg(0))})`;
        }
        if (method === 'freeze') return this.expr(arg(0));
        break;
      }
      case 'Array':
        if (method === 'isArray') return `JSArray<Any?>.isArray(${this.coerce(arg(0), 'Any?')})`;
        if (method === 'from' && e.arguments.length === 1) return `${T()}.from(${this.iterable(arg(0))})`;
        if (method === 'from' && e.arguments.length === 2 && ts.isObjectLiteralExpression(arg(0))) {
          const length = (arg(0) as ts.ObjectLiteralExpression).properties.find((p) => p.name?.getText() === 'length');
          const fn = arg(1);
          if (!length || !ts.isPropertyAssignment(length) || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) throw this.error(e, 'Array.from of this object');
          const el = T().replace(/^JSArray<(.*)>$/, '$1');
          const index = fn.parameters[1] ? ident((fn.parameters[1].name as ts.Identifier).text) : '_';
          const value = fn.parameters[0] && ts.isIdentifier(fn.parameters[0].name) && fn.parameters[0].name.text !== '_' ? `let ${ident(fn.parameters[0].name.text)}: Any? = nil; ` : '';
          const body = ts.isBlock(fn.body) ? this.functionBody(fn, el, this.indent).slice(1, -1) : ` return ${this.coerce(fn.body, el)} `;
          return `${T()}.from(length: ${this.expr(length.initializer)}) { (${index}: Double) ${this.throwsInfo.fn(fn) ? 'throws ' : ''}-> ${el} in ${value}${body}}`;
        }
        if (method === 'from' && e.arguments.length === 2) return `${T()}.from(${this.iterable(arg(0))}).map(${this.expr(arg(1))})`;
        if (method === 'of') return `${T()}([${a().join(', ')}])`;
        break;
      case 'Number':
        if (method === 'isInteger') return `jsIsInteger(${this.expr(arg(0))})`;
        if (method === 'isSafeInteger') return `jsIsSafeInteger(${this.expr(arg(0))})`;
        if (method === 'isFinite') return `${this.expr(arg(0))}.isFinite`;
        if (method === 'isNaN') return `${this.expr(arg(0))}.isNaN`;
        if (method === 'parseFloat') return `jsParseFloat(${this.expr(arg(0))})`;
        if (method === 'parseInt') return `jsParseInt(${this.expr(arg(0))}${arg(1) ? `, ${this.expr(arg(1))}` : ', nil'})`;
        break;
      case 'String':
        if (method === 'fromCharCode') return `jsFromCharCode(${a().join(', ')})`;
        break;
      case 'Date':
        if (method === 'now') return 'JSDate.now()';
        if (method === 'parse') return `JSDate.parse(${this.str(arg(0))})`;
        if (method === 'UTC') return `JSDate.UTC(${e.arguments.map((x) => this.toNumber(x)).join(', ')})`;
        break;
      case 'Promise': {
        const t = T();
        if (method === 'resolve') return arg(0) ? (this.typeOf(arg(0)).startsWith('JSPromise<') ? `${t}.resolve(${this.expr(arg(0))})` : `${t}.resolve(${this.coerce(arg(0), t.replace(/^JSPromise<(.*)>$/, '$1'))})`) : `${t}.resolve(())`;
        if (method === 'reject') return `${t}.reject(${arg(0) ? this.coerce(arg(0), 'Any?') : 'nil'})`;
        if (['all', 'allSettled', 'race', 'any'].includes(method)) {
          const src = arg(0);
          if (ts.isArrayLiteralExpression(src)) return this.promiseCombinator(method, src, t);
          const inner = this.typeOf(src).replace(/^JSArray<JSPromise<(.*)>>$/, '$1');
          return `JSPromise<${inner}>.${method}(${this.expr(src)})`;
        }
        break;
      }
    }
    throw this.error(e, `${owner}.${method}`);
  }

  /** `Promise.all([a, b])` and friends over a literal list, which TypeScript types as a tuple. */
  private promiseCombinator(method: string, list: ts.ArrayLiteralExpression, result: string): string {
    if (list.elements.some(ts.isSpreadElement)) throw this.error(list, `Promise.${method} over a spread`);
    const values = list.elements.map((x) => this.typeOf(x).replace(/^JSPromise<(.*)>$/, '$1'));
    const promise = (x: ts.Expression, k: number) => (this.typeOf(x).startsWith('JSPromise<') ? this.expr(x) : `JSPromise<${values[k]}>.resolve(${this.expr(x)})`);
    const same = values.every((v) => v === values[0]);
    const tuple = result.replace(/^JSPromise<(.*)>$/, '$1');
    const toTuple = (element: string) => `.then { (__a: JSArray<${element}>) -> ${tuple} in (${values.map((_, k) => `__a[${k}]`).join(', ')}) }`;
    if (method === 'all') {
      if (values.length >= 2 && values.length <= 4) return `jsPromiseAll(${list.elements.map(promise).join(', ')})`;
      if (values.length === 1) return `${promise(list.elements[0], 0)}`;
      if (same) return `JSPromise<${values[0]}>.all(JSArray<JSPromise<${values[0]}>>([${list.elements.map(promise).join(', ')}]))${toTuple(values[0])}`;
      throw this.error(list, 'Promise.all over more than four values of different types');
    }
    if (method === 'allSettled') return `JSPromise<Any?>.allSettled(JSArray<Any?>([${list.elements.map((x) => this.expr(x)).join(', ')}]))${toTuple('JSObject')}`;
    if (!same) return `JSPromise<Any?>.${method}(JSArray<Any?>([${list.elements.map((x) => this.expr(x)).join(', ')}]))`;
    return `JSPromise<${values[0]}>.${method}(JSArray<JSPromise<${values[0]}>>([${list.elements.map(promise).join(', ')}]))`;

  }

  /** `$showModal(Component, { props, fullscreen, animated, cancelable, closeCallback })`; a `.then(fn)` is the close callback. */
  private showModal(e: ts.CallExpression, then?: ts.Expression): string {
    const component = (e.arguments[0] as ts.Identifier).text;
    const info = this.components.get(component);
    if (!info) throw this.error(e, `a modal of ${component}: not a component`);
    const options = e.arguments[1];
    const given = new Map<string, string>();
    const settings: string[] = [];
    let callback = then;
    if (options && ts.isObjectLiteralExpression(options)) {
      for (const p of options.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = (p.name as ts.Identifier).text;
        if (key === 'props' && ts.isObjectLiteralExpression(p.initializer)) {
          for (const q of p.initializer.properties) {
            if (ts.isShorthandPropertyAssignment(q)) given.set(q.name.text, ident(q.name.text));
            else if (ts.isPropertyAssignment(q)) given.set((q.name as ts.Identifier).text, this.expr(q.initializer));
          }
        } else if (key === 'fullscreen' || key === 'animated' || key === 'cancelable') {
          settings.push(`${key}: ${this.expr(p.initializer)}`);
        } else if (key === 'closeCallback') {
          callback = p.initializer;
        }
      }
    }
    if (callback) {
      if (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) throw this.error(callback, 'a modal close callback that is not a function literal');
      const closure = this.closure(callback);
      const first = callback.parameters[0];
      const t = first ? this.typeOf(first.name) : '';
      // A modal closed without a result (swiped away) passes undefined, which reads as "undefined" or NaN.
      const undefinedValue: Record<string, string> = { String: '"undefined"', Double: '.nan', Bool: 'false' };
      const cast = t in undefinedValue ? `((value as? ${t}) ?? ${undefinedValue[t]})` : `(value as! ${t})`;
      const call = !first ? `{ _ in (${closure})() }` : t === 'Any' ? closure : t.endsWith('?') ? `{ value in (${closure})(value as? ${t.slice(0, -1)}) }` : `{ value in (${closure})${cast} }`;
      settings.push(`closeCallback: ${call}`);
    }
    const args = info.props.map((p) => `${ident(p)}: ${given.get(p) ?? 'nil'}`).join(', ');
    return `Modal.show(${settings.join(', ')}) { ${component}(${args}).render() }`;
  }

  private math(name: string, e: ts.CallExpression): string {
    if ((name === 'max' || name === 'min') && e.arguments.some(ts.isSpreadElement)) return `jsMath${name === 'max' ? 'Max' : 'Min'}(values: ${this.packed(e.arguments, 'JSArray<Double>')}.storage)`;
    const a = e.arguments.map((x) => this.coerce(x, 'Double'));
    const one: Record<string, string> = {
      floor: 'Foundation.floor', ceil: 'Foundation.ceil', abs: 'Swift.abs', sqrt: 'Foundation.sqrt', cbrt: 'Foundation.cbrt', trunc: 'Foundation.trunc',
      sin: 'Foundation.sin', cos: 'Foundation.cos', tan: 'Foundation.tan', asin: 'Foundation.asin', acos: 'Foundation.acos', atan: 'Foundation.atan',
      exp: 'Foundation.exp', log: 'Foundation.log', log2: 'Foundation.log2', log10: 'Foundation.log10', log1p: 'Foundation.log1p', expm1: 'Foundation.expm1',
      sinh: 'Foundation.sinh', cosh: 'Foundation.cosh', tanh: 'Foundation.tanh', sign: 'jsSign', round: 'jsRound', fround: 'jsFround',
    };
    if (one[name]) return `${one[name]}(${a[0]})`;
    switch (name) {
      case 'pow': return `jsPow(${a[0]}, ${a[1]})`;
      case 'atan2': return `Foundation.atan2(${a[0]}, ${a[1]})`;
      case 'hypot': return `jsHypot(${a.join(', ')})`;
      case 'min': return `jsMathMin(${a.join(', ')})`;
      case 'max': return `jsMathMax(${a.join(', ')})`;
      case 'random': return 'Double.random(in: 0..<1)';
    }
    throw this.error(e, `Math.${name}`);
  }

  /** A function argument for an array method: a closure literal with its declared parameters, or a function value. */
  private fn(e: ts.Expression): string {
    return ts.isArrowFunction(e) || ts.isFunctionExpression(e) ? this.closure(e) : this.expr(e);
  }

  private arrayMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const a = () => this.args(e);
    const el = this.typeOf(target).replace(/\?$/, '').replace(/^JSArray<(.*)>$/, '$1');
    switch (name) {
      case 'push': case 'unshift':
        if (e.arguments.some(ts.isSpreadElement)) return `${t}.${name}(contentsOf: ${this.packed(e.arguments, `JSArray<${el}>`)})`;
        return `${t}.${name}(${e.arguments.map((x) => this.coerce(x, el)).join(', ')})`;
      case 'pop': case 'shift': case 'reverse': case 'toString': case 'keys': case 'entries': case 'values': case 'flat': return `${t}.${name}()`;
      case 'splice': return `${t}.splice(${[...a().slice(0, 2), ...e.arguments.slice(2).map((x) => this.coerce(x, el))].join(', ')})`;
      case 'fill': return `${t}.fill(${a().join(', ')})`;
      case 'slice': case 'indexOf': case 'lastIndexOf': case 'includes': case 'at': return `${t}.${name}(${a().join(', ')})`;
      case 'join': return `${t}.join(${e.arguments[0] ? this.expr(e.arguments[0]) : ''})`;
      case 'concat': return `${t}.concat(${e.arguments.map((x) => (this.isArray(x) ? this.expr(x) : `[${this.coerce(x, el)}]`)).join(', ')})`;
      case 'map': case 'filter': case 'find': case 'findIndex': case 'findLast': case 'findLastIndex': case 'some': case 'every': case 'forEach': case 'flatMap':
        if (e.arguments.length > 1) throw this.error(e, `${name} with a thisArg`);
        return `${t}.${name}(${this.fn(e.arguments[0])})`;
      case 'sort': return e.arguments[0] ? `${t}.sort(${this.fn(e.arguments[0])})` : `${t}.sort()`;
      case 'reduce': case 'reduceRight': {
        const init = e.arguments[1];
        return init ? `${t}.${name}(${this.fn(e.arguments[0])}, ${this.coerce(init, this.typeOf(e))})` : `${t}.${name}(${this.fn(e.arguments[0])})`;
      }
    }
    throw this.error(e, `Array.${name}`);
  }

  private stringMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const first = e.arguments[0];
    if (first && this.typeOf(first) === 'JSRegExp') return this.regexpStringMethod(name, t, e);
    const a = this.args(e);
    const opt = (k: number) => (a[k] !== undefined ? a[k] : 'nil');
    switch (name) {
      case 'toLowerCase': case 'toLocaleLowerCase': return `${t}.lowercased()`;
      case 'toUpperCase': case 'toLocaleUpperCase': return `${t}.uppercased()`;
      case 'includes': return `jsIncludes(${t}, ${a[0]})`;
      case 'startsWith': return `jsStartsWith(${t}, ${a[0]}, ${opt(1)})`;
      case 'endsWith': return `jsEndsWith(${t}, ${a[0]}, ${opt(1)})`;
      case 'trim': return `jsTrim(${t})`;
      case 'trimStart': return `jsTrimStart(${t})`;
      case 'trimEnd': return `jsTrimEnd(${t})`;
      case 'split': return `jsSplit(${t}, ${a[0] ?? 'nil'}, ${opt(1)})`;
      case 'indexOf': return `jsIndexOf(${t}, ${a[0]}, ${opt(1)})`;
      case 'lastIndexOf': return `jsLastIndexOf(${t}, ${a[0]})`;
      case 'slice': return `jsSlice(${t}, ${a.join(', ')})`;
      case 'substring': return `jsSubstring(${t}, ${a[0] ?? '0'}, ${opt(1)})`;
      case 'replace': return `jsReplace(${t}, ${a[0]}, ${a[1]})`;
      case 'replaceAll': return `jsReplaceAll(${t}, ${a[0]}, ${a[1]})`;
      case 'charAt': return `jsCharAt(${t}, ${a[0] ?? '0'})`;
      case 'charCodeAt': return `jsCharCodeAt(${t}, ${a[0] ?? '0'})`;
      case 'codePointAt': return `jsCodePointAt(${t}, ${a[0] ?? '0'})`;
      case 'at': return `jsStringAt(${t}, ${a[0]})`;
      case 'repeat': return `jsRepeat(${t}, ${a[0]})`;
      case 'padStart': return `jsPadStart(${t}, ${a[0]}, ${a[1] ?? '" "'})`;
      case 'padEnd': return `jsPadEnd(${t}, ${a[0]}, ${a[1] ?? '" "'})`;
      case 'concat': return `(${[t, ...e.arguments.map((x) => this.str(x))].join(' + ')})`;
      case 'localeCompare': return `jsLocaleCompare(${t}, ${a[0]})`;
      case 'toString': case 'valueOf': return t;
    }
    throw this.error(e, `String.${name}`);
  }

  /** `s.replace(/x/g, …)`, `s.match(re)`, `s.split(re)`… */
  private regexpStringMethod(name: string, s: string, e: ts.CallExpression): string {
    const [re, second] = e.arguments;
    const r = this.expr(re);
    switch (name) {
      case 'match': return `jsMatch(${s}, ${r})`;
      case 'matchAll': return `jsMatchAll(${s}, ${r})`;
      case 'search': return `jsSearch(${s}, ${r})`;
      case 'split': return `jsSplit(${s}, ${r}${second ? `, ${this.expr(second)}` : ''})`;
      case 'replace': case 'replaceAll': {
        const fn = name === 'replace' ? 'jsReplace' : 'jsReplaceAll';
        if (!(ts.isArrowFunction(second) || ts.isFunctionExpression(second))) return `${fn}(${s}, ${r}, ${this.str(second)})`;
        if (name === 'replaceAll') throw this.error(e, 'replaceAll with a function');
        // The replacer gets the match, then each group.
        const m = this.fresh('__match');
        const binds = second.parameters.map((p, k) => `let ${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)} = ${this.typeOf(p.name) === 'Double' ? `${m}.index` : `${m}[${k}]`}`);
        const body = this.functionBody(second, 'String', this.indent);
        const inner = this.indent + '    ';
        return `${fn}(${s}, ${r}) { (${m}: JSMatch) ${this.throwsInfo.fn(second) ? 'throws ' : ''}-> String in\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)}`;
      }
    }
    throw this.error(e, `String.${name} with a RegExp`);
  }

  private numberMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const a = this.args(e);
    switch (name) {
      case 'toFixed': return `jsToFixed(${t}, ${a[0] ?? '0'})`;
      case 'toPrecision': return a[0] ? `jsToPrecision(${t}, ${a[0]})` : `js(${t})`;
      case 'toString': return a[0] ? `jsNumberToString(${t}, radix: ${a[0]})` : `js(${t})`;
      case 'valueOf': return t;
    }
    throw this.error(e, `Number.${name}`);
  }

  private returnsPromise(e: ts.Expression): boolean {
    const sig = this.checker.getTypeAtLocation(e).getCallSignatures()[0];
    return !!sig && this.type(sig.getReturnType(), e).startsWith('JSPromise<');
  }

  /** A rejection handler: it takes the reason untyped, whatever its parameter declares. */
  private rejectionHandler(e: ts.Expression): string {
    if (!(ts.isArrowFunction(e) || ts.isFunctionExpression(e)) || !e.parameters.length) return this.fn(e);
    const p = e.parameters[0];
    if (this.typeOf(p.name) === 'Any?' && ts.isIdentifier(p.name)) return this.closure(e);
    const ret = this.returnTypeOf(e);
    const reason = this.fresh('__reason');
    const body = this.functionBody(e, ret, this.indent);
    const bind = this.nested(() => this.bindTo(p.name, ts.isIdentifier(p.name) ? this.fromAny(reason, this.typeOf(p.name)) : reason, '', false));
    return `{ (${reason}: Any?) ${this.throwsInfo.fn(e) ? 'throws ' : ''}-> ${ret} in\n${bind}${body.slice(1)}`;
  }

  private promiseMethod(name: string, target: ts.Expression, e: ts.CallExpression): string {
    const t = this.expr(target);
    const [f, g] = e.arguments;
    const value = this.typeOf(target).replace(/^JSPromise<(.*)>\??$/, '$1');
    switch (name) {
      case 'then': {
        const adopt = (f && this.returnsPromise(f)) || (g && this.returnsPromise(g));
        return `${t}.${adopt ? 'thenAdopt' : 'then'}(${[f && this.fn(f), g && this.rejectionHandler(g)].filter(Boolean).join(', ')})`;
      }
      case 'catch': {
        const result = this.typeOf(e).replace(/^JSPromise<(.*)>$/, '$1');
        const adopt = this.returnsPromise(f);
        if (result === value) return `${t}.${adopt ? 'catchAdopt' : 'catch'}(${this.rejectionHandler(f)})`;
        // The fulfilled value passes through as the wider type the catch handler's result makes.
        const pass = `{ (__value: ${value}) -> ${adopt ? `JSPromise<${result}>` : result} in ${value === 'Never' ? 'switch __value {}' : adopt ? `JSPromise<${result}>.resolve(__value)` : 'return __value'} }`;
        return `${t}.${adopt ? 'thenAdopt' : 'then'}(${pass}, ${this.rejectionHandler(f)})`;
      }
      case 'finally': return `${t}.finally(${this.fn(f)})`;
    }
    throw this.error(e, `Promise.${name}`);
  }

  private collectionMethod(name: string, target: ts.Expression, e: ts.CallExpression, q: string): string {
    const t = `${this.expr(target)}${q}`;
    const type = this.typeOf(target).replace(/\?$/, '');
    const [k, v] = /^JSMap<(.*), (.*)>$/.exec(type)?.slice(1) ?? [/^JSSet<(.*)>$/.exec(type)?.[1] ?? 'Any?', ''];
    const arg = (n: number, as: string) => this.coerce(e.arguments[n], as);
    switch (name) {
      case 'get': case 'has': case 'delete': return `${t}.${name}(${arg(0, k)})`;
      case 'set': return `${t}.set(${arg(0, k)}, ${arg(1, v)})`;
      case 'add': return `${t}.add(${arg(0, k)})`;
      case 'clear': case 'keys': case 'values': case 'entries': return `${t}.${name}()`;
      case 'forEach': {
        const f = e.arguments[0];
        if (!(ts.isArrowFunction(f) || ts.isFunctionExpression(f))) return `${t}.forEach(${this.expr(f)})`;
        // The map passes (value, key); a callback declaring fewer parameters ignores the rest.
        const params = f.parameters.map((p) => `${ident((p.name as ts.Identifier).text)}: ${this.typeOf(p.name)}`);
        const types = v ? [v, k] : [k, k];
        while (params.length < 2) params.push(`_: ${types[params.length]}`);
        const throws = this.throwsInfo.fn(f) ? 'throws ' : '';
        return `${t}.forEach { (${params.join(', ')}) ${throws}-> Void in${this.functionBody(f, 'Void', this.indent).slice(1)}`;
      }
    }
    throw this.error(e, `${type.startsWith('JSMap') ? 'Map' : 'Set'}.${name}`);
  }

  private newExpr(e: ts.NewExpression): string {
    const t = this.typeOf(e);
    const callee = e.expression;
    const name = ts.isIdentifier(callee) ? callee.text : '';
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (/^JS(Map|Set)</.test(t)) {
      if (!args.length) return `${t}()`;
      const src = args[0];
      return `${t}(${this.iterable(src)})`;
    }
    if (t.startsWith('JSPromise<')) {
      const v = t.replace(/^JSPromise<(.*)>$/, '$1');
      const ex = args[0];
      if (!ex || !(ts.isArrowFunction(ex) || ts.isFunctionExpression(ex))) throw this.error(e, 'a Promise executor that is not a function literal');
      const r = this.fresh('__resolvers');
      const [res, rej] = ex.parameters.map((p) => p.name as ts.Identifier);
      const binds: string[] = [];
      if (res) { this.resolvers.set(this.resolve(res)!, { name: r, type: v }); binds.push(`let ${ident(res.text)}: (${v}) -> Void = { ${r}.resolve($0) }`); }
      if (rej) binds.push(`let ${ident(rej.text)}: (Any?) -> Void = { ${r}.reject($0) }`);
      const body = this.functionBody(ex, 'Void', this.indent);
      const inner = this.indent + '    ';
      return `${t} { (${r}: JSResolvers<${v}>) throws -> Void in\n${binds.map((b) => inner + b).join('\n')}${body.slice(1)}`;
    }
    if (ERRORS[name] && this.isLibGlobal(callee as ts.Identifier) === false && ERRORS[name] === t) {
      return `${t}(${args.length ? this.coerce(args[0], 'String') : ''})`;
    }
    if (ERRORS[name]) return `${ERRORS[name]}(${args.length ? this.str(args[0]) : ''})`;
    if (name === 'Date' && this.isLibGlobal(callee as ts.Identifier)) {
      if (args.length === 1) return `JSDate(${this.isString(args[0]) ? this.expr(args[0]) : this.toNumber(args[0])})`;
      return `JSDate(${args.map((a) => this.toNumber(a)).join(', ')})`;
    }
    if (name === 'RegExp') return `JSRegExp(${this.str(args[0])}${args[1] ? `, ${this.str(args[1])}` : ''})`;
    if (name === 'Array') throw this.error(e, `new ${name}`);
    const core = this.core.construct(e) ?? this.native.construct(e);
    if (core) return core;
    if (ts.isIdentifier(callee)) {
      const decl = this.checker.getTypeAtLocation(callee).getSymbol()?.valueDeclaration;
      if (decl && ts.isClassLike(decl) && !decl.getSourceFile().isDeclarationFile) return `${t}(${this.args(e).join(', ')})`;
      if (!args.length) return `${t}()`;
      return `${t}(${this.args(e).join(', ')})`;
    }
    throw this.error(e, 'new');
  }

  private typeofExpr(e: ts.TypeOfExpression): string {
    const t = this.typeOf(e.expression);
    const base = t.replace(/\?$/, '');
    if (base === 'Void') return '"undefined"';
    const known = base === 'Double' ? 'number' : base === 'String' ? 'string' : base === 'Bool' ? 'boolean' : base.includes('->') ? 'function' : base === 'Any' ? null : 'object';
    if (t === 'Any?' || !known) return `jsTypeof(${this.expr(e.expression)})`;
    const maybe = this.maybeUndefined(e.expression);
    if (maybe) return `(${maybe} == nil ? "undefined" : ${swiftString(known)})`;
    return t.endsWith('?') ? `(${this.expr(e.expression)} == nil ? "undefined" : ${swiftString(known)})` : swiftString(known);
  }

  private prefix(e: ts.PrefixUnaryExpression): string {
    const K = ts.SyntaxKind;
    switch (e.operator) {
      case K.ExclamationToken: {
        const operand = this.isBool(e.operand) && !this.maybeUndefined(e.operand) ? this.expr(e.operand) : this.cond(e.operand);
        return operand.startsWith('!') ? `!(${operand})` : `!${operand}`;
      }
      case K.MinusToken: return ts.isNumericLiteral(e.operand) ? `-${this.expr(e.operand)}` : `-${this.toNumber(e.operand)}`;
      case K.PlusToken: return this.toNumber(e.operand);
      case K.TildeToken: return `jsBitNot(${this.toNumber(e.operand)})`;
      case K.PlusPlusToken: return `jsPreIncrement(&${this.lvalue(e.operand)})`;
      case K.MinusMinusToken: return `jsPreDecrement(&${this.lvalue(e.operand)})`;
    }
    throw this.error(e, 'prefix operator');
  }

  private binary(e: ts.BinaryExpression): string {
    const op = e.operatorToken.kind;
    const K = ts.SyntaxKind;
    const l = () => this.expr(e.left);
    const r = () => this.expr(e.right);
    const target = () => this.lvalue(e.left);
    const bit: Partial<Record<ts.SyntaxKind, string>> = {
      [K.AmpersandToken]: 'jsBitAnd', [K.BarToken]: 'jsBitOr', [K.CaretToken]: 'jsBitXor',
      [K.LessThanLessThanToken]: 'jsShiftLeft', [K.GreaterThanGreaterThanToken]: 'jsShiftRight', [K.GreaterThanGreaterThanGreaterThanToken]: 'jsShiftRightUnsigned',
    };
    const compound: Partial<Record<ts.SyntaxKind, ts.SyntaxKind>> = {
      [K.AmpersandEqualsToken]: K.AmpersandToken, [K.BarEqualsToken]: K.BarToken, [K.CaretEqualsToken]: K.CaretToken,
      [K.LessThanLessThanEqualsToken]: K.LessThanLessThanToken, [K.GreaterThanGreaterThanEqualsToken]: K.GreaterThanGreaterThanToken,
      [K.GreaterThanGreaterThanGreaterThanEqualsToken]: K.GreaterThanGreaterThanGreaterThanToken,
    };
    if (bit[op]) return `${bit[op]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
    if (compound[op]) return `${target()} = ${bit[compound[op]!]}(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
    switch (op) {
      case K.EqualsToken: {
        if (ts.isPropertyAccessExpression(e.left) && this.symbolName(e.left.expression) === 'VueRef' && e.left.name.text === 'value') return `${target()} = ${this.signalWrite(e.left.expression, e.right, this.typeOf(e.left))}`;
        if (ts.isArrayLiteralExpression(e.left)) throw this.error(e, 'a destructuring assignment');
        if (ts.isPropertyAccessExpression(e.left)) {
          const special = this.core.assign(e.left, e.right) ?? this.native.assign(e.left, e.right);
          if (special) return special;
        }
        if (ts.isPropertyAccessExpression(e.left) && this.isAny(e.left.expression)) return `jsSet(${this.expr(e.left.expression)}, ${swiftString(e.left.name.text)}, ${this.coerce(e.right, 'Any?')})`;
        if (ts.isElementAccessExpression(e.left) && this.isAny(e.left.expression)) return `jsSet(${this.expr(e.left.expression)}, ${this.str(e.left.argumentExpression)}, ${this.coerce(e.right, 'Any?')})`;
        return `${target()} = ${this.coerce(e.right, this.declaredTypeOf(e.left) ?? this.typeOf(e.left))}`;
      }
      case K.PlusEqualsToken: return this.isString(e.left) ? `${target()} += ${this.str(e.right)}` : `${target()} += ${this.toNumber(e.right)}`;
      case K.MinusEqualsToken: return `${target()} -= ${this.toNumber(e.right)}`;
      case K.AsteriskEqualsToken: return `${target()} *= ${this.toNumber(e.right)}`;
      case K.SlashEqualsToken: return `${target()} /= ${this.toNumber(e.right)}`;
      case K.PercentEqualsToken: return `${target()} = jsMod(${l()}, ${this.toNumber(e.right)})`;
      case K.AsteriskAsteriskEqualsToken: return `${target()} = jsPow(${l()}, ${this.toNumber(e.right)})`;
      case K.QuestionQuestionEqualsToken: return `${target()} = ${l()} ?? ${this.coerce(e.right, this.typeOf(e.left).replace(/\?$/, ''))}`;
      case K.BarBarEqualsToken: return `if !jsTruthy(${l()}) { ${target()} = ${this.coerce(e.right, this.typeOf(e.left))} }`;
      case K.AmpersandAmpersandEqualsToken: return `if jsTruthy(${l()}) { ${target()} = ${this.coerce(e.right, this.typeOf(e.left))} }`;
      case K.PlusToken: {
        if (this.isString(e.left) || this.isString(e.right)) return `${this.str(e.left)} + ${this.str(e.right)}`;
        if (this.isAny(e.left) || this.isAny(e.right)) return `jsAdd(${this.coerce(e.left, 'Any?')}, ${this.coerce(e.right, 'Any?')})`;
        return `${this.toNumber(e.left)} + ${this.toNumber(e.right)}`;
      }
      case K.MinusToken: return `${this.toNumber(e.left)} - ${this.toNumber(e.right)}`;
      case K.AsteriskToken: return `${this.toNumber(e.left)} * ${this.toNumber(e.right)}`;
      case K.SlashToken: return `${this.toNumber(e.left)} / ${this.toNumber(e.right)}`;
      case K.PercentToken: return `jsMod(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      case K.AsteriskAsteriskToken: return `jsPow(${this.toNumber(e.left)}, ${this.toNumber(e.right)})`;
      case K.EqualsEqualsEqualsToken: case K.ExclamationEqualsEqualsToken: case K.EqualsEqualsToken: case K.ExclamationEqualsToken:
        return this.equality(e);
      case K.LessThanToken: case K.GreaterThanToken: case K.LessThanEqualsToken: case K.GreaterThanEqualsToken: {
        const sym = ts.tokenToString(op)!;
        if (this.isString(e.left) && this.isString(e.right)) return `jsCompare(${l()}, ${r()}) ${sym} 0`;
        return `${this.toNumber(e.left)} ${sym} ${this.toNumber(e.right)}`;
      }
      case K.QuestionQuestionToken: {
        const t = this.typeOf(e);
        const maybe = this.maybeUndefined(e.left);
        if (maybe && t === 'Any?') return `jsNullishCoalesce(${maybe} as Any?, ${this.coerce(e.right, 'Any?')})`;
        if (maybe) return `(${maybe} ?? ${this.coerce(e.right, t)})`;
        if (this.isAny(e.left)) return `jsNullishCoalesce(${l()}, ${this.coerce(e.right, 'Any?')})`;
        return `(${l()} ?? ${this.coerce(e.right, t)})`;
      }
      case K.AmpersandAmpersandToken: case K.BarBarToken: {
        const sym = op === K.AmpersandAmpersandToken ? '&&' : '||';
        if (this.isBool(e.left) && this.isBool(e.right)) return `${l()} ${sym} ${r()}`;
        // JavaScript returns an operand, not a Bool.
        const t = this.typeOf(e);
        const v = this.fresh('__v');
        const right = this.coerce(e.right, t);
        const lt = this.tryPrefix(e.left) ? 'try ' : '';
        const rt = this.tryPrefix(e.right) ? 'try ' : '';
        const throws = lt || rt ? 'throws ' : '';
        const leftType = this.typeOf(e.left);
        // The left operand is evaluated once; the result is it, unwrapped or boxed as the result's type needs.
        const leftValue = leftType === t || t === 'Any?' ? v : leftType === optionalType(t) ? `${v}!` : leftType === 'Any?' ? this.fromAny(v, t) : v;
        return op === K.BarBarToken
          ? `({ () ${throws}-> ${t} in let ${v} = ${lt}${this.expr(e.left)}; return jsTruthy(${v}) ? ${leftValue} : ${rt}${right} }())`
          : `({ () ${throws}-> ${t} in let ${v} = ${lt}${this.expr(e.left)}; return jsTruthy(${v}) ? ${rt}${right} : ${leftValue} }())`;
      }
      case K.InstanceOfKeyword: {
        const name = e.right.getText();
        return `(${l()} is ${ERRORS[name] ?? this.typeOf(e.right).replace(/^typeof /, '') ?? name})`;
      }
      case K.CommaToken: return `({ ${this.exprStatement(e.left)}; return ${r()} }())`;
      case K.InKeyword: return `jsHasKey(${this.coerce(e.right, 'Any?')}, ${this.str(e.left)})`;
    }
    throw this.error(e, `operator ${ts.tokenToString(op)}`);
  }

  private equality(e: ts.BinaryExpression): string {
    const K = ts.SyntaxKind;
    const op = e.operatorToken.kind;
    const negate = op === K.ExclamationEqualsEqualsToken || op === K.ExclamationEqualsToken;
    const strict = op === K.EqualsEqualsEqualsToken || op === K.ExclamationEqualsEqualsToken;
    const isNullish = (x: ts.Expression) => x.kind === K.NullKeyword || (ts.isIdentifier(x) && x.text === 'undefined');
    const [a, b] = [e.left, e.right];
    const lt = this.typeOf(a);
    const rt = this.typeOf(b);
    // Comparing a typed optional with null or undefined.
    const maybe = isNullish(b) ? this.maybeUndefined(a) : isNullish(a) ? this.maybeUndefined(b) : null;
    if (maybe) return `${maybe} ${negate ? '!=' : '=='} nil`;
    if (isNullish(b) && lt !== 'Any?') return `${this.expr(a)} ${negate ? '!=' : '=='} nil`;
    if (isNullish(a) && rt !== 'Any?') return `${this.expr(b)} ${negate ? '!=' : '=='} nil`;
    if (lt === 'Any?' || rt === 'Any?' || (lt !== rt && lt.replace(/\?$/, '') !== rt.replace(/\?$/, ''))) {
      if (!strict && (isNullish(a) || isNullish(b))) return `${negate ? '!' : ''}jsIsNullish(${this.coerce(isNullish(a) ? b : a, 'Any?')})`;
      const fn = strict ? 'jsStrictEquals' : 'jsLooseEquals';
      return `${negate ? '!' : ''}${fn}(${this.coerce(a, 'Any?')}, ${this.coerce(b, 'Any?')})`;
    }
    if (this.isObjectRef(a) && this.isObjectRef(b)) return `${this.expr(a)} ${negate ? '!==' : '==='} ${this.expr(b)}`;
    return `${this.expr(a)} ${negate ? '!=' : '=='} ${this.expr(b)}`;
  }

  private array(e: ts.ArrayLiteralExpression): string {
    // `[]` alone is never[]; its element type comes from where it goes.
    const context = this.checker.getContextualType(e);
    let t = this.typeOf(e);
    if (context && !(context.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter))) {
      const c = this.type(context, e).replace(/\?$/, '');
      if (c.startsWith('JSArray<') || c.startsWith('(') || !e.elements.length) t = c;
    }
    if (t === 'Any?') t = 'JSArray<Any?>';
    if (t.startsWith('(')) return `(${e.elements.map((x) => this.expr(x)).join(', ')})`;
    const el = t.replace(/^JSArray<(.*)>$/, '$1');
    if (!e.elements.length) return `${t}()`;
    const parts: string[] = [];
    let run: string[] = [];
    for (const x of e.elements) {
      if (ts.isSpreadElement(x)) {
        if (run.length) { parts.push(`[${run.join(', ')}]`); run = []; }
        parts.push(`Array(${this.iterable(x.expression)})`);
      } else if (ts.isOmittedExpression(x)) throw this.error(x, 'an array hole');
      else run.push(this.coerce(x, el));
    }
    if (run.length) parts.push(`[${run.join(', ')}]`);
    return `${t}(${parts.join(' + ')})`;
  }

  private object(e: ts.ObjectLiteralExpression): string {
    const contextual = this.checker.getContextualType(e);
    const type = contextual && !(contextual.flags & ts.TypeFlags.Any) ? contextual : this.checker.getTypeAtLocation(e);
    const struct = this.native.structLiteral(e, this.checker.getNonNullableType(type));
    if (struct) return struct;
    const name = this.type(this.checker.getNonNullableType(type), e).replace(/\?$/, '');
    if (name.startsWith('JSRecord<')) {
      const v = name.replace(/^JSRecord<(.*)>$/, '$1');
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `(${swiftString(p.name.getText().replace(/^['"]|['"]$/g, ''))}, ${this.coerce(p.initializer, v)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `(${swiftString(p.name.text)}, ${ident(p.name.text)})`;
        throw this.error(p, 'this member in a dictionary literal');
      });
      return entries.length ? `${name}([${entries.join(', ')}])` : `${name}()`;
    }
    if (name === 'Any?') return this.dynamicObject(e);
    const decl = this.checker.getNonNullableType(type).getSymbol()?.declarations?.[0];
    const shape = [...this.shapes.values()].find((s) => s.name === name);
    let order: { name: string; type: string }[];
    let target = name;
    if (this.protocols.has(name) && decl && ts.isInterfaceDeclaration(decl)) {
      target = `${name}Object`;
      order = [
        ...decl.members.filter(ts.isPropertySignature).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) })),
        ...decl.members.filter(ts.isMethodSignature).map((m) => ({ name: m.name.getText(), type: this.typeOf(m), label: `_${m.name.getText()}` })),
      ];
    } else if (shape) order = shape.fields;
    else if (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl))) {
      order = decl.members.filter(ts.isPropertySignature).map((m) => ({ name: (m.name as ts.Identifier).text, type: m.questionToken ? optionalType(this.typeOf(m)) : this.typeOf(m) }));
    } else throw this.error(e, `an object literal of type ${name}`);
    const given = new Map<string, string>();
    for (const p of e.properties) {
      if (ts.isPropertyAssignment(p)) {
        const key = p.name.getText().replace(/^['"]|['"]$/g, '');
        given.set(key, this.coerce(p.initializer, order.find((f) => f.name === key)?.type ?? 'Any?'));
      } else if (ts.isShorthandPropertyAssignment(p)) given.set(p.name.text, this.narrowed(p.name, ident(p.name.text)));
      else if (ts.isSpreadAssignment(p)) {
        const src = this.expr(p.expression);
        const fields = new Set(this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name));
        for (const f of order) if (fields.has(f.name)) given.set(f.name, `${src}.${ident(f.name)}`);
      } else if (ts.isMethodDeclaration(p)) {
        given.set(p.name.getText(), `{ (${this.params(p, true)}) ${this.throwsInfo.fn(p) ? 'throws ' : ''}-> ${this.returnTypeOf(p)} in${this.functionBody(p, this.returnTypeOf(p), this.indent).slice(1)}`);
      } else throw this.error(p, 'object member');
    }
    this.used.add(name);
    const written: string[] = [];
    for (const p of e.properties) {
      const keys = ts.isSpreadAssignment(p) ? this.checker.getTypeAtLocation(p.expression).getProperties().map((x) => x.name) : p.name ? [p.name.getText().replace(/^['"]|['"]$/g, '')] : [];
      for (const k of keys) if (!written.includes(k) && order.some((f) => f.name === k)) written.push(k);
    }
    const declared = order.map((f) => f.name).filter((n) => written.includes(n));
    const reorder = written.join() !== declared.join() ? `, jsOrder: [${written.map(swiftString).join(', ')}]` : '';
    const args = order.filter((f) => given.has(f.name)).map((f) => `${ident((f as { label?: string }).label ?? f.name)}: ${given.get(f.name)}`).join(', ');
    return `${target}(${args}${args && reorder ? reorder : reorder.slice(2)})`;
  }

  /** An object literal typed `any`: a plain JavaScript object. */
  private dynamicObject(e: ts.ObjectLiteralExpression): string {
    const entries = e.properties.map((p) => {
      if (ts.isPropertyAssignment(p)) return `(${swiftString(p.name.getText().replace(/^['"]|['"]$/g, ''))}, ${this.coerce(p.initializer, 'Any?')})`;
      if (ts.isShorthandPropertyAssignment(p)) return `(${swiftString(p.name.text)}, ${ident(p.name.text)} as Any?)`;
      throw this.error(p, 'this member in an untyped object literal');
    });
    return `JSObject([${entries.join(', ')}])`;
  }

  error(n: ts.Node | undefined, what: string): Error {
    if (!n) return new Error(`${what} is not supported in a release build yet`);
    const sf = n.getSourceFile();
    const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
    return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${what} is not supported in a release build yet: ${n.getText().slice(0, 80)}`);
  }
}

/** Swift's spelling of what the async lowering writes. */
const SWIFT_SYNTAX: AsyncSyntax = {
  voidType: 'Void',
  fnType: (params, ret) => `(${params.map((p) => (p === '() -> Void' ? `@escaping ${p}` : p)).join(', ')}) -> ${ret}`,
  constant: (name, type, value) => `let ${name}${type ? `: ${type}` : ''} = ${value}`,
  closure: (params, body, onError, i) => {
    const list = `(${params.map(([n, t]) => `${n}: ${t === '() -> Void' ? '@escaping ' : ''}${t}`).join(', ')})`;
    if (!body.some((l) => /\btry\b|\bthrow\b/.test(l))) return `{ ${list} -> Void in\n${body.join('\n')}\n${i}}`;
    const deeper = body.map((l) => '    ' + l);
    return `{ ${list} -> Void in\n${i}    do {\n${deeper.join('\n')}\n${i}    } catch {\n${i}        ${onError}(jsCaught(error))\n${i}    }\n${i}}`;
  },
  inline: (statement, param) => (param ? `{ (${param[0]}: ${param[1]}) -> Void in ${statement} }` : `{ ${statement} }`),
  ifOpen: (cond) => `if ${cond} {`,
  elseOpen: '} else {',
  ifLine: (cond, statements) => `if ${cond} { ${statements} }`,
  scopeOpen: 'do {',
  tryBlock: (body, onError, i) => (body.some((l) => /\btry\b|\bthrow\b/.test(l))
    ? [`${i}do {`, ...body.map((l) => '    ' + l), `${i}} catch {`, `${i}    ${onError}(jsCaught(error))`, `${i}}`]
    : [`${i}do {`, ...body, `${i}}`]),
  unwrap: (code) => `${code}!`,
  makeIterator: (name, seq) => `var ${name} = ${seq}.makeIterator()`,
  nextItem: (item, iterator, otherwise, i) => [`${i}guard let ${item} = ${iterator}.next() else { ${otherwise} }`],
  awaitCall: (operand, isPromise, continuation, onError) => `jsAwait(${isPromise ? operand : `value: ${operand}`}, ${continuation}, ${onError})`,
  asyncStart: (cap, result) => `let ${cap} = JSAsync<${result}>()`,
  asyncBody: (cap) => [`${cap}.body {`, '}'],
  asyncReturn: (cap, value, isPromise, result) => (value === null ? `${cap}.returnValue(${result === 'Void' ? '()' : 'nil'})` : `${cap}.${isPromise ? 'returnPromise' : 'returnValue'}(${value})`),
  asyncError: (cap) => `${cap}.throwValue`,
  loopRun: (iteration) => `JSAsyncLoop().run ${iteration}`,
};

const LIB_CONSTANTS: Record<string, string> = {
  'Math.PI': 'Double.pi', 'Math.E': 'M_E', 'Math.LN2': 'M_LN2', 'Math.LN10': 'M_LN10', 'Math.LOG2E': 'M_LOG2E', 'Math.LOG10E': 'M_LOG10E', 'Math.SQRT2': '2.0.squareRoot()', 'Math.SQRT1_2': '0.5.squareRoot()',
  'Number.MAX_SAFE_INTEGER': '9007199254740991', 'Number.MIN_SAFE_INTEGER': '-9007199254740991', 'Number.EPSILON': 'Double.ulpOfOne',
  'Number.MAX_VALUE': 'Double.greatestFiniteMagnitude', 'Number.MIN_VALUE': 'Double.leastNonzeroMagnitude', 'Number.POSITIVE_INFINITY': 'Double.infinity',
  'Number.NEGATIVE_INFINITY': '-Double.infinity', 'Number.NaN': 'Double.nan',
};

function boundNames(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : boundNames(e.name)));
}

function hasModifier(n: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(n) && !!ts.getModifiers(n)?.some((m) => m.kind === kind);
}

function numberLiteral(text: string): string {
  const t = text.replace(/_/g, '');
  if (/^0[xob]/i.test(t)) return String(Number(t));
  if (/^0\d+$/.test(t)) return String(parseInt(t, 8));
  if (t.startsWith('.')) return '0' + t;
  if (t.endsWith('.')) return t + '0';
  return t;
}

function numericLiteralOnly(e: ts.Expression): boolean {
  if (ts.isParenthesizedExpression(e)) return numericLiteralOnly(e.expression);
  if (ts.isNumericLiteral(e)) return true;
  if (ts.isPrefixUnaryExpression(e)) return numericLiteralOnly(e.operand);
  if (ts.isBinaryExpression(e)) return numericLiteralOnly(e.left) && numericLiteralOnly(e.right);
  return false;
}

function isWriteTarget(e: ts.Node): boolean {
  const p = e.parent;
  if (ts.isBinaryExpression(p) && p.left === e && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) return true;
  if ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken)) return true;
  return false;
}

function refersToThis(e: ts.Node): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (n.kind === ts.SyntaxKind.ThisKeyword) found = true;
    if (!found && !ts.isFunctionDeclaration(n)) ts.forEachChild(n, visit);
  };
  visit(e);
  return found;
}

/** Whether a `continue label` inside `n` targets the loop labeled `label`. */
function continuesTo(n: ts.Node, label: string): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found || ts.isFunctionLike(c)) return;
    if (ts.isContinueStatement(c) && c.label?.text === label) { found = true; return; }
    ts.forEachChild(c, visit);
  };
  visit(n);
  return found;
}

function containsJump(n: ts.Node, kind: ts.SyntaxKind): boolean {
  let found = false;
  const visit = (c: ts.Node) => {
    if (found || ts.isFunctionLike(c)) return;
    if (c.kind === kind) {
      // A break or continue inside a nested loop belongs to that loop.
      found = true;
      return;
    }
    if ((kind === ts.SyntaxKind.ContinueStatement || kind === ts.SyntaxKind.BreakStatement) && (ts.isIterationStatement(c, false))) return;
    ts.forEachChild(c, visit);
  };
  ts.forEachChild(n, visit);
  if (n.kind === kind) return true;
  return found;
}

/** Whether a closure inside `body` refers to the variable `name` declares. */
function capturedIn(name: ts.Identifier, body: ts.Node, checker: ts.TypeChecker): boolean {
  const sym = checker.getSymbolAtLocation(name);
  let found = false;
  const visit = (n: ts.Node, inClosure: boolean) => {
    if (found) return;
    if (inClosure && ts.isIdentifier(n) && checker.getSymbolAtLocation(n) === sym) { found = true; return; }
    ts.forEachChild(n, (c) => visit(c, inClosure || ts.isFunctionLike(n)));
  };
  visit(body, false);
  return found;
}

/** `A, (B, C), D<E, F>` split at its top-level commas. */
function splitTopLevel(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}
