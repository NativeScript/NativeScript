import Foundation
import NativeScriptKit
import CanvasNative

/// `Path2D`. Made of anything but no argument, a string or a Path2D, it has no path and its
/// methods do nothing.
final class Path2DHost: CanvasHost {
    let path: OpaquePointer?

    override class var className: String? { "Path2D" }
    override class var methods: Set<String> {
        ["addPath", "arc", "arcTo", "bezierCurveTo", "closePath", "ellipse", "lineTo", "moveTo", "quadraticCurveTo", "rect", "roundRect", "trim", "__toSVG"]
    }

    init(_ args: Args) {
        if args.count == 0 {
            path = canvas_native_path_create()
        } else if let d = args.stringIfString(0) {
            path = d.withCString { canvas_native_path_create_with_string($0) }
        } else if let other = args.host(0, Path2DHost.self), let source = other.path {
            path = canvas_native_path_create_with_path(source)
        } else {
            path = nil
        }
    }

    deinit { if let path { canvas_native_path_release(path) } }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard let path else {
            switch key {
            case "__toSVG": return .some("")
            default: return Self.methods.contains(key) ? .some(nil) : nil
            }
        }
        switch key {
        case "moveTo":
            canvas_native_path_move_to(path, args.float(0), args.float(1))
        case "lineTo":
            canvas_native_path_line_to(path, args.float(0), args.float(1))
        case "arc":
            let anticlockwise = args.count == 6 ? args.bool(5) : false
            canvas_native_path_arc(path, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), anticlockwise)
        case "arcTo":
            canvas_native_path_arc_to(path, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4))
        case "bezierCurveTo":
            canvas_native_path_bezier_curve_to(path, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5))
        case "quadraticCurveTo":
            canvas_native_path_quadratic_curve_to(path, args.float(0), args.float(1), args.float(2), args.float(3))
        case "closePath":
            canvas_native_path_close_path(path)
        case "ellipse":
            let anticlockwise = args.count > 7 ? args.bool(7) : false
            canvas_native_path_ellipse(path, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), anticlockwise)
        case "rect":
            canvas_native_path_rect(path, args.float(0), args.float(1), args.float(2), args.float(3))
        case "roundRect":
            guard args.count == 5 else { break }
            let x = args.float(0), y = args.float(1), width = args.float(2), height = args.float(3)
            if isJSObject(args[4]) {
                if let radii = args.array(4), radii.count >= 1 {
                    let store = floats(radii)
                    canvas_native_path_round_rect(path, x, y, width, height, store, UInt(store.count))
                }
            } else {
                let r = args.float(4)
                canvas_native_path_round_rect_tl_tr_br_bl(path, x, y, width, height, r, r, r, r)
            }
        case "addPath":
            guard let other = args.host(0, Path2DHost.self), let source = other.path else { break }
            var matrix: OpaquePointer?
            if args.count > 1, let m = args.host(1, DOMMatrixHost.self) { matrix = m.matrix }
            canvas_native_path_add_path_with_matrix(path, source, matrix)
        case "trim":
            canvas_native_path_trim(path, args.float(0), args.float(1))
        case "__toSVG":
            return .some(takeOneByteString(canvas_native_path_to_string(path)))
        default:
            return nil
        }
        return .some(nil)
    }
}

/// `DOMMatrix`. Made of anything but no argument or an array of 6 or 16 numbers, it has no
/// matrix: its properties are undefined and its methods do nothing.
final class DOMMatrixHost: CanvasHost {
    let matrix: OpaquePointer?

    override class var className: String? { "DOMMatrix" }
    override class var methods: Set<String> {
        ["translate", "translateSelf", "multiplySelf", "premultiplySelf", "scaleNonUniform", "scaleNonUniformSelf", "rotate", "rotateSelf", "skewX", "skewXSelf", "skewY", "skewYSelf"]
    }
    override var jsKeys: [String] { Self.components.keys.sorted() }

    private typealias Component = (get: (OpaquePointer?) -> Float, set: (OpaquePointer?, Float) -> Void)
    private static let components: [String: Component] = [
        "a": (canvas_native_matrix_get_a, canvas_native_matrix_set_a),
        "b": (canvas_native_matrix_get_b, canvas_native_matrix_set_b),
        "c": (canvas_native_matrix_get_c, canvas_native_matrix_set_c),
        "d": (canvas_native_matrix_get_d, canvas_native_matrix_set_d),
        "e": (canvas_native_matrix_get_e, canvas_native_matrix_set_e),
        "f": (canvas_native_matrix_get_f, canvas_native_matrix_set_f),
        "m11": (canvas_native_matrix_get_m11, canvas_native_matrix_set_m11),
        "m12": (canvas_native_matrix_get_m12, canvas_native_matrix_set_m12),
        "m13": (canvas_native_matrix_get_m13, canvas_native_matrix_set_m13),
        "m14": (canvas_native_matrix_get_m14, canvas_native_matrix_set_m14),
        "m21": (canvas_native_matrix_get_m21, canvas_native_matrix_set_m21),
        "m22": (canvas_native_matrix_get_m22, canvas_native_matrix_set_m22),
        "m23": (canvas_native_matrix_get_m23, canvas_native_matrix_set_m23),
        "m24": (canvas_native_matrix_get_m24, canvas_native_matrix_set_m24),
        "m31": (canvas_native_matrix_get_m31, canvas_native_matrix_set_m31),
        "m32": (canvas_native_matrix_get_m32, canvas_native_matrix_set_m32),
        "m33": (canvas_native_matrix_get_m33, canvas_native_matrix_set_m33),
        "m34": (canvas_native_matrix_get_m34, canvas_native_matrix_set_m34),
        "m41": (canvas_native_matrix_get_m41, canvas_native_matrix_set_m41),
        "m42": (canvas_native_matrix_get_m42, canvas_native_matrix_set_m42),
        "m43": (canvas_native_matrix_get_m43, canvas_native_matrix_set_m43),
        "m44": (canvas_native_matrix_get_m44, canvas_native_matrix_set_m44),
    ]

    init(_ matrix: OpaquePointer?) { self.matrix = matrix }

    convenience init(_ args: Args) {
        guard args.count > 0 else {
            self.init(canvas_native_matrix_create())
            return
        }
        guard let values = args.array(0), values.count == 6 || values.count == 16 else {
            self.init(nil)
            return
        }
        let matrix = canvas_native_matrix_create()
        let buffer = floats(values)
        if values.count == 6 {
            canvas_native_matrix_update(matrix, buffer, UInt(buffer.count))
        } else {
            canvas_native_matrix_update_3d(matrix, buffer, UInt(buffer.count))
        }
        self.init(matrix)
    }

    deinit { if let matrix { canvas_native_matrix_release(matrix) } }

    override func get(_ key: String) -> Any?? {
        guard let component = Self.components[key] else { return nil }
        guard let matrix else { return .some(nil) }
        return .some(Double(component.get(matrix)))
    }

    override func set(_ key: String, _ value: Any?) throws -> Bool {
        guard let component = Self.components[key] else { return false }
        if let matrix { component.set(matrix, Float(jsToNumber(value))) }
        return true
    }

    /// A new DOMMatrix of what the C API made, undefined when it made none.
    private static func wrap(_ matrix: OpaquePointer?) -> Any?? {
        guard let matrix else { return .some(nil) }
        return .some(DOMMatrixHost(matrix))
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "translate":
            guard args.count >= 3, let other = args.host(2, DOMMatrixHost.self)?.matrix else { return .some(nil) }
            return Self.wrap(canvas_native_matrix_translate(args.float(0), args.float(1), other))
        case "scaleNonUniform":
            guard args.count >= 3, let other = args.host(2, DOMMatrixHost.self)?.matrix else { return .some(nil) }
            return Self.wrap(canvas_native_matrix_scale_non_uniform(args.float(0), args.float(1), other))
        case "rotate":
            guard args.count >= 4, let other = args.host(3, DOMMatrixHost.self)?.matrix else { return .some(nil) }
            return Self.wrap(canvas_native_matrix_rotate(args.float(0), args.float(1), args.float(2), other))
        case "skewX":
            guard args.count >= 2, let other = args.host(1, DOMMatrixHost.self)?.matrix else { return .some(nil) }
            return Self.wrap(canvas_native_matrix_skew_x(args.float(0), other))
        case "skewY":
            guard args.count >= 2, let other = args.host(1, DOMMatrixHost.self)?.matrix else { return .some(nil) }
            return Self.wrap(canvas_native_matrix_skew_y(args.float(0), other))
        case "translateSelf", "multiplySelf", "premultiplySelf", "scaleNonUniformSelf", "rotateSelf", "skewXSelf", "skewYSelf":
            if let matrix { updateSelf(matrix, key, args) }
            return .some(nil)
        default:
            return nil
        }
    }

    private func updateSelf(_ matrix: OpaquePointer, _ key: String, _ args: Args) {
        switch key {
        case "translateSelf":
            if args.count >= 2 { canvas_native_matrix_translate_self(matrix, args.float(0), args.float(1)) }
        case "multiplySelf":
            if args.count >= 1, let other = args.host(0, DOMMatrixHost.self)?.matrix { canvas_native_matrix_multiply_self(matrix, other) }
        case "premultiplySelf":
            if args.count >= 1, let other = args.host(0, DOMMatrixHost.self)?.matrix { canvas_native_matrix_premultiply_self(matrix, other) }
        case "scaleNonUniformSelf":
            if args.count >= 2 { canvas_native_matrix_scale_non_uniform_self(matrix, args.float(0), args.float(1)) }
        case "rotateSelf":
            if args.count >= 2 { canvas_native_matrix_rotate_self(matrix, args.float(0), args.float(1), args.float(2)) }
        case "skewXSelf":
            if args.count >= 1 { canvas_native_matrix_skew_x_self(matrix, args.float(0)) }
        case "skewYSelf":
            if args.count >= 1 { canvas_native_matrix_skew_y_self(matrix, args.float(0)) }
        default:
            break
        }
    }
}

/// `ImageData`. Its `data` is made once and kept, as the engine's lazy data property is: a
/// Uint8ClampedArray over the native pixels, which holds its own reference to them.
final class ImageDataHost: CanvasHost {
    let imageData: OpaquePointer?
    private var dataArray: JSUint8ClampedArray?

    override class var className: String? { "ImageData" }
    override var jsKeys: [String] { ["width", "height", "data"] }

    init(_ imageData: OpaquePointer?) { self.imageData = imageData }

    convenience init(_ args: Args) throws {
        if args.count == 1 && !args.isString(0) {
            // The engine binding's message, which names TextEncoder.
            throw JSException(JSError("Failed to construct 'TextEncoder': The encoding label provided (\(jsToString(args[0]))') is invalid"))
        }
        if args.isNumber(0) {
            self.init(canvas_native_context_create_image_data(args.cInt(0), args.cInt(1)))
        } else if let source = args.buffer(0), source.jsElementKind == .uint8Clamped {
            let bytes = source.jsBytes
            self.init(canvas_native_context_create_image_data_with_data(args.cInt(1), args.cInt(2), bytes.baseAddress?.assumingMemoryBound(to: UInt8.self), UInt(bytes.count)))
        } else {
            self.init(nil)
        }
    }

    deinit { if let imageData { canvas_native_image_data_release(imageData) } }

    override func get(_ key: String) -> Any?? {
        switch key {
        case "width": return .some(Double(imageData.map(canvas_native_image_data_get_width) ?? 0))
        case "height": return .some(Double(imageData.map(canvas_native_image_data_get_height) ?? 0))
        case "data":
            if let dataArray { return .some(dataArray) }
            guard let imageData else { return .some(nil) }
            dataArray = takeClampedArrayNoCopy(canvas_native_image_data_get_data(imageData))
            return .some(dataArray)
        default: return nil
        }
    }
}

/// `CanvasGradient`, which the 2D context makes.
final class CanvasGradientHost: CanvasHost {
    let style: OpaquePointer?

    override class var className: String? { "CanvasGradient" }
    override class var methods: Set<String> { ["addColorStop"] }

    init(_ style: OpaquePointer?) { self.style = style }
    deinit { if let style { canvas_native_paint_style_release(style) } }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "addColorStop" else { return nil }
        if let style {
            let stop = args.float(0)
            args.string(1).withCString { canvas_native_gradient_add_color_stop(style, stop, $0) }
        }
        return .some(nil)
    }
}

/// `CanvasPattern`, which the 2D context makes.
final class CanvasPatternHost: CanvasHost {
    let style: OpaquePointer?

    override class var className: String? { "CanvasPattern" }
    override class var methods: Set<String> { ["setTransform"] }

    init(_ style: OpaquePointer?) { self.style = style }
    deinit { if let style { canvas_native_paint_style_release(style) } }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        guard key == "setTransform" else { return nil }
        if let style, let m = args.host(0, DOMMatrixHost.self), let matrix = m.matrix {
            canvas_native_pattern_set_transform(style, matrix)
        }
        return .some(nil)
    }
}

/// `TextMetrics`, as `measureText` gives it: its twelve values, read when it was made.
final class TextMetricsHost: CanvasHost {
    /// In the order `canvas_native_context_measure_text_to` writes them.
    static let keys = ["width", "actualBoundingBoxLeft", "actualBoundingBoxRight", "actualBoundingBoxAscent", "actualBoundingBoxDescent",
                       "fontBoundingBoxAscent", "fontBoundingBoxDescent", "emHeightAscent", "emHeightDescent",
                       "hangingBaseline", "alphabeticBaseline", "ideographicBaseline"]
    private static let index = Dictionary(uniqueKeysWithValues: keys.enumerated().map { ($1, $0) })

    let values: [Float]

    override class var className: String? { "TextMetrics" }
    override var jsKeys: [String] { Self.keys }

    init(_ values: [Float] = Array(repeating: 0, count: 12)) { self.values = values }

    override func get(_ key: String) -> Any?? {
        guard let i = Self.index[key] else { return nil }
        return .some(Double(values[i]))
    }
}
