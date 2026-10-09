// A `then` handler giving a promise on one path and undefined on another: the chain settles with undefined there, not a zero.
function step(n: number): Promise<number> | undefined {
  return n > 0 ? Promise.resolve(n * 2) : undefined;
}
async function run() {
  await Promise.resolve(3)
    .then((n) => step(n))
    .then((v) => console.log('first', v));
  await Promise.resolve(0)
    .then((n) => step(n))
    .then((v) => console.log('second', v, v === undefined));
  await Promise.resolve(1)
    .then((n) => {
      if (n > 5) return Promise.resolve('big');
    })
    .then((v) => console.log('third', v === undefined));
}
run();
