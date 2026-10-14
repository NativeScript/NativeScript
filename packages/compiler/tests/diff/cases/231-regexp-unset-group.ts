// A capture group that did not take part in the match reads as undefined, whatever its declared type.
const m = /(a)|(b)/.exec('b')!;
console.log(m[1] === undefined, m[2] === undefined, m[1] ?? 'none', m[1] || 'empty', `${m[1]}`, typeof m[1]);
if (!m[1]) console.log('first group unset');
const all = 'x=1;y'.match(/(\w)=?(\d)?/)!;
console.log(all[2] === undefined, all[2] !== undefined ? 'set' : 'unset');
