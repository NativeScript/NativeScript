// An untyped object given to an optional parameter of a class of the program's (functions, methods, an override, a
// generic class's method, a constructor, an interface's method, a default): an object of another class is JavaScript's
// TypeError where the class's method is called on it, and the argument's TypeError here, never read as missing.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

class Item {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  describe() {
    return 'item ' + this.name;
  }
}

function describeOrNone(p?: Item) {
  return p ? p.describe() : 'none';
}
function describeUndefined(p: Item | undefined) {
  return p ? p.describe() : 'none';
}
function defaulted(p: Item = new Item('default')) {
  return p ? p.describe() : 'none';
}
class Base {
  show(p?: Item): string {
    return p ? 'base ' + p.describe() : 'none';
  }
}
class Sub extends Base {
  show(p?: Item): string {
    return p ? 'sub ' + p.describe() : 'none';
  }
}
class Holder<T> {
  put(p?: Item, _t?: T): string {
    return p ? p.describe() : 'none';
  }
}
class Made {
  label: string;
  constructor(p?: Item) {
    this.label = p ? p.describe() : 'none';
  }
}
interface Shower {
  show(p?: Item): string;
}
const shower: Shower = { show: (p?: Item) => (p ? p.describe() : 'none') };
const handler: (p?: Item) => string = (p) => (p ? p.describe() : 'none');

const parsed: any = JSON.parse('{"kind": "parsed"}');
const missing: any = undefined;
const base: Base = new Sub();
for (const [label, value] of [['parsed', parsed], ['item', new Item('a')], ['missing', missing]] as [string, any][]) {
  attempt(`function ${label}`, () => describeOrNone(value));
  attempt(`undefined-typed ${label}`, () => describeUndefined(value));
  attempt(`default ${label}`, () => defaulted(value));
  attempt(`override ${label}`, () => base.show(value));
  attempt(`generic ${label}`, () => new Holder<string>().put(value));
  attempt(`constructor ${label}`, () => new Made(value).label);
  attempt(`interface ${label}`, () => shower.show(value));
  attempt(`function type ${label}`, () => handler(value));
}
