/*---
description: The harness's assert.compareArray passes and fails as test262's does.
---*/
assert.compareArray([1, 2, 3], [1, 2, 3]);
assert.compareArray([], []);
var failed = 0;
try { assert.compareArray([1, 2], [1, 2, 3]); } catch (e) { failed++; }
try { assert.compareArray([1, 2], [2, 1]); } catch (e) { failed++; }
if (failed !== 2) throw new Test262Error('expected 2 failed assertions, got ' + failed);
