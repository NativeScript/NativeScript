// @app-lenient
// A local declared without a value and set by destructuring on every path before any read: a number as declared.
function panes(fold: { x: number; width: number }, flat: boolean, center: number) {
  let start: number;
  let length: number;
  if (!flat) {
    [start, length] = [fold.x, fold.width];
  } else {
    ({ x: start, width: length } = { x: center, width: 0 });
  }
  if (length < 40) {
    start -= (40 - length) / 2;
    length = 40;
  }
  return `${Math.round(start)}, ${Math.round(length)}`;
}
console.log(panes({ x: 300, width: 10 }, false, 0), panes({ x: 0, width: 0 }, true, 200));
function partly() {
  let maybe: number, other: number;
  if (Math.random() > 2) [maybe, other] = [1, 2];
  return typeof maybe;
}
console.log(partly());
