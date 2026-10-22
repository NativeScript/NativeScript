// @swift
// RxJS error handling and finalize ordering: throwError, EMPTY, catchError, finalize, retry.
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { map, catchError, finalize, retry, tap } from 'rxjs/operators';

const log: string[] = [];

// 1. catchError recovering with fallback observable + finalize order
of(1, 2, 3)
  .pipe(
    map((x) => {
      if (x === 2) throw new Error('boom');
      return x * 10;
    }),
    catchError((err: any) => {
      log.push(`caught:${err.message}`);
      return of(99);
    }),
    finalize(() => log.push('fin1'))
  )
  .subscribe({
    next: (v) => log.push(`v1:${v}`),
    error: (e) => log.push(`e1:${e}`),
    complete: () => log.push('c1'),
  });

// 2. throwError factory + catchError rethrowing to observer.error + finalize
throwError(() => new Error('fatal'))
  .pipe(
    catchError((err: any) => {
      log.push(`rethrow:${err.message}`);
      return throwError(() => new Error('rethrown'));
    }),
    finalize(() => log.push('fin2'))
  )
  .subscribe({
    next: (v) => log.push(`v2:${v}`),
    error: (e: any) => log.push(`e2:${e.message}`),
    complete: () => log.push('c2'),
  });

// 3. EMPTY + finalize
EMPTY.pipe(finalize(() => log.push('finEmpty'))).subscribe({
  next: () => log.push('empty-next'),
  complete: () => log.push('empty-complete'),
});

// 4. retry(2) before succeeding
let attempts = 0;
new Observable<string>((sub) => {
  attempts++;
  log.push(`try:${attempts}`);
  if (attempts < 3) sub.error(new Error('not yet'));
  else {
    sub.next('ok');
    sub.complete();
  }
})
  .pipe(retry(2), finalize(() => log.push('finRetry')))
  .subscribe({
    next: (v) => log.push(`retry:${v}`),
    complete: () => log.push('retry:done'),
  });

console.log(log.join('\n'));
