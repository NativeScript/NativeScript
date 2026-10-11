// @kotlin
// ToPrimitive: `valueOf` and `toString` of a class or an object literal in arithmetic, comparisons and sorts.
class Money {
  constructor(public cents: number) {}
  valueOf() { return this.cents; }
  toString() { return '$' + this.cents / 100; }
}
const a = new Money(150), b = new Money(250);
console.log((a as any) + (b as any), (a as any) * 2, (b as any) - (a as any), (a as any) / 3, -(a as any), +(a as any));
console.log([b, a].sort((x, y) => (x as any) - (y as any)).map((x) => String(x)).join(' '), `${a}`, 'total ' + a, String(b));
console.log((a as any) < (b as any), (a as any) > (b as any), (a as any) >= 150, Number(a), Math.max(a as any, b as any));
const bigger = [a, b, new Money(5)].sort((x, y) => (x < y ? 1 : -1)).map((m) => m.cents).join(',');
console.log(bigger);
class Version {
  constructor(public major: number, public minor: number) {}
  valueOf() { return this.major * 1000 + this.minor; }
}
console.log((new Version(1, 2) as any) < (new Version(1, 10) as any), (new Version(2, 0) as any) + 1);
const o: any = { valueOf() { return 42; } };
const t: any = { toString() { return 'T'; } };
console.log(o + 1, o * 2, o > 41, t + 1, `${t}`, String(t), t + '', o + '');
