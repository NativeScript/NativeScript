import Foundation

// Angular's dependency injection and the @nativescript/angular services an app
// injects, for components and services compiled to classes with a `shared`
// instance (`providedIn: 'root'`).

/// A component class used as a value (`dialog.open(SheetComponent)`): what creating and rendering it gives.
public final class ComponentFactory {
    nonisolated deinit {}
    let make: () throws -> View
    public init(_ make: @escaping () throws -> View) { self.make = make }
}

/// `NativeDialogRef`: the open dialog a component was created in.
public final class NativeDialogRef {
    nonisolated deinit {}
    /// `inject(NativeDialogRef)`: the dialog being created; outside one, a ref to no dialog, whose `close` does nothing.
    public static var current: NativeDialogRef { open ?? NativeDialogRef(detached: true) }
    static var open: NativeDialogRef?
    private let detached: Bool
    init(detached: Bool = false) { self.detached = detached }
    /// `NATIVE_DIALOG_DATA`: the `data` the dialog was opened with.
    public internal(set) var data: Any? = nil
    private let closed = RxReplaySubject<Any?>(1)

    public func close(_ result: Any? = nil) { if !detached { Modal.close(result) } }
    public func afterClosed() -> RxObservable<Any?> { closed.asObservable() }
    func didClose(_ result: Any?) { closed.next(result) }
}

/// `NativeDialog` (`NativeDialogService`): a component shown as a native modal, with `nativeOptions` as `showModal` takes them.
public final class NativeDialogService {
    nonisolated deinit {}
    public static let shared = NativeDialogService()

    @discardableResult
    public func open(_ component: Any?, _ config: Any? = nil) -> NativeDialogRef {
        let ref = NativeDialogRef()
        ref.data = (try? jsGet(config, "data")) ?? nil
        guard let factory = jsFlat(component) as? ComponentFactory else { return ref }
        let options = (try? jsGet(config, "nativeOptions")) ?? nil
        Modal.show(options: options, closeCallback: { result in ref.didClose(jsFlat(result)) }) {
            let previous = NativeDialogRef.open
            NativeDialogRef.open = ref
            defer { NativeDialogRef.open = previous }
            // The component in a ContentView of its own, the modal's root, as @nativescript/angular presents it:
            // the root takes the safe area its content then lays out within.
            let pending = Reactivity.pending()
            let host = try ContentView()
            host.content = try factory.make()
            Reactivity.detectChanges(after: pending)
            return host
        }
        return ref
    }
}

/// `HttpClient` through core's `Http.request`, the request @nativescript/angular's backend sends through
/// core's XMLHttpRequest: the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
public final class HttpClient {
    nonisolated deinit {}
    public static let shared = HttpClient()

    private func send(_ method: String, _ url: String, _ body: Any? = nil, _ options: Any? = nil) -> RxObservable<Any?> {
        let flatOpts = jsFlat(options)
        let text = jsToString((try? jsGet(flatOpts, "responseType")) ?? nil) == "text"
        let observe = jsToString((try? jsGet(flatOpts, "observe")) ?? "body")
        let rawHeaders = (try? jsGet(flatOpts, "headers")) ?? nil
        let rawParams = (try? jsGet(flatOpts, "params")) ?? nil

        var fullUrl = url
        if !jsIsNullish(rawParams) {
            let q = (jsFlat(rawParams) as? HttpParams)?.toString() ?? HttpParams(rawParams).toString()
            if !q.isEmpty {
                fullUrl = fullUrl.contains("?") ? "\(fullUrl)&\(q)" : "\(fullUrl)?\(q)"
            }
        }

        var headersObj: Any? = (jsFlat(rawHeaders) as? HttpHeaders)?.toJSObject() ?? rawHeaders
        let payloadBody = body ?? ((try? jsGet(flatOpts, "body")) ?? nil)
        let upperMethod = method.uppercased()

        let request: () -> JSPromise<Any?> = {
            let failure = { (status: Double, reason: String) in JSError("Http failure response for \(fullUrl): \(jsToString(status)) \(reason)") }
            let (promise, resolvers) = JSPromise<Any?>.pending()
            var settings: [(String, Any?)] = [("url", fullUrl), ("method", upperMethod)]
            if !jsIsNullish(payloadBody) && upperMethod != "GET" && upperMethod != "HEAD" {
                if let s = payloadBody as? String {
                    settings.append(("content", s))
                } else if let json = try? jsJSONStringifyChecked(payloadBody) {
                    settings.append(("content", json))
                    if jsIsNullish(headersObj) {
                        headersObj = JSObject([("Content-Type", "application/json")])
                    }
                }
            }
            if !jsIsNullish(headersObj) { settings.append(("headers", headersObj)) }
            let sent: JSPromise<Any?>
            do { sent = try jsUnwrap(Core_http_http_request_index.request(JSObject(settings)), "then") } catch {
                resolvers.reject(jsCaught(error))
                return promise
            }
            _ = sent.then({ (response: Any?) -> Void in
                do {
                    let status = jsToNumber(try jsGet(response, "statusCode"))
                    let reason = status == 0 ? "Unknown Error" : HTTPURLResponse.localizedString(forStatusCode: Int(status)).capitalized
                    if status >= 400 || status == 0 {
                        resolvers.reject(failure(status, reason))
                        return
                    }
                    let rawContent = jsToString(try jsCallMethod(try jsGet(response, "content"), "toString"))
                    let parsed: Any? = text ? rawContent : (rawContent.isEmpty ? nil : try jsJSONParse(rawContent))
                    if observe == "response" {
                        resolvers.resolve(HttpResponse(JSObject([
                            ("body", parsed),
                            ("status", status),
                            ("statusText", reason),
                            ("url", fullUrl),
                        ])))
                    } else {
                        resolvers.resolve(parsed)
                    }
                } catch {
                    resolvers.reject(jsCaught(error))
                }
            }, { (_: Any?) -> Void in resolvers.reject(failure(0, "Unknown Error")) })
            return promise
        }
        let observable = RxObservable<Any?>(full: { next, error, complete in
            let subscription = RxSubscription()
            _ = request().then({ value in
                if !subscription.closed {
                    next(value)
                    complete()
                }
            }, { err in
                if !subscription.closed { error(err) }
            })
            return subscription
        })
        observable.first = request
        return observable
    }

    public func request(_ first: Any?, _ url: String? = nil, _ options: Any? = nil) -> RxObservable<Any?> {
        if let req = jsFlat(first) as? HttpRequest {
            return send(req.method, req.url, req.body, JSObject([
                ("headers", req.headers),
                ("params", req.params),
                ("responseType", req.responseType),
                ("observe", "response"),
            ]))
        }
        return send(jsToString(first), url ?? "", nil, options)
    }

    public func get(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        send("GET", url, nil, options)
    }

    public func delete(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        send("DELETE", url, nil, options)
    }

    public func head(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        send("HEAD", url, nil, options)
    }

    public func options(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        send("OPTIONS", url, nil, options)
    }

    public func post(_ url: String, _ body: Any? = nil, _ options: Any? = nil) -> RxObservable<Any?> {
        send("POST", url, body, options)
    }

    public func put(_ url: String, _ body: Any? = nil, _ options: Any? = nil) -> RxObservable<Any?> {
        send("PUT", url, body, options)
    }

    public func patch(_ url: String, _ body: Any? = nil, _ options: Any? = nil) -> RxObservable<Any?> {
        send("PATCH", url, body, options)
    }

    public func jsonp(_ url: String, _ callbackParam: String) -> RxObservable<Any?> {
        let sep = url.contains("?") ? "&" : "?"
        return get("\(url)\(sep)\(jsEncodeURIComponent(callbackParam))=JSONP_CALLBACK")
    }
}

public typealias KitHttpClient = HttpClient
public typealias KitNativeDialogRef = NativeDialogRef
public typealias KitNativeDialogService = NativeDialogService

// MARK: @angular/core/rxjs-interop

/// `toSignal(source, { initialValue })`: a signal holding the source's latest value, subscribed for as
/// long as the injecting scope lives, its writes compared with `Object.is` as Angular's signals compare them.
public func toSignal<T>(_ source: RxObservable<T>, initialValue: T) -> Signal<T> {
    let signal = Signal(initialValue, equals: { jsSameValue($0, $1) })
    let subscription = source.subscribe { (value: T) in signal.value = value }
    Owner.current?.onCleanup { subscription.unsubscribe() }
    return signal
}

/// `toSignal(source)`: undefined until the source's first value.
public func toSignal<T>(_ source: RxObservable<T>) -> Signal<T?> {
    toSignal(source.mapValues { Optional($0) }, initialValue: nil)
}

/// `takeUntilDestroyed(destroyRef?)`: the source's values until the scope it was called in (or `destroyRef`'s) ends.
public func takeUntilDestroyed<T>(_ destroyRef: DestroyRef? = nil) -> RxOperatorFunction<T, T> {
    let ref = destroyRef ?? DestroyRef.current()
    return RxOperatorFunction { source in
        RxObservable { next in
            let subscription = source.subscribe(next)
            let stop = ref.onDestroy { subscription.unsubscribe() }
            return RxSubscription {
                stop()
                subscription.unsubscribe()
            }
        }
    }
}
