// An object of a class that implements an interface, given untyped where the interface is wanted, is that object.
interface Dirty {
  dirty: boolean;
}

class Doc implements Dirty {
  dirty = false;
  title = 'draft';
}

function check(fn: (d: Dirty) => boolean, x: any): boolean {
  return fn(x);
}

const doc = new Doc();
doc.dirty = true;
console.log('reads:', check((c) => c.dirty, doc));
console.log('same:', check((c) => c === doc, doc));
console.log('writes:', check((c) => { c.dirty = false; return true; }, doc), doc.dirty);
console.log('literal:', check((c) => c.dirty, { dirty: true }));
