// An untyped value put into a typed array as an array literal's element, one of `splice`'s items, `fill`'s value or a
// later `push`/`unshift` argument, where nothing tests its type, is JavaScript's TypeError where it is placed. Each such
// value below is then used as its declared type, which throws in JavaScript too. A value of the declared type passes.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

const raw: any = JSON.parse('[5, "s", 7]');
const words = (xs: string[]) => xs.map((w) => w.toUpperCase()).join('+');

attempt('literal', () => {
  const ys: string[] = [raw[0]];
  return ys[0].toUpperCase();
});
attempt('literal ok', () => {
  const ys: string[] = ['a', raw[1]];
  return words(ys);
});
attempt('argument literal', () => words(['a', raw[2]]));
attempt('nested', () => {
  const grid: number[][] = [[1, raw[1]]];
  return grid[0][1].toFixed(1);
});
attempt('splice', () => {
  const ys = ['a', 'b'];
  ys.splice(1, 0, 'c', raw[0]);
  return words(ys);
});
attempt('splice ok', () => {
  const ys = ['a'];
  ys.splice(0, 1, raw[1]);
  return words(ys);
});
attempt('fill', () => {
  const ns = [1, 2];
  ns.fill(raw[1]);
  return ns[0].toFixed(1);
});
attempt('unshift second', () => {
  const ys = ['a'];
  ys.unshift('b', raw[2]);
  return words(ys);
});
attempt('push second', () => {
  const ns = [1];
  ns.push(2, raw[0]);
  return ns.map((n) => n.toFixed(0)).join(',');
});
