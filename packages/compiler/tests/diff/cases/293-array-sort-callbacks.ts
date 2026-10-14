// Array.prototype.sort is stable, puts undefined last without comparing it, reads a NaN comparison as equal and
// sorts by string form without a comparator; callbacks get the index and the array, and see the length an
// iteration started with.
const people = [
  { name: 'b', age: 30 }, { name: 'a', age: 25 }, { name: 'c', age: 30 }, { name: 'd', age: 25 }, { name: 'e', age: 40 }, { name: 'f', age: 30 },
];
console.log(people.slice().sort((x, y) => x.age - y.age).map((p) => p.name).join(''));
console.log(people.slice().sort((x, y) => y.age - x.age).map((p) => p.name).join(''));
const loose: any[] = [3, undefined, 1, undefined, 2, 10, 'b', 'a'];
console.log(JSON.stringify(loose.slice().sort()), JSON.stringify(loose.slice().sort((a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0))));
console.log([10, 9, 1, 100, 25].sort().join(','), [10, 9, 1, 100, 25].sort((a, b) => a - b).join(','), [3, 1, 2].sort(() => NaN).join(','));
const nums: number[] = [];
for (let i = 0; i < 3000; i++) nums.push((i * 7919) % 3001);
const sorted = nums.slice().sort((a, b) => a - b);
let ordered = true;
for (let i = 1; i < sorted.length; i++) if (sorted[i - 1] > sorted[i]) ordered = false;
console.log(ordered, sorted[0], sorted[2999], sorted.length, nums[5]);
let comparisons = 0;
const ascending: number[] = [];
for (let i = 0; i < 1000; i++) ascending.push(i);
ascending.sort((a, b) => {
  comparisons++;
  return a - b;
});
console.log(ascending[999], comparisons <= 2000);
const pairs = [[2, 'x'], [1, 'y'], [2, 'z'], [1, 'w']] as [number, string][];
console.log(pairs.sort((a, b) => a[0] - b[0]).map((p) => p[1]).join(''), ['B', 'a', 'C', 'b'].sort().join(''), [true, false].sort().join(','));
const grow = [1, 2, 3];
const visited: number[] = [];
grow.forEach((v, i, arr) => {
  visited.push(v * 10 + i);
  if (i === 0) arr.push(4);
  if (i === 1) arr.pop();
});
console.log(visited.join(','), grow.join(','));
const mapped = [5, 6, 7].map((v, i, arr) => v + i + arr.length);
const found = [5, 6, 7].find((v, i) => i === 2);
const index = [5, 6, 7].findIndex((v, i, arr) => arr[i] === 6);
const sum = [1, 2, 3, 4].reduce((acc, v, i, arr) => acc + v * i + arr.length, 0);
const right = ['a', 'b', 'c'].reduceRight((acc, v, i) => acc + v + i, '');
console.log(mapped.join(','), found, index, sum, right, [1, 2, 3].some((v, i) => i === 2 && v === 3), [1, 2, 3].every((v, i, arr) => arr.length === 3));
console.log([1, 2, 3, 4].filter((v, i) => i % 2 === 0).join(','), [[1], [2, 3]].flatMap((v, i) => v.concat([i])).join(','), [3, 2, 1].find((v, i) => i > 0), [3, 2, 1].findIndex((v) => v < 2));
try {
  ([] as number[]).reduce((a, b) => a + b);
} catch (e) {
  console.log((e as Error).message);
}
const sparse: number[] = [];
sparse[3] = 1;
sparse[1.5] = 2;
console.log(sparse.length, sparse[3], sparse[1.5], sparse[2], Object.keys(sparse).join(','));
const filled = new Array<number>(4).fill(0);
filled[2] += 5;
filled[0] -= 1;
console.log(filled.join(','), filled.push(9), filled.push(10, 11), filled.length);
