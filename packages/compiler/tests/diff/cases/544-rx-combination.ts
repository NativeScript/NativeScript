// @swift
// RxJS combination and accumulation operators: combineLatest, forkJoin, withLatestFrom, merge, concat, defer, startWith, scan, reduce, toArray, pairwise, defaultIfEmpty.
import { Subject, BehaviorSubject, combineLatest, forkJoin, merge, concat, defer, of, EMPTY } from 'rxjs';
import { withLatestFrom, startWith, scan, reduce, toArray, pairwise, defaultIfEmpty, map } from 'rxjs/operators';

const log: string[] = [];

const a$ = new BehaviorSubject<string>('a1');
const b$ = new BehaviorSubject<number>(1);
const cSub = combineLatest([a$, b$]).subscribe(([a, b]) => log.push(`cl:${a}-${b}`));
a$.next('a2');
b$.next(2);
cSub.unsubscribe();

forkJoin([of('x', 'y'), of(10, 20), of(true)]).subscribe(([s, n, b]) => log.push(`fj:${s}:${n}:${b}`));

const trigger$ = new Subject<string>();
const state$ = new BehaviorSubject<number>(100);
trigger$.pipe(withLatestFrom(state$)).subscribe(([t, st]) => log.push(`wlf:${t}@${st}`));
trigger$.next('click1');
state$.next(200);
trigger$.next('click2');

merge(of('m1', 'm2'), of('m3')).subscribe((v) => log.push(`merge:${v}`));
concat(of('c1'), of('c2', 'c3')).subscribe((v) => log.push(`concat:${v}`));

let n = 0;
const deferred$ = defer(() => of(++n));
deferred$.subscribe((v) => log.push(`def1:${v}`));
deferred$.subscribe((v) => log.push(`def2:${v}`));

of(2, 3)
  .pipe(
    startWith(1),
    scan((acc, cur) => acc + cur, 0)
  )
  .subscribe((v) => log.push(`scan:${v}`));

of(1, 2, 3, 4)
  .pipe(reduce((acc, cur) => acc + cur, 0))
  .subscribe((v) => log.push(`reduce:${v}`));

of('p', 'q', 'r')
  .pipe(toArray())
  .subscribe((arr) => log.push(`arr:${arr.join(',')}`));

of(10, 20, 30)
  .pipe(pairwise(), map(([prev, curr]) => `${prev}->${curr}`))
  .subscribe((v) => log.push(`pair:${v}`));

EMPTY.pipe(defaultIfEmpty('fallback')).subscribe((v) => log.push(`defEmpty:${v}`));

console.log(log.join('\n'));
