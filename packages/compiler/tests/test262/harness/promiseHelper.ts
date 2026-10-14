// test262's harness/promiseHelper.js, typed.
import { assert } from './assert.ts';
import { Test262Error } from './sta.ts';

export function checkSequence(arr: any[], message?: string): boolean {
  arr.forEach((e, i) => {
    if (e !== i + 1) throw new Test262Error((message ? message : 'Steps in unexpected sequence:') + " '" + arr.join(',') + "'");
  });
  return true;
}

export function checkSettledPromises(settleds: any, expected: any, message?: string): void {
  const prefix = message ? `${message}: ` : '';
  assert.sameValue(Array.isArray(settleds), true, `${prefix}Settled values is an array`);
  assert.sameValue(settleds.length, expected.length, `${prefix}The settled values has a different length than expected`);
  settleds.forEach((settled: any, i: number) => {
    assert.sameValue(settled.hasOwnProperty('status'), true, `${prefix}The settled value has a property status`);
    assert.sameValue(settled.status, expected[i].status, `${prefix}status for item ${i}`);
    if (settled.status === 'fulfilled') {
      assert.sameValue(settled.hasOwnProperty('value'), true, `${prefix}The fulfilled promise has a property named value`);
      assert.sameValue(settled.hasOwnProperty('reason'), false, `${prefix}The fulfilled promise has no property named reason`);
      assert.sameValue(settled.value, expected[i].value, `${prefix}value for item ${i}`);
    } else {
      assert.sameValue(settled.status, 'rejected', `${prefix}Valid statuses are only fulfilled or rejected`);
      assert.sameValue(settled.hasOwnProperty('value'), false, `${prefix}The fulfilled promise has no property named value`);
      assert.sameValue(settled.hasOwnProperty('reason'), true, `${prefix}The fulfilled promise has a property named reason`);
      assert.sameValue(settled.reason, expected[i].reason, `${prefix}Reason value for item ${i}`);
    }
  });
}
