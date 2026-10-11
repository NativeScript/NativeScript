// JavaScript's `\d \w \s \b . ^ $` in a RegExp: ASCII digits and word characters, `.` and `[^…]` one UTF-16 unit
// without the `u` flag, `$` only at the end of the input, and a search from `lastIndex` that sees the text before it.
console.log(/^\d+$/.test('١٢٣'), /^\w+$/.test('héllo'), /\bé/.test(' é'), /é\b/.test('é '), /\Bé/.test('aé'));
console.log(/^.$/.test('👋'), '👋'.match(/./g)!.length, /^.$/u.test('👋'), '👋'.match(/./gu)!.length, /^..$/.test('👋'));
console.log('a1٣b'.replace(/\D/g, '_'), 'a é_'.replace(/\W/g, '#'), 'x1 y'.split(/[\d\s]/), /[^\w]/.test('é'), /[\W]/.test('a'));
console.log(/^a$/.test('a\n'), /^\d+$/.test('12\n'), 'a\nb'.replace(/^/gm, '> '), 'aa'.replace(/^a/g, 'x'), /\s/.test('﻿'), /./.test('\v'));
console.log('ab cd'.replace(/\b/g, '|'), 'abc'.replace(/\B/g, '-'), 'one two'.replace(/\b\w/g, (c) => c.toUpperCase()), /[\b]/.test('\b'), /a\0b/.test('a\0b'));
console.log('x👋y'.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '?'), /\u{1F44B}/u.test('👋'), /^[^a]{2}$/.test('👋'), '👋'.replace(/[👋]/g, '-'), /[a&&b]/.test('&'), /[+--]/.test(','));
const words = /\b\w+\b/g;
const found: string[] = [];
let m: RegExpExecArray | null;
while ((m = words.exec('café au lait'))) found.push(m[0] + '@' + m.index);
console.log(found.join(' '), '2024-05-06'.split(/\D/), 'A1 b2'.match(/\w\d/gi)!.join(' '));
