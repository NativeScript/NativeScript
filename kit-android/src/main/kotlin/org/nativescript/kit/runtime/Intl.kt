package org.nativescript.kit

import java.util.Calendar
import java.util.GregorianCalendar
import java.util.Locale
import java.util.TimeZone

// ECMA-402 number and date formatting. The en-US locale is formatted from
// CLDR's data for it as ICU applies it (what Node prints), so it is the same
// on every platform; another locale goes to java.text's formatters, which
// Android backs with the platform's ICU and its CLDR data.

/** The locale a `locales` argument requests: its first tag, or the platform's. */
internal fun jsRequestedLocale(locales: Any?): String = when (val l = jsBox(locales)) {
    is String -> l
    is JSArray<*> -> if (l.storage.isNotEmpty()) jsToString(l.storage[0]) else Locale.getDefault().toLanguageTag()
    else -> Locale.getDefault().toLanguageTag()
}

/** Whether a locale formats with the en-US data this file carries. */
internal fun jsIsEnUS(tag: String): Boolean {
    val t = tag.lowercase()
    return t == "en" || t == "en-us" || t.startsWith("en-us-")
}

private fun option(options: Any?, key: String): Any? {
    val o = jsBox(options) ?: return null
    if (o === JSNull) return null
    return jsBox(jsField(o, key))
}

private fun stringOption(options: Any?, key: String, allowed: List<String>, fallback: String?): String? {
    val v = option(options, key) ?: return fallback
    val s = jsToString(v)
    if (allowed.isNotEmpty() && s !in allowed) throw JSException(JSRangeError("Value $s out of range for Intl.NumberFormat options property $key"))
    return s
}

private fun numberOption(options: Any?, key: String, min: Int, max: Int, fallback: Int?): Int? {
    val v = option(options, key) ?: return fallback
    val n = jsToNumber(v)
    if (n.isNaN() || n < min || n > max) throw JSException(JSRangeError("$key value is out of range."))
    return Math.floor(n).toInt()
}

/** A non-negative decimal as digits d₁d₂… with value 0.d₁d₂… × 10^point. */
internal class JSDecimalDigits(var digits: MutableList<Int>, var point: Int) {
    val isZero: Boolean get() = digits.isEmpty()
    /** The position of the leading digit (1 for 1…9, 0 for 0.1…0.9). */
    val magnitude: Int get() = if (isZero) 0 else point - 1

    fun copy() = JSDecimalDigits(digits.toMutableList(), point)
    fun shift(k: Int) { if (!isZero) point += k }

    /** Rounds half away from zero, keeping `kept` digits from the first. */
    fun round(kept: Int) {
        if (kept >= digits.size) return
        if (kept < 0) { digits = mutableListOf(); point = 0; return }
        val up = digits[kept] >= 5
        while (digits.size > kept) digits.removeAt(digits.size - 1)
        if (up) {
            var i = digits.size - 1
            while (i >= 0) {
                if (digits[i] == 9) { digits[i] = 0; i-- } else { digits[i]++; break }
            }
            if (i < 0) { digits.add(0, 1); point++ }
        }
        while (digits.isNotEmpty() && digits.last() == 0) digits.removeAt(digits.size - 1)
        if (digits.isEmpty()) point = 0
    }

    fun roundFraction(maxFraction: Int) = round(point + maxFraction)
    fun roundSignificant(maxSignificant: Int) = round(maxSignificant)

    val integerDigits: List<Int> get() = if (point <= 0) listOf(0) else (0 until point).map { if (it < digits.size) digits[it] else 0 }

    /** The digits after the point, `-point` leading zeros first when the value is below 0.1. */
    val fraction: List<Int>
        get() = when {
            point >= digits.size -> emptyList()
            point >= 0 -> digits.subList(point, digits.size).toList()
            else -> List(-point) { 0 } + digits
        }

    companion object {
        fun of(value: Double): JSDecimalDigits {
            if (value == 0.0) return JSDecimalDigits(mutableListOf(), 0)
            val (digits, n) = jsShortestDigits(value)
            return JSDecimalDigits(digits.map { it - '0' }.toMutableList(), n)
        }
    }
}

/** What the en-US data says about a currency: its symbols, digits and names. */
private class JSCurrency(val symbol: String, val narrow: String, val digits: Int, val one: String, val other: String)

private val currencies = mapOf(
    "USD" to JSCurrency("$", "$", 2, "US dollar", "US dollars"),
    "EUR" to JSCurrency("€", "€", 2, "euro", "euros"),
    "GBP" to JSCurrency("£", "£", 2, "British pound", "British pounds"),
    "JPY" to JSCurrency("¥", "¥", 0, "Japanese yen", "Japanese yen"),
    "CNY" to JSCurrency("CN¥", "¥", 2, "Chinese yuan", "Chinese yuan"),
    "CAD" to JSCurrency("CA$", "$", 2, "Canadian dollar", "Canadian dollars"),
    "AUD" to JSCurrency("A$", "$", 2, "Australian dollar", "Australian dollars"),
    "INR" to JSCurrency("₹", "₹", 2, "Indian rupee", "Indian rupees"),
    "KRW" to JSCurrency("₩", "₩", 0, "South Korean won", "South Korean won"),
    "BRL" to JSCurrency("R$", "R$", 2, "Brazilian real", "Brazilian reals"),
    "MXN" to JSCurrency("MX$", "$", 2, "Mexican peso", "Mexican pesos"),
    "CHF" to JSCurrency("CHF", "CHF", 2, "Swiss franc", "Swiss francs"),
    "SEK" to JSCurrency("SEK", "kr", 2, "Swedish krona", "Swedish kronor"),
    "NZD" to JSCurrency("NZ$", "$", 2, "New Zealand dollar", "New Zealand dollars"),
)

/** `Intl.NumberFormat`. */
class JSNumberFormat(locales: Any? = null, options: Any? = null) : JSDynamic {
    private val locale: String = jsRequestedLocale(locales).let { if (jsIsEnUS(it)) "en-US" else it }
    private val style: String = stringOption(options, "style", listOf("decimal", "percent", "currency", "unit"), "decimal")!!
    private val currency: String? = stringOption(options, "currency", emptyList(), null)?.uppercase()
    private val currencyDisplay = stringOption(options, "currencyDisplay", listOf("symbol", "narrowSymbol", "code", "name"), "symbol")!!
    private val currencySign = stringOption(options, "currencySign", listOf("standard", "accounting"), "standard")!!
    private val notation = stringOption(options, "notation", listOf("standard", "scientific", "engineering", "compact"), "standard")!!
    private val compactDisplay = stringOption(options, "compactDisplay", listOf("short", "long"), "short")!!
    private val signDisplay = stringOption(options, "signDisplay", listOf("auto", "never", "always", "exceptZero", "negative"), "auto")!!
    private val useGrouping: String = when (val g = option(options, "useGrouping")) {
        null -> if (notation == "compact") "min2" else "auto"
        is Boolean -> if (g) "always" else "false"
        else -> jsToString(g).let { if (it == "false" || it.isEmpty()) "false" else it }
    }
    private val minimumIntegerDigits = numberOption(options, "minimumIntegerDigits", 1, 21, 1)!!
    private val minimumFractionDigits: Int?
    private val maximumFractionDigits: Int?
    private val minimumSignificantDigits: Int?
    private val maximumSignificantDigits: Int?
    /** No digit options: compact notation's own rounding applies. */
    private val compactRounding: Boolean

    init {
        if (style == "currency" && currency == null) throw JSException(JSTypeError("Currency code is required with currency style."))
        val minSD = numberOption(options, "minimumSignificantDigits", 1, 21, null)
        val maxSD = numberOption(options, "maximumSignificantDigits", 1, 21, null)
        val minFD = numberOption(options, "minimumFractionDigits", 0, 100, null)
        val maxFD = numberOption(options, "maximumFractionDigits", 0, 100, null)
        if (minSD != null || maxSD != null) {
            minimumSignificantDigits = minSD ?: 1
            maximumSignificantDigits = maxOf(maxSD ?: 21, minSD ?: 1)
            minimumFractionDigits = null
            maximumFractionDigits = null
            compactRounding = false
        } else {
            minimumSignificantDigits = null
            maximumSignificantDigits = null
            val currencyDigits = currency?.let { currencies[it]?.digits ?: 2 } ?: 2
            val defaultMin = if (style == "currency" && notation != "compact") currencyDigits else 0
            val defaultMax = if (style == "currency" && notation != "compact") maxOf(defaultMin, currencyDigits) else if (style == "percent") defaultMin else maxOf(defaultMin, if (notation == "compact") 0 else 3)
            compactRounding = notation == "compact" && minFD == null && maxFD == null
            if (minFD != null && maxFD != null && minFD > maxFD) throw JSException(JSRangeError("maximumFractionDigits value is out of range."))
            val lo = minFD ?: minOf(defaultMin, maxFD ?: defaultMin)
            minimumFractionDigits = lo
            maximumFractionDigits = maxFD ?: maxOf(defaultMax, lo)
        }
    }

    /** `format(value)`. */
    fun format(value: Any?): String = formatNumber(jsToNumber(value))

    internal fun formatNumber(x: Double): String {
        if (!jsIsEnUS(locale)) return platformFormat(x)
        val negative = !x.isNaN() && (x < 0 || (x == 0.0 && 1.0 / x < 0))
        var body: String
        var isZero = false
        if (x.isNaN()) body = "NaN"
        else if (x.isInfinite()) body = "∞"
        else {
            var d = JSDecimalDigits.of(Math.abs(x))
            if (style == "percent") d.shift(2)
            when (notation) {
                "scientific", "engineering" -> { val (text, rounded) = scientific(d, notation == "engineering"); body = text; d = rounded }
                "compact" -> { val (text, rounded) = compact(d); body = text; d = rounded }
                else -> { roundDigits(d); body = layout(d) }
            }
            isZero = d.isZero
        }
        if (style == "percent") body += "%"
        if (style == "currency" && currency != null) body = currencyText(body, currency, x)
        val (showMinus, showPlus) = when (signDisplay) {
            "never" -> Pair(false, false)
            "always" -> Pair(negative, !negative && !x.isNaN())
            "exceptZero" -> Pair(negative && !isZero, !negative && !isZero && !x.isNaN())
            "negative" -> Pair(negative && !isZero, false)
            else -> Pair(negative, false)
        }
        if (showMinus && style == "currency" && currencySign == "accounting") return "($body)"
        return (if (showMinus) "-" else if (showPlus) "+" else "") + body
    }

    private fun roundDigits(d: JSDecimalDigits) {
        val maxSD = maximumSignificantDigits
        if (maxSD != null) d.roundSignificant(maxSD) else d.roundFraction(maximumFractionDigits ?: 3)
    }

    /** Integer digits grouped as en-US groups them, and the fraction padded to its minimum. */
    private fun layout(d: JSDecimalDigits, grouping: Boolean = true): String {
        val integer = d.integerDigits.toMutableList()
        while (integer.size < minimumIntegerDigits) integer.add(0, 0)
        val fraction = d.fraction.toMutableList()
        val minSD = minimumSignificantDigits
        if (minSD != null) {
            val have = if (d.isZero) 1 else if (d.point > 0) maxOf(d.point, d.digits.size) else d.digits.size
            if (have < minSD) repeat(minSD - have) { fraction.add(0) }
        } else {
            while (fraction.size < (minimumFractionDigits ?: 0)) fraction.add(0)
        }
        var intText = integer.joinToString("")
        val group = grouping && (useGrouping == "always" || useGrouping == "auto" || useGrouping == "true" || (useGrouping == "min2" && integer.size >= 5))
        if (group && intText.length > 3) {
            val out = StringBuilder()
            for ((i, c) in intText.withIndex()) {
                if (i > 0 && (intText.length - i) % 3 == 0) out.append(',')
                out.append(c)
            }
            intText = out.toString()
        }
        return if (fraction.isEmpty()) intText else intText + "." + fraction.joinToString("")
    }

    private fun scientific(d: JSDecimalDigits, engineering: Boolean): Pair<String, JSDecimalDigits> {
        if (d.isZero) return Pair(layout(d) + "E0", d)
        var exponent = d.magnitude
        if (engineering) exponent = Math.floorDiv(exponent, 3) * 3
        var mantissa = d.copy().also { it.point -= exponent }
        roundDigits(mantissa)
        if (mantissa.magnitude >= (if (engineering) 3 else 1)) {
            exponent += if (engineering) 3 else 1
            mantissa = d.copy().also { it.point -= exponent }
            roundDigits(mantissa)
        }
        return Pair(layout(mantissa, false) + "E" + exponent, mantissa)
    }

    private fun compact(d: JSDecimalDigits): Pair<String, JSDecimalDigits> {
        val units = if (compactDisplay == "long") listOf("", " thousand", " million", " billion", " trillion") else listOf("", "K", "M", "B", "T")
        fun scaled(magnitude: Int): Pair<JSDecimalDigits, Int> {
            val level = if (magnitude < 3) 0 else minOf(magnitude / 3, 4)
            val s = d.copy().also { it.shift(-level * 3) }
            if (compactRounding) {
                if (s.isZero || s.point < 2) s.roundSignificant(2) else s.roundFraction(0)
            } else roundDigits(s)
            return Pair(s, level)
        }
        var (s, level) = scaled(d.magnitude)
        if (s.magnitude >= 3 && level < 4) { val again = scaled(s.magnitude + level * 3); s = again.first; level = again.second }
        return Pair(layout(s) + units[level], s)
    }

    private fun currencyText(number: String, code: String, x: Double): String {
        val data = currencies[code]
        return when (currencyDisplay) {
            "code" -> "$code $number"
            "name" -> "$number ${if (Math.abs(x) == 1.0 && !number.contains('.')) data?.one ?: code else data?.other ?: code}"
            "narrowSymbol" -> (data?.narrow ?: code) + number
            else -> {
                val symbol = data?.symbol ?: code
                if (symbol.length > 1 && symbol.all { it.isLetter() }) "$symbol $number" else symbol + number
            }
        }
    }

    /** Another locale: java.text's formatter with the same options. */
    private fun platformFormat(x: Double): String {
        val l = Locale.forLanguageTag(locale)
        val f = when (style) {
            "percent" -> java.text.NumberFormat.getPercentInstance(l)
            "currency" -> java.text.NumberFormat.getCurrencyInstance(l).also { f -> currency?.let { f.currency = java.util.Currency.getInstance(it) } }
            else -> java.text.NumberFormat.getNumberInstance(l)
        }
        f.minimumIntegerDigits = minimumIntegerDigits
        minimumFractionDigits?.let { f.minimumFractionDigits = it }
        maximumFractionDigits?.let { f.maximumFractionDigits = it }
        f.isGroupingUsed = useGrouping != "false"
        f.roundingMode = java.math.RoundingMode.HALF_UP
        return f.format(x)
    }

    /** `resolvedOptions()`. */
    fun resolvedOptions(): JSObject {
        val entries = mutableListOf<Pair<String, Any?>>(Pair("locale", locale), Pair("numberingSystem", "latn"), Pair("style", style))
        if (currency != null) entries += listOf(Pair("currency", currency), Pair("currencyDisplay", currencyDisplay), Pair("currencySign", currencySign))
        entries += Pair("minimumIntegerDigits", minimumIntegerDigits.toDouble())
        if (minimumFractionDigits != null && maximumFractionDigits != null) entries += listOf(Pair("minimumFractionDigits", minimumFractionDigits.toDouble()), Pair("maximumFractionDigits", maximumFractionDigits.toDouble()))
        if (minimumSignificantDigits != null && maximumSignificantDigits != null) entries += listOf(Pair("minimumSignificantDigits", minimumSignificantDigits.toDouble()), Pair("maximumSignificantDigits", maximumSignificantDigits.toDouble()))
        entries += listOf(Pair("useGrouping", if (useGrouping == "false") false else useGrouping), Pair("notation", notation))
        if (notation == "compact") entries += Pair("compactDisplay", compactDisplay)
        entries += listOf(Pair("signDisplay", signDisplay), Pair("roundingIncrement", 1.0), Pair("roundingMode", "halfExpand"), Pair("roundingPriority", "auto"), Pair("trailingZeroDisplay", "auto"))
        return JSObject(entries)
    }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "NumberFormat"
}

/** `number.toLocaleString(locales, options)`. */
fun jsNumberToLocaleString(x: Double, locales: Any? = null, options: Any? = null): String = JSNumberFormat(locales, options).formatNumber(x)

private val months = listOf("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
private val weekdays = listOf("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")

/** CLDR's en `availableFormats` for dates, by skeleton (month `M` numeric, `MMM` short, `MMMM` long). */
private val dateSkeletons = mapOf(
    "y" to "y", "yM" to "M/y", "yMd" to "M/d/y", "yMEd" to "E, M/d/y", "yMMM" to "MMM y", "yMMMd" to "MMM d, y", "yMMMEd" to "E, MMM d, y",
    "yMMMM" to "MMMM y", "M" to "L", "Md" to "M/d", "MEd" to "E, M/d", "MMM" to "LLL", "MMMd" to "MMM d", "MMMEd" to "E, MMM d", "MMMMd" to "MMMM d",
    "d" to "d", "Ed" to "d E", "E" to "ccc", "Gy" to "y G", "GyMMM" to "MMM y G", "GyMMMd" to "MMM d, y G", "GyMMMEd" to "E, MMM d, y G", "GyMd" to "M/d/y G",
)

/** CLDR's en `availableFormats` for times (`h` stands for the hour of a 12-hour clock, `H` a 24-hour one). */
private val timeSkeletons = mapOf("h" to "h a", "H" to "HH", "hm" to "h:mm a", "Hm" to "HH:mm", "hms" to "h:mm:ss a", "Hms" to "HH:mm:ss", "ms" to "mm:ss", "m" to "m", "s" to "s")

/** `Intl.DateTimeFormat`; `required`/`defaults` as ToDateTimeOptions takes them. */
class JSDateTimeFormat(locales: Any? = null, options: Any? = null, required: String = "any", defaults: String = "date") : JSDynamic {
    private val locale: String = jsRequestedLocale(locales).let { if (jsIsEnUS(it)) "en-US" else it }
    private val timeZone: TimeZone
    private val timeZoneId: String
    private val hourCycle: String?
    private val dateStyle: String?
    private val timeStyle: String?
    private val components = mutableListOf<Pair<String, Any?>>()
    private val pattern: String

    init {
        val zone = option(options, "timeZone")?.let { jsToString(it) }
        if (zone != null) {
            val utc = zone.uppercase() == "UTC" || zone.uppercase() == "GMT"
            val tz = TimeZone.getTimeZone(if (utc) "UTC" else zone)
            if (!utc && tz.id == "GMT" && zone != "GMT") throw JSException(JSRangeError("Invalid time zone specified: $zone"))
            timeZone = tz
            timeZoneId = if (utc) "UTC" else tz.id
        } else {
            timeZone = TimeZone.getDefault()
            timeZoneId = timeZone.id
        }
        val get = { k: String -> option(options, k)?.let { jsToString(it) } }
        dateStyle = get("dateStyle")
        timeStyle = get("timeStyle")
        val hour12 = option(options, "hour12")?.let { jsTruthy(it) }
        var cycle = get("hourCycle")
        if (hour12 != null) cycle = if (hour12) "h12" else "h23"
        val fields = HashMap<String, String>()
        for (k in listOf("weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZoneName", "fractionalSecondDigits")) get(k)?.let { fields[k] = it }
        // ToDateTimeOptions: the fields a call formats when the options name none it requires.
        val hasDate = listOf("weekday", "year", "month", "day").any { fields[it] != null }
        val hasTime = listOf("hour", "minute", "second", "fractionalSecondDigits").any { fields[it] != null }
        val needDefaults = dateStyle == null && timeStyle == null && !((required == "date" || required == "any") && hasDate) && !((required == "time" || required == "any") && hasTime)
        if (needDefaults) {
            if (defaults == "date" || defaults == "all") { fields["year"] = "numeric"; fields["month"] = "numeric"; fields["day"] = "numeric" }
            if (defaults == "time" || defaults == "all") { fields["hour"] = "numeric"; fields["minute"] = "numeric"; fields["second"] = "numeric" }
            // ICU keeps the locale's 12-hour clock for the clock these defaults add, whatever hourCycle asks.
            if (hour12 == null && (cycle == "h11" || cycle == "h24") && (defaults == "time" || defaults == "all")) cycle = null
        }
        hourCycle = cycle
        if (fields["hour"] != null || timeStyle != null) {
            components += Pair("hourCycle", cycle ?: "h12")
            components += Pair("hour12", (cycle ?: "h12") == "h12" || cycle == "h11")
        }
        for (k in listOf("weekday", "era", "year", "month", "day", "hour", "minute", "second", "fractionalSecondDigits", "timeZoneName")) {
            fields[k]?.let { components += Pair(k, if (k == "fractionalSecondDigits") it.toDouble() else it) }
        }
        pattern = resolvePattern(fields)
    }

    private val twelveHour: Boolean get() = hourCycle == null || hourCycle == "h12" || hourCycle == "h11"

    private fun hourLetter(twelve: Boolean): String = when (hourCycle) {
        "h11" -> "K"
        "h24" -> "k"
        else -> if (twelve) "h" else "H"
    }

    private fun resolvePattern(f: Map<String, String>): String {
        if (dateStyle != null || timeStyle != null) {
            val datePattern = dateStyle?.let { mapOf("full" to "EEEE, MMMM d, y", "long" to "MMMM d, y", "medium" to "MMM d, y", "short" to "M/d/yy")[it] ?: "M/d/yy" }
            val timePattern = timeStyle?.let {
                val base = mapOf("full" to "h:mm:ss a zzzz", "long" to "h:mm:ss a z", "medium" to "h:mm:ss a", "short" to "h:mm a")[it] ?: "h:mm a"
                if (twelveHour) base.replace("h", hourLetter(true)) else base.replace(" a", "").replace("h", if (hourLetter(false) == "H") "HH" else hourLetter(false))
            }
            if (datePattern != null && timePattern != null) return if (dateStyle == "full" || dateStyle == "long") "$datePattern 'at' $timePattern" else "$datePattern, $timePattern"
            return datePattern ?: timePattern!!
        }
        var dateKey = ""
        if (f["era"] != null) dateKey += "G"
        if (f["year"] != null) dateKey += "y"
        val month = f["month"]
        val textMonth = month == "short" || month == "long" || month == "narrow"
        if (month != null) dateKey += if (textMonth) (if (month == "long") "MMMM" else "MMM") else "M"
        if (f["weekday"] != null) dateKey += "E"
        if (f["day"] != null) dateKey += "d"
        var datePattern: String? = null
        if (dateKey.isNotEmpty()) {
            val p = dateSkeletons[dateKey] ?: dateSkeletons[dateKey.replace("MMMM", "MMM")] ?: dateKey.toList().joinToString(" ")
            datePattern = adjust(p, f)
        }
        var timePattern: String? = null
        val twelve = twelveHour
        var timeKey = ""
        if (f["hour"] != null) timeKey += if (twelve) "h" else "H"
        if (f["minute"] != null) timeKey += "m"
        if (f["second"] != null || f["fractionalSecondDigits"] != null) timeKey += "s"
        if (timeKey.isNotEmpty()) {
            var p = timeSkeletons[timeKey] ?: timeKey
            f["fractionalSecondDigits"]?.toIntOrNull()?.let { n -> p = if (p.contains("ss")) p.replace("ss", "ss." + "S".repeat(n)) else p.replace("s", "s." + "S".repeat(n)) }
            if (f["hour"] == "2-digit" && twelve) p = p.replace("h", "hh")
            p = p.replace(if (twelve) "h" else "H", hourLetter(twelve))
            timePattern = p
        }
        f["timeZoneName"]?.let { zone ->
            val z = mapOf("short" to "z", "long" to "zzzz", "shortOffset" to "O", "longOffset" to "OOOO", "shortGeneric" to "v", "longGeneric" to "vvvv")[zone] ?: "z"
            if (timePattern != null) timePattern = "$timePattern $z" else if (datePattern != null) datePattern = "$datePattern, $z" else timePattern = z
        }
        val d = datePattern ?: return timePattern ?: ""
        val t = timePattern ?: return d
        if (dateKey == "E") return "$d $t"
        if (month == "long") return "$d 'at' $t"
        return "$d, $t"
    }

    /** Widens a skeleton's pattern to the widths the options ask for. */
    private fun adjust(pattern: String, f: Map<String, String>): String {
        val out = StringBuilder()
        var i = 0
        while (i < pattern.length) {
            val c = pattern[i]
            if (c == '\'') {
                var j = i + 1
                while (j < pattern.length && pattern[j] != '\'') j++
                out.append(pattern, i, minOf(j + 1, pattern.length))
                i = j + 1
                continue
            }
            var j = i
            while (j < pattern.length && pattern[j] == c) j++
            val run = j - i
            when (c) {
                'y' -> out.append(if (f["year"] == "2-digit") "yy" else "y")
                'M', 'L' -> out.append(c.toString().repeat(when (f["month"]) { "2-digit" -> 2; "numeric" -> 1; "short" -> 3; "long" -> 4; "narrow" -> 5; else -> run }))
                'd' -> out.append(if (f["day"] == "2-digit") "dd" else "d")
                'E', 'c' -> out.append(c.toString().repeat(when (f["weekday"]) { "long" -> 4; "narrow" -> 5; else -> 3 }))
                'G' -> out.append(when (f["era"]) { "long" -> "GGGG"; "narrow" -> "GGGGG"; else -> "G" })
                else -> out.append(c.toString().repeat(run))
            }
            i = j
        }
        return out.toString()
    }

    /** `format(date)`. */
    fun format(date: Any? = null): String {
        val t = when (val v = jsBox(date)) {
            null -> System.currentTimeMillis().toDouble()
            is JSDate -> v.time
            else -> jsToNumber(v)
        }
        if (t.isNaN() || t.isInfinite()) throw JSException(JSRangeError("Invalid time value"))
        return formatTime(t)
    }

    internal fun formatTime(t: Double): String {
        if (!jsIsEnUS(locale)) return platformFormat(t)
        val ms = Math.floor(t).toLong()
        val c = GregorianCalendar(timeZone, Locale.US)
        c.gregorianChange = java.util.Date(Long.MIN_VALUE)
        c.timeInMillis = ms
        val millis = Math.floorMod(ms, 1000L).toInt()
        val hour = c.get(Calendar.HOUR_OF_DAY)
        fun pad(n: Int, width: Int): String = n.toString().padStart(width, '0')
        val out = StringBuilder()
        var i = 0
        while (i < pattern.length) {
            val ch = pattern[i]
            if (ch == '\'') {
                var j = i + 1
                while (j < pattern.length && pattern[j] != '\'') { out.append(pattern[j]); j++ }
                i = j + 1
                continue
            }
            if (!ch.isLetter()) { out.append(ch); i++; continue }
            var j = i
            while (j < pattern.length && pattern[j] == ch) j++
            val n = j - i
            val era = c.get(Calendar.ERA)
            val year = c.get(Calendar.YEAR)
            when (ch) {
                'G' -> out.append(if (era == GregorianCalendar.AD) (if (n == 4) "Anno Domini" else if (n == 5) "A" else "AD") else (if (n == 4) "Before Christ" else if (n == 5) "B" else "BC"))
                'y' -> out.append(if (n == 2) pad(year % 100, 2) else year.toString())
                'M', 'L' -> {
                    val m = c.get(Calendar.MONTH)
                    out.append(when (n) { 1 -> (m + 1).toString(); 2 -> pad(m + 1, 2); 3 -> months[m].substring(0, 3); 4 -> months[m]; else -> months[m].substring(0, 1) })
                }
                'd' -> out.append(pad(c.get(Calendar.DAY_OF_MONTH), n))
                'E', 'c' -> {
                    val w = weekdays[c.get(Calendar.DAY_OF_WEEK) - 1]
                    out.append(if (n >= 5) w.substring(0, 1) else if (n == 4) w else w.substring(0, 3))
                }
                'h' -> out.append(pad(if (hour % 12 == 0) 12 else hour % 12, n))
                'K' -> out.append(pad(hour % 12, n))
                'H' -> out.append(pad(hour, n))
                'k' -> out.append(pad(if (hour == 0) 24 else hour, n))
                'm' -> out.append(pad(c.get(Calendar.MINUTE), n))
                's' -> out.append(pad(c.get(Calendar.SECOND), n))
                'S' -> out.append(pad(millis, 3).take(n) + "0".repeat(maxOf(0, n - 3)))
                'a' -> out.append(if (hour < 12) "AM" else "PM")
                'z', 'v' -> out.append(zoneName(ms, n >= 4))
                'O' -> out.append(offsetName(ms, n >= 4))
                else -> out.append(ch.toString().repeat(n))
            }
            i = j
        }
        return out.toString()
    }

    private fun zoneName(ms: Long, long: Boolean): String {
        if (timeZoneId == "UTC") return if (long) "Coordinated Universal Time" else "UTC"
        // ICU's zone names start in 1970; before, a zone is its offset from GMT.
        if (ms < 0) return offsetName(ms, long)
        val dst = timeZone.inDaylightTime(java.util.Date(ms))
        if (long) return timeZone.getDisplayName(dst, TimeZone.LONG, Locale.US)
        val short = timeZone.getDisplayName(dst, TimeZone.SHORT, Locale.US)
        return if (short.startsWith("GMT") || short.startsWith("UTC") || !timeZone.id.startsWith("America/")) offsetName(ms, false) else short
    }

    private fun offsetName(ms: Long, long: Boolean): String {
        val seconds = timeZone.getOffset(ms) / 1000
        if (seconds == 0) return "GMT"
        val sign = if (seconds < 0) "-" else "+"
        val h = Math.abs(seconds) / 3600
        val m = Math.abs(seconds) % 3600 / 60
        if (long) return "GMT$sign${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}"
        return if (m == 0) "GMT$sign$h" else "GMT$sign$h:${m.toString().padStart(2, '0')}"
    }

    /** Another locale: java.text's formatter for the styles, or the en-US pattern in that locale's words. */
    private fun platformFormat(t: Double): String {
        val l = Locale.forLanguageTag(locale)
        val style = { s: String? -> when (s) { "full" -> java.text.DateFormat.FULL; "long" -> java.text.DateFormat.LONG; "medium" -> java.text.DateFormat.MEDIUM; else -> java.text.DateFormat.SHORT } }
        val f = when {
            dateStyle != null && timeStyle != null -> java.text.DateFormat.getDateTimeInstance(style(dateStyle), style(timeStyle), l)
            dateStyle != null -> java.text.DateFormat.getDateInstance(style(dateStyle), l)
            timeStyle != null -> java.text.DateFormat.getTimeInstance(style(timeStyle), l)
            else -> java.text.SimpleDateFormat(pattern.replace("c", "E").replace("L", "M"), l)
        }
        f.timeZone = timeZone
        return f.format(java.util.Date(Math.floor(t).toLong()))
    }

    /** `resolvedOptions()`. */
    fun resolvedOptions(): JSObject {
        val entries = mutableListOf<Pair<String, Any?>>(Pair("locale", locale), Pair("calendar", "gregory"), Pair("numberingSystem", "latn"), Pair("timeZone", timeZoneId))
        entries += components
        dateStyle?.let { entries += Pair("dateStyle", it) }
        timeStyle?.let { entries += Pair("timeStyle", it) }
        return JSObject(entries)
    }

    override fun jsGet(key: String): Any? = null
    override fun jsSet(key: String, value: Any?) {}
    override val jsKeys: List<String> get() = emptyList()
    override val jsClassName: String? get() = "DateTimeFormat"
}

/** `date.toLocaleString(locales, options)`: date and time. */
fun JSDate.toLocaleString(locales: Any? = null, options: Any? = null): String =
    if (time.isNaN()) "Invalid Date" else JSDateTimeFormat(locales, options, "any", "all").formatTime(time)

/** `date.toLocaleDateString(locales, options)`. */
fun JSDate.toLocaleDateString(locales: Any? = null, options: Any? = null): String {
    if (time.isNaN()) return "Invalid Date"
    if (option(options, "timeStyle") != null) throw JSException(JSTypeError("Invalid option : timeStyle"))
    return JSDateTimeFormat(locales, options, "date", "date").formatTime(time)
}

/** `date.toLocaleTimeString(locales, options)`. */
fun JSDate.toLocaleTimeString(locales: Any? = null, options: Any? = null): String {
    if (time.isNaN()) return "Invalid Date"
    if (option(options, "dateStyle") != null) throw JSException(JSTypeError("Invalid option : dateStyle"))
    return JSDateTimeFormat(locales, options, "time", "time").formatTime(time)
}
