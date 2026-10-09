// A class given where an interface is taken, which it meets without naming it: its own members, read through the interface.
interface Measured {
  measureCount: number;
  readonly measured: boolean;
  label(): string;
}
class Box {
  measureCount = 0;
  get measured(): boolean {
    return this.measureCount > 0;
  }
  label(): string {
    return `box ${this.measureCount}`;
  }
}
function measure(view: Measured): string {
  view.measureCount++;
  return `${view.measured} ${view.label()}`;
}
const box = new Box();
console.log(measure(box), measure(box), box.measureCount);
const plain: Measured = { measureCount: 5, measured: true, label: () => 'plain' };
console.log(measure(plain), plain.measureCount);
