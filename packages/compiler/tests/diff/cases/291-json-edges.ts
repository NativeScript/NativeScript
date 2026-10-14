// JSON as V8 reads and writes it: numbers (the exact short-decimal reading and the rest), strings with escapes and
// lone surrogates, repeated property names, indentation, replacers, toJSON, values left out, a cycle's message.
const numbers = ['0', '-0', '1', '-1', '0.1', '0.5', '123.45', '-0.000001', '0.0000001', '1e21', '1E2', '1e-7', '2.5e+3', '9007199254740993',
  '123456789012345', '1234567890123456', '12345678901234567', '0.1234567890123456789', '1.7976931348623157e308', '5e-324', '4.35', '2.675',
  '1.005', '0.30000000000000004', '100', '1000000000000000000000', '999999999999999.9', '0.000123'];
for (const text of numbers) {
  const n: number = JSON.parse(text);
  console.log(text, n, 1 / n, JSON.stringify(n), JSON.stringify([n, -n]));
}
console.log(JSON.stringify([0.1 + 0.2, 1 / 3, -1 / 3, 2 ** 53, 2 ** 53 + 2, -(2 ** 60), 1e-6, 1e-7, 1e21, 1e20, NaN, -Infinity, -0, 5e-324, 123.456e10]));
const strings = '["plain", "a\\"b", "tab\\there", "\\u00e9\\u2028\\ud83d\\ude00", "\\ud83d", "x\\u0001y", "\\/", "", "\\\\"]';
const parsed: string[] = JSON.parse(strings);
console.log(parsed.length, JSON.stringify(parsed), JSON.stringify('😀 \uD83D \uDE00 \u0000 \u001f \u007f  '));
const repeated: any = JSON.parse('[{"id":1,"name":"a"},{"name":"b","id":2},{"id":3,"id":4},{"2":"x","1":"y","b":0,"a":1}]');
console.log(JSON.stringify(repeated), Object.keys(repeated[3]).join(','));
const nested = { a: [1, { b: [] }, [], {}], c: { d: { e: 'f' } }, g: [[[]]] };
console.log(JSON.stringify(nested, null, 2));
console.log(JSON.stringify(nested, null, '--'), JSON.stringify([], null, 2), JSON.stringify({}, null, 2), JSON.stringify([undefined, () => 1], null, 1));
const skipped: any = { u: undefined, f: () => 1, n: null, s: 'x', arr: [undefined, () => 2, null] };
console.log(JSON.stringify(skipped), JSON.stringify(skipped, null, 2));
console.log(JSON.stringify({ a: 1, b: 2, c: { a: 3, z: 4 } }, ['a', 'c', 'a', 'missing']), JSON.stringify([{ a: 1, b: 2 }], ['b']));
console.log(JSON.stringify({ a: 1, b: [1, 2], c: 's' }, (k: string, v: any) => (typeof v === 'number' ? v * 10 : v)));
class Money {
  constructor(public cents: number) {}
  toJSON(key: string) {
    return `${key}:${this.cents / 100}`;
  }
}
console.log(JSON.stringify({ price: new Money(1250), list: [new Money(5)] }), JSON.stringify(new Date(Date.UTC(2020, 0, 2))));
const cyclic: any = { name: 'root', child: { list: [1] } };
cyclic.child.list.push(cyclic);
try {
  JSON.stringify(cyclic);
} catch (e) {
  console.log((e as Error).message);
}
const deep = '['.repeat(5000) + ']'.repeat(5000);
console.log((JSON.parse(deep) as unknown[]).length, JSON.stringify(JSON.parse(deep)).length);
for (const bad of ['{"a":1,}', '[1,]', '01', '1.', '-', '"\\x"', '{a:1}', '"a', '[1 2]', '1e', 'tru', '"\t"']) {
  try {
    JSON.parse(bad);
    console.log('parsed', bad);
  } catch (e) {
    console.log((e as Error).message);
  }
}
