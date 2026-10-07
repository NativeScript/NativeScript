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
    if let cls = jsFlat(object) as? JSStaticKeyed.Type { return cls.jsStaticKeys.contains(key) }
    if let expando = jsFlat(object) as? JSExpando { return expando.jsKeys.contains(key) || jsExpandoHas(expando, key) }
    if jsIsSymbolKey(key) { return (jsFlat(object) as? JSSymbolKeyed)?.jsSymbolKeys.contains(key) ?? false }
    if let dynamic = object as? JSDynamic { return dynamic.jsKeys.contains(key) }
    if let array = object as? JSArrayProtocol { return key == "length" || (Int(key).map { $0 >= 0 && $0 < array.jsAnyElements.count } ?? false) }
    return false
}

// MARK: Strings, in UTF-16 code units as JavaScript indexes them

private func units(_ s: String) -> [UInt16] { Array(s.utf16) }
private func string(_ u: ArraySlice<UInt16>) -> String { String(decoding: u, as: UTF16.self) }
private func clampIndex(_ v: Double, _ count: Int) -> Int {
    if v.isNaN { return 0 }
    return Int(max(0, min(Double(count), v.rounded(.towardZero))))
}

/// Compares strings by UTF-16 code units, as JavaScript's `<` does: -1, 0 or 1.
public func jsCompare(_ a: String, _ b: String) -> Int {
    var x = a.utf16.makeIterator(), y = b.utf16.makeIterator()
    while true {
        switch (x.next(), y.next()) {
        case (nil, nil): return 0
        case (nil, _): return -1
        case (_, nil): return 1
        case let (p?, q?): if p != q { return p < q ? -1 : 1 }
        }
    }
}

public func jsStartsWith(_ s: String, _ search: String, _ position: Double? = nil) -> Bool {
    let u = units(s)
    let start = clampIndex(position ?? 0, u.count)
    return u[start...].starts(with: search.utf16)
}

public func jsEndsWith(_ s: String, _ search: String, _ endPosition: Double? = nil) -> Bool {
    let u = units(s)
    let end = clampIndex(endPosition ?? Double(u.count), u.count)
    let n = search.utf16.count
    return n <= end && u[(end - n)..<end].elementsEqual(search.utf16)
}

public func jsIndexOf(_ s: String, _ search: String, _ position: Double?) -> Double {
    let u = units(s), n = Array(search.utf16)
    var i = clampIndex(position ?? 0, u.count)
    while i + n.count <= u.count {
        if u[i..<(i + n.count)].elementsEqual(n) { return Double(i) }
        i += 1
    }
    return -1
}

public func jsLastIndexOf(_ s: String, _ search: String) -> Double {
    let u = units(s), n = Array(search.utf16)
    var i = u.count - n.count
    while i >= 0 {
        if u[i..<(i + n.count)].elementsEqual(n) { return Double(i) }
        i -= 1
    }
    return -1
}

/// `s.substring(a, b)`: negative and NaN are 0, and the bounds swap if reversed.
public func jsSubstring(_ s: String, _ start: Double, _ end: Double? = nil) -> String {
    let u = units(s)
    var a = clampIndex(start, u.count), b = clampIndex(end ?? Double(u.count), u.count)
    if a > b { swap(&a, &b) }
    return string(u[a..<b])
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
public func jsSplit(_ s: String, _ separator: String?, _ limit: Double? = nil) -> JSArray<String> {
    let max = limit.map { Int(jsToUint32Bits($0)) } ?? Int.max
    guard let separator else { return JSArray(max > 0 ? [s] : []) }
    let u = units(s), sep = Array(separator.utf16)
    var parts: [String] = []
    if sep.isEmpty {
        for c in u.prefix(max) { parts.append(string([c][...])) }
        return JSArray(parts)
    }
    var start = 0, i = 0
    while i + sep.count <= u.count && parts.count < max {
        if u[i..<(i + sep.count)].elementsEqual(sep) {
            parts.append(string(u[start..<i]))
            i += sep.count
            start = i
        } else { i += 1 }
    }
    if parts.count < max { parts.append(string(u[start...])) }
    return JSArray(parts)
}

private func jsToUint32Bits(_ v: Double) -> UInt32 {
    guard v.isFinite else { return 0 }
    return UInt32(truncatingIfNeeded: Int64(v.truncatingRemainder(dividingBy: 4294967296)))
}

/// `s.replaceAll(pattern, replacement)` with a string pattern.
public func jsReplaceAll(_ s: String, _ pattern: String, _ replacement: String) -> String {
    if pattern.isEmpty {
        let u = units(s)
        var out = replacement
        for c in u { out += string([c][...]) + replacement }
        return out
    }
    return jsSplit(s, pattern).join(replacement)
}

public func jsPadEnd(_ s: String, _ length: Double, _ fill: String = " ") -> String {
    let missing = Int(length) - s.utf16.count
    guard missing > 0, !fill.isEmpty else { return s }
    let pad = Array(String(repeating: fill, count: missing / fill.utf16.count + 1).utf16.prefix(missing))
    return s + string(pad[...])
}

public func jsRepeat(_ s: String, _ count: Double) throws -> String {
    guard count >= 0, count.isFinite else { throw JSException(value: JSRangeError("Invalid count value: \(jsNumberToString(count))")) }
    return String(repeating: s, count: Int(count))
}

public func jsCharCodeAt(_ s: String, _ index: Double) -> Double {
    let u = units(s)
    let i = index.isNaN ? 0 : index.rounded(.towardZero)
    return i >= 0 && i < Double(u.count) ? Double(u[Int(i)]) : .nan
}

public func jsCodePointAt(_ s: String, _ index: Double) -> Double? {
    let u = units(s)
    let i = Int(index.isNaN ? 0 : index.rounded(.towardZero))
    guard i >= 0, i < u.count else { return nil }
    let first = u[i]
    if UTF16.isLeadSurrogate(first), i + 1 < u.count, UTF16.isTrailSurrogate(u[i + 1]) {
        return Double((UInt32(first) - 0xD800) * 0x400 + (UInt32(u[i + 1]) - 0xDC00) + 0x10000)
    }
    return Double(first)
}

public func jsStringAt(_ s: String, _ index: Double) -> String? {
    let u = units(s)
    var i = Int(index.isNaN ? 0 : index.rounded(.towardZero))
    if i < 0 { i += u.count }
    return i >= 0 && i < u.count ? string([u[i]][...]) : nil
}

public func jsFromCharCode(_ codes: Double...) -> String {
    string(codes.map { UInt16(truncatingIfNeeded: Int64(jsToUint32Bits($0))) }[...])
}

/// What `for (const c of s)` visits: code points, a surrogate pair together.
public func jsCodePoints(_ s: String) -> [String] {
    s.unicodeScalars.map { String($0) }
}

private let jsWhitespace: Set<UInt16> = [0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF]

public func jsTrimStart(_ s: String) -> String { let u = units(s); return string(u.drop(while: jsWhitespace.contains)) }
public func jsTrimEnd(_ s: String) -> String {
    let u = units(s)
    var end = u.count
    while end > 0 && jsWhitespace.contains(u[end - 1]) { end -= 1 }
    return string(u[..<end])
}
public func jsTrim(_ s: String) -> String { jsTrimEnd(jsTrimStart(s)) }

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
public func jsNumberToString(_ x: Double, radix: Double) -> String { jsNumberToRadixString(x, radix) }

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
            if let fn = jsFlat(replacement), fn is JSFunction || fn is JSMethod {
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
    case "charAt": return { _, args in jsStringAt(s, number(args, 0) ?? 0).flatMap { (number(args, 0) ?? 0) < 0 ? nil : $0 } ?? "" }
    case "charCodeAt": return { _, args in jsCharCodeAt(s, number(args, 0) ?? 0) }
    case "codePointAt": return { _, args in jsCodePointAt(s, number(args, 0) ?? 0) }
    case "at": return { _, args in jsStringAt(s, number(args, 0) ?? 0) }
    case "lastIndexOf": return { _, args in jsLastIndexOf(s, jsToString(jsArg(args, 0))) }
    case "padEnd": return { _, args in jsPadEnd(s, number(args, 0) ?? 0, jsIsNullish(jsArg(args, 1)) ? " " : jsToString(jsArg(args, 1))) }
    case "padStart":
        return { _, args in
            let fill = jsIsNullish(jsArg(args, 1)) ? " " : jsToString(jsArg(args, 1))
            let padded = jsPadEnd("", max(0, (number(args, 0) ?? 0) - Double(s.utf16.count)), fill)
            return padded + s
        }
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
