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
