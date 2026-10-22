// A function expression with a `this` parameter, passed as a callback its caller invokes with call(): this is the
// object call() names (rxjs schedulers reschedule through this.schedule()).
interface Action { n: number; schedule(state: number): void }
function schedule(work: (this: Action, state: number) => void, state: number) {
  const action: Action = { n: 0, schedule(s) { if (s < 3) work.call(action, s + 1); } };
  work.call(action, state);
  return action.n;
}
console.log(schedule(function (this: Action, s) { this.n += s; console.log('run', s, this.n); this.schedule(s); }, 1));
const bound = function (this: { tag: string }, x: number) { return `${this.tag}${x}`; };
console.log(bound.call({ tag: 't' }, 1), bound.apply({ tag: 'u' }, [2]));
// One reading a `this` it does not declare is given the receiver all the same (rxjs scheduleArray:
// `scheduler.schedule(function () { … this.schedule(); })`).
class Queue {
  schedule(work: (this: Action, state: number) => void, delay?: number, state?: number): number { return schedule(work, state ?? 0); }
}
const input = ['a', 'b', 'c'];
let i = 0;
console.log(new Queue().schedule(function () { console.log('item', input[i++]); this.n += 1; if (i < input.length) this.schedule(i); }));
const queue = new Queue();
console.log(queue.schedule(function (s) { this.n += 10; console.log('delayed', s, this.n); this.schedule(s); }, 5, 1));
