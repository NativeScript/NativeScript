// Everyday idioms: spreads, swaps, Array.from, labeled loops, toString overrides.
const nums = [4, 9, 1, 7];
console.log(Math.max(...nums), Math.min(...nums), [...nums].sort((a, b) => b - a), nums);

let a = 1;
let b = 2;
[a, b] = [b, a];
console.log(a, b);

const zeros = new Array<number>(3).fill(0);
const squares = Array.from({ length: 4 }, (_, i) => i * i);
console.log(zeros, squares, Array.from('abc'), Array.of(1, 2));

outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 2) continue outer;
    if (i === 2) break outer;
    console.log('pair', i, j);
  }
}

class Money {
  constructor(readonly cents: number, readonly currency = 'USD') {}
  toString() {
    return `${(this.cents / 100).toFixed(2)} ${this.currency}`;
  }
}
const price = new Money(1999);
console.log(`price: ${price}`, String(price), 'total ' + price);

function sum(...xs: number[]) {
  return xs.reduce((s, x) => s + x, 0);
}
const parts = [1, 2, 3];
console.log(sum(...parts), sum(), sum(5, ...parts, 10));

const words = ['delta', 'alpha', 'charlie', 'bravo'];
const byLength = [...words].sort((x, y) => x.length - y.length || x.localeCompare(y));
console.log(byLength.join(' '), words.indexOf('charlie'), words.at(-1), words.slice(-2).join('+'));
const counts: Record<string, number> = {};
for (const w of words) counts[w[0]] = (counts[w[0]] ?? 0) + 1;
console.log(JSON.stringify(counts));
