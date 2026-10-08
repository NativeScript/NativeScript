import Foundation
import NativeScriptKit
import CanvasNative

/// `ImageAsset`: an image the 2D context draws, loaded from a URL, a file or bytes. The
/// callback forms load off the main thread and call back on it with whether they loaded.
final class ImageAssetHost: CanvasHost {
    let asset: OpaquePointer?

    override class var className: String? { "ImageAsset" }
    override class var methods: Set<String> {
        ["__getRef", "fromUrlSync", "fromUrlCb", "fromFileSync", "fromFileCb", "fromBytesSync", "fromBytesCb", "fromEncodedBytesSync", "fromEncodedBytesCb"]
    }
    override var jsKeys: [String] { ["width", "height", "error", "__addr"] }

    override init() { asset = canvas_native_image_asset_create() }
    deinit { if let asset { canvas_native_image_asset_release(asset) } }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "width": return .some(Double(asset.map(canvas_native_image_asset_width) ?? 0))
        case "height": return .some(Double(asset.map(canvas_native_image_asset_height) ?? 0))
        case "error":
            guard let asset else { return .some("") }
            return .some(takeString(canvas_native_image_asset_get_error(asset)))
        case "__addr":
            guard let asset else { return .some("") }
            return .some(String(canvas_native_image_asset_get_addr(asset)))
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard let asset else {
            switch key {
            case "__getRef": return .some("")
            case "fromUrlSync", "fromFileSync", "fromBytesSync", "fromEncodedBytesSync": return .some(false)
            default: return Self.methods.contains(key) ? .some(nil) : nil
            }
        }
        switch key {
        case "__getRef":
            return .some(imageAssetReferenceAddress(asset))
        case "fromUrlSync":
            return .some(args.string(0).withCString { canvas_native_image_asset_load_from_url(asset, $0) })
        case "fromFileSync":
            return .some(args.string(0).withCString { canvas_native_image_asset_load_from_path(asset, $0) })
        case "fromBytesSync":
            guard let source = args.buffer(2) else { return .some(false) }
            let bytes = source.jsBytes
            let width = args.uint32(0), height = args.uint32(1)
            let premultiplied = args.count > 3 && args.bool(3)
            let data = bytes.baseAddress?.assumingMemoryBound(to: UInt8.self)
            return .some(premultiplied
                ? canvas_native_image_asset_load_from_raw_premultiplied(asset, width, height, data, UInt(bytes.count))
                : canvas_native_image_asset_load_from_raw(asset, width, height, data, UInt(bytes.count)))
        case "fromEncodedBytesSync":
            guard let source = args.buffer(0) else { return .some(false) }
            let bytes = source.jsBytes
            return .some(canvas_native_image_asset_load_from_raw_encoded(asset, bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count)))
        case "fromUrlCb":
            guard args.count >= 2 else { break }
            let url = args.string(0)
            loadInBackground(args[1]) { asset in url.withCString { canvas_native_image_asset_load_from_url(asset, $0) } }
        case "fromFileCb":
            guard args.count >= 2 else { break }
            let path = args.string(0)
            loadInBackground(args[1]) { asset in path.withCString { canvas_native_image_asset_load_from_path(asset, $0) } }
        case "fromBytesCb":
            guard args.count >= 2, let source = args.buffer(2) else { break }
            let width = args.uint32(0), height = args.uint32(1)
            let bytes = source.jsBytes
            loadInBackground(args[3]) { asset in
                withExtendedLifetime(source) {
                    canvas_native_image_asset_load_from_raw(asset, width, height, bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count))
                }
            }
        case "fromEncodedBytesCb":
            guard args.count >= 2, let source = args.buffer(0) else { break }
            let bytes = source.jsBytes
            loadInBackground(args[1]) { asset in
                withExtendedLifetime(source) {
                    canvas_native_image_asset_load_from_raw_encoded(asset, bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count))
                }
            }
        default:
            return nil
        }
        return .some(nil)
    }

    /// Loads into this asset off the main thread, then calls `callback(done)` on it.
    private func loadInBackground(_ callback: Any?, _ load: @escaping (OpaquePointer?) -> Bool) {
        let reference = canvas_native_image_asset_reference(asset)
        CanvasWorker.run {
            let done = load(reference)
            canvas_native_image_asset_release(reference)
            CanvasWorker.onMain { callScript(callback, [done]) }
        }
    }
}

/// `ImageBitmap`, which `createImageBitmap` makes. Constructed by script, it has no image.
final class ImageBitmapHost: CanvasHost {
    let asset: OpaquePointer?
    private var closed = false

    override class var className: String? { "ImageBitmap" }
    override class var methods: Set<String> { ["close", "__getRef"] }
    override var jsKeys: [String] { ["width", "height", "__addr"] }

    init(_ asset: OpaquePointer?) { self.asset = asset }
    deinit { if let asset { canvas_native_image_asset_release(asset) } }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "width":
            guard let asset, !closed else { return .some(0.0) }
            return .some(Double(canvas_native_image_asset_width(asset)))
        case "height":
            guard let asset, !closed else { return .some(0.0) }
            return .some(Double(canvas_native_image_asset_height(asset)))
        case "__addr":
            guard let asset else { return .some("") }
            return .some(String(canvas_native_image_asset_get_addr(asset)))
        default: return nil
        }
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "close":
            if let asset {
                canvas_native_image_asset_close(asset)
                closed = true
            }
            return .some(nil)
        case "__getRef":
            guard let asset else { return .some("") }
            return .some(imageAssetReferenceAddress(asset))
        default:
            return nil
        }
    }
}

/// The address of a new reference to the asset, which is released at once (`__getRef`).
private func imageAssetReferenceAddress(_ asset: OpaquePointer) -> String {
    let reference = canvas_native_image_asset_reference(asset)
    defer { canvas_native_image_asset_release(reference) }
    return String(canvas_native_image_asset_get_addr(reference))
}
