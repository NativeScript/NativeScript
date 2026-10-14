// Destructuring assignment to existing variables, and a rest element against a tuple.
let a = 1;
let b = 2;
[a, b] = [b, a];
let x = 0;
let label = '';
({ x, label } = { x: 5, label: 'five' });
const pair: [string, number, boolean] = ['p', 3, true];
const [head, ...rest] = pair;
let first = '';
let others: (number | boolean)[] = [];
[first, ...others] = pair;
console.log(a, b, x, label, head, rest.join(','), first, others.length);
function describe({ size = 1, name }: { size?: number; name: string }, [low, high = 10]: number[] = [0]) {
  return `${name}:${size}:${low}:${high}`;
}
console.log(describe({ name: 'n' }), describe({ size: 4, name: 'm' }, [1, 2]), describe({ name: 'o' }, [3]));
let p = 0;
let q = 0;
let tail: number[] = [];
[[p], { q }] = [[1], { q: 2 }] as [number[], { q: number }];
const o = { a: 1, b: 2 };
[o.a, o.b] = [o.b, o.a];
const arr = [1, 2, 3];
[arr[0], arr[2]] = [arr[2], arr[0]];
console.log(p, q, o.a, o.b, arr.join());
let w = 0;
let h = 0;
({ w = 3, h = 4 } = { w: 9 } as { w?: number; h?: number });
let kept = 0;
let spread: { [k: string]: number } = {};
({ kept, ...spread } = { kept: 1, b1: 2, c1: 3 });
[p, ...tail] = [5, 6, 7];
console.log(w, h, kept, JSON.stringify(spread), p, tail.join());
let key = '';
let value = 0;
for ([key, value] of new Map([['m', 1], ['n', 2]])) console.log(key, value);
let item = '';
for (item of ['i', 'j']) console.log(item);
let s1 = 'a';
let s2 = 'b';
const swapped = ([s1, s2] = [s2, s1]);
console.log(s1, s2, swapped.length);
const sum = ({ a = 1, b = 2 }: { a?: number; b?: number } = {}) => a + b;
class Pt {
  s: string;
  constructor(s: string, { scale = 2 }: { scale?: number } = {}) {
    this.s = s + scale;
  }
  m([head, rest = 'z']: string[], { deep: { n = 1 } = {} }: { deep?: { n?: number } } = {}) {
    return head + rest + n;
  }
}
const pt = new Pt('s');
console.log(sum(), sum({ a: 5 }), pt.s, pt.m(['h']), pt.m(['h', 'i'], { deep: { n: 3 } }), pt.m(['q'], { deep: {} }));
const tags = [{ id: 1, tags: ['a'] }, { id: 2, tags: [] as string[] }].map(({ id, tags: [t = '-'] }) => `${id}${t}`);
console.log(tags.join());
