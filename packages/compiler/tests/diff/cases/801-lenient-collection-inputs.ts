// @app-lenient
// Untyped inputs to Set and Map constructors in a non-strict app: null and undefined make empty collections, entries are read by index.
function nothing(): any { return null; }
function missing(): any { return undefined; }
const s1 = new Set(nothing());
const s2 = new Set(missing());
const s3 = new Set<string>(nothing());
console.log(s1.size, s2.size, s3.size);
const pairs: any = [['a', 1], ['b', 2]];
const m1 = new Map(pairs);
console.log(m1.size, m1.get('a'), m1.get('b'));
const m2 = new Map<string, number>(pairs);
console.log(m2.size, m2.get('b'));
const m3 = new Map(nothing());
console.log(m3.size);
const items: any = ['x', 'y', 'x'];
const s4 = new Set(items);
console.log(s4.size, [...s4].join());
const bad: any = [1];
try { new Map(bad); } catch (e) { console.log((e as Error).constructor.name); }
const sets: any = new Set(['p', 'q']);
const m4 = new Map<string, number>(new Map(pairs));
console.log(new Set(sets).size, m4.get('a'));
