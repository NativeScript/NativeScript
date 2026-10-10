package org.nativescript.kit

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
 * `Worker`. A compiled app runs no worker threads yet: making one throws, as starting a worker
 * can, so an app's own fallback does the work on the main thread.
 */
class JSWorker(@Suppress("UNUSED_PARAMETER") scriptURL: Any?) : JSDynamic {
    var onmessage: ((JSMessageEvent) -> Any?)? = null
    var onerror: ((JSErrorEvent) -> Any?)? = null

    init {
        throw JSException(JSError("Worker is not supported in a compiled app"))
    }

    fun postMessage(@Suppress("UNUSED_PARAMETER") message: Any?) {}
    fun terminate() {}

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Worker"
}
