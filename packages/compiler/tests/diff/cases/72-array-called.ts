// @swift
// `Array(…)` called without `new`, which JavaScript treats as `new Array(…)`.

const columns = (n: number) => Array(n).fill('*').join(', ');
console.log(columns(2), '|', columns(3));

const zeros: number[] = Array(3).fill(0);
zeros[1] = 7;
console.log(zeros, zeros.length);

const listed: string[] = Array('a', 'b', 'c');
console.log(listed.join(''), listed.length);

const holes: (string | undefined)[] = Array(2);
console.log(holes.length, holes[0] === undefined);
