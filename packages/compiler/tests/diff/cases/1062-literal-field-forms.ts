// A literal's field that a missing value reaches is a key holding undefined, as JavaScript makes it, though its type
// doesn't say so: keys, console and spreads see it; JSON leaves it out. Elements of an anonymous object type's field
// keep null and undefined apart where they are told apart.
interface Look {
  name: string;
  width: number;
}
const NAMES = ['low', 'high'];
const WIDTHS: Record<string, number> = { low: 1.5 };
function lookAt(i: number): Look {
  return { name: NAMES[i], width: WIDTHS[NAMES[i]] };
}
const seen = lookAt(0);
const missing = lookAt(5);
console.log(Object.keys(seen), Object.keys(missing), 'name' in missing, missing.hasOwnProperty('width'));
console.log(missing, JSON.stringify(missing), { ...missing, more: 1 });
for (const k in missing) console.log('key', k);
const half: Look = { name: NAMES[1], width: WIDTHS[NAMES[1]] };
console.log(Object.entries(half), JSON.stringify(half));

const o: { list: (string | null | undefined)[] } = { list: ['a', null, undefined] };
console.log(o.list.length, o.list[1] === null, o.list[2] === undefined, o.list.includes(null), o.list.indexOf(undefined));
const p: { list: (string | null | undefined)[]; n: number } = { list: ['b'], n: 1 };
p.list.push(null, undefined);
console.log(p.list.indexOf(null), p.list.indexOf(undefined), JSON.stringify(p), p);
