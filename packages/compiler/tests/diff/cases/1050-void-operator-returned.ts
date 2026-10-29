// `void f()` given back from a function or callback: `f()` runs, and the result is undefined.
const calls: string[] = [];

function note(what: string): number {
  calls.push(what);
  return calls.length;
}

function statement(): void {
  return void note('statement');
}

function early(stop: boolean): void {
  if (stop) return void note('early');
  note('late');
}

const body = (): void => void note('body');

function each(xs: string[], f: (x: string) => void): void {
  for (const x of xs) f(x);
}

statement();
early(true);
early(false);
body();
each(['a', 'b'], (x) => void note('each ' + x));
each(['c'], (x) => { return void note('block ' + x); });
console.log(calls.join(', '));
console.log(String(statement()), String(body()));
