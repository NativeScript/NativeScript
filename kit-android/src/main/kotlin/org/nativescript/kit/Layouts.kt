package org.nativescript.kit

import android.view.ViewGroup
import org.nativescript.widgets.GridUnitType
import org.nativescript.widgets.ItemSpec
import org.nativescript.widgets.Orientation
import org.nativescript.widgets.VerticalScrollView
import org.nativescript.widgets.LayoutBase as NativeLayoutBase

/** `ContainerView`: layouts leave window insets to the page unless told otherwise. */
open class ContainerView : View() {
    protected open val androidOverflowEdge: Int get() = NativeLayoutBase.OverflowEdgeIgnore

    override fun initNativeView() {
        super.initNativeView()
        (nativeView as? NativeLayoutBase)?.setOverflowEdge(androidOverflowEdge)
    }
}

/**
 * `LayoutBase`: children in template order, static ones and the runs that
 * `if`/`for` regions own, mirrored into the native layout's child list.
 */
abstract class LayoutBase : ContainerView(), RegionHost {
    private sealed class Entry {
        class Child(val view: View) : Entry()
        class Run(val region: Region) : Entry()
    }

    private val entries = mutableListOf<Entry>()
    private var children = listOf<View>()

    private val group: ViewGroup get() = nativeView as ViewGroup

    override fun addChild(child: View) {
        entries.add(Entry.Child(child))
        children = children + child
        addView(child)
        group.addView(child.nativeView)
    }

    /** A run of children owned by an `if` or `for`, at this point in template order. */
    fun addRegion(): Region = Region(this).also { entries.add(Entry.Run(it)) }

    override fun regionChanged(region: Region) {
        val next = entries.flatMap {
            when (it) {
                is Entry.Child -> listOf(it.view)
                is Entry.Run -> it.region.views
            }
        }
        val kept = HashSet(next)
        val group = group
        for (child in children) {
            if (child !in kept) {
                removeView(child)
                group.removeView(child.nativeView)
            }
        }
        val existing = HashSet(children)
        children = next
        for ((index, child) in next.withIndex()) {
            if (child !in existing) addView(child)
            val view = child.nativeView
            if (index >= group.childCount || group.getChildAt(index) !== view) {
                (view.parent as? ViewGroup)?.removeView(view)
                group.addView(view, index)
            }
        }
    }

    override fun eachChildView(body: (View) -> Unit) {
        children.forEach(body)
    }

    override fun applyPadding() {
        nativeView.setPadding(
            effectivePaddingLeft + effectiveBorderLeftWidth,
            effectivePaddingTop + effectiveBorderTopWidth,
            effectivePaddingRight + effectiveBorderRightWidth,
            effectivePaddingBottom + effectiveBorderBottomWidth,
        )
    }
}

open class StackLayout : LayoutBase() {
    override val cssType: String get() = "StackLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.StackLayout(context)

    override fun setProperty(name: String, value: Any?) {
        if (name == "orientation") {
            (nativeView as org.nativescript.widgets.StackLayout).orientation =
                if ((value as? String)?.trim() == "horizontal") Orientation.horizontal else Orientation.vertical
        } else {
            super.setProperty(name, value)
        }
    }
}

open class GridLayout : LayoutBase() {
    override val cssType: String get() = "GridLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.GridLayout(context)

    private val grid: org.nativescript.widgets.GridLayout get() = nativeView as org.nativescript.widgets.GridLayout

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "rows" -> {
                grid.clearRows()
                for (spec in parseItemSpecs(value)) grid.addRow(spec)
            }
            "columns" -> {
                grid.clearColumns()
                for (spec in parseItemSpecs(value)) grid.addColumn(spec)
            }
            else -> super.setProperty(name, value)
        }
    }

    companion object {
        /**
         * `parseAndAddItemSpecs` and `ItemSpec.toJSON`: `auto`, `2*`, or dips
         * scaled to pixels and truncated as the widgets' JSON reader does.
         */
        internal fun parseItemSpecs(value: Any?): List<ItemSpec> {
            val text = toText(value) ?: return emptyList()
            return text.split(Regex("[\\s,]+")).map { it.trim() }.filter { it.isNotEmpty() }.map { item ->
                when {
                    item == "auto" -> ItemSpec(1, GridUnitType.auto)
                    item.contains('*') -> ItemSpec(jsParseInt(item.replace("*", "").ifEmpty { "1" }) ?: 1, GridUnitType.star)
                    jsParseInt(item) != null -> ItemSpec((jsParseInt(item)!! * Layout.density).toInt(), GridUnitType.pixel)
                    else -> throw IllegalArgumentException("Cannot parse item spec from string: $item")
                }
            }
        }
    }
}

/** `ContentView`: one child, its content. */
open class ContentView : ContainerView() {
    var content: View? = null
        private set

    override fun addChild(child: View) {
        setContent(child)
    }

    protected open fun setContent(child: View) {
        content?.let {
            removeView(it)
            (nativeView as ViewGroup).removeView(it.nativeView)
        }
        content = child
        addView(child)
        addContentToNativeView(child)
    }

    protected open fun addContentToNativeView(child: View) {
        (nativeView as ViewGroup).addView(child.nativeView)
    }

    override fun eachChildView(body: (View) -> Unit) {
        content?.let(body)
    }
}

/** `ScrollView` from scroll-view/index.android: the widgets' vertical scroll view. */
open class ScrollView : ContentView() {
    override val cssType: String get() = "ScrollView"

    override fun createNativeView(): NativeView = VerticalScrollView(context).apply { isVerticalScrollBarEnabled = true }

    override fun initNativeView() {
        super.initNativeView()
        nativeView.id = NativeView.generateViewId()
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "scrollBarIndicatorVisible" -> nativeView.isVerticalScrollBarEnabled = toBool(value) ?: true
            "isScrollEnabled" -> (nativeView as VerticalScrollView).setScrollEnabled(toBool(value) ?: true)
            else -> super.setProperty(name, value)
        }
    }
}

/** JavaScript `parseInt(s, 10)`: the leading integer, or null for NaN. */
internal fun jsParseInt(text: String): Int? {
    val s = text.trim()
    var i = 0
    if (i < s.length && (s[i] == '-' || s[i] == '+')) i++
    val start = i
    while (i < s.length && s[i].isDigit()) i++
    if (i == start) return null
    return s.substring(0, i).toIntOrNull()
}
