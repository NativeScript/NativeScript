// Math.imul: 32-bit wrapping multiplication of each operand's ToInt32, as string hashes use it.
const pairs: [number, number][] = [
  [3, 4], [-5, 12], [0xffffffff, 5], [0x7fffffff, 2], [2 ** 32 + 7, 3], [1.9, -2.9],
  [NaN, 3], [Infinity, 2], [-0, 5], [123456789, 987654321], [-2147483648, -1],
];
for (const [a, b] of pairs) console.log(a, b, Math.imul(a, b));

function hashPair(text: string, seed: number): string {
  let left = 0x811c9dc5 ^ seed;
  let right = 0x01000193 + seed;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    left = Math.imul(left ^ code, 0x01000193);
    right = Math.imul(right + code, 0x5bd1e995) ^ (right >>> 13);
  }
  left = Math.imul(left ^ (left >>> 15), 0x2c1b3c6d);
  return (left >>> 0).toString(16) + ':' + (right >>> 0).toString(36);
}
console.log(hashPair('', 0), hashPair('hello world', 7), hashPair('ünïcødé ✓', 0xdeadbeef));
