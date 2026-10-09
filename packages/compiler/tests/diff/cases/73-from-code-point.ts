// Code points beyond the BMP are surrogate pairs; a lone surrogate is kept; a fraction, a negative or a value past
// U+10FFFF is a RangeError.
const s = String.fromCodePoint(0x1f3b8, 65, 0x20ac, 0xd800);
console.log(s.length, s.charCodeAt(0), s.charCodeAt(1), s.codePointAt(0), s.slice(2, 4));
function point(x: number): string {
  try {
    return String.fromCodePoint(x);
  } catch (e) {
    return (e as Error).name;
  }
}
console.log(point(1.5), point(-1), point(0x110000), point(Number.NaN), point(0x10ffff).length, String.fromCodePoint());
