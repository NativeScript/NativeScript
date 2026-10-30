// Object.defineProperty and defineProperties with a literal key on a class's declared fields: an accessor, read-only,
// hidden and fixed fields, read and written by typed code, by methods, by keys, JSON and descriptors.
class Point {
  x = 1;
  y = 2;
  label = 'p';
  constructor(public tag: string) {}
  describe() {
    return `${this.x},${this.y},${this.label},${this.tag}`;
  }
}
const p = new Point('t');
let sets = 0;
let stored = 10;
Object.defineProperty(p, 'x', { get() { return stored; }, set(v: number) { sets++; stored = v * 2; }, enumerable: true, configurable: true });
Object.defineProperty(p, 'y', { value: 5, writable: false });
Object.defineProperty(p, 'label', { enumerable: false });
Object.defineProperty(p, 'tag', { value: 'T', writable: true, enumerable: false, configurable: false });
p.x = 4;
p.tag = 'U';
console.log(p.x, sets, p.y, p.label, p.tag, p.describe());
console.log(Object.keys(p).join(','), JSON.stringify(p), 'label' in p);
try {
  p.y = 9;
} catch (e) {
  console.log('read-only', (e as Error).constructor.name, p.y);
}
try {
  Object.defineProperty(p, 'tag', { enumerable: true });
} catch (e) {
  console.log('fixed', (e as Error).constructor.name, Object.keys(p).join(','));
}
const d = Object.getOwnPropertyDescriptor(p, 'y');
console.log(d?.value, d?.writable, d?.enumerable, d?.configurable);
const other = new Point('o');
other.x = 3;
console.log(other.x, other.describe(), Object.keys(other).join(','));

class Base {
  size = 1;
}
class Sized extends Base {
  extra = 0;
}
const s = new Sized();
Object.defineProperties(s, { size: { get: () => 7 }, extra: { value: 3, enumerable: false } });
console.log(s.size, s.extra, Object.keys(s).join(','), JSON.stringify(s));

const log: string[] = [];
class Opt {
  a?: number;
  b = 1;
}
const o = new Opt();
o.a = 2;
Object.defineProperty(o, 'b', { set(v: number) { log.push('set ' + v); }, get: () => 9, enumerable: true });
o.b = 3;
console.log(log.join(';'), o.b, Object.keys(o).join(','));
delete o.a;
o.b = 4;
console.log(log.join(';'), Object.keys(o).join(','), JSON.stringify(o));
