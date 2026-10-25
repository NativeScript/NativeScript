// Callbacks over a type parameter passed where a callback of another type goes: held as that type, called with what
// was given.
type Listener = (v: unknown) => void;

class Hub<T> {
  private listeners: Listener[] = [];
  on(fn: (v: T) => void): Listener {
    const l = fn as Listener;
    this.listeners.push(l);
    return l;
  }
  count(): number {
    return this.listeners.length;
  }
  emit(v: T): void {
    for (const l of this.listeners) l(v);
  }
}

function forEachOf<T>(items: T[], fn: (item: T, i: number) => void): void {
  items.forEach(fn);
}

const seen: string[] = [];
const hub = new Hub<string>();
const l = hub.on((s) => seen.push(s.toUpperCase()));
hub.emit('a');
forEachOf([1, 2], (n, i) => seen.push(`${n}@${i}`));
forEachOf(['x'], (s) => seen.push(s));
console.log(seen.join(), hub.count(), typeof l);
