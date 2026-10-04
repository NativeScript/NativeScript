import UIKit

/// `Progress` from progress/index.ios: `value` of `maxValue` as a UIProgressView's progress.
open class Progress: View {
    open override class var announcedProperties: Set<String> { ["value"] }
    open override class var cssType: String { "Progress" }

    private var progressView: UIProgressView? { nativeView as? UIProgressView }
    private var requestedValue: Double = 0
    private var value: Double = 0
    private var maxValue: Double = 100

    open override func createNativeView() -> UIView? { UIProgressView() }

    open override func initNativeView() {
        if applied["value"] == nil { applied["value"] = 0.0 }
        if applied["maxValue"] == nil { applied["maxValue"] = 100.0 }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "value":
            requestedValue = Progress.parseInt(value) ?? 0
            coerceValue()
            updateProgress()
        case "maxValue":
            maxValue = Progress.parseInt(value) ?? 100
            coerceValue()
            updateProgress()
        case "color":
            progressView?.progressTintColor = toColor(value)
        case "backgroundColor":
            progressView?.trackTintColor = toColor(value)
            super.setProperty(name, value)
        default:
            super.setProperty(name, value)
        }
    }

    /// `valueProperty.coerce`: at least 0, at most `maxValue`.
    private func coerceValue() {
        let next = requestedValue < 0 ? 0 : min(requestedValue, maxValue)
        if next != value {
            value = next
            emit("valueChange", next)
        }
    }

    private func updateProgress() {
        progressView?.progress = Float(value / maxValue)
    }

    /// The properties' `parseInt` converter applies to strings only.
    private static func parseInt(_ value: Any?) -> Double? {
        guard let string = value as? String else { return toDouble(value) }
        return parseFloat(string).map { $0.rounded(.towardZero) }
    }

    open override func backgroundInternalChanged() {}
}

/// `Placeholder`: a view whose native view only a `creatingView` handler could make; without one it has none.
open class Placeholder: View {}
