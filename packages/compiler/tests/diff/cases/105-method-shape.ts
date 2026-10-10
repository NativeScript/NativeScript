// A class's object where a shape of only methods is taken: its methods, called on it.
class Queue {
  items: number[] = [];
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  take(n: number): number {
    return this.items.splice(0, n).length;
  }
}
function drain(q: { isEmpty(): boolean; take(n: number): number }): number {
  let taken = 0;
  while (!q.isEmpty()) taken += q.take(2);
  return taken;
}
const q = new Queue();
q.items.push(1, 2, 3, 4, 5);
console.log(drain(q), q.items.length, q.isEmpty());
// A shape of a member and a method: the member read from the object, the method called on it.
class Holder {
  readonly box = { n: 4 };
  count = 9;
  double(): number {
    return this.box.n * 2;
  }
}
function use(h: { box: { n: number }; double(): number }): string {
  return `${h.box.n} ${h.double()}`;
}
console.log(use(new Holder()));
