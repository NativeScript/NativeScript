// Regular expressions at their edges: empty matches in global replace, match and split, lastIndex across
// exec, test and sticky searches, the u flag over astral characters, substitution patterns and groups,
// one literal evaluated many times, and non-ASCII text around the matches.
console.log('baaac'.replace(/a*/g, '-'), 'abc'.replace(/(?:)/g, '-'), 'abc'.replace(/x*/g, '_'), 'aaa'.replace(/a*?/g, '.'));
console.log(JSON.stringify('baaac'.match(/a*/g)), JSON.stringify('abc'.match(/(?:)/g)), 'abc'.match(/z/g) === null);
console.log(JSON.stringify('a1b2c3'.split(/(\d)/)), JSON.stringify('a1b2c3'.split(/\d/, 2)), JSON.stringify('abc'.split(/(?:)/)), JSON.stringify(''.split(/x/)));

const astral = '😀a😀';
console.log(astral.replace(/(?:)/g, '-').length, astral.replace(/(?:)/gu, '-').length, JSON.stringify(astral.match(/./g)?.length), astral.match(/./gu)?.length);
console.log(astral.replace(/a/g, 'é'), 'é😀é'.replace(/😀/g, '[$&]'), 'ü-ö-ä'.split(/-/).join('|'), 'naïve café'.replace(/\w+/g, (w) => '<' + w + '>'));

const g = /o/g;
const seen: string[] = [];
let m = g.exec('foo boo');
while (m !== null) {
  seen.push(m[0] + '@' + m.index + ':' + g.lastIndex);
  m = g.exec('foo boo');
}
console.log(seen.join(' '), g.lastIndex);
g.lastIndex = 5;
console.log(g.test('foo boo'), g.lastIndex, g.test('foo boo'), g.lastIndex);
g.lastIndex = 3;
console.log('foo boo'.replace(g, '0'), g.lastIndex);

const sticky = /a/y;
sticky.lastIndex = 1;
console.log('bab'.replace(sticky, 'X'), sticky.lastIndex, 'bab'.replace(sticky, 'X'), sticky.lastIndex);
sticky.lastIndex = 0;
console.log(sticky.test('ab'), sticky.lastIndex, sticky.test('ab'), sticky.lastIndex);
console.log(JSON.stringify('aab'.match(/a/gy)), 'baa'.match(/a/gy) === null, 'aaba'.replace(/a/gy, '-'));

const dates = /(?<y>\d{4})-(?<m>\d{2})/g;
console.log('2024-01 and 2025-12'.replace(dates, '$<m>/$<y>'), '2024-01'.replace(dates, '[$&|$`|$\'|$1|$2|$3|$$]'));
console.log('2024-01 and 2025-12'.replace(dates, (all: string, y: string, mo: string, at: number) => `${mo}.${y}@${at}`));
const named = /(?<word>\w+)/.exec('  hello');
console.log(named?.groups?.word, named?.index, named?.[1]);
for (const hit of 'x1y22z333'.matchAll(/\d+/g)) console.log(hit[0], hit.index);

let count = 0;
for (let i = 0; i < 300; i++) if (/^line \d+$/.test('line ' + i)) count++;
console.log(count, 'Line 7'.search(/\d/), 'abc'.search(/z/));
console.log(/^b$/m.test('a\nb\nc'), /^b$/.test('a\nb\nc'), 'A b C'.replace(/[a-c]/gi, '*'), /a.c/s.test('a\nc'), /a.c/.test('a\nc'));
