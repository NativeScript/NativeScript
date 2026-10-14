package org.nativescript.kit

import java.lang.ref.SoftReference
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

private val templateRaws = java.util.Collections.synchronizedMap(IdentityHashMap<JSArray<String>, JSArray<String>>())

/**
 * A JavaScript symbol: equal only to itself. As a property key it is `key`,
 * a string no JavaScript code spells, which `Object.keys`, `for…in` and JSON skip.
 */
class JSSymbol(val jsDescription: String?) {
    val key: String = "\u0000@@" + count.incrementAndGet()

    init {
        byKey[key] = WeakReference(this)
        if (count.get() % 256 == 0) byKey.values.removeIf { it.get() == null }
    }

    override fun toString(): String = "Symbol(${jsDescription ?: ""})"
    fun valueOf(): JSSymbol = this

    companion object {
        private val count = java.util.concurrent.atomic.AtomicInteger()
        /** Weak: a symbol nothing holds any more is gone, though an object may still have a property under its key. */
        private val byKey = java.util.concurrent.ConcurrentHashMap<String, WeakReference<JSSymbol>>()
        private val registry = java.util.concurrent.ConcurrentHashMap<String, JSSymbol>()

        /** `Symbol.for(key)`: one symbol per key, program-wide. */
        fun `for`(key: String): JSSymbol = registry.computeIfAbsent(key) { JSSymbol(it) }

        /** `Symbol.keyFor(symbol)`: the key of a registered symbol. */
        fun keyFor(symbol: JSSymbol): String? = symbol.jsDescription?.takeIf { registry[it] === symbol }

        val iterator = JSSymbol("Symbol.iterator")
        val asyncIterator = JSSymbol("Symbol.asyncIterator")
        val toPrimitive = JSSymbol("Symbol.toPrimitive")
        val toStringTag = JSSymbol("Symbol.toStringTag")
        val hasInstance = JSSymbol("Symbol.hasInstance")

        /** The symbol a property key stands for. */
        fun of(key: String): JSSymbol? = if (jsIsSymbolKey(key)) byKey[key]?.get() else null
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

/**
 * NativeScript's `WeakRef`: `get()` (and the standard `deref()`) is the object while it lives. Soft, as V8 clears a
 * WeakRef only in a full collection: core holds objects this alone keeps (an Animation its AnimatorListener reaches
 * through one) and expects them while they work; ART clears a weak reference in any collection.
 */
class JSWeakRef<T : Any>(target: T) : JSDynamic {
    private var ref: SoftReference<T>? = SoftReference(target)

    fun get(): T? = ref?.get()
    fun deref(): T? = ref?.get()
    fun clear() { ref = null }

    // Read untyped (`view.nsView?.get()` on a native view): by name, as release builds rename members reflection would find.
    override fun jsGet(key: String): Any? = when (key) {
        "get", "deref" -> jsFunction { ref?.get() }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "WeakRef"
}

/** A `WeakMap` or `WeakSet`, whose contents cannot be listed. */
interface JSWeakCollection : JSDynamic

/** The object a weak collection's key must be; null for a primitive. */
private fun weakKey(key: Any?): Any? {
    val v = jsBox(key) ?: return null
    return if (v === JSNull || v is String || v is Boolean || v is JSSymbol || jsNumeric(v) != null) null else v
}

/** The slots of a key that carries its weak collections' values itself; null for one that cannot. */
private fun slotsOf(key: Any, create: Boolean): JSWeakSlots? {
    val holder = when (key) {
        is JSObject -> key
        is JSExpando -> key.jsExpando ?: if (create) JSObject().also { key.jsExpando = it } else return null
        else -> return null
    }
    return holder.weakSlots ?: if (create) synchronized(holder) { holder.weakSlots ?: JSWeakSlots().also { holder.weakSlots = it } } else null
}

/**
 * A JavaScript `WeakMap`: keys by identity, held weakly; an entry goes with its key. A plain object
 * or a script class instance keeps its own entries, so the value may reach the key; any other key's
 * entry is the map's, its value held strongly.
 */
class JSWeakMap<K, V>() : JSWeakCollection {
    private val table = JSWeakIdentityTable<Any?>()

    constructor(entries: Iterable<*>) : this() {
        @Suppress("UNCHECKED_CAST")
        for (e in entries) { val (k, v) = e as Pair<K, V>; set(k, v) }
    }

    @Suppress("UNCHECKED_CAST")
    fun get(key: K): V? {
        val k = weakKey(key) ?: return null
        slotsOf(k, false)?.let { return it.get(this) as V? }
        return if (table.isEmpty) null else table.get(k) as V?
    }

    fun has(key: K): Boolean {
        val k = weakKey(key) ?: return false
        slotsOf(k, false)?.let { return it.has(this) }
        return !table.isEmpty && table.containsKey(k)
    }

    fun set(key: K, value: V): JSWeakMap<K, V> {
        val k = weakKey(key) ?: throw JSException(JSTypeError("Invalid value used as weak map key"))
        val slots = slotsOf(k, true)
        if (slots != null) slots.set(this, value) else table.set(k, value)
        return this
    }

    fun delete(key: K): Boolean {
        val k = weakKey(key) ?: return false
        slotsOf(k, false)?.let { return it.remove(this) }
        return table.remove(k)
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
fun jsDelete(target: Any?, key: String): Boolean = when (val v = jsBox(target)) {
    is JSObject -> if (v.delete(key)) true else throw JSException(JSTypeError("Cannot delete property '$key' of #<Object>"))
    is JSDeletable -> v.jsDelete(key)
    is JSDynamic -> if (jsRestriction(v) >= 2 && key in v.jsKeys) throw JSException(JSTypeError("Cannot delete property '$key' of #<Object>")) else true
    else -> true
}

/** `{ ...source }` into an object literal being built: the source's own enumerable keys, symbols last. */
fun jsObjectSpread(target: JSObject, source: Any?) {
    val dynamic = jsBox(source) as? JSDynamic ?: return
    for (key in dynamic.jsKeys) target[key] = dynamic.jsGet(key)
    if (dynamic is JSSymbolKeyed) for (key in dynamic.jsSymbolKeys) target[key] = dynamic.jsGet(key)
}

/** `const { a, ...rest } = source`: a new object of the source's own enumerable keys but those the pattern names. */
fun jsObjectRest(source: Any?, taken: List<String>): JSObject {
    val rest = JSObject()
    jsObjectSpread(rest, source)
    for (key in taken) rest.delete(key)
    return rest
}

/** A property's slot when it is an accessor or its attributes are not all true. */
class JSPropertySlot(
    var get: ((Any?) -> Any?)? = null,
    var set: ((Any?, Any?) -> Unit)? = null,
    var isAccessor: Boolean = false,
    var enumerable: Boolean = true,
    var writable: Boolean = true,
    var configurable: Boolean = true,
) {
    val isPlain: Boolean get() = !isAccessor && enumerable && writable && configurable
}

/** A property descriptor as `Object.defineProperty` reads it. */
class JSPropertyDescriptor(
    val value: Any? = null,
    val hasValue: Boolean = false,
    val get: ((Any?) -> Any?)? = null,
    val set: ((Any?, Any?) -> Unit)? = null,
    val enumerable: Boolean? = null,
    val writable: Boolean? = null,
    val configurable: Boolean? = null,
) {
    companion object {
        /** A descriptor object script wrote (`{ value, enumerable, get() {…} }`). */
        fun of(o: Any?): JSPropertyDescriptor {
            val d = jsBox(o) as? JSDynamic ?: throw JSException(JSTypeError("Property description must be an object: ${jsToString(o)}"))
            val has = { k: String -> jsHasKey(d, k) }
            val g = if (has("get")) jsBox(d.jsGet("get"))?.let { jsReceiving(it) } else null
            val s = if (has("set")) jsBox(d.jsGet("set"))?.let { jsReceiving(it) } else null
            return JSPropertyDescriptor(
                value = if (has("value")) d.jsGet("value") else null, hasValue = has("value"),
                get = g?.let { f -> { self: Any? -> f(self, emptyArray()) } },
                set = s?.let { f -> { self: Any?, v: Any? -> f(self, arrayOf(v)); Unit } },
                enumerable = if (has("enumerable")) jsTruthy(d.jsGet("enumerable")) else null,
                writable = if (has("writable")) jsTruthy(d.jsGet("writable")) else null,
                configurable = if (has("configurable")) jsTruthy(d.jsGet("configurable")) else null,
            )
        }
    }
}

/** A function value called with a receiver: a method sees it as `this`. */
private fun jsReceiving(f: Any): (Any?, Array<out Any?>) -> Any? = when (f) {
    is JSMethod -> { self, args -> f.call(self, args) }
    is Function<*> -> { _, args -> jsCall(f, *args) }
    else -> throw JSException(JSTypeError("Getter must be a function: ${jsInspect(f)}"))
}

/** A function that reads `this`: a method of an untyped object literal. `length` is script's count of its parameters. */
class JSMethod(val call: (Any?, Array<out Any?>) -> Any?) : Function<Any?> {
    var length = 0
    constructor(length: Int, call: (Any?, Array<out Any?>) -> Any?) : this(call) { this.length = length }
}

/** A method read from a prototype for an instance (`View.prototype._setMinWidthNative`): the instance is its `this`. */
fun jsBoundTo(value: Any?, receiver: Any?): Any? = if (value is JSMethod) JSFunction { args -> value.call(receiver, args.toTypedArray()) } else value

/** `object.method(args)` on an untyped object: a method sees the object as `this`. */
fun jsCallMethod(target: Any?, key: String, vararg args: Any?): Any? {
    // `fn.call(thisArg, …)`, `fn.apply(thisArg, list)` of a function value: a method sees `thisArg`, any other function ignores it.
    // `fn.bind(thisArg, …)`: a method sees `thisArg`; the arguments given come first.
    if (key == "bind" && jsIsFunction(target)) {
        val self = args.getOrNull(0)
        val given = args.drop(1)
        val method = target as? JSMethod ?: (target as? JSMethodHolder)?.method
        return JSMethod { _, a -> if (method != null) jsBox(method.call(self, (given + a).toTypedArray())) else jsCall(target, *(given + a).toTypedArray()) }
    }
    if ((key == "call" || key == "apply") && jsIsFunction(target)) {
        val rest = if (key == "call") args.drop(1) else (jsBox(args.getOrNull(1)) as? JSArray<*>)?.storage?.toList() ?: listOf()
        val method = target as? JSMethod ?: (target as? JSMethodHolder)?.method
        return if (method != null) jsBox(method.call(args.getOrNull(0), rest.toTypedArray())) else jsCall(target, *rest.toTypedArray())
    }
    var f = jsGet(target, key)
    // What every object inherits (`hasOwnProperty`), where the object has nothing of that name.
    if (jsBox(f) == null && jsBox(target) is JSDynamic && JSPrototypes.objectPrototype.has(key)) f = JSPrototypes.objectPrototype[key]
    if (f is JSMethod) return jsBox(f.call(target, args))
    return jsCall(f, *args)
}

/** `object?.method(args)`: undefined when the object is undefined or null. */
fun jsCallMethodIfPresent(target: Any?, key: String, vararg args: Any?): Any? = if (jsIsNullish(target)) null else jsCallMethod(target, key, *args)

/** An object whose accessor properties print as `[Getter]`, `[Setter]` or `[Getter/Setter]`. */
interface JSAccessorKeyed {
    fun jsAccessorKind(key: String): String?
}

/** What inspect prints in place of an accessor's value. */
class JSInspectAccessor(val kind: String)

/** `Object.defineProperty(object, key, descriptor)`. */
fun jsDefineProperty(target: Any?, key: String, descriptor: Any?): Any? {
    val d = JSPropertyDescriptor.of(descriptor)
    when (val v = jsBox(target)) {
        is JSObject -> v.defineProperty(key, d)
        is JSExpando -> (v.jsExpando ?: JSObject().also { v.jsExpando = it }).defineProperty(key, d)
        is Function<*>, is JSFunction -> jsFunctionProperties(v, true)!!.defineProperty(key, d)
        is JSDynamic -> {
            if (d.get != null || d.set != null) throw JSException(JSTypeError("Cannot define an accessor on a typed object: $key"))
            if (d.hasValue) v.jsSet(key, d.value)
        }
        is JSArray<*> -> if (key == "length" || jsArrayIndex(key) != null) {
            if (d.get != null || d.set != null) throw JSException(JSTypeError("Cannot define an accessor on an array's index or length: $key"))
            if (d.hasValue) jsSet(v, key, d.value)
        } else (v.jsProperties ?: JSObject().also { v.jsProperties = it }).defineProperty(key, d)
        else -> throw JSException(JSTypeError("Object.defineProperty called on non-object"))
    }
    return target
}

/** `Object.defineProperties(object, descriptors)`. */
fun jsDefineProperties(target: Any?, descriptors: Any?): Any? {
    for (key in jsKeysOf(descriptors)) jsDefineProperty(target, key, jsGet(descriptors, key))
    return target
}

/** `Object.getOwnPropertyDescriptor(object, key)`. */
fun jsOwnPropertyDescriptor(target: Any?, key: String): Any? = when (val v = jsBox(target)) {
    is JSObject -> v.descriptor(key)
    is JSExpando -> v.jsExpando?.descriptor(key) ?: jsDeclaredDescriptor(v, key)
    is JSArray<*> -> v.jsProperties?.descriptor(key)
    is Function<*>, is JSFunction -> jsFunctionProperties(v, false)?.descriptor(key)
    is JSDynamic -> jsDeclaredDescriptor(v, key)
    else -> null
}

/** The descriptor of a key a typed object declares: a writable, enumerable data property, as far as freezing left it. */
private fun jsDeclaredDescriptor(v: JSDynamic, key: String): JSObject? = if (key !in v.jsKeys) null else {
    val level = jsRestriction(v)
    JSObject(listOf(Pair("value", v.jsGet(key)), Pair("writable", level < 3), Pair("enumerable", true), Pair("configurable", level < 2)))
}

/** `Object.getOwnPropertyNames(value)`. */
fun jsOwnPropertyNames(value: Any?): JSArray<String> = when (val v = jsBox(value)) {
    is JSObject -> JSArray(ArrayList(v.ownPropertyNames))
    is JSArray<*> -> JSArray(ArrayList((0 until v.storage.size).map { it.toString() } + "length"))
    is String -> JSArray(ArrayList(v.indices.map { it.toString() } + "length"))
    else -> JSArray(ArrayList(jsKeysOf(v)))
}

/** How far `Object.preventExtensions`, `seal` or `freeze` closed an object other than a plain one. */
private val restricted = JSWeakIdentityTable<Int>()

/** 0: open; 1: not extensible; 2: sealed; 3: frozen. */
fun jsRestriction(obj: Any): Int = if (restricted.isEmpty) 0 else restricted.get(obj) ?: 0

private fun restrict(value: Any?, level: Int) {
    when (val v = jsBox(value)) {
        is JSObject -> v.restrict(level >= 2, level >= 3)
        null, JSNull, is String, is Boolean, is Double, is JSSymbol -> {}
        else -> synchronized(restricted) { restricted.set(v, maxOf(restricted.get(v) ?: 0, level)) }
    }
}

/** `Object.freeze(value)`. */
fun <T> jsFreeze(value: T): T { restrict(value, 3); return value }

/** `Object.seal(value)` and `Object.preventExtensions(value)`. */
fun <T> jsRestrict(value: T, sealed: Boolean): T { restrict(value, if (sealed) 2 else 1); return value }

private fun level(value: Any?): Int? = when (val v = jsBox(value)) {
    is JSObject -> if (v.isFrozen) 3 else if (v.isSealed) 2 else if (v.extensible) 0 else 1
    null, JSNull, is String, is Boolean, is Double, is JSSymbol -> null
    else -> jsRestriction(v)
}

/** `Object.isFrozen(value)`: primitives are. */
fun jsIsFrozen(value: Any?): Boolean = (level(value) ?: 3) == 3
fun jsIsSealed(value: Any?): Boolean = (level(value) ?: 3) >= 2
fun jsIsExtensible(value: Any?): Boolean = (level(value) ?: 1) == 0

/** `Object.fromEntries(entries)`. */
fun <V> jsObjectFromEntries(entries: Iterable<Pair<String, V>>): JSRecord<V> {
    val record = JSRecord<V>()
    for ((k, v) in entries) record[k] = v
    return record
}

/** Null where code checked without strictNullChecks puts it in a slot Kotlin types non-null; reads of it fail as JavaScript's would. */
@Suppress("UNCHECKED_CAST")
fun <T> jsUncheckedNull(): T = null as T

/** A field declared without a value (Kotlin's `lateinit`) read by name before it is set: undefined, as script reads it. */
inline fun jsUnsetIsUndefined(read: () -> Any?): Any? = try { read() } catch (_: UninitializedPropertyAccessException) { null }

/** A class's name as JavaScript gives a constructor's: the library's error classes by their JavaScript names. */
fun jsConstructorName(c: Class<*>): String = when (c) {
    JSError::class.java -> "Error"
    JSTypeError::class.java -> "TypeError"
    JSRangeError::class.java -> "RangeError"
    JSSyntaxError::class.java -> "SyntaxError"
    JSReferenceError::class.java -> "ReferenceError"
    JSAggregateError::class.java -> "AggregateError"
    else -> c.simpleName
}
