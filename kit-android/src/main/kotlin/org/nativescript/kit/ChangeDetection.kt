package org.nativescript.kit

/**
 * Angular's zone-based change detection: after every JavaScript task (an
 * event handler, a timer callback, a promise job) and the jobs it queued,
 * `ApplicationRef.tick()` re-reads every binding in view order and applies
 * the ones whose value changed. In a zone app every effect is a binding
 * re-run on each tick, in its `EffectOrder` key order, which is that order.
 */
object Zone {
    var enabled = false
        set(value) {
            field = value
            Microtasks.onStable = if (value) ({ tick() }) else null
            Effect.created = if (value) ({ effects.add(it) }) else null
        }

    /** Held until disposed: a binding reads no signal that would keep it alive. */
    private val effects = mutableListOf<Effect>()

    fun tick() {
        effects.removeAll { it.disposed }
        val live = effects.toList()
        batch { for (effect in live) effect.invalidate() }
    }
}

/**
 * A binding as Angular checks it (`bindingUpdated`): re-read on every check,
 * applied only when the value is not `Object.is` the last one applied.
 */
fun <T> Check(read: () -> T, apply: (T) -> Unit) {
    var last: Any? = UNCHECKED
    Effect {
        val value = read()
        if (last !== UNCHECKED && jsSameValue(last, value)) return@Effect
        last = value
        untrack { apply(value) }
    }
}

private val UNCHECKED = Any()

/**
 * Vue's `watch`: `changed` runs with the new and old value when `source`'s
 * value is no longer `Object.is` the last one, and at once when `immediate`
 * (old undefined); what `changed` reads is not tracked.
 */
fun <T> Watch(immediate: Boolean, source: () -> T, changed: (T, T?) -> Unit) {
    var last: T? = null
    var started = false
    Effect {
        val value = source()
        val old = last
        last = value
        if (!started) {
            started = true
            if (immediate) untrack { changed(value, null) }
            return@Effect
        }
        if (jsSameValue(old, value)) return@Effect
        untrack { changed(value, old) }
    }
}

private var users = 0

/** Svelte's `$effect`: after every template effect a write invalidates, in creation order. */
fun <T> EffectOrder.user(body: () -> T): T = EffectOrder.run(EffectOrder.Scope(listOf(Int.MAX_VALUE, ++users)), body)
