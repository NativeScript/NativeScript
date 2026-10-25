import Foundation

// The pattern grammar and matcher behind `JSRegExp`, ported from kit-android's RegExp.kt and kept parallel to it
// section by section, so that a fix to one ports to the other: a parser for ECMA-262 §22.2.1 (with Annex B's
// web-compatible forms outside `u`/`v` mode) and a backtracking matcher over UTF-16 code units, or code points in
// `u`/`v` mode. Errors carry V8's messages. NSRegularExpression (ICU) is not used: its `\d`, `\w`, `$`, `.`, case
// folding, captures in quantified groups and unset backreferences differ from JavaScript's.

// Pattern syntax

struct RegexSyntaxError: Error {
    let message: String
}

private let INFINITE = Int.max

nonisolated class RNode {
    nonisolated deinit {}
}
final class RSeq: RNode {
    let items: [RNode]
    init(_ items: [RNode]) { self.items = items }
}
final class RAlt: RNode {
    let alternatives: [RNode]
    init(_ alternatives: [RNode]) { self.alternatives = alternatives }
}
final class RChar: RNode {
    let cp: Int, ignoreCase: Bool
    init(_ cp: Int, _ ignoreCase: Bool) { self.cp = cp; self.ignoreCase = ignoreCase }
}
final class RClass: RNode {
    let set: RSet, negated: Bool, ignoreCase: Bool
    init(_ set: RSet, _ negated: Bool, _ ignoreCase: Bool) { self.set = set; self.negated = negated; self.ignoreCase = ignoreCase }
}
final class RAssertion: RNode {
    let kind: UInt16, multiline: Bool, wordExtras: Bool
    init(_ kind: UInt16, _ multiline: Bool, _ wordExtras: Bool) { self.kind = kind; self.multiline = multiline; self.wordExtras = wordExtras }
}
final class RGroup: RNode {
    let index: Int, body: RNode
    init(_ index: Int, _ body: RNode) { self.index = index; self.body = body }
}
final class RLook: RNode {
    let ahead: Bool, negative: Bool, body: RNode
    init(_ ahead: Bool, _ negative: Bool, _ body: RNode) { self.ahead = ahead; self.negative = negative; self.body = body }
}
final class RBackReference: RNode {
    var groups: [Int]
    let ignoreCase: Bool
    init(_ groups: [Int], _ ignoreCase: Bool) { self.groups = groups; self.ignoreCase = ignoreCase }
}
final class RRepeat: RNode {
    let body: RNode, min: Int, max: Int, greedy: Bool, firstGroup: Int, groupCount: Int
    init(_ body: RNode, _ min: Int, _ max: Int, _ greedy: Bool, _ firstGroup: Int, _ groupCount: Int) {
        self.body = body; self.min = min; self.max = max; self.greedy = greedy; self.firstGroup = firstGroup; self.groupCount = groupCount
    }
}

/// A class's members: code point ranges and predicates (class escapes, property escapes).
final class RSet {
    nonisolated deinit {}
    var ranges: [(Int, Int)] = []
    var predicates: [(Int) -> Bool] = []

    @discardableResult func add(_ lo: Int, _ hi: Int? = nil) -> RSet { ranges.append((lo, hi ?? lo)); return self }
    @discardableResult func add(_ test: @escaping (Int) -> Bool) -> RSet { predicates.append(test); return self }
    func addAll(_ other: RSet) { ranges += other.ranges; predicates += other.predicates }

    func contains(_ cp: Int) -> Bool {
        for r in ranges where cp >= r.0 && cp <= r.1 { return true }
        for p in predicates where p(cp) { return true }
        return false
    }
}

@inline(__always) private func u(_ c: Unicode.Scalar) -> UInt16 { UInt16(c.value) }
@inline(__always) func isLeadUnit(_ c: UInt16) -> Bool { c & 0xFC00 == 0xD800 }
@inline(__always) func isTrailUnit(_ c: UInt16) -> Bool { c & 0xFC00 == 0xDC00 }
@inline(__always) private func isSurrogateCode(_ c: Int) -> Bool { c >= 0xD800 && c <= 0xDFFF }
@inline(__always) private func charCount(_ cp: Int) -> Int { cp > 0xFFFF ? 2 : 1 }
private func scalar(_ cp: Int) -> Unicode.Scalar? { cp < 0 ? nil : Unicode.Scalar(UInt32(cp)) }

private func isLineTerminator(_ c: Int) -> Bool { c == 0x0A || c == 0x0D || c == 0x2028 || c == 0x2029 }
private func isDecimalDigit(_ c: Int) -> Bool { c >= 0x30 && c <= 0x39 }
private func isBasicWordChar(_ c: Int) -> Bool { (c >= 0x61 && c <= 0x7A) || (c >= 0x41 && c <= 0x5A) || (c >= 0x30 && c <= 0x39) || c == 0x5F }
private func isJSWhitespace(_ c: Int) -> Bool { c <= 0xFFFF && jsIsWhitespace(UInt16(c)) }
private func isHexDigit(_ c: UInt16) -> Bool { (c >= 0x30 && c <= 0x39) || (c >= 0x61 && c <= 0x66) || (c >= 0x41 && c <= 0x46) }
private func hexValue(_ c: UInt16) -> Int { c <= 0x39 ? Int(c) - 0x30 : (Int(c) | 0x20) - 0x61 + 10 }
private func isDigitUnit(_ c: UInt16) -> Bool { c >= 0x30 && c <= 0x39 }
private func isAsciiLetter(_ c: UInt16) -> Bool { (c >= 0x61 && c <= 0x7A) || (c >= 0x41 && c <= 0x5A) }

/// Canonicalize (§22.2.2.7.3) and the inverse classes it induces, built on first use of the `i` flag.
enum CaseFolding {
    /// Outside unicode mode: toUppercase per the Unicode Default Case Conversion, kept only when one code unit,
    /// and never from beyond ASCII into it.
    private static let upper: [UInt16] = {
        var table = (0..<0x10000).map { UInt16($0) }
        for c in 0..<0x10000 where !isSurrogateCode(c) {
            guard let s = scalar(c), s.properties.changesWhenUppercased else { continue }
            let mapped = Array(s.properties.uppercaseMapping.utf16)
            if mapped.count == 1 && !(c >= 128 && mapped[0] < 128) { table[c] = mapped[0] }
        }
        return table
    }()

    private static let unitClasses: [Int: [Int]] = classes(0xFFFF) { canonicalize($0, false) }
    private static let pointClasses: [Int: [Int]] = classes(0x10FFFF) { canonicalize($0, true) }

    /// Only characters that change under some case mapping canonicalize to another.
    private static func classes(_ last: Int, _ canon: (Int) -> Int) -> [Int: [Int]] {
        var members: [Int: [Int]] = [:]
        for c in 0...last {
            guard let s = scalar(c), s.properties.changesWhenCaseMapped else { continue }
            let k = canon(c)
            if k != c { members[k, default: [k]].append(c) }
        }
        return members
    }

    private static func single(_ mapping: String, _ c: Int) -> Int {
        let scalars = mapping.unicodeScalars
        return scalars.count == 1 ? Int(scalars.first!.value) : c
    }

    /// Simple case folding as lower(upper(c)), with the exceptions CaseFolding.txt makes: the dotted and dotless i
    /// fold only to themselves, and three characters without case mappings fold. Swift exposes full mappings only:
    /// one that is more than one character stands for no simple mapping.
    static func canonicalize(_ c: Int, _ unicode: Bool) -> Int {
        if !unicode { return c <= 0xFFFF ? Int(upper[c]) : c }
        switch c {
        case 0x130, 0x131: return c
        case 0x1FD3: return 0x390
        case 0x1FE3: return 0x3B0
        case 0xFB05: return 0xFB06
        default:
            guard let s = scalar(c), s.properties.changesWhenCaseMapped else { return c }
            let up = single(s.properties.uppercaseMapping, c)
            guard let t = scalar(up) else { return up }
            return single(t.properties.lowercaseMapping, up)
        }
    }

    /// Every character whose canonical form is `canon`'s.
    static func equivalents(_ canon: Int, _ unicode: Bool) -> [Int]? { (unicode ? pointClasses : unitClasses)[canon] }
}

/// Whether `set` holds `c` or a character with the same canonical form (CharacterSetMatcher under `i`).
private func caseClosedContains(_ set: RSet, _ c: Int, _ unicode: Bool) -> Bool {
    if set.contains(c) { return true }
    guard let members = CaseFolding.equivalents(CaseFolding.canonicalize(c, unicode), unicode) else { return false }
    for m in members where m != c && set.contains(m) { return true }
    return false
}

/// A `v`-mode class: its single characters as a test, and its strings of other lengths.
private struct SetClass {
    let test: (Int) -> Bool
    let strings: Set<[UInt16]>
}

private struct SetOperand {
    let cp: Int
    let set: SetClass?
}

private struct NamedGroup {
    let name: String, index: Int, path: [[Int]]
}

/// The pattern grammar of §22.2.1, with Annex B §B.1.2 outside unicode mode.
final class RegexParser {
    nonisolated deinit {}
    private let p: [UInt16]
    private var ignoreCase: Bool, multiline: Bool, dotAll: Bool
    private let unicodeMode: Bool, setsMode: Bool
    private var pos = 0
    private var groupCount = 0
    private let totalGroups: Int
    private let hasNamedGroups: Bool
    private var names: [NamedGroup] = []
    private var namedReferences: [(String, RBackReference)] = []
    /// Per enclosing disjunction: its number and the alternative being parsed.
    private var path: [[Int]] = []
    private var disjunctions = 0

    init(_ pattern: String, ignoreCase: Bool, multiline: Bool, dotAll: Bool, unicodeMode: Bool, setsMode: Bool) {
        p = Array(pattern.utf16)
        self.ignoreCase = ignoreCase
        self.multiline = multiline
        self.dotAll = dotAll
        self.unicodeMode = unicodeMode
        self.setsMode = setsMode
        var count = 0
        var named = false
        var i = 0
        var inClass = false
        while i < p.count {
            let c = p[i]
            if c == u("\\") { i += 1 }
            else if inClass { if c == u("]") { inClass = false } }
            else if c == u("[") { inClass = true }
            else if c == u("(") {
                if i + 1 < p.count && p[i + 1] == u("?") {
                    if i + 3 < p.count && p[i + 2] == u("<") && p[i + 3] != u("=") && p[i + 3] != u("!") { count += 1; named = true }
                } else { count += 1 }
            }
            i += 1
        }
        totalGroups = count
        hasNamedGroups = named
    }

    private func error(_ message: String) -> RegexSyntaxError { RegexSyntaxError(message: message) }

    func parse() throws -> RegexProgram {
        let root = try parseDisjunction()
        if pos < p.count { throw error("Unmatched ')'") }
        for (name, ref) in namedReferences {
            let groups = names.filter { $0.name == name }.map { $0.index }
            if groups.isEmpty { throw error("Invalid named capture referenced") }
            ref.groups = groups
        }
        return RegexProgram(root, groupCount, names.map { ($0.name, $0.index) }, unicodeMode)
    }

    private func at(_ text: String, _ i: Int? = nil) -> Bool {
        var k = i ?? pos
        for c in text.utf16 {
            guard k < p.count, p[k] == c else { return false }
            k += 1
        }
        return true
    }

    private func codePointAt(_ i: Int) -> Int {
        let c = p[i]
        if isLeadUnit(c), i + 1 < p.count, isTrailUnit(p[i + 1]) { return 0x10000 + ((Int(c) - 0xD800) << 10) + (Int(p[i + 1]) - 0xDC00) }
        return Int(c)
    }

    private func peekCodePoint() -> Int { unicodeMode ? codePointAt(pos) : Int(p[pos]) }

    private func parseDisjunction() throws -> RNode {
        path.append([disjunctions, 0])
        disjunctions += 1
        var alternatives = [try parseAlternative()]
        while pos < p.count && p[pos] == u("|") {
            pos += 1
            path[path.count - 1][1] += 1
            alternatives.append(try parseAlternative())
        }
        path.removeLast()
        return alternatives.count == 1 ? alternatives[0] : RAlt(alternatives)
    }

    private func parseAlternative() throws -> RNode {
        var items: [RNode] = []
        while pos < p.count && p[pos] != u("|") && p[pos] != u(")") { items.append(try parseTerm()) }
        return items.count == 1 ? items[0] : RSeq(items)
    }

    private func atQuantifier() -> Bool {
        guard pos < p.count else { return false }
        let c = p[pos]
        return c == u("*") || c == u("+") || c == u("?") || (c == u("{") && braced(pos) != nil)
    }

    private func assertion(_ node: RNode) throws -> RNode {
        if atQuantifier() { throw error("Nothing to repeat") }
        return node
    }

    private func parseTerm() throws -> RNode {
        let c = p[pos]
        if c == u("^") { pos += 1; return try assertion(RAssertion(u("^"), multiline, false)) }
        if c == u("$") { pos += 1; return try assertion(RAssertion(u("$"), multiline, false)) }
        if c == u("\\") && pos + 1 < p.count && (p[pos + 1] == u("b") || p[pos + 1] == u("B")) {
            pos += 2
            return try assertion(RAssertion(p[pos - 1], false, unicodeMode && ignoreCase))
        }
        if at("(?=") || at("(?!") || at("(?<=") || at("(?<!") {
            let ahead = p[pos + 2] != u("<")
            let negative = p[pos + (ahead ? 2 : 3)] == u("!")
            pos += ahead ? 3 : 4
            let before = groupCount
            let body = try parseDisjunction()
            if pos >= p.count { throw error("Unterminated group") }
            pos += 1
            let node = RLook(ahead, negative, body)
            if ahead && !unicodeMode { return try parseQuantifier(node, before) }
            if atQuantifier() { throw error("Invalid quantifier") }
            return node
        }
        let before = groupCount
        return try parseQuantifier(try parseAtom(), before)
    }

    /// `{n}`, `{n,}` or `{n,m}` at `at`: min, max and the position after it.
    private func braced(_ at: Int) -> (Int, Int, Int)? {
        var i = at + 1
        func number() -> Int? {
            let start = i
            var v = 0
            while i < p.count && isDigitUnit(p[i]) { v = v > (INFINITE - 9) / 10 ? INFINITE : v * 10 + Int(p[i] - 0x30); i += 1 }
            return i == start ? nil : v
        }
        guard let min = number() else { return nil }
        var max = min
        if i < p.count && p[i] == u(",") {
            i += 1
            max = number() ?? INFINITE
        }
        if i >= p.count || p[i] != u("}") { return nil }
        return (min, max, i + 1)
    }

    private func parseQuantifier(_ atom: RNode, _ groupsBefore: Int) throws -> RNode {
        guard pos < p.count else { return atom }
        let min: Int, max: Int
        switch p[pos] {
        case u("*"): min = 0; max = INFINITE; pos += 1
        case u("+"): min = 1; max = INFINITE; pos += 1
        case u("?"): min = 0; max = 1; pos += 1
        case u("{"):
            guard let q = braced(pos) else {
                if unicodeMode { throw error("Incomplete quantifier") }
                return atom
            }
            min = q.0; max = q.1; pos = q.2
            if min > max { throw error("numbers out of order in {} quantifier") }
        default: return atom
        }
        var greedy = true
        if pos < p.count && p[pos] == u("?") { pos += 1; greedy = false }
        return RRepeat(atom, min, max, greedy, groupsBefore, groupCount - groupsBefore)
    }

    private func parseAtom() throws -> RNode {
        let c = p[pos]
        switch c {
        case u("."):
            pos += 1
            let all = dotAll
            return RClass(RSet().add { all || !isLineTerminator($0) }, false, false)
        case u("("): return try parseGroup()
        case u("["): return setsMode ? try parseSetClass() : try parseClass()
        case u("\\"): return try parseAtomEscape()
        case u("*"), u("+"), u("?"): throw error("Nothing to repeat")
        case u("{"):
            if braced(pos) != nil { throw error("Nothing to repeat") }
            if unicodeMode { throw error("Lone quantifier brackets") }
        case u("}"), u("]"):
            if unicodeMode { throw error("Lone quantifier brackets") }
        default: break
        }
        let cp = peekCodePoint()
        pos += charCount(cp)
        return RChar(cp, ignoreCase)
    }

    private func closeGroup() throws {
        if pos >= p.count || p[pos] != u(")") { throw error("Unterminated group") }
        pos += 1
    }

    private func parseGroup() throws -> RNode {
        if at("(?:") {
            pos += 3
            let body = try parseDisjunction()
            try closeGroup()
            return body
        }
        if at("(?<") {
            pos += 3
            let name = try parseGroupName()
            groupCount += 1
            let index = groupCount
            for other in names where other.name == name && !differentAlternatives(other.path, path) { throw error("Duplicate capture group name") }
            names.append(NamedGroup(name: name, index: index, path: path))
            let body = try parseDisjunction()
            try closeGroup()
            return RGroup(index, body)
        }
        if at("(?") { return try parseModifiers() }
        pos += 1
        groupCount += 1
        let index = groupCount
        let body = try parseDisjunction()
        try closeGroup()
        return RGroup(index, body)
    }

    private func differentAlternatives(_ a: [[Int]], _ b: [[Int]]) -> Bool {
        var k = 0
        while k < a.count && k < b.count && a[k][0] == b[k][0] {
            if a[k][1] != b[k][1] { return true }
            k += 1
        }
        return false
    }

    /// `(?ims-ims:…)`.
    private func parseModifiers() throws -> RNode {
        pos += 2
        var add: [UInt16] = [], remove: [UInt16] = []
        var dash = false
        while true {
            if pos >= p.count { throw error("Invalid group") }
            let c = p[pos]
            if c == u("i") || c == u("m") || c == u("s") {
                if add.contains(c) || remove.contains(c) { throw error("Repeated flag in flag group") }
                if dash { remove.append(c) } else { add.append(c) }
                pos += 1
            } else if c == u("-") {
                if dash { throw error("Multiple dashes in flag group") }
                dash = true
                pos += 1
            } else if c == u(":") {
                pos += 1
                break
            } else { throw error("Invalid group") }
        }
        if dash && add.isEmpty && remove.isEmpty { throw error("Invalid flag group") }
        let saved = (ignoreCase, multiline, dotAll)
        if add.contains(u("i")) { ignoreCase = true }
        if add.contains(u("m")) { multiline = true }
        if add.contains(u("s")) { dotAll = true }
        if remove.contains(u("i")) { ignoreCase = false }
        if remove.contains(u("m")) { multiline = false }
        if remove.contains(u("s")) { dotAll = false }
        let body = try parseDisjunction()
        try closeGroup()
        (ignoreCase, multiline, dotAll) = saved
        return body
    }

    /// A RegExpIdentifierName and its closing `>`.
    private func parseGroupName() throws -> String {
        var out = String.UnicodeScalarView()
        while true {
            if pos >= p.count { throw error("Invalid capture group name") }
            var cp = codePointAt(pos)
            if cp == 0x3E {
                pos += 1
                break
            }
            if cp == 0x5C {
                pos += 1
                if pos >= p.count || p[pos] != u("u") { throw error("Invalid capture group name") }
                pos += 1
                guard let v = parseUnicodeEscapeBody(true) else { throw error("Invalid capture group name") }
                cp = v
            } else { pos += charCount(cp) }
            let props = scalar(cp)?.properties
            let valid = out.isEmpty ? cp == 0x24 || cp == 0x5F || props?.isIDStart == true
                : cp == 0x24 || cp == 0x200C || cp == 0x200D || props?.isIDContinue == true
            guard valid, let s = scalar(cp) else { throw error("Invalid capture group name") }
            out.append(s)
        }
        if out.isEmpty { throw error("Invalid capture group name") }
        return String(out)
    }

    /// After `\u`: `XXXX` (a surrogate pair `\uXXXX\uXXXX` in unicode mode) or `{X…}` in unicode mode; nil if malformed.
    private func parseUnicodeEscapeBody(_ unicode: Bool) -> Int? {
        if unicode && pos < p.count && p[pos] == u("{") {
            var i = pos + 1
            var v = 0
            while i < p.count && isHexDigit(p[i]) {
                v = v * 16 + hexValue(p[i])
                if v > 0x10FFFF { return nil }
                i += 1
            }
            if i == pos + 1 || i >= p.count || p[i] != u("}") { return nil }
            pos = i + 1
            return v
        }
        guard let lead = hex4(pos) else { return nil }
        pos += 4
        if unicode && lead >= 0xD800 && lead <= 0xDBFF && at("\\u") {
            if let trail = hex4(pos + 2), trail >= 0xDC00 && trail <= 0xDFFF {
                pos += 6
                return 0x10000 + ((lead - 0xD800) << 10) + (trail - 0xDC00)
            }
        }
        return lead
    }

    private func hex4(_ at: Int) -> Int? {
        if at + 4 > p.count { return nil }
        var v = 0
        for i in at..<(at + 4) {
            if !isHexDigit(p[i]) { return nil }
            v = v * 16 + hexValue(p[i])
        }
        return v
    }

    /// `\0`…`\377` outside unicode mode.
    private func parseLegacyOctal() -> Int {
        var v = Int(p[pos]) - 0x30
        pos += 1
        if pos < p.count && p[pos] >= u("0") && p[pos] <= u("7") {
            v = v * 8 + Int(p[pos]) - 0x30
            pos += 1
            if v < 32 && pos < p.count && p[pos] >= u("0") && p[pos] <= u("7") {
                v = v * 8 + Int(p[pos]) - 0x30
                pos += 1
            }
        }
        return v
    }

    private func classEscapeSet(_ c: UInt16) -> RSet? {
        let extras = unicodeMode && ignoreCase
        switch c {
        case u("d"): return RSet().add(0x30, 0x39)
        case u("D"): return RSet().add { !isDecimalDigit($0) }
        case u("s"): return RSet().add { isJSWhitespace($0) }
        case u("S"): return RSet().add { !isJSWhitespace($0) }
        case u("w"): return RSet().add { isBasicWordChar($0) || (extras && ($0 == 0x17F || $0 == 0x212A)) }
        case u("W"): return RSet().add { !(isBasicWordChar($0) || (extras && ($0 == 0x17F || $0 == 0x212A))) }
        default: return nil
        }
    }

    /// `\p{…}` / `\P{…}` after the `p` or `P`.
    private func parseProperty(_ negated: Bool) throws -> RSet {
        pos += 1
        if pos >= p.count || p[pos] != u("{") { throw error("Invalid property name") }
        guard let close = p[pos...].firstIndex(of: u("}")) else { throw error("Invalid property name") }
        let text = String(decoding: p[(pos + 1)..<close], as: UTF16.self)
        pos = close + 1
        guard let test = UnicodeProperties.lookup(text) else { throw error("Invalid property name") }
        return RSet().add(negated ? { !test($0) } : test)
    }

    private func parseAtomEscape() throws -> RNode {
        pos += 1
        if pos >= p.count { throw error("\\ at end of pattern") }
        let c = p[pos]
        if let set = classEscapeSet(c) { pos += 1; return RClass(set, false, ignoreCase) }
        switch c {
        case u("1")...u("9"):
            let start = pos
            var n = 0
            while pos < p.count && isDigitUnit(p[pos]) { n = n > (INFINITE - 9) / 10 ? INFINITE : n * 10 + Int(p[pos] - 0x30); pos += 1 }
            if n <= totalGroups { return RBackReference([n], ignoreCase) }
            if unicodeMode { throw error("Invalid escape") }
            pos = start
            if c >= u("8") { pos += 1; return RChar(Int(c), ignoreCase) }
            return RChar(parseLegacyOctal(), ignoreCase)
        case u("0"):
            if pos + 1 < p.count && isDigitUnit(p[pos + 1]) {
                if unicodeMode { throw error("Invalid decimal escape") }
                return RChar(parseLegacyOctal(), ignoreCase)
            }
            pos += 1
            return RChar(0, ignoreCase)
        case u("k") where unicodeMode || hasNamedGroups:
            pos += 1
            if pos >= p.count || p[pos] != u("<") { throw error("Invalid named reference") }
            pos += 1
            let ref = RBackReference([], ignoreCase)
            namedReferences.append((try parseGroupName(), ref))
            return ref
        case u("p") where unicodeMode, u("P") where unicodeMode:
            return RClass(try parseProperty(c == u("P")), false, ignoreCase)
        default: break
        }
        return RChar(try parseCharacterEscape(false), ignoreCase)
    }

    /// CharacterEscape at `pos` (just after the backslash): control escapes, `\cX`, `\xHH`, `\u…`, and identity
    /// escapes. Outside unicode mode a malformed `\c` leaves the backslash as a literal and `c` to be read next.
    private func parseCharacterEscape(_ inClass: Bool) throws -> Int {
        let c = p[pos]
        switch c {
        case u("f"): pos += 1; return 0x0C
        case u("n"): pos += 1; return 0x0A
        case u("r"): pos += 1; return 0x0D
        case u("t"): pos += 1; return 0x09
        case u("v"): pos += 1; return 0x0B
        case u("c"):
            if pos + 1 < p.count && (isAsciiLetter(p[pos + 1]) || (inClass && !unicodeMode && (isDigitUnit(p[pos + 1]) || p[pos + 1] == u("_")))) {
                pos += 2
                return Int(p[pos - 1]) % 32
            }
            if unicodeMode { throw error("Invalid Unicode escape") }
            return 0x5C
        case u("x"):
            if pos + 2 < p.count && isHexDigit(p[pos + 1]) && isHexDigit(p[pos + 2]) {
                pos += 3
                return hexValue(p[pos - 2]) * 16 + hexValue(p[pos - 1])
            }
            if unicodeMode { throw error("Invalid escape") }
            pos += 1
            return Int(u("x"))
        case u("u"):
            pos += 1
            let start = pos
            if let v = parseUnicodeEscapeBody(unicodeMode) { return v }
            if unicodeMode { throw error("Invalid Unicode escape") }
            pos = start
            return Int(u("u"))
        default: break
        }
        if unicodeMode {
            if "^$\\.*+?()[]{}|/".utf16.contains(c) || (inClass && c == u("-")) { pos += 1; return Int(c) }
            throw error("Invalid escape")
        }
        let cp = peekCodePoint()
        pos += charCount(cp)
        return cp
    }

    private struct ClassAtom {
        let cp: Int
        let set: RSet?
    }

    private func parseClassAtom() throws -> ClassAtom {
        let c = p[pos]
        if c != u("\\") {
            let cp = peekCodePoint()
            pos += charCount(cp)
            return ClassAtom(cp: cp, set: nil)
        }
        pos += 1
        if pos >= p.count { throw error("\\ at end of pattern") }
        let e = p[pos]
        if let set = classEscapeSet(e) { pos += 1; return ClassAtom(cp: -1, set: set) }
        switch e {
        case u("b"): pos += 1; return ClassAtom(cp: 8, set: nil)
        case u("-"): pos += 1; return ClassAtom(cp: 0x2D, set: nil)
        case u("p") where unicodeMode, u("P") where unicodeMode: return ClassAtom(cp: -1, set: try parseProperty(e == u("P")))
        case u("0")...u("9"):
            if unicodeMode {
                if e == u("0") && !(pos + 1 < p.count && isDigitUnit(p[pos + 1])) { pos += 1; return ClassAtom(cp: 0, set: nil) }
                throw error("Invalid decimal escape")
            }
            if e >= u("8") { pos += 1; return ClassAtom(cp: Int(e), set: nil) }
            return ClassAtom(cp: parseLegacyOctal(), set: nil)
        case u("k") where unicodeMode, u("B") where unicodeMode: throw error("Invalid escape")
        default: break
        }
        return ClassAtom(cp: try parseCharacterEscape(true), set: nil)
    }

    private func parseClass() throws -> RNode {
        pos += 1
        var negated = false
        if pos < p.count && p[pos] == u("^") { negated = true; pos += 1 }
        let set = RSet()
        while true {
            if pos >= p.count { throw error("Unterminated character class") }
            if p[pos] == u("]") { pos += 1; break }
            let a = try parseClassAtom()
            if pos + 1 < p.count && p[pos] == u("-") && p[pos + 1] != u("]") {
                pos += 1
                let b = try parseClassAtom()
                if a.set != nil || b.set != nil {
                    if unicodeMode { throw error("Invalid character class") }
                    addAtom(set, a)
                    set.add(0x2D)
                    addAtom(set, b)
                } else {
                    if a.cp > b.cp { throw error("Range out of order in character class") }
                    set.add(a.cp, b.cp)
                }
            } else { addAtom(set, a) }
        }
        return RClass(set, negated, ignoreCase)
    }

    private func addAtom(_ set: RSet, _ a: ClassAtom) {
        if let s = a.set { set.addAll(s) } else { set.add(a.cp) }
    }

    // `v` mode classes (ClassSetExpression): nesting, `&&`, `--` and `\q{…}` strings. Under `i` every leaf set is
    // closed over case equivalents before the set operations combine them.

    private func leaf(_ set: RSet) -> (Int) -> Bool {
        if !ignoreCase { return { set.contains($0) } }
        return { caseClosedContains(set, $0, true) }
    }

    private func parseSetClass() throws -> RNode {
        pos += 1
        let set = try parseSetContents()
        let chars = RClass(RSet().add(set.test), false, false)
        if set.strings.isEmpty { return chars }
        var alternatives: [RNode] = []
        let points = { (s: [UInt16]) -> [Int] in String(decoding: s, as: UTF16.self).unicodeScalars.map { Int($0.value) } }
        for s in set.strings.filter({ !$0.isEmpty }).sorted(by: { points($0).count > points($1).count }) {
            alternatives.append(RSeq(points(s).map { RChar($0, ignoreCase) }))
        }
        alternatives.append(chars)
        if set.strings.contains([]) { alternatives.append(RSeq([])) }
        return RAlt(alternatives)
    }

    /// After `[`: the contents, the closing `]`, and the complement for `[^…]`.
    private func parseSetContents() throws -> SetClass {
        let negated = pos < p.count && p[pos] == u("^")
        if negated { pos += 1 }
        let set = try parseSetExpression()
        if !negated { return set }
        if !set.strings.isEmpty { throw error("Negated character class may contain strings") }
        let test = set.test
        return SetClass(test: { !test($0) }, strings: [])
    }

    private func operandSet(_ o: SetOperand) -> SetClass { o.set ?? SetClass(test: leaf(RSet().add(o.cp)), strings: []) }

    private func parseSetExpression() throws -> SetClass {
        if pos >= p.count { throw error("Unterminated character class") }
        if p[pos] == u("]") { pos += 1; return SetClass(test: { _ in false }, strings: []) }
        let first = try parseSetOperand()
        if at("&&") || at("--") {
            let intersect = at("&&")
            var test = operandSet(first).test
            var strings = operandSet(first).strings
            while true {
                if pos >= p.count { throw error("Unterminated character class") }
                if p[pos] == u("]") { pos += 1; break }
                if !at(intersect ? "&&" : "--") { throw error("Invalid set operation in character class") }
                pos += 2
                if intersect && pos < p.count && p[pos] == u("&") { throw error("Invalid character in character class") }
                let next = operandSet(try parseSetOperand())
                let a = test, b = next.test
                if intersect {
                    test = { a($0) && b($0) }
                    strings = strings.intersection(next.strings)
                } else {
                    test = { a($0) && !b($0) }
                    strings = strings.subtracting(next.strings)
                }
            }
            return SetClass(test: test, strings: strings)
        }
        let singles = RSet()
        var tests: [(Int) -> Bool] = []
        var strings = Set<[UInt16]>()
        var operand = first
        while true {
            if pos < p.count && p[pos] == u("-") && !at("--") {
                pos += 1
                let end = try parseSetOperand()
                if operand.set != nil || end.set != nil { throw error("Invalid character class") }
                if operand.cp > end.cp { throw error("Range out of order in character class") }
                singles.add(operand.cp, end.cp)
            } else if let set = operand.set {
                tests.append(set.test)
                strings.formUnion(set.strings)
            } else { singles.add(operand.cp) }
            if pos >= p.count { throw error("Unterminated character class") }
            if p[pos] == u("]") { pos += 1; break }
            if at("&&") || at("--") { throw error("Invalid set operation in character class") }
            operand = try parseSetOperand()
        }
        let single = leaf(singles)
        let all = tests
        return SetClass(test: { c in single(c) || all.contains { $0(c) } }, strings: strings)
    }

    private func parseSetOperand() throws -> SetOperand {
        if pos >= p.count { throw error("Unterminated character class") }
        let c = p[pos]
        if c == u("[") {
            pos += 1
            return SetOperand(cp: -1, set: try parseSetContents())
        }
        if c == u("\\") {
            pos += 1
            if pos >= p.count { throw error("\\ at end of pattern") }
            let e = p[pos]
            if let set = classEscapeSet(e) { pos += 1; return SetOperand(cp: -1, set: SetClass(test: leaf(set), strings: [])) }
            if e == u("p") || e == u("P") { return SetOperand(cp: -1, set: SetClass(test: leaf(try parseProperty(e == u("P"))), strings: [])) }
            if e == u("q") { return SetOperand(cp: -1, set: try parseStringDisjunction()) }
            return SetOperand(cp: try parseSetCharacterEscape(), set: nil)
        }
        return SetOperand(cp: try parseSetCharacter(), set: nil)
    }

    /// A ClassSetCharacter that is not an escape.
    private func parseSetCharacter() throws -> Int {
        let c = p[pos]
        if "()[]{}/-|".utf16.contains(c) { throw error("Invalid character in character class") }
        if "&!#$%*+,.:;<=>?@^`~".utf16.contains(c) && pos + 1 < p.count && p[pos + 1] == c { throw error("Invalid set operation in character class") }
        let cp = codePointAt(pos)
        pos += charCount(cp)
        return cp
    }

    /// After the backslash of an escaped ClassSetCharacter.
    private func parseSetCharacterEscape() throws -> Int {
        let e = p[pos]
        if e == u("b") { pos += 1; return 8 }
        if "&-!#%,:;<=>@`~".utf16.contains(e) { pos += 1; return Int(e) }
        if isDigitUnit(e) {
            if e == u("0") && !(pos + 1 < p.count && isDigitUnit(p[pos + 1])) { pos += 1; return 0 }
            throw error("Invalid decimal escape")
        }
        return try parseCharacterEscape(true)
    }

    /// `\q{a|bc|…}` after the backslash.
    private func parseStringDisjunction() throws -> SetClass {
        pos += 1
        if pos >= p.count || p[pos] != u("{") { throw error("Invalid escape") }
        pos += 1
        let singles = RSet()
        var strings = Set<[UInt16]>()
        var current: [UInt16] = []
        func finish() {
            let points = String(decoding: current, as: UTF16.self).unicodeScalars
            if points.count == 1 { singles.add(Int(points.first!.value)) } else { strings.insert(current) }
            current = []
        }
        func append(_ cp: Int) {
            if cp > 0xFFFF { current += [UInt16(0xD800 + ((cp - 0x10000) >> 10)), UInt16(0xDC00 + ((cp - 0x10000) & 0x3FF))] } else { current.append(UInt16(cp)) }
        }
        while true {
            if pos >= p.count { throw error("Unterminated character class") }
            switch p[pos] {
            case u("}"):
                pos += 1
                finish()
                return SetClass(test: leaf(singles), strings: strings)
            case u("|"):
                pos += 1
                finish()
            case u("\\"):
                pos += 1
                if pos >= p.count { throw error("\\ at end of pattern") }
                append(try parseSetCharacterEscape())
            default: append(try parseSetCharacter())
            }
        }
    }
}

/// `\p{…}` names: General_Category values, binary properties, and Script / Script_Extensions values.
enum UnicodeProperties {
    private static func category(_ cp: Int) -> Unicode.GeneralCategory { scalar(cp)?.properties.generalCategory ?? .surrogate }
    private static func types(_ t: Unicode.GeneralCategory...) -> (Int) -> Bool { { t.contains(category($0)) } }
    private static func has(_ test: @escaping (Unicode.Scalar.Properties) -> Bool) -> (Int) -> Bool { { cp in scalar(cp).map { test($0.properties) } ?? false } }

    private static let categories: [String: (Int) -> Bool] = {
        var out: [String: (Int) -> Bool] = [:]
        func def(_ test: @escaping (Int) -> Bool, _ names: String...) { for n in names { out[n] = test } }
        def(types(.uppercaseLetter, .lowercaseLetter, .titlecaseLetter, .modifierLetter, .otherLetter), "L", "Letter")
        def(types(.uppercaseLetter, .lowercaseLetter, .titlecaseLetter), "LC", "Cased_Letter")
        def(types(.uppercaseLetter), "Lu", "Uppercase_Letter")
        def(types(.lowercaseLetter), "Ll", "Lowercase_Letter")
        def(types(.titlecaseLetter), "Lt", "Titlecase_Letter")
        def(types(.modifierLetter), "Lm", "Modifier_Letter")
        def(types(.otherLetter), "Lo", "Other_Letter")
        def(types(.nonspacingMark, .spacingMark, .enclosingMark), "M", "Mark", "Combining_Mark")
        def(types(.nonspacingMark), "Mn", "Nonspacing_Mark")
        def(types(.spacingMark), "Mc", "Spacing_Mark")
        def(types(.enclosingMark), "Me", "Enclosing_Mark")
        def(types(.decimalNumber, .letterNumber, .otherNumber), "N", "Number")
        def(types(.decimalNumber), "Nd", "Decimal_Number", "digit")
        def(types(.letterNumber), "Nl", "Letter_Number")
        def(types(.otherNumber), "No", "Other_Number")
        def(types(.connectorPunctuation, .dashPunctuation, .openPunctuation, .closePunctuation, .initialPunctuation, .finalPunctuation, .otherPunctuation), "P", "Punctuation", "punct")
        def(types(.connectorPunctuation), "Pc", "Connector_Punctuation")
        def(types(.dashPunctuation), "Pd", "Dash_Punctuation")
        def(types(.openPunctuation), "Ps", "Open_Punctuation")
        def(types(.closePunctuation), "Pe", "Close_Punctuation")
        def(types(.initialPunctuation), "Pi", "Initial_Punctuation")
        def(types(.finalPunctuation), "Pf", "Final_Punctuation")
        def(types(.otherPunctuation), "Po", "Other_Punctuation")
        def(types(.mathSymbol, .currencySymbol, .modifierSymbol, .otherSymbol), "S", "Symbol")
        def(types(.mathSymbol), "Sm", "Math_Symbol")
        def(types(.currencySymbol), "Sc", "Currency_Symbol")
        def(types(.modifierSymbol), "Sk", "Modifier_Symbol")
        def(types(.otherSymbol), "So", "Other_Symbol")
        def(types(.spaceSeparator, .lineSeparator, .paragraphSeparator), "Z", "Separator")
        def(types(.spaceSeparator), "Zs", "Space_Separator")
        def(types(.lineSeparator), "Zl", "Line_Separator")
        def(types(.paragraphSeparator), "Zp", "Paragraph_Separator")
        def(types(.control, .format, .surrogate, .privateUse, .unassigned), "C", "Other")
        def(types(.control), "Cc", "Control", "cntrl")
        def(types(.format), "Cf", "Format")
        def(types(.surrogate), "Cs", "Surrogate")
        def(types(.privateUse), "Co", "Private_Use")
        def(types(.unassigned), "Cn", "Unassigned")
        return out
    }()

    /// Extended_Pictographic as of Unicode 15 (Swift's scalar properties do not have it).
    private static let pictographic: [Int] = [
        0xA9, 0xA9, 0xAE, 0xAE, 0x203C, 0x203C, 0x2049, 0x2049, 0x2122, 0x2122, 0x2139, 0x2139, 0x2194, 0x2199, 0x21A9, 0x21AA,
        0x231A, 0x231B, 0x2328, 0x2328, 0x2388, 0x2388, 0x23CF, 0x23CF, 0x23E9, 0x23F3, 0x23F8, 0x23FA, 0x24C2, 0x24C2,
        0x25AA, 0x25AB, 0x25B6, 0x25B6, 0x25C0, 0x25C0, 0x25FB, 0x25FE, 0x2600, 0x2605, 0x2607, 0x2612, 0x2614, 0x2685,
        0x2690, 0x2705, 0x2708, 0x2712, 0x2714, 0x2714, 0x2716, 0x2716, 0x271D, 0x271D, 0x2721, 0x2721, 0x2728, 0x2728,
        0x2733, 0x2734, 0x2744, 0x2744, 0x2747, 0x2747, 0x274C, 0x274C, 0x274E, 0x274E, 0x2753, 0x2755, 0x2757, 0x2757,
        0x2763, 0x2767, 0x2795, 0x2797, 0x27A1, 0x27A1, 0x27B0, 0x27B0, 0x27BF, 0x27BF, 0x2934, 0x2935, 0x2B05, 0x2B07,
        0x2B1B, 0x2B1C, 0x2B50, 0x2B50, 0x2B55, 0x2B55, 0x3030, 0x3030, 0x303D, 0x303D, 0x3297, 0x3297, 0x3299, 0x3299,
        0x1F000, 0x1F0FF, 0x1F10D, 0x1F10F, 0x1F12F, 0x1F12F, 0x1F16C, 0x1F171, 0x1F17E, 0x1F17F, 0x1F18E, 0x1F18E,
        0x1F191, 0x1F19A, 0x1F1AD, 0x1F1E5, 0x1F201, 0x1F20F, 0x1F21A, 0x1F21A, 0x1F22F, 0x1F22F, 0x1F232, 0x1F23A,
        0x1F23C, 0x1F23F, 0x1F249, 0x1F3FA, 0x1F400, 0x1F53D, 0x1F546, 0x1F64F, 0x1F680, 0x1F6FF, 0x1F774, 0x1F77F,
        0x1F7D5, 0x1F7FF, 0x1F80C, 0x1F80F, 0x1F848, 0x1F84F, 0x1F85A, 0x1F85F, 0x1F888, 0x1F88F, 0x1F8AE, 0x1F8FF,
        0x1F90C, 0x1F93A, 0x1F93C, 0x1F945, 0x1F947, 0x1FAFF, 0x1FC00, 0x1FFFD,
    ]

    private static func inRanges(_ ranges: [Int], _ cp: Int) -> Bool {
        var i = 0
        while i < ranges.count {
            if cp < ranges[i] { return false }
            if cp <= ranges[i + 1] { return true }
            i += 2
        }
        return false
    }

    private static func isPictographic(_ cp: Int) -> Bool { inRanges(pictographic, cp) }

    private static let binary: [String: (Int) -> Bool] = {
        var out: [String: (Int) -> Bool] = [:]
        func def(_ test: @escaping (Int) -> Bool, _ names: String...) { for n in names { out[n] = test } }
        def({ _ in true }, "Any")
        def({ $0 < 0x80 }, "ASCII")
        def({ category($0) != .unassigned }, "Assigned")
        def(has { $0.isAlphabetic }, "Alphabetic", "Alpha")
        def(has { $0.isLowercase }, "Lowercase", "Lower")
        def(has { $0.isUppercase }, "Uppercase", "Upper")
        def(has { $0.isWhitespace }, "White_Space", "space")
        def(has { $0.isIDStart }, "ID_Start", "IDS")
        def(has { $0.isIDContinue }, "ID_Continue", "IDC")
        def(has { $0.isXIDStart }, "XID_Start", "XIDS")
        def(has { $0.isXIDContinue }, "XID_Continue", "XIDC")
        def(has { $0.isIdeographic }, "Ideographic", "Ideo")
        def(has { $0.isUnifiedIdeograph }, "Unified_Ideograph", "UIdeo")
        def(has { $0.isASCIIHexDigit }, "ASCII_Hex_Digit", "AHex")
        def(has { $0.isHexDigit }, "Hex_Digit", "Hex")
        def(has { $0.isBidiMirrored }, "Bidi_Mirrored", "Bidi_M")
        def(has { $0.isBidiControl }, "Bidi_Control", "Bidi_C")
        def({ isPictographic($0) }, "Extended_Pictographic", "ExtPict")
        def(has { $0.isEmoji }, "Emoji")
        def(has { $0.isEmojiPresentation }, "Emoji_Presentation", "EPres")
        def(has { $0.isEmojiModifier }, "Emoji_Modifier", "EMod")
        def(has { $0.isEmojiModifierBase }, "Emoji_Modifier_Base", "EBase")
        def({ $0 >= 0x1F1E6 && $0 <= 0x1F1FF }, "Regional_Indicator", "RI")
        def(has { $0.isCaseIgnorable }, "Case_Ignorable", "CI")
        def(has { $0.isCased }, "Cased")
        def(has { $0.isDefaultIgnorableCodePoint }, "Default_Ignorable_Code_Point", "DI")
        def(has { $0.changesWhenCaseFolded }, "Changes_When_Casefolded", "CWCF")
        def(has { $0.changesWhenCaseMapped }, "Changes_When_Casemapped", "CWCM")
        def(has { $0.changesWhenLowercased }, "Changes_When_Lowercased", "CWL")
        def(has { $0.changesWhenUppercased }, "Changes_When_Uppercased", "CWU")
        def(has { $0.changesWhenTitlecased }, "Changes_When_Titlecased", "CWT")
        def(has { $0.changesWhenNFKCCaseFolded }, "Changes_When_NFKC_Casefolded", "CWKCF")
        def(has { $0.isMath }, "Math")
        def(has { $0.isDash }, "Dash")
        def(has { $0.isDiacritic }, "Diacritic", "Dia")
        def(has { $0.isExtender }, "Extender", "Ext")
        def(has { $0.isJoinControl }, "Join_Control", "Join_C")
        def(has { $0.isNoncharacterCodePoint }, "Noncharacter_Code_Point", "NChar")
        def(has { $0.isPatternSyntax }, "Pattern_Syntax", "Pat_Syn")
        def(has { $0.isPatternWhitespace }, "Pattern_White_Space", "Pat_WS")
        def(has { $0.isQuotationMark }, "Quotation_Mark", "QMark")
        def(has { $0.isRadical }, "Radical")
        def(has { $0.isSentenceTerminal }, "Sentence_Terminal", "STerm")
        def(has { $0.isSoftDotted }, "Soft_Dotted", "SD")
        def(has { $0.isTerminalPunctuation }, "Terminal_Punctuation", "Term")
        def(has { $0.isVariationSelector }, "Variation_Selector", "VS")
        def(has { $0.isGraphemeBase }, "Grapheme_Base", "Gr_Base")
        def(has { $0.isGraphemeExtend }, "Grapheme_Extend", "Gr_Ext")
        def(has { $0.isIDSBinaryOperator }, "IDS_Binary_Operator", "IDSB")
        def(has { $0.isIDSTrinaryOperator }, "IDS_Trinary_Operator", "IDST")
        def(has { $0.isLogicalOrderException }, "Logical_Order_Exception", "LOE")
        def(has { $0.isDeprecated }, "Deprecated", "Dep")
        return out
    }()

    /// Every scalar in order, as UTF-16, for ICU to report a script's ranges: Swift's scalar properties have no script.
    private static let everyScalar: NSString = {
        var units: [UInt16] = []
        units.reserveCapacity(0x10000 - 0x800 + 2 * 0x100000)
        for c in 0..<0x10000 where !isSurrogateCode(c) { units.append(UInt16(c)) }
        for c in 0x10000...0x10FFFF { units += [UInt16(0xD800 + ((c - 0x10000) >> 10)), UInt16(0xDC00 + ((c - 0x10000) & 0x3FF))] }
        return NSString(characters: units, length: units.count)
    }()

    private static var scripts: [String: [Int]] = [:]

    private static func codePoint(at offset: Int) -> Int {
        offset < 0xD800 ? offset : offset < 0xF800 ? offset + 0x800 : 0x10000 + (offset - 0xF800) / 2
    }

    /// A script's code points, as ICU's `\p{sc=…}` (or `\p{scx=…}`) has them, for a name spelled as JavaScript
    /// spells it: its canonical name or its four-letter alias.
    private static func script(_ name: String, extensions: Bool) -> ((Int) -> Bool)? {
        guard let first = name.unicodeScalars.first, ("A"..."Z").contains(first) else { return nil }
        let words = name.split(separator: "_", omittingEmptySubsequences: false)
        guard name.count == 4 || words.allSatisfy({ w in w.first.map { ("A"..."Z").contains($0) } == true && w.dropFirst().allSatisfy { ("a"..."z").contains($0) } }) else { return nil }
        let key = (extensions ? "scx=" : "sc=") + name
        if scripts[key] == nil {
            guard let re = try? NSRegularExpression(pattern: "\\p{\(extensions ? "Script_Extensions" : "Script")=\(name)}+") else { return nil }
            var ranges: [Int] = []
            for m in re.matches(in: everyScalar as String, range: NSRange(location: 0, length: everyScalar.length)) {
                ranges += [codePoint(at: m.range.location), codePoint(at: m.range.location + m.range.length - 1)]
            }
            scripts[key] = ranges
        }
        let ranges = scripts[key]!
        return { inRanges(ranges, $0) }
    }

    static func lookup(_ text: String) -> ((Int) -> Bool)? {
        guard let eq = text.firstIndex(of: "=") else { return categories[text] ?? binary[text] }
        let key = String(text[..<eq])
        let value = String(text[text.index(after: eq)...])
        switch key {
        case "General_Category", "gc": return categories[value]
        case "Script", "sc": return script(value, extensions: false)
        case "Script_Extensions", "scx": return script(value, extensions: true)
        default: return nil
        }
    }
}

// Matching
//
// A pattern compiles to a bytecode program run by a backtracking VM. Choice points, and the undo records that put
// captures and loop registers back, live on one stack of words: a step allocates nothing, and a match's depth is
// bounded by memory, not by the thread's stack. The semantics are §22.2.2's: RepeatMatcher's capture resets and
// empty-iteration check, a group set when its body completes, atomic lookarounds, lookbehind read right to left.

// The VM's instructions; each is its opcode and the operands listed.
/// code point, forward
private let OP_CHAR = 0
/// class, forward
private let OP_CLASS = 1
/// literal (a run of BMP code units compared case-sensitively, forward)
private let OP_LITERAL = 2
/// kind (^ $ \b \B), multiline, word extras
private let OP_ASSERT = 3
/// preferred, other: goes on at `preferred`, backtracking to `other`
private let OP_SPLIT = 4
/// target
private let OP_JUMP = 5
/// group: notes where its text starts
private let OP_GROUP_OPEN = 6
/// group, forward: sets its capture
private let OP_GROUP_CLOSE = 7
/// register
private let OP_LOOP_INIT = 8
/// register, min, max, greedy, exit; LOOP_BODY follows
private let OP_LOOP_HEAD = 9
/// register, first capture slot reset, end of them
private let OP_LOOP_BODY = 10
/// register, head, min
private let OP_LOOP_TAIL = 11
/// class, min, max, greedy, forward: a quantified single character, without a loop
private let OP_REPEAT = 12
/// groups, ignore case, forward
private let OP_BACKREF = 13
/// negative, continuation; the body follows, ending in SUCCEED
private let OP_LOOK = 14
private let OP_SUCCEED = 15

private let ASSERT_START = 0
private let ASSERT_END = 1
private let ASSERT_BOUNDARY = 2
private let ASSERT_NOT_BOUNDARY = 3

// Backtrack stack entries: their values, then the tag on top.
/// pc, position: where to go on when what follows fails
private let T_CHOICE = 0
/// slot, old value
private let T_UNDO = 1
/// REPEAT op, least position, position: a greedy run giving back one character at a time
private let T_GREEDY = 2
/// REPEAT op, position, count: a lazy run taking one more character at a time
private let T_LAZY = 3

/// How many of a match's first code units the search checks before an attempt.
private let LEAD_LIMIT = 8

/// A greedy REPEAT whose run is never given back (RegexCompiler.followers).
private let POSSESSIVE = -2

/// A character test with the answers for ASCII in a bitmap; `rest` answers for the others, none when nil.
final class CharClass {
    nonisolated deinit {}
    private let low: UInt64, high: UInt64
    private let rest: ((Int) -> Bool)?

    init(_ low: UInt64, _ high: UInt64, _ rest: ((Int) -> Bool)?) {
        self.low = low
        self.high = high
        self.rest = rest
    }

    @inline(__always) func has(_ c: Int) -> Bool {
        if c < 128 { return ((c < 64 ? low >> UInt64(c) : high >> UInt64(c - 64)) & 1) != 0 }
        guard let rest else { return false }
        return rest(c)
    }

    func union(_ other: CharClass) -> CharClass {
        let a = rest, b = other.rest
        return CharClass(low | other.low, high | other.high, a == nil ? b : b == nil ? a : { a!($0) || b!($0) })
    }

    /// `test` as a class; `rest` must answer as `test` does from 128 on.
    static func of(_ test: (Int) -> Bool, _ rest: ((Int) -> Bool)?) -> CharClass {
        var low: UInt64 = 0, high: UInt64 = 0
        for c in 0..<64 where test(c) { low |= 1 << UInt64(c) }
        for c in 64..<128 where test(c) { high |= 1 << UInt64(c - 64) }
        return CharClass(low, high, rest)
    }
}

/// Where the character read forward at `x` (before the end) ends: past a surrogate pair in unicode mode.
@inline(__always) private func endAfter(_ s: UnsafeBufferPointer<UInt16>, _ x: Int, _ unicode: Bool) -> Int {
    unicode && isLeadUnit(s[x]) && x + 1 < s.count && isTrailUnit(s[x + 1]) ? x + 2 : x + 1
}

/// Where the character read backward from `x` (after the start) starts.
@inline(__always) private func startBefore(_ s: UnsafeBufferPointer<UInt16>, _ x: Int, _ unicode: Bool) -> Int {
    unicode && isTrailUnit(s[x - 1]) && x >= 2 && isLeadUnit(s[x - 2]) ? x - 2 : x - 1
}

/// Whether `x` falls between the halves of a surrogate pair. As V8 reads `u`-mode patterns, a character read there
/// fails (it desugars a lone surrogate to one not paired), so only what reads no character matches at such a position.
@inline(__always) private func splitsPair(_ s: UnsafeBufferPointer<UInt16>, _ x: Int) -> Bool {
    x > 0 && x < s.count && isTrailUnit(s[x]) && isLeadUnit(s[x - 1])
}

/// The character from `a` to `b`: one code unit or a surrogate pair.
@inline(__always) private func pointIn(_ s: UnsafeBufferPointer<UInt16>, _ a: Int, _ b: Int) -> Int {
    b - a == 2 ? 0x10000 + ((Int(s[a]) - 0xD800) << 10) + (Int(s[a + 1]) - 0xDC00) : Int(s[a])
}

@inline(__always) private func isWordAt(_ s: UnsafeBufferPointer<UInt16>, _ i: Int, _ extras: Bool) -> Bool {
    if i < 0 || i >= s.count { return false }
    let c = Int(s[i])
    return isBasicWordChar(c) || (extras && (c == 0x17F || c == 0x212A))
}

/// Words that live as long as this object does.
nonisolated final class RegexWords {
    let base: UnsafeMutablePointer<Int>

    init(_ values: [Int]) {
        base = .allocate(capacity: max(1, values.count))
        base.initialize(from: values, count: values.count)
    }

    deinit { base.deallocate() }
}

/// A compiled pattern: immutable, so expressions with the same source and flags share it.
final class RegexProgram {
    let groupCount: Int
    let groupNames: [(String, Int)]
    let unicode: Bool
    let code: UnsafeMutablePointer<Int>
    let codeCount: Int
    let classes: [CharClass]
    let literals: [[UInt16]]
    let references: [[Int]]
    /// Per REPEAT instruction, the code unit what follows it reads first (see RegexCompiler.followers).
    let followers: UnsafeMutablePointer<Int>
    /// Owns `code` and `followers`.
    private let words: RegexWords
    /// Captures (start and end per group), then where each open group started, then two registers per loop.
    let slotCount: Int

    /// Text every match starts with, else empty.
    private let prefix: [UInt16]
    /// What the first character of every match satisfies, when the pattern cannot match empty.
    private let first: CharClass?
    /// Outside unicode mode, what each of the first code units of every match satisfies, when more than one is known.
    private let lead: [CharClass]?
    /// The class of an unbounded greedy run every match starts with (`\w+@…`), where no backreference reads where a
    /// match started. An attempt from inside the run of a failed one explores a subset of its continuations, so the
    /// search goes on where that run ends.
    private let leadingRun: CharClass?

    init(_ root: RNode, _ groupCount: Int, _ groupNames: [(String, Int)], _ unicode: Bool) {
        self.groupCount = groupCount
        self.groupNames = groupNames
        self.unicode = unicode
        let c = RegexCompiler(groupCount, unicode)
        c.compile(root, true)
        c.emit(OP_SUCCEED)
        codeCount = c.code.count
        let f = c.followers()
        words = RegexWords(c.code + f)
        code = words.base
        followers = words.base + codeCount
        classes = c.classes
        literals = c.literals
        references = c.references
        slotCount = c.slotCount
        let prefix = RegexProgram.prefixOf(root)
        self.prefix = prefix
        first = prefix.isEmpty ? c.firstOf(root) : nil
        if prefix.isEmpty && !unicode, case let l = c.leadOf(root).0, l.count > 1 { lead = l } else { lead = nil }
        leadingRun = c.references.isEmpty ? RegexProgram.leadingRunOf(root).flatMap { c.firstOf($0.body) } : nil
    }

    nonisolated deinit {}

    private static func leadingRunOf(_ n: RNode) -> RRepeat? {
        switch n {
        case let r as RRepeat: return (r.body is RChar || r.body is RClass) && r.groupCount == 0 && r.greedy && r.min >= 1 && r.max == INFINITE ? r : nil
        case let g as RGroup: return leadingRunOf(g.body)
        case let s as RSeq: return s.items.first.flatMap { leadingRunOf($0) }
        default: return nil
        }
    }

    /// Where to try after a failed attempt at `start`.
    func nextStart(_ s: UnsafeBufferPointer<UInt16>, _ start: Int) -> Int {
        guard let run = leadingRun else { return start + 1 }
        var x = start
        while x < s.count && !(unicode && splitsPair(s, x)) {
            let e = endAfter(s, x, unicode)
            if !run.has(pointIn(s, x, e)) { break }
            x = e
        }
        return x > start ? x : start + 1
    }

    private static func literal(_ n: RNode) -> UInt16? {
        guard let c = n as? RChar, !c.ignoreCase, c.cp <= 0xFFFF, !isSurrogateCode(c.cp) else { return nil }
        return UInt16(c.cp)
    }

    private static func prefixOf(_ n: RNode) -> [UInt16] {
        switch n {
        case is RChar: return literal(n).map { [$0] } ?? []
        case let g as RGroup: return prefixOf(g.body)
        case let r as RRepeat: return r.min > 0 ? prefixOf(r.body) : []
        case let s as RSeq:
            var out: [UInt16] = []
            for item in s.items {
                if let c = literal(item) { out.append(c) } else {
                    if out.isEmpty { out = prefixOf(item) }
                    break
                }
            }
            return out
        default: return []
        }
    }

    /// The first position at or after `from` where a match may start, among those the search visits; -1 when none.
    func candidate(_ s: UnsafeBufferPointer<UInt16>, _ from: Int) -> Int {
        let n = s.count
        if !prefix.isEmpty {
            let c0 = prefix[0], k = prefix.count
            var x = from
            while x + k <= n {
                if s[x] == c0 {
                    var j = 1
                    while j < k && s[x + j] == prefix[j] { j += 1 }
                    if j == k { return x }
                }
                x += 1
            }
            return -1
        }
        if let lead {
            let f = lead[0]
            var x = from
            while x < n {
                if f.has(Int(s[x])) {
                    var j = 1
                    while j < lead.count && x + j < n && lead[j].has(Int(s[x + j])) { j += 1 }
                    if j == lead.count { return x }
                    // No later position leaves room for the lead either.
                    if x + j >= n { return -1 }
                }
                x += 1
            }
            return -1
        }
        guard let f = first else { return from }
        var x = from
        if !unicode {
            while x < n {
                if f.has(Int(s[x])) { return x }
                x += 1
            }
            return -1
        }
        while x < n {
            let e = endAfter(s, x, true)
            if f.has(pointIn(s, x, e)) { return x }
            x = e
        }
        return -1
    }
}

final class RegexCompiler {
    nonisolated deinit {}
    var code: [Int] = []
    var classes: [CharClass] = []
    var literals: [[UInt16]] = []
    var references: [[Int]] = []
    private let groupStarts: Int
    var slotCount: Int
    let unicode: Bool

    init(_ groupCount: Int, _ unicode: Bool) {
        groupStarts = 2 * (groupCount + 1)
        slotCount = 3 * (groupCount + 1)
        self.unicode = unicode
    }

    @discardableResult func emit(_ words: Int...) -> Int {
        let at = code.count
        code += words
        return at
    }

    private func charTest(_ n: RNode) -> (Int) -> Bool {
        let u = unicode
        if let c = n as? RChar {
            let cp = c.cp
            if !c.ignoreCase { return { $0 == cp } }
            let canon = CaseFolding.canonicalize(cp, u)
            return { $0 == cp || CaseFolding.canonicalize($0, u) == canon }
        }
        let k = n as! RClass
        let set = k.set, negated = k.negated
        if !k.ignoreCase { return { set.contains($0) != negated } }
        return { caseClosedContains(set, $0, u) != negated }
    }

    /// `n` (a character or class) as a class, deciding characters past ASCII without `test` where the set allows.
    private func classOf(_ n: RNode) -> CharClass {
        let test = charTest(n)
        let rest: ((Int) -> Bool)?
        if let c = n as? RChar, !c.ignoreCase { rest = c.cp < 128 ? nil : test }
        else if let k = n as? RClass, !k.ignoreCase, k.set.predicates.isEmpty, k.set.ranges.allSatisfy({ $0.1 < 128 }) { rest = k.negated ? { _ in true } : nil }
        else { rest = test }
        return CharClass.of(test, rest)
    }

    private func classIndex(_ n: RNode) -> Int {
        classes.append(classOf(n))
        return classes.count - 1
    }

    /// What the first character of any match of `n` satisfies; nil when `n` can match empty or that is not known.
    func firstOf(_ n: RNode) -> CharClass? {
        switch n {
        case is RChar, is RClass: return classOf(n)
        case let g as RGroup: return firstOf(g.body)
        case let r as RRepeat: return r.min > 0 ? firstOf(r.body) : nil
        case let a as RAlt:
            var acc: CharClass?
            for alt in a.alternatives {
                guard let f = firstOf(alt) else { return nil }
                acc = acc?.union(f) ?? f
            }
            return acc
        // Assertions and lookarounds consume nothing: the first character is the next item's.
        case let s as RSeq: return s.items.first(where: { !($0 is RAssertion) && !($0 is RLook) }).flatMap { firstOf($0) }
        default: return nil
        }
    }

    /// For each forward greedy REPEAT, the BMP code unit the instruction after it must read first, else -1: giving
    /// characters back stops only where that unit is, since anywhere else that instruction fails at once (a group's
    /// opening or closing between them only writes what that failure undoes). Where the repeated class excludes that
    /// unit, no character given back can be it, and the value is POSSESSIVE.
    func followers() -> [Int] {
        var out = [Int](repeating: -1, count: code.count)
        var pc = 0
        while pc < code.count {
            let op = code[pc]
            if op == OP_REPEAT && code[pc + 4] != 0 && code[pc + 5] != 0 {
                var next = pc + 6
                while next < code.count && (code[next] == OP_GROUP_CLOSE || code[next] == OP_GROUP_OPEN) { next += width(code[next]) }
                var unit = -1
                if next < code.count {
                    if code[next] == OP_CHAR { unit = code[next + 2] != 0 && code[next + 1] <= 0xFFFF && !isSurrogateCode(code[next + 1]) ? code[next + 1] : -1 }
                    else if code[next] == OP_LITERAL { unit = Int(literals[code[next + 1]][0]) }
                }
                out[pc] = unit >= 0 && !classes[code[pc + 1]].has(unit) ? POSSESSIVE : unit
            }
            pc += width(op)
        }
        return out
    }

    private func width(_ op: Int) -> Int {
        switch op {
        case OP_SUCCEED: return 1
        case OP_LITERAL, OP_JUMP, OP_GROUP_OPEN, OP_LOOP_INIT: return 2
        case OP_CHAR, OP_CLASS, OP_SPLIT, OP_GROUP_CLOSE, OP_LOOK: return 3
        case OP_ASSERT, OP_LOOP_BODY, OP_LOOP_TAIL, OP_BACKREF: return 4
        default: return 6
        }
    }

    /// Outside unicode mode, the classes of the first code units of every match of `n` (at most LEAD_LIMIT), and
    /// whether they are all of it: then what follows `n` goes on after them.
    func leadOf(_ n: RNode) -> ([CharClass], Bool) {
        switch n {
        case is RChar, is RClass: return ([classOf(n)], true)
        case let g as RGroup: return leadOf(g.body)
        case is RAssertion, is RLook: return ([], true)
        case let r as RRepeat:
            if (r.body is RChar || r.body is RClass) && r.min > 0 {
                let cls = classOf(r.body)
                return ([CharClass](repeating: cls, count: min(r.min, LEAD_LIMIT)), r.min == r.max && r.min <= LEAD_LIMIT)
            }
            return r.min > 0 ? (leadOf(r.body).0, false) : ([], false)
        case let s as RSeq:
            var out: [CharClass] = []
            var whole = true
            for item in s.items {
                let (classes, complete) = leadOf(item)
                out += classes
                if !complete || out.count >= LEAD_LIMIT {
                    whole = complete
                    break
                }
            }
            return (Array(out.prefix(LEAD_LIMIT)), whole && out.count <= LEAD_LIMIT)
        default: return ([], false)
        }
    }

    private func isLiteral(_ n: RNode) -> Bool {
        guard let c = n as? RChar else { return false }
        return !c.ignoreCase && c.cp <= 0xFFFF && !isSurrogateCode(c.cp)
    }

    func compile(_ n: RNode, _ forward: Bool) {
        let f = forward ? 1 : 0
        switch n {
        case let c as RChar:
            if c.ignoreCase { emit(OP_CLASS, classIndex(n), f) } else { emit(OP_CHAR, c.cp, f) }
        case is RClass: emit(OP_CLASS, classIndex(n), f)
        case let s as RSeq:
            if !forward {
                for item in s.items.reversed() { compile(item, false) }
                return
            }
            var i = 0
            while i < s.items.count {
                var j = i
                while j < s.items.count && isLiteral(s.items[j]) { j += 1 }
                if j - i >= 2 {
                    literals.append(s.items[i..<j].map { UInt16(($0 as! RChar).cp) })
                    emit(OP_LITERAL, literals.count - 1)
                    i = j
                } else {
                    compile(s.items[i], true)
                    i += 1
                }
            }
        case let a as RAlt:
            var ends: [Int] = []
            for k in 0..<(a.alternatives.count - 1) {
                let split = emit(OP_SPLIT, 0, 0)
                code[split + 1] = code.count
                compile(a.alternatives[k], forward)
                ends.append(emit(OP_JUMP, 0))
                code[split + 2] = code.count
            }
            compile(a.alternatives[a.alternatives.count - 1], forward)
            for e in ends { code[e + 1] = code.count }
        case let a as RAssertion:
            let kind = a.kind == UInt16(ascii: "^") ? ASSERT_START : a.kind == UInt16(ascii: "$") ? ASSERT_END : a.kind == UInt16(ascii: "b") ? ASSERT_BOUNDARY : ASSERT_NOT_BOUNDARY
            emit(OP_ASSERT, kind, a.multiline ? 1 : 0, a.wordExtras ? 1 : 0)
        case let g as RGroup:
            emit(OP_GROUP_OPEN, groupStarts + g.index)
            compile(g.body, forward)
            emit(OP_GROUP_CLOSE, g.index, f)
        case let l as RLook:
            let look = emit(OP_LOOK, l.negative ? 1 : 0, 0)
            compile(l.body, l.ahead)
            emit(OP_SUCCEED)
            code[look + 2] = code.count
        case let b as RBackReference:
            references.append(b.groups)
            emit(OP_BACKREF, references.count - 1, b.ignoreCase ? 1 : 0, f)
        case let r as RRepeat:
            if r.max == 0 { return }
            if (r.body is RChar || r.body is RClass) && r.groupCount == 0 {
                emit(OP_REPEAT, classIndex(r.body), r.min, r.max, r.greedy ? 1 : 0, f)
                return
            }
            let register = slotCount
            slotCount += 2
            emit(OP_LOOP_INIT, register)
            let head = emit(OP_LOOP_HEAD, register, r.min, r.max, r.greedy ? 1 : 0, 0)
            emit(OP_LOOP_BODY, register, 2 * (r.firstGroup + 1), 2 * (r.firstGroup + r.groupCount + 1))
            compile(r.body, forward)
            emit(OP_LOOP_TAIL, register, head, r.min)
            code[head + 5] = code.count
        default: break
        }
    }
}

private extension UInt16 {
    init(ascii c: Unicode.Scalar) { self = UInt16(c.value) }
}

/// The VM's state: one for the script thread, which a match never re-enters, since it runs no script. It lives as
/// long as the program does, so its buffers are never freed.
final class RegexVM {
    private var slots: UnsafeMutablePointer<Int>
    private var slotCapacity = 16
    private var stack: UnsafeMutablePointer<Int>
    private var stackCapacity = RegexVM.initialStack
    private var top = 0
    private var kept: [Int] = []
    private var program: RegexProgram!
    private var input = UnsafeBufferPointer<UInt16>(start: nil, count: 0)

    private static let initialStack = 256
    /// A stack grown past this by one long match is let go after it rather than kept.
    private static let retainedStack = 1 << 16

    init() {
        slots = .allocate(capacity: slotCapacity)
        stack = .allocate(capacity: stackCapacity)
    }

    nonisolated deinit {}

    /// The capture slots of the first match at or after `from` (exactly there when `sticky`), or nil.
    func search(_ p: RegexProgram, _ s: UnsafeBufferPointer<UInt16>, _ from: Int, _ sticky: Bool) -> [Int]? {
        if slotCapacity < p.slotCount {
            slots.deallocate()
            slotCapacity = p.slotCount
            slots = .allocate(capacity: slotCapacity)
        }
        slots.update(repeating: -1, count: p.slotCount)
        program = p
        input = s
        top = 0
        defer {
            if stackCapacity > RegexVM.retainedStack {
                stack.deallocate()
                stackCapacity = RegexVM.initialStack
                stack = .allocate(capacity: stackCapacity)
            }
            program = nil
            input = UnsafeBufferPointer(start: nil, count: 0)
        }
        var start = from
        while start <= s.count {
            if !sticky {
                start = p.candidate(s, start)
                if start < 0 { return nil }
            }
            // A failed attempt unwinds every write it made, so the slots are all unset again for the next.
            let end = run(0, start, 0)
            if end >= 0 {
                var captures = Array(UnsafeBufferPointer(start: slots, count: 2 * (p.groupCount + 1)))
                captures[0] = start
                captures[1] = end
                return captures
            }
            if sticky { return nil }
            // Past a leading run, else one code unit on: in `u` mode too, as V8 tries the positions inside a pair (see splitsPair).
            start = p.nextStart(s, start)
        }
        return nil
    }

    private func grow(_ needed: Int) {
        var capacity = stackCapacity * 2
        while capacity < needed { capacity *= 2 }
        let bigger = UnsafeMutablePointer<Int>.allocate(capacity: capacity)
        bigger.moveInitialize(from: stack, count: top)
        stack.deallocate()
        stack = bigger
        stackCapacity = capacity
    }

    @inline(__always) private func push(_ a: Int, _ b: Int, _ tag: Int) {
        if top + 3 > stackCapacity { grow(top + 3) }
        stack[top] = a
        stack[top + 1] = b
        stack[top + 2] = tag
        top += 3
    }

    @inline(__always) private func push(_ a: Int, _ b: Int, _ c: Int, _ tag: Int) {
        if top + 4 > stackCapacity { grow(top + 4) }
        stack[top] = a
        stack[top + 1] = b
        stack[top + 2] = c
        stack[top + 3] = tag
        top += 4
    }

    /// Writes a slot, recording the old value for backtracking; a write that changes nothing records nothing.
    @inline(__always) private func set(_ slot: Int, _ value: Int) {
        let old = slots[slot]
        if old == value { return }
        push(slot, old, T_UNDO)
        slots[slot] = value
    }

    @inline(__always) private func entrySize(_ tag: Int) -> Int { tag >= T_GREEDY ? 4 : 3 }

    /// Drops the entries above `floor`, undoing their writes.
    private func unwind(_ floor: Int) {
        while top > floor {
            let tag = stack[top - 1]
            if tag == T_UNDO { slots[stack[top - 3]] = stack[top - 2] }
            top -= entrySize(tag)
        }
    }

    /// Drops the choice points above `floor` and keeps the undo records, in order: a lookaround's body is atomic.
    private func keepUndos(_ floor: Int) {
        kept.removeAll(keepingCapacity: true)
        var t = top
        while t > floor {
            let tag = stack[t - 1]
            if tag == T_UNDO {
                kept.append(stack[t - 3])
                kept.append(stack[t - 2])
            }
            t -= entrySize(tag)
        }
        top = floor
        var i = kept.count - 2
        while i >= 0 {
            push(kept[i], kept[i + 1], T_UNDO)
            i -= 2
        }
    }

    /// Runs from `startPc` at `startPos`: the position at SUCCEED, or -1 once backtracking has emptied the stack to `floor`.
    private func run(_ startPc: Int, _ startPos: Int, _ floor: Int) -> Int {
        let p = program!
        let code = p.code
        let s = input
        let n = s.count
        let unicode = p.unicode
        var pc = startPc
        var pos = startPos
        while true {
            var ok = false
            let op = code[pc]
            switch op {
            case OP_CHAR:
                let c = code[pc + 1]
                if code[pc + 2] != 0 {
                    if pos < n && Int(s[pos]) == c && (!unicode || c < 0xD800 || c > 0xDFFF) {
                        pos += 1
                        pc += 3
                        ok = true
                    } else if pos < n && unicode && !splitsPair(s, pos) {
                        let e = endAfter(s, pos, true)
                        if pointIn(s, pos, e) == c { pos = e; pc += 3; ok = true }
                    }
                } else if pos > 0 && !(unicode && splitsPair(s, pos)) {
                    let b = startBefore(s, pos, unicode)
                    if pointIn(s, b, pos) == c { pos = b; pc += 3; ok = true }
                }
            case OP_CLASS:
                let cls = p.classes[code[pc + 1]]
                if unicode && splitsPair(s, pos) {
                } else if code[pc + 2] != 0 {
                    if pos < n {
                        let e = endAfter(s, pos, unicode)
                        if cls.has(pointIn(s, pos, e)) { pos = e; pc += 3; ok = true }
                    }
                } else if pos > 0 {
                    let b = startBefore(s, pos, unicode)
                    if cls.has(pointIn(s, b, pos)) { pos = b; pc += 3; ok = true }
                }
            case OP_LITERAL:
                let text = p.literals[code[pc + 1]]
                if pos + text.count <= n {
                    var k = 0
                    while k < text.count && s[pos + k] == text[k] { k += 1 }
                    if k == text.count { pos += k; pc += 2; ok = true }
                }
            case OP_ASSERT:
                let multiline = code[pc + 2] != 0
                let extras = code[pc + 3] != 0
                switch code[pc + 1] {
                case ASSERT_START: ok = pos == 0 || (multiline && isLineTerminator(Int(s[pos - 1])))
                case ASSERT_END: ok = pos == n || (multiline && isLineTerminator(Int(s[pos])))
                case ASSERT_BOUNDARY: ok = isWordAt(s, pos - 1, extras) != isWordAt(s, pos, extras)
                default: ok = isWordAt(s, pos - 1, extras) == isWordAt(s, pos, extras)
                }
                if ok { pc += 4 }
            case OP_SPLIT:
                push(code[pc + 2], pos, T_CHOICE)
                pc = code[pc + 1]
                ok = true
            case OP_JUMP:
                pc = code[pc + 1]
                ok = true
            case OP_GROUP_OPEN:
                set(code[pc + 1], pos)
                pc += 2
                ok = true
            case OP_GROUP_CLOSE:
                let g = code[pc + 1]
                let opened = slots[2 * (p.groupCount + 1) + g]
                if code[pc + 2] != 0 { set(2 * g, opened); set(2 * g + 1, pos) } else { set(2 * g, pos); set(2 * g + 1, opened) }
                pc += 3
                ok = true
            case OP_LOOP_INIT:
                set(code[pc + 1], 0)
                pc += 2
                ok = true
            case OP_LOOP_HEAD:
                // RepeatMatcher with min and max less the iterations done: past max, only the continuation;
                // past min, the body and the continuation in the quantifier's order.
                let count = slots[code[pc + 1]]
                if count >= code[pc + 3] { pc = code[pc + 5] }
                else if count >= code[pc + 2] {
                    if code[pc + 4] != 0 {
                        push(code[pc + 5], pos, T_CHOICE)
                        pc += 6
                    } else {
                        push(pc + 6, pos, T_CHOICE)
                        pc = code[pc + 5]
                    }
                } else { pc += 6 }
                ok = true
            case OP_LOOP_BODY:
                set(code[pc + 1] + 1, pos)
                var slot = code[pc + 2]
                while slot < code[pc + 3] { set(slot, -1); slot += 1 }
                pc += 4
                ok = true
            case OP_LOOP_TAIL:
                let register = code[pc + 1]
                let count = slots[register]
                // An iteration past the minimum that matched empty fails.
                if !(count >= code[pc + 3] && pos == slots[register + 1]) {
                    set(register, count + 1)
                    pc = code[pc + 2]
                    ok = true
                }
            case OP_REPEAT:
                let cls = p.classes[code[pc + 1]]
                let min = code[pc + 2]
                let max = code[pc + 3]
                let forward = code[pc + 5] != 0
                if unicode && splitsPair(s, pos) {
                    if min == 0 { pc += 6; ok = true }
                } else if code[pc + 4] != 0 {
                    var at = pos
                    var count = 0
                    var least = min == 0 ? pos : -1
                    while count < max {
                        if forward {
                            if at >= n { break }
                            let e = endAfter(s, at, unicode)
                            if !cls.has(pointIn(s, at, e)) { break }
                            at = e
                        } else {
                            if at <= 0 { break }
                            let b = startBefore(s, at, unicode)
                            if !cls.has(pointIn(s, b, at)) { break }
                            at = b
                        }
                        count += 1
                        if count == min { least = at }
                    }
                    if count >= min {
                        if count > min && p.followers[pc] != POSSESSIVE { push(pc, least, at, T_GREEDY) }
                        pos = at
                        pc += 6
                        ok = true
                    }
                } else {
                    var at = pos
                    var count = 0
                    while count < min {
                        at = step(cls, s, at, forward, unicode)
                        if at < 0 { break }
                        count += 1
                    }
                    if at >= 0 {
                        if max > min { push(pc, at, min, T_LAZY) }
                        pos = at
                        pc += 6
                        ok = true
                    }
                }
            case OP_BACKREF:
                let next = backReference(p.references[code[pc + 1]], code[pc + 2] != 0, code[pc + 3] != 0, s, pos, unicode)
                if next >= 0 { pos = next; pc += 4; ok = true }
            case OP_LOOK:
                let mark = top
                let found = run(pc + 3, pos, mark) >= 0
                if code[pc + 1] != 0 {
                    if found { unwind(mark) } else { pc = code[pc + 2]; ok = true }
                } else if found {
                    keepUndos(mark)
                    pc = code[pc + 2]
                    ok = true
                }
            default: return pos
            }
            if ok { continue }
            backtrack: while true {
                if top <= floor { return -1 }
                switch stack[top - 1] {
                case T_CHOICE:
                    pc = stack[top - 3]
                    pos = stack[top - 2]
                    top -= 3
                    break backtrack
                case T_UNDO:
                    slots[stack[top - 3]] = stack[top - 2]
                    top -= 3
                case T_GREEDY:
                    let op = stack[top - 4]
                    let least = stack[top - 3]
                    let at = stack[top - 2]
                    // One character back, as the run read it: a pair straddling where it started is not one.
                    let follower = p.followers[op]
                    let next: Int
                    if follower >= 0 {
                        let unit = UInt16(follower)
                        var found = at - 1
                        while found >= least && s[found] != unit { found -= 1 }
                        if found < least {
                            top -= 4
                            continue backtrack
                        }
                        next = found
                    } else if code[op + 5] != 0 {
                        next = unicode && at - 2 >= least && isTrailUnit(s[at - 1]) && isLeadUnit(s[at - 2]) ? at - 2 : at - 1
                    } else {
                        next = unicode && at + 2 <= least && isLeadUnit(s[at]) && isTrailUnit(s[at + 1]) ? at + 2 : at + 1
                    }
                    if next == least { top -= 4 } else { stack[top - 2] = next }
                    pc = op + 6
                    pos = next
                    break backtrack
                default:
                    let op = stack[top - 4]
                    let count = stack[top - 2]
                    let next = step(p.classes[code[op + 1]], s, stack[top - 3], code[op + 5] != 0, unicode)
                    if next < 0 {
                        top -= 4
                        continue backtrack
                    }
                    if count + 1 >= code[op + 3] { top -= 4 } else {
                        stack[top - 3] = next
                        stack[top - 2] = count + 1
                    }
                    pc = op + 6
                    pos = next
                    break backtrack
                }
            }
        }
    }

    /// One character of `cls` at `x`, read forward or backward: where it ends, or -1.
    @inline(__always) private func step(_ cls: CharClass, _ s: UnsafeBufferPointer<UInt16>, _ x: Int, _ forward: Bool, _ unicode: Bool) -> Int {
        if unicode && splitsPair(s, x) { return -1 }
        if forward {
            if x >= s.count { return -1 }
            let e = endAfter(s, x, unicode)
            return cls.has(pointIn(s, x, e)) ? e : -1
        }
        if x <= 0 { return -1 }
        let b = startBefore(s, x, unicode)
        return cls.has(pointIn(s, b, x)) ? b : -1
    }

    /// The text the first of `groups` that took part captured, matched at `x`: where it ends, or -1; an unset group matches empty.
    private func backReference(_ groups: [Int], _ ignoreCase: Bool, _ forward: Bool, _ s: UnsafeBufferPointer<UInt16>, _ x: Int, _ unicode: Bool) -> Int {
        var start = -1, end = -1
        for g in groups where slots[2 * g] >= 0 { start = slots[2 * g]; end = slots[2 * g + 1]; break }
        if start < 0 { return x }
        let length = end - start
        let from = forward ? x : x - length
        if from < 0 || from + length > s.count { return -1 }
        if !ignoreCase {
            for i in 0..<length where s[start + i] != s[from + i] { return -1 }
        } else {
            func point(_ i: Int) -> Int {
                unicode && isLeadUnit(s[i]) && i + 1 < s.count && isTrailUnit(s[i + 1]) ? pointIn(s, i, i + 2) : Int(s[i])
            }
            var i = 0
            while i < length {
                let a = point(start + i), b = point(from + i)
                if CaseFolding.canonicalize(a, unicode) != CaseFolding.canonicalize(b, unicode) { return -1 }
                if charCount(a) != charCount(b) { return -1 }
                i += charCount(a)
            }
        }
        return forward ? x + length : from
    }
}
