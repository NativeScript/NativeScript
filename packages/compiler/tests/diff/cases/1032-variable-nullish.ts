// A variable, parameter or function result typed `T | null` that holds null at one time and a missing value at another
// (a record's entry never set, an element past the end) holds each as it is: `=== null` / `=== undefined`, `typeof`,
// JSON, `String()`, templates and `+` tell them apart.
const COLORS: Record<string, string> = { cpc: 'red' };
const NAMES = ['a', 'b'];
const SCORES = [10, 20];

function color(k: string): string | null {
  if (k === 'none') return null;
  return COLORS[k];
}
function nameAt(i: number): string | null {
  return i < 0 ? null : NAMES[i];
}
function score(i: number): number | null {
  if (i < 0) return null;
  return SCORES[i];
}
function first(i: number): string {
  return NAMES[i];
}
function viaCall(i: number): string | null {
  if (i < 0) return null;
  return first(i);
}
function show(label: string, v: string | null): string {
  return label + ':' + v + ':' + typeof v + ':' + JSON.stringify(v) + ':' + (v === undefined);
}

for (const k of ['cpc', 'none', 'tsc']) {
  const c = color(k);
  console.log(k, c === null, c === undefined, typeof c, JSON.stringify(c), String(c), 'c:' + c, `${c}`, JSON.stringify({ c }), JSON.stringify([c]));
  console.log(show(k, c), show('direct', color(k)), color(k) === undefined, JSON.stringify({ r: color(k) }));
}
let v: string | null = null;
console.log(v === null, String(v), JSON.stringify({ v }));
v = COLORS['zz'];
console.log(v === undefined, v === null, typeof v, 'v=' + v, JSON.stringify({ v }));
v = NAMES[0];
console.log(v, v === null, v === undefined);
for (const i of [-1, 0, 5]) {
  const n = nameAt(i);
  const s = score(i);
  console.log(i, n === null, n === undefined, n == null, String(n), JSON.stringify({ n, s }), s === null, s === undefined, typeof s, `${s}`);
  console.log(viaCall(i) === undefined, viaCall(i) === null, `${viaCall(i)}`);
}
let last: number | null = score(-1);
console.log(last === null, String(last));
last = score(9);
console.log(last === undefined, String(last), JSON.stringify([last]));

// A method, a function value of the program's own function type, and a result returned from a variable.
type Lookup = (k: string) => string | null;
class Palette {
  pick(k: string): string | null {
    return k.length > 3 ? null : COLORS[k];
  }
  apply(f: Lookup, k: string): string {
    const r = f(k);
    return `${r}|${r === null}|${r === undefined}`;
  }
}
const lookup: Lookup = (k) => (k === 'none' ? null : COLORS[k]);
function held(k: string) {
  const found: string | null = k === 'none' ? null : COLORS[k];
  return found;
}
const p = new Palette();
for (const k of ['cpc', 'none', 'tsc', 'longer']) {
  const a = p.pick(k), b = lookup(k), h = held(k);
  console.log(k, a === undefined, a === null, String(a), b === undefined, JSON.stringify({ b, h }), h === undefined, p.apply(lookup, k), p.apply((x) => p.pick(x), k));
}
