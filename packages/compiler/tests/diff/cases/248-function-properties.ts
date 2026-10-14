// Properties given to functions: assigned (`fn.tag = …`), defined, read through a held reference, and the function's identity.
function handler() {
  return 1;
}
handler.tag = 'T';
const arrow = () => 2;
Object.defineProperty(arrow, 'x', { value: 5 });
const named = function named(a: number) {
  return a;
};
(named as any).meta = { k: 1 };
const holder = { cb: handler };
console.log(handler.tag, (arrow as any).x, Object.prototype.hasOwnProperty.call(arrow, 'x'), (named as any).meta.k);
console.log(holder.cb === handler, (holder.cb as any).tag, holder.cb(), Object.keys(handler).join(','));
const untyped: any = handler;
console.log(untyped === handler, untyped.tag, Object.getOwnPropertyDescriptor(arrow, 'x')?.writable);
