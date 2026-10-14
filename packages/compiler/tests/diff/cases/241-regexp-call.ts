// @lenient-both
// RegExp called without new, and a match indexed without a non-null assertion, as a non-strict app writes it.
const range = RegExp('(\\d+)-(\\d+)');
const pair = range.exec('pages 10-20');
console.log(pair[1], pair[2], pair.index);
const word = RegExp(/(\w+)/, 'g');
console.log(word.flags, 'one two'.replace(word, '<$1>'));
const head = 'v1.2.3'.match(/v(\d+)/)[1];
console.log(head, Number(head) + 1);
const missing = /z/.exec('abc');
console.log(missing === null, String(RegExp('a|b')));
function first(text: string) {
  return /^(\w)/.exec(text)[1];
}
console.log(first('kotlin'));
try {
  console.log(/z/.exec('abc')[0]);
} catch (e) {
  console.log(e instanceof TypeError, (e as Error).message);
}
try {
  console.log('abc'.match(/z/).index);
} catch (e) {
  console.log(e instanceof TypeError, (e as Error).message);
}
console.log(/b/.exec('abc').index, RegExp(word) === word);
