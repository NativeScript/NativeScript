// A method read off a prototype and called on another object: a built-in's as the object's own, a class's as that class's.
const o: Record<string, number> = { a: 1 };
const has = Object.prototype.hasOwnProperty;
console.log('hasOwn', Object.prototype.hasOwnProperty.call(o, 'a'), Object.prototype.hasOwnProperty.call(o, 'b'), has.call(o, 'a'), has.call([1, 2], 1), has.call([1], 'length'));
console.log('enumerable', Object.prototype.propertyIsEnumerable.call(o, 'a'), Object.prototype.propertyIsEnumerable.call([1], 'length'), Object.prototype.propertyIsEnumerable.call([1], 0));
console.log('toString', Object.prototype.toString.call([]), Object.prototype.toString.call(null), Object.prototype.toString.call(o), Object.prototype.toString.call(new Date(0)));

class Point {
  constructor(public x: number) {}
  describe(prefix: string): string {
    return prefix + this.x;
  }
  scaled(by: number): number {
    return this.x * by;
  }
}
class Point3 extends Point {
  describe(prefix: string): string {
    return 'p3 ' + Point.prototype.describe.call(this, prefix);
  }
}
const p3 = new Point3(3);
const p = new Point(2);
console.log('class', p3.describe('#'), Point3.prototype.describe.call(p3, '@'), Point.prototype.scaled.call(p3, 2), Point.prototype.scaled.apply(p, [5]));

const list = [1, 2, 3];
console.log('array', Array.prototype.slice.call(list, 1).join(','), Array.prototype.join.call(list, '-'), Array.prototype.indexOf.apply(list, [3]));
console.log('string', String.prototype.toUpperCase.call('abc'), String.prototype.slice.call('hello', 1, 3));
function count(...args: unknown[]) {
  return Array.prototype.slice.call(args, 1).length;
}
console.log('rest', count('a', 'b', 'c'));
