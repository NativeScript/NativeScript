import Foundation

/// Which typed array a view is.
public enum JSTypedArrayKind: CaseIterable, Sendable {
    case int8, uint8, uint8Clamped, int16, uint16, int32, uint32, float32, float64, bigInt64, bigUint64

    /// The constructor's name (`Float32Array`).
    public var name: String {
        switch self {
        case .int8: return "Int8Array"
        case .uint8: return "Uint8Array"
        case .uint8Clamped: return "Uint8ClampedArray"
        case .int16: return "Int16Array"
        case .uint16: return "Uint16Array"
        case .int32: return "Int32Array"
        case .uint32: return "Uint32Array"
        case .float32: return "Float32Array"
        case .float64: return "Float64Array"
        case .bigInt64: return "BigInt64Array"
        case .bigUint64: return "BigUint64Array"
        }
    }

    /// `BYTES_PER_ELEMENT`.
    public var bytesPerElement: Int {
        switch self {
        case .int8, .uint8, .uint8Clamped: return 1
        case .int16, .uint16: return 2
        case .int32, .uint32, .float32: return 4
        case .float64, .bigInt64, .bigUint64: return 8
        }
    }

    /// Whether its elements are BigInts, which never mix with numbers.
    public var isBigInt: Bool { self == .bigInt64 || self == .bigUint64 }
}

/// An ArrayBuffer, a typed array or a DataView: bytes a native API reads and writes in place.
public protocol JSBufferSource: AnyObject {
    /// The bytes the value covers, at an address that stays put while the value lives.
    var jsBytes: UnsafeMutableRawBufferPointer { get }
    /// Which typed array the value is; nil for an ArrayBuffer or a DataView.
    var jsElementKind: JSTypedArrayKind? { get }
}

extension JSBufferSource {
    public var jsElementKind: JSTypedArrayKind? { nil }
}

/// `ArrayBufferView`: a typed array or a DataView, a window on the bytes of a buffer.
public protocol JSArrayBufferView: JSBufferSource, JSDynamic {
    var buffer: JSArrayBuffer { get }
    var byteOffset: Double { get }
    var byteLength: Double { get }
}

/// Any typed array, whatever its element type, for code that holds it untyped.
public protocol JSTypedArrayProtocol: JSArrayBufferView {
    var jsLength: Int { get }
    /// The elements as JavaScript values: numbers, or BigInts.
    var jsAnyValues: [Any?] { get }
}

/// `ArrayBuffer`: a fixed number of bytes, zeroed when made, at an address that stays put for
/// as long as the buffer lives (native APIs read and write them in place).
public final class JSArrayBuffer: JSDynamic, JSToStringTag, JSBufferSource {
    public let count: Int
    let bytes: UnsafeMutableRawPointer
    /// Set for memory the buffer does not own: called instead of freeing it.
    private let deallocator: (() -> Void)?
    private let owned: Bool

    /// `new ArrayBuffer(length)`.
    public convenience init(_ length: Double = 0) throws {
        guard let n = jsByteCount(length) else { throw JSException(JSRangeError("Invalid array buffer length")) }
        self.init(byteCount: n)
    }

    init(byteCount n: Int) {
        count = n
        bytes = .allocate(byteCount: max(n, 1), alignment: 16)
        bytes.initializeMemory(as: UInt8.self, repeating: 0, count: max(n, 1))
        deallocator = nil
        owned = true
    }

    /// A copy of native bytes (`interop.bufferFromData`).
    public init(data: Data) {
        count = data.count
        bytes = .allocate(byteCount: max(count, 1), alignment: 16)
        data.copyBytes(to: bytes.assumingMemoryBound(to: UInt8.self), count: count)
        deallocator = nil
        owned = true
    }

    /// A buffer over `count` bytes native code owns, read and written in place; `deallocator`
    /// runs when the buffer goes away, and the bytes are never freed by the buffer itself.
    public init(bytesNoCopy: UnsafeMutableRawPointer, count: Int, deallocator: (() -> Void)?) {
        self.count = count
        bytes = bytesNoCopy
        self.deallocator = deallocator
        owned = false
    }

    deinit {
        if owned { bytes.deallocate() } else { deallocator?() }
    }

    public var byteLength: Double { Double(count) }
    public var jsBytes: UnsafeMutableRawBufferPointer { UnsafeMutableRawBufferPointer(start: bytes, count: count) }
    /// The bytes as Foundation holds them, copied.
    public var data: Data { Data(bytes: bytes, count: count) }

    /// `buffer.slice(begin, end)`: a new buffer of a copy of those bytes.
    public func slice(_ begin: Double? = nil, _ end: Double? = nil) -> JSArrayBuffer {
        let (from, to) = jsRelativeRange(begin, end, count)
        let copy = JSArrayBuffer(byteCount: to - from)
        copy.bytes.copyMemory(from: bytes + from, byteCount: to - from)
        return copy
    }

    /// `ArrayBuffer.prototype`, as far as a program reads it: its tag.
    public static let jsPrototype: JSArrayBuffer = JSArrayBuffer(byteCount: 0)

    /// `ArrayBuffer.isView(value)`.
    public static func isView(_ value: Any?) -> Bool { jsFlat(value) is JSArrayBufferView }

    public var jsToStringTag: String { "ArrayBuffer" }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "ArrayBuffer" }
    public subscript(jsKey key: String) -> Any? {
        get { key == "byteLength" ? byteLength : nil }
        set {}
    }
}

// MARK: - Element types

/// A typed array's element type: how a value script writes is stored in the buffer and read back.
public protocol JSTypedArrayElement {
    associatedtype Stored: BitwiseCopyable
    /// `Double`, or `JSBigInt` for the BigInt arrays.
    associatedtype Value
    static var kind: JSTypedArrayKind { get }
    /// The conversion the specification gives the type (ToInt8, ToUint8Clamp, …).
    static func store(_ value: Value) -> Stored
    static func load(_ stored: Stored) -> Value
    /// ToNumber, or ToBigInt.
    static func convert(_ value: Any?) throws -> Value
    /// What writing undefined stores: NaN converted, or nothing for a BigInt array (a TypeError in JavaScript).
    static var undefinedValue: Value? { get }
    static var zero: Value { get }
    /// The default sort order.
    static func less(_ a: Value, _ b: Value) -> Bool
    /// `===`, or SameValueZero (NaN equal to itself).
    static func same(_ a: Value, _ b: Value, zero: Bool) -> Bool
    static func string(_ value: Value) -> String
}

extension JSTypedArrayElement where Value == Double {
    public static func convert(_ value: Any?) -> Double { jsToNumber(value) }
    public static var undefinedValue: Double? { .nan }
    public static var zero: Double { 0 }
    /// Ascending, -0 before +0, NaN last.
    public static func less(_ a: Double, _ b: Double) -> Bool {
        if a.isNaN { return false }
        if b.isNaN || a < b { return true }
        return a == b && a.sign == .minus && b.sign == .plus
    }
    public static func same(_ a: Double, _ b: Double, zero: Bool) -> Bool { a == b || (zero && a.isNaN && b.isNaN) }
    public static func string(_ value: Double) -> String { jsNumberToString(value) }
}

extension JSTypedArrayElement where Value == JSBigInt {
    public static func convert(_ value: Any?) throws -> JSBigInt { try jsToBigIntElement(value) }
    public static var undefinedValue: JSBigInt? { nil }
    public static var zero: JSBigInt { JSBigInt(0) }
    public static func less(_ a: JSBigInt, _ b: JSBigInt) -> Bool { a < b }
    public static func same(_ a: JSBigInt, _ b: JSBigInt, zero: Bool) -> Bool { a == b }
    public static func string(_ value: JSBigInt) -> String { value.toString() }
}

public enum JSInt8Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .int8 }
    @inlinable public static func store(_ value: Double) -> Int8 { Int8(truncatingIfNeeded: jsToInt32(value)) }
    @inlinable public static func load(_ stored: Int8) -> Double { Double(stored) }
}

public enum JSUint8Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .uint8 }
    @inlinable public static func store(_ value: Double) -> UInt8 { UInt8(truncatingIfNeeded: jsToInt32(value)) }
    @inlinable public static func load(_ stored: UInt8) -> Double { Double(stored) }
}

public enum JSUint8ClampedElement: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .uint8Clamped }
    /// ToUint8Clamp: clamped to 0…255, halves rounded to even.
    @inlinable public static func store(_ value: Double) -> UInt8 { value.isNaN ? 0 : UInt8(Swift.min(Swift.max(value, 0), 255).rounded(.toNearestOrEven)) }
    @inlinable public static func load(_ stored: UInt8) -> Double { Double(stored) }
}

public enum JSInt16Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .int16 }
    @inlinable public static func store(_ value: Double) -> Int16 { Int16(truncatingIfNeeded: jsToInt32(value)) }
    @inlinable public static func load(_ stored: Int16) -> Double { Double(stored) }
}

public enum JSUint16Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .uint16 }
    @inlinable public static func store(_ value: Double) -> UInt16 { UInt16(truncatingIfNeeded: jsToInt32(value)) }
    @inlinable public static func load(_ stored: UInt16) -> Double { Double(stored) }
}

public enum JSInt32Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .int32 }
    @inlinable public static func store(_ value: Double) -> Int32 { jsToInt32(value) }
    @inlinable public static func load(_ stored: Int32) -> Double { Double(stored) }
}

public enum JSUint32Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .uint32 }
    @inlinable public static func store(_ value: Double) -> UInt32 { jsToUint32(value) }
    @inlinable public static func load(_ stored: UInt32) -> Double { Double(stored) }
}

public enum JSFloat32Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .float32 }
    @inlinable public static func store(_ value: Double) -> Float { Float(value) }
    @inlinable public static func load(_ stored: Float) -> Double { Double(stored) }
}

public enum JSFloat64Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .float64 }
    @inlinable public static func store(_ value: Double) -> Double { value }
    @inlinable public static func load(_ stored: Double) -> Double { stored }
}

public enum JSBigInt64Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .bigInt64 }
    public static func store(_ value: JSBigInt) -> Int64 { value.int64 }
    public static func load(_ stored: Int64) -> JSBigInt { JSBigInt(Int(stored)) }
}

public enum JSBigUint64Element: JSTypedArrayElement {
    public static var kind: JSTypedArrayKind { .bigUint64 }
    public static func store(_ value: JSBigInt) -> UInt64 { value.uint64 }
    public static func load(_ stored: UInt64) -> JSBigInt { JSBigInt(negative: false, magnitude: JSBigUInt(stored)) }
}

public typealias JSInt8Array = JSTypedArray<JSInt8Element>
public typealias JSUint8Array = JSTypedArray<JSUint8Element>
public typealias JSUint8ClampedArray = JSTypedArray<JSUint8ClampedElement>
public typealias JSInt16Array = JSTypedArray<JSInt16Element>
public typealias JSUint16Array = JSTypedArray<JSUint16Element>
public typealias JSInt32Array = JSTypedArray<JSInt32Element>
public typealias JSUint32Array = JSTypedArray<JSUint32Element>
public typealias JSFloat32Array = JSTypedArray<JSFloat32Element>
public typealias JSFloat64Array = JSTypedArray<JSFloat64Element>
public typealias JSBigInt64Array = JSTypedArray<JSBigInt64Element>
public typealias JSBigUint64Array = JSTypedArray<JSBigUint64Element>

// MARK: - Typed arrays

/// A typed array (`Float32Array`, `BigInt64Array` …): a view of a buffer's bytes as elements of one
/// type. An index out of range reads undefined and is ignored on write; a written value is converted
/// as the element type says.
public final class JSTypedArray<Kind: JSTypedArrayElement>: JSTypedArrayProtocol, JSToStringTag, JSStringConvertible, JSHostObject, JSIterableValue, Sequence {
    public let buffer: JSArrayBuffer
    @usableFromInline let base: UnsafeMutableRawPointer
    @usableFromInline let count: Int
    let offset: Int

    @inlinable static var stride: Int { MemoryLayout<Kind.Stored>.stride }

    init(buffer: JSArrayBuffer, offset: Int, count: Int) {
        self.buffer = buffer
        self.offset = offset
        self.count = count
        base = buffer.bytes + offset
    }

    /// `new Float32Array(length)`.
    public convenience init(length: Double) throws {
        guard let n = jsIndex(length), n <= 4_294_967_295 / Self.stride else { throw JSException(JSRangeError("Invalid typed array length: \(jsNumberToString(length))")) }
        self.init(buffer: JSArrayBuffer(byteCount: n * Self.stride), offset: 0, count: n)
    }

    /// `new Float32Array(buffer, byteOffset, length)`.
    public convenience init(buffer: JSArrayBuffer, _ byteOffset: Double? = nil, _ length: Double? = nil) throws {
        let size = Self.stride
        let name = Kind.kind.name
        guard let start = jsIndex(byteOffset ?? 0) else { throw JSException(JSRangeError("Start offset \(jsNumberToString(jsToIntegerOrInfinity(byteOffset ?? 0))) is outside the bounds of the buffer")) }
        if start % size != 0 { throw JSException(JSRangeError("start offset of \(name) should be a multiple of \(size)")) }
        if let length {
            guard let n = jsIndex(length), start <= buffer.count, n <= (buffer.count - start) / size else { throw JSException(JSRangeError("Invalid typed array length: \(jsNumberToString(length))")) }
            self.init(buffer: buffer, offset: start, count: n)
        } else {
            if buffer.count % size != 0 { throw JSException(JSRangeError("byte length of \(name) should be a multiple of \(size)")) }
            guard start <= buffer.count else { throw JSException(JSRangeError("Start offset \(start) is outside the bounds of the buffer")) }
            self.init(buffer: buffer, offset: start, count: (buffer.count - start) / size)
        }
    }

    /// `new Float32Array(values)` of elements already of the array's type.
    public convenience init(_ values: [Kind.Value]) {
        self.init(buffer: JSArrayBuffer(byteCount: values.count * Self.stride), offset: 0, count: values.count)
        for (k, v) in values.enumerated() { put(v, k) }
    }

    /// `new Float32Array(values)` of an array or other array-like: each value converted.
    public convenience init(_ values: [Any?]) throws {
        self.init(buffer: JSArrayBuffer(byteCount: values.count * Self.stride), offset: 0, count: values.count)
        for (k, v) in values.enumerated() { put(try Kind.convert(v), k) }
    }

    /// `new Float32Array(typedArray)`: its values converted; a TypeError between numbers and BigInts.
    public convenience init<Other>(_ source: JSTypedArray<Other>) throws {
        try jsCheckContentType(Other.kind, Kind.kind)
        self.init(buffer: JSArrayBuffer(byteCount: source.count * Self.stride), offset: 0, count: source.count)
        try copy(from: source, at: 0)
    }

    /// `new Float32Array(x)` of an untyped value: a length, a buffer, a typed array's or an
    /// iterable's or array-like's values.
    public static func from(_ value: Any?) throws -> JSTypedArray {
        switch jsFlat(value) {
        case nil, is JSNull: return try JSTypedArray(length: 0)
        case let buffer as JSArrayBuffer: return try JSTypedArray(buffer: buffer)
        case let typed as JSTypedArrayProtocol:
            try jsCheckContentType(typed.jsElementKind!, Kind.kind)
            return try JSTypedArray(typed.jsAnyValues)
        case let v?:
            if let n = jsNumeric(v) { return try JSTypedArray(length: n) }
            if !jsIsObject(v) && !jsIsTuple(v) { return try JSTypedArray(length: jsToNumber(v)) }
            return try JSTypedArray(jsArrayLikeValues(v))
        }
    }

    /// `Float32Array.of(...items)`.
    public static func of(_ items: Kind.Value...) -> JSTypedArray { JSTypedArray(items) }

    /// `Float32Array.prototype`, as far as a program reads it: an empty array of the type.
    public static var jsPrototype: JSTypedArray {
        let key = ObjectIdentifier(Kind.self)
        if let made = jsTypedArrayPrototypes[key] { return made as! JSTypedArray }
        let made = JSTypedArray([Kind.Value]())
        jsTypedArrayPrototypes[key] = made
        return made
    }

    /// `Float32Array.BYTES_PER_ELEMENT`.
    public static var BYTES_PER_ELEMENT: Double { Double(Kind.kind.bytesPerElement) }
    public var BYTES_PER_ELEMENT: Double { Self.BYTES_PER_ELEMENT }

    @inlinable public var length: Double { Double(count) }
    public var byteLength: Double { Double(count * Self.stride) }
    public var byteOffset: Double { Double(offset) }
    public var jsBytes: UnsafeMutableRawBufferPointer { UnsafeMutableRawBufferPointer(start: base, count: count * Self.stride) }
    public var jsElementKind: JSTypedArrayKind? { Kind.kind }
    /// The viewed bytes as Foundation holds them, copied.
    public var data: Data { Data(bytes: base, count: count * Self.stride) }
    public var jsLength: Int { count }
    public var jsAnyValues: [Any?] { (0..<count).map { value($0) } }

    @inlinable func value(_ k: Int) -> Kind.Value {
        Kind.load(base.loadUnaligned(fromByteOffset: k &* Self.stride, as: Kind.Stored.self))
    }

    @inlinable func put(_ v: Kind.Value, _ k: Int) {
        base.storeBytes(of: Kind.store(v), toByteOffset: k &* Self.stride, as: Kind.Stored.self)
    }

    /// `array[i]`.
    @inlinable public subscript(jsIndex index: Double) -> Kind.Value? {
        get {
            guard let k = Int(exactly: index), k >= 0, k < count else { return nil }
            return value(k)
        }
        set {
            guard let k = Int(exactly: index), k >= 0, k < count, let v = newValue ?? Kind.undefinedValue else { return }
            put(v, k)
        }
    }

    /// `array[i]` as a compound assignment (`+=`, `++`) reads and writes it: undefined reads as NaN
    /// (0 in a BigInt array), and a write out of range is ignored.
    @inlinable public subscript(jsElement index: Double) -> Kind.Value {
        get { self[jsIndex: index] ?? Kind.undefinedValue ?? Kind.zero }
        set { self[jsIndex: index] = newValue }
    }

    /// Writes `source`'s values from element `start`, converted; the source may view the same bytes.
    private func copy<Other>(from source: JSTypedArray<Other>, at start: Int) throws {
        if Other.self == Kind.self {
            (base + start * Self.stride).copyMemory(from: source.base, byteCount: source.count * Self.stride)
            return
        }
        let values = source.jsAnyValues
        for (k, v) in values.enumerated() { put(try Kind.convert(v), start + k) }
    }

    // MARK: Copies and views

    /// `array.set(source, offset)` from another typed array.
    public func set<Other>(_ source: JSTypedArray<Other>, _ offset: Double? = nil) throws {
        let start = try setOffset(offset, source.count)
        try jsCheckContentType(Other.kind, Kind.kind)
        try copy(from: source, at: start)
    }

    /// `array.set(values, offset)` from an array of the element type.
    public func set(_ source: JSArray<Kind.Value>, _ offset: Double? = nil) throws {
        let values = source.elements
        let start = try setOffset(offset, values.count)
        for (k, v) in values.enumerated() { put(v, start + k) }
    }

    /// `array.set(source, offset)` of an untyped source: a typed array, or an array-like's values converted.
    public func set(_ source: Any?, _ offset: Double? = nil) throws {
        if let typed = jsFlat(source) as? JSTypedArrayProtocol {
            let start = try setOffset(offset, typed.jsLength)
            try jsCheckContentType(typed.jsElementKind!, Kind.kind)
            for (k, v) in typed.jsAnyValues.enumerated() { put(try Kind.convert(v), start + k) }
            return
        }
        if jsIsNullish(source) { throw JSException(JSTypeError("Cannot convert undefined or null to object")) }
        let values = jsFlat(source).map { jsIsObject($0) || jsIsTuple($0) || $0 is String ? jsArrayLikeValues($0) : [] } ?? []
        let start = try setOffset(offset, values.count)
        for (k, v) in values.enumerated() { put(try Kind.convert(v), start + k) }
    }

    private func setOffset(_ offset: Double?, _ length: Int) throws -> Int {
        let n = jsToIntegerOrInfinity(offset ?? 0)
        guard n >= 0, n + Double(length) <= Double(count) else { throw JSException(JSRangeError("offset is out of bounds")) }
        return Int(n)
    }

    /// `array.subarray(begin, end)`: a view of the same bytes.
    public func subarray(_ begin: Double? = nil, _ end: Double? = nil) -> JSTypedArray {
        let (from, to) = jsRelativeRange(begin, end, count)
        return JSTypedArray(buffer: buffer, offset: offset + from * Self.stride, count: to - from)
    }

    /// `array.slice(start, end)`: a new array of a copy of those elements.
    public func slice(_ start: Double? = nil, _ end: Double? = nil) -> JSTypedArray {
        let (from, to) = jsRelativeRange(start, end, count)
        let copy = JSTypedArray(buffer: JSArrayBuffer(byteCount: (to - from) * Self.stride), offset: 0, count: to - from)
        copy.base.copyMemory(from: base + from * Self.stride, byteCount: (to - from) * Self.stride)
        return copy
    }

    /// `array.fill(value, start, end)`: in place, returns the array.
    @discardableResult
    public func fill(_ value: Kind.Value, _ start: Double? = nil, _ end: Double? = nil) -> JSTypedArray {
        let (from, to) = jsRelativeRange(start, end, count)
        for k in from..<Swift.max(from, to) { put(value, k) }
        return self
    }

    /// `array.copyWithin(target, start, end)`: in place, returns the array.
    @discardableResult
    public func copyWithin(_ target: Double, _ start: Double? = nil, _ end: Double? = nil) -> JSTypedArray {
        let to = jsRelativeIndex(target, count)
        let (from, last) = jsRelativeRange(start, end, count)
        let n = Swift.min(last - from, count - to)
        if n > 0 { (base + to * Self.stride).copyMemory(from: base + from * Self.stride, byteCount: n * Self.stride) }
        return self
    }

    /// `array.reverse()`: in place, returns the array.
    @discardableResult
    public func reverse() -> JSTypedArray {
        var i = 0, j = count - 1
        while i < j {
            let v = value(i)
            put(value(j), i)
            put(v, j)
            i += 1
            j -= 1
        }
        return self
    }

    /// `array.sort()`: in place, numerically (-0 before +0, NaN last).
    @discardableResult
    public func sort() -> JSTypedArray {
        var values = (0..<count).map(value)
        values.sort(by: Kind.less)
        for (k, v) in values.enumerated() { put(v, k) }
        return self
    }

    /// `array.sort(compare)`: in place and stable; a NaN comparison result counts as 0.
    @discardableResult
    public func sort(_ compare: (Kind.Value, Kind.Value) throws -> Double) rethrows -> JSTypedArray {
        var values = (0..<count).map(value)
        try jsMergeSort(&values) { try compare($0, $1) < 0 }
        for (k, v) in values.enumerated() { put(v, k) }
        return self
    }

    // MARK: Search

    /// `array.at(i)`: negative indexes count from the end; out of range is undefined.
    public func at(_ index: Double) -> Kind.Value? {
        let relative = jsToIntegerOrInfinity(index)
        let k = relative >= 0 ? relative : Double(count) + relative
        return k >= 0 && k < Double(count) ? value(Int(k)) : nil
    }

    /// `array.indexOf(value, fromIndex)` with `===` (NaN is never found).
    public func indexOf(_ search: Kind.Value, _ fromIndex: Double? = nil) -> Double {
        var k = jsRelativeIndex(fromIndex ?? 0, count)
        while k < count {
            if Kind.same(value(k), search, zero: false) { return Double(k) }
            k += 1
        }
        return -1
    }

    /// `array.lastIndexOf(value, fromIndex)` with `===`.
    public func lastIndexOf(_ search: Kind.Value, _ fromIndex: Double? = nil) -> Double {
        guard count > 0 else { return -1 }
        let n = fromIndex.map(jsToIntegerOrInfinity) ?? Double(count - 1)
        if n == -.infinity { return -1 }
        var k = n >= 0 ? Int(Swift.min(n, Double(count - 1))) : Int(Swift.max(Double(count) + n, -1))
        while k >= 0 {
            if Kind.same(value(k), search, zero: false) { return Double(k) }
            k -= 1
        }
        return -1
    }

    /// `array.includes(value, fromIndex)` with SameValueZero (NaN is found).
    public func includes(_ search: Kind.Value, _ fromIndex: Double? = nil) -> Bool {
        var k = jsRelativeIndex(fromIndex ?? 0, count)
        while k < count {
            if Kind.same(value(k), search, zero: true) { return true }
            k += 1
        }
        return false
    }

    /// The first element, from the start or the end, the test accepts; the length is the one at the start.
    private func first(reversed: Bool = false, _ test: (Kind.Value, Int) throws -> Bool) rethrows -> (Int, Kind.Value)? {
        let n = count
        for i in 0..<n {
            let k = reversed ? n - 1 - i : i
            let v = value(k)
            if try test(v, k) { return (k, v) }
        }
        return nil
    }

    public func find<R>(_ p: (Kind.Value) throws -> R) rethrows -> Kind.Value? { try first { v, _ in jsTruth(try p(v)) }?.1 }
    public func find<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Kind.Value? { try first { v, k in jsTruth(try p(v, Double(k))) }?.1 }
    public func find<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Kind.Value? { try first { v, k in jsTruth(try p(v, Double(k), self)) }?.1 }
    public func findIndex<R>(_ p: (Kind.Value) throws -> R) rethrows -> Double { Double(try first { v, _ in jsTruth(try p(v)) }?.0 ?? -1) }
    public func findIndex<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Double { Double(try first { v, k in jsTruth(try p(v, Double(k))) }?.0 ?? -1) }
    public func findIndex<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Double { Double(try first { v, k in jsTruth(try p(v, Double(k), self)) }?.0 ?? -1) }
    public func findLast<R>(_ p: (Kind.Value) throws -> R) rethrows -> Kind.Value? { try first(reversed: true) { v, _ in jsTruth(try p(v)) }?.1 }
    public func findLast<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Kind.Value? { try first(reversed: true) { v, k in jsTruth(try p(v, Double(k))) }?.1 }
    public func findLast<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Kind.Value? { try first(reversed: true) { v, k in jsTruth(try p(v, Double(k), self)) }?.1 }
    public func findLastIndex<R>(_ p: (Kind.Value) throws -> R) rethrows -> Double { Double(try first(reversed: true) { v, _ in jsTruth(try p(v)) }?.0 ?? -1) }
    public func findLastIndex<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Double { Double(try first(reversed: true) { v, k in jsTruth(try p(v, Double(k))) }?.0 ?? -1) }
    public func findLastIndex<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Double { Double(try first(reversed: true) { v, k in jsTruth(try p(v, Double(k), self)) }?.0 ?? -1) }
    public func some<R>(_ p: (Kind.Value) throws -> R) rethrows -> Bool { try first { v, _ in jsTruth(try p(v)) } != nil }
    public func some<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Bool { try first { v, k in jsTruth(try p(v, Double(k))) } != nil }
    public func some<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Bool { try first { v, k in jsTruth(try p(v, Double(k), self)) } != nil }
    public func every<R>(_ p: (Kind.Value) throws -> R) rethrows -> Bool { try first { v, _ in !jsTruth(try p(v)) } == nil }
    public func every<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> Bool { try first { v, k in !jsTruth(try p(v, Double(k))) } == nil }
    public func every<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> Bool { try first { v, k in !jsTruth(try p(v, Double(k), self)) } == nil }

    // MARK: Transforms

    public func forEach(_ body: (Kind.Value) throws -> Void) rethrows { _ = try first { v, _ in try body(v); return false } }
    public func forEach(_ body: (Kind.Value, Double) throws -> Void) rethrows { _ = try first { v, k in try body(v, Double(k)); return false } }
    public func forEach(_ body: (Kind.Value, Double, JSTypedArray) throws -> Void) rethrows { _ = try first { v, k in try body(v, Double(k), self); return false } }

    public func map(_ f: (Kind.Value) throws -> Kind.Value) rethrows -> JSTypedArray { try mapped { v, _ in try f(v) } }
    public func map(_ f: (Kind.Value, Double) throws -> Kind.Value) rethrows -> JSTypedArray { try mapped { v, k in try f(v, Double(k)) } }
    public func map(_ f: (Kind.Value, Double, JSTypedArray) throws -> Kind.Value) rethrows -> JSTypedArray { try mapped { v, k in try f(v, Double(k), self) } }

    private func mapped(_ f: (Kind.Value, Int) throws -> Kind.Value) rethrows -> JSTypedArray {
        let out = JSTypedArray(buffer: JSArrayBuffer(byteCount: count * Self.stride), offset: 0, count: count)
        for k in 0..<count { out.put(try f(value(k), k), k) }
        return out
    }

    public func filter(_ p: (Kind.Value) throws -> Bool) rethrows -> JSTypedArray { try filtered { v, _ in try p(v) } }
    public func filter<R>(_ p: (Kind.Value) throws -> R) rethrows -> JSTypedArray { try filtered { v, _ in jsTruth(try p(v)) } }
    public func filter<R>(_ p: (Kind.Value, Double) throws -> R) rethrows -> JSTypedArray { try filtered { v, k in jsTruth(try p(v, Double(k))) } }
    public func filter<R>(_ p: (Kind.Value, Double, JSTypedArray) throws -> R) rethrows -> JSTypedArray { try filtered { v, k in jsTruth(try p(v, Double(k), self)) } }

    private func filtered(_ test: (Kind.Value, Int) throws -> Bool) rethrows -> JSTypedArray {
        var kept: [Kind.Value] = []
        for k in 0..<count {
            let v = value(k)
            if try test(v, k) { kept.append(v) }
        }
        return JSTypedArray(kept)
    }

    public func reduce<U>(_ next: (U, Kind.Value) throws -> U, _ initial: U) rethrows -> U { try fold(initial, false) { a, v, _ in try next(a, v) } }
    public func reduce<U>(_ next: (U, Kind.Value, Double) throws -> U, _ initial: U) rethrows -> U { try fold(initial, false) { a, v, k in try next(a, v, Double(k)) } }
    public func reduce<U>(_ next: (U, Kind.Value, Double, JSTypedArray) throws -> U, _ initial: U) rethrows -> U { try fold(initial, false) { a, v, k in try next(a, v, Double(k), self) } }
    /// `array.reduce(f)`: the first element is the initial value; an empty array throws a TypeError.
    public func reduce(_ next: (Kind.Value, Kind.Value) throws -> Kind.Value) throws -> Kind.Value { try fold(false) { a, v, _ in try next(a, v) } }
    public func reduce(_ next: (Kind.Value, Kind.Value, Double) throws -> Kind.Value) throws -> Kind.Value { try fold(false) { a, v, k in try next(a, v, Double(k)) } }
    public func reduce(_ next: (Kind.Value, Kind.Value, Double, JSTypedArray) throws -> Kind.Value) throws -> Kind.Value { try fold(false) { a, v, k in try next(a, v, Double(k), self) } }
    public func reduceRight<U>(_ next: (U, Kind.Value) throws -> U, _ initial: U) rethrows -> U { try fold(initial, true) { a, v, _ in try next(a, v) } }
    public func reduceRight<U>(_ next: (U, Kind.Value, Double) throws -> U, _ initial: U) rethrows -> U { try fold(initial, true) { a, v, k in try next(a, v, Double(k)) } }
    public func reduceRight<U>(_ next: (U, Kind.Value, Double, JSTypedArray) throws -> U, _ initial: U) rethrows -> U { try fold(initial, true) { a, v, k in try next(a, v, Double(k), self) } }
    public func reduceRight(_ next: (Kind.Value, Kind.Value) throws -> Kind.Value) throws -> Kind.Value { try fold(true) { a, v, _ in try next(a, v) } }
    public func reduceRight(_ next: (Kind.Value, Kind.Value, Double) throws -> Kind.Value) throws -> Kind.Value { try fold(true) { a, v, k in try next(a, v, Double(k)) } }
    public func reduceRight(_ next: (Kind.Value, Kind.Value, Double, JSTypedArray) throws -> Kind.Value) throws -> Kind.Value { try fold(true) { a, v, k in try next(a, v, Double(k), self) } }

    private func fold<U>(_ initial: U, _ reversed: Bool, _ next: (U, Kind.Value, Int) throws -> U) rethrows -> U {
        var accumulator = initial
        _ = try first(reversed: reversed) { v, k in accumulator = try next(accumulator, v, k); return false }
        return accumulator
    }

    private func fold(_ reversed: Bool, _ next: (Kind.Value, Kind.Value, Int) throws -> Kind.Value) throws -> Kind.Value {
        guard count > 0 else { throw JSException(JSTypeError("Reduce of empty array with no initial value")) }
        var accumulator = value(reversed ? count - 1 : 0)
        var skipped = false
        _ = try first(reversed: reversed) { v, k in
            if skipped { accumulator = try next(accumulator, v, k) }
            skipped = true
            return false
        }
        return accumulator
    }

    // MARK: Iteration and strings

    public struct Iterator: IteratorProtocol {
        let array: JSTypedArray
        var index = 0

        public mutating func next() -> Kind.Value? {
            guard index < array.count else { return nil }
            defer { index += 1 }
            return array.value(index)
        }
    }

    public func makeIterator() -> Iterator { Iterator(array: self) }

    /// `array.keys()`.
    public func keys() -> JSIterator<Double> {
        var i = 0
        return JSIterator { [self] in
            guard i < count else { return nil }
            defer { i += 1 }
            return Double(i)
        }
    }

    /// `array.values()`.
    public func values() -> JSIterator<Kind.Value> {
        var i = 0
        return JSIterator { [self] in
            guard i < count else { return nil }
            defer { i += 1 }
            return value(i)
        }
    }

    /// `array.entries()`, each entry an `(index, value)` tuple.
    public func entries() -> JSIterator<(Double, Kind.Value)> {
        var i = 0
        return JSIterator { [self] in
            guard i < count else { return nil }
            defer { i += 1 }
            return (Double(i), value(i))
        }
    }

    public func jsAnyIterator() throws -> JSIteratorProtocol {
        var i = 0
        return JSIterator<Any?> { [self] in
            guard i < count else { return nil }
            defer { i += 1 }
            return value(i)
        }
    }

    /// `array.join(separator)`.
    public func join(_ separator: String = ",") -> String { (0..<count).map { Kind.string(value($0)) }.joined(separator: separator) }

    public func toString() -> String { join() }

    // MARK: JSDynamic

    public var jsToStringTag: String { Kind.kind.name }
    public var jsKeys: [String] { (0..<count).map(String.init) }
    public var jsClassName: String? { Kind.kind.name }
    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "length": return length
            case "byteLength": return byteLength
            case "byteOffset": return byteOffset
            case "buffer": return buffer
            case "BYTES_PER_ELEMENT": return BYTES_PER_ELEMENT
            default: return jsArrayIndex(key).flatMap { self[jsIndex: Double($0)] }
            }
        }
        set {
            guard let k = jsArrayIndex(key), let v = try? Kind.convert(newValue) else { return }
            self[jsIndex: Double(k)] = v
        }
    }

    /// The methods untyped code calls by name, with JavaScript values.
    public func jsInvoke(_ key: String, _ args: [Any?]) throws -> Any?? {
        let number = { (i: Int) -> Double? in jsIsNullish(jsArg(args, i)) ? nil : jsToNumber(jsArg(args, i)) }
        let callback = jsArg(args, 0)
        let test = { (v: Kind.Value, k: Int) throws -> Bool in jsIsTruthy(try jsCall(callback, v, Double(k), self)) }
        let search = { () -> Kind.Value? in jsFlat(jsArg(args, 0)) as? Kind.Value }
        switch key {
        case "set": try set(jsArg(args, 0), number(1)); return .some(nil)
        case "subarray": return subarray(number(0), number(1))
        case "slice": return slice(number(0), number(1))
        case "fill": return fill(try Kind.convert(jsArg(args, 0)), number(1), number(2))
        case "copyWithin": return copyWithin(number(0) ?? 0, number(1), number(2))
        case "reverse": return reverse()
        case "sort":
            if jsIsNullish(callback) { return sort() }
            return try sort { a, b in jsToNumber(try jsCall(callback, a, b)) }
        case "at": return .some(at(number(0) ?? 0))
        case "indexOf": return search().map { indexOf($0, number(1)) } ?? -1.0
        case "lastIndexOf": return search().map { args.count > 1 ? lastIndexOf($0, number(1) ?? 0) : lastIndexOf($0) } ?? -1.0
        case "includes": return search().map { includes($0, number(1)) } ?? false
        case "join": return join(jsIsNullish(jsArg(args, 0)) ? "," : jsToString(jsArg(args, 0)))
        case "toString": return toString()
        case "forEach": _ = try first { v, k in _ = try test(v, k); return false }; return .some(nil)
        case "map": return try mapped { v, k in try Kind.convert(try jsCall(callback, v, Double(k), self)) }
        case "filter": return try filtered(test)
        case "find": return .some(try first(test)?.1)
        case "findIndex": return Double(try first(test)?.0 ?? -1)
        case "findLast": return .some(try first(reversed: true, test)?.1)
        case "findLastIndex": return Double(try first(reversed: true, test)?.0 ?? -1)
        case "some": return try first(test) != nil
        case "every": return try first { v, k in !(try test(v, k)) } == nil
        case "reduce", "reduceRight":
            let reversed = key == "reduceRight"
            let step = { (a: Any?, v: Kind.Value, k: Int) throws -> Any? in try jsCall(callback, a, v, Double(k), self) }
            if args.count > 1 { return .some(try fold(jsArg(args, 1), reversed, step)) }
            guard count > 0 else { throw JSException(JSTypeError("Reduce of empty array with no initial value")) }
            var accumulator: Any? = value(reversed ? count - 1 : 0)
            var skipped = false
            _ = try first(reversed: reversed) { v, k in
                if skipped { accumulator = try step(accumulator, v, k) }
                skipped = true
                return false
            }
            return .some(accumulator)
        case "keys": return keys()
        case "values": return try jsAnyIterator()
        case "entries":
            var i = 0
            return JSIterator<Any?> { [self] in
                guard i < count else { return nil }
                defer { i += 1 }
                return JSArray<Any?>([Double(i), value(i)])
            }
        default: return nil
        }
    }
}

nonisolated(unsafe) private var jsTypedArrayPrototypes: [ObjectIdentifier: AnyObject] = [:]

@inline(__always)
private func jsTruth<R>(_ result: R) -> Bool {
    if R.self == Bool.self { return result as! Bool }
    return jsIsTruthy(result)
}

/// Numbers and BigInts never convert into each other's typed arrays.
private func jsCheckContentType(_ source: JSTypedArrayKind, _ target: JSTypedArrayKind) throws {
    if source.isBigInt != target.isBigInt { throw JSException(JSTypeError("Cannot mix BigInt and other types, use explicit conversions")) }
}

/// ToBigInt, as a BigInt array converts what is written to it: a number is a TypeError.
func jsToBigIntElement(_ value: Any?) throws -> JSBigInt {
    switch jsFlat(value) {
    case let big as JSBigInt: return big
    case let d as Double: throw JSException(JSTypeError("Cannot convert \(jsNumberToString(d)) to a BigInt"))
    default: return try JSBigInt(convert: value)
    }
}

/// An iterable's values, or else an array-like's (`{ length, 0: … }`).
private func jsArrayLikeValues(_ value: Any) -> [Any?] {
    switch value {
    case let array as JSArrayProtocol: return array.jsAnyElements
    case let typed as JSTypedArrayProtocol: return typed.jsAnyValues
    case let s as String: return s.utf16.map { String(decoding: [$0], as: UTF16.self) }
    case is JSIterableValue, is JSSetProtocol, is JSMapProtocol:
        guard let iterator = try? jsIteratorOf(value) else { return [] }
        return Array(iterator)
    default:
        let length = jsToIntegerOrInfinity(jsToNumber(try? jsGet(value, "length")))
        guard length > 0 else { return [] }
        return (0..<Int(min(length, 4_294_967_295))).map { (try? jsGet(value, String($0))) ?? nil }
    }
}

// MARK: - DataView

/// `DataView`: a buffer's bytes read and written as numbers of any type, at any offset, in either byte order.
public final class JSDataView: JSArrayBufferView, JSToStringTag, JSHostObject {
    public let buffer: JSArrayBuffer
    let offset: Int
    let count: Int

    /// `new DataView(buffer, byteOffset, byteLength)`.
    public init(buffer: JSArrayBuffer, _ byteOffset: Double? = nil, _ byteLength: Double? = nil) throws {
        guard let start = jsIndex(byteOffset ?? 0), start <= buffer.count else {
            throw JSException(JSRangeError("Start offset \(jsNumberToString(jsToIntegerOrInfinity(byteOffset ?? 0))) is outside the bounds of the buffer"))
        }
        let n = byteLength.map(jsIndex) ?? buffer.count - start
        guard let n, start + n <= buffer.count else { throw JSException(JSRangeError("Invalid DataView length \(jsNumberToString(byteLength ?? 0))")) }
        self.buffer = buffer
        offset = start
        count = n
    }

    /// `new DataView(x, …)` of an untyped value: a TypeError unless it is an ArrayBuffer.
    public static func from(_ value: Any?, _ byteOffset: Double? = nil, _ byteLength: Double? = nil) throws -> JSDataView {
        guard let buffer = jsFlat(value) as? JSArrayBuffer else { throw JSException(JSTypeError("First argument to DataView constructor must be an ArrayBuffer")) }
        return try JSDataView(buffer: buffer, byteOffset, byteLength)
    }

    public var byteLength: Double { Double(count) }
    public var byteOffset: Double { Double(offset) }
    public var jsBytes: UnsafeMutableRawBufferPointer { UnsafeMutableRawBufferPointer(start: buffer.bytes + offset, count: count) }

    private func address(_ byteOffset: Double, _ size: Int) throws -> UnsafeMutableRawPointer {
        guard let k = jsIndex(byteOffset), k + size <= count else { throw JSException(JSRangeError("Offset is outside the bounds of the DataView")) }
        return buffer.bytes + offset + k
    }

    private func load<T: FixedWidthInteger>(_ byteOffset: Double, _ littleEndian: Bool?, _: T.Type) throws -> T {
        let raw = try address(byteOffset, MemoryLayout<T>.size).loadUnaligned(as: T.self)
        return littleEndian == true ? T(littleEndian: raw) : T(bigEndian: raw)
    }

    private func store<T: FixedWidthInteger>(_ byteOffset: Double, _ value: T, _ littleEndian: Bool?) throws {
        try address(byteOffset, MemoryLayout<T>.size).storeBytes(of: littleEndian == true ? value.littleEndian : value.bigEndian, as: T.self)
    }

    public func getInt8(_ byteOffset: Double) throws -> Double { Double(try load(byteOffset, nil, Int8.self)) }
    public func getUint8(_ byteOffset: Double) throws -> Double { Double(try load(byteOffset, nil, UInt8.self)) }
    public func getInt16(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(try load(byteOffset, littleEndian, Int16.self)) }
    public func getUint16(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(try load(byteOffset, littleEndian, UInt16.self)) }
    public func getInt32(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(try load(byteOffset, littleEndian, Int32.self)) }
    public func getUint32(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(try load(byteOffset, littleEndian, UInt32.self)) }
    public func getFloat32(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(Float(bitPattern: try load(byteOffset, littleEndian, UInt32.self))) }
    public func getFloat64(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> Double { Double(bitPattern: try load(byteOffset, littleEndian, UInt64.self)) }
    public func getBigInt64(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> JSBigInt { JSBigInt64Element.load(try load(byteOffset, littleEndian, Int64.self)) }
    public func getBigUint64(_ byteOffset: Double, _ littleEndian: Bool? = nil) throws -> JSBigInt { JSBigUint64Element.load(try load(byteOffset, littleEndian, UInt64.self)) }

    public func setInt8(_ byteOffset: Double, _ value: Double) throws { try store(byteOffset, JSInt8Element.store(value), nil) }
    public func setUint8(_ byteOffset: Double, _ value: Double) throws { try store(byteOffset, JSUint8Element.store(value), nil) }
    public func setInt16(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, JSInt16Element.store(value), littleEndian) }
    public func setUint16(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, JSUint16Element.store(value), littleEndian) }
    public func setInt32(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, jsToInt32(value), littleEndian) }
    public func setUint32(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, jsToUint32(value), littleEndian) }
    public func setFloat32(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, Float(value).bitPattern, littleEndian) }
    public func setFloat64(_ byteOffset: Double, _ value: Double, _ littleEndian: Bool? = nil) throws { try store(byteOffset, value.bitPattern, littleEndian) }
    public func setBigInt64(_ byteOffset: Double, _ value: JSBigInt, _ littleEndian: Bool? = nil) throws { try store(byteOffset, value.int64, littleEndian) }
    public func setBigUint64(_ byteOffset: Double, _ value: JSBigInt, _ littleEndian: Bool? = nil) throws { try store(byteOffset, value.uint64, littleEndian) }

    public var jsToStringTag: String { "DataView" }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "DataView" }
    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "byteLength": return byteLength
            case "byteOffset": return byteOffset
            case "buffer": return buffer
            default: return nil
            }
        }
        set {}
    }

    /// The methods untyped code calls by name, with JavaScript values.
    public func jsInvoke(_ key: String, _ args: [Any?]) throws -> Any?? {
        let at = jsToNumber(jsArg(args, 0))
        let little = jsIsTruthy(jsArg(args, key.hasPrefix("get") ? 1 : 2))
        let number = { jsToNumber(jsArg(args, 1)) }
        switch key {
        case "getInt8": return try getInt8(at)
        case "getUint8": return try getUint8(at)
        case "getInt16": return try getInt16(at, little)
        case "getUint16": return try getUint16(at, little)
        case "getInt32": return try getInt32(at, little)
        case "getUint32": return try getUint32(at, little)
        case "getFloat32": return try getFloat32(at, little)
        case "getFloat64": return try getFloat64(at, little)
        case "getBigInt64": return try getBigInt64(at, little)
        case "getBigUint64": return try getBigUint64(at, little)
        case "setInt8": try setInt8(at, number())
        case "setUint8": try setUint8(at, number())
        case "setInt16": try setInt16(at, number(), little)
        case "setUint16": try setUint16(at, number(), little)
        case "setInt32": try setInt32(at, number(), little)
        case "setUint32": try setUint32(at, number(), little)
        case "setFloat32": try setFloat32(at, number(), little)
        case "setFloat64": try setFloat64(at, number(), little)
        case "setBigInt64": try setBigInt64(at, try jsToBigIntElement(jsArg(args, 1)), little)
        case "setBigUint64": try setBigUint64(at, try jsToBigIntElement(jsArg(args, 1)), little)
        default: return nil
        }
        return .some(nil)
    }
}

/// The iOS runtime's `interop` functions core calls.
public enum interop {
    /// `interop.bufferFromData(data)`: an ArrayBuffer of the data's bytes.
    public static func bufferFromData(_ data: NSData?) -> JSArrayBuffer { JSArrayBuffer(data: (data ?? NSData()) as Data) }
    /// `new interop.FunctionReference(fn)`: the function, which a native callback parameter takes as it is.
    public static let FunctionReference = JSConstructor { args in args.first ?? nil }
}

/// The bytes a native API reads of a buffer or a view passed untyped (`dataWithData(buffer as any)`).
public func jsNativeData(_ value: Any?) -> Data {
    switch jsFlat(value) {
    case let source as JSBufferSource: return Data(source.jsBytes)
    case let data as Data: return data
    case let data as NSData: return data as Data
    default: return Data()
    }
}

/// The address of a buffer's or a view's bytes, as the iOS runtime passes them to a native pointer parameter.
public func jsNativeBytes(_ value: Any?) -> UnsafeRawPointer? {
    switch jsFlat(value) {
    case let source as JSBufferSource: return source.jsBytes.baseAddress.map(UnsafeRawPointer.init)
    default: return nil
    }
}

/// A length or offset in bytes: a whole number from 0, or nil (a RangeError).
private func jsByteCount(_ value: Double) -> Int? {
    let n = value.isNaN ? 0 : value.rounded(.towardZero)
    guard n >= 0, n <= 4_294_967_295 else { return nil }
    return Int(n)
}

/// ToIndex: a whole number from 0, or nil (a RangeError).
private func jsIndex(_ value: Double) -> Int? {
    let n = jsToIntegerOrInfinity(value)
    guard n >= 0, n <= 9_007_199_254_740_991 else { return nil }
    return Int(n)
}

/// `slice`'s start and end, relative to the end where negative, clamped to `0...count`.
private func jsRelativeRange(_ start: Double?, _ end: Double?, _ count: Int) -> (Int, Int) {
    let from = start.map { jsRelativeIndex($0, count) } ?? 0
    let to = end.map { jsRelativeIndex($0, count) } ?? count
    return (from, max(from, to))
}
