import Foundation
import NativeScriptKit
import CanvasNative

/// An extension object `getExtension` returns that is only constants and its `ext_name`.
final class WebGLConstantsExtensionHost: CanvasHost {
    let extensionClass: String
    let properties: [String: Any]

    init(_ extensionClass: String, _ properties: [String: Any]) {
        self.extensionClass = extensionClass
        self.properties = properties
    }

    override var jsClassName: String? { extensionClass }

    override func get(_ key: String) -> Any?? {
        properties[key].map { .some($0) }
    }
}

extension WebGLConstantsExtensionHost {
    /// The extension object of that type, as `getExtension` builds it; nil for one that carries a
    /// native extension pointer.
    static func make(_ type: WebGLExtensionType, webgl2: Bool) -> WebGLConstantsExtensionHost? {
        switch type {
        case WebGLExtensionTypeWebGLExtensionTypeOES_fbo_render_mipmap:
            return .init("OES_fbo_render_mipmap", ["ext_name": "OES_fbo_render_mipmap"])
        case WebGLExtensionTypeWebGLExtensionTypeEXT_blend_minmax:
            return .init("EXT_blend_minmax", ["MIN_EXT": 0x8007 as Double, "MAX_EXT": 0x8008 as Double, "ext_name": "EXT_blend_minmax"])
        case WebGLExtensionTypeWebGLExtensionTypeEXT_color_buffer_half_float:
            return .init("EXT_color_buffer_half_float", [
                "RGBA16F_EXT": 0x881A as Double, "RGB16F_EXT": 0x881B as Double,
                "FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT": 0x8211 as Double, "UNSIGNED_NORMALIZED_EXT": 0x8C17 as Double,
                "ext_name": "EXT_color_buffer_half_float",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeEXT_sRGB:
            return .init("EXT_sRGB", [
                "SRGB_EXT": Double(GL.SRGB_EXT), "SRGB_ALPHA_EXT": Double(GL.SRGB_ALPHA_EXT),
                "SRGB8_ALPHA8_EXT": Double(GL.SRGB8_ALPHA8_EXT),
                "FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT": Double(GL.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT),
                "ext_name": "EXT_sRGB",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeEXT_shader_texture_lod:
            return .init("EXT_shader_texture_lod", ["ext_name": "EXT_shader_texture_lod"])
        case WebGLExtensionTypeWebGLExtensionTypeEXT_texture_filter_anisotropic:
            return .init("EXT_texture_filter_anisotropic", [
                "MAX_TEXTURE_MAX_ANISOTROPY_EXT": Double(GL.MAX_TEXTURE_MAX_ANISOTROPY_EXT),
                "TEXTURE_MAX_ANISOTROPY_EXT": Double(GL.TEXTURE_MAX_ANISOTROPY_EXT),
                "ext_name": "EXT_texture_filter_anisotropic",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeOES_element_index_uint:
            return .init("OES_element_index_uint", ["UNSIGNED_INT": Double(GL.UNSIGNED_INT), "ext_name": "OES_element_index_uint"])
        case WebGLExtensionTypeWebGLExtensionTypeOES_standard_derivatives:
            return .init("OES_standard_derivatives", [
                "FRAGMENT_SHADER_DERIVATIVE_HINT_OES": Double(GL.FRAGMENT_SHADER_DERIVATIVE_HINT_OES),
                "ext_name": "OES_standard_derivatives",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeOES_texture_float:
            return .init("OES_texture_float", ["ext_name": "OES_texture_float"])
        case WebGLExtensionTypeWebGLExtensionTypeOES_texture_float_linear:
            return .init("OES_texture_float_linear", ["ext_name": "OES_texture_float_linear"])
        case WebGLExtensionTypeWebGLExtensionTypeOES_texture_half_float:
            return .init("OES_texture_half_float", ["ext_name": "OES_texture_half_float", "HALF_FLOAT_OES": Double(GL.HALF_FLOAT_OES)])
        case WebGLExtensionTypeWebGLExtensionTypeOES_texture_half_float_linear:
            return .init("OES_texture_half_float_linear", ["ext_name": "OES_texture_half_float_linear"])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_color_buffer_float:
            return .init("WEBGL_color_buffer_float", [
                "ext_name": webgl2 ? "EXT_color_buffer_float" : "WEBGL_color_buffer_float",
                "RGBA32F_EXT": Double(GL.RGBA32F_EXT), "RGB32F_EXT": Double(GL.RGB32F_EXT),
                "FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT": Double(GL.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT),
                "UNSIGNED_NORMALIZED_EXT": Double(GL.UNSIGNED_NORMALIZED_EXT),
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_atc:
            return .init("WEBGL_compressed_texture_atc", [
                "ext_name": "WEBGL_compressed_texture_atc",
                "COMPRESSED_RGB_ATC_WEBGL": Double(GL.ATC_RGB_AMD),
                "COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL": Double(GL.ATC_RGBA_EXPLICIT_ALPHA_AMD),
                "COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL": Double(GL.ATC_RGBA_INTERPOLATED_ALPHA_AMD),
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_etc1:
            // The C++ binding gives this the PVRTC enum, not ETC1's 0x8D64.
            return .init("WEBGL_compressed_texture_etc1", [
                "ext_name": "WEBGL_compressed_texture_etc1",
                "COMPRESSED_RGB_ETC1_WEBGL": Double(GL.COMPRESSED_RGB_PVRTC_4BPPV1_IMG),
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_s3tc:
            return .init("WEBGL_compressed_texture_s3tc", [
                "COMPRESSED_RGB_S3TC_DXT1_EXT": Double(GL.COMPRESSED_RGB_S3TC_DXT1_EXT),
                "COMPRESSED_RGBA_S3TC_DXT1_EXT": Double(GL.COMPRESSED_RGBA_S3TC_DXT1_EXT),
                "COMPRESSED_RGBA_S3TC_DXT3_EXT": Double(GL.COMPRESSED_RGBA_S3TC_DXT3_EXT),
                "COMPRESSED_RGBA_S3TC_DXT5_EXT": Double(GL.COMPRESSED_RGBA_S3TC_DXT5_EXT),
                "ext_name": "WEBGL_compressed_texture_s3tc",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_s3tc_srgb:
            return .init("WEBGL_compressed_texture_s3tc_srgb", [
                "COMPRESSED_SRGB_S3TC_DXT1_EXT": Double(GL.COMPRESSED_SRGB_S3TC_DXT1_EXT),
                "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT": Double(GL.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT),
                "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT": Double(GL.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT),
                "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT": Double(GL.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT),
                "ext_name": "WEBGL_compressed_texture_s3tc_srgb",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_etc:
            return .init("WEBGL_compressed_texture_etc", [
                "COMPRESSED_R11_EAC": Double(GL.COMPRESSED_R11_EAC),
                "COMPRESSED_SIGNED_R11_EAC": Double(GL.COMPRESSED_SIGNED_R11_EAC),
                "COMPRESSED_RG11_EAC": Double(GL.COMPRESSED_RG11_EAC),
                "COMPRESSED_SIGNED_RG11_EAC": Double(GL.COMPRESSED_SIGNED_RG11_EAC),
                "COMPRESSED_RGB8_ETC2": Double(GL.COMPRESSED_RGB8_ETC2),
                "COMPRESSED_RGBA8_ETC2_EAC": Double(GL.COMPRESSED_RGBA8_ETC2_EAC),
                "COMPRESSED_SRGB8_ETC2": Double(GL.COMPRESSED_SRGB8_ETC2),
                "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC": Double(GL.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC),
                "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2": Double(GL.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2),
                "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2": Double(GL.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2),
                "ext_name": "WEBGL_compressed_texture_etc",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_compressed_texture_pvrtc:
            return .init("WEBGL_compressed_texture_pvrtc", [
                "COMPRESSED_RGB_PVRTC_4BPPV1_IMG": Double(GL.COMPRESSED_RGB_PVRTC_4BPPV1_IMG),
                "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG": Double(GL.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG),
                "COMPRESSED_RGB_PVRTC_2BPPV1_IMG": Double(GL.COMPRESSED_RGB_PVRTC_2BPPV1_IMG),
                "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG": Double(GL.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG),
                "ext_name": "WEBGL_compressed_texture_pvrtc",
            ])
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_depth_texture:
            return .init("WEBGL_depth_texture", ["UNSIGNED_INT_24_8_WEBGL": 0x84FA as Double, "ext_name": "WEBGL_depth_texture"])
        default:
            return nil
        }
    }
}

/// `ANGLE_instanced_arrays`.
final class ANGLEInstancedArraysHost: CanvasHost {
    let arrays: OpaquePointer
    init(_ arrays: OpaquePointer) { self.arrays = arrays }

    override class var className: String? { "ANGLE_instanced_arrays" }
    override class var methods: Set<String> { ["drawArraysInstancedANGLE", "drawElementsInstancedANGLE", "vertexAttribDivisorANGLE"] }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE": return .some(0x88FE as Double)
        case "ext_name": return .some("ANGLE_instanced_arrays")
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "drawArraysInstancedANGLE":
            canvas_native_webgl_angle_instanced_arrays_draw_arrays_instanced_angle(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), arrays)
        case "drawElementsInstancedANGLE":
            canvas_native_webgl_angle_instanced_arrays_draw_elements_instanced_angle(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), arrays)
        case "vertexAttribDivisorANGLE":
            canvas_native_webgl_angle_instanced_arrays_vertex_attrib_divisor_angle(args.uint32(0), args.uint32(1), arrays)
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `EXT_disjoint_timer_query`. Its methods are named `…Ext`, as the C++ binding names them.
final class EXTDisjointTimerQueryHost: CanvasHost {
    let query: OpaquePointer
    init(_ query: OpaquePointer) { self.query = query }
    deinit { canvas_native_webgl_EXT_disjoint_timer_query_destroy(query) }

    override class var className: String? { "EXT_disjoint_timer_query" }
    override class var methods: Set<String> {
        ["createQueryExt", "deleteQueryExt", "isQueryExt", "beginQueryExt", "endQueryExt", "queryCounterExt", "getQueryExt", "getQueryObjectExt", "getQueryParameterExt"]
    }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "QUERY_COUNTER_BITS_EXT": return .some(0x8864 as Double)
        case "CURRENT_QUERY_EXT": return .some(0x8865 as Double)
        case "QUERY_RESULT_EXT": return .some(0x8866 as Double)
        case "QUERY_RESULT_AVAILABLE_EXT": return .some(0x8867 as Double)
        case "TIME_ELAPSED_EXT": return .some(0x88BF as Double)
        case "TIMESTAMP_EXT": return .some(0x8E28 as Double)
        case "GPU_DISJOINT_EXT": return .some(0x8FBB as Double)
        case "ext_name": return .some("EXT_disjoint_timer_query")
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "createQueryExt":
            return .some(WebGLQueryHost(canvas_native_webgl_ext_disjoint_timer_query_create_query_ext(query)))
        case "deleteQueryExt":
            if let q = args.host(0, WebGLQueryHost.self) { canvas_native_webgl_ext_disjoint_timer_query_delete_query_ext(q.name, query) }
        case "isQueryExt":
            guard let q = args.host(0, WebGLQueryHost.self) else { return .some(false) }
            return .some(canvas_native_webgl_ext_disjoint_timer_query_is_query_ext(q.name, query))
        case "beginQueryExt":
            let target = args.uint32(0)
            if let q = args.host(1, WebGLQueryHost.self) { canvas_native_webgl_ext_disjoint_timer_query_begin_query_ext(target, q.name, query) }
        case "endQueryExt":
            canvas_native_webgl_ext_disjoint_timer_query_end_query_ext(args.uint32(0), query)
        case "queryCounterExt":
            let target = args.uint32(1)
            if let q = args.host(0, WebGLQueryHost.self) { canvas_native_webgl_ext_disjoint_timer_query_query_counter_ext(q.name, target, query) }
        case "getQueryExt":
            return .some(Double(canvas_native_webgl_ext_disjoint_timer_query_get_query_ext(args.uint32(0), args.uint32(1), query)))
        case "getQueryObjectExt", "getQueryParameterExt":
            guard let q = args.host(0, WebGLQueryHost.self) else { return .some(nil) }
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl_ext_disjoint_timer_query_get_query_object_ext(q.name, pname, query) else { return .some(nil) }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            if pname == 0x8867 { return .some(canvas_native_webgl_result_get_bool(result)) }
            return .some(Double(canvas_native_webgl_result_get_i32(result)))
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `OES_vertex_array_object`.
final class OESVertexArrayObjectHost: CanvasHost {
    let object: OpaquePointer
    init(_ object: OpaquePointer) { self.object = object }
    deinit { canvas_native_webgl_OES_vertex_array_object_destroy(object) }

    override class var className: String? { "OES_vertex_array_object" }
    override class var methods: Set<String> { ["createVertexArrayOES", "deleteVertexArrayOES", "isVertexArrayOES", "bindVertexArrayOES"] }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "VERTEX_ARRAY_BINDING_OES": return .some(Double(GL.VERTEX_ARRAY_BINDING_OES))
        case "ext_name": return .some("OES_vertex_array_object")
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "createVertexArrayOES":
            return .some(WebGLVertexArrayObjectHost(canvas_native_webgl_oes_vertex_array_object_create_vertex_array_oes(object)))
        case "deleteVertexArrayOES":
            if let array = args.host(0, WebGLVertexArrayObjectHost.self) {
                canvas_native_webgl_oes_vertex_array_object_delete_vertex_array_oes(array.name, object)
            }
        case "isVertexArrayOES":
            guard let array = args.host(0, WebGLVertexArrayObjectHost.self) else { return .some(false) }
            return .some(canvas_native_webgl_oes_vertex_array_object_is_vertex_array_oes(array.name, object))
        case "bindVertexArrayOES":
            if let array = args.host(0, WebGLVertexArrayObjectHost.self) {
                canvas_native_webgl_oes_vertex_array_object_bind_vertex_array_oes(array.name, object)
            }
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `WEBGL_draw_buffers`.
final class WEBGLDrawBuffersHost: CanvasHost {
    let buffers: OpaquePointer
    init(_ buffers: OpaquePointer) { self.buffers = buffers }
    deinit { canvas_native_webgl_WEBGL_draw_buffers_destroy(buffers) }

    override class var className: String? { "WEBGL_draw_buffers" }
    override class var methods: Set<String> { ["drawBuffersWEBGL"] }

    private static let constants: [String: Double] = {
        var all: [String: Double] = [
            "MAX_COLOR_ATTACHMENTS_WEBGL": Double(GL.MAX_COLOR_ATTACHMENTS_EXT),
            "MAX_DRAW_BUFFERS_WEBGL": Double(GL.MAX_DRAW_BUFFERS_EXT),
        ]
        for i in 0..<16 {
            all["COLOR_ATTACHMENT\(i)_WEBGL"] = Double(GL.COLOR_ATTACHMENT0_EXT) + Double(i)
            all["DRAW_BUFFER\(i)_WEBGL"] = Double(GL.DRAW_BUFFER0_EXT) + Double(i)
        }
        return all
    }()

    override func get(_ key: String) -> Any?? {
        if key == "ext_name" { return .some("WEBGL_draw_buffers") }
        return Self.constants[key].map { .some($0) }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "drawBuffersWEBGL" else { return nil }
        if let values = webglArray(args[0], webglUint32) {
            values.withUnsafeBufferPointer { canvas_native_webgl_draw_buffers_draw_buffers_webgl($0.baseAddress, UInt($0.count), buffers) }
        }
        return .some(nil)
    }
}

/// `WEBGL_lose_context`.
final class WEBGLLoseContextHost: CanvasHost {
    let context: OpaquePointer
    init(_ context: OpaquePointer) { self.context = context }
    deinit { canvas_native_webgl_WEBGL_lose_context_destroy(context) }

    override class var className: String? { "WEBGL_lose_context" }
    override class var methods: Set<String> { ["loseContext", "restoreContext"] }

    override func get(_ key: String) -> Any?? {
        key == "ext_name" ? .some("WEBGL_lose_context") : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "loseContext": canvas_native_webgl_lose_context_lose_context(context)
        case "restoreContext": canvas_native_webgl_lose_context_restore_context(context)
        default: return nil
        }
        return .some(nil)
    }
}
