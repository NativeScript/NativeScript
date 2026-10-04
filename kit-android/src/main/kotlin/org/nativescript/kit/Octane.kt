package org.nativescript.kit

// What Octane's NativeScript renderer does around a compiled component tree:
// a root mounted into a host view, effects that run after the views exist,
// and re-renders that wait for the microtask Octane schedules them in.

/**
 * `renderNativeScriptApp(host, Component, props)`: the component's views
 * attached to the host as the driver attaches a root (a page's content, a
 * layout's child); `unmount()` disposes them.
 */
class OctaneRoot(host: View, render: () -> View) : JSDynamic {
    private val owner = Owner(null)
    private val host = java.lang.ref.WeakReference(host)
    private var view: View? = null

    init {
        val made = owner.run(render)
        view = made
        if (host is LayoutBase) host.insertChild(made, minOf(0.0, host.getChildrenCount())) else host.addTemplateChild(made)
    }

    fun unmount() {
        owner.dispose()
        val made = view
        val layout = host.get() as? LayoutBase
        if (made != null && layout != null) layout.removeChild(made)
        view = null
    }

    override fun jsGet(key: String): Any? = if (key == "unmount") jsFunction { unmount(); null } else null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Root"
}

private val externalStores = HashMap<String, Signal<Int>>()

/**
 * `useSyncExternalStore(subscribe, getSnapshot)` at one call site: subscribed
 * once, its listener bumping a version that whatever read the snapshot tracks.
 */
fun <T> jsExternalStore(site: String, subscribe: Any?, snapshot: () -> T): T {
    var version = externalStores[site]
    if (version == null) {
        val made = Signal(0)
        version = made
        externalStores[site] = made
        val listener: () -> Unit = { made.value += 1 }
        jsReport { jsCall(subscribe, listener) }
    }
    version.value
    return snapshot()
}

/**
 * `useEffect(fn, deps)` / `useLayoutEffect`: `fn` runs once the component's
 * views exist (a passive effect in the microtask after the commit, a layout
 * effect at once), again whenever an entry of `deps` is no longer the same
 * value (after the previous run's cleanup), and its cleanup runs when the
 * component goes.
 */
class ComponentEffect(private val layout: Boolean, deps: (() -> List<Any?>)?, private val run: () -> Any?) {
    private var cleanup: Any? = null
    private var previous: List<Any?>? = null
    private var disposed = false

    init {
        Owner.current?.onCleanup {
            disposed = true
            runCleanup()
        }
        if (deps == null) schedule()
        else Effect {
            val next = deps()
            val before = previous
            previous = next
            if (before == null) {
                untrack { schedule() }
                return@Effect
            }
            if (before.size == next.size && before.zip(next).all { (a, b) -> jsSameValue(a, b) }) return@Effect
            untrack { schedule() }
        }
    }

    private fun runCleanup() {
        val c = cleanup
        cleanup = null
        if (c != null && c !== Unit) jsReport { jsCall(c) }
    }

    private fun schedule() {
        if (layout) fire() else Microtasks.enqueue { fire() }
    }

    private fun fire() {
        if (disposed) return
        runCleanup()
        jsReport { cleanup = run() }
    }
}

/** Octane's `registerElement(tag, ViewClass)`: the build resolved each tag to its class, so templates create the class directly. */
@Suppress("UNUSED_PARAMETER")
fun registerElement(tag: String, type: Any?) {}

/** A `className` prop: undefined sets no class. */
fun octaneClassName(value: Any?): String = if (value == null || value === Unit) "" else jsToString(value)

/** A list a template maps over; `{list?.map(…)}` with no list renders no rows. */
fun <T> octaneItems(items: Iterable<T>?): List<T> = items?.toList() ?: emptyList()

/** A template's value for a view property as script code holds it: functions are called with whatever they are given. */
fun octaneValue(value: Any?): Any? = value
