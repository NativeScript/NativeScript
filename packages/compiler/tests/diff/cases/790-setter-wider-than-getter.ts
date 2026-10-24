// @lenient-both
// Accessors whose setter takes more than the getter gives, written by name as core's Builder writes XML attributes
// (`style="color: red"`, `color="red"`): each setter gets the value script gave.
class Color {
  constructor(public hex: string) {}
}
class Style {
  padding = 0;
  private _color: Color;
  get color(): Color {
    return this._color;
  }
  set color(value: Color) {
    this._color = typeof value === 'string' ? new Color(value) : value;
  }
}
class View {
  private _style = new Style();
  private _tint: Color;
  get style(): Style {
    return this._style;
  }
  set style(inlineStyle: Style /* | string */) {
    if (typeof inlineStyle === 'string') {
      this.setInlineStyle(inlineStyle);
    } else {
      throw new Error('View.style property is read-only.');
    }
  }
  setInlineStyle(css: string) {
    for (const decl of css.split(';')) {
      const [k, v] = decl.split(':').map((s) => s.trim());
      if (k === 'padding') this._style.padding = parseFloat(v);
      if (k === 'color') this._style.color = v as any;
    }
  }
  get color(): Color {
    return this._style.color;
  }
  set color(value: Color) {
    this._style.color = value;
  }
  get tint(): Color {
    return this._tint;
  }
  set tint(value: Color | string) {
    this._tint = value instanceof Color ? value : new Color(`tint ${value}`);
  }
}
function setPropertyValue(instance: any, name: string, value: any) {
  instance[name] = value;
}
const view = new View();
setPropertyValue(view, 'style', 'padding: 26; color: #d32f2f');
console.log(view.style.padding, view.color.hex);
setPropertyValue(view, 'color', 'blue');
console.log(view.color.hex, view.style.color.hex);
setPropertyValue(view, 'tint', 'red');
console.log(view.tint.hex);
view.tint = new Color('green');
console.log(view.tint.hex);
view.tint = 'pink';
console.log(view.tint.hex);
const v: any = view;
v.style = 'padding: 4';
console.log(view.style.padding);
