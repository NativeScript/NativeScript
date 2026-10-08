// @lenient
// A default put on a class's prototype under a symbol key and read through `this[symbol]` by an
// accessor the class's prototype also gets, as core's CssAnimationProperty registers `rotate` on Style.
class Style {
  color = 'red';
}
function register(cls: { prototype: any }, name: string, defaultValue: number) {
  const computed = Symbol(name + ':computed');
  cls.prototype[computed] = defaultValue;
  Object.defineProperty(cls.prototype, name, {
    get(this: any) {
      return this[computed];
    },
    set(this: any, value: number) {
      this[computed] = value;
    },
  });
}
register(Style, 'rotate', 0);
register(Style, 'scaleX', 1);
const a: any = new Style();
const b: any = new Style();
b.rotate = 12;
console.log(a.rotate, a.scaleX, b.rotate, b.scaleX, a.rotate + 1);
