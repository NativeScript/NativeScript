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
export interface RenderOptions {
  /** Children join their parent as Octane's NativeScript driver attaches them: a child naming a slot (`hostSlot`) the parent has is set as that property. */
  slots?: boolean;
  /** A kept row renders the item now at its key (immutable updates, as React and Octane re-render): its item and index are signals. */
  rowSignals?: boolean;
}

export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[]; optional?: string[]; passed?: boolean }>, throws: (method: string) => boolean = () => false, framework: Framework = 'octane', options: RenderOptions = {}): string[] {
  const lines: string[] = [];
  // The order each framework applies bindings in (EffectOrder): Vue, Svelte and
  // React set an element's props after its children's; Solid and Angular apply
  // a template's bindings together, in tree order, after its views are built.
  // And the order views join the live tree: Angular appends each as it is
  // created and Svelte mounts a block's views top-down once they are all made,
  // so a child joins a parent that is already loaded; the others attach a
  // finished subtree.
  const postOrder = framework === 'vue' || framework === 'svelte' || framework === 'react';
  const deferBindings = framework === 'solid' || framework === 'angular';
  const insertion = framework === 'angular' ? 'created' : framework === 'svelte' ? 'mounted' : 'built';
  type Line = { depth: number; text: string };
  const templates: { bindings: Line[]; inserts: Line[] }[] = [];
  /** A template's views and structure, then its deferred inserts and bindings. */
  const template = (depth: number, body: () => void) => {
    templates.push({ bindings: [], inserts: [] });
    body();
    const t = templates.pop()!;
    for (const d of [...t.inserts, ...t.bindings]) say(d.depth, d.text);
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

  // A condition that throws is reported and counts as false; mounted templates take any value as a condition (`{detail && <Label/>}`), as JSX does.
  const cond = (m: string, loops: Loop[]) => options.slots
    ? `jsTruthy(${throws(m) ? `(try? ${call(m, loops).replace(/^try /, '')})` : call(m, loops)})`
    : throws(m) ? `((try? ${call(m, loops).replace(/^try /, '')}) ?? false)` : call(m, loops);
  const binding = (depth: number, text: string) => (deferBindings && templates.length ? templates.at(-1)!.bindings.push({ depth, text }) : say(depth, text));
  /** Puts a view into its container or region at the point its framework inserts it. */
  const attach = (depth: number, v: string, parent: string | null, region: string | null, at: 'created' | 'built') => {
    const text = parent ? (options.slots ? `${parent}.addTemplateChild(${v})` : `${parent}.addChild(${v})`) : region ? `${region}.attach(${v})` : null;
    if (!text) return;
    if (insertion === 'mounted' && templates.length) { if (at === 'created') templates.at(-1)!.inserts.push({ depth, text }); return; }
    if ((insertion === 'created') === (at === 'created')) say(depth, text);
  };
  const attr = (depth: number, v: string, a: Attr, loops: Loop[]) => {
    if (a.ifPassed) {
      say(depth, `if self._passed.contains(${swiftString(a.ifPassed)}) {`);
      attr(depth + 1, v, { ...a, ifPassed: undefined }, loops);
      say(depth, '}');
      return;
    }
    if ('value' in a) {
      if (a.name === 'class') say(depth, `${v}.className = ${swiftString(a.value)}`);
      else say(depth, `${v}.set(${swiftString(a.name)}, ${swiftString(a.value)})`);
    } else if (a.name === 'class') {
      const value = options.slots ? `octaneClassName(${call(a.method, loops)})` : call(a.method, loops);
      binding(depth, `Effect { ${reported(a.method, `${v}.className = ${value}`)} }`);
    } else {
      binding(depth, `Effect { ${reported(a.method, `${v}.set(${swiftString(a.name)}, ${call(a.method, loops)})`)} }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null, region: string | null = null) => {
    for (const node of nodes) {
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          say(depth, `let ${v} = Router.shared.outlet()`);
          attach(depth, v, parent, region, 'created');
        } else if (node.kind === 'element') {
          say(depth, `let ${v} = ${node.tag}()`);
          if (node.ref) say(depth, `${call(node.ref, loops)}.current = ${v}`);
          const isList = node.tag === 'ListView';
          const props = () => {
            for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
            for (const e of node.events) {
              const listen = `${v}.on(${swiftString(e.name)}) { event in ${reported(e.method, call(e.method, loops, ['event']))} }`;
              const guarded = e.when ? `if jsTruthy(${throws(e.when) ? `(try? ${call(e.when, loops).replace(/^try /, '')})` : call(e.when, loops)}) { ${listen} }` : listen;
              say(depth, e.ifPassed ? `if self._passed.contains(${swiftString(e.ifPassed)}) { ${guarded} }` : guarded);
            }
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
          const args = info.props.flatMap((p) => {
            const a = given.get(p);
            if (!a && info.optional?.includes(p)) return [];
            if (!a) throw new Error(`${c.name}: <${node.name}> needs the prop "${p}"`);
            // A prop's first value must exist: what its binding throws stops the app, as an error rendering a component does.
            return [`${ident(p)}: ${'value' in a ? swiftString(a.value) : `untrack { ${throws(a.method) ? call(a.method, loops).replace(/^try /, 'try! ') : call(a.method, loops)} }`}`];
          });
          if (info.passed) args.push(`_passed: [${node.props.map((a) => swiftString(a.name)).concat(node.events.map((e) => swiftString('on' + e.name[0].toUpperCase() + e.name.slice(1)))).join(', ')}]`);
          say(depth, `let ${c0} = ${node.name}(${args.join(', ')})`);
          for (const p of info.props) {
            const a = given.get(p);
            if (a && 'method' in a) say(depth, `Effect { ${reported(a.method, `${c0}.${ident(p)}.value = ${call(a.method, loops)}`)} }`);
          }
          say(depth, `let ${v} = ${c0}.render()`);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.includes(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(e.name)}.on { value in ${reported(e.method, call(e.method, loops, [`EventData(eventName: ${swiftString(e.name)}, object: ${v}, value: value)`]))} }`);
            else say(depth, `${v}.on(${swiftString(e.name)}) { event in ${reported(e.method, call(e.method, loops, ['event']))} }`);
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
        say(depth, `let ${live} = Region(host: nil)`);
        templates.at(-1)!.inserts.push({ depth, text: `${parent}.addRegion(${live})` });
      } else if (live) say(depth, `let ${live} = ${parent}.addRegion()`);
      // A branch or row with an if/for of its own (where views attach once built) returns a fragment holding the regions nested in this one.
      const nested = (body: TNode[]) => body.some((x) => x.kind === 'if' || x.kind === 'for');
      const fragmented = !live && (node.kind === 'if' ? node.branches.some((b) => nested(b.body)) : nested(node.body));
      let host = live ?? `${parent}.addRegion()`;
      if (fragmented) {
        const r = `r${n++}`;
        say(depth, `let ${r} = ${host}`);
        host = r;
      }
      /** A fragmented branch or row body: its views and nested regions. */
      const fragment = (nodes: TNode[], d: number, ls: Loop[]) => {
        const f = `f${n++}`;
        say(d, `let ${f} = RegionFragment(${host})`);
        template(d, () => emit(nodes, d, ls, f, null));
        say(d, `return ${f}`);
      };
      if (node.kind === 'if' && fragmented) {
        const which = node.branches.map((b, i) => (b.cond ? `${cond(b.cond, loops)} ? ${i} : ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `ChooseFragment(${host}, { ${which} }) { branch in`);
        say(depth + 1, 'switch branch {');
        node.branches.forEach((b, i) => {
          say(depth + 1, `case ${i}:`);
          fragment(b.body, depth + 2, loops);
        });
        say(depth + 1, `default: return RegionFragment(${host})`);
        say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      if (node.kind === 'if') {
        if (!options.slots && node.branches.some((b) => b.cond && throws(b.cond))) throw new Error(`${c.name}: an if condition in the template can throw`);
        const which = node.branches.map((b, i) => (b.cond ? `${cond(b.cond, loops)} ? ${i} : ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `Choose(${host}, { ${which} }) { branch in`);
        const wrap = scoped('region', '[View]');
        const d = wrap ? depth + 1 : depth;
        if (wrap) say(depth + 1, wrap);
        if (framework === 'angular' && node.branches.some((b) => hasRegion(b.body))) say(d + 1, 'let __view = EffectOrder.current');
        say(d + 1, 'switch branch {');
        node.branches.forEach((b, i) => {
          say(d + 1, `case ${i}:`);
          const made: string[] = [];
          template(d + 2, () => emit(b.body, d + 2, loops, null, made, live));
          say(d + 2, `return [${made.join(', ')}]`);
        });
        say(d + 1, 'default: return []');
        say(d + 1, '}');
        if (wrap) say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      if (options.rowSignals) {
        const row = `row${n++}`;
        const rowLoops = [...loops, { item: node.item, index: node.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }];
        const keyLoops = [...loops, { item: node.item, index: node.index }];
        // What a list's items or keys throw is reported, the list then rendering nothing.
        const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${throws(node.key) ? `(try? ${call(node.key, keyLoops).replace(/^try /, '')}) as Any?` : call(node.key, keyLoops)}) }` : `{ item, _ in jsKey(item) }`;
        // `{list?.map(…)}`: an absent list renders no rows.
        const items = throws(node.items) ? `{ (try? ${call(node.items, loops).replace(/^try /, '')}).map { octaneItems($0) } ?? [] }` : `{ octaneItems(${call(node.items, loops)}) }`;
        say(depth, `${fragmented ? 'ForEachFragment' : 'ForEach'}(${host}, ${items}, key: ${key}) { ${row} in`);
        if (fragmented) fragment(node.body, depth + 1, rowLoops);
        else {
          const made: string[] = [];
          template(depth + 1, () => emit(node.body, depth + 1, rowLoops, null, made, live));
          say(depth + 1, `return [${made.join(', ')}]`);
        }
        say(depth, '}');
        continue;
      }
      const inner = [...loops, { item: node.item, index: node.index }];
      // A key may be any value (`:key="i"`); rows are kept by its string form.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${call(node.key, inner)}) }` : `{ item, _ in jsKey(item) }`;
      if (throws(node.items) || (node.key && throws(node.key))) throw new Error(`${c.name}: a for in the template can throw`);
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      if (fragmented) {
        say(depth, `ForFragment(${host}, { Array(${call(node.items, loops)}) }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
        fragment(node.body, depth + 1, inner);
        say(depth, '}');
        continue;
      }
      say(depth, `For(${host}, { Array(${call(node.items, loops)}) }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
      const wrap = scoped('region', '[View]');
      const d = wrap ? depth + 1 : depth;
      if (wrap) say(depth + 1, wrap);
      if (framework === 'angular' && hasRegion(node.body)) say(d + 1, 'let __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(node.body, d + 1, inner, null, made, live));
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
    // Effects run once the component's views exist, as a renderer runs them after its commit.
    for (const e of c.effects ?? []) say(d, `ComponentEffect(layout: ${e.layout}, deps: ${e.deps ? `{ ${call(e.deps, [])}.storage }` : 'nil'}) { ${throws(e.run) ? 'try ' : ''}self.${ident(e.run)}() }`);
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
