// Function identity where typed lists hold callbacks (core's GesturesObserver list, app listener lists): a method read as a value,
// an arrow held in a field and a local function each compare equal to themselves, so removal finds them.
type Handler = (n: number) => void;
class Entry {
  constructor(public callback: Handler, public context?: object) {}
}
class Source {
  entries: Entry[] = [];
  add(cb: Handler, ctx?: object) {
    if (this.entries.some((e) => e.callback === cb && e.context === ctx)) return;
    this.entries.push(new Entry(cb, ctx));
  }
  remove(cb: Handler, ctx?: object) {
    this.entries = this.entries.filter((e) => !(e.callback === cb && e.context === ctx));
  }
}
class Widget {
  hits = 0;
  arrow: Handler = (n) => {
    this.hits += n;
  };
  onTap(n: number) {
    this.hits += n;
  }
  attach(s: Source) {
    s.add(this.onTap, this);
  }
  detach(s: Source) {
    s.remove(this.onTap, this);
  }
}
const s = new Source();
const w = new Widget();
w.attach(s);
w.attach(s);
console.log('method ref added twice: entries =', s.entries.length);
w.detach(s);
console.log('method ref after detach: entries =', s.entries.length);
s.entries = [];
s.add(w.arrow);
s.add(w.arrow);
console.log('arrow field added twice: entries =', s.entries.length);
s.remove(w.arrow);
console.log('arrow field after remove: entries =', s.entries.length);
const local: Handler = (n) => {};
s.add(local);
s.remove(local);
console.log('local const after remove: entries =', s.entries.length);
const m = w.onTap;
console.log('method read twice is same:', w.onTap === w.onTap, 'stored copy same:', m === m);
