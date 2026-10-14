// Map and Set at their edges: SameValueZero keys (-0 and +0, NaN, strings by code units), insertion order
// across deletes and re-adds, iteration while the collection changes, clear, and many deletes.
const m = new Map<number, string>();
m.set(-0, 'zero');
m.set(NaN, 'nan');
m.set(0, 'zero again');
m.set(Number.NaN, 'nan again');
console.log(m.size, m.get(0), m.get(-0), m.get(NaN), Object.is([...m.keys()][0], -0), [...m.keys()].map((k) => String(k)).join(','));

const s = new Map<string, number>();
for (const k of ['b', 'a', 'é', 'é', 'a']) s.set(k, (s.get(k) ?? 0) + 1);
console.log([...s.entries()].map(([k, v]) => k + '=' + v).join(' '), s.has('é'), s.has('é'), s.get('é'));
s.delete('b');
s.set('b', 9);
console.log([...s.keys()].join(','));

const order = new Map<number, number>();
for (let i = 0; i < 10; i++) order.set(i, i);
const visited: number[] = [];
order.forEach((v, k) => {
  visited.push(k);
  if (k === 2) order.delete(5);
  if (k === 3) order.set(42, 0);
  if (k === 4) order.delete(3);
});
console.log(visited.join(','), order.size);

const cleared = new Set<number>([1, 2, 3]);
const seen: number[] = [];
for (const v of cleared) {
  seen.push(v);
  if (v === 2) {
    cleared.clear();
    cleared.add(7);
    cleared.add(8);
  }
}
console.log(seen.join(','), [...cleared].join(','));

const big = new Map<number, number>();
for (let i = 0; i < 5000; i++) big.set(i, i * 2);
const it = big.keys();
let firstFew = '';
for (let i = 0; i < 3; i++) firstFew += it.next().value + ' ';
for (let i = 0; i < 4990; i++) big.delete(i);
const rest: number[] = [];
for (let r = it.next(); !r.done; r = it.next()) rest.push(r.value);
console.log(firstFew, rest.join(','), big.size, big.get(4995), big.get(10));
for (let i = 0; i < 20; i++) big.set(i * 1000, -i);
console.log([...big.keys()].slice(0, 14).join(','), big.size);

const objects = new Map<object, string>();
const a = { id: 1 };
const b = { id: 1 };
objects.set(a, 'a').set(b, 'b').set(a, 'a2');
console.log(objects.size, objects.get(a), objects.get(b), objects.get({ id: 1 }));

const mixed = new Set<unknown>([1, '1', true, 'true', null, undefined, 0, -0, NaN, NaN, '', 1n, '1n']);
console.log(mixed.size, mixed.has(-0), mixed.has(1n), mixed.has(BigInt(1)), mixed.has(undefined), mixed.has('1n'));
const words = new Set<string>();
for (let i = 0; i < 2000; i++) words.add('w' + (i % 1500));
for (let i = 0; i < 1500; i += 3) words.delete('w' + i);
console.log(words.size, words.has('w3'), words.has('w4'), [...words].slice(0, 5).join(','));
