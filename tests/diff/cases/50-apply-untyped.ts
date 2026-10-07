// @lenient
// A callback taken from an untyped options object and applied to the arguments it was closed with,
// as core's modal view calls `options.closeCallback.apply(undefined, originalArgs)`.
interface ModalOptions {
  closeCallback?: (...args) => void;
}
function close(options: any, ...originalArgs) {
  if (typeof options.closeCallback === 'function') {
    options.closeCallback.apply(undefined, originalArgs);
  }
}
function closeTyped(options: ModalOptions, ...originalArgs) {
  options.closeCallback.apply(undefined, originalArgs);
}
close({ closeCallback: (result: string, extra: number) => console.log(`closed with ${result} ${extra}`) }, 'done', 2);
closeTyped({ closeCallback: (...all) => console.log(`typed ${all.join('+')}`) }, 'a', 'b');
