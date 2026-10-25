// @assign-fields
// Class fields assigned, not defined (an app below ES2022): an optional field is a key once written, undefined too.
class Item {
  id = 1;
  label?: string;
  count?: number;
  note?: string | null;
  data?: any;
  constructor(label?: string, early?: boolean) {
    if (early) this.label = label;
  }
  clear() {
    this.count = undefined;
  }
}
const show = (tag: string, o: Item) => console.log(tag, 'label' in o, 'count' in o, 'note' in o, 'data' in o, Object.keys(o).join(','), JSON.stringify(o), Object.keys({ ...o }).join(','), Object.entries(o).length, o.hasOwnProperty('count'));
const a = new Item();
show('new', a);
a.count = undefined;
show('count', a);
const b = new Item(undefined, true);
show('ctor', b);
const c = new Item('c', true);
c.clear();
c.note = undefined;
show('clear', c);
const d = new Item();
const patch: any = { count: undefined, data: undefined };
Object.assign(d, patch);
show('assign', d);
const e = new Item();
(e as any)['note'] = undefined;
show('by key', e);
const maybe = (n: number): number | undefined => (n > 0 ? n : undefined);
const f = new Item();
f.count = maybe(0);
const g = new Item();
g.count = maybe(2);
g.count = maybe(-1);
show('maybe', f);
show('again', g);
const keys: string[] = [];
for (const k in b) keys.push(k);
console.log('for-in', keys.join(','));

class Sub extends Item {
  extra?: string;
  constructor(extra?: string) {
    super();
    this.extra = extra;
  }
}
const s = new Sub();
console.log('sub', Object.keys(s).join(','), 'extra' in s, JSON.stringify(s));
s.label = undefined;
console.log('sub label', 'label' in s, Object.keys(s).sort().join(','));

class Plain {
  x?: number;
  y?: string = undefined;
  constructor(public z?: number) {}
}
const p = new Plain();
console.log('plain', Object.keys(p).join(','), 'x' in p, 'y' in p, 'z' in p, JSON.stringify(p));
p.x = undefined;
console.log('plain x', 'x' in p, Object.keys(p).sort().join(','));

class Holder {
  items?: number[];
  map?: Map<string, number>;
  other?: Holder;
  set(items: number[] | undefined, map: Map<string, number> | undefined, other: Holder | undefined) {
    this.items = items;
    this.map = map;
    this.other = other;
  }
}
const arr = [1, 2];
const m = new Map<string, number>();
const h = new Holder();
const o = new Holder();
h.set(arr, m, o);
arr.push(3);
m.set('a', 1);
console.log(h.items?.length, h.map?.size, h.other === o, h.items === arr, h.map === m, Object.keys(o).join(','));
h.set(undefined, undefined, undefined);
console.log(Object.keys(h).join(','), JSON.stringify(h));
