// Arguments spread from a tuple into defaulted parameters: an undefined element takes the default, as an omitted one does.
function pair(a = 1, b = 2): string {
  return `${a},${b}`;
}
const tup: [number, number] = [5, 6];
const half: [number | undefined, number] = [undefined, 9];
const none: [number | undefined, number | undefined] = [undefined, undefined];
console.log(pair(...tup), pair(...half), pair(...none), pair());
