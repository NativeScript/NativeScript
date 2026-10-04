// Control flow across awaits: break and continue in loops that await,
// return through finally, errors through nested try blocks, long loops
// that only sometimes await.
const tick = (n: number) => new Promise<number>((resolve) => setTimeout(() => resolve(n), 1));

async function search(limit: number): Promise<string> {
  const seen: number[] = [];
  for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) continue;
    const v = await tick(i);
    if (v > limit) break;
    seen.push(v);
  }
  return seen.join(',');
}

async function withFinally(fail: boolean): Promise<string> {
  const steps: string[] = [];
  try {
    steps.push('try');
    await tick(0);
    if (fail) throw new Error('inner');
    return 'returned ' + steps.length;
  } catch (e) {
    steps.push('catch ' + (e as Error).message);
    await tick(0);
    return steps.join('/');
  } finally {
    steps.push('finally');
    console.log('finally saw', steps.join('/'));
  }
}

async function nested(): Promise<string> {
  try {
    try {
      await tick(1);
      throw new Error('deep');
    } finally {
      console.log('inner finally');
    }
  } catch (e) {
    return 'outer caught ' + (e as Error).message;
  }
}

async function sometimes(): Promise<number> {
  let total = 0;
  let i = 0;
  while (i < 20000) {
    if (i % 5000 === 0) total += await tick(i);
    else total += 1;
    i++;
  }
  return total;
}

async function main() {
  console.log(await search(5));
  console.log(await withFinally(false));
  console.log(await withFinally(true));
  console.log(await nested());
  console.log(await sometimes());
  const results: string[] = [];
  for (const name of ['a', 'b', 'c']) {
    switch (name) {
      case 'b':
        results.push(name.toUpperCase() + (await tick(2)));
        break;
      default:
        results.push(name);
    }
  }
  console.log(results.join(''));
}
main().catch((e) => console.log('main failed', e));
