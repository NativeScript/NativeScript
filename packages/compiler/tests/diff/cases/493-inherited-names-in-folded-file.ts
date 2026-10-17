// Members named like what every object inherits (`toString`, `valueOf`), in a file platform folding reads (a literal compared with a literal).
type Printable = { toString(): string; valueOf(): number };
const both = { toString() { return 'str'; }, valueOf() { return 42; } };
const shown: Printable = both;
const release = 'release' === 'debug' ? 'debug' : 'release';
console.log(`${shown}`, +shown, String(both), release);
