// RxJS's shape: generic operator functions composed by an overloaded `pipe`, a `filter` overloaded for type-guard
// predicates (declared and inferred), and closures taking fewer parameters than the operator passes them.
type OperatorFunction<T, R> = (source: Stream<T>) => Stream<R>;

class Stream<T> {
  constructor(private readonly producer: (next: (value: T) => void) => void) {}

  subscribe(next: (value: T) => void): void {
    this.producer(next);
  }

  pipe<A>(a: OperatorFunction<T, A>): Stream<A>;
  pipe<A, B>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>): Stream<B>;
  pipe<A, B, C>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>, c: OperatorFunction<B, C>): Stream<C>;
  pipe(...operators: OperatorFunction<any, any>[]): Stream<any> {
    let stream: Stream<any> = this;
    for (const operator of operators) stream = operator(stream);
    return stream;
  }
}

function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
  return (source) =>
    new Stream<R>((next) => {
      let index = 0;
      source.subscribe((value) => next(project(value, index++)));
    });
}

function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T>;
function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source) =>
    new Stream<T>((next) => {
      let index = 0;
      source.subscribe((value) => {
        if (predicate(value, index++)) next(value);
      });
    });
}

class NavigationStart {
  constructor(readonly url: string) {}
}
class NavigationEnd {
  constructor(
    readonly id: number,
    readonly urlAfterRedirects: string,
  ) {}
}
type RouterEvent = NavigationStart | NavigationEnd;

const events = new Stream<RouterEvent>((next) => {
  next(new NavigationStart('/'));
  next(new NavigationEnd(1, '/tabs/play'));
  next(new NavigationStart('/tabs/play'));
  next(new NavigationEnd(2, '/song/7'));
});

events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((end) => console.log('declared guard', end.id));

events
  .pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => !event.urlAfterRedirects.startsWith('/tabs')),
  )
  .subscribe((hud) => console.log('hud', hud));

events
  .pipe(
    filter((_event, index) => index % 2 === 1),
    map((event, index) => `${index}:${event instanceof NavigationEnd ? event.urlAfterRedirects : (event as NavigationStart).url}`),
    map((label) => label.length),
  )
  .subscribe((length) => console.log('length', length));

const isEnd = (event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd;
events.pipe(filter(isEnd), map((end) => end.id * 10)).subscribe((n) => console.log('named guard', n));
