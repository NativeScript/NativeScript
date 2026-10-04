package org.nativescript.kit

/**
 * The dependency a deeply reactive collection reports (Vue's `ref`/`reactive`): reads
 * subscribe the running `Effect`, mutations re-run the effects that read it.
 */
class JSTracker {
    private val version = Signal(0)

    fun track() { version.value }

    fun trigger() { version.update { it + 1 } }
}

/**
 * A class Vue's deep reactivity reaches into: `JSArray`, `JSObject`, `JSMap`, `JSSet` and
 * generated classes, which install trackers on themselves.
 */
interface JSReactiveConvertible {
    fun jsMakeReactive()
}

/**
 * Vue's `reactive(value)`: makes a collection or generated class track reads and writes and
 * returns it; other values pass through. What is read from a reactive collection is made
 * reactive as it is read, as Vue's lazy deep proxies do.
 */
fun <T> jsReactive(value: T): T {
    if (value is JSReactiveConvertible) value.jsMakeReactive()
    return value
}

internal fun jsReactiveAny(value: Any?): Any? {
    if (value is JSReactiveConvertible) value.jsMakeReactive()
    return value
}
