// Arrays, Sets and Map values holding null and undefined both keep them apart where only the collection's own
// operations tell them apart: a Set's members, `includes`/`indexOf`, copies, iterators and callbacks.
type V = number | null | undefined;

// A literal indexed directly, into a slot that tells them apart.
const picked: V = [1, null, undefined][1];
console.log('literal', picked === null, picked === undefined);
function isNull(x: V): boolean {
  return x === null;
}
console.log('argument', isNull([1, null, undefined][1]), isNull([1, null, undefined][2]));

// Arrays observed only by strict equality and SameValueZero.
const pair: V[] = [null, undefined];
console.log('indexOf', pair.indexOf(undefined), pair.lastIndexOf(null), pair.includes(null));
const one: (string | null | undefined)[] = [undefined];
console.log('includes', one.includes(null), one.indexOf(null), one.includes(undefined));
function has(xs: V[], x: V): boolean {
  return xs.includes(x);
}
console.log('parameter', has([undefined], null), has([null], null));
const joined = pair.concat([null]);
console.log('concat', joined.indexOf(undefined), joined.lastIndexOf(null), joined.length);
const kept = pair.filter((v) => v !== 1);
console.log('filter', kept.indexOf(null), kept.indexOf(undefined));
console.log('find', pair.find((x) => x === undefined) === undefined, pair.find((x) => x === null) === null, pair.at(-1) === undefined);

// Sets: membership tells null from undefined.
const empties = new Set<V>([null, undefined]);
console.log('set literal', empties.size);
const grown = new Set<string | null | undefined>();
grown.add(null);
grown.add(undefined);
grown.add(null);
console.log('set add', grown.size, grown.has(null), grown.has(undefined), JSON.stringify([...grown]));
const single = new Set<V>([undefined]);
single.forEach((v) => console.log('set forEach', v === undefined));
console.log('set has', single.has(null), single.delete(null), single.delete(undefined), single.size);
const raw: (string | null | undefined)[] = ['a', null, undefined, null, 'a', undefined];
const unique = Array.from(new Set(raw));
console.log('dedupe', unique.length, JSON.stringify(unique), [...new Set(raw)].length);
function distinct(xs: V[]): V[] {
  return [...new Set(xs)];
}
console.log('distinct', distinct([1, null, undefined, null, 1]).length);
function count(s: Set<V>): number {
  return s.size;
}
console.log('set parameter', count(new Set<V>([null, undefined, null])));
const fromSet = Array.from(grown);
console.log('set copy', fromSet.indexOf(undefined), fromSet[0] === null, Array.from(grown).length);
class Bag {
  seen = new Set<string | null | undefined>();
  mark(v: string | null | undefined): number {
    this.seen.add(v);
    return this.seen.size;
  }
}
const bag = new Bag();
bag.mark(null);
console.log('set field', bag.mark(undefined));

// Map values read through `get`, `values()` and copies.
const byKey = new Map<string, V>();
byKey.set('a', null);
byKey.set('b', undefined);
const vals = [...byKey.values()];
console.log('map spread', vals[0] === null, vals[1] === undefined, JSON.stringify(vals));
const given = new Map<string, V>([['a', null], ['b', undefined]]);
console.log('map get', given.get('a') === null, given.get('b') === undefined, given.get('z') === undefined, JSON.stringify(Array.from(given.values())));
const flags = new Map<string, boolean | null | undefined>();
flags.set('x', null);
flags.set('y', undefined);
let nulls = 0;
for (const v of flags.values()) if (v === null) nulls++;
console.log('map values', nulls, flags.get('y') === undefined, flags.get('x') === null);

// Copies of an observed array: one representation with their source.
const source: V[] = [null, undefined];
console.log('source', source[0] === null);
const spread = [...source];
const copied = Array.from(source);
const asSet = new Set(source);
console.log('copies', spread.length, copied.length, asSet.size, String(spread), copied.join('|'));
