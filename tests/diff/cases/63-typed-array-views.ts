// @swift
// Typed arrays made every way, and which of them share bytes: views of one buffer see each
// other's writes, subarray shares, slice and the converting constructors copy.
const buffer = new ArrayBuffer(16);
const bytes = new Uint8Array(buffer);
const words = new Uint32Array(buffer, 4, 2);
const floats = new Float32Array(buffer);
words[0] = 0x01020304;
floats[3] = 1;
console.log(bytes, words.byteOffset, words.byteLength, words.length, floats.length, words.buffer === buffer, floats.buffer === bytes.buffer);
const tail = new Int16Array(buffer, 8);
console.log(tail.length, tail.byteOffset, new Uint8Array(buffer, 15).length, new Uint8Array(buffer, 16).length);

const source = new Float64Array([1.5, -2.25, 300, 70000]);
const converted = new Int16Array(source);
const narrowed = new Uint8Array(source);
source[0] = 9;
console.log(converted, narrowed, source[0], new Float32Array(new Int8Array([-1, 2])));
console.log(new Uint16Array(new Set([1, 2, 65537])), new Int8Array(3), new Float64Array(), new Uint8Array([1, 2, 3]).length);
const big = new BigInt64Array(new BigUint64Array([2n ** 64n - 1n, 7n]));
console.log(big, BigUint64Array.of(1n, 2n), BigInt64Array.from([3n, 4n]));

const all = new Int32Array([10, 20, 30, 40, 50]);
const middle = all.subarray(1, 4);
const copy = all.slice(1, 4);
middle[0] = 21;
copy[1] = 31;
console.log(all, middle, copy, middle.byteOffset, copy.byteOffset, middle.buffer === all.buffer, copy.buffer === all.buffer);
console.log(all.subarray(-2), all.subarray(3, 1), all.slice(-3, -1), all.subarray(), all.slice(10));

const target = new Uint8Array(6);
target.set([1, 2, 3]);
target.set(new Float32Array([255.5, 256]), 3);
console.log(target);
target.set([9, 9], 4);
target.set(new Uint8Array(0), 6);
console.log(target);
const overlap = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
overlap.set(overlap.subarray(0, 5), 2);
console.log(overlap);
const shared = new ArrayBuffer(8);
const asBytes = new Uint8Array(shared);
asBytes.set([1, 2, 3, 4]);
const asWords = new Uint16Array(shared, 0, 2);
asBytes.set(asWords, 2);
console.log(asBytes, asWords);

console.log(Float32Array.from([1, 2, 3], (v) => v * 1.5), Int8Array.from(new Set([1, 200])), Uint8Array.of(1, 256, -1), Float64Array.from({ length: 3 } as ArrayLike<number>));
const values = new Uint8Array([5, 6, 7]);
const seen: number[] = [];
for (const v of values) seen.push(v);
console.log(seen, Array.from(values), [...values, 8], Math.max(...values));
for (const [i, v] of values.entries()) console.log(i, v);
console.log([...values.keys()], [...values.values()], Array.from(new BigInt64Array([1n, 2n])));

function describe(view: ArrayBufferView): string {
  return `${view.byteOffset}+${view.byteLength} of ${view.buffer.byteLength}`;
}
console.log(describe(words), describe(middle), describe(new DataView(buffer, 2, 3)));
const views: unknown[] = [buffer, bytes, words, floats, new DataView(buffer), {}, [1], 3, new BigInt64Array(1)];
console.log(views.map((v) => ArrayBuffer.isView(v)).join(' '));
console.log(views.map((v) => [v instanceof Uint8Array, v instanceof Uint32Array, v instanceof Float32Array, v instanceof DataView, v instanceof ArrayBuffer, v instanceof BigInt64Array].map((b) => (b ? 1 : 0)).join('')).join(' '));
console.log(Object.prototype.toString.call(floats), Object.prototype.toString.call(new DataView(buffer)), String(words), `${new Int8Array([-1, 2])}`, Array.isArray(bytes), typeof bytes);
console.log(new ArrayBuffer(8), new DataView(buffer, 12), new Uint8Array(new ArrayBuffer(120)).length, [new Int16Array(2)], { a: new Uint8Array(1) });
