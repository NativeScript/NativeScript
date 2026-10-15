// What a case's native classes need under Node, as NativeScript's runtime provides it: `@NativeClass` and `NSObject.new()`.
globalThis.NativeClass = (cls) => cls;
globalThis.NSObject = class NSObject {
  static new() {
    return new this();
  }
};
