// App classes, interfaces and enums named like the standard types of Kotlin and Swift (Pair, Result, Optional, …): each
// is its own type, by name and key, beside the standard one the runtime uses.
class Pair {
  constructor(public first: string, public second: number) {}
  swap(): Pair { return new Pair(String(this.second), Number(this.first) || 0); }
}
class Triple<T> {
  items: T[] = [];
  add(x: T): this { this.items.push(x); return this; }
}
class Result {
  ok = true;
  value?: Pair;
}
interface Sequence { next(): number }
class Counter implements Sequence {
  n = 0;
  next() { return ++this.n; }
}
enum Optional { None, Some }
class Lazy {
  static make() { return new Lazy(); }
  get ready() { return true; }
}
class Data { bytes = [1, 2]; }
class Unit { readonly name = 'unit'; }
class Regex { source = 'a+'; }

const p = new Pair('a', 2);
console.log(p.first, p.second, JSON.stringify(p), Object.keys(p).join(','), p instanceof Pair, p.constructor.name);
console.log(Object.entries(p).map(([k, v]) => `${k}:${v}`).join(' '), JSON.stringify(p.swap()));
const pairs: Pair[] = [p, new Pair('b', 3)];
const m = new Map<string, Pair>(pairs.map((x) => [x.first, x]));
console.log([...m.entries()].map(([k, v]) => `${k}=${v.second}`).join(','), Object.entries({ a: 1, b: 'x' }).length);
const r = new Result();
r.value = p;
console.log(JSON.stringify(r), r.ok, r.value?.first);
console.log(JSON.stringify(new Triple<number>().add(1).add(2)), new Counter().next(), Optional.Some, Optional[0]);
console.log(Lazy.make().ready, JSON.stringify(new Data()), new Unit().name, new Regex().source, /a+/.test('aa'));
const held: any = new Pair('h', 1);
console.log(held.first, held instanceof Pair, held.second + 1);
