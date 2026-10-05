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
