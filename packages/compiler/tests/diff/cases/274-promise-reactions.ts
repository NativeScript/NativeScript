// Promise reactions in order: several thens on one pending promise, on a settled one, rejections with
// several handlers, resolutions with numbers, strings, objects with and without a then, and promises.
const events: string[] = [];
let resolveLater: (v: number) => void = () => {};
const pending = new Promise<number>((r) => (resolveLater = r));
pending.then((v) => events.push('a' + v));
pending.then((v) => events.push('b' + v));
pending.then((v) => events.push('c' + v)).then(() => events.push('c-next'));
const settled = Promise.resolve(7);
settled.then((v) => events.push('s1:' + v));
settled.then((v) => events.push('s2:' + v));
resolveLater(1);
let rejectLater: (e: unknown) => void = () => {};
const failing = new Promise<number>((_, j) => (rejectLater = j));
failing.catch((e) => events.push('x1:' + e));
failing.then(
  () => events.push('never'),
  (e) => events.push('x2:' + e),
);
failing.finally(() => events.push('finally')).catch(() => events.push('x3'));
rejectLater('boom');
const thenable = { then: (ok: (v: string) => void) => ok('from thenable') };
Promise.resolve(thenable as unknown as Promise<string>).then((v) => events.push(v));
Promise.resolve({ amount: 3, unit: 'kg' }).then((o) => events.push('object ' + o.amount + o.unit));
Promise.resolve('text').then((s) => events.push(s));
Promise.resolve(Promise.resolve(5)).then((v) => events.push('nested ' + v));
async function twice(n: number): Promise<number> {
  return (await Promise.resolve(n)) * 2;
}
async function run(): Promise<void> {
  let total = 0;
  for (let i = 0; i < 5; i++) total += await twice(i);
  events.push('total ' + total);
  try {
    await failing;
  } catch (e) {
    events.push('caught ' + e);
  }
}
run().then(() => console.log(events.join(' | ')));
