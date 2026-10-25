// A field given a descriptor on an untyped object, reached through each form that reads or writes it typed.
class Point {
  x = 1;
  y = 2;
  constructor(public z = 3) {}
  sum() { return this.x + this.y + this.z; }
}
class Point3 extends Point {
  w = 4;
}
function attempt(what: string, f: () => unknown) {
  try { console.log(what, f()); } catch (e) { console.log(what, (e as Error).constructor.name, (e as Error).message.length > 0); }
}
const p = new Point3();
const anyP: any = p;
anyP.tag = 'added';
Object.defineProperty(anyP, 'x', { get() { return 10; }, enumerable: false, configurable: true });
Object.defineProperty(anyP, 'z', { value: 30, writable: false, enumerable: true });
const { x, z } = p;
const maybe: Point | undefined = Math.random() < 2 ? p : undefined;
console.log(x, z, p['x'], maybe?.x, maybe?.z, p.sum(), Object.keys(p).join(','), JSON.stringify(p));
attempt('x=', () => { p.x = 5; return p.x; });
attempt('z+=', () => { p.z += 1; return p.z; });
attempt('z++', () => p.z++);
attempt('x keyed', () => { anyP.x = 6; return anyP.x; });
Object.defineProperty(anyP, 'x', { value: 7, writable: true, enumerable: true, configurable: true });
p.x += 1;
console.log(p.x, p.sum(), Object.keys(p).join(','), Object.getOwnPropertyDescriptor(p, 'x')?.writable);
const throwing: any = new Point();
Object.defineProperty(throwing, 'y', { get() { return 1; }, set(_v: number) { throw new RangeError('no y'); } });
attempt('y=', () => { (throwing as Point).y = 2; return 'set'; });
console.log((throwing as Point).sum());
