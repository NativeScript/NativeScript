package org.nativescript.kit

// The RxJS subset Angular services use, with RxJS 7's semantics: subscribers
// are called synchronously in subscription order, a BehaviorSubject replays
// its value to each new subscriber, and an operator subscribes to its source
// once per subscriber.

class RxSubscription internal constructor(private var teardown: (() -> Unit)? = null) {
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

open class RxObservable<T>(private val producer: ((T) -> Unit) -> RxSubscription) {
    open fun subscribe(next: (T) -> Unit): RxSubscription = producer(next)

    fun <A> pipe(a: RxOperatorFunction<T, A>): RxObservable<A> = a.apply(this)

    fun <A, B> pipe(a: RxOperatorFunction<T, A>, b: RxOperatorFunction<A, B>): RxObservable<B> = b.apply(a.apply(this))

    fun <A, B, C> pipe(a: RxOperatorFunction<T, A>, b: RxOperatorFunction<A, B>, c: RxOperatorFunction<B, C>): RxObservable<C> = c.apply(b.apply(a.apply(this)))
}

class RxOperatorFunction<T, R> internal constructor(internal val apply: (RxObservable<T>) -> RxObservable<R>)

/** `map(project)`: each value projected, with its index among the values this subscription saw. */
fun <T, R> map(project: (T, Double) -> R): RxOperatorFunction<T, R> = RxOperatorFunction { source ->
    RxObservable { next ->
        var index = 0.0
        source.subscribe { value ->
            val i = index
            index += 1
            next(project(value, i))
        }
    }
}

@JvmName("mapValue")
fun <T, R> map(project: (T) -> R): RxOperatorFunction<T, R> = map { value: T, _: Double -> project(value) }

/** `filter(predicate)`: the values the predicate holds for, with each value's index among those this subscription saw. */
fun <T> filter(predicate: (T, Double) -> Boolean): RxOperatorFunction<T, T> = RxOperatorFunction { source ->
    RxObservable { next ->
        var index = 0.0
        source.subscribe { value ->
            val i = index
            index += 1
            try {
                if (predicate(value, i)) next(value)
            } catch (e: Throwable) {
                jsReportUncaught(jsCaught(e))
            }
        }
    }
}

@JvmName("filterValue")
fun <T> filter(predicate: (T) -> Boolean): RxOperatorFunction<T, T> = filter { value: T, _: Double -> predicate(value) }

/**
 * `toSignal(source, { initialValue })`: a signal holding the source's latest value, subscribed for as
 * long as the scope it was made in lives, its writes compared with `Object.is` as Angular's signals compare them.
 */
fun <T> toSignal(source: RxObservable<T>, initialValue: T): Signal<T> {
    val signal = Signal(initialValue) { a, b -> jsSameValue(a, b) }
    val subscription = source.subscribe { value -> signal.value = value }
    Owner.current?.onCleanup { subscription.unsubscribe() }
    return signal
}

open class RxSubject<T> : RxObservable<T>({ RxSubscription() }) {
    private class Observer<T>(val next: (T) -> Unit)

    private val observers = mutableListOf<Observer<T>>()

    override fun subscribe(next: (T) -> Unit): RxSubscription = add(next)

    internal open fun add(next: (T) -> Unit): RxSubscription {
        val observer = Observer(next)
        observers.add(observer)
        return RxSubscription { observers.remove(observer) }
    }

    /** Calls the observers subscribed when `next` is called, as RxJS copies its observer list. */
    open fun next(value: T) {
        for (observer in observers.toList()) observer.next(value)
    }

    fun asObservable(): RxObservable<T> = RxObservable { next -> subscribe(next) }
}

class RxBehaviorSubject<T>(private var current: T) : RxSubject<T>() {
    val value: T get() = current

    @JvmName("currentValue")
    fun getValue(): T = current

    override fun add(next: (T) -> Unit): RxSubscription {
        val subscription = super.add(next)
        if (!subscription.closed) next(current)
        return subscription
    }

    override fun next(value: T) {
        current = value
        super.next(value)
    }
}

/**
 * Angular's `async` pipe at one binding site: subscribes to the observable
 * it is given (again when given another), and returns its latest value.
 */
class AsyncPipe {
    private var source: Any? = null
    private var subscription: RxSubscription? = null
    private var latest: Any? = null

    init {
        Owner.current?.onCleanup { dispose() }
    }

    @Suppress("UNCHECKED_CAST")
    fun <T> transform(observable: RxObservable<T>?): T? {
        if (observable !== source) {
            dispose()
            source = observable
            subscription = observable?.subscribe { value -> latest = value }
        }
        return latest as T?
    }

    private fun dispose() {
        subscription?.unsubscribe()
        subscription = null
        source = null
        latest = null
    }
}
