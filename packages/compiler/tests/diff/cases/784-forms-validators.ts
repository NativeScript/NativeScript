// @angular/forms' Validators on every kind of value they treat differently: numbers and numeric strings for min and
// max, strings, arrays and Sets for required and the length validators, pattern strings (anchored) and RegExps, email's
// limits, requiredTrue, compose with nulls, a Validator class, and setValidators with options. Node runs @angular/forms.
import '@angular/compiler';
import { AbstractControl, FormControl, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

const errs = (c: AbstractControl) => (c.errors === null ? 'null' : JSON.stringify(c.errors));
const run = (label: string, validator: ValidatorFn, values: unknown[]) => {
  const c = new FormControl<unknown>(null, validator);
  console.log(label, values.map((v) => {
    c.setValue(v);
    return `${JSON.stringify(v) ?? 'undefined'}→${errs(c)}`;
  }).join(' '));
};

run('min 3', Validators.min(3), [null, undefined, 2, 3, '2', '2.5x', 'abc', '', 10]);
run('max 3', Validators.max(3), [null, 4, '4', 3, 'x', -1]);
run('required', Validators.required, [null, undefined, '', ' ', 0, false, [], [0], new Set(), new Set([1]), {}]);
run('requiredTrue', Validators.requiredTrue, [true, false, 'true', 1, null]);
run('minLength 2', Validators.minLength(2), [null, '', 'a', 'ab', [], [1], [1, 2], new Set([1]), 5, { length: 1 }]);
run('maxLength 2', Validators.maxLength(2), [null, '', 'abc', [1, 2, 3], new Set([1, 2, 3]), 12345, { length: 9 }]);
run('pattern str', Validators.pattern('[a-c]+'), [null, '', 'abc', 'abcd', 'xabc', 'ABC']);
run('pattern anchored', Validators.pattern('^a.*z$'), ['az', 'abz', 'za']);
run('pattern regexp', Validators.pattern(/b+/), ['abba', 'cc', '']);
run('pattern g', Validators.pattern(/a/g), ['a', 'a', 'a']);
run('pattern empty', Validators.pattern(''), ['anything']);
run('email', Validators.email, [null, '', 'a@b', 'a@b.co', 'a.b@c', 'a@@b', 'a b@c.d', `${'x'.repeat(65)}@b.co`, `a@${'b'.repeat(64)}.co`, 'é@b.co']);
run('nullValidator', Validators.nullValidator, ['x']);
run('compose', Validators.compose([null, Validators.required, undefined, Validators.minLength(3), Validators.maxLength(1)])!, ['', 'ab', 'abcd']);
console.log('compose empty', !Validators.compose([]), !Validators.compose(null), !Validators.compose([null]));

class NoSpaces implements Validator {
  validate(c: AbstractControl): ValidationErrors | null {
    return typeof c.value === 'string' && c.value.includes(' ') ? { spaces: true } : null;
  }
}
const noSpaces = new NoSpaces();
const withObject = new FormControl('a b', [Validators.required, (c: AbstractControl) => noSpaces.validate(c)]);
console.log('validator object', errs(withObject));
withObject.setValidators([Validators.maxLength(1)]);
withObject.updateValueAndValidity();
console.log('setValidators', errs(withObject));
withObject.setValidators(null);
withObject.updateValueAndValidity();
console.log('setValidators null', errs(withObject), withObject.validator === null);
const viaOptions = new FormControl('', { validators: [Validators.required], updateOn: 'submit' });
console.log('options', errs(viaOptions), viaOptions.updateOn);
viaOptions.validator = Validators.minLength(5);
viaOptions.setValue('abc');
console.log('validator setter', errs(viaOptions), viaOptions.hasValidator(Validators.required));
