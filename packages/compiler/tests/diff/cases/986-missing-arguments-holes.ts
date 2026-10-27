// Undefined reaching a string, number or boolean parameter its type says is present: a read past an array's or a
// string's end, a hole, and fewer arguments through an untyped value.
function describe(label: string, v: number): string {
  return [label, v, typeof v, v === undefined, String(v), v + 1, `${v}`, v > 0, Number.isNaN(v * 2)].join(' ');
}
function pair(a: string, b: string): string {
  return a + '/' + b + '/' + typeof b + '/' + (b === undefined) + '/' + (b ? b.length : -1);
}
function flag(on: boolean): string {
  return typeof on + (on ? ' on' : on === undefined ? ' missing' : ' off');
}

const xs: number[] = [1, 2];
const past = xs[5];
console.log(describe('past-end', past));
console.log(describe('past-end-arg', xs[7]), describe('in-range', xs[1]));
const names: string[] = ['a'];
console.log('past-end-string', pair(names[0], names[3]), pair('abc'[5], 'abc'[1]));
const flags: boolean[] = [true];
console.log('past-end-boolean', flag(flags[0]), flag(flags[2]));

const holes: number[] = new Array<number>(3);
holes[1] = 5;
console.log(describe('hole', holes[0]), describe('filled', holes[1]));

const loose: any = pair;
console.log('untyped', loose('u'), loose());

class Counter {
  total = 0;
  add(by: number): number {
    this.total += by;
    return this.total;
  }
  label(prefix: string, sep: string): string {
    return prefix + sep + this.total;
  }
}
const c = new Counter();
const steps: number[] = [2];
console.log('method', c.add(steps[0]), c.add(steps[1]), Number.isNaN(c.total), c.label('t', names[1]));

const apply = (f: (n: number) => string, n: number) => f(n);
console.log('callback', apply((n) => typeof n + ' ' + n, xs[3]), apply((n) => typeof n + ' ' + n, xs[0]));

interface Shape {
  area(scale: number): string;
}
class Square implements Shape {
  area(scale: number): string {
    return typeof scale + ' ' + 4 * scale;
  }
}
class Cube extends Square {
  override area(scale: number): string {
    return 'cube ' + super.area(scale);
  }
}
const shapes: Shape[] = [new Square(), new Cube()];
const scales: number[] = [3];
console.log('family', shapes.map((s, i) => s.area(scales[i])).join(' | '));
