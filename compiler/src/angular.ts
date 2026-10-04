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
export function angularComponent(path: string, text: string, selectors: Map<string, string>, options: { zone?: boolean } = {}): AngularComponent | null {
  let sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let cls = sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && !!decorator(s, 'Component'));
  if (!cls || !cls.name) return null;
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
  const scope: Scope = { names: new Map([...members].map((m) => [m, classic?.inputs.has(m) ? `this.${m}()` : `this.${m}`])) };
  const init = cls.members.find((m) => ts.isMethodDeclaration(m) && m.name.getText() === 'ngOnInit');
  if (init && (init as ts.MethodDeclaration).parameters.length) throw new Error(`${path}: ngOnInit takes no parameters`);

  const methods: string[] = [];
  let next = 0;
  /** `names`: a template's other context variables (`let-e="even"`), as expressions over the item and index. */
  type Loop = { item: string; index: string; param: string; names?: Record<string, string> };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  /** `*ngIf="x as y"`: names a structural directive binds, in the template it renders. */
  const aliases = new Map<string, string>();
  const local = (loops: Loop[]): Scope => {
    const names = new Map(scope.names);
    for (const [k, v] of aliases) names.set(k, v);
    for (const l of loops) {
      names.delete(l.item); names.delete(l.index);
      for (const [k, v] of Object.entries(l.names ?? {})) names.set(k, v);
    }
    return { names };
  };
  // An expression with pipes reads each `async` pipe through its own AsyncPipe, as Angular makes one per binding site.
  const pipes: string[] = [];
  const code = (value: ng.AST, loops: Loop[]): string => {
    const root = value instanceof ng.ASTWithSource ? value.ast : value;
    if (!pipesIn(root).length) return sourceOf(value);
    if (loops.length) throw new Error(`${path}: a pipe inside *ngFor or @for is not supported in a release build yet`);
    const textOf = (node: ng.AST): string => {
      if (node instanceof ng.BindingPipe) {
        if (node.name !== 'async' || node.args.length) throw new Error(`${path}: the ${node.name} pipe is not supported in a release build yet`);
        const field = `$p${pipes.length}`;
        pipes.push(field);
        return `this.${field}.transform(${textOf(node.exp)})`;
      }
      const at = node.sourceSpan.start;
      let out = template.slice(at, node.sourceSpan.end);
      for (const p of pipesIn(node).sort((a, b) => b.sourceSpan.start - a.sourceSpan.start)) {
        out = out.slice(0, p.sourceSpan.start - at) + textOf(p) + out.slice(p.sourceSpan.end - at);
      }
      return out;
    };
    return textOf(root);
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
        for (const i of n.inputs) if (!(isList && i.name === 'itemTemplateSelector')) attrs.push({ name: i.name, method: expr(code(i.value, loops), loops) });
        for (const o of n.outputs) events.push({ name: o.name, method: handler(code(o.handler, loops), loops) });
        if (n.name === 'ng-container') {
          if (attrs.length || events.length) throw new Error(`${path}: <ng-container> takes no bindings`);
          out.push(...nodes(n.children, loops));
          continue;
        }
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
      if (n instanceof ng.TmplAstTemplate) {
        out.push(...structural(n, loops));
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

  /** `*ngIf` (with `else` and `as`) and `*ngFor` (with `trackBy`, `index`, `even`, `odd`) on an element, `<ng-container>` or `<ng-template>`. */
  const structural = (t: ng.TmplAstTemplate, loops: Loop[]): TNode[] => {
    // `*ngIf` binds the directive through templateAttrs (the template's inputs are its element's); `<ng-template [ngIf]>` through inputs.
    const directive = t.tagName === 'ng-template' ? [...t.templateAttrs, ...t.inputs] : t.templateAttrs;
    const bound = (name: string) => directive.find((a): a is ng.TmplAstBoundAttribute => a instanceof ng.TmplAstBoundAttribute && a.name === name);
    const ngIf = bound('ngIf');
    const ngForOf = bound('ngForOf');
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
      const cond = expr(condition, loops);
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
      if (n instanceof ng.TmplAstElement || n instanceof ng.TmplAstTemplate) findReferences(n.children);
    }
  };
  findReferences(parsed.nodes);
  const tree = nodes(parsed.nodes, []);

  // The component's source, with the template's methods added to its class and the event type imported.
  const end = cls.members.end;
  for (const p of pipes) methods.push(`  readonly ${p} = new AsyncPipe();`);
  const source = `import { ${pipes.length ? 'AsyncPipe, ' : ''}type EventData as $EventData } from '@nativescript/release';\n` + text.slice(0, end) + '\n' + methods.join('\n') + '\n' + text.slice(end);
  return { name: cls.name.text, file: path.replace(/\.ts$/, '.release.ts'), source, props, outputs, template: tree, selector, ...(init ? { init: 'ngOnInit' } : {}) } as AngularComponent;
}

/** The `BindingPipe`s in an expression, outermost first (not those inside another pipe). */
function pipesIn(node: ng.AST): ng.BindingPipe[] {
  if (node instanceof ng.BindingPipe) return [node];
  const found: ng.BindingPipe[] = [];
  const visit = (n: unknown) => {
    if (n instanceof ng.BindingPipe) { found.push(n); return; }
    if (!(n instanceof ng.AST)) return;
    for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(visit) : visit(v);
  };
  for (const v of Object.values(node)) Array.isArray(v) ? v.forEach(visit) : visit(v);
  return found;
}

/**
 * A component written with decorators: `@Input() x: T` (or `= init`) is `input<T>()`, read as
 * `this.x()`; `@Output() e = new EventEmitter<T>()` is `output<T>()`; constructor parameter
 * properties are `inject()`ed fields, set before the other fields as TypeScript sets them. Null
 * when the class has none of these.
 */
function classicClass(path: string, text: string, cls: ts.ClassDeclaration): { text: string; inputs: Set<string> } | null {
  const edits: { start: number; end: number; text: string }[] = [];
  const inputs = new Set<string>();
  const used = new Set<string>();
  const injected: string[] = [];
  const decoratorsOf = (m: ts.Node) => (ts.canHaveDecorators(m) ? ts.getDecorators(m) ?? [] : []).map((d) => d.expression);
  for (const m of cls.members) {
    const decorators = decoratorsOf(m);
    if (ts.isPropertyDeclaration(m) && decorators.length) {
      const name = m.name.getText();
      const d = decorators[0];
      const which = ts.isCallExpression(d) ? d.expression.getText() : d.getText();
      if (decorators.length > 1 || !ts.isCallExpression(d) || d.arguments.length) throw new Error(`${path}: @${d.getText()} ${name} is not supported in a release build yet`);
      if (which === 'Input') {
        const type = m.type?.getText() ?? literalType(m.initializer);
        if (!type) throw new Error(`${path}: @Input() ${name} needs a type`);
        edits.push({ start: m.getStart(), end: m.getEnd(), text: `readonly ${name} = ${m.initializer ? `input<${type}>(${m.initializer.getText()})` : `input.required<${type}>()`};` });
        inputs.add(name);
        used.add('input');
      } else if (which === 'Output') {
        const init = m.initializer;
        if (!init || !ts.isNewExpression(init) || init.expression.getText() !== 'EventEmitter') throw new Error(`${path}: @Output() ${name} needs = new EventEmitter<T>()`);
        edits.push({ start: m.getStart(), end: m.getEnd(), text: `readonly ${name} = output<${init.typeArguments?.[0]?.getText() ?? 'void'}>();` });
        used.add('output');
      } else throw new Error(`${path}: @${which} is not supported in a release build yet`);
      continue;
    }
    if (decorators.length) throw new Error(`${path}: @${decorators[0].getText()} is not supported in a release build yet`);
    if (ts.isConstructorDeclaration(m)) {
      if (m.body?.statements.length) throw new Error(`${path}: a component constructor's body is not supported in a release build yet; initialize fields instead`);
      for (const p of m.parameters) {
        const modifiers = (ts.getModifiers(p) ?? []).map((x) => x.getText());
        if (!modifiers.length || !p.type || decoratorsOf(p).length) throw new Error(`${path}: constructor parameter ${p.getText()} needs to be a parameter property (private x: Service)`);
        injected.push(`  ${modifiers.join(' ')} ${p.name.getText()} = inject(${p.type.getText()});\n`);
      }
      used.add('inject');
      edits.push({ start: m.getFullStart(), end: m.getEnd(), text: '' });
    }
  }
  if (!edits.length) return null;
  if (injected.length) edits.push({ start: cls.members[0].getFullStart(), end: cls.members[0].getFullStart(), text: '\n' + injected.join('') });
  // `this.input` reads the input's signal.
  const visit = (n: ts.Node) => {
    if (ts.isPropertyAccessExpression(n) && n.expression.kind === ts.SyntaxKind.ThisKeyword && inputs.has(n.name.text)) {
      const parent = n.parent;
      if (ts.isBinaryExpression(parent) && parent.left === n && parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        throw new Error(`${path}: assigning the input ${n.name.text} is not supported in a release build yet`);
      }
      edits.push({ start: n.getEnd(), end: n.getEnd(), text: '()' });
    }
    ts.forEachChild(n, visit);
  };
  for (const m of cls.members) if (!(ts.isPropertyDeclaration(m) && inputs.has(m.name.getText()))) visit(m);
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start || b.end - a.end)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return { text: `import { ${[...used].join(', ')} } from '@angular/core';\n` + out, inputs };
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
