// A missing object passed to an app function's parameter, returned from a typed function, stored in a field or a typed
// variable: JavaScript carries undefined there, and only a member read of it throws.
class Item {
  constructor(public name: string) {}
}
interface Box {
  item: Item;
}
interface Shower {
  show(x: Item): string;
}
class Impl implements Shower {
  show(x: Item): string {
    return `${typeof x}|${x === undefined}`;
  }
}
class Base {
  take(x: Item): string {
    return 'b' + typeof x;
  }
}
class Sub extends Base {
  take(x: Item): string {
    return 's' + typeof x;
  }
}
class Holder {
  item: Item;
  constructor(item: Item) {
    this.item = item;
  }
}
class Prop {
  constructor(public item: Item) {}
}
const ITEMS: Item[] = [new Item('x')];
const BY_KEY: Record<string, Item> = {};
const first = ITEMS[0];
const ghost = ITEMS[9];
let p: Item | null = null;
p = ITEMS[5];

function describe(x: Item): string {
  return `${typeof x}|${x === first}|${x instanceof Item}|${x === undefined}|${!x}`;
}
function pass(x: Item): Item {
  return x;
}
function back(i: number): Item {
  let q: Item | null = null;
  q = ITEMS[i];
  return q;
}
const arrow = (x: Item): string => typeof x;
const give = (i: number): Item => ITEMS[i];
const base: Base = new Sub();
console.log(describe(p), describe(ghost), describe(BY_KEY['k']), describe(first));
console.log(typeof pass(p), pass(ghost) === undefined, typeof back(4), back(0).name, arrow(p), typeof give(3), give(0).name);
console.log(new Impl().show(ghost), base.take(p), new Base().take(ghost));

const h = new Holder(p);
console.log(typeof h.item, h.item === undefined);
h.item = first;
console.log(typeof h.item, h.item.name);
h.item = ghost;
console.log(typeof h.item, h.item instanceof Item);
const prop = new Prop(ghost);
const box: Box = { item: BY_KEY['zz'] };
console.log(typeof prop.item, typeof box.item, box.item === undefined);

let v: Item = first;
v = ghost ?? p;
const w: Item = ghost ?? BY_KEY['n'];
const z: Item = BY_KEY['n'] ?? first;
console.log(typeof v, typeof w, w === undefined, w === v, z.name);

for (const read of [() => pass(p).name, () => back(7).name, () => h.item.name, () => box.item.name, () => give(5).name, () => (ghost ?? p).name]) {
  try {
    console.log(read());
  } catch (e) {
    console.log('caught', e instanceof TypeError);
  }
}
