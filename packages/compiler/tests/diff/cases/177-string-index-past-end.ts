// @swift
// `s[i]` past the end of a string (or at a negative or fractional index) is undefined, though TypeScript types it `string`.
const s = 'abc';
console.log(s[5], s[5] === undefined, s[1] === undefined, s[-1] ?? 'none', s[1.5] ?? 'none', s[2] ?? 'none', `${s[3]}`, 'x' + s[4]);
let i = 0, n = 0;
while (s[i] !== undefined) { n++; i++; }
const last = s[s.length];
console.log(n, last === undefined, s[0] ? 'first' : 'empty', s[9] ? 'ninth' : 'none', s[1].toUpperCase());
