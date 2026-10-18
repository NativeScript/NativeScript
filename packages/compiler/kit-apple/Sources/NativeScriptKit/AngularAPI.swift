import Foundation

// Angular's dependency injection and the @nativescript/angular services an app
// injects, for components and services compiled to classes with a `shared`
// instance (`providedIn: 'root'`).

/// An event a component raises (Angular `output()`): the parent subscribes, the component emits.
public final class Emitter<T> {
    nonisolated deinit {}
    private var handlers: [(T) -> Void] = []
    public init() {}
    public func on(_ handler: @escaping (T) -> Void) { handlers.append(handler) }
    public func emit(_ value: T) { for h in handlers { h(value) } }
}

extension Emitter where T == Void {
    public func emit() { emit(()) }
}

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

/// `HttpClient.get` through core's `Http.request`, the request @nativescript/angular's backend sends through
/// core's XMLHttpRequest: the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
public final class HttpClient {
    nonisolated deinit {}
    public static let shared = HttpClient()

    public func get(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        let text = jsToString((try? jsGet(options, "responseType")) ?? nil) == "text"
        let headers = (try? jsGet(options, "headers")) ?? nil
        let request: () -> JSPromise<Any?> = {
            let failure = { (status: Double, reason: String) in JSError("Http failure response for \(url): \(jsToString(status)) \(reason)") }
            let (promise, resolvers) = JSPromise<Any?>.pending()
            var settings: [(String, Any?)] = [("url", url), ("method", "GET")]
            if !jsIsNullish(headers) { settings.append(("headers", headers)) }
            let sent: JSPromise<Any?>
            do { sent = try jsUnwrap(Core_http_http_request_index.request(JSObject(settings)), "then") } catch {
                resolvers.reject(jsCaught(error))
                return promise
            }
            _ = sent.then({ (response: Any?) -> Void in
                do {
                    let status = jsToNumber(try jsGet(response, "statusCode"))
                    if status >= 400 || status == 0 {
                        let reason = HTTPURLResponse.localizedString(forStatusCode: Int(status)).capitalized
                        resolvers.reject(failure(status, status == 0 ? "Unknown Error" : reason))
                        return
                    }
                    let body = jsToString(try jsCallMethod(try jsGet(response, "content"), "toString"))
                    if text { resolvers.resolve(body) } else { resolvers.resolve(body.isEmpty ? nil : try jsJSONParse(body)) }
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

/// `ElementRef`: a view of a template, as a view query (`@ViewChild('ref', { read: ElementRef })`) gives it.
public final class ElementRef {
    nonisolated deinit {}
    public private(set) var nativeElement: Any?
    public init(_ nativeElement: Any?) { self.nativeElement = nativeElement }

    /// A component's own ElementRef, made with the component: its template's root view, once made.
    public func attach(_ host: Any?) { nativeElement = host }
}

/// `SimpleChange`: one input's change, as `ngOnChanges` receives it.
public final class SimpleChange {
    nonisolated deinit {}
    public var previousValue: Any?
    public var currentValue: Any?
    public var firstChange: Bool
    public init(_ previousValue: Any?, _ currentValue: Any?, _ firstChange: Bool) {
        self.previousValue = previousValue
        self.currentValue = currentValue
        self.firstChange = firstChange
    }
    public func isFirstChange() -> Bool { firstChange }
}

extension ElementRef {
    private static var hosts: [Any?] = []

    /// Makes a directive of an element: its `inject(ElementRef)` is the element.
    public static func hosting<T>(_ host: Any?, _ make: () throws -> T) rethrows -> T {
        hosts.append(host)
        defer { hosts.removeLast() }
        return try make()
    }

    /// `inject(ElementRef)`: the element whose directive is being made; elsewhere, a ref to no view.
    public static func current() -> ElementRef { ElementRef(hosts.last ?? nil) }
}
