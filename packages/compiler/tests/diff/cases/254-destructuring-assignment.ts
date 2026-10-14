// Destructuring assignment to declared variables, elements and members, and destructured parameters with defaults.
let a = 1;
let b = 2;
[a, b] = [b, a];
console.log('swap', a, b);
let x: number;
let y: string;
({ x, y } = { x: 3, y: 'why' });
console.log('object', x, y);
const source = { p: 1, q: { r: 'deep' } };
let p: number;
let r: string;
({ p, q: { r } } = source);
console.log('nested', p, r);
let first: number;
let others: number[];
[first, ...others] = [1, 2, 3];
console.log('rest', first, others.join(','));
let d1: number;
let d2: string;
({ d1 = 4, d2 = 'dflt' } = { d2: 'given' } as { d1?: number; d2?: string });
console.log('defaults', d1, d2);
const arr = [1, 2, 3];
[arr[0], arr[2]] = [arr[2], arr[0]];
const target: { m?: number; n?: string } = {};
({ m: target.m, n: target.n } = { m: 9, n: 'nine' });
console.log('members', arr.join(','), target.m, target.n);
let count = 0;
const pairs: [string, number][] = [['a', 1], ['b', 2]];
let key = '';
for ([key, count] of pairs) console.log('for-of', key, count);

function area({ w = 2, h = 3 }: { w?: number; h?: number } = {}) {
  return w * h;
}
console.log('area', area(), area({ w: 5 }), area({ h: 1, w: 1 }));
function pair([k, v = 'none']: [string, string?]) {
  return k + ':' + v;
}
console.log('pair', pair(['a']), pair(['b', 'c']));
const draw = ({ color = 'red', size }: { color?: string; size: number }) => color + size;
console.log('draw', draw({ size: 1 }), draw({ color: 'blue', size: 2 }));
const items: { id: number; tags?: string[] }[] = [{ id: 1 }, { id: 2, tags: ['t'] }];
for (const { id, tags = [] } of items) console.log('item', id, tags.length);
items.forEach(({ id, tags = ['none'] }) => console.log('each', id, tags.join(',')));
const values = [5, 6];
const assigned = ([a, b] = values);
console.log('value', a, b, assigned === values);
const [{ x: px, y: py } = { x: 1, y: 2 }] = [] as { x: number; y: number }[];
const { a: { b: deep } = { b: 'dflt' } } = {} as { a?: { b: string } };
console.log('nested defaults', px, py, deep);
function sum({ a, b } = { a: 1, b: 2 }) {
  return a + b;
}
function add([m, n] = [3, 4]) {
  return m + n;
}
function late(first: number, { scale = 2, offset = 0 }: { scale?: number; offset?: number } = {}) {
  return first * scale + offset;
}
console.log('parameter defaults', sum(), sum({ a: 5, b: 5 }), add(), add([1, 1]), late(3), late(3, { offset: 1 }));
