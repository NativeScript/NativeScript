import ts from 'typescript';
import { dirname, join, relative } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical, MODELS } from './elements.ts';
import { rowTemplates } from './listview.ts';

/** An app function that mounts a component as a page's Octane root: where it takes the component, its props and the title. */
interface PageFunction { component: number; props: number; title: number; push: boolean }

/** Handler props NativeScript Octane spells the web's way; any other `onFooBar` is the event `fooBar`. */
const EVENT_ALIASES: Record<string, string> = { onClick: 'tap', onPress: 'tap', onTap: 'tap', onDoubleTap: 'doubleTap', onLongPress: 'longPress', onChange: 'textChange', onSubmit: 'returnPress' };
const eventName = (prop: string) => EVENT_ALIASES[prop] ?? prop[2].toLowerCase() + prop.slice(3);

/** Views whose JSX text children are their `text`, as the driver folds `#text` nodes. */
const TEXT_HOSTS = new Set(['Label', 'Button', 'TextField']);
const HOOKS = new Set(['useState', 'useMemo', 'useCallback', 'useSyncExternalStore']);
/** The page title, a prop every page component takes; `$` keeps it clear of the app's own props. */
const TITLE = '$title';

export interface OctaneApp {
  components: ComponentIR[];
  /** Virtual replacements for app modules (an external store). */
  overrides: Map<string, string>;
  /** The app's page and navigation helpers: core and renderer calls, read here rather than translated. */
  glue: Set<string>;
  root: string;
}

/**
 * An Octane NativeScript app: function components over lowercase core tags,
 * each page an Octane root of its own mounted by the app's helper around
 * `renderNativeScriptApp` on a core `Frame`, and stores read through
 * `useSyncExternalStore`.
 */
export function octaneApp(entry: string, files: Map<string, string>): OctaneApp {
  const parse = (f: string, text = files.get(f)!) => ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const { fns: pageFns, glue } = pageFunctions(files, parse);
  const callTo = (n: ts.Node, push: boolean) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && pageFns.get(n.expression.text)?.push === push ? pageFns.get(n.expression.text)! : null;

  // The first page: `frame.navigate({ create: () => createPage(Home, {}, 'Recipes') })` in the entry.
  const entrySf = parse(entry);
  let first: { component: string; props: Attr[]; title: string } | null = null;
  walk(entrySf, (n) => {
    const fn = callTo(n, false);
    if (!fn || first) return;
    const call = n as ts.CallExpression;
    const title = call.arguments[fn.title];
    if (!title || !ts.isStringLiteralLike(title)) throw fail(call, 'the first page needs a string title');
    first = { component: call.arguments[fn.component].getText(), props: staticProps(call.arguments[fn.props]), title: title.text };
  });
  if (!first || !/\bnew Frame\(/.test(files.get(entry)!)) throw new Error(`${entry}: no Frame navigating to a page made with renderNativeScriptApp`);
  const start: { component: string; props: Attr[]; title: string } = first;

  // Components: a TSX file's capitalized functions. Pushing a page and `new Color(x)` are rewritten in the source first.
  const sources = new Map<string, string>();
  const targets = new Set<string>([start.component]);
  const fns: { file: string; name: string }[] = [];
  for (const [f, text] of files) {
    if (!f.endsWith('.tsx')) continue;
    const sf = parse(f);
    const edits: { start: number; end: number; text: string }[] = [];
    const colors = importedFrom(sf, '@nativescript/core').has('Color');
    walk(sf, (n) => {
      const fn = callTo(n, true);
      if (fn) {
        const call = n as ts.CallExpression;
        const component = call.arguments[fn.component].getText();
        const props = call.arguments[fn.props];
        if (props && !ts.isObjectLiteralExpression(props)) throw at(props, 'page props other than an object literal');
        const given = props ? props.properties.map((p) => p.getText()) : [];
        targets.add(component);
        edits.push({ start: call.getStart(), end: call.getEnd(), text: `$navigateTo(${component}, { props: { ${[...given, `${TITLE}: ${call.arguments[fn.title].getText()}`].join(', ')} } })` });
      }
      // The kit takes a CSS color string wherever core takes a Color.
      if (colors && ts.isNewExpression(n) && n.expression.getText() === 'Color' && n.arguments?.length === 1) edits.push({ start: n.getStart(), end: n.getEnd(), text: `(${n.arguments[0].getText()})` });
    });
    let out = text;
    for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    sources.set(f, out);
    for (const st of parse(f, out).statements) if (ts.isFunctionDeclaration(st) && st.name && /^[A-Z]/.test(st.name.text)) fns.push({ file: f, name: st.name.text });
  }
  const names = new Map(fns.map(({ file, name }) => [name, file]));
  const components = fns.map(({ file, name }) => {
    const fn = parse(file, sources.get(file)).statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.name?.text === name)!;
    return octaneComponent(file, fn, targets.has(name), names);
  });

  const overrides = new Map<string, string>();
  for (const [f, text] of files) {
    if (f.endsWith('.tsx') || f === entry || glue.has(f)) continue;
    const store = externalStore(text);
    if (store) overrides.set(f, store);
  }

  // The frame, starting at the first page.
  const root = 'AppFrame';
  if (names.has(root)) throw new Error(`${names.get(root)}: ${root} is the release build's name for the app's frame`);
  const startFile = names.get(start.component);
  if (!startFile) throw new Error(`${entry}: ${start.component} is not a component of the app`);
  const file = join(dirname(entry), `${root}.octane.ts`);
  components.push({
    name: root, file, props: [],
    source: `import ${start.component} from '${moduleFrom(file, startFile, start.component)}';\nexport default class ${root} {}\n`,
    template: [{ kind: 'element', tag: 'Frame', attrs: [], events: [], children: [{ kind: 'component', name: start.component, props: [{ name: TITLE, value: start.title }, ...start.props], events: [] }] }],
  });
  return { components, overrides, glue, root };
}

/**
 * The app's page functions: one that calls `renderNativeScriptApp(page, component, props)`
 * and sets `page.actionBar.title`, and those that pass their arguments on to
 * it, pushing the page when they do it inside a `navigate(...)` call.
 */
function pageFunctions(files: Map<string, string>, parse: (f: string) => ts.SourceFile) {
  const fns = new Map<string, PageFunction>();
  const glue = new Set<string>();
  for (const [f, text] of files) {
    if (f.endsWith('.tsx') || !text.includes('renderNativeScriptApp')) continue;
    const decls = parse(f).statements.filter((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && !!s.name && !!s.body);
    const params = (fn: ts.FunctionDeclaration) => fn.parameters.map((p) => p.name.getText());
    for (const fn of decls) {
      const ps = params(fn);
      const found = { component: -1, props: -1, title: -1, push: false };
      walk(fn.body!, (n) => {
        if (ts.isCallExpression(n) && n.expression.getText() === 'renderNativeScriptApp') {
          found.component = ps.indexOf(n.arguments[1]?.getText() ?? '');
          found.props = ps.indexOf(n.arguments[2]?.getText() ?? '');
        }
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && /\.actionBar\.title$/.test(n.left.getText())) found.title = ps.indexOf(n.right.getText());
      });
      if (found.component < 0) continue;
      if (found.title < 0) throw fail(fn, 'a page needs its title set from a parameter (`page.actionBar.title = title`)');
      fns.set(fn.name!.text, found);
      glue.add(f);
    }
    for (const fn of decls) {
      if (fns.has(fn.name!.text)) continue;
      const ps = params(fn);
      walk(fn.body!, (n) => {
        if (!ts.isCallExpression(n) || !ts.isIdentifier(n.expression)) return;
        const inner = fns.get(n.expression.text);
        if (!inner || inner.push) return;
        const arg = (i: number) => ps.indexOf(n.arguments[i]?.getText() ?? '');
        let push = false;
        for (let p: ts.Node = n.parent; p !== fn; p = p.parent) if (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && p.expression.name.text === 'navigate') push = true;
        fns.set(fn.name!.text, { component: arg(inner.component), props: arg(inner.props), title: arg(inner.title), push });
      });
    }
  }
  return { fns, glue };
}

/**
 * An Octane function component as a virtual class. Octane re-runs the body
 * on every render, as React does; the release build gets the same results by
 * making `useState` a signal, `useMemo` and every other body const a derived
 * value, and `useSyncExternalStore` a getter over the store's signals.
 */
function octaneComponent(path: string, fn: ts.FunctionDeclaration, page: boolean, components: Map<string, string>): ComponentIR {
  const name = fn.name!.text;
  const sf = fn.getSourceFile();
  const file = `${dirname(path)}/${name}.octane.ts`;
  const scope: Scope = { names: new Map() };
  const fields: string[] = [];
  const props: string[] = [];
  const arity = new Map<string, number>();

  // Props: `{ recipe, onTap }: { recipe: Recipe; onTap: () => void }`, or `props: { ... }` read as `props.recipe`.
  const param = fn.parameters[0];
  let propsName = '';
  if (param) {
    if (!param.type || !ts.isTypeLiteralNode(param.type)) throw at(param, 'props not typed as an inline object type');
    if (ts.isIdentifier(param.name)) propsName = param.name.text;
    else if (ts.isObjectBindingPattern(param.name) && param.name.elements.some((e) => e.propertyName || e.initializer || e.dotDotDotToken)) throw at(param, 'renamed, defaulted or rest props');
    for (const m of param.type.members) {
      if (!ts.isPropertySignature(m) || !m.type) continue;
      const p = (m.name as ts.Identifier).text;
      props.push(p);
      fields.push(`  ${p}!: ${m.type.getText()};`);
      if (!propsName) scope.names.set(p, `this.${p}`);
      if (ts.isFunctionTypeNode(m.type)) arity.set(p, m.type.parameters.length);
    }
  }
  if (page) {
    props.push(TITLE);
    fields.push(`  ${TITLE}!: string;`);
  }
  const full = (s: Scope): Scope => ({ names: s.names, members: propsName ? { object: propsName, replacement: 'this' } : undefined });

  const body = fn.body!.statements;
  const ret = body.find(ts.isReturnStatement);
  if (!ret?.expression) throw fail(fn, `${name} returns no JSX`);
  const hook = (e: ts.Expression) => (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && /^use[A-Z]/.test(e.expression.text) ? e.expression.text : null);
  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st) && st.name) {
      arity.set(st.name.text, st.parameters.length);
      scope.names.set(st.name.text, `this.${st.name.text}`);
      continue;
    }
    if (!ts.isVariableStatement(st)) throw at(st, `a statement in ${name}`);
    for (const d of st.declarationList.declarations) {
      const init = d.initializer!;
      const h = hook(init);
      if (h && !HOOKS.has(h)) throw at(init, h);
      if (ts.isArrayBindingPattern(d.name)) {
        if (h !== 'useState') throw at(d, 'array destructuring');
        const [value, setter] = d.name.elements.map((e) => (ts.isBindingElement(e) ? e.name.getText() : ''));
        scope.names.set(value, `this.${value}()`);
        if (setter) scope.names.set(setter, `this.${value}.$write`);
        continue;
      }
      if (!ts.isIdentifier(d.name)) throw at(d, 'object destructuring');
      const id = d.name.text;
      const fnInit = h === 'useCallback' ? (init as ts.CallExpression).arguments[0] : init;
      if (ts.isArrowFunction(fnInit) || ts.isFunctionExpression(fnInit)) arity.set(id, fnInit.parameters.length);
      scope.names.set(id, `this.${id}`);
    }
  }
  if (page) scope.names.set(TITLE, `this.${TITLE}`);

  const method = (id: string, f: ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration) => {
    const b = ts.isBlock(f.body!) ? f.body.getText() : `{ return ${f.body!.getText()}; }`;
    return `  ${(ts.getModifiers(f as ts.FunctionDeclaration)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '')}${id}(${f.parameters.map((p) => p.getText()).join(', ')})${f.type ? `: ${f.type.getText()}` : ''} ${rewrite(b, full(scope), 'statements')}`;
  };
  const getter = (id: string, f: ts.ArrowFunction | ts.FunctionExpression) =>
    `  get ${id}() ${ts.isBlock(f.body) ? rewrite(f.body.getText(), full(scope), 'statements') : `{ return ${rewrite(f.body.getText(), full(scope))}; }`}`;
  for (const st of body) {
    if (st === ret) continue;
    if (ts.isFunctionDeclaration(st)) { fields.push(method(st.name!.text, st)); continue; }
    for (const d of (st as ts.VariableStatement).declarationList.declarations) {
      const init = d.initializer!;
      const h = hook(init);
      const args = h ? (init as ts.CallExpression).arguments : ts.factory.createNodeArray<ts.Expression>();
      if (h === 'useState') {
        const value = ((d.name as ts.ArrayBindingPattern).elements[0] as ts.BindingElement).name.getText();
        const call = init as ts.CallExpression;
        const typeArgs = call.typeArguments ? `<${call.typeArguments.map((t) => t.getText()).join(', ')}>` : '';
        fields.push(`  ${value} = $writable${typeArgs}(${args[0] ? rewrite(args[0].getText(), full(scope)) : 'undefined'});`);
        continue;
      }
      const id = (d.name as ts.Identifier).text;
      if (h === 'useSyncExternalStore') {
        // The store's state is signals: reading the snapshot is the subscription.
        const snapshot = args[1];
        if (ts.isArrowFunction(snapshot) || ts.isFunctionExpression(snapshot)) fields.push(getter(id, snapshot));
        else fields.push(`  get ${id}() { return ${rewrite(snapshot.getText(), full(scope))}(); }`);
        continue;
      }
      if (h === 'useMemo') { fields.push(getter(id, args[0] as ts.ArrowFunction)); continue; }
      if (h === 'useCallback') { fields.push(method(id, args[0] as ts.ArrowFunction)); continue; }
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) { fields.push(method(id, init)); continue; }
      // Octane recomputes a body const on every render: a derived value.
      fields.push(`  get ${id}() { return ${rewrite(init.getText(), full(scope))}; }`);
    }
  }

  // The template.
  const methods: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const loopArgs = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (loops: Loop[], extra: Record<string, string> = {}): Scope => {
    const names = new Map(scope.names);
    for (const l of loops) { names.delete(l.item); names.delete(l.index); }
    for (const [k, v] of Object.entries(extra)) names.set(k, v);
    return full({ names });
  };
  const expr = (code: string, loops: Loop[]) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(loops)}) { return ${rewrite(code, local(loops))}; }`);
    return m;
  };
  /** A handler; on a two-way element's change event, `e.object.<its property>` is the event's value. */
  const handler = (e: ts.Expression, loops: Loop[], model?: { prop: string; type: string }) => {
    const m = `$e${next++}`;
    let code: string;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const p = e.parameters[0] ? e.parameters[0].name.getText() : null;
      let text = e.body.getText();
      if (p && model) text = text.replace(new RegExp(`\\b${p}\\.object\\.${model.prop}\\b`, 'g'), `(${p}.value as ${model.type})`);
      const extra = p ? { [p]: '$event' } : {};
      code = ts.isBlock(e.body) ? rewrite(text, local(loops, extra), 'statements') : `${rewrite(text, local(loops, extra)).slice(1, -1)};`;
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
    const isComponent = /^[A-Z]/.test(tag);
    const el = isComponent ? null : canonical(tag);
    if (isComponent && !components.has(tag)) throw fail(open, `<${tag}> is not a component of the app`);
    if (!isComponent && !el) throw fail(open, `<${tag}> is not a @nativescript/core element the release build knows`);
    const model = el ? MODELS[el] : undefined;
    const attrs: Attr[] = [];
    const events: Event[] = [];
    let renderItem: ts.Expression | null = null;
    for (const a of open.attributes.properties) {
      if (!ts.isJsxAttribute(a)) throw at(a, 'a spread attribute');
      const attr = a.name.getText();
      if (attr === 'key') continue;
      if (attr === 'ref') throw at(a, 'ref');
      const init = a.initializer;
      if (el === 'ListView' && attr === 'renderItem' && init && ts.isJsxExpression(init) && init.expression) { renderItem = init.expression; continue; }
      if (el === 'ListView' && (attr === 'itemTemplateSelector' || attr === 'itemTemplates' || attr === 'itemTemplate')) throw at(a, `${attr} on a listview`);
      if (!isComponent && /^on[A-Z]/.test(attr) && init && ts.isJsxExpression(init) && init.expression) {
        const ev = eventName(attr);
        events.push({ name: ev, method: handler(init.expression, loops, model?.event === ev ? model : undefined) });
        continue;
      }
      const name = attr === 'className' ? 'class' : attr;
      if (!init) attrs.push({ name, value: 'true' });
      else if (ts.isStringLiteral(init)) attrs.push({ name, value: init.text });
      else if (ts.isJsxExpression(init) && init.expression) attrs.push({ name, method: expr(init.expression.getText(), loops) });
    }
    const kids = ts.isJsxElement(n) ? n.children : ts.factory.createNodeArray<ts.JsxChild>();
    if (isComponent) {
      if (kids.some((c) => !ts.isJsxText(c) || !c.containsOnlyTriviaWhiteSpaces)) throw at(n, 'children of a component');
      return { kind: 'component', name: tag, props: attrs, events };
    }
    if (el === 'ListView') {
      if (kids.some((c) => !ts.isJsxText(c) || !c.containsOnlyTriviaWhiteSpaces)) throw at(n, 'children of a listview');
      if (!renderItem) throw fail(open, 'a listview needs renderItem in a release build');
      return { kind: 'element', tag: el, attrs, events, children: rows(renderItem, attrs, loops) };
    }
    if (TEXT_HOSTS.has(el!)) {
      const text = textOf(kids, loops);
      if (text) attrs.push(text);
      return { kind: 'element', tag: el!, attrs, events, children: [] };
    }
    return { kind: 'element', tag: el!, attrs, events, children: children(kids, loops) };
  };

  /**
   * A listview's `renderItem(item, index)`, which the driver renders into a cell of its own; a row that is a
   * conditional becomes a template per branch.
   */
  const rows = (fn: ts.Expression, attrs: Attr[], loops: Loop[]): TNode[] => {
    while (ts.isParenthesizedExpression(fn)) fn = fn.expression;
    if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) throw at(fn, 'renderItem other than an inline function');
    if (ts.isBlock(fn.body)) throw at(fn, 'renderItem with a block body');
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw at(fn, 'a listview without bound items');
    const item = fn.parameters[0] ? fn.parameters[0].name.getText() : `$item${loops.length}`;
    const index = fn.parameters[1] ? fn.parameters[1].name.getText() : `$i${loops.length}`;
    const inner = [...loops, { item, index, param: `${item} = this.${items.method}(${loopArgs(loops)})[0], ${index} = 0` }];
    const { templates, selector } = rowTemplates(jsx(fn.body, inner), item, index);
    if (selector) {
      const m = `$b${next++}`;
      methods.push(`  ${m}(${params(inner)}): string { return ${selector((c) => `this.${c}(${loopArgs(inner)})`)}; }`);
      attrs.push({ name: 'itemTemplateSelector', method: m });
    }
    return templates;
  };

  /** Text children as the driver folds them into `text`: JSX's whitespace rules, then each expression printed. */
  const textOf = (list: ts.NodeArray<ts.JsxChild>, loops: Loop[]): Attr | null => {
    let literal = '';
    let template = '';
    let dynamic = false;
    for (const c of list) {
      if (ts.isJsxText(c)) {
        const t = jsxText(c.text);
        literal += t;
        template += t.replace(/[\\`]/g, '\\$&').replace(/\$\{/g, '\\${');
      } else if (ts.isJsxExpression(c)) {
        if (!c.expression) continue;
        dynamic = true;
        template += '${' + c.expression.getText() + '}';
      } else throw at(c, 'an element inside a text view');
    }
    if (dynamic) return { name: 'text', method: expr('`' + template + '`', loops) };
    return literal ? { name: 'text', value: literal } : null;
  };

  const jsx = (e: ts.Expression, loops: Loop[]): TNode[] => {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return [];
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return [element(e, loops)];
    if (ts.isJsxFragment(e)) return children(e.children, loops);
    // `cond && <X/>`
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return [{ kind: 'if', branches: [{ cond: expr(e.left.getText(), loops), body: jsx(e.right, loops) }] }];
    // `cond ? <A/> : <B/>`
    if (ts.isConditionalExpression(e)) return [{ kind: 'if', branches: [{ cond: expr(e.condition.getText(), loops), body: jsx(e.whenTrue, loops) }, { cond: null, body: jsx(e.whenFalse, loops) }] }];
    // `list.map((item, i) => <X key={…}/>)`
    if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === 'map') {
      const cb = e.arguments[0];
      if (!ts.isArrowFunction(cb)) throw at(e, '.map without an arrow function');
      const item = cb.parameters[0].name.getText();
      const index = cb.parameters[1] ? cb.parameters[1].name.getText() : `$i${loops.length}`;
      const items = expr(e.expression.expression.getText(), loops);
      const inner = [...loops, { item, index, param: `${item} = this.${items}(${loopArgs(loops)})[0], ${index} = 0` }];
      let row = cb.body as ts.Expression;
      while (ts.isParenthesizedExpression(row)) row = row.expression;
      const open = ts.isJsxElement(row) ? row.openingElement : ts.isJsxSelfClosingElement(row) ? row : null;
      const keyAttr = open?.attributes.properties.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && a.name.getText() === 'key');
      const k = keyAttr?.initializer;
      const key = k && ts.isJsxExpression(k) && k.expression ? expr(k.expression.getText(), inner) : k && ts.isStringLiteral(k) ? expr(k.getText(), inner) : null;
      return [{ kind: 'for', items, key, item, index, body: jsx(row, inner) }];
    }
    throw at(e, `{${e.getText().slice(0, 50)}} in JSX`);
  };
  const children = (list: ts.NodeArray<ts.JsxChild>, loops: Loop[]): TNode[] =>
    list.flatMap((c) => {
      if (ts.isJsxText(c)) {
        if (!c.containsOnlyTriviaWhiteSpaces) throw at(c, 'text outside a text view');
        return [];
      }
      if (ts.isJsxExpression(c)) return c.expression ? jsx(c.expression, loops) : [];
      return jsx(c as ts.Expression, loops);
    });

  let template = jsx(ret.expression, []);
  // The page's action bar, titled by whoever pushed it.
  if (page) template = [{ kind: 'element', tag: 'ActionBar', attrs: [{ name: 'title', method: expr(TITLE, []) }], events: [], children: [] }, ...template];

  // Imports: components as their virtual classes, Octane's own modules dropped, the rest as far as the class still uses them.
  const members = [...fields, ...methods].join('\n');
  const used = (id: string) => new RegExp(`(^|[^\\w$])${id.replace(/\$/g, '\\$')}(?![\\w$])`).test(members);
  const imports: string[] = [];
  for (const i of sf.statements.filter(ts.isImportDeclaration)) {
    const from = (i.moduleSpecifier as ts.StringLiteral).text;
    if (from === 'octane' || from.startsWith('octane/') || from.startsWith('@nativescript-community/octane')) continue;
    const clause = i.importClause;
    if (!clause) continue;
    const named = clause.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : [];
    const locals = [...named.map((e) => e.name.text), ...(clause.name ? [clause.name.text] : [])];
    for (const n of locals) if (components.has(n) && used(n)) imports.push(`import ${n} from '${moduleFrom(file, components.get(n)!, n)}';`);
    const kept = named.filter((e) => !components.has(e.name.text) && used(e.name.text));
    if (kept.length) imports.push(`import ${clause.isTypeOnly ? 'type ' : ''}{ ${kept.map((e) => e.getText()).join(', ')} } from '${from}';`);
    if (clause.name && !components.has(clause.name.text) && used(clause.name.text)) imports.push(`import ${clause.name.text} from '${from}';`);
  }
  const source = [`import { $writable, $navigateTo, type EventData as $EventData } from '@nativescript/release';`, ...imports, '', `export default class ${name} {`, ...fields, ...methods, '}', ''].join('\n');
  return { name, file, source, props, template, page };
}

/**
 * A store in the shape `useSyncExternalStore` reads (`let state: State`, a
 * `setState(patch)` that replaces it and notifies, `getState()`), as a class
 * named for the state type: a signal per field read through a getter, and
 * `setState({ field: value })` as writes of those signals. The listeners and
 * `subscribe` go: reading a signal is the subscription.
 */
export function externalStore(text: string): string | null {
  const sf = ts.createSourceFile('store.ts', text, ts.ScriptTarget.Latest, true);
  let state: ts.VariableDeclaration | null = null;
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || st.declarationList.flags & ts.NodeFlags.Const) continue;
    for (const d of st.declarationList.declarations) if (d.type && ts.isTypeReferenceNode(d.type) && d.initializer && ts.isObjectLiteralExpression(d.initializer)) state = d;
  }
  if (!state) return null;
  const stateName = state.name.getText();
  const typeName = state.type!.getText();
  const iface = sf.statements.find((s): s is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(s) && s.name.text === typeName);
  // The setter: `state = { ...state, ...patch }`.
  const setter = sf.statements.find((s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && !!s.body && new RegExp(`\\b${stateName}\\s*=\\s*\\{\\s*\\.\\.\\.${stateName}\\b`).test(s.body.getText()));
  if (!iface || !setter) return null;
  const setterName = setter.name!.text;
  // What the setter notifies through, and everything built on it.
  const machinery = new Set<string>();
  walk(setter.body!, (n) => { if (ts.isIdentifier(n) && n.text !== stateName && sf.statements.some((s) => ts.isVariableStatement(s) && s.declarationList.declarations.some((d) => d.name.getText() === n.text))) machinery.add(n.text); });
  const mentions = (s: ts.Node) => [...machinery].some((m) => new RegExp(`\\b${m}\\b`).test(s.getText()));

  const fields = iface.members.filter(ts.isPropertySignature).map((m) => ({ name: m.name.getText(), type: m.type!.getText() }));
  const initial = new Map(state.initializer!.kind === ts.SyntaxKind.ObjectLiteralExpression ? (state.initializer as ts.ObjectLiteralExpression).properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(), p.initializer.getText()] as [string, string]) : []);
  const exported = iface.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? 'export ' : '';
  const cls = [`${exported}class ${typeName} {`, ...fields.flatMap((f) => [`  $${f.name} = $writable<${f.type}>(${initial.get(f.name) ?? 'undefined'});`, `  get ${f.name}(): ${f.type} { return this.$${f.name}(); }`]), '}'].join('\n');

  const out: string[] = [`import { $writable } from '@nativescript/release';`];
  for (const st of sf.statements) {
    if (st === iface || st === setter || st === state.parent.parent) continue;
    if (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => machinery.has(d.name.getText()))) continue;
    if (ts.isFunctionDeclaration(st) && mentions(st)) continue;
    if (ts.isFunctionDeclaration(st) && st.body) {
      const edits: { start: number; end: number; text: string }[] = [];
      walk(st.body, (n) => {
        if (!ts.isExpressionStatement(n) || !ts.isCallExpression(n.expression) || n.expression.expression.getText() !== setterName) return;
        const patch = n.expression.arguments[0];
        if (!patch || !ts.isObjectLiteralExpression(patch)) throw at(n, `${setterName} with anything but an object literal`);
        const writes = patch.properties.map((p) => {
          if (ts.isShorthandPropertyAssignment(p)) return `${stateName}.$${p.name.text}.set(${p.name.text});`;
          if (ts.isPropertyAssignment(p)) return `${stateName}.$${p.name.getText()}.set(${p.initializer.getText()});`;
          throw at(p, 'a patch member');
        });
        edits.push({ start: n.getStart(), end: n.getEnd(), text: writes.join(' ') });
      });
      let code = st.getText();
      const base = st.getStart();
      for (const e of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, e.start - base) + e.text + code.slice(e.end - base);
      out.push(code);
      continue;
    }
    out.push(st.getText());
  }
  out.splice(1, 0, cls, `const ${stateName} = new ${typeName}();`);
  return out.join('\n\n') + '\n';
}

/** Page props given in the entry: string literals only. */
function staticProps(e: ts.Expression | undefined): Attr[] {
  if (!e) return [];
  if (!ts.isObjectLiteralExpression(e)) throw at(e, 'first-page props other than an object literal');
  return e.properties.map((p) => {
    if (!ts.isPropertyAssignment(p) || !ts.isStringLiteralLike(p.initializer)) throw at(p, 'a first-page prop that is not a string');
    return { name: p.name.getText(), value: p.initializer.text };
  });
}

/** JSX text as JSX keeps it: lines trimmed where they meet a line break, blank lines dropped, the rest joined by a space. */
function jsxText(raw: string): string {
  const lines = raw.split(/\r\n|\n|\r/);
  let last = -1;
  lines.forEach((l, i) => { if (/[^ \t]/.test(l)) last = i; });
  let out = '';
  lines.forEach((line, i) => {
    let t = line.replace(/\t/g, ' ');
    if (i > 0) t = t.replace(/^ +/, '');
    if (i < lines.length - 1) t = t.replace(/ +$/, '');
    if (t) out += i === last ? t : t + ' ';
  });
  return out;
}

function importedFrom(sf: ts.SourceFile, module: string): Set<string> {
  const names = new Set<string>();
  for (const i of sf.statements.filter(ts.isImportDeclaration)) {
    const b = i.importClause?.namedBindings;
    if ((i.moduleSpecifier as ts.StringLiteral).text === module && b && ts.isNamedImports(b)) for (const e of b.elements) names.add(e.name.text);
  }
  return names;
}

/** The import specifier of component `name` (defined in `source`) from the virtual file `from`. */
function moduleFrom(from: string, source: string, name: string): string {
  const r = relative(dirname(from), join(dirname(source), `${name}.octane`));
  return r.startsWith('.') ? r : './' + r;
}

function walk(node: ts.Node, visit: (n: ts.Node) => void) {
  visit(node);
  ts.forEachChild(node, (c) => walk(c, visit));
}

function at(n: ts.Node, what: string): Error {
  return fail(n, `${what} is not supported in a release build yet`);
}

function fail(n: ts.Node, message: string): Error {
  const sf = n.getSourceFile();
  const { line, character } = sf.getLineAndCharacterOfPosition(n.getStart());
  return new Error(`${sf.fileName}:${line + 1}:${character + 1}: ${message}`);
}
