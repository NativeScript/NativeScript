// @lenient
// ArrayBuffer and Uint8Array as core's file system and text code use them.
const buffer = new ArrayBuffer(4);
const view = new Uint8Array(buffer);
view[0] = 1;
view[1] = 300;
view[2] = -1;
view[9] = 7;
console.log(view.length, view.byteLength, buffer.byteLength, view[1], view[2], view[9], view.buffer === buffer);
console.log(view, buffer);
const part = new Uint8Array(buffer, 1, 2);
part[0] = 9;
console.log(part.length, part.byteOffset, view[1], part.slice(1)[0], view.slice(-2).length);
const fresh = new Uint8Array(3);
fresh[2] = 255.9;
console.log(fresh, new Uint8Array([1, 2, 258]), new Uint8Array(0).length);
function bytesOf(input: ArrayBuffer | Uint8Array): number {
  const source = ArrayBuffer.isView(input) ? input.buffer : input;
  return source instanceof ArrayBuffer ? source.byteLength : -1;
}
console.log(bytesOf(buffer), bytesOf(part), ArrayBuffer.isView(buffer), ArrayBuffer.isView(view), view instanceof Uint8Array, buffer instanceof Uint8Array);
console.log(Object.prototype.toString.call(buffer), Object.prototype.toString.call(view));
try {
  new ArrayBuffer(-1);
} catch (e) {
  console.log(e instanceof RangeError);
}
const total = (bytes: Uint8Array) => {
  let sum = 0;
  for (let i = 0; i < bytes.length; i++) sum += bytes[i];
  return sum;
};
console.log(total(view), total(fresh));
