package org.nativescript.kit

/**
 * What a listener receives: the object `notify` was called with. Core hands
 * listeners that object itself, so keys beyond `eventName`, `object` and
 * `value` (a drawer's `side`, a gesture handler's `data`) read by name.
 */
class EventData private constructor(val eventName: String, val `object`: Observable, val value: Any?, private val fields: JSObject?) : JSDynamic {
    constructor(eventName: String, `object`: Observable, value: Any?) : this(eventName, `object`, value, null)

    override val jsKeys: List<String> get() = fields?.jsKeys ?: listOf("eventName", "object", "value")
    override val jsClassName: String? get() = null

    override fun jsGet(key: String): Any? = when (key) {
        "eventName" -> eventName
        "object" -> `object`
        "value" -> if (fields == null) value else fields["value"]
        else -> fields?.get(key)
    }

    override fun jsSet(key: String, value: Any?) {
        fields?.set(key, value)
    }

    /** `SystemAppearanceChangedEventData.newValue` and other values a notifier names. */
    val newValue: Any? get() = jsGet("newValue")

    companion object {
        /** The object a `notify` was called with; `object` defaults to the notifier, as core's `notify` sets it. */
        fun fromJS(data: Any?, notifier: Observable): EventData {
            val bag = data as? JSDynamic
            val fields = bag as? JSObject ?: JSObject().also { copy -> for (key in bag?.jsKeys ?: emptyList()) copy[key] = bag!!.jsGet(key) }
            return EventData(bag?.jsGet("eventName") as? String ?: "", bag?.jsGet("object") as? Observable ?: notifier, bag?.jsGet("value"), fields)
        }
    }
}

/**
 * `Observable` from @nativescript/core's data/observable: listeners by event
 * name, each with the `this` it was added with; `notify` calls a copy of the
 * list in the order listeners were added. A listener is found again for `off`
 * by its key when it has one (the declaration a translated function comes
 * from), else by the function value.
 */
open class Observable : JSDynamic {
    companion object {
        const val propertyChangeEvent: String = "propertyChange"
    }

    class Listener(val callback: (EventData) -> Unit, val thisArg: Any?, val key: Any?, val once: Boolean) {
        var isRemoved = false
    }

    private val observers = HashMap<String, MutableList<Listener>>()

    /** Expando properties (`object.someKey = value` on a key the class does not declare). */
    private var expandos: JSObject? = null

    open fun on(eventNames: String, callback: (EventData) -> Unit, thisArg: Any?, key: Any? = null) {
        addEventListener(eventNames, callback, thisArg, false, key)
    }

    fun on(eventNames: String, callback: (EventData) -> Unit) = on(eventNames, callback, null, null)

    open fun once(eventNames: String, callback: (EventData) -> Unit, thisArg: Any?, key: Any? = null) {
        addEventListener(eventNames, callback, thisArg, true, key)
    }

    fun once(eventNames: String, callback: (EventData) -> Unit) = once(eventNames, callback, null, null)

    open fun off(eventNames: String, callback: ((EventData) -> Unit)?, thisArg: Any?, key: Any? = null) {
        removeEventListener(eventNames, callback, thisArg, key)
    }

    fun off(eventNames: String) = off(eventNames, null, null, null)

    open fun addEventListener(eventName: String, callback: (EventData) -> Unit, thisArg: Any? = null, once: Boolean = false, key: Any? = null) {
        val list = observers.getOrPut(eventName) { mutableListOf() }
        val identity = key ?: callback
        if (list.any { (it.key ?: it.callback) == identity && it.thisArg === thisArg }) return
        list.add(Listener(callback, thisArg, key, once))
        listenerAdded(eventName)
    }

    open fun removeEventListener(eventName: String, callback: ((EventData) -> Unit)? = null, thisArg: Any? = null, key: Any? = null) {
        val list = observers[eventName] ?: return
        if (callback == null && key == null) {
            for (entry in list) entry.isRemoved = true
            list.clear()
        } else {
            val identity = key ?: callback
            val index = list.indexOfFirst { (it.key ?: it.callback) == identity && it.thisArg === thisArg }
            if (index >= 0) list.removeAt(index).isRemoved = true
        }
        if (list.isEmpty()) observers.remove(eventName)
    }

    /** A first listener for an event: views start observing a gesture. */
    protected open fun listenerAdded(eventName: String) {}

    /** `notify(data)`: `data` is the object listeners receive. */
    fun notify(data: Any?) {
        fire(data as? EventData ?: EventData.fromJS(data, this))
    }

    fun notifyPropertyChange(name: String, value: Any?, oldValue: Any? = null) {
        notify(JSObject(listOf("eventName" to "propertyChange", "object" to this, "propertyName" to name, "value" to value, "oldValue" to oldValue)))
    }

    fun hasListeners(eventName: String): Boolean = observers[eventName]?.isNotEmpty() == true

    fun _emit(eventName: String) = fire(EventData(eventName, this, null))

    /** The listeners of an event, as `_getEventList` returns them. */
    fun _getEventList(eventName: String, createIfNeeded: Boolean? = null): JSArray<Any?>? {
        val list = observers[eventName] ?: return if (createIfNeeded == true) JSArray() else null
        return JSArray(list.toList())
    }

    internal val observedEvents: Set<String> get() = observers.keys

    internal fun fire(event: EventData) {
        val list = observers[event.eventName] ?: return
        for (entry in list.toList()) {
            if (entry.isRemoved) continue
            if (entry.once) {
                entry.isRemoved = true
                list.remove(entry)
                if (list.isEmpty()) observers.remove(event.eventName)
            }
            jsReport { entry.callback(event) }
        }
    }

    /** `get(name)` / `set(name, value)` on a plain Observable: its own properties by name. */
    open fun get(name: String): Any? = jsGet(name)

    open fun set(name: String, value: Any?) {
        val old = jsGet(name)
        if (jsStrictEquals(old, value)) return
        jsSet(name, value)
        notifyPropertyChange(name, value, old)
    }

    override val jsKeys: List<String> get() = expandos?.jsKeys ?: emptyList()
    override val jsClassName: String? get() = javaClass.simpleName

    override fun jsGet(key: String): Any? = when (key) {
        // An Observable held untyped (`handler.on(…)` on an `any`): its listener methods by name.
        "on", "once", "off", "addEventListener", "removeEventListener" -> jsFunction { args ->
            val names = args.getOrNull(0) as? String ?: return@jsFunction null
            val fn = args.getOrNull(1)
            val callback: (EventData) -> Unit = { event -> jsCall(fn, event) }
            when (key) {
                "on", "addEventListener" -> on(names, callback, args.getOrNull(2), fn)
                "once" -> once(names, callback, args.getOrNull(2), fn)
                else -> off(names, if (fn == null) null else callback, args.getOrNull(2), fn)
            }
            null
        }
        "notify" -> jsFunction { args -> notify(args.getOrNull(0)); null }
        else -> expandos?.get(key)
    }

    override fun jsSet(key: String, value: Any?) {
        (expandos ?: JSObject().also { expandos = it })[key] = value
    }
}
