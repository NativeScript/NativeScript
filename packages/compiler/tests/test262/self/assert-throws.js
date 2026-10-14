/*---
description: The harness's assert.throws tells error constructors apart as test262's does.
---*/
assert.throws(TypeError, function() { throw new TypeError('t'); });
assert.throws(RangeError, function() { throw new RangeError('r'); });
assert.throws(SyntaxError, function() { throw new SyntaxError('s'); });
assert.throws(ReferenceError, function() { throw new ReferenceError('r'); });
assert.throws(Error, function() { throw new Error('e'); });
assert.throws(Test262Error, function() { throw new Test262Error('x'); });
var failed = 0;
try { assert.throws(TypeError, function() {}); } catch (e) { if (e instanceof Test262Error) failed++; }
try { assert.throws(TypeError, function() { throw new RangeError('r'); }); } catch (e) { if (e instanceof Test262Error) failed++; }
try { assert.throws(Error, function() { throw new TypeError('t'); }); } catch (e) { if (e instanceof Test262Error) failed++; }
try { assert.throws(TypeError, function() { throw 1; }); } catch (e) { if (e instanceof Test262Error) failed++; }
if (failed !== 4) throw new Test262Error('expected 4 failed assertions, got ' + failed);
