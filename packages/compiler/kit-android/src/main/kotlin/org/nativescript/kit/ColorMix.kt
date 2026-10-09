package org.nativescript.kit

import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cbrt
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * `color-mix()` as core evaluates it (color-utils `argbFromColorMix`):
 * @csstools/css-color-parser's `color()` and `serializeRGB`, whose
 * `rgba(r, g, b, a)` core then reads back. Every color converts through
 * XYZ D50 as csstools' does, so the rounding lands on the same integers.
 */
object ColorMix {
    /** 0xAARRGGBB, or null where csstools does not parse the value (core then stores -1). */
    fun argb(value: String): Int? {
        val color = parse(value.trim(' ', '\t')) ?: return null
        return serializeRGB(color)
    }

    /** core's `argbFromColorMix`, which the kit generated from core calls: -1 where csstools does not parse the value. */
    fun argbFromColorMix(value: String?): Double = argb(value ?: "")?.let { (it.toLong() and 0xFFFFFFFFL).toDouble() } ?: -1.0

    enum class Notation { HEX, RGB, SRGB, LINEAR_SRGB, HSL, HWB, LAB, LCH, OKLAB, OKLCH, XYZ_D50, XYZ_D65 }

    class ColorData(var notation: Notation, var channels: DoubleArray, var alpha: Double) {
        fun copy() = ColorData(notation, channels.copyOf(), alpha)
    }

    // Parsing

    private val NUMBER = Regex("[+-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)([eE][+-]?[0-9]+)?")

    /** A CSS number token; Kotlin's own parser also takes `NaN`, `Infinity` and `f`/`d` suffixes. */
    private fun double(text: CharSequence): Double? = if (NUMBER.matches(text)) text.toString().toDouble() else null

    private fun isWhitespace(c: Char) = c.isWhitespace()

    fun parse(input: String): ColorData? {
        val text = input.lowercase()
        if (text == "transparent") return ColorData(Notation.RGB, doubleArrayOf(0.0, 0.0, 0.0), 0.0)
        if (text.startsWith("#")) return hex(text.substring(1))
        namedColors[text]?.let { named -> return ColorData(Notation.RGB, DoubleArray(3) { named[it] / 255.0 }, 1.0) }
        val open = text.indexOf('(')
        if (open < 0 || !text.endsWith(")")) return null
        val name = text.substring(0, open)
        val body = text.substring(open + 1, text.length - 1)
        return when (name) {
            "color-mix" -> mix(body)
            "rgb", "rgba" -> rgb(body)
            "hsl", "hsla" -> hsl(body)
            "hwb" -> modern(body, Notation.HWB) { i, t -> if (i == 0) hue(t) else number(t, 1.0, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY) }
            "lab" -> modern(body, Notation.LAB) { i, t -> if (i == 0) number(t, 1.0, 0.0, 100.0) else number(t, 0.8, -2147483647.0, 2147483647.0) }
            "lch" -> modern(body, Notation.LCH) { i, t -> if (i == 0) number(t, 1.0, 0.0, 100.0) else if (i == 1) number(t, 100.0 / 150, 0.0, 2147483647.0) else hue(t) }
            "oklab" -> modern(body, Notation.OKLAB) { i, t -> if (i == 0) number(t, 100.0, 0.0, 1.0) else number(t, 250.0, -2147483647.0, 2147483647.0) }
            "oklch" -> modern(body, Notation.OKLCH) { i, t -> if (i == 0) number(t, 100.0, 0.0, 1.0) else if (i == 1) number(t, 250.0, 0.0, 2147483647.0) else hue(t) }
            else -> null
        }
    }

    private fun hex(digits: String): ColorData? {
        if (digits.length !in setOf(3, 4, 6, 8) || !digits.all { it in '0'..'9' || it in 'a'..'f' }) return null
        val full = if (digits.length <= 4) digits.map { "$it$it" }.joinToString("") else digits
        val bytes = (0 until full.length step 2).map { full.substring(it, it + 2).toInt(16) / 255.0 }
        return ColorData(Notation.HEX, doubleArrayOf(bytes[0], bytes[1], bytes[2]), if (bytes.size == 4) bytes[3] else 1.0)
    }

    /** A number token: its value, or a percentage divided by `percent`, clamped as csstools' `normalize`. */
    private fun number(token: String, percent: Double, min: Double, max: Double, plain: Double = 1.0): Double? {
        if (token == "none") return Double.NaN
        if (token.endsWith("%")) {
            val v = double(token.dropLast(1)) ?: return null
            return minOf(maxOf(v / percent, min), max)
        }
        val v = double(token) ?: return null
        return minOf(maxOf(v / plain, min), max)
    }

    private fun hue(token: String): Double? {
        if (token == "none") return Double.NaN
        double(token)?.let { return it % 360 }
        for ((unit, scale) in listOf("deg" to 1.0, "grad" to 0.9, "rad" to 180 / Math.PI, "turn" to 360.0)) {
            if (!token.endsWith(unit)) continue
            val v = double(token.dropLast(unit.length)) ?: return null
            return (if (unit == "rad") 180 * v / Math.PI else v * scale) % 360
        }
        return null
    }

    private fun alpha(token: String): Double? {
        if (token == "none") return Double.NaN
        return number(token, 100.0, 0.0, 1.0)
    }

    /** Space-separated channels with an optional `/ alpha`. */
    private fun modern(body: String, notation: Notation, channel: (Int, String) -> Double?): ColorData? {
        val parts = body.replace("/", " / ").split(Regex("\\s+")).filter { it.isNotEmpty() }
        if (!(parts.size == 3 || (parts.size == 5 && parts[3] == "/"))) return null
        val channels = DoubleArray(3)
        for (i in 0 until 3) channels[i] = channel(i, parts[i]) ?: return null
        val a = (if (parts.size == 5) alpha(parts[4]) else 1.0) ?: return null
        return ColorData(notation, channels, a)
    }

    /** Swift's `split(separator:)`: empty pieces dropped, then each trimmed. */
    private fun commaParts(body: String): List<String> = body.split(",").filter { it.isNotEmpty() }.map { it.trim(' ', '\t') }

    private fun rgb(body: String): ColorData? {
        if (body.contains(",")) {
            val parts = commaParts(body)
            if (parts.size != 3 && parts.size != 4) return null
            val percents = parts.take(3).count { it.endsWith("%") }
            if (percents != 0 && percents != 3) return null
            val channels = DoubleArray(3)
            for (i in 0 until 3) {
                val v = number(parts[i], 100.0, 0.0, 1.0, 255.0) ?: return null
                if (v.isNaN()) return null
                channels[i] = v
            }
            val a = (if (parts.size == 4) number(parts[3], 100.0, 0.0, 1.0) else 1.0) ?: return null
            return ColorData(Notation.RGB, channels, a)
        }
        return modern(body, Notation.RGB) { _, t -> number(t, 100.0, -2147483647.0, 2147483647.0, 255.0) }
    }

    private fun hsl(body: String): ColorData? {
        if (body.contains(",")) {
            val parts = commaParts(body)
            if (parts.size != 3 && parts.size != 4) return null
            val h = hue(parts[0]) ?: return null
            if (h.isNaN() || !parts[1].endsWith("%") || !parts[2].endsWith("%")) return null
            val s = number(parts[1], 1.0, 0.0, 100.0) ?: return null
            val l = number(parts[2], 1.0, 0.0, 100.0) ?: return null
            val a = (if (parts.size == 4) number(parts[3], 100.0, 0.0, 1.0) else 1.0) ?: return null
            return ColorData(Notation.HSL, doubleArrayOf(h, s, l), a)
        }
        return modern(body, Notation.HSL) { i, t ->
            when (i) {
                0 -> hue(t)
                1 -> number(t, 1.0, 0.0, 2147483647.0)
                else -> if (t.endsWith("%")) double(t.dropLast(1)) else if (t == "none") Double.NaN else double(t)
            }
        }
    }

    /** The parts of `body` split where `separator` says, separators inside parentheses kept. */
    private fun topLevelParts(body: String, separator: (Char) -> Boolean): List<String> {
        val parts = mutableListOf<String>()
        var depth = 0
        val current = StringBuilder()
        for (c in body) {
            if (c == '(') depth++ else if (c == ')') depth--
            if (depth == 0 && separator(c)) {
                parts.add(current.toString())
                current.clear()
            } else current.append(c)
        }
        parts.add(current.toString())
        return parts.map { it.trim(' ', '\t') }
    }

    private val rectangular = mapOf(
        "srgb" to Notation.RGB, "srgb-linear" to Notation.LINEAR_SRGB, "lab" to Notation.LAB, "oklab" to Notation.OKLAB,
        "xyz" to Notation.XYZ_D65, "xyz-d65" to Notation.XYZ_D65, "xyz-d50" to Notation.XYZ_D50,
    )
    private val polar = mapOf("hsl" to Notation.HSL, "hwb" to Notation.HWB, "lch" to Notation.LCH, "oklch" to Notation.OKLCH)

    private class Item(val color: ColorData, var percentage: Double)

    /** `colorMix`: `in <space> [<hue> hue]`, then colors with optional percentages. */
    private fun mix(body: String): ColorData? {
        val parts = topLevelParts(body) { it == ',' }.toMutableList()
        var space = "oklab"
        var hueMethod: String? = null
        val first = parts.firstOrNull()
        if (first != null && (first.startsWith("in ") || first == "in")) {
            val words = first.split(Regex("\\s+")).filter { it.isNotEmpty() }
            if (words.size < 2) return null
            space = words[1]
            if (words.size == 4 && words[3] == "hue" && polar[space] != null && words[2] in setOf("shorter", "longer", "increasing", "decreasing")) {
                hueMethod = words[2]
            } else if (words.size != 2) {
                return null
            }
            parts.removeAt(0)
        }
        val given = mutableListOf<Pair<ColorData, Double?>>()
        for (part in parts) {
            val words = topLevelParts(part, ::isWhitespace).filter { it.isNotEmpty() }
            var percentage: Double? = null
            val colorWords = mutableListOf<String>()
            for (w in words) {
                val v = if (w.endsWith("%") && percentage == null) double(w.dropLast(1)) else null
                if (v != null) {
                    if (v < 0) return null
                    percentage = v
                } else colorWords.add(w)
            }
            if (colorWords.size != 1) return null
            val color = parse(colorWords[0]) ?: return null
            given.add(Pair(color, percentage))
        }
        if (given.isEmpty()) return null
        // colorMixComponents
        var total = 0.0
        var unspecified = 0.0
        for ((_, p) in given) {
            if (p != null) {
                if (p > 100) return null
                total += p
            } else unspecified += 1
        }
        val remainder = maxOf(0.0, 100 - total)
        total = 0.0
        val colors = given.map { (color, p) ->
            val percentage = p ?: (remainder / unspecified)
            total += percentage
            Item(color, percentage)
        }
        if (total == 0.0) return ColorData(Notation.SRGB, doubleArrayOf(0.0, 0.0, 0.0), 0.0)
        var alphaMultiplier = 1.0
        if (total > 100) for (c in colors) c.percentage = c.percentage / total * 100
        if (total < 100) {
            alphaMultiplier = total / 100
            for (c in colors) c.percentage = c.percentage / total * 100
        }
        val isPolar = rectangular[space] == null
        val notation = rectangular[space] ?: polar[space] ?: return null
        if (colors.size == 1) {
            val result = to(colors[0].color, notation)
            result.notation = notation
            result.alpha *= alphaMultiplier
            return result
        }
        val stack = colors.reversed().toMutableList()
        while (stack.size >= 2) {
            val a = stack.removeAt(stack.size - 1)
            val b = stack.removeAt(stack.size - 1)
            val mixed = (if (isPolar) polarPair(notation, hueMethod ?: "shorter", a.color, a.percentage, b.color, b.percentage)
                else rectangularPair(notation, a.color, a.percentage, b.color, b.percentage)) ?: return null
            stack.add(Item(mixed, a.percentage + b.percentage))
        }
        val result = stack[0].color
        result.alpha *= alphaMultiplier
        return result
    }

    private fun fill(a: Double, b: Double) = if (a.isNaN()) b else a
    private fun interpolate(a: Double, b: Double, t: Double) = a * t + b * (1 - t)
    private fun premultiply(v: Double, a: Double) = if (a.isNaN()) v else if (v.isNaN()) Double.NaN else v * a
    private fun unPremultiply(v: Double, a: Double) = if (a == 0.0 || a.isNaN()) v else if (v.isNaN()) Double.NaN else v / a

    private fun rectangularPair(notation: Notation, a: ColorData, p: Double, b: ColorData, q: Double): ColorData {
        val t = p / (p + q)
        var alphaA = a.alpha
        var alphaB = b.alpha
        alphaA = if (alphaA.isNaN()) alphaB else alphaA
        alphaB = if (alphaB.isNaN()) alphaA else alphaB
        val u = to(a, notation).channels
        val v = to(b, notation).channels
        for (i in 0 until 3) { val ui = u[i]; u[i] = fill(u[i], v[i]); v[i] = fill(v[i], ui) }
        for (i in 0 until 3) { u[i] = premultiply(u[i], alphaA); v[i] = premultiply(v[i], alphaB) }
        val alpha = interpolate(alphaA, alphaB, t)
        return ColorData(notation, DoubleArray(3) { unPremultiply(interpolate(u[it], v[it], t), alpha) }, alpha)
    }

    private fun polarPair(notation: Notation, method: String, a: ColorData, p: Double, b: ColorData, q: Double): ColorData? {
        val t = p / (p + q)
        var alphaA = a.alpha
        var alphaB = b.alpha
        alphaA = if (alphaA.isNaN()) alphaB else alphaA
        alphaB = if (alphaB.isNaN()) alphaA else alphaB
        val x = to(a, notation).channels
        val y = to(b, notation).channels
        val hueFirst = notation == Notation.HSL || notation == Notation.HWB
        var h1 = if (hueFirst) x[0] else x[2]
        var h2 = if (hueFirst) y[0] else y[2]
        var c1 = if (hueFirst) x[1] else x[0]
        var c2 = if (hueFirst) y[1] else y[0]
        var l1 = if (hueFirst) x[2] else x[1]
        var l2 = if (hueFirst) y[2] else y[1]
        h1 = fill(h1, h2); if (h1.isNaN()) h1 = 0.0
        h2 = fill(h2, h1); if (h2.isNaN()) h2 = 0.0
        val c1o = c1; c1 = fill(c1, c2); c2 = fill(c2, c1o)
        val l1o = l1; l1 = fill(l1, l2); l2 = fill(l2, l1o)
        val d = h2 - h1
        when (method) {
            "shorter" -> if (d > 180) h1 += 360 else if (d < -180) h2 += 360
            "longer" -> if (-180 < d && d < 180) { if (d > 0) h1 += 360 else h2 += 360 }
            "increasing" -> if (d < 0) h2 += 360
            "decreasing" -> if (d > 0) h1 += 360
            else -> return null
        }
        c1 = premultiply(c1, alphaA); l1 = premultiply(l1, alphaA)
        c2 = premultiply(c2, alphaB); l2 = premultiply(l2, alphaB)
        val alpha = interpolate(alphaA, alphaB, t)
        val hue = interpolate(h1, h2, t)
        val first = unPremultiply(interpolate(c1, c2, t), alpha)
        val second = unPremultiply(interpolate(l1, l2, t), alpha)
        return ColorData(notation, if (hueFirst) doubleArrayOf(hue, first, second) else doubleArrayOf(first, second, hue), alpha)
    }

    // Conversion

    private fun nanToZero(c: DoubleArray) = DoubleArray(c.size) { if (c[it].isNaN()) 0.0 else c[it] }

    private fun reducePrecision(v: Double, digits: Double = 7.0): Double {
        if (v.isNaN()) return 0.0
        val n = 10.0.pow(digits)
        return jsRound(v * n) / n
    }

    fun toXYZD50(color: ColorData): DoubleArray {
        val c = nanToZero(color.channels)
        return when (color.notation) {
            Notation.HEX, Notation.RGB, Notation.SRGB -> d65ToD50(multiply(linSRGBToXYZ, linSRGB(c)))
            Notation.LINEAR_SRGB -> d65ToD50(multiply(linSRGBToXYZ, c))
            Notation.HSL -> d65ToD50(multiply(linSRGBToXYZ, linSRGB(hslToSRGB(c))))
            Notation.HWB -> d65ToD50(multiply(linSRGBToXYZ, linSRGB(hwbToSRGB(c))))
            Notation.LAB -> labToXYZ(c)
            Notation.LCH -> labToXYZ(polarToRect(c))
            Notation.OKLAB -> d65ToD50(oklabToXYZ(c))
            Notation.OKLCH -> d65ToD50(oklabToXYZ(polarToRect(c)))
            Notation.XYZ_D50 -> c
            Notation.XYZ_D65 -> d65ToD50(c)
        }
    }

    fun fromXYZD50(xyz: DoubleArray, notation: Notation): DoubleArray = when (notation) {
        Notation.HEX, Notation.RGB, Notation.SRGB -> gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
        Notation.LINEAR_SRGB -> multiply(xyzToLinSRGB, d50ToD65(xyz))
        Notation.HSL -> sRGBToHSL(gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz))))
        Notation.HWB -> {
            val s = gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
            doubleArrayOf(sRGBToHue(s), 100 * s.min(), 100 * (1 - s.max()))
        }
        Notation.LAB -> xyzToLab(xyz)
        Notation.LCH -> rectToPolar(xyzToLab(xyz))
        Notation.OKLAB -> xyzToOKLab(d50ToD65(xyz))
        Notation.OKLCH -> rectToPolar(xyzToOKLab(d50ToD65(xyz)))
        Notation.XYZ_D50 -> xyz
        Notation.XYZ_D65 -> d50ToD65(xyz)
    }

    private val rgbLike = setOf(Notation.HEX, Notation.LINEAR_SRGB, Notation.RGB, Notation.SRGB, Notation.XYZ_D50, Notation.XYZ_D65)
    private val labs = setOf(Notation.LAB, Notation.OKLAB)
    private val lchs = setOf(Notation.LCH, Notation.OKLCH)

    /** `colorDataTo`, with its carrying forward of missing components. */
    fun to(color: ColorData, target: Notation): ColorData {
        val result = color.copy()
        if (color.notation != target) {
            result.notation = if (target == Notation.HEX) Notation.RGB else target
            result.channels = fromXYZD50(toXYZD50(color), target)
        } else {
            result.channels = nanToZero(color.channels)
        }
        // csstools' `carryForwardMissingComponents` indexes `from` by its own values.
        fun carry(from: IntArray, to: IntArray) {
            for (n in from) {
                if (n >= from.size || !color.channels[from[n]].isNaN()) continue
                result.channels[to[n]] = Double.NaN
            }
        }
        val source = color.notation
        val all = intArrayOf(0, 1, 2)
        if (target == source || (target in rgbLike && source in rgbLike)) {
            carry(all, all)
        } else when {
            target == Notation.HSL && source == Notation.HWB -> carry(intArrayOf(0), intArrayOf(0))
            target == Notation.HSL && source in labs -> carry(intArrayOf(2), intArrayOf(0))
            target == Notation.HSL && source in lchs -> carry(all, intArrayOf(2, 1, 0))
            target == Notation.HWB && source == Notation.HSL -> carry(intArrayOf(0), intArrayOf(0))
            target == Notation.HWB && source in lchs -> carry(intArrayOf(0), intArrayOf(2))
            target in labs && source == Notation.HSL -> carry(intArrayOf(0), intArrayOf(2))
            target in labs && source in labs -> carry(all, all)
            target in labs && source in lchs -> carry(intArrayOf(0), intArrayOf(0))
            target in lchs && source == Notation.HSL -> carry(all, intArrayOf(2, 1, 0))
            target in lchs && source == Notation.HWB -> carry(intArrayOf(0), intArrayOf(2))
            target in lchs && source in labs -> carry(intArrayOf(0), intArrayOf(0))
            target in lchs && source in lchs -> carry(all, all)
        }
        // convertPowerlessComponentsToMissingComponents
        val c = result.channels
        when (target) {
            Notation.HSL -> if (!c[1].isNaN() && reducePrecision(c[1], 4.0) <= 0) c[0] = Double.NaN
            Notation.HWB -> if (maxOf(0.0, reducePrecision(c[1], 4.0)) + maxOf(0.0, reducePrecision(c[2], 4.0)) >= 100) c[0] = Double.NaN
            Notation.LCH -> if (!c[1].isNaN() && reducePrecision(c[1], 4.0) <= 0) c[2] = Double.NaN
            Notation.OKLCH -> if (!c[1].isNaN() && reducePrecision(c[1], 6.0) <= 0) c[2] = Double.NaN
            else -> {}
        }
        return result
    }

    // Serialization

    /** `toPrecision(e, 7)`. */
    private fun toPrecision(v: Double, digits: Int = 7): Double {
        val integerDigits = floor(abs(v)).toLong().toString().length
        if (digits > integerDigits) return jsToFixed(v, (digits - integerDigits).toDouble()).toDouble()
        val r = 10.0.pow(integerDigits - digits)
        return jsRound(v / r) * r
    }

    /** `serializeRGB` and core's `argbFromRgbOrRgba` reading its output. */
    fun serializeRGB(color: ColorData): Int {
        val c = color.channels.copyOf()
        when (color.notation) {
            Notation.HSL -> {
                if (reducePrecision(c[2]) <= 0 || reducePrecision(c[2]) >= 100) { c[0] = Double.NaN; c[1] = Double.NaN }
                if (reducePrecision(c[1]) <= 0) c[0] = Double.NaN
            }
            Notation.HWB -> if (maxOf(0.0, reducePrecision(c[1])) + maxOf(0.0, reducePrecision(c[2])) >= 100) c[0] = Double.NaN
            Notation.LAB -> if (reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 100) { c[1] = Double.NaN; c[2] = Double.NaN }
            Notation.LCH -> {
                if (reducePrecision(c[1]) <= 0) c[2] = Double.NaN
                if (reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 100) { c[1] = Double.NaN; c[2] = Double.NaN }
            }
            Notation.OKLAB -> if (reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 1) { c[1] = Double.NaN; c[2] = Double.NaN }
            Notation.OKLCH -> {
                if (reducePrecision(c[1]) <= 0) c[2] = Double.NaN
                if (reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 1) { c[1] = Double.NaN; c[2] = Double.NaN }
            }
            else -> {}
        }
        val rgb = xyzD50ToSRGBGamut(toXYZD50(ColorData(color.notation, c, color.alpha)))
        val channels = IntArray(3) { minOf(255.0, maxOf(0.0, jsRound(255 * toPrecision(rgb[it])))).toInt() }
        val alpha = minOf(1.0, maxOf(0.0, toPrecision(if (color.alpha.isNaN()) 0.0 else color.alpha)))
        val shown = toPrecision(alpha, 4)
        val a = if (shown == 1.0) 255 else jsRound(shown * 255).toInt()
        return ((a and 0xff) shl 24) or ((channels[0] and 0xff) shl 16) or ((channels[1] and 0xff) shl 8) or (channels[2] and 0xff)
    }

    private fun inGamut(c: DoubleArray) = c.all { it >= -1e-4 && it <= 1.0001 }
    private fun clip(c: DoubleArray) = DoubleArray(c.size) { if (c[it] < 0) 0.0 else if (c[it] > 1) 1.0 else c[it] }

    private fun xyzD50ToSRGBGamut(xyz: DoubleArray): DoubleArray {
        val srgb = gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
        if (inGamut(srgb)) return clip(srgb)
        var oklch = rectToPolar(xyzToOKLab(d50ToD65(xyz)))
        if (oklch[0] < 1e-6) oklch = doubleArrayOf(0.0, 0.0, 0.0)
        if (oklch[0] > 0.999999) oklch = doubleArrayOf(1.0, 0.0, 0.0)
        return gamSRGB(mapGamutRayTrace(oklch))
    }

    private fun oklchToLinSRGB(c: DoubleArray) = multiply(xyzToLinSRGB, oklabToXYZ(polarToRect(c)))
    private fun linSRGBToOKLCH(c: DoubleArray) = rectToPolar(xyzToOKLab(multiply(linSRGBToXYZ, c)))

    private fun mapGamutRayTrace(color: DoubleArray): DoubleArray {
        val l = color[0]
        val h = color[2]
        var mapped = oklchToLinSRGB(color)
        val anchor = oklchToLinSRGB(doubleArrayOf(l, 0.0, h))
        for (i in 0 until 4) {
            if (i > 0) {
                val c = linSRGBToOKLCH(mapped)
                c[0] = l; c[2] = h
                mapped = oklchToLinSRGB(c)
            }
            mapped = rayTraceBox(anchor, mapped) ?: break
        }
        return clip(mapped)
    }

    private fun rayTraceBox(start: DoubleArray, end: DoubleArray): DoubleArray? {
        var tfar = Double.POSITIVE_INFINITY
        var tnear = Double.NEGATIVE_INFINITY
        val direction = DoubleArray(3)
        for (i in 0 until 3) {
            val a = start[i]
            val d = end[i] - a
            direction[i] = d
            if (d != 0.0) {
                val inv = 1 / d
                val t1 = (0 - a) * inv
                val t2 = (1 - a) * inv
                tnear = maxOf(minOf(t1, t2), tnear)
                tfar = minOf(maxOf(t1, t2), tfar)
            } else if (a < 0 || a > 1) {
                return null
            }
        }
        if (tnear > tfar || tfar < 0) return null
        if (tnear < 0) tnear = tfar
        if (!tnear.isFinite()) return null
        return DoubleArray(3) { start[it] + direction[it] * tnear }
    }

    // color-helpers (CSS Color 4 sample code)

    private fun multiply(m: DoubleArray, v: DoubleArray) = doubleArrayOf(
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
    )
    private val toD65 = doubleArrayOf(0.955473421488075, -0.02309845494876471, 0.06325924320057072, -0.0283697093338637, 1.0099953980813041, 0.021041441191917323, 0.012314014864481998, -0.020507649298898964, 1.330365926242124)
    private val toD50 = doubleArrayOf(1.0479297925449969, 0.022946870601609652, -0.05019226628920524, 0.02962780877005599, 0.9904344267538799, -0.017073799063418826, -0.009243040646204504, 0.015055191490298152, 0.7518742814281371)
    private fun d50ToD65(c: DoubleArray) = multiply(toD65, c)
    private fun d65ToD50(c: DoubleArray) = multiply(toD50, c)
    private val linSRGBToXYZ = doubleArrayOf(506752.0 / 1228815, 87881.0 / 245763, 12673.0 / 70218, 87098.0 / 409605, 175762.0 / 245763, 12673.0 / 175545, 7918.0 / 409605, 87881.0 / 737289, 1001167.0 / 1053270)
    private val xyzToLinSRGB = doubleArrayOf(12831.0 / 3959, -329.0 / 214, -1974.0 / 3959, -851781.0 / 878810, 1648619.0 / 878810, 36519.0 / 878810, 705.0 / 12673, -2585.0 / 12673, 705.0 / 667)
    private val xyzToLMS = doubleArrayOf(0.819022437996703, 0.3619062600528904, -0.1288737815209879, 0.0329836539323885, 0.9292868615863434, 0.0361446663506424, 0.0481771893596242, 0.2642395317527308, 0.6335478284694309)
    private val lmsToOKLab = doubleArrayOf(0.210454268309314, 0.7936177747023054, -0.0040720430116193, 1.9779985324311684, -2.42859224204858, 0.450593709617411, 0.0259040424655478, 0.7827717124575296, -0.8086757549230774)
    private val okLabToLMS = doubleArrayOf(1.0, 0.3963377773761749, 0.2158037573099136, 1.0, -0.1055613458156586, -0.0638541728258133, 1.0, -0.0894841775298119, -1.2914855480194092)
    private val lmsToXYZ = doubleArrayOf(1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.112286803280317, -0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816)
    private val d50White = doubleArrayOf(0.3457 / 0.3585, 1.0, 0.2958 / 0.3585)

    private fun linSRGB(c: DoubleArray) = DoubleArray(3) {
        val v = c[it]
        val a = abs(v)
        if (a <= 0.04045) v / 12.92 else (if (v < 0) -1.0 else 1.0) * ((a + 0.055) / 1.055).pow(2.4)
    }
    private fun gamSRGB(c: DoubleArray) = DoubleArray(3) {
        val v = c[it]
        val a = abs(v)
        if (a > 0.0031308) (if (v < 0) -1.0 else 1.0) * (1.055 * a.pow(1 / 2.4) - 0.055) else 12.92 * v
    }
    private fun xyzToOKLab(c: DoubleArray) = multiply(lmsToOKLab, multiply(xyzToLMS, c).let { m -> DoubleArray(3) { cbrt(m[it]) } })
    private fun oklabToXYZ(c: DoubleArray) = multiply(lmsToXYZ, multiply(okLabToLMS, c).let { m -> DoubleArray(3) { m[it] * m[it] * m[it] } })
    private fun polarToRect(c: DoubleArray): DoubleArray {
        val h = c[2] * Math.PI / 180
        return doubleArrayOf(c[0], c[1] * cos(h), c[1] * sin(h))
    }
    private fun rectToPolar(c: DoubleArray): DoubleArray {
        val h = 180 * atan2(c[2], c[1]) / Math.PI
        return doubleArrayOf(c[0], sqrt(c[1] * c[1] + c[2] * c[2]), if (h >= 0) h else h + 360)
    }
    private fun labToXYZ(c: DoubleArray): DoubleArray {
        val k = 24389.0 / 27
        val e = 216.0 / 24389
        val f1 = (c[0] + 16) / 116
        val f0 = c[1] / 500 + f1
        val f2 = f1 - c[2] / 200
        return doubleArrayOf(
            (if (f0.pow(3) > e) f0.pow(3) else (116 * f0 - 16) / k) * d50White[0],
            (if (c[0] > 8) ((c[0] + 16) / 116).pow(3) else c[0] / k) * d50White[1],
            (if (f2.pow(3) > e) f2.pow(3) else (116 * f2 - 16) / k) * d50White[2],
        )
    }
    private fun xyzToLab(c: DoubleArray): DoubleArray {
        fun f(t: Double) = if (t > 216.0 / 24389) cbrt(t) else (24389.0 / 27 * t + 16) / 116
        val f0 = f(c[0] / d50White[0])
        val f1 = f(c[1] / d50White[1])
        val f2 = f(c[2] / d50White[2])
        return doubleArrayOf(116 * f1 - 16, 500 * (f0 - f1), 200 * (f1 - f2))
    }
    private fun hslToSRGB(c: DoubleArray): DoubleArray {
        var h = c[0] % 360
        val s = c[1] / 100
        val l = c[2] / 100
        if (h < 0) h += 360
        fun channel(n: Double): Double {
            val k = (n + h / 30) % 12
            return l - s * minOf(l, 1 - l) * maxOf(-1.0, minOf(k - 3, 9 - k, 1.0))
        }
        return doubleArrayOf(channel(0.0), channel(8.0), channel(4.0))
    }
    private fun hwbToSRGB(c: DoubleArray): DoubleArray {
        val w = c[1] / 100
        val b = c[2] / 100
        if (w + b >= 1) { val g = w / (w + b); return doubleArrayOf(g, g, g) }
        val rgb = hslToSRGB(doubleArrayOf(c[0], 100.0, 50.0))
        return DoubleArray(3) { rgb[it] * (1 - w - b) + w }
    }
    private fun sRGBToHSL(c: DoubleArray): DoubleArray {
        val r = c[0]
        val g = c[1]
        val b = c[2]
        val mx = maxOf(r, g, b)
        val mn = minOf(r, g, b)
        val l = (mn + mx) / 2
        val d = mx - mn
        var h = Double.NaN
        var s = 0.0
        if (jsRound(1e5 * d) != 0.0) {
            val lr = jsRound(1e5 * l)
            s = if (lr == 0.0 || lr == 1e5) 0.0 else (mx - l) / minOf(l, 1 - l)
            h = when (mx) {
                r -> (g - b) / d + (if (g < b) 6 else 0)
                g -> (b - r) / d + 2
                else -> (r - g) / d + 4
            }
            h *= 60
        }
        if (s < 0) { h += 180; s = abs(s) }
        if (h >= 360) h -= 360
        return doubleArrayOf(h, 100 * s, 100 * l)
    }
    private fun sRGBToHue(c: DoubleArray): Double {
        val r = c[0]
        val g = c[1]
        val b = c[2]
        val mx = maxOf(r, g, b)
        val mn = minOf(r, g, b)
        val d = mx - mn
        var h = Double.NaN
        if (d != 0.0) {
            h = when (mx) {
                r -> (g - b) / d + (if (g < b) 6 else 0)
                g -> (b - r) / d + 2
                else -> (r - g) / d + 4
            }
            h *= 60
        }
        if (h >= 360) h -= 360
        return h
    }

    private val namedColors: Map<String, IntArray> = mapOf(
        "aliceblue" to intArrayOf(240, 248, 255), "antiquewhite" to intArrayOf(250, 235, 215), "aqua" to intArrayOf(0, 255, 255), "aquamarine" to intArrayOf(127, 255, 212), "azure" to intArrayOf(240, 255, 255),
        "beige" to intArrayOf(245, 245, 220), "bisque" to intArrayOf(255, 228, 196), "black" to intArrayOf(0, 0, 0), "blanchedalmond" to intArrayOf(255, 235, 205), "blue" to intArrayOf(0, 0, 255),
        "blueviolet" to intArrayOf(138, 43, 226), "brown" to intArrayOf(165, 42, 42), "burlywood" to intArrayOf(222, 184, 135), "cadetblue" to intArrayOf(95, 158, 160), "chartreuse" to intArrayOf(127, 255, 0),
        "chocolate" to intArrayOf(210, 105, 30), "coral" to intArrayOf(255, 127, 80), "cornflowerblue" to intArrayOf(100, 149, 237), "cornsilk" to intArrayOf(255, 248, 220), "crimson" to intArrayOf(220, 20, 60),
        "cyan" to intArrayOf(0, 255, 255), "darkblue" to intArrayOf(0, 0, 139), "darkcyan" to intArrayOf(0, 139, 139), "darkgoldenrod" to intArrayOf(184, 134, 11), "darkgray" to intArrayOf(169, 169, 169),
        "darkgreen" to intArrayOf(0, 100, 0), "darkgrey" to intArrayOf(169, 169, 169), "darkkhaki" to intArrayOf(189, 183, 107), "darkmagenta" to intArrayOf(139, 0, 139), "darkolivegreen" to intArrayOf(85, 107, 47),
        "darkorange" to intArrayOf(255, 140, 0), "darkorchid" to intArrayOf(153, 50, 204), "darkred" to intArrayOf(139, 0, 0), "darksalmon" to intArrayOf(233, 150, 122), "darkseagreen" to intArrayOf(143, 188, 143),
        "darkslateblue" to intArrayOf(72, 61, 139), "darkslategray" to intArrayOf(47, 79, 79), "darkslategrey" to intArrayOf(47, 79, 79), "darkturquoise" to intArrayOf(0, 206, 209), "darkviolet" to intArrayOf(148, 0, 211),
        "deeppink" to intArrayOf(255, 20, 147), "deepskyblue" to intArrayOf(0, 191, 255), "dimgray" to intArrayOf(105, 105, 105), "dimgrey" to intArrayOf(105, 105, 105), "dodgerblue" to intArrayOf(30, 144, 255),
        "firebrick" to intArrayOf(178, 34, 34), "floralwhite" to intArrayOf(255, 250, 240), "forestgreen" to intArrayOf(34, 139, 34), "fuchsia" to intArrayOf(255, 0, 255), "gainsboro" to intArrayOf(220, 220, 220),
        "ghostwhite" to intArrayOf(248, 248, 255), "gold" to intArrayOf(255, 215, 0), "goldenrod" to intArrayOf(218, 165, 32), "gray" to intArrayOf(128, 128, 128), "green" to intArrayOf(0, 128, 0),
        "greenyellow" to intArrayOf(173, 255, 47), "grey" to intArrayOf(128, 128, 128), "honeydew" to intArrayOf(240, 255, 240), "hotpink" to intArrayOf(255, 105, 180), "indianred" to intArrayOf(205, 92, 92),
        "indigo" to intArrayOf(75, 0, 130), "ivory" to intArrayOf(255, 255, 240), "khaki" to intArrayOf(240, 230, 140), "lavender" to intArrayOf(230, 230, 250), "lavenderblush" to intArrayOf(255, 240, 245),
        "lawngreen" to intArrayOf(124, 252, 0), "lemonchiffon" to intArrayOf(255, 250, 205), "lightblue" to intArrayOf(173, 216, 230), "lightcoral" to intArrayOf(240, 128, 128), "lightcyan" to intArrayOf(224, 255, 255),
        "lightgoldenrodyellow" to intArrayOf(250, 250, 210), "lightgray" to intArrayOf(211, 211, 211), "lightgreen" to intArrayOf(144, 238, 144), "lightgrey" to intArrayOf(211, 211, 211), "lightpink" to intArrayOf(255, 182, 193),
        "lightsalmon" to intArrayOf(255, 160, 122), "lightseagreen" to intArrayOf(32, 178, 170), "lightskyblue" to intArrayOf(135, 206, 250), "lightslategray" to intArrayOf(119, 136, 153), "lightslategrey" to intArrayOf(119, 136, 153),
        "lightsteelblue" to intArrayOf(176, 196, 222), "lightyellow" to intArrayOf(255, 255, 224), "lime" to intArrayOf(0, 255, 0), "limegreen" to intArrayOf(50, 205, 50), "linen" to intArrayOf(250, 240, 230),
        "magenta" to intArrayOf(255, 0, 255), "maroon" to intArrayOf(128, 0, 0), "mediumaquamarine" to intArrayOf(102, 205, 170), "mediumblue" to intArrayOf(0, 0, 205), "mediumorchid" to intArrayOf(186, 85, 211),
        "mediumpurple" to intArrayOf(147, 112, 219), "mediumseagreen" to intArrayOf(60, 179, 113), "mediumslateblue" to intArrayOf(123, 104, 238), "mediumspringgreen" to intArrayOf(0, 250, 154), "mediumturquoise" to intArrayOf(72, 209, 204),
        "mediumvioletred" to intArrayOf(199, 21, 133), "midnightblue" to intArrayOf(25, 25, 112), "mintcream" to intArrayOf(245, 255, 250), "mistyrose" to intArrayOf(255, 228, 225), "moccasin" to intArrayOf(255, 228, 181),
        "navajowhite" to intArrayOf(255, 222, 173), "navy" to intArrayOf(0, 0, 128), "oldlace" to intArrayOf(253, 245, 230), "olive" to intArrayOf(128, 128, 0), "olivedrab" to intArrayOf(107, 142, 35),
        "orange" to intArrayOf(255, 165, 0), "orangered" to intArrayOf(255, 69, 0), "orchid" to intArrayOf(218, 112, 214), "palegoldenrod" to intArrayOf(238, 232, 170), "palegreen" to intArrayOf(152, 251, 152),
        "paleturquoise" to intArrayOf(175, 238, 238), "palevioletred" to intArrayOf(219, 112, 147), "papayawhip" to intArrayOf(255, 239, 213), "peachpuff" to intArrayOf(255, 218, 185), "peru" to intArrayOf(205, 133, 63),
        "pink" to intArrayOf(255, 192, 203), "plum" to intArrayOf(221, 160, 221), "powderblue" to intArrayOf(176, 224, 230), "purple" to intArrayOf(128, 0, 128), "rebeccapurple" to intArrayOf(102, 51, 153),
        "red" to intArrayOf(255, 0, 0), "rosybrown" to intArrayOf(188, 143, 143), "royalblue" to intArrayOf(65, 105, 225), "saddlebrown" to intArrayOf(139, 69, 19), "salmon" to intArrayOf(250, 128, 114),
        "sandybrown" to intArrayOf(244, 164, 96), "seagreen" to intArrayOf(46, 139, 87), "seashell" to intArrayOf(255, 245, 238), "sienna" to intArrayOf(160, 82, 45), "silver" to intArrayOf(192, 192, 192),
        "skyblue" to intArrayOf(135, 206, 235), "slateblue" to intArrayOf(106, 90, 205), "slategray" to intArrayOf(112, 128, 144), "slategrey" to intArrayOf(112, 128, 144), "snow" to intArrayOf(255, 250, 250),
        "springgreen" to intArrayOf(0, 255, 127), "steelblue" to intArrayOf(70, 130, 180), "tan" to intArrayOf(210, 180, 140), "teal" to intArrayOf(0, 128, 128), "thistle" to intArrayOf(216, 191, 216),
        "tomato" to intArrayOf(255, 99, 71), "turquoise" to intArrayOf(64, 224, 208), "violet" to intArrayOf(238, 130, 238), "wheat" to intArrayOf(245, 222, 179), "white" to intArrayOf(255, 255, 255),
        "whitesmoke" to intArrayOf(245, 245, 245), "yellow" to intArrayOf(255, 255, 0), "yellowgreen" to intArrayOf(154, 205, 50),
    )
}
