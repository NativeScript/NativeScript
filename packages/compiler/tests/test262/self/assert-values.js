/*---
description: The harness's assert, sameValue and notSameValue pass and fail as test262's do.
---*/
assert(true);
assert.sameValue(1, 1);
assert.sameValue('a', 'a');
assert.sameValue(NaN, NaN);
assert.notSameValue(0, -0);
assert.notSameValue(1, 2);
var failed = 0;
try { assert(false); } catch (e) { failed++; }
try { assert(1); } catch (e) { failed++; }
try { assert.sameValue(1, 2); } catch (e) { failed++; }
try { assert.sameValue(0, -0); } catch (e) { failed++; }
try { assert.notSameValue(1, 1); } catch (e) { failed++; }
if (failed !== 5) throw new Test262Error('expected 5 failed assertions, got ' + failed);
