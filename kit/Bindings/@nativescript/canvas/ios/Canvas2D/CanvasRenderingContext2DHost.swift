import Foundation
import NativeScriptKit
import CanvasNative

/// `CanvasRenderingContext2D`, as `create2DContext` and `create2DContextWithPointer` make it.
///
/// Drawing marks the context dirty; a frame callback of the C API (`Raf`) renders a dirty
/// context once per display frame while continuous render mode is on. `font`, `letterSpacing`
/// and `wordSpacing` are kept here and reach the C API only before text is drawn, measured or
/// the state is saved.
final class CanvasRenderingContext2DHost: CanvasHost {
    let context: OpaquePointer
    private let ownsContext: Bool
    private var raf: OpaquePointer?
    private let rafTarget: Unmanaged<RafTarget>

    /// `InvalidateState` bits: pending (1), invalidating (2).
    private var invalidateState: UInt32 = 0
    private var continuousRender = true

    private var cachedFont = ""
    private var cachedLetterSpacing = ""
    private var cachedWordSpacing = ""
    private var fontDirty = false
    private var letterSpacingDirty = false
    private var wordSpacingDirty = false

    override class var className: String? { "CanvasRenderingContext2D" }
    override class var methods: Set<String> { Self.methodNames }
    override var jsKeys: [String] { Self.propertyNames }

    private static let methodNames: Set<String> = [
        "__startRaf", "__stopRaf", "drawPoint", "drawPoints", "drawPaint", "__makeDirty", "__getPointer", "__resize",
        "addHitRegion", "arc", "arcTo", "beginPath", "bezierCurveTo", "clearHitRegions", "clearRect", "clip", "closePath",
        "createImageData", "createPattern", "createLinearGradient", "createConicGradient", "__createPatternWithNative",
        "createRadialGradient", "drawFocusIfNeeded", "drawAtlas", "drawImage", "ellipse", "fill", "fillRect", "fillText",
        "fillOval", "getImageData", "getLineDash", "isPointInPath", "isPointInStroke", "lineTo", "measureText", "moveTo",
        "putImageData", "quadraticCurveTo", "roundRect", "rect", "removeHitRegion", "resetTransform", "restore", "rotate",
        "save", "scale", "scrollPathIntoView", "setLineDash", "setTransform", "getTransform", "stroke", "strokeRect",
        "strokeText", "strokeOval", "transform", "translate", "__toDataURL",
    ]

    private static let propertyNames = [
        "continuousRenderMode", "filter", "font", "letterSpacing", "wordSpacing", "globalAlpha", "imageSmoothingEnabled",
        "imageSmoothingQuality", "lineDashOffset", "lineJoin", "lineCap", "miterLimit", "shadowColor", "shadowBlur",
        "shadowOffsetX", "shadowOffsetY", "textAlign", "textBaseline", "globalCompositeOperation", "fillStyle",
        "strokeStyle", "lineWidth",
    ]

    init(_ context: OpaquePointer, ownsContext: Bool) {
        self.context = context
        self.ownsContext = ownsContext
        let target = RafTarget()
        rafTarget = Unmanaged.passRetained(target)
        super.init()
        target.host = self
        raf = canvas_native_raf_create(Int(bitPattern: rafTarget.toOpaque()), onRafFrame)
        if let raf { canvas_native_raf_start(raf) }
    }

    deinit {
        // The frame callback must be gone before the context it renders is.
        if let raf { canvas_native_raf_release(raf) }
        rafTarget.release()
        if ownsContext { canvas_native_context_release(context) }
    }

    // MARK: Rendering

    fileprivate func flush() {
        guard invalidateState & 1 == 1 else { return }
        invalidateState = 2
        canvas_native_context_render(context)
        invalidateState = 0
    }

    private func markDirty() { invalidateState |= 1 }

    private func startRaf() {
        guard let raf, !canvas_native_raf_get_started(raf) else { return }
        canvas_native_raf_start(raf)
    }

    private func stopRaf() {
        guard let raf, canvas_native_raf_get_started(raf) else { return }
        canvas_native_raf_stop(raf)
    }

    // MARK: Text state

    private func flushFont() {
        guard fontDirty else { return }
        let accepted = cachedFont.withCString { canvas_native_context_set_font(context, $0) }
        fontDirty = false
        // A font the C API rejects leaves its previous font, which the getter then reads.
        if !accepted { cachedFont = "" }
    }

    private func flushTextState() {
        flushFont()
        if letterSpacingDirty {
            cachedLetterSpacing.withCString { canvas_native_context_set_letter_spacing(context, $0) }
            letterSpacingDirty = false
        }
        if wordSpacingDirty {
            cachedWordSpacing.withCString { canvas_native_context_set_word_spacing(context, $0) }
            wordSpacingDirty = false
        }
    }

    // MARK: Properties

    override func get(_ key: String) -> Any?? {
        switch key {
        case "fillStyle": return .some(style(canvas_native_context_get_current_fill_style_type(context), fill: true))
        case "strokeStyle": return .some(style(canvas_native_context_get_current_stroke_style_type(context), fill: false))
        case "lineWidth": return .some(Double(canvas_native_context_get_line_width(context)))
        case "font":
            flushFont()
            if !cachedFont.isEmpty { return .some(cachedFont) }
            return .some(takeString(canvas_native_context_get_font(context)))
        case "textAlign": return .some(takeString(canvas_native_context_get_text_align(context)))
        case "textBaseline": return .some(Double(canvas_native_context_get_text_baseline(context).rawValue))
        case "lineCap": return .some(takeString(canvas_native_context_get_line_cap(context)))
        case "lineJoin": return .some(takeString(canvas_native_context_get_line_join(context)))
        case "shadowBlur": return .some(Double(canvas_native_context_get_shadow_blur(context)))
        case "shadowColor": return .some(takeString(canvas_native_context_get_shadow_color(context)))
        case "shadowOffsetX": return .some(Double(canvas_native_context_get_shadow_offset_x(context)))
        case "shadowOffsetY": return .some(Double(canvas_native_context_get_shadow_offset_y(context)))
        case "globalAlpha": return .some(Double(canvas_native_context_get_global_alpha(context)))
        case "globalCompositeOperation": return .some(Double(canvas_native_context_get_global_composition_int(context)))
        case "miterLimit": return .some(Double(canvas_native_context_get_miter_limit(context)))
        case "lineDashOffset": return .some(Double(canvas_native_context_get_line_dash_offset(context)))
        case "imageSmoothingEnabled": return .some(canvas_native_context_get_image_smoothing_enabled(context))
        case "imageSmoothingQuality": return .some(takeString(canvas_native_context_get_image_smoothing_quality(context)))
        case "letterSpacing": return .some(takeString(canvas_native_context_get_letter_spacing(context)))
        case "wordSpacing": return .some(takeString(canvas_native_context_get_word_spacing(context)))
        case "filter": return .some(takeString(canvas_native_context_get_filter(context)))
        case "continuousRenderMode": return .some(continuousRender)
        default: return nil
        }
    }

    /// The fill or stroke style: its color string, or a new gradient or pattern of it.
    private func style(_ type: PaintStyleType, fill: Bool) -> Any? {
        switch type {
        case PaintStyleTypeGradient:
            return CanvasGradientHost(fill ? canvas_native_context_get_fill_style(context) : canvas_native_context_get_stroke_style(context))
        case PaintStyleTypePattern:
            return CanvasPatternHost(fill ? canvas_native_context_get_fill_style(context) : canvas_native_context_get_stroke_style(context))
        default:
            return takeOneByteString(fill ? canvas_native_paint_style_get_current_fill_color_string(context) : canvas_native_paint_style_get_current_stroke_color_string(context))
        }
    }

    override func set(_ key: String, _ value: Any?) throws -> Bool {
        switch key {
        case "fillStyle": setStyle(value, .fill)
        case "strokeStyle": setStyle(value, .stroke)
        case "lineWidth": canvas_native_context_set_line_width(context, Float(jsToNumber(value)))
        case "font":
            let font = jsToString(value)
            if font == cachedFont { break }
            flushFont()
            cachedFont = font
            fontDirty = true
        case "textAlign": jsToString(value).withCString { canvas_native_context_set_text_align(context, $0) }
        case "textBaseline": canvas_native_context_set_text_baseline(context, TextBaseLine(rawValue: jsUint32(value)))
        case "lineCap": jsToString(value).withCString { canvas_native_context_set_line_cap(context, $0) }
        case "lineJoin": jsToString(value).withCString { canvas_native_context_set_line_join(context, $0) }
        case "shadowBlur": canvas_native_context_set_shadow_blur(context, Float(jsToNumber(value)))
        case "shadowColor": jsToString(value).withCString { canvas_native_context_set_shadow_color(context, $0) }
        case "shadowOffsetX": canvas_native_context_set_shadow_offset_x(context, Float(jsToNumber(value)))
        case "shadowOffsetY": canvas_native_context_set_shadow_offset_y(context, Float(jsToNumber(value)))
        case "globalAlpha": canvas_native_context_set_global_alpha(context, Float(jsToNumber(value)))
        case "globalCompositeOperation": canvas_native_context_set_global_composition_int(context, jsUint32(value))
        case "miterLimit": canvas_native_context_set_miter_limit(context, Float(jsToNumber(value)))
        case "lineDashOffset": canvas_native_context_set_line_dash_offset(context, Float(jsToNumber(value)))
        case "imageSmoothingEnabled": canvas_native_context_set_image_smoothing_enabled(context, jsIsTruthy(value))
        case "imageSmoothingQuality": jsToString(value).withCString { canvas_native_context_set_image_smoothing_quality(context, $0) }
        case "letterSpacing":
            let spacing = jsToString(value)
            if spacing == cachedLetterSpacing { break }
            cachedLetterSpacing = spacing
            letterSpacingDirty = true
        case "wordSpacing":
            let spacing = jsToString(value)
            if spacing == cachedWordSpacing { break }
            cachedWordSpacing = spacing
            wordSpacingDirty = true
        case "filter": jsToString(value).withCString { canvas_native_context_set_filter(context, $0) }
        case "continuousRenderMode":
            let on = jsIsTruthy(value)
            if on == continuousRender { break }
            if on { startRaf() } else { stopRaf() }
            continuousRender = on
        default: return false
        }
        return true
    }

    /// A color string, a CanvasGradient or a CanvasPattern; anything else is ignored.
    private func setStyle(_ value: Any?, _ target: PaintTarget) {
        let style: OpaquePointer?
        switch jsFlat(value) {
        case let color as String:
            applyColor(context, target, color)
            return
        case let gradient as CanvasGradientHost: style = gradient.style
        case let pattern as CanvasPatternHost: style = pattern.style
        default: return
        }
        guard let style else { return }
        switch target {
        case .fill: canvas_native_context_set_fill_style(context, style)
        case .stroke: canvas_native_context_set_stroke_style(context, style)
        }
    }

    // MARK: Methods

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "beginPath":
            canvas_native_context_begin_path(context)
        case "moveTo":
            if args.count > 1 { canvas_native_context_move_to(context, args.float(0), args.float(1)) }
        case "lineTo":
            if args.count > 1 { canvas_native_context_line_to(context, args.float(0), args.float(1)) }
        case "arc":
            let anticlockwise = args.count == 6 ? args.bool(5) : false
            canvas_native_context_arc(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), anticlockwise)
        case "quadraticCurveTo":
            if args.count == 4 { canvas_native_context_quadratic_curve_to(context, args.float(0), args.float(1), args.float(2), args.float(3)) }
        case "fill":
            fill(args)
        case "stroke":
            if let path = args.host(0, Path2DHost.self)?.path {
                canvas_native_context_stroke_with_path(context, path)
                markDirty()
            } else if !(args[0] is Path2DHost) {
                canvas_native_context_stroke(context)
                markDirty()
            }
        case "clearRect":
            canvas_native_context_clear_rect(context, args.float(0), args.float(1), args.float(2), args.float(3))
            markDirty()
        case "fillRect":
            canvas_native_context_fill_rect(context, args.float(0), args.float(1), args.float(2), args.float(3))
            markDirty()
        case "fillText":
            flushTextState()
            guard let text = args.stringIfString(0) else { break }
            let x = args.float(1), y = args.float(2)
            if args.isNumber(3) {
                let width = args.float(3)
                text.withCString { canvas_native_context_fill_text_width(context, $0, x, y, width) }
            } else {
                text.withCString { canvas_native_context_fill_text(context, $0, x, y) }
            }
            markDirty()
        case "setTransform":
            if args.count == 1, isJSObject(args[0]) {
                if let matrix = args.host(0, DOMMatrixHost.self)?.matrix { canvas_native_context_set_transform_matrix(context, matrix) }
            } else if args.count == 6 {
                canvas_native_context_set_transform(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5))
            }
        case "save":
            flushTextState()
            canvas_native_context_save(context)
        case "restore":
            canvas_native_context_restore(context)
            cachedFont = ""
            cachedLetterSpacing = ""
            cachedWordSpacing = ""
            fontDirty = false
            letterSpacingDirty = false
            wordSpacingDirty = false
        case "translate":
            if args.count == 2 { canvas_native_context_translate(context, args.float(0), args.float(1)) }
        case "rotate":
            if args.count == 1, args.isNumber(0) { canvas_native_context_rotate(context, args.float(0)) }
        case "scale":
            if args.count == 2 { canvas_native_context_scale(context, args.float(0), args.float(1)) }
        case "transform":
            if args.count == 6 { canvas_native_context_transform(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5)) }
        case "resetTransform":
            canvas_native_context_reset_transform(context)
        case "closePath":
            canvas_native_context_close_path(context)
        case "bezierCurveTo":
            canvas_native_context_bezier_curve_to(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5))
        case "arcTo":
            canvas_native_context_arc_to(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4))
        case "ellipse":
            guard args.count == 8 else { break }
            let anticlockwise = args.isBoolean(7) ? args.bool(7) : false
            canvas_native_context_ellipse(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), anticlockwise)
        case "rect":
            if args.count == 4 { canvas_native_context_rect(context, args.float(0), args.float(1), args.float(2), args.float(3)) }
        case "roundRect":
            roundRect(args)
        case "strokeRect":
            guard args.count == 4 else { break }
            canvas_native_context_stroke_rect(context, args.float(0), args.float(1), args.float(2), args.float(3))
            markDirty()
        case "fillOval":
            canvas_native_context_fill_oval(context, args.float(0), args.float(1), args.float(2), args.float(3))
            markDirty()
        case "strokeOval":
            guard args.count == 4 else { break }
            canvas_native_context_stroke_oval(context, args.float(0), args.float(1), args.float(2), args.float(3))
            markDirty()
        case "strokeText":
            flushTextState()
            guard args.count >= 3, let text = args.stringIfString(0) else { break }
            let x = args.float(1), y = args.float(2)
            if args.count > 3 {
                let width = args.float(3)
                text.withCString { canvas_native_context_stroke_text_width(context, $0, x, y, width) }
            } else {
                text.withCString { canvas_native_context_stroke_text(context, $0, x, y) }
            }
            markDirty()
        case "clip":
            clip(args)
        case "setLineDash":
            if let segments = args.array(0) {
                let dash = floats(segments)
                canvas_native_context_set_line_dash(context, dash, UInt(dash.count))
            }
        case "getLineDash":
            return .some(lineDash())
        case "measureText":
            return .some(measureText(args))
        case "drawImage":
            drawImage(args)
        case "createLinearGradient":
            guard args.count == 4 else { return .some(jsNull) }
            return .some(CanvasGradientHost(canvas_native_context_create_linear_gradient(context, args.float(0), args.float(1), args.float(2), args.float(3))))
        case "createRadialGradient":
            guard args.count == 6 else { return .some(jsNull) }
            return .some(CanvasGradientHost(canvas_native_context_create_radial_gradient(context, args.float(0), args.float(1), args.float(2), args.float(3), args.float(4), args.float(5))))
        case "createConicGradient":
            guard args.count == 3 else { return .some(jsNull) }
            return .some(CanvasGradientHost(canvas_native_context_create_conic_gradient(context, args.float(0), args.float(1), args.float(2))))
        case "createPattern":
            return .some(createPattern(args))
        case "__createPatternWithNative":
            guard let pattern = canvas_native_pattern_from_ptr(args.pointer(0)) else { return .some(jsNull) }
            return .some(CanvasPatternHost(pattern))
        case "getImageData":
            guard args.count == 4 else { return .some(nil) }
            return .some(ImageDataHost(canvas_native_context_get_image_data(context, args.float(0), args.float(1), args.float(2), args.float(3))))
        case "createImageData":
            // The engine binding answers (width, height) with undefined too.
            guard args.count == 1, let source = args.host(0, ImageDataHost.self)?.imageData else { return .some(nil) }
            let width = canvas_native_image_data_get_width(source), height = canvas_native_image_data_get_height(source)
            return .some(ImageDataHost(canvas_native_image_data_create(width, height)))
        case "putImageData":
            putImageData(args)
        case "getTransform":
            return .some(DOMMatrixHost(canvas_native_context_get_transform(context)))
        case "isPointInPath":
            return .some(isPointInPath(args))
        case "isPointInStroke":
            return .some(isPointInStroke(args))
        case "drawPoint":
            canvas_native_context_draw_point(context, args.float(0), args.float(1))
            markDirty()
        case "drawPoints":
            drawPoints(args)
        case "drawPaint":
            args.string(0).withCString { canvas_native_context_draw_paint(context, $0) }
            markDirty()
        case "drawAtlas":
            drawAtlas(args)
        case "__startRaf":
            startRaf()
        case "__stopRaf":
            stopRaf()
        case "__makeDirty":
            markDirty()
        case "__getPointer":
            return .some(String(Int(bitPattern: context)))
        case "__resize":
            canvas_native_context_resize(context, args.float(0), args.float(1))
        case "__toDataURL":
            let type = args.stringIfString(0) ?? "image/png"
            let quality = args.isNumber(1) ? UInt32(truncatingIfNeeded: cInt32(args.number(1) * 100)) : 92
            return .some(takeOneByteString(type.withCString { canvas_native_to_data_url(context, $0, quality) }))
        case "addHitRegion", "clearHitRegions", "removeHitRegion", "drawFocusIfNeeded", "scrollPathIntoView":
            break
        default:
            return nil
        }
        return .some(nil)
    }

    private func fillRule(_ rule: UInt32) -> CanvasFillRule { rule == 0 ? CanvasFillRuleNonZero : CanvasFillRuleEvenOdd }

    private func fill(_ args: Args) {
        switch args.count {
        case 2:
            guard let path = args.host(0, Path2DHost.self)?.path else { return }
            canvas_native_context_fill_with_path(context, path, fillRule(args.uint32(1)))
            markDirty()
        case 1:
            if isUint32(args[0]) {
                canvas_native_context_fill(context, fillRule(args.uint32(0)))
                markDirty()
            } else if let path = args.host(0, Path2DHost.self)?.path {
                canvas_native_context_fill_with_path(context, path, CanvasFillRuleNonZero)
                markDirty()
            }
        default:
            canvas_native_context_fill(context, CanvasFillRuleNonZero)
            markDirty()
        }
    }

    private func clip(_ args: Args) {
        let count = args.count
        if count == 0 {
            canvas_native_context_clip_rule(context, CanvasFillRuleNonZero)
        } else if count == 1 && isUint32(args[0]) {
            canvas_native_context_clip_rule(context, fillRule(args.uint32(0)))
        } else if count == 1 && isJSObject(args[0]) {
            if let path = args.host(0, Path2DHost.self)?.path { canvas_native_context_clip(context, path, CanvasFillRuleNonZero) }
        } else if count >= 2 && isJSObject(args[0]) && isUint32(args[1]) {
            if let path = args.host(0, Path2DHost.self)?.path { canvas_native_context_clip(context, path, fillRule(args.uint32(1))) }
        }
    }

    private func roundRect(_ args: Args) {
        guard args.count == 5 else { return }
        let x = args.float(0), y = args.float(1), width = args.float(2), height = args.float(3)
        if isJSObject(args[4]) {
            if let radii = args.array(4), radii.count > 1 {
                let store = floats(radii)
                canvas_native_context_round_rect(context, x, y, width, height, store, UInt(store.count))
            }
        } else {
            let r = args.float(4)
            canvas_native_context_round_rect_tl_tr_br_bl(context, x, y, width, height, r, r, r, r)
        }
    }

    private func lineDash() -> JSArray<Any?> {
        guard let dash = canvas_native_context_get_line_dash(context) else { return JSArray<Any?>([]) }
        defer { canvas_native_f32_buffer_release(dash) }
        let count = Int(canvas_native_f32_buffer_get_length(dash))
        guard count > 0, let values = canvas_native_f32_buffer_get_bytes(dash) else { return JSArray<Any?>([]) }
        return JSArray<Any?>((0..<count).map { Double(values[$0]) })
    }

    private func measureText(_ args: Args) -> Any? {
        guard let text = args.stringIfString(0) else { return nil }
        if cachedFont.isEmpty, let font = canvas_native_context_get_font(context) {
            cachedFont = takeString(font)
        }
        let key = cachedFont + "|" + cachedLetterSpacing + "|" + cachedWordSpacing + "|" + text
        if let values = TextMetricsCache.get(key) { return TextMetricsHost(values) }
        flushTextState()
        var values = [Float](repeating: 0, count: 12)
        text.withCString { canvas_native_context_measure_text_to(context, $0, &values, 12) }
        TextMetricsCache.put(key, values)
        return TextMetricsHost(values)
    }

    private func drawImage(_ args: Args) {
        let count = args.count
        guard count == 3 || count == 5 || count == 9, isJSObject(args[0]) else { return }
        switch args[0] {
        case let image as ImageAssetHost:
            guard let asset = image.asset else { return }
            drawAsset(asset, args)
            markDirty()
        case let image as ImageBitmapHost:
            guard let asset = image.asset else { return }
            drawAsset(asset, args)
            markDirty()
        case let image as CanvasRenderingContext2DHost:
            switch count {
            case 3: canvas_native_context_draw_image_dx_dy_context(context, image.context, args.float(1), args.float(2))
            case 5: canvas_native_context_draw_image_dx_dy_dw_dh_context(context, image.context, args.float(1), args.float(2), args.float(3), args.float(4))
            default: canvas_native_context_draw_image_context(context, image.context, args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), args.float(7), args.float(8))
            }
            markDirty()
        case let image as CanvasWebGLStateSource:
            guard let state = image.webGLState else { return }
            switch count {
            case 3: canvas_native_context_draw_image_dx_dy_webgl(context, state, args.float(1), args.float(2))
            case 5: canvas_native_context_draw_image_dx_dy_dw_dh_webgl(context, state, args.float(1), args.float(2), args.float(3), args.float(4))
            default: canvas_native_context_draw_image_webgl(context, state, args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), args.float(7), args.float(8))
            }
        default:
            return
        }
    }

    private func drawAsset(_ asset: OpaquePointer, _ args: Args) {
        switch args.count {
        case 3: canvas_native_context_draw_image_dx_dy_asset(context, asset, args.float(1), args.float(2))
        case 5: canvas_native_context_draw_image_dx_dy_dw_dh_asset(context, asset, args.float(1), args.float(2), args.float(3), args.float(4))
        default: canvas_native_context_draw_image_asset(context, asset, args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6), args.float(7), args.float(8))
        }
    }

    /// The repetition a `createPattern` string names, nil for any other string.
    private func repetition(_ value: Any?) -> CanvasRepetition? {
        switch jsToString(value) {
        case "no-repeat": return CanvasRepetitionNoRepeat
        case "repeat": return CanvasRepetitionRepeat
        case "repeat-x": return CanvasRepetitionRepeatX
        case "repeat-y": return CanvasRepetitionRepeatY
        default: return nil
        }
    }

    /// A pattern of the image; undefined for an unknown repetition, null when the C API makes
    /// none or the source is not an image, canvas or WebGL context.
    private func createPattern(_ args: Args) -> Any? {
        guard args.count > 1 else { return jsNull }
        let make: (CanvasRepetition) -> OpaquePointer?
        switch args[0] {
        case let image as ImageAssetHost:
            guard let asset = image.asset else { return nil }
            make = { canvas_native_context_create_pattern_asset(self.context, asset, $0) }
        case let image as ImageBitmapHost:
            guard let asset = image.asset else { return nil }
            make = { canvas_native_context_create_pattern_asset(self.context, asset, $0) }
        case let source as CanvasRenderingContext2DHost:
            make = { canvas_native_context_create_pattern_canvas2d(source.context, self.context, $0) }
        case let source as CanvasWebGLStateSource:
            guard let state = source.webGLState else { return nil }
            make = { canvas_native_context_create_pattern_webgl(state, self.context, $0) }
        default:
            return jsNull
        }
        guard let rep = repetition(args[1]) else { return nil }
        guard let style = make(rep) else { return jsNull }
        return CanvasPatternHost(style)
    }

    private func putImageData(_ args: Args) {
        guard let host = args.host(0, ImageDataHost.self), let imageData = host.syncedImageData() else { return }
        switch args.count {
        case 3:
            let width = Float(canvas_native_image_data_get_width(imageData)), height = Float(canvas_native_image_data_get_height(imageData))
            canvas_native_context_put_image_data(context, imageData, args.float(1), args.float(2), 0, 0, width, height)
            markDirty()
        case 7:
            canvas_native_context_put_image_data(context, imageData, args.float(1), args.float(2), args.float(3), args.float(4), args.float(5), args.float(6))
            markDirty()
        default:
            break
        }
    }

    private func isPointInPath(_ args: Args) -> Bool {
        switch args.count {
        case 2:
            return canvas_native_context_is_point_in_path(context, args.float(0), args.float(1), CanvasFillRuleNonZero)
        case 3 where isInt32(args[2]):
            return canvas_native_context_is_point_in_path(context, args.float(0), args.float(1), fillRule(args.uint32(2)))
        case 4 where isJSObject(args[0]) && isInt32(args[3]):
            guard let path = args.host(0, Path2DHost.self)?.path else { return false }
            return canvas_native_context_is_point_in_path_with_path(context, path, args.float(1), args.float(2), fillRule(args.uint32(3)))
        default:
            return false
        }
    }

    private func isPointInStroke(_ args: Args) -> Bool {
        switch args.count {
        case 2:
            return canvas_native_context_is_point_in_stroke(context, args.float(0), args.float(1))
        case 3 where isJSObject(args[0]):
            guard let path = args.host(0, Path2DHost.self)?.path else { return false }
            return canvas_native_context_is_point_in_stroke_with_path(context, path, args.float(1), args.float(2))
        default:
            return false
        }
    }

    private func drawPoints(_ args: Args) {
        guard let points = args.array(1), !points.isEmpty, isUint32(args[0]) else { return }
        var store = [Float]()
        store.reserveCapacity(points.count * 2)
        for point in points {
            store.append(Float(jsToNumber(member(point, "x"))))
            store.append(Float(jsToNumber(member(point, "y"))))
        }
        canvas_native_context_draw_points(context, Int32(bitPattern: args.uint32(0)), store, UInt(store.count))
        markDirty()
    }

    private func drawAtlas(_ args: Args) {
        guard isJSObject(args[0]), let xformValues = args.array(1), let texValues = args.array(2) else { return }
        let xform = floats(xformValues)
        let tex = floats(texValues)
        let mode: UInt32 = isInt32(args[4]) ? UInt32(bitPattern: args.int32(4)) : 4
        // The engine binding fills the colors from the tex array, not the colors array.
        let colors: [String] = args.array(3).map { list in list.indices.map { jsToString($0 < texValues.count ? texValues[$0] : nil) } } ?? []

        let asset: OpaquePointer?
        switch args[0] {
        case let image as ImageAssetHost: asset = image.asset
        case let image as ImageBitmapHost: asset = image.asset
        case is CanvasRenderingContext2DHost:
            markDirty()
            return
        default: return
        }
        guard let asset else { return }
        if colors.isEmpty {
            canvas_native_context_draw_atlas_asset(context, asset, xform, UInt(xform.count), tex, UInt(tex.count), nil, 0, mode)
        } else {
            var cStrings = colors.map { UnsafePointer(strdup($0)) }
            defer { cStrings.forEach { free(UnsafeMutablePointer(mutating: $0)) } }
            canvas_native_context_draw_atlas_asset(context, asset, xform, UInt(xform.count), tex, UInt(tex.count), &cStrings, UInt(cStrings.count), mode)
        }
        if args[0] is ImageAssetHost { markDirty() }
    }
}

/// What the C API's frame callback reaches: the context, while it lives.
private final class RafTarget {
    weak var host: CanvasRenderingContext2DHost?
}

private let onRafFrame: @convention(c) (Int, Int64) -> Void = { callback, _ in
    guard let pointer = UnsafeRawPointer(bitPattern: callback) else { return }
    Unmanaged<RafTarget>.fromOpaque(pointer).takeUnretainedValue().host?.flush()
}

/// Text metrics by font, spacing and text, shared by every context, the least recently used
/// dropped past 256.
private enum TextMetricsCache {
    private static let capacity = 256
    nonisolated(unsafe) private static var entries: [String: (values: [Float], used: UInt64)] = [:]
    nonisolated(unsafe) private static var clock: UInt64 = 0

    static func get(_ key: String) -> [Float]? {
        guard let entry = entries[key] else { return nil }
        clock += 1
        entries[key] = (entry.values, clock)
        return entry.values
    }

    static func put(_ key: String, _ values: [Float]) {
        clock += 1
        entries[key] = (values, clock)
        if entries.count > capacity, let oldest = entries.min(by: { $0.value.used < $1.value.used })?.key {
            entries[oldest] = nil
        }
    }
}
