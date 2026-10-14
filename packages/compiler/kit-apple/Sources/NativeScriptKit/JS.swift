import Foundation

// JavaScript's behavior where Swift's differs, for code translated from TypeScript.

/// A number as JavaScript prints it: `4`, not `4.0`.
public func js(_ value: Double) -> String { jsNumberToString(value) }

public func js(_ value: Int) -> String { String(value) }
public func js(_ value: Bool) -> String { value ? "true" : "false" }
public func js(_ value: String) -> String { value }

/// `Math.round`: halves round toward +∞.
public func jsRound(_ value: Double) -> Double {
    guard value.isFinite else { return value }
    let floor = value.rounded(.down)
    let r = value - floor >= 0.5 ? floor + 1 : floor
    return r == 0 && value.sign == .minus ? -0.0 : r
}

/// `s.includes(sub)`: by code units, as JavaScript compares (Swift's `contains` compares characters).
public func jsIncludes(_ s: String, _ sub: String) -> Bool { jsIncludes(s, sub, nil) }

/// `s.indexOf(sub)` in UTF-16 units, or -1.
public func jsIndexOf(_ s: String, _ sub: String) -> Double { jsIndexOf(s, sub, nil) }

/// JavaScript truthiness for the values translated code tests.
public func jsTruthy(_ value: Any?) -> Bool { jsIsTruthy(value) }

// A typed value's truthiness, chosen over `Any?`'s by overload resolution: no box, and no casts to find its type.
@inlinable public func jsTruthy(_ value: Double) -> Bool { value != 0 && !value.isNaN }
@inlinable public func jsTruthy(_ value: String) -> Bool { !value.isEmpty }
@inlinable public func jsTruthy(_ value: Bool) -> Bool { value }

/// `a.slice(start, end)`: negative indexes count from the end; out-of-range clamps.
public func jsSlice<T>(_ a: [T], _ start: Double = 0, _ end: Double? = nil) -> [T] {
    let (lo, hi) = jsRange(a.count, start, end)
    return lo < hi ? Array(a[lo..<hi]) : []
}

/// `s.slice(start, end)` in UTF-16 units, as JavaScript indexes strings.
public func jsSlice(_ s: String, _ start: Double = 0, _ end: Double? = nil) -> String {
    jsUnitSlice(s) { count in
        let (lo, hi) = jsRange(count, start, end)
        return lo < hi ? lo..<hi : 0..<0
    }
}

private func jsRange(_ count: Int, _ start: Double, _ end: Double?) -> (Int, Int) {
    (jsRelativeIndex(start, count), end.map { jsRelativeIndex($0, count) } ?? count)
}

public func jsCharAt(_ s: String, _ index: Double) -> String {
    let i = jsToIntegerOrInfinity(index)
    return jsUnitSlice(s) { count in i >= 0 && i < Double(count) ? Int(i)..<(Int(i) + 1) : 0..<0 }
}

/// `s[index]`: undefined unless the index is one of the string's.
public func jsCharAtOrUndefined(_ s: String, _ index: Double) -> String? {
    index >= 0 && index < Double(s.utf16.count) && index.rounded(.towardZero) == index ? jsCharAt(s, index) : nil
}

/// `s.replace(a, b)` with a string pattern replaces the first match only, found by UTF-16 units.
public func jsReplace(_ s: String, _ pattern: String, _ replacement: String) -> String {
    let u = jsUnits(s), p = jsUnits(pattern)
    guard let at = jsUnitsIndex(u, p, from: 0) else { return s }
    var out = Array(u[..<at])
    out += jsSubstitution(replacement, matched: pattern, at: at, in: s, captures: [pattern], groups: nil).utf16
    out += u[(at + p.count)...]
    return jsString(utf16: out)
}

/// Where `p` first occurs in `u` at or after `from`.
func jsUnitsIndex(_ u: [UInt16], _ p: [UInt16], from: Int) -> Int? {
    guard let first = p.first else { return from <= u.count ? from : nil }
    var i = from
    while i + p.count <= u.count {
        if u[i] == first && u[i..<(i + p.count)].elementsEqual(p) { return i }
        i += 1
    }
    return nil
}

public func jsPadStart(_ s: String, _ length: Double, _ fill: String = " ") throws -> String {
    try jsPadding(s, length, fill) + s
}

/// The key of an unkeyed `for` (Solid's `<For>`): the item itself, by reference for objects.
public func jsKey(_ item: Any) -> String {
    if let object = item as AnyObject?, type(of: item) is AnyClass { return "\(ObjectIdentifier(object).hashValue)" }
    return "\(item)"
}
