package org.nativescript.kit

import java.lang.ref.WeakReference

/**
 * A `Map`/`Set` key under SameValueZero: strings by code units, numbers by value with NaN
 * equal to NaN and -0 equal to +0, objects (tuples and data classes too) by identity.
 */
internal class JSCollectionKey(val value: Any?) {
    override fun equals(other: Any?): Boolean {
        if (other !is JSCollectionKey) return false
        val a = value
        val b = other.value
        if (a == null || b == null) return a == null && b == null
        if (a is String && b is String) return a == b
        if (a is Boolean && b is Boolean) return a == b
        if (a is JSBigInt || b is JSBigInt) return a == b
        val m = jsNumeric(a)
        val n = jsNumeric(b)
        if (m != null || n != null) return m != null && n != null && (m == n || (m.isNaN() && n.isNaN()))
        return a === b
    }

    override fun hashCode(): Int {
        val v = value ?: return 0
        if (v is String || v is Boolean || v is JSBigInt) return v.hashCode()
        val n = jsNumeric(v)
        if (n != null) return if (n == 0.0) 0 else n.hashCode()
        return System.identityHashCode(v)
    }
}

internal class JSCollectionCursor {
    var position = 0
    var done = false
}

/**
 * Insertion-ordered slots with tombstones. Iteration follows JavaScript when the collection
 * changes underneath it: added entries are visited, deleted ones not yet reached are skipped,
 * and after `clear()` iteration resumes from the start of whatever is added next.
 */
internal class JSOrderedSlots<K, V> {
    class Entry<K, V>(val key: K, var value: V)

    var slots = ArrayList<Entry<K, V>?>()
        private set
    private val index = HashMap<JSCollectionKey, Int>()
    var live = 0
        private set
    private val cursors = ArrayList<WeakReference<JSCollectionCursor>>()

    fun find(key: Any?): Entry<K, V>? = index[JSCollectionKey(key)]?.let { slots[it] }

    fun append(key: K, value: V) {
        compactIfNeeded()
        index[JSCollectionKey(key)] = slots.size
        slots.add(Entry(key, value))
        live++
    }

    fun remove(key: Any?): Boolean {
        val position = index.remove(JSCollectionKey(key)) ?: return false
        slots[position] = null
        live--
        return true
    }

    fun removeAll() {
        slots.clear()
        index.clear()
        live = 0
        for (weak in cursors) weak.get()?.position = 0
    }

    fun makeCursor(): JSCollectionCursor {
        val cursor = JSCollectionCursor()
        if (cursors.size >= 8) cursors.removeAll { it.get() == null }
        cursors.add(WeakReference(cursor))
        return cursor
    }

    fun next(cursor: JSCollectionCursor): Entry<K, V>? {
        if (cursor.done) return null
        while (cursor.position < slots.size) {
            val slot = slots[cursor.position]
            cursor.position++
            if (slot != null) return slot
        }
        cursor.done = true
        return null
    }

    private fun compactIfNeeded() {
        if (slots.size < 16 || slots.size - live <= live) return
        val remap = IntArray(slots.size + 1)
        val compacted = ArrayList<Entry<K, V>?>(live * 2)
        for ((position, slot) in slots.withIndex()) {
            remap[position] = compacted.size
            if (slot != null) compacted.add(slot)
        }
        remap[slots.size] = compacted.size
        cursors.removeAll { it.get() == null }
        for (weak in cursors) weak.get()?.let { it.position = remap[minOf(it.position, slots.size)] }
        slots = compacted
        index.clear()
        for ((position, slot) in slots.withIndex()) index[JSCollectionKey(slot!!.key)] = position
    }

    val entries: List<Entry<K, V>> get() = slots.filterNotNull()
}

@Suppress("UNCHECKED_CAST")
private fun <K> jsNormalizedKey(key: K): K = if (key is Double && key == 0.0) 0.0 as K else key

/** A JavaScript `Map`: insertion-ordered, reference semantics, SameValueZero keys. */
class JSMap<K, V>() : Iterable<Pair<K, V>>, JSReactiveConvertible {
    private val table = JSOrderedSlots<K, V>()
    var jsTracker: JSTracker? = null

    constructor(entries: Iterable<Pair<K, V>>) : this() {
        for ((k, v) in entries) set(k, v)
    }

    fun get(key: K): V? {
        jsTracker?.track()
        val v = table.find(key)?.value
        if (jsTracker != null) jsReactiveAny(v)
        return v
    }

    fun set(key: K, value: V): JSMap<K, V> {
        val entry = table.find(key)
        if (entry != null) {
            if (jsSameValue(entry.value, value)) return this
            entry.value = value
        } else table.append(jsNormalizedKey(key), value)
        jsTracker?.trigger()
        return this
    }

    fun has(key: K): Boolean {
        jsTracker?.track()
        return table.find(key) != null
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

    fun forEach(f: (V) -> Unit) = forEach { v, _ -> f(v) }
    fun forEach(f: (V, K) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor) ?: break; f(e.value, e.key) }
    }

    fun keys(): JSIterator<K> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e == null) JSIterator.END else e.key }
    }

    fun values(): JSIterator<V> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e == null) JSIterator.END else e.value }
    }

    fun entries(): JSIterator<Pair<K, V>> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e == null) JSIterator.END else Pair(e.key, e.value) }
    }

    override fun iterator(): Iterator<Pair<K, V>> = entries()

    val jsEntries: List<Pair<Any?, Any?>> get() = table.entries.map { Pair(it.key, it.value) }

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)
}

/** A JavaScript `Set`: insertion-ordered, reference semantics, SameValueZero values. */
class JSSet<T>() : Iterable<T>, JSReactiveConvertible {
    private val table = JSOrderedSlots<T, Unit>()
    var jsTracker: JSTracker? = null

    constructor(values: Iterable<T>) : this() {
        for (v in values) add(v)
    }

    fun add(value: T): JSSet<T> {
        if (table.find(value) != null) return this
        table.append(jsNormalizedKey(value), Unit)
        jsTracker?.trigger()
        return this
    }

    fun has(value: T): Boolean {
        jsTracker?.track()
        return table.find(value) != null
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

    fun forEach(f: (T) -> Unit) = forEach { v, _ -> f(v) }
    fun forEach(f: (T, T) -> Unit) {
        val cursor = table.makeCursor()
        while (true) { val e = table.next(cursor) ?: break; f(e.key, e.key) }
    }

    fun values(): JSIterator<T> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e == null) JSIterator.END else e.key }
    }

    fun keys(): JSIterator<T> = values()

    fun entries(): JSIterator<Pair<T, T>> {
        jsTracker?.track()
        val cursor = table.makeCursor()
        return JSIterator { val e = table.next(cursor); if (e == null) JSIterator.END else Pair(e.key, e.key) }
    }

    override fun iterator(): Iterator<T> = values()

    val jsValues: List<Any?> get() = table.entries.map { it.key }

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

    operator fun set(key: String, value: V) { obj[key] = value }

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
