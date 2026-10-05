// A replacer held as a function value, null kept apart from undefined in untyped objects,
// an array shared through an untyped variable, and match arrays destructured.

function decode(_: string, escaped: string, space?: string): string {
  const code = Number.parseInt(escaped, 16);
  return code !== code || space ? escaped : String.fromCharCode(code);
}
const escapes = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
console.log('a\\31 b\\:c\\ d'.replace(escapes, decode));
const tag = (m: string, word: string, at: number) => `<${word}@${at}>`;
console.log('one two'.replace(/(\w+)/g, tag));

const tokens: any[] = [];
const pick = (x: number): string | null => (x > 0 ? 'positive' : null);
tokens.push({ kind: 'a', value: null, label: pick(1), flag: true ? null : 'x' });
console.log(JSON.stringify(tokens), tokens[0].value === null, tokens[0].flag === null);

function fill(into: string[][], word: string): void {
  into.push([word]);
}
type Data = string[][] | string | null;
let data: Data = null;
data = [];
fill(data, 'x');
fill(data, 'y');
console.log(JSON.stringify(data));

const found = 'key=value'.match(/^(\w+)=(\w+)$/);
if (found) {
  const [whole, key, value] = found;
  console.log(whole, key, value);
}
