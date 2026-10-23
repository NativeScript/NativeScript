// Array literals mixing strings with arrays (`['a', []]`, typed `(string | never[])[]`), held as arrays of any value.
const a = ['a', 'b', []];
console.log(a.length, Array.isArray(a[2]));
const b = ['', 'p q', []] as any[];
console.log(b.length, Array.isArray(b[2]));
const c: any = ['x', 'y', []];
console.log(c.length, Array.isArray(c[2]));
function count(xs: any[]): string {
  return xs.map((x) => (Array.isArray(x) ? `[${x.length}]` : typeof x)).join(',');
}
console.log(count(['a', 'b', []]), count(['a', ['b', 'c']]), count([1, 'a', [true]]));
function local(on: boolean) {
  const xs = ['base', on ? 'x' : 'y', []];
  const ys = [1, []];
  return `${xs.length} ${Array.isArray(xs[2])} ${ys.length} ${typeof ys[0]}`;
}
console.log(local(true));
const input = ['base', { on: true }, ['x', false]] as any[];
console.log(String(input[0]), typeof input[1], input[2].length);
