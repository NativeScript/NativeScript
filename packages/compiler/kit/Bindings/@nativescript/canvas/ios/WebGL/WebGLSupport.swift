import Foundation
import NativeScriptKit
import CanvasNative

/// A typed array's elements, when the value is a typed array of that kind.
@inline(__always)
func webglElements<T>(_ value: Any?, _ kind: JSTypedArrayKind, _: T.Type) -> UnsafeBufferPointer<T>? {
    guard let source = value as? JSBufferSource, source.jsElementKind == kind else { return nil }
    let bytes = source.jsBytes
    return UnsafeBufferPointer(start: bytes.baseAddress?.assumingMemoryBound(to: T.self), count: bytes.count / MemoryLayout<T>.stride)
}

/// The values of a typed array of that kind, or else (where `convert` is given) of an array, each
/// number converted: a typed array is read in place, an array copied, as the C++ binding does.
@inline(__always)
func withWebGLValues<T>(_ value: Any?, _ kind: JSTypedArrayKind, array convert: ((Double) -> T)?, _ body: (UnsafePointer<T>?, UInt) -> Void) {
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
    guard let view = source as? JSArrayBufferView, let start = bytes.baseAddress,
          let bufferStart = view.buffer.jsBytes.baseAddress else { return bytes }
    let end = bufferStart + view.buffer.count
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
    guard let buffer else { return webglTypedArray(JSFloat32Element.self, nil, 0) }
    defer { canvas_native_f32_buffer_release(buffer) }
    return webglTypedArray(JSFloat32Element.self, canvas_native_f32_buffer_get_bytes(buffer), Int(canvas_native_f32_buffer_get_length(buffer)))
}

/// An `Int32Array` of an I32Buffer the caller owns, which this releases.
func webglInt32Array(_ buffer: OpaquePointer?) -> Any? {
    guard let buffer else { return webglTypedArray(JSInt32Element.self, nil, 0) }
    defer { canvas_native_i32_buffer_release(buffer) }
    return webglTypedArray(JSInt32Element.self, canvas_native_i32_buffer_get_bytes(buffer), Int(canvas_native_i32_buffer_get_length(buffer)))
}

/// A `Uint32Array` of a U32Buffer the caller owns, which this releases.
func webglUint32Array(_ buffer: OpaquePointer?) -> Any? {
    guard let buffer else { return webglTypedArray(JSUint32Element.self, nil, 0) }
    defer { canvas_native_u32_buffer_release(buffer) }
    return webglTypedArray(JSUint32Element.self, canvas_native_u32_buffer_get_bytes(buffer), Int(canvas_native_u32_buffer_get_length(buffer)))
}

/// A typed array of a copy of `count` native elements.
private func webglTypedArray<Kind: JSTypedArrayElement>(_: Kind.Type, _ elements: UnsafeRawPointer?, _ count: Int) -> Any? {
    guard let array = try? JSTypedArray<Kind>(length: Double(count)) else { return nil }
    let bytes = array.jsBytes
    if let elements, let to = bytes.baseAddress, bytes.count > 0 { to.copyMemory(from: elements, byteCount: bytes.count) }
    return array
}

/// An array of booleans of a U8Buffer the caller owns (a byte of 1 is true), which this releases.
func webglBoolArray(_ buffer: OpaquePointer?) -> JSArray<Any?> {
    guard let buffer else { return JSArray<Any?>([]) }
    defer { canvas_native_u8_buffer_release(buffer) }
    let count = Int(canvas_native_u8_buffer_get_length(buffer))
    guard let bytes = canvas_native_u8_buffer_get_bytes(buffer) else { return JSArray<Any?>([]) }
    return JSArray<Any?>((0..<count).map { bytes[$0] == 1 })
}

// MARK: - Pixel sources

/// What `texImage2D` and its kin read pixels from, as the C++ binding tells hosts apart by native type.
enum WebGLPixels {
    /// An ImageAsset's `ImageAsset *`.
    case imageAsset(OpaquePointer)
    /// An ImageBitmap's `ImageAsset *` (`ImageBitmapImpl::GetImageAsset`).
    case imageBitmap(OpaquePointer)
    /// A 2D context's `CanvasRenderingContext2D *`.
    case canvas2D(OpaquePointer)
    /// An ImageData's `ImageData *`.
    case imageData(OpaquePointer)

    /// The pixels of an ImageAsset, ImageBitmap, 2D context or ImageData; nil for any other value.
    init?(_ value: Any?) {
        switch value {
        case let image as ImageAssetHost:
            guard let asset = image.asset else { return nil }
            self = .imageAsset(asset)
        case let bitmap as ImageBitmapHost:
            guard let asset = bitmap.asset else { return nil }
            self = .imageBitmap(asset)
        case let context as CanvasRenderingContext2DHost:
            self = .canvas2D(context.context)
        case let data as ImageDataHost:
            guard let imageData = data.imageData else { return nil }
            self = .imageData(imageData)
        default:
            return nil
        }
    }
}

/// Calls `body` with an ImageData's size and pixels, as the C++ binding reads them for `texImage2D` and its kin.
func withWebGLImageDataPixels(_ data: OpaquePointer, _ body: (_ width: Int32, _ height: Int32, _ bytes: UnsafePointer<UInt8>?, _ count: UInt) -> Void) {
    let buffer = canvas_native_image_data_get_data(data)
    defer { canvas_native_u8_buffer_release(buffer) }
    body(canvas_native_image_data_get_width(data), canvas_native_image_data_get_height(data),
         canvas_native_u8_buffer_get_bytes(buffer), UInt(canvas_native_u8_buffer_get_length(buffer)))
}
