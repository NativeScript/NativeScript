// @swift
// @angular/forms' async validators returning rxjs Observables (compiled from rxjs's source, as the iOS build does):
// `of` settling synchronously, a timer, several composed with forkJoin's rule that one completing empty settles none,
// a Subject's values as they come, and a run cancelled by the next change unsubscribing. Node runs @angular/forms itself; the release build its port.
import '@angular/compiler';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { EMPTY, map, of, Subject, timer } from 'rxjs';

const errs = (c: AbstractControl) => (c.errors === null ? 'null' : JSON.stringify(c.errors));
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
let started = 0;

async function main(): Promise<void> {
  const observed = new FormControl(1, null, (c: AbstractControl) => of(c.value > 2 ? { big: true } : null));
  console.log('of sync', observed.status, errs(observed));
  observed.setValue(5);
  console.log('of big', observed.status, errs(observed));

  const slow = new FormControl('a', null, (c: AbstractControl) => {
    started++;
    return timer(5).pipe(map((): ValidationErrors | null => (c.value === 'bad' ? { bad: true } : null)));
  });
  slow.setValue('bad');
  slow.setValue('bad');
  console.log('timer pending', slow.status, started);
  await delay(30);
  console.log('timer after', slow.status, errs(slow));

  const empty = new FormControl('e', null, [() => EMPTY, () => of(null)]);
  await delay(5);
  console.log('one completes empty', empty.status, errs(empty));

  const subject = new Subject<ValidationErrors | null>();
  const manual = new FormControl('m', null, () => subject);
  console.log('subject waits', manual.status);
  subject.next({ first: true });
  console.log('subject first', manual.status, errs(manual));
  subject.next(null);
  console.log('subject second', manual.status, errs(manual));

  const both = new FormControl('b', null, [() => of({ a: 1 }), () => timer(2).pipe(map(() => ({ b: 2 })))]);
  await delay(20);
  console.log('composed', both.status, errs(both));
}

main();
