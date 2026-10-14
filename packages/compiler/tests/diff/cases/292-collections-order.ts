// Map and Set as JavaScript orders and finds their keys: SameValueZero (NaN is NaN, -0 is +0, objects by identity),
// a re-added key at the end, and iteration that sees entries added during it and skips those deleted before it
// reaches them, through growth, compaction and clear().
const m = new Map<number, string>();
m.set(NaN, 'nan').set(-0, 'zero').set(1, 'one');
console.log(m.get(NaN), m.get(0), m.get(-0), m.has(+0), m.size, [...m.keys()].map((k) => Object.is(k, -0)).join(','));
const a = { id: 1 };
const b = { id: 1 };
const objects = new Map<object, number>([[a, 1], [b, 2]]);
console.log(objects.get(a), objects.get(b), objects.size, objects.get({ id: 1 }));
const strings = new Map<string, number>();
const parts = ['ke', 'y'];
strings.set('key', 1);
console.log(strings.get(parts.join('')), strings.has('KEY'.toLowerCase()));
const order = new Map<string, number>([['a', 1], ['b', 2], ['c', 3]]);
order.delete('a');
order.set('a', 4);
order.set('b', 5);
console.log([...order.entries()].map(([k, v]) => k + v).join(' '));
const seen: string[] = [];
const live = new Map<number, number>();
for (let i = 0; i < 6; i++) live.set(i, i);
live.forEach((v, k) => {
  seen.push(String(k));
  if (k === 1) live.delete(3);
  if (k === 2) live.set(10, 10);
  if (k === 4) live.delete(0);
});
console.log(seen.join(','), live.size);
const big = new Map<number, number>();
const it = big.keys();
for (let i = 0; i < 1000; i++) big.set(i * 7, i);
const firstKeys: number[] = [];
for (let i = 0; i < 3; i++) firstKeys.push(it.next().value as number);
for (let i = 0; i < 990; i++) big.delete(i * 7);
for (let i = 0; i < 40; i++) big.set(-i - 1, i);
let rest = 0;
let last = 0;
for (let r = it.next(); !r.done; r = it.next()) {
  rest++;
  last = r.value as number;
}
console.log(firstKeys.join(','), rest, last, big.size, big.get(997 * 7), big.get(5 * 7));
const cleared = new Set<number>([1, 2, 3]);
const visits: number[] = [];
let added = false;
for (const v of cleared) {
  visits.push(v);
  if (v === 2 && !added) {
    added = true;
    cleared.clear();
    cleared.add(7);
    cleared.add(8);
  }
}
console.log(visits.join(','), cleared.size, [...cleared].join(','));
const set = new Set<number>();
for (let i = 0; i < 2000; i++) set.add((i * 13) % 701);
let hits = 0;
for (let i = 0; i < 2000; i++) if (set.has(i)) hits++;
for (let i = 0; i < 700; i += 2) set.delete(i);
console.log(set.size, hits, [...set].slice(0, 5).join(','), set.has(NaN), new Set([NaN, NaN, 0, -0]).size);
const many = new Map<string, number>();
for (let i = 0; i < 5000; i++) many.set('k' + i, i);
for (let i = 0; i < 5000; i += 3) many.delete('k' + i);
let sum = 0;
many.forEach((v) => (sum += v));
console.log(many.size, sum, many.get('k4999'), many.get('k3'), [...many.keys()].slice(0, 3).join(','));
