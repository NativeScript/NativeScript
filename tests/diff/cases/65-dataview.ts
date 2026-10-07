// @swift
// DataView: numbers of every type at any byte offset, big-endian unless asked otherwise,
// over the same bytes typed arrays see.
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);
const bytes = new Uint8Array(buffer);
view.setUint16(0, 0x1234);
view.setUint16(2, 0x1234, true);
view.setInt32(4, -2);
view.setFloat32(8, 1.5, true);
view.setInt8(12, 200);
view.setUint8(13, -1);
console.log(bytes);
console.log(view.getUint16(0), view.getUint16(0, true), view.getUint16(2, true), view.getInt16(4), view.getUint32(4), view.getInt32(4, true), view.getFloat32(8, true), view.getFloat32(8));
console.log(view.getInt8(12), view.getUint8(12), view.getInt8(13), view.getUint16(1), view.getUint32(1, true));
view.setFloat64(0, Math.PI);
console.log(view.getFloat64(0), view.getFloat64(0, true), bytes.slice(0, 8));
view.setFloat32(0, 0.1);
console.log(view.getFloat32(0), view.getUint32(0).toString(16));
view.setBigInt64(0, -2n);
view.setBigUint64(8, 2n ** 64n - 3n, true);
console.log(view.getBigInt64(0), view.getBigUint64(0), view.getBigInt64(0, true), view.getBigUint64(8, true), view.getBigInt64(8, true), bytes);
const part = new DataView(buffer, 4, 8);
part.setUint32(0, 0xdeadbeef);
console.log(part.byteOffset, part.byteLength, part.buffer === buffer, view.getUint32(4).toString(16), new Uint32Array(buffer, 4, 1)[0].toString(16));
const floats = new Float32Array([1, -2]);
const over = new DataView(floats.buffer);
console.log(over.getFloat32(0, true), over.getFloat32(4, true), over.byteLength, new DataView(buffer, 16).byteLength);
console.log(view, new DataView(new ArrayBuffer(2), 1));
const cases: Array<() => unknown> = [
  () => view.getInt8(16),
  () => view.getInt32(13),
  () => view.getInt16(-1),
  () => view.setFloat64(9, 1),
  () => view.getBigInt64(9),
  () => part.getUint8(8),
  () => new DataView(buffer, 17),
  () => new DataView(buffer, 8, 9),
  () => new DataView(buffer, -1),
  () => new DataView(buffer, 4, -1),
];
for (const run of cases) {
  try {
    console.log('ok', run());
  } catch (e) {
    console.log((e as Error).name + ': ' + (e as Error).message);
  }
}
