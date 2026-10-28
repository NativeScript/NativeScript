// @app-lenient
// A non-strict app's field given null (a literal, a function's `return null`) and a missing value (`find`, an element
// past the end): JSON keeps the null and leaves the undefined out, and `=== null` / `=== undefined` tell them apart,
// for a class's field and an interface's field given by a literal or written later.
class Item {
  constructor(public id: string) {}
}
const ITEMS = [new Item('a'), new Item('b')];
const NAMES = ['x', 'y'];
function none(): string {
  return null;
}

interface Shape {
  item: Item;
  name: string;
}
function shape(id: string, i: number): Shape {
  if (i === 7) return { item: null, name: none() };
  return { item: id === 'none' ? null : ITEMS.find((t) => t.id === id), name: i < 0 ? null : NAMES[i] };
}
const s = shape('a', 0);
console.log(JSON.stringify(s));
s.item = null;
s.name = null;
console.log(JSON.stringify(s), s.item === null, s.name === null);
s.item = ITEMS.find((t) => t.id === 'q');
s.name = NAMES[5];
console.log(JSON.stringify(s), s.item === undefined, s.name === undefined);
console.log(JSON.stringify(shape('none', -1)), JSON.stringify(shape('z', 9)), JSON.stringify(shape('a', 7)));
const t = shape('none', -1), u = shape('z', 9);
console.log(t.item === null, t.name === null, t.item === undefined, u.item === undefined, u.name === null);

class Detail {
  item: Item = ITEMS[0];
  name: string = 'n';
  open(id: string, i: number): void {
    if (id === 'none') this.item = null;
    else this.item = ITEMS.find((t) => t.id === id);
    this.name = i < 0 ? none() : NAMES[i];
  }
}
const d = new Detail();
console.log(JSON.stringify(d));
d.open('none', -1);
console.log(JSON.stringify(d), d.item === null, d.name === null);
d.open('z', 9);
console.log(JSON.stringify(d), d.item === undefined, d.name === undefined);
