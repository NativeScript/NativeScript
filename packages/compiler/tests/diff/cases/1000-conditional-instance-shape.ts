// A class's object through a conditional whose other branch is untyped, given where a shape of a field and a method
// is taken: the method called on the object, and the object made once.
class Holder {
  readonly box = { n: 4 };
  count = 9;
  constructor() {
    console.log('made');
  }
  double(): number {
    return this.box.n * 2;
  }
}
type Shape = { box: { n: number }; double(): number };
function use(h: Shape): string {
  return `${h.box.n} ${h.double()}`;
}
const pick = Math.random() > 2;
const other: any = { box: { n: 1 }, double: () => 0 };
console.log(use(pick ? other : new Holder()));
console.log(use(pick ? (other as Shape) : new Holder()));
console.log(use(!pick ? (other as any as Shape) : new Holder()));
const kept: Shape = pick ? other : new Holder();
console.log(kept.double(), kept.box.n);
