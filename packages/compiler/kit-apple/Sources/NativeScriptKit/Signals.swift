import Foundation

// Fine-grained reactivity, the model Angular signals, Vue refs, Solid
// signals and Svelte runes share: a read inside an effect subscribes it, a
// write re-runs exactly the effects that read the value. Compiled templates
// bind each native property through one effect, so nothing is diffed.
// Main thread only; effects re-run on the app's framework's schedule (`Reactivity`).

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
private var eventDepth = 0
private var queue: [Effect] = []
/// Derived values whose sources changed: they settle before the bindings re-run.
private var derivedQueue: [Effect] = []
private var flushing = false
private var flushScheduled = false
/// What `nextTick()` returned while an update was scheduled, settled after it.
private var flushedPromise: JSResolvers<Void>?
/// Angular, in the microtask checkpoint after an update: updates are scheduled in a microtask.
private var afterUpdate = false
/// Signals whose readers outside an owner see the value they had before the writes.
private var holding: [Holding] = []

protocol Holding: AnyObject {
    func release()
}

/// When the effects a write invalidates re-run: the app's framework's update schedule.
public enum Reactivity {
    public enum Schedule {
        /// At once: React's legacy root commits each `setState` synchronously.
        case now
        /// In a microtask queued by the first write: Vue's `queueFlush`, Svelte's
        /// `schedule_update`, Solid's `schedule`.
        case microtask
        /// In a zero-delay timer, Angular's zoneless `scheduleCallbackWithRafRace`
        /// (its `setTimeout` comes before NativeScript's next-frame `requestAnimationFrame`);
        /// in a microtask during the checkpoint that follows an update (`switchToMicrotaskScheduler`).
        case task
        /// When the event being handled returns, otherwise in a microtask: Octane's discrete event scope.
        case event
    }

    public static var schedule = Schedule.now

    /// Vue's `nextTick()`: settles once the scheduled update has run, or now.
    public static func nextTick() -> JSPromise<Void> {
        guard flushScheduled else { return .resolve() }
        if flushedPromise == nil { flushedPromise = JSPromise<Void>.pending().1 }
        return flushedPromise!.promise
    }

    /// Svelte's `tick()`: schedules an update and returns a settled promise, whose reactions follow it.
    public static func tick() -> JSPromise<Void> {
        scheduleFlush()
        return .resolve()
    }

    /// An event handler of a template. Angular's listener marks its view dirty, so an update
    /// follows every event; Octane updates when the handler returns; React and Octane handlers
    /// read the state of the render that made them (`stateSignal`) until they return.
    public static func event(_ handler: () -> Void) {
        if schedule == .task { scheduleFlush() }
        eventDepth += 1
        handler()
        eventDepth -= 1
        if eventDepth == 0 && schedule != .task { flush() }
    }
}

/// Groups writes so each affected effect runs once, after the last write.
public func batch(_ body: () -> Void) {
    batchDepth += 1
    body()
    batchDepth -= 1
    if batchDepth == 0 { flush() }
}

private func scheduleFlush() {
    if flushScheduled || flushing { return }
    switch Reactivity.schedule {
    case .now: flush()
    case .event where eventDepth > 0: break
    case .task where !afterUpdate:
        flushScheduled = true
        jsSetTimeout(scheduledFlush, 0)
    default:
        flushScheduled = true
        Microtasks.enqueue(scheduledFlush)
    }
}

private func scheduledFlush() {
    flushScheduled = false
    flush()
    if Reactivity.schedule == .task && !afterUpdate {
        afterUpdate = true
        Microtasks.enqueue { afterUpdate = false }
    }
    if let flushed = flushedPromise {
        flushedPromise = nil
        flushed.resolve()
    }
}

private func flush() {
    if flushing { return }
    flushing = true
    if eventDepth == 0 && !holding.isEmpty {
        for signal in holding { signal.release() }
        holding = []
    }
    while !queue.isEmpty || !derivedQueue.isEmpty {
        while !derivedQueue.isEmpty {
            let derived = derivedQueue.sorted { EffectOrder.precedes($0.key, $1.key) }
            derivedQueue = []
            for effect in derived { effect.runIfStale() }
        }
        let pending = queue.sorted { EffectOrder.precedes($0.key, $1.key) }
        queue = []
        for effect in pending { effect.runIfStale() }
    }
    flushing = false
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
    /// Derived values settle in the order they were declared.
    private static var derived = 0

    static func key() -> [Int] { current.next(0) }

    static func derivedKey() -> [Int] {
        derived += 1
        return [derived]
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
public final class Signal<T>: Source, Holding {
    private var stored: T
    private var subscribers: [ObjectIdentifier: Subscriber] = [:]
    private let same: (T, T) -> Bool
    /// Framework state (`stateSignal`): read outside an owner, the value before the writes not yet committed.
    fileprivate var holds = false
    private var held: T?

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
            if let held, Owner.current == nil { return held }
            return stored
        }
        set {
            if same(stored, newValue) { return }
            if holds && held == nil {
                held = stored
                holding.append(self)
            }
            stored = newValue
            let targets = Array(subscribers.values)
            for target in targets { target.invalidate() }
            if batchDepth == 0 && !flushing && !(queue.isEmpty && derivedQueue.isEmpty && holding.isEmpty) { scheduleFlush() }
        }
    }

    func release() { held = nil }

    /// `signal.update { $0 + 1 }`, as Angular writes it.
    public func update(_ transform: (T) -> T) { value = transform(stored) }

    func unsubscribe(_ subscriber: Subscriber) { subscribers[ObjectIdentifier(subscriber)] = nil }
}

/// React's `useState`, Octane's and Solid's signals: the handlers of a render read the state it
/// rendered (Solid's untracked reads see the last flush) until the writes commit.
public func stateSignal<T>(_ signal: Signal<T>) -> Signal<T> {
    signal.holds = true
    return signal
}

/// Runs `body` now and again whenever a signal it read changes.
public final class Effect: Subscriber {
    private var body: (() -> Void)?
    private var sources: [ObjectIdentifier: Source] = [:]
    private var stale = false
    private var owner: Owner?
    let key: [Int]
    private let height: Int?
    private let derived: Bool

    @discardableResult
    public convenience init(_ body: @escaping () -> Void) {
        self.init(key: EffectOrder.key(), body)
    }

    init(key: [Int], derived: Bool = false, deferred: Bool = false, _ body: @escaping () -> Void) {
        self.body = body
        self.key = key
        self.derived = derived
        height = EffectOrder.current.height
        Owner.current?.effects.append(self)
        Effect.created?(self)
        if deferred {
            stale = true
            queue.append(self)
            scheduleFlush()
        } else {
            run()
        }
    }

    /// Angular's `effect()`: its first run is in the next update, as change detection runs it, not at creation.
    @discardableResult
    public static func deferred(_ body: @escaping () -> Void) -> Effect {
        Effect(key: EffectOrder.key(), deferred: true, body)
    }

    /// `EffectRef.destroy()`.
    public func destroy() { dispose() }

    /// Called with each effect as it is made: zone.js change detection re-runs them all.
    static var created: ((Effect) -> Void)?

    var disposed: Bool { body == nil }

    fileprivate func track(_ source: Source) { sources[ObjectIdentifier(source)] = source }

    func invalidate() {
        guard body != nil, !stale else { return }
        stale = true
        if derived { derivedQueue.append(self) } else { queue.append(self) }
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

/// A derived value as Svelte's `$:` keeps it: `body` stores it when its sources change, in the
/// update after the writes and before any binding re-runs; read before that, it is the old value.
@discardableResult
public func derive(_ body: @escaping () -> Void) -> Effect {
    Effect(key: EffectOrder.derivedKey(), derived: true, body)
}

/// A top-level owner for an app or a navigation entry.
@discardableResult
public func createRoot<T>(_ body: (Owner) -> T) -> T {
    let owner = Owner(parent: nil)
    return owner.run { body(owner) }
}
