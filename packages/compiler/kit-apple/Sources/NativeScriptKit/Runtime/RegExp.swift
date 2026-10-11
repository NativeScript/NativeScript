import Foundation

/// `RegExp` over NSRegularExpression (ICU), which reads JavaScript's syntax
/// for what apps write: classes, quantifiers, groups (named too), anchors,
/// lookaround, and the `g i m s y` flags. Indexes are UTF-16 offsets, as in
/// JavaScript. `lastIndex` advances for global and sticky expressions.
public final class JSRegExp: JSDynamic, JSStringConvertible {
    public let source: String
    public let flags: String
    public var lastIndex: Double = 0
    private var compiled: NSRegularExpression?

    /// Compiled on first use when its pattern is already known good (a literal, or another RegExp's source):
    /// core's modules make dozens at launch that the first screen never runs.
    var regex: NSRegularExpression {
        if let compiled { return compiled }
        do {
            let made = try JSRegExp.compile(source, flags)
            compiled = made
            return made
        } catch {
            // A literal JavaScript accepts that ICU does not: reported, and matching nothing.
            jsReportUncaught(jsCaught(error))
            let never = try! NSRegularExpression(pattern: "(?!)")
            compiled = never
            return never
        }
    }

    public convenience init(_ source: String, _ flags: String = "") throws {
        self.init(checked: source, flags)
        compiled = try JSRegExp.compile(source, flags)
    }

    private init(checked source: String, _ flags: String) {
        self.source = source
        self.flags = String(flags.sorted())
    }

    private static func compile(_ source: String, _ flags: String) throws -> NSRegularExpression {
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

    public var global: Bool { flags.contains("g") }
    public var ignoreCase: Bool { flags.contains("i") }
    public var multiline: Bool { flags.contains("m") }
    public var sticky: Bool { flags.contains("y") }

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

    /// What ICU searches for `s`: without the `u` flag, each surrogate as its stand-in, so that `.`, `[^…]` and
    /// the like match one UTF-16 unit of an astral character as JavaScript does. Offsets stay those of `s`.
    func subject(_ s: String) -> String {
        if flags.contains("u") { return s }
        if let lastInput, lastInput == s { return lastSubject }
        var units = Array(s.utf16)
        var any = false
        for k in units.indices where units[k] & 0xF800 == 0xD800 { units[k] = JSRegExp.standIn(units[k]); any = true }
        lastInput = s
        lastSubject = any ? String(decoding: units, as: UTF16.self) : s
        return lastSubject
    }
    private var lastInput: String?
    private var lastSubject = ""

    /// A surrogate's stand-in: a private-use character, one UTF-16 unit as the surrogate is, which ICU matches alone.
    /// Input that holds the private-use characters U+E000–U+E7FF itself reads as surrogates to patterns naming them.
    static func standIn(_ unit: UInt16) -> UInt16 { 0xE000 + (unit - 0xD800) }

    /// A search from an offset still sees the whole input, as JavaScript's from `lastIndex` does: lookbehind (and so `\b`)
    /// reads the text before it, and `^` does not match there.
    static let whole: NSRegularExpression.MatchingOptions = [.withTransparentBounds, .withoutAnchoringBounds]

    /// One match at or after `from`; sticky expressions only at `from`.
    func match(_ s: String, from: Int) -> NSTextCheckingResult? {
        let ns = s as NSString
        guard from <= ns.length else { return nil }
        let range = NSRange(location: from, length: ns.length - from)
        guard let m = regex.firstMatch(in: subject(s), options: sticky ? JSRegExp.whole.union(.anchored) : JSRegExp.whole, range: range) else { return nil }
        return m
    }

    /// `re.exec(s)`: the match array (with `index`), or null.
    public func exec(_ s: String) -> JSMatch? {
        let start = global || sticky ? Swift.max(0, jsClampedInt(lastIndex)) : 0
        guard let m = match(s, from: start) else {
            if global || sticky { lastIndex = 0 }
            return nil
        }
        if global || sticky { lastIndex = Double(m.range.location + m.range.length) }
        return JSMatch(m, in: s, regex: regex)
    }

    /// `re.test(s)`.
    public func test(_ s: String) -> Bool { exec(s) != nil }

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
    /// The match as the array of strings script holds it (`s.match(/x/g)` typed `string[]`); an unmatched group reads as "".
    public var jsStrings: JSArray<String> { JSArray<String>(values.storage.map { $0 ?? "" }) }

    public let index: Double
    public let input: String
    public let values: JSArray<String?>
    public let groups: JSRecord<String>?

    init(_ m: NSTextCheckingResult, in s: String, regex: NSRegularExpression) {
        let ns = s as NSString
        var parts: [String?] = []
        for g in 0..<m.numberOfRanges {
            let r = m.range(at: g)
            parts.append(r.location == NSNotFound ? nil : ns.substring(with: r))
        }
        values = JSArray(parts)
        index = Double(m.range.location)
        input = s
        let names = JSMatch.groupNames(regex.pattern)
        let named = JSRecord<String>()
        for name in names {
            let r = m.range(withName: name)
            if r.location != NSNotFound { named[name] = ns.substring(with: r) }
        }
        groups = names.isEmpty ? nil : named
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

    static func groupNames(_ pattern: String) -> [String] {
        guard let named = try? NSRegularExpression(pattern: "\\(\\?<([A-Za-z_][A-Za-z0-9_]*)>") else { return [] }
        let ns = pattern as NSString
        return named.matches(in: pattern, range: NSRange(location: 0, length: ns.length)).map { ns.substring(with: $0.range(at: 1)) }
    }
}

/// `s.match(re)`: the first match (with groups) or, for a global expression, every matched text.
public func jsMatch(_ s: String, _ re: JSRegExp) -> JSMatch? {
    if !re.global { return re.exec(s) }
    re.lastIndex = 0
    var out: [String?] = []
    while let m = re.exec(s) {
        out.append(m.values[0])
        if m.values[0]?.isEmpty ?? true { re.lastIndex += 1 }
    }
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
    var out: [JSMatch] = []
    while let m = copy.exec(s) {
        out.append(m)
        if m.values[0]?.isEmpty ?? true { copy.lastIndex += 1 }
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
    jsReplace(s, re) { m in expand(replacement, m, in: s) }
}

/// `s.replace(re, (match, ...groups) => …)`.
public func jsReplace(_ s: String, _ re: JSRegExp, _ replacer: (JSMatch) throws -> String) rethrows -> String {
    let ns = s as NSString
    var out = ""
    var cursor = 0
    var from = re.sticky ? max(0, jsClampedInt(re.lastIndex)) : 0
    while let raw = re.match(s, from: from) {
        let m = JSMatch(raw, in: s, regex: re.regex)
        out += ns.substring(with: NSRange(location: cursor, length: raw.range.location - cursor))
        out += try replacer(m)
        cursor = raw.range.location + raw.range.length
        from = raw.range.length == 0 ? cursor + 1 : cursor
        if !re.global || from > ns.length { break }
    }
    if re.global { re.lastIndex = 0 }
    return out + ns.substring(from: min(cursor, ns.length))
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
    let ns = s as NSString
    let max = limit.map { Int(jsToUint32($0)) } ?? Int.max
    var out: [String?] = []
    if ns.length == 0 { return JSArray(re.match(s, from: 0) == nil ? [s] : []) }
    // RegExp.prototype[@@split]: a match at q ending at e splits unless it would make an empty piece at p.
    let subject = re.subject(s)
    var p = 0, q = 0
    while q < ns.length {
        guard let m = re.regex.firstMatch(in: subject, options: JSRegExp.whole.union(.anchored), range: NSRange(location: q, length: ns.length - q)) else { q += 1; continue }
        let e = min(m.range.location + m.range.length, ns.length)
        if e == p { q += 1; continue }
        out.append(ns.substring(with: NSRange(location: p, length: q - p)))
        if out.count == max { return JSArray(out) }
        for g in 1..<m.numberOfRanges {
            let r = m.range(at: g)
            out.append(r.location == NSNotFound ? nil : ns.substring(with: r))
            if out.count == max { return JSArray(out) }
        }
        p = e
        q = p
    }
    if out.count < max { out.append(ns.substring(from: p)) }
    return JSArray(out)
}
