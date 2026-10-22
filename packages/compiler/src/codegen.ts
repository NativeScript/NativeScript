import { withoutLocals, type Attr, type ComponentIR, type DirectiveUse, type QueryHook, type TNode } from './ir.ts';
import { basename } from 'node:path';
import { ident, swiftString } from './swift.ts';

export type Framework = 'vue' | 'angular' | 'svelte' | 'svelte5' | 'react' | 'solid' | 'octane' | 'core';

/** When each framework applies the updates a write causes (`Reactivity.Schedule`). */
export const SCHEDULE: Record<Framework, 'now' | 'microtask' | 'task' | 'event'> = { vue: 'microtask', svelte: 'microtask', svelte5: 'microtask', solid: 'microtask', angular: 'task', react: 'now', octane: 'event', core: 'now' };

/** Frameworks that do something around each template handler (`Reactivity.event`). */
export const EVENT_SCOPED = new Set<string>(['angular', 'react', 'octane']);

/** Views whose children are item templates, rendered through one `bind`: core's ListView and the kit's Pager. */
export const TEMPLATE_HOSTS = new Set(['ListView', 'Pager']);

/** Item-template host attributes that `bind` takes rather than `set`. */
export const LIST_BINDINGS = new Set(['items', 'itemTemplateSelector']);

/**
 * A component's template as a Swift `render()`: views are created once,
 * each binding is one effect that sets one property, and each `if`/`for`
 * owns a region of its container. Nothing is diffed at run time.
 */
/** What a template needs of a component it creates. */
export interface ComponentInfo {
  props: string[];
  outputs?: string[];
  outputFields?: Record<string, string>;
  optional?: string[];
  passed?: boolean;
  fragment?: boolean;
  initThrows?: boolean;
  /** Props set through the component's `$set_<prop>` method (`ComponentIR.setters`), and those whose method throws. */
  setters?: string[];
  throwingSetters?: string[];
  propAliases?: Record<string, string>;
  /** The component implements ngOnChanges (`ComponentIR.changes`). */
  changes?: boolean;
}

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

export function render(c: ComponentIR, components: Map<string, ComponentInfo>, throws: (method: string) => boolean = () => false, framework: Framework = 'octane', options: RenderOptions = {}): string[] {
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
  const templates: { bindings: Line[]; inserts: Line[]; listeners: Line[]; after: Line[] }[] = [];
  /** A template's views and structure, then its deferred inserts, bindings, (Svelte 5) listeners and (Angular directives') ngAfterViewInit. */
  const template = (depth: number, body: () => void) => {
    templates.push({ bindings: [], inserts: [], listeners: [], after: [] });
    body();
    const t = templates.pop()!;
    for (const d of [...t.inserts, ...t.bindings, ...t.listeners, ...t.after]) say(d.depth, d.text);
  };
  // Svelte 5 adds a template's event listeners after its template effect has set the properties.
  const listener = (depth: number, text: string) => (framework === 'svelte5' && templates.length ? templates.at(-1)!.listeners.push({ depth, text }) : say(depth, text));
  /** A closure that renders content in the scope its framework orders it in. */
  const scoped = (kind: 'template' | 'region', result: string) => {
    if (framework === 'vue' || framework === 'svelte') return kind === 'template' ? `try EffectOrder.component { () throws -> ${result} in` : null;
    if (framework === 'angular') return kind === 'template' ? `try EffectOrder.view { () throws -> ${result} in` : `try EffectOrder.embedded(in: __view) { () throws -> ${result} in`;
    if (framework === 'solid') return kind === 'template' ? `try EffectOrder.solid { () throws -> ${result} in` : `try EffectOrder.deeper { () throws -> ${result} in`;
    return null;
  };
  let n = 0;
  /** Where a region is, for the error a failed render reports: the component and its source file. */
  const site = (what: string) => swiftString(`${c.name} (${basename(c.file).replace(/\.ts$/, '')}): ${what}`);
  const say = (depth: number, text: string) => lines.push('    '.repeat(depth) + text);
  // Loop variables in scope, passed to every binding method in order.
  // An item template's row reads its item and index through the row's signals.
  // A view's local (an Angular pipe) is one name, without an index.
  type Loop = { item: string; index?: string; itemExpr?: string; indexExpr?: string };
  const call = (method: string, loops: Loop[], extra: string[] = []) =>
    `${throws(method) ? 'try ' : ''}self.${ident(method)}(${[...loops.flatMap((l) => (l.index === undefined ? [l.itemExpr ?? ident(l.item)] : [l.itemExpr ?? ident(l.item), l.indexExpr ?? ident(l.index)])), ...extra].join(', ')})`;
  // What a binding or handler throws is reported, as the frameworks report errors in templates.
  const reported = (method: string, code: string) => (throws(method) ? `jsReport { ${code} }` : code);
  // Zoneless Angular checks a view when one of its listeners runs: each listener holds its view.
  const zoneless = framework === 'angular' && !options.zone;
  const captures = zoneless ? '[__dv = EffectOrder.current.view] ' : '';
  const handler = (method: string, code: string) => (!EVENT_SCOPED.has(framework) ? reported(method, code) : zoneless ? `Reactivity.event(dirty: __dv) { ${reported(method, code)} }` : `Reactivity.event { ${reported(method, code)} }`);
  /** A zoneless Angular binding: an effect that also re-reads when its view is checked. */
  const check = (method: string, loops: Loop[], apply: string) => `Check({ ${call(method, loops)} }) { ${apply} }`;

  // What a zone app's binding throws is reported by its Check, and the binding keeps its value.
  const checked = (m: string, loops: Loop[]) => call(m, loops);
  // A condition that throws is reported and counts as false; mounted templates take any value as a condition (`{detail && <Label/>}`), as JSX does.
  const cond = (m: string, loops: Loop[]) => (throws(m) ? `jsReportedTruthy({ ${call(m, loops)} })` : `jsTruthy(${call(m, loops)})`);
  const binding = (depth: number, text: string) => (deferBindings && templates.length ? templates.at(-1)!.bindings.push({ depth, text }) : say(depth, text));
  /** Puts a view into its container or region at the point its framework inserts it. */
  const attach = (depth: number, v: string, parent: string | null, region: string | null, at: 'created' | 'built') => {
    const text = parent ? (options.slots ? `${parent}.kitAddTemplateChild(${v})` : `${parent}.kitAddChild(${v})`) : region ? `${region}.attach(${v})` : null;
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
      else say(depth, `${v}.kitSet(${swiftString(a.name)}, ${swiftString(a.value)})`);
    } else if (options.zone) {
      binding(depth, `Check({ ${checked(a.method, loops)} }) { ${a.name === 'class' ? `${v}.className = $0` : `${v}.kitSet(${swiftString(a.name)}, $0)`} }`);
    } else if (zoneless) {
      binding(depth, check(a.method, loops, a.name === 'class' ? `${v}.className = $0` : `${v}.kitSet(${swiftString(a.name)}, $0)`));
    } else if (a.name === 'class') {
      const value = options.slots ? `octaneClassName(${call(a.method, loops)})` : call(a.method, loops);
      binding(depth, `Effect { ${reported(a.method, `${v}.className = ${value}`)} }`);
    } else {
      binding(depth, `Effect { ${reported(a.method, `${v}.kitSet(${swiftString(a.name)}, ${options.slots ? `octaneValue(${call(a.method, loops)})` : call(a.method, loops)})`)} }`);
    }
  };

  /**
   * Angular directives on an element's view: each made with the view as its ElementRef, destroyed with its scope; its
   * inputs, ngOnChanges, ngOnInit and host bindings applied with the template's bindings, in that order, its host
   * listeners on the view, and its ngAfterViewInit once the template is made.
   */
  const directed = (depth: number, uses: DirectiveUse[] | undefined, loops: Loop[], v: string) => {
    for (const u of uses ?? []) {
      const dv = `d${n++}`;
      const made = call(u.make, loops);
      say(depth, `let ${dv} = ${made.startsWith('try ') ? 'try ' : ''}ElementRef.hosting(${v}) { ${made} }`);
      const inner = [...loops, { item: u.name, itemExpr: dv }];
      const run = (m: string, extra: string[] = []) => reported(m, call(m, inner, extra));
      if (u.destroy) say(depth, `Owner.current?.onCleanup { ${run(u.destroy)} }`);
      for (const a of u.attributes) say(depth, `${v}.kitSet(${swiftString(a.name)}, ${swiftString(a.value)})`);
      for (const i of u.inputs) {
        if ('value' in i) binding(depth, run(i.set, [swiftString(i.value)]));
        else binding(depth, `Check({ ${call(i.method, loops)} }) { ${throws(i.set) ? `let __v = $0; ${run(i.set, ['__v'])}` : run(i.set, ['$0'])} }`);
      }
      if (u.changes) binding(depth, `Check({ ${dv}._changed.value }) { _ in jsReport { try ${dv}._flushChanges() } }`);
      if (u.init) binding(depth, run(u.init));
      for (const b of u.bindings) binding(depth, `Check({ ${call(b.method, inner)} }) { ${v}.kitSet(${swiftString(b.prop)}, $0) }`);
      for (const l of u.listeners) listener(depth, `${v}.kitOn(${swiftString(l.event)}) { ${captures}event in ${handler(l.method, call(l.method, inner, ['event']))} }`);
      if (u.afterViewInit && templates.length) templates.at(-1)!.after.push({ depth, text: run(u.afterViewInit) });
      else if (u.afterViewInit) say(depth, run(u.afterViewInit));
    }
  };

  /** An Angular view query's field set to what a node made (its view, or the component made there), and cleared when it goes. */
  const queried = (depth: number, hooks: QueryHook[] | undefined, loops: Loop[], view: string, instance: string) => {
    for (const q of hooks ?? []) {
      const made = q.on === 'view' ? view : instance;
      say(depth, reported(q.set, call(q.set, loops, [made])));
      if (q.unset) say(depth, `Owner.current?.onCleanup { ${reported(q.unset, call(q.unset, loops, [made]))} }`);
    }
  };

  /** Emits the nodes into the container `parent`; returns the views made at this level when `collect` is set. */
  const emit = (nodes: TNode[], depth: number, loops: Loop[], parent: string | null, collect: string[] | null, region: string | null = null) => {
    for (const node of nodes) {
      if (node.kind === 'local') {
        const l = `l${n++}`;
        say(depth, `let ${l} = ${call(node.make, loops)}`);
        const inner = [...loops, { item: node.name, itemExpr: l }];
        if (node.destroy) say(depth, `Owner.current?.onCleanup { ${reported(node.destroy, call(node.destroy, inner))} }`);
        emit(node.body, depth, inner, parent, collect, region);
        continue;
      }
      if (node.kind === 'element' || node.kind === 'component') {
        const v = `v${n++}`;
        if (node.kind === 'element' && node.tag === 'Frame' && node.attrs.some((a) => a.name === 'router')) {
          const name = node.attrs.find((a) => a.name === 'router');
          say(depth, `let ${v} = try Router.shared.outlet(${name && 'value' in name && name.value !== 'true' ? swiftString(name.value) : ''})`);
          attach(depth, v, parent, region, 'created');
        } else if (node.kind === 'element') {
          say(depth, `let ${v} = try ${node.tag}()`);
          // The component's own ElementRef is its host: its template's root view.
          if (c.host && !parent && !region && !loops.length) say(depth, `self.${ident(c.host)}.attach(${v})`);
          if (node.ref) say(depth, `${call(node.ref, loops)}.current = ${v}`);
          queried(depth, node.queries, loops, v, v);
          directed(depth, node.directives, loops, v);
          const isList = TEMPLATE_HOSTS.has(node.tag);
          const props = () => {
            for (const a of node.attrs) if (!isList || !LIST_BINDINGS.has(a.name)) attr(depth, v, a, loops);
            for (const e of node.events) {
              const listen = `${v}.kitOn(${swiftString(e.name)}) { ${captures}event in ${handler(e.method, call(e.method, loops, ['event']))} }`;
              const guarded = e.when ? `if ${cond(e.when, loops)} { ${listen} }` : listen;
              listener(depth, e.ifPassed ? `if self._passed.contains(${swiftString(e.ifPassed)}) { ${guarded} }` : guarded);
            }
          };
          if (isList || !postOrder) props();
          attach(depth, v, parent, region, 'created');
          if (node.init && c.init) say(depth, reported(c.init, `${throws(c.init) ? 'try ' : ''}self.${ident(c.init)}()`));
          if (isList) list(node, depth, loops, v);
          else emit(node.children, depth, loops, v, null);
          if (!isList && postOrder) props();
        } else {
          const info = components.get(node.name);
          if (!info) throw new Error(`${c.name}: <${node.name}> is not a component`);
          const bound = new Map(node.props.map((p) => [p.name, p]));
          const given = { get: (p: string) => bound.get(info.propAliases?.[p] ?? p) };
          const c0 = `c${n++}`;
          const args = info.props.flatMap((p) => {
            if (info.setters?.includes(p)) return [];
            const a = given.get(p);
            if (!a && info.optional?.includes(p)) return [];
            if (!a) throw new Error(`${c.name}: <${node.name}> needs the prop "${p}"`);
            if ('value' in a) return [`${ident(p)}: ${swiftString(a.value)}`];
            if (!throws(a.method)) return [`${ident(p)}: untrack { ${call(a.method, loops)} }`];
            // A binding that may throw: the prop starts at its default and the binding's own effect, created right after,
            // sets it or reports what it throws, as Angular's error handler does. One with no default starts at its type's zero.
            if (info.optional?.includes(p)) return [];
            return [`${ident(p)}: untrack { jsReportedOrZero { ${call(a.method, loops)} } }`];
          });
          if (info.passed) args.push(`_passed: [${node.props.map((a) => swiftString(a.name)).concat(node.events.map((e) => swiftString('on' + e.name[0].toUpperCase() + e.name.slice(1)))).join(', ')}]`);
          say(depth, `let ${c0} = ${info.initThrows ? 'try ' : ''}${node.name}(${args.join(', ')})`);
          /** A prop's binding as it applies: the setter's method called (reporting what it throws), or the prop's signal written. */
          const write = (p: string, value: string) => {
            const change = info.changes ? `; ${c0}._change(${swiftString(p)}, ${value})` : '';
            if (!info.setters?.includes(p)) return `${c0}.${ident(p)}.value = ${value}${change}`;
            // `$0` names the Check's value only outside the closure jsReport takes.
            const held = info.throwingSetters?.includes(p) && value === '$0';
            const set = `${c0}.${ident('$set_' + p)}(${held ? '__v' : value})`;
            return (info.throwingSetters?.includes(p) ? `${held ? 'let __v = $0; ' : ''}jsReport { try ${set} }` : set) + change;
          };
          for (const p of info.props) {
            const a = given.get(p);
            if (a && 'value' in a && info.setters?.includes(p)) say(depth, write(p, swiftString(a.value)));
            else if (a && 'value' in a && info.changes) say(depth, `${c0}._change(${swiftString(p)}, ${swiftString(a.value)})`);
          }
          /** After the props' bindings: ngOnChanges with what they changed, as Angular calls it before the component's own check. */
          const changed = () => { if (info.changes) say(depth, `Check({ ${c0}._changed.value }) { _ in jsReport { try ${c0}._flushChanges() } }`); };
          if (info.fragment) {
            // A component whose template is not one element: its views join the parent where its host is, as a ProxyViewContainer's do.
            if (!parent) throw new Error(`${c.name}: <${node.name}>, whose template has no single root element, at the root of a template`);
            for (const p of info.props) {
              const a = given.get(p);
              if (a && 'method' in a) say(depth, zoneless || info.setters?.includes(p) ? check(a.method, loops, write(p, '$0')) : `Effect { ${reported(a.method, write(p, call(a.method, loops)))} }`);
            }
            for (const e of node.events) {
              if (!info.outputs?.includes(e.name)) throw new Error(`${c.name}: <${node.name}> takes no ${e.name} event: its template has no single root view`);
              say(depth, `${c0}.${ident(info.outputFields?.[e.name] ?? e.name)}.on { ${captures}value in ${handler(e.method, call(e.method, loops, [e.payload ? 'value' : `EventData(eventName: ${swiftString(e.name)}, object: nil, value: value)`]))} }`);
            }
            changed();
            if (node.queries?.some((q) => q.on === 'view')) throw new Error(`${c.name}: a view query reading <${node.name}>'s view, whose template has no single root view`);
            queried(depth, node.queries, loops, c0, c0);
            say(depth, `try ${c0}.render(into: ${parent}.kitAddRegion())`);
            continue;
          }
          for (const p of info.props) {
            const a = given.get(p);
            if (a && 'method' in a) say(depth, options.zone ? `Check({ ${checked(a.method, loops)} }) { ${write(p, '$0')} }` : zoneless || info.setters?.includes(p) ? check(a.method, loops, write(p, '$0')) : `Effect { ${reported(a.method, write(p, call(a.method, loops)))} }`);
          }
          changed();
          say(depth, `let ${v} = try ${c0}.render()`);
          queried(depth, node.queries, loops, v, c0);
          // Attributes that are not props fall through to the component's root view, as in Vue.
          for (const a of node.props) if (!info.props.some((p) => (info.propAliases?.[p] ?? p) === a.name)) attr(depth, v, a, loops);
          for (const e of node.events) {
            if (info.outputs?.includes(e.name)) say(depth, `${c0}.${ident(info.outputFields?.[e.name] ?? e.name)}.on { ${captures}value in ${handler(e.method, call(e.method, loops, [e.payload ? 'value' : `EventData(eventName: ${swiftString(e.name)}, object: ${v}, value: value)`]))} }`);
            else say(depth, `${v}.kitOn(${swiftString(e.name)}) { ${captures}event in ${handler(e.method, call(e.method, loops, ['event']))} }`);
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
      const nested = (body: TNode[]) => withoutLocals(body).some((x) => x.kind === 'if' || x.kind === 'for' || (x.kind === 'component' && !!components.get(x.name)?.fragment));
      const nestedBody = node.kind === 'if' ? node.branches.some((b) => nested(b.body)) : nested(node.body);
      // A framework that inserts top-down puts a branch's views in place as it builds them; a body with regions of its own attaches as a fragment.
      const live = insertion !== 'built' && !nestedBody ? `r${n++}` : null;
      if (live && insertion === 'mounted' && templates.length) {
        say(depth, `let ${live} = Region(host: nil)`);
        templates.at(-1)!.inserts.push({ depth, text: `${parent}.kitAddRegion(${live})` });
      } else if (live) say(depth, `let ${live} = ${parent}.kitAddRegion()`);
      // A branch or row with an if/for of its own (where views attach once built) returns a fragment holding the regions nested in this one.
      const fragmented = !live && nestedBody;
      let host = live ?? `${parent}.kitAddRegion()`;
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
        say(depth, `ChooseFragment(${host}, { ${which} }, site: ${site('if')}) { branch in`);
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
        say(depth, `Choose(${host}, { ${which} }, site: ${site('if')}) { branch in`);
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
        say(depth, `${fragmented ? 'ForEachFragment' : 'ForEach'}(${host}, ${items}, key: ${key}, site: ${site('for')}) { ${row} in`);
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
      // Angular's @for keeps a row by its key and gives it the item now at that key: the row reads item and index as signals.
      const row = framework === 'angular' ? `row${n++}` : null;
      const rowLoops = row ? [...loops, { item: node.item, index: node.index, itemExpr: `${row}.item.value`, indexExpr: `${row}.index.value` }] : inner;
      const opening = (kind: string) => row ? `${kind === 'For' ? 'ForEach' : 'ForEachFragment'}(${host}, { ${items} }, key: ${key}, site: ${site('for')}) { ${row} in` : `${kind}(${host}, { ${items} }, key: ${key}, site: ${site('for')}) { ${ident(node.item)}, ${ident(node.index)} in`;
      // Iterating reads the array through its tracker: a Vue ref's array re-renders on push.
      if (fragmented) {
        say(depth, opening('ForFragment'));
        fragment(node.body, depth + 1, rowLoops);
        say(depth, '}');
        continue;
      }
      say(depth, opening('For'));
      const wrap = scoped('region', '[View]');
      const d = wrap ? depth + 1 : depth;
      if (wrap) say(depth + 1, wrap);
      if (framework === 'angular' && hasRegion(node.body)) say(d + 1, 'let __view = EffectOrder.current');
      const made: string[] = [];
      template(d + 1, () => emit(node.body, d + 1, rowLoops, null, made, live));
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
    const read = throws(items.method) ? `jsReportedItems { ${call(items.method, loops)} }` : `Array(${call(items.method, loops)})`;
    const source = node.sections ? `sections: { ${read} }, rows: { Array($0.items) }` : `items: { ${read} }`;
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

  const fragment = framework === 'angular' && !c.page && isFragment(c.template, components);
  say(1, fragment ? 'func render(into region: Region) throws {' : 'func render() throws -> View {');
  const wrap = scoped('template', fragment ? 'Void' : 'View');
  const d = wrap ? 3 : 2;
  if (wrap) say(2, `return ${wrap}`);
  if (framework === 'angular' && hasRegion(c.template)) say(d, 'let __view = EffectOrder.current');
  for (const x of c.derived ?? []) say(d, `derive { ${reported(x.method, `self.${ident(x.name)}.value = ${call(x.method, [])}`)} }`);
  const member = (m: string, args: string[] = []) => `${throws(m) ? 'try ' : ''}self.${ident(m)}(${args.join(', ')})`;
  // ngOnDestroy runs when the scope the component was made in ends.
  if (c.destroy) say(d, `Owner.current?.onCleanup { ${reported(c.destroy, member(c.destroy))} }`);
  if (c.init && !c.lateInit) say(d, reported(c.init, member(c.init)));
  // A watcher runs before the bindings of its component, as Vue's pre-flush jobs do.
  for (const w of c.watchers ?? []) {
    if (!w.source) continue;
    const args = ['value', 'old'].slice(0, w.arity);
    say(d, `Watch(immediate: ${w.immediate}, { ${member(w.source)} }) { value, old in ${reported(w.handler, member(w.handler, args))} }`);
  }
  // ngAfterViewInit, once the template's views and its children's are made and their bindings applied.
  const afterView = () => { if (c.afterViewInit) say(d, reported(c.afterViewInit, member(c.afterViewInit))); };
  // Svelte's `$effect` runs after the template effects a write invalidates.
  const userEffects = () => { for (const w of c.watchers ?? []) if (!w.source) say(d, `EffectOrder.user { Effect { ${reported(w.handler, member(w.handler))} } }`); };
  if (c.page) {
    // A routed component's template is its page's content: the action bar and the view.
    say(d, 'let page = try Page.routed()');
    if (c.host) say(d, `self.${ident(c.host)}.attach(page)`);
    template(d, () => emit(c.template, d, [], 'page', null));
    userEffects();
    afterView();
    say(d, 'return page');
  } else if (fragment) {
    say(d, 'let root = RegionFragment(region)');
    template(d, () => emit(c.template, d, [], 'root', null));
    say(d, 'region.set(parts: root.parts)');
    userEffects();
    afterView();
  } else {
    const roots: string[] = [];
    template(d, () => emit(c.template, d, [], null, roots));
    if (roots.length !== 1) throw new Error(`${c.name}: a template needs exactly one root element`);
    // Effects run once the component's views exist, as a renderer runs them after its commit.
    userEffects();
    for (const e of c.effects ?? []) say(d, `ComponentEffect(layout: ${e.layout}, deps: ${e.deps ? `{ ${call(e.deps, [])}.storage }` : 'nil'}) { ${throws(e.run) ? 'try ' : ''}self.${ident(e.run)}() }`);
    afterView();
    say(d, `return ${roots[0]}`);
  }
  if (wrap) say(2, '}');
  say(1, '}');
  return lines;
}

/** A template that is not a single element: its views join the parent of the component's host. */
export function isFragment(nodes: TNode[], components?: ReadonlyMap<string, { fragment?: boolean }>): boolean {
  const shown = withoutLocals(nodes);
  if (shown.length !== 1) return true;
  // A template that is one component is a fragment when that component's template is.
  if (shown[0].kind === 'component') return !!components?.get(shown[0].name)?.fragment;
  return shown[0].kind !== 'element';
}

/** Whether a template holds an `if` or `for` of its own (not inside an item template). */
function hasRegion(nodes: TNode[]): boolean {
  return withoutLocals(nodes).some((n) => n.kind === 'if' || n.kind === 'for' || (n.kind === 'element' && !TEMPLATE_HOSTS.has(n.tag) && hasRegion(n.children)));
}
