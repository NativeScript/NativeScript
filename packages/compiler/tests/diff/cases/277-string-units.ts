// Strings by UTF-16 units across surrogate pairs: slice, substring, charAt, split and replace, including
// a cut through a pair (whose lone surrogate the native runtime holds as U+FFFD).
const s = 'a😀b€c😁';
console.log(s.length, s.slice(1, 3), s.slice(3), s.slice(-2), s.substring(4, 1), s.substr(1, 2), s.charAt(0), s.charAt(4), s.charAt(9));
console.log(s.indexOf('b'), s.indexOf('😁'), s.lastIndexOf('😀'), s.startsWith('😀', 1), s.endsWith('€', 5), s.includes('b€'));
console.log(s.split('').length, JSON.stringify(s.split('b')), JSON.stringify(s.split('😀')), JSON.stringify('x,y,,z'.split(',', 3)), JSON.stringify(''.split(',')));
console.log(s.replace('😀', '[$&]'), s.replace('b', '$`|$\''), 'aaa'.replace('a', 'b'), 'a-b-c'.replaceAll('-', '+'));
const cut = s.slice(1, 2);
console.log(cut.length, cut === s.slice(1, 2), (cut + s.slice(2, 3)).length);
const parts: string[] = [];
for (let i = 0; i < 20; i++) parts.push('é' + i + '😀');
const joined = parts.join('|');
let total = 0;
for (const p of joined.split('|')) total += p.length + p.slice(1, 3).length + p.charAt(1).length;
console.log(joined.length, total, joined.slice(10, 30), joined.toUpperCase().slice(0, 12));
