// @lenient
// Code checked as core is, without strictNullChecks: undefined where a value type is declared.
function checkKey(key: string): boolean {
  return !!key;
}

function getBoolean(key: string, defaultValue?: boolean): boolean {
  if (!checkKey(key)) {
    return;
  }
  if (key === 'on') {
    return true;
  }
  return defaultValue;
}

function getString(key: string, defaultValue?: string): string {
  if (!checkKey(key)) {
    return;
  }
  return defaultValue;
}

function getNumber(key: string, defaultValue?: number): number {
  if (!checkKey(key)) {
    return null;
  }
  return defaultValue;
}

class Shade {
  argb = 0;
  static fromNative(value: any): Shade {
    if (value === 1) return null;
    const s = new Shade();
    s.argb = value;
    return s;
  }
  isDark(): boolean {
    if (this.argb < 0) {
      return;
    }
    return this.argb < 128;
  }
}

const results = /(\w+)-(\d+)/.exec('tab-12');
const none = /x/.exec('y');
const counts = new Map<string, number>([['a', 1]]);
const missing = counts.get('b');
console.log(getBoolean(''), getBoolean('on'), getBoolean('off'), getBoolean('off', true));
console.log(getString('', 'x') === undefined, getString('k'), getString('k', 'v'), getString('k') || 'fallback');
console.log(getNumber('') == undefined, getNumber('k', 3), getNumber('k') || 5, getNumber('') === null);
console.log(results ? results[2] : 'none', none ? 'match' : 'none', none === null, missing === undefined, counts.get('a'));
console.log(Shade.fromNative(1) === null, Shade.fromNative(5).argb, new Shade().isDark());
if (getBoolean('off')) console.log('never');
const flag = getBoolean('on');
console.log(flag ? 'on' : 'off', !getBoolean(''));

function join(...parts: any): string {
  let result: string;
  for (let i = 0; i < parts.length; i++) {
    if (!result) {
      result = parts[i];
      continue;
    }
    result = result + ',' + parts[i];
  }
  return result;
}
console.log(join('a', 'b', 'c'), join() === undefined);

function run(cb?: (x: number) => number, onError?: (e: any) => any): number {
  if (cb) {
    return cb(2);
  }
  if (onError) {
    onError(new Error('no callback'));
  }
  return -1;
}
console.log(run((x) => x * 3), run(), run(undefined, (e) => console.log(e.message)));

// Object values that may be undefined, read as JavaScript reads them.
class Leaf {
  label = 'leaf';
  parent: Leaf;
}
function findParent(leaf: Leaf): Leaf {
  const parent = leaf.parent;
  return parent?.parent;
}
function climb(leaf: Leaf): string {
  let names = '';
  while (leaf) {
    names += leaf.label;
    leaf = leaf.parent;
  }
  return names;
}
const leaf = new Leaf();
const root = new Leaf();
root.label = 'root';
leaf.parent = root;
console.log(findParent(leaf) === undefined, climb(leaf), (<Leaf>(<any>leaf))?.parent?.label);

// Object fields and accessors that may be set to undefined; untyped weak targets; Function.prototype.
class Owner {
  items: string[] = ['a'];
  private _peer: Leaf;
  get peer(): Leaf {
    return this._peer;
  }
  set peer(value: Leaf) {
    this._peer = value;
  }
  ref: WeakRef<any>;
}
const owner = new Owner();
owner.peer = leaf;
console.log(owner.peer.label, owner.items.length);
owner.peer = null;
owner.items = null;
console.log(owner.peer == null, owner.items == null);
owner.ref = new WeakRef(root as any);
console.log(owner.ref.deref() === root);
const noop: any = Function.prototype;
console.log(noop() === undefined);

// Iterating untyped values.
const bag: any = { list: ['p', 'q'], text: 'hi' };
let seen = '';
for (const v of bag.list) seen += v;
for (const ch of bag.text) seen += ch.toUpperCase();
try {
  for (const v of bag.none) seen += v;
} catch (e) {
  seen += ':' + (e instanceof TypeError);
}
console.log(seen);

// `a && a.b` of another type than a; wrapper constructors.
class Scope {
  css = 'x { }';
  owner: Leaf;
}
function cssOf(scope: Scope): string {
  return scope && scope.css;
}
function ownerOf(scope: Scope): Leaf {
  return scope && scope.owner;
}
const scope = new Scope();
scope.owner = leaf;
console.log(cssOf(scope), !cssOf(null), ownerOf(scope).label, ownerOf(null) == null);
const wrapped: any = new Number('4');
console.log(wrapped + 1, new Boolean(0) == false, new String(12) + '!');
