// @lenient
// A property defined on a prototype whose setter forwards to a style that converts strings, as core
// defines `flexGrow`, `order` and `flexWrapBefore` on View for attributes to set.
// A registered property's accessor converts what it is given, as core's CssProperty runs its valueConverter.
class Style {
  values: Record<string, any> = {};
}
function register(name: string, converter: (value: string) => any) {
  Object.defineProperty(Style.prototype, name, {
    get(this: Style) {
      return this.values[name];
    },
    set(this: Style, value: any) {
      this.values[name] = typeof value === 'string' ? converter(value) : value;
    },
  });
}
register('flexGrow', (v) => parseFloat(v) * 10);
register('flexWrapBefore', (v) => v === 'true');
class View {
  style = new Style();
}
Object.defineProperty(View.prototype, 'flexGrow', {
  get(this: View): number {
    return (this.style as any).flexGrow;
  },
  set(this: View, value: number) {
    (this.style as any).flexGrow = value;
  },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(View.prototype, 'flexWrapBefore', {
  get: function (this: View): boolean {
    return (this.style as any).flexWrapBefore;
  },
  set: function (this: View, value: boolean) {
    (this.style as any).flexWrapBefore = value;
  },
});
const view: any = new View();
view.flexGrow = '2';
view.flexWrapBefore = 'false';
console.log(view.flexGrow, view.flexWrapBefore);
view.flexGrow = 3;
view.flexWrapBefore = true;
console.log(view.flexGrow, view.flexWrapBefore);
