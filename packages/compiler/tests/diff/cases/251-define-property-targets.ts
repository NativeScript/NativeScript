// Object.defineProperty on a class's object, an array and a function: the property is there, read by name and by key.
class Point {
  x = 1;
  y = 2;
}
const p = new Point();
Object.defineProperty(p, 'sum', { get() { return this.x + this.y; }, enumerable: false, configurable: true });
Object.defineProperty(p, 'label', { value: 'origin', writable: false, enumerable: true });
Object.defineProperty(p, 'x', { value: 10 });
const pa = p as any;
console.log('point', pa.sum, pa.label, p.x, Object.keys(p).join(','), JSON.stringify(p));
console.log('point descriptors', JSON.stringify(Object.getOwnPropertyDescriptor(p, 'label')), 'sum' in p, Object.getOwnPropertyDescriptor(p, 'sum')?.enumerable);

const list = [1, 2, 3];
Object.defineProperty(list, 'total', { get() { return list.reduce((a, b) => a + b, 0); } });
Object.defineProperty(list, 'tag', { value: 'nums', enumerable: false });
const la = list as any;
console.log('array', la.total, la.tag, list.length, JSON.stringify(list), Object.keys(list).join(','));
list.push(4);
console.log('array after push', la.total);

function greet() {
  return 'hi';
}
Object.defineProperty(greet, 'version', { value: 2, enumerable: true });
Object.defineProperty(greet, 'loud', { get() { return greet().toUpperCase(); } });
const ga = greet as any;
console.log('function', ga.version, ga.loud, greet());

const counter = () => 0;
Object.defineProperty(counter, 'calls', { value: 0, writable: true });
(counter as any).calls++;
console.log('arrow', (counter as any).calls);

class Base {
  id = 1;
}
class Derived extends Base {
  constructor() {
    super();
    Object.defineProperty(this, 'kind', { value: 'derived', enumerable: true });
  }
}
const d = new Derived();
Object.defineProperties(d, { a: { value: 1, enumerable: true }, b: { get() { return 2; } } });
const da = d as any;
console.log('derived', da.kind, da.a, da.b, d.id, Object.keys(d).join(','), 'b' in d);
try {
  da.kind = 'changed';
} catch (e) {
  console.log('read-only', (e as Error).constructor.name, da.kind);
}
