import * as ng from '@angular/compiler';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, isAbsolute, join, relative } from 'node:path';
import { scopeTemplate, type Attr, type ComponentIR, type ComponentStyle, type DirectiveUse, type Event, type QueryHook, type TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';

const CLOSED_SOURCE_ELEMENTS: Record<string, string> = {
  radradialgauge: 'nativescript-ui-gauge',
  radlistview: 'nativescript-ui-listview',
  radsidedrawer: 'nativescript-ui-sidedrawer',
  radcalendar: 'nativescript-ui-calendar',
  raddataform: 'nativescript-ui-dataform',
  radautocompletetextview: 'nativescript-ui-autocomplete',
  radcartesianchart: 'nativescript-ui-chart',
  radpiechart: 'nativescript-ui-chart',
};

const LAYOUT_ATTRS = new Set([
  'row', 'col', 'rowSpan', 'colSpan', 'width', 'height', 'minWidth', 'minHeight',
  'class', 'scaleX', 'scaleY', 'translateX', 'translateY', 'rotate', 'opacity', 'visibility',
  'horizontalAlignment', 'verticalAlignment',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'left', 'top', 'dock', 'order', 'flexGrow', 'flexShrink', 'alignSelf',
  'backgroundColor', 'borderRadius', 'borderWidth', 'borderColor',
]);

const warnedClosedSourceElements = new Set<string>();

/** Angular's standalone component as the release build sees it. */
export interface AngularComponent extends ComponentIR {
  selector: string;
  /** Whether its virtual class uses the build's Angular runtime module (a pipe of @angular/common's, a QueryList). */
  usesRuntime?: boolean;
}

/** A pipe class a template can name: where it is, whether it is pure, and what making and destroying one takes. */
export interface PipeDecl {
  className: string;
  /** The module that exports it: a file, a package (`@nativescript/release`) or `RUNTIME`, the build's Angular runtime module. */
  file: string;
  pure: boolean;
  /** Its constructor takes parameters, which the `$create` the build adds to it injects. */
  create?: boolean;
  destroy?: boolean;
}

/** The build's own module of the Angular runtime its templates use (`runtime/angular.ts`): @angular/common's pipes, QueryList. */
export const RUNTIME = '@angular#runtime';

const COMMON_PIPES: Record<string, PipeDecl> = {
  async: { className: 'AsyncPipe', file: '@angular#rx', pure: false },
  date: { className: 'DatePipe', file: RUNTIME, pure: true },
  number: { className: 'DecimalPipe', file: RUNTIME, pure: true },
  percent: { className: 'PercentPipe', file: RUNTIME, pure: true },
  uppercase: { className: 'UpperCasePipe', file: RUNTIME, pure: true },
  lowercase: { className: 'LowerCasePipe', file: RUNTIME, pure: true },
  titlecase: { className: 'TitleCasePipe', file: RUNTIME, pure: true },
  json: { className: 'JsonPipe', file: RUNTIME, pure: false },
  slice: { className: 'SlicePipe', file: RUNTIME, pure: false },
  keyvalue: { className: 'KeyValuePipe', file: RUNTIME, pure: false },
};
const UNSUPPORTED_COMMON_PIPES = new Set(['currency', 'i18nPlural', 'i18nSelect']);

/**
 * A NativeScript Angular standalone component (`@Component` with a template
 * of @nativescript/core elements, signals, `input()`/`output()`, `inject()`)
 * as a virtual class: the component's own source with one method appended
 * per template expression. The class keeps Angular's API; the translator
 * knows what `signal()`, `computed()`, `input()`, `output()` and `inject()` mean.
 */
export function angularComponent(path: string, text: string, selectors: Map<string, string>, options: { zone?: boolean; elements?: Map<string, string>; platform?: 'ios' | 'android'; pipes?: Map<string, PipeDecl>; runtimeModule?: string; directives?: DirectiveDecl[]; ngModules?: Map<string, string[]>; attrComponents?: Map<string, ComponentSummary> } = {}): AngularComponent | null {
  const written = text;
  let sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let cls = sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && !!decorator(s, 'Component'));
  if (!cls || !cls.name) return null;
  const others = sf.statements.filter((s) => s !== cls && ts.isClassDeclaration(s) && !!decorator(s, 'Component'));
  if (others.length) throw new Error(`${path}: ${others.length + 1} components in one file; a compiled release takes one @Component per file`);
  // A class with decorated inputs and outputs, or constructor injection, as the signal-style class the translator reads.
  const classic = classicClass(path, text, cls);
  if (classic) {
    text = classic.text;
    sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    cls = sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && !!decorator(s, 'Component'))!;
  }
  const meta = decorator(cls, 'Component')!.arguments[0] as ts.ObjectLiteralExpression;
  const prop = (name: string) => meta.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && (p.name as ts.Identifier).text === name)?.initializer;
  const selector = (prop('selector') as ts.StringLiteral | undefined)?.text ?? cls.name.text;
  const inline = prop('template');
  const templateUrl = (prop('templateUrl') as ts.StringLiteral | undefined)?.text;
  const template = inline && (ts.isNoSubstitutionTemplateLiteral(inline) || ts.isStringLiteral(inline)) ? inline.text : templateUrl && existsSync(join(dirname(path), templateUrl)) ? readFileSync(join(dirname(path), templateUrl), 'utf8') : '';
  // zone.js checks only components whose strategy is Eager (`Default`); Angular 22's default is OnPush.
  const strategy = prop('changeDetection')?.getText();
  if (options.zone && strategy !== 'ChangeDetectionStrategy.Default' && strategy !== 'ChangeDetectionStrategy.Eager') {
    throw new Error(`${path}: ${cls.name!.text} is checked OnPush; an app checked by zone.js compiles only ChangeDetectionStrategy.Default (Eager) components in a release build yet`);
  }

  /** A tag as @nativescript/angular's registry knows it: by its name, lowercased, or kebab-cased (`grid-layout`). */
  const registered = new Map<string, string>();
  for (const [tag, cls] of options.elements ?? []) for (const k of [tag, tag.toLowerCase(), tag.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()]) registered.set(k, cls);
  const elementOf = (name: string): string | undefined => canonical(name) ?? canonical(name.replace(/-/g, '')) ?? registered.get(name) ?? registered.get(name.toLowerCase()) ?? undefined;
  const members = new Set<string>();
  const props: string[] = [];
  const optional: string[] = [];
  const outputs: string[] = [];
  const inputAliases: Record<string, string> = {};
  for (const m of cls.members) {
    if (!m.name || !ts.isIdentifier(m.name)) continue;
    members.add(m.name.text);
    if (ts.isPropertyDeclaration(m) && m.initializer && ts.isCallExpression(m.initializer)) {
      const callee = m.initializer.expression.getText();
      if (callee === 'input' || callee === 'input.required' || callee === 'model' || callee === 'model.required') {
        props.push(m.name.text);
        // `input(init, { alias })`, `input.required({ alias })`: the name the parent binds.
        const options = m.initializer.arguments[callee === 'input' || callee === 'model' ? 1 : 0];
        const alias = options && ts.isObjectLiteralExpression(options) ? options.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'alias')?.initializer : undefined;
        if (alias && ts.isStringLiteralLike(alias)) inputAliases[m.name.text] = alias.text;
      }
      // An input with a default value (or `input<T>()` with implicit undefined) is one a parent may leave out.
      if (callee === 'input' || callee === 'model') optional.push(m.name.text);
      if (callee === 'output' || callee === 'model' || callee === 'model.required') outputs.push(m.name.text);
    }
  }
  collectInheritedMembers(path, sf, cls, members);
  for (const [field, alias] of classic?.aliases ?? []) inputAliases[field] = alias;
  for (const name of classic?.setters ?? []) { props.push(name); optional.push(name); }
  const scope: Scope = { names: new Map([...members].map((m) => [m, classic?.inputs.has(m) ? `this.${m}()` : `this.${m}`])) };
  const init = cls.members.find((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'ngOnInit');
  /** A lifecycle hook the class implements: a method of that name, taking nothing. */
  const hook = (name: string) => {
    const m = cls!.members.find((x): x is ts.MethodDeclaration => ts.isMethodDeclaration(x) && x.name.getText() === name);
    if (m?.parameters.length) throw new Error(`${path}: ${name} takes no parameters`);
    return !!m;
  };
  if (init && (init as ts.MethodDeclaration).parameters.length) throw new Error(`${path}: ngOnInit takes no parameters`);

  const methods: string[] = [];
  let next = 0;
  /**
   * The names a template method takes for the scope it is in: a loop's item and index (`names`: a template's other
   * context variables, `let-e="even"`, as expressions over them), or a view's own value (a pipe, without an index).
   */
  type Loop = { item: string; index?: string; param: string; names?: Record<string, string> };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => (l.index === undefined ? [l.item] : [l.item, l.index])).join(', ');
  /** `*ngIf="x as y"`: names a structural directive binds, in the template it renders. */
  const aliases = new Map<string, string>();
  const local = (loops: Loop[]): Scope => {
    const names = new Map(scope.names);
    for (const [k, v] of aliases) names.set(k, v);
    for (const l of loops) {
      names.delete(l.item); if (l.index !== undefined) names.delete(l.index);
      for (const [k, v] of Object.entries(l.names ?? {})) names.set(k, v);
    }
    return { names };
  };
  /**
   * Each `| name` in the template is one pipe per view it renders in, as Angular's `ɵɵpipe` creates them: a local of the
   * view (`$pN`), and for a pure pipe the arguments it last transformed (`$cN`), so `transform` runs only when one changes.
   */
  const sites = new Map<ng.BindingPipe, { pipe: string; cache: string | null }>();
  const imported = new Map<string, Map<string, string>>();
  let usesRuntime = false;
  /** The class a pipe's name resolves to, imported into the component's file under a name of its own. */
  const pipeClass = (name: string): { alias: string; decl: PipeDecl } => {
    const decl = options.pipes?.get(name) ?? COMMON_PIPES[name];
    if (!decl) throw new Error(`${path}: the ${name} pipe is not one the release build knows: no @Pipe({ name: '${name}' }) class in the app or the libraries it imports${UNSUPPORTED_COMMON_PIPES.has(name) ? `, and @angular/common's ${name} pipe is not supported in a release build yet` : ''}`);
    const from = decl.file === RUNTIME ? (usesRuntime = true, options.runtimeModule ?? RUNTIME) : decl.file;
    const names = imported.get(from) ?? new Map<string, string>();
    imported.set(from, names);
    if (!names.has(decl.className)) names.set(decl.className, `$Pipe_${decl.className}`);
    return { alias: names.get(decl.className)!, decl };
  };
  /**
   * The pipes in a node's own expressions, as locals of the view around it: the loops its methods take, and the node
   * wrapped in them. A pipe class with constructor parameters is made through the `$create` the build adds to it,
   * which injects them; one with `ngOnDestroy` is destroyed with its view.
   */
  const withPipes = (asts: (ng.AST | null | undefined)[], loops: Loop[]): { loops: Loop[]; wrap: (body: TNode[]) => TNode[] } => {
    const found = asts.flatMap((a) => (a ? allPipes(a instanceof ng.ASTWithSource ? a.ast : a) : [])).filter((p) => !sites.has(p) || !loops.some((l) => l.item === sites.get(p)!.pipe));
    if (!found.length) return { loops, wrap: (body) => body };
    const made: { name: string; make: string; destroy?: string }[] = [];
    let inner = loops;
    for (const p of found) {
      const { alias, decl } = pipeClass(p.name);
      const k = sites.size;
      const pipe = `$p${k}`;
      const make = expr(decl.create ? `${alias}.$create()` : `new ${alias}()`, inner);
      inner = [...inner, { item: pipe, param: `${pipe}: ${alias}` }];
      const destroy = decl.destroy ? handlerOf(`${pipe}.ngOnDestroy()`, inner) : undefined;
      made.push({ name: pipe, make, ...(destroy ? { destroy } : {}) });
      let cache: string | null = null;
      if (decl.pure) {
        cache = `$c${k}`;
        made.push({ name: cache, make: expr('new $PurePipeCache()', inner) });
        inner = [...inner, { item: cache, param: `${cache}: $PurePipeCache` }];
      }
      sites.set(p, { pipe, cache });
    }
    return { loops: inner, wrap: (body) => made.reduceRight((b, l): TNode[] => [{ kind: 'local', name: l.name, make: l.make, ...(l.destroy ? { destroy: l.destroy } : {}), body: b }], body) };
  };
  const keywordRead = (n: unknown): boolean => n instanceof ng.PropertyRead && n.receiver instanceof ng.ImplicitReceiver && !(n.receiver instanceof ng.ThisReceiver) && KEYWORDS.has(n.name) && members.has(n.name);
  /** The pipes and keyword-named member reads in an expression, outermost first (not those inside a pipe). */
  const specialsIn = (node: ng.AST): ng.AST[] => {
    const found: ng.AST[] = [];
    const visit = (n: unknown) => {
      if (n instanceof ng.BindingPipe || keywordRead(n)) { found.push(n as ng.AST); return; }
      if (!(n instanceof ng.AST)) return;
      for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(visit) : visit(v);
    };
    if (node instanceof ng.BindingPipe || keywordRead(node)) return [node];
    for (const v of Object.values(node)) Array.isArray(v) ? v.forEach(visit) : visit(v);
    return found;
  };
  const code = (value: ng.AST, _loops: Loop[]): string => {
    const root = value instanceof ng.ASTWithSource ? value.ast : value;
    // `text="How {{ x }}"`: Angular renders the literal text with each expression's value, undefined and null as ''.
    const interpolation = root instanceof ng.Interpolation ? root : null;
    if (!specialsIn(root).length && !interpolation) return value instanceof ng.ASTWithSource ? sourceOf(value) : template.slice(value.sourceSpan.start, value.sourceSpan.end);
    const textOf = (node: ng.AST): string => {
      // A member named like a keyword (`continue()`): read on the component, which the expression's text cannot say.
      if (keywordRead(node)) return `this.${(node as ng.PropertyRead).name}`;
      if (node instanceof ng.BindingPipe) {
        const site = sites.get(node);
        if (!site) throw new Error(`${path}: the ${node.name} pipe where the release build gives it no view (in ${template.slice(node.sourceSpan.start, node.sourceSpan.end)})`);
        const given = [node.exp, ...node.args].map(textOf);
        if (!site.cache) return `${site.pipe}.transform(${given.join(', ')})`;
        if (given.length > 5) throw new Error(`${path}: the ${node.name} pipe with more than 4 arguments is not supported in a release build yet`);
        const xs = given.map((_, i) => `$x${i}`);
        return `${site.cache}.pure${given.length}(${given.map((g) => `(${g})`).join(', ')}, (${xs.join(', ')}) => ${site.pipe}.transform(${xs.join(', ')}))`;
      }
      const at = node.sourceSpan.start;
      let out = template.slice(at, node.sourceSpan.end);
      for (const p of specialsIn(node).sort((a, b) => b.sourceSpan.start - a.sourceSpan.start)) {
        out = out.slice(0, p.sourceSpan.start - at) + textOf(p) + out.slice(p.sourceSpan.end - at);
      }
      return out;
    };
    if (interpolation) return '`' + interpolation.strings.map((s, i) => s.replace(/[`\\$]/g, (x) => '\\' + x) + (i < interpolation.expressions.length ? `\${(${textOf(interpolation.expressions[i])}) ?? ''}` : '')).join('') + '`';
    return textOf(root);
  };
  // `$any(x)` is Angular's escape from template type checking; the release build is typed by the component's code,
  // except `$any($event)`, whose event data the handler reads as the type it declares.
  const clean = (code: string) =>
    code
      .replace(/(['"])(?:\\.|(?!\1)[\s\S])*?\1/g, (s) => (s.includes('\n') || s.includes('\r') ? s.replace(/\r?\n/g, '\\n').replace(/\r/g, '\\r') : s))
      .replace(/\$any\(\s*\$event\s*\)/g, '($event as any)')
      .replace(/\$any\(/g, '(');
  /** The template line (0-based) of the binding being compiled, and each template method's (by its index in `methods`). */
  let here: number | null = null;
  const located = new Map<number, number>();
  const at = (span: ng.ParseSourceSpan | null | undefined) => { if (span) here = span.start.line; };
  const add = (method: string) => {
    methods.push(method);
    if (here !== null) located.set(methods.length - 1, here);
  };
  const expr = (code: string, loops: Loop[], untyped = false) => {
    const m = `$b${next++}`;
    add(`  ${m}(${params(loops)})${untyped ? ': any' : ''} { return ${rewrite(clean(code), local(loops))}; }`);
    return m;
  };
  /** A method of statements over the names in scope (a pipe's `ngOnDestroy`). */
  const handlerOf = (statements: string, loops: Loop[]) => {
    const m = `$e${next++}`;
    add(`  ${m}(${params(loops)}) { ${statements}; }`);
    return m;
  };
  // A condition is tested, not held: a value its type says is there (a non-strict app's `signal<Person>(null)`) is read only for its truth.
  const test = (code: string, loops: Loop[]) => expr(`!!(${code})`, loops);
  // A component's output gives its handler the emitted value as `$event`; a view's event gives the event data.
  const handler = (code: string, loops: Loop[], payload = false) => {
    const m = `$e${next++}`;
    add(`  ${m}(${[params(loops), `$event: ${payload ? 'any' : '$EventData'}`].filter(Boolean).join(', ')}) { ${rewrite(clean(code), local(loops), 'statements')}; }`);
    return m;
  };

  /**
   * The view queries an element or a component's host matches (`#ref`, or the component's class), as the methods that
   * set and clear each one's field: an ElementRef of the view, the component itself, or the view read as its class.
   * The field is set when the view is made and cleared when it goes, as a query's next refresh finds it gone.
   */
  const queryHooks = (refs: string[], component: string | null, tag: string | null, loops: Loop[]): QueryHook[] => {
    const hooks: QueryHook[] = [];
    for (const q of queries) {
      if (q.ref ? !refs.includes(q.ref) : q.type !== component && q.type !== tag) continue;
      const instance = !!component && (q.read === null || q.read === component || q.read === 'any');
      const wrapped = q.read === 'ElementRef' || (q.read === null && !component);
      if (wrapped) usesElementRef = true;
      // The made node as its own class (the component, the element's view class), else untyped and read as the query's class.
      const own = q.read === 'any' ? null : instance ? component : !wrapped && q.read === tag ? tag : null;
      const value = wrapped ? 'new $ElementRef($q)' : own || !q.read || q.read === 'any' ? '$q' : `($q as ${q.read})`;
      const inner = [...loops, { item: '$q', param: `$q: ${own ?? 'any'}` }];
      // A single query keeps its match once the match's view goes, which Angular's next refresh would clear.
      const set = handlerOf(q.many ? `this.${q.field}.$add($q, ${value})` : `this.${q.field} = ${value}`, inner);
      const unset = q.many ? handlerOf(`this.${q.field}.$remove($q)`, inner) : undefined;
      hooks.push({ set, ...(unset ? { unset } : {}), on: instance ? 'instance' : 'view' });
    }
    return hooks;
  };
  let usesElementRef = false;
  const queries = classic?.queries ?? [];
  /** The `#refs` of the template's own elements, outside any embedded view: what a static query can resolve. */
  const staticRefs = new Set<string>();
  /** The static queries not yet resolved where the template walk is; ngOnInit waits for them. */
  const staticQueries = new Set<ViewQuery>();
  let lateInit = false;

  /**
   * The app's directives in the component's scope, by their selectors, as Angular's compiler matches them: those its
   * `imports` name, directly or through an NgModule's exports, and those of an NgModule declaring it.
   */
  const inScope = new Set<string>();
  const expand = (names: string[]) => {
    for (const n of names) {
      if (inScope.has(n)) continue;
      inScope.add(n);
      expand(options.ngModules?.get(n) ?? []);
    }
  };
  const importsMeta = prop('imports');
  expand(importsMeta && ts.isArrayLiteralExpression(importsMeta) ? importsMeta.elements.filter(ts.isIdentifier).map((e) => e.text) : []);
  for (const [, names] of options.ngModules ?? []) if (names.includes(cls.name!.text)) expand(names);
  const matcher = new ng.SelectorMatcher<DirectiveDecl>();
  for (const d of options.directives ?? []) if (inScope.has(d.className)) matcher.addSelectables(ng.CssSelector.parse(d.selector), d);
  /** The directives an element matches: its name, attributes, bound inputs and outputs, as Angular matches them. */
  const matched = (name: string, attributes: string[][], bound: string[]): DirectiveDecl[] => {
    const css = new ng.CssSelector();
    css.setElement(name);
    for (const [k, v] of attributes) {
      css.addAttribute(k, v);
      if (k === 'class') for (const c of v.split(/\s+/).filter(Boolean)) css.addClassName(c);
    }
    for (const b of bound) css.addAttribute(b, '');
    const found: DirectiveDecl[] = [];
    matcher.match(css, (_s, d) => { if (!found.includes(d)) found.push(d); });
    return found;
  };
  let directiveCount = 0;
  /**
   * A directive on an element, one per view of it: made with the element as its ElementRef, its inputs set from the
   * element's bindings and attributes of their names (the bindings then are the directive's, not the view's), its
   * host listeners and bindings on the element, and its hooks.
   */
  const directiveUse = (d: DirectiveDecl, n: ng.TmplAstElement, loops: Loop[], consumed: Set<string>): DirectiveUse => {
    const names = imported.get(d.file) ?? new Map<string, string>();
    imported.set(d.file, names);
    if (!names.has(d.className)) names.set(d.className, `$Dir_${d.className}`);
    const alias = names.get(d.className)!;
    const name = `$d${directiveCount++}`;
    const make = expr(d.create ? `${alias}.$create()` : `new ${alias}()`, loops);
    const inner = [...loops, { item: name, param: `${name}: ${alias}` }];
    const valued = [...inner, { item: '$v', param: '$v: any' }];
    const own: Scope = { names: new Map(d.members.map((m) => [m, `${name}.${m}`])) };
    const setter = (input: string, member: string) => handlerOf(`${name}.${member} = $v${d.hooks.has('ngOnChanges') ? `; ${name}.$change(${JSON.stringify(member)}, $v)` : ''}`, valued);
    const inputs: DirectiveUse['inputs'] = [];
    for (const [input, member] of d.inputs) {
      const b = n.inputs.find((i) => i.name === input && i.type === ng.BindingType.Property);
      const a = n.attributes.find((x) => x.name === input);
      if (b) {
        at(b.sourceSpan);
        consumed.add(input);
        inputs.push({ set: setter(input, member), method: expr(code(b.value, loops), loops, true) });
      } else if (a) inputs.push({ set: setter(input, member), value: a.value });
    }
    const listeners = d.listeners.map((l) => ({ event: l.event, method: handlerOf(rewrite(l.code, { names: new Map([...own.names, ['$event', '$event']]) }, 'statements'), [...inner, { item: '$event', param: '$event: any' }]) }));
    const bindings = d.bindings.map((b) => ({ prop: b.prop, method: expr(rewrite(b.code, own), inner, true) }));
    const hook = (h: string) => (d.hooks.has(h) ? handlerOf(`${name}.${h}()`, inner) : undefined);
    const init = hook('ngOnInit'), destroy = hook('ngOnDestroy'), afterViewInit = hook('ngAfterViewInit');
    return { name, make, inputs, listeners, bindings, ...(init ? { init } : {}), ...(destroy ? { destroy } : {}), ...(afterViewInit ? { afterViewInit } : {}), ...(d.hooks.has('ngOnChanges') ? { changes: true } : {}), attributes: d.attributes };
  };

  /** The expressions a node evaluates in the view it is in (its children's are theirs): where its pipes are. */
  const ownExpressions = (n: ng.TmplAstNode): ng.AST[] => {
    if (n instanceof ng.TmplAstElement) {
      const skipped = !selectors.has(n.name) && CLOSED_SOURCE_ELEMENTS[n.name.replace(/-/g, '').toLowerCase()];
      if (skipped) return n.inputs.filter((i) => LAYOUT_ATTRS.has(i.name) || i.type === ng.BindingType.Class || i.type === ng.BindingType.Style).map((i) => i.value);
      return [...n.inputs.map((i) => i.value), ...n.children.flatMap((c) => (c instanceof ng.TmplAstBoundText ? [c.value] : []))];
    }
    // `*ngFor` on an element: the element's own inputs are the template's, evaluated in each view it renders.
    if (n instanceof ng.TmplAstTemplate) return [...n.templateAttrs, ...(n.tagName === 'ng-template' ? n.inputs : [])].flatMap((a) => (a instanceof ng.TmplAstBoundAttribute ? [a.value] : []));
    if (n instanceof ng.TmplAstIfBlock) return n.branches.flatMap((b) => (b.expression ? [b.expression] : []));
    if (n instanceof ng.TmplAstForLoopBlock) return [n.expression];
    if (n instanceof ng.TmplAstSwitchBlock) return [n.expression, ...n.groups.flatMap((g) => g.cases.flatMap((c) => (c.expression ? [c.expression] : [])))];
    return [];
  };

  const nodes = (list: ng.TmplAstNode[], loops: Loop[]): TNode[] => {
    const out: TNode[] = [];
    // `@let name = expression`: the expression wherever the name is read after it in this block.
    const declared: string[] = [];
    for (let k = 0; k < list.length; k++) {
      const n = list[k];
      if (n instanceof ng.TmplAstLetDeclaration) {
        at(n.sourceSpan);
        // A pipe in a `@let` is one per view: the rest of the block is in its scope.
        const piped = withPipes([n.value], loops);
        aliases.set(n.name, rewrite(clean(code(n.value, piped.loops)), local(piped.loops)));
        declared.push(n.name);
        if (piped.loops !== loops) {
          out.push(...piped.wrap(nodes(list.slice(k + 1), piped.loops)));
          break;
        }
        continue;
      }
      const piped = withPipes(ownExpressions(n), loops);
      if (piped.loops !== loops) {
        out.push(...piped.wrap(nodes([n], piped.loops)));
        continue;
      }
      if (n instanceof ng.TmplAstElement && !selectors.has(n.name) && PLATFORM_FILTERS[n.name]) {
        at(n.startSourceSpan);
        // @nativescript/angular's AndroidFilterComponent and its kin: `@if (show) { <ng-content> }` in a ProxyViewContainer.
        if (n.attributes.length || n.inputs.length || n.outputs.length || n.references.length) throw new Error(`${path}: <${n.name}> takes no attributes or bindings in a release build`);
        if (PLATFORM_FILTERS[n.name].includes(options.platform ?? 'ios')) out.push(...nodes(n.children, loops));
        continue;
      }
      if (n instanceof ng.TmplAstElement && n.name === 'ng-container') {
        at(n.startSourceSpan);
        out.push(...container(n, loops));
        continue;
      }
      if (n instanceof ng.TmplAstElement) {
        at(n.startSourceSpan);
        const skippedPkg = !selectors.has(n.name) ? CLOSED_SOURCE_ELEMENTS[n.name.replace(/-/g, '').toLowerCase()] : undefined;
        if (skippedPkg) {
          const warnKey = `${path}:${n.name}`;
          if (!warnedClosedSourceElements.has(warnKey)) {
            warnedClosedSourceElements.add(warnKey);
            console.warn(`warning: ${path}: <${n.name}> (${skippedPkg}) is a closed-source binary plugin and renders as blank ContentView`);
          }
          const attrs: Attr[] = [];
          for (const a of n.attributes) if (LAYOUT_ATTRS.has(a.name)) attrs.push({ name: a.name, value: a.value });
          const toggles = n.inputs.filter((i) => i.type === ng.BindingType.Class);
          if (toggles.length) {
            at(toggles[0].sourceSpan);
            const fixed = attrs.findIndex((a) => a.name === 'class');
            const base = fixed >= 0 ? attrs.splice(fixed, 1)[0].value ?? '' : '';
            const parts = [JSON.stringify(base), ...toggles.map((t) => `(${code(t.value, loops)}) ? ${JSON.stringify(t.name)} : ''`)];
            attrs.push({ name: 'class', method: expr(`[${parts.join(', ')}].filter((c) => !!c).join(' ')`, loops) });
          }
          for (const i of n.inputs) {
            if (i.type === ng.BindingType.Class) continue;
            if (i.type === ng.BindingType.Style && i.name !== 'style') {
              at(i.sourceSpan);
              const v = code(i.value, loops);
              attrs.push({ name: i.name, method: expr(i.unit ? `((${v}) == null ? (${v}) : \`\${${v}}${i.unit}\`)` : v, loops, true) });
              continue;
            }
            if ((i.type === ng.BindingType.Property || i.type === ng.BindingType.Attribute) && LAYOUT_ATTRS.has(i.name)) {
              at(i.sourceSpan);
              const root = i.value instanceof ng.ASTWithSource ? i.value.ast : i.value;
              const chained = root instanceof ng.SafePropertyRead || root instanceof ng.SafeKeyedRead || root instanceof ng.SafeCall;
              attrs.push({ name: i.name, method: expr(code(i.value, loops), loops, chained) });
            }
          }
          const refs = n.references.map((r) => r.name);
          const hooks = queryHooks(refs, null, 'ContentView', loops);
          const statics = hooks.length ? queries.filter((q) => q.static && q.ref && refs.includes(q.ref) && staticRefs.has(q.ref)) : [];
          for (const q of statics) staticQueries.delete(q);
          const late = statics.length > 0 && staticQueries.size === 0;
          out.push({ kind: 'element', tag: 'ContentView', attrs, events: [], children: [], ...(hooks.length ? { queries: hooks } : {}), ...(late ? { init: true } : {}) });
          if (late) lateInit = true;
          continue;
        }
        const attrs: Attr[] = [];
        const events: Event[] = [];
        const hostedAttr = !selectors.has(n.name) ? n.attributes.find((a) => options.attrComponents?.has(a.name)) : undefined;
        const hosted = hostedAttr ? options.attrComponents!.get(hostedAttr.name) : undefined;
        const compAttrs: Attr[] = [];
        const compEvents: Event[] = [];
        // A ListView, or a plugin view taking item templates (`<Pager>` with `<ng-template let-item>`), renders rows from templates.
        const isList = canonical(n.name) === 'ListView' || (n.inputs.some((i) => i.name === 'items') && n.children.some((c) => c instanceof ng.TmplAstTemplate && c.tagName === 'ng-template' && c.variables.length > 0));
        const link = routerLink(n, loops);
        if (link) events.push(link);
        for (const a of n.attributes) {
          if (a === hostedAttr || (link && ROUTER_LINK_INPUTS.has(a.name))) continue;
          if (hosted?.inputs.has(a.name)) compAttrs.push({ name: a.name, value: a.value });
          else attrs.push({ name: a.name, value: a.value });
        }
        for (const c of n.children) {
          if (c instanceof ng.TmplAstText && c.value.trim()) attrs.push({ name: 'text', value: c.value });
          if (c instanceof ng.TmplAstBoundText) {
            at(c.sourceSpan);
            attrs.push({ name: 'text', method: expr(code(c.value, loops), loops) });
          }
        }
        // `[class.on]="cond"` toggles a class beside the static ones: one bound `class` naming them all.
        const toggles = n.inputs.filter((i) => i.type === ng.BindingType.Class);
        if (toggles.length) {
          at(toggles[0].sourceSpan);
          const fixed = attrs.findIndex((a) => a.name === 'class');
          const base = fixed >= 0 ? attrs.splice(fixed, 1)[0].value ?? '' : '';
          const parts = [JSON.stringify(base), ...toggles.map((t) => `(${code(t.value, loops)}) ? ${JSON.stringify(t.name)} : ''`)];
          attrs.push({ name: 'class', method: expr(`[${parts.join(', ')}].filter((c) => !!c).join(' ')`, loops) });
        }
        // NgSwitch on any element: the cases below it, in its subtree, compare with its value.
        const switched = n.inputs.find((i) => i.name === 'ngSwitch');
        const found = matched(n.name, n.attributes.map((a) => [a.name, a.value]), [...n.inputs.map((i) => i.name), ...n.outputs.map((o) => o.name)]);
        if (found.length && selectors.has(n.name)) throw new Error(`${path}: the directive ${found[0].className} on the component <${n.name}> is not supported in a release build yet`);
        const consumed = new Set<string>();
        const directives = found.map((d) => {
          if (d.structural) throw new Error(`${path}: the structural directive ${d.className} without its template (*) is not supported in a release build yet`);
          return directiveUse(d, n, loops, consumed);
        });
        for (const i of n.inputs) {
          if (i === switched || consumed.has(i.name) || i.type === ng.BindingType.Class || (isList && i.name === 'itemTemplateSelector') || (link && ROUTER_LINK_INPUTS.has(i.name))) continue;
          at(i.sourceSpan);
          if (hosted?.inputs.has(i.name) && (i.type === ng.BindingType.Property || i.type === ng.BindingType.TwoWay)) {
            compAttrs.push({ name: i.name, method: expr(code(i.value, loops), loops, false) });
            continue;
          }
          // `[style.fontSize.px]`: the renderer's setStyle, `view.style[name] = value`, the unit appended to a value that is there.
          if (i.type === ng.BindingType.Style && i.name !== 'style' && !selectors.has(n.name)) {
            const v = code(i.value, loops);
            attrs.push({ name: i.name, method: expr(i.unit ? `((${v}) == null ? (${v}) : \`\${${v}}${i.unit}\`)` : v, loops, true) });
            continue;
          }
          // `[attr.name]`: the renderer's setAttribute, which on a NativeScript view sets the property of that name.
          if (i.type === ng.BindingType.Attribute && !selectors.has(n.name)) {
            attrs.push({ name: i.name, method: expr(code(i.value, loops), loops, true) });
            continue;
          }
          if (i.type !== ng.BindingType.Property && i.type !== ng.BindingType.TwoWay) throw new Error(`${path}: the [${ng.BindingType[i.type].toLowerCase()}.${i.name}] binding is not supported in a release build yet`);
          // `[text]="person()?.name"`: the view takes undefined where the chain stops, as the renderer passes it, whatever the type says.
          const root = i.value instanceof ng.ASTWithSource ? i.value.ast : i.value;
          const chained = i.type === ng.BindingType.Property && !selectors.has(n.name) && (root instanceof ng.SafePropertyRead || root instanceof ng.SafeKeyedRead || root instanceof ng.SafeCall);
          attrs.push({ name: i.name, method: expr(code(i.value, loops), loops, chained) });
        }
        for (const o of n.outputs) {
          at(o.sourceSpan);
          if (hosted?.outputs.has(o.name)) {
            compEvents.push({ name: o.name, method: handler(code(o.handler, loops), loops, true), payload: true });
            continue;
          }
          events.push({ name: o.name, method: handler(code(o.handler, loops), loops, selectors.has(n.name)), ...(selectors.has(n.name) ? { payload: true } : {}) });
        }
        const component = selectors.get(n.name);
        const refs = n.references.map((r) => r.name);
        if (component) {
          const hooks = queryHooks(refs, component, null, loops);
          out.push({ kind: 'component', name: component, props: attrs, events, ...(hooks.length ? { queries: hooks } : {}) }, ...nodes(n.children, loops));
          continue;
        }
        if (n.name === 'page-router-outlet') { out.push({ kind: 'element', tag: 'Frame', attrs: [{ name: 'router', value: n.attributes.find((a) => a.name === 'name')?.value ?? 'primary' }], events: [], children: [] }); continue; }
        const tag = elementOf(n.name);
        if (!tag) throw new Error(`${path}: <${n.name}> is not a @nativescript/core element the release build knows`);
        const sections = isList && isSectioned(n);
        const hooks = hosted ? [] : queryHooks(refs, null, tag, loops);
        const compHooks = hosted ? queryHooks(refs, hosted.name, tag, loops) : [];
        const hostedChildren: TNode[] = hosted ? [{ kind: 'component', name: hosted.name, props: compAttrs, events: compEvents, ...(compHooks.length ? { queries: compHooks } : {}) }] : [];
        const children = () => (isList ? listTemplates(n, attrs, loops) : [...hostedChildren, ...nodes(n.children, loops)]);
        // A static query is resolved when the template's views are made, before ngOnInit: ngOnInit runs once the last element one names is.
        const statics = hooks.length || compHooks.length ? queries.filter((q) => q.static && q.ref && refs.includes(q.ref) && staticRefs.has(q.ref)) : [];
        for (const q of statics) staticQueries.delete(q);
        const late = statics.length > 0 && staticQueries.size === 0;
        out.push({ kind: 'element', tag, attrs, events, children: switched ? switching(n, switched.value, loops, children) : children(), ...(sections ? { sections } : {}), ...(hooks.length ? { queries: hooks } : {}), ...(late ? { init: true } : {}), ...(directives.length ? { directives } : {}) });
        if (late) lateInit = true;
        continue;
      }
      if (n instanceof ng.TmplAstIfBlock) {
        out.push({ kind: 'if', branches: n.branches.map((b) => {
          at(b.startSourceSpan);
          // `@if (x; as y)`: y is the condition's value in the branch.
          const alias = (b as ng.TmplAstIfBlockBranch & { expressionAlias?: ng.TmplAstVariable | null }).expressionAlias;
          // The condition is read before its alias exists: `@if (person(); as person)` names the value of the `person` it reads.
          const cond = b.expression ? test(code(b.expression, loops), loops) : null;
          if (alias && b.expression) aliases.set(alias.name, rewrite(clean(code(b.expression, loops)), local(loops)));
          const branch = { cond, body: nodes(b.children, loops) };
          if (alias) aliases.delete(alias.name);
          return branch;
        }) });
        continue;
      }
      if (n instanceof ng.TmplAstForLoopBlock) {
        at(n.startSourceSpan);
        const item = n.item.name;
        // The index is a parameter of its own: nested loops each have a `$index`.
        const index = `$i${loops.length}`;
        const items = expr(code(n.expression, loops), loops);
        const count = `this.${items}(${args(loops)}).length`;
        const context: Record<string, string> = { $index: index, $count: count, $first: `(${index} === 0)`, $last: `(${index} === ${count} - 1)`, $even: `(${index} % 2 === 0)`, $odd: `(${index} % 2 !== 0)` };
        const names: Record<string, string> = {};
        for (const v of n.contextVariables) names[v.name] = context[v.value];
        const loop: Loop = { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0`, names };
        const inner = [...loops, loop];
        out.push({ kind: 'for', items, key: expr(sourceOf(n.trackBy), inner), item, index, body: nodes(n.children, inner) });
        continue;
      }
      if (n instanceof ng.TmplAstTemplate && n.templateAttrs.some((a) => a.name === 'tabItem')) {
        out.push(tabItem(n, loops));
        continue;
      }
      if (n instanceof ng.TmplAstTemplate && n.templateAttrs.some((a) => a.name === 'pagerItem')) {
        out.push({ kind: 'element', tag: 'PagerItem', attrs: [], events: [], children: nodes(n.children, loops) });
        continue;
      }
      if (n instanceof ng.TmplAstTemplate) {
        out.push(...structural(n, loops));
        continue;
      }
      if (n instanceof ng.TmplAstSwitchBlock) {
        const subject = code(n.expression, loops);
        at(n.startSourceSpan);
        const branches = n.groups.map((g) => {
          const tests = g.cases.filter((c) => c.expression).map((c) => `(${subject}) === (${code(c.expression!, loops)})`);
          return { cond: tests.length ? expr(tests.join(' || '), loops) : null, body: nodes(g.children, loops) };
        });
        // The default group renders when no case matches, wherever it is written.
        out.push({ kind: 'if', branches: [...branches.filter((b) => b.cond), ...branches.filter((b) => !b.cond)] });
        continue;
      }
      // Text in an element is its `text` (@nativescript/angular's renderer sets it on the parent): a template's text nodes bind there.
      if (n instanceof ng.TmplAstText || n instanceof ng.TmplAstBoundText || n instanceof ng.TmplAstContent) continue;
      throw new Error(`${path}: ${n.constructor.name} in a template is not supported in a release build yet`);
    }
    for (const name of declared) aliases.delete(name);
    return out;
  };

  /**
   * `<ListView [items]>` with `<ng-template let-item let-i="index" nsTemplateKey="…">` children, as
   * @nativescript/angular's ListViewComponent renders them: the first template is also the default, and
   * `[itemTemplateSelector]` is called with `(item, index, items)`. A `<Pager>` (@nstudio/nativescript-ui-pager's
   * PagerComponent) is the same with `pagerTemplateKey`.
   */
  const listTemplates = (n: ng.TmplAstElement, attrs: Attr[], loops: Loop[]): TNode[] => {
    const host = elementOf(n.name) ?? n.name;
    const keyName = host === 'Pager' ? 'pagerTemplateKey' : 'nsTemplateKey';
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${path}: <${host}> needs [items]`);
    const list = `this.${items.method}(${args(loops)})`;
    // A sectioned ListView's items are sections (`{ title, items }`); a row's item is one of a section's.
    const sectioned = isSectioned(n);
    const rows = sectioned ? `${list}[0].items` : list;
    const selector = n.inputs.find((i) => i.name === 'itemTemplateSelector');
    if (selector) {
      const m = `$b${next++}`;
      const p = [params(loops), `$item = ${rows}[0]`, '$index = 0'].filter(Boolean).join(', ');
      // Called as core calls it, with (item, index, items): a method of the component that declares fewer takes the ones it declares.
      const name = sourceOf(selector.value).trim();
      const member = cls.members.find((x) => (ts.isMethodDeclaration(x) || ts.isPropertyDeclaration(x)) && x.name.getText() === name);
      // A method, or a property holding an arrow (`rowTemplate = (row) => …`): the parameters it declares.
      const fn = member && ts.isMethodDeclaration(member) ? member : member && ts.isPropertyDeclaration(member) && member.initializer && (ts.isArrowFunction(member.initializer) || ts.isFunctionExpression(member.initializer)) ? member.initializer : undefined;
      const given = ['$item', '$index', list].slice(0, fn ? fn.parameters.length : 3);
      at(selector.sourceSpan);
      add(`  ${m}(${p}): string { return ${rewrite(clean(sourceOf(selector.value)), local(loops))}(${given.join(', ')}); }`);
      attrs.push({ name: 'itemTemplateSelector', method: m });
    }
    const out: TNode[] = [];
    for (const t of n.children) {
      if (t instanceof ng.TmplAstText) continue;
      if (!(t instanceof ng.TmplAstTemplate) || t.tagName !== 'ng-template') throw new Error(`${path}: a ${host}'s children are <ng-template let-item> item templates`);
      const bound = t.inputs.find((i) => i.name === keyName);
      const key = t.attributes.find((a) => a.name === keyName)?.value ?? (bound ? literalKey(sourceOf(bound.value), path) : out.length ? null : 'default');
      if (key === null) throw new Error(`${path}: a ${host}'s second and later <ng-template>s need a ${keyName}`);
      if (t.inputs.some((i) => i.name === 'nsTemplateKeys')) throw new Error(`${path}: nsTemplateKeys is not supported in a release build yet`);
      const named = (v: string) => t.variables.find((x) => (x.value || '$implicit') === v)?.name;
      const item = named('$implicit') ?? named('item') ?? `$item${loops.length}`;
      const index = named('index') ?? `$i${loops.length}`;
      const names: Record<string, string> = {};
      for (const v of t.variables) {
        const what = v.value || '$implicit';
        if ((what === '$implicit' || what === 'item') && v.name !== item) names[v.name] = item;
        else if (what === 'even') names[v.name] = `(${index} % 2 === 0)`;
        else if (what === 'odd') names[v.name] = `(${index} % 2 !== 0)`;
        else if (!['$implicit', 'item', 'index'].includes(what)) throw new Error(`${path}: a ${host} template's "${what}" is not part of its context`);
      }
      // Keyed templates tell apart the kinds of row a list mixes (`Person | typeof BYLINE_ROW`): each reads its row
      // untyped, as Angular types an ng-template's context.
      const keyed = n.children.filter((c) => c instanceof ng.TmplAstTemplate).length > 1;
      const loop: Loop = { item, index, param: `${item}${keyed ? ': any' : ''} = ${rows}[0], ${index} = 0`, names };
      out.push({ kind: 'template', key, item, index, body: nodes(t.children, [...loops, loop]) });
    }
    const header = attrs.findIndex((a) => a.name === 'stickyHeaderTemplate');
    if (header >= 0) {
      attrs.splice(header, 1);
      if (sectioned) out.push(stickyHeader(n, list, loops));
    }
    return out;
  };

  const isSectioned = (n: ng.TmplAstElement) =>
    n.inputs.some((i) => i.name === 'sectioned' && sourceOf(i.value).trim() === 'true') || n.attributes.some((a) => a.name === 'sectioned' && a.value === 'true');

  /**
   * `[stickyHeaderTemplate]` naming a field that holds NativeScript XML (core parses it with `Builder.parse`
   * and binds it to the section): the XML as a header template whose `{{ path }}` bindings read the section.
   */
  const stickyHeader = (n: ng.TmplAstElement, list: string, loops: Loop[]): TNode => {
    const input = n.inputs.find((i) => i.name === 'stickyHeaderTemplate');
    const name = input && sourceOf(input.value).trim().replace(/^this\./, '');
    const field = name ? cls.members.find((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && m.name.getText() === name) : undefined;
    const init = field?.initializer;
    const xml = n.attributes.find((a) => a.name === 'stickyHeaderTemplate')?.value
      ?? (init && (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) ? init.text : undefined);
    if (xml === undefined) throw new Error(`${path}: a ListView's stickyHeaderTemplate is supported as a string of XML (a field initialized with a literal) in a release build`);
    const section = `$section${loops.length}`;
    const read = (e: string) => {
      if (!/^\s*[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*\s*$/.test(e)) throw new Error(`${path}: the sticky header binding {{${e}}} is not supported in a release build yet (a property path is)`);
      return `${section}.${e.trim()}`;
    };
    const bound = xml.replace(/([\w.-]+)\s*=\s*(['"])([^'"]*\{\{[^'"]*)\2/g, (_m, attr: string, _q: string, value: string) => {
      const parts = value.split(/\{\{(.*?)\}\}/);
      const whole = parts.length === 3 && !parts[0] && !parts[2];
      const code = whole ? read(parts[1]) : '`' + parts.map((p, i) => (i % 2 ? '${' + read(p) + '}' : p.replace(/[`\\$]/g, (x) => '\\' + x))).join('') + '`';
      return `[${attr}]="${code}"`;
    });
    // XML closes any element with `/>`; Angular's parser only void and custom ones.
    const closed = bound.replace(/<([A-Za-z][\w.-]*)((?:\s+[^<>]*?)?)\s*\/>/g, '<$1$2></$1>');
    if (bound.includes('{{')) throw new Error(`${path}: a stickyHeaderTemplate binds attributes only in a release build`);
    const parsed = ng.parseTemplate(closed, path + '.stickyHeader.html', { preserveWhitespaces: false });
    // Its spans are the header string's, not the template's: its methods keep the template line of the list.
    const saved = here;
    const first = methods.length;
    if (parsed.errors?.length) throw new Error(`${path}: stickyHeaderTemplate: ${parsed.errors[0]}`);
    const loop: Loop = { item: section, index: `$s${loops.length}`, param: `${section} = ${list}[0], $s${loops.length} = 0` };
    const body = nodes(parsed.nodes, [...loops, loop]);
    for (let k = first; k < methods.length; k++) if (saved === null) located.delete(k); else located.set(k, saved);
    here = saved;
    if (body.length !== 1 || body[0].kind !== 'element') throw new Error(`${path}: a stickyHeaderTemplate needs exactly one root element`);
    return { kind: 'template', key: '$header', item: section, index: loop.index, body, header: true, xml };
  };

  /** `*tabItem="{ title, iconSource, … }"` (TabViewItemDirective): a TabViewItem with those properties around the element. */
  const tabItem = (t: ng.TmplAstTemplate, loops: Loop[]): TNode => {
    at(t.startSourceSpan);
    const bound = t.templateAttrs.find((a): a is ng.TmplAstBoundAttribute => a instanceof ng.TmplAstBoundAttribute && a.name === 'tabItem');
    const root = bound && (bound.value instanceof ng.ASTWithSource ? bound.value.ast : bound.value);
    if (!(root instanceof ng.LiteralMap)) throw new Error(`${path}: *tabItem takes an object literal in a release build`);
    const attrs: Attr[] = root.keys.map((k, i) => ({ name: k.key, method: expr(template.slice(root.values[i].sourceSpan.start, root.values[i].sourceSpan.end), loops) }));
    return { kind: 'element', tag: 'TabViewItem', attrs, events: [], children: nodes(t.children, loops) };
  };

  /**
   * `<ng-container>`, a comment in Angular's view: its children join its parent, and its attributes only select
   * directives. `[ngSwitch]` and `[ngTemplateOutlet]` are the directives it takes; the outlet's view follows the
   * container's own children, as a ViewContainerRef inserts at its anchor.
   */
  const container = (n: ng.TmplAstElement, loops: Loop[]): TNode[] => {
    if (n.outputs.length) throw new Error(`${path}: (${n.outputs[0].name}) on <ng-container> is not supported in a release build yet`);
    const bound = new Map(n.inputs.map((i) => [i.name, i] as const));
    for (const name of bound.keys()) {
      if (!['ngSwitch', 'ngTemplateOutlet', 'ngTemplateOutletContext', 'formGroup'].includes(name)) throw new Error(`${path}: [${name}] on <ng-container> is not supported in a release build yet`);
    }
    if (bound.has('ngTemplateOutletContext') && !bound.has('ngTemplateOutlet')) throw new Error(`${path}: [ngTemplateOutletContext] without [ngTemplateOutlet]`);
    const children = () => nodes(n.children, loops);
    const own = bound.has('ngSwitch') ? switching(n, bound.get('ngSwitch')!.value, loops, children) : children();
    const outletted = bound.has('ngTemplateOutlet') ? outlet(bound.get('ngTemplateOutlet')!.value, bound.get('ngTemplateOutletContext')?.value, loops) : [];
    return [...own, ...outletted];
  };

  /** The open `[ngSwitch]`es, innermost last: the method reading each one's value, and its cases' values as written. */
  const switches: { subject: string; loops: Loop[]; cases: ng.AST[] }[] = [];
  /** Renders a `[ngSwitch]` element's children, its `ngSwitchCase`s comparing with `===` and `ngSwitchDefault` rendering when none matches. */
  const switching = <T>(n: ng.TmplAstElement, value: ng.AST, loops: Loop[], render: () => T): T => {
    const cases: ng.AST[] = [];
    const scan = (list: ng.TmplAstNode[], deeper: boolean) => {
      for (const c of list) {
        if (c instanceof ng.TmplAstElement && c.inputs.some((i) => i.name === 'ngSwitch')) continue;
        if (c instanceof ng.TmplAstTemplate) {
          const given = [...c.templateAttrs, ...c.inputs].find((a): a is ng.TmplAstBoundAttribute => a instanceof ng.TmplAstBoundAttribute && a.name === 'ngSwitchCase');
          if (given) {
            if (deeper) throw new Error(`${path}: an ngSwitchCase inside a loop of its [ngSwitch] is not supported in a release build yet`);
            cases.push(given.value);
          }
          const loop = [...c.templateAttrs, ...c.inputs].some((a) => a.name === 'ngForOf');
          scan(c.children, deeper || loop);
          continue;
        }
        if (c instanceof ng.TmplAstForLoopBlock) { scan(c.children, true); continue; }
        if (c instanceof ng.TmplAstElement) scan(c.children, deeper || canonical(c.name) === 'ListView');
        else if (c instanceof ng.TmplAstIfBlock) for (const b of c.branches) scan(b.children, deeper);
        else if (c instanceof ng.TmplAstSwitchBlock) for (const g of c.groups) scan(g.children, deeper);
      }
    };
    scan(n.children, false);
    switches.push({ subject: expr(code(value, loops), loops), loops, cases });
    try { return render(); } finally { switches.pop(); }
  };

  /** `*ngSwitchCase="v"` and `*ngSwitchDefault`: an `if` on the nearest `[ngSwitch]` above it. */
  const switchCase = (t: ng.TmplAstTemplate, given: ng.TmplAstBoundAttribute | undefined, loops: Loop[]): TNode[] => {
    const sw = switches.at(-1);
    if (!sw) throw new Error(`${path}: ${given ? 'ngSwitchCase' : 'ngSwitchDefault'} outside an element with [ngSwitch]`);
    const subject = `this.${sw.subject}(${args(sw.loops)})`;
    const cond = given
      ? expr(`(${subject}) === (${code(given.value, loops)})`, loops)
      : expr(sw.cases.length ? `!(${sw.cases.map((c) => `(${subject}) === (${code(c, sw.loops)})`).join(' || ')})` : 'true', loops);
    return [{ kind: 'if', branches: [{ cond, body: nodes(t.children, loops) }] }];
  };

  /**
   * `[ngTemplateOutlet]` (NgTemplateOutlet): the `<ng-template #name>` it names, rendered here with its `let-` variables
   * read from the context's properties (`let-x` from `$implicit`) whenever a binding reads them, as its view's context is
   * the latest one given. A template chosen by a condition (`a ? one : two`) is an `if`; null renders nothing.
   */
  const outlet = (tpl: ng.AST, context: ng.AST | undefined, loops: Loop[]): TNode[] => {
    const root = tpl instanceof ng.ASTWithSource ? tpl.ast : tpl;
    const given = context instanceof ng.ASTWithSource ? context.ast : context;
    // A context written as an object literal gives each variable its property's expression.
    const fields = given instanceof ng.LiteralMap ? new Map(given.keys.map((k, i) => [k.key, given.values[i]] as const)) : null;
    const ctx = context && !fields ? rewrite(clean(code(context, loops)), local(loops)) : null;
    const read = (key: string) => {
      if (fields) {
        const v = fields.get(key);
        return v ? `(${rewrite(clean(code(v, loops)), local(loops))})` : 'undefined';
      }
      return ctx === null ? 'undefined' : `(${ctx})?.${/^[A-Za-z_$][\w$]*$/.test(key) ? key : `[${JSON.stringify(key)}]`}`;
    };
    const render = (ast: ng.AST): TNode[] => {
      if (ast instanceof ng.LiteralPrimitive && ast.value == null) return [];
      if (ast instanceof ng.Conditional) return [{ kind: 'if', branches: [{ cond: test(template.slice(ast.condition.sourceSpan.start, ast.condition.sourceSpan.end), loops), body: render(ast.trueExp) }, { cond: null, body: render(ast.falseExp) }] }];
      const name = ast instanceof ng.PropertyRead && ast.receiver instanceof ng.ImplicitReceiver ? ast.name : null;
      const t = name !== null ? references.get(name) : undefined;
      if (!t || t.tagName !== 'ng-template') throw new Error(`${path}: ngTemplateOutlet renders an <ng-template #name> of this template in a release build (given ${template.slice(ast.sourceSpan.start, ast.sourceSpan.end)})`);
      const saved = new Map(t.variables.map((v) => [v.name, aliases.get(v.name)] as const));
      for (const v of t.variables) aliases.set(v.name, read(v.value || '$implicit'));
      try { return nodes(t.children, loops); } finally {
        for (const [k, v] of saved) if (v === undefined) aliases.delete(k); else aliases.set(k, v);
      }
    };
    return render(root);
  };

  /**
   * `nsRouterLink` (@nativescript/angular's NSRouterLink) on any element: a tap handler navigating with its commands,
   * a single command as a one-command array, relative to the component's route unless `relativeTo` is given. The
   * route is the component's own, read when it is constructed: the router's current route changes as pages are made.
   */
  let routed = false;
  const routerLink = (n: ng.TmplAstElement, loops: Loop[]): Event | null => {
    const bound = new Map(n.inputs.map((i) => [i.name, i] as const));
    const fixed = new Map(n.attributes.map((a) => [a.name, a.value] as const));
    if (bound.has('nsRouterLinkActive') || fixed.has('nsRouterLinkActive')) throw new Error(`${path}: nsRouterLinkActive is not supported in a release build yet`);
    if (!bound.has('nsRouterLink') && !fixed.has('nsRouterLink')) return null;
    at(bound.get('nsRouterLink')?.sourceSpan ?? n.attributes.find((a) => a.name === 'nsRouterLink')?.sourceSpan);
    for (const name of ROUTER_LINK_INPUTS) {
      if (!ROUTER_LINK_SUPPORTED.has(name) && (bound.has(name) || fixed.has(name))) throw new Error(`${path}: nsRouterLink's ${name} is not supported in a release build yet`);
    }
    const value = (name: string) => (bound.has(name) ? `(${code(bound.get(name)!.value, loops)})` : fixed.has(name) ? JSON.stringify(fixed.get(name)) : null);
    routed = true;
    const body: string[] = [];
    const given = bound.get('nsRouterLink');
    const root = given && (given.value instanceof ng.ASTWithSource ? given.value.ast : given.value);
    let commands: string;
    if (root instanceof ng.LiteralArray) commands = code(given!.value, loops);
    else if (!given) commands = `[${value('nsRouterLink')}]`;
    else {
      body.push(`const $commands: any = ${value('nsRouterLink')}`, 'if ($commands == null) return');
      commands = 'Array.isArray($commands) ? $commands : [$commands]';
    }
    const extras = [`relativeTo: ${value('relativeTo') ?? 'this.$route'}`];
    const transition = value('pageTransition');
    const duration = value('pageTransitionDuration');
    const constant = (name: string): unknown => {
      if (fixed.has(name)) return fixed.get(name);
      const v = bound.get(name)?.value;
      const ast = v instanceof ng.ASTWithSource ? v.ast : v;
      return ast instanceof ng.LiteralPrimitive && ast.value !== undefined ? ast.value : undefined;
    };
    // NSRouterLink.getTransition: a boolean is `animated`; 'none' and 'false' turn animation off; another string names the transition.
    const known = constant('pageTransition');
    if (!duration && (typeof known === 'boolean' || typeof known === 'string')) {
      if (known === false || known === 'none' || known === 'false') extras.push('animated: false');
      else if (typeof known === 'string') extras.push(`transition: { name: ${JSON.stringify(known)} }`);
    } else if (transition || duration) {
      body.push(
        `const $given: any = ${transition ?? 'true'}`,
        'let $animated = true',
        'let $transition: any = undefined',
        `if (typeof $given === 'boolean') { $animated = $given; } else if (typeof $given === 'string') { if ($given === 'none' || $given === 'false') { $animated = false; } else { $transition = { name: $given }; } } else { $transition = $given; }`,
      );
      if (duration) body.push(`const $duration = +${duration}`, 'if (!isNaN($duration)) { $transition = $transition ?? {}; $transition.duration = $duration; }');
      extras.push('animated: $animated', 'transition: $transition');
    }
    const clear = value('clearHistory');
    const clearing = constant('clearHistory');
    if (clearing !== undefined) extras.push(`clearHistory: ${clearing === true || clearing === 'true'}`);
    else if (clear) {
      body.push(`const $clear: any = ${clear}`);
      extras.push(`clearHistory: $clear === true || $clear === 'true'`);
    }
    body.push(`this.$router.navigate(${commands}, { ${extras.join(', ')} })`);
    return { name: 'tap', method: handler(body.join('; '), loops) };
  };

  /** `*ngIf` (with `else` and `as`) and `*ngFor` (with `trackBy`, `index`, `even`, `odd`) on an element, `<ng-container>` or `<ng-template>`. */
  const structural = (t: ng.TmplAstTemplate, loops: Loop[]): TNode[] => {
    at(t.startSourceSpan);
    // `*ngIf` binds the directive through templateAttrs (the template's inputs are its element's); `<ng-template [ngIf]>` through inputs.
    const directive = t.tagName === 'ng-template' ? [...t.templateAttrs, ...t.inputs] : t.templateAttrs;
    const bound = (name: string) => directive.find((a): a is ng.TmplAstBoundAttribute => a instanceof ng.TmplAstBoundAttribute && a.name === name);
    const ngIf = bound('ngIf');
    const ngForOf = bound('ngForOf');
    const outletOf = bound('ngTemplateOutlet');
    if (outletOf) {
      for (const a of directive) if (!['ngTemplateOutlet', 'ngTemplateOutletContext'].includes(a.name)) throw new Error(`${path}: *ngTemplateOutlet's ${a.name} is not supported in a release build yet`);
      // The element `*ngTemplateOutlet` is written on is the directive's own template, which it never renders.
      return outlet(outletOf.value, bound('ngTemplateOutletContext')?.value, loops);
    }
    const caseOf = bound('ngSwitchCase');
    if (caseOf || directive.some((a) => a.name === 'ngSwitchDefault')) {
      if (directive.length !== 1) throw new Error(`${path}: ${directive.map((a) => a.name).join(', ')} on one template is not supported in a release build yet`);
      return switchCase(t, caseOf, loops);
    }
    const structuralDirective = matched(t.tagName ?? 'ng-template', [], directive.map((a) => a.name)).find((d) => d.structural);
    if (structuralDirective) throw new Error(`${path}: the structural directive ${structuralDirective.className} (TemplateRef, ViewContainerRef) is not supported in a release build yet`);
    if (!ngIf && !ngForOf) {
      // An `<ng-template #name>` renders only where an `else` names it.
      if (t.tagName === 'ng-template' && t.references.length && !directive.length) return [];
      throw new Error(`${path}: <${t.tagName}> with ${directive.map((a) => a.name).join(', ') || 'no directive'} is not supported in a release build yet`);
    }
    if (ngIf) {
      for (const a of directive) if (!['ngIf', 'ngIfElse'].includes(a.name)) throw new Error(`${path}: *ngIf's ${a.name} is not supported in a release build yet`);
      const condition = code(ngIf.value, loops);
      const elseName = bound('ngIfElse');
      const otherwise = elseName ? references.get(sourceOf(elseName.value).trim()) : undefined;
      if (elseName && !otherwise) throw new Error(`${path}: *ngIf's else names no <ng-template #${sourceOf(elseName.value).trim()}>`);
      const renamed = t.variables.map((v) => {
        if (v.value !== 'ngIf') throw new Error(`${path}: *ngIf's ${v.value} is not supported in a release build yet`);
        return v.name;
      });
      const cond = test(condition, loops);
      for (const v of renamed) aliases.set(v, rewrite(clean(condition), local(loops)));
      const body = nodes(t.children, loops);
      for (const v of renamed) aliases.delete(v);
      return [{ kind: 'if', branches: [{ cond, body }, ...(otherwise ? [{ cond: null, body: nodes(otherwise.children, loops) }] : [])] }];
    }
    for (const a of directive) if (!['ngFor', 'ngForOf', 'ngForTrackBy'].includes(a.name)) throw new Error(`${path}: *ngFor's ${a.name} is not supported in a release build yet`);
    const item = t.variables.find((v) => (v.value || '$implicit') === '$implicit')?.name ?? `$item${loops.length}`;
    const index = t.variables.find((v) => v.value === 'index')?.name ?? `$i${loops.length}`;
    const names: Record<string, string> = {};
    for (const v of t.variables) {
      if (v.name === item || v.name === index) continue;
      if (v.value === 'even') names[v.name] = `(${index} % 2 === 0)`;
      else if (v.value === 'odd') names[v.name] = `(${index} % 2 !== 0)`;
      else throw new Error(`${path}: *ngFor's ${v.value} is not supported in a release build yet`);
    }
    // NgForOf renders no rows for null, which an async pipe gives before its first value.
    const source = code(ngForOf!.value, loops);
    const items = expr(source === sourceOf(ngForOf!.value) ? source : `(${source}) ?? []`, loops);
    const loop: Loop = { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0`, names };
    const inner = [...loops, loop];
    // NgForOf keeps rows by identity, or by what its trackBy function returns for (index, item).
    const trackBy = bound('ngForTrackBy');
    const key = trackBy ? expr(`(${sourceOf(trackBy.value)})(${index}, ${item})`, inner) : null;
    return [{ kind: 'for', items, key, item, index, body: nodes(t.children, inner) }];
  };

  const parsed = ng.parseTemplate(template, path + '.html', { preserveWhitespaces: false });
  if (parsed.errors?.length) throw new Error(`${path}: ${parsed.errors[0]}`);
  const references = new Map<string, ng.TmplAstTemplate>();
  const findReferences = (list: ng.TmplAstNode[]) => {
    for (const n of list) {
      if (n instanceof ng.TmplAstTemplate) for (const r of n.references) references.set(r.name, n);
      if (n instanceof ng.TmplAstElement) {
        for (const r of n.references) {
          if (!members.has(r.name) && !scope.names.has(r.name) && new RegExp(`(?<!#)\\b${r.name}\\b`).test(template)) {
            const field = `$ref_${r.name}`;
            scope.names.set(r.name, `this.${field}`);
            methods.push(`  ${field}: any;`);
            queries.push({ field, ref: r.name, read: 'any', static: false, many: false });
          }
        }
      }
      if (n instanceof ng.TmplAstElement || n instanceof ng.TmplAstTemplate || n instanceof ng.TmplAstForLoopBlock) findReferences(n.children);
      if (n instanceof ng.TmplAstIfBlock) for (const b of n.branches) findReferences(b.children);
      if (n instanceof ng.TmplAstForLoopBlock && n.empty) findReferences(n.empty.children);
      if (n instanceof ng.TmplAstSwitchBlock) for (const g of n.groups) findReferences(g.children);
    }
  };
  findReferences(parsed.nodes);
  const ownElements = (list: ng.TmplAstNode[]) => {
    for (const n of list) {
      if (!(n instanceof ng.TmplAstElement)) continue;
      for (const r of n.references) staticRefs.add(r.name);
      ownElements(n.children);
    }
  };
  ownElements(parsed.nodes);
  for (const q of queries) if (q.static && q.ref && staticRefs.has(q.ref)) staticQueries.add(q);
  const tree = nodes(parsed.nodes, []);

  // The component's source, with the template's methods added to its class and the event type imported.
  const end = cls.members.end;
  // ngOnChanges: the parent's bindings record each input they set (`$change`), and one check after them calls the hook
  // with what changed since it last ran, the first time before ngOnInit.
  const onChanges = cls.members.find((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && m.name.getText() === 'ngOnChanges');
  if (onChanges) {
    if (onChanges.parameters.length > 1) throw new Error(`${path}: ngOnChanges takes one parameter`);
    methods.push(...changesMembers(onChanges.parameters.length > 0));
  }
  const cached = [...sites.values()].some((x) => x.cache);
  let imports = `import { ${cached ? 'PurePipeCache as $PurePipeCache, ' : ''}type EventData as $EventData } from '@nativescript/release';\n`;
  if (usesElementRef) imports += `import { ElementRef as $ElementRef } from '@angular/core';\n`;
  if (onChanges) {
    imports += `import { SimpleChange as $SimpleChange } from '@angular/core';\n`;
    if (!importsAs(sf, 'signal', '@angular/core')) {
      if (declares(sf, 'signal')) throw new Error(`${path}: ngOnChanges needs Angular's signal, which this file's own "signal" hides`);
      imports += `import { signal } from '@angular/core';\n`;
    }
  }
  if (queries.some((q) => q.many)) {
    usesRuntime = true;
    const from = options.runtimeModule ?? RUNTIME;
    imports += `import { QueryList as $QueryList } from '${isAbsolute(from) ? relativeSpecifier(dirname(path), from) : from}';\n`;
  }
  for (const [from, names] of imported) {
    const spec = isAbsolute(from) ? relativeSpecifier(dirname(path), from) : from;
    imports += `import { ${[...names].map(([c, a]) => `${c} as ${a}`).join(', ')} } from '${spec}';\n`;
  }
  if (routed) {
    // The translator knows `inject` by its name, and a framework token through any alias.
    if (!importsAs(sf, 'inject', '@angular/core')) {
      if (declares(sf, 'inject')) throw new Error(`${path}: nsRouterLink needs Angular's inject, which this file's own "inject" hides`);
      imports += `import { inject } from '@angular/core';\n`;
    }
    imports += `import { ActivatedRoute as $ActivatedRoute } from '@angular/router';\nimport { RouterExtensions as $RouterExtensions } from '@nativescript/angular';\n`;
    methods.push('  readonly $router = inject($RouterExtensions);', '  readonly $route = inject($ActivatedRoute);');
  }
  const head = imports + text.slice(0, end) + '\n';
  const source = head + methods.join('\n') + '\n' + text.slice(end);
  // Each template method's lines in the virtual file, at its binding's line in the template it was written in.
  const inlineAt = templateUrl ? 0 : written.indexOf(template);
  const templateFile = templateUrl ? join(dirname(path), templateUrl) : path;
  const firstLine = inlineAt > 0 ? written.slice(0, inlineAt).split('\n').length - 1 : 0;
  const lines: [number, number][] = [];
  let line = head.split('\n').length - 1;
  methods.forEach((m, k) => {
    const span = m.split('\n').length;
    const at = located.get(k);
    if (at !== undefined && inlineAt >= 0) for (let j = 0; j < span; j++) lines.push([line + j, firstLine + at + 1]);
    line += span;
  });
  const { styles, scope: styleScope } = angularStyles(path, prop);
  const scoped = styleScope ? scopeTemplate(tree, styleScope.content).map((n) => (n.kind === 'element' ? { ...n, attrs: [...n.attrs, { name: styleScope.host, value: '' }] } : n)) : tree;
  return { name: cls.name.text, file: path.replace(/\.ts$/, '.release.ts'), source, ...(usesRuntime ? { usesRuntime } : {}), props, optional, outputs, template: scoped, selector, styles, ...(init ? { init: 'ngOnInit' } : {}), ...(init && lateInit ? { lateInit } : {}), ...(hook('ngAfterViewInit') ? { afterViewInit: 'ngAfterViewInit' } : {}), ...(hook('ngOnDestroy') ? { destroy: 'ngOnDestroy' } : {}), ...(onChanges ? { changes: true } : {}), ...(classic?.host ? { host: '$host' } : {}), ...(classic?.setters.size ? { setters: [...classic.setters] } : {}), ...(Object.keys(inputAliases).length ? { propAliases: inputAliases } : {}), ...(lines.length ? { templateLines: { file: templateFile, lines } } : {}) } as AngularComponent;
}

/**
 * The component's `styles`, `styleUrl` and `styleUrls`, as NativeScript Angular adds them: Sass compiled by the app's own
 * `sass`, and, unless `encapsulation: ViewEncapsulation.None`, each selector limited to the component's elements
 * (`_ngcontent-<id>`, which its renderer sets on each element the component creates) and `:host` to `_nghost-<id>`. The
 * compiled component has no host view of its own: its top-level elements carry the host attribute.
 */
function angularStyles(path: string, prop: (name: string) => ts.Expression | undefined): { styles: ComponentStyle[]; scope: { content: string; host: string } | null } {
  const texts: { css: string; lang: string; from: string }[] = [];
  const literal = (e: ts.Expression): string | null => (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e) ? e.text : null);
  const inline = prop('styles');
  for (const e of inline ? (ts.isArrayLiteralExpression(inline) ? [...inline.elements] : [inline]) : []) {
    const css = literal(e);
    if (css === null) throw new Error(`${path}: styles must be string literals in a compiled release`);
    texts.push({ css, lang: 'css', from: path });
  }
  const urls = [prop('styleUrl'), ...(() => { const u = prop('styleUrls'); return u && ts.isArrayLiteralExpression(u) ? [...u.elements] : []; })()].filter((e): e is ts.Expression => !!e);
  for (const e of urls) {
    const url = literal(e);
    if (url === null) throw new Error(`${path}: styleUrl must be a string literal in a compiled release`);
    const file = join(dirname(path), url);
    if (!existsSync(file)) throw new Error(`${path}: styleUrl ${url} not found`);
    texts.push({ css: readFileSync(file, 'utf8'), lang: extname(file).slice(1), from: file });
  }
  if (!texts.length) return { styles: [], scope: null };
  const none = prop('encapsulation')?.getText() === 'ViewEncapsulation.None';
  const id = `c${createHash('sha256').update(path).digest('hex').slice(0, 8)}`;
  const styles = texts.map((t, k): ComponentStyle => {
    let css = t.css;
    if (t.lang === 'scss' || t.lang === 'sass') css = (createRequire(path)('sass') as { compileString(s: string, o: object): { css: string } }).compileString(css, { loadPaths: [dirname(t.from)], syntax: t.lang === 'sass' ? 'indented' : 'scss' }).css;
    else if (t.lang !== 'css') throw new Error(`${t.from}: ${t.lang} stylesheets are not supported in a compiled release yet`);
    return { file: `${path}.style${k}.css`, css: none ? css : ng.encapsulateStyle(css, id) };
  });
  return { styles, scope: none ? null : { content: `_ngcontent-${id}`, host: `_nghost-${id}` } };
}

/** Every `BindingPipe` in an expression, those inside another pipe's arguments too. */
function allPipes(node: ng.AST): ng.BindingPipe[] {
  const found: ng.BindingPipe[] = [];
  const visit = (n: unknown) => {
    if (!(n instanceof ng.AST)) return;
    if (n instanceof ng.BindingPipe) found.push(n);
    for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(visit) : visit(v);
  };
  visit(node);
  return found;
}

/** A module specifier for `file` (a .ts path) from a file in `dir`. */
function relativeSpecifier(dir: string, file: string): string {
  const r = relative(dir, file.replace(/\.tsx?$/, ''));
  return r.startsWith('.') ? r : './' + r;
}

/**
 * The `@Pipe` classes of the app's and its libraries' files, by the name templates use: whether each is pure (Angular's
 * default) and what making one takes.
 */
export function angularPipes(files: string[], read: (file: string) => string): Map<string, PipeDecl> {
  const out = new Map<string, PipeDecl>();
  for (const file of files) {
    const text = read(file);
    if (!text.includes('@Pipe')) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const st of sf.statements) {
      if (!ts.isClassDeclaration(st) || !st.name) continue;
      const meta = decorator(st, 'Pipe')?.arguments[0];
      if (!meta || !ts.isObjectLiteralExpression(meta)) continue;
      const get = (k: string) => meta.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === k)?.initializer;
      const name = get('name');
      if (!name || !ts.isStringLiteralLike(name)) throw new Error(`${file}: @Pipe needs a string name in a release build`);
      if (!(ts.getModifiers(st) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) throw new Error(`${file}: the pipe ${st.name.text} is not exported`);
      const pure = get('pure');
      const ctor = st.members.find(ts.isConstructorDeclaration);
      out.set(name.text, {
        className: st.name.text, file, pure: pure?.kind !== ts.SyntaxKind.FalseKeyword,
        ...(ctor?.parameters.length ? { create: true } : {}),
        ...(st.members.some((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'ngOnDestroy') ? { destroy: true } : {}),
      });
    }
  }
  return out;
}

/**
 * What ngOnChanges takes in a component or directive: the template records each input it sets (`$change`), and one
 * check after its inputs' calls `$flushChanges`, which calls the hook with what changed since it last ran.
 */
const changesMembers = (hasParam: boolean) => [
  '  readonly $changed = signal(0);',
  '  readonly $changes = new Map<string, $SimpleChange>();',
  '  readonly $previous = new Map<string, any>();',
  '  $change(name: string, value: any): void { const first = !this.$previous.has(name); this.$changes.set(name, new $SimpleChange(first ? undefined : this.$previous.get(name), value, first)); this.$previous.set(name, value); this.$changed.update((n) => n + 1); }',
  hasParam
    ? '  $flushChanges(): void { if (!this.$changes.size) return; const changes = Object.fromEntries(this.$changes); this.$changes.clear(); this.ngOnChanges(changes); }'
    : '  $flushChanges(): void { if (!this.$changes.size) return; this.$changes.clear(); this.ngOnChanges(); }',
];

/** An app's `@Directive` class as templates use it: what it matches and the members Angular's compiler wires to its host. */
export interface DirectiveDecl {
  className: string;
  file: string;
  selector: string;
  /** Inputs by the name the template binds: the member (a field, or a setter) they set. */
  inputs: Map<string, string>;
  /** `@HostListener('event', ['$event'])` and `host: { '(event)': '…' }`: the statements run with `$event`. */
  listeners: { event: string; code: string }[];
  /** `@HostBinding('prop')` and `host: { '[prop]': '…' }`: the host's property and the expression over the directive. */
  bindings: { prop: string; code: string }[];
  /** Static host attributes (`host: { role: 'x' }`). */
  attributes: { name: string; value: string }[];
  create: boolean;
  hooks: Set<string>;
  /** It injects TemplateRef: a structural directive (`*name`). */
  structural: boolean;
  /** Its members' names, which its host expressions read. */
  members: string[];
}

/** The `@Directive` classes of the app's files. */
export function angularDirectives(files: string[], read: (file: string) => string): DirectiveDecl[] {
  const out: DirectiveDecl[] = [];
  for (const file of files) {
    const text = read(file);
    if (!text.includes('@Directive')) continue;
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const st of sf.statements) {
      if (!ts.isClassDeclaration(st) || !st.name) continue;
      const call = decorator(st, 'Directive');
      const meta = call?.arguments[0];
      if (!call) continue;
      const where = `${file}: the directive ${st.name.text}`;
      if (!meta || !ts.isObjectLiteralExpression(meta)) throw new Error(`${where} needs a selector`);
      const get = (k: string) => meta.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === k)?.initializer;
      const selector = get('selector');
      if (!selector || !ts.isStringLiteralLike(selector)) throw new Error(`${where} needs a string selector in a release build`);
      if (!(ts.getModifiers(st) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) throw new Error(`${where} is not exported`);
      const d: DirectiveDecl = { className: st.name.text, file, selector: selector.text, inputs: new Map(), listeners: [], bindings: [], attributes: [], create: false, hooks: new Set(), structural: false, members: st.members.flatMap((m) => (m.name && ts.isIdentifier(m.name) ? [m.name.text] : [])) };
      for (const k of ['outputs', 'providers', 'exportAs', 'hostDirectives', 'queries']) if (get(k)) throw new Error(`${where}: its ${k} are not supported in a release build yet`);
      const inputs = get('inputs');
      for (const e of inputs && ts.isArrayLiteralExpression(inputs) ? inputs.elements : []) {
        if (!ts.isStringLiteralLike(e)) throw new Error(`${where}: inputs are names in a release build`);
        const [member, alias] = e.text.split(':').map((x) => x.trim());
        d.inputs.set(alias ?? member, member);
      }
      const host = get('host');
      for (const p of host && ts.isObjectLiteralExpression(host) ? host.properties : []) {
        if (!ts.isPropertyAssignment(p) || !ts.isStringLiteralLike(p.initializer)) throw new Error(`${where}: host entries are strings in a release build`);
        const key = ts.isStringLiteralLike(p.name) ? p.name.text : p.name.getText();
        const value = p.initializer.text;
        if (/^\(.*\)$/.test(key)) d.listeners.push({ event: key.slice(1, -1), code: value });
        else if (/^\[.*\]$/.test(key)) d.bindings.push({ prop: key.slice(1, -1), code: value });
        else d.attributes.push({ name: key, value });
      }
      for (const m of st.members) {
        const name = m.name && (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name)) ? m.name.text : undefined;
        if (ts.isMethodDeclaration(m) && name && /^ng(OnInit|OnChanges|AfterViewInit|OnDestroy|DoCheck|AfterContentInit|AfterContentChecked|AfterViewChecked)$/.test(name)) {
          if (!['ngOnInit', 'ngOnChanges', 'ngAfterViewInit', 'ngOnDestroy'].includes(name)) throw new Error(`${where}: ${name} is not supported in a release build yet`);
          d.hooks.add(name);
        }
        for (const dec of ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []) {
          const e = dec.expression;
          const which = ts.isCallExpression(e) ? e.expression.getText() : e.getText();
          const arg = ts.isCallExpression(e) ? e.arguments[0] : undefined;
          if (!name) throw new Error(`${where}: a decorated member without a plain name`);
          if (which === 'Input') {
            const alias = arg && ts.isStringLiteralLike(arg) ? arg.text : arg && ts.isObjectLiteralExpression(arg) ? (arg.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'alias')?.initializer as ts.StringLiteral | undefined)?.text : undefined;
            d.inputs.set(alias ?? name, name);
          } else if (which === 'HostListener') {
            if (!arg || !ts.isStringLiteralLike(arg) || !ts.isMethodDeclaration(m)) throw new Error(`${where}: @HostListener takes an event name, on a method`);
            const given = ts.isCallExpression(e) ? e.arguments[1] : undefined;
            const args = given && ts.isArrayLiteralExpression(given) ? given.elements.map((x) => (ts.isStringLiteralLike(x) ? x.text : x.getText())) : [];
            if (arg.text.includes(':')) throw new Error(`${where}: @HostListener('${arg.text}'), a global target, is not supported in a release build yet`);
            d.listeners.push({ event: arg.text, code: `${name}(${args.join(', ')})` });
          } else if (which === 'HostBinding') {
            const prop = arg && ts.isStringLiteralLike(arg) ? arg.text : name;
            d.bindings.push({ prop, code: name });
          } else throw new Error(`${where}: @${which} is not supported in a release build yet`);
        }
      }
      for (const b of d.bindings) if (/^(class|style|attr)\./.test(b.prop)) throw new Error(`${where}: the host binding [${b.prop}] is not supported in a release build yet`);
      const ctor = st.members.find(ts.isConstructorDeclaration);
      d.create = !!ctor?.parameters.length;
      d.structural = /\bTemplateRef\b/.test(ctor?.getText() ?? '') || /inject\(\s*TemplateRef\b/.test(st.getText());
      out.push(d);
    }
  }
  return out;
}

/**
 * A file of `@Pipe` (and `@Directive`) classes as the release build compiles it: the class decorators, which only
 * Angular's compiler reads, left out, and a class whose constructor takes parameters given a `static $create()` that
 * injects them, as Angular's factory does (`@Inject(TOKEN)` the token, `@Optional()` optionally). Null when the file has
 * no such class.
 */
export function declarableSource(path: string, text: string): string | null {
  if (!/@(Pipe|Directive)\b/.test(text)) return null;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const edits: { start: number; end: number; text: string }[] = [];
  let injects = false;
  let changes = false;
  for (const st of sf.statements) {
    if (!ts.isClassDeclaration(st) || !st.name) continue;
    const own = ts.getDecorators(st)?.find((d) => ts.isCallExpression(d.expression) && ['Pipe', 'Directive'].includes(d.expression.expression.getText()));
    if (!own) continue;
    edits.push({ start: own.getStart(), end: own.getEnd(), text: '' });
    // A directive's member decorators (@Input, @HostListener, @HostBinding) are the template compiler's to read.
    for (const m of st.members) for (const d of ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []) edits.push({ start: d.getStart(), end: d.getEnd(), text: '' });
    const onChanges = st.members.find((m): m is ts.MethodDeclaration => ts.isMethodDeclaration(m) && m.name.getText() === 'ngOnChanges');
    if (onChanges) {
      changes = true;
      edits.push({ start: st.members.end, end: st.members.end, text: '\n' + changesMembers(onChanges.parameters.length > 0).join('\n') + '\n' });
    }
    const ctor = st.members.find(ts.isConstructorDeclaration);
    if (!ctor?.parameters.length) continue;
    const given = ctor.parameters.map((p) => {
      const ref = p.type && ts.isTypeReferenceNode(p.type)
        ? p.type
        : p.type && ts.isUnionTypeNode(p.type)
          ? p.type.types.find(ts.isTypeReferenceNode)
          : undefined;
      let token = ref ? ref.typeName.getText() : undefined;
      let optional = !!(p.questionToken || p.initializer);
      let skipSelf = false;
      for (const d of ts.getDecorators(p) ?? []) {
        const e = d.expression;
        const which = ts.isCallExpression(e) ? e.expression.getText() : e.getText();
        if (which === 'Inject' && ts.isCallExpression(e) && e.arguments[0]) token = e.arguments[0].getText();
        else if (which === 'Optional') optional = true;
        else if (which === 'SkipSelf') skipSelf = true;
        else if (!['Self', 'Host'].includes(which)) throw new Error(`${path}: @${which} on ${st.name!.text}'s constructor parameter ${p.name.getText()} is not supported in a release build yet`);
        edits.push({ start: d.getStart(), end: d.getEnd(), text: '' });
      }
      if (optional && skipSelf) return 'undefined as any';
      if (!token) throw new Error(`${path}: ${st.name!.text}'s constructor parameter ${p.name.getText()} needs a class type or @Inject(token) in a release build`);
      injects = true;
      return `inject(${token}${optional ? ', { optional: true }' : ''})`;
    });
    const close = st.members.end;
    edits.push({ start: close, end: close, text: `\n  static $create(): ${st.name.text} { return new ${st.name.text}(${given.join(', ')}); }\n` });
  }
  if (!edits.length) return null;
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  if (changes) {
    if (!importsAs(sf, 'signal', '@angular/core') && declares(sf, 'signal')) throw new Error(`${path}: ngOnChanges needs Angular's signal, which this file's own "signal" hides`);
    out = `import { ${importsAs(sf, 'signal', '@angular/core') ? '' : 'signal, '}SimpleChange as $SimpleChange } from '@angular/core';\n` + out;
  }
  if (injects && !importsAs(sf, 'inject', '@angular/core')) {
    if (declares(sf, 'inject')) throw new Error(`${path}: a pipe's constructor is injected with Angular's inject, which this file's own "inject" hides`);
    out = `import { inject } from '@angular/core';\n` + out;
  }
  return out;
}


/** What `classicClass` read from a decorated class beside its rewritten source. */
interface Classic {
  text: string;
  /** `@Input()` fields, now input signals read as `this.x()`. */
  inputs: Set<string>;
  /** `@Input()` setters, now `$set_<name>` methods the parent calls when its binding changes. */
  setters: Set<string>;
  /** Inputs the parent binds by another name (`@Input('name')`), by field. */
  aliases: Map<string, string>;
  /** Inputs the parent may leave out. */
  optional: Set<string>;
  /** `@ViewChild` and `@ViewChildren` fields. */
  queries: ViewQuery[];
  /** The class injects its own ElementRef, now its `$host` field. */
  host: boolean;
}

/**
 * A view query (`@ViewChild('ref')`, `@ViewChild(ChildComponent)`, `@ViewChildren`): the field it fills, what it
 * matches, and what it reads there (`read: ElementRef`, a view class) when that is not the match itself.
 */
export interface ViewQuery {
  field: string;
  ref?: string;
  type?: string;
  read: string | null;
  static: boolean;
  many: boolean;
}

/**
 * A component written with decorators: `@Input() x: T` (or `= init`) is `input<T>()`, read as
 * `this.x()` and written, by the component itself, with `$assign`; `@Input() set x(v)` is a
 * `$set_x(v)` method, called as Angular calls the setter; `@Output() e = new EventEmitter<T>()` is
 * `output<T>()`; constructor parameter properties are `inject()`ed fields, set before the other
 * fields as TypeScript sets them. Null when the class has none of these.
 */
function classicClass(path: string, text: string, cls: ts.ClassDeclaration): Classic | null {
  const edits: { start: number; end: number; text: string }[] = [];
  const inputs = new Set<string>();
  const setters = new Set<string>();
  const aliases = new Map<string, string>();
  const optional = new Set<string>();
  const queries: ViewQuery[] = [];
  const used = new Set<string>();
  const injected: string[] = [];
  let ctor: ts.ConstructorDeclaration | undefined;
  const locals: string[] = [];
  let host = /\binject\(\s*ElementRef\s*\)/.test(cls.getText());
  const decoratorsOf = (m: ts.Node) => (ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []).map((d) => d.expression);
  /** `@Input()`, `@Input('alias')`, `@Input({ alias, required })`: the name the parent binds and whether it must. */
  const inputOptions = (d: ts.CallExpression, name: string): { alias?: string; required: boolean } => {
    const a = d.arguments[0];
    if (!a) return { required: false };
    if (ts.isStringLiteralLike(a)) return { alias: a.text, required: false };
    if (!ts.isObjectLiteralExpression(a) || d.arguments.length > 1) throw new Error(`${path}: @Input(${a.getText()}) ${name} is not supported in a release build yet`);
    const out: { alias?: string; required: boolean } = { required: false };
    for (const p of a.properties) {
      const key = p.name?.getText();
      const value = ts.isPropertyAssignment(p) ? p.initializer : undefined;
      if (key === 'alias' && value && ts.isStringLiteralLike(value)) out.alias = value.text;
      else if (key === 'required' && value && (value.kind === ts.SyntaxKind.TrueKeyword || value.kind === ts.SyntaxKind.FalseKeyword)) out.required = value.kind === ts.SyntaxKind.TrueKeyword;
      else throw new Error(`${path}: @Input's ${p.getText()} (${name}) is not supported in a release build yet`);
    }
    return out;
  };
  for (const m of cls.members) {
    const decorators = decoratorsOf(m);
    if (ts.isPropertyDeclaration(m) && decorators.length) {
      const name = m.name.getText();
      const d = decorators[0];
      const which = ts.isCallExpression(d) ? d.expression.getText() : d.getText();
      if (decorators.length > 1 || !ts.isCallExpression(d)) throw new Error(`${path}: @${d.getText()} ${name} is not supported in a release build yet`);
      if (which === 'Input') {
        const { alias, required } = inputOptions(d, name);
        const type = m.type?.getText() ?? literalType(m.initializer);
        if (!type) throw new Error(`${path}: @Input() ${name} needs a type`);
        // An input the parent leaves out keeps its initializer, or is undefined, as Angular leaves the field; one declared
        // definitely assigned (`x!: T`) or `required` is one the parent gives.
        const given = required || !!m.exclamationToken;
        const init = m.initializer ? `input<${type}>(${m.initializer.getText()})` : !given ? `input<${type} | undefined>(undefined)` : `input.required<${type}>()`;
        edits.push({ start: m.getStart(), end: m.getEnd(), text: `readonly ${name} = ${init};` });
        inputs.add(name);
        if (alias) aliases.set(name, alias);
        if (!given) optional.add(name);
        used.add('input');
      } else if (which === 'Output') {
        if (d.arguments.length) throw new Error(`${path}: @${d.getText()} ${name} is not supported in a release build yet`);
        const init = m.initializer;
        if (!init || !ts.isNewExpression(init) || init.expression.getText() !== 'EventEmitter') throw new Error(`${path}: @Output() ${name} needs = new EventEmitter<T>()`);
        edits.push({ start: m.getStart(), end: m.getEnd(), text: `readonly ${name} = output<${init.typeArguments?.[0]?.getText() ?? 'void'}>();` });
        used.add('output');
      } else if (which === 'ViewChild' || which === 'ViewChildren') {
        const [what, options] = d.arguments;
        const query: ViewQuery = { field: name, read: null, static: false, many: which === 'ViewChildren' };
        if (what && ts.isStringLiteralLike(what)) {
          if (what.text.includes(',')) throw new Error(`${path}: @${which}('${what.text}'), a query of several names, is not supported in a release build yet`);
          query.ref = what.text.trim();
        } else if (what && ts.isIdentifier(what)) query.type = what.text;
        else throw new Error(`${path}: @${d.getText()} ${name} is not supported in a release build yet`);
        for (const p of options && ts.isObjectLiteralExpression(options) ? options.properties : []) {
          const key = p.name?.getText();
          const value = ts.isPropertyAssignment(p) ? p.initializer : undefined;
          if (key === 'static' && value) query.static = value.kind === ts.SyntaxKind.TrueKeyword;
          else if (key === 'read' && value && ts.isIdentifier(value)) query.read = value.text;
          else throw new Error(`${path}: @${which}'s ${p.getText()} (${name}) is not supported in a release build yet`);
        }
        if (options && !ts.isObjectLiteralExpression(options)) throw new Error(`${path}: @${d.getText()} ${name} is not supported in a release build yet`);
        if (query.read && /^(ViewContainerRef|TemplateRef|ChangeDetectorRef|Injector)$/.test(query.read)) throw new Error(`${path}: @${which}'s read: ${query.read} (${name}) is not supported in a release build yet`);
        if (query.read === null && !query.many && m.type) {
          const ref = ts.isTypeReferenceNode(m.type)
            ? m.type
            : ts.isUnionTypeNode(m.type)
              ? m.type.types.find(ts.isTypeReferenceNode)
              : undefined;
          const typeName = ref && ts.isIdentifier(ref.typeName) ? ref.typeName.text : undefined;
          if (typeName && !/^(ElementRef|TemplateRef|ViewContainerRef|ChangeDetectorRef|Injector|QueryList|any|unknown|Object)$/.test(typeName)) {
            query.read = typeName;
          }
        }
        queries.push(query);
        const decorator = ts.getDecorators(m)![0];
        if (query.many) {
          // A QueryList the template's matches are added to and removed from, in the order they render.
          edits.push({ start: m.getStart(), end: m.getEnd(), text: `readonly ${name} = new $QueryList();` });
        } else edits.push({ start: decorator.getStart(), end: decorator.getEnd(), text: '' });
      } else throw new Error(`${path}: @${which} is not supported in a release build yet`);
      continue;
    }
    if (ts.isAccessor(m) && decorators.length) {
      const name = m.name.getText();
      const d = decorators[0];
      if (decorators.length > 1 || !ts.isCallExpression(d) || d.expression.getText() !== 'Input') throw new Error(`${path}: @${d.getText()} on the accessor ${name} is not supported in a release build yet`);
      const { alias } = inputOptions(d, name);
      // The decorator may be on either accessor; the setter is what the parent's binding calls.
      const set = cls.members.find((x): x is ts.SetAccessorDeclaration => ts.isSetAccessorDeclaration(x) && x.name.getText() === name);
      if (!set) throw new Error(`${path}: @Input() on the getter ${name}, which has no setter`);
      const decorator = ts.getDecorators(m)![0];
      edits.push({ start: decorator.getStart(), end: decorator.getEnd(), text: '' });
      const head = set.getChildren().find((c) => c.kind === ts.SyntaxKind.SetKeyword)!;
      edits.push({ start: head.getStart(), end: set.name.getEnd(), text: `$set_${name}` });
      setters.add(name);
      if (alias) aliases.set(name, alias);
      optional.add(name);
      continue;
    }
    if (decorators.length) throw new Error(`${path}: @${decorators[0].getText()} is not supported in a release build yet`);
    if (ts.isConstructorDeclaration(m)) {
      // A body without parameters is the translator's: it runs after the field initializers, as TypeScript runs it.
      if (!m.parameters.length) continue;
      for (const p of m.parameters) {
        const modifiers = (ts.getModifiers(p) ?? []).map((x) => x.getText());
        // Angular's factory injects each parameter: its class, or the token `@Inject` names, optionally with `@Optional()`.
        const ref = p.type && ts.isTypeReferenceNode(p.type)
          ? p.type
          : p.type && ts.isUnionTypeNode(p.type)
            ? p.type.types.find(ts.isTypeReferenceNode)
            : undefined;
        let token = ref ? ref.typeName.getText() : undefined;
        let optional = !!(p.questionToken || p.initializer);
        let skipSelf = false;
        for (const d of decoratorsOf(p)) {
          const which = ts.isCallExpression(d) ? d.expression.getText() : d.getText();
          if (which === 'Inject' && ts.isCallExpression(d) && d.arguments[0]) token = d.arguments[0].getText();
          else if (which === 'Optional') optional = true;
          else if (which === 'SkipSelf') skipSelf = true;
          else if (!['Self', 'Host'].includes(which)) throw new Error(`${path}: @${which} on the constructor parameter ${p.name.getText()} is not supported in a release build yet`);
        }
        if (!token && !(optional && skipSelf)) throw new Error(`${path}: constructor parameter ${p.getText()} needs a class type or @Inject(token)`);
        // The component's own ElementRef is its host: the template's root view, set once it is made.
        if (token === 'ElementRef') host = true;
        const value = optional && skipSelf
          ? 'undefined as any'
          : token === 'ElementRef'
            ? 'this.$host'
            : (used.add('inject'), `inject(${token}${optional ? ', { optional: true }' : ''})`);
        const typed = p.type ? `: ${p.type.getText()}` : '';
        // A parameter property is a field; a plain parameter is a local of the constructor's body.
        if (modifiers.length) {
          injected.push(`  ${modifiers.join(' ')} ${p.name.getText()}${typed} = ${value};\n`);
          if (m.body && new RegExp(`(?<![.\\w$])${p.name.getText()}\\b`).test(m.body.getText())) {
            locals.push(`const ${p.name.getText()} = this.${p.name.getText()};`);
          }
        } else locals.push(`const ${p.name.getText()}${typed} = ${value};`);
      }
      ctor = m;
    }
  }
  if (!edits.length && !ctor && !host) return null;
  if (host) {
    injected.unshift(`  readonly $host = new ElementRef(undefined);\n`);
    used.add('ElementRef');
    for (const m of cls.members) {
      const visit = (n: ts.Node) => {
        if (ts.isCallExpression(n) && n.expression.getText() === 'inject' && n.arguments.length === 1 && n.arguments[0].getText() === 'ElementRef') edits.push({ start: n.getStart(), end: n.getEnd(), text: 'this.$host' });
        else ts.forEachChild(n, visit);
      };
      if (m !== ctor) visit(m);
    }
  }
  if (injected.length) edits.push({ start: cls.members[0].getFullStart(), end: cls.members[0].getFullStart(), text: '\n' + injected.join('') });
  if (inputs.size) {
    const impl = cls.heritageClauses?.find((c) => c.token === ts.SyntaxKind.ImplementsKeyword);
    if (impl) {
      const kept = impl.types.filter((t) => /^(OnInit|OnDestroy|OnChanges|AfterViewInit|AfterContentInit|AfterViewChecked|AfterContentChecked|DoCheck|ControlValueAccessor|Validator|AsyncValidator)$/.test(t.expression.getText()));
      edits.push({ start: impl.getFullStart(), end: impl.getEnd(), text: kept.length ? ` implements ${kept.map((t) => t.getText()).join(', ')}` : '' });
    }
  }
  // `this.input` reads the input's signal and writes it with `$assign`; `this.setter = v` calls the setter's method.
  const isInput = (n: ts.Node): n is ts.PropertyAccessExpression => ts.isPropertyAccessExpression(n) && n.expression.kind === ts.SyntaxKind.ThisKeyword && (inputs.has(n.name.text) || setters.has(n.name.text));
  /** The text of `n` with the reads and writes inside it rewritten. */
  const rewritten = (n: ts.Node): string => {
    const inner: { start: number; end: number; text: string }[] = [];
    collect(n, inner);
    let t = text.slice(n.getStart(), n.getEnd());
    for (const e of inner.sort((a, b) => b.start - a.start)) t = t.slice(0, e.start - n.getStart()) + e.text + t.slice(e.end - n.getStart());
    return t;
  };
  const collect = (n: ts.Node, into: typeof edits) => {
    const write = (target: ts.PropertyAccessExpression, value: string, at: ts.Node) => {
      const name = target.name.text;
      into.push({ start: at.getStart(), end: at.getEnd(), text: setters.has(name) ? `this.$set_${name}(${value})` : `this.${name}.$assign(${value})` });
    };
    if (ts.isBinaryExpression(n) && isInput(n.left) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const op = n.operatorToken.getText().slice(0, -1);
      if (op && setters.has(n.left.name.text)) throw new Error(`${path}: ${n.getText()} on the input setter ${n.left.name.text} is not supported in a release build yet`);
      write(n.left, op ? `this.${n.left.name.text}() ${op} (${rewritten(n.right)})` : rewritten(n.right), n);
      return;
    }
    if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && isInput(n.operand) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken)) {
      if (setters.has(n.operand.name.text) || !ts.isExpressionStatement(n.parent)) throw new Error(`${path}: ${n.getText()} on an input is not supported in a release build yet`);
      write(n.operand, `this.${n.operand.name.text}() ${n.operator === ts.SyntaxKind.PlusPlusToken ? '+' : '-'} 1`, n);
      return;
    }
    if (isInput(n) && inputs.has(n.name.text)) {
      into.push({ start: n.getEnd(), end: n.getEnd(), text: '()' });
      return;
    }
    ts.forEachChild(n, (c) => collect(c, into));
  };
  for (const m of cls.members) if (m !== ctor && !(ts.isPropertyDeclaration(m) && inputs.has(m.name.getText()))) collect(m, edits);
  if (ctor) edits.push({ start: ctor.getFullStart(), end: ctor.getEnd(), text: ctor.body?.statements.length ? `\n  constructor() {${locals.length ? ' ' + locals.join(' ') : ''}${rewritten(ctor.body).slice(1)}` : locals.length ? `\n  constructor() { ${locals.join(' ')} }` : '' });
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start || b.end - a.end)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  const imported = new Set(cls.getSourceFile().statements.flatMap((st) => ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings) ? st.importClause.namedBindings.elements.map((e) => e.name.text) : []));
  const missing = [...used].filter((u) => !imported.has(u));
  return { text: (missing.length ? `import { ${missing.join(', ')} } from '@angular/core';\n` : '') + out, inputs, setters, aliases, optional, queries, host };
}

function collectInheritedMembers(path: string, sf: ts.SourceFile, cls: ts.ClassDeclaration, members: Set<string>, seen = new Set<string>()): void {
  const ext = cls.heritageClauses?.find((c) => c.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
  if (!ext || !ts.isIdentifier(ext)) return;
  const baseName = ext.text;
  let targetFile = path;
  let targetClassName = baseName;
  let targetSf: ts.SourceFile | undefined = sf.statements.some((st) => ts.isClassDeclaration(st) && st.name?.text === baseName) ? sf : undefined;
  if (!targetSf) {
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !st.importClause || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      const spec = st.moduleSpecifier.text;
      let importedName: string | undefined;
      if (st.importClause.name?.text === baseName) importedName = st.importClause.name.text;
      else if (st.importClause.namedBindings && ts.isNamedImports(st.importClause.namedBindings)) {
        const el = st.importClause.namedBindings.elements.find((e) => e.name.text === baseName);
        if (el) importedName = (el.propertyName ?? el.name).text;
      }
      if (!importedName) continue;
      const resolved = resolveClassImport(path, spec);
      if (resolved) {
        targetFile = resolved;
        targetClassName = importedName;
        targetSf = ts.createSourceFile(resolved, readFileSync(resolved, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      }
      break;
    }
  }
  if (!targetSf) return;
  const key = `${targetFile}#${targetClassName}`;
  if (seen.has(key)) return;
  seen.add(key);
  const baseCls = targetSf.statements.find((st): st is ts.ClassDeclaration => ts.isClassDeclaration(st) && st.name?.text === targetClassName);
  if (!baseCls) return;
  for (const m of baseCls.members) {
    if (m.name && ts.isIdentifier(m.name)) members.add(m.name.text);
    else if (ts.isConstructorDeclaration(m)) {
      for (const p of m.parameters) {
        if ((ts.getModifiers(p) ?? []).length && ts.isIdentifier(p.name)) members.add(p.name.text);
      }
    }
  }
  collectInheritedMembers(targetFile, targetSf, baseCls, members, seen);
}

function resolveClassImport(fromFile: string, spec: string): string | undefined {
  const candidates: string[] = [];
  if (spec.startsWith('.')) {
    const base = join(dirname(fromFile), spec);
    candidates.push(base + '.ts', join(base, 'index.ts'));
  } else if (spec.startsWith('~/') || spec.startsWith('@/')) {
    const sub = spec.slice(2);
    for (let dir = dirname(fromFile); dirname(dir) !== dir; dir = dirname(dir)) {
      if (existsSync(join(dir, 'tsconfig.json')) || existsSync(join(dir, 'package.json'))) {
        candidates.push(join(dir, 'src', sub + '.ts'), join(dir, 'src', sub, 'index.ts'), join(dir, sub + '.ts'), join(dir, sub, 'index.ts'));
      }
    }
  }
  return candidates.find((c) => existsSync(c));
}

function literalType(e: ts.Expression | undefined): string | undefined {
  if (!e) return undefined;
  if (ts.isNumericLiteral(e)) return 'number';
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return 'string';
  if (e.kind === ts.SyntaxKind.TrueKeyword || e.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
  return undefined;
}

function literalKey(code: string, path: string): string {
  const m = /^\s*(['"])(.*)\1\s*$/.exec(code);
  if (!m) throw new Error(`${path}: [nsTemplateKey]="${code}" needs a string literal in a release build`);
  return m[2];
}

/**
 * A file's `@Pipe` classes, and each `@NgModule` with the names its `declarations`, `imports` and `exports` list. A
 * library's directives are left out: its Angular wrappers are written against the view internals a compiled template
 * replaces.
 */
export function declarablesIn(path: string, text: string): { classes: string[]; modules: Map<string, string[]> } {
  const classes: string[] = [];
  const modules = new Map<string, string[]>();
  if (!/@(Pipe|NgModule)\b/.test(text)) return { classes, modules };
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  for (const st of sf.statements) {
    if (!ts.isClassDeclaration(st) || !st.name) continue;
    if (decorator(st, 'Pipe')) classes.push(st.name.text);
    const meta = decorator(st, 'NgModule')?.arguments[0];
    if (meta && ts.isObjectLiteralExpression(meta)) {
      modules.set(st.name.text, meta.properties.flatMap((p) => (ts.isPropertyAssignment(p) && ['declarations', 'imports', 'exports'].includes(p.name.getText()) && ts.isArrayLiteralExpression(p.initializer)
        ? p.initializer.elements.filter(ts.isIdentifier).map((e) => e.text) : [])));
    }
  }
  return { classes, modules };
}

/** The element names a component's selector matches (`resource, [talkResource]` is `<resource>`). */
export function selectorElements(selector: string): string[] {
  return ng.CssSelector.parse(selector).flatMap((s) => (s.element && s.element !== '*' && !s.attrs.length && !s.classNames.length && !s.notSelectors.length ? [s.element] : []));
}

/** The bare attribute names a component's selector matches (`[searchBar]` is `searchBar`). */
export function selectorAttributes(selector: string): string[] {
  return ng.CssSelector.parse(selector).flatMap((s) => (!s.element && s.attrs.length === 2 && s.attrs[1] === '' && !s.classNames.length && !s.notSelectors.length ? [s.attrs[0]] : []));
}

export interface ComponentSummary {
  name: string;
  selector?: string;
  inputs: Set<string>;
  outputs: Set<string>;
}

/** A file's `@Component` class, the selector it declares, and its inputs and outputs. */
export function componentOf(path: string, text: string): ComponentSummary | null {
  if (!text.includes('@Component')) return null;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const st of sf.statements) {
    const meta = ts.isClassDeclaration(st) && st.name ? decorator(st, 'Component')?.arguments[0] : undefined;
    if (!meta) continue;
    const selector = ts.isObjectLiteralExpression(meta) ? meta.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'selector')?.initializer : undefined;
    const inputs = new Set<string>();
    const outputs = new Set<string>();
    for (const m of (st as ts.ClassDeclaration).members) {
      if (!m.name || !ts.isIdentifier(m.name)) continue;
      if (ts.isPropertyDeclaration(m) && m.initializer && ts.isCallExpression(m.initializer)) {
        const callee = m.initializer.expression.getText();
        if (callee === 'input' || callee === 'input.required' || callee === 'model' || callee === 'model.required') {
          const opts = m.initializer.arguments[callee === 'input' || callee === 'model' ? 1 : 0];
          const alias = opts && ts.isObjectLiteralExpression(opts) ? opts.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'alias')?.initializer : undefined;
          inputs.add(alias && ts.isStringLiteralLike(alias) ? alias.text : m.name.text);
        }
        if (callee === 'output' || callee === 'model' || callee === 'model.required') {
          const opts = m.initializer.arguments[callee === 'output' ? 0 : callee === 'model' ? 1 : 0];
          const alias = opts && ts.isObjectLiteralExpression(opts) ? opts.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'alias')?.initializer : undefined;
          outputs.add(alias && ts.isStringLiteralLike(alias) ? alias.text : m.name.text);
        }
      }
      for (const d of ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []) {
        if (!ts.isCallExpression(d.expression)) continue;
        const which = d.expression.expression.getText();
        const arg = d.expression.arguments[0];
        const alias = arg && ts.isStringLiteralLike(arg) ? arg.text : arg && ts.isObjectLiteralExpression(arg) ? (arg.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === 'alias')?.initializer as ts.StringLiteral | undefined)?.text : undefined;
        if (which === 'Input') inputs.add(alias ?? m.name.text);
        else if (which === 'Output') outputs.add(alias ?? m.name.text);
      }
    }
    return { name: (st as ts.ClassDeclaration).name!.text, selector: selector && ts.isStringLiteralLike(selector) ? selector.text : undefined, inputs, outputs };
  }
  return null;
}

function decorator(node: ts.ClassDeclaration, name: string): ts.CallExpression | undefined {
  for (const d of ts.getDecorators(node) ?? []) {
    if (ts.isCallExpression(d.expression) && ts.isIdentifier(d.expression.expression) && d.expression.expression.text === name) return d.expression;
  }
  return undefined;
}

/** @nativescript/angular's platform filters (`<android>`, `<ios>`, `<apple>`) and the platforms each renders its content on. */
const PLATFORM_FILTERS: Record<string, string[]> = { android: ['android'], ios: ['ios'], apple: ['ios'] };

/** Words a template's expression can name as a member that TypeScript reads as a keyword. */
const KEYWORDS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'throw', 'try', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'await']);

/** NSRouterLink's inputs: on an element with `nsRouterLink` they are the directive's, not the view's. */
const ROUTER_LINK_INPUTS = new Set(['nsRouterLink', 'relativeTo', 'clearHistory', 'pageTransition', 'pageTransitionDuration', 'queryParams', 'fragment', 'queryParamsHandling', 'state', 'info', 'preserveFragment', 'skipLocationChange', 'replaceUrl']);
const ROUTER_LINK_SUPPORTED = new Set(['nsRouterLink', 'relativeTo', 'clearHistory', 'pageTransition', 'pageTransitionDuration']);

/** Whether the file imports `name` from `module` under its own name. */
function importsAs(sf: ts.SourceFile, name: string, module: string): boolean {
  return sf.statements.some((s) => ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.moduleSpecifier.text === module && !s.importClause?.isTypeOnly
    && !!s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings)
    && s.importClause.namedBindings.elements.some((e) => e.name.text === name && (e.propertyName?.text ?? name) === name && !e.isTypeOnly));
}

/** Whether a top-level import or declaration of the file binds `name`. */
function declares(sf: ts.SourceFile, name: string): boolean {
  return sf.statements.some((s) => {
    if (ts.isImportDeclaration(s)) {
      const c = s.importClause;
      return c?.name?.text === name || (!!c?.namedBindings && (ts.isNamespaceImport(c.namedBindings) ? c.namedBindings.name.text === name : c.namedBindings.elements.some((e) => e.name.text === name)));
    }
    if (ts.isVariableStatement(s)) return s.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name);
    return (ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && s.name?.text === name;
  });
}

function sourceOf(ast: ng.AST): string {
  const s = (ast as ng.ASTWithSource).source;
  if (s == null) throw new Error('an Angular expression without source text');
  return s;
}

/** A route of the app's configuration, its lazy children and components resolved to what they import. */
export interface RouteNode {
  path: string;
  component?: string;
  redirectTo?: string;
  full?: boolean;
  outlet?: string;
  /** The route's component is `NSEmptyOutletComponent`. */
  emptyOutlet?: boolean;
  children?: RouteNode[];
}

/**
 * The router configuration the entry provides (`provideNativeScriptRouter(routes)`,
 * `NativeScriptRouterModule.forRoot(routes)`), followed through `loadChildren` and
 * `loadComponent` into the files they import. A route whose component is `NSEmptyOutletComponent` is marked
 * `emptyOutlet`: its children render in a frame of their own, on a page of the outlet the route names.
 */
export function angularRouteTree(entry: string, read: (file: string) => string, aliased: (specifier: string) => string | undefined = () => undefined): { routes: RouteNode[]; files: Set<string> } | null {
  const files = new Set<string>();
  const parse = (f: string) => ts.createSourceFile(f, read(f), ts.ScriptTarget.Latest, true);
  /** A relative specifier, or one of the app's path aliases (`~/app/x`), as the file it names. */
  const fileOf = (from: string, spec: string) => {
    const base = spec.startsWith('.') ? join(dirname(from), spec) : aliased(spec);
    return base === undefined ? undefined : [base + '.ts', join(base, 'index.ts')].find((p) => existsSync(p));
  };
  /** The array a name declares in a file, or imports into it. */
  const arrayNamed = (file: string, name: string): { file: string; array: ts.ArrayLiteralExpression } | null => {
    const sf = parse(file);
    for (const st of sf.statements) {
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer && ts.isArrayLiteralExpression(d.initializer)) return { file, array: d.initializer };
        }
      }
      if (ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings) && ts.isStringLiteral(st.moduleSpecifier)) {
        const el = st.importClause.namedBindings.elements.find((e) => e.name.text === name);
        const target = el ? fileOf(file, st.moduleSpecifier.text) : undefined;
        if (target) return arrayNamed(target, (el!.propertyName ?? el!.name).text);
      }
    }
    return null;
  };
  /** `() => import('./x').then((m) => m.Name)`: the file and the name. */
  const lazy = (file: string, e: ts.Expression): { file: string; name: string } => {
    const body = ts.isArrowFunction(e) && !ts.isBlock(e.body) ? e.body : undefined;
    const then = body && ts.isCallExpression(body) && ts.isPropertyAccessExpression(body.expression) && body.expression.name.text === 'then' ? body : undefined;
    const load = then && ts.isCallExpression(then.expression.expression) && then.expression.expression.expression.kind === ts.SyntaxKind.ImportKeyword ? then.expression.expression : undefined;
    const pick = then?.arguments[0];
    const name = pick && ts.isArrowFunction(pick) && ts.isPropertyAccessExpression(pick.body) ? pick.body.name.text : undefined;
    const spec = load?.arguments[0];
    const target = spec && ts.isStringLiteral(spec) ? fileOf(file, spec.text) : undefined;
    if (!target || !name) throw new Error(`${file}:${ts.getLineAndCharacterOfPosition(e.getSourceFile(), e.getStart()).line + 1}: a lazy route is read as () => import('./file').then((m) => m.Name) in a release build`);
    return { file: target, name };
  };
  const routesOf = (file: string, array: ts.ArrayLiteralExpression): RouteNode[] => {
    files.add(file);
    return array.elements.map((el) => {
      if (!ts.isObjectLiteralExpression(el)) throw new Error(`${file}: a route is an object literal in a release build`);
      const get = (k: string) => el.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText() === k)?.initializer;
      const text = (k: string) => { const v = get(k); return v && ts.isStringLiteralLike(v) ? v.text : undefined; };
      const node: RouteNode = { path: text('path') ?? '' };
      const component = get('component');
      if (component && ts.isIdentifier(component)) {
        if (component.text === 'NSEmptyOutletComponent') node.emptyOutlet = true;
        else node.component = component.text;
      }
      const loadComponent = get('loadComponent');
      if (loadComponent) node.component = lazy(file, loadComponent).name;
      if (text('redirectTo') !== undefined) node.redirectTo = text('redirectTo');
      if (text('pathMatch') === 'full') node.full = true;
      if (text('outlet')) node.outlet = text('outlet');
      const children = get('children');
      if (children && ts.isArrayLiteralExpression(children)) node.children = routesOf(file, children);
      const loadChildren = get('loadChildren');
      if (loadChildren) {
        const { file: target, name } = lazy(file, loadChildren);
        const found = arrayNamed(target, name);
        if (!found) throw new Error(`${target}: no route array ${name}`);
        node.children = [...(node.children ?? []), ...routesOf(found.file, found.array)];
      }
      return node;
    });
  };
  const sf = parse(entry);
  let found: { file: string; array: ts.ArrayLiteralExpression } | null = null;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isCallExpression(n) && /(^|\.)(provideNativeScriptRouter|provideRouter|forRoot)$/.test(n.expression.getText()) && n.arguments[0] && ts.isIdentifier(n.arguments[0])) found = arrayNamed(entry, n.arguments[0].text);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!found) return null;
  const { file, array } = found as { file: string; array: ts.ArrayLiteralExpression };
  return { routes: routesOf(file, array), files };
}

/** The components a route tree names. */
export function routedComponents(routes: RouteNode[]): string[] {
  return routes.flatMap((r) => [...(r.component ? [r.component] : []), ...routedComponents(r.children ?? [])]);
}

/** The route table: path → component, and where the app starts. */
export function angularRoutes(text: string): { routes: { path: string; component: string }[]; initial: string } {
  const sf = ts.createSourceFile('routes.ts', text, ts.ScriptTarget.Latest, true);
  const routes: { path: string; component: string }[] = [];
  let initial = '';
  const visit = (n: ts.Node) => {
    if (ts.isObjectLiteralExpression(n)) {
      const get = (k: string) => n.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && (p.name as ts.Identifier).text === k)?.initializer;
      const path = (get('path') as ts.StringLiteral | undefined)?.text;
      const component = get('component');
      const redirect = (get('redirectTo') as ts.StringLiteral | undefined)?.text;
      if (path !== undefined && component && ts.isIdentifier(component)) routes.push({ path, component: component.text });
      if (path === '' && redirect) initial = redirect;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { routes, initial: initial || '/' + (routes[0]?.path ?? '') };
}
