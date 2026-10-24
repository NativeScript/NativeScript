// @angular/forms' FormArray, FormRecord and nested groups: adding, inserting, removing and replacing controls, negative
// indexes, paths (`get('a.b')`, `get(['list', 1])`), parent and root, what a child's change emits on its ancestors, and
// markAllAsTouched/markAllAsDirty over a tree. Node runs @angular/forms itself; the release build compiles its port.
import '@angular/compiler';
import { AbstractControl, FormArray, FormControl, FormGroup, FormRecord, Validators } from '@angular/forms';

const log: string[] = [];
const show = (v: unknown) => JSON.stringify(v) ?? 'undefined';
const state = (name: string, c: AbstractControl | null) => {
  if (!c) return console.log(`${name}: none`);
  console.log(`${name}: value=${show(c.value)} raw=${show(c.getRawValue())} status=${c.status} errors=${c.errors === null ? 'null' : show(c.errors)} pristine=${c.pristine} touched=${c.touched}`);
};
const watch = (name: string, c: AbstractControl) => {
  c.valueChanges.subscribe((v: unknown) => log.push(`${name}.value ${show(v)}`));
  c.statusChanges.subscribe((s: string) => log.push(`${name}.status ${s}`));
};
const flush = (what: string) => {
  console.log(`${what}: ${log.join(' | ')}`);
  log.length = 0;
};

const tags = new FormArray([new FormControl('a'), new FormControl('b', Validators.minLength(2))]);
watch('tags', tags);
state('tags', tags);
tags.push(new FormControl('cc'));
flush('push');
tags.push([new FormControl('d'), new FormControl('e')]);
flush('push many');
tags.insert(1, new FormControl('ins'));
flush('insert');
state('tags', tags);
console.log('at -1', tags.at(-1).value, 'at 0', tags.at(0).value, 'length', tags.length);
tags.removeAt(-1);
flush('removeAt -1');
tags.removeAt(0, { emitEvent: false });
flush('removeAt silent');
tags.setControl(0, new FormControl('set'));
flush('setControl');
state('tags', tags);
tags.at(1).disable();
flush('disable child');
state('tags', tags);
tags.patchValue(['p0', 'p1', 'p2', 'p3', 'p4']);
flush('patchValue extra');
state('tags', tags);
try {
  tags.setValue(['only']);
} catch (e) {
  console.log('setValue short:', (e as Error).message);
}
tags.at(1).enable();
tags.setValue(['s0', 's1', 's2', 's3']);
flush('setValue');
tags.reset(['r0', { value: 'r1', disabled: true }]);
flush('reset');
state('tags', tags);
tags.clear();
flush('clear');
state('tags', tags);
tags.clear();
flush('clear empty');
try {
  tags.setValue([]);
  console.log('setValue empty ok');
} catch (e) {
  console.log('setValue empty:', (e as Error).message);
}

const profile = new FormGroup({
  name: new FormControl('Ada', Validators.required),
  address: new FormGroup({
    city: new FormControl('London'),
    zip: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5}')]),
  }),
  phones: new FormArray([new FormControl('111'), new FormControl('222')]),
});
watch('profile', profile);
watch('address', profile.controls.address);
state('profile', profile);
state('address.zip', profile.get('address.zip'));
state('phones.1', profile.get(['phones', 1]));
state('missing', profile.get('address.nope'));
state('empty path', profile.get(''));
console.log('zip errors', show(profile.getError('pattern', 'address.zip')), profile.hasError('required', ['address', 'zip']));
console.log('parent', profile.get('address.city')!.parent === profile.controls.address, 'root', profile.get('phones.0')!.root === profile);
profile.get('address.zip')!.setValue('123');
flush('zip 123');
state('profile', profile);
profile.get('address.zip')!.setValue('12345');
flush('zip 12345');
state('profile', profile);
profile.get('address.city')!.markAsTouched();
console.log('touched', profile.touched, profile.controls.address.touched, profile.controls.name.touched);
profile.markAllAsTouched();
console.log('all touched', profile.controls.name.touched, profile.get('phones.1')!.touched);
profile.markAllAsDirty();
console.log('all dirty', profile.controls.name.dirty, profile.get('phones.0')!.dirty);
profile.controls.address.markAsPristine();
console.log('address pristine', profile.controls.address.pristine, 'profile pristine', profile.pristine, 'city', profile.get('address.city')!.pristine);
profile.controls.address.markAsUntouched();
console.log('address untouched', profile.controls.address.untouched, 'profile touched', profile.touched);
profile.controls.phones.push(new FormControl('333'));
flush('push phone');
profile.controls.address.disable();
flush('disable address');
state('profile', profile);
profile.reset();
flush('profile reset');
state('profile', profile);

const prices = new FormRecord<FormControl<number | null>>({ apple: new FormControl(1) });
prices.addControl('pear', new FormControl(2));
prices.setControl('apple', new FormControl(3));
state('prices', prices);
prices.removeControl('pear');
state('prices', prices);
console.log('contains', prices.contains('apple'), prices.contains('pear'));
console.log('registerControl kept', prices.registerControl('apple', new FormControl(9)).value);
