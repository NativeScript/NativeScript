import Foundation
import NativeScriptKit
import CanvasNative

/// CanvasModule's 2D context, Path2D, ImageData, DOMMatrix, gradients, patterns, text metrics, ImageAsset, ImageBitmap, TextEncoder and TextDecoder.
enum Canvas2DPart: CanvasModulePart {
    static let classes: [String: JSConstructor] = [
        "TextDecoder": JSConstructor { try TextDecoderHost(Args($0)) },
        "TextEncoder": JSConstructor { try TextEncoderHost(Args($0)) },
        "Path2D": JSConstructor { Path2DHost(Args($0)) },
        "ImageData": JSConstructor { try ImageDataHost(Args($0)) },
        "ImageAsset": JSConstructor { _ in ImageAssetHost() },
        // RUNTIME: the engine's ImageBitmap constructor also has a static `fromAsset(asset)`.
        "ImageBitmap": JSConstructor { _ in ImageBitmapHost(nil) },
        "CanvasGradient": JSConstructor { _ in CanvasGradientHost(nil) },
        "CanvasPattern": JSConstructor { _ in CanvasPatternHost(nil) },
        "DOMMatrix": JSConstructor { DOMMatrixHost(Args($0)) },
        "TextMetrics": JSConstructor { _ in TextMetricsHost() },
    ]

    static let functions: Set<String> = [
        "create2DContext", "create2DContextWithPointer", "createImageBitmap", "readFile", "getMime",
        "__addFontFamily", "__addFontData", "__base64Encode", "__base64Decode", "__base64DecodeAsync",
    ]

    static func call(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "create2DContextWithPointer":
            guard let context = canvas_native_context_create_with_pointer(args.pointer(0)) else { return .some(jsNull) }
            return .some(CanvasRenderingContext2DHost(context, ownsContext: false))
        case "create2DContext":
            guard let context = OpaquePointer(bitPattern: Int(args.pointer(0))) else { return .some(jsNull) }
            return .some(CanvasRenderingContext2DHost(context, ownsContext: true))
        case "createImageBitmap":
            try createImageBitmap(args)
            return .some(nil)
        case "readFile":
            readFile(args, withMime: true)
            return .some(nil)
        case "getMime":
            readFile(args, withMime: false)
            return .some(nil)
        case "__addFontFamily":
            addFontFamily(args)
            return .some(nil)
        case "__addFontData":
            addFontData(args)
            return .some(nil)
        case "__base64Encode":
            let data = Array(args.string(0).utf8)
            if data.isEmpty { return .some("") }
            return .some(takeOneByteString(canvas_native_helper_base64_encode(data, UInt(data.count))))
        case "__base64Decode":
            let data = Array(args.string(0).utf8)
            if data.isEmpty { return .some("") }
            return .some(decodedPair(canvas_native_helper_base64_decode(data, UInt(data.count))))
        case "__base64DecodeAsync":
            // Read as a C string: the engine binding stops at a NUL here.
            let data = Array(args.string(0).utf8.prefix { $0 != 0 })
            let (promise, resolve, _) = JSPromise<Any?>.withResolvers()
            CanvasWorker.run {
                let decoded = canvas_native_helper_base64_decode(data, UInt(data.count))
                CanvasWorker.onMain { resolve(decodedPair(decoded)) }
            }
            return .some(promise)
        default:
            return nil
        }
    }

    // MARK: Base64

    /// `[decoded as a one-byte string, decoded as an ArrayBuffer]`, or "" when nothing decoded.
    private static func decodedPair(_ decoded: OpaquePointer?) -> Any? {
        guard let decoded else { return "" }
        defer { canvas_native_u8_buffer_release(decoded) }
        let bytes = UnsafeBufferPointer(start: canvas_native_u8_buffer_get_bytes(decoded), count: Int(canvas_native_u8_buffer_get_length(decoded)))
        return JSArray<Any?>([oneByteString(bytes), JSArrayBuffer(data: Data(buffer: bytes))])
    }

    // MARK: Fonts

    private static func addFontFamily(_ args: Args) {
        guard let family = args.array(1) else { return }
        let paths = family.compactMap { jsFlat($0) as? String }
        let cPaths: [UnsafePointer<CChar>?] = paths.map { UnsafePointer(strdup($0)) }
        defer { cPaths.forEach { free(UnsafeMutablePointer(mutating: $0)) } }
        if let alias = args.stringIfString(0) {
            alias.withCString { canvas_native_font_add_family($0, cPaths, UInt(cPaths.count)) }
        } else {
            canvas_native_font_add_family(nil, cPaths, UInt(cPaths.count))
        }
    }

    private static func addFontData(_ args: Args) {
        let bytes: UnsafeMutableRawBufferPointer
        switch args[1] {
        case let buffer as JSArrayBuffer:
            bytes = buffer.jsBytes
        case let view as JSBufferSource where jsClassNameOf(view) != "DataView":
            // A typed array gives the whole buffer it views, as the engine binding reads it.
            bytes = (member(view, "buffer") as? JSArrayBuffer)?.jsBytes ?? view.jsBytes
        default:
            return
        }
        let data = bytes.baseAddress?.assumingMemoryBound(to: UInt8.self)
        if let alias = args.stringIfString(0) {
            alias.withCString { canvas_native_font_add_family_with_bytes($0, data, UInt(bytes.count)) }
        } else {
            canvas_native_font_add_family_with_bytes(nil, data, UInt(bytes.count))
        }
    }

    // MARK: Files

    /// `readFile(path, callback)` and `getMime(path, callback)`: the file read off the main
    /// thread, then `callback(null, result)` or `callback(error, null)` on it. readFile's result
    /// is `{ buffer, mime, extension }`, getMime's the buffer alone.
    private static func readFile(_ args: Args, withMime: Bool) {
        let path = args.string(0)
        let callback = args[1]
        CanvasWorker.run {
            let file = path.withCString { canvas_native_helper_read_file($0) }
            var data: OpaquePointer?
            var error: String?
            if !canvas_native_helper_read_file_has_error(file) {
                data = canvas_native_helper_read_file_take_data(file)
            } else {
                error = takeString(canvas_native_helper_read_file_get_error(file))
            }
            canvas_native_helper_release(file)
            CanvasWorker.onMain {
                guard error == nil else {
                    callScript(callback, [JSError(error ?? ""), jsNull], swallow: true)
                    return
                }
                var mime: String?, fileExtension: String?
                if withMime, let data, let bytes = canvas_native_u8_buffer_get_bytes(data),
                   let info = canvas_native_helper_get_mime(bytes, canvas_native_u8_buffer_get_length(data)) {
                    mime = info.pointee.mime_type.map { String(cString: $0) }
                    fileExtension = info.pointee.extension.map { String(cString: $0) }
                    canvas_native_helper_release_mime(info)
                }
                let buffer = takeArrayBuffer(data)
                guard withMime else {
                    callScript(callback, [jsNull, buffer], swallow: true)
                    return
                }
                var entries: [(String, Any?)] = [("buffer", buffer)]
                if let mime { entries.append(("mime", mime)) }
                if let fileExtension { entries.append(("extension", fileExtension)) }
                callScript(callback, [jsNull, JSObject(entries)], swallow: true)
            }
        }
    }

    // MARK: createImageBitmap

    /// `createImageBitmap(image, [sx, sy, sw, sh,] [options,] callback)`: calls back
    /// `(null, bitmap)` or `(message, null)`. Encoded bytes, image assets, bitmaps and image
    /// data decode off the main thread; a 2D context is read at once.
    private static func createImageBitmap(_ args: Args) throws {
        let count = args.count
        let image = args[0]
        let len = count - 1
        let callback = count > 0 ? args[count - 1] : nil
        let illegal = JSException(JSError("Illegal constructor"))

        if (len == 1 && !isJSObject(image)) || image is JSFunction { throw illegal }
        if len == 0 { throw illegal }
        guard isJSObject(callback) else { throw illegal }

        func finish(_ output: OpaquePointer?, _ error: String) throws {
            guard let f = callback as? JSFunction else { return }
            if let output {
                _ = try f([jsNull, ImageBitmapHost(output)])
            } else {
                _ = try f([error, jsNull])
            }
        }

        if jsIsNullish(image) {
            try finish(nil, "Failed to load image")
            return
        }

        let undecodable = "Failed to execute 'createImageBitmap' : The provided source could not be decoded"

        if let source = image as? JSBufferSource, [1, 2, 5, 6].contains(len) {
            // The engine binding takes no crop rect for encoded bytes.
            let options = len == 2 ? BitmapOptions(args[1]) : len == 6 ? BitmapOptions(args[5]) : BitmapOptions()
            let bytes = source.jsBytes
            CanvasWorker.run {
                let asset = canvas_native_image_asset_create()
                _ = withExtendedLifetime(source) {
                    canvas_native_image_bitmap_create_from_encoded_bytes_with_output(
                        bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count),
                        options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality,
                        options.resizeWidth, options.resizeHeight, asset)
                }
                CanvasWorker.onMain { callScript(callback, [jsNull, ImageBitmapHost(asset)]) }
            }
            return
        }

        var options = BitmapOptions()
        var rect: (x: Float, y: Float, width: Float, height: Float)?
        if len == 2 {
            options = BitmapOptions(args[1])
        } else if len == 5 || len == 6 {
            if len == 6 { options = BitmapOptions(args[5]) }
            rect = (args.float(1), args.float(2), args.float(3), args.float(4))
        } else if len != 1 {
            try finish(nil, "Failed to execute 'createImageBitmap' : Invalid argument count")
            return
        }

        let output = canvas_native_image_asset_create()

        let decode: (() -> Bool)?
        switch image {
        case let data as ImageDataHost:
            guard let source = data.syncedImageData() else {
                decode = nil
                break
            }
            decode = {
                withExtendedLifetime(data) {
                    if let rect {
                        return canvas_native_image_bitmap_create_from_image_data_src_rect_with_output(source, rect.x, rect.y, rect.width, rect.height, options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality, options.resizeWidth, options.resizeHeight, output)
                    }
                    return canvas_native_image_bitmap_create_from_image_data_with_output(source, options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality, options.resizeWidth, options.resizeHeight, output)
                }
            }
        case let asset as ImageAssetHost:
            decode = asset.asset.map { decodeAsset(canvas_native_image_asset_reference($0), rect, options, output) }
        case let bitmap as ImageBitmapHost:
            decode = bitmap.asset.map { decodeAsset(canvas_native_image_asset_reference($0), rect, options, output) }
        case let context as CanvasRenderingContext2DHost:
            let done = canvas_native_image_bitmap_create_from_context_with_output(
                context.context, rect?.x ?? 0, rect?.y ?? 0, rect?.width ?? 0, rect?.height ?? 0, rect != nil,
                options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality,
                options.resizeWidth, options.resizeHeight, output)
            if done {
                try finish(output, "")
            } else {
                canvas_native_image_asset_release(output)
                try finish(nil, undecodable)
            }
            return
        default:
            decode = nil
        }

        guard let decode else {
            canvas_native_image_asset_release(output)
            try finish(nil, undecodable)
            return
        }
        CanvasWorker.run {
            let done = decode()
            CanvasWorker.onMain {
                if done {
                    callScript(callback, [jsNull, ImageBitmapHost(output)])
                } else {
                    canvas_native_image_asset_release(output)
                    callScript(callback, [undecodable, jsNull])
                }
            }
        }
    }

    /// Decodes a referenced asset into `output`, releasing the reference.
    private static func decodeAsset(_ source: OpaquePointer?, _ rect: (x: Float, y: Float, width: Float, height: Float)?, _ options: BitmapOptions, _ output: OpaquePointer?) -> () -> Bool {
        {
            defer { canvas_native_image_asset_release(source) }
            if let rect {
                return canvas_native_image_bitmap_create_from_asset_src_rect_with_output(source, rect.x, rect.y, rect.width, rect.height, options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality, options.resizeWidth, options.resizeHeight, output)
            }
            return canvas_native_image_bitmap_create_from_asset_with_output(source, options.flipY, options.premultiplyAlpha, options.colorSpaceConversion, options.resizeQuality, options.resizeWidth, options.resizeHeight, output)
        }
    }
}

/// `createImageBitmap`'s options object, as `ImageBitmapImpl::HandleOptions` reads it.
private struct BitmapOptions {
    var flipY = false
    var premultiplyAlpha = ImageBitmapPremultiplyAlphaDefault
    var colorSpaceConversion = ImageBitmapColorSpaceConversionDefault
    var resizeQuality = ImageBitmapResizeQualityLow
    var resizeWidth: Float = 0
    var resizeHeight: Float = 0

    init() {}

    init(_ value: Any?) {
        guard isJSObject(value) else { return }
        if member(value, "imageOrientation") as? String == "flipY" { flipY = true }
        if let flip = member(value, "flipY") as? Bool { flipY = flip }
        switch member(value, "premultiplyAlpha") as? String {
        case "premultiply": premultiplyAlpha = ImageBitmapPremultiplyAlphaPremultiply
        case "none": premultiplyAlpha = ImageBitmapPremultiplyAlphaAlphaNone
        default: break
        }
        if member(value, "colorSpaceConversion") as? String == "none" { colorSpaceConversion = ImageBitmapColorSpaceConversionNone }
        switch member(value, "resizeQuality") as? String {
        case "medium": resizeQuality = ImageBitmapResizeQualityMedium
        case "high": resizeQuality = ImageBitmapResizeQualityHigh
        case "pixelated": resizeQuality = ImageBitmapResizeQualityPixelated
        default: break
        }
        if let width = member(value, "resizeWidth") as? Double { resizeWidth = Float(width) }
        if let height = member(value, "resizeHeight") as? Double { resizeHeight = Float(height) }
    }
}
