// The backtracking semantics of ECMAScript patterns: alternatives in order, greedy and lazy quantifiers, captures
// reset on each iteration, an empty iteration ending a loop, backreferences (unset ones match empty), lookarounds
// (atomic; lookbehind matches right to left), case folding, code points under `u`, sticky and global searches.
function all(source: string, flags: string, input: string): string {
  const re = new RegExp(source, flags);
  const out: string[] = [];
  let guard = 0;
  while (guard++ < 40) {
    const m = re.exec(input);
    if (m === null) break;
    const parts: string[] = [];
    // Read untyped: a group that took no part is undefined, which `string` elements do not say.
    const groups: any = m;
    for (let i = 0; i < m.length; i++) parts.push(groups[i] === undefined ? 'u' : JSON.stringify(groups[i]));
    out.push(m.index + ':' + parts.join(','));
    if (!re.global && !re.sticky) break;
    if (m[0].length === 0) re.lastIndex++;
  }
  return `/${source}/${flags} ${JSON.stringify(input)} => ${out.join(' ')} @${re.lastIndex}`;
}

const cases: string[][] = [
  ['a|ab', '', 'abc'],
  ['((a)|(ab))((c)|(bc))', '', 'abc'],
  ['(a|ab)(c|bcd)(d*)', '', 'abcd'],
  ['(?:(a)|b)+', '', 'ab'],
  ['((a)|b)+', '', 'ab'],
  ['(z)((a+)?(b+)?(c))*', '', 'zaacbbbcac'],
  ['(a*)*', '', 'b'],
  ['(a*)+', '', 'b'],
  ['(a*)*b', '', 'aab'],
  ['(a|)*b', '', 'aab'],
  ['(?:a?)*?b', '', 'aab'],
  ['(a*?)*', '', 'aa'],
  ['(?:)*x', 'g', 'axx'],
  ['(a?)+?b', '', 'aab'],
  ['(?:a|b?)+c', '', 'abc'],
  ['a+?', 'g', 'aaa'],
  ['a{2,3}?', 'g', 'aaaaa'],
  ['(a+?)(b*)', '', 'aabb'],
  ['<.*?>', 'g', '<a><bb>'],
  ['<.*>', 'g', '<a><bb>'],
  ['a{2}', 'g', 'aaaaa'],
  ['a{2,}', 'g', 'aaaaa'],
  ['(ab){2,3}', 'g', 'abababababab'],
  ['(ab){2,3}?', 'g', 'abababababab'],
  ['x{0}y', '', 'xy'],
  ['(a){0}b', '', 'ab'],
  ['(?:a{0,2}b){2}', '', 'aabbab'],
  ['(a)\\1', 'g', 'aaaa'],
  ['\\1(a)', '', 'aa'],
  ['(a)|\\1b', 'g', 'ab b'],
  ['(?:(a)|b)\\1', 'g', 'aa ba b'],
  ['(a*)b\\1', '', 'aabaa'],
  ['(a*)b\\1+', '', 'baaaac'],
  ['(a)\\1', 'i', 'aA'],
  ['(?<x>a)\\k<x>', '', 'xaa'],
  ['(?<x>a)|(?<x>b)', 'g', 'ab'],
  ['a(?=b)', 'g', 'ab ac ab'],
  ['a(?!b)', 'g', 'ab ac ab'],
  ['(?=(a+))a*b\\1', '', 'baaabac'],
  ['(?=(a+))', '', 'baaabac'],
  ['(?!(a))\\1b', '', 'b'],
  ['(?=(a))?', '', 'a'],
  ['(?<=\\$)\\d+(\\.\\d*)?', 'g', 'cost $10.53 and 20'],
  ['(?<!\\$)\\b\\d+', 'g', 'cost $10 and 20'],
  ['(?<=(\\d+)(\\d+))$', '', '1053'],
  ['(?<=(\\d+?)(\\d+))$', '', '1053'],
  ['(?<=(a+))b', '', 'aaab'],
  ['(?<=(a+?))b', '', 'aaab'],
  ['(?<=\\1(a))b', '', 'aab'],
  ['(?<=(a)\\1)b', '', 'aab'],
  ['(?<=a(?=b)b|c)d', 'g', 'abd cd'],
  ['(?<!a{2})b', 'g', 'aab ab b'],
  ['^b', 'gm', 'a\nb\r\nb b'],
  ['a$', 'gm', 'a\na\r\na a'],
  ['$', 'g', 'a\nb'],
  ['^$', 'gm', '\n\r\n'],
  ['\\bab\\b', 'g', 'ab cab ab_ ab'],
  ['\\B.', 'g', 'ab cd'],
  ['\\w+', 'iu', 'ſKk'],
  ['\\bk', 'iu', 'Kk'],
  ['[\\w-]+', 'gi', 'Ab-c dK'],
  ['[a-z]+', 'i', 'ABC'],
  ['\\u212A', 'i', 'k'],
  ['\\u212A', 'iu', 'k'],
  ['σ+', 'gi', 'Σςσ'],
  ['[^a]', 'gi', 'aAb'],
  ['ß', 'i', 'SSẞ'],
  ['.', 'gu', '😀a'],
  ['^.$', '', '😀'],
  ['^.$', 'u', '😀'],
  ['[😀]', 'g', '😀'],
  ['[😀]', 'gu', '😀'],
  ['\\u{1F600}+', 'u', '😀😀'],
  ['\\uD83D', 'u', '😀'],
  ['\\uD83D', '', '😀'],
  ['\\uDE00', 'u', '😀\uDE00'],
  ['[^x]+', 'u', '😀\uD83Dx'],
  ['^.*?(.)$', 'u', 'a😀'],
  ['(.*)(.)', 'u', 'ab😀'],
  ['(.+)😀', 'u', 'ab😀'],
  ['(?<=(.))b', 'u', '😀b'],
  ['(?<=(.+))b', 'u', 'x😀b'],
  ['(?<=(.))b', '', '😀b'],
  ['a', 'y', 'aab'],
  ['a', 'gy', 'aaba'],
  ['b', 'y', 'ab'],
  ['x*', 'g', 'axb'],
  ['a.b', 's', 'a\nb'],
  ['a.b', '', 'a\nb a\u0085b'],
  ['(?i:a)b', 'g', 'ab Ab AB aB'],
  ['(?-i:a)b', 'gi', 'ab Ab AB aB'],
  ['[\\p{L}--[a-z]]+', 'v', 'abCDéf'],
  ['[\\q{abc|d}x]', 'gv', 'abcdx ab'],
  ['\\p{Lu}+', 'u', 'abCDÉf'],
  ['[\\d-x]+', '', '1-x2'],
  ['[a-]+', '', 'a-a'],
  ['\\cJ[\\cJ]', '', '\n\n'],
  ['\\x41\\0', '', 'A\0'],
  ['(?=a)*a', '', 'a'],
  ['\\s+', 'g', ' \t ﻿　x\u0085'],
  ['[\\s\\S]{2}', 'g', 'ab\ncd'],
  ['\\D\\W\\S', 'g', 'a!b !'],
  ['(\\w+)@(\\w+)\\.com', 'g', 'alpha1@beta.com visited x@y.co z@w.com'],
  ['\\d{4}-\\d{2}-\\d{2}', 'g', 'at 2024-01-12T12 and 2024-1-1 and 12024-11-11'],
  ['status 20[0-2]$', '', 'x status 201'],
  ['status 20[0-2]$', '', 'x status 203'],
  ['(?:ab|cd)+|ef', 'g', 'abcdab ef cdx'],
  ['(a)(?:(b)|c)*', '', 'abcb'],
  // A leading run skipped past after a failed attempt, a run given back only where its follower is (or never, when
  // its class excludes it), and the first code units checked before an attempt.
  ['(\\w+)1b', 'g', 'aa1b a1a1b ab1bb'],
  ['[a-c]+c', 'g', 'abcbc ac cc'],
  ['[^@]+@', 'g', 'ab@cd@@e'],
  ['(\\d+)\\1', 'g', '1212 3434 55'],
  ['(\\w+)(?<=a)b', 'g', 'xab yb aab'],
  ['\\w+\\.\\w+', 'gi', 'a.b c. .d e.f.g'],
  ['\\d{2}-\\d', 'g', '12-3 1-2 123-45 99-'],
  ['\\d\\d', 'g', '1'],
  ['(?:\\d)(\\d)x', 'g', '12x 3x 456x'],
  ['(?:(a)|(b))+?c', '', 'abc'],
];
for (const [source, flags, input] of cases) console.log(all(source, flags, input));

const sticky = /a/y;
sticky.lastIndex = 1;
console.log(sticky.test('aab'), sticky.lastIndex, sticky.test('aab'), sticky.lastIndex);
const unicodeStart = /./gu;
unicodeStart.lastIndex = 1;
console.log(JSON.stringify(unicodeStart.exec('😀a')), unicodeStart.lastIndex);
const past = /a/g;
past.lastIndex = 9;
console.log(past.test('aaa'), past.lastIndex);
console.log('abc'.replace(/x*/g, '-'), 'abc'.split(/x*/), '😀😀'.replace(/(?:)/gu, '-').length, '😀'.replace(/(?:)/g, '-').length);
console.log('a1b2c3'.replace(/(\d)/g, '[$1$&$`]'), 'john smith'.replace(/(?<first>\w+)\s(?<last>\w+)/, '$<last>, $<first>'), 'aaa'.replace(/a/gy, 'b'));
console.log('a1b2c3'.split(/(\d)/), 'a1b2c3'.split(/\d/, 2), 'abc'.split(/(?:)/u), 'test'.match(/t/g)!.length, '2024-01-12'.match(/(\d+)-(\d+)/)!.length);
const counts: number[] = [];
for (const m of 'a1 b22 c333'.matchAll(/[a-z](\d+)/g)) counts.push(m[1].length + m.index);
console.log(counts.join(','));
// Long inputs: a loop over a complex body and a single-character loop each take one iteration per character.
const longText = 'ab'.repeat(50000);
console.log(/^(?:a|b)*$/.test(longText), /^(a|b)*c/.test(longText), /^(?:ab)+$/.test(longText), /(?:a|b)*?$/.exec(longText)!.index, /^[ab]*$/.test(longText), longText.replace(/(a)(b)/g, '$2$1').slice(0, 6));
let syntax = '';
for (const bad of ['a**', '(?<n>a)(?<n>b)', '[b-a]', 'a{2,1}', '\\k<x>(?<y>a)', '(?<=a)+', '\\p{Nope}']) {
  try {
    new RegExp(bad, bad.startsWith('\\p') ? 'u' : '');
    syntax += 'ok ';
  } catch (e) {
    syntax += (e as Error).message + ' | ';
  }
}
console.log(syntax);
