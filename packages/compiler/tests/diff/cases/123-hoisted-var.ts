// @swift
// `var` is its function's, or its module's, wherever it is declared: read before its declaration, and outside its block.
const ready = Math.random() >= 0;
if (ready) {
  var settings: { theme: string } | undefined = { theme: 'dark' };
}
if (ready) {
  console.log('module', settings?.theme);
}

function format(day: number, monthIndex: number): string {
  let result = 'DD/MM';
  result = result.replace('DD', String(day));
  console.log('before', typeof month);
  var month: number | undefined = monthIndex + 1;
  result = result.replace('MM', month < 10 ? '0' + month : String(month));
  return result;
}
console.log(format(7, 2));

function pick(flag: boolean): string {
  if (flag) {
    var chosen = 'yes';
  } else {
    chosen = 'no';
  }
  return chosen;
}
console.log(pick(true), pick(false));
