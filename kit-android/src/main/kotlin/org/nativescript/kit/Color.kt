package org.nativescript.kit

/**
 * `Color` from @nativescript/core: the same parsing and the same integer
 * rounding, so a CSS color resolves to the same ARGB int core hands Android.
 */
class Color(val argb: Int) {
    val a: Int get() = (argb ushr 24) and 0xff
    val r: Int get() = (argb ushr 16) and 0xff
    val g: Int get() = (argb ushr 8) and 0xff
    val b: Int get() = argb and 0xff

    override fun equals(other: Any?): Boolean = other is Color && other.argb == argb
    override fun hashCode(): Int = argb
    override fun toString(): String = "#" + Integer.toHexString(argb)

    companion object {
        fun parse(value: String): Color? {
            val lowered = value.trim().lowercase()
            if ((lowered.startsWith("rgb(") || lowered.startsWith("rgba(")) && lowered.endsWith(")")) {
                val c = parseWithAlpha(lowered)
                return Color(pack(c.alpha, c.c0.toInt(), c.c1.toInt(), c.c2.toInt()))
            }
            if (lowered.startsWith("hsl") && lowered.endsWith(")")) {
                val c = parseWithAlpha(lowered)
                val (r, g, b) = hslToRgb(c.c0, c.c1, c.c2)
                return Color(pack(c.alpha, r, g, b))
            }
            KNOWN[lowered]?.let { return Color(it.toInt()) }
            if (lowered.startsWith("#") && lowered.length in setOf(4, 5, 7, 9)) {
                var hex = lowered.substring(1)
                if (hex.length == 3 || hex.length == 4) hex = hex.map { "$it$it" }.joinToString("")
                val int = hex.toLongOrNull(16) ?: return null
                // #RRGGBBAA: alpha last, NativeScript's (and CSS's) order.
                val argb = if (hex.length == 6) (int and 0xffffffL) or 0xff000000L else (int ushr 8) or ((int and 0xffL) shl 24)
                return Color(argb.toInt())
            }
            return null
        }

        private fun pack(a: Int, r: Int, g: Int, b: Int): Int =
            ((a and 0xff) shl 24) or ((r and 0xff) shl 16) or ((g and 0xff) shl 8) or (b and 0xff)

        private class Components(val c0: Double, val c1: Double, val c2: Double, val alpha: Int)

        /** `parseColorWithAlpha`: components as parseFloat reads them, alpha 0–1 scaled to 0–255. */
        private fun parseWithAlpha(value: String): Components {
            var body = value
            val open = body.indexOf('(')
            if (open >= 0) body = body.substring(open + 1)
            body = body.replace(")", "").replace("/", " ").replace("%", "")
            val separator = if (body.contains(',')) ',' else ' '
            val parts = body.split(separator).map { it.trim() }.filter { it.isNotEmpty() }
            fun at(i: Int): Double? = if (i < parts.size) parseFloat(parts[i]) else null
            val alpha = at(3)?.let { jsRound(it * 255).toInt() } ?: 255
            return Components(at(0) ?: 255.0, at(1) ?: 255.0, at(2) ?: 255.0, alpha)
        }

        private fun hue2rgb(p: Double, q: Double, t0: Double): Double {
            var t = t0
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1.0 / 6) return p + (q - p) * 6 * t
            if (t < 1.0 / 2) return q
            if (t < 2.0 / 3) return p + (q - p) * (2.0 / 3 - t) * 6
            return p
        }

        internal fun hslToRgb(h1: Double, s1: Double, l1: Double): Triple<Int, Int, Int> {
            val h = (h1 % 360) / 360
            val s = s1 / 100
            val l = l1 / 100
            var r = l
            var g = l
            var b = l
            if (s != 0.0) {
                val q = if (l < 0.5) l * (1 + s) else l + s - l * s
                val p = 2 * l - q
                r = hue2rgb(p, q, h + 1.0 / 3)
                g = hue2rgb(p, q, h)
                b = hue2rgb(p, q, h - 1.0 / 3)
            }
            return Triple(jsRound(r * 255).toInt(), jsRound(g * 255).toInt(), jsRound(b * 255).toInt())
        }

        private val KNOWN: Map<String, Long> = mapOf(
            "transparent" to 0x00000000L, "aliceblue" to 0xfff0f8ffL, "antiquewhite" to 0xfffaebd7L, "aqua" to 0xff00ffffL,
            "aquamarine" to 0xff7fffd4L, "azure" to 0xfff0ffffL, "beige" to 0xfff5f5dcL, "bisque" to 0xffffe4c4L,
            "black" to 0xff000000L, "blanchedalmond" to 0xffffebcdL, "blue" to 0xff0000ffL, "blueviolet" to 0xff8a2be2L,
            "brown" to 0xffa52a2aL, "burlywood" to 0xffdeb887L, "cadetblue" to 0xff5f9ea0L, "chartreuse" to 0xff7fff00L,
            "chocolate" to 0xffd2691eL, "coral" to 0xffff7f50L, "cornflowerblue" to 0xff6495edL, "cornsilk" to 0xfffff8dcL,
            "crimson" to 0xffdc143cL, "cyan" to 0xff00ffffL, "darkblue" to 0xff00008bL, "darkcyan" to 0xff008b8bL,
            "darkgoldenrod" to 0xffb8860bL, "darkgray" to 0xffa9a9a9L, "darkgrey" to 0xffa9a9a9L, "darkgreen" to 0xff006400L,
            "darkkhaki" to 0xffbdb76bL, "darkmagenta" to 0xff8b008bL, "darkolivegreen" to 0xff556b2fL, "darkorange" to 0xffff8c00L,
            "darkorchid" to 0xff9932ccL, "darkred" to 0xff8b0000L, "darksalmon" to 0xffe9967aL, "darkseagreen" to 0xff8fbc8fL,
            "darkslateblue" to 0xff483d8bL, "darkslategray" to 0xff2f4f4fL, "darkslategrey" to 0xff2f4f4fL, "darkturquoise" to 0xff00ced1L,
            "darkviolet" to 0xff9400d3L, "deeppink" to 0xffff1493L, "deepskyblue" to 0xff00bfffL, "dimgray" to 0xff696969L,
            "dimgrey" to 0xff696969L, "dodgerblue" to 0xff1e90ffL, "firebrick" to 0xffb22222L, "floralwhite" to 0xfffffaf0L,
            "forestgreen" to 0xff228b22L, "fuchsia" to 0xffff00ffL, "gainsboro" to 0xffdcdcdcL, "ghostwhite" to 0xfff8f8ffL,
            "gold" to 0xffffd700L, "goldenrod" to 0xffdaa520L, "gray" to 0xff808080L, "grey" to 0xff808080L,
            "green" to 0xff008000L, "greenyellow" to 0xffadff2fL, "honeydew" to 0xfff0fff0L, "hotpink" to 0xffff69b4L,
            "indianred" to 0xffcd5c5cL, "indigo" to 0xff4b0082L, "ivory" to 0xfffffff0L, "khaki" to 0xfff0e68cL,
            "lavender" to 0xffe6e6faL, "lavenderblush" to 0xfffff0f5L, "lawngreen" to 0xff7cfc00L, "lemonchiffon" to 0xfffffacdL,
            "lightblue" to 0xffadd8e6L, "lightcoral" to 0xfff08080L, "lightcyan" to 0xffe0ffffL, "lightgoldenrodyellow" to 0xfffafad2L,
            "lightgray" to 0xffd3d3d3L, "lightgrey" to 0xffd3d3d3L, "lightgreen" to 0xff90ee90L, "lightpink" to 0xffffb6c1L,
            "lightsalmon" to 0xffffa07aL, "lightseagreen" to 0xff20b2aaL, "lightskyblue" to 0xff87cefaL, "lightslategray" to 0xff778899L,
            "lightslategrey" to 0xff778899L, "lightsteelblue" to 0xffb0c4deL, "lightyellow" to 0xffffffe0L, "lime" to 0xff00ff00L,
            "limegreen" to 0xff32cd32L, "linen" to 0xfffaf0e6L, "magenta" to 0xffff00ffL, "maroon" to 0xff800000L,
            "mediumaquamarine" to 0xff66cdaaL, "mediumblue" to 0xff0000cdL, "mediumorchid" to 0xffba55d3L, "mediumpurple" to 0xff9370dbL,
            "mediumseagreen" to 0xff3cb371L, "mediumslateblue" to 0xff7b68eeL, "mediumspringgreen" to 0xff00fa9aL, "mediumturquoise" to 0xff48d1ccL,
            "mediumvioletred" to 0xffc71585L, "midnightblue" to 0xff191970L, "mintcream" to 0xfff5fffaL, "mistyrose" to 0xffffe4e1L,
            "moccasin" to 0xffffe4b5L, "navajowhite" to 0xffffdeadL, "navy" to 0xff000080L, "oldlace" to 0xfffdf5e6L,
            "olive" to 0xff808000L, "olivedrab" to 0xff6b8e23L, "orange" to 0xffffa500L, "orangered" to 0xffff4500L,
            "orchid" to 0xffda70d6L, "palegoldenrod" to 0xffeee8aaL, "palegreen" to 0xff98fb98L, "paleturquoise" to 0xffafeeeeL,
            "palevioletred" to 0xffdb7093L, "papayawhip" to 0xffffefd5L, "peachpuff" to 0xffffdab9L, "peru" to 0xffcd853fL,
            "pink" to 0xffffc0cbL, "plum" to 0xffdda0ddL, "powderblue" to 0xffb0e0e6L, "purple" to 0xff800080L,
            "rebeccapurple" to 0xff663399L, "red" to 0xffff0000L, "rosybrown" to 0xffbc8f8fL, "royalblue" to 0xff4169e1L,
            "saddlebrown" to 0xff8b4513L, "salmon" to 0xfffa8072L, "sandybrown" to 0xfff4a460L, "seagreen" to 0xff2e8b57L,
            "seashell" to 0xfffff5eeL, "sienna" to 0xffa0522dL, "silver" to 0xffc0c0c0L, "skyblue" to 0xff87ceebL,
            "slateblue" to 0xff6a5acdL, "slategray" to 0xff708090L, "slategrey" to 0xff708090L, "snow" to 0xfffffafaL,
            "springgreen" to 0xff00ff7fL, "steelblue" to 0xff4682b4L, "tan" to 0xffd2b48cL, "teal" to 0xff008080L,
            "thistle" to 0xffd8bfd8L, "tomato" to 0xffff6347L, "turquoise" to 0xff40e0d0L, "violet" to 0xffee82eeL,
            "wheat" to 0xfff5deb3L, "white" to 0xffffffffL, "whitesmoke" to 0xfff5f5f5L, "yellow" to 0xffffff00L,
            "yellowgreen" to 0xff9acd32L,
        )
    }
}

/** JavaScript `parseFloat`: the longest numeric prefix, or null. */
fun parseFloat(text: String): Double? {
    val s = text.trim()
    var end = 0
    var seenDigit = false
    var seenDot = false
    var seenExp = false
    var i = 0
    if (i < s.length && (s[i] == '-' || s[i] == '+')) i++
    while (i < s.length) {
        val c = s[i]
        if (c in '0'..'9') {
            seenDigit = true
            end = i + 1
        } else if (c == '.' && !seenDot && !seenExp) {
            seenDot = true
        } else if ((c == 'e' || c == 'E') && seenDigit && !seenExp) {
            seenExp = true
            if (i + 1 < s.length && (s[i + 1] == '-' || s[i + 1] == '+')) i++
        } else {
            break
        }
        i++
    }
    if (!seenDigit) return null
    return s.substring(0, end).toDoubleOrNull()
}
