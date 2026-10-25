// Object.defineProperty with a key known only at run time, on an untyped object that is a program class's object: the
// key names a declared field, which becomes read-only, hidden or an accessor.
class Model {
  id = 1;
  name = 'm';
  size = 0;
}
function define(target: object, key: string, descriptor: PropertyDescriptor) {
  Object.defineProperty(target, key, descriptor);
}
const m = new Model();
const keys = ['id', 'name', 'size'];
define(m, keys[0], { value: 7, writable: false });
define(m, keys[1], { enumerable: false });
define(m, keys[2], { get: () => 42 });
console.log(m.id, m.name, m.size, Object.keys(m).join(','), JSON.stringify(m));
try {
  m.id = 8;
} catch (e) {
  console.log('read-only', (e as Error).constructor.name, m.id);
}
const descriptors: PropertyDescriptorMap = {};
descriptors['name'] = { value: 'n', enumerable: true };
Object.defineProperties(m as any, descriptors);
console.log(m.name, Object.keys(m).join(','));
