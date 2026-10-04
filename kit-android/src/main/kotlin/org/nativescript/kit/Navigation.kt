package org.nativescript.kit

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import androidx.appcompat.widget.AppCompatTextView
import androidx.appcompat.widget.Toolbar
import androidx.core.view.ViewCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.transition.Fade
import org.nativescript.widgets.ContentLayout
import org.nativescript.widgets.GridUnitType
import org.nativescript.widgets.LayoutBase as NativeLayoutBase

/**
 * `Page` from page/index.android: a two-row grid, the action bar above the
 * content, that pads itself by the system bars (`androidOverflowEdge: none`).
 */
open class Page : ContentView() {
    override val cssType: String get() = "Page"

    override val androidOverflowEdge: Int get() = NativeLayoutBase.OverflowEdgeNone

    internal var actionBar: ActionBar? = null
        private set
    internal var owner: Owner? = null

    val frame: Frame? get() = parent as? Frame

    override fun createNativeView(): NativeView {
        val grid = org.nativescript.widgets.GridLayout(context)
        grid.addRow(1, GridUnitType.auto)
        grid.addRow(1, GridUnitType.star)
        return grid
    }

    override fun initNativeView() {
        super.initNativeView()
        nativeView.setBackgroundColor(-1)
    }

    override fun addChild(child: View) {
        if (child is ActionBar) {
            actionBar = child
            child.set("row", 0.0)
            child.set("horizontalAlignment", "stretch")
            child.set("verticalAlignment", "top")
            addView(child)
            (nativeView as ViewGroup).addView(child.nativeView)
        } else {
            child.set("row", 1.0)
            setContent(child)
        }
    }

    override fun eachChildView(body: (View) -> Unit) {
        actionBar?.let(body)
        super.eachChildView(body)
    }

    /** `onLoaded`: a page without an action bar gets the default one, showing the app's name. */
    override fun onLoaded() {
        super.onLoaded()
        if (actionBar == null) addChild(ActionBar())
        actionBar?.update()
    }

    internal fun dispose() {
        owner?.dispose()
        owner = null
    }
}

/** `ActionItem` from action-bar/index.android: a toolbar menu item, shown as its icon or text. */
open class ActionItem : View() {

    override val ownEvents: Set<String> get() = setOf("tap")

    internal var actionBar: ActionBar? = null
    internal val itemId = ++lastItemId

    val text: String get() = toText(applied["text"]) ?: ""
    val icon: String? get() = toText(applied["icon"])
    internal val isVisible: Boolean get() = (toText(applied["visibility"])?.trim() ?: "visible") == "visible"
    internal val position: String get() = toText(applied["android.position"])?.trim() ?: "actionBar"
    internal val systemIcon: String? get() = toText(applied["android.systemIcon"])

    override fun propertyValueChanged(name: String, value: Any?) {
        super.propertyValueChanged(name, value)
        if (name == "text" || name == "icon" || name == "visibility") actionBar?.update()
    }

    override fun setProperty(name: String, value: Any?) {}

    override fun backgroundChanged() {}

    internal fun raiseTap() = emit("tap", null)

    private companion object {
        var lastItemId = 10000
    }
}

/** `NavigationButton`: the toolbar's navigation icon. */
open class NavigationButton : ActionItem() {
}

/** `ActionBar` from action-bar/index.android: an AppCompat Toolbar styled by the app theme's toolbarStyle. */
open class ActionBar : View() {
    override val cssType: String get() = "ActionBar"

    override val needsNativeDrawableFill: Boolean get() = true

    private val toolbar: Toolbar get() = nativeView as Toolbar
    private val page: Page? get() = parent as? Page
    private var updated = false

    var navigationButton: NavigationButton? = null
        private set
    private val actionItems = mutableListOf<ActionItem>()
    var titleView: View? = null
        private set

    override fun createNativeView(): NativeView = Toolbar(context)

    override fun initNativeView() {
        super.initNativeView()
        toolbar.setOnMenuItemClickListener { item -> onItemSelected(item.itemId) }
    }

    override fun addChild(child: View) {
        when (child) {
            is NavigationButton -> {
                navigationButton = child
                child.actionBar = this
                addView(child)
            }
            is ActionItem -> {
                actionItems.add(child)
                child.actionBar = this
                addView(child)
            }
            else -> {
                titleView = child
                addView(child)
                toolbar.addView(child.nativeView)
            }
        }
        update()
    }

    override fun eachChildView(body: (View) -> Unit) {
        for (item in actionItems.toList()) body(item)
        titleView?.let(body)
        navigationButton?.let(body)
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "title" -> if (updated) updateTitle()
            "color" -> {
                val color = toColor(value)
                toolbar.setTitleTextColor(color?.argb ?: defaultTitleTextColor())
            }
            "flat" -> ViewCompat.setElevation(toolbar, if (toBool(value) == true) 0f else 4 * Layout.density)
            else -> super.setProperty(name, value)
        }
    }

    /** `update`: hidden outside a frame; otherwise the items, title and navigation button again. */
    internal fun update() {
        val page = page ?: return
        updated = true
        val toolbar = toolbar
        if (page.frame == null) {
            toolbar.visibility = NativeView.GONE
            return
        }
        toolbar.visibility = NativeView.VISIBLE
        addActionItems()
        updateTitle()
        toolbar.logo = null
        updateNavigationButton()
    }

    private fun onItemSelected(id: Int): Boolean {
        val nav = navigationButton
        if (nav != null && id == android.R.id.home) {
            nav.raiseTap()
            return true
        }
        val item = actionItems.firstOrNull { it.itemId == id } ?: return false
        item.raiseTap()
        return true
    }

    private fun addActionItems() {
        val menu = toolbar.menu
        menu.clear()
        for (item in actionItems.filter { it.isVisible }) {
            val menuItem = menu.add(android.view.Menu.NONE, item.itemId, android.view.Menu.NONE, item.text)
            val systemIcon = item.systemIcon
            val icon = item.icon
            if (systemIcon != null) {
                systemResourceId(systemIcon).takeIf { it != 0 }?.let { menuItem.setIcon(it) }
            } else if (icon != null) {
                drawableResourceId(icon).takeIf { it != 0 }?.let { menuItem.setIcon(it) }
            }
            menuItem.setShowAsAction(
                when (item.position) {
                    "actionBarIfRoom" -> android.view.MenuItem.SHOW_AS_ACTION_IF_ROOM
                    "popup" -> android.view.MenuItem.SHOW_AS_ACTION_NEVER
                    else -> android.view.MenuItem.SHOW_AS_ACTION_ALWAYS
                },
            )
        }
    }

    private fun updateNavigationButton() {
        val nav = navigationButton
        if (nav != null && nav.isVisible) {
            val systemIcon = nav.systemIcon
            val icon = nav.icon
            if (systemIcon != null) {
                systemResourceId(systemIcon).takeIf { it != 0 }?.let { toolbar.setNavigationIcon(it) }
            } else if (icon != null) {
                drawableResourceId(icon).takeIf { it != 0 }?.let { toolbar.setNavigationIcon(it) }
            }
            toolbar.navigationContentDescription = nav.text.ifEmpty { null }
            toolbar.setNavigationOnClickListener { nav.raiseTap() }
        } else {
            toolbar.navigationIcon = null
        }
    }

    /** `getDrawableOrResourceId`: only `res://` icons resolve; images from files are not loaded. */
    private fun drawableResourceId(icon: String): Int =
        if (icon.startsWith("res://")) context.resources.getIdentifier(icon.substring(6), "drawable", context.packageName) else 0

    private fun systemResourceId(name: String): Int = android.content.res.Resources.getSystem().getIdentifier(name, "drawable", "android")

    private fun updateTitle() {
        if (titleView != null) return
        val title = toText(applied["title"])
        if (title != null) {
            toolbar.title = title
        } else {
            val info = context.applicationInfo
            context.packageManager.getApplicationLabel(info).let { toolbar.title = it }
        }
    }

    private fun defaultTitleTextColor(): Int {
        defaultTitleColor?.let { return it }
        val toolbar = toolbar
        var tv = titleTextView(toolbar)
        if (tv == null) {
            val title = toolbar.title
            toolbar.title = ""
            tv = titleTextView(toolbar)
            if (title != null) toolbar.title = title
        }
        return (tv?.textColors?.defaultColor ?: -570425344).also { defaultTitleColor = it }
    }

    private fun titleTextView(toolbar: Toolbar): AppCompatTextView? =
        (0 until toolbar.childCount).map { toolbar.getChildAt(it) }.firstOrNull { it is AppCompatTextView } as AppCompatTextView?

    private companion object {
        var defaultTitleColor: Int? = null
    }
}

/**
 * The fragment a frame shows a page in (`com.tns.FragmentClass`). A fragment
 * the system recreates without its page shows nothing.
 */
class PageFragment : Fragment() {
    internal var page: Page? = null
    internal var frame: Frame? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): NativeView? {
        val page = page ?: return null
        val frame = frame ?: return null
        val view = page.nativeView
        (view.parent as? ViewGroup)?.removeView(view)
        frame.attach(page)
        return view
    }
}

/**
 * `Frame` from frame/index.android: a backstack of pages, each shown by
 * replacing the fragment in the frame's container, with core's default
 * transition (a 150 ms fade) for every navigation after the first.
 */
open class Frame : View() {
    override val cssType: String get() = "Frame"

    private class Entry(val page: Page, var fragment: PageFragment, val tag: String)

    private var initialPage: Page? = null
    private var current: Entry? = null
    private val backstack = mutableListOf<Entry>()

    init {
        stack.add(this)
    }

    val canGoBack: Boolean get() = backstack.isNotEmpty()

    override fun createNativeView(): NativeView = ContentLayout(context)

    override fun initNativeView() {
        super.initNativeView()
        val layout = nativeView as ContentLayout
        layout.setOverflowEdge(NativeLayoutBase.OverflowEdgeIgnore)
        layout.id = NativeView.generateViewId()
        layout.addOnAttachStateChangeListener(object : android.view.View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(v: NativeView) {
                val page = initialPage
                if (current == null && page != null) navigateCore(page, animated = false)
            }

            override fun onViewDetachedFromWindow(v: NativeView) {}
        })
    }

    /** The first child is the page shown first; a non-page view is wrapped in one. */
    override fun addChild(child: View) {
        if (initialPage == null) initialPage = pageFor(child)
    }

    override fun eachChildView(body: (View) -> Unit) {
        current?.let { body(it.page) }
    }

    internal fun attach(page: Page) {
        if (page.parent == null) addView(page) else if (isLoaded) page.load()
    }

    /** Pushes the page `create` returns. Effects created while building it end when it is popped. */
    fun navigate(create: () -> View) {
        val owner = Owner(null)
        val page = pageFor(owner.run(create))
        page.owner = owner
        navigateCore(page, animated = current != null)
    }

    fun goBack() {
        val previous = backstack.removeLastOrNull() ?: return
        val leaving = current ?: return
        // `_reverseTransitions`: the leaving page fades out, the page returned to fades in again.
        leaving.fragment.exitTransition = fade(Fade.OUT)
        val fragment = createFragment(previous.page)
        fragment.enterTransition = fade(Fade.IN)
        allowTransitionOverlap(fragment)
        previous.fragment = fragment
        current = previous
        val manager = hostFragmentManager()
        manager.beginTransaction().replace(nativeView.id, fragment, previous.tag).commitAllowingStateLoss()
        removeView(leaving.page)
        leaving.page.dispose()
    }

    private fun navigateCore(page: Page, animated: Boolean) {
        val leaving = current
        val fragment = createFragment(page)
        val entry = Entry(page, fragment, "fragment${fragmentId++}[${backstack.size + (if (leaving != null) 1 else 0)}]")
        if (animated && leaving != null) {
            fragment.enterTransition = fade(Fade.IN)
            fragment.returnTransition = fade(Fade.OUT)
            fragment.exitTransition = fade(Fade.OUT)
            fragment.reenterTransition = fade(Fade.IN)
            leaving.fragment.exitTransition = fade(Fade.OUT)
            leaving.fragment.reenterTransition = fade(Fade.IN)
            allowTransitionOverlap(fragment)
            allowTransitionOverlap(leaving.fragment)
        }
        if (leaving != null) {
            backstack.add(leaving)
            leaving.page.unload()
        }
        current = entry
        val manager = hostFragmentManager()
        manager.beginTransaction().replace(nativeView.id, fragment, entry.tag).commitAllowingStateLoss()
    }

    /** `_getChildFragmentManager`: the fragments of the page the frame shows. */
    internal fun childFragmentManager(): FragmentManager? = current?.fragment?.takeIf { it.isAdded }?.childFragmentManager

    private fun createFragment(page: Page): PageFragment = PageFragment().also {
        it.page = page
        it.frame = this
    }

    private fun allowTransitionOverlap(fragment: Fragment) {
        fragment.allowEnterTransitionOverlap = true
        fragment.allowReturnTransitionOverlap = true
    }

    private fun fade(mode: Int): Fade = Fade(mode).apply {
        duration = 150
        interpolator = AccelerateDecelerateInterpolator()
    }

    companion object {
        private val stack = mutableListOf<Frame>()
        private var fragmentId = 0

        /** `Frame.topmost()`: the frame navigation goes to, the most recently created one. */
        fun topmost(): Frame? = stack.lastOrNull()

        /** Frames inside a closed modal are no longer navigation targets. */
        internal fun forget(root: View) {
            stack.removeAll { frame ->
                var v: View? = frame
                while (v != null && v !== root) v = v.parent
                v === root
            }
        }

        private fun pageFor(view: View): Page {
            if (view is Page) return view
            val page = Page()
            page.addChild(view)
            return page
        }
    }
}

/**
 * `_getFragmentManager`: a frame or tab view hosts its fragments in the
 * fragments of the next frame up, or of the modal it is in, else the activity's.
 */
internal fun View.hostFragmentManager(): FragmentManager {
    var view: View? = this
    var hostFound = false
    while (view != null) {
        if (view is Frame || view is TabView) {
            if (hostFound && view is Frame) view.childFragmentManager()?.let { return it }
            hostFound = true
        }
        val dialog = Modal.records.values.firstOrNull { it.view === view }?.fragment
        if (dialog != null && dialog.isAdded) return dialog.childFragmentManager
        view = view.parent
    }
    return NativeScriptActivity.current.supportFragmentManager
}
