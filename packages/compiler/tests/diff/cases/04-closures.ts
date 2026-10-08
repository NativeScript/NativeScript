// Closures, per-iteration bindings, control flow.
const fns: (() => number)[] = [];
for (let i = 0; i < 3; i++) fns.push(() => i * 10);
console.log(fns.map((f) => f()));

function makeCounter(start: number) {
  let n = start;
  return {
    next: () => ++n,
    reset: () => { n = start; },
  };
}
const c = makeCounter(5);
c.next();
c.next();
console.log(c.next());
c.reset();
console.log(c.next());

function classify(n: number): string {
  switch (n % 4) {
    case 0:
      return 'zero';
    case 1:
    case 2:
      return 'small';
    default:
      return 'other';
  }
}
console.log([0, 1, 2, 3, 4].map(classify).join(' '));

let total = 0;
for (let i = 0; i < 10; i++) {
  if (i % 2) continue;
  if (i > 6) break;
  total += i;
}
let k = 0;
while (k < 5) k += 2;
do { k--; } while (k > 3);
console.log(total, k);

function sum(...xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
function greet(name: string, greeting = 'Hi', punctuation?: string): string {
  return `${greeting}, ${name}${punctuation ?? '!'}`;
}
console.log(sum(1, 2, 3), greet('Ann'), greet('Bo', 'Yo', '?'));

const compose = (f: (x: number) => number, g: (x: number) => number) => (x: number) => f(g(x));
console.log(compose((x) => x + 1, (x) => x * 2)(5));

// A closure reading a constant declared after it, run once the constant is set.
function laterConst(): number {
  const read = () => factor * 2;
  const factor = 21;
  return read();
}
console.log(laterConst());

