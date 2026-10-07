// @swift
// Typed arrays' methods: callbacks see (value, index, array), results are typed arrays of
// the same type with values converted, sort is numeric, and searches compare as === does.
const a = new Int16Array([5, -3, 12, 7, -3, 40000]);
console.log(a.map((v) => v * 2), a.map((v, i) => v + i), a.map((v, i, arr) => arr.length - i));
console.log(a.filter((v) => v > 0), a.filter((v, i) => i % 2 === 0), a.filter((v) => v), a.filter((v, i, arr) => arr[i + 1] !== undefined));
const visits: string[] = [];
a.forEach((v) => visits.push(String(v)));
a.forEach((v, i) => visits.push(`${i}`));
a.forEach((v, i, arr) => visits.push(arr === a ? 'same' : 'other'));
console.log(visits.join(','));
console.log(a.every((v) => v < 100), a.every((v, i) => i < 6), a.some((v) => v > 10), a.some((v, i) => i > 9), a.some((v) => v === -25536));
console.log(a.find((v) => v > 6), a.find((v) => v > 1000), a.findIndex((v) => v < 0), a.findIndex((v, i) => i > 10));
console.log(a.reduce((s, v) => s + v), a.reduce((s, v) => s + v, 100), a.reduce((s, v, i) => s + v * i, 0), a.reduce((s, v) => s + String(v), ''), a.reduceRight((s, v) => s + String(v), ''), a.reduceRight((s, v) => s - v));
console.log(a.at(0), a.at(-1), a.at(6), a.at(-7), a.indexOf(-3), a.indexOf(-3, 2), a.indexOf(99), a.lastIndexOf(-3), a.lastIndexOf(-3, 3), a.lastIndexOf(5, -7), a.includes(12), a.includes(12, 3));
const f = new Float32Array([NaN, 1, -0, 0, -Infinity, 0.5, NaN]);
console.log(f.indexOf(NaN), f.includes(NaN), f.indexOf(0), f.lastIndexOf(-0), f.join(' | '), f.join(), f.toString());
console.log(new Float32Array(f).sort(), new Float64Array([3, -1, 20, 100, 2]).sort(), new Uint8Array([3, 1, 2]).sort((x, y) => y - x), new BigInt64Array([3n, -5n, 1n]).sort());
const order = new Int32Array([30, 10, 20, 10]);
console.log(order.sort((x, y) => x - y) === order, order, order.reverse(), order.reverse() === order);
const filled = new Uint8Array(6);
console.log(filled.fill(7), filled.fill(1, 2), filled.fill(9, -2, -1), filled.fill(4, 4, 2), new Float32Array(3).fill(0.1));
console.log(new Uint8Array([1, 2, 3, 4, 5]).copyWithin(0, 3), new Uint8Array([1, 2, 3, 4, 5]).copyWithin(1, 0, 3), new Uint8Array([1, 2, 3, 4, 5]).copyWithin(-2, 0), new Uint8Array([1, 2, 3, 4, 5]).copyWithin(2, 4, 1));
const bigs = new BigUint64Array([1n, 2n, 3n]);
console.log(bigs.map((v) => v * 10n), bigs.reduce((s, v) => s + v), bigs.reduce((s, v) => s + Number(v), 0.5), bigs.includes(2n), bigs.indexOf(3n), bigs.join('-'), bigs.find((v) => v > 1n), `${bigs}`);
const total = (xs: Float64Array) => {
  let sum = 0;
  for (const x of xs) sum += x;
  return sum;
};
console.log(total(new Float64Array([0.1, 0.2, 0.3])), total(new Float64Array(0)));
try {
  new Float32Array(0).reduce((s, v) => s + v);
} catch (e) {
  console.log((e as Error).name + ': ' + (e as Error).message);
}
const twice = (v: number) => v * 2;
const positive = (v: number) => v > 0;
console.log(a.map(twice), a.filter(positive), a.some(positive), a.find(positive));
