// Untyped values whose type the program tests are held as they are, so the test sees what they are; an untyped value
// passed to a typed parameter whose type nothing tests is JavaScript's TypeError there, never a converted value.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const raw: any = 42;
const v = raw as string;
if (typeof v === 'string') console.log('string', v.length);
else console.log('not a string', typeof v, v);

function parse(s: string) {
  return JSON.parse(s) as number;
}
const n = parse('"x"');
console.log(typeof n, n);

const label = JSON.parse('{"text": "hi"}') as string;
console.log((label as any).text);

function describe(x: string) {
  return typeof x === 'string' ? `length ${x.length}` : 'not ' + typeof x;
}
console.log(describe(raw), describe('abc'));

function shout(s: string) {
  return s.toUpperCase();
}
function half(x: number) {
  return x / 2;
}
attempt('shout', () => shout(raw));
attempt('shout held', () => shout(v));
attempt('shout ok', () => shout(JSON.parse('"hey"')));
attempt('half', () => half(JSON.parse('8')));
