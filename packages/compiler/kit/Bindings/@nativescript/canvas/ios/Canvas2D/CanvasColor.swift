import Foundation
import NativeScriptKit
import CanvasNative

/// The style a color string sets.
enum PaintTarget { case fill, stroke }

/// Sets the fill or stroke color of a CSS color string, as the C++ binding's `fillStyle` and
/// `strokeStyle` setters do: surrounding ASCII whitespace dropped; `#rgb`, `#rrggbb`,
/// `#rrggbbaa`, `rgb()` and `rgba()` read here; anything else read by the C API's CSS parser;
/// and what neither reads handed to the C API as the string. Results are cached by string.
func applyColor(_ context: OpaquePointer, _ target: PaintTarget, _ value: String) {
    value.withCString { full in
        let n = strlen(full)
        var start = 0, end = n
        while start < end && isASCIISpace(full[start]) { start += 1 }
        while end > start && isASCIISpace(full[end - 1]) { end -= 1 }
        if end == n {
            applyTrimmedColor(context, target, full + start, end - start)
        } else {
            let trimmed = String(decoding: UnsafeRawBufferPointer(start: full + start, count: end - start), as: UTF8.self)
            trimmed.withCString { applyTrimmedColor(context, target, $0, end - start) }
        }
    }
}

private func applyTrimmedColor(_ context: OpaquePointer, _ target: PaintTarget, _ color: UnsafePointer<CChar>, _ length: Int) {
    if let hit = ColorCache.get(color, length) {
        if let rgba = hit {
            setColor(context, target, UInt8(rgba >> 24), UInt8((rgba >> 16) & 0xFF), UInt8((rgba >> 8) & 0xFF), UInt8(rgba & 0xFF))
        } else {
            setColor(context, target, color)
        }
        return
    }
    if let rgba = parseColor(color) {
        setColor(context, target, rgba.r, rgba.g, rgba.b, rgba.a)
        ColorCache.put(color, length, UInt32(rgba.r) << 24 | UInt32(rgba.g) << 16 | UInt32(rgba.b) << 8 | UInt32(rgba.a))
        return
    }
    setColor(context, target, color)
    ColorCache.put(color, length, nil)
}

private func setColor(_ context: OpaquePointer, _ target: PaintTarget, _ r: UInt8, _ g: UInt8, _ b: UInt8, _ a: UInt8) {
    switch target {
    case .fill: canvas_native_paint_style_set_fill_color_with_rgba(context, r, g, b, a)
    case .stroke: canvas_native_paint_style_set_stroke_color_with_rgba(context, r, g, b, a)
    }
}

private func setColor(_ context: OpaquePointer, _ target: PaintTarget, _ color: UnsafePointer<CChar>) {
    switch target {
    case .fill: canvas_native_paint_style_set_fill_color_with_c_string(context, color)
    case .stroke: canvas_native_paint_style_set_stroke_color_with_c_string(context, color)
    }
}

private func isASCIISpace(_ c: CChar) -> Bool {
    c == 0x20 || (c >= 0x09 && c <= 0x0D)
}

private func hexValue(_ c: CChar) -> Int {
    switch c {
    case 0x30...0x39: return Int(c) - 0x30
    case 0x61...0x66: return Int(c) - 0x61 + 10
    case 0x41...0x46: return Int(c) - 0x41 + 10
    default: return -1
    }
}

private func isLetter(_ c: CChar, _ lower: Character) -> Bool {
    let l = CChar(lower.asciiValue ?? 0)
    return c == l || c == l - 0x20
}

/// The color's components, or nil when the string is none of the forms read here and the C
/// API's CSS parser does not read it either.
private func parseColor(_ color: UnsafePointer<CChar>) -> (r: UInt8, g: UInt8, b: UInt8, a: UInt8)? {
    var p = color
    while p.pointee != 0 && isASCIISpace(p.pointee) { p += 1 }
    let l = strlen(p)
    if l == 0 { return nil }

    if p[0] == 0x23 /* # */ {
        if l == 4 {
            let r = hexValue(p[1]), g = hexValue(p[2]), b = hexValue(p[3])
            if r >= 0 && g >= 0 && b >= 0 {
                return (UInt8(r << 4 | r), UInt8(g << 4 | g), UInt8(b << 4 | b), 255)
            }
        } else if l == 7 || l == 9 {
            let digits = (1...6).map { hexValue(p[$0]) }
            if digits.contains(where: { $0 < 0 }) { return nil }
            var a: UInt8 = 255
            if l == 9 {
                let ah = hexValue(p[7]), al = hexValue(p[8])
                if ah < 0 || al < 0 { return nil }
                a = UInt8(ah << 4 | al)
            }
            return (UInt8(digits[0] << 4 | digits[1]), UInt8(digits[2] << 4 | digits[3]), UInt8(digits[4] << 4 | digits[5]), a)
        }
    }

    if isLetter(p[0], "r") && isLetter(p[1], "g") && isLetter(p[2], "b") {
        return parseRGB(p)
    }

    var r: UInt8 = 0, g: UInt8 = 0, b: UInt8 = 0, a: UInt8 = 0
    if canvas_native_parse_css_color_rgba(color, &r, &g, &b, &a) { return (r, g, b, a) }
    return nil
}

/// `rgb(r, g, b)` and `rgba(r, g, b, a)` with whole-number channels, as `strtol` and `strtod`
/// read them; any other form is nil and left to the C API.
private func parseRGB(_ p: UnsafePointer<CChar>) -> (r: UInt8, g: UInt8, b: UInt8, a: UInt8)? {
    guard let open = strchr(p, 0x28 /* ( */), let close = strrchr(p, 0x29 /* ) */), close > open else { return nil }
    var cursor = open + 1
    var end: UnsafeMutablePointer<CChar>?

    func skipSeparators() {
        while cursor.pointee != 0 && (cursor.pointee == 0x2C /* , */ || isASCIISpace(cursor.pointee)) { cursor += 1 }
    }
    func channel() -> Int? {
        let v = strtol(cursor, &end, 10)
        guard let end, end != cursor else { return nil }
        cursor = end
        return v
    }

    guard let rv = channel() else { return nil }
    skipSeparators()
    guard let gv = channel() else { return nil }
    skipSeparators()
    guard let bv = channel() else { return nil }

    var a: UInt8 = 255
    if isLetter(p[3], "a") {
        skipSeparators()
        if cursor.pointee == 0 { return nil }
        let af = strtod(cursor, &end)
        guard let end, end != cursor else { return nil }
        if af <= 1.0 {
            a = UInt8((max(0.0, min(1.0, af)) * 255.0).rounded())
        } else {
            let ai = af.isNaN ? 0 : af >= 9.2e18 ? Int.max : Int(af)
            a = UInt8(max(0, min(255, ai)))
        }
    }

    guard (0...255).contains(rv), (0...255).contains(gv), (0...255).contains(bv) else { return nil }
    return (UInt8(rv), UInt8(gv), UInt8(bv), a)
}

/// One slot per hash of the color string, replaced on collision and never reordered: setting
/// a color the program sets every frame costs a hash and a compare. Colors longer than 48
/// bytes are not cached.
private enum ColorCache {
    private struct Slot {
        var key: [UInt8]
        /// The packed RGBA, or nil for a string handed to the C API as it is.
        var rgba: UInt32?
    }

    private static let slotCount = 64
    private static let keyMax = 48
    nonisolated(unsafe) private static var slots = [Slot?](repeating: nil, count: slotCount)

    private static func hash(_ key: UnsafePointer<CChar>, _ length: Int) -> Int {
        var h: UInt32 = 2_166_136_261
        for i in 0..<length {
            h ^= UInt32(UInt8(bitPattern: key[i]))
            h = h &* 16_777_619
        }
        return Int(h) & (slotCount - 1)
    }

    /// The cached entry: `.some(rgba)` for a parsed color, `.some(nil)` for one the C API
    /// takes as a string, nil when not cached.
    static func get(_ key: UnsafePointer<CChar>, _ length: Int) -> UInt32?? {
        guard length > 0, length <= keyMax, let slot = slots[hash(key, length)], slot.key.count == length else { return nil }
        let same = slot.key.withUnsafeBufferPointer { memcmp($0.baseAddress, key, length) == 0 }
        return same ? .some(slot.rgba) : nil
    }

    static func put(_ key: UnsafePointer<CChar>, _ length: Int, _ rgba: UInt32?) {
        guard length > 0, length <= keyMax else { return }
        let bytes = UnsafeRawBufferPointer(start: key, count: length)
        slots[hash(key, length)] = Slot(key: Array(bytes), rgba: rgba)
    }
}
