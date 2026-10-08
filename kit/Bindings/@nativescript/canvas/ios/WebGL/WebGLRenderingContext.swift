import Foundation
import NativeScriptKit
import CanvasNative

/// The methods of `WebGLRenderingContext`, which `WebGL2RenderingContext` has too.
enum WebGLMethod: String, CaseIterable {
    case __resized, __startRaf, __stopRaf, __toDataURL, __getSupportedExtensions
    case activeTexture, attachShader, bindAttribLocation, bindBuffer, bindFramebuffer, bindRenderbuffer, bindTexture
    case blendColor, blendEquationSeparate, blendEquation, blendFuncSeparate, blendFunc
    case bufferData, bufferSubData, checkFramebufferStatus, clearColor, clearDepth, clearStencil, clear, colorMask, commit
    case compileShader, compressedTexImage2D, compressedTexSubImage2D, copyTexImage2D, copyTexSubImage2D
    case createBuffer, createFramebuffer, createProgram, createRenderbuffer, createShader, createTexture, cullFace
    case deleteBuffer, deleteFramebuffer, deleteProgram, deleteRenderbuffer, deleteShader, deleteTexture
    case depthFunc, depthMask, depthRange, detachShader, disableVertexAttribArray, disable, drawArrays, drawElements
    case enableVertexAttribArray, enable, finish, flush, framebufferRenderbuffer, framebufferTexture2D, frontFace, generateMipmap
    case getActiveAttrib, getActiveUniform, getAttachedShaders, getAttribLocation, getBufferParameter, getContextAttributes
    case getError, getExtension, getFramebufferAttachmentParameter, getParameter, getProgramInfoLog, getProgramParameter
    case getRenderbufferParameter, getShaderInfoLog, getShaderParameter, getShaderPrecisionFormat, getShaderSource
    case getSupportedExtensions, getTexParameter, getUniformLocation, getUniform, getVertexAttribOffset, getVertexAttrib
    case hint, isBuffer, isContextLost, isEnabled, isFramebuffer, isProgram, isRenderbuffer, isShader, isTexture
    case lineWidth, linkProgram, pixelStorei, polygonOffset, readPixels, renderbufferStorage, sampleCoverage, scissor
    case shaderSource, stencilFuncSeparate, stencilFunc, stencilMaskSeparate, stencilMask, stencilOpSeparate, stencilOp
    case texImage2D, texParameterf, texParameteri, texSubImage2D
    case vertexAttrib1f, vertexAttrib1fv, vertexAttrib2f, vertexAttrib2fv, vertexAttrib3f, vertexAttrib3fv, vertexAttrib4f, vertexAttrib4fv
    case vertexAttribPointer
    case uniform1f, uniform1iv, uniform1fv, uniform1i, uniform2f, uniform2iv, uniform2fv, uniform2i
    case uniform3f, uniform3iv, uniform3fv, uniform3i, uniform4f, uniform4iv, uniform4fv, uniform4i
    case uniformMatrix2fv, uniformMatrix3fv, uniformMatrix4fv, useProgram, validateProgram, viewport

    static let byName = Dictionary(uniqueKeysWithValues: allCases.map { ($0.rawValue, $0) })
    static let names = Set(allCases.map(\.rawValue))
}

/// Holds the context weakly for the frame callback, which the C API calls with this object's address.
private final class WebGLFrameTarget {
    weak var context: WebGLRenderingContextHost?
}

/// `WebGLRenderingContext`, over a `WebGLState`; `WebGL2RenderingContextHost` extends it.
class WebGLRenderingContextHost: CanvasHost {
    let state: OpaquePointer
    let isWebGL2: Bool
    private var invalidateState = 0
    private var continuousRender = true
    private var raf: OpaquePointer?
    private let frameTarget = WebGLFrameTarget()

    init(state: OpaquePointer, webgl2: Bool) {
        self.state = state
        isWebGL2 = webgl2
        super.init()
        frameTarget.context = self
        raf = canvas_native_raf_create(Int(bitPattern: Unmanaged.passUnretained(frameTarget).toOpaque())) { callback, _ in
            guard let target = UnsafeRawPointer(bitPattern: callback) else { return }
            Unmanaged<WebGLFrameTarget>.fromOpaque(target).takeUnretainedValue().context?.flush()
        }
        if let raf { canvas_native_raf_start(raf) }
    }

    deinit {
        if let raf { canvas_native_raf_release(raf) }
        canvas_native_webgl_state_destroy(state)
    }

    override class var className: String? { "WebGLRenderingContext" }
    override class var methods: Set<String> { WebGLMethod.names }

    // MARK: Frames

    /// Marks the drawing buffer for presenting on the next frame.
    @inline(__always)
    final func invalidate() { invalidateState |= Int(InvalidateStatePending.rawValue) }

    /// Presents the drawing buffer if a draw call marked it since the last frame.
    final func flush() {
        let pending = Int(InvalidateStatePending.rawValue)
        guard invalidateState & pending == pending else { return }
        invalidateState = Int(InvalidateStateInvalidating.rawValue)
        canvas_native_webgl_make_current_and_swap_buffers(state)
        invalidateState = Int(InvalidateStateNone.rawValue)
    }

    final func startRaf() {
        if let raf, !canvas_native_raf_get_started(raf) { canvas_native_raf_start(raf) }
    }

    final func stopRaf() {
        if let raf, canvas_native_raf_get_started(raf) { canvas_native_raf_stop(raf) }
    }

    // MARK: Properties

    override func get(_ key: String) -> Any?? {
        switch key {
        case "drawingBufferWidth": return .some(Double(canvas_native_webgl_state_get_drawing_buffer_width(state)))
        case "drawingBufferHeight": return .some(Double(canvas_native_webgl_state_get_drawing_buffer_height(state)))
        case "__flipY": return .some(canvas_native_webgl_state_get_flip_y(state))
        case "continuousRenderMode": return .some(continuousRender)
        default: return WebGLConstants.webgl1[key].map { .some($0) }
        }
    }

    override func set(_ key: String, _ value: Any?) throws -> Bool {
        guard key == "continuousRenderMode" else { return false }
        let on = jsIsTruthy(value)
        if on != continuousRender {
            if on { startRaf() } else { stopRaf() }
            continuousRender = on
        }
        return true
    }

    // MARK: Methods

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard let method = WebGLMethod.byName[key] else { return nil }
        return .some(call(method, args))
    }

    final func call(_ method: WebGLMethod, _ args: Args) -> Any? {
        let state = self.state
        switch method {
        case .__resized:
            canvas_native_webgl_resized(state)
        case .__startRaf:
            startRaf()
        case .__stopRaf:
            stopRaf()
        case .__toDataURL:
            let type = args.stringIfString(0) ?? "image/png"
            let quality = args.isNumber(1) ? webglCInt32(args.number(1) * 100) : 92
            return webglString(canvas_native_webgl_to_data_url(state, type, UInt32(bitPattern: quality)))
        case .__getSupportedExtensions:
            return webglString(canvas_native_webgl_get_supported_extensions_to_string(state))

        case .activeTexture:
            canvas_native_webgl_active_texture(args.uint32(0), state)
        case .attachShader:
            if let program = args.host(0, WebGLProgramHost.self), let shader = args.host(1, WebGLShaderHost.self) {
                canvas_native_webgl_attach_shader(program.name, shader.name, state)
            }
        case .bindAttribLocation:
            if let program = args.host(0, WebGLProgramHost.self) {
                canvas_native_webgl_bind_attrib_location(program.name, args.uint32(1), args.string(2), state)
            }
        case .bindBuffer:
            let target = args.uint32(0)
            let value = args[1]
            if webglIsObject(value) {
                if let buffer = value as? WebGLBufferHost { canvas_native_webgl_bind_buffer(target, buffer.name, state) }
            } else {
                canvas_native_webgl_bind_buffer(target, 0, state)
            }
        case .bindFramebuffer:
            let target = args.uint32(0)
            let value = args[1]
            if webglIsObject(value) {
                if let framebuffer = value as? WebGLFramebufferHost { canvas_native_webgl_bind_frame_buffer(target, framebuffer.name, state) }
            } else {
                canvas_native_webgl_bind_frame_buffer(target, 0, state)
            }
        case .bindRenderbuffer:
            let target = args.uint32(0)
            let value = args[1]
            if webglIsObject(value) {
                if let renderbuffer = value as? WebGLRenderbufferHost { canvas_native_webgl_bind_render_buffer(target, renderbuffer.name, state) }
            } else {
                canvas_native_webgl_bind_render_buffer(target, 0, state)
            }
        case .bindTexture:
            let target = args.uint32(0)
            let value = args[1]
            if webglIsObject(value) {
                if let texture = value as? WebGLTextureHost { canvas_native_webgl_bind_texture(target, texture.name, state) }
            } else {
                canvas_native_webgl_bind_texture(target, 0, state)
            }
        case .blendColor:
            canvas_native_webgl_blend_color(args.float(0), args.float(1), args.float(2), args.float(3), state)
        case .blendEquationSeparate:
            canvas_native_webgl_blend_equation_separate(args.uint32(0), args.uint32(1), state)
        case .blendEquation:
            canvas_native_webgl_blend_equation(args.uint32(0), state)
        case .blendFuncSeparate:
            canvas_native_webgl_blend_func_separate(args.uint32(0), args.uint32(1), args.uint32(2), args.uint32(3), state)
        case .blendFunc:
            canvas_native_webgl_blend_func(args.uint32(0), args.uint32(1), state)
        case .bufferData:
            if args.count == 2 {
                canvas_native_webgl_buffer_data_none(args.uint32(0), 0, args.uint32(1), state)
            } else if args.count == 3 {
                let target = args.uint32(0)
                let usage = args.uint32(2)
                let value = args[1]
                if webglIsObject(value) {
                    if let bytes = webglBytes(value) {
                        canvas_native_webgl_buffer_data(target, webglU8(bytes), UInt(bytes.count), usage, state)
                    }
                } else {
                    canvas_native_webgl_buffer_data_none(target, webglInt(args.number(1)), usage, state)
                }
            }
        case .bufferSubData:
            if args.count == 2 {
                canvas_native_webgl_buffer_sub_data_none(args.uint32(0), webglInt(args.number(1)), state)
            } else if args.count == 3, let bytes = webglBytes(args[2]) {
                canvas_native_webgl_buffer_sub_data(args.uint32(0), webglInt(args.number(1)), webglU8(bytes), UInt(bytes.count), state)
            }
        case .checkFramebufferStatus:
            return Double(canvas_native_webgl_check_frame_buffer_status(args.uint32(0), state))
        case .clearColor:
            canvas_native_webgl_clear_color(args.float(0), args.float(1), args.float(2), args.float(3), state)
        case .clearDepth:
            canvas_native_webgl_clear_depth(args.float(0), state)
        case .clearStencil:
            canvas_native_webgl_clear_stencil(args.int32(0), state)
        case .clear:
            canvas_native_webgl_clear(args.uint32(0), state)
            invalidate()
        case .colorMask:
            canvas_native_webgl_color_mask(args.bool(0), args.bool(1), args.bool(2), args.bool(3), state)
        case .commit:
            break
        case .compileShader:
            if let shader = args.host(0, WebGLShaderHost.self) { canvas_native_webgl_compile_shader(shader.name, state) }
        case .compressedTexImage2D:
            if args.count == 6 {
                canvas_native_webgl_compressed_tex_image2d_none(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), args.int32(5), state)
            } else if args.count > 6, let bytes = webglBytes(args[6]) {
                canvas_native_webgl_compressed_tex_image2d(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), args.int32(5),
                                                           webglU8(bytes), UInt(bytes.count), state)
            }
        case .compressedTexSubImage2D:
            if let bytes = webglBytesToBufferEnd(args[7]) {
                canvas_native_webgl_compressed_tex_sub_image2d(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5),
                                                               args.uint32(6), webglU8(bytes), UInt(bytes.count), state)
            }
        case .copyTexImage2D:
            canvas_native_webgl_copy_tex_image2d(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6), args.int32(7), state)
        case .copyTexSubImage2D:
            canvas_native_webgl_copy_tex_sub_image2d(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6), args.int32(7), state)
        case .createBuffer:
            let id = canvas_native_webgl_create_buffer(state)
            return id != 0 ? WebGLBufferHost(id) : jsNull
        case .createFramebuffer:
            let id = canvas_native_webgl_create_framebuffer(state)
            return id != 0 ? WebGLFramebufferHost(id) : jsNull
        case .createProgram:
            let id = canvas_native_webgl_create_program(state)
            return id != 0 ? WebGLProgramHost(id) : jsNull
        case .createRenderbuffer:
            let id = canvas_native_webgl_create_renderbuffer(state)
            return id != 0 ? WebGLRenderbufferHost(id) : jsNull
        case .createShader:
            guard args.count > 0 else { return nil }
            let id = canvas_native_webgl_create_shader(args.uint32(0), state)
            return id != 0 ? WebGLShaderHost(id) : nil
        case .createTexture:
            let id = canvas_native_webgl_create_texture(state)
            return id != 0 ? WebGLTextureHost(id) : nil
        case .cullFace:
            canvas_native_webgl_cull_face(args.uint32(0), state)
        case .deleteBuffer:
            if let buffer = args.host(0, WebGLBufferHost.self) { canvas_native_webgl_delete_buffer(buffer.name, state) }
        case .deleteFramebuffer:
            if let framebuffer = args.host(0, WebGLFramebufferHost.self) { canvas_native_webgl_delete_framebuffer(framebuffer.name, state) }
        case .deleteProgram:
            if let program = args.host(0, WebGLProgramHost.self) { canvas_native_webgl_delete_program(program.name, state) }
        case .deleteRenderbuffer:
            if let renderbuffer = args.host(0, WebGLRenderbufferHost.self) { canvas_native_webgl_delete_renderbuffer(renderbuffer.name, state) }
        case .deleteShader:
            if let shader = args.host(0, WebGLShaderHost.self) { canvas_native_webgl_delete_shader(shader.name, state) }
        case .deleteTexture:
            if let texture = args.host(0, WebGLTextureHost.self) { canvas_native_webgl_delete_texture(texture.name, state) }
        case .depthFunc:
            canvas_native_webgl_depth_func(args.uint32(0), state)
        case .depthMask:
            canvas_native_webgl_depth_mask(args.bool(0), state)
        case .depthRange:
            canvas_native_webgl_depth_range(args.float(0), args.float(1), state)
        case .detachShader:
            if let program = args.host(0, WebGLProgramHost.self), let shader = args.host(1, WebGLShaderHost.self) {
                canvas_native_webgl_detach_shader(program.name, shader.name, state)
            }
        case .disableVertexAttribArray:
            canvas_native_webgl_disable_vertex_attrib_array(args.uint32(0), state)
        case .disable:
            canvas_native_webgl_disable(args.uint32(0), state)
        case .drawArrays:
            canvas_native_webgl_draw_arrays(args.uint32(0), args.int32(1), args.int32(2), state)
            invalidate()
        case .drawElements:
            canvas_native_webgl_draw_elements(args.uint32(0), args.int32(1), UInt32(bitPattern: args.int32(2)), webglInt(args.number(3)), state)
            invalidate()
        case .enableVertexAttribArray:
            canvas_native_webgl_enable_vertex_attrib_array(args.uint32(0), state)
        case .enable:
            canvas_native_webgl_enable(args.uint32(0), state)
        case .finish:
            canvas_native_webgl_finish(state)
        case .flush:
            canvas_native_webgl_flush(state)
        case .framebufferRenderbuffer:
            if let renderbuffer = args.host(3, WebGLRenderbufferHost.self) {
                canvas_native_webgl_framebuffer_renderbuffer(args.uint32(0), args.uint32(1), args.uint32(2), renderbuffer.name, state)
            }
        case .framebufferTexture2D:
            if let texture = args.host(3, WebGLTextureHost.self) {
                canvas_native_webgl_framebuffer_texture2d(args.uint32(0), args.uint32(1), args.uint32(2), texture.name, args.int32(4), state)
            }
        case .frontFace:
            canvas_native_webgl_front_face(args.uint32(0), state)
        case .generateMipmap:
            canvas_native_webgl_generate_mipmap(args.uint32(0), state)
        case .getActiveAttrib:
            guard let program = args.host(0, WebGLProgramHost.self),
                  let info = canvas_native_webgl_get_active_attrib(program.name, UInt32(bitPattern: args.int32(1)), state) else { return nil }
            return WebGLActiveInfoHost(info)
        case .getActiveUniform:
            guard let program = args.host(0, WebGLProgramHost.self),
                  let info = canvas_native_webgl_get_active_uniform(program.name, UInt32(bitPattern: args.int32(1)), state) else { return nil }
            return WebGLActiveInfoHost(info)
        case .getAttachedShaders:
            guard let program = args.host(0, WebGLProgramHost.self) else { return JSArray<Any?>([]) }
            guard let shaders = canvas_native_webgl_get_attached_shaders(program.name, state) else { return JSArray<Any?>([]) }
            defer { canvas_native_u32_buffer_release(shaders) }
            let count = Int(canvas_native_u32_buffer_get_length(shaders))
            guard let ids = canvas_native_u32_buffer_get_bytes(shaders) else { return JSArray<Any?>([]) }
            return JSArray<Any?>((0..<count).map { WebGLShaderHost(ids[$0]) })
        case .getAttribLocation:
            guard let program = args.host(0, WebGLProgramHost.self) else { return -1.0 }
            return Double(canvas_native_webgl_get_attrib_location(program.name, args.string(1), state))
        case .getBufferParameter:
            return Double(canvas_native_webgl_get_buffer_parameter(args.uint32(0), args.uint32(1), state))
        case .getContextAttributes:
            return contextAttributes()
        case .getError:
            return Double(canvas_native_webgl_get_error(state))
        case .getExtension:
            return getExtension(args[0])
        case .getFramebufferAttachmentParameter:
            guard let parameter = canvas_native_webgl_get_framebuffer_attachment_parameter(args.uint32(0), args.uint32(1), args.uint32(2), state) else { return nil }
            defer { canvas_native_webgl_framebuffer_attachment_parameter_destroy(parameter) }
            let value = canvas_native_webgl_framebuffer_attachment_parameter_get_value(parameter)
            if canvas_native_webgl_framebuffer_attachment_parameter_get_is_texture(parameter) {
                return WebGLTextureHost(UInt32(bitPattern: value))
            }
            if canvas_native_webgl_framebuffer_attachment_parameter_get_is_renderbuffer(parameter) {
                let renderbuffer = WebGLRenderbufferHost(UInt32(bitPattern: value))
                renderbuffer.marksRenderbuffer = true
                return renderbuffer
            }
            return Double(value)
        case .getParameter:
            let pname = args.uint32(0)
            guard let result = canvas_native_webgl_get_parameter(pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            return parameter(pname, result)
        case .getProgramInfoLog:
            guard let program = args.host(0, WebGLProgramHost.self) else { return "" }
            return webglString(canvas_native_webgl_get_program_info_log(program.name, state))
        case .getProgramParameter:
            let pname = args.uint32(1)
            guard let program = args.host(0, WebGLProgramHost.self),
                  let result = canvas_native_webgl_get_program_parameter(program.name, pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            if canvas_native_webgl_result_get_is_none(result) { return jsNull }
            switch pname {
            case GL.DELETE_STATUS, GL.LINK_STATUS, GL.VALIDATE_STATUS: return canvas_native_webgl_result_get_bool(result)
            default: return Double(canvas_native_webgl_result_get_i32(result))
            }
        case .getRenderbufferParameter:
            return Double(canvas_native_webgl_get_renderbuffer_parameter(args.uint32(0), args.uint32(1), state))
        case .getShaderInfoLog:
            guard let shader = args.host(0, WebGLShaderHost.self) else { return "" }
            return webglString(canvas_native_webgl_get_shader_info_log(shader.name, state))
        case .getShaderParameter:
            let pname = args.uint32(1)
            guard let shader = args.host(0, WebGLShaderHost.self),
                  let result = canvas_native_webgl_get_shader_parameter(shader.name, pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            if canvas_native_webgl_result_get_is_none(result) { return jsNull }
            if pname == GL.DELETE_STATUS || pname == GL.COMPILE_STATUS { return canvas_native_webgl_result_get_bool(result) }
            return Double(canvas_native_webgl_result_get_i32(result))
        case .getShaderPrecisionFormat:
            guard let format = canvas_native_webgl_get_shader_precision_format(args.uint32(0), args.uint32(1), state) else { return jsNull }
            return WebGLShaderPrecisionFormatHost(format)
        case .getShaderSource:
            guard let shader = args.host(0, WebGLShaderHost.self) else { return "" }
            return webglString(canvas_native_webgl_get_shader_source(shader.name, state))
        case .getSupportedExtensions:
            guard let names = canvas_native_webgl_get_supported_extensions(state) else { return JSArray<Any?>([]) }
            defer { canvas_native_string_buffer_release(names) }
            let count = Int(canvas_native_string_buffer_get_length(names))
            return JSArray<Any?>((0..<count).map { webglString(canvas_native_string_buffer_get_value_at(names, UInt($0))) })
        case .getTexParameter:
            return Double(canvas_native_webgl_get_tex_parameter(args.uint32(0), args.uint32(1), state))
        case .getUniformLocation:
            guard let program = args.host(0, WebGLProgramHost.self), let name = args.stringIfString(1) else { return jsNull }
            let location = canvas_native_webgl_get_uniform_location(program.name, name, state)
            return location == -1 ? jsNull : WebGLUniformLocationHost(location)
        case .getUniform:
            guard let program = args.host(0, WebGLProgramHost.self), let location = args.host(1, WebGLUniformLocationHost.self),
                  let result = canvas_native_webgl_get_uniform(program.name, location.location, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            return uniformValue(result)
        case .getVertexAttribOffset:
            return Double(canvas_native_webgl_get_vertex_attrib_offset(args.uint32(0), args.uint32(1), state))
        case .getVertexAttrib:
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl_get_vertex_attrib(args.uint32(0), pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            if pname == GL.CURRENT_VERTEX_ATTRIB { return webglFloat32Array(canvas_native_webgl_result_get_f32_array(result)) }
            if pname == GL.VERTEX_ATTRIB_ARRAY_ENABLED || pname == GL.VERTEX_ATTRIB_ARRAY_NORMALIZED {
                return canvas_native_webgl_result_get_bool(result)
            }
            return Double(canvas_native_webgl_result_get_i32(result))
        case .hint:
            canvas_native_webgl_hint(args.uint32(0), args.uint32(1), state)
        case .isBuffer:
            guard let buffer = args.host(0, WebGLBufferHost.self) else { return false }
            return canvas_native_webgl_is_buffer(buffer.name, state)
        case .isContextLost:
            return canvas_native_webgl_get_is_context_lost(state)
        case .isEnabled:
            return canvas_native_webgl_is_enabled(args.uint32(0), state)
        case .isFramebuffer:
            guard let framebuffer = args.host(0, WebGLFramebufferHost.self) else { return false }
            return canvas_native_webgl_is_framebuffer(framebuffer.name, state)
        case .isProgram:
            guard let program = args.host(0, WebGLProgramHost.self) else { return false }
            return canvas_native_webgl_is_program(program.name, state)
        case .isRenderbuffer:
            guard let renderbuffer = args.host(0, WebGLRenderbufferHost.self) else { return false }
            return canvas_native_webgl_is_renderbuffer(renderbuffer.name, state)
        case .isShader:
            guard let shader = args.host(0, WebGLShaderHost.self) else { return false }
            return canvas_native_webgl_is_shader(shader.name, state)
        case .isTexture:
            guard let texture = args.host(0, WebGLTextureHost.self) else { return false }
            return canvas_native_webgl_is_texture(texture.name, state)
        case .lineWidth:
            canvas_native_webgl_line_width(args.float(0), state)
        case .linkProgram:
            if let program = args.host(0, WebGLProgramHost.self) { canvas_native_webgl_link_program(program.name, state) }
        case .pixelStorei:
            let pname = args.uint32(0)
            if let flag = args[1] as? Bool {
                canvas_native_webgl_pixel_storei(pname, flag ? 1 : 0, state)
            } else {
                canvas_native_webgl_pixel_storei(pname, args.int32(1), state)
            }
        case .polygonOffset:
            canvas_native_webgl_polygon_offset(args.float(0), args.float(1), state)
        case .readPixels:
            if let bytes = webglBytesToBufferEnd(args[6]) {
                canvas_native_webgl_read_pixels_u8(args.int32(0), args.int32(1), args.int32(2), args.int32(3), args.uint32(4), args.uint32(5),
                                                   webglU8(bytes), UInt(bytes.count), state)
            }
        case .renderbufferStorage:
            canvas_native_webgl_renderbuffer_storage(args.uint32(0), args.uint32(1), args.int32(2), args.int32(3), state)
        case .sampleCoverage:
            canvas_native_webgl_sample_coverage(args.float(0), args.bool(1), state)
        case .scissor:
            canvas_native_webgl_scissor(args.int32(0), args.int32(1), args.int32(2), args.int32(3), state)
        case .shaderSource:
            if let shader = args.host(0, WebGLShaderHost.self) { canvas_native_webgl_shader_source(shader.name, args.string(1), state) }
        case .stencilFuncSeparate:
            canvas_native_webgl_stencil_func_separate(args.uint32(0), args.uint32(1), args.int32(2), args.uint32(3), state)
        case .stencilFunc:
            canvas_native_webgl_stencil_func(args.uint32(0), args.int32(1), args.uint32(2), state)
        case .stencilMaskSeparate:
            canvas_native_webgl_stencil_mask_separate(args.uint32(0), args.uint32(1), state)
        case .stencilMask:
            canvas_native_webgl_stencil_mask(args.uint32(0), state)
        case .stencilOpSeparate:
            canvas_native_webgl_stencil_op_separate(args.uint32(0), args.uint32(1), args.uint32(2), args.uint32(3), state)
        case .stencilOp:
            canvas_native_webgl_stencil_op(args.uint32(0), args.uint32(1), args.uint32(2), state)
        case .texImage2D:
            texImage2D(args)
        case .texParameterf:
            canvas_native_webgl_tex_parameterf(args.uint32(0), args.uint32(1), args.float(2), state)
        case .texParameteri:
            canvas_native_webgl_tex_parameteri(args.uint32(0), args.uint32(1), args.int32(2), state)
        case .texSubImage2D:
            texSubImage2D(args)
        case .vertexAttrib1f:
            canvas_native_webgl_vertex_attrib1f(args.uint32(0), args.float(1), state)
        case .vertexAttrib2f:
            canvas_native_webgl_vertex_attrib2f(args.uint32(0), args.float(1), args.float(2), state)
        case .vertexAttrib3f:
            canvas_native_webgl_vertex_attrib3f(args.uint32(0), args.float(1), args.float(2), args.float(3), state)
        case .vertexAttrib4f:
            canvas_native_webgl_vertex_attrib4f(args.uint32(0), args.float(1), args.float(2), args.float(3), args.float(4), state)
        case .vertexAttrib1fv:
            if let values = webglElements(args[1], .float32, Float.self) {
                canvas_native_webgl_vertex_attrib1fv(args.uint32(0), values.baseAddress, UInt(values.count), state)
            }
        case .vertexAttrib2fv:
            if let values = webglElements(args[1], .float32, Float.self) {
                canvas_native_webgl_vertex_attrib2fv(args.uint32(0), values.baseAddress, UInt(values.count), state)
            }
        case .vertexAttrib3fv:
            if let values = webglElements(args[1], .float32, Float.self) {
                canvas_native_webgl_vertex_attrib3fv(args.uint32(0), values.baseAddress, UInt(values.count), state)
            }
        case .vertexAttrib4fv:
            if let values = webglElements(args[1], .float32, Float.self) {
                canvas_native_webgl_vertex_attrib4fv(args.uint32(0), values.baseAddress, UInt(values.count), state)
            }
        case .vertexAttribPointer:
            canvas_native_webgl_vertex_attrib_pointer(args.uint32(0), args.int32(1), args.uint32(2), args.bool(3), args.int32(4), webglInt(args.number(5)), state)
        case .uniform1f:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl_uniform1f(location.location, args.float(1), state) }
        case .uniform2f:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl_uniform2f(location.location, args.float(1), args.float(2), state) }
        case .uniform3f:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl_uniform3f(location.location, args.float(1), args.float(2), args.float(3), state)
            }
        case .uniform4f:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl_uniform4f(location.location, args.float(1), args.float(2), args.float(3), args.float(4), state)
            }
        case .uniform1i:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl_uniform1i(location.location, args.int32(1), state) }
        case .uniform2i:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl_uniform2i(location.location, args.int32(1), args.int32(2), state) }
        case .uniform3i:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl_uniform3i(location.location, args.int32(1), args.int32(2), args.int32(3), state)
            }
        case .uniform4i:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl_uniform4i(location.location, args.int32(1), args.int32(2), args.int32(3), args.int32(4), state)
            }
        case .uniform1fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .float32, array: { Float($0) }) { canvas_native_webgl_uniform1fv(location.location, $0, $1, state) }
            }
        case .uniform2fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .float32, array: { Float($0) }) { canvas_native_webgl_uniform2fv(location.location, $0, $1, state) }
            }
        case .uniform3fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .float32, array: { Float($0) }) { canvas_native_webgl_uniform3fv(location.location, $0, $1, state) }
            }
        case .uniform4fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .float32, array: { Float($0) }) { canvas_native_webgl_uniform4fv(location.location, $0, $1, state) }
            }
        case .uniform1iv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .int32, array: webglInt32) { canvas_native_webgl_uniform1iv(location.location, $0, $1, state) }
            }
        case .uniform2iv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .int32, array: webglInt32) { canvas_native_webgl_uniform2iv(location.location, $0, $1, state) }
            }
        case .uniform3iv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .int32, array: webglInt32) { canvas_native_webgl_uniform3iv(location.location, $0, $1, state) }
            }
        case .uniform4iv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .int32, array: webglInt32) { canvas_native_webgl_uniform4iv(location.location, $0, $1, state) }
            }
        case .uniformMatrix2fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl_uniform_matrix2fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix3fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl_uniform_matrix3fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix4fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl_uniform_matrix4fv(location.location, transpose, $0, $1, state) }
            }
        case .useProgram:
            if args.isNullish(0) {
                canvas_native_webgl_use_program(0, state)
            } else if let program = args.host(0, WebGLProgramHost.self) {
                canvas_native_webgl_use_program(program.name, state)
            }
        case .validateProgram:
            if let program = args.host(0, WebGLProgramHost.self) { canvas_native_webgl_validate_program(program.name, state) }
        case .viewport:
            canvas_native_webgl_viewport(args.int32(0), args.int32(1), args.int32(2), args.int32(3), state)
        }
        return nil
    }

    // MARK: Queries

    /// `getParameter`'s value of a WebGL 1 pname (`GetParameterInternal`).
    final func parameter(_ pname: UInt32, _ result: OpaquePointer) -> Any? {
        switch pname {
        case GL.ACTIVE_TEXTURE, GL.ALPHA_BITS, GL.BLEND_DST_ALPHA, GL.BLEND_DST_RGB, GL.BLEND_EQUATION, GL.BLEND_EQUATION_ALPHA,
             GL.BLEND_SRC_ALPHA, GL.BLEND_SRC_RGB, GL.BLUE_BITS, GL.CULL_FACE_MODE, GL.DEPTH_BITS, GL.DEPTH_FUNC, GL.FRONT_FACE,
             GL.GENERATE_MIPMAP_HINT, GL.GREEN_BITS, GL.IMPLEMENTATION_COLOR_READ_FORMAT, GL.IMPLEMENTATION_COLOR_READ_TYPE,
             GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS, GL.MAX_CUBE_MAP_TEXTURE_SIZE, GL.MAX_FRAGMENT_UNIFORM_VECTORS, GL.MAX_RENDERBUFFER_SIZE,
             GL.MAX_TEXTURE_IMAGE_UNITS, GL.MAX_TEXTURE_SIZE, GL.MAX_VARYING_VECTORS, GL.MAX_VERTEX_ATTRIBS, GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
             GL.MAX_VERTEX_UNIFORM_VECTORS, GL.PACK_ALIGNMENT, GL.RED_BITS, GL.SAMPLE_BUFFERS, GL.SAMPLES, GL.STENCIL_BACK_FAIL,
             GL.STENCIL_BACK_FUNC, GL.STENCIL_BACK_PASS_DEPTH_FAIL, GL.STENCIL_BACK_PASS_DEPTH_PASS, GL.STENCIL_BACK_REF,
             GL.STENCIL_BACK_VALUE_MASK, GL.STENCIL_BACK_WRITEMASK, GL.STENCIL_BITS, GL.STENCIL_CLEAR_VALUE, GL.STENCIL_FAIL,
             GL.STENCIL_FUNC, GL.STENCIL_PASS_DEPTH_FAIL, GL.STENCIL_PASS_DEPTH_PASS, GL.STENCIL_REF, GL.STENCIL_VALUE_MASK,
             GL.STENCIL_WRITEMASK, GL.SUBPIXEL_BITS, GL.UNPACK_ALIGNMENT:
            return Double(canvas_native_webgl_result_get_i32(result))
        case GL.ARRAY_BUFFER_BINDING, GL.CURRENT_PROGRAM, GL.ELEMENT_ARRAY_BUFFER_BINDING, GL.FRAMEBUFFER_BINDING,
             GL.RENDERBUFFER_BINDING, GL.TEXTURE_BINDING_2D, GL.TEXTURE_BINDING_CUBE_MAP:
            let value = canvas_native_webgl_result_get_i32(result)
            return value == 0 ? jsNull : Double(value)
        case GLConstantsUnpackColorSpaceConversionWebGL.rawValue:
            return Double(canvas_native_webgl_state_get_unpack_colorspace_conversion_webgl(state))
        case GL.ALIASED_LINE_WIDTH_RANGE, GL.ALIASED_POINT_SIZE_RANGE, GL.BLEND_COLOR, GL.COLOR_CLEAR_VALUE, GL.DEPTH_RANGE:
            return webglFloat32Array(canvas_native_webgl_result_get_f32_array(result))
        case GLConstantsUnPackFlipYWebGL.rawValue:
            return canvas_native_webgl_state_get_flip_y(state)
        case GLConstantsUnpackPremultiplyAlphaWebGL.rawValue:
            return canvas_native_webgl_state_get_premultiplied_alpha(state)
        case GL.BLEND, GL.CULL_FACE, GL.DEPTH_TEST, GL.DEPTH_WRITEMASK, GL.DITHER, GL.POLYGON_OFFSET_FILL, GL.SAMPLE_COVERAGE_INVERT,
             GL.SCISSOR_TEST, GL.STENCIL_TEST:
            return canvas_native_webgl_result_get_bool(result)
        case GL.COLOR_WRITEMASK:
            return webglBoolArray(canvas_native_webgl_result_get_bool_array(result))
        case GL.COMPRESSED_TEXTURE_FORMATS, GL.MAX_VIEWPORT_DIMS, GL.SCISSOR_BOX, GL.VIEWPORT:
            return webglInt32Array(canvas_native_webgl_result_get_i32_array(result))
        case GL.DEPTH_CLEAR_VALUE, GL.LINE_WIDTH, GL.POLYGON_OFFSET_FACTOR, GL.POLYGON_OFFSET_UNITS, GL.SAMPLE_COVERAGE_VALUE:
            return Double(canvas_native_webgl_result_get_f32(result))
        case GL.RENDERER, GL.SHADING_LANGUAGE_VERSION, GL.VENDOR, GL.VERSION:
            return webglString(canvas_native_webgl_result_get_string(result))
        default:
            return jsNull
        }
    }

    /// `getUniform`'s value, by the result's type.
    private func uniformValue(_ result: OpaquePointer) -> Any? {
        switch canvas_native_webgl_result_get_type(result) {
        case WebGLResultTypeBoolean: return canvas_native_webgl_result_get_bool(result)
        case WebGLResultTypeNone: return jsNull
        case WebGLResultTypeString: return webglString(canvas_native_webgl_result_get_string(result))
        case WebGLResultTypeBooleanArray: return webglBoolArray(canvas_native_webgl_result_get_bool_array(result))
        case WebGLResultTypeF32Array: return webglFloat32Array(canvas_native_webgl_result_get_f32_array(result))
        case WebGLResultTypeI32Array: return webglInt32Array(canvas_native_webgl_result_get_i32_array(result))
        case WebGLResultTypeU32Array: return webglUint32Array(canvas_native_webgl_result_get_u32_array(result))
        case WebGLResultTypeF32: return Double(canvas_native_webgl_result_get_f32(result))
        case WebGLResultTypeI32: return Double(canvas_native_webgl_result_get_i32(result))
        case WebGLResultTypeU32: return Double(canvas_native_webgl_result_get_u32(result))
        default: return jsNull
        }
    }

    private func contextAttributes() -> Any? {
        guard let attributes = canvas_native_webgl_get_context_attributes(state) else { return nil }
        defer { canvas_native_context_attributes_destroy(attributes) }
        let powerPreference: String
        switch canvas_native_webgl_context_attribute_get_get_power_preference(attributes) {
        case 0: powerPreference = "default"
        case 1: powerPreference = "high-performance"
        case 2: powerPreference = "low-power"
        default: powerPreference = ""
        }
        return JSObject([
            ("alpha", canvas_native_webgl_context_attribute_get_get_alpha(attributes)),
            ("antialias", canvas_native_webgl_context_attribute_get_get_antialias(attributes)),
            ("depth", canvas_native_webgl_context_attribute_get_get_depth(attributes)),
            ("failIfMajorPerformanceCaveat", canvas_native_webgl_context_attribute_get_get_fail_if_major_performance_caveat(attributes)),
            ("powerPreference", powerPreference),
            ("premultipliedAlpha", canvas_native_webgl_context_attribute_get_get_premultiplied_alpha(attributes)),
            ("preserveDrawingBuffer", canvas_native_webgl_context_attribute_get_get_preserve_drawing_buffer(attributes)),
            ("stencil", canvas_native_webgl_context_attribute_get_get_stencil(attributes)),
            ("desynchronized", canvas_native_webgl_context_attribute_get_get_desynchronized(attributes)),
            ("xrCompatible", canvas_native_webgl_context_attribute_get_get_xr_compatible(attributes)),
        ])
    }

    private func getExtension(_ name: Any?) -> Any? {
        guard let name = name as? String, let ext = canvas_native_webgl_get_extension(name, state) else { return jsNull }
        if canvas_native_webgl_context_extension_is_none(ext) {
            canvas_native_webgl_extension_destroy(ext)
            return jsNull
        }
        let type = canvas_native_webgl_context_extension_get_type(ext)
        // These take the extension over; the others leave it to be destroyed here.
        switch type {
        case WebGLExtensionTypeWebGLExtensionTypeEXT_disjoint_timer_query:
            return canvas_native_webgl_context_extension_to_ext_disjoint_timer_query(ext).map(EXTDisjointTimerQueryHost.init)
        case WebGLExtensionTypeWebGLExtensionTypeOES_vertex_array_object:
            return canvas_native_webgl_context_extension_to_oes_vertex_array_object(ext).map(OESVertexArrayObjectHost.init)
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_lose_context:
            return canvas_native_webgl_context_extension_to_lose_context(ext).map(WEBGLLoseContextHost.init)
        case WebGLExtensionTypeWebGLExtensionTypeANGLE_instanced_arrays:
            return canvas_native_webgl_context_extension_to_angle_instanced_arrays(ext).map(ANGLEInstancedArraysHost.init)
        case WebGLExtensionTypeWebGLExtensionTypeWEBGL_draw_buffers:
            return canvas_native_webgl_context_extension_to_draw_buffers(ext).map(WEBGLDrawBuffersHost.init)
        default:
            canvas_native_webgl_extension_destroy(ext)
            return WebGLConstantsExtensionHost.make(type, webgl2: isWebGL2)
        }
    }

    // MARK: Textures

    private func texImage2D(_ args: Args) {
        let state = self.state
        switch args.count {
        case 5:
            canvas_native_webgl_tex_image2d_image_none(args.int32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), state)
        case 6:
            let (target, level, internalformat, format, type) = (args.int32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4))
            let pixels = args[5]
            if let gl = pixels as? WebGLRenderingContextHost {
                canvas_native_webgl_tex_image2d_webgl(target, level, internalformat, format, type, gl.state, state)
                return
            }
            guard let source = WebGLPixels(pixels) else { return }
            switch source {
            case .imageAsset(let asset), .imageBitmap(let asset):
                canvas_native_webgl_tex_image2d_image_asset(target, level, internalformat, format, type, asset, state)
            case .canvas2D(let context):
                canvas_native_webgl_tex_image2d_canvas2d(target, level, internalformat, format, type, context, state)
            case .imageData(let data):
                withWebGLImageDataPixels(data) { width, height, bytes, count in
                    canvas_native_webgl_tex_image2d(target, level, internalformat, width, height, 0, format, type, bytes, count, state)
                }
            }
        case 8:
            canvas_native_webgl_tex_image2d_none(args.int32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6), args.int32(7), state)
        case 9:
            let (target, level, internalformat) = (args.int32(0), args.int32(1), args.int32(2))
            let (width, height, border, format, type) = (args.int32(3), args.int32(4), args.int32(5), args.int32(6), args.int32(7))
            let value = args[8]
            if jsIsNullish(value) {
                canvas_native_webgl_tex_image2d_none(target, level, internalformat, width, height, border, format, type, state)
            } else if let bytes = webglBytes(value) {
                canvas_native_webgl_tex_image2d(target, level, internalformat, width, height, border, format, type, webglU8(bytes), UInt(bytes.count), state)
            } else if let gl = value as? WebGLRenderingContextHost {
                canvas_native_webgl2_tex_image2d_webgl(target, level, internalformat, UInt32(bitPattern: width), UInt32(bitPattern: height), border, format, type, gl.state, state)
            } else if let source = WebGLPixels(value) {
                let (w, h) = (UInt32(bitPattern: width), UInt32(bitPattern: height))
                switch source {
                case .imageAsset(let asset), .imageBitmap(let asset):
                    canvas_native_webgl2_tex_image2d_image_asset(target, level, internalformat, w, h, border, format, type, asset, state)
                case .canvas2D(let context):
                    canvas_native_webgl2_tex_image2d_canvas2d(target, level, internalformat, w, h, border, format, type, context, state)
                case .imageData(let data):
                    canvas_native_webgl2_tex_image2d_image_data(target, level, internalformat, w, h, border, format, type, data, state)
                }
            }
        default:
            break
        }
    }

    private func texSubImage2D(_ args: Args) {
        let state = self.state
        if args.count == 7 {
            let (target, level, xoffset, yoffset) = (args.uint32(0), args.int32(1), args.int32(2), args.int32(3))
            let (format, type) = (args.uint32(4), args.int32(5))
            let pixels = args[6]
            if let gl = pixels as? WebGLRenderingContextHost {
                canvas_native_webgl_tex_sub_image2d_webgl(target, level, xoffset, yoffset, format, type, gl.state, state)
                return
            }
            guard let source = WebGLPixels(pixels) else { return }
            switch source {
            case .imageAsset(let asset), .imageBitmap(let asset):
                canvas_native_webgl_tex_sub_image2d_asset(target, level, xoffset, yoffset, format, type, asset, state)
            case .canvas2D(let context):
                canvas_native_webgl_tex_sub_image2d_canvas2d(target, level, xoffset, yoffset, format, type, context, state)
            case .imageData(let data):
                withWebGLImageDataPixels(data) { width, height, bytes, count in
                    canvas_native_webgl_tex_sub_image2d(target, level, xoffset, yoffset, width, height, format, Int32(GL.RGBA), bytes, count, state)
                }
            }
        } else if args.count == 9, let bytes = webglBytesToBufferEnd(args[8]) {
            canvas_native_webgl_tex_sub_image2d(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5),
                                                args.uint32(6), args.int32(7), webglU8(bytes), UInt(bytes.count), state)
        }
    }
}
