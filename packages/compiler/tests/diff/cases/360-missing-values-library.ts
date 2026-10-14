// @lenient-kotlin
// What core's code throws for a missing value, translated as the kit is: a destructured parameter, a WeakRef's target,
// a function called through `call` and a setter's value, each caught as the TypeError V8 words it as.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
function point({ x, y }: { x: number; y: number }): number {
  return x + y;
}
function pair([a, b]: string[]): string {
  return a + b;
}
const nothing: any = undefined;
attempt('point', () => point({ x: 1, y: 2 }));
attempt('point undefined', () => point(nothing));
attempt('pair', () => pair(['a', 'b']));
attempt('pair undefined', () => pair(nothing));

class Target {
  name = 'target';
}
attempt('weakref', () => new WeakRef(new Target()).deref()?.name);
attempt('weakref undefined', () => new WeakRef(nothing));

class Converter {
  convert: ((v: string) => string) | undefined;
  run(v: string): string {
    return this.convert.call(this, v);
  }
}
const converter = new Converter();
attempt('call missing', () => converter.run('a'));
converter.convert = (v) => v.toUpperCase();
attempt('call', () => converter.run('a'));

class Grid {
  spec = '';
  set rows(value: string) {
    this.spec = value.split(',').join('|');
  }
}
const grid = new Grid();
attempt('setter', () => {
  grid.rows = 'a,b';
  return grid.spec;
});
