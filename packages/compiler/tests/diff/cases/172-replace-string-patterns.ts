// Replacing a string pattern expands `$$`, `$&`, `` $` `` and `$'` in the replacement; `$1` stays as written.
console.log('a-b'.replace('-', '$&$&'), 'a-b'.replace('-', '$$'), 'a-b'.replace('-', '[$`|$\']'), 'a-b'.replace('-', '$1$'));
console.log('a-b-c'.replaceAll('-', '<$&>'), 'abc'.replaceAll('', '.'), 'x.y.z'.replaceAll('.', '$$'), 'aaa'.replaceAll('aa', 'b'));
console.log('x👋y'.replace('👋', '[$&]'), 'cost: 5'.replace('5', '$$5'), 'none'.replace('z', '$&'));
