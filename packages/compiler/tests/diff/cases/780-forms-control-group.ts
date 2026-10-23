// @angular/forms' FormControl and FormGroup: values, statuses, errors, pristine/touched and the order valueChanges,
// statusChanges and events emit in as a control changes, is reset, disabled and enabled, and as a group's children do.
// Node runs @angular/forms itself; the release build compiles its port (runtime/angular-forms.ts).
import '@angular/compiler';
import { FormControl, FormGroup, Validators, type AbstractControl } from '@angular/forms';

const log: string[] = [];
const show = (v: unknown) => JSON.stringify(v) ?? 'undefined';
const state = (name: string, c: AbstractControl) =>
  console.log(`${name}: value=${show(c.value)} raw=${show(c.getRawValue())} status=${c.status} errors=${c.errors === null ? 'null' : show(c.errors)} pristine=${c.pristine} touched=${c.touched} valid=${c.valid} disabled=${c.disabled}`);
const watch = (name: string, c: AbstractControl) => {
  c.valueChanges.subscribe((v: unknown) => log.push(`${name}.value ${show(v)}`));
  c.statusChanges.subscribe((s: string) => log.push(`${name}.status ${s}`));
  c.events.subscribe((e: any) => log.push(`${name}.event ${e.constructor.name} ${e.source === c ? 'self' : 'child'}`));
};
const flush = (what: string) => {
  console.log(`${what}: ${log.join(' | ')}`);
  log.length = 0;
};

const name = new FormControl('Ada', [Validators.required, Validators.minLength(2)]);
state('name', name);
watch('name', name);
name.setValue('A');
flush('setValue A');
state('name', name);
name.setValue('');
flush('setValue empty');
state('name', name);
name.markAsTouched();
name.markAsDirty();
flush('touched dirty');
state('name', name);
name.reset();
flush('reset');
state('name', name);

const kept = new FormControl('keep', { nonNullable: true });
kept.setValue('changed');
kept.reset();
state('kept', kept);
kept.reset('other', { overwriteDefaultValue: true });
kept.setValue('x');
kept.reset();
state('kept', kept);

const boxed = new FormControl({ value: 'n/a', disabled: true });
state('boxed', boxed);
boxed.enable();
state('boxed', boxed);

const group = new FormGroup({
  first: new FormControl('Grace', Validators.required),
  last: new FormControl(''),
  age: new FormControl(30, [Validators.min(18), Validators.max(99)]),
});
watch('group', group);
state('group', group);
group.patchValue({ last: 'Hopper', age: 12 });
flush('patchValue');
state('group', group);
state('group.age', group.get('age')!);
console.log('hasError min', group.hasError('min', 'age'), group.getError('min', ['age']) ? show(group.getError('min', ['age'])) : 'none');
group.controls.age.disable();
flush('disable age');
state('group', group);
group.controls.first.markAsTouched();
flush('touch first');
console.log('group touched', group.touched, 'dirty', group.dirty);
group.controls.first.markAsDirty();
flush('dirty first');
group.controls.first.markAsPristine();
flush('pristine first');
console.log('group dirty', group.dirty);
group.reset({ first: 'Alan', last: { value: 'Turing', disabled: true } });
flush('group reset');
state('group', group);
group.enable();
flush('group enable');
state('group', group);
try {
  group.setValue({ first: 'x' } as any);
} catch (e) {
  console.log('setValue missing:', (e as Error).message);
}
try {
  group.setValue({ first: 'a', last: 'b', age: 1, extra: 2 } as any);
} catch (e) {
  console.log('setValue extra:', (e as Error).message);
}
group.setValue({ first: 'a', last: 'b', age: 40 });
flush('setValue all');
state('group', group);
const untyped: FormGroup = group as FormGroup<any>;
untyped.addControl('email', new FormControl('bad', Validators.email));
flush('addControl');
state('group', group);
console.log('contains', group.contains('email'), group.contains('nope'));
untyped.removeControl('email');
flush('removeControl');
state('group', group);
group.setErrors({ custom: true });
flush('setErrors');
state('group', group);
group.updateValueAndValidity({ emitEvent: false });
flush('silent update');
state('group', group);

const patterned = new FormControl('abc', Validators.pattern('[a-z]+'));
patterned.setValue('ABC');
state('patterned', patterned);
const strict = new FormControl('x1', Validators.pattern(/^\d+$/));
state('strict', strict);
const email = new FormControl('a@b.co', Validators.email);
state('email', email);
email.setValue('not an email');
state('email', email);
const checked = new FormControl(false, Validators.requiredTrue);
state('checked', checked);
const listed = new FormControl<string[]>([], Validators.required);
state('listed', listed);
listed.setValue(['a']);
state('listed', listed);
const composed = new FormControl('', Validators.compose([Validators.required, null, Validators.maxLength(1)]));
composed.setValue('abc');
state('composed', composed);
const swapped = new FormControl('abc', Validators.maxLength(2));
console.log('has maxLength validator', swapped.hasValidator(Validators.required));
swapped.addValidators(Validators.required);
swapped.setValue('');
state('swapped', swapped);
console.log('has required', swapped.hasValidator(Validators.required));
swapped.removeValidators(Validators.required);
swapped.updateValueAndValidity();
state('swapped', swapped);
swapped.clearValidators();
swapped.setValue('abcdef');
state('swapped', swapped);
