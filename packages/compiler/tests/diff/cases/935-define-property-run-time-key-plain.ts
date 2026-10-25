// Object.defineProperty with keys known only at run time on plain objects, beside program classes whose objects are only
// ever held typed.
class Point {
  x = 1;
  y = 2;
}
function define(target: object, key: string, descriptor: PropertyDescriptor) {
  Object.defineProperty(target, key, descriptor);
}
const bag: any = { a: 1 };
const names = ['ro', 'hidden', 'computed'];
define(bag, names[0], { value: 'r', writable: false, enumerable: true });
define(bag, names[1], { value: 'h', enumerable: false });
let reads = 0;
define(bag, names[2], { get: () => ++reads, enumerable: true });
console.log(Object.keys(bag).join(','), JSON.stringify(bag), bag.hidden, reads);
try {
  bag.ro = 'w';
} catch (e) {
  console.log('read-only', (e as Error).constructor.name, bag.ro);
}
const target: any = {};
for (const n of ['p', 'q']) define(target, n, { value: n.toUpperCase(), enumerable: n === 'p' });
console.log(Object.keys(target).join(','), target.q);
const p = new Point();
p.x = 5;
console.log(JSON.stringify(p), Object.keys(p).join(','));
