// @lenient-kotlin
// As the kit is generated: an untyped value where core declares a class is that class's instance, or null and undefined
// carried on as script carries them; an instance of another class is JavaScript's TypeError, there or where script
// would meet it. A value core makes only to be told apart by identity (`unsetValue`) is no TypeError there.
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

interface Pick {
  item: Item;
}

function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

function describeHeld(h: Holder): string {
  const it = h.item;
  return it ? it.describe() : 'none';
}

function describePicked(p: Pick): string {
  return p.item ? p.item.describe() : 'none';
}

function run(values: any[]) {
  if (!values.length) throw new Error('no values');
  const h: any = new Holder();
  for (const v of values) {
    attempt('field', () => {
      h.item = v;
      return describeHeld(h);
    });
    attempt('shape', () => {
      const raw: any = { item: v };
      return describePicked(raw as Pick);
    });
    attempt('read', () => {
      const raw: any = { item: v };
      const it: Item = raw.item;
      return it ? it.describe() : 'none';
    });
    attempt('narrowed', () => (v instanceof Item ? v.describe() : 'not an item'));
  }
  attempt('marker', () => {
    h.item = unsetValue;
    h.backup = unsetValue;
    return isUnset(unsetValue);
  });
}

run([new Item('a'), null, undefined, new Other(), { name: 'shaped' }]);
