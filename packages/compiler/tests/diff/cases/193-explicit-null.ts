// @swift
// A field a literal sets to null is kept by JSON.stringify and Object.keys; defaults apply to undefined, not null.
interface Patch { name?: string | null; age?: number | null; tags?: string[] | null; note: string }
const clear: Patch = { name: null, note: 'n' };
const set: Patch = { name: 'Ann', age: null, note: 'n' };
const none: Patch = { note: 'n' };
console.log(JSON.stringify(clear), JSON.stringify(set), JSON.stringify(none), Object.keys(clear), Object.keys(none));
const u: any = clear;
console.log(u.name, u.age, 'name' in u, 'age' in u);
u.name = 'Bo';
const w: any = set;
w.name = null;
w.age = 4;
console.log(JSON.stringify(clear), JSON.stringify(set), w.name === null, w.age);
const parsed = JSON.parse('{"name":null,"note":"p"}') as Patch;
console.log(JSON.stringify(parsed));
const raw: any = { a: null, b: undefined, c: 0 };
const { a = 'A', b = 'B', c = 'C' } = raw;
function f(x: any = 'X', y: any = 'Y') { return [x, y]; }
console.log(a, b, c, f(null, undefined), f());
const list: any[] = [null, undefined];
const [p = 1, q = 2] = list;
console.log(p, q);
