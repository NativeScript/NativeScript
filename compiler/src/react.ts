import ts from 'typescript';
import { dirname, relative } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';
import { rowTemplates } from './listview.ts';

/** A screen of the app's stack navigator. */
export interface Screen {
  name: string;
  component: string;
  /** `options.title`: a string, or an expression over `route.params`. */
  title: { value: string } | { code: string } | null;
}

/**
 * A React NativeScript function component as a virtual class. React runs the
 * whole body on every render; the release build gets the same results by
 * making `useState` a signal and every other body `const` a derived value
 * read where it is used, so each binding updates on its own.
 */
export function reactComponent(path: string, text: string, fn: ts.FunctionDeclaration, screens: Screen[], files: Map<string, string>, components: Map<string, string>): ComponentIR {
  const name = fn.name!.text;
  const sf = fn.getSourceFile();
  const screen = screens.find((s) => s.component === name);
  const scope: Scope = { names: new Map() };
  const fields: string[] = [];
  const props: string[] = [];
  const arity = new Map<string, number>();
  // Components are imported as their virtual classes; React's own modules have no part in a release build.
  const imports: string[] = [];
  // react-nativescript's `<ListView>`, under the name the file imports it as.
  let listTag = '';
  for (const i of sf.statements.filter(ts.isImportDeclaration)) {
    if (/^['"](react|react-nativescript-navigation|@react-navigation\/core)['"]$/.test(i.moduleSpecifier.getText())) continue;
    const named = i.importClause?.namedBindings;
    if ((i.moduleSpecifier as ts.StringLiteral).text === 'react-nativescript' && named && ts.isNamedImports(named)) {
      const list = named.elements.find((e) => (e.propertyName ?? e.name).text === 'ListView');
      if (list && named.elements.length === 1) { listTag = list.name.text; continue; }
    }
    const names = named && ts.isNamedImports(named) ? named.elements.map((e) => e.name.text) : [];
    const own = names.filter((n) => components.has(n));
    for (const n of own) imports.push(`import ${n} from './${n}.react';`);
    if (own.length && own.length === names.length) continue;
    imports.push(i.getText());
  }
  // A screen navigates to other screens by component.
  for (const s of screens) if (s.component !== name && new RegExp(`navigate\\(\\s*['"]${s.name}['"]`).test(text) && !imports.some((i) => i.startsWith(`import ${s.component} `))) imports.push(`import ${s.component} from './${s.component}.react';`);

  // Props: `{ recipe, favorite, onTap }: { recipe: Recipe; ... }`; a screen's `{ navigation, route }`.
  const param = fn.parameters[0];
  let routeName = '';
  let navigationName = '';
  if (param && ts.isObjectBindingPattern(param.name) && param.type && ts.isTypeLiteralNode(param.type)) {
    for (const m of param.type.members) {
      if (!ts.isPropertySignature(m) || !m.type) continue;
      const p = (m.name as ts.Identifier).text;
      const t = m.type.getText();
      if (/^RouteProp\b/.test(t)) { routeName = p; continue; }
      if (/^\w*NavigationProp\b/.test(t)) { navigationName = p; continue; }
      props.push(p);
      fields.push(`  ${p}!: ${t};`);
      scope.names.set(p, `this.${p}`);
      if (ts.isFunctionTypeNode(m.type)) arity.set(p, m.type.parameters.length);
    }
  }
  // A screen's route params are its props.
  const route = screen ? routeParams(files, screen.name) : null;
  if (route) {
    if (!imports.some((i) => new RegExp(`\\b${route.alias}\\b`).test(i))) imports.push(`import type { ${route.alias} } from '${relativeModule(path, route.file)}';`);
    for (const p of route.params) { props.push(p); fields.push(`  ${p}!: ${route.alias}['${screen!.name}']['${p}'];`); scope.names.set(p, `this.${p}`); }
  }
  const routeScope = (s: Scope): Scope => ({ names: new Map(s.names), members: routeName ? { object: `${routeName}.params`, replacement: 'this' } : undefined });

  const body = fn.body!.statements;
  const ret = body.find(ts.isReturnStatement);
  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st) && st.name) {
      const f = st.name.text;
      arity.set(f, st.parameters.length);
      scope.names.set(f, `this.${f}`);
      continue;
    }
    if (!ts.isVariableStatement(st)) throw new Error(`${path}: unsupported statement in ${name}: ${st.getText().slice(0, 60)}`);
    for (const d of st.declarationList.declarations) {
      const init = d.initializer!;
      if (ts.isArrayBindingPattern(d.name) && ts.isCallExpression(init) && /(^|\.)useState$/.test(init.expression.getText())) {
        const [value, setter] = d.name.elements.map((e) => (ts.isBindingElement(e) ? (e.name as ts.Identifier).text : ''));
        scope.names.set(value, `this.${value}()`);
        if (setter) scope.names.set(setter, `this.${value}.set`);
        continue;
      }
      if (ts.isObjectBindingPattern(d.name) && routeName && init.getText() === `${routeName}.params`) continue; // the params are props already
      if (ts.isIdentifier(d.name)) {
        const id = d.name.text;
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) arity.set(id, init.parameters.length);
        scope.names.set(id, `this.${id}`);
      }
    }
  }

  // Store selectors: `useRecipes((s) => s.favoriteIds)` reads the store directly.
  const selector = (init: ts.Expression): string | null => {
    if (!ts.isCallExpression(init) || !ts.isIdentifier(init.expression) || !/^use[A-Z]/.test(init.expression.text) || init.expression.text === 'useState') return null;
    const sel = init.arguments[0];
    if (!sel || !(ts.isArrowFunction(sel) && !ts.isBlock(sel.body))) return null;
    const s = (sel.parameters[0].name as ts.Identifier).text;
    return rewrite(sel.body.getText(), routeScope({ names: new Map([...scope.names, [s, init.expression.text]]) }));
  };

  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st) && st.name) {
      fields.push(`  ${(ts.getModifiers(st as ts.FunctionDeclaration)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '')}${st.name.text}(${st.parameters.map((p) => p.getText()).join(', ')})${st.type ? `: ${st.type.getText()}` : ''} ${rewrite(navigate(st.body!.getText(), navigationName, screens), routeScope(scope), 'statements')}`);
      continue;
    }
    for (const d of (st as ts.VariableStatement).declarationList.declarations) {
      const init = d.initializer!;
      if (ts.isArrayBindingPattern(d.name)) {
        const value = ((d.name.elements[0] as ts.BindingElement).name as ts.Identifier).text;
        const arg = (init as ts.CallExpression).arguments[0];
        fields.push(`  ${value} = $writable(${arg ? rewrite(arg.getText(), routeScope(scope)) : 'undefined'});`);
        continue;
      }
      if (!ts.isIdentifier(d.name)) continue;
      const id = d.name.text;
      const read = selector(init);
      if (read) { fields.push(`  get ${id}() { return ${read}; }`); continue; }
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
        const b = ts.isBlock(init.body) ? init.body.getText() : `{ return ${init.body.getText()}; }`;
        fields.push(`  ${(ts.getModifiers(init as ts.FunctionDeclaration)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '')}${id}(${init.parameters.map((p) => p.getText()).join(', ')}) ${rewrite(navigate(b, navigationName, screens), routeScope(scope), 'statements')}`);
        continue;
      }
      // React recomputes a body const on every render: a derived value.
      fields.push(`  get ${id}() { return ${rewrite(init.getText(), routeScope(scope))}; }`);
    }
  }

  // The template.
  const methods: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (loops: Loop[], extra: Record<string, string> = {}): Scope => {
    const names = new Map(scope.names);
    for (const l of loops) { names.delete(l.item); names.delete(l.index); }
    for (const [k, v] of Object.entries(extra)) names.set(k, v);
    return routeScope({ names });
  };
  const expr = (code: string, loops: Loop[]) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(loops)}) { return ${rewrite(code, local(loops))}; }`);
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
    methods.push(`  ${m}(${[params(loops), '$event: $EventData'].filter(Boolean).join(', ')}) { ${code} }`);
    return m;
  };

  const element = (n: ts.JsxElement | ts.JsxSelfClosingElement, loops: Loop[]): TNode => {
    const open = ts.isJsxElement(n) ? n.openingElement : n;
    const tag = open.tagName.getText();
    if (listTag && tag === listTag) return list(open, loops);
    const attrs: Attr[] = [];
    const events: Event[] = [];
    const isComponent = /^[A-Z]/.test(tag);
    for (const a of open.attributes.properties) {
      if (!ts.isJsxAttribute(a)) throw new Error(`${path}: spread attributes are not supported in a release build yet`);
      const attr = a.name.getText();
      if (attr === 'key') continue;
      const name = attr === 'className' ? 'class' : attr;
      const init = a.initializer;
      if (!isComponent && /^on[A-Z]/.test(attr) && init && ts.isJsxExpression(init) && init.expression) {
        events.push({ name: attr[2].toLowerCase() + attr.slice(3), method: handler(init.expression, loops) });
        continue;
      }
      if (!init) attrs.push({ name, value: 'true' });
      else if (ts.isStringLiteral(init)) attrs.push({ name, value: init.text });
      else if (ts.isJsxExpression(init) && init.expression) attrs.push({ name, method: expr(init.expression.getText(), loops) });
    }
    if (isComponent) return { kind: 'component', name: tag, props: attrs, events };
    const element = canonical(tag);
    if (!element) throw new Error(`${path}: <${tag}> is not a @nativescript/core element the release build knows`);
    return { kind: 'element', tag: element, attrs, events, children: ts.isJsxElement(n) ? children(n.children, loops) : [] };
  };

  /**
   * react-nativescript's `<ListView items cellFactory>`, or `cellFactories` (a `new Map` of key →
   * `{ placeholderItem, cellFactory }`) chosen by `itemTemplateSelector(item, index, items)`. A cell
   * factory is called with the item only.
   */
  const list = (open: ts.JsxOpeningLikeElement, loops: Loop[]): TNode => {
    const attrs: Attr[] = [];
    const events: Event[] = [];
    const factories: { key: string; fn: ts.Expression }[] = [];
    let single: ts.Expression | null = null;
    let selector: ts.Expression | null = null;
    for (const a of open.attributes.properties) {
      if (!ts.isJsxAttribute(a)) throw new Error(`${path}: spread attributes are not supported in a release build yet`);
      const attr = a.name.getText();
      const init = a.initializer;
      const e = init && ts.isJsxExpression(init) ? init.expression : undefined;
      if (attr === 'key') continue;
      if (attr === 'cellFactory' && e) { single = e; continue; }
      if (attr === 'itemTemplateSelector' && e) { selector = e; continue; }
      if (attr === 'cellFactories' && e) { factories.push(...cellFactories(e)); continue; }
      if (/^on[A-Z]/.test(attr) && e) { events.push({ name: attr[2].toLowerCase() + attr.slice(3), method: handler(e, loops) }); continue; }
      if (!init) attrs.push({ name: attr, value: 'true' });
      else if (ts.isStringLiteral(init)) attrs.push({ name: attr, value: init.text });
      else if (e) attrs.push({ name: attr, method: expr(e.getText(), loops) });
    }
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${path}: <${listTag}> needs items={…}`);
    const rows = `this.${items.method}(${args(loops)})`;
    const row = (fn: ts.Expression) => {
      while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
      if (!(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) || fn.parameters.length > 1) throw new Error(`${path}: a cell factory is a function of the item`);
      if (ts.isBlock(fn.body)) throw new Error(`${path}: a cell factory with a block body is not supported in a release build yet`);
      const item = fn.parameters[0] ? (fn.parameters[0].name as ts.Identifier).text : `$item${loops.length}`;
      const index = `$i${loops.length}`;
      const inner = [...loops, { item, index, param: `${item} = ${rows}[0], ${index} = 0` }];
      return { item, index, inner, body: jsx(fn.body, inner) };
    };
    const selectorMethod = (inner: Loop[], code: string) => {
      const m = `$b${next++}`;
      methods.push(`  ${m}(${params(inner)}): string { return ${code}; }`);
      attrs.push({ name: 'itemTemplateSelector', method: m });
    };
    let children: TNode[];
    if (selector && factories.length) {
      selectorMethod([...loops, { item: '$item', index: '$index', param: `$item = ${rows}[0], $index = 0` }], `${rewrite(selector.getText(), local(loops))}($item, $index, ${rows})`);
      children = factories.map(({ key, fn }): TNode => {
        const r = row(fn);
        return { kind: 'template', key, item: r.item, index: r.index, body: r.body };
      });
    } else {
      // Without a selector, or without factories to select from, every row is `cellFactory`'s.
      if (!single) throw new Error(`${path}: <${listTag}> needs a cellFactory`);
      const r = row(single);
      const { templates, selector: choose } = rowTemplates(r.body, r.item, r.index);
      if (choose) selectorMethod(r.inner, choose((m) => `this.${m}(${args(r.inner)})`));
      children = templates;
    }
    return { kind: 'element', tag: 'ListView', attrs, events, children };
  };
  /** `new Map([['header', { placeholderItem, cellFactory: (item) => <…/> }], …])`. */
  const cellFactories = (e: ts.Expression): { key: string; fn: ts.Expression }[] => {
    const entries = ts.isNewExpression(e) && e.expression.getText() === 'Map' ? e.arguments?.[0] : undefined;
    if (!entries || !ts.isArrayLiteralExpression(entries)) throw new Error(`${path}: cellFactories={…} needs an inline new Map([...]) in a release build`);
    return entries.elements.map((entry) => {
      const [k, v] = ts.isArrayLiteralExpression(entry) ? entry.elements : [];
      const fn = v && ts.isObjectLiteralExpression(v) ? v.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'cellFactory')?.initializer : undefined;
      if (!k || !ts.isStringLiteral(k) || !fn) throw new Error(`${path}: a cellFactories entry is ['key', { placeholderItem, cellFactory }]`);
      return { key: k.text, fn };
    });
  };

  const jsx = (e: ts.Expression, loops: Loop[]): TNode[] => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return [element(e, loops)];
    if (ts.isJsxFragment(e)) return children(e.children, loops);
    // `cond && <X/>`
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return [{ kind: 'if', branches: [{ cond: expr(e.left.getText(), loops), body: jsx(e.right, loops) }] }];
    // `cond ? <A/> : <B/>`
    if (ts.isConditionalExpression(e)) return [{ kind: 'if', branches: [{ cond: expr(e.condition.getText(), loops), body: jsx(e.whenTrue, loops) }, { cond: null, body: jsx(e.whenFalse, loops) }] }];
    // `list.map((item, i) => <X key={…}/>)`
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'map') {
      const cb = e.arguments[0] as ts.ArrowFunction;
      const item = (cb.parameters[0].name as ts.Identifier).text;
      const index = cb.parameters[1] ? (cb.parameters[1].name as ts.Identifier).text : `$i${loops.length}`;
      const items = expr(e.expression.expression.getText(), loops);
      const inner = [...loops, { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0` }];
      let body = cb.body as ts.Expression;
      while (ts.isParenthesizedExpression(body)) body = body.expression;
      const open = ts.isJsxElement(body) ? body.openingElement : ts.isJsxSelfClosingElement(body) ? body : null;
      const keyAttr = open?.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === 'key') as ts.JsxAttribute | undefined;
      const key = keyAttr?.initializer && ts.isJsxExpression(keyAttr.initializer) ? expr(keyAttr.initializer.expression!.getText(), inner) : keyAttr?.initializer && ts.isStringLiteral(keyAttr.initializer) ? expr(keyAttr.initializer.getText(), inner) : null;
      return [{ kind: 'for', items, key, item, index, body: jsx(body, inner) }];
    }
    throw new Error(`${path}: {${e.getText().slice(0, 50)}} in JSX is not supported in a release build yet`);
  };
  const children = (list: ts.NodeArray<ts.JsxChild>, loops: Loop[]): TNode[] =>
    list.flatMap((c) => {
      if (ts.isJsxText(c)) return [];
      if (ts.isJsxExpression(c)) return c.expression ? jsx(c.expression, loops) : [];
      return jsx(c as ts.Expression, loops);
    });

  let template = jsx(ret!.expression!, []);
  if (screen?.title) {
    // The navigator's header for this screen is the page's action bar.
    const title: Attr = 'value' in screen.title ? { name: 'title', value: screen.title.value } : { name: 'title', method: expr(screen.title.code, []) };
    template = [{ kind: 'element', tag: 'ActionBar', attrs: [title], events: [], children: [] }, ...template];
  }
  const source = [`import { $writable, $navigateTo, type EventData as $EventData } from '@nativescript/release';`, ...imports, '', `export default class ${name} {`, ...fields, ...methods, '}', ''].join('\n');
  return { name, file: `${dirname(path)}/${name}.react.ts`, source, props, template, page: !!screen };
}

/** `navigation.navigate('Detail', { recipe })` → push the Detail screen's page with those props. */
function navigate(code: string, navigation: string, screens: Screen[]): string {
  if (!navigation) return code;
  return code.replace(new RegExp(`\\b${navigation}\\.navigate\\(\\s*['"](\\w+)['"]\\s*,\\s*`, 'g'), (_, route) => {
    const screen = screens.find((s) => s.name === route);
    if (!screen) throw new Error(`navigate('${route}'): no such screen`);
    return `$navigateTo(${screen.component}, `;
  }).replace(new RegExp(`\\$navigateTo\\((\\w+), (\\{[^}]*\\})\\)`, 'g'), (_, c, p) => `$navigateTo(${c}, { props: ${p} })`);
}

/** The params a screen's route takes, from the navigator's param list type (`Routes`). */
function routeParams(files: Map<string, string>, route: string): { alias: string; file: string; params: string[] } | null {
  for (const [file, text] of files) {
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const st of sf.statements) {
      if (!ts.isTypeAliasDeclaration(st) || !ts.isTypeLiteralNode(st.type)) continue;
      const member = st.type.members.find((m) => ts.isPropertySignature(m) && (m.name as ts.Identifier).text === route) as ts.PropertySignature | undefined;
      if (!member?.type) continue;
      const params = ts.isTypeLiteralNode(member.type) ? member.type.members.filter(ts.isPropertySignature).map((m) => (m.name as ts.Identifier).text) : [];
      return { alias: st.name.text, file, params };
    }
  }
  return null;
}

function relativeModule(from: string, to: string): string {
  const r = relative(dirname(from), to).replace(/\.tsx?$/, '');
  return r.startsWith('.') ? r : './' + r;
}

/** The stack navigator's screens and the initial route, from the `<Stack.Navigator>` JSX. */
export function reactScreens(text: string): { screens: Screen[]; initial: string; container: string | null } {
  const sf = ts.createSourceFile('nav.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const screens: Screen[] = [];
  let initial = '';
  let container: string | null = null;
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && n.initializer && ts.isArrowFunction(n.initializer) && /Navigator|NavigationContainer/.test(n.initializer.getText())) container = (n.name as ts.Identifier).text;
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText();
      const attr = (k: string) => n.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText() === k)?.initializer;
      if (tag.endsWith('.Navigator')) { const i = attr('initialRouteName'); if (i && ts.isStringLiteral(i)) initial = i.text; }
      if (tag.endsWith('.Screen')) {
        const nameInit = attr('name') as ts.StringLiteral;
        const comp = (attr('component') as ts.JsxExpression).expression!.getText();
        const opts = attr('options');
        let title: Screen['title'] = null;
        if (opts && ts.isJsxExpression(opts) && opts.expression) {
          let o: ts.Expression = opts.expression;
          let routeVar = '';
          if (ts.isArrowFunction(o)) {
            const p = o.parameters[0]?.name;
            if (p && ts.isObjectBindingPattern(p)) routeVar = (p.elements[0].name as ts.Identifier).text;
            o = o.body as ts.Expression;
            while (ts.isParenthesizedExpression(o)) o = o.expression;
          }
          if (ts.isObjectLiteralExpression(o)) {
            const t = o.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && (p.name as ts.Identifier).text === 'title');
            if (t && ts.isStringLiteral(t.initializer)) title = { value: t.initializer.text };
            else if (t) title = { code: routeVar ? t.initializer.getText().replace(new RegExp(`\\b${routeVar}\\.params\\.`, 'g'), '') : t.initializer.getText() };
          }
        }
        screens.push({ name: nameInit.text, component: comp, title });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { screens, initial: initial || screens[0]?.name || '', container };
}

/**
 * A zustand store (`create<State>()((set) => ({ ...state, ...actions }))`) as a
 * virtual class: a signal per state field read through a getter, a method per
 * action, and `set((s) => ({ field: value }))` as writes of those signals.
 */
export function zustandStore(text: string): string | null {
  const sf = ts.createSourceFile('store.ts', text, ts.ScriptTarget.Latest, true);
  let out = '';
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      const init = d.initializer;
      if (!init || !ts.isCallExpression(init) || !ts.isCallExpression(init.expression) || init.expression.expression.getText() !== 'create') continue;
      const stateType = init.expression.typeArguments?.[0]?.getText() ?? 'any';
      const factory = init.arguments[0] as ts.ArrowFunction;
      const setName = (factory.parameters[0]?.name as ts.Identifier)?.text ?? 'set';
      let obj: ts.Expression = factory.body as ts.Expression;
      while (ts.isParenthesizedExpression(obj)) obj = obj.expression;
      if (!ts.isObjectLiteralExpression(obj)) return null;
      const name = (d.name as ts.Identifier).text;
      const cls = name.replace(/^use/, '') + 'Store';
      const members: string[] = [];
      const fields = new Set<string>();
      for (const p of obj.properties) {
        if (ts.isPropertyAssignment(p) && !(ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))) fields.add((p.name as ts.Identifier).text);
      }
      for (const p of obj.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = (p.name as ts.Identifier).text;
        const v = p.initializer;
        if (fields.has(key)) {
          members.push(`  $${key} = $writable<${stateType}['${key}']>(${v.getText()});`);
          members.push(`  get ${key}(): ${stateType}['${key}'] { return this.$${key}(); }`);
          continue;
        }
        const fn = v as ts.ArrowFunction;
        const params = fn.parameters.map((x) => x.getText()).join(', ');
        // `set((s) => ({ a: x }))` and `set({ a: x })`: write each named field.
        const body = fn.body.getText().replace(new RegExp(`\\b${setName}\\(\\s*(?:\\(?\\s*(\\w+)\\s*\\)?\\s*=>\\s*)?\\(?\\{([^]*)\\}\\)?\\s*\\)\\s*$`), (_, s, inner) => {
          const assigns = splitTopLevel(inner).map((part) => {
            const at = part.indexOf(':');
            const field = part.slice(0, at).trim();
            const value = part.slice(at + 1).trim();
            return `this.$${field}.set(${s ? rewrite(value, { names: new Map([[s, 'this']]) }) : value})`;
          });
          return `{ ${assigns.join('; ')}; }`;
        });
        members.push(`  ${key}(${params}) ${body.startsWith('{') ? body : `{ ${body}; }`}`);
      }
      out += `class ${cls} {\n${members.join('\n')}\n}\nexport const ${name} = new ${cls}();\n`;
    }
  }
  if (!out) return null;
  const rest = sf.statements.filter((s) => !ts.isVariableStatement(s) || !s.getText().includes('create<')).filter((s) => !ts.isImportDeclaration(s)).map((s) => s.getText()).join('\n\n');
  return `import { $writable } from '@nativescript/release';\n${rest}\n\n${out}`;
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  if (text.slice(start).trim()) parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

