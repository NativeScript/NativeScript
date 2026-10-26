// @app-lenient
// A non-strict app's string, number and boolean parameters given fewer arguments than they declare (through call and
// apply, which a non-strict check lets through), a read past an array's end, and an optional parameter passed on.
function describe(label: string, v: number): string {
  return [label, v, typeof v, v === undefined, String(v), v + 1, `${v}`].join(' ');
}
function pair(a: string, b: string): string {
  return a + '/' + b + '/' + typeof b + '/' + (b === undefined);
}
function flag(on: boolean): string {
  return typeof on + (on ? ' on' : on === undefined ? ' missing' : ' off');
}
console.log('call', pair.call(null, 'a'), flag.call(null), describe.call(null, 'n'));
console.log('apply', pair.apply(null, ['x']), flag.apply(null, []), describe.apply(null, ['m', 2]));
const xs: number[] = [1];
console.log(describe('past-end', xs[3]), describe('in-range', xs[0]));
function relay(label: string, n?: number): string {
  return describe(label, n);
}
console.log('optional', relay('given', 4), relay('left-out'));
class Scale {
  factor = 2;
  times(n: number, offset: number): number {
    return n * this.factor + (offset === undefined ? 100 : offset);
  }
}
const s = new Scale();
console.log('method', Scale.prototype.times.call(s, 3), Scale.prototype.times.apply(s, [3, 1]), s.times(xs[0], xs[9]));
