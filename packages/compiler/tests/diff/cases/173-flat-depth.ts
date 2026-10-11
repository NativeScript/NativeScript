// @swift
// `flat(depth)`: as many levels as the depth asks, `Infinity` all of them, 0 a copy; on typed and untyped arrays.
const mixed = [1, [2, [3, [4]]]];
console.log(mixed.flat(), mixed.flat(2), mixed.flat(Infinity), mixed.flat(0));
const grid: number[][][] = [[[1, 2]], [[3], [4, 5]]];
const one = grid.flat(), two = grid.flat(2), all = grid.flat(Infinity), none = grid.flat(0);
console.log(one, two, two.length, all, none.length, none === grid);
const depth: number = 1;
const untyped: any[] = [['a', ['b']], 'c'];
console.log(untyped.flat(depth), untyped.flat(5), [[['x']]].flat(3));
