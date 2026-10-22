// Callbacks a host calls (a delegate's method, a listener, a timer): one that throws is reported as uncaught,
// and the host goes on calling the others, and that one again.
(globalThis as any).__onUncaughtError = (e: unknown) => console.log('uncaught:', e instanceof Error ? `${e.name}: ${e.message}` : String(e));

interface ScrollDelegate {
  didScroll(offset: number): void;
}

class Host {
  private delegates: ScrollDelegate[] = [];
  private listeners = new Map<string, Array<(value: unknown) => void>>();
  add(delegate: ScrollDelegate) {
    this.delegates.push(delegate);
  }
  on(event: string, listener: (value: unknown) => void) {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }
  scroll(offset: number) {
    for (const d of this.delegates) setTimeout(() => d.didScroll(offset), 0);
    for (const l of this.listeners.get('scroll') ?? []) queueMicrotask(() => l(offset));
  }
}

class Strict implements ScrollDelegate {
  didScroll(offset: number) {
    if (offset > 100) throw new RangeError(`offset ${offset} out of range`);
    console.log('strict', offset);
  }
}

class Logger implements ScrollDelegate {
  didScroll(offset: number) {
    console.log('logger', offset);
  }
}

const host = new Host();
host.add(new Strict());
host.add(new Logger());
const none: any = null;
host.on('scroll', (value) => {
  const n = value as number;
  if (n > 100) console.log(none.x);
  console.log('listener', n);
});
host.scroll(50);
// Each scroll is queued after the delegate calls the one before queued, so the order is the same however slow the host.
setTimeout(() => {
  host.scroll(150);
  setTimeout(() => host.scroll(60), 0);
}, 0);
