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

/// A binding as Angular checks it (`bindingUpdated`): re-read on every check,
/// applied only when the value is not `Object.is` the last one applied.
public func Check<T>(_ read: @escaping () -> T, _ apply: @escaping (T) -> Void) {
    var last: T?
    Effect {
        let value = read()
        if let previous = last, jsSameValue(previous, value) { return }
        last = value
        untrack { apply(value) }
    }
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
