import Foundation

// MARK: - Number to string

/// `String(n)`: ECMA-262 Number::toString(10) — shortest round-trip digits in JavaScript's layout.
public func jsNumberToString(_ value: Double) -> String {
    if value.isNaN { return "NaN" }
    if value == 0 { return "0" }
    if value.isInfinite { return value < 0 ? "-Infinity" : "Infinity" }
    if value < 0 { return "-" + jsNumberToString(-value) }
    if value < 9_007_199_254_740_992, value.rounded(.towardZero) == value { return String(Int64(value)) }
    let (digits, n) = jsShortestDigits(value)
    let k = digits.count
    if k <= n && n <= 21 {
        return jsDigitString(digits[...]) + String(repeating: "0", count: n - k)
    }
    if 0 < n && n <= 21 {
        return jsDigitString(digits[0..<n]) + "." + jsDigitString(digits[n...])
    }
    if -6 < n && n <= 0 {
        return "0." + String(repeating: "0", count: -n) + jsDigitString(digits[...])
    }
    return jsExponential(digits[...], n - 1)
}

/// `n.toString(radix)` with V8's digits (DoubleToRadixCString), fractions included.
public func jsNumberToRadixString(_ value: Double, _ radix: Double) -> String {
    let r = jsToIntegerOrInfinity(radix)
    guard r >= 2 && r <= 36 else { fatalError("RangeError: toString() radix must be between 2 and 36") }
    let base = Int(r)
    if base == 10 || value.isNaN || value.isInfinite || value == 0 { return jsNumberToString(value) }
    if abs(value) < 9_007_199_254_740_992, value.rounded(.towardZero) == value {
        return String(Int64(value), radix: base)
    }
    let chars = Array("0123456789abcdefghijklmnopqrstuvwxyz".utf8)
    let negative = value < 0
    let magnitude = negative ? -value : value
    var integer = magnitude.rounded(.down)
    var fraction = magnitude - integer
    var delta = max(Double(0).nextUp, 0.5 * (magnitude.nextUp - magnitude))
    var fractionDigits: [UInt8] = []
    let radixD = Double(base)
    if fraction >= delta {
        repeat {
            fraction *= radixD
            delta *= radixD
            let digit = Int(fraction)
            fractionDigits.append(chars[digit])
            fraction -= Double(digit)
            if fraction > 0.5 || (fraction == 0.5 && (digit & 1) != 0) {
                if fraction + delta > 1 {
                    while true {
                        guard let last = fractionDigits.popLast() else {
                            integer += 1
                            break
                        }
                        let d = last > 57 ? Int(last) - 97 + 10 : Int(last) - 48
                        if d + 1 < base {
                            fractionDigits.append(chars[d + 1])
                            break
                        }
                    }
                    break
                }
            }
        } while fraction >= delta
    }
    var integerDigits: [UInt8] = []
    while jsV8Exponent(integer / radixD) > 0 {
        integer /= radixD
        integerDigits.append(48)
    }
    repeat {
        let remainder = integer.truncatingRemainder(dividingBy: radixD)
        integerDigits.append(chars[Int(remainder)])
        integer = (integer - remainder) / radixD
    } while integer > 0
    var out = negative ? "-" : ""
    out += String(decoding: integerDigits.reversed(), as: UTF8.self)
    if !fractionDigits.isEmpty { out += "." + String(decoding: fractionDigits, as: UTF8.self) }
    return out
}

private func jsV8Exponent(_ d: Double) -> Int {
    d == 0 || d.isSubnormal ? -1074 : Int(d.exponent) - 52
}

/// The shortest round-trip decimal digits of a positive finite double, and `n` with value = 0.d₁d₂… × 10ⁿ.
func jsShortestDigits(_ value: Double) -> (digits: [UInt8], n: Int) {
    let text = value.description
    var mantissa = Substring(text)
    var exponent = 0
    if let e = text.firstIndex(where: { $0 == "e" || $0 == "E" }) {
        mantissa = text[..<e]
        exponent = Int(text[text.index(after: e)...]) ?? 0
    }
    var digits: [UInt8] = []
    var point = 0
    var seenPoint = false
    for c in mantissa.utf8 {
        if c == UInt8(ascii: ".") { seenPoint = true; continue }
        digits.append(c - 48)
        if !seenPoint { point += 1 }
    }
    point += exponent
    var lead = 0
    while lead < digits.count - 1 && digits[lead] == 0 { lead += 1 }
    digits.removeFirst(lead)
    point -= lead
    while digits.count > 1 && digits.last == 0 { digits.removeLast() }
    return (digits, point)
}

private func jsDigitString(_ digits: ArraySlice<UInt8>) -> String {
    String(decoding: digits.map { $0 + 48 }, as: UTF8.self)
}

private func jsExponential(_ digits: ArraySlice<UInt8>, _ e: Int) -> String {
    var out = String(digits[digits.startIndex])
    if digits.count > 1 { out += "." + jsDigitString(digits.dropFirst()) }
    return out + "e" + (e >= 0 ? "+" : "-") + String(abs(e))
}

/// ToIntegerOrInfinity: NaN is 0, otherwise truncated toward zero.
public func jsToIntegerOrInfinity(_ value: Double) -> Double {
    value.isNaN ? 0 : value.rounded(.towardZero) + 0
}

/// `n.toFixed(digits)`: the exact binary value rounded half up; |n| ≥ 1e21 prints as `String(n)`.
/// Digits outside 0…100 trap (JavaScript throws a RangeError).
public func jsToFixed(_ value: Double, _ fractionDigits: Double = 0) -> String {
    let f = jsToIntegerOrInfinity(fractionDigits)
    guard f >= 0 && f <= 100 else { fatalError("RangeError: toFixed() digits argument must be between 0 and 100") }
    if !value.isFinite || abs(value) >= 1e21 { return jsNumberToString(value) }
    let digits = Int(f)
    let sign = value < 0 ? "-" : ""
    var m = jsScaledRound(abs(value), digits).decimalString()
    if digits > 0 {
        if m.count <= digits { m = String(repeating: "0", count: digits + 1 - m.count) + m }
        m.insert(".", at: m.index(m.endIndex, offsetBy: -digits))
    }
    return sign + m
}

/// `n.toPrecision(precision)`; nil precision is `String(n)`. Precision outside 1…100 traps.
public func jsToPrecision(_ value: Double, _ precision: Double?) -> String {
    guard let precision else { return jsNumberToString(value) }
    let p = jsToIntegerOrInfinity(precision)
    if !value.isFinite { return jsNumberToString(value) }
    guard p >= 1 && p <= 100 else { fatalError("RangeError: toPrecision() argument must be between 1 and 100") }
    let digitsCount = Int(p)
    let sign = value < 0 ? "-" : ""
    let (digits, e) = jsFixedDigits(abs(value), digitsCount)
    if e < -6 || e >= digitsCount {
        return sign + jsExponential(digits[...], e)
    }
    if e == digitsCount - 1 { return sign + jsDigitString(digits[...]) }
    if e >= 0 { return sign + jsDigitString(digits[0...e]) + "." + jsDigitString(digits[(e + 1)...]) }
    return sign + "0." + String(repeating: "0", count: -(e + 1)) + jsDigitString(digits[...])
}

/// `n.toExponential(digits)`; nil digits uses as many as needed to round-trip. Digits outside 0…100 trap.
public func jsToExponential(_ value: Double, _ fractionDigits: Double? = nil) -> String {
    if !value.isFinite { return jsNumberToString(value) }
    let sign = value < 0 ? "-" : ""
    let magnitude = abs(value)
    guard let fractionDigits else {
        if magnitude == 0 { return sign + "0e+0" }
        let (digits, n) = jsShortestDigits(magnitude)
        return sign + jsExponential(digits[...], n - 1)
    }
    let f = jsToIntegerOrInfinity(fractionDigits)
    guard f >= 0 && f <= 100 else { fatalError("RangeError: toExponential() argument must be between 0 and 100") }
    let (digits, e) = jsFixedDigits(magnitude, Int(f) + 1)
    return sign + jsExponential(digits[...], e)
}

/// Exactly `count` significant digits of `value` ≥ 0 (rounded half up) and the decimal exponent of the first.
private func jsFixedDigits(_ value: Double, _ count: Int) -> ([UInt8], Int) {
    if value == 0 { return ([UInt8](repeating: 0, count: count), 0) }
    var e = Int(log10(value).rounded(.down))
    var lower = JSBigUInt(1)
    lower.multiplyByPowerOf10(count - 1)
    var upper = lower
    upper.multiply(by: 10)
    var n = jsScaledRound(value, count - 1 - e)
    for _ in 0..<4 {
        if JSBigUInt.compare(n, upper) >= 0 {
            e += 1
        } else if JSBigUInt.compare(n, lower) < 0 {
            e -= 1
        } else {
            break
        }
        n = jsScaledRound(value, count - 1 - e)
    }
    return (n.decimalString().utf8.map { $0 - 48 }, e)
}

/// round-half-up(value × 10^shift), computed from the exact binary value of a finite `value` ≥ 0.
func jsScaledRound(_ value: Double, _ shift: Int) -> JSBigUInt {
    let mantissa = value.significandBitPattern | (value.isNormal ? 1 << 52 : 0)
    let exponent = value.isNormal ? Int(value.exponentBitPattern) - 1075 : -1074
    var numerator = JSBigUInt(mantissa)
    if shift >= 0 { numerator.multiplyByPowerOf10(shift) }
    if exponent >= 0 { numerator.shiftLeft(exponent) }
    if shift >= 0 {
        if exponent >= 0 { return numerator }
        let k = -exponent
        var q = numerator.shiftedRight(k)
        if numerator.bit(k - 1) { q.add(1) }
        return q
    }
    var denominator = JSBigUInt(1)
    denominator.multiplyByPowerOf10(-shift)
    if exponent < 0 { denominator.shiftLeft(-exponent) }
    var (q, r) = JSBigUInt.divMod(numerator, denominator)
    r.shiftLeft(1)
    if JSBigUInt.compare(r, denominator) >= 0 { q.add(1) }
    return q
}

/// A small arbitrary-precision unsigned integer for exact decimal conversions.
struct JSBigUInt {
    var limbs: [UInt32]

    init(_ value: UInt64) {
        limbs = [UInt32(truncatingIfNeeded: value), UInt32(truncatingIfNeeded: value >> 32)]
        normalize()
    }

    init(limbs: [UInt32]) {
        self.limbs = limbs
        normalize()
    }

    var isZero: Bool { limbs.isEmpty }

    var bitWidth: Int { isZero ? 0 : (limbs.count - 1) * 32 + (32 - limbs[limbs.count - 1].leadingZeroBitCount) }

    mutating func normalize() {
        while let last = limbs.last, last == 0 { limbs.removeLast() }
    }

    func bit(_ i: Int) -> Bool {
        guard i >= 0 else { return false }
        let limb = i / 32
        return limb < limbs.count && (limbs[limb] >> UInt32(i % 32)) & 1 == 1
    }

    mutating func multiply(by m: UInt32) {
        var carry: UInt64 = 0
        for i in limbs.indices {
            let p = UInt64(limbs[i]) * UInt64(m) + carry
            limbs[i] = UInt32(truncatingIfNeeded: p)
            carry = p >> 32
        }
        if carry > 0 { limbs.append(UInt32(carry)) }
    }

    mutating func multiplyByPowerOf10(_ n: Int) {
        var n = n
        while n >= 9 {
            multiply(by: 1_000_000_000)
            n -= 9
        }
        var m: UInt32 = 1
        for _ in 0..<n { m *= 10 }
        if m > 1 { multiply(by: m) }
    }

    mutating func add(_ v: UInt32) {
        var carry = UInt64(v)
        var i = 0
        while carry > 0 {
            if i == limbs.count { limbs.append(0) }
            let s = UInt64(limbs[i]) + carry
            limbs[i] = UInt32(truncatingIfNeeded: s)
            carry = s >> 32
            i += 1
        }
    }

    mutating func shiftLeft(_ bits: Int) {
        guard !isZero, bits > 0 else { return }
        let bitShift = bits % 32
        if bitShift > 0 {
            var carry: UInt32 = 0
            for i in limbs.indices {
                let v = limbs[i]
                limbs[i] = (v << UInt32(bitShift)) | carry
                carry = v >> UInt32(32 - bitShift)
            }
            if carry > 0 { limbs.append(carry) }
        }
        let limbShift = bits / 32
        if limbShift > 0 { limbs.insert(contentsOf: repeatElement(0, count: limbShift), at: 0) }
    }

    func shiftedRight(_ bits: Int) -> JSBigUInt {
        let limbShift = bits / 32
        guard limbShift < limbs.count else { return JSBigUInt(0) }
        var out = Array(limbs[limbShift...])
        let bitShift = bits % 32
        if bitShift > 0 {
            for i in out.indices {
                let high: UInt32 = i + 1 < out.count ? out[i + 1] << UInt32(32 - bitShift) : 0
                out[i] = (out[i] >> UInt32(bitShift)) | high
            }
        }
        return JSBigUInt(limbs: out)
    }

    static func compare(_ a: JSBigUInt, _ b: JSBigUInt) -> Int {
        if a.limbs.count != b.limbs.count { return a.limbs.count < b.limbs.count ? -1 : 1 }
        for i in stride(from: a.limbs.count - 1, through: 0, by: -1) where a.limbs[i] != b.limbs[i] {
            return a.limbs[i] < b.limbs[i] ? -1 : 1
        }
        return 0
    }

    mutating func subtract(_ b: JSBigUInt) {
        var borrow: Int64 = 0
        for i in limbs.indices {
            var d = Int64(limbs[i]) - borrow - (i < b.limbs.count ? Int64(b.limbs[i]) : 0)
            if d < 0 {
                d += 1 << 32
                borrow = 1
            } else {
                borrow = 0
            }
            limbs[i] = UInt32(d)
        }
        normalize()
    }

    static func divMod(_ a: JSBigUInt, _ b: JSBigUInt) -> (JSBigUInt, JSBigUInt) {
        var q = [UInt32](repeating: 0, count: a.limbs.count)
        var r = JSBigUInt(0)
        for i in stride(from: a.bitWidth - 1, through: 0, by: -1) {
            r.shiftLeft(1)
            if a.bit(i) {
                if r.isZero { r.limbs = [1] } else { r.limbs[0] |= 1 }
            }
            if compare(r, b) >= 0 {
                r.subtract(b)
                q[i / 32] |= 1 << UInt32(i % 32)
            }
        }
        return (JSBigUInt(limbs: q), r)
    }

    func decimalString() -> String {
        if isZero { return "0" }
        var parts: [UInt32] = []
        var current = limbs
        while !current.isEmpty {
            var remainder: UInt64 = 0
            for i in stride(from: current.count - 1, through: 0, by: -1) {
                let v = (remainder << 32) | UInt64(current[i])
                current[i] = UInt32(v / 1_000_000_000)
                remainder = v % 1_000_000_000
            }
            while let last = current.last, last == 0 { current.removeLast() }
            parts.append(UInt32(remainder))
        }
        var out = String(parts[parts.count - 1])
        for part in parts.dropLast().reversed() {
            let s = String(part)
            out += String(repeating: "0", count: 9 - s.count) + s
        }
        return out
    }

    /// The nearest double, ties to even.
    func toDouble() -> Double {
        let width = bitWidth
        if width <= 64 {
            var v: UInt64 = 0
            for (i, limb) in limbs.enumerated() { v |= UInt64(limb) << UInt64(32 * i) }
            return Double(v)
        }
        let shift = width - 64
        let top = shiftedRight(shift)
        var v: UInt64 = 0
        for (i, limb) in top.limbs.enumerated() { v |= UInt64(limb) << UInt64(32 * i) }
        var sticky = false
        for i in 0..<shift where bit(i) {
            sticky = true
            break
        }
        if sticky { v |= 1 }
        return Double(sign: .plus, exponent: shift, significand: Double(v))
    }
}

// MARK: - String to number

/// JavaScript WhiteSpace and LineTerminator code units (what `trim` and `Number()` skip).
public func jsIsWhitespace(_ unit: UInt16) -> Bool {
    switch unit {
    case 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x20, 0xA0, 0x1680, 0x2000...0x200A, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF:
        return true
    default:
        return false
    }
}

private func jsDigitValue(_ unit: UInt16) -> Int {
    switch unit {
    case 0x30...0x39: return Int(unit) - 0x30
    case 0x61...0x7A: return Int(unit) - 0x61 + 10
    case 0x41...0x5A: return Int(unit) - 0x41 + 10
    default: return 99
    }
}

private func jsIsDecimalDigit(_ unit: UInt16) -> Bool { unit >= 0x30 && unit <= 0x39 }

/// End of the longest unsigned StrDecimalLiteral starting at `start` (digits, fraction, exponent, or "Infinity").
private func jsScanDecimal(_ u: [UInt16], _ start: Int) -> Int? {
    let infinity = Array("Infinity".utf16)
    if u.count - start >= 8, Array(u[start..<start + 8]) == infinity { return start + 8 }
    var i = start
    var digits = 0
    while i < u.count, jsIsDecimalDigit(u[i]) { i += 1; digits += 1 }
    if i < u.count, u[i] == 0x2E {
        var j = i + 1
        var fraction = 0
        while j < u.count, jsIsDecimalDigit(u[j]) { j += 1; fraction += 1 }
        if digits + fraction > 0 { i = j; digits += fraction }
    }
    guard digits > 0 else { return nil }
    if i < u.count, u[i] == 0x65 || u[i] == 0x45 {
        var j = i + 1
        if j < u.count, u[j] == 0x2B || u[j] == 0x2D { j += 1 }
        let digitsStart = j
        while j < u.count, jsIsDecimalDigit(u[j]) { j += 1 }
        if j > digitsStart { i = j }
    }
    return i
}

private func jsDecimalValue(_ u: ArraySlice<UInt16>) -> Double {
    let text = String(decoding: u, as: UTF16.self)
    if text.hasSuffix("Infinity") { return text.hasPrefix("-") ? -.infinity : .infinity }
    return Double(text) ?? .nan
}

private func jsParseDigits(_ u: ArraySlice<UInt16>, radix: Int) -> Double {
    var big = JSBigUInt(0)
    for unit in u {
        big.multiply(by: UInt32(radix))
        big.add(UInt32(jsDigitValue(unit)))
    }
    return big.toDouble()
}

/// `Number(string)`: whitespace-trimmed decimal, `0x`/`0o`/`0b` integers, "" is 0, anything else NaN.
public func jsNumberFromString(_ string: String) -> Double {
    let all = Array(string.utf16)
    var start = 0, end = all.count
    while start < end, jsIsWhitespace(all[start]) { start += 1 }
    while end > start, jsIsWhitespace(all[end - 1]) { end -= 1 }
    if start == end { return 0 }
    let u = Array(all[start..<end])
    if u.count > 2, u[0] == 0x30 {
        let radix: Int
        switch u[1] {
        case 0x78, 0x58: radix = 16
        case 0x6F, 0x4F: radix = 8
        case 0x62, 0x42: radix = 2
        default: radix = 0
        }
        if radix != 0 {
            let digits = u[2...]
            guard digits.allSatisfy({ jsDigitValue($0) < radix }) else { return .nan }
            return jsParseDigits(digits, radix: radix)
        }
    }
    var i = 0
    if u[0] == 0x2B || u[0] == 0x2D { i = 1 }
    guard let stop = jsScanDecimal(u, i), stop == u.count else { return .nan }
    return jsDecimalValue(u[...])
}

/// `parseFloat(string)`: the longest decimal prefix after leading whitespace, else NaN.
public func jsParseFloat(_ string: String) -> Double {
    let u = Array(string.utf16)
    var start = 0
    while start < u.count, jsIsWhitespace(u[start]) { start += 1 }
    var i = start
    if i < u.count, u[i] == 0x2B || u[i] == 0x2D { i += 1 }
    guard let stop = jsScanDecimal(u, i) else { return .nan }
    return jsDecimalValue(u[start..<stop])
}

/// `parseInt(string, radix)`, digits accumulated as V8 does: exactly for radix 10 and powers of two,
/// in 32-bit chunks otherwise.
public func jsParseInt(_ string: String, _ radix: Double? = nil) -> Double {
    let all = Array(string.utf16)
    var i = 0
    while i < all.count, jsIsWhitespace(all[i]) { i += 1 }
    var sign = 1.0
    if i < all.count, all[i] == 0x2D || all[i] == 0x2B {
        if all[i] == 0x2D { sign = -1 }
        i += 1
    }
    var r = Int(jsToInt32(radix ?? 0))
    var stripPrefix = true
    if r != 0 {
        if r < 2 || r > 36 { return .nan }
        if r != 16 { stripPrefix = false }
    } else {
        r = 10
    }
    if stripPrefix, i + 1 < all.count, all[i] == 0x30, all[i + 1] == 0x78 || all[i + 1] == 0x58 {
        i += 2
        r = 16
    }
    let start = i
    while i < all.count, jsDigitValue(all[i]) < r { i += 1 }
    guard i > start else { return .nan }
    let digits = all[start..<i]
    if r == 10 { return sign * (Double(String(decoding: digits, as: UTF16.self)) ?? .nan) }
    if r & (r - 1) == 0 { return sign * jsParseDigits(digits, radix: r) }
    var result = 0.0
    var index = digits.startIndex
    let maximumMultiplier = UInt32.max / 36
    while index < digits.endIndex {
        var part: UInt32 = 0
        var multiplier: UInt32 = 1
        while index < digits.endIndex {
            let m = multiplier * UInt32(r)
            if m > maximumMultiplier { break }
            part = part * UInt32(r) + UInt32(jsDigitValue(digits[index]))
            multiplier = m
            index += 1
        }
        // V8's `result * multiplier + part` compiles to a fused multiply-add on arm64.
        result = Double(part).addingProduct(result, Double(multiplier))
    }
    return sign * result
}

// MARK: - Integer operators

/// ToInt32.
@inline(__always)
public func jsToInt32(_ value: Double) -> Int32 {
    if value >= -2_147_483_648 && value <= 2_147_483_647 { return Int32(value) }
    guard value.isFinite else { return 0 }
    var m = value.rounded(.towardZero).truncatingRemainder(dividingBy: 4_294_967_296)
    if m < 0 { m += 4_294_967_296 }
    return Int32(bitPattern: UInt32(m))
}

/// ToUint32.
@inline(__always)
public func jsToUint32(_ value: Double) -> UInt32 { UInt32(bitPattern: jsToInt32(value)) }

/// `a | b`.
public func jsBitOr(_ a: Double, _ b: Double) -> Double { Double(jsToInt32(a) | jsToInt32(b)) }
/// `a & b`.
public func jsBitAnd(_ a: Double, _ b: Double) -> Double { Double(jsToInt32(a) & jsToInt32(b)) }
/// `a ^ b`.
public func jsBitXor(_ a: Double, _ b: Double) -> Double { Double(jsToInt32(a) ^ jsToInt32(b)) }
/// `~a`.
public func jsBitNot(_ a: Double) -> Double { Double(~jsToInt32(a)) }
/// `a << b`.
public func jsShiftLeft(_ a: Double, _ b: Double) -> Double { Double(jsToInt32(a) &<< Int32(jsToUint32(b) & 31)) }
/// `a >> b`.
public func jsShiftRight(_ a: Double, _ b: Double) -> Double { Double(jsToInt32(a) &>> Int32(jsToUint32(b) & 31)) }
/// `a >>> b`.
public func jsShiftRightUnsigned(_ a: Double, _ b: Double) -> Double { Double(jsToUint32(a) >> (jsToUint32(b) & 31)) }

/// `a % b`: the remainder of truncating division, with the dividend's sign.
@inline(__always)
public func jsMod(_ a: Double, _ b: Double) -> Double { a.truncatingRemainder(dividingBy: b) }
