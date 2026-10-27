// A replace callback chosen by a conditional: one branch an untyped value asserted to the callback's type, or both
// functions of different arities.
const pick = Math.random() > 2;
const other: any = () => '?';
type Replacer = (substring: string, ...args: any[]) => string;
console.log('abaab'.replace(/a(b)?/g, pick ? (other as Replacer) : (m, g) => `<${g}>`));
console.log('naïve café'.replace(/\w+/g, pick ? (other as Replacer) : (w) => '<' + w + '>'));
console.log('x1y'.replace(/(\d)|(z)/, pick ? (other as any as Replacer) : (m, d, z) => `${d}:${z === undefined}`));
console.log('2024-01'.replace(/(\d+)-(\d+)/, !pick ? (other as Replacer) : (m: string, y: string) => y));
const upper = (m: string) => m.toUpperCase();
const tagged = (m: string, g: string | undefined, at: number) => `${g ?? '-'}@${at}`;
console.log('abc'.replace(/(b)/, pick ? upper : tagged), 'abc'.replace(/(b)/, !pick ? upper : tagged));
