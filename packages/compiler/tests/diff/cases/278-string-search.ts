// String searches by UTF-16 units over ASCII and non-ASCII text: indexOf, lastIndexOf, includes, startsWith
// and endsWith with positions (negative, NaN, past the end, inside a surrogate pair), charCodeAt and
// codePointAt on both units of a pair, and trim with every kind of whitespace. (includes with a position is
// left out: the translator drops the position.)
const texts: string[] = ['hello world, hello', 'é😀é😀e\u0301x', '', '😀', 'aaaa', 'line\u2028sep\u00a0nbsp\ufefffeff'];
const needles: string[] = ['', 'hello', 'o', 'é', '😀', 'e', '\u0301', 'aa', 'x', 'sep'];
const positions: number[] = [NaN, -3, 0, 1, 2, 3, 4, 5, 100];
const out: string[] = [];
for (const t of texts) {
  for (const n of needles) {
    const row: (number | boolean)[] = [t.indexOf(n), t.lastIndexOf(n), t.includes(n), t.startsWith(n), t.endsWith(n)];
    for (const p of positions) row.push(t.indexOf(n, p), t.lastIndexOf(n, p), t.startsWith(n, p), t.endsWith(n, p));
    out.push(row.map((v) => (v === true ? 'T' : v === false ? 'F' : String(v))).join(''));
  }
  const codes: string[] = [];
  for (let i = -1; i <= t.length; i++) codes.push(t.charCodeAt(i) + '/' + t.codePointAt(i));
  out.push(codes.join(' '));
}
console.log(out.join('\n'));
const spaced = ['  a b  ', '\t\n\v\f\r x \u00a0\u1680\u2000\u200a\u2028\u2029\u202f\u205f\u3000\ufeff', 'none', '   ', '', '\u200b zero-width stays \u200b', ' 😀 ', 'é '];
for (const s of spaced) console.log(JSON.stringify(s.trim()), JSON.stringify(s.trimStart()), JSON.stringify(s.trimEnd()), s.trim().length);
console.log('e\u0301'.includes('e'), 'e\u0301'.indexOf('\u0301'), 'café'.includes('cafe'), 'abc'.charCodeAt(1.9), 'abc'.charCodeAt(-0.5), 'abc'.codePointAt(3), 'abc'.charCodeAt(1e300));
