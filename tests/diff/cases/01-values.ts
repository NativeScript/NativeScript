// Numbers, strings and the conversions between them.
const values = [0, -0, 1, -1.5, 0.1 + 0.2, 1e21, 1e-7, 123456789012345680000, 5e-324, 2 ** 53, 1 / 3, 100, 1.005, NaN, Infinity, -Infinity];
for (const v of values) console.log(String(v), `${v}`, v.toFixed(2), v + '');
console.log((1234.5678).toFixed(1), (0.000001234).toPrecision(2), (255).toString(16), (255).toString(2));
console.log(Number('  12 '), Number(''), Number('0x10'), Number('1e3'), Number('abc'), parseInt('42px'), parseFloat('3.14abc'), parseInt('ff', 16));
console.log(7 % 3, -7 % 3, 7.5 % 2, 2 ** 10, Math.round(2.5), Math.round(-2.5), Math.max(1, 3, 2), Math.min(), Math.trunc(-4.7), Math.sign(-3));
console.log(5 | 0, 7 & 3, 1 << 31, -1 >>> 0, ~5, 6 ^ 3, -16 >> 2);

const s = 'Hello, wörld 👋';
console.log(s.length, s.toUpperCase(), s.slice(-3), s.substring(5, 2), s.indexOf('o'), s.lastIndexOf('o'), s.charAt(1), s.charCodeAt(1));
console.log(s.split(', '), 'a,b,,c'.split(','), 'abc'.split(''), s.includes('wör'), s.startsWith('Hell'), s.endsWith('👋'));
console.log('  pad '.trim() + '|', 'x'.padStart(4, 'ab'), 'x'.padEnd(3, '-'), 'ab'.repeat(3), 'a-b-c'.replace('-', '+'), 'a-b-c'.replaceAll('-', '+'));
console.log('b' < 'a', 'apple' < 'banana', 'Z' < 'a', [...'héllo'].length);

let count = 0;
count++;
count += 2;
const before = count++;
console.log(count, before, ++count, count--, count);
console.log(typeof 1, typeof 'x', typeof true, typeof undefined, typeof {}, typeof (() => 1));
const none: string | null = values.length > 100 ? 'x' : null;
const zero = values.length - values.length;
console.log(zero < 1 && 'yes', zero || 'fallback', none ?? 'nullish', String(zero).slice(1) || zero, values.length && 2);
