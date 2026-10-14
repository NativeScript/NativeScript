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
