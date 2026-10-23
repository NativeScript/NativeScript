// @angular/forms used untyped, as older apps use it: controls read and written through `any`, values that are
// sometimes null, `controls['x']` lookups and subscriptions that keep their own state. Node runs @angular/forms.
import '@angular/compiler';
import { FormArray, FormControl, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';

class SignupModel {
  form: UntypedFormGroup;
  changes = 0;
  lastName: any;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      age: new FormControl(''),
      agree: new FormControl(false, Validators.requiredTrue),
      emails: new FormArray([]),
    });
    this.form.valueChanges.subscribe((v: any) => {
      this.changes++;
      this.lastName = v.name;
    });
  }

  addEmail(address: any) {
    (this.form.controls['emails'] as FormArray).push(new FormControl(address, Validators.email));
  }

  summary() {
    const v = this.form.value;
    return `${v.name}|${v.age}|${v.agree}|${v.emails.join(',')}|${this.form.valid}|${this.changes}|${this.lastName}`;
  }
}

const model = new SignupModel();
console.log(model.summary());
model.form.controls['name'].setValue('Lin');
model.form.patchValue({ age: 30, agree: true });
model.addEmail('lin@example.com');
model.addEmail('bad');
console.log(model.summary());
console.log('emails invalid', model.form.get('emails')!.invalid, JSON.stringify(model.form.get('emails.1')!.errors));
(model.form.get('emails') as FormArray).removeAt(1);
console.log(model.summary());
const name: any = model.form.get('name');
name.reset();
console.log(model.summary(), name.value === null, name.hasError('required'));
const raw: any = model.form.getRawValue();
console.log(Object.keys(raw).join(','), raw.age + 1);
