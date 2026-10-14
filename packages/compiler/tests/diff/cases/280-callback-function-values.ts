// Array callbacks given function declarations by name, one that can throw and one that cannot, through map,
// filter, find, some and reduce over an array made from a Set; a throw from inside reaches the caller's catch.
function parsePositive(text: string): number {
  const n = Number(text);
  if (!(n > 0)) throw new Error('not positive: ' + text);
  return n;
}
function double(n: number): number {
  return n * 2;
}
function isEven(n: number): boolean {
  return n % 2 === 0;
}
function add(a: number, b: number): number {
  return a + b;
}
function keyOf(text: string): number {
  return text.length;
}
const texts = new Set<string>(['3', '10', '7', '10']);
const parsed = Array.from(texts).map(parsePositive);
const doubled = parsed.map(double);
console.log(parsed.join(','), doubled.join(','), doubled.filter(isEven).length, doubled.some(isEven), doubled.find(isEven), doubled.reduce(add, 0), doubled.reduce(add));
console.log(Array.from(texts).map(keyOf).join(','), [...texts].map(parsePositive).length);
try {
  console.log(Array.from(new Set<string>(['1', 'x'])).map(parsePositive).join(','));
} catch (e) {
  console.log('caught', (e as Error).message);
}
