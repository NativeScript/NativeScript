package org.nativescript.kit

import android.content.Context
import android.content.res.Resources
import android.graphics.drawable.Drawable
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.graphics.BlendModeColorFilterCompat
import androidx.core.graphics.BlendModeCompat
import org.nativescript.widgets.BorderDrawable
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.ViewHelper
import java.lang.ref.WeakReference
import kotlin.math.ceil

typealias NativeView = android.view.View

/** What an event handler receives: `args.eventName`, `args.object`, `args.value`. */
class EventData(val eventName: String, val `object`: View, val value: Any?)

/** `AndroidHelper` from view-helper/index.android. */
internal object AndroidHelper {
    fun setDrawableColor(color: Int, drawable: Drawable, mode: BlendModeCompat = BlendModeCompat.SRC_IN) {
        drawable.colorFilter = BlendModeColorFilterCompat.createBlendModeColorFilterCompat(color, mode)
    }

    fun clearDrawableColor(drawable: Drawable) {
        drawable.clearColorFilter()
    }

    fun getCopyOrDrawable(drawable: Drawable?, resources: Resources?): Drawable? {
        val state = drawable?.constantState ?: return drawable
        return if (resources != null) state.newDrawable(resources) else state.newDrawable()
    }
}

/**
 * `View` from @nativescript/core (view-base, view-common and view/index.android):
 * its properties as NativeScript resolves them (keyframe, then local, then
 * CSS, then inherited), applied to the native view as core's Android setters
 * do, once the view is loaded. Measuring and layout are the widgets AAR's,
 * through the layout params set here.
 */
open class View {
    /** `CSSType`: the type selectors match; classes core does not register have none. */
    open val cssType: String get() = ""

    private var native: NativeView? = null

    /** Created on first use, after the subclass is constructed. */
    val nativeView: NativeView
        get() {
            setUp()
            return native!!
        }

    val context: Context get() = NativeScriptActivity.context

    var parent: View? = null
        internal set

    var className: String = ""
        set(value) {
            field = value
            classes = value.split(' ', '\t', '\n').filter { it.isNotEmpty() }.toSet()
            if (isLoaded) onCssStateChange()
        }
    internal var classes: Set<String> = emptySet()

    /** Classes the application sets on its root view (`ns-root`, `ns-dark`). */
    var rootClasses: Set<String> = emptySet()
        set(value) {
            field = value
            if (isLoaded) onCssStateChange()
        }
    val cssClasses: Set<String> get() = if (rootClasses.isEmpty()) classes else classes + rootClasses
    val pseudoClasses: MutableSet<String> = linkedSetOf("normal")

    /** The views and keys (attribute names, `:pseudo-class`) this view's match depends on. */
    internal val cssSubscriptions = mutableListOf<Pair<WeakReference<View>, String>>()
    /** The views whose match depends on a key of this one. */
    internal val cssDependents = HashMap<String, MutableList<WeakReference<View>>>()
    internal var isUpdatingDynamicState = false

    private val locals = HashMap<String, Any>()
    /** Values a CSS keyframe animation sets; they win over local ones. */
    private val keyframeValues = HashMap<String, Any>()
    private var keyframeAnimations = listOf<KeyframeAnimation>()
    private var cssValues = HashMap<String, Any>()
    private var cssOrder = listOf<String>()
    /** Custom properties (`--name`) the matched rules declare, reset on every match. */
    internal var scopedCssVariables = HashMap<String, String>()
    internal val applied = HashMap<String, Any>()

    /**
     * NativeScript stores a view's values until it is loaded, then applies them
     * once (`applyAllNativeSetters`): view properties, then style properties,
     * each in the order a value was first set. CSS is matched at load.
     */
    var isLoaded = false
        private set
    private val pendingNames = mutableListOf<String>()
    private val pendingSet = HashSet<String>()
    /** A CSS re-match is one `_batchUpdate`: its values apply in the order they were set. */
    private var isBatching = false

    private val handlers = HashMap<String, MutableList<(EventData) -> Unit>>()

    private var defaultPaddingLeft = 0
    private var defaultPaddingTop = 0
    private var defaultPaddingRight = 0
    private var defaultPaddingBottom = 0
    private var isPaddingRelative = false
    private var paddingLeft: Int? = null
    private var paddingTop: Int? = null
    private var paddingRight: Int? = null
    private var paddingBottom: Int? = null
    val effectivePaddingLeft: Int get() = paddingLeft ?: defaultPaddingLeft
    val effectivePaddingTop: Int get() = paddingTop ?: defaultPaddingTop
    val effectivePaddingRight: Int get() = paddingRight ?: defaultPaddingRight
    val effectivePaddingBottom: Int get() = paddingBottom ?: defaultPaddingBottom

    internal var background = Background()
    private var cachedDrawable: Drawable? = null
    private var hasCachedDrawable = false

    /** Controls whose own drawable is tinted for a plain background color (Button, ActionBar). */
    protected open val needsNativeDrawableFill: Boolean get() = false

    private fun setUp() {
        if (native != null) return
        val view = createNativeView()
        native = view
        // `_setupUI`: the native view's own padding is the default, read before initNativeView.
        isPaddingRelative = view.isPaddingRelative
        defaultPaddingLeft = view.paddingLeft
        defaultPaddingTop = view.paddingTop
        defaultPaddingRight = view.paddingRight
        defaultPaddingBottom = view.paddingBottom
        initNativeView()
    }

    protected open fun createNativeView(): NativeView = NativeView(context)

    protected open fun initNativeView() {}

    // Children

    /** Adds a template child. Containers override; other views ignore children. */
    open fun addChild(child: View) {}

    open fun eachChildView(body: (View) -> Unit) {}

    internal fun addView(child: View) {
        child.parent = this
        for (name in inheritedProperties) child.refresh(name)
        if (isLoaded && shouldLoad(child)) child.load()
    }

    internal fun removeView(child: View) {
        child.unload()
        if (child.parent === this) child.parent = null
    }

    // Loading (view-base onLoaded / onUnloaded)

    fun load() {
        if (isLoaded) return
        setUp()
        TouchManager.viewLoading(this)
        matchCSS()
        isLoaded = true
        val names = pendingNames.toList()
        pendingNames.clear()
        pendingSet.clear()
        for (name in names) if (name !in styleProperties) setProperty(name, applied[name])
        for (name in names) if (name in styleProperties) setProperty(name, applied[name])
        onLoaded()
        attachGestures()
        eachChildView { if (shouldLoad(it)) it.load() }
        emit("loaded", null)
    }

    fun unload() {
        if (!isLoaded) return
        unsubscribeFromDynamicUpdates()
        stopKeyframeAnimations()
        isLoaded = false
        detachGestures()
        eachChildView { it.unload() }
        onUnloaded()
        emit("unloaded", null)
    }

    protected open fun onLoaded() {}
    protected open fun onUnloaded() {}

    /** `loadView`: whether a loaded parent loads this child now. */
    protected open fun shouldLoad(child: View): Boolean = true

    private fun deferApplication(name: String) {
        if (pendingSet.add(name)) pendingNames.add(name)
    }

    // Properties

    /** Sets a local property value by its NativeScript name; null unsets it. */
    fun set(name: String, value: Any?) {
        for ((longhand, v) in expandShorthand(name, value)) {
            if (!hasStyleAccessor(longhand)) continue
            if (v != null) locals[longhand] = v else locals.remove(longhand)
            refresh(longhand)
        }
    }

    /**
     * A template sets `view[name]`, which reaches a style property only through
     * an accessor NativeScript defines on the view's class; without one the
     * value lands on the JavaScript object and styles nothing.
     */
    private fun hasStyleAccessor(name: String): Boolean = when (name) {
        "backgroundInternal", "clipPath", "cornerShape", "fontInternal", "fontScaleInternal", "iconFontFamily", "paddingInternal", "placeholderColor", "zIndex" -> false
        "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariationSettings", "textDecoration" -> this is TextBase || this is Span || this is FormattedString
        "letterSpacing", "lineHeight", "maxLines", "textAlignment", "textOverflow", "textShadow", "textStroke", "whiteSpace" -> this is TextBase
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" -> this is TextBase || this is LayoutBase
        "alignContent", "alignItems", "flexDirection", "flexWrap", "justifyContent", "rowGap", "columnGap" -> this is FlexboxLayout
        "tintColor" -> this is Image
        "selectedBackgroundColor", "selectedTextColor" -> this is SegmentedBar
        "accessibilityStep" -> this is Slider
        else -> true
    }

    /**
     * `CssState.updateDynamicState`: keyframe animations stop, the matched values
     * are set (`setPropertyValues`: removed ones unset first, in their old order,
     * then the matched ones in cascade order), and the matched animations play.
     */
    private fun matchCSS() {
        stopKeyframeAnimations()
        val match = StyleSheet.app.match(this)
        // Plain values and variables first, then values with var() or calc()
        // (once the variables are known), then shorthands that held them.
        scopedCssVariables = HashMap()
        val next = mutableListOf<Pair<String, Any>>()
        val expressions = mutableListOf<Pair<String, String>>()
        val pending = mutableListOf<Pair<String, PendingShorthand>>()
        for ((name, value) in match.values) {
            when {
                value is PendingShorthand -> pending.add(Pair(name, value))
                isCssExpression(value) -> expressions.add(Pair(name, value as String))
                name.startsWith("--") -> scopedCssVariables[name] = toText(value) ?: ""
                else -> next.add(Pair(name, value))
            }
        }
        for ((name, text) in expressions) {
            val value = evaluateCssExpressions(text)
            if (name.startsWith("--")) scopedCssVariables[name] = value ?: "unset"
            else if (value != null) next.add(Pair(name, value))
        }
        val resolved = HashMap<String, List<Pair<String, Any?>>>()
        for ((name, shorthand) in pending) {
            val key = shorthand.shorthand + shorthand.value
            val longhands = resolved.getOrPut(key) { evaluateCssExpressions(shorthand.value)?.let { expandShorthand(shorthand.shorthand, it) } ?: emptyList() }
            longhands.firstOrNull { it.first == name }?.second?.let { next.add(Pair(name, it)) }
        }
        val nextNames = next.map { it.first }.toSet()
        val removed = cssOrder.filter { it !in nextNames }
        cssValues = HashMap(next.toMap())
        cssOrder = next.map { it.first }.distinct()
        for (name in removed) refresh(name)
        for (name in cssOrder) refresh(name)
        keyframeAnimations = match.animations
        for (animation in keyframeAnimations) animation.play(this)
        subscribe(match.changes)
    }

    private fun stopKeyframeAnimations() {
        if (keyframeAnimations.isEmpty()) return
        for (animation in keyframeAnimations) if (animation.isPlaying) animation.cancel()
        keyframeAnimations = emptyList()
        for (name in listOf("rotate", "rotateX", "rotateY", "scaleX", "scaleY", "translateX", "translateY", "backgroundColor", "opacity")) setKeyframe(name, null)
    }

    internal fun applyCSS() {
        isBatching = true
        try {
            matchCSS()
        } finally {
            isBatching = false
        }
        val names = pendingNames.toList()
        pendingNames.clear()
        pendingSet.clear()
        for (name in names) setProperty(name, applied[name])
    }

    internal fun setKeyframe(name: String, value: Any?) {
        if (value != null) keyframeValues[name] = value else keyframeValues.remove(name)
        refresh(name)
    }

    internal fun refresh(name: String) {
        var value: Any? = keyframeValues[name] ?: locals[name] ?: cssValues[name]
        if (value == null && name in inheritedProperties) value = parent?.applied?.get(name)
        value = coerce(name, value)
        val had = applied.containsKey(name)
        if (!had && (value == null || sameValue(value, defaultValue(name)))) return
        if (had && sameValue(value, applied[name])) return
        if (affectsLayout(name)) native?.requestLayout()
        if (value == null) applied.remove(name) else applied[name] = value
        propertyValueChanged(name, value)
        if (isLoaded && !isBatching) setProperty(name, value) else deferApplication(name)
        // A view property announces its change; a style property's event is the style object's.
        if (name !in styleProperties && hasHandlers(name + "Change")) emit(name + "Change", value)
        notifyCSSDependents(name)
        if (name in inheritedProperties) eachChildView { it.refresh(name) }
    }

    /** A property's `defaultValue`: setting it on a view that has no value changes nothing. */
    protected open fun defaultValue(name: String): Any? = null

    /** A `CoercibleProperty`'s `coerceValue`: the value kept is derived from the one set, and re-derived by `refresh`. */
    protected open fun coerce(name: String, value: Any?): Any? = value

    /**
     * The value a native control reports (user input): stored without being
     * written back, then announced as `<name>Change`, core's `nativeValueChange`.
     */
    internal fun nativeValueChange(name: String, value: Any) {
        if (sameValue(value, applied[name])) return
        locals[name] = value
        applied[name] = value
        propertyValueChanged(name, value)
        emit(name + "Change", value)
        if (affectsLayout(name)) native?.requestLayout()
        notifyCSSDependents(name)
    }

    /** A property core declares with `affectsLayout` on Android: a change requests a layout pass. */
    private fun affectsLayout(name: String): Boolean = when (name) {
        "text" -> this is TextBase
        "html" -> this is HtmlView
        "orientation" -> this is ScrollView
        else -> false
    }

    /**
     * A property's `valueChanged`: runs when the value changes, loaded or not,
     * unlike `setProperty` (the native setter), which waits for load.
     */
    protected open fun propertyValueChanged(name: String, value: Any?) {
        when (name) {
            "isEnabled" -> if (toBool(value) ?: true) removeVisualState("disabled") else addVisualState("disabled")
            "id" -> onCssStateChange()
            "checked" -> if (this is Switch) { if (toBool(value) ?: false) addVisualState("checked") else removeVisualState("checked") }
            // `effectivePadding*` and `backgroundInternal` follow their style properties at once, loaded or not.
            "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" -> {
                val px = value?.let { Length.parse(it, Length.zero).toDevicePixels(0.0).toInt() }
                when (name) {
                    "paddingTop" -> paddingTop = px
                    "paddingRight" -> paddingRight = px
                    "paddingBottom" -> paddingBottom = px
                    else -> paddingLeft = px
                }
            }
            "backgroundColor" -> {
                val color = toColor(value)?.argb
                if (color == null && background.color != null) background = background.copy(clearColor = true)
                background = background.copy(color = color)
            }
            "backgroundImage" -> background = background.copy(image = toText(value)?.let { LinearGradient.parse(it) })
            "boxShadow" -> background = background.copy(boxShadows = toText(value)?.let { BoxShadow.parseList(it) } ?: emptyList())
            "clipPath" -> background = background.copy(clipPath = toText(value)?.takeIf { it.isNotBlank() && it != "none" })
            "borderTopWidth" -> background = background.copy(borderTopWidth = borderPx(value))
            "borderRightWidth" -> background = background.copy(borderRightWidth = borderPx(value))
            "borderBottomWidth" -> background = background.copy(borderBottomWidth = borderPx(value))
            "borderLeftWidth" -> background = background.copy(borderLeftWidth = borderPx(value))
            "borderTopColor" -> background = background.copy(borderTopColor = toColor(value)?.argb)
            "borderRightColor" -> background = background.copy(borderRightColor = toColor(value)?.argb)
            "borderBottomColor" -> background = background.copy(borderBottomColor = toColor(value)?.argb)
            "borderLeftColor" -> background = background.copy(borderLeftColor = toColor(value)?.argb)
            "borderTopLeftRadius" -> background = background.copy(borderTopLeftRadius = borderPx(value))
            "borderTopRightRadius" -> background = background.copy(borderTopRightRadius = borderPx(value))
            "borderBottomRightRadius" -> background = background.copy(borderBottomRightRadius = borderPx(value))
            "borderBottomLeftRadius" -> background = background.copy(borderBottomLeftRadius = borderPx(value))
        }
    }

    /** Applies an effective value; subclasses handle their own names and pass the rest up. */
    protected open fun setProperty(name: String, value: Any?) {
        when (name) {
            "width" -> setPercentLength(value, -1, ViewHelper::setWidth, ViewHelper::setWidthPercent)
            "height" -> setPercentLength(value, -1, ViewHelper::setHeight, ViewHelper::setHeightPercent)
            "maxWidth" -> setPercentLength(value, -1, ViewHelper::setMaxWidth, ViewHelper::setMaxWidthPercent)
            "maxHeight" -> setPercentLength(value, -1, ViewHelper::setMaxHeight, ViewHelper::setMaxHeightPercent)
            "minWidth" -> setMinLength(value, true)
            "minHeight" -> setMinLength(value, false)
            "marginTop" -> setPercentLength(value, 0, ViewHelper::setMarginTop, ViewHelper::setMarginTopPercent)
            "marginRight" -> setPercentLength(value, 0, ViewHelper::setMarginRight, ViewHelper::setMarginRightPercent)
            "marginBottom" -> setPercentLength(value, 0, ViewHelper::setMarginBottom, ViewHelper::setMarginBottomPercent)
            "marginLeft" -> setPercentLength(value, 0, ViewHelper::setMarginLeft, ViewHelper::setMarginLeftPercent)
            "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" -> applyPadding()
            "horizontalAlignment" -> setHorizontalAlignment((value as? String)?.trim() ?: "stretch")
            "verticalAlignment" -> {
                val v = (value as? String)?.trim()?.lowercase() ?: "stretch"
                setVerticalAlignment(if (v == "center") "middle" else v)
            }
            "backgroundColor", "backgroundImage", "boxShadow", "clipPath",
            "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
            "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor",
            "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius" -> backgroundChanged()
            "opacity" -> nativeView.alpha = (toDouble(value) ?: 1.0).toFloat()
            "visibility" -> nativeView.visibility = when ((value as? String)?.trim()?.lowercase()) {
                "hidden" -> NativeView.INVISIBLE
                "collapse", "collapsed" -> NativeView.GONE
                else -> NativeView.VISIBLE
            }
            "isEnabled" -> nativeView.isEnabled = toBool(value) ?: true
            "isUserInteractionEnabled" -> {
                val enabled = toBool(value) ?: true
                nativeView.isClickable = enabled
                nativeView.isFocusable = enabled
            }
            "row" -> updateCommonLayoutParams { it.row = maxOf(0, toInt(value) ?: 0) }
            "col", "column" -> updateCommonLayoutParams { it.column = maxOf(0, toInt(value) ?: 0) }
            "rowSpan" -> updateCommonLayoutParams { it.rowSpan = maxOf(1, toInt(value) ?: 1) }
            "colSpan", "columnSpan" -> updateCommonLayoutParams { it.columnSpan = maxOf(1, toInt(value) ?: 1) }
            "left" -> updateCommonLayoutParams { it.left = Length.parse(value, Length.zero).toDevicePixels(0.0).toInt() }
            "top" -> updateCommonLayoutParams { it.top = Length.parse(value, Length.zero).toDevicePixels(0.0).toInt() }
            "dock" -> updateCommonLayoutParams {
                it.dock = when (toText(value)?.trim()) {
                    "left" -> org.nativescript.widgets.Dock.left
                    "top" -> org.nativescript.widgets.Dock.top
                    "right" -> org.nativescript.widgets.Dock.right
                    "bottom" -> org.nativescript.widgets.Dock.bottom
                    else -> org.nativescript.widgets.Dock.left
                }
            }
            "order" -> updateFlexLayoutParams { it.order = toInt(value) ?: 1 }
            "flexGrow" -> updateFlexLayoutParams { it.flexGrow = toDouble(value)?.toFloat() ?: 0f }
            "flexShrink" -> updateFlexLayoutParams { it.flexShrink = toDouble(value)?.toFloat() ?: 1f }
            "flexWrapBefore" -> updateFlexLayoutParams { it.wrapBefore = toBool(value) ?: false }
            "alignSelf" -> updateFlexLayoutParams { it.alignSelf = FlexboxLayout.alignSelf(value) }
            "rotate" -> ViewHelper.setRotate(nativeView, (toDouble(value) ?: 0.0).toFloat())
            "rotateX" -> ViewHelper.setRotateX(nativeView, (toDouble(value) ?: 0.0).toFloat())
            "rotateY" -> ViewHelper.setRotateY(nativeView, (toDouble(value) ?: 0.0).toFloat())
            "perspective" -> ViewHelper.setPerspective(nativeView, ((toDouble(value) ?: 1000.0) * Layout.density).toFloat())
            "scaleX" -> ViewHelper.setScaleX(nativeView, (toDouble(value) ?: 1.0).toFloat())
            "scaleY" -> ViewHelper.setScaleY(nativeView, (toDouble(value) ?: 1.0).toFloat())
            "translateX" -> ViewHelper.setTranslateX(nativeView, Layout.toDevicePixels(toDouble(value) ?: 0.0).toFloat())
            "translateY" -> ViewHelper.setTranslateY(nativeView, Layout.toDevicePixels(toDouble(value) ?: 0.0).toFloat())
            "originX" -> org.nativescript.widgets.OriginPoint.setX(nativeView, (toDouble(value) ?: 0.5).toFloat())
            "originY" -> org.nativescript.widgets.OriginPoint.setY(nativeView, (toDouble(value) ?: 0.5).toFloat())
            "zIndex" -> ViewHelper.setZIndex(nativeView, (toDouble(value) ?: 0.0).toFloat())
            "direction" -> nativeView.layoutDirection = when (toText(value)?.trim()) {
                "ltr" -> NativeView.LAYOUT_DIRECTION_LTR
                "rtl" -> NativeView.LAYOUT_DIRECTION_RTL
                else -> NativeView.LAYOUT_DIRECTION_LOCALE
            }
        }
    }

    private fun borderPx(value: Any?): Float = Length.parse(value, Length.zero).toDevicePixels(0.0).toFloat()

    internal val effectiveBorderLeftWidth: Int get() = background.borderLeftWidth.toInt()
    internal val effectiveBorderTopWidth: Int get() = background.borderTopWidth.toInt()
    internal val effectiveBorderRightWidth: Int get() = background.borderRightWidth.toInt()
    internal val effectiveBorderBottomWidth: Int get() = background.borderBottomWidth.toInt()

    /** `createNativePercentLengthProperty`: auto and unset write `auto`, dips round to pixels, percents go as fractions. */
    private fun setPercentLength(value: Any?, auto: Int, setPixels: (NativeView, Int) -> Unit, setPercent: ((NativeView, Float) -> Unit)?) {
        when (val length = if (value == null) Length.Auto else Length.parse(value, Length.Auto)) {
            Length.Auto -> setPixels(nativeView, auto)
            is Length.Percent -> setPercent?.invoke(nativeView, length.value.toFloat())
            else -> setPixels(nativeView, length.toDevicePixels().toInt())
        }
    }

    /** `minWidthProperty.setNative`: a flexbox child's minimum lives in its flex layout params. */
    private fun setMinLength(value: Any?, width: Boolean) {
        val px = Length.parse(value, Length.zero).toDevicePixels(0.0).toInt()
        val parent = parent
        if (parent is FlexboxLayout) {
            val lp = nativeView.layoutParams as? org.nativescript.widgets.FlexboxLayout.LayoutParams
            if (lp != null) {
                if (width) lp.minWidth = px else lp.minHeight = px
                nativeView.layoutParams = lp
            }
            return
        }
        if (width) ViewHelper.setMinWidth(nativeView, px) else ViewHelper.setMinHeight(nativeView, px)
    }

    private fun updateCommonLayoutParams(update: (CommonLayoutParams) -> Unit) {
        val view = nativeView
        val lp = view.layoutParams ?: CommonLayoutParams()
        if (lp is CommonLayoutParams) {
            update(lp)
            view.layoutParams = lp
        }
    }

    /** Flex item properties only reach a view whose params are already a flexbox's, as in core. */
    private fun updateFlexLayoutParams(update: (org.nativescript.widgets.FlexboxLayout.LayoutParams) -> Unit) {
        val view = nativeView
        val lp = view.layoutParams ?: org.nativescript.widgets.FlexboxLayout.LayoutParams()
        if (lp is org.nativescript.widgets.FlexboxLayout.LayoutParams) {
            update(lp)
            view.layoutParams = lp
        }
    }

    private fun setHorizontalAlignment(value: String) {
        val view = nativeView
        val lp = view.layoutParams ?: CommonLayoutParams()
        if (lp !is FrameLayout.LayoutParams) return
        val vertical = lp.gravity and Gravity.VERTICAL_GRAVITY_MASK
        val rtl = toText(applied["direction"])?.trim() == "rtl"
        when (value) {
            "start" -> lp.gravity = (if (rtl) Gravity.RIGHT else Gravity.LEFT) or vertical
            "left" -> lp.gravity = Gravity.LEFT or vertical
            "center" -> lp.gravity = Gravity.CENTER_HORIZONTAL or vertical
            "right" -> lp.gravity = Gravity.RIGHT or vertical
            "end" -> lp.gravity = (if (rtl) Gravity.LEFT else Gravity.RIGHT) or vertical
            "stretch" -> lp.gravity = Gravity.FILL_HORIZONTAL or vertical
        }
        view.layoutParams = lp
    }

    private fun setVerticalAlignment(value: String) {
        val view = nativeView
        val lp = view.layoutParams ?: CommonLayoutParams()
        if (lp !is FrameLayout.LayoutParams) return
        val horizontal = lp.gravity and Gravity.HORIZONTAL_GRAVITY_MASK
        val wrap = ViewGroup.LayoutParams.WRAP_CONTENT
        when (value) {
            "top" -> { lp.gravity = Gravity.TOP or horizontal; if (lp.height < 0) lp.height = wrap }
            "middle" -> { lp.gravity = Gravity.CENTER_VERTICAL or horizontal; if (lp.height < 0) lp.height = wrap }
            "bottom" -> { lp.gravity = Gravity.BOTTOM or horizontal; if (lp.height < 0) lp.height = wrap }
            "stretch" -> { lp.gravity = Gravity.FILL_VERTICAL or horizontal; if (lp.height < 0) lp.height = ViewGroup.LayoutParams.MATCH_PARENT }
        }
        view.layoutParams = lp
    }

    /** `Property.isSet`: whether a value was set locally. */
    internal fun isSet(name: String): Boolean = locals.containsKey(name)

    internal fun setPropertyNow(name: String) = setProperty(name, applied[name])

    /** `paddingInternalProperty.setNative`, which only layouts and text views implement. */
    protected open fun applyPadding() {}

    // Background (styling/background.android and onBackgroundOrBorderPropertyChanged)

    /** `backgroundInternalProperty.setNative`; controls that style themselves differently override. */
    protected open fun backgroundChanged() {
        redrawBackground()
    }

    private fun redrawBackground() {
        val view = nativeView
        val bg = background
        val drawable = view.background
        val isBorderDrawable = drawable is BorderDrawable
        if (!hasCachedDrawable) {
            cachedDrawable = drawable
            hasCachedDrawable = true
        }
        if (hadBoxShadow && bg.boxShadows.isEmpty() && drawable is org.nativescript.widgets.BoxShadowDrawable) view.background = cachedDrawable
        val color = bg.color
        val onlyColor = !bg.hasBorderWidth && !bg.hasBorderRadius && bg.boxShadows.isEmpty() && bg.clipPath == null && bg.image == null && color != null
        if (onlyColor) {
            var target = drawable
            if (isBorderDrawable) {
                target = cachedDrawable?.let { AndroidHelper.getCopyOrDrawable(it, view.resources) }
                view.background = target
            }
            if (needsNativeDrawableFill && target != null) {
                target.mutate()
                AndroidHelper.setDrawableColor(color!!, target)
                target.invalidateSelf()
            } else {
                view.setBackgroundColor(color!!)
            }
        } else {
            if (bg.clearColor) {
                if (drawable != null) {
                    drawable.mutate()
                    AndroidHelper.clearDrawableColor(drawable)
                    drawable.invalidateSelf()
                } else {
                    view.setBackgroundColor(-1)
                }
            }
            if (bg.isEmpty) {
                if (drawable !== cachedDrawable) view.background = cachedDrawable
            } else if (drawable is BorderDrawable) {
                refreshBorderDrawable(drawable)
            } else {
                val borderDrawable = BorderDrawable(Layout.density, toString())
                refreshBorderDrawable(borderDrawable)
                view.background = borderDrawable
            }
        }
        if (bg.boxShadows.isNotEmpty()) drawBoxShadows(bg.boxShadows)
        hadBoxShadow = bg.boxShadows.isNotEmpty()
        val left = ceil((effectiveBorderLeftWidth + effectivePaddingLeft).toDouble()).toInt()
        val top = ceil((effectiveBorderTopWidth + effectivePaddingTop).toDouble()).toInt()
        val right = ceil((effectiveBorderRightWidth + effectivePaddingRight).toDouble()).toInt()
        val bottom = ceil((effectiveBorderBottomWidth + effectivePaddingBottom).toDouble()).toInt()
        if (isPaddingRelative) view.setPaddingRelative(left, top, right, bottom) else view.setPadding(left, top, right, bottom)
        background = background.copy(clearColor = false)
    }

    private var hadBoxShadow = false

    /** `_drawBoxShadow`: the widgets' shadow drawable, six ints per shadow in device pixels. */
    private fun drawBoxShadows(shadows: List<BoxShadow>) {
        val values = IntArray(shadows.size * 6)
        for ((i, s) in shadows.withIndex()) {
            values[i * 6] = s.color
            values[i * 6 + 1] = s.spreadRadius
            values[i * 6 + 2] = s.blurRadius
            values[i * 6 + 3] = s.offsetX
            values[i * 6 + 4] = s.offsetY
            values[i * 6 + 5] = if (s.inset) 1 else 0
        }
        org.nativescript.widgets.Utils.drawBoxShadow(nativeView, values)
    }

    private fun refreshBorderDrawable(drawable: BorderDrawable) {
        val bg = background
        val black = -16777216
        val gradient = bg.image?.toNative()
        drawable.refresh(
            bg.borderTopColor ?: black, bg.borderRightColor ?: black, bg.borderBottomColor ?: black, bg.borderLeftColor ?: black,
            bg.borderTopWidth, bg.borderRightWidth, bg.borderBottomWidth, bg.borderLeftWidth,
            bg.borderTopLeftRadius, bg.borderTopRightRadius, bg.borderBottomRightRadius, bg.borderBottomLeftRadius,
            bg.clipPath, bg.color ?: 0, null, null, gradient, nativeView.context, null, null, null, null, null,
        )
    }

    // Events

    private val gestureObservers = java.util.TreeMap<Double, MutableList<GesturesObserver>>()
    private var touchListenerIsSet = false

    /** Events a view class declares itself (Button's `tap`): they are not gestures. */
    protected open val ownEvents: Set<String> get() = emptySet()

    /** Subscribes to an event: a gesture (`tap`, `pan`), or a property change such as `textChange`. */
    fun on(event: String, handler: (EventData) -> Unit) {
        val type = gestureType(event)
        if (type != null && event !in ownEvents) {
            val observer = GesturesObserver(this, type) { payload ->
                handler(EventData(event, this, payload))
                Microtasks.checkpoint()
            }
            gestureObservers.getOrPut(type) { mutableListOf() }.add(observer)
            if (isLoaded) {
                observer.attach()
                setOnTouchListener()
            }
            return
        }
        handlers.getOrPut(event) { mutableListOf() }.add(handler)
        if (isLoaded) eventSubscribed(event)
    }

    /** `off(event)` without a callback: every handler of the event goes. */
    fun off(event: String) {
        val type = gestureType(event)
        if (type != null && event !in ownEvents) gestureObservers.remove(type)?.forEach { it.detach() }
        else handlers.remove(event)
    }

    /** A subscription to one of the view's own events, once it is loaded; controls with native listeners override. */
    protected open fun eventSubscribed(event: String) {}

    internal fun hasGestureObservers(type: Double): Boolean = gestureObservers[type]?.isNotEmpty() == true

    internal fun hasAnyGestureObservers(): Boolean = gestureObservers.isNotEmpty()

    internal fun hasHandlers(event: String): Boolean = handlers[event]?.isNotEmpty() == true

    /** `setOnTouchListener`: touches reach this view's observers, then each ancestor's. */
    private fun setOnTouchListener() {
        if (touchListenerIsSet || gestureObservers.isEmpty()) return
        val view = nativeView
        view.setOnTouchListener { v, event ->
            handleGestureTouch(event)
            v.onTouchEvent(event)
        }
        touchListenerIsSet = true
        view.isClickable = toBool(applied["isUserInteractionEnabled"]) ?: true
    }

    internal fun handleGestureTouch(event: android.view.MotionEvent) {
        for (observers in gestureObservers.values.toList()) for (observer in observers.toList()) observer.onTouchEvent(event)
        parent?.handleGestureTouch(event)
    }

    private fun attachGestures() {
        for (observers in gestureObservers.values) for (observer in observers) observer.attach()
        setOnTouchListener()
        for (event in handlers.keys) eventSubscribed(event)
    }

    private fun detachGestures() {
        for (observers in gestureObservers.values) for (observer in observers) observer.detach()
    }

    internal fun emit(event: String, value: Any?) {
        val list = handlers[event] ?: return
        val data = EventData(event, this, value)
        dispatchDepth++
        try {
            for (handler in list.toList()) handler(data)
        } finally {
            dispatchDepth--
        }
        // The outermost handler is a JavaScript task: the promise jobs it queued run before anything else does.
        if (dispatchDepth == 0) Microtasks.checkpoint()
    }

    /** `PseudoClassHandler`: a view starts tracking a native state once a selector depends on it. */
    internal open fun observePseudoClass(name: String, on: Boolean) {}

    override fun toString(): String = "${javaClass.simpleName}(${System.identityHashCode(this)})"

    companion object {
        private var dispatchDepth = 0

        internal val inheritedProperties = setOf(
            "color", "fontFamily", "fontSize", "fontStyle", "fontWeight", "textAlignment", "textTransform",
            "whiteSpace", "letterSpacing", "lineHeight", "textShadow", "textStroke", "tintColor", "direction",
            "selectedBackgroundColor", "selectedTextColor",
        )

        /** The names NativeScript registers as style (CSS) properties; every other name is a view property. */
        internal val styleProperties = setOf(
            "accessibilityLanguage", "accessibilityLiveRegion", "accessibilityRole", "accessibilityState", "accessibilityStep", "accessible",
            "alignContent", "alignItems", "alignSelf", "androidContentInsetLeft", "androidContentInsetRight", "androidDynamicElevationOffset",
            "androidElevation", "androidSelectedTabHighlightColor", "androidStatusBarBackground", "backgroundColor", "backgroundImage",
            "backgroundInternal", "backgroundPosition", "backgroundRepeat", "backgroundSize", "borderBottomColor", "borderBottomLeftRadius",
            "borderBottomRightRadius", "borderBottomWidth", "borderLeftColor", "borderLeftWidth", "borderRightColor", "borderRightWidth",
            "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius", "borderTopWidth", "boxShadow", "clipPath", "color", "columnGap",
            "cornerShape", "direction", "flexDirection", "flexGrow", "flexShrink", "flexWrap", "flexWrapBefore", "fontFamily", "fontInternal",
            "fontScaleInternal", "fontSize", "fontStyle", "fontVariationSettings", "fontWeight", "height", "horizontalAlignment", "iconFontFamily",
            "iosAccessibilityAdjustsFontSize", "iosAccessibilityMaxFontScale", "iosAccessibilityMinFontScale", "justifyContent", "letterSpacing",
            "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "maxHeight", "maxLines", "maxWidth", "minHeight", "minWidth",
            "opacity", "order", "paddingBottom", "paddingInternal", "paddingLeft", "paddingRight", "paddingTop", "perspective", "placeholderColor",
            "rotate", "rotateX", "rotateY", "rowGap", "scaleX", "scaleY", "selectedBackgroundColor", "selectedTabTextColor", "selectedTextColor",
            "separatorColor", "statusBarStyle", "tabBackgroundColor", "tabTextColor", "tabTextFontSize", "textAlignment", "textDecoration",
            "textOverflow", "textShadow", "textStroke", "textTransform", "tintColor", "translateX", "translateY", "verticalAlignment",
            "visibility", "whiteSpace", "width", "zIndex", "textWrap",
        )

        /** `getNodePreviousDirectSibling`: siblings exist only in a layout. */
        fun previousSibling(view: View): View? {
            val parent = view.parent as? LayoutBase ?: return null
            val index = parent.subViews.indexOfFirst { it === view }
            return if (index > 0) parent.subViews[index - 1] else null
        }

        /** `eachNodePreviousGeneralSibling`: nearest first. */
        fun previousSiblings(view: View): List<View> {
            val parent = view.parent as? LayoutBase ?: return emptyList()
            val index = parent.subViews.indexOfFirst { it === view }
            return if (index < 0) emptyList() else parent.subViews.subList(0, index).asReversed()
        }
    }
}
