package org.nativescript.kit

// Fine-grained reactivity, the model Angular signals, Vue refs, Solid
// signals and Svelte runes share: a read inside an effect subscribes it, a
// write re-runs exactly the effects that read the value. Compiled templates
// bind each native property through one effect, so nothing is diffed.
// Main thread only; effects re-run on the app's framework's schedule (`Reactivity`).

/** A scope that owns effects and cleanups: a component instance, a branch of an `if`, a row of a `for`. */
class Owner(parent: Owner? = current) {
    internal val effects = mutableListOf<Effect>()
    private val children = mutableListOf<Owner>()
    private val cleanups = mutableListOf<() -> Unit>()
    private var disposed = false

    init {
        parent?.children?.add(this)
    }

    /** Runs `body` with this owner current: effects it creates belong here. */
    fun <T> run(body: () -> T): T {
        val previous = current
        current = this
        try {
            return body()
        } finally {
            current = previous
        }
    }

    fun onCleanup(cleanup: () -> Unit) {
        cleanups.add(cleanup)
    }

    fun dispose() {
        if (disposed) return
        disposed = true
        for (child in children) child.dispose()
        for (effect in effects) effect.dispose()
        for (cleanup in cleanups.asReversed()) cleanup()
        children.clear(); effects.clear(); cleanups.clear()
    }

    companion object {
        var current: Owner? = null
            private set
    }
}

interface Subscriber {
    fun invalidate()
}

interface Source {
    fun unsubscribe(subscriber: Subscriber)
}

private var currentEffect: Effect? = null
private var batchDepth = 0
private var eventDepth = 0
private var queue = mutableListOf<Effect>()
/** Derived values whose sources changed: they settle before the bindings re-run. */
private var derivedQueue = mutableListOf<Effect>()
private var flushing = false
private var flushScheduled = false
/** What `nextTick()` returned while an update was scheduled, settled after it. */
private var flushedPromise: JSResolvers<Unit>? = null
/** Angular, in the microtask checkpoint after an update: updates are scheduled in a microtask. */
private var afterUpdate = false
/** Signals whose readers outside an owner see the value they had before the writes. */
private val holding = mutableListOf<Signal<*>>()

/** When the effects a write invalidates re-run: the app's framework's update schedule. */
object Reactivity {
    enum class Schedule {
        /** At once: React's legacy root commits each `setState` synchronously. */
        NOW,
        /** In a microtask queued by the first write: Vue's `queueFlush`, Svelte's `schedule_update`, Solid's `schedule`. */
        MICROTASK,
        /**
         * In a zero-delay timer, Angular's zoneless `scheduleCallbackWithRafRace` (its `setTimeout` comes
         * before NativeScript's next-frame `requestAnimationFrame`); in a microtask during the checkpoint
         * that follows an update (`switchToMicrotaskScheduler`).
         */
        TASK,
        /** When the event being handled returns, otherwise in a microtask: Octane's discrete event scope. */
        EVENT,
    }

    var schedule = Schedule.NOW

    /** Vue's `nextTick()`: settles once the scheduled update has run, or now. */
    fun nextTick(): JSPromise<Unit> {
        if (!flushScheduled) return JSPromise.resolve(Unit)
        val flushed = flushedPromise ?: JSPromise.pending<Unit>().second.also { flushedPromise = it }
        return flushed.promise
    }

    /** Svelte's `tick()`: schedules an update and returns a settled promise, whose reactions follow it. */
    fun tick(): JSPromise<Unit> {
        scheduleFlush()
        return JSPromise.resolve(Unit)
    }

    /**
     * An event handler of a template. Angular's listener marks its view dirty, so an update follows
     * every event; Octane updates when the handler returns; React and Octane handlers read the state
     * of the render that made them (`stateSignal`) until they return.
     */
    fun event(handler: () -> Unit) {
        if (schedule == Schedule.TASK) scheduleFlush()
        eventDepth += 1
        try {
            handler()
        } finally {
            eventDepth -= 1
        }
        if (eventDepth == 0 && schedule != Schedule.TASK) flush()
    }
}

/** Groups writes so each affected effect runs once, after the last write. */
fun batch(body: () -> Unit) {
    batchDepth += 1
    body()
    batchDepth -= 1
    if (batchDepth == 0) flush()
}

private fun scheduleFlush() {
    if (flushScheduled || flushing) return
    when {
        Reactivity.schedule == Reactivity.Schedule.NOW -> flush()
        Reactivity.schedule == Reactivity.Schedule.EVENT && eventDepth > 0 -> {}
        Reactivity.schedule == Reactivity.Schedule.TASK && !afterUpdate -> {
            flushScheduled = true
            jsSetTimeout(::scheduledFlush, 0.0)
        }
        else -> {
            flushScheduled = true
            Microtasks.enqueue(::scheduledFlush)
        }
    }
}

private fun scheduledFlush() {
    flushScheduled = false
    flush()
    if (Reactivity.schedule == Reactivity.Schedule.TASK && !afterUpdate) {
        afterUpdate = true
        Microtasks.enqueue { afterUpdate = false }
    }
    flushedPromise?.let {
        flushedPromise = null
        it.resolve(Unit)
    }
}

private fun flush() {
    if (flushing) return
    flushing = true
    try {
        if (eventDepth == 0 && holding.isNotEmpty()) {
            for (signal in holding) signal.release()
            holding.clear()
        }
        while (queue.isNotEmpty() || derivedQueue.isNotEmpty()) {
            while (derivedQueue.isNotEmpty()) {
                val derived = derivedQueue.sortedWith { a, b -> EffectOrder.compare(a.key, b.key) }
                derivedQueue = mutableListOf()
                for (effect in derived) effect.runIfStale()
            }
            val pending = queue.sortedWith { a, b -> EffectOrder.compare(a.key, b.key) }
            queue = mutableListOf()
            for (effect in pending) effect.runIfStale()
        }
    } finally {
        flushing = false
    }
}

/**
 * The order a framework commits its bindings in, as a key per effect: the
 * effects a write invalidates re-run in key order (lexicographic). An effect
 * takes the next key of the scope it is created in; while it runs, effects it
 * creates (a branch, a row) are keyed under its own key. Compiled templates
 * create their binding effects in their framework's order and open scopes where
 * its order is not the template's: Vue and Svelte update each component after
 * the one that created it, Angular a view's embedded views and then its child
 * components after the view's own bindings, Solid a deeper template after
 * every shallower one.
 */
object EffectOrder {
    class Scope internal constructor(private val prefix: List<Int>, internal val height: Int? = null) {
        /** Next key for: the scope's own effects, embedded views, child views. */
        private val counters = intArrayOf(0, 0, 0)

        internal fun next(phase: Int): List<Int> {
            if (height != null) return listOf(height, ++solidCount)
            return prefix + listOf(phase, counters[phase]++)
        }
    }

    var current = Scope(emptyList())
        private set
    private var components = 0
    private var solidCount = 0
    /** Derived values settle in the order they were declared. */
    private var derived = 0

    internal fun key(): List<Int> = current.next(0)

    internal fun derivedKey(): List<Int> = listOf(++derived)

    internal fun compare(a: List<Int>, b: List<Int>): Int {
        for (i in 0 until minOf(a.size, b.size)) if (a[i] != b[i]) return a[i].compareTo(b[i])
        return a.size.compareTo(b.size)
    }

    internal fun <T> run(scope: Scope, body: () -> T): T {
        val previous = current
        current = scope
        try {
            return body()
        } finally {
            current = previous
        }
    }

    /** Vue's and Svelte's component: ordered after every component created before it. */
    fun <T> component(body: () -> T): T = run(Scope(listOf(++components)), body)

    /** Angular's component view: after its parent view's bindings and embedded views. */
    fun <T> view(body: () -> T): T = run(Scope(current.next(2)), body)

    /** Angular's embedded view (`@if`, `@for` content): after its declaring view's own bindings. */
    fun <T> embedded(view: Scope, body: () -> T): T = run(Scope(view.next(1)), body)

    /** Solid's control-flow content: one level deeper than the template that holds it. */
    fun <T> deeper(body: () -> T): T = run(Scope(emptyList(), (current.height ?: 0) + 1), body)

    /** Solid's root template. */
    fun <T> solid(body: () -> T): T = if (current.height != null) body() else run(Scope(emptyList(), 0), body)
}

/** Reads without subscribing the running effect. */
fun <T> untrack(body: () -> T): T {
    val previous = currentEffect
    currentEffect = null
    try {
        return body()
    } finally {
        currentEffect = previous
    }
}

/**
 * A value that notifies the effects that read it. A write of an equal value
 * (`equals`, by default `==`: Object.is for numbers and strings, identity for
 * the runtime's objects) is ignored.
 */
class Signal<T>(private var stored: T, private val equals: ((T, T) -> Boolean)? = null) : Source {
    private val subscribers = LinkedHashSet<Subscriber>()
    /** Framework state (`stateSignal`): read outside an owner, the value before the writes not yet committed. */
    internal var holds = false
    private var held: Any? = NOT_HELD

    @Suppress("UNCHECKED_CAST")
    var value: T
        get() {
            currentEffect?.let {
                subscribers.add(it)
                it.track(this)
            }
            if (held !== NOT_HELD && Owner.current == null) return held as T
            return stored
        }
        set(newValue) {
            if (equals?.invoke(stored, newValue) ?: (stored == newValue)) return
            if (holds && held === NOT_HELD) {
                held = stored
                holding.add(this)
            }
            stored = newValue
            for (target in subscribers.toList()) target.invalidate()
            if (batchDepth == 0 && !flushing && !(queue.isEmpty() && derivedQueue.isEmpty() && holding.isEmpty())) scheduleFlush()
        }

    internal fun release() {
        held = NOT_HELD
    }

    /** `signal.update { it + 1 }`, as Angular writes it. */
    fun update(transform: (T) -> T) {
        value = transform(stored)
    }

    override fun unsubscribe(subscriber: Subscriber) {
        subscribers.remove(subscriber)
    }

    private companion object {
        val NOT_HELD = Any()
    }
}

/**
 * React's `useState`, Octane's and Solid's signals: the handlers of a render read the state it
 * rendered (Solid's untracked reads see the last flush) until the writes commit.
 */
fun <T> stateSignal(signal: Signal<T>): Signal<T> {
    signal.holds = true
    return signal
}

/** Runs `body` now and again whenever a signal it read changes. */
class Effect internal constructor(internal val key: List<Int>, private val derived: Boolean, body: () -> Unit, deferred: Boolean = false) : Subscriber {
    private var body: (() -> Unit)? = body
    private val sources = LinkedHashSet<Source>()
    private var stale = false
    private var owner: Owner? = null
    private val height = EffectOrder.current.height

    constructor(body: () -> Unit) : this(EffectOrder.key(), false, body)

    init {
        Owner.current?.effects?.add(this)
        created?.invoke(this)
        if (deferred) {
            stale = true
            queue.add(this)
            scheduleFlush()
        } else {
            run()
        }
    }

    internal val disposed: Boolean get() = body == null

    companion object {
        /** Called with each effect as it is made: zone.js change detection re-runs them all. */
        internal var created: ((Effect) -> Unit)? = null

        /** Angular's `effect()`: its first run is in the next update, as change detection runs it, not at creation. */
        fun deferred(body: () -> Unit): Effect = Effect(EffectOrder.key(), false, body, deferred = true)
    }

    /** `EffectRef.destroy()`. */
    fun destroy() = dispose()

    internal fun track(source: Source) {
        sources.add(source)
    }

    override fun invalidate() {
        if (body == null || stale) return
        stale = true
        if (derived) derivedQueue.add(this) else queue.add(this)
    }

    internal fun runIfStale() {
        if (!stale) return
        stale = false
        run()
    }

    private fun run() {
        val body = body ?: return
        for (source in sources) source.unsubscribe(this)
        sources.clear()
        // Effects and views made by the previous run (a branch, a row) go with it.
        owner?.dispose()
        // The effect, not whatever owner is current when it re-runs, owns what each run makes.
        val next = Owner(null)
        owner = next
        val previous = currentEffect
        currentEffect = this
        try {
            EffectOrder.run(EffectOrder.Scope(key, height)) { next.run(body) }
        } finally {
            currentEffect = previous
        }
    }

    internal fun dispose() {
        for (source in sources) source.unsubscribe(this)
        sources.clear()
        body = null
        owner?.dispose()
        owner = null
    }
}

/**
 * A derived value as Svelte's `$:` keeps it: `body` stores it when its sources change, in the
 * update after the writes and before any binding re-runs; read before that, it is the old value.
 */
fun derive(body: () -> Unit): Effect = Effect(EffectOrder.derivedKey(), true, body)

/** A top-level owner for an app or a navigation entry. */
fun <T> createRoot(body: (Owner) -> T): T {
    val owner = Owner(null)
    return owner.run { body(owner) }
}
