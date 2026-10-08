// Generators and the iterator protocol: function*, yield and yield*, values sent
// in with next(), return() and throw() through finally blocks, for…of closing
// iterators early, spread and destructuring of iterables, and user iterables.
function* count(from: number, to: number) {
  for (let i = from; i <= to; i++) yield i;
  return 'done';
}
const g = count(1, 3);
console.log(g.next(), g.next(), g.next(), g.next(), g.next());
console.log([...count(4, 7)], Array.from(count(1, 2)), Math.max(...count(3, 9)));
for (const n of count(10, 12)) console.log('of', n);

function* lazy() {
  console.log('started');
  yield 1;
  console.log('resumed');
}
const l = lazy();
console.log('created');
console.log(l.next().value);
console.log(l.next().done);

function* echo(): Generator<string, number, number> {
  let total = 0;
  while (true) {
    const got = yield `total ${total}`;
    if (got < 0) return total;
    total += got;
  }
}
const e = echo();
console.log(e.next(99).value, e.next(5).value, e.next(7).value, e.next(-1), e.next(1));

function* guarded(): Generator<string, any, unknown> {
  try {
    yield 'a';
    yield 'b';
    yield 'c';
  } catch (err) {
    console.log('caught', err);
    yield 'recovered';
  } finally {
    console.log('cleanup');
  }
  yield 'after';
}
const r1 = guarded();
console.log(r1.next().value, r1.return('early'), r1.next());
const r2 = guarded();
console.log(r2.next().value, r2.throw('boom').value, r2.next().value, r2.next(), r2.next());
const r3 = guarded();
try {
  r3.throw(new Error('before start'));
} catch (err) {
  console.log('threw at start:', (err as Error).message, r3.next());
}

function* finallyYields(): Generator<number | string, any, unknown> {
  try {
    yield 1;
  } finally {
    yield 'from finally';
    console.log('finally done');
  }
}
const f = finallyYields();
console.log(f.next(), f.return(42), f.next(), f.next());

for (const v of guarded()) {
  console.log('loop', v);
  if (v === 'b') break;
}
outer: for (const a of count(1, 3)) {
  for (const b of guarded()) {
    if (b === 'b') continue outer;
    console.log('pair', a, b);
  }
}
function firstOver(limit: number): number | undefined {
  for (const x of count(1, 100)) {
    if (x * x > limit) return x;
  }
  return undefined;
}
console.log(firstOver(50));

function* inner(): Generator<number, string, unknown> {
  yield 1;
  yield 2;
  return 'inner result';
}
function* outerGen() {
  const result = yield* inner();
  console.log('inner returned', result);
  yield* [10, 20];
  yield* 'hi';
  yield* new Set(['s']);
  yield* new Map([['k', 'v']]);
}
console.log([...outerGen()]);

function* fib() {
  let [a, b] = [0, 1];
  for (;;) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const firstTen: number[] = [];
for (const x of fib()) {
  if (firstTen.length === 10) break;
  firstTen.push(x);
}
console.log(firstTen);
const [p, q, ...others] = count(1, 6);
console.log(p, q, others);

class Range implements Iterable<number> {
  constructor(private start: number, private end: number, private step = 1) {}
  *[Symbol.iterator]() {
    for (let v = this.start; v < this.end; v += this.step) yield v;
  }
}
const range = new Range(0, 10, 3);
console.log([...range], [...range].length, Array.from(new Range(1, 4)));
for (const v of new Range(5, 7)) console.log('range', v);

class Countdown implements Iterator<number> {
  constructor(private n: number) {}
  next(): IteratorResult<number> {
    return this.n > 0 ? { value: this.n--, done: false } : { value: undefined, done: true };
  }
  [Symbol.iterator]() {
    return this;
  }
}
console.log([...new Countdown(3)]);

const manual = {
  [Symbol.iterator]() {
    let i = 0;
    const items = ['x', 'y'];
    return {
      next: () => (i < items.length ? { value: items[i++], done: false } : { value: undefined, done: true }),
      return: () => {
        console.log('manual closed');
        return { value: undefined, done: true };
      },
    };
  },
};
for (const m of manual) {
  console.log('manual', m);
  break;
}
console.log([...manual]);

function* withIndex<T>(items: Iterable<T>) {
  let i = 0;
  for (const item of items) yield [i++, item] as [number, T];
}
console.log([...withIndex(['a', 'b'])], [...withIndex(new Set([true]))], [...withIndex(count(7, 8))]);
const it = [1, 2, 3][Symbol.iterator]();
console.log(it.next(), [...it]);
const entries = new Map([['one', 1], ['two', 2]]).entries();
console.log(entries.next().value, [...entries]);
console.log(Object.prototype.toString.call(count(1, 1)), typeof count(1, 1)[Symbol.iterator]);
console.log(count(1, 2));

function* throwsInside() {
  yield 1;
  throw new Error('generator failed');
}
try {
  for (const v of throwsInside()) console.log('got', v);
} catch (err) {
  console.log('caught', (err as Error).message);
}
const running = (function* (): Generator<number> {
  try {
    yield 1;
  } finally {
    console.log('closing running');
  }
})();
running.next();
try {
  [...running];
  console.log('spread after start', running.next());
} catch (err) {
  console.log((err as Error).message);
}
