// @lenient-both
// As the kit is generated: an untyped value where core declares a string, number or boolean converts as String(),
// Number() and Boolean() do, another primitive and a bigint among them. A value core makes only to be told apart by
// identity (`unsetValue`, `resetSymbol`), given where a string, number or boolean is declared, is no TypeError.
const unsetValue: any = new Object();
const resetSymbol = Symbol('textDefault');

function isReset(value: any): boolean {
  return value === unsetValue || value === resetSymbol;
}

class Label2 {
  text: string = '';
  width: number = 0;
  visible: boolean = true;
}

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
    console.log(label(v), size(v), shown(v));
  }
  const l: any = new Label2();
  for (const v of values) {
    l.text = v;
    l.width = v;
    l.visible = v;
    console.log('fields', String(l.text), String(Number(l.width)), String(Boolean(l.visible)));
  }
  for (const marker of [unsetValue, resetSymbol]) {
    try {
      label(marker);
      shown(marker);
      l.text = marker;
      l.visible = marker;
      if (marker === unsetValue) {
        size(marker);
        l.width = marker;
      }
      console.log('reset', isReset(marker));
    } catch (e) {
      console.log('reset threw', (e as Error).message);
    }
  }
}

run(['a', '12', 5, 0, -1.5, true, false, '', 12n, 0n]);
