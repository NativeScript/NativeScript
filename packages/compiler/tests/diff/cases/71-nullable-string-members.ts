// @lenient
// A string declared `string | null` (as native typings declare `UITextField.text`), read without a chain:
// its length and methods are the string's, as JavaScript reads them.
function maybe(s: string | null): string | null {
  return s;
}
const text = maybe('hello');
const delta = 2;
console.log(text.length + delta, text.length <= 5, text.slice(0, delta), text.toUpperCase(), text.indexOf('l'));
