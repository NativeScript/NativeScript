// new Array(n), or a write past the end: holes, which JSON writes as null and Object.keys leaves out, until they are set;
// a key that is no index (1.5) is listed after the indexes.
const holes: number[] = new Array<number>(3);
holes[1] = 5;
console.log(JSON.stringify(holes), holes.length, Object.keys(holes).join(','), holes[0] === undefined, 0 in holes, 1 in holes);
const names = new Array<string>(2);
names[0] = 'a';
console.log(JSON.stringify(names), Object.keys(names).join(','));
const filled = new Array<number>(3).fill(7);
console.log(JSON.stringify(filled), Object.keys(filled).join(','));
const grid: number[] = new Array<number>(4);
for (let i = 0; i < grid.length; i++) grid[i] = i * i;
console.log(grid.join(' '), Object.keys(grid).length);
const sparse: number[] = [];
sparse[3] = 1;
sparse[1.5] = 2;
console.log(Object.keys(sparse).join(','));
try {
  console.log(new Array<number>(-1).length);
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
const sparseNames: string[] = new Array<string>(4);
sparseNames[2] = 'c';
const forIn: string[] = [];
for (const k in sparseNames) forIn.push(k);
console.log(forIn.join(','), Object.entries(sparseNames).length, Object.values(sparseNames).join('|'));
console.log(Object.keys(new Array<number>(2)).length, 3 in sparseNames, 2 in sparseNames);
