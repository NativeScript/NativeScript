// A defaulted parameter takes its default where the call gives undefined, not only where it leaves the argument out:
// a literal `undefined`, `void 0`, an optional member that is missing, an element past the end, a record's entry, a
// variable holding undefined, and an optional chain that stops. Constant and computed defaults, numbers, strings and
// objects, functions, arrows, a function value of the program's own type, methods of an override family, constructors
// and their parameter properties.
const NAMES = ['a', 'b'];
const NUMS = [1, 2];
const REC: Record<string, string> = { k: 'v' };
interface Opts {
  label?: string;
  size?: number;
  inner?: { tag?: string };
}
interface Style {
  color: string;
}
const DEF: Style = { color: 'red' };
const STYLES: Style[] = [{ color: 'blue' }];

function f(x = 'n'): string {
  return x;
}
function g(n = 5): number {
  return n * 2;
}
function h(a: string, b = a + '!'): string {
  return a + b;
}
function paint(s: Style = DEF): string {
  return s.color;
}
function sized(o: Opts = { size: 1 }): number {
  return o.size ?? -1;
}
function untouched(x = 'keep'): string {
  return x;
}
const arrow = (s: string = 'arrow') => s.toUpperCase();
const fn: (x?: string) => string = (x = 'fv') => x + '.';
class Base {
  greet(who = 'world'): string {
    return 'hi ' + who;
  }
}
class Sub extends Base {
  greet(who = 'sub'): string {
    return 'yo ' + who;
  }
}
class C {
  constructor(public name = 'anon') {}
  m(k = 'mk'): string {
    return this.name + k;
  }
}

const o: Opts = {};
const full: Opts = { label: 'L', size: 3, inner: { tag: 'T' } };
let v: string | undefined;
const maybe: Opts | undefined = undefined as Opts | undefined;
console.log(f(), f(undefined), f(void 0), f(NAMES[7]), f(REC['zz']), f(o.label), f(full.label), f(v), f(maybe?.label), f(o.inner?.tag), f(full.inner?.tag), f('given'));
console.log(g(), g(undefined), g(NUMS[9]), g(o.size), g(full.size), g(void 0), g(0));
console.log(h('x'), h('x', undefined), h('x', NAMES[3]), h('x', ''), arrow(undefined), arrow(NAMES[4]), arrow(o.label), arrow('a'));
console.log(paint(), paint(undefined), paint(STYLES[3]), paint(STYLES[0]), sized(), sized(undefined), sized({}), sized(full));
const b: Base = new Sub();
console.log(b.greet(), b.greet(undefined), b.greet(NAMES[9]), new Base().greet(NAMES[9]), new Base().greet('you'));
console.log(fn(), fn(undefined), fn(NAMES[5]), fn('y'), untouched(), untouched('x'));
console.log(new C().name, new C(undefined).name, new C(NAMES[5]).name, new C(o.label).m(undefined), new C('z').m(NAMES[6]), new C().m(o.label), new C('w').m('!'));
v = 'set';
console.log(f(v), JSON.stringify(new C(REC['none'])));
