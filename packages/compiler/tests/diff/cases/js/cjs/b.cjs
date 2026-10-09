console.log('b: start');
exports.done = false;
var a = require('./a.cjs');
console.log('b: a.done =', a.done);
exports.done = true;
console.log('b: end');
