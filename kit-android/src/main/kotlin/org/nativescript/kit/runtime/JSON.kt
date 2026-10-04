package org.nativescript.kit

// JSON.parse

/**
 * `JSON.parse(text)`: objects become `JSObject` (key order kept), arrays `JSArray<Any?>`, numbers
 * `Double`, `null` `jsNull`. Invalid text throws a SyntaxError with V8's message.
 */
fun jsJSONParse(text: String): Any? = JSONParser(text).parse()

private class JSONParser(val source: String) {
    var position = 0

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
                    if (peek() == '}') {
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
                    if (peek() == ']') {
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
                        if (peek() == ',') {
                            position++
                            continue@parseValue
                        }
                        if (peek() != ']') throw unexpected("Expected ',' or ']' after array element")
                        position++
                        stack.removeAt(stack.size - 1)
                        value = top.array
                    }
                    is Container.Object -> {
                        top.obj[top.key] = value
                        if (peek() == ',') {
                            position++
                            skipWhitespace()
                            top.key = scanPropertyKey("Expected double-quoted property name")
                            continue@parseValue
                        }
                        if (peek() != '}') throw unexpected("Expected ',' or '}' after property value")
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

    private fun peek(): Char? = if (position < source.length) source[position] else null

    private fun skipWhitespace() {
        while (position < source.length) {
            when (source[position]) {
                ' ', '\t', '\n', '\r' -> position++
                else -> return
            }
        }
    }

    private fun scanPropertyKey(message: String): String {
        if (peek() != '"') throw unexpected(message)
        val key = scanString()
        skipWhitespace()
        if (peek() != ':') throw unexpected("Expected ':' after property name")
        position++
        return key
    }

    private fun scanLiteral(literal: String) {
        for (c in literal) {
            if (position >= source.length || source[position] != c) throw unexpected()
            position++
        }
    }

    private fun isDigit(c: Char?): Boolean = c != null && c in '0'..'9'

    private fun scanNumber(): Double {
        val start = position
        if (source[position] == '-') {
            position++
            if (!isDigit(peek())) throw error("No number after minus sign")
        }
        if (source[position] == '0') {
            position++
            if (isDigit(peek())) throw unexpected()
        } else {
            while (isDigit(peek())) position++
        }
        if (peek() == '.') {
            position++
            if (!isDigit(peek())) throw error("Unterminated fractional number")
            while (isDigit(peek())) position++
        }
        if (peek() == 'e' || peek() == 'E') {
            position++
            if (peek() == '+' || peek() == '-') position++
            if (!isDigit(peek())) throw error("Exponent part is missing a number")
            while (isDigit(peek())) position++
        }
        return source.substring(start, position).toDouble()
    }

    private fun scanString(): String {
        position++
        val out = StringBuilder()
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
fun jsJSONStringify(value: Any?, indent: Any? = null): String? {
    var gap: String? = null
    val i = jsBox(indent)
    if (i is String) {
        if (i.isNotEmpty()) gap = i.substring(0, minOf(10, i.length))
    } else if (i != null) {
        val n = jsNumeric(i)
        // V8 keeps an empty gap for 0 < n < 1: line breaks without indentation.
        if (n != null && n > 0) gap = " ".repeat(minOf(10.0, n).toInt())
    }
    return JSONWriter(gap).serialize("", value, "")
}

private class JSONWriter(val gap: String?) {
    private val stack = ArrayList<Pair<String, Any>>()

    fun serialize(key: String, value0: Any?, indent: String): String? {
        var v = jsBox(value0) ?: return null
        if (v is JSDynamic && v !is JSError) {
            val toJSON = v.jsGet("toJSON")
            if (toJSON is Function<*>) v = jsBox(jsCall(toJSON, key)) ?: return null
        }
        when (v) {
            JSNull -> return "null"
            is Boolean -> return if (v) "true" else "false"
            is String -> return jsJSONQuote(v)
            is JSDate -> return v.toJSON()?.let { jsJSONQuote(it) } ?: "null"
            is Function<*> -> return null
        }
        jsNumeric(v)?.let { return if (it.isNaN() || it.isInfinite()) "null" else jsNumberToString(it) }
        return when (v) {
            is JSArray<*> -> serializeArray(key, v, v.storage, indent)
            is JSMatch -> serializeArray(key, v, v.values.storage, indent)
            is JSMatchIndices -> serializeArray(key, v, v.values.storage, indent)
            is Pair<*, *> -> serializeArray(key, v, listOf(v.first, v.second), indent)
            is Triple<*, *, *> -> serializeArray(key, v, listOf(v.first, v.second, v.third), indent)
            is JSRegExp -> "{}"
            is JSDynamic -> serializeObject(key, v, v.jsKeys.map { Pair(it, v.jsGet(it)) }, indent)
            else -> "{}"
        }
    }

    private fun enter(key: String, value: Any) {
        val start = stack.indexOfFirst { it.second === value }
        if (start >= 0) throw JSException(JSTypeError(circularMessage(start, key)))
        stack.add(Pair(key, value))
    }

    private fun leave() { stack.removeAt(stack.size - 1) }

    /** V8's CircularStructureMessageBuilder: the first two links of the cycle, an ellipsis, the last. */
    private fun circularMessage(start: Int, closingKey: String): String {
        val out = StringBuilder("Converting circular structure to JSON")
        out.append("\n    --> starting at object with constructor ").append(constructorName(stack[start].second))
        var index = start + 1
        val prefixEnd = minOf(stack.size, index + 2)
        while (index < prefixEnd) { normalLine(out, index); index++ }
        if (stack.size > index + 1) out.append("\n    |     ...")
        index = maxOf(index, stack.size - 1)
        while (index < stack.size) { normalLine(out, index); index++ }
        out.append("\n    --- ").append(keyText(stack[stack.size - 1].second, closingKey)).append(" closes the circle")
        return out.toString()
    }

    private fun normalLine(out: StringBuilder, index: Int) {
        val (key, value) = stack[index]
        out.append("\n    |     ").append(keyText(stack[index - 1].second, key))
            .append(" -> object with constructor ").append(constructorName(value))
    }

    private fun keyText(holder: Any, key: String): String =
        if (holder is JSArray<*> || holder is JSMatch || holder is JSMatchIndices || holder is Pair<*, *> || holder is Triple<*, *, *>) "index $key" else "property '$key'"

    private fun constructorName(value: Any): String = when (value) {
        is JSArray<*>, is JSMatch, is JSMatchIndices, is Pair<*, *>, is Triple<*, *, *> -> "'Array'"
        is JSDynamic -> "'${value.jsClassName ?: "Object"}'"
        else -> "'Object'"
    }

    private fun serializeArray(key: String, owner: Any, elements: List<Any?>, indent: String): String {
        enter(key, owner)
        try {
            if (elements.isEmpty()) return "[]"
            val inner = indent + (gap ?: "")
            val parts = elements.mapIndexed { i, e -> serialize(i.toString(), e, inner) ?: "null" }
            if (gap == null) return "[" + parts.joinToString(",") + "]"
            return "[\n" + inner + parts.joinToString(",\n$inner") + "\n" + indent + "]"
        } finally {
            leave()
        }
    }

    private fun serializeObject(key: String, owner: Any, entries: List<Pair<String, Any?>>, indent: String): String {
        enter(key, owner)
        try {
            val inner = indent + (gap ?: "")
            val parts = ArrayList<String>()
            for ((k, v) in entries) {
                val text = serialize(k, v, inner) ?: continue
                parts.add(jsJSONQuote(k) + (if (gap == null) ":" else ": ") + text)
            }
            if (parts.isEmpty()) return "{}"
            if (gap == null) return "{" + parts.joinToString(",") + "}"
            return "{\n" + inner + parts.joinToString(",\n$inner") + "\n" + indent + "}"
        } finally {
            leave()
        }
    }
}

/** QuoteJSONString, well-formed: lone surrogates escape as `\uXXXX`. */
fun jsJSONQuote(s: String): String {
    val out = StringBuilder(s.length + 2)
    out.append('"')
    var i = 0
    while (i < s.length) {
        val c = s[i]
        when {
            c == '"' -> out.append("\\\"")
            c == '\\' -> out.append("\\\\")
            c == '\b' -> out.append("\\b")
            c == '\u000C' -> out.append("\\f")
            c == '\n' -> out.append("\\n")
            c == '\r' -> out.append("\\r")
            c == '\t' -> out.append("\\t")
            c < ' ' -> out.append("\\u").append(String.format("%04x", c.code))
            Character.isHighSurrogate(c) && i + 1 < s.length && Character.isLowSurrogate(s[i + 1]) -> {
                out.append(c).append(s[i + 1])
                i++
            }
            Character.isSurrogate(c) -> out.append("\\u").append(Integer.toHexString(c.code))
            else -> out.append(c)
        }
        i++
    }
    return out.append('"').toString()
}
