import UIKit

// The hand port's names for the modules generated from core (Core/): each
// adapter goes with the last hand-ported file that calls it.

/// `layout` from utils/layout-helper with the hand port's integer measure specs.
/// Specs are JavaScript's int32 values, so `atMost` is negative.
enum LayoutHelper {
    static let unspecified = Int(layout.UNSPECIFIED)
    static let exactly = Int(layout.EXACTLY)
    static let atMost = Int(layout.AT_MOST)
    static let measuredStateTooSmall = Int(layout.MEASURED_STATE_TOO_SMALL)
    static let measuredStateMask = Int(layout.MEASURED_STATE_MASK)
    static let measuredSizeMask = Int(layout.MEASURED_SIZE_MASK)

    static var scale: CGFloat { CGFloat(try! layout.getDisplayDensity()) }

    static func mode(_ spec: Int) -> Int { Int(layout.getMeasureSpecMode(Double(spec))) }
    static func size(_ spec: Int) -> Int { Int(layout.getMeasureSpecSize(Double(spec))) }
    static func makeMeasureSpec(_ size: Double, _ mode: Int) -> Int { Int(layout.makeMeasureSpec(size, Double(mode))) }
    static func toDevicePixels(_ value: Double) -> Double { try! layout.toDevicePixels(value) }
    static func toDeviceIndependentPixels(_ value: Double) -> Double { try! layout.toDeviceIndependentPixels(value) }
    static func round(_ value: Double) -> Double { layout.round(value) }

    static func measureNativeView(_ view: UIView, _ width: Int, _ widthMode: Int, _ height: Int, _ heightMode: Int) -> CGSize {
        try! layout.measureNativeView(view, Double(width), Double(widthMode), Double(height), Double(heightMode)) as! CGSize
    }
}

extension Color {
    /// A color from CSS text; nil where core's constructor throws.
    static func parse(_ value: String) -> Color? { try? Color(JSArray<Any?>([value])) }

    /// `new Color(text)` in translated code: an invalid color is transparent black, as the hand port made it.
    public static func fromJS(_ value: String) -> Color { parse(value) ?? (try! Color(JSArray<Any?>([0.0]))) }

    var uiColor: UIColor { ios as! UIColor }
}
