import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { basename } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';

/**
 * A Svelte Native component (Svelte 4: `export let` props, reactive `let`s,
 * `$:` declarations, `$store` reads, `{#if}`/`{#each}`) as a virtual class.
 */
export function svelteComponent(path: string, text: string, isStoreModule: (specifier: string) => boolean): ComponentIR {
  const name = basename(path, '.svelte');
  // Svelte 4 parses scripts as JavaScript; the TypeScript is read separately, and blanked
  // to spaces in the markup so the template's offsets stay those of the file.
  let script = '';
  const markup = text.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/, (_, open, body, close) => {
    script = body;
    return open + body.replace(/[^\n]/g, ' ') + close;
  });
  const ast = parse(markup);
  const src = (n: { start: number; end: number }) => markup.slice(n.start, n.end);
  const sf = ts.createSourceFile(path + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const imports: string[] = [];
  const fields: string[] = [];
  const props: string[] = [];
  const components = new Set<string>();
  // svelte-native's `<Template>`, under the name the component imports it as.
  let templateTag = '';
  const stores = new Set<string>();
  const scope: Scope = { names: new Map() };
  const arity = new Map<string, number>();
  const later: (() => void)[] = [];
  const derived: { name: string; method: string }[] = [];

  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const from = (st.moduleSpecifier as ts.StringLiteral).text;
      if (from.endsWith('.svelte')) {
        const local = st.importClause!.name!.text;
        components.add(local);
        imports.push(`import ${local} from '${from}';`);
        continue;
      }
      if (from === '@nativescript-community/svelte-native') { imports.push(st.getText()); continue; }
      if (from === '@nativescript-community/svelte-native/components') {
        const named = st.importClause?.namedBindings;
        if (named && ts.isNamedImports(named)) for (const e of named.elements) if ((e.propertyName ?? e.name).text === 'Template') templateTag = e.name.text;
        continue;
      }
      imports.push(st.getText());
      // A module that exports stores: `$name` in this component reads one.
      const named = st.importClause?.namedBindings;
      if (named && ts.isNamedImports(named) && isStoreModule(from)) for (const e of named.elements) stores.add(e.name.text);
      continue;
    }
    const exported = ts.canHaveModifiers(st) && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const id = (d.name as ts.Identifier).text;
        if (exported) {
          props.push(id);
          fields.push(`  ${id}!: ${d.type ? d.type.getText() : 'any'};`);
          scope.names.set(id, `this.${id}`);
        } else {
          // Every top-level `let` is state: assigning it re-renders what reads it.
          scope.names.set(id, `this.${id}.value`);
          later.push(() => fields.push(`  ${id} = $signal${d.type ? `<${d.type.getText()}>` : ''}(${d.initializer ? rewrite(d.initializer.getText(), withStores(scope, stores)) : 'undefined'});`));
        }
      }
      continue;
    }
    if (ts.isFunctionDeclaration(st) && st.name) {
      const fn = st.name.text;
      arity.set(fn, st.parameters.length);
      scope.names.set(fn, `this.${fn}`);
      later.push(() => {
        const ret = st.type ? `: ${st.type.getText()}` : '';
        fields.push(`  ${(ts.getModifiers(st as ts.FunctionDeclaration)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '')}${fn}(${st.parameters.map((p) => p.getText()).join(', ')})${ret} ${rewrite(st.body!.getText(), withStores(scope, stores), 'statements')}`);
      });
      continue;
    }
    if (ts.isLabeledStatement(st) && st.label.text === '$' && ts.isExpressionStatement(st.statement) && ts.isBinaryExpression(st.statement.expression)) {
      // `$: id = expr` is state that `$$.update()` recomputes in the update after its sources
      // change; `render()` gives it its first value.
      const assign = st.statement.expression;
      const id = (assign.left as ts.Identifier).text;
      scope.names.set(id, `this.${id}.value!`);
      const method = `$d${derived.length}`;
      derived.push({ name: id, method });
      later.push(() => fields.push(`  ${id} = $signal<ReturnType<${name}['${method}']> | undefined>(undefined);`, `  ${method}() { return ${rewrite(assign.right.getText(), withStores(scope, stores))}; }`));
      continue;
    }
    throw new Error(`${path}: unsupported top-level statement in <script>: ${st.getText().slice(0, 60)}`);
  }
  for (const f of later) f();
  const full = withStores(scope, stores);

  const methods: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (loops: Loop[], extra: Record<string, string> = {}): Scope => {
    const names = new Map(full.names);
    for (const l of loops) { names.delete(l.item); names.delete(l.index); }
    for (const [k, v] of Object.entries(extra)) names.set(k, v);
    return { names };
  };
  const expr = (code: string, loops: Loop[]) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(loops)}) { return ${rewrite(code, local(loops))}; }`);
    return m;
  };
  const handler = (node: any, loops: Loop[]) => {
    const m = `$e${next++}`;
    const e = node.expression;
    let body: string;
    if (e.type === 'ArrowFunctionExpression' || e.type === 'FunctionExpression') {
      // `(e) => (query = e.value)`: the parameter is the event.
      const param = e.params[0]?.name;
      const extra = param ? { [param]: '$event' } : {};
      body = e.body.type === 'BlockStatement' ? rewrite(src(e.body), local(loops, extra), 'statements') : `${rewrite(src(e.body), local(loops, extra)).slice(1, -1)};`;
    } else {
      const code = src(e);
      body = `${rewrite(code, local(loops)).slice(1, -1)}(${arity.get(code) === 0 ? '' : '$event'});`;
    }
    methods.push(`  ${m}(${[params(loops), '$event: $EventData'].filter(Boolean).join(', ')}) { ${body} }`);
    return m;
  };
  const value = (a: any, loops: Loop[]): Attr => {
    if (a.value === true) return { name: a.name, value: 'true' };
    if (a.value.length === 1 && a.value[0].type === 'Text') return { name: a.name, value: a.value[0].data };
    if (a.value.length === 1 && (a.value[0].type === 'MustacheTag' || a.value[0].type === 'AttributeShorthand')) return { name: a.name, method: expr(src(a.value[0].expression), loops) };
    // `class="row {extra}"`: text and expressions join as a template literal.
    const parts = a.value.map((v: any) => (v.type === 'Text' ? v.data.replace(/[`$\\]/g, '\\$&') : '${' + src(v.expression) + '}')).join('');
    return { name: a.name, method: expr('`' + parts + '`', loops) };
  };

  const nodes = (list: any[], loops: Loop[]): TNode[] => {
    const out: TNode[] = [];
    for (const n of list) {
      if (n.type === 'Text' || n.type === 'Comment') continue;
      if (n.type === 'Element' || n.type === 'InlineComponent') {
        const attrs: Attr[] = [];
        const events: Event[] = [];
        const isList = n.type === 'Element' && canonical(n.name) === 'ListView';
        for (const a of n.attributes) {
          if (isList && a.type === 'Attribute' && a.name === 'itemTemplateSelector') continue;
          if (a.type === 'Attribute') attrs.push(value(a, loops));
          else if (a.type === 'EventHandler') { if (a.expression) events.push({ name: a.name, method: handler(a, loops) }); }
          else throw new Error(`${path}: ${a.type} ${a.name} is not supported in a release build yet`);
        }
        if (n.type === 'InlineComponent') {
          if (!components.has(n.name)) throw new Error(`${path}: <${n.name}> is not an imported component`);
          out.push({ kind: 'component', name: n.name, props: attrs, events });
          continue;
        }
        const tag = canonical(n.name);
        if (!tag) throw new Error(`${path}: <${n.name}> is not a @nativescript/core element the release build knows`);
        out.push({ kind: 'element', tag, attrs, events, children: isList ? listTemplates(n, attrs, loops) : nodes(n.children, loops) });
        continue;
      }
      if (n.type === 'IfBlock') {
        const branches: { cond: string | null; body: TNode[] }[] = [];
        let block = n;
        while (block) {
          branches.push({ cond: expr(src(block.expression), loops), body: nodes(block.children, loops) });
          const otherwise = block.else;
          if (!otherwise) break;
          const elseif = otherwise.children.find((c: any) => c.type === 'IfBlock' && c.elseif);
          if (elseif) { block = elseif; continue; }
          branches.push({ cond: null, body: nodes(otherwise.children, loops) });
          break;
        }
        out.push({ kind: 'if', branches });
        continue;
      }
      if (n.type === 'EachBlock') {
        const item = n.context.name;
        const index = n.index ?? `$i${loops.length}`;
        const items = expr(src(n.expression), loops);
        const inner = [...loops, { item, index, param: `${item} = this.${items}(${args(loops)})[0], ${index} = 0` }];
        out.push({ kind: 'for', items, key: n.key ? expr(src(n.key), inner) : null, item, index, body: nodes(n.children, inner) });
        continue;
      }
      throw new Error(`${path}: ${n.type} in a template is not supported in a release build yet`);
    }
    return out;
  };
  /**
   * `<listView items>` with `<Template let:item key="…">` children, as svelte-native renders them: a template
   * sees its item only, the unkeyed one is the default, and `itemTemplateSelector` is core's `(item, index, items)`.
   */
  const listTemplates = (n: any, attrs: Attr[], loops: Loop[]): TNode[] => {
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${path}: <listView> needs items={…}`);
    const list = `this.${items.method}(${args(loops)})`;
    const selector = n.attributes.find((a: any) => a.type === 'Attribute' && a.name === 'itemTemplateSelector');
    if (selector) {
      const v = selector.value;
      if (v === true || v.length !== 1 || v[0].type !== 'MustacheTag') throw new Error(`${path}: itemTemplateSelector={…} needs a function`);
      const m = `$b${next++}`;
      const p = [params(loops), `$item = ${list}[0]`, '$index = 0'].filter(Boolean).join(', ');
      methods.push(`  ${m}(${p}): string { return ${rewrite(src(v[0].expression), local(loops))}($item, $index, ${list}); }`);
      attrs.push({ name: 'itemTemplateSelector', method: m });
    }
    const out: TNode[] = [];
    for (const t of n.children) {
      if (t.type === 'Text' || t.type === 'Comment') continue;
      if (t.type !== 'InlineComponent' || !templateTag || t.name !== templateTag) throw new Error(`${path}: a listView's children are <Template let:item> item templates`);
      let key = 'default';
      let item = `$item${loops.length}`;
      for (const a of t.attributes) {
        if (a.type === 'Let' && a.name === 'item') item = a.expression ? src(a.expression) : 'item';
        else if (a.type === 'Attribute' && a.name === 'key' && a.value !== true && a.value.length === 1 && a.value[0].type === 'Text') key = a.value[0].data;
        else throw new Error(`${path}: <${templateTag} ${a.type === 'Let' ? 'let:' : ''}${a.name}> is not supported in a release build yet`);
      }
      const index = `$i${loops.length}`;
      const loop: Loop = { item, index, param: `${item} = ${list}[0], ${index} = 0` };
      out.push({ kind: 'template', key, item, index, body: nodes(t.children, [...loops, loop]) });
    }
    return out;
  };

  const template = nodes(ast.html.children, []);

  const source = [
    `import { $signal, type EventData as $EventData } from '@nativescript/release';`,
    ...imports,
    '',
    `export default class ${name} {`,
    ...fields,
    ...methods,
    '}',
    '',
  ].join('\n');
  return { name, file: path + '.ts', source, props, template, derived };
}

/** `$favoriteIds` reads the store `favoriteIds`. */
function withStores(scope: Scope, stores: Set<string>): Scope {
  const names = new Map(scope.names);
  for (const s of stores) names.set('$' + s, `${s}.value`);
  return { names };
}
