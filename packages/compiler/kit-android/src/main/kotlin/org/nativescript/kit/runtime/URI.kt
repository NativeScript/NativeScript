package org.nativescript.kit

// ECMA-262's URI functions (§19.2.6): UTF-8 percent-encoding over UTF-16 code
// units. A lone surrogate or a malformed escape, where JavaScript throws a
// URIError, leaves the string as it was.

private const val UNRESERVED_MARKS = "-_.!~*'()"
private const val RESERVED_AND_HASH = ";/?:@&=+$,#"

private fun isAlphaNumeric(c: Char): Boolean = c in '0'..'9' || c in 'A'..'Z' || c in 'a'..'z'

private fun encode(s: String, keep: (Char) -> Boolean): String {
    val out = StringBuilder()
    var i = 0
    while (i < s.length) {
        val c = s[i]
        if (keep(c)) { out.append(c); i++; continue }
        val scalar: Int
        if (c.isHighSurrogate()) {
            if (i + 1 >= s.length || !s[i + 1].isLowSurrogate()) return s
            scalar = Character.toCodePoint(c, s[i + 1])
            i += 2
        } else if (c.isLowSurrogate()) {
            return s
        } else {
            scalar = c.code
            i++
        }
        for (b in String(Character.toChars(scalar)).toByteArray(Charsets.UTF_8)) out.append('%').append(String.format("%02X", b.toInt() and 0xFF))
    }
    return out.toString()
}

private fun decode(s: String, reserved: String): String {
    val out = StringBuilder()
    fun hexByte(at: Int): Int? {
        if (at + 2 >= s.length || s[at] != '%') return null
        val hi = Character.digit(s[at + 1], 16)
        val lo = Character.digit(s[at + 2], 16)
        return if (hi < 0 || lo < 0) null else hi * 16 + lo
    }
    var i = 0
    while (i < s.length) {
        if (s[i] != '%') { out.append(s[i]); i++; continue }
        val first = hexByte(i) ?: return s
        if (first < 0x80) {
            if (reserved.indexOf(first.toChar()) >= 0) out.append(s, i, i + 3) else out.append(first.toChar())
            i += 3
            continue
        }
        val count = if (first >= 0xF0) 4 else if (first >= 0xE0) 3 else if (first >= 0xC0) 2 else 0
        if (count == 0) return s
        val bytes = ByteArray(count)
        bytes[0] = first.toByte()
        for (k in 1 until count) {
            val b = hexByte(i + 3 * k) ?: return s
            if (b and 0xC0 != 0x80) return s
            bytes[k] = b.toByte()
        }
        val decoder = Charsets.UTF_8.newDecoder()
        val text = try { decoder.decode(java.nio.ByteBuffer.wrap(bytes)).toString() } catch (_: java.nio.charset.CharacterCodingException) { return s }
        out.append(text)
        i += 3 * count
    }
    return out.toString()
}

fun jsEncodeURIComponent(s: String): String = encode(s) { isAlphaNumeric(it) || UNRESERVED_MARKS.indexOf(it) >= 0 }

fun jsEncodeURI(s: String): String = encode(s) { isAlphaNumeric(it) || UNRESERVED_MARKS.indexOf(it) >= 0 || RESERVED_AND_HASH.indexOf(it) >= 0 }

fun jsDecodeURIComponent(s: String): String = decode(s, "")

fun jsDecodeURI(s: String): String = decode(s, RESERVED_AND_HASH)
