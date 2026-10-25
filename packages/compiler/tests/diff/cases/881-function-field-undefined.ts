// An object type's optional function-typed field given undefined is a key all the same.
interface Handlers { onTap?: () => void; format?: (n: number) => string; name?: string }
const show = (tag: string, o: Handlers) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o), 'onTap' in o, 'format' in o, typeof o.format);
const a: Handlers = { onTap: undefined };
show('literal', a);
const maybe = (on: boolean): ((n: number) => string) | undefined => (on ? (n: number) => `#${n}` : undefined);
const b: Handlers = { format: maybe(false), name: 'b' };
show('maybe off', b);
const c: Handlers = { format: maybe(true) };
show('maybe on', c);
console.log(c.format?.(3));
const d: Handlers = {};
d.onTap = undefined;
show('written', d);
d.format = maybe(true);
d.format = undefined;
show('written twice', d);
const raw: any = { onTap: undefined };
const e: Handlers = { onTap: raw.onTap, format: raw.missing };
show('untyped', e);
const list: Handlers[] = [{ onTap: undefined }, { onTap: () => {} }];
console.log(list.map((h) => Object.keys(h).length).join(','));

type Listener = { on?: (x: string) => void; off?: () => void; id: number };
const l: Listener = { id: 1, on: undefined };
const l2: Listener = { id: 2, off: raw.missing };
console.log(Object.keys(l).join(','), Object.keys(l2).join(','), JSON.stringify([l, l2]));
const inline: { cb?: () => number; n: number } = { cb: undefined, n: 1 };
console.log(Object.keys(inline).join(','), 'cb' in inline);
class Widget {
  onDone?: () => void;
  label?: string;
}
const w = new Widget();
w.onDone = undefined;
console.log(Object.keys(w).join(','), 'onDone' in w, JSON.stringify(w));
function take(h: { run?: () => void; size?: number }) { return Object.keys(h).join(','); }
console.log(take({ run: undefined }), take({ run: undefined, size: undefined }));
interface Methods { pick?(n: number): string; done?(): void; tag?: string }
const m1: Methods = { pick: undefined, tag: 't' };
const m2: Methods = { done: maybe(false) as any, pick: maybe(false) };
const m3: Methods = { pick: maybe(true) };
console.log(Object.keys(m1).join(','), Object.keys(m2).join(','), Object.keys(m3).join(','), m3.pick?.(4), 'done' in m2);
m3.pick = undefined;
console.log(Object.keys(m3).join(','), 'pick' in m3);
type Plain = { a?: string; b?: number };
const p1: Plain = { a: undefined };
const p2: { x?: number; y: number } = { x: undefined, y: 1 };
console.log(Object.keys(p1).join(','), Object.keys(p2).join(','), take({ size: undefined }));
interface Getters { label?: () => string | undefined; count?: (n: number) => number | null; deep?: () => () => void }
const g1: Getters = { label: undefined, count: undefined, deep: undefined };
const g2: Getters = { label: () => undefined };
g2.count = undefined;
console.log(Object.keys(g1).join(','), Object.keys(g2).join(','), JSON.stringify(g1), g2.label?.());
