import Foundation

/// `Date`: a time value in milliseconds since the epoch (NaN when invalid),
/// read in the device's time zone or in UTC as ECMA-262 §21.4 defines.
public final class JSDate: JSDynamic, JSStringConvertible {
    nonisolated deinit {}
    public var time: Double

    public init() { time = (Date().timeIntervalSince1970 * 1000).rounded(.down) }
    public init(_ ms: Double) { time = JSDate.timeClip(ms) }
    public init(_ text: String) { time = JSDate.parse(text) }

    /// `new Date(year, month, day?, hours?, minutes?, seconds?, ms?)` in local time; years 0–99 mean 1900–1999.
    public init(_ year: Double, _ month: Double, _ day: Double = 1, _ hours: Double = 0, _ minutes: Double = 0, _ seconds: Double = 0, _ ms: Double = 0) {
        var y = year
        if !y.isNaN, let i = Int(exactly: y.rounded(.towardZero)), (0...99).contains(i) { y = 1900 + Double(i) }
        time = JSDate.timeClip(JSDate.utc(fromLocal: JSDate.makeDate(y, month, day, hours, minutes, seconds, ms)))
    }

    public static func now() -> Double { (Date().timeIntervalSince1970 * 1000).rounded(.down) }

    /// `Date.UTC(...)`.
    public static func UTC(_ year: Double, _ month: Double = 0, _ day: Double = 1, _ hours: Double = 0, _ minutes: Double = 0, _ seconds: Double = 0, _ ms: Double = 0) -> Double {
        var y = year
        if !y.isNaN, let i = Int(exactly: y.rounded(.towardZero)), (0...99).contains(i) { y = 1900 + Double(i) }
        return timeClip(makeDate(y, month, day, hours, minutes, seconds, ms))
    }

    // MARK: ECMA-262 date arithmetic (§21.4.1)

    static let msPerDay = 86_400_000.0

    static func timeClip(_ t: Double) -> Double {
        guard t.isFinite, abs(t) <= 8.64e15 else { return .nan }
        return t.rounded(.towardZero) + 0
    }

    static func day(_ t: Double) -> Double { (t / msPerDay).rounded(.down) }
    static func timeWithinDay(_ t: Double) -> Double { jsModPositive(t, msPerDay) }
    static func daysInYear(_ y: Double) -> Double { (y.truncatingRemainder(dividingBy: 4) != 0) ? 365 : (y.truncatingRemainder(dividingBy: 100) != 0) ? 366 : (y.truncatingRemainder(dividingBy: 400) != 0) ? 365 : 366 }
    static func dayFromYear(_ y: Double) -> Double { 365 * (y - 1970) + ((y - 1969) / 4).rounded(.down) - ((y - 1901) / 100).rounded(.down) + ((y - 1601) / 400).rounded(.down) }
    static func yearFromTime(_ t: Double) -> Double {
        var y = (t / (msPerDay * 365.2425)).rounded(.down) + 1970
        while dayFromYear(y) * msPerDay > t { y -= 1 }
        while dayFromYear(y + 1) * msPerDay <= t { y += 1 }
        return y
    }
    static func inLeapYear(_ t: Double) -> Bool { daysInYear(yearFromTime(t)) == 366 }
    static func dayWithinYear(_ t: Double) -> Double { day(t) - dayFromYear(yearFromTime(t)) }
    static let monthStarts: [Double] = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365]
    static func monthFromTime(_ t: Double) -> Double {
        let d = dayWithinYear(t), leap = inLeapYear(t) ? 1.0 : 0
        for m in 1...12 where d < monthStarts[m] + (m >= 2 ? leap : 0) { return Double(m - 1) }
        return 11
    }
    static func dateFromTime(_ t: Double) -> Double {
        let m = Int(monthFromTime(t)), leap = inLeapYear(t) ? 1.0 : 0
        return dayWithinYear(t) - monthStarts[m] - (m >= 2 ? leap : 0) + 1
    }
    static func makeDay(_ year: Double, _ month: Double, _ date: Double) -> Double {
        guard year.isFinite, month.isFinite, date.isFinite else { return .nan }
        let y = year.rounded(.towardZero), m = month.rounded(.towardZero), dt = date.rounded(.towardZero)
        let ym = y + (m / 12).rounded(.down)
        let mn = jsModPositive(m, 12)
        let leap = daysInYear(ym) == 366 ? 1.0 : 0
        let firstOfMonth = dayFromYear(ym) + monthStarts[Int(mn)] + (mn >= 2 ? leap : 0)
        return firstOfMonth + dt - 1
    }
    static func makeTime(_ h: Double, _ m: Double, _ s: Double, _ ms: Double) -> Double {
        guard h.isFinite, m.isFinite, s.isFinite, ms.isFinite else { return .nan }
        return h.rounded(.towardZero) * 3_600_000 + m.rounded(.towardZero) * 60_000 + s.rounded(.towardZero) * 1000 + ms.rounded(.towardZero)
    }
    static func makeDate(_ y: Double, _ mo: Double, _ d: Double, _ h: Double, _ mi: Double, _ s: Double, _ ms: Double) -> Double {
        let day = makeDay(y, mo, d), time = makeTime(h, mi, s, ms)
        guard day.isFinite, time.isFinite else { return .nan }
        return day * msPerDay + time
    }

    /// The local time zone's offset from UTC at a UTC time, in milliseconds.
    static func offset(atUTC t: Double) -> Double {
        guard t.isFinite else { return 0 }
        return Double(TimeZone.current.secondsFromGMT(for: Date(timeIntervalSince1970: t / 1000))) * 1000
    }
    static func local(_ t: Double) -> Double { t + offset(atUTC: t) }
    static func utc(fromLocal t: Double) -> Double {
        guard t.isFinite else { return .nan }
        let guess = t - offset(atUTC: t)
        return t - offset(atUTC: guess)
    }

    // MARK: Getters

    private func field(_ utc: Bool, _ f: (Double) -> Double) -> Double {
        guard time.isFinite else { return .nan }
        return f(utc ? time : JSDate.local(time))
    }
    public func getTime() -> Double { time }
    public func valueOf() -> Double { time }
    public func getFullYear() -> Double { field(false, JSDate.yearFromTime) }
    public func getMonth() -> Double { field(false, JSDate.monthFromTime) }
    public func getDate() -> Double { field(false, JSDate.dateFromTime) }
    public func getDay() -> Double { field(false) { jsModPositive(JSDate.day($0) + 4, 7) } }
    public func getHours() -> Double { field(false) { (JSDate.timeWithinDay($0) / 3_600_000).rounded(.down) } }
    public func getMinutes() -> Double { field(false) { jsModPositive(($0 / 60_000).rounded(.down), 60) } }
    public func getSeconds() -> Double { field(false) { jsModPositive(($0 / 1000).rounded(.down), 60) } }
    public func getMilliseconds() -> Double { field(false) { jsModPositive($0, 1000) } }
    public func getUTCFullYear() -> Double { field(true, JSDate.yearFromTime) }
    public func getUTCMonth() -> Double { field(true, JSDate.monthFromTime) }
    public func getUTCDate() -> Double { field(true, JSDate.dateFromTime) }
    public func getUTCDay() -> Double { field(true) { jsModPositive(JSDate.day($0) + 4, 7) } }
    public func getUTCHours() -> Double { field(true) { (JSDate.timeWithinDay($0) / 3_600_000).rounded(.down) } }
    public func getUTCMinutes() -> Double { field(true) { jsModPositive(($0 / 60_000).rounded(.down), 60) } }
    public func getUTCSeconds() -> Double { field(true) { jsModPositive(($0 / 1000).rounded(.down), 60) } }
    public func getUTCMilliseconds() -> Double { field(true) { jsModPositive($0, 1000) } }
    public func getTimezoneOffset() -> Double { time.isFinite ? -JSDate.offset(atUTC: time) / 60_000 : .nan }

    // MARK: Setters (each returns the new time value)

    /// Sets the given fields in local time or UTC, the others kept; an invalid date stays invalid unless the year is set, from +0.
    private func setFields(utc: Bool, year: Double? = nil, month: Double? = nil, date: Double? = nil, hours: Double? = nil, minutes: Double? = nil, seconds: Double? = nil, ms: Double? = nil) -> Double {
        let t = time.isFinite ? (utc ? time : JSDate.local(time)) : (year != nil ? 0 : .nan)
        guard t.isFinite else { return .nan }
        let d = JSDate.makeDate(year ?? JSDate.yearFromTime(t), month ?? JSDate.monthFromTime(t), date ?? JSDate.dateFromTime(t),
                                hours ?? (JSDate.timeWithinDay(t) / 3_600_000).rounded(.down), minutes ?? jsModPositive((t / 60_000).rounded(.down), 60),
                                seconds ?? jsModPositive((t / 1000).rounded(.down), 60), ms ?? jsModPositive(t, 1000))
        time = JSDate.timeClip(utc ? d : JSDate.utc(fromLocal: d))
        return time
    }
    @discardableResult public func setTime(_ t: Double) -> Double { time = JSDate.timeClip(t); return time }
    @discardableResult public func setFullYear(_ y: Double, _ m: Double? = nil, _ d: Double? = nil) -> Double { setFields(utc: false, year: y, month: m, date: d) }
    @discardableResult public func setMonth(_ m: Double, _ d: Double? = nil) -> Double { setFields(utc: false, month: m, date: d) }
    @discardableResult public func setDate(_ d: Double) -> Double { setFields(utc: false, date: d) }
    @discardableResult public func setHours(_ h: Double, _ m: Double? = nil, _ s: Double? = nil, _ ms: Double? = nil) -> Double { setFields(utc: false, hours: h, minutes: m, seconds: s, ms: ms) }
    @discardableResult public func setMinutes(_ m: Double, _ s: Double? = nil, _ ms: Double? = nil) -> Double { setFields(utc: false, minutes: m, seconds: s, ms: ms) }
    @discardableResult public func setSeconds(_ s: Double, _ ms: Double? = nil) -> Double { setFields(utc: false, seconds: s, ms: ms) }
    @discardableResult public func setMilliseconds(_ ms: Double) -> Double { setFields(utc: false, ms: ms) }
    @discardableResult public func setUTCFullYear(_ y: Double, _ m: Double? = nil, _ d: Double? = nil) -> Double { setFields(utc: true, year: y, month: m, date: d) }
    @discardableResult public func setUTCMonth(_ m: Double, _ d: Double? = nil) -> Double { setFields(utc: true, month: m, date: d) }
    @discardableResult public func setUTCDate(_ d: Double) -> Double { setFields(utc: true, date: d) }
    @discardableResult public func setUTCHours(_ h: Double, _ m: Double? = nil, _ s: Double? = nil, _ ms: Double? = nil) -> Double { setFields(utc: true, hours: h, minutes: m, seconds: s, ms: ms) }
    @discardableResult public func setUTCMinutes(_ m: Double, _ s: Double? = nil, _ ms: Double? = nil) -> Double { setFields(utc: true, minutes: m, seconds: s, ms: ms) }
    @discardableResult public func setUTCSeconds(_ s: Double, _ ms: Double? = nil) -> Double { setFields(utc: true, seconds: s, ms: ms) }
    @discardableResult public func setUTCMilliseconds(_ ms: Double) -> Double { setFields(utc: true, ms: ms) }

    // MARK: Strings

    private static let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    private static let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    private static func pad(_ v: Double, _ n: Int = 2) -> String { let digits = jsNumberToString(abs(v)); return ((try? jsPadding(digits, Double(n), "0")) ?? "") + digits }
    private static func year(_ y: Double) -> String { y >= 0 ? pad(y, 4) : "-" + pad(-y, 6) }

    /// `toISOString()`: throws a RangeError for an invalid date.
    public func toISOString() throws -> String {
        guard time.isFinite else { throw JSException(value: JSRangeError("Invalid time value")) }
        let t = time, y = JSDate.yearFromTime(t)
        let ys = (0...9999).contains(y) ? JSDate.pad(y, 4) : (y < 0 ? "-" : "+") + JSDate.pad(abs(y), 6)
        return "\(ys)-\(JSDate.pad(getUTCMonth() + 1))-\(JSDate.pad(getUTCDate()))T\(JSDate.pad(getUTCHours())):\(JSDate.pad(getUTCMinutes())):\(JSDate.pad(getUTCSeconds())).\(JSDate.pad(getUTCMilliseconds(), 3))Z"
    }
    public func toJSON() -> String? { try? toISOString() }

    private var zone: String {
        let off = -getTimezoneOffset()
        let sign = off >= 0 ? "+" : "-"
        let name = TimeZone.current.localizedName(for: TimeZone.current.isDaylightSavingTime(for: Date(timeIntervalSince1970: time / 1000)) ? .daylightSaving : .standard, locale: Locale(identifier: "en_US")) ?? TimeZone.current.identifier
        return "GMT\(sign)\(JSDate.pad((abs(off) / 60).rounded(.down)))\(JSDate.pad(jsModPositive(abs(off), 60))) (\(name))"
    }
    public func toDateString() -> String {
        guard time.isFinite else { return "Invalid Date" }
        return "\(JSDate.days[Int(getDay())]) \(JSDate.months[Int(getMonth())]) \(JSDate.pad(getDate())) \(JSDate.year(getFullYear()))"
    }
    public func toTimeString() -> String {
        guard time.isFinite else { return "Invalid Date" }
        return "\(JSDate.pad(getHours())):\(JSDate.pad(getMinutes())):\(JSDate.pad(getSeconds())) \(zone)"
    }
    public func toString() -> String { time.isFinite ? "\(toDateString()) \(toTimeString())" : "Invalid Date" }
    public func toUTCString() -> String {
        guard time.isFinite else { return "Invalid Date" }
        return "\(JSDate.days[Int(getUTCDay())]), \(JSDate.pad(getUTCDate())) \(JSDate.months[Int(getUTCMonth())]) \(JSDate.year(getUTCFullYear())) \(JSDate.pad(getUTCHours())):\(JSDate.pad(getUTCMinutes())):\(JSDate.pad(getUTCSeconds())) GMT"
    }

    // MARK: Parsing (the ISO format of §21.4.1.32, and the strings toString and toUTCString produce)

    public static func parse(_ text: String) -> Double {
        let s = text.trimmingCharacters(in: .whitespaces)
        let iso = #"^([+-][0-9]{6}|[0-9]{4})(?:-([0-9]{2})(?:-([0-9]{2}))?)?(?:T([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.([0-9]{1,3})[0-9]*)?)?(Z|[+-][0-9]{2}:[0-9]{2})?)?$"#
        guard let re = try? NSRegularExpression(pattern: iso), let m = re.firstMatch(in: s, range: NSRange(location: 0, length: (s as NSString).length)) else { return parseLegacy(s) }
        func group(_ i: Int) -> String? { let r = m.range(at: i); return r.location == NSNotFound ? nil : (s as NSString).substring(with: r) }
        let y = Double(group(1)!) ?? .nan
        let mo = (Double(group(2) ?? "1") ?? 1) - 1, d = Double(group(3) ?? "1") ?? 1
        let h = Double(group(4) ?? "0") ?? 0, mi = Double(group(5) ?? "0") ?? 0, sec = Double(group(6) ?? "0") ?? 0
        let ms = Double((group(7) ?? "0").padding(toLength: 3, withPad: "0", startingAt: 0)) ?? 0
        // Out-of-range fields make the string invalid rather than roll over; a day past its month's end (Feb 30) rolls, as in V8.
        guard (0...11).contains(mo), (1...31).contains(d), mi <= 59, sec <= 59, h < 24 || (h == 24 && mi == 0 && sec == 0 && ms == 0) else { return .nan }
        let t = makeDate(y, mo, d, h, mi, sec, ms)
        guard let zone = group(8) else {
            // Date-only forms are UTC; date-time forms without an offset are local time.
            return timeClip(group(4) == nil ? t : utc(fromLocal: t))
        }
        if zone == "Z" { return timeClip(t) }
        let sign: Double = zone.hasPrefix("-") ? -1 : 1
        let parts = zone.dropFirst().split(separator: ":").compactMap { Double($0) }
        guard parts[0] <= 23, parts[1] <= 59 else { return .nan }
        return timeClip(t - sign * (parts[0] * 60 + parts[1]) * 60_000)
    }

    /// The common non-ISO forms V8 reads: `toUTCString`'s (HTTP dates), `toString`'s, and month-name or slash dates,
    /// local time unless the text names a zone.
    private static let legacy: [DateFormatter] = [
        "EEE, d MMM yyyy HH:mm:ss zzz", "EEE, d MMM yyyy HH:mm:ss Z", "EEE MMM d yyyy HH:mm:ss 'GMT'Z", "EEE MMM d yyyy HH:mm:ss zzz",
        "EEE MMM d yyyy", "MMMM d, yyyy HH:mm:ss", "MMMM d, yyyy HH:mm", "MMMM d, yyyy", "MMM d, yyyy HH:mm:ss", "MMM d, yyyy HH:mm",
        "MMM d, yyyy", "MMM d yyyy HH:mm:ss", "MMM d yyyy HH:mm", "MMM d yyyy", "d MMMM yyyy", "d MMM yyyy",
        "yyyy/M/d HH:mm:ss", "yyyy/M/d HH:mm", "yyyy/M/d", "M/d/yyyy HH:mm:ss", "M/d/yyyy HH:mm", "M/d/yyyy",
    ].map { format in
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = format
        f.isLenient = false
        return f
    }
    private static let legacyLock = NSLock()

    private static func parseLegacy(_ text: String) -> Double {
        // toString's zone name in parentheses is a comment to V8.
        let s = text.replacingOccurrences(of: #"\s*\([^)]*\)\s*$"#, with: "", options: .regularExpression)
        legacyLock.lock()
        defer { legacyLock.unlock() }
        for f in legacy {
            f.timeZone = TimeZone.current
            if let date = f.date(from: s) { return timeClip((date.timeIntervalSince1970 * 1000).rounded()) }
        }
        return .nan
    }

    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "Date" }
    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
}

/// `a mod b` with the sign of `b`, as the date arithmetic needs.
func jsModPositive(_ a: Double, _ b: Double) -> Double {
    let r = a.truncatingRemainder(dividingBy: b)
    return r < 0 ? r + b : r
}

/// `new Date(value)` of a value not typed a number or a string: a date's time, a string parsed, anything else as its number.
public func jsNewDate(_ value: Any?) -> JSDate {
    switch jsFlat(value) {
    case let date as JSDate: return JSDate(date.time)
    case let text as String: return JSDate(text)
    default: return JSDate(jsToNumber(value))
    }
}

/// A value read untyped into a `Date`-typed field (an object from `JSON.parse`, where the date is still its
/// string): the date it holds, or the date `new Date(value)` makes of it.
public func jsDateOf(_ value: Any?) -> JSDate {
    switch jsFlat(value) {
    case let date as JSDate: return date
    case let text as String: return JSDate(text)
    case let ms as Double: return JSDate(ms)
    default: return JSDate(Double.nan)
    }
}
