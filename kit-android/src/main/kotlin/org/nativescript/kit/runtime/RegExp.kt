package org.nativescript.kit

// Regular expressions with ECMA-262 §22.2 semantics: a parser for the pattern grammar (with
// Annex B's web-compatible forms outside `u`/`v` mode) and a backtracking matcher over UTF-16
// code units, or code points in `u`/`v` mode. Errors carry V8's messages.

/** A JavaScript `RegExp`. Constructing an invalid pattern or flags throws a SyntaxError. */
class JSRegExp(source: String, flags: String = "") : JSDynamic, JSStringConvertible {
    /** `re.source`: the pattern as a literal would spell it. */
    val source: String = escapePattern(source)

    /** `re.flags`, in the canonical order `dgimsuvy`. */
    val flags: String
    val hasIndices: Boolean
    val global: Boolean
    val ignoreCase: Boolean
    val multiline: Boolean
    val dotAll: Boolean
    val unicode: Boolean
    val unicodeSets: Boolean
    val sticky: Boolean
    var lastIndex: Double = 0.0

    private val program: RegexProgram

    init {
        var seen = 0
        for (c in flags) {
            val bit = "dgimsuvy".indexOf(c)
            if (bit < 0 || seen and (1 shl bit) != 0) throw JSException(JSSyntaxError("Invalid flags supplied to RegExp constructor '$flags'"))
            seen = seen or (1 shl bit)
        }
        this.flags = "dgimsuvy".filter { it in flags }
        hasIndices = 'd' in flags
        global = 'g' in flags
        ignoreCase = 'i' in flags
        multiline = 'm' in flags
        dotAll = 's' in flags
        unicode = 'u' in flags
        unicodeSets = 'v' in flags
        sticky = 'y' in flags
        if (unicode && unicodeSets) throw JSException(JSSyntaxError("Invalid flags supplied to RegExp constructor '$flags'"))
        program = try {
            RegexParser(source, ignoreCase, multiline, dotAll, unicode || unicodeSets, unicodeSets).parse()
        } catch (e: RegexSyntaxError) {
            throw JSException(JSSyntaxError("Invalid regular expression: /$source/${this.flags}: ${e.message}"))
        }
    }

    private val fullUnicode: Boolean get() = unicode || unicodeSets

    /** RegExpBuiltinExec: a match at or after `lastIndex` (exactly there when sticky), updating `lastIndex` for global and sticky expressions. */
    fun exec(s: String): JSMatch? {
        val useLastIndex = global || sticky
        var start = if (useLastIndex) toLength(lastIndex) else 0L
        while (true) {
            if (start > s.length) {
                if (useLastIndex) lastIndex = 0.0
                return null
            }
            if (!sticky && program.firstUnit >= 0) {
                val next = s.indexOf(program.firstUnit.toChar(), start.toInt())
                if (next < 0) {
                    if (useLastIndex) lastIndex = 0.0
                    return null
                }
                start = next.toLong()
            }
            val captures = program.matchAt(s, start.toInt())
            if (captures != null) {
                if (useLastIndex) lastIndex = captures[1].toDouble()
                return makeMatch(s, captures)
            }
            if (sticky) {
                lastIndex = 0.0
                return null
            }
            start = advance(s, start, fullUnicode)
        }
    }

    /** `re.test(s)`. */
    fun test(s: String): Boolean = exec(s) != null

    private fun makeMatch(s: String, captures: IntArray): JSMatch {
        val n = captures.size / 2
        val values = ArrayList<String?>(n)
        for (g in 0 until n) values.add(if (captures[2 * g] < 0) null else s.substring(captures[2 * g], captures[2 * g + 1]))
        val groups = namedObject(program.groupNames) { g -> values[g] }
        var indices: JSMatchIndices? = null
        if (hasIndices) {
            val pairs = ArrayList<Any?>(n)
            for (g in 0 until n) pairs.add(if (captures[2 * g] < 0) null else JSArray(arrayListOf(captures[2 * g].toDouble(), captures[2 * g + 1].toDouble())))
            indices = JSMatchIndices(JSArray(pairs), namedObject(program.groupNames) { g -> pairs[g] })
        }
        return JSMatch(JSArray(values), captures[0].toDouble(), s, groups, true, indices)
    }

    private fun namedObject(names: List<Pair<String, Int>>, value: (Int) -> Any?): JSObject? {
        if (names.isEmpty()) return null
        val obj = JSObject()
        obj.jsNullPrototype = true
        for ((name, g) in names) {
            val v = value(g)
            if (!obj.has(name) || (obj[name] == null && v != null)) obj[name] = v
        }
        return obj
    }

    override fun jsGet(key: String): Any? = when (key) {
        "lastIndex" -> lastIndex
        "source" -> source
        "flags" -> flags
        "global" -> global
        "ignoreCase" -> ignoreCase
        "multiline" -> multiline
        "dotAll" -> dotAll
        "unicode" -> unicode
        "unicodeSets" -> unicodeSets
        "sticky" -> sticky
        "hasIndices" -> hasIndices
        else -> null
    }

    override fun jsSet(key: String, value: Any?) {
        if (key == "lastIndex") lastIndex = jsToNumber(value)
    }

    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "RegExp"

    override fun toString(): String = "/$source/$flags"

    internal companion object {
        fun toLength(v: Double): Long {
            if (v.isNaN() || v <= 0) return 0
            return minOf(Math.floor(v), 9007199254740991.0).toLong()
        }

        /** AdvanceStringIndex. */
        fun advance(s: String, index: Long, unicode: Boolean): Long {
            if (!unicode || index + 1 >= s.length) return index + 1
            val i = index.toInt()
            return if (Character.isHighSurrogate(s[i]) && Character.isLowSurrogate(s[i + 1])) index + 2 else index + 1
        }

        /** EscapeRegExpPattern as V8 does it: `/` outside classes and line terminators escaped, "" as `(?:)`. */
        fun escapePattern(p: String): String {
            if (p.isEmpty()) return "(?:)"
            val out = StringBuilder(p.length)
            var inClass = false
            var i = 0
            while (i < p.length) {
                val c = p[i]
                when {
                    c == '\\' && i + 1 < p.length -> {
                        out.append(c)
                        i++
                        out.append(lineTerminatorEscape(p[i])?.substring(1) ?: p[i].toString())
                    }
                    c == '/' && !inClass -> out.append("\\/")
                    c == '[' -> { inClass = true; out.append(c) }
                    c == ']' -> { inClass = false; out.append(c) }
                    else -> out.append(lineTerminatorEscape(c) ?: c.toString())
                }
                i++
            }
            return out.toString()
        }

        private fun lineTerminatorEscape(c: Char): String? = when (c) {
            '\n' -> "\\n"
            '\r' -> "\\r"
            '\u2028' -> "\\u2028"
            '\u2029' -> "\\u2029"
            else -> null
        }
    }
}

/**
 * The array `exec` and `match` return: the matched text, then each group (undefined when it
 * did not take part), with `index`, `input`, `groups` (and `indices` for the `d` flag). The
 * array `match` returns for a global expression is a plain array of matched texts.
 */
class JSMatch internal constructor(
    val values: JSArray<String?>,
    val index: Double,
    val input: String,
    val groups: JSObject?,
    internal val isExecResult: Boolean,
    internal val indices: JSMatchIndices? = null,
) : JSDynamic, JSStringConvertible {
    internal val hasIndices: Boolean get() = indices != null

    operator fun get(i: Int): String? = if (i >= 0 && i < values.storage.size) values.storage[i] else null

    operator fun get(i: Double): String? = if (i == Math.floor(i)) get(i.toInt()) else null

    val length: Double get() = values.storage.size.toDouble()

    override fun jsGet(key: String): Any? = when (key) {
        "length" -> length
        "index" -> if (isExecResult) index else null
        "input" -> if (isExecResult) input else null
        "groups" -> if (isExecResult) groups else null
        "indices" -> indices
        else -> jsArrayIndex(key)?.let { if (it < values.storage.size) values.storage[it.toInt()] else null }
    }

    override fun jsSet(key: String, value: Any?) {
        jsArrayIndex(key)?.let { if (it < values.storage.size) values.storage[it.toInt()] = value as? String }
    }

    override val jsKeys: List<String>
        get() = values.storage.indices.map { it.toString() } +
            (if (isExecResult) listOf("index", "input", "groups") else emptyList()) +
            (if (indices != null) listOf("indices") else emptyList())

    override val jsClassName: String? get() = "Array"

    override fun toString(): String = jsJoin(values.storage, ",", this)

    companion object {
        /** `[]` where code holds a match (`text.match(re) || []`): no values. */
        fun empty(): JSMatch = JSMatch(JSArray(), 0.0, "", null, false)
    }
}

/** A match's `indices` (the `d` flag): `[start, end]` per group, with `groups`. */
class JSMatchIndices internal constructor(val values: JSArray<Any?>, val groups: JSObject?) : JSDynamic {
    override fun jsGet(key: String): Any? = when (key) {
        "length" -> values.storage.size.toDouble()
        "groups" -> groups
        else -> jsArrayIndex(key)?.let { if (it < values.storage.size) values.storage[it.toInt()] else null }
    }

    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = values.storage.indices.map { it.toString() } + "groups"
    override val jsClassName: String? get() = "Array"
}

/** What `s.match(x)` searches with: a RegExp as it is, anything else as `new RegExp(x)`. */
fun jsRegExpFrom(value: Any?): JSRegExp = value as? JSRegExp ?: JSRegExp(if (value == null || value === Unit) "(?:)" else jsToString(value))

/** A regular expression literal. */
fun jsRegExpLiteral(source: String, flags: String): JSRegExp = JSRegExp(source, flags)

/** `s.match(re)`: the first match (with groups) or, for a global expression, every matched text; null when nothing matches. */
fun jsMatch(s: String, re: JSRegExp): JSMatch? {
    if (!re.global) return re.exec(s)
    re.lastIndex = 0.0
    val out = ArrayList<String?>()
    while (true) {
        val m = re.exec(s) ?: break
        val text = m[0] ?: ""
        out.add(text)
        if (text.isEmpty()) re.lastIndex = JSRegExp.advance(s, JSRegExp.toLength(re.lastIndex), re.unicode || re.unicodeSets).toDouble()
    }
    return if (out.isEmpty()) null else JSMatch(JSArray(out), Double.NaN, s, null, false)
}

/** `s.matchAll(re)`: every match of a global expression, from its `lastIndex`. */
fun jsMatchAll(s: String, re: JSRegExp): JSArray<JSMatch> {
    if (!re.global) throw JSException(JSTypeError("String.prototype.matchAll called with a non-global RegExp argument"))
    val copy = JSRegExp(re.source, re.flags)
    copy.lastIndex = JSRegExp.toLength(re.lastIndex).toDouble()
    val out = ArrayList<JSMatch>()
    while (true) {
        val m = copy.exec(s) ?: break
        out.add(m)
        if ((m[0] ?: "").isEmpty()) copy.lastIndex = JSRegExp.advance(s, JSRegExp.toLength(copy.lastIndex), copy.unicode || copy.unicodeSets).toDouble()
    }
    return JSArray(out)
}

/** `s.search(re)`: the index of the first match, -1 when none; `lastIndex` is left as it was. */
fun jsSearch(s: String, re: JSRegExp): Double {
    val previous = re.lastIndex
    re.lastIndex = 0.0
    val m = re.exec(s)
    re.lastIndex = previous
    return m?.index ?: -1.0
}

/** `s.replace(re, replacement)` with GetSubstitution's `$$ $& $` $' $n $nn $<name>`. */
fun jsReplace(s: String, re: JSRegExp, replacement: String): String =
    replaceMatches(s, re) { m -> substitute(replacement, m, s) }

/** `s.replace(re, (match, ...groups) => …)`. */
fun jsReplace(s: String, re: JSRegExp, replacer: (JSMatch) -> String): String = replaceMatches(s, re, replacer)

/** `s.replaceAll(re, replacement)`: the expression must be global. */
fun jsReplaceAll(s: String, re: JSRegExp, replacement: String): String {
    if (!re.global) throw JSException(JSTypeError("String.prototype.replaceAll called with a non-global RegExp argument"))
    return jsReplace(s, re, replacement)
}

/** `s.replaceAll(re, replacer)`: the expression must be global. */
fun jsReplaceAll(s: String, re: JSRegExp, replacer: (JSMatch) -> String): String {
    if (!re.global) throw JSException(JSTypeError("String.prototype.replaceAll called with a non-global RegExp argument"))
    return jsReplace(s, re, replacer)
}

/** RegExp.prototype[@@replace]: every match is found before the first replacement is computed. */
private fun replaceMatches(s: String, re: JSRegExp, replacer: (JSMatch) -> String): String {
    val results = ArrayList<JSMatch>()
    if (re.global) re.lastIndex = 0.0
    while (true) {
        val m = re.exec(s) ?: break
        results.add(m)
        if (!re.global) break
        if ((m[0] ?: "").isEmpty()) re.lastIndex = JSRegExp.advance(s, JSRegExp.toLength(re.lastIndex), re.unicode || re.unicodeSets).toDouble()
    }
    val out = StringBuilder()
    var next = 0
    for (m in results) {
        val matched = m[0] ?: ""
        val position = maxOf(0, minOf(m.index.toInt(), s.length))
        val text = replacer(m)
        if (position >= next) {
            out.append(s, next, position).append(text)
            next = position + matched.length
        }
    }
    if (next < s.length) out.append(s, next, s.length)
    return out.toString()
}

/** GetSubstitution. */
private fun substitute(template: String, m: JSMatch, s: String): String {
    if (template.indexOf('$') < 0) return template
    val matched = m[0] ?: ""
    val position = m.index.toInt()
    val captureCount = m.values.storage.size - 1
    val out = StringBuilder()
    var i = 0
    while (i < template.length) {
        val c = template[i]
        if (c != '$' || i + 1 >= template.length) { out.append(c); i++; continue }
        val n = template[i + 1]
        when {
            n == '$' -> { out.append('$'); i += 2 }
            n == '&' -> { out.append(matched); i += 2 }
            n == '`' -> { out.append(s, 0, position); i += 2 }
            n == '\'' -> { out.append(s, minOf(position + matched.length, s.length), s.length); i += 2 }
            n in '0'..'9' -> {
                var digits = if (i + 2 < template.length && template[i + 2] in '0'..'9') 2 else 1
                var index = if (digits == 2) (n - '0') * 10 + (template[i + 2] - '0') else n - '0'
                if (index > captureCount && digits == 2) { digits = 1; index = n - '0' }
                if (index in 1..captureCount) out.append(m[index] ?: "") else out.append(template, i, i + 1 + digits)
                i += 1 + digits
            }
            n == '<' -> {
                val groups = m.groups
                val close = template.indexOf('>', i + 2)
                if (groups == null || close < 0) { out.append("$<"); i += 2 }
                else {
                    val v = groups[template.substring(i + 2, close)]
                    if (v != null) out.append(jsToString(v))
                    i = close + 1
                }
            }
            else -> { out.append('$'); i++ }
        }
    }
    return out.toString()
}

/** `s.split(re, limit)` (RegExp.prototype[@@split]): captures are spliced in, an unmatched one as undefined. */
@Suppress("UNCHECKED_CAST")
fun jsSplit(s: String, re: JSRegExp, limit: Double? = null): JSArray<String> {
    val out = ArrayList<String?>()
    val lim = if (limit == null) 4294967295L else jsToUint32(limit)
    if (lim == 0L) return JSArray(out as ArrayList<String>)
    val splitter = JSRegExp(re.source, if (re.sticky) re.flags else re.flags + "y")
    val unicode = re.unicode || re.unicodeSets
    if (s.isEmpty()) {
        if (splitter.exec(s) == null) out.add(s)
        return JSArray(out as ArrayList<String>)
    }
    var p = 0
    var q = 0L
    while (q < s.length) {
        splitter.lastIndex = q.toDouble()
        val z = splitter.exec(s)
        if (z == null) { q = JSRegExp.advance(s, q, unicode); continue }
        val e = minOf(JSRegExp.toLength(splitter.lastIndex), s.length.toLong()).toInt()
        if (e == p) { q = JSRegExp.advance(s, q, unicode); continue }
        out.add(s.substring(p, q.toInt()))
        if (out.size.toLong() == lim) return JSArray(out as ArrayList<String>)
        p = e
        for (g in 1 until z.values.storage.size) {
            out.add(z.values.storage[g])
            if (out.size.toLong() == lim) return JSArray(out as ArrayList<String>)
        }
        q = p.toLong()
    }
    out.add(s.substring(p))
    return JSArray(out as ArrayList<String>)
}

// Pattern syntax

private class RegexSyntaxError(message: String) : Exception(message)

private const val INFINITE = Int.MAX_VALUE

private sealed class RNode
private class RSeq(val items: List<RNode>) : RNode()
private class RAlt(val alternatives: List<RNode>) : RNode()
private class RChar(val cp: Int, val ignoreCase: Boolean) : RNode()
private class RClass(val set: RSet, val negated: Boolean, val ignoreCase: Boolean) : RNode()
private class RAssertion(val kind: Char, val multiline: Boolean, val wordExtras: Boolean) : RNode()
private class RGroup(val index: Int, val body: RNode) : RNode()
private class RLook(val ahead: Boolean, val negative: Boolean, val body: RNode) : RNode()
private class RBackReference(var groups: IntArray, val ignoreCase: Boolean) : RNode()
private class RRepeat(val body: RNode, val min: Int, val max: Int, val greedy: Boolean, val firstGroup: Int, val groupCount: Int) : RNode()

/** A class's members: code point ranges and predicates (class escapes, property escapes). */
private class RSet {
    val ranges = ArrayList<IntArray>()
    val predicates = ArrayList<(Int) -> Boolean>()

    fun add(lo: Int, hi: Int = lo): RSet { ranges.add(intArrayOf(lo, hi)); return this }
    fun add(test: (Int) -> Boolean): RSet { predicates.add(test); return this }
    fun addAll(other: RSet) { ranges.addAll(other.ranges); predicates.addAll(other.predicates) }

    fun contains(cp: Int): Boolean {
        for (r in ranges) if (cp >= r[0] && cp <= r[1]) return true
        for (p in predicates) if (p(cp)) return true
        return false
    }
}

private fun isLineTerminator(c: Int) = c == 0x0A || c == 0x0D || c == 0x2028 || c == 0x2029
private fun isDecimalDigit(c: Int) = c in 0x30..0x39
private fun isBasicWordChar(c: Int) = c in 0x61..0x7A || c in 0x41..0x5A || c in 0x30..0x39 || c == 0x5F
private fun isJSWhitespace(c: Int) = c <= 0xFFFF && jsIsWhitespace(c.toChar())
private fun isHexDigit(c: Char) = c in '0'..'9' || c in 'a'..'f' || c in 'A'..'F'

/** Canonicalize (§22.2.2.7.3) and the inverse classes it induces, built on first use of the `i` flag. */
private object CaseFolding {
    private val upper: CharArray by lazy {
        CharArray(0x10000) { c ->
            val ch = c.toChar()
            if (Character.isSurrogate(ch)) ch
            else {
                val u = ch.toString().uppercase(java.util.Locale.ROOT)
                if (u.length != 1 || (c >= 128 && u[0].code < 128)) ch else u[0]
            }
        }
    }

    private val unitClasses: Map<Int, IntArray> by lazy { classes(0xFFFF) { canonicalize(it, false) } }
    private val pointClasses: Map<Int, IntArray> by lazy { classes(0x10FFFF) { canonicalize(it, true) } }

    private fun classes(last: Int, canon: (Int) -> Int): Map<Int, IntArray> {
        val members = HashMap<Int, ArrayList<Int>>()
        for (c in 0..last) {
            val k = canon(c)
            if (k != c) members.getOrPut(k) { arrayListOf(k) }.add(c)
        }
        return members.mapValues { it.value.toIntArray() }
    }

    /**
     * Simple case folding as lower(upper(c)), with the exceptions CaseFolding.txt makes: the
     * dotted and dotless i fold only to themselves, and three characters without case mappings fold.
     */
    fun canonicalize(c: Int, unicode: Boolean): Int {
        if (!unicode) return if (c <= 0xFFFF) upper[c].code else c
        return when (c) {
            0x130, 0x131 -> c
            0x1FD3 -> 0x390
            0x1FE3 -> 0x3B0
            0xFB05 -> 0xFB06
            else -> Character.toLowerCase(Character.toUpperCase(c))
        }
    }

    /** Every character whose canonical form is `canon`'s. */
    fun equivalents(canon: Int, unicode: Boolean): IntArray? = (if (unicode) pointClasses else unitClasses)[canon]
}

/** Whether `set` holds `c` or a character with the same canonical form (CharacterSetMatcher under `i`). */
private fun caseClosedContains(set: RSet, c: Int, unicode: Boolean): Boolean {
    if (set.contains(c)) return true
    val members = CaseFolding.equivalents(CaseFolding.canonicalize(c, unicode), unicode) ?: return false
    for (m in members) if (m != c && set.contains(m)) return true
    return false
}

/** A `v`-mode class: its single characters as a test, and its strings of other lengths. */
private class SetClass(val test: (Int) -> Boolean, val strings: Set<String>)

private class SetOperand(val cp: Int, val set: SetClass?)

private class NamedGroup(val name: String, val index: Int, val path: List<IntArray>)

/** The pattern grammar of §22.2.1, with Annex B §B.1.2 outside unicode mode. */
private class RegexParser(val p: String, var ignoreCase: Boolean, var multiline: Boolean, var dotAll: Boolean, val unicodeMode: Boolean, val setsMode: Boolean) {
    private var pos = 0
    private var groupCount = 0
    private val totalGroups: Int
    private val hasNamedGroups: Boolean
    private val names = ArrayList<NamedGroup>()
    private val namedReferences = ArrayList<Pair<String, RBackReference>>()
    private val path = ArrayList<IntArray>()
    private var disjunctions = 0

    init {
        var count = 0
        var named = false
        var i = 0
        var inClass = false
        while (i < p.length) {
            val c = p[i]
            when {
                c == '\\' -> i++
                inClass -> if (c == ']') inClass = false
                c == '[' -> inClass = true
                c == '(' -> if (i + 1 < p.length && p[i + 1] == '?') {
                    if (i + 3 < p.length && p[i + 2] == '<' && p[i + 3] != '=' && p[i + 3] != '!') { count++; named = true }
                } else count++
            }
            i++
        }
        totalGroups = count
        hasNamedGroups = named
    }

    private fun error(message: String): Nothing = throw RegexSyntaxError(message)

    fun parse(): RegexProgram {
        val root = parseDisjunction()
        if (pos < p.length) error("Unmatched ')'")
        for ((name, ref) in namedReferences) {
            val groups = names.filter { it.name == name }.map { it.index }
            if (groups.isEmpty()) error("Invalid named capture referenced")
            ref.groups = groups.toIntArray()
        }
        return RegexProgram(root, groupCount, names.map { Pair(it.name, it.index) }, unicodeMode)
    }

    private fun peekCodePoint(): Int = if (unicodeMode) p.codePointAt(pos) else p[pos].code

    private fun parseDisjunction(): RNode {
        val marker = intArrayOf(disjunctions++, 0)
        path.add(marker)
        val alternatives = arrayListOf(parseAlternative())
        while (pos < p.length && p[pos] == '|') {
            pos++
            marker[1]++
            alternatives.add(parseAlternative())
        }
        path.removeAt(path.size - 1)
        return if (alternatives.size == 1) alternatives[0] else RAlt(alternatives)
    }

    private fun parseAlternative(): RNode {
        val items = ArrayList<RNode>()
        while (pos < p.length && p[pos] != '|' && p[pos] != ')') items.add(parseTerm())
        return if (items.size == 1) items[0] else RSeq(items)
    }

    private fun atQuantifier(): Boolean {
        if (pos >= p.length) return false
        val c = p[pos]
        return c == '*' || c == '+' || c == '?' || (c == '{' && braced(pos) != null)
    }

    private fun assertion(node: RNode): RNode {
        if (atQuantifier()) error("Nothing to repeat")
        return node
    }

    private fun parseTerm(): RNode {
        val c = p[pos]
        when {
            c == '^' -> { pos++; return assertion(RAssertion('^', multiline, false)) }
            c == '$' -> { pos++; return assertion(RAssertion('$', multiline, false)) }
            c == '\\' && pos + 1 < p.length && (p[pos + 1] == 'b' || p[pos + 1] == 'B') -> {
                pos += 2
                return assertion(RAssertion(p[pos - 1], false, unicodeMode && ignoreCase))
            }
            p.startsWith("(?=", pos) || p.startsWith("(?!", pos) || p.startsWith("(?<=", pos) || p.startsWith("(?<!", pos) -> {
                val ahead = p[pos + 2] != '<'
                val negative = p[pos + (if (ahead) 2 else 3)] == '!'
                pos += if (ahead) 3 else 4
                val before = groupCount
                val body = parseDisjunction()
                if (pos >= p.length) error("Unterminated group")
                pos++
                val node = RLook(ahead, negative, body)
                if (ahead && !unicodeMode) return parseQuantifier(node, before)
                if (atQuantifier()) error("Invalid quantifier")
                return node
            }
        }
        val before = groupCount
        return parseQuantifier(parseAtom(), before)
    }

    /** `{n}`, `{n,}` or `{n,m}` at `at`: min, max and the position after it. */
    private fun braced(at: Int): IntArray? {
        var i = at + 1
        fun number(): Int? {
            val start = i
            var v = 0L
            while (i < p.length && p[i] in '0'..'9') { v = minOf(v * 10 + (p[i] - '0'), INFINITE.toLong()); i++ }
            return if (i == start) null else v.toInt()
        }
        val min = number() ?: return null
        var max = min
        if (i < p.length && p[i] == ',') {
            i++
            max = number() ?: INFINITE
        }
        if (i >= p.length || p[i] != '}') return null
        return intArrayOf(min, max, i + 1)
    }

    private fun parseQuantifier(atom: RNode, groupsBefore: Int): RNode {
        if (pos >= p.length) return atom
        val min: Int
        val max: Int
        when (p[pos]) {
            '*' -> { min = 0; max = INFINITE; pos++ }
            '+' -> { min = 1; max = INFINITE; pos++ }
            '?' -> { min = 0; max = 1; pos++ }
            '{' -> {
                val q = braced(pos)
                if (q == null) {
                    if (unicodeMode) error("Incomplete quantifier")
                    return atom
                }
                min = q[0]; max = q[1]; pos = q[2]
                if (min > max) error("numbers out of order in {} quantifier")
            }
            else -> return atom
        }
        var greedy = true
        if (pos < p.length && p[pos] == '?') { pos++; greedy = false }
        return RRepeat(atom, min, max, greedy, groupsBefore, groupCount - groupsBefore)
    }

    private fun parseAtom(): RNode {
        val c = p[pos]
        when (c) {
            '.' -> {
                pos++
                val all = dotAll
                return RClass(RSet().add { all || !isLineTerminator(it) }, false, false)
            }
            '(' -> return parseGroup()
            '[' -> return if (setsMode) parseSetClass() else parseClass()
            '\\' -> return parseAtomEscape()
            '*', '+', '?' -> error("Nothing to repeat")
            '{' -> {
                if (braced(pos) != null) error("Nothing to repeat")
                if (unicodeMode) error("Lone quantifier brackets")
            }
            '}', ']' -> if (unicodeMode) error("Lone quantifier brackets")
        }
        val cp = peekCodePoint()
        pos += Character.charCount(cp)
        return RChar(cp, ignoreCase)
    }

    private fun closeGroup() {
        if (pos >= p.length || p[pos] != ')') error("Unterminated group")
        pos++
    }

    private fun parseGroup(): RNode {
        if (p.startsWith("(?:", pos)) {
            pos += 3
            val body = parseDisjunction()
            closeGroup()
            return body
        }
        if (p.startsWith("(?<", pos)) {
            pos += 3
            val name = parseGroupName()
            val index = ++groupCount
            for (other in names) if (other.name == name && !differentAlternatives(other.path, path)) error("Duplicate capture group name")
            names.add(NamedGroup(name, index, path.map { it.copyOf() }))
            val body = parseDisjunction()
            closeGroup()
            return RGroup(index, body)
        }
        if (p.startsWith("(?", pos)) return parseModifiers()
        pos++
        val index = ++groupCount
        val body = parseDisjunction()
        closeGroup()
        return RGroup(index, body)
    }

    private fun differentAlternatives(a: List<IntArray>, b: List<IntArray>): Boolean {
        var k = 0
        while (k < a.size && k < b.size && a[k][0] == b[k][0]) {
            if (a[k][1] != b[k][1]) return true
            k++
        }
        return false
    }

    /** `(?ims-ims:…)`. */
    private fun parseModifiers(): RNode {
        pos += 2
        val add = StringBuilder()
        val remove = StringBuilder()
        var dash = false
        while (true) {
            if (pos >= p.length) error("Invalid group")
            val c = p[pos]
            when {
                c == 'i' || c == 'm' || c == 's' -> {
                    if (c in add || c in remove) error("Repeated flag in flag group")
                    (if (dash) remove else add).append(c)
                    pos++
                }
                c == '-' -> {
                    if (dash) error("Multiple dashes in flag group")
                    dash = true
                    pos++
                }
                c == ':' -> { pos++; break }
                else -> error("Invalid group")
            }
        }
        if (dash && add.isEmpty() && remove.isEmpty()) error("Invalid flag group")
        val saved = booleanArrayOf(ignoreCase, multiline, dotAll)
        if ('i' in add) ignoreCase = true
        if ('m' in add) multiline = true
        if ('s' in add) dotAll = true
        if ('i' in remove) ignoreCase = false
        if ('m' in remove) multiline = false
        if ('s' in remove) dotAll = false
        val body = parseDisjunction()
        closeGroup()
        ignoreCase = saved[0]; multiline = saved[1]; dotAll = saved[2]
        return body
    }

    /** A RegExpIdentifierName and its closing `>`. */
    private fun parseGroupName(): String {
        val out = StringBuilder()
        while (true) {
            if (pos >= p.length) error("Invalid capture group name")
            var cp = p.codePointAt(pos)
            if (cp == '>'.code) {
                pos++
                break
            }
            if (cp == '\\'.code) {
                pos++
                if (pos >= p.length || p[pos] != 'u') error("Invalid capture group name")
                pos++
                cp = parseUnicodeEscapeBody(true) ?: error("Invalid capture group name")
            } else pos += Character.charCount(cp)
            val valid = if (out.isEmpty()) cp == '$'.code || cp == '_'.code || Character.isUnicodeIdentifierStart(cp)
            else cp == '$'.code || cp == 0x200C || cp == 0x200D || (Character.isUnicodeIdentifierPart(cp) && !Character.isIdentifierIgnorable(cp))
            if (!valid) error("Invalid capture group name")
            out.appendCodePoint(cp)
        }
        if (out.isEmpty()) error("Invalid capture group name")
        return out.toString()
    }

    /** After `\u`: `XXXX` (a surrogate pair `\uXXXX\uXXXX` in unicode mode) or `{X…}` in unicode mode; null if malformed. */
    private fun parseUnicodeEscapeBody(unicode: Boolean): Int? {
        if (unicode && pos < p.length && p[pos] == '{') {
            var i = pos + 1
            var v = 0L
            while (i < p.length && isHexDigit(p[i])) {
                v = v * 16 + Character.digit(p[i], 16)
                if (v > 0x10FFFF) return null
                i++
            }
            if (i == pos + 1 || i >= p.length || p[i] != '}') return null
            pos = i + 1
            return v.toInt()
        }
        val lead = hex4(pos) ?: return null
        pos += 4
        if (unicode && lead in 0xD800..0xDBFF && p.startsWith("\\u", pos)) {
            val trail = hex4(pos + 2)
            if (trail != null && trail in 0xDC00..0xDFFF) {
                pos += 6
                return Character.toCodePoint(lead.toChar(), trail.toChar())
            }
        }
        return lead
    }

    private fun hex4(at: Int): Int? {
        if (at + 4 > p.length) return null
        var v = 0
        for (i in at until at + 4) {
            if (!isHexDigit(p[i])) return null
            v = v * 16 + Character.digit(p[i], 16)
        }
        return v
    }

    /** `\0`…`\377` outside unicode mode. */
    private fun parseLegacyOctal(): Int {
        var v = p[pos] - '0'
        pos++
        if (pos < p.length && p[pos] in '0'..'7') {
            v = v * 8 + (p[pos] - '0')
            pos++
            if (v < 32 && pos < p.length && p[pos] in '0'..'7') {
                v = v * 8 + (p[pos] - '0')
                pos++
            }
        }
        return v
    }

    private fun classEscapeSet(c: Char): RSet? {
        val extras = unicodeMode && ignoreCase
        return when (c) {
            'd' -> RSet().add(0x30, 0x39)
            'D' -> RSet().add { !isDecimalDigit(it) }
            's' -> RSet().add { isJSWhitespace(it) }
            'S' -> RSet().add { !isJSWhitespace(it) }
            'w' -> RSet().add { isBasicWordChar(it) || (extras && (it == 0x17F || it == 0x212A)) }
            'W' -> RSet().add { !(isBasicWordChar(it) || (extras && (it == 0x17F || it == 0x212A))) }
            else -> null
        }
    }

    /** `\p{…}` / `\P{…}` after the `p` or `P`. */
    private fun parseProperty(negated: Boolean): RSet {
        pos++
        if (pos >= p.length || p[pos] != '{') error("Invalid property name")
        val close = p.indexOf('}', pos)
        if (close < 0) error("Invalid property name")
        val text = p.substring(pos + 1, close)
        pos = close + 1
        val test = UnicodeProperties.lookup(text) ?: error("Invalid property name")
        return RSet().add(if (negated) { cp -> !test(cp) } else test)
    }

    private fun parseAtomEscape(): RNode {
        pos++
        if (pos >= p.length) error("\\ at end of pattern")
        val c = p[pos]
        classEscapeSet(c)?.let { pos++; return RClass(it, false, ignoreCase) }
        when (c) {
            in '1'..'9' -> {
                val start = pos
                var n = 0L
                while (pos < p.length && p[pos] in '0'..'9') { n = minOf(n * 10 + (p[pos] - '0'), INFINITE.toLong()); pos++ }
                if (n <= totalGroups) return RBackReference(intArrayOf(n.toInt()), ignoreCase)
                if (unicodeMode) error("Invalid escape")
                pos = start
                if (c >= '8') { pos++; return RChar(c.code, ignoreCase) }
                return RChar(parseLegacyOctal(), ignoreCase)
            }
            '0' -> {
                if (pos + 1 < p.length && p[pos + 1] in '0'..'9') {
                    if (unicodeMode) error("Invalid decimal escape")
                    return RChar(parseLegacyOctal(), ignoreCase)
                }
                pos++
                return RChar(0, ignoreCase)
            }
            'k' -> if (unicodeMode || hasNamedGroups) {
                pos++
                if (pos >= p.length || p[pos] != '<') error("Invalid named reference")
                pos++
                val ref = RBackReference(IntArray(0), ignoreCase)
                namedReferences.add(Pair(parseGroupName(), ref))
                return ref
            }
            'p', 'P' -> if (unicodeMode) return RClass(parseProperty(c == 'P'), false, ignoreCase)
        }
        return RChar(parseCharacterEscape(false), ignoreCase)
    }

    /**
     * CharacterEscape at `pos` (just after the backslash): control escapes, `\cX`, `\xHH`, `\u…`,
     * and identity escapes. Outside unicode mode a malformed `\c` leaves the backslash as a
     * literal and `c` to be read next.
     */
    private fun parseCharacterEscape(inClass: Boolean): Int {
        val c = p[pos]
        when (c) {
            'f' -> { pos++; return 0x0C }
            'n' -> { pos++; return 0x0A }
            'r' -> { pos++; return 0x0D }
            't' -> { pos++; return 0x09 }
            'v' -> { pos++; return 0x0B }
            'c' -> {
                if (pos + 1 < p.length && (p[pos + 1] in 'a'..'z' || p[pos + 1] in 'A'..'Z' || (inClass && !unicodeMode && (p[pos + 1] in '0'..'9' || p[pos + 1] == '_')))) {
                    pos += 2
                    return p[pos - 1].code % 32
                }
                if (unicodeMode) error("Invalid Unicode escape")
                return '\\'.code
            }
            'x' -> {
                if (pos + 2 < p.length && isHexDigit(p[pos + 1]) && isHexDigit(p[pos + 2])) {
                    pos += 3
                    return Character.digit(p[pos - 2], 16) * 16 + Character.digit(p[pos - 1], 16)
                }
                if (unicodeMode) error("Invalid escape")
                pos++
                return 'x'.code
            }
            'u' -> {
                pos++
                val start = pos
                parseUnicodeEscapeBody(unicodeMode)?.let { return it }
                if (unicodeMode) error("Invalid Unicode escape")
                pos = start
                return 'u'.code
            }
        }
        if (unicodeMode) {
            if ("^$\\.*+?()[]{}|/".indexOf(c) >= 0 || (inClass && c == '-')) { pos++; return c.code }
            error("Invalid escape")
        }
        val cp = peekCodePoint()
        pos += Character.charCount(cp)
        return cp
    }

    private class ClassAtom(val cp: Int, val set: RSet?)

    private fun parseClassAtom(): ClassAtom {
        val c = p[pos]
        if (c != '\\') {
            val cp = peekCodePoint()
            pos += Character.charCount(cp)
            return ClassAtom(cp, null)
        }
        pos++
        if (pos >= p.length) error("\\ at end of pattern")
        val e = p[pos]
        classEscapeSet(e)?.let { pos++; return ClassAtom(-1, it) }
        when (e) {
            'b' -> { pos++; return ClassAtom(8, null) }
            '-' -> { pos++; return ClassAtom('-'.code, null) }
            'p', 'P' -> if (unicodeMode) return ClassAtom(-1, parseProperty(e == 'P'))
            in '0'..'9' -> {
                if (unicodeMode) {
                    if (e == '0' && !(pos + 1 < p.length && p[pos + 1] in '0'..'9')) { pos++; return ClassAtom(0, null) }
                    error("Invalid decimal escape")
                }
                if (e >= '8') { pos++; return ClassAtom(e.code, null) }
                return ClassAtom(parseLegacyOctal(), null)
            }
            'k', 'B' -> if (unicodeMode) error("Invalid escape")
        }
        return ClassAtom(parseCharacterEscape(true), null)
    }

    private fun parseClass(): RNode {
        pos++
        var negated = false
        if (pos < p.length && p[pos] == '^') { negated = true; pos++ }
        val set = RSet()
        while (true) {
            if (pos >= p.length) error("Unterminated character class")
            if (p[pos] == ']') { pos++; break }
            val a = parseClassAtom()
            if (pos + 1 < p.length && p[pos] == '-' && p[pos + 1] != ']') {
                pos++
                val b = parseClassAtom()
                if (a.set != null || b.set != null) {
                    if (unicodeMode) error("Invalid character class")
                    addAtom(set, a)
                    set.add('-'.code)
                    addAtom(set, b)
                } else {
                    if (a.cp > b.cp) error("Range out of order in character class")
                    set.add(a.cp, b.cp)
                }
            } else addAtom(set, a)
        }
        return RClass(set, negated, ignoreCase)
    }

    private fun addAtom(set: RSet, a: ClassAtom) {
        if (a.set != null) set.addAll(a.set) else set.add(a.cp)
    }

    // `v` mode classes (ClassSetExpression): nesting, `&&`, `--` and `\q{…}` strings. Under `i`
    // every leaf set is closed over case equivalents before the set operations combine them.

    private fun leaf(set: RSet): (Int) -> Boolean {
        if (!ignoreCase) return set::contains
        return { c -> caseClosedContains(set, c, true) }
    }

    private fun at(text: String): Boolean = p.startsWith(text, pos)

    private fun parseSetClass(): RNode {
        pos++
        val set = parseSetContents()
        val chars = RClass(RSet().add(set.test), false, false)
        if (set.strings.isEmpty()) return chars
        val alternatives = ArrayList<RNode>()
        for (s in set.strings.filter { it.isNotEmpty() }.sortedByDescending { it.codePointCount(0, it.length) }) {
            alternatives.add(RSeq(s.codePoints().toArray().map { RChar(it, ignoreCase) }))
        }
        alternatives.add(chars)
        if ("" in set.strings) alternatives.add(RSeq(emptyList()))
        return RAlt(alternatives)
    }

    /** After `[`: the contents, the closing `]`, and the complement for `[^…]`. */
    private fun parseSetContents(): SetClass {
        val negated = pos < p.length && p[pos] == '^'
        if (negated) pos++
        val set = parseSetExpression()
        if (!negated) return set
        if (set.strings.isNotEmpty()) error("Negated character class may contain strings")
        val test = set.test
        return SetClass({ c -> !test(c) }, emptySet())
    }

    private fun operandSet(o: SetOperand): SetClass = o.set ?: SetClass(leaf(RSet().add(o.cp)), emptySet())

    private fun parseSetExpression(): SetClass {
        if (pos >= p.length) error("Unterminated character class")
        if (p[pos] == ']') { pos++; return SetClass({ false }, emptySet()) }
        val first = parseSetOperand()
        if (at("&&") || at("--")) {
            val intersect = at("&&")
            var test = operandSet(first).test
            var strings = operandSet(first).strings
            while (true) {
                if (pos >= p.length) error("Unterminated character class")
                if (p[pos] == ']') { pos++; break }
                if (!at(if (intersect) "&&" else "--")) error("Invalid set operation in character class")
                pos += 2
                if (intersect && pos < p.length && p[pos] == '&') error("Invalid character in character class")
                val next = operandSet(parseSetOperand())
                val a = test
                val b = next.test
                if (intersect) {
                    test = { c -> a(c) && b(c) }
                    strings = strings.intersect(next.strings)
                } else {
                    test = { c -> a(c) && !b(c) }
                    strings = strings - next.strings
                }
            }
            return SetClass(test, strings)
        }
        val singles = RSet()
        val tests = ArrayList<(Int) -> Boolean>()
        val strings = HashSet<String>()
        var operand = first
        while (true) {
            if (pos < p.length && p[pos] == '-' && !at("--")) {
                pos++
                val end = parseSetOperand()
                if (operand.set != null || end.set != null) error("Invalid character class")
                if (operand.cp > end.cp) error("Range out of order in character class")
                singles.add(operand.cp, end.cp)
            } else if (operand.set != null) {
                tests.add(operand.set.test)
                strings.addAll(operand.set.strings)
            } else singles.add(operand.cp)
            if (pos >= p.length) error("Unterminated character class")
            if (p[pos] == ']') { pos++; break }
            if (at("&&") || at("--")) error("Invalid set operation in character class")
            operand = parseSetOperand()
        }
        val single = leaf(singles)
        return SetClass({ c -> single(c) || tests.any { it(c) } }, strings)
    }

    private fun parseSetOperand(): SetOperand {
        if (pos >= p.length) error("Unterminated character class")
        val c = p[pos]
        if (c == '[') {
            pos++
            return SetOperand(-1, parseSetContents())
        }
        if (c == '\\') {
            pos++
            if (pos >= p.length) error("\\ at end of pattern")
            val e = p[pos]
            classEscapeSet(e)?.let { pos++; return SetOperand(-1, SetClass(leaf(it), emptySet())) }
            if (e == 'p' || e == 'P') return SetOperand(-1, SetClass(leaf(parseProperty(e == 'P')), emptySet()))
            if (e == 'q') return SetOperand(-1, parseStringDisjunction())
            return SetOperand(parseSetCharacterEscape(), null)
        }
        return SetOperand(parseSetCharacter(), null)
    }

    /** A ClassSetCharacter that is not an escape. */
    private fun parseSetCharacter(): Int {
        val c = p[pos]
        if ("()[]{}/-|".indexOf(c) >= 0) error("Invalid character in character class")
        if ("&!#$%*+,.:;<=>?@^`~".indexOf(c) >= 0 && pos + 1 < p.length && p[pos + 1] == c) error("Invalid set operation in character class")
        val cp = p.codePointAt(pos)
        pos += Character.charCount(cp)
        return cp
    }

    /** After the backslash of an escaped ClassSetCharacter. */
    private fun parseSetCharacterEscape(): Int {
        val e = p[pos]
        if (e == 'b') { pos++; return 8 }
        if ("&-!#%,:;<=>@`~".indexOf(e) >= 0) { pos++; return e.code }
        if (e in '0'..'9') {
            if (e == '0' && !(pos + 1 < p.length && p[pos + 1] in '0'..'9')) { pos++; return 0 }
            error("Invalid decimal escape")
        }
        return parseCharacterEscape(true)
    }

    /** `\q{a|bc|…}` after the backslash. */
    private fun parseStringDisjunction(): SetClass {
        pos++
        if (pos >= p.length || p[pos] != '{') error("Invalid escape")
        pos++
        val singles = RSet()
        val strings = HashSet<String>()
        val current = StringBuilder()
        fun finish() {
            val s = current.toString()
            if (s.isNotEmpty() && s.codePointCount(0, s.length) == 1) singles.add(s.codePointAt(0)) else strings.add(s)
            current.setLength(0)
        }
        while (true) {
            if (pos >= p.length) error("Unterminated character class")
            when (p[pos]) {
                '}' -> { pos++; finish(); break }
                '|' -> { pos++; finish() }
                '\\' -> {
                    pos++
                    if (pos >= p.length) error("\\ at end of pattern")
                    current.appendCodePoint(parseSetCharacterEscape())
                }
                else -> current.appendCodePoint(parseSetCharacter())
            }
        }
        return SetClass(leaf(singles), strings)
    }
}

/** `\p{…}` names: General_Category values, binary properties, and Script / Script_Extensions values. */
private object UnicodeProperties {
    private fun types(vararg t: Int): (Int) -> Boolean = { cp -> Character.getType(cp) in t }

    private val categories: Map<String, (Int) -> Boolean> = HashMap<String, (Int) -> Boolean>().apply {
        fun def(test: (Int) -> Boolean, vararg names: String) { for (n in names) put(n, test) }
        val lu = Character.UPPERCASE_LETTER.toInt(); val ll = Character.LOWERCASE_LETTER.toInt(); val lt = Character.TITLECASE_LETTER.toInt()
        val lm = Character.MODIFIER_LETTER.toInt(); val lo = Character.OTHER_LETTER.toInt()
        val mn = Character.NON_SPACING_MARK.toInt(); val mc = Character.COMBINING_SPACING_MARK.toInt(); val me = Character.ENCLOSING_MARK.toInt()
        val nd = Character.DECIMAL_DIGIT_NUMBER.toInt(); val nl = Character.LETTER_NUMBER.toInt(); val no = Character.OTHER_NUMBER.toInt()
        val pc = Character.CONNECTOR_PUNCTUATION.toInt(); val pd = Character.DASH_PUNCTUATION.toInt(); val ps = Character.START_PUNCTUATION.toInt()
        val pe = Character.END_PUNCTUATION.toInt(); val pi = Character.INITIAL_QUOTE_PUNCTUATION.toInt(); val pf = Character.FINAL_QUOTE_PUNCTUATION.toInt()
        val po = Character.OTHER_PUNCTUATION.toInt()
        val sm = Character.MATH_SYMBOL.toInt(); val sc = Character.CURRENCY_SYMBOL.toInt(); val sk = Character.MODIFIER_SYMBOL.toInt(); val so = Character.OTHER_SYMBOL.toInt()
        val zs = Character.SPACE_SEPARATOR.toInt(); val zl = Character.LINE_SEPARATOR.toInt(); val zp = Character.PARAGRAPH_SEPARATOR.toInt()
        val cc = Character.CONTROL.toInt(); val cf = Character.FORMAT.toInt(); val cs = Character.SURROGATE.toInt()
        val co = Character.PRIVATE_USE.toInt(); val cn = Character.UNASSIGNED.toInt()
        def(types(lu, ll, lt, lm, lo), "L", "Letter")
        def(types(lu, ll, lt), "LC", "Cased_Letter")
        def(types(lu), "Lu", "Uppercase_Letter")
        def(types(ll), "Ll", "Lowercase_Letter")
        def(types(lt), "Lt", "Titlecase_Letter")
        def(types(lm), "Lm", "Modifier_Letter")
        def(types(lo), "Lo", "Other_Letter")
        def(types(mn, mc, me), "M", "Mark", "Combining_Mark")
        def(types(mn), "Mn", "Nonspacing_Mark")
        def(types(mc), "Mc", "Spacing_Mark")
        def(types(me), "Me", "Enclosing_Mark")
        def(types(nd, nl, no), "N", "Number")
        def(types(nd), "Nd", "Decimal_Number", "digit")
        def(types(nl), "Nl", "Letter_Number")
        def(types(no), "No", "Other_Number")
        def(types(pc, pd, ps, pe, pi, pf, po), "P", "Punctuation", "punct")
        def(types(pc), "Pc", "Connector_Punctuation")
        def(types(pd), "Pd", "Dash_Punctuation")
        def(types(ps), "Ps", "Open_Punctuation")
        def(types(pe), "Pe", "Close_Punctuation")
        def(types(pi), "Pi", "Initial_Punctuation")
        def(types(pf), "Pf", "Final_Punctuation")
        def(types(po), "Po", "Other_Punctuation")
        def(types(sm, sc, sk, so), "S", "Symbol")
        def(types(sm), "Sm", "Math_Symbol")
        def(types(sc), "Sc", "Currency_Symbol")
        def(types(sk), "Sk", "Modifier_Symbol")
        def(types(so), "So", "Other_Symbol")
        def(types(zs, zl, zp), "Z", "Separator")
        def(types(zs), "Zs", "Space_Separator")
        def(types(zl), "Zl", "Line_Separator")
        def(types(zp), "Zp", "Paragraph_Separator")
        def(types(cc, cf, cs, co, cn), "C", "Other")
        def(types(cc), "Cc", "Control", "cntrl")
        def(types(cf), "Cf", "Format")
        def(types(cs), "Cs", "Surrogate")
        def(types(co), "Co", "Private_Use")
        def(types(cn), "Cn", "Unassigned")
    }

    /** Extended_Pictographic as of Unicode 15. */
    private val pictographic = intArrayOf(
        0xA9, 0xA9, 0xAE, 0xAE, 0x203C, 0x203C, 0x2049, 0x2049, 0x2122, 0x2122, 0x2139, 0x2139, 0x2194, 0x2199, 0x21A9, 0x21AA,
        0x231A, 0x231B, 0x2328, 0x2328, 0x2388, 0x2388, 0x23CF, 0x23CF, 0x23E9, 0x23F3, 0x23F8, 0x23FA, 0x24C2, 0x24C2,
        0x25AA, 0x25AB, 0x25B6, 0x25B6, 0x25C0, 0x25C0, 0x25FB, 0x25FE, 0x2600, 0x2605, 0x2607, 0x2612, 0x2614, 0x2685,
        0x2690, 0x2705, 0x2708, 0x2712, 0x2714, 0x2714, 0x2716, 0x2716, 0x271D, 0x271D, 0x2721, 0x2721, 0x2728, 0x2728,
        0x2733, 0x2734, 0x2744, 0x2744, 0x2747, 0x2747, 0x274C, 0x274C, 0x274E, 0x274E, 0x2753, 0x2755, 0x2757, 0x2757,
        0x2763, 0x2767, 0x2795, 0x2797, 0x27A1, 0x27A1, 0x27B0, 0x27B0, 0x27BF, 0x27BF, 0x2934, 0x2935, 0x2B05, 0x2B07,
        0x2B1B, 0x2B1C, 0x2B50, 0x2B50, 0x2B55, 0x2B55, 0x3030, 0x3030, 0x303D, 0x303D, 0x3297, 0x3297, 0x3299, 0x3299,
        0x1F000, 0x1F0FF, 0x1F10D, 0x1F10F, 0x1F12F, 0x1F12F, 0x1F16C, 0x1F171, 0x1F17E, 0x1F17F, 0x1F18E, 0x1F18E,
        0x1F191, 0x1F19A, 0x1F1AD, 0x1F1E5, 0x1F201, 0x1F20F, 0x1F21A, 0x1F21A, 0x1F22F, 0x1F22F, 0x1F232, 0x1F23A,
        0x1F23C, 0x1F23F, 0x1F249, 0x1F3FA, 0x1F400, 0x1F53D, 0x1F546, 0x1F64F, 0x1F680, 0x1F6FF, 0x1F774, 0x1F77F,
        0x1F7D5, 0x1F7FF, 0x1F80C, 0x1F80F, 0x1F848, 0x1F84F, 0x1F85A, 0x1F85F, 0x1F888, 0x1F88F, 0x1F8AE, 0x1F8FF,
        0x1F90C, 0x1F93A, 0x1F93C, 0x1F945, 0x1F947, 0x1FAFF, 0x1FC00, 0x1FFFD,
    )

    /** Emoji_Presentation as of Unicode 15. */
    private val emojiPresentation = intArrayOf(
        0x231A, 0x231B, 0x23E9, 0x23EC, 0x23F0, 0x23F0, 0x23F3, 0x23F3, 0x25FD, 0x25FE, 0x2614, 0x2615, 0x2648, 0x2653,
        0x267F, 0x267F, 0x2693, 0x2693, 0x26A1, 0x26A1, 0x26AA, 0x26AB, 0x26BD, 0x26BE, 0x26C4, 0x26C5, 0x26CE, 0x26CE,
        0x26D4, 0x26D4, 0x26EA, 0x26EA, 0x26F2, 0x26F3, 0x26F5, 0x26F5, 0x26FA, 0x26FA, 0x26FD, 0x26FD, 0x2705, 0x2705,
        0x270A, 0x270B, 0x2728, 0x2728, 0x274C, 0x274C, 0x274E, 0x274E, 0x2753, 0x2755, 0x2757, 0x2757, 0x2795, 0x2797,
        0x27B0, 0x27B0, 0x27BF, 0x27BF, 0x2B1B, 0x2B1C, 0x2B50, 0x2B50, 0x2B55, 0x2B55, 0x1F004, 0x1F004, 0x1F0CF, 0x1F0CF,
        0x1F18E, 0x1F18E, 0x1F191, 0x1F19A, 0x1F1E6, 0x1F1FF, 0x1F201, 0x1F201, 0x1F21A, 0x1F21A, 0x1F22F, 0x1F22F,
        0x1F232, 0x1F236, 0x1F238, 0x1F23A, 0x1F250, 0x1F251, 0x1F300, 0x1F320, 0x1F32D, 0x1F335, 0x1F337, 0x1F37C,
        0x1F37E, 0x1F393, 0x1F3A0, 0x1F3CA, 0x1F3CF, 0x1F3D3, 0x1F3E0, 0x1F3F0, 0x1F3F4, 0x1F3F4, 0x1F3F8, 0x1F43E,
        0x1F440, 0x1F440, 0x1F442, 0x1F4FC, 0x1F4FF, 0x1F53D, 0x1F54B, 0x1F54E, 0x1F550, 0x1F567, 0x1F57A, 0x1F57A,
        0x1F595, 0x1F596, 0x1F5A4, 0x1F5A4, 0x1F5FB, 0x1F64F, 0x1F680, 0x1F6C5, 0x1F6CC, 0x1F6CC, 0x1F6D0, 0x1F6D2,
        0x1F6D5, 0x1F6D7, 0x1F6DC, 0x1F6DF, 0x1F6EB, 0x1F6EC, 0x1F6F4, 0x1F6FC, 0x1F7E0, 0x1F7EB, 0x1F7F0, 0x1F7F0,
        0x1F90C, 0x1F93A, 0x1F93C, 0x1F945, 0x1F947, 0x1F9FF, 0x1FA70, 0x1FA7C, 0x1FA80, 0x1FA89, 0x1FA8F, 0x1FAC6,
        0x1FACE, 0x1FADC, 0x1FADF, 0x1FAE9, 0x1FAF0, 0x1FAF8,
    )

    private fun inRanges(ranges: IntArray, cp: Int): Boolean {
        var i = 0
        while (i < ranges.size) {
            if (cp < ranges[i]) return false
            if (cp <= ranges[i + 1]) return true
            i += 2
        }
        return false
    }

    private fun isPictographic(cp: Int) = inRanges(pictographic, cp)

    private val binary: Map<String, (Int) -> Boolean> = HashMap<String, (Int) -> Boolean>().apply {
        fun def(test: (Int) -> Boolean, vararg names: String) { for (n in names) put(n, test) }
        def({ true }, "Any")
        def({ it < 0x80 }, "ASCII")
        def({ Character.getType(it) != Character.UNASSIGNED.toInt() }, "Assigned")
        def({ Character.isAlphabetic(it) }, "Alphabetic", "Alpha")
        def({ Character.isLowerCase(it) }, "Lowercase", "Lower")
        def({ Character.isUpperCase(it) }, "Uppercase", "Upper")
        def({ it in 0x9..0xD || it == 0x20 || it == 0x85 || it == 0xA0 || it == 0x1680 || it in 0x2000..0x200A || it == 0x2028 || it == 0x2029 || it == 0x202F || it == 0x205F || it == 0x3000 }, "White_Space", "space")
        def({ Character.isUnicodeIdentifierStart(it) }, "ID_Start", "IDS")
        def({ Character.isUnicodeIdentifierPart(it) && !Character.isIdentifierIgnorable(it) }, "ID_Continue", "IDC")
        def({ Character.isIdeographic(it) }, "Ideographic", "Ideo")
        def({ it in 0x30..0x39 || it in 0x41..0x46 || it in 0x61..0x66 }, "ASCII_Hex_Digit", "AHex")
        def({ it in 0x30..0x39 || it in 0x41..0x46 || it in 0x61..0x66 || it in 0xFF10..0xFF19 || it in 0xFF21..0xFF26 || it in 0xFF41..0xFF46 }, "Hex_Digit", "Hex")
        def({ Character.isMirrored(it) }, "Bidi_Mirrored", "Bidi_M")
        def(::isPictographic, "Extended_Pictographic", "ExtPict")
        def({ (isPictographic(it) && Character.getType(it) != Character.UNASSIGNED.toInt()) || it == 0x23 || it == 0x2A || it in 0x30..0x39 || it in 0x1F1E6..0x1F1FF || it in 0x1F3FB..0x1F3FF }, "Emoji")
        def({ inRanges(emojiPresentation, it) }, "Emoji_Presentation", "EPres")
        def({ it in 0x1F3FB..0x1F3FF }, "Emoji_Modifier", "EMod")
        def({ it in 0x1F1E6..0x1F1FF }, "Regional_Indicator", "RI")
        def({ Character.getType(it) == Character.NON_SPACING_MARK.toInt() || Character.getType(it) == Character.ENCLOSING_MARK.toInt() || Character.getType(it) == Character.FORMAT.toInt() || it == 0xAD }, "Case_Ignorable", "CI")
        def({ Character.isLowerCase(it) || Character.isUpperCase(it) || Character.isTitleCase(it) }, "Cased")
        def({ Character.getType(it) == Character.CONTROL.toInt() || (Character.getType(it) == Character.FORMAT.toInt()) || Character.isIdentifierIgnorable(it) && it > 0x7F }, "Default_Ignorable_Code_Point", "DI")
    }

    private fun script(name: String): ((Int) -> Boolean)? {
        if (name.isEmpty() || !name[0].isUpperCase()) return null
        val script = try { Character.UnicodeScript.forName(name) } catch (e: IllegalArgumentException) { return null }
        val canonical = script.name.split('_').joinToString("_") { part -> part.lowercase().replaceFirstChar { it.uppercase() } }
        if (name != canonical && name.length != 4) return null
        return { cp -> Character.UnicodeScript.of(cp) == script }
    }

    fun lookup(text: String): ((Int) -> Boolean)? {
        val eq = text.indexOf('=')
        if (eq < 0) return categories[text] ?: binary[text]
        val key = text.substring(0, eq)
        val value = text.substring(eq + 1)
        return when (key) {
            "General_Category", "gc" -> categories[value]
            "Script", "sc", "Script_Extensions", "scx" -> script(value)
            else -> null
        }
    }
}

// Matching

private fun interface Continuation {
    fun run(x: Int): Boolean
}

/** One match attempt: the input, the capture slots (start and end per group, -1 when unset). */
private class RegexRun(val input: String, val captures: IntArray, val unicode: Boolean)

private abstract class Matcher {
    abstract fun match(r: RegexRun, x: Int, k: Continuation): Boolean
}

/** One character satisfying `test`, read forward or (in a lookbehind) backward. */
private class CharMatcher(val test: (Int) -> Boolean, val forward: Boolean) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        val next = step(r, x)
        return next >= 0 && k.run(next)
    }

    /** Where the character at `x` ends if it passes, else -1. */
    fun step(r: RegexRun, x: Int): Int {
        val s = r.input
        if (forward) {
            if (x >= s.length) return -1
            val c = s[x]
            if (r.unicode && Character.isHighSurrogate(c) && x + 1 < s.length && Character.isLowSurrogate(s[x + 1])) {
                return if (test(Character.toCodePoint(c, s[x + 1]))) x + 2 else -1
            }
            return if (test(c.code)) x + 1 else -1
        }
        if (x <= 0) return -1
        val c = s[x - 1]
        if (r.unicode && Character.isLowSurrogate(c) && x >= 2 && Character.isHighSurrogate(s[x - 2])) {
            return if (test(Character.toCodePoint(s[x - 2], c))) x - 2 else -1
        }
        return if (test(c.code)) x - 1 else -1
    }
}

/** A run of literal characters compared case-sensitively, forward. */
private class LiteralMatcher(val text: String) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean =
        r.input.startsWith(text, x) && k.run(x + text.length)
}

private class SequenceMatcher(val items: Array<Matcher>) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean = step(r, 0, x, k)

    private fun step(r: RegexRun, i: Int, x: Int, k: Continuation): Boolean {
        if (i == items.size) return k.run(x)
        if (i == items.size - 1) return items[i].match(r, x, k)
        return items[i].match(r, x) { y -> step(r, i + 1, y, k) }
    }
}

private class AlternationMatcher(val alternatives: Array<Matcher>) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        for (a in alternatives) if (a.match(r, x, k)) return true
        return false
    }
}

private class AssertionMatcher(val kind: Char, val multiline: Boolean, val wordExtras: Boolean) : Matcher() {
    private fun isWord(s: String, i: Int): Boolean {
        if (i < 0 || i >= s.length) return false
        val c = s[i].code
        return isBasicWordChar(c) || (wordExtras && (c == 0x17F || c == 0x212A))
    }

    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        val s = r.input
        val ok = when (kind) {
            '^' -> x == 0 || (multiline && isLineTerminator(s[x - 1].code))
            '$' -> x == s.length || (multiline && isLineTerminator(s[x].code))
            'b' -> isWord(s, x - 1) != isWord(s, x)
            else -> isWord(s, x - 1) == isWord(s, x)
        }
        return ok && k.run(x)
    }
}

private class GroupMatcher(val index: Int, val body: Matcher, val forward: Boolean) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean = body.match(r, x) { y ->
        val caps = r.captures
        val oldStart = caps[2 * index]
        val oldEnd = caps[2 * index + 1]
        if (forward) { caps[2 * index] = x; caps[2 * index + 1] = y } else { caps[2 * index] = y; caps[2 * index + 1] = x }
        if (k.run(y)) true else {
            caps[2 * index] = oldStart
            caps[2 * index + 1] = oldEnd
            false
        }
    }
}

/** Lookahead and lookbehind: atomic; a negative one leaves its groups unset. */
private class LookMatcher(val body: Matcher, val negative: Boolean) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        val saved = r.captures.copyOf()
        val found = body.match(r, x) { true }
        if (negative) {
            System.arraycopy(saved, 0, r.captures, 0, saved.size)
            return !found && k.run(x)
        }
        if (!found) return false
        if (k.run(x)) return true
        System.arraycopy(saved, 0, r.captures, 0, saved.size)
        return false
    }
}

/** A backreference: the text its group captured, or nothing when the group did not take part. */
private class BackReferenceMatcher(val node: RBackReference, val forward: Boolean) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        val caps = r.captures
        var start = -1
        var end = -1
        for (g in node.groups) if (caps[2 * g] >= 0) { start = caps[2 * g]; end = caps[2 * g + 1]; break }
        if (start < 0) return k.run(x)
        val s = r.input
        val length = end - start
        val from = if (forward) x else x - length
        if (from < 0 || from + length > s.length) return false
        if (!node.ignoreCase) {
            if (!s.regionMatches(start, s, from, length)) return false
        } else {
            var i = 0
            while (i < length) {
                val a = if (r.unicode) s.codePointAt(start + i) else s[start + i].code
                val b = if (r.unicode) s.codePointAt(from + i) else s[from + i].code
                if (CaseFolding.canonicalize(a, r.unicode) != CaseFolding.canonicalize(b, r.unicode)) return false
                if (Character.charCount(a) != Character.charCount(b)) return false
                i += Character.charCount(a)
            }
        }
        return k.run(if (forward) x + length else from)
    }
}

/** RepeatMatcher (§22.2.2.3.1): groups inside are reset on every iteration; an empty iteration past the minimum fails. */
private class RepeatMatcher(val body: Matcher, val min: Int, val max: Int, val greedy: Boolean, val firstGroup: Int, val groupCount: Int) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean = repeat(r, x, k, min, max)

    private fun repeat(r: RegexRun, x: Int, k: Continuation, min: Int, max: Int): Boolean {
        if (max == 0) return k.run(x)
        val d = Continuation { y ->
            if (min == 0 && y == x) false
            else repeat(r, y, k, if (min == 0) 0 else min - 1, if (max == INFINITE) INFINITE else max - 1)
        }
        if (min == 0 && !greedy && k.run(x)) return true
        val caps = r.captures
        val from = 2 * (firstGroup + 1)
        val to = 2 * (firstGroup + groupCount + 1)
        val saved = if (groupCount > 0) caps.copyOfRange(from, to) else null
        if (saved != null) java.util.Arrays.fill(caps, from, to, -1)
        if (body.match(r, x, d)) return true
        if (saved != null) System.arraycopy(saved, 0, caps, from, saved.size)
        if (min == 0 && greedy) return k.run(x)
        return false
    }
}

/** A quantified single character: iterates instead of recursing, so long runs do not deepen the stack. */
private class CharRepeatMatcher(val char: CharMatcher, val min: Int, val max: Int, val greedy: Boolean) : Matcher() {
    override fun match(r: RegexRun, x: Int, k: Continuation): Boolean {
        if (greedy) {
            var positions = IntArray(16)
            positions[0] = x
            var count = 0
            var at = x
            while (count < max) {
                val next = char.step(r, at)
                if (next < 0) break
                count++
                if (count >= positions.size) positions = positions.copyOf(positions.size * 2)
                positions[count] = next
                at = next
            }
            if (count < min) return false
            for (n in count downTo min) if (k.run(positions[n])) return true
            return false
        }
        var at = x
        var count = 0
        while (true) {
            if (count >= min && k.run(at)) return true
            if (count >= max) return false
            val next = char.step(r, at)
            if (next < 0) return false
            at = next
            count++
        }
    }
}

/** A compiled pattern. */
private class RegexProgram(root: RNode, val groupCount: Int, val groupNames: List<Pair<String, Int>>, val unicode: Boolean) {
    private val matcher: Matcher = compile(root, true)

    /** A code unit every match starts with, when the pattern begins with a case-sensitive literal; else -1. */
    val firstUnit: Int = firstUnitOf(root)

    private fun firstUnitOf(n: RNode): Int = when (n) {
        is RChar -> if (!n.ignoreCase && n.cp <= 0xFFFF && !Character.isSurrogate(n.cp.toChar())) n.cp else -1
        is RSeq -> if (n.items.isEmpty()) -1 else firstUnitOf(n.items[0])
        is RGroup -> firstUnitOf(n.body)
        is RRepeat -> if (n.min > 0) firstUnitOf(n.body) else -1
        else -> -1
    }

    /** The capture slots of a match starting exactly at `start`, or null. */
    fun matchAt(s: String, start: Int): IntArray? = try {
        attempt(s, start)
    } catch (e: StackOverflowError) {
        onLargeStack { attempt(s, start) }
    }

    private fun attempt(s: String, start: Int): IntArray? {
        val captures = IntArray(2 * (groupCount + 1)) { -1 }
        val run = RegexRun(s, captures, unicode)
        val ok = matcher.match(run, start) { end -> captures[0] = start; captures[1] = end; true }
        return if (ok) captures else null
    }

    /**
     * Backtracking recurses once per iteration of a quantified group, so a long input can
     * exhaust a thread's stack; the match is then retried on a thread with a large one.
     */
    private fun onLargeStack(body: () -> IntArray?): IntArray? {
        var result: Result<IntArray?>? = null
        try {
            val thread = Thread(null, { result = runCatching(body) }, "RegExp", 512L shl 20)
            thread.start()
            thread.join()
        } catch (e: OutOfMemoryError) {
            throw JSException(JSRangeError("Maximum call stack size exceeded"))
        }
        return result!!.getOrElse { if (it is StackOverflowError) throw JSException(JSRangeError("Maximum call stack size exceeded")) else throw it }
    }

    private fun charTest(n: RNode): ((Int) -> Boolean)? = when (n) {
        is RChar -> {
            val cp = n.cp
            if (!n.ignoreCase) { c -> c == cp }
            else {
                val canon = CaseFolding.canonicalize(cp, unicode)
                val u = unicode
                ({ c -> c == cp || CaseFolding.canonicalize(c, u) == canon })
            }
        }
        is RClass -> {
            val set = n.set
            val negated = n.negated
            if (!n.ignoreCase) { c -> set.contains(c) != negated }
            else {
                val u = unicode
                ({ c -> caseClosedContains(set, c, u) != negated })
            }
        }
        else -> null
    }

    private fun compile(n: RNode, forward: Boolean): Matcher = when (n) {
        is RChar, is RClass -> CharMatcher(charTest(n)!!, forward)
        is RSeq -> {
            val parts = ArrayList<Matcher>()
            if (forward) {
                var i = 0
                while (i < n.items.size) {
                    val literal = StringBuilder()
                    var j = i
                    while (j < n.items.size) {
                        val item = n.items[j]
                        if (item !is RChar || item.ignoreCase || item.cp > 0xFFFF || Character.isSurrogate(item.cp.toChar())) break
                        literal.append(item.cp.toChar())
                        j++
                    }
                    if (j - i >= 2) {
                        parts.add(LiteralMatcher(literal.toString()))
                        i = j
                    } else {
                        parts.add(compile(n.items[i], true))
                        i++
                    }
                }
            } else for (item in n.items.asReversed()) parts.add(compile(item, false))
            if (parts.size == 1) parts[0] else SequenceMatcher(parts.toTypedArray())
        }
        is RAlt -> AlternationMatcher(n.alternatives.map { compile(it, forward) }.toTypedArray())
        is RAssertion -> AssertionMatcher(n.kind, n.multiline, n.wordExtras)
        is RGroup -> GroupMatcher(n.index, compile(n.body, forward), forward)
        is RLook -> LookMatcher(compile(n.body, n.ahead), n.negative)
        is RBackReference -> BackReferenceMatcher(n, forward)
        is RRepeat -> {
            val body = n.body
            if ((body is RChar || body is RClass) && n.groupCount == 0) CharRepeatMatcher(CharMatcher(charTest(body)!!, forward), n.min, n.max, n.greedy)
            else RepeatMatcher(compile(body, forward), n.min, n.max, n.greedy, n.firstGroup, n.groupCount)
        }
    }
}
