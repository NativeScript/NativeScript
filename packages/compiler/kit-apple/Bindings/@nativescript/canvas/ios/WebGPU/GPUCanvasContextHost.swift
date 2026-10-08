import Foundation
import NativeScriptKit
import CanvasNative

/// `GPUCanvasContext`, over the context a canvas view made for WebGPU. While its frame callback
/// runs, a texture taken this frame and not presented is presented at the next frame.
final class GPUCanvasContextHost: CanvasHost {
    let context: OpaquePointer?
    private var raf: OpaquePointer?
    private var continuousRender = true

    override class var className: String? { "GPUCanvasContext" }
    override class var methods: Set<String> { Self.names }
    private static let names: Set<String> = [
        "__startRaf", "__stopRaf", "configure", "unconfigure", "getCurrentTexture", "presentSurface", "getCapabilities", "__toDataURL",
    ]

    init(_ context: OpaquePointer?) {
        self.context = context
        super.init()
        raf = canvas_native_raf_create(Int(bitPattern: UnsafeRawPointer(context)), { context, _ in
            gpuFlush(OpaquePointer(bitPattern: context))
        })
        if let raf { canvas_native_raf_start(raf) }
    }

    deinit {
        // The frame callback presents through the context, so it stops before the context goes.
        if let raf { canvas_native_raf_release(raf) }
        if let context { canvas_native_webgpu_context_release(context) }
    }

    override func get(_ key: String) -> Any?? {
        key == "continuousRenderMode" ? .some(continuousRender) : nil
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

    private func startRaf() {
        if let raf, !canvas_native_raf_get_started(raf) { canvas_native_raf_start(raf) }
    }

    private func stopRaf() {
        if let raf, canvas_native_raf_get_started(raf) { canvas_native_raf_stop(raf) }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "getCurrentTexture":
            guard let texture = canvas_native_webgpu_context_get_current_texture(context) else { return .some(nil) }
            guard canvas_native_webgpu_texture_get_status(texture) == SurfaceGetCurrentTextureStatusSuccess else {
                canvas_native_webgpu_texture_release(texture)
                return .some(jsNull)
            }
            return .some(GPUTextureHost(texture))
        case "presentSurface":
            gpuFlush(context)
        case "configure":
            configure(args[0])
        case "unconfigure":
            canvas_native_webgpu_context_unconfigure(context)
        case "getCapabilities":
            return .some(capabilities(args[0]))
        case "__toDataURL":
            let type = (args[0] as? String) ?? "image/png"
            let quality = (args[1] as? Double).map { Float($0) } ?? 0.92
            return .some(gpuOwnedString(canvas_native_webgpu_to_data_url_with_fallback(context, type, quality)) ?? "")
        case "__startRaf":
            startRaf()
        case "__stopRaf":
            stopRaf()
        default:
            return nil
        }
        return .some(nil)
    }

    /// `configure({ device, format, usage?, presentMode?, alphaMode?, size? })`; `viewFormats` is not read.
    private func configure(_ options: Any?) {
        guard gpuIsObject(options) else { return }
        guard let device = gpuMember(options, "device") as? GPUDeviceHost else { return }
        var config = CanvasGPUSurfaceConfiguration()
        config.alphaMode = CanvasGPUSurfaceAlphaModeOpaque
        config.presentMode = CanvasGPUPresentModeFifo
        config.view_formats = nil
        config.view_formats_size = 0
        config.usage = 0x10
        config.format = gpuTextureFormat(gpuMember(options, "format"))
        config.size = nil

        let usage = gpuMember(options, "usage")
        if gpuIsUint32(usage) { config.usage = gpuUint32(usage) }

        let presentMode = gpuMember(options, "presentMode")
        if let s = presentMode as? String {
            switch s {
            case "autoVsync": config.presentMode = CanvasGPUPresentModeAutoVsync
            case "autoNoVsync": config.presentMode = CanvasGPUPresentModeAutoNoVsync
            case "fifo": config.presentMode = CanvasGPUPresentModeFifo
            case "fifoRelaxed": config.presentMode = CanvasGPUPresentModeFifoRelaxed
            case "immediate": config.presentMode = CanvasGPUPresentModeImmediate
            case "mailbox": config.presentMode = CanvasGPUPresentModeMailbox
            default: break
            }
        } else if gpuIsInt32(presentMode) {
            config.presentMode = CanvasGPUPresentMode(rawValue: UInt32(bitPattern: gpuInt32(presentMode)))
        }

        let alphaMode = gpuMember(options, "alphaMode")
        if let s = alphaMode as? String {
            switch s {
            case "premultiplied": config.alphaMode = CanvasGPUSurfaceAlphaModePreMultiplied
            case "opaque": config.alphaMode = CanvasGPUSurfaceAlphaModeOpaque
            case "postmultiplied": config.alphaMode = CanvasGPUSurfaceAlphaModePostMultiplied
            case "inherit": config.alphaMode = CanvasGPUSurfaceAlphaModeInherit
            case "auto": config.alphaMode = CanvasGPUSurfaceAlphaModeAuto
            default: break
            }
        } else if gpuIsInt32(alphaMode) {
            config.alphaMode = CanvasGPUSurfaceAlphaMode(rawValue: UInt32(bitPattern: gpuInt32(alphaMode)))
        }

        var size = gpuExtent3d(gpuMember(options, "size"))
        if size.width > 0 {
            withUnsafePointer(to: &size) { size in
                config.size = size
                canvas_native_webgpu_context_configure(context, device.device, &config)
            }
        } else {
            canvas_native_webgpu_context_configure(context, device.device, &config)
        }
    }

    /// `getCapabilities(adapter)`: `{ format, presentModes, alphaModes, usages }`, empty when the
    /// surface cannot be configured.
    private func capabilities(_ adapterValue: Any?) -> JSObject {
        if gpuIsObject(adapterValue), let adapter = adapterValue as? GPUAdapterHost,
           let capabilities = canvas_native_webgpu_context_get_capabilities(context, adapter.adapter) {
            defer { canvas_native_webgpu_struct_surface_capabilities_release(capabilities) }
            let caps = capabilities.pointee
            return JSObject([
                ("format", JSArray<Any?>(gpuStrings(caps.formats).map { $0 as Any? })),
                ("presentModes", JSArray<Any?>(gpuStrings(caps.present_modes).map { $0 as Any? })),
                ("alphaModes", JSArray<Any?>(gpuStrings(caps.alpha_modes).map { $0 as Any? })),
                ("usages", Double(caps.usages)),
            ])
        }
        return JSObject([
            ("format", JSArray<Any?>()), ("presentModes", JSArray<Any?>()), ("alphaModes", JSArray<Any?>()), ("usages", 0.0),
        ])
    }
}

/// Presents the texture taken this frame if it was not presented yet, else lets it go.
private func gpuFlush(_ context: OpaquePointer?) {
    guard let context, let texture = canvas_native_webgpu_context_has_current_texture(context) else { return }
    if !canvas_native_webgpu_context_has_surface_presented(context) {
        canvas_native_webgpu_context_present_surface(context, texture)
    } else {
        canvas_native_webgpu_texture_release(texture)
    }
}
