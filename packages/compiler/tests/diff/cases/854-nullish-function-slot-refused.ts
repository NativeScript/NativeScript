// A parameter holding a function that may be null or undefined both is refused: a function held untyped isn't one yet.
function call(cb: (() => string) | null | undefined): string {
  return cb === null ? 'null' : cb === undefined ? 'undefined' : cb();
}
console.log(call(null), call(undefined), call(() => 'f'));
