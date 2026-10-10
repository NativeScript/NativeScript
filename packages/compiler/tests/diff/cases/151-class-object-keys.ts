// @lenient
// A class held as a value (`view.constructor`): `in` finds only its static members, and `String(cls)` prints it,
// though its instances take the runtime's dynamic protocols.
class Thing {
  static tapEvent = 'tap';
  name = 'thing';
  toString(): string {
    return 'a thing';
  }
}
function hasStatic(value: any, key: string): boolean {
  return value.constructor && key in value.constructor;
}
const t = new Thing();
const plain: any = { position: 'right' };
console.log(hasStatic(t, 'tapEvent'), hasStatic(t, 'positionEvent'), hasStatic(t, 'name'), hasStatic(t, 'label'), hasStatic(plain, 'positionEvent'));
console.log(String(t), `${t}`);
