package org.nativescript.kit

import java.util.concurrent.ConcurrentHashMap
import java.lang.reflect.Array as JavaArray
import java.lang.reflect.Field
import java.lang.reflect.Method
import java.lang.reflect.Modifier

// JavaScript's object operations on values translated code holds untyped:
// what plugins written against loose types do with options bags, event
// payloads and the views they decorate, and with Java objects they hold as
// `any`, whose fields and methods NativeScript's runtime reaches by name.

/** A function script holds untyped: called with whatever arguments it is given. */
class JSFunction(val body: (List<Any?>) -> Any?) {
    /** `fn.length`: the parameters before the first optional one, as script declares them. */
    var length = 0
    operator fun invoke(vararg args: Any?): Any? = body(args.toList())
}

fun jsFunction(body: (List<Any?>) -> Any?): JSFunction = JSFunction(body)

fun jsFunction(length: Int, body: (List<Any?>) -> Any?): JSFunction = JSFunction(body).also { it.length = length }

/** A value where a collection's element type goes, null included, as script stores it (the element type is erased). */
@Suppress("UNCHECKED_CAST")
fun <T> jsUnchecked(value: Any?): T = value as T

/**
 * `value as T` where T has type arguments or is a function type: the class is checked, as Kotlin's `as` checks it;
 * the type arguments, which neither script nor the JVM keeps, are the TypeScript declaration's.
 */
inline fun <reified T> jsAs(value: Any?): T = value as T

/** `value is T` where the value's own type already decides it in Kotlin's eyes: an unset value (null) still fails it. */
inline fun <reified T> jsIs(value: Any?): Boolean = value is T

/** As jsAs, null where `value` is not of T's class. */
inline fun <reified T> jsAsOrNull(value: Any?): T? = value as? T

/** An untyped value used as a property key: a symbol's own key, anything else as its string. */
fun jsPropertyKey(value: Any?): String = if (value is JSSymbol) value.key else jsToString(value)

/** `value instanceof type` of a class held in a value (a Java class an alias names, a class passed in). */
fun jsInstanceOf(value: Any?, type: Any?): Boolean = type is Class<*> && value != null && value !== JSNull && type.isInstance(jsBox(value))

/**
 * A function value taken where another signature is wanted (`() -> Unit` passed as an `(EventData) -> Unit`
 * listener): equal to every adaptation of the same function, as script compares the function itself
 * (`off(name, handler)` removing what `on(name, handler)` added).
 */
abstract class JSAdapted(val original: Any) {
    override fun equals(other: Any?): Boolean = other is JSAdapted && other.javaClass == javaClass && other.original == original
    override fun hashCode(): Int = original.hashCode()
}
class JSAdapted0<R>(original: Any, private val body: () -> R) : JSAdapted(original), () -> R { override fun invoke(): R = body() }
class JSAdapted1<A, R>(original: Any, private val body: (A) -> R) : JSAdapted(original), (A) -> R { override fun invoke(a: A): R = body(a) }
class JSAdapted2<A, B, R>(original: Any, private val body: (A, B) -> R) : JSAdapted(original), (A, B) -> R { override fun invoke(a: A, b: B): R = body(a, b) }
class JSAdapted3<A, B, C, R>(original: Any, private val body: (A, B, C) -> R) : JSAdapted(original), (A, B, C) -> R { override fun invoke(a: A, b: B, c: C): R = body(a, b, c) }
class JSAdapted4<A, B, C, D, R>(original: Any, private val body: (A, B, C, D) -> R) : JSAdapted(original), (A, B, C, D) -> R { override fun invoke(a: A, b: B, c: C, d: D): R = body(a, b, c, d) }

fun <R> jsAdapt0(original: Any, body: () -> R): () -> R = JSAdapted0(original, body)
fun <A, R> jsAdapt1(original: Any, body: (A) -> R): (A) -> R = JSAdapted1(original, body)
fun <A, B, R> jsAdapt2(original: Any, body: (A, B) -> R): (A, B) -> R = JSAdapted2(original, body)
fun <A, B, C, R> jsAdapt3(original: Any, body: (A, B, C) -> R): (A, B, C) -> R = JSAdapted3(original, body)
fun <A, B, C, D, R> jsAdapt4(original: Any, body: (A, B, C, D) -> R): (A, B, C, D) -> R = JSAdapted4(original, body)

// A function value held untyped, as the Kotlin function type its TypeScript declaration gives. A Kotlin function's
// parameter and result types are erased: the declaration is the contract, as it is in script.
@Suppress("UNCHECKED_CAST")
fun <R> jsFunction0(f: Any?): () -> R = (f as? Function0<Any?> ?: { jsCall(f) }) as () -> R
@Suppress("UNCHECKED_CAST")
fun <A, R> jsFunction1(f: Any?): (A) -> R = (f as? Function1<Any?, Any?> ?: { a: Any? -> jsCall(f, a) }) as (A) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, R> jsFunction2(f: Any?): (A, B) -> R = (f as? Function2<Any?, Any?, Any?> ?: { a: Any?, b: Any? -> jsCall(f, a, b) }) as (A, B) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, C, R> jsFunction3(f: Any?): (A, B, C) -> R =
    (f as? Function3<Any?, Any?, Any?, Any?> ?: { a: Any?, b: Any?, c: Any? -> jsCall(f, a, b, c) }) as (A, B, C) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, C, D, R> jsFunction4(f: Any?): (A, B, C, D) -> R =
    (f as? Function4<Any?, Any?, Any?, Any?, Any?> ?: { a: Any?, b: Any?, c: Any?, d: Any? -> jsCall(f, a, b, c, d) }) as (A, B, C, D) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, C, D, E, R> jsFunction5(f: Any?): (A, B, C, D, E) -> R =
    (f as? Function5<Any?, Any?, Any?, Any?, Any?, Any?> ?: { a: Any?, b: Any?, c: Any?, d: Any?, e: Any? -> jsCall(f, a, b, c, d, e) }) as (A, B, C, D, E) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, C, D, E, F, R> jsFunction6(f: Any?): (A, B, C, D, E, F) -> R =
    (f as? Function6<Any?, Any?, Any?, Any?, Any?, Any?, Any?> ?: { a: Any?, b: Any?, c: Any?, d: Any?, e: Any?, g: Any? -> jsCall(f, a, b, c, d, e, g) }) as (A, B, C, D, E, F) -> R
@Suppress("UNCHECKED_CAST")
fun <A, B, C, D, E, F, G, R> jsFunction7(f: Any?): (A, B, C, D, E, F, G) -> R =
    (f as? Function7<Any?, Any?, Any?, Any?, Any?, Any?, Any?, Any?> ?: { a: Any?, b: Any?, c: Any?, d: Any?, e: Any?, g: Any?, h: Any? -> jsCall(f, a, b, c, d, e, g, h) }) as (A, B, C, D, E, F, G) -> R

/** `value` read by `read`, or null when it is undefined or null. */
inline fun <T> jsUnlessNullish(value: Any?, read: (Any?) -> T): T? = if (jsIsNullish(value)) null else read(value)

/** A function value held untyped, as a Kotlin function taking its `this` first: a JSMethod gets it as its receiver. */
fun jsThisFunction(f: Any?, arity: Int): Any = if (f !is JSMethod) when (arity) {
    1 -> jsFunction1<Any?, Any?>(f)
    2 -> jsFunction2<Any?, Any?, Any?>(f)
    3 -> jsFunction3<Any?, Any?, Any?, Any?>(f)
    4 -> jsFunction4<Any?, Any?, Any?, Any?, Any?>(f)
    else -> jsFunction5<Any?, Any?, Any?, Any?, Any?, Any?>(f)
} else when (arity) {
    1 -> { a: Any? -> f.call(a, arrayOf()) }
    2 -> { a: Any?, b: Any? -> f.call(a, arrayOf(b)) }
    3 -> { a: Any?, b: Any?, c: Any? -> f.call(a, arrayOf(b, c)) }
    4 -> { a: Any?, b: Any?, c: Any?, d: Any? -> f.call(a, arrayOf(b, c, d)) }
    else -> { a: Any?, b: Any?, c: Any?, d: Any?, e: Any? -> f.call(a, arrayOf(b, c, d, e)) }
}

/** Argument `index` of a dynamic call; a missing one is undefined. */
fun jsArg(args: List<Any?>, index: Int): Any? = args.getOrNull(index)

/** An object that can lose an own property (`delete o.x`). */
interface JSDeletable {
    fun jsDelete(key: String): Boolean
}

/** `Object.assign(target, ...sources)` onto any value: each source's own enumerable keys written in order. */
fun jsAssign(target: Any?, vararg sources: Any?): Any? {
    for (source in sources) {
        when (source) {
            is JSDynamic -> for (key in source.jsKeys) jsSet(target, key, source.jsGet(key))
            is JSArray<*> -> source.storage.forEachIndexed { i, v -> jsSet(target, i.toString(), v) }
            else -> {}
        }
    }
    return target
}

/** `unescape(text)`: `%XX` and `%uXXXX` sequences as the characters they name. */
fun jsUnescape(text: String): String {
    val out = StringBuilder()
    var i = 0
    while (i < text.length) {
        val c = text[i]
        if (c == '%') {
            if (i + 6 <= text.length && text[i + 1] == 'u') {
                val code = text.substring(i + 2, i + 6).toIntOrNull(16)
                if (code != null) { out.append(code.toChar()); i += 6; continue }
            }
            if (i + 3 <= text.length) {
                val code = text.substring(i + 1, i + 3).toIntOrNull(16)
                if (code != null) { out.append(code.toChar()); i += 3; continue }
            }
        }
        out.append(c)
        i++
    }
    return out.toString()
}

/** `a || b` on untyped values. */
fun jsOr(a: Any?, b: Any?): Any? = if (jsTruthy(a)) a else b

/** A global the platform does not define (an iOS API in an Android build): reading it throws, as in JavaScript. */
fun jsUndefinedGlobal(name: String): Nothing = throw JSException(JSReferenceError("$name is not defined"))

/** `getClass(value)` from core's utils/types: the class name script sees for a value. */
fun getClass(value: Any?): String = when (value) {
    null, Unit -> "undefined"
    JSNull -> "null"
    is String -> "String"
    is Boolean -> "Boolean"
    is Double -> "Number"
    is JSArray<*> -> "Array"
    is JSDate -> "Date"
    is JSDynamic -> value.jsClassName ?: "Object"
    else -> value.javaClass.simpleName
}

// Java objects held untyped

/** Properties script added to a Java object the host cannot keep them on, by the object's identity. */
private val javaExpandos = JSWeakIdentityTable<JSObject>()

/**
 * Where the host keeps the properties script adds to a Java object of its own (an Android view, in
 * a view tag): the object's, made when `create` and none is there; null leaves them to the runtime's
 * table. Kept on the object, they go with it even when a value reaches back to it.
 */
@Volatile var jsJavaExpandoHost: ((target: Any, create: Boolean) -> JSObject?)? = null

private fun javaExpando(target: Any): JSObject? {
    jsJavaExpandoHost?.invoke(target, false)?.let { return it }
    return if (javaExpandos.isEmpty) null else javaExpandos.get(target)
}

private fun javaExpandoForWrite(target: Any): JSObject =
    jsJavaExpandoHost?.invoke(target, true) ?: javaExpandos.getOrPut(target) { JSObject() }

/** A method and its parameter types, which `getParameterTypes()` would copy at every call. */
class JavaOverload internal constructor(val method: Method) {
    val parameters: Array<Class<*>> = method.parameterTypes
}

/**
 * A class's members by name, looked up once: `getMethods()` copies and sorts every public method,
 * `getDeclaredFields()` makes every field anew, and a missed `getField` throws, all too slow for
 * script reading a view's property per row per frame.
 */
private class JavaMembers(private val cls: Class<*>) {
    val methods: Map<String, List<JavaOverload>> = cls.methods.filter { !Modifier.isStatic(it.modifiers) }.map(::JavaOverload).groupBy { it.method.name }
    val staticMethods: Map<String, List<JavaOverload>> = cls.methods.filter { Modifier.isStatic(it.modifiers) }.map(::JavaOverload).groupBy { it.method.name }
    private val fields = ConcurrentHashMap<String, Any>()

    /**
     * Static fields the class and its superclasses declare, public or not, the nearest class's first: a Kotlin
     * companion's property is its backing field on the declaring class.
     */
    val declaredStatics: Map<String, Field> by lazy {
        val out = HashMap<String, Field>()
        var c: Class<*>? = cls
        while (c != null) {
            for (f in c.declaredFields) if (Modifier.isStatic(f.modifiers)) out.putIfAbsent(f.name, f)
            c = c.superclass
        }
        out
    }

    /** Public member classes by simple name, the first `getClasses()` gives of each (it makes the array anew). */
    val nested: Map<String, Class<*>> by lazy {
        val out = HashMap<String, Class<*>>()
        for (c in cls.classes) out.putIfAbsent(c.simpleName, c)
        out
    }

    fun field(name: String): Field? = fields.getOrPut(name) {
        try { cls.getField(name) } catch (_: NoSuchFieldException) { Unit }
    } as? Field
}

private val javaMembers = ConcurrentHashMap<Class<*>, JavaMembers>()

private fun membersOf(cls: Class<*>): JavaMembers = javaMembers.getOrPut(cls) { JavaMembers(cls) }

/** A public class `cls` declares as a member, by its simple name (`android.view.View.OnClickListener`). */
internal fun javaNestedClass(cls: Class<*>, name: String): Class<*>? = membersOf(cls).nested[name]

/** A public field of the object's class, or null. */
private fun javaField(target: Any, name: String, static: Boolean): Field? {
    val cls = if (static && target is Class<*>) target else target.javaClass
    return membersOf(cls).field(name)?.takeIf { Modifier.isStatic(it.modifiers) == static }
}

private fun javaMethods(cls: Class<*>, name: String, static: Boolean): List<JavaOverload> =
    membersOf(cls).let { if (static) it.staticMethods else it.methods }[name] ?: emptyList()

/** `key in javaObject`: a public method or field of its class, or a property script added to it. */
fun jsJavaHas(target: Any, key: String): Boolean {
    val static = target is Class<*>
    val cls = if (static) target as Class<*> else target.javaClass
    if (javaExpando(target)?.has(key) == true || javaField(target, key, static) != null || javaMethods(cls, key, static).isNotEmpty()) return true
    // A class's static member script declared (`static tapEvent`): a Kotlin companion's property, its field on the class.
    return static && membersOf(cls).declaredStatics.containsKey(key)
}

/** A Java method read as a value: called later with script arguments, the overload chosen then. */
class JavaMethodRef(private val target: Any?, private val cls: Class<*>, private val name: String, private val overloads: List<JavaOverload>) {
    fun call(args: List<Any?>): Any? = javaInvoke(target, cls, name, overloads, args)
}

/** The overload the arguments fit best (the first of equally good ones) called with them converted. */
private fun javaInvoke(target: Any?, cls: Class<*>, name: String, overloads: List<JavaOverload>, args: List<Any?>): Any? {
    var chosen: JavaOverload? = null
    var best = Int.MAX_VALUE
    candidates@ for (o in overloads) {
        if (o.parameters.size != args.size) continue
        var total = 0
        for (i in o.parameters.indices) total += javaScore(args[i], o.parameters[i]) ?: continue@candidates
        if (total < best) {
            chosen = o
            best = total
        }
    }
    val overload = chosen ?: throw JSException(JSTypeError("${cls.name}.$name: no overload takes these ${args.size} arguments"))
    val converted = arrayOfNulls<Any?>(args.size)
    for (i in converted.indices) converted[i] = toJavaValue(args[i], overload.parameters[i])
    return try {
        fromJavaValue(overload.method.invoke(target, *converted))
    } catch (e: java.lang.reflect.InvocationTargetException) {
        throw e.targetException
    }
}

/** A Java package read untyped (`(<any>androidx).core.view`): its classes and packages by name, as NativeScript's runtime gives them. */
class JSJavaPackage(val name: String) : JSDynamic {
    override fun jsGet(key: String): Any? = try { Class.forName("$name.$key") } catch (_: ClassNotFoundException) { JSJavaPackage("$name.$key") }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = listOf()
    override val jsClassName: String? get() = null
}

/** NativeScript's `Array.create(type, n)` called untyped: a Java array of n default elements, of a primitive by its name or of a class. */
fun jsArrayCreate(type: Any?, length: Double): Any {
    val element = when (type) {
        is Class<*> -> type
        "boolean" -> Boolean::class.javaPrimitiveType!!
        "byte" -> Byte::class.javaPrimitiveType!!
        "char" -> Char::class.javaPrimitiveType!!
        "short" -> Short::class.javaPrimitiveType!!
        "int" -> Int::class.javaPrimitiveType!!
        "long" -> Long::class.javaPrimitiveType!!
        "float" -> Float::class.javaPrimitiveType!!
        "double" -> Double::class.javaPrimitiveType!!
        is String -> Class.forName(type)
        else -> throw JSException(JSTypeError("Array.create: ${jsTypeof(type)} is no Java type"))
    }
    return JavaArray.newInstance(element, length.toInt())
}

/** A Java method Kotlin cannot reach from where core calls it (a protected one), found and called by reflection. */
fun jsCallDeclared(target: Any?, name: String, vararg args: Any?): Any? {
    val receiver = target ?: throw JSException(JSTypeError("Cannot read properties of undefined (reading '$name')"))
    var c: Class<*>? = receiver.javaClass
    while (c != null) {
        val m = c.declaredMethods.firstOrNull { it.name == name && it.parameterCount == args.size && it.parameterTypes.withIndex().all { (i, t) -> javaScore(args[i], t) != null } }
        if (m != null) {
            m.isAccessible = true
            return try { fromJavaValue(m.invoke(receiver, *m.parameterTypes.mapIndexed { i, t -> toJavaValue(args[i], t) }.toTypedArray())) } catch (e: java.lang.reflect.InvocationTargetException) { throw e.targetException }
        }
        c = c.superclass
    }
    throw JSException(JSTypeError("${receiver.javaClass.name}.$name: no method takes these ${args.size} arguments"))
}

/** `new C(args)` where `C` is a class held as a value: the constructor the arguments fit best. */
fun jsNew(cls: Any?, vararg args: Any?): Any? {
    if (cls is JSConstructible) return cls.jsConstruct(args)
    val c = cls as? Class<*> ?: throw JSException(JSTypeError("${jsTypeof(cls)} is not a constructor"))
    val chosen = c.constructors.filter { it.parameterCount == args.size }.mapNotNull { k ->
        var total = 0
        for ((i, type) in k.parameterTypes.withIndex()) total += javaScore(args[i], type) ?: return@mapNotNull null
        k to total
    }.minByOrNull { it.second }?.first ?: throw JSException(JSTypeError("${c.name}: no constructor takes these ${args.size} arguments"))
    return try {
        chosen.newInstance(*chosen.parameterTypes.mapIndexed { i, type -> toJavaValue(args[i], type) }.toTypedArray())
    } catch (e: java.lang.reflect.InvocationTargetException) {
        throw e.targetException
    }
}

/** How well a number fits a primitive numeric parameter: lower is closer, null for any other type. */
private fun numericRank(type: Class<*>): Int? = when (type) {
    java.lang.Integer.TYPE -> 0
    java.lang.Long.TYPE -> 1
    java.lang.Float.TYPE -> 2
    java.lang.Double.TYPE -> 3
    java.lang.Short.TYPE -> 4
    java.lang.Byte.TYPE -> 5
    else -> null
}

/** How well a script value fits a Java parameter type: lower is closer, null is not at all. */
private fun javaScore(value: Any?, type: Class<*>): Int? {
    return when (value) {
        // NativeScript passes null to a primitive parameter as its zero, after any overload taking an object.
        null, JSNull, Unit -> if (type.isPrimitive) 60 else 1
        is Double -> numericRank(type) ?: when {
            type == java.lang.Double::class.java || type == java.lang.Number::class.java -> 9
            type == Any::class.java -> 30
            // A Java enum core's code types as a number (`getNativeRenderingMode(): number`): the kit holds it by its ordinal.
            type.isEnum && value >= 0 && value.toInt() < type.enumConstants!!.size -> 20
            else -> null
        }
        is String -> when {
            type == String::class.java -> 0
            type == CharSequence::class.java -> 1
            type == Char::class.javaPrimitiveType && value.length == 1 -> 3
            type == Any::class.java -> 30
            else -> null
        }
        is Boolean -> when (type) {
            Boolean::class.javaPrimitiveType -> 0
            java.lang.Boolean::class.java -> 1
            Any::class.java -> 30
            else -> null
        }
        is JSArray<*> -> if (type.isArray) 5 else if (type == Any::class.java) 40 else null
        else -> if (type.isPrimitive) null else if (type.isInstance(value)) (if (type == Any::class.java) 50 else 0) else null
    }
}

/** A script value as a Java parameter of `type` takes it. */
/** A script value passed to a Java parameter of an object type: null for JavaScript's null and undefined. */
fun jsJavaArgument(value: Any?): Any? = if (value === JSNull || value === Unit) null else value

fun toJavaValue(value: Any?, type: Class<*>): Any? = when {
    (value == null || value === JSNull || value === Unit) && type.isPrimitive -> JavaArray.get(JavaArray.newInstance(type, 1), 0)
    value == null || value === JSNull || value === Unit -> null
    // Integers through Long: past Int's range a number wraps (ToInt32), as NativeScript converts it.
    value is Double && type.isPrimitive -> when (type) {
        Int::class.javaPrimitiveType -> value.toLong().toInt()
        Long::class.javaPrimitiveType -> value.toLong()
        Float::class.javaPrimitiveType -> value.toFloat()
        Short::class.javaPrimitiveType -> value.toLong().toShort()
        Byte::class.javaPrimitiveType -> value.toLong().toByte()
        Char::class.javaPrimitiveType -> value.toLong().toInt().toChar()
        else -> value
    }
    value is Double && type.isEnum -> type.enumConstants!![value.toInt()]
    value is String && type == Char::class.javaPrimitiveType -> value[0]
    value is JSArray<*> && type.isArray -> {
        val element = type.componentType!!
        val array = JavaArray.newInstance(element, value.storage.size)
        value.storage.forEachIndexed { i, v -> JavaArray.set(array, i, toJavaValue(v, element)) }
        array
    }
    else -> value
}

/** A Java value as script reads it: numbers are Double, a char is a string, an array is a JSArray. */
fun fromJavaValue(value: Any?): Any? = when (value) {
    null -> null
    is Int -> value.toDouble()
    is Long -> value.toDouble()
    is Float -> value.toDouble()
    is Short -> value.toDouble()
    is Byte -> value.toDouble()
    is Char -> value.toString()
    is CharSequence -> if (value is String) value else value.toString()
    is Unit -> null
    else -> if (value.javaClass.isArray) JSArray((0 until JavaArray.getLength(value)).map { fromJavaValue(JavaArray.get(value, it)) }) else value
}

/** `object.key` on a Java object script holds untyped: its public field, a method by name, or an expando. A Java array has a length and its elements. */
fun jsJavaGet(target: Any, key: String): Any? {
    if (target.javaClass.isArray) {
        val length = JavaArray.getLength(target)
        return if (key == "length") length.toDouble() else jsArrayIndex(key)?.let { if (it < length) fromJavaValue(JavaArray.get(target, it.toInt())) else null }
    }
    javaExpando(target)?.let { if (it.has(key)) return it[key] }
    val static = target is Class<*>
    val cls = if (static) target as Class<*> else target.javaClass
    javaField(target, key, static)?.let { return fromJavaValue(it.get(if (static) null else target)) }
    val methods = javaMethods(cls, key, static)
    if (methods.isNotEmpty()) return JavaMethodRef(if (static) null else target, cls, key, methods)
    // A static member script declared on a base class (`ListViewBase.knownFunctions` read through ListView): a Kotlin
    // companion's property, its backing field on the declaring class, as jsJavaHas finds it.
    if (static) membersOf(cls).declaredStatics[key]?.let { f ->
        f.isAccessible = true
        return fromJavaValue(f.get(null))
    }
    // A class held as a value is also a `java.lang.Class` (`Class.forName(name).getField(f)`), after its own static members.
    if (static) javaMethods(Class::class.java, key, false).takeIf { it.isNotEmpty() }?.let { return JavaMethodRef(target, Class::class.java, key, it) }
    return null
}

/** `object.key = value` on a Java object script holds untyped: its public field, else an expando. */
fun jsJavaSet(target: Any, key: String, value: Any?) {
    if (target.javaClass.isArray) {
        val index = jsArrayIndex(key) ?: return
        if (index >= JavaArray.getLength(target)) throw JSException(JSRangeError("Index $index out of a Java array of ${JavaArray.getLength(target)}"))
        JavaArray.set(target, index.toInt(), toJavaValue(value, target.javaClass.componentType!!))
        return
    }
    val static = target is Class<*>
    val field = javaField(target, key, static)
    if (field != null && !Modifier.isFinal(field.modifiers)) {
        field.set(if (static) null else target, toJavaValue(value, field.type))
        return
    }
    javaExpandoForWrite(target)[key] = value
}

/** A native-property decorator's getter: the native object's getter method if it has one, else the fallback. */
fun jsNativePropertyGet(native: Any?, getter: String, fallback: Any?): Any? {
    if (native == null || native === JSNull) return fallback
    val methods = javaMethods(native.javaClass, getter, false)
    if (methods.none { it.parameters.isEmpty() }) return fallback
    return javaInvoke(native, native.javaClass, getter, methods, emptyList())
}

/** A native-property decorator's setter: the native setter called with the value. */
fun jsNativePropertySet(native: Any?, setter: String, value: Any?) {
    if (native == null || native === JSNull) return
    val methods = javaMethods(native.javaClass, setter, false)
    if (methods.none { it.parameters.size == 1 }) return
    javaInvoke(native, native.javaClass, setter, methods, listOf(value))
}

/** An untyped value read as a type parameter a call instantiates with an object class: the class's object for it (its `fromJS`). */
inline fun <reified T> jsCastTo(value: Any?): T = if (value is T) value else jsConvertTo(value, T::class.java) as T

fun jsConvertTo(value: Any?, cls: Class<*>): Any? {
    if (value == null || cls.isInstance(value)) return value
    if (cls == JSDate::class.java) return jsDateFrom(value)
    val companion = try { cls.getField("Companion").get(null) } catch (_: Exception) { null } ?: return value
    val fromJS = companion.javaClass.methods.firstOrNull { it.name == "fromJS" && it.parameterCount == 1 } ?: return value
    return fromJS.invoke(companion, value)
}
