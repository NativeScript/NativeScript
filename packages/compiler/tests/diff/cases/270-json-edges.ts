// JSON.parse and JSON.stringify at their edges: key order, escapes and surrogates, number forms both ways,
// indentation, undefined members, holes, toJSON and replacers, cycles, and V8's syntax errors.
const keysOf = (text: string): string => Object.keys(JSON.parse(text)).join(',');
console.log(keysOf('{"b":1,"a":2,"b":3}'), JSON.parse('{"b":1,"a":2,"b":3}').b);
console.log(keysOf('{"2":0,"1":0,"a":0,"0":0,"-1":0,"01":0,"4294967295":0,"4294967294":0}'));
console.log(JSON.stringify(JSON.parse('{"x":{"2":"b","1":"a"},"__proto__":5}')));

const strings = ['"plain"', '"tab\\there"', '"\\u00e9\\u0041\\/"', '"\\ud83d\\ude00"', '"\\uD83D\\uDE00\\u0021"', '"é – 😀"', '"\\"\\\\\\b\\f\\n\\r"'];
for (const s of strings) {
  const v: string = JSON.parse(s);
  console.log(JSON.stringify(v), v.length);
}
console.log(JSON.stringify('\u0001\u001f\u007f quote" back\\  '));

const numbers = ['0', '-0', '1', '-1.5', '0.1', '123.45', '1e3', '1E-3', '2.5e+10', '9007199254740993', '123456789012345678901234567890', '1e400', '-1e400', '0.000001', '1e-7', '5e-324', '1.7976931348623157e308', '0.30000000000000004', '12345678.123456789', '100.10', '0e10'];
for (const n of numbers) {
  const v: number = JSON.parse(n);
  console.log(n, Object.is(v, -0) ? '-0' : String(v), JSON.stringify(v));
}
const doubles: number[] = [0.1 + 0.2, 1 / 3, -2 / 3, 1e21, 1e-6, 1.5e-7, 123456789.125, 999999999.999, 1e9 + 0.5, 0.001, 0.0015, -0.007, 4.35, 2 ** 53, -(2 ** 53) - 2, 1.005, 255.255];
console.log(JSON.stringify(doubles));
let seed = 7;
const random: number[] = [];
for (let i = 0; i < 200; i++) {
  seed = (seed * 48271) % 2147483647;
  random.push(i % 3 === 0 ? seed / 2147483647 : i % 3 === 1 ? Math.floor(seed / 1000) / 100 : seed / 7);
}
const text = JSON.stringify(random);
console.log(text.length, text.slice(0, 120), JSON.stringify(JSON.parse(text)) === text);

const nested = { a: [1, { b: [], c: {} }, 'x'], d: { e: null, f: true, g: undefined, h: () => 1 }, i: [undefined, () => 2] };
console.log(JSON.stringify(nested));
console.log(JSON.stringify(nested, null, 2));
console.log(JSON.stringify(nested, null, '-->'));
console.log(JSON.stringify([], null, 2), JSON.stringify({}, null, 2), JSON.stringify([[]], null, 1), JSON.stringify({ a: undefined }, null, 2));
const holes: number[] = new Array<number>(3);
holes[1] = 5;
console.log(JSON.stringify(holes), JSON.stringify([NaN, Infinity, -Infinity, -0]));

const when = new Date(Date.UTC(2024, 0, 2, 3, 4, 5, 6));
console.log(JSON.stringify({ when }, (k, v) => (k === 'when' ? typeof v + ':' + v : v)));
console.log(JSON.stringify({ a: 1, b: { a: 2, c: 3 } }, ['a', 'b']));
console.log(JSON.stringify({ a: { toJSON: (k: string) => 'key ' + k }, b: [{ toJSON: (k: string) => 'index ' + k }] }));
console.log(JSON.stringify({ a: 1, b: 'two', c: [3] }, (k, v) => (k === '' ? v : typeof v === 'number' ? undefined : v)));

const cyclic: { me?: unknown } = {};
cyclic.me = [cyclic];
try {
  JSON.stringify(cyclic);
} catch (e) {
  console.log((e as Error).name, (e as Error).message.split('\n')[0]);
}

const deep = '['.repeat(2000) + ']'.repeat(2000);
console.log(JSON.stringify(JSON.parse(deep)).length);

const invalid = ['', ' ', 'undefined', 'NaN', 'Infinity', '[object Object]', '{', '{"a"', '{"a":', '{"a":1', '{"a":1,}', '[1,]', '[1 2]', '01', '-', '1.', '1e', '1e+', '"abc', '"a\u0001"', '"\\x"', '"\\u12"', '"\\u12G4"', 'tru', 'nul', 'fals', 'true false', '{a:1}', "{'a':1}", '"é" x', '😀', '[1, 😀]', '{"a":1}}', '\n\n  {\n"a" 1}', 'x'.repeat(30)];
for (const s of invalid) {
  try {
    JSON.parse(s);
    console.log('parsed', JSON.stringify(s));
  } catch (e) {
    console.log((e as Error).name + ': ' + (e as Error).message);
  }
}
