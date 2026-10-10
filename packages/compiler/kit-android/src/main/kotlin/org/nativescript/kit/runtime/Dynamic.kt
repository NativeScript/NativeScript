package org.nativescript.kit

import java.lang.reflect.Array as JavaArray
import java.lang.reflect.Field
import java.lang.reflect.Method
import java.lang.reflect.Modifier
import java.util.WeakHashMap

// JavaScript's object operations on values translated code holds untyped:
// what plugins written against loose types do with options bags, event
// payloads and the views they decorate, and with Java objects they hold as
// `any`, whose fields and methods NativeScript's runtime reaches by name.

/** A function script holds untyped: called with whatever arguments it is given. */
class JSFunction(val body: (List<Any?>) -> Any?) {
    operator fun invoke(vararg args: Any?): Any? = body(args.toList())
}

fun jsFunction(body: (List<Any?>) -> Any?): JSFunction = JSFunction(body)

/** A value where a collection's element type goes, null included, as script stores it (the element type is erased). */
@Suppress("UNCHECKED_CAST")
fun <T> jsUnchecked(value: Any?): T = value as T

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

// A function value held untyped, as a Kotlin function of its arity (cast to the typed function by the caller).
@Suppress("UNCHECKED_CAST")
fun jsFunction0(f: Any?): () -> Any? = f as? Function0<Any?> ?: { jsCall(f) }
@Suppress("UNCHECKED_CAST")
fun jsFunction1(f: Any?): (Any?) -> Any? = f as? Function1<Any?, Any?> ?: { a -> jsCall(f, a) }
@Suppress("UNCHECKED_CAST")
fun jsFunction2(f: Any?): (Any?, Any?) -> Any? = f as? Function2<Any?, Any?, Any?> ?: { a, b -> jsCall(f, a, b) }
@Suppress("UNCHECKED_CAST")
fun jsFunction3(f: Any?): (Any?, Any?, Any?) -> Any? = f as? Function3<Any?, Any?, Any?, Any?> ?: { a, b, c -> jsCall(f, a, b, c) }
@Suppress("UNCHECKED_CAST")
fun jsFunction4(f: Any?): (Any?, Any?, Any?, Any?) -> Any? = f as? Function4<Any?, Any?, Any?, Any?, Any?> ?: { a, b, c, d -> jsCall(f, a, b, c, d) }
@Suppress("UNCHECKED_CAST")
fun jsFunction5(f: Any?): (Any?, Any?, Any?, Any?, Any?) -> Any? = f as? Function5<Any?, Any?, Any?, Any?, Any?, Any?> ?: { a, b, c, d, e -> jsCall(f, a, b, c, d, e) }
@Suppress("UNCHECKED_CAST")
fun jsFunction6(f: Any?): (Any?, Any?, Any?, Any?, Any?, Any?) -> Any? = f as? Function6<Any?, Any?, Any?, Any?, Any?, Any?, Any?> ?: { a, b, c, d, e, g -> jsCall(f, a, b, c, d, e, g) }
@Suppress("UNCHECKED_CAST")
fun jsFunction7(f: Any?): (Any?, Any?, Any?, Any?, Any?, Any?, Any?) -> Any? = f as? Function7<Any?, Any?, Any?, Any?, Any?, Any?, Any?, Any?> ?: { a, b, c, d, e, g, h -> jsCall(f, a, b, c, d, e, g, h) }

/** A function value held untyped, as a Kotlin function taking its `this` first: a JSMethod gets it as its receiver. */
fun jsThisFunction(f: Any?, arity: Int): Any = if (f !is JSMethod) when (arity) {
    1 -> jsFunction1(f)
    2 -> jsFunction2(f)
    3 -> jsFunction3(f)
    4 -> jsFunction4(f)
    else -> jsFunction5(f)
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

/** Properties script added to a Java object, kept with the object. */
private val javaExpandos = WeakHashMap<Any, JSObject>()

/** A public field of the object's class, or null. */
private fun javaField(target: Any, name: String, static: Boolean): Field? {
    val cls = if (static && target is Class<*>) target else target.javaClass
    return try {
        cls.getField(name).takeIf { Modifier.isStatic(it.modifiers) == static }
    } catch (_: NoSuchFieldException) {
        null
    }
}

private fun javaMethods(cls: Class<*>, name: String, static: Boolean): List<Method> =
    cls.methods.filter { it.name == name && Modifier.isStatic(it.modifiers) == static }

/** `key in javaObject`: a public method or field of its class, or a property script added to it. */
fun jsJavaHas(target: Any, key: String): Boolean {
    val static = target is Class<*>
    val cls = if (static) target as Class<*> else target.javaClass
    if (javaExpandos[target]?.has(key) == true || javaField(target, key, static) != null || javaMethods(cls, key, static).isNotEmpty()) return true
    // A class's static member script declared (`static tapEvent`): a Kotlin companion's property, its field on the class.
    if (static) {
        var c: Class<*>? = cls
        while (c != null) {
            if (c.declaredFields.any { it.name == key && Modifier.isStatic(it.modifiers) }) return true
            c = c.superclass
        }
    }
    return false
}

/** A Java method read as a value: called later with script arguments, the overload chosen then. */
class JavaMethodRef(private val target: Any?, private val cls: Class<*>, private val name: String, private val methods: List<Method>) {
    fun call(args: List<Any?>): Any? {
        val candidates = methods.filter { it.parameterCount == args.size }
        val scored = candidates.mapNotNull { m ->
            var total = 0
            for ((i, type) in m.parameterTypes.withIndex()) total += javaScore(args[i], type) ?: return@mapNotNull null
            m to total
        }
        val chosen = scored.minByOrNull { it.second }?.first
            ?: throw JSException(JSTypeError("${cls.name}.$name: no overload takes these ${args.size} arguments"))
        val converted = chosen.parameterTypes.mapIndexed { i, type -> toJavaValue(args[i], type) }
        return try {
            fromJavaValue(chosen.invoke(target, *converted.toTypedArray()))
        } catch (e: java.lang.reflect.InvocationTargetException) {
            throw e.targetException
        }
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
    val c = cls as? Class<*> ?: throw JSException(JSTypeError("${jsTypeof(cls)} is not a constructor"))
    val chosen = c.constructors.filter { it.parameterCount == args.size }.mapNotNull { k ->
        var total = 0
        for ((i, type) in k.parameterTypes.withIndex()) total += javaScore(args[i], type) ?: return@mapNotNull null
        k to total
    }.minByOrNull { it.second }?.first ?: throw JSException(JSTypeError("${c.simpleName}: no constructor takes these ${args.size} arguments"))
    return try {
        chosen.newInstance(*chosen.parameterTypes.mapIndexed { i, type -> toJavaValue(args[i], type) }.toTypedArray())
    } catch (e: java.lang.reflect.InvocationTargetException) {
        throw e.targetException
    }
}

/** How well a script value fits a Java parameter type: lower is closer, null is not at all. */
private fun javaScore(value: Any?, type: Class<*>): Int? {
    val rank: Map<Class<*>?, Int> = mapOf(Int::class.javaPrimitiveType to 0, Long::class.javaPrimitiveType to 1, Float::class.javaPrimitiveType to 2, Double::class.javaPrimitiveType to 3, Short::class.javaPrimitiveType to 4, Byte::class.javaPrimitiveType to 5)
    return when (value) {
        // NativeScript passes null to a primitive parameter as its zero, after any overload taking an object.
        null, JSNull, Unit -> if (type.isPrimitive) 60 else 1
        is Double -> rank[type] ?: when {
            type == java.lang.Double::class.java || type == java.lang.Number::class.java -> 9
            type == Any::class.java -> 30
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
    javaExpandos[target]?.let { if (it.has(key)) return it[key] }
    val static = target is Class<*>
    val cls = if (static) target as Class<*> else target.javaClass
    javaField(target, key, static)?.let { return fromJavaValue(it.get(if (static) null else target)) }
    val methods = javaMethods(cls, key, static)
    if (methods.isNotEmpty()) return JavaMethodRef(if (static) null else target, cls, key, methods)
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
    javaExpandos.getOrPut(target) { JSObject() }[key] = value
}

/** A native-property decorator's getter: the native object's getter method if it has one, else the fallback. */
fun jsNativePropertyGet(native: Any?, getter: String, fallback: Any?): Any? {
    if (native == null || native === JSNull) return fallback
    val methods = javaMethods(native.javaClass, getter, false).filter { it.parameterCount == 0 }
    if (methods.isEmpty()) return fallback
    return JavaMethodRef(native, native.javaClass, getter, methods).call(emptyList())
}

/** A native-property decorator's setter: the native setter called with the value. */
fun jsNativePropertySet(native: Any?, setter: String, value: Any?) {
    if (native == null || native === JSNull) return
    val methods = javaMethods(native.javaClass, setter, false).filter { it.parameterCount == 1 }
    if (methods.isEmpty()) return
    JavaMethodRef(native, native.javaClass, setter, methods).call(listOf(value))
}
