// Arrays a group that took no part put undefined in, held in typed variables and read through loops, joins and templates.
const show = (v: unknown) => (v === undefined ? 'u' : JSON.stringify(v));
const m = /(a)|(b)/.exec('b')!;
for (const g of m) console.log(show(g), typeof g);
for (const p of 'a1b'.split(/(\d)|(-)/)) console.log(show(p), typeof p, p === undefined ? 'unset' : p.length);
const typed: string[] = m.slice(1);
const sep = new RegExp(['(,)', '(;)'].join('|'));
const dynamic = 'x,y'.split(sep);
console.log(typed.map(show).join(' '), dynamic.map(show).join(' '), `${dynamic}`, String(typed), dynamic.join('+'), dynamic.length);
const plain = 'a,b'.split(new RegExp(','));
console.log(plain.join('|'), plain.indexOf('b'), 'a, b'.split(/\s*(,)\s*/).join('|'), 'a b'.split(/\s+/).length);
let held = 'q'.split(/(z)?/);
held = held.concat(['w']);
console.log(held.map(show).join(' '), held.filter((x) => x !== undefined).length, held.some((x) => x === undefined));
console.log(Array.from('ab'.matchAll(/(a)|(b)/g), (r) => r.map(show).join('/')).join(' '));
const asStrings: string[] = /(x)?y/.exec('y')!;
console.log(asStrings.length, show(asStrings[1]), asStrings.join('-'));
