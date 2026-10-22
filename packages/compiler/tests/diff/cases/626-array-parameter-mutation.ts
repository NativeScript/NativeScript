// @app-lenient
// A typed array or an untyped array given to a number[] parameter is the caller's array: writes through it are seen.
class Matrix {
  getValues(out: number[]) { for (let i = 0; i < 3; i++) out[i] = i + 10; }
  setValues(values: number[]) { return values[0] + values[1] + values[2]; }
}
const m = new Matrix();
const buf: any = new Float32Array(3);
m.getValues(buf);
console.log(Array.from(buf).join(), m.setValues(buf));
const plain: any = [0, 0, 0];
m.getValues(plain);
console.log(plain.join());
const doubles = new Float64Array([1, 2, 3]);
console.log(m.setValues(doubles as any));
