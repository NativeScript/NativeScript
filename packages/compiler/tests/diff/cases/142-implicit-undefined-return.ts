// @swift
// A function that returns on some paths only gives undefined where its end is reached,
// as a `.then` callback does that returns a promise only when a check passes.
function pick(ok: boolean): Promise<string> | undefined {
  if (ok) return Promise.resolve('picked');
}

function label(n: number): string | undefined {
  if (n > 1) return 'many';
  else if (n === 1) return 'one';
}

console.log(pick(false) === undefined, label(0), label(1), label(5));
Promise.resolve(true)
  .then((authorized) => {
    console.log('authorized', authorized);
    if (authorized) return pick(true)!.then((v) => console.log(v));
  })
  .then(() => console.log('after'));
