import Foundation
import NativeScriptKit
import CanvasNative

/// A buffer argument as V8 tells them apart (`IsArrayBuffer`, `IsFloat32Array` …).
enum WebGLBufferKind {
    case arrayBuffer, int8, uint8, uint8Clamped, int16, uint16, int32, uint32, float32, float64, bigInt64, bigUint64
    /// A DataView, or a view of no element type the binding knows.
    case dataView

    init(_ source: JSBufferSource) {
        if source is JSArrayBuffer { self = .arrayBuffer; return }
        switch (source as? JSDynamic)?.jsClassName {
        case "Float32Array": self = .float32
        case "Uint8Array": self = .uint8
        case "Int32Array": self = .int32
        case "Uint32Array": self = .uint32
        case "Uint16Array": self = .uint16
        case "Int16Array": self = .int16
        case "Int8Array": self = .int8
        case "Uint8ClampedArray": self = .uint8Clamped
        case "Float64Array": self = .float64
        case "BigInt64Array": self = .bigInt64
        case "BigUint64Array": self = .bigUint64
        default: self = .dataView
        }
    }

    /// `BYTES_PER_ELEMENT`, 0 for a view that has none.
    var bytesPerElement: Int {
        switch self {
        case .int8, .uint8, .uint8Clamped: return 1
        case .int16, .uint16: return 2
        case .int32, .uint32, .float32: return 4
        case .float64, .bigInt64, .bigUint64: return 8
        case .arrayBuffer, .dataView: return 0
        }
    }
}

/// A typed array's elements, when the value is a typed array of that kind.
@inline(__always)
func webglElements<T>(_ value: Any?, _ kind: WebGLBufferKind, _: T.Type) -> UnsafeBufferPointer<T>? {
    guard let source = value as? JSBufferSource, WebGLBufferKind(source) == kind else { return nil }
    let bytes = source.jsBytes
    return UnsafeBufferPointer(start: bytes.baseAddress?.assumingMemoryBound(to: T.self), count: bytes.count / MemoryLayout<T>.stride)
}

/// The values of a typed array of that kind, or else (where `convert` is given) of an array, each
/// number converted: a typed array is read in place, an array copied, as the C++ binding does.
@inline(__always)
func withWebGLValues<T>(_ value: Any?, _ kind: WebGLBufferKind, array convert: ((Double) -> T)?, _ body: (UnsafePointer<T>?, UInt) -> Void) {
    if let typed = webglElements(value, kind, T.self) {
        body(typed.baseAddress, UInt(typed.count))
        return
    }
    guard let convert, let array = value as? JSArrayProtocol else { return }
    let values = array.jsAnyElements.map { convert(jsToNumber($0)) }
    values.withUnsafeBufferPointer { body($0.baseAddress, UInt($0.count)) }
}

/// The elements of an array argument, each converted.
func webglArray<T>(_ value: Any?, _ convert: (Double) -> T) -> [T]? {
    (value as? JSArrayProtocol).map { $0.jsAnyElements.map { convert(jsToNumber($0)) } }
}

/// An ArrayBuffer's bytes, or a view's.
@inline(__always)
func webglBytes(_ value: Any?) -> UnsafeMutableRawBufferPointer? { (value as? JSBufferSource)?.jsBytes }

/// A view's bytes (`IsArrayBufferView`): nil for an ArrayBuffer.
@inline(__always)
func webglViewBytes(_ value: Any?) -> UnsafeMutableRawBufferPointer? {
    guard let source = value as? JSBufferSource, !(source is JSArrayBuffer) else { return nil }
    return source.jsBytes
}

/// A view's bytes from its start to the end of its buffer, where the C++ binding passes a view's
/// address with its whole buffer's length; an ArrayBuffer's bytes.
func webglBytesToBufferEnd(_ value: Any?) -> UnsafeMutableRawBufferPointer? {
    guard let source = value as? JSBufferSource else { return nil }
    let bytes = source.jsBytes
    guard !(source is JSArrayBuffer), let start = bytes.baseAddress,
          let buffer = (source as? JSDynamic)?[jsKey: "buffer"] as? JSArrayBuffer,
          let bufferStart = buffer.jsBytes.baseAddress else { return bytes }
    let end = bufferStart + buffer.count
    return end > start ? UnsafeMutableRawBufferPointer(start: start, count: end - start) : bytes
}

@inline(__always)
func webglU8(_ bytes: UnsafeMutableRawBufferPointer) -> UnsafeMutablePointer<UInt8>? {
    bytes.baseAddress?.assumingMemoryBound(to: UInt8.self)
}

// MARK: - Number conversions as C++ casts a double (arm64: truncation toward zero, saturating, NaN as 0)

/// ToInt32.
@inline(__always)
func webglInt32(_ value: Double) -> Int32 {
    guard value.isFinite else { return 0 }
    return Int32(truncatingIfNeeded: Int64(value.rounded(.towardZero).truncatingRemainder(dividingBy: 4_294_967_296)))
}

/// ToUint32.
@inline(__always)
func webglUint32(_ value: Double) -> UInt32 { UInt32(bitPattern: webglInt32(value)) }

/// `static_cast<ssize_t>(double)`.
@inline(__always)
func webglInt(_ value: Double) -> Int {
    if value.isNaN { return 0 }
    if value >= 9.223372036854775807e18 { return .max }
    if value <= -9.223372036854775808e18 { return .min }
    return Int(value)
}

/// `static_cast<size_t>(double)`.
@inline(__always)
func webglUInt(_ value: Double) -> UInt {
    if value.isNaN || value <= 0 { return 0 }
    if value >= 1.8446744073709552e19 { return .max }
    return UInt(value)
}

/// `(int32_t) double`.
@inline(__always)
func webglCInt32(_ value: Double) -> Int32 {
    if value.isNaN { return 0 }
    if value >= 2_147_483_647 { return .max }
    if value <= -2_147_483_648 { return .min }
    return Int32(value)
}

/// Whether V8 calls the value an object (`IsObject`): not a primitive, not null or undefined.
func webglIsObject(_ value: Any?) -> Bool {
    guard let value else { return false }
    return !(value is JSNull || value is Double || value is String || value is Bool || value is JSBigInt)
}

// MARK: - Results

/// A string the C API returns, which the caller owns: "" for none.
func webglString(_ c: UnsafePointer<CChar>?) -> String {
    ownedString(c) { canvas_native_string_destroy($0) } ?? ""
}

/// A `Float32Array` of an F32Buffer the caller owns, which this releases.
func webglFloat32Array(_ buffer: OpaquePointer?) -> Any? {
    guard let buffer else { return webglTypedArray(nil, 0) }
    defer { canvas_native_f32_buffer_release(buffer) }
    // TYPED-ARRAY: Float32Array
    return webglTypedArray(UnsafeRawPointer(canvas_native_f32_buffer_get_bytes(buffer)), Int(canvas_native_f32_buffer_get_length(buffer)) * 4)
}

/// An `Int32Array` of an I32Buffer the caller owns, which this releases.
func webglInt32Array(_ buffer: OpaquePointer?) -> Any? {
    guard let buffer else { return webglTypedArray(nil, 0) }
    defer { canvas_native_i32_buffer_release(buffer) }
    // TYPED-ARRAY: Int32Array
    return webglTypedArray(UnsafeRawPointer(canvas_native_i32_buffer_get_bytes(buffer)), Int(canvas_native_i32_buffer_get_length(buffer)) * 4)
}

/// A `Uint32Array` of a U32Buffer the caller owns, which this releases.
func webglUint32Array(_ buffer: OpaquePointer?) -> Any? {
    guard let buffer else { return webglTypedArray(nil, 0) }
    defer { canvas_native_u32_buffer_release(buffer) }
    // TYPED-ARRAY: Uint32Array
    return webglTypedArray(UnsafeRawPointer(canvas_native_u32_buffer_get_bytes(buffer)), Int(canvas_native_u32_buffer_get_length(buffer)) * 4)
}

/// The bytes copied into a new buffer, where the C++ binding returns a typed array over them.
private func webglTypedArray(_ bytes: UnsafeRawPointer?, _ count: Int) -> Any? {
    guard let buffer = try? JSArrayBuffer(Double(count)) else { return nil }
    if let bytes, count > 0, let to = buffer.jsBytes.baseAddress { to.copyMemory(from: bytes, byteCount: count) }
    return buffer
}

/// An array of booleans of a U8Buffer the caller owns (a byte of 1 is true), which this releases.
func webglBoolArray(_ buffer: OpaquePointer?) -> JSArray<Any?> {
    guard let buffer else { return JSArray<Any?>([]) }
    defer { canvas_native_u8_buffer_release(buffer) }
    let count = Int(canvas_native_u8_buffer_get_length(buffer))
    guard let bytes = canvas_native_u8_buffer_get_bytes(buffer) else { return JSArray<Any?>([]) }
    return JSArray<Any?>((0..<count).map { bytes[$0] == 1 })
}

// MARK: - Pixel sources of other areas

// CROSS-AREA: the hosts of ImageAsset, ImageBitmap, CanvasRenderingContext2D and ImageData adopt
// `WebGLPixelSource`, so that `texImage2D`, `texSubImage2D`, `texImage3D` and `texSubImage3D` read them.
/// A host `texImage2D` and its kin read pixels from, as the C++ binding tells them apart by native type.
protocol WebGLPixelSource: AnyObject {
    var webglPixels: WebGLPixels { get }
}

enum WebGLPixels {
    /// An ImageAsset's `ImageAsset *`.
    case imageAsset(OpaquePointer)
    /// An ImageBitmap's `ImageAsset *` (`ImageBitmapImpl::GetImageAsset`).
    case imageBitmap(OpaquePointer)
    /// A 2D context's `CanvasRenderingContext2D *`.
    case canvas2D(OpaquePointer)
    /// An ImageData's `ImageData *`.
    case imageData(OpaquePointer)
}

/// An ImageData's size and pixels, as the C++ binding reads them for `texImage2D` and its kin.
func webglImageDataPixels(_ data: OpaquePointer) -> (width: Int32, height: Int32, bytes: UnsafePointer<UInt8>?, count: UInt) {
    let buffer = canvas_native_image_data_get_data(data)
    return (canvas_native_image_data_get_width(data), canvas_native_image_data_get_height(data),
            canvas_native_u8_buffer_get_bytes(buffer), UInt(canvas_native_u8_buffer_get_length(buffer)))
}
