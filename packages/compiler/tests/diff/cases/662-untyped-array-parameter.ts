// An untyped array whose elements are already of the parameter's element type, given to a number[] or string[] parameter is the caller's array: writes through it are seen.
function fill(out: number[]): void {
  for (let i = 0; i < out.length; i++) out[i] = i + 10;
}
function name(out: string[]): void {
  out[0] = 'z';
}
const plain: any = [0, 0, 0];
fill(plain);
console.log(plain.join());
const words: any = ['a', 'b'];
name(words);
console.log(words.join());
