// Members added through `any` to objects of subclasses, at each depth of the class chain: keys keep insertion order,
// after the fields every class in the chain declares.
class A {
  a = 1;
}
class B extends A {
  b = 2;
}
class C extends B {
  c = 3;
}
const b = new B();
(b as any).x = 'x';
(b as any)['y'] = 4;
console.log(Object.keys(b).join(','), JSON.stringify(b), (b as any).x, 'x' in b, { ...b });
const c = new C();
(c as any).z = [1];
const held: any = c;
held.w = null;
console.log(Object.keys(c).join(','), JSON.stringify(c), held.z.length, held.w, Object.entries(c).length);
const a = new A();
(a as any).q = 'q';
console.log(Object.keys(a).join(','), JSON.stringify(a));
for (const k in b) console.log(k, (b as any)[k]);
delete (b as any).x;
console.log(Object.keys(b).join(','), JSON.stringify(b));
