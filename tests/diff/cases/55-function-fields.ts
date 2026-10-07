// @lenient
// An object of functions read by a computed key and called, as core's matrix module picks
// `TRANSFORM_MATRIXES[property](value)`; and a class field holding a function, read untyped.
const MATRICES = {
  scale: ({ x, y }) => [x, 0, 0, 0, y, 0, 0, 0, 1],
  translate: ({ x, y }) => [1, 0, x, 0, 1, y, 0, 0, 1],
};
export const matrixOf = ({ property, value }) => MATRICES[property](value);
console.log(matrixOf({ property: 'scale', value: { x: 2, y: 3 } }).join(','), matrixOf({ property: 'translate', value: { x: 5, y: 6 } }).join(','));
class Holder {
  format: (n: number) => string = (n) => `#${n}`;
}
const held: any = new Holder();
console.log(held.format(7), typeof held.format);
