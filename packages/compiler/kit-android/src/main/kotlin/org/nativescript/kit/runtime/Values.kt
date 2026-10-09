package org.nativescript.kit

// Values as translated TypeScript holds them: `any`/`unknown` is `Any?`, Kotlin's
// `null` is `undefined`, `jsNull` is `null`, numbers are `Double`, `void` is `Unit`,
// objects are classes compared by identity, functions are Kotlin function values.
// Plain JVM: the differential tests run this package on the host.

/** JavaScript `null`. `undefined` is Kotlin's `null`. */
object JSNull {
    override fun toString(): String = "null"
}

val jsNull: JSNull get() = JSNull

/**
 * An object whose properties dynamic code reaches by name (`o[key]`, JSON, `console.log`):
 * plain objects (`JSObject`) and the classes generated for TypeScript classes and interfaces.
 * A null `jsClassName` prints as a plain object (`{ a: 1 }`), otherwise as `Name { a: 1 }`.
 */
interface JSDynamic {
    fun jsGet(key: String): Any?
    fun jsSet(key: String, value: Any?)
    val jsKeys: List<String>
    val jsClassName: String?
}

/** A class with its own `toString()`, which JavaScript's string conversion calls. */
interface JSStringConvertible

/** A value as JavaScript sees it: `Unit` (a void result) is undefined. */
fun jsBox(value: Any?): Any? = if (value === Unit) null else value

/** Whether `value` is a function value. */
fun jsIsFunction(value: Any?): Boolean = value is Function<*> || value is JSFunction || value is JavaMethodRef

/** The numeric value of a JVM number a native API returned. */
fun jsNumeric(value: Any?): Double? = when (value) {
    is Double -> value
    is Int -> value.toDouble()
    is Float -> value.toDouble()
    is Long -> value.toDouble()
    is Short -> value.toDouble()
    is Byte -> value.toDouble()
    else -> null
}

/** `a < b` for strings: UTF-16 code unit order, which Kotlin's `compareTo` is. */
fun jsStringLess(a: String, b: String): Boolean = a < b

/** The array index a property key names (`"0"`…`"4294967294"`), if it names one. */
fun jsArrayIndex(key: String): Long? {
    val n = key.length
    if (n == 0 || n > 10) return null
    val first = key[0]
    if (first !in '0'..'9') return null
    if (first == '0') return if (n == 1) 0L else null
    var v = 0L
    for (c in key) {
        if (c !in '0'..'9') return null
        v = v * 10 + (c - '0')
    }
    return if (v < 4_294_967_295L) v else null
}

// Plain objects

/**
 * A plain JavaScript object. Own keys enumerate in JavaScript order: array-index keys
 * ascending, then the other keys in insertion order.
 */
class JSObject() : JSDynamic, JSSymbolKeyed, JSAccessorKeyed, JSReactiveConvertible {
    private val storage = HashMap<String, Any?>()
    private val indexKeys = ArrayList<Long>()
    private val namedKeys = ArrayList<String>()
    /** Properties that are accessors or not plain writable, enumerable, configurable data. */
    private val slots = HashMap<String, JSPropertySlot>()
    var extensible = true
        private set
    var jsTracker: JSTracker? = null

    /** Created without a prototype (`Object.create(null)`, a match's `groups`): inspect prints `[Object: null prototype]`. */
    var jsNullPrototype = false

    constructor(entries: List<Pair<String, Any?>>) : this() {
        for ((k, v) in entries) define(k, v)
    }

    constructor(vararg entries: Pair<String, Any?>) : this() {
        for ((k, v) in entries) define(k, v)
    }

    operator fun get(key: String): Any? {
        if (slots.isNotEmpty()) slots[key]?.get?.let { return it(this) }
        val tracker = jsTracker ?: return storage[key]
        tracker.track()
        return jsReactiveAny(storage[key])
    }

    /** `object[key]` read for `receiver`, which an accessor sees as `this` (an instance reading its prototype's). */
    fun get(key: String, receiver: Any?): Any? {
        if (slots.isNotEmpty()) slots[key]?.let { if (it.isAccessor) return it.get?.invoke(receiver) }
        return this[key]
    }

    /** The setter of an accessor property; it takes the receiver as `this`. */
    fun setter(key: String): ((Any?, Any?) -> Unit)? = slots[key]?.takeIf { it.isAccessor }?.set

    operator fun set(key: String, value: Any?) = put(key, value)

    /**
     * `object[key] = value` in strict code: a read-only property, a getter without a setter
     * or a new key on an object that is not extensible throws a TypeError.
     */
    fun put(key: String, value: Any?) {
        val slot = slots[key]
        if (slot != null) {
            if (slot.isAccessor) {
                val setter = slot.set ?: throw JSException(JSTypeError("Cannot set property $key of #<Object> which has only a getter"))
                return setter(this, value)
            }
            if (!slot.writable) throw JSException(JSTypeError("Cannot assign to read only property '$key' of object '#<Object>'"))
        } else if (!extensible && !storage.containsKey(key)) {
            throw JSException(JSTypeError("Cannot add property $key, object is not extensible"))
        }
        val tracker = jsTracker
        if (tracker == null) { define(key, value); return }
        val had = storage.containsKey(key)
        val old = storage[key]
        define(key, value)
        if (had && jsSameValue(old, value)) return
        tracker.trigger()
    }

    /** `Object.defineProperty(object, key, descriptor)`; attributes the descriptor leaves out are false for a new property. */
    fun defineProperty(key: String, d: JSPropertyDescriptor) {
        val exists = storage.containsKey(key)
        val slot = slots[key] ?: JSPropertySlot(enumerable = exists, writable = exists, configurable = exists)
        if (!exists && !extensible) throw JSException(JSTypeError("Cannot define property $key, object is not extensible"))
        if (exists && !slot.configurable) {
            val changes = d.get != null || d.set != null || d.configurable == true || (d.enumerable != null && d.enumerable != slot.enumerable) ||
                (!slot.writable && (d.writable == true || (d.hasValue && !jsSameValue(d.value, storage[key]))))
            if (changes) throw JSException(JSTypeError("Cannot redefine property: $key"))
        }
        if (d.get != null || d.set != null) {
            slot.get = d.get; slot.set = d.set; slot.isAccessor = true; slot.writable = false
        } else if (d.hasValue || d.writable != null) {
            if (slot.isAccessor) { slot.get = null; slot.set = null; slot.isAccessor = false }
        }
        d.enumerable?.let { slot.enumerable = it }
        d.writable?.let { slot.writable = it }
        d.configurable?.let { slot.configurable = it }
        define(key, if (slot.isAccessor) null else if (d.hasValue) d.value else storage[key])
        if (slot.isPlain) slots.remove(key) else slots[key] = slot
        jsTracker?.trigger()
    }

    /** `Object.getOwnPropertyDescriptor(object, key)`. */
    fun descriptor(key: String): JSObject? {
        if (!storage.containsKey(key)) return null
        val slot = slots[key] ?: JSPropertySlot()
        if (slot.isAccessor) {
            val g = slot.get
            val s = slot.set
            return JSObject(listOf(
                Pair("get", g?.let { { -> it(this) } }), Pair("set", s?.let { { v: Any? -> it(this, v) } }),
                Pair("enumerable", slot.enumerable), Pair("configurable", slot.configurable)))
        }
        return JSObject(listOf(Pair("value", storage[key]), Pair("writable", slot.writable), Pair("enumerable", slot.enumerable), Pair("configurable", slot.configurable)))
    }

    /** `Object.freeze`, `Object.seal`, `Object.preventExtensions`. */
    fun restrict(sealed: Boolean, frozen: Boolean) {
        extensible = false
        if (!sealed && !frozen) return
        for (key in indexKeys.map { it.toString() } + namedKeys) {
            val slot = slots[key] ?: JSPropertySlot()
            slot.configurable = false
            if (frozen && !slot.isAccessor) slot.writable = false
            slots[key] = slot
        }
    }

    val isSealed: Boolean get() = !extensible && storage.keys.all { !(slots[it] ?: JSPropertySlot()).configurable }
    val isFrozen: Boolean get() = !extensible && storage.keys.all { val s = slots[it] ?: JSPropertySlot(); !s.configurable && (s.isAccessor || !s.writable) }

    override fun jsAccessorKind(key: String): String? {
        val slot = slots[key] ?: return null
        if (!slot.isAccessor) return null
        return if (slot.get != null && slot.set != null) "Getter/Setter" else if (slot.get != null) "Getter" else "Setter"
    }

    /** `Object.getOwnPropertyNames(object)`: string keys, enumerable or not. */
    val ownPropertyNames: List<String> get() = indexKeys.map { it.toString() } + namedKeys.filter { !jsIsSymbolKey(it) }

    private fun define(key: String, value: Any?) {
        if (storage.containsKey(key)) { storage[key] = value; return }
        storage[key] = value
        val index = jsArrayIndex(key)
        if (index != null) {
            var low = 0
            var high = indexKeys.size
            while (low < high) {
                val mid = (low + high) / 2
                if (indexKeys[mid] < index) low = mid + 1 else high = mid
            }
            indexKeys.add(low, index)
        } else namedKeys.add(key)
    }

    /** `key in object` for own keys. */
    fun has(key: String): Boolean {
        jsTracker?.track()
        return storage.containsKey(key)
    }

    /** `delete object[key]`. */
    fun delete(key: String): Boolean {
        slots[key]?.let { if (!it.configurable) return false }
        slots.remove(key)
        if (!storage.containsKey(key)) return true
        storage.remove(key)
        val index = jsArrayIndex(key)
        if (index != null) indexKeys.remove(index) else namedKeys.remove(key)
        jsTracker?.trigger()
        return true
    }

    val keys: List<String>
        get() {
            jsTracker?.track()
            val all = indexKeys.map { it.toString() } + namedKeys.filter { !jsIsSymbolKey(it) }
            return if (slots.isEmpty()) all else all.filter { slots[it]?.enumerable ?: true }
        }

    override val jsSymbolKeys: List<String>
        get() {
            jsTracker?.track()
            return namedKeys.filter { jsIsSymbolKey(it) }
        }

    override fun jsGet(key: String): Any? = this[key]
    override fun jsSet(key: String, value: Any?) { this[key] = value }
    override val jsKeys: List<String> get() = keys
    override val jsClassName: String? get() = null

    override fun jsMakeReactive() {
        if (jsTracker == null) jsTracker = JSTracker()
    }

    override fun toString(): String = jsInspect(this)
}

// Property access

/** `object?.key`: undefined when the object is undefined or null. */
fun jsGetOptional(target: Any?, key: String): Any? = if (target == null || target === JSNull) null else jsGet(target, key)

/** `object[key]` / `object.key` on a dynamic value. Reading from undefined or null throws a TypeError. */
fun jsGet(target: Any?, key: String): Any? = when (target) {
    null -> throw JSException(JSTypeError("Cannot read properties of undefined (reading '$key')"))
    JSNull -> throw JSException(JSTypeError("Cannot read properties of null (reading '$key')"))
    // What every object inherits (`{}.toString`), where the object has nothing of that name.
    is JSObject -> target.jsGet(key) ?: if (!target.has(key) && JSPrototypes.objectPrototype.has(key)) JSPrototypes.objectPrototype[key] else null
    is JSDynamic -> target.jsGet(key)
    is JSArray<*> -> when {
        key == "length" -> target.size.toDouble()
        else -> jsArrayIndex(key)?.let { if (it < target.size) target.storage[it.toInt()] else null } ?: jsArrayMethod(target, key)
    }
    is String -> when {
        key == "length" -> target.length.toDouble()
        else -> jsArrayIndex(key)?.let { if (it < target.length) target[it.toInt()].toString() else null } ?: jsStringMethod(target, key)
    }
    is Pair<*, *> -> when (key) { "0" -> target.first; "1" -> target.second; "length" -> 2.0; else -> null }
    is Triple<*, *, *> -> when (key) { "0" -> target.first; "1" -> target.second; "2" -> target.third; "length" -> 3.0; else -> null }
    is JSMap<*, *> -> if (key == "size") target.size else null
    is JSSet<*> -> if (key == "size") target.size else null
    is Double, is Boolean, is Function<*>, is JSFunction, is JSSymbol, is JSBigInt, Unit -> null
    is Class<*> -> jsClassGet(target, key)
    else -> jsJavaGet(target, key)
}

/** `object[key] = value` on a dynamic value. Writing to undefined or null throws a TypeError. */
fun jsSet(target: Any?, key: String, value: Any?) {
    when (target) {
        null -> throw JSException(JSTypeError("Cannot set properties of undefined (setting '$key')"))
        JSNull -> throw JSException(JSTypeError("Cannot set properties of null (setting '$key')"))
        is JSObject -> target.put(key, value)
        is JSDynamic -> {
            val level = jsRestriction(target)
            if (level > 0) {
                if (key !in target.jsKeys) throw JSException(JSTypeError("Cannot add property $key, object is not extensible"))
                if (level == 3) throw JSException(JSTypeError("Cannot assign to read only property '$key' of object '#<Object>'"))
            }
            target.jsSet(key, value)
        }
        is JSArray<*> -> {
            @Suppress("UNCHECKED_CAST") val array = target as JSArray<Any?>
            if (key == "length") {
                val length = jsToNumber(value)
                if (length < 0 || length > 4_294_967_295.0 || length != Math.floor(length)) throw JSException(JSRangeError("Invalid array length"))
                array.setLength(length.toInt())
            } else jsArrayIndex(key)?.let { array.setAt(it.toInt(), value) }
        }
        is String, is Double, is Boolean, is Function<*>, is JSFunction, is JSSymbol, is JSBigInt, Unit -> {}
        else -> jsJavaSet(target, key, value)
    }
}

/** Calls a function stored in a dynamic value with JavaScript's argument rules. Anything else throws a TypeError. */
@Suppress("UNCHECKED_CAST")
fun jsCall(function: Any?, vararg args: Any?): Any? {
    val a = { i: Int -> if (i < args.size) args[i] else null }
    val result = when (function) {
        is Function0<*> -> (function as () -> Any?)()
        is Function1<*, *> -> (function as (Any?) -> Any?)(a(0))
        is Function2<*, *, *> -> (function as (Any?, Any?) -> Any?)(a(0), a(1))
        is Function3<*, *, *, *> -> (function as (Any?, Any?, Any?) -> Any?)(a(0), a(1), a(2))
        is Function4<*, *, *, *, *> -> (function as (Any?, Any?, Any?, Any?) -> Any?)(a(0), a(1), a(2), a(3))
        is Function5<*, *, *, *, *, *> -> (function as (Any?, Any?, Any?, Any?, Any?) -> Any?)(a(0), a(1), a(2), a(3), a(4))
        is Function6<*, *, *, *, *, *, *> -> (function as (Any?, Any?, Any?, Any?, Any?, Any?) -> Any?)(a(0), a(1), a(2), a(3), a(4), a(5))
        is Function7<*, *, *, *, *, *, *, *> -> (function as (Any?, Any?, Any?, Any?, Any?, Any?, Any?) -> Any?)(a(0), a(1), a(2), a(3), a(4), a(5), a(6))
        is JSFunction -> function.body(args.toList())
        is JSMethod -> function.call(null, args)
        is JavaMethodRef -> function.call(args.toList())
        else -> throw JSException(JSTypeError("${jsInspect(function)} is not a function"))
    }
    return jsBox(result)
}

/** A function read where it may be missing (a record's value): calling undefined throws a TypeError. */
fun <T : Function<*>> jsCallable(function: T?): T = function ?: throw JSException(JSTypeError("undefined is not a function"))

/** `f?.(args)` on an untyped value: undefined when `f` is undefined or null. */
fun jsCallOptional(function: Any?, vararg args: Any?): Any? = if (jsIsNullish(function)) null else jsCall(function, *args)

/** `Object.keys` for what translated code holds: a typed object, an untyped one, an array. */
fun jsKeysOf(value: Any?): List<String> = when (value) {
    is String -> value.indices.map { it.toString() }
    is JSDynamic -> value.jsKeys
    is JSArray<*> -> (0 until value.size.toInt()).map { it.toString() }
    is String -> value.indices.map { it.toString() }
    else -> emptyList()
}

fun jsObjectKeys(value: Any?): JSArray<String> = JSArray(jsKeysOf(value))

fun jsObjectValues(value: Any?): JSArray<Any?> = when (value) {
    is JSDynamic -> JSArray(value.jsKeys.map { value.jsGet(it) })
    is JSArray<*> -> JSArray(value.storage.toList())
    else -> JSArray()
}

fun jsObjectEntries(value: Any?): JSArray<Pair<String, Any?>> = when (value) {
    is JSDynamic -> JSArray(value.jsKeys.map { Pair(it, value.jsGet(it)) })
    is JSArray<*> -> JSArray(value.storage.mapIndexed { i, v -> Pair(i.toString(), v) })
    else -> JSArray()
}

/** `Object.assign(target, ...sources)`. */
fun <T : JSDynamic> jsObjectAssign(target: T, vararg sources: Any?): T {
    for (source in sources) {
        when (source) {
            is JSDynamic -> for (key in source.jsKeys) target.jsSet(key, source.jsGet(key))
            is JSArray<*> -> source.storage.forEachIndexed { i, v -> target.jsSet(i.toString(), v) }
            else -> {}
        }
    }
    return target
}

/** `key in object`. */
fun jsHasKey(target: Any?, key: String): Boolean = when (target) {
    is JSObject -> target.has(key)
    is JSExpando -> key in target.jsKeys || jsExpandoHas(target, key)
    is JSDynamic -> if (jsIsSymbolKey(key)) (target as? JSSymbolKeyed)?.jsSymbolKeys?.contains(key) ?: false else key in target.jsKeys
    is JSArray<*> -> key == "length" || (jsArrayIndex(key)?.let { it < target.size } ?: false)
    else -> false
}

/** A member of an untyped object, or undefined; reading a typed object from JSON never throws. */
fun jsField(target: Any?, key: String): Any? = if (target == null || target === JSNull) null else jsGet(target, key)

// Operators

/** `typeof value`. */
fun jsTypeof(value: Any?): String = when (value) {
    null, Unit -> "undefined"
    is String -> "string"
    is Boolean -> "boolean"
    JSNull -> "object"
    is Function<*>, is JSFunction, is JavaMethodRef -> "function"
    is JSSymbol -> "symbol"
    is JSBigInt -> "bigint"
    else -> if (jsNumeric(value) != null) "number" else "object"
}

/** `value === undefined || value === null`. */
fun jsIsNullish(value: Any?): Boolean = value == null || value === JSNull || value === Unit

/** JavaScript truthiness: false for undefined, null, false, 0, -0, NaN and "". */
fun jsTruthy(value: Any?): Boolean = when (value) {
    null, Unit, JSNull -> false
    is Boolean -> value
    is Double -> value != 0.0 && !value.isNaN()
    is String -> value.isNotEmpty()
    is JSBigInt -> !value.isZero
    else -> jsNumeric(value)?.let { it != 0.0 && !it.isNaN() } ?: true
}

/** `a === b`: numbers by value (NaN unequal to itself, -0 equal to +0), strings by code units, objects by identity. */
fun jsStrictEquals(a: Any?, b: Any?): Boolean {
    val x = jsBox(a)
    val y = jsBox(b)
    if (x == null || y == null) return x == null && y == null
    if (x is String && y is String) return x == y
    if (x is Boolean && y is Boolean) return x == y
    if (x is JSBigInt || y is JSBigInt) return x == y
    val m = jsNumeric(x)
    val n = jsNumeric(y)
    if (m != null || n != null) return m != null && n != null && m == n
    return x === y
}

/** SameValueZero (`includes`, `Map` and `Set` keys): `===` except NaN equals NaN. */
fun jsSameValueZero(a: Any?, b: Any?): Boolean {
    val m = jsNumeric(a)
    val n = jsNumeric(b)
    if (m != null && n != null && m.isNaN() && n.isNaN()) return true
    return jsStrictEquals(a, b)
}

/** SameValue (`Object.is`): `===` except NaN equals NaN and -0 differs from +0. */
fun jsSameValue(a: Any?, b: Any?): Boolean {
    val m = jsNumeric(a)
    val n = jsNumeric(b)
    if (m != null && n != null) {
        if (m.isNaN() && n.isNaN()) return true
        return m == n && (1.0 / m).sign == (1.0 / n).sign
    }
    return jsStrictEquals(a, b)
}

private val Double.sign: Double get() = Math.signum(this)

/** `a == b`: null equals undefined; primitives compare after conversion; an object against a primitive through its string form. */
fun jsLooseEquals(a: Any?, b: Any?): Boolean {
    val x = jsBox(a)
    val y = jsBox(b)
    val xNullish = x == null || x === JSNull
    val yNullish = y == null || y === JSNull
    if (xNullish || yNullish) return xNullish && yNullish
    x!!; y!!
    if (x is JSBigInt) return jsBigIntLooseEquals(x, y)
    if (y is JSBigInt) return jsBigIntLooseEquals(y, x)
    val m = jsNumeric(x)
    val n = jsNumeric(y)
    if (m != null && n != null) return m == n
    if (x is String && y is String) return x == y
    if (x is Boolean && y is Boolean) return x == y
    if (x is Boolean) return jsLooseEquals(jsToNumber(x), y)
    if (y is Boolean) return jsLooseEquals(x, jsToNumber(y))
    if (m != null && y is String) return m == jsNumberFromString(y)
    if (x is String && n != null) return jsNumberFromString(x) == n
    val xPrimitive = x is String || m != null
    val yPrimitive = y is String || n != null
    if (!xPrimitive && yPrimitive) return jsLooseEquals(jsToPrimitive(x), y)
    if (xPrimitive && !yPrimitive) return jsLooseEquals(x, jsToPrimitive(y))
    return jsStrictEquals(x, y)
}

/** ToPrimitive with the default hint: a date or object becomes its string form. */
fun jsToPrimitive(value: Any?): Any? = when (val v = jsBox(value)) {
    null, is String, is Boolean, JSNull, is JSSymbol, is JSBigInt -> v
    is JSToPrimitive -> jsUserPrimitive(v, "default")
    else -> jsNumeric(v) ?: jsToString(v)
}

/** A `+` operand beside a string: ToString(ToPrimitive(value, default)). */
fun jsToStringDefault(value: Any?): String = jsToString(jsToPrimitive(value))

/** `Number(value)` / unary `+`. */
fun jsToNumber(value: Any?): Double = when (val v = jsBox(value)) {
    null -> Double.NaN
    is Double -> v
    is String -> jsNumberFromString(v)
    is Boolean -> if (v) 1.0 else 0.0
    JSNull -> 0.0
    is JSDate -> v.valueOf()
    is JSBigInt -> v.toDouble()
    is Function<*>, is JSSymbol -> Double.NaN
    is JSToPrimitive -> jsToNumber(jsUserPrimitive(v, "number"))
    else -> jsNumeric(v) ?: jsNumberFromString(jsToString(v))
}

internal val jsJoinGuard = ArrayList<Any>()

/** `String(value)`: arrays join with ",", plain objects are "[object Object]", errors "Name: message". */
fun jsToString(value: Any?): String = when (val v = jsBox(value)) {
    null -> "undefined"
    is String -> v
    is Double -> jsNumberToString(v)
    is Boolean -> if (v) "true" else "false"
    JSNull -> "null"
    is JSToPrimitive -> jsToString(jsUserPrimitive(v, "string"))
    is JSStringConvertible -> v.toString()
    is JSSymbol -> v.toString()
    is JSBigInt -> v.toString()
    is JSToStringTag -> "[object ${v.jsToStringTag}]"
    is JSError -> v.jsErrorString
    is JSArray<*> -> jsJoin(v.storage, ",", v)
    is Pair<*, *> -> jsJoin(listOf(v.first, v.second), ",", v)
    is Triple<*, *, *> -> jsJoin(listOf(v.first, v.second, v.third), ",", v)
    is JSMap<*, *> -> "[object Map]"
    is JSSet<*> -> "[object Set]"
    is JSThenable -> "[object Promise]"
    is Function<*> -> "function () { [native code] }"
    else -> jsNumeric(v)?.let { jsNumberToString(it) } ?: if (v is JSDynamic) "[object Object]" else v.toString()
}

internal fun jsJoin(elements: List<Any?>, separator: String, owner: Any): String {
    if (jsJoinGuard.any { it === owner }) return ""
    jsJoinGuard.add(owner)
    try {
        val out = StringBuilder()
        elements.forEachIndexed { i, e ->
            if (i > 0) out.append(separator)
            if (e != null && e !== JSNull && e !== Unit) out.append(jsToString(e))
        }
        return out.toString()
    } finally {
        jsJoinGuard.removeAt(jsJoinGuard.size - 1)
    }
}

/** `a + b` for untyped operands: concatenation when either side is (or converts to) a string, else addition. */
fun jsAdd(a: Any?, b: Any?): Any? {
    val x = jsToPrimitive(a)
    val y = jsToPrimitive(b)
    if (x is String || y is String) return jsToString(x) + jsToString(y)
    return jsToNumber(x) + jsToNumber(y)
}

/** `a ?? b` for an untyped value: null and undefined both give way. */
inline fun jsNullishCoalesce(a: Any?, b: () -> Any?): Any? = if (jsIsNullish(a)) b() else a

/** A number as JavaScript prints it: `4`, not `4.0`. */
fun js(value: Double): String = jsNumberToString(value)
fun js(value: Int): String = value.toString()
fun js(value: Boolean): String = if (value) "true" else "false"
fun js(value: String): String = value

/** `Object.is` for a signal's writes: objects by identity. */
fun jsSame(a: Any?, b: Any?): Boolean = jsSameValue(a, b)

/**
 * The key order of an object literal with spreads (`{ ...a, b: 1 }`): each spread source's keys as it holds
 * them, then the literal's own, a key keeping its first position; integer keys first; only the `fields` it has.
 */
fun jsLiteralKeyOrder(parts: List<List<String>>, fields: List<String>): List<String> {
    val keys = LinkedHashSet<String>()
    for (part in parts) for (key in part) if (key in fields) keys.add(key)
    val index = { k: String -> k.length <= 10 && (k == "0" || (k[0] != '0' && k.all(Char::isDigit))) && k.toLong() < 4294967295L }
    return keys.filter(index).sortedBy { it.toLong() } + keys.filter { !index(it) }
}

/** `globalThis`, with the constructors NativeScript's runtime puts there. */
val jsGlobalThis: JSObject = JSObject().also { it["DOMException"] = JSDOMException::class.java }
