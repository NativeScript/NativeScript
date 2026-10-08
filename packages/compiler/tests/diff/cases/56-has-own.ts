// @lenient
// Object.prototype.hasOwnProperty taken as a value and called on a record of pending updates, as core's
// applyPendingNativeSetters walks `view._suspendedUpdates`.
const HAS_OWN = Object.prototype.hasOwnProperty;
class View {
  _suspendedUpdates: { [name: string]: { name: string } } = {};
  values: Record<string, number> = { a: 1 };
}
const view = new View();
view._suspendedUpdates['rotate'] = { name: 'rotate' };
const applied = [];
for (const name in view._suspendedUpdates) {
  if (!HAS_OWN.call(view._suspendedUpdates, name)) continue;
  applied.push(name);
}
console.log(applied.join(), HAS_OWN.call(view.values, 'a'), HAS_OWN.call(view.values, 'b'), HAS_OWN.call({ x: 1 }, 'x'), Object.prototype.hasOwnProperty.call(view, 'values'));
