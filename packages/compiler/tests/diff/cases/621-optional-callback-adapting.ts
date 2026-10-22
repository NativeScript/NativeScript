// @app-lenient
// A callback that returns undefined, or is given undefined for a boolean parameter, where another function type is
// expected (strict: false allows undefined in every type): the value passes through as undefined, never unwrapped.
function keep(xs: number[], pred: (x: number) => boolean) { return xs.filter(pred); }
const loose = (x: number): boolean => (x > 1 ? true : undefined);
console.log(keep([1, 2, 3], loose).join());
function each(xs: number[], f: (i: number, last: boolean) => string) { return xs.map((x, i) => f(x, i === xs.length - 1 ? true : undefined)); }
console.log(each([1, 2], (i: number, last: boolean) => `${i}:${last}`).join());
interface Options { closeCallback?: (result: string) => void }
function register(cb?: (result: unknown, extra: number) => void) { console.log(typeof cb); if (cb) cb('done', 1); }
function show(o: Options) { register(o.closeCallback); }
show({});
show({ closeCallback: (r) => console.log('closed', r) });
function numbers(make: (i: number) => number[]) { return make(1); }
console.log(numbers(() => null));
