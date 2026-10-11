package org.nativescript.kit

/**
 * An untyped value where code declares an `Error` (`catch (e) { (e as Error).message }`, `.catch((e: Error) => …)`):
 * the error itself, or a view reading the thrown value's members.
 */
fun jsErrorOf(value: Any?): JSError = value as? JSError ?: JSThrownValue(value)

/** What was thrown or rejected that is no `Error`, seen as one: its members read as the value's own, undefined where it has none. */
class JSThrownValue(val value: Any?) : JSError("") {
    private val isObject = jsTypeof(value) == "object" && value !== JSNull

    init {
        name = read("name")
        message = read("message")
    }

    private fun read(key: String): String {
        val v = if (isObject) jsField(value, key) else null
        return if (jsIsNullish(v)) "undefined" else jsToString(v)
    }

    override var stack: String
        get() = read("stack")
        set(_) {}

    override fun jsGet(key: String): Any? = if (isObject) jsField(value, key) else null

    override fun jsSet(key: String, value: Any?) {
        if (isObject) jsSet(this.value, key, value)
    }

    override val jsKeys: List<String> get() = if (isObject) jsKeysOf(value) else emptyList()
}
