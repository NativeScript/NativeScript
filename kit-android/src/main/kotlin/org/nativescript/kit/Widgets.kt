package org.nativescript.kit

import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.os.Handler
import android.os.Looper
import android.text.TextUtils
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TabHost
import android.widget.TabWidget
import android.widget.TextView
import androidx.core.graphics.BlendModeCompat
import org.nativescript.widgets.image.Worker

/** `Switch` from switch/index.android: the platform switch, its thumb and track tinted by color. */
open class Switch : View() {
    override val cssType: String get() = "Switch"

    private val switch: android.widget.Switch get() = nativeView as android.widget.Switch

    override fun createNativeView(): NativeView = android.widget.Switch(context)

    override fun initNativeView() {
        super.initNativeView()
        switch.setOnCheckedChangeListener { _, isChecked ->
            nativeValueChange("checked", isChecked)
            checkedChanged(isChecked)
        }
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "checked" -> {
                val checked = toBool(value) ?: false
                switch.isChecked = checked
                checkedChanged(checked)
            }
            "color" -> {
                val thumb = switch.thumbDrawable
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, thumb, BlendModeCompat.SRC_ATOP) else AndroidHelper.clearDrawableColor(thumb)
            }
            "backgroundColor" -> if (applied["offBackgroundColor"] == null || switch.isChecked) setTrackColor(toColor(value))
            "offBackgroundColor" -> if (!switch.isChecked) setTrackColor(toColor(value))
            else -> super.setProperty(name, value)
        }
    }

    private fun checkedChanged(checked: Boolean) {
        val off = toColor(applied["offBackgroundColor"]) ?: return
        setTrackColor(if (checked) toColor(applied["backgroundColor"]) else off)
    }

    private fun setTrackColor(color: Color?) {
        val track = switch.trackDrawable
        if (color != null) AndroidHelper.setDrawableColor(color.argb, track, BlendModeCompat.SRC_OVER) else AndroidHelper.clearDrawableColor(track)
    }

    override fun backgroundChanged() {}
}

/** `Slider` from slider/index.android: a SeekBar offset by the minimum, as Android has none. */
open class Slider : View() {
    override val cssType: String get() = "Slider"

    private var value = 0.0
    private var minValue = 0.0
    private var maxValue = 100.0
    private var suppressNativeValue = false

    private val seekBar: SeekBar get() = nativeView as SeekBar

    override fun createNativeView(): NativeView = SeekBar(context)

    override fun initNativeView() {
        super.initNativeView()
        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(bar: SeekBar, progress: Int, fromUser: Boolean) {
                if (suppressNativeValue) return
                value = progress + minValue
                nativeValueChange("value", value)
            }

            override fun onStartTrackingTouch(bar: SeekBar) {}
            override fun onStopTrackingTouch(bar: SeekBar) {}
        })
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "value" -> {
                this.value = toDouble(value) ?: 0.0
                setNativeValuesSilently()
            }
            "minValue" -> {
                minValue = toDouble(value) ?: 0.0
                setNativeValuesSilently()
            }
            "maxValue" -> {
                maxValue = toDouble(value) ?: 100.0
                setNativeValuesSilently()
            }
            "color" -> {
                val thumb = seekBar.thumb
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, thumb) else AndroidHelper.clearDrawableColor(thumb)
            }
            "backgroundColor" -> {
                val progress = seekBar.progressDrawable
                val color = toColor(value)
                if (color != null) AndroidHelper.setDrawableColor(color.argb, progress) else AndroidHelper.clearDrawableColor(progress)
            }
            else -> super.setProperty(name, value)
        }
    }

    /** The value coerced into the range, as core's coercible `value` property is. */
    private fun setNativeValuesSilently() {
        val coerced = value.coerceIn(minValue, maxOf(minValue, maxValue))
        suppressNativeValue = true
        try {
            seekBar.max = (maxValue - minValue).toInt()
            seekBar.progress = (coerced - minValue).toInt()
        } finally {
            suppressNativeValue = false
        }
    }

    override fun backgroundChanged() {}
}

/** `SegmentedBarItem`: a tab's title, realized on the TextView the TabHost makes for it. */
open class SegmentedBarItem : View() {
    override val cssType: String get() = "SegmentedBarItem"

    internal var titleView: TextView? = null
        set(value) {
            field = value
            update()
        }

    val title: String get() = toText(applied["title"]) ?: ""

    override fun setProperty(name: String, value: Any?) {
        val tv = titleView
        when (name) {
            "title" -> update()
            "color" -> toColor(value)?.let { tv?.setTextColor(it.argb) }
            "fontSize" -> toDouble(value)?.let { tv?.textSize = it.toFloat() }
            else -> super.setProperty(name, value)
        }
    }

    private fun update() {
        val tv = titleView ?: return
        tv.text = title
        toColor(applied["color"])?.let { tv.setTextColor(it.argb) }
        toDouble(applied["fontSize"])?.let { tv.textSize = it.toFloat() }
    }

    override fun backgroundChanged() {}
}

/**
 * `SegmentedBar` from segmented-bar/index.android: a TabHost whose tab
 * widget shows the items, recolored a turn after each selection.
 */
open class SegmentedBar : View() {
    override val cssType: String get() = "SegmentedBar"

    private val items = mutableListOf<SegmentedBarItem>()
    private var addingTab = false
    private var requestedIndex: Int? = null

    private val tabHost: TabHost get() = nativeView as TabHost

    override fun createNativeView(): NativeView {
        val host = object : TabHost(context, null) {
            // core's TabHostImpl skips TabHost's touch-mode focus handling.
            @Suppress("MissingSuperCall")
            override fun onAttachedToWindow() {}
        }
        val layout = LinearLayout(context)
        layout.orientation = LinearLayout.VERTICAL
        val tabWidget = TabWidget(context)
        tabWidget.id = android.R.id.tabs
        layout.addView(tabWidget)
        val frame = FrameLayout(context)
        frame.id = android.R.id.tabcontent
        frame.visibility = NativeView.GONE
        layout.addView(frame)
        host.addView(layout)
        return host
    }

    override fun initNativeView() {
        super.initNativeView()
        val host = tabHost
        host.setOnTabChangedListener { id ->
            val index = id.toInt()
            Handler(Looper.getMainLooper()).post { setTabColor(index) }
            if (!addingTab) {
                requestedIndex = index
                nativeValueChange("selectedIndex", index.toDouble())
            }
        }
        host.setup()
    }

    override fun addChild(child: View) {
        val item = child as? SegmentedBarItem ?: return
        items.add(item)
        addView(item)
        setItems()
    }

    override fun eachChildView(body: (View) -> Unit) {
        items.forEach(body)
    }

    /** `itemsProperty.setNative`: every tab rebuilt, then the selected index coerced into range. */
    private fun setItems() {
        val host = tabHost
        host.clearAllTabs()
        for ((index, item) in items.withIndex()) {
            val tab = host.newTabSpec(index.toString())
            tab.setIndicator(item.title)
            tab.setContent { createTabContent() }
            addingTab = true
            host.addTab(tab)
            item.titleView = host.tabWidget.getChildAt(index).findViewById(android.R.id.title)
            addingTab = false
        }
        applySelectedIndex()
    }

    private fun createTabContent(): NativeView {
        val tv = TextView(context)
        tv.visibility = NativeView.GONE
        tv.maxLines = 1
        tv.ellipsize = TextUtils.TruncateAt.END
        return tv
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "selectedIndex" -> {
                requestedIndex = toInt(value)
                applySelectedIndex()
            }
            "selectedBackgroundColor", "selectedTextColor" -> {}
            else -> super.setProperty(name, value)
        }
    }

    private fun applySelectedIndex() {
        if (items.isEmpty()) return
        val index = (requestedIndex ?: -1).coerceIn(0, items.size - 1)
        tabHost.currentTab = index
    }

    /** `setTabColor`: unselected tabs gray on light gray, the selected one in the selection colors. */
    private fun setTabColor(index: Int) {
        val tabWidget = tabHost.tabWidget ?: return
        val unselectedText = (toColor(applied["color"]) ?: Color.parse("#6e6e6e")!!).argb
        val selectedText = (toColor(applied["selectedTextColor"]) ?: Color.parse("#000000")!!).argb
        val unselectedBackground = (toColor(applied["backgroundColor"]) ?: Color.parse("#dbdbdb")!!).argb
        val selectedBackground = (toColor(applied["selectedBackgroundColor"]) ?: Color.parse("blue")!!).argb
        for (i in 0 until tabWidget.tabCount) {
            val tab = tabWidget.getChildTabViewAt(i)
            val textView = items.getOrNull(i)?.titleView
            if (i == index) {
                tab.setBackgroundColor(selectedBackground)
                textView?.setTextColor(selectedText)
            } else {
                tab.setBackgroundColor(unselectedBackground)
                textView?.setTextColor(unselectedText)
            }
        }
    }
}

/** `Image` from image/index.android: the widgets ImageView and its URI loader. */
open class Image : View() {
    override val cssType: String get() = "Image"

    private val imageView: org.nativescript.widgets.ImageView get() = nativeView as org.nativescript.widgets.ImageView

    override fun createNativeView(): NativeView = org.nativescript.widgets.ImageView(context)

    override fun initNativeView() {
        super.initNativeView()
        imageView.setImageLoadedListener(object : Worker.OnImageLoadedListener {
            override fun handlesImageUpdate(): Boolean = true

            override fun onImageLoaded(drawable: Drawable) {
                setImage(org.nativescript.widgets.Utils.getBitmapFromDrawable(drawable))
            }

            override fun onImageLoaded(bitmap: Bitmap) {
                setImage(bitmap)
            }

            override fun onImageLoadingError(e: Exception) {
                setImage(null)
            }
        })
    }

    private fun setImage(bitmap: Bitmap?) {
        imageView.rotationAngle = 0f
        imageView.setImageBitmap(bitmap)
    }

    override fun setProperty(name: String, value: Any?) {
        when (name) {
            "src" -> setSource(toText(value))
            "stretch" -> imageView.scaleType = when (toText(value)?.trim()) {
                "aspectFit" -> android.widget.ImageView.ScaleType.FIT_CENTER
                "aspectFill" -> android.widget.ImageView.ScaleType.CENTER_CROP
                "fill" -> android.widget.ImageView.ScaleType.FIT_XY
                else -> android.widget.ImageView.ScaleType.MATRIX
            }
            "tintColor" -> {
                val color = toColor(value)
                if (color != null) imageView.setColorFilter(color.argb) else imageView.clearColorFilter()
            }
            else -> super.setProperty(name, value)
        }
    }

    /**
     * `_createImageSourceFromSrc` for strings. `sys://` names an iOS SF Symbol;
     * core treats it as a file path here, which loads nothing.
     */
    private fun setSource(value: String?) {
        val view = imageView
        val src = value?.trim()
        if (src.isNullOrEmpty()) {
            view.setUri(null, 0, 0, false, false, true)
            return
        }
        val keepAspectRatio = toText(applied["stretch"])?.trim() != "fill"
        val isPath = src.startsWith("~/") || src.startsWith("/") || src.startsWith("res://") || src.startsWith("sys://")
        when {
            src.startsWith("res://") -> view.setUri(src, 0, 0, keepAspectRatio, true, false)
            isPath -> {
                val fileName = if (src.startsWith("~/")) context.filesDir.absolutePath + "/app/" + src.removePrefix("~/") else src
                view.setUri("file:///$fileName", 0, 0, keepAspectRatio, true, false)
            }
            else -> view.setUri(src, 0, 0, keepAspectRatio, true, true)
        }
    }
}
