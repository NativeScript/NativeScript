import Foundation
import NativeScriptKit
import CanvasNative

// MARK: Value tests and coercions, as V8 answers them

/// `IsObject`: anything but a primitive.
func isJSObject(_ value: Any?) -> Bool {
    switch value {
    case nil, is JSNull, is String, is Double, is Bool, is JSBigInt: return false
    default: return true
    }
}

/// `IsInt32`: a number that is a whole int32, -0 excluded.
func isInt32(_ value: Any?) -> Bool {
    guard let d = value as? Double, d == d.rounded(.towardZero), d >= -2_147_483_648, d <= 2_147_483_647 else { return false }
    return !(d == 0 && d.sign == .minus)
}

/// `IsUint32`: a number that is a whole uint32, -0 excluded.
func isUint32(_ value: Any?) -> Bool {
    guard let d = value as? Double, d == d.rounded(.towardZero), d >= 0, d <= 4_294_967_295 else { return false }
    return d.sign == .plus
}

/// `Uint32Value`: ToUint32.
func jsUint32(_ value: Any?) -> UInt32 {
    let d = jsToNumber(value)
    guard d.isFinite else { return 0 }
    return UInt32(truncatingIfNeeded: Int64(d.rounded(.towardZero).truncatingRemainder(dividingBy: 4_294_967_296)))
}

/// `(int32_t) double` as arm64 converts it: toward zero, saturating, NaN to 0.
func cInt32(_ d: Double) -> Int32 {
    if d.isNaN { return 0 }
    if d >= 2_147_483_647 { return .max }
    if d <= -2_147_483_648 { return .min }
    return Int32(d.rounded(.towardZero))
}

extension Args {
    /// `(int32_t) args[i]->NumberValue()`.
    func cInt(_ i: Int) -> Int32 { cInt32(number(i)) }
}

/// The elements of an array argument as floats, each `NumberValue`.
func floats(_ elements: [Any?]) -> [Float] { elements.map { Float(jsToNumber($0)) } }

// MARK: Strings

/// A string the C API returns and the caller frees, read as UTF-8; empty when the API returns none.
func takeString(_ c: UnsafePointer<CChar>?) -> String { ownedString(c, canvas_native_string_destroy) ?? "" }

/// Bytes as the engine reads a one-byte (Latin-1) string of them.
func oneByteString(_ bytes: UnsafeBufferPointer<UInt8>) -> String {
    if !bytes.contains(where: { $0 >= 0x80 }) { return String(decoding: bytes, as: UTF8.self) }
    var scalars = String.UnicodeScalarView()
    scalars.append(contentsOf: bytes.lazy.map { Unicode.Scalar($0) })
    return String(scalars)
}

/// A NUL-terminated C string the caller frees, read as one-byte (`OneByteStringResource(char *)`).
func takeOneByteString(_ c: UnsafePointer<CChar>?) -> String {
    guard let c else { return "" }
    defer { canvas_native_string_destroy(UnsafeMutablePointer(mutating: c)) }
    let n = strlen(c)
    return c.withMemoryRebound(to: UInt8.self, capacity: n) { oneByteString(UnsafeBufferPointer(start: $0, count: n)) }
}

/// A `CCow` the caller owns, read as UTF-8 and released.
func takeUTF8String(cow: OpaquePointer?) -> String {
    guard let cow else { return "" }
    defer { canvas_native_ccow_release(cow) }
    guard let bytes = canvas_native_ccow_get_bytes(cow) else { return "" }
    return String(decoding: UnsafeBufferPointer(start: bytes, count: Int(canvas_native_ccow_get_length(cow))), as: UTF8.self)
}

/// A copy of a `U8Buffer`'s bytes as an ArrayBuffer; the buffer is released.
func takeArrayBuffer(_ buffer: OpaquePointer?) -> JSArrayBuffer {
    guard let buffer else { return JSArrayBuffer(data: Data()) }
    defer { canvas_native_u8_buffer_release(buffer) }
    guard let bytes = canvas_native_u8_buffer_get_bytes(buffer) else { return JSArrayBuffer(data: Data()) }
    return JSArrayBuffer(data: Data(bytes: bytes, count: Int(canvas_native_u8_buffer_get_length(buffer))))
}

/// An ArrayBuffer over a `U8Buffer`'s bytes in place, which takes the buffer over and releases
/// it when the ArrayBuffer goes away.
func takeArrayBufferNoCopy(_ buffer: OpaquePointer?) -> JSArrayBuffer {
    guard let buffer else { return JSArrayBuffer(data: Data()) }
    guard let bytes = canvas_native_u8_buffer_get_bytes_mut(buffer) else {
        canvas_native_u8_buffer_release(buffer)
        return JSArrayBuffer(data: Data())
    }
    return JSArrayBuffer(bytesNoCopy: bytes, count: Int(canvas_native_u8_buffer_get_length(buffer))) {
        canvas_native_u8_buffer_release(buffer)
    }
}

/// A Uint8ClampedArray over a `U8Buffer`'s bytes in place, as `takeArrayBufferNoCopy` makes its buffer.
func takeClampedArrayNoCopy(_ buffer: OpaquePointer?) -> JSUint8ClampedArray? {
    try? JSUint8ClampedArray(buffer: takeArrayBufferNoCopy(buffer))
}

// MARK: Threads

/// Where the binding's off-thread work runs (the C++ binding's worker pool).
enum CanvasWorker {
    static let queue = DispatchQueue(label: "org.nativescript.canvas.worker", qos: .userInitiated, attributes: .concurrent)

    static func run(_ work: @escaping () -> Void) { queue.async(execute: work) }

    /// Runs `task` on the main thread as a script task, then its microtasks.
    static func onMain(_ task: @escaping () -> Void) {
        DispatchQueue.main.async {
            task()
            Microtasks.taskRan()
            Microtasks.checkpoint()
        }
    }
}

/// Calls a script callback from native code. What it throws is reported as uncaught, as an
/// engine reports an exception a native callback leaves pending, unless `swallow` (a `TryCatch`).
func callScript(_ callback: Any?, _ arguments: [Any?], swallow: Bool = false) {
    guard let f = callback as? JSFunction else { return }
    do { _ = try f(arguments) } catch {
        if !swallow { jsReportUncaught(jsCaught(error)) }
    }
}
