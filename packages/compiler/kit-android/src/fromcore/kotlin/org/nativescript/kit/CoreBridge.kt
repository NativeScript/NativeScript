package org.nativescript.kit

// What compiled templates call (the code generator's vocabulary), over the
// classes compiled from @nativescript/core: children are added as
// nativescript-vue's renderer adds them, properties set as the XML builder
// sets them, errors reported as core reports what nothing catches.

/** The template children of a container: its static views and its regions, in template order. */
class TemplateChildren internal constructor(owner: ViewBase) : RegionHost {
    private val owner = java.lang.ref.WeakReference(owner)
    private val parts = mutableListOf<RegionPart>()
    /** The views this template put in the container, in order. */
    private var placed: List<ViewBase> = emptyList()

    fun add(view: ViewBase) {
        parts.add(RegionPart.Child(view))
        apply()
    }

    fun addRegion(region: Region): Region {
        region.host = this
        parts.add(RegionPart.Nested(region))
        if (region.views.isNotEmpty()) apply()
        return region
    }

    override fun regionChanged(region: Region) = apply()

    /** The container's children made to match the template's. */
    private fun apply() {
        val owner = owner.get() ?: return
        val next = parts.flatMap { it.views }
        jsReport {
            when (owner) {
                is LayoutBase -> {
                    val kept = next.toSet()
                    for (old in placed) if (old !in kept && old is View) owner.removeChild(old)
                    for ((index, view) in next.filterIsInstance<View>().withIndex()) {
                        val at = owner.getChildIndex(view)
                        if (at == index.toDouble()) continue
                        if (at >= 0) owner.removeChild(view)
                        // At the end, added as nativescript-vue adds it: core then appends the native view, where an index
                        // would place it below the native view at that position (a border's, which is no child).
                        if (index.toDouble() == owner.getChildrenCount()) owner.addChild(view) else owner.insertChild(view, index.toDouble())
                    }
                }
                is Page -> {
                    val bar = next.lastOrNull { it is ActionBar } as ActionBar?
                    if (bar != null && bar !== owner.actionBar) owner.actionBar = bar
                    val content = next.lastOrNull { it !is ActionBar } as? View
                    if (content !== owner.content) owner.content = content
                }
                is ContentView -> {
                    val shown = next.lastOrNull() as? View
                    if (shown !== owner.content) owner.content = shown
                }
                is Frame -> {
                    // The first page is the one shown first; a view that is not a page is wrapped in one.
                    val first = next.firstOrNull()
                    if (placed.isEmpty() && first != null) {
                        val page = first as? Page ?: Page().also { it.content = first as? View }
                        owner.navigate(JSObject("create" to jsFunction { page }, "animated" to false))
                    }
                }
                else -> for (view in next) if (placed.none { it === view }) jsCallMethod(owner, "_addChildFromBuilder", jsConstructorName(view), view)
            }
        }
        placed = next
    }
}

private val styleAccessors = java.util.concurrent.ConcurrentHashMap<Pair<Class<*>, String>, Boolean>()

/** Whether the view's class reads the key through an accessor of its own or its prototype's (`get flexGrow()`). */
private fun hasStyleAccessor(cls: Class<*>, key: String): Boolean = styleAccessors.getOrPut(cls to key) {
    val getter = "get" + key.replaceFirstChar { it.uppercase() }
    JSPrototypes.holder(cls, key) != null || cls.methods.any { it.name == getter && it.parameterCount == 0 }
}

/** The name of a view's class as core's builder knows it (`ActionItem`). */
private fun jsConstructorName(view: Any): String = (view as? JSDynamic)?.jsClassName ?: view.javaClass.simpleName

private val templateChildrenKey = jsSymbol("NativeScriptKit:templateChildren")

val ViewBase.templateChildren: TemplateChildren
    get() {
        (jsGet(this, templateChildrenKey.key) as? TemplateChildren)?.let { return it }
        val made = TemplateChildren(this)
        jsSet(this, templateChildrenKey.key, made)
        return made
    }

/** A template's child, after those before it. */
fun ViewBase.kitAddChild(child: ViewBase) = templateChildren.add(child)

/** A template child naming a slot (`hostSlot`) the view has: set as that property, as the driver does. */
fun ViewBase.kitAddTemplateChild(child: ViewBase) {
    val slot = jsGet(child, "hostSlot") as? String
    if (slot != null && jsHasKey(this, slot)) kitSet(slot, child) else kitAddChild(child)
}

/** A run of children an `if` or `for` owns, at this point in template order. */
fun ViewBase.kitAddRegion(): Region = templateChildren.addRegion(Region(null))

/** A region made before its container mounts it, with what it already holds. */
fun ViewBase.kitAddRegion(region: Region): Region = templateChildren.addRegion(region)

/**
 * An attribute's value, as nativescript-vue sets it: `ios:` attributes are for the other platform,
 * `android:` ones for this; a dotted name sets the path's last member, making objects along a path that has none.
 */
fun ViewBase.kitSet(name: String, value: Any?) {
    if (name.startsWith("ios:") || name.startsWith("ios.")) return
    val key = if (name.startsWith("android:")) name.removePrefix("android:") else name
    jsReport {
        val path = key.split(".")
        if (path.size == 1) {
            // A style property the view's accessor passes to its style (`backgroundColor`), which converts what the template gives;
            // without such an accessor (`zIndex`) the value lands on the object and styles nothing, as in NativeScript.
            val styled = JSPrototypes.holder(Style::class.java, key) != null
            val holder = JSPrototypes.holder(javaClass, key)
            // View.prototype accessors core defines for style properties (`flexWrapBefore`) take a typed value, which a
            // template's text would be coerced to (`"true"` to false); the style's converter parses it as NativeScript does.
            if (styled && value is String && holder != null && holder === JSPrototypes.holder(View::class.java, key)) {
                style?.let { jsSet(it, key, value); return@jsReport }
            }
            if (holder != null) {
                // A property of the view's own (an ActionItem's `visibility`), or an accessor passing a typed value to the style.
                try { set(key, value) } catch (e: ClassCastException) { if (styled) style?.let { jsSet(it, key, value) } ?: throw e else throw e }
                return@jsReport
            }
            if (styled && hasStyleAccessor(javaClass, key)) style?.let { jsSet(it, key, value); return@jsReport }
            set(key, value)
            return@jsReport
        }
        var target: Any? = this
        for (member in path.dropLast(1)) {
            var next = jsGet(target, member)
            if (jsIsNullish(next)) { next = JSObject(); jsSet(target, member, next) }
            target = next
        }
        jsSet(target, path.last(), value)
    }
}

/**
 * A listener for a template's event binding. A list's `itemTap` carries the row's item context
 * (`item`, `index`, `even`, `odd`), as nativescript-vue's ListView adds it.
 */
fun ViewBase.kitOn(eventName: String, handler: (EventData) -> Unit) {
    val list = if (eventName == "itemTap") this as? ListView else null
    jsReport {
        on(eventName, { data ->
            if (list != null) {
                val index = jsToNumber(jsGet(data, "index"))
                jsReport { jsSet(data, "item", list._getDataItem(index)) }
                jsSet(data, "even", index % 2.0 == 0.0)
                jsSet(data, "odd", index % 2.0 != 0.0)
            }
            handler(data)
            // Promise jobs run when a handler returns: a looper kept busy by redrawing views never idles.
            Microtasks.checkpoint()
        })
    }
}

/** What an event carries beyond its name and sender (`value`, `index`…), read by name. */
val EventData.value: Any? get() = jsGet(this, "value")

/** `$navigateTo(Component)`: the topmost frame shows the view the template makes. */
fun kitNavigate(animated: Boolean = true, create: () -> View) {
    jsReport {
        val frame = FrameBase.topmost() ?: return@jsReport
        frame.navigate(JSObject("create" to jsFunction { create() }, "animated" to animated))
    }
}

/** `$navigateBack()`. */
fun kitNavigateBack() {
    jsReport { FrameBase.goBack() }
}

// List templates

/** A row's item and index as its template's bindings read them. A recycled cell keeps its views; writing the next item re-runs only its bindings. */
class ListRow<Item> internal constructor(item: Item, index: Double) {
    val item = Signal(item)
    val index = Signal(index)
}

/** nativescript-vue's item context, what its `itemTemplateSelector` receives. */
class ListItem<T>(val item: T, val index: Double, val even: Boolean, val odd: Boolean)

private val listRowKey = jsSymbol("NativeScriptKit:listRow")
private val listTemplateKey = jsSymbol("NativeScriptKit:listTemplate")

/**
 * A ListView's items and the templates that render them, as nativescript-vue gives them to core:
 * `itemTemplates` naming each template, the selector choosing a row's template, and each row's view made
 * on `itemLoading`, where a reused cell's view is kept when its template is the row's.
 */
fun <Item> ListView.bind(items: () -> List<Item>, templates: List<String> = listOf("default"), selector: ((Item, Double) -> String)? = null, render: ((String, ListRow<Item>) -> View)? = null) {
    var current: List<Item> = emptyList()
    val listOwner = Owner.current
    if (render != null) {
        kitSet("itemTemplates", JSArray<Any?>(templates.map { key -> JSObject("key" to key, "createView" to jsFunction { null }) }))
    }
    if (selector != null) {
        kitSet("itemTemplateSelector", jsFunction { args ->
            val index = jsToNumber(args.getOrNull(1))
            if (index < 0 || index.toInt() >= current.size) templates.firstOrNull() else selector(current[index.toInt()], index)
        })
    }
    kitOn("itemLoading") { data ->
        val index = jsToNumber(jsGet(data, "index"))
        if (index < 0 || index.toInt() >= current.size) return@kitOn
        val item = current[index.toInt()]
        val key = selector?.invoke(item, index) ?: templates.firstOrNull() ?: "default"
        val reused = jsGet(data, "view") as? ViewBase
        @Suppress("UNCHECKED_CAST")
        val row = reused?.let { jsGet(it, listRowKey.key) as? ListRow<Item> }
        if (reused != null && row != null && jsGet(reused, listTemplateKey.key) == key) {
            row.item.value = item
            row.index.value = index
            return@kitOn
        }
        if (render == null) return@kitOn
        val made = ListRow(item, index)
        // Each cell's bindings live as long as the list's.
        val view = Owner(listOwner).run { render(key, made) }
        jsSet(view, listRowKey.key, made)
        jsSet(view, listTemplateKey.key, key)
        jsSet(data, "view", view)
    }
    val list = java.lang.ref.WeakReference(this)
    Effect {
        current = items()
        val values = JSArray<Any?>(current.map { it as Any? })
        untrack { list.get()?.kitSet("items", values) }
    }
}
