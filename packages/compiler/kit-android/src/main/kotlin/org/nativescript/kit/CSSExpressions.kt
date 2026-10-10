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
