import Foundation

/// A JavaScript BigInt: an integer of any size, a primitive compared by value.
public struct JSBigInt: Hashable, Comparable, CustomStringConvertible, ExpressibleByIntegerLiteral {
    var negative: Bool
    var magnitude: JSBigUInt

    init(negative: Bool, magnitude: JSBigUInt) {
        self.magnitude = magnitude
        self.negative = negative && !magnitude.isZero
    }

    public init(_ value: Int) {
        self.init(negative: value < 0, magnitude: JSBigUInt(value.magnitude.asUInt64))
    }

    public init(integerLiteral value: Int) { self.init(value) }

    public static func += (a: inout JSBigInt, b: JSBigInt) { a = a + b }
    public static func -= (a: inout JSBigInt, b: JSBigInt) { a = a - b }
    public static func *= (a: inout JSBigInt, b: JSBigInt) { a = a * b }

    /// A literal's digits (`123`, `0xff`, `0o17`, `0b101`).
    public init(literal text: String) {
        var t = Substring(text.replacingOccurrences(of: "_", with: ""))
        var radix: UInt32 = 10
        if t.count > 2 && t.first == "0" {
            switch t.dropFirst().first {
            case "x", "X": radix = 16; t = t.dropFirst(2)
            case "o", "O": radix = 8; t = t.dropFirst(2)
            case "b", "B": radix = 2; t = t.dropFirst(2)
            default: break
            }
        }
        self = JSBigInt.parse(t, radix: radix) ?? JSBigInt(0)
    }

    static func parse(_ digits: Substring, radix: UInt32) -> JSBigInt? {
        guard !digits.isEmpty else { return nil }
        var m = JSBigUInt(0)
        for c in digits {
            guard let d = c.hexDigitValue, UInt32(d) < radix else { return nil }
            m.multiply(by: radix)
            m.add(UInt32(d))
        }
        return JSBigInt(negative: false, magnitude: m)
    }

    /// `BigInt(value)`.
    public init(convert value: Any?) throws {
        switch jsFlat(value) {
        case let b as JSBigInt: self = b
        case let d as Double: self = try JSBigInt(number: d)
        case let b as Bool: self = JSBigInt(b ? 1 : 0)
        case let s as String:
            let t = jsTrim(s)
            if t.isEmpty { self = JSBigInt(0); return }
            var body = Substring(t)
            var negative = false
            if body.first == "-" || body.first == "+" { negative = body.first == "-"; body = body.dropFirst() }
            var radix: UInt32 = 10
            if !negative && body.count > 2 && body.first == "0", let p = body.dropFirst().first, "xXoObB".contains(p) {
                radix = "xX".contains(p) ? 16 : "oO".contains(p) ? 8 : 2
                body = body.dropFirst(2)
            }
            guard let parsed = JSBigInt.parse(body, radix: radix) else { throw JSException(JSSyntaxError("Cannot convert \(s) to a BigInt")) }
            self = negative ? -parsed : parsed
        case nil: throw JSException(JSTypeError("Cannot convert undefined to a BigInt"))
        case is JSNull: throw JSException(JSTypeError("Cannot convert null to a BigInt"))
        case let v?:
            if let n = jsNumeric(v) { self = try JSBigInt(number: n); return }
            throw JSException(JSSyntaxError("Cannot convert \(jsToString(v)) to a BigInt"))
        }
    }

    /// NumberToBigInt: a RangeError unless the number is an integer.
    public init(number d: Double) throws {
        guard d.isFinite, d == d.rounded(.towardZero) else {
            throw JSException(JSRangeError("The number \(jsNumberToString(d)) cannot be converted to a BigInt because it is not an integer"))
        }
        let a = abs(d)
        if a < 18446744073709551616 { self.init(negative: d < 0, magnitude: JSBigUInt(UInt64(a))); return }
        var m = JSBigUInt(a.significandBitPattern | (1 << 52))
        m.shiftLeft(Int(a.exponent) - 52)
        self.init(negative: d < 0, magnitude: m)
    }

    public var isZero: Bool { magnitude.isZero }

    /// `Number(bigint)`: the nearest double.
    public func toDouble() -> Double { negative ? -magnitude.toDouble() : magnitude.toDouble() }

    public func toString(_ radix: Double = 10) -> String {
        let r = UInt32(radix)
        if r == 10 { return (negative ? "-" : "") + magnitude.decimalString() }
        if magnitude.isZero { return "0" }
        var digits: [Character] = []
        var current = magnitude.limbs
        while !current.isEmpty {
            var remainder: UInt64 = 0
            for i in stride(from: current.count - 1, through: 0, by: -1) {
                let v = (remainder << 32) | UInt64(current[i])
                current[i] = UInt32(v / UInt64(r))
                remainder = v % UInt64(r)
            }
            while let last = current.last, last == 0 { current.removeLast() }
            digits.append(Character(String(remainder, radix: Int(r))))
        }
        return (negative ? "-" : "") + String(digits.reversed())
    }

    public var description: String { toString() }

    // MARK: Arithmetic

    public static prefix func - (a: JSBigInt) -> JSBigInt { JSBigInt(negative: !a.negative, magnitude: a.magnitude) }

    private static func addMagnitudes(_ a: JSBigUInt, _ b: JSBigUInt) -> JSBigUInt {
        var out: [UInt32] = []
        var carry: UInt64 = 0
        for i in 0..<max(a.limbs.count, b.limbs.count) {
            let s = UInt64(i < a.limbs.count ? a.limbs[i] : 0) + UInt64(i < b.limbs.count ? b.limbs[i] : 0) + carry
            out.append(UInt32(truncatingIfNeeded: s))
            carry = s >> 32
        }
        if carry > 0 { out.append(UInt32(carry)) }
        return JSBigUInt(limbs: out)
    }

    public static func + (a: JSBigInt, b: JSBigInt) -> JSBigInt {
        if a.negative == b.negative { return JSBigInt(negative: a.negative, magnitude: addMagnitudes(a.magnitude, b.magnitude)) }
        let c = JSBigUInt.compare(a.magnitude, b.magnitude)
        if c == 0 { return JSBigInt(0) }
        var (big, small) = c > 0 ? (a, b) : (b, a)
        big.magnitude.subtract(small.magnitude)
        return JSBigInt(negative: big.negative, magnitude: big.magnitude)
    }

    public static func - (a: JSBigInt, b: JSBigInt) -> JSBigInt { a + (-b) }

    public static func * (a: JSBigInt, b: JSBigInt) -> JSBigInt {
        if a.isZero || b.isZero { return JSBigInt(0) }
        var out = [UInt32](repeating: 0, count: a.magnitude.limbs.count + b.magnitude.limbs.count)
        for (i, x) in a.magnitude.limbs.enumerated() {
            var carry: UInt64 = 0
            for (j, y) in b.magnitude.limbs.enumerated() {
                let t = UInt64(x) * UInt64(y) + UInt64(out[i + j]) + carry
                out[i + j] = UInt32(truncatingIfNeeded: t)
                carry = t >> 32
            }
            var k = i + b.magnitude.limbs.count
            while carry > 0 {
                let t = UInt64(out[k]) + carry
                out[k] = UInt32(truncatingIfNeeded: t)
                carry = t >> 32
                k += 1
            }
        }
        return JSBigInt(negative: a.negative != b.negative, magnitude: JSBigUInt(limbs: out))
    }

    /// `a / b`: truncated toward zero; a RangeError for a zero divisor.
    public static func divide(_ a: JSBigInt, _ b: JSBigInt) throws -> JSBigInt {
        guard !b.isZero else { throw JSException(JSRangeError("Division by zero")) }
        let (q, _) = JSBigUInt.divMod(a.magnitude, b.magnitude)
        return JSBigInt(negative: a.negative != b.negative, magnitude: q)
    }

    /// `a % b`: the remainder takes the dividend's sign.
    public static func remainder(_ a: JSBigInt, _ b: JSBigInt) throws -> JSBigInt {
        guard !b.isZero else { throw JSException(JSRangeError("Division by zero")) }
        let (_, r) = JSBigUInt.divMod(a.magnitude, b.magnitude)
        return JSBigInt(negative: a.negative, magnitude: r)
    }

    /// `a ** b`: a RangeError for a negative exponent.
    public static func power(_ a: JSBigInt, _ b: JSBigInt) throws -> JSBigInt {
        guard !b.negative else { throw JSException(JSRangeError("Exponent must be positive")) }
        var result = JSBigInt(1), base = a
        var e = b.magnitude
        while !e.isZero {
            if e.bit(0) { result = result * base }
            e = e.shiftedRight(1)
            if !e.isZero { base = base * base }
        }
        return result
    }

    // MARK: Bits, as two's complement of unbounded width

    /// The value's two's complement in `count` limbs.
    private func twos(_ count: Int) -> [UInt32] {
        var out = magnitude.limbs + [UInt32](repeating: 0, count: max(0, count - magnitude.limbs.count))
        guard negative else { return out }
        for i in out.indices { out[i] = ~out[i] }
        var i = 0
        while i < out.count {
            out[i] &+= 1
            if out[i] != 0 { break }
            i += 1
        }
        return out
    }

    private static func fromTwos(_ limbs: [UInt32]) -> JSBigInt {
        guard let top = limbs.last, top & 0x8000_0000 != 0 else { return JSBigInt(negative: false, magnitude: JSBigUInt(limbs: limbs)) }
        var out = limbs.map { ~$0 }
        var i = 0
        while i < out.count {
            out[i] &+= 1
            if out[i] != 0 { break }
            i += 1
        }
        return JSBigInt(negative: true, magnitude: JSBigUInt(limbs: out))
    }

    private static func bitwise(_ a: JSBigInt, _ b: JSBigInt, _ op: (UInt32, UInt32) -> UInt32) -> JSBigInt {
        let n = max(a.magnitude.limbs.count, b.magnitude.limbs.count) + 1
        let x = a.twos(n), y = b.twos(n)
        return fromTwos(zip(x, y).map(op))
    }

    public static func & (a: JSBigInt, b: JSBigInt) -> JSBigInt { bitwise(a, b, &) }
    public static func | (a: JSBigInt, b: JSBigInt) -> JSBigInt { bitwise(a, b, |) }
    public static func ^ (a: JSBigInt, b: JSBigInt) -> JSBigInt { bitwise(a, b, ^) }
    public static prefix func ~ (a: JSBigInt) -> JSBigInt { -a - JSBigInt(1) }

    /// `a << b` (a negative `b` shifts right).
    public static func shiftLeft(_ a: JSBigInt, _ b: JSBigInt) -> JSBigInt {
        let k = Int(b.toDouble())
        if k < 0 { return shiftRight(a, -b) }
        var m = a.magnitude
        m.shiftLeft(k)
        return JSBigInt(negative: a.negative, magnitude: m)
    }

    /// `a >> b`: rounds toward negative infinity.
    public static func shiftRight(_ a: JSBigInt, _ b: JSBigInt) -> JSBigInt {
        let k = Int(b.toDouble())
        if k < 0 { return shiftLeft(a, -b) }
        let q = a.magnitude.shiftedRight(k)
        if !a.negative { return JSBigInt(negative: false, magnitude: q) }
        let exact = (0..<k).allSatisfy { !a.magnitude.bit($0) }
        let floor = JSBigInt(negative: true, magnitude: q)
        return exact ? floor : floor - JSBigInt(1)
    }

    /// `BigInt.asUintN(bits, value)`.
    public static func asUintN(_ bits: Double, _ value: JSBigInt) -> JSBigInt {
        let n = Int(bits)
        let limbs = value.twos(max(value.magnitude.limbs.count, n / 32 + 1) + 1)
        var out = [UInt32](repeating: 0, count: n / 32 + 1)
        for i in 0..<n where (limbs[i / 32] >> UInt32(i % 32)) & 1 == 1 { out[i / 32] |= 1 << UInt32(i % 32) }
        return JSBigInt(negative: false, magnitude: JSBigUInt(limbs: out))
    }

    /// The value modulo 2^64 as a signed integer, as `BigInt64Array` stores it.
    public var int64: Int64 { Int64(bitPattern: uint64) }

    /// The value modulo 2^64, as `BigUint64Array` stores it.
    public var uint64: UInt64 {
        let limbs = Self.asUintN(64, self).magnitude.limbs
        let low = limbs.count > 0 ? UInt64(limbs[0]) : 0, high = limbs.count > 1 ? UInt64(limbs[1]) : 0
        return high << 32 | low
    }

    /// `BigInt.asIntN(bits, value)`.
    public static func asIntN(_ bits: Double, _ value: JSBigInt) -> JSBigInt {
        let n = Int(bits)
        if n == 0 { return JSBigInt(0) }
        let u = asUintN(bits, value)
        guard u.magnitude.bit(n - 1) else { return u }
        var full = JSBigUInt(1)
        full.shiftLeft(n)
        return u - JSBigInt(negative: false, magnitude: full)
    }

    // MARK: Comparison

    public static func == (a: JSBigInt, b: JSBigInt) -> Bool { a.negative == b.negative && JSBigUInt.compare(a.magnitude, b.magnitude) == 0 }
    public func hash(into hasher: inout Hasher) {
        hasher.combine(negative)
        hasher.combine(magnitude.limbs)
    }

    public static func < (a: JSBigInt, b: JSBigInt) -> Bool {
        if a.negative != b.negative { return a.negative }
        let c = JSBigUInt.compare(a.magnitude, b.magnitude)
        return a.negative ? c > 0 : c < 0
    }

    /// A BigInt against a number, as `<` and `==` compare them: exactly, NaN unordered.
    public static func compare(_ a: JSBigInt, _ d: Double) -> Int? {
        if d.isNaN { return nil }
        if d == .infinity { return -1 }
        if d == -.infinity { return 1 }
        let whole = d.rounded(.down)
        let b = try! JSBigInt(number: whole)
        if a < b { return -1 }
        if b < a { return 1 }
        return whole < d ? -1 : 0
    }
}

private extension UInt {
    var asUInt64: UInt64 { UInt64(self) }
}

/// `typeof`, printing and equality see a BigInt as a value of its own.
func jsBigIntLooseEquals(_ a: JSBigInt, _ other: Any) -> Bool {
    switch other {
    case let b as JSBigInt: return a == b
    case let s as String: return (try? JSBigInt(convert: s)).map { $0 == a } ?? false
    case let b as Bool: return a == JSBigInt(b ? 1 : 0)
    default:
        if let n = jsNumeric(other) { return JSBigInt.compare(a, n) == 0 }
        return false
    }
}

@discardableResult public func jsPostIncrement(_ x: inout JSBigInt) -> JSBigInt { let old = x; x += 1; return old }
@discardableResult public func jsPostDecrement(_ x: inout JSBigInt) -> JSBigInt { let old = x; x -= 1; return old }
@discardableResult public func jsPreIncrement(_ x: inout JSBigInt) -> JSBigInt { x += 1; return x }
@discardableResult public func jsPreDecrement(_ x: inout JSBigInt) -> JSBigInt { x -= 1; return x }

/// `bigint.toLocaleString(locales, options)`: its exact digits formatted as a number's are.
public func jsBigIntToLocaleString(_ b: JSBigInt, _ locales: Any? = nil, _ options: Any? = nil) throws -> String {
    let digits = b.magnitude.decimalString().utf8.map { $0 - 48 }
    var d = JSDecimalDigits(0)
    if !b.isZero {
        var trimmed = digits
        while trimmed.last == 0 { trimmed.removeLast() }
        d.digits = trimmed
        d.point = digits.count
    }
    return try JSNumberFormat(locales, options).formatDecimal(d, negative: b.negative)
}
