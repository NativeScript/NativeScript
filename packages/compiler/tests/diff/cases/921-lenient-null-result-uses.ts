// @app-lenient
// A non-strict app's method that gives null where its type says a value: given to a parameter, and stored in a field
// its class sets to null.
class Item {
  constructor(public name: string) {}
}
const show = (v: unknown) => (v === null ? 'null' : v === undefined ? 'undefined' : v instanceof Item ? `Item ${v.name}` : String(v));
class Picker {
  items: Item[] = [];
  chosen: Item = null;
  pick(name: string): Item {
    for (const i of this.items) if (i.name === name) return i;
    return null;
  }
  keep(i?: Item) {
    console.log('keep', i == null, i ? i.name : '-');
  }
  take(i: Item, label?: string) {
    console.log('take', !i, label);
  }
  choose(name: string) {
    this.chosen = this.pick(name);
    console.log('chosen', show(this.chosen), this.chosen === null, this.chosen === undefined);
  }
}
function describe(i?: Item) {
  return i ? i.name : 'nothing';
}
function given(i: Item) {
  return i ? i.name : '-';
}
const p = new Picker();
p.items.push(new Item('a'));
p.keep(p.pick('a'));
p.keep(p.pick('z'));
console.log(describe(p.pick('z')), describe(p.pick('a')));
p.take(p.pick('z'));
p.take(p.pick('a'), 'found');
console.log(show(p.pick('z')), show(p.pick('a')));
p.choose('z');
p.choose('a');
p.choose('y');
function local() {
  const g = p.pick('z');
  console.log(show(g), g === null, `${g}`, given(g), given(null), given(p.pick('a')));
}
local();
