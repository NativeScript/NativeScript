import UIKit

/// `Span` from text-base/span: a run of text with its own font, colors and
/// decoration; what it does not set it inherits from its formatted string and text view.
open class Span: View {
    /// ViewBase has no CSS type: no type selector matches a span.
    open override class var cssType: String { "" }

    /// The style changes `FormattedString.addPropertyChangeHandler` listens to.
    static let watchedStyles: Set<String> = [
        "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariationSettings", "textDecoration", "color", "backgroundColor",
        "iosAccessibilityAdjustsFontSize", "iosAccessibilityMinFontScale", "iosAccessibilityMaxFontScale", "fontScaleInternal",
    ]

    /// `_text`: undefined until set, then a string.
    private(set) var text: String?
    private(set) var tappable = false

    open override func createNativeView() -> UIView? { nil }

    open override func propertyValueChanged(_ name: String, _ value: Any?) {
        super.propertyValueChanged(name, value)
        if name == "text" {
            // Only the first `\n` and `\t` written out in a string become the characters.
            if let string = value as? String {
                text = jsReplace(jsReplace(string, "\\n", "\n"), "\\t", "\t")
            } else {
                text = toText(value) ?? ""
            }
        }
        if Span.watchedStyles.contains(name) || !View.styleProperties.contains(name) {
            (parent as? FormattedString)?.spanChanged()
        }
    }

    open override func listenerAdded(_ event: String) {
        super.listenerAdded(event)
        if event == "linkTap" && !tappable {
            tappable = true
            (parent as? FormattedString)?.spanChanged()
        }
    }
}

/// `FormattedString` from text-base/formatted-string: the spans of a text
/// view's `formattedText`. Any change to a span rebuilds the text view's attributed text.
open class FormattedString: View {
    open override class var cssType: String { "" }

    private(set) var spans: [Span] = []
    /// A span's handlers are attached after it joins the tree, so its first values notify nothing.
    private var isAddingSpan = false

    open override func createNativeView() -> UIView? { nil }

    open override func addChild(_ child: View) {
        if let span = child as? Span { addSpan(span) }
    }

    func addSpan(_ span: Span) {
        spans.append(span)
        isAddingSpan = true
        addView(span)
        isAddingSpan = false
        contentsChanged()
    }

    open override func eachChildView(_ body: (View) -> Void) {
        for span in spans { body(span) }
    }

    func spanChanged() {
        if !isAddingSpan { contentsChanged() }
    }

    open override func propertyValueChanged(_ name: String, _ value: Any?) {
        super.propertyValueChanged(name, value)
        if !View.styleProperties.contains(name) { contentsChanged() }
    }

    private func contentsChanged() {
        (parent as? TextBase)?.formattedTextContentsChanged()
    }

    /// `toString()`: the spans' texts joined, an unset one as `undefined`.
    var string: String { spans.map { $0.text ?? "undefined" }.joined() }

    var isTappable: Bool { spans.contains { $0.tappable } }
}

/// What text-base/index.ios keeps for a formatted text: the span ranges of the
/// last build and the tap recognizer of a tappable one.
final class FormattedTextState {
    /// `nativeViewProtected` exists from the first load on; contents changes before that wait for it.
    var isSetUp = false
    /// The formatted string the text view has added to its tree.
    var attached: FormattedString?
    var spanRanges: [NSRange] = []
    var tapHandler: LinkTapHandler?
    var tapRecognizer: UITapGestureRecognizer?
}

extension TextBase {
    /// `onFormattedTextPropertyChanged`: the formatted string joins the text view's tree.
    func formattedTextChanged(to new: FormattedString?) {
        let old = formattedState.attached
        formattedState.attached = new
        if let old, old !== new { removeView(old) }
        if let new, new !== old { addView(new) }
    }

    /// `_onFormattedTextContentsChanged`: runs the native setter at once, loaded or not.
    func formattedTextContentsChanged() {
        if formattedState.isSetUp, let formattedText { formattedTextSetNative(formattedText) }
    }

    /// `formattedTextProperty.setNative`.
    func formattedTextSetNative(_ value: FormattedString?) {
        setNativeText(reset: false)
        setTappableState(value?.isTappable ?? false)
        nativeValueChange("text", value?.string ?? "")
        requestLayoutOnTextChanged()
    }

    private func setTappableState(_ tappable: Bool) {
        guard let view = textView, (formattedState.tapHandler != nil) != tappable else { return }
        if tappable {
            let handler = LinkTapHandler(owner: self)
            let recognizer = UITapGestureRecognizer(target: handler, action: #selector(LinkTapHandler.linkTap(_:)))
            formattedState.tapHandler = handler
            formattedState.tapRecognizer = recognizer
            view.addGestureRecognizer(recognizer)
        } else {
            if let recognizer = formattedState.tapRecognizer { view.removeGestureRecognizer(recognizer) }
            formattedState.tapHandler = nil
            formattedState.tapRecognizer = nil
        }
    }

    /// `_setNativeText` for a formatted text: `nativeScriptSetFormattedTextDecorationAndTransform`
    /// with the text view's letter spacing and line height.
    func setFormattedNativeText(_ formattedText: FormattedString) {
        guard let view = textView else { return }
        let text = NSMutableAttributedString()
        for detail in formattedStringDetails(formattedText) { text.append(detail) }
        let letterSpacing = toDouble(applied["letterSpacing"]) ?? 0
        let lineHeight = toDouble(applied["lineHeight"]) ?? 0
        let font = nativeFont
        let range = NSRange(location: 0, length: text.length)
        if letterSpacing != 0 {
            text.addAttribute(.kern, value: NSNumber(value: letterSpacing * Double(font?.pointSize ?? 0)), range: range)
        }
        let label = view as? UILabel
        if lineHeight > 0 {
            let paragraph = NSMutableParagraphStyle()
            paragraph.lineSpacing = CGFloat(lineHeight)
            paragraph.alignment = textAlignment(of: view)
            if let label { paragraph.lineBreakMode = label.lineBreakMode }
            text.addAttribute(.paragraphStyle, value: paragraph, range: range)
        } else if label != nil || view is UITextView {
            let paragraph = NSMutableParagraphStyle()
            paragraph.alignment = textAlignment(of: view)
            text.addAttribute(.paragraphStyle, value: paragraph, range: range)
        }
        switch view {
        case let button as UIButton:
            button.setAttributedTitle(text, for: .normal)
        case let label as UILabel:
            label.textColor = .label
            label.attributedText = text
        case let field as UITextField:
            field.textColor = .label
            field.attributedText = text
        case let textView as UITextView:
            textView.textColor = .label
            textView.attributedText = text
        default:
            break
        }
    }

    private func textAlignment(of view: UIView) -> NSTextAlignment {
        switch view {
        case let button as UIButton: return button.titleLabel?.textAlignment ?? .natural
        case let label as UILabel: return label.textAlignment
        case let field as UITextField: return field.textAlignment
        case let textView as UITextView: return textView.textAlignment
        default: return .natural
        }
    }

    /// `getFormattedStringDetails` and `createMutableStringForSpan`: one attributed run per span.
    private func formattedStringDetails(_ formattedText: FormattedString) -> [NSAttributedString] {
        var runs: [NSAttributedString] = []
        var ranges: [NSRange] = []
        let transform = toText(applied["textTransform"]) ?? "initial"
        var start = 0
        for span in formattedText.spans {
            var text = span.text ?? ""
            if transform != "none" && transform != "initial" { text = transformedText(text, transform) }
            var attributes: [NSAttributedString.Key: Any] = [:]
            attributes[.font] = spanFont(span).uiFont(default: nativeFont)
            if let color = toColor(span.applied["color"]) { attributes[.foregroundColor] = color }
            if let background = toColor(span.applied["backgroundColor"]) ?? toColor(formattedText.applied["backgroundColor"]) {
                attributes[.backgroundColor] = background
            }
            // `getClosestPropertyValue`: the span's own decoration, else its formatted string's, else the text view's.
            if let decoration = toText(span.applied["textDecoration"] ?? formattedText.applied["textDecoration"] ?? applied["textDecoration"]) {
                if decoration.contains("underline") { attributes[.underlineStyle] = NSNumber(value: NSUnderlineStyle.single.rawValue) }
                if decoration.contains("line-through") { attributes[.strikethroughStyle] = NSNumber(value: NSUnderlineStyle.single.rawValue) }
            }
            attributes[.baselineOffset] = NSNumber(value: 0)
            runs.append(NSAttributedString(string: text, attributes: attributes))
            let length = text.utf16.count
            ranges.append(NSRange(location: start, length: length))
            start += length
        }
        formattedState.spanRanges = ranges
        return runs
    }

    private func transformedText(_ text: String, _ transform: String) -> String {
        switch transform {
        case "uppercase": return (text as NSString).localizedUppercase
        case "lowercase": return (text as NSString).localizedLowercase
        case "capitalize": return (text as NSString).localizedCapitalized
        default: return text
        }
    }

    private func spanFont(_ span: Span) -> Font {
        var font = Font()
        font.family = span.applied["fontFamily"] as? String
        font.size = toDouble(span.applied["fontSize"])
        let weight = span.applied["fontWeight"]
        if let string = weight as? String {
            let v = string.trimmingCharacters(in: .whitespaces).lowercased()
            font.weight = v == "400" ? "normal" : v
        } else if let number = toDouble(weight) {
            font.weight = js(number)
        }
        font.style = (span.applied["fontStyle"] as? String) ?? "normal"
        return font
    }
}

/// `UILabelClickHandlerImpl`: finds the span under a tap and raises its `linkTap`.
final class LinkTapHandler: NSObject {
    private weak var owner: TextBase?

    init(owner: TextBase) {
        self.owner = owner
    }

    @objc func linkTap(_ tap: UITapGestureRecognizer) {
        guard let owner, let textView = owner.textView else { return }
        let view: UIView = (textView as? UIButton)?.titleLabel ?? textView
        let offsetXMultiplier: CGFloat
        switch toText(owner.applied["textAlignment"]) {
        case "center": offsetXMultiplier = 0.5
        case "right": offsetXMultiplier = 1
        default: offsetXMultiplier = 0
        }
        let attributedText: NSAttributedString?
        switch view {
        case let label as UILabel: attributedText = label.attributedText
        case let field as UITextField: attributedText = field.attributedText
        case let text as UITextView: attributedText = text.attributedText
        default: attributedText = nil
        }
        let layoutManager = NSLayoutManager()
        let textContainer = NSTextContainer(size: .zero)
        let textStorage = NSTextStorage(attributedString: attributedText ?? NSAttributedString())
        layoutManager.addTextContainer(textContainer)
        textStorage.addLayoutManager(layoutManager)
        textContainer.lineFragmentPadding = 0
        if let text = view as? UITextView {
            textContainer.lineBreakMode = text.textContainer.lineBreakMode
            textContainer.maximumNumberOfLines = text.textContainer.maximumNumberOfLines
        } else if let label = view as? UILabel {
            textContainer.lineBreakMode = label.lineBreakMode
            textContainer.maximumNumberOfLines = label.numberOfLines
        }
        let labelSize = view.bounds.size
        textContainer.size = labelSize
        let location = tap.location(in: view)
        let box = layoutManager.usedRect(for: textContainer)
        let offset = CGPoint(
            x: (labelSize.width - box.size.width) * offsetXMultiplier - box.origin.x,
            y: (labelSize.height - box.size.height) * 0.5 - box.origin.y)
        let point = CGPoint(x: location.x - offset.x, y: location.y - offset.y)
        guard box.contains(point) else { return }
        let glyphIndex = layoutManager.glyphIndex(for: point, in: textContainer, fractionOfDistanceThroughGlyph: nil)
        let glyphRect = layoutManager.boundingRect(forGlyphRange: NSRange(location: glyphIndex, length: 1), in: textContainer)
        guard glyphRect.contains(point) else { return }
        let character = layoutManager.characterIndexForGlyph(at: glyphIndex)
        let spans = owner.formattedText?.spans ?? []
        for (i, range) in owner.formattedState.spanRanges.enumerated() where range.location <= character && range.location + range.length > character {
            if i < spans.count, spans[i].tappable { spans[i].emit("linkTap", nil) }
            break
        }
    }
}
