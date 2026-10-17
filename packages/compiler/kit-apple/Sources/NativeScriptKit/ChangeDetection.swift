import Foundation

/// Angular's zone-based change detection: after every JavaScript task (an
/// event handler, a timer callback, a promise job) and the jobs it queued,
/// `ApplicationRef.tick()` re-reads every binding in view order and applies
/// the ones whose value changed. In a zone app every effect is a binding
/// re-run on each tick, in its `EffectOrder` key order, which is that order.
public enum Zone {
    public static var enabled = false {
        didSet {
            Microtasks.onStable = enabled ? { tick() } : nil
            Effect.created = enabled ? { effects.append($0) } : nil
        }
    }

    /// Held until disposed: a binding reads no signal that would keep it alive.
    private static var effects: [Effect] = []

    public static func tick() {
        effects.removeAll { $0.disposed }
        let live = effects
        batch { for effect in live { effect.invalidate() } }
    }
}

/// A binding as Angular checks it (`bindingUpdated`): re-read on every check of its view,
/// applied only when the value is not `Object.is` the last one applied; what reading it
/// throws is reported, and nothing is applied.
public func Check<T>(_ read: @escaping () throws -> T, _ apply: @escaping (T) -> Void) {
    var last: T?
    let effect = Effect {
        guard let value = jsReported(read) else { return }
        if let previous = last, jsSameValue(previous, value) { return }
        last = value
        untrack { apply(value) }
    }
    EffectOrder.current.view?.add(effect)
}

/// Vue's `watch`: `changed` runs with the new and old value when `source`'s
/// value is no longer `Object.is` the last one, and at once when `immediate`
/// (old undefined); what `changed` reads is not tracked.
public func Watch<T>(immediate: Bool, _ source: @escaping () -> T, _ changed: @escaping (T, T?) -> Void) {
    var last: T?
    var started = false
    Effect {
        let value = source()
        let old = last
        last = value
        if !started {
            started = true
            if immediate { untrack { changed(value, nil) } }
            return
        }
        if let old, jsSameValue(old, value) { return }
        untrack { changed(value, old) }
    }
}

extension EffectOrder {
    private static var users = 0

    /// Svelte's `$effect`: after every template effect a write invalidates, in creation order.
    public static func user<T>(_ body: () -> T) -> T {
        users += 1
        return run(Scope(prefix: [Int.max, users]), body)
    }
}

/// A pure Angular pipe at one binding site (`ɵɵpipeBind1`…): `transform` runs when an argument is no longer
/// `Object.is` the one it last ran with, and otherwise the result it gave is returned. What it throws is not kept.
public final class PurePipeCache {
    nonisolated deinit {}
    private var arguments: [Any?]?
    private var result: AnyObject?

    private final class Kept<R> {
        let value: R
        init(_ value: R) { self.value = value }
    }

    public init() {}

    private func run<R>(_ given: [Any?], _ transform: () throws -> R) rethrows -> R {
        if let arguments, arguments.count == given.count, zip(arguments, given).allSatisfy({ jsSameValue($0, $1) }), let kept = result as? Kept<R> {
            return kept.value
        }
        let value = try transform()
        arguments = given
        result = Kept(value)
        return value
    }

    public func pure1<A, R>(_ a: A, _ transform: (A) throws -> R) rethrows -> R { try run([a]) { try transform(a) } }
    public func pure2<A, B, R>(_ a: A, _ b: B, _ transform: (A, B) throws -> R) rethrows -> R { try run([a, b]) { try transform(a, b) } }
    public func pure3<A, B, C, R>(_ a: A, _ b: B, _ c: C, _ transform: (A, B, C) throws -> R) rethrows -> R { try run([a, b, c]) { try transform(a, b, c) } }
    public func pure4<A, B, C, D, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ transform: (A, B, C, D) throws -> R) rethrows -> R { try run([a, b, c, d]) { try transform(a, b, c, d) } }
    public func pure5<A, B, C, D, E, R>(_ a: A, _ b: B, _ c: C, _ d: D, _ e: E, _ transform: (A, B, C, D, E) throws -> R) rethrows -> R { try run([a, b, c, d, e]) { try transform(a, b, c, d, e) } }
}

/// `inject(ChangeDetectorRef)`: the view being created when it is injected (a component's, or the embedded view a
/// pipe is in). `markForCheck` marks it and the views above it dirty and schedules the update that re-checks them;
/// with zone.js the tick after every task checks every view, so it has nothing to add.
public final class ChangeDetectorRef {
    nonisolated deinit {}
    private weak var view: AngularView?

    init(_ view: AngularView?) { self.view = view }

    public static func current() -> ChangeDetectorRef { ChangeDetectorRef(EffectOrder.current.view) }

    public func markForCheck() {
        if Zone.enabled { return }
        Reactivity.markForCheck(view)
    }

    /// Checks the view now: its bindings and the views above it, which is more than Angular checks and gives the same values.
    public func detectChanges() {
        if Zone.enabled { Zone.tick(); return }
        Reactivity.markForCheck(view, now: true)
    }

    public func detach() {}
    public func reattach() {}
    public func checkNoChanges() {}
}
