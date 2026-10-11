package org.nativescript.kit

// Angular's dependency injection and the @nativescript/angular services an app injects, for components and
// services compiled to classes with a `shared` instance (`providedIn: 'root'`), as kit-apple's AngularAPI.swift.

/** `inject(Injector)`; `injector.get(Service)` is compiled to the service's shared instance. */
class Injector private constructor() {
    companion object {
        val shared = Injector()
    }
}

/** `NgZone` without zone.js: both run their function at once. */
class NgZone private constructor() {
    fun <T> run(fn: () -> T): T = fn()
    fun <T> runOutsideAngular(fn: () -> T): T = fn()

    companion object {
        val shared = NgZone()
    }
}

/** A component class used as a value (`dialog.open(SheetComponent)`): what creating and rendering it gives. */
class ComponentFactory(internal val make: () -> View)

/** `NativeDialogRef`: the open dialog a component was created in. */
class NativeDialogRef {
    /** `NATIVE_DIALOG_DATA`: the `data` the dialog was opened with. */
    var data: Any? = null
        internal set
    private val closed = RxReplaySubject<Any?>(1.0)

    fun close(result: Any? = null) = Modal.close(result)
    fun afterClosed(): RxObservable<Any?> = closed.asObservable()
    internal fun didClose(result: Any?) = closed.next(result)

    companion object {
        /** The dialog whose component is being created; one no dialog opened before then. */
        var current = NativeDialogRef()
    }
}

/** `NativeDialog` (`NativeDialogService`): a component shown as a native modal, with `nativeOptions` as `showModal` takes them. */
class NativeDialogService private constructor() {
    fun open(component: Any?, config: Any? = null): NativeDialogRef {
        val ref = NativeDialogRef()
        ref.data = jsGet(config, "data")
        val factory = jsBox(component) as? ComponentFactory ?: return ref
        Modal.show(jsGet(config, "nativeOptions"), closeCallback = { result -> ref.didClose(result) }) {
            val previous = NativeDialogRef.current
            NativeDialogRef.current = ref
            try { factory.make() } finally { NativeDialogRef.current = previous }
        }
        return ref
    }

    companion object {
        val shared = NativeDialogService()
    }
}

/**
 * `HttpClient.get` through core's `Http.request`, the request @nativescript/angular's backend sends through
 * core's XMLHttpRequest: the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
 */
class HttpClient private constructor() {
    fun get(url: String, options: Any? = null): RxObservable<Any?> {
        val text = jsToString(jsGet(options, "responseType")) == "text"
        val headers = jsGet(options, "headers")
        val request: () -> JSPromise<Any?> = {
            val failure = { status: Double, reason: String -> JSError("Http failure response for $url: ${jsToString(status)} $reason") }
            val (promise, resolvers) = JSPromise.pending<Any?>()
            try {
                val settings = JSObject("url" to url, "method" to "GET")
                if (!jsIsNullish(headers)) settings["headers"] = headers
                Core_http_http_request_index.request(settings)!!.then({ response: Any? ->
                    try {
                        val status = jsToNumber(jsGet(response, "statusCode"))
                        if (status >= 400 || status == 0.0) {
                            resolvers.reject(failure(status, if (status == 0.0) "Unknown Error" else reasonPhrase(status.toInt())))
                        } else {
                            val body = jsToString(jsCallMethod(jsGet(response, "content"), "toString"))
                            if (text) resolvers.resolve(body) else resolvers.resolve(if (body.isEmpty()) null else jsJSONParse(body))
                        }
                    } catch (e: Throwable) {
                        resolvers.reject(jsCaught(e))
                    }
                }, { _: Any? -> resolvers.reject(failure(0.0, "Unknown Error")) })
            } catch (e: Throwable) {
                resolvers.reject(jsCaught(e))
            }
            promise
        }
        val observable = RxObservable<Any?> { next ->
            val subscription = RxSubscription()
            request().then { value -> if (!subscription.closed) next(value) }
            subscription
        }
        observable.first = request
        return observable
    }

    private fun reasonPhrase(status: Int): String = when (status) {
        400 -> "Bad Request"; 401 -> "Unauthorized"; 403 -> "Forbidden"; 404 -> "Not Found"; 405 -> "Method Not Allowed"
        408 -> "Request Timeout"; 409 -> "Conflict"; 410 -> "Gone"; 422 -> "Unprocessable Entity"; 429 -> "Too Many Requests"
        500 -> "Internal Server Error"; 501 -> "Not Implemented"; 502 -> "Bad Gateway"; 503 -> "Service Unavailable"; 504 -> "Gateway Timeout"
        else -> ""
    }

    companion object {
        val shared = HttpClient()
    }
}
