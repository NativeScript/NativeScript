import type { Attr, ComponentIR, TNode } from './ir.ts';
import { ident, swiftString } from './swift.ts';

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

export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[]; optional?: string[]; passed?: boolean }>, throws: (method: string) => boolean = () => false, options: RenderOptions = {}): string[] {
  const lines: string[] = [];
  let n = 0;
  const say = (depth: number, text: string) => lines.push('    '.repeat(depth) + text);
  // Loop variables in scope, passed to every binding method in order.
  // A ListView row reads its item and index through the row's signals.
  type Loop = { item: string; index: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `${throws(method) ? 'try ' : ''}self.${ident(method)}(${[...loops.flatMap((l) => [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)]), ...extra].join(', ')})`;
  // What a binding or handler throws is reported, as the frameworks report errors in templates.
  const reported = (method: string, code: string) => (throws(method) ? `jsReport { ${code} }` : code);

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
      say(depth, `Effect { ${reported(a.method, `${v}.className = ${value}`)} }`);
    } else {
      say(depth, `Effect { ${reported(a.method, `${v}.set(${swiftString(a.name)}, ${call(a.method, loops)})`)} }`);
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
          if (node.ref) say(depth, `${call(node.ref, loops)}.current = ${v}`);
          const isList = node.tag === 'ListView';
          for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            const listen = `${v}.on(${swiftString(e.name)}) { event in ${reported(e.method, call(e.method, loops, ['event']))} }`;
            const guarded = e.when ? `if jsTruthy(${throws(e.when) ? `(try? ${call(e.when, loops).replace(/^try /, '')})` : call(e.when, loops)}) { ${listen} }` : listen;
            say(depth, e.ifPassed ? `if self._passed.contains(${swiftString(e.ifPassed)}) { ${guarded} }` : guarded);
          }
          if (isList) list(node, depth, loops, v);
          else emit(node.children, depth, loops, v, null);
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
        }
        if (parent) say(depth, options.slots ? `${parent}.addTemplateChild(${v})` : `${parent}.addChild(${v})`);
        collect?.push(v);
        continue;
      }
      if (node.kind === 'template') throw new Error(`${c.name}: an item template outside a ListView`);
      if (!parent) throw new Error(`${c.name}: an if/for at the root of a template`);
      // A branch or row with an if/for of its own returns a fragment holding the regions nested in this one.
      const nested = (body: TNode[]) => body.some((x) => x.kind === 'if' || x.kind === 'for');
      const fragmented = node.kind === 'if' ? node.branches.some((b) => nested(b.body)) : nested(node.body);
      let region = `${parent}.addRegion()`;
      if (fragmented) {
        const r = `r${n++}`;
        say(depth, `let ${r} = ${region}`);
        region = r;
      }
      /** A branch or row body: its views, or a fragment of views and nested regions. */
      const body = (nodes: TNode[], d: number, ls: Loop[]) => {
        if (!fragmented) {
          const made: string[] = [];
          emit(nodes, d, ls, null, made);
          say(d, `return [${made.join(', ')}]`);
          return;
        }
        const f = `f${n++}`;
        say(d, `let ${f} = RegionFragment(${region})`);
        emit(nodes, d, ls, f, null);
        say(d, `return ${f}`);
      };
      if (node.kind === 'if') {
        // A condition that throws is reported and counts as false.
        // Mounted templates take any value as a condition (`{detail && <Label/>}`), as JSX does.
        const cond = (m: string) => options.slots
          ? `jsTruthy(${throws(m) ? `(try? ${call(m, loops).replace(/^try /, '')})` : call(m, loops)})`
          : throws(m) ? `((try? ${call(m, loops).replace(/^try /, '')}) ?? false)` : call(m, loops);
        const which = node.branches.map((b, i) => (b.cond ? `${cond(b.cond)} ? ${i} : ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `${fragmented ? 'ChooseFragment' : 'Choose'}(${region}, { ${which} }) { branch in`);
        say(depth + 1, 'switch branch {');
        node.branches.forEach((b, i) => {
          say(depth + 1, `case ${i}:`);
          body(b.body, depth + 2, loops);
        });
        say(depth + 1, fragmented ? `default: return RegionFragment(${region})` : 'default: return []');
        say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      if (options.rowSignals) {
        const row = `row${n++}`;
        const inner = [...loops, { item: node.item, index: node.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }];
        // What a list's items or keys throw is reported, the list then rendering nothing.
        const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${throws(node.key) ? `(try? ${call(node.key, [...loops, { item: node.item, index: node.index }]).replace(/^try /, '')}) as Any?` : call(node.key, [...loops, { item: node.item, index: node.index }])}) }` : `{ item, _ in jsKey(item) }`;
        // `{list?.map(…)}`: an absent list renders no rows.
        const items = throws(node.items) ? `{ (try? ${call(node.items, loops).replace(/^try /, '')}).map { octaneItems($0) } ?? [] }` : `{ octaneItems(${call(node.items, loops)}) }`;
        say(depth, `${fragmented ? 'ForEachFragment' : 'ForEach'}(${region}, ${items}, key: ${key}) { ${row} in`);
        body(node.body, depth + 1, inner);
        say(depth, '}');
        continue;
      }
      const inner = [...loops, { item: node.item, index: node.index }];
      // A key may be any value (`:key="i"`); rows are kept by its string form.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${call(node.key, inner)}) }` : `{ item, _ in jsKey(item) }`;
      if (throws(node.items) || (node.key && throws(node.key))) throw new Error(`${c.name}: a for in the template can throw`);
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      say(depth, `For(${region}, { Array(${call(node.items, loops)}) }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
      body(node.body, depth + 1, inner);
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
      const made: string[] = [];
      emit(t.body, depth + 2, [...loops, { item: t.item, index: t.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }], null, made);
      if (made.length !== 1) throw new Error(`${c.name}: a ListView template needs exactly one root element`);
      say(depth + 2, `return ${made[0]}`);
    }
    say(depth + 1, '}');
    say(depth, '}');
  };

  say(1, 'func render() -> View {');
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(2, 'let page = Page()');
    emit(c.template, 2, [], 'page', null);
    say(2, 'return page');
  } else {
    const roots: string[] = [];
    emit(c.template, 2, [], null, roots);
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    // Effects run once the component's views exist, as a renderer runs them after its commit.
    for (const e of c.effects ?? []) say(2, `ComponentEffect(layout: ${e.layout}, deps: ${e.deps ? `{ ${call(e.deps, [])}.storage }` : 'nil'}) { ${throws(e.run) ? 'try ' : ''}self.${ident(e.run)}() }`);
    say(2, `return ${roots[0]}`);
  }
  say(1, '}');
  return lines;
}
