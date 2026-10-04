import type { Attr, ComponentIR, TNode } from './ir.ts';
import type { Framework } from './codegen.ts';
import { ident, kotlinString } from './kotlin.ts';

/** ListView attributes that `bind` takes rather than `set`. */
const LIST_BINDINGS = new Set(['items', 'itemTemplateSelector']);

/**
 * A component's template as a Kotlin `render()`: views are created once,
 * each binding is one effect that sets one property, and each `if`/`for`
 * owns a region of its container. Nothing is diffed at run time. What a
 * binding or handler throws is reported, as the frameworks report errors in
 * templates.
 */
export interface RenderOptions {
  framework?: string;
  /**
   * Properties of a layout the navigator puts around a routed page's content
   * (react-nativescript-navigation's flexbox), or none.
   */
  screenContent?: Record<string, string>;
  /** Angular with zone.js: every binding is checked on each tick and applied when its value changed. */
  zone?: boolean;
}

export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[]; outputFields?: Record<string, string> }>, options: RenderOptions = {}): string[] {
  const lines: string[] = [];
  const framework = (options.framework ?? 'octane') as Framework;
  // The order each framework applies bindings and inserts views in, as codegen.ts does for Swift.
  const postOrder = framework === 'vue' || framework === 'svelte' || framework === 'react';
  const deferBindings = framework === 'solid' || framework === 'angular' || framework === 'svelte5';
  const insertion = framework === 'angular' ? 'created' : framework === 'svelte' ? 'mounted' : 'built';
  type Line = { depth: number; text: string };
  const templates: { bindings: Line[]; inserts: Line[]; listeners: Line[] }[] = [];
  /** A template's views and structure, then its deferred inserts, bindings and (Svelte 5) listeners. */
  const template = (depth: number, body: () => void) => {
    templates.push({ bindings: [], inserts: [], listeners: [] });
    body();
    const t = templates.pop()!;
    for (const d of [...t.inserts, ...t.bindings, ...t.listeners]) say(d.depth, d.text);
  };
  // Svelte 5 adds a template's event listeners after its template effect has set the properties.
  const listener = (depth: number, text: string) => (framework === 'svelte5' && templates.length ? templates.at(-1)!.listeners.push({ depth, text }) : say(depth, text));
  /** A lambda that renders content in the scope its framework orders it in. */
  const scoped = (kind: 'template' | 'region') => {
    if (framework === 'vue' || framework === 'svelte') return kind === 'template' ? 'EffectOrder.component {' : null;
    if (framework === 'angular') return kind === 'template' ? 'EffectOrder.view {' : 'EffectOrder.embedded(__view) {';
    if (framework === 'solid') return kind === 'template' ? 'EffectOrder.solid {' : 'EffectOrder.deeper {';
    return null;
  };
  let n = 0;
  const say = (depth: number, text: string) => lines.push('    '.repeat(depth) + text);
  // Loop variables in scope, passed to every binding method in order.
  // A ListView row reads its item and index through the row's signals.
  type Loop = { item: string; index: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `this.${ident(method)}(${[...loops.flatMap((l) => [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)]), ...extra].join(', ')})`;

  const binding = (depth: number, text: string) => (deferBindings && templates.length ? templates.at(-1)!.bindings.push({ depth, text }) : say(depth, text));
  /** Puts a view into its container or region at the point its framework inserts it. */
  const attach = (depth: number, v: string, parent: string | null, region: string | null, at: 'created' | 'built') => {
    const text = parent ? `${parent}.addChild(${v})` : region ? `${region}.attach(${v})` : null;
    if (!text) return;
    if (insertion === 'mounted' && templates.length) { if (at === 'created') templates.at(-1)!.inserts.push({ depth, text }); return; }
    if ((insertion === 'created') === (at === 'created')) say(depth, text);
  };
  const attr = (depth: number, v: string, a: Attr, loops: Loop[]) => {
    if ('value' in a) {
      if (a.name === 'class') say(depth, `${v}.className = ${kotlinString(a.value)}`);
      else say(depth, `${v}.set(${kotlinString(a.name)}, ${kotlinString(a.value)})`);
    } else if (options.zone) {
      binding(depth, `Check({ ${call(a.method, loops)} }) { ${a.name === 'class' ? `${v}.className = it` : `${v}.set(${kotlinString(a.name)}, it)`} }`);
    } else if (a.name === 'class') {
      binding(depth, `Effect { jsReport { ${v}.className = ${call(a.method, loops)} } }`);
    } else {
      binding(depth, `Effect { jsReport { ${v}.set(${kotlinString(a.name)}, ${call(a.method, loops)}) } }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null, region: string | null = null) => {
    for (const node of nodes) {
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          say(depth, `val ${v} = Router.shared.outlet()`);
          attach(depth, v, parent, region, 'created');
        } else if (node.kind === 'element') {
          say(depth, `val ${v} = ${node.tag}()`);
          const isList = node.tag === 'ListView';
          const props = () => {
            for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
            for (const e of node.events) listener(depth, `${v}.on(${kotlinString(e.name)}) { event -> jsReport { ${call(e.method, loops, ['event'])} } }`);
          };
          if (isList || !postOrder) props();
          attach(depth, v, parent, region, 'created');
          if (isList) list(node, depth, loops, v);
          else emit(node.children, depth, loops, v, null);
          if (!isList && postOrder) props();
        } else {
          const info = components.get(node.name);
          if (!info) throw new Error(`${c.name}: <${node.name}> is not a component`);
          const given = new Map(node.props.map((p) => [p.name, p]));
          const c0 = `c${n++}`;
          const args = info.props.map((p) => {
            const a = given.get(p);
            if (!a) throw new Error(`${c.name}: <${node.name}> needs the prop "${p}"`);
            return `${ident(p)} = ${'value' in a ? kotlinString(a.value) : `untrack { ${call(a.method, loops)} }`}`;
          });
          say(depth, `val ${c0} = ${node.name}(${args.join(', ')})`);
          for (const p of info.props) {
            const a = given.get(p)!;
            if ('method' in a) say(depth, options.zone ? `Check({ ${call(a.method, loops)} }) { ${c0}.${ident(p)}.value = it }` : `Effect { jsReport { ${c0}.${ident(p)}.value = ${call(a.method, loops)} } }`);
          }
          say(depth, `val ${v} = ${c0}.render()`);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.includes(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(info.outputFields?.[e.name] ?? e.name)}.on { value -> jsReport { ${call(e.method, loops, [`EventData(${kotlinString(e.name)}, ${v}, value)`])} } }`);
            else say(depth, `${v}.on(${kotlinString(e.name)}) { event -> jsReport { ${call(e.method, loops, ['event'])} } }`);
          }
          attach(depth, v, parent, region, 'created');
        }
        attach(depth, v, parent, region, 'built');
        collect?.push(v);
        continue;
      }
      if (node.kind === 'template') throw new Error(`${c.name}: an item template outside a ListView`);
      if (!parent) throw new Error(`${c.name}: an if/for at the root of a template`);
      // A framework that inserts top-down puts a branch's views in place as it builds them.
      const live = insertion !== 'built' ? `r${n++}` : null;
      if (live && insertion === 'mounted' && templates.length) {
        say(depth, `val ${live} = Region(null)`);
        templates.at(-1)!.inserts.push({ depth, text: `${parent}.addRegion(${live})` });
      } else if (live) say(depth, `val ${live} = ${parent}.addRegion()`);
      const host = live ?? `${parent}.addRegion()`;
      if (node.kind === 'if') {
        const which = node.branches.map((b, i) => (b.cond ? `if (${call(b.cond, loops)}) ${i} else ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `Choose(${host}, { ${which} }) { branch ->`);
        const wrap = scoped('region');
        const d = wrap ? depth + 1 : depth;
        if (wrap) say(depth + 1, wrap);
        if (framework === 'angular' && node.branches.some((b) => hasRegion(b.body))) say(d + 1, 'val __view = EffectOrder.current');
        say(d + 1, 'when (branch) {');
        node.branches.forEach((b, i) => {
          say(d + 2, `${i} -> {`);
          const made: string[] = [];
          template(d + 3, () => emit(b.body, d + 3, loops, null, made, live));
          say(d + 3, `listOf(${made.join(', ')})`);
          say(d + 2, '}');
        });
        say(d + 2, 'else -> listOf()');
        say(d + 1, '}');
        if (wrap) say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      const inner = [...loops, { item: node.item, index: node.index }];
      // A key may be any value (`:key="i"`); rows are kept by its string form.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} -> jsKey(${call(node.key, inner)}) }` : `{ item, _ -> jsKey(item) }`;
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      say(depth, `For(${host}, { ${call(node.items, loops)}.elements }, ${key}) { ${ident(node.item)}, ${ident(node.index)} ->`);
      const wrap = scoped('region');
      const d = wrap ? depth + 1 : depth;
      if (wrap) say(depth + 1, wrap);
      if (framework === 'angular' && hasRegion(node.body)) say(d + 1, 'val __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(node.body, d + 1, inner, null, made, live));
      say(d + 1, `listOf(${made.join(', ')})`);
      if (wrap) say(depth + 1, '}');
      say(depth, '}');
    }
  };

  /** A ListView's items, selector and templates: one `bind`, whose closure renders a template for a row. */
  const list = (node: Extract<TNode, { kind: 'element' }>, depth: number, loops: Loop[], v: string) => {
    const items = node.attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${c.name}: <ListView> needs bound items`);
    const selector = node.attrs.find((a) => a.name === 'itemTemplateSelector');
    const sel = selector && 'method' in selector ? `, selector = { item, index -> ${call(selector.method, loops, ['item', 'index'])} }` : '';
    const rowTemplates = node.children.filter((t): t is Extract<TNode, { kind: 'template' }> => t.kind === 'template');
    if (!rowTemplates.length) { say(depth, `${v}.bind(items = { ${call(items.method, loops)}.elements }${sel})`); return; }
    const row = `row${n++}`;
    const fallback = rowTemplates.find((t) => t.key === 'default') ?? rowTemplates[0];
    say(depth, `${v}.bind(items = { ${call(items.method, loops)}.elements }, templates = listOf(${rowTemplates.map((t) => kotlinString(t.key)).join(', ')})${sel}) { key, ${row} ->`);
    say(depth + 1, 'when (key) {');
    for (const t of [...rowTemplates.filter((t) => t !== fallback), fallback]) {
      say(depth + 2, `${t === fallback ? 'else' : kotlinString(t.key)} -> {`);
      const wrap = scoped('template');
      const d = wrap ? depth + 3 : depth + 2;
      if (wrap) say(depth + 3, wrap);
      if (framework === 'angular' && hasRegion(t.body)) say(d + 1, 'val __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(t.body, d + 1, [...loops, { item: t.item, index: t.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }], null, made));
      if (made.length !== 1) throw new Error(`${c.name}: a ListView template needs exactly one root element`);
      say(d + 1, made[0]);
      if (wrap) say(depth + 3, '}');
      say(depth + 2, '}');
    }
    say(depth + 1, '}');
    say(depth, '}');
  };

  say(1, 'fun render(): View {');
  const wrap = scoped('template');
  const d = wrap ? 3 : 2;
  if (wrap) say(2, `return ${wrap}`);
  if (framework === 'angular' && hasRegion(c.template)) say(d, 'val __view = EffectOrder.current');
  // Inside the scope lambda the result is its last expression.
  const result = (v: string) => say(d, wrap ? v : `return ${v}`);
  if (c.init) say(d, `jsReport { this.${ident(c.init)}() }`);
  // A watcher runs before the bindings of its component, as Vue's pre-flush jobs do.
  for (const w of c.watchers ?? []) {
    if (!w.source) continue;
    say(d, `Watch(${w.immediate}, { this.${ident(w.source)}() }) { value, old -> jsReport { this.${ident(w.handler)}(${['value', 'old'].slice(0, w.arity).join(', ')}) } }`);
  }
  // Svelte's `$effect` runs after the template effects a write invalidates.
  const userEffects = () => { for (const w of c.watchers ?? []) if (!w.source) say(d, `EffectOrder.user { Effect { jsReport { this.${ident(w.handler)}() } } }`); };
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(d, 'val page = Page()');
    if (options.screenContent) {
      const isBar = (n: TNode) => n.kind === 'element' && n.tag === 'ActionBar';
      template(d, () => {
        emit(c.template.filter(isBar), d, [], 'page', null);
        say(d, 'val content = FlexboxLayout()');
        for (const [name, value] of Object.entries(options.screenContent!)) say(d, `content.set(${kotlinString(name)}, ${kotlinString(value)})`);
        emit(c.template.filter((n) => !isBar(n)), d, [], 'content', null);
      });
      say(d, 'page.addChild(content)');
    } else {
      template(d, () => emit(c.template, d, [], 'page', null));
    }
    userEffects();
    result('page');
  } else {
    const roots: string[] = [];
    template(d, () => emit(c.template, d, [], null, roots));
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    userEffects();
    result(roots[0]);
  }
  if (wrap) say(2, '}');
  say(1, '}');
  return lines;
}

/** Whether a template holds an `if` or `for` of its own (not inside a ListView row). */
function hasRegion(nodes: TNode[]): boolean {
  return nodes.some((n) => n.kind === 'if' || n.kind === 'for' || (n.kind === 'element' && n.tag !== 'ListView' && hasRegion(n.children)));
}
