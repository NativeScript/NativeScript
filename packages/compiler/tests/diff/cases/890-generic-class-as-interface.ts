// An app's generic class held as a generic interface it implements: calls through the interface reach the class's
// methods, and the value stays the same object.
interface Source<T> {
  read(): T;
  write(value: T): void;
  readonly size: number;
}
class Relay<T> implements Source<T> {
  private items: T[] = [];
  constructor(private readonly fallback: T) {}
  read(): T {
    return this.items.length ? this.items[this.items.length - 1] : this.fallback;
  }
  write(value: T): void {
    this.items.push(value);
  }
  get size(): number {
    return this.items.length;
  }
}
const relay = new Relay<string>('none');
const s: Source<string> = relay;
console.log(s.read(), s.size);
s.write('a');
relay.write('b');
console.log(s.read(), s.size, relay.read(), s === relay);
function drain<T>(source: Source<T>): T {
  const v = source.read();
  source.write(v);
  return v;
}
console.log(drain(new Relay<number>(7)), drain(s), relay.size);
const sources: Source<number>[] = [new Relay<number>(1), new Relay<number>(2)];
sources[1].write(5);
console.log(sources.map((x) => x.read() + x.size).join(','));
