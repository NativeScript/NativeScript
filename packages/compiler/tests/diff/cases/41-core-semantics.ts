// @lenient
// Semantics core relies on that the kit generated from core first got wrong.

// A function declaration reading `this` it does not declare, stored as an accessor: the receiver.
class Bag {
  values: Record<string, number> = { size: 3 };
}
function readSize() {
  return this.values.size;
}
Object.defineProperty(Bag.prototype, 'size', { get: readSize, configurable: true });
console.log((new Bag() as any).size);

// apply into a rest parameter: the list's elements, not its first.
function count(...args: any[]): number {
  return args.length;
}
const callback: Function = count;
console.log(callback.apply(undefined, [1, 2, 3]), callback.apply(undefined, []));

// new Array of one value known only at run time: a length when a number, else the one element.
function make(x: any): any[] {
  return new Array(x);
}
console.log(make(2).length, make({ key: 'a' }).length, make({ key: 'b' })[0].key);

// a || b of objects is undefined when both are.
interface Color {
  name: string;
}
function pick(own: Color, inherited: Color): Color {
  return own || inherited;
}
console.log(pick(undefined, undefined) === undefined, pick(undefined, { name: 'red' }).name);

// A cache miss is undefined, not an empty array.
const cache: Record<string, string[]> = {};
function split(path: string): string[] {
  let result: string[] = cache[path];
  if (result) {
    return result;
  }
  result = path.split('.');
  cache[path] = result;
  return result;
}
console.log(split('a.b').length, split('a.b').length, split('').length);

// ?. on an array that is undefined.
const registry: Record<number, string[]> = {};
console.log(registry[1]?.find((x) => x === 'a') === undefined, registry[1]?.length === undefined);
registry[1] = ['a'];
console.log(registry[1]?.find((x) => x === 'a'));

// Destructuring a member the object lacks.
function describe(descriptor: any): string {
  const { family, size } = descriptor;
  return `${family === undefined}:${size}`;
}
console.log(describe({ size: 12 }));

// An optional boolean read from an untyped entry: undefined is not false.
interface Entry {
  visible?: boolean;
}
function hidden(entry: any): boolean {
  const value: boolean = (entry.entry as Entry).visible;
  return value !== undefined && !value;
}
console.log(hidden({ entry: {} }), hidden({ entry: { visible: false } }), hidden({ entry: { visible: true } }));
