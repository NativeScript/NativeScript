// @lenient-both
// A subclass's setter wider than its getter over a base's plain one (a canvas plugin's `set width(value: any)` over
// core's `View.width`), and a plain setter over a base's wider one: each write reaches the subclass's setter, whether
// written directly, through the base's type, by name, or passed on with `super`.
class Style {
  constructor(public css: string) {}
}
class View {
  private _width = 0;
  private _style = new Style('');
  get width(): number {
    return this._width;
  }
  set width(value: number) {
    this._width = value;
  }
  get style(): Style {
    return this._style;
  }
  set style(value: Style /* | string */) {
    this._style = typeof value === 'string' ? new Style(`inline ${value}`) : value;
  }
}
class Canvas extends View {
  private _pending: any = null;
  get width(): number {
    return this._pending ?? 0;
  }
  set width(value: any) {
    this._pending = parseFloat(value) * 2;
  }
}
class HiDpiCanvas extends Canvas {
  writes = 0;
  get width(): number {
    return super.width;
  }
  set width(value: any) {
    this.writes++;
    super.width = value;
  }
}
class Tag extends View {
  writes = 0;
  get style(): Style {
    return super.style;
  }
  set style(value: Style) {
    this.writes++;
    super.style = value;
  }
}
function setPropertyValue(instance: any, name: string, value: any) {
  instance[name] = value;
}
const canvas = new Canvas();
canvas.width = '21';
console.log(canvas.width);
const asView: View = canvas;
asView.width = 7;
console.log(canvas.width, asView.width);
setPropertyValue(canvas, 'width', '4');
console.log(canvas.width);
const hi = new HiDpiCanvas();
hi.width = '5';
(hi as View).width = 6;
setPropertyValue(hi, 'width', 1);
console.log(hi.width, hi.writes);
const tag = new Tag();
tag.style = new Style('a');
(tag as View).style = new Style('b');
setPropertyValue(tag, 'style', new Style('c'));
console.log(tag.style.css, tag.writes);
