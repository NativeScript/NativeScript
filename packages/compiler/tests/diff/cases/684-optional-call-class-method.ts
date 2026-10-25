// `obj.m?.()` on a program class's method: one the program never replaces, and one an instance replaces.
class Meter {
  total = 0;
  add(by: number): number {
    this.total += by;
    return this.total;
  }
}

class Dial {
  turns = 0;
  turn(by: number): void {
    this.turns += by;
  }
}

const meter = new Meter();
console.log(meter.add?.(2), meter.add?.(3));
const maybe: Meter | undefined = Math.random() > 2 ? meter : undefined;
console.log(maybe?.add?.(1));

const plain = new Dial();
const own = new Dial();
own.turn = (by: number) => {
  own.turns += by * 10;
};
plain.turn?.(1);
own.turn?.(2);
console.log(plain.turns, own.turns);
