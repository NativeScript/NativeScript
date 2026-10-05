import UIKit

/// `text-shadow` / `text-stroke` as styling/css-utils `parseCSSShorthand`
/// reads them: lengths, and a color first or last (black otherwise).
struct CSSShadow {
    var offsetX: Length, offsetY: Length, blurRadius: Length, spreadRadius: Length
    var color: UIColor?
    var colorAlpha: Double?
    var inset: Bool

    init?(css value: String) {
        guard let data = CSSShadow.shorthand(value) else { return nil }
        func at(_ i: Int) -> Length { i < data.values.count ? data.values[i] : .zero }
        offsetX = at(0); offsetY = at(1); blurRadius = at(2); spreadRadius = at(3)
        let color = Color.parse(data.color)
        self.color = color?.uiColor
        colorAlpha = color.map { Double($0.a) }
        inset = data.inset
    }

    static func shorthand(_ value: String) -> (inset: Bool, color: String, values: [Length])? {
        let parts = splitTopLevelWhitespace(value.trimmingCharacters(in: .whitespaces))
        guard let first = parts.first, !["none", "unset"].contains(first) else { return nil }
        let invalidColors = ["inset", "unset"]
        func isLength(_ v: String) -> Bool { v == "0" || v.range(of: #"^-?[0-9]+[a-zA-Z%]*?$"#, options: .regularExpression) != nil }
        var color = "black"
        if !isLength(first) && !invalidColors.contains(first) {
            color = first
        } else if let last = parts.last, !isLength(last), !invalidColors.contains(last) {
            color = last
        }
        let values = parts.filter { !invalidColors.contains($0) && $0 != color }.map { Length($0, default: .zero) }
        return (parts.contains("inset"), color, values)
    }

    private static func splitTopLevelWhitespace(_ value: String) -> [String] {
        var parts: [String] = []
        var current = ""
        var depth = 0
        for c in value {
            if c == "(" { depth += 1 } else if c == ")" { depth = max(0, depth - 1) }
            if c.isWhitespace && depth == 0 {
                if !current.isEmpty { parts.append(current) }
                current = ""
            } else {
                current.append(c)
            }
        }
        if !current.isEmpty { parts.append(current) }
        return parts
    }
}

extension UIView {
    /// UIView+NativeScript `nativeScriptSetTextDecorationAndTransform`: plain text
    /// unless a decoration, letter spacing or line height needs attributes.
    func nativeScriptSetTextDecorationAndTransform(_ text: String, _ decoration: String, _ letterSpacing: Double, _ lineHeight: Double) {
        var attributes: [NSAttributedString.Key: Any] = [:]
        if decoration.contains("underline") { attributes[.underlineStyle] = NSUnderlineStyle.single.rawValue }
        if decoration.contains("line-through") { attributes[.strikethroughStyle] = NSUnderlineStyle.single.rawValue }
        let font: UIFont?
        switch self {
        case let button as UIButton: font = button.titleLabel?.font
        case let label as UILabel: font = label.font
        case let field as UITextField: font = field.font
        default: font = nil
        }
        if letterSpacing != 0, let font {
            let kern = letterSpacing * Double(font.pointSize)
            attributes[.kern] = kern
            if let field = self as? UITextField { field.defaultTextAttributes[.kern] = kern }
        }
        if lineHeight > 0 {
            let paragraph = NSMutableParagraphStyle()
            paragraph.lineSpacing = CGFloat(lineHeight)
            switch self {
            case let button as UIButton: paragraph.alignment = button.titleLabel?.textAlignment ?? .natural
            case let label as UILabel:
                paragraph.alignment = label.textAlignment
                paragraph.lineBreakMode = label.lineBreakMode
            case let field as UITextField: paragraph.alignment = field.textAlignment
            default: break
            }
            attributes[.paragraphStyle] = paragraph
        }
        if !attributes.isEmpty {
            let result = NSAttributedString(string: text, attributes: attributes)
            switch self {
            case let button as UIButton: button.setAttributedTitle(result, for: .normal)
            case let label as UILabel: label.attributedText = result
            case let field as UITextField: field.attributedText = result
            default: break
            }
        } else {
            switch self {
            case let button as UIButton:
                button.setAttributedTitle(nil, for: .normal)
                button.setTitle(text, for: .normal)
            case let label as UILabel:
                label.attributedText = nil
                label.text = text
            case let field as UITextField:
                field.attributedText = nil
                field.text = text
            default: break
            }
        }
    }

    /// `nativeScriptSetFormattedTextStroke`: the width is NSStrokeWidth's, a percentage of the font size.
    func nativeScriptSetFormattedTextStroke(_ width: Double, _ color: UIColor?) {
        guard width > 0, let label = self as? UILabel ?? (self as? UIButton)?.titleLabel, let current = label.attributedText else { return }
        let text = NSMutableAttributedString(attributedString: current)
        let range = NSRange(location: 0, length: text.length)
        text.addAttribute(.strokeWidth, value: NSNumber(value: Float(width)), range: range)
        if let color { text.addAttribute(.strokeColor, value: color, range: range) }
        label.attributedText = text
    }
}

/// text-base `getTransformedText`.
func transformedText(_ text: String, _ transform: String?) -> String {
    switch transform {
    case "uppercase": return (text as NSString).localizedUppercase
    case "lowercase": return (text as NSString).localizedLowercase
    case "capitalize": return (text as NSString).localizedCapitalized
    default: return text
    }
}
