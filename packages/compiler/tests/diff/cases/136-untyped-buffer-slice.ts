// @lenient
// An ArrayBuffer sliced by untyped code (core's FileReader: `getBuffer(blob).buffer.slice(0)`).
const bytes = new Uint8Array([1, 2, 3, 4, 5]);
const untyped: any = bytes.buffer;
const copy = untyped.slice(0);
const middle = untyped.slice(1, -1);
console.log(copy instanceof ArrayBuffer, copy.byteLength, middle.byteLength, new Uint8Array(middle).join(','), copy !== untyped);
