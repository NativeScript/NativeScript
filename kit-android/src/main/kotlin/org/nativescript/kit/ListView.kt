package org.nativescript.kit

import android.graphics.drawable.ColorDrawable
import android.view.ViewGroup
import android.widget.BaseAdapter

/** A row's item and index as its template's bindings read them; a recycled row's bindings re-run for the next item. */
class ListRow<Item>(item: Item, index: Double) {
    val item = Signal(item)
    val index = Signal(index)
}

/** nativescript-vue's item context, what its `itemTemplateSelector` receives. */
class ListItem<T>(val item: T, val index: Double, val even: Boolean, val odd: Boolean)

/** `ItemEventData` (ListView `itemTap`, `itemLoading`) with the item a template rendered. */
class ItemEventPayload(val index: Double, val item: Any?, val view: View?)

val EventData.index: Double get() = (value as? ItemEventPayload)?.index ?: 0.0
val EventData.item: Any? get() = (value as? ItemEventPayload)?.item
val EventData.view: View? get() = (value as? ItemEventPayload)?.view ?: (value as? GestureEventPayload)?.view

/** A template's rendered view: its scope, and how it shows another row. */
private class ListContent(val view: View, val owner: Owner, val key: String, val show: (Int) -> Unit)

/**
 * `ListView` from list-view/index.android: an android ListView whose
 * adapter renders a template per row, recycled by template key, each row's
 * view wrapped in a StackLayout unless it is a layout without margins.
 */
open class ListView : View() {
    override val cssType: String get() = "ListView"

    private var count: () -> Int = { 0 }
    private var itemAt: (Int) -> Any? = { null }
    private var keyAt: (Int) -> String = { "default" }
    private var makeContent: (String, Int) -> ListContent? = { _, _ -> null }
    /** `_itemTemplatesInternal`: the default template first, then the app's. */
    private var templateKeys = listOf("default")
    /** Each recycled native row: the template view in it and its key. */
    private val realized = HashMap<NativeView, ListContent>()
    private val available = HashMap<String, LinkedHashSet<NativeView>>()
    private var effectiveRowHeight = -1.0
    private val adapter = Adapter()

    private val listView: android.widget.ListView get() = nativeView as android.widget.ListView

    override fun createNativeView(): NativeView = android.widget.ListView(context).also {
        it.descendantFocusability = ViewGroup.FOCUS_AFTER_DESCENDANTS
        it.cacheColorHint = android.graphics.Color.TRANSPARENT
    }

    override fun initNativeView() {
        super.initNativeView()
        val list = listView
        list.adapter = adapter
        list.setOnItemClickListener { _, convertView, index, _ ->
            emit("itemTap", ItemEventPayload(index.toDouble(), itemAt(index), realized[convertView]?.view))
        }
        list.id = NativeView.generateViewId()
    }

    override fun onLoaded() {
        super.onLoaded()
        // Without a layout pass the first item taps are not delivered.
        nativeView.requestLayout()
    }

    /** Binds the items and the templates: `render` makes the view for a template key and a row. */
    fun <Item> bind(items: () -> List<Item>, templates: List<String> = listOf("default"), selector: ((Item, Double) -> String)? = null, render: ((String, ListRow<Item>) -> View)? = null) {
        var list: List<Item> = emptyList()
        count = { list.size }
        itemAt = { list.getOrNull(it) }
        keyAt = { index -> selector?.let { s -> s(list[index], index.toDouble()).takeIf { it in templates } } ?: "default" }
        templateKeys = listOf("default") + templates
        makeContent = { key, index ->
            val owner = Owner(null)
            val row = ListRow(list[index], index.toDouble())
            val view = owner.run {
                if (render != null) render(key, row)
                else Label().also { label -> Effect { label.set("text", toText(row.item.value) ?: "") } }
            }
            ListContent(view, owner, key) { next ->
                if (next < list.size) batch {
                    row.item.value = list[next]
                    row.index.value = next.toDouble()
                }
            }
        }
        Owner.current?.onCleanup { for (content in realized.values) content.owner.dispose() }
        Effect {
            val next = items()
            untrack {
                list = next
                refresh()
            }
        }
    }

    fun refresh() {
        adapter.notifyDataSetChanged()
    }

    fun scrollToIndex(index: Double) = listView.setSelection(index.toInt())
    fun scrollToIndexAnimated(index: Double) = listView.smoothScrollToPosition(index.toInt())

    override fun eachChildView(body: (View) -> Unit) {
        for (content in realized.values) (content.view.parent ?: content.view).let(body)
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "separatorColor" -> {
                val color = toColor(value)
                if (color != null) {
                    listView.divider = ColorDrawable(color.argb)
                    listView.dividerHeight = 1
                } else {
                    listView.divider = defaultDivider
                    listView.dividerHeight = defaultDividerHeight
                }
            }
            "rowHeight" -> {
                effectiveRowHeight = Length.parse(value, Length.Auto).toDevicePixels(-1.0)
                refresh()
            }
            else -> super.setProperty(name, value)
        }
    }

    private val defaultDivider by lazy { listView.divider }
    private val defaultDividerHeight by lazy { listView.dividerHeight }

    /** `ListViewAdapter`: rows by template, recycled through the views realized for each key. */
    private inner class Adapter : BaseAdapter() {
        override fun getCount(): Int = maxOf(0, count())
        override fun getItem(position: Int): Any? = if (position in 0 until getCount()) itemAt(position) else null
        override fun getItemId(position: Int): Long = position.toLong()
        override fun hasStableIds(): Boolean = true
        override fun isEnabled(position: Int): Boolean = position in 0 until getCount()
        override fun getViewTypeCount(): Int = templateKeys.size
        override fun getItemViewType(position: Int): Int = templateKeys.indexOf(keyAt(position)).coerceAtLeast(0)

        override fun getView(position: Int, convertView: NativeView?, parent: ViewGroup?): NativeView {
            val total = getCount()
            if (position < 0 || position >= total) {
                return NativeView(context).also { it.layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0) }
            }
            if (position == total - 1) emit("loadMoreItems", null)
            val key = keyAt(position)
            var native = convertView
            if (native != null && realized[native]?.key != key) {
                markUnused(native)
                native = takeAvailable(key)
            }
            var content = native?.let { realized[it] }
            if (content != null) content.show(position)
            else content = makeContent(key, position) ?: return NativeView(context)
            val view = content.view
            if (hasHandlers("itemLoading")) emit("itemLoading", ItemEventPayload(position.toDouble(), itemAt(position), view))
            if (effectiveRowHeight > -1) view.set("height", Layout.toDeviceIndependentPixels(effectiveRowHeight)) else view.set("height", null)
            if (view.parent == null) {
                native = if (view is LayoutBase && !hasMargins(view)) {
                    addView(view)
                    view.nativeView
                } else {
                    val outer = StackLayout()
                    outer.addChild(view)
                    addView(outer)
                    outer.nativeView
                }
            }
            val row = native ?: view.parent?.nativeView ?: view.nativeView
            realized[row] = content
            available.getOrPut(key) { LinkedHashSet() }.remove(row)
            return row
        }

        private fun hasMargins(view: View): Boolean = listOf("marginTop", "marginBottom", "marginLeft", "marginRight").any {
            Length.parse(view.applied[it], Length.zero).toDevicePixels(0.0, Double.NaN) > 0
        }

        private fun markUnused(native: NativeView) {
            val content = realized[native] ?: return
            available.getOrPut(content.key) { LinkedHashSet() }.add(native)
        }

        private fun takeAvailable(key: String): NativeView? {
            val set = available[key] ?: return null
            val first = set.firstOrNull() ?: return null
            set.remove(first)
            return first
        }
    }
}
