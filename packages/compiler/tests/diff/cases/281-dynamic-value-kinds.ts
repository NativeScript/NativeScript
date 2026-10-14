// Untyped values of each kind through String(), Number(), truthiness, + and member reads: Swift strings,
// numbers and booleans, and on the native side Foundation's NSString and NSNumber, which read as the string
// and number they bridge to.
const native = typeof NSString !== 'undefined';
const values: any[] = [
  'text', '', '0', '12.5', 0, -0, NaN, 3, 2.5, true, false, null, undefined,
  native ? NSString.stringWithString('ns text') : 'ns text',
  native ? NSString.stringWithString('') : '',
  native ? NSNumber.numberWithDouble(2.5) : 2.5,
  native ? NSNumber.numberWithInt(7) : 7,
];
for (const v of values) {
  const parts: any[] = [String(v), Number(v), !!v, v ? 'T' : 'F', v + 1, v + 'x', 1 + v, 'x' + v];
  if (typeof v === 'string') parts.push(v.length, v[0], v[100], v.toUpperCase());
  if (typeof v === 'number') parts.push(v.toFixed(1));
  console.log(parts.map((p) => String(p)).join(' | '));
}
const a: any = 2, b: any = '3', c: any = true, d: any = 4.5;
console.log(a + b, b + a, a + c, c + c, a + d, d + b, a + a, b + b);
