// A type parameter bound to a shape (`U extends { root: View }`), its callbacks given the caller's own shape.
class View {
  constructor(public id: string) {}
}
function snippet<U extends { root: View }>(ui: U, setup: (ui: U) => void, test: (ui: U) => void): string {
  setup(ui);
  test(ui);
  return ui.root.id;
}
const ui = { root: new View('root'), child: new View('child') };
const id = snippet(ui, (x) => console.log('setup', x.child.id), ({ root, child }) => console.log('test', root.id, child.id));
console.log(id);
