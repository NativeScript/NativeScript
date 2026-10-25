// @assign-fields
// A class's optional function-typed field written undefined is a key, as any other optional field is.
class Widget {
  format?: (n: number) => string;
  label?: string;
  onDone?: () => void;
  constructor(format?: (n: number) => string) {
    this.format = format;
  }
  reset() {
    this.onDone = undefined;
  }
}
const w = new Widget();
console.log(Object.keys(w).join(','), 'format' in w, 'onDone' in w, JSON.stringify(w));
w.reset();
console.log(Object.keys(w).join(','), 'onDone' in w, typeof w.onDone);
w.format = (n) => `${n}`;
console.log(Object.keys(w).join(','), typeof w.format, w.format?.(2));
const v = new Widget((n) => `#${n}`);
v.onDone = () => {};
v.onDone = undefined;
console.log(Object.keys(v).join(','), JSON.stringify({ ...v }), Object.entries(v).length);
