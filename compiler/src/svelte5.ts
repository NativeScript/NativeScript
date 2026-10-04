import ts from 'typescript';
import { basename } from 'node:path';
import type { Attr, ComponentIR, Event, TNode, Watcher } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { canonical } from './elements.ts';

/** Svelte 5's `parse` from the app's own `svelte/compiler`. */
export type SvelteParse = (source: string, options: { modern: true }) => any;

/**
 * A Svelte Native component in Svelte 5's runes mode (`$state`, `$derived`,
 * `$effect`, `$props`, snippets, event attributes, keyed `{#each}`) as a
 * virtual class: state is a ref (deep, compared with `Object.is`, as a `$state`
 * proxy is), derived values are getters, and `$effect`s are watchers.
 */
export function svelte5Component(path: string, text: string, parse: SvelteParse, platform: 'ios' | 'android' = 'ios'): ComponentIR {
  const name = basename(path, '.svelte');
  const ast = parse(text, { modern: true });
  if (ast.module) throw new Error(`${path}: <script module> is not supported in a release build yet`);
  const src = (n: { start: number; end: number }) => text.slice(n.start, n.end);
  const script = ast.instance ? src(ast.instance.content) : '';
  const sf = ts.createSourceFile(path + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const imports: string[] = [];
  const fields: string[] = [];
  const props: string[] = [];
  const components = new Set<string>();
  const scope: Scope = { names: new Map() };
  const arity = new Map<string, number>();
  const later: (() => void)[] = [];
  const watchers: Watcher[] = [];
  const types = new Map<string, ts.TypeLiteralNode>();
  const rune = (e: ts.Expression | undefined) => {
    if (!e || !ts.isCallExpression(e)) return '';
    const callee = e.expression.getText();
    return /^\$(state|derived|effect|props|inspect|host|bindable)(\.\w+)?$/.test(callee) ? callee : '';
  };

  for (const st of sf.statements) {
    if ((ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && !ts.getModifiers(st)?.length) {
      const literal = ts.isInterfaceDeclaration(st) ? ts.factory.createTypeLiteralNode(st.members) : st.type;
      if (!ts.isTypeLiteralNode(literal)) throw new Error(`${path}: type ${st.name.text} is not supported in a component's script in a release build yet`);
      types.set(st.name.text, literal as ts.TypeLiteralNode);
    }
  }
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const from = (st.moduleSpecifier as ts.StringLiteral).text;
      // `./Row.svelte` is a component; `./store.svelte` (a `.svelte.ts` module) is imported by name.
      if (from.endsWith('.svelte') && st.importClause?.name && !st.importClause.namedBindings) {
        const local = st.importClause!.name!.text;
        components.add(local);
        imports.push(`import ${local} from '${from}';`);
        continue;
      }
      if (from === '@nativescript-community/svelte-native/components') throw new Error(`${path}: svelte-native's components (Template) are not supported with Svelte 5 in a release build yet`);
      imports.push(st.getText());
      continue;
    }
    if (ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) continue;
    if (ts.isFunctionDeclaration(st) && st.name) {
      const fn = st.name.text;
      arity.set(fn, st.parameters.length);
      scope.names.set(fn, `this.${fn}`);
      later.push(() => {
        const ret = st.type ? `: ${st.type.getText()}` : '';
        const async = ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '';
        fields.push(`  ${async}${fn}(${st.parameters.map((p) => p.getText()).join(', ')})${ret} ${rewrite(st.body!.getText(), scope, 'statements')}`);
      });
      continue;
    }
    if (ts.isExpressionStatement(st) && rune(st.expression)) {
      const call = st.expression as ts.CallExpression;
      if (rune(call) !== '$effect') throw new Error(`${path}: ${rune(call)} is not supported in a release build yet`);
      const fn = call.arguments[0];
      if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) || fn.parameters.length) throw new Error(`${path}: $effect needs a function`);
      if (!ts.isBlock(fn.body) || hasReturnValue(fn.body)) throw new Error(`${path}: an $effect's teardown is not supported in a release build yet`);
      const m = `$fx${watchers.length}`;
      watchers.push({ source: null, handler: m, arity: 0, immediate: false });
      later.push(() => fields.push(`  ${m}() ${rewrite((fn.body as ts.Block).getText(), scope, 'statements')}`));
      continue;
    }
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const kind = rune(d.initializer);
        if (kind === '$props') {
          if (!ts.isObjectBindingPattern(d.name)) throw new Error(`${path}: $props() needs destructuring (let { a, b }: Props = $props())`);
          const declared = d.type && ts.isTypeReferenceNode(d.type) ? types.get(d.type.typeName.getText()) : d.type;
          if (!declared || !ts.isTypeLiteralNode(declared)) throw new Error(`${path}: $props() needs a type (an object type, or an interface the script declares)`);
          for (const e of d.name.elements) {
            const prop = (e.propertyName ?? e.name).getText();
            if (e.initializer || e.dotDotDotToken || e.propertyName) throw new Error(`${path}: prop ${e.getText()} (defaults, renames, rest) is not supported in a release build yet`);
            const member = declared.members.find((m): m is ts.PropertySignature => ts.isPropertySignature(m) && m.name.getText() === prop);
            if (!member?.type) throw new Error(`${path}: prop "${prop}" needs a type`);
            if (member.questionToken) throw new Error(`${path}: optional prop "${prop}" is not supported in a release build yet`);
            if (ts.isFunctionTypeNode(member.type)) arity.set(prop, member.type.parameters.length);
            props.push(prop);
            fields.push(`  ${prop}!: ${member.type.getText()};`);
            scope.names.set(prop, `this.${prop}`);
          }
          continue;
        }
        if (!ts.isIdentifier(d.name)) throw new Error(`${path}: ${d.getText().slice(0, 40)}: destructuring is not supported in a release build yet`);
        const id = d.name.text;
        const init = d.initializer as ts.CallExpression | undefined;
        if (kind === '$state') {
          scope.names.set(id, `this.${id}.value`);
          const typeArg = init!.typeArguments?.[0]?.getText() ?? d.type?.getText();
          later.push(() => fields.push(`  ${id} = $ref${typeArg ? `<${typeArg}>` : ''}(${init!.arguments[0] ? rewrite(init!.arguments[0].getText(), scope) : 'undefined'});`));
          continue;
        }
        if (kind === '$derived' || kind === '$derived.by') {
          scope.names.set(id, `this.${id}`);
          later.push(() => fields.push(`  get ${id}()${d.type ? `: ${d.type.getText()}` : ''} ${derivedBody(init!, kind, scope, path)}`));
          continue;
        }
        if (kind) throw new Error(`${path}: ${kind} is not supported in a release build yet`);
        // A plain declaration: not reactive in runes mode.
        scope.names.set(id, `this.${id}`);
        const mutable = !!(st.declarationList.flags & ts.NodeFlags.Let);
        later.push(() => fields.push(`  ${mutable ? '' : 'readonly '}${id}${d.type ? `: ${d.type.getText()}` : ''} = ${d.initializer ? rewrite(d.initializer.getText(), scope) : 'undefined'};`));
      }
      continue;
    }
    throw new Error(`${path}: unsupported top-level statement in <script>: ${st.getText().slice(0, 60)}`);
  }
  for (const f of later) f();

  const methods: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  /** Where template code is: the loop variables in scope, and snippet parameters as the expressions they were rendered with. */
  type Ctx = { loops: Loop[]; names: Map<string, string> };
  const params = (c: Ctx) => c.loops.map((l) => l.param).join(', ');
  const args = (c: Ctx) => c.loops.flatMap((l) => [l.item, l.index]).join(', ');
  const local = (c: Ctx, extra: Record<string, string> = {}): Scope => {
    const names = new Map(scope.names);
    for (const l of c.loops) { names.delete(l.item); names.delete(l.index); }
    for (const [k, v] of c.names) names.set(k, v);
    for (const [k, v] of Object.entries(extra)) names.set(k, v);
    return { names };
  };
  const expr = (code: string, c: Ctx) => {
    const m = `$b${next++}`;
    methods.push(`  ${m}(${params(c)}) { return ${rewrite(code, local(c))}; }`);
    return m;
  };
  const handler = (e: any, c: Ctx) => {
    const m = `$e${next++}`;
    let body: string;
    if (e.type === 'ArrowFunctionExpression' || e.type === 'FunctionExpression') {
      // `(e) => (query = e.value)`: the parameter is the event.
      const param = e.params[0]?.name;
      const extra = param ? { [param]: '$event' } : {};
      body = e.body.type === 'BlockStatement' ? rewrite(src(e.body), local(c, extra), 'statements') : `${rewrite(src(e.body), local(c, extra)).slice(1, -1)};`;
    } else {
      const code = src(e);
      body = `${rewrite(code, local(c)).slice(1, -1)}(${arity.get(code) === 0 ? '' : '$event'});`;
    }
    methods.push(`  ${m}(${[params(c), '$event: $EventData'].filter(Boolean).join(', ')}) { ${body} }`);
    return m;
  };
  const value = (a: any, c: Ctx): Attr => {
    if (a.value === true) return { name: a.name, value: 'true' };
    if (!Array.isArray(a.value)) return { name: a.name, method: expr(src(a.value.expression), c) };
    if (a.value.length === 1 && a.value[0].type === 'Text') return { name: a.name, value: a.value[0].data };
    // `class="row {extra}"`: text and expressions join as a template literal.
    const parts = a.value.map((v: any) => (v.type === 'Text' ? v.data.replace(/[`$\\]/g, '\\$&') : '${' + src(v.expression) + '}')).join('');
    return { name: a.name, method: expr('`' + parts + '`', c) };
  };

  const snippets = new Map<string, any>();
  const collect = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'SnippetBlock') {
      if (snippets.has(n.expression.name)) throw new Error(`${path}: two snippets named ${n.expression.name}`);
      snippets.set(n.expression.name, n);
    }
    for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(collect); else if (v && typeof v === 'object') collect(v);
  };
  collect(ast.fragment);

  const nodes = (list: any[], c: Ctx): TNode[] => {
    const out: TNode[] = [];
    for (const n of list) {
      if (n.type === 'Text' || n.type === 'Comment' || n.type === 'SnippetBlock') continue;
      if (n.type === 'RegularElement' || n.type === 'Component') {
        const attrs: Attr[] = [];
        const events: Event[] = [];
        for (let a of n.attributes) {
          if (a.type !== 'Attribute') throw new Error(`${path}: ${a.type} ${a.name ?? ''} is not supported in a release build yet`);
          // svelte-native sets `ios:x` on iOS and `android:x` on Android only.
          const prefix = /^(ios|android):/.exec(a.name)?.[1];
          if (prefix && prefix !== platform) continue;
          if (prefix) a = { ...a, name: a.name.slice(prefix.length + 1) };
          else if (n.type === 'RegularElement' && a.name === 'checked' && a.value !== true && !Array.isArray(a.value)) {
            // Svelte 5's renderer API sets `checked` as an HTML boolean attribute: '' when true, removed (null) when
            // false. NativeScript's Switch rejects '' (core's booleanConverter throws), so the binding stops updating.
            throw new Error(`${path}: checked={…} under Svelte 5's custom renderer sets checked to '' or null, which a NativeScript Switch rejects; bind ios:checked and android:checked`);
          }
          // `ontap={…}` on an element listens to `tap`; on a component it is a callback prop.
          if (n.type === 'RegularElement' && /^on/.test(a.name)) {
            if (a.value === true || Array.isArray(a.value)) throw new Error(`${path}: ${a.name} needs a function`);
            events.push({ name: a.name.slice(2), method: handler(a.value.expression, c) });
          } else attrs.push(value(a, c));
        }
        if (n.type === 'Component') {
          if (!components.has(n.name)) throw new Error(`${path}: <${n.name}> is not an imported component`);
          if (n.fragment.nodes.some((x: any) => x.type !== 'Text' && x.type !== 'Comment')) throw new Error(`${path}: children of <${n.name}> are not supported in a release build yet`);
          out.push({ kind: 'component', name: n.name, props: attrs, events });
          continue;
        }
        const tag = canonical(n.name);
        if (!tag) throw new Error(`${path}: <${n.name}> is not a @nativescript/core element the release build knows`);
        if (tag === 'ListView') throw new Error(`${path}: <listView> with Svelte 5 is not supported in a release build yet`);
        out.push({ kind: 'element', tag, attrs, events, children: nodes(n.fragment.nodes, c) });
        continue;
      }
      if (n.type === 'IfBlock') {
        const branches: { cond: string | null; body: TNode[] }[] = [];
        let block = n;
        while (block) {
          branches.push({ cond: expr(src(block.test), c), body: nodes(block.consequent.nodes, c) });
          const otherwise = block.alternate;
          if (!otherwise) break;
          const elseif = otherwise.nodes.find((x: any) => x.type === 'IfBlock' && x.elseif);
          if (elseif) { block = elseif; continue; }
          branches.push({ cond: null, body: nodes(otherwise.nodes, c) });
          break;
        }
        out.push({ kind: 'if', branches });
        continue;
      }
      if (n.type === 'EachBlock') {
        if (n.fallback) throw new Error(`${path}: {:else} in {#each} is not supported in a release build yet`);
        if (n.context?.type !== 'Identifier') throw new Error(`${path}: {#each} needs an item name (destructuring is not supported in a release build yet)`);
        const item = n.context.name;
        const index = n.index ?? `$i${c.loops.length}`;
        const items = expr(src(n.expression), c);
        const inner: Ctx = { loops: [...c.loops, { item, index, param: `${item} = this.${items}(${args(c)})[0], ${index} = 0` }], names: withoutNames(c.names, [item, index]) };
        out.push({ kind: 'for', items, key: n.key ? expr(src(n.key), inner) : null, item, index, body: nodes(n.body.nodes, inner) });
        continue;
      }
      if (n.type === 'RenderTag') {
        // A snippet renders in place: its parameters read the expressions it was rendered with.
        const call = n.expression;
        const snippet = call.type === 'CallExpression' && call.callee.type === 'Identifier' ? snippets.get(call.callee.name) : undefined;
        if (!snippet) throw new Error(`${path}: {@render ${src(call)}} renders a snippet this component does not declare`);
        const names = new Map(c.names);
        snippet.parameters.forEach((p: any, i: number) => {
          if (p.type !== 'Identifier') throw new Error(`${path}: snippet ${call.callee.name}'s parameters need names`);
          const arg = call.arguments[i];
          names.set(p.name, arg ? rewrite(src(arg), local(c)) : 'undefined');
        });
        out.push(...nodes(snippet.body.nodes, { loops: c.loops, names }));
        continue;
      }
      throw new Error(`${path}: ${n.type} in a template is not supported in a release build yet`);
    }
    return out;
  };

  const template = nodes(ast.fragment.nodes, { loops: [], names: new Map() });

  const source = [
    `import { $ref, type EventData as $EventData } from '@nativescript/release';`,
    ...imports,
    '',
    `export default class ${name} {`,
    ...fields,
    ...methods,
    '}',
    '',
  ].join('\n');
  return { name, file: path + '.ts', source, props, template, watchers: watchers.length ? watchers : undefined };
}

function derivedBody(init: ts.CallExpression, kind: string, scope: Scope, path: string): string {
  const arg = init.arguments[0];
  if (kind === '$derived') return `{ return ${rewrite(arg.getText(), scope)}; }`;
  if (!arg || !(ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) throw new Error(`${path}: $derived.by needs a function`);
  return ts.isBlock(arg.body) ? rewrite(arg.body.getText(), scope, 'statements') : `{ return ${rewrite(arg.body.getText(), scope)}; }`;
}

function withoutNames(names: Map<string, string>, shadowed: string[]): Map<string, string> {
  const out = new Map(names);
  for (const s of shadowed) out.delete(s);
  return out;
}

function hasReturnValue(body: ts.Block): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found || ts.isFunctionLike(n)) return;
    if (ts.isReturnStatement(n) && n.expression) found = true;
    ts.forEachChild(n, visit);
  };
  ts.forEachChild(body, visit);
  return found;
}

/**
 * A `.svelte.ts` module's runes, as Svelte compiles them: a class's `$state`
 * field is a ref behind an accessor pair and a `$derived` field a getter.
 */
export function svelteModule(path: string, text: string): string | null {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits: { start: number; end: number; text: string }[] = [];
  const runeOf = (e: ts.Expression | undefined) => (e && ts.isCallExpression(e) && /^\$(state|derived)(\.\w+)?$/.test(e.expression.getText()) ? e.expression.getText() : '');
  const visit = (n: ts.Node) => {
    if (ts.isPropertyDeclaration(n) && ts.isClassLike(n.parent) && runeOf(n.initializer)) {
      const id = n.name.getText();
      const init = n.initializer as ts.CallExpression;
      const kind = runeOf(init);
      const type = init.typeArguments?.[0]?.getText() ?? n.type?.getText();
      let code: string;
      if (kind === '$state') {
        code = `$${id} = $ref${type ? `<${type}>` : ''}(${init.arguments[0]?.getText() ?? 'undefined'});\n  get ${id}()${type ? `: ${type}` : ''} { return this.$${id}.value; }\n  set ${id}(value${type ? `: ${type}` : ''}) { this.$${id}.value = value; }`;
      } else if (kind === '$derived') code = `get ${id}()${n.type ? `: ${n.type.getText()}` : ''} { return ${init.arguments[0].getText()}; }`;
      else throw new Error(`${path}: ${kind} is not supported in a release build yet`);
      edits.push({ start: n.getStart(), end: n.getEnd(), text: code });
      return;
    }
    if (ts.isCallExpression(n) && /^\$(state|derived|effect)\b/.test(n.expression.getText())) {
      throw new Error(`${path}: ${n.expression.getText()} outside a class field is not supported in a .svelte.ts module in a release build yet`);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!edits.length) return null;
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return `import { $ref } from '@nativescript/release';\n` + out;
}
