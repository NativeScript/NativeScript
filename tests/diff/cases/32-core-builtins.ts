// Built-ins and call forms @nativescript/core's own code uses.

// substr: a negative start counts from the end; the length is clamped, and UTF-16 units count.
const word = 'héllo wörld';
console.log(word.substr(2), word.substr(-3), word.substr(1, 3), word.substr(-5, 2), word.substr(4, 100));
console.log(JSON.stringify([word.substr(20), word.substr(2, -1), word.substr(0, 0), word.substr(-100, 2), word.substr(NaN, 2)]));
const face = 'a😀b';
console.log(face.substr(1, 2) === '😀', face.substr(0, 3) === 'a😀', face.substr(-1), face.substr(3), face.length);
const param = 'text=hello';
console.log(param.substr(0, param.indexOf('=')), param.substr(param.indexOf('=') + 1));

// clz32: the value as an unsigned 32-bit integer first.
console.log([0, 1, -1, 2 ** 32, 2 ** 31, 0.5, NaN, Infinity, 1e10, -0, 3.7, 65535].map((x) => Math.clz32(x)).join(' '));

// Date.now: milliseconds, an integer.
const now = Date.now();
console.log(typeof now, now > 1.6e12, Number.isInteger(now), Date.now() >= now);

// toLocaleString on arrays: each element's, joined by ","; null and undefined are empty.
const amounts: number[] = [1234.5, 1e6, -0.25, 7];
const mixed: (number | string | null | undefined)[] = [12345, 'x', null, undefined, 2.5];
const nested: number[][] = [[1000, 2], [3]];
console.log(amounts.toLocaleString(), '|', mixed.toLocaleString(), '|', nested.toLocaleString(), '|', [].toLocaleString(), '|', ['a', 'b'].toLocaleString());

// Error classes called without `new` construct all the same.
const plain = Error('plain');
const typed = TypeError('typed');
console.log(ReferenceError('ref').name, AggregateError([plain], 'agg').message, AggregateError([1, 2]).errors.length);
console.log(plain instanceof Error, plain.message, typed instanceof TypeError, typed.name, String(RangeError('range')), Error().message === '');
try {
  throw SyntaxError('thrown');
} catch (e) {
  console.log((e as Error).name, (e as Error).message, e instanceof SyntaxError);
}

// Object.create(null): an empty object with nothing inherited.
const registry: Record<string, number> = Object.create(null);
registry['one'] = 1;
registry['two'] = 2;
console.log(Object.keys(registry), registry['one'] + registry['two'], 'one' in registry, 'three' in registry);
const bag = Object.create(null);
bag.flag = true;
console.log(Object.keys(bag), bag.flag, bag.missing, JSON.stringify(bag), 'toString' in bag);

// A thisArg beside a callback that never reads `this`: evaluated, then ignored.
let thisArgs = 0;
function context(): object {
  thisArgs++;
  return {};
}
const nums = [3, 1, 4, 1, 5];
const doubled = nums.map((n) => n * 2, context());
const odd = nums.filter(function (n) {
  return n % 2 === 1;
}, context());
const four = nums.find((n) => n === 4, context());
const fourAt = nums.findIndex((n) => n === 4, context());
const anyBig = nums.some((n) => n > 4, context());
const allSmall = nums.every((n) => n < 10, context());
let sum = 0;
nums.forEach((n) => {
  sum += n;
}, context());
console.log(doubled, odd, four, fourAt, anyBig, allSmall, sum, thisArgs);
class Totaller {
  total = 0;
  addAll(values: number[]) {
    values.forEach((v) => {
      this.total += v;
    }, this);
    return this.total;
  }
}
console.log(new Totaller().addAll(nums));
function isOdd(n: number) {
  return n % 2 === 1;
}
class Tally {
  count = 0;
  add(n: number) {
    this.count += n;
  }
  run(values: number[]) {
    values.forEach(this.add, this);
    return [this.count, values.filter(isOdd, this).length];
  }
}
console.log(new Tally().run(nums));

// match with a string (a RegExp of it) or an untyped pattern.
const sentence = 'a.b.c 12 apples';
const dot = sentence.match('.');
console.log(dot?.[0], dot?.index, sentence.match('\\d+')?.[0], sentence.match('pears') === null);
const pattern: any = /(\d)(\d)/;
const digits = sentence.match(pattern);
console.log(digits?.[0], digits?.[1], digits?.[2], digits?.index);
const loosePattern: any = 'b\\.c';
console.log(sentence.match(loosePattern)?.[0], sentence.match(loosePattern)?.index);
const globalPattern: any = /\w/g;
console.log(sentence.match(globalPattern)?.length);
console.log(sentence.match(undefined as any)?.index, 'x(y'.match('\\(y')?.[0]);
try {
  'x(y'.match('(y');
} catch (e) {
  console.log((e as Error).name);
}

// Spread arguments.
const parts: any[] = ['spread', 1, true];
console.log(...parts);
console.log('before', ...parts, 'after');
const stack: number[] = [1, 2];
const more = [3, 4];
stack.push(...more);
stack.push(0, ...more, 9);
console.log(stack);
const letters = ['a', 'b', 'c', 'd'];
const inserted = ['x', 'y'];
const removed = letters.splice(1, 2, ...inserted);
console.log(letters, removed);
letters.splice(0, 0, 'first', ...inserted);
console.log(letters);
function joinAll(sep: string, ...items: string[]): string {
  return items.join(sep);
}
const words = ['p', 'q'];
console.log(joinAll('-', ...words), joinAll('+', 'o', ...words, 'r'), joinAll('/'));
class Collector {
  seen: number[] = [];
  collect(first: number, ...rest: number[]) {
    this.seen.push(first, ...rest);
    return this;
  }
}
console.log(new Collector().collect(1, ...more).collect(5, ...[7, 8]).collect(6).seen);
const merged: number[] = [...stack, 10, ...more];
const names: string[] = ['z', ...letters];
console.log(merged.length, names);

// new Array: empty, of a length, and a parenthesized constructor.
const empty = new Array<string>();
empty.push('one');
const sized = new Array<number>(3);
console.log(empty, empty.length, sized.length);
for (let i = 0; i < sized.length; i++) {
  sized[i] = i * i;
}
console.log(sized);
const single = new Array<string>('only');
console.log(single, single.length);
class Point {
  constructor(public x: number, public y: number) {}
}
const p = new (Point)(1, 2);
console.log(p.x + p.y);

// Calling a cast value.
type Adder = (a: number, b: number) => number;
const adder: any = (a: number, b: number) => a + b;
console.log((<Adder>adder)(2, 3), (adder as Adder)(4, 5));
const shout: unknown = (s: string) => s.toUpperCase() + '!';
console.log((shout as (s: string) => string)('hey'));

// Instantiation expressions and optional calls with type arguments.
function identity<T>(value: T): T {
  return value;
}
const identityOfString = identity<string>;
console.log(identityOfString('same'));
function currentPoint<T extends Point>(): T;
function currentPoint(): Point {
  return new Point(3, 4);
}
const current = currentPoint<Point>?.();
console.log(current.x, current.y);

// A class field named by Symbol.toStringTag.
class Decoder {
  [Symbol.toStringTag] = 'TextDecoder';
  encoding = 'utf-8';
}
const decoder = new Decoder();
console.log(Object.prototype.toString.call(decoder), String(decoder), decoder[Symbol.toStringTag]);

// An object literal for an interface declaring methods.
interface AnimationInfo {
  propertyNameToAnimate: string;
  value: number;
  duration?: number;
  done?(): void;
  describe(prefix: string): string;
}
const info: AnimationInfo = {
  propertyNameToAnimate: 'opacity',
  value: 0.5,
  describe(prefix: string) {
    return `${prefix} ${this.propertyNameToAnimate}=${this.value}`;
  },
};
console.log(info.describe('animate'), info.duration, info.done === undefined);
const withDone: AnimationInfo = {
  propertyNameToAnimate: 'scale',
  value: 2,
  duration: 300,
  done() {
    console.log('done', this.duration);
  },
  describe: (prefix) => prefix + '!',
};
withDone.done?.();
console.log(withDone.describe('scale'));
const infos: AnimationInfo[] = [info, withDone];
console.log(infos.map((i) => i.propertyNameToAnimate).join());

// parseInt and parseFloat as values.
const parsers: Array<(s: string) => number> = [parseInt, parseFloat];
console.log(parsers.map((p) => p('42.5px')).join(','), ['1', '2', '3'].map(parseFloat).join('|'));

// A library function applied to a list.
const codes = [72, 105, 33];
console.log(String.fromCharCode.apply(null, codes), Math.max.apply(null, [3, 9, 4]));
