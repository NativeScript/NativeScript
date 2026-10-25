// An app's generic class whose fields and getters typed by its type parameter meet a generic interface it implements.
interface Box<T> {
  value: T;
  readonly current: T;
  readonly count: number;
}
class Cell<T> implements Box<T> {
  count = 0;
  constructor(public value: T) {}
  get current(): T {
    return this.value;
  }
}
const cell = new Cell<string>('a');
const box: Box<string> = cell;
box.value = 'b';
console.log(box.value, box.current, cell.value, box === cell);
function swap<T>(b: Box<T>, v: T): T {
  const old = b.current;
  b.value = v;
  return old;
}
console.log(swap(box, 'c'), cell.current, swap(new Cell<number>(1), 2));
const boxes: Box<number>[] = [new Cell<number>(3), new Cell<number>(4)];
boxes[0].value += 10;
console.log(boxes.map((b) => b.current + b.count).join(','));
