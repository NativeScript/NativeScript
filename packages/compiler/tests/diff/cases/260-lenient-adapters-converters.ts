// @lenient-both
// As core is checked, without strictNullChecks: a callback adapted to another function type, present or missing;
// a boolean declared without a value is a presence test; untyped values read as declared types.
interface EventData {
  eventName: string;
  object: any;
}
class Observable {
  private listeners: ((data: EventData) => void)[] = [];
  on(callback?: (data: EventData) => void) {
    if (callback) this.listeners.push(callback);
  }
  notify(data: EventData) {
    this.listeners.forEach((l) => l(data));
  }
  get count() {
    return this.listeners.length;
  }
}
const observable = new Observable();
const log: string[] = [];
function wire(callback?: () => void) {
  observable.on(callback);
}
wire(() => log.push('changed'));
wire(undefined);
observable.notify({ eventName: 'x', object: null });
console.log(log.join(','), observable.count);

let cached: boolean;
function enabled(): boolean {
  if (typeof cached === 'boolean') return cached;
  cached = log.length > 0;
  return typeof cached !== 'undefined' ? cached : false;
}
console.log(enabled(), enabled());

const options: any = { name: 'n', size: 12, flag: true, items: ['a', 'b'], when: null };
const name: string = options.name;
const size: number = options.size;
const flag: boolean = options.flag;
const items: string[] = options.items;
const none: string[] = options.when;
console.log(name, size + 1, flag, items.length, items[1], none == null);
