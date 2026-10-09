// @lenient
// A setter testing what script gives it (core's `set style(value)` taking a CSS string): the string reaches it.
class Style {
  padding = 0;
}
class View {
  private _style = new Style();
  get style(): Style {
    return this._style;
  }
  set style(value: Style /* | string */) {
    if (typeof value === 'string') {
      this._style.padding = parseFloat((value as any).split(':')[1]);
    } else {
      throw new Error('View.style property is read-only.');
    }
  }
}
const view = new View();
const v: any = view;
v.style = 'padding: 40';
console.log(view.style.padding);
const typed = new View();
(typed as any)['style'] = 'padding: 7';
console.log(typed.style.padding);
