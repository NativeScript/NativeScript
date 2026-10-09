package org.nativescript.kit

import java.math.BigInteger
import java.nio.ByteBuffer
import java.nio.ByteOrder

/** Which typed array a view is. */
enum class JSTypedArrayKind(val constructorName: String, val bytesPerElement: Int) {
    INT8("Int8Array", 1), UINT8("Uint8Array", 1), UINT8_CLAMPED("Uint8ClampedArray", 1),
    INT16("Int16Array", 2), UINT16("Uint16Array", 2), INT32("Int32Array", 4), UINT32("Uint32Array", 4),
    FLOAT32("Float32Array", 4), FLOAT64("Float64Array", 8), BIG_INT64("BigInt64Array", 8), BIG_UINT64("BigUint64Array", 8);

    /** Whether its elements are BigInts, which never mix with numbers. */
    val isBigInt: Boolean get() = this == BIG_INT64 || this == BIG_UINT64
}

/** An ArrayBuffer, a typed array or a DataView: bytes a native API reads and writes in place. */
interface JSBufferSource {
    /** The bytes the value covers, shared: index 0 is its first byte, the limit its byte length. */
    val jsBytes: ByteBuffer
}

/** `ArrayBufferView`: a typed array or a DataView, a window on the bytes of a buffer. */
interface JSArrayBufferView : JSBufferSource, JSDynamic {
    val buffer: JSArrayBuffer
    val byteOffset: Double
    val byteLength: Double
}

/**
 * `ArrayBuffer`: a fixed number of bytes, zeroed when made, in a `java.nio.ByteBuffer`
 * (`nativeObject`, as NativeScript's Android runtime gives it) that native APIs read and write in place.
 */
class JSArrayBuffer private constructor(val nativeObject: ByteBuffer, @Suppress("UNUSED_PARAMETER") wrapped: Unit) :
    JSDynamic, JSToStringTag, JSBufferSource {

    /** `new ArrayBuffer(length)`. */
    constructor(length: Double = 0.0) : this(ByteBuffer.allocate(jsByteCount(length) ?: throw JSException(JSRangeError("Invalid array buffer length"))), Unit)

    internal val count: Int = nativeObject.capacity()

    val byteLength: Double get() = count.toDouble()

    /** The bytes in `order`, independent of the order `nativeObject` and other views use. */
    internal fun view(order: ByteOrder): ByteBuffer {
        val d = nativeObject.duplicate()
        (d as java.nio.Buffer).clear()
        return d.order(order)
    }

    override val jsBytes: ByteBuffer get() = view(ByteOrder.nativeOrder())

    /** A copy of the bytes. */
    fun toByteArray(): ByteArray {
        val out = ByteArray(count)
        view(ByteOrder.BIG_ENDIAN).get(out)
        return out
    }

    /** `buffer.slice(begin, end)`: a new buffer of a copy of those bytes. */
    fun slice(begin: Double? = null, end: Double? = null): JSArrayBuffer {
        val (from, to) = jsRelativeRange(begin, end, count)
        val copy = allocate(to - from)
        val source = view(ByteOrder.BIG_ENDIAN)
        val target = copy.view(ByteOrder.BIG_ENDIAN)
        for (k in from until to) target.put(k - from, source.get(k))
        return copy
    }

    override val jsToStringTag: String get() = "ArrayBuffer"
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "ArrayBuffer"
    override fun jsGet(key: String): Any? = when (key) {
        "byteLength" -> byteLength
        "slice" -> JSMethod { _, a -> slice(optionalNumber(a, 0), optionalNumber(a, 1)) }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}

    companion object {
        internal fun allocate(byteCount: Int): JSArrayBuffer = JSArrayBuffer(ByteBuffer.allocate(byteCount), Unit)

        /** `ArrayBuffer.from(javaByteBuffer)`: a buffer over the ByteBuffer's bytes, all its capacity, shared. */
        fun from(byteBuffer: ByteBuffer): JSArrayBuffer = JSArrayBuffer(byteBuffer, Unit)

        /** `ArrayBuffer.isView(value)`. */
        fun isView(value: Any?): Boolean = jsBox(value) is JSArrayBufferView

        /** `ArrayBuffer.prototype`, as far as a program reads it: its tag. */
        val jsPrototype: JSArrayBuffer by lazy { allocate(0) }
    }
}

// Element types

/** A typed array's element type: how a value script writes is stored in the bytes and read back. */
abstract class JSTypedArrayElement<V : Any>(val kind: JSTypedArrayKind) {
    abstract fun load(bytes: ByteBuffer, at: Int): V
    /** The conversion the specification gives the type (ToInt8, ToUint8Clamp, …). */
    abstract fun store(bytes: ByteBuffer, at: Int, value: V)
    /** ToNumber, or ToBigInt. */
    abstract fun convert(value: Any?): V
    /** What writing undefined stores: NaN converted, or nothing for a BigInt array (a TypeError in JavaScript). */
    abstract val undefinedValue: V?
    abstract val zero: V
    /** The default sort order. */
    abstract fun less(a: V, b: V): Boolean
    /** `===`, or SameValueZero (NaN equal to itself). */
    abstract fun same(a: V, b: V, zero: Boolean): Boolean
    abstract fun string(value: V): String
    /** The value `===` could find, or null where `search` is not of the element type. */
    abstract fun searched(search: Any?): V?
}

abstract class JSNumberElement(kind: JSTypedArrayKind) : JSTypedArrayElement<Double>(kind) {
    override fun convert(value: Any?): Double = jsToNumber(value)
    override val undefinedValue: Double? get() = Double.NaN
    override val zero: Double get() = 0.0
    /** Ascending, -0 before +0, NaN last. */
    override fun less(a: Double, b: Double): Boolean {
        if (a.isNaN()) return false
        if (b.isNaN() || a < b) return true
        return a == b && 1.0 / a < 0 && 1.0 / b > 0
    }
    override fun same(a: Double, b: Double, zero: Boolean): Boolean = a == b || (zero && a.isNaN() && b.isNaN())
    override fun string(value: Double): String = jsNumberToString(value)
    override fun searched(search: Any?): Double? = jsNumeric(jsBox(search))
}

abstract class JSBigIntElement(kind: JSTypedArrayKind) : JSTypedArrayElement<JSBigInt>(kind) {
    override fun convert(value: Any?): JSBigInt = jsToBigIntElement(value)
    override val undefinedValue: JSBigInt? get() = null
    override val zero: JSBigInt get() = JSBigInt(0L)
    override fun less(a: JSBigInt, b: JSBigInt): Boolean = a < b
    override fun same(a: JSBigInt, b: JSBigInt, zero: Boolean): Boolean = a == b
    override fun string(value: JSBigInt): String = value.toString()
    override fun searched(search: Any?): JSBigInt? = jsBox(search) as? JSBigInt
}

object JSInt8Element : JSNumberElement(JSTypedArrayKind.INT8) {
    override fun load(bytes: ByteBuffer, at: Int): Double = bytes.get(at).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.put(at, jsToInt32(value).toByte()) }
}

object JSUint8Element : JSNumberElement(JSTypedArrayKind.UINT8) {
    override fun load(bytes: ByteBuffer, at: Int): Double = (bytes.get(at).toInt() and 0xFF).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.put(at, jsToInt32(value).toByte()) }
}

object JSUint8ClampedElement : JSNumberElement(JSTypedArrayKind.UINT8_CLAMPED) {
    override fun load(bytes: ByteBuffer, at: Int): Double = (bytes.get(at).toInt() and 0xFF).toDouble()
    /** ToUint8Clamp: clamped to 0…255, halves rounded to even. */
    override fun store(bytes: ByteBuffer, at: Int, value: Double) {
        bytes.put(at, if (value.isNaN()) 0 else Math.rint(minOf(maxOf(value, 0.0), 255.0)).toInt().toByte())
    }
}

object JSInt16Element : JSNumberElement(JSTypedArrayKind.INT16) {
    override fun load(bytes: ByteBuffer, at: Int): Double = bytes.getShort(at).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putShort(at, jsToInt32(value).toShort()) }
}

object JSUint16Element : JSNumberElement(JSTypedArrayKind.UINT16) {
    override fun load(bytes: ByteBuffer, at: Int): Double = (bytes.getShort(at).toInt() and 0xFFFF).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putShort(at, jsToInt32(value).toShort()) }
}

object JSInt32Element : JSNumberElement(JSTypedArrayKind.INT32) {
    override fun load(bytes: ByteBuffer, at: Int): Double = bytes.getInt(at).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putInt(at, jsToInt32(value)) }
}

object JSUint32Element : JSNumberElement(JSTypedArrayKind.UINT32) {
    override fun load(bytes: ByteBuffer, at: Int): Double = (bytes.getInt(at).toLong() and 0xFFFFFFFFL).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putInt(at, jsToUint32(value).toInt()) }
}

object JSFloat32Element : JSNumberElement(JSTypedArrayKind.FLOAT32) {
    override fun load(bytes: ByteBuffer, at: Int): Double = bytes.getFloat(at).toDouble()
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putFloat(at, value.toFloat()) }
}

object JSFloat64Element : JSNumberElement(JSTypedArrayKind.FLOAT64) {
    override fun load(bytes: ByteBuffer, at: Int): Double = bytes.getDouble(at)
    override fun store(bytes: ByteBuffer, at: Int, value: Double) { bytes.putDouble(at, value) }
}

object JSBigInt64Element : JSBigIntElement(JSTypedArrayKind.BIG_INT64) {
    override fun load(bytes: ByteBuffer, at: Int): JSBigInt = JSBigInt(bytes.getLong(at))
    override fun store(bytes: ByteBuffer, at: Int, value: JSBigInt) { bytes.putLong(at, value.value.toLong()) }
}

object JSBigUint64Element : JSBigIntElement(JSTypedArrayKind.BIG_UINT64) {
    private val two64: BigInteger = BigInteger.ONE.shiftLeft(64)
    override fun load(bytes: ByteBuffer, at: Int): JSBigInt = unsigned(bytes.getLong(at))
    override fun store(bytes: ByteBuffer, at: Int, value: JSBigInt) { bytes.putLong(at, value.value.toLong()) }
    internal fun unsigned(bits: Long): JSBigInt = JSBigInt(BigInteger.valueOf(bits).let { if (bits < 0) it.add(two64) else it })
}

// Typed arrays

/** Where a new typed array's elements are, and the values they start as (converted), if any. */
internal class JSTypedArrayLayout(val buffer: JSArrayBuffer, val offset: Int, val count: Int, val values: List<Any?>? = null) {
    companion object {
        fun fresh(count: Int, kind: JSTypedArrayKind, values: List<Any?>? = null) =
            JSTypedArrayLayout(JSArrayBuffer.allocate(count * kind.bytesPerElement), 0, count, values)

        fun ofLength(length: Double, kind: JSTypedArrayKind): JSTypedArrayLayout {
            val n = jsIndex(length)
            if (n == null || n > 4_294_967_295L / kind.bytesPerElement) throw JSException(JSRangeError("Invalid typed array length: ${jsNumberToString(length)}"))
            // A ByteBuffer holds at most Int.MAX_VALUE bytes.
            if (n > Int.MAX_VALUE / kind.bytesPerElement) throw JSException(JSRangeError("Array buffer allocation failed"))
            return fresh(n.toInt(), kind)
        }

        fun ofBuffer(buffer: JSArrayBuffer, byteOffset: Double?, length: Double?, kind: JSTypedArrayKind): JSTypedArrayLayout {
            val size = kind.bytesPerElement
            val start = jsIndex(byteOffset ?: 0.0)
                ?: throw JSException(JSRangeError("Start offset ${jsNumberToString(jsToIntegerOrInfinity(byteOffset ?: 0.0))} is outside the bounds of the buffer"))
            if (start % size != 0L) throw JSException(JSRangeError("start offset of ${kind.constructorName} should be a multiple of $size"))
            if (length != null) {
                val n = jsIndex(length)
                if (n == null || start > buffer.count || n > (buffer.count - start) / size) throw JSException(JSRangeError("Invalid typed array length: ${jsNumberToString(length)}"))
                return JSTypedArrayLayout(buffer, start.toInt(), n.toInt())
            }
            if (buffer.count % size != 0) throw JSException(JSRangeError("byte length of ${kind.constructorName} should be a multiple of $size"))
            if (start > buffer.count) throw JSException(JSRangeError("Start offset $start is outside the bounds of the buffer"))
            return JSTypedArrayLayout(buffer, start.toInt(), ((buffer.count - start) / size).toInt())
        }

        fun ofValues(values: Iterable<*>, kind: JSTypedArrayKind): JSTypedArrayLayout {
            if (values is JSTypedArray<*, *>) jsCheckContentType(values.kind, kind)
            val list = if (values is JSTypedArray<*, *>) values.jsAnyValues else values.toList()
            return fresh(list.size, kind, list)
        }

        /** `new Float32Array(x)` of an untyped value: a length, a buffer, a typed array's or an iterable's or array-like's values. */
        fun from(value: Any?, kind: JSTypedArrayKind): JSTypedArrayLayout = when (val v = jsBox(value)) {
            null, JSNull -> fresh(0, kind)
            is JSArrayBuffer -> ofBuffer(v, null, null, kind)
            is JSTypedArray<*, *> -> ofValues(v, kind)
            is String, is Boolean, is JSSymbol, is JSBigInt -> ofLength(jsToNumber(v), kind)
            else -> jsNumeric(v)?.let { ofLength(it, kind) } ?: jsArrayLikeValues(v).let { fresh(it.size, kind, it) }
        }
    }
}

/**
 * A typed array (`Float32Array`, `BigInt64Array` …): a view of a buffer's bytes as elements of one
 * type, `V` (Double, or JSBigInt), `A` the array's own class. An index out of range reads undefined
 * and is ignored on write; a written value is converted as the element type says.
 */
abstract class JSTypedArray<V : Any, A : JSTypedArray<V, A>> internal constructor(layout: JSTypedArrayLayout, val element: JSTypedArrayElement<V>) :
    JSArrayBufferView, JSToStringTag, JSStringConvertible, JSIterableValue, Iterable<V> {

    final override val buffer: JSArrayBuffer = layout.buffer
    internal val offset: Int = layout.offset
    internal val count: Int = layout.count
    private val stride = element.kind.bytesPerElement
    /** In the platform's byte order, as typed arrays are. */
    private val bytes: ByteBuffer = buffer.view(ByteOrder.nativeOrder())

    init {
        layout.values?.forEachIndexed { k, v -> put(element.convert(v), k) }
    }

    /** A new array of this class over those elements. */
    internal abstract fun make(layout: JSTypedArrayLayout): A

    @Suppress("UNCHECKED_CAST")
    private val self: A get() = this as A

    val kind: JSTypedArrayKind get() = element.kind
    val BYTES_PER_ELEMENT: Double get() = stride.toDouble()
    val length: Double get() = count.toDouble()
    final override val byteLength: Double get() = (count * stride).toDouble()
    final override val byteOffset: Double get() = offset.toDouble()
    override val jsBytes: ByteBuffer
        get() {
            val v = buffer.view(ByteOrder.nativeOrder())
            (v as java.nio.Buffer).position(offset)
            (v as java.nio.Buffer).limit(offset + count * stride)
            return v.slice().order(ByteOrder.nativeOrder())
        }
    val jsLength: Int get() = count
    /** The elements as JavaScript values: numbers, or BigInts. */
    val jsAnyValues: List<Any?> get() = (0 until count).map { value(it) }

    internal fun value(k: Int): V = element.load(bytes, offset + k * stride)
    internal fun put(v: V, k: Int) = element.store(bytes, offset + k * stride, v)

    /** `array[i]` read: undefined unless `i` is an integer index in range. */
    fun element(index: Double): V? {
        if (index != Math.floor(index) || index < 0 || index >= count) return null
        return value(index.toInt())
    }

    /** `array[i]` as a compound assignment (`+=`, `++`) reads it: undefined reads as NaN (0 in a BigInt array). */
    operator fun get(index: Double): V = element(index) ?: element.undefinedValue ?: element.zero
    operator fun get(index: Int): V = get(index.toDouble())

    /** `array[i] = value`: ignored out of range; undefined stores NaN converted (nothing in a BigInt array). */
    operator fun set(index: Double, value: V?) {
        if (index != Math.floor(index) || index < 0 || index >= count) return
        put(value ?: element.undefinedValue ?: return, index.toInt())
    }
    operator fun set(index: Int, value: V) = set(index.toDouble(), value)

    // Copies and views

    /** `array.set(source, offset)` from another typed array: its values converted; the source may view the same bytes. */
    fun set(source: JSTypedArray<*, *>, offset: Double? = null) {
        val start = setOffset(offset, source.count)
        jsCheckContentType(source.kind, kind)
        val values = source.jsAnyValues
        for ((k, v) in values.withIndex()) put(element.convert(v), start + k)
    }

    /** `array.set(values, offset)` from an array of the element type. */
    fun set(source: JSArray<V>, offset: Double? = null) {
        val values = source.elements.toList()
        val start = setOffset(offset, values.size)
        for ((k, v) in values.withIndex()) put(v, start + k)
    }

    /** `array.set(source, offset)` of an untyped source: a typed array, or an array-like's values converted. */
    fun set(source: Any?, offset: Double? = null) {
        val v = jsBox(source)
        if (v is JSTypedArray<*, *>) return set(v, offset)
        if (v == null || v === JSNull) throw JSException(JSTypeError("Cannot convert undefined or null to object"))
        val values = if (v is Boolean || jsNumeric(v) != null || v is JSSymbol || v is JSBigInt) emptyList() else jsArrayLikeValues(v)
        val start = setOffset(offset, values.size)
        for ((k, e) in values.withIndex()) put(element.convert(e), start + k)
    }

    private fun setOffset(offset: Double?, length: Int): Int {
        val n = jsToIntegerOrInfinity(offset ?: 0.0)
        if (n < 0 || n + length > count) throw JSException(JSRangeError("offset is out of bounds"))
        return n.toInt()
    }

    /** `array.subarray(begin, end)`: a view of the same bytes. */
    fun subarray(begin: Double? = null, end: Double? = null): A {
        val (from, to) = jsRelativeRange(begin, end, count)
        return make(JSTypedArrayLayout(buffer, offset + from * stride, to - from))
    }

    /** `array.slice(start, end)`: a new array of a copy of those elements. */
    fun slice(start: Double? = null, end: Double? = null): A {
        val (from, to) = jsRelativeRange(start, end, count)
        val copy = make(JSTypedArrayLayout.fresh(to - from, kind))
        for (k in from until to) copy.put(value(k), k - from)
        return copy
    }

    /** `array.fill(value, start, end)`: in place, returns the array. */
    fun fill(value: V, start: Double? = null, end: Double? = null): A {
        val (from, to) = jsRelativeRange(start, end, count)
        for (k in from until to) put(value, k)
        return self
    }

    /** `array.copyWithin(target, start, end)`: in place, returns the array. */
    fun copyWithin(target: Double, start: Double? = null, end: Double? = null): A {
        val to = jsRelativeIndex(target, count)
        val (from, last) = jsRelativeRange(start, end, count)
        val n = minOf(last - from, count - to)
        if (n > 0) {
            val moved = (from until from + n).map { value(it) }
            moved.forEachIndexed { i, v -> put(v, to + i) }
        }
        return self
    }

    /** `array.reverse()`: in place, returns the array. */
    fun reverse(): A {
        var i = 0
        var j = count - 1
        while (i < j) {
            val v = value(i)
            put(value(j), i)
            put(v, j)
            i++; j--
        }
        return self
    }

    /** `array.sort()`: in place, numerically (-0 before +0, NaN last). */
    fun sort(): A {
        val values = (0 until count).map { value(it) }.toMutableList()
        jsMergeSort(values) { a, b -> element.less(a, b) }
        values.forEachIndexed { k, v -> put(v, k) }
        return self
    }

    /** `array.sort(compare)`: in place and stable; a NaN comparison result counts as 0. */
    fun sort(compare: (V, V) -> Double): A {
        val values = (0 until count).map { value(it) }.toMutableList()
        jsMergeSort(values) { a, b -> compare(a, b) < 0 }
        values.forEachIndexed { k, v -> put(v, k) }
        return self
    }

    // Search

    /** `array.at(i)`: negative indexes count from the end; out of range is undefined. */
    fun at(index: Double): V? {
        val relative = jsToIntegerOrInfinity(index)
        val k = if (relative >= 0) relative else count + relative
        return if (k >= 0 && k < count) value(k.toInt()) else null
    }

    /** `array.indexOf(value, fromIndex)` with `===` (NaN is never found). */
    fun indexOf(search: V, fromIndex: Double? = null): Double {
        for (k in jsRelativeIndex(fromIndex ?: 0.0, count) until count) if (element.same(value(k), search, false)) return k.toDouble()
        return -1.0
    }

    /** `array.lastIndexOf(value, fromIndex)` with `===`. */
    fun lastIndexOf(search: V, fromIndex: Double? = null): Double {
        if (count == 0) return -1.0
        val n = fromIndex?.let { jsToIntegerOrInfinity(it) } ?: (count - 1).toDouble()
        if (n == Double.NEGATIVE_INFINITY) return -1.0
        var k = if (n >= 0) minOf(n, (count - 1).toDouble()).toInt() else maxOf(count + n, -1.0).toInt()
        while (k >= 0) {
            if (element.same(value(k), search, false)) return k.toDouble()
            k--
        }
        return -1.0
    }

    /** `array.includes(value, fromIndex)` with SameValueZero (NaN is found). */
    fun includes(search: V, fromIndex: Double? = null): Boolean {
        for (k in jsRelativeIndex(fromIndex ?: 0.0, count) until count) if (element.same(value(k), search, true)) return true
        return false
    }

    /** The first element, from the start or the end, the test accepts; the length is the one at the start. */
    private inline fun first(reversed: Boolean = false, test: (V, Int) -> Boolean): Int {
        val n = count
        for (i in 0 until n) {
            val k = if (reversed) n - 1 - i else i
            if (test(value(k), k)) return k
        }
        return -1
    }

    private fun found(k: Int): V? = if (k < 0) null else value(k)

    fun find(p: (V) -> Boolean): V? = found(first { v, _ -> p(v) })
    fun find(p: (V, Double) -> Boolean): V? = found(first { v, k -> p(v, k.toDouble()) })
    fun find(p: (V, Double, A) -> Boolean): V? = found(first { v, k -> p(v, k.toDouble(), self) })
    fun findIndex(p: (V) -> Boolean): Double = first { v, _ -> p(v) }.toDouble()
    fun findIndex(p: (V, Double) -> Boolean): Double = first { v, k -> p(v, k.toDouble()) }.toDouble()
    fun findIndex(p: (V, Double, A) -> Boolean): Double = first { v, k -> p(v, k.toDouble(), self) }.toDouble()
    fun findLast(p: (V) -> Boolean): V? = found(first(true) { v, _ -> p(v) })
    fun findLast(p: (V, Double) -> Boolean): V? = found(first(true) { v, k -> p(v, k.toDouble()) })
    fun findLast(p: (V, Double, A) -> Boolean): V? = found(first(true) { v, k -> p(v, k.toDouble(), self) })
    fun findLastIndex(p: (V) -> Boolean): Double = first(true) { v, _ -> p(v) }.toDouble()
    fun findLastIndex(p: (V, Double) -> Boolean): Double = first(true) { v, k -> p(v, k.toDouble()) }.toDouble()
    fun findLastIndex(p: (V, Double, A) -> Boolean): Double = first(true) { v, k -> p(v, k.toDouble(), self) }.toDouble()
    fun some(p: (V) -> Boolean): Boolean = first { v, _ -> p(v) } >= 0
    fun some(p: (V, Double) -> Boolean): Boolean = first { v, k -> p(v, k.toDouble()) } >= 0
    fun some(p: (V, Double, A) -> Boolean): Boolean = first { v, k -> p(v, k.toDouble(), self) } >= 0
    fun every(p: (V) -> Boolean): Boolean = first { v, _ -> !p(v) } < 0
    fun every(p: (V, Double) -> Boolean): Boolean = first { v, k -> !p(v, k.toDouble()) } < 0
    fun every(p: (V, Double, A) -> Boolean): Boolean = first { v, k -> !p(v, k.toDouble(), self) } < 0

    // Transforms

    fun forEach(body: (V) -> Unit) { first { v, _ -> body(v); false } }
    fun forEach(body: (V, Double) -> Unit) { first { v, k -> body(v, k.toDouble()); false } }
    fun forEach(body: (V, Double, A) -> Unit) { first { v, k -> body(v, k.toDouble(), self); false } }

    fun map(f: (V) -> V): A = mapped { v, _ -> f(v) }
    fun map(f: (V, Double) -> V): A = mapped { v, k -> f(v, k.toDouble()) }
    fun map(f: (V, Double, A) -> V): A = mapped { v, k -> f(v, k.toDouble(), self) }

    private inline fun mapped(f: (V, Int) -> V): A {
        val out = make(JSTypedArrayLayout.fresh(count, kind))
        for (k in 0 until count) out.put(f(value(k), k), k)
        return out
    }

    fun filter(p: (V) -> Boolean): A = filtered { v, _ -> p(v) }
    fun filter(p: (V, Double) -> Boolean): A = filtered { v, k -> p(v, k.toDouble()) }
    fun filter(p: (V, Double, A) -> Boolean): A = filtered { v, k -> p(v, k.toDouble(), self) }

    private inline fun filtered(test: (V, Int) -> Boolean): A {
        val kept = ArrayList<Any?>()
        for (k in 0 until count) {
            val v = value(k)
            if (test(v, k)) kept.add(v)
        }
        return make(JSTypedArrayLayout.fresh(kept.size, kind, kept))
    }

    fun <U> reduce(next: (U, V) -> U, initial: U): U = fold(initial, false) { a, v, _ -> next(a, v) }
    fun <U> reduce(next: (U, V, Double) -> U, initial: U): U = fold(initial, false) { a, v, k -> next(a, v, k.toDouble()) }
    fun <U> reduce(next: (U, V, Double, A) -> U, initial: U): U = fold(initial, false) { a, v, k -> next(a, v, k.toDouble(), self) }
    /** `array.reduce(f)`: the first element is the initial value; an empty array throws a TypeError. */
    fun reduce(next: (V, V) -> V): V = fold(false) { a, v, _ -> next(a, v) }
    fun reduce(next: (V, V, Double) -> V): V = fold(false) { a, v, k -> next(a, v, k.toDouble()) }
    fun reduce(next: (V, V, Double, A) -> V): V = fold(false) { a, v, k -> next(a, v, k.toDouble(), self) }
    fun <U> reduceRight(next: (U, V) -> U, initial: U): U = fold(initial, true) { a, v, _ -> next(a, v) }
    fun <U> reduceRight(next: (U, V, Double) -> U, initial: U): U = fold(initial, true) { a, v, k -> next(a, v, k.toDouble()) }
    fun <U> reduceRight(next: (U, V, Double, A) -> U, initial: U): U = fold(initial, true) { a, v, k -> next(a, v, k.toDouble(), self) }
    fun reduceRight(next: (V, V) -> V): V = fold(true) { a, v, _ -> next(a, v) }
    fun reduceRight(next: (V, V, Double) -> V): V = fold(true) { a, v, k -> next(a, v, k.toDouble()) }
    fun reduceRight(next: (V, V, Double, A) -> V): V = fold(true) { a, v, k -> next(a, v, k.toDouble(), self) }

    private inline fun <U> fold(initial: U, reversed: Boolean, next: (U, V, Int) -> U): U {
        var accumulator = initial
        first(reversed) { v, k -> accumulator = next(accumulator, v, k); false }
        return accumulator
    }

    /** A fold whose initial value is the first element visited, `seed` of its index. */
    private inline fun <U> foldElements(reversed: Boolean, seed: (Int) -> U, next: (U, V, Int) -> U): U {
        if (count == 0) throw JSException(JSTypeError("Reduce of empty array with no initial value"))
        var accumulator = seed(if (reversed) count - 1 else 0)
        var skipped = false
        first(reversed) { v, k ->
            if (skipped) accumulator = next(accumulator, v, k)
            skipped = true
            false
        }
        return accumulator
    }

    private inline fun fold(reversed: Boolean, next: (V, V, Int) -> V): V = foldElements(reversed, { value(it) }, next)

    // Iteration and strings

    override fun iterator(): Iterator<V> {
        var i = 0
        return object : Iterator<V> {
            override fun hasNext(): Boolean = i < count
            override fun next(): V = value(i++)
        }
    }

    /** `array.keys()`. */
    fun keys(): JSIterator<Double> {
        var i = 0
        return JSIterator { if (i < count) (i++).toDouble() else JSIterator.END }
    }

    /** `array.values()`. */
    fun values(): JSIterator<V> {
        var i = 0
        return JSIterator { if (i < count) value(i++) else JSIterator.END }
    }

    /** `array.entries()`, each entry an `(index, value)` pair. */
    fun entries(): JSIterator<Pair<Double, V>> {
        var i = 0
        return JSIterator { if (i < count) Pair(i.toDouble(), value(i++)) else JSIterator.END }
    }

    override fun jsAnyIterator(): JSIteratorProtocol = values()

    /** `array.join(separator)`. */
    fun join(separator: String = ","): String = (0 until count).joinToString(separator) { element.string(value(it)) }

    override fun toString(): String = join()

    // JSDynamic

    override val jsToStringTag: String get() = kind.constructorName
    override val jsKeys: List<String> get() = (0 until count).map { it.toString() }
    override val jsClassName: String? get() = kind.constructorName

    override fun jsGet(key: String): Any? = when (key) {
        "length" -> length
        "byteLength" -> byteLength
        "byteOffset" -> byteOffset
        "buffer" -> buffer
        "BYTES_PER_ELEMENT" -> BYTES_PER_ELEMENT
        else -> jsArrayIndex(key)?.let { element(it.toDouble()) } ?: method(key)
    }

    override fun jsSet(key: String, value: Any?) {
        val k = jsArrayIndex(key) ?: return
        val v = try { element.convert(value) } catch (_: JSException) { return }
        set(k.toDouble(), v)
    }

    /** The methods untyped code calls by name, with JavaScript values. */
    private fun method(key: String): JSMethod? {
        fun number(a: Array<out Any?>, i: Int): Double? = optionalNumber(a, i)
        fun test(callback: Any?): (V, Int) -> Boolean = { v, k -> jsTruthy(jsCall(callback, v, k.toDouble(), this)) }
        return when (key) {
            "set" -> JSMethod { _, a -> set(arg(a, 0), number(a, 1)); null }
            "subarray" -> JSMethod { _, a -> subarray(number(a, 0), number(a, 1)) }
            "slice" -> JSMethod { _, a -> slice(number(a, 0), number(a, 1)) }
            "fill" -> JSMethod { _, a -> fill(element.convert(arg(a, 0)), number(a, 1), number(a, 2)) }
            "copyWithin" -> JSMethod { _, a -> copyWithin(number(a, 0) ?: 0.0, number(a, 1), number(a, 2)) }
            "reverse" -> JSMethod { _, _ -> reverse() }
            "sort" -> JSMethod { _, a ->
                val callback = arg(a, 0)
                if (jsIsNullish(callback)) sort() else sort { x, y -> jsToNumber(jsCall(callback, x, y)) }
            }
            "at" -> JSMethod { _, a -> at(number(a, 0) ?: 0.0) }
            "indexOf" -> JSMethod { _, a -> element.searched(arg(a, 0))?.let { indexOf(it, number(a, 1)) } ?: -1.0 }
            "lastIndexOf" -> JSMethod { _, a -> element.searched(arg(a, 0))?.let { if (a.size > 1) lastIndexOf(it, number(a, 1) ?: 0.0) else lastIndexOf(it) } ?: -1.0 }
            "includes" -> JSMethod { _, a -> element.searched(arg(a, 0))?.let { includes(it, number(a, 1)) } ?: false }
            "join" -> JSMethod { _, a -> join(if (jsIsNullish(arg(a, 0))) "," else jsToString(arg(a, 0))) }
            "toString" -> JSMethod { _, _ -> toString() }
            "forEach" -> JSMethod { _, a -> val t = test(arg(a, 0)); first { v, k -> t(v, k); false }; null }
            "map" -> JSMethod { _, a -> val callback = arg(a, 0); mapped { v, k -> element.convert(jsCall(callback, v, k.toDouble(), this)) } }
            "filter" -> JSMethod { _, a -> filtered(test(arg(a, 0))) }
            "find" -> JSMethod { _, a -> found(first(false, test(arg(a, 0)))) }
            "findIndex" -> JSMethod { _, a -> first(false, test(arg(a, 0))).toDouble() }
            "findLast" -> JSMethod { _, a -> found(first(true, test(arg(a, 0)))) }
            "findLastIndex" -> JSMethod { _, a -> first(true, test(arg(a, 0))).toDouble() }
            "some" -> JSMethod { _, a -> first(false, test(arg(a, 0))) >= 0 }
            "every" -> JSMethod { _, a -> val t = test(arg(a, 0)); first { v, k -> !t(v, k) } < 0 }
            "reduce", "reduceRight" -> JSMethod { _, a ->
                val reversed = key == "reduceRight"
                val callback = arg(a, 0)
                val step = { acc: Any?, v: V, k: Int -> jsCall(callback, acc, v, k.toDouble(), this) }
                if (a.size > 1) fold(arg(a, 1), reversed, step) else foldElements<Any?>(reversed, { value(it) }, step)
            }
            "keys" -> JSMethod { _, _ -> keys() }
            "values" -> JSMethod { _, _ -> values() }
            "entries" -> JSMethod { _, _ ->
                var i = 0
                JSIterator<Any?> { if (i < count) JSArray(arrayListOf<Any?>(i.toDouble(), value(i++))) else JSIterator.END }
            }
            else -> null
        }
    }
}

private fun arg(args: Array<out Any?>, i: Int): Any? = if (i < args.size) args[i] else null

/** An optional numeric argument of a method called by name: undefined and null are absent. */
private fun optionalNumber(args: Array<out Any?>, i: Int): Double? = arg(args, i).let { if (jsIsNullish(it)) null else jsToNumber(it) }

/** `Int8Array`. */
class JSInt8Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSInt8Array>(layout, JSInt8Element) {
    /** `new Int8Array(length)`. */
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.INT8))
    /** `new Int8Array(buffer, byteOffset, length)`. */
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.INT8))
    /** `new Int8Array(values)`: an array's, an iterable's or a typed array's values, converted. */
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.INT8))
    override fun make(layout: JSTypedArrayLayout) = JSInt8Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 1.0
        /** `new Int8Array(x)` of an untyped value. */
        fun from(value: Any?) = JSInt8Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.INT8))
        fun of(vararg items: Double) = JSInt8Array(items.asList())
        val jsPrototype: JSInt8Array by lazy { JSInt8Array() }
    }
}

/** `Uint8Array`. */
class JSUint8Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSUint8Array>(layout, JSUint8Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.UINT8))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.UINT8))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.UINT8))
    override fun make(layout: JSTypedArrayLayout) = JSUint8Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 1.0
        fun from(value: Any?) = JSUint8Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.UINT8))
        fun of(vararg items: Double) = JSUint8Array(items.asList())
        val jsPrototype: JSUint8Array by lazy { JSUint8Array() }
    }
}

/** `Uint8ClampedArray`. */
class JSUint8ClampedArray private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSUint8ClampedArray>(layout, JSUint8ClampedElement) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.UINT8_CLAMPED))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.UINT8_CLAMPED))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.UINT8_CLAMPED))
    override fun make(layout: JSTypedArrayLayout) = JSUint8ClampedArray(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 1.0
        fun from(value: Any?) = JSUint8ClampedArray(JSTypedArrayLayout.from(value, JSTypedArrayKind.UINT8_CLAMPED))
        fun of(vararg items: Double) = JSUint8ClampedArray(items.asList())
        val jsPrototype: JSUint8ClampedArray by lazy { JSUint8ClampedArray() }
    }
}

/** `Int16Array`. */
class JSInt16Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSInt16Array>(layout, JSInt16Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.INT16))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.INT16))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.INT16))
    override fun make(layout: JSTypedArrayLayout) = JSInt16Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 2.0
        fun from(value: Any?) = JSInt16Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.INT16))
        fun of(vararg items: Double) = JSInt16Array(items.asList())
        val jsPrototype: JSInt16Array by lazy { JSInt16Array() }
    }
}

/** `Uint16Array`. */
class JSUint16Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSUint16Array>(layout, JSUint16Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.UINT16))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.UINT16))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.UINT16))
    override fun make(layout: JSTypedArrayLayout) = JSUint16Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 2.0
        fun from(value: Any?) = JSUint16Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.UINT16))
        fun of(vararg items: Double) = JSUint16Array(items.asList())
        val jsPrototype: JSUint16Array by lazy { JSUint16Array() }
    }
}

/** `Int32Array`. */
class JSInt32Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSInt32Array>(layout, JSInt32Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.INT32))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.INT32))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.INT32))
    override fun make(layout: JSTypedArrayLayout) = JSInt32Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 4.0
        fun from(value: Any?) = JSInt32Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.INT32))
        fun of(vararg items: Double) = JSInt32Array(items.asList())
        val jsPrototype: JSInt32Array by lazy { JSInt32Array() }
    }
}

/** `Uint32Array`. */
class JSUint32Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSUint32Array>(layout, JSUint32Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.UINT32))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.UINT32))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.UINT32))
    override fun make(layout: JSTypedArrayLayout) = JSUint32Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 4.0
        fun from(value: Any?) = JSUint32Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.UINT32))
        fun of(vararg items: Double) = JSUint32Array(items.asList())
        val jsPrototype: JSUint32Array by lazy { JSUint32Array() }
    }
}

/** `Float32Array`. */
class JSFloat32Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSFloat32Array>(layout, JSFloat32Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.FLOAT32))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.FLOAT32))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.FLOAT32))
    override fun make(layout: JSTypedArrayLayout) = JSFloat32Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 4.0
        fun from(value: Any?) = JSFloat32Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.FLOAT32))
        fun of(vararg items: Double) = JSFloat32Array(items.asList())
        val jsPrototype: JSFloat32Array by lazy { JSFloat32Array() }
    }
}

/** `Float64Array`. */
class JSFloat64Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<Double, JSFloat64Array>(layout, JSFloat64Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.FLOAT64))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.FLOAT64))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.FLOAT64))
    override fun make(layout: JSTypedArrayLayout) = JSFloat64Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 8.0
        fun from(value: Any?) = JSFloat64Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.FLOAT64))
        fun of(vararg items: Double) = JSFloat64Array(items.asList())
        val jsPrototype: JSFloat64Array by lazy { JSFloat64Array() }
    }
}

/** `BigInt64Array`. */
class JSBigInt64Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<JSBigInt, JSBigInt64Array>(layout, JSBigInt64Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.BIG_INT64))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.BIG_INT64))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.BIG_INT64))
    override fun make(layout: JSTypedArrayLayout) = JSBigInt64Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 8.0
        fun from(value: Any?) = JSBigInt64Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.BIG_INT64))
        fun of(vararg items: JSBigInt) = JSBigInt64Array(items.asList())
        val jsPrototype: JSBigInt64Array by lazy { JSBigInt64Array() }
    }
}

/** `BigUint64Array`. */
class JSBigUint64Array private constructor(layout: JSTypedArrayLayout) : JSTypedArray<JSBigInt, JSBigUint64Array>(layout, JSBigUint64Element) {
    constructor(length: Double = 0.0) : this(JSTypedArrayLayout.ofLength(length, JSTypedArrayKind.BIG_UINT64))
    constructor(buffer: JSArrayBuffer, byteOffset: Double? = null, length: Double? = null) : this(JSTypedArrayLayout.ofBuffer(buffer, byteOffset, length, JSTypedArrayKind.BIG_UINT64))
    constructor(values: Iterable<*>) : this(JSTypedArrayLayout.ofValues(values, JSTypedArrayKind.BIG_UINT64))
    override fun make(layout: JSTypedArrayLayout) = JSBigUint64Array(layout)
    companion object {
        const val BYTES_PER_ELEMENT = 8.0
        fun from(value: Any?) = JSBigUint64Array(JSTypedArrayLayout.from(value, JSTypedArrayKind.BIG_UINT64))
        fun of(vararg items: JSBigInt) = JSBigUint64Array(items.asList())
        val jsPrototype: JSBigUint64Array by lazy { JSBigUint64Array() }
    }
}

/** Numbers and BigInts never convert into each other's typed arrays. */
private fun jsCheckContentType(source: JSTypedArrayKind, target: JSTypedArrayKind) {
    if (source.isBigInt != target.isBigInt) throw JSException(JSTypeError("Cannot mix BigInt and other types, use explicit conversions"))
}

/** ToBigInt, as a BigInt array converts what is written to it: a number is a TypeError. */
internal fun jsToBigIntElement(value: Any?): JSBigInt = when (val v = jsBox(value)) {
    is JSBigInt -> v
    else -> jsNumeric(v)?.let { throw JSException(JSTypeError("Cannot convert ${jsNumberToString(it)} to a BigInt")) } ?: JSBigInt.convert(v)
}

/** An iterable's values, or else an array-like's (`{ length, 0: … }`). */
private fun jsArrayLikeValues(value: Any): List<Any?> = when (value) {
    is JSArray<*> -> value.storage.toList()
    is JSTypedArray<*, *> -> value.jsAnyValues
    is String -> value.map { it.toString() }
    is Pair<*, *>, is Triple<*, *, *> -> jsTupleList(value)
    is JSIterableValue, is JSSet<*>, is JSMap<*, *> -> try { jsIteratorOf(value).jsCollect() } catch (_: JSException) { emptyList() }
    is Iterable<*> -> value.toList()
    else -> {
        val length = jsToIntegerOrInfinity(jsToNumber(try { jsGet(value, "length") } catch (_: JSException) { null }))
        if (length <= 0) emptyList() else (0 until minOf(length, 4_294_967_295.0).toInt()).map { try { jsGet(value, it.toString()) } catch (_: JSException) { null } }
    }
}

// DataView

/** `DataView`: a buffer's bytes read and written as numbers of any type, at any offset, in either byte order. */
class JSDataView(override val buffer: JSArrayBuffer, byteOffset: Double? = null, byteLength: Double? = null) : JSArrayBufferView, JSToStringTag {
    internal val offset: Int = jsIndex(byteOffset ?: 0.0)?.takeIf { it <= buffer.count }?.toInt()
        ?: throw JSException(JSRangeError("Start offset ${jsNumberToString(jsToIntegerOrInfinity(byteOffset ?: 0.0))} is outside the bounds of the buffer"))
    internal val count: Int = (if (byteLength == null) (buffer.count - offset).toLong() else jsIndex(byteLength))?.takeIf { offset + it <= buffer.count }?.toInt()
        ?: throw JSException(JSRangeError("Invalid DataView length ${jsNumberToString(byteLength ?: 0.0)}"))
    /** Its own order, set at each access: big-endian unless asked otherwise. */
    private val bytes: ByteBuffer = buffer.view(ByteOrder.BIG_ENDIAN)

    override val byteLength: Double get() = count.toDouble()
    override val byteOffset: Double get() = offset.toDouble()
    override val jsBytes: ByteBuffer
        get() {
            val v = buffer.view(ByteOrder.BIG_ENDIAN)
            (v as java.nio.Buffer).position(offset)
            (v as java.nio.Buffer).limit(offset + count)
            return v.slice()
        }

    private fun at(byteOffset: Double, size: Int, littleEndian: Boolean?): Int {
        val k = jsIndex(byteOffset)
        if (k == null || k + size > count) throw JSException(JSRangeError("Offset is outside the bounds of the DataView"))
        bytes.order(if (littleEndian == true) ByteOrder.LITTLE_ENDIAN else ByteOrder.BIG_ENDIAN)
        return offset + k.toInt()
    }

    fun getInt8(byteOffset: Double): Double = bytes.get(at(byteOffset, 1, null)).toDouble()
    fun getUint8(byteOffset: Double): Double = (bytes.get(at(byteOffset, 1, null)).toInt() and 0xFF).toDouble()
    fun getInt16(byteOffset: Double, littleEndian: Boolean? = null): Double = bytes.getShort(at(byteOffset, 2, littleEndian)).toDouble()
    fun getUint16(byteOffset: Double, littleEndian: Boolean? = null): Double = (bytes.getShort(at(byteOffset, 2, littleEndian)).toInt() and 0xFFFF).toDouble()
    fun getInt32(byteOffset: Double, littleEndian: Boolean? = null): Double = bytes.getInt(at(byteOffset, 4, littleEndian)).toDouble()
    fun getUint32(byteOffset: Double, littleEndian: Boolean? = null): Double = (bytes.getInt(at(byteOffset, 4, littleEndian)).toLong() and 0xFFFFFFFFL).toDouble()
    fun getFloat32(byteOffset: Double, littleEndian: Boolean? = null): Double = bytes.getFloat(at(byteOffset, 4, littleEndian)).toDouble()
    fun getFloat64(byteOffset: Double, littleEndian: Boolean? = null): Double = bytes.getDouble(at(byteOffset, 8, littleEndian))
    fun getBigInt64(byteOffset: Double, littleEndian: Boolean? = null): JSBigInt = JSBigInt(bytes.getLong(at(byteOffset, 8, littleEndian)))
    fun getBigUint64(byteOffset: Double, littleEndian: Boolean? = null): JSBigInt = JSBigUint64Element.unsigned(bytes.getLong(at(byteOffset, 8, littleEndian)))

    fun setInt8(byteOffset: Double, value: Double) { bytes.put(at(byteOffset, 1, null), jsToInt32(value).toByte()) }
    fun setUint8(byteOffset: Double, value: Double) { bytes.put(at(byteOffset, 1, null), jsToInt32(value).toByte()) }
    fun setInt16(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putShort(at(byteOffset, 2, littleEndian), jsToInt32(value).toShort()) }
    fun setUint16(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putShort(at(byteOffset, 2, littleEndian), jsToInt32(value).toShort()) }
    fun setInt32(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putInt(at(byteOffset, 4, littleEndian), jsToInt32(value)) }
    fun setUint32(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putInt(at(byteOffset, 4, littleEndian), jsToUint32(value).toInt()) }
    fun setFloat32(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putFloat(at(byteOffset, 4, littleEndian), value.toFloat()) }
    fun setFloat64(byteOffset: Double, value: Double, littleEndian: Boolean? = null) { bytes.putDouble(at(byteOffset, 8, littleEndian), value) }
    fun setBigInt64(byteOffset: Double, value: JSBigInt, littleEndian: Boolean? = null) { bytes.putLong(at(byteOffset, 8, littleEndian), value.value.toLong()) }
    fun setBigUint64(byteOffset: Double, value: JSBigInt, littleEndian: Boolean? = null) { bytes.putLong(at(byteOffset, 8, littleEndian), value.value.toLong()) }

    override val jsToStringTag: String get() = "DataView"
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "DataView"
    override fun jsGet(key: String): Any? = when (key) {
        "byteLength" -> byteLength
        "byteOffset" -> byteOffset
        "buffer" -> buffer
        else -> method(key)
    }
    override fun jsSet(key: String, value: Any?) {}

    /** The methods untyped code calls by name, with JavaScript values. */
    private fun method(key: String): JSMethod? {
        if (!(key.startsWith("get") || key.startsWith("set"))) return null
        val little = { a: Array<out Any?> -> jsTruthy(arg(a, if (key.startsWith("get")) 1 else 2)) }
        val at = { a: Array<out Any?> -> jsToNumber(arg(a, 0)) }
        val number = { a: Array<out Any?> -> jsToNumber(arg(a, 1)) }
        return when (key) {
            "getInt8" -> JSMethod { _, a -> getInt8(at(a)) }
            "getUint8" -> JSMethod { _, a -> getUint8(at(a)) }
            "getInt16" -> JSMethod { _, a -> getInt16(at(a), little(a)) }
            "getUint16" -> JSMethod { _, a -> getUint16(at(a), little(a)) }
            "getInt32" -> JSMethod { _, a -> getInt32(at(a), little(a)) }
            "getUint32" -> JSMethod { _, a -> getUint32(at(a), little(a)) }
            "getFloat32" -> JSMethod { _, a -> getFloat32(at(a), little(a)) }
            "getFloat64" -> JSMethod { _, a -> getFloat64(at(a), little(a)) }
            "getBigInt64" -> JSMethod { _, a -> getBigInt64(at(a), little(a)) }
            "getBigUint64" -> JSMethod { _, a -> getBigUint64(at(a), little(a)) }
            "setInt8" -> JSMethod { _, a -> setInt8(at(a), number(a)); null }
            "setUint8" -> JSMethod { _, a -> setUint8(at(a), number(a)); null }
            "setInt16" -> JSMethod { _, a -> setInt16(at(a), number(a), little(a)); null }
            "setUint16" -> JSMethod { _, a -> setUint16(at(a), number(a), little(a)); null }
            "setInt32" -> JSMethod { _, a -> setInt32(at(a), number(a), little(a)); null }
            "setUint32" -> JSMethod { _, a -> setUint32(at(a), number(a), little(a)); null }
            "setFloat32" -> JSMethod { _, a -> setFloat32(at(a), number(a), little(a)); null }
            "setFloat64" -> JSMethod { _, a -> setFloat64(at(a), number(a), little(a)); null }
            "setBigInt64" -> JSMethod { _, a -> setBigInt64(at(a), jsToBigIntElement(arg(a, 1)), little(a)); null }
            "setBigUint64" -> JSMethod { _, a -> setBigUint64(at(a), jsToBigIntElement(arg(a, 1)), little(a)); null }
            else -> null
        }
    }

    companion object {
        /** `new DataView(x, …)` of an untyped value: a TypeError unless it is an ArrayBuffer. */
        fun from(value: Any?, byteOffset: Double? = null, byteLength: Double? = null): JSDataView {
            val buffer = jsBox(value) as? JSArrayBuffer ?: throw JSException(JSTypeError("First argument to DataView constructor must be an ArrayBuffer"))
            return JSDataView(buffer, byteOffset, byteLength)
        }
    }
}

/** A length in bytes: a whole number from 0, or null (a RangeError). */
private fun jsByteCount(value: Double): Int? {
    val n = jsToIntegerOrInfinity(value)
    if (n < 0 || n > 4_294_967_295.0) return null
    if (n > Int.MAX_VALUE) throw JSException(JSRangeError("Array buffer allocation failed"))
    return n.toInt()
}

/** ToIndex: a whole number from 0, or null (a RangeError). */
private fun jsIndex(value: Double): Long? {
    val n = jsToIntegerOrInfinity(value)
    return if (n < 0 || n > 9_007_199_254_740_991.0) null else n.toLong()
}

/** `slice`'s start and end, relative to the end where negative, clamped to `0..count`. */
private fun jsRelativeRange(start: Double?, end: Double?, count: Int): Pair<Int, Int> {
    val from = start?.let { jsRelativeIndex(it, count) } ?: 0
    val to = end?.let { jsRelativeIndex(it, count) } ?: count
    return Pair(from, maxOf(from, to))
}
