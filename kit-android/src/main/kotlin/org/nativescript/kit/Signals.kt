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
        val pending = queue
        queue = mutableListOf()
        for (effect in pending) effect.runIfStale()
    }
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
class Effect(body: () -> Unit) : Subscriber {
    private var body: (() -> Unit)? = body
    private val sources = LinkedHashSet<Source>()
    private var stale = false
    private var owner: Owner? = null

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
            next.run(body)
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
        Effect { signal.value = compute() }
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
