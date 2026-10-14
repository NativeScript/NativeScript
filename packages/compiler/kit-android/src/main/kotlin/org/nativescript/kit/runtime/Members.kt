package org.nativescript.kit

/**
 * The accessor a property's registration (`textProperty.register(TextBase)`) defines on a class's prototype,
 * held by the class's native member of the property's name, which calls it without looking it up by name.
 *
 * The member reads and writes by name instead (`jsExpandoGet`, `jsExpandoSet`), and so gets what script would,
 * wherever the accessor may not be what the prototype chain resolves the name to: before the registration has
 * defined it, and for good once script defines or deletes the name on the prototype of the class or of a class
 * extending it. Once script gives any instance an own property of the name, each instance's own is looked for first.
 */
class JSTypedMember(internal val owner: Class<*>, val name: String) {
    @Volatile private var getter: ((Any?) -> Any?)? = null
    @Volatile private var setter: ((Any?, Any?) -> Unit)? = null
    @Volatile internal var patched = false
    @Volatile internal var shadowable = false

    init {
        JSTypedMembers.add(this)
    }

    private fun reachesAccessor(obj: JSExpando): Boolean = !shadowable || obj.jsExpando?.has(name) != true

    fun read(obj: JSExpando): Any? {
        val g = getter
        return if (g != null && reachesAccessor(obj)) g(obj) else jsExpandoGet(obj, name)
    }

    fun write(obj: JSExpando, value: Any?) {
        val s = setter
        if (s != null && reachesAccessor(obj)) s(obj, value) else jsExpandoSet(obj, name, value)
    }

    /** What the registration defined: an accessor replaces both functions, a value leaves none, attributes alone keep them. */
    internal fun define(d: JSPropertyDescriptor) {
        if (patched) return
        if (d.get != null || d.set != null) {
            getter = d.get
            setter = d.set
        } else if (d.hasValue || d.writable != null) {
            unbind()
        }
    }

    internal fun unbind() {
        getter = null
        setter = null
    }
}

/** The typed members of every class, and what script does at run time that a member has to give way to. */
object JSTypedMembers {
    private val lock = Any()
    private val byName = HashMap<String, MutableList<JSTypedMember>>()
    /** The classes on whose prototypes script defined or deleted each name outside a registration. */
    private val patches = HashMap<String, MutableList<Class<*>>>()
    /** The classes of instances given an own property of each name. */
    private val shadowed = HashMap<String, MutableSet<Class<*>>>()
    private var registering: List<JSTypedMember> = emptyList()

    internal fun add(member: JSTypedMember) = synchronized(lock) {
        byName.getOrPut(member.name) { ArrayList() }.add(member)
        if (patches[member.name]?.any { member.owner.isAssignableFrom(it) } == true) member.patched = true
        if (shadowed[member.name]?.any { member.owner.isAssignableFrom(it) } == true) member.shadowable = true
    }

    /** A registration of the members' property: what it defines on their class's prototype under their name is the accessor they call. */
    inline fun <T> registering(vararg members: JSTypedMember, run: () -> T): T {
        val outer = enter(members)
        try {
            return run()
        } finally {
            leave(outer)
        }
    }

    @PublishedApi internal fun enter(members: Array<out JSTypedMember>): List<JSTypedMember> = synchronized(lock) {
        val outer = registering
        registering = outer + members
        outer
    }

    @PublishedApi internal fun leave(outer: List<JSTypedMember>) = synchronized(lock) { registering = outer }

    /** `Object.defineProperty(Cls.prototype, key, d)`, or with no descriptor `delete Cls.prototype[key]`. */
    internal fun prototypeChanged(cls: Class<*>, key: String, d: JSPropertyDescriptor?) = synchronized(lock) {
        val member = registering.firstOrNull { it.owner == cls && it.name == key }
        if (member != null) {
            if (d != null) member.define(d) else member.unbind()
            return@synchronized
        }
        patches.getOrPut(key) { ArrayList() }.add(cls)
        for (m in byName[key].orEmpty()) if (m.owner.isAssignableFrom(cls)) {
            m.patched = true
            m.unbind()
        }
    }

    /** An instance given an own property under a key, which hides its class's member of that name. */
    internal fun shadow(obj: Any, key: String) = synchronized(lock) {
        val cls = obj.javaClass
        if (shadowed.getOrPut(key) { HashSet() }.add(cls)) for (m in byName[key].orEmpty()) if (m.owner.isAssignableFrom(cls)) m.shadowable = true
    }
}
