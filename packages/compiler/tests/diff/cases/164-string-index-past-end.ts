// @kotlin
// `s[i]` past the end of a string is undefined, as JavaScript reads a missing index.
const s = 'abc';
const i = 5;
console.log(s[i], s[i] === undefined, s[i] ?? 'dflt', typeof s[i], s[1], s[-1] === undefined);
let k = 0;
while (s[k] !== undefined) k++;
console.log(k);
let out = '';
for (let j = 0; s[j]; j++) out += s[j];
console.log(out, 'x' + s[9], s[0] + s[7]);
const c = s[3];
console.log(c === undefined, c ?? 'none');
function at(t: string, n: number): string | undefined { return t[n]; }
console.log(at('hi', 1), at('hi', 2));
