package org.nativescript.kit

import kotlin.math.floor

/** `layout` from utils/layout-helper: device-independent pixels at the display's density. */
object Layout {
    val density: Float get() = NativeScriptActivity.context.resources.displayMetrics.density

    fun toDevicePixels(value: Double): Double = value * density

    fun toDeviceIndependentPixels(value: Double): Double = value / density

    /** `layout.round`: halves up, and a nonzero value never rounds to 0. */
    fun round(value: Double): Double {
        val res = floor(value + 0.5)
        if (res != 0.0) return res
        if (value == 0.0) return 0.0
        return if (value > 0) 1.0 else -1.0
    }
}

/** `PercentLength` / `Length` from styling/length-shared. */
sealed class Length {
    object Auto : Length()
    data class Dip(val value: Double) : Length()
    data class Px(val value: Double) : Length()
    data class Percent(val value: Double) : Length()

    fun toDevicePixels(auto: Double = Double.NaN, parentAvailable: Double = Double.NaN): Double = when (this) {
        Auto -> auto
        is Dip -> Layout.round(Layout.toDevicePixels(value))
        is Px -> Layout.round(value)
        is Percent -> Layout.round(parentAvailable * value)
    }

    companion object {
        val zero = Dip(0.0)

        fun parse(value: Any?, fallback: Length): Length = when (value) {
            null -> fallback
            is Double -> Dip(value)
            is Int -> Dip(value.toDouble())
            is String -> {
                val text = value.trim()
                when {
                    text == "auto" -> Auto
                    text.endsWith("%") -> parseFloat(text.dropLast(1))?.let { Percent(it / 100) } ?: fallback
                    text.contains("px") -> parseFloat(text.replace("px", ""))?.let { Px(it) } ?: fallback
                    else -> parseFloat(text)?.let { Dip(it) } ?: fallback
                }
            }
            else -> fallback
        }
    }
}

// Conversions of a property value as templates and CSS hand it over:
// strings as written, or typed values from bindings.

fun toDouble(value: Any?): Double? = when (value) {
    is Double -> value
    is Int -> value.toDouble()
    is Float -> value.toDouble()
    is Boolean -> if (value) 1.0 else 0.0
    is String -> parseFloat(value)
    else -> null
}

fun toBool(value: Any?): Boolean? = when (value) {
    is Boolean -> value
    is String -> when (value.trim().lowercase()) {
        "true" -> true
        "false" -> false
        else -> null
    }
    is Double -> value != 0.0
    is Int -> value != 0
    else -> null
}

fun toColor(value: Any?): Color? = when (value) {
    is Color -> value
    is String -> Color.parse(value)
    else -> null
}

fun toText(value: Any?): String? = when (value) {
    null -> null
    is String -> value
    is Double -> js(value)
    is Int -> value.toString()
    is Boolean -> js(value)
    else -> value.toString()
}

/** `parseInt` for integer properties templates set as text (`col="1"`). */
fun toInt(value: Any?): Int? = toDouble(value)?.toInt()

/** An items property's value: the JSArray translated code passes, or a list. */
fun toList(value: Any?): List<Any?>? = when (value) {
    is JSArray<*> -> value.elements
    is List<*> -> value
    else -> null
}

/** Values compare as NativeScript's property system sees them change. */
fun sameValue(a: Any?, b: Any?): Boolean = when {
    a == null || b == null -> a == null && b == null
    a is Double && b is Double -> a == b
    a is String && b is String -> a == b
    a is Boolean && b is Boolean -> a == b
    a is Color && b is Color -> a.argb == b.argb
    a is JSDate && b is JSDate -> a.getTime() == b.getTime()
    else -> a::class == b::class && a.toString() == b.toString()
}
