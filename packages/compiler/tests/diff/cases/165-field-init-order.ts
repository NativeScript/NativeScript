// @kotlin
// A subclass field read by a base class initializer through an overridden method: still undefined then.
class A {
  name = 'A:' + this.kind();
  kind() { return 'a'; }
}
class B extends A {
  z = 5;
  label = 'L';
  kind() { return 'b' + (this.z + 1) + this.label + !this.label + !this.z; }
}
function show() {
  const made = new B();
  console.log(made.name, made.z, made.label, String(made.z));
}
show();
class Base {
  constructor() { this.setup(); }
  setup() {}
}
class Child extends Base {
  count = 1;
  seen: number | undefined = 0;
  setup() { this.seen = this.count; }
}
const c = new Child();
console.log(c.count, c.seen);
