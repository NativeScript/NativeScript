/*---
description: An async test passes when it calls $DONE with nothing.
flags: [async]
---*/
new Promise(function(resolve) { resolve(1); }).then(function(value) {
  assert.sameValue(value, 1);
}).then($DONE, $DONE);
