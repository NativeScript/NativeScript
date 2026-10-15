// @lenient
// A callback adapted to another function type is still the same function: on/off/once across adapted and plain paths,
// a local function that unsubscribes itself (core's accessibility-common), and an EventTarget-style listener list.
interface EventData {
  eventName: string;
  object: any;
}
interface ListenerEntry {
  callback: (data: EventData) => void;
  thisArg?: any;
  once?: true;
}
class Observable {
  private _observers: { [eventName: string]: Array<ListenerEntry> } = {};
  public on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
    this.addEventListener(eventName, callback, thisArg);
  }
  public once(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
    this.addEventListener(eventName, callback, thisArg, true);
  }
  public off(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
    this.removeEventListener(eventName, callback, thisArg);
  }
  public addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
    once = once || undefined;
    thisArg = thisArg || undefined;
    let list = this._observers[eventName];
    if (!list) {
      list = [];
      this._observers[eventName] = list;
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].callback === callback && list[i].thisArg === thisArg) return;
    }
    list.push({ callback, thisArg, once });
  }
  public removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
    thisArg = thisArg || undefined;
    const entries = this._observers[eventName];
    if (!entries) return;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (callback && (entry.callback !== callback || entry.thisArg !== thisArg)) continue;
      entries.splice(i, 1);
      i--;
    }
    if (!entries.length) delete this._observers[eventName];
  }
  public notify(data: EventData): void {
    const list = this._observers[data.eventName];
    if (!list) return;
    for (let i = list.length - 1; i >= 0; i--) {
      const entry = list[i];
      if (entry.once) this.removeEventListener(data.eventName, entry.callback, entry.thisArg);
      entry.callback.apply(entry.thisArg, [data]);
    }
  }
  public count(eventName: string): number {
    const list = this._observers[eventName];
    return list ? list.length : 0;
  }
}

const log: string[] = [];
const shared = new Observable();

// A local function taking no arguments, given where (data) => void is taken, that removes itself.
function subscribe(tag: string) {
  let calls = 0;
  function callback() {
    calls++;
    log.push(tag);
    if (calls > 0) {
      shared.off('changed', callback);
    }
  }
  shared.on('changed', callback);
  shared.on('changed', callback);
}
subscribe('changed');
shared.notify({ eventName: 'changed', object: shared });
shared.notify({ eventName: 'changed', object: shared });
console.log(log.join(','), shared.count('changed'));

// Adapted on, adapted off, from outside the function.
let hits = 0;
function bump() {
  hits++;
}
shared.on('a', bump);
shared.on('a', bump);
console.log('adapted twice: entries =', shared.count('a'));
shared.off('a', bump);
console.log('adapted off: entries =', shared.count('a'));

// A typed handler on, off through an untyped value and through a typed one.
const typed = (d: EventData) => {
  hits += 10;
};
shared.on('b', typed);
const untyped: any = typed;
shared.off('b', untyped);
console.log('typed on, untyped off: entries =', shared.count('b'));
shared.on('b', untyped);
shared.off('b', typed);
console.log('untyped on, typed off: entries =', shared.count('b'));

// An arrow of fewer parameters held in a variable, adapted each time it is passed.
const noArgs = () => {
  hits += 100;
};
shared.on('c', noArgs);
shared.off('c', noArgs);
console.log('arrow adapted on/off: entries =', shared.count('c'));

// A function whose last parameters have defaults, given where fewer are passed: called by name, still itself.
function retry(data: EventData, attempt = 0) {
  hits += 1000 + attempt;
}
shared.on('e', retry);
shared.on('e', retry);
shared.off('e', retry);
console.log('defaults adapted on/off: entries =', shared.count('e'));

// once: adapted, then removed before firing, and fired once.
shared.once('d', bump);
shared.off('d', bump);
shared.notify({ eventName: 'd', object: shared });
shared.once('d', bump);
shared.notify({ eventName: 'd', object: shared });
shared.notify({ eventName: 'd', object: shared });
console.log('once: entries =', shared.count('d'), 'hits =', hits);

// The same function converted twice compares equal.
const asData1: (d: EventData) => void = bump;
const asData2: (d: EventData) => void = bump;
console.log('converted twice ===', asData1 === asData2, asData1 !== asData2);
const asAny1: any = bump;
const asAny2: any = bump;
console.log('boxed twice ===', asAny1 === asAny2);
function same(a: (d: EventData) => void, b: () => void) {
  return a === (b as any);
}
console.log('across parameters ===', same(bump, bump));

// EventTarget-style: listener objects or functions, removed by the same value.
type Listener = ((e: { type: string }) => void) | { handleEvent(e: { type: string }): void };
class Target {
  private listeners: { [type: string]: Listener[] } = {};
  addEventListener(type: string, listener: Listener) {
    const list = this.listeners[type] || (this.listeners[type] = []);
    for (const l of list) if (l === listener) return;
    list.push(listener);
  }
  removeEventListener(type: string, listener: Listener) {
    const list = this.listeners[type];
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      if (list[i] === listener) {
        list.splice(i, 1);
        return;
      }
    }
  }
  dispatchEvent(e: { type: string }) {
    for (const l of (this.listeners[e.type] || []).slice()) {
      if (typeof l === 'function') l(e);
      else l.handleEvent(e);
    }
  }
  size(type: string) {
    return (this.listeners[type] || []).length;
  }
}
const t = new Target();
let got = 0;
function onPing() {
  got++;
}
t.addEventListener('ping', onPing);
t.addEventListener('ping', onPing);
t.dispatchEvent({ type: 'ping' });
t.removeEventListener('ping', onPing);
t.dispatchEvent({ type: 'ping' });
console.log('EventTarget: size =', t.size('ping'), 'got =', got);
const obj = { handleEvent(e: { type: string }) { got += 10; } };
t.addEventListener('ping', obj);
t.removeEventListener('ping', obj);
console.log('EventTarget object: size =', t.size('ping'));

// Lifetimes: a nested function subscribed and removed again (by itself, or by its scope) keeps nothing alive.
class Payload {
  size = 1;
}
const gc = (globalThis as any).gc as (() => void) | undefined;
const payloads: WeakRef<Payload>[] = [];
function attach(source: Observable) {
  const payload = new Payload();
  payloads.push(new WeakRef(payload!));
  function listener() {
    hits += payload!.size;
    source.off('life', listener);
  }
  function other() {
    hits += payload!.size;
  }
  source.on('life', listener);
  source.on('other', other);
  source.off('other', other);
}
const life = new Observable();
for (let i = 0; i < 20; i++) attach(life);
console.log('life listeners:', life.count('life'), 'other listeners:', life.count('other'));
life.notify({ eventName: 'life', object: life });
console.log('life listeners after firing:', life.count('life'));
setTimeout(() => {
  gc?.();
  console.log('payloads alive:', payloads.filter((r) => r.deref() !== undefined).length);
}, 0);
