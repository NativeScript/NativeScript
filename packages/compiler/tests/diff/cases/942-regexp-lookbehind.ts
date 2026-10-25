// Lookbehind reads right to left: greedy groups inside it take what is nearest, backreferences come before their group.
const show = (m: RegExpExecArray | null) => (m === null ? 'null' : `${m.index}:${[...m].map((v) => (v === undefined ? 'u' : v)).join(',')}`);
console.log(show(/(?<=\$)\d+(?:\.\d+)?/.exec('cost $10.53')));
console.log(show(/(?<!\$)\b\d+/.exec('cost $10 and 20')));
console.log(show(/(?<=(\d+)(\d+))$/.exec('1053')));
console.log(show(/(?<=(\d+?)(\d+))$/.exec('1053')));
console.log(show(/(?<=\1(a))b/.exec('aab')));
console.log(show(/(?<=(a)\1)b/.exec('aab')));
console.log(show(/(?<=^|,)\w+/.exec('x,yz')));
console.log('price: 10 USD, 20 EUR'.match(/(?<=\d+ )[A-Z]{3}/g)!.join(','));
console.log('a1b2c3'.replace(/(?<=[a-z])\d/g, '#'), 'abc'.replace(/(?<!a)\w/g, '_'));
console.log('one,two;three'.split(/(?<=[,;])/).join('|'));
console.log(show(/(?<=(?<x>\w)(?=\w))y/.exec('xyz')), /(?<=(?<x>\w))y/.exec('xyz')!.groups!.x);
console.log(show(/(?<=a(?:b|bc))d/.exec('abcd')), show(/(?<!ab|cd)e/.exec('abe cde xe')));
console.log(show(/(?<=(.))b/u.exec('😀b')), show(/(?<=\p{Lu})x/u.exec('aBx')));
