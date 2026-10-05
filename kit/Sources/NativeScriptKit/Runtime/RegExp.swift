import Foundation

/// `RegExp` over NSRegularExpression (ICU), which reads JavaScript's syntax
/// for what apps write: classes, quantifiers, groups (named too), anchors,
/// lookaround, and the `g i m s y` flags. Indexes are UTF-16 offsets, as in
/// JavaScript. `lastIndex` advances for global and sticky expressions.
public final class JSRegExp: JSDynamic, JSStringConvertible {
    public let source: String
    public let flags: String
    public var lastIndex: Double = 0
    let regex: NSRegularExpression

    public init(_ source: String, _ flags: String = "") throws {
        self.source = source
        self.flags = String(flags.sorted())
        var options: NSRegularExpression.Options = []
        if flags.contains("i") { options.insert(.caseInsensitive) }
        if flags.contains("m") { options.insert(.anchorsMatchLines) }
        if flags.contains("s") { options.insert(.dotMatchesLineSeparators) }
        do {
            regex = try NSRegularExpression(pattern: JSRegExp.translate(source), options: options)
        } catch {
            throw JSException(value: JSSyntaxError("Invalid regular expression: /\(source)/\(flags): \(error.localizedDescription)"))
        }
    }

    public var global: Bool { flags.contains("g") }
    public var ignoreCase: Bool { flags.contains("i") }
    public var multiline: Bool { flags.contains("m") }
    public var sticky: Bool { flags.contains("y") }

    /// Pattern syntax ICU reads differently: `[^]` (any character), `[]` (no character), and inside a class
    /// a `[` (ICU starts a nested set or a POSIX class there) or `&&` (ICU's intersection), which JavaScript takes literally.
    private static func translate(_ pattern: String) -> String {
        let chars = Array(pattern)
        var out = ""
        var i = 0
        var inClass = false
        while i < chars.count {
            let c = chars[i]
            if c == "\\", i + 1 < chars.count {
                out.append(c); out.append(chars[i + 1]); i += 2; continue
            }
            if !inClass && c == "[" {
                if i + 2 < chars.count, chars[i + 1] == "^", chars[i + 2] == "]" { out += "[\\s\\S]"; i += 3; continue }
                if i + 1 < chars.count, chars[i + 1] == "]" { out += "(?!)"; i += 2; continue }
                inClass = true
                out.append(c)
                // A `]` first in the class (after `^`) is JavaScript's end of an empty class, handled above.
                if i + 1 < chars.count, chars[i + 1] == "^" { out.append("^"); i += 1 }
                i += 1
                continue
            }
            if inClass {
                if c == "]" { inClass = false }
                else if c == "[" { out += "\\["; i += 1; continue }
                else if c == "&", i + 1 < chars.count, chars[i + 1] == "&" { out += "&\\&"; i += 2; continue }
            }
            out.append(c)
            i += 1
        }
        return out
    }

    /// One match at or after `from`; sticky expressions only at `from`.
    func match(_ s: String, from: Int) -> NSTextCheckingResult? {
        let ns = s as NSString
        guard from <= ns.length else { return nil }
        let range = NSRange(location: from, length: ns.length - from)
        guard let m = regex.firstMatch(in: s, options: sticky ? [.anchored] : [], range: range) else { return nil }
        return m
    }

    /// `re.exec(s)`: the match array (with `index`), or null.
    public func exec(_ s: String) -> JSMatch? {
        let start = global || sticky ? Int(lastIndex) : 0
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
    do { return try JSRegExp(source, flags) } catch { fatalError("/\(source)/\(flags) is not a pattern NSRegularExpression accepts: \(jsToString(jsCaught(error)))") }
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
    var from = re.sticky ? Int(re.lastIndex) : 0
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
    let t = Array(template.utf16)
    let ns = s as NSString
    var out: [UInt16] = []
    var i = 0
    func append(_ text: String?) { out.append(contentsOf: (text ?? "").utf16) }
    while i < t.count {
        guard t[i] == 36, i + 1 < t.count else { out.append(t[i]); i += 1; continue } // `$`
        let c = t[i + 1]
        switch c {
        case 36: out.append(36); i += 2
        case 38: append(m.values[0]); i += 2 // `$&`
        case 96: append(ns.substring(to: Int(m.index))); i += 2 // `` $` ``
        case 39: append(ns.substring(from: Int(m.index) + (m.values[0]?.utf16.count ?? 0))); i += 2 // `$'`
        case 60: // `$<name>`
            if let close = t[(i + 2)...].firstIndex(of: 62), let groups = m.groups {
                append(groups[String(decoding: t[(i + 2)..<close], as: UTF16.self)])
                i = close + 1
            } else { out.append(t[i]); i += 1 }
        case 48...57:
            var n = Int(c - 48)
            var used = 2
            if i + 2 < t.count, (48...57).contains(t[i + 2]), n * 10 + Int(t[i + 2] - 48) < m.values.count { n = n * 10 + Int(t[i + 2] - 48); used = 3 }
            if n >= 1 && n < m.values.count { append(m.values[n]); i += used } else { out.append(t[i]); i += 1 }
        default: out.append(t[i]); i += 1
        }
    }
    return String(decoding: out, as: UTF16.self)
}

/// `s.split(re)`: captured groups are spliced into the result, as in JavaScript.
public func jsSplit(_ s: String, _ re: JSRegExp, _ limit: Double? = nil) -> JSArray<String?> {
    let ns = s as NSString
    let max = limit.map { Int($0) } ?? Int.max
    var out: [String?] = []
    if ns.length == 0 { return JSArray(re.match(s, from: 0) == nil ? [s] : []) }
    // RegExp.prototype[@@split]: a match at q ending at e splits unless it would make an empty piece at p.
    var p = 0, q = 0
    while q < ns.length {
        guard let m = re.regex.firstMatch(in: s, options: [.anchored], range: NSRange(location: q, length: ns.length - q)) else { q += 1; continue }
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
