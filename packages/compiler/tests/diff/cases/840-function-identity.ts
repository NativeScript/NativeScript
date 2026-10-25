// Function values keep their identity through arrays, fields, Maps, Sets and generic parameters.
type Listener = (v: number) => void;
const seen: string[] = [];
const f: Listener = (v) => seen.push(`f${v}`);
const g: Listener = (v) => seen.push(`g${v}`);

const arr: Listener[] = [f, g];
console.log(arr.indexOf(f), arr.indexOf(g), arr.includes(f), arr.lastIndexOf(g));
console.log(
	arr[0] === f,
	arr[0] !== f,
	arr[1] === f,
	arr.find((s) => s === g) === g,
	arr.findIndex((s) => s === g),
);

let subs: Listener[] = [];
subs.push(f);
subs.push(g);
subs = subs.filter((s) => s !== f);
console.log(subs.length, subs[0] === g);
for (const s of subs) s(1);

const removeAt = subs.indexOf(g);
if (removeAt >= 0) subs.splice(removeAt, 1);
console.log(subs.length);

class Holder {
	cb: Listener | null = null;
	list: Listener[] = [];
	is(fn: Listener): boolean {
		return this.cb === fn;
	}
}
const h = new Holder();
h.cb = f;
h.list.push(f);
console.log(h.cb === f, h.is(f), h.is(g), h.list[0] === h.cb, h.list.indexOf(f));

const m = new Map<Listener, string>();
m.set(f, 'f');
m.set(g, 'g');
console.log(m.get(f), m.get(g), m.has(f), m.size);
m.delete(f);
console.log(m.has(f), m.size);

const set = new Set<Listener>();
set.add(f);
set.add(f);
set.add(g);
console.log(set.size, set.has(f));
set.delete(g);
console.log(set.size, set.has(g));

function same<T>(a: T, b: T): boolean {
	return a === b;
}
function id<T>(x: T): T {
	return x;
}
console.log(same(f, f), same(f, g), id(f) === f, [id(f)].indexOf(f));

const fromMap = [...m.keys()];
console.log(fromMap[0] === g, [...set][0] === f);
console.log(seen.join(','));
