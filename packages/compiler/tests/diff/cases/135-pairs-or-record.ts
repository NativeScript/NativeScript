// @swift
// Name and value pairs written in place where pairs, a record or an iterable of pairs is taken (`new Headers([['a', '1']])`):
// the iterable makes each pair a tuple to the checker, though it is held as an array.
class Pairs {
  constructor(private list: string[][]) {}
  *[Symbol.iterator](): IterableIterator<[string, string]> {
    for (const [k, v] of this.list) yield [k, v];
  }
}
type Init = Pairs | string[][] | Record<string, string>;
function entries(init: Init): string {
  if (init instanceof Pairs) return [...init].map((pair) => pair.join(':')).join('&');
  if (Array.isArray(init)) return init.map((pair) => pair.join('=')).join('&');
  return Object.keys(init).map((k) => k + '=' + init[k]).join('&');
}
console.log(entries([['a', '1'], ['b', '2']]));
console.log(entries([['single', 'pair']]));
console.log(entries({ c: '3' }));
console.log(entries(new Pairs([['d', '4']])));
