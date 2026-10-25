// Callbacks, function types and overriding methods whose slots may hold null and undefined both keep them apart.
function show(label: string, x: unknown) {
  console.log(label, x === null, x === undefined, typeof x, JSON.stringify({ x }), `${x}`);
}
type Probe = (v: string | null | undefined) => string;
const probe: Probe = (v) => `${v === null}/${v === undefined}/${v ?? 'none'}`;
console.log(probe(null), probe(undefined), probe('s'));
function run(cb: (v: number | null | undefined, k: number) => void) {
  cb(null, 0);
  cb(undefined, 1);
  cb(2, 2);
}
run((v, k) => show(`run ${k}`, v));
function named(v: number | null | undefined, k: number) {
  show(`named ${k}`, v);
}
run(named);
const pick = (k: number): string | null | undefined => (k === 0 ? null : k === 1 ? undefined : 'p');
const picker: (k: number) => string | null | undefined = pick;
show('pick 0', picker(0));
show('pick 1', picker(1));
interface Handler { take(v: boolean | null | undefined): string; give(): number | null | undefined }
const h: Handler = {
  take(v) { return String(v === null) + String(v === undefined); },
  give() { return null; },
};
console.log(h.take(null), h.take(undefined), h.take(true));
show('give', h.give());

class Base {
  describe(v: string | null | undefined): string {
    return `base ${v === null} ${v === undefined}`;
  }
  value(): string | null | undefined {
    return undefined;
  }
}
class Derived extends Base {
  describe(v: string | null | undefined): string {
    return `derived ${v === null} ${v === undefined} ${super.describe(v)}`;
  }
  value(): string | null | undefined {
    return null;
  }
}
const all: Base[] = [new Base(), new Derived()];
for (const b of all) {
  console.log(b.describe(null), '|', b.describe(undefined), '|', b.describe('x'));
  show('value', b.value());
}
const later: { fn?: (v: string | null | undefined) => void } = {};
later.fn = (v) => show('later', v);
later.fn(null);
later.fn(undefined);

// A library object cached with null for "none", told apart from a missing entry.
const cache = new Map<string, Date | null>();
let made = 0;
function lookup(k: string): Date | null {
  let d = cache.get(k);
  if (d === undefined) {
    made++;
    d = k === 'none' ? null : new Date(0);
    cache.set(k, d);
  }
  return d;
}
lookup('none');
lookup('none');
lookup('a');
lookup('a');
console.log(made, lookup('none') === null, lookup('a')?.getTime(), cache.size);
