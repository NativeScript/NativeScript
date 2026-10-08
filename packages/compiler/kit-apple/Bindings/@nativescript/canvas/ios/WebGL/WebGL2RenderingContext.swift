import Foundation
import NativeScriptKit
import CanvasNative

/// The methods `WebGL2RenderingContext` adds to `WebGLRenderingContext`'s, and `getParameter`, which it replaces.
enum WebGL2Method: String, CaseIterable {
    case beginQuery, beginTransformFeedback, bindBufferBase, bindBufferRange, bindSampler, bindTransformFeedback, bindVertexArray
    case blitFramebuffer, clearBufferfi, clearBufferfv, clearBufferiv, clearBufferuiv, clientWaitSync, compressedTexSubImage3D
    case copyBufferSubData, copyTexSubImage3D, createQuery, createSampler, createTransformFeedback, createVertexArray
    case deleteQuery, deleteSampler, deleteSync, deleteTransformFeedback, deleteVertexArray
    case drawArraysInstanced, drawBuffers, drawElementsInstanced, drawRangeElements, endQuery, endTransformFeedback, fenceSync
    case framebufferTextureLayer
    case uniform1ui, uniform1uiv, uniform2ui, uniform2uiv, uniform3ui, uniform3uiv, uniform4ui, uniform4uiv, uniformBlockBinding
    case uniformMatrix2x3fv, uniformMatrix2x4fv, uniformMatrix3x2fv, uniformMatrix3x4fv, uniformMatrix4x2fv, uniformMatrix4x3fv
    case vertexAttribDivisor, vertexAttribI4i, vertexAttribI4iv, vertexAttribI4ui, vertexAttribI4uiv
    case getActiveUniformBlockName, getActiveUniformBlockParameter, getActiveUniforms, getBufferSubData, getFragDataLocation
    case getIndexedParameter, getInternalformatParameter, getParameter, getQueryParameter, getQuery, getSamplerParameter
    case getSyncParameter, getTransformFeedbackVarying, getUniformBlockIndex, getUniformIndices
    case invalidateFramebuffer, invalidateSubFramebuffer, isQuery, isSampler, isSync, isTransformFeedback, isVertexArray
    case pauseTransformFeedback, readBuffer, renderbufferStorageMultisample, resumeTransformFeedback
    case samplerParameterf, samplerParameteri, texImage3D, texStorage2D, texStorage3D, texSubImage3D, transformFeedbackVaryings

    static let byName = Dictionary(uniqueKeysWithValues: allCases.map { ($0.rawValue, $0) })
    static let names = WebGLMethod.names.union(allCases.map(\.rawValue))
}

/// `WebGL2RenderingContext`.
final class WebGL2RenderingContextHost: WebGLRenderingContextHost {
    init(state: OpaquePointer) { super.init(state: state, webgl2: true) }

    override class var className: String? { "WebGL2RenderingContext" }
    override class var methods: Set<String> { WebGL2Method.names }

    override func get(_ key: String) -> Any?? {
        if let constant = WebGLConstants.webgl2[key] { return .some(constant) }
        return super.get(key)
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard let method = WebGL2Method.byName[key] else { return try super.invoke(key, args) }
        return .some(call2(method, args))
    }

    private func call2(_ method: WebGL2Method, _ args: Args) -> Any? {
        let state = self.state
        switch method {
        case .beginQuery:
            if let query = args.host(1, WebGLQueryHost.self) { canvas_native_webgl2_begin_query(args.uint32(0), query.name, state) }
        case .beginTransformFeedback:
            canvas_native_webgl2_begin_transform_feedback(args.uint32(0), state)
        case .bindBufferBase:
            if let buffer = args.host(2, WebGLBufferHost.self) { canvas_native_webgl2_bind_buffer_base(args.uint32(0), args.uint32(1), buffer.name, state) }
        case .bindBufferRange:
            if let buffer = args.host(2, WebGLBufferHost.self) {
                canvas_native_webgl2_bind_buffer_range(args.uint32(0), args.uint32(1), buffer.name, webglInt(args.number(3)), webglInt(args.number(4)), state)
            }
        case .bindSampler:
            if let sampler = args.host(1, WebGLSamplerHost.self) { canvas_native_webgl2_bind_sampler(args.uint32(0), sampler.name, state) }
        case .bindTransformFeedback:
            if let feedback = args.host(1, WebGLTransformFeedbackHost.self) { canvas_native_webgl2_bind_transform_feedback(args.uint32(0), feedback.name, state) }
        case .bindVertexArray:
            if args[0] is JSNull {
                canvas_native_webgl2_bind_vertex_array(0, state)
            } else if let array = args.host(0, WebGLVertexArrayObjectHost.self) {
                canvas_native_webgl2_bind_vertex_array(array.name, state)
            }
        case .blitFramebuffer:
            canvas_native_webgl2_blit_framebuffer(args.int32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6), args.int32(7),
                                                  args.uint32(8), args.uint32(9), state)
        case .clearBufferfi:
            canvas_native_webgl2_clear_bufferfi(args.uint32(0), args.int32(1), args.float(2), args.int32(3), state)
        case .clearBufferfv:
            let (buffer, drawbuffer) = (args.uint32(0), args.int32(1))
            withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_clear_bufferfv(buffer, drawbuffer, $0, $1, state) }
        case .clearBufferiv:
            let (buffer, drawbuffer) = (args.uint32(0), args.int32(1))
            withWebGLValues(args[2], .int32, array: webglInt32) { canvas_native_webgl2_clear_bufferiv(buffer, drawbuffer, $0, $1, state) }
        case .clearBufferuiv:
            let (buffer, drawbuffer) = (args.uint32(0), args.int32(1))
            withWebGLValues(args[2], .uint32, array: webglUint32) { canvas_native_webgl2_clear_bufferuiv(buffer, drawbuffer, $0, $1, state) }
        case .clientWaitSync:
            guard args.count > 2, let sync = args.host(0, WebGLSyncHost.self) else { return nil }
            return Double(canvas_native_webgl2_client_wait_sync(sync.sync, args.uint32(1), webglInt(args.number(2)), state))
        case .compressedTexSubImage3D:
            compressedTexSubImage3D(args)
        case .copyBufferSubData:
            canvas_native_webgl2_copy_buffer_sub_data(args.uint32(0), args.uint32(1), webglInt(args.number(2)), webglInt(args.number(3)), webglInt(args.number(4)), state)
        case .copyTexSubImage3D:
            canvas_native_webgl2_copy_tex_sub_image3d(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6),
                                                      args.int32(7), args.int32(8), state)
        case .createQuery:
            return WebGLQueryHost(canvas_native_webgl2_create_query(state))
        case .createSampler:
            return WebGLSamplerHost(canvas_native_webgl2_create_sampler(state))
        case .createTransformFeedback:
            return WebGLTransformFeedbackHost(canvas_native_webgl2_create_transform_feedback(state))
        case .createVertexArray:
            return WebGLVertexArrayObjectHost(canvas_native_webgl2_create_vertex_array(state))
        case .deleteQuery:
            if let query = args.host(0, WebGLQueryHost.self) { canvas_native_webgl2_delete_query_with_query(query.name, state) }
        case .deleteSampler:
            if let sampler = args.host(0, WebGLSamplerHost.self) { canvas_native_webgl2_delete_sampler_with_sampler(sampler.name, state) }
        case .deleteSync:
            if let sync = args.host(0, WebGLSyncHost.self) { canvas_native_webgl2_delete_sync_with_sync(sync.sync, state) }
        case .deleteTransformFeedback:
            if let feedback = args.host(0, WebGLTransformFeedbackHost.self) { canvas_native_webgl2_delete_transform_feedback(feedback.name, state) }
        case .deleteVertexArray:
            if let array = args.host(0, WebGLVertexArrayObjectHost.self) { canvas_native_webgl2_delete_vertex_array_with_vertex_array(array.name, state) }
        case .drawArraysInstanced:
            canvas_native_webgl2_draw_arrays_instanced(args.uint32(0), args.int32(1), args.int32(2), args.int32(3), state)
            invalidate()
        case .drawBuffers:
            if let buffers = webglArray(args[0], webglUint32) {
                buffers.withUnsafeBufferPointer { canvas_native_webgl2_draw_buffers($0.baseAddress, UInt($0.count), state) }
            }
        case .drawElementsInstanced:
            canvas_native_webgl2_draw_elements_instanced(args.uint32(0), args.int32(1), args.uint32(2), webglInt(args.number(3)), args.int32(4), state)
            invalidate()
        case .drawRangeElements:
            canvas_native_webgl2_draw_range_elements(args.uint32(0), args.uint32(1), args.uint32(2), args.int32(3), args.uint32(4), webglInt(args.number(5)), state)
            invalidate()
        case .endQuery:
            canvas_native_webgl2_end_query(args.uint32(0), state)
        case .endTransformFeedback:
            canvas_native_webgl2_end_transform_feedback(state)
        case .fenceSync:
            return canvas_native_webgl2_fence_sync(args.uint32(0), args.uint32(1), state).map(WebGLSyncHost.init)
        case .framebufferTextureLayer:
            if let texture = args.host(2, WebGLTextureHost.self) {
                canvas_native_webgl2_framebuffer_texture_layer(args.uint32(0), args.uint32(1), texture.name, args.int32(3), args.int32(4), state)
            }
        case .uniform1ui:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl2_uniform1ui(location.location, args.uint32(1), state) }
        case .uniform2ui:
            if let location = args.host(0, WebGLUniformLocationHost.self) { canvas_native_webgl2_uniform2ui(location.location, args.uint32(1), args.uint32(2), state) }
        case .uniform3ui:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl2_uniform3ui(location.location, args.uint32(1), args.uint32(2), args.uint32(3), state)
            }
        case .uniform4ui:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                canvas_native_webgl2_uniform4ui(location.location, args.uint32(1), args.uint32(2), args.uint32(3), args.uint32(4), state)
            }
        case .uniform1uiv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .uint32, array: webglUint32) { canvas_native_webgl2_uniform1uiv(location.location, $0, $1, state) }
            }
        case .uniform2uiv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .uint32, array: webglUint32) { canvas_native_webgl2_uniform2uiv(location.location, $0, $1, state) }
            }
        case .uniform3uiv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .uint32, array: webglUint32) { canvas_native_webgl2_uniform3uiv(location.location, $0, $1, state) }
            }
        case .uniform4uiv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                withWebGLValues(args[1], .uint32, array: webglUint32) { canvas_native_webgl2_uniform4uiv(location.location, $0, $1, state) }
            }
        case .uniformBlockBinding:
            if let program = args.host(0, WebGLProgramHost.self) { canvas_native_webgl2_uniform_block_binding(program.name, args.uint32(1), args.uint32(2), state) }
        case .uniformMatrix2x3fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix2x3fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix2x4fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix2x4fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix3x2fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix3x2fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix3x4fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix3x4fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix4x2fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix4x2fv(location.location, transpose, $0, $1, state) }
            }
        case .uniformMatrix4x3fv:
            if let location = args.host(0, WebGLUniformLocationHost.self) {
                let transpose = args.bool(1)
                withWebGLValues(args[2], .float32, array: { Float($0) }) { canvas_native_webgl2_uniform_matrix4x3fv(location.location, transpose, $0, $1, state) }
            }
        case .vertexAttribDivisor:
            canvas_native_webgl2_vertex_attrib_divisor(args.uint32(0), args.uint32(1), state)
        case .vertexAttribI4i:
            canvas_native_webgl2_vertex_attrib_i4i(UInt32(bitPattern: args.int32(0)), args.int32(1), args.int32(2), args.int32(3), args.int32(4), state)
        case .vertexAttribI4iv:
            let index = args.uint32(0)
            withWebGLValues(args[1], .int32, array: webglInt32) { canvas_native_webgl2_vertex_attrib_i4iv(index, $0, $1, state) }
        case .vertexAttribI4ui:
            canvas_native_webgl2_vertex_attrib_i4ui(args.uint32(0), args.uint32(1), args.uint32(2), args.uint32(3), args.uint32(4), state)
        case .vertexAttribI4uiv:
            let index = args.uint32(0)
            withWebGLValues(args[1], .uint32, array: webglUint32) { canvas_native_webgl2_vertex_attrib_i4uiv(index, $0, $1, state) }
        case .getActiveUniformBlockName:
            guard let program = args.host(0, WebGLProgramHost.self) else { return "" }
            return webglString(canvas_native_webgl2_get_active_uniform_block_name(program.name, args.uint32(1), state))
        case .getActiveUniformBlockParameter:
            guard let program = args.host(0, WebGLProgramHost.self) else { return nil }
            let pname = args.uint32(2)
            guard let result = canvas_native_webgl2_get_active_uniform_block_parameter(program.name, args.uint32(1), pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            switch pname {
            case GL.UNIFORM_BLOCK_BINDING, GL.UNIFORM_BLOCK_DATA_SIZE, GL.UNIFORM_BLOCK_ACTIVE_UNIFORMS:
                return Double(canvas_native_webgl_result_get_i32(result))
            case GL.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES:
                return webglUint32Array(canvas_native_webgl_result_get_u32_array(result))
            case GL.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER, GL.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER:
                return canvas_native_webgl_result_get_bool(result)
            default:
                return jsNull
            }
        case .getActiveUniforms:
            return activeUniforms(args)
        case .getBufferSubData:
            guard let view = args[2] as? JSBufferSource, !(view is JSArrayBuffer), let bytes = webglBytesToBufferEnd(view) else { return nil }
            let bytesPerElement = view.jsElementKind?.bytesPerElement ?? 0
            let dstOffset = args.isNumber(3) ? webglInt(args.number(3)) &* bytesPerElement : 0
            let length = args.isNumber(4) ? webglInt(args.number(4)) &* bytesPerElement : 0
            canvas_native_webgl2_get_buffer_sub_data(args.uint32(0), webglInt(args.number(1)), webglU8(bytes), UInt(bytes.count),
                                                     UInt(bitPattern: dstOffset), UInt(bitPattern: length), state)
        case .getFragDataLocation:
            guard let program = args.host(0, WebGLProgramHost.self), let name = args.stringIfString(1) else { return jsNull }
            return Double(canvas_native_webgl2_get_frag_data_location(program.name, name, state))
        case .getIndexedParameter:
            let target = args.uint32(0)
            guard let parameter = canvas_native_webgl2_get_indexed_parameter(target, args.uint32(1), state) else { return jsNull }
            switch target {
            case GL.UNIFORM_BUFFER_BINDING, GL.TRANSFORM_FEEDBACK_BUFFER_BINDING:
                return WebGLBufferHost(UInt32(truncatingIfNeeded: canvas_native_webgl2_indexed_parameter_get_buffer_value(parameter)))
            case GL.TRANSFORM_FEEDBACK_BUFFER_SIZE, GL.TRANSFORM_FEEDBACK_BUFFER_START, GL.UNIFORM_BUFFER_SIZE, GL.UNIFORM_BUFFER_START:
                return Double(canvas_native_webgl2_indexed_parameter_get_value(parameter))
            default:
                return jsNull
            }
        case .getInternalformatParameter:
            return internalformatParameter(args)
        case .getParameter:
            return parameter2(args.uint32(0))
        case .getQueryParameter:
            guard let query = args.host(0, WebGLQueryHost.self) else { return jsNull }
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl2_get_query_parameter(query.name, pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            if pname == GL.QUERY_RESULT { return canvas_native_webgl_result_get_bool(result) }
            if pname == GL.QUERY_RESULT_AVAILABLE { return Double(canvas_native_webgl_result_get_u32(result)) }
            return jsNull
        case .getQuery:
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl2_get_query(args.uint32(0), pname, state) else { return nil }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            return pname == GL.CURRENT_QUERY ? Double(canvas_native_webgl_result_get_i32(result)) : nil
        case .getSamplerParameter:
            guard let sampler = args.host(0, WebGLSamplerHost.self) else { return jsNull }
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl2_get_sampler_parameter(sampler.name, pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            switch pname {
            case GL.TEXTURE_MAX_LOD, GL.TEXTURE_MIN_LOD:
                return Double(canvas_native_webgl_result_get_f32(result))
            case GL.TEXTURE_COMPARE_FUNC, GL.TEXTURE_COMPARE_MODE, GL.TEXTURE_MAG_FILTER, GL.TEXTURE_MIN_FILTER, GL.TEXTURE_WRAP_R,
                 GL.TEXTURE_WRAP_S, GL.TEXTURE_WRAP_T:
                return Double(canvas_native_webgl_result_get_i32(result))
            default:
                return jsNull
            }
        case .getSyncParameter:
            guard let sync = args.host(0, WebGLSyncHost.self) else { return jsNull }
            let pname = args.uint32(1)
            guard let result = canvas_native_webgl2_get_sync_parameter(sync.sync, pname, state) else { return jsNull }
            defer { canvas_native_webgl_WebGLResult_destroy(result) }
            switch pname {
            case GL.OBJECT_TYPE, GL.SYNC_STATUS, GL.SYNC_CONDITION, GL.SYNC_FLAGS: return Double(canvas_native_webgl_result_get_i32(result))
            default: return jsNull
            }
        case .getTransformFeedbackVarying:
            guard let program = args.host(0, WebGLProgramHost.self),
                  let info = canvas_native_webgl2_get_transform_feedback_varying(program.name, args.uint32(1), state) else { return jsNull }
            if canvas_native_webgl_active_info_get_is_empty(info) {
                canvas_native_webgl_active_info_destroy(info)
                return jsNull
            }
            return WebGLActiveInfoHost(info)
        case .getUniformBlockIndex:
            guard let program = args.host(0, WebGLProgramHost.self) else { return jsNull }
            return Double(Int32(bitPattern: canvas_native_webgl2_get_uniform_block_index(program.name, args.string(1), state)))
        case .getUniformIndices:
            guard let program = args.host(0, WebGLProgramHost.self), let names = args.array(1) else { return jsNull }
            return withCStrings(names.map(jsToString)) { pointers -> Any? in
                guard let indices = canvas_native_webgl2_get_uniform_indices(program.name, pointers.baseAddress, UInt(pointers.count), state) else { return jsNull }
                defer { canvas_native_u32_buffer_release(indices) }
                let count = Int(canvas_native_u32_buffer_get_length(indices))
                guard let values = canvas_native_u32_buffer_get_bytes(indices) else { return JSArray<Any?>([]) }
                return JSArray<Any?>((0..<count).map { Double(values[$0]) })
            }
        case .invalidateFramebuffer:
            let target = args.uint32(0)
            if let attachments = webglArray(args[1], webglUint32) {
                attachments.withUnsafeBufferPointer { canvas_native_webgl2_invalidate_framebuffer(target, $0.baseAddress, UInt($0.count), state) }
            }
        case .invalidateSubFramebuffer:
            if let attachments = webglArray(args[1], webglUint32) {
                let (target, x, y, width, height) = (args.uint32(0), args.int32(2), args.int32(3), args.int32(4), args.int32(5))
                attachments.withUnsafeBufferPointer {
                    canvas_native_webgl2_invalidate_sub_framebuffer(target, $0.baseAddress, UInt($0.count), x, y, width, height, state)
                }
            }
        case .isQuery:
            guard let query = args.host(0, WebGLQueryHost.self) else { return false }
            return canvas_native_webgl2_is_query(query.name, state)
        case .isSampler:
            guard let sampler = args.host(0, WebGLSamplerHost.self) else { return false }
            return canvas_native_webgl2_is_sampler(sampler.name, state)
        case .isSync:
            guard let sync = args.host(0, WebGLSyncHost.self) else { return false }
            return canvas_native_webgl2_is_sync(sync.sync, state)
        case .isTransformFeedback:
            guard let feedback = args.host(0, WebGLTransformFeedbackHost.self) else { return false }
            return canvas_native_webgl2_is_transform_feedback(feedback.name, state)
        case .isVertexArray:
            guard let array = args.host(0, WebGLVertexArrayObjectHost.self) else { return false }
            return canvas_native_webgl2_is_vertex_array(array.name, state)
        case .pauseTransformFeedback:
            canvas_native_webgl2_pause_transform_feedback(state)
        case .readBuffer:
            canvas_native_webgl2_read_buffer(args.uint32(0), state)
        case .renderbufferStorageMultisample:
            canvas_native_webgl2_renderbuffer_storage_multisample(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), state)
        case .resumeTransformFeedback:
            canvas_native_webgl2_resume_transform_feedback(state)
        case .samplerParameterf:
            if let sampler = args.host(0, WebGLSamplerHost.self) { canvas_native_webgl2_sampler_parameterf(sampler.name, args.uint32(1), args.float(2), state) }
        case .samplerParameteri:
            if let sampler = args.host(0, WebGLSamplerHost.self) { canvas_native_webgl2_sampler_parameteri(sampler.name, args.uint32(1), args.int32(2), state) }
        case .texImage3D:
            texImage3D(args)
        case .texStorage2D:
            canvas_native_webgl2_tex_storage2d(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), state)
        case .texStorage3D:
            canvas_native_webgl2_tex_storage3d(args.uint32(0), args.int32(1), args.uint32(2), args.int32(3), args.int32(4), args.int32(5), state)
        case .texSubImage3D:
            texSubImage3D(args)
        case .transformFeedbackVaryings:
            if let program = args.host(0, WebGLProgramHost.self), let varyings = args.array(1) {
                let bufferMode = args.uint32(2)
                withCStrings(varyings.map(jsToString)) {
                    canvas_native_webgl2_transform_feedback_varyings(program.name, $0.baseAddress, UInt($0.count), bufferMode, state)
                }
            }
        }
        return nil
    }

    /// `getParameter`, with the WebGL 2 pnames WebGL 1's table does not know.
    private func parameter2(_ pname: UInt32) -> Any? {
        guard let result = canvas_native_webgl2_get_parameter(pname, state) else { return jsNull }
        defer { canvas_native_webgl_WebGLResult_destroy(result) }
        switch pname {
        case GL.COPY_READ_BUFFER_BINDING, GL.COPY_WRITE_BUFFER_BINDING, GL.DRAW_FRAMEBUFFER_BINDING,
             GL.MAX_3D_TEXTURE_SIZE, GL.MAX_ARRAY_TEXTURE_LAYERS, GL.MAX_COLOR_ATTACHMENTS, GL.MAX_COMBINED_UNIFORM_BLOCKS,
             GL.MAX_DRAW_BUFFERS, GL.MAX_ELEMENTS_INDICES, GL.MAX_ELEMENTS_VERTICES, GL.MAX_FRAGMENT_INPUT_COMPONENTS,
             GL.MAX_FRAGMENT_UNIFORM_BLOCKS, GL.MAX_FRAGMENT_UNIFORM_COMPONENTS, GL.MAX_PROGRAM_TEXEL_OFFSET, GL.MAX_SAMPLES,
             GL.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS, GL.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS,
             GL.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS, GL.MAX_UNIFORM_BUFFER_BINDINGS, GL.MAX_VARYING_COMPONENTS,
             GL.MAX_VERTEX_OUTPUT_COMPONENTS, GL.MAX_VERTEX_UNIFORM_BLOCKS, GL.MAX_VERTEX_UNIFORM_COMPONENTS, GL.MIN_PROGRAM_TEXEL_OFFSET,
             GL.PACK_ROW_LENGTH, GL.PACK_SKIP_PIXELS, GL.PACK_SKIP_ROWS, GL.READ_BUFFER, GL.UNIFORM_BUFFER_OFFSET_ALIGNMENT,
             GL.UNPACK_IMAGE_HEIGHT, GL.UNPACK_ROW_LENGTH, GL.UNPACK_SKIP_IMAGES, GL.UNPACK_SKIP_PIXELS, GL.UNPACK_SKIP_ROWS:
            return Double(canvas_native_webgl_result_get_i32(result))
        case 0x9247, // MAX_CLIENT_WAIT_TIMEOUT_WEBGL
             GL.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS, GL.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS, GL.MAX_ELEMENT_INDEX,
             GL.MAX_SERVER_WAIT_TIMEOUT, GL.MAX_TEXTURE_LOD_BIAS, GL.MAX_UNIFORM_BLOCK_SIZE:
            return Double(canvas_native_webgl_result_get_f32(result))
        case GL.RASTERIZER_DISCARD, GL.TRANSFORM_FEEDBACK_ACTIVE, GL.TRANSFORM_FEEDBACK_PAUSED:
            return canvas_native_webgl_result_get_bool(result)
        default:
            return parameter(pname, result)
        }
    }

    private func activeUniforms(_ args: Args) -> Any? {
        guard let program = args.host(0, WebGLProgramHost.self), let indices = webglArray(args[1], webglUint32) else { return nil }
        let pname = args.uint32(2)
        let result = indices.withUnsafeBufferPointer {
            canvas_native_webgl2_get_active_uniforms(program.name, $0.baseAddress, UInt($0.count), pname, state)
        }
        guard let result else { return jsNull }
        defer { canvas_native_webgl_WebGLResult_destroy(result) }
        switch pname {
        case GL.UNIFORM_TYPE, GL.UNIFORM_SIZE:
            guard let values = canvas_native_webgl_result_get_u32_array(result) else { return JSArray<Any?>([]) }
            defer { canvas_native_u32_buffer_release(values) }
            let count = Int(canvas_native_u32_buffer_get_length(values))
            guard let elements = canvas_native_u32_buffer_get_bytes(values) else { return JSArray<Any?>([]) }
            return JSArray<Any?>((0..<count).map { Double(elements[$0]) })
        case GL.UNIFORM_BLOCK_INDEX, GL.UNIFORM_OFFSET, GL.UNIFORM_ARRAY_STRIDE, GL.UNIFORM_MATRIX_STRIDE:
            guard let values = canvas_native_webgl_result_get_i32_array(result) else { return JSArray<Any?>([]) }
            defer { canvas_native_i32_buffer_release(values) }
            let count = Int(canvas_native_i32_buffer_get_length(values))
            guard let elements = canvas_native_i32_buffer_get_bytes(values) else { return JSArray<Any?>([]) }
            return JSArray<Any?>((0..<count).map { Double(elements[$0]) })
        case GL.UNIFORM_IS_ROW_MAJOR:
            return webglBoolArray(canvas_native_webgl_result_get_bool_array(result))
        default:
            return jsNull
        }
    }

    private func internalformatParameter(_ args: Args) -> Any? {
        let (target, internalformat, pname) = (args.uint32(0), args.uint32(1), args.uint32(2))
        switch internalformat {
        case GL.RGB, GL.RGBA, GL.R8UI, GL.R8I, GL.R16UI, GL.R16I, GL.R32UI, GL.R32I, GL.RG8UI, GL.RG8I, GL.RG16UI, GL.RG16I, GL.RG32UI,
             GL.RG32I, GL.RGBA8UI, GL.RGBA8I, GL.RGB10_A2UI, GL.RGBA16UI, GL.RGBA16I, GL.RGBA32UI, GL.RGBA32I:
            return webglInt32Array(nil)
        case GL.R8, GL.RG8, GL.RGB565, GL.RGBA8, GL.SRGB8_ALPHA8, GL.RGB5_A1, GL.RGBA4, GL.RGB10_A2, GL.DEPTH_COMPONENT16,
             GL.DEPTH_COMPONENT24, GL.DEPTH_COMPONENT32F, GL.DEPTH24_STENCIL8, GL.DEPTH32F_STENCIL8, GL.STENCIL_INDEX8,
             GL.R16F, GL.RG16F, GL.R32F, GL.RG32F, GL.RGBA32F, GL.R11F_G11F_B10F:
            break
        default:
            return jsNull
        }
        guard let result = canvas_native_webgl2_get_internalformat_parameter(target, internalformat, pname, state) else { return jsNull }
        defer { canvas_native_webgl_WebGLResult_destroy(result) }
        return pname == GL.SAMPLES ? webglInt32Array(canvas_native_webgl_result_get_i32_array(result)) : jsNull
    }

    // MARK: Textures

    private func compressedTexSubImage3D(_ args: Args) {
        guard args.count > 8 else { return }
        let (target, level, xoffset, yoffset, zoffset) = (args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4))
        let (width, height, depth, format) = (args.int32(5), args.int32(6), args.int32(7), args.uint32(8))
        if webglIsObject(args[9]) {
            guard let bytes = webglViewBytes(args[9]) else { return }
            let srcOffset = args.isNumber(10) ? webglUInt(args.number(10)) : 0
            let srcLengthOverride = args.isNumber(11) ? webglUInt(args.number(11)) : 0
            canvas_native_webgl2_compressed_tex_sub_image3d(target, level, xoffset, yoffset, zoffset, width, height, depth, format,
                                                            webglU8(bytes), UInt(bytes.count), srcOffset, srcLengthOverride, state)
        } else {
            let offset = args.isNumber(10) ? args.int32(10) : 0
            canvas_native_webgl2_compressed_tex_sub_image3d_none(target, level, xoffset, yoffset, zoffset, width, height, depth, format,
                                                                 args.int32(9), UInt(bitPattern: Int(offset)), state)
        }
    }

    private func texImage3D(_ args: Args) {
        let state = self.state
        let target = UInt32(bitPattern: args.int32(0))
        let (level, internalformat, width, height, depth, border) = (args.int32(1), args.int32(2), args.int32(3), args.int32(4), args.int32(5), args.int32(6))
        let (format, type) = (UInt32(bitPattern: args.int32(7)), args.uint32(8))
        let source = args[9]
        if args.count == 10 {
            if jsIsNullish(source) {
                canvas_native_webgl2_tex_image3d_none(target, level, internalformat, width, height, depth, border, format, type, 0, state)
            } else if source is Double {
                canvas_native_webgl2_tex_image3d_none(target, level, internalformat, width, height, depth, border, format, type,
                                                      UInt(bitPattern: webglInt(args.number(9))), state)
            } else if let bytes = webglViewBytes(source) {
                canvas_native_webgl2_tex_image3d(target, level, internalformat, width, height, depth, border, format, type, webglU8(bytes), UInt(bytes.count), state)
            } else if let pixels = WebGLPixels(source) {
                switch pixels {
                case .canvas2D(let context):
                    canvas_native_webgl2_tex_image3d_canvas2d(target, level, internalformat, width, height, depth, border, format, type, context, state)
                case .imageAsset(let asset), .imageBitmap(let asset):
                    canvas_native_webgl2_tex_image3d_asset(target, level, internalformat, width, height, depth, border, format, type, asset, state)
                case .imageData(let data):
                    withWebGLImageDataPixels(data) { width, height, bytes, count in
                        canvas_native_webgl2_tex_image3d(target, level, internalformat, width, height, depth, border, format, GL.RGBA, bytes, count, state)
                    }
                }
            }
        } else if args.count > 10, let bytes = webglViewBytes(source) {
            // The C++ binding reads the source offset from the source argument, which for a view is never a number.
            canvas_native_webgl2_tex_image3d_offset(target, level, internalformat, width, height, depth, border, format, type,
                                                    webglU8(bytes), UInt(bytes.count), 0, state)
        }
    }

    private func texSubImage3D(_ args: Args) {
        let state = self.state
        guard args.count >= 11 else { return }
        let (target, level, xoffset, yoffset, zoffset) = (args.uint32(0), args.int32(1), args.int32(2), args.int32(3), args.int32(4))
        let (width, height, depth, format, type) = (args.int32(5), args.int32(6), args.int32(7), args.uint32(8), args.uint32(9))
        let source = args[10]
        if args.count == 11 {
            if source is Double {
                canvas_native_webgl2_tex_sub_image3d_none(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type,
                                                          UInt(bitPattern: webglInt(args.number(10))), state)
            } else if let bytes = webglViewBytes(source) {
                canvas_native_webgl2_tex_sub_image3d(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type,
                                                     webglU8(bytes), UInt(bytes.count), state)
            } else if let pixels = WebGLPixels(source) {
                switch pixels {
                case .imageAsset(let asset):
                    canvas_native_webgl2_tex_sub_image3d_asset(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, asset, state)
                case .canvas2D(let context):
                    canvas_native_webgl2_tex_sub_image3d_canvas2d(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, context, state)
                case .imageData(let data):
                    withWebGLImageDataPixels(data) { width, height, bytes, count in
                        canvas_native_webgl2_tex_sub_image3d(target, level, xoffset, yoffset, zoffset, width, height, depth, format, GL.RGBA, bytes, count, state)
                    }
                case .imageBitmap:
                    break
                }
            }
        } else if let bytes = webglViewBytes(source) {
            let srcOffset = (args.isNumber(11) ? webglUInt(args.number(11)) : 0).multipliedReportingOverflow(by: UInt(bytes.count)).partialValue
            guard srcOffset <= UInt(bytes.count) else { return }
            canvas_native_webgl2_tex_sub_image3d_offset(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type,
                                                        webglU8(bytes), UInt(bytes.count), srcOffset, state)
        }
    }
}

/// Calls `body` with the strings as C strings, alive for the call.
private func withCStrings<R>(_ strings: [String], _ body: (UnsafeBufferPointer<UnsafePointer<CChar>?>) -> R) -> R {
    let copies = strings.map { strdup($0) }
    defer { copies.forEach { free($0) } }
    let pointers = copies.map { UnsafePointer($0) }
    return pointers.withUnsafeBufferPointer(body)
}
