// Symbols: unique, described, registered, as property keys, and the well-known
// ones that change how values convert and print; WeakMap, WeakSet and WeakRef.
const a: symbol = Symbol('a');
const a2: symbol = Symbol('a');
const anon = Symbol();
const num = Symbol(`${6 * 7}`);
console.log(typeof a, a === a2, a === a, a.description, anon.description, num.description);
console.log(a.toString(), String(a2), anon.toString(), a.valueOf() === a);
console.log(a, [a, anon], { k: a }, new Map([[a, 1]]));

const g1: symbol = Symbol.for('app.key');
const g2: symbol = Symbol.for('app.key');
console.log(g1 === g2, g1 === Symbol('app.key'), Symbol.keyFor(g1), Symbol.keyFor(a), g1.description);
console.log(Symbol.iterator.toString(), Symbol.asyncIterator.description, typeof Symbol.toPrimitive, String(Symbol.toStringTag));

const secret = Symbol('secret');
const bag: any = { visible: 1 };
bag[secret] = 'hidden';
bag[a] = 'first';
bag.later = 2;
console.log(bag[secret], bag[a], bag[a2], secret in bag, a2 in bag, 'visible' in bag);
console.log(Object.keys(bag), JSON.stringify(bag), Object.getOwnPropertySymbols(bag).map((s) => s.toString()));
console.log(bag);
delete bag[secret];
console.log(bag[secret], Object.getOwnPropertySymbols(bag).length, bag);
const literal: any = { [a]: 1, plain: 2, [`k${1}`]: 3 };
console.log(literal, Object.keys(literal));

const seen = new Set<symbol>([a, a2, a]);
const names = new Map<symbol, string>([[a, 'A'], [anon, 'anon']]);
console.log(seen.size, seen.has(a2), names.get(a), names.get(a2), names.get(anon));

const kind = Symbol('kind');
class Tagged {
  [kind] = 'tagged';
  constructor(readonly value: number) {}
  get [Symbol.toStringTag]() {
    return 'TaggedThing';
  }
}
const t = new Tagged(3);
console.log(t[kind], String(t), `${t}`, Object.prototype.toString.call(t), Object.prototype.toString.call([]), Object.prototype.toString.call(null));
console.log(t);

class Temperature {
  constructor(readonly celsius: number) {}
  [Symbol.toPrimitive](hint: string): string | number {
    console.log('hint', hint);
    return hint === 'number' ? this.celsius : `${this.celsius}°C`;
  }
}
const temp = new Temperature(21);
console.log(+temp, `${temp}`, 'is ' + temp, Number(temp) * 2, String(temp));

interface Node1 { id: number }
const meta = new WeakMap<Node1, string>();
const visited = new WeakSet<Node1>();
const n1: Node1 = { id: 1 };
const n2: Node1 = { id: 2 };
console.log(meta.set(n1, 'one') === meta, meta.get(n1), meta.get(n2), meta.has(n1), meta.has(n2));
meta.set(n1, 'uno');
console.log(meta.get(n1), meta.delete(n1), meta.delete(n1), meta.has(n1), meta.get(n1));
visited.add(n1).add(n2);
console.log(visited.has(n1), visited.has({ id: 1 }), visited.delete(n2), visited.has(n2));
const loose = new WeakMap<any, string>();
const looseSet = new WeakSet<any>();
try {
  loose.set(1, 'x');
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
try {
  looseSet.add('s');
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
console.log(loose.get(7), looseSet.has(7), loose.has(null), meta, visited);
const keyed = new WeakMap<object, number>([[n1, 10], [n2, 20]]);
console.log(keyed.get(n2), keyed.has(n1));

class Owner {
  constructor(readonly name: string) {}
}
const owner = new Owner('kept');
const ref = new WeakRef(owner);
console.log(ref.deref() === owner, ref.deref()?.name, typeof ref, ref);
