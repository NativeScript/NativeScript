package org.nativescript.kit

import android.content.Context

// The members of core's View that script calls, with JavaScript's types:
// measure specs and sizes in device pixels as numbers.

fun View.getMeasuredWidth(): Double = nativeView.measuredWidth.toDouble()
fun View.getMeasuredHeight(): Double = nativeView.measuredHeight.toDouble()
fun View.getActualSize(): JSObject = JSObject("width" to Layout.toDeviceIndependentPixels(getMeasuredWidth()), "height" to Layout.toDeviceIndependentPixels(getMeasuredHeight()))

fun View.requestLayout() = nativeView.requestLayout()

/** `measure(widthMeasureSpec, heightMeasureSpec)` from script: the native view's own measure. */
fun View.measure(widthMeasureSpec: Double, heightMeasureSpec: Double) = nativeView.measure(widthMeasureSpec.toInt(), heightMeasureSpec.toInt())

/** `layout(left, top, right, bottom)` from script, in device pixels. */
fun View.layout(left: Double, top: Double, right: Double, bottom: Double) = nativeView.layout(left.toInt(), top.toInt(), right.toInt(), bottom.toInt())

/** `getSafeAreaInsets()`: none on Android, as view-common answers. */
fun View.getSafeAreaInsets(): JSObject = JSObject("left" to 0.0, "top" to 0.0, "right" to 0.0, "bottom" to 0.0)

/** `_context`: the activity the view's native view belongs to. */
val View._context: Context get() = context

/** `_dialogFragment`: the dialog a modal's root view is shown in, which no compiled view is. */
val View._dialogFragment: Any? get() = null

/** `page`: the page this view is in. */
val View.page: Page?
    get() {
        var current: View? = this
        while (current != null) {
            if (current is Page) return current
            current = current.parent
        }
        return null
    }

/** `eachChild(callback)`: stops when the callback returns false. */
fun View.eachChild(callback: (View) -> Boolean) {
    var stop = false
    eachChildView { child ->
        if (stop) return@eachChildView
        val more = try { callback(child) } catch (e: Throwable) { jsReportUncaught(jsCaught(e)); true }
        if (!more) stop = true
    }
}

/** `getViewById(id)`: this view or a descendant with that `id`, depth first. */
fun View.getViewById(id: String): View? {
    if (get("id") as? String == id) return this
    var found: View? = null
    eachChildView { child -> if (found == null) found = child.getViewById(id) }
    return found
}

/** `style`: the view's style properties by name. */
val View.style: Style get() = Style(this)

/** `_onCssStateChange()`: CSS matched again for this view. */
fun View._onCssStateChange() = onCssStateChange()

/** `Style`: a view's style properties, read and written by name. */
class Style(private val view: View) : JSDynamic {
    fun get(name: String): Any? = view.get(name)
    fun set(name: String, value: Any?) = view.set(name, value)
    override fun jsGet(key: String): Any? = get(key)
    override fun jsSet(key: String, value: Any?) = set(key, value)
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Style"
}
