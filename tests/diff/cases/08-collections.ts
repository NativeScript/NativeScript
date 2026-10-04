// Map and Set: insertion order, SameValueZero keys, mutation while iterating.
const m = new Map<string, number>();
m.set('b', 2).set('a', 1).set('c', 3);
m.set('b', 20);
m.delete('a');
m.set('a', 10);
console.log([...m.keys()].join(','), [...m.values()].join(','), m.size, m.get('z'), m.has('c'));
for (const [k, v] of m) {
  if (k === 'b') m.set('d', 4);
  if (k === 'c') m.delete('a');
  console.log(k, v);
}
m.forEach((v, k) => console.log('forEach', k, v));

const nums = new Map<number, string>([[NaN, 'nan'], [0, 'zero']]);
console.log(nums.get(NaN), nums.get(-0), nums.size);

const s = new Set<string>(['x', 'y', 'x']);
s.add('z');
s.delete('y');
console.log(s.size, [...s].join(''), s.has('x'), s.has('y'));
const objects = new Set<object>();
const o = {};
objects.add(o);
objects.add(o);
objects.add({});
console.log(objects.size);

const counts = new Map<string, number>();
for (const word of 'the cat and the hat and the bat'.split(' ')) counts.set(word, (counts.get(word) ?? 0) + 1);
console.log(Array.from(counts.entries()).map(([w, c]) => `${w}=${c}`).join(' '));
console.log(m, s);
