import Foundation

// ECMA-262's URI functions (§19.2.6): UTF-8 percent-encoding over UTF-16 code
// units. A lone surrogate or a malformed escape, where JavaScript throws a
// URIError, leaves the string as it was.

private let unreservedMarks = Set("-_.!~*'()".utf16)
private let reservedAndHash = Set(";/?:@&=+$,#".utf16)

private func isAlphaNumeric(_ u: UInt16) -> Bool { (0x30...0x39).contains(u) || (0x41...0x5A).contains(u) || (0x61...0x7A).contains(u) }

private func encode(_ s: String, keep: (UInt16) -> Bool) -> String {
    let units = Array(s.utf16)
    var out = ""
    var i = 0
    while i < units.count {
        let u = units[i]
        if keep(u) { out.unicodeScalars.append(Unicode.Scalar(u)!); i += 1; continue }
        var scalar: UInt32
        if (0xD800...0xDBFF).contains(u) {
            guard i + 1 < units.count, (0xDC00...0xDFFF).contains(units[i + 1]) else { return s }
            scalar = 0x10000 + ((UInt32(u) - 0xD800) << 10) + (UInt32(units[i + 1]) - 0xDC00)
            i += 2
        } else if (0xDC00...0xDFFF).contains(u) {
            return s
        } else {
            scalar = UInt32(u)
            i += 1
        }
        for byte in String(Unicode.Scalar(scalar)!).utf8 { out += String(format: "%%%02X", byte) }
    }
    return out
}

private func decode(_ s: String, reserved: Set<UInt16>) -> String {
    let units = Array(s.utf16)
    var out: [UInt16] = []
    var i = 0
    func hexByte(_ at: Int) -> UInt8? {
        guard at + 2 < units.count, units[at] == 0x25 else { return nil }
        guard let hi = Int(String(utf16CodeUnits: [units[at + 1]], count: 1), radix: 16), let lo = Int(String(utf16CodeUnits: [units[at + 2]], count: 1), radix: 16) else { return nil }
        return UInt8(hi * 16 + lo)
    }
    while i < units.count {
        guard units[i] == 0x25 else { out.append(units[i]); i += 1; continue }
        guard i + 2 < units.count, let first = hexByte(i) else { return s }
        if first < 0x80 {
            if reserved.contains(UInt16(first)) { out.append(contentsOf: units[i...(i + 2)]) } else { out.append(UInt16(first)) }
            i += 3
            continue
        }
        let count = first >= 0xF0 ? 4 : first >= 0xE0 ? 3 : first >= 0xC0 ? 2 : 0
        guard count > 0 else { return s }
        var bytes = [first]
        for k in 1..<count {
            let at = i + 3 * k
            guard at + 2 < units.count, let b = hexByte(at), b & 0xC0 == 0x80 else { return s }
            bytes.append(b)
        }
        guard let text = String(bytes: bytes, encoding: .utf8) else { return s }
        out.append(contentsOf: text.utf16)
        i += 3 * count
    }
    return String(utf16CodeUnits: out, count: out.count)
}

public func jsEncodeURIComponent(_ s: String) -> String { encode(s) { isAlphaNumeric($0) || unreservedMarks.contains($0) } }

public func jsEncodeURI(_ s: String) -> String { encode(s) { isAlphaNumeric($0) || unreservedMarks.contains($0) || reservedAndHash.contains($0) } }

public func jsDecodeURIComponent(_ s: String) -> String { decode(s, reserved: []) }

public func jsDecodeURI(_ s: String) -> String { decode(s, reserved: reservedAndHash) }

/// Annex B's `unescape(string)`: each `%XX` and `%uXXXX` escape as the UTF-16 code unit it names; anything else as it is.
public func jsUnescape(_ s: String) -> String {
    let units = Array(s.utf16)
    var out: [UInt16] = []
    out.reserveCapacity(units.count)
    let hex = { (from: Int, count: Int) -> UInt16? in
        guard from + count <= units.count else { return nil }
        return UInt16(String(utf16CodeUnits: Array(units[from..<from + count]), count: count), radix: 16)
    }
    var i = 0
    while i < units.count {
        if units[i] == 0x25 {
            if i + 1 < units.count, units[i + 1] == 0x75, let v = hex(i + 2, 4) { out.append(v); i += 6; continue }
            if let v = hex(i + 1, 2) { out.append(v); i += 3; continue }
        }
        out.append(units[i])
        i += 1
    }
    return String(utf16CodeUnits: out, count: out.count)
}
