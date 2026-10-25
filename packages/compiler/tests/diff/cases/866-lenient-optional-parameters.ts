// @app-lenient
// A non-strict app's optional parameters left out: undefined, which typeof, === and arithmetic read as script does.
class Foo { bar() { return 'bar'; } }
function f(o?: Foo, cb?: (x: string) => void, n?: number, s?: string) {
  console.log(o === undefined, cb === undefined, n === undefined, s === undefined, n + 1, s + '!', `${o}`);
  console.log(typeof o, typeof cb, typeof n, typeof s);
  if (o) console.log(o.bar());
  if (cb) cb('x');
  if (typeof cb === 'function') cb('y');
}
f();
f(new Foo(), (x) => console.log(x), 2, 's');
function tally(xs: number[], step: (x: number, first: boolean, label: string) => string) {
  return xs.map((x, i) => step(x, i === 0 ? true : undefined, i > 1 ? undefined : `#${i}`)).join(' ');
}
console.log(tally([5, 6, 7], (x, first, label) => `${x}:${first}:${label}:${typeof first}`));
