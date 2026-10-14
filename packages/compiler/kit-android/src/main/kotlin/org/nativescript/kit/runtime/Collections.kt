package org.nativescript.kit

import java.lang.ref.WeakReference

/** SameValueZero for collection keys: strings by code units, numbers by value with NaN equal to NaN and -0 to +0, objects (tuples and data classes too) by identity. */
private fun jsSameKey(a: Any?, b: Any?): Boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a is String) return b is String && a == b
    if (a is Double && b is Double) {
        val x: Double = a
        val y: Double = b
        return x == y || (x.isNaN() && y.isNaN())
    }
    if (a is Boolean && b is Boolean) return a == b
    if (a is JSBigInt || b is JSBigInt) return a == b
    val m = jsNumeric(a)
    val n = jsNumeric(b)
    if (m != null || n != null) return m != null && n != null && (m == n || (m.isNaN() && n.isNaN()))
    return false
}

/** A hash agreeing with jsSameKey. */
private fun jsKeyHash(key: Any?): Int = when (key) {
    null -> 0
    is String -> key.hashCode()
    is Double -> { val d: Double = key; if (d == 0.0) 0 else d.hashCode() }
    is Boolean, is JSBigInt -> key.hashCode()
    else -> jsNumeric(key)?.let { if (it == 0.0) 0 else it.hashCode() } ?: System.identityHashCode(key)
}

internal class JSCollectionCursor {
    var position = 0
    var done = false
}

/**
 * Insertion-ordered entries with tombstones in parallel arrays, indexed by chained hashing as V8's OrderedHashTable
 * is: a bucket holds its newest entry, `chain` each entry's older neighbour. Iteration follows JavaScript when the
 * collection changes underneath it: added entries are visited, deleted ones not yet reached are skipped, and after
 * `clear()` iteration resumes from the start of whatever is added next.
 */
internal class JSOrderedTable(private val withValues: Boolean) {
    private var keys = arrayOfNulls<Any?>(INITIAL_CAPACITY)
    private var values: Array<Any?> = if (withValues) arrayOfNulls(INITIAL_CAPACITY) else NO_VALUES
    private var hashes = IntArray(INITIAL_CAPACITY)
    private var chain = IntArray(INITIAL_CAPACITY)
    private var buckets = IntArray(INITIAL_CAPACITY).also { it.fill(-1) }
    private var shift = 32 - Integer.numberOfTrailingZeros(INITIAL_CAPACITY)
    /** Entries used, tombstones included. */
    private var used = 0
    var live = 0
        private set
    private val cursors = ArrayList<WeakReference<JSCollectionCursor>>()

    private fun bucket(hash: Int): Int = (hash * -0x61c88647) ushr shift

    /** The entry holding `key`, or -1. */
    fun find(key: Any?): Int {
        val hash = jsKeyHash(key)
        var e = buckets[bucket(hash)]
        while (e >= 0) {
            if (hashes[e] == hash && jsSameKey(keys[e], key)) return e
            e = chain[e]
        }
        return -1
    }

    fun key(entry: Int): Any? = keys[entry]
    fun value(entry: Int): Any? = values[entry]
    fun setValue(entry: Int, value: Any?) { values[entry] = value }

    /** Adds `key`, which the table does not hold. */
    fun append(key: Any?, value: Any?) {
        if (used == keys.size) rebuild()
        val hash = jsKeyHash(key)
        val e = used++
        keys[e] = key
        if (withValues) values[e] = value
        hashes[e] = hash
        val b = bucket(hash)
        chain[e] = buckets[b]
        buckets[b] = e
        live++
    }

    fun remove(key: Any?): Boolean {
        val e = find(key)
        if (e < 0) return false
        // The entry stays in its chain, matching nothing.
        keys[e] = DELETED
        if (withValues) values[e] = null
        live--
        return true
    }

    fun removeAll() {
        keys = arrayOfNulls(INITIAL_CAPACITY)
        if (withValues) values = arrayOfNulls(INITIAL_CAPACITY)
        hashes = IntArray(INITIAL_CAPACITY)
        chain = IntArray(INITIAL_CAPACITY)
        buckets = IntArray(INITIAL_CAPACITY).also { it.fill(-1) }
        shift = 32 - Integer.numberOfTrailingZeros(INITIAL_CAPACITY)
        used = 0
        live = 0
        for (weak in cursors) weak.get()?.position = 0
    }

    fun makeCursor(): JSCollectionCursor {
        val cursor = JSCollectionCursor()
        if (cursors.size >= 8) cursors.removeAll { it.get() == null }
        cursors.add(WeakReference(cursor))
        return cursor
    }

    /** The next live entry for `cursor`, or -1 when it is done. */
    fun next(cursor: JSCollectionCursor): Int {
        if (cursor.done) return -1
        while (cursor.position < used) {
            val e = cursor.position++
            if (keys[e] !== DELETED) return e
        }
        cursor.done = true
        // A finished iteration needs no repositioning: dropped now, not at the next GC.
        for (i in cursors.indices.reversed()) if (cursors[i].get().let { it == null || it === cursor }) cursors.removeAt(i)
        return -1
    }

    /** Full: twice the room, or the same room without tombstones when they are most of it. Cursors keep their place. */
    private fun rebuild() {
        val capacity = if (live * 2 <= keys.size && keys.size >= 16) keys.size else keys.size * 2
        val newKeys = arrayOfNulls<Any?>(capacity)
        val newValues: Array<Any?> = if (withValues) arrayOfNulls(capacity) else NO_VALUES
        val newHashes = IntArray(capacity)
        val remap = IntArray(used + 1)
        var n = 0
        for (e in 0 until used) {
            remap[e] = n
            if (keys[e] === DELETED) continue
            newKeys[n] = keys[e]
            if (withValues) newValues[n] = values[e]
            newHashes[n] = hashes[e]
            n++
        }
        remap[used] = n
        cursors.removeAll { it.get() == null }
        for (weak in cursors) weak.get()?.let { it.position = remap[minOf(it.position, used)] }
        keys = newKeys
        values = newValues
        hashes = newHashes
        chain = IntArray(capacity)
        buckets = IntArray(capacity).also { it.fill(-1) }
        shift = 32 - Integer.numberOfTrailingZeros(capacity)
        used = n
        for (e in 0 until n) {
            val b = bucket(hashes[e])
            chain[e] = buckets[b]
            buckets[b] = e
        }
    }

    /** The live entries' indices, in order. */
    val entries: List<Int> get() = (0 until used).filter { keys[it] !== DELETED }

    private companion object {
        const val INITIAL_CAPACITY = 8
        val NO_VALUES = arrayOfNulls<Any?>(0)
        /** A deleted entry's key: no key is it. */
        val DELETED = Any()
    }
}

/** A key as the collection stores it: -0 as +0. A boxed Double's `==` tells them apart, so the comparison is on the primitive. */
@Suppress("UNCHECKED_CAST")
private fun <K> jsNormalizedKey(key: K): K {
    if (key !is Double) return key
    val d: Double = key
    return if (d == 0.0) 0.0 as K else key
}

/** A JavaScript `Map`: insertion-ordered, reference semantics, SameValueZero keys. */
@Suppress("UNCHECKED_CAST")
class JSMap<K, V>() : Iterable<Pair<K, V>>, JSReactiveConvertible {
    private val table = JSOrderedTable(withValues = true)
    var jsTracker: JSTracker? = null

    constructor(entries: Iterable<Pair<K, V>>) : this() {
        for ((k, v) in entries) set(k, v)
    }

    fun get(key: K): V? {
        val tracker = jsTracker
        val e = table.find(key)
        if (tracker == null) return if (e < 0) null else table.value(e) as V
        tracker.track()
        val v = if (e < 0) null else table.value(e) as V
        jsReactiveAny(v)
        return v
    }

    fun set(key: K, value: V): JSMap<K, V> {
        val e = table.find(key)
        if (e >= 0) {
            if (jsSameValue(table.value(e), value)) return this
            table.setValue(e, value)
        } else table.append(jsNormalizedKey(key), value)
        jsTracker?.trigger()
        return this
    }

    fun has(key: K): Boolean {
        jsTracker?.track()
        return table.find(key) >= 0
    }

    fun delete(key: K): Boolean {
        val removed = table.remove(key)
        if (removed) jsTracker?.trigger()
        return removed
    }

    fun clear() {
        if (table.live == 0) return
        table.removeAll()
        jsTracker?.trigger()
    }

    val size: Double get() { jsTracker?.track(); return table.live.toDouble() }

    fun forEach(f: (V) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; f(table.value(e) as V) }
    }

    fun forEach(f: (V, K, JSMap<K, V>) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; f(table.value(e) as V, table.key(e) as K, this) }
    }

    fun forEach(f: (V, K) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; f(table.value(e) as V, table.key(e) as K) }
    }

    fun keys(): JSIterator<K> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e < 0) JSIterator.END else table.key(e) }
    }

    fun values(): JSIterator<V> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e < 0) JSIterator.END else table.value(e) }
    }

    fun entries(): JSIterator<Pair<K, V>> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e < 0) JSIterator.END else Pair(table.key(e) as K, table.value(e) as V) }
    }

    override fun iterator(): Iterator<Pair<K, V>> = entries()

    val jsEntries: List<Pair<Any?, Any?>> get() = table.entries.map { Pair(table.key(it), table.value(it)) }

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)
}

/** A JavaScript `Set`: insertion-ordered, reference semantics, SameValueZero values. */
@Suppress("UNCHECKED_CAST")
class JSSet<T>() : Iterable<T>, JSReactiveConvertible {
    private val table = JSOrderedTable(withValues = false)
    var jsTracker: JSTracker? = null

    constructor(values: Iterable<T>) : this() {
        for (v in values) add(v)
    }

    fun add(value: T): JSSet<T> {
        if (table.find(value) >= 0) return this
        table.append(jsNormalizedKey(value), null)
        jsTracker?.trigger()
        return this
    }

    fun has(value: T): Boolean {
        jsTracker?.track()
        return table.find(value) >= 0
    }

    fun delete(value: T): Boolean {
        val removed = table.remove(value)
        if (removed) jsTracker?.trigger()
        return removed
    }

    fun clear() {
        if (table.live == 0) return
        table.removeAll()
        jsTracker?.trigger()
    }

    val size: Double get() { jsTracker?.track(); return table.live.toDouble() }

    fun forEach(f: (T) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; f(table.key(e) as T) }
    }

    fun forEach(f: (T, T, JSSet<T>) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; val v = table.key(e) as T; f(v, v, this) }
    }

    fun forEach(f: (T, T) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor); if (e < 0) break; val v = table.key(e) as T; f(v, v) }
    }

    fun values(): JSIterator<T> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e < 0) JSIterator.END else table.key(e) }
    }

    fun keys(): JSIterator<T> = values()

    fun entries(): JSIterator<Pair<T, T>> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e < 0) JSIterator.END else (table.key(e) as T).let { Pair(it, it) } }
    }

    override fun iterator(): Iterator<T> = values()

    val jsValues: List<Any?> get() = table.entries.map { table.key(it) }

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)
}

/**
 * An object used as a dictionary (`Record<string, V>`, `{ [key: string]: V }`): JavaScript's
 * key order (integer-like keys ascending, then insertion order) and reference semantics.
 */
class JSRecord<V>(val obj: JSObject) : JSDynamic, JSReactiveConvertible {
    constructor() : this(JSObject())

    constructor(entries: List<Pair<String, V>>) : this() {
        for ((k, v) in entries) obj[k] = v
    }

    @Suppress("UNCHECKED_CAST")
    operator fun get(key: String): V? = obj[key] as V?

    operator fun set(key: String, value: V?) { obj[key] = value }

    fun delete(key: String): Boolean = obj.delete(key)
    fun has(key: String): Boolean = obj.has(key)

    val keys: JSArray<String> get() = JSArray(obj.jsKeys)
    @Suppress("UNCHECKED_CAST")
    val values: JSArray<V> get() = JSArray(obj.jsKeys.map { obj[it] as V })
    @Suppress("UNCHECKED_CAST")
    val entries: JSArray<Pair<String, V>> get() = JSArray(obj.jsKeys.map { Pair(it, obj[it] as V) })

    override fun jsGet(key: String): Any? = obj.jsGet(key)
    override fun jsSet(key: String, value: Any?) = obj.jsSet(key, value)
    override val jsKeys: List<String> get() = obj.jsKeys
    override val jsClassName: String? get() = null

    override fun jsMakeReactive() = obj.jsMakeReactive()

    override fun toString(): String = jsInspect(this)
}

/**
 * An untyped value read as a dictionary (`Record<string, V>`): a plain object is
 * shared, so writes through either show in both; another object's own keys are copied.
 */
@Suppress("UNCHECKED_CAST")
fun <V> jsRecordOrNull(value: Any?): JSRecord<V>? = when (value) {
    null, JSNull -> null
    is JSRecord<*> -> value as JSRecord<V>
    is JSObject -> JSRecord(value)
    is JSDynamic -> JSRecord<V>().also { r -> for (k in value.jsKeys) r.obj[k] = value.jsGet(k) }
    else -> throw JSException(JSTypeError("${jsTypeof(value)} is not an object"))
}

fun <V> jsRecord(value: Any?): JSRecord<V> = jsRecordOrNull(value) ?: throw JSException(JSTypeError("Cannot convert undefined or null to object"))
