package org.nativescript.kit

/**
 * `Property` from @nativescript/core's ui/core/properties, for properties a
 * plugin registers: by name, on a view class and its subclasses. A local
 * value is stored like any view property; `valueChanged` runs on every
 * change, the converter on string values, and the class's native setter
 * (`[property.setNative]`, a `setProperty` case of the compiled class) when
 * the view is loaded, as core replays native setters.
 */
class Property(options: Any?) {
    val name: String = jsField(options, "name") as? String ?: ""
    val defaultValue: Any? = jsField(options, "defaultValue")
    private val valueChanged: Any? = jsField(options, "valueChanged")
    private val valueConverter: Any? = jsField(options, "valueConverter")
    private val equalityComparer: Any? = jsField(options, "equalityComparer")
    private val affectsLayout: Boolean = jsTruthy(jsField(options, "affectsLayout"))

    /** `property.register(Class)`: `cls` is the class itself (`Drawer::class.java`). */
    fun register(cls: Any?) {
        val type = cls as? Class<*> ?: return
        registered.getOrPut(type) { HashMap() }[name] = this
        lookup.clear()
    }

    /** `nativeValueChange(owner, value)`: a value the native side reports, stored without being written back. */
    fun nativeValueChange(owner: Any?, value: Any?) {
        if (owner is View && value != null) owner.nativeValueChange(name, value)
    }

    internal fun converted(value: Any?): Any? {
        if (valueConverter == null || value !is String) return value
        return try {
            jsCall(valueConverter, value)
        } catch (e: Throwable) {
            jsReportUncaught(jsCaught(e))
            null
        }
    }

    internal fun same(old: Any?, new: Any?): Boolean {
        if (equalityComparer != null) return jsTruthy(try { jsCall(equalityComparer, old, new) } catch (e: Throwable) { jsReportUncaught(jsCaught(e)); null })
        return jsStrictEquals(old, new)
    }

    internal fun changed(target: View, old: Any?, new: Any?) {
        if (affectsLayout) target.requestLayout()
        if (valueChanged != null) jsReport { jsCall(valueChanged, target, old ?: defaultValue, new ?: defaultValue) }
    }

    companion object {
        private val registered = HashMap<Class<*>, HashMap<String, Property>>()
        private val lookup = HashMap<String, Property?>()

        /** The property registered as `name` on `type` or a class it extends. */
        internal fun registered(name: String, type: Class<*>): Property? {
            if (registered.isEmpty()) return null
            val key = "${System.identityHashCode(type)}:$name"
            if (lookup.containsKey(key)) return lookup[key]
            var c: Class<*>? = type
            var found: Property? = null
            while (c != null && found == null) {
                found = registered[c]?.get(name)
                c = c.superclass
            }
            lookup[key] = found
            return found
        }
    }
}

/** `CSSType('Name')`: the type selector a compiled class answers to is in its `cssType` override. */
@Suppress("UNUSED_PARAMETER")
fun CSSType(name: String): (Any?) -> Unit = { }

/** `booleanConverter` from core's view-base: the strings "true"/"false" in any case; anything else as it is. */
fun booleanConverter(value: Any?): Boolean = if (value is String) value.lowercase() == "true" else jsTruthy(value)
