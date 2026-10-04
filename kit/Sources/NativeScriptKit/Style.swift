import UIKit

/// `PercentLength` / `Length` from styling/length-shared.
enum Length: Equatable {
    case auto
    case dip(Double)
    case px(Double)
    case percent(Double)

    static let zero = Length.dip(0)

    init(_ value: Any?, default fallback: Length) {
        switch value {
        case nil: self = fallback
        case let d as Double: self = .dip(d)
        case let i as Int: self = .dip(Double(i))
        case let s as String:
            let text = s.trimmingCharacters(in: .whitespaces)
            if text == "auto" { self = .auto }
            else if text.hasSuffix("%"), let v = parseFloat(String(text.dropLast())) { self = .percent(v / 100) }
            else if text.contains("px"), let v = parseFloat(text.replacingOccurrences(of: "px", with: "")) { self = .px(v) }
            else if let v = parseFloat(text) { self = .dip(v) }
            else { self = fallback }
        default: self = fallback
        }
    }

    func toDevicePixels(auto: Double = .nan, parentAvailable: Double = .nan) -> Double {
        switch self {
        case .auto: return auto
        case .dip(let v): return LayoutHelper.round(LayoutHelper.toDevicePixels(v))
        case .px(let v): return LayoutHelper.round(v)
        case .percent(let v): return LayoutHelper.round(parentAvailable * v)
        }
    }
}

/// `Background` from styling/background-common, reduced to what iOS draws
/// for a view: color, border widths and colors (device pixels), radii.
struct Background: Equatable {
    var color: UIColor?
    var borderTopWidth: Double = 0, borderRightWidth: Double = 0, borderBottomWidth: Double = 0, borderLeftWidth: Double = 0
    var borderTopColor: UIColor?, borderRightColor: UIColor?, borderBottomColor: UIColor?, borderLeftColor: UIColor?
    var borderTopLeftRadius: Double = 0, borderTopRightRadius: Double = 0, borderBottomRightRadius: Double = 0, borderBottomLeftRadius: Double = 0
    var image: LinearGradient?
    /// Drawn last first: the first one declared is closest to the view.
    var boxShadows: [BoxShadow] = []
    var clipPath: ClipPath?

    var hasBorderWidth: Bool { borderTopWidth > 0 || borderRightWidth > 0 || borderBottomWidth > 0 || borderLeftWidth > 0 }
    var hasBorderRadius: Bool { borderTopLeftRadius > 0 || borderTopRightRadius > 0 || borderBottomRightRadius > 0 || borderBottomLeftRadius > 0 }
    var hasUniformBorderColor: Bool { borderTopColor == borderRightColor && borderTopColor == borderBottomColor && borderTopColor == borderLeftColor }
    var hasUniformBorderWidth: Bool { borderTopWidth == borderRightWidth && borderTopWidth == borderBottomWidth && borderTopWidth == borderLeftWidth }
    var hasUniformBorderRadius: Bool { borderTopLeftRadius == borderTopRightRadius && borderTopLeftRadius == borderBottomRightRadius && borderTopLeftRadius == borderBottomLeftRadius }
    var hasUniformBorder: Bool { hasUniformBorderColor && hasUniformBorderWidth && hasUniformBorderRadius }
}

/// `Font` from styling/font: CSS family/size/weight/style resolved to UIFont
/// the way NativeScriptUtils.createUIFont does.
struct Font: Equatable {
    var family: String?
    var size: Double?
    var weight: String = "normal"
    var style: String = "normal"

    var isDefault: Bool { family == nil && size == nil && weight == "normal" && style == "normal" }
    var isBold: Bool { ["600", "bold", "700", "800", "900"].contains(weight) }
    var isItalic: Bool { style == "italic" }

    var nativeWeight: UIFont.Weight {
        switch weight {
        case "100": return .ultraLight
        case "200": return .thin
        case "300": return .light
        case "500": return .medium
        case "600": return .semibold
        case "bold", "700": return .bold
        case "800": return .heavy
        case "900": return .black
        default: return .regular
        }
    }

    func uiFont(default defaultFont: UIFont?) -> UIFont {
        let pointSize = size.map { CGFloat($0) } ?? defaultFont?.pointSize ?? UIFont.labelFontSize
        var traits: UIFontDescriptor.SymbolicTraits = []
        if isBold { traits.insert(.traitBold) }
        if isItalic { traits.insert(.traitItalic) }
        for name in (family ?? "").split(separator: ",").map({ $0.trimmingCharacters(in: .whitespaces).replacingOccurrences(of: "'", with: "").replacingOccurrences(of: "\"", with: "") }).filter({ !$0.isEmpty }) {
            var fontFamily = name
            if name.lowercased() == "serif" { fontFamily = "Times New Roman" }
            else if name.lowercased() == "monospace" { fontFamily = "Courier New" }
            if fontFamily == "sans-serif" || fontFamily == "system" { break }
            let descriptor = UIFontDescriptor(fontAttributes: [
                .family: fontFamily,
                .traits: [UIFontDescriptor.TraitKey.symbolic: traits.rawValue, UIFontDescriptor.TraitKey.weight: nativeWeight.rawValue],
            ])
            let font = UIFont(descriptor: descriptor, size: pointSize)
            if font.familyName == fontFamily { return font }
        }
        var result = UIFont.systemFont(ofSize: pointSize, weight: nativeWeight)
        if isItalic, let italic = result.fontDescriptor.withSymbolicTraits(traits) {
            result = UIFont(descriptor: italic, size: pointSize)
        }
        return result
    }
}

// Conversions of a property value as templates and CSS hand it over:
// strings as written, or typed values from bindings.

func toDouble(_ value: Any?) -> Double? {
    switch value {
    case let d as Double: return d
    case let i as Int: return Double(i)
    case let f as CGFloat: return Double(f)
    case let b as Bool: return b ? 1 : 0
    case let s as String: return parseFloat(s)
    default: return nil
    }
}

func toBool(_ value: Any?) -> Bool? {
    switch value {
    case let b as Bool: return b
    case let s as String:
        switch s.trimmingCharacters(in: .whitespaces).lowercased() {
        case "true": return true
        case "false": return false
        default: return nil
        }
    case let d as Double: return d != 0
    case let i as Int: return i != 0
    default: return nil
    }
}

func toColor(_ value: Any?) -> UIColor? {
    switch value {
    case let c as UIColor: return c
    case let c as Color: return c.ios
    case let s as String: return Color(s)?.ios
    default: return nil
    }
}

func toText(_ value: Any?) -> String? {
    switch value {
    case nil: return nil
    case let s as String: return s
    case let d as Double: return js(d)
    case let i as Int: return String(i)
    case let b as Bool: return js(b)
    default: return "\(value!)"
    }
}

/// Values compare as NativeScript's property system sees them change.
func sameValue(_ a: Any?, _ b: Any?) -> Bool {
    switch (a, b) {
    case (nil, nil): return true
    case (nil, _), (_, nil): return false
    case let (x as UIColor, y as UIColor): return x == y
    case let (x as Double, y as Double): return x == y
    case let (x as String, y as String): return x == y
    case let (x as Bool, y as Bool): return x == y
    default: return String(describing: a!) == String(describing: b!) && type(of: a!) == type(of: b!)
    }
}
