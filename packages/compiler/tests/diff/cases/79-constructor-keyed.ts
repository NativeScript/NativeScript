// @lenient
// A static member looked up by key on an instance's constructor (core's isKnownFunction).
const KNOWN_FUNCTIONS = 'knownFunctions';
class Widget {
  static knownFunctions = 'format,parse';
}
class Plain {}
function isKnownFunction(name: string, instance: Widget | Plain): boolean {
  return instance.constructor && KNOWN_FUNCTIONS in instance.constructor && (instance.constructor[KNOWN_FUNCTIONS] as string).indexOf(name) !== -1;
}
console.log(isKnownFunction('format', new Widget()), isKnownFunction('tap', new Widget()), isKnownFunction('format', new Plain()));
