// An untyped value a pattern binds to a variable of a declared type (a nested pattern, a destructuring assignment,
// a `for…of` over existing variables), where nothing tests its type, is JavaScript's
// TypeError where it is used as that type; each such value below is then used so. A right-typed one is used as it is.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const data: any = JSON.parse('{"label": 7, "ok": "fine", "k": 4, "inner": {"s": 7, "t": "tee"}, "pair": [1, "two"], "bad": ["one", 2], "list": [{"label": 7}], "fine": [{"label": "x"}], "rows": [["one", 2]], "good": [[3, "four"]]}');

attempt('nested', () => {
  const { inner: { s } }: { inner: { s: string } } = data;
  return s.toUpperCase();
});
attempt('nested ok', () => {
  const { inner: { t } }: { inner: { t: string } } = data;
  return t.toUpperCase();
});
attempt('nested tuple', () => {
  const { bad: [n, t] }: { bad: [number, string] } = data;
  return n.toFixed(1) + t.toUpperCase();
});
attempt('nested tuple ok', () => {
  const { pair: [n, t] }: { pair: [number, string] } = data;
  return n.toFixed(1) + t.toUpperCase();
});
attempt('assign', () => {
  let s = '';
  ({ label: s } = data);
  return s.toUpperCase();
});
attempt('assign ok', () => {
  let s = '';
  let k = 0;
  ({ ok: s, k } = data);
  return s.toUpperCase() + k.toFixed(1);
});
attempt('assign tuple', () => {
  let n = 0;
  let s = '';
  [n, s] = data.bad;
  return n.toFixed(1) + s.toUpperCase();
});
attempt('assign tuple ok', () => {
  let n = 0;
  let s = '';
  [n, s] = data.pair;
  return n.toFixed(1) + s.toUpperCase();
});
attempt('for of', () => {
  let s = '';
  const seen: string[] = [];
  for ({ label: s } of data.list) seen.push(s.toUpperCase());
  return seen.join();
});
attempt('for of ok', () => {
  let s = '';
  const seen: string[] = [];
  for ({ label: s } of data.fine) seen.push(s.toUpperCase());
  return seen.join();
});
attempt('for of tuple', () => {
  let n = 0;
  let s = '';
  const seen: string[] = [];
  for ([n, s] of data.rows) seen.push(n.toFixed(1) + s.toUpperCase());
  return seen.join();
});
attempt('for of tuple ok', () => {
  let n = 0;
  let s = '';
  const seen: string[] = [];
  for ([n, s] of data.good) seen.push(n.toFixed(1) + s.toUpperCase());
  return seen.join();
});
