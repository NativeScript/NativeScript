// @forms-port
// The forms runtime's reactive directives (runtime/angular-forms.ts), made as a compiled template makes them, on
// stand-in views of each value accessor's kind: formGroup with formControlName, formGroupName and formArrayName below
// it, a standalone formControl, the model written to each view and each view's change reaching the model, disabled
// controls, updateOn blur and submit, the group's ng-* classes, swapping the form and destroying a control's directive.
import { AbstractControl, FormArray, FormArrayName, FormControl, FormControlDirective, FormControlName, FormGroup, FormGroupDirective, FormGroupName, NgControlStatus, NsValueAccessor, Validators } from '@angular/forms';

const UNSET = 'UNSET';
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
class StubView {
  text: any = '';
  checked: any = false;
  value: any = 0;
  date: any = null;
  selectedIndex: any = -1;
  className = '';
  isEnabled = true;
  ngCssClasses: any = undefined;
}
const markForCheck = () => {};
const events: string[] = [];
const show = (c: AbstractControl | null) => (c ? JSON.stringify(c.getRawValue()) : 'none');

function named(parent: any, kind: string, name: string | number) {
  const view = new StubView();
  const accessor = new NsValueAccessor(view, kind, UNSET);
  const dir = new FormControlName(parent, [], [], accessor, [true, false]);
  dir.update.subscribe((v: any) => events.push(`${name} ngModelChange ${JSON.stringify(v)}`));
  return { view, accessor, dir };
}

async function main(): Promise<void> {
  const form = new FormGroup({
    name: new FormControl('Ada', Validators.required),
    agree: new FormControl(true),
    address: new FormGroup({ city: new FormControl('London'), zip: new FormControl({ value: '12345', disabled: true }) }),
    tags: new FormArray([new FormControl(1), new FormControl(2)]),
  });
  const groupView = new StubView();
  const fgd = new FormGroupDirective([], [], 'always', 'formGroup', [true]);
  fgd.apply([form]);
  const groupStatus = new NgControlStatus(groupView, markForCheck, fgd, true);
  const name = named(fgd, 'text', 'name');
  name.dir.apply(['name', undefined]);
  const agree = named(fgd, 'checked', 'agree');
  agree.dir.apply(['agree', undefined]);
  const address = new FormGroupName(fgd, [], [], false, [true]);
  address.apply(['address']);
  address.ngOnInit();
  const city = named(address, 'text', 'city');
  city.dir.apply(['city', undefined]);
  const zip = named(address, 'text', 'zip');
  zip.dir.apply(['zip', undefined]);
  const tags = new FormArrayName(fgd, [], [], true, [true]);
  tags.apply(['tags']);
  tags.ngOnInit();
  const first = named(tags, 'number', 0);
  first.dir.apply([0, undefined]);
  groupStatus.check();
  console.log('views', name.view.text, agree.view.checked, city.view.text, zip.view.text, zip.view.isEnabled, first.view.value, groupView.className);
  console.log('paths', name.dir.path.join('.'), city.dir.path.join('.'), first.dir.path.join('.'), address.control === form.get('address'), tags.control === form.get('tags'));

  form.patchValue({ name: 'Grace', agree: false, address: { city: 'Paris' }, tags: [7] });
  console.log('patched', name.view.text, agree.view.checked, city.view.text, first.view.value, events.length);
  name.accessor.onChange('');
  await delay(30);
  groupStatus.check();
  console.log('name cleared', show(form), form.valid, groupView.className, events.join(' | '));
  events.length = 0;
  agree.accessor.onChange(true);
  first.accessor.onChange(42);
  await delay(30);
  console.log('agree and tag', show(form), events.join(' | '));
  events.length = 0;
  form.controls.name.disable();
  console.log('name disabled', name.view.isEnabled, JSON.stringify(form.value));
  form.controls.name.enable();
  console.log('name enabled', name.view.isEnabled);

  fgd.ngSubmit.subscribe((e: any) => events.push(`submit ${e}`));
  fgd.onSubmit('tap');
  groupStatus.check();
  console.log('submitted', fgd.submitted, groupView.className, events.join(' | '));
  events.length = 0;
  fgd.resetForm({ name: 'Reset' });
  groupStatus.check();
  console.log('reset', show(form), name.view.text, name.view.text === 'Reset', agree.view.checked === UNSET, fgd.submitted, groupView.className);

  const swapped = new FormGroup({
    name: new FormControl('Swapped'),
    agree: new FormControl(false),
    address: new FormGroup({ city: new FormControl('Oslo'), zip: new FormControl('0150') }),
    tags: new FormArray([new FormControl(9)]),
  });
  fgd.apply([swapped]);
  console.log('swapped', name.view.text, agree.view.checked, city.view.text, first.view.value);
  name.accessor.onChange('Typed');
  await delay(30);
  console.log('typed into swapped', show(swapped), show(form.get('name')));

  name.dir.ngOnDestroy();
  name.accessor.onChange('after destroy');
  await delay(30);
  console.log('destroyed', show(swapped.get('name')), fgd.directives.length);

  const lazy = new FormControl('a', { updateOn: 'blur' });
  const lazyView = new StubView();
  const lazyAccessor = new NsValueAccessor(lazyView, 'text', UNSET);
  const standalone = new FormControlDirective([], [], lazyAccessor, 'always', [true, false]);
  standalone.apply([lazy, undefined]);
  lazyAccessor.onChange('ab');
  await delay(30);
  console.log('blur pending', lazy.value, lazy.dirty);
  lazyAccessor.onTouched();
  console.log('blurred', lazy.value, lazy.dirty, lazy.touched);

  const later = new FormGroup({ note: new FormControl('x', { updateOn: 'submit' }) });
  const laterDir = new FormGroupDirective([], [], 'always', 'formGroup', [true]);
  laterDir.apply([later]);
  const note = named(laterDir, 'text', 'note');
  note.dir.apply(['note', undefined]);
  note.accessor.onChange('y');
  await delay(30);
  console.log('submit pending', later.value.note, events.join(' | '));
  laterDir.onSubmit(undefined);
  console.log('on submit', later.value.note, events.join(' | '));
  events.length = 0;

  const index = new FormControl(2);
  const segView = new StubView();
  const segAccessor = new NsValueAccessor(segView, 'selectedIndex', UNSET);
  const seg = new FormControlDirective([], [], segAccessor, 'always', [true, false]);
  seg.apply([index, undefined]);
  console.log('selectedIndex before view init', segView.selectedIndex);
  segAccessor.ngAfterViewInit();
  index.setValue(1);
  console.log('selectedIndex', segView.selectedIndex);
  const when = new Date(2024, 1, 29);
  const dateView = new StubView();
  const dateAccessor = new NsValueAccessor(dateView, 'date', UNSET);
  const dated = new FormControlDirective([], [], dateAccessor, 'always', [true, false]);
  dated.apply([new FormControl(when), undefined]);
  console.log('date', dateView.date === when);
}

main();
