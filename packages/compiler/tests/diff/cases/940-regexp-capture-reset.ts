// A capture inside a quantified group is reset on each iteration: after the loop it holds the last iteration's
// text, or undefined when the last iteration did not reach it.
const show = (v: unknown) => (v === undefined ? 'u' : JSON.stringify(v));
const row = (m: RegExpExecArray | RegExpMatchArray | null) => {
  if (m === null) return 'null';
  const parts: string[] = [];
  const held: any = m;
  for (let i = 0; i < m.length; i++) parts.push(show(held[i]));
  return `${m.index}:${parts.join(',')}`;
};
console.log(row(/(?:(a)|(b))+/.exec('ab')));
console.log(row(/(?:(a)|(b))+/.exec('ba')));
console.log(row(/(z)((a+)?(b+)?(c))*/.exec('zaacbbbcac')));
console.log(row('xyx'.match(/(?:(x)|(y))*/)));
console.log(row(/((a)|(b)|(c))+$/.exec('abcab')));
console.log(row(/(?:(\d)-|(\w))+/.exec('1-a2-b')));
console.log(row(/^(?:(a)|b)*$/.exec('aab')));
console.log(row(/(a)?(?:b(c)?)+/.exec('abcb')));
const callback: string[] = [];
'abcab'.replace(/(?:(a)|(b)|(c))+/, (m: string, a?: string, b?: string, c?: string) => {
  callback.push([m, a, b, c].map(show).join('|'));
  return '';
});
console.log(callback.join(' '));
console.log('ab ba'.replace(/(?:(a)|(b))+/g, '[$1/$2]'));
for (const m of 'ab-ba-aa'.matchAll(/(?:(a)|(b))+/g)) console.log(row(m));
const fromAny: any = /(?:(a)|(b))+/.exec('ab');
console.log(show(fromAny[1]), show(fromAny[2]), fromAny.length, typeof fromAny[1]);
const [whole, first, second] = /(?:(a)|(b))+/.exec('ab')!;
console.log(show(whole), show(first), show(second));
