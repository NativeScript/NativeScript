import Foundation

// The RxJS subset Angular services use, with RxJS 7's semantics: subscribers
// are called synchronously in subscription order, a BehaviorSubject replays
// its value to each new subscriber, and an operator subscribes to its source
// once per subscriber.

public final class RxSubscription {
    private var teardown: (() -> Void)?
    public private(set) var closed = false

    init(_ teardown: (() -> Void)? = nil) { self.teardown = teardown }

    public func unsubscribe() {
        guard !closed else { return }
        closed = true
        let finalize = teardown
        teardown = nil
        finalize?()
    }
}

public class RxObservable<T> {
    private let producer: (@escaping (T) -> Void) -> RxSubscription
    /// A source that settles once (an HTTP request): its value or its error, for `firstValueFrom`.
    var first: (() -> JSPromise<T>)?

    public init(_ producer: @escaping (@escaping (T) -> Void) -> RxSubscription) { self.producer = producer }

    /// Each value converted: how a typed `get<T>()` reads the parsed body.
    public func mapValues<R>(_ transform: @escaping (T) -> R) -> RxObservable<R> {
        let mapped = RxObservable<R> { next in self.subscribe { next(transform($0)) } }
        if let first { mapped.first = { first().then { transform($0) } } }
        return mapped
    }

    @discardableResult
    public func subscribe(_ next: @escaping (T) -> Void) -> RxSubscription { producer(next) }

    public func pipe<A>(_ a: RxOperatorFunction<T, A>) -> RxObservable<A> { a.apply(self) }

    public func pipe<A, B>(_ a: RxOperatorFunction<T, A>, _ b: RxOperatorFunction<A, B>) -> RxObservable<B> { b.apply(a.apply(self)) }

    public func pipe<A, B, C>(_ a: RxOperatorFunction<T, A>, _ b: RxOperatorFunction<A, B>, _ c: RxOperatorFunction<B, C>) -> RxObservable<C> { c.apply(b.apply(a.apply(self))) }
}

public struct RxOperatorFunction<T, R> {
    let apply: (RxObservable<T>) -> RxObservable<R>
}

/// `map(project)`: each value projected, with its index among the values this subscription saw.
public func map<T, R>(_ project: @escaping (T, Double) -> R) -> RxOperatorFunction<T, R> {
    RxOperatorFunction { source in
        RxObservable { next in
            var index = 0.0
            return source.subscribe { value in
                let i = index
                index += 1
                next(project(value, i))
            }
        }
    }
}

public func map<T, R>(_ project: @escaping (T) -> R) -> RxOperatorFunction<T, R> {
    map { value, _ in project(value) }
}

/// `take(count)`: the first `count` values of each subscription, then none.
public func take<T>(_ count: Double) -> RxOperatorFunction<T, T> {
    RxOperatorFunction { source in
        RxObservable { next in
            var taken = 0.0
            var subscription: RxSubscription?
            var done = false
            subscription = source.subscribe { value in
                guard taken < count else { return }
                taken += 1
                next(value)
                if taken >= count { done = true; subscription?.unsubscribe() }
            }
            if done { subscription?.unsubscribe() }
            return RxSubscription { subscription?.unsubscribe() }
        }
    }
}

/// `firstValueFrom(source)`: settles with the source's first value.
public func rxFirstValueFrom<T>(_ source: RxObservable<T>) -> JSPromise<T> {
    if let first = source.first { return first() }
    let (promise, resolvers) = JSPromise<T>.pending()
    var subscription: RxSubscription?
    var settled = false
    subscription = source.subscribe { value in
        guard !settled else { return }
        settled = true
        resolvers.resolve(value)
        subscription?.unsubscribe()
    }
    if settled { subscription?.unsubscribe() }
    return promise
}

public class RxSubject<T>: RxObservable<T> {
    private final class Observer {
        let next: (T) -> Void
        init(_ next: @escaping (T) -> Void) { self.next = next }
    }

    private var observers: [Observer] = []

    public init() { super.init { _ in RxSubscription() } }

    @discardableResult
    public override func subscribe(_ next: @escaping (T) -> Void) -> RxSubscription { add(next) }

    func add(_ next: @escaping (T) -> Void) -> RxSubscription {
        let observer = Observer(next)
        observers.append(observer)
        return RxSubscription { [weak self] in self?.observers.removeAll { $0 === observer } }
    }

    /// Calls the observers subscribed when `next` is called, as RxJS copies its observer list.
    public func next(_ value: T) {
        for observer in observers { observer.next(value) }
    }

    public func asObservable() -> RxObservable<T> { RxObservable { next in self.subscribe(next) } }
}

extension RxSubject where T == Void {
    public func next() { next(()) }
}

public final class RxBehaviorSubject<T>: RxSubject<T> {
    private var current: T

    public init(_ value: T) {
        current = value
        super.init()
    }

    public var value: T { current }

    public func getValue() -> T { current }

    override func add(_ next: @escaping (T) -> Void) -> RxSubscription {
        let subscription = super.add(next)
        if !subscription.closed { next(current) }
        return subscription
    }

    public override func next(_ value: T) {
        current = value
        super.next(value)
    }
}

/// Angular's `async` pipe at one binding site: subscribes to the observable
/// it is given (again when given another), and returns its latest value.
public final class AsyncPipe {
    private var source: AnyObject?
    private var subscription: RxSubscription?
    private var latest: Any?

    public init() {
        Owner.current?.onCleanup { [weak self] in self?.dispose() }
    }

    public func transform<T>(_ observable: RxObservable<T>?) -> T? {
        if observable !== source {
            dispose()
            source = observable
            subscription = observable?.subscribe { [weak self] value in self?.latest = value }
        }
        return latest as? T
    }

    private func dispose() {
        subscription?.unsubscribe()
        subscription = nil
        source = nil
        latest = nil
    }
}

/// `new ReplaySubject(bufferSize)`: replays the last `bufferSize` values to each new subscriber.
public final class RxReplaySubject<T>: RxSubject<T> {
    private var buffer: [T] = []
    private let size: Int

    public init(_ bufferSize: Double = .infinity) {
        size = bufferSize.isFinite ? max(1, Int(bufferSize)) : Int.max
        super.init()
    }

    override func add(_ next: @escaping (T) -> Void) -> RxSubscription {
        let subscription = super.add(next)
        for value in buffer where !subscription.closed { next(value) }
        return subscription
    }

    public override func next(_ value: T) {
        buffer.append(value)
        if buffer.count > size { buffer.removeFirst(buffer.count - size) }
        super.next(value)
    }
}
