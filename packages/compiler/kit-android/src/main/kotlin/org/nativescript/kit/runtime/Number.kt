package org.nativescript.kit

import java.math.BigDecimal
import java.math.BigInteger
import java.math.MathContext
import java.math.RoundingMode

// Number to string

/** `String(n)`: Number::toString(10), shortest round-trip digits in JavaScript's layout. */
fun jsNumberToString(value: Double): String {
    if (value.isNaN()) return "NaN"
    if (value == 0.0) return "0"
    if (value.isInfinite()) return if (value < 0) "-Infinity" else "Infinity"
    if (value < 0) return "-" + jsNumberToString(-value)
    if (value < 9_007_199_254_740_992.0 && Math.floor(value) == value) return value.toLong().toString()
    val (digits, n) = jsShortestDigits(value)
    val k = digits.length
    return when {
        k <= n && n <= 21 -> digits + "0".repeat(n - k)
        0 < n && n <= 21 -> digits.substring(0, n) + "." + digits.substring(n)
        -6 < n && n <= 0 -> "0." + "0".repeat(-n) + digits
        else -> jsExponentialLayout(digits, n - 1)
    }
}

/** `n.toString(radix)` with V8's digits (DoubleToRadixCString), fractions included. */
fun jsNumberToString(x: Double, radix: Double): String {
    val r = jsToIntegerOrInfinity(radix)
    if (r < 2 || r > 36) throw JSException(JSRangeError("toString() radix argument must be between 2 and 36"))
    val base = r.toInt()
    if (base == 10 || x.isNaN() || x.isInfinite() || x == 0.0) return jsNumberToString(x)
    if (Math.abs(x) < 9_007_199_254_740_992.0 && Math.floor(x) == x) return java.lang.Long.toString(x.toLong(), base)
    val chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    val negative = x < 0
    val magnitude = if (negative) -x else x
    var integer = Math.floor(magnitude)
    var fraction = magnitude - integer
    var delta = maxOf(Double.MIN_VALUE, 0.5 * (Math.nextUp(magnitude) - magnitude))
    val fractionDigits = StringBuilder()
    val radixD = base.toDouble()
    if (fraction >= delta) {
        do {
            fraction *= radixD
            delta *= radixD
            val digit = fraction.toInt()
            fractionDigits.append(chars[digit])
            fraction -= digit
            if (fraction > 0.5 || (fraction == 0.5 && (digit and 1) != 0)) {
                if (fraction + delta > 1) {
                    while (true) {
                        if (fractionDigits.isEmpty()) {
                            integer += 1
                            break
                        }
                        val last = fractionDigits[fractionDigits.length - 1]
                        fractionDigits.setLength(fractionDigits.length - 1)
                        val d = chars.indexOf(last)
                        if (d + 1 < base) {
                            fractionDigits.append(chars[d + 1])
                            break
                        }
                    }
                    break
                }
            }
        } while (fraction >= delta)
    }
    val integerDigits = StringBuilder()
    while (v8Exponent(integer / radixD) > 0) {
        integer /= radixD
        integerDigits.append('0')
    }
    do {
        val remainder = integer % radixD
        integerDigits.append(chars[remainder.toInt()])
        integer = (integer - remainder) / radixD
    } while (integer > 0)
    val out = StringBuilder()
    if (negative) out.append('-')
    out.append(integerDigits.reverse())
    if (fractionDigits.isNotEmpty()) out.append('.').append(fractionDigits)
    return out.toString()
}

private fun v8Exponent(d: Double): Int = if (d == 0.0 || d < java.lang.Double.MIN_NORMAL) -1074 else Math.getExponent(d) - 52

/**
 * The shortest decimal digits that round-trip to a positive finite `value` (the closest such
 * when several do), and `n` with value = 0.d₁d₂… × 10ⁿ.
 */
internal fun jsShortestDigits(value: Double): Pair<String, Int> = JSShortestDouble.digits(value)

private fun jsExponentialLayout(digits: String, e: Int): String {
    val out = StringBuilder()
    out.append(digits[0])
    if (digits.length > 1) out.append('.').append(digits, 1, digits.length)
    return out.append('e').append(if (e >= 0) '+' else '-').append(Math.abs(e)).toString()
}

/** `n.toFixed(digits)`: the exact binary value rounded half up; |n| ≥ 1e21 prints as `String(n)`. */
fun jsToFixed(value: Double, digits: Double = 0.0): String {
    val f = jsToIntegerOrInfinity(digits)
    if (f < 0 || f > 100) throw JSException(JSRangeError("toFixed() digits argument must be between 0 and 100"))
    if (value.isNaN() || value.isInfinite() || Math.abs(value) >= 1e21) return jsNumberToString(value)
    val sign = if (value < 0) "-" else ""
    return sign + BigDecimal(Math.abs(value)).setScale(f.toInt(), RoundingMode.HALF_UP).toPlainString()
}

/** `n.toPrecision(precision)`; a missing precision is `String(n)`. */
fun jsToPrecision(value: Double, precision: Double?): String {
    if (precision == null) return jsNumberToString(value)
    val p = jsToIntegerOrInfinity(precision)
    if (value.isNaN() || value.isInfinite()) return jsNumberToString(value)
    if (p < 1 || p > 100) throw JSException(JSRangeError("toPrecision() argument must be between 1 and 100"))
    val count = p.toInt()
    val sign = if (value < 0) "-" else ""
    val (digits, e) = fixedDigits(Math.abs(value), count)
    return sign + when {
        e < -6 || e >= count -> jsExponentialLayout(digits, e)
        e == count - 1 -> digits
        e >= 0 -> digits.substring(0, e + 1) + "." + digits.substring(e + 1)
        else -> "0." + "0".repeat(-(e + 1)) + digits
    }
}

/** `n.toExponential(digits)`; missing digits uses as many as needed to round-trip. */
fun jsToExponential(value: Double, digits: Double? = null): String {
    if (value.isNaN() || value.isInfinite()) return jsNumberToString(value)
    val sign = if (value < 0) "-" else ""
    val magnitude = Math.abs(value)
    if (digits == null) {
        if (magnitude == 0.0) return sign + "0e+0"
        val (d, n) = jsShortestDigits(magnitude)
        return sign + jsExponentialLayout(d, n - 1)
    }
    val f = jsToIntegerOrInfinity(digits)
    if (f < 0 || f > 100) throw JSException(JSRangeError("toExponential() argument must be between 0 and 100"))
    val (d, e) = fixedDigits(magnitude, f.toInt() + 1)
    return sign + jsExponentialLayout(d, e)
}

/** Exactly `count` significant digits of `value` ≥ 0 (rounded half up) and the decimal exponent of the first. */
private fun fixedDigits(value: Double, count: Int): Pair<String, Int> {
    if (value == 0.0) return Pair("0".repeat(count), 0)
    val rounded = BigDecimal(value).round(MathContext(count, RoundingMode.HALF_UP))
    var unscaled = rounded.unscaledValue().toString()
    var exponent = unscaled.length - rounded.scale() - 1
    if (unscaled.length > count) unscaled = unscaled.substring(0, count)
    else if (unscaled.length < count) unscaled += "0".repeat(count - unscaled.length)
    return Pair(unscaled, exponent)
}

// String to number

/** JavaScript WhiteSpace and LineTerminator code units (what `trim` and `Number()` skip). */
fun jsIsWhitespace(c: Char): Boolean = when (c.code) {
    0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF -> true
    in 0x2000..0x200A -> true
    else -> false
}

private fun digitValue(c: Char): Int = when (c) {
    in '0'..'9' -> c - '0'
    in 'a'..'z' -> c - 'a' + 10
    in 'A'..'Z' -> c - 'A' + 10
    else -> 99
}

/** End of the longest unsigned StrDecimalLiteral starting at `start` (digits, fraction, exponent, or "Infinity"). */
private fun scanDecimal(u: String, start: Int, end: Int): Int? {
    if (end - start >= 8 && u.regionMatches(start, "Infinity", 0, 8)) return start + 8
    var i = start
    var digits = 0
    while (i < end && u[i] in '0'..'9') { i++; digits++ }
    if (i < end && u[i] == '.') {
        var j = i + 1
        var fraction = 0
        while (j < end && u[j] in '0'..'9') { j++; fraction++ }
        if (digits + fraction > 0) { i = j; digits += fraction }
    }
    if (digits == 0) return null
    if (i < end && (u[i] == 'e' || u[i] == 'E')) {
        var j = i + 1
        if (j < end && (u[j] == '+' || u[j] == '-')) j++
        val digitsStart = j
        while (j < end && u[j] in '0'..'9') j++
        if (j > digitsStart) i = j
    }
    return i
}

private fun decimalValue(text: String): Double {
    if (text.endsWith("Infinity")) return if (text.startsWith("-")) Double.NEGATIVE_INFINITY else Double.POSITIVE_INFINITY
    return text.toDoubleOrNull() ?: Double.NaN
}

/** The nearest double to an integer, ties to even. */
private fun bigToDouble(big: BigInteger): Double {
    val width = big.bitLength()
    if (width <= 63) return big.toLong().toDouble()
    val shift = width - 63
    var top = big.shiftRight(shift).toLong()
    if (big.lowestSetBit < shift) top = top or 1L
    return Math.scalb(top.toDouble(), shift)
}

private fun parseDigits(digits: String, radix: Int): Double = bigToDouble(BigInteger(digits, radix))

/** `Number(string)`: whitespace-trimmed decimal, `0x`/`0o`/`0b` integers, "" is 0, anything else NaN. */
fun jsNumberFromString(s: String): Double {
    var start = 0
    var end = s.length
    while (start < end && jsIsWhitespace(s[start])) start++
    while (end > start && jsIsWhitespace(s[end - 1])) end--
    if (start == end) return 0.0
    val u = s.substring(start, end)
    if (u.length > 2 && u[0] == '0') {
        val radix = when (u[1]) {
            'x', 'X' -> 16
            'o', 'O' -> 8
            'b', 'B' -> 2
            else -> 0
        }
        if (radix != 0) {
            val digits = u.substring(2)
            if (!digits.all { digitValue(it) < radix }) return Double.NaN
            return parseDigits(digits, radix)
        }
    }
    val i = if (u[0] == '+' || u[0] == '-') 1 else 0
    val stop = scanDecimal(u, i, u.length)
    if (stop != u.length) return Double.NaN
    return decimalValue(u)
}

/** `parseFloat(string)`: the longest decimal prefix after leading whitespace, else NaN. */
fun jsParseFloat(s: String): Double {
    var start = 0
    while (start < s.length && jsIsWhitespace(s[start])) start++
    var i = start
    if (i < s.length && (s[i] == '+' || s[i] == '-')) i++
    val stop = scanDecimal(s, i, s.length) ?: return Double.NaN
    return decimalValue(s.substring(start, stop))
}

/**
 * `parseInt(string, radix)`, digits accumulated as V8 does: exactly for radix 10 and powers
 * of two, otherwise in 32-bit chunks after the leading zeros.
 */
fun jsParseInt(s: String, radix: Double? = null): Double {
    var i = 0
    while (i < s.length && jsIsWhitespace(s[i])) i++
    var sign = 1.0
    if (i < s.length && (s[i] == '-' || s[i] == '+')) {
        if (s[i] == '-') sign = -1.0
        i++
    }
    var r = jsToInt32(radix ?: 0.0)
    var stripPrefix = true
    if (r != 0) {
        if (r < 2 || r > 36) return Double.NaN
        if (r != 16) stripPrefix = false
    } else r = 10
    if (stripPrefix && i + 1 < s.length && s[i] == '0' && (s[i + 1] == 'x' || s[i + 1] == 'X')) {
        i += 2
        r = 16
    }
    val start = i
    while (i < s.length && digitValue(s[i]) < r) i++
    if (i == start) return Double.NaN
    val digits = s.substring(start, i)
    if (r == 10) return sign * digits.toDouble()
    if (r and (r - 1) == 0) return sign * parseDigits(digits, r)
    var result = 0.0
    var index = 0
    while (index < digits.length && digits[index] == '0') index++
    val maximumMultiplier = 0xFFFFFFFFL / 36
    while (index < digits.length) {
        var part = 0L
        var multiplier = 1L
        while (index < digits.length) {
            val m = multiplier * r
            if (m > maximumMultiplier) break
            part = part * r + digitValue(digits[index])
            multiplier = m
            index++
        }
        // V8 computes `result * multiplier + part` with a fused multiply-add on arm64.
        result = fusedMultiplyAdd(result, multiplier.toDouble(), part.toDouble())
    }
    return sign * result
}

private fun fusedMultiplyAdd(a: Double, b: Double, c: Double): Double {
    if (a.isInfinite()) return a
    return BigDecimal(a).multiply(BigDecimal(b)).add(BigDecimal(c)).toString().toDouble()
}

// Integer operators

/** ToInt32. */
fun jsToInt32(value: Double): Int {
    if (value >= -2_147_483_648.0 && value <= 2_147_483_647.0) return value.toInt()
    if (value.isNaN() || value.isInfinite()) return 0
    var m = (if (value < 0) Math.ceil(value) else Math.floor(value)) % 4_294_967_296.0
    if (m < 0) m += 4_294_967_296.0
    return m.toLong().toInt()
}

/** ToUint32, as a `Long` in 0…4294967295. */
fun jsToUint32(value: Double): Long = jsToInt32(value).toLong() and 0xFFFFFFFFL

/** `a | b`. */
fun jsBitOr(a: Double, b: Double): Double = (jsToInt32(a) or jsToInt32(b)).toDouble()

/** `a & b`. */
fun jsBitAnd(a: Double, b: Double): Double = (jsToInt32(a) and jsToInt32(b)).toDouble()

/** `a ^ b`. */
fun jsBitXor(a: Double, b: Double): Double = (jsToInt32(a) xor jsToInt32(b)).toDouble()

/** `~a`. */
fun jsBitNot(a: Double): Double = jsToInt32(a).inv().toDouble()

/** `a << b`. */
fun jsShiftLeft(a: Double, b: Double): Double = (jsToInt32(a) shl (jsToUint32(b) and 31).toInt()).toDouble()

/** `a >> b`. */
fun jsShiftRight(a: Double, b: Double): Double = (jsToInt32(a) shr (jsToUint32(b) and 31).toInt()).toDouble()

/** `a >>> b`. */
fun jsShiftRightUnsigned(a: Double, b: Double): Double = (jsToUint32(a) ushr (jsToUint32(b) and 31).toInt()).toDouble()
