import Foundation

// What translated code calls for JavaScript operations Swift has no
// expression for: async loops, update expressions, uncaught errors, and the
// String and Math members whose JavaScript behavior differs from Swift's.

/// Runs an async loop's iterations without growing the stack: an iteration
/// that continues synchronously is run by the iteration already running,
/// one that continues from a promise job starts a new run.
public final class JSAsyncLoop {
    private var running = false
    private var pending = false
    private var iteration: ((@escaping () -> Void) -> Void)?

    public init() {}

    public func run(_ body: @escaping (@escaping () -> Void) -> Void) {
        iteration = body
        step()
    }

    private func step() {
        if running { pending = true; return }
        running = true
        repeat {
            pending = false
            iteration?({ self.step() })
        } while pending
        running = false
    }
}

/// Runs `body`; an error it throws is reported as uncaught, as a JavaScript
/// host reports an exception escaping a callback.
public func jsReport(_ body: () throws -> Void) {
    do { try body() } catch { jsReportUncaught(jsCaught(error)) }
}

nonisolated(unsafe) public var jsUncaughtHandler: (Any?) -> Void = { value in
    jsError("Uncaught", value)
}

public func jsReportUncaught(_ value: Any?) { jsUncaughtHandler(value) }

/// `Object.is` for a signal's writes: objects by identity.
public func jsSame<T: AnyObject>(_ a: T, _ b: T) -> Bool { a === b }
public func jsSame<T: AnyObject>(_ a: T?, _ b: T?) -> Bool { a === b }
public func jsSame(_ a: Any?, _ b: Any?) -> Bool { jsSameValue(a, b) }

@discardableResult public func jsPostIncrement(_ x: inout Double) -> Double { let old = x; x += 1; return old }
@discardableResult public func jsPostDecrement(_ x: inout Double) -> Double { let old = x; x -= 1; return old }
@discardableResult public func jsPreIncrement(_ x: inout Double) -> Double { x += 1; return x }
@discardableResult public func jsPreDecrement(_ x: inout Double) -> Double { x -= 1; return x }

/// `a ?? b` for an untyped value: null and undefined both give way.
public func jsNullishCoalesce(_ a: Any?, _ b: @autoclosure () throws -> Any?) rethrows -> Any? {
    jsIsNullish(a) ? try b() : a
}

/// An untyped value read as an array whose elements convert with `element`.
public func jsArrayOf<T>(_ value: Any?, _ element: (Any?) -> T) -> JSArray<T> {
    // An array of the type already is the same array: what is written through either is in both.
    if let same = jsFlat(value) as? JSArray<T> { return same }
    guard let array = value as? JSArrayProtocol else { return JSArray<T>() }
    return JSArray(array.jsAnyElements.map(element))
}

/// `jsArrayOf` for code that may hold undefined where it declares an array (a cache miss,
/// `cache[key]`): undefined and null stay nil, as script's value stays undefined.
public func jsArrayOrNil<T>(_ value: Any?, _ element: (Any?) -> T) -> JSArray<T>! {
    jsIsNullish(value) ? nil : jsArrayOf(value, element)
}

/// `jsArrayOf`, `jsArrayOrNil` and `jsRecordOf` with the result's type named. Left to inference, the element type
/// would be an optional of the right one (from a write through the result, `jsRecordOf(values) { $0 }[key] = value`,
/// or an implicitly unwrapped element conversion), and the result a converted copy instead of the array itself.
public func jsArrayOf<T>(_ value: Any?, as type: JSArray<T>.Type, _ element: (Any?) -> T) -> JSArray<T> { jsArrayOf(value, element) }
public func jsArrayOrNil<T>(_ value: Any?, as type: JSArray<T>.Type, _ element: (Any?) -> T) -> JSArray<T>! { jsArrayOrNil(value, element) }
public func jsRecordOf<T>(_ value: Any?, as type: JSRecord<T>.Type, _ element: (Any?) -> T) -> JSRecord<T> { jsRecordOf(value, element) }

/// A member of an untyped object, or undefined; reading a typed object from JSON never throws.
public func jsField(_ object: Any?, _ key: String) -> Any? {
    (try? jsGet(object, key)) ?? nil
}

/// `Object.keys` for what translated code holds: a typed object, an untyped one, a dictionary.
public func jsKeysOf(_ value: Any?) -> [String] {
    if let string = jsFlat(value) as? String { return (0..<string.utf16.count).map { String($0) } }
    if let dynamic = value as? JSDynamic { return dynamic.jsKeys }
    if let dictionary = value as? [String: Any] { return Array(dictionary.keys).sorted() }
    if let array = value as? JSArrayProtocol { return array.jsAnyElements.indices.map(String.init) }
    return []
}

/// `key in object`.
public func jsHasKey(_ object: Any?, _ key: String) -> Bool {
    if let plain = jsFlat(object) as? JSObject { return plain.has(key) }
    // A class object passes a cast to a protocol its instances take; its keys are a function's own and its statics.
    if let v = jsFlat(object), jsIsClassObject(v) {
        if key == "name" || key == "length" || key == "prototype" { return true }
        if let cls = v as? JSStaticKeyed.Type { return cls.jsStaticKeys.contains(key) }
        return (v as? AnyClass).map { JSPrototypes.staticMember($0, key) != nil } ?? false
    }
    // A typed object's `jsKeys` lists every field anew; a symbol key is never a field's.
    if let expando = jsFlat(object) as? JSExpando { return jsExpandoHas(expando, key) || (!jsIsSymbolKey(key) && expando.jsKeys.contains(key)) }
    if jsIsSymbolKey(key) { return (jsFlat(object) as? JSSymbolKeyed)?.jsSymbolKeys.contains(key) ?? false }
    if let dynamic = object as? JSDynamic {
        if dynamic.jsKeys.contains(key) { return true }
        // Accessors are the prototype's, as `in` finds them in JavaScript.
        return JSPrototypes.holder(type(of: dynamic) as AnyClass, key) != nil
    }
    if let array = object as? JSArrayProtocol { return key == "length" || (Int(key).map { $0 >= 0 && $0 < array.jsAnyElements.count } ?? false) }
    return false
}

// MARK: Strings, in UTF-16 code units as JavaScript indexes them

private func units(_ s: String) -> [UInt16] { jsUnits(s) }
private func string(_ u: ArraySlice<UInt16>) -> String { jsString(utf16: u) }
private func clampIndex(_ v: Double, _ count: Int) -> Int {
    if v.isNaN { return 0 }
    return Int(max(0, min(Double(count), v.rounded(.towardZero))))
}

/// Compares strings by UTF-16 code units, as JavaScript's `<` does: -1, 0 or 1.
public func jsCompare(_ a: String, _ b: String) -> Int { jsCompareUnits(a, b) }

// The searches below run over the strings' UTF-8 bytes in place. A string is valid UTF-16, so a search string
// matches the same text at the same places among either's units; only positions convert, and a position
// inside a surrogate pair is where no search string can start or end.

public func jsStartsWith(_ s: String, _ search: String, _ position: Double? = nil) -> Bool {
    jsWithUTF8(s, search) { text, needle in
        guard let position, position > 0 else { return text.matches(needle, at: 0) }
        let (start, exact) = text.byte(atUnit: clampIndex(position, text.unitCount))
        return exact ? text.matches(needle, at: start) : needle.isEmpty
    }
}

public func jsEndsWith(_ s: String, _ search: String, _ endPosition: Double? = nil) -> Bool {
    jsWithUTF8(s, search) { text, needle in
        guard let endPosition else { return text.matches(needle, at: text.bytes.count - needle.count) }
        let (end, exact) = text.byte(atUnit: clampIndex(endPosition, text.unitCount))
        return exact ? text.matches(needle, at: end - needle.count) : needle.isEmpty
    }
}

public func jsIndexOf(_ s: String, _ search: String, _ position: Double?) -> Double {
    jsWithUTF8(s, search) { text, needle in
        let from = position.map { clampIndex($0, text.unitCount) } ?? 0
        if needle.isEmpty { return Double(from) }
        let start = from == 0 ? 0 : text.byte(atUnit: from).offset
        return text.first(needle, from: start).map { Double(text.units(before: $0)) } ?? -1
    }
}

public func jsLastIndexOf(_ s: String, _ search: String, _ fromIndex: Double? = nil) -> Double {
    jsWithUTF8(s, search) { text, needle in
        let count = text.unitCount
        // A NaN or missing position searches from the end.
        var limit = count
        if let f = fromIndex, !f.isNaN { limit = Int(max(0, min(Double(count), f))) }
        if needle.isEmpty { return Double(limit) }
        let (from, exact) = text.byte(atUnit: limit)
        return text.last(needle, from: exact ? from : from - 4).map { Double(text.units(before: $0)) } ?? -1
    }
}

/// `s.includes(search, position)`.
public func jsIncludes(_ s: String, _ search: String, _ position: Double?) -> Bool {
    jsIndexOf(s, search, position) >= 0
}

/// `s.substring(a, b)`: negative and NaN are 0, and the bounds swap if reversed.
public func jsSubstring(_ s: String, _ start: Double, _ end: Double? = nil) -> String {
    jsUnitSlice(s) { count in
        var a = clampIndex(start, count), b = clampIndex(end ?? Double(count), count)
        if a > b { swap(&a, &b) }
        return a..<b
    }
}

/// `s.substr(start, length)`: a negative start counts from the end.
public func jsSubstr(_ s: String, _ start: Double, _ length: Double? = nil) -> String {
    let u = units(s)
    let a = jsRelativeIndex(start, u.count)
    let n = length.map { Int(max(0, min(jsToIntegerOrInfinity($0), Double(u.count - a)))) } ?? u.count - a
    return string(u[a..<(a + n)])
}

/// `s.split(separator, limit)` with an untyped separator: a regular expression splits as one, any other value by its string.
public func jsSplit(_ s: String, untyped separator: Any?, _ limit: Double? = nil) -> JSArray<String> {
    switch jsFlat(separator) {
    case nil: return jsSplit(s, nil as String?, limit)
    case let re as JSRegExp: return jsSplit(s, re, limit).map { $0 ?? "" }
    default: return jsSplit(s, jsToString(separator), limit)
    }
}

/// `array.join(separator)` with an untyped separator: undefined joins with a comma.
public func jsJoinSeparator(_ separator: Any?) -> String {
    jsFlat(separator) == nil ? "," : jsToString(separator)
}

/// `s.split(separator, limit)` with a string separator.
/// A separator, valid UTF-16 as every Swift string is, matches the same text at the same places among UTF-8
/// bytes as among UTF-16 units: the search runs over the bytes, in place.
public func jsSplit(_ s: String, _ separator: String?, _ limit: Double? = nil) -> JSArray<String> {
    let max = limit.map { Int(jsToUint32Bits($0)) } ?? Int.max
    guard let separator else { return JSArray(max > 0 ? [s] : []) }
    var parts: [String] = []
    if separator.isEmpty {
        for c in units(s).prefix(max) { parts.append(string([c][...])) }
        return JSArray(parts)
    }
    var text = s, needle = separator
    text.withUTF8 { bytes in
        needle.withUTF8 { sep in
            func piece(_ range: Range<Int>) -> String { String(decoding: UnsafeBufferPointer(rebasing: bytes[range]), as: UTF8.self) }
            var start = 0
            while parts.count < max, start + sep.count <= bytes.count,
                  let found = memmem(bytes.baseAddress! + start, bytes.count - start, sep.baseAddress!, sep.count) {
                let at = bytes.baseAddress!.distance(to: found.assumingMemoryBound(to: UInt8.self))
                parts.append(piece(start..<at))
                start = at + sep.count
            }
            if parts.count < max { parts.append(piece(start..<bytes.count)) }
        }
    }
    return JSArray(parts)
}

private func jsToUint32Bits(_ v: Double) -> UInt32 {
    guard v.isFinite else { return 0 }
    return UInt32(truncatingIfNeeded: Int64(v.truncatingRemainder(dividingBy: 4294967296)))
}

/// `s.replaceAll(pattern, replacement)` with a string pattern.
public func jsReplaceAll(_ s: String, _ pattern: String, _ replacement: String) -> String {
    let u = units(s), p = units(pattern)
    var out: [UInt16] = []
    var cursor = 0
    var at = jsUnitsIndex(u, p, from: 0)
    while let i = at {
        out += u[cursor..<i]
        out += jsSubstitution(replacement, matched: pattern, at: i, in: s, captures: [pattern], groups: nil).utf16
        cursor = i + p.count
        at = jsUnitsIndex(u, p, from: i + max(1, p.count))
    }
    out += u[cursor...]
    return string(out[...])
}

public func jsPadEnd(_ s: String, _ length: Double, _ fill: String = " ") throws -> String {
    s + (try jsPadding(s, length, fill))
}

/// V8's longest string, in UTF-16 units: a longer result is a RangeError.
let jsMaxStringLength = 536_870_888.0

/// What `padStart`/`padEnd` add to reach `length` UTF-16 units: `fill` repeated and cut.
func jsPadding(_ s: String, _ length: Double, _ fill: String) throws -> String {
    let target = jsToIntegerOrInfinity(length), have = Double(s.utf16.count)
    guard target > have, !fill.isEmpty else { return "" }
    if target > jsMaxStringLength { throw JSException(value: JSRangeError("Invalid string length")) }
    let missing = Int(target - have), f = fill.utf16.count
    return string(Array(String(repeating: fill, count: missing / f + 1).utf16.prefix(missing))[...])
}

public func jsRepeat(_ s: String, _ count: Double) throws -> String {
    let n = jsToIntegerOrInfinity(count)
    guard n >= 0, n.isFinite else { throw JSException(value: JSRangeError("Invalid count value: \(jsNumberToString(count))")) }
    if s.isEmpty || n == 0 { return "" }
    if Double(s.utf16.count) * n > jsMaxStringLength { throw JSException(value: JSRangeError("Invalid string length")) }
    return String(repeating: s, count: Int(n))
}

public func jsCharCodeAt(_ s: String, _ index: Double) -> Double {
    let i = index.isNaN ? 0 : index.rounded(.towardZero)
    // A string has no more UTF-16 units than UTF-8 bytes.
    guard i >= 0, i < Double(s.utf8.count) else { return .nan }
    var s = s
    return s.withUTF8 { JSUTF8Text(bytes: $0).codeUnit(at: Int(i)).map(Double.init) ?? .nan }
}

public func jsCodePointAt(_ s: String, _ index: Double) -> Double? {
    let k = jsToIntegerOrInfinity(index)
    guard k >= 0, k < Double(s.utf8.count) else { return nil }
    var s = s
    return s.withUTF8 { bytes in
        let text = JSUTF8Text(bytes: bytes)
        let (start, exact) = text.byte(atUnit: Int(k))
        // The second unit of a pair, alone, is that surrogate.
        if !exact { return text.codeUnit(at: Int(k)).map(Double.init) }
        return start < bytes.count ? Double(text.scalar(at: start)) : nil
    }
}

public func jsStringAt(_ s: String, _ index: Double) -> String? {
    let u = units(s)
    var k = jsToIntegerOrInfinity(index)
    if k < 0 { k += Double(u.count) }
    return k >= 0 && k < Double(u.count) ? string([u[Int(k)]][...]) : nil
}

public func jsFromCharCode(_ codes: Double...) -> String {
    string(codes.map { UInt16(truncatingIfNeeded: Int64(jsToUint32Bits($0))) }[...])
}

public func jsFromCodePoint(_ points: Double...) throws -> String {
    var units: [UInt16] = []
    for p in points {
        guard p >= 0, p <= 0x10FFFF, p.rounded(.towardZero) == p else { throw JSException(JSRangeError("Invalid code point \(jsNumberToString(p))")) }
        let v = UInt32(p)
        if v < 0x10000 { units.append(UInt16(v)) } else { units += [UInt16(0xD800 + ((v - 0x10000) >> 10)), UInt16(0xDC00 + ((v - 0x10000) & 0x3FF))] }
    }
    return string(units[...])
}

/// What `for (const c of s)` visits: code points, a surrogate pair together.
public func jsCodePoints(_ s: String) -> [String] {
    s.unicodeScalars.map { String($0) }
}

/// WhiteSpace and LineTerminator, which `trim` removes: every one a single scalar of the Basic Multilingual Plane.
private func jsIsWhitespace(_ c: Unicode.Scalar) -> Bool {
    switch c.value {
    case 0x09...0x0D, 0x20: return true
    case ..<0xA0: return false
    case 0xA0, 0x1680, 0x2000...0x200A, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF: return true
    default: return false
    }
}

public func jsTrimStart(_ s: String) -> String { jsTrimmed(s, start: true, end: false) }
public func jsTrimEnd(_ s: String) -> String { jsTrimmed(s, start: false, end: true) }
public func jsTrim(_ s: String) -> String { jsTrimmed(s, start: true, end: true) }

/// `s` without its leading or trailing whitespace, found by scalars; `s` itself when there is none.
private func jsTrimmed(_ s: String, start: Bool, end: Bool) -> String {
    let scalars = s.unicodeScalars
    var lower = scalars.startIndex, upper = scalars.endIndex
    if start { while lower < upper, jsIsWhitespace(scalars[lower]) { scalars.formIndex(after: &lower) } }
    if end {
        while upper > lower {
            let before = scalars.index(before: upper)
            guard jsIsWhitespace(scalars[before]) else { break }
            upper = before
        }
    }
    return lower == scalars.startIndex && upper == scalars.endIndex ? s : String(scalars[lower..<upper])
}

public func jsLocaleCompare(_ a: String, _ b: String) -> Double {
    switch a.compare(b, options: [], range: nil, locale: Locale.current) {
    case .orderedAscending: return -1
    case .orderedDescending: return 1
    case .orderedSame: return 0
    }
}

// MARK: Math and Number

public func jsMathMax(values: [Double]) -> Double {
    var out = -Double.infinity
    for v in values {
        if v.isNaN { return .nan }
        if v > out || (v == 0 && out == 0 && out.sign == .minus) { out = v }
    }
    return out
}

public func jsMathMin(values: [Double]) -> Double {
    var out = Double.infinity
    for v in values {
        if v.isNaN { return .nan }
        if v < out || (v == 0 && out == 0 && v.sign == .minus) { out = v }
    }
    return out
}

extension JSArray {
    /// `a.push(...items)`.
    @discardableResult public func push(contentsOf items: JSArray<Element>) -> Double {
        for item in items.storage { _ = push(item) }
        return length
    }

    /// `a.unshift(...items)`.
    @discardableResult public func unshift(contentsOf items: JSArray<Element>) -> Double {
        for item in items.storage.reversed() { _ = unshift(item) }
        return length
    }
}

public func jsSign(_ x: Double) -> Double { x.isNaN ? .nan : x > 0 ? 1 : x < 0 ? -1 : x }
public func jsFround(_ x: Double) -> Double { Double(Float(x)) }
public func jsClz32(_ x: Double) -> Double { Double(UInt32(bitPattern: jsToInt32(x)).leadingZeroBitCount) }
public func jsHypot(_ values: Double...) -> Double {
    if values.contains(where: { $0.isInfinite }) { return .infinity }
    if values.contains(where: { $0.isNaN }) { return .nan }
    return values.reduce(0) { $0 + $1 * $1 }.squareRoot()
}

/// `**` and `Math.pow`: 1 ** NaN and (±1) ** ±Infinity are NaN in JavaScript.
public func jsPow(_ base: Double, _ exponent: Double) -> Double {
    if exponent.isNaN { return .nan }
    if abs(base) == 1 && exponent.isInfinite { return .nan }
    return Foundation.pow(base, exponent)
}

/// `Math.max`: NaN wins, +0 beats -0, and no arguments is -Infinity.
public func jsMathMax(_ values: Double...) -> Double {
    var out = -Double.infinity
    for v in values {
        if v.isNaN { return .nan }
        if v > out || (v == 0 && out == 0 && out.sign == .minus) { out = v }
    }
    return out
}

public func jsMathMin(_ values: Double...) -> Double {
    var out = Double.infinity
    for v in values {
        if v.isNaN { return .nan }
        if v < out || (v == 0 && out == 0 && v.sign == .minus) { out = v }
    }
    return out
}

public func jsIsInteger(_ x: Double) -> Bool { x.isFinite && x.rounded(.towardZero) == x }
public func jsIsSafeInteger(_ x: Double) -> Bool { jsIsInteger(x) && abs(x) <= 9007199254740991 }

/// `n.toString(radix)`.
public func jsNumberToString(_ x: Double, radix: Double) throws -> String { try jsNumberToRadixString(x, radix) }

/// An untyped value read as a dictionary-typed object: a record already, or a record of an object's keys.
public func jsRecordOf<T>(_ value: Any?, _ element: (Any?) -> T) -> JSRecord<T> {
    if let record = jsFlat(value) as? JSRecord<T> { return record }
    guard let object = jsFlat(value) as? JSDynamic else { return JSRecord<T>() }
    return JSRecord(object.jsKeys.map { ($0, element(object[jsKey: $0])) })
}

/// The RegExp match, matchAll and search make of a pattern that is not one.
private func regExp(_ pattern: Any?, _ flags: String) throws -> JSRegExp {
    if let re = jsFlat(pattern) as? JSRegExp { return re }
    return try JSRegExp(jsToString(pattern), flags)
}

/// A number's methods read by name from untyped code (`handle.toString()` where `handle` is `any`).
func jsNumberMethod(_ x: Double, _ key: String) -> JSMethod? {
    let optional = { (args: [Any?], i: Int) -> Double? in jsIsNullish(jsArg(args, i)) ? nil : jsToNumber(jsArg(args, i)) }
    switch key {
    case "toString": return { _, a in try optional(a, 0).map { try jsNumberToString(x, radix: $0) } ?? jsNumberToString(x) }
    case "toLocaleString": return { _, _ in jsNumberToString(x) }
    case "valueOf": return { _, _ in x }
    case "toFixed": return { _, a in try jsToFixed(x, optional(a, 0) ?? 0) }
    case "toPrecision": return { _, a in try jsToPrecision(x, optional(a, 0)) }
    case "toExponential": return { _, a in try jsToExponential(x, optional(a, 0)) }
    default: return nil
    }
}

/// A boolean's methods read by name from untyped code.
func jsBooleanMethod(_ b: Bool, _ key: String) -> JSMethod? {
    switch key {
    case "toString", "toLocaleString": return { _, _ in b ? "true" : "false" }
    case "valueOf": return { _, _ in b }
    default: return nil
    }
}

/// A string's methods read by name from untyped code (`value.split('/')` where `value` is `any`): the common ones.
func jsStringMethod(_ s: String, _ key: String) -> JSMethod? {
    let number = { (args: [Any?], i: Int) -> Double? in jsIsNullish(jsArg(args, i)) ? nil : jsToNumber(jsArg(args, i)) }
    switch key {
    case "split":
        return { _, args in
            if let re = jsFlat(jsArg(args, 0)) as? JSRegExp { return jsSplit(s, re, number(args, 1)) }
            return jsSplit(s, jsIsNullish(jsArg(args, 0)) ? nil : jsToString(jsArg(args, 0)), number(args, 1))
        }
    case "slice": return { _, args in jsSlice(s, number(args, 0) ?? 0, number(args, 1)) }
    case "substring": return { _, args in jsSubstring(s, number(args, 0) ?? 0, number(args, 1)) }
    case "includes": return { _, args in jsIncludes(s, jsToString(jsArg(args, 0))) }
    case "startsWith": return { _, args in jsStartsWith(s, jsToString(jsArg(args, 0)), number(args, 1)) }
    case "endsWith": return { _, args in jsEndsWith(s, jsToString(jsArg(args, 0)), number(args, 1)) }
    case "indexOf": return { _, args in jsIndexOf(s, jsToString(jsArg(args, 0)), number(args, 1)) }
    case "trim": return { _, _ in jsTrim(s) }
    case "trimStart": return { _, _ in jsTrimStart(s) }
    case "trimEnd": return { _, _ in jsTrimEnd(s) }
    case "replace", "replaceAll":
        return { _, args in
            let pattern = jsFlat(jsArg(args, 0)), replacement = jsArg(args, 1)
            let all = key == "replaceAll"
            // A function replacement receives the match, its groups, the offset and the input, as String.prototype.replace passes them.
            if let fn = jsFlat(replacement), fn is JSFunction || fn is JSMethod || fn is JSFunctionObject {
                let re = try (pattern as? JSRegExp) ?? JSRegExp(NSRegularExpression.escapedPattern(for: jsToString(pattern)), all ? "g" : "")
                return try jsReplace(s, re) { m in jsToString(try jsCall(fn, spread: m.values.elements.map { $0 as Any? } + [m.index, m.input])) }
            }
            if all, let re = pattern as? JSRegExp { return try jsReplaceAll(s, re, jsToString(replacement)) }
            if all { return jsReplaceAll(s, jsToString(pattern), jsToString(replacement)) }
            return jsReplace(s, untyped: pattern, jsToString(replacement))
        }
    case "match":
        return { _, args in
            return jsMatch(s, try regExp(jsArg(args, 0), "")) as Any?
        }
    case "matchAll": return { _, args in try jsMatchAll(s, regExp(jsArg(args, 0), "g")) }
    case "search": return { _, args in try jsSearch(s, regExp(jsArg(args, 0), "")) }
    case "charAt": return { _, args in jsCharAt(s, number(args, 0) ?? 0) }
    case "charCodeAt": return { _, args in jsCharCodeAt(s, number(args, 0) ?? 0) }
    case "codePointAt": return { _, args in jsCodePointAt(s, number(args, 0) ?? 0) }
    case "at": return { _, args in jsStringAt(s, number(args, 0) ?? 0) }
    case "lastIndexOf": return { _, args in jsLastIndexOf(s, jsToString(jsArg(args, 0)), number(args, 1)) }
    case "padEnd": return { _, args in try jsPadEnd(s, number(args, 0) ?? 0, jsIsNullish(jsArg(args, 1)) ? " " : jsToString(jsArg(args, 1))) }
    case "padStart": return { _, args in try jsPadStart(s, number(args, 0) ?? 0, jsIsNullish(jsArg(args, 1)) ? " " : jsToString(jsArg(args, 1))) }
    case "repeat": return { _, args in try jsRepeat(s, number(args, 0) ?? 0) }
    case "substr": return { _, args in jsSubstr(s, number(args, 0) ?? 0, number(args, 1)) }
    case "concat": return { _, args in s + args.map { jsToString($0) }.joined() }
    case "localeCompare": return { _, args in jsLocaleCompare(s, jsToString(jsArg(args, 0))) }
    case "toLowerCase": return { _, _ in s.lowercased() }
    case "toUpperCase": return { _, _ in s.uppercased() }
    case "toString", "valueOf": return { _, _ in s }
    default: return nil
    }
}

/// `String.fromCharCode.apply(_, codes)`: the codes of an array-like, as numbers.
public func jsFromCharCodeList(_ list: Any?) throws -> String {
    string(try jsListNumbers(list).map { UInt16(truncatingIfNeeded: Int64(jsToUint32Bits($0))) }[...])
}

/// `Math.max.apply(_, xs)`.
public func jsMathMaxList(_ list: Any?) throws -> Double {
    try jsListNumbers(list).reduce(-Double.infinity) { $0.isNaN || $1.isNaN ? .nan : Swift.max($0, $1) }
}

/// `Math.min.apply(_, xs)`.
public func jsMathMinList(_ list: Any?) throws -> Double {
    try jsListNumbers(list).reduce(Double.infinity) { $0.isNaN || $1.isNaN ? .nan : Swift.min($0, $1) }
}

/// The elements of an array-like as numbers, as `apply` spreads them.
func jsListNumbers(_ list: Any?) throws -> [Double] {
    if jsIsNullish(list) { return [] }
    guard let array = jsFlat(list) as? JSArrayProtocol else { throw JSException(JSTypeError("CreateListFromArrayLike called on non-object")) }
    return array.jsAnyElements.map(jsToNumber)
}

/// A class whose static members script names (`'tapEvent' in view.constructor`): its own and its bases'.
public protocol JSStaticKeyed: AnyObject {
    static var jsStaticKeys: [String] { get }
}

/// `value.constructor`: the class of the object.
public func jsConstructor(_ value: Any?) -> Any? {
    guard let object = jsFlat(value) else { return nil }
    return type(of: object) as Any
}
