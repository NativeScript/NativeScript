package org.nativescript.kit

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import java.util.Locale

// @nativescript/core's API outside the view tree: what an app imports from
// '@nativescript/core' that is not an element in its templates.

/** `ApplicationSettings` from application-settings/index.android: the same SharedPreferences file. */
object ApplicationSettings {
    private val preferences: SharedPreferences
        get() = NativeScriptActivity.context.applicationContext.getSharedPreferences("prefs.db", Context.MODE_PRIVATE)

    fun hasKey(key: String): Boolean = preferences.contains(key)
    fun getBoolean(key: String, defaultValue: Boolean? = null): Boolean = if (hasKey(key)) preferences.getBoolean(key, false) else defaultValue ?: false
    fun getString(key: String, defaultValue: String? = null): String? = if (hasKey(key)) preferences.getString(key, "") else defaultValue
    fun getNumber(key: String, defaultValue: Double? = null): Double = if (hasKey(key)) java.lang.Double.longBitsToDouble(preferences.getLong(key, 0L)) else defaultValue ?: 0.0
    fun setBoolean(key: String, value: Boolean) = preferences.edit().putBoolean(key, value).apply()
    fun setString(key: String, value: String) = preferences.edit().putString(key, value).apply()
    fun setNumber(key: String, value: Double) = preferences.edit().putLong(key, java.lang.Double.doubleToRawLongBits(value)).apply()
    fun remove(key: String) = preferences.edit().remove(key).apply()
    fun clear() = preferences.edit().clear().apply()
    fun flush(): Boolean = preferences.edit().commit()
    fun getAllKeys(): JSArray<String> = JSArray(preferences.all.keys.toList())
}

/** `Device` from platform/device (Android). */
object Device {
    val manufacturer: String get() = Build.MANUFACTURER
    val model: String get() = Build.MODEL
    val os: String get() = "Android"
    val osVersion: String get() = Build.VERSION.RELEASE
    val sdkVersion: String get() = Build.VERSION.SDK_INT.toString()
    val deviceType: String
        get() {
            val metrics = NativeScriptActivity.context.resources.displayMetrics
            val dips = minOf(metrics.widthPixels, metrics.heightPixels) / metrics.density
            return if (dips >= 600) "Tablet" else "Phone"
        }
    val language: String get() = Locale.getDefault().language
    val region: String get() = Locale.getDefault().country
}

/** `Screen.mainScreen` from platform/screen (Android): the whole display's metrics, system bars included. */
class ScreenMetrics {
    @Suppress("DEPRECATION")
    private val metrics: android.util.DisplayMetrics
        get() = android.util.DisplayMetrics().also {
            (NativeScriptActivity.context.applicationContext.getSystemService(Context.WINDOW_SERVICE) as android.view.WindowManager).defaultDisplay.getRealMetrics(it)
        }
    val scale: Double get() = metrics.density.toDouble()
    val widthPixels: Double get() = metrics.widthPixels.toDouble()
    val heightPixels: Double get() = metrics.heightPixels.toDouble()
    val widthDIPs: Double get() = metrics.widthPixels / metrics.density.toDouble()
    val heightDIPs: Double get() = metrics.heightPixels / metrics.density.toDouble()
}

object Screen {
    val mainScreen: ScreenMetrics get() = ScreenMetrics()
}

/** `Utils` from @nativescript/core's utils (Android): numbers are JavaScript's. */
object Utils {
    /** `SDK_VERSION`: `android.os.Build.VERSION.SDK_INT`. */
    val SDK_VERSION: Double get() = Build.VERSION.SDK_INT.toDouble()

    /** `dismissSoftInput(nativeView)`: the input method hides from the view, or from whatever has focus. */
    fun dismissSoftInput(nativeView: android.view.View? = null) {
        val activity = NativeScriptActivity.current
        val view = nativeView ?: activity.currentFocus ?: activity.window.decorView
        val manager = activity.getSystemService(Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager
        manager.hideSoftInputFromWindow(view.windowToken, 0)
    }

    fun dismissKeyboard() = dismissSoftInput()
}

/** `Utils.layout` from utils/layout-helper/index.android (core-kotlin.ts reads `Utils.layout` as `UtilsLayout`). */
object UtilsLayout {
    // Core's measure spec constants as JavaScript's 32-bit integers.
    val EXACTLY: Double get() = (1 shl 30).toDouble()
    val AT_MOST: Double get() = (2 shl 30).toDouble()
    val UNSPECIFIED: Double get() = 0.0
    val MODE_MASK: Double get() = (3 shl 30).toDouble()

    fun getDisplayDensity(): Double = Layout.density.toDouble()
    fun toDevicePixels(value: Double): Double = Layout.toDevicePixels(value)
    fun toDeviceIndependentPixels(value: Double): Double = Layout.toDeviceIndependentPixels(value)
    fun round(value: Double): Double = Layout.round(value)

    /** `makeMeasureSpec(size, mode)`: `(Math.round(Math.max(0, size)) & ~MODE_MASK) | (mode & MODE_MASK)`. */
    fun makeMeasureSpec(size: Double, mode: Double): Double {
        val mask = 3 shl 30
        return ((Math.round(maxOf(0.0, size)).toInt() and mask.inv()) or (mode.toLong().toInt() and mask)).toDouble()
    }

    fun getMeasureSpecSize(spec: Double): Double = (spec.toLong().toInt() and (3 shl 30).inv()).toDouble()
    fun getMeasureSpecMode(spec: Double): Double = (spec.toLong().toInt() and (3 shl 30)).toDouble()
}

/** `Utils.android` from utils/native-helper-for-android. */
object UtilsAndroid {
    fun getApplication(): android.app.Application = NativeScriptActivity.context.applicationContext as android.app.Application
    fun getApplicationContext(): Context = getApplication().applicationContext
    fun getCurrentActivity(): android.app.Activity? = NativeScriptActivity.current
    fun getResources(): android.content.res.Resources = getApplication().resources
    fun getPackageName(): String = getApplicationContext().packageName
}

/** `Application` from application/application.android: the app has one activity, NativeScriptActivity. */
object Application {
    private val events = Observable()
    private var create: Any? = null

    val android: ApplicationAndroid get() = ApplicationAndroid

    /** `run({ create })`: the activity's root view is what `create` returns. */
    fun run(entry: Any?) {
        create = jsField(entry, "create")
    }

    /** The root view of an app that called `run`. */
    fun rootView(): View = (try { jsCall(create) } catch (e: Throwable) { jsReportUncaught(jsCaught(e)); null }) as? View ?: ContentView()

    fun on(eventNames: String, callback: (EventData) -> Unit, thisArg: Any? = null, key: Any? = null) = events.on(eventNames, callback, thisArg, key)

    fun off(eventNames: String, callback: ((EventData) -> Unit)? = null, thisArg: Any? = null, key: Any? = null) = events.off(eventNames, callback, thisArg, key)

    fun notify(data: Any?) = events.notify(data)

    /** `setWindowContentResolver(resolver)`: content for windows other than the primary one, which this app has none of. */
    @Suppress("UNUSED_PARAMETER")
    fun setWindowContentResolver(resolver: Any?) {}

    val primaryWindow: NativeWindow get() = NativeWindow.primary

    /** `systemAppearance()`: "light" or "dark". */
    fun systemAppearance(): String = Appearance.systemAppearance

    fun orientation(): String = Appearance.orientation

    internal fun appearanceChanged(value: String) {
        notify(JSObject("eventName" to "systemAppearanceChanged", "object" to events, "newValue" to value))
    }
}

/** `NativeWindow` (core 9.1's multi-window model): the app's one window. */
class NativeWindow private constructor() : JSDynamic {
    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "NativeWindow"

    companion object {
        val primary = NativeWindow()
    }
}

object ApplicationAndroid {
    val nativeApp: android.app.Application
        get() = UtilsAndroid.getApplication()
    val context: Context
        get() = UtilsAndroid.getApplicationContext()
    val packageName: String
        get() = UtilsAndroid.getPackageName()
    val startActivity: androidx.appcompat.app.AppCompatActivity
        get() = NativeScriptActivity.current
    val foregroundActivity: androidx.appcompat.app.AppCompatActivity
        get() = NativeScriptActivity.current
}

/** `new Color(value)` as core reads it: an unparsable string is transparent black there too. */
fun Color.Companion.js(value: String): Color = parse(value) ?: Color(0)

/** `new Color(a, r, g, b)`. */
fun Color.Companion.argb(a: Double, r: Double, g: Double, b: Double): Color {
    fun c(v: Double): Int = maxOf(0, minOf(255, v.toInt()))
    return Color((c(a) shl 24) or (c(r) shl 16) or (c(g) shl 8) or c(b))
}

/** `#RRGGBB`, or `#RRGGBBAA` when not opaque, as core's `hex` reports it. */
val Color.hex: String
    get() {
        val rgb = String.format(Locale.ROOT, "#%02X%02X%02X", r, g, b)
        return if (a == 255) rgb else rgb + String.format(Locale.ROOT, "%02X", a)
    }

/** `color.android`: the ARGB int Android takes. */
val Color.android: Int get() = argb

val Color.isDark: Boolean get() = (r * 299 + g * 587 + b * 114) / 1000.0 < 128
val Color.isLight: Boolean get() = !isDark

/** A property's current value by its NativeScript name (`label.text`). */
fun View.get(name: String): Any? = applied[name]
