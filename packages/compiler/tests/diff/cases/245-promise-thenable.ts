// A thenable asserted to be a promise: Promise.resolve adopts it through its then, as for any thenable.
const thenable = { then: (ok: (v: string) => void) => ok('from thenable') };
Promise.resolve(thenable as unknown as Promise<string>).then((v) => console.log(v));
const real = Promise.resolve('real');
console.log(Promise.resolve(real) === real);
async function adopt(): Promise<string> {
  return await (thenable as unknown as Promise<string>);
}
adopt().then((v) => console.log('awaited', v));
