// @app-lenient
// A non-strict app: an untyped array's element declared a string, and find()'s result, may be undefined.
function first(input: any[]): string {
  const s: string = input[0];
  return s ? s.toUpperCase() : 'none';
}
console.log(first(['a']), first([]), first([undefined, 'b']));
function count(input: any[]): number {
  const n: number = input[1];
  return n === undefined ? -1 : n + 1;
}
console.log(count([0, 2]), count([0]));
function named(xs: { name: string }[], n: string): string {
  const hit = xs.find((x) => x.name === n);
  return hit ? hit.name : 'none';
}
console.log(named([{ name: 'a' }], 'a'), named([{ name: 'a' }], 'b'));
function word(xs: string[], w: string): string {
  const found = xs.find((x) => x === w);
  return found === undefined ? 'missing' : found;
}
console.log(word(['p', 'q'], 'q'), word(['p'], 'r'));
function toggled(toggles: any[]): string {
  const out: string[] = [];
  for (let k = 0; k + 1 < toggles.length; k += 2) {
    const name: string = toggles[k];
    const on = toggles[k + 1] === undefined ? 'unset' : !!toggles[k + 1];
    out.push(`${name}=${on}`);
  }
  return out.join(' ');
}
console.log(toggled(['a', true, 'b', undefined, 'c', 0]));
