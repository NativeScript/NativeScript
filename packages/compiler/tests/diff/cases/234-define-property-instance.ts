// Object.defineProperty on a class instance: a value, a getter, and what keys and JSON see.
class Model {
  name = 'm';
}
const m = new Model();
Object.defineProperty(m, 'id', { value: 7, enumerable: true });
Object.defineProperty(m, 'upper', { get() { return (this as Model).name.toUpperCase(); }, enumerable: false });
console.log((m as any).id, (m as any).upper, Object.keys(m).join(','), JSON.stringify(m));
const counts: number[] = [1, 2];
Object.defineProperty(counts, 'label', { value: 'pair', enumerable: false });
console.log((counts as any).label, counts.length);
class Shape {
  kind = 's';
}
const s = new Shape();
Object.defineProperties(s, { sides: { value: 4, enumerable: true }, area: { get() { return 9; } } });
let stored = 0;
Object.defineProperty(s, 'size', { get() { return stored; }, set(v: number) { stored = v * 2; }, enumerable: true, configurable: true });
(s as any).size = 5;
const sides = Object.getOwnPropertyDescriptor(s, 'sides');
console.log((s as any).sides, (s as any).area, (s as any).size, stored, Object.keys(s).join(','), sides?.value, sides?.writable, sides?.enumerable);
try {
  (s as any).sides = 5;
} catch (e) {
  console.log('read-only', (e as Error).name);
}
const list: number[] = [];
Object.defineProperty(list, 'summary', { get() { return `n=${list.length}`; } });
list.push(1, 2);
console.log((list as any).summary, Object.keys(list).join(','), Object.prototype.hasOwnProperty.call(list, 'summary'));
class Greeter {
  greet() {
    return 'hi';
  }
}
Object.defineProperty(Greeter.prototype, 'loud', { get() { return (this as Greeter).greet().toUpperCase(); }, configurable: true });
console.log((new Greeter() as any).loud);
