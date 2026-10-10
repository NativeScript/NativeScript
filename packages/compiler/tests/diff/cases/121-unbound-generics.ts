// @swift
// Type parameters Swift cannot state: one any value binds, compared as script compares it; one bound to a class and a
// shape, its members read by name; a generic class named with its arguments.
function same<T extends { equals?(other: T): boolean } | any>(a: T, b: T): boolean {
  return a === b;
}
const box = { n: 1 };
console.log(same(1, 1), same('a', 'b'), same(box, box), same(box, box.n === 1 ? box : box));

class Base {
  name = 'base';
}
class Holder extends Base {
  items: string[] = [];
  add = (item: string) => {
    this.items.push(item);
  };
}
function fill<T extends Base & { add(item: string): void }>(make: () => T): T {
  const made = make();
  made.add(made.name);
  made.add('more');
  return made;
}
console.log(fill(() => new Holder()).items.join(','));

class Wrapper<T extends Base> {
  constructor(public value: T) {}
}
function wrap(): Wrapper<Base> | null {
  return new Wrapper<Base>(new Holder());
}
console.log(wrap()?.value.name);
