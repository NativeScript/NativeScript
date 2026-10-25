// A string literal holding a lone surrogate, which a Swift string cannot: refused at build time.
const half = '\uD83D';
console.log(half.length, JSON.stringify(half));
