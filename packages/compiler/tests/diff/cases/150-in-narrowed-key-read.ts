// @lenient
// A symbol key tested with `in` and then read: the value the object holds under it, or the default.
class Base {
  name = 'base';
  count = 1;
  label(): string {
    return this.name + this.count;
  }
}
class Derived extends Base {
  extra = true;
}
const key = Symbol('value');
function read<T extends Base>(owner: T, fallback: number): number {
  return <number>(key in owner ? owner[key] : fallback);
}
function write<T extends Base>(owner: T, value: number): void {
  owner[key] = value;
}
const d = new Derived();
console.log(read(d, 7));
write(d, 42);
console.log(read(d, 7), d.label());
const b = new Base();
console.log(read(b, -1));
