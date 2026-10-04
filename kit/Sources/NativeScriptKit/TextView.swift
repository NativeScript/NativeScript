import UIKit

/// `NoScrollAnimationUITextView` from text-view/index.ios: the scroll that keeps
/// the caret visible is not animated, since the view grows in the same pass.
final class NoScrollAnimationUITextView: UITextView {
    override func setContentOffset(_ contentOffset: CGPoint, animated: Bool) {
        super.setContentOffset(contentOffset, animated: false)
    }
}

/// `TextView` from text-view/index.ios: a UITextView that shows its hint as
/// its own text, in the hint color, while the text is empty and not focused.
open class TextView: TextBase, UITextViewDelegate {
    open override class var cssType: String { "TextView" }

    private var native: UITextView? { nativeView as? UITextView }
    private var isShowingHint = false
    private var isEditing = false
    private var maxLength = Int.max

    open override func createNativeView() -> UIView? {
        let view = NoScrollAnimationUITextView()
        if view.font == nil { view.font = .systemFont(ofSize: 12) }
        return view
    }

    open override func initNativeView() {
        super.initNativeView()
        native?.delegate = self
        let insets = native?.textContainerInset ?? .zero
        defaultPaddingTop = LayoutHelper.toDevicePixels(insets.top)
        defaultPaddingRight = LayoutHelper.toDevicePixels(insets.right)
        defaultPaddingBottom = LayoutHelper.toDevicePixels(insets.bottom)
        defaultPaddingLeft = LayoutHelper.toDevicePixels(insets.left)
    }

    override var nativeFont: UIFont? {
        get { native?.font }
        set { native?.font = newValue }
    }

    private var hint: String { toText(applied["hint"]) ?? "" }

    open override func setProperty(_ name: String, _ value: Any?) {
        guard let textView = native else { return super.setProperty(name, value) }
        switch name {
        case "text":
            refreshHintState(hint, text)
        case "hint":
            refreshHintState(hint, text)
        case "color", "placeholderColor":
            refreshColor()
        case "editable":
            textView.isEditable = toBool(value) ?? true
        case "maxLength":
            maxLength = Int(toDouble(value) ?? Double(Int.max))
        case "maxLines":
            let lines = Int(toDouble(value) ?? 0)
            maxLines = lines
            textView.textContainer.maximumNumberOfLines = whiteSpace != "nowrap" ? lines : 1
            textView.textContainer.lineBreakMode = lines != 0 ? .byTruncatingTail : .byWordWrapping
            requestLayout()
        case "letterSpacing", "lineHeight", "textDecoration", "textTransform":
            if !isShowingHint { setNativeText(reset: false) }
        case "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth":
            super.setProperty(name, value)
            var inset = textView.textContainerInset
            switch name {
            case "borderTopWidth": inset.top = LayoutHelper.toDeviceIndependentPixels(effectivePaddingTop + effectiveBorderTopWidth)
            case "borderRightWidth": inset.right = LayoutHelper.toDeviceIndependentPixels(effectivePaddingRight + effectiveBorderRightWidth)
            case "borderBottomWidth": inset.bottom = LayoutHelper.toDeviceIndependentPixels(effectivePaddingBottom + effectiveBorderBottomWidth)
            default: inset.left = LayoutHelper.toDeviceIndependentPixels(effectivePaddingLeft + effectiveBorderLeftWidth)
            }
            textView.textContainerInset = inset
        default:
            if !applyTextInputTrait(textView, name, value) { super.setProperty(name, value) }
        }
    }

    /// Each border side sets its own inset in `setProperty`.
    open override func borderWidthChanged() {}

    open override func paddingChanged() {
        native?.textContainerInset = UIEdgeInsets(
            top: LayoutHelper.toDeviceIndependentPixels(effectivePaddingTop + effectiveBorderTopWidth),
            left: LayoutHelper.toDeviceIndependentPixels(effectivePaddingLeft + effectiveBorderLeftWidth),
            bottom: LayoutHelper.toDeviceIndependentPixels(effectivePaddingBottom + effectiveBorderBottomWidth),
            right: LayoutHelper.toDeviceIndependentPixels(effectivePaddingRight + effectiveBorderRightWidth))
    }

    override func adjustLineBreak() {}

    /// `nativeScriptSetTextDecorationAndTransform` for a UITextView: always an
    /// attributed string carrying the view's own font and alignment.
    override func setNativeText(reset: Bool) {
        guard let textView = native else { return }
        UIView.performWithoutAnimation {
            if reset {
                textView.attributedText = nil
                textView.text = nil
                return
            }
            var attributes: [NSAttributedString.Key: Any] = [:]
            let decoration = toText(applied["textDecoration"]) ?? ""
            if decoration.contains("underline") { attributes[.underlineStyle] = NSUnderlineStyle.single.rawValue }
            if decoration.contains("line-through") { attributes[.strikethroughStyle] = NSUnderlineStyle.single.rawValue }
            let letterSpacing = toDouble(applied["letterSpacing"]) ?? 0
            if letterSpacing != 0, let font = textView.font { attributes[.kern] = letterSpacing * Double(font.pointSize) }
            let paragraph = NSMutableParagraphStyle()
            let lineHeight = toDouble(applied["lineHeight"]) ?? 0
            if lineHeight > 0 { paragraph.lineSpacing = CGFloat(lineHeight) }
            paragraph.alignment = textView.textAlignment
            attributes[.paragraphStyle] = paragraph
            if let font = textView.font { attributes[.font] = font }
            textView.attributedText = NSAttributedString(string: transformedText, attributes: attributes)
            if applied["color"] == nil { textView.textColor = .label }
        }
    }

    private var transformedText: String {
        switch toText(applied["textTransform"]) {
        case "uppercase": return (text as NSString).localizedUppercase
        case "lowercase": return (text as NSString).localizedLowercase
        case "capitalize": return (text as NSString).localizedCapitalized
        default: return text
        }
    }

    override func setColor(_ color: UIColor?) { refreshColor() }

    override func setTextAlignment(_ value: String) {
        switch value {
        case "left": native?.textAlignment = .left
        case "center": native?.textAlignment = .center
        case "right": native?.textAlignment = .right
        case "justify": native?.textAlignment = .justified
        default: native?.textAlignment = .natural
        }
    }

    private func refreshHintState(_ hint: String, _ text: String) {
        if !text.isEmpty {
            showText()
        } else if !isEditing && !hint.isEmpty {
            showHint(hint)
        } else {
            isShowingHint = false
            native?.text = ""
        }
    }

    private func refreshColor() {
        guard let textView = native else { return }
        let color = toColor(applied["color"])
        if isShowingHint {
            if let placeholder = toColor(applied["placeholderColor"]) {
                textView.textColor = placeholder
            } else if let color {
                textView.textColor = color.withAlphaComponent(0.22)
            } else {
                textView.textColor = .placeholderText
            }
        } else {
            textView.textColor = color ?? .label
            textView.tintColor = color ?? .label
        }
    }

    private func showHint(_ hint: String) {
        isShowingHint = true
        refreshColor()
        native?.text = hint
    }

    private func showText() {
        isShowingHint = false
        setNativeText(reset: false)
        refreshColor()
        requestLayout()
    }

    // MARK: UITextViewDelegate

    public func textViewShouldBeginEditing(_ textView: UITextView) -> Bool {
        if isShowingHint { showText() }
        return toBool(applied["editable"]) ?? true
    }

    public func textViewDidBeginEditing(_ textView: UITextView) {
        isEditing = true
        emit("focus", nil)
    }

    public func textViewDidEndEditing(_ textView: UITextView) {
        if toText(applied["updateTextTrigger"]) == "focusLost" { nativeValueChange("text", textView.text ?? "") }
        isEditing = false
        textView.resignFirstResponder()
        emit("blur", nil)
        refreshHintState(hint, textView.text ?? "")
    }

    public func textViewDidChange(_ textView: UITextView) {
        if toText(applied["updateTextTrigger"]) ?? "textChanged" == "textChanged" { nativeValueChange("text", textView.text ?? "") }
        requestLayout()
    }

    public func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        let delta = text.utf16.count - range.length
        if delta > 0 && (textView.text ?? "").utf16.count + delta > maxLength { return false }
        if text == "\n" { emit("returnPress", nil) }
        return true
    }
}

/// The keyboard properties of editable-text-base/index.ios, for UITextField and UITextView.
func applyTextInputTrait(_ view: UIView, _ name: String, _ value: Any?) -> Bool {
    func set<T>(_ keyPath: ReferenceWritableKeyPath<UITextField, T>, _ textViewKeyPath: ReferenceWritableKeyPath<UITextView, T>, _ v: T) {
        if let field = view as? UITextField { field[keyPath: keyPath] = v }
        if let textView = view as? UITextView { textView[keyPath: textViewKeyPath] = v }
    }
    let string = toText(value) ?? ""
    switch name {
    case "keyboardType":
        let type: UIKeyboardType
        switch string {
        case "datetime", "number": type = .numbersAndPunctuation
        case "phone": type = .phonePad
        case "decimal": type = .decimalPad
        case "url": type = .URL
        case "email": type = .emailAddress
        case "integer": type = .numberPad
        default: type = Int(string).flatMap(UIKeyboardType.init(rawValue:)) ?? .default
        }
        set(\.keyboardType, \.keyboardType, type)
    case "returnKeyType":
        let type: UIReturnKeyType
        switch string {
        case "done": type = .done
        case "go": type = .go
        case "next": type = .next
        case "search": type = .search
        case "send": type = .send
        default: type = Int(string).flatMap(UIReturnKeyType.init(rawValue:)) ?? .default
        }
        set(\.returnKeyType, \.returnKeyType, type)
    case "autocapitalizationType":
        let type: UITextAutocapitalizationType
        switch string {
        case "none": type = .none
        case "words": type = .words
        case "allcharacters": type = .allCharacters
        default: type = .sentences
        }
        set(\.autocapitalizationType, \.autocapitalizationType, type)
    case "autocorrect":
        let on = toBool(value)
        set(\.autocorrectionType, \.autocorrectionType, on.map { $0 ? .yes : .no } ?? .default)
        set(\.spellCheckingType, \.spellCheckingType, on.map { $0 ? .yes : .no } ?? .default)
    case "updateTextTrigger":
        break
    default:
        return false
    }
    return true
}
