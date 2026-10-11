// @swift
// Lifetimes of listeners: objects that subscribe a method to a long-lived source and unsubscribe it, or that keep
// one of their own methods as a field, are freed once dropped. Checked a task later, after a full collection where
// the runtime has one (Node runs with --expose-gc).
const gc = (globalThis as any).gc as (() => void) | undefined;
type Handler = (n: number) => void;
class Source {
  handlers: { fn: Handler; owner: object }[] = [];
  on(fn: Handler, owner: object) {
    this.handlers.push({ fn, owner });
  }
  off(fn: Handler, owner: object) {
    this.handlers = this.handlers.filter((h) => !(h.fn === fn && h.owner === owner));
  }
}
const source = new Source();
class Widget {
  hits = 0;
  onTap(n: number) {
    this.hits += n;
  }
  attach() {
    source.on(this.onTap, this);
  }
  detach() {
    source.off(this.onTap, this);
  }
}
class SelfHeld {
  handler: Handler;
  n = 0;
  constructor() {
    this.handler = this.update;
  }
  update(n: number) {
    this.n += n;
  }
}
const N = 50;
const widgets: WeakRef<Widget>[] = [];
const held: WeakRef<SelfHeld>[] = [];
function make() {
  for (let i = 0; i < N; i++) {
    const w = new Widget();
    w.attach();
    w.detach();
    widgets.push(new WeakRef(w));
    const s = new SelfHeld();
    s.handler(1);
    held.push(new WeakRef(s));
  }
}
make();
console.log('subscribed after detach:', source.handlers.length);
setTimeout(() => {
  gc?.();
  console.log('widgets alive:', widgets.filter((r) => r.deref() !== undefined).length);
  console.log('self-held method values alive:', held.filter((r) => r.deref() !== undefined).length);
}, 0);
