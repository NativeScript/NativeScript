import type { Attr, ComponentIR, TNode } from './ir.ts';
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
  /**
   * Properties of a layout the navigator puts around a routed page's content
   * (react-nativescript-navigation's flexbox), or none.
   */
  screenContent?: Record<string, string>;
}

export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[] }>, options: RenderOptions = {}): string[] {
  const lines: string[] = [];
  let n = 0;
  const say = (depth: number, text: string) => lines.push('    '.repeat(depth) + text);
  // Loop variables in scope, passed to every binding method in order.
  // A ListView row reads its item and index through the row's signals.
  type Loop = { item: string; index: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `this.${ident(method)}(${[...loops.flatMap((l) => [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)]), ...extra].join(', ')})`;

  const attr = (depth: number, v: string, a: Attr, loops: Loop[]) => {
    if ('value' in a) {
      if (a.name === 'class') say(depth, `${v}.className = ${kotlinString(a.value)}`);
      else say(depth, `${v}.set(${kotlinString(a.name)}, ${kotlinString(a.value)})`);
    } else if (a.name === 'class') {
      say(depth, `Effect { jsReport { ${v}.className = ${call(a.method, loops)} } }`);
    } else {
      say(depth, `Effect { jsReport { ${v}.set(${kotlinString(a.name)}, ${call(a.method, loops)}) } }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null) => {
    for (const node of nodes) {
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          say(depth, `val ${v} = Router.shared.outlet()`);
        } else if (node.kind === 'element') {
          say(depth, `val ${v} = ${node.tag}()`);
          const isList = node.tag === 'ListView';
          for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) say(depth, `${v}.on(${kotlinString(e.name)}) { event -> jsReport { ${call(e.method, loops, ['event'])} } }`);
          if (isList) list(node, depth, loops, v);
          else emit(node.children, depth, loops, v, null);
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
            if ('method' in a) say(depth, `Effect { jsReport { ${c0}.${ident(p)}.value = ${call(a.method, loops)} } }`);
          }
          say(depth, `val ${v} = ${c0}.render()`);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.includes(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(e.name)}.on { value -> jsReport { ${call(e.method, loops, [`EventData(${kotlinString(e.name)}, ${v}, value)`])} } }`);
            else say(depth, `${v}.on(${kotlinString(e.name)}) { event -> jsReport { ${call(e.method, loops, ['event'])} } }`);
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
        const which = node.branches.map((b, i) => (b.cond ? `if (${call(b.cond, loops)}) ${i} else ` : `${i}`)).join('') + (node.branches.at(-1)!.cond ? `${node.branches.length}` : '');
        say(depth, `Choose(${region}, { ${which} }) { branch ->`);
        say(depth + 1, 'when (branch) {');
        node.branches.forEach((b, i) => {
          say(depth + 2, `${i} -> {`);
          const made: string[] = [];
          emit(b.body, depth + 3, loops, null, made);
          say(depth + 3, `listOf(${made.join(', ')})`);
          say(depth + 2, '}');
        });
        say(depth + 2, 'else -> listOf()');
        say(depth + 1, '}');
        say(depth, '}');
        continue;
      }
      const inner = [...loops, { item: node.item, index: node.index }];
      // A key may be any value (`:key="i"`); rows are kept by its string form.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} -> jsKey(${call(node.key, inner)}) }` : `{ item, _ -> jsKey(item) }`;
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      say(depth, `For(${region}, { ${call(node.items, loops)}.elements }, ${key}) { ${ident(node.item)}, ${ident(node.index)} ->`);
      const made: string[] = [];
      emit(node.body, depth + 1, inner, null, made);
      say(depth + 1, `listOf(${made.join(', ')})`);
      say(depth, '}');
    }
  };

  /** A ListView's items, selector and templates: one `bind`, whose closure renders a template for a row. */
  const list = (node: Extract<TNode, { kind: 'element' }>, depth: number, loops: Loop[], v: string) => {
    const items = node.attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${c.name}: <ListView> needs bound items`);
    const selector = node.attrs.find((a) => a.name === 'itemTemplateSelector');
    const sel = selector && 'method' in selector ? `, selector = { item, index -> ${call(selector.method, loops, ['item', 'index'])} }` : '';
    const templates = node.children.filter((t): t is Extract<TNode, { kind: 'template' }> => t.kind === 'template');
    if (!templates.length) { say(depth, `${v}.bind(items = { ${call(items.method, loops)}.elements }${sel})`); return; }
    const row = `row${n++}`;
    const fallback = templates.find((t) => t.key === 'default') ?? templates[0];
    say(depth, `${v}.bind(items = { ${call(items.method, loops)}.elements }, templates = listOf(${templates.map((t) => kotlinString(t.key)).join(', ')})${sel}) { key, ${row} ->`);
    say(depth + 1, 'when (key) {');
    for (const t of [...templates.filter((t) => t !== fallback), fallback]) {
      say(depth + 2, `${t === fallback ? 'else' : kotlinString(t.key)} -> {`);
      const made: string[] = [];
      emit(t.body, depth + 3, [...loops, { item: t.item, index: t.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }], null, made);
      if (made.length !== 1) throw new Error(`${c.name}: a ListView template needs exactly one root element`);
      say(depth + 3, made[0]);
      say(depth + 2, '}');
    }
    say(depth + 1, '}');
    say(depth, '}');
  };

  say(1, 'fun render(): View {');
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(2, 'val page = Page()');
    if (options.screenContent) {
      const isBar = (n: TNode) => n.kind === 'element' && n.tag === 'ActionBar';
      emit(c.template.filter(isBar), 2, [], 'page', null);
      say(2, 'val content = FlexboxLayout()');
      for (const [name, value] of Object.entries(options.screenContent)) say(2, `content.set(${kotlinString(name)}, ${kotlinString(value)})`);
      emit(c.template.filter((n) => !isBar(n)), 2, [], 'content', null);
      say(2, 'page.addChild(content)');
    } else {
      emit(c.template, 2, [], 'page', null);
    }
    say(2, 'return page');
  } else {
    const roots: string[] = [];
    emit(c.template, 2, [], null, roots);
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    say(2, `return ${roots[0]}`);
  }
  say(1, '}');
  return lines;
}
