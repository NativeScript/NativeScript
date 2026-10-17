import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

// What every framework front end produces, and the back ends consume.
//
// A component is a virtual TypeScript class (its state as `$signal(...)`
// fields, derived values as getters, handlers as methods, and one method per
// template expression) plus a template tree that names those methods. The
// TypeScript checker types the class, so the back end translates typed code
// no matter which framework the source was written in.

export type Attr = (
  | { name: string; value: string }
  /** A binding: the method that computes the value, called with the loop variables in scope. */
  | { name: string; method: string }
) & {
  /** A prop of the component's own that a spread passes on only when the parent gave it (`{...rest}`). */
  ifPassed?: string;
};

export interface Event {
  name: string;
  /** Called with the loop variables in scope, then the event. */
  method: string;
  ifPassed?: string;
  /** A method deciding, when the view is made, whether to listen at all (`onX={cond ? fn : undefined}`). */
  when?: string;
  /** The handler takes the emitted value itself (an Angular component's output), not event data. */
  payload?: boolean;
}

/**
 * An Angular view query's hooks on the node it matches: `set` and `unset` called, after the names in scope, with the
 * node's view (`view`) or the component made there (`instance`), when the view is made and when it goes.
 */
export interface QueryHook {
  set: string;
  unset?: string;
  on: 'view' | 'instance';
}

/**
 * An Angular directive on an element, one per view of it. Its methods take the names in scope, then the directive
 * (`name`): `make` gives it, made with the element as its ElementRef; each input's `set` takes the value too, from its
 * binding's `method` or the attribute's `value`; `listeners` take the event; `bindings` give a host property's value.
 */
export interface DirectiveUse {
  name: string;
  make: string;
  inputs: ({ set: string; method: string } | { set: string; value: string })[];
  listeners: { event: string; method: string }[];
  bindings: { prop: string; method: string }[];
  /** Host attributes it sets (`host: { role: 'x' }`). */
  attributes: { name: string; value: string }[];
  init?: string;
  destroy?: string;
  afterViewInit?: string;
  /** It implements ngOnChanges: its inputs record their changes, flushed by one check after them. */
  changes?: boolean;
}

export type TNode =
  | {
      kind: 'element'; tag: string; attrs: Attr[]; events: Event[]; children: TNode[];
      /** A method returning the ref object (`useRef`) the view is stored in, as `ref={…}` does. */
      ref?: string;
      queries?: QueryHook[];
      /** The component's `init` runs once this view is made (Angular's static queries resolve before ngOnInit). */
      init?: boolean;
      directives?: DirectiveUse[];
      /** A ListView whose items are sections (`sectioned`), each holding its rows in `items`. */
      sections?: boolean;
    }
  | { kind: 'component'; name: string; props: Attr[]; events: Event[]; queries?: QueryHook[] }
  | { kind: 'if'; branches: { cond: string | null; body: TNode[] }[] }
  /**
   * A value of the view the body is in, made when the view is (an Angular pipe): `make` is called with the names in
   * scope, the body's methods take the value as `name` after them, and `destroy`, with the value too, runs when the
   * view goes.
   */
  | { kind: 'local'; name: string; make: string; destroy?: string; body: TNode[] }
  /** `items` and `key` are methods; `vars` are the item and index names the body sees. */
  | { kind: 'for'; items: string; key: string | null; item: string; index: string; body: TNode[] }
  /**
   * A ListView item template, a child of its ListView element; `key` is what `itemTemplateSelector` returns
   * for it. The ListView's `items` attribute is a method; its `itemTemplateSelector` attribute is a method
   * called with the loop variables in scope, then a row's item and index.
   */
  | {
      kind: 'template'; key: string; item: string; index: string; body: TNode[];
      /** A sectioned ListView's sticky header: its item is the section, its index the section's. */
      header?: boolean;
      /** The header's NativeScript XML as written, for a kit whose ListView parses it as core does (`Builder.parse`). */
      xml?: string;
    };

export interface ComponentIR {
  name: string;
  /** Virtual TypeScript file path, next to the source so its imports resolve. */
  file: string;
  source: string;
  props: string[];
  /** Events the component raises itself (Angular `output()`), as opposed to its root view's. */
  outputs?: string[];
  /** A routed component whose template is a page's content (Angular's ActionBar plus a view). */
  page?: boolean;
  template: TNode[];
  /** Props a parent may leave out. */
  optional?: string[];
  /** Props set through the component's `$set_<prop>` method (an Angular `@Input()` setter) when the binding changes, not passed to its constructor. */
  setters?: string[];
  /** Props the parent names otherwise (an aliased Angular input), by prop. */
  propAliases?: Record<string, string>;
  /** Whether the component takes the names of the props its parent gave (`$passed`), for a spread of its rest props. */
  passed?: boolean;
  /** Svelte's `$:` declarations: the state `name`, which `method` recomputes before the bindings update. */
  derived?: { name: string; method: string }[];
  /** `useEffect`/`useLayoutEffect`: the method that runs it (returning its cleanup) and the one returning its dependencies. */
  effects?: { run: string; deps: string | null; layout: boolean }[];
  /** The fields that raise `outputs`, where they are not named as the events (Vue's `emits`). */
  outputFields?: Record<string, string>;
  /** Vue's `watch` and Svelte's `$effect`, in declaration order. */
  watchers?: Watcher[];
  /** A method run once the props are set, before the template (Angular's `ngOnInit`). */
  init?: string;
  /** `init` runs where the template's element marked `init` is made, not before the template. */
  lateInit?: boolean;
  /** Run once the template is made and its bindings applied (Angular's `ngAfterViewInit`). */
  afterViewInit?: string;
  /** Run when the component's scope ends (Angular's `ngOnDestroy`). */
  destroy?: string;
  /** A field holding the component's own ElementRef (Angular's host element), given the template's root view once it is made. */
  host?: string;
  /** Angular's `ngOnChanges`: the parent records each input it sets with `$change(name, value)`, then calls `$flushChanges()` once its `$changed` signal moves. */
  changes?: boolean;
  /** The component's own stylesheets, scoped by its framework, which the app's build adds after app.css. */
  styles?: ComponentStyle[];
  /** Lines of the virtual file (0-based) its template's bindings were made from, with their line (1-based) in `file`, the template's own. */
  templateLines?: { file: string; lines: [number, number][] };
}

/** A component's stylesheet as plain CSS for the app's CSS chain, under a path of its own that names its component. */
export interface ComponentStyle {
  file: string;
  css: string;
}

/** The template with `attribute` on each of its own elements (not a child component's), which its scoped styles select. */
export function scopeTemplate(nodes: TNode[], attribute: string): TNode[] {
  return nodes.map((n): TNode => {
    switch (n.kind) {
      case 'element': return { ...n, attrs: [...n.attrs, { name: attribute, value: '' }], children: scopeTemplate(n.children, attribute) };
      case 'if': return { ...n, branches: n.branches.map((b) => ({ ...b, body: scopeTemplate(b.body, attribute) })) };
      case 'for': case 'template': case 'local': return { ...n, body: scopeTemplate(n.body, attribute) };
      default: return n;
    }
  });
}

/** The nodes with each `local` replaced by its body: what renders where the local is. */
export function withoutLocals(nodes: TNode[]): TNode[] {
  return nodes.flatMap((n) => (n.kind === 'local' ? withoutLocals(n.body) : [n]));
}

export interface Watcher {
  /** The method returning the watched value (Vue's `watch`), or null for an effect that tracks what it reads (`$effect`). */
  source: string | null;
  /** The method run, given the new value and then the old one when it takes them. */
  handler: string;
  arity: number;
  immediate: boolean;
}

export interface AppIR {
  root: string;
  components: ComponentIR[];
  /** The app's own TypeScript modules (data, stores), translated as they are. */
  modules: string[];
  css: string;
  name: string;
}

/** Svelte's `compile` from the app's own `svelte/compiler`. */
export type SvelteCompile = (source: string, options: Record<string, unknown>) => { css: { code: string } | null };

/**
 * A Svelte component's `<style>` as the app's Svelte compiles it (`css: 'external'`, scoped by its own analysis),
 * with the scoping class (`.svelte-<hash>`) read as an attribute the component's elements carry: Svelte puts the class
 * only on elements its selectors can match, so the attribute on every element selects the same ones.
 */
export function svelteStyles(path: string, text: string, compile: SvelteCompile, generate: 'dom' | 'client'): { styles: ComponentStyle[]; scope: string | null } {
  const style = /<style([^>]*)>([\s\S]*?)<\/style>/.exec(text);
  if (!style) return { styles: [], scope: null };
  const lang = /\blang=["']?(\w+)/.exec(style[1])?.[1];
  let css = style[2];
  if (lang === 'scss' || lang === 'sass') css = (createRequire(path)('sass') as { compileString(s: string, o: object): { css: string } }).compileString(css, { loadPaths: [dirname(path)], syntax: lang === 'sass' ? 'indented' : 'scss' }).css;
  else if (lang && lang !== 'css') throw new Error(`${path}: <style lang="${lang}"> is not supported in a compiled release yet`);
  const scope = `svelte-${createHash('sha256').update(path).digest('hex').slice(0, 8)}`;
  // Only the markup decides what the selectors match: the scripts are left out, and the style is plain CSS.
  const source = text.replace(/(<script[^>]*>)[\s\S]*?(<\/script>)/g, '$1$2').replace(style[0], `<style>${css}</style>`);
  const result = compile(source, { filename: path, generate, css: 'external', cssHash: () => scope });
  const code = (result.css?.code ?? '').split(`.${scope}`).join(`[${scope}]`);
  return { styles: code.trim() ? [{ file: `${path}.style0.css`, css: code }] : [], scope };
}

