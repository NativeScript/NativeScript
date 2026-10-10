package org.nativescript.kit

import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

// Web workers, URL and `import.meta`, as far as compiled apps reach them.

/** `import.meta` of the app's bundled module. */
val jsImportMeta: JSObject = JSObject(listOf("url" to "file:///app/bundle.mjs"))

/** `URL`: an absolute URL, resolved against a base. */
class JSURL(url: Any?, base: Any? = null) : JSDynamic, JSStringConvertible {
    val href: String = run {
        val text = jsToString(url)
        try {
            if (jsIsNullish(base)) java.net.URI(text).also { if (!it.isAbsolute) throw IllegalArgumentException() }.toString()
            else java.net.URI(jsToString(base)).resolve(text).toString()
        } catch (_: Exception) {
            throw JSException(JSTypeError("Invalid URL: $text"))
        }
    }

    override fun toString(): String = href
    override fun jsGet(key: String): Any? = when (key) {
        "href" -> href
        "toString" -> JSMethod { _, _ -> href }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "URL"
}

/** `MessageEvent`: what a worker's message handler receives. */
class JSMessageEvent(val data: Any?) : JSDynamic {
    override fun jsGet(key: String): Any? = if (key == "data") data else null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = listOf("data")
    override val jsClassName: String? get() = "MessageEvent"
}

/** `ErrorEvent`: what a worker's error handler receives. */
class JSErrorEvent(val message: String) : JSDynamic {
    override fun jsGet(key: String): Any? = if (key == "message") message else null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = listOf("message")
    override val jsClassName: String? get() = "ErrorEvent"
}

/**
 * `Worker`: a compiled worker script on its own thread, in its own realm (global object, timers,
 * microtasks). Messages are structured clones queued to the worker's thread or posted back through
 * the creating realm's `post`. The script's top-level bindings are its file's statics, so a script
 * runs in one worker at a time.
 */
class JSWorker(scriptURL: Any?, script: String? = null) : JSDynamic {
    var onmessage: ((JSMessageEvent) -> Any?)? = null
    var onerror: ((JSErrorEvent) -> Any?)? = null

    private val owner = JSRealm.current()
    private val realm = JSRealm()
    private val key: String
    private val inbox = LinkedBlockingQueue<() -> Unit>()
    @Volatile private var closed = false
    /** When the worker's next timer is due, in `System.nanoTime()`; only its thread reads and writes it. */
    private var wake: Long? = null

    init {
        val entry = script?.let { scripts[it] }
            ?: throw JSException(JSError("Worker script ${jsToString(scriptURL)} was not compiled with the app"))
        if (owner.post == null) throw JSException(JSError("Worker: the creating thread has no event loop to receive messages"))
        if (!running.add(script)) throw JSException(JSError("Worker script $script already runs in a worker"))
        key = script
        realm.global["postMessage"] = JSMethod { _, a -> fromWorker(a.getOrNull(0)); null }
        realm.global["close"] = JSMethod { _, _ -> stop(); null }
        realm.global["self"] = realm.global
        realm.global["global"] = realm.global
        realm.uncaught = { error -> toOwner(error) }
        realm.post = { job -> inbox.put(job) }
        realm.loop.host = { delay -> wake = if (delay == null) null else System.nanoTime() + (Math.ceil(delay) * 1_000_000).toLong() }
        realm.microtasks.onEnqueue = { inbox.put { realm.microtasks.checkpoint() } }
        Thread({ run(entry) }, "JSWorker $script").apply { isDaemon = true }.start()
    }

    private fun run(entry: () -> Unit) {
        JSRealm.enter(realm)
        task(entry)
        while (!closed) {
            val due = wake
            val job = if (due == null) inbox.take() else inbox.poll(maxOf(0L, due - System.nanoTime()), TimeUnit.NANOSECONDS)
            if (closed) break
            if (job != null) task(job)
            else { wake = null; task { realm.loop.processTimers() } }
        }
    }

    /** One task on the worker's thread, then its microtasks; what it throws goes to `onerror`. */
    private fun task(body: () -> Unit) {
        try {
            body()
        } catch (e: Throwable) {
            toOwner(jsCaught(e))
        }
        realm.microtasks.taskRan()
        realm.microtasks.checkpoint()
    }

    fun postMessage(message: Any?) {
        if (closed) return
        val data = jsStructuredClone(message)
        inbox.put { jsGetOptional(realm.global, "onmessage")?.let { jsCall(it, JSMessageEvent(data)) } }
    }

    private fun fromWorker(message: Any?) {
        val data = jsStructuredClone(message)
        owner.post?.invoke { if (!closed) ownerTask { onmessage?.invoke(JSMessageEvent(data)) } }
    }

    /** An error the worker did not handle: the Worker's `onerror`, else reported as uncaught where the worker was made. */
    private fun toOwner(error: Any?) {
        val message = "Uncaught ${jsToString(error)}"
        owner.post?.invoke {
            if (!closed) ownerTask { if (onerror?.invoke(JSErrorEvent(message)) != true) jsReportUncaught(error) }
        }
    }

    private fun ownerTask(body: () -> Unit) {
        try {
            body()
        } catch (e: Throwable) {
            jsReportUncaught(jsCaught(e))
        }
        Microtasks.taskRan()
        Microtasks.checkpoint()
    }

    /** `terminate()`, or `close()` inside: queued messages and timers are dropped; a blocking call in progress finishes first. */
    private fun stop() {
        if (closed) return
        closed = true
        running.remove(key)
        inbox.put {}
    }

    fun terminate() = stop()

    override fun jsGet(key: String): Any? = when (key) {
        "postMessage" -> JSMethod { _, a -> postMessage(a.getOrNull(0)); null }
        "terminate" -> JSMethod { _, _ -> terminate(); null }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Worker"

    companion object {
        private val scripts = java.util.concurrent.ConcurrentHashMap<String, () -> Unit>()
        private val running: MutableSet<String> = java.util.concurrent.ConcurrentHashMap.newKeySet()

        /** A worker script the app compiled, by its path in the app: its module's top level, run on the worker's thread. */
        fun register(script: String, entry: () -> Unit) { scripts[script] = entry }
    }
}

/**
 * HTML's StructuredSerialize/Deserialize in one step: plain data copied deep, cycles and shared
 * references kept; functions and host objects are a DataCloneError, as in a browser.
 */
fun jsStructuredClone(value: Any?, seen: java.util.IdentityHashMap<Any, Any?> = java.util.IdentityHashMap()): Any? {
    if (value == null || value === JSNull || value is String || value is Double || value is Boolean || value is JSBigInt) return value
    if (value is Number) return value.toDouble()
    seen[value]?.let { return it }
    fun fail(): Nothing = throw JSException(JSDOMException("${getClass(value)} could not be cloned.", "DataCloneError"))
    return when (value) {
        is Function<*> -> fail()
        is JSArrayBuffer -> value.slice().also { seen[value] = it }
        is JSTypedArray<*, *> -> value.slice().also { seen[value] = it }
        is JSDate -> JSDate(value.time).also { seen[value] = it }
        is JSArray<*> -> {
            val copy = JSArray<Any?>()
            seen[value] = copy
            for (e in value.storage) copy.storage.add(jsStructuredClone(e, seen))
            copy
        }
        is JSMap<*, *> -> {
            val copy = JSMap<Any?, Any?>()
            seen[value] = copy
            for ((k, v) in value) copy.set(jsStructuredClone(k, seen), jsStructuredClone(v, seen))
            copy
        }
        is JSSet<*> -> {
            val copy = JSSet<Any?>()
            seen[value] = copy
            for (e in value) copy.add(jsStructuredClone(e, seen))
            copy
        }
        is JSError -> JSError(value.message).also { it.name = value.name; seen[value] = it }
        is JSDynamic -> {
            val copy = JSObject()
            seen[value] = copy
            for (k in value.jsKeys) copy[k] = jsStructuredClone(value.jsGet(k), seen)
            copy
        }
        else -> fail()
    }
}

/** A worker script's own `postMessage(message)`: its realm's, which its Worker defines. */
fun postMessage(message: Any?, @Suppress("UNUSED_PARAMETER") options: Any? = null) {
    jsCall(jsGetOptional(jsGlobalThis, "postMessage"), message)
}

/** A worker script's own `close()`. */
fun close() {
    jsCall(jsGetOptional(jsGlobalThis, "close"))
}
