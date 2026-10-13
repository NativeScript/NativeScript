// A RegExp made from an empty pattern matches the empty string, and its source is "(?:)".
const empty = new RegExp('');
console.log(empty.source, empty.test('x'), 'ab'.split(empty), 'ab'.replace(new RegExp('', 'g'), '-'));
