// @swift
// Typed arrays' RangeErrors and TypeErrors as Node words them, and typed arrays held untyped:
// read, written and called by name as script does.
const buffer = new ArrayBuffer(8);
const report = (run: () => unknown) => {
  try {
    console.log('ok', run());
  } catch (e) {
    console.log((e as Error).name + ': ' + (e as Error).message);
  }
};
report(() => new Float32Array(-1));
report(() => new Float32Array(buffer, 1));
report(() => new Float32Array(buffer, 2, 1));
report(() => new Float32Array(buffer, 0, 10));
report(() => new Float32Array(buffer, 4, 2));
report(() => new Float32Array(buffer, 4, -1));
report(() => new Float32Array(new ArrayBuffer(6)));
report(() => new Float64Array(buffer, 3));
report(() => new Uint8Array(buffer, 9));
report(() => new Float32Array(buffer, 12));
report(() => new Uint16Array(buffer, -2));
report(() => new Float32Array(buffer, 8));
report(() => new Float32Array(1.9));
report(() => {
  new Float32Array(3).set([1, 2, 3], 2);
  return 'set';
});
report(() => {
  new Float32Array(3).set([1], -1);
  return 'set';
});
report(() => {
  new Float32Array(3).set(new Float32Array(4));
  return 'set';
});
report(() => {
  new Float32Array(3).set([], 3);
  return 'set';
});
report(() => {
  new Float32Array(3).set([], 4);
  return 'set';
});
report(() => new BigInt64Array(new Float32Array(1) as any));
report(() => new Float32Array(new BigInt64Array(1) as any));
report(() => {
  new BigInt64Array(2).set(new Int8Array(1) as any);
  return 'set';
});
report(() => new Int8Array(0).reduceRight((s, v) => s + v));
report(() => new ArrayBuffer(-1));

const untyped: any = new Int16Array([3, -1, 2]);
untyped[0] = 70000;
untyped[7] = 1;
console.log(untyped[0], untyped[7], untyped.length, untyped.byteLength, untyped.BYTES_PER_ELEMENT, untyped.buffer.byteLength, Object.keys(untyped), JSON.stringify(untyped));
console.log(untyped.map((v: number) => v * 2), untyped.filter((v: number) => v > 0), untyped.reduce((s: number, v: number) => s + v), untyped.reduce((s: string, v: number) => s + v, '>'));
console.log(untyped.indexOf(-1), untyped.includes(2), untyped.includes('2'), untyped.join('/'), untyped.at(-1), untyped.findLast((v: number) => v < 3), untyped.findLastIndex((v: number) => v > 100));
console.log(untyped.slice(1), untyped.subarray(1).byteOffset, untyped.sort(), untyped.sort((x: number, y: number) => y - x), untyped.fill(5, 1).toString());
untyped.set([1, 2], 1);
console.log(untyped, [...untyped], Array.from(untyped), ArrayBuffer.isView(untyped), untyped instanceof Int16Array, untyped instanceof Uint8Array);
for (const v of untyped) console.log(v);
const made: any = [new Uint8Array(2), new Float64Array([1.5]), buffer];
console.log(new Float32Array(made[1]), new Uint8Array(made[2]).length, new Int8Array(made[0]).length, new Float32Array({ length: 2, 0: 4 } as any));
const big: any = new BigInt64Array([5n]);
big[0] = 6n;
console.log(big[0], big.map((v: bigint) => v + 1n), big.join());
report(() => {
  big.set([1]);
  return 'set';
});
report(() => {
  untyped.set([1, 2, 3, 4]);
  return 'set';
});
const dv: any = new DataView(buffer);
dv.setInt16(0, -2, true);
console.log(dv.getInt16(0, true), dv.getUint16(0), dv.byteLength);
report(() => dv.getFloat64(4));
