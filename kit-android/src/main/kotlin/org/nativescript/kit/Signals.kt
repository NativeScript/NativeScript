package org.nativescript.kit

// Fine-grained reactivity, the model Angular signals, Vue refs, Solid
// signals and Svelte runes share: a read inside an effect subscribes it, a
// write re-runs exactly the effects that read the value. Compiled templates
// bind each native property through one effect, so nothing is diffed.
// Main thread only, synchronous, like the frameworks it stands in for.

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
private var queue = mutableListOf<Effect>()

/** Groups writes so each affected effect runs once, after the last write. */
fun batch(body: () -> Unit) {
    batchDepth += 1
    body()
    batchDepth -= 1
    if (batchDepth == 0) flush()
}

private fun flush() {
    while (queue.isNotEmpty()) {
        val pending = queue.sortedWith { a, b -> EffectOrder.compare(a.key, b.key) }
        queue = mutableListOf()
        for (effect in pending) effect.runIfStale()
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
    /** Derived values (`Memo`) settle before any binding reads them. */
    private var memos = 0

    internal fun key(): List<Int> = current.next(0)

    internal fun memoKey(): List<Int> = listOf(Int.MIN_VALUE, ++memos)

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

    var value: T
        get() {
            currentEffect?.let {
                subscribers.add(it)
                it.track(this)
            }
            return stored
        }
        set(newValue) {
            if (equals?.invoke(stored, newValue) ?: (stored == newValue)) return
            stored = newValue
            for (target in subscribers.toList()) target.invalidate()
            if (batchDepth == 0) flush()
        }

    /** `signal.update { it + 1 }`, as Angular writes it. */
    fun update(transform: (T) -> T) {
        value = transform(stored)
    }

    override fun unsubscribe(subscriber: Subscriber) {
        subscribers.remove(subscriber)
    }
}

/** Runs `body` now and again whenever a signal it read changes. */
class Effect internal constructor(internal val key: List<Int>, body: () -> Unit) : Subscriber {
    private var body: (() -> Unit)? = body
    private val sources = LinkedHashSet<Source>()
    private var stale = false
    private var owner: Owner? = null
    private val height = EffectOrder.current.height

    constructor(body: () -> Unit) : this(EffectOrder.key(), body)

    init {
        Owner.current?.effects?.add(this)
        run()
    }

    internal fun track(source: Source) {
        sources.add(source)
    }

    override fun invalidate() {
        if (body == null || stale) return
        stale = true
        queue.add(this)
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

/** A derived value cached until a signal it read changes (Vue `computed`, Solid `createMemo`). */
class Memo<T>(compute: () -> T) {
    private val signal = Signal<Any?>(UNSET)

    init {
        Effect(EffectOrder.memoKey()) { signal.value = compute() }
    }

    @Suppress("UNCHECKED_CAST")
    val value: T get() = signal.value as T

    private companion object {
        val UNSET = Any()
    }
}

/** A top-level owner for an app or a navigation entry. */
fun <T> createRoot(body: (Owner) -> T): T {
    val owner = Owner(null)
    return owner.run { body(owner) }
}
