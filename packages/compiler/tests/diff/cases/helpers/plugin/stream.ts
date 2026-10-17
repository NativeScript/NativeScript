// A plugin's generic classes in the shape of a reactive library: a subclass passing its parameter on, a subject
// holding a value of it, operators as generic functions, and a store an app extends with its own state type.
export type Listener<T> = (value: T) => void;

export class Subscription<T> {
  constructor(public listener: Listener<T>) {}
}

export class Stream<T> {
  protected subscriptions: Subscription<T>[] = [];
  subscribe(listener: Listener<T>): () => void {
    const subscription = new Subscription(listener);
    this.subscriptions.push(subscription);
    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    };
  }
  protected emit(value: T) {
    for (const s of this.subscriptions) s.listener(value);
  }
  pipe<R>(op: (source: Stream<T>) => Stream<R>): Stream<R> {
    return op(this);
  }
}

export class Subject<T> extends Stream<T> {
  next(value: T) {
    this.emit(value);
  }
}

export class ValueSubject<T> extends Subject<T> {
  constructor(private current: T) {
    super();
  }
  get value(): T {
    return this.current;
  }
  next(value: T) {
    this.current = value;
    super.next(value);
  }
}

export function mapTo<T, R>(project: (value: T) => R): (source: Stream<T>) => Stream<R> {
  return (source) => {
    const out = new Subject<R>();
    source.subscribe((v) => out.next(project(v)));
    return out;
  };
}

export abstract class Store<S> {
  protected state: ValueSubject<S>;
  history: S[] = [];
  constructor(initial: S) {
    this.state = new ValueSubject(initial);
  }
  get snapshot(): S {
    return this.state.value;
  }
  select<R>(pick: (state: S) => R): Stream<R> {
    return this.state.pipe(mapTo(pick));
  }
  setState(next: S) {
    this.history.push(this.snapshot);
    this.state.next(this.reduce(this.snapshot, next));
  }
  protected reduce(previous: S, next: S): S {
    return next;
  }
}
