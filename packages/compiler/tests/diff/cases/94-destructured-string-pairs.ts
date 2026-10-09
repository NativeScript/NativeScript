// Array destructuring of a string[][]'s elements, then each as a string.
function describe(name: string, value: string): string {
  return name + '=' + value;
}
const out: string[] = [];
for (const [name, value] of [['padding', '16'], ['font-size', '24']]) {
  out.push(describe(name, value));
}
const pairs: string[][] = [['a', '1'], ['b']];
for (const [k, v] of pairs) out.push(k + ':' + v);
console.log(out.join(' '));
