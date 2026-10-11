import Foundation

/// An error no script code caught (a callback's, a timer's, a rejected promise's), handled as NativeScript's
/// runtime handles it: core's `Application` hears it (`uncaughtError`, or `discardedError` under
/// `discardUncaughtJsExceptions`), it is logged where a release build's log is read, and with
/// `uncaughtErrorPolicy: 'throw'` it then ends the app as a native exception crash reporters record.
public enum UncaughtErrors {
    /// nativescript.config's `uncaughtErrorPolicy`: "report" (the default) or "throw".
    public static var policy = "report"
    /// nativescript.config's deprecated `discardUncaughtJsExceptions`.
    public static var discard = false

    static func install() {
        jsUncaughtHandler = { report($0, rejection: false) }
        Microtasks.onUnhandledRejection = { report($0, rejection: true) }
    }

    static func report(_ error: Any?, rejection: Bool) {
        let stack = (jsFlat(error) as? JSError)?.stack ?? ""
        let message = jsFormatLogLine([rejection ? "Uncaught (in promise)" : "Uncaught", error])
        // Core's handler reads the stack as `error.stackTrace`, which the runtime sets before calling it.
        if let object = jsFlat(error) as? JSError { object[jsKey: "stackTrace"] = stack }
        let handler = jsField(jsGlobalThis, discard ? "__onDiscardedError" : "__onUncaughtError")
        if !jsIsNullish(handler) {
            do { _ = try jsCall(handler, error) } catch { log("Error in the uncaught error handler: \(jsFormatLogLine([jsCaught(error)]))") }
        }
        if discard { return log("NativeScript discarding uncaught JS exception!\n\(message)") }
        log("***** Fatal JavaScript exception *****\n\(message)")
        if policy == "throw" {
            NSException(name: NSExceptionName("NativeScriptFatalJSException"), reason: message, userInfo: stack.isEmpty ? nil : ["stackTrace": stack]).raise()
        }
    }

    /// NSLog reaches the device's log (Console, `log stream`) as well as Xcode's console, where standard error does not.
    private static func log(_ text: String) { NSLog("%@", text) }
}
