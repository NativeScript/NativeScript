import Foundation

// ECMA-402 number and date formatting. The en-US locale is formatted from
// CLDR's data for it as ICU applies it (what Node prints), so it is the same
// on every platform; another locale goes to Foundation's formatters, which
// use the platform's ICU and its CLDR data.

/// The locale a `locales` argument requests: its first tag, or the platform's.
func jsRequestedLocale(_ locales: Any?) -> String {
    switch jsFlat(locales) {
    case let tag as String: return tag
    case let list as JSArrayProtocol where list.jsLength > 0: return jsToString(list.jsElement(at: 0))
    default:
        let current = Locale.current
        let language = current.language.languageCode?.identifier ?? "en"
        let region = current.region?.identifier
        return region.map { "\(language)-\($0)" } ?? language
    }
}

/// Whether a locale formats with the en-US data this file carries.
func jsIsEnUS(_ tag: String) -> Bool {
    let t = tag.lowercased()
    return t == "en" || t == "en-us" || t.hasPrefix("en-us-")
}

private func jsOption(_ options: Any?, _ key: String) -> Any? {
    guard let o = jsFlat(options), !(o is JSNull) else { return nil }
    return jsField(o, key)
}

private func jsStringOption(_ options: Any?, _ key: String, _ allowed: [String], _ fallback: String?) throws -> String? {
    guard let v = jsFlat(jsOption(options, key)) else { return fallback }
    let s = jsToString(v)
    if !allowed.isEmpty && !allowed.contains(s) { throw JSException(JSRangeError("Value \(s) out of range for Intl.NumberFormat options property \(key)")) }
    return s
}

private func jsNumberOption(_ options: Any?, _ key: String, _ min: Int, _ max: Int, _ fallback: Int?) throws -> Int? {
    guard let v = jsFlat(jsOption(options, key)) else { return fallback }
    let n = jsToNumber(v)
    if n.isNaN || n < Double(min) || n > Double(max) { throw JSException(JSRangeError("\(key) value is out of range.")) }
    return Int(n.rounded(.down))
}

// MARK: - Decimal digits

/// A non-negative decimal as digits d₁d₂… with value 0.d₁d₂… × 10^point.
struct JSDecimalDigits {
    var digits: [UInt8]
    var point: Int

    init(_ value: Double) {
        if value == 0 { digits = []; point = 0; return }
        let (d, n) = jsShortestDigits(value)
        digits = d
        point = n
    }

    var isZero: Bool { digits.isEmpty }
    /// The position of the leading digit (1 for 1…9, 0 for 0.1…0.9).
    var magnitude: Int { isZero ? 0 : point - 1 }

    mutating func shift(_ k: Int) { if !isZero { point += k } }

    /// Rounds half away from zero, keeping `count` digits counted from the decimal point (`fraction`) or the first digit.
    mutating func round(keeping kept: Int) {
        guard kept < digits.count else { return }
        if kept < 0 { digits = []; point = 0; return }
        let up = digits[kept] >= 5
        digits.removeLast(digits.count - kept)
        if up {
            var i = digits.count - 1
            while i >= 0 {
                if digits[i] == 9 { digits[i] = 0; i -= 1 } else { digits[i] += 1; break }
            }
            if i < 0 { digits.insert(1, at: 0); point += 1 }
        }
        while digits.last == 0 { digits.removeLast() }
        if digits.isEmpty { point = 0 }
    }

    mutating func roundFraction(_ maxFraction: Int) { round(keeping: point + maxFraction) }
    mutating func roundSignificant(_ maxSignificant: Int) { round(keeping: maxSignificant) }

    var integerDigits: [UInt8] {
        guard point > 0 else { return [0] }
        return (0..<point).map { $0 < digits.count ? digits[$0] : 0 }
    }

    /// The digits after the point, `-point` leading zeros first when the value is below 0.1.
    var fraction: [UInt8] {
        if point >= digits.count { return [] }
        if point >= 0 { return Array(digits[point...]) }
        return Array(repeating: 0, count: -point) + digits
    }
}

// MARK: - Intl.NumberFormat

/// What the en-US data says about a currency: its symbols, digits and names.
private struct JSCurrency {
    let symbol: String
    let narrow: String
    let digits: Int
    let one: String
    let other: String
}

private let jsCurrencies: [String: JSCurrency] = [
    "USD": JSCurrency(symbol: "$", narrow: "$", digits: 2, one: "US dollar", other: "US dollars"),
    "EUR": JSCurrency(symbol: "€", narrow: "€", digits: 2, one: "euro", other: "euros"),
    "GBP": JSCurrency(symbol: "£", narrow: "£", digits: 2, one: "British pound", other: "British pounds"),
    "JPY": JSCurrency(symbol: "¥", narrow: "¥", digits: 0, one: "Japanese yen", other: "Japanese yen"),
    "CNY": JSCurrency(symbol: "CN¥", narrow: "¥", digits: 2, one: "Chinese yuan", other: "Chinese yuan"),
    "CAD": JSCurrency(symbol: "CA$", narrow: "$", digits: 2, one: "Canadian dollar", other: "Canadian dollars"),
    "AUD": JSCurrency(symbol: "A$", narrow: "$", digits: 2, one: "Australian dollar", other: "Australian dollars"),
    "INR": JSCurrency(symbol: "₹", narrow: "₹", digits: 2, one: "Indian rupee", other: "Indian rupees"),
    "KRW": JSCurrency(symbol: "₩", narrow: "₩", digits: 0, one: "South Korean won", other: "South Korean won"),
    "BRL": JSCurrency(symbol: "R$", narrow: "R$", digits: 2, one: "Brazilian real", other: "Brazilian reals"),
    "MXN": JSCurrency(symbol: "MX$", narrow: "$", digits: 2, one: "Mexican peso", other: "Mexican pesos"),
    "CHF": JSCurrency(symbol: "CHF", narrow: "CHF", digits: 2, one: "Swiss franc", other: "Swiss francs"),
    "SEK": JSCurrency(symbol: "SEK", narrow: "kr", digits: 2, one: "Swedish krona", other: "Swedish kronor"),
    "NZD": JSCurrency(symbol: "NZ$", narrow: "$", digits: 2, one: "New Zealand dollar", other: "New Zealand dollars"),
]

/// `Intl.NumberFormat`.
public final class JSNumberFormat: JSDynamic {
    let locale: String
    let style: String
    let currency: String?
    let currencyDisplay: String
    let currencySign: String
    let notation: String
    let compactDisplay: String
    let signDisplay: String
    let useGrouping: String
    let minimumIntegerDigits: Int
    let minimumFractionDigits: Int?
    let maximumFractionDigits: Int?
    let minimumSignificantDigits: Int?
    let maximumSignificantDigits: Int?
    /// No digit options: compact notation's own rounding applies.
    let compactRounding: Bool

    public init(_ locales: Any? = nil, _ options: Any? = nil) throws {
        locale = jsIsEnUS(jsRequestedLocale(locales)) ? "en-US" : jsRequestedLocale(locales)
        style = try jsStringOption(options, "style", ["decimal", "percent", "currency", "unit"], "decimal")!
        let code = try jsStringOption(options, "currency", [], nil)?.uppercased()
        if style == "currency" && code == nil { throw JSException(JSTypeError("Currency code is required with currency style.")) }
        currency = code
        currencyDisplay = try jsStringOption(options, "currencyDisplay", ["symbol", "narrowSymbol", "code", "name"], "symbol")!
        currencySign = try jsStringOption(options, "currencySign", ["standard", "accounting"], "standard")!
        notation = try jsStringOption(options, "notation", ["standard", "scientific", "engineering", "compact"], "standard")!
        compactDisplay = try jsStringOption(options, "compactDisplay", ["short", "long"], "short")!
        signDisplay = try jsStringOption(options, "signDisplay", ["auto", "never", "always", "exceptZero", "negative"], "auto")!
        switch jsFlat(jsOption(options, "useGrouping")) {
        case nil: useGrouping = notation == "compact" ? "min2" : "auto"
        case let b as Bool: useGrouping = b ? "always" : "false"
        case let v?: useGrouping = jsToString(v) == "false" || jsToString(v) == "" ? "false" : jsToString(v)
        }
        minimumIntegerDigits = try jsNumberOption(options, "minimumIntegerDigits", 1, 21, 1)!
        let minSD = try jsNumberOption(options, "minimumSignificantDigits", 1, 21, nil)
        let maxSD = try jsNumberOption(options, "maximumSignificantDigits", 1, 21, nil)
        let minFD = try jsNumberOption(options, "minimumFractionDigits", 0, 100, nil)
        let maxFD = try jsNumberOption(options, "maximumFractionDigits", 0, 100, nil)
        if minSD != nil || maxSD != nil {
            minimumSignificantDigits = minSD ?? 1
            maximumSignificantDigits = max(maxSD ?? 21, minSD ?? 1)
            minimumFractionDigits = nil
            maximumFractionDigits = nil
            compactRounding = false
        } else {
            minimumSignificantDigits = nil
            maximumSignificantDigits = nil
            let currencyDigits = code.map { jsCurrencies[$0]?.digits ?? 2 } ?? 2
            let defaultMin = style == "currency" && notation != "compact" ? currencyDigits : 0
            let defaultMax = style == "currency" && notation != "compact" ? max(defaultMin, currencyDigits) : style == "percent" ? max(defaultMin, 0) : max(defaultMin, notation == "compact" ? 0 : 3)
            compactRounding = notation == "compact" && minFD == nil && maxFD == nil
            if let minFD, let maxFD, minFD > maxFD { throw JSException(JSRangeError("maximumFractionDigits value is out of range.")) }
            let lo = minFD ?? min(defaultMin, maxFD ?? defaultMin)
            minimumFractionDigits = lo
            maximumFractionDigits = maxFD ?? max(defaultMax, lo)
        }
    }

    /// `format(value)`.
    public func format(_ value: Any?) -> String { formatNumber(jsToNumber(value)) }

    func formatNumber(_ x: Double) -> String {
        guard jsIsEnUS(locale) else { return platformFormat(x) }
        let negative = x.sign == .minus && !x.isNaN
        var body: String
        var isZero = false
        if x.isNaN {
            body = "NaN"
        } else if x.isInfinite {
            body = "∞"
        } else {
            var d = JSDecimalDigits(abs(x))
            if style == "percent" { d.shift(2) }
            switch notation {
            case "scientific", "engineering":
                body = scientific(&d, engineering: notation == "engineering")
            case "compact":
                body = compact(&d)
            default:
                roundDigits(&d)
                body = layout(d)
            }
            isZero = d.isZero
        }
        if style == "percent" { body += "%" }
        if style == "currency", let code = currency { body = currencyText(body, code, x) }
        let showMinus: Bool
        let showPlus: Bool
        switch signDisplay {
        case "never": showMinus = false; showPlus = false
        case "always": showMinus = negative; showPlus = !negative && !x.isNaN
        case "exceptZero": showMinus = negative && !isZero; showPlus = !negative && !isZero && !x.isNaN
        case "negative": showMinus = negative && !isZero; showPlus = false
        default: showMinus = negative; showPlus = false
        }
        if showMinus && style == "currency" && currencySign == "accounting" { return "(\(body))" }
        return (showMinus ? "-" : showPlus ? "+" : "") + body
    }

    private func roundDigits(_ d: inout JSDecimalDigits) {
        if let maxSD = maximumSignificantDigits { d.roundSignificant(maxSD) } else { d.roundFraction(maximumFractionDigits ?? 3) }
    }

    /// Integer digits grouped as en-US groups them, and the fraction padded to its minimum.
    private func layout(_ d: JSDecimalDigits, grouping: Bool = true) -> String {
        var integer = d.integerDigits
        while integer.count < minimumIntegerDigits { integer.insert(0, at: 0) }
        var fraction = d.fraction
        if let minSD = minimumSignificantDigits {
            let have = d.isZero ? 1 : (d.point > 0 ? max(d.point, d.digits.count) : d.digits.count)
            if have < minSD { fraction += Array(repeating: 0, count: minSD - have) }
        } else {
            while fraction.count < (minimumFractionDigits ?? 0) { fraction.append(0) }
        }
        let digitText = { (ds: [UInt8]) in String(decoding: ds.map { $0 + 48 }, as: UTF8.self) }
        var intText = digitText(integer)
        let group = grouping && (useGrouping == "always" || useGrouping == "auto" || useGrouping == "true" || (useGrouping == "min2" && integer.count >= 5))
        if group && intText.count > 3 {
            var out = ""
            for (i, c) in intText.enumerated() {
                if i > 0 && (intText.count - i) % 3 == 0 { out += "," }
                out.append(c)
            }
            intText = out
        }
        return fraction.isEmpty ? intText : intText + "." + digitText(fraction)
    }

    private func scientific(_ d: inout JSDecimalDigits, engineering: Bool) -> String {
        if d.isZero { return layout(d) + "E0" }
        var exponent = d.magnitude
        if engineering { exponent = Int((Double(exponent) / 3).rounded(.down)) * 3 }
        var mantissa = d
        mantissa.point -= exponent
        roundDigits(&mantissa)
        if mantissa.magnitude >= (engineering ? 3 : 1) {
            exponent += engineering ? 3 : 1
            mantissa = d
            mantissa.point -= exponent
            roundDigits(&mantissa)
        }
        d = mantissa
        return layout(mantissa, grouping: false) + "E" + String(exponent)
    }

    private func compact(_ d: inout JSDecimalDigits) -> String {
        let units = compactDisplay == "long" ? ["", " thousand", " million", " billion", " trillion"] : ["", "K", "M", "B", "T"]
        func scaled(_ magnitude: Int) -> (JSDecimalDigits, Int) {
            let level = magnitude < 3 ? 0 : min(magnitude / 3, 4)
            var s = d
            s.shift(-level * 3)
            if compactRounding {
                if s.isZero || s.point < 2 { s.roundSignificant(2) } else { s.roundFraction(0) }
            } else {
                roundDigits(&s)
            }
            return (s, level)
        }
        var (s, level) = scaled(d.magnitude)
        if s.magnitude >= 3 && level < 4 { (s, level) = scaled(s.magnitude + level * 3) }
        d = s
        return layout(s) + units[level]
    }

    private func currencyText(_ number: String, _ code: String, _ x: Double) -> String {
        let data = jsCurrencies[code]
        switch currencyDisplay {
        case "code": return "\(code)\u{a0}\(number)"
        case "name":
            let one = abs(x) == 1 && !number.contains(".")
            return "\(number) \(one ? data?.one ?? code : data?.other ?? code)"
        case "narrowSymbol": return (data?.narrow ?? code) + number
        default:
            let symbol = data?.symbol ?? code
            return symbol.count > 1 && symbol.allSatisfy({ $0.isLetter }) ? "\(symbol)\u{a0}\(number)" : symbol + number
        }
    }

    /// Another locale: Foundation's formatter with the same options.
    private func platformFormat(_ x: Double) -> String {
        let f = NumberFormatter()
        f.locale = Locale(identifier: locale)
        switch style {
        case "percent": f.numberStyle = .percent
        case "currency":
            f.numberStyle = currencyDisplay == "code" ? .currencyISOCode : currencyDisplay == "name" ? .currencyPlural : currencySign == "accounting" ? .currencyAccounting : .currency
            f.currencyCode = currency
        default: f.numberStyle = .decimal
        }
        if notation == "scientific" { f.numberStyle = .scientific }
        f.minimumIntegerDigits = minimumIntegerDigits
        if let minSD = minimumSignificantDigits, let maxSD = maximumSignificantDigits {
            f.usesSignificantDigits = true
            f.minimumSignificantDigits = minSD
            f.maximumSignificantDigits = maxSD
        } else {
            f.minimumFractionDigits = minimumFractionDigits ?? 0
            f.maximumFractionDigits = maximumFractionDigits ?? 3
        }
        f.usesGroupingSeparator = useGrouping != "false"
        f.roundingMode = .halfUp
        return f.string(from: NSNumber(value: x)) ?? jsNumberToString(x)
    }

    /// `resolvedOptions()`.
    public func resolvedOptions() -> JSObject {
        var entries: [(String, Any?)] = [("locale", locale), ("numberingSystem", "latn"), ("style", style)]
        if let currency { entries += [("currency", currency), ("currencyDisplay", currencyDisplay), ("currencySign", currencySign)] }
        entries.append(("minimumIntegerDigits", Double(minimumIntegerDigits)))
        if let minimumFractionDigits, let maximumFractionDigits {
            entries += [("minimumFractionDigits", Double(minimumFractionDigits)), ("maximumFractionDigits", Double(maximumFractionDigits))]
        }
        if let minimumSignificantDigits, let maximumSignificantDigits {
            entries += [("minimumSignificantDigits", Double(minimumSignificantDigits)), ("maximumSignificantDigits", Double(maximumSignificantDigits))]
        }
        entries += [("useGrouping", useGrouping == "false" ? false as Any? : useGrouping), ("notation", notation)]
        if notation == "compact" { entries.append(("compactDisplay", compactDisplay)) }
        entries += [("signDisplay", signDisplay), ("roundingIncrement", 1.0), ("roundingMode", "halfExpand"), ("roundingPriority", "auto"), ("trailingZeroDisplay", "auto")]
        return JSObject(entries)
    }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "NumberFormat" }
}

/// `number.toLocaleString(locales, options)`.
public func jsNumberToLocaleString(_ x: Double, _ locales: Any? = nil, _ options: Any? = nil) throws -> String {
    try JSNumberFormat(locales, options).formatNumber(x)
}

// MARK: - Intl.DateTimeFormat

private let jsMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
private let jsWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/// CLDR's en `availableFormats` for dates, by skeleton (month `M` numeric, `MMM` short, `MMMM` long).
private let jsDateSkeletons: [String: String] = [
    "y": "y", "yM": "M/y", "yMd": "M/d/y", "yMEd": "E, M/d/y", "yMMM": "MMM y", "yMMMd": "MMM d, y", "yMMMEd": "E, MMM d, y",
    "yMMMM": "MMMM y", "M": "L", "Md": "M/d", "MEd": "E, M/d", "MMM": "LLL", "MMMd": "MMM d", "MMMEd": "E, MMM d", "MMMMd": "MMMM d",
    "d": "d", "Ed": "d E", "E": "ccc", "Gy": "y G", "GyMMM": "MMM y G", "GyMMMd": "MMM d, y G", "GyMMMEd": "E, MMM d, y G", "GyMd": "M/d/y G",
]

/// CLDR's en `availableFormats` for times (`h` stands for the hour of a 12-hour clock, `H` a 24-hour one).
private let jsTimeSkeletons: [String: String] = [
    "h": "h a", "H": "HH", "hm": "h:mm a", "Hm": "HH:mm", "hms": "h:mm:ss a", "Hms": "HH:mm:ss", "ms": "mm:ss", "m": "m", "s": "s",
]

/// `Intl.DateTimeFormat`.
public final class JSDateTimeFormat: JSDynamic {
    let locale: String
    let timeZone: TimeZone
    let timeZoneId: String
    let hourCycle: String?
    private var pattern = ""
    private var components: [(String, Any?)] = []
    private let dateStyle: String?
    private let timeStyle: String?

    /// `required`/`defaults` as ToDateTimeOptions takes them: "date", "time" or "any"/"all".
    public init(_ locales: Any? = nil, _ options: Any? = nil, required: String = "any", defaults: String = "date") throws {
        locale = jsIsEnUS(jsRequestedLocale(locales)) ? "en-US" : jsRequestedLocale(locales)
        let zone = jsFlat(jsOption(options, "timeZone")).map(jsToString)
        if let zone {
            guard let tz = zone.uppercased() == "UTC" || zone.uppercased() == "GMT" ? TimeZone(identifier: "UTC") : TimeZone(identifier: zone) else {
                throw JSException(JSRangeError("Invalid time zone specified: \(zone)"))
            }
            timeZone = tz
            timeZoneId = zone.uppercased() == "UTC" || zone.uppercased() == "GMT" ? "UTC" : tz.identifier
        } else {
            timeZone = TimeZone.current
            timeZoneId = TimeZone.current.identifier
        }
        let get = { (k: String) -> String? in jsFlat(jsOption(options, k)).map(jsToString) }
        dateStyle = get("dateStyle")
        timeStyle = get("timeStyle")
        let hour12 = jsFlat(jsOption(options, "hour12")).map(jsIsTruthy)
        var cycle = get("hourCycle")
        if let hour12 { cycle = hour12 ? "h12" : "h23" }
        var fields: [String: String] = [:]
        for k in ["weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZoneName"] { if let v = get(k) { fields[k] = v } }
        if let f = get("fractionalSecondDigits") { fields["fractionalSecondDigits"] = f }
        // ToDateTimeOptions: the fields a call formats when the options name none it requires.
        let hasDate = ["weekday", "year", "month", "day"].contains { fields[$0] != nil }
        let hasTime = ["hour", "minute", "second", "fractionalSecondDigits"].contains { fields[$0] != nil }
        let needDefaults = dateStyle == nil && timeStyle == nil && !((required == "date" || required == "any") && hasDate) && !((required == "time" || required == "any") && hasTime)
        if needDefaults {
            if defaults == "date" || defaults == "all" { fields["year"] = "numeric"; fields["month"] = "numeric"; fields["day"] = "numeric" }
            if defaults == "time" || defaults == "all" { fields["hour"] = "numeric"; fields["minute"] = "numeric"; fields["second"] = "numeric" }
            // ICU keeps the locale's 12-hour clock for the clock these defaults add, whatever hourCycle asks.
            if hour12 == nil && (cycle == "h11" || cycle == "h24") && (defaults == "time" || defaults == "all") { cycle = nil }
        }
        hourCycle = cycle
        if fields["hour"] != nil || timeStyle != nil {
            components.append(("hourCycle", cycle ?? "h12"))
            components.append(("hour12", (cycle ?? "h12") == "h12" || cycle == "h11"))
        }
        let order = ["weekday", "era", "year", "month", "day", "hour", "minute", "second", "fractionalSecondDigits", "timeZoneName"]
        for k in order { if let v = fields[k] { components.append((k, k == "fractionalSecondDigits" ? Double(v) as Any? : v)) } }
        pattern = resolvePattern(fields)
    }

    private var twelveHour: Bool { hourCycle == nil || hourCycle == "h12" || hourCycle == "h11" }

    private func hourLetter(_ twelve: Bool) -> String {
        switch hourCycle {
        case "h11": return "K"
        case "h24": return "k"
        default: return twelve ? "h" : "H"
        }
    }

    private func resolvePattern(_ f: [String: String]) -> String {
        if dateStyle != nil || timeStyle != nil {
            let datePattern: String? = dateStyle.map { ["full": "EEEE, MMMM d, y", "long": "MMMM d, y", "medium": "MMM d, y", "short": "M/d/yy"][$0] ?? "M/d/yy" }
            let timePattern: String? = timeStyle.map {
                let base = ["full": "h:mm:ss a zzzz", "long": "h:mm:ss a z", "medium": "h:mm:ss a", "short": "h:mm a"][$0] ?? "h:mm a"
                return twelveHour ? base.replacingOccurrences(of: "h", with: hourLetter(true)) : base.replacingOccurrences(of: " a", with: "").replacingOccurrences(of: "h", with: hourLetter(false) == "H" ? "HH" : hourLetter(false))
            }
            if let d = datePattern, let t = timePattern {
                return dateStyle == "full" || dateStyle == "long" ? "\(d) 'at' \(t)" : "\(d), \(t)"
            }
            return datePattern ?? timePattern!
        }
        // The date part.
        var dateKey = ""
        if f["era"] != nil { dateKey += "G" }
        if f["year"] != nil { dateKey += "y" }
        let month = f["month"]
        let textMonth = month == "short" || month == "long" || month == "narrow"
        if let month { dateKey += textMonth ? (month == "long" ? "MMMM" : "MMM") : "M" }
        if f["weekday"] != nil { dateKey += "E" }
        if f["day"] != nil { dateKey += "d" }
        var datePattern: String? = nil
        if !dateKey.isEmpty {
            datePattern = jsDateSkeletons[dateKey] ?? jsDateSkeletons[dateKey.replacingOccurrences(of: "MMMM", with: "MMM")] ?? dateKey.map { String($0) }.joined(separator: " ")
            datePattern = adjust(datePattern!, f)
        }
        // The time part.
        var timePattern: String? = nil
        let twelve = twelveHour
        var timeKey = ""
        if f["hour"] != nil { timeKey += twelve ? "h" : "H" }
        if f["minute"] != nil { timeKey += "m" }
        if f["second"] != nil || f["fractionalSecondDigits"] != nil { timeKey += "s" }
        if !timeKey.isEmpty {
            var p = jsTimeSkeletons[timeKey] ?? timeKey
            if let fraction = f["fractionalSecondDigits"], let n = Int(fraction) { p = p.replacingOccurrences(of: "ss", with: "ss." + String(repeating: "S", count: n)).replacingOccurrences(of: "s", with: f["second"] == nil && !p.contains("ss") ? "s." + String(repeating: "S", count: n) : "s") }
            if f["hour"] == "2-digit" && twelve { p = p.replacingOccurrences(of: "h", with: "hh") }
            let letter = hourLetter(twelve)
            p = p.replacingOccurrences(of: twelve ? "h" : "H", with: letter)
            timePattern = p
        }
        if let zone = f["timeZoneName"] {
            let z = ["short": "z", "long": "zzzz", "shortOffset": "O", "longOffset": "OOOO", "shortGeneric": "v", "longGeneric": "vvvv"][zone] ?? "z"
            if let t = timePattern { timePattern = "\(t) \(z)" } else if let d = datePattern { datePattern = "\(d), \(z)" } else { timePattern = z }
        }
        guard let d = datePattern else { return timePattern ?? "" }
        guard let t = timePattern else { return d }
        if dateKey == "E" { return "\(d) \(t)" }
        if month == "long" { return "\(d) 'at' \(t)" }
        return "\(d), \(t)"
    }

    /// Widens a skeleton's pattern to the widths the options ask for.
    private func adjust(_ pattern: String, _ f: [String: String]) -> String {
        var out = ""
        var chars = Array(pattern)
        var i = 0
        while i < chars.count {
            let c = chars[i]
            if c == "'" {
                var j = i + 1
                while j < chars.count && chars[j] != "'" { j += 1 }
                out += String(chars[i...min(j, chars.count - 1)])
                i = j + 1
                continue
            }
            var j = i
            while j < chars.count && chars[j] == c { j += 1 }
            let run = j - i
            switch c {
            case "y": out += f["year"] == "2-digit" ? "yy" : "y"
            case "M", "L":
                switch f["month"] {
                case "2-digit": out += String(repeating: c, count: 2)
                case "numeric": out += String(c)
                case "short": out += String(repeating: c, count: 3)
                case "long": out += String(repeating: c, count: 4)
                case "narrow": out += String(repeating: c, count: 5)
                default: out += String(repeating: c, count: run)
                }
            case "d": out += f["day"] == "2-digit" ? "dd" : "d"
            case "E", "c":
                switch f["weekday"] {
                case "long": out += String(repeating: c, count: 4)
                case "narrow": out += String(repeating: c, count: 5)
                default: out += String(repeating: c, count: 3)
                }
            case "G": out += f["era"] == "long" ? "GGGG" : f["era"] == "narrow" ? "GGGGG" : "G"
            default: out += String(repeating: c, count: run)
            }
            i = j
        }
        chars = []
        return out
    }

    /// `format(date)`.
    public func format(_ date: Any? = nil) throws -> String {
        let t: Double
        switch jsFlat(date) {
        case nil: t = JSDate.now()
        case let d as JSDate: t = d.time
        case let v?: t = jsToNumber(v)
        }
        guard t.isFinite else { throw JSException(JSRangeError("Invalid time value")) }
        return formatTime(t)
    }

    func formatTime(_ t: Double) -> String {
        guard jsIsEnUS(locale) else { return platformFormat(t) }
        let date = Date(timeIntervalSince1970: t / 1000)
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = timeZone
        let c = calendar.dateComponents([.era, .year, .month, .day, .weekday, .hour, .minute, .second, .nanosecond], from: date)
        let millis = Int(((t.truncatingRemainder(dividingBy: 1000)) + 1000).truncatingRemainder(dividingBy: 1000))
        let chars = Array(pattern)
        var out = ""
        var i = 0
        func pad(_ n: Int, _ width: Int) -> String { let s = String(n); return s.count >= width ? s : String(repeating: "0", count: width - s.count) + s }
        while i < chars.count {
            let ch = chars[i]
            if ch == "'" {
                var j = i + 1
                while j < chars.count && chars[j] != "'" { out.append(chars[j]); j += 1 }
                i = j + 1
                continue
            }
            guard ch.isLetter else { out.append(ch); i += 1; continue }
            var j = i
            while j < chars.count && chars[j] == ch { j += 1 }
            let n = j - i
            let hour = c.hour ?? 0
            switch ch {
            case "G": out += (c.era ?? 1) == 1 ? (n == 4 ? "Anno Domini" : n == 5 ? "A" : "AD") : (n == 4 ? "Before Christ" : n == 5 ? "B" : "BC")
            case "y": out += n == 2 ? pad((c.year ?? 0) % 100, 2) : String(c.year ?? 0)
            case "M", "L":
                let m = (c.month ?? 1) - 1
                out += n == 1 ? String(m + 1) : n == 2 ? pad(m + 1, 2) : n == 3 ? String(jsMonths[m].prefix(3)) : n == 4 ? jsMonths[m] : String(jsMonths[m].prefix(1))
            case "d": out += pad(c.day ?? 1, n)
            case "E", "c":
                let w = jsWeekdays[(c.weekday ?? 1) - 1]
                out += n >= 5 ? String(w.prefix(1)) : n == 4 ? w : String(w.prefix(3))
            case "h": out += pad(hour % 12 == 0 ? 12 : hour % 12, n)
            case "K": out += pad(hour % 12, n)
            case "H": out += pad(hour, n)
            case "k": out += pad(hour == 0 ? 24 : hour, n)
            case "m": out += pad(c.minute ?? 0, n)
            case "s": out += pad(c.second ?? 0, n)
            case "S": out += String(pad(millis, 3).prefix(n)) + String(repeating: "0", count: max(0, n - 3))
            case "a": out += hour < 12 ? "AM" : "PM"
            case "z", "v": out += zoneName(date, long: n >= 4)
            case "O": out += offsetName(date, long: n >= 4)
            default: out += String(repeating: ch, count: n)
            }
            i = j
        }
        return out
    }

    private func zoneName(_ date: Date, long: Bool) -> String {
        if timeZoneId == "UTC" { return long ? "Coordinated Universal Time" : "UTC" }
        // ICU's zone names start in 1970; before, a zone is its offset from GMT.
        if date.timeIntervalSince1970 < 0 { return offsetName(date, long: long) }
        if long {
            return timeZone.localizedName(for: timeZone.isDaylightSavingTime(for: date) ? .daylightSaving : .standard, locale: Locale(identifier: "en_US")) ?? offsetName(date, long: true)
        }
        let abbreviation = timeZone.abbreviation(for: date) ?? ""
        return abbreviation.hasPrefix("GMT") || abbreviation.hasPrefix("UTC") || !timeZone.identifier.hasPrefix("America/") ? offsetName(date, long: false) : abbreviation
    }

    private func offsetName(_ date: Date, long: Bool) -> String {
        let seconds = timeZone.secondsFromGMT(for: date)
        if seconds == 0 { return "GMT" }
        let sign = seconds < 0 ? "-" : "+"
        let h = abs(seconds) / 3600, m = abs(seconds) % 3600 / 60
        if long { return String(format: "GMT%@%02d:%02d", sign, h, m) }
        return m == 0 ? "GMT\(sign)\(h)" : String(format: "GMT%@%d:%02d", sign, h, m)
    }

    /// Another locale: Foundation's formatter, with the pattern CLDR gives that locale for the same fields.
    private func platformFormat(_ t: Double) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: locale)
        f.timeZone = timeZone
        if dateStyle != nil || timeStyle != nil {
            let style = { (s: String?) -> DateFormatter.Style in ["full": .full, "long": .long, "medium": .medium, "short": .short][s ?? ""] ?? .none }
            f.dateStyle = style(dateStyle)
            f.timeStyle = style(timeStyle)
        } else {
            f.setLocalizedDateFormatFromTemplate(pattern.replacingOccurrences(of: "'at'", with: "").filter { $0.isLetter })
        }
        return f.string(from: Date(timeIntervalSince1970: t / 1000))
    }

    /// `resolvedOptions()`.
    public func resolvedOptions() -> JSObject {
        var entries: [(String, Any?)] = [("locale", locale), ("calendar", "gregory"), ("numberingSystem", "latn"), ("timeZone", timeZoneId)]
        entries += components
        if let dateStyle { entries.append(("dateStyle", dateStyle)) }
        if let timeStyle { entries.append(("timeStyle", timeStyle)) }
        return JSObject(entries)
    }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "DateTimeFormat" }
}

extension JSDate {
    /// `date.toLocaleString(locales, options)`: date and time.
    public func toLocaleString(_ locales: Any? = nil, _ options: Any? = nil) throws -> String {
        guard time.isFinite else { return "Invalid Date" }
        return try JSDateTimeFormat(locales, options, required: "any", defaults: "all").formatTime(time)
    }

    /// `date.toLocaleDateString(locales, options)`.
    public func toLocaleDateString(_ locales: Any? = nil, _ options: Any? = nil) throws -> String {
        guard time.isFinite else { return "Invalid Date" }
        if jsFlat(jsOption(options, "timeStyle")) != nil { throw JSException(JSTypeError("Invalid option : timeStyle")) }
        return try JSDateTimeFormat(locales, options, required: "date", defaults: "date").formatTime(time)
    }

    /// `date.toLocaleTimeString(locales, options)`.
    public func toLocaleTimeString(_ locales: Any? = nil, _ options: Any? = nil) throws -> String {
        guard time.isFinite else { return "Invalid Date" }
        if jsFlat(jsOption(options, "dateStyle")) != nil { throw JSException(JSTypeError("Invalid option : dateStyle")) }
        return try JSDateTimeFormat(locales, options, required: "time", defaults: "time").formatTime(time)
    }
}
