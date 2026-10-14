import Foundation

/// `RegExp` over NSRegularExpression (ICU), which reads JavaScript's syntax
/// for what apps write: classes, quantifiers, groups (named too), anchors,
/// lookaround, and the `g i m s y` flags. Indexes are UTF-16 offsets, as in
/// JavaScript. `lastIndex` advances for global and sticky expressions.
public final class JSRegExp: JSDynamic, JSStringConvertible {
    nonisolated deinit {}
    public let source: String
    public let flags: String
    public var lastIndex: Double = 0
    private var compiled: JSRegExpProgram?

    /// Compiled on first use when its pattern is already known good (a literal, or another RegExp's source):
    /// core's modules make dozens at launch that the first screen never runs.
    var program: JSRegExpProgram {
        if let compiled { return compiled }
        do {
            let made = try JSRegExpProgram.of(source, flags)
            compiled = made
            return made
        } catch {
            // A literal JavaScript accepts that ICU does not: reported, and matching nothing.
            jsReportUncaught(jsCaught(error))
            let never = JSRegExpProgram(regex: try! NSRegularExpression(pattern: "(?!)"), groupNames: [])
            compiled = never
            return never
        }
    }

    var regex: NSRegularExpression { program.regex }

    public convenience init(_ source: String, _ flags: String = "") throws {
        self.init(checked: source, flags)
        compiled = try JSRegExpProgram.of(self.source, self.flags)
    }

    private init(checked source: String, _ flags: String) {
        // An empty pattern's source is "(?:)", which ICU also accepts where it refuses "".
        self.source = source.isEmpty ? "(?:)" : source
        self.flags = String(flags.sorted())
    }

    fileprivate static func compile(_ source: String, _ flags: String) throws -> NSRegularExpression {
        var options: NSRegularExpression.Options = []
        if flags.contains("i") { options.insert(.caseInsensitive) }
        if flags.contains("m") { options.insert(.anchorsMatchLines) }
        if flags.contains("s") { options.insert(.dotMatchesLineSeparators) }
        do {
            return try NSRegularExpression(pattern: JSRegExp.translate(source, flags), options: options)
        } catch {
            throw JSException(value: JSSyntaxError("Invalid regular expression: /\(source)/\(flags): \(error.localizedDescription)"))
        }
    }

    /// A literal's pattern, which TypeScript checked: compiled when first used.
    static func literal(_ source: String, _ flags: String) -> JSRegExp { JSRegExp(checked: source, flags) }

    /// `new RegExp(pattern, flags)` of a pattern that may be a RegExp: its source, and its flags unless others are given.
    public static func construct(_ pattern: Any?, _ flags: Any? = nil) throws -> JSRegExp {
        let given = jsIsUndefined(jsFlat(flags) as Any?) ? nil : jsToString(flags)
        if let re = jsFlat(pattern) as? JSRegExp { return JSRegExp(checked: re.source, given ?? re.flags) }
        return try JSRegExp(jsFlat(pattern) == nil ? "(?:)" : jsToString(pattern), given ?? "")
    }

    public var global: Bool { flags.utf8.contains(UInt8(ascii: "g")) }
    public var ignoreCase: Bool { flags.utf8.contains(UInt8(ascii: "i")) }
    public var multiline: Bool { flags.utf8.contains(UInt8(ascii: "m")) }
    public var sticky: Bool { flags.utf8.contains(UInt8(ascii: "y")) }
    var unicode: Bool { flags.utf8.contains(UInt8(ascii: "u")) }

    /// JavaScript's syntax in ICU's terms. ICU reads `[^]`, `[]`, `\0` and, inside a class, `[`, `&&` and `--` differently;
    /// its `\d \w \s \b .` and `$` are Unicode-aware or line-aware where JavaScript's are ASCII or input-wide.
    /// Without the `u` flag JavaScript matches UTF-16 code units: astral characters of the pattern become their
    /// surrogates' stand-ins, as `subject` gives the input's (see `standIn`).
    private static func translate(_ pattern: String, _ flags: String) -> String {
        let unicode = flags.contains("u"), multiline = flags.contains("m"), dotAll = flags.contains("s")
        // ICU closes ASCII classes over case with `ſ` and the Kelvin sign; JavaScript does so only with `u`.
        let caseless = flags.contains("i") && !unicode
        func exact(_ p: String) -> String { caseless ? "(?-i:\(p))" : p }
        let word = "[A-Za-z0-9_]", notWord = "[^A-Za-z0-9_]"
        let space = "\\t\\n\\x{0B}\\f\\r \\x{A0}\\x{1680}\\x{2000}-\\x{200A}\\x{2028}\\x{2029}\\x{202F}\\x{205F}\\x{3000}\\x{FEFF}"
        let terminator = "[\\n\\r\\x{2028}\\x{2029}]"
        let p = Array(pattern.unicodeScalars)
        var out = ""
        var i = 0
        var inClass = false
        func unit(_ u: UInt32) -> String { "\\x{" + String(u, radix: 16) + "}" }
        func literal(_ c: Unicode.Scalar) {
            if !unicode && c.value > 0xFFFF { for u in String(c).utf16 { out += unit(UInt32(standIn(u))) } }
            else { out.unicodeScalars.append(c) }
        }
        func hex(_ from: Int, _ count: Int) -> UInt32? {
            guard from + count <= p.count else { return nil }
            return UInt32(String(String.UnicodeScalarView(p[from..<(from + count)])), radix: 16)
        }
        while i < p.count {
            let c = p[i]
            if c == "\\", i + 1 < p.count {
                let e = p[i + 1]
                i += 2
                switch e {
                case "d": out += "[0-9]"
                case "D": out += inClass ? "[^0-9]" : exact("[^0-9]")
                case "w": out += inClass ? word : exact(word)
                case "W": out += inClass ? notWord : exact(notWord)
                case "s": out += "[\(space)]"
                case "S": out += "[^\(space)]"
                case "b" where inClass: out += "\\x{8}"
                case "b": out += exact("(?:(?<=\(word))(?!\(word))|(?<!\(word))(?=\(word)))")
                case "B": out += exact("(?:(?<=\(word))(?=\(word))|(?<!\(word))(?!\(word)))")
                case "0" where i >= p.count || !("0"..."9").contains(p[i]): out += "\\x{0}"
                case "u" where unicode && i < p.count && p[i] == "{":
                    if let close = p[i...].firstIndex(of: "}"), let v = hex(i + 1, close - i - 1) { out += unit(v); i = close + 1 }
                    else { out += "\\u" }
                case "u" where !unicode:
                    if let v = hex(i, 4), (0xD800...0xDFFF).contains(v) { out += unit(UInt32(standIn(UInt16(v)))); i += 4 }
                    else { out += "\\u" }
                default:
                    if e.value > 0xFFFF { literal(e) } else { out.unicodeScalars.append(c); out.unicodeScalars.append(e) }
                }
                continue
            }
            if !inClass && c == "[" {
                if i + 2 < p.count, p[i + 1] == "^", p[i + 2] == "]" { out += "[\\s\\S]"; i += 3; continue }
                if i + 1 < p.count, p[i + 1] == "]" { out += "(?!)"; i += 2; continue }
                inClass = true
                out += "["
                // A `]` first in the class (after `^`) is JavaScript's end of an empty class, handled above.
                if i + 1 < p.count, p[i + 1] == "^" { out += "^"; i += 1 }
                i += 1
                continue
            }
            if inClass {
                if c == "]" { inClass = false }
                else if c == "[" { out += "\\["; i += 1; continue }
                else if c == "&" || c == "-", i + 1 < p.count, p[i + 1] == c { out.unicodeScalars.append(c); out += "\\"; out.unicodeScalars.append(c); i += 2; continue }
            } else {
                switch c {
                case ".": out += dotAll ? "[\\s\\S]" : "[^\\n\\r\\x{2028}\\x{2029}]"; i += 1; continue
                case "$": out += multiline ? "(?=\(terminator)|\\z)" : "\\z"; i += 1; continue
                case "^": out += multiline ? "(?:\\A|(?<=\(terminator)))" : "\\A"; i += 1; continue
                default: break
                }
            }
            literal(c)
            i += 1
        }
        return out
    }

    /// A surrogate's stand-in: a private-use character, one UTF-16 unit as the surrogate is, which ICU matches alone.
    /// Input that holds the private-use characters U+E000–U+E7FF itself reads as surrogates to patterns naming them.
    static func standIn(_ unit: UInt16) -> UInt16 { 0xE000 + (unit - 0xD800) }

    /// A search from an offset still sees the whole input, as JavaScript's from `lastIndex` does: lookbehind (and so `\b`)
    /// reads the text before it, and `^` does not match there.
    static let whole: NSRegularExpression.MatchingOptions = [.withTransparentBounds, .withoutAnchoringBounds]

    /// One match in `subject` at or after `from`; sticky expressions only at `from`.
    func match(_ subject: JSRegExpSubject, from: Int) -> NSTextCheckingResult? {
        guard from <= subject.units.count else { return nil }
        let range = NSRange(location: from, length: subject.units.count - from)
        return regex.firstMatch(in: subject.searched(unicode: unicode), options: sticky ? JSRegExp.whole.union(.anchored) : JSRegExp.whole, range: range)
    }

    func match(_ s: String, from: Int) -> NSTextCheckingResult? { match(JSRegExpSubject.of(s), from: from) }

    /// Every match of a global expression from the start, as repeated RegExpExec finds them: past an empty match
    /// the search moves on by one unit, or by a code point with the `u` flag; a sticky one stops at the first gap.
    func matches(_ subject: JSRegExpSubject) -> [NSTextCheckingResult] {
        guard !sticky else {
            var out: [NSTextCheckingResult] = []
            var from = 0
            while let m = match(subject, from: from) {
                out.append(m)
                let end = m.range.location + m.range.length
                from = m.range.length == 0 ? advance(subject, end) : end
            }
            return out
        }
        // ICU's own iteration moves past an empty match by one code point, and the searched text has no surrogates
        // without the `u` flag: one search, set up once.
        return regex.matches(in: subject.searched(unicode: unicode), options: JSRegExp.whole, range: NSRange(location: 0, length: subject.units.count))
    }

    /// RegExpBuiltinExec's search: from `lastIndex` for a global or sticky expression, which it then advances
    /// past the match, or resets when there is none.
    private func search(_ subject: JSRegExpSubject) -> NSTextCheckingResult? {
        guard global || sticky else { return match(subject, from: 0) }
        guard let m = match(subject, from: Swift.max(0, jsClampedInt(lastIndex))) else {
            lastIndex = 0
            return nil
        }
        lastIndex = Double(m.range.location + m.range.length)
        return m
    }

    /// `re.exec(s)`: the match array (with `index`), or null.
    public func exec(_ s: String) -> JSMatch? {
        let subject = JSRegExpSubject.of(s)
        return search(subject).map { JSMatch($0, in: subject, groupNames: program.groupNames) }
    }

    /// `re.test(s)`.
    public func test(_ s: String) -> Bool { search(JSRegExpSubject.of(s)) != nil }

    /// AdvanceStringIndex: past an empty match, by one unit, or with the `u` flag by one code point.
    func advance(_ subject: JSRegExpSubject, _ index: Int) -> Int {
        let units = subject.units
        guard unicode, index + 1 < units.count, UTF16.isLeadSurrogate(units[index]), UTF16.isTrailSurrogate(units[index + 1]) else { return index + 1 }
        return index + 2
    }

    public var jsKeys: [String] { ["lastIndex"] }
    public var jsClassName: String? { "RegExp" }
    public subscript(jsKey key: String) -> Any? {
        get { key == "lastIndex" ? lastIndex : key == "source" ? source : key == "flags" ? flags : nil }
        set { if key == "lastIndex", let v = newValue as? Double { lastIndex = v } }
    }

    public func toString() -> String { "/\(source)/\(flags)" }
}

/// The array `exec` and `match` return: the matched text, then each group
/// (undefined when it did not take part), with `index` and `groups`.
public final class JSMatch {
    nonisolated deinit {}
    /// The match as the array of strings script holds it (`s.match(/x/g)` typed `string[]`); an unmatched group reads as "".
    public var jsStrings: JSArray<String> { JSArray<String>(values.storage.map { $0 ?? "" }) }

    public let index: Double
    public let input: String
    public let values: JSArray<String?>
    public let groups: JSRecord<String>?

    init(_ m: NSTextCheckingResult, in subject: JSRegExpSubject, groupNames names: [String]) {
        var parts: [String?] = []
        parts.reserveCapacity(m.numberOfRanges)
        for g in 0..<m.numberOfRanges {
            let r = m.range(at: g)
            parts.append(r.location == NSNotFound ? nil : subject.text(r))
        }
        values = JSArray(parts)
        index = Double(m.range.location)
        input = subject.string
        if names.isEmpty {
            groups = nil
        } else {
            let named = JSRecord<String>()
            for name in names {
                let r = m.range(withName: name)
                if r.location != NSNotFound { named[name] = subject.text(r) }
            }
            groups = named
        }
    }

    init(all: [String?], input: String) {
        values = JSArray(all)
        index = .nan
        self.input = input
        groups = nil
    }

    /// `match(re) || []`: no matches.
    public convenience init() { self.init(all: [], input: "") }

    /// A group's text; a group that did not take part reads as "" (JavaScript has undefined there).
    public subscript(_ i: Int) -> String { i < values.count ? values[i] ?? "" : "" }
    public var length: Double { values.length }

}

/// A pattern compiled for ICU with the names of its groups: one for every RegExp of the same source and flags,
/// since a literal makes a new RegExp each time it is evaluated (`/x/.test(line)` in a loop).
final class JSRegExpProgram {
    nonisolated deinit {}
    let regex: NSRegularExpression
    let groupNames: [String]

    init(regex: NSRegularExpression, groupNames: [String]) {
        self.regex = regex
        self.groupNames = groupNames
    }

    private struct Key: Hashable {
        let source: String
        let flags: String
    }

    private static var cache: [Key: JSRegExpProgram] = [:]
    private static let lock = NSLock()
    /// Patterns made at run time (`new RegExp(text)`) are unbounded: past this many, the cache starts over.
    private static let limit = 512

    static func of(_ source: String, _ flags: String) throws -> JSRegExpProgram {
        let key = Key(source: source, flags: flags)
        lock.lock()
        let known = cache[key]
        lock.unlock()
        if let known { return known }
        let regex = try JSRegExp.compile(source, flags)
        let program = JSRegExpProgram(regex: regex, groupNames: names(source))
        lock.lock()
        if cache.count >= limit { cache.removeAll(keepingCapacity: true) }
        cache[key] = program
        lock.unlock()
        return program
    }

    private static let namedGroup = try! NSRegularExpression(pattern: "\\(\\?<([A-Za-z_][A-Za-z0-9_]*)>")

    private static func names(_ pattern: String) -> [String] {
        let text = pattern as NSString
        return namedGroup.matches(in: pattern, range: NSRange(location: 0, length: text.length)).map { text.substring(with: $0.range(at: 1)) }
    }
}

/// A string as matching reads it: its UTF-16 units, which ICU's and JavaScript's offsets index, and the text
/// ICU searches, made once. The last one is kept for the next search of the same string, as an exec loop makes,
/// or a literal evaluated again over the same text (`text.match(/x/g)` in a function).
final class JSRegExpSubject {
    nonisolated deinit {}
    let string: String
    let units: [UInt16]
    private let hasSurrogates: Bool
    private var plain: String?
    private var standIns: String?

    private init(_ string: String) {
        self.string = string
        units = Array(string.utf16)
        hasSurrogates = units.contains(where: UTF16.isSurrogate)
    }

    private static var last: JSRegExpSubject?
    private static let lock = NSLock()

    static func of(_ s: String) -> JSRegExpSubject {
        lock.lock()
        defer { lock.unlock() }
        if let last, jsSameText(last.string, s) { return last }
        let made = JSRegExpSubject(s)
        last = made
        return made
    }

    /// What ICU searches: UTF-16 storage, which it reads in place. Without the `u` flag each surrogate is its
    /// stand-in, so that `.`, `[^…]` and the like match one unit of an astral character as JavaScript does.
    func searched(unicode: Bool) -> String {
        JSRegExpSubject.lock.lock()
        defer { JSRegExpSubject.lock.unlock() }
        if unicode || !hasSurrogates {
            if plain == nil { plain = JSRegExpSubject.utf16String(units) }
            return plain!
        }
        if standIns == nil { standIns = JSRegExpSubject.utf16String(units.map { UTF16.isSurrogate($0) ? JSRegExp.standIn($0) : $0 }) }
        return standIns!
    }

    private static func utf16String(_ units: [UInt16]) -> String {
        units.withUnsafeBufferPointer { buffer in buffer.baseAddress.map { NSString(characters: $0, length: buffer.count) as String } ?? "" }
    }

    /// The text at `range`; a bound inside a surrogate pair, which matching a stand-in can make, leaves a lone
    /// surrogate, which becomes U+FFFD.
    func text(_ range: NSRange) -> String {
        jsString(utf16: units[range.location..<(range.location + range.length)])
    }
}

/// `a === b`, at once for one string's storage held twice.
private func jsSameText(_ a: String, _ b: String) -> Bool {
    let same = a.utf8.withContiguousStorageIfAvailable { p in b.utf8.withContiguousStorageIfAvailable { q in p.baseAddress == q.baseAddress && p.count == q.count } }
    return same == true || jsStringEquals(a, b)
}

private extension UTF16 {
    static func isSurrogate(_ unit: UInt16) -> Bool { unit & 0xF800 == 0xD800 }
}

/// The text of `s` at `range`, UTF-16 offsets as ICU and JavaScript give them.
func jsSubstring(_ s: String, _ range: NSRange) -> String {
    JSRegExpSubject.of(s).text(range)
}

/// `s.match(re)`: the first match (with groups) or, for a global expression, every matched text.
public func jsMatch(_ s: String, _ re: JSRegExp) -> JSMatch? {
    if !re.global { return re.exec(s) }
    let subject = JSRegExpSubject.of(s)
    let out: [String?] = re.matches(subject).map { subject.text($0.range) }
    re.lastIndex = 0
    return out.isEmpty ? nil : JSMatch(all: out, input: s)
}

/// What `s.match(x)` searches with: a RegExp as it is, anything else as `new RegExp(x)`.
public func jsRegExpFrom(_ value: Any?) throws -> JSRegExp {
    if let re = jsFlat(value) as? JSRegExp { return re }
    return try JSRegExp(jsFlat(value) == nil ? "(?:)" : jsToString(value))
}

/// A regular expression literal: TypeScript accepted its syntax; ICU must too.
public func jsRegExpLiteral(_ source: String, _ flags: String) -> JSRegExp {
    JSRegExp.literal(source, flags)
}

/// `s.matchAll(re)` (re must be global).
public func jsMatchAll(_ s: String, _ re: JSRegExp) throws -> JSArray<JSMatch> {
    guard re.global else { throw JSException(value: JSTypeError("String.prototype.matchAll called with a non-global RegExp argument")) }
    let copy = try JSRegExp(re.source, re.flags)
    copy.lastIndex = re.lastIndex
    var out: [JSMatch] = []
    while let m = copy.exec(s) {
        out.append(m)
        if m.values[0]?.isEmpty ?? true { copy.lastIndex = Double(copy.advance(JSRegExpSubject.of(s), jsClampedInt(copy.lastIndex))) }
    }
    return JSArray(out)
}

/// `s.search(re)`.
public func jsSearch(_ s: String, _ re: JSRegExp) -> Double {
    re.match(s, from: 0).map { Double($0.range.location) } ?? -1
}

/// `s.replace(re, replacement)` with JavaScript's `$&`, `$1`, `$<name>`, `$$`, `` $` `` and `$'` patterns.
/// `s.replace(pattern, replacement)` with an untyped pattern: a regular expression replaces as one, any other value by its string.
public func jsReplace(_ s: String, untyped pattern: Any?, _ replacement: String) -> String {
    if let re = jsFlat(pattern) as? JSRegExp { return jsReplace(s, re, replacement) }
    return jsReplace(s, jsToString(pattern), replacement)
}

public func jsReplace(_ s: String, _ re: JSRegExp, _ replacement: String) -> String {
    // Without a `$` the replacement is the same text for every match, and no match needs its groups read.
    guard replacement.utf8.contains(UInt8(ascii: "$")) else { return jsReplace(s, re, replacing: { _ in replacement }) }
    return jsReplace(s, re) { m in expand(replacement, m, in: s) }
}

/// `s.replace(re, (match, ...groups) => …)`.
public func jsReplace(_ s: String, _ re: JSRegExp, _ replacer: (JSMatch) throws -> String) rethrows -> String {
    let names = re.program.groupNames
    let subject = JSRegExpSubject.of(s)
    return try jsReplace(s, re, replacing: { try replacer(JSMatch($0, in: subject, groupNames: names)) })
}

/// RegExp.prototype[@@replace]: each match (only the first unless global; at `lastIndex` and nowhere else when
/// sticky) replaced by `replacement`, the text between the matches copied from `s`. A global expression's matches
/// are all found before the first replacement is made.
private func jsReplace(_ s: String, _ re: JSRegExp, replacing replacement: (NSTextCheckingResult) throws -> String) rethrows -> String {
    let subject = JSRegExpSubject.of(s)
    let matches: [NSTextCheckingResult]
    if re.global {
        matches = re.matches(subject)
        re.lastIndex = 0
    } else if let m = re.sticky ? re.match(subject, from: max(0, jsClampedInt(re.lastIndex))) : re.match(subject, from: 0) {
        matches = [m]
        if re.sticky { re.lastIndex = Double(m.range.location + m.range.length) }
    } else {
        if re.sticky { re.lastIndex = 0 }
        return s
    }
    guard !matches.isEmpty else { return s }
    var out: [UInt16] = []
    out.reserveCapacity(subject.units.count)
    var cursor = 0
    for m in matches {
        out += subject.units[cursor..<m.range.location]
        out += try replacement(m).utf16
        cursor = m.range.location + m.range.length
    }
    out += subject.units[cursor...]
    return jsString(utf16: out)
}

public func jsReplaceAll(_ s: String, _ re: JSRegExp, _ replacement: String) throws -> String {
    guard re.global else { throw JSException(value: JSTypeError("replaceAll must be called with a global RegExp")) }
    return jsReplace(s, re, replacement)
}

private func expand(_ template: String, _ m: JSMatch, in s: String) -> String {
    jsSubstitution(template, matched: m.values[0] ?? "", at: Int(m.index), in: s, captures: m.values.storage, groups: m.groups)
}

/// GetSubstitution: `template` with `$$`, `$&`, `` $` ``, `$'`, `$n` and `$<name>` expanded for the match of `matched`
/// at UTF-16 offset `position` of `s`. `captures` holds the match then each group.
func jsSubstitution(_ template: String, matched: String, at position: Int, in s: String, captures: [String?], groups: JSRecord<String>?) -> String {
    let t = Array(template.utf16)
    guard t.contains(36) else { return template }
    let ns = s as NSString
    var out: [UInt16] = []
    var i = 0
    func append(_ text: String?) { out.append(contentsOf: (text ?? "").utf16) }
    while i < t.count {
        guard t[i] == 36, i + 1 < t.count else { out.append(t[i]); i += 1; continue } // `$`
        let c = t[i + 1]
        switch c {
        case 36: out.append(36); i += 2
        case 38: append(matched); i += 2 // `$&`
        case 96: append(ns.substring(to: position)); i += 2 // `` $` ``
        case 39: append(ns.substring(from: min(ns.length, position + matched.utf16.count))); i += 2 // `$'`
        case 60: // `$<name>`
            if let close = t[(i + 2)...].firstIndex(of: 62), let groups {
                append(groups[String(decoding: t[(i + 2)..<close], as: UTF16.self)])
                i = close + 1
            } else { out.append(t[i]); i += 1 }
        case 48...57:
            var n = Int(c - 48)
            var used = 2
            if i + 2 < t.count, (48...57).contains(t[i + 2]), n * 10 + Int(t[i + 2] - 48) < captures.count { n = n * 10 + Int(t[i + 2] - 48); used = 3 }
            if n >= 1 && n < captures.count { append(captures[n]); i += used } else { out.append(t[i]); i += 1 }
        default: out.append(t[i]); i += 1
        }
    }
    return String(decoding: out, as: UTF16.self)
}

/// `s.split(re)`: captured groups are spliced into the result, as in JavaScript.
public func jsSplit(_ s: String, _ re: JSRegExp, _ limit: Double? = nil) -> JSArray<String?> {
    let subject = JSRegExpSubject.of(s)
    let length = subject.units.count
    let max = limit.map { Int(jsToUint32($0)) } ?? Int.max
    var out: [String?] = []
    if length == 0 { return JSArray(re.match(subject, from: 0) == nil ? [s] : []) }
    // RegExp.prototype[@@split]: a match at q ending at e splits unless it would make an empty piece at p.
    let searched = subject.searched(unicode: re.unicode)
    var p = 0, q = 0
    while q < length {
        guard let m = re.regex.firstMatch(in: searched, options: JSRegExp.whole.union(.anchored), range: NSRange(location: q, length: length - q)) else { q += 1; continue }
        let e = min(m.range.location + m.range.length, length)
        if e == p { q += 1; continue }
        out.append(subject.text(NSRange(location: p, length: q - p)))
        if out.count == max { return JSArray(out) }
        for g in 1..<m.numberOfRanges {
            let r = m.range(at: g)
            out.append(r.location == NSNotFound ? nil : subject.text(r))
            if out.count == max { return JSArray(out) }
        }
        p = e
        q = p
    }
    if out.count < max { out.append(subject.text(NSRange(location: p, length: length - p))) }
    return JSArray(out)
}
