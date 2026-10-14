// test262's harness/propertyHelper.js, typed: verifyProperty and the deprecated single-attribute checks, with
// hasOwnProperty and propertyIsEnumerable called on the object where test262 calls primordials it captured (`.call` on another
// receiver does not translate).
// verifyCallableProperty and verifyAccessorProperty are not ported; a test including them reads them as unported.
import { assert } from './assert.ts';
import { Test262Error } from './sta.ts';

const nonIndexNumericPropertyName = Math.pow(2, 32) - 1;
const hasOwn = (obj: any, name: any): boolean => obj.hasOwnProperty(name);

export function verifyProperty(obj: any, name: any, desc: any, options?: any): boolean {
  const label = (options && options.label) || String(name);
  const originalDesc: any = Object.getOwnPropertyDescriptor(obj, name);
  if (desc === undefined) {
    assert.sameValue(originalDesc, undefined, label + ' descriptor should be undefined');
    return true;
  }
  assert.ok(hasOwn(obj, name), label + ' should be an own property');
  assert.notSameValue(desc, null, 'The desc argument should be an object or undefined, null');
  assert.sameValue(typeof desc, 'object', 'The desc argument should be an object or undefined, ' + String(desc));
  const names = Object.getOwnPropertyNames(desc);
  for (let i = 0; i < names.length; i++) {
    assert.ok(['value', 'writable', 'enumerable', 'configurable', 'get', 'set'].includes(names[i]), 'Invalid descriptor field: ' + names[i]);
  }
  const failures: string[] = [];
  if (hasOwn(desc, 'value')) {
    if (!isSameValue(desc.value, originalDesc.value)) failures.push(label + ' descriptor value should be ' + String(desc.value));
    if (!isSameValue(desc.value, obj[name])) failures.push(label + ' value should be ' + String(desc.value));
  }
  if (hasOwn(desc, 'enumerable') && desc.enumerable !== undefined) {
    if (desc.enumerable !== originalDesc.enumerable || desc.enumerable !== isEnumerable(obj, name)) failures.push(label + ' descriptor should ' + (desc.enumerable ? '' : 'not ') + 'be enumerable');
  }
  if (hasOwn(desc, 'writable') && desc.writable !== undefined) {
    if (desc.writable !== originalDesc.writable || desc.writable !== isWritable(obj, name)) failures.push(label + ' descriptor should ' + (desc.writable ? '' : 'not ') + 'be writable');
  }
  if (hasOwn(desc, 'configurable') && desc.configurable !== undefined) {
    if (desc.configurable !== originalDesc.configurable || desc.configurable !== isConfigurable(obj, name)) failures.push(label + ' descriptor should ' + (desc.configurable ? '' : 'not ') + 'be configurable');
  }
  if (failures.length) assert.ok(false, failures.join('; '));
  if (options && options.restore) Object.defineProperty(obj, name, originalDesc);
  return true;
}

export const verifyPrimordialProperty = verifyProperty;

function isConfigurable(obj: any, name: any): boolean {
  try {
    delete obj[name];
  } catch (e) {
    if (!(e instanceof TypeError)) throw new Test262Error('Expected TypeError, got ' + e);
  }
  return !hasOwn(obj, name);
}

function isEnumerable(obj: any, name: any): boolean {
  let stringCheck = false;
  if (typeof name === 'string') {
    for (const x in obj) {
      if (x === name) {
        stringCheck = true;
        break;
      }
    }
  } else {
    stringCheck = true;
  }
  return stringCheck && hasOwn(obj, name) && obj.propertyIsEnumerable(name);
}

function isSameValue(a: any, b: any): boolean {
  if (a === 0 && b === 0) return 1 / a === 1 / b;
  if (a !== a && b !== b) return true;
  return a === b;
}

function isWritable(obj: any, name: any, verifyProp?: any, value?: any): boolean {
  const unlikelyValue = Array.isArray(obj) && name === 'length' ? nonIndexNumericPropertyName : 'unlikelyValue';
  let newValue: any = value || unlikelyValue;
  const hadValue = hasOwn(obj, name);
  const oldValue = obj[name];
  if (value === undefined && newValue === oldValue) newValue = newValue + '2';
  try {
    obj[name] = newValue;
  } catch (e) {
    if (!(e instanceof TypeError)) throw new Test262Error('Expected TypeError, got ' + e);
  }
  const writeSucceeded = isSameValue(obj[verifyProp || name], newValue);
  if (writeSucceeded) {
    if (hadValue) obj[name] = oldValue;
    else delete obj[name];
  }
  return writeSucceeded;
}

export function verifyEqualTo(obj: any, name: any, value: any): void {
  if (!isSameValue(obj[name], value)) throw new Test262Error('Expected obj[' + String(name) + '] to equal ' + value + ', actually ' + obj[name]);
}

export function verifyWritable(obj: any, name: any, verifyProp?: any, value?: any): void {
  if (!verifyProp) assert.ok((Object.getOwnPropertyDescriptor(obj, name) as any).writable, 'Expected obj[' + String(name) + '] to have writable:true.');
  if (!isWritable(obj, name, verifyProp, value)) throw new Test262Error('Expected obj[' + String(name) + '] to be writable, but was not.');
}

export function verifyNotWritable(obj: any, name: any, verifyProp?: any, value?: any): void {
  if (!verifyProp) assert.ok(!(Object.getOwnPropertyDescriptor(obj, name) as any).writable, 'Expected obj[' + String(name) + '] to have writable:false.');
  if (isWritable(obj, name, verifyProp)) throw new Test262Error('Expected obj[' + String(name) + '] NOT to be writable, but was.');
}

export function verifyEnumerable(obj: any, name: any): void {
  assert.ok((Object.getOwnPropertyDescriptor(obj, name) as any).enumerable, 'Expected obj[' + String(name) + '] to have enumerable:true.');
  if (!isEnumerable(obj, name)) throw new Test262Error('Expected obj[' + String(name) + '] to be enumerable, but was not.');
}

export function verifyNotEnumerable(obj: any, name: any): void {
  assert.ok(!(Object.getOwnPropertyDescriptor(obj, name) as any).enumerable, 'Expected obj[' + String(name) + '] to have enumerable:false.');
  if (isEnumerable(obj, name)) throw new Test262Error('Expected obj[' + String(name) + '] NOT to be enumerable, but was.');
}

export function verifyConfigurable(obj: any, name: any): void {
  assert.ok((Object.getOwnPropertyDescriptor(obj, name) as any).configurable, 'Expected obj[' + String(name) + '] to have configurable:true.');
  if (!isConfigurable(obj, name)) throw new Test262Error('Expected obj[' + String(name) + '] to be configurable, but was not.');
}

export function verifyNotConfigurable(obj: any, name: any): void {
  assert.ok(!(Object.getOwnPropertyDescriptor(obj, name) as any).configurable, 'Expected obj[' + String(name) + '] to have configurable:false.');
  if (isConfigurable(obj, name)) throw new Test262Error('Expected obj[' + String(name) + '] NOT to be configurable, but was.');
}
