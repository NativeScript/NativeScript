import Foundation

// Promises and the microtask queue, following ECMA-262 §27.2 job for job so that the
// interleaving of callbacks matches V8's exactly.

/// The microtask queue (HTML "perform a microtask checkpoint", Node's `runMicrotasks`).
public enum Microtasks {
    nonisolated(unsafe) private static var queue: [(() -> Void)?] = []
    nonisolated(unsafe) private static var head = 0
    nonisolated(unsafe) private static var draining = false
    nonisolated(unsafe) static var pendingRejections: [JSRejection] = []

    /// Receives the reason of every promise still rejected without a handler when a checkpoint
    /// ends, as Node's `unhandledRejection` event does. The default prints
    /// `Uncaught (in promise) <reason>` to standard error and carries on (Node would exit).
    nonisolated(unsafe) public static var onUnhandledRejection: (Any?) -> Void = { reason in
        jsWriteStandardError("Uncaught (in promise) \(jsToString(reason))\n")
    }

    public static func enqueue(_ job: @escaping () -> Void) { queue.append(job) }

    /// Called when a checkpoint ends after a task (`taskRan`) or a job ran: Angular's zone turning stable.
    nonisolated(unsafe) public static var onStable: (() -> Void)?
    nonisolated(unsafe) private static var turned = false

    /// A JavaScript task (an event handler, a timer callback) ran.
    public static func taskRan() { turned = true }

    /// Runs queued jobs FIFO, including jobs they queue, then reports unhandled rejections
    /// (and drains again if reporting queued more). A call made while draining does nothing.
    public static func checkpoint() {
        guard !draining else { return }
        draining = true
        defer { draining = false }
        while true {
            while head < queue.count {
                let job = queue[head]!
                queue[head] = nil
                head += 1
                job()
                turned = true
                if head >= 1024 && head * 2 >= queue.count {
                    queue.removeFirst(head)
                    head = 0
                }
            }
            queue.removeAll(keepingCapacity: true)
            head = 0
            if pendingRejections.isEmpty {
                guard turned, let onStable else { return }
                turned = false
                onStable()
                continue
            }
            let pending = pendingRejections
            pendingRejections = []
            for rejection in pending where !rejection.handled {
                onUnhandledRejection(rejection.reason)
            }
        }
    }
}

/// A rejection HostPromiseRejectionTracker saw without a handler.
final class JSRejection {
    let reason: Any?
    var handled = false
    init(_ reason: Any?) { self.reason = reason }
}

public enum JSPromiseState {
    case pending, fulfilled, rejected
}

/// A native promise of any result type, for code that handles promises dynamically.
public protocol JSThenable: AnyObject {
    /// PerformPromiseThen with no derived promise; the result arrives boxed as a JavaScript value.
    func jsSubscribe(_ onFulfilled: @escaping (Any?) -> Void, _ onRejected: @escaping (Any?) -> Void)
    var jsPromiseState: (state: JSPromiseState, value: Any?) { get }
}

/// A value as JavaScript sees it: `Void` is undefined, nested optionals collapse.
func jsBox<T>(_ value: T) -> Any? {
    T.self == Void.self ? nil : jsFlat(value)
}

private func jsTypeMismatch<T>(_ value: Any?, _ type: T.Type) -> JSTypeError {
    JSTypeError("A promise of \(T.self) was resolved with \(jsTypeof(value)) \(jsToString(value))")
}

/// The resolving functions of a promise (CreateResolvingFunctions): whichever is called first wins.
public final class JSResolvers<T> {
    public let promise: JSPromise<T>
    private var alreadyResolved = false

    init(_ promise: JSPromise<T>) { self.promise = promise }

    /// `resolve(value)`. A value that is itself a promise or thenable is adopted.
    public func resolve(_ value: T) {
        guard !alreadyResolved else { return }
        alreadyResolved = true
        promise.resolveWith(value)
    }

    /// `resolve(promise)`: adopts `other`'s eventual state through a NewPromiseResolveThenableJob.
    public func resolve(promise other: JSPromise<T>) {
        guard !alreadyResolved else { return }
        alreadyResolved = true
        promise.adopt(other)
    }

    public func reject(_ reason: Any?) {
        guard !alreadyResolved else { return }
        alreadyResolved = true
        promise.settleRejected(reason)
    }
}

extension JSResolvers where T == Void {
    public func resolve() { resolve(()) }
}

/// A JavaScript `Promise` (ECMA-262 §27.2). Rejection reasons are any JavaScript value.
public final class JSPromise<T>: JSThenable, CustomStringConvertible {
    private var state = JSPromiseState.pending
    private var result: T?
    private var reason: Any?
    private var reactions: [(fulfilled: (T) -> Void, rejected: (Any?) -> Void)] = []
    private var isHandled = false
    private var rejection: JSRejection?
    /// What `cancel()` does on a promise a library made cancelable (core's `AnimationPromise`).
    public var canceler: (() -> Void)?

    init() {}

    public func cancel() { canceler?() }

    /// `new Promise((resolve, reject) => …)`. A thrown error rejects the promise.
    public init(_ executor: (_ resolve: @escaping (T) -> Void, _ reject: @escaping (Any?) -> Void) throws -> Void) {
        let resolvers = JSResolvers(self)
        do {
            try executor({ resolvers.resolve($0) }, { resolvers.reject($0) })
        } catch {
            resolvers.reject(jsCaught(error))
        }
    }

    /// `new Promise(…)` whose executor gets the resolving functions as an object, which can also
    /// resolve with another promise.
    public init(_ executor: (JSResolvers<T>) throws -> Void) {
        let resolvers = JSResolvers(self)
        do {
            try executor(resolvers)
        } catch {
            resolvers.reject(jsCaught(error))
        }
    }

    /// A pending promise and its resolving functions.
    public static func pending() -> (JSPromise<T>, JSResolvers<T>) {
        let promise = JSPromise<T>()
        return (promise, JSResolvers(promise))
    }

    /// `Promise.withResolvers()`.
    public static func withResolvers() -> (promise: JSPromise<T>, resolve: (T) -> Void, reject: (Any?) -> Void) {
        let (promise, resolvers) = pending()
        return (promise, { resolvers.resolve($0) }, { resolvers.reject($0) })
    }

    // MARK: Settling

    /// A promise resolve function after its already-resolved check (§27.2.1.3.2 steps 7–16).
    func resolveWith(_ resolution: T) {
        if let thenable = resolution as? JSThenable {
            if thenable === self {
                settleRejected(JSTypeError("Chaining cycle detected for promise #<Promise>"))
                return
            }
            Microtasks.enqueue { [self] in
                let resolvers = JSResolvers(self)
                thenable.jsSubscribe({ value in
                    if let typed: T = jsCast(value) { resolvers.resolve(typed) } else { resolvers.reject(jsTypeMismatch(value, T.self)) }
                }, { resolvers.reject($0) })
            }
            return
        }
        if let object = resolution as? JSDynamic, !(object is JSError), let then = jsFlat(object is JSObject || object is JSFunctionObject || object is JSProxy ? ((try? jsGet(object, "then")) ?? nil) : object[jsKey: "then"]), then is JSFunction || then is JSFunctionObject {
            Microtasks.enqueue { [self] in
                let resolvers = JSResolvers(self)
                let resolve: JSFunction = { arguments in
                    let value = arguments.first ?? nil
                    if let typed: T = jsCast(value) { resolvers.resolve(typed) } else { resolvers.reject(jsTypeMismatch(value, T.self)) }
                    return nil
                }
                let reject: JSFunction = { arguments in
                    resolvers.reject(arguments.first ?? nil)
                    return nil
                }
                do {
                    _ = try jsInvoke(then, object, [resolve, reject])
                } catch {
                    resolvers.reject(jsCaught(error))
                }
            }
            return
        }
        settleFulfilled(resolution)
    }

    /// Resolving with a native promise: NewPromiseResolveThenableJob, then that promise's `then`.
    func adopt(_ other: JSPromise<T>) {
        if other === self {
            settleRejected(JSTypeError("Chaining cycle detected for promise #<Promise>"))
            return
        }
        Microtasks.enqueue { [self] in
            let resolvers = JSResolvers(self)
            other.performThen({ resolvers.resolve($0) }, { resolvers.reject($0) })
        }
    }

    /// FulfillPromise.
    func settleFulfilled(_ value: T) {
        guard state == .pending else { return }
        state = .fulfilled
        result = value
        let pending = reactions
        reactions = []
        for reaction in pending { Microtasks.enqueue { reaction.fulfilled(value) } }
    }

    /// RejectPromise, reporting the rejection to the tracker when nothing handles it yet.
    func settleRejected(_ reason: Any?) {
        guard state == .pending else { return }
        state = .rejected
        self.reason = reason
        let pending = reactions
        reactions = []
        if !isHandled {
            let record = JSRejection(reason)
            rejection = record
            Microtasks.pendingRejections.append(record)
        }
        for reaction in pending { Microtasks.enqueue { reaction.rejected(reason) } }
    }

    /// PerformPromiseThen. The callbacks are the whole reaction jobs: each runs as its own microtask.
    func performThen(_ onFulfilled: @escaping (T) -> Void, _ onRejected: @escaping (Any?) -> Void) {
        switch state {
        case .pending:
            reactions.append((onFulfilled, onRejected))
        case .fulfilled:
            let value = result!
            Microtasks.enqueue { onFulfilled(value) }
        case .rejected:
            if !isHandled { rejection?.handled = true }
            let reason = self.reason
            Microtasks.enqueue { onRejected(reason) }
        }
        isHandled = true
    }

    // MARK: then / catch / finally

    @discardableResult
    public func then<U>(_ onFulfilled: @escaping (T) throws -> U) -> JSPromise<U> {
        let (derived, resolvers) = JSPromise<U>.pending()
        performThen({ value in
            do { resolvers.resolve(try onFulfilled(value)) } catch { resolvers.reject(jsCaught(error)) }
        }, { resolvers.reject($0) })
        return derived
    }

    @discardableResult
    public func then<U>(_ onFulfilled: @escaping (T) throws -> U, _ onRejected: @escaping (Any?) throws -> U) -> JSPromise<U> {
        let (derived, resolvers) = JSPromise<U>.pending()
        performThen({ value in
            do { resolvers.resolve(try onFulfilled(value)) } catch { resolvers.reject(jsCaught(error)) }
        }, { reason in
            do { resolvers.resolve(try onRejected(reason)) } catch { resolvers.reject(jsCaught(error)) }
        })
        return derived
    }

    /// `then` whose callback returns a promise, which the derived promise adopts (two extra ticks).
    @discardableResult
    public func then<U>(_ onFulfilled: @escaping (T) throws -> JSPromise<U>) -> JSPromise<U> {
        thenAdopt(onFulfilled)
    }

    @discardableResult
    public func then<U>(_ onFulfilled: @escaping (T) throws -> JSPromise<U>, _ onRejected: @escaping (Any?) throws -> JSPromise<U>) -> JSPromise<U> {
        thenAdopt(onFulfilled, onRejected)
    }

    @discardableResult
    public func thenAdopt<U>(_ onFulfilled: @escaping (T) throws -> JSPromise<U>) -> JSPromise<U> {
        let (derived, resolvers) = JSPromise<U>.pending()
        performThen({ value in
            do { resolvers.resolve(promise: try onFulfilled(value)) } catch { resolvers.reject(jsCaught(error)) }
        }, { resolvers.reject($0) })
        return derived
    }

    @discardableResult
    public func thenAdopt<U>(_ onFulfilled: @escaping (T) throws -> JSPromise<U>, _ onRejected: @escaping (Any?) throws -> JSPromise<U>) -> JSPromise<U> {
        let (derived, resolvers) = JSPromise<U>.pending()
        performThen({ value in
            do { resolvers.resolve(promise: try onFulfilled(value)) } catch { resolvers.reject(jsCaught(error)) }
        }, { reason in
            do { resolvers.resolve(promise: try onRejected(reason)) } catch { resolvers.reject(jsCaught(error)) }
        })
        return derived
    }

    /// `catch` recovering with a value of the promise's own type.
    @discardableResult
    public func `catch`(_ onRejected: @escaping (Any?) throws -> T) -> JSPromise<T> {
        let (derived, resolvers) = JSPromise<T>.pending()
        performThen({ resolvers.resolve($0) }, { reason in
            do { resolvers.resolve(try onRejected(reason)) } catch { resolvers.reject(jsCaught(error)) }
        })
        return derived
    }

    /// `catch` whose callback returns a promise to adopt.
    @discardableResult
    public func `catch`(_ onRejected: @escaping (Any?) throws -> JSPromise<T>) -> JSPromise<T> {
        catchAdopt(onRejected)
    }

    /// `catch` recovering with another type (`p.catch(e => console.error(e))`): the result is dynamic.
    @discardableResult
    public func `catch`<U>(_ onRejected: @escaping (Any?) throws -> U) -> JSPromise<Any?> {
        let (derived, resolvers) = JSPromise<Any?>.pending()
        performThen({ resolvers.resolve(jsBox($0)) }, { reason in
            do { resolvers.resolve(jsBox(try onRejected(reason))) } catch { resolvers.reject(jsCaught(error)) }
        })
        return derived
    }

    @discardableResult
    public func catchAdopt(_ onRejected: @escaping (Any?) throws -> JSPromise<T>) -> JSPromise<T> {
        let (derived, resolvers) = JSPromise<T>.pending()
        performThen({ resolvers.resolve($0) }, { reason in
            do { resolvers.resolve(promise: try onRejected(reason)) } catch { resolvers.reject(jsCaught(error)) }
        })
        return derived
    }

    /// `finally` (§27.2.5.3): the callback's result goes through PromiseResolve and `then`, so the
    /// outcome passes on two ticks later than a plain `then`.
    @discardableResult
    public func finally(_ onFinally: @escaping () throws -> Void) -> JSPromise<T> {
        thenAdopt({ value in
            try onFinally()
            return JSPromise<Void>.resolve(()).then { _ in value }
        }, { reason in
            try onFinally()
            return JSPromise<Void>.resolve(()).then { _ -> T in throw JSException(reason) }
        })
    }

    /// `finally` whose callback returns a promise, awaited before the outcome passes on.
    @discardableResult
    public func finally<U>(_ onFinally: @escaping () throws -> JSPromise<U>) -> JSPromise<T> {
        thenAdopt({ value in
            try onFinally().then { _ in value }
        }, { reason in
            try onFinally().then { _ -> T in throw JSException(reason) }
        })
    }

    // MARK: Statics

    /// `Promise.resolve(value)`.
    @discardableResult
    public static func resolve(_ value: T) -> JSPromise<T> {
        if let promise = value as? JSPromise<T> { return promise }
        let (promise, resolvers) = pending()
        resolvers.resolve(value)
        return promise
    }

    /// `Promise.resolve(promise)` is the promise itself (PromiseResolve).
    public static func resolve(_ promise: JSPromise<T>) -> JSPromise<T> { promise }

    /// `Promise.reject(reason)`.
    @discardableResult
    public static func reject(_ reason: Any?) -> JSPromise<T> {
        let promise = JSPromise<T>()
        promise.settleRejected(reason)
        return promise
    }

    /// `Promise.all(promises)`.
    public static func all<S: Sequence>(_ promises: S) -> JSPromise<JSArray<T>> where S.Element == JSPromise<T> {
        jsPromiseAllCore(promises.map { $0 }) { values in JSArray(values.map { jsCast($0, to: T.self)! }) }
    }

    /// `Promise.allSettled(promises)`: `{ status: 'fulfilled', value }` / `{ status: 'rejected', reason }` objects.
    public static func allSettled<S: Sequence>(_ promises: S) -> JSPromise<JSArray<JSObject>> where S.Element == JSPromise<T> {
        jsPromiseAllSettledCore(promises.map { $0 })
    }

    /// `Promise.race(promises)`.
    public static func race<S: Sequence>(_ promises: S) -> JSPromise<T> where S.Element == JSPromise<T> {
        let (result, resolvers) = JSPromise<T>.pending()
        for promise in promises { promise.performThen({ resolvers.resolve($0) }, { resolvers.reject($0) }) }
        return result
    }

    /// `Promise.any(promises)`: rejects with an AggregateError when every promise rejects.
    public static func any<S: Sequence>(_ promises: S) -> JSPromise<T> where S.Element == JSPromise<T> {
        let (result, resolvers) = JSPromise<T>.pending()
        let list = Array(promises)
        var errors = [Any?](repeating: nil, count: list.count)
        var remaining = 1
        func rejectAll() {
            resolvers.reject(JSAggregateError(errors: JSArray(errors), "All promises were rejected"))
        }
        for (index, promise) in list.enumerated() {
            remaining += 1
            var called = false
            promise.performThen({ resolvers.resolve($0) }, { reason in
                guard !called else { return }
                called = true
                errors[index] = reason
                remaining -= 1
                if remaining == 0 { rejectAll() }
            })
        }
        remaining -= 1
        if remaining == 0 { rejectAll() }
        return result
    }

    // MARK: JSThenable

    public func jsSubscribe(_ onFulfilled: @escaping (Any?) -> Void, _ onRejected: @escaping (Any?) -> Void) {
        performThen({ onFulfilled(jsBox($0)) }, onRejected)
    }

    public var jsPromiseState: (state: JSPromiseState, value: Any?) {
        switch state {
        case .pending: return (.pending, nil)
        case .fulfilled: return (.fulfilled, jsBox(result!))
        case .rejected: return (.rejected, reason)
        }
    }

    public var description: String { jsInspect(self) }
}

extension JSPromise where T == Void {
    /// `Promise.resolve()`.
    public static func resolve() -> JSPromise<Void> { resolve(()) }
}

extension JSPromise where T == Any? {
    /// `Promise.all(values)` over a dynamic array of promises (of any type) and plain values.
    public static func all(_ values: JSArray<Any?>) -> JSPromise<JSArray<Any?>> {
        jsPromiseAllCore(values.elements.map(jsPromiseResolveAny)) { JSArray($0) }
    }

    /// `Promise.all(values)` over a dynamic array, its values read as the type the code gives them (`Promise<void[]>`).
    public static func all<R>(_ values: JSArray<Any?>, as read: @escaping ([Any?]) -> R) -> JSPromise<R> {
        jsPromiseAllCore(values.elements.map(jsPromiseResolveAny), read)
    }

    /// `Promise.allSettled(values)` over a dynamic array of promises and plain values.
    public static func allSettled(_ values: JSArray<Any?>) -> JSPromise<JSArray<JSObject>> {
        jsPromiseAllSettledCore(values.elements.map(jsPromiseResolveAny))
    }

    /// `Promise.race(values)` over a dynamic array of promises and plain values.
    public static func race(_ values: JSArray<Any?>) -> JSPromise<Any?> {
        let (result, resolvers) = JSPromise<Any?>.pending()
        for thenable in values.elements.map(jsPromiseResolveAny) {
            thenable.jsSubscribe({ resolvers.resolve($0) }, { resolvers.reject($0) })
        }
        return result
    }
}

/// PromiseResolve(%Promise%, value) for a dynamic value: a native promise of any type as is,
/// anything else wrapped in a new promise.
func jsPromiseResolveAny(_ value: Any?) -> JSThenable {
    if let thenable = jsFlat(value) as? JSThenable { return thenable }
    return JSPromise<Any?>.resolve(value)
}

/// PerformPromiseAll over native promises, the results boxed until `finish` types them.
func jsPromiseAllCore<R>(_ thenables: [JSThenable], _ finish: @escaping ([Any?]) -> R) -> JSPromise<R> {
    let (result, resolvers) = JSPromise<R>.pending()
    var values = [Any?](repeating: nil, count: thenables.count)
    var remaining = 1
    for (index, thenable) in thenables.enumerated() {
        remaining += 1
        var called = false
        thenable.jsSubscribe({ value in
            guard !called else { return }
            called = true
            values[index] = value
            remaining -= 1
            if remaining == 0 { resolvers.resolve(finish(values)) }
        }, { resolvers.reject($0) })
    }
    remaining -= 1
    if remaining == 0 { resolvers.resolve(finish(values)) }
    return result
}

func jsPromiseAllSettledCore(_ thenables: [JSThenable]) -> JSPromise<JSArray<JSObject>> {
    let (result, resolvers) = JSPromise<JSArray<JSObject>>.pending()
    var values = [JSObject?](repeating: nil, count: thenables.count)
    var remaining = 1
    func settle(_ index: Int, _ object: JSObject) {
        values[index] = object
        remaining -= 1
        if remaining == 0 { resolvers.resolve(JSArray(values.map { $0! })) }
    }
    for (index, thenable) in thenables.enumerated() {
        remaining += 1
        var called = false
        thenable.jsSubscribe({ value in
            guard !called else { return }
            called = true
            settle(index, ["status": "fulfilled", "value": value])
        }, { reason in
            guard !called else { return }
            called = true
            settle(index, ["status": "rejected", "reason": reason])
        })
    }
    remaining -= 1
    if remaining == 0 { resolvers.resolve(JSArray(values.map { $0! })) }
    return result
}

/// `Promise.all([a, b])` over promises of different types.
public func jsPromiseAll<A, B>(_ a: JSPromise<A>, _ b: JSPromise<B>) -> JSPromise<(A, B)> {
    jsPromiseAllCore([a, b]) { v in (jsCast(v[0], to: A.self)!, jsCast(v[1], to: B.self)!) }
}

/// `Promise.all([a, b, c])` over promises of different types.
public func jsPromiseAll<A, B, C>(_ a: JSPromise<A>, _ b: JSPromise<B>, _ c: JSPromise<C>) -> JSPromise<(A, B, C)> {
    jsPromiseAllCore([a, b, c]) { v in (jsCast(v[0], to: A.self)!, jsCast(v[1], to: B.self)!, jsCast(v[2], to: C.self)!) }
}

/// `Promise.all([a, b, c, d])` over promises of different types.
public func jsPromiseAll<A, B, C, D>(_ a: JSPromise<A>, _ b: JSPromise<B>, _ c: JSPromise<C>, _ d: JSPromise<D>) -> JSPromise<(A, B, C, D)> {
    jsPromiseAllCore([a, b, c, d]) { v in
        (jsCast(v[0], to: A.self)!, jsCast(v[1], to: B.self)!, jsCast(v[2], to: C.self)!, jsCast(v[3], to: D.self)!)
    }
}

// MARK: - await and async functions

/// `await promise` (Await, §27.7.5.3): PerformPromiseThen with no derived promise, so the
/// continuation runs exactly one tick after the promise settles. Marks the promise handled.
public func jsAwait<T>(_ promise: JSPromise<T>, _ onFulfilled: @escaping (T) -> Void, _ onRejected: @escaping (Any?) -> Void) {
    promise.performThen(onFulfilled, onRejected)
}

/// `await p?.request()`: an optional chain that may give no promise, which awaits as undefined does.
public func jsAwait<T>(_ promise: JSPromise<T>?, _ onFulfilled: @escaping (T?) -> Void, _ onRejected: @escaping (Any?) -> Void) {
    guard let promise else { return jsAwait(value: T?.none, onFulfilled, onRejected) }
    promise.performThen({ onFulfilled($0) }, onRejected)
}

/// `await value` for a value that is not statically a promise: one tick for a plain value; a
/// promise of any type held dynamically is awaited as itself.
public func jsAwait<T>(value: T, _ onFulfilled: @escaping (T) -> Void, _ onRejected: @escaping (Any?) -> Void) {
    if let thenable = jsFlat(value) as? JSThenable {
        thenable.jsSubscribe({ result in
            if let typed: T = jsCast(result) { onFulfilled(typed) } else { onRejected(jsTypeMismatch(result, T.self)) }
        }, onRejected)
        return
    }
    if jsFlat(value) is JSDynamic {
        JSPromise<T>.resolve(value).performThen(onFulfilled, onRejected)
        return
    }
    Microtasks.enqueue { onFulfilled(value) }
}

/// The promise capability of a running async function: the translator runs the body through
/// `body`, splits it at each `await` with `jsAwait`/`awaiting`, and ends it with a `return…`/`throwValue`.
public final class JSAsync<T> {
    public let promise: JSPromise<T>
    private let resolvers: JSResolvers<T>

    public init() {
        (promise, resolvers) = JSPromise<T>.pending()
    }

    /// `return value`.
    public func returnValue(_ value: T) { resolvers.resolve(value) }

    /// `return promise`: the async function's promise adopts it through a NewPromiseResolveThenableJob,
    /// two ticks later than `return await promise` would settle it.
    public func returnPromise(_ other: JSPromise<T>) { resolvers.resolve(promise: other) }

    /// An exception escaping the body.
    public func throwValue(_ error: Any?) { resolvers.reject(error) }

    /// Runs a segment of the body synchronously; a thrown error rejects the promise.
    public func body(_ segment: () throws -> Void) {
        do { try segment() } catch { throwValue(jsCaught(error)) }
    }

    /// `await promise` followed by the rest of the body; a rejection or a thrown error rejects the promise.
    public func awaiting<U>(_ awaited: JSPromise<U>, _ rest: @escaping (U) throws -> Void) {
        jsAwait(awaited, { value in self.body { try rest(value) } }, { self.throwValue($0) })
    }

    /// `await value` for a non-promise value followed by the rest of the body.
    public func awaiting<U>(value: U, _ rest: @escaping (U) throws -> Void) {
        jsAwait(value: value, { value in self.body { try rest(value) } }, { self.throwValue($0) })
    }
}

extension JSAsync where T == Void {
    /// `return` with no value, or the end of the body.
    public func returnValue() { returnValue(()) }
}

/// A promise a library made cancelable (core's `AnimationPromise`): `promise.cancel = fn`
/// sets what `cancel()` does, as script adds the method to the promise it returns.
public protocol JSCancelable: AnyObject {
    var canceler: (() -> Void)? { get set }
}

extension JSPromise: JSCancelable {}

/// A promise's members read by name (`p.then(f)` on a promise held untyped), as
/// `Promise.prototype` has them, and a cancelable one's `cancel`.
func jsPromiseMember(_ thenable: JSThenable, _ key: String) -> Any? {
    /// A reaction: the handler's result settles the derived promise, a thrown error rejects it.
    func react(_ handler: Any?, _ value: Any?, _ resolve: (Any?) -> Void, _ reject: (Any?) -> Void, passThrough: (Any?) -> Void) {
        guard !jsIsNullish(handler) else { return passThrough(value) }
        do { resolve(try jsCall(handler, value)) } catch { reject(jsCaught(error)) }
    }
    switch key {
    case "then", "catch":
        return { (args: [Any?]) -> Any? in
            let onFulfilled = key == "then" ? (args.first ?? nil) : nil
            let onRejected = key == "then" ? (args.count > 1 ? args[1] : nil) : (args.first ?? nil)
            let (promise, resolve, reject) = JSPromise<Any?>.withResolvers()
            thenable.jsSubscribe({ v in react(onFulfilled, v, resolve, reject, passThrough: resolve) },
                                 { r in react(onRejected, r, resolve, reject, passThrough: reject) })
            return promise
        } as JSFunction
    case "finally":
        return { (args: [Any?]) -> Any? in
            let onFinally = args.first ?? nil
            let (promise, resolve, reject) = JSPromise<Any?>.withResolvers()
            let settle = { (outcome: Any?, pass: @escaping (Any?) -> Void) in
                do { if !jsIsNullish(onFinally) { _ = try jsCall(onFinally) }; pass(outcome) } catch { reject(jsCaught(error)) }
            }
            thenable.jsSubscribe({ v in settle(v, resolve) }, { r in settle(r, reject) })
            return promise
        } as JSFunction
    case "cancel":
        guard let cancelable = thenable as? JSCancelable else { return nil }
        return { (_: [Any?]) -> Any? in cancelable.canceler?(); return nil } as JSFunction
    default:
        return nil
    }
}

/// An untyped value read as a promise of a type: the promise itself where it is one of
/// that type, else one adopting it as `Promise.resolve` adopts a thenable, a plain value
/// resolving it, its result read as the type.
public func jsPromiseOf<T>(_ value: Any?, _ element: @escaping (Any?) -> T) -> JSPromise<T> {
    if let same = jsFlat(value) as? JSPromise<T> { return same }
    let (promise, resolve, reject) = JSPromise<T>.withResolvers()
    jsPromiseResolveAny(value).jsSubscribe({ resolve(element($0)) }, reject)
    if let from = jsFlat(value) as? JSCancelable { promise.canceler = { from.canceler?() } }
    return promise
}
