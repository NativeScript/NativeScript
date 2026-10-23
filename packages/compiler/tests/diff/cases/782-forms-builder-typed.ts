// @angular/forms' FormBuilder, NonNullableFormBuilder and UntypedFormBuilder, injected and made, and typed and untyped
// forms as an app declares them: control configs (`[value, validators, asyncValidators]`), boxed states, options,
// `nonNullable` resetting to the initial value, and `UntypedFormGroup` fields. Node runs @angular/forms itself; the
// builders are provided here, as Node's Angular has no root injector without an application.
import '@angular/compiler';
import { Injector, inject, runInInjectionContext } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators, type AbstractControl } from '@angular/forms';

const show = (v: unknown) => JSON.stringify(v) ?? 'undefined';
const state = (name: string, c: AbstractControl) =>
  console.log(`${name}: value=${show(c.value)} raw=${show(c.getRawValue())} status=${c.status} errors=${c.errors === null ? 'null' : show(c.errors)} updateOn=${c.updateOn}`);

interface Profile {
  name: FormControl<string | null>;
  age: FormControl<number>;
}

class ProfileForm {
  private readonly fb = inject(FormBuilder);
  private readonly nnfb: NonNullableFormBuilder = this.fb.nonNullable;
  readonly typed: FormGroup<Profile> = new FormGroup<Profile>({
    name: new FormControl<string | null>('Ada'),
    age: new FormControl<number>(36, { nonNullable: true, validators: [Validators.min(0)] }),
  });
  readonly built = this.fb.group({
    name: ['Grace', [Validators.required, Validators.minLength(3)]],
    email: this.fb.control('g@navy.mil', { validators: Validators.email, updateOn: 'blur' }),
    disabled: [{ value: 'fixed', disabled: true }],
    tags: this.fb.array(['x', ['y', Validators.required]]),
    nested: this.fb.group({ a: 1 }, { validator: (c: AbstractControl) => (c.value.a > 1 ? { tooBig: true } : null) }),
  });
  readonly kept = this.nnfb.group({ title: 'Initial', count: 1 });
  readonly record = this.fb.record({ x: 1, y: 2 });
}

const injector = Injector.create({ providers: [FormBuilder, UntypedFormBuilder] });
const form = runInInjectionContext(injector, () => new ProfileForm());

state('typed', form.typed);
form.typed.controls.name.setValue(null);
form.typed.controls.age.setValue(-1);
state('typed', form.typed);
form.typed.reset();
state('typed reset', form.typed);
console.log('age default', form.typed.controls.age.defaultValue, 'name default null', form.typed.controls.name.defaultValue === null);

state('built', form.built);
state('built.email', form.built.controls.email);
state('built.tags', form.built.controls.tags);
form.built.controls.tags.at(1).setValue('');
state('built.tags', form.built.controls.tags);
form.built.controls.nested.setValue({ a: 2 });
state('built.nested', form.built.controls.nested);
form.built.patchValue({ name: 'Al', email: 'nope' });
state('built', form.built);
form.built.reset();
state('built reset', form.built);

form.kept.patchValue({ title: 'Changed', count: 5 });
state('kept', form.kept);
form.kept.reset();
state('kept reset', form.kept);

form.record.addControl('z', new FormControl(3));
state('record', form.record);

const untypedFb = runInInjectionContext(injector, () => inject(UntypedFormBuilder));
const legacy: UntypedFormGroup = untypedFb.group({ anything: 'x', list: untypedFb.array([1, 2]) });
legacy.controls['anything'].setValue(42);
legacy.addControl('late', untypedFb.control(true));
state('legacy', legacy);
const value: any = legacy.value;
console.log('legacy read', value.anything + 1, value.list.length, value.late);

const direct = new FormBuilder();
const nn = direct.nonNullable.control('start');
nn.setValue('next');
nn.reset();
const plain = direct.control('start');
plain.reset();
console.log('nonNullable control', nn.value, 'plain control reset to null', plain.value === null);
console.log('same builder', runInInjectionContext(injector, () => inject(FormBuilder) === inject(FormBuilder)));
