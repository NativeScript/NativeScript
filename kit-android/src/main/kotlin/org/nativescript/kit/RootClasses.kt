package org.nativescript.kit

import android.content.res.Configuration
import android.os.Build
import android.view.View as AndroidView

/**
 * The window state NativeScript turns into root view classes and media
 * query values (application `setRootViewCSSClasses`, accessibility's font
 * scale and service classes).
 */
object Appearance {
    private val configuration: Configuration get() = NativeScriptActivity.context.resources.configuration

    val systemAppearance: String
        get() = if (configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES) "dark" else "light"

    val layoutDirection: String
        get() = if (configuration.layoutDirection == AndroidView.LAYOUT_DIRECTION_RTL) "rtl" else "ltr"

    val orientation: String
        get() = when (configuration.orientation) {
            Configuration.ORIENTATION_LANDSCAPE -> "landscape"
            Configuration.ORIENTATION_PORTRAIT -> "portrait"
            else -> "unknown"
        }

    /** `getClosestValidFontScale` among the scales Android has. */
    val fontScale: Double
        get() {
            val scale = configuration.fontScale.toDouble()
            return listOf(0.85, 1.0, 1.15, 1.3).minByOrNull { Math.abs(scale - it) }!!
        }

    /** The classes of a root view, `ns-root` or `ns-modal` first. */
    fun rootClasses(modal: Boolean = false): Set<String> {
        val metrics = NativeScriptActivity.context.resources.displayMetrics
        val device = if (minOf(metrics.widthPixels, metrics.heightPixels) / metrics.density >= 600) "tablet" else "phone"
        return linkedSetOf(
            if (modal) "ns-modal" else "ns-root", "ns-android", "ns-android-${Build.VERSION.SDK_INT}", "ns-$device",
            "ns-$orientation", "ns-$systemAppearance", "ns-$layoutDirection",
            "a11y-service-disabled", "a11y-fontscale-${Math.round(fontScale * 100)}", "a11y-fontscale-m",
        )
    }

    /** `systemAppearanceChanged` and friends: the root's window-scoped classes follow the configuration. */
    fun refresh(root: View, modal: Boolean = false) {
        val next = rootClasses(modal)
        if (root.rootClasses != next) root.rootClasses = next
    }
}
