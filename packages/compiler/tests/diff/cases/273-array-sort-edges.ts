// Array sort at its edges: stability across runs merged and copied, comparators that return NaN or are
// inconsistent, undefined last, a comparator that throws leaving the array as it was, and typed reads and
// writes by number index.
interface Row {
  key: number;
  at: number;
}
let seed = 11;
const next = (): number => (seed = (seed * 48271) % 2147483647);
const rows: Row[] = [];
for (let i = 0; i < 1000; i++) rows.push({ key: next() % 7, at: i });
const sorted = rows.slice().sort((x, y) => x.key - y.key);
let stable = true;
for (let i = 1; i < sorted.length; i++) if (sorted[i - 1].key === sorted[i].key && sorted[i - 1].at > sorted[i].at) stable = false;
console.log(stable, sorted[0].at, sorted[999].at, sorted.map((r) => r.key).join('').slice(0, 40));

const ascending: number[] = [];
for (let i = 0; i < 200; i++) ascending.push(i);
console.log(ascending.slice().sort((x, y) => x - y).join(',') === ascending.join(','), ascending.slice().sort((x, y) => y - x)[0]);
const nums: number[] = [];
for (let i = 0; i < 100; i++) nums.push(next() % 50);
console.log(nums.slice().sort((x, y) => x - y).join(','));
console.log(nums.slice().sort((x, y) => NaN).join(',') === nums.join(','), [3, 1, 2].sort((x, y) => 0).join(','));
console.log(nums.slice().sort((x, y) => (x % 3) - (y % 3)).slice(0, 20).join(','));

const holes: (number | undefined)[] = [3, undefined, 1, undefined, 2];
console.log(JSON.stringify(holes.sort((x, y) => (x as number) - (y as number))));
const fixed = [5, 4, 3, 2, 1];
try {
  let calls = 0;
  fixed.sort((x, y) => {
    if (++calls > 3) throw new Error('stop');
    return x - y;
  });
} catch (e) {
  console.log((e as Error).message, fixed.join(','));
}

const grid: number[][] = [];
for (let i = 0; i < 4; i++) {
  const row = new Array<number>(4).fill(0);
  for (let j = 0; j < 4; j++) row[j] += i * j;
  grid.push(row);
}
console.log(JSON.stringify(grid));
const sparse: number[] = [];
sparse[2] = 5;
sparse[-1] = 7;
console.log(sparse.length, JSON.stringify(sparse), sparse[-1], sparse[1.5]);
console.log([1, 2, 3, 4].map((x, i) => x * i).filter((x) => x > 1).reduce((a, x) => a + x, 0), [1, 2, 3].reduce((a, x, i) => a + x * i, 10));
