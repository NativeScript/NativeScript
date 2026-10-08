// @lenient
// Function values as core holds and calls them: fields typed by an interface's
// methods, methods bound to their object, call/apply on typed callbacks, and
// fields of function types that return undefined.
interface Events {
  on(name: string, callback: (data: string) => void, thisArg?: any): void;
  notify(name: string, data?: string): number;
}

class Hub {
  log: string[] = [];
  handlers = new Map<string, ((data: string) => void)[]>();
  on(name: string, callback: (data: string) => void, thisArg?: any): void {
    this.log.push(`on ${name} ${thisArg === undefined ? 'no this' : thisArg}`);
    const list = this.handlers.get(name) ?? [];
    list.push(callback);
    this.handlers.set(name, list);
  }
  notify(name: string, data?: string): number {
    const list = this.handlers.get(name) ?? [];
    for (const h of list) h(data ?? 'none');
    return list.length;
  }
}

const hub = new Hub();

class App {
  static on: Events['on'] = hub.on.bind(hub);
  notify: Events['notify'] = hub.notify.bind(hub);
  private resolver: (name: string) => string | undefined = null;
  private factory: (n: number) => number;
  static fallback: () => string = undefined;

  setResolver(r: (name: string) => string) {
    this.resolver = r;
  }
  resolve(name: string): string {
    return this.resolver ? this.resolver(name) : 'unresolved';
  }
  scale(n: number): number {
    return this.factory ? this.factory(n) : n;
  }
  greet(who: string): string {
    return `hello ${who}`;
  }
  private check() {
    this.checks++;
  }
  boundGreet(): string {
    const g = this.greet.bind(this);
    return g('me');
  }
  run(cb: (this: any, x: number) => string): string {
    return cb.call(this, this.checks);
  }
  checks = 0;
  checked(): number {
    this.check?.();
    this.check?.();
    return this.checks;
  }
}

App.on('tap', (d) => console.log('tapped', d));
App.on('tap', (d) => console.log('tapped again', d), 'self');
const app = new App();
console.log(app.notify('tap'), app.notify('tap', 'x'), app.notify('none'));
console.log(hub.log.join('; '));
console.log(app.resolve('a'), App.fallback ? 'set' : 'unset');
app.setResolver((n) => n.toUpperCase());
console.log(app.resolve('a'), app.scale(3), app.checked());
console.log(app.boundGreet(), app.run((x) => `ran ${x}`));

const greet = app.greet.bind(app);
const notify = hub.notify.bind(hub);
console.log(greet('bound'), typeof greet, notify('tap', 'y'));

function apply(callback: (this: any, a: number, b?: number) => number, self: any): string {
  const viaCall = callback.call(self, 2, 3);
  const viaApply = callback.apply(self, [4, 5]);
  const viaPartial = callback.call(self, 6);
  return `${viaCall} ${viaApply} ${viaPartial}`;
}
console.log(apply((a, b?) => a * (b ?? 10), null));

const add = (a: number, b: number) => a + b;
const addTen = add.bind(null, 10);
console.log(addTen(5), add.call(undefined, 1, 2));

const untyped: any = hub;
const untypedNotify = untyped.notify.bind(untyped, 'tap');
console.log(untypedNotify('z'), untyped.notify.call(untyped, 'none'));

const total = [1, 2, 3].reduce((sum: number, v: number, i: number, a: number[]) => sum + v * a.length + i, 0);
const right = [1, 2, 3].reduceRight((acc: number, v: number, i: number, a: number[]) => acc * 10 + v + a.length - i);
const nested = [[1], [2, 3]].flatMap((v, i, a) => [v.length, a.length]);
console.log(total, right, nested.join(','));

const lookups: any = { win: { name: 'main' } };
function windowOf(state: string): string {
  const read = (k: string) => lookups[k];
  if (state === 'attached' && read('win')) return 'has window';
  if (state === 'missing' || read('none')) return 'never';
  return 'none';
}
console.log(windowOf('attached'), windowOf('detached'));

function wrap(fn: Function) {
  return function (...args) {
    return fn(...args);
  };
}
const queued = new Map<number, () => void>();
queued.set(1, wrap(() => console.log('queued ran')));
queued.get(1)();
const pair: (a: string, b: string) => void = wrap((a: string, b: string) => console.log('pair', a, b));
pair('x', 'y');
try {
  queued.get(2)();
} catch (e) {
  console.log(e instanceof TypeError);
}

function retry(attempt = 0, label?: string): void {
  console.log('retry', attempt, label === undefined);
}
function later(callback: () => void) {
  callback();
}
later(retry);

class Counter3 {
  n = 0;
  add(k: number): number {
    this.n += k;
    return this.n;
  }
}
const counter3 = new Counter3();
const add3 = counter3.add;
console.log(add3.call(counter3, 2), add3.apply(counter3, [3]));
