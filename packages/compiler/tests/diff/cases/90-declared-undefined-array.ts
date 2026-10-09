// @lenient
// An array function declared `| undefined` that gives undefined, tested by its caller (core's `_expandCssShorthand`).
const shorthands = new Map<string, (v: string) => [string, string][]>();
shorthands.set('padding', (v) => [['padding-top', v], ['padding-left', v]]);
function expand(name: string, value: string): [string, string][] | undefined {
  const converter = shorthands.get(name);
  if (!converter) {
    return undefined;
  }
  return converter(value);
}
const out: string[] = [];
for (const d of [{ name: 'padding', value: '16' }, { name: 'font-size', value: '24' }]) {
  const expanded = expand(d.name, d.value);
  if (expanded) {
    for (const [p, v] of expanded) out.push(p + ':' + v);
  } else {
    out.push(d.name + ':' + d.value);
  }
}
console.log(out.join(' '));
