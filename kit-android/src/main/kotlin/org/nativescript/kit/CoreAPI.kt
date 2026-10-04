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

/** `Screen.mainScreen` from platform/screen (Android): the display's metrics. */
class ScreenMetrics {
    private val metrics get() = NativeScriptActivity.context.resources.displayMetrics
    val scale: Double get() = metrics.density.toDouble()
    val widthPixels: Double get() = metrics.widthPixels.toDouble()
    val heightPixels: Double get() = metrics.heightPixels.toDouble()
    val widthDIPs: Double get() = metrics.widthPixels / metrics.density.toDouble()
    val heightDIPs: Double get() = metrics.heightPixels / metrics.density.toDouble()
}

object Screen {
    val mainScreen: ScreenMetrics get() = ScreenMetrics()
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
