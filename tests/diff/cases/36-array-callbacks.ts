// Array callbacks that take the array as their third argument; module constants initialized by updates.
const xs = [3, 1, 4, 1, 5];
console.log(xs.find((v, i, a) => v > a[0]), xs.findIndex((v, i, a) => a.length - i === 2));
console.log(xs.some((v, i, a) => v === a[a.length - 1] && i > 0), xs.every((v, i, a) => a.indexOf(v) <= i));
console.log(xs.filter((v, i, a) => a.indexOf(v) === i).join(','), xs.map((v, i, a) => v + a.length).join(','));
const seen: string[] = [];
xs.forEach((v, i, a) => seen.push(`${v}/${a.length}`));
console.log(seen.join(' '));
class Holder {
  items = ['a', 'b', 'c'];
  matches(): boolean {
    return this.items.every((value: string, index: number, array: string[]) => array === this.items && value === this.items[index]);
  }
  where(name: string): number {
    return this.items.findIndex((value, index, array) => array[index] === name);
  }
}
console.log(new Holder().matches(), new Holder().where('c'));

let made = 0;
const first = ++made;
const second = ++made;
console.log(made, first, second);
const logged: string[] = [];
const note = (s: string): void => {
  logged.push(s);
};
const untypedNote = (s: string): any => note(s);
function noted(s: string): any {
  return note(s);
}
console.log(untypedNote('a'), noted('b'), logged.join(''));
function retried(attempt = 0, label?: string): void {
  console.log('retried', attempt, label === undefined);
}
function runLater(callback: () => void) {
  callback();
}
runLater(retried);
function changed(sizes: Set<number>): string {
  const populated = sizes.size > 0;
  sizes.clear();
  return `${populated !== sizes.size > 0} ${populated === sizes.size >= 0} ${1 < 2 === true}`;
}
console.log(changed(new Set([1])));
function redeclared(n: number): number {
  var total = n;
  var total = total * 2;
  return total;
}
console.log(redeclared(4));
const settings = { size: 1 };
let counter = 10;
const sizeAtLoad = settings.size;
const counterAtLoad = counter;
const doubled = [counter * 2, settings.size + 1];
class Defaults {
  static size = settings.size;
  static readonly limit = 3;
  static half = Defaults.limit / 2;
}
enum Mode {
  On = 1,
}
const modeAtLoad = Mode.On + Math.floor(Math.PI);
settings.size = 5;
counter = 20;
console.log(sizeAtLoad, counterAtLoad, doubled.join(','), Defaults.size, Defaults.half, modeAtLoad);
