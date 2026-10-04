package org.nativescript.kit

import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.graphics.drawable.LayerDrawable
import android.text.Html
import android.text.method.LinkMovementMethod
import android.util.TypedValue
import android.view.ViewGroup
import android.webkit.WebViewClient
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView as NativeTextView
import androidx.appcompat.widget.SearchView

/** `Progress` from progress/index.android: a horizontal ProgressBar, its value kept within 0 and the maximum. */
open class Progress : View() {
    override val cssType: String get() = "Progress"

    private val bar: ProgressBar get() = nativeView as ProgressBar

    override fun createNativeView(): NativeView = ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal)

    override fun defaultValue(name: String): Any? = when (name) {
        "value" -> 0.0
        "maxValue" -> 100.0
        else -> null
    }

    override fun coerce(name: String, value: Any?): Any? = when (name) {
        "value" -> {
            val v = toDouble(if (value is String) parseIntOrNull(value.trim())?.toDouble() ?: Double.NaN else value)
            if (v == null) null else if (v < 0) 0.0 else minOf(v, toDouble(applied["maxValue"]) ?: 100.0)
        }
        "maxValue" -> if (value is String) parseIntOrNull(value.trim())?.toDouble() ?: Double.NaN else value
        else -> value
    }

    override fun propertyValueChanged(name: String, value: Any?) {
        super.propertyValueChanged(name, value)
        if (name == "maxValue") refresh("value")
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "value" -> bar.progress = toDouble(value)?.toInt() ?: 0
            "maxValue" -> bar.max = toDouble(value)?.toInt() ?: 100
            "color" -> {
                val drawable = bar.progressDrawable ?: return
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, drawable) else AndroidHelper.clearDrawableColor(drawable)
            }
            "backgroundColor" -> {
                val drawable = bar.progressDrawable as? LayerDrawable ?: return
                if (drawable.numberOfLayers == 0) return
                val track = drawable.getDrawable(0) ?: return
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, track) else AndroidHelper.clearDrawableColor(track)
            }
            else -> super.setProperty(name, value)
        }
    }

    override fun backgroundChanged() {}
}

/** `ActivityIndicator` from activity-indicator/index.android: an indeterminate ProgressBar, shown while busy and visible. */
open class ActivityIndicator : View() {
    override val cssType: String get() = "ActivityIndicator"

    private val bar: ProgressBar get() = nativeView as ProgressBar
    private val busy: Boolean get() = toBool(applied["busy"]) ?: false

    override fun createNativeView(): NativeView = ProgressBar(context).also {
        it.visibility = NativeView.INVISIBLE
        it.isIndeterminate = true
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "busy" -> if (visibility() == "visible") bar.visibility = if (toBool(value) == true) NativeView.VISIBLE else NativeView.INVISIBLE
            "visibility" -> bar.visibility = when (visibility()) {
                "visible" -> if (busy) NativeView.VISIBLE else NativeView.INVISIBLE
                "collapse", "collapsed" -> NativeView.GONE
                else -> NativeView.INVISIBLE
            }
            "color" -> {
                val drawable = bar.indeterminateDrawable.mutate()
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, drawable) else AndroidHelper.clearDrawableColor(drawable)
            }
            else -> super.setProperty(name, value)
        }
    }

    private fun visibility(): String = toText(applied["visibility"])?.trim()?.lowercase() ?: "visible"
}

/**
 * `SearchBar` from search-bar/index.android: an AppCompat SearchView, never
 * iconified, styled through its query text view and search plate.
 */
open class SearchBar : View() {
    override val cssType: String get() = "SearchBar"

    private val searchView: SearchView get() = nativeView as SearchView
    private var searchText: String? = null
    private var query: String? = null

    private var defaults: TextDefaults? = null

    private class TextDefaults(val textColor: Int, val hintColor: Int, val textSize: Float, val typeface: Typeface?, val background: Drawable?)

    private val textView: NativeTextView by lazy {
        val id = context.resources.getIdentifier("search_src_text", "id", context.packageName)
        searchView.findViewById(id)
    }

    private val searchPlate: NativeView by lazy {
        val id = context.resources.getIdentifier("search_plate", "id", context.packageName)
        searchView.findViewById(id)
    }

    override fun createNativeView(): NativeView = SearchView(context).also { it.isIconified = false }

    override fun defaultValue(name: String): Any? = if (name == "text") "" else null

    override fun initNativeView() {
        super.initNativeView()
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextChange(newText: String): Boolean {
                nativeValueChange("text", newText)
                if (newText == "" && searchText != newText) emit("clear", null)
                searchText = newText
                query = null
                return true
            }

            override fun onQueryTextSubmit(text: String): Boolean {
                if (text != "" && query != text) emit("submit", null)
                query = text
                return true
            }
        })
        searchView.setOnCloseListener {
            emit("clear", null)
            true
        }
        val tv = textView
        defaults = TextDefaults(tv.currentTextColor, tv.currentTextColor, tv.textSize, tv.typeface, tv.background)
    }

    override fun setProperty(name: String, value: Any?) {
        val defaults = defaults!!
        when (name) {
            "text" -> searchView.setQuery(toText(value) ?: "", false)
            "hint" -> searchView.queryHint = toText(value)
            "isEnabled" -> enable(searchView, toBool(value) ?: true)
            "isUserInteractionEnabled" -> enableUserInteraction(searchView, toBool(value) ?: true)
            "backgroundColor" -> {
                val color = toColor(value)?.argb ?: 0
                searchView.setBackgroundColor(color)
                searchPlate.setBackgroundColor(color)
            }
            "color" -> textView.setTextColor(toColor(value)?.argb ?: defaults.textColor)
            "fontSize" -> {
                val size = toDouble(value)
                if (size != null) textView.textSize = size.toFloat() else textView.setTextSize(TypedValue.COMPLEX_UNIT_PX, defaults.textSize)
            }
            "fontFamily", "fontStyle", "fontWeight" -> {
                val font = Font.of(applied)
                textView.typeface = if (font.isDefault) defaults.typeface else font.typeface()
            }
            "textFieldBackgroundColor" -> {
                val color = toColor(value)
                if (color != null) textView.setBackgroundColor(color.argb) else textView.background = defaults.background
            }
            "textFieldHintColor" -> textView.setHintTextColor(toColor(value)?.argb ?: defaults.hintColor)
            "clearButtonColor" -> {
                val color = toColor(value) ?: return
                val id = context.resources.getIdentifier("android:id/search_close_btn", null, null)
                searchView.findViewById<ImageView>(id)?.setColorFilter(color.argb)
            }
            else -> super.setProperty(name, value)
        }
    }

    private fun enable(view: NativeView, value: Boolean) {
        view.isEnabled = value
        if (view is ViewGroup) for (i in 0 until view.childCount) enable(view.getChildAt(i), value)
    }

    private fun enableUserInteraction(view: NativeView, value: Boolean) {
        view.isClickable = value
        view.isFocusable = value
        if (view is ViewGroup) for (i in 0 until view.childCount) enableUserInteraction(view.getChildAt(i), value)
    }

    override fun backgroundChanged() {}
}

/** `HtmlView` from html-view/index.android: a selectable TextView showing `Html.fromHtml`, with clickable links. */
open class HtmlView : View() {
    override val cssType: String get() = "HtmlView"

    private val textView: NativeTextView get() = nativeView as NativeTextView
    private var defaultColors: android.content.res.ColorStateList? = null
    private var defaultLinkColors: android.content.res.ColorStateList? = null
    private var defaultTextSize = 0f
    private var defaultTypeface: Typeface? = null

    override fun createNativeView(): NativeView = NativeTextView(context)

    override fun initNativeView() {
        super.initNativeView()
        val tv = textView
        tv.setTextIsSelectable(true)
        tv.linksClickable = true
        tv.movementMethod = LinkMovementMethod.getInstance()
        defaultColors = tv.textColors
        defaultLinkColors = tv.linkTextColors
        defaultTextSize = tv.textSize
        defaultTypeface = tv.typeface
    }

    override fun setProperty(name: String, value: Any?) {
        val tv = textView
        when (name) {
            "html" -> {
                val html = toText(value) ?: ""
                // Auto-linking turns off the coloring of `<a>` links, so it is only on without them.
                tv.autoLinkMask = if (Regex("<a\\s", RegexOption.IGNORE_CASE).containsMatchIn(html)) 0 else 15
                tv.text = Html.fromHtml(html, Html.FROM_HTML_MODE_LEGACY)
            }
            "selectable" -> tv.setTextIsSelectable(toBool(value) ?: true)
            "color" -> {
                val color = toColor(value)
                if (color != null) tv.setTextColor(color.argb) else tv.setTextColor(defaultColors)
            }
            "linkColor" -> {
                val color = toColor(value)
                if (color != null) tv.setLinkTextColor(color.argb) else tv.setLinkTextColor(defaultLinkColors)
            }
            "fontSize" -> {
                val size = toDouble(value)
                if (size != null) tv.textSize = size.toFloat() else tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, defaultTextSize)
            }
            "fontFamily", "fontStyle", "fontWeight" -> {
                val font = Font.of(applied)
                tv.typeface = if (font.isDefault) defaultTypeface else font.typeface()
            }
            else -> super.setProperty(name, value)
        }
    }
}

/**
 * `WebView` from web-view/index.android: `src` is a URL, a path (`~/` from
 * the app folder) or HTML, loaded with the app folder as its base.
 */
open class WebView : View() {
    override val cssType: String get() = "WebView"

    private val webView: android.webkit.WebView get() = nativeView as android.webkit.WebView

    /** `knownFolders.currentApp().path`. */
    private val appPath: String get() = context.filesDir.absolutePath + "/app"

    override fun createNativeView(): NativeView = android.webkit.WebView(context).also {
        it.settings.javaScriptEnabled = true
        it.settings.builtInZoomControls = true
        it.settings.allowFileAccess = true
    }

    override fun initNativeView() {
        super.initNativeView()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: android.webkit.WebView, request: android.webkit.WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (!android.webkit.URLUtil.isNetworkUrl(url)) return openUrl(url)
                return false
            }

            override fun onPageStarted(view: android.webkit.WebView, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                emit("loadStarted", url)
            }

            override fun onPageFinished(view: android.webkit.WebView, url: String?) {
                super.onPageFinished(view, url)
                emit("loadFinished", url)
            }

            override fun onReceivedError(view: android.webkit.WebView, request: android.webkit.WebResourceRequest, error: android.webkit.WebResourceError) {
                super.onReceivedError(view, request, error)
                emit("loadFinished", request.url.toString())
            }
        }
        disableZoom(toBool(applied["disableZoom"]) ?: false)
    }

    private fun openUrl(url: String): Boolean = try {
        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url.trim()))
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        true
    } catch (e: Exception) {
        false
    }

    private fun disableZoom(value: Boolean) {
        if (!value) return
        val settings = webView.settings
        settings.builtInZoomControls = false
        settings.setSupportZoom(false)
        settings.displayZoomControls = false
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "src" -> load(toText(value) ?: "")
            "disableZoom" -> disableZoom(toBool(value) ?: false)
            else -> super.setProperty(name, value)
        }
    }

    private fun load(source: String) {
        webView.stopLoading()
        var src = source
        if (src.startsWith("~/")) src = "file://$appPath/" + src.substring(2)
        else if (src.startsWith("/")) src = "file://$src"
        val lower = src.lowercase()
        if (lower.startsWith("file:///")) src = android.net.Uri.encode(src, ":/?#[]@!$&'()*+,;=-._~%")
        if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("file:///")) webView.loadUrl(src)
        else webView.loadDataWithBaseURL("file:///$appPath/", src, "text/html", "utf-8", null)
    }

    fun stopLoading() = webView.stopLoading()
    fun reload() = webView.reload()
    fun goBack() = webView.goBack()
    fun goForward() = webView.goForward()
    val canGoBack: Boolean get() = webView.canGoBack()
    val canGoForward: Boolean get() = webView.canGoForward()
}

/**
 * `Placeholder` from placeholder/index.android: its native view is the one a
 * `creatingView` handler supplies; without one it has none, so takes no space.
 */
open class Placeholder : View() {
    override val cssType: String get() = "Placeholder"

    override fun createNativeView(): NativeView {
        emit("creatingView", null)
        return NativeView(context).also { it.visibility = NativeView.GONE }
    }

    override fun setProperty(name: String, value: Any?) {}

    override fun backgroundChanged() {}
}
