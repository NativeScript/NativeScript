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
 * runs in one live worker at a time; a new one of a script whose worker is stopping starts once
 * that worker's thread has ended.
 */
class JSWorker(scriptURL: Any?, script: String? = null) : JSDynamic {
    var onmessage: ((JSMessageEvent) -> Any?)? = null
    var onerror: ((JSErrorEvent) -> Any?)? = null

    private val owner = JSRealm.current()
    private val realm = JSRealm()
    private val key: String
    private val inbox = LinkedBlockingQueue<() -> Unit>()
    /** `terminate()`: nothing more runs in the worker, and nothing more reaches the creator. */
    @Volatile private var terminated = false
    /** `close()` in the worker: its loop ends after the running task; what it posted before still arrives. */
    @Volatile private var closing = false
    /** When the worker's next timer is due, in `System.nanoTime()`; only its thread reads and writes it. */
    private var wake: Long? = null
    /** The worker's thread; it ends once the worker is terminated or closed and its running task returns. */
    val thread: Thread

    private val live: Boolean get() = !terminated && !closing

    init {
        val entry = script?.let { scripts[it] }
            ?: throw JSException(JSError("Worker script ${jsToString(scriptURL)} was not compiled with the app"))
        if (owner.post == null) throw JSException(JSError("Worker: the creating thread has no event loop to receive messages"))
        key = script
        var previous: JSWorker? = null
        running.compute(script) { _, current ->
            if (current != null && current.live) {
                throw JSException(JSError("Worker script $script already runs in a worker. Its module state is shared, so one worker runs it at a time: terminate() the first, or close() it from inside, before starting another"))
            }
            previous = current
            this
        }
        realm.global["postMessage"] = JSMethod { _, a -> fromWorker(a.getOrNull(0)); null }
        realm.global["close"] = JSMethod { _, _ -> closing = true; null }
        realm.global["self"] = realm.global
        realm.global["global"] = realm.global
        realm.uncaught = { error -> toOwner(error) }
        realm.post = { job -> inbox.put(job) }
        realm.loop.host = { delay -> wake = if (delay == null) null else System.nanoTime() + (Math.ceil(delay) * 1_000_000).toLong() }
        realm.microtasks.onEnqueue = { inbox.put { realm.microtasks.checkpoint() } }
        val before = previous?.thread
        thread = Thread({ run(entry, before) }, "JSWorker $script").apply { isDaemon = true }
        thread.start()
    }

    /** The worker's thread: nothing may escape it, as an exception ending a thread ends an Android app. */
    private fun run(entry: () -> Unit, before: Thread?) {
        try {
            before?.join()
            JSRealm.enter(realm)
            if (live) task(entry)
            while (live) {
                val due = wake
                val job = if (due == null) inbox.take() else inbox.poll(maxOf(0L, due - System.nanoTime()), TimeUnit.NANOSECONDS)
                if (!live) break
                if (job != null) task(job)
                else {
                    wake = null
                    task { realm.loop.processTimers() }
                }
            }
        } catch (e: Throwable) {
            try { jsError("Worker $key stopped:", e.toString()) } catch (_: Throwable) {}
        } finally {
            inbox.clear()
            running.remove(key, this)
        }
    }

    /** One task on the worker's thread, then its microtasks; what either throws goes to `onerror`. */
    private fun task(body: () -> Unit) {
        try {
            body()
        } catch (e: Throwable) {
            toOwner(jsCaught(e))
        }
        if (terminated) return
        realm.microtasks.taskRan()
        while (true) {
            try {
                realm.microtasks.checkpoint()
                return
            } catch (e: Throwable) {
                toOwner(jsCaught(e))
            }
        }
    }

    /** `worker.postMessage(message, transfer)`: transferables are copied, not moved; a stopped worker drops it. */
    fun postMessage(message: Any?, @Suppress("UNUSED_PARAMETER") transfer: Any? = null) {
        if (!live) return
        val data = jsStructuredClone(message)
        inbox.put { jsGetOptional(realm.global, "onmessage")?.let { jsCall(it, JSMessageEvent(data)) } }
    }

    private fun fromWorker(message: Any?) {
        val data = jsStructuredClone(message)
        if (!live) return
        owner.post?.invoke { if (!terminated) ownerTask { onmessage?.invoke(JSMessageEvent(data)) } }
    }

    /** An error the worker did not handle: the Worker's `onerror`, else reported as uncaught where the worker was made. */
    private fun toOwner(error: Any?) {
        if (!live) return
        val message = try { "Uncaught ${jsToString(error)}" } catch (_: Throwable) { "Uncaught exception in worker $key" }
        val reported = try { jsStructuredClone(error) } catch (_: Throwable) { message }
        owner.post?.invoke {
            if (!terminated) ownerTask { if (onerror?.invoke(JSErrorEvent(message)) != true) reportUncaught(reported) }
        }
    }

    private fun ownerTask(body: () -> Unit) {
        try {
            body()
        } catch (e: Throwable) {
            reportUncaught(jsCaught(e))
        }
        Microtasks.taskRan()
        Microtasks.checkpoint()
    }

    private fun reportUncaught(error: Any?) {
        try {
            jsReportUncaught(error)
        } catch (_: Throwable) {
            try { jsError("Uncaught", error) } catch (_: Throwable) {}
        }
    }

    /** `terminate()`: queued messages and timers are dropped; a blocking call in progress finishes first. */
    fun terminate() {
        if (terminated) return
        terminated = true
        inbox.put {}
    }

    override fun jsGet(key: String): Any? = when (key) {
        "postMessage" -> JSMethod { _, a -> postMessage(a.getOrNull(0), a.getOrNull(1)); null }
        "terminate" -> JSMethod { _, _ -> terminate(); null }
        "onmessage" -> onmessage
        "onerror" -> onerror
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {
        val handler: ((Any?) -> Any?)? = if (jsIsFunction(value)) { event -> jsCall(value, event) } else null
        when (key) {
            "onmessage" -> onmessage = handler
            "onerror" -> onerror = handler
        }
    }
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Worker"

    companion object {
        private val scripts = java.util.concurrent.ConcurrentHashMap<String, () -> Unit>()
        private val running = java.util.concurrent.ConcurrentHashMap<String, JSWorker>()

        /** A worker script the app compiled, by its path in the app: its module's top level, run on the worker's thread. */
        fun register(script: String, entry: () -> Unit) { scripts[script] = entry }
    }
}

/**
 * HTML's StructuredSerialize/Deserialize in one step: plain data copied deep, cycles and shared
 * references kept (views keep sharing their copied buffer); functions, symbols and host objects are
 * a DataCloneError, as in a browser.
 */
fun jsStructuredClone(value: Any?, seen: java.util.IdentityHashMap<Any, Any?> = java.util.IdentityHashMap()): Any? {
    if (value == null || value === Unit || value === JSNull || value is String || value is Double || value is Boolean || value is JSBigInt) return value
    if (value is Number) return value.toDouble()
    seen[value]?.let { return it }
    fun fail(): Nothing = throw JSException(JSDOMException("${getClass(value)} could not be cloned.", "DataCloneError"))
    if (jsIsFunction(value)) fail()
    return when (value) {
        is JSArrayBuffer -> value.slice().also { seen[value] = it }
        is JSTypedArray<*, *> -> {
            val buffer = jsStructuredClone(value.buffer, seen) as JSArrayBuffer
            value.make(JSTypedArrayLayout(buffer, value.offset, value.count)).also { seen[value] = it }
        }
        is JSDataView -> {
            val buffer = jsStructuredClone(value.buffer, seen) as JSArrayBuffer
            JSDataView(buffer, value.byteOffset, value.byteLength).also { seen[value] = it }
        }
        is JSDate -> JSDate(value.time).also { seen[value] = it }
        is JSRegExp -> JSRegExp(value.source, value.flags).also { seen[value] = it }
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
        is JSError -> {
            // Only the standard error names survive serialization; any other becomes a plain Error.
            val copy = when {
                value is JSDOMException -> JSDOMException(value.message, value.name)
                value.name == "TypeError" -> JSTypeError(value.message)
                value.name == "RangeError" -> JSRangeError(value.message)
                value.name == "SyntaxError" -> JSSyntaxError(value.message)
                value.name == "ReferenceError" -> JSReferenceError(value.message)
                else -> JSError(value.message)
            }
            copy.stack = value.stack
            seen[value] = copy
            copy
        }
        is JSSymbol, is JSHostObject, is JSJavaPackage, is JSWorker, is JSURL, is JSWeakRef<*>, is JSMessageEvent, is JSErrorEvent,
        is JSTextEncoder, is JSTextDecoder, is JSCrypto, is JSSubtleCrypto, is JSCryptoKey, is JSNumberFormat, is JSDateTimeFormat -> fail()
        is JSDynamic -> {
            val copy = JSObject()
            seen[value] = copy
            for (k in value.jsKeys) copy[k] = jsStructuredClone(value.jsGet(k), seen)
            copy
        }
        else -> fail()
    }
}

/** A worker script's own `postMessage(message, transfer)`: its realm's, which its Worker defines. Transferables are copied. */
fun postMessage(message: Any?, @Suppress("UNUSED_PARAMETER") transfer: Any? = null) {
    jsCall(jsGetOptional(jsGlobalThis, "postMessage"), message)
}

/** A worker script's own `close()`. */
fun close() {
    jsCall(jsGetOptional(jsGlobalThis, "close"))
}
