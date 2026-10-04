// Operators and statements at their edges: labeled blocks, switch fallthrough,
// typeof on what was never defined, the comma operator, **, ToInt32, tagged templates.
declare const neverDefined: unknown;
declare function neverDeclaredFn(): void;

block: {
  console.log('in block');
  if (Math.random() >= 0) break block;
  console.log('not reached');
}
outer: {
  inner: {
    console.log('inner');
    break outer;
  }
  console.log('skipped');
}
let n = 0;
counting: for (const x of [1, 2, 3, 4]) {
  check: {
    if (x % 2 === 0) break check;
    n += x;
    continue counting;
  }
  n += 100;
}
console.log('labeled', n);

function classify(v: number): string[] {
  const out: string[] = [];
  switch (v) {
    case 1:
      out.push('one');
    case 2:
      out.push('two');
      break;
    default:
      out.push('default');
    case 3:
      out.push('three');
    case 4: {
      out.push('four');
      if (v === 4) break;
      out.push('after four');
    }
    case 5:
      out.push('five');
  }
  return out;
}
for (const v of [1, 2, 3, 4, 5, 9]) console.log('switch', v, classify(v).join(','));

function kind(x: string | number): string {
  switch (typeof x) {
    case 'string':
    case 'number':
      return 'primitive ' + typeof x;
  }
  return 'other';
}
console.log(kind('a'), kind(1));

function noMatch(s: string): number {
  let r = 0;
  switch (s) {
    case 'a': r = 1;
  }
  switch (s.length) {
    default:
      r += 10;
  }
  return r;
}
console.log(noMatch('a'), noMatch('b'));

console.log(typeof neverDefined, typeof neverDeclaredFn, typeof neverDefined === 'undefined');

let a = 1, b = 2;
const c = (a++, b++, a + b);
console.log('comma', a, b, c);
for (let i = 0, j = 10; i < j; i += 3, j -= 3) console.log('pair', i, j);
const d = (console.log('side effect'), 42);
console.log(d);

console.log(2 ** 10, 2 ** -1, (-2) ** 3, 2 ** 3 ** 2, 2 ** 0.5, 0 ** 0, (-8) ** (1 / 3));
let p = 3;
p **= 2;
console.log(p, 1 ** Infinity, Infinity ** 0, (-Infinity) ** 3, 10 ** 21, 10 ** -7);

const big = 2 ** 32 + 5;
console.log(big | 0, big >>> 0, big >> 1, -1 >>> 0, -1 >>> 28, 1 << 31, 1 << 32, 1 << 33);
console.log(~~3.7, ~~-3.7, ~5, ~-1, 3.9 | 0, -3.9 | 0, NaN | 0, Infinity | 0, -Infinity >>> 0);
console.log(0xffffffff & 0xff00ff00, 0x80000000 | 0, 2147483648 >> 0, 4294967296.5 | 0, 1e21 | 0);
console.log(5 & 3, 5 | 3, 5 ^ 3, -5 >> 1, -5 >>> 1, 123456789 << 8, 2 ** 53 | 0, -(2 ** 31) - 1 | 0);
let flags = 0b1010;
flags |= 0b0101;
flags &= ~0b0010;
flags ^= 1 << 4;
flags <<= 2;
flags >>= 1;
flags >>>= 0;
console.log(flags, flags.toString(2), (-flags >>> 0).toString(16));

function tag(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.raw.map((s, i) => `[${s}]` + (i < values.length ? `<${String(values[i])}>` : '')).join('') + ' ' + strings.length + ' ' + strings.join('|');
}
const who = 'world';
console.log(tag`hello ${who}! ${1 + 1}\n`);
console.log(tag``, tag`${who}`, tag`a\tb${0}`);
console.log(String.raw`C:\new\table ${who}\u0041`, String.raw`x${1}y${2}z`, String.raw``);

function sameSite() {
  const seen: TemplateStringsArray[] = [];
  const keep = (s: TemplateStringsArray, ..._v: number[]) => { seen.push(s); return s.length; };
  for (let i = 0; i < 2; i++) keep`a${i}b`;
  keep`a${0}b`;
  return [seen[0] === seen[1], seen[0] === seen[2]];
}
console.log('template identity', sameSite());

function html(strings: TemplateStringsArray, ...values: (string | number)[]) {
  return strings.reduce((out, s, i) => out + s + (i < values.length ? String(values[i]).toUpperCase() : ''), '');
}
console.log(html`<p>${'x'}</p><b>${3}</b>`);
