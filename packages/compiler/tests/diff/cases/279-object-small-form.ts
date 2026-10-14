// Plain objects across their small form and the dictionary: key order before and after the 17th key, an
// array-index key or a symbol moves an object over; delete and re-add; getters, freeze and seal; keys equal
// by code units whatever built them.
const order = (o: any): string => Object.keys(o).join(',');
const grown: any = {};
for (let i = 0; i < 16; i++) grown['k' + ((i * 7) % 16)] = i;
console.log(order(grown));
grown.last = 'x';
console.log(order(grown), grown.k3, grown.last, Object.keys(grown).length);
grown['2'] = 'two';
grown['0'] = 'zero';
console.log(order(grown));

const indexed: any = { b: 1, a: 2 };
indexed['10'] = 'ten';
indexed['1'] = 'one';
indexed.c = 3;
console.log(order(indexed), JSON.stringify(indexed));

const sym = Symbol('s');
const symbolic: any = { x: 1 };
symbolic[sym] = 'symbol';
symbolic.y = 2;
console.log(order(symbolic), symbolic[sym], Object.getOwnPropertySymbols(symbolic).length);

const readd: any = { a: 1, b: 2, c: 3 };
delete readd.a;
readd.a = 4;
delete readd.missing;
console.log(order(readd), readd.a, 'b' in readd, 'a' in readd, JSON.stringify(readd));
const many: any = {};
for (let i = 0; i < 20; i++) many['p' + i] = i;
for (let i = 0; i < 20; i += 2) delete many['p' + i];
many.p0 = 'back';
console.log(order(many));

const withGetter: any = { a: 1 };
let reads = 0;
Object.defineProperty(withGetter, 'computed', { get: () => ++reads * 10, enumerable: true, configurable: true });
withGetter.b = 2;
console.log(order(withGetter), withGetter.computed, withGetter.computed, reads, JSON.stringify(withGetter));
Object.defineProperty(withGetter, 'hidden', { value: 'h', enumerable: false });
console.log(order(withGetter), withGetter.hidden, Object.getOwnPropertyNames(withGetter).join(','));

const frozen: any = Object.freeze({ a: 1, b: { c: 2 } });
const sealed: any = Object.seal({ a: 1 });
const attempts: string[] = [];
for (const [label, act] of [['frozen set', () => (frozen.a = 9)], ['frozen add', () => (frozen.z = 1)], ['sealed set', () => (sealed.a = 5)], ['sealed add', () => (sealed.z = 1)], ['sealed delete', () => delete sealed.a]] as [string, () => unknown][]) {
  try {
    act();
    attempts.push(label + ' ok');
  } catch (e) {
    attempts.push(label + ' ' + (e as Error).name);
  }
}
console.log(attempts.join('; '), frozen.a, sealed.a, Object.isFrozen(frozen), Object.isSealed(sealed), Object.isFrozen(sealed), order(frozen), order(sealed));

const built: any = {};
const parts = ['a', 'b'];
built['ab'] = 1;
built[parts.join('')] = 2;
built[String.fromCharCode(97, 98)] = 3;
built['a' + 'b'] += 1;
built['é'] = 'precomposed';
built['é'] = 'decomposed';
console.log(order(built), built.ab, built['é'], built['é'], Object.keys(built).length);
const parsed: any = JSON.parse('{"ab":1,"a\\u0062":2,"x":3,"ab":4}');
console.log(order(parsed), parsed.ab, JSON.stringify(parsed));
