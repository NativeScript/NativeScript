// What a case's native classes need under Node, as NativeScript's runtime provides it: `@NativeClass` and `NSObject.new()`.
globalThis.NativeClass = (cls) => cls;
globalThis.NSObject = class NSObject {
  static new() {
    return new this();
  }
};
// An error no script code caught, as NativeScript reports it under uncaughtErrorPolicy "report": to the handler a case
// sets (`globalThis.__onUncaughtError`, where core's is), and the program goes on. Without one, Node's own behavior.
for (const event of ['uncaughtException', 'unhandledRejection']) {
  process.on(event, (error) => {
    const handler = globalThis.__onUncaughtError;
    if (typeof handler !== 'function') {
      console.error(event === 'unhandledRejection' ? 'Uncaught (in promise)' : 'Uncaught', error);
      process.exit(1);
    }
    handler(error);
  });
}
