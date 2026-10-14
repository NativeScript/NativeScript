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
