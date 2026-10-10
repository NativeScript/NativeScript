package org.nativescript.kit

/**
 * `calc()` as @csstools/css-calc folds it for NativeScript: numbers, `px` and
 * `%` combine only with their own unit (and `*`, `/` by plain numbers); an
 * expression that does not resolve is left as written.
 */
object CSSCalc {
    fun evaluate(value: String): String {
        if (!value.contains("calc(")) return value
        // `unset` and `infinity` inside calc() stand for 0 and a large number; `dip` is a plain number.
        val text = value.replace(Regex("([0-9]+(\\.[0-9]+)?)dip\\b"), "$1").replace("unset", "0").replace("infinity", "999999")
        val result = StringBuilder()
        var rest = text
        while (true) {
            val start = rest.indexOf("calc(")
            if (start < 0) break
            result.append(rest, 0, start)
            var depth = 1
            var index = start + 5
            while (index < rest.length && depth > 0) {
                if (rest[index] == '(') depth++ else if (rest[index] == ')') depth--
                index++
            }
            val parser = Parser(rest.substring(start + 5, index - 1))
            val quantity = parser.expression()
            if (quantity == null || !parser.atEnd) return value
            result.append(js(quantity.value) + quantity.unit)
            rest = rest.substring(index)
        }
        return result.append(rest).toString()
    }

    private class Quantity(var value: Double, var unit: String)

    private class Parser(text: String) {
        val chars = text.toCharArray()
        var i = 0

        val atEnd: Boolean
            get() {
                var j = i
                while (j < chars.size && chars[j].isWhitespace()) j++
                return j >= chars.size
            }

        fun skip() { while (i < chars.size && chars[i].isWhitespace()) i++ }

        fun expression(): Quantity? {
            val left = term() ?: return null
            while (true) {
                skip()
                if (i >= chars.size || (chars[i] != '+' && chars[i] != '-')) return left
                val op = chars[i]
                i++
                val right = term() ?: return null
                if (left.unit != right.unit) return null
                left.value = if (op == '+') left.value + right.value else left.value - right.value
            }
        }

        fun term(): Quantity? {
            var left = factor() ?: return null
            while (true) {
                skip()
                if (i >= chars.size || (chars[i] != '*' && chars[i] != '/')) return left
                val op = chars[i]
                i++
                val right = factor() ?: return null
                if (op == '*') {
                    when {
                        left.unit.isEmpty() -> left = Quantity(left.value * right.value, right.unit)
                        right.unit.isEmpty() -> left.value *= right.value
                        else -> return null
                    }
                } else {
                    if (right.unit.isNotEmpty() || right.value == 0.0) return null
                    left.value /= right.value
                }
            }
        }

        fun factor(): Quantity? {
            skip()
            if (i >= chars.size) return null
            if (chars[i] == '(') {
                i++
                val inner = expression() ?: return null
                skip()
                if (i >= chars.size || chars[i] != ')') return null
                i++
                return inner
            }
            if (String(chars, i, minOf(5, chars.size - i)) == "calc(") {
                i += 4
                return factor()
            }
            val number = StringBuilder()
            if (chars[i] == '-' || chars[i] == '+') { number.append(chars[i]); i++ }
            while (i < chars.size && (chars[i].isDigit() || chars[i] == '.')) { number.append(chars[i]); i++ }
            val value = number.toString().toDoubleOrNull() ?: return null
            val unit = StringBuilder()
            while (i < chars.size && (chars[i].isLetter() || chars[i] == '%')) { unit.append(chars[i]); i++ }
            val u = unit.toString()
            if (u.isNotEmpty() && u != "px" && u != "%") return null
            return Quantity(value, u)
        }
    }
}
