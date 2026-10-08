// @lenient
// Strings held untyped, and array destructuring past the end, as core's CSS animation parser reads them.
const handlers = {
  name: (info: any, value: any) => (info.name = value.replace(/['"]/g, '')),
};
const info: any = {};
handlers['name'](info, "'spin'");
console.log(info.name);
const value: any = 'fade 2s';
console.log(value.replace(/\s/g, '_'), value.split(' ').length, value.trim().length);
function names(text: string) {
  const parts = text.split(' ');
  const [first, second] = parts.filter((p) => p.length > 0);
  console.log(first, second === undefined, second ? 'set' : 'unset');
  if (second) {
    console.log('second is set');
  } else {
    console.log('no second');
  }
}
names('fade');
names('fade out');
