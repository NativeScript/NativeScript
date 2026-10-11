// @kotlin
// A string literal holding a lone surrogate (`'\uD83D'`): that code unit, which joins its other half into the character.
const high = '\uD83D', low = '\uDC4B';
console.log(high.length, high.charCodeAt(0).toString(16), low.charCodeAt(0).toString(16), high + low === '👋', '👋a'.startsWith(high));
console.log(JSON.stringify(high), JSON.stringify('a' + low), `${high}${low}`.codePointAt(0)!.toString(16));
