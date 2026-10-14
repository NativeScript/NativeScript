// number[] as JavaScript has it, whatever holds it: holes that forEach, map, filter, reduce, `in`, Object.keys and
// JSON skip or show; undefined that they visit; a length that grows by holes and shrinks; a value of another type
// written through `any`, after which it is the same array; every NaN stored reading back as NaN.
const holes: number[] = new Array<number>(4);
holes[1] = 10;
holes[3] = 30;
const visited: string[] = [];
holes.forEach((v, i) => visited.push(`${i}:${v}`));
console.log(visited.join(' '), JSON.stringify(holes), Object.keys(holes).join(','), 0 in holes, 1 in holes, holes.length);
const doubled = holes.map((v) => v * 2);
console.log(JSON.stringify(doubled), Object.keys(doubled).join(','), 2 in doubled, holes.filter((v) => v > 0).join(','), holes.reduce((a, v) => a + v, 0));
console.log(holes.reduce((a, v) => a + v), holes.some((v) => v === undefined), holes.every((v) => v > 5), holes.indexOf(30), holes.includes(NaN));

const loose: any[] = [1, undefined, 3];
const typed: number[] = loose as number[];
console.log(JSON.stringify(typed), Object.keys(typed).join(','), 1 in typed, typed.length);

const grow: number[] = [1, 2];
grow.length = 5;
console.log(JSON.stringify(grow), Object.keys(grow).join(','), grow.length, 4 in grow);
grow.length = 1;
grow.push(7);
console.log(JSON.stringify(grow), Object.keys(grow).join(','), grow.length);
grow[4] = 9;
console.log(JSON.stringify(grow), Object.keys(grow).join(','), grow.length, grow.pop(), Object.keys(grow).join(','));

const shared: number[] = [1, 2, 3];
const alias = shared;
const untyped: any = shared;
untyped[1] = 'two';
untyped.push(true);
console.log(alias === shared, JSON.stringify(alias), alias.length, alias.join('|'));

const nans: number[] = [];
nans.push(0 / 0);
nans.push(Math.sqrt(-1));
nans.push(parseFloat('x'));
nans.push(Number('nope'));
nans[4] = Infinity - Infinity;
console.log(nans.map((v) => Number.isNaN(v)).join(','), nans.join(','), JSON.stringify(nans), nans.indexOf(NaN), nans.includes(NaN), nans.length);

// A comparator meeting NaN is inconsistent, and the order it gives is the implementation's: no NaN here.
const sorted: number[] = [3, -0, 0, 10, 1, 2];
sorted.sort((a, b) => a - b);
console.log(sorted.map((v) => Object.is(v, -0) ? '-0' : String(v)).join(','));
const sparse: number[] = new Array<number>(3);
sparse[1] = 5;
sparse.sort((a, b) => b - a);
console.log(JSON.stringify(sparse), Object.keys(sparse).join(','));

const filled = new Array<number>(3).fill(2);
filled[1] += 5;
filled[2] *= 3;
let total = 0;
for (const v of filled) total += v;
console.log(filled.join(','), total, Object.keys(filled).join(','));
const matrix: number[][] = [];
for (let i = 0; i < 3; i++) {
  const row: number[] = [];
  for (let j = 0; j < 3; j++) row.push(i * 3 + j);
  matrix.push(row);
}
matrix[1][1] += 100;
console.log(matrix.map((r) => r.join(' ')).join(' / '), matrix[2].slice(1).join(','), matrix[0].concat(matrix[2]).join(','));
