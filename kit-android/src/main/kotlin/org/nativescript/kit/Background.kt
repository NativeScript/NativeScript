package org.nativescript.kit

import org.nativescript.widgets.LinearGradientDefinition

/** `Background` from styling/background-common: device pixels and ARGB ints. */
internal data class Background(
    val color: Int? = null,
    val borderTopColor: Int? = null,
    val borderRightColor: Int? = null,
    val borderBottomColor: Int? = null,
    val borderLeftColor: Int? = null,
    val borderTopWidth: Float = 0f,
    val borderRightWidth: Float = 0f,
    val borderBottomWidth: Float = 0f,
    val borderLeftWidth: Float = 0f,
    val borderTopLeftRadius: Float = 0f,
    val borderTopRightRadius: Float = 0f,
    val borderBottomRightRadius: Float = 0f,
    val borderBottomLeftRadius: Float = 0f,
    val image: LinearGradient? = null,
    /** The first one declared is closest to the view: drawn last. */
    val boxShadows: List<BoxShadow> = emptyList(),
    /** The `clip-path` text, as the widgets' BorderDrawable parses it. */
    val clipPath: String? = null,
    /** `BackgroundClearFlags.CLEAR_BACKGROUND_COLOR`: the next redraw clears a tinted drawable. */
    val clearColor: Boolean = false,
) {
    val hasBorderWidth: Boolean get() = borderTopWidth > 0 || borderRightWidth > 0 || borderBottomWidth > 0 || borderLeftWidth > 0
    val hasBorderRadius: Boolean get() = borderTopLeftRadius > 0 || borderTopRightRadius > 0 || borderBottomRightRadius > 0 || borderBottomLeftRadius > 0

    /** `isEmpty`: nothing core would draw; shadows are drawn apart from the background. */
    val isEmpty: Boolean get() = color == null && image == null && !hasBorderWidth && !hasBorderRadius && clipPath == null
}

/** `CSSShadow` from css-shadow: lengths, a color (black when none is given) and `inset`. */
internal class CSSShadow(val offsetX: Length, val offsetY: Length, val blurRadius: Length, val spreadRadius: Length, val color: Color?, val inset: Boolean) {
    companion object {
        fun parse(value: String): CSSShadow? {
            val parts = splitTopLevelWhitespace(value.trim())
            val first = parts.firstOrNull() ?: return null
            if (first == "none" || first == "unset") return null
            val invalidColors = setOf("inset", "unset")
            fun isLength(v: String) = v == "0" || Regex("^-?[0-9]+[a-zA-Z%]*?$").matches(v)
            var color = "black"
            val last = parts.last()
            if (!isLength(first) && first !in invalidColors) color = first
            else if (!isLength(last) && last !in invalidColors) color = last
            val values = parts.filter { it !in invalidColors && it != color }.map { Length.parse(it, Length.zero) }
            fun at(i: Int) = values.getOrNull(i) ?: Length.zero
            return CSSShadow(at(0), at(1), at(2), at(3), Color.parse(color), "inset" in parts)
        }

        fun splitTopLevelWhitespace(value: String): List<String> {
            val parts = mutableListOf<String>()
            val current = StringBuilder()
            var depth = 0
            for (c in value) {
                if (c == '(') depth++ else if (c == ')') depth = maxOf(0, depth - 1)
                if (c.isWhitespace() && depth == 0) {
                    if (current.isNotEmpty()) parts.add(current.toString())
                    current.clear()
                } else current.append(c)
            }
            if (current.isNotEmpty()) parts.add(current.toString())
            return parts
        }
    }
}

/** A `box-shadow` entry as core's `backgroundInternal` keeps it: device pixels. */
internal data class BoxShadow(val offsetX: Int, val offsetY: Int, val blurRadius: Int, val spreadRadius: Int, val color: Int, val inset: Boolean) {
    companion object {
        /** The `boxShadow` converter: comma-separated shadows, last first. */
        fun parseList(value: String): List<BoxShadow> {
            val parts = mutableListOf<String>()
            val current = StringBuilder()
            var depth = 0
            for (c in value) {
                if (c == '(') depth++ else if (c == ')') depth = maxOf(0, depth - 1)
                if (c == ',' && depth == 0) { parts.add(current.toString()); current.clear() } else current.append(c)
            }
            parts.add(current.toString())
            return parts.asReversed().mapNotNull { part ->
                val s = CSSShadow.parse(part) ?: return@mapNotNull null
                BoxShadow(
                    s.offsetX.toDevicePixels(0.0).toInt(), s.offsetY.toDevicePixels(0.0).toInt(),
                    s.blurRadius.toDevicePixels(0.0).toInt(), s.spreadRadius.toDevicePixels(0.0).toInt(),
                    s.color?.argb ?: 0, s.inset,
                )
            }
        }
    }
}

/** `LinearGradient` from a CSS `linear-gradient(...)`; the angle in radians. */
internal data class LinearGradient(val angle: Double, val stops: List<Pair<Int, Double?>>) {
    /** background.android `fromGradient`. */
    /**
     * `resolveGradientStopOffsets`: a first stop without a position at 0, a last
     * at 1, unpositioned runs spread evenly between their neighbours, and a
     * position below an earlier one raised to it.
     */
    private fun resolvedOffsets(): List<Double> {
        val offsets = stops.map { it.second }.toMutableList()
        if (offsets.isEmpty()) return emptyList()
        if (offsets[0] == null) offsets[0] = 0.0
        if (offsets[offsets.size - 1] == null) offsets[offsets.size - 1] = 1.0
        var highest = offsets[0]!!
        for (i in 1 until offsets.size) {
            val value = offsets[i] ?: continue
            offsets[i] = maxOf(value, highest)
            highest = offsets[i]!!
        }
        var start = 0
        for (i in 1 until offsets.size) {
            val end = offsets[i] ?: continue
            val from = offsets[start]!!
            for (k in start + 1 until i) offsets[k] = from + (end - from) * (k - start) / (i - start)
            start = i
        }
        return offsets.map { it!! }
    }

    fun toNative(): LinearGradientDefinition {
        val colors = IntArray(stops.size) { stops[it].first }
        val resolved = CorePatches.resolvedGradientStops
        val hasStops = resolved || stops.any { it.second != null }
        val positions = if (resolved) resolvedOffsets() else stops.map { it.second ?: 0.0 }
        val offsets = FloatArray(stops.size) { positions[it].toFloat() }
        val alpha = angle / (Math.PI * 2)
        fun sq(v: Double) = Math.pow(Math.sin(v), 2.0).toFloat()
        return LinearGradientDefinition(sq(Math.PI * (alpha + 0.75)), sq(Math.PI * (alpha + 0.5)), sq(Math.PI * (alpha + 0.25)), sq(Math.PI * alpha), colors, if (hasStops) offsets else null)
    }

    companion object {
        /** css/parser's `parseLinearGradient`: a direction or angle first, then color stops. */
        fun parse(text: String): LinearGradient? {
            val trimmed = text.trim()
            if (!trimmed.startsWith("linear-gradient") || !trimmed.endsWith(")")) return null
            val open = trimmed.indexOf('(')
            if (open < 0) return null
            val inner = trimmed.substring(open + 1, trimmed.length - 1)
            val args = mutableListOf<String>()
            val current = StringBuilder()
            var depth = 0
            for (c in inner) {
                if (c == '(') depth++ else if (c == ')') depth--
                if (c == ',' && depth == 0) { args.add(current.toString().trim()); current.clear() } else current.append(c)
            }
            args.add(current.toString().trim())
            var angle = Math.PI
            val stops = mutableListOf<Pair<Int, Double?>>()
            for ((index, arg) in args.withIndex()) {
                if (index == 0) {
                    val parsed = angle(arg) ?: direction(arg)
                    if (parsed != null) { angle = parsed; continue }
                }
                stops.add(colorStop(arg) ?: return null)
            }
            return LinearGradient(angle, stops)
        }

        private fun angle(text: String): Double? {
            if (!Regex("^[+\\-]?(\\d+\\.\\d+|\\d+|\\.\\d+)[a-z]+$").matches(text)) return null
            val unit = text.dropWhile { !it.isLetter() }
            val value = text.dropLast(unit.length).toDoubleOrNull() ?: return null
            return when (unit) {
                "deg" -> value / 180 * Math.PI
                "rad" -> value
                "grad" -> value / 200 * Math.PI
                "turn" -> value * Math.PI * 2
                else -> null
            }
        }

        private fun direction(text: String): Double? {
            val words = text.split(Regex("\\s+")).filter { it.isNotEmpty() }
            if (words.firstOrNull() != "to" || (words.size != 2 && words.size != 3)) return null
            val sides = mapOf("top" to 0.0, "right" to Math.PI / 2, "bottom" to Math.PI, "left" to Math.PI * 3 / 2)
            if (words.size == 2) return sides[words[1]]
            val corners = mapOf(
                "top" to mapOf("right" to Math.PI / 4, "left" to Math.PI * 7 / 4), "right" to mapOf("top" to Math.PI / 4, "bottom" to Math.PI * 3 / 4),
                "bottom" to mapOf("right" to Math.PI * 3 / 4, "left" to Math.PI * 5 / 4), "left" to mapOf("top" to Math.PI * 7 / 4, "bottom" to Math.PI * 5 / 4),
            )
            return corners[words[1]]?.get(words[2])
        }

        /** A color and an optional offset; only a percentage offset is kept. */
        private fun colorStop(text: String): Pair<Int, Double?>? {
            var colorText = text
            var offset: Double? = null
            val space = text.indexOfLast { it.isWhitespace() }
            if (space >= 0 && !text.endsWith(")")) {
                val tail = text.substring(space + 1)
                if (Regex("^[+\\-]?(\\d+\\.\\d+|\\d+|\\.\\d+)([a-zA-Z]+|%)?$").matches(tail)) {
                    colorText = text.substring(0, space).trim()
                    if (tail.endsWith("%")) offset = tail.dropLast(1).toDoubleOrNull()?.let { it / 100 }
                }
            }
            val color = Color.parse(colorText) ?: return null
            return Pair(color.argb, offset)
        }
    }
}
