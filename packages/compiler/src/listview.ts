import type { TNode } from './ir.ts';

type Template = Extract<TNode, { kind: 'template' }>;

/**
 * A row rendered by one function (React's `cellFactory`, Octane's `renderItem`, a Solid `<For>` body) as
 * ListView templates. A row that is a conditional (`cond ? <A/> : <B/>`) becomes one template per branch,
 * keyed by its position, and `selector` is the expression choosing among them, given how to call a
 * condition method with the row's variables; any other row is the one default template.
 */
export function rowTemplates(body: TNode[], item: string, index: string): { templates: Template[]; selector: ((call: (method: string) => string) => string) | null } {
  const [only] = body;
  if (body.length !== 1 || only.kind !== 'if') return { templates: [{ kind: 'template', key: 'default', item, index, body }], selector: null };
  // `a ? <A/> : b ? <B/> : <C/>` is one chain.
  const branches: { cond: string | null; body: TNode[] }[] = [];
  const add = (list: typeof branches) => {
    for (const b of list) {
      if (b.cond === null && b.body.length === 1 && b.body[0].kind === 'if') add(b.body[0].branches);
      else branches.push(b);
    }
  };
  add(only.branches);
  if (branches.at(-1)!.cond !== null) throw new Error('a list row that renders nothing for some items is not supported in a release build yet');
  const templates = branches.map((b, i): Template => ({ kind: 'template', key: String(i), item, index, body: b.body }));
  const selector = (call: (method: string) => string) => branches.map((b, i) => (b.cond ? `${call(b.cond)} ? '${i}' : ` : `'${i}'`)).join('');
  return { templates, selector };
}
