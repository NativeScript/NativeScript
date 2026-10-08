import Foundation

// Angular's dependency injection and the @nativescript/angular services an app
// injects, for components and services compiled to classes with a `shared`
// instance (`providedIn: 'root'`).

/// An event a component raises (Angular `output()`): the parent subscribes, the component emits.
public final class Emitter<T> {
    private var handlers: [(T) -> Void] = []
    public init() {}
    public func on(_ handler: @escaping (T) -> Void) { handlers.append(handler) }
    public func emit(_ value: T) { for h in handlers { h(value) } }
}

extension Emitter where T == Void {
    public func emit() { emit(()) }
}

/// `inject(DestroyRef)`: callbacks run when the injecting component's scope ends.
public final class DestroyRef {
    private weak var owner: Owner?
    init(_ owner: Owner?) { self.owner = owner }
    public static func current() -> DestroyRef { DestroyRef(Owner.current) }

    @discardableResult
    public func onDestroy(_ callback: @escaping () -> Void) -> () -> Void {
        var active = true
        owner?.onCleanup { if active { callback() } }
        return { active = false }
    }

    @discardableResult
    public func onDestroy(_ callback: @escaping () throws -> Void) -> () -> Void {
        onDestroy { () -> Void in jsReport(callback) }
    }
}

/// `inject(Injector)`; `injector.get(Service)` is compiled to the service's shared instance.
public final class Injector {
    public static let shared = Injector()

    /// A root service, made as the root injector makes it: whatever component first injects it, its effects
    /// and its `DestroyRef` belong to the application, and what its constructor reads subscribes no binding.
    public static func root<T>(_ make: () -> T) -> T {
        untrack { Owner(parent: nil).run(make) }
    }
}

/// `NgZone` without zone.js: both run their function at once.
public final class NgZone {
    public static let shared = NgZone()
    public func run<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
    public func runOutsideAngular<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
}

/// A component class used as a value (`dialog.open(SheetComponent)`): what creating and rendering it gives.
public final class ComponentFactory {
    let make: () -> View
    public init(_ make: @escaping () -> View) { self.make = make }
}

/// `NativeDialogRef`: the open dialog a component was created in.
public final class NativeDialogRef {
    public static var current: NativeDialogRef!
    /// `NATIVE_DIALOG_DATA`: the `data` the dialog was opened with.
    public internal(set) var data: Any? = nil
    private let closed = RxReplaySubject<Any?>(1)

    public func close(_ result: Any? = nil) { Modal.close(result) }
    public func afterClosed() -> RxObservable<Any?> { closed.asObservable() }
    func didClose(_ result: Any?) { closed.next(result) }
}

/// `NativeDialog` (`NativeDialogService`): a component shown as a native modal, with `nativeOptions` as `showModal` takes them.
public final class NativeDialogService {
    public static let shared = NativeDialogService()

    @discardableResult
    public func open(_ component: Any?, _ config: Any? = nil) -> NativeDialogRef {
        let ref = NativeDialogRef()
        ref.data = (try? jsGet(config, "data")) ?? nil
        guard let factory = jsFlat(component) as? ComponentFactory else { return ref }
        let options = (try? jsGet(config, "nativeOptions")) ?? nil
        Modal.show(options: options, closeCallback: { result in ref.didClose(jsFlat(result)) }) {
            let previous = NativeDialogRef.current
            NativeDialogRef.current = ref
            defer { NativeDialogRef.current = previous }
            return factory.make()
        }
        return ref
    }
}

/// `HttpClient.get` through core's `Http.request`, the request @nativescript/angular's backend sends through
/// core's XMLHttpRequest: the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
public final class HttpClient {
    public static let shared = HttpClient()

    public func get(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        let text = jsToString((try? jsGet(options, "responseType")) ?? nil) == "text"
        let headers = (try? jsGet(options, "headers")) ?? nil
        let request: () -> JSPromise<Any?> = {
            let failure = { (status: Double, reason: String) in JSError("Http failure response for \(url): \(jsToString(status)) \(reason)") }
            let (promise, resolvers) = JSPromise<Any?>.pending()
            do {
                var settings: [(String, Any?)] = [("url", url), ("method", "GET")]
                if !jsIsNullish(headers) { settings.append(("headers", headers)) }
                _ = try Core_http_http_request_index.request(JSObject(settings)).then({ (response: Any?) -> Void in
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
            } catch {
                resolvers.reject(jsCaught(error))
            }
            return promise
        }
        let observable = RxObservable<Any?> { next in
            let subscription = RxSubscription()
            _ = request().then { value in if !subscription.closed { next(value) } }
            return subscription
        }
        observable.first = request
        return observable
    }
}

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
