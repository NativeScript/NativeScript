package org.nativescript.kit

/**
 * A realm's per-thread state: its global object, timers and microtask queue. A worker's thread
 * enters its own; every other thread runs in the app's (`main`), as all code did before workers.
 */
class JSRealm internal constructor() {
    val global: JSObject = JSObject().also { it["DOMException"] = JSDOMException::class.java }
    val loop = JSEventLoopState()
    val microtasks = JSMicrotasks()
    /** Runs a job on this realm's thread, from any thread: the host installs it for the app's realm (its main looper). */
    @Volatile var post: ((() -> Unit) -> Unit)? = null
    /** Where an uncaught error in this realm goes; null reports it as the app's. */
    var uncaught: ((Any?) -> Unit)? = null

    companion object {
        val main = JSRealm()
        private val entered = ThreadLocal<JSRealm?>()
        fun current(): JSRealm = entered.get() ?: main
        internal fun enter(realm: JSRealm) = entered.set(realm)
    }
}
