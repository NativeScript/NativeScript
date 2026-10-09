var n = 0;
console.log('counter: evaluated');
module.exports = { next: function () { return ++n; } };
