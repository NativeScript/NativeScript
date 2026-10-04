package org.nativescript.kit

/** A parsed CSS `transform`: styling/css-transform's `transformConverter`. */
internal class Transformation {
    var translateX = 0.0
    var translateY = 0.0
    var rotateX = 0.0
    var rotateY = 0.0
    var rotateZ = 0.0
    var scaleX = 1.0
    var scaleY = 1.0

    private enum class Kind { TRANSLATE, ROTATE, SCALE }

    companion object {
        // TRANSFORM_SPLITTER: `\s*(.+?)\((.*?)\)`, applied repeatedly.
        private val splitter = Regex("\\s*(.+?)\\((.*?)\\)")

        fun parse(text: String): Transformation {
            val parts = mutableListOf<Pair<Kind, Transformation>>()
            for (match in splitter.findAll(text)) part(match.groupValues[1], match.groupValues[2])?.let { parts.add(it) }
            val result = Transformation()
            if (text == "none" || text.isEmpty() || parts.isEmpty()) return result
            val kinds = parts.map { it.first }
            if (kinds.toSet().size == kinds.size) {
                for ((kind, t) in parts) {
                    when (kind) {
                        Kind.TRANSLATE -> { result.translateX = t.translateX; result.translateY = t.translateY }
                        Kind.ROTATE -> { result.rotateX = t.rotateX; result.rotateY = t.rotateY; result.rotateZ = t.rotateZ }
                        Kind.SCALE -> { result.scaleX = t.scaleX; result.scaleY = t.scaleY }
                    }
                }
                return result
            }
            val matrices = parts.map { matrix(it.first, it.second) }
            val m = matrices.drop(1).fold(matrices[0]) { a, b -> multiplyAffine2d(a, b) }
            return decompose2D(doubleArrayOf(m[0], m[3], m[1], m[4], m[2], m[5]))
        }

        private fun part(name: String, raw: String): Pair<Kind, Transformation>? {
            val values = raw.split(",").map { parseFloat(it) ?: Double.NaN }
            val x = values[0]
            var y = values.getOrNull(1)
            var z = values.getOrNull(2)
            if (name == "translate") y = y ?: 0.0 else {
                y = y ?: x
                z = z ?: y
            }
            val degrees = if (raw.endsWith("rad")) x * 180 / Math.PI else x
            val t = Transformation()
            return when (name) {
                "scale", "scale3d" -> { t.scaleX = x; t.scaleY = y!!; Pair(Kind.SCALE, t) }
                "scaleX" -> { t.scaleX = x; t.scaleY = 1.0; Pair(Kind.SCALE, t) }
                "scaleY" -> { t.scaleX = 1.0; t.scaleY = y!!; Pair(Kind.SCALE, t) }
                "translate", "translate3d" -> { t.translateX = x; t.translateY = y!!; Pair(Kind.TRANSLATE, t) }
                "translateX" -> { t.translateX = x; Pair(Kind.TRANSLATE, t) }
                "translateY" -> { t.translateY = y!!; Pair(Kind.TRANSLATE, t) }
                "rotate3d" -> { t.rotateX = x; t.rotateY = y!!; t.rotateZ = z!!; Pair(Kind.ROTATE, t) }
                "rotateX" -> { t.rotateX = degrees; Pair(Kind.ROTATE, t) }
                "rotateY" -> { t.rotateY = degrees; Pair(Kind.ROTATE, t) }
                "rotate" -> { t.rotateZ = degrees; Pair(Kind.ROTATE, t) }
                else -> null
            }
        }

        /** matrix/index's TRANSFORM_MATRIXES: 3x3 row-major, rotation about z only. */
        private fun matrix(kind: Kind, t: Transformation): DoubleArray = when (kind) {
            Kind.SCALE -> doubleArrayOf(t.scaleX, 0.0, 0.0, 0.0, t.scaleY, 0.0, 0.0, 0.0, 1.0)
            Kind.TRANSLATE -> doubleArrayOf(1.0, 0.0, t.translateX, 0.0, 1.0, t.translateY, 0.0, 0.0, 1.0)
            Kind.ROTATE -> {
                val rad = t.rotateZ * Math.PI / 180
                doubleArrayOf(Math.cos(rad), -Math.sin(rad), 0.0, Math.sin(rad), Math.cos(rad), 0.0, 0.0, 0.0, 1.0)
            }
        }

        private fun multiplyAffine2d(m1: DoubleArray, m2: DoubleArray): DoubleArray = doubleArrayOf(
            m1[0] * m2[0] + m1[1] * m2[3], m1[0] * m2[1] + m1[1] * m2[4], m1[0] * m2[2] + m1[1] * m2[5] + m1[2],
            m1[3] * m2[0] + m1[4] * m2[3], m1[3] * m2[1] + m1[4] * m2[4], m1[3] * m2[2] + m1[4] * m2[5] + m1[5],
        )

        private fun decompose2D(m: DoubleArray): Transformation {
            val (a, b, c, d) = listOf(m[0], m[1], m[2], m[3])
            val e = m[4]
            val f = m[5]
            val determinant = a * d - b * c
            val t = Transformation()
            t.translateX = if (e.isNaN()) 0.0 else e
            t.translateY = if (f.isNaN()) 0.0 else f
            var rotate = 0.0
            if (a != 0.0 || b != 0.0) {
                val r = Math.sqrt(a * a + b * b)
                rotate = if (b > 0) Math.acos(a / r) else -Math.acos(a / r)
                t.scaleX = r
                t.scaleY = determinant / r
            } else if (c != 0.0 || d != 0.0) {
                val r = Math.sqrt(c * c + d * d)
                rotate = Math.PI / 2 - (if (d > 0) Math.acos(-c / r) else -Math.acos(c / r))
                t.scaleX = determinant / r
                t.scaleY = r
            }
            t.rotateZ = rotate * 180 / Math.PI
            return t
        }
    }
}

/** `transform` as the longhands it sets (style-properties `convertToTransform`). */
fun expandTransform(value: Any?): List<Pair<String, Any?>> {
    val t = Transformation.parse(toText(value) ?: "none")
    return listOf(
        Pair("translateX", t.translateX), Pair("translateY", t.translateY),
        Pair("scaleX", t.scaleX), Pair("scaleY", t.scaleY),
        Pair("rotate", t.rotateZ), Pair("rotateX", t.rotateX), Pair("rotateY", t.rotateY),
    )
}
