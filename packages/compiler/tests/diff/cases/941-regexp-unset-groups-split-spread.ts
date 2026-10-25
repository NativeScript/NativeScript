// Groups that take no part in a match are undefined after split, spread and the array methods, typed or not.
const show = (xs: readonly unknown[]) => '[' + xs.map((v) => (v === undefined ? 'u' : JSON.stringify(v))).join(',') + ']';
const parts = 'a1b-c'.split(/(\d)|(-)/);
console.log(show(parts), parts.length, parts.indexOf(undefined as any));
const loose: (string | undefined)[] = 'x,y;z'.split(/(,)|(;)/);
console.log(show(loose), loose.filter((p) => p === undefined).length);
const anyParts: any[] = 'p q'.split(/( )|(\t)/);
console.log(show(anyParts));
const m = /(a)|(b)/.exec('b')!;
const spread = [...m];
console.log(show(spread), spread.length, spread.includes(undefined as any));
const copied = Array.from(m);
console.log(show(copied), show(m.slice(1)), show(m.map((v) => v)));
const counted = m.filter((v) => v === undefined).length;
console.log(counted, JSON.stringify(m), JSON.stringify([...m]));
const joined = [...'b'.match(/(a)?(b)/)!].join('|');
console.log(joined);
