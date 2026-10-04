import Foundation

/// `color-mix()` as core evaluates it (color-utils `argbFromColorMix`):
/// @csstools/css-color-parser's `color()` and `serializeRGB`, whose
/// `rgba(r, g, b, a)` core then reads back. Every color converts through
/// XYZ D50 as csstools' does, so the rounding lands on the same integers.
enum ColorMix {
    /// 0xAARRGGBB, or nil where csstools does not parse the value (core then stores -1).
    static func argb(_ value: String) -> UInt32? {
        guard let color = parse(value.trimmingCharacters(in: .whitespaces)) else { return nil }
        return serializeRGB(color)
    }

    enum Notation: Equatable { case hex, rgb, srgb, linearSRGB, hsl, hwb, lab, lch, oklab, oklch, xyzD50, xyzD65 }

    struct ColorData {
        var notation: Notation
        var channels: [Double]
        var alpha: Double
    }

    // MARK: Parsing

    static func parse(_ text: String) -> ColorData? {
        let text = text.lowercased()
        if text == "transparent" { return ColorData(notation: .rgb, channels: [0, 0, 0], alpha: 0) }
        if text.hasPrefix("#") { return hex(String(text.dropFirst())) }
        if let named = namedColors[text] {
            return ColorData(notation: .rgb, channels: named.map { Double($0) / 255 }, alpha: 1)
        }
        guard let open = text.firstIndex(of: "("), text.hasSuffix(")") else { return nil }
        let name = String(text[..<open])
        let body = String(text[text.index(after: open)..<text.index(before: text.endIndex)])
        switch name {
        case "color-mix": return mix(body)
        case "rgb", "rgba": return rgb(body)
        case "hsl", "hsla": return hsl(body)
        case "hwb": return modern(body, .hwb) { i, t in i == 0 ? hue(t) : number(t, percent: 1, min: -.infinity, max: .infinity) }
        case "lab": return modern(body, .lab) { i, t in i == 0 ? number(t, percent: 1, min: 0, max: 100) : number(t, percent: 0.8, min: -2147483647, max: 2147483647) }
        case "lch": return modern(body, .lch) { i, t in i == 0 ? number(t, percent: 1, min: 0, max: 100) : i == 1 ? number(t, percent: 100.0 / 150, min: 0, max: 2147483647) : hue(t) }
        case "oklab": return modern(body, .oklab) { i, t in i == 0 ? number(t, percent: 100, min: 0, max: 1) : number(t, percent: 250, min: -2147483647, max: 2147483647) }
        case "oklch": return modern(body, .oklch) { i, t in i == 0 ? number(t, percent: 100, min: 0, max: 1) : i == 1 ? number(t, percent: 250, min: 0, max: 2147483647) : hue(t) }
        default: return nil
        }
    }

    private static func hex(_ digits: String) -> ColorData? {
        guard [3, 4, 6, 8].contains(digits.count), digits.allSatisfy(\.isHexDigit) else { return nil }
        let full = digits.count <= 4 ? digits.map { "\($0)\($0)" }.joined() : digits
        let bytes = stride(from: 0, to: full.count, by: 2).map { i -> Double in
            let start = full.index(full.startIndex, offsetBy: i)
            return Double(Int(full[start..<full.index(start, offsetBy: 2)], radix: 16)!) / 255
        }
        return ColorData(notation: .hex, channels: Array(bytes[0..<3]), alpha: bytes.count == 4 ? bytes[3] : 1)
    }

    /// A number token: its value, or a percentage divided by `percent`, clamped as csstools' `normalize`.
    private static func number(_ token: String, percent: Double, min: Double, max: Double, plain: Double = 1) -> Double? {
        if token == "none" { return .nan }
        if token.hasSuffix("%") {
            guard let v = Double(token.dropLast()) else { return nil }
            return Swift.min(Swift.max(v / percent, min), max)
        }
        guard let v = Double(token) else { return nil }
        return Swift.min(Swift.max(v / plain, min), max)
    }

    private static func hue(_ token: String) -> Double? {
        if token == "none" { return .nan }
        if let v = Double(token) { return v.truncatingRemainder(dividingBy: 360) }
        for (unit, scale) in [("deg", 1.0), ("grad", 0.9), ("rad", 180 / Double.pi), ("turn", 360.0)] where token.hasSuffix(unit) {
            guard let v = Double(token.dropLast(unit.count)) else { return nil }
            return (unit == "rad" ? 180 * v / Double.pi : v * scale).truncatingRemainder(dividingBy: 360)
        }
        return nil
    }

    private static func alpha(_ token: String) -> Double? {
        if token == "none" { return .nan }
        return number(token, percent: 100, min: 0, max: 1)
    }

    /// Space-separated channels with an optional `/ alpha`.
    private static func modern(_ body: String, _ notation: Notation, _ channel: (Int, String) -> Double?) -> ColorData? {
        let parts = body.replacingOccurrences(of: "/", with: " / ").split(whereSeparator: \.isWhitespace).map(String.init)
        guard parts.count == 3 || (parts.count == 5 && parts[3] == "/") else { return nil }
        var channels: [Double] = []
        for i in 0..<3 { guard let v = channel(i, parts[i]) else { return nil }; channels.append(v) }
        guard let a = parts.count == 5 ? alpha(parts[4]) : 1 else { return nil }
        return ColorData(notation: notation, channels: channels, alpha: a)
    }

    private static func rgb(_ body: String) -> ColorData? {
        if body.contains(",") {
            let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
            guard parts.count == 3 || parts.count == 4 else { return nil }
            let percents = parts.prefix(3).filter { $0.hasSuffix("%") }.count
            guard percents == 0 || percents == 3 else { return nil }
            var channels: [Double] = []
            for p in parts.prefix(3) { guard let v = number(p, percent: 100, min: 0, max: 1, plain: 255), !v.isNaN else { return nil }; channels.append(v) }
            guard let a = parts.count == 4 ? number(parts[3], percent: 100, min: 0, max: 1) : 1 else { return nil }
            return ColorData(notation: .rgb, channels: channels, alpha: a)
        }
        return modern(body, .rgb) { _, t in number(t, percent: 100, min: -2147483647, max: 2147483647, plain: 255) }
    }

    private static func hsl(_ body: String) -> ColorData? {
        if body.contains(",") {
            let parts = body.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
            guard parts.count == 3 || parts.count == 4, let h = hue(parts[0]), !h.isNaN,
                  parts[1].hasSuffix("%"), parts[2].hasSuffix("%"),
                  let s = number(parts[1], percent: 1, min: 0, max: 100), let l = number(parts[2], percent: 1, min: 0, max: 100),
                  let a = parts.count == 4 ? number(parts[3], percent: 100, min: 0, max: 1) : 1 else { return nil }
            return ColorData(notation: .hsl, channels: [h, s, l], alpha: a)
        }
        return modern(body, .hsl) { i, t in i == 0 ? hue(t) : i == 1 ? number(t, percent: 1, min: 0, max: 2147483647) : (t.hasSuffix("%") ? Double(t.dropLast()) : (t == "none" ? .nan : Double(t))) }
    }

    /// The comma-separated parts of `body`, commas inside parentheses kept.
    private static func topLevelParts(_ body: String, _ separator: (Character) -> Bool) -> [String] {
        var parts: [String] = []
        var depth = 0
        var current = ""
        for c in body {
            if c == "(" { depth += 1 } else if c == ")" { depth -= 1 }
            if depth == 0 && separator(c) {
                parts.append(current); current = ""
            } else {
                current.append(c)
            }
        }
        parts.append(current)
        return parts.map { $0.trimmingCharacters(in: .whitespaces) }
    }

    private static let rectangular: [String: Notation] = [
        "srgb": .rgb, "srgb-linear": .linearSRGB, "lab": .lab, "oklab": .oklab, "xyz": .xyzD65, "xyz-d65": .xyzD65, "xyz-d50": .xyzD50,
    ]
    private static let polar: [String: Notation] = ["hsl": .hsl, "hwb": .hwb, "lch": .lch, "oklch": .oklch]

    /// `colorMix`: `in <space> [<hue> hue]`, then colors with optional percentages.
    private static func mix(_ body: String) -> ColorData? {
        var parts = topLevelParts(body, { $0 == "," })
        var space = "oklab"
        var hueMethod: String?
        if let first = parts.first, first.hasPrefix("in ") || first == "in" {
            let words = first.split(whereSeparator: \.isWhitespace).map(String.init)
            guard words.count >= 2 else { return nil }
            space = words[1]
            if words.count == 4, words[3] == "hue", polar[space] != nil, ["shorter", "longer", "increasing", "decreasing"].contains(words[2]) {
                hueMethod = words[2]
            } else if words.count != 2 {
                return nil
            }
            parts.removeFirst()
        }
        var items: [(color: ColorData, percentage: Double?)] = []
        for part in parts {
            let words = topLevelParts(part, \.isWhitespace).filter { !$0.isEmpty }
            var percentage: Double?
            var colorWords: [String] = []
            for w in words {
                if w.hasSuffix("%"), percentage == nil, let v = Double(w.dropLast()) {
                    guard v >= 0 else { return nil }
                    percentage = v
                } else {
                    colorWords.append(w)
                }
            }
            guard colorWords.count == 1, let color = parse(colorWords[0]) else { return nil }
            items.append((color, percentage))
        }
        guard !items.isEmpty else { return nil }
        // colorMixComponents
        var total = 0.0
        var unspecified = 0.0
        for item in items {
            if let p = item.percentage { guard p <= 100 else { return nil }; total += p } else { unspecified += 1 }
        }
        let remainder = max(0, 100 - total)
        total = 0
        var colors = items.map { item -> (color: ColorData, percentage: Double) in
            let p = item.percentage ?? remainder / unspecified
            total += p
            return (item.color, p)
        }
        if total == 0 { return ColorData(notation: .srgb, channels: [0, 0, 0], alpha: 0) }
        var alphaMultiplier = 1.0
        if total > 100 { colors = colors.map { ($0.color, $0.percentage / total * 100) } }
        if total < 100 {
            alphaMultiplier = total / 100
            colors = colors.map { ($0.color, $0.percentage / total * 100) }
        }
        let notation: Notation
        let isPolar: Bool
        if let n = rectangular[space] { notation = n; isPolar = false } else if let n = polar[space] { notation = n; isPolar = true } else { return nil }
        if colors.count == 1 {
            var result = to(colors[0].color, notation)
            result.notation = notation
            result.alpha *= alphaMultiplier
            return result
        }
        var stack = Array(colors.reversed())
        while stack.count >= 2 {
            let a = stack.removeLast(), b = stack.removeLast()
            let mixed = isPolar ? polarPair(notation, hueMethod ?? "shorter", a.color, a.percentage, b.color, b.percentage)
                                : rectangularPair(notation, a.color, a.percentage, b.color, b.percentage)
            guard let mixed else { return nil }
            stack.append((mixed, a.percentage + b.percentage))
        }
        var result = stack[0].color
        result.alpha *= alphaMultiplier
        return result
    }

    private static func fill(_ a: Double, _ b: Double) -> Double { a.isNaN ? b : a }
    private static func interpolate(_ a: Double, _ b: Double, _ t: Double) -> Double { a * t + b * (1 - t) }
    private static func premultiply(_ v: Double, _ a: Double) -> Double { a.isNaN ? v : v.isNaN ? .nan : v * a }
    private static func unPremultiply(_ v: Double, _ a: Double) -> Double { a == 0 || a.isNaN ? v : v.isNaN ? .nan : v / a }

    private static func rectangularPair(_ notation: Notation, _ a: ColorData, _ p: Double, _ b: ColorData, _ q: Double) -> ColorData? {
        let t = p / (p + q)
        var alphaA = a.alpha, alphaB = b.alpha
        alphaA = alphaA.isNaN ? alphaB : alphaA
        alphaB = alphaB.isNaN ? alphaA : alphaB
        var u = to(a, notation).channels, v = to(b, notation).channels
        for i in 0..<3 { let ui = u[i]; u[i] = fill(u[i], v[i]); v[i] = fill(v[i], ui) }
        for i in 0..<3 { u[i] = premultiply(u[i], alphaA); v[i] = premultiply(v[i], alphaB) }
        let alpha = interpolate(alphaA, alphaB, t)
        return ColorData(notation: notation, channels: (0..<3).map { unPremultiply(interpolate(u[$0], v[$0], t), alpha) }, alpha: alpha)
    }

    private static func polarPair(_ notation: Notation, _ method: String, _ a: ColorData, _ p: Double, _ b: ColorData, _ q: Double) -> ColorData? {
        let t = p / (p + q)
        var alphaA = a.alpha, alphaB = b.alpha
        alphaA = alphaA.isNaN ? alphaB : alphaA
        alphaB = alphaB.isNaN ? alphaA : alphaB
        let x = to(a, notation).channels, y = to(b, notation).channels
        var h1, h2, c1, c2, l1, l2: Double
        if notation == .hsl || notation == .hwb {
            (h1, h2, c1, c2, l1, l2) = (x[0], y[0], x[1], y[1], x[2], y[2])
        } else {
            (c1, c2, l1, l2, h1, h2) = (x[0], y[0], x[1], y[1], x[2], y[2])
        }
        h1 = fill(h1, h2); if h1.isNaN { h1 = 0 }
        h2 = fill(h2, h1); if h2.isNaN { h2 = 0 }
        let c1o = c1; c1 = fill(c1, c2); c2 = fill(c2, c1o)
        let l1o = l1; l1 = fill(l1, l2); l2 = fill(l2, l1o)
        let d = h2 - h1
        switch method {
        case "shorter": if d > 180 { h1 += 360 } else if d < -180 { h2 += 360 }
        case "longer": if -180 < d && d < 180 { if d > 0 { h1 += 360 } else { h2 += 360 } }
        case "increasing": if d < 0 { h2 += 360 }
        case "decreasing": if d > 0 { h1 += 360 }
        default: return nil
        }
        c1 = premultiply(c1, alphaA); l1 = premultiply(l1, alphaA)
        c2 = premultiply(c2, alphaB); l2 = premultiply(l2, alphaB)
        let alpha = interpolate(alphaA, alphaB, t)
        let hue = interpolate(h1, h2, t)
        let first = unPremultiply(interpolate(c1, c2, t), alpha), second = unPremultiply(interpolate(l1, l2, t), alpha)
        let channels = notation == .hsl || notation == .hwb ? [hue, first, second] : [first, second, hue]
        return ColorData(notation: notation, channels: channels, alpha: alpha)
    }

    // MARK: Conversion

    private static func nanToZero(_ c: [Double]) -> [Double] { c.map { $0.isNaN ? 0 : $0 } }

    private static func reducePrecision(_ v: Double, _ digits: Double = 7) -> Double {
        if v.isNaN { return 0 }
        let n = pow(10, digits)
        return jsRound(v * n) / n
    }

    static func toXYZD50(_ color: ColorData) -> [Double] {
        let c = nanToZero(color.channels)
        switch color.notation {
        case .hex, .rgb, .srgb: return d65ToD50(multiply(linSRGBToXYZ, linSRGB(c)))
        case .linearSRGB: return d65ToD50(multiply(linSRGBToXYZ, c))
        case .hsl: return d65ToD50(multiply(linSRGBToXYZ, linSRGB(hslToSRGB(c))))
        case .hwb: return d65ToD50(multiply(linSRGBToXYZ, linSRGB(hwbToSRGB(c))))
        case .lab: return labToXYZ(c)
        case .lch: return labToXYZ(polarToRect(c))
        case .oklab: return d65ToD50(oklabToXYZ(c))
        case .oklch: return d65ToD50(oklabToXYZ(polarToRect(c)))
        case .xyzD50: return c
        case .xyzD65: return d65ToD50(c)
        }
    }

    static func fromXYZD50(_ xyz: [Double], _ notation: Notation) -> [Double] {
        switch notation {
        case .hex, .rgb, .srgb: return gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
        case .linearSRGB: return multiply(xyzToLinSRGB, d50ToD65(xyz))
        case .hsl: return sRGBToHSL(gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz))))
        case .hwb:
            let s = gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
            return [sRGBToHue(s), 100 * s.min()!, 100 * (1 - s.max()!)]
        case .lab: return xyzToLab(xyz)
        case .lch: return rectToPolar(xyzToLab(xyz))
        case .oklab: return xyzToOKLab(d50ToD65(xyz))
        case .oklch: return rectToPolar(xyzToOKLab(d50ToD65(xyz)))
        case .xyzD50: return xyz
        case .xyzD65: return d50ToD65(xyz)
        }
    }

    private static let rgbLike: [Notation] = [.hex, .linearSRGB, .rgb, .srgb, .xyzD50, .xyzD65]

    /// `colorDataTo`, with its carrying forward of missing components.
    static func to(_ color: ColorData, _ target: Notation) -> ColorData {
        var result = color
        if color.notation != target {
            result.notation = target == .hex ? .rgb : target
            result.channels = fromXYZD50(toXYZD50(color), target)
        } else {
            result.channels = nanToZero(color.channels)
        }
        func carry(_ from: [Int], _ to: [Int]) {
            for n in from {
                guard n < from.count, color.channels[from[n]].isNaN else { continue }
                result.channels[to[n]] = .nan
            }
        }
        let source = color.notation
        if target == source || (rgbLike.contains(target) && rgbLike.contains(source)) {
            carry([0, 1, 2], [0, 1, 2])
        } else {
            switch (target, source) {
            case (.hsl, .hwb): carry([0], [0])
            case (.hsl, .lab), (.hsl, .oklab): carry([2], [0])
            case (.hsl, .lch), (.hsl, .oklch): carry([0, 1, 2], [2, 1, 0])
            case (.hwb, .hsl): carry([0], [0])
            case (.hwb, .lch), (.hwb, .oklch): carry([0], [2])
            case (.lab, .hsl), (.oklab, .hsl): carry([0], [2])
            case (.lab, .lab), (.lab, .oklab), (.oklab, .lab), (.oklab, .oklab): carry([0, 1, 2], [0, 1, 2])
            case (.lab, .lch), (.lab, .oklch), (.oklab, .lch), (.oklab, .oklch): carry([0], [0])
            case (.lch, .hsl), (.oklch, .hsl): carry([0, 1, 2], [2, 1, 0])
            case (.lch, .hwb), (.oklch, .hwb): carry([0], [2])
            case (.lch, .lab), (.lch, .oklab), (.oklch, .lab), (.oklch, .oklab): carry([0], [0])
            case (.lch, .lch), (.lch, .oklch), (.oklch, .lch), (.oklch, .oklch): carry([0, 1, 2], [0, 1, 2])
            default: break
            }
        }
        // convertPowerlessComponentsToMissingComponents
        var c = result.channels
        switch target {
        case .hsl: if !c[1].isNaN && reducePrecision(c[1], 4) <= 0 { c[0] = .nan }
        case .hwb: if max(0, reducePrecision(c[1], 4)) + max(0, reducePrecision(c[2], 4)) >= 100 { c[0] = .nan }
        case .lch: if !c[1].isNaN && reducePrecision(c[1], 4) <= 0 { c[2] = .nan }
        case .oklch: if !c[1].isNaN && reducePrecision(c[1], 6) <= 0 { c[2] = .nan }
        default: break
        }
        result.channels = c
        return result
    }

    // MARK: Serialization

    /// `toPrecision(e, 7)`.
    private static func toPrecision(_ v: Double, _ digits: Int = 7) -> Double {
        let integerDigits = String(Int(abs(v).rounded(.down))).count
        if digits > integerDigits { return Double(jsToFixed(v, Double(digits - integerDigits)))! }
        let r = pow(10, Double(integerDigits - digits))
        return jsRound(v / r) * r
    }

    /// `serializeRGB` and core's `argbFromRgbOrRgba` reading its output.
    static func serializeRGB(_ color: ColorData) -> UInt32 {
        var c = color.channels
        switch color.notation {
        case .hsl:
            if reducePrecision(c[2]) <= 0 || reducePrecision(c[2]) >= 100 { c[0] = .nan; c[1] = .nan }
            if reducePrecision(c[1]) <= 0 { c[0] = .nan }
        case .hwb: if max(0, reducePrecision(c[1])) + max(0, reducePrecision(c[2])) >= 100 { c[0] = .nan }
        case .lab: if reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 100 { c[1] = .nan; c[2] = .nan }
        case .lch:
            if reducePrecision(c[1]) <= 0 { c[2] = .nan }
            if reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 100 { c[1] = .nan; c[2] = .nan }
        case .oklab: if reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 1 { c[1] = .nan; c[2] = .nan }
        case .oklch:
            if reducePrecision(c[1]) <= 0 { c[2] = .nan }
            if reducePrecision(c[0]) <= 0 || reducePrecision(c[0]) >= 1 { c[1] = .nan; c[2] = .nan }
        default: break
        }
        let rgb = xyzD50ToSRGBGamut(toXYZD50(ColorData(notation: color.notation, channels: c, alpha: color.alpha)))
        let channels = rgb.map { Int(min(255, max(0, jsRound(255 * toPrecision($0))))) }
        let alpha = min(1, max(0, toPrecision(color.alpha.isNaN ? 0 : color.alpha)))
        let shown = toPrecision(alpha, 4)
        let a = shown == 1 ? 255 : Int(jsRound(shown * 255))
        return UInt32(a & 0xff) << 24 | UInt32(channels[0] & 0xff) << 16 | UInt32(channels[1] & 0xff) << 8 | UInt32(channels[2] & 0xff)
    }

    private static func inGamut(_ c: [Double]) -> Bool { c.allSatisfy { $0 >= -1e-4 && $0 <= 1.0001 } }
    private static func clip(_ c: [Double]) -> [Double] { c.map { $0 < 0 ? 0 : $0 > 1 ? 1 : $0 } }

    private static func xyzD50ToSRGBGamut(_ xyz: [Double]) -> [Double] {
        let srgb = gamSRGB(multiply(xyzToLinSRGB, d50ToD65(xyz)))
        if inGamut(srgb) { return clip(srgb) }
        var oklch = rectToPolar(xyzToOKLab(d50ToD65(xyz)))
        if oklch[0] < 1e-6 { oklch = [0, 0, 0] }
        if oklch[0] > 0.999999 { oklch = [1, 0, 0] }
        return gamSRGB(mapGamutRayTrace(oklch))
    }

    private static func oklchToLinSRGB(_ c: [Double]) -> [Double] { multiply(xyzToLinSRGB, oklabToXYZ(polarToRect(c))) }
    private static func linSRGBToOKLCH(_ c: [Double]) -> [Double] { rectToPolar(xyzToOKLab(multiply(linSRGBToXYZ, c))) }

    private static func mapGamutRayTrace(_ color: [Double]) -> [Double] {
        let l = color[0], h = color[2]
        var mapped = oklchToLinSRGB(color)
        let anchor = oklchToLinSRGB([l, 0, h])
        for i in 0..<4 {
            if i > 0 {
                var c = linSRGBToOKLCH(mapped)
                c[0] = l; c[2] = h
                mapped = oklchToLinSRGB(c)
            }
            guard let hit = rayTraceBox(anchor, mapped) else { break }
            mapped = hit
        }
        return clip(mapped)
    }

    private static func rayTraceBox(_ start: [Double], _ end: [Double]) -> [Double]? {
        var tfar = Double.infinity, tnear = -Double.infinity
        var direction = [0.0, 0, 0]
        for i in 0..<3 {
            let a = start[i], d = end[i] - a
            direction[i] = d
            if d != 0 {
                let inv = 1 / d
                let t1 = (0 - a) * inv, t2 = (1 - a) * inv
                tnear = max(min(t1, t2), tnear)
                tfar = min(max(t1, t2), tfar)
            } else if a < 0 || a > 1 {
                return nil
            }
        }
        if tnear > tfar || tfar < 0 { return nil }
        if tnear < 0 { tnear = tfar }
        guard tnear.isFinite else { return nil }
        return (0..<3).map { start[$0] + direction[$0] * tnear }
    }

    // MARK: color-helpers (CSS Color 4 sample code)

    private static func multiply(_ m: [Double], _ v: [Double]) -> [Double] {
        [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]
    }
    private static let toD65: [Double] = [0.955473421488075, -0.02309845494876471, 0.06325924320057072, -0.0283697093338637, 1.0099953980813041, 0.021041441191917323, 0.012314014864481998, -0.020507649298898964, 1.330365926242124]
    private static let toD50: [Double] = [1.0479297925449969, 0.022946870601609652, -0.05019226628920524, 0.02962780877005599, 0.9904344267538799, -0.017073799063418826, -0.009243040646204504, 0.015055191490298152, 0.7518742814281371]
    private static func d50ToD65(_ c: [Double]) -> [Double] { multiply(toD65, c) }
    private static func d65ToD50(_ c: [Double]) -> [Double] { multiply(toD50, c) }
    private static let linSRGBToXYZ: [Double] = [506752.0 / 1228815, 87881.0 / 245763, 12673.0 / 70218, 87098.0 / 409605, 175762.0 / 245763, 12673.0 / 175545, 7918.0 / 409605, 87881.0 / 737289, 1001167.0 / 1053270]
    private static let xyzToLinSRGB: [Double] = [12831.0 / 3959, -329.0 / 214, -1974.0 / 3959, -851781.0 / 878810, 1648619.0 / 878810, 36519.0 / 878810, 705.0 / 12673, -2585.0 / 12673, 705.0 / 667]
    private static let xyzToLMS: [Double] = [0.819022437996703, 0.3619062600528904, -0.1288737815209879, 0.0329836539323885, 0.9292868615863434, 0.0361446663506424, 0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
    private static let lmsToOKLab: [Double] = [0.210454268309314, 0.7936177747023054, -0.0040720430116193, 1.9779985324311684, -2.42859224204858, 0.450593709617411, 0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
    private static let okLabToLMS: [Double] = [1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586, -0.0638541728258133, 1, -0.0894841775298119, -1.2914855480194092]
    private static let lmsToXYZ: [Double] = [1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.112286803280317, -0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
    private static let d50White: [Double] = [0.3457 / 0.3585, 1, 0.2958 / 0.3585]

    private static func linSRGB(_ c: [Double]) -> [Double] {
        c.map { v in let a = abs(v); return a <= 0.04045 ? v / 12.92 : (v < 0 ? -1 : 1) * pow((a + 0.055) / 1.055, 2.4) }
    }
    private static func gamSRGB(_ c: [Double]) -> [Double] {
        c.map { v in let a = abs(v); return a > 0.0031308 ? (v < 0 ? -1 : 1) * (1.055 * pow(a, 1 / 2.4) - 0.055) : 12.92 * v }
    }
    private static func xyzToOKLab(_ c: [Double]) -> [Double] { multiply(lmsToOKLab, multiply(xyzToLMS, c).map { cbrt($0) }) }
    private static func oklabToXYZ(_ c: [Double]) -> [Double] { multiply(lmsToXYZ, multiply(okLabToLMS, c).map { $0 * $0 * $0 }) }
    private static func polarToRect(_ c: [Double]) -> [Double] {
        let h = c[2] * Double.pi / 180
        return [c[0], c[1] * cos(h), c[1] * sin(h)]
    }
    private static func rectToPolar(_ c: [Double]) -> [Double] {
        let h = 180 * atan2(c[2], c[1]) / Double.pi
        return [c[0], (c[1] * c[1] + c[2] * c[2]).squareRoot(), h >= 0 ? h : h + 360]
    }
    private static func labToXYZ(_ c: [Double]) -> [Double] {
        let k = 24389.0 / 27, e = 216.0 / 24389
        let f1 = (c[0] + 16) / 116, f0 = c[1] / 500 + f1, f2 = f1 - c[2] / 200
        return [(pow(f0, 3) > e ? pow(f0, 3) : (116 * f0 - 16) / k) * d50White[0],
                (c[0] > 8 ? pow((c[0] + 16) / 116, 3) : c[0] / k) * d50White[1],
                (pow(f2, 3) > e ? pow(f2, 3) : (116 * f2 - 16) / k) * d50White[2]]
    }
    private static func xyzToLab(_ c: [Double]) -> [Double] {
        func f(_ t: Double) -> Double { t > 216.0 / 24389 ? cbrt(t) : (24389.0 / 27 * t + 16) / 116 }
        let f0 = f(c[0] / d50White[0]), f1 = f(c[1] / d50White[1]), f2 = f(c[2] / d50White[2])
        return [116 * f1 - 16, 500 * (f0 - f1), 200 * (f1 - f2)]
    }
    private static func hslToSRGB(_ c: [Double]) -> [Double] {
        var h = c[0].truncatingRemainder(dividingBy: 360)
        let s = c[1] / 100, l = c[2] / 100
        if h < 0 { h += 360 }
        func channel(_ n: Double) -> Double {
            let k = (n + h / 30).truncatingRemainder(dividingBy: 12)
            return l - s * min(l, 1 - l) * max(-1, min(k - 3, 9 - k, 1))
        }
        return [channel(0), channel(8), channel(4)]
    }
    private static func hwbToSRGB(_ c: [Double]) -> [Double] {
        let w = c[1] / 100, b = c[2] / 100
        if w + b >= 1 { let g = w / (w + b); return [g, g, g] }
        let rgb = hslToSRGB([c[0], 100, 50])
        return rgb.map { $0 * (1 - w - b) + w }
    }
    private static func sRGBToHSL(_ c: [Double]) -> [Double] {
        let r = c[0], g = c[1], b = c[2]
        let mx = max(r, g, b), mn = min(r, g, b), l = (mn + mx) / 2, d = mx - mn
        var h = Double.nan, s = 0.0
        if jsRound(1e5 * d) != 0 {
            let lr = jsRound(1e5 * l)
            s = lr == 0 || lr == 1e5 ? 0 : (mx - l) / min(l, 1 - l)
            switch mx {
            case r: h = (g - b) / d + (g < b ? 6 : 0)
            case g: h = (b - r) / d + 2
            default: h = (r - g) / d + 4
            }
            h *= 60
        }
        if s < 0 { h += 180; s = abs(s) }
        if h >= 360 { h -= 360 }
        return [h, 100 * s, 100 * l]
    }
    private static func sRGBToHue(_ c: [Double]) -> Double {
        let r = c[0], g = c[1], b = c[2]
        let mx = max(r, g, b), mn = min(r, g, b), d = mx - mn
        var h = Double.nan
        if d != 0 {
            switch mx {
            case r: h = (g - b) / d + (g < b ? 6 : 0)
            case g: h = (b - r) / d + 2
            default: h = (r - g) / d + 4
            }
            h *= 60
        }
        if h >= 360 { h -= 360 }
        return h
    }

    private static let namedColors: [String: [Int]] = [
        "aliceblue": [240, 248, 255], "antiquewhite": [250, 235, 215], "aqua": [0, 255, 255], "aquamarine": [127, 255, 212], "azure": [240, 255, 255],
        "beige": [245, 245, 220], "bisque": [255, 228, 196], "black": [0, 0, 0], "blanchedalmond": [255, 235, 205], "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226], "brown": [165, 42, 42], "burlywood": [222, 184, 135], "cadetblue": [95, 158, 160], "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30], "coral": [255, 127, 80], "cornflowerblue": [100, 149, 237], "cornsilk": [255, 248, 220], "crimson": [220, 20, 60],
        "cyan": [0, 255, 255], "darkblue": [0, 0, 139], "darkcyan": [0, 139, 139], "darkgoldenrod": [184, 134, 11], "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0], "darkgrey": [169, 169, 169], "darkkhaki": [189, 183, 107], "darkmagenta": [139, 0, 139], "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0], "darkorchid": [153, 50, 204], "darkred": [139, 0, 0], "darksalmon": [233, 150, 122], "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139], "darkslategray": [47, 79, 79], "darkslategrey": [47, 79, 79], "darkturquoise": [0, 206, 209], "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147], "deepskyblue": [0, 191, 255], "dimgray": [105, 105, 105], "dimgrey": [105, 105, 105], "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34], "floralwhite": [255, 250, 240], "forestgreen": [34, 139, 34], "fuchsia": [255, 0, 255], "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255], "gold": [255, 215, 0], "goldenrod": [218, 165, 32], "gray": [128, 128, 128], "green": [0, 128, 0],
        "greenyellow": [173, 255, 47], "grey": [128, 128, 128], "honeydew": [240, 255, 240], "hotpink": [255, 105, 180], "indianred": [205, 92, 92],
        "indigo": [75, 0, 130], "ivory": [255, 255, 240], "khaki": [240, 230, 140], "lavender": [230, 230, 250], "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0], "lemonchiffon": [255, 250, 205], "lightblue": [173, 216, 230], "lightcoral": [240, 128, 128], "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210], "lightgray": [211, 211, 211], "lightgreen": [144, 238, 144], "lightgrey": [211, 211, 211], "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122], "lightseagreen": [32, 178, 170], "lightskyblue": [135, 206, 250], "lightslategray": [119, 136, 153], "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222], "lightyellow": [255, 255, 224], "lime": [0, 255, 0], "limegreen": [50, 205, 50], "linen": [250, 240, 230],
        "magenta": [255, 0, 255], "maroon": [128, 0, 0], "mediumaquamarine": [102, 205, 170], "mediumblue": [0, 0, 205], "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219], "mediumseagreen": [60, 179, 113], "mediumslateblue": [123, 104, 238], "mediumspringgreen": [0, 250, 154], "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133], "midnightblue": [25, 25, 112], "mintcream": [245, 255, 250], "mistyrose": [255, 228, 225], "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173], "navy": [0, 0, 128], "oldlace": [253, 245, 230], "olive": [128, 128, 0], "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0], "orangered": [255, 69, 0], "orchid": [218, 112, 214], "palegoldenrod": [238, 232, 170], "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238], "palevioletred": [219, 112, 147], "papayawhip": [255, 239, 213], "peachpuff": [255, 218, 185], "peru": [205, 133, 63],
        "pink": [255, 192, 203], "plum": [221, 160, 221], "powderblue": [176, 224, 230], "purple": [128, 0, 128], "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0], "rosybrown": [188, 143, 143], "royalblue": [65, 105, 225], "saddlebrown": [139, 69, 19], "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96], "seagreen": [46, 139, 87], "seashell": [255, 245, 238], "sienna": [160, 82, 45], "silver": [192, 192, 192],
        "skyblue": [135, 206, 235], "slateblue": [106, 90, 205], "slategray": [112, 128, 144], "slategrey": [112, 128, 144], "snow": [255, 250, 250],
        "springgreen": [0, 255, 127], "steelblue": [70, 130, 180], "tan": [210, 180, 140], "teal": [0, 128, 128], "thistle": [216, 191, 216],
        "tomato": [255, 99, 71], "turquoise": [64, 224, 208], "violet": [238, 130, 238], "wheat": [245, 222, 179], "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245], "yellow": [255, 255, 0], "yellowgreen": [154, 205, 50],
    ]
}
