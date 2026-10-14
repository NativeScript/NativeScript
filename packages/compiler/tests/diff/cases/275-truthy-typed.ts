// Truthiness of typed numbers, strings and booleans: NaN, -0 and 0, the empty string, "0" and "false".
const numbers: number[] = [0, -0, NaN, 1, -1, 0.5, Infinity];
const strings: string[] = ['', '0', 'false', ' ', 'a'];
const flags: boolean[] = [true, false];
const out: string[] = [];
for (const n of numbers) {
  const fallback = n || 'fallback';
  const both = n && 'both';
  out.push(`${n}:${!n}:${fallback}:${both}:${n ? 'yes' : 'no'}`);
}
for (const s of strings) {
  const fallback = s || 'fallback';
  const both = s && 'both';
  out.push(`[${s}]:${!s}:${fallback}:${both}:${s ? 'yes' : 'no'}`);
}
for (const b of flags) out.push(`${b}:${!b}:${b || 'fallback'}:${b && 'both'}:${b ? 'yes' : 'no'}`);
let acc = 0;
for (let i = -2; i <= 2; i++) acc += (i * 0.5 || 10) + (i - i || 1);
console.log(out.join(' '), acc, [3, 0, NaN, 2].filter((x) => x).length, ['', 'a', '0'].filter((x) => x).join(','));
