import UIKit

/// `LiquidGlass` from layouts/liquid-glass (iOS): a GridLayout in a UIVisualEffectView, a clear
/// interactive UIGlassEffect on iOS 26 and later; its children live in a host view inside the effect's content.
open class LiquidGlass: GridLayout {
    open override class var cssType: String { "LiquidGlass" }
    private var contentHost: UIView?

    open override func createNativeView() -> UIView? {
        let effect: UIVisualEffect
        if #available(iOS 26.0, *) {
            let glass = UIGlassEffect(style: .clear)
            glass.isInteractive = true
            effect = glass
        } else {
            effect = UIVisualEffect()
        }
        let effectView = UIVisualEffectView(effect: effect)
        effectView.frame = .zero
        effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        effectView.clipsToBounds = true
        let host = UIView()
        host.frame = effectView.bounds
        host.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        host.isUserInteractionEnabled = true
        effectView.contentView.addSubview(host)
        contentHost = host
        return effectView
    }

    open override var nativeChildHost: UIView? { contentHost }

    /// Measured as though it had no padding or border, as core's does.
    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let borders = (effectiveBorderTopWidth, effectiveBorderRightWidth, effectiveBorderBottomWidth, effectiveBorderLeftWidth)
        paddingSuspended = true
        effectiveBorderTopWidth = 0; effectiveBorderRightWidth = 0; effectiveBorderBottomWidth = 0; effectiveBorderLeftWidth = 0
        defer {
            paddingSuspended = false
            (effectiveBorderTopWidth, effectiveBorderRightWidth, effectiveBorderBottomWidth, effectiveBorderLeftWidth) = borders
        }
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        super.onLayout(0, 0, right - left, bottom - top)
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "iosGlassEffect": applyGlassEffect(value)
        default: super.setProperty(name, value)
        }
    }

    /// `_applyGlassEffect` on the effect view itself: a glass style (`regular`, `clear`) or none, animated.
    private func applyGlassEffect(_ value: Any?) {
        guard let effectView = nativeView as? UIVisualEffectView else { return }
        let config = jsFlat(value) as? JSDynamic
        let variant = config.flatMap { jsFlat($0[jsKey: "variant"]) as? String } ?? (jsFlat(value) as? String)
        let duration = config.flatMap { jsFlat($0[jsKey: "animateChangeDuration"]) as? Double } ?? 0.3
        var effect = UIVisualEffect()
        if #available(iOS 26.0, *), let variant, !["identity", "none"].contains(variant) {
            let glass = UIGlassEffect(style: variant == "regular" ? .regular : .clear)
            if let config {
                glass.isInteractive = jsTruthy(config[jsKey: "interactive"])
                if let tint = config[jsKey: "tint"] { glass.tintColor = (jsFlat(tint) as? String).flatMap { Color($0)?.ios } ?? (jsFlat(tint) as? UIColor) }
            }
            effect = glass
        }
        UIView.animate(withDuration: duration) { effectView.effect = effect }
    }
}
