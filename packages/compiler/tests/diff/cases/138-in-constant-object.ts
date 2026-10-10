// @lenient
// `value in` a module's constant object of names (core's XMLHttpRequest response types).
const ResponseType = {
  empty: '',
  text: 'text',
  json: 'json',
};
function accept(value: string): string {
  if (value === ResponseType.empty || value in ResponseType) return 'accepted ' + value;
  return 'refused ' + value;
}
console.log(accept('json'), accept(''), accept('text'), accept('blob'));
