package org.nativescript.kit

/**
 * An object a native binding answers for, as a JavaScript engine's host object does: its properties
 * by `get` and `set`, its methods by `invoke`; a method read as a value is a function calling it.
 * Bindings of plugins whose code installs objects into the engine (`global.CanvasModule`) are these.
 */
abstract class JSHostObject : JSDynamic {
    /** The methods `invoke` answers, which reading a property of that name gives as a function. */
    open val methods: Set<String> get() = emptySet()

    /** The property's value, or [ABSENT] when the object has no property of that name. */
    open fun get(key: String): Any? = ABSENT

    /** Whether the object took the value as a property of its own. */
    open fun set(key: String, value: Any?): Boolean = false

    /** The method's result, or [ABSENT] when the object has no method of that name. */
    open fun invoke(key: String, args: Array<out Any?>): Any? = ABSENT

    fun has(key: String): Boolean = key in methods || get(key) !== ABSENT

    override fun jsGet(key: String): Any? {
        val value = get(key)
        if (value !== ABSENT) return value
        if (key in methods) return JSMethod { _, args -> call(key, args) }
        return null
    }

    override fun jsSet(key: String, value: Any?) {
        set(key, value)
    }

    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = null

    /** `object.method(args)`: the method's result, a TypeError where there is none. */
    fun call(key: String, args: Array<out Any?>): Any? {
        val result = invoke(key, args)
        if (result === ABSENT) throw JSException(JSTypeError("${jsClassName ?: "object"}.$key is not a function"))
        return result
    }

    companion object {
        /** What `get` and `invoke` return for a name the object does not have. */
        val ABSENT = Any()
    }
}

/** A value script constructs with `new` (`new global.CanvasModule.Path2D()`) that is no Java class. */
interface JSConstructible {
    fun jsConstruct(args: Array<out Any?>): Any?
}
