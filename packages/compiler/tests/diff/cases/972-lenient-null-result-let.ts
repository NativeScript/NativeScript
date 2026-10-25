// @app-lenient
// A non-strict app's local variables from a function whose body gives null where its type says a value, assigned again.
class Item {
  constructor(public name: string) {}
}
const show = (v: unknown) => (v === null ? 'null' : v === undefined ? 'undefined' : v instanceof Item ? `Item ${v.name}` : String(v));
function find(name: string): Item {
  if (name === 'a' || name === 'b') return new Item(name);
  return null;
}
function run(first: string, second: string) {
  let it = find(first);
  console.log(show(it), it === null);
  it = find(second);
  console.log(show(it), it === null, it ? it.name : '-');
  it = new Item('c');
  console.log(show(it));
  it = find('none');
  console.log(show(it), it === null, it == null);
}
run('z', 'a');
run('b', 'z');
function loop() {
  let cur = find('a');
  for (const n of ['b', 'z', 'a']) {
    console.log(show(cur));
    cur = find(n);
  }
  console.log(show(cur), cur === null);
  let pick = find('z');
  const choose = (n: string) => {
    pick = find(n);
  };
  choose('a');
  console.log(show(pick));
  choose('q');
  console.log(show(pick), pick === null);
}
loop();
