import UIKit

/// `HtmlView` from html-view/index.ios: a read-only UITextView showing the
/// attributed string UIKit makes of the HTML, with the view's font size,
/// family, color and link color appended as a style sheet.
open class HtmlView: View {
    open override class var cssType: String { "HtmlView" }

    private var textView: UITextView? { nativeView as? UITextView }
    private var defaultFont: UIFont?

    open override func createNativeView() -> UIView? {
        let view = UITextView()
        view.isScrollEnabled = false
        view.isEditable = false
        view.isSelectable = true
        view.isUserInteractionEnabled = true
        view.dataDetectorTypes = .all
        return view
    }

    open override func initNativeView() {
        applied["html"] = ""
        defaultFont = textView?.font
        textView?.textContainer.lineFragmentPadding = 0
        textView?.textContainerInset = .zero
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        guard let textView else { return }
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let desired = LayoutHelper.measureNativeView(textView, width, widthMode, height, heightMode)
        let labelWidth = widthMode == LayoutHelper.atMost ? min(Double(desired.width), Double(width)) : Double(desired.width)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(max(labelWidth, effectiveMinWidth), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(max(Double(desired.height), effectiveMinHeight), height, heightMode, 0))
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        guard let textView else { return super.setProperty(name, value) }
        switch name {
        case "html", "linkColor":
            renderWithStyles()
        case "selectable":
            textView.isSelectable = toBool(value) ?? true
        case "color":
            textView.textColor = toColor(value)
            renderWithStyles()
        case "fontSize", "fontWeight", "fontStyle", "fontFamily":
            var font = Font()
            font.size = toDouble(applied["fontSize"])
            if let weight = toText(applied["fontWeight"])?.trimmingCharacters(in: .whitespaces).lowercased() {
                font.weight = weight == "400" ? "normal" : weight
            }
            font.style = (applied["fontStyle"] as? String) ?? "normal"
            font.family = applied["fontFamily"] as? String
            textView.font = font.isDefault ? defaultFont : font.uiFont(default: textView.font)
            renderWithStyles()
        default:
            super.setProperty(name, value)
        }
    }

    private func renderWithStyles() {
        guard let textView else { return }
        var html = toText(applied["html"]) ?? ""
        html += "<style>"
        var body = "font-size: \(toDouble(applied["fontSize"]).map { js($0) } ?? "undefined")px;"
        if let family = applied["fontFamily"] as? String, !family.isEmpty { body += "font-family: '\(family)';" }
        if let color = HtmlView.hex(applied["color"]) { body += "color: \(color);" }
        html += "body {\(body)}"
        if let link = HtmlView.hex(applied["linkColor"]) { html += "a, a:link, a:visited { color: \(link) !important; }" }
        html += "</style>"
        if let data = (html as NSString).data(using: String.Encoding.unicode.rawValue) {
            textView.attributedText = try? NSAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.html], documentAttributes: nil)
        }
        if applied["color"] == nil { textView.textColor = .label }
    }

    /// `Color.hex`: `#RRGGBB`, with `AA` appended when not opaque.
    private static func hex(_ value: Any?) -> String? {
        let argb: UInt32
        switch value {
        case let s as String:
            guard let color = Color(s) else { return nil }
            argb = color.argb
        case let c as UIColor:
            var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
            c.getRed(&r, green: &g, blue: &b, alpha: &a)
            func byte(_ v: CGFloat) -> UInt32 { UInt32(max(0, min(255, (v * 255).rounded()))) }
            argb = byte(a) << 24 | byte(r) << 16 | byte(g) << 8 | byte(b)
        default:
            return nil
        }
        var result = "#" + String(format: "%06X", argb & 0xff_ffff)
        if argb >> 24 != 0xff { result += String(format: "%02X", argb >> 24) }
        return result
    }
}
