// @app-lenient
// A non-strict app's string, number or object that may be missing or null where its type says present (an untyped
// value, a variable declared without a value, an optional member or parameter, `Map.get`, `pop`, `find`, a function
// returning null or a missing read) reads as undefined or null as JavaScript holds it, and a member read or call on it
// is JavaScript's TypeError. A result that may hold both null and undefined is held with one empty state, so only the
// error's name is shown for those.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
function attemptName(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name);
  }
}
const data: any = JSON.parse('{}');
const missing: string = data.nothing;
let count: number = data.nothing;
let flag: boolean = data.nothing;
let later: string;
let laterN: number;
var v: string;
console.log(missing, missing === undefined, typeof missing, String(missing), `${missing}`, missing + '!');
console.log(count, count === undefined, typeof count, count + 1, flag === undefined);
console.log(later, later === undefined, typeof later, later + '!');
console.log(laterN, typeof laterN, laterN + 1, laterN === undefined);
console.log(v, typeof v);
attempt('upper', () => missing.toUpperCase());
attempt('length', () => missing.length);
attempt('toFixed', () => count.toFixed(1));
attempt('later upper', () => later.toUpperCase());
attempt('laterN', () => laterN.toFixed(1));
later = 'set';
console.log(later, typeof later);
function local() {
  let x: string;
  const y: string = data.nothing;
  return [typeof x, typeof y, x === undefined, y === undefined].join(',');
}
console.log(local());
function loc() {
  let x: string;
  return x.length;
}
attempt('local', () => loc());
function g(p: string) {
  return p === undefined ? 'undef' : p;
}
console.log(g(undefined), g(data.nothing));
function opt(p?: string) {
  return p.length;
}
attempt('opt param', () => opt());
const mp = new Map<string, string>();
attempt('map get', () => mp.get('x').length);
const xs: string[] = [];
attempt('pop', () => xs.pop().length);
attempt('find', () => xs.find((x) => x === 'a').toUpperCase());
const nums: number[] = [];
attempt('num el', () => nums[1].toFixed(2));
interface O {
  a?: string;
  n?: number;
}
const o: O = {};
attempt('opt member', () => o.a.length);
attempt('opt num', () => o.n.toFixed(1));
console.log(mp.get('x') + '!', o.a + '!', o.n + 1);
function give(): string {
  return undefined;
}
attempt('give', () => give().length);
console.log(give() === undefined, typeof give());
class Chord {
  constructor(public id: number, public name: string) {}
  play() { return 'play ' + this.name; }
  get upper() { return this.name.toUpperCase(); }
}
interface Person { name: string; age: number }
const chords = [new Chord(1, 'C'), new Chord(2, 'G')];
const people: Person[] = [{ name: 'a', age: 1 }];
function chordById(id: number): Chord {
  if (id > 0) return chords[id - 1];
  return null;
}
function findChord(id: number): Chord {
  return chords.find((c) => c.id === id);
}
function personAt(i: number): Person {
  return people[i];
}
function noPerson(): Person {
  return null;
}
class Store {
  current(id: number): Chord { return id ? chords[1] : null; }
  lookup(id: number): Chord { return chords.find((c) => c.id === id); }
}
const store = new Store();
attemptName('null field', () => chordById(0).name);
attemptName('null method', () => chordById(0).play());
attemptName('null getter', () => chordById(0).upper);
attempt('missing field', () => findChord(9).name);
attempt('missing method', () => findChord(9).play());
attempt('iface past end', () => personAt(5).name);
attempt('iface null', () => noPerson().age);
attemptName('store null', () => store.current(0).name);
attempt('store missing', () => store.lookup(7).play());
console.log(noPerson() === null, noPerson() === undefined, findChord(9) === undefined, findChord(9) === null);
const top = chordById(0);
const gone = findChord(9);
console.log(top == null, top ? 'y' : 'n', gone === undefined, !gone);
attemptName('var null', () => top.name);
attempt('var missing', () => gone.play());
function pick(id: number) {
  const c = chordById(id);
  if (!c) return 'none';
  return c.name;
}
function pickAgain(id: number) {
  let c = findChord(id);
  if (c) return c.name;
  c = findChord(1);
  return c.play();
}
console.log(pick(0), pick(2), pickAgain(7), pickAgain(2), chordById(1).name, findChord(2).play(), personAt(0).name);
const issue: any = JSON.parse('{"labels":[{"name":"x"},{"name":"y"}]}');
function labelsOf(key: string) {
  const labels: string[] = (issue[key] ?? []).map((l) => l.name);
  return labels.length + ':' + labels.join('|') + ':' + labels.find((l) => l === 'y');
}
console.log(labelsOf('labels'), labelsOf('none'));
const GROUP_OF: Record<string, string> = { a: 'A' };
console.log(['x', 'a'].find((l) => GROUP_OF[l]), ['x', 'a'].filter((l) => GROUP_OF[l]).join());
function groupOf(l: string): string {
  return GROUP_OF[l];
}
console.log(groupOf('x') === undefined, groupOf('x') ? 'y' : 'n', typeof groupOf('x'), groupOf('a'));
