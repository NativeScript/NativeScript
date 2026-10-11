// @swift
// A WeakRef keeps its target through the job that made it (KeepDuringJob), and lets it go after:
// checked a task later, after a full collection where the runtime has one (Node runs with --expose-gc).
const gc = (globalThis as any).gc as (() => void) | undefined;
class Thing {
  name = 'thing';
}
const made = new WeakRef(new Thing());
console.log('deref in the job that made it:', made.deref() !== undefined, made.deref()?.name);
const refs: WeakRef<Thing>[] = [];
for (let i = 0; i < 5; i++) refs.push(new WeakRef(new Thing()));
console.log('targets made in a loop, same job:', refs.filter((r) => r.deref() !== undefined).length);
const held = new Thing();
const kept = new WeakRef(held);
setTimeout(() => {
  gc?.();
  console.log('a later job: dropped', made.deref() === undefined, refs.filter((r) => r.deref() !== undefined).length);
  console.log('a later job: still held', kept.deref() === held);
}, 0);
