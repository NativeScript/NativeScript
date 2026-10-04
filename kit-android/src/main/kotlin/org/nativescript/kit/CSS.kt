package org.nativescript.kit

/**
 * The app's stylesheet: rules of type, class and compound selectors
 * (`Page`, `.row`, `Label.title`, `*`), ordered by specificity and then
 * source order, as NativeScript's style scope orders them.
 */
class StyleSheet(private val rules: List<Rule>) {
    class Selector(val type: String?, val classes: List<String>, val specificity: Int) {
        fun matches(view: View): Boolean {
            if (type != null && type != "*" && !type.equals(view.cssType, ignoreCase = true)) return false
            return classes.all { view.classes.contains(it) }
        }
    }

    class Rule(val selectors: List<Selector>, val declarations: List<Pair<String, String>>, val order: Int)

    /** The declarations that apply to `view`, later winning, as view property names. */
    fun values(view: View): LinkedHashMap<String, Any?> {
        val matched = mutableListOf<Triple<Int, Int, List<Pair<String, String>>>>()
        for (rule in rules) {
            val best = rule.selectors.filter { it.matches(view) }.maxOfOrNull { it.specificity } ?: continue
            matched.add(Triple(best, rule.order, rule.declarations))
        }
        matched.sortWith(compareBy({ it.first }, { it.second }))
        val result = LinkedHashMap<String, Any?>()
        for ((_, _, declarations) in matched) {
            for ((name, value) in declarations) {
                for ((longhand, v) in expandShorthand(propertyName(name), value)) result[longhand] = v
            }
        }
        return result
    }

    companion object {
        var app = StyleSheet(emptyList())

        fun parse(css: String): StyleSheet {
            val rules = mutableListOf<Rule>()
            var rest = css.replace(Regex("/\\*[\\s\\S]*?\\*/"), "")
            while (true) {
                val open = rest.indexOf('{')
                if (open < 0) break
                val close = rest.indexOf('}', open)
                if (close < 0) break
                val prelude = rest.substring(0, open).trim()
                val body = rest.substring(open + 1, close)
                rest = rest.substring(close + 1)
                // At-rules (@media, @keyframes) are outside the subset this kit implements.
                if (prelude.startsWith("@")) continue
                val selectors = prelude.split(",").mapNotNull { parseSelector(it) }
                if (selectors.isEmpty()) continue
                val declarations = body.split(";").mapNotNull { declaration ->
                    val colon = declaration.indexOf(':')
                    if (colon < 0) return@mapNotNull null
                    val name = declaration.substring(0, colon).trim().lowercase()
                    val value = declaration.substring(colon + 1).trim()
                    if (name.isEmpty() || value.isEmpty()) null else Pair(name, value)
                }
                rules.add(Rule(selectors, declarations, rules.size))
            }
            return StyleSheet(rules)
        }

        /** A compound selector; descendant and child combinators are not supported and their rules never match. */
        private fun parseSelector(text: String): Selector? {
            val s = text.trim()
            if (s.isEmpty() || s.any { it == ' ' || it == '>' || it == '+' || it == '~' || it == '[' || it == ':' }) return null
            val parts = s.split(".")
            val type = parts[0]
            val classes = parts.drop(1).filter { it.isNotEmpty() }
            return Selector(type.ifEmpty { null }, classes, (if (type.isEmpty() || type == "*") 0 else 1) + classes.size * 100)
        }
    }
}

/** A CSS property name as the view property it sets: `background-color` → `backgroundColor`. */
fun propertyName(css: String): String = when (css) {
    "horizontal-align" -> "horizontalAlignment"
    "vertical-align" -> "verticalAlignment"
    "text-align" -> "textAlignment"
    else -> {
        val result = StringBuilder()
        var upper = false
        for (c in css) {
            if (c == '-') { upper = true; continue }
            result.append(if (upper) c.uppercaseChar() else c)
            upper = false
        }
        result.toString()
    }
}

/**
 * Shorthands expanded to the longhands NativeScript stores
 * (`margin`, `padding`, `border-width`, `border-color`, `border-radius`).
 */
fun expandShorthand(name: String, value: Any?): List<Pair<String, Any?>> {
    fun sides(names: List<String>): List<Pair<String, Any?>> {
        val text = value as? String ?: return names.map { Pair(it, value) }
        val parts = text.split(' ', ',').filter { it.isNotEmpty() }
        val values = when (parts.size) {
            1 -> listOf(parts[0], parts[0], parts[0], parts[0])
            2 -> listOf(parts[0], parts[1], parts[0], parts[1])
            3 -> listOf(parts[0], parts[1], parts[2], parts[1])
            4 -> parts
            else -> return emptyList()
        }
        return names.zip(values)
    }
    fun box(prefix: String, suffix: String) = listOf("Top", "Right", "Bottom", "Left").map { prefix + it + suffix }
    return when (name) {
        "margin" -> sides(box("margin", ""))
        "padding" -> sides(box("padding", ""))
        "borderWidth" -> sides(box("border", "Width"))
        "borderColor" -> {
            // Colors such as rgb(0, 0, 0) contain separators; only a plain value repeats.
            val text = value as? String
            if (text != null && text.contains("(")) box("border", "Color").map { Pair(it, text) } else sides(box("border", "Color"))
        }
        "borderRadius" -> sides(listOf("borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"))
        else -> listOf(Pair(name, value))
    }
}
