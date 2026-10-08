// @lenient
// Typed arrays and DataView as library code holds them: views passed as ArrayBufferView,
// fields that start unset, and elements read where a number may be missing.
class Mesh {
  positions: Float32Array;
  indices: Uint16Array;
  header: DataView;
  constructor(count: number) {
    this.positions = new Float32Array(count * 3);
    this.indices = new Uint16Array(count);
    this.header = new DataView(new ArrayBuffer(8));
  }
  fill(scale: number) {
    for (let i = 0; i < this.positions.length; i++) this.positions[i] = i * scale;
    for (let i = 0; i < this.indices.length; i++) this.indices[i] = this.indices.length - i;
    this.header.setUint32(0, this.positions.byteLength, true);
    this.header.setFloat32(4, scale);
  }
}
function byteSize(view: ArrayBufferView): number {
  return view ? view.byteLength : -1;
}
const mesh = new Mesh(2);
mesh.fill(0.25);
console.log(mesh.positions, mesh.indices, mesh.header.getUint32(0, true), mesh.header.getFloat32(4), byteSize(mesh.positions), byteSize(mesh.header), byteSize(null));
let pending: Uint8Array;
console.log(pending === undefined, pending ? pending.length : 0);
pending = new Uint8Array(mesh.indices.buffer);
console.log(pending, pending[9], ArrayBuffer.isView(pending), pending instanceof Uint8Array, mesh.indices instanceof Uint16Array);
const bytes = new Uint8ClampedArray([1, 2, 3]);
const copy = Uint8ClampedArray.from(bytes);
copy[0] = 999;
console.log(bytes, copy, bytes.subarray(1).map((v) => v * 100));
