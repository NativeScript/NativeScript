// @kotlin
// Values outside their declared type: JavaScript carries on where compiled code throws a catchable TypeError.
// Each line prints "TypeError" either way: Node's for the wrong value it got, the native one for the error it threw.
type Kind = 'a' | 'b';
function weight(k: Kind): number {
  switch (k) {
    case 'a':
      return 1;
    case 'b':
      return 2;
  }
}
const k: Kind = JSON.parse('"c"');
try {
  const w = weight(k);
  console.log('switch', w === undefined ? 'TypeError' : w);
} catch (e) {
  console.log('switch', e instanceof TypeError ? 'TypeError' : (e as Error).name);
}
class Box {
  n: number = 1;
}
const v: any = 'red';
try {
  const b = new Box();
  b.n = v;
  console.log('field', typeof b.n === 'number' ? b.n : 'TypeError');
} catch (e) {
  console.log('field', e instanceof TypeError ? 'TypeError' : (e as Error).name);
}
class Widget { id = 'w'; }
class Push extends Widget { text = 'tap'; }
class Caption extends Widget { label = 'lbl'; }
function asPush(source: Widget): string {
  const p = source as Push;
  return p.text === undefined ? 'TypeError' : p.text;
}
try {
  console.log('downcast', asPush(new Caption()));
} catch (e) {
  console.log('downcast', e instanceof TypeError ? 'TypeError' : (e as Error).name);
}
