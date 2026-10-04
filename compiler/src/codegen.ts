import type { Attr, ComponentIR, TNode } from './ir.ts';
import { ident, swiftString } from './swift.ts';

export type Framework = 'vue' | 'angular' | 'svelte' | 'react' | 'solid' | 'octane';

/** ListView attributes that `bind` takes rather than `set`. */
const LIST_BINDINGS = new Set(['items', 'itemTemplateSelector']);

/**
 * A component's template as a Swift `render()`: views are created once,
 * each binding is one effect that sets one property, and each `if`/`for`
 * owns a region of its container. Nothing is diffed at run time.
 */
export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[] }>, throws: (method: string) => boolean = () => false, framework: Framework = 'octane'): string[] {
  const lines: string[] = [];
  // The order each framework applies bindings in (EffectOrder): Vue, Svelte and
  // React set an element's props after its children's; Solid applies a
  // template's bindings together, in tree order, after the template's
  // components and control flow are built.
  const postOrder = framework === 'vue' || framework === 'svelte' || framework === 'react';
  const deferred: { depth: number; text: string }[][] = [];
  /** A template's views and structure, then (Solid) its bindings, then its result. */
  const template = (depth: number, body: () => void) => {
    if (framework === 'solid') deferred.push([]);
    body();
    if (framework === 'solid') for (const d of deferred.pop()!) say(d.depth, d.text);
  };
  /** A closure that renders content in the scope its framework orders it in. */
  const scoped = (kind: 'template' | 'region', result: string) => {
    if (framework === 'vue' || framework === 'svelte') return kind === 'template' ? `EffectOrder.component { () -> ${result} in` : null;
    if (framework === 'angular') return kind === 'template' ? `EffectOrder.view { () -> ${result} in` : `EffectOrder.embedded(in: __view) { () -> ${result} in`;
    if (framework === 'solid') return kind === 'template' ? `EffectOrder.solid { () -> ${result} in` : `EffectOrder.deeper { () -> ${result} in`;
    return null;
  };
  let n = 0;
  const say = (depth: number, text: string) => lines.push('    '.repeat(depth) + text);
  // Loop variables in scope, passed to every binding method in order.
  // A ListView row reads its item and index through the row's signals.
  type Loop = { item: string; index: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `${throws(method) ? 'try ' : ''}self.${ident(method)}(${[...loops.flatMap((l) => [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)]), ...extra].join(', ')})`;
  // What a binding or handler throws is reported, as the frameworks report errors in templates.
  const reported = (method: string, code: string) => (throws(method) ? `jsReport { ${code} }` : code);

  const binding = (depth: number, text: string) => (deferred.length ? deferred.at(-1)!.push({ depth, text }) : say(depth, text));
  const attr = (depth: number, v: string, a: Attr, loops: Loop[]) => {
    if ('value' in a) {
      if (a.name === 'class') say(depth, `${v}.className = ${swiftString(a.value)}`);
      else say(depth, `${v}.set(${swiftString(a.name)}, ${swiftString(a.value)})`);
    } else if (a.name === 'class') {
      binding(depth, `Effect { ${reported(a.method, `${v}.className = ${call(a.method, loops)}`)} }`);
    } else {
      binding(depth, `Effect { ${reported(a.method, `${v}.set(${swiftString(a.name)}, ${call(a.method, loops)})`)} }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null) => {
    for (const node of nodes) {
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          say(depth, `let ${v} = Router.shared.outlet()`);
        } else if (node.kind === 'element') {
          say(depth, `let ${v} = ${node.tag}()`);
          const isList = node.tag === 'ListView';
          const props = () => {
            for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
            for (const e of node.events) say(depth, `${v}.on(${swiftString(e.name)}) { event in ${reported(e.method, call(e.method, loops, ['event']))} }`);
          };
          if (isList || !postOrder) props();
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
            if ('method' in a && throws(a.method)) throw new Error(`${c.name}: the binding for <${node.name}>'s prop "${p}" can throw`);
            return `${ident(p)}: ${'value' in a ? swiftString(a.value) : `untrack { ${call(a.method, loops)} }`}`;
          });
          say(depth, `let ${c0} = ${node.name}(${args.join(', ')})`);
          for (const p of info.props) {
            const a = given.get(p)!;
            if ('method' in a) say(depth, `Effect { ${c0}.${ident(p)}.value = ${call(a.method, loops)} }`);
          }
          say(depth, `let ${v} = ${c0}.render()`);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.includes(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(e.name)}.on { value in ${reported(e.method, call(e.method, loops, [`EventData(eventName: ${swiftString(e.name)}, object: ${v}, value: value)`]))} }`);
            else say(depth, `${v}.on(${swiftString(e.name)}) { event in ${reported(e.method, call(e.method, loops, ['event']))} }`);
          }
        }
        if (parent) say(depth, `${parent}.addChild(${v})`);
        collect?.push(v);
        continue;
      }
      if (node.kind === 'template') throw new Error(`${c.name}: an item template outside a ListView`);
      const region = parent ? `${parent}.addRegion()` : null;
      if (!region) throw new Error(`${c.name}: an if/for at the root of a template`);
      if (node.kind === 'if') {
        if (node.branches.some((b) => b.cond && throws(b.cond))) throw new Error(`${c.name}: an if condition in the template can throw`);
        const which = node.branches.map((b, i) => (b.cond ? `${call(b.cond, loops)} ? ${i} : ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `Choose(${region}, { ${which} }) { branch in`);
        const wrap = scoped('region', '[View]');
        const d = wrap ? depth + 1 : depth;
        if (wrap) say(depth + 1, wrap);
        if (framework === 'angular' && node.branches.some((b) => hasRegion(b.body))) say(d + 1, 'let __view = EffectOrder.current');
        say(d + 1, 'switch branch {');
        node.branches.forEach((b, i) => {
          say(d + 1, `case ${i}:`);
          const made: string[] = [];
          template(d + 2, () => emit(b.body, d + 2, loops, null, made));
          say(d + 2, `return [${made.join(', ')}]`);
        });
        say(d + 1, 'default: return []');
        say(d + 1, '}');
        if (wrap) say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      const inner = [...loops, { item: node.item, index: node.index }];
      // A key may be any value (`:key="i"`); rows are kept by its string form.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${call(node.key, inner)}) }` : `{ item, _ in jsKey(item) }`;
      if (throws(node.items) || (node.key && throws(node.key))) throw new Error(`${c.name}: a for in the template can throw`);
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      say(depth, `For(${region}, { Array(${call(node.items, loops)}) }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
      const wrap = scoped('region', '[View]');
      const d = wrap ? depth + 1 : depth;
      if (wrap) say(depth + 1, wrap);
      if (framework === 'angular' && hasRegion(node.body)) say(d + 1, 'let __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(node.body, d + 1, inner, null, made));
      say(d + 1, `return [${made.join(', ')}]`);
      if (wrap) say(depth + 1, '}');
      say(depth, '}');
    }
  };

  /** A ListView's items, selector and templates: one `bind`, whose closure renders a template for a row. */
  const list = (node: Extract<TNode, { kind: 'element' }>, depth: number, loops: Loop[], v: string) => {
    const items = node.attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${c.name}: <ListView> needs bound items`);
    const selector = node.attrs.find((a) => a.name === 'itemTemplateSelector');
    const sel = selector && 'method' in selector ? `, selector: { item, index in ${call(selector.method, loops, ['item', 'index'])} }` : '';
    const templates = node.children.filter((t): t is Extract<TNode, { kind: 'template' }> => t.kind === 'template');
    if (!templates.length) { say(depth, `${v}.bind(items: { Array(${call(items.method, loops)}) }${sel})`); return; }
    const row = `row${n++}`;
    const fallback = templates.find((t) => t.key === 'default') ?? templates[0];
    say(depth, `${v}.bind(items: { Array(${call(items.method, loops)}) }, templates: [${templates.map((t) => swiftString(t.key)).join(', ')}]${sel}) { key, ${row} in`);
    say(depth + 1, 'switch key {');
    for (const t of [...templates.filter((t) => t !== fallback), fallback]) {
      say(depth + 1, t === fallback ? 'default:' : `case ${swiftString(t.key)}:`);
      const wrap = scoped('template', 'View');
      const d = wrap ? depth + 2 : depth + 1;
      if (wrap) say(depth + 2, `return ${wrap}`);
      if (framework === 'angular' && hasRegion(t.body)) say(d + 1, 'let __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(t.body, d + 1, [...loops, { item: t.item, index: t.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }], null, made));
      if (made.length !== 1) throw new Error(`${c.name}: a ListView template needs exactly one root element`);
      say(d + 1, `return ${made[0]}`);
      if (wrap) say(depth + 2, '}');
    }
    say(depth + 1, '}');
    say(depth, '}');
  };

  say(1, 'func render() -> View {');
  const wrap = scoped('template', 'View');
  const d = wrap ? 3 : 2;
  if (wrap) say(2, `return ${wrap}`);
  if (framework === 'angular' && hasRegion(c.template)) say(d, 'let __view = EffectOrder.current');
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(d, 'let page = Page()');
    template(d, () => emit(c.template, d, [], 'page', null));
    say(d, 'return page');
  } else {
    const roots: string[] = [];
    template(d, () => emit(c.template, d, [], null, roots));
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    say(d, `return ${roots[0]}`);
  }
  if (wrap) say(2, '}');
  say(1, '}');
  return lines;
}

/** Whether a template holds an `if` or `for` of its own (not inside a ListView row). */
function hasRegion(nodes: TNode[]): boolean {
  return nodes.some((n) => n.kind === 'if' || n.kind === 'for' || (n.kind === 'element' && n.tag !== 'ListView' && hasRegion(n.children)));
}
