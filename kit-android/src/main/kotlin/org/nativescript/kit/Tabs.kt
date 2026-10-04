package org.nativescript.kit

import android.os.Bundle
import android.text.method.TransformationMethod
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.TextView as NativeTextView
import androidx.core.view.ViewCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import androidx.viewpager.widget.PagerAdapter
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.FragmentBase
import org.nativescript.widgets.GridUnitType
import org.nativescript.widgets.TabIconRenderingMode
import org.nativescript.widgets.TabItemSpec
import org.nativescript.widgets.TabLayout
import org.nativescript.widgets.TabViewPager
import java.lang.ref.WeakReference

/**
 * `TabViewItem` from tab-view/index.android: a title and a view. Its native
 * view is the tab's TextView in the TabLayout, styled by the item's font and
 * text transform; its view loads once the tab's fragment shows it.
 */
open class TabViewItem : View() {
    override val cssType: String get() = "TabViewItem"

    var view: View? = null
        private set
    internal var canBeLoaded = false
    internal var index = 0
    private var defaultTransformation: TransformationMethod? = null
    private var defaultTextSize = 0f
    private var defaultTypeface: android.graphics.Typeface? = null

    /** `setNativeView`: the tab's text view, styled again by the item's values. */
    internal var titleView: NativeTextView? = null
        set(value) {
            field = value
            if (value == null) return
            defaultTransformation = value.transformationMethod
            defaultTextSize = value.textSize
            defaultTypeface = value.typeface
            for (name in listOf("fontSize", "fontFamily", "textTransform")) if (applied[name] != null) setProperty(name, applied[name])
        }

    val title: String get() = toText(applied["title"]) ?: ""
    val iconSource: String? get() = toText(applied["iconSource"])

    override fun addChild(child: View) {
        if (view != null) return
        view = child
        addView(child)
    }

    override fun eachChildView(body: (View) -> Unit) {
        view?.let(body)
    }

    /** `loadView`: the view loads only once its fragment exists. */
    override fun shouldLoad(child: View): Boolean = canBeLoaded && parent is TabView

    internal fun loadContent() {
        val v = view ?: return
        if (shouldLoad(v)) v.load()
    }

    internal fun unloadContent() {
        view?.unload()
    }

    override fun propertyValueChanged(name: String, value: Any?) {
        super.propertyValueChanged(name, value)
        if (name == "title" || name == "iconSource") {
            if (titleView != null) (parent as? TabView)?.updateItem(this)
        }
    }

    override fun setProperty(name: String, value: Any?) {
        val tv = titleView ?: return
        when (name) {
            "fontSize" -> {
                val size = toDouble(value)
                if (size != null) tv.textSize = size.toFloat() else tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, defaultTextSize)
            }
            "fontFamily", "fontStyle", "fontWeight" -> {
                val font = Font.of(applied)
                tv.typeface = if (font.isDefault) defaultTypeface else font.typeface()
            }
            "textTransform" -> {
                val transform = toText(value)?.trim()
                if (transform == null || transform == "default") {
                    tv.transformationMethod = defaultTransformation
                    tv.text = title
                } else {
                    tv.text = TextBase.transformedText(title, transform)
                    tv.transformationMethod = null
                }
            }
        }
    }

    override fun backgroundChanged() {}
}

/**
 * `TabView` from tab-view/index.android: a grid of the tab strip and a view
 * pager whose pages are fragments showing the items' views.
 */
open class TabView : View() {
    override val cssType: String get() = "TabView"

    private val items = mutableListOf<TabViewItem>()
    private var adapterItems: List<TabViewItem>? = null
    private val viewId = NativeView.generateViewId()
    private val domId = nextId++
    private lateinit var tabLayout: TabLayout
    private lateinit var viewPager: TabViewPager
    private val adapter = Adapter()

    init {
        tabViews.add(WeakReference(this))
    }

    private val tabsOnTop: Boolean get() = (toText(applied["androidTabsPosition"])?.trim() ?: "top") == "top"
    private val offscreenTabLimit: Int get() = toInt(applied["androidOffscreenTabLimit"]) ?: 1
    val selectedIndex: Double get() = toDouble(applied["selectedIndex"]) ?: -1.0

    override fun createNativeView(): NativeView {
        val grid = org.nativescript.widgets.GridLayout(context)
        val pager = TabViewPager(context)
        val tabs = TabLayout(context)
        val lp = CommonLayoutParams()
        val primaryColor = paletteColor("colorPrimary")
        var accentColor = defaultAccentColor()
        lp.row = 1
        if (tabsOnTop) {
            grid.addRow(1, GridUnitType.auto)
            grid.addRow(1, GridUnitType.star)
            pager.layoutParams = lp
            if (toBool(applied["androidSwipeEnabled"]) == false) pager.setSwipePageEnabled(false)
        } else {
            grid.addRow(1, GridUnitType.star)
            grid.addRow(1, GridUnitType.auto)
            tabs.layoutParams = lp
            pager.setSwipePageEnabled(false)
            accentColor = 0x00ffffff
        }
        grid.addView(pager)
        pager.adapter = adapter
        grid.addView(tabs)
        val elevation = 4 * Layout.density
        ViewCompat.setElevation(grid, elevation)
        ViewCompat.setElevation(tabs, elevation)
        if (accentColor != 0) tabs.setSelectedIndicatorColors(accentColor)
        if (primaryColor != 0) tabs.setBackgroundColor(primaryColor)
        tabLayout = tabs
        viewPager = pager
        return grid
    }

    override fun initNativeView() {
        super.initNativeView()
        viewPager.id = viewId
    }

    override fun addChild(child: View) {
        if (child !is TabViewItem) return
        items.add(child)
        addView(child)
        refresh("selectedIndex")
    }

    override fun eachChildView(body: (View) -> Unit) {
        for (item in items.toList()) body(item)
    }

    override fun onLoaded() {
        super.onLoaded()
        setAdapterItems(items.toList())
    }

    override fun onUnloaded() {
        super.onUnloaded()
        setAdapterItems(null)
    }

    override fun defaultValue(name: String): Any? = if (name == "selectedIndex") -1.0 else null

    override fun coerce(name: String, value: Any?): Any? {
        if (name != "selectedIndex") return value
        var index = toDouble(if (value is String) parseIntOrNull(value.trim())?.toDouble() ?: Double.NaN else value) ?: -1.0
        if (items.isNotEmpty()) {
            val max = items.size - 1.0
            if (index < 0) index = 0.0
            if (index > max) index = max
        } else {
            index = -1.0
        }
        return index
    }

    private var previousIndex = -1.0

    override fun propertyValueChanged(name: String, value: Any?) {
        super.propertyValueChanged(name, value)
        if (name == "selectedIndex") {
            val newIndex = toDouble(value) ?: -1.0
            val oldIndex = previousIndex
            previousIndex = newIndex
            emit("selectedIndexChanged", SelectedIndexChange(oldIndex, newIndex))
        }
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "selectedIndex" -> viewPager.setCurrentItem(toInt(value) ?: 0, tabsOnTop)
            "tabBackgroundColor" -> {
                val color = toColor(value)
                if (color != null) tabLayout.setBackgroundColor(color.argb) else tabLayout.setBackgroundColor(paletteColor("colorPrimary"))
            }
            "tabTextFontSize" -> toDouble(value)?.let { tabLayout.tabTextFontSize = it.toFloat() }
            "tabTextColor" -> toColor(value)?.let { tabLayout.tabTextColor = it.argb }
            "selectedTabTextColor" -> toColor(value)?.let { tabLayout.selectedTabTextColor = it.argb }
            "androidSelectedTabHighlightColor" -> tabLayout.setSelectedIndicatorColors(toColor(value)?.argb ?: defaultAccentColor())
            "androidOffscreenTabLimit" -> viewPager.offscreenPageLimit = if (tabsOnTop) toInt(value) ?: 1 else 1
            "androidTabsPosition" -> viewPager.offscreenPageLimit = if (toText(value)?.trim() == "top") offscreenTabLimit else 1
            "androidIconRenderingMode" -> tabLayout.iconRenderingMode =
                if (toText(value)?.trim() == "alwaysTemplate") TabIconRenderingMode.template else TabIconRenderingMode.original
            else -> super.setProperty(name, value)
        }
    }

    internal fun updateItem(item: TabViewItem) {
        tabLayout.updateItemAt(item.index, tabItemSpec(item))
    }

    private fun setAdapterItems(next: List<TabViewItem>?) {
        val current = adapterItems
        if (next == null && current == null) return
        if (next != null && current != null && next.size == current.size && current.all { c -> next.any { it === c } }) return
        adapterItems = next
        if (next.isNullOrEmpty()) {
            tabLayout.setItems(null, null)
            adapter.notifyDataSetChanged()
            return
        }
        val specs = next.mapIndexed { i, item ->
            item.index = i
            tabItemSpec(item)
        }
        tabLayout.setItems(specs.toTypedArray(), viewPager)
        next.forEachIndexed { i, item -> item.titleView = tabLayout.getTextViewForItemAt(i) }
        adapter.notifyDataSetChanged()
    }

    /** `createTabItemSpec`: the title, and the icon of a `res://` drawable. */
    private fun tabItemSpec(item: TabViewItem): TabItemSpec {
        val spec = TabItemSpec()
        spec.title = item.title
        val icon = item.iconSource
        if (icon != null && icon.startsWith("res://")) {
            spec.iconId = context.resources.getIdentifier(icon.substring(6), "drawable", context.packageName)
        }
        return spec
    }

    /** `_loadUnloadTabItems`: the selected tab and its neighbours within the offscreen limit are loaded. */
    private fun loadUnloadTabItems(newIndex: Int) {
        val items = adapterItems ?: return
        val offside = if (tabsOnTop) offscreenTabLimit else 1
        val toLoad = (maxOf(0, newIndex - offside)..minOf(newIndex + offside, items.size - 1)).toSet()
        items.forEachIndexed { i, item -> if (i !in toLoad) item.unloadContent() }
        for (i in toLoad) if (isLoaded) items[i].loadContent()
    }

    /** `_getFragmentManager`: the fragments of the page or modal the tab view is in. */
    private fun fragmentManager(): FragmentManager {
        var v: View? = parent
        while (v != null) {
            if (v is Page) v.fragment?.let { if (it.isAdded) return it.childFragmentManager }
            Modal.records.values.firstOrNull { it.view === v }?.fragment?.let { if (it.isAdded) return it.childFragmentManager }
            v = v.parent
        }
        return NativeScriptActivity.current.supportFragmentManager
    }

    private fun paletteColor(name: String): Int {
        val id = context.resources.getIdentifier(name, "attr", context.packageName)
        if (id == 0) return 0
        val value = TypedValue()
        context.theme.resolveAttribute(id, value, true)
        return value.data
    }

    private fun defaultAccentColor(): Int = paletteColor("colorAccent").takeIf { it != 0 } ?: 0xff33b5e5.toInt()

    /** `FragmentPagerAdapter`: one fragment per item, attached and detached as the pager pages. */
    private inner class Adapter : PagerAdapter() {
        private var transaction: FragmentTransaction? = null
        private var primary: Fragment? = null
        private var transactionRunning = false

        override fun getCount(): Int = adapterItems?.size ?: 0

        override fun getPageTitle(position: Int): CharSequence = adapterItems?.getOrNull(position)?.title ?: ""

        override fun startUpdate(container: ViewGroup) {
            check(container.id != NativeView.NO_ID) { "ViewPager with adapter $this requires a view containerId" }
        }

        @Suppress("DEPRECATION")
        override fun instantiateItem(container: ViewGroup, position: Int): Any {
            val manager = fragmentManager()
            val t = transaction ?: manager.beginTransaction().also { transaction = it }
            val name = "android:viewpager:${container.id}:$position"
            var fragment = manager.findFragmentByTag(name)
            if (fragment != null) {
                t.attach(fragment)
            } else {
                fragment = TabFragment.newInstance(domId, position)
                t.add(container.id, fragment, name)
            }
            if (fragment !== primary) {
                fragment.setMenuVisibility(false)
                fragment.userVisibleHint = false
            }
            return fragment
        }

        override fun getItemPosition(item: Any): Int = if (adapterItems != null) POSITION_UNCHANGED else POSITION_NONE

        override fun destroyItem(container: ViewGroup, position: Int, item: Any) {
            val t = transaction ?: fragmentManager().beginTransaction().also { transaction = it }
            val fragment = item as Fragment
            t.detach(fragment)
            if (primary === fragment) primary = null
        }

        @Suppress("DEPRECATION")
        override fun setPrimaryItem(container: ViewGroup, position: Int, item: Any) {
            val fragment = item as Fragment
            if (fragment === primary) return
            primary?.let {
                it.setMenuVisibility(false)
                it.userVisibleHint = false
            }
            fragment.setMenuVisibility(true)
            fragment.userVisibleHint = true
            primary = fragment
            set("selectedIndex", position.toDouble())
            if (adapterItems?.getOrNull(position) != null) loadUnloadTabItems(selectedIndex.toInt())
        }

        override fun finishUpdate(container: ViewGroup) = commit()

        override fun isViewFromObject(view: NativeView, item: Any): Boolean = (item as Fragment).view === view

        override fun saveState(): android.os.Parcelable? {
            commit()
            return null
        }

        override fun restoreState(state: android.os.Parcelable?, loader: ClassLoader?) {}

        private fun commit() {
            val t = transaction ?: return
            if (transactionRunning) return
            transactionRunning = true
            t.commitNowAllowingStateLoss()
            transactionRunning = false
            transaction = null
        }
    }

    internal fun tabFragmentView(index: Int): NativeView? {
        val item = adapterItems?.getOrNull(index) ?: items.getOrNull(index) ?: return null
        item.canBeLoaded = true
        if (offscreenTabLimit > 0 || selectedIndex.toInt() == index) item.loadContent()
        val native = item.view?.nativeView ?: return null
        (native.parent as? ViewGroup)?.removeView(native)
        return native
    }

    internal fun tabFragmentDestroyed(index: Int) {
        val item = adapterItems?.getOrNull(index) ?: return
        item.canBeLoaded = false
        item.unloadContent()
    }

    companion object {
        private var nextId = 0
        private val tabViews = mutableListOf<WeakReference<TabView>>()

        internal fun byId(id: Int): TabView? = tabViews.firstNotNullOfOrNull { ref -> ref.get()?.takeIf { it.domId == id } }
    }
}

/** `selectedIndexChanged`'s event data. */
class SelectedIndexChange(val oldIndex: Double, val newIndex: Double)

/** `TabFragmentImplementation`: shows a tab item's view; a fragment the system recreates without its tab view shows nothing. */
class TabFragment : FragmentBase() {
    private var owner: TabView? = null
    private var index = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val args = requireArguments()
        owner = TabView.byId(args.getInt(TAB_ID))
        index = args.getInt(INDEX)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): NativeView? =
        owner?.tabFragmentView(index)

    override fun onDestroyView() {
        super.onDestroyView()
        owner?.tabFragmentDestroyed(index)
    }

    companion object {
        private const val TAB_ID = "_tabId"
        private const val INDEX = "_index"

        fun newInstance(tabId: Int, index: Int): TabFragment = TabFragment().also {
            it.arguments = Bundle().apply {
                putInt(TAB_ID, tabId)
                putInt(INDEX, index)
            }
        }
    }
}
