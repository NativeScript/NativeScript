// Async generators and for await: the order of every tick against other
// promise work, requests queued while a generator awaits, return() and throw()
// through finally, async iterables of the user's, and for await over sync values.
const trace: string[] = [];
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function* ticker(n: number) {
  try {
    for (let i = 0; i < n; i++) {
      trace.push(`yield ${i}`);
      yield i;
      await null;
    }
    return 'ticker done';
  } finally {
    trace.push('ticker finally');
  }
}

async function consume() {
  for await (const v of ticker(3)) trace.push(`got ${v}`);
  const it = ticker(2);
  const a = it.next();
  const b = it.next();
  const c = it.next();
  const d = it.next();
  trace.push('queued four');
  console.log(await a, await b, await c, await d);
  const early = ticker(5);
  console.log(await early.next(), await early.return('stop'), await early.next());
  for await (const v of ticker(10)) {
    if (v === 1) break;
    trace.push(`loop ${v}`);
  }
}

async function interleave() {
  const order: string[] = [];
  async function* source() {
    order.push('gen start');
    yield 'a';
    order.push('gen after a');
    yield 'b';
  }
  Promise.resolve().then(() => order.push('then 1')).then(() => order.push('then 2')).then(() => order.push('then 3')).then(() => order.push('then 4'));
  for await (const v of source()) order.push(`for ${v}`);
  order.push('loop done');
  await sleep(0);
  console.log(order.join(' | '));
}

async function* fromPromises(): AsyncGenerator<string, void, string> {
  yield Promise.resolve('resolved value');
  yield sleep(5).then(() => 'later value');
  const sent = yield 'plain';
  trace.push(`sent ${sent}`);
}

async function sync() {
  const values: unknown[] = [];
  for await (const v of [1, Promise.resolve(2), sleep(1).then(() => 3)]) values.push(v);
  console.log(values);
  const g = fromPromises();
  console.log(await g.next(), await g.next(), await g.next(), await g.next('hello'));
}

async function* failing(): AsyncGenerator<number, any, unknown> {
  yield 1;
  throw new Error('async gen failed');
}

async function errors() {
  try {
    for await (const v of failing()) trace.push(`failing ${v}`);
  } catch (e) {
    console.log('caught', (e as Error).message);
  }
  const t = ticker(3);
  await t.next();
  try {
    await t.throw(new Error('thrown in'));
  } catch (e) {
    console.log('rethrown', (e as Error).message, await t.next());
  }
  const fresh = failing();
  console.log(await fresh.return('never started'), await fresh.next());
}

class Feed implements AsyncIterable<string> {
  constructor(private items: string[]) {}
  async *[Symbol.asyncIterator]() {
    for (const item of this.items) {
      await sleep(1);
      yield item.toUpperCase();
    }
  }
}

class Manual implements AsyncIterable<number> {
  [Symbol.asyncIterator](): AsyncIterator<number> {
    let n = 0;
    return {
      next: async () => (n < 3 ? { value: n++, done: false } : { value: undefined, done: true }),
      return: async () => {
        trace.push('manual return');
        return { value: undefined, done: true };
      },
    };
  }
}

async function iterables() {
  const out: string[] = [];
  for await (const s of new Feed(['x', 'y'])) out.push(s);
  console.log(out);
  const nums: number[] = [];
  for await (const n of new Manual()) {
    nums.push(n);
    if (n === 1) break;
  }
  console.log(nums);
}

async function main() {
  await consume();
  await interleave();
  await sync();
  await errors();
  await iterables();
  console.log(trace.join('\n'));
}
main();
