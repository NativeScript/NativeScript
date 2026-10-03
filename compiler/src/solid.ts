import ts from 'typescript';
import { dirname } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';

export interface SolidRoute { name: string; component: string }

/**
 * A Solid NativeScript component (dominative elements, `on:` events,
 * `createSignal`/`createMemo`, `<Show>`/`<For>`, solid-navigation) as a
 * virtual class. Solid is already signals: a getter call reads one, a setter
 * call writes one, and a zero-argument arrow is a derived value.
 */
export function solidComponent(path: string, fn: ts.FunctionDeclaration, routes: SolidRoute[], components: Set<string>): ComponentIR {
  const name = fn.name!.text;
  const sf = fn.getSourceFile();
  const text = sf.getFullText();
  const route = routes.find((r) => r.component === name);
  const scope: Scope = { names: new Map() };
  const fields: string[] = [];
  const props: string[] = [];
  const arity = new Map<string, number>();

  const imports: string[] = [];
  for (const i of sf.statements.filter(ts.isImportDeclaration)) {
    const from = (i.moduleSpecifier as ts.StringLiteral).text;
    if (from === 'solid-js' || from === 'solid-navigation') continue;
    const local = i.importClause?.name?.text;
    if (local && components.has(local)) { imports.push(`import ${local} from './${local}.solid';`); continue; }
    imports.push(i.getText());
  }
  for (const r of routes) if (r.component !== name && new RegExp(`navigate\\(\\s*['"]${r.name}['"]`).test(text) && !imports.some((i) => i.startsWith(`import ${r.component} `))) imports.push(`import ${r.component} from './${r.component}.solid';`);

  // `props: { recipe: Recipe; ... }`: `props.recipe` is the prop.
  const param = fn.parameters[0];
  const propsName = param && ts.isIdentifier(param.name) ? param.name.text : '';
  if (param?.type && ts.isTypeLiteralNode(param.type)) {
    for (const m of param.type.members) {
      if (!ts.isPropertySignature(m) || !m.type) continue;
      const p = (m.name as ts.Identifier).text;
      props.push(p);
      fields.push(`  ${p}!: ${m.type.getText()};`);
      if (ts.isFunctionTypeNode(m.type)) arity.set(p, m.type.parameters.length);
    }
  }
  const body = fn.body!.statements;
  const ret = body.find(ts.isReturnStatement)!;
  let paramsName = '';
  // First pass: names, so every body member can read every other.
  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st) && st.name) { arity.set(st.name.text, st.parameters.length); scope.names.set(st.name.text, `this.${st.name.text}`); continue; }
    if (!ts.isVariableStatement(st)) throw new Error(`${path}: unsupported statement in ${name}: ${st.getText().slice(0, 60)}`);
    for (const d of st.declarationList.declarations) {
      const init = unwrapAs(d.initializer!);
      if (ts.isArrayBindingPattern(d.name)) {
        const [value, setter] = d.name.elements.map((e) => (ts.isBindingElement(e) ? (e.name as ts.Identifier).text : ''));
        scope.names.set(value, `this.${value}`);
        if (setter) scope.names.set(setter, `this.$set_${value}`);
        continue;
      }
      const id = (d.name as ts.Identifier).text;
      if (ts.isCallExpression(init) && init.expression.getText() === 'useParams') {
        // A screen's params are its props.
        paramsName = id;
        const cast = d.initializer && ts.isAsExpression(d.initializer) ? d.initializer.type : null;
        if (cast && ts.isTypeLiteralNode(cast)) for (const m of cast.members) if (ts.isPropertySignature(m) && m.type) { const p = (m.name as ts.Identifier).text; props.push(p); fields.push(`  ${p}!: ${m.type.getText()};`); }
        continue;
      }
      if (ts.isCallExpression(init) && init.expression.getText() === 'useRouter') { scope.names.set(id, '$router'); continue; }
      if (paramsName && init.getText() === `${paramsName}.${id}`) continue; // `const recipe = params.recipe`
      const derived = (ts.isCallExpression(init) && init.expression.getText() === 'createMemo') || (ts.isArrowFunction(init) && !init.parameters.length);
      // A memo or an accessor is read by calling it (`color()`): the call reads the derived method.
      scope.names.set(id, derived ? `this.$get_${id}` : `this.${id}`);
      if ((ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && init.parameters.length) arity.set(id, init.parameters.length);
    }
  }
  for (const p of props) scope.names.set(p, `this.${p}`);
  const full: Scope = { names: scope.names, members: propsName ? { object: propsName, replacement: 'this' } : paramsName ? { object: paramsName, replacement: 'this' } : undefined };
  // Setters: `setX(v)` writes, `setX((prev) => …)` updates.
  const setters = (code: string) => code.replace(/this\.\$set_(\w+)\(/g, (_, v) => `this.${v}.$write(`);

  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st) && st.name) {
      fields.push(`  ${st.name.text}(${st.parameters.map((p) => p.getText()).join(', ')})${st.type ? `: ${st.type.getText()}` : ''} ${setters(navigate(rewrite(st.body!.getText(), full, 'statements'), routes))}`);
      continue;
    }
    for (const d of (st as ts.VariableStatement).declarationList.declarations) {
      const init = unwrapAs(d.initializer!);
      if (ts.isArrayBindingPattern(d.name)) {
        const value = ((d.name.elements[0] as ts.BindingElement).name as ts.Identifier).text;
        const call = init as ts.CallExpression;
        const typeArgs = call.typeArguments ? `<${call.typeArguments.map((t) => t.getText()).join(', ')}>` : '';
        fields.push(`  ${value} = $writable${typeArgs}(${call.arguments[0] ? rewrite(call.arguments[0].getText(), full) : 'undefined'});`);
        continue;
      }
      const id = (d.name as ts.Identifier).text;
      if (!scope.names.has(id) || scope.names.get(id) === '$router') continue;
      if (paramsName && (init.getText() === `${paramsName}.${id}` || (ts.isCallExpression(init) && init.expression.getText() === 'useParams'))) continue;
      if (scope.names.get(id) === `this.$get_${id}` && !(ts.isCallExpression(init) || ts.isArrowFunction(init))) continue;
      const derive = ts.isCallExpression(init) && init.expression.getText() === 'createMemo' ? (init.arguments[0] as ts.ArrowFunction) : (ts.isArrowFunction(init) && !init.parameters.length ? init : null);
      if (derive) {
        // A memo or an accessor: `color()` reads it.
        const b = ts.isBlock(derive.body) ? setters(rewrite(derive.body.getText(), full, 'statements')) : `{ return ${setters(rewrite(derive.body.getText(), full))}; }`;
        fields.push(`  $get_${id}() ${b}`);
        continue;
      }
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
        const b = ts.isBlock(init.body) ? init.body.getText() : `{ return ${init.body.getText()}; }`;
        fields.push(`  ${id}(${init.parameters.map((p) => p.getText()).join(', ')}) ${setters(navigate(rewrite(b, full, 'statements'), routes))}`);
        continue;
      }
      fields.push(`  get ${id}() { return ${rewrite(init.getText(), full)}; }`);
    }
  }

  const methods: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (loops: Loop[], extra: Record<string, string> = {}): Scope => {
    const names = new Map(scope.names);
    for (const l of loops) { names.delete(l.item); names.delete(l.index); }
    for (const [k, v] of Object.entries(extra)) names.set(k, v);
    return { names, members: full.members };
  };
  const expr = (code: string, loops: Loop[]) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(loops)}) { return ${setters(rewrite(code, local(loops)))}; }`);
    return m;
  };
  const handler = (e: ts.Expression, loops: Loop[]) => {
    const m = `$e${next++}`;
    let code: string;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const p = e.parameters[0] ? (e.parameters[0].name as ts.Identifier).text : null;
      const extra = p ? { [p]: '$event' } : {};
      code = ts.isBlock(e.body) ? rewrite(e.body.getText(), local(loops, extra), 'statements') : `${rewrite(e.body.getText(), local(loops, extra)).slice(1, -1)};`;
    } else {
      const t = e.getText();
      code = `${rewrite(t, local(loops)).slice(1, -1)}(${arity.get(t) === 0 ? '' : '$event'});`;
    }
    methods.push(`  ${m}(${[params(loops), '$event: EventData'].filter(Boolean).join(', ')}) { ${setters(navigate(code, routes))} }`);
    return m;
  };

  const element = (n: ts.JsxElement | ts.JsxSelfClosingElement, loops: Loop[]): TNode[] => {
    const open = ts.isJsxElement(n) ? n.openingElement : n;
    const tag = open.tagName.getText();
    const attr = (k: string) => open.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText() === k)?.initializer;
    if (tag === 'Show') {
      const when = (attr('when') as ts.JsxExpression).expression!;
      return [{ kind: 'if', branches: [{ cond: expr(when.getText(), loops), body: ts.isJsxElement(n) ? children(n.children, loops) : [] }] }];
    }
    if (tag === 'For') {
      const each = (attr('each') as ts.JsxExpression).expression!;
      const cb = (n as ts.JsxElement).children.find(ts.isJsxExpression)!.expression as ts.ArrowFunction;
      const item = (cb.parameters[0].name as ts.Identifier).text;
      const index = cb.parameters[1] ? (cb.parameters[1].name as ts.Identifier).text : `$i${loops.length}`;
      const items = expr(each.getText(), loops);
      const inner = [...loops, { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0` }];
      return [{ kind: 'for', items, key: null, item, index, body: jsx(cb.body as ts.Expression, inner) }];
    }
    const attrs: Attr[] = [];
    const events: Event[] = [];
    const isComponent = /^[A-Z]/.test(tag);
    for (const a of open.attributes.properties) {
      if (!ts.isJsxAttribute(a)) throw new Error(`${path}: spread attributes are not supported in a release build yet`);
      const raw = a.name.getText();
      const init = a.initializer;
      if (raw.startsWith('on:') && init && ts.isJsxExpression(init) && init.expression) { events.push({ name: raw.slice(3), method: handler(init.expression, loops) }); continue; }
      if (!init) attrs.push({ name: raw, value: 'true' });
      else if (ts.isStringLiteral(init)) attrs.push({ name: raw, value: init.text });
      else if (ts.isJsxExpression(init) && init.expression) attrs.push({ name: raw, method: expr(init.expression.getText(), loops) });
    }
    if (isComponent) {
      if (!components.has(tag)) throw new Error(`${path}: <${tag}> is not a component of the app`);
      return [{ kind: 'component', name: tag, props: attrs, events }];
    }
    const el = canonical(tag);
    if (!el) throw new Error(`${path}: <${tag}> is not a @nativescript/core element the release build knows`);
    return [{ kind: 'element', tag: el, attrs, events, children: ts.isJsxElement(n) ? children(n.children, loops) : [] }];
  };
  const jsx = (e: ts.Expression, loops: Loop[]): TNode[] => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return element(e, loops);
    if (ts.isJsxFragment(e)) return children(e.children, loops);
    throw new Error(`${path}: {${e.getText().slice(0, 50)}} in JSX is not supported in a release build yet`);
  };
  const children = (list: ts.NodeArray<ts.JsxChild>, loops: Loop[]): TNode[] =>
    list.flatMap((c) => (ts.isJsxText(c) ? [] : ts.isJsxExpression(c) ? (c.expression ? jsx(c.expression, loops) : []) : jsx(c as ts.Expression, loops)));

  const template = jsx(ret.expression!, []);
  const source = [`import { $writable, $navigateTo, type EventData } from '@nativescript/release';`, ...imports, '', `export default class ${name} {`, ...fields, ...methods, '}', ''].join('\n');
  return { name, file: `${dirname(path)}/${name}.solid.ts`, source, props, template, page: !!route };
}

function unwrapAs(e: ts.Expression): ts.Expression {
  while (ts.isAsExpression(e) || ts.isParenthesizedExpression(e)) e = e.expression;
  return e;
}

/** `router.navigate('Detail', { params: { recipe } })` → push the Detail route's page with those props. */
function navigate(code: string, routes: SolidRoute[]): string {
  return code.replace(/\$router\.navigate\(\s*['"](\w+)['"]\s*,\s*\{\s*params\s*:\s*/g, (_, r) => {
    const route = routes.find((x) => x.name === r);
    if (!route) throw new Error(`navigate('${r}'): no such route`);
    return `$navigateTo(${route.component}, { props: `;
  });
}

/** Routes and the initial one, from `<StackRouter initialRouteName><Route name component/></StackRouter>`. */
export function solidRoutes(text: string): { routes: SolidRoute[]; initial: string } {
  const sf = ts.createSourceFile('app.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const routes: SolidRoute[] = [];
  let initial = '';
  const visit = (n: ts.Node) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const attr = (k: string) => n.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText() === k)?.initializer;
      const tag = n.tagName.getText();
      if (tag === 'StackRouter') { const i = attr('initialRouteName'); if (i && ts.isStringLiteral(i)) initial = i.text; }
      if (tag === 'Route') routes.push({ name: (attr('name') as ts.StringLiteral).text, component: (attr('component') as ts.JsxExpression).expression!.getText() });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { routes, initial: initial || routes[0]?.name || '' };
}

/** A module's `export const [x, setX] = createSignal(v)` as a writable signal `x`, and `setX(…)` as its write. */
export function solidStore(text: string): string | null {
  if (!/createSignal/.test(text)) return null;
  const sf = ts.createSourceFile('store.ts', text, ts.ScriptTarget.Latest, true);
  const setters = new Map<string, string>();
  let out = `import { $writable } from '@nativescript/release';\n`;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && (st.moduleSpecifier as ts.StringLiteral).text === 'solid-js') continue;
    if (ts.isVariableStatement(st)) {
      const d = st.declarationList.declarations[0];
      if (ts.isArrayBindingPattern(d.name) && d.initializer && ts.isCallExpression(d.initializer) && d.initializer.expression.getText() === 'createSignal') {
        const [value, setter] = d.name.elements.map((e) => (ts.isBindingElement(e) ? (e.name as ts.Identifier).text : ''));
        if (setter) setters.set(setter, value);
        const call = d.initializer;
        out += `export const ${value} = $writable${call.typeArguments ? `<${call.typeArguments.map((t) => t.getText()).join(', ')}>` : ''}(${call.arguments[0]?.getText() ?? 'undefined'});\n`;
        continue;
      }
    }
    out += st.getText() + '\n';
  }
  for (const [setter, value] of setters) out = out.replace(new RegExp(`\\b${setter}\\(`, 'g'), `${value}.$write(`);
  return out;
}
