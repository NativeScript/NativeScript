// Elements and values that may be null or undefined both, which the code tells apart: kept apart wherever they go.
function kind(x: unknown): string {
  return x === null ? 'null' : x === undefined ? 'undefined' : typeof x;
}
const items: (string | null | undefined)[] = ['a', null, undefined];
items.push(null, 'b');
items.unshift(undefined);
console.log(items.length, items.map((x) => kind(x)).join(','), JSON.stringify(items));
console.log(items.filter((x) => x !== null).length, items.findIndex((x) => x === undefined), items.indexOf(null), items.includes(undefined));
items.forEach((x, i) => {
  if (x === null) console.log('null at', i);
});
for (const x of items) console.log('of', x === null, x === undefined, String(x));
const first = items[1];
console.log(kind(first), kind(items[2]), kind(items[99]), kind(items.at(-2)), kind(items.find((x) => x === null)));
items[0] = null;
items[1] = 'z';
console.log(JSON.stringify(items), String(items), items.join('|'));
const copy = [...items];
copy.reverse();
console.log(JSON.stringify(copy), JSON.stringify(items.slice(1, 3)), kind(copy.pop()), copy.length);

function count(xs: (number | null | undefined)[]): string {
  let nulls = 0, missing = 0, sum = 0;
  for (const x of xs) {
    if (x === null) nulls++;
    else if (x === undefined) missing++;
    else sum += x;
  }
  return `${nulls} ${missing} ${sum}`;
}
console.log(count([1, null, undefined, 2]), count([]));
function make(n: number): (boolean | null | undefined)[] {
  return n === 0 ? [true, null] : [undefined, false];
}
console.log(JSON.stringify(make(0)), make(1)[0] === undefined, make(0)[1] === null);

const seen = new Map<string, number | null | undefined>();
seen.set('a', null);
seen.set('b', undefined);
seen.set('c', 3);
console.log(seen.size, kind(seen.get('a')), kind(seen.get('b')), kind(seen.get('z')), seen.has('b'));
seen.forEach((v, k) => console.log('map', k, v === null, v === undefined));
console.log([...seen.values()].map((v) => kind(v)).join(','), JSON.stringify(seen.get('a')), JSON.stringify([...seen.keys()]));

const tags = new Set<string | null | undefined>(['x', null]);
tags.add(undefined);
tags.add(null);
console.log(tags.size, tags.has(null), tags.has(undefined), [...tags].map((t) => kind(t)).join(','));

class Shelf {
  slots: (string | null | undefined)[] = [];
  put(s: string | null | undefined): void { this.slots.push(s); }
  report(): string { return this.slots.map((s) => (s === null ? 'N' : s === undefined ? 'U' : s)).join(''); }
}
const shelf = new Shelf();
shelf.put('k');
shelf.put(null);
shelf.put(undefined);
console.log(shelf.report(), JSON.stringify(shelf));
