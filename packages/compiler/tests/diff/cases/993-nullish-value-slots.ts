// Variables, parameters and results that may hold null and undefined both, which the program tells apart, given values
// from untyped code and read by it: null stays null and undefined undefined on every path.
function kind(x: unknown): string {
  return x === null ? 'null' : x === undefined ? 'undefined' : `${typeof x}:${x}`;
}
const rawN: any = null;
const rawU: any = undefined;
const rawS: any = 's';

// Variables given untyped values, conditionals and assignments.
let held: string | null | undefined = rawN;
console.log(kind(held), held === null, held === undefined);
held = rawU;
console.log(kind(held));
held = rawS;
console.log(kind(held), held?.length);
held = Math.random() > 2 ? 'x' : rawN;
console.log(kind(held), JSON.stringify({ held }), `${held}`);

// Results, annotated and inferred, read typed and untyped.
function annotated(k: number): string | null | undefined {
  return k === 0 ? null : k === 1 ? undefined : 'a';
}
function inferred(k: number) {
  return k === 0 ? null : k === 1 ? undefined : 'i';
}
const arrow = (k: number) => (k === 0 ? null : k === 1 ? undefined : 'w');
console.log(kind(annotated(0)), kind(annotated(1)), kind(annotated(2)));
console.log(kind(inferred(0)), kind(inferred(1)), kind(inferred(2)));
console.log(kind(arrow(0)), kind(arrow(1)), kind(arrow(2)));
const kept = inferred(0);
console.log(kept === null, kept ?? 'none', inferred(2)?.toUpperCase());
const viaAny: any = annotated(0);
console.log(kind(viaAny), JSON.stringify([annotated(0), annotated(1), annotated(2)]));
class Store {
  read(k: number) {
    return k === 0 ? null : k === 1 ? undefined : 'r';
  }
}
console.log(kind(new Store().read(0)), kind(new Store().read(1)), kind(new Store().read(2)));

// A typed function called by untyped code, and an untyped function held as a typed one.
const g: any = annotated;
const gr = g(0);
console.log(kind(gr), typeof gr, JSON.stringify([g(0), g(1), g(2)]));
const fromScript: any = (k: number) => (k === 0 ? null : k === 1 ? undefined : 'q');
const typed: (k: number) => string | null | undefined = fromScript;
console.log(kind(typed(0)), kind(typed(1)), kind(typed(2)));
interface Source { give(k: number): number | null | undefined }
const untypedSource: any = { give: (k: number) => (k === 0 ? null : k === 1 ? undefined : k) };
const source: Source = untypedSource;
console.log(kind(source.give(0)), kind(source.give(1)), kind(source.give(2)));

// Parameters given untyped values, and a typed callback untyped code calls with its own.
function take(v: string | null | undefined): string {
  return kind(v);
}
console.log(take(rawN), take(rawU), take(rawS));
const t: any = take;
console.log(t(null), t(undefined), t('s'));
function each(cb: (v: number | null | undefined) => string): string {
  return [cb(null), cb(undefined), cb(1)].join(',');
}
const raw: any = (v: any) => `${v === null}/${v === undefined}`;
console.log(each(raw), each((v) => kind(v)));
