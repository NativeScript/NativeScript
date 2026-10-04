package org.nativescript.kit

import java.math.BigDecimal
import kotlin.math.abs
import kotlin.math.floor

// JavaScript's behavior where Kotlin's differs, for code translated from TypeScript.

/** A number as JavaScript prints it: `4`, not `4.0`; `0.1`, `1e+21`, `1e-7`. */
fun js(value: Double): String {
    if (value.isNaN()) return "NaN"
    if (value.isInfinite()) return if (value > 0) "Infinity" else "-Infinity"
    if (value == 0.0) return "0"
    val magnitude = abs(value)
    if (magnitude >= 1e-7 && magnitude < 1e21) {
        // Java's shortest round-trip digits, laid out without an exponent.
        return BigDecimal(value.toString()).stripTrailingZeros().toPlainString()
    }
    val digits = BigDecimal(value.toString()).stripTrailingZeros()
    val unscaled = digits.unscaledValue().abs().toString()
    val exponent = unscaled.length - 1 - digits.scale()
    val mantissa = if (unscaled.length == 1) unscaled else unscaled[0] + "." + unscaled.substring(1)
    return (if (value < 0) "-" else "") + mantissa + "e" + (if (exponent >= 0) "+" else "-") + abs(exponent)
}

fun js(value: Int): String = value.toString()
fun js(value: Boolean): String = if (value) "true" else "false"
fun js(value: String): String = value

/** `Math.round`: halves round toward +∞. */
fun jsRound(value: Double): Double = floor(value + 0.5)

/** `s.includes(sub)`: true for an empty `sub`, as JavaScript has it. */
fun jsIncludes(s: String, sub: String): Boolean = s.contains(sub)

/** `s.indexOf(sub)` in UTF-16 units, or -1. */
fun jsIndexOf(s: String, sub: String): Double = s.indexOf(sub).toDouble()

/** JavaScript truthiness for the values translated code tests. */
fun jsTruthy(value: Any?): Boolean = when (value) {
    null -> false
    is Boolean -> value
    is Double -> value != 0.0 && !value.isNaN()
    is Int -> value != 0
    is String -> value.isNotEmpty()
    else -> true
}

private fun jsRange(count: Int, start: Double, end: Double?): Pair<Int, Int> {
    fun clamp(v: Double): Int = if (v < 0) maxOf(0, count + v.toInt()) else minOf(count, v.toInt())
    return Pair(clamp(start), clamp(end ?: count.toDouble()))
}

/** `a.slice(start, end)`: negative indexes count from the end; out-of-range clamps. */
fun <T> jsSlice(a: List<T>, start: Double = 0.0, end: Double? = null): List<T> {
    val (lo, hi) = jsRange(a.size, start, end)
    return if (lo < hi) a.subList(lo, hi).toList() else emptyList()
}

/** `s.slice(start, end)` in UTF-16 units, as JavaScript indexes strings. */
fun jsSlice(s: String, start: Double = 0.0, end: Double? = null): String {
    val (lo, hi) = jsRange(s.length, start, end)
    return if (lo < hi) s.substring(lo, hi) else ""
}

fun jsCharAt(s: String, index: Double): String = jsSlice(s, index, index + 1)

/** `s.replace(a, b)` with a string pattern replaces the first match only. */
fun jsReplace(s: String, pattern: String, replacement: String): String = s.replaceFirst(pattern, replacement)

fun jsPadStart(s: String, length: Double, fill: String = " "): String {
    val missing = length.toInt() - s.length
    if (missing <= 0 || fill.isEmpty()) return s
    return fill.repeat(missing / fill.length + 1).substring(0, missing) + s
}

/** `Number(s)`, `parseInt(s)`: NaN where the text is not a number. */
fun jsNumber(s: String): Double = s.trim().toDoubleOrNull() ?: Double.NaN

fun jsToFixed(value: Double, digits: Double = 0.0): String =
    BigDecimal(value).setScale(digits.toInt(), java.math.RoundingMode.HALF_UP).toPlainString()

/** The key of an unkeyed `for` (Solid's `<For>`): the item itself, by reference for objects. */
fun jsKey(item: Any?): String = when (item) {
    null -> "null"
    is String -> item
    is Double -> js(item)
    is Boolean -> js(item)
    else -> "@" + System.identityHashCode(item)
}
