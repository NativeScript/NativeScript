package org.nativescript.kit

import java.lang.ref.WeakReference
import java.util.IdentityHashMap

/** A tagged template's strings array; translated code makes one per call site. */
fun jsTemplateObject(cooked: List<String>, raw: List<String>): JSArray<String> {
    val strings = JSArray(ArrayList(cooked))
    templateRaws[strings] = JSArray(ArrayList(raw))
    return strings
}

/** `strings.raw`. */
fun jsTemplateRaw(strings: JSArray<String>): JSArray<String> = templateRaws[strings] ?: strings

private val templateRaws = IdentityHashMap<JSArray<String>, JSArray<String>>()

/**
 * A JavaScript symbol: equal only to itself. As a property key it is `key`,
 * a string no JavaScript code spells, which `Object.keys`, `for…in` and JSON skip.
 */
class JSSymbol(val jsDescription: String?) {
    val key: String = "\u0000@@" + (++count)

    init { byKey[key] = this }

    override fun toString(): String = "Symbol(${jsDescription ?: ""})"
    fun valueOf(): JSSymbol = this

    companion object {
        private var count = 0
        private val byKey = HashMap<String, JSSymbol>()
        private val registry = HashMap<String, JSSymbol>()

        /** `Symbol.for(key)`: one symbol per key, program-wide. */
        fun `for`(key: String): JSSymbol = registry.getOrPut(key) { JSSymbol(key) }

        /** `Symbol.keyFor(symbol)`: the key of a registered symbol. */
        fun keyFor(symbol: JSSymbol): String? = symbol.jsDescription?.takeIf { registry[it] === symbol }

        val iterator = JSSymbol("Symbol.iterator")
        val asyncIterator = JSSymbol("Symbol.asyncIterator")
        val toPrimitive = JSSymbol("Symbol.toPrimitive")
        val toStringTag = JSSymbol("Symbol.toStringTag")
        val hasInstance = JSSymbol("Symbol.hasInstance")

        /** The symbol a property key stands for. */
        fun of(key: String): JSSymbol? = if (jsIsSymbolKey(key)) byKey[key] else null
    }
}

/** `Symbol(description)`. */
fun jsSymbol(description: String?): JSSymbol = JSSymbol(description)

/** Whether a property key is a symbol's. */
fun jsIsSymbolKey(key: String): Boolean = key.isNotEmpty() && key[0] == '\u0000'

/** An object with symbol-keyed properties, which print after its other keys. */
interface JSSymbolKeyed {
    val jsSymbolKeys: List<String>
}

/** `[Symbol.toPrimitive](hint)` on a class. */
interface JSToPrimitive {
    fun jsToPrimitive(hint: String): Any?
}

/** `get [Symbol.toStringTag]()` on a class. */
interface JSToStringTag {
    val jsToStringTag: String
}

internal fun jsUserPrimitive(value: JSToPrimitive, hint: String): Any? = jsBox(value.jsToPrimitive(hint))

/** `Object.getOwnPropertySymbols(value)`. */
fun jsOwnPropertySymbols(value: Any?): JSArray<JSSymbol> =
    JSArray(ArrayList((value as? JSSymbolKeyed)?.jsSymbolKeys?.mapNotNull { JSSymbol.of(it) } ?: emptyList()))

/** `Object.prototype.toString.call(value)`. */
fun jsObjectToString(value: Any?): String = when (val v = jsBox(value)) {
    null -> "[object Undefined]"
    JSNull -> "[object Null]"
    is JSToStringTag -> "[object ${v.jsToStringTag}]"
    is JSArray<*> -> "[object Array]"
    is String -> "[object String]"
    is Boolean -> "[object Boolean]"
    is JSError -> "[object Error]"
    is JSDate -> "[object Date]"
    is JSRegExp -> "[object RegExp]"
    is JSMap<*, *> -> "[object Map]"
    is JSSet<*> -> "[object Set]"
    is JSThenable -> "[object Promise]"
    is JSSymbol -> "[object Symbol]"
    is Function<*> -> "[object Function]"
    else -> if (jsNumeric(v) != null) "[object Number]" else "[object Object]"
}

/** NativeScript's `WeakRef`: `get()` (and the standard `deref()`) is the object while it lives. */
class JSWeakRef<T : Any>(target: T) : JSDynamic {
    private var ref: WeakReference<T>? = WeakReference(target)

    fun get(): T? = ref?.get()
    fun deref(): T? = ref?.get()
    fun clear() { ref = null }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "WeakRef"
}

/** A `WeakMap` or `WeakSet`, whose contents cannot be listed. */
interface JSWeakCollection : JSDynamic

private class WeakEntry<V>(key: Any, var value: V) {
    val key = WeakReference(key)
}

/** The object a weak collection's key must be; null for a primitive. */
private fun weakKey(key: Any?): Any? {
    val v = jsBox(key) ?: return null
    return if (v === JSNull || v is String || v is Boolean || v is JSSymbol || jsNumeric(v) != null) null else v
}

/** A JavaScript `WeakMap`: keys by identity, held weakly; an entry goes with its key. */
class JSWeakMap<K, V>() : JSWeakCollection {
    private val table = HashMap<Int, MutableList<WeakEntry<V>>>()
    private var writes = 0

    constructor(entries: Iterable<*>) : this() {
        @Suppress("UNCHECKED_CAST")
        for (e in entries) { val (k, v) = e as Pair<K, V>; set(k, v) }
    }

    private fun find(key: Any?): WeakEntry<V>? {
        val k = weakKey(key) ?: return null
        return table[System.identityHashCode(k)]?.firstOrNull { it.key.get() === k }
    }

    fun get(key: K): V? = find(key)?.value
    fun has(key: K): Boolean = find(key) != null

    fun set(key: K, value: V): JSWeakMap<K, V> {
        val k = weakKey(key) ?: throw JSException(JSTypeError("Invalid value used as weak map key"))
        if (++writes % 32 == 0) table.values.forEach { list -> list.removeAll { it.key.get() == null } }
        val existing = find(k)
        if (existing != null) existing.value = value
        else table.getOrPut(System.identityHashCode(k)) { ArrayList() }.add(WeakEntry(k, value))
        return this
    }

    fun delete(key: K): Boolean {
        val k = weakKey(key) ?: return false
        val list = table[System.identityHashCode(k)] ?: return false
        return list.removeAll { it.key.get() === k }
    }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "WeakMap"
}

/** A JavaScript `WeakSet`: members by identity, held weakly. */
class JSWeakSet<T>() : JSWeakCollection {
    private val map = JSWeakMap<T, Boolean>()

    constructor(values: Iterable<*>) : this() {
        @Suppress("UNCHECKED_CAST")
        for (v in values) add(v as T)
    }

    fun add(value: T): JSWeakSet<T> {
        if (weakKey(value) == null) throw JSException(JSTypeError("Invalid value used in weak set"))
        map.set(value, true)
        return this
    }

    fun has(value: T): Boolean = map.has(value)
    fun delete(value: T): Boolean = map.delete(value)

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "WeakSet"
}

/** `delete object[key]`. */
fun jsDelete(target: Any?, key: String): Boolean = (jsBox(target) as? JSObject)?.delete(key) ?: true

/** `{ ...source }` into an object literal being built: the source's own enumerable keys, symbols last. */
fun jsObjectSpread(target: JSObject, source: Any?) {
    val dynamic = jsBox(source) as? JSDynamic ?: return
    for (key in dynamic.jsKeys) target[key] = dynamic.jsGet(key)
    if (dynamic is JSSymbolKeyed) for (key in dynamic.jsSymbolKeys) target[key] = dynamic.jsGet(key)
}
