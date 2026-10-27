// RegExp called and constructed with a pattern of untyped static type that is a RegExp at run time.
const pick = Math.random() > 2;
const other: any = 'x';
const word = RegExp(pick ? other : /(\w+)/, 'g');
console.log(word.source, word.flags, 'one two'.replace(word, '<$1>'));
const copy = new RegExp(pick ? other : /a(b)/i);
console.log(copy.source, copy.flags, String(copy));
const held: any = /x\/y/m;
console.log(RegExp(held) === held, new RegExp(held) === held, RegExp(held, 'g') === held, String(RegExp(held, undefined)));
console.log(String(new RegExp(held, 'i')), String(RegExp(pick ? other : undefined)), String(new RegExp(pick ? other : null)));
