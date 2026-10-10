package org.nativescript.kit

/** What JavaScript `throw value` throws: any value, not only errors. Its JVM stack is recorded only when tracing (`jsTraceErrors`). */
class JSException(val value: Any?) : RuntimeException(null, null, false, jsTraceErrors) {
    override val message: String get() = "Uncaught " + jsToString(value)
}

/** JavaScript `Error`. TypeScript classes extending `Error` subclass it and set `name` in their constructor. */
open class JSError(message: String = "", open var cause: Any? = null) : JSDynamic {
    open var name: String = "Error"
    open var message: String = message
    private var storedStack: String? = null
    private var properties: JSObject? = null

    /** `"Name: message"`, as `String(error)` gives it. */
    val jsErrorString: String
        get() = when {
            message.isEmpty() -> name
            name.isEmpty() -> message
            else -> "$name: $message"
        }

    /** V8's `error.stack`: the header line and a placeholder frame. */
    open var stack: String
        get() = storedStack ?: "$jsErrorString\n    at <anonymous>"
        set(value) { storedStack = value }

    override fun jsGet(key: String): Any? = when (key) {
        "name" -> name
        "message" -> message
        "stack" -> stack
        "cause" -> cause
        else -> properties?.get(key)
    }

    override fun jsSet(key: String, value: Any?) {
        when (key) {
            "name" -> name = jsToString(value)
            "message" -> message = jsToString(value)
            "stack" -> stack = jsToString(value)
            "cause" -> cause = value
            else -> (properties ?: JSObject().also { properties = it })[key] = value
        }
    }

    override val jsKeys: List<String> get() = properties?.keys ?: emptyList()
    override val jsClassName: String? get() = name

    override fun toString(): String = jsErrorString
}

open class JSTypeError(message: String = "", cause: Any? = null) : JSError(message, cause) {
    init { name = "TypeError" }
}

open class JSRangeError(message: String = "", cause: Any? = null) : JSError(message, cause) {
    init { name = "RangeError" }
}

open class JSSyntaxError(message: String = "", cause: Any? = null) : JSError(message, cause) {
    init { name = "SyntaxError" }
}

open class JSReferenceError(message: String = "", cause: Any? = null) : JSError(message, cause) {
    init { name = "ReferenceError" }
}

open class JSAggregateError(var errors: JSArray<Any?>, message: String = "", cause: Any? = null) : JSError(message, cause) {
    init { name = "AggregateError" }

    override fun jsGet(key: String): Any? = if (key == "errors") errors else super.jsGet(key)

    @Suppress("UNCHECKED_CAST")
    override fun jsSet(key: String, value: Any?) {
        if (key == "errors" && value is JSArray<*>) errors = value as JSArray<Any?> else super.jsSet(key, value)
    }
}

/**
 * The JavaScript value a `catch` clause binds for a JVM throwable: the thrown value of a
 * `JSException`, a RangeError for a stack overflow, and an `Error` carrying the message of
 * anything else (an exception from an Android API, say).
 */
fun jsCaught(error: Throwable): Any? = when (error) {
    is JSException -> error.value
    else -> {
        if (jsTraceErrors) error.printStackTrace()
        jsCaughtJvm(error)
    }
}

private fun jsCaughtJvm(error: Throwable): Any? = when (error) {
    is StackOverflowError -> JSRangeError("Maximum call stack size exceeded")
    is NullPointerException -> JSTypeError(error.message ?: "Cannot read properties of undefined").withFrames(error)
    is ClassCastException -> JSTypeError(error.message ?: "").withFrames(error)
    else -> JSError(error.message ?: error.toString()).withFrames(error)
}

/** `error.stack` in V8's format over the JVM frames that threw, as many as V8 keeps; `retrace.ts` maps them to the app's source. */
private fun <E : JSError> E.withFrames(error: Throwable): E {
    val frames = error.stackTrace.take(10)
    if (frames.isNotEmpty()) stack = jsErrorString + frames.joinToString("") { "\n    at ${it.className}.${it.methodName} (${it.fileName ?: "Unknown Source"}:${it.lineNumber})" }
    return this
}

/** `throw value`. */
fun jsThrow(value: Any?): Nothing = throw JSException(value)

/** Whether a reported error also prints the JVM stack it was thrown from (`adb shell setprop log.tag.NSNative DEBUG`). */
var jsTraceErrors = false

/** Runs `body`; an error it throws is reported as uncaught, as a JavaScript host reports an exception escaping a callback. */
inline fun jsReport(body: () -> Unit) {
    try {
        body()
    } catch (e: Throwable) {
        if (jsTraceErrors) e.printStackTrace()
        jsReportUncaught(jsCaught(e))
    }
}

var jsUncaughtHandler: (Any?) -> Unit = { value -> jsError("Uncaught", value) }

fun jsReportUncaught(value: Any?) = (JSRealm.current().uncaught ?: jsUncaughtHandler)(value)

/** A member read from a receiver its type promised (`x!.name`, `items[i].name`): JavaScript's TypeError when it is missing. */
fun <T> jsUnwrap(value: T?, key: String, isNull: Boolean = false): T =
    value ?: throw JSException(JSTypeError("Cannot read properties of ${if (isNull) "null" else "undefined"} (reading '$key')"))
