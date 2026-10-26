// Function slots given null and undefined: told apart where the code compares them, one empty state where it doesn't.
type Format = (n: number) => string;
function told(f: Format | null | undefined, n: number): string {
  if (f === null) return 'null';
  if (f === undefined) return 'undefined';
  return f(n);
}
function either(f: Format | null | undefined, n: number): string {
  return f ? f(n) : f == null ? 'none' : 'other';
}
function given(f?: Format | null): string {
  return told(f, 2);
}
const hex: Format = (n) => n.toString(16);
console.log(told(null, 1), told(undefined, 1), told(hex, 255), told((n) => `#${n}`, 3));
console.log(either(null, 1), either(undefined, 1), either(hex, 10));
console.log(given(), given(null), given(undefined), given(hex));
