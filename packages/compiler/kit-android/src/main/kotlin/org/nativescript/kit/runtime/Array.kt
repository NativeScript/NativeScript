package org.nativescript.kit

/**
 * A JavaScript array: reference semantics, JavaScript method names, `Double` indexes and lengths.
 * Reading past the end is undefined through `element`, which translated code uses for `a[i]`.
 */
class JSArray<T>(storage: ArrayList<T>) : Iterable<T>, JSReactiveConvertible {
    var storage: ArrayList<T> = storage
        internal set
    var jsTracker: JSTracker? = null

    constructor() : this(ArrayList())
    constructor(items: Collection<T>) : this(ArrayList(items))

    private fun track() { jsTracker?.track() }
    private fun trigger() { jsTracker?.trigger() }

    private fun read(i: Int): T {
        val v = storage[i]
        if (jsTracker != null) jsReactiveAny(v)
        return v
    }

    // Elements

    val size: Int
        get() { track(); return storage.size }

    /** The elements as a list, read through the tracker. */
    val elements: List<T>
        get() {
            track()
            if (jsTracker != null) storage.forEach { jsReactiveAny(it) }
            return storage
        }

    /** `array.length`. Setting it shorter truncates; longer fills with undefined. */
    var length: Double
        get() { track(); return storage.size.toDouble() }
        set(value) {
            if (value < 0 || value > 4_294_967_295.0 || value != Math.floor(value)) throw JSException(JSRangeError("Invalid array length"))
            setLength(value.toInt())
        }

    @Suppress("UNCHECKED_CAST")
    internal fun setLength(n: Int) {
        if (n < storage.size) {
            while (storage.size > n) storage.removeAt(storage.size - 1)
            trigger()
        } else if (n > storage.size) {
            while (storage.size < n) storage.add(null as T)
            trigger()
        }
    }

    /** `a[i]` as JavaScript reads it: undefined unless `i` is an integer index in range. */
    fun element(i: Double): T? {
        track()
        if (i != Math.floor(i) || i < 0 || i >= storage.size) return null
        return read(i.toInt())
    }

    operator fun get(i: Int): T {
        track()
        return read(i)
    }

    operator fun get(i: Double): T = get(i.toInt())

    @Suppress("UNCHECKED_CAST")
    operator fun set(i: Int, value: T) {
        when {
            i < storage.size -> storage[i] = value
            else -> {
                while (storage.size < i) storage.add(null as T)
                storage.add(value)
            }
        }
        trigger()
    }

    operator fun set(i: Double, value: T) {
        if (i < 0 || i != Math.floor(i) || i >= 4_294_967_295.0) return
        set(i.toInt(), value)
    }

    @Suppress("UNCHECKED_CAST")
    internal fun setAt(i: Int, value: Any?) = set(i, value as T)

    fun at(i: Double): T? {
        track()
        var k = jsToIntegerOrInfinity(i)
        if (k < 0) k += storage.size
        return if (k >= 0 && k < storage.size) read(k.toInt()) else null
    }

    override fun iterator(): Iterator<T> {
        var i = 0
        return object : Iterator<T> {
            override fun hasNext(): Boolean { track(); return i < storage.size }
            override fun next(): T = read(i++)
        }
    }

    fun keys(): JSIterator<Double> {
        var i = 0
        return JSIterator { if (i < size) (i++).toDouble() else JSIterator.END }
    }

    fun values(): JSIterator<T> {
        var i = 0
        return JSIterator { if (i < size) read(i++) else JSIterator.END }
    }

    fun entries(): JSIterator<Pair<Double, T>> {
        var i = 0
        return JSIterator { if (i < size) Pair(i.toDouble(), read(i++)) else JSIterator.END }
    }

    // Mutation

    fun push(vararg items: T): Double {
        storage.addAll(items)
        trigger()
        return storage.size.toDouble()
    }

    /** `a.push(...items)`. */
    fun pushAll(items: Iterable<T>): Double {
        for (item in items.toList()) storage.add(item)
        trigger()
        return storage.size.toDouble()
    }

    fun pop(): T? {
        if (storage.isEmpty()) return null
        val v = storage.removeAt(storage.size - 1)
        trigger()
        return v
    }

    fun shift(): T? {
        if (storage.isEmpty()) return null
        val v = storage.removeAt(0)
        trigger()
        return v
    }

    fun unshift(vararg items: T): Double {
        storage.addAll(0, items.toList())
        trigger()
        return storage.size.toDouble()
    }

    fun unshiftAll(items: Iterable<T>): Double {
        storage.addAll(0, items.toList())
        trigger()
        return storage.size.toDouble()
    }

    /** `a.splice(start, deleteCount, ...items)`; a missing deleteCount removes to the end. */
    fun splice(start: Double, deleteCount: Double? = null, vararg items: T): JSArray<T> = spliceAll(start, deleteCount, items.asList())

    /** `a.splice(start, deleteCount, ...items)` with the items spread from one list. */
    fun spliceAll(start: Double, deleteCount: Double?, items: Iterable<T>): JSArray<T> {
        val n = storage.size
        val s = jsRelativeIndex(start, n)
        val d = if (deleteCount == null) n - s else maxOf(0, minOf(jsToIntegerOrInfinity(deleteCount).clampToInt(), n - s))
        val removed = ArrayList(storage.subList(s, s + d))
        storage.subList(s, s + d).clear()
        val added = items.toList()
        storage.addAll(s, added)
        if (d > 0 || added.isNotEmpty()) trigger()
        return JSArray(removed)
    }

    fun reverse(): JSArray<T> {
        storage.reverse()
        trigger()
        return this
    }

    /** `array.sort()`: in place and stable, by string form in UTF-16 order, undefined last. */
    fun sort(): JSArray<T> {
        val defined = ArrayList<Pair<String, T>>()
        val undefined = ArrayList<T>()
        for (e in storage) if (e == null || e === Unit) undefined.add(e) else defined.add(Pair(if (e is String) e else jsToString(e), e))
        jsMergeSort(defined) { a, b -> a.first < b.first }
        storage = ArrayList(defined.map { it.second } + undefined)
        trigger()
        return this
    }

    /** `array.sort(compare)`: in place and stable; undefined last without being compared, NaN counts as 0. */
    fun sort(compare: (T, T) -> Double): JSArray<T> {
        val defined = ArrayList<T>()
        val undefined = ArrayList<T>()
        for (e in storage) if (e == null || e === Unit) undefined.add(e) else defined.add(e)
        jsMergeSort(defined) { a, b -> compare(a, b) < 0 }
        storage = ArrayList(defined + undefined)
        trigger()
        return this
    }

    fun fill(value: T, start: Double = 0.0, end: Double? = null): JSArray<T> {
        val n = storage.size
        val s = jsRelativeIndex(start, n)
        val e = if (end == null) n else jsRelativeIndex(end, n)
        for (i in s until e) storage[i] = value
        trigger()
        return this
    }

    // Copies and searches

    fun slice(start: Double = 0.0, end: Double? = null): JSArray<T> {
        track()
        val n = storage.size
        val s = jsRelativeIndex(start, n)
        val e = if (end == null) n else jsRelativeIndex(end, n)
        return if (s < e) JSArray(ArrayList(storage.subList(s, e))) else JSArray()
    }

    /** `array.concat(...items)`: an item that is an array adds its elements. */
    @Suppress("UNCHECKED_CAST")
    fun concatSpread(items: List<T>): JSArray<T> {
        val out = ArrayList(elements)
        for (item in items) if (item is JSArray<*>) out.addAll(item.elements as List<T>) else out.add(item)
        return JSArray(out)
    }

    fun concat(vararg parts: JSArray<T>): JSArray<T> {
        val out = ArrayList(elements)
        for (p in parts) out.addAll(p.elements)
        return JSArray(out)
    }

    fun toReversed(): JSArray<T> = JSArray(ArrayList(elements.reversed()))
    fun toSorted(): JSArray<T> = JSArray(ArrayList(elements)).sort()
    fun toSorted(compare: (T, T) -> Double): JSArray<T> = JSArray(ArrayList(elements)).sort(compare)

    fun indexOf(value: Any?, fromIndex: Double = 0.0): Double {
        val n = size
        for (i in jsRelativeIndex(fromIndex, n) until n) if (jsStrictEquals(storage[i], value)) return i.toDouble()
        return -1.0
    }

    fun lastIndexOf(value: Any?, fromIndex: Double? = null): Double {
        val n = size
        var i = if (fromIndex == null) n - 1 else { val k = jsToIntegerOrInfinity(fromIndex); if (k < 0) (n + k).clampToInt() else minOf(k, (n - 1).toDouble()).toInt() }
        while (i >= 0) { if (jsStrictEquals(storage[i], value)) return i.toDouble(); i-- }
        return -1.0
    }

    fun includes(value: Any?, fromIndex: Double = 0.0): Boolean {
        val n = size
        for (i in jsRelativeIndex(fromIndex, n) until n) if (jsSameValueZero(storage[i], value)) return true
        return false
    }

    // Callbacks see the length the array had when the call started, and current elements.

    fun find(f: (T) -> Boolean): T? = find { v, _, _ -> f(v) }
    fun find(f: (T, Double) -> Boolean): T? = find { v, i, _ -> f(v, i) }
    fun find(f: (T, Double, JSArray<T>) -> Boolean): T? {
        for (i in 0 until size) { val v = read(i); if (f(v, i.toDouble(), this)) return v }
        return null
    }

    fun findIndex(f: (T) -> Boolean): Double = findIndex { v, _, _ -> f(v) }
    fun findIndex(f: (T, Double) -> Boolean): Double = findIndex { v, i, _ -> f(v, i) }
    fun findIndex(f: (T, Double, JSArray<T>) -> Boolean): Double {
        for (i in 0 until size) if (f(read(i), i.toDouble(), this)) return i.toDouble()
        return -1.0
    }

    fun findLast(f: (T) -> Boolean): T? = findLast { v, _ -> f(v) }
    fun findLast(f: (T, Double) -> Boolean): T? {
        for (i in size - 1 downTo 0) { val v = read(i); if (f(v, i.toDouble())) return v }
        return null
    }

    fun findLastIndex(f: (T) -> Boolean): Double = findLastIndex { v, _ -> f(v) }
    fun findLastIndex(f: (T, Double) -> Boolean): Double {
        for (i in size - 1 downTo 0) if (f(read(i), i.toDouble())) return i.toDouble()
        return -1.0
    }

    fun some(f: (T) -> Boolean): Boolean = some { v, _, _ -> f(v) }
    fun some(f: (T, Double) -> Boolean): Boolean = some { v, i, _ -> f(v, i) }
    fun some(f: (T, Double, JSArray<T>) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, storage.size)) if (f(read(i), i.toDouble(), this)) return true
        return false
    }

    fun every(f: (T) -> Boolean): Boolean = every { v, _, _ -> f(v) }
    fun every(f: (T, Double) -> Boolean): Boolean = every { v, i, _ -> f(v, i) }
    fun every(f: (T, Double, JSArray<T>) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, storage.size)) if (!f(read(i), i.toDouble(), this)) return false
        return true
    }

    fun forEach(f: (T) -> Unit) = forEach { v, _, _ -> f(v) }
    fun forEach(f: (T, Double) -> Unit) = forEach { v, i, _ -> f(v, i) }
    fun forEach(f: (T, Double, JSArray<T>) -> Unit) {
        val n = size
        var i = 0
        while (i < n && i < storage.size) { f(read(i), i.toDouble(), this); i++ }
    }

    fun <U> map(f: (T) -> U): JSArray<U> = map { v, _, _ -> f(v) }
    fun <U> map(f: (T, Double) -> U): JSArray<U> = map { v, i, _ -> f(v, i) }
    fun <U> map(f: (T, Double, JSArray<T>) -> U): JSArray<U> {
        val n = size
        val out = ArrayList<U>(n)
        var i = 0
        while (i < n && i < storage.size) { out.add(f(read(i), i.toDouble(), this)); i++ }
        return JSArray(out)
    }

    fun filter(f: (T) -> Boolean): JSArray<T> = filter { v, _, _ -> f(v) }
    fun filter(f: (T, Double) -> Boolean): JSArray<T> = filter { v, i, _ -> f(v, i) }
    fun filter(f: (T, Double, JSArray<T>) -> Boolean): JSArray<T> {
        val n = size
        val out = ArrayList<T>()
        var i = 0
        while (i < n && i < storage.size) { val v = read(i); if (f(v, i.toDouble(), this)) out.add(v); i++ }
        return JSArray(out)
    }

    fun <U> flatMap(f: (T) -> JSArray<U>): JSArray<U> = flatMap { v, _ -> f(v) }
    fun <U> flatMap(f: (T, Double) -> JSArray<U>): JSArray<U> {
        val out = ArrayList<U>()
        val n = size
        var i = 0
        while (i < n && i < storage.size) { out.addAll(f(read(i), i.toDouble()).storage); i++ }
        return JSArray(out)
    }

    fun <U> reduce(f: (U, T) -> U, initial: U): U = reduce({ a, v, _ -> f(a, v) }, initial)
    fun <U> reduce(f: (U, T, Double) -> U, initial: U): U {
        var acc = initial
        val n = size
        var i = 0
        while (i < n && i < storage.size) { acc = f(acc, read(i), i.toDouble()); i++ }
        return acc
    }

    fun reduce(f: (T, T) -> T): T = reduce { a, v, _ -> f(a, v) }
    fun reduce(f: (T, T, Double) -> T): T {
        if (size == 0) throw JSException(JSTypeError("Reduce of empty array with no initial value"))
        var acc = read(0)
        for (i in 1 until size) acc = f(acc, read(i), i.toDouble())
        return acc
    }

    fun <U> reduceRight(f: (U, T) -> U, initial: U): U = reduceRight({ a, v, _ -> f(a, v) }, initial)
    fun <U> reduceRight(f: (U, T, Double) -> U, initial: U): U {
        var acc = initial
        for (i in size - 1 downTo 0) acc = f(acc, read(i), i.toDouble())
        return acc
    }

    fun reduceRight(f: (T, T) -> T): T {
        if (size == 0) throw JSException(JSTypeError("Reduce of empty array with no initial value"))
        var acc = read(size - 1)
        for (i in size - 2 downTo 0) acc = f(acc, read(i))
        return acc
    }

    fun join(separator: String = ","): String { track(); return jsJoin(storage, separator, this) }

    /** `array.flat(depth)` over untyped elements. */
    fun flatAny(depth: Double = 1.0): JSArray<Any?> {
        val out = ArrayList<Any?>()
        fun add(list: List<Any?>, d: Double) {
            for (v in list) if (v is JSArray<*> && d >= 1) add(v.storage, d - 1) else out.add(v)
        }
        add(elements, depth)
        return JSArray(out)
    }

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)

    companion object {
        fun <T> of(vararg items: T): JSArray<T> = JSArray(items.toList())
        fun <T> from(items: Iterable<T>): JSArray<T> = JSArray(ArrayList(items.toList()))
        fun <T> from(items: Iterable<T>, f: (T, Double) -> T): JSArray<T> = JSArray(ArrayList(items.mapIndexed { i, v -> f(v, i.toDouble()) }))
        fun <T> fromLength(length: Double, f: (Double) -> T): JSArray<T> = JSArray(ArrayList((0 until jsToIntegerOrInfinity(length).clampToInt()).map { f(it.toDouble()) }))
        fun isArray(value: Any?): Boolean = value is JSArray<*>
    }
}

/** `[a, b, c]`. */
fun <T> jsArrayOf(vararg items: T): JSArray<T> = JSArray(items.toList())

/** `[[1, 2], [3]].flat()`. */
fun <U> JSArray<JSArray<U>>.flat(): JSArray<U> {
    val out = ArrayList<U>()
    for (inner in elements) out.addAll(inner.elements)
    return JSArray(out)
}

/** `new Array<T>(n).fill(v)`. */
fun <T> jsArrayFilled(length: Double, value: T): JSArray<T> = JSArray(ArrayList(List(length.toInt()) { value }))

/** An untyped value read as an array whose elements convert with `element`. */
@Suppress("UNCHECKED_CAST")
fun <T> jsArrayFrom(value: Any?, element: (Any?) -> T): JSArray<T> {
    if (value !is JSArray<*>) return JSArray()
    val mapped = value.storage.map(element)
    // Elements that are already of the type: the same array, so what is written through either is in both.
    if (mapped.indices.all { mapped[it] === value.storage[it] }) return value as JSArray<T>
    return JSArray(ArrayList(mapped))
}

internal fun Double.clampToInt(): Int = when {
    this.isNaN() -> 0
    this > Int.MAX_VALUE -> Int.MAX_VALUE
    this < Int.MIN_VALUE -> Int.MIN_VALUE
    else -> this.toInt()
}

/** ToIntegerOrInfinity. */
fun jsToIntegerOrInfinity(value: Double): Double = when {
    value.isNaN() -> 0.0
    value.isInfinite() -> value
    else -> if (value < 0) Math.ceil(value) + 0.0 else Math.floor(value)
}

/** A relative index (`slice`, `splice`, `fill`): negative counts from the end; clamped to 0…length. */
internal fun jsRelativeIndex(value: Double, length: Int): Int {
    val k = jsToIntegerOrInfinity(value)
    return if (k < 0) maxOf(0.0, length + k).toInt() else minOf(k, length.toDouble()).toInt()
}

/** A stable merge sort tolerating inconsistent comparators, as Array.prototype.sort must. */
internal fun <E> jsMergeSort(items: MutableList<E>, less: (E, E) -> Boolean) {
    if (items.size < 2) return
    val a = ArrayList(items)
    val b = ArrayList(items)
    var width = 1
    var src = a
    var dst = b
    val n = items.size
    while (width < n) {
        var lo = 0
        while (lo < n) {
            val mid = minOf(lo + width, n)
            val hi = minOf(lo + 2 * width, n)
            var i = lo
            var j = mid
            var k = lo
            while (i < mid && j < hi) {
                if (less(src[j], src[i])) dst[k++] = src[j++] else dst[k++] = src[i++]
            }
            while (i < mid) dst[k++] = src[i++]
            while (j < hi) dst[k++] = src[j++]
            lo += 2 * width
        }
        val t = src; src = dst; dst = t
        width *= 2
    }
    for (i in 0 until n) items[i] = src[i]
}

/** `Array(...items)`: one number is a length, anything else the elements. */
fun jsArrayConstruct(items: List<Any?>): JSArray<Any?> {
    val length = items.singleOrNull() as? Double ?: return JSArray(ArrayList(items))
    if (length < 0 || length > 4_294_967_295.0 || length != Math.floor(length)) throw JSException(JSRangeError("Invalid array length"))
    return JSArray(ArrayList<Any?>(List(length.toInt()) { null }))
}
