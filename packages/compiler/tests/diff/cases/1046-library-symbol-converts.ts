// @lenient-both
// As the kit is generated: a symbol where core declares a string or boolean converts as String() and Boolean() do;
// where it declares a number, Number()'s TypeError.
function label(s: string): string {
  return 'text: ' + String(s);
}

function size(n: number): string {
  return 'size: ' + String(Number(n));
}

function shown(b: boolean): string {
  return 'shown: ' + String(Boolean(b));
}

function run(values: any[]) {
  if (!values.length) throw new Error('no values');
  for (const v of values) {
    console.log(label(v));
    console.log(shown(v));
    try {
      console.log(size(v));
    } catch (e) {
      console.log('size threw', e instanceof TypeError, (e as Error).message);
    }
  }
}

run([Symbol('s'), Symbol()]);
