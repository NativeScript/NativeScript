// An untyped value kept in a field, a getter's result, a parameter property or an object-typed variable whose type the
// program tests is held as it is, by every member of the slot's group (an override, the interface member a class
// implements). A read the program narrows sees the value as that type; one placed in a typed slot without narrowing is
// JavaScript's TypeError there unless it is of that type; a member read or call on one is the value's own member.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Item {
  constructor(public name: string) {}
  greet() {
    return 'hi ' + this.name;
  }
}

class Box {
  label: string;
  item: Item;
  tags: string[];
  constructor(raw: any) {
    this.label = raw.label;
    this.item = raw.item;
    this.tags = raw.tags;
  }
  get size(): number {
    return this.data;
  }
  data: any = 0;
}

function shout(s: string) {
  return s.toUpperCase();
}
function greetOf(i: Item) {
  return i.greet();
}

function describeBox(b: Box) {
  const label = typeof b.label === 'string' ? `label ${b.label.length} ${b.label.toUpperCase()}` : `label is ${typeof b.label}`;
  const item = b.item instanceof Item ? b.item.greet() : 'plain';
  const named = 'name' in b.item ? `named ${b.item.name}` : 'no name';
  const tags = Array.isArray(b.tags) ? b.tags.join('+') : `tags ${b.tags}`;
  const size = typeof b.size === 'number' ? (b.size + 1).toFixed(1) : `size ${b.size}`;
  return [label, item, named, tags, size].join(', ');
}

const good = new Box({ label: 'ok', item: new Item('ann'), tags: ['a', 'b'] });
const odd = new Box({ label: 7, item: { name: 'bob' }, tags: 'x' });
odd.data = 'big';
console.log(describeBox(good));
console.log(describeBox(odd));
console.log(odd.label, odd.item.name, odd.tags.length);
attempt('odd greet', () => odd.item.greet());
attempt('shout good', () => shout(good.label));
attempt('shout odd', () => shout(odd.label));
attempt('greet good', () => greetOf(good.item));
attempt('greet odd', () => greetOf(odd.item));

// A method called on a held value that is no instance of its class: the value's own method.
class Holder {
  helper: Item = new Item('h');
}
const holder = new Holder();
holder.helper = JSON.parse('{"name": "j"}');
(holder.helper as any).greet = () => 'own greet';
console.log(holder.helper instanceof Item, holder.helper.greet(), holder.helper.name);

// A parameter property, its type tested.
class Tagged {
  constructor(public tag: string) {}
}
const tagged = [new Tagged('t'), new Tagged(JSON.parse('5'))];
for (const t of tagged) console.log(typeof t.tag === 'string' ? t.tag.padStart(3, '.') : t.tag + 1);

// An interface's field and the class fields implementing it are one slot.
interface Named {
  title: string;
}
class Doc implements Named {
  title: string;
  constructor(raw: any) {
    this.title = raw;
  }
}
class Note implements Named {
  title = 'note';
}
const named: Named[] = [new Doc('d'), new Doc(false), new Note()];
for (const n of named) console.log(typeof n.title === 'string' ? n.title.toUpperCase() : `not ${n.title}`);

// A base class's getter and its override are one slot.
class Base {
  get value(): number {
    return 1;
  }
}
class Derived extends Base {
  constructor(private raw: any) {
    super();
  }
  override get value(): number {
    return this.raw;
  }
}
for (const x of [new Base(), new Derived(41), new Derived('41')]) console.log(typeof x.value === 'number' ? x.value + 1 : `text ${x.value}`);

// An object-typed variable.
const parsed = JSON.parse('{"name": "cy"}') as Item;
console.log(parsed instanceof Item ? parsed.greet() : 'parsed plain', parsed.name);
attempt('greet parsed', () => greetOf(parsed));
