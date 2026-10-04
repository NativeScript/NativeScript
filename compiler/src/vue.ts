import { parse, type SFCDescriptor } from '@vue/compiler-sfc';
import ts from 'typescript';
import { basename } from 'node:path';
import type { Attr, ComponentIR, Event, TNode, Watcher } from './ir.ts';
import { rewrite, type Scope } from './rewrite.ts';
import { ELEMENTS, MODELS } from './elements.ts';

const VUE_KEPT = new Set(['$navigateTo', '$navigateBack', '$showModal', '$closeModal', 'ListItem', 'ListViewItemTapEvent']);

/** What a component's script declares, as the virtual class and its template read it. */
interface Bindings {
  path: string;
  imports: string[];
  fields: string[];
  props: string[];
  components: Set<string>;
  /** How a binding reads from script code, and from template expressions (where refs unwrap). */
  inScript: Scope;
  inTemplate: Scope;
  /** Script functions by parameter count: a handler named by path gets the event only if it takes one. */
  arity: Map<string, number>;
  /** Members written once every binding's name is known. */
  later: (() => void)[];
  propsName: string;
}

function bindings(path: string): Bindings {
  return { path, imports: [], fields: [], props: [], components: new Set(), inScript: { names: new Map(), unwrapValue: new Map() }, inTemplate: { names: new Map() }, arity: new Map(), later: [], propsName: '' };
}

/**
 * A NativeScript-Vue single-file component (`<script setup lang="ts">`, or the
 * Options API in `<script lang="ts">`, and a template of @nativescript/core
 * elements) as a virtual class and a template.
 */
export function vueComponent(path: string, text: string): ComponentIR {
  const { descriptor, errors } = parse(text, { filename: path });
  if (errors.length) throw new Error(`${path}: ${errors[0]}`);
  if (!descriptor.scriptSetup && descriptor.script) return vueOptions(path, descriptor);
  const name = basename(path, '.vue');
  const script = descriptor.scriptSetup?.content ?? '';
  const sf = ts.createSourceFile(path + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const b = bindings(path);

  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) { importOf(b, st); continue; }
    if (binding(b, st)) continue;
    throw new Error(`${path}: unsupported top-level statement in <script setup>: ${st.getText().slice(0, 60)}`);
  }
  if (b.propsName) b.inScript.names.set(b.propsName, 'this');
  for (const f of b.later) f();

  const { members, template } = vueTemplate(path, descriptor, b);
  return { name, file: path + '.ts', source: classSource(name, descriptor, b, members), props: b.props, template };
}

function importOf(b: Bindings, st: ts.ImportDeclaration) {
  const from = (st.moduleSpecifier as ts.StringLiteral).text;
  if (from.endsWith('.vue')) {
    const local = st.importClause?.name?.text;
    if (local) b.components.add(local);
    b.imports.push(`import ${local} from '${from}';`);
  } else if (from !== 'nativescript-vue') {
    b.imports.push(st.getText());
  } else {
    const navigation = st.importClause?.namedBindings;
    // Vue's own API is read by the front end; navigation, modals and types reach the class.
    const kept = navigation && ts.isNamedImports(navigation) ? navigation.elements.filter((e) => VUE_KEPT.has(e.name.text)).map((e) => e.getText()) : [];
    if (kept.length) b.imports.push(`import { ${kept.join(', ')} } from 'nativescript-vue';`);
  }
}

/** A `<script setup>` (or `setup()`) statement declaring a function, a ref, a computed, the props or a constant; false for anything else. */
function binding(b: Bindings, st: ts.Statement): boolean {
  const { path, fields, props, inScript, inTemplate, arity, later } = b;
  if (ts.isFunctionDeclaration(st) && st.name) {
    const fn = st.name.text;
    arity.set(fn, st.parameters.length);
    inScript.names.set(fn, `this.${fn}`);
    inTemplate.names.set(fn, `this.${fn}`);
    later.push(() => {
      const params = st.parameters.map((p) => p.getText()).join(', ');
      const ret = st.type ? `: ${st.type.getText()}` : '';
      fields.push(`  ${(ts.getModifiers(st as ts.FunctionDeclaration)?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '')}${fn}(${params})${ret} ${rewrite(st.body!.getText(), inScript, 'statements')}`);
    });
    return true;
  }
  if (!ts.isVariableStatement(st)) return false;
  const mutable = !!(st.declarationList.flags & ts.NodeFlags.Let);
  for (const d of st.declarationList.declarations) {
    if (mutable && ts.isIdentifier(d.name) && !(d.initializer && ts.isCallExpression(d.initializer) && ts.isIdentifier(d.initializer.expression) && ['ref', 'computed', 'defineProps'].includes(d.initializer.expression.text))) {
      // A plain `let`: per-instance state no template reads reactively.
      const id = d.name.text;
      const init = d.initializer;
      inScript.names.set(id, `this.${id}`);
      inTemplate.names.set(id, `this.${id}`);
      later.push(() => fields.push(`  ${id}${d.type ? `: ${d.type.getText()}` : ''} = ${init ? rewrite(init.getText(), inScript) : 'undefined'};`));
      continue;
    }
    if (!ts.isIdentifier(d.name) || !d.initializer) continue;
    const id = d.name.text;
    const init = d.initializer;
    const callee = ts.isCallExpression(init) && ts.isIdentifier(init.expression) ? init.expression.text : '';
    if (callee === 'defineProps' && ts.isCallExpression(init)) {
      b.propsName = id;
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
  return true;
}

function classSource(name: string, descriptor: SFCDescriptor, b: Bindings, members: string[], preamble: string[] = []): string {
  // nativescript-vue's global properties, which templates use without importing.
  for (const global of ['$closeModal', '$showModal']) {
    if (descriptor.template?.content.includes(global) && !b.imports.some((i) => i.includes(global))) {
      b.imports.push(`import { ${global} } from 'nativescript-vue';`);
    }
  }
  return [
    `import { $ref, type EventData as $EventData } from '@nativescript/release';`,
    ...preamble,
    ...b.imports,
    ``,
    `export default class ${name} {`,
    ...b.fields,
    ...members,
    `}`,
    ``,
  ].join('\n');
}

/** The template's expressions as methods (loop variables as typed parameters) and its tree. */
function vueTemplate(path: string, descriptor: SFCDescriptor, b: Bindings, preprocess: (code: string) => string = (code) => code) {
  const { components, inTemplate, arity } = b;
  const members: string[] = [];
  let next = 0;
  type Loop = { item: string; index: string; param: string };
  const params = (loops: Loop[]) => loops.map((l) => l.param).join(', ');
  const args = (loops: Loop[]) => loops.flatMap((l) => [l.item, l.index]);
  const expr = (code: string, loops: Loop[]) => {
    const scope = withLoops(inTemplate, loops);
    const m = `$b${next++}`;
    members.push(`  ${m}(${params(loops)}) { return ${rewrite(preprocess(code), scope)}; }`);
    return m;
  };
  const handler = (code: string, loops: Loop[]) => {
    const scope = withLoops(inTemplate, loops);
    const m = `$e${next++}`;
    const p = [params(loops), '$event: $EventData'].filter(Boolean).join(', ');
    code = preprocess(code);
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
    // Vue's mountElement sets `value` after the other props (a maximum before the value it bounds).
    const value = attrs.findIndex((a) => a.name === 'value');
    if (value >= 0) attrs.push(...attrs.splice(value, 1));
    if (!ELEMENTS.has(c.tag)) throw new Error(`${path}: <${c.tag}> is not a @nativescript/core element the release build knows`);
    if (c.tag === 'ListView') return { kind: 'element', tag: c.tag, attrs, events, children: listTemplates(c, attrs, loops) };
    return { kind: 'element', tag: c.tag, attrs, events, children: nodes(c.children, loops) };
  };

  /**
   * `<ListView :items>` with `<template #name="{ item, index }">` slots, as nativescript-vue renders them.
   * Its `itemTemplateSelector` is called with the row's `{ item, index, even, odd }` and returns a slot name.
   */
  const listTemplates = (c: any, attrs: Attr[], loops: Loop[]): TNode[] => {
    const items = attrs.find((a) => a.name === 'items');
    if (!items || !('method' in items)) throw new Error(`${path}: <ListView> needs :items`);
    const row = `${items.method}(${args(loops).join(', ')})[0]`;
    const at = attrs.findIndex((a) => a.name === 'itemTemplateSelector');
    if (at >= 0) {
      const selector = c.props.find((p: any) => p.type === 7 && p.name === 'bind' && p.arg?.content === 'itemTemplateSelector');
      const m = `$b${next++}`;
      const p = [params(loops), `$item = this.${row}`, '$index = 0'].filter(Boolean).join(', ');
      members.push(`  ${m}(${p}): string { return ${rewrite(preprocess(selector.exp.content), withLoops(inTemplate, loops))}({ item: $item, index: $index, even: $index % 2 === 0, odd: $index % 2 !== 0 }); }`);
      attrs[at] = { name: 'itemTemplateSelector', method: m };
    }
    const out: TNode[] = [];
    for (const t of c.children) {
      if (t.type !== 1) continue;
      const slot = t.props.find((p: any) => p.type === 7 && p.name === 'slot');
      if (t.tag !== 'template' || !slot) throw new Error(`${path}: a ListView's children are <template #name="{ item }"> slots`);
      const vars = new Map<string, string>();
      for (const part of (slot.exp?.content ?? '').replace(/^\s*\{|\}\s*$/g, '').split(',')) {
        const [k, alias] = part.split(':').map((x: string) => x.trim());
        if (k) vars.set(k, alias || k);
      }
      for (const k of vars.keys()) if (k !== 'item' && k !== 'index') throw new Error(`${path}: a ListView slot's "${k}" is not supported in a release build yet`);
      const item = vars.get('item') ?? `$item${loops.length}`;
      const index = vars.get('index') ?? `$i${loops.length}`;
      const loop: Loop = { item, index, param: `${item} = this.${row}, ${index} = 0` };
      out.push({ kind: 'template', key: slot.arg?.content ?? 'default', item, index, body: nodes(t.children, [...loops, loop]) });
    }
    return out;
  };

  const template = nodes(descriptor.template?.ast?.children ?? [], []);
  return { members, template };
}

function withLoops(scope: Scope, loops: { item: string; index: string }[]): Scope {
  const names = new Map(scope.names);
  // A loop variable shadows a binding of the same name.
  for (const l of loops) { names.delete(l.item); names.delete(l.index); }
  return { names, unwrapValue: scope.unwrapValue };
}

const PROP_TYPES: Record<string, string> = { String: 'string', Number: 'number', Boolean: 'boolean' };

/** nativescript-vue's instance methods, called on `this` in the Options API. */
const INSTANCE_GLOBALS = new Set(['$navigateTo', '$navigateBack', '$showModal', '$closeModal']);

/**
 * A component written with the Options API (`export default defineComponent({ props, emits, data,
 * computed, methods, watch })`, or `setup()` returning its bindings) as a virtual class: data are
 * refs, computed properties getters, and `this.x` reads a ref's value, as Vue's instance proxy does.
 */
function vueOptions(path: string, descriptor: SFCDescriptor): ComponentIR {
  const name = basename(path, '.vue');
  const script = descriptor.script!.content;
  const sf = ts.createSourceFile(path + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const b = bindings(path);
  let options: ts.ObjectLiteralExpression | undefined;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) continue;
    if (ts.isExportAssignment(st) && !st.isExportEquals) {
      const e = st.expression;
      if (ts.isObjectLiteralExpression(e)) options = e;
      else if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'defineComponent' && e.arguments[0] && ts.isObjectLiteralExpression(e.arguments[0])) options = e.arguments[0];
      else throw new Error(`${path}: export default needs an options object or defineComponent({ … })`);
      continue;
    }
    throw new Error(`${path}: unsupported top-level statement in <script>: ${st.getText().slice(0, 60)}`);
  }
  if (!options) throw new Error(`${path}: no export default component`);
  for (const st of sf.statements) if (ts.isImportDeclaration(st)) importOf(b, st);

  const option = (key: string) => options!.properties.find((p) => p.name && ts.isIdentifier(p.name) && p.name.text === key);
  for (const p of options.properties) {
    const key = p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : '';
    if (!['name', 'components', 'props', 'emits', 'data', 'computed', 'methods', 'watch', 'setup'].includes(key)) throw new Error(`${path}: the "${key || p.getText().slice(0, 30)}" option is not supported in a release build yet`);
  }
  const object = (key: string): ts.ObjectLiteralExpression | undefined => {
    const p = option(key);
    if (!p) return undefined;
    if (ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(p.initializer)) return p.initializer;
    throw new Error(`${path}: the ${key} option needs an object`);
  };
  const methodOf = (p: ts.ObjectLiteralElementLike, what: string): ts.MethodDeclaration => {
    if (ts.isMethodDeclaration(p) && p.body) return p;
    throw new Error(`${path}: ${what} "${p.name?.getText()}" needs to be a method`);
  };

  // Props: `{ recipe: { type: Object as PropType<Recipe>, required: true }, size: Number }`.
  const optional: string[] = [];
  for (const p of object('props')?.properties ?? []) {
    if (!ts.isPropertyAssignment(p)) throw new Error(`${path}: prop ${p.getText().slice(0, 40)}`);
    const prop = p.name.getText();
    const spec = p.initializer;
    const field = (k: string) => ts.isObjectLiteralExpression(spec) ? spec.properties.find((q): q is ts.PropertyAssignment => ts.isPropertyAssignment(q) && q.name.getText() === k)?.initializer : undefined;
    const typeOf = (e: ts.Expression | undefined): string => {
      if (!e) throw new Error(`${path}: prop "${prop}" needs a type`);
      if (ts.isAsExpression(e) && ts.isTypeReferenceNode(e.type) && e.type.typeName.getText() === 'PropType' && e.type.typeArguments?.[0]) return e.type.typeArguments[0].getText();
      if (ts.isIdentifier(e) && PROP_TYPES[e.text]) return PROP_TYPES[e.text];
      throw new Error(`${path}: prop "${prop}" needs a type a release build can read (String, Number, Boolean or X as PropType<T>)`);
    };
    const type = typeOf(ts.isObjectLiteralExpression(spec) ? field('type') : spec);
    const required = field('required')?.kind === ts.SyntaxKind.TrueKeyword;
    if (field('default')) throw new Error(`${path}: a default for prop "${prop}" is not supported in a release build yet`);
    // An absent Boolean prop is false in Vue, not undefined.
    if (!required && type === 'boolean') throw new Error(`${path}: Boolean prop "${prop}" needs required: true in a release build`);
    b.props.push(prop);
    if (!required) optional.push(prop);
    b.fields.push(`  ${prop}${required ? '!' : '?'}: ${type};`);
    b.inTemplate.names.set(prop, `this.${prop}`);
  }

  // Emits: `['select']`, or `{ select: null, change: (value: number) => true }` whose validators type the payload.
  const emits = new Map<string, string>();
  const emitsOption = option('emits');
  if (emitsOption) {
    if (!ts.isPropertyAssignment(emitsOption)) throw new Error(`${path}: emits`);
    const e = emitsOption.initializer;
    if (ts.isArrayLiteralExpression(e)) for (const n of e.elements) emits.set((n as ts.StringLiteral).text, '');
    else if (ts.isObjectLiteralExpression(e)) {
      for (const q of e.properties) {
        const v = ts.isPropertyAssignment(q) ? q.initializer : undefined;
        const param = v && (ts.isArrowFunction(v) || ts.isFunctionExpression(v)) ? v.parameters[0] : undefined;
        emits.set(q.name!.getText(), param ? param.type?.getText() ?? 'any' : '');
      }
    } else throw new Error(`${path}: emits needs an array or an object`);
  }
  const allCode = script + (descriptor.template?.content ?? '');
  const outputFields: Record<string, string> = {};
  for (const [event, declared] of emits) {
    // An event emitted with a payload passes it on; one emitted bare is `void`.
    const payload = declared || (new RegExp(`emit\\(\\s*['"]${event}['"]\\s*,`).test(allCode) ? 'any' : 'void');
    outputFields[event] = `$emit_${event}`;
    b.fields.push(`  readonly $emit_${event} = output<${payload}>();`);
  }
  /** `$emit('select', x)` and `emit('select', x)`: the event's emitter. */
  const emitCall = (code: string, emitName: string) =>
    code.replace(new RegExp(`(?<![\\w.$])(?:this\\.)?${emitName.replace(/\$/g, '\\$')}\\(\\s*['"]([\\w-]+)['"]\\s*(,\\s*)?`, 'g'), (_, event: string) => {
      if (!emits.has(event)) throw new Error(`${path}: emits "${event}", which the emits option does not declare`);
      return `this.$emit_${event}.emit(`;
    });

  // `this.x` reads a data property or a ref `setup()` returned by its value.
  const refs = new Set<string>();
  const thisCode = (code: string, kind: 'expression' | 'statements') => {
    const wrapped = kind === 'expression' ? `(${code})` : code;
    const file = ts.createSourceFile('snippet.ts', wrapped, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const edits: { start: number; end: number; text: string }[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isPropertyAccessExpression(n) && n.expression.kind === ts.SyntaxKind.ThisKeyword) {
        const k = n.name.text;
        if (refs.has(k)) edits.push({ start: n.getStart(), end: n.getEnd(), text: `this.${k}.value` });
        else if (INSTANCE_GLOBALS.has(k)) { edits.push({ start: n.getStart(), end: n.getEnd(), text: k }); globals.add(k); }
        else if (k.startsWith('$') && k !== '$emit') throw new Error(`${path}: this.${k} is not supported in a release build yet`);
        return;
      }
      ts.forEachChild(n, visit);
    };
    visit(file);
    let out = wrapped;
    for (const e of edits.sort((x, y) => y.start - x.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    return emitCall(out, '$emit');
  };
  const globals = new Set<string>();

  // setup(props, { emit }): its statements are bindings, as in <script setup>; what it returns, the template reads.
  const setup = option('setup');
  let setupEmit = '';
  if (setup) {
    const m = methodOf(setup, 'setup');
    const [propsParam, context] = m.parameters;
    if (propsParam) b.propsName = (propsParam.name as ts.Identifier).text;
    if (context) {
      if (!ts.isObjectBindingPattern(context.name)) throw new Error(`${path}: setup's context needs destructuring ({ emit })`);
      for (const e of context.name.elements) {
        if ((e.propertyName ?? e.name).getText() !== 'emit') throw new Error(`${path}: setup's ${e.getText()} is not supported in a release build yet`);
        setupEmit = e.name.getText();
      }
    }
    const statements = m.body!.statements;
    for (const st of statements) {
      if (ts.isReturnStatement(st)) {
        if (st !== statements.at(-1) || !st.expression || !ts.isObjectLiteralExpression(st.expression)) throw new Error(`${path}: setup() needs to end returning an object of its bindings`);
        for (const r of st.expression.properties) if (!ts.isShorthandPropertyAssignment(r)) throw new Error(`${path}: setup() returns ${r.getText()}; return bindings by name ({ color, select })`);
        continue;
      }
      const source = setupEmit ? ts.createSourceFile('st.ts', emitCall(st.getText(), setupEmit), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS).statements[0] : st;
      if (!binding(b, source)) throw new Error(`${path}: unsupported statement in setup(): ${st.getText().slice(0, 60)}`);
    }
    for (const [k, v] of b.inTemplate.names) if (v === `this.${k}.value`) refs.add(k);
  }

  const data = option('data');
  const dataFields: { key: string; init: string }[] = [];
  if (data) {
    const fn = ts.isMethodDeclaration(data) ? data : ts.isPropertyAssignment(data) && (ts.isArrowFunction(data.initializer) || ts.isFunctionExpression(data.initializer)) ? data.initializer : undefined;
    const body = fn?.body;
    const returned = body && (ts.isBlock(body) ? body.statements.length === 1 && ts.isReturnStatement(body.statements[0]) ? body.statements[0].expression : undefined : ts.isParenthesizedExpression(body) ? body.expression : body);
    if (!returned || !ts.isObjectLiteralExpression(returned)) throw new Error(`${path}: data() needs to return an object literal`);
    for (const q of returned.properties) {
      if (!ts.isPropertyAssignment(q)) throw new Error(`${path}: data property ${q.getText()}`);
      const key = q.name.getText();
      refs.add(key);
      b.inTemplate.names.set(key, `this.${key}.value`);
      dataFields.push({ key, init: q.initializer.getText() });
    }
  }
  for (const p of object('computed')?.properties ?? []) {
    const k = p.name!.getText();
    b.inTemplate.names.set(k, `this.${k}`);
  }
  for (const p of object('methods')?.properties ?? []) {
    const m = methodOf(p, 'method');
    const k = m.name.getText();
    b.arity.set(k, m.parameters.length);
    b.inTemplate.names.set(k, `this.${k}`);
  }
  if (b.propsName) b.inScript.names.set(b.propsName, 'this');
  for (const f of b.later) f();
  for (const d of dataFields) b.fields.push(`  ${d.key} = $ref(${thisCode(d.init, 'expression')});`);

  const method = (m: ts.MethodDeclaration, name = m.name.getText()) => {
    const async = ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.AsyncKeyword) ? 'async ' : '';
    return `  ${async}${name}(${m.parameters.map((p) => p.getText()).join(', ')})${m.type ? `: ${m.type.getText()}` : ''} ${thisCode(m.body!.getText(), 'statements')}`;
  };
  for (const p of object('computed')?.properties ?? []) {
    const m = methodOf(p, 'computed property');
    b.fields.push(`  get ${m.name.getText()}()${m.type ? `: ${m.type.getText()}` : ''} ${thisCode(m.body!.getText(), 'statements')}`);
  }
  for (const p of object('methods')?.properties ?? []) b.fields.push(method(methodOf(p, 'method')));

  // watch: { key(value, old) {…} } or { key: { handler(value, old) {…}, immediate } }, in declaration order.
  const watchers: Watcher[] = [];
  for (const p of object('watch')?.properties ?? []) {
    const key = p.name!.getText().replace(/^['"]|['"]$/g, '');
    let handler: ts.MethodDeclaration;
    let immediate = false;
    if (ts.isMethodDeclaration(p)) handler = methodOf(p, 'watcher');
    else if (ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(p.initializer)) {
      const h = p.initializer.properties.find((q) => q.name?.getText() === 'handler');
      if (!h) throw new Error(`${path}: watcher "${key}" needs a handler`);
      handler = methodOf(h, 'watcher');
      for (const q of p.initializer.properties) {
        if (q === h) continue;
        const v = ts.isPropertyAssignment(q) ? q.initializer.kind : null;
        if (q.name?.getText() === 'immediate' && (v === ts.SyntaxKind.TrueKeyword || v === ts.SyntaxKind.FalseKeyword)) immediate = v === ts.SyntaxKind.TrueKeyword;
        else throw new Error(`${path}: watcher option ${q.getText()} is not supported in a release build yet`);
      }
    } else throw new Error(`${path}: watcher "${key}" needs a method or { handler }`);
    const n = watchers.length;
    const [first, ...rest] = key.split('.');
    const read = refs.has(first) ? `this.${first}.value` : `this.${first}`;
    b.fields.push(`  $ws${n}() { return ${[read, ...rest].join('.')}; }`);
    if (handler.parameters.length > 2) throw new Error(`${path}: watcher "${key}" takes (value, old)`);
    // The old value is undefined on an immediate watcher's first call.
    const params = handler.parameters.map((q, i) => (i === 1 && !q.questionToken && q.type ? `${q.name.getText()}?: ${q.type.getText()}` : q.getText()));
    b.fields.push(`  $wh${n}(${params.join(', ')}) ${thisCode(handler.body!.getText(), 'statements')}`);
    watchers.push({ source: `$ws${n}`, handler: `$wh${n}`, arity: handler.parameters.length, immediate });
  }

  for (const [event] of emits) b.inTemplate.names.set(`$emit_${event}`, `this.$emit_${event}`);
  const { members, template } = vueTemplate(path, descriptor, b, (code) => emitCall(code, '$emit'));
  for (const g of globals) if (!b.imports.some((i) => i.includes(g))) b.imports.push(`import { ${g} } from 'nativescript-vue';`);
  const preamble = emits.size ? [`import { output } from '@angular/core';`] : [];
  return { name, file: path + '.ts', source: classSource(name, descriptor, b, members, preamble), props: b.props, optional: optional.length ? optional : undefined, template, outputs: emits.size ? [...emits.keys()] : undefined, outputFields: emits.size ? outputFields : undefined, watchers: watchers.length ? watchers : undefined };
}
