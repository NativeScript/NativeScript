// An object literal given undefined for a field makes the key; an untyped value that isn't a plain name may be null.
interface Opts { label?: string; size?: number; tint?: string | null; on?: boolean }
const a: Opts = { label: undefined };
console.log('label' in a, Object.keys(a).join(','), JSON.stringify(a), Object.keys({ ...a }).join(','), a.hasOwnProperty('label'));
const b: Opts = { size: 2, label: undefined, on: void 0 };
console.log(Object.keys(b).join(','), JSON.stringify(b), 'on' in b, Object.entries(b).length);
b.label = 'z';
console.log(Object.keys(b).join(','), JSON.stringify(b));
const pick = (o: Opts) => Object.keys(o).join('|');
console.log(pick({ tint: undefined }), pick({ label: 'q', size: undefined }));
const arr: Opts[] = [{ on: undefined }, { size: 1 }];
console.log(arr.map((o) => Object.keys(o).length).join(','), JSON.stringify(arr));

const raw: any = JSON.parse('{"t": null, "u": "blue", "list": [null, "red"]}');
const counter: any = { n: 0 };
const next = (): any => { counter.n++; return counter.n > 1 ? null : 'first'; };
const c: Opts = { tint: raw.t, size: 1 };
const d: Opts = { tint: raw['u'] };
const e: Opts = { tint: raw.list[0], label: 'e', size: raw.t };
const f: Opts = { tint: next() };
const g: Opts = { tint: next() };
for (const [tag, o] of [['c', c], ['d', d], ['e', e], ['f', f], ['g', g]] as [string, Opts][]) {
  const v: any = o.tint;
  console.log(tag, JSON.stringify(o), v === null, v === undefined, 'tint' in o, Object.keys(o).join(','));
}
console.log(counter.n);

const src: Opts = {};
const maybeSize = (n: number): number | undefined => (n > 1 ? n : undefined);
const h: Opts = { label: src.label, size: maybeSize(1), on: src.on ?? undefined };
const i: Opts = { size: maybeSize(3), label: h.size === undefined ? undefined : 'i' };
const tint: any = raw.t;
const label: string | undefined = undefined;
const j: Opts = { tint, label };
const missing: any = raw.nothing;
const k: Opts = { tint: missing, size: 0 };
for (const [tag, o] of [['h', h], ['i', i], ['j', j], ['k', k]] as [string, Opts][]) {
  const v: any = o.tint;
  console.log(tag, Object.keys(o).join(','), JSON.stringify(o), v === null, 'label' in o, 'tint' in o);
}
interface Bag { data?: any; n: number }
const bags: Bag[] = [{ data: undefined, n: 1 }, { data: raw.nothing, n: 2 }, { data: raw.t, n: 3 }, { n: 4 }];
console.log(bags.map((x) => Object.keys(x).join('/')).join(' '), JSON.stringify(bags), bags.map((x) => x.data === null).join(','));
