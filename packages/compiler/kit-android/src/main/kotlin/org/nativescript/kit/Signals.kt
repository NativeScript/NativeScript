package org.nativescript.kit

import java.util.IdentityHashMap

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
    /** [injector]: Angular's, of the nearest component with `providers` above this scope, current while it runs. */
    class Scope internal constructor(private val prefix: List<Int>, internal val height: Int? = null, internal val injector: Injector? = Injector.current) {
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
        val injector = Injector.current
        current = scope
        Injector.current = scope.injector
        try {
            return body()
        } finally {
            current = previous
            Injector.current = injector
        }
    }

    /** Vue's and Svelte's component: ordered after every component created before it. */
    fun <T> component(body: () -> T): T = run(Scope(listOf(++components)), body)

    /**
     * Angular's component view: after its parent view's bindings and embedded views. [injector] is the component's own
     * (`providers`); without one, the view's children inject from the injector the component was made in.
     */
    fun <T> view(injector: Injector? = null, body: () -> T): T = run(Scope(current.next(2), null, injector ?: Injector.current), body)

    /** Angular's embedded view (`@if`, `@for` content): after its declaring view's own bindings. */
    fun <T> embedded(view: Scope, body: () -> T): T = run(Scope(view.next(1), null, view.injector), body)

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
    internal var linkEffect: Effect? = null
    /** Framework state (`stateSignal`): read outside an owner, the value before the writes not yet committed. */
    internal var holds = false
    private var held: Any? = NOT_HELD

    @Suppress("UNCHECKED_CAST")
    var value: T
        get() {
            linkEffect?.runIfStale()
            currentEffect?.let {
                subscribers.add(it)
                it.track(this)
            }
            if (held !== NOT_HELD && Owner.current == null) return held as T
            return stored
        }
        set(newValue) {
            linkEffect?.runIfStale()
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
        linkEffect?.runIfStale()
        value = transform(stored)
    }

    override fun unsubscribe(subscriber: Subscriber) {
        subscribers.remove(subscriber)
    }

    companion object {
        private val NOT_HELD = Any()

        fun <T> linked(compute: () -> T, equals: ((T, T) -> Boolean)? = null): Signal<T> {
            var sig: Signal<T>? = null
            var first = true
            val eff = Effect(EffectOrder.derivedKey(), true, {
                val v = compute()
                if (first) {
                    first = false
                    sig = Signal(v, equals)
                } else {
                    sig?.value = v
                }
            })
            val out = sig ?: Signal(compute(), equals)
            out.linkEffect = eff
            return out
        }
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
    private val injector = Injector.current

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
        // What an effect throws is reported, as a framework's scheduler reports a failed job: the update goes on.
        try {
            EffectOrder.run(EffectOrder.Scope(key, height, injector)) { next.run(body) }
        } catch (e: Throwable) {
            jsReportUncaught(jsCaught(e))
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

class RxSubscription(private var teardown: (() -> Unit)? = null) {
    var closed = false
        private set

    fun unsubscribe() {
        if (closed) return
        closed = true
        val finalize = teardown
        teardown = null
        finalize?.invoke()
    }
}

/** An event a component raises (Angular `output()` / `EventEmitter`): the parent subscribes, the component emits. */
class Emitter<T>(@Suppress("UNUSED_PARAMETER") isAsync: Boolean = false) {
    private class Handler<T>(val fn: (T) -> Unit)
    private val handlers = mutableListOf<Handler<T>>()

    fun on(handler: (T) -> Unit) {
        handlers.add(Handler(handler))
    }

    fun emit(value: T) {
        for (h in handlers.toList()) h.fn(value)
    }

    fun next(value: T) {
        emit(value)
    }

    fun subscribe(next: (T) -> Unit): RxSubscription {
        val box = Handler(next)
        handlers.add(box)
        return RxSubscription { handlers.remove(box) }
    }

    fun subscribe(observerOrNext: Any? = null, @Suppress("UNUSED_PARAMETER") error: Any? = null, @Suppress("UNUSED_PARAMETER") complete: Any? = null): RxSubscription {
        val box = Handler<T> { value ->
            val sub = jsBox(observerOrNext) ?: return@Handler
            if (sub is JSDynamic && ("next" in sub.jsKeys || sub.jsHasMember("next"))) {
                jsReport { jsCallMethod(sub, "next", value) }
            } else {
                jsReport { jsCall(sub, value) }
            }
        }
        handlers.add(box)
        return RxSubscription { handlers.remove(box) }
    }
}

fun Emitter<Unit>.emit() = emit(Unit)
fun Emitter<Unit>.next() = emit(Unit)

@JvmName("emitNullableAny")
fun Emitter<Any?>.emit() = emit(null)
@JvmName("nextNullableAny")
fun Emitter<Any?>.next() = emit(null)

/** `inject(DestroyRef)`: callbacks run when the injecting component's scope ends. */
class DestroyRef internal constructor(owner: Owner?) {
    private val owner = java.lang.ref.WeakReference(owner)

    /** Registers the callback; the function returned unregisters it. */
    fun onDestroy(callback: () -> Unit): () -> Unit {
        var active = true
        owner.get()?.onCleanup { if (active) jsReport { callback() } }
        return { active = false }
    }

    companion object {
        fun current(): DestroyRef = DestroyRef(Owner.current)
    }
}

/** `ElementRef`: a view of a template, as a view query (`@ViewChild('ref', { read: ElementRef })`) gives it. */
class ElementRef(nativeElement: Any? = null) {
    var nativeElement: Any? = nativeElement
        private set

    /** A component's own ElementRef, made with the component: its template's root view, once made. */
    fun attach(host: Any?) { nativeElement = host }

    companion object {
        private val hosts = mutableListOf<Any?>()

        /** Makes a directive of an element: its `inject(ElementRef)` is the element. */
        fun <T> hosting(host: Any?, make: () -> T): T {
            hosts.add(host)
            try { return make() } finally { hosts.removeAt(hosts.size - 1) }
        }

        /** `inject(ElementRef)`: the element whose directive is being made; elsewhere, a ref to no view. */
        fun current(): ElementRef = ElementRef(hosts.lastOrNull())
    }
}

/** `SimpleChange`: one input's change, as `ngOnChanges` receives it. */
class SimpleChange(var previousValue: Any?, var currentValue: Any?, var firstChange: Boolean) {
    fun isFirstChange(): Boolean = firstChange
}

fun forwardRef(fn: () -> Any?): Any? = fn

fun resolveForwardRef(value: Any?): Any? {
    val flat = jsBox(value) ?: return null
    if (flat is Function0<*>) return try { flat.invoke() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null }
    if (flat is JSFunction && flat.length == 0) return try { flat.invoke() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null }
    return value
}

class Optional
class Self
class SkipSelf
class Host
class Inject(val token: Any?)

/**
 * The root injector: `providedIn: 'root'` services, each made on first use in the root scope (its
 * `inject(DestroyRef)` and effects belong there) and destroyed with the app, after which the next
 * use makes a new one, as a new bootstrap does.
 */
object AppInjector {
    internal var owner = Owner(null)
    internal val services = HashMap<Class<*>, Any>()
    private val making = HashSet<Class<*>>()

    @Suppress("UNCHECKED_CAST")
    fun <T : Any> service(type: Class<T>, make: () -> T): T {
        Injector.current?.let { active ->
            if (active !== Injector.shared) {
                val found = active.get(type, Injector.NOT_FOUND, null, root = false)
                if (found !== Injector.NOT_FOUND && type.isInstance(found)) return found as T
            }
        }
        Injector.lookupClassOverride(type)?.let { if (type.isInstance(it)) return it as T }
        services[type]?.let { return it as T }
        if (!making.add(type)) throw JSException(JSError("NG0200: Circular dependency in DI detected for ${type.simpleName}"))
        try {
            val made = Injector.atRoot { untrack { owner.run(make) } }
            services[type] = made
            return made
        } finally {
            making.remove(type)
        }
    }

    fun destroy() {
        val old = owner
        owner = Owner(null)
        services.clear()
        making.clear()
        Injector.reset()
        old.dispose()
    }
}

typealias NodeInjector = Injector

class Injector(providers: Any? = null, private val parent: Injector? = null) {
    /** A component's injector ([enter]): what its providers make belongs to the component, and goes when it does. */
    private var owner: Owner? = null
    private var entered: Injector? = null
    private val instanceValues = IdentityHashMap<Any, Any?>()
    private val instanceFactories = IdentityHashMap<Any, () -> Any?>()
    private val instanceMultiFactories = IdentityHashMap<Any, MutableList<() -> Any?>>()

    init {
        if (providers != null) registerInstance(providers)
    }

    fun get(token: Any?, notFoundValue: Any? = null, options: Any? = null): Any? = get(token, notFoundValue, options, root = true)

    /** Without [root], only what this injector and its ancestors provide: the root's answer for a service is the service's `shared`, which itself asks the active injector first. */
    internal fun get(token: Any?, notFoundValue: Any?, options: Any?, root: Boolean): Any? {
        val unwrapped = resolveForwardRef(token)
        val skipSelf = (jsBox(jsGetOptional(options, "skipSelf")) as? Boolean) == true
        val selfOnly = (jsBox(jsGetOptional(options, "self")) as? Boolean) == true
        val key = tokenKey(unwrapped)
        if (!skipSelf && key != null) {
            if (instanceValues.containsKey(key)) return instanceValues[key]
            val multis = instanceMultiFactories[key]
            if (!multis.isNullOrEmpty()) {
                val values = multis.map { fn -> owned { runInContext(this) { try { fn() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null } } } }
                val arr = JSArray(values.toMutableList())
                instanceValues[key] = arr
                return arr
            }
            val factory = instanceFactories[key]
            if (factory != null) {
                val v = owned { runInContext(this) { try { factory() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null } } }
                instanceValues[key] = v
                return v
            }
        }
        if (selfOnly) return notFoundValue
        if (parent != null) return parent.get(unwrapped, notFoundValue, null, root)
        if (skipSelf || !root) return notFoundValue
        return resolveRoot(unwrapped, notFoundValue)
    }

    private fun registerInstance(providers: Any?) {
        fun walk(item: Any?) {
            val flat = jsBox(item) ?: return
            if (flat is JSArray<*>) {
                for (el in flat.storage) walk(el)
                return
            }
            // A class: its own instance, as `{ provide: X, useClass: X }`.
            if (flat is Class<*>) {
                instanceFactories[flat] = { construct(flat) }
                instanceMultiFactories.remove(flat)
                instanceValues.remove(flat)
                return
            }
            if (flat is JSDynamic) {
                if ("providers" in flat.jsKeys) walk(flat.jsGet("providers"))
                if ("provide" in flat.jsKeys) parseProvider(flat, this)
            }
        }
        walk(providers)
    }

    fun leave() {
        current = entered
    }

    private fun <T> owned(body: () -> T): T {
        val owner = owner ?: return body()
        return untrack { owner.run(body) }
    }

    companion object {
        internal val NOT_FOUND = Any()
        val shared = Injector()
        internal var current: Injector? = null
        val root: Injector get() = current ?: shared

        private val tokenValues = IdentityHashMap<Any, Any?>()
        private val tokenFactories = IdentityHashMap<Any, () -> Any?>()
        private val multiFactories = IdentityHashMap<Any, MutableList<() -> Any?>>()

        private fun tokenKey(token: Any?): Any? = jsBox(resolveForwardRef(token))

        internal fun lookupClassOverride(type: Class<*>): Any? {
            if (tokenValues.containsKey(type)) return tokenValues[type]
            val factory = tokenFactories[type] ?: return null
            val v = try { factory() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null }
            tokenValues[type] = v
            return v
        }

        fun create(options: Any?, parent: Injector? = null): Injector {
            val flat = jsBox(options) ?: return Injector(null, parent)
            if (flat is JSArray<*>) return Injector(flat, parent)
            val providers = jsGetOptional(flat, "providers") ?: flat
            val resolvedParent = (jsBox(jsGetOptional(flat, "parent")) as? Injector) ?: parent
            return Injector(providers, resolvedParent)
        }

        /**
         * `@Component({ providers })`: the component's own injector over the one it is made in, current from the
         * component's first field to the end of its constructor ([leave]), and in its view (`EffectOrder.view`).
         */
        fun enter(providers: Any?): Injector {
            val node = Injector(providers, current)
            node.owner = Owner()
            node.entered = current
            current = node
            return node
        }

        /** What a root service makes and injects comes from the root, not from the providers of the component that injected it. */
        internal fun <T> atRoot(body: () -> T): T {
            val active = current
            current = null
            try { return body() } finally { current = active }
        }

        fun <T> runInContext(injector: Any?, fn: () -> T): T {
            val prev = current
            current = (jsBox(injector) as? Injector) ?: shared
            try { return fn() } finally { current = prev }
        }

        fun <T> root(make: () -> T): T = atRoot { untrack { AppInjector.owner.run(make) } }

        fun reset() {
            tokenValues.clear()
            tokenFactories.clear()
            multiFactories.clear()
            current = null
        }

        fun provide(token: Any?, useValue: Any? = null, useFactory: (() -> Any?)? = null) {
            val key = tokenKey(token) ?: return
            if (useFactory != null) {
                tokenFactories[key] = useFactory
                tokenValues.remove(key)
            } else {
                tokenValues[key] = useValue
                tokenFactories.remove(key)
            }
        }

        private fun instantiateClass(cls: Class<*>): Any? {
            try {
                val companionField = cls.getDeclaredField("Companion")
                val companion = companionField.get(null)
                val sharedMethod = companion.javaClass.methods.firstOrNull { it.name == "getShared" && it.parameterCount == 0 }
                if (sharedMethod != null) return sharedMethod.invoke(companion)
            } catch (_: Throwable) {}
            return try { construct(cls) } catch (_: Throwable) { null }
        }

        /** A new instance, as a child injector's `useClass` provider makes one of its own. */
        private fun construct(cls: Class<*>): Any? {
            val ctor = cls.declaredConstructors.firstOrNull { it.parameterCount == 0 } ?: return null
            ctor.isAccessible = true
            return try { ctor.newInstance() } catch (e: java.lang.reflect.InvocationTargetException) { throw e.targetException }
        }

        private fun parseProvider(dyn: JSDynamic, target: Injector?) {
            val token = resolveForwardRef(dyn.jsGet("provide"))
            val key = tokenKey(token) ?: return
            val isMulti = (jsBox(dyn.jsGet("multi")) as? Boolean) == true
            val hasValue = "useValue" in dyn.jsKeys
            val valProp = dyn.jsGet("useValue")
            val factory = jsBox(dyn.jsGet("useFactory"))
            val existing = jsBox(dyn.jsGet("useExisting"))
            val useClass = jsBox(resolveForwardRef(dyn.jsGet("useClass")))
            val deps = (jsBox(dyn.jsGet("deps")) as? JSArray<*>)?.storage ?: emptyList<Any?>()
            val make: () -> Any? = {
                when {
                    hasValue -> valProp
                    factory != null -> {
                        val resolved = deps.map { dep ->
                            val flatDep = jsBox(dep)
                            if (flatDep is JSArray<*>) {
                                if (flatDep.storage.any { jsBox(it) is SkipSelf }) null
                                else flatDep.storage.lastOrNull()?.let { if (target != null) target.get(it) else inject(it) }
                            } else {
                                if (target != null) target.get(flatDep) else inject(flatDep)
                            }
                        }
                        jsCall(factory, *resolved.toTypedArray())
                    }
                    existing != null -> if (target != null) target.get(existing) else inject(existing)
                    useClass is Class<*> -> if (target != null) construct(useClass) else instantiateClass(useClass)
                    useClass != null -> jsCall(useClass)
                    key is Class<*> -> instantiateClass(key)
                    else -> null
                }
            }
            if (target != null) {
                if (isMulti) {
                    target.instanceMultiFactories.getOrPut(key) { mutableListOf() }.add(make)
                    target.instanceValues.remove(key)
                } else {
                    target.instanceFactories[key] = make
                    target.instanceValues.remove(key)
                }
            } else {
                if (isMulti) {
                    multiFactories.getOrPut(key) { mutableListOf() }.add(make)
                    tokenValues.remove(key)
                } else {
                    tokenFactories[key] = make
                    tokenValues.remove(key)
                }
            }
        }

        fun register(providers: Any?) {
            val initializers = mutableListOf<() -> Any?>()
            fun walk(item: Any?) {
                val flat = jsBox(item) ?: return
                if (flat is JSArray<*>) {
                    for (el in flat.storage) walk(el)
                    return
                }
                if (flat is Function0<*>) {
                    initializers.add { flat.invoke() }
                    return
                }
                if (flat is JSFunction) {
                    initializers.add { flat.invoke() }
                    return
                }
                if (flat is JSDynamic) {
                    if ("providers" in flat.jsKeys) walk(flat.jsGet("providers"))
                    if ("provide" in flat.jsKeys) parseProvider(flat, null)
                }
            }
            walk(providers)
            for (initFn in initializers) {
                try { initFn() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)) }
            }
        }

        fun inject(token: Any?, options: Any? = null, notFoundValue: Any? = null): Any? {
            val unwrapped = resolveForwardRef(token)
            val active = current
            if (active != null && active !== shared) {
                return active.get(unwrapped, notFoundValue, options)
            }
            if ((jsBox(jsGetOptional(options, "skipSelf")) as? Boolean) == true) {
                return notFoundValue
            }
            return resolveRoot(unwrapped, notFoundValue)
        }

        internal fun resolveRoot(unwrapped: Any?, notFoundValue: Any? = null): Any? {
            val key = tokenKey(unwrapped) ?: return notFoundValue
            if (tokenValues.containsKey(key)) return tokenValues[key]
            val multis = multiFactories[key]
            if (!multis.isNullOrEmpty()) {
                val values = multis.map { fn -> try { fn() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null } }
                val arr = JSArray(values.toMutableList())
                tokenValues[key] = arr
                return arr
            }
            val factory = tokenFactories[key]
            if (factory != null) {
                val v = try { factory() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null }
                tokenValues[key] = v
                return v
            }
            if (key is InjectionToken && key.factory != null) {
                val v = try { key.factory.invoke() } catch (t: Throwable) { jsReportUncaught(jsCaught(t)); null }
                tokenValues[key] = v
                return v
            }
            if (key is Class<*>) {
                when (key) {
                    ErrorHandler::class.java -> return ErrorHandler.shared
                    Injector::class.java -> return current ?: shared
                    NgZone::class.java -> return NgZone.shared
                    DestroyRef::class.java -> return DestroyRef.current()
                    ElementRef::class.java -> return ElementRef.current()
                    ApplicationRef::class.java -> return ApplicationRef.shared
                    Location::class.java -> return Location.shared
                    ViewContainerRef::class.java -> return ViewContainerRef()
                }
                instantiateClass(key)?.let { return it }
            }
            return notFoundValue
        }
    }
}

class InjectionToken(val desc: String = "", options: Any? = null) {
    val factory: (() -> Any?)? = run {
        val fn = jsBox(jsGetOptional(options, "factory")) ?: return@run null
        { jsCall(fn) }
    }
    override fun toString(): String = "InjectionToken $desc"
}

open class ErrorHandler {
    open fun handleError(@Suppress("UNUSED_PARAMETER") error: Any?) {}
    companion object {
        val shared = ErrorHandler()
    }
}

fun makeEnvironmentProviders(providers: Any?): Any? {
    Injector.register(providers)
    return providers
}

fun provideEnvironmentInitializer(fn: () -> Any?): Any? = fn
fun provideAppInitializer(fn: () -> Any?): Any? = fn

fun importProvidersFrom(vararg modules: Any?): Any? {
    val arr = JSArray(modules.toMutableList())
    Injector.register(arr)
    return arr
}

val PLATFORM_ID = InjectionToken("PLATFORM_ID", JSObject("factory" to { "browser" }))
val APP_INITIALIZER = InjectionToken("APP_INITIALIZER")
val ENVIRONMENT_INITIALIZER = InjectionToken("ENVIRONMENT_INITIALIZER")

fun isPlatformBrowser(platformId: Any?): Boolean = jsToString(platformId) == "browser"
fun isPlatformServer(platformId: Any?): Boolean = jsToString(platformId) == "server"

/** `NgZone` without zone.js: both run their function at once. */
class NgZone {
    val onStable = Emitter<Any?>()
    val onMicrotaskEmpty = Emitter<Any?>()
    val onUnstable = Emitter<Any?>()
    val onError = Emitter<Any?>()
    val isStable = true
    fun <T> run(fn: () -> T): T = fn()
    fun <T> runOutsideAngular(fn: () -> T): T = fn()
    fun <T> runGuarded(fn: () -> T): T = fn()
    fun <T> runTask(fn: () -> T): T = fn()

    companion object {
        val shared = NgZone()
        fun isInAngularZone(): Boolean = true
    }
}

class TemplateRef(val elementRef: ElementRef = ElementRef())

class EmbeddedViewRef(var context: Any? = null) {
    var rootNodes: JSArray<Any?> = JSArray()
    var destroyed: Boolean = false
        private set
    fun destroy() { destroyed = true }
    fun detectChanges() {}
    fun markForCheck() {}
}

class ComponentRef(
    var instance: Any? = null,
    val location: ElementRef = ElementRef(),
    val injector: Injector = Injector.shared,
) {
    val hostView = EmbeddedViewRef(instance)
    fun setInput(name: String, value: Any?) {
        val inst = instance ?: return
        try { jsSet(inst, name, value) } catch (_: Throwable) {}
    }
    fun destroy() { hostView.destroy() }
}

class ViewContainerRef {
    val element = ElementRef()
    val injector = Injector.shared
    private val views = mutableListOf<EmbeddedViewRef>()
    val length: Double get() = views.size.toDouble()
    fun clear() {
        for (v in views) v.destroy()
        views.clear()
    }
    fun createEmbeddedView(@Suppress("UNUSED_PARAMETER") templateRef: Any?, context: Any? = null, @Suppress("UNUSED_PARAMETER") options: Any? = null): EmbeddedViewRef {
        val view = EmbeddedViewRef(context)
        views.add(view)
        return view
    }
    fun createComponent(componentType: Any?, @Suppress("UNUSED_PARAMETER") options: Any? = null): ComponentRef {
        val flat = jsBox(componentType)
        val inst = when (flat) {
            is Class<*> -> try {
                val ctor = flat.declaredConstructors.firstOrNull { it.parameterCount == 0 }
                ctor?.isAccessible = true
                ctor?.newInstance()
            } catch (_: Throwable) { null }
            null -> null
            else -> try { jsCall(flat) } catch (_: Throwable) { null }
        }
        val ref = ComponentRef(inst)
        views.add(ref.hostView)
        return ref
    }
    fun remove(index: Double? = null) {
        if (views.isEmpty()) return
        val idx = index?.toInt() ?: (views.size - 1)
        if (idx in views.indices) {
            views[idx].destroy()
            views.removeAt(idx)
        }
    }
}

class ApplicationRef {
    val isStable = Emitter<Boolean>()
    fun tick() {}
    fun destroy() {}
    companion object {
        val shared = ApplicationRef()
    }
}

class Location {
    private var currentPath = "/"
    fun path(@Suppress("UNUSED_PARAMETER") includeHash: Boolean = false): String = currentPath
    fun go(path: String, query: String = "", @Suppress("UNUSED_PARAMETER") state: Any? = null) {
        currentPath = if (query.isEmpty()) path else "$path?$query"
    }
    fun replaceState(path: String, query: String = "", state: Any? = null) = go(path, query, state)
    fun back() {}
    fun forward() {}
    companion object {
        val shared = Location()
        fun joinWithSlash(start: String, end: String): String {
            if (start.isEmpty()) return end
            if (end.isEmpty()) return start
            val s = if (start.endsWith("/")) start.dropLast(1) else start
            val e = if (end.startsWith("/")) end.drop(1) else end
            return "$s/$e"
        }
        fun stripTrailingSlash(url: String): String =
            if (url.length > 1 && url.endsWith("/")) url.dropLast(1) else url
    }
}

// @angular/common/http value types

class HttpHeaders(headers: Any? = null) {
    private val storage = LinkedHashMap<String, MutableList<String>>()
    private val originalNames = LinkedHashMap<String, String>()

    init {
        val flat = jsBox(headers)
        if (flat is String) {
            for (line in flat.split("\n")) {
                val colon = line.indexOf(':')
                if (colon > 0) {
                    val name = line.substring(0, colon).trim()
                    val value = line.substring(colon + 1).trim()
                    appendInPlace(name, value)
                }
            }
        } else if (flat != null) {
            for (k in jsKeysOf(flat)) {
                val v = jsGetOptional(flat, k)
                if (jsIsNullish(v)) continue
                val lower = k.lowercase()
                if (!originalNames.containsKey(lower)) originalNames[lower] = k
                val box = jsBox(v)
                if (box is JSArray<*>) {
                    storage[lower] = box.storage.map { jsToString(it) }.toMutableList()
                } else {
                    storage[lower] = mutableListOf(jsToString(v))
                }
            }
        }
    }

    private fun appendInPlace(name: String, value: Any?) {
        val lower = name.lowercase()
        if (!originalNames.containsKey(lower)) originalNames[lower] = name
        val list = storage.getOrPut(lower) { mutableListOf() }
        val box = jsBox(value)
        if (box is JSArray<*>) {
            for (item in box.storage) list.add(jsToString(item))
        } else {
            list.add(jsToString(value))
        }
    }

    private fun cloned(): HttpHeaders {
        val copy = HttpHeaders()
        for ((k, v) in storage) copy.storage[k] = v.toMutableList()
        copy.originalNames.putAll(originalNames)
        return copy
    }

    fun has(name: String): Boolean = storage.containsKey(name.lowercase())

    fun get(name: String): String? = storage[name.lowercase()]?.firstOrNull()

    fun keys(): JSArray<String> = JSArray(originalNames.values.toMutableList())

    fun getAll(name: String): JSArray<String>? {
        val vals = storage[name.lowercase()] ?: return null
        return JSArray(vals.toMutableList())
    }

    fun append(name: String, value: Any?): HttpHeaders {
        val next = cloned()
        next.appendInPlace(name, value)
        return next
    }

    fun set(name: String, value: Any?): HttpHeaders {
        val next = cloned()
        val lower = name.lowercase()
        next.originalNames[lower] = name
        val box = jsBox(value)
        next.storage[lower] = if (box is JSArray<*>) {
            box.storage.map { jsToString(it) }.toMutableList()
        } else {
            mutableListOf(jsToString(value))
        }
        return next
    }

    fun delete(name: String, value: Any? = null): HttpHeaders {
        val next = cloned()
        val lower = name.lowercase()
        if (jsIsNullish(value)) {
            next.storage.remove(lower)
            next.originalNames.remove(lower)
        } else {
            val existing = next.storage[lower]
            if (existing != null) {
                val box = jsBox(value)
                val removeSet = if (box is JSArray<*>) box.storage.map { jsToString(it) }.toSet() else setOf(jsToString(value))
                val filtered = existing.filter { it !in removeSet }.toMutableList()
                if (filtered.isEmpty()) {
                    next.storage.remove(lower)
                    next.originalNames.remove(lower)
                } else {
                    next.storage[lower] = filtered
                }
            }
        }
        return next
    }

    fun toJSObject(): JSObject {
        val pairs = mutableListOf<Pair<String, Any?>>()
        for ((lower, vals) in storage) {
            val orig = originalNames[lower] ?: lower
            pairs.add(orig to vals.joinToString(", "))
        }
        return JSObject(pairs)
    }
}

class HttpParams(options: Any? = null) : JSStringConvertible {
    private val storage = LinkedHashMap<String, MutableList<String>>()

    init {
        val flat = jsBox(options)
        if (flat != null) {
            val fromString = jsGetOptional(flat, "fromString") as? String
            if (fromString != null) {
                val trimmed = if (fromString.startsWith("?")) fromString.substring(1) else fromString
                if (trimmed.isNotEmpty()) {
                    for (part in trimmed.split("&")) {
                        if (part.isEmpty()) continue
                        val eq = part.indexOf('=')
                        if (eq >= 0) {
                            appendInPlace(jsDecodeURIComponent(part.substring(0, eq)), jsDecodeURIComponent(part.substring(eq + 1)))
                        } else {
                            appendInPlace(jsDecodeURIComponent(part), "")
                        }
                    }
                }
            } else {
                val fromObj = jsGetOptional(flat, "fromObject")
                val source: Any? = if (!jsIsNullish(fromObj)) fromObj else flat
                for (k in jsKeysOf(source)) {
                    if (k == "fromString" || k == "fromObject" || k == "encoder") continue
                    val v = jsGetOptional(source, k)
                    if (jsIsNullish(v)) continue
                    val box = jsBox(v)
                    if (box is JSArray<*>) {
                        storage[k] = box.storage.map { jsToString(it) }.toMutableList()
                    } else {
                        storage[k] = mutableListOf(jsToString(v))
                    }
                }
            }
        }
    }

    private fun appendInPlace(param: String, value: Any?) {
        storage.getOrPut(param) { mutableListOf() }.add(jsToString(value))
    }

    private fun cloned(): HttpParams {
        val copy = HttpParams()
        for ((k, v) in storage) copy.storage[k] = v.toMutableList()
        return copy
    }

    fun has(param: String): Boolean = storage.containsKey(param)

    fun get(param: String): String? = storage[param]?.firstOrNull()

    fun getAll(param: String): JSArray<String>? {
        val vals = storage[param] ?: return null
        return JSArray(vals.toMutableList())
    }

    fun keys(): JSArray<String> = JSArray(storage.keys.toMutableList())

    fun append(param: String, value: Any?): HttpParams {
        val next = cloned()
        next.appendInPlace(param, value)
        return next
    }

    fun appendAll(params: Any?): HttpParams {
        val next = cloned()
        val flat = jsBox(params) ?: return next
        for (k in jsKeysOf(flat)) {
            val v = jsGetOptional(flat, k)
            if (jsIsNullish(v)) continue
            val box = jsBox(v)
            if (box is JSArray<*>) {
                for (item in box.storage) next.appendInPlace(k, item)
            } else {
                next.appendInPlace(k, v)
            }
        }
        return next
    }

    fun set(param: String, value: Any?): HttpParams {
        val next = cloned()
        next.storage[param] = mutableListOf(jsToString(value))
        return next
    }

    fun delete(param: String, value: Any? = null): HttpParams {
        val next = cloned()
        if (jsIsNullish(value)) {
            next.storage.remove(param)
        } else {
            val existing = next.storage[param]
            if (existing != null) {
                val target = jsToString(value)
                val filtered = existing.filter { it != target }.toMutableList()
                if (filtered.isEmpty()) next.storage.remove(param)
                else next.storage[param] = filtered
            }
        }
        return next
    }

    override fun toString(): String {
        val parts = mutableListOf<String>()
        for ((k, vals) in storage) {
            val ek = jsEncodeURIComponent(k)
            for (v in vals) {
                parts.add("$ek=${jsEncodeURIComponent(v)}")
            }
        }
        return parts.joinToString("&")
    }
}

class HttpContextToken(val defaultValue: () -> Any?)

class HttpContext {
    private val map = IdentityHashMap<HttpContextToken, Any?>()
    fun set(token: HttpContextToken, value: Any?): HttpContext {
        map[token] = value
        return this
    }
    fun get(token: HttpContextToken): Any? {
        if (!map.containsKey(token)) map[token] = token.defaultValue()
        return map[token]
    }
    fun delete(token: HttpContextToken): HttpContext {
        map.remove(token)
        return this
    }
    fun has(token: HttpContextToken): Boolean = map.containsKey(token)
}

class HttpResponse(options: Any? = null) {
    val body: Any?
    val headers: HttpHeaders
    val status: Double
    val statusText: String
    val url: String?
    val ok: Boolean
    val type: Double = 4.0

    init {
        val flat = jsBox(options)
        body = jsGetOptional(flat, "body")
        val h = jsBox(jsGetOptional(flat, "headers"))
        headers = (h as? HttpHeaders) ?: HttpHeaders(h)
        val st = jsGetOptional(flat, "status").let { if (jsIsNullish(it)) 200.0 else jsToNumber(it) }
        status = st
        statusText = (jsGetOptional(flat, "statusText") as? String) ?: "OK"
        url = jsGetOptional(flat, "url") as? String
        ok = st >= 200.0 && st < 300.0
    }

    fun clone(update: Any? = null): HttpResponse {
        val flat = jsBox(update)
        val hasBody = flat is JSDynamic && "body" in flat.jsKeys
        val nextBody = if (hasBody) jsGetOptional(flat, "body") else body
        val nextHeaders = (jsBox(jsGetOptional(flat, "headers")) as? HttpHeaders) ?: headers
        val nextStatus = jsGetOptional(flat, "status").let { if (jsIsNullish(it)) status else jsToNumber(it) }
        val nextStatusText = (jsGetOptional(flat, "statusText") as? String) ?: statusText
        val nextUrl = (jsGetOptional(flat, "url") as? String) ?: url
        return HttpResponse(JSObject(
            "body" to nextBody,
            "headers" to nextHeaders,
            "status" to nextStatus,
            "statusText" to nextStatusText,
            "url" to nextUrl,
        ))
    }
}

class HttpErrorResponse(options: Any? = null) : JSError(
    run {
        val flat = jsBox(options)
        val st = jsGetOptional(flat, "status").let { if (jsIsNullish(it)) 0.0 else jsToNumber(it) }
        val stText = (jsGetOptional(flat, "statusText") as? String) ?: "Unknown Error"
        val u = (jsGetOptional(flat, "url") as? String) ?: "(unknown url)"
        "Http failure response for $u: ${jsToString(st)} $stText"
    }
) {
    val error: Any?
    val headers: HttpHeaders
    val status: Double
    val statusText: String
    val url: String?
    val ok: Boolean = false

    init {
        name = "HttpErrorResponse"
        val flat = jsBox(options)
        error = jsGetOptional(flat, "error")
        val h = jsBox(jsGetOptional(flat, "headers"))
        headers = (h as? HttpHeaders) ?: HttpHeaders(h)
        status = jsGetOptional(flat, "status").let { if (jsIsNullish(it)) 0.0 else jsToNumber(it) }
        statusText = (jsGetOptional(flat, "statusText") as? String) ?: "Unknown Error"
        url = jsGetOptional(flat, "url") as? String
    }
}

class HttpRequest(
    method: String,
    val url: String,
    third: Any? = null,
    fourth: Any? = null,
) {
    val method: String = method.uppercase()
    val body: Any?
    val headers: HttpHeaders
    val params: HttpParams
    val context: HttpContext
    val responseType: String
    val withCredentials: Boolean
    val reportProgress: Boolean

    init {
        val hasBody = fourth != null || this.method == "POST" || this.method == "PUT" || this.method == "PATCH" || this.method == "JSONP"
        body = if (hasBody) third else null
        val opt = jsBox(if (hasBody) fourth else third)
        val h = jsBox(jsGetOptional(opt, "headers"))
        headers = (h as? HttpHeaders) ?: HttpHeaders(h)
        val p = jsBox(jsGetOptional(opt, "params"))
        params = (p as? HttpParams) ?: HttpParams(p)
        context = (jsBox(jsGetOptional(opt, "context")) as? HttpContext) ?: HttpContext()
        responseType = (jsGetOptional(opt, "responseType") as? String) ?: "json"
        withCredentials = jsTruthy(jsGetOptional(opt, "withCredentials") ?: false)
        reportProgress = jsTruthy(jsGetOptional(opt, "reportProgress") ?: false)
    }

    val urlWithParams: String
        get() {
            val q = params.toString()
            if (q.isEmpty()) return url
            return if (url.contains("?")) "$url&$q" else "$url?$q"
        }

    fun clone(update: Any? = null): HttpRequest {
        val flat = jsBox(update)
        val nextMethod = (jsGetOptional(flat, "method") as? String) ?: method
        val nextUrl = (jsGetOptional(flat, "url") as? String) ?: url
        val hasBody = flat is JSDynamic && "body" in flat.jsKeys
        val nextBody = if (hasBody) jsGetOptional(flat, "body") else body
        var nextHeaders = (jsBox(jsGetOptional(flat, "headers")) as? HttpHeaders) ?: headers
        val setHeaders = jsBox(jsGetOptional(flat, "setHeaders"))
        if (setHeaders != null) {
            for (k in jsKeysOf(setHeaders)) {
                nextHeaders = nextHeaders.set(k, jsGetOptional(setHeaders, k))
            }
        }
        var nextParams = (jsBox(jsGetOptional(flat, "params")) as? HttpParams) ?: params
        val setParams = jsBox(jsGetOptional(flat, "setParams"))
        if (setParams != null) {
            for (k in jsKeysOf(setParams)) {
                nextParams = nextParams.set(k, jsGetOptional(setParams, k))
            }
        }
        val nextContext = (jsBox(jsGetOptional(flat, "context")) as? HttpContext) ?: context
        val nextRespType = (jsGetOptional(flat, "responseType") as? String) ?: responseType
        val nextCreds = jsGetOptional(flat, "withCredentials")?.let { jsTruthy(it) } ?: withCredentials
        val nextProg = jsGetOptional(flat, "reportProgress")?.let { jsTruthy(it) } ?: reportProgress
        return HttpRequest(nextMethod, nextUrl, nextBody, JSObject(
            "headers" to nextHeaders,
            "params" to nextParams,
            "context" to nextContext,
            "responseType" to nextRespType,
            "withCredentials" to nextCreds,
            "reportProgress" to nextProg,
        ))
    }
}

val HTTP_INTERCEPTORS = InjectionToken("HTTP_INTERCEPTORS")

val HttpStatusCode = JSObject(
    "Continue" to 100.0,
    "SwitchingProtocols" to 101.0,
    "Ok" to 200.0,
    "Created" to 201.0,
    "Accepted" to 202.0,
    "NoContent" to 204.0,
    "MovedPermanently" to 301.0,
    "Found" to 302.0,
    "NotModified" to 304.0,
    "BadRequest" to 400.0,
    "Unauthorized" to 401.0,
    "Forbidden" to 403.0,
    "NotFound" to 404.0,
    "MethodNotAllowed" to 405.0,
    "Conflict" to 409.0,
    "UnprocessableEntity" to 422.0,
    "TooManyRequests" to 429.0,
    "InternalServerError" to 500.0,
    "BadGateway" to 502.0,
    "ServiceUnavailable" to 503.0,
    "GatewayTimeout" to 504.0,
)

fun withInterceptors(fns: Any?): Any? = JSObject("__kind" to "withInterceptors", "fns" to fns)
fun withInterceptorsFromDi(): Any? = JSObject("__kind" to "withInterceptorsFromDi")
fun withFetch(): Any? = JSObject("__kind" to "withFetch")
fun provideHttpClient(@Suppress("UNUSED_PARAMETER") vararg features: Any?): Any? = JSArray<Any?>()
fun provideNativeScriptHttpClient(@Suppress("UNUSED_PARAMETER") vararg features: Any?): Any? = JSArray<Any?>()
fun provideNativeScriptNgZone(): Any? = JSArray<Any?>()
fun provideRouter(@Suppress("UNUSED_PARAMETER") routes: Any?, @Suppress("UNUSED_PARAMETER") vararg features: Any?): Any? = JSArray<Any?>()
fun provideNativeScriptRouter(@Suppress("UNUSED_PARAMETER") routes: Any?, @Suppress("UNUSED_PARAMETER") vararg features: Any?): Any? = JSArray<Any?>()

class HttpClientModule {
    companion object {
        fun forRoot(): Any? = JSObject("ngModule" to HttpClientModule::class.java)
    }
}

// @angular/router value types

class ParamMap(params: Any? = null) {
    private val storage = LinkedHashMap<String, List<String>>()

    init {
        val flat = jsBox(params)
        if (flat is Map<*, *>) {
            for ((k, v) in flat) {
                if (k != null && v != null) storage[k.toString()] = listOf(v.toString())
            }
        } else if (flat != null) {
            for (k in jsKeysOf(flat)) {
                val v = jsGetOptional(flat, k)
                if (jsIsNullish(v)) continue
                val box = jsBox(v)
                storage[k] = if (box is JSArray<*>) box.storage.map { jsToString(it) } else listOf(jsToString(v))
            }
        }
    }

    fun has(name: String): Boolean = storage.containsKey(name)
    fun get(name: String): String? = storage[name]?.firstOrNull()
    fun getAll(name: String): JSArray<String> = JSArray((storage[name] ?: emptyList()).toMutableList())
    val keys: JSArray<String> get() = JSArray(storage.keys.toMutableList())
}

fun convertToParamMap(params: Any?): ParamMap = ParamMap(params)

class UrlSegment(val path: String, parameters: Any? = null) : JSStringConvertible {
    val parameters: JSRecord<String>
    val parameterMap: ParamMap

    init {
        val pairs = mutableListOf<Pair<String, String>>()
        val flat = jsBox(parameters)
        if (flat is Map<*, *>) {
            for ((k, v) in flat) if (k != null && v != null) pairs.add(k.toString() to v.toString())
        } else if (flat != null) {
            for (k in jsKeysOf(flat)) {
                val v = jsGetOptional(flat, k)
                if (!jsIsNullish(v)) pairs.add(k to jsToString(v))
            }
        }
        this.parameters = JSRecord(pairs)
        this.parameterMap = ParamMap(this.parameters)
    }

    override fun toString(): String = path
}

class UrlTree(
    path: String = "/",
    queryParams: Any? = null,
    var fragment: String? = null,
) : JSStringConvertible {
    private val path: String = path.ifEmpty { "/" }
    var queryParams: JSObject = run {
        val flat = jsBox(queryParams)
        if (flat is JSObject) flat
        else if (flat != null) {
            val pairs = mutableListOf<Pair<String, Any?>>()
            for (k in jsKeysOf(flat)) pairs.add(k to jsGetOptional(flat, k))
            JSObject(pairs)
        } else JSObject()
    }

    val queryParamMap: ParamMap get() = ParamMap(queryParams)

    override fun toString(): String {
        val qParts = mutableListOf<String>()
        for (k in jsKeysOf(queryParams)) {
            val v = jsGetOptional(queryParams, k)
            if (!jsIsNullish(v)) {
                qParts.add("${jsEncodeURIComponent(k)}=${jsEncodeURIComponent(jsToString(v))}")
            }
        }
        val q = if (qParts.isEmpty()) "" else "?${qParts.joinToString("&")}"
        val f = if (fragment != null) "#$fragment" else ""
        return "$path$q$f"
    }
}

class DefaultUrlSerializer {
    fun parse(url: String): UrlTree {
        var raw = url.ifEmpty { "/" }
        var fragment: String? = null
        val hashIdx = raw.indexOf('#')
        if (hashIdx >= 0) {
            fragment = raw.substring(hashIdx + 1)
            raw = raw.substring(0, hashIdx)
        }
        val qPairs = mutableListOf<Pair<String, Any?>>()
        val qIdx = raw.indexOf('?')
        if (qIdx >= 0) {
            val qStr = raw.substring(qIdx + 1)
            raw = raw.substring(0, qIdx)
            for (part in qStr.split("&")) {
                if (part.isEmpty()) continue
                val eq = part.indexOf('=')
                if (eq >= 0) {
                    qPairs.add(jsDecodeURIComponent(part.substring(0, eq)) to jsDecodeURIComponent(part.substring(eq + 1)))
                } else {
                    qPairs.add(jsDecodeURIComponent(part) to "")
                }
            }
        }
        return UrlTree(raw.ifEmpty { "/" }, JSObject(qPairs), fragment)
    }

    fun serialize(tree: UrlTree): String = tree.toString()
}

class ActivatedRouteSnapshot(
    val params: JSRecord<String> = JSRecord(),
    val queryParams: JSRecord<String> = JSRecord(),
    val data: JSRecord<Any?> = JSRecord(),
    val url: JSArray<UrlSegment> = JSArray(),
    val fragment: String? = null,
    val outlet: String = "primary",
    val routeConfig: JSObject? = null,
) {
    var title: String? = null
    val paramMap: ParamMap get() = ParamMap(params)
    val queryParamMap: ParamMap get() = ParamMap(queryParams)
    val root: ActivatedRouteSnapshot get() = this
    val parent: ActivatedRouteSnapshot? get() = null
    val firstChild: ActivatedRouteSnapshot? get() = null
    val children: JSArray<ActivatedRouteSnapshot> get() = JSArray()
    val pathFromRoot: JSArray<ActivatedRouteSnapshot> get() = JSArray(mutableListOf(this))
}

class NavigationStart(val id: Double, val url: String) {
    val navigationTrigger: String = "imperative"
    val restoredState: Any? = null
}

/** `NavigationEnd`, the router event each completed navigation emits. */
class NavigationEnd(val id: Double, val url: String, val urlAfterRedirects: String = url)

class NavigationCancel(val id: Double, val url: String, val reason: String = "")

class NavigationError(val id: Double, val url: String, val error: Any? = null)

class RoutesRecognized(val id: Double, val url: String, val urlAfterRedirects: String = url, val state: Any? = null)

class ResolveStart(val id: Double, val url: String, val urlAfterRedirects: String = url, val state: Any? = null)

class ResolveEnd(val id: Double, val url: String, val urlAfterRedirects: String = url, val state: Any? = null)

fun createRouterStateSnapshot(url: String = "/"): JSObject =
    JSObject("url" to url, "root" to ActivatedRouteSnapshot())

fun bootstrapApplication(@Suppress("UNUSED_PARAMETER") rootComponent: Any?, options: Any? = null): JSPromise<ApplicationRef> {
    val providers = jsGetOptional(options, "providers")
    if (!jsIsNullish(providers)) Injector.register(providers)
    return JSPromise.resolve(ApplicationRef.shared)
}

fun runNativeScriptAngularApp(options: Any? = null) {
    val fn = jsBox(jsGetOptional(options, "appModuleBootstrap")) ?: return
    jsReport { jsCall(fn) }
}

