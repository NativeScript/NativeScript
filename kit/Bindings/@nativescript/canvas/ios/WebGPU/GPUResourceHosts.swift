import Foundation
import NativeScriptKit
import CanvasNative

/// `GPUBuffer`.
final class GPUBufferHost: GPUObjectHost {
    let buffer: OpaquePointer
    /// Ranges handed out by `getMappedRange`, as copies, and where each came from.
    private var mappedRanges: [(copy: JSArrayBuffer, source: UnsafeMutableRawPointer)] = []
    /// Whether the mapping is writable, so `unmap` writes the copies back.
    private var mappedForWrite: Bool

    override class var className: String? { "GPUBuffer" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["destroy", "mapAsync", "unmap", "getMappedRange"]
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["usage", "size", "label"]

    init(_ buffer: OpaquePointer, mappedForWrite: Bool = false) {
        self.buffer = buffer
        self.mappedForWrite = mappedForWrite
    }
    deinit { canvas_native_webgpu_buffer_release(buffer) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "usage": return Double(canvas_native_webgpu_buffer_usage(buffer))
        case "size": return Double(canvas_native_webgpu_buffer_size(buffer))
        case "label": return gpuOwnedString(canvas_native_webgpu_buffer_get_label(buffer)) ?? ""
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "destroy":
            canvas_native_webgpu_buffer_destroy(buffer)
            return .some(nil)
        case "unmap":
            if mappedForWrite {
                for range in mappedRanges {
                    if let copy = range.copy.jsBytes.baseAddress { range.source.copyMemory(from: copy, byteCount: range.copy.count) }
                }
            }
            mappedRanges.removeAll()
            canvas_native_webgpu_buffer_unmap(buffer)
            return .some(nil)
        case "mapAsync":
            return .some(mapAsync(args))
        case "getMappedRange":
            return .some(getMappedRange(args))
        default:
            return nil
        }
    }

    /// `mapAsync(mode, offset?, size?)`: a promise of undefined, rejected with the error's message.
    private func mapAsync(_ args: Args) -> JSPromise<Any?> {
        let mode = args.int32(0)
        let offset = (args[1] as? Double).map(gpuInt64) ?? -1
        let size = (args[2] as? Double).map(gpuInt64) ?? -1
        let (promise, resolve, reject) = JSPromise<Any?>.withResolvers()
        mappedForWrite = mode != 1
        let box = GPUCallbackBox<(UnsafeMutablePointer<CChar>?) -> Void> { error in
            let message = gpuOwnedString(error)
            gpuMainTask {
                if let message { reject(JSError(message)) } else { resolve(nil) }
            }
        }
        canvas_native_webgpu_buffer_map_async(buffer, mode == 1 ? GPUMapModeRead : GPUMapModeWrite, offset, size, { _, error, data in
            GPUCallbackBox<(UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(error)
        }, box.retained())
        return promise
    }

    /// `getMappedRange(offset?, size?)`: an ArrayBuffer of the mapped bytes, empty when nothing is mapped.
    private func getMappedRange(_ args: Args) -> JSArrayBuffer {
        let offset = (args[0] as? Double).map(gpuInt64) ?? -1
        var size = (args[1] as? Double).map(gpuInt64) ?? -1
        guard let bytes = canvas_native_webgpu_buffer_get_mapped_range(buffer, offset, size) else {
            return JSArrayBuffer(data: Data())
        }
        if size < 0 { size = Int64(canvas_native_webgpu_buffer_size(buffer)) - max(offset, 0) }
        // RUNTIME: the range should be an ArrayBuffer over the mapped memory itself; until the
        // runtime can make one, script gets a copy that `unmap` writes back.
        let copy = JSArrayBuffer(data: Data(bytes: bytes, count: Int(max(size, 0))))
        mappedRanges.append((copy, bytes))
        return copy
    }
}

/// `GPUTexture`.
final class GPUTextureHost: GPUObjectHost {
    private(set) var texture: OpaquePointer?

    override class var className: String? { "GPUTexture" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["destroy", "__releaseHandle", "createView"]
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = [
        "label", "width", "height", "format", "usage", "depthOrArrayLayers", "dimension", "sampleCount", "mipLevelCount",
    ]

    init(_ texture: OpaquePointer) { self.texture = texture }
    deinit { if let texture { canvas_native_webgpu_texture_release(texture) } }

    override func readLazy(_ key: String) -> Any? {
        guard let texture else {
            switch key {
            case "label": return ""
            case "format", "dimension": return nil
            default: return 0.0
            }
        }
        switch key {
        case "label": return gpuOwnedString(canvas_native_webgpu_texture_get_label(texture)) ?? ""
        case "width": return Double(canvas_native_webgpu_texture_get_width(texture))
        case "height": return Double(canvas_native_webgpu_texture_get_height(texture))
        case "format": return gpuTextureFormatName(canvas_native_webgpu_texture_get_format(texture))
        case "usage": return Double(canvas_native_webgpu_texture_get_usage(texture))
        case "depthOrArrayLayers": return Double(canvas_native_webgpu_texture_get_depth_or_array_layers(texture))
        case "sampleCount": return Double(canvas_native_webgpu_texture_get_sample_count(texture))
        case "mipLevelCount": return Double(canvas_native_webgpu_texture_get_mip_level_count(texture))
        case "dimension":
            switch canvas_native_webgpu_texture_get_dimension(texture) {
            case CanvasTextureDimensionD1: return "1d"
            case CanvasTextureDimensionD2: return "2d"
            case CanvasTextureDimensionD3: return "3d"
            default: return nil
            }
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "destroy":
            if let texture { canvas_native_webgpu_texture_destroy(texture) }
            return .some(nil)
        case "__releaseHandle":
            if let texture { canvas_native_webgpu_texture_release(texture) }
            texture = nil
            return .some(nil)
        case "createView":
            return .some(createView(args[0]))
        default:
            return nil
        }
    }

    /// `createView(descriptor?)`. The descriptor's `aspect` is read but the view covers all aspects.
    private func createView(_ descriptorValue: Any?) -> Any? {
        guard gpuIsObject(descriptorValue) else {
            return canvas_native_webgpu_texture_create_texture_view(texture, nil).map(GPUTextureViewHost.init)
        }
        var range = CanvasImageSubresourceRange(
            aspect: CanvasTextureAspectAll, base_mip_level: 0, mip_level_count: -1, base_array_layer: 0, array_layer_count: -1)
        let arrayLayerCount = gpuMember(descriptorValue, "arrayLayerCount")
        if gpuIsInt32(arrayLayerCount) { range.array_layer_count = gpuInt32(arrayLayerCount) }
        let mipLevelCount = gpuMember(descriptorValue, "mipLevelCount")
        if gpuIsInt32(mipLevelCount) { range.mip_level_count = gpuInt32(mipLevelCount) }
        let baseArrayLayer = gpuMember(descriptorValue, "baseArrayLayer")
        if gpuIsUint32(baseArrayLayer) { range.base_array_layer = gpuUint32(baseArrayLayer) }
        let baseMipLevel = gpuMember(descriptorValue, "baseMipLevel")
        if gpuIsUint32(baseMipLevel) { range.base_mip_level = gpuUint32(baseMipLevel) }

        var format = CanvasOptionalGPUTextureFormat()
        format.tag = CanvasOptionalGPUTextureFormatNone
        let formatName = gpuString(gpuMember(descriptorValue, "format"))
        if !formatName.isEmpty { format = canvas_native_webgpu_enum_string_to_gpu_texture(formatName) }

        var dimension = CanvasOptionalTextureViewDimensionNone
        switch gpuString(gpuMember(descriptorValue, "dimension")) {
        case "1d": dimension = CanvasOptionalTextureViewDimensionD1
        case "2d": dimension = CanvasOptionalTextureViewDimensionD2
        case "2d-array": dimension = CanvasOptionalTextureViewDimensionD2Array
        case "cube": dimension = CanvasOptionalTextureViewDimensionCube
        case "cube-array": dimension = CanvasOptionalTextureViewDimensionCubeArray
        case "3d": dimension = CanvasOptionalTextureViewDimensionD3
        default: break
        }
        let usageValue = gpuMember(descriptorValue, "usage")
        let usage = gpuIsUint32(usageValue) ? gpuUint32(usageValue) : 0
        let view = withUnsafePointer(to: &range) { range in
            gpuWithCString(gpuLabel(gpuMember(descriptorValue, "label"))) { label in
                var descriptor = CanvasCreateTextureViewDescriptor(label: label, format: format, dimension: dimension, range: range, usage: usage)
                return canvas_native_webgpu_texture_create_texture_view(texture, &descriptor)
            }
        }
        return view.map(GPUTextureViewHost.init)
    }
}

/// `GPUTextureView`.
final class GPUTextureViewHost: GPUObjectHost {
    private(set) var view: OpaquePointer?

    override class var className: String? { "GPUTextureView" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["destroy"]

    init(_ view: OpaquePointer) { self.view = view }
    deinit { if let view { canvas_native_webgpu_texture_view_release(view) } }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? view.flatMap { gpuOwnedString(canvas_native_webgpu_texture_view_get_label($0)) } ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "destroy" else { return nil }
        if let view { canvas_native_webgpu_texture_view_release(view) }
        view = nil
        return .some(nil)
    }
}

/// `GPUSampler`.
final class GPUSamplerHost: GPUObjectHost {
    let sampler: OpaquePointer
    override class var className: String? { "GPUSampler" }
    init(_ sampler: OpaquePointer) { self.sampler = sampler }
    deinit { canvas_native_webgpu_sampler_release(sampler) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_sampler_get_label(sampler)) ?? "" : nil
    }
}

/// `GPUExternalTexture`.
final class GPUExternalTextureHost: GPUObjectHost {
    let texture: OpaquePointer
    override class var className: String? { "GPUExternalTexture" }
    init(_ texture: OpaquePointer) { self.texture = texture }
    deinit { canvas_native_webgpu_external_texture_release(texture) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_external_texture_get_label(texture)) ?? "" : nil
    }
}

/// `GPUShaderModule`.
final class GPUShaderModuleHost: GPUObjectHost {
    let module: OpaquePointer

    override class var className: String? { "GPUShaderModule" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["getCompilationInfo"]

    init(_ module: OpaquePointer) { self.module = module }
    deinit { canvas_native_webgpu_shader_module_release(module) }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_shader_module_get_label(module)) ?? "" : nil
    }

    /// `getCompilationInfo()`: a promise already resolved with the module's `GPUCompilationInfo`.
    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "getCompilationInfo" else { return nil }
        let (promise, resolve, _) = JSPromise<Any?>.withResolvers()
        resolve(GPUCompilationInfoHost(canvas_native_webgpu_device_create_shader_module_get_compilation_info(module)))
        return .some(promise)
    }
}

/// `GPUCompilationInfo`.
final class GPUCompilationInfoHost: GPUObjectHost {
    let info: OpaquePointer?

    override class var className: String? { "GPUCompilationInfo" }
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["messages"]

    init(_ info: OpaquePointer?) { self.info = info }
    deinit { if let info { canvas_native_webgpu_compilation_info_release(info) } }

    override func readLazy(_ key: String) -> Any? {
        guard key == "messages", let info else { return JSArray<Any?>() }
        let count = Int(canvas_native_webgpu_compilation_info_get_messages_count(info))
        return JSArray<Any?>((0..<count).map { i in
            canvas_native_webgpu_compilation_info_get_message_at(info, UInt(i)).map(GPUCompilationMessageHost.init)
        })
    }
}

/// `GPUCompilationMessage`.
final class GPUCompilationMessageHost: GPUObjectHost {
    let message: OpaquePointer

    override class var className: String? { "GPUCompilationMessage" }
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["length", "lineNum", "linePos", "message", "offset", "type"]

    init(_ message: OpaquePointer) { self.message = message }
    deinit { canvas_native_webgpu_compilation_message_release(message) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "length": return Double(canvas_native_webgpu_compilation_message_get_length(message))
        case "lineNum": return Double(canvas_native_webgpu_compilation_message_get_line_num(message))
        case "linePos": return Double(canvas_native_webgpu_compilation_message_get_line_pos(message))
        case "offset": return Double(canvas_native_webgpu_compilation_message_get_offset(message))
        case "message": return canvas_native_webgpu_compilation_message_get_message(message).map { String(cString: $0) } ?? ""
        case "type":
            switch canvas_native_webgpu_compilation_message_get_type(message) {
            case CanvasGPUCompilationMessageTypeInfo: return "info"
            case CanvasGPUCompilationMessageTypeWarning: return "warning"
            case CanvasGPUCompilationMessageTypeError: return "error"
            default: return nil
            }
        default: return nil
        }
    }
}

/// `GPUBindGroup`.
final class GPUBindGroupHost: GPUObjectHost {
    let group: OpaquePointer
    override class var className: String? { "GPUBindGroup" }
    init(_ group: OpaquePointer) { self.group = group }
    deinit { canvas_native_webgpu_bind_group_release(group) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_bind_group_get_label(group)) ?? "" : nil
    }
}

/// `GPUBindGroupLayout`.
final class GPUBindGroupLayoutHost: GPUObjectHost {
    let layout: OpaquePointer
    override class var className: String? { "GPUBindGroupLayout" }
    init(_ layout: OpaquePointer) { self.layout = layout }
    deinit { canvas_native_webgpu_bind_group_layout_release(layout) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_bind_group_layout_get_label(layout)) ?? "" : nil
    }
}

/// `GPUPipelineLayout`.
final class GPUPipelineLayoutHost: GPUObjectHost {
    let layout: OpaquePointer
    override class var className: String? { "GPUPipelineLayout" }
    init(_ layout: OpaquePointer) { self.layout = layout }
    deinit { canvas_native_webgpu_pipeline_layout_release(layout) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_pipeline_layout_get_label(layout)) ?? "" : nil
    }
}

/// `GPURenderPipeline`.
final class GPURenderPipelineHost: GPUObjectHost {
    let pipeline: OpaquePointer

    override class var className: String? { "GPURenderPipeline" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["getBindGroupLayout"]

    init(_ pipeline: OpaquePointer) { self.pipeline = pipeline }
    deinit { canvas_native_webgpu_render_pipeline_release(pipeline) }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_render_pipeline_get_label(pipeline)) ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "getBindGroupLayout" else { return nil }
        return .some(canvas_native_webgpu_render_pipeline_get_bind_group_layout(pipeline, args.uint32(0)).map(GPUBindGroupLayoutHost.init))
    }
}

/// `GPUComputePipeline`.
final class GPUComputePipelineHost: GPUObjectHost {
    let pipeline: OpaquePointer

    override class var className: String? { "GPUComputePipeline" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["getBindGroupLayout"]

    init(_ pipeline: OpaquePointer) { self.pipeline = pipeline }
    deinit { canvas_native_webgpu_compute_pipeline_release(pipeline) }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_compute_pipeline_get_label(pipeline)) ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "getBindGroupLayout" else { return nil }
        return .some(canvas_native_webgpu_compute_pipeline_get_bind_group_layout(pipeline, args.uint32(0)).map(GPUBindGroupLayoutHost.init))
    }
}

/// `GPUQuerySet`.
final class GPUQuerySetHost: GPUObjectHost {
    let querySet: OpaquePointer

    override class var className: String? { "GPUQuerySet" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["destroy"]
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["count", "type", "label"]

    init(_ querySet: OpaquePointer) { self.querySet = querySet }
    deinit { canvas_native_webgpu_query_set_release(querySet) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "count": return Double(canvas_native_webgpu_query_set_get_count(querySet))
        case "label": return gpuOwnedString(canvas_native_webgpu_query_set_get_label(querySet)) ?? ""
        case "type":
            switch canvas_native_webgpu_query_set_get_type(querySet) {
            case CanvasQueryTypeOcclusion: return "occlusion"
            case CanvasQueryTypeTimestamp: return "timestamp"
            default: return ""
            }
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "destroy" else { return nil }
        canvas_native_webgpu_query_set_destroy(querySet)
        return .some(nil)
    }
}

/// `GPURenderBundle`.
final class GPURenderBundleHost: GPUObjectHost {
    let bundle: OpaquePointer
    override class var className: String? { "GPURenderBundle" }
    init(_ bundle: OpaquePointer) { self.bundle = bundle }
    deinit { canvas_native_webgpu_render_bundle_release(bundle) }
    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_render_bundle_get_label(bundle)) ?? "" : nil
    }
}

/// `GPUCommandBuffer`.
final class GPUCommandBufferHost: GPUObjectHost {
    private(set) var commandBuffer: OpaquePointer?

    override class var className: String? { "GPUCommandBuffer" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["destroy"]

    init(_ commandBuffer: OpaquePointer) { self.commandBuffer = commandBuffer }
    deinit { if let commandBuffer { canvas_native_webgpu_command_buffer_release(commandBuffer) } }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? commandBuffer.flatMap { gpuOwnedString(canvas_native_webgpu_command_buffer_get_label($0)) } ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "destroy" else { return nil }
        if let commandBuffer { canvas_native_webgpu_command_buffer_release(commandBuffer) }
        commandBuffer = nil
        return .some(nil)
    }
}
