// A generic factory's function values, held in namespace and module consts and called later with arguments: one that
// also carries a property (a function and object at once), a plain closure, and one read through a namespace alias.
function creator<P extends object>(type: string): ((props: P) => { type: string; payload: P }) & { type: string } {
  const make = (props: P) => ({ type, payload: props });
  return Object.assign(make, { type });
}

function counter<T>(start: T, step: (value: T) => T): () => T {
  let value = start;
  return () => (value = step(value));
}

namespace Tasks {
  export const add = creator<{ title: string; points: number }>('[Tasks] Add');
  export const nextId = counter(100, (n) => n + 1);
}

const rename = creator<{ from: string; to: string }>('[Tasks] Rename');
const Alias = Tasks;

console.log(JSON.stringify(Tasks.add({ title: 'write', points: 3 })));
console.log(Tasks.add.type, rename.type);
console.log(JSON.stringify(rename({ from: 'a', to: 'b' })));
console.log(Tasks.nextId(), Tasks.nextId(), Alias.nextId());
console.log(Alias.add({ title: 'alias', points: 1 }).payload.title);
const later = [Tasks.add, Tasks.add];
console.log(later.map((make, i) => make({ title: `t${i}`, points: i }).payload.points).join(','));
