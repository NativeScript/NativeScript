// A variable or parameter typed `T | null` or `T | undefined` that an assignment narrows to present while the value it
// assigns is missing (an element past the end, a record's entry never set): JavaScript reads undefined there, so
// arithmetic gives NaN, strings "undefined", a test false, an untyped placement undefined, and a member read its TypeError.
const SCORES = [10, 20];
const NAMES = ['a', 'b'];
const FLAGS = [true];
const COLORS: Record<string, string> = { cpc: 'red' };
class Item {
  constructor(public name: string) {}
}
const ITEMS: Item[] = [new Item('x')];

function score(i: number): number | null {
  if (i < 0) return null;
  return SCORES[i];
}
function twice(n: number): number {
  return n * 2;
}
function show(s: string): string {
  return '[' + s + ']';
}
function kind(v: unknown): string {
  return typeof v;
}

let last: number | null = score(-1);
console.log(last === null);
last = SCORES[9];
console.log(last + 1, last * 2, last > 3, -last, `${last}`, String(last), twice(last), last, last === undefined);

let u: number | undefined = undefined;
console.log(u === undefined);
u = SCORES[9];
console.log(u + 1, twice(u), u, kind(u));

let c: string | null = score(-1) === null ? null : COLORS['x'];
c = COLORS['zz'];
console.log(c === undefined, 'c' + c, show(c), c, kind(c), `${c}!`);

let flag: boolean | null = null;
console.log(flag);
flag = FLAGS[4];
console.log(flag ? 'y' : 'n', !flag, flag, flag === undefined);

function param(x: number | null, y: string | null): string {
  x = SCORES[7];
  y = NAMES[7];
  return `${x + 1}|${y + '?'}|${twice(x)}|${show(y)}`;
}
console.log(param(null, null), param(1, 'z'));

// Present values read the same way.
let ok: number | null = null;
ok = SCORES[1];
console.log(ok + 1, `${ok}`, twice(ok));

// Objects: a member read of the missing value is JavaScript's TypeError; tests and untyped placements see undefined.
let p: Item | null = null;
console.log(p === null);
p = ITEMS[5];
console.log(p === undefined, typeof p, String(p), p ? 'yes' : 'no', !p, p ?? 'none', kind(p));
try {
  console.log(p.name);
} catch (e) {
  console.log('caught', (e as Error).message);
}
let q: Item | undefined = undefined;
q = ITEMS[6];
console.log(q === undefined, q == null, typeof q, kind(q));
if (q) console.log('truthy');
else console.log('falsy');
try {
  console.log(q.name.length);
} catch (e) {
  console.log('caught', e instanceof TypeError);
}
q = ITEMS[0];
console.log(q.name, typeof q);
