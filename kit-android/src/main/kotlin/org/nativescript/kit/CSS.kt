package org.nativescript.kit

/**
 * The app's stylesheet as NativeScript's style scope uses it: rulesets of
 * selectors (styling/css-selector), `@media` rules matched at query time,
 * and `@keyframes` by name.
 */
class StyleSheet(val rules: List<Rule>, val keyframes: Map<String, List<KeyframeRule>> = emptyMap()) {
    class Rule(
        /** Each selector of the ruleset, with its position in source order. */
        val selectors: List<Pair<CSSSelector, Int>>,
        val declarations: List<Pair<String, String>>,
        val animations: List<KeyframeAnimationInfo>?,
        /** Every enclosing `@media` query must match. */
        val media: List<String>,
    )

    /** What a view's match yields: values in cascade order, animations, and the attributes and pseudo-classes it depends on. */
    class Match {
        val values = mutableListOf<Pair<String, Any>>()
        val animations = mutableListOf<KeyframeAnimation>()
        val changes = CSSChanges()
    }

    val hasSiblingCombinators: Boolean = rules.any { r -> r.selectors.any { it.first.hasAdjacentCombinator || it.first.hasSiblingCombinator } }

    /**
     * `matchSelectorCandidates` and `CssState.setPropertyValues`: matching
     * selectors sorted by specificity, then source order; each applies its
     * ruleset's declarations, a name keeping the position where it first appeared.
     */
    fun match(view: View): Match {
        val result = Match()
        val matched = mutableListOf<Triple<Int, Int, Int>>()
        val mediaResults = HashMap<String, Boolean>()
        for ((index, rule) in rules.withIndex()) {
            val mediaMatches = rule.media.all { query -> mediaResults.getOrPut(query) { MediaQuery.matches(query) } }
            if (!mediaMatches) continue
            for ((selector, pos) in rule.selectors) {
                if (selector.dynamic) track(selector, view, result.changes)
                if (selector.match(view)) matched.add(Triple(selector.specificity, pos, index))
            }
        }
        matched.sortWith(compareBy({ it.first }, { it.second }))
        val position = HashMap<String, Int>()
        for ((_, _, ruleIndex) in matched) {
            val rule = rules[ruleIndex]
            for ((declaration, text) in rule.declarations) {
                val name = if (declaration.startsWith("--")) declaration else propertyName(declaration)
                var longhands: List<Pair<String, Any?>> = expandShorthand(name, text)
                val names = if (isCssExpression(text)) shorthandLonghands(name) else null
                if (names != null) longhands = names.map { Pair(it, PendingShorthand(name, text)) }
                for ((longhand, value) in longhands) {
                    if (value == null) continue
                    val at = position[longhand]
                    if (at != null) result.values[at] = Pair(longhand, value)
                    else {
                        position[longhand] = result.values.size
                        result.values.add(Pair(longhand, value))
                    }
                }
            }
            for (info in rule.animations ?: emptyList()) {
                KeyframeAnimation.create(info, keyframes[info.name]?.let { KeyframeInfo.parse(it) })?.let { result.animations.add(it) }
            }
        }
        return result
    }

    companion object {
        var app = StyleSheet(emptyList())

        fun parse(css: String): StyleSheet {
            val rules = mutableListOf<Rule>()
            val keyframes = HashMap<String, List<KeyframeRule>>()
            var position = 0
            fun parse(text: String, media: List<String>) {
                for ((prelude, body) in blocks(text)) {
                    if (prelude.startsWith("@keyframes") || prelude.startsWith("@-webkit-keyframes")) {
                        val name = prelude.split(" ", limit = 2).getOrNull(1)?.trim() ?: ""
                        keyframes[name] = blocks(body).map { (selector, declarations) ->
                            KeyframeRule(selector.split(",").map { it.trim() }, declarations(declarations))
                        }
                        continue
                    }
                    if (prelude.startsWith("@media")) {
                        parse(body, media + prelude.removePrefix("@media").trim())
                        continue
                    }
                    if (prelude.startsWith("@")) continue
                    val selectors = mutableListOf<Pair<CSSSelector, Int>>()
                    for (selectorText in splitSelectors(prelude)) {
                        val selector = SelectorParser.parse(selectorText)
                        if (!selector.isValid) continue
                        selectors.add(Pair(selector, position++))
                    }
                    val declarations = declarations(body)
                    rules.add(Rule(selectors, declarations, KeyframeAnimationInfo.fromDeclarations(declarations), media))
                }
            }
            parse(css.replace(Regex("/\\*[\\s\\S]*?\\*/"), ""), emptyList())
            return StyleSheet(rules, keyframes)
        }

        /** The top-level `prelude { body }` blocks of `text`, braces matched; statements such as `@import x;` are skipped. */
        private fun blocks(text: String): List<Pair<String, String>> {
            val result = mutableListOf<Pair<String, String>>()
            var rest = text
            while (true) {
                val open = rest.indexOf('{')
                if (open < 0) break
                val semicolon = rest.lastIndexOf(';', open)
                if (semicolon >= 0) { rest = rest.substring(semicolon + 1); continue }
                val prelude = rest.substring(0, open).trim()
                var depth = 0
                var close = -1
                for (index in open until rest.length) {
                    if (rest[index] == '{') depth++
                    else if (rest[index] == '}') {
                        depth--
                        if (depth == 0) { close = index; break }
                    }
                }
                if (close < 0) break
                result.add(Pair(prelude, rest.substring(open + 1, close)))
                rest = rest.substring(close + 1)
            }
            return result
        }

        /** A prelude's selectors: commas inside parentheses (`:is(a, b)`) or quotes do not split. */
        private fun splitSelectors(prelude: String): List<String> =
            topLevel(prelude, ',').map { it.trim() }.filter { it.isNotEmpty() }

        /** `text` split at each `separator` outside parentheses and quotes. */
        private fun topLevel(text: String, separator: Char): List<String> {
            val parts = mutableListOf<String>()
            var start = 0
            var depth = 0
            var quote: Char? = null
            var index = 0
            while (index < text.length) {
                val c = text[index]
                if (quote != null) {
                    if (c == '\\') index++ else if (c == quote) quote = null
                } else if (c == '"' || c == '\'') {
                    quote = c
                } else if (c == '(') {
                    depth++
                } else if (c == ')') {
                    depth--
                } else if (c == separator && depth == 0) {
                    parts.add(text.substring(start, index))
                    start = index + 1
                }
                index++
            }
            parts.add(text.substring(minOf(start, text.length)))
            return parts
        }

        /** Declarations with names lowercased, except custom properties, and `!important` dropped. */
        fun declarations(body: String): List<Pair<String, String>> = topLevel(body, ';').mapNotNull { declaration ->
            val colon = declaration.indexOf(':')
            if (colon < 0) return@mapNotNull null
            var name = declaration.substring(0, colon).trim()
            if (!name.startsWith("--")) name = name.lowercase()
            val value = declaration.substring(colon + 1).trim().replace(Regex("\\s*!important$"), "")
            if (name.isEmpty() || value.isEmpty()) null else Pair(name, value)
        }

        /** The longhands a shorthand sets, or null for a property that is not one. */
        fun shorthandLonghands(name: String): List<String>? {
            val names = expandShorthand(name, "0").map { it.first }
            return if (names == listOf(name)) null else names
        }

        /**
         * The dependencies of a dynamic selector: a simple one on the view itself
         * (when its static part may match); a complex one on the view, its
         * ancestors and, with sibling combinators, their earlier siblings.
         */
        private fun track(selector: CSSSelector, view: View, changes: CSSChanges) {
            if (selector !is ComplexSelector) {
                if (selector.mayMatch(view)) selector.trackChanges(view, changes)
                return
            }
            var node: View? = view
            while (node != null) {
                selector.trackChanges(node, changes)
                if (selector.hasAdjacentCombinator || selector.hasSiblingCombinator) {
                    for (sibling in View.previousSiblings(node)) selector.trackChanges(sibling, changes)
                }
                node = node.parent
            }
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
 * Shorthands expanded to the longhands NativeScript stores (`margin`,
 * `padding`, `border-*`, `transform`, `background`, `flex`, `flex-flow`, `gap`).
 */
fun expandShorthand(name: String, value: Any?): List<Pair<String, Any?>> {
    fun parts(text: String) = text.split(' ', ',').filter { it.isNotEmpty() }
    fun four(parts: List<String>): List<String>? = when (parts.size) {
        1 -> listOf(parts[0], parts[0], parts[0], parts[0])
        2 -> listOf(parts[0], parts[1], parts[0], parts[1])
        3 -> listOf(parts[0], parts[1], parts[2], parts[1])
        4 -> parts
        else -> null
    }
    fun sides(prefix: String, suffix: String): List<Pair<String, Any?>> {
        val names = listOf("Top", "Right", "Bottom", "Left").map { prefix + it + suffix }
        val text = value as? String ?: return names.map { Pair(it, value) }
        return names.zip(four(parts(text)) ?: return emptyList())
    }
    return when (name) {
        "margin" -> sides("margin", "")
        "padding" -> sides("padding", "")
        "borderWidth" -> sides("border", "Width")
        "borderColor" -> {
            // Colors such as rgb(0, 0, 0) contain separators; only a plain value repeats.
            val text = value as? String
            if (text != null && text.contains("(")) listOf("Top", "Right", "Bottom", "Left").map { Pair("border${it}Color", text) } else sides("border", "Color")
        }
        "borderRadius" -> {
            val corners = listOf("borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius")
            val text = value as? String ?: return corners.map { Pair(it, value) }
            corners.zip(four(parts(text)) ?: return emptyList())
        }
        "transform" -> expandTransform(value)
        "background" -> {
            // A gradient is the image; any other part is the color.
            val text = value as? String ?: return listOf(Pair("backgroundColor", value))
            val start = text.indexOf("linear-gradient(")
            val end = if (start >= 0) text.lastIndexOf(')') else -1
            if (start >= 0 && end > start) {
                val rest = (text.substring(0, start) + text.substring(end + 1)).trim()
                listOf(Pair("backgroundColor", rest.ifEmpty { null }), Pair("backgroundImage", text.substring(start, end + 1)))
            } else listOf(Pair("backgroundColor", text), Pair("backgroundImage", null))
        }
        "flex" -> expandFlex(value)
        "flexFlow" -> expandFlexFlow(value)
        "gap" -> expandGap(value)
        else -> listOf(Pair(name, value))
    }
}

/** `flex: <grow> [<shrink>]`, or `auto`/`none`. */
fun expandFlex(value: Any?): List<Pair<String, Any?>> {
    val text = value?.let { toText(it) } ?: return listOf(Pair("flexGrow", null), Pair("flexShrink", null))
    fun isValid(s: String) = parseFloat(s)?.let { !it.isNaN() && !it.isInfinite() && it >= 0 } ?: false
    val values = text.split(Regex("\\s+")).filter { it.isNotEmpty() }
    if (values.size == 1) {
        return when (values[0]) {
            "inital" -> listOf(Pair("flexGrow", 0.0), Pair("flexShrink", 1.0))
            "auto" -> listOf(Pair("flexGrow", 1.0), Pair("flexShrink", 1.0))
            "none" -> listOf(Pair("flexGrow", 0.0), Pair("flexShrink", 0.0))
            else -> if (isValid(values[0])) listOf(Pair("flexGrow", values[0]), Pair("flexShrink", 1.0)) else emptyList()
        }
    }
    if (values.size >= 2 && isValid(values[0]) && isValid(values[1])) return listOf(Pair("flexGrow", values[0]), Pair("flexShrink", values[1]))
    return emptyList()
}

/** `flex-flow: <flex-direction> || <flex-wrap>`, each part kept only when valid. */
fun expandFlexFlow(value: Any?): List<Pair<String, Any?>> {
    val text = value as? String ?: return listOf(Pair("flexDirection", value), Pair("flexWrap", value))
    val values = text.split(Regex("\\s+")).filter { it.isNotEmpty() }.map { it.lowercase() }
    val result = mutableListOf<Pair<String, Any?>>()
    if (values.isNotEmpty() && values[0] in setOf("row", "row-reverse", "column", "column-reverse")) result.add(Pair("flexDirection", values[0]))
    if (values.size >= 2 && values[1] in setOf("nowrap", "wrap", "wrap-reverse")) result.add(Pair("flexWrap", values[1]))
    return result
}

/** `gap: <row> [<column>]`. */
fun expandGap(value: Any?): List<Pair<String, Any?>> {
    val text = value as? String
    if (text == null || text == "auto") return listOf(Pair("rowGap", value), Pair("columnGap", value))
    if (text.isEmpty()) return listOf(Pair("rowGap", 0.0), Pair("columnGap", 0.0))
    val parts = text.split(' ', ',').filter { it.isNotEmpty() }
    return when (parts.size) {
        1 -> listOf(Pair("rowGap", parts[0]), Pair("columnGap", parts[0]))
        2 -> listOf(Pair("rowGap", parts[0]), Pair("columnGap", parts[1]))
        else -> emptyList()
    }
}
