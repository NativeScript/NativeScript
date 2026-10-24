// An array pattern's default over a typed array: it applies where the element is past the end (undefined), in a
// parameter and in a declaration, and not where the element is there.
function span([low, high = low + 10]: number[]): string {
  return `${low}..${high}`;
}
function names([first, second = 'none']: string[]): string {
  return `${first}/${second}`;
}
const xs: number[] = [1];
const [a, b = 5, c = a + b] = xs;
const flags: boolean[] = [false];
const [on, off = true] = flags;
console.log(span([1]), span([2, 3]), span([4, 0]), names(['x']), names(['y', '']), a, b, c, on, off);
