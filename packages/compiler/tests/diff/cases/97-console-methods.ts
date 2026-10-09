// @swift
// console's methods beyond log, as Node prints them to standard output.
console.count();
console.count('taps');
console.count('taps');
console.countReset('taps');
console.count('taps');
console.dir({ a: 1, list: [1, 2], nested: { deep: true } });
console.assert(true, 'not printed');
console.time('t');
console.timeEnd('unknown-but-on-stderr');
