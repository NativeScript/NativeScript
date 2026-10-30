// Spread arguments to the library's functions of any arity: Math.max/min, push/unshift/splice/concat, String.fromCharCode, console.log.
const xs = [3, 1, 4];
const none: number[] = [];
console.log(Math.max(...xs), Math.min(...xs), Math.max(0, ...xs, 9), Math.min(...xs, -2), Math.max(...none), Math.min(...none), Math.max(...[1, NaN]));

const a = [1, 2];
const more = [7, 8];
console.log(a.push(...more), a.join(','));
console.log(a.unshift(...more, 0), a.join(','));
console.log(a.splice(1, 2, ...more).join(','), a.join(','));
const lists = [[4], [5, 6]];
console.log(a.concat(...lists).join(','), a.concat(...lists, 1, ...more).join(','), a.concat(...[more, [9]]).join(','), a.concat(5, ...more).join(','), a.push(...none), a.length);

const codes = [72, 105, 33];
console.log(String.fromCharCode(...codes), String.fromCharCode(65, ...codes), String.fromCharCode(...none).length, String.fromCharCode(...[0x263a]));

const words = ['spread', 'into', 'log'];
console.log(...words);
console.log('lead', ...xs, 'tail');
