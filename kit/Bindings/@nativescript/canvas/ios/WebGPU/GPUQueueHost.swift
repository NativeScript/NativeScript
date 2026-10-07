import Foundation
import NativeScriptKit
import CanvasNative

/// A host object of another area that `GPUQueue.copyExternalImageToTexture` copies from.
// CROSS-AREA: ImageBitmap and ImageAsset (`.imageAsset`), ImageData (`.imageData`),
// CanvasRenderingContext2D (`.context2D`) and the WebGL contexts (`.webgl`) conform in their own areas.
protocol GPUImageCopySource: AnyObject {
    var gpuImageCopySource: GPUImageSource { get }
}

/// The native object a copy source holds, as `canvas_native.h` types it.
enum GPUImageSource {
    /// `const ImageAsset *`
    case imageAsset(OpaquePointer?)
    /// `const ImageData *`
    case imageData(OpaquePointer?)
    /// `const CanvasRenderingContext2D *`
    case context2D(OpaquePointer?)
    /// `const WebGLState *`
    case webgl(OpaquePointer?)
}

/// `GPUQueue`.
final class GPUQueueHost: GPUObjectHost {
    let queue: OpaquePointer

    override class var className: String? { "GPUQueue" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["copyExternalImageToTexture", "submit", "onSubmittedWorkDone", "writeBuffer", "writeTexture"]

    init(_ queue: OpaquePointer) { self.queue = queue }
    deinit { canvas_native_webgpu_queue_release(queue) }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_queue_get_label(queue)) ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "writeBuffer":
            writeBuffer(args)
        case "submit":
            guard let commands = args[0] as? JSArrayProtocol else { return .some(nil) }
            let count = commands.jsLength
            if count == 1 {
                var buffer = (jsFlat(commands.jsElement(at: 0)) as? GPUCommandBufferHost)?.commandBuffer
                let size: UInt = buffer == nil ? 0 : 1
                canvas_native_webgpu_queue_submit(queue, &buffer, size)
            } else {
                var buffers: [OpaquePointer?] = []
                buffers.reserveCapacity(count)
                for i in 0..<count {
                    if let buffer = (jsFlat(commands.jsElement(at: i)) as? GPUCommandBufferHost)?.commandBuffer { buffers.append(buffer) }
                }
                buffers.withUnsafeBufferPointer { canvas_native_webgpu_queue_submit(queue, $0.baseAddress, UInt($0.count)) }
            }
        case "onSubmittedWorkDone":
            let callback = args[0]
            let box = GPUCallbackBox<(UnsafeMutablePointer<CChar>?) -> Void> { error in
                _ = gpuOwnedString(error)
                gpuMainTask { gpuCall(callback, []) }
            }
            canvas_native_webgpu_queue_on_submitted_work_done(queue, { error, data in
                GPUCallbackBox<(UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(error)
            }, box.retained())
        case "writeTexture":
            writeTexture(args)
        case "copyExternalImageToTexture":
            copyExternalImageToTexture(args)
        default:
            return nil
        }
        return .some(nil)
    }

    /// `writeBuffer(buffer, bufferOffset, data, dataOffset, size?)`: data is a typed array or an
    /// ArrayBuffer, offsets and size in bytes; a negative size writes to the end.
    private func writeBuffer(_ args: Args) {
        guard gpuIsObject(args[0]) else { return }
        let buffer = args[0] as? GPUBufferHost
        let bufferOffset = gpuUInt64(args.number(1))
        guard let bytes = gpuBufferBytes(args[2]) else { return }
        let dataOffset = UInt(gpuUInt64(args.number(3)))
        guard let buffer else { return }
        let data = bytes.baseAddress?.assumingMemoryBound(to: UInt8.self)
        if let size = args[4] as? Double, gpuInt64(size) >= 0 {
            canvas_native_webgpu_queue_write_buffer_size(queue, buffer.buffer, bufferOffset, data, UInt(bytes.count), dataOffset, UInt(gpuInt64(size)))
        } else {
            canvas_native_webgpu_queue_write_buffer(queue, buffer.buffer, bufferOffset, data, UInt(bytes.count), dataOffset)
        }
    }

    /// `writeTexture(destination, data, dataLayout, size)`.
    private func writeTexture(_ args: Args) {
        guard gpuIsObject(args[0]), gpuIsObject(args[1]), gpuIsObject(args[2]), gpuIsObject(args[3]) else { return }
        var destination = gpuImageCopyTexture(args[0])
        guard let bytes = (args[1] as? JSBufferSource)?.jsBytes else { return }
        let layoutValue = args[2]
        var layout = CanvasImageDataLayout(offset: 0, bytes_per_row: -1, rows_per_image: -1)
        if let offset = gpuMember(layoutValue, "offset") as? Double { layout.offset = UInt64(bitPattern: gpuInt64(offset)) }
        let bytesPerRow = gpuMember(layoutValue, "bytesPerRow")
        if gpuIsInt32(bytesPerRow) { layout.bytes_per_row = gpuInt32(bytesPerRow) }
        let rowsPerImage = gpuMember(layoutValue, "rowsPerImage")
        if gpuIsInt32(rowsPerImage) { layout.rows_per_image = gpuInt32(rowsPerImage) }
        var size = gpuExtent3d(args[3])
        canvas_native_webgpu_queue_write_texture(
            queue, &destination, &layout, &size, bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count))
    }

    /// `copyExternalImageToTexture({ source, origin?, flipY?, nativeTexture?, width?, height? }, destination, size)`.
    /// A `nativeTexture` (a GPU video frame, as a number) wins over `source`.
    private func copyExternalImageToTexture(_ args: Args) {
        let sourceValue = args[0], destinationValue = args[1], sizeValue = args[2]
        guard gpuIsObject(sourceValue), gpuIsObject(destinationValue), gpuIsObject(sizeValue) else { return }

        let image = (gpuMember(sourceValue, "source") as? GPUImageCopySource)?.gpuImageCopySource
        var width: UInt32 = 0
        var height: UInt32 = 0
        var nativeTexture: UnsafeMutableRawPointer?
        if let d = gpuMember(sourceValue, "nativeTexture") as? Double {
            nativeTexture = UnsafeMutableRawPointer(bitPattern: UInt(gpuUInt64(d)))
            let w = gpuMember(sourceValue, "width"), h = gpuMember(sourceValue, "height")
            if gpuIsUint32(w) { width = gpuUint32(w) }
            if gpuIsUint32(h) { height = gpuUint32(h) }
        }
        if image == nil && nativeTexture == nil { return }

        var origin = CanvasOrigin2d(x: 0, y: 0)
        let originValue = gpuMember(sourceValue, "origin")
        if gpuIsObject(originValue) {
            let x = gpuMember(originValue, "x"), y = gpuMember(originValue, "y")
            if gpuIsUint32(x) { origin.x = gpuUint32(x) }
            if gpuIsUint32(y) { origin.y = gpuUint32(y) }
        }
        let flipY = (gpuMember(sourceValue, "flipY") as? Bool) ?? false
        var destination = gpuImageCopyTexture(destinationValue)
        var extent = gpuExtent3d(sizeValue)

        if nativeTexture != nil {
            _ = canvas_native_webgpu_queue_copy_native_texture_to_texture(
                queue, nativeTexture, width, height, origin.x, origin.y, flipY, &destination, &extent)
            return
        }
        switch image {
        case let .imageAsset(asset)?:
            var source = CanvasImageCopyImageAsset(source: asset, origin: origin, flip_y: flipY)
            canvas_native_webgpu_queue_copy_image_asset_to_texture(queue, &source, &destination, &extent)
        case let .context2D(context)?:
            var source = CanvasImageCopyCanvasRenderingContext2D(source: context, origin: origin, flip_y: flipY)
            canvas_native_webgpu_queue_copy_context_to_texture(queue, &source, &destination, &extent)
        case let .webgl(state)?:
            var source = CanvasImageCopyWebGL(source: state, origin: origin, flip_y: flipY)
            canvas_native_webgpu_queue_copy_webgl_to_texture(queue, &source, &destination, &extent)
        case let .imageData(imageData)?:
            guard let imageData, let pixels = canvas_native_image_data_get_data(imageData) else { return }
            defer { canvas_native_u8_buffer_release(pixels) }
            let data = canvas_native_u8_buffer_get_bytes(pixels)
            let size = canvas_native_u8_buffer_get_length(pixels)
            guard data != nil, size > 0 else { return }
            var source = CanvasImageCopyExternalImage(
                source: data, source_size: size, origin: origin, flip_y: flipY,
                width: UInt32(bitPattern: canvas_native_image_data_get_width(imageData)),
                height: UInt32(bitPattern: canvas_native_image_data_get_height(imageData)))
            canvas_native_webgpu_queue_copy_external_image_to_texture(queue, &source, &destination, &extent)
        case nil:
            break
        }
    }
}
