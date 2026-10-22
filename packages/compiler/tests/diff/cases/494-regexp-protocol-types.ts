// A RegExp typed as the string methods' overloads type their pattern (`{ [Symbol.replace](…) }`), held and chosen in a `? :` against a regexp literal.
type Replacer = { [Symbol.replace](string: string, replaceValue: string): string };
type Splitter = { [Symbol.split](string: string, limit?: number): string[] };
type Searcher = { [Symbol.search](string: string): number };
const never = Math.random() > 2;
function given(): any { return /o/g; }
const held: Replacer = /\d/g;
console.log('a1b2'.replace(held, '#'), 'foo'.replace(never ? /x/ : (given() as Replacer), '0'), 'foo'.replace(!never ? (given() as Replacer) : /x/, '0'));
console.log('a-b-c'.split(never ? (given() as Splitter) : /-/), 'aXa'.search(never ? /a/ : (/X/ as Searcher)));
