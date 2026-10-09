// @lenient
// A function taking a rest parameter, held as a value and called untyped (core's `Dialogs.prompt(options)` through its barrel).
function prompt(...args: any[]): any {
  const options = args.length === 1 && typeof args[0] === 'object' ? args[0] : { title: args[0] };
  return options.title + ' / ' + args.length;
}
const dialogs: any = { prompt };
console.log(dialogs.prompt({ title: 'Prompt' }), dialogs.prompt('Plain', 'more'));
