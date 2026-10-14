package org.nativescript.kit

/**
 * A JavaScript array: reference semantics, JavaScript method names, `Double` indexes and lengths.
 * Reading past the end is undefined through `element`, which translated code uses for `a[i]`.
 *
 * An array of numbers made by `JSArray.numbers` holds them unboxed (number mode) until something else is
 * written to it or its `storage` list is read; it then holds them boxed from then on (JSArrayDeopts counts that).
 * Holes are `jsHoles` in either mode, over an undefined element.
 */
class JSArray<T>(storage: ArrayList<T>) : Iterable<T>, JSReactiveConvertible {
    /** The elements in generic mode; null in number mode. */
    private var list: ArrayList<T>? = storage
    /** The elements in number mode, `count` of them; undefined (and a hole) is the UNDEFINED NaN. */
    private var numbers: DoubleArray? = null
    private var count = 0

    /** The elements as a list. In number mode this boxes them for good: hot code reads through the array's methods. */
    var storage: ArrayList<T>
        get() = list ?: toGeneric(JSArrayDeopts.STORAGE)
        internal set(value) {
            list = value
            numbers = null
            count = 0
        }

    var jsTracker: JSTracker? = null

    constructor() : this(ArrayList())
    constructor(items: Collection<T>) : this(ArrayList(items))

    private fun track() { jsTracker?.track() }
    private fun trigger() { jsTracker?.trigger() }

    /** Whether the elements are unboxed numbers. */
    internal val isNumberMode: Boolean get() = numbers != null

    /** The element count, without tracking. */
    private val n: Int get() = list?.size ?: count

    /** Ends number mode: the numbers boxed, undefined as null. */
    @Suppress("UNCHECKED_CAST")
    private fun toGeneric(cause: Int): ArrayList<T> {
        list?.let { return it }
        val nums = numbers!!
        val out = ArrayList<T>(maxOf(count, 10))
        for (k in 0 until count) {
            val x = nums[k]
            out.add((if (isUndefined(x)) null else x) as T)
        }
        list = out
        numbers = null
        count = 0
        JSArrayDeopts.record(cause)
        return out
    }

    /** The element at `i` (in range), boxed: null for a hole or undefined. */
    @Suppress("UNCHECKED_CAST")
    private fun boxedAt(i: Int): T {
        val nums = numbers ?: return list!![i]
        val x = nums[i]
        return (if (isUndefined(x)) null else x) as T
    }

    private fun read(i: Int): T {
        val v = boxedAt(i)
        if (jsTracker != null) jsReactiveAny(v)
        return v
    }

    /** Writes the element at `i` (in range); a value that is not a number ends number mode. */
    private fun writeAt(i: Int, value: T) {
        val nums = numbers
        if (nums != null) {
            when (value) {
                is Double -> { nums[i] = canonical(value); return }
                null -> { nums[i] = UNDEFINED; return }
                else -> toGeneric(JSArrayDeopts.MIXED_WRITE)
            }
        }
        list!![i] = value
    }

    /** Appends `value`, `holes` holes before it. */
    @Suppress("UNCHECKED_CAST")
    private fun append(value: T, holes: Int = 0) {
        var nums = numbers
        if (nums != null && value !is Double && value != null) {
            toGeneric(JSArrayDeopts.MIXED_WRITE)
            nums = null
        }
        if (holes > 0) (jsHoles ?: java.util.BitSet().also { jsHoles = it }).set(n, n + holes)
        if (nums == null) {
            val l = list!!
            repeat(holes) { l.add(null as T) }
            l.add(value)
            return
        }
        val needed = count + holes + 1
        if (needed > nums.size) {
            nums = nums.copyOf(maxOf(needed, nums.size * 2, 8))
            numbers = nums
        }
        if (holes > 0) java.util.Arrays.fill(nums, count, count + holes, UNDEFINED)
        count += holes
        nums[count++] = if (value == null) UNDEFINED else canonical(value as Double)
    }

    // Elements

    val size: Int
        get() { track(); return n }

    /** The elements as a list, read through the tracker; in number mode a boxed copy. */
    val elements: List<T>
        get() {
            track()
            if (numbers != null) return List(count) { boxedAt(it) }
            if (jsTracker != null) list!!.forEach { jsReactiveAny(it) }
            return list!!
        }

    /** `array.length`. Setting it shorter truncates; longer fills with undefined. */
    var length: Double
        get() { track(); return n.toDouble() }
        set(value) {
            if (value < 0 || value > 4_294_967_295.0 || value != Math.floor(value)) throw JSException(JSRangeError("Invalid array length"))
            setLength(value.toInt())
        }

    @Suppress("UNCHECKED_CAST")
    internal fun setLength(length: Int) {
        val nums = numbers
        if (nums != null) {
            if (length == count) return
            if (length > count) {
                if (length > nums.size) numbers = nums.copyOf(length).also { java.util.Arrays.fill(it, count, length, UNDEFINED) }
                else java.util.Arrays.fill(nums, count, length, UNDEFINED)
                (jsHoles ?: java.util.BitSet().also { jsHoles = it }).set(count, length)
            } else jsHoles?.clear(length, count)
            count = length
            trigger()
            return
        }
        val l = list!!
        if (length < l.size) {
            jsHoles?.clear(length, l.size)
            while (l.size > length) l.removeAt(l.size - 1)
            trigger()
        } else if (length > l.size) {
            // A longer length adds no elements: what it reaches is holes.
            (jsHoles ?: java.util.BitSet().also { jsHoles = it }).set(l.size, length)
            while (l.size < length) l.add(null as T)
            trigger()
        }
    }

    /** Properties under keys that are no index (`a[0.5] = x`), as script gives an array. */
    var jsProperties: LinkedHashMap<String, Any?>? = null

    /** `a[i]` as JavaScript reads it: undefined unless `i` is an integer index in range, or a key the array was given. */
    @Suppress("UNCHECKED_CAST")
    fun element(i: Double): T? {
        track()
        val k = i.toInt()
        if (k >= 0 && k.toDouble() == i) return if (k < n) read(k) else null
        if (i != Math.floor(i) || i < 0) return jsProperties?.get(jsNumberToString(i)) as T?
        if (i >= n) return null
        return read(i.toInt())
    }

    operator fun get(i: Int): T {
        track()
        if (i >= n) throw IndexOutOfBoundsException("Index $i out of bounds for length $n")
        return read(i)
    }

    operator fun get(i: Double): T = get(i.toInt())

    /** Indices a write past the end skipped (`a[1] = x` of an empty array) in generic mode: holes, which `for…in` and `Object.keys` leave out. */
    var jsHoles: java.util.BitSet? = null

    operator fun set(i: Int, value: T) {
        val size = n
        if (i < size) {
            writeAt(i, value)
            jsHoles?.clear(i)
        } else append(value, i - size)
        trigger()
    }

    operator fun set(i: Double, value: T) {
        val k = i.toInt()
        if (k >= 0 && k.toDouble() == i && k < n) {
            writeAt(k, value)
            jsHoles?.clear(k)
            trigger()
            return
        }
        if (i < 0 || i != Math.floor(i) || i >= 4_294_967_295.0) {
            (jsProperties ?: LinkedHashMap<String, Any?>().also { jsProperties = it })[jsNumberToString(i)] = value
            return
        }
        set(i.toInt(), value)
    }

    @Suppress("UNCHECKED_CAST")
    internal fun setAt(i: Int, value: Any?) = set(i, value as T)

    /** `a[i]` read as a number: NaN for a hole, undefined, an index out of range or no index. */
    internal fun numberAt(i: Double): Double {
        val nums = numbers ?: return ((element(i) as Double?) ?: Double.NaN)
        track()
        val k = i.toInt()
        if (k >= 0 && k.toDouble() == i && k < count) return nums[k].let { if (it == it) it else Double.NaN }
        // NaN, a hole and undefined all read as NaN here.
        return ((element(i) as Double?) ?: Double.NaN)
    }

    /** `a[i] = v` of a number. */
    @Suppress("UNCHECKED_CAST")
    internal fun setNumberAt(i: Double, v: Double) {
        val nums = numbers
        val k = i.toInt()
        if (nums != null && k >= 0 && k.toDouble() == i && k < count) {
            nums[k] = canonical(v)
            jsHoles?.clear(k)
            trigger()
            return
        }
        set(i, v as T)
    }

    /** The element at `i` (in range) as a number: NaN for undefined. */
    private fun numAt(i: Int): Double {
        val nums = numbers ?: return (list!![i] as Double?) ?: Double.NaN
        val x = nums[i]
        return if (x == x) x else Double.NaN
    }

    // A number[]'s callbacks with primitive parameters and results: number mode boxes nothing for them. Like the
    // generic ones, they see the length the call started with and the current elements.

    internal fun mapNumbers(f: JSDoubleUnary): JSArray<Double> {
        track()
        val size = n
        val out = DoubleArray(maxOf(size, 8))
        var i = 0
        var holes: java.util.BitSet? = null
        while (i < size && i < n) {
            if (present(i)) out[i] = canonical(f.apply(numAt(i))) else {
                out[i] = UNDEFINED
                (holes ?: java.util.BitSet().also { holes = it }).set(i)
            }
            i++
        }
        return numbersOf(out, i).also { it.jsHoles = holes }
    }

    internal fun filterNumbers(f: JSDoublePredicate): JSArray<Double> {
        track()
        val size = n
        val out = JSArray.numbers(8)
        var i = 0
        while (i < size && i < n) {
            if (present(i) && f.test(numAt(i))) out.appendNumberMode(if (isUndefinedAt(i)) UNDEFINED else numAt(i))
            i++
        }
        return out
    }

    internal fun forEachNumber(f: JSDoubleConsumer) {
        track()
        val size = n
        var i = 0
        while (i < size && i < n) { if (present(i)) f.accept(numAt(i)); i++ }
    }

    internal fun reduceNumbers(f: JSDoubleReducer, initial: Double): Double {
        track()
        val size = n
        var acc = initial
        var i = 0
        while (i < size && i < n) { if (present(i)) acc = f.apply(acc, numAt(i)); i++ }
        return acc
    }

    @Suppress("UNCHECKED_CAST")
    internal fun sortNumbers(compare: JSNumberComparator): JSArray<T> {
        val nums = numbers ?: return sortBy { a, b -> compare.compare(a as Double, b as Double) < 0 }
        var defined = 0
        for (k in 0 until count) if (!isUndefined(nums[k])) nums[defined++] = nums[k]
        stableSortNumbers(nums, defined, compare)
        java.util.Arrays.fill(nums, defined, count, UNDEFINED)
        moveHolesLast()
        trigger()
        return this
    }

    /** A number-mode array as a Java `double[]`: undefined is 0, as a primitive parameter reads it. */
    internal fun toDoubles(): DoubleArray {
        val nums = numbers!!
        return DoubleArray(count) { k -> nums[k].let { if (isUndefined(it)) 0.0 else it } }
    }

    /** Appends to a number-mode array a number, or UNDEFINED, as it is. */
    private fun appendNumberMode(x: Double) {
        var nums = numbers!!
        if (count == nums.size) {
            nums = nums.copyOf(maxOf(8, count * 2))
            numbers = nums
        }
        nums[count++] = x
    }

    private fun isUndefinedAt(i: Int): Boolean = numbers?.let { isUndefined(it[i]) } ?: (list!![i] == null)

    @Suppress("UNCHECKED_CAST")
    internal fun pushNumber(v: Double): Double {
        append(v as T)
        trigger()
        return n.toDouble()
    }

    fun at(i: Double): T? {
        track()
        var k = jsToIntegerOrInfinity(i)
        if (k < 0) k += n
        return if (k >= 0 && k < n) read(k.toInt()) else null
    }

    override fun iterator(): Iterator<T> {
        var i = 0
        return object : Iterator<T> {
            override fun hasNext(): Boolean { track(); return i < n }
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

    /** The elements as a list, for the methods number mode does not implement: it ends number mode. */
    private val generic: ArrayList<T> get() = list ?: toGeneric(JSArrayDeopts.METHOD)

    fun push(item: T): Double {
        append(item)
        trigger()
        return n.toDouble()
    }

    fun push(vararg items: T): Double {
        for (item in items) append(item)
        trigger()
        return n.toDouble()
    }

    /** `a.push(...items)`. */
    fun pushAll(items: Iterable<T>): Double {
        for (item in items.toList()) append(item)
        trigger()
        return n.toDouble()
    }

    fun pop(): T? {
        val size = n
        if (size == 0) return null
        val v = boxedAt(size - 1)
        if (numbers != null) count-- else list!!.removeAt(size - 1)
        jsHoles?.clear(size - 1)
        trigger()
        return v
    }

    fun shift(): T? {
        if (n == 0) return null
        val v = generic.removeAt(0)
        trigger()
        return v
    }

    fun unshift(vararg items: T): Double {
        generic.addAll(0, items.toList())
        trigger()
        return n.toDouble()
    }

    fun unshiftAll(items: Iterable<T>): Double {
        generic.addAll(0, items.toList())
        trigger()
        return n.toDouble()
    }

    /** `a.splice(start, deleteCount, ...items)`; a missing deleteCount removes to the end. */
    fun splice(start: Double, deleteCount: Double? = null, vararg items: T): JSArray<T> = spliceAll(start, deleteCount, items.asList())

    /** `a.splice(start, deleteCount, ...items)` with the items spread from one list. */
    fun spliceAll(start: Double, deleteCount: Double?, items: Iterable<T>): JSArray<T> {
        val l = generic
        val size = l.size
        val s = jsRelativeIndex(start, size)
        val d = if (deleteCount == null) size - s else maxOf(0, minOf(jsToIntegerOrInfinity(deleteCount).clampToInt(), size - s))
        val removed = ArrayList(l.subList(s, s + d))
        l.subList(s, s + d).clear()
        val added = items.toList()
        l.addAll(s, added)
        if (d > 0 || added.isNotEmpty()) trigger()
        return JSArray(removed)
    }

    fun reverse(): JSArray<T> {
        generic.reverse()
        trigger()
        return this
    }

    /** `array.sort()`: in place and stable, by string form in UTF-16 order, undefined last. */
    @Suppress("UNCHECKED_CAST")
    fun sort(): JSArray<T> {
        val l = generic
        val values = arrayOfNulls<Any?>(l.size)
        val texts = arrayOfNulls<String>(l.size)
        var undefineds: ArrayList<T>? = null
        var defined = 0
        for ((k, e) in l.withIndex()) {
            if (e == null || e === Unit) { if (jsHoles?.get(k) != true) (undefineds ?: ArrayList<T>().also { undefineds = it }).add(e) }
            else {
                values[defined] = e
                texts[defined] = if (e is String) e else jsToString(e)
                defined++
            }
        }
        // The positions sorted by their texts, which are made once.
        val order = arrayOfNulls<Any?>(defined)
        for (k in 0 until defined) order[k] = k
        stableSort(order, defined) { a, b -> texts[a as Int]!! < texts[b as Int]!! }
        replaceSorted(defined, undefineds) { k -> values[order[k] as Int] as T }
        return this
    }

    /** `array.sort(compare)`: in place and stable; undefined last without being compared, NaN counts as 0. */
    @Suppress("UNCHECKED_CAST")
    fun sort(compare: (T, T) -> Double): JSArray<T> = sortBy { a, b -> compare(a as T, b as T) < 0 }

    /** `array.sort(compare)` with a comparator whose result is a primitive: no comparison boxes a Double. */
    @Suppress("UNCHECKED_CAST")
    fun sort(compare: JSDoubleComparator<T>): JSArray<T> = sortBy { a, b -> compare.compare(a as T, b as T) < 0 }

    @Suppress("UNCHECKED_CAST")
    private inline fun sortBy(less: (Any?, Any?) -> Boolean): JSArray<T> {
        val nums = numbers
        if (nums != null) {
            // Numbers boxed once for the comparator, written back unboxed.
            val values = arrayOfNulls<Any?>(count)
            var defined = 0
            for (k in 0 until count) {
                val x = nums[k]
                if (!isUndefined(x)) values[defined++] = x
            }
            stableSort(values, defined, less)
            for (k in 0 until defined) nums[k] = values[k] as Double
            java.util.Arrays.fill(nums, defined, count, UNDEFINED)
            moveHolesLast()
            trigger()
            return this
        }
        val l = list!!
        val values = arrayOfNulls<Any?>(l.size)
        var undefineds: ArrayList<T>? = null
        var defined = 0
        for ((k, e) in l.withIndex()) {
            if (e == null || e === Unit) { if (jsHoles?.get(k) != true) (undefineds ?: ArrayList<T>().also { undefineds = it }).add(e) }
            else values[defined++] = e
        }
        stableSort(values, defined, less)
        replaceSorted(defined, undefineds) { k -> values[k] as T }
        return this
    }

    /** SortIndexedProperties: what sorted after the elements and undefined is the holes, at the end. */
    private fun moveHolesLast() {
        val holes = jsHoles?.cardinality() ?: return
        jsHoles = if (holes == 0) null else java.util.BitSet().also { it.set(n - holes, n) }
    }

    /** The storage as the `defined` sorted elements, then the undefined ones, then the holes. */
    @Suppress("UNCHECKED_CAST")
    private inline fun replaceSorted(defined: Int, undefineds: List<T>?, sorted: (Int) -> T) {
        val size = n
        val out = ArrayList<T>(size)
        for (k in 0 until defined) out.add(sorted(k))
        if (undefineds != null) out.addAll(undefineds)
        while (out.size < size) out.add(null as T)
        storage = out
        moveHolesLast()
        trigger()
    }

    fun fill(value: T, start: Double = 0.0, end: Double? = null): JSArray<T> {
        val size = n
        val s = jsRelativeIndex(start, size)
        val e = if (end == null) size else jsRelativeIndex(end, size)
        for (i in s until e) writeAt(i, value)
        if (s < e) jsHoles?.clear(s, e)
        trigger()
        return this
    }

    // Copies and searches

    fun slice(start: Double = 0.0, end: Double? = null): JSArray<T> {
        track()
        val size = n
        val s = jsRelativeIndex(start, size)
        val e = if (end == null) size else jsRelativeIndex(end, size)
        val nums = numbers
        @Suppress("UNCHECKED_CAST")
        if (nums != null) return numbersOf(if (s < e) nums.copyOfRange(s, e) else DoubleArray(0), maxOf(0, e - s)) as JSArray<T>
        return if (s < e) JSArray(ArrayList(list!!.subList(s, e))) else JSArray()
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
    fun toSorted(compare: JSDoubleComparator<T>): JSArray<T> = JSArray(ArrayList(elements)).sort(compare)

    fun indexOf(value: Any?, fromIndex: Double = 0.0): Double {
        val n = size
        for (i in jsRelativeIndex(fromIndex, n) until n) if (jsStrictEquals(boxedAt(i), value)) return i.toDouble()
        return -1.0
    }

    fun lastIndexOf(value: Any?, fromIndex: Double? = null): Double {
        val n = size
        var i = if (fromIndex == null) n - 1 else { val k = jsToIntegerOrInfinity(fromIndex); if (k < 0) (n + k).clampToInt() else minOf(k, (n - 1).toDouble()).toInt() }
        while (i >= 0) { if (jsStrictEquals(boxedAt(i), value)) return i.toDouble(); i-- }
        return -1.0
    }

    fun includes(value: Any?, fromIndex: Double = 0.0): Boolean {
        val n = size
        for (i in jsRelativeIndex(fromIndex, n) until n) if (jsSameValueZero(boxedAt(i), value)) return true
        return false
    }

    // Callbacks see the length the array had when the call started, and current elements. Each arity has its own
    // loop: a wrapper around a shorter callback would box every index.

    fun find(f: (T) -> Boolean): T? {
        for (i in 0 until size) { val v = read(i); if (f(v)) return v }
        return null
    }

    fun find(f: (T, Double) -> Boolean): T? {
        for (i in 0 until size) { val v = read(i); if (f(v, i.toDouble())) return v }
        return null
    }

    fun find(f: (T, Double, JSArray<T>) -> Boolean): T? {
        for (i in 0 until size) { val v = read(i); if (f(v, i.toDouble(), this)) return v }
        return null
    }

    fun findIndex(f: (T) -> Boolean): Double {
        for (i in 0 until size) if (f(read(i))) return i.toDouble()
        return -1.0
    }

    fun findIndex(f: (T, Double) -> Boolean): Double {
        for (i in 0 until size) if (f(read(i), i.toDouble())) return i.toDouble()
        return -1.0
    }

    fun findIndex(f: (T, Double, JSArray<T>) -> Boolean): Double {
        for (i in 0 until size) if (f(read(i), i.toDouble(), this)) return i.toDouble()
        return -1.0
    }

    fun findLast(f: (T) -> Boolean): T? {
        for (i in size - 1 downTo 0) { val v = read(i); if (f(v)) return v }
        return null
    }

    fun findLast(f: (T, Double) -> Boolean): T? {
        for (i in size - 1 downTo 0) { val v = read(i); if (f(v, i.toDouble())) return v }
        return null
    }

    fun findLastIndex(f: (T) -> Boolean): Double {
        for (i in size - 1 downTo 0) if (f(read(i))) return i.toDouble()
        return -1.0
    }

    fun findLastIndex(f: (T, Double) -> Boolean): Double {
        for (i in size - 1 downTo 0) if (f(read(i), i.toDouble())) return i.toDouble()
        return -1.0
    }

    // some, every, forEach, map, filter, flatMap and reduce skip holes, as their HasProperty test does; find and
    // findIndex visit them.

    private fun present(i: Int): Boolean = jsHoles?.get(i) != true

    fun some(f: (T) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && f(read(i))) return true
        return false
    }

    fun some(f: (T, Double) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && f(read(i), i.toDouble())) return true
        return false
    }

    fun some(f: (T, Double, JSArray<T>) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && f(read(i), i.toDouble(), this)) return true
        return false
    }

    fun every(f: (T) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && !f(read(i))) return false
        return true
    }

    fun every(f: (T, Double) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && !f(read(i), i.toDouble())) return false
        return true
    }

    fun every(f: (T, Double, JSArray<T>) -> Boolean): Boolean {
        val n = size
        for (i in 0 until minOf(n, this.n)) if (present(i) && !f(read(i), i.toDouble(), this)) return false
        return true
    }

    fun forEach(f: (T) -> Unit) {
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) f(read(i)); i++ }
    }

    fun forEach(f: (T, Double) -> Unit) {
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) f(read(i), i.toDouble()); i++ }
    }

    fun forEach(f: (T, Double, JSArray<T>) -> Unit) {
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) f(read(i), i.toDouble(), this); i++ }
    }

    fun <U> map(f: (T) -> U): JSArray<U> = mapIndexed { i -> f(read(i)) }
    fun <U> map(f: (T, Double) -> U): JSArray<U> = mapIndexed { i -> f(read(i), i.toDouble()) }
    fun <U> map(f: (T, Double, JSArray<T>) -> U): JSArray<U> = mapIndexed { i -> f(read(i), i.toDouble(), this) }

    /** map's result: what `f` gives for each element, a hole where the array has one. */
    @Suppress("UNCHECKED_CAST")
    private inline fun <U> mapIndexed(f: (Int) -> U): JSArray<U> {
        val n = size
        val out = ArrayList<U>(n)
        var holes: java.util.BitSet? = null
        var i = 0
        while (i < n && i < this.n) {
            if (present(i)) out.add(f(i)) else {
                out.add(null as U)
                (holes ?: java.util.BitSet().also { holes = it }).set(i)
            }
            i++
        }
        return JSArray(out).also { it.jsHoles = holes }
    }

    fun filter(f: (T) -> Boolean): JSArray<T> = filterIndexed { v, _ -> f(v) }
    fun filter(f: (T, Double) -> Boolean): JSArray<T> = filterIndexed { v, i -> f(v, i.toDouble()) }
    fun filter(f: (T, Double, JSArray<T>) -> Boolean): JSArray<T> = filterIndexed { v, i -> f(v, i.toDouble(), this) }

    private inline fun filterIndexed(f: (T, Int) -> Boolean): JSArray<T> {
        val n = size
        val out = ArrayList<T>()
        var i = 0
        while (i < n && i < this.n) {
            if (present(i)) { val v = read(i); if (f(v, i)) out.add(v) }
            i++
        }
        return JSArray(out)
    }

    fun <U> flatMap(f: (T) -> JSArray<U>): JSArray<U> {
        val out = ArrayList<U>()
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) out.addAll(f(read(i)).elements); i++ }
        return JSArray(out)
    }

    fun <U> flatMap(f: (T, Double) -> JSArray<U>): JSArray<U> {
        val out = ArrayList<U>()
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) out.addAll(f(read(i), i.toDouble()).elements); i++ }
        return JSArray(out)
    }

    fun <U> reduce(f: (U, T) -> U, initial: U): U = reduceFrom(initial) { acc, i -> f(acc, read(i)) }
    fun <U> reduce(f: (U, T, Double) -> U, initial: U): U = reduceFrom(initial) { acc, i -> f(acc, read(i), i.toDouble()) }
    fun <U> reduce(f: (U, T, Double, JSArray<T>) -> U, initial: U): U = reduceFrom(initial) { acc, i -> f(acc, read(i), i.toDouble(), this) }

    private inline fun <U> reduceFrom(initial: U, f: (U, Int) -> U): U {
        var acc = initial
        val n = size
        var i = 0
        while (i < n && i < this.n) { if (present(i)) acc = f(acc, i); i++ }
        return acc
    }

    private fun emptyReduce(): Nothing = throw JSException(JSTypeError("Reduce of empty array with no initial value"))

    fun reduce(f: (T, T) -> T): T = reduceFromFirst { acc, i -> f(acc, read(i)) }
    fun reduce(f: (T, T, Double, JSArray<T>) -> T): T = reduceFromFirst { acc, i -> f(acc, read(i), i.toDouble(), this) }
    fun reduce(f: (T, T, Double) -> T): T = reduceFromFirst { acc, i -> f(acc, read(i), i.toDouble()) }

    /** reduce without an initial value: the first element present is where it starts. */
    private inline fun reduceFromFirst(f: (T, Int) -> T): T {
        val n = size
        var i = 0
        while (i < n && !present(i)) i++
        if (i >= n) emptyReduce()
        var acc = read(i++)
        while (i < n && i < this.n) { if (present(i)) acc = f(acc, i); i++ }
        return acc
    }

    fun <U> reduceRight(f: (U, T) -> U, initial: U): U = reduceRightFrom(initial) { acc, i -> f(acc, read(i)) }
    fun <U> reduceRight(f: (U, T, Double) -> U, initial: U): U = reduceRightFrom(initial) { acc, i -> f(acc, read(i), i.toDouble()) }
    fun <U> reduceRight(f: (U, T, Double, JSArray<T>) -> U, initial: U): U = reduceRightFrom(initial) { acc, i -> f(acc, read(i), i.toDouble(), this) }

    private inline fun <U> reduceRightFrom(initial: U, f: (U, Int) -> U): U {
        var acc = initial
        for (i in size - 1 downTo 0) if (i < this.n && present(i)) acc = f(acc, i)
        return acc
    }

    fun reduceRight(f: (T, T) -> T): T = reduceRightFromLast { acc, i -> f(acc, read(i)) }
    fun reduceRight(f: (T, T, Double, JSArray<T>) -> T): T = reduceRightFromLast { acc, i -> f(acc, read(i), i.toDouble(), this) }
    fun reduceRight(f: (T, T, Double) -> T): T = reduceRightFromLast { acc, i -> f(acc, read(i), i.toDouble()) }

    private inline fun reduceRightFromLast(f: (T, Int) -> T): T {
        var i = size - 1
        while (i >= 0 && !present(i)) i--
        if (i < 0) emptyReduce()
        var acc = read(i--)
        while (i >= 0) { if (i < this.n && present(i)) acc = f(acc, i); i-- }
        return acc
    }

    fun join(separator: String = ","): String {
        track()
        val nums = numbers ?: return jsJoin(list!!, separator, this)
        val out = StringBuilder()
        for (k in 0 until count) {
            if (k > 0) out.append(separator)
            val x = nums[k]
            if (!isUndefined(x)) out.append(jsNumberToString(x))
        }
        return out.toString()
    }

    /** `array.flat(depth)` over untyped elements. */
    fun flatAny(depth: Double = 1.0): JSArray<Any?> {
        val out = ArrayList<Any?>()
        fun add(list: List<Any?>, d: Double) {
            for (v in list) if (v is JSArray<*> && d >= 1) add(v.elements, d - 1) else out.add(v)
        }
        add(elements, depth)
        return JSArray(out)
    }

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)

    companion object {
        /** An empty array of numbers held unboxed. */
        fun numbers(capacity: Int = 8): JSArray<Double> = numbersOf(DoubleArray(capacity), 0)

        internal fun numbersOf(values: DoubleArray, count: Int): JSArray<Double> {
            val a = JSArray<Double>(EMPTY_LIST)
            a.list = null
            a.numbers = values
            a.count = count
            return a
        }

        /** What a number-mode array starts from before `list` is dropped: shared, never written. */
        private val EMPTY_LIST = ArrayList<Double>(0)

        fun <T> of(vararg items: T): JSArray<T> = JSArray(items.toList())
        fun <T> from(items: Iterable<T>): JSArray<T> = JSArray(ArrayList(items.toList()))
        fun <T> from(items: Iterable<T>, f: (T, Double) -> T): JSArray<T> = JSArray(ArrayList(items.mapIndexed { i, v -> f(v, i.toDouble()) }))
        fun <T> fromLength(length: Double, f: (Double) -> T): JSArray<T> = JSArray(ArrayList((0 until jsToIntegerOrInfinity(length).clampToInt()).map { f(it.toDouble()) }))
        fun isArray(value: Any?): Boolean = value is JSArray<*>
    }
}

/** A sort comparator returning a primitive, which the translator gives a function literal typed `(a: T, b: T) => number`. */
fun interface JSDoubleComparator<T> {
    fun compare(a: T, b: T): Double
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
fun <T> jsArrayFilled(length: Double, value: T): JSArray<T> {
    val n = length.toInt()
    val storage = ArrayList<T>(n)
    for (k in 0 until n) storage.add(value)
    return JSArray(storage)
}

/** An untyped value read as an array whose elements convert with `element`. */
@Suppress("UNCHECKED_CAST")
fun <T> jsArrayFrom(value: Any?, element: (Any?) -> T): JSArray<T> {
    // A Java array (`Array.create(…)`): its elements, copied.
    if (value != null && value.javaClass.isArray) return JSArray(ArrayList((0 until java.lang.reflect.Array.getLength(value)).map { element(fromJavaValue(java.lang.reflect.Array.get(value, it))) }))
    if (value !is JSArray<*>) return JSArray()
    if (value.isNumberMode) {
        // Numbers the conversion keeps: the same array, unboxed still.
        val boxed = value.elements
        if (boxed.all { it == null || element(it) == it }) return value as JSArray<T>
        return JSArray(ArrayList(boxed.map(element)))
    }
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
@Suppress("UNCHECKED_CAST")
internal fun <E> jsMergeSort(items: MutableList<E>, less: (E, E) -> Boolean) {
    val n = items.size
    if (n < 2) return
    val values = arrayOfNulls<Any?>(n)
    for (i in 0 until n) values[i] = items[i]
    stableSort(values, n) { a, b -> less(a as E, b as E) }
    for (i in 0 until n) items[i] = values[i] as E
}

/**
 * Sorts `items[0, n)` stably with `less`, tolerating inconsistent comparators: bottom-up merges between two
 * arrays. Two runs already in order are copied after one comparison, so sorted input takes about n of them.
 */
internal inline fun stableSort(items: Array<Any?>, n: Int, less: (Any?, Any?) -> Boolean) {
    if (n < 2) return
    var src = items
    var dst = arrayOfNulls<Any?>(n)
    var width = 1
    while (width < n) {
        var lo = 0
        while (lo < n) {
            val mid = minOf(lo + width, n)
            val hi = minOf(lo + 2 * width, n)
            if (mid >= hi || !less(src[mid], src[mid - 1])) {
                System.arraycopy(src, lo, dst, lo, hi - lo)
            } else {
                var i = lo
                var j = mid
                var k = lo
                while (i < mid && j < hi) {
                    if (less(src[j], src[i])) dst[k++] = src[j++] else dst[k++] = src[i++]
                }
                while (i < mid) dst[k++] = src[i++]
                while (j < hi) dst[k++] = src[j++]
            }
            lo += 2 * width
        }
        val t = src
        src = dst
        dst = t
        width *= 2
    }
    if (src !== items) System.arraycopy(src, 0, items, 0, n)
}

/** `Array(...items)`: one number is a length, anything else the elements. */
fun jsArrayConstruct(items: List<Any?>): JSArray<Any?> {
    val length = items.singleOrNull() as? Double ?: return JSArray(ArrayList(items))
    if (length < 0 || length > 4_294_967_295.0 || length != Math.floor(length)) throw JSException(JSRangeError("Invalid array length"))
    return JSArray(ArrayList<Any?>(List(length.toInt()) { null }))
}

/** What a template's `@for` renders: the array's elements, none where it is missing (`row?.children`). */
val <T> JSArray<T>?.forItems: List<T> get() = this?.elements ?: emptyList()

/** An untyped `@for` source: its elements as `Array.from` reads them, none where it is missing. */
@get:JvmName("untypedForItems")
val Any?.forItems: List<Any?> get() = if (jsIsNullish(this)) emptyList() else jsArrayFrom(this) { it }.elements

// Number mode

private const val UNDEFINED_BITS = 0x7FF8_0000_0000_0D02L

/**
 * Undefined (and a hole, which `jsHoles` marks) in a number-mode array: a NaN no arithmetic or conversion makes,
 * as every NaN written is made canonical.
 */
private val UNDEFINED = Double.fromBits(UNDEFINED_BITS)

private fun canonical(v: Double): Double = if (v != v) Double.NaN else v

private fun isUndefined(x: Double): Boolean = x != x && x.toRawBits() == UNDEFINED_BITS

/**
 * Number-mode arrays turned generic, by cause: their `storage` list read, a method number mode does not implement,
 * or a value that is not a number written. Hot code should keep them at zero; tests/perf prints them.
 */
object JSArrayDeopts {
    const val STORAGE = 0
    const val METHOD = 1
    const val MIXED_WRITE = 2

    private val counts = java.util.concurrent.atomic.AtomicLongArray(3)

    internal fun record(cause: Int) { counts.incrementAndGet(cause) }

    val storage: Long get() = counts.get(STORAGE)
    val method: Long get() = counts.get(METHOD)
    val mixedWrite: Long get() = counts.get(MIXED_WRITE)
    val total: Long get() = storage + method + mixedWrite
}

/** `[1, 2, 3]` typed `number[]`: unboxed. */
fun jsNumberArrayOf(vararg values: Double): JSArray<Double> = JSArray.numbersOf(DoubleArray(maxOf(values.size, 8)).also { values.copyInto(it) }.also { for (k in values.indices) if (it[k] != it[k]) it[k] = Double.NaN }, values.size)

/** `new Array<number>(n).fill(v)`. */
fun jsNumberArrayFilled(length: Double, value: Double): JSArray<Double> {
    val n = length.toInt()
    return JSArray.numbersOf(DoubleArray(maxOf(n, 8)).also { java.util.Arrays.fill(it, 0, n, canonical(value)) }, n)
}

/** `new Array<number>(n)`: n holes. */
fun jsNumberArrayOfHoles(length: Double): JSArray<Double> {
    if (length < 0 || length > 4_294_967_295.0 || length != Math.floor(length)) throw JSException(JSRangeError("Invalid array length"))
    val n = length.toInt()
    return JSArray.numbersOf(DoubleArray(maxOf(n, 8)).also { java.util.Arrays.fill(it, 0, n, UNDEFINED) }, n).also { if (n > 0) it.jsHoles = java.util.BitSet().apply { set(0, n) } }
}

/** `a[i]` of a `number[]` where a number is wanted: NaN for what reads undefined. */
fun JSArray<Double>.num(i: Double): Double = numberAt(i)

/** `a[i] = v` of a `number[]`: the value, as an assignment gives it. */
fun JSArray<Double>.setNum(i: Double, v: Double): Double {
    setNumberAt(i, v)
    return v
}

/** `a.push(v)` of a `number[]`. */
fun JSArray<Double>.pushNum(v: Double): Double = pushNumber(v)

/** `(x: number) => number` given to a `number[]`'s map. */
fun interface JSDoubleUnary {
    fun apply(x: Double): Double
}

/** `(x: number) => boolean` given to a `number[]`'s filter. */
fun interface JSDoublePredicate {
    fun test(x: Double): Boolean
}

/** `(x: number) => void` given to a `number[]`'s forEach. */
fun interface JSDoubleConsumer {
    fun accept(x: Double)
}

/** `(acc: number, x: number) => number` given to a `number[]`'s reduce. */
fun interface JSDoubleReducer {
    fun apply(acc: Double, x: Double): Double
}

/** `(a: number, b: number) => number` given to a `number[]`'s sort. */
fun interface JSNumberComparator {
    fun compare(a: Double, b: Double): Double
}

fun JSArray<Double>.mapNum(f: JSDoubleUnary): JSArray<Double> = mapNumbers(f)
fun JSArray<Double>.filterNum(f: JSDoublePredicate): JSArray<Double> = filterNumbers(f)
fun JSArray<Double>.forEachNum(f: JSDoubleConsumer) = forEachNumber(f)
fun JSArray<Double>.reduceNum(f: JSDoubleReducer, initial: Double): Double = reduceNumbers(f, initial)
fun JSArray<Double>.sortNum(compare: JSNumberComparator): JSArray<Double> = sortNumbers(compare)
fun JSArray<Double>.num(i: Int): Double = numberAt(i.toDouble())

/** stableSort over unboxed numbers: the same merges, and so the same order for any comparator. */
private fun stableSortNumbers(items: DoubleArray, n: Int, compare: JSNumberComparator) {
    if (n < 2) return
    var src = items
    var dst = DoubleArray(n)
    var width = 1
    while (width < n) {
        var lo = 0
        while (lo < n) {
            val mid = minOf(lo + width, n)
            val hi = minOf(lo + 2 * width, n)
            if (mid >= hi || !(compare.compare(src[mid], src[mid - 1]) < 0)) {
                System.arraycopy(src, lo, dst, lo, hi - lo)
            } else {
                var i = lo
                var j = mid
                var k = lo
                while (i < mid && j < hi) {
                    if (compare.compare(src[j], src[i]) < 0) dst[k++] = src[j++] else dst[k++] = src[i++]
                }
                while (i < mid) dst[k++] = src[i++]
                while (j < hi) dst[k++] = src[j++]
            }
            lo += 2 * width
        }
        val t = src
        src = dst
        dst = t
        width *= 2
    }
    if (src !== items) System.arraycopy(src, 0, items, 0, n)
}
