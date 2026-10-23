/**
 * @angular/forms 22.2.3 (packages/forms/src: model/*, validators.ts, form_builder.ts), ported for the release build,
 * which compiles this module in place of the package.
 *
 * The MIT License
 *
 * Copyright (c) 2010-2026 Google LLC. https://angular.dev/license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Differences from the package, each forced by what the release build compiles:
// - No rxjs: valueChanges, statusChanges and events are EventEmitters (Angular's EventEmitter is a Subject), and an async
//   validator's Promise or Observable is subscribed to directly, with forkJoin's semantics where several are composed
//   (which needs each Observable to complete: the Android build's rxjs has no completion).
// - `value` and `errors` are accessors over private fields; `status`, `pristine` and `touched` are plain fields
//   written through methods, not signals (the package reads its signals untracked, and the computed `_status`,
//   `_pristine`, `_touched` and `_hasRequired` that its directives read are left out).
// - ControlEvent declares `source`, which each event passes to it.
// - A FormGroup's `controls` is its own object holding the controls it was given (an object literal compiles to a
//   fixed shape, from which removeControl could not delete a key), and a FormArray's its own array: the native
//   build reads an array of controls typed, which copies it.
// - `new FormControl(x)` is a FormControl<any> unless its type argument is given: the package's typing of the
//   constructor (`FormControl<T | null>`, or `FormControl<T>` when nonNullable) needs a class expression.
// - NonNullableFormBuilder and UntypedFormBuilder are services of their own that make controls as FormBuilder does,
//   not FormBuilders (`instanceof FormBuilder` is false), and `nonNullable` gives a NonNullableFormBuilder. Each
//   injector gives the one root instance (`shared`), which `inject()` reads.
// - Errors carry the package's development-mode messages; its development-mode console warnings are not printed.
import { EventEmitter, InjectionToken, untracked } from '@angular/core';
import { type Observable } from 'rxjs';
import type { AsyncValidator, ControlValueAccessor, Validator } from '@angular#forms';

// ---- directives/validators.ts and directives/control_value_accessor.ts (the types) ----

// The interfaces an app implements are declarations only: a class implementing one is called through it untyped.
export type { AsyncValidator, ControlValueAccessor, Validator } from '@angular#forms';

export type ValidationErrors = { [key: string]: any };

export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null;
}

export interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

export const NG_VALUE_ACCESSOR = new InjectionToken<ReadonlyArray<ControlValueAccessor>>('NgValueAccessor');

// ---- validators.ts ----

function isEmptyInputValue(value: unknown): boolean {
  return value == null || lengthOrSize(value) === 0;
}

function lengthOrSize(value: unknown): number | null {
  // Read untyped: narrowed, a typed array or Set (`Set<number>`) would be cast to one of any values.
  const untyped: any = value;
  if (value == null) {
    return null;
  } else if (Array.isArray(value) || typeof value === 'string') {
    return untyped.length;
  } else if (value instanceof Set) {
    return untyped.size;
  }
  return null;
}

export const NG_VALIDATORS = new InjectionToken<ReadonlyArray<Validator | Function>>('NgValidators');
export const NG_ASYNC_VALIDATORS = new InjectionToken<ReadonlyArray<Validator | Function>>('NgAsyncValidators');

const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class Validators {
  static min(min: number): ValidatorFn {
    return minValidator(min);
  }

  static max(max: number): ValidatorFn {
    return maxValidator(max);
  }

  static required(control: AbstractControl): ValidationErrors | null {
    return requiredValidator(control);
  }

  static requiredTrue(control: AbstractControl): ValidationErrors | null {
    return requiredTrueValidator(control);
  }

  static email(control: AbstractControl): ValidationErrors | null {
    return emailValidator(control);
  }

  static minLength(minLength: number): ValidatorFn {
    return minLengthValidator(minLength);
  }

  static maxLength(maxLength: number): ValidatorFn {
    return maxLengthValidator(maxLength);
  }

  static pattern(pattern: string | RegExp): ValidatorFn {
    return patternValidator(pattern);
  }

  static nullValidator(control: AbstractControl): ValidationErrors | null {
    return nullValidator(control);
  }

  static compose(validators: null): null;
  static compose(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null;
  static compose(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn | null {
    return compose(validators);
  }

  static composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
    return composeAsync(validators);
  }
}

export function minValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || min == null) {
      return null;
    }
    const value = parseFloat(control.value);
    return !isNaN(value) && value < min ? { 'min': { 'min': min, 'actual': control.value } } : null;
  };
}

export function maxValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || max == null) {
      return null;
    }
    const value = parseFloat(control.value);
    return !isNaN(value) && value > max ? { 'max': { 'max': max, 'actual': control.value } } : null;
  };
}

export function requiredValidator(control: AbstractControl): ValidationErrors | null {
  return isEmptyInputValue(control.value) ? { 'required': true } : null;
}

export function requiredTrueValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === true ? null : { 'required': true };
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmptyInputValue(control.value)) {
    return null;
  }
  return EMAIL_REGEXP.test(control.value) ? null : { 'email': true };
}

export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length === null || length === 0) {
      return null;
    }
    return length < minLength ? { 'minlength': { 'requiredLength': minLength, 'actualLength': length } } : null;
  };
}

export function maxLengthValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = control.value?.length ?? lengthOrSize(control.value);
    if (length !== null && length > maxLength) {
      return { 'maxlength': { 'requiredLength': maxLength, 'actualLength': length } };
    }
    return null;
  };
}

export function patternValidator(pattern: string | RegExp): ValidatorFn {
  if (!pattern) return nullValidator;
  let regex: RegExp;
  let regexStr: string;
  if (typeof pattern === 'string') {
    regexStr = '';
    if (pattern.charAt(0) !== '^') regexStr += '^';
    regexStr += pattern;
    if (pattern.charAt(pattern.length - 1) !== '$') regexStr += '$';
    regex = new RegExp(regexStr);
  } else {
    regexStr = pattern.toString();
    regex = pattern;
  }
  return (control: AbstractControl): ValidationErrors | null => {
    if (isEmptyInputValue(control.value)) {
      return null;
    }
    const value: string = control.value;
    return regex.test(value) ? null : { 'pattern': { 'requiredPattern': regexStr, 'actualValue': value } };
  };
}

export function nullValidator(control: AbstractControl): ValidationErrors | null {
  return null;
}

function isPresent(o: any): boolean {
  return o != null;
}

function isPromise(obj: any): boolean {
  return !!obj && typeof obj.then === 'function';
}

function isSubscribable(obj: any): boolean {
  return !!obj && typeof obj.subscribe === 'function';
}

/** What rxjs's `subscribe` takes: an observer, or its `next`. */
function asObserver(observerOrNext: any): any {
  if (typeof observerOrNext !== 'function') return observerOrNext;
  return { next: observerOrNext };
}

/** rxjs's `from(promise)`: the resolved value, then completion, unless unsubscribed first. */
class PromiseSource {
  constructor(private readonly promise: any) {}

  subscribe(observerOrNext: any): any {
    const observer = asObserver(observerOrNext);
    const subscription = new Subscription();
    const settled: any = this.promise;
    settled.then(
      (value: any) => {
        if (subscription.closed) return;
        observer.next?.(value);
        observer.complete?.();
      },
      (error: any) => {
        if (!subscription.closed) observer.error?.(error);
      },
    );
    return subscription;
  }
}

class Subscription {
  closed = false;
  private readonly inner: any[] = [];

  add(inner: any): void {
    if (this.closed) inner.unsubscribe();
    else this.inner.push(inner);
  }

  unsubscribe(): void {
    if (this.closed) return;
    this.closed = true;
    for (const s of this.inner) s.unsubscribe();
  }
}

export function toObservable(value: any): any {
  const obs = isPromise(value) ? new PromiseSource(value) : value;
  if (!isSubscribable(obs)) {
    let errorMessage = `Expected async validator to return Promise or Observable.`;
    if (typeof value === 'object') {
      errorMessage += ' Are you using a synchronous validator where an async validator is expected?';
    }
    throw new Error(`NG01101: ${errorMessage} Find more at https://v22.angular.dev/errors/NG01101`);
  }
  return obs;
}

/** rxjs's `forkJoin(sources).pipe(map(project))`: each source's last value once all complete; nothing if one completes empty. */
class ForkJoin {
  constructor(private readonly sources: any[], private readonly project: (values: any[]) => any) {}

  subscribe(observerOrNext: any): any {
    const observer = asObserver(observerOrNext);
    const subscription = new Subscription();
    const values: any[] = this.sources.map(() => undefined);
    const has: boolean[] = this.sources.map(() => false);
    let remaining = this.sources.length;
    if (remaining === 0) {
      observer.complete?.();
      return subscription;
    }
    this.sources.forEach((source, index) => {
      if (subscription.closed) return;
      subscription.add(source.subscribe({
        next: (value: any) => {
          values[index] = value;
          has[index] = true;
        },
        error: (error: any) => {
          if (subscription.closed) return;
          subscription.unsubscribe();
          observer.error?.(error);
        },
        complete: () => {
          if (subscription.closed) return;
          remaining--;
          if (!has[index]) {
            subscription.unsubscribe();
            observer.complete?.();
            return;
          }
          if (remaining === 0) {
            subscription.unsubscribe();
            observer.next?.(this.project(values));
            observer.complete?.();
          }
        },
      }));
    });
    return subscription;
  }
}

function mergeErrors(arrayOfErrors: any[]): ValidationErrors | null {
  const res: { [key: string]: any } = {};
  for (const errors of arrayOfErrors) {
    if (errors != null) for (const key of Object.keys(errors)) res[key] = errors[key];
  }
  return Object.keys(res).length === 0 ? null : res;
}

function isValidatorFn(validator: any): boolean {
  return !validator.validate;
}

// Untyped until each is told apart: a Validator object read as a function would be wrapped as one.
function normalizeValidators(validators: any[]): ValidatorFn[] {
  const normalized: ValidatorFn[] = [];
  for (const validator of validators) {
    if (isValidatorFn(validator)) normalized.push(validator);
    else normalized.push((c: AbstractControl): ValidationErrors | null => (validator as any).validate(c));
  }
  return normalized;
}

function normalizeAsyncValidators(validators: any[]): AsyncValidatorFn[] {
  const normalized: AsyncValidatorFn[] = [];
  for (const validator of validators) {
    if (isValidatorFn(validator)) normalized.push(validator);
    else normalized.push((c: AbstractControl): any => (validator as any).validate(c));
  }
  return normalized;
}

function compose(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn | null {
  if (!validators) return null;
  const presentValidators: ValidatorFn[] = [];
  for (const v of validators) if (v != null) presentValidators.push(v);
  return composePresent(presentValidators);
}

function composePresent(presentValidators: ValidatorFn[]): ValidatorFn | null {
  if (presentValidators.length == 0) return null;
  return function (control: AbstractControl) {
    const results: any[] = [];
    for (const validator of presentValidators) results.push(validator(control));
    return mergeErrors(results);
  };
}

export function composeValidators(validators: any[]): ValidatorFn | null {
  return validators != null ? composePresent(normalizeValidators(validators)) : null;
}

function composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
  if (!validators) return null;
  const presentValidators: AsyncValidatorFn[] = [];
  for (const v of validators) if (v != null) presentValidators.push(v);
  return composeAsyncPresent(presentValidators);
}

function composeAsyncPresent(presentValidators: AsyncValidatorFn[]): AsyncValidatorFn | null {
  if (presentValidators.length == 0) return null;
  return function (control: AbstractControl) {
    const observables: any[] = [];
    for (const validator of presentValidators) observables.push(toObservable(validator(control)));
    return new ForkJoin(observables, (values: any[]) => mergeErrors(values));
  };
}

export function composeAsyncValidators(validators: any[]): AsyncValidatorFn | null {
  return validators != null ? composeAsyncPresent(normalizeAsyncValidators(validators)) : null;
}

export function mergeValidators<V>(controlValidators: V | V[] | null, dirValidator: V): V[] {
  if (controlValidators === null) return [dirValidator];
  return Array.isArray(controlValidators) ? [...controlValidators, dirValidator] : [controlValidators, dirValidator];
}

export function getControlValidators(control: AbstractControl): ValidatorFn | ValidatorFn[] | null {
  return control._rawValidators;
}

export function getControlAsyncValidators(control: AbstractControl): AsyncValidatorFn | AsyncValidatorFn[] | null {
  return control._rawAsyncValidators;
}

// Validators are held untyped from here on: a function boxed once keeps its identity, which hasValidator compares.

export function makeValidatorsArray(validators: any): any[] {
  if (!validators) return [];
  return Array.isArray(validators) ? validators : [validators];
}

export function hasValidator(validators: any, validator: any): boolean {
  return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}

export function addValidators(validators: any, currentValidators: any): any[] {
  const current = makeValidatorsArray(currentValidators);
  const validatorsToAdd = makeValidatorsArray(validators);
  validatorsToAdd.forEach((v: any) => {
    if (!hasValidator(current, v)) {
      current.push(v);
    }
  });
  return current;
}

export function removeValidators(validators: any, currentValidators: any): any[] {
  return makeValidatorsArray(currentValidators).filter((v: any) => !hasValidator(validators, v));
}

// ---- model/abstract_model.ts ----

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const PENDING = 'PENDING';
export const DISABLED = 'DISABLED';

export type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';

export abstract class ControlEvent<T = any> {
  constructor(public readonly source: AbstractControl<unknown>) {}
}

export class ValueChangeEvent<T> extends ControlEvent<T> {
  constructor(public readonly value: T, source: AbstractControl) {
    super(source);
  }
}

export class PristineChangeEvent extends ControlEvent {
  constructor(public readonly pristine: boolean, source: AbstractControl) {
    super(source);
  }
}

export class TouchedChangeEvent extends ControlEvent {
  constructor(public readonly touched: boolean, source: AbstractControl) {
    super(source);
  }
}

export class StatusChangeEvent extends ControlEvent {
  constructor(public readonly status: FormControlStatus, source: AbstractControl) {
    super(source);
  }
}

export class FormSubmittedEvent extends ControlEvent {
  constructor(source: AbstractControl) {
    super(source);
  }
}

export class FormResetEvent extends ControlEvent {
  constructor(source: AbstractControl) {
    super(source);
  }
}

export function pickValidators(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): ValidatorFn | ValidatorFn[] | null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}

function coerceToValidator(validator: any): ValidatorFn | null {
  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

export function pickAsyncValidators(asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): AsyncValidatorFn | AsyncValidatorFn[] | null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}

function coerceToAsyncValidator(asyncValidator: any): AsyncValidatorFn | null {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator || null;
}

export type FormHooks = 'change' | 'blur' | 'submit';

export interface AbstractControlOptions {
  validators?: ValidatorFn | ValidatorFn[] | null;
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  updateOn?: 'change' | 'blur' | 'submit';
}

export function isOptionsObj(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): validatorOrOpts is AbstractControlOptions {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}

function describeKey(isFormGroup: boolean, key: string | number): string {
  return isFormGroup ? `with name: '${key}'` : `at index: ${key}`;
}

/** `count` is how many controls the group or array has, `present` whether `key` names one. */
export function assertControlPresent(count: number, present: boolean, isGroup: boolean, key: string | number): void {
  if (!count) {
    throw new Error(`NG01000: \n    There are no form controls registered with this ${isGroup ? 'group' : 'array'} yet. If you're using ngModel,\n    you may want to check next tick (e.g. use setTimeout).\n  `);
  }
  if (!present) {
    throw new Error(`NG01001: Cannot find form control ${describeKey(isGroup, key)}`);
  }
}

export function assertAllValuesPresent(control: AbstractControl, isGroup: boolean, value: any): void {
  control._forEachChild((_: AbstractControl, key: any) => {
    if (value[key] === undefined) {
      throw new Error(`NG01002: Must supply a value for form control ${describeKey(isGroup, key)}. Find more at https://v22.angular.dev/errors/NG01002`);
    }
  });
}

export type ɵIsAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type ɵTypedOrUntyped<T, Typed, Untyped> = ɵIsAny<T, Untyped, Typed>;

export type ɵValue<T extends AbstractControl | undefined> = T extends AbstractControl<any, any> ? T['value'] : never;

export type ɵRawValue<T extends AbstractControl | undefined> = T extends AbstractControl<any, any> ? (T['setValue'] extends (v: infer R) => void ? R : never) : never;

export type ɵTokenize<S extends string, D extends string> = string extends S ? string[] : S extends `${infer T}${D}${infer U}` ? [T, ...ɵTokenize<U, D>] : [S];

export type ɵCoerceStrArrToNumArr<S> = S extends [infer Head, ...infer Tail] ? (Head extends `${number}` ? [number, ...ɵCoerceStrArrToNumArr<Tail>] : [Head, ...ɵCoerceStrArrToNumArr<Tail>]) : [];

export type ɵNavigate<T, K extends Array<string | number>> = T extends object
  ? K extends [infer Head, ...infer Tail]
    ? Head extends keyof T
      ? Tail extends (string | number)[]
        ? [] extends Tail
          ? T[Head]
          : ɵNavigate<T[Head], Tail>
        : any
      : never
    : any
  : any;

export type ɵWriteable<T> = { -readonly [P in keyof T]: T[P] };

export type ɵGetProperty<T, K> = K extends string ? ɵGetProperty<T, ɵCoerceStrArrToNumArr<ɵTokenize<K, '.'>>> : ɵWriteable<K> extends Array<string | number> ? ɵNavigate<T, ɵWriteable<K>> : any;

export abstract class AbstractControl<TValue = any, TRawValue extends TValue = TValue, TValueWithOptionalControlStates = any> {
  _pendingDirty = false;
  _hasOwnPendingAsyncValidator: null | { emitEvent: boolean; shouldHaveEmitted: boolean } = null;
  _pendingTouched = false;
  _onCollectionChange: () => void = () => {};
  _updateOn?: FormHooks;
  private _parent: AbstractControl | null = null;
  private _asyncValidationSubscription: any = undefined;
  // Held untyped and called as script calls them: a validator's result may be any object, read here as errors.
  private _composedValidatorFn: any = null;
  private _composedAsyncValidatorFn: any = null;
  _rawValidators: any = null;
  _rawAsyncValidators: any = null;
  _value: any = undefined;
  private _errors: ValidationErrors | null = null;
  private _statusValue: FormControlStatus | undefined = undefined;
  private _pristineValue = true;
  private _touchedValue = false;
  readonly _events = new EventEmitter<ControlEvent<TValue>>();
  public readonly events: EventEmitter<ControlEvent<TValue>> = this._events;
  public readonly valueChanges: EventEmitter<TValue> = new EventEmitter<TValue>();
  public readonly statusChanges: EventEmitter<FormControlStatus> = new EventEmitter<FormControlStatus>();
  _onDisabledChange: Array<(isDisabled: boolean) => void> = [];

  constructor(validators: ValidatorFn | ValidatorFn[] | null, asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    this._assignValidators(validators);
    this._assignAsyncValidators(asyncValidators);
  }

  get value(): TValue {
    return this._value;
  }

  get validator(): ValidatorFn | null {
    return this._composedValidatorFn;
  }
  set validator(validatorFn: ValidatorFn | null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }

  get asyncValidator(): AsyncValidatorFn | null {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  get parent(): FormGroup | FormArray | null {
    const parent: any = this._parent;
    return parent;
  }

  get status(): FormControlStatus {
    return this._currentStatus()!;
  }
  /** The status, undefined until the first is calculated: construction reads `disabled` before then. */
  private _currentStatus(): FormControlStatus | undefined {
    return this._statusValue;
  }
  private _setStatus(v: FormControlStatus): void {
    this._statusValue = v;
  }

  get valid(): boolean {
    return this._currentStatus() === VALID;
  }

  get invalid(): boolean {
    return this._currentStatus() === INVALID;
  }

  get pending(): boolean {
    return this._currentStatus() === PENDING;
  }

  get disabled(): boolean {
    return this._currentStatus() === DISABLED;
  }

  get enabled(): boolean {
    return this._currentStatus() !== DISABLED;
  }

  get errors(): ValidationErrors | null {
    return this._errors;
  }

  get pristine(): boolean {
    return this._pristineValue;
  }
  private _setPristine(v: boolean): void {
    this._pristineValue = v;
  }

  get dirty(): boolean {
    return !this.pristine;
  }

  get touched(): boolean {
    return this._touchedValue;
  }
  private _setTouched(v: boolean): void {
    this._touchedValue = v;
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get updateOn(): FormHooks {
    return this._updateOn ? this._updateOn : this._parent ? this._parent.updateOn : 'change';
  }

  setValidators(validators: ValidatorFn | ValidatorFn[] | null): void {
    this._assignValidators(validators);
  }

  setAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[] | null): void {
    this._assignAsyncValidators(validators);
  }

  addValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this._assignValidators(addValidators(validators, this._rawValidators));
  }

  addAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void {
    this._assignAsyncValidators(addValidators(validators, this._rawAsyncValidators));
  }

  removeValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this._assignValidators(removeValidators(validators, this._rawValidators));
  }

  removeAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void {
    this._assignAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
  }

  hasValidator(validator: ValidatorFn): boolean {
    return hasValidator(this._rawValidators, validator);
  }

  hasAsyncValidator(validator: AsyncValidatorFn): boolean {
    return hasValidator(this._rawAsyncValidators, validator);
  }

  clearValidators(): void {
    this.validator = null;
  }

  clearAsyncValidators(): void {
    this.asyncValidator = null;
  }

  markAsTouched(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    const changed = this.touched === false;
    this._setTouched(true);
    const sourceControl = opts.sourceControl ?? this;
    if (!opts.onlySelf) {
      this._parent?.markAsTouched({ ...opts, sourceControl });
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new TouchedChangeEvent(true, sourceControl));
    }
  }

  markAllAsDirty(opts: { emitEvent?: boolean } = {}): void {
    this.markAsDirty({ onlySelf: true, emitEvent: opts.emitEvent, sourceControl: this });
    this._forEachChild((control: AbstractControl) => control.markAllAsDirty(opts));
  }

  markAllAsTouched(opts: { emitEvent?: boolean } = {}): void {
    this.markAsTouched({ onlySelf: true, emitEvent: opts.emitEvent, sourceControl: this });
    this._forEachChild((control: AbstractControl) => control.markAllAsTouched(opts));
  }

  markAsUntouched(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    const changed = this.touched === true;
    this._setTouched(false);
    this._pendingTouched = false;
    const sourceControl = opts.sourceControl ?? this;
    this._forEachChild((control: AbstractControl) => {
      control.markAsUntouched({ onlySelf: true, emitEvent: opts.emitEvent, sourceControl });
    });
    if (!opts.onlySelf) {
      this._parent?._updateTouched(opts, sourceControl);
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new TouchedChangeEvent(false, sourceControl));
    }
  }

  markAsDirty(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    const changed = this.pristine === true;
    this._setPristine(false);
    const sourceControl = opts.sourceControl ?? this;
    if (!opts.onlySelf) {
      this._parent?.markAsDirty({ ...opts, sourceControl });
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new PristineChangeEvent(false, sourceControl));
    }
  }

  markAsPristine(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    const changed = this.pristine === false;
    this._setPristine(true);
    this._pendingDirty = false;
    const sourceControl = opts.sourceControl ?? this;
    this._forEachChild((control: AbstractControl) => {
      control.markAsPristine({ onlySelf: true, emitEvent: opts.emitEvent });
    });
    if (!opts.onlySelf) {
      this._parent?._updatePristine(opts, sourceControl);
    }
    if (changed && opts.emitEvent !== false) {
      this._events.next(new PristineChangeEvent(true, sourceControl));
    }
  }

  markAsPending(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    this._setStatus(PENDING);
    const sourceControl = opts.sourceControl ?? this;
    if (opts.emitEvent !== false) {
      this._events.next(new StatusChangeEvent(this.status, sourceControl));
      this.statusChanges.emit(this.status);
    }
    if (!opts.onlySelf) {
      this._parent?.markAsPending({ ...opts, sourceControl });
    }
  }

  disable(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this._setStatus(DISABLED);
    this._errors = null;
    this._forEachChild((control: AbstractControl) => {
      control.disable({ ...opts, onlySelf: true });
    });
    this._updateValue();
    const sourceControl = opts.sourceControl ?? this;
    if (opts.emitEvent !== false) {
      this._events.next(new ValueChangeEvent(this.value, sourceControl));
      this._events.next(new StatusChangeEvent(this.status, sourceControl));
      this.valueChanges.emit(this.value);
      this.statusChanges.emit(this.status);
    }
    this._updateAncestors({ ...opts, skipPristineCheck }, this);
    this._onDisabledChange.forEach((changeFn) => changeFn(true));
  }

  enable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this._setStatus(VALID);
    this._forEachChild((control: AbstractControl) => {
      control.enable({ ...opts, onlySelf: true });
    });
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
    this._updateAncestors({ ...opts, skipPristineCheck }, this);
    this._onDisabledChange.forEach((changeFn) => changeFn(false));
  }

  private _updateAncestors(opts: { onlySelf?: boolean; emitEvent?: boolean; skipPristineCheck?: boolean }, sourceControl: AbstractControl): void {
    if (!opts.onlySelf) {
      this._parent?.updateValueAndValidity(opts);
      if (!opts.skipPristineCheck) {
        this._parent?._updatePristine({}, sourceControl);
      }
      this._parent?._updateTouched({}, sourceControl);
    }
  }

  setParent(parent: FormGroup | FormArray | null): void {
    this._parent = parent;
  }

  abstract setValue(value: TRawValue, options?: Object): void;

  abstract patchValue(value: TValue, options?: Object): void;

  abstract reset(value?: TValueWithOptionalControlStates, options?: Object): void;

  getRawValue(): any {
    return this.value;
  }

  updateValueAndValidity(opts: { onlySelf?: boolean; emitEvent?: boolean; sourceControl?: AbstractControl } = {}): void {
    this._setInitialStatus();
    this._updateValue();
    if (this.enabled) {
      const shouldHaveEmitted = this._cancelExistingSubscription();
      this._errors = this._runValidator();
      this._setStatus(this._calculateStatus());
      if (this.status === VALID || this.status === PENDING) {
        this._runAsyncValidator(shouldHaveEmitted, opts.emitEvent);
      }
    }
    const sourceControl = opts.sourceControl ?? this;
    if (opts.emitEvent !== false) {
      this._events.next(new ValueChangeEvent<TValue>(this.value, sourceControl));
      this._events.next(new StatusChangeEvent(this.status, sourceControl));
      this.valueChanges.emit(this.value);
      this.statusChanges.emit(this.status);
    }
    if (!opts.onlySelf) {
      this._parent?.updateValueAndValidity({ ...opts, sourceControl });
    }
  }

  _updateTreeValidity(opts: { emitEvent?: boolean } = { emitEvent: true }): void {
    this._forEachChild((ctrl: AbstractControl) => ctrl._updateTreeValidity(opts));
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
  }

  private _setInitialStatus(): void {
    this._setStatus(this._allControlsDisabled() ? DISABLED : VALID);
  }

  private _runValidator(): ValidationErrors | null {
    const validator = this._composedValidatorFn;
    return validator ? validator(this) : null;
  }

  private _runAsyncValidator(shouldHaveEmitted: boolean, emitEvent?: boolean): void {
    const asyncValidator = this._composedAsyncValidatorFn;
    if (asyncValidator) {
      this._setStatus(PENDING);
      this._hasOwnPendingAsyncValidator = {
        emitEvent: emitEvent !== false,
        shouldHaveEmitted: shouldHaveEmitted !== false,
      };
      const obs = toObservable(asyncValidator(this));
      this._asyncValidationSubscription = obs.subscribe((errors: ValidationErrors | null) => {
        this._hasOwnPendingAsyncValidator = null;
        this.setErrors(errors, { emitEvent, shouldHaveEmitted });
      });
    }
  }

  private _cancelExistingSubscription(): boolean {
    const subscription = this._asyncValidationSubscription;
    if (subscription) {
      subscription.unsubscribe();
      const shouldHaveEmitted = (this._hasOwnPendingAsyncValidator?.emitEvent || this._hasOwnPendingAsyncValidator?.shouldHaveEmitted) ?? false;
      this._hasOwnPendingAsyncValidator = null;
      return shouldHaveEmitted;
    }
    return false;
  }

  setErrors(errors: ValidationErrors | null, opts: { emitEvent?: boolean; shouldHaveEmitted?: boolean } = {}): void {
    this._errors = errors;
    this._updateControlsErrors(opts.emitEvent !== false, this, opts.shouldHaveEmitted);
  }

  get<P extends string | readonly (string | number)[]>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null;
  get<P extends string | Array<string | number>>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null;
  get<P extends string | (string | number)[]>(path: P): AbstractControl<ɵGetProperty<TRawValue, P>> | null {
    if (path == null) return null;
    const currPath: Array<string | number> = Array.isArray(path) ? path : String(path).split('.');
    if (currPath.length === 0) return null;
    let control: AbstractControl | null = this;
    for (const name of currPath) control = control && control._find(name);
    return control;
  }

  getError(errorCode: string, path?: Array<string | number> | string): any {
    const control = path ? this.get(path) : this;
    const errors = control?.errors;
    return errors ? errors[errorCode] : null;
  }

  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    return !!this.getError(errorCode, path);
  }

  get root(): AbstractControl {
    let x: AbstractControl = this;
    while (x._parent) {
      x = x._parent;
    }
    return x;
  }

  _updateControlsErrors(emitEvent: boolean, changedControl: AbstractControl, shouldHaveEmitted?: boolean): void {
    this._setStatus(this._calculateStatus());
    if (emitEvent) {
      this.statusChanges.emit(this.status);
    }
    if (emitEvent || shouldHaveEmitted) {
      this._events.next(new StatusChangeEvent(this.status, changedControl));
    }
    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent, changedControl, shouldHaveEmitted);
    }
  }

  private _calculateStatus(): FormControlStatus {
    if (this._allControlsDisabled()) return DISABLED;
    if (this.errors) return INVALID;
    if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING)) return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

  abstract _updateValue(): void;

  abstract _forEachChild(cb: (c: AbstractControl, key: any) => void): void;

  abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  abstract _allControlsDisabled(): boolean;

  abstract _syncPendingControls(): boolean;

  _anyControlsHaveStatus(status: FormControlStatus): boolean {
    return this._anyControls((control: AbstractControl) => control.status === status);
  }

  _anyControlsDirty(): boolean {
    return this._anyControls((control: AbstractControl) => control.dirty);
  }

  _anyControlsTouched(): boolean {
    return this._anyControls((control: AbstractControl) => control.touched);
  }

  _updatePristine(opts: { onlySelf?: boolean }, changedControl: AbstractControl): void {
    const newPristine = !this._anyControlsDirty();
    const changed = this.pristine !== newPristine;
    this._setPristine(newPristine);
    if (!opts.onlySelf) {
      this._parent?._updatePristine(opts, changedControl);
    }
    if (changed) {
      this._events.next(new PristineChangeEvent(this.pristine, changedControl));
    }
  }

  _updateTouched(opts: { onlySelf?: boolean } = {}, changedControl: AbstractControl): void {
    this._setTouched(this._anyControlsTouched());
    this._events.next(new TouchedChangeEvent(this.touched, changedControl));
    if (!opts.onlySelf) {
      this._parent?._updateTouched(opts, changedControl);
    }
  }

  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
  }

  _setUpdateStrategy(opts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): void {
    if (isOptionsObj(opts) && opts.updateOn != null) {
      this._updateOn = opts.updateOn!;
    }
  }

  private _parentMarkedDirty(onlySelf?: boolean): boolean {
    const parent = this._parent;
    return !onlySelf && !!parent?.dirty && !parent._anyControlsDirty();
  }

  _find(name: string | number): AbstractControl | null {
    return null;
  }

  private _assignValidators(validators: any): void {
    this._rawValidators = Array.isArray(validators) ? validators.slice() : validators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
  }

  private _assignAsyncValidators(validators: any): void {
    this._rawAsyncValidators = Array.isArray(validators) ? validators.slice() : validators;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
  }
}

export function hasOwnControl(controls: { [key: string]: AbstractControl<any> }, name: string | number | symbol): boolean {
  return Object.prototype.hasOwnProperty.call(controls, name);
}

// ---- model/form_control.ts ----

export interface FormControlState<T> {
  value: T;
  disabled: boolean;
}

export interface FormControlOptions extends AbstractControlOptions {
  nonNullable?: boolean;
  initialValueIsDefault?: boolean;
}

function isFormControlState(formState: unknown): formState is FormControlState<unknown> {
  const state: any = formState;
  return typeof state === 'object' && state !== null && Object.keys(state).length === 2 && 'value' in state && 'disabled' in state;
}

const NULL: any = null;

function removeListItem<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) list.splice(index, 1);
}

export class FormControl<TValue = any> extends AbstractControl<TValue> {
  public defaultValue: TValue = NULL;
  _onChange: Array<Function> = [];
  _pendingValue: any = undefined;
  _pendingChange: boolean = false;

  constructor(formState: any = null, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this._applyFormState(formState);
    this._setUpdateStrategy(validatorOrOpts);
    this.updateValueAndValidity({
      onlySelf: true,
      emitEvent: !!this.asyncValidator,
    });
    if (isOptionsObj(validatorOrOpts) && ((validatorOrOpts as FormControlOptions).nonNullable || (validatorOrOpts as FormControlOptions).initialValueIsDefault)) {
      if (isFormControlState(formState)) {
        this.defaultValue = formState.value as TValue;
      } else {
        this.defaultValue = formState;
      }
    }
  }

  override setValue(value: TValue, options: { onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean } = {}): void {
    untracked(() => {
      this._value = this._pendingValue = value;
      if (this._onChange.length && options.emitModelToViewChange !== false) {
        this._onChange.forEach((changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
      }
      this.updateValueAndValidity(options);
    });
  }

  override patchValue(value: TValue, options: { onlySelf?: boolean; emitEvent?: boolean; emitModelToViewChange?: boolean; emitViewToModelChange?: boolean } = {}): void {
    this.setValue(value, options);
  }

  override reset(formState: TValue | FormControlState<TValue> = this.defaultValue, options: { onlySelf?: boolean; emitEvent?: boolean; overwriteDefaultValue?: boolean } = {}): void {
    this._applyFormState(formState);
    this.markAsPristine(options);
    this.markAsUntouched(options);
    this.setValue(this.value, options);
    if (options.overwriteDefaultValue) {
      this.defaultValue = this.value;
    }
    this._pendingChange = false;
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
  }

  override getRawValue(): TValue {
    return this.value;
  }

  override _updateValue(): void {}

  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    return false;
  }

  override _allControlsDisabled(): boolean {
    return this.disabled;
  }

  registerOnChange(fn: Function): void {
    this._onChange.push(fn);
  }

  _unregisterOnChange(fn: (value?: any, emitModelEvent?: boolean) => void): void {
    removeListItem(this._onChange, fn);
  }

  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    this._onDisabledChange.push(fn);
  }

  _unregisterOnDisabledChange(fn: (isDisabled: boolean) => void): void {
    removeListItem(this._onDisabledChange, fn);
  }

  override _forEachChild(cb: (c: AbstractControl, key: any) => void): void {}

  override _syncPendingControls(): boolean {
    if (this.updateOn === 'submit') {
      if (this._pendingDirty) this.markAsDirty();
      if (this._pendingTouched) this.markAsTouched();
      if (this._pendingChange) {
        this.setValue(this._pendingValue, { onlySelf: true, emitModelToViewChange: false });
        return true;
      }
    }
    return false;
  }

  private _applyFormState(formState: any): void {
    if (isFormControlState(formState)) {
      this._value = this._pendingValue = formState.value;
      formState.disabled ? this.disable({ onlySelf: true, emitEvent: false }) : this.enable({ onlySelf: true, emitEvent: false });
    } else {
      this._value = this._pendingValue = formState;
    }
  }
}

export type UntypedFormControl = FormControl<any>;
export const UntypedFormControl = FormControl;

export const isFormControl = (control: unknown): control is FormControl => control instanceof FormControl;

// ---- model/form_group.ts ----

export type ɵFormGroupArgumentValue<T extends { [K in keyof T]?: AbstractControl<any> }> = ɵTypedOrUntyped<T, Partial<{ [K in keyof T]: ɵValue<T[K]> | FormControlState<ɵValue<T[K]>> }>, { [key: string]: any }>;

export type ɵFormGroupValue<T extends { [K in keyof T]?: AbstractControl<any> }> = ɵTypedOrUntyped<T, Partial<{ [K in keyof T]: ɵValue<T[K]> }>, { [key: string]: any }>;

export type ɵFormGroupRawValue<T extends { [K in keyof T]?: AbstractControl<any> }> = ɵTypedOrUntyped<T, { [K in keyof T]: ɵRawValue<T[K]> }, { [key: string]: any }>;

export type ɵOptionalKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T];

export class FormGroup<TControl extends { [K in keyof TControl]: AbstractControl<any> } = any> extends AbstractControl<
  ɵTypedOrUntyped<TControl, ɵFormGroupValue<TControl>, any>,
  ɵTypedOrUntyped<TControl, ɵFormGroupRawValue<TControl>, any>,
  ɵTypedOrUntyped<TControl, ɵFormGroupArgumentValue<TControl>, any>
> {
  public controls: ɵTypedOrUntyped<TControl, TControl, { [key: string]: AbstractControl<any> }>;

  constructor(controls: TControl, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    const own: any = {};
    const given: any = controls;
    for (const key of Object.keys(given)) own[key] = given[key];
    this.controls = own;
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      emitEvent: !!this.asyncValidator,
    });
  }

  registerControl<K extends string & keyof TControl>(name: K, control: TControl[K]): TControl[K];
  registerControl(this: FormGroup<{ [key: string]: AbstractControl<any> }>, name: string, control: AbstractControl<any>): AbstractControl<any>;
  registerControl(name: string, control: AbstractControl<any>): any {
    const existingControl = this._find(name);
    if (existingControl) return existingControl;
    (this.controls as any)[name] = control;
    control.setParent(this as FormGroup);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }

  addControl(this: FormGroup<{ [key: string]: AbstractControl<any> }>, name: string, control: AbstractControl, options?: { emitEvent?: boolean }): void;
  addControl<K extends string & keyof TControl>(name: K, control: Required<TControl>[K], options?: { emitEvent?: boolean }): void;
  addControl(name: string, control: AbstractControl, options: { emitEvent?: boolean } = {}): void {
    this.registerControl(name as any, control as any);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }

  removeControl(this: FormGroup<{ [key: string]: AbstractControl<any> }>, name: string, options?: { emitEvent?: boolean }): void;
  removeControl<S extends string>(name: ɵOptionalKeys<TControl> & S, options?: { emitEvent?: boolean }): void;
  removeControl(name: string, options: { emitEvent?: boolean } = {}): void {
    const existingControl = this._find(name);
    if (existingControl) existingControl._registerOnCollectionChange(() => {});
    delete (this.controls as any)[name];
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }

  setControl<K extends string & keyof TControl>(name: K, control: TControl[K], options?: { emitEvent?: boolean }): void;
  setControl(this: FormGroup<{ [key: string]: AbstractControl<any> }>, name: string, control: AbstractControl, options?: { emitEvent?: boolean }): void;
  setControl(name: string, control: AbstractControl, options: { emitEvent?: boolean } = {}): void {
    const existingControl = this._find(name);
    if (existingControl) existingControl._registerOnCollectionChange(() => {});
    delete (this.controls as any)[name];
    if (control) this.registerControl(name as any, control as any);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }

  contains<K extends string>(controlName: K): boolean;
  contains(this: FormGroup<{ [key: string]: AbstractControl<any> }>, controlName: string): boolean;
  contains(controlName: string): boolean {
    return this._find(controlName)?.enabled === true;
  }

  override setValue(value: ɵFormGroupRawValue<TControl>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    untracked(() => {
      assertAllValuesPresent(this, true, value);
      const given: any = value;
      Object.keys(given).forEach((name) => {
        assertControlPresent(Object.keys(this.controls).length, hasOwnControl(this.controls, name), true, name);
        const target: AbstractControl = (this.controls as any)[name];
        target.setValue(given[name], {
          onlySelf: true,
          emitEvent: options.emitEvent,
        });
      });
      this.updateValueAndValidity(options);
    });
  }

  override patchValue(value: ɵFormGroupValue<TControl>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    if (value == null) return;
    const given: any = value;
    Object.keys(given).forEach((name) => {
      const existingControl = this._find(name);
      if (existingControl) {
        existingControl.patchValue(given[name], { onlySelf: true, emitEvent: options.emitEvent });
      }
    });
    this.updateValueAndValidity(options);
  }

  override reset(value: ɵTypedOrUntyped<TControl, ɵFormGroupArgumentValue<TControl>, any> = {} as any, options: { onlySelf?: boolean; emitEvent?: boolean; overwriteDefaultValue?: boolean } = {}): void {
    const given: any = value;
    this._forEachChild((control: AbstractControl, name: any) => {
      control.reset(given ? given[name] : null, { ...options, onlySelf: true });
    });
    this._updatePristine(options, this);
    this._updateTouched(options, this);
    this.updateValueAndValidity(options);
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
  }

  override getRawValue(): ɵTypedOrUntyped<TControl, ɵFormGroupRawValue<TControl>, any> {
    const acc: any = {};
    this._forEachChild((control: AbstractControl, name: any) => {
      acc[name] = control.getRawValue();
    });
    return acc;
  }

  override _syncPendingControls(): boolean {
    let subtreeUpdated = false;
    this._forEachChild((child: AbstractControl) => {
      subtreeUpdated = child._syncPendingControls() ? true : subtreeUpdated;
    });
    if (subtreeUpdated) this.updateValueAndValidity({ onlySelf: true });
    return subtreeUpdated;
  }

  override _forEachChild(cb: (c: AbstractControl, key: any) => void): void {
    const controls: { [key: string]: AbstractControl } = this.controls;
    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      control && cb(control, key);
    });
  }

  _setUpControls(): void {
    this._forEachChild((control: AbstractControl) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }

  override _updateValue(): void {
    this._value = this._reduceValue();
  }

  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    const controls: { [key: string]: AbstractControl } = this.controls;
    for (const controlName of Object.keys(controls)) {
      if (this.contains(controlName) && condition(controls[controlName])) {
        return true;
      }
    }
    return false;
  }

  _reduceValue(): any {
    const acc: any = {};
    this._forEachChild((control: AbstractControl, name: any) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
    });
    return acc;
  }

  override _allControlsDisabled(): boolean {
    const controls: { [key: string]: AbstractControl } = this.controls;
    for (const controlName of Object.keys(controls)) {
      if (controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(controls).length > 0 || this.disabled;
  }

  override _find(name: string | number): AbstractControl | null {
    const controls: { [key: string]: AbstractControl } = this.controls;
    return hasOwnControl(controls, name) ? controls[String(name)] : null;
  }
}

export type UntypedFormGroup = FormGroup<any>;
export const UntypedFormGroup = FormGroup;

export const isFormGroup = (control: unknown): control is FormGroup => control instanceof FormGroup;

export class FormRecord<TControl extends AbstractControl = AbstractControl> extends FormGroup<{ [key: string]: TControl }> {}

export const isFormRecord = (control: unknown): control is FormRecord => control instanceof FormRecord;

// ---- model/form_array.ts ----

export type ɵFormArrayValue<T extends AbstractControl<any>> = ɵTypedOrUntyped<T, Array<ɵValue<T>>, any[]>;

export type ɵFormArrayRawValue<T extends AbstractControl<any>> = ɵTypedOrUntyped<T, Array<ɵRawValue<T>>, any[]>;

export class FormArray<TControl extends AbstractControl<any> = any> extends AbstractControl<ɵTypedOrUntyped<TControl, ɵFormArrayValue<TControl>, any>, ɵTypedOrUntyped<TControl, ɵFormArrayRawValue<TControl>, any>> {
  private _list: AbstractControl[];

  get controls(): ɵTypedOrUntyped<TControl, Array<TControl>, Array<AbstractControl<any>>> {
    return this._list as any;
  }
  set controls(controls: ɵTypedOrUntyped<TControl, Array<TControl>, Array<AbstractControl<any>>>) {
    this._list = controls as any;
  }

  constructor(controls: Array<TControl>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    const given: AbstractControl[] = controls as any;
    this._list = given.slice();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      emitEvent: !!this.asyncValidator,
    });
  }

  at(index: number): ɵTypedOrUntyped<TControl, TControl, AbstractControl<any>> {
    const list: any = this._list;
    return list[this._adjustIndex(index)];
  }

  /** `at(index)`, undefined past the end as JavaScript's array read is. */
  private _at(index: number): AbstractControl | undefined {
    const list: any = this._list;
    return list[this._adjustIndex(index)];
  }

  push(control: TControl | Array<TControl>, options: { emitEvent?: boolean } = {}): void {
    const list = this._list;
    if (Array.isArray(control)) {
      const many: AbstractControl[] = control;
      for (const ctrl of many) {
        list.push(ctrl);
        this._registerControl(ctrl);
      }
    } else {
      list.push(control);
      this._registerControl(control);
    }
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }

  insert(index: number, control: TControl, options: { emitEvent?: boolean } = {}): void {
    const list = this._list;
    list.splice(index, 0, control);
    this._registerControl(control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  removeAt(index: number, options: { emitEvent?: boolean } = {}): void {
    const list = this._list;
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;
    if (list[adjustedIndex]) list[adjustedIndex]._registerOnCollectionChange(() => {});
    list.splice(adjustedIndex, 1);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  setControl(index: number, control: TControl, options: { emitEvent?: boolean } = {}): void {
    const list = this._list;
    let adjustedIndex = this._adjustIndex(index);
    if (adjustedIndex < 0) adjustedIndex = 0;
    if (list[adjustedIndex]) list[adjustedIndex]._registerOnCollectionChange(() => {});
    list.splice(adjustedIndex, 1);
    if (control) {
      list.splice(adjustedIndex, 0, control);
      this._registerControl(control);
    }
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }

  get length(): number {
    return this._list.length;
  }

  override setValue(value: ɵFormArrayRawValue<TControl>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    untracked(() => {
      assertAllValuesPresent(this, false, value);
      const given: any[] = value;
      given.forEach((newValue: any, index: number) => {
        assertControlPresent(this._list.length, index >= 0 && index < this._list.length, false, index);
        this._at(index)!.setValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
      });
      this.updateValueAndValidity(options);
    });
  }

  override patchValue(value: ɵFormArrayValue<TControl>, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    if (value == null) return;
    const given: any[] = value;
    given.forEach((newValue: any, index: number) => {
      const control = this._at(index);
      if (control) {
        control.patchValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
      }
    });
    this.updateValueAndValidity(options);
  }

  override reset(value: ɵTypedOrUntyped<TControl, ɵFormArrayValue<TControl>, any> = [] as any, options: { onlySelf?: boolean; emitEvent?: boolean; overwriteDefaultValue?: boolean } = {}): void {
    const given: any = value;
    this._forEachChild((control: AbstractControl, index: any) => {
      control.reset(given[index], { ...options, onlySelf: true });
    });
    this._updatePristine(options, this);
    this._updateTouched(options, this);
    this.updateValueAndValidity(options);
    if (options?.emitEvent !== false) {
      this._events.next(new FormResetEvent(this));
    }
  }

  override getRawValue(): ɵFormArrayRawValue<TControl> {
    const list = this._list;
    return list.map((control: AbstractControl) => control.getRawValue()) as any;
  }

  clear(options: { emitEvent?: boolean } = {}): void {
    const list = this._list;
    if (list.length < 1) return;
    this._forEachChild((control: AbstractControl) => control._registerOnCollectionChange(() => {}));
    list.splice(0);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }

  private _adjustIndex(index: number): number {
    return index < 0 ? index + this.length : index;
  }

  override _syncPendingControls(): boolean {
    let subtreeUpdated = false;
    this._forEachChild((child: AbstractControl) => {
      subtreeUpdated = child._syncPendingControls() ? true : subtreeUpdated;
    });
    if (subtreeUpdated) this.updateValueAndValidity({ onlySelf: true });
    return subtreeUpdated;
  }

  override _forEachChild(cb: (c: AbstractControl, key: any) => void): void {
    const list = this._list;
    list.forEach((control: AbstractControl, index: number) => {
      cb(control, index);
    });
  }

  override _updateValue(): void {
    const list = this._list;
    this._value = list.filter((control) => control.enabled || this.disabled).map((control) => control.value);
  }

  override _anyControls(condition: (c: AbstractControl) => boolean): boolean {
    const list = this._list;
    return list.some((control) => control.enabled && condition(control));
  }

  _setUpControls(): void {
    this._forEachChild((control: AbstractControl) => this._registerControl(control));
  }

  override _allControlsDisabled(): boolean {
    const list = this._list;
    for (const control of list) {
      if (control.enabled) return false;
    }
    return list.length > 0 || this.disabled;
  }

  private _registerControl(control: AbstractControl): void {
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
  }

  override _find(name: string | number): AbstractControl | null {
    if (typeof name === 'number') return this._at(name) ?? null;
    // A path's segment indexes the array as JavaScript's `controls[name]` does: only a canonical index names an element.
    const index = Number(name);
    return Number.isInteger(index) && index >= 0 && String(index) === name ? this._list[index] ?? null : null;
  }
}

export type UntypedFormArray = FormArray<any>;
export const UntypedFormArray = FormArray;

export const isFormArray = (control: unknown): control is FormArray => control instanceof FormArray;

// ---- form_builder.ts ----

function isAbstractControlOptions(options: AbstractControlOptions | { [key: string]: any } | null | undefined): options is AbstractControlOptions {
  return !!options && ((options as AbstractControlOptions).asyncValidators !== undefined || (options as AbstractControlOptions).validators !== undefined || (options as AbstractControlOptions).updateOn !== undefined);
}

type ValidatorConfig = ValidatorFn | AsyncValidatorFn | ValidatorFn[] | AsyncValidatorFn[];
type PermissiveControlConfig<T> = Array<T | FormControlState<T> | ValidatorConfig>;
interface PermissiveAbstractControlOptions extends Omit<AbstractControlOptions, 'updateOn'> {
  updateOn?: string;
}

export type ɵNullableFormControls<T> = { [K in keyof T]: ɵElement<T[K], null> };

export type ɵNonNullableFormControls<T> = { [K in keyof T]: ɵElement<T[K], never> };

export type ControlConfig<T> = [T | FormControlState<T>, (ValidatorFn | ValidatorFn[])?, (AsyncValidatorFn | AsyncValidatorFn[])?];

export type ɵElement<T, N extends null> = [T] extends [FormControl<infer U>]
  ? FormControl<U>
  : [T] extends [FormControl<infer U> | undefined]
    ? FormControl<U>
    : [T] extends [FormGroup<infer U>]
      ? FormGroup<U>
      : [T] extends [FormGroup<infer U> | undefined]
        ? FormGroup<U>
        : [T] extends [FormRecord<infer U>]
          ? FormRecord<U>
          : [T] extends [FormRecord<infer U> | undefined]
            ? FormRecord<U>
            : [T] extends [FormArray<infer U>]
              ? FormArray<U>
              : [T] extends [FormArray<infer U> | undefined]
                ? FormArray<U>
                : [T] extends [AbstractControl<infer U>]
                  ? AbstractControl<U>
                  : [T] extends [AbstractControl<infer U> | undefined]
                    ? AbstractControl<U>
                    : [T] extends [FormControlState<infer U>]
                      ? FormControl<U | N>
                      : [T] extends [PermissiveControlConfig<infer U>]
                        ? FormControl<Exclude<U, ValidatorConfig | PermissiveAbstractControlOptions> | N>
                        : FormControl<T | N>;

export class FormBuilder {
  private static _shared: FormBuilder | undefined;

  /** The root injector's FormBuilder, which `inject(FormBuilder)` gives. */
  static get shared(): FormBuilder {
    if (!FormBuilder._shared) FormBuilder._shared = new FormBuilder();
    return FormBuilder._shared;
  }

  private useNonNullable: boolean = false;

  get nonNullable(): NonNullableFormBuilder {
    return new NonNullableFormBuilder();
  }

  static _nonNullable(): FormBuilder {
    const nnfb = new FormBuilder();
    nnfb.useNonNullable = true;
    return nnfb;
  }

  group<T extends {}>(controls: T, options?: AbstractControlOptions | null): FormGroup<ɵNullableFormControls<T>>;
  group(controls: { [key: string]: any }, options: { [key: string]: any }): FormGroup;
  group(controls: { [key: string]: any }, options: AbstractControlOptions | { [key: string]: any } | null = null): FormGroup {
    const reducedControls = this._reduceControls(controls);
    let newOptions: FormControlOptions = {};
    if (isAbstractControlOptions(options)) {
      newOptions = options;
    } else if (options !== null) {
      const legacy: any = options;
      newOptions.validators = legacy.validator;
      newOptions.asyncValidators = legacy.asyncValidator;
    }
    return new FormGroup(reducedControls, newOptions);
  }

  record<T>(controls: { [key: string]: T }, options: AbstractControlOptions | null = null): FormRecord<ɵElement<T, null>> {
    const reducedControls = this._reduceControls(controls);
    return new FormRecord(reducedControls, options) as any;
  }

  control<T>(formState: T | FormControlState<T>, opts: FormControlOptions & { initialValueIsDefault: true }): FormControl<T>;
  control<T>(formState: T | FormControlState<T>, opts: FormControlOptions & { nonNullable: true }): FormControl<T>;
  control<T>(formState: T | FormControlState<T>, opts: FormControlOptions, asyncValidator: AsyncValidatorFn | AsyncValidatorFn[]): FormControl<T | null>;
  control<T>(formState: T | FormControlState<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl<T | null>;
  control<T>(formState: T | FormControlState<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl {
    let newOptions: FormControlOptions = {};
    if (!this.useNonNullable) {
      return new FormControl(formState, validatorOrOpts, asyncValidator);
    }
    if (isAbstractControlOptions(validatorOrOpts)) {
      newOptions = validatorOrOpts;
    } else {
      newOptions.validators = validatorOrOpts as ValidatorFn | ValidatorFn[] | null | undefined;
      newOptions.asyncValidators = asyncValidator;
    }
    return new FormControl<T>(formState, { ...newOptions, nonNullable: true });
  }

  array<T>(controls: Array<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray<ɵElement<T, null>> {
    const createdControls: any[] = controls.map((c) => this._createControl(c));
    return new FormArray(createdControls, validatorOrOpts, asyncValidator) as any;
  }

  _reduceControls(controls: { [k: string]: any }): { [key: string]: AbstractControl } {
    const createdControls: { [key: string]: AbstractControl } = {};
    Object.keys(controls).forEach((controlName) => {
      createdControls[controlName] = this._createControl(controls[controlName]);
    });
    return createdControls;
  }

  _createControl(controls: any): AbstractControl {
    if (controls instanceof FormControl) {
      return controls;
    } else if (controls instanceof AbstractControl) {
      return controls;
    } else if (Array.isArray(controls)) {
      const config: any[] = controls;
      const value: any = config[0];
      const validator: ValidatorFn | ValidatorFn[] | null = config.length > 1 ? config[1]! : null;
      const asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null = config.length > 2 ? config[2]! : null;
      return this.control(value, validator, asyncValidator);
    } else {
      return this.control(controls);
    }
  }
}

export class NonNullableFormBuilder {
  private static _shared: NonNullableFormBuilder | undefined;

  /** The root injector's NonNullableFormBuilder, which `inject(NonNullableFormBuilder)` gives. */
  static get shared(): NonNullableFormBuilder {
    if (!NonNullableFormBuilder._shared) NonNullableFormBuilder._shared = new NonNullableFormBuilder();
    return NonNullableFormBuilder._shared;
  }

  private readonly builder = FormBuilder._nonNullable();

  group<T extends {}>(controls: T, options?: AbstractControlOptions | null): FormGroup<ɵNonNullableFormControls<T>> {
    return this.builder.group(controls, options) as any;
  }

  record<T>(controls: { [key: string]: T }, options: AbstractControlOptions | null = null): FormRecord<ɵElement<T, never>> {
    return this.builder.record(controls, options) as any;
  }

  array<T>(controls: Array<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray<ɵElement<T, never>> {
    return this.builder.array(controls, validatorOrOpts, asyncValidator) as any;
  }

  control<T>(formState: T | FormControlState<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl<T> {
    return this.builder.control(formState, validatorOrOpts, asyncValidator) as any;
  }
}

export class UntypedFormBuilder {
  private static _shared: UntypedFormBuilder | undefined;

  /** The root injector's UntypedFormBuilder, which `inject(UntypedFormBuilder)` gives. */
  static get shared(): UntypedFormBuilder {
    if (!UntypedFormBuilder._shared) UntypedFormBuilder._shared = new UntypedFormBuilder();
    return UntypedFormBuilder._shared;
  }

  private readonly builder = new FormBuilder();

  get nonNullable(): NonNullableFormBuilder {
    return new NonNullableFormBuilder();
  }

  group(controlsConfig: { [key: string]: any }, options?: AbstractControlOptions | null): FormGroup<any>;
  group(controlsConfig: { [key: string]: any }, options: { [key: string]: any }): FormGroup<any>;
  group(controlsConfig: { [key: string]: any }, options: AbstractControlOptions | { [key: string]: any } | null = null): FormGroup<any> {
    return this.builder.group(controlsConfig, options);
  }

  record(controls: { [key: string]: any }, options: AbstractControlOptions | null = null): FormRecord<any> {
    return this.builder.record(controls, options) as any;
  }

  control(formState: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormControl<any> {
    return this.builder.control(formState, validatorOrOpts, asyncValidator);
  }

  array(controlsConfig: any[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null): FormArray<any> {
    return this.builder.array(controlsConfig, validatorOrOpts, asyncValidator);
  }
}

// ---- The modules and directives a component imports: what they select, the release build's template compiler runs. ----

export const FormsModule: any = undefined;
export const ReactiveFormsModule: any = undefined;
export const NgModel: any = undefined;
