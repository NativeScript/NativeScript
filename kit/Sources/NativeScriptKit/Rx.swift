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

    public init(_ producer: @escaping (@escaping (T) -> Void) -> RxSubscription) { self.producer = producer }

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
