package org.nativescript.kit

// What translated code calls for constructs Kotlin has no direct expression for.

/** A tuple's elements, for code that uses it as an array. */
fun jsTupleList(tuple: Any?): List<Any?> = when (tuple) {
    is Pair<*, *> -> listOf(tuple.first, tuple.second)
    is Triple<*, *, *> -> listOf(tuple.first, tuple.second, tuple.third)
    is JSArray<*> -> tuple.storage
    else -> emptyList()
}

/** The function a lowered async body routes its errors to. */
val <T> JSAsync<T>.onError: (Any?) -> Unit get() = { throwValue(it) }

/** `Math.log2`: exact for powers of two, as V8's is. */
fun jsLog2(x: Double): Double {
    if (x > 0 && !x.isInfinite()) {
        val bits = java.lang.Double.doubleToRawLongBits(x)
        if (bits and 0x000FFFFFFFFFFFFFL == 0L && (bits ushr 52) != 0L) return ((bits ushr 52) - 1023).toDouble()
    }
    return Math.log(x) / Math.log(2.0)
}

private fun jsSettledCore(thenables: List<JSThenable>, finish: (List<JSObject>) -> Any?): Pair<JSPromise<Any?>, JSResolvers<Any?>> {
    val (result, resolvers) = JSPromise.pending<Any?>()
    val values = MutableList<JSObject?>(thenables.size) { null }
    var remaining = thenables.size
    for ((index, t) in thenables.withIndex()) {
        var called = false
        val settle = { o: JSObject ->
            if (!called) {
                called = true
                values[index] = o
                remaining--
                if (remaining == 0) resolvers.resolve(finish(values.map { it!! }))
            }
        }
        t.jsSubscribe({ settle(JSObject("status" to "fulfilled", "value" to it)) }, { settle(JSObject("status" to "rejected", "reason" to it)) })
    }
    return Pair(result, resolvers)
}

/** `Promise.allSettled([a, b])`. */
@Suppress("UNCHECKED_CAST")
fun jsPromiseAllSettled(a: Any?, b: Any?): JSPromise<Pair<JSObject, JSObject>> =
    jsSettledCore(listOf(jsPromiseResolveAny(a), jsPromiseResolveAny(b))) { Pair(it[0], it[1]) }.first as JSPromise<Pair<JSObject, JSObject>>

/** `Promise.allSettled([a, b, c])`. */
@Suppress("UNCHECKED_CAST")
fun jsPromiseAllSettled(a: Any?, b: Any?, c: Any?): JSPromise<Triple<JSObject, JSObject, JSObject>> =
    jsSettledCore(listOf(jsPromiseResolveAny(a), jsPromiseResolveAny(b), jsPromiseResolveAny(c))) { Triple(it[0], it[1], it[2]) }.first as JSPromise<Triple<JSObject, JSObject, JSObject>>

/** `new Array(n)`: `n` holes, which reads give as undefined and `Object.keys`, `for…in` and JSON leave out or write as null. */
@Suppress("UNCHECKED_CAST")
fun <T> jsArrayOfHoles(length: Double): JSArray<T> {
    if (length < 0 || length > 4_294_967_295.0 || length != Math.floor(length)) throw JSException(JSRangeError("Invalid array length"))
    val n = length.toInt()
    return JSArray(ArrayList<T>(List(n) { null as T })).also { if (n > 0) it.jsHoles = java.util.BitSet().apply { set(0, n) } }
}

/** An untyped value where a promise goes (`x as unknown as Promise<T>`): the promise it is, else one that adopts it as `Promise.resolve` does. */
@Suppress("UNCHECKED_CAST")
fun <T> jsPromiseOf(value: Any?): JSPromise<T> = value as? JSPromise<T> ?: JSPromise.resolve<Any?>(value) as JSPromise<T>
