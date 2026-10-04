import * as ng from '@angular/compiler';
import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';

/** Angular's standalone component as the release build sees it. */
export interface AngularComponent extends ComponentIR {
  selector: string;
}

/**
 * A NativeScript Angular standalone component (`@Component` with a template
 * of @nativescript/core elements, signals, `input()`/`output()`, `inject()`)
 * as a virtual class: the component's own source with one method appended
 * per template expression. The class keeps Angular's API; the translator
 * knows what `signal()`, `computed()`, `input()`, `output()` and `inject()` mean.
 */
export function angularComponent(path: string, text: string, selectors: Map<string, string>): AngularComponent | null {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const cls = sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && !!decorator(s, 'Component'));
  if (!cls || !cls.name) return null;
  const meta = decorator(cls, 'Component')!.arguments[0] as ts.ObjectLiteralExpression;
  const prop = (name: string) => meta.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && (p.name as ts.Identifier).text === name)?.initializer;
  const selector = (prop('selector') as ts.StringLiteral | undefined)?.text ?? cls.name.text;
  const inline = prop('template');
  const templateUrl = (prop('templateUrl') as ts.StringLiteral | undefined)?.text;
  const template = inline && (ts.isNoSubstitutionTemplateLiteral(inline) || ts.isStringLiteral(inline)) ? inline.text : templateUrl && existsSync(join(dirname(path), templateUrl)) ? readFileSync(join(dirname(path), templateUrl), 'utf8') : '';

  const members = new Set<string>();
  const props: string[] = [];
  const outputs: string[] = [];
  for (const m of cls.members) {
    if (!m.name || !ts.isIdentifier(m.name)) continue;
    members.add(m.name.text);
    if (ts.isPropertyDeclaration(m) && m.initializer && ts.isCallExpression(m.initializer)) {
      const callee = m.initializer.expression.getText();
      if (callee === 'input' || callee === 'input.required') props.push(m.name.text);
      if (callee === 'output') outputs.push(m.name.text);
    }
  }
  const scope: Scope = { names: new Map([...members].map((m) => [m, `this.${m}`])) };

  const methods: string[] = [];
  let next = 0;
  /** `names`: a template's other context variables (`let-e="even"`), as expressions over the item and index. */
  type Loop = { item: string; index: string; param: string; names?: Record<string, string> };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (loops: Loop[]): Scope => {
    const names = new Map(scope.names);
    for (const l of loops) {
      names.delete(l.item); names.delete(l.index);
      for (const [k, v] of Object.entries(l.names ?? {})) names.set(k, v);
    }
    return { names };
  };
  // `$any(x)` is Angular's escape from template type checking; the release build is typed by the component's code.
  const clean = (code: string) => code.replace(/\$any\(/g, '(');
  const expr = (code: string, loops: Loop[]) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(loops)}) { return ${rewrite(clean(code), local(loops))}; }`);
    return m;
  };
  const handler = (code: string, loops: Loop[]) => {
    const m = `$e${next++}`;
    methods.push(`  ${m}(${[params(loops), '$event: $EventData'].filter(Boolean).join(', ')}) { ${rewrite(clean(code), local(loops), 'statements')}; }`);
    return m;
  };

  const nodes = (list: ng.TmplAstNode[], loops: Loop[]): TNode[] => {
    const out: TNode[] = [];
    for (const n of list) {
      if (n instanceof ng.TmplAstElement) {
        const attrs: Attr[] = [];
        const events: Event[] = [];
        const isList = canonical(n.name) === 'ListView';
        for (const a of n.attributes) attrs.push({ name: a.name, value: a.value });
        for (const i of n.inputs) if (!(isList && i.name === 'itemTemplateSelector')) attrs.push({ name: i.name, method: expr(sourceOf(i.value), loops) });
        for (const o of n.outputs) events.push({ name: o.name, method: handler(sourceOf(o.handler), loops) });
        const component = selectors.get(n.name);
        if (component) { out.push({ kind: 'component', name: component, props: attrs, events }); continue; }
        if (n.name === 'page-router-outlet') { out.push({ kind: 'element', tag: 'Frame', attrs: [{ name: 'router', value: 'true' }], events: [], children: [] }); continue; }
        const tag = canonical(n.name);
        if (!tag) throw new Error(`${path}: <${n.name}> is not a @nativescript/core element the release build knows`);
        out.push({ kind: 'element', tag, attrs, events, children: isList ? listTemplates(n, attrs, loops) : nodes(n.children, loops) });
        continue;
      }
      if (n instanceof ng.TmplAstIfBlock) {
        out.push({ kind: 'if', branches: n.branches.map((b) => ({ cond: b.expression ? expr(sourceOf(b.expression), loops) : null, body: nodes(b.children, loops) })) });
        continue;
      }
      if (n instanceof ng.TmplAstForLoopBlock) {
        const item = n.item.name;
        const index = n.contextVariables.find((v) => v.value === '$index')?.name ?? `$i${loops.length}`;
        const items = expr(sourceOf(n.expression), loops);
        const loop: Loop = { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0` };
        const inner = [...loops, loop];
        out.push({ kind: 'for', items, key: expr(sourceOf(n.trackBy), inner), item, index, body: nodes(n.children, inner) });
        continue;
      }
      if (n instanceof ng.TmplAstText || n instanceof ng.TmplAstComment) continue;
      throw new Error(`${path}: ${n.constructor.name} in a template is not supported in a release build yet`);
    }
    return out;
  };

  /**
   * `<ListView [items]>` with `<ng-template let-item let-i="index" nsTemplateKey="…">` children, as
   * @nativescript/angular's ListViewComponent renders them: the first template is also the default, and
   * `[itemTemplateSelector]` is called with `(item, index, items)`.
   */
  const listTemplates = (n: ng.TmplAstElement, attrs: Attr[], loops: Loop[]): TNode[] => {
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${path}: <ListView> needs [items]`);
    const list = `this.${items.method}(${args(loops)})`;
    const selector = n.inputs.find((i) => i.name === 'itemTemplateSelector');
    if (selector) {
      const m = `$b${next++}`;
      const p = [params(loops), `$item = ${list}[0]`, '$index = 0'].filter(Boolean).join(', ');
      methods.push(`  ${m}(${p}): string { return ${rewrite(clean(sourceOf(selector.value)), local(loops))}($item, $index, ${list}); }`);
      attrs.push({ name: 'itemTemplateSelector', method: m });
    }
    const out: TNode[] = [];
    for (const t of n.children) {
      if (t instanceof ng.TmplAstText) continue;
      if (!(t instanceof ng.TmplAstTemplate) || t.tagName !== 'ng-template') throw new Error(`${path}: a ListView's children are <ng-template let-item> item templates`);
      const bound = t.inputs.find((i) => i.name === 'nsTemplateKey');
      const key = t.attributes.find((a) => a.name === 'nsTemplateKey')?.value ?? (bound ? literalKey(sourceOf(bound.value), path) : out.length ? null : 'default');
      if (key === null) throw new Error(`${path}: a ListView's second and later <ng-template>s need an nsTemplateKey`);
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
        else if (!['$implicit', 'item', 'index'].includes(what)) throw new Error(`${path}: a ListView template's "${what}" is not part of its context`);
      }
      const loop: Loop = { item, index, param: `${item} = ${list}[0], ${index} = 0`, names };
      out.push({ kind: 'template', key, item, index, body: nodes(t.children, [...loops, loop]) });
    }
    return out;
  };

  const parsed = ng.parseTemplate(template, path + '.html', { preserveWhitespaces: false });
  if (parsed.errors?.length) throw new Error(`${path}: ${parsed.errors[0]}`);
  const tree = nodes(parsed.nodes, []);

  // The component's source, with the template's methods added to its class and the event type imported.
  const end = cls.members.end;
  const source = `import { type EventData as $EventData } from '@nativescript/release';\n` + text.slice(0, end) + '\n' + methods.join('\n') + '\n' + text.slice(end);
  return { name: cls.name.text, file: path.replace(/\.ts$/, '.release.ts'), source, props, outputs, template: tree, selector } as AngularComponent;
}

function literalKey(code: string, path: string): string {
  const m = /^\s*(['"])(.*)\1\s*$/.exec(code);
  if (!m) throw new Error(`${path}: [nsTemplateKey]="${code}" needs a string literal in a release build`);
  return m[2];
}

function decorator(node: ts.ClassDeclaration, name: string): ts.CallExpression | undefined {
  for (const d of ts.getDecorators(node) ?? []) {
    if (ts.isCallExpression(d.expression) && ts.isIdentifier(d.expression.expression) && d.expression.expression.text === name) return d.expression;
  }
  return undefined;
}

function sourceOf(ast: ng.AST): string {
  const s = (ast as ng.ASTWithSource).source;
  if (s == null) throw new Error('an Angular expression without source text');
  return s;
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
