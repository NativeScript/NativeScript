// @app-lenient
// A non-strict app's module-level constants and variables from a function whose body gives null where its type says a value.
class Item {
  constructor(public name: string) {}
}
const show = (v: unknown) => (v === null ? 'null' : v === undefined ? 'undefined' : v instanceof Item ? `Item ${v.name}` : String(v));
function find(name: string): Item {
  if (name === 'a') return new Item('a');
  return null;
}
const g = find('z');
const h = find('a');
let v = find('y');
let w = new Item('w');
console.log(show(g), g === null, g == undefined, show(h), `${g}`);
console.log(show(v), v === null);
v = find('a');
w = find('none');
console.log(show(v), w == null);
v = null;
console.log(show(v), v === null);
function later() {
  console.log('later', show(g), g === null, show(v));
}
later();
