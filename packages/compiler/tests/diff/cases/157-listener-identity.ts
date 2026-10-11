// @lenient
// Core Observable's listener bookkeeping (data/observable/index.ts, its logic verbatim), translated as core is: on/off,
// once per handler, a method with its thisArg, and a () => void handler passed where (data) => void is taken (CssState).
interface EventData {
  eventName: string;
  object: any;
}
interface ListenerEntry {
  callback: (data: EventData) => void;
  thisArg?: any;
  once?: true;
  _isRemoved?: true;
}
class Observable {
  private _observers: { [eventName: string]: Array<ListenerEntry> } = {};
  public on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
    this.addEventListener(eventName, callback, thisArg);
  }
  public off(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
    this.removeEventListener(eventName, callback, thisArg);
  }
  public addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
    once = once || undefined;
    thisArg = thisArg || undefined;
    const list = this._getEventList(eventName, true);
    if (Observable._indexOfListener(list, callback, thisArg) !== -1) {
      return;
    }
    list.push({ callback, thisArg, once });
  }
  public removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
    thisArg = thisArg || undefined;
    const entries = this._observers[eventName];
    if (!entries) {
      return;
    }
    Observable.innerRemoveEventListener(entries, callback, thisArg);
    if (!entries.length) {
      delete this._observers[eventName];
    }
  }
  public notify(data: EventData): void {
    const list = this._observers[data.eventName];
    if (!list) return;
    for (let i = list.length - 1; i >= 0; i--) {
      const entry = list[i];
      entry.callback.apply(entry.thisArg, [data]);
    }
  }
  public count(eventName: string): number {
    const list = this._observers[eventName];
    return list ? list.length : 0;
  }
  private static innerRemoveEventListener(entries: Array<ListenerEntry>, callback?: (data: EventData) => void, thisArg?: any): void {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (thisArg && (entry.callback !== callback || entry.thisArg !== thisArg)) {
        continue;
      }
      if (callback && entry.callback !== callback) {
        continue;
      }
      entry._isRemoved = true;
      entries.splice(i, 1);
      i--;
    }
  }
  private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> | undefined {
    let list = <Array<ListenerEntry>>this._observers[eventName];
    if (!list && createIfNeeded) {
      list = [];
      this._observers[eventName] = list;
    }
    return list;
  }
  private static _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any): number {
    thisArg = thisArg || undefined;
    for (let i = 0, length = list.length; i < length; i++) {
      const entry = list[i];
      if (entry.callback === callback && entry.thisArg === thisArg) {
        return i;
      }
    }
    return -1;
  }
}

let fired = 0;
const handler = (d: EventData) => {
  fired++;
};
const o = new Observable();
o.on('tap', handler);
o.on('tap', handler);
console.log('same handler added twice: entries =', o.count('tap'));
o.off('tap', handler);
console.log('after off(handler): entries =', o.count('tap'));
o.notify({ eventName: 'tap', object: o });
console.log('fired after off =', fired);

class Owner {
  hits = 0;
  onTap(d: EventData) {
    this.hits++;
  }
}
const owner = new Owner();
o.on('x', owner.onTap, owner);
o.off('x', owner.onTap, owner);
console.log('method with thisArg, after off: entries =', o.count('x'));

// CssState: () => void handed where (data) => void is taken.
class State {
  _onChange: () => void;
  n = 0;
  constructor() {
    this._onChange = () => this.update();
  }
  update() {
    this.n++;
  }
}
const st = new State();
for (let i = 0; i < 3; i++) {
  o.addEventListener('classChange', st._onChange);
  o.removeEventListener('classChange', st._onChange);
}
console.log('CssState-style subscribe/unsubscribe x3: entries =', o.count('classChange'));
o.off('tap');
console.log('off(event) without callback: entries =', o.count('tap'));
