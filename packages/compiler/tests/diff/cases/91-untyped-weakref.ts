// @lenient
// A weak reference read through an untyped variable (core's weak event listener: `let pair; pair.tagetRef.get()`).
class Pair {
  ref: WeakRef<object>;
  constructor(target: object) {
    this.ref = new WeakRef(target);
  }
}
const target = { name: 'target' };
const pairs = [new Pair(target)];
let pair: any;
for (let i = 0; i < pairs.length; i++) {
  pair = pairs[i];
  const found = pair.ref.deref();
  console.log(found === target, found.name);
}
