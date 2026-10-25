// Object.defineProperty on an untyped object that is a class instance, restricting a field its class declares: reads,
// writes (module code is strict: a refused write throws), keys, JSON and spread follow the descriptor.
class Counter {
  count = 0;
  label = 'counter';
  hidden = 'h';
  bump() { this.count++; return this.count; }
  rename(to: string) { this.label = to; }
}
class Timed extends Counter {
  started = 5;
  total: number;
  constructor() { super(); this.total = 10; }
}
function freeze(target: any, key: string) {
  Object.defineProperty(target, 'count', { value: target[key], writable: false });
}
function attempt(what: string, f: () => unknown) {
  try { console.log(what, f()); } catch (e) { console.log(what, (e as Error).constructor.name); }
}
const c = new Counter();
freeze(c, 'count');
attempt('bump', () => c.bump());
attempt('write', () => { c.count = 9; return c.count; });
attempt('keyed', () => { (c as any)['count'] = 7; return c.count; });
console.log(c.count, Object.keys(c).join(','), JSON.stringify(c));

const t = new Timed();
const held: any = t;
let reads = 0;
Object.defineProperty(held, 'label', {
  get() { reads++; return 'L:' + this.started; },
  set(v: string) { this.started = v.length; },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(held, 'hidden', { enumerable: false });
console.log(t.label, reads, t.hidden, Object.keys(t).join(','), JSON.stringify(t), { ...t });
t.rename('abcdefgh');
console.log(t.started, t.label, `${t.label}!`, t.label.length, reads);
attempt('total', () => { t.total += 1; return t.total; });

const o: unknown = new Counter();
Object.defineProperties(o, { count: { value: 3, enumerable: false }, label: { get: () => 'fixed' } });
const k = o as Counter;
attempt('relabel', () => { k.rename('x'); return k.label; });
console.log(k.count, k.label, Object.keys(k).join(','), JSON.stringify(k), Object.entries(k).length);
const d = Object.getOwnPropertyDescriptor(k, 'count');
console.log(d?.value, d?.writable, d?.enumerable, d?.configurable);
const plain = new Counter();
console.log(plain.bump(), plain.label, Object.keys(plain).join(','));
