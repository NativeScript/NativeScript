// @lenient
// Attribute strings reach accessors typed boolean, number and string, as a template's `textWrap="true"`
// reaches core's Label: the setter's body uses what it was given.
class Label {
  whiteSpace = 'nowrap';
  size = 0;
  title = '';
  get textWrap(): boolean {
    return this.whiteSpace === 'normal';
  }
  set textWrap(value: boolean) {
    this.whiteSpace = value ? 'normal' : 'nowrap';
  }
  get width(): number {
    return this.size;
  }
  set width(value: number) {
    this.size = value * 2;
  }
  get heading(): string {
    return this.title;
  }
  set heading(value: string) {
    this.title = value + '!';
  }
}
const label: any = new Label();
label.textWrap = 'true';
label.width = '45';
label.heading = 7;
console.log(label.whiteSpace, label.size, label.title, label.textWrap);
label.textWrap = '';
label.width = 4;
console.log(label.whiteSpace, label.size, label.textWrap);
