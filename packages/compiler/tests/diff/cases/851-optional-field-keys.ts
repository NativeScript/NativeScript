// An object's keys keep insertion order when a typed write sets an optional field it doesn't have yet, and a write of
// undefined creates the key.
interface Shape { b: number; a?: string; c?: number | null; d?: boolean }
const o: Shape = { b: 1 };
o.a = 'x';
console.log(Object.keys(o).join(','), JSON.stringify(o), JSON.stringify({ ...o }));
o.c = undefined;
console.log('c' in o, Object.keys(o).join(','), JSON.stringify(o), Object.entries({ ...o }).length, o.hasOwnProperty('c'));
o.d = undefined;
o.c = 3;
console.log(Object.keys(o).join(','), JSON.stringify(o), 'd' in o);
for (const k in o) console.log('key', k);

const lit: { m?: number; n: number } = { n: 1 };
lit.m = undefined;
console.log(Object.keys(lit).join(','), 'm' in lit, Object.assign({}, lit).hasOwnProperty('m'));
const shapes: Shape[] = [{ b: 2 }, { b: 3, a: 'k' }];
shapes[0].d = true;
shapes[0].a = 'j';
shapes[1].c = undefined;
console.log(JSON.stringify(shapes), shapes.map((s) => Object.keys(s).join('/')).join(' '));
