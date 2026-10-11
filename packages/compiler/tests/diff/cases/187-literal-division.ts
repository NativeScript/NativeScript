// Dividing number literals is a division of doubles wherever the result goes: untyped, JSON, a template, String().
const third = 1 / 3;
let half = 5 / 2;
const arr = [7 / 2, 1 / 4];
function f(n: number): number { return n; }
function g(): number { return 9 / 4; }
const o = { r: 3 / 8 };
const w = 100;
console.log('a', third, half, arr, f(3 / 2), g(), o.r, w * (2 / 3), (w / 3) | 0);
console.log('b', w > 1 ? 1 / 2 : 0, Math.floor(7 / 2), Math.round(5 / 2), (7 / 2).toFixed(2), String(1 / 8), `${3 / 4}`, 1 / 3 + 1);
console.log('c', 10 % 3 / 2, -7 / 2, 1e3 / 7 > 142, (1 + 2) / 4, 6 / 3 / 4, -(9 / 2));
let acc = 0;
acc += 1 / 2;
console.log('d', acc, [1, 2, 3].map((x) => x / 2), 255 / 255 * 0.5);
const anyObj: any = { ratio: 16 / 9 };
const list: unknown[] = [];
list.push(1 / 4);
const m = new Map<string, unknown>();
m.set('k', 3 / 2);
function take(v: unknown) { return v; }
console.log('e', anyObj.ratio, list[0], m.get('k'), take(7 / 4), JSON.stringify({ a: 1 / 2 }), [1 / 2] as any[], 1 / 2 === 0.5, 3 / 2 == 1.5);
