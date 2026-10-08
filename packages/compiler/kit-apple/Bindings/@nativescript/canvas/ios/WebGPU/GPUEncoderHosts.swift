import Foundation
import NativeScriptKit
import CanvasNative

/// `GPUCommandEncoder`.
final class GPUCommandEncoderHost: GPUObjectHost {
    private(set) var encoder: OpaquePointer?

    override class var className: String? { "GPUCommandEncoder" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "beginComputePass", "beginRenderPass", "clearBuffer", "copyBufferToBuffer", "copyBufferToTexture",
        "copyTextureToBuffer", "copyTextureToTexture", "finish", "insertDebugMarker", "popDebugGroup", "pushDebugGroup",
        "resolveQuerySet", "writeTimestamp", "destroy",
    ]

    init(_ encoder: OpaquePointer) { self.encoder = encoder }
    deinit { if let encoder { canvas_native_webgpu_command_encoder_release(encoder) } }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? encoder.flatMap { gpuOwnedString(canvas_native_webgpu_command_encoder_get_label($0)) } ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "beginRenderPass":
            return .some(beginRenderPass(args[0]))
        case "beginComputePass":
            return .some(beginComputePass(args[0]))
        case "finish":
            let descriptor = args[0]
            let label = gpuIsObject(descriptor) ? gpuLabel(gpuMember(descriptor, "label")) : nil
            let buffer = gpuWithCString(label) { canvas_native_webgpu_command_encoder_finish(encoder, $0) }
            return .some(buffer.map(GPUCommandBufferHost.init))
        case "destroy":
            if let encoder { canvas_native_webgpu_command_encoder_release(encoder) }
            encoder = nil
            return .some(nil)
        case "clearBuffer":
            guard gpuIsObject(args[0]), let buffer = args[0] as? GPUBufferHost else { return .some(nil) }
            canvas_native_webgpu_command_encoder_clear_buffer(
                encoder, buffer.buffer, (args[1] as? Double).map(gpuInt64) ?? -1, (args[2] as? Double).map(gpuInt64) ?? -1)
            return .some(nil)
        case "copyBufferToBuffer":
            guard let source = args[0] as? GPUBufferHost, let destination = args[2] as? GPUBufferHost else { return .some(nil) }
            canvas_native_webgpu_command_encoder_copy_buffer_to_buffer(
                encoder, source.buffer, gpuInt64(args.number(1)), destination.buffer, gpuInt64(args.number(3)),
                (args[4] as? Double).map(gpuInt64) ?? -1)
            return .some(nil)
        case "copyBufferToTexture":
            guard gpuIsObject(args[0]), gpuIsObject(args[1]), gpuIsObject(args[2]) else { return .some(nil) }
            var source = gpuImageCopyBuffer(args[0])
            var destination = gpuImageCopyTexture(args[1])
            var size = gpuExtent3d(args[2])
            canvas_native_webgpu_command_encoder_copy_buffer_to_texture(encoder, &source, &destination, &size)
            return .some(nil)
        case "copyTextureToBuffer":
            guard gpuIsObject(args[0]), gpuIsObject(args[1]), gpuIsObject(args[2]) else { return .some(nil) }
            var source = gpuImageCopyTexture(args[0])
            var destination = gpuImageCopyBuffer(args[1])
            var size = gpuExtent3d(args[2])
            canvas_native_webgpu_command_encoder_copy_texture_to_buffer(encoder, &source, &destination, &size)
            return .some(nil)
        case "copyTextureToTexture":
            guard gpuIsObject(args[0]), gpuIsObject(args[1]), gpuIsObject(args[2]) else { return .some(nil) }
            var source = gpuImageCopyTexture(args[0])
            var destination = gpuImageCopyTexture(args[1])
            var size = gpuExtent3d(args[2])
            canvas_native_webgpu_command_encoder_copy_texture_to_texture(encoder, &source, &destination, &size)
            return .some(nil)
        case "insertDebugMarker":
            if let label = args[0] as? String { canvas_native_webgpu_command_encoder_insert_debug_marker(encoder, label) }
            return .some(nil)
        case "popDebugGroup":
            canvas_native_webgpu_command_encoder_pop_debug_group(encoder)
            return .some(nil)
        case "pushDebugGroup":
            if let label = args[0] as? String { canvas_native_webgpu_command_encoder_push_debug_group(encoder, label) }
            return .some(nil)
        case "resolveQuerySet":
            guard let querySet = args[0] as? GPUQuerySetHost, let destination = args[3] as? GPUBufferHost else { return .some(nil) }
            canvas_native_webgpu_command_encoder_resolve_query_set(
                encoder, querySet.querySet, args.uint32(1), args.uint32(2), destination.buffer, gpuUInt64(args.number(4)))
            return .some(nil)
        case "writeTimestamp":
            guard let querySet = args[0] as? GPUQuerySetHost else { return .some(nil) }
            canvas_native_webgpu_command_encoder_write_timestamp(encoder, querySet.querySet, args.uint32(1))
            return .some(nil)
        default:
            return nil
        }
    }

    /// `{ label?, timestampWrites?: { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex } }`.
    private func beginComputePass(_ descriptor: Any?) -> Any? {
        var label: String?
        var querySet: OpaquePointer?
        var beginning: Int32 = -1
        var end: Int32 = -1
        if gpuIsObject(descriptor) {
            label = gpuLabel(gpuMember(descriptor, "label"))
            let timestampWrites = gpuMember(descriptor, "timestampWrites")
            if gpuIsObject(timestampWrites) {
                querySet = (gpuMember(timestampWrites, "querySet") as? GPUQuerySetHost)?.querySet
                let b = gpuMember(timestampWrites, "beginningOfPassWriteIndex")
                if gpuIsInt32(b) { beginning = gpuInt32(b) }
                let e = gpuMember(timestampWrites, "endOfPassWriteIndex")
                if gpuIsInt32(e) { end = gpuInt32(e) }
            }
        }
        let pass = gpuWithCString(label) {
            canvas_native_webgpu_command_encoder_begin_compute_pass(encoder, querySet, $0, beginning, end)
        }
        return pass.map(GPUComputePassEncoderHost.init)
    }

    /// `{ label?, colorAttachments, depthStencilAttachment?, occlusionQuerySet?, timestampWrites? }`.
    /// An attachment that is not an object is passed with no view.
    private func beginRenderPass(_ descriptor: Any?) -> Any? {
        guard gpuIsObject(descriptor) else { return nil }
        let label = gpuLabel(gpuMember(descriptor, "label"))

        var colorAttachments: [CanvasRenderPassColorAttachment] = []
        if let attachments = gpuMember(descriptor, "colorAttachments") as? JSArrayProtocol {
            let count = attachments.jsLength
            colorAttachments.reserveCapacity(count)
            for i in 0..<count {
                let attachment = jsFlat(attachments.jsElement(at: i))
                let channel = CanvasPassChannelColor(
                    load_op: gpuLoadOp(gpuMember(attachment, "loadOp")),
                    store_op: gpuStoreOp(gpuMember(attachment, "storeOp")),
                    clear_value: gpuColor(gpuMember(attachment, "clearValue")),
                    read_only: false)
                colorAttachments.append(CanvasRenderPassColorAttachment(
                    view: (gpuMember(attachment, "view") as? GPUTextureViewHost)?.view,
                    resolve_target: (gpuMember(attachment, "resolveTarget") as? GPUTextureViewHost)?.view,
                    channel: channel))
            }
        }

        var depthStencil: CanvasRenderPassDepthStencilAttachment?
        let depthStencilValue = gpuMember(descriptor, "depthStencilAttachment")
        if gpuIsObject(depthStencilValue) {
            depthStencil = gpuDepthStencilAttachment(depthStencilValue)
        }

        let occlusionQuerySet = (gpuMember(descriptor, "occlusionQuerySet") as? GPUQuerySetHost)?.querySet
        var querySet: OpaquePointer?
        var beginning: Int32 = -1
        var end: Int32 = -1
        let timestampWrites = gpuMember(descriptor, "timestampWrites")
        if gpuIsObject(timestampWrites) {
            querySet = (gpuMember(timestampWrites, "querySet") as? GPUQuerySetHost)?.querySet
            let b = gpuMember(timestampWrites, "beginningOfPassWriteIndex")
            if gpuIsInt32(b) { beginning = gpuInt32(b) }
            let e = gpuMember(timestampWrites, "endOfPassWriteIndex")
            if gpuIsInt32(e) { end = gpuInt32(e) }
        }

        let pass = colorAttachments.withUnsafeBufferPointer { attachments in
            gpuWithCString(label) { label in
                if var depthStencil {
                    return canvas_native_webgpu_command_encoder_begin_render_pass(
                        encoder, label, attachments.baseAddress, UInt(attachments.count), &depthStencil,
                        occlusionQuerySet, querySet, beginning, end)
                }
                return canvas_native_webgpu_command_encoder_begin_render_pass(
                    encoder, label, attachments.baseAddress, UInt(attachments.count), nil,
                    occlusionQuerySet, querySet, beginning, end)
            }
        }
        return pass.map(GPURenderPassEncoderHost.init)
    }
}

private func gpuDepthStencilAttachment(_ value: Any?) -> CanvasRenderPassDepthStencilAttachment {
    var attachment = CanvasRenderPassDepthStencilAttachment()
    attachment.view = (gpuMember(value, "view") as? GPUTextureViewHost)?.view
    attachment.depth_clear_value.tag = CanvasOptionF32None
    if let d = gpuMember(value, "depthClearValue") as? Double {
        attachment.depth_clear_value.tag = CanvasOptionF32Some
        attachment.depth_clear_value.some = Float(d)
    }
    attachment.depth_load_op = gpuOptionalLoadOp(gpuMember(value, "depthLoadOp"))
    attachment.depth_store_op = gpuOptionalStoreOp(gpuMember(value, "depthStoreOp"))
    attachment.depth_read_only = (gpuMember(value, "depthReadOnly") as? Bool) ?? false
    let stencilClear = gpuMember(value, "stencilClearValue")
    attachment.stencil_clear_value = gpuIsUint32(stencilClear) ? gpuUint32(stencilClear) : 0
    attachment.stencil_load_op = gpuOptionalLoadOp(gpuMember(value, "stencilLoadOp"))
    attachment.stencil_store_op = gpuOptionalStoreOp(gpuMember(value, "stencilStoreOp"))
    attachment.stencil_read_only = (gpuMember(value, "stencilReadOnly") as? Bool) ?? false
    return attachment
}

private func gpuOptionalLoadOp(_ value: Any?) -> CanvasOptionalLoadOp {
    var op = CanvasOptionalLoadOp()
    op.tag = CanvasOptionalLoadOpNone
    switch value as? String {
    case "load":
        op.tag = CanvasOptionalLoadOpSome
        op.some = CanvasLoadOpLoad
    case "clear":
        op.tag = CanvasOptionalLoadOpSome
        op.some = CanvasLoadOpClear
    default: break
    }
    return op
}

private func gpuOptionalStoreOp(_ value: Any?) -> CanvasOptionalStoreOp {
    var op = CanvasOptionalStoreOp()
    op.tag = CanvasOptionalStoreOpNone
    switch value as? String {
    case "store":
        op.tag = CanvasOptionalStoreOpSome
        op.some = CanvasStoreOpStore
    case "discard":
        op.tag = CanvasOptionalStoreOpSome
        op.some = CanvasStoreOpDiscard
    default: break
    }
    return op
}

/// `GPURenderPassEncoder`.
final class GPURenderPassEncoderHost: GPUObjectHost {
    private(set) var pass: OpaquePointer?

    override class var className: String? { "GPURenderPassEncoder" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "beginOcclusionQuery", "draw", "drawIndexed", "drawIndexedIndirect", "drawIndirect", "multiDrawIndexedIndirect",
        "multiDrawIndirect", "end", "endOcclusionQuery", "executeBundles", "insertDebugMarker", "popDebugGroup",
        "pushDebugGroup", "setBindGroup", "setBlendConstant", "setIndexBuffer", "setPipeline", "setScissorRect",
        "setStencilReference", "setVertexBuffer", "setViewport", "destroy",
    ]

    init(_ pass: OpaquePointer) { self.pass = pass }
    deinit { if let pass { canvas_native_webgpu_render_pass_encoder_release(pass) } }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? pass.flatMap { gpuOwnedString(canvas_native_webgpu_render_pass_encoder_get_label($0)) } ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "draw":
            guard gpuIsUint32(args[0]) else { return .some(nil) }
            canvas_native_webgpu_render_pass_encoder_draw(
                pass, gpuUint32(args[0]),
                gpuIsUint32(args[1]) ? gpuUint32(args[1]) : 1,
                gpuIsUint32(args[2]) ? gpuUint32(args[2]) : 0,
                gpuIsUint32(args[3]) ? gpuUint32(args[3]) : 0)
        case "drawIndexed":
            guard gpuIsUint32(args[0]) else { return .some(nil) }
            canvas_native_webgpu_render_pass_encoder_draw_indexed(
                pass, gpuUint32(args[0]),
                gpuIsUint32(args[1]) ? gpuUint32(args[1]) : 1,
                gpuIsUint32(args[2]) ? gpuUint32(args[2]) : 0,
                gpuIsInt32(args[3]) ? gpuInt32(args[3]) : 0,
                gpuIsUint32(args[4]) ? gpuUint32(args[4]) : 0)
        case "setPipeline":
            if let pipeline = args[0] as? GPURenderPipelineHost {
                canvas_native_webgpu_render_pass_encoder_set_pipeline(pass, pipeline.pipeline)
            }
        case "setBindGroup":
            gpuSetBindGroup(args) { canvas_native_webgpu_render_pass_encoder_set_bind_group(pass, $0, $1, $2, $3, $4, $5) }
        case "setVertexBuffer":
            guard let buffer = args[1] as? GPUBufferHost else { return .some(nil) }
            canvas_native_webgpu_render_pass_encoder_set_vertex_buffer(
                pass, args.uint32(0), buffer.buffer, (args[2] as? Double).map(gpuInt64) ?? -1, (args[3] as? Double).map(gpuInt64) ?? -1)
        case "setIndexBuffer":
            gpuSetIndexBuffer(args) { canvas_native_webgpu_render_pass_encoder_set_index_buffer(pass, $0, $1, $2, $3) }
        case "setViewport":
            canvas_native_webgpu_render_pass_encoder_set_viewport(
                pass, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5))
        case "setScissorRect":
            canvas_native_webgpu_render_pass_encoder_set_scissor_rect(pass, args.uint32(0), args.uint32(1), args.uint32(2), args.uint32(3))
        case "end":
            canvas_native_webgpu_render_pass_encoder_end(pass)
        case "destroy":
            if let pass { canvas_native_webgpu_render_pass_encoder_release(pass) }
            pass = nil
        case "setBlendConstant":
            guard gpuIsObject(args[0]) else { return .some(nil) }
            var color = gpuColor(args[0])
            if color.tag == CanvasOptionalColorSome {
                canvas_native_webgpu_render_pass_encoder_set_blend_constant(pass, &color.some)
            }
        case "setStencilReference":
            if gpuIsUint32(args[0]) { canvas_native_webgpu_render_pass_encoder_set_stencil_reference(pass, gpuUint32(args[0])) }
        case "beginOcclusionQuery":
            if gpuIsUint32(args[0]) { canvas_native_webgpu_render_pass_encoder_begin_occlusion_query(pass, gpuUint32(args[0])) }
        case "endOcclusionQuery":
            canvas_native_webgpu_render_pass_encoder_end_occlusion_query(pass)
        case "drawIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_pass_encoder_draw_indirect(pass, buffer.buffer, gpuUInt64(args.number(1)))
            }
        case "drawIndexedIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_pass_encoder_draw_indexed_indirect(pass, buffer.buffer, gpuUInt64(args.number(1)))
            }
        case "multiDrawIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_pass_encoder_multi_draw_indirect(pass, buffer.buffer, gpuUInt64(args.number(1)), args.uint32(2))
            }
        case "multiDrawIndexedIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_pass_encoder_multi_draw_indexed_indirect(
                    pass, buffer.buffer, gpuUInt64(args.number(1)), args.uint32(2))
            }
        case "executeBundles":
            guard let bundles = args[0] as? JSArrayProtocol else { return .some(nil) }
            let pointers: [OpaquePointer?] = bundles.jsAnyElements.compactMap { (jsFlat($0) as? GPURenderBundleHost)?.bundle }
            if !pointers.isEmpty {
                pointers.withUnsafeBufferPointer {
                    canvas_native_webgpu_render_pass_encoder_execute_bundles(pass, $0.baseAddress, UInt($0.count))
                }
            }
        case "insertDebugMarker":
            if let label = args[0] as? String { canvas_native_webgpu_render_pass_encoder_insert_debug_marker(pass, label) }
        case "popDebugGroup":
            canvas_native_webgpu_render_pass_encoder_pop_debug_group(pass)
        case "pushDebugGroup":
            if let label = args[0] as? String { canvas_native_webgpu_render_pass_encoder_push_debug_group(pass, label) }
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `GPUComputePassEncoder`.
final class GPUComputePassEncoderHost: GPUObjectHost {
    private(set) var pass: OpaquePointer?

    override class var className: String? { "GPUComputePassEncoder" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "dispatchWorkgroups", "dispatchWorkgroupsIndirect", "end", "insertDebugMarker", "popDebugGroup", "pushDebugGroup",
        "setBindGroup", "setPipeline", "destroy",
    ]

    init(_ pass: OpaquePointer) { self.pass = pass }
    deinit { if let pass { canvas_native_webgpu_compute_pass_encoder_release(pass) } }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? pass.flatMap { gpuOwnedString(canvas_native_webgpu_compute_pass_encoder_get_label($0)) } ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "dispatchWorkgroups":
            guard gpuIsUint32(args[0]) else { return .some(nil) }
            canvas_native_webgpu_compute_pass_encoder_dispatch_workgroups(
                pass, gpuUint32(args[0]), gpuIsUint32(args[1]) ? gpuUint32(args[1]) : 1, gpuIsUint32(args[2]) ? gpuUint32(args[2]) : 1)
        case "dispatchWorkgroupsIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_compute_pass_encoder_dispatch_workgroups_indirect(pass, buffer.buffer, gpuSize(args.number(1)))
            }
        case "setPipeline":
            if let pipeline = args[0] as? GPUComputePipelineHost {
                canvas_native_webgpu_compute_pass_encoder_set_pipeline(pass, pipeline.pipeline)
            }
        case "setBindGroup":
            gpuSetBindGroup(args) { canvas_native_webgpu_compute_pass_encoder_set_bind_group(pass, $0, $1, $2, $3, $4, $5) }
        case "end":
            canvas_native_webgpu_compute_pass_encoder_end(pass)
        case "destroy":
            if let pass { canvas_native_webgpu_compute_pass_encoder_release(pass) }
            pass = nil
        case "insertDebugMarker":
            if let label = args[0] as? String { canvas_native_webgpu_compute_pass_encoder_insert_debug_marker(pass, label) }
        case "popDebugGroup":
            canvas_native_webgpu_compute_pass_encoder_pop_debug_group(pass)
        case "pushDebugGroup":
            if let label = args[0] as? String { canvas_native_webgpu_compute_pass_encoder_push_debug_group(pass, label) }
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `GPURenderBundleEncoder`.
final class GPURenderBundleEncoderHost: GPUObjectHost {
    let encoder: OpaquePointer

    override class var className: String? { "GPURenderBundleEncoder" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "draw", "drawIndexed", "drawIndexedIndirect", "drawIndirect", "finish", "insertDebugMarker", "popDebugGroup",
        "pushDebugGroup", "setBindGroup", "setIndexBuffer", "setPipeline", "setVertexBuffer",
    ]

    init(_ encoder: OpaquePointer) { self.encoder = encoder }
    deinit { canvas_native_webgpu_render_bundle_encoder_release(encoder) }

    override func readLazy(_ key: String) -> Any? {
        key == "label" ? gpuOwnedString(canvas_native_webgpu_render_bundle_encoder_get_label(encoder)) ?? "" : nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "draw":
            guard gpuIsUint32(args[0]) else { return .some(nil) }
            canvas_native_webgpu_render_bundle_encoder_draw(
                encoder, gpuUint32(args[0]),
                gpuIsUint32(args[1]) ? gpuUint32(args[1]) : 1,
                gpuIsUint32(args[2]) ? gpuUint32(args[2]) : 0,
                gpuIsUint32(args[3]) ? gpuUint32(args[3]) : 0)
        case "drawIndexed":
            guard gpuIsUint32(args[0]) else { return .some(nil) }
            canvas_native_webgpu_render_bundle_encoder_draw_indexed(
                encoder, gpuUint32(args[0]),
                gpuIsUint32(args[1]) ? gpuUint32(args[1]) : 1,
                gpuIsUint32(args[2]) ? gpuUint32(args[2]) : 0,
                gpuIsInt32(args[3]) ? gpuInt32(args[3]) : 0,
                gpuIsUint32(args[4]) ? gpuUint32(args[4]) : 0)
        case "drawIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_bundle_encoder_draw_indirect(encoder, buffer.buffer, gpuUInt64(args.number(1)))
            }
        case "drawIndexedIndirect":
            if let buffer = args[0] as? GPUBufferHost {
                canvas_native_webgpu_render_bundle_encoder_draw_indexed_indirect(encoder, buffer.buffer, gpuUInt64(args.number(1)))
            }
        case "finish":
            // Bundles are made unlabeled: the descriptor's label is not passed on.
            return .some(canvas_native_webgpu_render_bundle_encoder_finish(encoder, nil).map(GPURenderBundleHost.init))
        case "setPipeline":
            if let pipeline = args[0] as? GPURenderPipelineHost {
                canvas_native_webgpu_render_bundle_encoder_set_pipeline(encoder, pipeline.pipeline)
            }
        case "setBindGroup":
            gpuSetBindGroup(args) { canvas_native_webgpu_render_bundle_encoder_set_bind_group(encoder, $0, $1, $2, $3, $4, $5) }
        case "setIndexBuffer":
            gpuSetIndexBuffer(args) { canvas_native_webgpu_render_bundle_encoder_set_index_buffer(encoder, $0, $1, $2, $3) }
        case "setVertexBuffer":
            guard gpuIsUint32(args[0]), let buffer = args[1] as? GPUBufferHost else { return .some(nil) }
            canvas_native_webgpu_render_bundle_encoder_set_vertex_buffer(
                encoder, gpuUint32(args[0]), buffer.buffer, (args[2] as? Double).map(gpuInt64) ?? -1, (args[3] as? Double).map(gpuInt64) ?? -1)
        case "insertDebugMarker":
            if let label = args[0] as? String { canvas_native_webgpu_render_bundle_encoder_insert_debug_marker(encoder, label) }
        case "popDebugGroup":
            canvas_native_webgpu_render_bundle_encoder_pop_debug_group(encoder)
        case "pushDebugGroup":
            if let label = args[0] as? String { canvas_native_webgpu_render_bundle_encoder_push_debug_group(encoder, label) }
        default:
            return nil
        }
        return .some(nil)
    }
}
