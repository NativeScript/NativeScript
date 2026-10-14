package org.nativescript.kit

// JSON.parse

/**
 * `JSON.parse(text)`: objects become `JSObject` (key order kept), arrays `JSArray<Any?>`, numbers
 * `Double`, `null` `jsNull`. Invalid text throws a SyntaxError with V8's message.
 */
fun jsJSONParse(text: String): Any? = JSONParser(text).parse()

/**
 * `JSON.parse(text, reviver)`: the reviver sees each value after the values inside it, called on its holder with its key;
 * a value it gives undefined for is deleted. A reviver that is not a function is ignored.
 */
fun jsJSONParse(text: String, reviver: Any?): Any? {
    val value = jsJSONParse(text)
    if (!jsIsFunction(reviver)) return value
    val root = JSObject()
    root[""] = value
    return jsJSONInternalize(root, "", reviver)
}

private fun jsJSONInternalize(holder: Any, key: String, reviver: Any?): Any? {
    val value = jsGet(holder, key)
    when (value) {
        is JSArray<*> -> {
            @Suppress("UNCHECKED_CAST") val array = value as JSArray<Any?>
            for (i in 0 until array.size) if (i < array.size) array.setAt(i, jsJSONInternalize(array, i.toString(), reviver))
        }
        is JSObject -> for (k in value.keys) {
            val revived = jsJSONInternalize(value, k, reviver)
            if (revived == null) value.delete(k) else value[k] = revived
        }
    }
    return if (reviver is JSMethod) jsBox(reviver.call(holder, arrayOf(key, value))) else jsCall(reviver, key, value)
}


/** 10^0 … 10^22: every one a double exactly. */
private val EXACT_POWERS_OF_TEN = DoubleArray(23).also { var p = 1.0; for (i in it.indices) { it[i] = p; p *= 10.0 } }

private val EXACT_LONG_POWERS_OF_TEN = LongArray(16).also { var p = 1L; for (i in it.indices) { it[i] = p; p *= 10 } }

/** How many property names a parse remembers, by hash: a name met again is the same String, its hash computed once. */
private const val KEY_CACHE_SIZE = 64

private class JSONParser(val source: String) {
    var position = 0
    private val keys = arrayOfNulls<String>(KEY_CACHE_SIZE)

    private sealed class Container {
        class Array(val array: JSArray<Any?>) : Container()
        class Object(val obj: JSObject, var key: String) : Container()
    }

    fun parse(): Any? {
        if (source == "undefined" || source == "NaN" || source == "Infinity" || source == "[object Object]") {
            throw JSException(JSSyntaxError("\"$source\" is not valid JSON"))
        }
        val stack = ArrayList<Container>()
        var value: Any?
        parseValue@ while (true) {
            skipWhitespace()
            if (position >= source.length) throw unexpected()
            when (source[position]) {
                '"' -> value = scanString()
                '-', in '0'..'9' -> value = scanNumber()
                't' -> { scanLiteral("true"); value = true }
                'f' -> { scanLiteral("false"); value = false }
                'n' -> { scanLiteral("null"); value = JSNull }
                '{' -> {
                    position++
                    skipWhitespace()
                    if (peek() == '}'.code) {
                        position++
                        value = JSObject()
                    } else {
                        val key = scanPropertyKey("Expected property name or '}'")
                        stack.add(Container.Object(JSObject(), key))
                        continue@parseValue
                    }
                }
                '[' -> {
                    position++
                    skipWhitespace()
                    if (peek() == ']'.code) {
                        position++
                        value = JSArray<Any?>()
                    } else {
                        stack.add(Container.Array(JSArray()))
                        continue@parseValue
                    }
                }
                else -> throw unexpected()
            }
            while (stack.isNotEmpty()) {
                val top = stack[stack.size - 1]
                skipWhitespace()
                when (top) {
                    is Container.Array -> {
                        top.array.storage.add(value)
                        if (peek() == ','.code) {
                            position++
                            continue@parseValue
                        }
                        if (peek() != ']'.code) throw unexpected("Expected ',' or ']' after array element")
                        position++
                        stack.removeAt(stack.size - 1)
                        value = top.array
                    }
                    is Container.Object -> {
                        top.obj[top.key] = value
                        if (peek() == ','.code) {
                            position++
                            skipWhitespace()
                            top.key = scanPropertyKey("Expected double-quoted property name")
                            continue@parseValue
                        }
                        if (peek() != '}'.code) throw unexpected("Expected ',' or '}' after property value")
                        position++
                        stack.removeAt(stack.size - 1)
                        value = top.obj
                    }
                }
            }
            skipWhitespace()
            if (position < source.length) throw JSException(JSSyntaxError("Unexpected non-whitespace character after JSON ${location()}"))
            return value
        }
    }

    /** The code unit at the position, -1 at the end. */
    private fun peek(): Int = if (position < source.length) source[position].code else -1

    private fun skipWhitespace() {
        while (position < source.length) {
            when (source[position]) {
                ' ', '\t', '\n', '\r' -> position++
                else -> return
            }
        }
    }

    private fun scanPropertyKey(message: String): String {
        if (peek() != '"'.code) throw unexpected(message)
        val key = scanKey()
        skipWhitespace()
        if (peek() != ':'.code) throw unexpected("Expected ':' after property name")
        position++
        return key
    }

    private fun scanLiteral(literal: String) {
        for (c in literal) {
            if (position >= source.length || source[position] != c) throw unexpected()
            position++
        }
    }

    private fun isDigit(at: Int): Boolean = at < source.length && source[at] in '0'..'9'

    /**
     * A number as `Number(text)` reads it. Up to 15 significant digits and no exponent, the digits as an integer
     * divided by a power of ten is exact (both are doubles exactly, and the division rounds once).
     */
    private fun scanNumber(): Double {
        val start = position
        val negative = source[position] == '-'
        if (negative) {
            position++
            if (!isDigit(position)) throw error("No number after minus sign")
        }
        var mantissa = 0L
        var digits = 0
        if (source[position] == '0') {
            position++
            if (isDigit(position)) throw unexpected()
        } else {
            while (isDigit(position)) {
                mantissa = mantissa * 10 + (source[position] - '0')
                digits++
                position++
            }
        }
        var fraction = 0
        if (peek() == '.'.code) {
            position++
            if (!isDigit(position)) throw error("Unterminated fractional number")
            while (isDigit(position)) {
                mantissa = mantissa * 10 + (source[position] - '0')
                digits++
                fraction++
                position++
            }
        }
        if (peek() == 'e'.code || peek() == 'E'.code) {
            position++
            if (peek() == '+'.code || peek() == '-'.code) position++
            if (!isDigit(position)) throw error("Exponent part is missing a number")
            while (isDigit(position)) position++
            return source.substring(start, position).toDouble()
        }
        if (digits > 15) return source.substring(start, position).toDouble()
        val magnitude = if (fraction == 0) mantissa.toDouble() else mantissa / EXACT_POWERS_OF_TEN[fraction]
        return if (negative) -magnitude else magnitude
    }

    /** A string without escapes is a substring of the text; one with escapes is built. */
    private fun scanString(): String {
        position++
        val start = position
        while (position < source.length) {
            val c = source[position]
            if (c == '"') {
                position++
                return source.substring(start, position - 1)
            }
            if (c == '\\' || c < ' ') break
            position++
        }
        return scanEscapedString(start)
    }

    /** A property name: as scanString, the same String for a name met before (keys). */
    private fun scanKey(): String {
        position++
        val start = position
        var hash = 0
        while (position < source.length) {
            val c = source[position]
            if (c == '"') {
                val length = position - start
                position++
                val slot = (hash xor (hash ushr 16)) and (KEY_CACHE_SIZE - 1)
                val known = keys[slot]
                if (known != null && known.length == length && known.hashCode() == hash && source.regionMatches(start, known, 0, length)) return known
                val key = source.substring(start, start + length)
                keys[slot] = key
                return key
            }
            if (c == '\\' || c < ' ') break
            hash = 31 * hash + c.code
            position++
        }
        return scanEscapedString(start)
    }

    /** The rest of a string from `start` (after its opening quote), where the position is at an escape or a bad character. */
    private fun scanEscapedString(start: Int): String {
        val out = StringBuilder()
        out.append(source, start, position)
        var segmentStart = position
        while (true) {
            if (position >= source.length) throw error("Unterminated string")
            val c = source[position]
            if (c == '"') {
                out.append(source, segmentStart, position)
                position++
                return out.toString()
            }
            if (c < ' ') throw error("Bad control character in string literal")
            if (c != '\\') {
                position++
                continue
            }
            out.append(source, segmentStart, position)
            position++
            if (position >= source.length) throw unexpected()
            when (source[position]) {
                '"' -> out.append('"')
                '\\' -> out.append('\\')
                '/' -> out.append('/')
                'b' -> out.append('\b')
                'f' -> out.append('\u000C')
                'n' -> out.append('\n')
                'r' -> out.append('\r')
                't' -> out.append('\t')
                'u' -> {
                    var code = 0
                    repeat(4) {
                        position++
                        if (position >= source.length) throw error("Bad Unicode escape")
                        val digit = Character.digit(source[position], 16)
                        if (digit < 0) throw error("Bad Unicode escape")
                        code = code * 16 + digit
                    }
                    out.append(code.toChar())
                }
                else -> throw error("Bad escaped character")
            }
            position++
            segmentStart = position
        }
    }

    private fun location(): String {
        var line = 1
        var lineStart = 0
        var i = 0
        while (i < position) {
            if (source[i] == '\r' && i < position - 1 && source[i + 1] == '\n') i++
            if (source[i] == '\r' || source[i] == '\n') {
                line++
                lineStart = i + 1
            }
            i++
        }
        return "at position $position (line $line column ${1 + position - lineStart})"
    }

    private fun error(message: String): JSException = JSException(JSSyntaxError("$message in JSON ${location()}"))

    /**
     * V8's ReportUnexpectedToken: an explicit message wins, then end of input, numbers and
     * strings, then the offending character with some context.
     */
    private fun unexpected(message: String? = null): JSException {
        if (message != null) return error(message)
        if (position >= source.length) return JSException(JSSyntaxError("Unexpected end of JSON input"))
        val c = source[position]
        if (c == '-' || c in '0'..'9') return error("Unexpected number")
        if (c == '"') return error("Unexpected string")
        val context = 10
        val n = source.length
        val text = when {
            n <= 2 * context + 1 -> "\"$source\""
            position < context -> "\"${source.substring(0, position + context)}\"..."
            position < n - context -> "...\"${source.substring(position - context, position + context)}\"..."
            else -> "...\"${source.substring(position - context)}\""
        }
        return JSException(JSSyntaxError("Unexpected token '$c', $text is not valid JSON"))
    }
}

// JSON.stringify

/**
 * `JSON.stringify(value, null, indent)`; null is JavaScript's `undefined` result. `indent` is
 * a number of spaces (at most 10) or a string (its first 10 code units). A cycle throws V8's TypeError.
 */
fun jsJSONStringify(value: Any?, indent: Any? = null, replacer: Any? = null): String? {
    var gap: String? = null
    val i = jsBox(indent)
    if (i is String) {
        if (i.isNotEmpty()) gap = i.substring(0, minOf(10, i.length))
    } else if (i != null) {
        val n = jsNumeric(i)
        // V8 keeps an empty gap for 0 < n < 1: line breaks without indentation.
        if (n != null && n > 0) gap = " ".repeat(minOf(10.0, n).toInt())
    }
    val writer = JSONWriter(gap)
    when (val r = jsBox(replacer)) {
        is JSArray<*> -> writer.allowed = r.storage.mapNotNull { k -> when (val b = jsBox(k)) { is String -> b; is Number -> jsNumberToString(b.toDouble()); else -> null } }.distinct()
        else -> if (jsIsFunction(r)) writer.replacer = r
    }
    // The wrapper a replacer sees as the holder of the top value.
    val holder: Any? = if (writer.replacer != null) JSObject().also { it[""] = value } else null
    return writer.write(holder, value)
}

/** A value with its own `toJSON()`, which JSON.stringify serializes in its place. */
interface JSToJSON {
    fun jsToJSON(key: String): Any?
}

/** SerializeJSONProperty and its kin, writing into one builder. */
private class JSONWriter(val gap: String?) {
    private val out = StringBuilder()
    /** The arrays and objects being written, outermost first, and the key each is written under (for a cycle's message). */
    private val holders = ArrayList<Any>()
    private val holderKeys = ArrayList<String>()
    /** A function replacer, called on each value's holder with its key. */
    var replacer: Any? = null
    /** An array replacer: the object keys kept, in its order. */
    var allowed: List<String>? = null

    fun write(holder: Any?, value: Any?): String? = if (property(holder, "", -1, value, 0)) out.toString() else null

    /**
     * Writes the property `key` of `holder` (element `index` when `key` is null, its name made only where something
     * reads it). False when the value is one JSON leaves out (undefined, a function), with nothing written.
     */
    private fun property(holder: Any?, key: String?, index: Int, value: Any?, depth: Int): Boolean {
        var v = jsBox(value)
        if (v is JSToJSON) v = jsBox(v.jsToJSON(key ?: index.toString()))
        // Date.prototype.toJSON: before the replacer, which sees the string (null for an invalid date).
        else if (v is JSDate) v = v.toJSON() ?: JSNull
        else if (v is JSDynamic && v !is JSError) {
            val toJSON = v.jsGet("toJSON")
            if (toJSON is Function<*>) v = jsBox(jsCall(toJSON, key ?: index.toString()))
        }
        val r = replacer
        if (r != null) {
            val name = key ?: index.toString()
            v = if (r is JSMethod) jsBox(r.call(holder, arrayOf(name, v))) else jsBox(jsCall(r, name, v))
        }
        when (v) {
            null -> return false
            JSNull -> out.append("null")
            is Boolean -> out.append(if (v) "true" else "false")
            is String -> appendJSONQuoted(out, v)
            is Double -> number(v)
            is Function<*> -> return false
            is JSBigInt -> throw JSException(JSTypeError("Do not know how to serialize a BigInt"))
            else -> {
                val n = jsNumeric(v)
                if (n != null) number(n)
                else when (v) {
                    is JSArray<*> -> array(v, key ?: index.toString(), v.storage, depth)
                    is JSMatch -> array(v, key ?: index.toString(), v.values.storage, depth)
                    is JSMatchIndices -> array(v, key ?: index.toString(), v.values.storage, depth)
                    is Pair<*, *> -> array(v, key ?: index.toString(), listOf(v.first, v.second), depth)
                    is Triple<*, *, *> -> array(v, key ?: index.toString(), listOf(v.first, v.second, v.third), depth)
                    is JSRegExp -> out.append("{}")
                    is JSDynamic -> obj(v, key ?: index.toString(), depth)
                    else -> out.append("{}")
                }
            }
        }
        return true
    }

    /** A number as JSON writes it: an integer without a String in between, NaN and the infinities as null. */
    private fun number(v: Double) {
        when {
            v.isNaN() || v.isInfinite() -> out.append("null")
            // -0 is 0 here too.
            v == Math.rint(v) && Math.abs(v) < 9_007_199_254_740_992.0 -> out.append(v.toLong())
            !appendShortDecimal(v) -> out.append(jsNumberToString(v))
        }
    }

    /**
     * A non-integer `v` as Number::toString writes it, where that is at most 15 significant digits in fixed notation
     * (1e-6 ≤ |v| < 1e15); false otherwise, with nothing written. The first k whose m = rint(|v| × 10^k) reads back
     * as |v| (m / 10^k rounds once) gives the shortest digits: below 10^15 the product is within 0.25 of the shortest
     * decimal's m, and no other decimal with k digits after the point reads back as |v|.
     */
    private fun appendShortDecimal(v: Double): Boolean {
        val a = Math.abs(v)
        if (a < 1e-6 || a >= 1e15) return false
        for (k in 1..15) {
            val scale = EXACT_POWERS_OF_TEN[k]
            val scaled = a * scale
            if (scaled >= 1e15) return false
            val m = Math.rint(scaled)
            if (m / scale != a) continue
            val digits = m.toLong()
            val unit = EXACT_LONG_POWERS_OF_TEN[k]
            if (v < 0) out.append('-')
            out.append(digits / unit).append('.')
            val fraction = digits % unit
            var pad = unit / 10
            while (pad > fraction && pad > 1) {
                out.append('0')
                pad /= 10
            }
            out.append(fraction)
            return true
        }
        return false
    }

    private fun newline(depth: Int) {
        val g = gap ?: return
        out.append('\n')
        for (k in 0 until depth) out.append(g)
    }

    private fun enter(key: String, value: Any) {
        for (k in holders.indices) if (holders[k] === value) throw JSException(JSTypeError(circularMessage(k, key)))
        holders.add(value)
        holderKeys.add(key)
    }

    private fun leave() {
        holders.removeAt(holders.size - 1)
        holderKeys.removeAt(holderKeys.size - 1)
    }

    private fun array(owner: Any, key: String, elements: List<Any?>, depth: Int) {
        enter(key, owner)
        if (elements.isEmpty()) out.append("[]")
        else {
            out.append('[')
            for (i in elements.indices) {
                if (i > 0) out.append(',')
                newline(depth + 1)
                if (!property(owner, null, i, elements[i], depth + 1)) out.append("null")
            }
            newline(depth)
            out.append(']')
        }
        leave()
    }

    /** SerializeJSONObject: the keys as they are on entry, each value read as it is written. */
    private fun obj(owner: JSDynamic, key: String, depth: Int) {
        enter(key, owner)
        val own = owner.jsKeys
        val keys = allowed?.filter { it in own } ?: own
        out.append('{')
        var written = false
        for (k in keys) {
            val mark = out.length
            if (written) out.append(',')
            newline(depth + 1)
            appendJSONQuoted(out, k)
            out.append(if (gap == null) ":" else ": ")
            if (property(owner, k, -1, owner.jsGet(k), depth + 1)) written = true else out.setLength(mark)
        }
        if (written) newline(depth)
        out.append('}')
        leave()
    }

    /** V8's CircularStructureMessageBuilder: the first two links of the cycle, an ellipsis, the last. */
    private fun circularMessage(start: Int, closingKey: String): String {
        val text = StringBuilder("Converting circular structure to JSON")
        text.append("\n    --> starting at object with constructor ").append(constructorName(holders[start]))
        var index = start + 1
        val prefixEnd = minOf(holders.size, index + 2)
        while (index < prefixEnd) { normalLine(text, index); index++ }
        if (holders.size > index + 1) text.append("\n    |     ...")
        index = maxOf(index, holders.size - 1)
        while (index < holders.size) { normalLine(text, index); index++ }
        text.append("\n    --- ").append(keyText(holders[holders.size - 1], closingKey)).append(" closes the circle")
        return text.toString()
    }

    private fun normalLine(text: StringBuilder, index: Int) {
        text.append("\n    |     ").append(keyText(holders[index - 1], holderKeys[index]))
            .append(" -> object with constructor ").append(constructorName(holders[index]))
    }

    private fun keyText(holder: Any, key: String): String =
        if (holder is JSArray<*> || holder is JSMatch || holder is JSMatchIndices || holder is Pair<*, *> || holder is Triple<*, *, *>) "index $key" else "property '$key'"

    private fun constructorName(value: Any): String = when (value) {
        is JSArray<*>, is JSMatch, is JSMatchIndices, is Pair<*, *>, is Triple<*, *, *> -> "'Array'"
        is JSDynamic -> "'${value.jsClassName ?: "Object"}'"
        else -> "'Object'"
    }
}

/** QuoteJSONString, well-formed: lone surrogates escape as `\uXXXX`. */
fun jsJSONQuote(s: String): String = appendJSONQuoted(StringBuilder(s.length + 2), s).toString()

private const val HEX_DIGITS = "0123456789abcdef"

/** QuoteJSONString into `out`: runs that need no escape are appended whole. */
internal fun appendJSONQuoted(out: StringBuilder, s: String): StringBuilder {
    out.append('"')
    var run = 0
    var i = 0
    while (i < s.length) {
        val c = s[i]
        if (c >= ' ' && c != '"' && c != '\\' && !Character.isSurrogate(c)) {
            i++
            continue
        }
        if (Character.isHighSurrogate(c) && i + 1 < s.length && Character.isLowSurrogate(s[i + 1])) {
            i += 2
            continue
        }
        out.append(s, run, i)
        when (c) {
            '"' -> out.append("\\\"")
            '\\' -> out.append("\\\\")
            '\b' -> out.append("\\b")
            '\u000C' -> out.append("\\f")
            '\n' -> out.append("\\n")
            '\r' -> out.append("\\r")
            '\t' -> out.append("\\t")
            else -> {
                val u = c.code
                out.append("\\u").append(HEX_DIGITS[u shr 12]).append(HEX_DIGITS[(u shr 8) and 15]).append(HEX_DIGITS[(u shr 4) and 15]).append(HEX_DIGITS[u and 15])
            }
        }
        i++
        run = i
    }
    return out.append(s, run, s.length).append('"')
}
