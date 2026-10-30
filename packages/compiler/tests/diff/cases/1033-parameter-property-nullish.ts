// A constructor parameter property typed `T | null` given null at one time and a missing value at another holds each
// as it is: JSON keeps the null and leaves the undefined out, and `=== null` / `=== undefined`, `typeof` and string
// conversion tell them apart, in the constructor's body, its methods and outside.
const COLORS: Record<string, string> = { cpc: 'red' };
const NAMES = ['a', 'b'];

class Chip {
  readonly seen: string;
  constructor(public color: string | null, readonly name: string | null, private size: number | null) {
    this.seen = String(color) + '/' + typeof name;
  }
  describe(): string {
    return String(this.color) + '/' + this.name + '/' + (this.color === undefined) + '/' + (this.color === null) + '/' + `${this.size}`;
  }
}

const chips = [new Chip(COLORS['cpc'], 'n', 1), new Chip(COLORS['tsc'], NAMES[7], [3][4]), new Chip(null, null, null), new Chip('x', NAMES[0], [5][0])];
for (const c of chips) console.log(JSON.stringify(c), c.color === null, c.color === undefined, c.name === undefined, c.name === null, c.seen, c.describe());
const d = new Chip(COLORS['zz'], NAMES[9], null);
console.log(String(d.color), `${d.name}`, typeof d.color, JSON.stringify(d), Object.keys(d).join());
d.color = null;
console.log(JSON.stringify(d), d.color === null);
d.color = COLORS['q'];
console.log(JSON.stringify(d), d.color === undefined, d.color === null);

// Typed with both, the same.
class Tint {
  constructor(public tint: string | null | undefined) {}
}
const tints = [new Tint(COLORS['cpc']), new Tint(COLORS['tsc']), new Tint(null), new Tint(undefined)];
for (const t of tints) console.log(JSON.stringify(t), t.tint === null, t.tint === undefined, String(t.tint));
