// @angular/forms' async validators: a Promise's or an Observable's result, PENDING while it runs, a run cancelled by the
// next change, several composed (each one's last value once all complete), a Validator object, what statusChanges and a parent see, emitEvent false, and a sync function given as an async one.
// Node runs @angular/forms itself; the release build compiles its port.
import '@angular/compiler';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

const log: string[] = [];
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const errs = (c: AbstractControl) => (c.errors === null ? 'null' : JSON.stringify(c.errors));

const takenNames: AsyncValidatorFn = (c: AbstractControl) =>
  delay(5).then((): ValidationErrors | null => {
    log.push(`checked ${c.value}`);
    return c.value === 'taken' ? { taken: true } : null;
  });

class Even implements AsyncValidator {
  validate(c: AbstractControl): Promise<ValidationErrors | null> {
    const result: ValidationErrors | null = c.value % 2 === 0 ? null : { odd: true };
    return Promise.resolve(result);
  }
}

async function main(): Promise<void> {
  const name = new FormControl('free', Validators.required, takenNames);
  name.statusChanges.subscribe((s: string) => log.push(`status ${s}`));
  console.log('made', name.status, name.pending);
  await delay(20);
  console.log('after', name.status, errs(name), log.join(' | '));
  log.length = 0;

  name.setValue('taken');
  console.log('set taken', name.status);
  name.setValue('taken');
  await delay(20);
  console.log('two sets', name.status, errs(name), log.join(' | '));
  log.length = 0;

  name.setValue('');
  console.log('empty skips async', name.status, errs(name));
  await delay(20);
  console.log('empty after', name.status, log.join(' | '));
  log.length = 0;

  name.setValue('taken', { emitEvent: false });
  await delay(20);
  console.log('silent', name.status, errs(name), log.join(' | '));
  log.length = 0;

  const group = new FormGroup({ name: new FormControl('x', null, takenNames), plain: new FormControl('y') });
  group.statusChanges.subscribe((s: string) => log.push(`group ${s}`));
  console.log('group made', group.status, group.controls.name.status);
  group.controls.name.setValue('taken');
  console.log('group pending', group.status, group.pending);
  await delay(20);
  console.log('group after', group.status, errs(group.controls.name), log.join(' | '));
  log.length = 0;

  const composed = new FormControl(3, null, [(c: AbstractControl) => new Even().validate(c), (c: AbstractControl) => Promise.resolve(c.value > 2 ? { big: true } : null)]);
  await delay(5);
  console.log('composed', composed.status, errs(composed));
  composed.setValue(2);
  await delay(5);
  console.log('composed 2', composed.status, errs(composed));

  const validatorObject = new FormControl(7, { asyncValidators: Validators.composeAsync([(c: AbstractControl) => new Even().validate(c)]) });
  await delay(5);
  console.log('composeAsync', validatorObject.status, errs(validatorObject));

  try {
    new FormControl('s', null, ((c: AbstractControl) => ({ sync: c.value })) as any);
    console.log('sync as async ok');
  } catch (e) {
    console.log('sync as async:', (e as Error).message);
  }
  try {
    new FormControl('s', null, ((c: AbstractControl) => 5) as any);
    console.log('number as async ok');
  } catch (e) {
    console.log('number as async:', (e as Error).message);
  }

  name.clearAsyncValidators();
  name.setValue('taken');
  console.log('cleared', name.status, errs(name));
  name.addAsyncValidators(takenNames);
  console.log('has async', name.hasAsyncValidator(takenNames));
  name.updateValueAndValidity();
  await delay(20);
  console.log('re-added', name.status, errs(name));
  name.removeAsyncValidators(takenNames);
  name.updateValueAndValidity();
  console.log('removed', name.status, name.hasAsyncValidator(takenNames));
}

main();
