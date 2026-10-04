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

/** Argument `index` of a dynamic call; a missing one is undefined. */
fun jsArg(args: List<Any?>, index: Int): Any? = args.getOrNull(index)

/** `delete object[key]`. */
fun jsDelete(target: Any?, key: String): Boolean = when (target) {
    is JSObject -> target.delete(key)
    is JSDeletable -> target.jsDelete(key)
    else -> true
}

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

/** `{ ...source }` into an object literal being built: the source's own enumerable keys, in order. */
fun jsObjectSpread(target: JSObject, source: Any?) {
    val dynamic = source as? JSDynamic ?: return
    for (key in dynamic.jsKeys) target[key] = dynamic.jsGet(key)
}

private var jsSymbolCount = 0

/** `Symbol(description)`: a property key no other code spells. */
fun jsSymbol(description: String): String {
    jsSymbolCount++
    return "@@$description#$jsSymbolCount"
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

/** `new WeakRef(value)`. */
class JSWeakRef<T>(value: T) : JSDynamic {
    private val ref = java.lang.ref.WeakReference(value)
    fun get(): T? = ref.get()
    fun deref(): T? = ref.get()

    // Read untyped (`view.nsView?.get()` on a native view): by name, as release builds rename members reflection would find.
    override fun jsGet(key: String): Any? = when (key) {
        "get", "deref" -> jsFunction { ref.get() }
        else -> null
    }
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "WeakRef"
}

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

/** How well a script value fits a Java parameter type: lower is closer, null is not at all. */
private fun javaScore(value: Any?, type: Class<*>): Int? {
    val rank: Map<Class<*>?, Int> = mapOf(Int::class.javaPrimitiveType to 0, Long::class.javaPrimitiveType to 1, Float::class.javaPrimitiveType to 2, Double::class.javaPrimitiveType to 3, Short::class.javaPrimitiveType to 4, Byte::class.javaPrimitiveType to 5)
    return when (value) {
        null, JSNull, Unit -> if (type.isPrimitive) null else 1
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
fun toJavaValue(value: Any?, type: Class<*>): Any? = when {
    value == null || value === JSNull || value === Unit -> null
    value is Double && type.isPrimitive -> when (type) {
        Int::class.javaPrimitiveType -> value.toInt()
        Long::class.javaPrimitiveType -> value.toLong()
        Float::class.javaPrimitiveType -> value.toFloat()
        Short::class.javaPrimitiveType -> value.toInt().toShort()
        Byte::class.javaPrimitiveType -> value.toInt().toByte()
        Char::class.javaPrimitiveType -> value.toInt().toChar()
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
