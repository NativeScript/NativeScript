// Refused: a replacement function for a pattern that may be a string (JavaScript calls it with the match, its index and the string).
const pattern: string | RegExp = 'abc'.length > 9 ? /b/ : 'b';
console.log('abc'.replace(pattern, (m: string) => m.toUpperCase()));
