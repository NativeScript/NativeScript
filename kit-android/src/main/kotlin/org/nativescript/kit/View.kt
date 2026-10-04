package org.nativescript.kit

import android.content.Context
import android.content.res.Resources
import android.graphics.drawable.Drawable
import android.view.GestureDetector
import android.view.Gravity
import android.view.MotionEvent
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.graphics.BlendModeColorFilterCompat
import androidx.core.graphics.BlendModeCompat
import androidx.core.view.GestureDetectorCompat
import org.nativescript.widgets.BorderDrawable
import org.nativescript.widgets.CommonLayoutParams
import org.nativescript.widgets.ViewHelper
import kotlin.math.ceil

typealias NativeView = android.view.View

/** What an event handler receives: `args.eventName`, `args.object`, `args.value`. */
class EventData(val eventName: String, val `object`: View, val value: Any?)

/** `Background` from styling/background-common: device pixels and ARGB ints. */
internal data class Background(
    val color: Int? = null,
    val borderTopColor: Int? = null,
    val borderRightColor: Int? = null,
    val borderBottomColor: Int? = null,
    val borderLeftColor: Int? = null,
    val borderTopWidth: Float = 0f,
    val borderRightWidth: Float = 0f,
    val borderBottomWidth: Float = 0f,
    val borderLeftWidth: Float = 0f,
    val borderTopLeftRadius: Float = 0f,
    val borderTopRightRadius: Float = 0f,
    val borderBottomRightRadius: Float = 0f,
    val borderBottomLeftRadius: Float = 0f,
) {
    val hasBorderWidth: Boolean get() = borderTopWidth > 0 || borderRightWidth > 0 || borderBottomWidth > 0 || borderLeftWidth > 0
    val hasBorderRadius: Boolean get() = borderTopLeftRadius > 0 || borderTopRightRadius > 0 || borderBottomRightRadius > 0 || borderBottomLeftRadius > 0
    val isEmpty: Boolean get() = color == null && !hasBorderWidth && !hasBorderRadius
}

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
 * its properties as NativeScript resolves them (local, then CSS, then
 * inherited) and applied to the native view as core's Android setters do.
 * Measuring and layout are the widgets AAR's, through the layout params set here.
 */
open class View {
    open val cssType: String get() = "View"

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
            if (native == null) setUp() else applyCSS()
        }
    internal var classes: Set<String> = emptySet()

    private val locals = HashMap<String, Any>()
    private var cssValues: Map<String, Any?> = emptyMap()
    internal val applied = HashMap<String, Any>()

    private val handlers = HashMap<String, MutableList<(EventData) -> Unit>>()
    private var gestureDetector: GestureDetectorCompat? = null

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
    private var clearBackgroundColor = false
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
        applyCSS()
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
    }

    internal fun removeView(child: View) {
        if (child.parent === this) child.parent = null
    }

    // Properties

    /** Sets a local property value by its NativeScript name; null unsets it. */
    fun set(name: String, value: Any?) {
        setUp()
        for ((longhand, v) in expandShorthand(name, value)) {
            if (v != null) locals[longhand] = v else locals.remove(longhand)
            refresh(longhand)
        }
    }

    internal fun applyCSS() {
        val next = StyleSheet.app.values(this)
        val names = LinkedHashSet(next.keys).apply { addAll(cssValues.keys) }
        cssValues = next
        for (name in names) refresh(name)
    }

    internal fun refresh(name: String) {
        setUp()
        var value: Any? = locals[name] ?: cssValues[name]
        if (value == null && name in inheritedProperties) value = parent?.applied?.get(name)
        val had = applied.containsKey(name)
        if (!had && value == null) return
        if (had && value == applied[name]) return
        if (value == null) applied.remove(name) else applied[name] = value
        setProperty(name, value)
        if (name in inheritedProperties) eachChildView { it.refresh(name) }
    }

    /**
     * A value the native control reports (user input): stored without being
     * written back, then announced as `<name>Change`, core's `nativeValueChange`.
     */
    internal fun nativeValueChange(name: String, value: Any) {
        if (value == applied[name]) return
        locals[name] = value
        applied[name] = value
        emit(name + "Change", value)
    }

    /** Applies an effective value; subclasses handle their own names and pass the rest up. */
    protected open fun setProperty(name: String, value: Any?) {
        when (name) {
            "width" -> setPercentLength(value, -1, ViewHelper::setWidth, ViewHelper::setWidthPercent)
            "height" -> setPercentLength(value, -1, ViewHelper::setHeight, ViewHelper::setHeightPercent)
            "maxWidth" -> setPercentLength(value, -1, ViewHelper::setMaxWidth, ViewHelper::setMaxWidthPercent)
            "maxHeight" -> setPercentLength(value, -1, ViewHelper::setMaxHeight, ViewHelper::setMaxHeightPercent)
            "minWidth" -> setPercentLength(value, 0, ViewHelper::setMinWidth, null)
            "minHeight" -> setPercentLength(value, 0, ViewHelper::setMinHeight, null)
            "marginTop" -> setPercentLength(value, 0, ViewHelper::setMarginTop, ViewHelper::setMarginTopPercent)
            "marginRight" -> setPercentLength(value, 0, ViewHelper::setMarginRight, ViewHelper::setMarginRightPercent)
            "marginBottom" -> setPercentLength(value, 0, ViewHelper::setMarginBottom, ViewHelper::setMarginBottomPercent)
            "marginLeft" -> setPercentLength(value, 0, ViewHelper::setMarginLeft, ViewHelper::setMarginLeftPercent)
            "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" -> {
                val px = value?.let { Length.parse(it, Length.zero).toDevicePixels(0.0).toInt() }
                when (name) {
                    "paddingTop" -> paddingTop = px
                    "paddingRight" -> paddingRight = px
                    "paddingBottom" -> paddingBottom = px
                    else -> paddingLeft = px
                }
                applyPadding()
            }
            "horizontalAlignment" -> setHorizontalAlignment((value as? String)?.trim() ?: "stretch")
            "verticalAlignment" -> {
                val v = (value as? String)?.trim()?.lowercase() ?: "stretch"
                setVerticalAlignment(if (v == "center") "middle" else v)
            }
            "backgroundColor" -> {
                val color = toColor(value)?.argb
                if (color == null && background.color != null) clearBackgroundColor = true
                background = background.copy(color = color)
                backgroundChanged()
            }
            "borderTopWidth" -> { background = background.copy(borderTopWidth = borderPx(value)); backgroundChanged() }
            "borderRightWidth" -> { background = background.copy(borderRightWidth = borderPx(value)); backgroundChanged() }
            "borderBottomWidth" -> { background = background.copy(borderBottomWidth = borderPx(value)); backgroundChanged() }
            "borderLeftWidth" -> { background = background.copy(borderLeftWidth = borderPx(value)); backgroundChanged() }
            "borderTopColor" -> { background = background.copy(borderTopColor = toColor(value)?.argb); backgroundChanged() }
            "borderRightColor" -> { background = background.copy(borderRightColor = toColor(value)?.argb); backgroundChanged() }
            "borderBottomColor" -> { background = background.copy(borderBottomColor = toColor(value)?.argb); backgroundChanged() }
            "borderLeftColor" -> { background = background.copy(borderLeftColor = toColor(value)?.argb); backgroundChanged() }
            "borderTopLeftRadius" -> { background = background.copy(borderTopLeftRadius = borderPx(value)); backgroundChanged() }
            "borderTopRightRadius" -> { background = background.copy(borderTopRightRadius = borderPx(value)); backgroundChanged() }
            "borderBottomRightRadius" -> { background = background.copy(borderBottomRightRadius = borderPx(value)); backgroundChanged() }
            "borderBottomLeftRadius" -> { background = background.copy(borderBottomLeftRadius = borderPx(value)); backgroundChanged() }
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
            "order" -> updateFlexLayoutParams { it.order = toInt(value) ?: 1 }
            "flexGrow" -> updateFlexLayoutParams { it.flexGrow = toDouble(value)?.toFloat() ?: 0f }
            "flexShrink" -> updateFlexLayoutParams { it.flexShrink = toDouble(value)?.toFloat() ?: 1f }
            "flexWrapBefore" -> updateFlexLayoutParams { it.wrapBefore = toBool(value) ?: false }
            "alignSelf" -> updateFlexLayoutParams { it.alignSelf = FlexboxLayout.alignSelf(value) }
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
        when (value) {
            "start", "left" -> lp.gravity = Gravity.LEFT or vertical
            "center" -> lp.gravity = Gravity.CENTER_HORIZONTAL or vertical
            "end", "right" -> lp.gravity = Gravity.RIGHT or vertical
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
        val color = bg.color
        if (!bg.hasBorderWidth && !bg.hasBorderRadius && color != null) {
            var target = drawable
            if (isBorderDrawable) {
                target = cachedDrawable?.let { AndroidHelper.getCopyOrDrawable(it, view.resources) }
                view.background = target
            }
            if (needsNativeDrawableFill && target != null) {
                target.mutate()
                AndroidHelper.setDrawableColor(color, target)
                target.invalidateSelf()
            } else {
                view.setBackgroundColor(color)
            }
        } else {
            if (clearBackgroundColor) {
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
        val left = ceil((effectiveBorderLeftWidth + effectivePaddingLeft).toDouble()).toInt()
        val top = ceil((effectiveBorderTopWidth + effectivePaddingTop).toDouble()).toInt()
        val right = ceil((effectiveBorderRightWidth + effectivePaddingRight).toDouble()).toInt()
        val bottom = ceil((effectiveBorderBottomWidth + effectivePaddingBottom).toDouble()).toInt()
        if (isPaddingRelative) view.setPaddingRelative(left, top, right, bottom) else view.setPadding(left, top, right, bottom)
        clearBackgroundColor = false
    }

    private fun refreshBorderDrawable(drawable: BorderDrawable) {
        val bg = background
        val black = -16777216
        drawable.refresh(
            bg.borderTopColor ?: black, bg.borderRightColor ?: black, bg.borderBottomColor ?: black, bg.borderLeftColor ?: black,
            bg.borderTopWidth, bg.borderRightWidth, bg.borderBottomWidth, bg.borderLeftWidth,
            bg.borderTopLeftRadius, bg.borderTopRightRadius, bg.borderBottomRightRadius, bg.borderBottomLeftRadius,
            null, bg.color ?: 0, null, null, null, nativeView.context, null, null, null, null, null,
        )
    }

    // Events

    /** Subscribes to an event: `tap`, or a property change such as `textChange`. */
    fun on(event: String, handler: (EventData) -> Unit) {
        setUp()
        handlers.getOrPut(event) { mutableListOf() }.add(handler)
        if (event == "tap") observeTap()
    }

    /**
     * A tap is a gesture observer: a GestureDetector fed from a touch listener,
     * which then lets the native view handle the touch, as core's TouchListener does.
     */
    protected open fun observeTap() {
        if (gestureDetector != null) return
        gestureDetector = GestureDetectorCompat(context, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(e: MotionEvent): Boolean = true
            override fun onSingleTapUp(e: MotionEvent): Boolean {
                emit("tap", null)
                return true
            }
        })
        val view = nativeView
        view.setOnTouchListener { v, event ->
            handleGestureTouch(event)
            v.onTouchEvent(event)
        }
        view.isClickable = toBool(applied["isUserInteractionEnabled"]) ?: true
    }

    /** Ancestors' gesture observers see the touches of their descendants. */
    private fun handleGestureTouch(event: MotionEvent) {
        gestureDetector?.onTouchEvent(event)
        parent?.handleGestureTouch(event)
    }

    internal fun emit(event: String, value: Any?) {
        val list = handlers[event] ?: return
        val data = EventData(event, this, value)
        for (handler in list.toList()) handler(data)
    }

    override fun toString(): String = "$cssType(${System.identityHashCode(this)})"

    companion object {
        internal val inheritedProperties = setOf(
            "color", "fontFamily", "fontSize", "fontStyle", "fontWeight", "textAlignment", "textTransform",
            "whiteSpace", "letterSpacing", "lineHeight", "tintColor", "direction", "selectedBackgroundColor",
            "selectedTextColor",
        )
    }
}
