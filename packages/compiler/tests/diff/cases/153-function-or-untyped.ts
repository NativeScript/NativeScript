// @lenient
// `options.fn || this.method.bind(this)` held untyped (core's glass style function): called either way.
class Styler {
  base = 10;
  style(variant: string): number {
    return this.base + variant.length;
  }
  apply(options: { styleFn?: (variant: string) => number }, variant: string): number {
    const fn: any = options.styleFn || this.style.bind(this);
    return fn(variant);
  }
}
const s = new Styler();
console.log(s.apply({}, 'clear'), s.apply({ styleFn: (v: string) => v.length * 100 }, 'clear'));
