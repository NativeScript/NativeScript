import Foundation

// Fine-grained reactivity, the model Angular signals, Vue refs, Solid
// signals and Svelte runes share: a read inside an effect subscribes it, a
// write re-runs exactly the effects that read the value. Compiled templates
// bind each native property through one effect, so nothing is diffed.
// Main thread only; effects re-run on the app's framework's schedule (`Reactivity`).

/// A scope that owns effects and cleanups: a component instance, a branch of
/// an `if`, a row of a `for`. Disposing it disposes everything created in it.
public final class Owner {
    nonisolated deinit {}
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
    public func run<T>(_ body: () throws -> T) rethrows -> T {
        let previous = Owner.current
        Owner.current = self
        defer { Owner.current = previous }
        return try body()
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
        let flushed = flushedPromise ?? JSPromise<Void>.pending().1
        flushedPromise = flushed
        return flushed.promise
    }

    /// Angular's `detectChanges()` on a view just created (a routed page, a dialog): what building it made pending runs
    /// now, so the view is complete before it is shown; effects pending before (`before`, from `pending()`) wait for the app's update.
    public static func detectChanges(after before: Set<ObjectIdentifier>) {
        if flushing { return }
        flushing = true
        defer { flushing = false }
        while true {
            let derived = derivedQueue.filter { !before.contains(ObjectIdentifier($0)) }
            let effects = queue.filter { !before.contains(ObjectIdentifier($0)) }
            if derived.isEmpty && effects.isEmpty { break }
            let run = derived.isEmpty ? effects : derived
            let ids = Set(run.map(ObjectIdentifier.init))
            if derived.isEmpty { queue.removeAll { ids.contains(ObjectIdentifier($0)) } } else { derivedQueue.removeAll { ids.contains(ObjectIdentifier($0)) } }
            for effect in run.sorted(by: { EffectOrder.precedes($0.key, $1.key) }) { effect.runIfStale() }
        }
    }

    /// The effects waiting for the next update.
    public static func pending() -> Set<ObjectIdentifier> {
        Set((queue + derivedQueue).map(ObjectIdentifier.init))
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

    /// A listener of a zoneless Angular template: the update it schedules re-checks the bindings of
    /// `view` and of every view above it.
    public static func event(dirty view: AngularView?, _ handler: () -> Void) {
        view?.markDirty()
        event(handler)
    }

    /// `ChangeDetectorRef.markForCheck()` on a zoneless view: an update re-checks it and the views above it, scheduled
    /// as a write schedules one, or run at once.
    static func markForCheck(_ view: AngularView?, now: Bool = false) {
        view?.markDirty()
        if now { flush() } else { scheduleFlush() }
    }
}

/// An Angular component view as zoneless change detection refreshes it: a listener marks its view
/// and the views above it dirty, and refreshing a view re-checks every binding (`Check`) of its
/// template and of its embedded views, applying what is no longer `Object.is` the value last applied.
/// Child components are refreshed only through their own inputs, which are signals here.
public final class AngularView {
    nonisolated deinit {}
    private weak var parent: AngularView?
    private var checks: [Weak] = []

    private struct Weak { weak var effect: Effect? }

    init(parent: AngularView?) { self.parent = parent }

    func add(_ effect: Effect) { checks.append(Weak(effect: effect)) }

    func markDirty() {
        var view: AngularView? = self
        while let current = view {
            current.checks.removeAll { $0.effect?.disposed ?? true }
            for check in current.checks { check.effect?.invalidate() }
            view = current.parent
        }
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
        nonisolated deinit {}
        let prefix: [Int]
        /// Next key for: the scope's own effects, embedded views, child views.
        var counters = [0, 0, 0]
        /// Solid: templates under this many control-flow regions, keyed by the one global count.
        let height: Int?
        /// Angular: the component view whose bindings this scope's checks are.
        public let view: AngularView?

        init(prefix: [Int], height: Int? = nil, view: AngularView? = nil) {
            self.prefix = prefix
            self.height = height
            self.view = view
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

    static func run<T>(_ scope: Scope, _ body: () throws -> T) rethrows -> T {
        let previous = current
        current = scope
        defer { current = previous }
        return try body()
    }

    /// Vue's and Svelte's component: ordered after every component created before it.
    public static func component<T>(_ body: () throws -> T) rethrows -> T {
        components += 1
        return try run(Scope(prefix: [components]), body)
    }

    /// Angular's component view: after its parent view's bindings and embedded views.
    public static func view<T>(_ body: () throws -> T) rethrows -> T {
        try run(Scope(prefix: current.next(2), view: AngularView(parent: current.view)), body)
    }

    /// Angular's embedded view (`@if`, `@for` content): after its declaring view's own bindings.
    public static func embedded<T>(in view: Scope, _ body: () throws -> T) rethrows -> T {
        try run(Scope(prefix: view.next(1), view: view.view), body)
    }

    /// Solid's control-flow content: one level deeper than the template that holds it.
    public static func deeper<T>(_ body: () throws -> T) rethrows -> T {
        try run(Scope(prefix: [], height: (current.height ?? 0) + 1), body)
    }

    /// Solid's root template.
    public static func solid<T>(_ body: () throws -> T) rethrows -> T {
        current.height != nil ? try body() : try run(Scope(prefix: [], height: 0), body)
    }
}

/// Reads without subscribing the running effect.
public func untrack<T>(_ body: () throws -> T) rethrows -> T {
    let previous = currentEffect
    currentEffect = nil
    defer { currentEffect = previous }
    return try body()
}

/// A value that notifies the effects that read it.
public final class Signal<T>: Source, Holding {
    nonisolated deinit {}
    private enum Backing {
        case stored(T)
        case computed(() -> T)
    }
    private var backing: Backing
    private var linkEffect: Effect?
    private var subscribers: [ObjectIdentifier: Subscriber] = [:]
    private let same: (T, T) -> Bool
    /// Framework state (`stateSignal`): read outside an owner, the value before the writes not yet committed.
    fileprivate var holds = false
    private var held: T?

    public init(_ value: T) {
        backing = .stored(value)
        same = { _, _ in false }
    }

    public init(_ value: T) where T: Equatable {
        backing = .stored(value)
        same = { $0 == $1 }
    }

    /// A signal whose writes compare with `equals` (JavaScript's `Object.is` for objects).
    public init(_ value: T, equals: @escaping (T, T) -> Bool) {
        backing = .stored(value)
        same = equals
    }

    public init(computing compute: @escaping () throws -> T) {
        backing = .computed({ jsReportedOrZero(compute) })
        same = { _, _ in false }
    }

    public init(linked compute: @escaping () throws -> T) {
        backing = .computed({ jsReportedOrZero(compute) })
        same = { _, _ in false }
        bindLink(compute)
    }

    public init(linked compute: @escaping () throws -> T) where T: Equatable {
        backing = .computed({ jsReportedOrZero(compute) })
        same = { $0 == $1 }
        bindLink(compute)
    }

    public init(linked compute: @escaping () throws -> T, equals: @escaping (T, T) -> Bool) {
        backing = .computed({ jsReportedOrZero(compute) })
        same = equals
        bindLink(compute)
    }

    private func bindLink(_ compute: @escaping () throws -> T) {
        var first = true
        linkEffect = Effect(key: EffectOrder.derivedKey(), derived: true) { [weak self] in
            let v = jsReportedOrZero(compute)
            if first {
                first = false
                self?.backing = .stored(v)
            } else {
                self?.value = v
            }
        }
    }

    public var value: T {
        get {
            linkEffect?.runIfStale()
            let current: T
            switch backing {
            case .computed(let compute):
                return compute()
            case .stored(let s):
                current = s
            }
            if let effect = currentEffect {
                subscribers[ObjectIdentifier(effect)] = effect
                effect.track(self)
            }
            if let held, Owner.current == nil { return held }
            return current
        }
        set {
            linkEffect?.runIfStale()
            if case .stored(let current) = backing {
                if same(current, newValue) { return }
                if holds && held == nil {
                    held = current
                    holding.append(self)
                }
            }
            backing = .stored(newValue)
            let targets = Array(subscribers.values)
            for target in targets { target.invalidate() }
            if batchDepth == 0 && !flushing && !(queue.isEmpty && derivedQueue.isEmpty && holding.isEmpty) { scheduleFlush() }
        }
    }

    func release() { held = nil }

    /// `signal.update { $0 + 1 }`, as Angular writes it.
    public func update(_ transform: (T) -> T) {
        linkEffect?.runIfStale()
        let current: T
        switch backing {
        case .stored(let s): current = s
        case .computed(let c): current = c()
        }
        value = transform(current)
    }

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
    nonisolated deinit {}
    private var body: (() -> Void)?
    private var sources: [ObjectIdentifier: Source] = [:]
    private var stale = false
    private var owner: Owner?
    let key: [Int]
    private let height: Int?
    private let view: AngularView?
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
        view = EffectOrder.current.view
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
        EffectOrder.run(EffectOrder.Scope(prefix: key, height: height, view: view)) { owner?.run(body) }
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
public func createRoot<T>(_ body: (Owner) throws -> T) rethrows -> T {
    let owner = Owner(parent: nil)
    return try owner.run { try body(owner) }
}

public typealias EffectRef = Effect

/// `inject(DestroyRef)`: callbacks run when the injecting component's scope ends.
public final class DestroyRef {
    nonisolated deinit {}
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

public final class RxSubscription {
    nonisolated deinit {}
    private var teardown: (() -> Void)?
    public private(set) var closed = false

    public init(_ teardown: (() -> Void)? = nil) { self.teardown = teardown }

    public func unsubscribe() {
        guard !closed else { return }
        closed = true
        let finalize = teardown
        teardown = nil
        finalize?()
    }
}

/// An event a component raises (Angular `output()` / `EventEmitter`): the parent subscribes, the component emits.
public final class Emitter<T> {
    nonisolated deinit {}
    private final class Handler {
        nonisolated deinit {}
        let fn: (T) -> Void
        init(_ fn: @escaping (T) -> Void) { self.fn = fn }
    }
    private var handlers: [Handler] = []
    public init(_ isAsync: Bool = false) {}
    public func on(_ handler: @escaping (T) -> Void) { handlers.append(Handler(handler)) }
    public func emit(_ value: T) { for h in handlers { h.fn(value) } }
    public func next(_ value: T) { emit(value) }

    @discardableResult
    public func subscribe(_ next: @escaping (T) -> Void) -> RxSubscription {
        let box = Handler(next)
        handlers.append(box)
        return RxSubscription { [weak self] in
            self?.handlers.removeAll { $0 === box }
        }
    }

    @discardableResult
    public func subscribe(_ next: @escaping (T) throws -> Void) -> RxSubscription {
        subscribe { value in jsReport { try next(value) } }
    }

    @discardableResult
    public func subscribe(_ observerOrNext: Any? = nil, _ error: Any? = nil, _ complete: Any? = nil) -> RxSubscription {
        let box = Handler { value in
            guard let sub = jsFlat(observerOrNext) else { return }
            if let dyn = sub as? JSDynamic, jsHasKey(dyn, "next") || (dyn as? JSObject)?.has("next") == true {
                jsReport { _ = try jsCallMethod(sub, "next", value) }
            } else {
                jsReport { _ = try jsCall(sub, value) }
            }
        }
        handlers.append(box)
        return RxSubscription { [weak self] in
            self?.handlers.removeAll { $0 === box }
        }
    }
}

extension Emitter where T == Void {
    public func emit() { emit(()) }
    public func next() { emit(()) }
}

extension Emitter where T == Any? {
    public func emit() { emit(nil) }
    public func next() { emit(nil) }
}

/// `ElementRef`: a view of a template, as a view query (`@ViewChild('ref', { read: ElementRef })`) gives it.
public final class ElementRef {
    nonisolated deinit {}
    public private(set) var nativeElement: Any?
    public init(_ nativeElement: Any? = nil) { self.nativeElement = nativeElement }

    /// A component's own ElementRef, made with the component: its template's root view, once made.
    public func attach(_ host: Any?) { nativeElement = host }

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

public protocol JSInjectableType: AnyObject {
    static var jsSharedInstance: Any? { get }
    static func jsConstruct() throws -> Any?
}

public func forwardRef(_ fn: @escaping () throws -> Any?) -> Any? { fn }

public func resolveForwardRef(_ value: Any?) -> Any? {
    guard let flat = jsFlat(value) else { return nil }
    if let fn = flat as? () throws -> Any? { return jsReported { try fn() } ?? nil }
    if let fn = flat as? () -> Any? { return fn() }
    return value
}

public final class SkipSelf {
    nonisolated deinit {}
    public init() {}
}

public final class Host {
    nonisolated deinit {}
    public init() {}
}

public final class Inject {
    nonisolated deinit {}
    public let token: Any?
    public init(_ token: Any?) { self.token = token }
}

/// `inject(Injector)`; supports hierarchical child injectors (`Injector.create`) as well as root providers.
public final class Injector {
    nonisolated deinit {}
    public static let shared = Injector()
    public static var root: Injector { current ?? shared }
    private static var current: Injector? = nil

    private let parent: Injector?
    private var instanceValues: [ObjectIdentifier: Any?] = [:]
    private var instanceFactories: [ObjectIdentifier: () throws -> Any?] = [:]
    private var instanceMultiFactories: [ObjectIdentifier: [() throws -> Any?]] = [:]

    public init(_ providers: Any? = nil, _ parent: Injector? = nil) {
        self.parent = parent
        if providers != nil {
            registerInstance(providers)
        }
    }

    public static func create(_ options: Any?, _ parent: Injector? = nil) -> Injector {
        guard let flat = jsFlat(options) else { return Injector(nil, parent) }
        if flat is JSArrayProtocol {
            return Injector(flat, parent)
        }
        let providers = (try? jsGet(flat, "providers")) ?? flat
        let resolvedParent = (jsFlat((try? jsGet(flat, "parent")) ?? nil) as? Injector) ?? parent
        return Injector(providers, resolvedParent)
    }

    public func get(_ token: Any?, _ notFoundValue: Any? = nil, _ options: Any? = nil) -> Any? {
        let unwrapped = resolveForwardRef(token)
        let skipSelf = ((try? jsGet(options, "skipSelf")) as? Bool) == true
        let selfOnly = ((try? jsGet(options, "self")) as? Bool) == true
        if !skipSelf, let key = Injector.tokenKey(unwrapped) {
            if let entry = instanceValues[key] { return entry }
            if let multis = instanceMultiFactories[key], !multis.isEmpty {
                let values = multis.map { fn in Injector.runInContext(self) { jsReported { try fn() } ?? nil } }
                let arr = JSArray<Any?>(values)
                instanceValues[key] = arr
                return arr
            }
            if let factory = instanceFactories[key] {
                let val = Injector.runInContext(self) { jsReported { try factory() } ?? nil }
                instanceValues[key] = val
                return val
            }
        }
        if selfOnly { return notFoundValue }
        if let parent {
            return parent.get(unwrapped, notFoundValue)
        }
        if skipSelf { return notFoundValue }
        return Injector.resolveRoot(unwrapped, notFoundValue: notFoundValue)
    }

    public static func runInContext<T>(_ injector: Any?, _ fn: () throws -> T) rethrows -> T {
        let prev = current
        current = (jsFlat(injector) as? Injector) ?? shared
        defer { current = prev }
        return try fn()
    }

    /// A root service, made as the root injector makes it: whatever component first injects it, its effects
    /// and its `DestroyRef` belong to the application, and what its constructor reads subscribes no binding.
    public static func root<T>(_ make: () throws -> T) rethrows -> T {
        try untrack { try Owner(parent: nil).run(make) }
    }

    private static var made: [ObjectIdentifier: AnyObject] = [:]
    private static var making: Set<ObjectIdentifier> = []

    /// A root service whose constructor can throw, kept once one is made: an inject() throws what the constructor
    /// throws, and the next inject() makes it again. A service whose construction injects itself is Angular's
    /// circular-dependency error.
    public static func root<T: AnyObject>(_ type: T.Type, _ make: () throws -> T) throws -> T {
        let key = ObjectIdentifier(type)
        if let active = current, active !== shared {
            if let over = active.get(type) as? T { return over }
        }
        if let over = tokenValues[key] as? T { return over }
        if let factory = tokenFactories[key], let over = try factory() as? T {
            tokenValues[key] = over
            return over
        }
        if let service = made[key] as? T { return service }
        guard making.insert(key).inserted else { throw JSException(JSError("NG0200: Circular dependency in DI detected for \(type)")) }
        defer { making.remove(key) }
        let service = try root(make)
        made[key] = service
        return service
    }

    private static var tokenValues: [ObjectIdentifier: Any?] = [:]
    private static var tokenFactories: [ObjectIdentifier: () throws -> Any?] = [:]
    private static var multiFactories: [ObjectIdentifier: [() throws -> Any?]] = [:]

    private static func tokenKey(_ token: Any?) -> ObjectIdentifier? {
        guard let token = jsFlat(resolveForwardRef(token)) else { return nil }
        if let type = token as? Any.Type { return ObjectIdentifier(type) }
        return ObjectIdentifier(token as AnyObject)
    }

    public static func reset() {
        made.removeAll()
        making.removeAll()
        tokenValues.removeAll()
        tokenFactories.removeAll()
        multiFactories.removeAll()
        current = nil
    }

    public static func provide(_ token: Any?, useValue: Any? = nil, useFactory: (() throws -> Any?)? = nil) {
        guard let key = tokenKey(token) else { return }
        if let useFactory {
            tokenFactories[key] = useFactory
            tokenValues.removeValue(forKey: key)
        } else {
            tokenValues[key] = useValue
            tokenFactories.removeValue(forKey: key)
        }
    }

    private static func parseProvider(_ dyn: JSDynamic, into target: Injector?) {
        let token = resolveForwardRef(dyn[jsKey: "provide"])
        guard let key = tokenKey(token) else { return }
        let isMulti = (jsFlat(dyn[jsKey: "multi"]) as? Bool) == true
        let hasValue = (dyn as? JSObject)?.has("useValue") == true || jsHasKey(dyn, "useValue")
        let val = dyn[jsKey: "useValue"]
        let factory = jsFlat(dyn[jsKey: "useFactory"])
        let existing = jsFlat(dyn[jsKey: "useExisting"])
        let useClass = jsFlat(resolveForwardRef(dyn[jsKey: "useClass"]))
        let deps = (jsFlat(dyn[jsKey: "deps"]) as? JSArrayProtocol)?.jsAnyElements ?? []
        let make: () throws -> Any? = {
            if hasValue { return val }
            if let factory {
                let resolved: [Any?] = deps.map { dep in
                    if let arr = jsFlat(dep) as? JSArrayProtocol {
                        let elems = arr.jsAnyElements
                        for el in elems {
                            if jsFlat(el) is SkipSelf { return nil }
                        }
                        if let last = elems.last {
                            if let target { return target.get(last) }
                            return Injector.inject(last)
                        }
                    }
                    if let target { return target.get(dep) }
                    return Injector.inject(dep)
                }
                if deps.isEmpty, let zero = factory as? () throws -> Any? { return try zero() }
                if deps.isEmpty, let zero = factory as? () -> Any? { return zero() }
                return try jsCall(factory, spread: resolved)
            }
            if let existing {
                if let target { return target.get(existing) }
                return Injector.inject(existing)
            }
            if let injectable = useClass as? JSInjectableType.Type {
                return try injectable.jsConstruct()
            }
            if let fn = useClass { return try jsCall(fn, spread: []) }
            if let injectable = jsFlat(token) as? JSInjectableType.Type {
                return try injectable.jsConstruct()
            }
            return nil
        }
        if let target {
            if isMulti {
                target.instanceMultiFactories[key, default: []].append(make)
                target.instanceValues.removeValue(forKey: key)
            } else {
                target.instanceFactories[key] = make
                target.instanceValues.removeValue(forKey: key)
            }
        } else {
            if isMulti {
                multiFactories[key, default: []].append(make)
                tokenValues.removeValue(forKey: key)
            } else {
                tokenFactories[key] = make
                tokenValues.removeValue(forKey: key)
            }
        }
    }

    private func registerInstance(_ providers: Any?) {
        func walk(_ item: Any?) {
            guard let flat = jsFlat(item) else { return }
            if let arr = flat as? JSArrayProtocol {
                for el in arr.jsAnyElements { walk(el) }
                return
            }
            if let dyn = flat as? JSDynamic {
                if jsHasKey(dyn, "providers") || (dyn as? JSObject)?.has("providers") == true {
                    walk(dyn[jsKey: "providers"])
                }
                if jsHasKey(dyn, "provide") || (dyn as? JSObject)?.has("provide") == true {
                    Injector.parseProvider(dyn, into: self)
                }
            }
        }
        walk(providers)
    }

    public static func register(_ providers: Any?) {
        var initializers: [() throws -> Any?] = []
        func walk(_ item: Any?) {
            guard let flat = jsFlat(item) else { return }
            if let arr = flat as? JSArrayProtocol {
                for el in arr.jsAnyElements { walk(el) }
                return
            }
            if let fn = flat as? () throws -> Any? {
                initializers.append(fn)
                return
            }
            if let fn = flat as? () -> Void {
                initializers.append({ fn(); return nil })
                return
            }
            if let dyn = flat as? JSDynamic {
                if jsHasKey(dyn, "providers") || (dyn as? JSObject)?.has("providers") == true {
                    walk(dyn[jsKey: "providers"])
                }
                if jsHasKey(dyn, "provide") || (dyn as? JSObject)?.has("provide") == true {
                    parseProvider(dyn, into: nil)
                }
            }
        }
        walk(providers)
        for initFn in initializers {
            _ = jsReported { try initFn() }
        }
    }

    public static func inject(_ token: Any?, _ options: Any? = nil, notFoundValue: Any? = nil) -> Any? {
        let unwrapped = resolveForwardRef(token)
        if let active = current, active !== shared {
            return active.get(unwrapped, notFoundValue, options)
        }
        if ((try? jsGet(options, "skipSelf")) as? Bool) == true {
            return notFoundValue
        }
        return resolveRoot(unwrapped, notFoundValue: notFoundValue)
    }

    internal static func resolveRoot(_ unwrapped: Any?, notFoundValue: Any? = nil) -> Any? {
        guard let key = tokenKey(unwrapped) else { return notFoundValue }
        if let entry = tokenValues[key] { return entry }
        if let multis = multiFactories[key], !multis.isEmpty {
            let values = multis.map { fn in jsReported { try fn() } ?? nil }
            let arr = JSArray<Any?>(values)
            tokenValues[key] = arr
            return arr
        }
        if let factory = tokenFactories[key] {
            let val = jsReported { try factory() } ?? nil
            tokenValues[key] = val
            return val
        }
        if let tok = jsFlat(unwrapped) as? InjectionToken, let factory = tok.factory {
            let val = jsReported { try factory() } ?? nil
            tokenValues[key] = val
            return val
        }
        let flat = jsFlat(unwrapped)
        if let injectable = flat as? JSInjectableType.Type {
            return injectable.jsSharedInstance
        }
        if flat is ErrorHandler.Type { return ErrorHandler.shared }
        if flat is Injector.Type { return current ?? Injector.shared }
        if flat is NgZone.Type { return NgZone.shared }
        if flat is DestroyRef.Type { return DestroyRef.current() }
        if flat is ElementRef.Type { return ElementRef.current() }
        if flat is ApplicationRef.Type { return ApplicationRef.shared }
        if flat is Location.Type { return Location.shared }
        if flat is ViewContainerRef.Type { return ViewContainerRef() }
        return notFoundValue
    }
}

/// `new InjectionToken<T>(desc, options)`: an Angular DI token, optionally carrying a root factory.
public final class InjectionToken {
    nonisolated deinit {}
    public let desc: String
    public let factory: (() throws -> Any?)?
    public init(_ desc: String = "", _ options: Any? = nil) {
        self.desc = desc
        if let fn = jsFlat(try? jsGet(options, "factory")) {
            if let zero = fn as? () throws -> Any? {
                self.factory = zero
            } else if let zero = fn as? () -> Any? {
                self.factory = zero
            } else {
                self.factory = { try jsCall(fn, spread: []) }
            }
        } else {
            self.factory = nil
        }
    }
    public func toString() -> String { "InjectionToken \(desc)" }
}

public class ErrorHandler {
    nonisolated deinit {}
    public static let shared = ErrorHandler()
    public init() {}
    open func handleError(_ error: Any?) {}
}

public func makeEnvironmentProviders(_ providers: Any?) -> Any? {
    Injector.register(providers)
    return providers
}

public func provideEnvironmentInitializer(_ fn: @escaping () throws -> Any?) -> Any? {
    return fn
}

public func provideAppInitializer(_ fn: @escaping () throws -> Any?) -> Any? {
    return fn
}

public func importProvidersFrom(_ modules: Any?...) -> Any? {
    let arr = JSArray<Any?>(modules)
    Injector.register(arr)
    return arr
}

public let PLATFORM_ID = InjectionToken("PLATFORM_ID", JSObject([("factory", { () -> Any? in "browser" })]))
public let APP_INITIALIZER = InjectionToken("APP_INITIALIZER")
public let ENVIRONMENT_INITIALIZER = InjectionToken("ENVIRONMENT_INITIALIZER")

public func isPlatformBrowser(_ platformId: Any?) -> Bool {
    jsToString(platformId) == "browser"
}

public func isPlatformServer(_ platformId: Any?) -> Bool {
    jsToString(platformId) == "server"
}

/// `NgZone` without zone.js: both run their function at once.
public final class NgZone {
    nonisolated deinit {}
    public static let shared = NgZone()
    public let onStable = Emitter<Any?>()
    public let onMicrotaskEmpty = Emitter<Any?>()
    public let onUnstable = Emitter<Any?>()
    public let onError = Emitter<Any?>()
    public let isStable = true
    public init() {}
    public static func isInAngularZone() -> Bool { true }
    public func run<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
    public func runOutsideAngular<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
    public func runGuarded<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
    public func runTask<T>(_ fn: () throws -> T) rethrows -> T { try fn() }
}

public final class TemplateRef {
    nonisolated deinit {}
    public let elementRef: ElementRef
    public init(_ elementRef: ElementRef = ElementRef()) {
        self.elementRef = elementRef
    }
}

public final class EmbeddedViewRef {
    nonisolated deinit {}
    public var context: Any?
    public var rootNodes: JSArray<Any?> = JSArray()
    public private(set) var destroyed = false
    public init(_ context: Any? = nil) { self.context = context }
    public func destroy() { destroyed = true }
    public func detectChanges() {}
    public func markForCheck() {}
}

public final class ComponentRef {
    nonisolated deinit {}
    public var instance: Any?
    public let location: ElementRef
    public let injector: Injector
    public let hostView: EmbeddedViewRef
    public init(_ instance: Any? = nil, _ location: ElementRef = ElementRef(), _ injector: Injector = Injector.shared) {
        self.instance = instance
        self.location = location
        self.injector = injector
        self.hostView = EmbeddedViewRef(instance)
    }
    public func setInput(_ name: String, _ value: Any?) {
        if let inst = instance {
            try? jsSet(inst, name, value)
        }
    }
    public func destroy() {
        hostView.destroy()
    }
}

public final class ViewContainerRef {
    nonisolated deinit {}
    public let element = ElementRef()
    public let injector = Injector.shared
    private var views: [EmbeddedViewRef] = []
    public init() {}
    public var length: Double { Double(views.count) }
    public func clear() {
        for v in views { v.destroy() }
        views.removeAll()
    }
    @discardableResult
    public func createEmbeddedView(_ templateRef: Any?, _ context: Any? = nil, _ options: Any? = nil) -> EmbeddedViewRef {
        let view = EmbeddedViewRef(context)
        views.append(view)
        return view
    }
    @discardableResult
    public func createComponent(_ componentType: Any?, _ options: Any? = nil) -> ComponentRef {
        let inst: Any? = {
            if let injectable = jsFlat(componentType) as? JSInjectableType.Type {
                return jsReported { try injectable.jsConstruct() } ?? nil
            }
            if let fn = jsFlat(componentType) {
                return jsReported { try jsCall(fn, spread: []) } ?? nil
            }
            return nil
        }()
        let ref = ComponentRef(inst)
        views.append(ref.hostView)
        return ref
    }
    public func remove(_ index: Double? = nil) {
        if views.isEmpty { return }
        let idx = index.map { Int($0) } ?? (views.count - 1)
        if idx >= 0 && idx < views.count {
            views[idx].destroy()
            views.remove(at: idx)
        }
    }
}

public final class ApplicationRef {
    nonisolated deinit {}
    public static let shared = ApplicationRef()
    public let isStable = Emitter<Bool>()
    public init() {}
    public func tick() {}
    public func destroy() {}
}

public final class Location {
    nonisolated deinit {}
    public static let shared = Location()
    private var currentPath = "/"
    public init() {}
    public func path(_ includeHash: Bool = false) -> String { currentPath }
    public func go(_ path: String, _ query: String = "", _ state: Any? = nil) {
        currentPath = query.isEmpty ? path : "\(path)?\(query)"
    }
    public func replaceState(_ path: String, _ query: String = "", _ state: Any? = nil) {
        go(path, query, state)
    }
    public func back() {}
    public func forward() {}
    public static func joinWithSlash(_ start: String, _ end: String) -> String {
        if start.isEmpty { return end }
        if end.isEmpty { return start }
        let s = start.hasSuffix("/") ? String(start.dropLast()) : start
        let e = end.hasPrefix("/") ? String(end.dropFirst()) : end
        return "\(s)/\(e)"
    }
    public static func stripTrailingSlash(_ url: String) -> String {
        url.count > 1 && url.hasSuffix("/") ? String(url.dropLast()) : url
    }
}

// MARK: @angular/common/http value types

public final class HttpHeaders {
    nonisolated deinit {}
    private var storage: [String: [String]] = [:]
    private var originalNames: [String: String] = [:]
    private var keyOrder: [String] = []

    public init(_ headers: Any? = nil) {
        guard let flat = jsFlat(headers) else { return }
        if let str = flat as? String {
            for line in str.split(separator: "\n") {
                if let colon = line.firstIndex(of: ":") {
                    let name = line[..<colon].trimmingCharacters(in: .whitespacesAndNewlines)
                    let val = line[line.index(after: colon)...].trimmingCharacters(in: .whitespacesAndNewlines)
                    appendInPlace(name, val)
                }
            }
        } else {
            for k in jsKeysOf(flat) {
                let v = (try? jsGet(flat, k)) ?? nil
                guard !jsIsNullish(v) else { continue }
                let lower = k.lowercased()
                if originalNames[lower] == nil {
                    originalNames[lower] = k
                    keyOrder.append(lower)
                }
                if let arr = jsFlat(v) as? JSArrayProtocol {
                    storage[lower] = arr.jsAnyElements.map { jsToString($0) }
                } else {
                    storage[lower] = [jsToString(v)]
                }
            }
        }
    }

    private func appendInPlace(_ name: String, _ value: Any?) {
        let lower = name.lowercased()
        if originalNames[lower] == nil {
            originalNames[lower] = name
            keyOrder.append(lower)
        }
        var list = storage[lower] ?? []
        if let arr = jsFlat(value) as? JSArrayProtocol {
            for item in arr.jsAnyElements { list.append(jsToString(item)) }
        } else {
            list.append(jsToString(value))
        }
        storage[lower] = list
    }

    private func cloned() -> HttpHeaders {
        let copy = HttpHeaders()
        copy.storage = storage
        copy.originalNames = originalNames
        copy.keyOrder = keyOrder
        return copy
    }

    public func has(_ name: String) -> Bool {
        storage[name.lowercased()] != nil
    }

    public func get(_ name: String) -> String? {
        storage[name.lowercased()]?.first
    }

    public func keys() -> JSArray<String> {
        JSArray(keyOrder.compactMap { originalNames[$0] })
    }

    public func getAll(_ name: String) -> JSArray<String>? {
        guard let vals = storage[name.lowercased()] else { return nil }
        return JSArray(vals)
    }

    public func append(_ name: String, _ value: Any?) -> HttpHeaders {
        let next = cloned()
        next.appendInPlace(name, value)
        return next
    }

    public func set(_ name: String, _ value: Any?) -> HttpHeaders {
        let next = cloned()
        let lower = name.lowercased()
        if next.originalNames[lower] == nil {
            next.keyOrder.append(lower)
        }
        next.originalNames[lower] = name
        if let arr = jsFlat(value) as? JSArrayProtocol {
            next.storage[lower] = arr.jsAnyElements.map { jsToString($0) }
        } else {
            next.storage[lower] = [jsToString(value)]
        }
        return next
    }

    public func delete(_ name: String, _ value: Any? = nil) -> HttpHeaders {
        let next = cloned()
        let lower = name.lowercased()
        if jsIsNullish(value) {
            next.storage.removeValue(forKey: lower)
            next.originalNames.removeValue(forKey: lower)
            next.keyOrder.removeAll { $0 == lower }
        } else if let existing = next.storage[lower] {
            let removeSet: Set<String>
            if let arr = jsFlat(value) as? JSArrayProtocol {
                removeSet = Set(arr.jsAnyElements.map { jsToString($0) })
            } else {
                removeSet = [jsToString(value)]
            }
            let filtered = existing.filter { !removeSet.contains($0) }
            if filtered.isEmpty {
                next.storage.removeValue(forKey: lower)
                next.originalNames.removeValue(forKey: lower)
                next.keyOrder.removeAll { $0 == lower }
            } else {
                next.storage[lower] = filtered
            }
        }
        return next
    }

    public func toJSObject() -> JSObject {
        var pairs: [(String, Any?)] = []
        for lower in keyOrder {
            if let orig = originalNames[lower], let vals = storage[lower] {
                pairs.append((orig, vals.joined(separator: ", ")))
            }
        }
        return JSObject(pairs)
    }
}

public final class HttpParams {
    nonisolated deinit {}
    private var storage: [String: [String]] = [:]
    private var keyOrder: [String] = []

    public init(_ options: Any? = nil) {
        guard let flat = jsFlat(options) else { return }
        if let fromString = (try? jsGet(flat, "fromString")) as? String {
            let trimmed = fromString.hasPrefix("?") ? String(fromString.dropFirst()) : fromString
            if !trimmed.isEmpty {
                for part in trimmed.split(separator: "&") {
                    let s = String(part)
                    if let eq = s.firstIndex(of: "=") {
                        let k = String(s[..<eq]).removingPercentEncoding ?? String(s[..<eq])
                        let v = String(s[s.index(after: eq)...]).removingPercentEncoding ?? String(s[s.index(after: eq)...])
                        appendInPlace(k, v)
                    } else {
                        appendInPlace(s.removingPercentEncoding ?? s, "")
                    }
                }
            }
        } else {
            let fromObj = (try? jsGet(flat, "fromObject")) ?? nil
            let source: Any? = !jsIsNullish(fromObj) ? fromObj : flat
            for k in jsKeysOf(source) {
                if k == "fromString" || k == "fromObject" || k == "encoder" { continue }
                let v = (try? jsGet(source, k)) ?? nil
                guard !jsIsNullish(v) else { continue }
                if !keyOrder.contains(k) { keyOrder.append(k) }
                if let arr = jsFlat(v) as? JSArrayProtocol {
                    storage[k] = arr.jsAnyElements.map { jsToString($0) }
                } else {
                    storage[k] = [jsToString(v)]
                }
            }
        }
    }

    private func appendInPlace(_ param: String, _ value: Any?) {
        if !keyOrder.contains(param) { keyOrder.append(param) }
        var list = storage[param] ?? []
        list.append(jsToString(value))
        storage[param] = list
    }

    private func cloned() -> HttpParams {
        let copy = HttpParams()
        copy.storage = storage
        copy.keyOrder = keyOrder
        return copy
    }

    public func has(_ param: String) -> Bool {
        storage[param] != nil
    }

    public func get(_ param: String) -> String? {
        storage[param]?.first
    }

    public func getAll(_ param: String) -> JSArray<String>? {
        guard let vals = storage[param] else { return nil }
        return JSArray(vals)
    }

    public func keys() -> JSArray<String> {
        JSArray(keyOrder)
    }

    public func append(_ param: String, _ value: Any?) -> HttpParams {
        let next = cloned()
        next.appendInPlace(param, value)
        return next
    }

    public func appendAll(_ params: Any?) -> HttpParams {
        let next = cloned()
        guard let flat = jsFlat(params) else { return next }
        for k in jsKeysOf(flat) {
            let v = (try? jsGet(flat, k)) ?? nil
            guard !jsIsNullish(v) else { continue }
            if let arr = jsFlat(v) as? JSArrayProtocol {
                for item in arr.jsAnyElements { next.appendInPlace(k, item) }
            } else {
                next.appendInPlace(k, v)
            }
        }
        return next
    }

    public func set(_ param: String, _ value: Any?) -> HttpParams {
        let next = cloned()
        if !next.keyOrder.contains(param) { next.keyOrder.append(param) }
        next.storage[param] = [jsToString(value)]
        return next
    }

    public func delete(_ param: String, _ value: Any? = nil) -> HttpParams {
        let next = cloned()
        if jsIsNullish(value) {
            next.storage.removeValue(forKey: param)
            next.keyOrder.removeAll { $0 == param }
        } else if let existing = next.storage[param] {
            let target = jsToString(value)
            let filtered = existing.filter { $0 != target }
            if filtered.isEmpty {
                next.storage.removeValue(forKey: param)
                next.keyOrder.removeAll { $0 == param }
            } else {
                next.storage[param] = filtered
            }
        }
        return next
    }

    public func toString() -> String {
        var parts: [String] = []
        for k in keyOrder {
            guard let vals = storage[k] else { continue }
            let ek = jsEncodeURIComponent(k)
            for v in vals {
                parts.append("\(ek)=\(jsEncodeURIComponent(v))")
            }
        }
        return parts.joined(separator: "&")
    }
}

public final class HttpContextToken {
    nonisolated deinit {}
    public let defaultValue: () -> Any?
    public init(_ defaultValue: @escaping () throws -> Any?) {
        self.defaultValue = { jsReported { try defaultValue() } ?? nil }
    }
}

public final class HttpContext {
    nonisolated deinit {}
    private var map: [ObjectIdentifier: Any?] = [:]
    public init() {}
    @discardableResult
    public func set(_ token: HttpContextToken, _ value: Any?) -> HttpContext {
        map[ObjectIdentifier(token)] = value
        return self
    }
    public func get(_ token: HttpContextToken) -> Any? {
        let key = ObjectIdentifier(token)
        if let val = map[key] { return val }
        let def = token.defaultValue()
        map[key] = def
        return def
    }
    @discardableResult
    public func delete(_ token: HttpContextToken) -> HttpContext {
        map.removeValue(forKey: ObjectIdentifier(token))
        return self
    }
    public func has(_ token: HttpContextToken) -> Bool {
        map[ObjectIdentifier(token)] != nil
    }
}

public final class HttpResponse {
    nonisolated deinit {}
    public let body: Any?
    public let headers: HttpHeaders
    public let status: Double
    public let statusText: String
    public let url: String?
    public let ok: Bool
    public let type: Double = 4

    public init(_ options: Any? = nil) {
        let flat = jsFlat(options)
        self.body = (try? jsGet(flat, "body")) ?? nil
        self.headers = (jsFlat((try? jsGet(flat, "headers")) ?? nil) as? HttpHeaders) ?? HttpHeaders((try? jsGet(flat, "headers")) ?? nil)
        let st = (try? jsGet(flat, "status")).flatMap { jsIsNullish($0) ? nil : jsToNumber($0) } ?? 200
        self.status = st
        self.statusText = ((try? jsGet(flat, "statusText")) as? String) ?? "OK"
        self.url = (try? jsGet(flat, "url")) as? String
        self.ok = st >= 200 && st < 300
    }

    public func clone(_ update: Any? = nil) -> HttpResponse {
        let flat = jsFlat(update)
        let hasBody = (flat as? JSObject)?.has("body") == true || (flat as? JSDynamic).map { jsHasKey($0, "body") } == true
        let nextBody = hasBody ? ((try? jsGet(flat, "body")) ?? nil) : body
        let nextHeaders = (jsFlat((try? jsGet(flat, "headers")) ?? nil) as? HttpHeaders) ?? headers
        let nextStatus = (try? jsGet(flat, "status")).flatMap { jsIsNullish($0) ? nil : jsToNumber($0) } ?? status
        let nextStatusText = ((try? jsGet(flat, "statusText")) as? String) ?? statusText
        let nextUrl = ((try? jsGet(flat, "url")) as? String) ?? url
        return HttpResponse(JSObject([
            ("body", nextBody),
            ("headers", nextHeaders),
            ("status", nextStatus),
            ("statusText", nextStatusText),
            ("url", nextUrl),
        ]))
    }
}

public final class HttpErrorResponse: JSError {
    nonisolated deinit {}
    public let error: Any?
    public let headers: HttpHeaders
    public let status: Double
    public let statusText: String
    public let url: String?
    public let ok = false

    public init(_ options: Any? = nil) {
        let flat = jsFlat(options)
        let st = (try? jsGet(flat, "status")).flatMap { jsIsNullish($0) ? nil : jsToNumber($0) } ?? 0
        let stText = ((try? jsGet(flat, "statusText")) as? String) ?? "Unknown Error"
        let u = (try? jsGet(flat, "url")) as? String
        self.error = (try? jsGet(flat, "error")) ?? nil
        self.headers = (jsFlat((try? jsGet(flat, "headers")) ?? nil) as? HttpHeaders) ?? HttpHeaders((try? jsGet(flat, "headers")) ?? nil)
        self.status = st
        self.statusText = stText
        self.url = u
        super.init("Http failure response for \(u ?? "(unknown url)"): \(jsToString(st)) \(stText)")
        self.name = "HttpErrorResponse"
    }
}

public final class HttpRequest {
    nonisolated deinit {}
    public let method: String
    public let url: String
    public let body: Any?
    public let headers: HttpHeaders
    public let params: HttpParams
    public let context: HttpContext
    public let responseType: String
    public let withCredentials: Bool
    public let reportProgress: Bool

    public init(_ method: String, _ url: String, _ third: Any? = nil, _ fourth: Any? = nil) {
        let upper = method.uppercased()
        self.method = upper
        self.url = url
        let hasBody = fourth != nil || upper == "POST" || upper == "PUT" || upper == "PATCH" || upper == "JSONP"
        self.body = hasBody ? third : nil
        let opt = jsFlat(hasBody ? fourth : third)
        self.headers = (jsFlat((try? jsGet(opt, "headers")) ?? nil) as? HttpHeaders) ?? HttpHeaders((try? jsGet(opt, "headers")) ?? nil)
        self.params = (jsFlat((try? jsGet(opt, "params")) ?? nil) as? HttpParams) ?? HttpParams((try? jsGet(opt, "params")) ?? nil)
        self.context = (jsFlat((try? jsGet(opt, "context")) ?? nil) as? HttpContext) ?? HttpContext()
        self.responseType = ((try? jsGet(opt, "responseType")) as? String) ?? "json"
        self.withCredentials = jsTruthy((try? jsGet(opt, "withCredentials")) ?? false)
        self.reportProgress = jsTruthy((try? jsGet(opt, "reportProgress")) ?? false)
    }

    public var urlWithParams: String {
        let q = params.toString()
        if q.isEmpty { return url }
        return url.contains("?") ? "\(url)&\(q)" : "\(url)?\(q)"
    }

    public func clone(_ update: Any? = nil) -> HttpRequest {
        let flat = jsFlat(update)
        let nextMethod = ((try? jsGet(flat, "method")) as? String) ?? method
        let nextUrl = ((try? jsGet(flat, "url")) as? String) ?? url
        let hasBody = (flat as? JSObject)?.has("body") == true || (flat as? JSDynamic).map { jsHasKey($0, "body") } == true
        let nextBody = hasBody ? ((try? jsGet(flat, "body")) ?? nil) : body
        var nextHeaders = (jsFlat((try? jsGet(flat, "headers")) ?? nil) as? HttpHeaders) ?? headers
        if let setHeaders = jsFlat((try? jsGet(flat, "setHeaders")) ?? nil) {
            for k in jsKeysOf(setHeaders) {
                nextHeaders = nextHeaders.set(k, (try? jsGet(setHeaders, k)) ?? nil)
            }
        }
        var nextParams = (jsFlat((try? jsGet(flat, "params")) ?? nil) as? HttpParams) ?? params
        if let setParams = jsFlat((try? jsGet(flat, "setParams")) ?? nil) {
            for k in jsKeysOf(setParams) {
                nextParams = nextParams.set(k, (try? jsGet(setParams, k)) ?? nil)
            }
        }
        let nextContext = (jsFlat((try? jsGet(flat, "context")) ?? nil) as? HttpContext) ?? context
        let nextRespType = ((try? jsGet(flat, "responseType")) as? String) ?? responseType
        let nextCreds = (try? jsGet(flat, "withCredentials")).map { jsTruthy($0) } ?? withCredentials
        let nextProg = (try? jsGet(flat, "reportProgress")).map { jsTruthy($0) } ?? reportProgress
        return HttpRequest(nextMethod, nextUrl, nextBody, JSObject([
            ("headers", nextHeaders),
            ("params", nextParams),
            ("context", nextContext),
            ("responseType", nextRespType),
            ("withCredentials", nextCreds),
            ("reportProgress", nextProg),
        ]))
    }
}

public let HTTP_INTERCEPTORS = InjectionToken("HTTP_INTERCEPTORS")

public let HttpStatusCode = JSObject([
    ("Continue", 100.0),
    ("SwitchingProtocols", 101.0),
    ("Ok", 200.0),
    ("Created", 201.0),
    ("Accepted", 202.0),
    ("NoContent", 204.0),
    ("MovedPermanently", 301.0),
    ("Found", 302.0),
    ("NotModified", 304.0),
    ("BadRequest", 400.0),
    ("Unauthorized", 401.0),
    ("Forbidden", 403.0),
    ("NotFound", 404.0),
    ("MethodNotAllowed", 405.0),
    ("Conflict", 409.0),
    ("UnprocessableEntity", 422.0),
    ("TooManyRequests", 429.0),
    ("InternalServerError", 500.0),
    ("BadGateway", 502.0),
    ("ServiceUnavailable", 503.0),
    ("GatewayTimeout", 504.0),
])

public func withInterceptors(_ fns: Any?) -> Any? { JSObject([("__kind", "withInterceptors"), ("fns", fns)]) }
public func withInterceptorsFromDi() -> Any? { JSObject([("__kind", "withInterceptorsFromDi")]) }
public func withFetch() -> Any? { JSObject([("__kind", "withFetch")]) }
public func provideHttpClient(_ features: Any?...) -> Any? { JSArray<Any?>() }
public func provideNativeScriptHttpClient(_ features: Any?...) -> Any? { JSArray<Any?>() }
public func provideNativeScriptNgZone() -> Any? { JSArray<Any?>() }
public func provideRouter(_ routes: Any?, _ features: Any?...) -> Any? { JSArray<Any?>() }
public func provideNativeScriptRouter(_ routes: Any?, _ features: Any?...) -> Any? { JSArray<Any?>() }

public final class HttpClientModule {
    nonisolated deinit {}
    public init() {}
    public static func forRoot() -> Any? { JSObject([("ngModule", HttpClientModule.self)]) }
}

// MARK: @angular/router value types

public final class ParamMap {
    nonisolated deinit {}
    private var storage: [String: [String]] = [:]
    private var keyOrder: [String] = []

    public init(_ params: Any? = nil) {
        guard let flat = jsFlat(params) else { return }
        if let dict = flat as? [String: String] {
            for (k, v) in dict {
                keyOrder.append(k)
                storage[k] = [v]
            }
            return
        }
        for k in jsKeysOf(flat) {
            let v = (try? jsGet(flat, k)) ?? nil
            guard !jsIsNullish(v) else { continue }
            keyOrder.append(k)
            if let arr = jsFlat(v) as? JSArrayProtocol {
                storage[k] = arr.jsAnyElements.map { jsToString($0) }
            } else {
                storage[k] = [jsToString(v)]
            }
        }
    }

    public func has(_ name: String) -> Bool {
        storage[name] != nil
    }

    public func get(_ name: String) -> String? {
        storage[name]?.first
    }

    public func getAll(_ name: String) -> JSArray<String> {
        JSArray(storage[name] ?? [])
    }

    public var keys: JSArray<String> {
        JSArray(keyOrder)
    }
}

public func convertToParamMap(_ params: Any?) -> ParamMap {
    ParamMap(params)
}

public final class UrlSegment {
    nonisolated deinit {}
    public let path: String
    public let parameters: JSRecord<String>
    public let parameterMap: ParamMap

    public init(_ path: String, _ parameters: Any? = nil) {
        self.path = path
        var dict: [String: String] = [:]
        if let flat = jsFlat(parameters) {
            if let d = flat as? [String: String] {
                dict = d
            } else {
                for k in jsKeysOf(flat) {
                    if let v = try? jsGet(flat, k), !jsIsNullish(v) {
                        dict[k] = jsToString(v)
                    }
                }
            }
        }
        self.parameters = JSRecord(dict)
        self.parameterMap = ParamMap(dict)
    }

    public func toString() -> String { path }
}

public final class UrlTree {
    nonisolated deinit {}
    private let path: String
    public var queryParams: JSObject
    public var fragment: String?

    public init(_ path: String = "/", _ queryParams: Any? = nil, _ fragment: String? = nil) {
        self.path = path.isEmpty ? "/" : path
        if let obj = jsFlat(queryParams) as? JSObject {
            self.queryParams = obj
        } else if let flat = jsFlat(queryParams) {
            var pairs: [(String, Any?)] = []
            for k in jsKeysOf(flat) {
                pairs.append((k, (try? jsGet(flat, k)) ?? nil))
            }
            self.queryParams = JSObject(pairs)
        } else {
            self.queryParams = JSObject()
        }
        self.fragment = fragment
    }

    public var queryParamMap: ParamMap {
        ParamMap(queryParams)
    }

    public func toString() -> String {
        var qParts: [String] = []
        for k in jsKeysOf(queryParams) {
            if let v = try? jsGet(queryParams, k), !jsIsNullish(v) {
                qParts.append("\(jsEncodeURIComponent(k))=\(jsEncodeURIComponent(jsToString(v)))")
            }
        }
        let q = qParts.isEmpty ? "" : "?\(qParts.joined(separator: "&"))"
        let f = fragment.map { "#\($0)" } ?? ""
        return "\(path)\(q)\(f)"
    }
}

public final class DefaultUrlSerializer {
    nonisolated deinit {}
    public init() {}
    public func parse(_ url: String) -> UrlTree {
        var raw = url.isEmpty ? "/" : url
        var fragment: String? = nil
        if let hashIdx = raw.firstIndex(of: "#") {
            fragment = String(raw[raw.index(after: hashIdx)...])
            raw = String(raw[..<hashIdx])
        }
        var qPairs: [(String, Any?)] = []
        if let qIdx = raw.firstIndex(of: "?") {
            let qStr = String(raw[raw.index(after: qIdx)...])
            raw = String(raw[..<qIdx])
            for part in qStr.split(separator: "&") {
                let s = String(part)
                if s.isEmpty { continue }
                if let eq = s.firstIndex(of: "=") {
                    let k = String(s[..<eq]).removingPercentEncoding ?? String(s[..<eq])
                    let v = String(s[s.index(after: eq)...]).removingPercentEncoding ?? String(s[s.index(after: eq)...])
                    qPairs.append((k, v))
                } else {
                    qPairs.append((s.removingPercentEncoding ?? s, ""))
                }
            }
        }
        return UrlTree(raw.isEmpty ? "/" : raw, JSObject(qPairs), fragment)
    }
    public func serialize(_ tree: UrlTree) -> String {
        tree.toString()
    }
}

public final class ActivatedRouteSnapshot {
    nonisolated deinit {}
    public let params: JSRecord<String>
    public let queryParams: JSRecord<String>
    public let data: JSRecord<Any?>
    public let url: JSArray<UrlSegment>
    public let fragment: String?
    public let outlet: String
    public let routeConfig: JSObject?
    public var title: String?

    public init(
        params: JSRecord<String> = JSRecord([:]),
        queryParams: JSRecord<String> = JSRecord([:]),
        data: JSRecord<Any?> = JSRecord([:]),
        url: JSArray<UrlSegment> = JSArray(),
        fragment: String? = nil,
        outlet: String = "primary",
        routeConfig: JSObject? = nil
    ) {
        self.params = params
        self.queryParams = queryParams
        self.data = data
        self.url = url
        self.fragment = fragment
        self.outlet = outlet
        self.routeConfig = routeConfig
    }

    public var paramMap: ParamMap { ParamMap(params) }
    public var queryParamMap: ParamMap { ParamMap(queryParams) }
    public var root: ActivatedRouteSnapshot { self }
    public var parent: ActivatedRouteSnapshot? { nil }
    public var firstChild: ActivatedRouteSnapshot? { nil }
    public var children: JSArray<ActivatedRouteSnapshot> { JSArray() }
    public var pathFromRoot: JSArray<ActivatedRouteSnapshot> { JSArray([self]) }
}

public final class NavigationStart {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let navigationTrigger: String = "imperative"
    public let restoredState: Any? = nil
    public init(_ id: Double, _ url: String) {
        self.id = id
        self.url = url
    }
}

/// `NavigationEnd`, the router event each completed navigation emits.
public final class NavigationEnd {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let urlAfterRedirects: String
    public init(id: Double, url: String, urlAfterRedirects: String) {
        self.id = id
        self.url = url
        self.urlAfterRedirects = urlAfterRedirects
    }
    public convenience init(_ id: Double, _ url: String, _ urlAfterRedirects: String? = nil) {
        self.init(id: id, url: url, urlAfterRedirects: urlAfterRedirects ?? url)
    }
}

public final class NavigationCancel {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let reason: String
    public init(_ id: Double, _ url: String, _ reason: String = "") {
        self.id = id
        self.url = url
        self.reason = reason
    }
}

public final class NavigationError {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let error: Any?
    public init(_ id: Double, _ url: String, _ error: Any? = nil) {
        self.id = id
        self.url = url
        self.error = error
    }
}

public final class RoutesRecognized {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let urlAfterRedirects: String
    public let state: Any?
    public init(_ id: Double, _ url: String, _ urlAfterRedirects: String? = nil, _ state: Any? = nil) {
        self.id = id
        self.url = url
        self.urlAfterRedirects = urlAfterRedirects ?? url
        self.state = state
    }
}

public final class ResolveStart {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let urlAfterRedirects: String
    public let state: Any?
    public init(_ id: Double, _ url: String, _ urlAfterRedirects: String? = nil, _ state: Any? = nil) {
        self.id = id
        self.url = url
        self.urlAfterRedirects = urlAfterRedirects ?? url
        self.state = state
    }
}

public final class ResolveEnd {
    nonisolated deinit {}
    public let id: Double
    public let url: String
    public let urlAfterRedirects: String
    public let state: Any?
    public init(_ id: Double, _ url: String, _ urlAfterRedirects: String? = nil, _ state: Any? = nil) {
        self.id = id
        self.url = url
        self.urlAfterRedirects = urlAfterRedirects ?? url
        self.state = state
    }
}

public func createRouterStateSnapshot(_ url: String = "/") -> JSObject {
    JSObject([("url", url), ("root", ActivatedRouteSnapshot())])
}

// MARK: @angular/forms

public final class Validators {
    nonisolated deinit {}
    public init() {}

    public static func required(_ control: Any?) -> Any? {
        let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
        if jsIsNullish(v) { return JSObject([("required", true)]) }
        if let s = v as? String, s.isEmpty { return JSObject([("required", true)]) }
        if let arr = jsFlat(v) as? JSArrayProtocol, arr.jsAnyElements.isEmpty { return JSObject([("required", true)]) }
        return nil
    }

    public static func requiredTrue(_ control: Any?) -> Any? {
        let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
        return (jsFlat(v) as? Bool) == true ? nil : JSObject([("required", true)])
    }

    public static func minLength(_ minLength: Double) -> (Any?) -> Any? {
        return { control in
            let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
            if jsIsNullish(v) { return nil }
            let len: Int
            if let s = v as? String {
                len = s.count
            } else if let arr = jsFlat(v) as? JSArrayProtocol {
                len = arr.jsAnyElements.count
            } else {
                return nil
            }
            if len == 0 { return nil }
            return Double(len) < minLength
                ? JSObject([("minlength", JSObject([("requiredLength", minLength), ("actualLength", Double(len))]))])
                : nil
        }
    }

    public static func maxLength(_ maxLength: Double) -> (Any?) -> Any? {
        return { control in
            let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
            if jsIsNullish(v) { return nil }
            let len: Int
            if let s = v as? String {
                len = s.count
            } else if let arr = jsFlat(v) as? JSArrayProtocol {
                len = arr.jsAnyElements.count
            } else {
                return nil
            }
            return Double(len) > maxLength
                ? JSObject([("maxlength", JSObject([("requiredLength", maxLength), ("actualLength", Double(len))]))])
                : nil
        }
    }

    public static func min(_ minVal: Double) -> (Any?) -> Any? {
        return { control in
            let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
            if jsIsNullish(v) || (v as? String) == "" { return nil }
            let num = jsToNumber(v)
            return !num.isNaN && num < minVal
                ? JSObject([("min", JSObject([("min", minVal), ("actual", v)]))])
                : nil
        }
    }

    public static func max(_ maxVal: Double) -> (Any?) -> Any? {
        return { control in
            let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
            if jsIsNullish(v) || (v as? String) == "" { return nil }
            let num = jsToNumber(v)
            return !num.isNaN && num > maxVal
                ? JSObject([("max", JSObject([("max", maxVal), ("actual", v)]))])
                : nil
        }
    }

    public static func pattern(_ pattern: Any?) -> (Any?) -> Any? {
        return { control in
            let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
            guard let s = v as? String, !s.isEmpty else { return nil }
            if let rx = jsFlat(pattern) as? JSRegExp {
                return rx.test(s) ? nil : JSObject([("pattern", JSObject([("requiredPattern", rx.source), ("actualValue", s)]))])
            }
            let patStr = jsToString(pattern)
            let anchored = (patStr.hasPrefix("^") ? "" : "^") + patStr + (patStr.hasSuffix("$") ? "" : "$")
            let ok = (try? JSRegExp(anchored))?.test(s) ?? false
            return ok ? nil : JSObject([("pattern", JSObject([("requiredPattern", anchored), ("actualValue", s)]))])
        }
    }

    public static func email(_ control: Any?) -> Any? {
        let v = (jsFlat(control) as? AbstractControl)?.value ?? (try? jsGet(control, "value")) ?? nil
        guard let s = v as? String, !s.isEmpty else { return nil }
        let ok = (try? JSRegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))?.test(s) ?? false
        return ok ? nil : JSObject([("email", true)])
    }

    public static func nullValidator(_ control: Any?) -> Any? { nil }

    public static func compose(_ validators: Any?) -> ((Any?) -> Any?)? {
        guard let arr = jsFlat(validators) as? JSArrayProtocol else { return nil }
        let fns = arr.jsAnyElements.compactMap { jsFlat($0) }
        if fns.isEmpty { return nil }
        return { control in
            var merged: [(String, Any?)] = []
            for fn in fns {
                if let res = Injector.runValidator(fn, control), !jsIsNullish(res) {
                    for k in jsKeysOf(res) {
                        merged.append((k, (try? jsGet(res, k)) ?? nil))
                    }
                }
            }
            return merged.isEmpty ? nil : JSObject(merged)
        }
    }
}

extension Injector {
    fileprivate static func runValidator(_ fn: Any?, _ control: Any?) -> Any? {
        guard let flat = jsFlat(fn) else { return nil }
        if let vfn = flat as? (Any?) -> Any? { return vfn(control) }
        if let vfn = flat as? (Any?) throws -> Any? { return jsReported { try vfn(control) } ?? nil }
        return jsReported { try jsCall(flat, control) } ?? nil
    }
}

open class AbstractControl {
    nonisolated deinit {}
    public var value: Any?
    public var errors: JSObject? = nil
    public var pristine: Bool = true
    public var touched: Bool = false
    public private(set) var status: String = "VALID"
    public let valueChanges = Emitter<Any?>()
    public let statusChanges = Emitter<String>()
    fileprivate var validators: [Any] = []

    public init(_ value: Any? = nil, _ validatorOrOpts: Any? = nil) {
        self.value = value
        self.validators = AbstractControl.extractValidators(validatorOrOpts)
    }

    fileprivate static func extractValidators(_ validatorOrOpts: Any?) -> [Any] {
        guard let flat = jsFlat(validatorOrOpts) else { return [] }
        if let arr = flat as? JSArrayProtocol {
            return arr.jsAnyElements.compactMap { jsFlat($0) }
        }
        if let dyn = flat as? JSDynamic, jsHasKey(dyn, "validators") || (dyn as? JSObject)?.has("validators") == true {
            return extractValidators(dyn[jsKey: "validators"])
        }
        return [flat]
    }

    public var dirty: Bool { !pristine }
    public var untouched: Bool { !touched }
    public var valid: Bool { status == "VALID" }
    public var invalid: Bool { status == "INVALID" }
    public var disabled: Bool { status == "DISABLED" }
    public var enabled: Bool { status != "DISABLED" }

    open func setValue(_ val: Any?, _ options: Any? = nil) {
        value = val
        updateValueAndValidity(options)
    }

    open func patchValue(_ val: Any?, _ options: Any? = nil) {
        setValue(val, options)
    }

    open func reset(_ val: Any? = nil, _ options: Any? = nil) {
        pristine = true
        touched = false
        setValue(val, options)
    }

    public func markAsTouched(_ opts: Any? = nil) { touched = true }
    public func markAllAsTouched() { markAsTouched() }
    public func markAsUntouched(_ opts: Any? = nil) { touched = false }
    public func markAsDirty(_ opts: Any? = nil) { pristine = false }
    public func markAsPristine(_ opts: Any? = nil) { pristine = true }

    public func disable(_ opts: Any? = nil) {
        status = "DISABLED"
        errors = nil
        if (try? jsGet(opts, "emitEvent")) as? Bool != false {
            statusChanges.emit(status)
        }
    }

    public func enable(_ opts: Any? = nil) {
        status = "VALID"
        updateValueAndValidity(opts)
    }

    public func setValidators(_ newValidator: Any?) {
        validators = AbstractControl.extractValidators(newValidator)
    }

    public func addValidators(_ newValidators: Any?) {
        validators.append(contentsOf: AbstractControl.extractValidators(newValidators))
    }

    public func clearValidators() {
        validators.removeAll()
    }

    public func setErrors(_ errs: Any?, _ opts: Any? = nil) {
        if let obj = jsFlat(errs) as? JSObject, !jsKeysOf(obj).isEmpty {
            errors = obj
            status = "INVALID"
        } else if let flat = jsFlat(errs), !jsKeysOf(flat).isEmpty {
            var pairs: [(String, Any?)] = []
            for k in jsKeysOf(flat) { pairs.append((k, (try? jsGet(flat, k)) ?? nil)) }
            errors = JSObject(pairs)
            status = "INVALID"
        } else {
            errors = nil
            if status != "DISABLED" { status = "VALID" }
        }
        if (try? jsGet(opts, "emitEvent")) as? Bool != false {
            statusChanges.emit(status)
        }
    }

    public func hasError(_ errorCode: String, _ path: Any? = nil) -> Bool {
        getError(errorCode, path) != nil
    }

    public func getError(_ errorCode: String, _ path: Any? = nil) -> Any? {
        let target: AbstractControl? = !jsIsNullish(path) ? get(path) : self
        guard let errs = target?.errors else { return nil }
        return errs.has(errorCode) ? errs[jsKey: errorCode] : nil
    }

    open func get(_ path: Any?) -> AbstractControl? { nil }

    open func getRawValue() -> Any? { value }

    open func updateValueAndValidity(_ opts: Any? = nil) {
        if status == "DISABLED" { return }
        var merged: [(String, Any?)] = []
        for fn in validators {
            if let res = Injector.runValidator(fn, self), !jsIsNullish(res) {
                for k in jsKeysOf(res) {
                    merged.append((k, (try? jsGet(res, k)) ?? nil))
                }
            }
        }
        if merged.isEmpty {
            errors = nil
            status = "VALID"
        } else {
            errors = JSObject(merged)
            status = "INVALID"
        }
        if (try? jsGet(opts, "emitEvent")) as? Bool != false {
            valueChanges.emit(value)
            statusChanges.emit(status)
        }
    }
}

public final class FormControl: AbstractControl {
    nonisolated deinit {}
    public let defaultValue: Any?

    public override init(_ formState: Any? = nil, _ validatorOrOpts: Any? = nil) {
        var initVal = formState
        var initDisabled = false
        if let flat = jsFlat(formState) as? JSDynamic, !(flat is JSArrayProtocol),
           jsHasKey(flat, "value") || (flat as? JSObject)?.has("value") == true {
            initVal = flat[jsKey: "value"]
            initDisabled = jsTruthy(flat[jsKey: "disabled"])
        }
        self.defaultValue = initVal
        super.init(initVal, validatorOrOpts)
        if initDisabled {
            disable(JSObject([("emitEvent", false)]))
        } else {
            updateValueAndValidity(JSObject([("emitEvent", false)]))
        }
    }

    public override func reset(_ formState: Any? = nil, _ options: Any? = nil) {
        var next = formState ?? defaultValue
        if let flat = jsFlat(formState) as? JSDynamic, !(flat is JSArrayProtocol),
           jsHasKey(flat, "value") || (flat as? JSObject)?.has("value") == true {
            next = flat[jsKey: "value"]
            if jsTruthy(flat[jsKey: "disabled"]) {
                disable(JSObject([("emitEvent", false)]))
            } else {
                enable(JSObject([("emitEvent", false)]))
            }
        }
        super.reset(next, options)
    }
}

public final class FormGroup: AbstractControl {
    nonisolated deinit {}
    public var controls: JSObject

    public override init(_ controls: Any? = nil, _ validatorOrOpts: Any? = nil) {
        var pairs: [(String, Any?)] = []
        var valPairs: [(String, Any?)] = []
        if let flat = jsFlat(controls) {
            for k in jsKeysOf(flat) {
                let c = (try? jsGet(flat, k)) ?? nil
                pairs.append((k, c))
                if let ctrl = jsFlat(c) as? AbstractControl {
                    valPairs.append((k, ctrl.value))
                }
            }
        }
        self.controls = JSObject(pairs)
        super.init(JSObject(valPairs), validatorOrOpts)
        updateValueAndValidity(JSObject([("emitEvent", false)]))
    }

    public override func get(_ path: Any?) -> AbstractControl? {
        if let arr = jsFlat(path) as? JSArrayProtocol {
            var cur: AbstractControl? = self
            for part in arr.jsAnyElements {
                cur = cur?.get(part)
            }
            return cur
        }
        let key = jsToString(path)
        if key.contains(".") {
            var cur: AbstractControl? = self
            for part in key.split(separator: ".") {
                cur = cur?.get(String(part))
            }
            return cur
        }
        return jsFlat(controls[jsKey: key]) as? AbstractControl
    }

    public func registerControl(_ name: String, _ control: AbstractControl) -> AbstractControl {
        controls[jsKey: name] = control
        return control
    }

    public func addControl(_ name: String, _ control: AbstractControl, _ options: Any? = nil) {
        controls[jsKey: name] = control
        updateValueAndValidity(options)
    }

    public func removeControl(_ name: String, _ options: Any? = nil) {
        _ = controls.delete(name)
        updateValueAndValidity(options)
    }

    public func setControl(_ name: String, _ control: AbstractControl, _ options: Any? = nil) {
        controls[jsKey: name] = control
        updateValueAndValidity(options)
    }

    public func contains(_ controlName: String) -> Bool {
        guard let c = jsFlat(controls[jsKey: controlName]) as? AbstractControl else { return false }
        return c.enabled
    }

    public override func setValue(_ val: Any?, _ options: Any? = nil) {
        if let flat = jsFlat(val) {
            for k in jsKeysOf(controls) {
                if let ctrl = jsFlat(controls[jsKey: k]) as? AbstractControl {
                    ctrl.setValue((try? jsGet(flat, k)) ?? nil, JSObject([("emitEvent", false)]))
                }
            }
        }
        updateValueAndValidity(options)
    }

    public override func patchValue(_ val: Any?, _ options: Any? = nil) {
        if let flat = jsFlat(val) {
            for k in jsKeysOf(flat) {
                if let ctrl = jsFlat(controls[jsKey: k]) as? AbstractControl {
                    ctrl.patchValue((try? jsGet(flat, k)) ?? nil, JSObject([("emitEvent", false)]))
                }
            }
        }
        updateValueAndValidity(options)
    }

    public override func reset(_ val: Any? = nil, _ options: Any? = nil) {
        let flat = jsFlat(val)
        for k in jsKeysOf(controls) {
            if let ctrl = jsFlat(controls[jsKey: k]) as? AbstractControl {
                ctrl.reset(flat != nil ? ((try? jsGet(flat, k)) ?? nil) : nil, JSObject([("emitEvent", false)]))
            }
        }
        pristine = true
        touched = false
        updateValueAndValidity(options)
    }

    public override func getRawValue() -> Any? {
        var pairs: [(String, Any?)] = []
        for k in jsKeysOf(controls) {
            if let ctrl = jsFlat(controls[jsKey: k]) as? AbstractControl {
                pairs.append((k, ctrl.getRawValue()))
            }
        }
        return JSObject(pairs)
    }

    public override func updateValueAndValidity(_ opts: Any? = nil) {
        var valPairs: [(String, Any?)] = []
        var childInvalid = false
        for k in jsKeysOf(controls) {
            if let ctrl = jsFlat(controls[jsKey: k]) as? AbstractControl {
                if ctrl.enabled {
                    valPairs.append((k, ctrl.value))
                    if ctrl.invalid { childInvalid = true }
                }
            }
        }
        value = JSObject(valPairs)
        super.updateValueAndValidity(JSObject([("emitEvent", false)]))
        if childInvalid && status == "VALID" {
            // Preserve group-level errors while reflecting child invalidity.
            setErrors(errors ?? JSObject([("__childInvalid", true)]), JSObject([("emitEvent", false)]))
            if let errs = errors, errs.has("__childInvalid"), jsKeysOf(errs).count == 1 {
                errors = nil
            }
        }
        if (try? jsGet(opts, "emitEvent")) as? Bool != false {
            valueChanges.emit(value)
            statusChanges.emit(status)
        }
    }
}

public final class FormArray: AbstractControl {
    nonisolated deinit {}
    public var controls: JSArray<AbstractControl>

    public override init(_ controls: Any? = nil, _ validatorOrOpts: Any? = nil) {
        var list: [AbstractControl] = []
        if let arr = jsFlat(controls) as? JSArrayProtocol {
            list = arr.jsAnyElements.compactMap { jsFlat($0) as? AbstractControl }
        }
        self.controls = JSArray(list)
        super.init(JSArray(list.map { $0.value }), validatorOrOpts)
        updateValueAndValidity(JSObject([("emitEvent", false)]))
    }

    public var length: Double { Double(controls.storage.count) }

    public func at(_ index: Double) -> AbstractControl {
        let i = Int(index)
        return i >= 0 && i < controls.storage.count ? controls.storage[i] : FormControl()
    }

    public func push(_ control: AbstractControl, _ options: Any? = nil) {
        controls.storage.append(control)
        updateValueAndValidity(options)
    }

    public func insert(_ index: Double, _ control: AbstractControl, _ options: Any? = nil) {
        let i = max(0, min(Int(index), controls.storage.count))
        controls.storage.insert(control, at: i)
        updateValueAndValidity(options)
    }

    public func removeAt(_ index: Double, _ options: Any? = nil) {
        let i = Int(index)
        if i >= 0 && i < controls.storage.count {
            controls.storage.remove(at: i)
            updateValueAndValidity(options)
        }
    }

    public func clear(_ options: Any? = nil) {
        controls.storage.removeAll()
        updateValueAndValidity(options)
    }

    public override func getRawValue() -> Any? {
        JSArray(controls.storage.map { $0.getRawValue() })
    }

    public override func updateValueAndValidity(_ opts: Any? = nil) {
        value = JSArray(controls.storage.filter { $0.enabled }.map { $0.value })
        super.updateValueAndValidity(opts)
    }
}

public final class FormBuilder: JSInjectableType {
    nonisolated deinit {}
    public static let shared = FormBuilder()
    public static var jsSharedInstance: Any? { shared }
    public static func jsConstruct() throws -> Any? { FormBuilder() }
    public var nonNullable: FormBuilder { self }

    public init() {}

    public func control(_ formState: Any? = nil, _ validatorOrOpts: Any? = nil) -> FormControl {
        FormControl(formState, validatorOrOpts)
    }

    public func group(_ controlsConfig: Any?, _ options: Any? = nil) -> FormGroup {
        var built: [(String, Any?)] = []
        if let flat = jsFlat(controlsConfig) {
            for k in jsKeysOf(flat) {
                let raw = (try? jsGet(flat, k)) ?? nil
                if let ctrl = jsFlat(raw) as? AbstractControl {
                    built.append((k, ctrl))
                } else if let arr = jsFlat(raw) as? JSArrayProtocol {
                    let elems = arr.jsAnyElements
                    let state = elems.first ?? nil
                    let validator = elems.count > 1 ? elems[1] : nil
                    built.append((k, FormControl(state, validator)))
                } else {
                    built.append((k, FormControl(raw)))
                }
            }
        }
        return FormGroup(JSObject(built), options)
    }

    public func record(_ controlsConfig: Any?, _ options: Any? = nil) -> FormGroup {
        group(controlsConfig, options)
    }

    public func array(_ controlsConfig: Any?, _ validatorOrOpts: Any? = nil) -> FormArray {
        var list: [AbstractControl] = []
        if let arr = jsFlat(controlsConfig) as? JSArrayProtocol {
            for item in arr.jsAnyElements {
                if let ctrl = jsFlat(item) as? AbstractControl {
                    list.append(ctrl)
                } else {
                    list.append(FormControl(item))
                }
            }
        }
        return FormArray(JSArray(list), validatorOrOpts)
    }
}

public func bootstrapApplication(_ rootComponent: Any?, _ options: Any? = nil) -> JSPromise<ApplicationRef> {
    if let providers = try? jsGet(options, "providers"), !jsIsNullish(providers) {
        Injector.register(providers)
    }
    return JSPromise.resolve(ApplicationRef.shared)
}

public func runNativeScriptAngularApp(_ options: Any? = nil) {
    if let fn = jsFlat((try? jsGet(options, "appModuleBootstrap")) ?? nil) {
        if let zero = fn as? () throws -> Any? {
            jsReport { _ = try zero() }
        } else if let zero = fn as? () -> Void {
            zero()
        } else {
            jsReport { _ = try jsCall(fn, spread: []) }
        }
    }
}

