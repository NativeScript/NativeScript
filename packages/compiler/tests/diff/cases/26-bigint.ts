// BigInt: integers of any size with JavaScript's arithmetic, comparisons,
// conversions and errors.
const a = 12345678901234567890n;
const b = -98765432109876543210n;
console.log(a, b, a + b, a - b, a * b, b / a, b % a, -a, typeof a);
console.log(2n ** 100n, (-3n) ** 5n, 0n ** 0n, 7n / 2n, -7n / 2n, 7n % -2n, -7n % 2n);
console.log(0xffn, 0o17n, 0b1011n, 1_000_000n, BigInt(42), BigInt('123456789012345678901234567890'), BigInt('0x1f'), BigInt(true), BigInt(-0));
const zero = BigInt(0);
console.log(a > b, a < b, 5n === 5n, 5n == BigInt(5), 1n < 2, 2n > 1.5, (3n as unknown) == (3 as unknown), zero ? 'truthy' : 'falsy', !!a);
console.log(String(a), a.toString(16), b.toString(2).length, `${b}`, Number(a), Number(2n ** 64n), parseInt(a.toString()));
console.log(6n & 3n, 6n | 3n, 6n ^ 3n, ~5n, -6n & 3n, -6n | 3n, 1n << 70n, (2n ** 70n) >> 68n, -9n >> 1n, -8n >> 1n);
console.log(BigInt.asUintN(8, 257n), BigInt.asIntN(8, 255n), BigInt.asIntN(64, 2n ** 63n), BigInt.asUintN(64, -1n));
let counter = 0n;
for (let i = 0; i < 5; i++) counter += BigInt(i) * 10n;
counter *= 3n;
counter -= 1n;
counter++;
console.log(counter, [1n, 2n, 3n], { big: 10n }, new Map([[1n, 'one']]).get(1n), new Set([1n, 1n, 2n]).size);
function factorial(n: bigint): bigint {
  return n <= 1n ? 1n : n * factorial(n - 1n);
}
console.log(factorial(30n), factorial(25n) / factorial(23n));
for (const attempt of [() => 1n / 0n, () => BigInt(1.5), () => BigInt('12x'), () => JSON.stringify({ n: 1n }), () => 2n ** -1n]) {
  try {
    console.log(attempt());
  } catch (e) {
    console.log((e as Error).name, (e as Error).message);
  }
}
console.log(a.toLocaleString(), (1234567n).toLocaleString('en-US'));
