// @swift
// A method read off an object nothing else holds (`new Cmp().compare`, a call's result) and passed as a
// callback runs for as long as it is used, and is still the class's method to `===`. JavaScript calls it with
// `this` undefined, so the method using `this` reads it optionally.
class Plain {
  compare(a: number, b: number): number {
    return a - b;
  }
}

class Directed {
  dir = 1;
  label = 'directed';
  compare(a: number, b: number): number {
    return (this?.dir ?? 1) * (b - a);
  }
  tag(n: number): string {
    return `${this?.label ?? 'directed'} ${n}`;
  }
}

const makeDirected = (): Directed => new Directed();

console.log([3, 1, 2].sort(new Plain().compare).join(','));
console.log([3, 1, 2, 5, 4].sort(new Directed().compare).join(','));
console.log([30, 10, 20].sort(makeDirected().compare).join(','));
console.log([1, 2].map(new Directed().tag).join(';'));

const held = new Plain();
const fromTemporary = new Plain().compare;
console.log(fromTemporary === held.compare, new Directed().compare === makeDirected().compare, fromTemporary(5, 2));

const keep: ((a: number, b: number) => number)[] = [];
for (let k = 0; k < 3; k++) keep.push(new Directed().compare);
console.log(keep.map((f) => f(1, 4)).join(','), keep.length);
