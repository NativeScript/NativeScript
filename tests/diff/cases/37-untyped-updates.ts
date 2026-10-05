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
