// A method an instance can replace, called on a receiver with effects (a call, a getter): the receiver is evaluated once.
class Lamp {
  level = 0;
  set(to: number): number {
    this.level = to;
    return to;
  }
}

const lamps = [new Lamp(), new Lamp()];
lamps[1].set = (to: number) => {
  lamps[1].level = to * 100;
  return -to;
};
let reads = 0;
function lamp(k: number): Lamp {
  reads++;
  return lamps[k];
}
class Room {
  picks = 0;
  get current(): Lamp {
    this.picks++;
    return lamps[this.picks % 2];
  }
}

console.log(lamp(0).set(3), lamp(1).set(4), reads);
lamp(1).set(5);
const room = new Room();
console.log(room.current.set(6), room.current.set(7), room.picks);
console.log(lamps[0].level, lamps[1].level, reads);

function checked(k: number): Lamp {
  if (k > 1) throw new RangeError('no lamp ' + k);
  reads++;
  return lamps[k];
}
const fromCall = checked(1).set;
console.log(fromCall(8), lamps[1].level, reads);
try {
  const missing = checked(2).set;
  console.log(typeof missing);
} catch (err) {
  console.log((err as Error).message);
}
