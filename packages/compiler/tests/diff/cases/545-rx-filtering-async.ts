// @swift
// RxJS filtering, multicasting, and async timer operators: tap, take, takeUntil, takeWhile, skip, distinctUntilChanged, debounceTime, delay, shareReplay, firstValueFrom, lastValueFrom.
import { Subject, Observable, of, timer, firstValueFrom, lastValueFrom } from 'rxjs';
import { tap, take, takeUntil, takeWhile, skip, distinctUntilChanged, debounceTime, delay, shareReplay, map, toArray } from 'rxjs/operators';

const log: string[] = [];

// 1. skip, take, takeWhile, distinctUntilChanged, tap
of(1, 1, 2, 2, 3, 3, 4, 5)
  .pipe(
    distinctUntilChanged(),
    skip(1),
    takeWhile((x) => x < 5),
    take(2),
    tap((x) => log.push(`tap:${x}`))
  )
  .subscribe((x) => log.push(`val:${x}`));

// 2. distinctUntilChanged with custom comparator
of({ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' })
  .pipe(distinctUntilChanged((a, b) => a.id === b.id))
  .subscribe((o) => log.push(`obj:${o.id}:${o.v}`));

// 3. takeUntil
const source$ = new Subject<number>();
const stop$ = new Subject<void>();
source$.pipe(takeUntil(stop$)).subscribe({
  next: (v) => log.push(`tu:${v}`),
  complete: () => log.push('tu:done'),
});
source$.next(1);
source$.next(2);
stop$.next();
source$.next(3);

// 4. shareReplay
let runs = 0;
const shared$ = new Observable<number>((sub) => {
  runs++;
  sub.next(runs * 10 + 1);
  sub.next(runs * 10 + 2);
  sub.complete();
}).pipe(shareReplay(1));
shared$.subscribe((v) => log.push(`sr1:${v}`));
shared$.subscribe((v) => log.push(`sr2:${v}`));

// 5. Async operators: timer, delay, debounceTime, firstValueFrom, lastValueFrom
async function runAsync() {
  const first = await firstValueFrom(timer(10).pipe(map(() => 'timer-ok')));
  log.push(`first:${first}`);

  const delayed = await lastValueFrom(of('d1', 'd2').pipe(delay(10), toArray()));
  log.push(`delayed:${delayed.join(',')}`);

  const debounced$ = new Subject<string>();
  const done = new Promise<void>((resolve) => {
    const collected: string[] = [];
    debounced$.pipe(debounceTime(20)).subscribe({
      next: (v) => collected.push(v),
      complete: () => {
        log.push(`debounced:${collected.join(',')}`);
        resolve();
      },
    });
  });
  debounced$.next('a');
  debounced$.next('b');
  setTimeout(() => {
    debounced$.next('c');
    setTimeout(() => {
      debounced$.complete();
    }, 35);
  }, 35);
  await done;
  console.log(log.join('\n'));
}

runAsync();
