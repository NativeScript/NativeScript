// An app object held untyped: script calls its methods with null or nothing, which their bodies see (Q7).
class Item {
  constructor(public name: string) {}
}

class Holder {
  count = 0;
  pick(item: Item): string {
    this.count++;
    if (item === null) return 'null';
    if (item === undefined) return 'undefined';
    return `item ${item.name}`;
  }
  static make(item: Item): string {
    return item == null ? 'static none' : `static ${item.name}`;
  }
}

const h: any = new Holder();
console.log(h.pick(null), h.pick(new Item('a')), h.count);

const kind: any = Holder;
console.log(kind.make(null), kind.make(new Item('s')));

// A subclass's object held untyped reaches the base's methods and its own.
class Special extends Holder {
  pick(item: Item): string {
    return item === null ? 'special null' : `special ${item.name}`;
  }
}
const s: any = new Special();
console.log(s.pick(null), s.pick(new Item('b')));

// Held in an untyped container, and as an untyped field.
const list: any[] = [new Holder()];
console.log(list[0].pick(null));
const box: { held: any } = { held: new Holder() };
console.log(box.held.pick(null));

// An object literal with methods, held untyped.
const lit = {
  size(item: Item): number {
    return item === null ? -1 : item.name.length;
  },
  arrow: (item: Item): string => (item === null ? 'arrow null' : item.name),
};
const loose: any = lit;
console.log(loose.size(null), loose.size(new Item('abc')), loose.arrow(null));

// The typed path still sees its declared values.
const typed = new Holder();
console.log(typed.pick(new Item('t')), lit.size(new Item('xy')));

// Reading a member of the null it was given is JavaScript's TypeError, caught.
class Reader {
  read(item: Item): string {
    return item.name;
  }
}
const r: any = new Reader();
try {
  console.log(r.read(null));
} catch (e) {
  console.log('TypeError', e instanceof TypeError);
}
