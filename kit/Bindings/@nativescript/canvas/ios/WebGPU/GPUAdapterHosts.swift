import Foundation
import NativeScriptKit
import CanvasNative

/// `GPU`, which `navigator.gpu` wraps: the WebGPU instance.
final class GPUHost: CanvasHost {
    let instance: OpaquePointer?

    override class var className: String? { "GPU" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["__getPointer", "requestAdapter"]

    init(_ args: Args) {
        instance = canvas_native_webgpu_instance_create()
    }

    deinit { if let instance { canvas_native_webgpu_instance_release(instance) } }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "__getPointer":
            return .some(String(canvas_native_webgpu_get_pointer_addr(instance)))
        case "requestAdapter":
            requestAdapter(args)
            return .some(nil)
        default:
            return nil
        }
    }

    /// `requestAdapter(options, callback)`: the callback gets `(null, adapter)`, or `(null)` when there is none.
    private func requestAdapter(_ args: Args) {
        var options = CanvasGPURequestAdapterOptions(
            power_preference: CanvasGPUPowerPreferenceNone, force_fallback_adapter: false, feature_level: CanvasGPUFeatureLevelCore)
        let optionsValue = args[0]
        if gpuIsObject(optionsValue) {
            let power = gpuMember(optionsValue, "powerPreference")
            if power is Double {
                switch gpuInt32(power) {
                case 1: options.power_preference = CanvasGPUPowerPreferenceLowPower
                case 2: options.power_preference = CanvasGPUPowerPreferenceHighPerformance
                default: break
                }
            }
            if gpuMember(optionsValue, "featureLevel") as? String == "compatibility" {
                options.feature_level = CanvasGPUFeatureLevelCompatibility
            }
            options.force_fallback_adapter = jsIsTruthy(gpuMember(optionsValue, "forceFallbackAdapter"))
        }
        let callback = args[1]
        let box = GPUCallbackBox<(OpaquePointer?) -> Void> { adapter in
            gpuMainTask {
                if let adapter {
                    gpuCall(callback, [jsNull, GPUAdapterHost(adapter)])
                } else {
                    gpuCall(callback, [jsNull])
                }
            }
        }
        canvas_native_webgpu_request_adapter(instance, &options, { adapter, data in
            GPUCallbackBox<(OpaquePointer?) -> Void>.take(data)?(adapter)
        }, box.retained())
    }
}

/// `GPUAdapter`.
final class GPUAdapterHost: GPUObjectHost {
    let adapter: OpaquePointer

    override class var className: String? { "GPUAdapter" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = ["requestAdapterInfo", "requestDevice"]
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["features", "isFallbackAdapter", "limits"]

    init(_ adapter: OpaquePointer) { self.adapter = adapter }
    deinit { canvas_native_webgpu_adapter_release(adapter) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "features":
            let features = canvas_native_webgpu_adapter_get_features(adapter)
            defer { canvas_native_string_buffer_release(features) }
            return JSSet<Any?>(gpuStrings(features).map { $0 as Any? })
        case "isFallbackAdapter":
            return canvas_native_webgpu_adapter_is_fallback_adapter(adapter)
        case "limits":
            return canvas_native_webgpu_adapter_get_limits(adapter).map(GPUSupportedLimitsHost.init(limits:))
        default:
            return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "requestAdapterInfo":
            return .some(canvas_native_webgpu_adapter_request_adapter_info(adapter).map(GPUAdapterInfoHost.init))
        case "requestDevice":
            requestDevice(args)
            return .some(nil)
        default:
            return nil
        }
    }

    /// `requestDevice(options, callback)`: the callback gets `(null, device)` or `(error)`.
    private func requestDevice(_ args: Args) {
        let optionsValue = args[0]
        let callback = args[1]
        var label: String?
        var features: [String] = []
        var limits: GPUSupportedLimitsHost?
        if gpuIsObject(optionsValue) {
            label = gpuLabel(gpuMember(optionsValue, "label"))
            if let required = gpuMember(optionsValue, "requiredFeatures") as? JSArrayProtocol {
                for item in required.jsAnyElements { if let s = jsFlat(item) as? String { features.append(s) } }
            }
            let limitsValue = gpuMember(optionsValue, "requiredLimits")
            if gpuIsObject(limitsValue) { limits = limitsValue as? GPUSupportedLimitsHost }
        }
        let arena = GPUArena()
        let featurePointers = features.map { arena.string($0) }
        let box = GPUCallbackBox<(UnsafeMutablePointer<CChar>?, OpaquePointer?) -> Void> { error, device in
            let message = gpuOwnedString(error)
            gpuMainTask {
                withExtendedLifetime((arena, limits)) {}
                if let message {
                    gpuCall(callback, [JSError(message)])
                } else if let device {
                    gpuCall(callback, [jsNull, GPUDeviceHost(device)])
                } else {
                    gpuCall(callback, [JSError("Internal Error")])
                }
            }
        }
        featurePointers.withUnsafeBufferPointer { pointers in
            gpuWithCString(label) { label in
                canvas_native_webgpu_adapter_request_device(
                    adapter, label, pointers.isEmpty ? nil : pointers.baseAddress, UInt(pointers.count),
                    limits.flatMap { UnsafePointer($0.limits) }, { error, device, data in
                        GPUCallbackBox<(UnsafeMutablePointer<CChar>?, OpaquePointer?) -> Void>.take(data)?(error, device)
                    }, box.retained())
            }
        }
    }
}

/// `GPUAdapterInfo`.
final class GPUAdapterInfoHost: GPUObjectHost {
    let info: OpaquePointer

    override class var className: String? { "GPUAdapterInfo" }
    override class var lazyProperties: Set<String> { Self.lazy }
    private static let lazy: Set<String> = ["architecture", "description", "device", "vendor"]

    init(_ info: OpaquePointer) { self.info = info }
    deinit { canvas_native_webgpu_adapter_info_release(info) }

    override func readLazy(_ key: String) -> Any? {
        switch key {
        case "architecture": return gpuOwnedString(canvas_native_webgpu_adapter_info_architecture(info)) ?? ""
        case "description": return gpuOwnedString(canvas_native_webgpu_adapter_info_description(info)) ?? ""
        case "device": return gpuOwnedString(canvas_native_webgpu_adapter_info_device(info)) ?? ""
        case "vendor": return gpuOwnedString(canvas_native_webgpu_adapter_info_vendor(info)) ?? ""
        default: return nil
        }
    }
}

/// `GPUSupportedLimits`: constructible (`new CanvasModule.GPUSupportedLimits()` gives the
/// defaults), and what adapters and devices report.
final class GPUSupportedLimitsHost: CanvasHost {
    let limits: UnsafeMutablePointer<CanvasGPUSupportedLimits>?

    override class var className: String? { "GPUSupportedLimits" }

    init(_ args: Args) { limits = canvas_native_webgpu_create_limits() }
    init(limits: UnsafeMutablePointer<CanvasGPUSupportedLimits>) { self.limits = limits }
    deinit { if let limits { canvas_native_webgpu_limits_release(limits) } }

    private enum Field {
        /// A uint32 limit, set from an int32.
        case u32(WritableKeyPath<CanvasGPUSupportedLimits, UInt32>, Double)
        /// A uint64 limit, set from an int32.
        case u64(WritableKeyPath<CanvasGPUSupportedLimits, UInt64>, Double)
        /// A uint64 limit, set from any number.
        case u64Number(WritableKeyPath<CanvasGPUSupportedLimits, UInt64>, Double)
        /// A limit the native side no longer has: always 0, setting it does nothing.
        case gone
    }

    private static let order: [String] = [
        "maxTextureDimension1D", "maxTextureDimension2D", "maxTextureDimension3D", "maxTextureArrayLayers",
        "maxBindGroups", "maxBindingsPerBindGroup", "maxDynamicUniformBuffersPerPipelineLayout",
        "maxDynamicStorageBuffersPerPipelineLayout", "maxSampledTexturesPerShaderStage", "maxSamplersPerShaderStage",
        "maxStorageBuffersPerShaderStage", "maxStorageTexturesPerShaderStage", "maxUniformBuffersPerShaderStage",
        "maxUniformBufferBindingSize", "maxStorageBufferBindingSize", "maxVertexBuffers", "maxBufferSize",
        "maxVertexAttributes", "maxVertexBufferArrayStride", "minUniformBufferOffsetAlignment",
        "minStorageBufferOffsetAlignment", "maxInterStageShaderVariables", "maxInterStageShaderComponents",
        "maxColorAttachments", "maxColorAttachmentBytesPerSample", "maxComputeWorkgroupStorageSize",
        "maxComputeInvocationsPerWorkgroup", "maxComputeWorkgroupSizeX", "maxComputeWorkgroupSizeY",
        "maxComputeWorkgroupSizeZ", "maxComputeWorkgroupsPerDimension", "minSubgroupSize", "maxSubgroupSize",
        "maxPushConstantSize", "maxNonSamplerBindings",
    ]

    /// Each limit's field and the value read when there are no native limits.
    private static let fields: [String: Field] = [
        "maxTextureDimension1D": .u32(\.max_texture_dimension_1d, 8192),
        "maxTextureDimension2D": .u32(\.max_texture_dimension_2d, 8192),
        "maxTextureDimension3D": .u32(\.max_texture_dimension_3d, 2048),
        "maxTextureArrayLayers": .u32(\.max_texture_array_layers, 256),
        "maxBindGroups": .u32(\.max_bind_groups, 4),
        "maxBindingsPerBindGroup": .u32(\.max_bindings_per_bind_group, 1000),
        "maxDynamicUniformBuffersPerPipelineLayout": .u32(\.max_dynamic_uniform_buffers_per_pipeline_layout, 8),
        "maxDynamicStorageBuffersPerPipelineLayout": .u32(\.max_dynamic_storage_buffers_per_pipeline_layout, 4),
        "maxSampledTexturesPerShaderStage": .u32(\.max_sampled_textures_per_shader_stage, 16),
        "maxSamplersPerShaderStage": .u32(\.max_samplers_per_shader_stage, 16),
        "maxStorageBuffersPerShaderStage": .u32(\.max_storage_buffers_per_shader_stage, 8),
        "maxStorageTexturesPerShaderStage": .u32(\.max_storage_textures_per_shader_stage, 4),
        "maxUniformBuffersPerShaderStage": .u32(\.max_uniform_buffers_per_shader_stage, 12),
        "maxUniformBufferBindingSize": .u64(\.max_uniform_buffer_binding_size, 64),
        "maxStorageBufferBindingSize": .u64(\.max_storage_buffer_binding_size, 128),
        "maxVertexBuffers": .u32(\.max_vertex_buffers, 8),
        "maxBufferSize": .u64Number(\.max_buffer_size, 256),
        "maxVertexAttributes": .u32(\.max_vertex_attributes, 16),
        "maxVertexBufferArrayStride": .u32(\.max_vertex_buffer_array_stride, 2048),
        "minUniformBufferOffsetAlignment": .u32(\.min_uniform_buffer_offset_alignment, 256),
        "minStorageBufferOffsetAlignment": .u32(\.min_storage_buffer_offset_alignment, 256),
        "maxInterStageShaderVariables": .u32(\.max_inter_stage_shader_variables, 60),
        "maxInterStageShaderComponents": .u32(\.max_inter_stage_shader_variables, 60),
        "maxColorAttachments": .u32(\.max_color_attachments, 8),
        "maxColorAttachmentBytesPerSample": .u32(\.max_color_attachment_bytes_per_sample, 32),
        "maxComputeWorkgroupStorageSize": .u32(\.max_compute_workgroup_storage_size, 16384),
        "maxComputeInvocationsPerWorkgroup": .u32(\.max_compute_invocations_per_workgroup, 256),
        "maxComputeWorkgroupSizeX": .u32(\.max_compute_workgroup_size_x, 256),
        "maxComputeWorkgroupSizeY": .u32(\.max_compute_workgroup_size_y, 256),
        "maxComputeWorkgroupSizeZ": .u32(\.max_compute_workgroup_size_z, 64),
        "maxComputeWorkgroupsPerDimension": .u32(\.max_compute_workgroups_per_dimension, 65535),
        "minSubgroupSize": .gone,
        "maxSubgroupSize": .gone,
        "maxPushConstantSize": .gone,
        "maxNonSamplerBindings": .u32(\.max_non_sampler_bindings, 1_000_000),
    ]

    override var jsKeys: [String] { Self.order }

    override func get(_ key: String) -> Any?? {
        guard let field = Self.fields[key] else { return nil }
        switch field {
        case let .u32(path, fallback): return .some(limits.map { Double($0.pointee[keyPath: path]) } ?? fallback)
        case let .u64(path, fallback), let .u64Number(path, fallback):
            return .some(limits.map { Double($0.pointee[keyPath: path]) } ?? fallback)
        case .gone: return .some(0.0)
        }
    }

    override func set(_ key: String, _ value: Any?) throws -> Bool {
        guard let field = Self.fields[key] else { return false }
        guard let limits else { return true }
        switch field {
        case let .u32(path, _):
            if gpuIsInt32(value) { limits.pointee[keyPath: path] = UInt32(bitPattern: gpuInt32(value)) }
        case let .u64(path, _):
            if gpuIsInt32(value) { limits.pointee[keyPath: path] = UInt64(bitPattern: Int64(gpuInt32(value))) }
        case let .u64Number(path, _):
            if let d = value as? Double { limits.pointee[keyPath: path] = gpuUInt64(d) }
        case .gone:
            break
        }
        return true
    }
}
