package org.nativescript.kit

import java.util.IdentityHashMap

// Node's util.inspect with console.log's defaults (depth 2, breakLength 80, compact 3,
// maxArrayLength 100, maxStringLength 10000), following lib/internal/util/inspect.js
// function by function.

/**
 * Where console output goes. The default writes UTF-8 to standard output or standard error
 * (lone surrogates as U+FFFD, as Node writes them) and flushes.
 */
var jsConsoleSink: (text: String, isError: Boolean) -> Unit = { text, isError ->
    val stream = if (isError) System.err else System.out
    stream.write(jsUtf8(text))
    stream.flush()
}

/** UTF-8 with each lone surrogate as U+FFFD, where Java's encoder would write `?`. */
private fun jsUtf8(text: String): ByteArray {
    var fixed: CharArray? = null
    var i = 0
    while (i < text.length) {
        val c = text[i]
        if (Character.isHighSurrogate(c) && i + 1 < text.length && Character.isLowSurrogate(text[i + 1])) { i += 2; continue }
        if (Character.isSurrogate(c)) (fixed ?: text.toCharArray().also { fixed = it })[i] = '\uFFFD'
        i++
    }
    return (fixed?.let { String(it) } ?: text).toByteArray(Charsets.UTF_8)
}

fun jsWriteStandardOutput(text: String) = jsConsoleSink(text, false)

fun jsWriteStandardError(text: String) = jsConsoleSink(text, true)

/** `util.inspect(value)`: what `console.log` prints for a non-string argument. */
fun jsInspect(value: Any?): String = JSInspectContext().formatValue(value, 0)

/**
 * `console.log(...)`: strings print raw, other values through `jsInspect`, separated by spaces;
 * a first string argument may hold `%s %d %i %f %j %o %O %c %%` placeholders.
 */
fun jsLog(vararg args: Any?) = jsWriteStandardOutput(jsFormatLogLine(args.asList()) + "\n")

/** `console.info(...)`. */
fun jsInfo(vararg args: Any?) = jsWriteStandardOutput(jsFormatLogLine(args.asList()) + "\n")

/** `console.debug(...)`. */
fun jsDebug(vararg args: Any?) = jsWriteStandardOutput(jsFormatLogLine(args.asList()) + "\n")

/** `console.error(...)`, to standard error. */
fun jsError(vararg args: Any?) = jsWriteStandardError(jsFormatLogLine(args.asList()) + "\n")

/** `console.warn(...)`, to standard error. */
fun jsWarn(vararg args: Any?) = jsWriteStandardError(jsFormatLogLine(args.asList()) + "\n")

/** Node's `formatWithOptions`. */
fun jsFormatLogLine(args: List<Any?>): String {
    if (args.isEmpty()) return ""
    val first = jsBox(args[0])
    var a = 0
    val out = StringBuilder()
    var join = ""
    if (first is String) {
        if (args.size == 1) return first
        var lastPos = 0
        var i = 0
        while (i < first.length - 1) {
            if (first[i] == '%') {
                i++
                val next = first[i]
                if (a + 1 != args.size) {
                    val replacement: String
                    when (next) {
                        's' -> {
                            val arg = jsBox(args[++a])
                            val n = jsNumeric(arg)
                            replacement = when {
                                n != null -> formatNumber(n)
                                arg == null || arg is String || arg is Boolean || arg === JSNull || arg is Function<*> -> jsToString(arg)
                                !hasBuiltInToString(arg) -> jsToString(arg)
                                else -> JSInspectContext(depth = 0).formatValue(arg, 0)
                            }
                        }
                        'j' -> replacement = try {
                            jsJSONStringify(args[++a]) ?: "undefined"
                        } catch (e: JSException) {
                            val v = e.value
                            if (v is JSTypeError && v.message.startsWith("Converting circular structure to JSON")) "[Circular]" else throw e
                        }
                        'd' -> replacement = formatNumber(jsToNumber(args[++a]))
                        'O' -> replacement = jsInspect(args[++a])
                        'o' -> replacement = JSInspectContext(depth = 4, showHidden = true).formatValue(args[++a], 0)
                        'i' -> replacement = formatNumber(jsParseInt(jsToString(args[++a])))
                        'f' -> replacement = formatNumber(jsParseFloat(jsToString(args[++a])))
                        'c' -> { a++; replacement = "" }
                        '%' -> {
                            out.append(first, lastPos, i)
                            lastPos = i + 1
                            i++
                            continue
                        }
                        else -> { i++; continue }
                    }
                    if (lastPos != i - 1) out.append(first, lastPos, i - 1)
                    out.append(replacement)
                    lastPos = i + 1
                } else if (next == '%') {
                    out.append(first, lastPos, i)
                    lastPos = i + 1
                }
            }
            i++
        }
        if (lastPos != 0) {
            a++
            join = " "
            if (lastPos < first.length) out.append(first, lastPos, first.length)
        }
    }
    while (a < args.size) {
        val value = jsBox(args[a])
        out.append(join)
        out.append(if (value is String) value else jsInspect(value))
        join = " "
        a++
    }
    return out.toString()
}

/** Whether `%s` inspects the value rather than converting it: no `toString` of its own. */
private fun hasBuiltInToString(value: Any): Boolean =
    value !is JSStringConvertible || value is JSDate || value is JSRegExp || value is JSMatch

private fun formatNumber(n: Double): String = if (n == 0.0 && 1.0 / n < 0) "-0" else jsNumberToString(n)

private val escapes: Array<String?> = Array(160) { c ->
    when (c) {
        8 -> "\\b"
        9 -> "\\t"
        10 -> "\\n"
        12 -> "\\f"
        13 -> "\\r"
        39 -> "\\'"
        92 -> "\\\\"
        else -> if (c < 32 || c >= 127) "\\x" + String.format("%02X", c) else null
    }
}

/** Node's `strEscape`: single quotes unless the string contains one, escapes for control characters and lone surrogates. */
internal fun jsInspectQuote(s: String): String {
    var quote = '\''
    if (s.contains('\'')) {
        if (!s.contains('"')) quote = '"'
        else if (!s.contains('`') && !s.contains("\${")) quote = '`'
    }
    val out = StringBuilder(s.length + 2)
    out.append(quote)
    var i = 0
    while (i < s.length) {
        val c = s[i]
        val code = c.code
        if ((code == 39 && quote == '\'') || code == 92 || code < 32 || (code in 127..159)) {
            out.append(escapes[code])
        } else if (Character.isSurrogate(c)) {
            if (Character.isHighSurrogate(c) && i + 1 < s.length && Character.isLowSurrogate(s[i + 1])) {
                out.append(c).append(s[i + 1])
                i += 2
                continue
            }
            out.append("\\u").append(Integer.toHexString(code))
        } else out.append(c)
        i++
    }
    return out.append(quote).toString()
}

private val keyPattern = Regex("^[a-zA-Z_][a-zA-Z_0-9]*$")

/**
 * Node's `getStringWidth` without ICU tables: wide East Asian and emoji code points count 2,
 * control characters, combining marks and zero-width characters 0.
 */
private fun stringWidth(s: String): Int {
    var width = 0
    var i = 0
    while (i < s.length) {
        val c = s.codePointAt(i)
        i += Character.charCount(c)
        if (c < 0x7F) {
            if (c >= 0x20) width++
            continue
        }
        when (c) {
            in 0x7F..0x9F, in 0x300..0x36F, in 0x200B..0x200F, in 0x20D0..0x20FF, in 0xFE00..0xFE0F, in 0xFE20..0xFE2F, in 0xE0100..0xE01EF -> {}
            in 0x1100..0x115F, 0x2329, 0x232A, in 0x2E80..0x3247, in 0x3250..0x4DBF, in 0x4E00..0xA4C6, in 0xA960..0xA97C,
            in 0xAC00..0xD7A3, in 0xF900..0xFAFF, in 0xFE10..0xFE19, in 0xFE30..0xFE6B, in 0xFF01..0xFF60, in 0xFFE0..0xFFE6,
            in 0x1B000..0x1B001, in 0x1F200..0x1F251, in 0x1F300..0x1F64F, in 0x20000..0x3FFFD -> width += 2
            else -> width++
        }
    }
    return width
}

private class JSInspectProperty(val key: String, val value: Any?, val enumerable: Boolean = true)

private class JSInspectContext(var depth: Int = 2, val showHidden: Boolean = false) {
    val breakLength = 80
    val compact = 3
    val maxArrayLength = 100
    val maxStringLength = 10000
    var indentationLvl = 0
    var currentDepth = 0
    val seen = ArrayList<Any>()
    var circular: IdentityHashMap<Any, Int>? = null

    fun formatValue(value: Any?, recurseTimes: Int): String {
        val v = jsBox(value) ?: return "undefined"
        when (v) {
            is String -> return formatString(v)
            is Boolean -> return if (v) "true" else "false"
            JSNull -> return "null"
            is Function<*> -> return "[Function (anonymous)]"
        }
        jsNumeric(v)?.let { return formatNumber(it) }
        if (seen.any { it === v }) {
            val c = circular ?: IdentityHashMap<Any, Int>().also { circular = it }
            val index = c[v] ?: (c.size + 1).also { c[v] = it }
            return "[Circular *$index]"
        }
        return formatRaw(v, recurseTimes)
    }

    private fun formatString(value: String): String {
        var s = value
        var trailer = ""
        if (s.length > maxStringLength) {
            val remaining = s.length - maxStringLength
            s = s.substring(0, maxStringLength)
            trailer = "... $remaining more character${if (remaining > 1) "s" else ""}"
        }
        if (s.length > 16 && s.length > breakLength - indentationLvl - 4) {
            val lines = ArrayList<String>()
            var start = 0
            for (i in 0 until s.length - 1) if (s[i] == '\n') { lines.add(s.substring(start, i + 1)); start = i + 1 }
            lines.add(s.substring(start))
            return lines.joinToString(" +\n" + " ".repeat(indentationLvl + 2)) { jsInspectQuote(it) } + trailer
        }
        return jsInspectQuote(s) + trailer
    }

    private fun formatRaw(value: Any, recurseTimes: Int): String {
        var base = ""
        var open = "{"
        var close = "}"
        var arrayType = false
        var formatter: (Int) -> MutableList<String> = { ArrayList() }
        val keys = ArrayList<JSInspectProperty>()
        val name: String
        var bracketName = true

        when (value) {
            is JSArray<*> -> {
                val elements = value.storage
                if (elements.isEmpty() && !showHidden) return "[]"
                name = "Array"
                open = "["; close = "]"
                arrayType = true
                formatter = { formatList(elements, it) }
                if (showHidden) keys.add(JSInspectProperty("length", elements.size.toDouble(), false))
            }
            is JSMatch -> {
                val elements = value.values.storage
                name = "Array"
                open = "["; close = "]"
                arrayType = true
                formatter = { formatList(elements, it) }
                if (value.isExecResult) {
                    keys.add(JSInspectProperty("index", value.index))
                    keys.add(JSInspectProperty("input", value.input))
                    keys.add(JSInspectProperty("groups", value.groups))
                    if (value.hasIndices) keys.add(JSInspectProperty("indices", value.indices))
                } else if (elements.isEmpty()) return "[]"
            }
            is JSMatchIndices -> {
                val elements = value.values.storage
                name = "Array"
                open = "["; close = "]"
                arrayType = true
                formatter = { formatList(elements, it) }
                keys.add(JSInspectProperty("groups", value.groups))
            }
            is Pair<*, *>, is Triple<*, *, *> -> {
                val elements = tupleElements(value)
                name = "Array"
                open = "["; close = "]"
                arrayType = true
                formatter = { formatList(elements, it) }
            }
            is JSSet<*> -> {
                val values = value.jsValues
                val prefix = "Set(${values.size}) "
                if (values.isEmpty()) return prefix + "{}"
                name = "Set"
                open = "$prefix{"
                formatter = { formatSet(values, it) }
            }
            is JSMap<*, *> -> {
                val entries = value.jsEntries
                val prefix = "Map(${entries.size}) "
                if (entries.isEmpty()) return prefix + "{}"
                name = "Map"
                open = "$prefix{"
                formatter = { formatMap(entries, it) }
            }
            is JSThenable -> {
                name = "Promise"
                open = "Promise {"
                formatter = { formatPromise(value.jsPromiseState, it) }
            }
            is JSError -> {
                name = value.jsClassName ?: "Error"
                for (key in value.jsKeys) keys.add(JSInspectProperty(key, value.jsGet(key)))
                base = formatError(value, name, keys)
                if (keys.isEmpty()) return base
            }
            is JSDate -> return if (value.time.isNaN()) "Invalid Date" else value.toISOString()
            is JSRegExp -> return value.toString()
            is JSDynamic -> {
                for (key in value.jsKeys) keys.add(JSInspectProperty(key, value.jsGet(key)))
                val className = value.jsClassName
                if (value is JSObject && value.jsNullPrototype) {
                    name = "[Object: null prototype]"
                    bracketName = false
                    open = "$name {"
                } else if (className != null) {
                    name = className
                    open = "$className {"
                } else name = "Object"
                if (keys.isEmpty()) return "$open}"
            }
            else -> return "${value.javaClass.simpleName} {}"
        }

        if (recurseTimes > depth) return if (bracketName) "[$name]" else name

        val level = recurseTimes + 1
        seen.add(value)
        currentDepth = level
        val output = formatter(level)
        for (p in keys) output.add(formatProperty(p, level))
        circular?.get(value)?.let { index ->
            val reference = "<ref *$index>"
            base = if (base.isEmpty()) reference else "$reference $base"
        }
        seen.removeAt(seen.size - 1)
        return reduceToSingleString(output, base, open, close, arrayType, level, value)
    }

    private fun formatProperty(p: JSInspectProperty, recurseTimes: Int): String {
        indentationLvl += 2
        val text = formatValue(p.value, recurseTimes)
        indentationLvl -= 2
        var name = when {
            p.key == "__proto__" -> "['__proto__']"
            keyPattern.matches(p.key) -> p.key
            else -> jsInspectQuote(p.key)
        }
        if (!p.enumerable) name = "[$name]"
        return "$name: $text"
    }

    private fun remainingText(remaining: Int): String = "... $remaining more item${if (remaining > 1) "s" else ""}"

    private fun formatList(elements: List<Any?>, recurseTimes: Int): MutableList<String> {
        val count = minOf(maxArrayLength, elements.size)
        val output = ArrayList<String>()
        for (i in 0 until count) {
            indentationLvl += 2
            output.add(formatValue(elements[i], recurseTimes))
            indentationLvl -= 2
        }
        if (elements.size > count) output.add(remainingText(elements.size - count))
        return output
    }

    private fun formatSet(values: List<Any?>, recurseTimes: Int): MutableList<String> {
        val count = minOf(maxArrayLength, values.size)
        val output = ArrayList<String>()
        indentationLvl += 2
        for (i in 0 until count) output.add(formatValue(values[i], recurseTimes))
        if (values.size > count) output.add(remainingText(values.size - count))
        indentationLvl -= 2
        return output
    }

    private fun formatMap(entries: List<Pair<Any?, Any?>>, recurseTimes: Int): MutableList<String> {
        val count = minOf(maxArrayLength, entries.size)
        val output = ArrayList<String>()
        indentationLvl += 2
        for (i in 0 until count) {
            val (k, v) = entries[i]
            output.add("${formatValue(k, recurseTimes)} => ${formatValue(v, recurseTimes)}")
        }
        if (entries.size > count) output.add(remainingText(entries.size - count))
        indentationLvl -= 2
        return output
    }

    private fun formatPromise(state: Pair<JSPromiseState, Any?>, recurseTimes: Int): MutableList<String> {
        if (state.first == JSPromiseState.PENDING) return arrayListOf("<pending>")
        indentationLvl += 2
        val text = formatValue(state.second, recurseTimes)
        indentationLvl -= 2
        return arrayListOf(if (state.first == JSPromiseState.REJECTED) "<rejected> $text" else text)
    }

    private fun formatError(error: JSError, constructor: String, keys: MutableList<JSInspectProperty>): String {
        var stack = error.stack.ifEmpty { error.jsErrorString }
        val message = error.message
        val name = error.name
        if (!showHidden) {
            keys.removeAll { it.key == "stack" }
            if (stack.contains(message)) keys.removeAll { it.key == "message" }
            if (stack.contains(name)) keys.removeAll { it.key == "name" }
        }
        if (error.cause != null) keys.add(JSInspectProperty("cause", error.cause, false))
        if (error is JSAggregateError) keys.add(JSInspectProperty("errors", error.errors, false))
        stack = improveStack(stack, constructor, name)
        var pos = if (message.isEmpty()) -1 else stack.indexOf(message).let { if (it == 0) -1 else it }
        if (pos != -1) pos += message.length
        if (stack.indexOf("\n    at", maxOf(pos, 0)) == -1) stack = "[$stack]"
        if (indentationLvl != 0) stack = stack.replace("\n", "\n" + " ".repeat(indentationLvl))
        return stack
    }

    private fun improveStack(stack: String, constructor: String, name: String): String {
        val len = name.length
        if (name.endsWith("Error") && stack.startsWith(name) && (stack.length == len || stack[len] == ':' || stack[len] == '\n')) {
            if (name != constructor) {
                return if (constructor.contains(name)) {
                    if (len == 0) "$constructor: $stack" else constructor + stack.substring(len)
                } else "$constructor [$name]${stack.substring(len)}"
            }
        }
        return stack
    }

    private fun isBelowBreakLength(output: List<String>, start: Int, base: String): Boolean {
        var totalLength = output.size + start
        if (totalLength + output.size > breakLength) return false
        for (entry in output) {
            totalLength += entry.length
            if (totalLength > breakLength) return false
        }
        return base.isEmpty() || !base.contains('\n')
    }

    private fun reduceToSingleString(
        output0: List<String>, base: String, open: String, close: String,
        arrayType: Boolean, recurseTimes: Int, value: Any,
    ): String {
        var output = output0
        val entries = output.size
        if (arrayType && entries > 6) output = groupArrayElements(output, value)
        if (currentDepth - recurseTimes < compact && entries == output.size) {
            val start = output.size + indentationLvl + open.length + base.length + 10
            if (isBelowBreakLength(output, start, base)) {
                val joined = output.joinToString(", ")
                if (!joined.contains('\n')) return (if (base.isEmpty()) "" else "$base ") + "$open $joined $close"
            }
        }
        val indentation = "\n" + " ".repeat(indentationLvl)
        return (if (base.isEmpty()) "" else "$base ") + open + indentation + "  " +
            output.joinToString(",$indentation  ") + indentation + close
    }

    private fun groupArrayElements(output: List<String>, value: Any): List<String> {
        var totalLength = 0
        var maxLength = 0
        var outputLength = output.size
        if (maxArrayLength < output.size) outputLength--
        val separatorSpace = 2
        val dataLen = IntArray(outputLength)
        for (i in 0 until outputLength) {
            val len = stringWidth(output[i])
            dataLen[i] = len
            totalLength += len + separatorSpace
            if (maxLength < len) maxLength = len
        }
        val actualMax = maxLength + separatorSpace
        if (actualMax * 3 + indentationLvl < breakLength &&
            (totalLength.toDouble() / actualMax > 5 || maxLength <= 6)
        ) {
            val approxCharHeights = 2.5
            val averageBias = Math.sqrt(actualMax - totalLength.toDouble() / output.size)
            val biasedMax = maxOf(actualMax - 3 - averageBias, 1.0)
            val columns = minOf(
                jsRound(Math.sqrt(approxCharHeights * biasedMax * outputLength) / biasedMax).toInt(),
                (breakLength - indentationLvl) / actualMax,
                compact * 4,
                15,
            )
            if (columns <= 1) return output
            val maxLineLength = ArrayList<Int>()
            for (i in 0 until columns) {
                var lineMaxLength = 0
                var j = i
                while (j < output.size) {
                    if (j < dataLen.size && dataLen[j] > lineMaxLength) lineMaxLength = dataLen[j]
                    j += columns
                }
                maxLineLength.add(lineMaxLength + separatorSpace)
            }
            val elements = elementsOf(value)
            var padStart = true
            for (i in output.indices) {
                if (i >= elements.size || jsNumeric(jsBox(elements[i])) == null) {
                    padStart = false
                    break
                }
            }
            val grouped = ArrayList<String>()
            var i = 0
            while (i < outputLength) {
                val max = minOf(i + columns, outputLength)
                val line = StringBuilder()
                var j = i
                while (j < max - 1) {
                    val padding = maxLineLength[j - i] + output[j].length - dataLen[j]
                    line.append(pad(output[j] + ", ", padding, padStart))
                    j++
                }
                if (padStart) {
                    val padding = maxLineLength[j - i] + output[j].length - dataLen[j] - separatorSpace
                    line.append(pad(output[j], padding, true))
                } else line.append(output[j])
                grouped.add(line.toString())
                i += columns
            }
            if (maxArrayLength < output.size) grouped.add(output[outputLength])
            return grouped
        }
        return output
    }

    private fun pad(s: String, width: Int, start: Boolean): String {
        val missing = width - s.length
        if (missing <= 0) return s
        val fill = " ".repeat(missing)
        return if (start) fill + s else s + fill
    }

    private fun elementsOf(value: Any): List<Any?> = when (value) {
        is JSArray<*> -> value.storage
        is JSMatch -> value.values.storage
        is JSMatchIndices -> value.values.storage
        else -> tupleElements(value)
    }
}

private fun tupleElements(value: Any): List<Any?> = when (value) {
    is Pair<*, *> -> listOf(value.first, value.second)
    is Triple<*, *, *> -> listOf(value.first, value.second, value.third)
    else -> emptyList()
}
