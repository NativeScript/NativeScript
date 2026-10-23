// @forms-port
// The forms runtime's template-driven directives (runtime/angular-forms.ts), made as a compiled template makes them, on
// stand-in views: NgModel alone and in an NgForm and NgModelGroup, its value written to the view a microtask after it
// changes, a view change reaching the model 20 ms later through ngModelChange, validator directives, the ng-* classes,
// disabled, submit and reset, and a renamed and a removed control.
import { NgForm, NgModel, NgModelGroup, NgControlStatus, NsValueAccessor, RequiredValidator, MinLengthValidator } from '@angular/forms';

const UNSET = 'UNSET';
const log: string[] = [];
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
class StubView {
  text: any = '';
  className = 'field';
  isEnabled = true;
  ngCssClasses: any = undefined;
}
const checks = { count: 0 };
const markForCheck = () => {
  checks.count++;
};

/** One control element: its accessor, validator directives, NgModel and NgControlStatus, as the template compiler orders them. */
function field(parent: any, bound: boolean[], required: boolean, minlength: number | null) {
  const view = new StubView();
  const validators: any[] = [];
  const req = new RequiredValidator(true);
  req.apply([required]);
  validators.push(req);
  if (minlength !== null) {
    const min = new MinLengthValidator(true);
    min.apply([minlength]);
    validators.push(min);
  }
  const accessor = new NsValueAccessor(view, 'text', UNSET);
  const model = new NgModel(parent, validators, [], accessor, markForCheck, bound);
  const status = new NgControlStatus(view, markForCheck, model, false);
  model.update.subscribe((v: any) => log.push(`ngModelChange ${JSON.stringify(v)}`));
  return { view, accessor, model, status, req };
}

async function main(): Promise<void> {
  const solo = field(null, [true, false, false, false], true, null);
  solo.model.apply(['', undefined, undefined, undefined]);
  solo.status.check();
  console.log('solo made', JSON.stringify(solo.view.text), solo.model.status, solo.view.className);
  await delay(0);
  solo.status.check();
  console.log('solo after microtask', JSON.stringify(solo.view.text), solo.model.valid, solo.view.className);
  solo.model.apply(['Ada', undefined, undefined, undefined]);
  await delay(0);
  solo.status.check();
  console.log('solo model set', solo.view.text, solo.model.value, solo.model.valid, solo.view.className);
  solo.accessor.onChange('Ad');
  solo.accessor.onChange('A');
  await delay(30);
  solo.status.check();
  console.log('solo view change', solo.model.value, solo.model.dirty, solo.view.className, log.join(' | '));
  log.length = 0;
  solo.model.apply(['A', undefined, undefined, undefined]);
  await delay(0);
  console.log('same model, no write', log.length);
  solo.accessor.onTouched();
  solo.status.check();
  console.log('solo touched', solo.model.touched, solo.view.className);
  solo.req.apply([false]);
  solo.accessor.onChange('');
  await delay(30);
  solo.status.check();
  console.log('not required', solo.model.valid, solo.model.errors === null, solo.view.className);

  const disabled = field(null, [true, false, false, true], false, null);
  disabled.model.apply(['x', undefined, undefined, 'true']);
  await delay(0);
  console.log('disabled', disabled.model.disabled, disabled.view.isEnabled);
  disabled.model.apply(['x', undefined, undefined, false]);
  await delay(0);
  console.log('enabled', disabled.model.disabled, disabled.view.isEnabled);

  const form = new NgForm([], [], 'always', [false]);
  form.apply([undefined]);
  const formView = new StubView();
  const formStatus = new NgControlStatus(formView, markForCheck, form, true);
  const group = new NgModelGroup(form, [], [], false, [true]);
  group.apply(['address']);
  group.ngOnInit();
  const name = field(form, [true, true, false, false], true, 2);
  name.model.apply(['', 'name', undefined, undefined]);
  const city = field(group, [true, true, false, false], false, null);
  city.model.apply(['Paris', 'city', undefined, undefined]);
  form.ngAfterViewInit();
  formStatus.check();
  console.log('form before microtask', JSON.stringify(form.value), form.status);
  await delay(0);
  formStatus.check();
  console.log('form registered', JSON.stringify(form.value), form.status, form.valid, formView.className, JSON.stringify(group.value));
  name.accessor.onChange('L');
  await delay(30);
  name.status.check();
  formStatus.check();
  console.log('name L', JSON.stringify(form.value), JSON.stringify(name.model.errors), name.view.className, formView.className, log.join(' | '));
  log.length = 0;
  name.model.apply(['Lin', 'name', undefined, undefined]);
  await delay(0);
  console.log('name model Lin', name.view.text, JSON.stringify(form.value), form.valid);
  form.ngSubmit.subscribe((e: any) => log.push(`submit ${e}`));
  form.onSubmit('tap');
  formStatus.check();
  console.log('submitted', form.submitted, formView.className, log.join(' | '));
  log.length = 0;
  city.model.apply(['Paris', 'town', undefined, undefined]);
  await delay(0);
  console.log('renamed', JSON.stringify(form.value), city.model.path.join('.'));
  form.resetForm();
  await delay(0);
  formStatus.check();
  console.log('reset', JSON.stringify(form.value), form.submitted, formView.className, JSON.stringify(name.view.text), name.view.text === UNSET);
  name.model.ngOnDestroy();
  await delay(0);
  console.log('removed', JSON.stringify(form.value), Object.keys(form.controls).join(','));
  console.log('checks', checks.count > 0);
}

main();
