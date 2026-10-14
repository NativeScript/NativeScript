// test262's harness/asyncHelpers.js: asyncTest (assert.throwsAsync is in assert.ts).
// test262's own checks that $DONE is a global, as only async tests define it; here every async test imports it.
import { $DONE } from './doneprintHandle.ts';
import { Test262Error } from './sta.ts';

export function asyncTest(testFunc: any): void {
  if (typeof testFunc !== 'function') {
    $DONE(new Test262Error('asyncTest called with non-function argument'));
    return;
  }
  try {
    testFunc().then(() => { $DONE(); }, (error: any) => { $DONE(error); });
  } catch (syncError) {
    $DONE(syncError);
  }
}
