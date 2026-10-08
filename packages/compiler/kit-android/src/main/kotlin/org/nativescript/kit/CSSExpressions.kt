package org.nativescript.kit

/**
 * A shorthand whose value holds `var()` or `calc()`: each longhand waits for
 * the value to be evaluated against the view (`CssPendingSubstitution`).
 */
class PendingShorthand(val shorthand: String, val value: String)

fun isCssExpression(value: Any?): Boolean {
    val text = value as? String ?: return false
    return text.contains("var(--") || text.contains("calc(")
}

/** `Style.getCssVariable`: this view's variables, then its ancestors'. */
fun View.cssVariable(name: String): String? = scopedCssVariables[name] ?: parent?.cssVariable(name)

/** `evaluateCssExpressions`: variables substituted, then `calc()`; null for `unset`. */
fun View.evaluateCssExpressions(value: String): String? {
    val substituted = evaluateCssVariableExpression(value)
    if (substituted == "unset") return null
    return CSSCalc.evaluate(substituted)
}

/**
 * `_evaluateCssVariableExpression`: the innermost `var()` first; a missing
 * variable takes the first comma part of its evaluated fallback, else `unset`.
 */
fun View.evaluateCssVariableExpression(value: String): String {
    if (!value.contains("var(--")) return value
    var output = value.trim()
    var last: String? = null
    while (last != output) {
        last = output
        val start = output.lastIndexOf("var(")
        if (start < 0) continue
        val end = output.indexOf(')', start + 4)
        if (end < 0) continue
        val parts = output.substring(start + 4, end).split(",").map { it.trim() }.filter { it.isNotEmpty() }.toMutableList()
        val name = if (parts.isEmpty()) "" else parts.removeAt(0)
        var resolved = cssVariable(name)
        if (resolved == null && parts.isNotEmpty()) resolved = evaluateCssVariableExpression(parts.joinToString(", ")).split(",").first()
        if (resolved.isNullOrEmpty()) resolved = "unset"
        output = output.substring(0, start) + resolved + output.substring(end + 1)
    }
    return output
}

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
