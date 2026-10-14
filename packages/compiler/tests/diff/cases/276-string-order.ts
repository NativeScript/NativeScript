// Strings compare by UTF-16 code units: an astral character (two surrogates, D800–DFFF) sorts before
// U+E000–U+FFFF, though its code point is greater; ASCII, the empty string and prefixes around them.
const words: string[] = ['😀', 'Ａ', '｡', '', '￿', 'a', 'B', '', 'ab', 'a😀', 'aＡ', '😀a', '😁', 'é', 'é', 'z', ' ', '퟿'];
console.log(JSON.stringify(words.slice().sort()));
console.log(JSON.stringify(words.slice().sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))));
const pairs: string[] = [];
for (const x of words) for (const y of words) if (x < y) pairs.push(words.indexOf(x) + '<' + words.indexOf(y));
console.log(pairs.length, pairs.slice(0, 60).join(' '));
let flags = '';
for (const [x, y] of [['😀', 'Ａ'], ['Ａ', '😀'], ['a', 'a😀'], ['', 'a'], ['a', ''], ['', '😀'], ['😀', '😁'], ['ab', 'a']]) {
  flags += (x < y ? 'L' : '-') + (x > y ? 'G' : '-') + (x <= y ? 'l' : '-') + (x >= y ? 'g' : '-') + ' ';
}
console.log(flags, 'a'.localeCompare('b'), 'b'.localeCompare('a'), 'a'.localeCompare('a'));
