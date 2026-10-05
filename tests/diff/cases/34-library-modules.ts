// @lenient
// A core module's top level as it runs in JavaScript: static initializers in
// order with the module's statements, and globals the module declares itself.
declare let __provided: any;
declare let __missing: any;

const registry: any = {
  make(kind: string) {
    console.log('making', kind);
    return kind + ' made';
  },
};
console.log('before Registry');
class Registry {
  static first: string = registry.make('first');
  static count = 2;
  static second: string = registry.make('second');
}
console.log('after Registry', Registry.first, Registry.second, Registry.count);

(globalThis as any).__provided = (x: number) => x * 2;
console.log(__provided(21), typeof __missing, typeof __provided);

class Listing {
  kind(): string {
    return 'listing';
  }
}
class Items<T> extends Listing {
  items: T[] = [];
  slice(start: number): Items<T> {
    const out = new Items<T>();
    out.items = this.items.slice(start);
    return out;
  }
}
interface Items<T> {
  kind(): string;
}
const items = new Items<number>();
items.items.push(1, 2, 3);
const rest = items.slice(1);
console.log(rest.items.length, rest.kind(), rest instanceof Items);
