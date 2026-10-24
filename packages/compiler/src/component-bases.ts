import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * A component extending a class, as Angular's InheritDefinitionFeature merges them: one class with the base's members
 * (fields, inputs and outputs, methods, hooks) copied in, overridden ones left out, `super.m()` calling the base's `m`
 * copied under a name of its own, and the base's constructor run where `super(…)` would run it. The base itself stays
 * a class of its own, so what needs the subclass to be one (`instanceof Base`, injecting or querying by `Base`, `Base`
 * as a type) stops the build (`refuseBaseUses`).
 */

const parse = (file: string, text: string) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const classIn = (sf: ts.SourceFile, name: string) => sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === name);
const unsupported = (where: string, what: string) => new Error(`${where}: ${what} is not supported in a release build yet`);
const isStatic = (m: ts.Node) => !!(ts.canHaveModifiers(m) && ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword));
const isAbstract = (m: ts.Node) => !!(ts.canHaveModifiers(m) && ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.AbstractKeyword));
const decoratorsOf = (m: ts.Node) => (ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []);
const memberName = (m: ts.ClassElement) => (m.name && (ts.isIdentifier(m.name) || ts.isPrivateIdentifier(m.name) || ts.isStringLiteral(m.name)) ? m.name.text : undefined);
const lineOf = (n: ts.Node) => n.getSourceFile().getLineAndCharacterOfPosition(n.getStart()).line + 1;
const withoutExt = (f: string) => f.replace(/\.tsx?$/, '').replace(/\/index$/, '');

/** An import's file: relative, or under the app's `~/` or `@/` alias (its `src` or `app` folder). */
export function resolveClassImport(fromFile: string, spec: string): string | undefined {
  const candidates: string[] = [];
  if (spec.startsWith('.')) {
    const base = join(dirname(fromFile), spec);
    candidates.push(base + '.ts', join(base, 'index.ts'));
  } else if (spec.startsWith('~/') || spec.startsWith('@/')) {
    const sub = spec.slice(2);
    for (let dir = dirname(fromFile); dirname(dir) !== dir; dir = dirname(dir)) {
      if (!existsSync(join(dir, 'package.json'))) continue;
      for (const appDir of ['src', 'app']) candidates.push(join(dir, appDir, sub + '.ts'), join(dir, appDir, sub, 'index.ts'));
      break;
    }
  }
  return candidates.find((c) => existsSync(c));
}

type Read = (file: string) => string;
const readFile: Read = (f) => readFileSync(f, 'utf8');

/** The class a module exports as `name`, followed through re-exports (`export * from`, `export { X as name } from`). */
function exportedClass(file: string, name: string, read: Read, seen = new Set<string>()): { file: string; name: string } | undefined {
  if (seen.has(`${file}#${name}`)) return undefined;
  seen.add(`${file}#${name}`);
  const sf = parse(file, read(file));
  if (classIn(sf, name)) return { file, name };
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveClassImport(file, st.moduleSpecifier.text);
      if (!target) continue;
      if (!st.exportClause) {
        const found = exportedClass(target, name, read, seen);
        if (found) return found;
      } else if (ts.isNamedExports(st.exportClause)) {
        const el = st.exportClause.elements.find((e) => e.name.text === name);
        if (el) return exportedClass(target, (el.propertyName ?? el.name).text, read, seen);
      }
    } else if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) {
      // `import { X } from './x'; export { X as name };`
      const el = st.exportClause.elements.find((e) => e.name.text === name);
      const local = el ? (el.propertyName ?? el.name).text : undefined;
      if (local) return classOfName(file, sf, local, read, seen);
    }
  }
  return undefined;
}

/** The class a file's own name refers to: declared there, or imported. */
function classOfName(file: string, sf: ts.SourceFile, name: string, read: Read, seen = new Set<string>()): { file: string; name: string } | undefined {
  if (classIn(sf, name)) return { file, name };
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const bindings = st.importClause.namedBindings;
    const el = bindings && ts.isNamedImports(bindings) ? bindings.elements.find((e) => e.name.text === name) : undefined;
    if (!el) continue;
    const target = resolveClassImport(file, st.moduleSpecifier.text);
    return target ? exportedClass(target, (el.propertyName ?? el.name).text, read, seen) : undefined;
  }
  return undefined;
}

function extendsOf(cls: ts.ClassDeclaration): ts.ExpressionWithTypeArguments | undefined {
  return cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
}

function baseOf(file: string, sf: ts.SourceFile, cls: ts.ClassDeclaration, read: Read): { file: string; name: string } {
  const ext = extendsOf(cls)!;
  const where = `${file}:${lineOf(ext)}`;
  if (!ts.isIdentifier(ext.expression)) throw unsupported(where, `the component ${cls.name!.text} extending ${ext.expression.getText()}`);
  const found = classOfName(file, sf, ext.expression.text, read);
  if (!found) throw unsupported(where, `the component ${cls.name!.text} extending ${ext.expression.text}, a class the build finds no source of in the app`);
  return found;
}

/** Where a top-level name of a file comes from: a module's export, or the file's own declaration. */
interface Binding { module: string; spec: string; name: string; typeOnly: boolean; exported: boolean }

function bindingsOf(file: string, sf: ts.SourceFile): Map<string, Binding> {
  const out = new Map<string, Binding>();
  const exportsAs = new Map<string, string>();
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const e of st.exportClause.elements) exportsAs.set((e.propertyName ?? e.name).text, e.name.text);
    }
  }
  const own = (name: string, node: ts.Node) => {
    const exported = !!(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
    const typeOnly = ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
    out.set(name, { module: withoutExt(file), spec: '', name: exported ? name : exportsAs.get(name) ?? name, typeOnly, exported: exported || exportsAs.has(name) });
  };
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause && ts.isStringLiteral(st.moduleSpecifier)) {
      const spec = st.moduleSpecifier.text;
      const target = resolveClassImport(file, spec);
      const module = target ? withoutExt(target) : spec;
      const clause = st.importClause;
      if (clause.name) out.set(clause.name.text, { module, spec, name: 'default', typeOnly: clause.isTypeOnly, exported: true });
      const b = clause.namedBindings;
      if (b && ts.isNamespaceImport(b)) out.set(b.name.text, { module, spec, name: '*', typeOnly: clause.isTypeOnly, exported: true });
      if (b && ts.isNamedImports(b)) for (const e of b.elements) out.set(e.name.text, { module, spec, name: (e.propertyName ?? e.name).text, typeOnly: clause.isTypeOnly || e.isTypeOnly, exported: true });
    } else if ((ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st) || ts.isModuleDeclaration(st)) && st.name && ts.isIdentifier(st.name)) {
      own(st.name.text, st);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) own(d.name.text, st);
    }
  }
  return out;
}

/** The names a node declares inside itself (parameters, locals), which a top-level name of the same spelling does not reach. */
function localNames(node: ts.Node): Set<string> {
  const out = new Set<string>();
  const visit = (n: ts.Node) => {
    if ((ts.isParameter(n) || ts.isVariableDeclaration(n) || ts.isBindingElement(n)) && ts.isIdentifier(n.name)) out.add(n.name.text);
    if ((ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isClassExpression(n)) && n.name) out.add(n.name.text);
    if (ts.isTypeParameterDeclaration(n)) out.add(n.name.text);
    ts.forEachChild(n, visit);
  };
  ts.forEachChild(node, visit);
  return out;
}

/** An identifier read as a name in scope, not as a member or property name. */
function isReference(id: ts.Identifier): boolean {
  const p = id.parent;
  if (ts.isPropertyAccessExpression(p) && p.name === id) return false;
  if (ts.isQualifiedName(p) && p.right === id) return false;
  if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isMethodDeclaration(p) || ts.isAccessor(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p) || ts.isEnumMember(p)) && p.name === id) return false;
  if (ts.isBindingElement(p) && p.propertyName === id) return false;
  if ((ts.isParameter(p) || ts.isVariableDeclaration(p) || ts.isBindingElement(p) || ts.isFunctionDeclaration(p) || ts.isFunctionExpression(p) || ts.isClassExpression(p) || ts.isTypeParameterDeclaration(p)) && p.name === id) return false;
  if (ts.isLabeledStatement(p) || ts.isBreakOrContinueStatement(p)) return false;
  return true;
}

type Edit = { start: number; end: number; text: string };
const applyEdits = (text: string, offset: number, edits: Edit[]) => {
  let t = text;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) t = t.slice(0, e.start - offset) + e.text + t.slice(e.end - offset);
  return t;
};
/** A node's text, leading comments included, with the edits inside it applied. */
const render = (n: ts.Node, edits: Edit[], full = true) => {
  const start = full ? n.getFullStart() : n.getStart();
  return applyEdits(n.getSourceFile().text.slice(start, n.getEnd()), start, edits.filter((e) => e.start >= start && e.end <= n.getEnd()));
};
const modifiersText = (m: ts.Node, drop: ts.SyntaxKind[] = []) => (ts.canHaveModifiers(m) ? ts.getModifiers(m) ?? [] : []).filter((x) => !drop.includes(x.kind) && x.kind !== ts.SyntaxKind.OverrideKeyword).map((x) => x.getText() + ' ').join('');

/** `this.x` read directly by an expression, outside the functions it creates (which run later). */
function readsThis(n: ts.Node, names?: Set<string>): boolean {
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isArrowFunction(x) || ts.isFunctionExpression(x) || ts.isClassExpression(x)) return;
    if (x.kind === ts.SyntaxKind.ThisKeyword) {
      const p = x.parent;
      found = !names || (ts.isPropertyAccessExpression(p) && p.expression === x && names.has(p.name.text));
      return;
    }
    ts.forEachChild(x, visit);
  };
  visit(n);
  return found;
}

/** `this` anywhere a function's own `this` reaches: its body and the arrows in it. */
function usesThis(n: ts.Node): boolean {
  let found = false;
  const visit = (x: ts.Node) => {
    if (found || ts.isFunctionExpression(x) || ts.isFunctionDeclaration(x) || ts.isClassLike(x)) return;
    if (x.kind === ts.SyntaxKind.ThisKeyword) found = true;
    else ts.forEachChild(x, visit);
  };
  ts.forEachChild(n, visit);
  return found;
}

const REACTIVE = /^(input|input\.required|model|model\.required|output|signal|computed|linkedSignal|toSignal|viewChild|viewChildren|contentChild|contentChildren|inject)$/;
const reactive = (e: ts.Expression | undefined) => !!e && ((ts.isCallExpression(e) && REACTIVE.test(e.expression.getText())) || (ts.isNewExpression(e) && e.expression.getText() === 'EventEmitter'));
const BASE_META = new Set(['providers', 'viewProviders', 'host', 'inputs', 'outputs', 'queries', 'hostDirectives']);

/**
 * The file's text with the class `name` flattened: no `extends`, its bases' members its own. `null` when the class
 * extends nothing.
 */
export function flattenComponent(path: string, text: string, name: string, read: Read = readFile, seen = new Set<string>()): string | null {
  let sf = parse(path, text);
  let cls = classIn(sf, name)!;
  if (!extendsOf(cls)) return null;
  if (seen.has(`${path}#${name}`)) throw unsupported(path, `the class ${name} extending itself through its bases`);
  seen.add(`${path}#${name}`);
  const base = baseOf(path, sf, cls, read);
  let baseSf: ts.SourceFile;
  if (base.file === path) {
    // A base in the same file is flattened there first, and the component read again from that text.
    const flat = flattenComponent(path, text, base.name, read, seen);
    if (flat !== null) { text = flat; sf = parse(path, text); cls = classIn(sf, name)!; }
    baseSf = sf;
  } else {
    const original = read(base.file);
    baseSf = parse(base.file, flattenComponent(base.file, original, base.name, read, seen) ?? original);
  }
  const B = classIn(baseSf, base.name)!;
  const C = name;
  const where = (n: ts.Node) => `${path}:${lineOf(n)}`;
  const bwhere = (n: ts.Node) => `${base.file}:${lineOf(n)}`;

  for (const d of decoratorsOf(B)) {
    const meta = ts.isCallExpression(d.expression) ? d.expression.arguments[0] : undefined;
    for (const p of meta && ts.isObjectLiteralExpression(meta) ? meta.properties : []) {
      const key = p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : '';
      if (BASE_META.has(key)) throw unsupported(bwhere(p), `the ${key} of ${base.name}, a class the component ${C} extends,`);
    }
  }
  const instance = (members: ts.NodeArray<ts.ClassElement>) => members.filter((m) => !isStatic(m) && !ts.isClassStaticBlockDeclaration(m) && !ts.isSemicolonClassElement(m) && !ts.isIndexSignatureDeclaration(m));
  for (const m of [...instance(B.members), ...instance(cls.members)]) {
    if (m.name && ts.isPrivateIdentifier(m.name)) throw unsupported(m.getSourceFile() === sf ? where(m) : bwhere(m), `the #private member ${m.name.text} in a component that extends a class, or in its base,`);
    if (m.name && ts.isComputedPropertyName(m.name)) throw unsupported(m.getSourceFile() === sf ? where(m) : bwhere(m), `the computed member name ${m.name.getText()} in a component that extends a class, or in its base,`);
  }
  const baseMembers = instance(B.members).filter((m) => !ts.isConstructorDeclaration(m) && !isAbstract(m));
  const own = instance(cls.members);
  const ownByName = new Map<string, ts.ClassElement[]>();
  for (const m of own) { const n = memberName(m); if (n !== undefined) ownByName.set(n, [...(ownByName.get(n) ?? []), m]); }
  const kind = (m: ts.ClassElement) => (ts.isPropertyDeclaration(m) ? 'field' : ts.isMethodDeclaration(m) ? 'method' : ts.isAccessor(m) ? 'accessor' : 'other');

  // ---- Names: the base's text reads its own file's imports and declarations; the component's file binds them too.
  const sameFile = base.file === path;
  const mine = bindingsOf(path, sf);
  const theirs = bindingsOf(base.file, baseSf);
  const imports: string[] = [];
  const mapped = new Map<string, string>();
  const nameFor = (n: string, at: ts.Node): string => {
    if (sameFile) return n;
    if (mapped.has(n)) return mapped.get(n)!;
    const b = theirs.get(n)!;
    if (!b.exported) throw unsupported(bwhere(at), `${base.name}'s members naming ${n}, which ${base.file} does not export, in the component ${C} that extends it,`);
    const same = (x: Binding) => x.module === b.module && x.name === b.name;
    let local = mine.get(n) && same(mine.get(n)!) ? n : [...mine].find(([, x]) => same(x))?.[0];
    if (!local) {
      local = mine.has(n) || mapped.has(n) ? `${n}__${base.name}` : n;
      const spec = b.spec && !b.spec.startsWith('.') ? b.spec : (() => { const r = relative(dirname(path), b.module); return r.startsWith('.') ? r : './' + r; })();
      const type = b.typeOnly ? 'type ' : '';
      imports.push(b.name === 'default' ? `import ${type}${local} from '${spec}';` : b.name === '*' ? `import ${type}* as ${local} from '${spec}';` : `import ${type}{ ${b.name === local ? local : `${b.name} as ${local}`} } from '${spec}';`);
      mine.set(local, b);
    }
    mapped.set(n, local);
    return local;
  };
  // The base's type parameters, as the component's `extends Base<…>` gives them.
  const typeArgs = new Map<string, string>();
  (B.typeParameters ?? []).forEach((p, i) => typeArgs.set(p.name.text, `(${extendsOf(cls)!.typeArguments?.[i]?.getText() ?? p.default?.getText() ?? 'any'})`));

  /** A base node's text in the component's file, with `extra` edits of its own; `scope` declares its locals. */
  const fromBase = (m: ts.Node, extra: Edit[] = [], full = true, scope: ts.Node = m): string => {
    const edits = [...extra];
    const locals = localNames(scope);
    const visit = (n: ts.Node) => {
      if (ts.isIdentifier(n) && isReference(n) && !locals.has(n.text)) {
        const t = typeArgs.get(n.text);
        if (t !== undefined && ts.isTypeReferenceNode(n.parent)) edits.push({ start: n.getStart(), end: n.getEnd(), text: t });
        else if (theirs.has(n.text)) {
          const local = nameFor(n.text, n);
          if (local !== n.text) edits.push({ start: n.getStart(), end: n.getEnd(), text: ts.isShorthandPropertyAssignment(n.parent) ? `${n.text}: ${local}` : local });
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(m);
    for (const x of ts.canHaveModifiers(m) ? ts.getModifiers(m) ?? [] : []) if (x.kind === ts.SyntaxKind.OverrideKeyword) edits.push({ start: x.getStart(), end: x.getEnd() + 1, text: '' });
    return render(m, edits, full);
  };

  // ---- `super.x` in the component: the base's `x`, copied under a name of its own.
  const superName = (n: string) => `$super_${base.name}_${n}`;
  const supers = new Set<string>();
  const ownEdits: Edit[] = [];
  let superCall: ts.CallExpression | undefined;
  const visitSuper = (n: ts.Node, member: ts.ClassElement) => {
    if (n.kind === ts.SyntaxKind.SuperKeyword) {
      const p = n.parent;
      if (ts.isCallExpression(p) && p.expression === n) {
        const ctor = member;
        const first = ts.isConstructorDeclaration(ctor) ? ctor.body?.statements[0] : undefined;
        if (!first || !ts.isExpressionStatement(first) || first.expression !== p) throw unsupported(where(p), `super(…) other than as the first statement of ${C}'s constructor, in a component that extends a class,`);
        superCall = p;
        return;
      }
      if (!ts.isPropertyAccessExpression(p) || p.expression !== n) throw unsupported(where(p), `${p.getText()} in the component ${C}`);
      if (isStatic(member)) throw unsupported(where(p), `super.${p.name.text} in a static member of the component ${C}`);
      const target = baseMembers.filter((x) => memberName(x) === p.name.text);
      if (!target.length || target.some((x) => !ts.isMethodDeclaration(x) && !ts.isAccessor(x))) throw unsupported(where(p), `super.${p.name.text}, where ${base.name} has no method or accessor ${p.name.text},`);
      supers.add(p.name.text);
      ownEdits.push({ start: n.getStart(), end: n.getEnd(), text: 'this' }, { start: p.name.getStart(), end: p.name.getEnd(), text: superName(p.name.text) });
      return;
    }
    ts.forEachChild(n, (c) => visitSuper(c, member));
  };
  for (const m of cls.members) {
    visitSuper(m, m);
    for (const x of ts.canHaveModifiers(m) ? ts.getModifiers(m) ?? [] : []) if (x.kind === ts.SyntaxKind.OverrideKeyword) ownEdits.push({ start: x.getStart(), end: x.getEnd() + 1, text: '' });
  }
  const fromOwn = (m: ts.Node, extra: Edit[] = [], full = true) => render(m, [...ownEdits, ...extra], full);

  // ---- The base's constructor: its parameter properties and body, run where `super(…)` runs them.
  const K = B.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
  const ownCtor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
  const paramProps = (K?.parameters ?? []).filter((p) => (ts.getModifiers(p) ?? []).length);
  const work = !!K && (K.parameters.length > 0 || K.body!.statements.length > 0);

  // Fields the component declares again: one field, where the base declares it.
  const merged = new Map<ts.ClassElement, string>();
  const dropped = new Set<ts.ClassElement>();
  const assigned: string[] = [];
  const overridden = new Set<string>();
  for (const bm of baseMembers) {
    const n = memberName(bm);
    const mine2 = n === undefined ? undefined : ownByName.get(n);
    if (!mine2) continue;
    overridden.add(n!);
    const kinds = new Set(mine2.map(kind));
    if (kinds.size > 1 || kind(bm) !== [...kinds][0]) throw unsupported(where(mine2[0]), `${C}.${n}, a ${[...kinds][0]} over ${base.name}'s ${kind(bm)},`);
    if (!ts.isPropertyDeclaration(bm)) continue;
    const of = mine2[0] as ts.PropertyDeclaration;
    dropped.add(of);
    const plain = !decoratorsOf(of).length && !decoratorsOf(bm).length && !reactive(of.initializer) && !reactive(bm.initializer);
    // The base's declaration with the type the component declares it with (a narrower one).
    const retyped = () => fromBase(bm, !of.type ? [] : bm.type ? [{ start: bm.type.getStart(), end: bm.type.getEnd(), text: of.type.getText() }] : [{ start: (bm.questionToken ?? bm.exclamationToken ?? bm.name).getEnd(), end: (bm.questionToken ?? bm.exclamationToken ?? bm.name).getEnd(), text: `: ${of.type.getText()}` }]);
    if (!of.initializer && !decoratorsOf(of).length) {
      merged.set(bm, retyped());
    } else if (of.initializer && plain) {
      // The base's value first, as its constructor sees it; the component's once the base's constructor has run.
      merged.set(bm, retyped());
      assigned.push(`this.${n} = ${fromOwn(of.initializer, [], false)};`);
    } else if (!of.initializer && bm.initializer) {
      // Decorated again without a value: the base's value stays.
      const at = (of.type ?? of.questionToken ?? of.name).getEnd();
      merged.set(bm, fromOwn(of, [{ start: at, end: at, text: ` = ${fromBase(bm.initializer, [], false)}` }, ...(of.exclamationToken ? [{ start: of.exclamationToken.getStart(), end: of.exclamationToken.getEnd(), text: '' }] : [])]));
    } else {
      merged.set(bm, fromOwn(of));
    }
  }
  const ownFields = own.filter((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && !!m.initializer && !dropped.has(m));
  if (assigned.length) {
    const reader = ownFields.find((f) => readsThis(f.initializer!, overridden));
    if (reader) throw unsupported(where(reader), `${C}.${memberName(reader)}'s initializer reading a field ${C} declares again over ${base.name}'s`);
  }
  const sensitive = ownFields.some((f) => readsThis(f.initializer!));

  const pieces: string[] = [];
  const params = K ? K.parameters : ([] as unknown as ts.NodeArray<ts.ParameterDeclaration>);
  const baseBody = K ? K.body! : undefined;
  /** The base constructor's body as a method's, returning true, and its readonly fields assigned there writable. */
  const writes = new Set<string>();
  const bodyText = (prelude: string[]): string => {
    const edits: Edit[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isFunctionLike(n) && n !== K) return;
      if (ts.isReturnStatement(n)) {
        if (n.expression) throw unsupported(bwhere(n), `a value returned from ${base.name}'s constructor`);
        edits.push({ start: n.getStart(), end: n.getEnd(), text: 'return true;' });
      }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left) && n.left.expression.kind === ts.SyntaxKind.ThisKeyword) writes.add(n.left.name.text);
      ts.forEachChild(n, visit);
    };
    visit(baseBody!);
    const inner = fromBase(baseBody!, edits, true, K).trim().slice(1, -1);
    return `{\n    ${prelude.join('\n    ')}${inner}\n    return true;\n  }`;
  };
  const plainParams = params.filter((p) => !(ts.getModifiers(p) ?? []).length);
  const namesRead = (n: ts.Node | undefined, names: string[]) => {
    const found = new Set<string>();
    const visit = (x: ts.Node) => { if (ts.isIdentifier(x) && isReference(x) && names.includes(x.text)) found.add(x.text); ts.forEachChild(x, visit); };
    if (n) visit(n);
    return found;
  };
  const returns = (() => {
    let found = false;
    const visit = (n: ts.Node) => { if (ts.isReturnStatement(n)) found = true; else if (!ts.isFunctionLike(n)) ts.forEachChild(n, visit); };
    if (baseBody) ts.forEachChild(baseBody, visit);
    return found;
  })();
  /** `name` read as `this.name`, for the component's parameter properties read where only fields are. */
  const asFields = (n: ts.Node, names: Set<string>): Edit[] => {
    const e: Edit[] = [];
    const visit = (x: ts.Node) => { if (ts.isIdentifier(x) && isReference(x) && names.has(x.text)) e.push({ start: x.getStart(), end: x.getEnd(), text: `this.${x.text}` }); ts.forEachChild(x, visit); };
    visit(n);
    return e;
  };
  const initName = `$init_${base.name}`;
  let initCall: string | undefined;
  let ownCtorText: string | undefined;
  let ctorPiece: string | undefined;
  if (work && ownCtor) {
    const ps = params.map((p) => `${p.name.getText()}${p.questionToken ? '?' : ''}${p.type ? `: ${fromBase(p.type, [], false)}` : ''}${p.initializer ? ` = ${fromBase(p.initializer, [], false)}` : ''}`);
    const prelude = paramProps.map((p) => `this.${p.name.getText()} = ${p.name.getText()};`);
    const args = superCall?.arguments ?? ([] as unknown as ts.NodeArray<ts.Expression>);
    if (sensitive) {
      // Run as a field, between the base's fields and the component's, as TypeScript runs `super(…)`.
      const ownParams = ownCtor.parameters.map((p) => p.name.getText());
      const props = new Set(ownCtor.parameters.filter((p) => (ts.getModifiers(p) ?? []).length).map((p) => p.name.getText()));
      const bad = args.flatMap((a) => [...namesRead(a, ownParams)]).find((x) => !props.has(x));
      if (bad) throw unsupported(where(superCall!), `${C}'s field initializers reading this, with super(…) given its constructor's parameter ${bad},`);
      const argText = args.map((a) => fromOwn(a, asFields(a, props), false));
      initCall = `  private readonly $${base.name}_ready = this.${initName}(${argText.join(', ')});`;
    }
    pieces.push(`  ${initName}(${ps.join(', ')}): boolean ${bodyText(prelude)}`);
    const first = ownCtor.body!.statements[0];
    const replaced = (sensitive ? '' : `this.${initName}(${(superCall?.arguments ?? []).map((a) => fromOwn(a, [], false)).join(', ')});`) + (assigned.length ? ' ' + assigned.join(' ') : '');
    ownCtorText = fromOwn(ownCtor, superCall ? [{ start: first.getStart(), end: first.getEnd(), text: replaced }] : []);
  } else if (work) {
    // Angular injects the base constructor's parameters into a component that declares no constructor.
    const sig = `constructor(${params.map((p) => fromBase(p, [], false)).join(', ')})`;
    // The component's own field values follow the base constructor's body, even one that returns early.
    if ((!sensitive && !(returns && assigned.length)) || !K!.body!.statements.length) {
      const inner = fromBase(K!.body!, [], true, K).trim().slice(1, -1);
      ctorPiece = `  ${sig} {${inner}${assigned.length ? '\n    ' + assigned.join('\n    ') : ''}\n  }`;
    } else {
      const plain = namesRead(baseBody, plainParams.map((p) => p.name.getText()));
      if (plain.size) throw unsupported(where(cls), `${C}'s field initializers reading this, with ${base.name}'s constructor body reading its parameter ${[...plain][0]},`);
      const props = namesRead(baseBody, paramProps.map((p) => p.name.getText()));
      pieces.push(`  ${initName}(): boolean ${bodyText([...props].map((p) => `const ${p} = this.${p};`))}`);
      initCall = `  private readonly $${base.name}_ready = this.${initName}();`;
      ctorPiece = `  ${sig} {${assigned.length ? '\n    ' + assigned.join('\n    ') + '\n  ' : ''}}`;
    }
  } else if (ownCtor) {
    const first = ownCtor.body!.statements[0];
    ownCtorText = fromOwn(ownCtor, superCall ? [{ start: first.getStart(), end: first.getEnd(), text: assigned.join(' ') }] : []);
  } else if (assigned.length) {
    ctorPiece = `  constructor() {\n    ${assigned.join('\n    ')}\n  }`;
  }

  // ---- The base's statics, which JavaScript reads through the component (`C.x` finds `Base.x`): members reading the
  // base's own. Where that differs (`this` in them is C in JavaScript, a write through C makes C's own), `refuseBaseUses`
  // stops the build. A private one can't be read through C; a plain base's protected one can't be read from C once C
  // no longer extends it (a component base's are opened, `openStatics`).
  const ref = (extendsOf(cls)!.expression as ts.Identifier).text;
  const component = decoratorsOf(B).some((d) => /^Component\b/.test(d.expression.getText()));
  const ownStatics = new Set(cls.members.filter(isStatic).map(memberName));
  const forwards: string[] = [];
  const forwarded = new Set<string>();
  for (const bm of B.members) {
    const n = memberName(bm);
    if (!isStatic(bm) || n === undefined || !bm.name || !ts.isIdentifier(bm.name) || ownStatics.has(n) || forwarded.has(n)) continue;
    const mods = ts.canHaveModifiers(bm) ? ts.getModifiers(bm) ?? [] : [];
    if (mods.some((x) => x.kind === ts.SyntaxKind.PrivateKeyword) || (!component && mods.some((x) => x.kind === ts.SyntaxKind.ProtectedKeyword))) continue;
    forwarded.add(n);
    const same = B.members.filter((x) => isStatic(x) && memberName(x) === n);
    if (same.some((x) => ts.isMethodDeclaration(x))) {
      const impl = same.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && !!x.body);
      if (!impl) continue;
      const overloads = same.filter((x) => ts.isMethodDeclaration(x) && !x.body).map((x) => fromBase(x, [], false));
      const typeParams = impl.typeParameters ? `<${impl.typeParameters.map((t) => fromBase(t, [], false)).join(', ')}>` : '';
      const ps = impl.parameters.map((q) => fromBase(q, [], false));
      const args = impl.parameters.map((q) => `${q.dotDotDotToken ? '...' : ''}${q.name.getText()}`);
      forwards.push(...overloads.map((o) => `\n  ${o}`), `\n  static ${n}${typeParams}(${ps.join(', ')})${impl.type ? `: ${fromBase(impl.type, [], false)}` : ''} {\n    return ${ref}.${n}(${args.join(', ')});\n  }`);
      continue;
    }
    const set = same.find(ts.isSetAccessorDeclaration);
    forwards.push(`\n  static get ${n}() {\n    return ${ref}.${n};\n  }`);
    if (set) forwards.push(`\n  static set ${n}(value: typeof ${ref}.${n}) {\n    ${ref}.${n} = value;\n  }`);
  }

  // ---- The class: the base's members, then the component's.
  const out: string[] = [];
  const movedToMethod = work && (!!ownCtor || !!initCall);
  for (const p of work && ownCtor ? paramProps : []) {
    out.push(`\n  ${modifiersText(p, [ts.SyntaxKind.ReadonlyKeyword])}${p.name.getText()}!: ${p.type ? fromBase(p.type, [], false) : 'any'};`);
  }
  for (const bm of baseMembers) {
    if (merged.has(bm)) { out.push(merged.get(bm)!); continue; }
    const n = memberName(bm);
    if (n !== undefined && ownByName.has(n)) continue;
    const extra: Edit[] = [];
    if (movedToMethod && ts.isPropertyDeclaration(bm)) {
      const ro = (ts.getModifiers(bm) ?? []).find((x) => x.kind === ts.SyntaxKind.ReadonlyKeyword);
      if (ro && n && writes.has(n)) extra.push({ start: ro.getStart(), end: ro.getEnd() + 1, text: '' });
      if (!bm.initializer && !bm.questionToken && !bm.exclamationToken && !decoratorsOf(bm).length && bm.type) extra.push({ start: bm.name.getEnd(), end: bm.name.getEnd(), text: '!' });
    }
    out.push(fromBase(bm, extra));
  }
  for (const n of supers) {
    for (const bm of baseMembers.filter((x) => memberName(x) === n)) out.push(fromBase(bm, [{ start: bm.name!.getStart(), end: bm.name!.getEnd(), text: superName(n) }]));
  }
  out.push(...pieces.map((p) => '\n' + p));
  if (initCall) out.push('\n' + initCall);
  if (ctorPiece) out.push('\n' + ctorPiece);
  for (const m of cls.members) {
    if (dropped.has(m)) continue;
    out.push(m === ownCtor && ownCtorText !== undefined ? ownCtorText : fromOwn(m));
  }
  out.push(...forwards);
  const ext = cls.heritageClauses!.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)!;
  const others = cls.heritageClauses!.filter((h) => h !== ext);
  const head = text.slice(cls.getStart(), ext.getFullStart()) + (others.length ? ' ' + others.map((h) => h.getText()).join(' ') : '') + ' {';
  const flat = head + out.join('') + '\n}';
  return (imports.length ? imports.join('\n') + '\n' : '') + text.slice(0, cls.getStart()) + flat + text.slice(cls.getEnd());
}

const QUERIES = /^(ViewChild|ViewChildren|ContentChild|ContentChildren|viewChild|viewChildren|contentChild|contentChildren)(\.required)?$/;
const PROVIDER_KEYS = new Set(['provide', 'useClass', 'useExisting', 'providers', 'viewProviders']);

/** What a reference to a flattened base needs of it that the copy cannot give, or nothing. */
function needsBase(id: ts.Identifier, name: string): string | undefined {
  const p = id.parent;
  if (ts.isBinaryExpression(p) && p.right === id && p.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword) return `instanceof ${name}`;
  if (ts.isTypeReferenceNode(p) && p.typeName === id) return `${name} as a type`;
  for (let n: ts.Node = p; n && !ts.isSourceFile(n); n = n.parent) {
    if (ts.isCallExpression(n) && n.arguments.some((a) => a.pos <= id.pos && id.end <= a.end)) {
      const callee = n.expression.getText();
      if (callee === 'inject') return `inject(${name})`;
      if (callee === 'Inject' && ts.isDecorator(n.parent)) return `@Inject(${name})`;
      if (QUERIES.test(callee)) return `a query by ${name} (${callee})`;
    }
    if (ts.isPropertyAssignment(n) && n.initializer.pos <= id.pos && id.end <= n.initializer.end && PROVIDER_KEYS.has(n.name.getText())) return `${name} as a provider (${n.name.getText()})`;
    if (ts.isStatement(n) || ts.isClassElement(n)) break;
  }
  return undefined;
}

/**
 * A class that a component extends is copied into it (`flattenComponent`), so the component is no instance of it: an
 * app file reading one as such (`instanceof`, injection or a query by it, a provider of it, a type) stops the build.
 */
export function refuseBaseUses(files: string[], read: Read = readFile): void {
  const bases = new Map<string, { name: string; by: string }>();
  const derived = new Map<string, { name: string; statics: Map<string, InheritedStatic> }>();
  for (const f of files) {
    const text = read(f);
    if (!/@Component\b/.test(text) || !/\bextends\b/.test(text)) continue;
    const sf = parse(f, text);
    for (const st of sf.statements) {
      if (!ts.isClassDeclaration(st) || !st.name || !decoratorsOf(st).some((d) => /^Component\b/.test(d.expression.getText()))) continue;
      let file = f, at = sf, cls: ts.ClassDeclaration | undefined = st;
      const seen = new Set<string>();
      const statics = new Map<string, InheritedStatic>();
      const declared = new Set(st.members.filter(isStatic).map(memberName));
      while (cls && extendsOf(cls) && ts.isIdentifier(extendsOf(cls)!.expression)) {
        const b = classOfName(file, at, (extendsOf(cls)!.expression as ts.Identifier).text, read);
        if (!b || seen.has(`${b.file}#${b.name}`)) break;
        seen.add(`${b.file}#${b.name}`);
        if (!bases.has(`${b.file}#${b.name}`)) bases.set(`${b.file}#${b.name}`, { name: b.name, by: st.name.text });
        file = b.file; at = parse(file, read(file)); cls = classIn(at, b.name);
        for (const m of cls?.members ?? []) {
          const n = memberName(m);
          if (!isStatic(m) || n === undefined || declared.has(n)) continue;
          const kind = ts.isPropertyDeclaration(m) ? 'field' : ts.isMethodDeclaration(m) && m.body && usesThis(m.body) ? 'method' : ts.isSetAccessorDeclaration(m) && m.body && usesThis(m.body) ? 'setter' : null;
          if (kind && !statics.has(n)) statics.set(n, { base: b.name, kind });
        }
        for (const m of cls?.members ?? []) if (isStatic(m)) declared.add(memberName(m));
      }
      if (statics.size) derived.set(`${f}#${st.name.text}`, { name: st.name.text, statics });
    }
  }
  if (!bases.size) return;
  const names = [...new Set([...bases.values(), ...derived.values()].map((b) => b.name))];
  /** The class declared or imported under `n` in this file, among `among`. */
  const resolve = <T>(f: string, sf: ts.SourceFile, among: Map<string, T>) => {
    const local = new Map<string, T>();
    for (const n of names) {
      const found = sf.text.includes(n) ? classOfName(f, sf, n, read) : undefined;
      const b = found && among.get(`${found.file}#${found.name}`);
      if (b) local.set(n, b);
    }
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !st.importClause?.namedBindings || !ts.isNamedImports(st.importClause.namedBindings)) continue;
      for (const e of st.importClause.namedBindings.elements) {
        if (local.has(e.name.text) || !e.propertyName) continue;
        const found = classOfName(f, sf, e.name.text, read);
        const b = found && among.get(`${found.file}#${found.name}`);
        if (b) local.set(e.name.text, b);
      }
    }
    return local;
  };
  for (const f of files) {
    const text = read(f);
    if (!names.some((n) => text.includes(n))) continue;
    const sf = parse(f, text);
    const local = resolve(f, sf, bases);
    const sub = resolve(f, sf, derived);
    if (!local.size && !sub.size) continue;
    // `C.x` (or `this.x` in C's statics) of a static C inherits, where the copy differs from JavaScript's lookup.
    const inherited = (pa: ts.PropertyAccessExpression, d: { name: string; statics: Map<string, InheritedStatic> }) => {
      const s = d.statics.get(pa.name.text);
      const p = pa.parent;
      const write = (ts.isBinaryExpression(p) && p.left === pa && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
        || ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken));
      const at = `${f}:${lineOf(pa)}`;
      if (s?.kind === 'method') throw unsupported(at, `${d.name}.${pa.name.text}, a static method of ${s.base} reading this, through the component ${d.name} that extends it,`);
      if (write && s?.kind === 'field') throw unsupported(at, `writing ${d.name}.${pa.name.text}, a static field the component ${d.name} inherits from ${s.base} (write ${s.base}.${pa.name.text}),`);
      if (write && s?.kind === 'setter') throw unsupported(at, `writing ${d.name}.${pa.name.text}, a static setter of ${s.base} reading this, through the component ${d.name} that extends it,`);
    };
    const visit = (n: ts.Node, self?: { name: string; statics: Map<string, InheritedStatic> }) => {
      if (ts.isIdentifier(n) && local.has(n.text) && isReference(n) && !ts.isImportSpecifier(n.parent) && !ts.isExportSpecifier(n.parent) && !(ts.isClassDeclaration(n.parent) && n.parent.name === n)) {
        const b = local.get(n.text)!;
        const what = needsBase(n, n.text);
        if (what) throw unsupported(`${f}:${lineOf(n)}`, `${what}, where ${b.name} is a class the component ${b.by} extends (and the release build copies into it),`);
      }
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && sub.has(n.expression.text)) inherited(n, sub.get(n.expression.text)!);
      if (self && ts.isPropertyAccessExpression(n) && n.expression.kind === ts.SyntaxKind.ThisKeyword) inherited(n, self);
      if (ts.isClassDeclaration(n) && n.name && sub.has(n.name.text) && derived.get(`${f}#${n.name.text}`)) {
        for (const m of n.members) visit(m, isStatic(m) ? derived.get(`${f}#${n.name.text}`) : undefined);
        return;
      }
      ts.forEachChild(n, (c) => visit(c, self && (ts.isFunctionExpression(c) || ts.isFunctionDeclaration(c) || ts.isClassLike(c)) ? undefined : self));
    };
    visit(sf);
  }
}

/** A static a component inherits that its copy can't give as JavaScript does: a field (written through the component), or a method or setter reading `this`. */
interface InheritedStatic { base: string; kind: 'field' | 'method' | 'setter' }

/**
 * A component's static members without `private`/`protected`: a subclass's copy of its methods names them through
 * the class. The native classes have no such access levels either.
 */
export function openStatics(text: string, cls: ts.ClassDeclaration): string {
  const edits: Edit[] = [];
  for (const m of cls.members) {
    if (!isStatic(m)) continue;
    for (const x of ts.getModifiers(m as ts.HasModifiers) ?? []) if (x.kind === ts.SyntaxKind.PrivateKeyword || x.kind === ts.SyntaxKind.ProtectedKeyword) edits.push({ start: x.getStart(), end: x.getEnd() + 1, text: '' });
  }
  return edits.length ? applyEdits(text, 0, edits) : text;
}
