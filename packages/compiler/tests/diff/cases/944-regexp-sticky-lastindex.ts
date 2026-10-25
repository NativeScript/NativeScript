// lastIndex and the sticky flag: where exec and test start, what they leave, and which methods reset or keep it.
const re = /a/y;
const seen: string[] = [];
for (const at of [0, 1, 2, 3, 9]) {
  re.lastIndex = at;
  seen.push(`${at}:${re.test('aab')}@${re.lastIndex}`);
}
console.log(seen.join(' '));
const g = /\d+/g;
const found: string[] = [];
let m: RegExpExecArray | null;
while ((m = g.exec('1 22 333')) !== null) found.push(`${m[0]}@${g.lastIndex}`);
console.log(found.join(' '), g.lastIndex);
const gy = /\w/gy;
console.log('ab c'.match(gy)!.join(','), 'ab c'.replace(gy, '-'), gy.lastIndex);
const keep = /b/g;
keep.lastIndex = 5;
console.log('abcb'.search(keep), keep.lastIndex, 'abcb'.split(keep).join('|'), keep.lastIndex);
keep.lastIndex = 3;
console.log('abcb'.replace(keep, 'X'), keep.lastIndex);
const sticky = /b/y;
sticky.lastIndex = 1;
console.log('abcb'.replace(sticky, 'X'), sticky.lastIndex, 'abcb'.replace(sticky, 'X'), sticky.lastIndex);
console.log('a-b-c'.split(/-/y).join('|'), '😀😀'.split(/(?:)/u).length, '😀'.split('').length);
const uni = /./gu;
uni.lastIndex = 1;
const u1 = uni.exec('😀x')!;
console.log(u1.index, u1[0] === '😀', uni.lastIndex);
const copy = new RegExp(g);
const flagged = new RegExp(g, 'y');
console.log(copy.lastIndex, copy.flags, flagged.flags, flagged.source, new RegExp('a/b', 'gim').source, String(new RegExp('', 'g')));
const t = /x/g;
console.log(t.test('xx'), t.lastIndex, t.test('xx'), t.lastIndex, t.test('xx'), t.lastIndex);
console.log(/a/gimsuy.flags, /a/d.hasIndices, /a/s.dotAll, /a/.global, /a/y.sticky);
const d = /(?<x>b)(c)?/d.exec('abc')!;
console.log(JSON.stringify(d.indices), JSON.stringify(d.indices!.groups));
let errors = '';
for (const [p, f] of [['a', 'gg'], ['a', 'x'], ['(', ''], ['a{2,1}', ''], ['\\u{110000}', 'u'], ['[\\d-z]', 'u'], ['(?<a>.)\\k<b>', '']]) {
  try { new RegExp(p, f); errors += 'ok|'; } catch (e) { errors += (e as Error).name + ': ' + (e as Error).message + '|'; }
}
console.log(errors);
