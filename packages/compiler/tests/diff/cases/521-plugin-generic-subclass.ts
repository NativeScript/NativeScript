// @plugin
// An app's classes extending a plugin's generic ones with types of their own, overriding members typed by the
// plugin's type parameters, and an app's typed values going in and out of the plugin's generic functions and fields.
import { Store, Stream, Subject, ValueSubject, mapTo } from './helpers/plugin/stream.ts';

interface Counter {
  count: number;
  label: string;
}

class CounterStore extends Store<Counter> {
  constructor() {
    super({ count: 0, label: 'start' });
  }
  protected reduce(previous: Counter, next: Counter): Counter {
    return { count: previous.count + next.count, label: next.label };
  }
  increment(by: number) {
    this.setState({ count: by, label: `+${by}` });
  }
}

class Names extends Subject<string> {
  shout(name: string) {
    this.next(name.toUpperCase());
  }
}

const store = new CounterStore();
const off = store.select((s) => s.count).subscribe((n) => console.log('count', n * 2));
store.select((s) => s.label).subscribe((l) => console.log('label', l.length, l));
store.increment(2);
store.increment(3);
off();
store.increment(1);
console.log(store.snapshot.count, store.snapshot.label, store.history.length, store.history[0].label);

const names = new Names();
names.pipe(mapTo((s: string) => s.length)).subscribe((n) => console.log('length', n + 1));
names.subscribe((s) => console.log('name', s));
names.shout('ada');

const total = new ValueSubject<number[]>([1, 2]);
total.subscribe((xs) => console.log('sum', xs.reduce((a, b) => a + b, 0)));
total.next([...total.value, 3]);
console.log(total.value.length);

const streams: Stream<number>[] = [new Subject<number>(), total.pipe(mapTo((xs) => xs.length))];
console.log(streams.length);
