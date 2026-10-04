import UIKit

// Value-carrying controls announce `<property>Change` whenever the value
// changes, from the user or from code, and never when it is set to what it
// already is: NativeScript's property system, which keeps two-way bindings
// from looping.

/// `Switch` from switch/index.ios.
open class Switch: View {
    open override class var announcedProperties: Set<String> { ["checked"] }
    open override class var cssType: String { "Switch" }

    private var control: UISwitch? { nativeView as? UISwitch }
    private var checked = false

    open override func createNativeView() -> UIView? { UISwitch() }

    open override func initNativeView() {
        if applied["checked"] == nil { applied["checked"] = false }
        control?.addTarget(self, action: #selector(valueChanged), for: .valueChanged)
    }

    @objc private func valueChanged(_ sender: UISwitch) {
        checked = sender.isOn
        nativeValueChange("checked", sender.isOn)
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "checked":
            let next = toBool(value) ?? false
            let old = checked
            checked = next
            control?.isOn = next
            if old != next { emit("checkedChange", next) }
        case "color":
            let color = toColor(value)
            control?.thumbTintColor = color
            if let color, let thumb = control?.subviews.first {
                var alpha: CGFloat = 1
                thumb.alpha = color.getRed(nil, green: nil, blue: nil, alpha: &alpha) ? alpha : 1
            }
        case "backgroundColor":
            setNativeBackgroundColor(toColor(value))
            super.setProperty(name, value)
        default:
            super.setProperty(name, value)
        }
    }

    private func setNativeBackgroundColor(_ color: UIColor?) {
        guard let control else { return }
        control.onTintColor = color
        control.tintColor = color
        control.backgroundColor = color
        if color != nil {
            // Since iOS 16 the control no longer clips its track-shaped background.
            control.clipsToBounds = true
            control.layer.masksToBounds = true
            let height = control.bounds.height > 0 ? control.bounds.height : control.frame.height
            if height > 0 {
                control.layer.cornerRadius = height / 2
            } else {
                DispatchQueue.main.async { [weak control] in
                    guard let control, control.bounds.height > 0 else { return }
                    control.layer.cornerRadius = control.bounds.height / 2
                }
            }
        } else {
            control.layer.cornerRadius = 0
            control.clipsToBounds = false
            control.layer.masksToBounds = false
        }
    }

    /// The track color is the background; the view's own background is not drawn.
    open override func backgroundInternalChanged() {}
}

/// `TNSSlider` from slider/index.ios.
final class TNSSlider: UISlider {}

/// `Slider` from slider/index.ios and slider-common.
open class Slider: View {
    open override class var announcedProperties: Set<String> { ["value"] }
    open override class var cssType: String { "Slider" }

    private var slider: UISlider? { nativeView as? UISlider }
    private var requestedValue: Double = 0
    private var value: Double = 0
    private var minValue: Double = 0
    private var maxValue: Double = 100

    open override func createNativeView() -> UIView? { TNSSlider() }

    open override func initNativeView() {
        if applied["value"] == nil { applied["value"] = 0.0 }
        slider?.minimumValue = 0
        slider?.maximumValue = Float(maxValue)
        slider?.addTarget(self, action: #selector(valueChanged), for: .valueChanged)
    }

    @objc private func valueChanged(_ sender: UISlider) {
        value = Double(sender.value)
        requestedValue = value
        nativeValueChange("value", value)
    }

    /// `valueProperty.coerce`: the value stays within [minValue, maxValue].
    private func coerceValue() {
        let next = min(max(requestedValue, minValue), maxValue)
        let old = value
        value = next
        slider?.value = Float(next)
        if old != next { emit("valueChange", next) }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "value":
            requestedValue = toDouble(value) ?? 0
            coerceValue()
        case "minValue":
            minValue = toDouble(value) ?? 0
            slider?.minimumValue = Float(minValue)
            if maxValue < minValue {
                maxValue = minValue
                slider?.maximumValue = Float(maxValue)
            }
            coerceValue()
        case "maxValue":
            maxValue = max(toDouble(value) ?? 100, minValue)
            slider?.maximumValue = Float(maxValue)
            coerceValue()
        case "color":
            slider?.thumbTintColor = toColor(value)
        case "backgroundColor":
            slider?.minimumTrackTintColor = toColor(value)
            super.setProperty(name, value)
        default:
            super.setProperty(name, value)
        }
    }

    open override func backgroundInternalChanged() {}
}

/// `SegmentedBarItem`: a title, not a view of its own.
open class SegmentedBarItem: View {
    open override class var cssType: String { "SegmentedBarItem" }

    var title = ""

    open override func setProperty(_ name: String, _ value: Any?) {
        if name == "title" {
            let next = toText(value) ?? ""
            guard next != title else { return }
            title = next
            (parent as? SegmentedBar)?.updateTitle(of: self)
        } else {
            super.setProperty(name, value)
        }
    }
}

/// `SegmentedBar` from segmented-bar/index.ios.
open class SegmentedBar: View {
    open override class var announcedProperties: Set<String> { ["selectedIndex"] }
    open override class var cssType: String { "SegmentedBar" }

    private var control: UISegmentedControl? { nativeView as? UISegmentedControl }
    private var items: [SegmentedBarItem] = []
    private var requestedIndex: Double = -1
    private var selectedIndex: Double = -1

    open override func createNativeView() -> UIView? { UISegmentedControl() }

    open override func initNativeView() {
        if applied["selectedIndex"] == nil { applied["selectedIndex"] = -1.0 }
        control?.addTarget(self, action: #selector(selected), for: .valueChanged)
    }

    @objc private func selected(_ sender: UISegmentedControl) {
        set("selectedIndex", Double(sender.selectedSegmentIndex))
        setSelectedTextColor()
    }

    open override func addChild(_ child: View) {
        guard let item = child as? SegmentedBarItem else { return }
        items.append(item)
        addView(item)
        setNativeItems()
    }

    open override func eachChildView(_ body: (View) -> Void) {
        for item in items { body(item) }
    }

    func updateTitle(of item: SegmentedBarItem) {
        guard let index = items.firstIndex(where: { $0 === item }) else { return }
        control?.setTitle(item.title, forSegmentAt: index)
    }

    private func setNativeItems() {
        guard let control else { return }
        control.removeAllSegments()
        for (index, item) in items.enumerated() {
            control.insertSegment(withTitle: item.title, at: index, animated: false)
        }
        coerceSelectedIndex()
        requestLayout()
    }

    /// `selectedIndexProperty`'s coercion: -1 without items, otherwise clamped to them.
    private func coerceSelectedIndex() {
        var next = requestedIndex
        if items.isEmpty {
            next = -1
        } else {
            next = min(max(next, 0), Double(items.count - 1))
        }
        let old = selectedIndex
        selectedIndex = next
        control?.selectedSegmentIndex = Int(next)
        if old != next { emit("selectedIndexChange", next) }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "selectedIndex":
            requestedIndex = (toDouble(value) ?? -1).rounded(.towardZero)
            coerceSelectedIndex()
        case "color":
            guard let control else { return }
            var attributes = control.titleTextAttributes(for: .normal) ?? [:]
            attributes[.foregroundColor] = toColor(value)
            control.setTitleTextAttributes(attributes, for: .normal)
            setSelectedTextColor()
        case "selectedBackgroundColor":
            control?.selectedSegmentTintColor = toColor(value)
            setSelectedTextColor()
        case "selectedTextColor":
            setSelectedTextColor()
        case "fontSize", "fontWeight", "fontStyle", "fontFamily":
            guard let control else { return }
            var font = Font()
            font.size = toDouble(applied["fontSize"])
            font.weight = (applied["fontWeight"] as? String) ?? "normal"
            font.style = (applied["fontStyle"] as? String) ?? "normal"
            font.family = applied["fontFamily"] as? String
            var attributes = control.titleTextAttributes(for: .normal) ?? [:]
            attributes[.font] = font.isDefault ? nil : font.uiFont(default: .systemFont(ofSize: UIFont.labelFontSize))
            control.setTitleTextAttributes(attributes, for: .normal)
            requestLayout()
        default:
            super.setProperty(name, value)
        }
    }

    private func setSelectedTextColor() {
        guard let control else { return }
        let color = toColor(applied["selectedTextColor"]) ?? toColor(applied["color"]) ?? Color("#000000")?.ios
        var attributes = control.titleTextAttributes(for: .selected) ?? [:]
        attributes[.foregroundColor] = color
        control.setTitleTextAttributes(attributes, for: .selected)
    }
}

/// `Image` from image/index.ios: `sys://` names are SF Symbols, `res://` asset
/// catalog images, anything else a file path.
open class Image: View {
    open override class var cssType: String { "Image" }

    private var imageView: UIImageView? { nativeView as? UIImageView }
    private var imageSource: UIImage?
    private var stretch = "aspectFit"
    private var imageSourceAffectsLayout = true
    private var templateImageWasCreated = false

    open override func createNativeView() -> UIView? {
        let view = UIImageView()
        view.contentMode = .scaleAspectFit
        view.isUserInteractionEnabled = true
        return view
    }

    open override func initNativeView() { setNativeClipToBounds() }

    open override func setNativeClipToBounds() { nativeView?.clipsToBounds = true }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "src", "iosSymbolScale":
            let src = toText(applied["src"])
            let scale = toText(applied["iosSymbolScale"])
            if let scale, !scale.isEmpty, let src, src.hasPrefix("sys://") {
                imageSource = UIImage(systemName: String(src.dropFirst(6)), withConfiguration: symbolConfiguration(scale))
            } else {
                imageSource = Image.load(src)
            }
            setNativeImage(imageSource)
            // `_setSrc`: a symbol drawn at its configured scale is centered, not stretched.
            if let scale, !scale.isEmpty { imageView?.contentMode = .center }
        case "tintColor":
            setTintColor(toColor(value))
        case "stretch":
            stretch = (value as? String) ?? "aspectFit"
            switch stretch {
            case "aspectFit": imageView?.contentMode = .scaleAspectFit
            case "aspectFill": imageView?.contentMode = .scaleAspectFill
            case "fill": imageView?.contentMode = .scaleToFill
            default: imageView?.contentMode = .topLeft
            }
            requestLayout()
        default:
            super.setProperty(name, value)
        }
    }

    /// `ImageSource.systemImageWithConfig`: the symbol at the view's font size and weight when it has one, at `iosSymbolScale`.
    private func symbolConfiguration(_ scale: String) -> UIImage.SymbolConfiguration {
        let symbolScale: UIImage.SymbolScale = scale == "small" ? .small : scale == "medium" ? .medium : scale == "large" ? .large : .default
        if let size = toDouble(applied["fontSize"]), size > 0 {
            let weight: UIImage.SymbolWeight = toText(applied["fontWeight"]) == "bold" ? .bold : .regular
            return UIImage.SymbolConfiguration(pointSize: size, weight: weight, scale: symbolScale)
        }
        return UIImage.SymbolConfiguration(scale: symbolScale)
    }

    private static func load(_ src: String?) -> UIImage? {
        guard let src, !src.isEmpty else { return nil }
        if src.hasPrefix("sys://") { return UIImage(systemName: String(src.dropFirst(6))) }
        if src.hasPrefix("res://") { return UIImage(named: String(src.dropFirst(6))) }
        let path = src.hasPrefix("~/") ? Bundle.main.bundlePath + "/app/" + src.dropFirst(2) : src
        return UIImage(contentsOfFile: path)
    }

    private func setNativeImage(_ image: UIImage?) {
        imageView?.image = image
        templateImageWasCreated = false
        setTintColor(toColor(applied["tintColor"]))
        if imageSourceAffectsLayout { requestLayout() }
    }

    private func setTintColor(_ color: UIColor?) {
        guard let imageView else { return }
        if color != nil, let image = imageView.image, !templateImageWasCreated {
            imageView.image = image.withRenderingMode(.alwaysTemplate)
            templateImageWasCreated = true
        } else if color == nil, let image = imageView.image, templateImageWasCreated {
            templateImageWasCreated = false
            imageView.image = image.withRenderingMode(.automatic)
        }
        imageView.tintColor = color
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let nativeWidth = imageSource.map { LayoutHelper.toDevicePixels($0.size.width) } ?? 0
        let nativeHeight = imageSource.map { LayoutHelper.toDevicePixels($0.size.height) } ?? 0
        var measureWidth = max(nativeWidth, effectiveMinWidth)
        var measureHeight = max(nativeHeight, effectiveMinHeight)
        let finiteWidth = widthMode != LayoutHelper.unspecified
        let finiteHeight = heightMode != LayoutHelper.unspecified
        imageSourceAffectsLayout = widthMode != LayoutHelper.exactly || heightMode != LayoutHelper.exactly
        if nativeWidth != 0 && nativeHeight != 0 && (finiteWidth || finiteHeight) {
            let scale = Image.computeScaleFactor(Double(width), Double(height), finiteWidth, finiteHeight, nativeWidth, nativeHeight, stretch)
            let resultW = jsRound(nativeWidth * scale.width)
            let resultH = jsRound(nativeHeight * scale.height)
            measureWidth = finiteWidth ? min(resultW, Double(width)) : resultW
            measureHeight = finiteHeight ? min(resultH, Double(height)) : resultH
        }
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    static func computeScaleFactor(_ measureWidth: Double, _ measureHeight: Double, _ widthIsFinite: Bool, _ heightIsFinite: Bool,
                                   _ nativeWidth: Double, _ nativeHeight: Double, _ stretch: String) -> (width: Double, height: Double) {
        var scaleW: Double = 1
        var scaleH: Double = 1
        if ["aspectFill", "aspectFit", "fill"].contains(stretch) && (widthIsFinite || heightIsFinite) {
            scaleW = nativeWidth > 0 ? measureWidth / nativeWidth : 0
            scaleH = nativeHeight > 0 ? measureHeight / nativeHeight : 0
            if !widthIsFinite {
                scaleW = scaleH
            } else if !heightIsFinite {
                scaleH = scaleW
            } else if stretch == "aspectFit" {
                scaleH = min(scaleW, scaleH)
                scaleW = scaleH
            } else if stretch == "aspectFill" {
                scaleH = max(scaleW, scaleH)
                scaleW = scaleH
            }
        }
        return (scaleW, scaleH)
    }
}

/// `ActivityIndicator` from activity-indicator/index.ios.
open class ActivityIndicator: View {
    open override class var cssType: String { "ActivityIndicator" }

    private var indicator: UIActivityIndicatorView? { nativeView as? UIActivityIndicatorView }

    open override func createNativeView() -> UIView? {
        let view = UIActivityIndicatorView(style: .medium)
        view.hidesWhenStopped = true
        return view
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "busy":
            if toBool(value) ?? false { indicator?.startAnimating() } else { indicator?.stopAnimating() }
        case "color":
            indicator?.color = toColor(value)
        default:
            super.setProperty(name, value)
        }
    }
}
