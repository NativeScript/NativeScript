// @lenient
// Values written on a class instance under symbol keys, listed with Object.getOwnPropertySymbols,
// as core's CssAnimationProperty stores a style's computed value and applyAllNativeSetters finds it.
const computed = Symbol('rotate:computed');
const source = Symbol('rotate:source');
const map: Record<symbol, string> = {} as any;
map[computed] = 'rotate';
class Style {
  color = 'red';
}
const style = new Style();
style[computed] = 20;
style[source] = 1;
const found = Object.getOwnPropertySymbols(style).map((s) => `${map[s] ?? 'unmapped'}=${style[s]}`);
console.log(found.join(' '), Object.keys(style).join());
