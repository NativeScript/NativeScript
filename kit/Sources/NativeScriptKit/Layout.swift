import UIKit

// @nativescript/core's measure/layout arithmetic (utils/layout-helper and
// ui/core/view/view-helper). Everything is in device pixels, as NativeScript
// measures, and rounded where NativeScript rounds, so frames land on the
// same pixels.

/// `layout` from utils/layout-helper: Android-style measure specs.
public enum LayoutHelper {
    static let modeShift = 30
    static let modeMask = 0x3 << modeShift
    static let unspecified = 0 << modeShift
    static let exactly = 1 << modeShift
    static let atMost = 2 << modeShift
    static let measuredStateTooSmall = 0x0100_0000
    static let measuredStateMask = 0xff00_0000
    static let measuredSizeMask = 0x00ff_ffff

    static let scale: CGFloat = UIScreen.main.scale

    static func mode(_ spec: Int) -> Int { spec & modeMask }
    static func size(_ spec: Int) -> Int { spec & ~modeMask }

    static func makeMeasureSpec(_ size: Double, _ mode: Int) -> Int {
        (Int(jsRound(max(0, size))) & ~modeMask) | (mode & modeMask)
    }

    static func toDevicePixels(_ value: Double) -> Double { value * Double(scale) }
    static func toDeviceIndependentPixels(_ value: Double) -> Double { value / Double(scale) }

    /// `layout.round`: Math.round, but never rounds a non-zero value to zero.
    static func round(_ value: Double) -> Double {
        let res = (value + 0.5).rounded(.down)
        if res != 0 { return res }
        if value == 0 { return 0 }
        return value > 0 ? 1 : -1
    }

    static func measureNativeView(_ view: UIView, _ width: Int, _ widthMode: Int, _ height: Int, _ heightMode: Int) -> CGSize {
        let size = view.sizeThatFits(CGSize(
            width: widthMode == unspecified ? .infinity : toDeviceIndependentPixels(Double(width)),
            height: heightMode == unspecified ? .infinity : toDeviceIndependentPixels(Double(height))))
        return CGSize(width: round(toDevicePixels(size.width)), height: round(toDevicePixels(size.height)))
    }
}

/// JavaScript's `x | 0` on a measured size: the fraction is dropped.
private func int32(_ value: Double) -> Int { Int(Int32(truncatingIfNeeded: Int(value.rounded(.towardZero)))) }

/// `ViewHelper` from view-helper-common.
enum ViewHelper {
    @discardableResult
    static func measureChild(_ parent: View?, _ child: View?, _ widthMeasureSpec: Int, _ heightMeasureSpec: Int) -> (width: Double, height: Double) {
        guard let child, !child.isCollapsed else { return (0, 0) }
        let widthSpec = parent?.currentWidthMeasureSpec ?? widthMeasureSpec
        let heightSpec = parent?.currentHeightMeasureSpec ?? heightMeasureSpec
        child.updateEffectiveLayoutValues(LayoutHelper.size(widthSpec), LayoutHelper.mode(widthSpec), LayoutHelper.size(heightSpec), LayoutHelper.mode(heightSpec))
        let horizontalMargins = child.effectiveMarginLeft + child.effectiveMarginRight
        let verticalMargins = child.effectiveMarginTop + child.effectiveMarginBottom
        let childWidthSpec = getMeasureSpec(widthMeasureSpec, horizontalMargins, child.effectiveWidth, child.horizontalAlignment == "stretch", child.effectiveMaxWidth)
        let childHeightSpec = getMeasureSpec(heightMeasureSpec, verticalMargins, child.effectiveHeight, child.verticalAlignment == "stretch", child.effectiveMaxHeight)
        child.measure(childWidthSpec, childHeightSpec)
        return (jsRound(Double(child.measuredWidth) + horizontalMargins), jsRound(Double(child.measuredHeight) + verticalMargins))
    }

    static func layoutChild(_ parent: View?, _ child: View?, _ left: Double, _ top: Double, _ right: Double, _ bottom: Double, setFrame: Bool = true) {
        guard let child, !child.isCollapsed else { return }
        var childTop: Double
        var childLeft: Double
        var childWidth = Double(child.measuredWidth)
        var childHeight = Double(child.measuredHeight)
        let marginTop = child.effectiveMarginTop, marginBottom = child.effectiveMarginBottom
        let vAlignment = child.effectiveHeight >= 0 && child.verticalAlignment == "stretch" ? "middle" : child.verticalAlignment
        switch vAlignment {
        case "top":
            childTop = top + marginTop
        case "middle", "center":
            childTop = top + (bottom - top - childHeight + (marginTop - marginBottom)) / 2
        case "bottom":
            childTop = bottom - childHeight - marginBottom
        default:
            childTop = top + marginTop
            childHeight = max(0, bottom - top - (marginTop + marginBottom))
        }
        let marginLeft = child.effectiveMarginLeft, marginRight = child.effectiveMarginRight
        let hAlignment = child.effectiveWidth >= 0 && child.horizontalAlignment == "stretch" ? "center" : child.horizontalAlignment
        switch hAlignment {
        case "start", "left":
            childLeft = left + marginLeft
        case "center":
            childLeft = left + (right - left - childWidth + (marginLeft - marginRight)) / 2
        case "right", "end":
            childLeft = right - childWidth - marginRight
        default:
            childLeft = left + marginLeft
            childWidth = max(0, right - left - (marginLeft + marginRight))
        }
        let childRight = jsRound(childLeft + childWidth)
        let childBottom = jsRound(childTop + childHeight)
        child.layout(jsRound(childLeft), jsRound(childTop), childRight, childBottom, setFrame: setFrame)
    }

    static func resolveSizeAndState(_ size: Double, _ specSize: Int, _ specMode: Int, _ childMeasuredState: Int) -> Int {
        var result = size
        switch specMode {
        case LayoutHelper.unspecified:
            result = size.rounded(.up)
        case LayoutHelper.atMost:
            if Double(specSize) < size {
                return specSize | LayoutHelper.measuredStateTooSmall | (childMeasuredState & LayoutHelper.measuredStateMask)
            }
        case LayoutHelper.exactly:
            result = Double(specSize)
        default:
            break
        }
        return int32(result) | (childMeasuredState & LayoutHelper.measuredStateMask)
    }

    static func getMeasureSpec(_ parentSpec: Int, _ margins: Double, _ childLength: Double, _ stretched: Bool, _ maxLength: Double = .infinity) -> Int {
        let parentLength = Double(LayoutHelper.size(parentSpec))
        let parentSpecMode = LayoutHelper.mode(parentSpec)
        var resultSize: Double = 0
        var resultMode = LayoutHelper.unspecified
        if childLength >= 0 {
            resultSize = parentSpecMode == LayoutHelper.unspecified ? childLength : min(parentLength, childLength)
            resultMode = LayoutHelper.exactly
        } else {
            switch parentSpecMode {
            case LayoutHelper.exactly:
                resultSize = max(0, parentLength - margins)
                resultMode = stretched ? LayoutHelper.exactly : LayoutHelper.atMost
            case LayoutHelper.atMost:
                resultSize = max(0, parentLength - margins)
                resultMode = LayoutHelper.atMost
            default:
                resultSize = 0
                resultMode = LayoutHelper.unspecified
            }
        }
        if maxLength.isFinite && maxLength >= 0 {
            if resultMode == LayoutHelper.unspecified {
                resultSize = maxLength
                resultMode = LayoutHelper.atMost
            } else if resultSize > maxLength {
                resultSize = maxLength
                if resultMode == LayoutHelper.exactly && childLength < 0 { resultMode = LayoutHelper.atMost }
            }
        }
        return LayoutHelper.makeMeasureSpec(resultSize, resultMode)
    }
}

struct Position { var left: Double, top: Double, right: Double, bottom: Double }

/// `IOSHelper` from view-helper/index.ios: how a controller's root view is
/// measured against its safe area, and how frames shrink to or expand past it.
enum IOSHelper {
    static func layoutView(_ controller: UIViewController, _ owner: View) {
        let safeArea = controller.view.safeAreaLayoutGuide.layoutFrame
        var position = getPositionFromFrame(safeArea)
        if !controller.children.isEmpty {
            position = getPositionFromFrame(controller.view.frame)
        }
        let safeAreaWidth = LayoutHelper.round(LayoutHelper.toDevicePixels(safeArea.size.width))
        let safeAreaHeight = LayoutHelper.round(LayoutHelper.toDevicePixels(safeArea.size.height))
        let widthSpec = LayoutHelper.makeMeasureSpec(safeAreaWidth, LayoutHelper.exactly)
        let heightSpec = LayoutHelper.makeMeasureSpec(safeAreaHeight, LayoutHelper.exactly)
        ViewHelper.measureChild(nil, owner, widthSpec, heightSpec)
        ViewHelper.layoutChild(nil, owner, position.left, position.top, position.right, position.bottom)
        owner.parent?.layoutParent()
    }

    static func getPositionFromFrame(_ frame: CGRect) -> Position {
        Position(
            left: LayoutHelper.round(LayoutHelper.toDevicePixels(frame.origin.x)),
            top: LayoutHelper.round(LayoutHelper.toDevicePixels(frame.origin.y)),
            right: LayoutHelper.round(LayoutHelper.toDevicePixels(frame.origin.x + frame.size.width)),
            bottom: LayoutHelper.round(LayoutHelper.toDevicePixels(frame.origin.y + frame.size.height)))
    }

    static func getFrameFromPosition(_ p: Position, insets: Position = Position(left: 0, top: 0, right: 0, bottom: 0)) -> CGRect {
        let left = LayoutHelper.toDeviceIndependentPixels(p.left + insets.left)
        let top = LayoutHelper.toDeviceIndependentPixels(p.top + insets.top)
        let width = LayoutHelper.toDeviceIndependentPixels(p.right - p.left - insets.left - insets.right)
        let height = LayoutHelper.toDeviceIndependentPixels(p.bottom - p.top - insets.top - insets.bottom)
        return CGRect(x: left, y: top, width: max(0, width), height: max(0, height))
    }

    static func shrinkToSafeArea(_ view: View, _ frame: CGRect) -> CGRect? {
        let insets = view.getSafeAreaInsets()
        guard insets.left != 0 || insets.top != 0 else { return nil }
        return getFrameFromPosition(getPositionFromFrame(frame), insets: insets)
    }

    static func expandBeyondSafeArea(_ view: View, _ frame: CGRect) -> CGRect {
        guard let space = getAvailableSpaceFromParent(view, frame), let safeArea = space.safeArea, let fullscreen = space.fullscreen else {
            return frame
        }
        let position = getPositionFromFrame(frame)
        let safe = getPositionFromFrame(safeArea)
        let full = getPositionFromFrame(fullscreen)
        let inWindow = getPositionFromFrame(space.inWindow)
        var adjusted = position
        if position.left != 0 && inWindow.left <= safe.left { adjusted.left = full.left }
        if position.top != 0 && inWindow.top <= safe.top { adjusted.top = full.top }
        if inWindow.right < full.right && inWindow.right >= safe.right + full.left { adjusted.right += full.right - inWindow.right }
        if inWindow.bottom < full.bottom && inWindow.bottom >= safe.bottom + full.top { adjusted.bottom += full.bottom - inWindow.bottom }
        return CGRect(
            x: LayoutHelper.toDeviceIndependentPixels(adjusted.left),
            y: LayoutHelper.toDeviceIndependentPixels(adjusted.top),
            width: LayoutHelper.toDeviceIndependentPixels(adjusted.right - adjusted.left),
            height: LayoutHelper.toDeviceIndependentPixels(adjusted.bottom - adjusted.top))
    }

    static func getAvailableSpaceFromParent(_ view: View, _ frame: CGRect) -> (safeArea: CGRect?, fullscreen: CGRect?, inWindow: CGRect)? {
        var scrollView: UIScrollView?
        var controllerView: UIView?
        if let controller = view.viewController {
            controllerView = controller.view
        } else {
            var parent = view.parent
            while let p = parent, p.viewController == nil, !(p.nativeView is UIScrollView) { parent = p.parent }
            if let p = parent {
                if let scroll = p.nativeView as? UIScrollView {
                    scrollView = scroll
                } else {
                    controllerView = p.viewController?.view
                }
            }
        }
        var fullscreen: CGRect?
        var safeArea: CGRect?
        var controllerInWindow = CGPoint.zero
        if let controllerView {
            safeArea = controllerView.safeAreaLayoutGuide.layoutFrame
            fullscreen = controllerView.frame
            controllerInWindow = controllerView.convert(controllerView.bounds.origin, to: nil)
        } else if let scrollView {
            let insets = scrollView.safeAreaInsets
            let size = scrollView.contentSize
            safeArea = CGRect(x: insets.left, y: insets.top, width: size.width - insets.left - insets.right, height: size.height - insets.top - insets.bottom)
            fullscreen = CGRect(origin: .zero, size: size)
        }
        guard let location = view.getLocationInWindow() else { return nil }
        var left = location.x - controllerInWindow.x
        var top = location.y - controllerInWindow.y
        if let scrollView {
            left += scrollView.contentOffset.x
            top += scrollView.contentOffset.y
        }
        return (safeArea, fullscreen, CGRect(x: left, y: top, width: frame.size.width, height: frame.size.height))
    }
}

/// The controller NativeScript gives a root view that has none of its own.
final class LayoutViewController: UIViewController {
    weak var owner: View?

    init(owner: View) {
        self.owner = owner
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        extendedLayoutIncludesOpaqueBars = true
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        if let owner { IOSHelper.layoutView(self, owner) }
    }
}
