package org.nativescript.kit

// ES2023's arrays changed by copy (toSorted and toReversed are in Array.kt) and ES2024's grouping and withResolvers.

/** `array.findLast(callback)` with a callback taking the array too. */
fun <T> JSArray<T>.findLast(f: (T, Double, JSArray<T>) -> Boolean): T? = findLast { v: T, i: Double -> f(v, i, this) }

/** `array.findLastIndex(callback)` with a callback taking the array too. */
fun <T> JSArray<T>.findLastIndex(f: (T, Double, JSArray<T>) -> Boolean): Double = findLastIndex { v: T, i: Double -> f(v, i, this) }

/** `array.toSpliced(start, deleteCount, ...items)`: a copy with the splice made; a missing deleteCount removes to the end. */
fun <T> JSArray<T>.toSpliced(start: Double, deleteCount: Double? = null, vararg items: T): JSArray<T> = toSplicedAll(start, deleteCount, items.asList())

/** `array.toSpliced(start, deleteCount, ...items)` with the items spread from one list. */
fun <T> JSArray<T>.toSplicedAll(start: Double, deleteCount: Double?, items: Iterable<T>): JSArray<T> {
    val copy = JSArray(ArrayList(elements))
    copy.spliceAll(start, deleteCount, items)
    return copy
}

/** `array.with(index, value)`: a copy with one element replaced; negative indexes count from the end. */
fun <T> JSArray<T>.with(index: Double, value: T): JSArray<T> {
    val copy = ArrayList(elements)
    val relative = jsToIntegerOrInfinity(index)
    val k = if (relative >= 0) relative else copy.size + relative
    if (k < 0 || k >= copy.size) throw JSException(JSRangeError("Invalid index : ${jsNumberToString(index)}"))
    copy[k.toInt()] = value
    return JSArray(copy)
}

/**
 * `Object.groupBy(items, callback)`: the items under the property key the callback gives each, in JavaScript's key
 * order. Each group is a `JSArray<T>` held as the record's `V`, which the result's type says.
 */
@Suppress("UNCHECKED_CAST")
fun <T, V> jsObjectGroupBy(items: Iterable<T>, key: (T, Double) -> Any?): JSRecord<V> {
    val groups = LinkedHashMap<String, JSArray<T>>()
    var index = 0.0
    for (item in items) {
        val name = jsToString(key(item, index))
        index += 1
        val group = groups[name]
        if (group != null) group.push(item) else groups[name] = JSArray(arrayListOf(item))
    }
    val record = JSRecord<V>()
    for ((name, group) in groups) record[name] = group as V
    return record
}

/** `Object.groupBy(items, callback)` with a callback taking only the item. */
fun <T, V> jsObjectGroupBy(items: Iterable<T>, key: (T) -> Any?): JSRecord<V> = jsObjectGroupBy(items) { item: T, _: Double -> key(item) }

/** `Map.groupBy(items, callback)`: the items under the key the callback gives each, keys compared as a Map's are. */
fun <T, K> jsMapGroupBy(items: Iterable<T>, key: (T, Double) -> K): JSMap<K, JSArray<T>> {
    val groups = JSMap<K, JSArray<T>>()
    var index = 0.0
    for (item in items) {
        val k = key(item, index)
        index += 1
        val group = groups.get(k)
        if (group != null) group.push(item) else groups.set(k, JSArray(arrayListOf(item)))
    }
    return groups
}

/** `Map.groupBy(items, callback)` with a callback taking only the item. */
fun <T, K> jsMapGroupBy(items: Iterable<T>, key: (T) -> K): JSMap<K, JSArray<T>> = jsMapGroupBy(items) { item: T, _: Double -> key(item) }

/**
 * `Promise.withResolvers()`'s object. `resolve` takes what TypeScript types it to (`T | PromiseLike<T>`): a value, or a
 * promise or thenable whose state the promise then follows.
 */
@Suppress("UNCHECKED_CAST")
class JSPromiseWithResolvers<T> {
    private val resolvers: JSResolvers<T>
    val promise: JSPromise<T>

    init {
        val (p, r) = JSPromise.pending<T>()
        promise = p
        resolvers = r
    }

    val resolve: (Any?) -> Unit = { value ->
        when (val v = jsBox(value)) {
            is JSPromise<*> -> resolvers.resolvePromise(v as JSPromise<T>)
            is JSThenable -> v.jsSubscribe({ resolvers.resolve(it as T) }, { resolvers.reject(it) })
            else -> resolvers.resolve(value as T)
        }
    }

    val reject: (Any?) -> Unit = { reason -> resolvers.reject(reason) }
}
