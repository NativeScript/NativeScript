import Foundation

/// An ArrayBuffer, a typed array or a DataView: bytes a native API reads and writes in place.
public protocol JSBufferSource: AnyObject {
    /// The bytes the value covers, at an address that stays put while the value lives.
    var jsBytes: UnsafeMutableRawBufferPointer { get }
}

/// `ArrayBuffer`: a fixed number of bytes, zeroed when made, at an address that stays put for
/// as long as the buffer lives (native APIs read and write them in place).
public final class JSArrayBuffer: JSDynamic, JSToStringTag, JSBufferSource {
    public let count: Int
    let bytes: UnsafeMutableRawPointer

    /// `new ArrayBuffer(length)`.
    public init(_ length: Double = 0) throws {
        guard let n = jsByteCount(length) else { throw JSException(JSRangeError("Invalid array buffer length")) }
        count = n
        bytes = .allocate(byteCount: max(n, 1), alignment: 16)
        bytes.initializeMemory(as: UInt8.self, repeating: 0, count: max(n, 1))
    }

    /// A copy of native bytes (`interop.bufferFromData`).
    public init(data: Data) {
        count = data.count
        bytes = .allocate(byteCount: max(count, 1), alignment: 16)
        data.copyBytes(to: bytes.assumingMemoryBound(to: UInt8.self), count: count)
    }

    deinit { bytes.deallocate() }

    public var byteLength: Double { Double(count) }
    public var jsBytes: UnsafeMutableRawBufferPointer { UnsafeMutableRawBufferPointer(start: bytes, count: count) }
    /// The bytes as Foundation holds them, copied.
    public var data: Data { Data(bytes: bytes, count: count) }

    /// `buffer.slice(begin, end)`: a new buffer of a copy of those bytes.
    public func slice(_ begin: Double? = nil, _ end: Double? = nil) -> JSArrayBuffer {
        let (from, to) = jsRelativeRange(begin, end, count)
        let copy = try! JSArrayBuffer(Double(to - from))
        copy.bytes.copyMemory(from: bytes + from, byteCount: to - from)
        return copy
    }

    /// `ArrayBuffer.prototype`, as far as a program reads it: its tag.
    public static let jsPrototype: JSArrayBuffer = try! JSArrayBuffer(0)

    /// `ArrayBuffer.isView(value)`.
    public static func isView(_ value: Any?) -> Bool { jsFlat(value) is JSUint8Array }

    public var jsToStringTag: String { "ArrayBuffer" }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "ArrayBuffer" }
    public subscript(jsKey key: String) -> Any? {
        get { key == "byteLength" ? byteLength : nil }
        set {}
    }
}

/// `Uint8Array`: a view of bytes of a buffer. Elements read past the end are undefined and
/// writes there are ignored; a written number is stored modulo 256.
public final class JSUint8Array: JSDynamic, JSToStringTag, JSBufferSource {
    public let buffer: JSArrayBuffer
    let offset: Int
    let count: Int

    /// `Uint8Array.prototype`, as far as a program reads it: its tag.
    public static let jsPrototype: JSUint8Array = try! JSUint8Array(length: 0)

    /// `new Uint8Array(length)`.
    public init(length: Double) throws {
        buffer = try JSArrayBuffer(length)
        offset = 0
        count = buffer.count
    }

    /// `new Uint8Array(buffer, byteOffset, length)`.
    public init(buffer: JSArrayBuffer, _ byteOffset: Double? = nil, _ length: Double? = nil) throws {
        guard let start = jsByteCount(byteOffset ?? 0), start <= buffer.count else { throw JSException(JSRangeError("Start offset \(jsToString(byteOffset)) is outside the bounds of the buffer")) }
        let n = length.map(jsByteCount) ?? buffer.count - start
        guard let n, start + n <= buffer.count else { throw JSException(JSRangeError("Invalid typed array length: \(jsToString(length))")) }
        self.buffer = buffer
        offset = start
        count = n
    }

    /// `new Uint8Array(values)` of an array or other array-like: each value as a byte.
    public init(_ values: [Any?]) throws {
        buffer = try JSArrayBuffer(Double(values.count))
        offset = 0
        count = values.count
        for (k, v) in values.enumerated() { self[jsIndex: Double(k)] = jsToNumber(v) }
    }

    /// `new Uint8Array(x)` of an untyped value: a length, a buffer, a view's bytes copied, or an array's values.
    public static func from(_ value: Any?) throws -> JSUint8Array {
        switch jsFlat(value) {
        case let buffer as JSArrayBuffer: return try JSUint8Array(buffer: buffer)
        case let view as JSUint8Array: return try JSUint8Array(view.values)
        case let array as JSArrayProtocol: return try JSUint8Array(array.jsAnyElements)
        case nil: return try JSUint8Array(length: 0)
        case let v?:
            if let n = jsNumeric(v) { return try JSUint8Array(length: n) }
            return try JSUint8Array([])
        }
    }

    public var length: Double { Double(count) }
    public var byteLength: Double { Double(count) }
    public var byteOffset: Double { Double(offset) }
    public var jsBytes: UnsafeMutableRawBufferPointer { UnsafeMutableRawBufferPointer(start: buffer.bytes + offset, count: count) }
    /// The viewed bytes as Foundation holds them, copied.
    public var data: Data { Data(bytes: buffer.bytes + offset, count: count) }
    var values: [Any?] { (0..<count).map { Double(buffer.bytes.load(fromByteOffset: offset + $0, as: UInt8.self)) } }

    /// `view[i]`.
    public subscript(jsIndex index: Double) -> Double? {
        get {
            guard let k = Int(exactly: index), k >= 0, k < count else { return nil }
            return Double(buffer.bytes.load(fromByteOffset: offset + k, as: UInt8.self))
        }
        set {
            guard let k = Int(exactly: index), k >= 0, k < count else { return }
            buffer.bytes.storeBytes(of: jsToUint8(newValue ?? .nan), toByteOffset: offset + k, as: UInt8.self)
        }
    }

    /// `view.slice(start, end)`: a new array of a copy of those elements.
    public func slice(_ start: Double? = nil, _ end: Double? = nil) -> JSUint8Array {
        let (from, to) = jsRelativeRange(start, end, count)
        let copy = try! JSUint8Array(length: Double(to - from))
        copy.buffer.bytes.copyMemory(from: buffer.bytes + offset + from, byteCount: to - from)
        return copy
    }

    public var jsToStringTag: String { "Uint8Array" }
    public var jsKeys: [String] { (0..<count).map(String.init) }
    public var jsClassName: String? { "Uint8Array" }
    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "length", "byteLength": return length
            case "byteOffset": return byteOffset
            case "buffer": return buffer
            default: return jsArrayIndex(key).flatMap { self[jsIndex: Double($0)] }
            }
        }
        set { if let k = jsArrayIndex(key) { self[jsIndex: Double(k)] = jsToNumber(newValue) } }
    }
}

/// The iOS runtime's `interop` functions core calls.
public enum interop {
    /// `interop.bufferFromData(data)`: an ArrayBuffer of the data's bytes.
    public static func bufferFromData(_ data: NSData?) -> JSArrayBuffer { JSArrayBuffer(data: (data ?? NSData()) as Data) }
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

/// ToUint8: the number modulo 2^8.
private func jsToUint8(_ value: Double) -> UInt8 {
    guard value.isFinite else { return 0 }
    let m = value.rounded(.towardZero).truncatingRemainder(dividingBy: 256)
    return UInt8(m < 0 ? m + 256 : m)
}

/// `slice`'s start and end, relative to the end where negative, clamped to `0...count`.
private func jsRelativeRange(_ start: Double?, _ end: Double?, _ count: Int) -> (Int, Int) {
    func at(_ v: Double) -> Int {
        let n = v.isNaN ? 0 : v.rounded(.towardZero)
        if n < 0 { return max(0, count + Int(max(n, -Double(count)))) }
        return min(count, Int(min(n, Double(count))))
    }
    let from = start.map(at) ?? 0
    let to = end.map(at) ?? count
    return (from, max(from, to))
}
