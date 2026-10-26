// Elements that may be null or undefined both, which nothing tells apart: one empty state, read as undefined.
const items: (string | null | undefined)[] = ['a', null, undefined];
items.push(null);
const firsts = new Map<string, number | null | undefined>([['a', 1], ['b', null], ['c', undefined]]);
console.log(items.map((x) => x ?? '-').join(','), items.filter((x) => x != null).length, [...firsts.values()].map((v) => (v == null ? 0 : v + 1)).join(','));
