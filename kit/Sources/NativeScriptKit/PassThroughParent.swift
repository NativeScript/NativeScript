import UIKit
import ObjectiveC

/// TNSWidgets' `UIView+PassThroughParent`, behind layout-base.ios's
/// `isPassThroughParentEnabled`: a touch that would land on the view itself
/// goes to the views behind it; its subviews still receive theirs.
extension UIView {
    private static var passThroughParentKey: UInt8 = 0

    /// `UIView.hitTest(_:with:)` exchanged with `passThroughHitTest`, once, on first use.
    private static let swizzleHitTest: Void = {
        guard let original = class_getInstanceMethod(UIView.self, #selector(UIView.hitTest(_:with:))),
              let replacement = class_getInstanceMethod(UIView.self, #selector(UIView.passThroughHitTest(_:with:))) else { return }
        method_exchangeImplementations(original, replacement)
    }()

    var passThroughParent: Bool {
        (objc_getAssociatedObject(self, &UIView.passThroughParentKey) as? NSNumber)?.boolValue ?? false
    }

    func setPassThroughParent(_ value: Bool) {
        UIView.swizzleHitTest
        objc_setAssociatedObject(self, &UIView.passThroughParentKey, NSNumber(value: value), .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    }

    /// Runs as `hitTest(_:with:)`; calling itself calls UIKit's.
    @objc private dynamic func passThroughHitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hit = passThroughHitTest(point, with: event)
        return hit === self && passThroughParent ? nil : hit
    }
}
