// The order of microtasks, promise jobs and timers.
console.log('script start');
setTimeout(() => console.log('timeout 0'), 0);
setTimeout(() => console.log('timeout 1'), 1);

Promise.resolve()
  .then(() => console.log('then 1'))
  .then(() => console.log('then 2'));
queueMicrotask(() => console.log('microtask'));

async function inner(): Promise<string> {
  console.log('inner start');
  await null;
  console.log('inner after await');
  return 'inner result';
}

async function outer() {
  console.log('outer start');
  const r = await inner();
  console.log('outer got', r);
}
outer();

const p = new Promise<number>((resolve) => {
  console.log('executor');
  resolve(1);
});
p.then((v) => console.log('p', v));

// Resolving with a promise takes two extra jobs.
new Promise<number>((resolve) => resolve(Promise.resolve(2))).then((v) => console.log('adopted', v));
Promise.resolve(3).then((v) => console.log('direct', v)).then(() => console.log('direct 2')).then(() => console.log('direct 3'));

async function returnsPromise(): Promise<number> {
  return Promise.resolve(4);
}
returnsPromise().then((v) => console.log('async returned promise', v));

Promise.reject(new Error('boom'))
  .catch((e: Error) => { console.log('caught', e.message); return 5; })
  .finally(() => console.log('finally'))
  .then((v) => console.log('after finally', v));

setTimeout(() => {
  console.log('timeout 10');
  Promise.resolve().then(() => console.log('microtask from timer'));
  setTimeout(() => console.log('nested timeout'), 0);
}, 10);
setTimeout(() => console.log('timeout 10 second'), 10);
console.log('script end');
