// @swift
// RxJS higher-order flattening operators: switchMap cancellation, mergeMap, concatMap, exhaustMap.
import { Subject, Observable, of } from 'rxjs';
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

const log: string[] = [];

// 1. switchMap cancels active inner observable when outer emits
const outer = new Subject<string>();
const inners: Record<string, Subject<number>> = {};
const sub = outer
  .pipe(
    switchMap((key) => new Observable<string>((subscriber) => {
      log.push(`sub:${key}`);
      const inner = (inners[key] = new Subject<number>());
      const innerSub = inner.subscribe({
        next: (n) => subscriber.next(`${key}${n}`),
        complete: () => subscriber.complete(),
      });
      return () => {
        log.push(`unsub:${key}`);
        innerSub.unsubscribe();
      };
    }))
  )
  .subscribe({
    next: (v) => log.push(`got:${v}`),
    complete: () => log.push('switch:done'),
  });

outer.next('A');
inners.A.next(1);
outer.next('B');
inners.A.next(2);
inners.B.next(1);
inners.B.complete();
outer.complete();
sub.unsubscribe();

// 2. mergeMap, concatMap, exhaustMap over synchronous inner streams
of(1, 2)
  .pipe(mergeMap((x) => of(x * 10, x * 10 + 1)))
  .subscribe((v) => log.push(`merge:${v}`));

of(1, 2)
  .pipe(concatMap((x) => of(x * 100, x * 100 + 1)))
  .subscribe((v) => log.push(`concat:${v}`));

const exOuter = new Subject<number>();
const exInner = new Subject<string>();
exOuter
  .pipe(exhaustMap((x) => new Observable<string>((s) => {
    log.push(`ex-start:${x}`);
    return exInner.subscribe({
      next: (v) => s.next(`${x}:${v}`),
      complete: () => s.complete(),
    });
  })))
  .subscribe((v) => log.push(`ex:${v}`));

exOuter.next(1);
exOuter.next(2); // ignored while first inner is active
exInner.next('a');
exInner.complete();
exOuter.next(3);
exInner.next('b');
exInner.complete();

console.log(log.join('\n'));
