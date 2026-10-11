package org.nativescript.kit

import java.lang.ref.ReferenceQueue
import java.lang.ref.WeakReference

/**
 * Values by key identity, each key held weakly: an entry goes once the GC clears its key. Values are
 * held strongly, so a value that reaches its own key keeps the entry: keys whose class can carry
 * their values (`JSWeakSlots`) should. Synchronized, as a worker's thread and the main thread share
 * the runtime's tables.
 */
internal class JSWeakIdentityTable<V> {
    private class Entry<V>(key: Any, queue: ReferenceQueue<Any>, val hash: Int, var value: V) : WeakReference<Any>(key, queue)

    private val queue = ReferenceQueue<Any>()
    private val buckets = HashMap<Int, ArrayList<Entry<V>>>()
    @Volatile private var count = 0

    /** Whether no entry is left: read without the lock, for lookups that are usually misses. */
    val isEmpty: Boolean get() = count == 0

    private fun find(key: Any): Entry<V>? = buckets[System.identityHashCode(key)]?.firstOrNull { it.get() === key }

    /** Drops the entries whose keys the GC cleared, and the buckets they leave empty. */
    private fun expunge() {
        while (true) {
            @Suppress("UNCHECKED_CAST")
            val e = queue.poll() as Entry<V>? ?: return
            val list = buckets[e.hash] ?: continue
            if (list.remove(e)) count--
            if (list.isEmpty()) buckets.remove(e.hash)
        }
    }

    @Synchronized fun get(key: Any): V? {
        expunge()
        return find(key)?.value
    }

    @Synchronized fun containsKey(key: Any): Boolean {
        expunge()
        return find(key) != null
    }

    @Synchronized fun set(key: Any, value: V) {
        expunge()
        val e = find(key)
        if (e != null) e.value = value
        else {
            val hash = System.identityHashCode(key)
            buckets.getOrPut(hash) { ArrayList(1) }.add(Entry(key, queue, hash, value))
            count++
        }
    }

    @Synchronized fun getOrPut(key: Any, make: () -> V): V {
        expunge()
        find(key)?.let { return it.value }
        val value = make()
        val hash = System.identityHashCode(key)
        buckets.getOrPut(hash) { ArrayList(1) }.add(Entry(key, queue, hash, value))
        count++
        return value
    }

    @Synchronized fun remove(key: Any): Boolean {
        expunge()
        val hash = System.identityHashCode(key)
        val list = buckets[hash] ?: return false
        val e = list.firstOrNull { it.get() === key } ?: return false
        list.remove(e)
        count--
        if (list.isEmpty()) buckets.remove(hash)
        return true
    }
}

/**
 * The values weak collections hold for an object the runtime defines (a plain object, a script
 * class instance's expando): kept by the object itself, so a value reaching its key does not keep
 * the key alive, as a WeakMap's entry is an ephemeron. Each by its collection, held weakly.
 */
internal class JSWeakSlots {
    private val maps = ArrayList<WeakReference<Any>>(1)
    private val values = ArrayList<Any?>(1)

    private fun index(map: Any): Int {
        for (i in maps.indices) if (maps[i].get() === map) return i
        return -1
    }

    @Synchronized fun has(map: Any): Boolean = index(map) >= 0
    @Synchronized fun get(map: Any): Any? = index(map).let { if (it >= 0) values[it] else null }

    @Synchronized fun set(map: Any, value: Any?) {
        val i = index(map)
        if (i >= 0) { values[i] = value; return }
        for (k in maps.indices.reversed()) if (maps[k].get() == null) { maps.removeAt(k); values.removeAt(k) }
        maps.add(WeakReference(map))
        values.add(value)
    }

    @Synchronized fun remove(map: Any): Boolean {
        val i = index(map)
        if (i < 0) return false
        maps.removeAt(i)
        values.removeAt(i)
        return true
    }
}
