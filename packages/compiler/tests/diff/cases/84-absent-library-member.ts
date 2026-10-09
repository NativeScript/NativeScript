// @lenient
// A member the language's library does not declare on its global, which a shim would add (`Reflect.metadata`): never there.
function metadata(key: string, value: unknown): unknown {
  if (
    typeof Reflect === 'object' &&
    // @ts-expect-error
    typeof Reflect.metadata === 'function'
  ) {
    // @ts-expect-error
    return Reflect.metadata(key, value);
  }
  return 'none';
}
console.log(metadata('design:type', 1));
