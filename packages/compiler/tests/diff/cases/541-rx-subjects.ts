// @swift
// RxJS Subjects from source: Subject, BehaviorSubject, ReplaySubject, AsyncSubject, multicast order and unsubscribe.
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';

const log: string[] = [];

const s = new Subject<number>();
const sub1 = s.subscribe((v) => log.push(`s1:${v}`));
s.next(1);
const sub2 = s.asObservable().subscribe({
  next: (v) => log.push(`s2:${v}`),
  complete: () => log.push('s2:done'),
});
s.next(2);
sub1.unsubscribe();
s.next(3);
s.complete();

const b = new BehaviorSubject<string>('init');
log.push(`b0:${b.value}:${b.getValue()}`);
const bSub1 = b.subscribe((v) => log.push(`b1:${v}`));
b.next('second');
log.push(`bNow:${b.value}`);
const bSub2 = b.subscribe((v) => log.push(`b2:${v}`));
bSub1.unsubscribe();
b.next('third');
bSub2.unsubscribe();

const r = new ReplaySubject<string>(2);
r.next('a');
r.next('b');
r.next('c');
r.subscribe((v) => log.push(`r:${v}`));

const a = new AsyncSubject<number>();
a.subscribe((v) => log.push(`a:${v}`));
a.next(10);
a.next(20);
a.complete();

console.log(log.join('\n'));
