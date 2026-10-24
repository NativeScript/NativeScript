// A method an instance replaces, read as a value through a typed receiver: the instance's own function.
class Counter {
  count = 0;
  step(by: number): void {
    this.count += by;
  }
}

const plain = new Counter();
const own = new Counter();
own.step = (by: number) => {
  own.count += by * 10;
};
const steps = [plain.step, own.step];
steps[1](2);
const held = own.step;
held(1);
console.log(own.count, plain.count, typeof held);
