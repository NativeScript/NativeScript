package org.nativescript.kit

import java.util.IdentityHashMap

/** What a lookup found, undefined included; a null `JSFound?` is a key nothing has. */
class JSFound(val value: Any?)

/**
 * `Cls.prototype` as script reaches it, for classes compiled in the kit generated from
 * core: the accessors and values `Object.defineProperty(Cls.prototype, …)` and
 * `Cls.prototype.x = v` put there, which instances of the class and of the classes
 * extending it read and write, and the class's own accessors. Each class's prototype
 * is one object, chained to its superclass's and, at the root, to `Object.prototype`.
 */
object JSPrototypes {
    private val table = HashMap<Class<*>, JSObject>()
    /** The class of each prototype object. */
    private val owners = IdentityHashMap<JSObject, Class<*>>()
    /** Accessors a class declares, put on its prototype when the prototype is first made. */
    private val declared = HashMap<Class<*>, MutableList<Pair<String, JSPropertyDescriptor>>>()
    private val builtins = HashMap<String, JSObject>()
    /** A class's static members by name, each read when script reads it (`Handler.initWithOwner`). */
    private val statics = HashMap<Class<*>, HashMap<String, () -> Any?>>()

    /** The static methods and properties a class declares, for script that holds the class as a value. */
    fun declareStatics(cls: Class<*>, members: List<Pair<String, () -> Any?>>) {
        val own = statics.getOrPut(cls) { HashMap() }
        for ((key, read) in members) own[key] = read
    }

    /** A static member of a class or of a class it extends, as JavaScript's classes inherit statics; null where none has it. */
    fun staticMember(cls: Class<*>, key: String): JSFound? {
        var c: Class<*>? = cls
        while (c != null) {
            statics[c]?.get(key)?.let { return JSFound(it()) }
            c = c.superclass
        }
        return null
    }

    /** `Object.prototype`, with the methods translated code calls on any object. */
    val objectPrototype: JSObject = JSObject().also { p ->
        val key = { a: Array<out Any?> -> arg0(a).let { (jsBox(it) as? JSSymbol)?.key ?: jsToString(it) } }
        p["hasOwnProperty"] = JSMethod { self, a -> jsHasOwn(self, key(a)) }
        p["propertyIsEnumerable"] = JSMethod { self, a -> val k = key(a); jsHasOwn(self, k) && k in jsKeysOf(jsBox(self)) }
        p["isPrototypeOf"] = JSMethod { self, a ->
            val target = jsBox(self)
            var current = try { jsGetPrototypeOf(arg0(a)) } catch (_: JSException) { null }
            while (true) {
                val c = jsBox(current)
                if (c == null || c === JSNull) break
                if (c is JSObject && c === target) return@JSMethod true
                current = try { jsGetPrototypeOf(c) } catch (_: JSException) { null }
            }
            false
        }
        p["toString"] = JSMethod { self, _ -> jsObjectToString(self) }
        p["valueOf"] = JSMethod { self, _ -> self }
        for (k in listOf("hasOwnProperty", "propertyIsEnumerable", "isPrototypeOf", "toString", "valueOf")) p.defineProperty(k, JSPropertyDescriptor(enumerable = false))
    }

    private fun arg0(a: Array<out Any?>): Any? = if (a.isEmpty()) null else a[0]

    fun of(cls: Class<*>): JSObject {
        table[cls]?.let { return it }
        val p = JSObject()
        table[cls] = p
        owners[p] = cls
        declared[cls]?.forEach { (key, d) -> try { p.defineProperty(key, d) } catch (_: JSException) {} }
        return p
    }

    /** The accessors a class declares (`get text()`, `set text(v)`): its prototype's own properties. */
    fun declare(cls: Class<*>, key: String, get: ((Any?) -> Any?)?, set: ((Any?, Any?) -> Unit)?) {
        val d = JSPropertyDescriptor(get = get, set = set, enumerable = false, configurable = true)
        declared.getOrPut(cls) { ArrayList() }.add(Pair(key, d))
        table[cls]?.let { try { it.defineProperty(key, d) } catch (_: JSException) {} }
    }

    /** The prototype a built-in kind of value has (`Array.prototype`), its own object. */
    fun builtin(name: String): JSObject = builtins.getOrPut(name) { JSObject() }

    /** `Object.getPrototypeOf` of a plain object: a class's prototype leads to its superclass's. */
    fun prototypeOf(o: JSObject): Any? {
        if (o === objectPrototype || o.jsNullPrototype) return jsNull
        val superclass = owners[o]?.superclass
        if (superclass != null && superclass != Any::class.java) return of(superclass)
        return objectPrototype
    }

    /** The nearest prototype in a class's chain that has the key. */
    fun holder(cls: Class<*>, key: String): JSObject? {
        if (table.isEmpty() && declared.isEmpty()) return null
        var c: Class<*>? = cls
        while (c != null) {
            val p = table[c] ?: if (declared.containsKey(c)) of(c) else null
            if (p != null && p.has(key)) return p
            c = c.superclass
        }
        return null
    }

    /** What an instance without a value of its own reads for a key: its prototype chain's. */
    fun value(cls: Class<*>, key: String, receiver: Any?): Any? = holder(cls, key)?.get(key, receiver)
}

/** `Cls.prototype` and `Cls.member` of a class held as a value; else the Java class's own statics. */
internal fun jsClassGet(cls: Class<*>, key: String): Any? {
    if (key == "prototype") return JSPrototypes.of(cls)
    JSPrototypes.staticMember(cls, key)?.let { return it.value }
    // A class's `name` is its own, as script declared it, before any static Java member.
    if (key == "name") return cls.simpleName
    // A nested class (`android.view.View.OnClickListener`).
    cls.classes.firstOrNull { it.simpleName == key }?.let { return it }
    return jsJavaGet(cls, key)
}

/** `Object.getPrototypeOf(value)`. */
fun jsGetPrototypeOf(value: Any?): Any? = when (val v = jsBox(value)) {
    null, JSNull -> throw JSException(JSTypeError("Cannot convert undefined or null to object"))
    is JSObject -> JSPrototypes.prototypeOf(v)
    is JSRecord<*> -> JSPrototypes.prototypeOf(v.obj)
    is Class<*> -> JSPrototypes.builtin("Function")
    is JSArray<*>, is Pair<*, *>, is Triple<*, *, *> -> JSPrototypes.builtin("Array")
    is String -> JSPrototypes.builtin("String")
    is Boolean -> JSPrototypes.builtin("Boolean")
    is JSMap<*, *> -> JSPrototypes.builtin("Map")
    is JSSet<*> -> JSPrototypes.builtin("Set")
    is JSSymbol -> JSPrototypes.builtin("Symbol")
    is JSBigInt -> JSPrototypes.builtin("BigInt")
    else -> when {
        jsNumeric(v) != null -> JSPrototypes.builtin("Number")
        jsIsFunction(v) -> JSPrototypes.builtin("Function")
        else -> JSPrototypes.of(v.javaClass)
    }
}

/** `Object.prototype.hasOwnProperty.call(object, key)`. */
fun jsHasOwn(target: Any?, key: String): Boolean = when (val v = jsBox(target)) {
    is JSObject -> v.has(key)
    is JSExpando -> v.jsExpando?.has(key) == true || key in v.jsKeys
    is JSDynamic -> key in v.jsKeys
    is JSArray<*> -> key == "length" || (jsArrayIndex(key)?.let { it < v.storage.size } ?: false)
    is String -> key == "length" || (jsArrayIndex(key)?.let { it < v.length } ?: false)
    else -> false
}

/** `@decorator class Cls {}`: each decorator, the last first, is called with what the ones before it gave. */
fun jsDecorate(cls: Class<*>, decorators: List<Any?>) {
    var target: Any? = cls
    for (d in decorators.asReversed()) {
        val result = jsCall(d, target)
        if (jsTruthy(result)) target = result
    }
    if (jsBox(target) !== cls) throw JSException(JSTypeError("A class decorator that replaces the class is not supported in a compiled app"))
}

/**
 * An instance of a class generated from core: the properties script gives it beyond the
 * fields it declares (`this[key] = v`, symbol-keyed ones included), its methods named by
 * symbols (`[prop.setNative](value)`), and what its class's prototype defines.
 */
interface JSExpando : JSDynamic, JSSymbolKeyed, JSDeletable {
    var jsExpando: JSObject?
    /** The method a class declares under the symbol whose key this is; the method takes its receiver as `this`. */
    fun jsSymbolMethod(key: String): JSMethod? = null
    override val jsSymbolKeys: List<String> get() = jsExpando?.jsSymbolKeys ?: emptyList()
    override fun jsDelete(key: String): Boolean = jsExpando?.delete(key) ?: true
}

/** A key a class does not declare as a field: a symbol-named method, the instance's own property, or its prototype's. */
fun jsExpandoGet(obj: JSExpando, key: String): Any? {
    if (jsIsSymbolKey(key)) obj.jsSymbolMethod(key)?.let { return it }
    val own = obj.jsExpando
    if (own != null && own.has(key)) return own.get(key, obj)
    return JSPrototypes.value(obj.javaClass, key, obj)
}

fun jsExpandoSet(obj: JSExpando, key: String, value: Any?) {
    val own = obj.jsExpando
    if (own != null && own.has(key)) {
        val setter = own.setter(key)
        if (setter != null) setter(obj, value) else own.put(key, value)
        return
    }
    JSPrototypes.holder(obj.javaClass, key)?.setter(key)?.let { return it(obj, value) }
    (obj.jsExpando ?: JSObject().also { obj.jsExpando = it })[key] = value
}

/** `key in object` for what the object does not declare as a field. */
fun jsExpandoHas(obj: JSExpando, key: String): Boolean =
    obj.jsExpando?.has(key) == true || (jsIsSymbolKey(key) && obj.jsSymbolMethod(key) != null) || JSPrototypes.holder(obj.javaClass, key) != null

/** A property an object was given at run time (`Object.defineProperty(this, key, …)`), which hides its class's member of that name. */
fun jsOwnProperty(target: Any?, key: String): JSFound? {
    val own = (jsBox(target) as? JSExpando)?.jsExpando ?: return null
    return if (own.has(key)) JSFound(own.get(key, target)) else null
}

/** A function value called as a method of `receiver`; `optional` is `?.()`, which an undefined or null function skips. */
fun jsCallValue(function: Any?, receiver: Any?, optional: Boolean, vararg args: Any?): Any? {
    if (optional && jsIsNullish(function)) return null
    val f = jsBox(function)
    if (f is JSMethod) return jsBox(f.call(receiver, args))
    return jsCall(f, *args)
}

/** A method found on a prototype (`super[key]`), called with `receiver` as `this`; a TypeError where there is none. */
fun jsCallFound(method: JSMethod?, receiver: Any?, vararg args: Any?): Any? {
    if (method == null) throw JSException(JSTypeError("method is not a function"))
    return jsBox(method.call(receiver, args))
}
