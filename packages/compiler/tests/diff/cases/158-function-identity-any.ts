// @swift
// Function identity through untyped values and adapters: a function held as `any` and read back typed is the same
// function, a method value is one function per receiver, and a function adapted to another type (fewer parameters
// taken) is still the function it adapts.
type Callback = () => void;
type Listener = (value: number) => void;
let calls = 0;
const a: Callback = () => calls++;
const b: Callback = () => calls++;

const untyped: any = a;
const back: Callback = untyped;
const again: any = back;
console.log('through any', untyped === a, back === a, back === untyped, again === untyped, untyped === b);

class Registry {
  listeners: { fn: Listener }[] = [];
  add(fn: Listener) {
    if (!this.listeners.some((l) => l.fn === fn)) this.listeners.push({ fn });
  }
  remove(fn: Listener) {
    this.listeners = this.listeners.filter((l) => l.fn !== fn);
  }
}
const r = new Registry();
r.add(a);
r.add(a);
r.add(b);
console.log('adapted', r.listeners.length);
r.remove(a);
console.log('adapted removed', r.listeners.length, r.listeners[0].fn === b);

class Clicker {
  count = 0;
  click() {
    this.count++;
  }
}
const c = new Clicker();
const d = new Clicker();
const m = c.click;
const held: any = c.click;
console.log('method values', c.click === c.click, m === c.click, held === m, m === d.click);
r.add(c.click);
r.add(c.click);
r.remove(c.click);
console.log('method value removed', r.listeners.length);
