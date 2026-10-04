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
}

export type TNode =
  | {
      kind: 'element'; tag: string; attrs: Attr[]; events: Event[]; children: TNode[];
      /** A method returning the ref object (`useRef`) the view is stored in, as `ref={…}` does. */
      ref?: string;
    }
  | { kind: 'component'; name: string; props: Attr[]; events: Event[] }
  | { kind: 'if'; branches: { cond: string | null; body: TNode[] }[] }
  /** `items` and `key` are methods; `vars` are the item and index names the body sees. */
  | { kind: 'for'; items: string; key: string | null; item: string; index: string; body: TNode[] }
  /**
   * A ListView item template, a child of its ListView element; `key` is what `itemTemplateSelector` returns
   * for it. The ListView's `items` attribute is a method; its `itemTemplateSelector` attribute is a method
   * called with the loop variables in scope, then a row's item and index.
   */
  | { kind: 'template'; key: string; item: string; index: string; body: TNode[] };

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
  /** Whether the component takes the names of the props its parent gave (`$passed`), for a spread of its rest props. */
  passed?: boolean;
  /** Svelte's `$:` declarations: the state `name`, which `method` recomputes before the bindings update. */
  derived?: { name: string; method: string }[];
  /** `useEffect`/`useLayoutEffect`: the method that runs it (returning its cleanup) and the one returning its dependencies. */
  effects?: { run: string; deps: string | null; layout: boolean }[];
}

export interface AppIR {
  root: string;
  components: ComponentIR[];
  /** The app's own TypeScript modules (data, stores), translated as they are. */
  modules: string[];
  css: string;
  name: string;
}
