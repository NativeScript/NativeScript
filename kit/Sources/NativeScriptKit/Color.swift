import UIKit

/// `Color` from @nativescript/core: the same parsing and the same integer
/// rounding, so a CSS color resolves to the same UIColor components.
public struct Color: Equatable {
    /// 0xAARRGGBB.
    public let argb: UInt32

    public init(argb: UInt32) { self.argb = argb }

    public init?(_ value: String) {
        let lowered = value.trimmingCharacters(in: .whitespaces).lowercased()
        if (lowered.hasPrefix("rgb(") || lowered.hasPrefix("rgba(")) && lowered.hasSuffix(")") {
            let (r, g, b, a) = Color.parseWithAlpha(lowered)
            argb = Color.pack(a, Int(r), Int(g), Int(b))
        } else if lowered.hasPrefix("hsl") && lowered.hasSuffix(")") {
            let (h, s, l, a) = Color.parseWithAlpha(lowered)
            let rgb = Color.hslToRgb(h, s, l)
            argb = Color.pack(a, rgb.r, rgb.g, rgb.b)
        } else if let known = knownColors[lowered] {
            argb = known
        } else if lowered.contains("color-mix(") {
            // An expression csstools does not parse is -1 in core: opaque white.
            argb = ColorMix.argb(lowered) ?? 0xffff_ffff
        } else if lowered.hasPrefix("#"), [4, 5, 7, 9].contains(lowered.count) {
            var hex = String(lowered.dropFirst())
            if hex.count == 3 || hex.count == 4 { hex = hex.map { "\($0)\($0)" }.joined() }
            guard let int = UInt32(hex, radix: 16) else { return nil }
            // #RRGGBBAA: alpha last, NativeScript's (and CSS's) order.
            argb = hex.count == 6 ? (int & 0x00ff_ffff) | 0xff00_0000 : (int >> 8) | ((int & 0xff) << 24)
        } else {
            return nil
        }
    }

    /// `android`: the color as Android's signed ARGB integer, on any platform.
    public var android: Double { Double(Int32(bitPattern: argb)) }

    public var a: Int { Int((argb >> 24) & 0xff) }
    public var r: Int { Int((argb >> 16) & 0xff) }
    public var g: Int { Int((argb >> 8) & 0xff) }
    public var b: Int { Int(argb & 0xff) }

    public var ios: UIColor {
        UIColor(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }

    private static func pack(_ a: Int, _ r: Int, _ g: Int, _ b: Int) -> UInt32 {
        UInt32(a & 0xff) << 24 | UInt32(r & 0xff) << 16 | UInt32(g & 0xff) << 8 | UInt32(b & 0xff)
    }

    /// `parseColorWithAlpha`: components as parseFloat reads them, alpha 0–1 scaled to 0–255.
    private static func parseWithAlpha(_ value: String) -> (Double, Double, Double, Int) {
        var body = value
        if let open = body.firstIndex(of: "(") { body = String(body[body.index(after: open)...]) }
        body = body.replacingOccurrences(of: ")", with: "").replacingOccurrences(of: "/", with: " ").replacingOccurrences(of: "%", with: "")
        let separator: Character = body.contains(",") ? "," : " "
        let parts = body.split(separator: separator).map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        func at(_ i: Int) -> Double? { i < parts.count ? parseFloat(parts[i]) : nil }
        let alpha = at(3).map { Int(jsRound($0 * 255)) } ?? 255
        return (at(0) ?? 255, at(1) ?? 255, at(2) ?? 255, alpha)
    }

    private static func hue2rgb(_ p: Double, _ q: Double, _ t: Double) -> Double {
        var t = t
        if t < 0 { t += 1 }
        if t > 1 { t -= 1 }
        if t < 1.0 / 6 { return p + (q - p) * 6 * t }
        if t < 1.0 / 2 { return q }
        if t < 2.0 / 3 { return p + (q - p) * (2.0 / 3 - t) * 6 }
        return p
    }

    static func hslToRgb(_ h1: Double, _ s1: Double, _ l1: Double) -> (r: Int, g: Int, b: Int) {
        let h = h1.truncatingRemainder(dividingBy: 360) / 360
        let s = s1 / 100
        let l = l1 / 100
        var r = l, g = l, b = l
        if s != 0 {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s
            let p = 2 * l - q
            r = hue2rgb(p, q, h + 1.0 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1.0 / 3)
        }
        return (Int(jsRound(r * 255)), Int(jsRound(g * 255)), Int(jsRound(b * 255)))
    }
}

/// JavaScript `parseFloat`: the longest numeric prefix, or nil.
func parseFloat(_ text: String) -> Double? {
    let s = text.trimmingCharacters(in: .whitespacesAndNewlines)
    var end = s.startIndex
    var seenDigit = false, seenDot = false, seenExp = false
    var i = s.startIndex
    if i < s.endIndex, s[i] == "-" || s[i] == "+" { i = s.index(after: i) }
    while i < s.endIndex {
        let c = s[i]
        if c.isASCII && c.isNumber {
            seenDigit = true
            end = s.index(after: i)
        } else if c == "." && !seenDot && !seenExp {
            seenDot = true
        } else if (c == "e" || c == "E") && seenDigit && !seenExp {
            seenExp = true
            let next = s.index(after: i)
            if next < s.endIndex, s[next] == "-" || s[next] == "+" { i = next }
        } else {
            break
        }
        i = s.index(after: i)
    }
    guard seenDigit else { return nil }
    return Double(s[s.startIndex..<end])
}

private let knownColors: [String: UInt32] = [
    "transparent": 0x00000000,
    "aliceblue": 0xfff0f8ff,
    "antiquewhite": 0xfffaebd7,
    "aqua": 0xff00ffff,
    "aquamarine": 0xff7fffd4,
    "azure": 0xfff0ffff,
    "beige": 0xfff5f5dc,
    "bisque": 0xffffe4c4,
    "black": 0xff000000,
    "blanchedalmond": 0xffffebcd,
    "blue": 0xff0000ff,
    "blueviolet": 0xff8a2be2,
    "brown": 0xffa52a2a,
    "burlywood": 0xffdeb887,
    "cadetblue": 0xff5f9ea0,
    "chartreuse": 0xff7fff00,
    "chocolate": 0xffd2691e,
    "coral": 0xffff7f50,
    "cornflowerblue": 0xff6495ed,
    "cornsilk": 0xfffff8dc,
    "crimson": 0xffdc143c,
    "cyan": 0xff00ffff,
    "darkblue": 0xff00008b,
    "darkcyan": 0xff008b8b,
    "darkgoldenrod": 0xffb8860b,
    "darkgray": 0xffa9a9a9,
    "darkgrey": 0xffa9a9a9,
    "darkgreen": 0xff006400,
    "darkkhaki": 0xffbdb76b,
    "darkmagenta": 0xff8b008b,
    "darkolivegreen": 0xff556b2f,
    "darkorange": 0xffff8c00,
    "darkorchid": 0xff9932cc,
    "darkred": 0xff8b0000,
    "darksalmon": 0xffe9967a,
    "darkseagreen": 0xff8fbc8f,
    "darkslateblue": 0xff483d8b,
    "darkslategray": 0xff2f4f4f,
    "darkslategrey": 0xff2f4f4f,
    "darkturquoise": 0xff00ced1,
    "darkviolet": 0xff9400d3,
    "deeppink": 0xffff1493,
    "deepskyblue": 0xff00bfff,
    "dimgray": 0xff696969,
    "dimgrey": 0xff696969,
    "dodgerblue": 0xff1e90ff,
    "firebrick": 0xffb22222,
    "floralwhite": 0xfffffaf0,
    "forestgreen": 0xff228b22,
    "fuchsia": 0xffff00ff,
    "gainsboro": 0xffdcdcdc,
    "ghostwhite": 0xfff8f8ff,
    "gold": 0xffffd700,
    "goldenrod": 0xffdaa520,
    "gray": 0xff808080,
    "grey": 0xff808080,
    "green": 0xff008000,
    "greenyellow": 0xffadff2f,
    "honeydew": 0xfff0fff0,
    "hotpink": 0xffff69b4,
    "indianred": 0xffcd5c5c,
    "indigo": 0xff4b0082,
    "ivory": 0xfffffff0,
    "khaki": 0xfff0e68c,
    "lavender": 0xffe6e6fa,
    "lavenderblush": 0xfffff0f5,
    "lawngreen": 0xff7cfc00,
    "lemonchiffon": 0xfffffacd,
    "lightblue": 0xffadd8e6,
    "lightcoral": 0xfff08080,
    "lightcyan": 0xffe0ffff,
    "lightgoldenrodyellow": 0xfffafad2,
    "lightgray": 0xffd3d3d3,
    "lightgrey": 0xffd3d3d3,
    "lightgreen": 0xff90ee90,
    "lightpink": 0xffffb6c1,
    "lightsalmon": 0xffffa07a,
    "lightseagreen": 0xff20b2aa,
    "lightskyblue": 0xff87cefa,
    "lightslategray": 0xff778899,
    "lightslategrey": 0xff778899,
    "lightsteelblue": 0xffb0c4de,
    "lightyellow": 0xffffffe0,
    "lime": 0xff00ff00,
    "limegreen": 0xff32cd32,
    "linen": 0xfffaf0e6,
    "magenta": 0xffff00ff,
    "maroon": 0xff800000,
    "mediumaquamarine": 0xff66cdaa,
    "mediumblue": 0xff0000cd,
    "mediumorchid": 0xffba55d3,
    "mediumpurple": 0xff9370db,
    "mediumseagreen": 0xff3cb371,
    "mediumslateblue": 0xff7b68ee,
    "mediumspringgreen": 0xff00fa9a,
    "mediumturquoise": 0xff48d1cc,
    "mediumvioletred": 0xffc71585,
    "midnightblue": 0xff191970,
    "mintcream": 0xfff5fffa,
    "mistyrose": 0xffffe4e1,
    "moccasin": 0xffffe4b5,
    "navajowhite": 0xffffdead,
    "navy": 0xff000080,
    "oldlace": 0xfffdf5e6,
    "olive": 0xff808000,
    "olivedrab": 0xff6b8e23,
    "orange": 0xffffa500,
    "orangered": 0xffff4500,
    "orchid": 0xffda70d6,
    "palegoldenrod": 0xffeee8aa,
    "palegreen": 0xff98fb98,
    "paleturquoise": 0xffafeeee,
    "palevioletred": 0xffdb7093,
    "papayawhip": 0xffffefd5,
    "peachpuff": 0xffffdab9,
    "peru": 0xffcd853f,
    "pink": 0xffffc0cb,
    "plum": 0xffdda0dd,
    "powderblue": 0xffb0e0e6,
    "purple": 0xff800080,
    "rebeccapurple": 0xff663399,
    "red": 0xffff0000,
    "rosybrown": 0xffbc8f8f,
    "royalblue": 0xff4169e1,
    "saddlebrown": 0xff8b4513,
    "salmon": 0xfffa8072,
    "sandybrown": 0xfff4a460,
    "seagreen": 0xff2e8b57,
    "seashell": 0xfffff5ee,
    "sienna": 0xffa0522d,
    "silver": 0xffc0c0c0,
    "skyblue": 0xff87ceeb,
    "slateblue": 0xff6a5acd,
    "slategray": 0xff708090,
    "slategrey": 0xff708090,
    "snow": 0xfffffafa,
    "springgreen": 0xff00ff7f,
    "steelblue": 0xff4682b4,
    "tan": 0xffd2b48c,
    "teal": 0xff008080,
    "thistle": 0xffd8bfd8,
    "tomato": 0xffff6347,
    "turquoise": 0xff40e0d0,
    "violet": 0xffee82ee,
    "wheat": 0xfff5deb3,
    "white": 0xffffffff,
    "whitesmoke": 0xfff5f5f5,
    "yellow": 0xffffff00,
    "yellowgreen": 0xff9acd32,
]
