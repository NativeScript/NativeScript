// Slots that can hold both null and undefined keep them apart: unset or `!` fields, values from `any`, `T | null | undefined`,
// and typed writes to an object literal's optional fields.
function show(label: string, x: unknown) {
  console.log(label, x === null, x === undefined, typeof x, JSON.stringify(x), `${x}`, JSON.stringify({ x }), JSON.stringify([x]));
}
class A {
  x!: string | null;
  y?: number | null;
  z!: A | null;
}
const a = new A();
show('unset x', a.x);
show('unset y', a.y);
console.log(JSON.stringify(a));
a.x = null;
a.y = null;
a.z = null;
show('x null', a.x);
show('y null', a.y);
show('z null', a.z);
console.log(JSON.stringify(a), a.x === null, a.y === undefined);
a.x = 'v';
a.y = 2;
show('x set', a.x);
console.log(JSON.stringify(a), a.x?.length);
a.y = undefined;
show('y undefined', a.y);
const a2 = new A();
a2.z = a;
a.z = null;
console.log(JSON.stringify(a2));

const rawU: any = undefined;
const rawN: any = null;
const rawS: any = 'r';
const su: string | null = rawU;
const sn: string | null = rawN;
const ss: string | null = rawS;
show('any undefined', su);
show('any null', sn);
show('any string', ss);
console.log(su === undefined, sn === null, ss?.length);
let later: number | null = 1;
later = rawU;
show('assigned any', later);

function tri(v: string | null | undefined) {
  const u: any = v;
  return [u === null, u === undefined, typeof v, v === null, v === undefined, v == null, JSON.stringify({ v })].join(' ');
}
console.log('tri', tri(null), '|', tri(undefined), '|', tri('s'));
let local: number | null | undefined = null;
show('local null', local);
local = undefined;
show('local undefined', local);
local = 3;
show('local 3', local);

function pass(v?: string | null): string | null | undefined {
  return v;
}
show('pass none', pass());
show('pass null', pass(null));
show('pass s', pass('p'));
const r = pass(null);
console.log(r === null, r ?? 'dflt', r === undefined);

const o: { b: number | null; a?: string | null } = { b: 1 };
show('shape unset', o.a);
o.a = null;
o.b = null;
show('shape a null', o.a);
show('shape b null', o.b);
console.log(JSON.stringify(o), Object.keys(o).join(','));
o.a = 'k';
show('shape a set', o.a);
o.a = undefined;
show('shape a undefined', o.a);
console.log(JSON.stringify(o));

interface Doc { title?: string | null; n: number | null }
const back = JSON.parse(JSON.stringify({ title: null, n: null })) as Doc;
show('json title', back.title);
back.title = undefined;
console.log(JSON.stringify(back));
back.title = null;
back.n = 4;
console.log(JSON.stringify(back), back.title === null);
const docs: Doc[] = [back, { n: null }];
console.log(JSON.stringify(docs));

function fromUntyped(v: string | null) {
  const u: any = v;
  return `${u === undefined} ${u === null} ${typeof v} ${v ?? 'none'}`;
}
console.log(fromUntyped(rawU), fromUntyped(rawN), fromUntyped(null), fromUntyped('q'));
class B extends A {
  w!: string | null;
}
const b = new B();
b.w = null;
b.x = null;
console.log(JSON.stringify(b), b.w === null, b.y === undefined);
const tl: string | null | undefined = Math.random() > 2 ? 'x' : null;
const lit: { a?: string | null } = { a: tl };
console.log(JSON.stringify(lit), JSON.stringify({ tl }), [tl].length);
