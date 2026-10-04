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

/// `s.includes(sub)`: true for an empty `sub`, as JavaScript has it.
public func jsIncludes(_ s: String, _ sub: String) -> Bool { sub.isEmpty || s.contains(sub) }

/// `s.indexOf(sub)` in UTF-16 units, or -1.
public func jsIndexOf(_ s: String, _ sub: String) -> Double {
    guard let r = s.range(of: sub) else { return sub.isEmpty ? 0 : -1 }
    return Double(s.utf16.distance(from: s.startIndex, to: r.lowerBound))
}

/// JavaScript truthiness for the values translated code tests.
public func jsTruthy(_ value: Any?) -> Bool {
    switch value {
    case nil: return false
    case let b as Bool: return b
    case let d as Double: return d != 0 && !d.isNaN
    case let i as Int: return i != 0
    case let s as String: return !s.isEmpty
    default: return true
    }
}

/// `a.slice(start, end)`: negative indexes count from the end; out-of-range clamps.
public func jsSlice<T>(_ a: [T], _ start: Double = 0, _ end: Double? = nil) -> [T] {
    let (lo, hi) = jsRange(a.count, start, end)
    return lo < hi ? Array(a[lo..<hi]) : []
}

/// `s.slice(start, end)` in UTF-16 units, as JavaScript indexes strings.
public func jsSlice(_ s: String, _ start: Double = 0, _ end: Double? = nil) -> String {
    let units = Array(s.utf16)
    let (lo, hi) = jsRange(units.count, start, end)
    return lo < hi ? String(decoding: units[lo..<hi], as: UTF16.self) : ""
}

private func jsRange(_ count: Int, _ start: Double, _ end: Double?) -> (Int, Int) {
    func clamp(_ v: Double) -> Int { v < 0 ? max(0, count + Int(v)) : min(count, Int(v)) }
    return (clamp(start), clamp(end ?? Double(count)))
}

public func jsCharAt(_ s: String, _ index: Double) -> String { jsSlice(s, index, index + 1) }

/// `s.replace(a, b)` with a string pattern replaces the first match only.
public func jsReplace(_ s: String, _ pattern: String, _ replacement: String) -> String {
    guard let r = s.range(of: pattern) else { return s }
    return s.replacingCharacters(in: r, with: replacement)
}

public func jsPadStart(_ s: String, _ length: Double, _ fill: String = " ") -> String {
    let missing = Int(length) - s.utf16.count
    guard missing > 0, !fill.isEmpty else { return s }
    return String(String(repeating: fill, count: missing / fill.count + 1).prefix(missing)) + s
}

/// The key of an unkeyed `for` (Solid's `<For>`): the item itself, by reference for objects.
public func jsKey(_ item: Any) -> String {
    if let object = item as AnyObject?, type(of: item) is AnyClass { return "\(ObjectIdentifier(object).hashValue)" }
    return "\(item)"
}
