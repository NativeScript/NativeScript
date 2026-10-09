// @lenient
// A Map built from entries whose values are functions.
const shorthands = new Map<string, (v: string) => [string, string][]>([
  ['padding', (v) => [['padding-top', v], ['padding-left', v]]],
  ['margin', (v) => [['margin-top', v]]],
]);
const expand = shorthands.get('padding');
console.log(shorthands.size, expand ? expand('8').map((p) => p.join(':')).join(' ') : 'none', shorthands.has('color'));
