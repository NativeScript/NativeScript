// @swift
// `padStart` and `padEnd` count UTF-16 units, the fill's too: an astral fill is cut where the length runs out.
console.log('abc'.padStart(6, '👋').length, 'abc'.padEnd(6, '👋').length, 'abc'.padStart(7, '👋'), 'abc'.padEnd(7, 'é👋'), 'x'.padStart(NaN, '-'));
console.log('5'.padStart(3, '0'), 'ab'.padEnd(5, 'xy'), 'é'.padStart(3, 'é'), 'long'.padStart(2, '*'));
