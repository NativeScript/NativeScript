// @lenient
// As the kit is generated: an untyped value where core declares one of its classes is that class's instance, or null
// and undefined carried on as script carries them; an instance of another class is JavaScript's TypeError, there or
// where script would meet it. A value core makes only to be told apart by identity (`unsetValue`) is no TypeError there.
const unsetValue: any = new Object();

function isUnset(value: any): boolean {
  return value === unsetValue;
}

class Item {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  describe(): string {
    return 'item ' + this.name;
  }
}

class Other {
  kind = 'other';
}

class Holder {
  item: Item = new Item('first');
  backup: Item | null = null;
}

function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

function describeItem(it: Item): string {
  if (!it) throw new TypeError('no item');
  return it.describe();
}

function held(h: Holder): string {
  return h.item ? h.item.describe() : 'none';
}

function asserted(raw: any): string {
  const it = raw.item as Item;
  return it ? it.describe() : 'none';
}

function declared(raw: any): string {
  const it: Item = raw.item;
  return it ? it.describe() : 'none';
}

function called(raw: any): string {
  return describeItem(raw.item);
}

function run(values: any[]) {
  if (!values.length) throw new Error('no values');
  const h: any = new Holder();
  const f: any = (it: Item) => (it ? it.describe() : 'none');
  for (const v of values) {
    attempt('field', () => {
      h.item = v;
      return held(h);
    });
    attempt('optional', () => {
      h.backup = v;
      return h.backup ? h.backup.describe() : 'none';
    });
    attempt('asserted', () => asserted({ item: v }));
    attempt('declared', () => declared({ item: v }));
    attempt('argument', () => called({ item: v }));
    attempt('function', () => f(v));
  }
  attempt('marker', () => {
    h.item = unsetValue;
    h.backup = unsetValue;
    const raw: any = { item: unsetValue };
    const it: Item = raw.item;
    const asItem = raw.item as Item;
    return isUnset(unsetValue) && typeof it === typeof asItem;
  });
}

run([new Item('a'), null, undefined, new Other(), { name: 'shaped' }]);
