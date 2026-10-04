import Foundation

// JavaScript's iteration protocols (ECMA-262 §27.1): iterators that `for…of`,
// spread and destructuring drive by `next`, `return` and `throw`; generators,
// whose bodies the translator lowers to continuations that suspend at each
// `yield` (async.ts); and their async counterparts, which settle every step
// through promises in the order the specification gives.

/// One step of an iterator: IteratorValue and IteratorComplete of its result.
public struct JSStep {
    public let value: Any?
    public let done: Bool
    public init(_ value: Any?, _ done: Bool) { self.value = value; self.done = done }
}

/// `{ value, done }`, the result object script sees.
func jsIterResultObject(_ step: JSStep) -> JSObject { JSObject([("value", step.value), ("done", step.done)]) }

/// A result object script returned from `next()`: TypeError unless it is an object.
public func jsStepOf(_ result: Any?) throws -> JSStep {
    guard let object = jsFlat(result), !(object is JSNull), jsIsObject(object) else {
        throw JSException(JSTypeError("Iterator result \(jsToString(result)) is not an object"))
    }
    return JSStep(try jsGet(object, "value"), jsIsTruthy(try jsGet(object, "done")))
}

/// What iteration needs from any iterator, whatever its element type.
public protocol JSIteratorProtocol: AnyObject {
    func jsNext(_ value: Any?) throws -> JSStep
    func jsReturn(_ value: Any?) throws -> JSStep
    func jsThrow(_ error: Any?) throws -> JSStep
    var jsHasReturn: Bool { get }
    var jsHasThrow: Bool { get }
}

/// An object `for…of` can iterate however its type is held (`[Symbol.iterator]()`).
public protocol JSIterableValue: AnyObject {
    func jsAnyIterator() throws -> JSIteratorProtocol
}

/// `Iterable<T>`: something that makes a fresh iterator each time it is iterated.
open class JSIterable<Element>: JSIterableValue {
    private let make: (() throws -> JSIterator<Element>)?

    public init(_ make: @escaping () throws -> JSIterator<Element>) { self.make = make }
    init() { make = nil }

    /// `iterable[Symbol.iterator]()`.
    open func jsIterator() throws -> JSIterator<Element> { try make!() }
    public func jsAnyIterator() throws -> JSIteratorProtocol { try jsIterator() }
}

/// A JavaScript iterator object: a built-in one (`array.keys()`, `map.entries()`) steps a
/// closure; generators and script iterators subclass it. Single-pass: iterating it again
/// continues where it stopped.
open class JSIterator<Element>: JSIterable<Element>, JSIteratorProtocol, Sequence, IteratorProtocol, JSDynamic, JSToStringTag {
    private let step: (() -> Element?)?
    /// Done, or closed by a loop that left early.
    public private(set) var finished = false
    private var current: Any?
    let tag: String

    public init(_ step: @escaping () -> Element?) {
        self.step = step
        tag = "Iterator"
        super.init()
    }

    init(tag: String) {
        step = nil
        self.tag = tag
        super.init()
    }

    open func jsNext(_ value: Any?) throws -> JSStep {
        if !finished, let step, let v = step() { return JSStep(v, false) }
        finished = true
        return JSStep(nil, true)
    }

    open func jsReturn(_ value: Any?) throws -> JSStep {
        finished = true
        return JSStep(value, true)
    }

    open func jsThrow(_ error: Any?) throws -> JSStep {
        finished = true
        throw JSException(error)
    }

    /// A built-in iterator has no `return`, so a loop leaving early has nothing to close.
    open var jsHasReturn: Bool { false }
    open var jsHasThrow: Bool { false }

    open override func jsIterator() throws -> JSIterator<Element> { self }

    // MARK: for…of

    /// The next value into `jsCurrent`; false once done. A `next` that throws ends the loop.
    public func jsAdvance() throws -> Bool {
        guard !finished || step == nil else { return false }
        do {
            let s = try jsNext(nil)
            if s.done { finished = true; return false }
            current = s.value
            return true
        } catch {
            finished = true
            throw error
        }
    }

    public var jsCurrent: Element { jsCast(current, to: Element.self) ?? (current as! Element) }

    /// IteratorClose for a loop leaving early (`break`, `return`, a throw): `return()` if it has one.
    public func jsClose() {
        guard !finished else { return }
        finished = true
        if jsHasReturn { _ = try? jsReturn(nil) }
    }

    /// The remaining values, for a spread or `Array.from`.
    public func jsCollect() throws -> [Element] {
        var out: [Element] = []
        while try jsAdvance() { out.append(jsCurrent) }
        return out
    }

    /// The first `count` values, then closed, for an array pattern.
    public func jsTake(_ count: Int) throws -> JSArray<Element?> {
        var out: [Element?] = []
        while out.count < count, try jsAdvance() { out.append(jsCurrent) }
        if out.count == count { jsClose() } else { out += Array(repeating: nil, count: count - out.count) }
        return JSArray(out)
    }

    // MARK: Swift iteration, for code that cannot fail

    public func next() -> Element? {
        guard (try? jsAdvance()) == true else { return nil }
        return jsCurrent
    }

    public func makeIterator() -> JSIterator<Element> { self }

    // MARK: Script's view

    /// `iterator.next(value)`.
    public func jsNextResult(_ value: Any? = nil) throws -> Any? { jsIterResultObject(try jsNext(value)) }
    /// `iterator.return(value)`.
    public func jsReturnResult(_ value: Any? = nil) throws -> Any? { jsIterResultObject(try jsReturn(value)) }
    /// `iterator.throw(error)`.
    public func jsThrowResult(_ error: Any?) throws -> Any? { jsIterResultObject(try jsThrow(error)) }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Object" }
    public var jsToStringTag: String { tag }
}

/// An iterator script wrote: an object literal's `next` (and `return`, `throw`), or a class with `next()`.
public final class JSScriptIterator<Element>: JSIterator<Element> {
    private let nextResult: (Any?) throws -> Any?
    private let returnResult: ((Any?) throws -> Any?)?
    private let throwResult: ((Any?) throws -> Any?)?

    public init(next: @escaping (Any?) throws -> Any?, return returnResult: ((Any?) throws -> Any?)? = nil, throw throwResult: ((Any?) throws -> Any?)? = nil) {
        nextResult = next
        self.returnResult = returnResult
        self.throwResult = throwResult
        super.init(tag: "Object")
    }

    public override func jsNext(_ value: Any?) throws -> JSStep { try jsStepOf(try nextResult(value)) }
    public override func jsReturn(_ value: Any?) throws -> JSStep {
        guard let returnResult else { return JSStep(value, true) }
        return try jsStepOf(try returnResult(value))
    }
    public override func jsThrow(_ error: Any?) throws -> JSStep {
        guard let throwResult else { throw JSException(error) }
        return try jsStepOf(try throwResult(error))
    }
    public override var jsHasReturn: Bool { returnResult != nil }
    public override var jsHasThrow: Bool { throwResult != nil }
}

/// An iterator held as another value's type: `[Symbol.iterator]()` returned a class with `next`.
public final class JSIteratorAdapter<Element>: JSIterator<Element> {
    private let inner: JSIteratorProtocol

    public init(_ inner: JSIteratorProtocol) {
        self.inner = inner
        super.init(tag: "Object")
    }

    public override func jsNext(_ value: Any?) throws -> JSStep { try inner.jsNext(value) }
    public override func jsReturn(_ value: Any?) throws -> JSStep { try inner.jsReturn(value) }
    public override func jsThrow(_ error: Any?) throws -> JSStep { try inner.jsThrow(error) }
    public override var jsHasReturn: Bool { inner.jsHasReturn }
    public override var jsHasThrow: Bool { inner.jsHasThrow }
}

// MARK: - Getting an iterator

public func jsIterator<T>(_ array: JSArray<T>) -> JSIterator<T> {
    let it = array.values()
    return it
}
public func jsIterator<T>(_ set: JSSet<T>) -> JSIterator<T> { set.values() }
public func jsIterator<K, V>(_ map: JSMap<K, V>) -> JSIterator<(K, V)> { map.entries() }
public func jsIterator(_ string: String) -> JSIterator<String> {
    var points = jsCodePoints(string).makeIterator()
    return JSIterator { points.next() }
}
public func jsIterator<T>(_ iterable: JSIterable<T>) throws -> JSIterator<T> { try iterable.jsIterator() }

/// A value held as `Iterable<T>`: each iteration starts over.
public func jsIterable<T>(_ array: JSArray<T>) -> JSIterable<T> { JSIterable { jsIterator(array) } }
public func jsIterable<T>(_ set: JSSet<T>) -> JSIterable<T> { JSIterable { jsIterator(set) } }
public func jsIterable<K, V>(_ map: JSMap<K, V>) -> JSIterable<(K, V)> { JSIterable { jsIterator(map) } }
public func jsIterable(_ string: String) -> JSIterable<String> { JSIterable { jsIterator(string) } }
public func jsIterable<T>(_ value: JSIterableValue) -> JSIterable<T> { JSIterable { JSIteratorAdapter<T>(try value.jsAnyIterator()) } }
public func jsAsyncIterable<T>(_ value: JSAsyncIterableValue) -> JSAsyncIterable<T> { JSAsyncIterable { JSAsyncIteratorAdapter<T>(try value.jsAnyAsyncIterator()) } }

/// GetIterator for an untyped value.
public func jsIteratorOf(_ value: Any?) throws -> JSIterator<Any?> {
    switch jsFlat(value) {
    case let iterable as JSIterableValue: return JSIteratorAdapter(try iterable.jsAnyIterator())
    case let array as JSArrayProtocol:
        let elements = array
        var i = 0
        return JSIterator { i < elements.jsLength ? { defer { i += 1 }; return Optional(elements.jsElement(at: i)) }() : nil }
    case let s as String: return JSIteratorAdapter(jsIterator(s))
    case let set as JSSetProtocol:
        var values = set.jsAnyValues.makeIterator()
        return JSIterator<Any?> { values.next() }
    case let map as JSMapProtocol:
        var entries = map.jsAnyEntries.makeIterator()
        return JSIterator<Any?> { entries.next().map { JSArray<Any?>([$0.0, $0.1]) as Any? } }
    default:
        throw JSException(JSTypeError("\(jsToString(value)) is not iterable"))
    }
}

// MARK: - Generators

/// Where a suspended body resumes: the rest of its code after a `yield`, and the
/// handlers a `throw()` or `return()` takes there (the enclosing catch and finally blocks).
struct JSResumption {
    let next: (Any?) -> Void
    let onThrow: (Any?) -> Void
    let onReturn: (Any?) -> Void
}

/// A resumption request: `next(v)`, `throw(e)` or `return(v)`.
enum JSCompletion {
    case normal(Any?)
    case `throw`(Any?)
    case `return`(Any?)
}

/// The body side of a generator: the lowered body calls it at each `yield` and at its end.
public final class JSGeneratorContext {
    enum Outcome { case yielded(Any?), returned(Any?), threw(Any?) }
    var outcome: Outcome?
    var resumption: JSResumption?
    var delegated: (inner: JSIteratorProtocol, resumption: JSResumption)?

    init() {}

    /// `yield value`, the code after it continuing in `next`.
    public func yield(_ value: Any?, _ next: @escaping (Any?) -> Void, _ onThrow: @escaping (Any?) -> Void, _ onReturn: @escaping (Any?) -> Void) {
        resumption = JSResumption(next: next, onThrow: onThrow, onReturn: onReturn)
        outcome = .yielded(value)
    }

    /// `yield* iterable`: its values pass through until it is done; `next` gets its return value.
    public func delegate(_ inner: JSIteratorProtocol, _ next: @escaping (Any?) -> Void, _ onThrow: @escaping (Any?) -> Void, _ onReturn: @escaping (Any?) -> Void) {
        delegated = (inner, JSResumption(next: next, onThrow: onThrow, onReturn: onReturn))
        stepDelegate(.normal(nil))
    }

    func stepDelegate(_ received: JSCompletion) {
        guard let d = delegated else { return }
        let inner = d.inner, r = d.resumption
        do {
            let s: JSStep
            switch received {
            case .normal(let v): s = try inner.jsNext(v)
            case .throw(let e):
                guard inner.jsHasThrow else {
                    delegated = nil
                    if inner.jsHasReturn { _ = try? inner.jsReturn(nil) }
                    return r.onThrow(JSTypeError("The iterator does not provide a 'throw' method"))
                }
                s = try inner.jsThrow(e)
            case .return(let v):
                guard inner.jsHasReturn else { delegated = nil; return r.onReturn(v) }
                s = try inner.jsReturn(v)
                if s.done { delegated = nil; return r.onReturn(s.value) }
            }
            if s.done { delegated = nil; return r.next(s.value) }
            outcome = .yielded(s.value)
        } catch {
            delegated = nil
            r.onThrow(jsCaught(error))
        }
    }

    /// `return value`, or the end of the body.
    public func returnValue(_ value: Any? = nil) { outcome = .returned(value) }

    /// An exception escaping the body.
    public func throwValue(_ error: Any?) { outcome = .threw(error) }

    func reset() { resumption = nil; delegated = nil }
}

/// A generator object (`function*`): the body runs on the first `next()` up to a `yield`,
/// and each later call resumes it there.
public final class JSGenerator<Element>: JSIterator<Element> {
    private enum State { case start, suspended, running, completed }
    private var state = State.start
    private var body: ((JSGeneratorContext) throws -> Void)?
    private let context = JSGeneratorContext()

    public init(_ body: @escaping (JSGeneratorContext) throws -> Void) {
        self.body = body
        super.init(tag: "Generator")
    }

    deinit { context.reset() }

    private func run(_ resume: () -> Void) throws -> JSStep {
        state = .running
        context.outcome = nil
        resume()
        switch context.outcome {
        case .yielded(let v)?:
            state = .suspended
            return JSStep(v, false)
        case .returned(let v)?:
            complete()
            return JSStep(v, true)
        case .threw(let e)?:
            complete()
            throw JSException(e)
        case nil:
            complete()
            return JSStep(nil, true)
        }
    }

    private func complete() {
        state = .completed
        body = nil
        context.reset()
    }

    private func resume(_ c: JSCompletion) throws -> JSStep {
        switch state {
        case .running: throw JSException(JSTypeError("Generator is already running"))
        case .completed:
            if case .throw(let e) = c { throw JSException(e) }
            if case .return(let v) = c { return JSStep(v, true) }
            return JSStep(nil, true)
        case .start:
            switch c {
            case .normal:
                let body = self.body!
                return try run { [context] in
                    do { try body(context) } catch { context.throwValue(jsCaught(error)) }
                }
            case .throw(let e): complete(); throw JSException(e)
            case .return(let v): complete(); return JSStep(v, true)
            }
        case .suspended:
            if context.delegated != nil { return try run { context.stepDelegate(c) } }
            guard let r = context.resumption else { return JSStep(nil, true) }
            context.resumption = nil
            return try run {
                switch c {
                case .normal(let v): r.next(v)
                case .throw(let e): r.onThrow(e)
                case .return(let v): r.onReturn(v)
                }
            }
        }
    }

    public override func jsNext(_ value: Any?) throws -> JSStep { try resume(.normal(value)) }
    public override func jsReturn(_ value: Any?) throws -> JSStep { try resume(.return(value)) }
    public override func jsThrow(_ error: Any?) throws -> JSStep { try resume(.throw(error)) }
    public override var jsHasReturn: Bool { true }
    public override var jsHasThrow: Bool { true }
}

// MARK: - Async iteration

/// What `for await` needs from any async iterator.
public protocol JSAsyncIteratorProtocol: AnyObject {
    /// `next(value)`: a promise of the result object.
    func jsNextPromise(_ value: Any?) -> JSPromise<Any?>
    func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>?
    func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>?
}

/// An object `for await` can iterate (`[Symbol.asyncIterator]()`).
public protocol JSAsyncIterableValue: AnyObject {
    func jsAnyAsyncIterator() throws -> JSAsyncIteratorProtocol
}

/// `AsyncIterable<T>`.
open class JSAsyncIterable<Element>: JSAsyncIterableValue {
    private let make: (() throws -> JSAsyncIterator<Element>)?

    public init(_ make: @escaping () throws -> JSAsyncIterator<Element>) { self.make = make }
    init() { make = nil }

    open func jsAsyncIterator() throws -> JSAsyncIterator<Element> { try make!() }
    public func jsAnyAsyncIterator() throws -> JSAsyncIteratorProtocol { try jsAsyncIterator() }
}

/// An async iterator: an async generator, a script's, or a sync iterator `for await` adapts.
open class JSAsyncIterator<Element>: JSAsyncIterable<Element>, JSAsyncIteratorProtocol, JSDynamic, JSToStringTag {
    let tag: String

    init(tag: String) {
        self.tag = tag
        super.init()
    }

    open func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { JSPromise<Any?>.resolve(jsIterResultObject(JSStep(nil, true))) }
    open func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? { nil }
    open func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? { nil }
    open override func jsAsyncIterator() throws -> JSAsyncIterator<Element> { self }

    /// `iterator.next(value)`, `return(value)`, `throw(error)` as script calls them.
    public func next(_ value: Any? = nil) -> JSPromise<Any?> { jsNextPromise(value) }
    public func `return`(_ value: Any? = nil) -> JSPromise<Any?> { jsReturnPromise(value) ?? JSPromise<Any?>.resolve(jsIterResultObject(JSStep(value, true))) }
    public func `throw`(_ error: Any?) -> JSPromise<Any?> { jsThrowPromise(error) ?? JSPromise<Any?>.reject(error) }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Object" }
    public var jsToStringTag: String { tag }
}

/// An async iterator script wrote: `next` (and `return`, `throw`) returning promises of result objects.
public final class JSScriptAsyncIterator<Element>: JSAsyncIterator<Element> {
    private let nextResult: (Any?) throws -> JSPromise<Any?>
    private let returnResult: ((Any?) throws -> JSPromise<Any?>)?
    private let throwResult: ((Any?) throws -> JSPromise<Any?>)?

    public init(next: @escaping (Any?) throws -> JSPromise<Any?>, return returnResult: ((Any?) throws -> JSPromise<Any?>)? = nil, throw throwResult: ((Any?) throws -> JSPromise<Any?>)? = nil) {
        nextResult = next
        self.returnResult = returnResult
        self.throwResult = throwResult
        super.init(tag: "Object")
    }

    private func call(_ f: (Any?) throws -> JSPromise<Any?>, _ v: Any?) -> JSPromise<Any?> {
        do { return try f(v) } catch { return JSPromise<Any?>.reject(jsCaught(error)) }
    }

    public override func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { call(nextResult, value) }
    public override func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? { returnResult.map { call($0, value) } }
    public override func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? { throwResult.map { call($0, error) } }
}

/// An async iterator held as another value's type (a class with an async `next`).
public final class JSAsyncIteratorAdapter<Element>: JSAsyncIterator<Element> {
    private let inner: JSAsyncIteratorProtocol

    public init(_ inner: JSAsyncIteratorProtocol) {
        self.inner = inner
        super.init(tag: "Object")
    }

    public override func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { inner.jsNextPromise(value) }
    public override func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? { inner.jsReturnPromise(value) }
    public override func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? { inner.jsThrowPromise(error) }
}

/// CreateAsyncFromSyncIterator (§27.1.6): `for await` over a sync iterable awaits each value.
public final class JSAsyncFromSyncIterator<Element>: JSAsyncIterator<Element> {
    private let sync: JSIteratorProtocol

    public init(_ sync: JSIteratorProtocol) {
        self.sync = sync
        super.init(tag: "Object")
    }

    /// AsyncFromSyncIteratorContinuation.
    private func continuation(_ result: () throws -> JSStep, closeOnRejection: Bool) -> JSPromise<Any?> {
        let (promise, resolvers) = JSPromise<Any?>.pending()
        let step: JSStep
        do { step = try result() } catch { resolvers.reject(jsCaught(error)); return promise }
        let wrapper = jsPromiseResolveAny(step.value)
        let done = step.done
        wrapper.jsSubscribe({ v in resolvers.resolve(jsIterResultObject(JSStep(v, done))) }, { [sync] reason in
            if !done && closeOnRejection && sync.jsHasReturn { _ = try? sync.jsReturn(nil) }
            resolvers.reject(reason)
        })
        return promise
    }

    public override func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { continuation({ try sync.jsNext(value) }, closeOnRejection: true) }

    public override func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? {
        guard sync.jsHasReturn else { return JSPromise<Any?>.resolve(jsIterResultObject(JSStep(value, true))) }
        return continuation({ try sync.jsReturn(value) }, closeOnRejection: false)
    }

    public override func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? {
        guard sync.jsHasThrow else {
            if sync.jsHasReturn { _ = try? sync.jsReturn(nil) }
            return JSPromise<Any?>.reject(JSTypeError("The iterator does not provide a 'throw' method"))
        }
        return continuation({ try sync.jsThrow(error) }, closeOnRejection: true)
    }
}

/// GetIterator(value, async) for an untyped value.
public func jsAsyncIteratorOf(_ value: Any?) throws -> JSAsyncIterator<Any?> {
    if let iterable = jsFlat(value) as? JSAsyncIterableValue { return JSAsyncIteratorAdapter(try iterable.jsAnyAsyncIterator()) }
    return JSAsyncFromSyncIterator(try jsIteratorOf(value))
}

/// AsyncIteratorClose for `for await` leaving early: awaits `return()` when the iterator has one.
public func jsAsyncClose(_ iterator: JSAsyncIteratorProtocol, _ then: @escaping () -> Void, _ onError: @escaping (Any?) -> Void) {
    guard let promise = iterator.jsReturnPromise(nil) else { return then() }
    jsAwait(promise, { result in
        guard let object = jsFlat(result), jsIsObject(object), !(object is JSNull) else { return onError(JSTypeError("Iterator result \(jsToString(result)) is not an object")) }
        then()
    }, onError)
}

/// `for await` leaving by a throw: the iterator is closed, and the throw wins over anything closing does.
public func jsAsyncCloseThrowing(_ iterator: JSAsyncIteratorProtocol, _ error: Any?, _ onError: @escaping (Any?) -> Void) {
    guard let promise = iterator.jsReturnPromise(nil) else { return onError(error) }
    jsAwait(promise, { _ in onError(error) }, { _ in onError(error) })
}

/// The body side of an async generator.
public final class JSAsyncGeneratorContext {
    weak var generator: JSAsyncGeneratorCore?
    /// The generator while its body runs or awaits: pending jobs keep it alive, as in JavaScript.
    var running: JSAsyncGeneratorCore?
    init() {}

    /// `yield value`: awaited first, then handed to the request at the head of the queue.
    public func yield(_ value: Any?, _ next: @escaping (Any?) -> Void, _ onThrow: @escaping (Any?) -> Void, _ onReturn: @escaping (Any?) -> Void) {
        let r = JSResumption(next: next, onThrow: onThrow, onReturn: onReturn)
        jsAwait(value: value, { [weak self] v in self?.generator?.yielded(v, r) }, onThrow)
    }

    /// `yield* iterable` in an async generator.
    public func delegate(_ inner: JSAsyncIteratorProtocol, _ next: @escaping (Any?) -> Void, _ onThrow: @escaping (Any?) -> Void, _ onReturn: @escaping (Any?) -> Void) {
        generator?.delegate(inner, JSResumption(next: next, onThrow: onThrow, onReturn: onReturn), .normal(nil))
    }

    /// `return value`: awaited, then the generator completes with it.
    public func returnValue(_ value: Any?) {
        jsAwait(value: value, { [weak self] v in self?.generator?.finished(.normal(v)) }, { [weak self] e in self?.generator?.finished(.throw(e)) })
    }

    /// `return` without a value, or the end of the body.
    public func returnValue() { generator?.finished(.normal(nil)) }

    /// An exception escaping the body.
    public func throwValue(_ error: Any?) { generator?.finished(.throw(error)) }
}

/// The queue and states of an async generator (§27.6.3).
class JSAsyncGeneratorCore {
    enum State { case suspendedStart, suspendedYield, executing, awaitingReturn, completed }
    private struct Request { let completion: JSCompletion; let resolvers: JSResolvers<Any?> }

    var state = State.suspendedStart
    private var queue: [Request] = []
    private var body: ((JSAsyncGeneratorContext) throws -> Void)?
    private let context = JSAsyncGeneratorContext()
    private var resumption: JSResumption?

    init(_ body: @escaping (JSAsyncGeneratorContext) throws -> Void) {
        self.body = body
        context.generator = self
    }

    /// AsyncGeneratorEnqueue, then a resume when the generator is suspended.
    func request(_ completion: JSCompletion) -> JSPromise<Any?> {
        let (promise, resolvers) = JSPromise<Any?>.pending()
        switch (completion, state) {
        case (.normal, .completed):
            resolvers.resolve(jsIterResultObject(JSStep(nil, true)))
            return promise
        case (.throw(let e), .suspendedStart), (.throw(let e), .completed):
            state = .completed
            body = nil
            resolvers.reject(e)
            return promise
        default: break
        }
        queue.append(Request(completion: completion, resolvers: resolvers))
        switch (completion, state) {
        case (.return, .suspendedStart), (.return, .completed):
            state = .awaitingReturn
            awaitReturn()
        case (_, .suspendedStart), (_, .suspendedYield):
            resume(completion)
        default: break
        }
        return promise
    }

    /// AsyncGeneratorResume.
    private func resume(_ completion: JSCompletion) {
        let wasStart = state == .suspendedStart
        state = .executing
        context.running = self
        if wasStart {
            let body = self.body!
            self.body = nil
            do { try body(context) } catch { finished(.throw(jsCaught(error))) }
            return
        }
        if delegation != nil { return stepDelegate(completion) }
        guard let r = resumption else { return }
        resumption = nil
        unwrapResumption(completion, r)
    }

    /// AsyncGeneratorUnwrapYieldResumption: a `return()` awaits its value before it unwinds the body.
    private func unwrapResumption(_ completion: JSCompletion, _ r: JSResumption) {
        switch completion {
        case .normal(let v): r.next(v)
        case .throw(let e): r.onThrow(e)
        case .return(let v): jsAwait(value: v, { r.onReturn($0) }, { r.onThrow($0) })
        }
    }

    /// AsyncGeneratorCompleteStep.
    private func completeStep(_ completion: JSCompletion, done: Bool) {
        guard !queue.isEmpty else { return }
        let next = queue.removeFirst()
        switch completion {
        case .throw(let e): next.resolvers.reject(e)
        case .normal(let v), .return(let v): next.resolvers.resolve(jsIterResultObject(JSStep(v, done)))
        }
    }

    /// AsyncGeneratorYield, after the value was awaited.
    func yielded(_ value: Any?, _ r: JSResumption) {
        completeStep(.normal(value), done: false)
        if let head = queue.first { return unwrapResumption(head.completion, r) }
        state = .suspendedYield
        resumption = r
        context.running = nil
    }

    /// The body completed (a return's value already awaited) or threw.
    func finished(_ completion: JSCompletion) {
        state = .completed
        resumption = nil
        delegation = nil
        completeStep(completion, done: true)
        drainQueue()
        if state == .completed { context.running = nil }
    }

    /// AsyncGeneratorAwaitReturn.
    private func awaitReturn() {
        guard let head = queue.first, case .return(let v) = head.completion else { return }
        context.running = self
        jsAwait(value: v, { [self] value in
            state = .completed
            completeStep(.normal(value), done: true)
            drainQueue()
            if state == .completed { context.running = nil }
        }, { [self] reason in
            state = .completed
            completeStep(.throw(reason), done: true)
            drainQueue()
            if state == .completed { context.running = nil }
        })
    }

    /// AsyncGeneratorDrainQueue.
    private func drainQueue() {
        while let head = queue.first {
            if case .return = head.completion {
                state = .awaitingReturn
                awaitReturn()
                return
            }
            if case .throw = head.completion { completeStep(head.completion, done: true) } else { completeStep(.normal(nil), done: true) }
        }
    }

    // MARK: yield*

    private var delegation: (inner: JSAsyncIteratorProtocol, resumption: JSResumption)?

    func delegate(_ inner: JSAsyncIteratorProtocol, _ r: JSResumption, _ received: JSCompletion) {
        delegation = (inner, r)
        stepDelegate(received)
    }

    private func stepDelegate(_ received: JSCompletion) {
        guard let d = delegation else { return }
        let inner = d.inner, r = d.resumption
        let awaitedStep = { (promise: JSPromise<Any?>, onDone: @escaping (Any?) -> Void) in
            jsAwait(promise, { [self] result in
                let step: JSStep
                do { step = try jsStepOf(result) } catch { delegation = nil; return r.onThrow(jsCaught(error)) }
                if step.done { delegation = nil; return onDone(step.value) }
                completeStep(.normal(step.value), done: false)
                if let head = queue.first { return unwrapDelegate(head.completion) }
                state = .suspendedYield
                context.running = nil
            }, { [self] reason in delegation = nil; r.onThrow(reason) })
        }
        switch received {
        case .normal(let v): awaitedStep(inner.jsNextPromise(v), r.next)
        case .throw(let e):
            guard let promise = inner.jsThrowPromise(e) else {
                delegation = nil
                jsAsyncClose(inner, { r.onThrow(JSTypeError("The iterator does not provide a 'throw' method")) }, r.onThrow)
                return
            }
            awaitedStep(promise, r.next)
        case .return(let v):
            guard let promise = inner.jsReturnPromise(v) else { delegation = nil; return r.onReturn(v) }
            awaitedStep(promise, r.onReturn)
        }
    }

    /// A request taken while delegating: a `return()` awaits its value first, as at a `yield`.
    private func unwrapDelegate(_ completion: JSCompletion) {
        if case .return(let v) = completion {
            jsAwait(value: v, { [self] in stepDelegate(.return($0)) }, { [self] in stepDelegate(.throw($0)) })
        } else {
            stepDelegate(completion)
        }
    }
}

/// An async generator object (`async function*`).
public final class JSAsyncGenerator<Element>: JSAsyncIterator<Element> {
    private let core: JSAsyncGeneratorCore

    public init(_ body: @escaping (JSAsyncGeneratorContext) throws -> Void) {
        core = JSAsyncGeneratorCore(body)
        super.init(tag: "AsyncGenerator")
    }

    public override func jsNextPromise(_ value: Any?) -> JSPromise<Any?> { core.request(.normal(value)) }
    public override func jsReturnPromise(_ value: Any?) -> JSPromise<Any?>? { core.request(.return(value)) }
    public override func jsThrowPromise(_ error: Any?) -> JSPromise<Any?>? { core.request(.throw(error)) }
}
