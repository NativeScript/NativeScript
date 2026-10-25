// Unset capture groups read as undefined through replace callbacks, destructuring, matchAll, named groups and string conversion.
const m = /(a)|(b)/.exec('b')!;
const show = (s?: string) => (s === undefined ? 'u' : JSON.stringify(s));
console.log('a'.replace(/(a)|(b)/, (whole, p1, p2) => `${whole}:${p1}:${p2}:${typeof p2}`));
console.log('b'.replace(/(a)|(b)/, '[$1|$2]'), 'ab'.replace(/(a)|(b)/g, (_m: string, x?: string, y?: string) => show(x) + show(y)));
const [, d1, d2] = /(a)|(b)/.exec('b')!;
console.log(show(d1), show(d2), d1 ?? 'dflt');
const held: string = m[1];
console.log(show(held), held === undefined, JSON.stringify(m), JSON.stringify(m.slice(1)));
for (const r of 'ab'.matchAll(/(a)|(b)/g)) console.log(r.index, show(r[1]), show(r[2]), r.length);
const named = /(?<first>a)|(?<second>b)/.exec('b')!;
console.log(show(named.groups!.first), show(named.groups!.second), JSON.stringify(named.groups));
const take = (s: string | undefined) => s === undefined ? 'missing' : s;
console.log(take(m[1]), take(m[2]), String(m[1]), m[1] + '!');
const ms = 'b'.match(/(a)|(b)/)!;
console.log(show(ms[1]), ms[1] === undefined);
function parse(line: string) {
  const [, k, v] = /(\w+)(?:=(\w+))?/.exec(line)!;
  return v === undefined ? `${k}:none` : `${k}:${v}`;
}
console.log(parse('a=1'), parse('b'));
function pair(line: string) {
  const [, k, v] = /(\w+)(?:=(\w+))?/.exec(line)!;
  return show(k) + show(v) + typeof v;
}
console.log(pair('a=1'), pair('b'));
for (const [, x, y] of 'ab'.matchAll(/(a)|(b)/g)) console.log(show(x), show(y));
const second = (g: { [key: string]: string }) => show(g['second']);
console.log(second(named.groups!), show(named.groups?.second));
