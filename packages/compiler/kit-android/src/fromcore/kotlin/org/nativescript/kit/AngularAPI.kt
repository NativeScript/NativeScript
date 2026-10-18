package org.nativescript.kit

// Angular's dependency injection and the @nativescript/angular services an app injects, for components and
// services compiled to classes with a `shared` instance (`providedIn: 'root'`), as kit-apple's AngularAPI.swift.

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
 * `HttpClient` through core's `Http.request`, the request @nativescript/angular's backend sends through
 * core's XMLHttpRequest: the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
 */
class HttpClient private constructor() {
    private fun send(method: String, url: String, body: Any? = null, options: Any? = null): RxObservable<Any?> {
        val flatOpts = jsBox(options)
        val text = jsToString(jsGetOptional(flatOpts, "responseType")) == "text"
        val observe = jsToString(jsGetOptional(flatOpts, "observe") ?: "body")
        val rawHeaders = jsGetOptional(flatOpts, "headers")
        val rawParams = jsGetOptional(flatOpts, "params")

        var fullUrl = url
        if (!jsIsNullish(rawParams)) {
            val q = (jsBox(rawParams) as? HttpParams)?.toString() ?: HttpParams(rawParams).toString()
            if (q.isNotEmpty()) {
                fullUrl = if (fullUrl.contains("?")) "$fullUrl&$q" else "$fullUrl?$q"
            }
        }

        var headersObj: Any? = (jsBox(rawHeaders) as? HttpHeaders)?.toJSObject() ?: rawHeaders
        val payloadBody = body ?: jsGetOptional(flatOpts, "body")
        val upperMethod = method.uppercase()

        val request: () -> JSPromise<Any?> = {
            val failure = { status: Double, reason: String -> JSError("Http failure response for $fullUrl: ${jsToString(status)} $reason") }
            val (promise, resolvers) = JSPromise.pending<Any?>()
            try {
                val settings = JSObject("url" to fullUrl, "method" to upperMethod)
                if (!jsIsNullish(payloadBody) && upperMethod != "GET" && upperMethod != "HEAD") {
                    if (payloadBody is String) {
                        settings["content"] = payloadBody
                    } else {
                        val json = jsJSONStringify(payloadBody)
                        if (json is String) {
                            settings["content"] = json
                            if (jsIsNullish(headersObj)) {
                                headersObj = JSObject("Content-Type" to "application/json")
                            }
                        }
                    }
                }
                if (!jsIsNullish(headersObj)) settings["headers"] = headersObj
                (Core_http_http_request_index.request(settings) ?: jsCannotRead("then")).then({ response: Any? ->
                    try {
                        val status = jsToNumber(jsGet(response, "statusCode"))
                        val reason = if (status == 0.0) "Unknown Error" else reasonPhrase(status.toInt())
                        if (status >= 400 || status == 0.0) {
                            resolvers.reject(failure(status, reason))
                        } else {
                            val rawContent = jsToString(jsCallMethod(jsGet(response, "content"), "toString"))
                            val parsed: Any? = if (text) rawContent else if (rawContent.isEmpty()) null else jsJSONParse(rawContent)
                            if (observe == "response") {
                                resolvers.resolve(HttpResponse(JSObject(
                                    "body" to parsed,
                                    "status" to status,
                                    "statusText" to reason,
                                    "url" to fullUrl,
                                )))
                            } else {
                                resolvers.resolve(parsed)
                            }
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

    fun request(first: Any?, url: String? = null, options: Any? = null): RxObservable<Any?> {
        val req = jsBox(first) as? HttpRequest
        if (req != null) {
            return send(req.method, req.url, req.body, JSObject(
                "headers" to req.headers,
                "params" to req.params,
                "responseType" to req.responseType,
                "observe" to "response",
            ))
        }
        return send(jsToString(first), url ?: "", null, options)
    }

    fun get(url: String, options: Any? = null): RxObservable<Any?> = send("GET", url, null, options)
    fun delete(url: String, options: Any? = null): RxObservable<Any?> = send("DELETE", url, null, options)
    fun head(url: String, options: Any? = null): RxObservable<Any?> = send("HEAD", url, null, options)
    fun options(url: String, options: Any? = null): RxObservable<Any?> = send("OPTIONS", url, null, options)
    fun post(url: String, body: Any? = null, options: Any? = null): RxObservable<Any?> = send("POST", url, body, options)
    fun put(url: String, body: Any? = null, options: Any? = null): RxObservable<Any?> = send("PUT", url, body, options)
    fun patch(url: String, body: Any? = null, options: Any? = null): RxObservable<Any?> = send("PATCH", url, body, options)

    fun jsonp(url: String, callbackParam: String): RxObservable<Any?> {
        val sep = if (url.contains("?")) "&" else "?"
        return get("$url$sep${jsEncodeURIComponent(callbackParam)}=JSONP_CALLBACK")
    }

    private fun reasonPhrase(status: Int): String = when (status) {
        200 -> "OK"; 201 -> "Created"; 202 -> "Accepted"; 204 -> "No Content"
        400 -> "Bad Request"; 401 -> "Unauthorized"; 403 -> "Forbidden"; 404 -> "Not Found"; 405 -> "Method Not Allowed"
        408 -> "Request Timeout"; 409 -> "Conflict"; 410 -> "Gone"; 422 -> "Unprocessable Entity"; 429 -> "Too Many Requests"
        500 -> "Internal Server Error"; 501 -> "Not Implemented"; 502 -> "Bad Gateway"; 503 -> "Service Unavailable"; 504 -> "Gateway Timeout"
        else -> ""
    }

    companion object {
        val shared = HttpClient()
    }
}
