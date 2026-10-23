// @lenient
// Core's Font shape: a number field holding undefined, compared with another such field or an undefined argument.
class Font {
  public fontSize: number;
  public scale: number;
  constructor(public family: string, fontSize: number, scale?: number) {
    this.fontSize = fontSize;
    this.scale = scale;
  }
  withFontSize(size: number): Font {
    return new Font(this.family, size, this.scale);
  }
  static equals(a: Font, b: Font): boolean {
    return a.family === b.family && a.fontSize === b.fontSize && a.scale === b.scale;
  }
}
const base = new Font('sys', undefined);
const sized = base.withFontSize(22);
const reset = sized.withFontSize(undefined);
console.log(Font.equals(base, reset), Font.equals(base, sized), base.fontSize === reset.fontSize, sized.fontSize !== reset.fontSize);
let missing: number;
console.log(missing === base.fontSize, missing !== reset.fontSize, base.fontSize === 22, missing === sized.fontSize);
const nan = 0 / 0;
console.log(nan === nan, nan !== nan, sized.fontSize === sized.fontSize);
