package org.nativescript.kit

/**
 * CSS selectors as styling/css-selector builds them from css-what's parse:
 * simple selectors, compound sequences, complex selectors grouped by
 * ancestor and child combinators, and `:not`, `:is`, `:where`.
 */
abstract class CSSSelector {
    enum class Combinator { DESCENDANT, CHILD, ADJACENT, SIBLING }

    var specificity = 0
    /** Depends on attributes or pseudo-classes, which change without a re-match. */
    var dynamic = false
    var hasAdjacentCombinator = false
    var hasSiblingCombinator = false
    var combinator: Combinator? = null
    open val isValid: Boolean get() = true

    abstract fun match(view: View): Boolean
    open fun mayMatch(view: View): Boolean = match(view)
    open fun trackChanges(view: View, changes: CSSChanges) {}
}

/** The attributes and pseudo-classes of a view that a match depends on. */
class CSSChanges {
    val entries = mutableListOf<Pair<View, String>>()
    fun add(view: View, key: String) {
        if (entries.none { it.first === view && it.second == key }) entries.add(Pair(view, key))
    }
}

class InvalidSelector : CSSSelector() {
    override val isValid: Boolean get() = false
    override fun match(view: View): Boolean = false
}

class UniversalSelector : CSSSelector() {
    override fun match(view: View): Boolean = true
}

class IdSelector(val id: String) : CSSSelector() {
    init { specificity = 100 }
    override fun match(view: View): Boolean = view.cssId == id
}

class TypeSelector(val cssType: String) : CSSSelector() {
    init { specificity = 1 }
    override fun match(view: View): Boolean = view.cssType.lowercase() == cssType
}

class ClassSelector(val cssClass: String) : CSSSelector() {
    init { specificity = 10 }
    override fun match(view: View): Boolean = cssClass in view.cssClasses
}

class AttributeSelector(val attribute: String, val test: String, value: String, val ignoreCase: Boolean) : CSSSelector() {
    val value: String = if (ignoreCase) value.lowercase() else value

    init {
        specificity = 10
        dynamic = true
    }

    override fun match(view: View): Boolean {
        val raw = view.attributeValue(attribute)
        if (test == "exists") return raw != null
        if (value.isEmpty()) return false
        var attr = attributeString(raw)
        if (ignoreCase) attr = attr.lowercase()
        return when (test) {
            "equals" -> attr == value
            "start" -> attr.startsWith(value)
            "end" -> attr.endsWith(value)
            "any" -> attr.contains(value)
            "element" -> attr.split(" ").contains(value)
            "hyphen" -> attr == value || attr.startsWith("$value-")
            else -> false
        }
    }

    /** An attribute the view does not carry yet cannot be ruled out. */
    override fun mayMatch(view: View): Boolean = true
    override fun trackChanges(view: View, changes: CSSChanges) = changes.add(view, attribute)
}

open class PseudoClassSelector(val pseudoClass: String) : CSSSelector() {
    init {
        specificity = 10
        dynamic = true
    }

    override fun match(view: View): Boolean = pseudoClass in view.pseudoClasses
    override fun mayMatch(view: View): Boolean = true
    override fun trackChanges(view: View, changes: CSSChanges) = changes.add(view, ":$pseudoClass")
}

/**
 * `:not`, `:is`, `:where`: the specificity of the most specific argument
 * (`:where` none); an invalid argument empties a `:not` list and is skipped by the others.
 */
class FunctionalPseudoClassSelector(name: String, arguments: List<CSSSelector>) : PseudoClassSelector(name) {
    val selectors: List<CSSSelector>

    init {
        var list = mutableListOf<CSSSelector>()
        var highest = 0
        for (selector in arguments) {
            if (!selector.isValid) {
                if (name == "not") { list = mutableListOf(); highest = 0; break }
                continue
            }
            highest = maxOf(highest, selector.specificity)
            list.add(selector)
        }
        selectors = list
        specificity = if (name == "where") 0 else highest
        dynamic = selectors.any { it.dynamic }
        hasAdjacentCombinator = selectors.any { it.hasAdjacentCombinator }
        hasSiblingCombinator = selectors.any { it.hasSiblingCombinator }
    }

    override fun match(view: View): Boolean =
        if (pseudoClass == "not") selectors.none { it.match(view) } else selectors.any { it.match(view) }

    override fun trackChanges(view: View, changes: CSSChanges) {
        for (selector in selectors) selector.trackChanges(view, changes)
    }
}

class SimpleSelectorSequence(val selectors: List<CSSSelector>) : CSSSelector() {
    init {
        specificity = selectors.sumOf { it.specificity }
        dynamic = selectors.any { it.dynamic }
        hasAdjacentCombinator = selectors.any { it.hasAdjacentCombinator }
        hasSiblingCombinator = selectors.any { it.hasSiblingCombinator }
    }

    override fun match(view: View): Boolean = selectors.all { it.match(view) }
    override fun mayMatch(view: View): Boolean = selectors.all { it.mayMatch(view) }
    override fun trackChanges(view: View, changes: CSSChanges) {
        for (selector in selectors) selector.trackChanges(view, changes)
    }
}

class ComplexSelector(val selectors: List<CSSSelector>) : CSSSelector() {
    /**
     * Grouped by ancestor combinators, then by child combinators; a child
     * group's entries are single selectors or runs joined by sibling combinators.
     */
    private val groups = mutableListOf<MutableList<MutableList<CSSSelector>>>()

    init {
        for (selector in selectors.asReversed()) {
            when (selector.combinator) {
                null, Combinator.DESCENDANT -> groups.add(mutableListOf(mutableListOf()))
                Combinator.CHILD -> groups.last().add(mutableListOf())
                Combinator.ADJACENT -> hasAdjacentCombinator = true
                Combinator.SIBLING -> hasSiblingCombinator = true
            }
            specificity += selector.specificity
            if (selector.dynamic) dynamic = true
            if (selector.hasAdjacentCombinator) hasAdjacentCombinator = true
            if (selector.hasSiblingCombinator) hasSiblingCombinator = true
            groups.last().last().add(selector)
        }
    }

    override fun match(view: View): Boolean {
        var node: View? = view
        for ((i, group) in groups.withIndex()) {
            if (i == 0) {
                node = matchingNode(group, node!!, true) ?: return false
            } else {
                var ancestor = node!!.parent
                var matched = false
                while (ancestor != null) {
                    val found = matchingNode(group, ancestor, true)
                    if (found != null) {
                        node = found
                        matched = true
                        break
                    }
                    ancestor = ancestor.parent
                }
                if (!matched) return false
            }
        }
        return true
    }

    override fun mayMatch(view: View): Boolean = false

    override fun trackChanges(view: View, changes: CSSChanges) {
        for (selector in selectors) selector.trackChanges(view, changes)
    }

    private companion object {
        /** `ChildGroup.getMatchingNode`: each step goes to the parent. */
        fun matchingNode(group: List<List<CSSSelector>>, start: View, strict: Boolean): View? {
            var node: View? = start
            for ((i, entry) in group.withIndex()) {
                if (i != 0) node = node?.parent
                val current = node ?: return null
                val ok = if (entry.size > 1) siblingGroupMatches(entry, current, strict) else if (strict) entry[0].match(current) else entry[0].mayMatch(current)
                if (!ok) return null
            }
            return node
        }

        /**
         * `SiblingGroup.match`: a general sibling combinator does not move the
         * reference node for the selectors before it, as in NativeScript.
         */
        fun siblingGroupMatches(selectors: List<CSSSelector>, start: View, strict: Boolean): Boolean {
            var node: View? = start
            for ((i, selector) in selectors.withIndex()) {
                val test = { v: View -> if (strict) selector.match(v) else selector.mayMatch(v) }
                if (i == 0) {
                    val current = node ?: return false
                    if (!test(current)) return false
                    continue
                }
                if (selector.combinator == Combinator.ADJACENT) {
                    node = node?.let { View.previousSibling(it) }
                    val current = node ?: return false
                    if (!test(current)) return false
                    continue
                }
                val current = node
                if (current == null || View.previousSiblings(current).none(test)) return false
            }
            return true
        }
    }
}

/** css-what's subset as styling/css-selector `createSelector` uses it. */
object SelectorParser {
    /** A selector as NativeScript builds it; anything it cannot use is an `InvalidSelector`. */
    fun parse(text: String): CSSSelector {
        val scanner = Scanner(text)
        val lists = scanner.selectorList(null) ?: return InvalidSelector()
        val first = lists.firstOrNull() ?: return InvalidSelector()
        return build(first)
    }

    sealed class Token {
        class Tag(val name: String) : Token()
        object Universal : Token()
        class Attribute(val name: String, val action: String, val value: String, val ignoreCase: Boolean?) : Token()
        class Pseudo(val name: String, val data: List<List<Token>>?) : Token()
        object PseudoElement : Token()
        class Combine(val combinator: CSSSelector.Combinator?) : Token()
    }

    fun build(tokens: List<Token>): CSSSelector {
        if (tokens.isEmpty()) return InvalidSelector()
        if (tokens.size == 1) return simple(tokens[0])
        val sequences = mutableListOf<CSSSelector>()
        var current = mutableListOf<Token>()
        var combinators = 0
        for (token in tokens) {
            if (token is Token.Combine) {
                val combinator = token.combinator ?: return InvalidSelector()
                val sequence = sequence(current)
                if (!sequence.isValid) return sequence
                sequence.combinator = combinator
                sequences.add(sequence)
                combinators++
                current = mutableListOf()
            } else current.add(token)
        }
        if (combinators > 0) {
            if (current.isNotEmpty()) {
                val sequence = sequence(current)
                if (!sequence.isValid) return sequence
                sequences.add(sequence)
            }
            return ComplexSelector(sequences)
        }
        return sequence(current)
    }

    private fun sequence(tokens: List<Token>): CSSSelector {
        if (tokens.isEmpty()) return InvalidSelector()
        if (tokens.size == 1) return simple(tokens[0])
        val selectors = mutableListOf<CSSSelector>()
        for (token in tokens) {
            val selector = simple(token)
            if (!selector.isValid) return selector
            selectors.add(selector)
        }
        return SimpleSelectorSequence(selectors)
    }

    private fun simple(token: Token): CSSSelector = when (token) {
        is Token.Attribute -> when (token.name) {
            "class" -> ClassSelector(token.value)
            "id" -> IdSelector(token.value)
            else -> AttributeSelector(token.name, token.action, token.value, token.ignoreCase ?: false)
        }
        is Token.Tag -> TypeSelector(token.name.replaceFirst("-", "").lowercase())
        is Token.Pseudo ->
            if (token.name in setOf("is", "where", "not")) FunctionalPseudoClassSelector(token.name, (token.data ?: emptyList()).map { build(it) })
            else PseudoClassSelector(token.name)
        Token.Universal -> UniversalSelector()
        else -> InvalidSelector()
    }

    private class Scanner(text: String) {
        val chars = text.toCharArray()
        var i = 0

        val atEnd: Boolean get() = i >= chars.size
        val peek: Char? get() = if (atEnd) null else chars[i]

        fun skipWhitespace() { while (peek?.isWhitespace() == true) i++ }

        /** A comma-separated list; null where css-what would throw. */
        fun selectorList(terminator: Char?): List<List<Token>>? {
            val lists = mutableListOf<List<Token>>()
            var tokens = mutableListOf<Token>()
            skipWhitespace()
            fun finalize(): Boolean {
                val last = tokens.lastOrNull()
                if (last is Token.Combine && last.combinator == CSSSelector.Combinator.DESCENDANT) tokens.removeAt(tokens.size - 1)
                if (tokens.isEmpty()) return false
                lists.add(tokens)
                return true
            }
            fun traversal(combinator: CSSSelector.Combinator?): Boolean {
                val last = tokens.lastOrNull()
                if (last is Token.Combine && last.combinator == CSSSelector.Combinator.DESCENDANT) {
                    tokens[tokens.size - 1] = Token.Combine(combinator)
                    return true
                }
                if (last is Token.Combine) return false
                if (tokens.isEmpty()) return false
                tokens.add(Token.Combine(combinator))
                return true
            }
            while (true) {
                val c = peek ?: break
                if (terminator != null && c == terminator) break
                when {
                    c.isWhitespace() -> {
                        if (tokens.lastOrNull() !is Token.Combine && tokens.isNotEmpty()) tokens.add(Token.Combine(CSSSelector.Combinator.DESCENDANT))
                        skipWhitespace()
                    }
                    c == '>' || c == '~' || c == '+' || c == '<' -> {
                        val combinator = when (c) {
                            '>' -> CSSSelector.Combinator.CHILD
                            '~' -> CSSSelector.Combinator.SIBLING
                            '+' -> CSSSelector.Combinator.ADJACENT
                            else -> null
                        }
                        if (!traversal(combinator)) return null
                        i++
                        skipWhitespace()
                    }
                    c == '.' -> {
                        i++
                        tokens.add(Token.Attribute("class", "element", name(), null))
                    }
                    c == '#' -> {
                        i++
                        tokens.add(Token.Attribute("id", "equals", name(), null))
                    }
                    c == '[' -> {
                        i++
                        tokens.add(attribute() ?: return null)
                    }
                    c == ':' -> {
                        if (i + 1 < chars.size && chars[i + 1] == ':') {
                            i += 2
                            name()
                            if (peek == '(') parenthesized()
                            tokens.add(Token.PseudoElement)
                            continue
                        }
                        i++
                        val pseudo = name().lowercase()
                        if (pseudo in setOf("before", "after", "first-line", "first-letter")) {
                            tokens.add(Token.PseudoElement)
                            continue
                        }
                        var data: List<List<Token>>? = null
                        if (peek == '(') {
                            if (pseudo in setOf("has", "not", "matches", "is", "where", "host", "host-context")) {
                                i++
                                val list = selectorList(')')
                                if (list == null || peek != ')') return null
                                i++
                                data = list
                            } else parenthesized()
                        }
                        tokens.add(Token.Pseudo(pseudo, data))
                    }
                    c == ',' -> {
                        if (!finalize()) return null
                        tokens = mutableListOf()
                        i++
                        skipWhitespace()
                    }
                    c == '*' -> {
                        i++
                        tokens.add(Token.Universal)
                    }
                    else -> {
                        val n = name()
                        if (n.isEmpty()) return if (finalize()) lists else null
                        tokens.add(Token.Tag(n))
                    }
                }
            }
            return if (finalize()) lists else null
        }

        /** css-what's `getName`: word characters, hyphens, escapes and non-ASCII. */
        fun name(): String {
            val result = StringBuilder()
            while (true) {
                val c = peek ?: break
                if (c == '\\' && i + 1 < chars.size) {
                    result.append(chars[i + 1])
                    i += 2
                } else if (c.isLetterOrDigit() || c == '_' || c == '-' || c.code >= 0xB0) {
                    result.append(c)
                    i++
                } else break
            }
            return result.toString()
        }

        fun parenthesized(): String {
            i++
            var depth = 1
            val result = StringBuilder()
            while (true) {
                val c = peek ?: break
                i++
                if (c == '(') depth++
                if (c == ')') {
                    depth--
                    if (depth == 0) break
                }
                result.append(c)
            }
            return result.toString()
        }

        fun attribute(): Token? {
            skipWhitespace()
            val attributeName = name()
            skipWhitespace()
            var action = "exists"
            val actions = mapOf('~' to "element", '^' to "start", '$' to "end", '*' to "any", '!' to "not", '|' to "hyphen")
            val c0 = peek
            if (c0 != null && actions.containsKey(c0)) {
                if (i + 1 >= chars.size || chars[i + 1] != '=') return null
                action = actions[c0]!!
                i += 2
                skipWhitespace()
            } else if (c0 == '=') {
                action = "equals"
                i++
                skipWhitespace()
            }
            val value = StringBuilder()
            var ignoreCase: Boolean? = null
            if (action != "exists") {
                val quote = peek
                if (quote == '"' || quote == '\'') {
                    i++
                    while (true) {
                        val c = peek ?: break
                        if (c == quote) break
                        if (c == '\\') i++
                        peek?.let { value.append(it) }
                        i++
                    }
                    if (peek != quote) return null
                    i++
                } else {
                    while (true) {
                        val c = peek ?: break
                        if (c.isWhitespace() || c == ']') break
                        if (c == '\\') i++
                        peek?.let { value.append(it) }
                        i++
                    }
                }
                skipWhitespace()
                when (peek?.lowercaseChar()) {
                    'i' -> { ignoreCase = true; i++; skipWhitespace() }
                    's' -> { ignoreCase = false; i++; skipWhitespace() }
                    else -> {}
                }
            }
            if (peek != ']') return null
            i++
            return Token.Attribute(attributeName, action, value.toString(), ignoreCase)
        }
    }
}

/** JavaScript's `value + ''` for an attribute selector. */
private fun attributeString(value: Any?): String = when (value) {
    null -> "undefined"
    is String -> value
    is Double -> js(value)
    is Int -> value.toString()
    is Boolean -> js(value)
    else -> toText(value) ?: ""
}
