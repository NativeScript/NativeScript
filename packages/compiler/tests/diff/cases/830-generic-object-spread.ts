// Spreading a value whose type is a type parameter (or built from one) copies every key the object holds at run time,
// not only the keys T's constraint names.
interface Point {
  x: number;
  y: number;
}
interface Named {
  name: string;
}

function tagged<P extends object>(props: P, type: string) {
  const r = { ...props, type };
  return JSON.stringify(r) + ' ' + Object.keys(r).join();
}
function tag<P extends object>(props: P, type: string): P & { type: string } {
  return { ...props, type };
}
function moveX<T extends { x: number }>(state: T, x: number) {
  const next = { ...state, x };
  return `${next.x} ${JSON.stringify(next)}`;
}
function patched<T extends object>(state: T, changes: Partial<T>): string {
  const all = { ...state, ...changes, at: 1 };
  return JSON.stringify(all);
}

class Holder<T extends object> {
  constructor(private state: T) {}
  stamped(n: number) {
    const s = { ...this.state, n };
    return JSON.stringify(s) + ' ' + s.n;
  }
}

const p: Point = { x: 1, y: 2 };
console.log(tagged(p, 'a'));
console.log(tagged({ name: 'ada' } as Named, 'b'));
const t: any = tag(p, 'c');
console.log(JSON.stringify(t), t.x, t.type);
console.log(moveX(p, 5), moveX({ x: 0, z: 'z' }, 9));
console.log(patched(p, { y: 7 }));
console.log(new Holder<Point>(p).stamped(3), new Holder<Named>({ name: 'grace' }).stamped(4));
