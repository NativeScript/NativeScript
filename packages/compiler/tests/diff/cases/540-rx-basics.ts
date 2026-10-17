// RxJS from its source: synchronous emission order, subscription and teardown, and the observer-object form.
import { Observable, of, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const log: string[] = [];
const source = new Observable<number>((subscriber) => {
  log.push('subscribed');
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  return () => log.push('teardown');
});
log.push('before');
const sub: Subscription = source.pipe(map((x) => x * 10), filter((x) => x > 10)).subscribe({
  next: (v) => log.push(`next ${v}`),
  error: (e) => log.push(`error ${e}`),
  complete: () => log.push('complete'),
});
log.push(`after closed=${sub.closed}`);
of('a', 'b').subscribe((v) => log.push(`of ${v}`));
console.log(log.join('\n'));
