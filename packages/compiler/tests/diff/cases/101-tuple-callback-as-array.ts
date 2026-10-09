// A callback declaring an array where its slot passes a tuple (`(views: View[])` for `[T, Page]`): the tuple's elements.
class View {
  constructor(public id: string) {}
}
class Button extends View {}
function run<T extends View>(control: T, test: (views: [T, View]) => void) {
  test([control, new View('page')]);
}
run(new Button('b'), function (views: Array<View>) {
  console.log(views.length, views[0].id, views[1].id);
});
run(new Button('c'), (pair) => console.log(pair[0].id, pair[1].id));
