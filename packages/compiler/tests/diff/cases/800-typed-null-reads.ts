// A `T | null` slot holding null reads back as null: identity, typeof, JSON, interpolation, and once untyped.
function show(label: string, x: unknown) {
  console.log(label, x === null, x === undefined, x == null, typeof x, JSON.stringify(x), `${x}`, String(x), [x].length);
}
let s: string | null = null;
show('local string', s);
let n: number | null = null;
show('local number', n);
let b: boolean | null = null;
show('local bool', b);
class Box { v = 1 }
let o: Box | null = null;
show('local object', o);
let f: (() => void) | null = null;
show('local function', f);
let arr: string[] | null = null;
show('local array', arr);
function getS(): string | null { return null; }
show('return string', getS());
function getO(): Box | null { return null; }
show('return object', getO());
function getF(): ((x: number) => number) | null { return null; }
show('return function', getF());
const fn = getF();
console.log('fn', fn === null, fn == undefined, JSON.stringify({ fn }), JSON.stringify([fn]));
function take(x: string | null) { show('param', x); return x; }
take(null);
const r = take(null);
console.log('r', r === null, `${r}`, JSON.stringify({ r }));
class Holder {
  s: string | null = null;
  o: Box | null = null;
  f: (() => void) | null = null;
}
const h = new Holder();
show('field string', h.s);
show('field object', h.o);
show('field function', h.f);
console.log(JSON.stringify(h));
const xs: (string | null)[] = ['a', null];
show('element', xs[1]);
console.log(JSON.stringify(xs), xs.join('-'), String(xs));
const m = new Map<string, number | null>([['k', null]]);
show('map get', m.get('k'));
show('map miss', m.get('z'));
const u: any = s;
show('any from string', u);
const v: unknown = o;
show('unknown from object', v);
const obj = { s, n, o, f };
console.log(JSON.stringify(obj));
show('obj field', obj.n);
const tpl = `${s}/${n}/${b}/${o}`;
console.log(tpl);
const picked: string | null = Math.random() > 2 ? 'x' : null;
show('ternary', picked);
let later: Box | null = new Box();
later = null;
show('reassigned', later);
console.log('direct', s === null, s === undefined, s == null, typeof s, JSON.stringify(s), `${s}`, String(s), s + '!');
console.log('direct n', n === null, n === undefined, typeof n, JSON.stringify(n), `${n}`, String(n));
console.log('direct o', o === null, o === undefined, typeof o, JSON.stringify(o), `${o}`, String(o));
console.log('direct f', f === null, f === undefined, typeof f, `${f}`);
console.log(s, n, b, o, arr);
console.log([s, n, o], { s, o });
const opt: { a?: string | null; b?: string } = { a: null };
console.log(JSON.stringify(opt), opt.a === null, opt.b === undefined, typeof opt.a);
console.log(opt.a === undefined, opt.a !== null, `${opt.a}`, opt.b === null, typeof opt.b, `${opt.b}`);
const parsed = JSON.parse('{"a":null}') as { a?: string | null; b?: string | null };
console.log(parsed.a === null, parsed.a === undefined, parsed.b === null, parsed.b === undefined, typeof parsed.a, typeof parsed.b);
const ys: (number | null)[] = [1, null];
show('element in', ys[1]);
show('element out', ys[5]);
const ms = new Map<string, Box | null>([['k', null]]);
console.log(JSON.stringify([ms.get('k'), ms.get('z')]), ms.get('k') === null, ms.get('z') === null, ms.get('z') === undefined);
let maybeU: string | undefined;
console.log(maybeU === null, maybeU === undefined, maybeU == null);
class Param { constructor(public name: string | null, private other: Box | null = null) {} }
console.log(JSON.stringify(new Param(null)), new Param(null).name === undefined);
