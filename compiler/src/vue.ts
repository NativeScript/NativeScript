import { parse } from '@vue/compiler-sfc';
import ts from 'typescript';
import { basename } from 'node:path';
import type { Attr, ComponentIR, Event, TNode } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { ELEMENTS, MODELS } from './elements.ts';

/**
 * A NativeScript-Vue single-file component (`<script setup lang="ts">` and a
 * template of @nativescript/core elements) as a virtual class and a template.
 */
export function vueComponent(path: string, text: string): ComponentIR {
  const name = basename(path, '.vue');
  const { descriptor, errors } = parse(text, { filename: path });
  if (errors.length) throw new Error(`${path}: ${errors[0]}`);
  const script = descriptor.scriptSetup?.content ?? '';
  const sf = ts.createSourceFile(path + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const imports: string[] = [];
  const fields: string[] = [];
  const props: string[] = [];
  const components = new Set<string>();
  // How a binding reads from script code, and from template expressions (where refs unwrap).
  const inScript: Scope = { names: new Map(), unwrapValue: new Map() };
  const inTemplate: Scope = { names: new Map() };
  let propsName = '';
  // Script functions by parameter count: a handler named by path gets the event only if it takes one.
  const arity = new Map<string, number>();
  const later: (() => void)[] = [];

  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const from = (st.moduleSpecifier as ts.StringLiteral).text;
      if (from.endsWith('.vue')) {
        const local = st.importClause?.name?.text;
        if (local) components.add(local);
        imports.push(`import ${local} from '${from}';`);
      } else if (from !== 'nativescript-vue') {
        imports.push(st.getText());
      } else {
        const navigation = st.importClause?.namedBindings;
        if (navigation && ts.isNamedImports(navigation) && navigation.elements.some((e) => e.name.text === '$navigateTo')) imports.push(`import { $navigateTo } from 'nativescript-vue';`);
      }
      continue;
    }
    if (ts.isFunctionDeclaration(st) && st.name) {
      const fn = st.name.text;
      arity.set(fn, st.parameters.length);
      inScript.names.set(fn, `this.${fn}`);
      inTemplate.names.set(fn, `this.${fn}`);
      later.push(() => {
        const params = st.parameters.map((p) => p.getText()).join(', ');
        const ret = st.type ? `: ${st.type.getText()}` : '';
        fields.push(`  ${fn}(${params})${ret} ${rewrite(st.body!.getText(), inScript, 'statements')}`);
      });
      continue;
    }
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name) || !d.initializer) continue;
        const id = d.name.text;
        const init = d.initializer;
        const callee = ts.isCallExpression(init) && ts.isIdentifier(init.expression) ? init.expression.text : '';
        if (callee === 'defineProps' && ts.isCallExpression(init)) {
          propsName = id;
          const literal = init.typeArguments?.[0];
          if (!literal || !ts.isTypeLiteralNode(literal)) throw new Error(`${path}: defineProps needs a type literal`);
          for (const m of literal.members) {
            if (!ts.isPropertySignature(m) || !m.type) continue;
            const p = (m.name as ts.Identifier).text;
            props.push(p);
            fields.push(`  ${p}!: ${m.type.getText()};`);
            inTemplate.names.set(p, `this.${p}`);
          }
          continue;
        }
        if (callee === 'ref' && ts.isCallExpression(init)) {
          inScript.names.set(id, `this.${id}`);
          inTemplate.names.set(id, `this.${id}.value`);
          const typeArgs = init.typeArguments ? `<${init.typeArguments.map((t) => t.getText()).join(', ')}>` : '';
          later.push(() => fields.push(`  ${id} = $ref${typeArgs}(${init.arguments[0] ? rewrite(init.arguments[0].getText(), inScript) : 'undefined'});`));
          continue;
        }
        if (callee === 'computed' && ts.isCallExpression(init)) {
          inScript.unwrapValue!.set(id, `this.${id}`);
          inTemplate.names.set(id, `this.${id}`);
          later.push(() => {
            const fn = init.arguments[0];
            if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) throw new Error(`${path}: computed(${id}) needs a function`);
            const body = ts.isBlock(fn.body) ? rewrite(fn.body.getText(), inScript, 'statements') : `{ return ${rewrite(fn.body.getText(), inScript)}; }`;
            fields.push(`  get ${id}()${fn.type ? `: ${fn.type.getText()}` : ''} ${body}`);
          });
          continue;
        }
        inScript.names.set(id, `this.${id}`);
        inTemplate.names.set(id, `this.${id}`);
        later.push(() => fields.push(`  readonly ${id} = ${rewrite(init.getText(), inScript)};`));
      }
      continue;
    }
    throw new Error(`${path}: unsupported top-level statement in <script setup>: ${st.getText().slice(0, 60)}`);
  }
  if (propsName) inScript.names.set(propsName, 'this');
  for (const f of later) f();

  // Template expressions become methods; loop variables become typed parameters.
  const members: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]);
  const expr = (code: string, loops: Loop[]) => {
    const scope = withLoops(inTemplate, loops);
    const m = `$b${next++}`;
    members.push(`  ${m}(${params(loops)}) { return ${rewrite(code, scope)}; }`);
    return m;
  };
  const handler = (code: string, loops: Loop[]) => {
    const scope = withLoops(inTemplate, loops);
    const m = `$e${next++}`;
    const p = [params(loops), '$event: EventData'].filter(Boolean).join(', ');
    // A method path (`onPlan`, `store.save`) is called with the event; anything else is a statement.
    const isPath = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(code.trim());
    const takesEvent = arity.get(code.trim()) !== 0;
    const body = isPath ? `${rewrite(code, scope).slice(1, -1)}(${takesEvent ? '$event' : ''});` : rewrite(code, scope, 'statements');
    members.push(`  ${m}(${p}) { ${body} }`);
    return m;
  };

  const nodes = (children: any[], loops: Loop[]): TNode[] => {
    const out: TNode[] = [];
    let chain: Extract<TNode, { kind: 'if' }> | null = null;
    for (const c of children) {
      if (c.type !== 1) continue; // elements only: NativeScript has no text nodes or comments
      const dirs = c.props.filter((p: any) => p.type === 7);
      const vFor = dirs.find((d: any) => d.name === 'for');
      const vIf = dirs.find((d: any) => d.name === 'if' || d.name === 'else-if' || d.name === 'else');
      const build = (inner: Loop[]): TNode => element(c, inner);
      let node: TNode;
      if (vFor) {
        const m = /^\s*(?:\(\s*([\w$]+)\s*(?:,\s*([\w$]+)\s*)?\)|([\w$]+))\s+(?:in|of)\s+([\s\S]+)$/.exec(vFor.exp.content);
        if (!m) throw new Error(`${path}: v-for "${vFor.exp.content}"`);
        const item = m[1] ?? m[3];
        const index = m[2] ?? `$i${loops.length}`;
        const items = expr(m[4], loops);
        const loop: Loop = { item, index, param: `${item} = this.${items}(${args(loops).join(', ')})[0], ${index} = 0` };
        const inner = [...loops, loop];
        const keyDir = c.props.find((p: any) => p.type === 7 && p.name === 'bind' && p.arg?.content === 'key');
        node = { kind: 'for', items, key: keyDir ? expr(keyDir.exp.content, inner) : null, item, index, body: [build(inner)] };
      } else node = build(loops);
      if (vIf && !vFor) {
        if (vIf.name === 'if') {
          chain = { kind: 'if', branches: [{ cond: expr(vIf.exp.content, loops), body: [node] }] };
          out.push(chain);
        } else if (chain) {
          chain.branches.push({ cond: vIf.name === 'else' ? null : expr(vIf.exp.content, loops), body: [node] });
          if (vIf.name === 'else') chain = null;
        }
        continue;
      }
      chain = null;
      out.push(node);
    }
    return out;
  };

  const element = (c: any, loops: Loop[]): TNode => {
    const attrs: Attr[] = [];
    const events: Event[] = [];
    for (const p of c.props) {
      if (p.type === 6) { if (p.name !== 'key') attrs.push({ name: p.name, value: p.value?.content ?? '' }); continue; }
      if (p.name === 'bind' && p.arg) { if (p.arg.content !== 'key') attrs.push({ name: p.arg.content, method: expr(p.exp.content, loops) }); continue; }
      if (p.name === 'on' && p.arg) { events.push({ name: p.arg.content, method: handler(p.exp.content, loops) }); continue; }
      if (p.name === 'model') {
        const model = MODELS[c.tag];
        if (!model) throw new Error(`${path}: v-model on <${c.tag}>`);
        attrs.push({ name: model.prop, method: expr(p.exp.content, loops) });
        events.push({ name: model.event, method: handler(`${p.exp.content} = $event.value as ${model.type}`, loops) });
      }
    }
    if (components.has(c.tag)) return { kind: 'component', name: c.tag, props: attrs, events };
    if (!ELEMENTS.has(c.tag)) throw new Error(`${path}: <${c.tag}> is not a @nativescript/core element the release build knows`);
    return { kind: 'element', tag: c.tag, attrs, events, children: nodes(c.children, loops) };
  };

  const template = nodes(descriptor.template?.ast?.children ?? [], []);
  const source = [
    `import { $ref, type EventData } from '@nativescript/release';`,
    ...imports,
    ``,
    `export default class ${name} {`,
    ...fields,
    ...members,
    `}`,
    ``,
  ].join('\n');
  return { name, file: path + '.ts', source, props, template };
}

function withLoops(scope: Scope, loops: { item: string; index: string }[]): Scope {
  const names = new Map(scope.names);
  // A loop variable shadows a binding of the same name.
  for (const l of loops) { names.delete(l.item); names.delete(l.index); }
  return { names, unwrapValue: scope.unwrapValue };
}
