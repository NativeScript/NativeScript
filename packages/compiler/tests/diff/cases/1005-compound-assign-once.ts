// Compound, logical and update assignments evaluate their target's object and key once, write only when they assign,
// and give the value they computed (an update's old or new number), as statements and as values.
let n = 0;
const log: string[] = [];
function k(s: string): string { n++; log.push('k' + s); return s; }
function i(x: number): number { n++; log.push('i' + x); return x; }
const o: any = { a: 1, b: 'x', c: 3, d: null, e: 0, f: 5, g: 2, h: 12, m: 7, p: 8, q: 6, t: -16 };
function obj(): any { n++; log.push('o'); return o; }

console.log(o[k('a')] += 2, o[k('b')] += 'y', n);
console.log(o[k('c')] -= 1, o[k('c')] *= 3, o[k('c')] /= 2, o[k('c')] %= 2, n);
console.log(o[k('g')] **= 3, o[k('h')] <<= 1, o[k('h')] >>= 2, o[k('t')] >>>= 28, o[k('m')] &= 3, o[k('p')] |= 1, o[k('q')] ^= 5, n);
o[k('c')] %= 2; o[k('g')] **= 2; o[k('h')] <<= 1; o[k('h')] >>= 1; o[k('t')] >>>= 1; o[k('m')] &= 1; o[k('p')] |= 2; o[k('q')] ^= 1;
console.log(o.c, o.g, o.h, o.t, o.m, o.p, o.q, n);
console.log(o[k('a')]++, ++o[k('a')], o[k('a')]--, --o[k('a')], n);
o[k('a')]++; ++o[k('a')]; o[k('a')]--; --o[k('a')];
console.log(o.a, n);
console.log(o[k('d')] ??= 4, o[k('d')] ??= 5, o[k('e')] ||= 6, o[k('e')] ||= 7, o[k('f')] &&= 8, o[k('z')] &&= 9, n);
o[k('d2')] ??= 4; o[k('d2')] ??= 5; o[k('e2')] ||= 6; o[k('f')] &&= 10;
console.log(o.d2, o.e2, o.f, n);
obj().a += 1; obj().a++; ++obj().a; obj().d3 ??= 1; obj().b ||= 2; obj().c &&= 3; obj().h **= 2; obj().h |= 1; obj().m %= 2;
console.log(o.a, o.d3, o.b, o.c, o.h, o.m, n);
console.log(obj().a += 1, obj().a++, ++obj().a, obj().d4 ??= 1, obj().b ||= 2, obj().c &&= 3, obj().g %= 5, n);

const a: number[] = [1, 2, 3, 4];
a[i(0)] += 1; a[i(1)]++; ++a[i(2)]; a[i(3)] **= 2; a[i(0)] |= 8; a[i(1)] -= 1; a[i(2)] %= 3;
console.log(a.join(), n);
console.log(a[i(0)] += 1, a[i(1)]++, ++a[i(2)], a[i(3)] **= 2, a[i(0)] |= 16, a[i(1)]--, --a[i(2)], n);
const u: (number | undefined)[] = [undefined, 2];
u[i(0)] ??= 5; u[i(1)] ??= 6;
console.log(u.join(), u[i(0)] ??= 7, n);
const words: string[] = ['a', 'b'];
words[i(0)] += 'x';
console.log(words[i(1)] += 'y', words.join(), n);

class Box { x = 1; y: number | undefined = undefined; s = ''; }
const box = new Box();
function bx(): Box { n++; log.push('b'); return box; }
bx().x += 1; bx().x++; ++bx().x; bx().x **= 2; bx().x <<= 1; bx().x %= 7; bx().y ??= 3; bx().s ||= 'z'; bx().s += 'w';
console.log(box.x, box.y, box.s, n);
console.log(bx().x += 1, bx().x++, ++bx().x, bx().x **= 2, bx().y ??= 9, bx().s += 'v', bx().x %= 4, n);

// A setter that keeps something else than it is given, and counts its writes.
class Counted {
  private _v: number | undefined = undefined;
  private _w = 1;
  sets = 0;
  get v(): number | undefined { return this._v; }
  set v(x: number | undefined) { this.sets++; this._v = x; }
  get w(): number { return this._w; }
  set w(x: number) { this.sets++; this._w = x * 10; }
}
const c = new Counted();
function cc(): Counted { n++; log.push('c'); return c; }
cc().v ??= 1; cc().v ??= 2; cc().v ||= 3; cc().v &&= 4;
console.log(c.v, c.sets, n);
console.log(cc().v ??= 5, cc().v ||= 6, cc().v &&= 0, cc().v ||= 7, c.sets, n);
console.log(cc().w += 1, cc().w++, ++cc().w, cc().w *= 2, c.w, c.sets, n);

const r: Record<string, number> = { a: 1 };
r[k('a')] += 1; r[k('a')]++; r[k('a')] **= 2; r[k('a')] %= 7; r[k('a')] |= 8;
console.log(r.a, n);
console.log(r[k('a')] -= 1, r[k('a')]++, ++r[k('a')], r[k('a')] <<= 1, n);

const ab: any = box;
ab[k('x')] += 1; ab[k('x')]++; ab[k('x')] **= 2; ab[k('x')] &= 7;
console.log(box.x, ab[k('x')] -= 1, ab[k('x')]--, n);

[o[k('a')], a[i(0)]] = [100, 200];
({ x: o[k('b')], y: a[i(1)] } = { x: 'q', y: 300 });
console.log(o.a, o.b, a[0], a[1], n);

const big: bigint[] = [1n, 2n];
big[i(0)] += 2n; big[i(1)] *= 3n;
console.log(String(big[0]), String(big[1]), String(big[i(0)] += 1n), n);

class Holder {
  items = [1, 2, 3];
  at = 0;
  next(): number { n++; return this.at++; }
  bump(): number { this.items[this.next()] += 10; return this.items[this.next()] *= 2; }
}
const hd = new Holder();
console.log(hd.bump(), hd.items.join(), hd.at, n);
console.log(log.join(' '));
