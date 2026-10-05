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

class Runner {
  private _resolve;
  public _sequential: boolean;
  public done: Promise<void>;
  constructor(sequential?: boolean) {
    this._sequential = sequential;
    this.done = new Promise<void>((resolve) => {
      this._resolve = resolve;
    });
  }
  finish() {
    this._resolve();
  }
}
const runner = new Runner();
runner.done.then(() => console.log('resolved', runner._sequential === true));
runner.finish();

function describeInfo(i: Info): string {
  return `${i.name}:${i.size}`;
}
const base = <Info>{};
base.name = 'base';
base.size = 1;
const derived = { ...base, size: undefined };
derived.size = 5;
console.log(describeInfo(derived), describeInfo(base));

class Source {
  constructor(public url: string, public size: number) {}
}
class FileSource extends Source {
  constructor(path: string, bytes: number) {
    super(path, bytes);
  }
}
const loose = new Source(undefined, null);
console.log(!loose.url, !loose.size, new FileSource('a.css', 3).url);

let stack: number[] = [];
stack.push(4, 9);
const found9 = stack?.findIndex((n) => n === 9);
let scope: Source = null;
function pickSource(flag: boolean): Source {
  const made: Source = flag ? new Source('picked', 1) : null;
  return made;
}
scope = pickSource(true);
console.log(found9, scope.url, pickSource(false) === null || pickSource(false) === undefined);

class Checked {
  constructor(private parts: string[]) {}
  toString(): string {
    return this.parts.reduce((a, b) => a + '|' + b);
  }
}
console.log(String(new Checked(['a', 'b'])), `${new Checked(['c'])}`);

function sourceUrl(source: Source): string {
  const url: string = source && source.url;
  return url;
}
console.log(sourceUrl(new Source('s.css', 1)));
const picked: Source = loose && new Source('and', 2);
console.log(picked.url);

class BaseFace {
  static fallback = undefined;
  static describe() {
    return `base ${this.fallback}`;
  }
}
class Face extends BaseFace {
  static fallback = new Face('serif');
  static rename(name: string) {
    this.fallback = new Face(name);
  }
  constructor(public family: string) {
    super();
  }
}
console.log(BaseFace.fallback === undefined, Face.fallback.family);
Face.rename('mono');
Face.fallback.family += '!';
console.log(Face.fallback.family, BaseFace.fallback === undefined);

interface Shaped {
  shape: string;
}
class Circle implements Shaped {
  private _shape = 'circle';
  get shape(): string {
    return this._shape;
  }
}
const vars = new Map<string, string>([['a', '1']]);
function lookup(key: string): string {
  return vars.get(key);
}
function early(flag: boolean): void {
  if (flag) return undefined;
  calls.push('late');
}
early(true);
early(false);
const shaped: Shaped = new Circle();
console.log(shaped.shape, lookup('a'), !lookup('b'), calls.at(-1));

abstract class Part {
  kind = 'part';
}
class Plain extends Part {}
class Checked2 extends Part {
  constructor(public n: number) {
    super();
    if (n < 0) throw new Error('negative');
  }
}
console.log(new Plain().kind, new Checked2(1).n);
try {
  new Checked2(-1);
} catch (e) {
  console.log((e as Error).message);
}
function maybeSource(flag: boolean): Source {
  if (!flag) return null;
  return new Source('m', 1);
}
const makers: { make: (flag: boolean) => Source } = { make: maybeSource };
const timed: string[] = [];
setTimeout(async () => {
  timed.push('async');
  console.log(timed.join(), makers.make(true).url, makers.make(false) === null || makers.make(false) === undefined);
}, 0);

class Declaration {
  public property: string;
  public value: any;
}
function declarations(values: Record<string, number>): Declaration[] {
  return Object.keys(values).map((property) => ({ property, value: values[property] }));
}
function makeSource(url: string): Source {
  return new Source(url, url.length);
}
const helpers = { Source, Declaration, makeSource, declarations };
const listed = helpers.declarations({ width: 2, height: 3 });
console.log(listed.map((d) => `${d.property}=${d.value}`).join(), helpers.makeSource('x.css').size);

const untyped: any = { sep: '/', state: { page: { duration: 300 } }, entries: new Map<string, number>([['a', 1], ['b', 2]]) };
const parts = 'a/b/c'.split(untyped.sep);
console.log(parts.length, parts.join(untyped.sep), parts.join(untyped.missing), 'x-y'.split(untyped.missing).length);
console.log(untyped?.state?.page?.duration, untyped?.other?.page?.duration === undefined);
for (const [key, value] of untyped.entries) console.log(key, value);
function pairOf(o: { x: number; y: number }): number[] {
  return [o.x, o.y];
}
function addPairs(a: number[], b: number[]): number[] {
  return [a[0] + b[0], a[1] + b[1]];
}
const points: any[] = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
console.log(points.map(pairOf).reduce(addPairs).join());
type Entry = [Source, number];
function entries(flag: boolean): Entry[] {
  const loose: any = new Source('t', 1);
  return flag ? [[new Source('e', 2), 2]] : [[loose, 3]];
}
console.log(entries(true)[0][0].url, entries(false)[0][1]);
let sources: Source[] = [new Source('m', 1)];
console.log(sources.map((s) => s.url).join());
const done: { completion?: (finished?: boolean) => void } = {};
const boxed: any = { ...done, completion: () => console.log('completed') };
boxed.completion(true);

class Bags {
  Bag: { new (): { [property: string]: string } };
}
Bags.prototype.Bag = class {
  [property: string]: string;
};
const propertyBag = new new Bags().Bag();
const pending: any = { pending: true };
propertyBag['a'] = 'x';
propertyBag['p'] = pending;
for (const key in propertyBag) {
  const value = propertyBag[key];
  console.log(key, typeof value, value === pending);
}
function appendAll<T>(into: T[], more: T[]): T[] {
  for (const m of more) into.push(m);
  return into;
}
const kept = [new Source('a', 1)];
console.log(appendAll(kept, [new Source('b', 2)]) === kept, kept.length);

class Holder {
  ref: WeakRef<Source>;
  constructor(public label: string) {}
  find(): Source {
    return (this.ref && this.ref.deref && this.ref.deref()) || null;
  }
}
const holder = new Holder('h');
const strong = new FileSource('w.css', 1);
holder.ref = new WeakRef(strong);
console.log(holder.find().url, new Holder('none').find() === null);
function describeValue(value: string | Source): string {
  if (typeof value === 'string') return 'text ' + value;
  if (value instanceof Source) return 'source ' + value.url;
  return 'other ' + String(value);
}
console.log(describeValue('a'), describeValue(new Source('s', 1)), describeValue(<any>42));
function noted(this: Holder, suffix: string): string {
  return this.label + suffix;
}
(Holder.prototype as any).noted = noted;
console.log((new Holder('p') as any).noted('!'));
const converters: any = { toNumber: parseInt };
console.log(converters.toNumber('42px'), 'a-b-a'.replace(untyped.sep2 ?? '-', '+'));
function makeDetails() {
  const details = { spans: [] };
  details.spans.push('x');
  return details;
}
console.log(makeDetails().spans.length);
