import UIKit

// Angular's dependency injection and the @nativescript/angular services an app
// injects, for components and services compiled to classes with a `shared`
// instance (`providedIn: 'root'`).

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
}

/// `inject(Injector)`; `injector.get(Service)` is compiled to the service's shared instance.
public final class Injector {
    public static let shared = Injector()
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
        guard let factory = jsFlat(component) as? ComponentFactory, let parent = Modal.top else { return ref }
        let owner = Owner(parent: nil)
        let previous = NativeDialogRef.current
        NativeDialogRef.current = ref
        let view = owner.run(factory.make)
        NativeDialogRef.current = previous
        let options = (try? jsGet(config, "nativeOptions")) ?? nil
        Modal.present(view, from: parent, options: options, owner: owner) { result in ref.didClose(result) }
        return ref
    }
}

/// `HttpClient.get` over `URLSession`, as @nativescript/angular's backend sends through core's `Http`:
/// the body parsed as JSON unless `responseType` is `'text'`, a status of 400 or more an error.
public final class HttpClient {
    public static let shared = HttpClient()

    public func get(_ url: String, _ options: Any? = nil) -> RxObservable<Any?> {
        let text = jsToString((try? jsGet(options, "responseType")) ?? nil) == "text"
        let headers = (try? jsGet(options, "headers")) ?? nil
        let request: () -> JSPromise<Any?> = {
            let (promise, resolvers) = JSPromise<Any?>.pending()
            guard let target = URL(string: url) else {
                resolvers.reject(JSError("Http failure response for \(url): 0 Unknown Error"))
                return promise
            }
            var req = URLRequest(url: target)
            for key in jsKeysOf(headers) { req.setValue(jsToString((try? jsGet(headers, key)) ?? nil), forHTTPHeaderField: key) }
            URLSession.shared.dataTask(with: req) { data, response, error in
                DispatchQueue.main.async {
                    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
                    let body = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                    if error != nil || status >= 400 || status == 0 {
                        let reason = HTTPURLResponse.localizedString(forStatusCode: status).capitalized
                        resolvers.reject(JSError("Http failure response for \(url): \(status) \(status == 0 ? "Unknown Error" : reason)"))
                    } else if text {
                        resolvers.resolve(body)
                    } else {
                        do { resolvers.resolve(body.isEmpty ? nil : try jsJSONParse(body)) } catch { resolvers.reject(jsCaught(error)) }
                    }
                    Microtasks.checkpoint()
                }
            }.resume()
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

/// `requestAnimationFrame(callback)`: called on the next display frame with the frame's time in
/// milliseconds, as core's iOS implementation calls it from a CADisplayLink.
private final class FrameCallbacks: NSObject {
    static let shared = FrameCallbacks()
    private var link: CADisplayLink?
    private var callbacks: [(id: Double, fn: (Double) -> Void)] = []
    private var nextId = 0.0

    func add(_ fn: @escaping (Double) -> Void) -> Double {
        nextId += 1
        callbacks.append((nextId, fn))
        if link == nil {
            let link = CADisplayLink(target: self, selector: #selector(tick(_:)))
            link.add(to: .main, forMode: .common)
            self.link = link
        }
        return nextId
    }

    func remove(_ id: Double) { callbacks.removeAll { $0.id == id } }

    @objc private func tick(_ link: CADisplayLink) {
        let due = callbacks
        callbacks = []
        let time = link.timestamp * 1000
        for c in due { c.fn(time) }
        Microtasks.checkpoint()
        if callbacks.isEmpty {
            link.invalidate()
            self.link = nil
        }
    }
}

@discardableResult
public func jsRequestAnimationFrame(_ callback: @escaping (Double) -> Void) -> Double { FrameCallbacks.shared.add(callback) }

public func jsCancelAnimationFrame(_ id: Double) { FrameCallbacks.shared.remove(id) }
