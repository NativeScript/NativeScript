package org.nativescript.kit

import java.text.Collator
import java.util.Locale

// String and Math members whose JavaScript behavior differs from Kotlin's. Kotlin strings
// index UTF-16 code units, as JavaScript's do.

private fun clampIndex(v: Double, count: Int): Int = if (v.isNaN()) 0 else maxOf(0.0, minOf(count.toDouble(), jsToIntegerOrInfinity(v))).toInt()

/** Compares strings by UTF-16 code units, as JavaScript's `<` does: -1, 0 or 1. */
fun jsCompare(a: String, b: String): Int = a.compareTo(b).let { if (it < 0) -1 else if (it > 0) 1 else 0 }

fun jsIncludes(s: String, search: String, position: Double? = null): Boolean = s.indexOf(search, clampIndex(position ?: 0.0, s.length)) >= 0

fun jsStartsWith(s: String, search: String, position: Double? = null): Boolean = s.startsWith(search, clampIndex(position ?: 0.0, s.length))

fun jsEndsWith(s: String, search: String, endPosition: Double? = null): Boolean {
    val end = clampIndex(endPosition ?: s.length.toDouble(), s.length)
    return search.length <= end && s.regionMatches(end - search.length, search, 0, search.length)
}

fun jsIndexOf(s: String, search: String, position: Double? = null): Double {
    val start = clampIndex(position ?: 0.0, s.length)
    if (search.isEmpty()) return start.toDouble()
    return s.indexOf(search, start).toDouble()
}

fun jsLastIndexOf(s: String, search: String): Double = s.lastIndexOf(search).toDouble()

/** `s.slice(start, end)`: negative indexes count from the end; out-of-range clamps. */
fun jsSlice(s: String, start: Double = 0.0, end: Double? = null): String {
    val a = jsRelativeIndex(start, s.length)
    val b = if (end == null) s.length else jsRelativeIndex(end, s.length)
    return if (a < b) s.substring(a, b) else ""
}

/** `s.substring(a, b)`: negative and NaN are 0, and the bounds swap if reversed. */
fun jsSubstring(s: String, start: Double, end: Double? = null): String {
    var a = clampIndex(start, s.length)
    var b = clampIndex(end ?: s.length.toDouble(), s.length)
    if (a > b) { val t = a; a = b; b = t }
    return s.substring(a, b)
}

fun jsCharAt(s: String, index: Double): String {
    val i = jsToIntegerOrInfinity(index)
    return if (i >= 0 && i < s.length) s[i.toInt()].toString() else ""
}

fun jsCharCodeAt(s: String, index: Double): Double {
    val i = jsToIntegerOrInfinity(index)
    return if (i >= 0 && i < s.length) s[i.toInt()].code.toDouble() else Double.NaN
}

fun jsCodePointAt(s: String, index: Double): Double? {
    val i = jsToIntegerOrInfinity(index)
    if (i < 0 || i >= s.length) return null
    return s.codePointAt(i.toInt()).toDouble()
}

fun jsStringAt(s: String, index: Double): String? {
    var i = jsToIntegerOrInfinity(index)
    if (i < 0) i += s.length
    return if (i >= 0 && i < s.length) s[i.toInt()].toString() else null
}

fun jsFromCharCode(vararg codes: Double): String = String(CharArray(codes.size) { (jsToUint32(codes[it]).toInt() and 0xFFFF).toChar() })

/** What `for (const c of s)` visits: code points, a surrogate pair together. */
fun jsCodePoints(s: String): List<String> {
    val out = ArrayList<String>()
    var i = 0
    while (i < s.length) {
        val n = Character.charCount(s.codePointAt(i))
        out.add(s.substring(i, i + n))
        i += n
    }
    return out
}

/** `s.split(separator, limit)` with a string separator. */
fun jsSplit(s: String, separator: String?, limit: Double? = null): JSArray<String> {
    val max = if (limit == null) Long.MAX_VALUE else jsToUint32(limit).toLong() and 0xFFFFFFFFL
    if (separator == null) return JSArray(if (max > 0) listOf(s) else emptyList())
    val parts = ArrayList<String>()
    if (max == 0L) return JSArray(parts)
    if (separator.isEmpty()) {
        for (c in s) { if (parts.size >= max) break; parts.add(c.toString()) }
        return JSArray(parts)
    }
    var start = 0
    while (parts.size < max) {
        val i = s.indexOf(separator, start)
        if (i < 0) break
        parts.add(s.substring(start, i))
        start = i + separator.length
    }
    if (parts.size < max) parts.add(s.substring(start))
    return JSArray(parts)
}

/** GetSubstitution for a string pattern: `$$`, `$&`, `` $` `` and `$'`. */
private fun substitute(template: String, matched: String, position: Int, s: String): String {
    if (!template.contains('$')) return template
    val out = StringBuilder()
    var i = 0
    while (i < template.length) {
        val c = template[i]
        if (c == '$' && i + 1 < template.length) {
            when (template[i + 1]) {
                '$' -> { out.append('$'); i += 2; continue }
                '&' -> { out.append(matched); i += 2; continue }
                '`' -> { out.append(s, 0, position); i += 2; continue }
                '\'' -> { out.append(s, minOf(s.length, position + matched.length), s.length); i += 2; continue }
            }
        }
        out.append(c)
        i++
    }
    return out.toString()
}

/** `s.replace(a, b)` with a string pattern replaces the first match only. */
fun jsReplace(s: String, pattern: String, replacement: String): String {
    val i = s.indexOf(pattern)
    if (i < 0) return s
    return s.substring(0, i) + substitute(replacement, pattern, i, s) + s.substring(i + pattern.length)
}

fun jsReplaceAll(s: String, pattern: String, replacement: String): String {
    val positions = ArrayList<Int>()
    if (pattern.isEmpty()) for (i in 0..s.length) positions.add(i)
    else {
        var i = s.indexOf(pattern)
        while (i >= 0) { positions.add(i); i = s.indexOf(pattern, i + pattern.length) }
    }
    val out = StringBuilder()
    var end = 0
    for (p in positions) {
        out.append(s, end, p)
        out.append(substitute(replacement, pattern, p, s))
        end = p + pattern.length
    }
    out.append(s, minOf(end, s.length), s.length)
    return out.toString()
}

fun jsPadStart(s: String, length: Double, fill: String = " "): String {
    val missing = length.toInt() - s.length
    if (missing <= 0 || fill.isEmpty()) return s
    return fill.repeat(missing / fill.length + 1).substring(0, missing) + s
}

fun jsPadEnd(s: String, length: Double, fill: String = " "): String {
    val missing = length.toInt() - s.length
    if (missing <= 0 || fill.isEmpty()) return s
    return s + fill.repeat(missing / fill.length + 1).substring(0, missing)
}

fun jsRepeat(s: String, count: Double): String {
    if (count < 0 || count.isInfinite()) throw JSException(JSRangeError("Invalid count value: ${jsNumberToString(count)}"))
    return s.repeat(jsToIntegerOrInfinity(count).toInt())
}

private fun isWhitespace(c: Char): Boolean = when (c.code) {
    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF -> true
    in 0x2000..0x200A -> true
    else -> false
}

fun jsTrimStart(s: String): String = s.trimStart(::isWhitespace)
fun jsTrimEnd(s: String): String = s.trimEnd(::isWhitespace)
fun jsTrim(s: String): String = s.trim(::isWhitespace)

private val collator: Collator by lazy { Collator.getInstance(Locale.ENGLISH) }

fun jsLocaleCompare(a: String, b: String): Double = collator.compare(a, b).let { if (it < 0) -1.0 else if (it > 0) 1.0 else 0.0 }

/** `s.toUpperCase()`: locale-independent, as JavaScript's is. */
fun jsUpperCase(s: String): String = s.uppercase(Locale.ROOT)
fun jsLowerCase(s: String): String = s.lowercase(Locale.ROOT)

// Math and Number

/** `Math.round`: halves round toward +∞, and -0.5…-0 round to -0. */
fun jsRound(value: Double): Double {
    if (value.isNaN() || value.isInfinite()) return value
    val r = Math.floor(value + 0.5)
    return if (r == 0.0 && value < 0) -0.0 else r
}

fun jsSign(x: Double): Double = if (x.isNaN()) Double.NaN else if (x > 0) 1.0 else if (x < 0) -1.0 else x
fun jsFround(x: Double): Double = x.toFloat().toDouble()
fun jsTrunc(x: Double): Double = if (x < 0) Math.ceil(x) else Math.floor(x)

fun jsHypot(vararg values: Double): Double {
    if (values.any { it.isInfinite() }) return Double.POSITIVE_INFINITY
    if (values.any { it.isNaN() }) return Double.NaN
    return Math.sqrt(values.sumOf { it * it })
}

/** `**` and `Math.pow`: 1 ** NaN and (±1) ** ±Infinity are NaN in JavaScript. */
fun jsPow(base: Double, exponent: Double): Double {
    if (exponent.isNaN()) return Double.NaN
    if (Math.abs(base) == 1.0 && exponent.isInfinite()) return Double.NaN
    return Math.pow(base, exponent)
}

/** `Math.max`: NaN wins, +0 beats -0, and no arguments is -Infinity. */
fun jsMathMax(vararg values: Double): Double {
    var out = Double.NEGATIVE_INFINITY
    for (v in values) {
        if (v.isNaN()) return Double.NaN
        if (v > out || (v == 0.0 && out == 0.0 && 1.0 / out < 0)) out = v
    }
    return out
}

fun jsMathMin(vararg values: Double): Double {
    var out = Double.POSITIVE_INFINITY
    for (v in values) {
        if (v.isNaN()) return Double.NaN
        if (v < out || (v == 0.0 && out == 0.0 && 1.0 / v < 0)) out = v
    }
    return out
}

fun jsMathMaxOf(values: Iterable<Double>): Double = jsMathMax(*values.toList().toDoubleArray())
fun jsMathMinOf(values: Iterable<Double>): Double = jsMathMin(*values.toList().toDoubleArray())

fun jsIsInteger(x: Double): Boolean = !x.isNaN() && !x.isInfinite() && Math.floor(x) == x
fun jsIsSafeInteger(x: Double): Boolean = jsIsInteger(x) && Math.abs(x) <= 9007199254740991.0
fun jsIsNaN(x: Double): Boolean = x.isNaN()
fun jsIsFinite(x: Double): Boolean = !x.isNaN() && !x.isInfinite()
