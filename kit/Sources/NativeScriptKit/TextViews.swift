import UIKit

/// `TextBase` from text-base/index.ios: text, font, color and alignment for
/// Label, Button and TextField.
open class TextBase: View {
    private var font = Font()
    private var defaultFont: UIFont?

    /// The view whose text, font and color the properties set.
    var textView: UIView? { nativeView }

    var whiteSpace = "initial"
    var maxLines = 0

    open override func initNativeView() {
        // `text` defaults to "": setting it to "" is not a change.
        applied["text"] = ""
        defaultFont = nativeFont
    }

    var nativeFont: UIFont? {
        get {
            switch textView {
            case let button as UIButton: return button.titleLabel?.font
            case let label as UILabel: return label.font
            case let field as UITextField: return field.font
            default: return nil
            }
        }
        set {
            switch textView {
            case let button as UIButton: button.titleLabel?.font = newValue
            case let label as UILabel: label.font = newValue
            case let field as UITextField: field.font = newValue
            default: break
            }
        }
    }

    var text: String { toText(applied["text"]) ?? "" }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "text":
            setNativeText(reset: value == nil)
            requestLayoutOnTextChanged()
        case "color":
            setColor(toColor(value))
        case "fontSize":
            font.size = toDouble(value)
            fontChanged()
        case "fontWeight":
            font.weight = (value as? String).map(normalizedWeight) ?? toDouble(value).map { js($0) } ?? "normal"
            fontChanged()
        case "fontStyle":
            font.style = (value as? String) ?? "normal"
            fontChanged()
        case "fontFamily":
            font.family = value as? String
            fontChanged()
        case "textAlignment":
            setTextAlignment((value as? String) ?? "initial")
        case "textWrap":
            setProperty("whiteSpace", (toBool(value) ?? false) ? "normal" : "nowrap")
        case "whiteSpace":
            whiteSpace = (value as? String) ?? "initial"
            adjustLineBreak()
            requestLayout()
        case "maxLines":
            maxLines = Int(toDouble(value) ?? 0)
            adjustLineBreak()
            requestLayout()
        default:
            super.setProperty(name, value)
        }
    }

    private func normalizedWeight(_ value: String) -> String {
        let v = value.trimmingCharacters(in: .whitespaces).lowercased()
        return v == "400" ? "normal" : v
    }

    var textWrap: Bool { whiteSpace == "normal" }

    /// `fontInternalProperty.setNative`: the default font when nothing is styled.
    private func fontChanged() {
        if font.isDefault {
            nativeFont = defaultFont
        } else {
            nativeFont = font.uiFont(default: nativeFont)
        }
        requestLayout()
    }

    func requestLayoutOnTextChanged() { requestLayout() }

    /// `_setNativeText` with `nativeScriptSetTextDecorationAndTransform`: plain text, no attributes.
    func setNativeText(reset: Bool) {
        UIView.performWithoutAnimation {
            let value = reset ? nil : text
            switch textView {
            case let button as UIButton:
                button.setAttributedTitle(nil, for: .normal)
                button.setTitle(value, for: .normal)
            case let label as UILabel:
                label.attributedText = nil
                label.text = value
            case let field as UITextField:
                field.attributedText = nil
                field.text = value
            default:
                break
            }
            if !reset && applied["color"] == nil { setColor(.label) }
        }
    }

    func setColor(_ color: UIColor?) {
        switch textView {
        case let button as UIButton:
            button.setTitleColor(color, for: .normal)
            button.titleLabel?.textColor = color
        case let label as UILabel:
            label.textColor = color
        case let field as UITextField:
            field.textColor = color
        default:
            break
        }
    }

    func setTextAlignment(_ value: String) {
        let alignment: NSTextAlignment
        switch value {
        case "left": alignment = .left
        case "center": alignment = .center
        case "right": alignment = .right
        case "justify": alignment = .justified
        default: alignment = .natural
        }
        switch textView {
        case let label as UILabel: label.textAlignment = alignment
        case let field as UITextField: field.textAlignment = alignment
        default: break
        }
    }

    func adjustLineBreak() {}
}

/// `TNSLabel` from TNSWidgets: padding and border widths inset the text.
final class TNSLabel: UILabel {
    var padding = UIEdgeInsets.zero
    var borderThickness = UIEdgeInsets.zero

    override func textRect(forBounds bounds: CGRect, limitedToNumberOfLines numberOfLines: Int) -> CGRect {
        guard let text, !text.isEmpty else { return super.textRect(forBounds: bounds, limitedToNumberOfLines: numberOfLines) }
        let insets = UIEdgeInsets(
            top: borderThickness.top + padding.top, left: borderThickness.left + padding.left,
            bottom: borderThickness.bottom + padding.bottom, right: borderThickness.right + padding.right)
        let rect = super.textRect(forBounds: bounds.inset(by: insets), limitedToNumberOfLines: numberOfLines)
        return rect.inset(by: UIEdgeInsets(top: -insets.top, left: -insets.left, bottom: -insets.bottom, right: -insets.right))
    }

    override func drawText(in rect: CGRect) {
        super.drawText(in: rect.inset(by: borderThickness).inset(by: padding))
    }
}

/// `Label` from label/index.ios.
open class Label: TextBase {
    open override class var cssType: String { "Label" }

    private enum FixedSize { static let none = 0, width = 1, height = 2, both = 3 }
    private var fixedSize = FixedSize.none

    private var label: TNSLabel? { nativeView as? TNSLabel }

    open override func createNativeView() -> UIView? {
        let view = TNSLabel()
        view.isUserInteractionEnabled = true
        return view
    }

    override func requestLayoutOnTextChanged() {
        if fixedSize == FixedSize.both { return }
        if fixedSize == FixedSize.width && !textWrap && measuredHeight > 0 { return }
        super.requestLayoutOnTextChanged()
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        guard let label else { return }
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        fixedSize = (widthMode == LayoutHelper.exactly ? FixedSize.width : FixedSize.none) | (heightMode == LayoutHelper.exactly ? FixedSize.height : FixedSize.none)
        let nativeSize: CGSize
        if textWrap {
            // UILabel.sizeThatFits is unreliable for wrapped text; NativeScript measures with textRect instead.
            let rect = label.textRect(forBounds: CGRect(
                x: 0, y: 0,
                width: widthMode == LayoutHelper.unspecified ? .infinity : LayoutHelper.toDeviceIndependentPixels(Double(width)),
                height: heightMode == LayoutHelper.unspecified ? .infinity : LayoutHelper.toDeviceIndependentPixels(Double(height))),
                limitedToNumberOfLines: label.numberOfLines)
            nativeSize = CGSize(width: LayoutHelper.round(LayoutHelper.toDevicePixels(rect.size.width)), height: LayoutHelper.round(LayoutHelper.toDevicePixels(rect.size.height)))
        } else {
            nativeSize = LayoutHelper.measureNativeView(label, width, widthMode, height, heightMode)
        }
        var labelWidth = Double(nativeSize.width)
        if textWrap && widthMode == LayoutHelper.atMost { labelWidth = min(labelWidth, Double(width)) }
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(max(labelWidth, effectiveMinWidth), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(max(Double(nativeSize.height), effectiveMinHeight), height, heightMode, 0))
    }

    override func adjustLineBreak() {
        guard let label else { return }
        switch whiteSpace {
        case "wrap", "normal":
            label.lineBreakMode = .byWordWrapping
            label.numberOfLines = maxLines
        case "nowrap":
            label.lineBreakMode = .byTruncatingTail
            label.numberOfLines = 1
        default:
            label.lineBreakMode = .byTruncatingTail
            label.numberOfLines = 1
        }
    }

    /// Labels paint their background on the layer, and stay `invalid` so every layout repaints it.
    open override func redrawNativeBackground() {
        if let label {
            createBackgroundUIColor { label.layer.backgroundColor = $0?.cgColor }
        }
        setNativeClipToBounds()
    }

    open override func paddingChanged() {
        label?.padding = UIEdgeInsets(
            top: LayoutHelper.toDeviceIndependentPixels(effectivePaddingTop), left: LayoutHelper.toDeviceIndependentPixels(effectivePaddingLeft),
            bottom: LayoutHelper.toDeviceIndependentPixels(effectivePaddingBottom), right: LayoutHelper.toDeviceIndependentPixels(effectivePaddingRight))
    }

    open override func borderWidthChanged() {
        label?.borderThickness = UIEdgeInsets(
            top: LayoutHelper.toDeviceIndependentPixels(effectiveBorderTopWidth), left: LayoutHelper.toDeviceIndependentPixels(effectiveBorderLeftWidth),
            bottom: LayoutHelper.toDeviceIndependentPixels(effectiveBorderBottomWidth), right: LayoutHelper.toDeviceIndependentPixels(effectiveBorderRightWidth))
    }
}

/// `Button` from button/index.ios: a system UIButton whose padding and
/// border widths become contentEdgeInsets.
open class Button: TextBase {
    open override class var cssType: String { "Button" }

    private var button: UIButton? { nativeView as? UIButton }

    open override func createNativeView() -> UIView? {
        let button = UIButton(type: .system)
        button.titleLabel?.textAlignment = .center
        return button
    }

    open override func initNativeView() {
        super.initNativeView()
        button?.addTarget(self, action: #selector(tapped), for: .touchUpInside)
        let insets = button?.contentEdgeInsets ?? .zero
        defaultPaddingTop = LayoutHelper.toDevicePixels(insets.top)
        defaultPaddingRight = LayoutHelper.toDevicePixels(insets.right)
        defaultPaddingBottom = LayoutHelper.toDevicePixels(insets.bottom)
        defaultPaddingLeft = LayoutHelper.toDevicePixels(insets.left)
    }

    /// Button taps come from touchUpInside, not a gesture recognizer.
    open override func observeTap() {}

    @objc private func tapped() { emit("tap", nil) }

    open override func paddingChanged() { updateContentEdgeInsets() }
    open override func borderWidthChanged() { updateContentEdgeInsets() }

    private func updateContentEdgeInsets() {
        button?.contentEdgeInsets = UIEdgeInsets(
            top: LayoutHelper.toDeviceIndependentPixels(effectivePaddingTop + effectiveBorderTopWidth),
            left: LayoutHelper.toDeviceIndependentPixels(effectivePaddingLeft + effectiveBorderLeftWidth),
            bottom: LayoutHelper.toDeviceIndependentPixels(effectivePaddingBottom + effectiveBorderBottomWidth),
            right: LayoutHelper.toDeviceIndependentPixels(effectivePaddingRight + effectiveBorderRightWidth))
    }

    override func setTextAlignment(_ value: String) {
        guard let button else { return }
        switch value {
        case "left":
            button.titleLabel?.textAlignment = .left
            button.contentHorizontalAlignment = .left
        case "right":
            button.titleLabel?.textAlignment = .right
            button.contentHorizontalAlignment = .right
        case "justify":
            button.titleLabel?.textAlignment = .justified
            button.contentHorizontalAlignment = .center
        default:
            button.titleLabel?.textAlignment = .center
            button.contentHorizontalAlignment = .center
        }
    }

    override func adjustLineBreak() {
        guard let titleLabel = button?.titleLabel else { return }
        switch whiteSpace {
        case "wrap", "normal":
            titleLabel.lineBreakMode = .byWordWrapping
            titleLabel.numberOfLines = maxLines
        default:
            titleLabel.lineBreakMode = .byTruncatingMiddle
            titleLabel.numberOfLines = 1
        }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        guard textWrap, let button, let titleLabel = button.titleLabel else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }
        // UIButton.sizeThatFits ignores wrapping, so NativeScript measures the title label plus padding.
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let horizontalPadding = effectivePaddingLeft + effectiveBorderLeftWidth + effectivePaddingRight + effectiveBorderRightWidth
        var verticalPadding = effectivePaddingTop + effectiveBorderTopWidth + effectivePaddingBottom + effectiveBorderBottomWidth
        if verticalPadding == 0 { verticalPadding = LayoutHelper.toDevicePixels(12) }
        let desired = LayoutHelper.measureNativeView(titleLabel, width - Int(horizontalPadding), widthMode, height - Int(verticalPadding), heightMode)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(max(Double(desired.width) + horizontalPadding, effectiveMinWidth), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(max(Double(desired.height) + verticalPadding, effectiveMinHeight), height, heightMode, 0))
    }
}

/// `UITextFieldImpl` from text-field/index.ios: padding and borders inset the text.
final class TextFieldImpl: UITextField {
    weak var owner: TextField?

    private func insetRect(_ bounds: CGRect) -> CGRect {
        guard let owner else { return bounds }
        let x = LayoutHelper.toDeviceIndependentPixels(owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft)
        let y = LayoutHelper.toDeviceIndependentPixels(owner.effectiveBorderTopWidth + owner.effectivePaddingTop)
        let width = LayoutHelper.toDeviceIndependentPixels(LayoutHelper.toDevicePixels(bounds.size.width)
            - (owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft + owner.effectivePaddingRight + owner.effectiveBorderRightWidth))
        let height = LayoutHelper.toDeviceIndependentPixels(LayoutHelper.toDevicePixels(bounds.size.height)
            - (owner.effectiveBorderTopWidth + owner.effectivePaddingTop + owner.effectivePaddingBottom + owner.effectiveBorderBottomWidth))
        return CGRect(x: x, y: y, width: width, height: height)
    }

    override func textRect(forBounds bounds: CGRect) -> CGRect { insetRect(bounds) }
    override func editingRect(forBounds bounds: CGRect) -> CGRect { insetRect(bounds) }
}

/// `TextField` from text-field/index.ios.
open class TextField: TextBase, UITextFieldDelegate {
    open override class var cssType: String { "TextField" }

    private var field: TextFieldImpl? { nativeView as? TextFieldImpl }
    var hint: String?
    var maxLength = Int.max

    open override func createNativeView() -> UIView? { TextFieldImpl() }

    open override func initNativeView() {
        super.initNativeView()
        field?.owner = self
        field?.delegate = self
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "hint":
            hint = toText(value)
            updateAttributedPlaceholder()
        case "placeholderColor":
            updateAttributedPlaceholder()
        case "secure":
            field?.isSecureTextEntry = toBool(value) ?? false
        case "maxLength":
            maxLength = Int(toDouble(value) ?? Double(Int.max))
        case "color":
            // A TextField's color is also its caret's.
            let color = toColor(value)
            field?.textColor = color
            field?.tintColor = color
        default:
            super.setProperty(name, value)
        }
    }

    private func updateAttributedPlaceholder() {
        var string = hint ?? ""
        // An empty placeholder string gives no attributedPlaceholder at all.
        if string.isEmpty { string = " " }
        var attributes: [NSAttributedString.Key: Any] = [:]
        if let color = toColor(applied["placeholderColor"]) { attributes[.foregroundColor] = color }
        field?.attributedPlaceholder = NSAttributedString(string: string, attributes: attributes)
    }

    /// Padding is applied by TextFieldImpl's text rects.
    open override func paddingChanged() {}

    public func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
        let current = textField.text ?? ""
        let delta = string.utf16.count - range.length
        if delta > 0 && current.utf16.count + delta > maxLength { return false }
        if range.location <= current.utf16.count {
            let next = (current as NSString).replacingCharacters(in: range, with: string)
            nativeValueChange("text", next)
        }
        if case .auto = styleWidth { requestLayout() }
        return true
    }

    public func textFieldShouldClear(_ textField: UITextField) -> Bool {
        nativeValueChange("text", "")
        return true
    }

    public func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        emit("returnPress", nil)
        return true
    }
}
