// Async functions: loops, try/catch/finally around awaits, combinators.
function delay(ms: number, value: string): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fail(ms: number, message: string): Promise<string> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

async function sequence(): Promise<string[]> {
  const out: string[] = [];
  for (const [i, ms] of [30, 10, 20].entries()) {
    out.push(await delay(ms, `step ${i}`));
  }
  let n = 0;
  while (n < 3) {
    n++;
    if (n === 2) continue;
    out.push(`loop ${n} ${await delay(1, 'tick')}`);
  }
  return out;
}

async function guarded(shouldFail: boolean): Promise<string> {
  const events: string[] = [];
  try {
    events.push('before');
    const v = shouldFail ? await fail(5, 'nope') : await delay(5, 'yes');
    events.push('got ' + v);
  } catch (e) {
    events.push('caught ' + (e as Error).message);
    await delay(1, '');
    events.push('after catch await');
  } finally {
    events.push('finally');
  }
  return events.join(', ');
}

async function main() {
  console.log((await sequence()).join(' | '));
  console.log(await guarded(false));
  console.log(await guarded(true));
  const all = await Promise.all([delay(20, 'a'), delay(5, 'b'), delay(10, 'c')]);
  console.log('all', all);
  console.log('race', await Promise.race([delay(20, 'slow'), delay(5, 'fast')]));
  const settled = await Promise.allSettled([delay(5, 'ok'), fail(1, 'bad')]);
  console.log('settled', settled.map((s) => s.status).join(','));
  console.log('any', await Promise.any([fail(1, 'x'), delay(3, 'first ok')]));
  try {
    await Promise.any([fail(1, 'x'), fail(2, 'y')]);
  } catch (e) {
    console.log('any failed:', (e as Error).message);
  }
  const values = await Promise.all([1, 2, 3].map(async (n) => {
    await delay(10 - n * 3, '');
    return n * n;
  }));
  console.log(values.join(' '));
}

main().then(() => console.log('done'));
console.log('main started');
