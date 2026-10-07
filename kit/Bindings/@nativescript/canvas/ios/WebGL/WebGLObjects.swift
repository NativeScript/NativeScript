import Foundation
import NativeScriptKit
import CanvasNative

/// An object a WebGL context hands out that names a GL object by its id.
class WebGLNameHost: CanvasHost {
    let name: UInt32
    init(_ name: UInt32) { self.name = name }
}

/// `WebGLBuffer`.
final class WebGLBufferHost: WebGLNameHost {
    override class var className: String? { "WebGLBuffer" }
}

/// `WebGLFramebuffer`.
final class WebGLFramebufferHost: WebGLNameHost {
    override class var className: String? { "WebGLFramebuffer" }
}

/// `WebGLProgram`.
final class WebGLProgramHost: WebGLNameHost {
    override class var className: String? { "WebGLProgram" }
}

/// `WebGLRenderbuffer`.
final class WebGLRenderbufferHost: WebGLNameHost {
    /// The `isRenderbuffer` property `getFramebufferAttachmentParameter` gives the renderbuffers it returns.
    var marksRenderbuffer = false

    override class var className: String? { "WebGLRenderbuffer" }

    override func get(_ key: String) -> Any?? {
        key == "isRenderbuffer" && marksRenderbuffer ? .some(true) : nil
    }
}

/// `WebGLShader`.
final class WebGLShaderHost: WebGLNameHost {
    override class var className: String? { "WebGLShader" }
}

/// `WebGLTexture`.
final class WebGLTextureHost: WebGLNameHost {
    override class var className: String? { "WebGLTexture" }
}

/// `WebGLQuery`.
final class WebGLQueryHost: WebGLNameHost {
    override class var className: String? { "WebGLQuery" }
}

/// `WebGLSampler`.
final class WebGLSamplerHost: WebGLNameHost {
    override class var className: String? { "WebGLSampler" }
}

/// `WebGLTransformFeedback`.
final class WebGLTransformFeedbackHost: WebGLNameHost {
    override class var className: String? { "WebGLTransformFeedback" }
}

/// `WebGLVertexArrayObject`.
final class WebGLVertexArrayObjectHost: WebGLNameHost {
    override class var className: String? { "WebGLVertexArrayObject" }
}

/// `WebGLUniformLocation`.
final class WebGLUniformLocationHost: CanvasHost {
    let location: Int32
    init(_ location: Int32) { self.location = location }
    override class var className: String? { "WebGLUniformLocation" }
}

/// `WebGLSync`.
final class WebGLSyncHost: CanvasHost {
    let sync: OpaquePointer
    init(_ sync: OpaquePointer) { self.sync = sync }
    override class var className: String? { "WebGLSync" }
}

/// `WebGLActiveInfo`: `name`, `size` and `type`.
final class WebGLActiveInfoHost: CanvasHost {
    let info: OpaquePointer
    init(_ info: OpaquePointer) { self.info = info }
    deinit { canvas_native_webgl_active_info_destroy(info) }

    override class var className: String? { "WebGLActiveInfo" }

    private lazy var name = webglString(canvas_native_webgl_active_info_get_name(info))

    override func get(_ key: String) -> Any?? {
        switch key {
        case "name": return .some(name)
        case "size": return .some(Double(canvas_native_webgl_active_info_get_size(info)))
        case "type": return .some(Double(canvas_native_webgl_active_info_get_type(info)))
        default: return nil
        }
    }
}

/// `WebGLShaderPrecisionFormat`: `rangeMin`, `rangeMax` and `precision`.
final class WebGLShaderPrecisionFormatHost: CanvasHost {
    let format: OpaquePointer
    init(_ format: OpaquePointer) { self.format = format }
    deinit { canvas_native_webgl_shader_precision_format_destroy(format) }

    override class var className: String? { "WebGLShaderPrecisionFormat" }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "rangeMin": return .some(Double(canvas_native_webgl_shader_precision_format_get_range_min(format)))
        case "rangeMax": return .some(Double(canvas_native_webgl_shader_precision_format_get_range_max(format)))
        case "precision": return .some(Double(canvas_native_webgl_shader_precision_format_get_precision(format)))
        default: return nil
        }
    }
}
