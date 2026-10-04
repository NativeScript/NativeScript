package org.nativescript.kit

// JavaScript's iteration protocols (ECMA-262 §27.1): iterators that `for…of`,
// spread and destructuring drive by `next`, `return` and `throw`; generators,
// whose bodies the translator lowers to continuations that suspend at each
// `yield` (async.ts); and their async counterparts, which settle every step
// through promises in the order the specification gives.

/** One step of an iterator: IteratorValue and IteratorComplete of its result. */
class JSStep(val value: Any?, val done: Boolean)

/** `{ value, done }`, the result object script sees. */
internal fun jsIterResultObject(step: JSStep): JSObject = JSObject(listOf(Pair("value", step.value), Pair("done", step.done)))

/** A result object script returned from `next()`: TypeError unless it is an object. */
fun jsStepOf(result: Any?): JSStep {
    val o = jsBox(result)
    if (o == null || o === JSNull || o is String || o is Boolean || o is Double || o is JSSymbol) throw JSException(JSTypeError("Iterator result ${jsToString(result)} is not an object"))
    return JSStep(jsGet(o, "value"), jsTruthy(jsGet(o, "done")))
}

/** What iteration needs from any iterator, whatever its element type. */
interface JSIteratorProtocol {
    fun jsNext(value: Any?): JSStep
    fun jsReturn(value: Any?): JSStep
    fun jsThrow(error: Any?): JSStep
    val jsHasReturn: Boolean
    val jsHasThrow: Boolean
}

/** An object `for…of` can iterate however its type is held (`[Symbol.iterator]()`). */
interface JSIterableValue {
    fun jsAnyIterator(): JSIteratorProtocol
}

/** `Iterable<T>`: something that makes a fresh iterator each time it is iterated. */
open class JSIterable<T>(private val make: (() -> JSIterator<T>)? = null) : JSIterableValue {
    /** `iterable[Symbol.iterator]()`. */
    open fun jsIterator(): JSIterator<T> = make!!()
    override fun jsAnyIterator(): JSIteratorProtocol = jsIterator()
}

/**
 * A JavaScript iterator object: a built-in one (`array.keys()`, `map.entries()`) steps a
 * closure that returns `END` when done; generators and script iterators subclass it.
 * Single-pass: iterating it again continues where it stopped.
 */
open class JSIterator<T> internal constructor(private val step: (() -> Any?)?, private val tag: String) :
    JSIterable<T>(null), JSIteratorProtocol, Iterator<T>, Iterable<T>, JSDynamic, JSToStringTag {

    constructor(step: () -> Any?) : this(step, "Iterator")

    /** Done, or closed by a loop that left early. */
    var finished = false
        private set
    private var current: Any? = null
    private var buffered = false

    override fun jsNext(value: Any?): JSStep {
        if (!finished && step != null) {
            val v = step.invoke()
            if (v !== END) return JSStep(v, false)
        }
        finished = true
        return JSStep(null, true)
    }

    override fun jsReturn(value: Any?): JSStep { finished = true; return JSStep(value, true) }
    override fun jsThrow(error: Any?): JSStep { finished = true; throw JSException(error) }
    override val jsHasReturn: Boolean get() = false
    override val jsHasThrow: Boolean get() = false
    override fun jsIterator(): JSIterator<T> = this

    /** The next value into `jsCurrent`; false once done. A `next` that throws ends the loop. */
    fun jsAdvance(): Boolean {
        if (finished && step != null) return false
        try {
            val s = jsNext(null)
            if (s.done) { finished = true; return false }
            current = s.value
            return true
        } catch (e: Throwable) {
            finished = true
            throw e
        }
    }

    @Suppress("UNCHECKED_CAST")
    val jsCurrent: T get() = current as T

    /** IteratorClose for a loop leaving early (`break`, `return`, a throw): `return()` if it has one. */
    fun jsClose() {
        if (finished) return
        finished = true
        if (jsHasReturn) try { jsReturn(null) } catch (_: Throwable) {}
    }

    /** The remaining values, for a spread or `Array.from`. */
    fun jsCollect(): List<T> {
        val out = ArrayList<T>()
        while (jsAdvance()) out.add(jsCurrent)
        return out
    }

    /** The first `count` values, then closed, for an array pattern. */
    fun jsTake(count: Int): List<T> {
        val out = ArrayList<T>()
        while (out.size < count && jsAdvance()) out.add(jsCurrent)
        if (out.size == count) jsClose()
        return out
    }

    // Kotlin iteration, for code that cannot fail.
    override fun hasNext(): Boolean {
        if (!buffered) buffered = jsAdvance()
        return buffered
    }

    override fun next(): T {
        if (!hasNext()) throw NoSuchElementException()
        buffered = false
        return jsCurrent
    }

    override fun iterator(): Iterator<T> = this

    /** `iterator.next(value)`, `return(value)`, `throw(error)` as script calls them. */
    fun jsNextResult(value: Any? = null): Any? = jsIterResultObject(jsNext(value))
    fun jsReturnResult(value: Any? = null): Any? = jsIterResultObject(jsReturn(value))
    fun jsThrowResult(error: Any?): Any? = jsIterResultObject(jsThrow(error))

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Object"
    override val jsToStringTag: String get() = tag

    companion object {
        val END = Any()
    }
}

/** An iterator script wrote: an object literal's `next` (and `return`, `throw`). */
class JSScriptIterator<T>(
    private val nextResult: (Any?) -> Any?,
    private val returnResult: ((Any?) -> Any?)? = null,
    private val throwResult: ((Any?) -> Any?)? = null,
) : JSIterator<T>(null, "Object") {
    override fun jsNext(value: Any?): JSStep = jsStepOf(nextResult(value))
    override fun jsReturn(value: Any?): JSStep = returnResult?.let { jsStepOf(it(value)) } ?: JSStep(value, true)
    override fun jsThrow(error: Any?): JSStep = throwResult?.let { jsStepOf(it(error)) } ?: throw JSException(error)
    override val jsHasReturn: Boolean get() = returnResult != null
    override val jsHasThrow: Boolean get() = throwResult != null
}

/** An iterator held as another value's type: `[Symbol.iterator]()` returned a class with `next`. */
class JSIteratorAdapter<T>(private val inner: JSIteratorProtocol) : JSIterator<T>(null, "Object") {
    override fun jsNext(value: Any?): JSStep = inner.jsNext(value)
    override fun jsReturn(value: Any?): JSStep = inner.jsReturn(value)
    override fun jsThrow(error: Any?): JSStep = inner.jsThrow(error)
    override val jsHasReturn: Boolean get() = inner.jsHasReturn
    override val jsHasThrow: Boolean get() = inner.jsHasThrow
}

// Getting an iterator

fun <T> jsIterator(array: JSArray<T>): JSIterator<T> = array.values()
fun <T> jsIterator(set: JSSet<T>): JSIterator<T> = set.values()
fun <K, V> jsIterator(map: JSMap<K, V>): JSIterator<Pair<K, V>> = map.entries()
fun jsIterator(string: String): JSIterator<String> {
    val points = jsCodePoints(string).iterator()
    return JSIterator { if (points.hasNext()) points.next() else JSIterator.END }
}
fun <T> jsIterator(iterable: JSIterable<T>): JSIterator<T> = iterable.jsIterator()

/** A value held as `Iterable<T>`: each iteration starts over. */
fun <T> jsIterable(array: JSArray<T>): JSIterable<T> = JSIterable { jsIterator(array) }
fun <T> jsIterable(set: JSSet<T>): JSIterable<T> = JSIterable { jsIterator(set) }
fun <K, V> jsIterable(map: JSMap<K, V>): JSIterable<Pair<K, V>> = JSIterable { jsIterator(map) }
fun jsIterable(string: String): JSIterable<String> = JSIterable { jsIterator(string) }
fun <T> jsIterable(value: JSIterableValue): JSIterable<T> = JSIterable { JSIteratorAdapter<T>(value.jsAnyIterator()) }
fun <T> jsAsyncIterable(value: JSAsyncIterableValue): JSAsyncIterable<T> = JSAsyncIterable { JSAsyncIteratorAdapter<T>(value.jsAnyAsyncIterator()) }

/** GetIterator for an untyped value. */
fun jsIteratorOf(value: Any?): JSIterator<Any?> = when (val v = jsBox(value)) {
    is JSIterableValue -> JSIteratorAdapter(v.jsAnyIterator())
    is JSArray<*> -> { var i = 0; JSIterator { if (i < v.storage.size) v.storage[i++] else JSIterator.END } }
    is String -> JSIteratorAdapter(jsIterator(v))
    is JSSet<*> -> { val values = v.jsValues.iterator(); JSIterator { if (values.hasNext()) values.next() else JSIterator.END } }
    is JSMap<*, *> -> { val entries = v.jsEntries.iterator(); JSIterator { if (entries.hasNext()) entries.next().let { JSArray(arrayListOf(it.first, it.second)) } else JSIterator.END } }
    else -> throw JSException(JSTypeError("${jsToString(value)} is not iterable"))
}

// Generators

/**
 * Where a suspended body resumes: the rest of its code after a `yield`, and the
 * handlers a `throw()` or `return()` takes there (the enclosing catch and finally blocks).
 */
internal class JSResumption(val next: (Any?) -> Unit, val onThrow: (Any?) -> Unit, val onReturn: (Any?) -> Unit)

/** A resumption request: `next(v)`, `throw(e)` or `return(v)`. */
internal sealed class JSCompletion(val value: Any?) {
    class Normal(value: Any?) : JSCompletion(value)
    class Throw(value: Any?) : JSCompletion(value)
    class Return(value: Any?) : JSCompletion(value)
}

/** The body side of a generator: the lowered body calls it at each `yield` and at its end. */
class JSGeneratorContext internal constructor() {
    internal sealed class Outcome {
        class Yielded(val value: Any?) : Outcome()
        class Returned(val value: Any?) : Outcome()
        class Threw(val error: Any?) : Outcome()
    }
    internal var outcome: Outcome? = null
    internal var resumption: JSResumption? = null
    internal var delegated: Pair<JSIteratorProtocol, JSResumption>? = null

    /** `yield value`, the code after it continuing in `next`. */
    fun yield(value: Any?, next: (Any?) -> Unit, onThrow: (Any?) -> Unit, onReturn: (Any?) -> Unit) {
        resumption = JSResumption(next, onThrow, onReturn)
        outcome = Outcome.Yielded(value)
    }

    /** `yield* iterable`: its values pass through until it is done; `next` gets its return value. */
    fun delegate(inner: JSIteratorProtocol, next: (Any?) -> Unit, onThrow: (Any?) -> Unit, onReturn: (Any?) -> Unit) {
        delegated = Pair(inner, JSResumption(next, onThrow, onReturn))
        stepDelegate(JSCompletion.Normal(null))
    }

    internal fun stepDelegate(received: JSCompletion) {
        val (inner, r) = delegated ?: return
        try {
            val s: JSStep = when (received) {
                is JSCompletion.Normal -> inner.jsNext(received.value)
                is JSCompletion.Throw -> {
                    if (!inner.jsHasThrow) {
                        delegated = null
                        if (inner.jsHasReturn) try { inner.jsReturn(null) } catch (_: Throwable) {}
                        return r.onThrow(JSTypeError("The iterator does not provide a 'throw' method"))
                    }
                    inner.jsThrow(received.value)
                }
                is JSCompletion.Return -> {
                    if (!inner.jsHasReturn) { delegated = null; return r.onReturn(received.value) }
                    val s = inner.jsReturn(received.value)
                    if (s.done) { delegated = null; return r.onReturn(s.value) }
                    s
                }
            }
            if (s.done) { delegated = null; return r.next(s.value) }
            outcome = Outcome.Yielded(s.value)
        } catch (e: Throwable) {
            delegated = null
            r.onThrow(jsCaught(e))
        }
    }

    /** `return value`, or the end of the body. */
    fun returnValue(value: Any? = null) { outcome = Outcome.Returned(value) }

    /** An exception escaping the body. */
    fun throwValue(error: Any?) { outcome = Outcome.Threw(error) }

    internal fun reset() { resumption = null; delegated = null }
}

/** The function a lowered generator body routes its errors to. */
val JSGeneratorContext.onError: (Any?) -> Unit get() = { throwValue(it) }

/**
 * A generator object (`function*`): the body runs on the first `next()` up to a `yield`,
 * and each later call resumes it there.
 */
class JSGenerator<T>(body: (JSGeneratorContext) -> Unit) : JSIterator<T>(null, "Generator") {
    private enum class State { START, SUSPENDED, RUNNING, COMPLETED }
    private var state = State.START
    private var body: ((JSGeneratorContext) -> Unit)? = body
    private val context = JSGeneratorContext()

    private fun run(resume: () -> Unit): JSStep {
        state = State.RUNNING
        context.outcome = null
        resume()
        return when (val o = context.outcome) {
            is JSGeneratorContext.Outcome.Yielded -> { state = State.SUSPENDED; JSStep(o.value, false) }
            is JSGeneratorContext.Outcome.Returned -> { complete(); JSStep(o.value, true) }
            is JSGeneratorContext.Outcome.Threw -> { complete(); throw JSException(o.error) }
            null -> { complete(); JSStep(null, true) }
        }
    }

    private fun complete() {
        state = State.COMPLETED
        body = null
        context.reset()
    }

    private fun resume(c: JSCompletion): JSStep = when (state) {
        State.RUNNING -> throw JSException(JSTypeError("Generator is already running"))
        State.COMPLETED -> when (c) {
            is JSCompletion.Throw -> throw JSException(c.value)
            is JSCompletion.Return -> JSStep(c.value, true)
            is JSCompletion.Normal -> JSStep(null, true)
        }
        State.START -> when (c) {
            is JSCompletion.Normal -> {
                val b = body!!
                run { try { b(context) } catch (e: Throwable) { context.throwValue(jsCaught(e)) } }
            }
            is JSCompletion.Throw -> { complete(); throw JSException(c.value) }
            is JSCompletion.Return -> { complete(); JSStep(c.value, true) }
        }
        State.SUSPENDED -> {
            if (context.delegated != null) run { context.stepDelegate(c) }
            else {
                val r = context.resumption
                if (r == null) JSStep(null, true) else {
                    context.resumption = null
                    run {
                        when (c) {
                            is JSCompletion.Normal -> r.next(c.value)
                            is JSCompletion.Throw -> r.onThrow(c.value)
                            is JSCompletion.Return -> r.onReturn(c.value)
                        }
                    }
                }
            }
        }
    }

    override fun jsNext(value: Any?): JSStep = resume(JSCompletion.Normal(value))
    override fun jsReturn(value: Any?): JSStep = resume(JSCompletion.Return(value))
    override fun jsThrow(error: Any?): JSStep = resume(JSCompletion.Throw(error))
    override val jsHasReturn: Boolean get() = true
    override val jsHasThrow: Boolean get() = true
}

// Async iteration

/** What `for await` needs from any async iterator. */
interface JSAsyncIteratorProtocol {
    /** `next(value)`: a promise of the result object. */
    fun jsNextPromise(value: Any?): JSPromise<Any?>
    fun jsReturnPromise(value: Any?): JSPromise<Any?>?
    fun jsThrowPromise(error: Any?): JSPromise<Any?>?
}

/** An object `for await` can iterate (`[Symbol.asyncIterator]()`). */
interface JSAsyncIterableValue {
    fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol
}

/** `AsyncIterable<T>`. */
open class JSAsyncIterable<T>(private val make: (() -> JSAsyncIterator<T>)? = null) : JSAsyncIterableValue {
    open fun jsAsyncIterator(): JSAsyncIterator<T> = make!!()
    override fun jsAnyAsyncIterator(): JSAsyncIteratorProtocol = jsAsyncIterator()
}

/** An async iterator: an async generator, a script's, or a sync iterator `for await` adapts. */
open class JSAsyncIterator<T> internal constructor(private val tag: String) : JSAsyncIterable<T>(null), JSAsyncIteratorProtocol, JSDynamic, JSToStringTag {
    override fun jsNextPromise(value: Any?): JSPromise<Any?> = JSPromise.resolve(jsIterResultObject(JSStep(null, true)))
    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? = null
    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? = null
    override fun jsAsyncIterator(): JSAsyncIterator<T> = this

    /** `iterator.next(value)`, `return(value)`, `throw(error)` as script calls them. */
    fun next(value: Any? = null): JSPromise<Any?> = jsNextPromise(value)
    fun `return`(value: Any? = null): JSPromise<Any?> = jsReturnPromise(value) ?: JSPromise.resolve(jsIterResultObject(JSStep(value, true)))
    fun `throw`(error: Any?): JSPromise<Any?> = jsThrowPromise(error) ?: JSPromise.reject(error)

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Object"
    override val jsToStringTag: String get() = tag
}

private fun call(f: (Any?) -> JSPromise<Any?>, v: Any?): JSPromise<Any?> = try { f(v) } catch (e: Throwable) { JSPromise.reject(jsCaught(e)) }

/** An async iterator script wrote: `next` (and `return`, `throw`) returning promises of result objects. */
class JSScriptAsyncIterator<T>(
    private val nextResult: (Any?) -> JSPromise<Any?>,
    private val returnResult: ((Any?) -> JSPromise<Any?>)? = null,
    private val throwResult: ((Any?) -> JSPromise<Any?>)? = null,
) : JSAsyncIterator<T>("Object") {
    override fun jsNextPromise(value: Any?): JSPromise<Any?> = call(nextResult, value)
    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? = returnResult?.let { call(it, value) }
    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? = throwResult?.let { call(it, error) }
}

/** An async iterator held as another value's type (a class with an async `next`). */
class JSAsyncIteratorAdapter<T>(private val inner: JSAsyncIteratorProtocol) : JSAsyncIterator<T>("Object") {
    override fun jsNextPromise(value: Any?): JSPromise<Any?> = inner.jsNextPromise(value)
    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? = inner.jsReturnPromise(value)
    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? = inner.jsThrowPromise(error)
}

/** CreateAsyncFromSyncIterator (§27.1.6): `for await` over a sync iterable awaits each value. */
class JSAsyncFromSyncIterator<T>(private val sync: JSIteratorProtocol) : JSAsyncIterator<T>("Object") {
    /** AsyncFromSyncIteratorContinuation. */
    private fun continuation(result: () -> JSStep, closeOnRejection: Boolean): JSPromise<Any?> {
        val (promise, resolvers) = JSPromise.pending<Any?>()
        val step = try { result() } catch (e: Throwable) { resolvers.reject(jsCaught(e)); return promise }
        val done = step.done
        jsPromiseResolveAny(step.value).jsSubscribe({ resolvers.resolve(jsIterResultObject(JSStep(it, done))) }, { reason ->
            if (!done && closeOnRejection && sync.jsHasReturn) try { sync.jsReturn(null) } catch (_: Throwable) {}
            resolvers.reject(reason)
        })
        return promise
    }

    override fun jsNextPromise(value: Any?): JSPromise<Any?> = continuation({ sync.jsNext(value) }, true)

    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? {
        if (!sync.jsHasReturn) return JSPromise.resolve(jsIterResultObject(JSStep(value, true)))
        return continuation({ sync.jsReturn(value) }, false)
    }

    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? {
        if (!sync.jsHasThrow) {
            if (sync.jsHasReturn) try { sync.jsReturn(null) } catch (_: Throwable) {}
            return JSPromise.reject(JSTypeError("The iterator does not provide a 'throw' method"))
        }
        return continuation({ sync.jsThrow(error) }, true)
    }
}

/** GetIterator(value, async) for an untyped value. */
fun jsAsyncIteratorOf(value: Any?): JSAsyncIterator<Any?> {
    val v = jsBox(value)
    if (v is JSAsyncIterableValue) return JSAsyncIteratorAdapter(v.jsAnyAsyncIterator())
    return JSAsyncFromSyncIterator(jsIteratorOf(value))
}

/** AsyncIteratorClose for `for await` leaving early: awaits `return()` when the iterator has one. */
fun jsAsyncClose(iterator: JSAsyncIteratorProtocol, then: () -> Unit, onError: (Any?) -> Unit) {
    val promise = iterator.jsReturnPromise(null) ?: return then()
    jsAwait(promise, { result ->
        val o = jsBox(result)
        if (o == null || o === JSNull || o is String || o is Boolean || o is Double) onError(JSTypeError("Iterator result ${jsToString(result)} is not an object")) else then()
    }, onError)
}

/** `for await` leaving by a throw: the iterator is closed, and the throw wins over anything closing does. */
fun jsAsyncCloseThrowing(iterator: JSAsyncIteratorProtocol, error: Any?, onError: (Any?) -> Unit) {
    val promise = iterator.jsReturnPromise(null) ?: return onError(error)
    jsAwait(promise, { onError(error) }, { onError(error) })
}

/** The body side of an async generator. */
class JSAsyncGeneratorContext internal constructor() {
    internal var generator: java.lang.ref.WeakReference<JSAsyncGeneratorCore>? = null
    /** The generator while its body runs or awaits: pending jobs keep it alive, as in JavaScript. */
    internal var running: JSAsyncGeneratorCore? = null
    private val core: JSAsyncGeneratorCore? get() = generator?.get()

    /** `yield value`: awaited first, then handed to the request at the head of the queue. */
    fun yield(value: Any?, next: (Any?) -> Unit, onThrow: (Any?) -> Unit, onReturn: (Any?) -> Unit) {
        val r = JSResumption(next, onThrow, onReturn)
        jsAwaitValue(value, { core?.yielded(it, r) }, onThrow)
    }

    /** `yield* iterable` in an async generator. */
    fun delegate(inner: JSAsyncIteratorProtocol, next: (Any?) -> Unit, onThrow: (Any?) -> Unit, onReturn: (Any?) -> Unit) {
        core?.delegate(inner, JSResumption(next, onThrow, onReturn), JSCompletion.Normal(null))
    }

    /** `return value` once its value was awaited, or `return` / the end of the body. */
    fun returnValue(value: Any? = null) { core?.finished(JSCompletion.Normal(value)) }

    /** An exception escaping the body. */
    fun throwValue(error: Any?) { core?.finished(JSCompletion.Throw(error)) }
}

/** The function a lowered async generator body routes its errors to. */
val JSAsyncGeneratorContext.onError: (Any?) -> Unit get() = { throwValue(it) }

/** The queue and states of an async generator (§27.6.3). */
internal class JSAsyncGeneratorCore(body: (JSAsyncGeneratorContext) -> Unit) {
    enum class State { SUSPENDED_START, SUSPENDED_YIELD, EXECUTING, AWAITING_RETURN, COMPLETED }
    private class Request(val completion: JSCompletion, val resolvers: JSResolvers<Any?>)

    var state = State.SUSPENDED_START
    private val queue = ArrayDeque<Request>()
    private var body: ((JSAsyncGeneratorContext) -> Unit)? = body
    private val context = JSAsyncGeneratorContext()
    private var resumption: JSResumption? = null
    private var delegation: Pair<JSAsyncIteratorProtocol, JSResumption>? = null

    init { context.generator = java.lang.ref.WeakReference(this) }

    /** AsyncGeneratorEnqueue, then a resume when the generator is suspended. */
    fun request(completion: JSCompletion): JSPromise<Any?> {
        val (promise, resolvers) = JSPromise.pending<Any?>()
        if (completion is JSCompletion.Normal && state == State.COMPLETED) {
            resolvers.resolve(jsIterResultObject(JSStep(null, true)))
            return promise
        }
        if (completion is JSCompletion.Throw && (state == State.SUSPENDED_START || state == State.COMPLETED)) {
            state = State.COMPLETED
            body = null
            resolvers.reject(completion.value)
            return promise
        }
        queue.addLast(Request(completion, resolvers))
        if (completion is JSCompletion.Return && (state == State.SUSPENDED_START || state == State.COMPLETED)) {
            state = State.AWAITING_RETURN
            awaitReturn()
        } else if (state == State.SUSPENDED_START || state == State.SUSPENDED_YIELD) {
            resume(completion)
        }
        return promise
    }

    /** AsyncGeneratorResume. */
    private fun resume(completion: JSCompletion) {
        val wasStart = state == State.SUSPENDED_START
        state = State.EXECUTING
        context.running = this
        if (wasStart) {
            val b = body!!
            body = null
            try { b(context) } catch (e: Throwable) { finished(JSCompletion.Throw(jsCaught(e))) }
            return
        }
        if (delegation != null) return stepDelegate(completion)
        val r = resumption ?: return
        resumption = null
        unwrapResumption(completion, r)
    }

    /** AsyncGeneratorUnwrapYieldResumption: a `return()` awaits its value before it unwinds the body. */
    private fun unwrapResumption(completion: JSCompletion, r: JSResumption) {
        when (completion) {
            is JSCompletion.Normal -> r.next(completion.value)
            is JSCompletion.Throw -> r.onThrow(completion.value)
            is JSCompletion.Return -> jsAwaitValue(completion.value, { r.onReturn(it) }, { r.onThrow(it) })
        }
    }

    /** AsyncGeneratorCompleteStep. */
    private fun completeStep(completion: JSCompletion, done: Boolean) {
        val next = queue.removeFirstOrNull() ?: return
        if (completion is JSCompletion.Throw) next.resolvers.reject(completion.value)
        else next.resolvers.resolve(jsIterResultObject(JSStep(completion.value, done)))
    }

    /** AsyncGeneratorYield, after the value was awaited. */
    fun yielded(value: Any?, r: JSResumption) {
        completeStep(JSCompletion.Normal(value), false)
        val head = queue.firstOrNull()
        if (head != null) return unwrapResumption(head.completion, r)
        state = State.SUSPENDED_YIELD
        resumption = r
        context.running = null
    }

    /** The body completed (a return's value already awaited) or threw. */
    fun finished(completion: JSCompletion) {
        state = State.COMPLETED
        resumption = null
        delegation = null
        completeStep(completion, true)
        drainQueue()
        if (state == State.COMPLETED) context.running = null
    }

    /** AsyncGeneratorAwaitReturn. */
    private fun awaitReturn() {
        val head = queue.firstOrNull() ?: return
        if (head.completion !is JSCompletion.Return) return
        context.running = this
        jsAwaitValue(head.completion.value, { value ->
            state = State.COMPLETED
            completeStep(JSCompletion.Normal(value), true)
            drainQueue()
            if (state == State.COMPLETED) context.running = null
        }, { reason ->
            state = State.COMPLETED
            completeStep(JSCompletion.Throw(reason), true)
            drainQueue()
            if (state == State.COMPLETED) context.running = null
        })
    }

    /** AsyncGeneratorDrainQueue. */
    private fun drainQueue() {
        while (true) {
            val head = queue.firstOrNull() ?: return
            if (head.completion is JSCompletion.Return) {
                state = State.AWAITING_RETURN
                awaitReturn()
                return
            }
            completeStep(if (head.completion is JSCompletion.Throw) head.completion else JSCompletion.Normal(null), true)
        }
    }

    // yield*

    fun delegate(inner: JSAsyncIteratorProtocol, r: JSResumption, received: JSCompletion) {
        delegation = Pair(inner, r)
        stepDelegate(received)
    }

    private fun stepDelegate(received: JSCompletion) {
        val (inner, r) = delegation ?: return
        val awaitedStep = { promise: JSPromise<Any?>, onDone: (Any?) -> Unit ->
            jsAwait(promise, { result ->
                val step = try { jsStepOf(result) } catch (e: Throwable) { delegation = null; r.onThrow(jsCaught(e)); null }
                if (step != null) {
                    if (step.done) { delegation = null; onDone(step.value) } else {
                        completeStep(JSCompletion.Normal(step.value), false)
                        val head = queue.firstOrNull()
                        if (head != null) unwrapDelegate(head.completion) else { state = State.SUSPENDED_YIELD; context.running = null }
                    }
                }
            }, { reason -> delegation = null; r.onThrow(reason) })
        }
        when (received) {
            is JSCompletion.Normal -> awaitedStep(inner.jsNextPromise(received.value), r.next)
            is JSCompletion.Throw -> {
                val promise = inner.jsThrowPromise(received.value)
                if (promise == null) {
                    delegation = null
                    jsAsyncClose(inner, { r.onThrow(JSTypeError("The iterator does not provide a 'throw' method")) }, r.onThrow)
                } else awaitedStep(promise, r.next)
            }
            is JSCompletion.Return -> {
                val promise = inner.jsReturnPromise(received.value)
                if (promise == null) { delegation = null; r.onReturn(received.value) } else awaitedStep(promise, r.onReturn)
            }
        }
    }

    /** A request taken while delegating: a `return()` awaits its value first, as at a `yield`. */
    private fun unwrapDelegate(completion: JSCompletion) {
        if (completion is JSCompletion.Return) jsAwaitValue(completion.value, { stepDelegate(JSCompletion.Return(it)) }, { stepDelegate(JSCompletion.Throw(it)) })
        else stepDelegate(completion)
    }
}

/** An async generator object (`async function*`). */
class JSAsyncGenerator<T>(body: (JSAsyncGeneratorContext) -> Unit) : JSAsyncIterator<T>("AsyncGenerator") {
    private val core = JSAsyncGeneratorCore(body)

    override fun jsNextPromise(value: Any?): JSPromise<Any?> = core.request(JSCompletion.Normal(value))
    override fun jsReturnPromise(value: Any?): JSPromise<Any?>? = core.request(JSCompletion.Return(value))
    override fun jsThrowPromise(error: Any?): JSPromise<Any?>? = core.request(JSCompletion.Throw(error))
}
