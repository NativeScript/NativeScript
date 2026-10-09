console.log('a: start');
exports.done = false;
var b = require('./b.cjs');
console.log('a: b.done =', b.done);
exports.done = true;
console.log('a: end');
