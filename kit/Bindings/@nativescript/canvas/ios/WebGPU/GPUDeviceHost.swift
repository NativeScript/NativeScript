import Foundation
import NativeScriptKit
import CanvasNative

/// `GPUDevice`.
final class GPUDeviceHost: GPUObjectHost {
    let device: OpaquePointer

    override class var className: String? { "GPUDevice" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "createBindGroup", "__getMetalDevicePointer", "createBindGroupLayout", "createBuffer", "createCommandEncoder",
        "createComputePipeline", "createComputePipelineAsync", "createPipelineLayout", "createQuerySet",
        "createRenderBundleEncoder", "createRenderPipeline", "createRenderPipelineAsync", "createSampler",
        "createShaderModule", "createTexture", "importExternalTexture", "destroy", "popErrorScope", "pushErrorScope",
        "setuncapturederror",
    ]
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["label", "features", "queue", "limits", "lost"]

    init(_ device: OpaquePointer) { self.device = device }
    deinit { canvas_native_webgpu_device_release(device) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "label":
            return gpuOwnedString(canvas_native_webgpu_device_get_label(device)) ?? ""
        case "features":
            let features = canvas_native_webgpu_device_get_features(device)
            defer { canvas_native_string_buffer_release(features) }
            return JSSet<Any?>(gpuStrings(features).map { $0 as Any? })
        case "limits":
            return canvas_native_webgpu_device_get_limits(device).map(GPUSupportedLimitsHost.init(limits:))
        case "queue":
            return canvas_native_webgpu_device_get_queue(device).map(GPUQueueHost.init)
        case "lost":
            return lost()
        default:
            return nil
        }
    }

    /// A promise of `{ reason, message }` once the device is lost.
    private func lost() -> JSPromise<Any?> {
        let (promise, resolve, _) = JSPromise<Any?>.withResolvers()
        let box = GPUCallbackBox<(Int32, UnsafeMutablePointer<CChar>?) -> Void> { reason, message in
            let text = gpuOwnedString(message)
            gpuMainTask {
                var entries: [(String, Any?)] = []
                if let text { entries.append(("message", text)) }
                entries.append(("reason", Double(reason)))
                resolve(JSObject(entries))
            }
        }
        canvas_native_webgpu_device_set_lost_callback(device, { reason, message, data in
            GPUCallbackBox<(Int32, UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(reason, message)
        }, box.retained())
        return promise
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "createBindGroup": return .some(createBindGroup(args[0]))
        case "createBindGroupLayout": return .some(createBindGroupLayout(args[0]))
        case "createBuffer": return .some(createBuffer(args[0]))
        case "createCommandEncoder":
            let encoder = gpuWithCString(gpuLabel(args[0])) { canvas_native_webgpu_device_create_command_encoder(device, $0) }
            return .some(encoder.map(GPUCommandEncoderHost.init))
        case "createComputePipeline": return .some(createComputePipeline(args[0], callback: nil))
        case "createComputePipelineAsync": return .some(createComputePipeline(args[0], callback: .some(args[1])))
        case "createPipelineLayout": return .some(createPipelineLayout(args[0]))
        case "createQuerySet": return .some(createQuerySet(args[0]))
        case "createRenderBundleEncoder": return .some(createRenderBundleEncoder(args[0]))
        case "createRenderPipeline": return .some(createRenderPipeline(args[0], callback: nil))
        case "createRenderPipelineAsync": return .some(createRenderPipeline(args[0], callback: .some(args[1])))
        case "createSampler": return .some(createSampler(args[0]))
        case "createShaderModule": return .some(createShaderModule(args[0]))
        case "createTexture": return .some(createTexture(args[0]))
        case "importExternalTexture": return .some(importExternalTexture(args[0]))
        case "__getMetalDevicePointer":
            return .some(Double(UInt(bitPattern: canvas_native_webgpu_device_get_metal_device(device))))
        case "destroy":
            canvas_native_webgpu_device_destroy(device)
            return .some(nil)
        case "popErrorScope":
            popErrorScope(args[0])
            return .some(nil)
        case "pushErrorScope":
            switch gpuString(args[0]) {
            case "internal": canvas_native_webgpu_device_push_error_scope(device, CanvasGPUErrorFilterInternal)
            case "out-of-memory": canvas_native_webgpu_device_push_error_scope(device, CanvasGPUErrorFilterOutOfMemory)
            case "validation": canvas_native_webgpu_device_push_error_scope(device, CanvasGPUErrorFilterValidation)
            default: break
            }
            return .some(nil)
        case "setuncapturederror":
            setUncapturedError(args[0])
            return .some(nil)
        default:
            return nil
        }
    }

    // MARK: Errors

    /// The callback gets `(type, message)` for every error no scope captures, for the device's life.
    private func setUncapturedError(_ callback: Any?) {
        let box = GPUCallbackBox<(CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void> { type, message in
            let arguments = gpuErrorArguments(type, message)
            gpuMainNowOrTask { gpuCall(callback, arguments) }
        }
        canvas_native_webgpu_device_set_uncaptured_error_callback(device, { type, message, data in
            GPUCallbackBox<(CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void>.peek(data)?(type, message)
        }, box.retained())
    }

    private func popErrorScope(_ callback: Any?) {
        let box = GPUCallbackBox<(CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void> { type, message in
            let arguments = gpuErrorArguments(type, message)
            gpuMainNowOrTask { gpuCall(callback, arguments) }
        }
        canvas_native_webgpu_device_pop_error_scope(device, { type, message, data in
            GPUCallbackBox<(CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(type, message)
        }, box.retained())
    }

    // MARK: Resources

    private func createBindGroup(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        let layoutValue = gpuMember(options, "layout")
        let layout = gpuIsObject(layoutValue) ? (layoutValue as? GPUBindGroupLayoutHost)?.layout : nil
        let entries = gpuBindGroupEntries(gpuMember(options, "entries"))
        let group = entries.withUnsafeBufferPointer { entries in
            gpuWithCString(label) {
                canvas_native_webgpu_device_create_bind_group(device, $0, layout, entries.baseAddress, UInt(entries.count))
            }
        }
        return group.map(GPUBindGroupHost.init)
    }

    private func createBindGroupLayout(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        let entries = gpuBindGroupLayoutEntries(gpuMember(options, "entries"))
        let layout = entries.withUnsafeBufferPointer { entries in
            gpuWithCString(label) {
                canvas_native_webgpu_device_create_bind_group_layout(device, $0, entries.baseAddress, UInt(entries.count))
            }
        }
        return layout.map(GPUBindGroupLayoutHost.init)
    }

    private func createBuffer(_ options: Any?) -> Any? {
        var label: String?
        var mappedAtCreation = false
        var size: UInt64 = 0
        var usage: UInt32 = 0
        if gpuIsObject(options) {
            label = gpuLabel(gpuMember(options, "label"))
            mappedAtCreation = jsIsTruthy(gpuMember(options, "mappedAtCreation"))
            if let d = gpuMember(options, "size") as? Double { size = gpuUInt64(d) }
            let usageValue = gpuMember(options, "usage")
            if usageValue is Double { usage = gpuUint32(usageValue) }
        }
        let buffer = gpuWithCString(label) {
            canvas_native_webgpu_device_create_buffer(device, $0, size, usage, mappedAtCreation)
        }
        return buffer.map { GPUBufferHost($0) }
    }

    private func createPipelineLayout(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        guard let layouts = gpuMember(options, "bindGroupLayouts") as? JSArrayProtocol else { return nil }
        let groupLayouts: [OpaquePointer?] = layouts.jsAnyElements.compactMap { (jsFlat($0) as? GPUBindGroupLayoutHost)?.layout }
        let layout = groupLayouts.withUnsafeBufferPointer { layouts in
            gpuWithCString(label) {
                canvas_native_webgpu_device_create_pipeline_layout(device, $0, layouts.baseAddress, UInt(layouts.count))
            }
        }
        return layout.map(GPUPipelineLayoutHost.init)
    }

    private func createQuerySet(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        let type: CanvasQueryType
        switch gpuString(gpuMember(options, "type")) {
        case "occlusion": type = CanvasQueryTypeOcclusion
        case "timestamp": type = CanvasQueryTypeTimestamp
        default: return nil
        }
        let count = gpuUint32(gpuMember(options, "count"))
        let set = gpuWithCString(label) { canvas_native_webgpu_device_create_query_set(device, $0, type, count) }
        return set.map(GPUQuerySetHost.init)
    }

    /// Reads `label`, `colorFormats` and `depthStencilFormat`; the sample count and read-only
    /// flags stay at their defaults.
    private func createRenderBundleEncoder(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        var colorFormats: [CanvasGPUTextureFormat] = []
        if let formats = gpuMember(options, "colorFormats") as? JSArrayProtocol {
            for value in formats.jsAnyElements {
                guard let name = jsFlat(value) as? String else { continue }
                let format = canvas_native_webgpu_enum_string_to_gpu_texture(name)
                if format.tag == CanvasOptionalGPUTextureFormatSome { colorFormats.append(format.some) }
            }
        }
        var depthStencilFormat = CanvasOptionalGPUTextureFormat()
        depthStencilFormat.tag = CanvasOptionalGPUTextureFormatNone
        if let name = gpuMember(options, "depthStencilFormat") as? String {
            depthStencilFormat = canvas_native_webgpu_enum_string_to_gpu_texture(name)
        }
        let encoder = colorFormats.withUnsafeBufferPointer { formats in
            gpuWithCString(label) { label in
                var descriptor = CanvasCreateRenderBundleEncoderDescriptor(
                    label: label, color_formats: formats.baseAddress, color_formats_size: UInt(formats.count),
                    depth_stencil_format: depthStencilFormat, sample_count: 1, depth_read_only: false, stencil_read_only: false)
                return canvas_native_webgpu_device_create_render_bundle_encoder(device, &descriptor)
            }
        }
        return encoder.map(GPURenderBundleEncoderHost.init)
    }

    private func createSampler(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else {
            return canvas_native_webgpu_device_create_sampler(device, nil).map(GPUSamplerHost.init)
        }
        func addressMode(_ key: String) -> CanvasAddressMode {
            switch gpuString(gpuMember(options, key)) {
            case "repeat": return CanvasAddressModeRepeat
            case "mirror-repeat": return CanvasAddressModeMirrorRepeat
            default: return CanvasAddressModeClampToEdge
            }
        }
        func filter(_ key: String) -> CanvasFilterMode {
            gpuString(gpuMember(options, key)) == "linear" ? CanvasFilterModeLinear : CanvasFilterModeNearest
        }
        let label = gpuLabel(gpuMember(options, "label"))
        let lodMinClamp = (gpuMember(options, "lodMinClamp") as? Double).map { Float($0) } ?? 0
        let lodMaxClamp = (gpuMember(options, "lodMaxClamp") as? Double).map { Float($0) } ?? 32
        let maxAnisotropy = (gpuMember(options, "maxAnisotropy") as? Double).map { UInt16(truncatingIfNeeded: gpuInt64($0)) } ?? 1
        let sampler = gpuWithCString(label) { label in
            var descriptor = CanvasCreateSamplerDescriptor(
                label: label,
                address_mode_u: addressMode("addressModeU"), address_mode_v: addressMode("addressModeV"),
                address_mode_w: addressMode("addressModeW"),
                mag_filter: filter("magFilter"), min_filter: filter("minFilter"), mipmap_filter: filter("mipmapFilter"),
                lod_min_clamp: lodMinClamp, lod_max_clamp: lodMaxClamp,
                compare: gpuCanvasOptionalCompare(gpuMember(options, "compare")),
                max_anisotropy: maxAnisotropy)
            return canvas_native_webgpu_device_create_sampler(device, &descriptor)
        }
        return sampler.map(GPUSamplerHost.init)
    }

    private func createShaderModule(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        let code = (gpuMember(options, "code") as? String) ?? ""
        let module = gpuWithCString(label) { label in
            canvas_native_webgpu_device_create_shader_module(device, label, code)
        }
        return module.map(GPUShaderModuleHost.init)
    }

    /// Reads the flat `{ width, height, depthOrArrayLayers, format, usage, … }` the TypeScript builds.
    private func createTexture(_ options: Any?) -> Any? {
        var descriptor = CanvasCreateTextureDescriptor()
        descriptor.dimension = CanvasTextureDimensionD2
        descriptor.depthOrArrayLayers = 1
        descriptor.sampleCount = 1
        descriptor.mipLevelCount = 1
        if gpuIsObject(options) {
            func uint32(_ key: String) -> UInt32? {
                let value = gpuMember(options, key)
                return gpuIsUint32(value) ? gpuUint32(value) : nil
            }
            if let v = uint32("depthOrArrayLayers") { descriptor.depthOrArrayLayers = v }
            if let v = uint32("width") { descriptor.width = v }
            if let v = uint32("height") { descriptor.height = v }
            if let v = uint32("usage") { descriptor.usage = v }
            if let v = uint32("sampleCount") { descriptor.sampleCount = v }
            if let v = uint32("mipLevelCount") { descriptor.mipLevelCount = v }
            switch gpuMember(options, "dimension") as? String {
            case "1d": descriptor.dimension = CanvasTextureDimensionD1
            case "2d": descriptor.dimension = CanvasTextureDimensionD2
            case "3d": descriptor.dimension = CanvasTextureDimensionD3
            default: break
            }
            if let name = gpuMember(options, "format") as? String {
                let format = canvas_native_webgpu_enum_string_to_gpu_texture(name)
                if format.tag == CanvasOptionalGPUTextureFormatSome { descriptor.format = format.some }
            }
        }
        return canvas_native_webgpu_device_create_texture(device, &descriptor).map(GPUTextureHost.init)
    }

    /// `importExternalTexture({ nativeTexture, width, height, label? })`, the frame's texture as a number.
    private func importExternalTexture(_ options: Any?) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let label = gpuLabel(gpuMember(options, "label"))
        let nativeTexture = (gpuMember(options, "nativeTexture") as? Double).flatMap { UnsafeMutableRawPointer(bitPattern: UInt(gpuUInt64($0))) }
        let width = gpuMember(options, "width"), height = gpuMember(options, "height")
        let texture = gpuWithCString(label) {
            canvas_native_webgpu_device_import_external_texture(
                device, $0, nativeTexture, gpuIsUint32(width) ? gpuUint32(width) : 0, gpuIsUint32(height) ? gpuUint32(height) : 0)
        }
        return texture.map(GPUExternalTextureHost.init)
    }

    // MARK: Pipelines

    /// `createComputePipeline(desc)`, or with a callback `createComputePipelineAsync(desc, callback)`,
    /// whose callback gets `(null, pipeline)` or `({ error, type })`.
    private func createComputePipeline(_ options: Any?, callback: Any??) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let arena = GPUArena()
        let label = arena.string(gpuLabel(gpuMember(options, "label")))
        let layout = gpuPipelineLayout(gpuMember(options, "layout"))
        let compute = gpuMember(options, "compute")
        guard gpuIsObject(compute) else { return nil }
        var stage = CanvasProgrammableStage(
            module: (gpuMember(compute, "module") as? GPUShaderModuleHost)?.module,
            entry_point: arena.string(gpuMember(compute, "entryPoint") as? String),
            constants: arena.constants(gpuMember(compute, "constants")))
        guard let callback else {
            return canvas_native_webgpu_device_create_compute_pipeline(device, label, layout, &stage).map(GPUComputePipelineHost.init)
        }
        let box = GPUCallbackBox<(OpaquePointer?, CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void> { pipeline, type, message in
            let text = gpuOwnedString(message)
            gpuMainTask {
                withExtendedLifetime(arena) {}
                gpuPipelineCallback(callback, type, text) { pipeline.map(GPUComputePipelineHost.init) }
            }
        }
        canvas_native_webgpu_device_create_compute_pipeline_async(device, label, layout, &stage, { pipeline, type, message, data in
            GPUCallbackBox<(OpaquePointer?, CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(pipeline, type, message)
        }, box.retained())
        return nil
    }

    /// `createRenderPipeline(desc)`, or with a callback `createRenderPipelineAsync(desc, callback)`.
    private func createRenderPipeline(_ options: Any?, callback: Any??) -> Any? {
        guard gpuIsObject(options) else { return nil }
        let arena = GPUArena()
        guard var descriptor = gpuRenderPipelineDescriptor(options, arena, async: callback != nil) else { return nil }
        guard let callback else {
            return canvas_native_webgpu_device_create_render_pipeline(device, &descriptor).map(GPURenderPipelineHost.init)
        }
        let box = GPUCallbackBox<(OpaquePointer?, CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void> { pipeline, type, message in
            let text = gpuOwnedString(message)
            gpuMainTask {
                withExtendedLifetime(arena) {}
                gpuPipelineCallback(callback, type, text) { pipeline.map(GPURenderPipelineHost.init) }
            }
        }
        canvas_native_webgpu_device_create_render_pipeline_async(device, &descriptor, { pipeline, type, message, data in
            GPUCallbackBox<(OpaquePointer?, CanvasGPUErrorType, UnsafeMutablePointer<CChar>?) -> Void>.take(data)?(pipeline, type, message)
        }, box.retained())
        return nil
    }
}

/// Calls an async pipeline callback: `(null, pipeline)`, or `({ error, type })` on an error.
private func gpuPipelineCallback(_ callback: Any?, _ type: CanvasGPUErrorType, _ message: String?, _ pipeline: () -> Any?) {
    if type != CanvasGPUErrorTypeNone {
        let error = JSObject([("error", JSError(message ?? "")), ("type", Double(type.rawValue))])
        gpuCall(callback, [error])
    } else {
        gpuCall(callback, [jsNull, pipeline()])
    }
}

/// A pipeline's `layout`: a `GPUPipelineLayout`, or `'auto'` for anything else.
private func gpuPipelineLayout(_ value: Any?) -> CanvasGPUPipelineLayoutOrGPUAutoLayoutMode {
    var layout = CanvasGPUPipelineLayoutOrGPUAutoLayoutMode()
    layout.tag = CanvasGPUPipelineLayoutOrGPUAutoLayoutModeAuto
    if gpuIsObject(value), let pipelineLayout = value as? GPUPipelineLayoutHost {
        layout.tag = CanvasGPUPipelineLayoutOrGPUAutoLayoutModeLayout
        layout.layout = pipelineLayout.layout
    }
    return layout
}

/// The render pipeline descriptor in C, its memory in `arena`; nil when a color target's format
/// is unknown. The async variant's multisample state defaults alpha-to-coverage on.
private func gpuRenderPipelineDescriptor(_ options: Any?, _ arena: GPUArena, async: Bool) -> CanvasCreateRenderPipelineDescriptor? {
    var descriptor = CanvasCreateRenderPipelineDescriptor()

    let stencilValue = gpuMember(options, "depthStencil")
    if gpuIsObject(stencilValue) {
        let keep = CanvasStencilFaceState(
            compare: CanvasCompareFunctionAlways, fail_op: CanvasStencilOperationKeep,
            depth_fail_op: CanvasStencilOperationKeep, pass_op: CanvasStencilOperationKeep)
        var stencil = CanvasDepthStencilState()
        stencil.depth_bias = 0
        stencil.depth_bias_clamp = 0
        stencil.depth_bias_slope_scale = 0
        stencil.stencil_read_mask = 0xFFFF_FFFF
        stencil.stencil_write_mask = 0xFFFF_FFFF
        stencil.stencil_front = keep
        stencil.stencil_back = keep
        if let name = gpuMember(stencilValue, "format") as? String {
            let format = canvas_native_webgpu_enum_string_to_gpu_texture(name)
            if format.tag == CanvasOptionalGPUTextureFormatSome { stencil.format = format.some }
        }
        let depthBias = gpuMember(stencilValue, "depthBias")
        if gpuIsInt32(depthBias) { stencil.depth_bias = gpuInt32(depthBias) }
        if let d = gpuMember(stencilValue, "depthBiasClamp") as? Double { stencil.depth_bias_clamp = Float(d) }
        if let d = gpuMember(stencilValue, "depthBiasSlopeScale") as? Double { stencil.depth_bias_slope_scale = Float(d) }
        stencil.depth_compare = gpuCanvasOptionalCompare(gpuMember(stencilValue, "depthCompare"))
        var depthWrite = CanvasOptionalBool()
        depthWrite.tag = CanvasOptionalBoolSome
        depthWrite.some = jsIsTruthy(gpuMember(stencilValue, "depthWriteEnabled"))
        stencil.depth_write_enabled = depthWrite
        func face(_ value: Any?, _ state: inout CanvasStencilFaceState) {
            guard gpuIsObject(value) else { return }
            state.compare = gpuCompareFunction(gpuMember(value, "compare"), state.compare)
            state.depth_fail_op = gpuStencilOperation(gpuMember(value, "depthFailOp"), state.depth_fail_op)
            state.fail_op = gpuStencilOperation(gpuMember(value, "failOp"), state.fail_op)
            state.pass_op = gpuStencilOperation(gpuMember(value, "passOp"), state.pass_op)
        }
        face(gpuMember(stencilValue, "stencilBack"), &stencil.stencil_back)
        face(gpuMember(stencilValue, "stencilFront"), &stencil.stencil_front)
        let readMask = gpuMember(stencilValue, "stencilReadMask")
        if gpuIsUint32(readMask) { stencil.stencil_read_mask = gpuUint32(readMask) }
        let writeMask = gpuMember(stencilValue, "stencilWriteMask")
        if gpuIsUint32(writeMask) { stencil.stencil_write_mask = gpuUint32(writeMask) }
        descriptor.depth_stencil = arena.pointer(to: stencil)
    }

    let fragmentValue = gpuMember(options, "fragment")
    if gpuIsObject(fragmentValue) {
        var fragment = CanvasFragmentState()
        var targets: [CanvasColorTargetState] = []
        let targetValues = (gpuMember(fragmentValue, "targets") as? JSArrayProtocol)?.jsAnyElements ?? []
        for value in targetValues {
            let state = jsFlat(value)
            let format = gpuTextureFormat(gpuMember(state, "format"))
            guard format.tag == CanvasOptionalGPUTextureFormatSome else { return nil }
            let writeMaskValue = gpuMember(state, "writeMask")
            var blend = CanvasOptionalBlendState()
            blend.tag = CanvasOptionalBlendStateNone
            let blendValue = gpuMember(state, "blend")
            if gpuIsObject(blendValue) {
                func component(_ value: Any?) -> CanvasBlendComponent {
                    CanvasBlendComponent(
                        src_factor: gpuBlendFactor(gpuMember(value, "srcFactor"), CanvasBlendFactorZero),
                        dst_factor: gpuBlendFactor(gpuMember(value, "dstFactor"), CanvasBlendFactorZero),
                        operation: gpuBlendOperation(gpuMember(value, "operation"), CanvasBlendOperationAdd))
                }
                blend.tag = CanvasOptionalBlendStateSome
                blend.some = CanvasBlendState(color: component(gpuMember(blendValue, "color")), alpha: component(gpuMember(blendValue, "alpha")))
            }
            targets.append(CanvasColorTargetState(
                format: format.some, blend: blend, write_mask: gpuIsUint32(writeMaskValue) ? gpuUint32(writeMaskValue) : 0xF))
        }
        if !targets.isEmpty {
            fragment.targets = arena.array(targets)
            fragment.targets_size = UInt(targets.count)
        }
        fragment.constants = arena.constants(gpuMember(fragmentValue, "constants"))
        fragment.entry_point = arena.string(gpuMember(fragmentValue, "entryPoint") as? String)
        fragment.module = (gpuMember(fragmentValue, "module") as? GPUShaderModuleHost)?.module
        descriptor.fragment = arena.pointer(to: fragment)
    }

    descriptor.label = arena.string(gpuLabel(gpuMember(options, "label")))
    descriptor.layout = gpuPipelineLayout(gpuMember(options, "layout"))

    let multisampleValue = gpuMember(options, "multisample")
    if gpuIsObject(multisampleValue) {
        var multisample = CanvasMultisampleState(count: 1, mask: 0xFFFF_FFFF, alpha_to_coverage_enabled: async)
        if let b = gpuMember(multisampleValue, "alphaToCoverageEnabled") as? Bool { multisample.alpha_to_coverage_enabled = b }
        let count = gpuMember(multisampleValue, "count")
        if gpuIsUint32(count) { multisample.count = gpuUint32(count) }
        if let mask = gpuMember(multisampleValue, "mask") as? Double { multisample.mask = gpuUInt64(mask) }
        descriptor.multisample = arena.pointer(to: multisample)
    }

    let primitiveValue = gpuMember(options, "primitive")
    if gpuIsObject(primitiveValue) {
        var primitive = CanvasPrimitiveState()
        primitive.cull_mode = CanvasCullModeNone
        primitive.front_face = CanvasFrontFaceCcw
        primitive.strip_index_format.tag = CanvasOptionalIndexFormatNone
        primitive.topology.tag = CanvasOptionalPrimitiveTopologyNone
        primitive.unclipped_depth = false

        let cullMode = gpuMember(primitiveValue, "cullMode")
        if gpuIsUint32(cullMode) {
            switch gpuUint32(cullMode) {
            case 0: primitive.cull_mode = CanvasCullModeNone
            case 1: primitive.cull_mode = CanvasCullModeFront
            case 2: primitive.cull_mode = CanvasCullModeBack
            default: break
            }
        } else if let s = cullMode as? String {
            switch s {
            case "none": primitive.cull_mode = CanvasCullModeNone
            case "front": primitive.cull_mode = CanvasCullModeFront
            case "back": primitive.cull_mode = CanvasCullModeBack
            default: break
            }
        }

        let frontFace = gpuMember(primitiveValue, "frontFace")
        if gpuIsUint32(frontFace) {
            switch gpuUint32(frontFace) {
            case 0: primitive.front_face = CanvasFrontFaceCcw
            case 1: primitive.front_face = CanvasFrontFaceCw
            default: break
            }
        } else if let s = frontFace as? String {
            if s == "ccw" { primitive.front_face = CanvasFrontFaceCcw } else if s == "cw" { primitive.front_face = CanvasFrontFaceCw }
        }

        let stripIndexFormat = gpuMember(primitiveValue, "stripIndexFormat")
        var stripFormat: CanvasIndexFormat?
        if gpuIsUint32(stripIndexFormat) {
            switch gpuUint32(stripIndexFormat) {
            case 0: stripFormat = CanvasIndexFormatUint16
            case 1: stripFormat = CanvasIndexFormatUint32
            default: break
            }
        } else if let s = stripIndexFormat as? String {
            if s == "uint16" { stripFormat = CanvasIndexFormatUint16 } else if s == "uint32" { stripFormat = CanvasIndexFormatUint32 }
        }
        if let stripFormat {
            primitive.strip_index_format.tag = CanvasOptionalIndexFormatSome
            primitive.strip_index_format.some = stripFormat
        }

        let topologyValue = gpuMember(primitiveValue, "topology")
        var topology: CanvasPrimitiveTopology?
        if gpuIsUint32(topologyValue) {
            let n = gpuUint32(topologyValue)
            if n <= 4 { topology = CanvasPrimitiveTopology(rawValue: n) }
        } else if let s = topologyValue as? String {
            switch s {
            case "line-list": topology = CanvasPrimitiveTopologyLineList
            case "line-strip": topology = CanvasPrimitiveTopologyLineStrip
            case "point-list": topology = CanvasPrimitiveTopologyPointList
            case "triangle-list": topology = CanvasPrimitiveTopologyTriangleList
            case "triangle-strip": topology = CanvasPrimitiveTopologyTriangleStrip
            default: break
            }
        }
        if let topology {
            primitive.topology.tag = CanvasOptionalPrimitiveTopologySome
            primitive.topology.some = topology
        }

        if let b = gpuMember(primitiveValue, "unclippedDepth") as? Bool { primitive.unclipped_depth = b }
        descriptor.primitive = arena.pointer(to: primitive)
    }

    let vertexValue = gpuMember(options, "vertex")
    if gpuIsObject(vertexValue) {
        var vertex = CanvasVertexState()
        vertex.module = (gpuMember(vertexValue, "module") as? GPUShaderModuleHost)?.module
        vertex.constants = arena.constants(gpuMember(vertexValue, "constants"))
        if let buffers = gpuMember(vertexValue, "buffers") as? JSArrayProtocol {
            var layouts: [CanvasVertexBufferLayout] = []
            // A buffer without an arrayStride takes the previous buffer's.
            var stride: UInt64 = 0
            for value in buffers.jsAnyElements {
                let buffer = jsFlat(value)
                if let d = gpuMember(buffer, "arrayStride") as? Double { stride = gpuUInt64(d) }
                var attributes: [CanvasVertexAttribute] = []
                if let attributeValues = gpuMember(buffer, "attributes") as? JSArrayProtocol {
                    for attributeValue in attributeValues.jsAnyElements {
                        let attribute = jsFlat(attributeValue)
                        attributes.append(CanvasVertexAttribute(
                            format: CanvasVertexFormat(rawValue: gpuUint32(gpuMember(attribute, "format"))),
                            offset: gpuUInt64(jsToNumber(gpuMember(attribute, "offset"))),
                            shader_location: gpuUint32(gpuMember(attribute, "shaderLocation"))))
                    }
                }
                var stepMode = CanvasVertexStepModeVertex
                let stepModeValue = gpuMember(buffer, "stepMode")
                if gpuIsUint32(stepModeValue) {
                    switch gpuUint32(stepModeValue) {
                    case 0: stepMode = CanvasVertexStepModeVertex
                    case 1: stepMode = CanvasVertexStepModeInstance
                    default: break
                    }
                } else if let s = stepModeValue as? String {
                    if s == "vertex" { stepMode = CanvasVertexStepModeVertex } else if s == "instance" { stepMode = CanvasVertexStepModeInstance }
                }
                layouts.append(CanvasVertexBufferLayout(
                    array_stride: stride, step_mode: stepMode, attributes: arena.array(attributes), attributes_size: UInt(attributes.count)))
            }
            vertex.buffers = arena.array(layouts)
            vertex.buffers_size = UInt(layouts.count)
        }
        vertex.entry_point = arena.string(gpuMember(vertexValue, "entryPoint") as? String)
        descriptor.vertex = arena.pointer(to: vertex)
    }

    return descriptor
}

// MARK: - Bind group entries (GPUUtils.h)

/// `ParseBindGroupEntries`: samplers, texture views, external textures and `{ buffer, offset?, size? }`.
func gpuBindGroupEntries(_ value: Any?) -> [CanvasBindGroupEntry] {
    guard let array = value as? JSArrayProtocol else { return [] }
    var entries: [CanvasBindGroupEntry] = []
    for element in array.jsAnyElements {
        let entry = jsFlat(element)
        guard gpuIsObject(entry) else { continue }
        let binding = gpuUint32(gpuMember(entry, "binding"))
        let resourceValue = gpuMember(entry, "resource")
        var resource = CanvasBindGroupEntryResource()
        switch resourceValue {
        case let sampler as GPUSamplerHost:
            resource.tag = CanvasBindGroupEntryResourceSampler
            resource.sampler = sampler.sampler
        case let view as GPUTextureViewHost:
            resource.tag = CanvasBindGroupEntryResourceTextureView
            resource.texture_view = view.view
        case let texture as GPUExternalTextureHost:
            resource.tag = CanvasBindGroupEntryResourceExternalTexture
            resource.external_texture = texture.texture
        default:
            guard gpuIsObject(resourceValue), let buffer = gpuMember(resourceValue, "buffer") as? GPUBufferHost else { continue }
            let offset = (gpuMember(resourceValue, "offset") as? Double).map(gpuInt64) ?? -1
            let size = (gpuMember(resourceValue, "size") as? Double).map(gpuInt64) ?? -1
            resource.tag = CanvasBindGroupEntryResourceBuffer
            resource.buffer = CanvasBufferBinding(buffer: buffer.buffer, offset: offset, size: size)
        }
        entries.append(CanvasBindGroupEntry(binding: binding, resource: resource))
    }
    return entries
}

/// `ParseBindGroupLayoutEntries`: the first of `buffer`, `externalTexture`, `sampler`,
/// `storageTexture` and `texture` an entry has decides its binding type.
func gpuBindGroupLayoutEntries(_ value: Any?) -> [CanvasBindGroupLayoutEntry] {
    guard let array = value as? JSArrayProtocol else { return [] }
    var entries: [CanvasBindGroupLayoutEntry] = []
    for element in array.jsAnyElements {
        let entry = jsFlat(element)
        guard gpuIsObject(entry) else { continue }
        let binding = gpuUint32(gpuMember(entry, "binding"))
        let visibility = gpuUint32(gpuMember(entry, "visibility"))
        var type = CanvasBindingType()

        let buffer = gpuMember(entry, "buffer")
        if gpuIsObject(buffer) {
            var bufferType = CanvasBufferBindingTypeUniform
            switch gpuMember(buffer, "type") as? String {
            case "read-only-storage": bufferType = CanvasBufferBindingTypeReadOnlyStorage
            case "storage": bufferType = CanvasBufferBindingTypeStorage
            default: break
            }
            let minBindingSize = (gpuMember(buffer, "minBindingSize") as? Double).map(gpuInt64) ?? -1
            type.tag = CanvasBindingTypeBuffer
            type.buffer = CanvasBufferBindingLayout(
                type_: bufferType, has_dynamic_offset: (gpuMember(buffer, "hasDynamicOffset") as? Bool) ?? false,
                min_binding_size: minBindingSize)
            entries.append(CanvasBindGroupLayoutEntry(binding: binding, visibility: visibility, binding_type: type))
            continue
        }

        if gpuIsObject(gpuMember(entry, "externalTexture")) {
            type.tag = CanvasBindingTypeExternalTexture
            entries.append(CanvasBindGroupLayoutEntry(binding: binding, visibility: visibility, binding_type: type))
            continue
        }

        let sampler = gpuMember(entry, "sampler")
        if gpuIsObject(sampler) {
            var samplerType = CanvasSamplerBindingTypeFiltering
            switch gpuMember(sampler, "type") as? String {
            case "comparison": samplerType = CanvasSamplerBindingTypeComparison
            case "non-filtering": samplerType = CanvasSamplerBindingTypeNonFiltering
            default: break
            }
            type.tag = CanvasBindingTypeSampler
            type.sampler = CanvasSamplerBindingLayout(type_: samplerType)
            entries.append(CanvasBindGroupLayoutEntry(binding: binding, visibility: visibility, binding_type: type))
            continue
        }

        let storage = gpuMember(entry, "storageTexture")
        if gpuIsObject(storage) {
            var access = CanvasStorageTextureAccessWriteOnly
            switch gpuMember(storage, "access") as? String {
            case "read-only": access = CanvasStorageTextureAccessReadOnly
            case "read-write": access = CanvasStorageTextureAccessReadWrite
            default: break
            }
            let dimension = gpuTextureViewDimension(gpuMember(storage, "viewDimension"))
            // A storage texture with a format names it or is dropped; without one it falls through to `texture`.
            if let name = gpuMember(storage, "format") as? String {
                let format = canvas_native_webgpu_enum_string_to_gpu_texture(name)
                guard format.tag == CanvasOptionalGPUTextureFormatSome else { continue }
                type.tag = CanvasBindingTypeStorageTexture
                type.storage_texture = CanvasStorageTextureBindingLayout(access: access, format: format.some, view_dimension: dimension)
                entries.append(CanvasBindGroupLayoutEntry(binding: binding, visibility: visibility, binding_type: type))
                continue
            }
        }

        let texture = gpuMember(entry, "texture")
        if gpuIsObject(texture) {
            var sampleType = CanvasTextureSampleTypeFloat
            switch gpuMember(texture, "sampleType") as? String {
            case "depth": sampleType = CanvasTextureSampleTypeDepth
            case "sint": sampleType = CanvasTextureSampleTypeSint
            case "uint": sampleType = CanvasTextureSampleTypeUint
            case "unfilterable-float": sampleType = CanvasTextureSampleTypeUnfilterableFloat
            default: break
            }
            type.tag = CanvasBindingTypeTexture
            type.texture = CanvasTextureBindingLayout(
                sample_type: sampleType, view_dimension: gpuTextureViewDimension(gpuMember(texture, "viewDimension")),
                multisampled: (gpuMember(texture, "multisampled") as? Bool) ?? false)
            entries.append(CanvasBindGroupLayoutEntry(binding: binding, visibility: visibility, binding_type: type))
        }
    }
    return entries
}
