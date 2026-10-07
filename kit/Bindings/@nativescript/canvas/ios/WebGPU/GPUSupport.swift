import Foundation
import NativeScriptKit
import CanvasNative

// MARK: - Values as V8 classifies them

/// `IsUint32`: a number that is a whole uint32; -0 is not.
@inline(__always)
func gpuIsUint32(_ value: Any?) -> Bool {
    guard let d = value as? Double else { return false }
    return d >= 0 && d <= 4_294_967_295 && d.rounded(.towardZero) == d && !(d == 0 && d.sign == .minus)
}

/// `IsInt32`: a number that is a whole int32; -0 is not.
@inline(__always)
func gpuIsInt32(_ value: Any?) -> Bool {
    guard let d = value as? Double else { return false }
    return d >= -2_147_483_648 && d <= 2_147_483_647 && d.rounded(.towardZero) == d && !(d == 0 && d.sign == .minus)
}

/// `IsObject`: anything but undefined, null and the primitives.
@inline(__always)
func gpuIsObject(_ value: Any?) -> Bool {
    switch value {
    case nil, is JSNull, is String, is Double, is Bool, is JSBigInt: return false
    default: return true
    }
}

/// A property of a descriptor, as `object->Get(context, key)` reads it.
@inline(__always)
func gpuMember(_ object: Any?, _ key: String) -> Any? { member(object, key) }

/// `Uint32Value`: ToUint32.
@inline(__always)
func gpuUint32(_ value: Any?) -> UInt32 { UInt32(truncatingIfNeeded: gpuModulo32(jsToNumber(value))) }

/// `Int32Value`: ToInt32.
@inline(__always)
func gpuInt32(_ value: Any?) -> Int32 { Int32(truncatingIfNeeded: gpuModulo32(jsToNumber(value))) }

private func gpuModulo32(_ value: Double) -> Int64 {
    guard value.isFinite else { return 0 }
    return Int64(value.rounded(.towardZero).truncatingRemainder(dividingBy: 4_294_967_296))
}

/// A C cast of a double to int64_t, saturating where C leaves it undefined.
@inline(__always)
func gpuInt64(_ value: Double) -> Int64 {
    guard value.isFinite else { return 0 }
    if value >= 9.223372036854775807e18 { return .max }
    if value <= -9.223372036854775808e18 { return .min }
    return Int64(value)
}

/// A C cast of a double to uint64_t, saturating where C leaves it undefined.
@inline(__always)
func gpuUInt64(_ value: Double) -> UInt64 {
    guard value.isFinite, value > 0 else { return 0 }
    if value >= 1.8446744073709552e19 { return .max }
    return UInt64(value)
}

/// A C cast of a double to size_t.
@inline(__always)
func gpuSize(_ value: Double) -> UInt { UInt(gpuUInt64(value)) }

/// `ConvertFromV8String`: the value's string form, `"undefined"` for undefined.
@inline(__always)
func gpuString(_ value: Any?) -> String { jsToString(value) }

/// `GPULabel`: the value when it is a string, otherwise no label.
@inline(__always)
func gpuLabel(_ value: Any?) -> String? { value as? String }

/// A typed array of that kind (`IsUint32Array`): its bytes.
func gpuTypedArray(_ value: Any?, _ name: String) -> UnsafeMutableRawBufferPointer? {
    guard let source = value as? JSBufferSource, (source as? JSDynamic)?.jsClassName == name else { return nil }
    return source.jsBytes
}

/// `IsTypedArray() || IsArrayBuffer()`: the bytes of an ArrayBuffer or a typed array, not a DataView.
func gpuBufferBytes(_ value: Any?) -> UnsafeMutableRawBufferPointer? {
    guard let source = value as? JSBufferSource, (source as? JSDynamic)?.jsClassName != "DataView" else { return nil }
    return source.jsBytes
}

// MARK: - C strings

/// Runs `body` with the label as a C string, or null without one.
@inline(__always)
func gpuWithCString<R>(_ string: String?, _ body: (UnsafePointer<CChar>?) -> R) -> R {
    guard let string else { return body(nil) }
    return string.withCString { body($0) }
}

/// A string the API returns, freed with `canvas_native_string_destroy`.
func gpuOwnedString(_ c: UnsafeMutablePointer<CChar>?) -> String? {
    guard let c else { return nil }
    defer { canvas_native_string_destroy(c) }
    return String(cString: c)
}

/// The strings of a `StringBuffer`, which the caller then releases or not as the API says.
func gpuStrings(_ buffer: OpaquePointer?) -> [String] {
    guard let buffer else { return [] }
    let count = canvas_native_string_buffer_get_length(buffer)
    var strings: [String] = []
    strings.reserveCapacity(Int(count))
    for i in 0..<count {
        if let s = gpuOwnedString(canvas_native_string_buffer_get_value_at(buffer, i)) { strings.append(s) }
    }
    return strings
}

// MARK: - Callbacks from the native side

/// A Swift closure carried through a C callback's `void *` user data.
final class GPUCallbackBox<T> {
    let value: T
    init(_ value: T) { self.value = value }

    func retained() -> UnsafeMutableRawPointer { Unmanaged.passRetained(self).toOpaque() }
    static func take(_ data: UnsafeMutableRawPointer?) -> T? {
        guard let data else { return nil }
        return Unmanaged<GPUCallbackBox<T>>.fromOpaque(data).takeRetainedValue().value
    }
    static func peek(_ data: UnsafeMutableRawPointer?) -> T? {
        guard let data else { return nil }
        return Unmanaged<GPUCallbackBox<T>>.fromOpaque(data).takeUnretainedValue().value
    }
}

/// Runs `body` as a JavaScript task on the main thread, after the current one, then the
/// microtask checkpoint: what the binding's main-queue callbacks do.
func gpuMainTask(_ body: @escaping () -> Void) {
    DispatchQueue.main.async {
        body()
        Microtasks.taskRan()
        Microtasks.checkpoint()
    }
}

/// Runs `body` now when called on the main thread, where the engine would call script
/// synchronously from inside the native call; otherwise as a main-thread task.
func gpuMainNowOrTask(_ body: @escaping () -> Void) {
    if Thread.isMainThread { body() } else { gpuMainTask(body) }
}

/// Calls a script function, reporting what it throws as uncaught.
func gpuCall(_ function: Any?, _ arguments: [Any?]) {
    do { _ = try jsCall(function, spread: arguments) } catch { jsReportUncaught(jsCaught(error)) }
}

/// The number `uncapturederror` and `popErrorScope` callbacks receive for an error type,
/// and its message (null but for validation errors).
func gpuErrorArguments(_ type: CanvasGPUErrorType, _ message: UnsafeMutablePointer<CChar>?) -> [Any?] {
    switch type {
    case CanvasGPUErrorTypeNone: return [0.0, jsNull]
    case CanvasGPUErrorTypeLost: return [1.0, jsNull]
    case CanvasGPUErrorTypeOutOfMemory: return [2.0, jsNull]
    case CanvasGPUErrorTypeValidation: return [3.0, message.map { String(cString: $0) } ?? ""]
    case CanvasGPUErrorTypeInternal: return [4.0, jsNull]
    default: return [nil, nil]
    }
}

// MARK: - Descriptor memory

/// Memory the C structs of a descriptor point into, freed with the arena.
final class GPUArena {
    private var blocks: [UnsafeMutableRawPointer] = []
    private var constants: [OpaquePointer] = []

    func string(_ string: String?) -> UnsafePointer<CChar>? {
        guard let string, let copy = strdup(string) else { return nil }
        blocks.append(UnsafeMutableRawPointer(copy))
        return UnsafePointer(copy)
    }

    func pointer<T>(to value: T) -> UnsafePointer<T> {
        let p = UnsafeMutablePointer<T>.allocate(capacity: 1)
        p.initialize(to: value)
        blocks.append(UnsafeMutableRawPointer(p))
        return UnsafePointer(p)
    }

    func array<T>(_ values: [T]) -> UnsafePointer<T>? {
        guard !values.isEmpty else { return nil }
        let p = UnsafeMutablePointer<T>.allocate(capacity: values.count)
        p.initialize(from: values, count: values.count)
        blocks.append(UnsafeMutableRawPointer(p))
        return UnsafePointer(p)
    }

    /// Pipeline constants from a `Map` of names to numbers; other values give none.
    func constants(_ value: Any?) -> OpaquePointer? {
        guard let map = value as? JSMapProtocol, map.jsSize > 0, let store = canvas_native_webgpu_constants_create() else { return nil }
        constants.append(store)
        for (key, value) in map.jsAnyEntries {
            guard let key = jsFlat(key) as? String, let number = jsFlat(value) as? Double else { continue }
            canvas_native_webgpu_constants_insert(store, key, number)
        }
        return store
    }

    deinit {
        for block in blocks { block.deallocate() }
        for store in constants { canvas_native_webgpu_constants_destroy(store) }
    }
}

// MARK: - Shared descriptor parsing (GPUUtils.h)

func gpuTextureFormat(_ value: Any?) -> CanvasOptionalGPUTextureFormat {
    canvas_native_webgpu_enum_string_to_gpu_texture(gpuString(value))
}

func gpuTextureFormatName(_ format: CanvasGPUTextureFormat) -> String {
    gpuOwnedString(canvas_native_webgpu_enum_gpu_texture_to_string(format)) ?? ""
}

func gpuStoreOp(_ value: Any?) -> CanvasStoreOp {
    if gpuIsUint32(value), let d = value as? Double { return CanvasStoreOp(rawValue: UInt32(d)) }
    if let s = value as? String {
        if s == "discard" { return CanvasStoreOpDiscard }
        if s == "store" { return CanvasStoreOpStore }
    }
    return CanvasStoreOpStore
}

func gpuLoadOp(_ value: Any?) -> CanvasLoadOp {
    if gpuIsUint32(value), let d = value as? Double { return CanvasLoadOp(rawValue: UInt32(d)) }
    if let s = value as? String {
        if s == "clear" { return CanvasLoadOpClear }
        if s == "load" { return CanvasLoadOpLoad }
    }
    return CanvasLoadOpClear
}

func gpuCompareFunction(_ value: Any?, _ fallback: CanvasCompareFunction) -> CanvasCompareFunction {
    gpuOptionalCompareFunction(value) ?? fallback
}

func gpuOptionalCompareFunction(_ value: Any?) -> CanvasCompareFunction? {
    switch gpuString(value) {
    case "never": return CanvasCompareFunctionNever
    case "less": return CanvasCompareFunctionLess
    case "equal": return CanvasCompareFunctionEqual
    case "less-equal": return CanvasCompareFunctionLessEqual
    case "greater": return CanvasCompareFunctionGreater
    case "not-equal": return CanvasCompareFunctionNotEqual
    case "greater-equal": return CanvasCompareFunctionGreaterEqual
    case "always": return CanvasCompareFunctionAlways
    default: return nil
    }
}

func gpuCanvasOptionalCompare(_ value: Any?) -> CanvasOptionalCompareFunction {
    var compare = CanvasOptionalCompareFunction()
    compare.tag = CanvasOptionalCompareFunctionNone
    if let some = gpuOptionalCompareFunction(value) {
        compare.tag = CanvasOptionalCompareFunctionSome
        compare.some = some
    }
    return compare
}

func gpuStencilOperation(_ value: Any?, _ fallback: CanvasStencilOperation) -> CanvasStencilOperation {
    switch gpuString(value) {
    case "decrement-clamp": return CanvasStencilOperationDecrementClamp
    case "decrement-wrap": return CanvasStencilOperationDecrementWrap
    case "invert": return CanvasStencilOperationInvert
    case "increment-clamp": return CanvasStencilOperationIncrementClamp
    case "increment-wrap": return CanvasStencilOperationIncrementWrap
    case "keep": return CanvasStencilOperationKeep
    case "replace": return CanvasStencilOperationReplace
    case "zero": return CanvasStencilOperationZero
    default: return fallback
    }
}

func gpuBlendFactor(_ value: Any?, _ fallback: CanvasBlendFactor) -> CanvasBlendFactor {
    switch gpuString(value) {
    case "constant": return CanvasBlendFactorConstant
    case "dst": return CanvasBlendFactorDst
    case "dst-alpha": return CanvasBlendFactorDstAlpha
    case "one": return CanvasBlendFactorOne
    case "one-minus-dst": return CanvasBlendFactorOneMinusDst
    case "one-minus-src": return CanvasBlendFactorOneMinusSrc
    case "one-minus-src-alpha": return CanvasBlendFactorOneMinusSrcAlpha
    case "one-minus-dst-alpha": return CanvasBlendFactorOneMinusDstAlpha
    case "one-minus-constant": return CanvasBlendFactorOneMinusConstant
    case "src": return CanvasBlendFactorSrc
    case "src-alpha": return CanvasBlendFactorSrcAlpha
    case "src-alpha-saturated": return CanvasBlendFactorSrcAlphaSaturated
    case "zero": return CanvasBlendFactorZero
    default: return fallback
    }
}

func gpuBlendOperation(_ value: Any?, _ fallback: CanvasBlendOperation) -> CanvasBlendOperation {
    switch gpuString(value) {
    case "add": return CanvasBlendOperationAdd
    case "max": return CanvasBlendOperationMax
    case "min": return CanvasBlendOperationMin
    case "reverse-subtract": return CanvasBlendOperationReverseSubtract
    case "subtract": return CanvasBlendOperationSubtract
    default: return fallback
    }
}

func gpuTextureViewDimension(_ value: Any?) -> CanvasTextureViewDimension {
    guard let s = value as? String else { return CanvasTextureViewDimensionD2 }
    switch s {
    case "1d": return CanvasTextureViewDimensionD1
    case "2d-array": return CanvasTextureViewDimensionD2Array
    case "cube": return CanvasTextureViewDimensionCube
    case "cube-array": return CanvasTextureViewDimensionCubeArray
    case "3d": return CanvasTextureViewDimensionD3
    default: return CanvasTextureViewDimensionD2
    }
}

/// `ParseExtent3d`: an array or a `{ width, height, depthOrArrayLayers }`, each read only when a uint32.
func gpuExtent3d(_ value: Any?) -> CanvasExtent3d {
    var extent = CanvasExtent3d(width: 0, height: 1, depth_or_array_layers: 1)
    let width, height, depth: Any?
    if let array = value as? JSArrayProtocol {
        width = array.jsLength > 0 ? jsFlat(array.jsElement(at: 0)) : nil
        height = array.jsLength > 1 ? jsFlat(array.jsElement(at: 1)) : nil
        depth = array.jsLength > 2 ? jsFlat(array.jsElement(at: 2)) : nil
    } else if gpuIsObject(value) {
        width = gpuMember(value, "width")
        height = gpuMember(value, "height")
        depth = gpuMember(value, "depthOrArrayLayers")
    } else {
        return extent
    }
    if gpuIsUint32(width) { extent.width = gpuUint32(width) }
    if gpuIsUint32(height) { extent.height = gpuUint32(height) }
    if gpuIsUint32(depth) { extent.depth_or_array_layers = gpuUint32(depth) }
    return extent
}

/// `ParseColor`: an array or a `{ r, g, b, a }` of numbers, missing ones 0; none for anything else.
func gpuColor(_ value: Any?) -> CanvasOptionalColor {
    var color = CanvasOptionalColor()
    color.tag = CanvasOptionalColorNone
    let r, g, b, a: Any?
    if let array = value as? JSArrayProtocol {
        r = array.jsLength > 0 ? jsFlat(array.jsElement(at: 0)) : nil
        g = array.jsLength > 1 ? jsFlat(array.jsElement(at: 1)) : nil
        b = array.jsLength > 2 ? jsFlat(array.jsElement(at: 2)) : nil
        a = array.jsLength > 3 ? jsFlat(array.jsElement(at: 3)) : nil
    } else if gpuIsObject(value) {
        r = gpuMember(value, "r")
        g = gpuMember(value, "g")
        b = gpuMember(value, "b")
        a = gpuMember(value, "a")
    } else {
        return color
    }
    color.tag = CanvasOptionalColorSome
    color.some = CanvasColor(r: (r as? Double) ?? 0, g: (g as? Double) ?? 0, b: (b as? Double) ?? 0, a: (a as? Double) ?? 0)
    return color
}

/// An `{ x, y, z }` origin, each read only when a uint32.
func gpuOrigin3d(_ value: Any?) -> CanvasOrigin3d {
    var origin = CanvasOrigin3d(x: 0, y: 0, z: 0)
    guard gpuIsObject(value) else { return origin }
    let x = gpuMember(value, "x"), y = gpuMember(value, "y"), z = gpuMember(value, "z")
    if gpuIsUint32(x) { origin.x = gpuUint32(x) }
    if gpuIsUint32(y) { origin.y = gpuUint32(y) }
    if gpuIsUint32(z) { origin.z = gpuUint32(z) }
    return origin
}

func gpuTextureAspect(_ value: Any?) -> CanvasTextureAspect {
    switch value as? String {
    case "stencil-only": return CanvasTextureAspectStencilOnly
    case "depth-only": return CanvasTextureAspectDepthOnly
    default: return CanvasTextureAspectAll
    }
}

/// A `{ texture, mipLevel, origin, aspect }` image copy destination or source.
func gpuImageCopyTexture(_ value: Any?) -> CanvasImageCopyTexture {
    let mipLevel = gpuMember(value, "mipLevel")
    return CanvasImageCopyTexture(
        texture: (gpuMember(value, "texture") as? GPUTextureHost)?.texture,
        mip_level: gpuIsUint32(mipLevel) ? gpuUint32(mipLevel) : 0,
        origin: gpuOrigin3d(gpuMember(value, "origin")),
        aspect: gpuTextureAspect(gpuMember(value, "aspect")))
}

/// A `{ buffer, offset, bytesPerRow, rowsPerImage }` image copy buffer.
func gpuImageCopyBuffer(_ value: Any?) -> CanvasImageCopyBuffer {
    let rowsPerImage = gpuMember(value, "rowsPerImage")
    let offset = gpuMember(value, "offset")
    return CanvasImageCopyBuffer(
        buffer: (gpuMember(value, "buffer") as? GPUBufferHost)?.buffer,
        offset: (offset as? Double).map { UInt64(bitPattern: gpuInt64($0)) } ?? 0,
        bytes_per_row: gpuInt32(gpuMember(value, "bytesPerRow")),
        rows_per_image: gpuIsInt32(rowsPerImage) ? gpuInt32(rowsPerImage) : -1)
}

/// `setBindGroup(index, group, dynamicOffsets?, start?, length?)` of the three encoders: the
/// offsets are read from a Uint32Array only.
func gpuSetBindGroup(_ args: Args, _ set: (UInt32, OpaquePointer?, UnsafePointer<UInt32>?, UInt, UInt, UInt) -> Void) {
    let index = gpuUint32(args[0])
    let group = (args[1] as? GPUBindGroupHost)?.group
    if let bytes = gpuTypedArray(args[2], "Uint32Array") {
        set(index, group, bytes.baseAddress.map { UnsafePointer($0.assumingMemoryBound(to: UInt32.self)) },
            UInt(bytes.count / 4), gpuSize(args.number(3)), gpuSize(args.number(4)))
    } else {
        set(index, group, nil, 0, 0, 0)
    }
}

/// `setIndexBuffer(buffer, format, offset?, size?)`: the format as 0 (uint16) / 1 (uint32) or its name.
func gpuSetIndexBuffer(_ args: Args, _ set: (OpaquePointer?, CanvasIndexFormat, Int64, Int64) -> Void) {
    guard let buffer = args[0] as? GPUBufferHost else { return }
    let formatValue = args[1]
    let offset = (args[2] as? Double).map(gpuInt64) ?? -1
    let size = (args[3] as? Double).map(gpuInt64) ?? -1
    if gpuIsUint32(formatValue), let d = formatValue as? Double {
        set(buffer.buffer, d == 0 ? CanvasIndexFormatUint16 : CanvasIndexFormatUint32, offset, size)
        return
    }
    switch gpuString(formatValue) {
    case "uint16": set(buffer.buffer, CanvasIndexFormatUint16, offset, size)
    case "uint32": set(buffer.buffer, CanvasIndexFormatUint32, offset, size)
    default: break
    }
}

// MARK: - Base class

/// A WebGPU object. V8 defines some of its properties lazily: read from the native object the
/// first time, then held as plain data that script may overwrite.
class GPUObjectHost: CanvasHost {
    private var cached: [String: GPUCachedValue] = [:]

    class var lazyProperties: Set<String> { GPUObjectHost.labelOnly }
    static let labelOnly: Set<String> = ["label"]

    /// The value of a lazy property, read the first time it is.
    func readLazy(_ key: String) -> Any? { nil }

    override func get(_ key: String) -> Any?? {
        guard Self.lazyProperties.contains(key) else { return nil }
        if let hit = cached[key] { return .some(hit.value) }
        let value = readLazy(key)
        cached[key] = GPUCachedValue(value: value)
        return .some(value)
    }

    override func set(_ key: String, _ value: Any?) throws -> Bool {
        guard Self.lazyProperties.contains(key) else { return false }
        cached[key] = GPUCachedValue(value: value)
        return true
    }
}

struct GPUCachedValue {
    let value: Any?
}
