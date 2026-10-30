// An untyped value in a variable declared with a type (its initializer, an assignment, a destructuring pattern's
// type), where nothing tests its type, is JavaScript's TypeError where it is placed; each such value below is then used
// as its declared type, which throws in JavaScript too. One whose type is tested is held as it is. A call of a function
// whose result may be undefined is read as that result.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const data: any = JSON.parse('{"label": 7, "size": "big", "ok": "fine", "k": 4, "on": true, "pair": [1, "two"], "bad": ["one", 2]}');
const top: string = data.ok;
let count: number = data.k;
const missing: string = data.nothing;

function title(raw: any): string {
  return raw;
}
function amount(raw: any): number {
  return raw;
}
function reset(n: number, raw: any) {
  n = raw;
  return n.toFixed(1);
}

attempt('top', () => top.toUpperCase() + count.toFixed(1));
attempt('missing', () => (missing === undefined ? 'missing' : missing));
attempt('module assign', () => {
  count = data.size;
  return count.toFixed(1);
});
attempt('local', () => {
  const s: string = data.label;
  return s.toUpperCase();
});
attempt('local ok', () => {
  const s: string = data.ok;
  const on: boolean = data.on;
  return on ? s.toUpperCase() : s;
});
attempt('let', () => {
  let n: number = data.size;
  return n.toFixed(1);
});
attempt('assign', () => {
  let n = 0;
  n = data.size;
  return n.toFixed(1);
});
attempt('element', () => {
  const xs: any[] = data.bad;
  const s: string = xs[1];
  return s.toUpperCase();
});
attempt('element ok', () => {
  const xs: any[] = data.bad;
  const s: string = xs[0];
  return s.toUpperCase();
});
attempt('parameter', () => reset(1, data.ok));
attempt('parameter ok', () => reset(1, data.k));
attempt('tested', () => {
  const s: string = data.label;
  return typeof s === 'string' ? s.toUpperCase() : `not ${typeof s}`;
});
attempt('destructure', () => {
  const { ok, label }: { ok: string; label: string } = data;
  return ok.toUpperCase() + label.toUpperCase();
});
attempt('destructure ok', () => {
  const { ok, k }: { ok: string; k: number } = data;
  return ok.toUpperCase() + k.toFixed(1);
});
attempt('destructure tested', () => {
  const { label }: { label: string } = data;
  return typeof label === 'string' ? label.toUpperCase() : `not ${typeof label}`;
});
attempt('tuple', () => {
  const [a, b]: [number, string] = data.bad;
  return a.toFixed(1) + b.toUpperCase();
});
attempt('tuple ok', () => {
  const [a, b]: [number, string] = data.pair;
  return a.toFixed(1) + b.toUpperCase();
});
attempt('call read', () => title(data.ok).toUpperCase());
attempt('call read bad', () => title(data.label).toUpperCase());
attempt('call length', () => title(data.ok).length);
attempt('call number', () => amount(data.k).toFixed(1));
attempt('call number bad', () => amount(data.size).toFixed(1));
