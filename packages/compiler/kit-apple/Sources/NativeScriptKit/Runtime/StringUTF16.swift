import Foundation

// Strings from UTF-16 code units, the units JavaScript indexes strings by.

/// `units` as a string; a lone surrogate becomes U+FFFD, as `String(decoding:as: UTF16.self)` has it. Transcoded
/// here into the string's UTF-8 storage: the standard library decodes UTF-16 through its unspecialized generic
/// parser, at many times the cost.
func jsString(utf16 units: UnsafeBufferPointer<UInt16>) -> String {
    guard !units.isEmpty else { return "" }
    return String(unsafeUninitializedCapacity: units.count * 3) { utf8 in
        var i = 0
        var o = 0
        while i < units.count {
            let u = UInt32(units[i])
            i += 1
            if u < 0x80 {
                utf8[o] = UInt8(truncatingIfNeeded: u)
                o += 1
            } else if u < 0x800 {
                utf8[o] = UInt8(truncatingIfNeeded: 0xC0 | u >> 6)
                utf8[o + 1] = UInt8(truncatingIfNeeded: 0x80 | u & 0x3F)
                o += 2
            } else if u & 0xFC00 == 0xD800, i < units.count, units[i] & 0xFC00 == 0xDC00 {
                let scalar = 0x10000 + ((u - 0xD800) << 10) + (UInt32(units[i]) - 0xDC00)
                i += 1
                utf8[o] = UInt8(truncatingIfNeeded: 0xF0 | scalar >> 18)
                utf8[o + 1] = UInt8(truncatingIfNeeded: 0x80 | scalar >> 12 & 0x3F)
                utf8[o + 2] = UInt8(truncatingIfNeeded: 0x80 | scalar >> 6 & 0x3F)
                utf8[o + 3] = UInt8(truncatingIfNeeded: 0x80 | scalar & 0x3F)
                o += 4
            } else {
                let scalar = u & 0xF800 == 0xD800 ? 0xFFFD : u
                utf8[o] = UInt8(truncatingIfNeeded: 0xE0 | scalar >> 12)
                utf8[o + 1] = UInt8(truncatingIfNeeded: 0x80 | scalar >> 6 & 0x3F)
                utf8[o + 2] = UInt8(truncatingIfNeeded: 0x80 | scalar & 0x3F)
                o += 3
            }
        }
        return o
    }
}

func jsString<C: Collection>(utf16 units: C) -> String where C.Element == UInt16 {
    if let made = units.withContiguousStorageIfAvailable({ jsString(utf16: $0) }) { return made }
    return Array(units).withUnsafeBufferPointer { jsString(utf16: $0) }
}

/// `a` against `b` in UTF-16 code unit order, JavaScript's order of strings: -1, 0 or 1. Compared as UTF-8
/// bytes, whose order is the code points', which is the units' except where a character above U+FFFF
/// (two surrogates, D800–DFFF) meets one in U+E000–U+FFFF; the first differing bytes tell that case.
func jsCompareUnits(_ a: String, _ b: String) -> Int {
    let compared = a.utf8.withContiguousStorageIfAvailable { x in b.utf8.withContiguousStorageIfAvailable { y in jsCompareUnits(x, y) } }
    if let compared, let compared { return compared }
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

private func jsCompareUnits(_ x: UnsafeBufferPointer<UInt8>, _ y: UnsafeBufferPointer<UInt8>) -> Int {
    let n = min(x.count, y.count)
    var i = 0
    if n > 0, memcmp(x.baseAddress!, y.baseAddress!, n) != 0 {
        while x[i] == y[i] { i += 1 }
        let p = x[i], q = y[i]
        // At a lead byte: 0xF0 and above start a character above U+FFFF, 0xEE and 0xEF one in U+E000–U+FFFF.
        // Past one, the characters share their lead, and so their range.
        if p >= 0xF0 && (q == 0xEE || q == 0xEF) { return -1 }
        if q >= 0xF0 && (p == 0xEE || p == 0xEF) { return 1 }
        return p < q ? -1 : 1
    }
    return x.count == y.count ? 0 : x.count < y.count ? -1 : 1
}

/// `s`'s UTF-16 code units: an ASCII string's are its bytes, widened.
func jsUnits(_ s: String) -> [UInt16] {
    let widened: [UInt16]?? = s.utf8.withContiguousStorageIfAvailable { bytes in
        guard bytes.count == s.utf16.count else { return nil }
        return [UInt16](unsafeUninitializedCapacity: bytes.count) { units, count in
            for i in 0..<bytes.count { units[i] = UInt16(bytes[i]) }
            count = bytes.count
        }
    }
    if let widened, let widened { return widened }
    return Array(s.utf16)
}

/// The string of `s`'s UTF-16 units in the range `bounds` gives for their count: an ASCII string's, whose units
/// are its bytes, sliced in place; any other's through its units.
func jsUnitSlice(_ s: String, _ bounds: (Int) -> Range<Int>) -> String {
    let utf8 = s.utf8
    let count = utf8.count
    if count == s.utf16.count {
        let range = bounds(count)
        guard !range.isEmpty else { return "" }
        let lower = utf8.index(utf8.startIndex, offsetBy: range.lowerBound)
        return String(Substring(utf8[lower..<utf8.index(lower, offsetBy: range.count)]))
    }
    let units = Array(s.utf16)
    let range = bounds(units.count)
    return range.isEmpty ? "" : jsString(utf16: units[range])
}

/// A string's UTF-8 bytes, read in place, with JavaScript's UTF-16 offsets converted to and from byte offsets:
/// what the string methods search rather than the string's units copied out. Eight ASCII bytes, eight units,
/// are counted at a time.
struct JSUTF8Text {
    let bytes: UnsafeBufferPointer<UInt8>

    /// The UTF-16 units in the bytes before `end`, a scalar boundary.
    func units(before end: Int) -> Int {
        var units = 0
        var i = 0
        if let base = bytes.baseAddress {
            while i + 8 <= end, UnsafeRawPointer(base + i).loadUnaligned(as: UInt64.self) & 0x8080_8080_8080_8080 == 0 {
                i += 8
                units += 8
            }
        }
        while i < end {
            let b = bytes[i]
            if b & 0xC0 != 0x80 { units += b >= 0xF0 ? 2 : 1 }
            i += 1
        }
        return units
    }

    var unitCount: Int { units(before: bytes.count) }

    /// The byte offset where UTF-16 unit `unit` starts, or, for the second unit of a surrogate pair, where the next
    /// character does, with `exact` false; the end for any unit at or past it.
    func byte(atUnit unit: Int) -> (offset: Int, exact: Bool) {
        var units = 0
        var i = 0
        if let base = bytes.baseAddress {
            while units + 8 <= unit, i + 8 <= bytes.count, UnsafeRawPointer(base + i).loadUnaligned(as: UInt64.self) & 0x8080_8080_8080_8080 == 0 {
                i += 8
                units += 8
            }
        }
        while i < bytes.count, units < unit {
            let b = bytes[i]
            units += b >= 0xF0 ? 2 : 1
            i += b < 0x80 ? 1 : b < 0xE0 ? 2 : b < 0xF0 ? 3 : 4
        }
        return (i, units <= unit)
    }

    /// The UTF-16 unit at `unit`, nil past the end: an astral character's surrogates are its two.
    func codeUnit(at unit: Int) -> UInt16? {
        guard unit < bytes.count else { return nil }
        let (start, exact) = byte(atUnit: unit)
        if !exact { return 0xDC00 | UInt16(truncatingIfNeeded: scalar(at: start - 4) - 0x10000) & 0x3FF }
        guard start < bytes.count else { return nil }
        let value = scalar(at: start)
        return value < 0x10000 ? UInt16(value) : 0xD800 | UInt16(truncatingIfNeeded: (value - 0x10000) >> 10)
    }

    /// The scalar whose UTF-8 sequence starts at `i`.
    func scalar(at i: Int) -> UInt32 {
        let b = UInt32(bytes[i])
        switch b {
        case ..<0x80: return b
        case ..<0xE0: return (b & 0x1F) << 6 | UInt32(bytes[i + 1] & 0x3F)
        case ..<0xF0: return (b & 0x0F) << 12 | UInt32(bytes[i + 1] & 0x3F) << 6 | UInt32(bytes[i + 2] & 0x3F)
        default: return (b & 0x07) << 18 | UInt32(bytes[i + 1] & 0x3F) << 12 | UInt32(bytes[i + 2] & 0x3F) << 6 | UInt32(bytes[i + 3] & 0x3F)
        }
    }

    /// Where `needle` first occurs at or after byte `from`.
    func first(_ needle: UnsafeBufferPointer<UInt8>, from: Int) -> Int? {
        guard let base = bytes.baseAddress, let pattern = needle.baseAddress, from + needle.count <= bytes.count else { return nil }
        guard let found = memmem(base + from, bytes.count - from, pattern, needle.count) else { return nil }
        return base.distance(to: found.assumingMemoryBound(to: UInt8.self))
    }

    /// Where `needle` last occurs starting at or before byte `from`.
    func last(_ needle: UnsafeBufferPointer<UInt8>, from: Int) -> Int? {
        guard let base = bytes.baseAddress, let pattern = needle.baseAddress else { return nil }
        var i = min(from, bytes.count - needle.count)
        while i >= 0 {
            if base[i] == pattern[0], memcmp(base + i, pattern, needle.count) == 0 { return i }
            i -= 1
        }
        return nil
    }

    func matches(_ needle: UnsafeBufferPointer<UInt8>, at i: Int) -> Bool {
        guard let base = bytes.baseAddress, let pattern = needle.baseAddress else { return needle.isEmpty }
        return i >= 0 && i + needle.count <= bytes.count && memcmp(base + i, pattern, needle.count) == 0
    }
}

/// `body` over the UTF-8 bytes of `s` and of `t`, made contiguous where a bridged string has them elsewhere.
func jsWithUTF8<R>(_ s: String, _ t: String, _ body: (JSUTF8Text, UnsafeBufferPointer<UInt8>) -> R) -> R {
    var s = s, t = t
    return s.withUTF8 { a in t.withUTF8 { b in body(JSUTF8Text(bytes: a), b) } }
}
