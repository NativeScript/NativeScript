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
  // Held untyped: a callback is removed by identity, which a typed function array's element read loses on iOS.
  _onDisabledChange: any[] = [];

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
    if (this._statusValue === v) return;
    this._statusValue = v;
    this._stateChanged();
  }

  /**
   * What Angular's NgControlStatus learns from the `_status`, `_pristine` and `_touched` signals its host bindings read:
   * one of them changed, so the view showing it is checked again.
   */
  _stateListeners: ControlStateObserver[] = [];

  private _stateChanged(): void {
    for (const observer of this._stateListeners.slice()) observer.controlStateChanged();
  }

  /** A form's submitted state changed: Angular's NgControlStatusGroup reads it as a signal. */
  _stateChangedOutside(): void {
    this._stateChanged();
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
    if (this._pristineValue === v) return;
    this._pristineValue = v;
    this._stateChanged();
  }

  get dirty(): boolean {
    return !this.pristine;
  }

  get touched(): boolean {
    return this._touchedValue;
  }
  private _setTouched(v: boolean): void {
    if (this._touchedValue === v) return;
    this._touchedValue = v;
    this._stateChanged();
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
    this._onDisabledChange.forEach((changeFn: any) => changeFn(true));
  }

  enable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this._setStatus(VALID);
    this._forEachChild((control: AbstractControl) => {
      control.enable({ ...opts, onlySelf: true });
    });
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
    this._updateAncestors({ ...opts, skipPristineCheck }, this);
    this._onDisabledChange.forEach((changeFn: any) => changeFn(false));
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

  _assignValidators(validators: any): void {
    this._rawValidators = Array.isArray(validators) ? validators.slice() : validators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
  }

  _assignAsyncValidators(validators: any): void {
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
  _onChange: any[] = [];
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
        this._onChange.forEach((changeFn: any) => changeFn(this.value, options.emitViewToModelChange !== false));
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

// ---- directives (packages/forms/src/directives) and @nativescript/angular's value accessors ----
//
// What the release build's template compiler makes for the forms directives an element selects. Each is given what
// Angular's injector would give it, which the template compiler resolves from the template: its view, its view's
// ChangeDetectorRef (as its markForCheck), the form directive it is under, and the value accessor and validator directives its element selects.
// Its inputs come in one call per check (`apply`), which runs ngOnChanges with the inputs that changed, as Angular does.
// What Angular reports from a template's structure (a formControlName with no form above it) is a build error instead.

const resolvedPromise = Promise.resolve(null);

export function booleanAttribute(value: unknown): boolean {
  return typeof value === 'boolean' ? value : value != null && value !== 'false';
}

/** What @nativescript/angular's renderer keeps of a view's classes: an ordered set on the view, written whole to className. */
function viewClasses(view: any): Map<string, boolean> {
  if (!view.ngCssClasses) {
    const classes = new Map<string, boolean>();
    for (const name of String(view.className ?? '').split(/\s+/)) if (name) classes.set(name, true);
    view.ngCssClasses = classes;
  }
  return view.ngCssClasses;
}

/** The renderer's addClass or removeClass on a view. */
export function setViewClass(view: any, name: string, on: boolean): void {
  const classes = viewClasses(view);
  if (on) classes.set(name, true);
  else classes.delete(name);
  view.className = Array.from(classes.keys()).join(' ');
}

/** One input's change, as ngOnChanges receives it. */
export class InputChange {
  constructor(public readonly previousValue: any, public readonly currentValue: any, public readonly firstChange: boolean) {}

  isFirstChange(): boolean {
    return this.firstChange;
  }
}

/** A directive's inputs as Angular checks them: each bound one is changed when its value is not Object.is the last. */
class Inputs {
  private readonly previous: any[] = [];
  private started = false;

  constructor(private readonly names: string[], private readonly bound: boolean[]) {}

  changes(values: any[]): Map<string, InputChange> {
    const out = new Map<string, InputChange>();
    for (let k = 0; k < this.names.length; k++) {
      if (!this.bound[k]) continue;
      if (this.started && Object.is(this.previous[k], values[k])) continue;
      out.set(this.names[k], new InputChange(this.previous[k], values[k], !this.started));
      this.previous[k] = values[k];
    }
    this.started = true;
    return out;
  }
}

/** Notified when a control's status, pristine or touched state changes. */
export abstract class ControlStateObserver {
  abstract controlStateChanged(): void;
}

/**
 * @nativescript/angular's value accessors: TextValueAccessor (TextField, TextView, SearchBar: `text`, its textChange
 * and blur), CheckedValueAccessor (Switch: `checked`), DateValueAccessor (DatePicker: `date`), TimeValueAccessor
 * (TimePicker: `time`), NumberValueAccessor (Slider: `value`) and SelectedIndexValueAccessor (SegmentedBar, ListPicker,
 * TabView: `selectedIndex`, written once the view is made). A change reaches the control 20 ms after its event, the
 * last of several in that time only, and a blank value is written as core's unsetValue, which the component passes.
 */
export class NsValueAccessor {
  private pendingChangeNotification: any = 0;
  private value: any = undefined;
  private viewInitialized = false;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private readonly view: any, readonly kind: string, private readonly unset: any) {}

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = (arg: any) => {
      if (this.pendingChangeNotification) clearTimeout(this.pendingChangeNotification);
      this.pendingChangeNotification = setTimeout(() => {
        this.pendingChangeNotification = 0;
        fn(arg);
      }, 20);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.view.isEnabled = !isDisabled;
  }

  writeValue(value: any): void {
    if (this.kind === 'text') {
      this.view.text = this.normalizeValue(value ? `${value}` : value);
    } else if (this.kind === 'selectedIndex') {
      this.value = this.normalizeValue(value);
      if (this.viewInitialized) this.view.selectedIndex = this.value;
    } else {
      this.view[this.kind] = this.normalizeValue(value);
    }
  }

  ngAfterViewInit(): void {
    if (this.kind !== 'selectedIndex') return;
    this.viewInitialized = true;
    this.view.selectedIndex = this.value;
  }

  private normalizeValue(value: any): any {
    return value === undefined || value === null ? this.unset : value;
  }
}

export abstract class AbstractControlDirective {
  get control(): AbstractControl | null {
    return null;
  }

  get value(): any {
    const control = this.control;
    return control ? control.value : null;
  }

  get valid(): boolean | null {
    const control = this.control;
    return control ? control.valid : null;
  }

  get invalid(): boolean | null {
    const control = this.control;
    return control ? control.invalid : null;
  }

  get pending(): boolean | null {
    const control = this.control;
    return control ? control.pending : null;
  }

  get disabled(): boolean | null {
    const control = this.control;
    return control ? control.disabled : null;
  }

  get enabled(): boolean | null {
    const control = this.control;
    return control ? control.enabled : null;
  }

  get errors(): ValidationErrors | null {
    const control = this.control;
    return control ? control.errors : null;
  }

  get pristine(): boolean | null {
    const control = this.control;
    return control ? control.pristine : null;
  }

  get dirty(): boolean | null {
    const control = this.control;
    return control ? control.dirty : null;
  }

  get touched(): boolean | null {
    const control = this.control;
    return control ? control.touched : null;
  }

  get status(): string | null {
    const control = this.control;
    return control ? control.status : null;
  }

  get untouched(): boolean | null {
    const control = this.control;
    return control ? control.untouched : null;
  }

  get statusChanges(): EventEmitter<FormControlStatus> | null {
    const control = this.control;
    return control ? control.statusChanges : null;
  }

  get valueChanges(): EventEmitter<any> | null {
    const control = this.control;
    return control ? control.valueChanges : null;
  }

  get path(): string[] | null {
    return null;
  }

  _composedValidatorFn: any = null;
  _composedAsyncValidatorFn: any = null;
  _rawValidators: any[] = [];
  _rawAsyncValidators: any[] = [];

  _setValidators(validators: any[] | undefined): void {
    this._rawValidators = validators || [];
    this._composedValidatorFn = composeValidators(this._rawValidators);
  }

  _setAsyncValidators(validators: any[] | undefined): void {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidatorFn = composeAsyncValidators(this._rawAsyncValidators);
  }

  get validator(): ValidatorFn | null {
    return this._composedValidatorFn || null;
  }

  get asyncValidator(): AsyncValidatorFn | null {
    return this._composedAsyncValidatorFn || null;
  }

  private _onDestroyCallbacks: any[] = [];

  _registerOnDestroy(fn: () => void): void {
    this._onDestroyCallbacks.push(fn);
  }

  _invokeOnDestroyCallbacks(): void {
    this._onDestroyCallbacks.forEach((fn: any) => fn());
    this._onDestroyCallbacks = [];
  }

  reset(value: any = undefined): void {
    this.control?.reset(value);
  }

  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    const control = this.control;
    return control ? control.hasError(errorCode, path) : false;
  }

  getError(errorCode: string, path?: Array<string | number> | string): any {
    const control = this.control;
    return control ? control.getError(errorCode, path) : null;
  }
}

/**
 * A form directive or a named group or array under one. What NgForm and the reactive form directives do for the
 * directives below them (Angular's `Form`) is declared here, done by those two.
 */
export abstract class ControlContainer extends AbstractControlDirective {
  name: string | number | null = null;

  get formDirective(): ControlContainer | null {
    return null;
  }

  override get path(): string[] | null {
    return null;
  }

  get submitted(): boolean {
    return false;
  }

  addControl(dir: NgControl): FormControl | null {
    return null;
  }

  removeControl(dir: NgControl): void {}

  addFormGroup(dir: ControlContainer): void {}

  removeFormGroup(dir: ControlContainer): void {}

  getFormGroup(dir: ControlContainer): FormGroup | null {
    return null;
  }

  addFormArray(dir: ControlContainer): void {}

  removeFormArray(dir: ControlContainer): void {}

  getFormArray(dir: ControlContainer): AbstractControl | null {
    return null;
  }

  updateModel(dir: NgControl, value: any): void {}
}

export abstract class NgControl extends AbstractControlDirective {
  _parent: ControlContainer | null = null;
  name: string | number | null = null;
  _accessor: NsValueAccessor | null = null;

  get valueAccessor(): any {
    return this._accessor;
  }

  abstract viewToModelUpdate(newValue: any): void;
}

function controlPath(name: string | null, parent: ControlContainer): string[] {
  const path = parent.path!.slice();
  path.push(name!);
  return path;
}

function describeControlLocation(dir: AbstractControlDirective): string {
  const path = dir.path;
  if (path && path.length > 1) return `path: '${path.join(' -> ')}'`;
  if (path?.[0]) return `name: '${path}'`;
  return 'unspecified name attribute';
}

function throwControlError(dir: AbstractControlDirective, message: string): void {
  throw new Error(`${message} ${describeControlLocation(dir)}`);
}

export function setUpControl(control: FormControl, dir: NgControl, callSetDisabledState: string = 'always'): void {
  if (!control) throwControlError(dir, 'Cannot find control with');
  const accessor = dir._accessor!;
  setUpValidators(control, dir);
  accessor.writeValue(control.value);
  if (control.disabled || callSetDisabledState === 'always') accessor.setDisabledState(control.disabled);
  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);
  setUpBlurPipeline(control, dir);
  setUpDisabledChangeHandler(control, dir);
}

export function cleanUpControl(control: FormControl | null, dir: NgControl, validateControlPresenceOnChange: boolean = true): void {
  const noop = () => {
    if (validateControlPresenceOnChange) throwControlError(dir, 'There is no FormControl instance attached to form control element with');
  };
  dir._accessor?.registerOnChange(noop);
  dir._accessor?.registerOnTouched(noop);
  cleanUpValidators(control, dir);
  if (control) {
    dir._invokeOnDestroyCallbacks();
    control._registerOnCollectionChange(() => {});
  }
}

function registerOnValidatorChange(validators: any[], onChange: () => void): void {
  for (const validator of validators) if (validator instanceof AbstractValidatorDirective) validator.registerOnValidatorChange(onChange);
}

function setUpDisabledChangeHandler(control: FormControl, dir: NgControl): void {
  const onDisabledChange = (isDisabled: boolean) => {
    dir._accessor!.setDisabledState(isDisabled);
  };
  control.registerOnDisabledChange(onDisabledChange);
  dir._registerOnDestroy(() => {
    control._unregisterOnDisabledChange(onDisabledChange);
  });
}

// A composed validator is null or a function: compared loosely, as the native build may hold null as undefined.
export function setUpValidators(control: AbstractControl, dir: AbstractControlDirective): void {
  const validators = getControlValidators(control);
  if (dir._composedValidatorFn != null) {
    control._assignValidators(mergeValidators(validators, dir._composedValidatorFn));
  } else if (typeof validators === 'function') {
    control._assignValidators([validators]);
  }
  const asyncValidators = getControlAsyncValidators(control);
  if (dir._composedAsyncValidatorFn != null) {
    control._assignAsyncValidators(mergeValidators(asyncValidators, dir._composedAsyncValidatorFn));
  } else if (typeof asyncValidators === 'function') {
    control._assignAsyncValidators([asyncValidators]);
  }
  const onValidatorChange = () => control.updateValueAndValidity();
  registerOnValidatorChange(dir._rawValidators, onValidatorChange);
  registerOnValidatorChange(dir._rawAsyncValidators, onValidatorChange);
}

export function cleanUpValidators(control: AbstractControl | null, dir: AbstractControlDirective): boolean {
  let isControlUpdated = false;
  if (control !== null) {
    if (dir._composedValidatorFn != null) {
      const validators = getControlValidators(control);
      if (Array.isArray(validators) && validators.length > 0) {
        const updatedValidators = validators.filter((validator: any) => validator !== dir._composedValidatorFn);
        if (updatedValidators.length !== validators.length) {
          isControlUpdated = true;
          control._assignValidators(updatedValidators);
        }
      }
    }
    if (dir._composedAsyncValidatorFn != null) {
      const asyncValidators = getControlAsyncValidators(control);
      if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
        const updatedAsyncValidators = asyncValidators.filter((asyncValidator: any) => asyncValidator !== dir._composedAsyncValidatorFn);
        if (updatedAsyncValidators.length !== asyncValidators.length) {
          isControlUpdated = true;
          control._assignAsyncValidators(updatedAsyncValidators);
        }
      }
    }
  }
  const noop = () => {};
  registerOnValidatorChange(dir._rawValidators, noop);
  registerOnValidatorChange(dir._rawAsyncValidators, noop);
  return isControlUpdated;
}

function setUpViewChangePipeline(control: FormControl, dir: NgControl): void {
  dir._accessor!.registerOnChange((newValue: any) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;
    if (control.updateOn === 'change') updateControl(control, dir);
  });
}

function setUpBlurPipeline(control: FormControl, dir: NgControl): void {
  dir._accessor!.registerOnTouched(() => {
    control._pendingTouched = true;
    if (control.updateOn === 'blur' && control._pendingChange) updateControl(control, dir);
    if (control.updateOn !== 'submit') control.markAsTouched();
  });
}

function updateControl(control: FormControl, dir: NgControl): void {
  if (control._pendingDirty) control.markAsDirty();
  control.setValue(control._pendingValue, { emitModelToViewChange: false });
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}

function setUpModelChangePipeline(control: FormControl, dir: NgControl): void {
  const onChange = (newValue?: any, emitModelEvent?: boolean) => {
    dir._accessor!.writeValue(newValue);
    if (emitModelEvent) dir.viewToModelUpdate(newValue);
  };
  control.registerOnChange(onChange);
  dir._registerOnDestroy(() => {
    control._unregisterOnChange(onChange);
  });
}

export function setUpFormContainer(control: AbstractControl, dir: ControlContainer): void {
  if (control == null) throwControlError(dir, 'Cannot find control with');
  setUpValidators(control, dir);
}

export function cleanUpFormContainer(control: AbstractControl, dir: ControlContainer): boolean {
  return cleanUpValidators(control, dir);
}

function isPropertyUpdated(changes: Map<string, InputChange>, viewModel: any): boolean {
  const change = changes.get('model');
  if (!change) return false;
  if (change.isFirstChange()) return true;
  return !Object.is(viewModel, change.currentValue);
}

function syncPendingControls(form: AbstractControl, directives: NgControl[]): void {
  form._syncPendingControls();
  directives.forEach((dir: NgControl) => {
    const control = dir.control as FormControl;
    if (control.updateOn === 'submit' && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
}

// ---- validator directives (directives/validators.ts): the ones whose selectors a NativeScript element can match ----

export abstract class AbstractValidatorDirective {
  private _validator: ValidatorFn = nullValidator;
  private _onChange: (() => void) | null = null;
  private readonly inputs: Inputs;
  _enabled = false;

  constructor(private readonly inputName: string, bound: boolean) {
    this.inputs = new Inputs([inputName], [bound]);
  }

  apply(input: any[]): void {
    const changes = this.inputs.changes(input);
    const change = changes.get(this.inputName);
    if (change) {
      const value = this.normalizeInput(change.currentValue);
      this._enabled = this.enabled(value);
      this._validator = this._enabled ? this.createValidator(value) : nullValidator;
      const onChange = this._onChange;
      if (onChange) onChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this._validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onChange = fn;
  }

  enabled(input: any): boolean {
    return input != null;
  }

  abstract normalizeInput(input: any): any;

  abstract createValidator(input: any): ValidatorFn;
}

export class RequiredValidator extends AbstractValidatorDirective {
  constructor(bound: boolean) {
    super('required', bound);
  }

  override normalizeInput(input: any): any {
    return booleanAttribute(input);
  }

  override createValidator(input: any): ValidatorFn {
    return requiredValidator;
  }

  override enabled(input: any): boolean {
    return input;
  }
}

export class MinLengthValidator extends AbstractValidatorDirective {
  constructor(bound: boolean) {
    super('minlength', bound);
  }

  override normalizeInput(input: any): any {
    return toInteger(input);
  }

  override createValidator(minlength: any): ValidatorFn {
    return minLengthValidator(minlength);
  }
}

export class MaxLengthValidator extends AbstractValidatorDirective {
  constructor(bound: boolean) {
    super('maxlength', bound);
  }

  override normalizeInput(input: any): any {
    return toInteger(input);
  }

  override createValidator(maxlength: any): ValidatorFn {
    return maxLengthValidator(maxlength);
  }
}

export class PatternValidator extends AbstractValidatorDirective {
  constructor(bound: boolean) {
    super('pattern', bound);
  }

  override normalizeInput(input: any): any {
    return input;
  }

  override createValidator(input: any): ValidatorFn {
    return patternValidator(input);
  }
}

export class EmailValidator extends AbstractValidatorDirective {
  constructor(bound: boolean) {
    super('email', bound);
  }

  override normalizeInput(input: any): any {
    return input === '' || input === true || input === 'true';
  }

  override createValidator(input: any): ValidatorFn {
    return emailValidator;
  }

  override enabled(input: any): boolean {
    return input;
  }
}

function toInteger(value: any): number {
  return typeof value === 'number' ? value : parseInt(value, 10);
}

// ---- NgControlStatus and NgControlStatusGroup ----

const STATUS_CLASSES = ['ng-untouched', 'ng-touched', 'ng-pristine', 'ng-dirty', 'ng-valid', 'ng-invalid', 'ng-pending', 'ng-submitted'];

/**
 * NgControlStatus (on a control's element) and NgControlStatusGroup (`group`, on a container's): the `ng-*` classes of
 * its directive's control, a class written only when it changes, and the view checked again when the control's
 * status, pristine or touched state, or the form's submitted state, changes.
 */
export class NgControlStatus extends ControlStateObserver {
  private readonly applied: boolean[] = [];
  private watched: AbstractControl | null = null;

  constructor(private readonly view: any, private readonly markForCheck: () => void, private readonly dir: AbstractControlDirective, private readonly group: boolean) {
    super();
  }

  /** The classes as the control is now: run when its view is checked. */
  check(): void {
    const control = this.dir.control;
    if (control !== this.watched) {
      if (this.watched) this.unwatch(this.watched);
      this.watched = control;
      if (control) control._stateListeners.push(this);
    }
    const flags = [!!control?.untouched, !!control?.touched, !!control?.pristine, !!control?.dirty, !!control?.valid, !!control?.invalid, !!control?.pending];
    if (this.group) flags.push(this.dir instanceof ControlContainer && this.dir.submitted);
    for (let k = 0; k < flags.length; k++) {
      const first = this.applied.length <= k;
      if (!first && this.applied[k] === flags[k]) continue;
      this.applied[k] = flags[k];
      if (!first || flags[k]) setViewClass(this.view, STATUS_CLASSES[k], flags[k]);
    }
  }

  override controlStateChanged(): void {
    this.markForCheck();
    this.check();
  }

  destroy(): void {
    if (this.watched) this.unwatch(this.watched);
    this.watched = null;
  }

  private unwatch(control: AbstractControl): void {
    const at = control._stateListeners.indexOf(this);
    if (at > -1) control._stateListeners.splice(at, 1);
  }
}

// ---- template-driven directives ----

export class NgModel extends NgControl {
  _control: FormControl = new FormControl();
  _registered = false;
  viewModel: any;
  isDisabled: any;
  model: any;
  options: { name?: string; standalone?: boolean; updateOn?: FormHooks } | undefined;
  readonly update = new EventEmitter<any>();
  private readonly inputs: Inputs;

  /** `bound` says which of ngModel, name, ngModelOptions and disabled the element binds or sets. */
  constructor(parent: ControlContainer | null, validators: any[], asyncValidators: any[], accessor: NsValueAccessor, private readonly markForCheck: () => void, bound: boolean[]) {
    super();
    this._parent = parent;
    this._accessor = accessor;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.inputs = new Inputs(['model', 'name', 'options', 'isDisabled'], bound);
  }

  /** The element's ngModel, name, ngModelOptions and disabled, at each check. */
  apply(values: any[]): void {
    const changes = this.inputs.changes(values);
    if (changes.has('model')) this.model = values[0];
    if (changes.has('name')) this.name = values[1];
    if (changes.has('options')) this.options = values[2];
    if (changes.has('isDisabled')) this.isDisabled = values[3];
    if (changes.size) this.ngOnChanges(changes);
  }

  ngOnChanges(changes: Map<string, InputChange>): void {
    this._checkName();
    if (!this._registered || changes.has('name')) {
      if (this._registered) {
        this._checkName();
        const formDirective = this.formDirective;
        if (formDirective) {
          const oldName = changes.get('name')!.previousValue;
          (formDirective as NgForm).removeControlAt(this._getPath(oldName), oldName);
        }
      }
      this._setUpControl();
    }
    if (changes.has('isDisabled')) this._updateDisabled(changes.get('isDisabled')!);
    if (isPropertyUpdated(changes, this.viewModel)) {
      this._updateValue(this.model);
      this.viewModel = this.model;
    }
  }

  ngOnDestroy(): void {
    this.formDirective?.removeControl(this);
  }

  override get control(): FormControl {
    return this._control;
  }

  override get path(): string[] {
    return this._getPath(this.name);
  }

  get formDirective(): ControlContainer | null {
    const parent = this._parent;
    return parent ? parent.formDirective : null;
  }

  override viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  private _setUpControl(): void {
    this._setUpdateStrategy();
    if (this._isStandalone()) this._setUpStandalone();
    else this.formDirective!.addControl(this);
    this._registered = true;
  }

  private _setUpdateStrategy(): void {
    const options = this.options;
    if (options && options.updateOn != null) this.control._updateOn = options.updateOn;
  }

  _isStandalone(): boolean {
    const options = this.options;
    return !this._parent || !!(options && options.standalone);
  }

  private _setUpStandalone(): void {
    setUpControl(this.control, this);
    this.control.updateValueAndValidity({ emitEvent: false });
  }

  _setupWithForm(): void {
    setUpControl(this.control, this);
  }

  private _checkName(): void {
    const options = this.options;
    if (options && options.name) this.name = options.name;
    if (!this._isStandalone() && !this.name) {
      throw new Error(`NG01352: If ngModel is used within a form tag, either the name attribute must be set or the form
    control must be defined as 'standalone' in ngModelOptions.

    Example 1: <input [(ngModel)]="person.firstName" name="first">
    Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">`);
    }
  }

  private _updateValue(value: any): void {
    resolvedPromise.then(() => {
      this.control.setValue(value, { emitViewToModelChange: false });
      this.markForCheck();
    });
  }

  private _updateDisabled(change: InputChange): void {
    const disabledValue = change.currentValue;
    const isDisabled = disabledValue !== 0 && booleanAttribute(disabledValue);
    resolvedPromise.then(() => {
      if (isDisabled && !this.control.disabled) this.control.disable();
      else if (!isDisabled && this.control.disabled) this.control.enable();
      this.markForCheck();
    });
  }

  private _getPath(controlName: string): string[] {
    const parent = this._parent;
    return parent ? controlPath(controlName, parent) : [controlName];
  }
}

export class NgForm extends ControlContainer {
  private _submitted = false;
  private readonly _directives: NgModel[] = [];
  readonly form: FormGroup;
  readonly ngSubmit = new EventEmitter<any>();
  options: { updateOn?: FormHooks } | undefined;
  private readonly inputs: Inputs;

  private readonly callSetDisabledState: string;

  constructor(validators: any[], asyncValidators: any[], callSetDisabledState: string, bound: boolean[]) {
    super();
    this.callSetDisabledState = callSetDisabledState;
    this.form = new FormGroup({}, composeValidators(validators), composeAsyncValidators(asyncValidators));
    this.inputs = new Inputs(['options'], bound);
  }

  /** The element's ngFormOptions at each check. */
  apply(values: any[]): void {
    if (this.inputs.changes(values).has('options')) this.options = values[0];
  }

  override get submitted(): boolean {
    return this._submitted;
  }

  private _setSubmitted(value: boolean): void {
    if (this._submitted === value) return;
    this._submitted = value;
    this.form._stateChangedOutside();
  }

  ngAfterViewInit(): void {
    this._setUpdateStrategy();
  }

  override get formDirective(): ControlContainer {
    return this;
  }

  override get control(): FormGroup {
    return this.form;
  }

  override get path(): string[] {
    return [];
  }

  get controls(): { [key: string]: AbstractControl } {
    const controls: any = this.form.controls;
    return controls;
  }

  override addControl(dir: NgControl): FormControl | null {
    const model = dir as NgModel;
    resolvedPromise.then(() => {
      const container = this._findContainer(model.path);
      model._control = container.registerControl(model.name, model.control) as FormControl;
      model._setupWithForm();
      model.control.updateValueAndValidity({ emitEvent: false });
      this._directives.push(model);
    });
    return null;
  }

  getControl(dir: NgControl): FormControl | null {
    return this.form.get(dir.path!) as FormControl;
  }

  override removeControl(dir: NgControl): void {
    const model = dir as NgModel;
    resolvedPromise.then(() => {
      const container = this._findContainer(model.path);
      container?.removeControl(model.name);
      const at = this._directives.indexOf(model);
      if (at > -1) this._directives.splice(at, 1);
    });
  }

  /** removeControl of the control a directive had at `path` under `name`, before its name changed. */
  removeControlAt(path: string[], name: string): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(path);
      container?.removeControl(name);
    });
  }

  override addFormGroup(dir: ControlContainer): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path!);
      const group = new FormGroup({});
      setUpFormContainer(group, dir);
      container.registerControl(String(dir.name), group);
      group.updateValueAndValidity({ emitEvent: false });
    });
  }

  override removeFormGroup(dir: ControlContainer): void {
    resolvedPromise.then(() => {
      const container = this._findContainer(dir.path!);
      container?.removeControl(String(dir.name));
    });
  }

  override getFormGroup(dir: ControlContainer): FormGroup | null {
    return this.form.get(dir.path!) as FormGroup;
  }

  override addFormArray(dir: ControlContainer): void {}

  override removeFormArray(dir: ControlContainer): void {}

  override getFormArray(dir: ControlContainer): AbstractControl | null {
    return this.form.get(dir.path!);
  }

  override updateModel(dir: NgControl, value: any): void {
    resolvedPromise.then(() => {
      const ctrl = this.form.get(dir.path!) as FormControl;
      ctrl.setValue(value);
    });
  }

  setValue(value: { [key: string]: any }): void {
    this.control.setValue(value);
  }

  onSubmit($event?: any): boolean {
    this._setSubmitted(true);
    syncPendingControls(this.form, this._directives);
    this.ngSubmit.emit($event);
    this.form._events.next(new FormSubmittedEvent(this.control));
    return false;
  }

  onReset(): void {
    this.resetForm();
  }

  resetForm(value: any = undefined): void {
    this.form.reset(value);
    this._setSubmitted(false);
  }

  private _setUpdateStrategy(): void {
    const options = this.options;
    if (options && options.updateOn != null) this.form._updateOn = options.updateOn;
  }

  private _findContainer(path: string[]): FormGroup {
    path.pop();
    return path.length ? (this.form.get(path) as FormGroup) : this.form;
  }
}

/** NgModelGroup, FormGroupName (a group, `formGroupName`) and FormArrayName (`array`): a named control of the form above. */
export class AbstractFormGroupDirective extends ControlContainer {
  _parent: ControlContainer;
  private readonly inputs: Inputs;

  constructor(parent: ControlContainer, validators: any[], asyncValidators: any[], private readonly array: boolean, bound: boolean[]) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.inputs = new Inputs(['name'], bound);
  }

  /** The element's ngModelGroup, formGroupName or formArrayName at each check. */
  apply(values: any[]): void {
    if (this.inputs.changes(values).has('name')) this.name = values[0];
  }

  ngOnInit(): void {
    if (this.array) this.formDirective!.addFormArray(this);
    else this.formDirective!.addFormGroup(this);
  }

  ngOnDestroy(): void {
    const formDirective = this.formDirective;
    if (!formDirective) return;
    if (this.array) formDirective.removeFormArray(this);
    else formDirective.removeFormGroup(this);
  }

  override get control(): AbstractControl | null {
    const formDirective = this.formDirective;
    if (!formDirective) return null;
    return this.array ? formDirective.getFormArray(this) : formDirective.getFormGroup(this);
  }

  override get path(): string[] {
    const name = this.name;
    return controlPath(name == null ? name : String(name), this._parent);
  }

  override get formDirective(): ControlContainer | null {
    const parent = this._parent;
    return parent ? parent.formDirective : null;
  }
}

export class NgModelGroup extends AbstractFormGroupDirective {}
export class FormGroupName extends AbstractFormGroupDirective {}
export class FormArrayName extends AbstractFormGroupDirective {}

// ---- reactive directives ----

/** FormGroupDirective (`[formGroup]`) and FormArrayDirective (`[formArray]`). */
export class AbstractFormDirective extends ControlContainer {
  private _submitted = false;
  private _oldForm: AbstractControl | undefined;
  private readonly _onCollectionChange = () => this._updateDomValue();
  directives: FormControlName[] = [];
  form!: AbstractControl;
  readonly ngSubmit = new EventEmitter<any>();
  private readonly inputs: Inputs;

  private readonly callSetDisabledState: string;
  private readonly inputName: string;

  constructor(validators: any[], asyncValidators: any[], callSetDisabledState: string, inputName: string, bound: boolean[]) {
    super();
    this.callSetDisabledState = callSetDisabledState;
    this.inputName = inputName;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.inputs = new Inputs(['form'], bound);
  }

  /** The element's formGroup or formArray at each check. */
  apply(values: any[]): void {
    const changes = this.inputs.changes(values);
    if (changes.has('form')) this.form = values[0];
    if (changes.size) this.onChanges(changes);
  }

  override get submitted(): boolean {
    return this._submitted;
  }

  private _setSubmitted(value: boolean): void {
    if (this._submitted === value) return;
    this._submitted = value;
    this.form._stateChangedOutside();
  }

  private onChanges(changes: Map<string, InputChange>): void {
    if (!this.form) {
      throw new Error(`NG01050: ${this.inputName} expects a ${this.inputName === 'formGroup' ? 'FormGroup' : 'FormArray'} instance. Please pass one in.`);
    }
    if (changes.has('form')) {
      this._updateValidators();
      this._updateDomValue();
      this._updateRegistrations();
      this._oldForm = this.form;
    }
  }

  ngOnDestroy(): void {
    if (this.form) {
      cleanUpValidators(this.form, this);
      if (this.form._onCollectionChange === this._onCollectionChange) this.form._registerOnCollectionChange(() => {});
    }
  }

  override get formDirective(): ControlContainer {
    return this;
  }

  override get control(): AbstractControl {
    return this.form;
  }

  override get path(): string[] {
    return [];
  }

  override addControl(dir: NgControl): FormControl | null {
    const named = dir as FormControlName;
    const ctrl = this.form.get(named.path) as FormControl;
    named._setupWithForm(ctrl, this.callSetDisabledState);
    ctrl.updateValueAndValidity({ emitEvent: false });
    this.directives.push(named);
    return ctrl;
  }

  getControl(dir: NgControl): FormControl | null {
    return this.form.get(dir.path!) as FormControl;
  }

  override removeControl(dir: NgControl): void {
    const named = dir as FormControlName;
    cleanUpControl(named._controlOrNull(), named, false);
    const at = this.directives.indexOf(named);
    if (at > -1) this.directives.splice(at, 1);
  }

  override addFormGroup(dir: ControlContainer): void {
    this._setUpFormContainer(dir);
  }

  override removeFormGroup(dir: ControlContainer): void {
    this._cleanUpFormContainer(dir);
  }

  override getFormGroup(dir: ControlContainer): FormGroup | null {
    return this.form.get(dir.path!) as FormGroup;
  }

  override getFormArray(dir: ControlContainer): AbstractControl | null {
    return this.form.get(dir.path!);
  }

  override addFormArray(dir: ControlContainer): void {
    this._setUpFormContainer(dir);
  }

  override removeFormArray(dir: ControlContainer): void {
    this._cleanUpFormContainer(dir);
  }

  override updateModel(dir: NgControl, value: any): void {
    const ctrl = this.form.get(dir.path!) as FormControl;
    ctrl.setValue(value);
  }

  onReset(): void {
    this.resetForm();
  }

  resetForm(value: any = undefined, options: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    this.form.reset(value, options);
    this._setSubmitted(false);
  }

  onSubmit($event?: any): boolean {
    this._setSubmitted(true);
    syncPendingControls(this.form, this.directives);
    this.ngSubmit.emit($event);
    this.form._events.next(new FormSubmittedEvent(this.control));
    return false;
  }

  _updateDomValue(): void {
    this.directives.forEach((dir: FormControlName) => {
      const oldCtrl = dir._controlOrNull();
      const newCtrl = this.form.get(dir.path);
      if (oldCtrl !== newCtrl) {
        cleanUpControl(oldCtrl || null, dir);
        if (newCtrl instanceof FormControl) dir._setupWithForm(newCtrl, this.callSetDisabledState);
      }
    });
    this.form._updateTreeValidity({ emitEvent: false });
  }

  private _setUpFormContainer(dir: ControlContainer): void {
    const ctrl = this.form.get(dir.path!)!;
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private _cleanUpFormContainer(dir: ControlContainer): void {
    const ctrl = this.form?.get(dir.path!);
    if (ctrl) {
      const isControlUpdated = cleanUpFormContainer(ctrl, dir);
      if (isControlUpdated) ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private _updateRegistrations(): void {
    this.form._registerOnCollectionChange(this._onCollectionChange);
    this._oldForm?._registerOnCollectionChange(() => {});
  }

  private _updateValidators(): void {
    setUpValidators(this.form, this);
    if (this._oldForm) cleanUpValidators(this._oldForm, this);
  }
}

export class FormGroupDirective extends AbstractFormDirective {}
export class FormArrayDirective extends AbstractFormDirective {}

export class FormControlName extends NgControl {
  private _added = false;
  viewModel: any;
  private _control: FormControl | null = null;
  model: any;
  readonly update = new EventEmitter<any>();
  private readonly inputs: Inputs;

  /** `bound` says which of formControlName and ngModel the element binds or sets. */
  constructor(parent: ControlContainer, validators: any[], asyncValidators: any[], accessor: NsValueAccessor, bound: boolean[]) {
    super();
    this._parent = parent;
    this._accessor = accessor;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.inputs = new Inputs(['name', 'model'], bound);
  }

  apply(values: any[]): void {
    const changes = this.inputs.changes(values);
    if (changes.has('name')) this.name = values[0];
    if (changes.has('model')) this.model = values[1];
    if (changes.size) this.ngOnChanges(changes);
  }

  override get control(): FormControl {
    return this._control!;
  }

  _controlOrNull(): FormControl | null {
    return this._control;
  }

  _setupWithForm(control: FormControl, callSetDisabledState?: string): void {
    this._control = control;
    setUpControl(control, this, callSetDisabledState);
  }

  ngOnChanges(changes: Map<string, InputChange>): void {
    if (!this._added) this._setUpControl();
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.viewModel = this.model;
      this.formDirective!.updateModel(this, this.model);
    }
  }

  ngOnDestroy(): void {
    this.formDirective?.removeControl(this);
  }

  override viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }

  override get path(): string[] {
    const name = this.name;
    return controlPath(name == null ? name : String(name), this._parent!);
  }

  get formDirective(): ControlContainer | null {
    const parent = this._parent;
    return parent ? parent.formDirective : null;
  }

  private _setUpControl(): void {
    this._control = this.formDirective!.addControl(this);
    this._added = true;
  }
}

export class FormControlDirective extends NgControl {
  viewModel: any;
  form!: FormControl;
  model: any;
  readonly update = new EventEmitter<any>();
  private readonly inputs: Inputs;

  /** `bound` says which of formControl and ngModel the element binds. */
  private readonly callSetDisabledState: string;

  constructor(validators: any[], asyncValidators: any[], accessor: NsValueAccessor, callSetDisabledState: string, bound: boolean[]) {
    super();
    this.callSetDisabledState = callSetDisabledState;
    this._accessor = accessor;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.inputs = new Inputs(['form', 'model'], bound);
  }

  apply(values: any[]): void {
    const changes = this.inputs.changes(values);
    if (changes.has('form')) this.form = values[0];
    if (changes.has('model')) this.model = values[1];
    if (changes.size) this.ngOnChanges(changes);
  }

  ngOnChanges(changes: Map<string, InputChange>): void {
    const formChange = changes.get('form');
    if (formChange) {
      const previousForm: FormControl | null = formChange.previousValue;
      if (previousForm) cleanUpControl(previousForm, this, false);
      setUpControl(this.form, this, this.callSetDisabledState);
      this.form.updateValueAndValidity({ emitEvent: false });
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this.form.setValue(this.model);
      this.viewModel = this.model;
    }
  }

  ngOnDestroy(): void {
    if (this.form) cleanUpControl(this.form, this, false);
  }

  override get path(): string[] {
    return [];
  }

  override get control(): FormControl {
    return this.form;
  }

  override viewToModelUpdate(newValue: any): void {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }
}

// ---- What a component imports: the template compiler runs the directives they declare. ----

export const FormsModule: any = undefined;
export const ReactiveFormsModule: any = undefined;
