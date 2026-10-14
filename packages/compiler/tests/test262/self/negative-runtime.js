/*---
description: A test expecting a runtime error passes when its top level throws that error.
negative:
  phase: runtime
  type: Test262Error
---*/
function fail() {
  throw new Test262Error('expected');
}
fail();
