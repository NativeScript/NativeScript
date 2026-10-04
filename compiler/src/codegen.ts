import type { Attr, ComponentIR, TNode } from './ir.ts';
import { ident, swiftString } from './swift.ts';

export type Framework = 'vue' | 'angular' | 'svelte' | 'svelte5' | 'react' | 'solid' | 'octane';

/** When each framework applies the updates a write causes (`Reactivity.Schedule`). */
export const SCHEDULE: Record<Framework, 'now' | 'microtask' | 'task' | 'event'> = { vue: 'microtask', svelte: 'microtask', svelte5: 'microtask', solid: 'microtask', angular: 'task', react: 'now', octane: 'event' };

/** Frameworks that do something around each template handler (`Reactivity.event`). */
export const EVENT_SCOPED = new Set<string>(['angular', 'react', 'octane']);

/** Views whose children are item templates, rendered through one `bind`: core's ListView and the kit's Pager. */
const TEMPLATE_HOSTS = new Set(['ListView', 'Pager']);

/** Item-template host attributes that `bind` takes rather than `set`. */
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
  /** Angular with zone.js: every binding is checked on each tick and applied when its value changed. */
  zone?: boolean;
  /** The element type of a binding method returning a loop's items, which spares Swift inferring it through the loop's closures. */
  itemType?: (method: string) => string | null;
}

export function render(c: ComponentIR, components: Map<string, { props: string[]; outputs?: string[]; outputFields?: Record<string, string>; optional?: string[]; passed?: boolean; fragment?: boolean; initThrows?: boolean }>, throws: (method: string) => boolean = () => false, framework: Framework = 'octane', options: RenderOptions = {}): string[] {
  const lines: string[] = [];
  // The order each framework applies bindings in (EffectOrder): Vue, Svelte and
  // React set an element's props after its children's; Solid and Angular apply
  // a template's bindings together, in tree order, after its views are built.
  // And the order views join the live tree: Angular appends each as it is
  // created and Svelte mounts a block's views top-down once they are all made,
  // so a child joins a parent that is already loaded; the others attach a
  // finished subtree. Svelte 5 sets a template's static attributes as it makes
  // its views and the rest in one effect after its blocks and components, and
  // updates in effect-tree order: creation order, nested.
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
  // An item template's row reads its item and index through the row's signals.
  type Loop = { item: string; index: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `${throws(method) ? 'try ' : ''}self.${ident(method)}(${[...loops.flatMap((l) => [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)]), ...extra].join(', ')})`;
  // What a binding or handler throws is reported, as the frameworks report errors in templates.
  const reported = (method: string, code: string) => (throws(method) ? `jsReport { ${code} }` : code);
  const handler = (method: string, code: string) => (EVENT_SCOPED.has(framework) ? `Reactivity.event { ${reported(method, code)} }` : reported(method, code));

  const checked = (m: string, loops: Loop[]) => {
    if (throws(m)) throw new Error(`${c.name}: a binding that can throw, in an app checked by zone.js, is not supported in a release build yet`);
    return call(m, loops);
  };
  // A condition that throws is reported and counts as false; mounted templates take any value as a condition (`{detail && <Label/>}`), as JSX does.
  const cond = (m: string, loops: Loop[]) => options.slots
    ? `jsTruthy(${throws(m) ? `(try? ${call(m, loops).replace(/^try /, '')})` : call(m, loops)})`
    : throws(m) ? `jsTruthy(try? ${call(m, loops).replace(/^try /, '')})` : `jsTruthy(${call(m, loops)})`;
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
    } else if (options.zone) {
      binding(depth, `Check({ ${checked(a.method, loops)} }) { ${a.name === 'class' ? `${v}.className = $0` : `${v}.set(${swiftString(a.name)}, $0)`} }`);
    } else if (a.name === 'class') {
      const value = options.slots ? `octaneClassName(${call(a.method, loops)})` : call(a.method, loops);
      binding(depth, `Effect { ${reported(a.method, `${v}.className = ${value}`)} }`);
    } else {
      binding(depth, `Effect { ${reported(a.method, `${v}.set(${swiftString(a.name)}, ${options.slots ? `octaneValue(${call(a.method, loops)})` : call(a.method, loops)})`)} }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null, region: string | null = null) => {
    for (const node of nodes) {
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          const name = node.attrs.find((a) => a.name === 'router');
          say(depth, `let ${v} = Router.shared.outlet(${name && 'value' in name && name.value !== 'true' ? swiftString(name.value) : ''})`);
          attach(depth, v, parent, region, 'created');
        } else if (node.kind === 'element') {
          say(depth, `let ${v} = ${node.tag}()`);
          if (node.ref) say(depth, `${call(node.ref, loops)}.current = ${v}`);
          const isList = TEMPLATE_HOSTS.has(node.tag);
          const props = () => {
            for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
            for (const e of node.events) {
              const listen = `${v}.on(${swiftString(e.name)}) { event in ${handler(e.method, call(e.method, loops, ['event']))} }`;
              const guarded = e.when ? `if jsTruthy(${throws(e.when) ? `(try? ${call(e.when, loops).replace(/^try /, '')})` : call(e.when, loops)}) { ${listen} }` : listen;
              listener(depth, e.ifPassed ? `if self._passed.contains(${swiftString(e.ifPassed)}) { ${guarded} }` : guarded);
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
          // A constructor whose field initializers can throw (as the translator's analysis sees them) stops the app if one does.
          say(depth, `let ${c0} = ${info.initThrows ? 'try! ' : ''}${node.name}(${args.join(', ')})`);
          if (info.fragment) {
            // A component whose template is not one element: its views join the parent where its host is, as a ProxyViewContainer's do.
            if (!parent) throw new Error(`${c.name}: <${node.name}>, whose template has no single root element, at the root of a template`);
            for (const p of info.props) {
              const a = given.get(p);
              if (a && 'method' in a) say(depth, `Effect { ${reported(a.method, `${c0}.${ident(p)}.value = ${call(a.method, loops)}`)} }`);
            }
            for (const e of node.events) {
              if (!info.outputs?.includes(e.name)) throw new Error(`${c.name}: <${node.name}> takes no ${e.name} event: its template has no single root view`);
              say(depth, `${c0}.${ident(info.outputFields?.[e.name] ?? e.name)}.on { value in ${handler(e.method, call(e.method, loops, [e.payload ? 'value' : `EventData(eventName: ${swiftString(e.name)}, object: nil, value: value)`]))} }`);
            }
            say(depth, `${c0}.render(into: ${parent}.addRegion())`);
            continue;
          }
          for (const p of info.props) {
            const a = given.get(p);
            if (a && 'method' in a) say(depth, options.zone ? `Check({ ${checked(a.method, loops)} }) { ${c0}.${ident(p)}.value = $0 }` : `Effect { ${reported(a.method, `${c0}.${ident(p)}.value = ${call(a.method, loops)}`)} }`);
          }
          say(depth, `let ${v} = ${c0}.render()`);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.includes(a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(info.outputFields?.[e.name] ?? e.name)}.on { value in ${handler(e.method, call(e.method, loops, [e.payload ? 'value' : `EventData(eventName: ${swiftString(e.name)}, object: ${v}, value: value)`]))} }`);
            else say(depth, `${v}.on(${swiftString(e.name)}) { event in ${handler(e.method, call(e.method, loops, ['event']))} }`);
          }
          attach(depth, v, parent, region, 'created');
        }
        attach(depth, v, parent, region, 'built');
        collect?.push(v);
        continue;
      }
      if (node.kind === 'template') throw new Error(`${c.name}: an item template outside a ListView or Pager`);
      if (!parent) throw new Error(`${c.name}: an if/for at the root of a template`);
      // A component whose views join its parent (no single root) is a region of the body it is in.
      const nested = (body: TNode[]) => body.some((x) => x.kind === 'if' || x.kind === 'for' || (x.kind === 'component' && !!components.get(x.name)?.fragment));
      const nestedBody = node.kind === 'if' ? node.branches.some((b) => nested(b.body)) : nested(node.body);
      // A framework that inserts top-down puts a branch's views in place as it builds them; a body with regions of its own attaches as a fragment.
      const live = insertion !== 'built' && !nestedBody ? `r${n++}` : null;
      if (live && insertion === 'mounted' && templates.length) {
        say(depth, `let ${live} = Region(host: nil)`);
        templates.at(-1)!.inserts.push({ depth, text: `${parent}.addRegion(${live})` });
      } else if (live) say(depth, `let ${live} = ${parent}.addRegion()`);
      // A branch or row with an if/for of its own (where views attach once built) returns a fragment holding the regions nested in this one.
      const fragmented = !live && nestedBody;
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
      // What a template expression throws is reported, as Angular's error handler reports it, and renders nothing.
      const key = node.key ? `{ ${ident(node.item)}, ${ident(node.index)} in jsKey(${throws(node.key) ? `jsReported { ${call(node.key, inner)} } ?? nil` : call(node.key, inner)}) }` : `{ item, _ in jsKey(item) }`;
      const element = options.itemType?.(node.items);
      // Untyped items (`Any?`) are iterated as JavaScript iterates them.
      const read = element === 'Any?' ? `jsReportedItems { try jsItemsOf(${call(node.items, loops).replace(/^try /, '')}) }` : null;
      const items = (element ? `() -> [${element}] in ` : '') + (read ?? (throws(node.items) ? `jsReportedItems { ${call(node.items, loops)} }` : `Array(${call(node.items, loops)})`));
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      if (fragmented) {
        say(depth, `ForFragment(${host}, { ${items} }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
        fragment(node.body, depth + 1, inner);
        say(depth, '}');
        continue;
      }
      say(depth, `For(${host}, { ${items} }, key: ${key}) { ${ident(node.item)}, ${ident(node.index)} in`);
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

  /** An item-template host's items, selector and templates: one `bind`, whose closure renders a template for a row. */
  const list = (node: Extract<TNode, { kind: 'element' }>, depth: number, loops: Loop[], v: string) => {
    const items = node.attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${c.name}: <${node.tag}> needs bound items`);
    const selector = node.attrs.find((a) => a.name === 'itemTemplateSelector');
    // A selector that throws is reported, and the row takes the default template.
    const sel = selector && 'method' in selector
      ? `, selector: { item, index in ${throws(selector.method) ? `jsReported { ${call(selector.method, loops, ['item', 'index'])} } ?? "default"` : call(selector.method, loops, ['item', 'index'])} }`
      : '';
    const all = node.children.filter((t): t is Extract<TNode, { kind: 'template' }> => t.kind === 'template');
    const templates = all.filter((t) => !t.header);
    const header = all.find((t) => t.header);
    // A sectioned list's items are its sections; a row's item is one of a section's `items`.
    const source = node.sections ? `sections: { Array(${call(items.method, loops)}) }, rows: { Array($0.items) }` : `items: { Array(${call(items.method, loops)}) }`;
    if (!templates.length) { say(depth, `${v}.bind(${source}${sel})`); return; }
    const row = `row${n++}`;
    /** One template's view for a row: the closure body rendering it. */
    const body = (t: Extract<TNode, { kind: 'template' }>, at: number) => {
      const wrap = scoped('template', 'View');
      const d = wrap ? at : at - 1;
      if (wrap) say(at, `return ${wrap}`);
      if (framework === 'angular' && hasRegion(t.body)) say(d + 1, 'let __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(t.body, d + 1, [...loops, { item: t.item, index: t.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }], null, made));
      if (made.length !== 1) throw new Error(`${c.name}: a ${node.tag} template needs exactly one root element`);
      say(d + 1, `return ${made[0]}`);
      if (wrap) say(at, '}');
    };
    const fallback = templates.find((t) => t.key === 'default') ?? templates[0];
    say(depth, `${v}.bind(${source}, templates: [${templates.map((t) => swiftString(t.key)).join(', ')}]${sel}, render: { key, ${row} in`);
    say(depth + 1, 'switch key {');
    for (const t of [...templates.filter((t) => t !== fallback), fallback]) {
      say(depth + 1, t === fallback ? 'default:' : `case ${swiftString(t.key)}:`);
      body(t, depth + 2);
    }
    say(depth + 1, '}');
    if (header) {
      say(depth, `}, header: { ${row} in`);
      body(header, depth + 1);
    }
    say(depth, '})');
  };

  const fragment = framework === 'angular' && !c.page && isFragment(c.template);
  say(1, fragment ? 'func render(into region: Region) {' : 'func render() -> View {');
  const wrap = scoped('template', fragment ? 'Void' : 'View');
  const d = wrap ? 3 : 2;
  if (wrap) say(2, `return ${wrap}`);
  if (framework === 'angular' && hasRegion(c.template)) say(d, 'let __view = EffectOrder.current');
  for (const x of c.derived ?? []) say(d, `derive { ${reported(x.method, `self.${ident(x.name)}.value = ${call(x.method, [])}`)} }`);
  const member = (m: string, args: string[] = []) => `${throws(m) ? 'try ' : ''}self.${ident(m)}(${args.join(', ')})`;
  if (c.init) say(d, reported(c.init, member(c.init)));
  // A watcher runs before the bindings of its component, as Vue's pre-flush jobs do.
  for (const w of c.watchers ?? []) {
    if (!w.source) continue;
    const args = ['value', 'old'].slice(0, w.arity);
    say(d, `Watch(immediate: ${w.immediate}, { ${member(w.source)} }) { value, old in ${reported(w.handler, member(w.handler, args))} }`);
  }
  // Svelte's `$effect` runs after the template effects a write invalidates.
  const userEffects = () => { for (const w of c.watchers ?? []) if (!w.source) say(d, `EffectOrder.user { Effect { ${reported(w.handler, member(w.handler))} } }`); };
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(d, 'let page = Page.routed()');
    template(d, () => emit(c.template, d, [], 'page', null));
    userEffects();
    say(d, 'return page');
  } else if (fragment) {
    say(d, 'let root = RegionFragment(region)');
    template(d, () => emit(c.template, d, [], 'root', null));
    say(d, 'region.set(parts: root.parts)');
    userEffects();
  } else {
    const roots: string[] = [];
    template(d, () => emit(c.template, d, [], null, roots));
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    // Effects run once the component's views exist, as a renderer runs them after its commit.
    userEffects();
    for (const e of c.effects ?? []) say(d, `ComponentEffect(layout: ${e.layout}, deps: ${e.deps ? `{ ${call(e.deps, [])}.storage }` : 'nil'}) { ${throws(e.run) ? 'try ' : ''}self.${ident(e.run)}() }`);
    say(d, `return ${roots[0]}`);
  }
  if (wrap) say(2, '}');
  say(1, '}');
  return lines;
}

/** A template that is not a single element: its views join the parent of the component's host. */
export function isFragment(nodes: TNode[]): boolean {
  return nodes.length !== 1 || nodes[0].kind !== 'element' && nodes[0].kind !== 'component';
}

/** Whether a template holds an `if` or `for` of its own (not inside an item template). */
function hasRegion(nodes: TNode[]): boolean {
  return nodes.some((n) => n.kind === 'if' || n.kind === 'for' || (n.kind === 'element' && !TEMPLATE_HOSTS.has(n.tag) && hasRegion(n.children)));
}
