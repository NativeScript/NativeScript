// Typed function values handed to code that holds them untyped and calls them through `apply`, `call` and `bind`, as
// core's `addDelegateHandler` keeps an app's handlers in a `Function[]` and runs each with `handler.apply(this, args)`.
interface Window {
  width: number;
}
interface Delegate {
  orientations(app: string, window: Window | null): number;
  opened(url: string): boolean;
  ready(): void;
}

class Host {
  name = 'host';
  private handlers = new Map<string, Function[]>();
  add<K extends keyof Delegate>(name: K, handler: Delegate[K]): void {
    if (typeof handler !== 'function') return;
    const list = this.handlers.get(name) ?? [];
    list.push(handler);
    this.handlers.set(name, list);
  }
  run(name: string, ...args: any[]): any {
    let result: any;
    for (const handler of this.handlers.get(name) ?? []) {
      result = handler.apply(this, args);
    }
    return result;
  }
  callEach(name: string, a: any, b: any): any[] {
    return (this.handlers.get(name) ?? []).map((h) => h.call(this, a, b));
  }
  bound(name: string, a: any): any[] {
    return (this.handlers.get(name) ?? []).map((h) => h.bind(this, a)(undefined));
  }
}

const host = new Host();
host.add('orientations', (_app: string, window: Window | null) => ((window?.width ?? 0) < 600 ? 2 : 30));
host.add('orientations', (app: string) => app.length);
host.add('orientations', () => 7);
function held(app: string, window: Window | null): number {
  return 100 + app.length + (window ? 1 : 0);
}
host.add('orientations', held);
class Lock {
  mask = 5;
  orientations(app: string, window: Window | null) {
    return this.mask + app.length + (window?.width ?? -1);
  }
}
const lock = new Lock();
host.add('orientations', lock.orientations.bind(lock));
host.add('orientations', function (this: any, app: string) {
  return this.name.length * 1000 + app.length;
});

const narrow: Window = { width: 375 };
const wide: Window = { width: 800 };
console.log('apply', host.run('orientations', 'ab', narrow));
console.log('call', host.callEach('orientations', 'xyz', wide).join(' '));
console.log('bind', host.bound('orientations', 'q').join(' '));

host.add('opened', (url: string) => url.startsWith('https:'));
console.log('opened', host.run('opened', 'https://x'), host.run('opened', 'ftp://y'));
let readies = 0;
host.add('ready', () => {
  readies++;
});
console.log('ready', host.run('ready'), readies);

// The same values reached through `any` and `Function`.
const asAny: any = (n: number, m: number) => n * m;
const asFunction: Function = (s: string) => s.toUpperCase();
const method: (n: number) => number = (n: number) => n + lock.mask;
console.log('any', asAny.apply(null, [6, 7]), asAny.call(undefined, 2, 3), asAny.bind(null, 4)(5));
console.log('Function', asFunction.apply(null, ['up']), asFunction.call(null, 'call'), asFunction.bind(null)('bound'));
const viaAny: any = method;
console.log('typed via any', viaAny.apply(null, [1]), viaAny.call(null, 2), viaAny.bind(null, 3)());
console.log('typed direct', method.apply(null, [10]), method.call(null, 20), method.bind(null, 30)());
console.log('typeof', typeof asAny, typeof asFunction.bind(null), typeof viaAny.bind(null));
