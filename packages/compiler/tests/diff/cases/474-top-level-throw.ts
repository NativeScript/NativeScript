// A module's top level that throws, with no uncaught-error handler set: the program ends with status 1 after
// what ran before the throw, as Node ends it.
// @exit 1
function check(n: number): number {
  if (n > 1) throw new RangeError(`${n} is too many`);
  return n;
}

console.log('before', check(1));
setTimeout(() => console.log('timer never runs'), 0);
console.log('after', check(2));
