// @lenient
// Updates of an untyped object's members, as core's profiler writes them.
const timers: { [name: string]: any } = {};
function start(name: string) {
  let info = timers[name];
  if (info) {
    info.runCount++;
  } else {
    info = { count: 0, runCount: 1, label: 'x' };
    timers[name] = info;
  }
}
start('a');
start('a');
const info = timers['a'];
info.count += 2;
++info.count;
info.label += 'y';
info['count'] *= 3;
const before = info.runCount--;
console.log(info.count, info.runCount, info.label, before, -info.count);

const counters: any = { hits: 0 };
let k = 'hits';
counters[k] += 5;
counters[k]--;
const n = ++counters.hits;
counters.misses ||= 7;
counters.hits &&= counters.hits * 2;
counters.flags |= 4;
console.log(n, JSON.stringify(counters));

const problems: string[] = [];
function report(message: string) {
  problems.push(message);
}
function parse(text: string) {
  if (!text) return report('empty');
  if (text === '!') return report('bang');
  return text.split(',');
}
const anyResult = (): any => report('any');
console.log(parse('a,b'), parse(''), parse('!') === undefined, anyResult(), problems.join(' '));

const extras = [];
extras.push('b', 'c');
function classNames(): string[] {
  return ['a', ...extras];
}
console.log(classNames().join(' '), classNames().length);

const held: { instance: WeakRef<any>; property: string } = { instance: new WeakRef(timers), property: 'a' };
console.log(held.instance.deref() === timers, held.property);
const primitive: any = 5;
try {
  new WeakRef(primitive);
} catch (e) {
  console.log('weak', e instanceof TypeError);
}

function twice(text: string) {
  var m = /^(\w+)/.exec(text);
  if (!m) return 'none';
  var first = m[1];
  var m = /(\w+)$/.exec(text);
  return first + '/' + (m ? m[1] : '');
}
console.log(twice('alpha beta'), twice('!'));

function listen(name: string, once?: boolean): string {
  once = once || undefined;
  const flag = once && null;
  return `${name} ${once} ${flag}`;
}
console.log(listen('a'), listen('b', false), listen('c', true));

const sizes = new Map<string, number>([['small', 0.85]]);
function scaled(size: number): number {
  return size * 2;
}
console.log(scaled(sizes.get('small')), scaled(sizes.get('huge')), sizes.get('huge') === undefined, sizes.get('small') || 1);

function memberName(key: any, prefix: string): string {
  const name: string = prefix + key?.toString();
  return `${name} ${key?.toString() === undefined}`;
}
console.log(memberName('size', 'View.'), memberName(undefined, 'View.'));

const loader: any = {
  load(path: string, done: any) {
    done(path.length);
  },
};
function readLength(path: string): Promise<number> {
  return new Promise<number>((resolve) => {
    loader.load(path, resolve);
  });
}
readLength('abcd').then((n) => console.log('read', n));
let finish: any;
const finished = new Promise<void>((resolve) => {
  finish = resolve;
});
finished.then(() => console.log('finished'));
finish();

function serialize(data: any): any {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => [key, typeof value === 'number' ? value * 10 : null])
      .filter(([, value]) => value !== null),
  );
}
console.log(JSON.stringify(serialize({ a: 1, b: 'x', c: 2 })));
function firstPair(pairs: any): string {
  const [[firstKey, firstValue]] = pairs;
  return `${firstKey} ${firstValue}`;
}
console.log(firstPair([['k', 1]]));

function closeAll(count: number): Promise<void[]> {
  const toClose = [];
  for (let i = 0; i < count; i++) toClose.push(Promise.resolve());
  return Promise.all(toClose);
}
closeAll(3).then((done) => console.log('closed', done.length));
const mixed = [];
mixed.push(Promise.resolve(1), 2);
Promise.all(mixed).then((values) => console.log('mixed', values.join(',')));
function settleLater(): Promise<void> {
  return new Promise((resolve) => {
    if (problems.length >= 0) {
      return Promise.resolve(1).then(() => {
        console.log('then ran');
        resolve();
      });
    }
    resolve();
  });
}
settleLater().then(() => console.log('settled'));
