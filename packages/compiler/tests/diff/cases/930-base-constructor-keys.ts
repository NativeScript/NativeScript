// Keys script adds to `this` in a base class's constructor come before the fields of the subclasses, whose level of the
// constructor starts after it; keys added later go last.
const show = (tag: string, o: object) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o));

class Base {
  a = 1;
  constructor(tag: string) {
    (this as any).tag = tag;
  }
}
class Sub extends Base {
  b = 2;
}
class Deeper extends Sub {
  c = 3;
  constructor() {
    super('deep');
    (this as any).after = true;
  }
}
const s = new Sub('s');
show('sub', s);
(s as any).later = 'l';
show('sub later', s);
show('deeper', new Deeper());
show('base', new Base('b'));
for (const k in s) console.log('in', k);
console.log({ ...s });

class Options {
  id = 0;
  constructor(opts: object) {
    Object.assign(this, opts);
  }
}
class Named extends Options {
  label = 'n';
}
show('assigned', new Named({ x: 1, y: 'two' }));

class Indexed {
  [key: string]: unknown;
  first = 'f';
  constructor(keys: string[]) {
    for (const k of keys) this[k] = k.length;
  }
}
class Tagged extends Indexed {
  second = 's';
}
show('indexed', new Tagged(['p', 'qq']));

class Root {
  r = 'r';
  constructor() {
    Object.defineProperty(this, 'fixed', { value: 1, enumerable: true });
  }
}
class Mid extends Root {
  m = 'm';
  constructor(public given: number) {
    super();
    (this as any).midAdded = given;
  }
}
class Leaf extends Mid {
  l = 'l';
}
const leaf = new Leaf(7);
show('leaf', leaf);
delete (leaf as any).midAdded;
show('leaf deleted', leaf);
(leaf as any).midAdded = 8;
show('leaf again', leaf);
console.log(Object.entries(leaf).map(([k, v]) => `${k}=${v}`).join(' '));
