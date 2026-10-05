// @lenient
// Prototypes as @nativescript/core uses them: class decorators that write a class's
// prototype, fields read from the prototype until an instance sets its own,
// Object.getPrototypeOf chains and their descriptors, Object.prototype's methods,
// a class held as a value, and Object.defineProperties on an instance.

const calls: string[] = [];

function Props(specificity: number, dynamic = false): ClassDecorator {
  return (cls) => {
    cls.prototype.specificity = specificity;
    cls.prototype.dynamic = dynamic;
    cls.prototype.combinator = undefined;
    return cls;
  };
}

function Tag(name: string): ClassDecorator {
  calls.push('evaluate ' + name);
  return (cls) => {
    calls.push('apply ' + name);
  };
}

abstract class Base {
  public dynamic: boolean;
  public combinator: string;
  public label: string;
}

@Props(1)
class Simple extends Base {
  public specificity: number;
  toString() {
    return `simple ${this.specificity} ${this.dynamic}`;
  }
}

@Tag('outer')
@Tag('inner')
@Props(10, true)
class Attribute extends Simple {
  public value = 'v';
}

class Sequence extends Simple {
  constructor(parts: Simple[]) {
    super();
    this.specificity = parts.reduce((sum, p) => sum + p.specificity, 0);
    this.dynamic = parts.some((p) => p.dynamic);
  }
}

console.log(calls.join(', '));
const simple = new Simple();
const attribute = new Attribute();
const sequence = new Sequence([simple, attribute, attribute]);
console.log(simple.specificity, simple.dynamic, attribute.specificity, attribute.dynamic, sequence.specificity, sequence.dynamic);
console.log(!simple.combinator, `[${simple.combinator || ''}]`, String(simple), String(attribute));

Simple.prototype.label = 'shared';
const later = new Simple();
console.log(simple.label, later.label, attribute.label, sequence.label);
later.label = 'own';
console.log(simple.label, later.label);

class Observed {
  private _text = '';
  get text(): string {
    return this._text;
  }
  set text(value: string) {
    this._text = value;
  }
  get readOnly(): number {
    return 1;
  }
  plain = 0;
}
class Child extends Observed {}
Object.defineProperty(Observed.prototype, 'registered', {
  get() {
    return 'r';
  },
  set(value) {},
  configurable: true,
});

const notifying = new WeakMap<object, Map<string, boolean>>();
function notifies(node: object, attribute: string): boolean {
  const prototype = Object.getPrototypeOf(node);
  let cache = notifying.get(prototype);
  if (!cache) {
    cache = new Map<string, boolean>();
    notifying.set(prototype, cache);
  }
  const cached = cache.get(attribute);
  if (cached !== undefined) return cached;
  let found = false;
  for (let current = prototype; current; current = Object.getPrototypeOf(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, attribute);
    if (descriptor) {
      found = !!descriptor.set;
      break;
    }
  }
  cache.set(attribute, found);
  return found;
}
const child = new Child();
console.log(notifies(child, 'text'), notifies(child, 'readOnly'), notifies(child, 'registered'), notifies(child, 'plain'), notifies(child, 'missing'), notifies(new Child(), 'text'));
console.log(Object.getPrototypeOf(child) === Child.prototype, Object.getPrototypeOf(Child.prototype) === Observed.prototype, Object.getPrototypeOf(Observed.prototype) === Object.prototype, Object.getPrototypeOf(Object.prototype));
console.log(Object.getPrototypeOf({ a: 1 }) === Object.prototype, notifying.has(Child.prototype), notifying.has(Observed.prototype));

const HAS_OWN = Object.prototype.hasOwnProperty;
const bag: any = { a: 1 };
console.log(HAS_OWN.call(bag, 'a'), HAS_OWN.call(bag, 'b'), bag.hasOwnProperty('a'));

class Styles {
  public PropertyBag: {
    new (): { [property: string]: string };
    prototype: { [property: string]: string };
  };
  public version: number;
}
Styles.prototype.PropertyBag = class {
  [property: string]: string;
};
Styles.prototype.version = 0;
const styles = new Styles();
const values = new styles.PropertyBag();
values['color'] = 'red';
values['width'] = '10';
console.log(JSON.stringify(values), Object.keys(values).length, styles.version);
styles.version++;
console.log(styles.version, new Styles().version);

class Query {
  public _media: string;
  public _matches: boolean;
  constructor(media: string) {
    Object.defineProperties(this, {
      _media: { writable: true },
      _matches: { writable: true, value: false },
      _invalid: { value: null },
    });
    this._media = media;
  }
  get media(): string {
    this._invalid?.();
    return this._media;
  }
  private _invalid() {
    throw new TypeError('Illegal invocation');
  }
}
const query = new Query('screen');
console.log(query.media, query._matches);

function wrap(fn: Function): any {
  return function () {
    calls.push('wrapped ' + arguments.length);
    return fn.apply(this, arguments);
  };
}
const add = wrap((a: number, b: number) => a + b);
console.log(add(2, 3), calls.at(-1));

const clock = ((globalThis as any).__time || Date.now) as () => number;
const metaDir: string = (import.meta as any).dirname;
console.log(typeof clock(), clock() > 1.6e12, typeof metaDir, metaDir.length > 0);

function relay(callback: (a: any, b: any) => void, ...rest: any[]) {
  callback.apply(undefined, rest);
}
relay((a, b) => calls.push(`relay ${a} ${b}`), 7);
relay((a, b) => calls.push(`relay ${a} ${b}`), 7, 8, 9);
console.log(calls.slice(-2).join(', '));

class Info {
  name: string;
  size: number;
  curve: any = 'ease';
}
const info = <Info>{};
info.name = 'a';
const copy: Info = { ...info, size: 2 };
console.log(info.name, info.curve === undefined, info.size || 0, copy.name, copy.size, new Info().curve);

class Match {
  selectors: string[];
  changes = new Map<string, number>();
  describe(): string {
    return `class ${this.selectors.length} ${this.count()}`;
  }
  count(): number {
    return this.selectors.length;
  }
}
const emptyMatch: Readonly<Match> = { selectors: [], changes: new Map(), describe: () => 'literal', count: null };
const full = new Match();
full.selectors = ['a', 'b'];
console.log(emptyMatch.describe(), emptyMatch.selectors.length, emptyMatch.changes.size, full.describe());
