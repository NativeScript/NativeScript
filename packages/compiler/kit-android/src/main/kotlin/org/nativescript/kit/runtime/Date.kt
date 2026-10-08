package org.nativescript.kit

import java.util.Locale
import java.util.TimeZone

/**
 * `Date`: a time value in milliseconds since the epoch (NaN when invalid), read in the default
 * time zone (`TimeZone.getDefault()`) or in UTC as ECMA-262 §21.4 defines.
 */
class JSDate(ms: Double) : JSDynamic, JSStringConvertible {
    /** The time value: milliseconds since the epoch, NaN when invalid. */
    @get:JvmName("timeValue")
    var time: Double = timeClip(ms)
        private set

    /** `new Date()`. */
    constructor() : this(now())

    /** `new Date(text)`, parsed as `Date.parse` does. */
    constructor(text: String) : this(parse(text))

    /** `new Date(year, month, day?, hours?, minutes?, seconds?, ms?)` in local time; years 0–99 mean 1900–1999. */
    constructor(year: Double, month: Double, day: Double = 1.0, hours: Double = 0.0, minutes: Double = 0.0, seconds: Double = 0.0, ms: Double = 0.0) :
        this(utcFromLocal(makeDate(fullYear(year), month, day, hours, minutes, seconds, ms)))

    // Getters

    private inline fun field(utc: Boolean, f: (Double) -> Double): Double {
        if (time.isNaN()) return Double.NaN
        return f(if (utc) time else local(time))
    }

    fun getTime(): Double = time
    fun valueOf(): Double = time
    fun getFullYear(): Double = field(false, ::yearFromTime)
    fun getMonth(): Double = field(false, ::monthFromTime)
    fun getDate(): Double = field(false, ::dateFromTime)
    fun getDay(): Double = field(false, ::weekDay)
    fun getHours(): Double = field(false, ::hourFromTime)
    fun getMinutes(): Double = field(false, ::minFromTime)
    fun getSeconds(): Double = field(false, ::secFromTime)
    fun getMilliseconds(): Double = field(false, ::msFromTime)
    fun getUTCFullYear(): Double = field(true, ::yearFromTime)
    fun getUTCMonth(): Double = field(true, ::monthFromTime)
    fun getUTCDate(): Double = field(true, ::dateFromTime)
    fun getUTCDay(): Double = field(true, ::weekDay)
    fun getUTCHours(): Double = field(true, ::hourFromTime)
    fun getUTCMinutes(): Double = field(true, ::minFromTime)
    fun getUTCSeconds(): Double = field(true, ::secFromTime)
    fun getUTCMilliseconds(): Double = field(true, ::msFromTime)

    /** Minutes UTC is ahead of local time, truncated as V8 truncates historical second offsets. */
    fun getTimezoneOffset(): Double = if (time.isNaN()) Double.NaN else offsetMinutes(time).toDouble()

    // Setters: each returns the new time value.

    private fun set(utc: Boolean, year: Double? = null, month: Double? = null, date: Double? = null, hours: Double? = null, minutes: Double? = null, seconds: Double? = null, ms: Double? = null): Double {
        val t = if (time.isNaN()) (if (year != null) 0.0 else return Double.NaN) else if (utc) time else local(time)
        val d = makeDate(
            year ?: yearFromTime(t), month ?: monthFromTime(t), date ?: dateFromTime(t),
            hours ?: hourFromTime(t), minutes ?: minFromTime(t), seconds ?: secFromTime(t), ms ?: msFromTime(t),
        )
        time = timeClip(if (utc) d else utcFromLocal(d))
        return time
    }

    fun setTime(t: Double): Double { time = timeClip(t); return time }
    fun setFullYear(year: Double, month: Double? = null, date: Double? = null): Double = set(false, year = year, month = month, date = date)
    fun setMonth(month: Double, date: Double? = null): Double = set(false, month = month, date = date)
    fun setDate(date: Double): Double = set(false, date = date)
    fun setHours(hours: Double, minutes: Double? = null, seconds: Double? = null, ms: Double? = null): Double = set(false, hours = hours, minutes = minutes, seconds = seconds, ms = ms)
    fun setMinutes(minutes: Double, seconds: Double? = null, ms: Double? = null): Double = set(false, minutes = minutes, seconds = seconds, ms = ms)
    fun setSeconds(seconds: Double, ms: Double? = null): Double = set(false, seconds = seconds, ms = ms)
    fun setMilliseconds(ms: Double): Double = set(false, ms = ms)
    fun setUTCFullYear(year: Double, month: Double? = null, date: Double? = null): Double = set(true, year = year, month = month, date = date)
    fun setUTCMonth(month: Double, date: Double? = null): Double = set(true, month = month, date = date)
    fun setUTCDate(date: Double): Double = set(true, date = date)
    fun setUTCHours(hours: Double, minutes: Double? = null, seconds: Double? = null, ms: Double? = null): Double = set(true, hours = hours, minutes = minutes, seconds = seconds, ms = ms)
    fun setUTCMinutes(minutes: Double, seconds: Double? = null, ms: Double? = null): Double = set(true, minutes = minutes, seconds = seconds, ms = ms)
    fun setUTCSeconds(seconds: Double, ms: Double? = null): Double = set(true, seconds = seconds, ms = ms)
    fun setUTCMilliseconds(ms: Double): Double = set(true, ms = ms)

    // Strings

    /** `toISOString()`: throws a RangeError for an invalid date. */
    fun toISOString(): String {
        if (time.isNaN()) throw JSException(JSRangeError("Invalid time value"))
        val y = yearFromTime(time)
        val ys = if (y in 0.0..9999.0) pad(y, 4) else (if (y < 0) "-" else "+") + pad(Math.abs(y), 6)
        return "$ys-${pad(monthFromTime(time) + 1)}-${pad(dateFromTime(time))}T${pad(hourFromTime(time))}:${pad(minFromTime(time))}:${pad(secFromTime(time))}.${pad(msFromTime(time), 3)}Z"
    }

    fun toJSON(): String? = if (time.isNaN()) null else toISOString()

    private fun zone(): String {
        val offset = -offsetMinutes(time)
        val name = TimeZone.getDefault().getDisplayName(LocalZone.isDaylight(nameTime(time)), TimeZone.LONG, Locale.US)
        val sign = if (offset < 0) "-" else "+"
        val a = Math.abs(offset)
        return "GMT$sign${pad((a / 60).toDouble())}${pad((a % 60).toDouble())} ($name)"
    }

    fun toDateString(): String {
        if (time.isNaN()) return "Invalid Date"
        val t = local(time)
        return "${days[weekDay(t).toInt()]} ${months[monthFromTime(t).toInt()]} ${pad(dateFromTime(t))} ${yearString(yearFromTime(t))}"
    }

    fun toTimeString(): String {
        if (time.isNaN()) return "Invalid Date"
        val t = local(time)
        return "${pad(hourFromTime(t))}:${pad(minFromTime(t))}:${pad(secFromTime(t))} ${zone()}"
    }

    override fun toString(): String = if (time.isNaN()) "Invalid Date" else "${toDateString()} ${toTimeString()}"

    fun toUTCString(): String {
        if (time.isNaN()) return "Invalid Date"
        val t = time
        return "${days[weekDay(t).toInt()]}, ${pad(dateFromTime(t))} ${months[monthFromTime(t).toInt()]} ${yearString(yearFromTime(t))} ${pad(hourFromTime(t))}:${pad(minFromTime(t))}:${pad(secFromTime(t))} GMT"
    }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "Date"

    companion object {
        /** `Date.now()`. */
        fun now(): Double = System.currentTimeMillis().toDouble()

        /** `Date.parse(text)`: the ISO format of §21.4.1.32, then V8's legacy formats; NaN when neither reads it. */
        fun parse(text: String): Double = JSDateParser(text).parse()

        /** `Date.UTC(...)`. */
        fun UTC(year: Double, month: Double = 0.0, day: Double = 1.0, hours: Double = 0.0, minutes: Double = 0.0, seconds: Double = 0.0, ms: Double = 0.0): Double =
            timeClip(makeDate(fullYear(year), month, day, hours, minutes, seconds, ms))

        private val days = arrayOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
        private val months = arrayOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

        private fun pad(v: Double, n: Int = 2): String = jsNumberToString(v).padStart(n, '0')
        private fun yearString(y: Double): String = if (y >= 0) pad(y, 4) else "-" + pad(-y, 4)

        private fun fullYear(year: Double): Double {
            if (year.isNaN()) return year
            val i = jsToIntegerOrInfinity(year)
            return if (i in 0.0..99.0) 1900 + i else year
        }
    }
}

// ECMA-262 date arithmetic (§21.4.1)

private const val msPerDay = 86_400_000.0

/** `a mod b` with the sign of `b`. */
internal fun jsModPositive(a: Double, b: Double): Double {
    val r = a % b
    return if (r < 0) r + b else r + 0.0
}

internal fun timeClip(t: Double): Double {
    if (t.isNaN() || t.isInfinite() || Math.abs(t) > 8.64e15) return Double.NaN
    return jsToIntegerOrInfinity(t) + 0.0
}

private fun day(t: Double): Double = Math.floor(t / msPerDay)
private fun timeWithinDay(t: Double): Double = jsModPositive(t, msPerDay)
private fun daysInYear(y: Double): Double = if (y % 4 != 0.0) 365.0 else if (y % 100 != 0.0) 366.0 else if (y % 400 != 0.0) 365.0 else 366.0
private fun dayFromYear(y: Double): Double = 365 * (y - 1970) + Math.floor((y - 1969) / 4) - Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400)

private fun yearFromTime(t: Double): Double {
    var y = Math.floor(t / (msPerDay * 365.2425)) + 1970
    while (dayFromYear(y) * msPerDay > t) y -= 1
    while (dayFromYear(y + 1) * msPerDay <= t) y += 1
    return y
}

private fun inLeapYear(t: Double): Boolean = daysInYear(yearFromTime(t)) == 366.0
private fun dayWithinYear(t: Double): Double = day(t) - dayFromYear(yearFromTime(t))
private val monthStarts = doubleArrayOf(0.0, 31.0, 59.0, 90.0, 120.0, 151.0, 181.0, 212.0, 243.0, 273.0, 304.0, 334.0, 365.0)

private fun monthFromTime(t: Double): Double {
    val d = dayWithinYear(t)
    val leap = if (inLeapYear(t)) 1.0 else 0.0
    for (m in 1..12) if (d < monthStarts[m] + (if (m >= 2) leap else 0.0)) return (m - 1).toDouble()
    return 11.0
}

private fun dateFromTime(t: Double): Double {
    val m = monthFromTime(t).toInt()
    val leap = if (inLeapYear(t)) 1.0 else 0.0
    return dayWithinYear(t) - monthStarts[m] - (if (m >= 2) leap else 0.0) + 1
}

private fun weekDay(t: Double): Double = jsModPositive(day(t) + 4, 7.0)
private fun hourFromTime(t: Double): Double = Math.floor(timeWithinDay(t) / 3_600_000)
private fun minFromTime(t: Double): Double = jsModPositive(Math.floor(t / 60_000), 60.0)
private fun secFromTime(t: Double): Double = jsModPositive(Math.floor(t / 1000), 60.0)
private fun msFromTime(t: Double): Double = jsModPositive(t, 1000.0)

private fun finite(vararg values: Double): Boolean = values.all { !it.isNaN() && !it.isInfinite() }

private fun makeDay(year: Double, month: Double, date: Double): Double {
    if (!finite(year, month, date)) return Double.NaN
    val y = jsToIntegerOrInfinity(year)
    val m = jsToIntegerOrInfinity(month)
    val dt = jsToIntegerOrInfinity(date)
    val ym = y + Math.floor(m / 12)
    if (Math.abs(ym) > 400_000) return Double.NaN
    val mn = jsModPositive(m, 12.0)
    val leap = if (daysInYear(ym) == 366.0) 1.0 else 0.0
    val firstOfMonth = dayFromYear(ym) + monthStarts[mn.toInt()] + (if (mn >= 2) leap else 0.0)
    return firstOfMonth + dt - 1
}

private fun makeTime(h: Double, m: Double, s: Double, ms: Double): Double {
    if (!finite(h, m, s, ms)) return Double.NaN
    return jsToIntegerOrInfinity(h) * 3_600_000 + jsToIntegerOrInfinity(m) * 60_000 + jsToIntegerOrInfinity(s) * 1000 + jsToIntegerOrInfinity(ms)
}

private fun makeDate(y: Double, mo: Double, d: Double, h: Double, mi: Double, s: Double, ms: Double): Double {
    val day = makeDay(y, mo, d)
    val time = makeTime(h, mi, s, ms)
    if (!finite(day, time)) return Double.NaN
    return day * msPerDay + time
}

// Time zone

/**
 * The default time zone's offsets. java.time's rules include the local mean time ICU (and so
 * V8) uses before a zone's first transition; java.util.TimeZone, the fallback where java.time
 * is missing (Android before API 26), starts at standard time.
 */
private object LocalZone {
    private val modern = try { Class.forName("java.time.zone.ZoneRules"); true } catch (e: Throwable) { false }
    private var id: String? = null
    private var rules: java.time.zone.ZoneRules? = null

    private fun rules(): java.time.zone.ZoneRules {
        val zone = TimeZone.getDefault()
        if (zone.id != id || rules == null) {
            rules = zone.toZoneId().rules
            id = zone.id
        }
        return rules!!
    }

    fun offset(t: Double): Double =
        if (modern) rules().getOffset(java.time.Instant.ofEpochMilli(t.toLong())).totalSeconds * 1000.0
        else TimeZone.getDefault().getOffset(t.toLong()).toDouble()

    fun isDaylight(t: Double): Boolean =
        if (modern) rules().isDaylightSavings(java.time.Instant.ofEpochMilli(t.toLong()))
        else TimeZone.getDefault().inDaylightTime(java.util.Date(t.toLong()))
}

/** The default time zone's offset from UTC at UTC time `t`, in milliseconds. */
private fun offsetAt(t: Double): Double = LocalZone.offset(t)

/**
 * The time V8 asks about daylight saving time for a zone name: outside 1970…2038 an equivalent
 * time in a year from 2008 on with the same leap-ness and starting weekday.
 */
private fun nameTime(t: Double): Double {
    if (t >= 0 && t <= 2_147_483_647_000.0) return t
    val y = yearFromTime(t)
    val weekDayOfJan1 = weekDay(makeDay(y, 0.0, 1.0) * msPerDay).toInt()
    val recent = (if (daysInYear(y) == 366.0) 1956 else 1967) + (weekDayOfJan1 * 12) % 28
    val equivalent = 2008 + (recent + 3 * 28 - 2008) % 28
    return makeDay(equivalent.toDouble(), monthFromTime(t), dateFromTime(t)) * msPerDay + timeWithinDay(t)
}

private fun offsetMinutes(t: Double): Long = (-offsetAt(t) / 60_000).toLong()

private fun local(t: Double): Double = t + offsetAt(t)

/**
 * UTC(t) for local time `t`: a local time skipped or repeated at a transition reads with the
 * offset in effect before it.
 */
private fun utcFromLocal(t: Double): Double {
    if (t.isNaN() || t.isInfinite() || Math.abs(t) > 8.64e15 + msPerDay) return Double.NaN
    val before = offsetAt(t - msPerDay)
    val after = offsetAt(t + msPerDay)
    if (before == after) return t - before
    val beforeValid = offsetAt(t - before) == before
    val afterValid = offsetAt(t - after) == after
    return if (afterValid && !beforeValid) t - after else t - before
}

/** V8's DateParser: the ES5 ISO format first, then the legacy formats of `toString`, `toUTCString` and common writing. */
private class JSDateParser(val s: String) {
    private class Token(val kind: Char, val text: String = "", val number: Long = 0, val length: Int = 0) {
        // kind: 'n' number, 'w' word, 's' symbol, ' ' whitespace, '?' unknown, 'e' end
        fun isSymbol(c: Char) = kind == 's' && text[0] == c
        fun isSign() = isSymbol('+') || isSymbol('-')
        fun isFixed(n: Int) = kind == 'n' && length == n
        val keyword: Keyword? get() = if (kind == 'w') keywords[if (text.length >= 3) text.substring(0, 3) else text]?.takeIf { text.length <= 3 || it.type == 'M' } else null
        fun isZ() = kind == 'w' && text == "z"
        fun isT() = kind == 'w' && text == "t"
    }

    private class Keyword(val type: Char, val value: Int)

    private var position = 0
    private var peeked: Token? = null

    private fun read(): Token {
        if (position >= s.length) return Token('e')
        val c = s[position]
        if (c in '0'..'9') {
            val start = position
            var n = 0L
            while (position < s.length && s[position] in '0'..'9') {
                if (position - start < 9) n = n * 10 + (s[position] - '0')
                position++
            }
            return Token('n', s.substring(start, position), n, position - start)
        }
        if (c.isLetter()) {
            val start = position
            while (position < s.length && s[position].isLetter()) position++
            return Token('w', s.substring(start, position).lowercase(Locale.ROOT))
        }
        if (jsIsWhitespace(c)) {
            while (position < s.length && jsIsWhitespace(s[position])) position++
            return Token(' ')
        }
        if (c == '(') {
            var depth = 0
            while (position < s.length) {
                if (s[position] == '(') depth++
                else if (s[position] == ')') { depth--; if (depth == 0) { position++; break } }
                position++
            }
            return Token('?')
        }
        position++
        return Token('s', c.toString())
    }

    private fun next(): Token = peeked?.also { peeked = null } ?: read()
    private fun peek(): Token = peeked ?: read().also { peeked = it }
    private fun skipSymbol(c: Char): Boolean = if (peek().isSymbol(c)) { next(); true } else false

    private val day = IntArray(3)
    private var dayIndex = 0
    private var namedMonth = -1
    private var isoDate = false
    private val timeParts = IntArray(4)
    private var timeIndex = 0
    private var hourOffset = -1
    private var tzSign = 0
    private var tzHour = -1
    private var tzMinute = -1

    private fun dayAdd(n: Int): Boolean { if (dayIndex >= 3) return false; day[dayIndex++] = n; return true }
    private fun timeAdd(n: Int): Boolean { if (timeIndex >= 4) return false; timeParts[timeIndex++] = n; return true }
    private fun timeAddFinal(n: Int): Boolean { if (!timeAdd(n)) return false; while (timeIndex < 4) timeParts[timeIndex++] = 0; return true }
    private fun timeExpecting(n: Int) = (timeIndex == 1 && n in 0..59) || (timeIndex == 2 && n in 0..59) || (timeIndex == 3 && n in 0..999)
    private fun tzSet(hours: Int) { tzSign = if (hours < 0) -1 else 1; tzHour = Math.abs(hours); tzMinute = 0 }
    private fun tzIsUTC() = tzHour == 0 && tzMinute == 0
    private fun tzExpecting(n: Int) = tzHour != -1 && tzMinute == -1 && n in 0..59

    private fun readMilliseconds(t: Token): Int {
        var number = t.number
        var length = minOf(t.length, 9)
        if (length == 1) number *= 100 else if (length == 2) number *= 10
        while (length > 3) { number /= 10; length-- }
        return number.toInt()
    }

    /** ParseES5DateTime: null when the text is invalid, else the first token the legacy parser handles. */
    private fun parseES5(): Token? {
        if (peek().isSign()) {
            val sign = next()
            if (!peek().isFixed(6)) return sign
            val year = next().number.toInt()
            if (sign.isSymbol('-') && year == 0) return sign
            dayAdd(if (sign.isSymbol('-')) -year else year)
        } else if (peek().isFixed(4)) {
            dayAdd(next().number.toInt())
        } else return next()
        if (skipSymbol('-')) {
            if (!peek().isFixed(2) || peek().number !in 1..12) return next()
            dayAdd(next().number.toInt())
            if (skipSymbol('-')) {
                if (!peek().isFixed(2) || peek().number !in 1..31) return next()
                dayAdd(next().number.toInt())
            }
        }
        if (!peek().isT()) {
            if (peek().kind != 'e') return next()
        } else {
            next()
            if (!peek().isFixed(2) || peek().number !in 0..24) return null
            val hourIs24 = peek().number == 24L
            timeAdd(next().number.toInt())
            if (!skipSymbol(':')) return null
            if (!peek().isFixed(2) || peek().number !in 0..59 || (hourIs24 && peek().number > 0)) return null
            timeAdd(next().number.toInt())
            if (skipSymbol(':')) {
                if (!peek().isFixed(2) || peek().number !in 0..59 || (hourIs24 && peek().number > 0)) return null
                timeAdd(next().number.toInt())
                if (skipSymbol('.')) {
                    if (peek().kind != 'n' || (hourIs24 && peek().number > 0)) return null
                    timeAdd(readMilliseconds(next()))
                }
            }
            if (peek().isZ()) {
                next()
                tzSet(0)
            } else if (peek().isSign()) {
                tzSign = if (next().isSymbol('+')) 1 else -1
                if (peek().isFixed(4)) {
                    val hm = next().number.toInt()
                    if (hm / 100 !in 0..23 || hm % 100 !in 0..59) return null
                    tzHour = hm / 100
                    tzMinute = hm % 100
                } else {
                    if (!peek().isFixed(2) || peek().number !in 0..23) return null
                    tzHour = next().number.toInt()
                    if (!skipSymbol(':')) return null
                    if (!peek().isFixed(2) || peek().number !in 0..59) return null
                    tzMinute = next().number.toInt()
                }
            }
            if (peek().kind != 'e') return null
        }
        if (tzHour == -1 && timeIndex == 0) tzSet(0)
        isoDate = true
        return Token('e')
    }

    fun parse(): Double {
        var token = parseES5() ?: return Double.NaN
        var hasReadNumber = dayIndex > 0
        while (token.kind != 'e') {
            if (token.kind == 'n') {
                hasReadNumber = true
                val n = token.number.toInt()
                if (skipSymbol(':')) {
                    if (skipSymbol(':')) {
                        if (timeIndex != 0) return Double.NaN
                        timeAdd(n)
                        timeAdd(0)
                    } else {
                        if (!timeAdd(n)) return Double.NaN
                        if (peek().isSymbol('.')) next()
                    }
                } else if (peek().isSymbol('.') && timeExpecting(n)) {
                    next()
                    timeAdd(n)
                    if (peek().kind != 'n') return Double.NaN
                    timeAddFinal(readMilliseconds(next()))
                } else if (tzExpecting(n)) {
                    tzMinute = n
                } else if (timeExpecting(n)) {
                    timeAddFinal(n)
                    val p = peek()
                    if (p.kind != 'e' && p.kind != ' ' && !p.isZ() && !p.isSign()) return Double.NaN
                } else {
                    if (!dayAdd(n)) return Double.NaN
                    skipSymbol('-')
                }
            } else if (token.kind == 'w') {
                val keyword = token.keyword
                if (keyword?.type == 'A' && timeIndex != 0) hourOffset = keyword.value
                else if (keyword?.type == 'M') { namedMonth = keyword.value; skipSymbol('-') }
                else if (keyword?.type == 'Z' && hasReadNumber) tzSet(keyword.value)
                else {
                    if (hasReadNumber) return Double.NaN
                    if (peek().kind == 'n') return Double.NaN
                }
            } else if (token.isSign() && (tzIsUTC() || timeIndex != 0)) {
                tzSign = if (token.isSymbol('+')) 1 else -1
                var n = 0
                var length = 0
                if (peek().kind == 'n') { val t = next(); length = t.length; n = t.number.toInt() }
                hasReadNumber = true
                if (peek().isSymbol(':')) { tzHour = n; tzMinute = -1 }
                else if (length == 1 || length == 2) { tzHour = n; tzMinute = 0 }
                else { tzHour = n / 100; tzMinute = n % 100 }
            } else if ((token.isSign() || token.isSymbol(')')) && hasReadNumber) {
                return Double.NaN
            }
            token = next()
        }
        return compose()
    }

    private fun compose(): Double {
        if (dayIndex < 1) return Double.NaN
        while (dayIndex < 3) day[dayIndex++] = 1
        var year: Int
        val month: Int
        val date: Int
        if (namedMonth == -1) {
            if (isoDate || day[0] !in 1..31) { year = day[0]; month = day[1]; date = day[2] }
            else { month = day[0]; date = day[1]; year = day[2] }
        } else {
            month = namedMonth
            if (day[0] !in 1..31) { year = day[0]; date = day[1] }
            else { date = day[0]; year = day[1] }
        }
        if (!isoDate) {
            if (year in 0..49) year += 2000 else if (year in 50..99) year += 1900
        }
        if (month !in 1..12 || date !in 1..31) return Double.NaN

        while (timeIndex < 4) timeParts[timeIndex++] = 0
        var hour = timeParts[0]
        val minute = timeParts[1]
        val second = timeParts[2]
        val ms = timeParts[3]
        if (hourOffset != -1) {
            if (hour !in 0..12) return Double.NaN
            hour = hour % 12 + hourOffset
        }
        if (hour !in 0..23 || minute !in 0..59 || second !in 0..59 || ms !in 0..999) {
            if (hour != 24 || minute != 0 || second != 0 || ms != 0) return Double.NaN
        }
        val t = makeDate(year.toDouble(), (month - 1).toDouble(), date.toDouble(), hour.toDouble(), minute.toDouble(), second.toDouble(), ms.toDouble())
        if (tzSign == 0 && tzHour == -1) return timeClip(utcFromLocal(t))
        val offset = (maxOf(tzHour, 0) * 3600.0 + maxOf(tzMinute, 0) * 60.0) * 1000 * (if (tzSign < 0) -1 else 1)
        return timeClip(t - offset)
    }

    companion object {
        private val keywords: Map<String, Keyword> = HashMap<String, Keyword>().apply {
            listOf("jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec").forEachIndexed { i, m -> put(m, Keyword('M', i + 1)) }
            put("am", Keyword('A', 0))
            put("pm", Keyword('A', 12))
            for (z in listOf("ut", "utc", "z", "gmt")) put(z, Keyword('Z', 0))
            put("cdt", Keyword('Z', -5)); put("cst", Keyword('Z', -6))
            put("edt", Keyword('Z', -4)); put("est", Keyword('Z', -5))
            put("mdt", Keyword('Z', -6)); put("mst", Keyword('Z', -7))
            put("pdt", Keyword('Z', -7)); put("pst", Keyword('Z', -8))
            put("t", Keyword('T', 0))
        }
    }
}
