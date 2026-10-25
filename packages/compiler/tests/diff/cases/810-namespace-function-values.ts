// @swift
// Function values a generic factory makes (@ngrx/store action creators, a closure), held in namespace and module consts and called
// later with arguments, directly, through a namespace alias and from an array.
import '@angular/compiler';
import { createAction, props } from '@ngrx/store';

function counter<T>(start: T, step: (value: T) => T): () => T {
  let value = start;
  return () => (value = step(value));
}

namespace Tasks {
  export const add = createAction('[Tasks] Add', props<{ title: string; points: number }>());
  export const clear = createAction('[Tasks] Clear');
  export const nextId = counter(100, (n) => n + 1);
}

const rename = createAction('[Tasks] Rename', props<{ from: string; to: string }>());
const Alias = Tasks;

function describe(action: { type: string }): string {
  return JSON.stringify(action);
}

console.log(describe(Tasks.add({ title: 'write', points: 3 })));
console.log(describe(Tasks.clear()));
console.log(Tasks.add.type, Tasks.clear.type, rename.type);
console.log(describe(rename({ from: 'a', to: 'b' })));
console.log(Tasks.nextId(), Tasks.nextId(), Alias.nextId());
console.log(Alias.add({ title: 'alias', points: 1 }).title);
const later = [Tasks.add, Tasks.add];
console.log(later.map((make, i) => make({ title: `t${i}`, points: i }).title).join(','));
