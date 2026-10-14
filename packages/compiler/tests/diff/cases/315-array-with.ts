// `with`: one entry replaced in a copy (a state update by index); negative indexes count from the end.
const scores = [10, 20, 30];
const updated = scores.with(1, 25);
console.log(updated.join(','), scores.join(','));
console.log(scores.with(-1, 99).join(','), ['a', 'b'].with(0, 'z').join(','));
try {
  scores.with(3, 0);
} catch (e) {
  console.log(e instanceof RangeError, (e as Error).message);
}
try {
  scores.with(-4, 0);
} catch (e) {
  console.log(e instanceof RangeError);
}
