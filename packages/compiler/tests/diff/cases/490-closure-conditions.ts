// @app-lenient
// Conditions whose Swift is a closure called in place: a constant tuple's `includes` in `if`, `while`,
// `do … while`, `else if` and `? :`.
const SIZES = ['small', 'medium', 'large'] as const;
type Size = (typeof SIZES)[number];

function describe(name: string): string {
  if (SIZES.includes(name as Size)) return `${name}: a size`;
  else if (name.length > 4 && SIZES.includes(name.slice(0, 5) as Size)) return `${name}: starts with a size`;
  return `${name}: other`;
}

const picked: Record<string, string[]> = {};
for (const [key, values] of Object.entries({ small: ['a'], huge: ['b'], large: ['c', 'd'] })) {
  if (SIZES.includes(key as Size)) picked[key] = values;
}

let n = 0;
const names = ['small', 'medium', 'tiny', 'large'];
while (SIZES.includes(names[n] as Size)) n++;
let m = 0;
do m++;
while (m < names.length && SIZES.includes(names[m] as Size));

console.log(describe('small'), describe('larger'), describe('tiny'));
console.log(JSON.stringify(picked), n, m);
console.log(SIZES.includes('medium' as Size) ? 'yes' : 'no', SIZES.includes('x' as Size) ? 'yes' : 'no');
