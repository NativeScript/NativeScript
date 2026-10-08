// `unknown` narrowed by a truthiness test (to `{}`) is the same value, compared by identity.
class Holder {
  readonly native: unknown;
  constructor(readonly value: object) {
    this.native = value;
  }
  get same(): boolean {
    return !!this.native && this.value === this.native;
  }
}
const o = { a: 1 };
console.log(new Holder(o).same, new Holder({ a: 1 }).same);
const held: unknown = o;
if (held) {
  const narrowed = held;
  console.log(narrowed === o, typeof narrowed);
}
const empty: {} = 'text';
console.log(empty, typeof empty);
