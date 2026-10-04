// Objects as JavaScript defines them: accessors in literals, computed keys,
// property descriptors, freezing, and the Object functions that list and copy keys.
const person = {
  first: 'Ada',
  last: 'Lovelace',
  get full() {
    return `${this.first} ${this.last}`;
  },
  set full(v: string) {
    const [f, l] = v.split(' ');
    this.first = f;
    this.last = l;
  },
};
console.log(person.full, person);
person.full = 'Grace Hopper';
console.log(person.first, person.last, person.full, JSON.stringify(person), Object.keys(person));

let reads = 0;
const counter = {
  base: 10,
  get next() {
    reads++;
    return this.base + reads;
  },
};
console.log(counter.next, counter.next, reads, Object.entries(counter), reads);

const store = {
  items: [] as string[],
  set latest(v: string) {
    this.items.push(v);
  },
};
store.latest = 'a';
store.latest = 'b';
console.log(store.items, store.latest, store);

const prefix = 'item';
const KEY = 'answer';
const n = 2;
const computed = { [KEY]: 42, [`${prefix}${n}`]: 'two', [n * 10]: 'twenty', plain: true };
console.log(computed.answer, computed, Object.keys(computed));
const byName: Record<string, number> = { [prefix + 'A']: 1, [prefix + 'B']: 2 };
console.log(byName, byName.itemA);

const target: any = { a: 1 };
Object.defineProperty(target, 'hidden', { value: 'secret', enumerable: false, writable: true, configurable: true });
Object.defineProperty(target, 'fixed', { value: 5, enumerable: true });
Object.defineProperty(target, 'doubled', {
  get() {
    return this.a * 2;
  },
  enumerable: true,
  configurable: true,
});
console.log(target.hidden, target.fixed, target.doubled, Object.keys(target), Object.getOwnPropertyNames(target));
console.log(JSON.stringify(target), target);
target.a = 21;
console.log(target.doubled, 'hidden' in target, Object.getOwnPropertyDescriptor(target, 'fixed'), Object.getOwnPropertyDescriptor(target, 'a'));
try {
  target.fixed = 6;
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
try {
  Object.defineProperty(target, 'fixed', { value: 7 });
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
console.log(target.fixed);

const frozen: any = Object.freeze({ x: 1, nested: { y: 2 } });
console.log(Object.isFrozen(frozen), Object.isFrozen(frozen.nested), Object.isFrozen({}), Object.isFrozen(1));
for (const attempt of [() => { frozen.x = 2; }, () => { frozen.z = 3; }, () => { delete frozen.x; }]) {
  try {
    attempt();
  } catch (e) {
    console.log((e as Error).name, (e as Error).message);
  }
}
frozen.nested.y = 20;
console.log(frozen, Object.isExtensible(frozen));
const sealed: any = Object.seal({ s: 1 });
sealed.s = 2;
try {
  sealed.t = 3;
} catch (e) {
  console.log((e as Error).message);
}
console.log(sealed, Object.isSealed(sealed), Object.isFrozen(sealed));

interface Options { color?: string; size: number; tags?: string[] }
const defaults: Options = { color: 'red', size: 1 };
const merged = Object.assign({}, defaults, { size: 3 }, { tags: ['a'] });
console.log(merged, defaults);
const copy = { ...person, extra: 1 };
console.log(copy, Object.getOwnPropertyDescriptor(copy, 'full'));
console.log(Object.entries({ b: 2, a: 1, 1: 'one', 0: 'zero' }), Object.values({ z: 'last', y: 'first' }));
console.log(Object.fromEntries([['k1', 1], ['k2', 2]]), Object.fromEntries(new Map([['m', true]])));
console.log(Object.getOwnPropertyNames([1, 2]), Object.keys('hi'), Object.is(NaN, NaN), Object.is(0, -0));
