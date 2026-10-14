// new Array(n): n holes, which JSON writes as null and Object.keys leaves out, until they are set.
const holes: number[] = new Array<number>(3);
holes[1] = 5;
console.log(JSON.stringify(holes), holes.length, Object.keys(holes).join(','), holes[0] === undefined);
const names = new Array<string>(2);
names[0] = 'a';
console.log(JSON.stringify(names), Object.keys(names).join(','));
const filled = new Array<number>(3).fill(7);
console.log(JSON.stringify(filled), Object.keys(filled).join(','));
const grid: number[] = new Array<number>(4);
for (let i = 0; i < grid.length; i++) grid[i] = i * i;
console.log(grid.join(' '), Object.keys(grid).length);
try {
  console.log(new Array<number>(-1).length);
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
