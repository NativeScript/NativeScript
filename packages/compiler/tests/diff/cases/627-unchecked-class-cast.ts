// `as` names a class the value is not (an event's view): TypeScript does not check it, so neither does the program;
// the members both classes have are read from the value it is.
class View { name = 'view'; }
class TextField extends View { text = 'field'; }
class SearchBar extends View { text = 'search'; }
function onLoaded(args: { view: View }) {
  const tf = args.view as TextField;
  console.log(tf.text, tf.name, tf instanceof TextField, tf instanceof SearchBar);
}
onLoaded({ view: new SearchBar() });
onLoaded({ view: new TextField() });
