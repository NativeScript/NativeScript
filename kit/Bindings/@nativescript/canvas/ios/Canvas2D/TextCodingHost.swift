import Foundation
import NativeScriptKit
import CanvasNative

/// The label a TextEncoder or TextDecoder is made with: `utf-8` when none is given, and a
/// non-string sole argument an Error naming the class.
private func encodingLabel(_ args: Args, _ className: String) throws -> String {
    if args.count == 1 && !args.isString(0) {
        throw JSException(JSError("Failed to construct '\(className)': The encoding label provided (\(jsToString(args[0]))') is invalid"))
    }
    return args.count == 1 ? args.string(0) : "utf-8"
}

/// `TextEncoder`.
final class TextEncoderHost: CanvasHost {
    let encoder: OpaquePointer?

    override class var className: String? { "TextEncoder" }
    override class var methods: Set<String> { ["encode"] }
    override var jsKeys: [String] { ["encoding"] }

    init(_ args: Args) throws {
        let label = try encodingLabel(args, "TextEncoder")
        encoder = label.withCString { canvas_native_text_encoder_create($0) }
    }

    deinit { if let encoder { canvas_native_text_encoder_release(encoder) } }

    override func get(_ key: String) -> Any?? {
        guard key == "encoding" else { return nil }
        guard let encoder else { return .some("") }
        return .some(takeString(canvas_native_text_encoder_get_encoding(encoder)))
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "encode" else { return nil }
        guard let encoder else { return .some(nil) }
        let encoded = args.string(0).withCString { canvas_native_text_encoder_encode(encoder, $0) }
        // TYPED-ARRAY: Uint8ClampedArray
        return .some(try JSUint8Array(buffer: takeArrayBuffer(encoded)))
    }
}

/// `TextDecoder`. What it decodes it gives as the engine binding makes the string: one byte per
/// character (Latin-1), so text beyond ASCII comes out as its UTF-8 bytes.
final class TextDecoderHost: CanvasHost {
    let decoder: OpaquePointer?

    override class var className: String? { "TextDecoder" }
    override class var methods: Set<String> { ["decode", "decodeAsync"] }
    override var jsKeys: [String] { ["encoding"] }

    private static let notABuffer = "Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'"

    init(_ args: Args) throws {
        let label = try encodingLabel(args, "TextDecoder")
        decoder = label.withCString { canvas_native_text_decoder_create($0) }
    }

    deinit { if let decoder { canvas_native_text_decoder_release(decoder) } }

    override func get(_ key: String) -> Any?? {
        guard key == "encoding" else { return nil }
        guard let decoder else { return .some("") }
        return .some(takeString(canvas_native_text_decoder_get_encoding(decoder)))
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "decode":
            guard let decoder else { return .some("") }
            guard args.count == 1 else { return .some("") }
            guard let source = args.buffer(0) else { throw JSException(JSError(Self.notABuffer)) }
            let bytes = source.jsBytes
            let data = bytes.baseAddress?.assumingMemoryBound(to: UInt8.self)
            if source is JSArrayBuffer {
                return .some(takeOneByteString(canvas_native_text_decoder_decode(decoder, data, UInt(bytes.count))))
            }
            return .some(takeOneByteString(cow: canvas_native_text_decoder_decode_as_cow(decoder, data, UInt(bytes.count))))
        case "decodeAsync":
            let (promise, resolve, reject) = JSPromise<Any?>.withResolvers()
            guard isJSObject(args[0]) else {
                reject(JSError(Self.notABuffer))
                return .some(promise)
            }
            guard let decoder else {
                resolve("")
                return .some(promise)
            }
            guard let source = args.buffer(0) else {
                reject(JSError(Self.notABuffer))
                return .some(promise)
            }
            let bytes = source.jsBytes
            CanvasWorker.run {
                let decoded = withExtendedLifetime((self, source)) {
                    canvas_native_text_decoder_decode_as_cow(decoder, bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count))
                }
                CanvasWorker.onMain { resolve(takeOneByteString(cow: decoded)) }
            }
            return .some(promise)
        default:
            return nil
        }
    }
}
