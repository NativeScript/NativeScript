// @swift
// Idioms core's xml, abortcontroller and split-view modules use.
const codes = { amp: 38, lt: 60, gt: 62 };
const seen: string[] = [];
for (const key in codes) {
  if (codes.hasOwnProperty(key)) seen.push(key);
}
console.log(seen.join(','), codes.hasOwnProperty('quot'), codes.hasOwnProperty('toString'));

function normalized(s: string): string {
  s = String(s);
  return s.length > 3 ? s.toUpperCase() : s;
}
console.log(normalized('abcd'), normalized('ab'));

console.log(typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol', typeof Map, typeof Promise);

class Base {
  static instance: Base | null = null;
  static getInstance(): Base | null {
    return Base.instance;
  }
  name() {
    return 'base';
  }
}
class Derived extends Base {
  static getInstance(): Base | null {
    return Derived.instance ?? new Derived();
  }
  name() {
    return 'derived';
  }
}
console.log(Base.getInstance() === null, Derived.getInstance()?.name());

function count(xs: string[]): number {
  let i: number;
  let last: string;
  for (i = 0; i < xs.length; i++) {
    last = xs[i];
  }
  return i;
}
console.log(count(['a', 'b', 'c']), count([]));
