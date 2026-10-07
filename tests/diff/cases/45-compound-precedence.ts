// @lenient
// Compound assignment of a sum, to variables held untyped or possibly undefined, as core's flexbox
// layout steps `childRight -= width + space + margin` along a reversed row.
function steps(width: number, margin: number) {
  let right;
  right = 100;
  right -= width + 4 + margin;
  let scale: any = 2;
  scale *= width + 1;
  scale /= margin + 1;
  let count: number;
  count = 10;
  count -= margin + 1;
  const bag: any = { left: 50 };
  bag.left -= width + margin;
  bag.left *= 1 + 1;
  return [right, scale, count, bag.left].join();
}
console.log(steps(10, 3));
