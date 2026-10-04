package org.nativescript.kit

import android.view.ViewGroup
import org.nativescript.widgets.ViewHelper
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

    /** The children in order, regions' runs included. */
    val subViews: List<View> get() = children

    private val group: ViewGroup get() = nativeView as ViewGroup

    override fun addChild(child: View) {
        entries.add(Entry.Child(child))
        children = children + child
        addView(child)
        group.addView(child.nativeView)
        childAddedToNativeView(child)
    }

    /** `_updateNativeLayoutParams`: runs once the child's view is in this layout's view. */
    protected open fun childAddedToNativeView(child: View) {}

    /** A run of children owned by an `if` or `for`, at this point in template order. */
    fun addRegion(): Region = addRegion(Region(null))

    /** A region made before its container mounts it (Svelte's blocks), with what it already holds. */
    fun addRegion(region: Region): Region {
        region.host = this
        entries.add(Entry.Run(region))
        if (region.views.isNotEmpty()) regionChanged(region)
        return region
    }

    override fun regionChanged(region: Region) = rebuildChildren()

    /** `insertChild(child, atIndex)` from script: before the child now at that index. */
    fun insertChild(child: View, atIndex: Double) {
        val index = maxOf(0, atIndex.toInt())
        if (index >= children.size) return addChild(child)
        val before = children[index]
        val position = entries.indexOfFirst { (it is Entry.Child && it.view === before) || (it is Entry.Run && it.region.views.any { v -> v === before }) }
        entries.add(if (position < 0) entries.size else position, Entry.Child(child))
        rebuildChildren()
    }

    /** `removeChild(child)` from script. */
    open fun removeChild(child: View) {
        entries.removeAll { it is Entry.Child && it.view === child }
        rebuildChildren()
    }

    fun getChildIndex(child: View): Double = children.indexOfFirst { it === child }.toDouble()

    fun getChildrenCount(): Double = children.size.toDouble()

    private fun rebuildChildren() {
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
                childAddedToNativeView(child)
            }
        }
    }

    override fun eachChildView(body: (View) -> Unit) {
        children.forEach(body)
    }

    override fun setProperty(name: String, value: Any?) {
        if (name == "isPassThroughParentEnabled") (nativeView as NativeLayoutBase).passThroughParent = toBool(value) ?: false
        else super.setProperty(name, value)
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
                    item.contains('*') -> ItemSpec(parseIntOrNull(item.replace("*", "").ifEmpty { "1" }) ?: 1, GridUnitType.star)
                    parseIntOrNull(item) != null -> ItemSpec((parseIntOrNull(item)!! * Layout.density).toInt(), GridUnitType.pixel)
                    else -> throw IllegalArgumentException("Cannot parse item spec from string: $item")
                }
            }
        }
    }
}

/** `RootLayout` from root-layout/index.android: a grid whose children without gestures of their own take the touches over them. */
open class RootLayout : GridLayout() {
    override val cssType: String get() = "RootLayout"

    internal val rootState = RootLayoutState()

    override fun initNativeView() {
        super.initNativeView()
        registerRootLayout(this)
    }

    override fun childAddedToNativeView(child: View) {
        super.childAddedToNativeView(child)
        if (!child.hasAnyGestureObservers()) child.nativeView.setOnTouchListener { _, _ -> true }
    }

    override fun removeChild(child: View) {
        if (child.hasAnyGestureObservers()) child.nativeView.setOnTouchListener(null)
        super.removeChild(child)
    }
}

/** `WrapLayout` from wrap-layout/index.android. */
open class WrapLayout : LayoutBase() {
    override val cssType: String get() = "WrapLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.WrapLayout(context)

    private val wrap: org.nativescript.widgets.WrapLayout get() = nativeView as org.nativescript.widgets.WrapLayout

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "orientation" -> wrap.orientation = if (toText(value)?.trim() == "vertical") Orientation.vertical else Orientation.horizontal
            "itemWidth" -> wrap.itemWidth = Length.parse(value, Length.Auto).toDevicePixels(-1.0).toInt()
            "itemHeight" -> wrap.itemHeight = Length.parse(value, Length.Auto).toDevicePixels(-1.0).toInt()
            else -> super.setProperty(name, value)
        }
    }
}

/** `AbsoluteLayout` from absolute-layout/index.android: children placed by their `left` and `top`. */
open class AbsoluteLayout : LayoutBase() {
    override val cssType: String get() = "AbsoluteLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.AbsoluteLayout(context)
}

/** `DockLayout` from dock-layout/index.android: children docked by their `dock`. */
open class DockLayout : LayoutBase() {
    override val cssType: String get() = "DockLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.DockLayout(context)

    override fun setProperty(name: String, value: Any?) {
        if (name == "stretchLastChild") (nativeView as org.nativescript.widgets.DockLayout).stretchLastChild = toBool(value) ?: true
        else super.setProperty(name, value)
    }
}

/** `FlexboxLayout` from flexbox-layout/index.android, on the widgets' flexbox. */
open class FlexboxLayout : LayoutBase() {
    override val cssType: String get() = "FlexboxLayout"

    override fun createNativeView(): NativeView = org.nativescript.widgets.FlexboxLayout(context)

    private val flexbox: org.nativescript.widgets.FlexboxLayout get() = nativeView as org.nativescript.widgets.FlexboxLayout

    override fun setProperty(name: String, value: Any?) {
        val v = toText(value)?.trim()
        when (name) {
            "flexDirection" -> flexbox.flexDirection = when (v) { "row-reverse" -> 1; "column" -> 2; "column-reverse" -> 3; else -> 0 }
            "flexWrap" -> flexbox.flexWrap = when (v) { "wrap" -> 1; "wrap-reverse" -> 2; else -> 0 }
            "justifyContent" -> flexbox.justifyContent = when (v) { "flex-end" -> 1; "center" -> 2; "space-between" -> 3; "space-around" -> 4; else -> 0 }
            "alignItems" -> flexbox.alignItems = when (v) { "flex-start" -> 0; "flex-end" -> 1; "center" -> 2; "baseline" -> 3; else -> 4 }
            "alignContent" -> flexbox.alignContent = when (v) { "flex-start" -> 0; "flex-end" -> 1; "center" -> 2; "space-between" -> 3; "space-around" -> 4; else -> 5 }
            "rowGap" -> flexbox.rowGap = maxOf(0, Length.parse(value, Length.zero).toDevicePixels(0.0).toInt())
            "columnGap" -> flexbox.columnGap = maxOf(0, Length.parse(value, Length.zero).toDevicePixels(0.0).toInt())
            else -> super.setProperty(name, value)
        }
    }

    /** A child's minimum size moves into its flex layout params, with its flex properties. */
    override fun childAddedToNativeView(child: View) {
        val view = child.nativeView
        if (child !is Button) {
            ViewHelper.setMinWidth(view, 0)
            ViewHelper.setMinHeight(view, 0)
        }
        val lp = view.layoutParams as? org.nativescript.widgets.FlexboxLayout.LayoutParams ?: return
        lp.minWidth = Length.parse(child.applied["minWidth"], Length.zero).toDevicePixels(0.0).toInt()
        lp.minHeight = Length.parse(child.applied["minHeight"], Length.zero).toDevicePixels(0.0).toInt()
        lp.order = toInt(child.applied["order"]) ?: 1
        lp.flexGrow = toDouble(child.applied["flexGrow"])?.toFloat() ?: 0f
        lp.flexShrink = toDouble(child.applied["flexShrink"])?.toFloat() ?: 1f
        lp.wrapBefore = toBool(child.applied["flexWrapBefore"]) ?: false
        lp.alignSelf = alignSelf(child.applied["alignSelf"])
        view.layoutParams = lp
    }

    companion object {
        internal fun alignSelf(value: Any?): Int = when (toText(value)?.trim()) {
            "flex-start" -> 0
            "flex-end" -> 1
            "center" -> 2
            "baseline" -> 3
            "stretch" -> 4
            else -> -1
        }
    }
}

/** `ContentView`: one child, its content. */
open class ContentView : ContainerView() {
    private var contentView: View? = null

    /** `view.content` from script; a page given content through it adopts it as through its template. */
    var content: View?
        get() = contentView
        @JvmName("assignContent") set(value) {
            if (value != null) addChild(value) else contentView?.let { removeContent(it); contentView = null }
        }

    override fun addChild(child: View) {
        setContent(child)
    }

    protected open fun setContent(child: View) {
        contentView?.let { removeContent(it) }
        contentView = child
        addView(child)
        addContentToNativeView(child)
    }

    private fun removeContent(child: View) {
        removeView(child)
        (nativeView as ViewGroup).removeView(child.nativeView)
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
internal fun parseIntOrNull(text: String): Int? {
    val s = text.trim()
    var i = 0
    if (i < s.length && (s[i] == '-' || s[i] == '+')) i++
    val start = i
    while (i < s.length && s[i].isDigit()) i++
    if (i == start) return null
    return s.substring(0, i).toIntOrNull()
}
