import Foundation

// Regular expressions with ECMA-262 §22.2 semantics over this kit's own engine (RegExpEngine.swift), a port of
// kit-android's RegExp.kt kept parallel to it. Indexes are UTF-16 offsets, as in JavaScript.

/// A JavaScript `RegExp`. Constructing an invalid pattern or flags throws a SyntaxError.
public final class JSRegExp: JSDynamic, JSStringConvertible {
    nonisolated deinit {}
    /// `re.source`: the pattern as a literal would spell it, made when first read: a literal evaluated in a loop
    /// makes a new RegExp each time.
    public private(set) lazy var source: String = JSRegExp.escapePattern(pattern)
    /// `re.flags`, in the canonical order `dgimsuvy`.
    public let flags: String
    public var lastIndex: Double = 0
    private let pattern: String
    private var compiled: RegexProgram?

    public convenience init(_ source: String, _ flags: String = "") throws {
        try JSRegExp.checkFlags(flags)
        self.init(checked: source, flags)
        compiled = try JSRegExp.compile(pattern, self.flags)
    }

    private init(checked pattern: String, _ flags: String) {
        self.pattern = pattern
        self.flags = String("dgimsuvy".filter { flags.contains($0) })
    }

    /// The same expression, sharing its compiled pattern, with `lastIndex` at 0.
    private init(sharing re: JSRegExp) {
        pattern = re.pattern
        flags = re.flags
        compiled = re.compiled
    }

    /// Compiled on first use when its pattern is already known good (a literal, or another RegExp's source):
    /// core's modules make dozens at launch that the first screen never runs.
    var program: RegexProgram {
        if let compiled { return compiled }
        do {
            let made = try JSRegExp.compile(pattern, flags)
            compiled = made
            return made
        } catch {
            // A literal TypeScript accepted that this engine does not: reported, and matching nothing.
            jsReportUncaught(jsCaught(error))
            let never = try! JSRegExp.compile("(?!)", "")
            compiled = never
            return never
        }
    }

    /// A literal's pattern, which TypeScript checked: compiled when first used.
    static func literal(_ source: String, _ flags: String) -> JSRegExp { JSRegExp(checked: source, flags) }

    /// `new RegExp(pattern, flags)` of a pattern that may be a RegExp: its source, and its flags unless others are given.
    public static func construct(_ pattern: Any?, _ flags: Any? = nil) throws -> JSRegExp {
        let given = jsIsUndefined(jsFlat(flags) as Any?) ? nil : jsToString(flags)
        if let re = jsFlat(pattern) as? JSRegExp {
            guard let given else { return JSRegExp(sharing: re) }
            return try JSRegExp(re.pattern, given)
        }
        return try JSRegExp(jsFlat(pattern) == nil ? "(?:)" : jsToString(pattern), given ?? "")
    }

    public var hasIndices: Bool { flags.utf8.contains(UInt8(ascii: "d")) }
    public var global: Bool { flags.utf8.contains(UInt8(ascii: "g")) }
    public var ignoreCase: Bool { flags.utf8.contains(UInt8(ascii: "i")) }
    public var multiline: Bool { flags.utf8.contains(UInt8(ascii: "m")) }
    public var dotAll: Bool { flags.utf8.contains(UInt8(ascii: "s")) }
    public var unicode: Bool { flags.utf8.contains(UInt8(ascii: "u")) }
    public var unicodeSets: Bool { flags.utf8.contains(UInt8(ascii: "v")) }
    public var sticky: Bool { flags.utf8.contains(UInt8(ascii: "y")) }
    var fullUnicode: Bool { unicode || unicodeSets }

    /// RegExpBuiltinExec without the result array: the capture slots (start and end per group, -1 when unset) of a match
    /// at or after `lastIndex` (exactly there when sticky), updating `lastIndex` for global and sticky expressions.
    func execCaptures(_ subject: JSRegExpSubject) -> [Int]? {
        let useLastIndex = global || sticky
        let units = subject.units
        let start = useLastIndex ? JSRegExp.toLength(lastIndex) : 0
        if start > units.count {
            if useLastIndex { lastIndex = 0 }
            return nil
        }
        var from = start
        // As V8 does: a search that lastIndex puts inside a surrogate pair starts at the pair.
        if useLastIndex && fullUnicode && from > 0 && from < units.count && isTrailUnit(units[from]) && isLeadUnit(units[from - 1]) { from -= 1 }
        let captures = search(subject, from, sticky)
        if useLastIndex { lastIndex = captures.map { Double($0[1]) } ?? 0 }
        return captures
    }

    /// The capture slots of the first match at or after `from` (exactly there when `sticky`), or nil; `lastIndex` untouched.
    func search(_ subject: JSRegExpSubject, _ from: Int, _ sticky: Bool) -> [Int]? {
        let program = self.program
        return subject.units.withUnsafeBufferPointer { JSRegExp.machine.search(program, $0, from, sticky) }
    }

    /// RegExpBuiltinExec: a match at or after `lastIndex` (exactly there when sticky), updating `lastIndex` for global and sticky expressions.
    public func exec(_ s: String) -> JSMatch? {
        let subject = JSRegExpSubject.of(s)
        return execCaptures(subject).map { makeMatch(subject, $0) }
    }

    /// `re.test(s)`.
    public func test(_ s: String) -> Bool { execCaptures(JSRegExpSubject.of(s)) != nil }

    func makeMatch(_ subject: JSRegExpSubject, _ captures: [Int]) -> JSMatch {
        let n = captures.count / 2
        var values: [String?] = []
        values.reserveCapacity(n)
        for g in 0..<n { values.append(captures[2 * g] < 0 ? nil : subject.text(captures[2 * g], captures[2 * g + 1])) }
        let names = program.groupNames
        let groups: JSRecord<String>? = names.isEmpty ? nil : JSRegExp.namedRecord(names) { values[$0] }
        var indices: JSMatchIndices?
        if hasIndices {
            var pairs: [JSArray<Double>?] = []
            for g in 0..<n { pairs.append(captures[2 * g] < 0 ? nil : JSArray([Double(captures[2 * g]), Double(captures[2 * g + 1])])) }
            indices = JSMatchIndices(JSArray(pairs), names.isEmpty ? nil : JSRegExp.namedRecord(names) { pairs[$0] })
        }
        return JSMatch(values: JSArray(values), index: Double(captures[0]), input: subject.string, groups: groups, isExecResult: true, indices: indices)
    }

    /// A match's `groups`: each name once, from the first of its groups that took part, undefined (a key still) when none did.
    private static func namedRecord<V>(_ names: [(String, Int)], _ value: (Int) -> V?) -> JSRecord<V> {
        let record = JSRecord<V>()
        for (name, g) in names {
            let v = value(g)
            if !record.has(name) || (record[name] == nil && v != nil) { record.object[name] = v as Any? }
        }
        return record
    }

    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "RegExp" }
    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "lastIndex": return lastIndex
            case "source": return source
            case "flags": return flags
            case "global": return global
            case "ignoreCase": return ignoreCase
            case "multiline": return multiline
            case "dotAll": return dotAll
            case "unicode": return unicode
            case "unicodeSets": return unicodeSets
            case "sticky": return sticky
            case "hasIndices": return hasIndices
            default: return nil
            }
        }
        set { if key == "lastIndex" { lastIndex = jsToNumber(newValue) } }
    }

    public func toString() -> String { "/\(source)/\(flags)" }

    /// The matcher for every expression: matching runs no script, so it is never re-entered.
    private static let machine = RegexVM()

    /// Compiled patterns by pattern and flags: a literal evaluated in a loop makes a new RegExp each time, as
    /// JavaScript's does, without parsing it again. Bounded by emptying it when full.
    private static var cache: [String: [String: RegexProgram]] = [:]
    private static var cached = 0
    private static let cacheLimit = 256

    private static func checkFlags(_ flags: String) throws {
        var seen = 0
        for c in flags.unicodeScalars {
            guard let bit = "dgimsuvy".unicodeScalars.firstIndex(of: c).map({ "dgimsuvy".unicodeScalars.distance(from: "dgimsuvy".unicodeScalars.startIndex, to: $0) }),
                  seen & (1 << bit) == 0 else { throw JSException(value: JSSyntaxError("Invalid flags supplied to RegExp constructor '\(flags)'")) }
            seen |= 1 << bit
        }
        if flags.contains("u") && flags.contains("v") { throw JSException(value: JSSyntaxError("Invalid flags supplied to RegExp constructor '\(flags)'")) }
    }

    private static func compile(_ pattern: String, _ flags: String) throws -> RegexProgram {
        if let known = cache[pattern]?[flags] { return known }
        let unicodeSets = flags.contains("v")
        let program: RegexProgram
        do {
            program = try RegexParser(pattern, ignoreCase: flags.contains("i"), multiline: flags.contains("m"), dotAll: flags.contains("s"),
                                      unicodeMode: flags.contains("u") || unicodeSets, setsMode: unicodeSets).parse()
        } catch let e as RegexSyntaxError {
            throw JSException(value: JSSyntaxError("Invalid regular expression: /\(pattern)/\(flags): \(e.message)"))
        }
        if cached >= cacheLimit {
            cache.removeAll(keepingCapacity: true)
            cached = 0
        }
        cache[pattern, default: [:]][flags] = program
        cached += 1
        return program
    }

    static func toLength(_ v: Double) -> Int {
        if v.isNaN || v <= 0 { return 0 }
        return Int(min(v.rounded(.down), 9007199254740991))
    }

    /// AdvanceStringIndex.
    static func advance(_ units: [UInt16], _ index: Int, _ unicode: Bool) -> Int {
        if !unicode || index + 1 >= units.count { return index + 1 }
        return isLeadUnit(units[index]) && isTrailUnit(units[index + 1]) ? index + 2 : index + 1
    }

    /// EscapeRegExpPattern as V8 does it: `/` outside classes and line terminators escaped, "" as `(?:)`.
    static func escapePattern(_ pattern: String) -> String {
        if pattern.isEmpty { return "(?:)" }
        let p = Array(pattern.utf16)
        guard p.contains(where: { $0 == 0x2F || $0 == 0x0A || $0 == 0x0D || $0 == 0x2028 || $0 == 0x2029 }) else { return pattern }
        var out: [UInt16] = []
        out.reserveCapacity(p.count + 4)
        var inClass = false
        var i = 0
        /// A line terminator's escape, without its backslash.
        func escape(_ c: UInt16) -> String? {
            switch c {
            case 0x0A: return "n"
            case 0x0D: return "r"
            case 0x2028: return "u2028"
            case 0x2029: return "u2029"
            default: return nil
            }
        }
        while i < p.count {
            let c = p[i]
            if c == 0x5C && i + 1 < p.count {
                out.append(c)
                i += 1
                if let e = escape(p[i]) { out += e.utf16 } else { out.append(p[i]) }
            } else if c == 0x2F && !inClass {
                out.append(0x5C)
                out.append(0x2F)
            } else {
                if c == 0x5B { inClass = true } else if c == 0x5D { inClass = false }
                if let e = escape(c) {
                    out.append(0x5C)
                    out += e.utf16
                } else { out.append(c) }
            }
            i += 1
        }
        return String(decoding: out, as: UTF16.self)
    }
}

/// The array `exec` and `match` return: the matched text, then each group (undefined when it did not take part),
/// with `index`, `input`, `groups` (and `indices` for the `d` flag). The array `match` returns for a global
/// expression holds the matched texts only.
public final class JSMatch {
    nonisolated deinit {}
    /// The match as the array of strings script holds it (`s.match(/x/g)` typed `string[]`); an unmatched group reads as "".
    public var jsStrings: JSArray<String> { JSArray<String>(values.storage.map { $0 ?? "" }) }

    public let index: Double
    public let input: String
    public let values: JSArray<String?>
    public let groups: JSRecord<String>?
    let isExecResult: Bool
    public let indices: JSMatchIndices?

    init(values: JSArray<String?>, index: Double, input: String, groups: JSRecord<String>?, isExecResult: Bool, indices: JSMatchIndices? = nil) {
        self.values = values
        self.index = index
        self.input = input
        self.groups = groups
        self.isExecResult = isExecResult
        self.indices = indices
    }

    convenience init(all: [String?], input: String) {
        self.init(values: JSArray(all), index: .nan, input: input, groups: nil, isExecResult: false)
    }

    /// `match(re) || []`: no matches.
    public convenience init() { self.init(all: [], input: "") }

    /// A group's text; a group that did not take part reads as "" (JavaScript has undefined there).
    public subscript(_ i: Int) -> String { i < values.count ? values[i] ?? "" : "" }
    /// What a replace callback is given: the match, each group, the index, the input, and the groups object when the pattern names any.
    public var replacerArguments: [Any?] { values.storage.map { $0 as Any? } + [index, input] + (groups.map { [$0 as Any?] } ?? []) }
    public var length: Double { values.length }
}

/// A match's `indices` (the `d` flag): `[start, end]` per group, with `groups`.
public final class JSMatchIndices: JSDynamic {
    nonisolated deinit {}
    public let values: JSArray<JSArray<Double>?>
    public let groups: JSRecord<JSArray<Double>>?

    init(_ values: JSArray<JSArray<Double>?>, _ groups: JSRecord<JSArray<Double>>?) {
        self.values = values
        self.groups = groups
    }

    public var length: Double { values.length }
    public var jsKeys: [String] { (0..<values.count).map { String($0) } + ["groups"] }
    public var jsClassName: String? { "Array" }
    public subscript(jsKey key: String) -> Any? {
        get {
            if key == "length" { return length }
            if key == "groups" { return groups }
            if let i = jsArrayIndex(key), Int(i) < values.count { return values[Int(i)] }
            return nil
        }
        set {}
    }
}

/// A string as matching reads it: its UTF-16 units, made once. The last one is kept for the next search of the
/// same string, as an exec loop makes, or a literal evaluated again over the same text (`text.match(/x/g)` in a function).
final class JSRegExpSubject {
    nonisolated deinit {}
    let string: String
    let units: [UInt16]

    private init(_ string: String) {
        self.string = string
        units = Array(string.utf16)
    }

    private static var last: JSRegExpSubject?

    static func of(_ s: String) -> JSRegExpSubject {
        if let last, jsSameText(last.string, s) { return last }
        let made = JSRegExpSubject(s)
        last = made
        return made
    }

    /// The text from `start` to `end`; a bound inside a surrogate pair leaves a lone surrogate, which becomes U+FFFD.
    func text(_ start: Int, _ end: Int) -> String {
        units.withUnsafeBufferPointer { jsString(utf16: UnsafeBufferPointer(rebasing: $0[start..<end])) }
    }
}

/// `a === b`, at once for one string's storage held twice.
private func jsSameText(_ a: String, _ b: String) -> Bool {
    let same = a.utf8.withContiguousStorageIfAvailable { p in b.utf8.withContiguousStorageIfAvailable { q in p.baseAddress == q.baseAddress && p.count == q.count } }
    return same == true || jsStringEquals(a, b)
}

/// The text of `s` at `range`, UTF-16 offsets as JavaScript gives them.
func jsSubstring(_ s: String, _ range: NSRange) -> String {
    JSRegExpSubject.of(s).text(range.location, range.location + range.length)
}

/// `s` as a pattern matching it literally.
func jsRegExpEscape(_ s: String) -> String {
    var out = ""
    for c in s.unicodeScalars {
        if "\\^$.*+?()[]{}|/".unicodeScalars.contains(c) { out.unicodeScalars.append("\\") }
        out.unicodeScalars.append(c)
    }
    return out
}

/// `s.match(re)`: the first match (with groups) or, for a global expression, every matched text; nil when nothing matches.
public func jsMatch(_ s: String, _ re: JSRegExp) -> JSMatch? {
    if !re.global { return re.exec(s) }
    let subject = JSRegExpSubject.of(s)
    re.lastIndex = 0
    var out: [String?] = []
    while let c = re.execCaptures(subject) {
        out.append(subject.text(c[0], c[1]))
        if c[0] == c[1] { re.lastIndex = Double(JSRegExp.advance(subject.units, JSRegExp.toLength(re.lastIndex), re.fullUnicode)) }
    }
    return out.isEmpty ? nil : JSMatch(all: out, input: s)
}

/// What `s.match(x)` searches with: a RegExp as it is, anything else as `new RegExp(x)`.
public func jsRegExpFrom(_ value: Any?) throws -> JSRegExp {
    if let re = jsFlat(value) as? JSRegExp { return re }
    return try JSRegExp(jsFlat(value) == nil ? "(?:)" : jsToString(value))
}

/// A regular expression literal: TypeScript accepted its syntax.
public func jsRegExpLiteral(_ source: String, _ flags: String) -> JSRegExp {
    JSRegExp.literal(source, flags)
}

/// `s.matchAll(re)`: every match of a global expression, from its `lastIndex`.
public func jsMatchAll(_ s: String, _ re: JSRegExp) throws -> JSArray<JSMatch> {
    guard re.global else { throw JSException(value: JSTypeError("String.prototype.matchAll called with a non-global RegExp argument")) }
    let copy = try JSRegExp.construct(re)
    copy.lastIndex = Double(JSRegExp.toLength(re.lastIndex))
    let subject = JSRegExpSubject.of(s)
    var out: [JSMatch] = []
    while let c = copy.execCaptures(subject) {
        out.append(copy.makeMatch(subject, c))
        if c[0] == c[1] { copy.lastIndex = Double(JSRegExp.advance(subject.units, JSRegExp.toLength(copy.lastIndex), copy.fullUnicode)) }
    }
    return JSArray(out)
}

/// `s.search(re)`: the index of the first match, -1 when none; `lastIndex` is left as it was.
public func jsSearch(_ s: String, _ re: JSRegExp) -> Double {
    let previous = re.lastIndex
    re.lastIndex = 0
    let c = re.execCaptures(JSRegExpSubject.of(s))
    re.lastIndex = previous
    return c.map { Double($0[0]) } ?? -1
}

/// `s.replace(pattern, replacement)` with an untyped pattern: a regular expression replaces as one, any other value by its string.
public func jsReplace(_ s: String, untyped pattern: Any?, _ replacement: String) -> String {
    if let re = jsFlat(pattern) as? JSRegExp { return jsReplace(s, re, replacement) }
    return jsReplace(s, jsToString(pattern), replacement)
}

/// `s.replace(re, replacement)` with GetSubstitution's `$$ $& $` $' $n $nn $<name>`.
public func jsReplace(_ s: String, _ re: JSRegExp, _ replacement: String) -> String {
    let subject = JSRegExpSubject.of(s)
    // Without a `$` the replacement is the same text for every match, and no match needs its groups read.
    guard replacement.utf8.contains(UInt8(ascii: "$")) else { return replaceMatches(subject, re) { _ in replacement } }
    return replaceMatches(subject, re) { c in
        let m = re.makeMatch(subject, c)
        return jsSubstitution(replacement, matched: m.values[0] ?? "", at: c[0], in: s, captures: m.values.storage, groups: m.groups)
    }
}

/// `s.replace(re, (match, ...groups) => …)`.
public func jsReplace(_ s: String, _ re: JSRegExp, _ replacer: (JSMatch) throws -> String) rethrows -> String {
    let subject = JSRegExpSubject.of(s)
    return try replaceMatches(subject, re) { try replacer(re.makeMatch(subject, $0)) }
}

/// `s.replaceAll(re, replacement)`: the expression must be global.
public func jsReplaceAll(_ s: String, _ re: JSRegExp, _ replacement: String) throws -> String {
    guard re.global else { throw JSException(value: JSTypeError("replaceAll must be called with a global RegExp")) }
    return jsReplace(s, re, replacement)
}

/// RegExp.prototype[@@replace]: every match is found before the first replacement is computed.
private func replaceMatches(_ subject: JSRegExpSubject, _ re: JSRegExp, _ replacement: ([Int]) throws -> String) rethrows -> String {
    var results: [[Int]] = []
    if re.global { re.lastIndex = 0 }
    while let c = re.execCaptures(subject) {
        results.append(c)
        if !re.global { break }
        if c[0] == c[1] { re.lastIndex = Double(JSRegExp.advance(subject.units, JSRegExp.toLength(re.lastIndex), re.fullUnicode)) }
    }
    if results.isEmpty { return subject.string }
    let units = subject.units
    var out: [UInt16] = []
    out.reserveCapacity(units.count)
    var next = 0
    for c in results {
        let position = max(0, min(c[0], units.count))
        let text = try replacement(c)
        if position >= next {
            out += units[next..<position]
            out += text.utf16
            next = position + (c[1] - c[0])
        }
    }
    if next < units.count { out += units[next...] }
    return out.withUnsafeBufferPointer { jsString(utf16: $0) }
}

/// GetSubstitution: `template` with `$$`, `$&`, `` $` ``, `$'`, `$n` and `$<name>` expanded for the match of `matched`
/// at UTF-16 offset `position` of `s`. `captures` holds the match then each group.
func jsSubstitution(_ template: String, matched: String, at position: Int, in s: String, captures: [String?], groups: JSRecord<String>?) -> String {
    let t = Array(template.utf16)
    guard t.contains(36) else { return template }
    let units = Array(s.utf16)
    let captureCount = captures.count - 1
    var out: [UInt16] = []
    var i = 0
    func append(_ text: String?) { out.append(contentsOf: (text ?? "").utf16) }
    while i < t.count {
        guard t[i] == 36, i + 1 < t.count else { out.append(t[i]); i += 1; continue } // `$`
        let c = t[i + 1]
        switch c {
        case 36: out.append(36); i += 2
        case 38: append(matched); i += 2 // `$&`
        case 96: out += units[0..<min(position, units.count)]; i += 2 // `` $` ``
        case 39: out += units[min(units.count, position + matched.utf16.count)...]; i += 2 // `$'`
        case 48...57:
            var digits = i + 2 < t.count && (48...57).contains(t[i + 2]) ? 2 : 1
            var index = digits == 2 ? Int(c - 48) * 10 + Int(t[i + 2] - 48) : Int(c - 48)
            if index > captureCount && digits == 2 { digits = 1; index = Int(c - 48) }
            if index >= 1 && index <= captureCount { append(captures[index]) } else { out += t[i..<(i + 1 + digits)] }
            i += 1 + digits
        case 60: // `$<name>`
            if let groups, let close = t[(i + 2)...].firstIndex(of: 62) {
                append(groups[String(decoding: t[(i + 2)..<close], as: UTF16.self)])
                i = close + 1
            } else { out += [36, 60]; i += 2 }
        default: out.append(36); i += 1
        }
    }
    return out.withUnsafeBufferPointer { jsString(utf16: $0) }
}

/// `s.split(re, limit)` (RegExp.prototype[@@split]): captures are spliced in, an unmatched one as undefined.
public func jsSplit(_ s: String, _ re: JSRegExp, _ limit: Double? = nil) -> JSArray<String?> {
    let subject = JSRegExpSubject.of(s)
    let units = subject.units
    let lim = limit.map { Int(jsToUint32($0)) } ?? Int(UInt32.max)
    var out: [String?] = []
    if lim == 0 { return JSArray(out) }
    let unicode = re.fullUnicode
    if units.isEmpty { return JSArray(re.search(subject, 0, true) == nil ? [s] : []) }
    // A match at q ending at e splits unless it would make an empty piece at p.
    var p = 0, q = 0
    while q < units.count {
        guard let z = re.search(subject, q, true) else { q = JSRegExp.advance(units, q, unicode); continue }
        let e = min(z[1], units.count)
        if e == p { q = JSRegExp.advance(units, q, unicode); continue }
        out.append(subject.text(p, q))
        if out.count == lim { return JSArray(out) }
        p = e
        for g in 1..<(z.count / 2) {
            out.append(z[2 * g] < 0 ? nil : subject.text(z[2 * g], z[2 * g + 1]))
            if out.count == lim { return JSArray(out) }
        }
        q = p
    }
    out.append(subject.text(p, units.count))
    return JSArray(out)
}
