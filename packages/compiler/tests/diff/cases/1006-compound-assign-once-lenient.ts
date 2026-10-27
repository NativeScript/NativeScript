// @lenient-both
// Compound, logical and update assignments in non-strict code evaluate their target's object and key once, write only
// when they assign, and give the value they computed. An untyped element held in an array-typed module constant.
let n = 0;
const log: string[] = [];
function k(s) { n++; log.push('k' + s); return s; }
function i(x) { n++; log.push('i' + x); return x; }
const o: any = { a: 1, b: 'x', c: 3, d: null, e: 0, f: 5, g: 2, h: 12, m: 7, p: 8, q: 6, t: -16 };
function obj() { n++; log.push('o'); return o; }

function untyped(p, key) {
  p[key] += 2; p[key] %= 5; p[key] **= 2; p[key] <<= 1; p[key] |= 1; p[key] &= 15; p[key] ^= 3; p[key] >>= 1; p[key] >>>= 0;
  console.log(p[key], p[k(key)] += 1, p[k(key)]++, ++p[k(key)], p[k(key)] %= 4, p[k(key)] **= 3, n);
  console.log(p[k('d')] ??= 4, p[k('d')] ??= 5, p[k('e')] ||= 6, p[k('e')] ||= 7, p[k('f')] &&= 8, p[k('zz')] &&= 9, n);
  p[k('d5')] ??= 1; p[k('e5')] ||= 2; p[k('f')] &&= 3;
  console.log(p.d5, p.e5, p.f, n);
}
untyped(o, 'a');
obj().a += 1; obj().a++; --obj().a; obj().d3 ??= 1; obj().b ||= 2; obj().c &&= 3; obj().h **= 2; obj().h ^= 1; obj().m %= 2;
console.log(o.a, o.d3, o.b, o.c, o.h, o.m, n);
console.log(obj().a += 1, obj().a--, ++obj().a, obj().d4 ??= 1, obj().b ||= 2, obj().c &&= 3, obj().g %= 5, obj().g >>>= 0, n);

const list = [1, 2, 3, 4];
list[i(0)] += 1; list[i(1)]++; ++list[i(2)]; list[i(3)] **= 2; list[i(0)] |= 8; list[i(1)] %= 2;
console.log(list.join(), list[i(0)] += 1, list[i(1)]++, --list[i(2)], list[i(3)] >>= 1, n);

class Counted {
  _v;
  _w = 1;
  sets = 0;
  get v() { return this._v; }
  set v(x) { this.sets++; this._v = x; }
  get w() { return this._w; }
  set w(x) { this.sets++; this._w = x * 10; }
}
const c = new Counted();
function cc() { n++; log.push('c'); return c; }
cc().v ??= 1; cc().v ??= 2; cc().v ||= 3; cc().v &&= 4;
console.log(c.v, c.sets, n);
console.log(cc().v ??= 5, cc().v ||= 6, cc().v &&= 0, cc().v ||= 7, c.sets, n);
console.log(cc().w += 1, cc().w++, ++cc().w, cc().w *= 2, c.w, c.sets, n);

const r: Record<string, number> = { a: 1 };
r[k('a')] += 1; r[k('a')]++; r[k('a')] **= 2; r[k('a')] %= 7;
console.log(r.a, r[k('a')] -= 1, r[k('a')]++, ++r[k('a')], n);

[o[k('a')], list[i(0)]] = [100, 200];
({ x: o[k('b')] } = { x: 'q' });
console.log(o.a, o.b, list[0], n);
console.log(log.join(' '));

const items: any[] = [[1, 2], [3], null];
let at = 0;
const first: number[] = items[at++];
const second: number[] = items[at];
const names: any[] = ['x', 'y'];
const third: string = names[1];
console.log(first.length, second.length, third, at);
