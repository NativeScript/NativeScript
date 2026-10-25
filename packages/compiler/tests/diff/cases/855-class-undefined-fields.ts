// A class's optional field written undefined is a key (`in`, Object.keys, spread, for-in) that JSON leaves out.
class Item {
  id = 1;
  label?: string;
  count?: number;
  done?: boolean | null;
  constructor(label?: string) {
    if (label !== undefined) this.label = label;
  }
}
const show = (tag: string, o: Item) => console.log(tag, 'label' in o, 'count' in o, 'done' in o, Object.keys(o).join(','), JSON.stringify(o), Object.keys({ ...o }).join(','), Object.entries(o).length, o.hasOwnProperty('count'));
const a = new Item();
show('new', a);
a.count = undefined;
show('count=undefined', a);
a.label = 'x';
a.done = undefined;
show('label, done', a);
a.done = null;
show('done=null', a);
a.count = 2;
a.count = undefined;
show('count again', a);
const keys: string[] = [];
for (const k in a) keys.push(k);
console.log('for-in', keys.join(','));
const b = new Item('y');
b.label = undefined;
show('b', b);
const copy: Record<string, unknown> = {};
Object.assign(copy, b);
console.log(JSON.stringify([a, b]), Object.keys(copy).join(','), copy.hasOwnProperty('label'));

class Sub extends Item {
  extra?: string;
}
const s = new Sub();
s.extra = undefined;
s.count = undefined;
show('sub', s);
console.log('extra' in s, JSON.stringify(s));
