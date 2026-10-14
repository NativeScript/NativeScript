// test262's harness/assert.js, typed, with compareIterator.js's and asyncHelpers.js's members of `assert`.
// test262's `assert` is a function with members; a function and a namespace of one name do not translate, so `assert`
// is a namespace and calling it is `assert.ok` (run.ts rewrites the tests' calls). Where String(value) throws,
// formatSimpleValue gives '[object <typeof>]' rather than Object.prototype.toString's tag.
import { Test262Error } from './sta.ts';

export function isNegativeZero(value: any): boolean {
  return value === 0 && 1 / value === -Infinity;
}

export function isPrimitive(value: any): boolean {
  return !value || (typeof value !== 'object' && typeof value !== 'function');
}

export function formatIdentityFreeValue(value: any): string | undefined {
  switch (value === null ? 'null' : typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'bigint':
      return String(value) + 'n';
    case 'number':
      if (isNegativeZero(value)) return '-0';
      return String(value);
    case 'boolean':
    case 'undefined':
    case 'null':
      return String(value);
  }
  return undefined;
}

export function formatSimpleValue(value: any): string {
  const basic = formatIdentityFreeValue(value);
  if (basic) return basic;
  try {
    return String(value);
  } catch (err: any) {
    if (err.name === 'TypeError') return '[object ' + typeof value + ']';
    throw err;
  }
}

export namespace assert {
  export function ok(mustBeTrue: any, message?: string): void {
    if (mustBeTrue === true) return;
    if (message === undefined) message = 'Expected true but got ' + formatSimpleValue(mustBeTrue);
    throw new Test262Error(message);
  }

  export function _isSameValue(a: any, b: any): boolean {
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    return a !== a && b !== b;
  }

  export function _toString(value: any): string {
    return formatSimpleValue(value);
  }

  export function sameValue(actual: any, expected: any, message?: string): void {
    try {
      if (_isSameValue(actual, expected)) return;
    } catch (error) {
      throw new Test262Error(message + ' (_isSameValue operation threw) ' + error);
    }
    let text = message === undefined ? '' : message + ' ';
    text += 'Expected SameValue(«' + _toString(actual) + '», «' + _toString(expected) + '») to be true';
    throw new Test262Error(text);
  }

  export function notSameValue(actual: any, unexpected: any, message?: string): void {
    if (!_isSameValue(actual, unexpected)) return;
    let text = message === undefined ? '' : message + ' ';
    text += 'Expected SameValue(«' + _toString(actual) + '», «' + _toString(unexpected) + '») to be false';
    throw new Test262Error(text);
  }

  export function throws(expectedErrorConstructor: any, func: any, message?: string): void {
    if (typeof func !== 'function') throw new Test262Error('assert.throws requires two arguments: the error constructor and a function to run');
    const expectedName = typeof expectedErrorConstructor === 'string' ? expectedErrorConstructor : expectedErrorConstructor.name;
    let text = message === undefined ? '' : message + ' ';
    try {
      func();
    } catch (thrown: any) {
      if (typeof thrown !== 'object' || thrown === null) {
        throw new Test262Error(text + 'Thrown value was not an object!');
      } else if (!thrownBy(thrown, expectedErrorConstructor)) {
        const actualName = constructorName(thrown);
        if (expectedName === actualName) throw new Test262Error(text + 'Expected a ' + expectedName + ' but got a different error constructor with the same name');
        throw new Test262Error(text + 'Expected a ' + expectedName + ' but got a ' + actualName);
      }
      return;
    }
    throw new Test262Error(text + 'Expected a ' + expectedName + ' to be thrown but no exception was thrown at all');
  }

  export function compareArray(actual: any, expected: any, message?: any): void {
    let text = message === undefined ? '' : message;
    if (typeof text === 'symbol') text = text.toString();
    if (isPrimitive(actual)) ok(false, 'Actual argument [' + actual + "] shouldn't be primitive. " + String(text));
    else if (isPrimitive(expected)) ok(false, 'Expected argument [' + expected + "] shouldn't be primitive. " + String(text));
    if (compareArrays(actual, expected)) return;
    ok(false, 'Actual ' + formatArray(actual) + ' and expected ' + formatArray(expected) + ' should have the same contents. ' + String(text));
  }

  export function compareIterator(iter: any, validators: any[], message?: string): void {
    const text = message || '';
    let i = 0;
    let result: any;
    for (i = 0; i < validators.length; i++) {
      result = iter.next();
      ok(!result.done, 'Expected ' + i + ' values(s). Instead iterator only produced ' + (i - 1) + ' value(s). ' + text);
      validators[i](result.value);
    }
    result = iter.next();
    ok(result.done, 'Expected only ' + i + ' values(s). Instead iterator produced more. ' + text);
    sameValue(result.value, undefined, 'Expected value of `undefined` when iterator completes. ' + text);
  }

  export function throwsAsync(expectedErrorConstructor: any, func: any, message?: string): Promise<void> {
    const fail = (detail: string): never => {
      throw new Test262Error(message === undefined ? detail : message + ' ' + detail);
    };
    return new Promise<void>((resolve) => {
      if (typeof expectedErrorConstructor !== 'function' && typeof expectedErrorConstructor !== 'string') fail('assert.throwsAsync called with an argument that is not an error constructor');
      if (typeof func !== 'function') fail('assert.throwsAsync called with an argument that is not a function');
      const expectedName = typeof expectedErrorConstructor === 'string' ? expectedErrorConstructor : expectedErrorConstructor.name;
      const expectation = 'Expected a ' + expectedName + ' to be thrown asynchronously';
      let res: any;
      try {
        res = func();
      } catch (thrown) {
        fail(expectation + ' but the function threw synchronously');
      }
      if (res === null || typeof res !== 'object' || typeof res.then !== 'function') fail(expectation + ' but result was not a thenable');
      resolve(Promise.resolve(res).then(
        () => { fail(expectation + ' but no exception was thrown at all'); },
        (thrown: any) => {
          if (thrown === null || typeof thrown !== 'object') fail(expectation + ' but thrown value was not an object');
          else if (!thrownBy(thrown, expectedErrorConstructor)) {
            const actualName = constructorName(thrown);
            if (expectedName === actualName) fail(expectation + ' but got a different error constructor with the same name');
            fail(expectation + ' but got a ' + actualName);
          }
        },
      ));
    });
  }
}

/**
 * Whether `thrown` was made by the expected constructor, as test262 checks `thrown.constructor === expected`. A
 * built-in error constructor comes as its name (run.ts rewrites `assert.throws(TypeError, …)`), checked with
 * instanceof against that constructor and none of its subclasses. URIError and EvalError are left as values:
 * naming them at all does not compile for Swift.
 */
function thrownBy(thrown: any, expected: any): boolean {
  if (typeof expected !== 'string') return thrown.constructor === expected;
  const native = thrown instanceof TypeError || thrown instanceof RangeError || thrown instanceof SyntaxError || thrown instanceof ReferenceError;
  switch (expected) {
    case 'TypeError': return thrown instanceof TypeError;
    case 'RangeError': return thrown instanceof RangeError;
    case 'SyntaxError': return thrown instanceof SyntaxError;
    case 'ReferenceError': return thrown instanceof ReferenceError;
    case 'Error': return thrown instanceof Error && !native;
    case 'Test262Error': return thrown instanceof Test262Error;
  }
  return false;
}

function constructorName(thrown: any): string {
  for (const name of ['TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'Test262Error']) if (thrownBy(thrown, name)) return name;
  if (thrownBy(thrown, 'Error')) return 'Error';
  return thrown.constructor ? thrown.constructor.name : String(thrown.constructor);
}

function compareArrays(a: any, b: any): boolean {
  if (b.length !== a.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!assert._isSameValue(b[i], a[i])) return false;
  }
  return true;
}

function formatArray(arrayLike: any): string {
  const parts: string[] = [];
  for (let i = 0; i < arrayLike.length; i++) parts.push(String(arrayLike[i]));
  return '[' + parts.join(', ') + ']';
}

export function compareArray(a: any, b: any): boolean {
  return compareArrays(a, b);
}
