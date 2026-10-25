// `x as C` of an object of another class: TypeScript checks nothing at run time, so members are read, written and called
// on the object it is, by name.
class View {
  name = 'view';
  describe() { return `a ${this.name}`; }
}
class TextField extends View {
  text = 'field';
  hint = 'type here';
  focus() { return 'focused ' + this.text; }
}
class SearchBar extends View {
  text = 'search';
  focus() { return 'search focused'; }
}
function show(v: View) { return v.describe(); }
function onLoaded(args: { view: View }) {
  const tf = args.view as TextField;
  tf.text = tf.text + '!';
  tf.name += '?';
  console.log(tf.text, tf.name, tf.hint, tf.focus(), show(tf), tf instanceof TextField, tf instanceof SearchBar, tf.describe());
  const typed = <TextField>args.view;
  console.log(typeof typed.text, typed.text.length, `${typed.text}`, Object.keys(typed).join(','));
}
onLoaded({ view: new SearchBar() });
onLoaded({ view: new TextField() });
const views: View[] = [new SearchBar(), new TextField()];
for (const v of views) {
  const field = v as TextField;
  if (field.hint) console.log('hint', field.hint);
  else console.log('no hint', field.text);
}
for (const v of views) {
  (v as TextField).hint = (<TextField>v).text + ' hint';
  console.log((v as TextField).hint, (<TextField>v).focus(), (v as TextField).hint.length, 'hint' in v);
}
