package org.nativescript.kit

import android.util.Log as AndroidLog

/**
 * An error no script code caught (a callback's, a timer's, a rejected promise's), handled as NativeScript's
 * runtime handles it: core's `Application` hears it (`uncaughtError`, or `discardedError` under
 * `discardUncaughtJsExceptions`), it is logged to logcat, and with `uncaughtErrorPolicy: 'throw'` it then
 * ends the app as an exception crash reporters record.
 */
object UncaughtErrors {
    /** nativescript.config's `uncaughtErrorPolicy`: "report" (the default) or "throw". */
    @JvmStatic var policy = "report"

    /** nativescript.config's deprecated `discardUncaughtJsExceptions`. */
    @JvmStatic var discard = false

    /** For the main realm, on the main thread before the app's modules run. */
    fun install() {
        jsUncaughtHandler = { report(it, rejection = false) }
        Microtasks.onUnhandledRejection = { report(it, rejection = true) }
    }

    /** Under the "throw" policy: what ends the app, rethrown past any report frame it unwinds through. */
    private var fatal: RuntimeException? = null

    fun report(error: Any?, rejection: Boolean) {
        fatal?.let { throw it }
        val stack = (error as? JSError)?.stack ?: ""
        val message = jsFormatLogLine(listOf(if (rejection) "Uncaught (in promise)" else "Uncaught", error))
        // Core's handler reads the stack as `error.stackTrace`, which the runtime sets before calling it.
        (error as? JSError)?.jsSet("stackTrace", stack)
        val handler = jsField(jsGlobalThis, if (discard) "__onDiscardedError" else "__onUncaughtError")
        if (!jsIsNullish(handler)) {
            try {
                jsCall(handler, error)
            } catch (e: Throwable) {
                AndroidLog.e(TAG, "Error in the uncaught error handler: ${jsFormatLogLine(listOf(jsCaught(e)))}")
            }
        }
        if (discard) {
            AndroidLog.w(TAG, "NativeScript discarding uncaught JS exception!\n$message")
            return
        }
        AndroidLog.e(TAG, "***** Fatal JavaScript exception *****\n$message")
        if (policy == "throw") throw RuntimeException(message, (error as? JSError)?.let { RuntimeException(stack) }).also { fatal = it }
    }

    private const val TAG = "JS"
}
