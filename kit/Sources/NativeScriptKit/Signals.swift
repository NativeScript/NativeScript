import Foundation

// Fine-grained reactivity, the model Angular signals, Vue refs, Solid
// signals and Svelte runes share: a read inside an effect subscribes it, a
// write re-runs exactly the effects that read the value. Compiled templates
// bind each native property through one effect, so nothing is diffed.
// Main thread only, synchronous, like the frameworks it stands in for.

/// A scope that owns effects and cleanups: a component instance, a branch of
/// an `if`, a row of a `for`. Disposing it disposes everything created in it.
public final class Owner {
    fileprivate var effects: [Effect] = []
    private var children: [Owner] = []
    private var cleanups: [() -> Void] = []
    private weak var parent: Owner?
    private var disposed = false

    public static fileprivate(set) var current: Owner?

    public init(parent: Owner? = Owner.current) {
        self.parent = parent
        parent?.children.append(self)
    }

    /// Runs `body` with this owner current: effects it creates belong here.
    @discardableResult
    public func run<T>(_ body: () -> T) -> T {
        let previous = Owner.current
        Owner.current = self
        defer { Owner.current = previous }
        return body()
    }

    public func onCleanup(_ cleanup: @escaping () -> Void) { cleanups.append(cleanup) }

    public func dispose() {
        guard !disposed else { return }
        disposed = true
        for child in children { child.dispose() }
        for effect in effects { effect.dispose() }
        for cleanup in cleanups.reversed() { cleanup() }
        children = []; effects = []; cleanups = []
    }
}

/// Something a signal notifies.
protocol Subscriber: AnyObject {
    func invalidate()
}

/// A source an effect read; it forgets the effect when the effect re-runs.
protocol Source: AnyObject {
    func unsubscribe(_ subscriber: Subscriber)
}

private var currentEffect: Effect?
private var batchDepth = 0
private var queue: [Effect] = []

/// Groups writes so each affected effect runs once, after the last write.
public func batch(_ body: () -> Void) {
    batchDepth += 1
    body()
    batchDepth -= 1
    if batchDepth == 0 { flush() }
}

private func flush() {
    while !queue.isEmpty {
        let pending = queue.sorted { EffectOrder.precedes($0.key, $1.key) }
        queue = []
        for effect in pending { effect.runIfStale() }
    }
}

/// The order a framework commits its bindings in, as a key per effect: the
/// effects a write invalidates re-run in key order (lexicographic). An effect
/// takes the next key of the scope it is created in; while it runs, effects it
/// creates (a branch, a row) are keyed under its own key. Compiled templates
/// create their binding effects in their framework's order and open scopes where
/// its order is not the template's: Vue and Svelte update each component after
/// the one that created it, Angular a view's embedded views and then its child
/// components after the view's own bindings, Solid a deeper template after
/// every shallower one.
public enum EffectOrder {
    public final class Scope {
        let prefix: [Int]
        /// Next key for: the scope's own effects, embedded views, child views.
        var counters = [0, 0, 0]
        /// Solid: templates under this many control-flow regions, keyed by the one global count.
        let height: Int?

        init(prefix: [Int], height: Int? = nil) {
            self.prefix = prefix
            self.height = height
        }

        func next(_ phase: Int) -> [Int] {
            if let height { solidCount += 1; return [height, solidCount] }
            defer { counters[phase] += 1 }
            return prefix + [phase, counters[phase]]
        }
    }

    public static var current = Scope(prefix: [])
    private static var components = 0
    private static var solidCount = 0
    /// Derived values (`Memo`) settle before any binding reads them.
    private static var memos = 0

    static func key() -> [Int] { current.next(0) }

    static func memoKey() -> [Int] {
        memos += 1
        return [Int.min, memos]
    }

    static func precedes(_ a: [Int], _ b: [Int]) -> Bool { a.lexicographicallyPrecedes(b) }

    static func run<T>(_ scope: Scope, _ body: () -> T) -> T {
        let previous = current
        current = scope
        defer { current = previous }
        return body()
    }

    /// Vue's and Svelte's component: ordered after every component created before it.
    public static func component<T>(_ body: () -> T) -> T {
        components += 1
        return run(Scope(prefix: [components]), body)
    }

    /// Angular's component view: after its parent view's bindings and embedded views.
    public static func view<T>(_ body: () -> T) -> T {
        run(Scope(prefix: current.next(2)), body)
    }

    /// Angular's embedded view (`@if`, `@for` content): after its declaring view's own bindings.
    public static func embedded<T>(in view: Scope, _ body: () -> T) -> T {
        run(Scope(prefix: view.next(1)), body)
    }

    /// Solid's control-flow content: one level deeper than the template that holds it.
    public static func deeper<T>(_ body: () -> T) -> T {
        run(Scope(prefix: [], height: (current.height ?? 0) + 1), body)
    }

    /// Solid's root template.
    public static func solid<T>(_ body: () -> T) -> T {
        current.height != nil ? body() : run(Scope(prefix: [], height: 0), body)
    }
}

/// Reads without subscribing the running effect.
public func untrack<T>(_ body: () -> T) -> T {
    let previous = currentEffect
    currentEffect = nil
    defer { currentEffect = previous }
    return body()
}

/// A value that notifies the effects that read it.
public final class Signal<T>: Source {
    private var stored: T
    private var subscribers: [ObjectIdentifier: Subscriber] = [:]
    private let same: (T, T) -> Bool

    public init(_ value: T) {
        stored = value
        same = { _, _ in false }
    }

    public init(_ value: T) where T: Equatable {
        stored = value
        same = (==)
    }

    /// A signal whose writes compare with `equals` (JavaScript's `Object.is` for objects).
    public init(_ value: T, equals: @escaping (T, T) -> Bool) {
        stored = value
        same = equals
    }

    public var value: T {
        get {
            if let effect = currentEffect {
                subscribers[ObjectIdentifier(effect)] = effect
                effect.track(self)
            }
            return stored
        }
        set {
            if same(stored, newValue) { return }
            stored = newValue
            let targets = Array(subscribers.values)
            for target in targets { target.invalidate() }
            if batchDepth == 0 { flush() }
        }
    }

    /// `signal.update { $0 + 1 }`, as Angular writes it.
    public func update(_ transform: (T) -> T) { value = transform(stored) }

    func unsubscribe(_ subscriber: Subscriber) { subscribers[ObjectIdentifier(subscriber)] = nil }
}

/// Runs `body` now and again whenever a signal it read changes.
public final class Effect: Subscriber {
    private var body: (() -> Void)?
    private var sources: [ObjectIdentifier: Source] = [:]
    private var stale = false
    private var owner: Owner?
    let key: [Int]
    private let height: Int?

    @discardableResult
    public convenience init(_ body: @escaping () -> Void) {
        self.init(key: EffectOrder.key(), body)
    }

    init(key: [Int], _ body: @escaping () -> Void) {
        self.body = body
        self.key = key
        height = EffectOrder.current.height
        Owner.current?.effects.append(self)
        run()
    }

    fileprivate func track(_ source: Source) { sources[ObjectIdentifier(source)] = source }

    func invalidate() {
        guard body != nil, !stale else { return }
        stale = true
        queue.append(self)
    }

    fileprivate func runIfStale() {
        guard stale else { return }
        stale = false
        run()
    }

    private func run() {
        guard let body else { return }
        for source in sources.values { source.unsubscribe(self) }
        sources = [:]
        // Effects and views made by the previous run (a branch, a row) go with it.
        owner?.dispose()
        // The effect, not whatever owner is current when it re-runs, owns what each run makes.
        owner = Owner(parent: nil)
        let previous = currentEffect
        currentEffect = self
        EffectOrder.run(EffectOrder.Scope(prefix: key, height: height)) { owner?.run(body) }
        currentEffect = previous
    }

    fileprivate func dispose() {
        for source in sources.values { source.unsubscribe(self) }
        sources = [:]
        body = nil
        owner?.dispose()
        owner = nil
    }
}

/// A derived value cached until a signal it read changes (Vue `computed`,
/// Angular `computed`, Solid `createMemo`, Svelte `$derived`).
public final class Memo<T> {
    private let signal: Signal<T?>
    private var effect: Effect?

    public init(_ compute: @escaping () -> T) {
        signal = Signal<T?>(nil)
        effect = Effect(key: EffectOrder.memoKey()) { [signal] in signal.value = compute() }
    }

    public var value: T { signal.value! }
}

/// A top-level owner for an app or a navigation entry.
@discardableResult
public func createRoot<T>(_ body: (Owner) -> T) -> T {
    let owner = Owner(parent: nil)
    return owner.run { body(owner) }
}
