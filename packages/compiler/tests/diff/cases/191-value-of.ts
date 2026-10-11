// @swift
// ToPrimitive calls a class's valueOf for `+`, `-`, `*` and comparisons, and its toString for strings.
class Money {
  constructor(public cents: number) {}
  valueOf() { return this.cents; }
  toString() { return '$' + this.cents / 100; }
}
class Euros extends Money {
  toString() { return '€' + this.cents / 100; }
}
class Version {
  constructor(public major: number, public minor: number) {}
  valueOf() { return this.major * 1000 + this.minor; }
}
const a = new Money(150), b = new Money(250);
console.log((a as any) + (b as any), (a as any) * 2, (b as any) - (a as any), [b, a].sort((x, y) => (x as any) - (y as any)).map((x) => String(x)));
console.log(`${a}`, 'total: ' + a, String(b), (a as any) < (b as any), (a as any) >= (b as any), +(a as any), Number(b));
const v1: any = new Version(1, 2), v2: any = new Version(1, 10);
console.log(v1 < v2, v1 > v2, v2 - v1, v1 + '', [v2, v1].sort((p, q) => p - q).map((v: any) => v.minor));
const e: any = new Euros(300);
console.log(e + 1, `${e}`, e * 1, e == 300);
