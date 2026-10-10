package org.nativescript.kit

// Promises and the microtask queue, following ECMA-262 §27.2 job for job so that the
// interleaving of callbacks matches V8's exactly.

/** The microtask queue (HTML "perform a microtask checkpoint", Node's `runMicrotasks`). */
object Microtasks {
    private val queue = ArrayDeque<() -> Unit>()
    private var draining = false
    internal val pendingRejections = ArrayList<JSRejection>()

    /**
     * Receives the reason of every promise still rejected without a handler when a checkpoint
     * ends, as Node's `unhandledRejection` event does.
     */
    var onUnhandledRejection: (Any?) -> Unit = { reason -> jsWriteStandardError("Uncaught (in promise) ${jsToString(reason)}\n") }

    /** Called when a job is queued outside a checkpoint: the host arranges one once the current task returns. */
    var onEnqueue: (() -> Unit)? = null

    fun enqueue(job: () -> Unit) {
        queue.addLast(job)
        if (!draining) onEnqueue?.invoke()
    }

    /** Called when a checkpoint ends after a task (`taskRan`) or a job ran: Angular's zone turning stable. */
    var onStable: (() -> Unit)? = null
    private var turned = false

    /** A JavaScript task (an event handler, a timer callback) ran. */
    fun taskRan() { turned = true }

    /** Runs queued jobs FIFO, including jobs they queue, then reports unhandled rejections. A call made while draining does nothing. */
    fun checkpoint() {
        if (draining) return
        draining = true
        try {
            while (true) {
                while (queue.isNotEmpty()) {
                    queue.removeFirst()()
                    turned = true
                }
                if (pendingRejections.isEmpty()) {
                    val stable = onStable
                    if (!turned || stable == null) return
                    turned = false
                    stable()
                    continue
                }
                val pending = ArrayList(pendingRejections)
                pendingRejections.clear()
                for (r in pending) if (!r.handled) onUnhandledRejection(r.reason)
            }
        } finally {
            draining = false
        }
    }
}

/** A rejection HostPromiseRejectionTracker saw without a handler. */
internal class JSRejection(val reason: Any?) {
    var handled = false
}

enum class JSPromiseState { PENDING, FULFILLED, REJECTED }

/** A native promise of any result type, for code that handles promises dynamically. */
interface JSThenable {
    /** PerformPromiseThen with no derived promise; the result arrives boxed as a JavaScript value. */
    fun jsSubscribe(onFulfilled: (Any?) -> Unit, onRejected: (Any?) -> Unit)
    val jsPromiseState: Pair<JSPromiseState, Any?>
}

/** The resolving functions of a promise (CreateResolvingFunctions): whichever is called first wins. */
class JSResolvers<T> internal constructor(val promise: JSPromise<T>) {
    private var alreadyResolved = false

    /** `resolve(value)`. A value that is itself a promise or thenable is adopted. */
    fun resolve(value: T) {
        if (alreadyResolved) return
        alreadyResolved = true
        promise.resolveWith(value)
    }

    /** `resolve(promise)`: adopts `other`'s eventual state through a NewPromiseResolveThenableJob. */
    fun resolvePromise(other: JSPromise<T>) {
        if (alreadyResolved) return
        alreadyResolved = true
        promise.adopt(other)
    }

    fun reject(reason: Any?) {
        if (alreadyResolved) return
        alreadyResolved = true
        promise.settleRejected(reason)
    }
}

/** A JavaScript `Promise` (ECMA-262 §27.2). Rejection reasons are any JavaScript value. */
class JSPromise<T> internal constructor() : JSThenable, JSDynamic {
    private var state = JSPromiseState.PENDING
    private var result: Any? = null
    private var reason: Any? = null
    private val reactions = ArrayList<Pair<(T) -> Unit, (Any?) -> Unit>>()
    private var isHandled = false
    private var rejection: JSRejection? = null
    /** What `cancel()` does on a promise a library made cancelable (core's `AnimationPromise`). */
    var canceler: (() -> Unit)? = null

    fun cancel() { canceler?.invoke() }

    /**
     * `promise.then = function () { … }`, `promise.catch = …`: what script puts in place of the methods (core's
     * `fixupAnimationPromise`), which the typed `then` and `catch` calls go through as script's would. `await`
     * goes through neither, as PerformPromiseThen does not.
     */
    private var scriptThen: Any? = null
    private var scriptCatch: Any? = null
    private var properties: JSObject? = null

    @Suppress("UNCHECKED_CAST")
    private fun <U> viaScript(hook: Any?, vararg args: Any?): JSPromise<U>? {
        if (hook == null) return null
        val r = if (hook is JSMethod) hook.call(this, args) else jsCall(hook, *args)
        return jsBox(r) as? JSPromise<U> ?: throw JSException(JSTypeError("then did not give a promise"))
    }

    /** The built-in `then`, over script's functions of any kind. */
    private fun thenUntyped(onFulfilled: Any?, onRejected: Any?): JSPromise<Any?> {
        val (derived, resolvers) = pending<Any?>()
        val settle = { f: Any?, v: Any?, rejected: Boolean ->
            if (!jsIsFunction(f)) { if (rejected) resolvers.reject(v) else resolvers.resolve(v) }
            else try { resolvers.resolve(jsBox(jsCall(f, v))) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        }
        performThen({ settle(onFulfilled, jsBox(it), false) }, { settle(onRejected, it, true) })
        return derived
    }

    override fun jsGet(key: String): Any? = when (key) {
        // Called detached (held in a variable, `_then.apply(promise, …)` through a typed function): on the promise it was read from.
        "then" -> scriptThen ?: JSMethod { self, a -> ((self as? JSPromise<*>) ?: this).thenUntyped(a.getOrNull(0), a.getOrNull(1)) }
        "catch" -> scriptCatch ?: JSMethod { self, a -> ((self as? JSPromise<*>) ?: this).thenUntyped(null, a.getOrNull(0)) }
        "cancel" -> JSMethod { self, _ -> ((self as? JSPromise<*>) ?: this).cancel(); null }
        else -> properties?.get(key)
    }

    override fun jsSet(key: String, value: Any?) {
        when (key) {
            "then" -> scriptThen = value
            "catch" -> scriptCatch = value
            "cancel" -> canceler = if (jsIsNullish(value)) null else { { jsCall(value) } }
            else -> (properties ?: JSObject().also { properties = it })[key] = value
        }
    }

    override val jsKeys: List<String> get() = properties?.keys ?: emptyList()
    override val jsClassName: String? get() = "Promise"

    /** `new Promise((resolve, reject) => …)` whose executor gets the resolving functions. A thrown error rejects the promise. */
    constructor(executor: (JSResolvers<T>) -> Unit) : this() {
        val resolvers = JSResolvers(this)
        try {
            executor(resolvers)
        } catch (e: Throwable) {
            resolvers.reject(jsCaught(e))
        }
    }

    // Settling

    @Suppress("UNCHECKED_CAST")
    internal fun resolveWith(resolution: T) {
        val value: Any? = resolution
        if (value is JSThenable) {
            if (value === this) {
                settleRejected(JSTypeError("Chaining cycle detected for promise #<Promise>"))
                return
            }
            Microtasks.enqueue {
                val resolvers = JSResolvers(this)
                value.jsSubscribe({ resolvers.resolve(it as T) }, { resolvers.reject(it) })
            }
            return
        }
        if (value is JSDynamic && value !is JSError) {
            val then = value.jsGet("then")
            if (then is Function<*>) {
                Microtasks.enqueue {
                    val resolvers = JSResolvers(this)
                    val resolve: (Any?) -> Any? = { resolvers.resolve(it as T); null }
                    val reject: (Any?) -> Any? = { resolvers.reject(it); null }
                    try {
                        jsCall(then, resolve, reject)
                    } catch (e: Throwable) {
                        resolvers.reject(jsCaught(e))
                    }
                }
                return
            }
        }
        settleFulfilled(resolution)
    }

    /** Resolving with a native promise: NewPromiseResolveThenableJob, then that promise's `then`. */
    internal fun adopt(other: JSPromise<T>) {
        if (other === this) {
            settleRejected(JSTypeError("Chaining cycle detected for promise #<Promise>"))
            return
        }
        Microtasks.enqueue {
            val resolvers = JSResolvers(this)
            other.performThen({ resolvers.resolve(it) }, { resolvers.reject(it) })
        }
    }

    internal fun settleFulfilled(value: T) {
        if (state != JSPromiseState.PENDING) return
        state = JSPromiseState.FULFILLED
        result = value
        val pending = ArrayList(reactions)
        reactions.clear()
        for (r in pending) Microtasks.enqueue { r.first(value) }
    }

    internal fun settleRejected(reason: Any?) {
        if (state != JSPromiseState.PENDING) return
        state = JSPromiseState.REJECTED
        this.reason = reason
        val pending = ArrayList(reactions)
        reactions.clear()
        if (!isHandled) {
            val record = JSRejection(reason)
            rejection = record
            Microtasks.pendingRejections.add(record)
        }
        for (r in pending) Microtasks.enqueue { r.second(reason) }
    }

    /** PerformPromiseThen. The callbacks are the whole reaction jobs: each runs as its own microtask. */
    @Suppress("UNCHECKED_CAST")
    fun performThen(onFulfilled: (T) -> Unit, onRejected: (Any?) -> Unit) {
        when (state) {
            JSPromiseState.PENDING -> reactions.add(Pair(onFulfilled, onRejected))
            JSPromiseState.FULFILLED -> { val v = result as T; Microtasks.enqueue { onFulfilled(v) } }
            JSPromiseState.REJECTED -> {
                if (!isHandled) rejection?.handled = true
                val r = reason
                Microtasks.enqueue { onRejected(r) }
            }
        }
        isHandled = true
    }

    // then / catch / finally

    fun <U> then(onFulfilled: (T) -> U): JSPromise<U> {
        viaScript<U>(scriptThen, onFulfilled)?.let { return it }
        val (derived, resolvers) = pending<U>()
        performThen({ v ->
            try { resolvers.resolve(onFulfilled(v)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        }, { resolvers.reject(it) })
        return derived
    }

    fun <U> then(onFulfilled: (T) -> U, onRejected: (Any?) -> U): JSPromise<U> {
        viaScript<U>(scriptThen, onFulfilled, onRejected)?.let { return it }
        val (derived, resolvers) = pending<U>()
        performThen({ v ->
            try { resolvers.resolve(onFulfilled(v)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        }, { r ->
            try { resolvers.resolve(onRejected(r)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        })
        return derived
    }

    /** `then` whose callback returns a promise, which the derived promise adopts (two extra ticks). */
    fun <U> thenAdopt(onFulfilled: (T) -> JSPromise<U>): JSPromise<U> {
        viaScript<U>(scriptThen, onFulfilled)?.let { return it }
        val (derived, resolvers) = pending<U>()
        performThen({ v ->
            try { resolvers.resolvePromise(onFulfilled(v)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        }, { resolvers.reject(it) })
        return derived
    }

    fun <U> thenAdopt(onFulfilled: (T) -> JSPromise<U>, onRejected: (Any?) -> JSPromise<U>): JSPromise<U> {
        viaScript<U>(scriptThen, onFulfilled, onRejected)?.let { return it }
        val (derived, resolvers) = pending<U>()
        performThen({ v ->
            try { resolvers.resolvePromise(onFulfilled(v)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        }, { r ->
            try { resolvers.resolvePromise(onRejected(r)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        })
        return derived
    }

    /** `catch` recovering with a value of the promise's own type. */
    fun catch(onRejected: (Any?) -> T): JSPromise<T> {
        (viaScript<T>(scriptCatch, onRejected) ?: viaScript<T>(scriptThen, null, onRejected))?.let { return it }
        val (derived, resolvers) = pending<T>()
        performThen({ resolvers.resolve(it) }, { r ->
            try { resolvers.resolve(onRejected(r)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        })
        return derived
    }

    /** `catch` whose callback returns a promise to adopt. */
    fun catchAdopt(onRejected: (Any?) -> JSPromise<T>): JSPromise<T> {
        (viaScript<T>(scriptCatch, onRejected) ?: viaScript<T>(scriptThen, null, onRejected))?.let { return it }
        val (derived, resolvers) = pending<T>()
        performThen({ resolvers.resolve(it) }, { r ->
            try { resolvers.resolvePromise(onRejected(r)) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        })
        return derived
    }

    /** `catch` recovering with another type (`p.catch(e => console.error(e))`): the result is dynamic. */
    fun catchAny(onRejected: (Any?) -> Any?): JSPromise<Any?> {
        (viaScript<Any?>(scriptCatch, onRejected) ?: viaScript<Any?>(scriptThen, null, onRejected))?.let { return it }
        val (derived, resolvers) = pending<Any?>()
        performThen({ resolvers.resolve(jsBox(it)) }, { r ->
            try { resolvers.resolve(jsBox(onRejected(r))) } catch (e: Throwable) { resolvers.reject(jsCaught(e)) }
        })
        return derived
    }

    /**
     * `finally` (§27.2.5.3): the callback's result goes through PromiseResolve and `then`, so the
     * outcome passes on two ticks later than a plain `then`.
     */
    fun finally(onFinally: () -> Unit): JSPromise<T> = thenAdopt({ value ->
        onFinally()
        resolve(Unit).then { value }
    }, { reason ->
        onFinally()
        resolve(Unit).then<T> { throw JSException(reason) }
    })

    /** `finally` whose callback returns a promise, awaited before the outcome passes on. */
    fun <U> finallyAdopt(onFinally: () -> JSPromise<U>): JSPromise<T> = thenAdopt({ value ->
        onFinally().then { value }
    }, { reason ->
        onFinally().then<T> { throw JSException(reason) }
    })

    // JSThenable

    @Suppress("UNCHECKED_CAST")
    override fun jsSubscribe(onFulfilled: (Any?) -> Unit, onRejected: (Any?) -> Unit) {
        performThen({ onFulfilled(jsBox(it)) }, onRejected)
    }

    override val jsPromiseState: Pair<JSPromiseState, Any?>
        get() = when (state) {
            JSPromiseState.PENDING -> Pair(state, null)
            JSPromiseState.FULFILLED -> Pair(state, jsBox(result))
            JSPromiseState.REJECTED -> Pair(state, reason)
        }

    override fun toString(): String = jsInspect(this)

    companion object {
        /** A pending promise and its resolving functions. */
        fun <T> pending(): Pair<JSPromise<T>, JSResolvers<T>> {
            val p = JSPromise<T>()
            return Pair(p, JSResolvers(p))
        }

        /** `Promise.resolve(value)`. */
        fun <T> resolve(value: T): JSPromise<T> {
            val (p, r) = pending<T>()
            r.resolve(value)
            return p
        }

        /** `Promise.resolve(promise)` is the promise itself (PromiseResolve). */
        fun <T> resolve(promise: JSPromise<T>): JSPromise<T> = promise

        /** `Promise.reject(reason)`. */
        fun <T> reject(reason: Any?): JSPromise<T> {
            val p = JSPromise<T>()
            p.settleRejected(reason)
            return p
        }

        @Suppress("UNCHECKED_CAST")
        fun <T> all(promises: Iterable<JSPromise<T>>): JSPromise<JSArray<T>> =
            jsPromiseAllCore(promises.toList()) { values -> JSArray(values.map { it as T }) }

        /** `Promise.all(values)` over promises of any type and plain values. */
        fun allAny(values: Iterable<Any?>): JSPromise<JSArray<Any?>> = jsPromiseAllCore(values.map(::jsPromiseResolveAny)) { JSArray(it) }

        fun <T> allSettled(promises: Iterable<JSPromise<T>>): JSPromise<JSArray<JSObject>> = jsPromiseAllSettledCore(promises.toList())

        fun allSettledAny(values: Iterable<Any?>): JSPromise<JSArray<JSObject>> = jsPromiseAllSettledCore(values.map(::jsPromiseResolveAny))

        fun <T> race(promises: Iterable<JSPromise<T>>): JSPromise<T> {
            val (result, resolvers) = pending<T>()
            for (p in promises) p.performThen({ resolvers.resolve(it) }, { resolvers.reject(it) })
            return result
        }

        fun raceAny(values: Iterable<Any?>): JSPromise<Any?> {
            val (result, resolvers) = pending<Any?>()
            for (t in values.map(::jsPromiseResolveAny)) t.jsSubscribe({ resolvers.resolve(it) }, { resolvers.reject(it) })
            return result
        }

        /** `Promise.any(promises)`: rejects with an AggregateError when every promise rejects. */
        fun <T> any(promises: Iterable<JSPromise<T>>): JSPromise<T> {
            val (result, resolvers) = pending<T>()
            val list = promises.toList()
            val errors = MutableList<Any?>(list.size) { null }
            var remaining = 1
            val rejectAll = { resolvers.reject(JSAggregateError(JSArray(ArrayList(errors)), "All promises were rejected")) }
            for ((index, p) in list.withIndex()) {
                remaining++
                var called = false
                p.performThen({ resolvers.resolve(it) }, { reason ->
                    if (!called) {
                        called = true
                        errors[index] = reason
                        remaining--
                        if (remaining == 0) rejectAll()
                    }
                })
            }
            remaining--
            if (remaining == 0) rejectAll()
            return result
        }
    }
}

/** PromiseResolve(%Promise%, value) for a dynamic value. */
fun jsPromiseResolveAny(value: Any?): JSThenable = value as? JSThenable ?: JSPromise.resolve(value)

/** PerformPromiseAll over native promises, the results boxed until `finish` types them. */
internal fun <R> jsPromiseAllCore(thenables: List<JSThenable>, finish: (List<Any?>) -> R): JSPromise<R> {
    val (result, resolvers) = JSPromise.pending<R>()
    val values = MutableList<Any?>(thenables.size) { null }
    var remaining = 1
    for ((index, t) in thenables.withIndex()) {
        remaining++
        var called = false
        t.jsSubscribe({ v ->
            if (!called) {
                called = true
                values[index] = v
                remaining--
                if (remaining == 0) resolvers.resolve(finish(values))
            }
        }, { resolvers.reject(it) })
    }
    remaining--
    if (remaining == 0) resolvers.resolve(finish(values))
    return result
}

internal fun jsPromiseAllSettledCore(thenables: List<JSThenable>): JSPromise<JSArray<JSObject>> {
    val (result, resolvers) = JSPromise.pending<JSArray<JSObject>>()
    val values = MutableList<JSObject?>(thenables.size) { null }
    var remaining = 1
    fun settle(index: Int, o: JSObject) {
        values[index] = o
        remaining--
        if (remaining == 0) resolvers.resolve(JSArray(values.map { it!! }))
    }
    for ((index, t) in thenables.withIndex()) {
        remaining++
        var called = false
        t.jsSubscribe({ v ->
            if (!called) { called = true; settle(index, JSObject("status" to "fulfilled", "value" to v)) }
        }, { r ->
            if (!called) { called = true; settle(index, JSObject("status" to "rejected", "reason" to r)) }
        })
    }
    remaining--
    if (remaining == 0) resolvers.resolve(JSArray(values.map { it!! }))
    return result
}

/** `Promise.all([a, b])` over promises of different types. */
@Suppress("UNCHECKED_CAST")
fun <A, B> jsPromiseAll(a: JSPromise<A>, b: JSPromise<B>): JSPromise<Pair<A, B>> =
    jsPromiseAllCore(listOf(a, b)) { v -> Pair(v[0] as A, v[1] as B) }

@Suppress("UNCHECKED_CAST")
fun <A, B, C> jsPromiseAll(a: JSPromise<A>, b: JSPromise<B>, c: JSPromise<C>): JSPromise<Triple<A, B, C>> =
    jsPromiseAllCore(listOf(a, b, c)) { v -> Triple(v[0] as A, v[1] as B, v[2] as C) }

// await and async functions

/**
 * `await promise` (Await, §27.7.5.3): PerformPromiseThen with no derived promise, so the
 * continuation runs exactly one tick after the promise settles.
 */
fun <T> jsAwait(promise: JSPromise<T>, onFulfilled: (T) -> Unit, onRejected: (Any?) -> Unit) {
    promise.performThen(onFulfilled, onRejected)
}

/**
 * `await value` for a value that is not statically a promise: one tick for a plain value; a
 * promise of any type held dynamically is awaited as itself.
 */
@Suppress("UNCHECKED_CAST")
fun <T> jsAwaitValue(value: T, onFulfilled: (T) -> Unit, onRejected: (Any?) -> Unit) {
    val v: Any? = value
    if (v is JSThenable) {
        v.jsSubscribe({ onFulfilled(it as T) }, onRejected)
        return
    }
    if (v is JSDynamic) {
        JSPromise.resolve(value).performThen(onFulfilled, onRejected)
        return
    }
    Microtasks.enqueue { onFulfilled(value) }
}

/**
 * The promise capability of a running async function: the translator runs the body through
 * `body`, splits it at each `await` with `jsAwait`, and ends it with a `return…`/`throwValue`.
 */
class JSAsync<T> {
    val promise: JSPromise<T>
    private val resolvers: JSResolvers<T>

    init {
        val (p, r) = JSPromise.pending<T>()
        promise = p
        resolvers = r
    }

    fun returnValue(value: T) = resolvers.resolve(value)

    /** `return promise`: adopted through a NewPromiseResolveThenableJob, two ticks later than `return await`. */
    fun returnPromise(other: JSPromise<T>) = resolvers.resolvePromise(other)

    fun throwValue(error: Any?) = resolvers.reject(error)

    /** Runs a segment of the body synchronously; a thrown error rejects the promise. */
    fun body(segment: () -> Unit) {
        try {
            segment()
        } catch (e: Throwable) {
            throwValue(jsCaught(e))
        }
    }
}

/**
 * Runs an async loop's iterations without growing the stack: an iteration that continues
 * synchronously is run by the iteration already running, one that continues from a promise
 * job starts a new run.
 */
class JSAsyncLoop {
    private var running = false
    private var pending = false
    private var iteration: ((() -> Unit) -> Unit)? = null

    fun run(body: (() -> Unit) -> Unit) {
        iteration = body
        step()
    }

    private fun step() {
        if (running) { pending = true; return }
        running = true
        do {
            pending = false
            iteration?.invoke { step() }
        } while (pending)
        running = false
    }
}
