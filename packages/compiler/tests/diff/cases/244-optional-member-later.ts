// Optional members of an object literal's type, set after it is made: listed in the order they are set.
const cyclic: { me?: unknown } = {};
cyclic.me = [cyclic];
try {
  JSON.stringify(cyclic);
} catch (e) {
  console.log((e as Error).name, (e as Error).message.split('\n')[0]);
}
const point: { x?: number; y?: number; label?: string } = { label: 'p' };
point.y = 2;
point.x = 1;
console.log(Object.keys(point).join(','), JSON.stringify(point));
for (const k in point) console.log(k);
point.label = 'q';
console.log(JSON.stringify(point));
