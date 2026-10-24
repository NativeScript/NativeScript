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
 * A binding as Angular checks it (`bindingUpdated`): re-read on every check of its view,
 * applied only when the value is not `Object.is` the last one applied.
 */
fun <T> Check(read: () -> T, apply: (T) -> Unit) {
    var last: Any? = UNCHECKED
    val effect = Effect {
        val value = read()
        if (last !== UNCHECKED && jsSameValue(last, value)) return@Effect
        last = value
        untrack { apply(value) }
    }
    EffectOrder.current.view?.add(effect)
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

/**
 * A pure Angular pipe at one binding site (`ɵɵpipeBind1`…): `transform` runs when an argument is no longer
 * `Object.is` the one it last ran with, and otherwise the result it gave is returned. What it throws is not kept.
 */
class PurePipeCache {
    private var arguments: List<Any?>? = null
    private var result: Any? = null

    @Suppress("UNCHECKED_CAST")
    private inline fun <R> run(given: List<Any?>, transform: () -> R): R {
        val last = arguments
        if (last != null && last.size == given.size && last.indices.all { jsSameValue(last[it], given[it]) }) return result as R
        val value = transform()
        arguments = given
        result = value
        return value
    }

    fun <A, R> pure1(a: A, transform: (A) -> R): R = run(listOf(a)) { transform(a) }
    fun <A, B, R> pure2(a: A, b: B, transform: (A, B) -> R): R = run(listOf(a, b)) { transform(a, b) }
    fun <A, B, C, R> pure3(a: A, b: B, c: C, transform: (A, B, C) -> R): R = run(listOf(a, b, c)) { transform(a, b, c) }
    fun <A, B, C, D, R> pure4(a: A, b: B, c: C, d: D, transform: (A, B, C, D) -> R): R = run(listOf(a, b, c, d)) { transform(a, b, c, d) }
    fun <A, B, C, D, E, R> pure5(a: A, b: B, c: C, d: D, e: E, transform: (A, B, C, D, E) -> R): R = run(listOf(a, b, c, d, e)) { transform(a, b, c, d, e) }
}

/**
 * `inject(ChangeDetectorRef)`: the view being created when it is injected (a component's, or the embedded view a pipe is
 * in). `markForCheck` marks it and the views above it dirty and schedules the update that re-checks them; with zone.js
 * the tick after every task checks every view, so it has nothing to add.
 */
class ChangeDetectorRef internal constructor(private val view: AngularView?) {
    fun markForCheck() {
        if (!Zone.enabled) Reactivity.markForCheck(view)
    }

    /** Checks the view now: its bindings and the views above it, which is more than Angular checks and gives the same values. */
    fun detectChanges() {
        if (Zone.enabled) Zone.tick() else Reactivity.markForCheck(view, now = true)
    }

    fun detach() {}
    fun reattach() {}
    fun checkNoChanges() {}

    companion object {
        fun current(): ChangeDetectorRef = ChangeDetectorRef(EffectOrder.current.view)
    }
}
