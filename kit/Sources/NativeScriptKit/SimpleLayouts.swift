import UIKit

/// `WrapLayout` from layouts/wrap-layout (index.ios and wrap-layout-common).
open class WrapLayout: LayoutBase {
    open override class var cssType: String { "WrapLayout" }

    var orientation = "horizontal"
    var effectiveItemWidth: Double = -1
    var effectiveItemHeight: Double = -1
    private var lengths: [Double] = []

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "orientation":
            orientation = (value as? String)?.lowercased() == "vertical" ? "vertical" : "horizontal"
        case "itemWidth":
            effectiveItemWidth = Length(value, default: .auto).toDevicePixels(auto: -1)
        case "itemHeight":
            effectiveItemHeight = Length(value, default: .auto).toDevicePixels(auto: -1)
        default:
            super.setProperty(name, value)
            return
        }
        requestLayout()
    }

    private static func getChildMeasureSpec(_ parentMode: Int, _ parentLength: Double, _ itemLength: Double) -> Int {
        if itemLength > 0 { return LayoutHelper.makeMeasureSpec(itemLength, LayoutHelper.exactly) }
        if parentMode == LayoutHelper.unspecified { return LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified) }
        return LayoutHelper.makeMeasureSpec(parentLength, LayoutHelper.atMost)
    }

    /// `lengths[index] = value` on a JavaScript array.
    private func setLength(_ index: Int, _ value: Double) {
        while lengths.count <= index { lengths.append(0) }
        lengths[index] = value
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        var measureWidth: Double = 0
        var measureHeight: Double = 0
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let horizontalPaddingsAndMargins = effectivePaddingLeft + effectivePaddingRight + effectiveBorderLeftWidth + effectiveBorderRightWidth
        let verticalPaddingsAndMargins = effectivePaddingTop + effectivePaddingBottom + effectiveBorderTopWidth + effectiveBorderBottomWidth
        let availableWidth = widthMode == LayoutHelper.unspecified ? Double.greatestFiniteMagnitude : Double(width) - horizontalPaddingsAndMargins
        let availableHeight = heightMode == LayoutHelper.unspecified ? Double.greatestFiniteMagnitude : Double(height) - verticalPaddingsAndMargins
        let childWidthMeasureSpec = WrapLayout.getChildMeasureSpec(widthMode, availableWidth, effectiveItemWidth)
        let childHeightMeasureSpec = WrapLayout.getChildMeasureSpec(heightMode, availableHeight, effectiveItemHeight)
        var remainingWidth = availableWidth
        var remainingHeight = availableHeight
        lengths = []
        var rowOrColumn = 0
        var maxLength: Double = 0
        let isVertical = orientation == "vertical"
        let useItemWidth = effectiveItemWidth > 0
        let useItemHeight = effectiveItemHeight > 0
        let itemWidth = effectiveItemWidth
        let itemHeight = effectiveItemHeight
        eachLayoutChild { child in
            let desiredSize = ViewHelper.measureChild(self, child, childWidthMeasureSpec, childHeightMeasureSpec)
            let childMeasuredWidth = useItemWidth ? itemWidth : desiredSize.width
            let childMeasuredHeight = useItemHeight ? itemHeight : desiredSize.height
            let isFirst = lengths.count <= rowOrColumn
            if isVertical {
                if childMeasuredHeight > remainingHeight {
                    rowOrColumn += 1
                    maxLength = max(maxLength, measureHeight)
                    measureHeight = childMeasuredHeight
                    remainingHeight = availableHeight - childMeasuredHeight
                    setLength(isFirst ? rowOrColumn - 1 : rowOrColumn, childMeasuredWidth)
                } else {
                    remainingHeight -= childMeasuredHeight
                    measureHeight += childMeasuredHeight
                }
            } else {
                if childMeasuredWidth > remainingWidth {
                    rowOrColumn += 1
                    maxLength = max(maxLength, measureWidth)
                    measureWidth = childMeasuredWidth
                    remainingWidth = availableWidth - childMeasuredWidth
                    setLength(isFirst ? rowOrColumn - 1 : rowOrColumn, childMeasuredHeight)
                } else {
                    remainingWidth -= childMeasuredWidth
                    measureWidth += childMeasuredWidth
                }
            }
            if isFirst {
                setLength(rowOrColumn, isVertical ? childMeasuredWidth : childMeasuredHeight)
            } else {
                setLength(rowOrColumn, max(lengths[rowOrColumn], isVertical ? childMeasuredWidth : childMeasuredHeight))
            }
        }
        if isVertical {
            measureHeight = max(maxLength, measureHeight)
            for value in lengths { measureWidth += value }
        } else {
            measureWidth = max(maxLength, measureWidth)
            for value in lengths { measureHeight += value }
        }
        measureWidth += horizontalPaddingsAndMargins
        measureHeight += verticalPaddingsAndMargins
        measureWidth = min(max(measureWidth, effectiveMinWidth), effectiveMaxWidth)
        measureHeight = min(max(measureHeight, effectiveMinHeight), effectiveMaxHeight)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = safeAreaInsetsPosition()
        let isVertical = orientation == "vertical"
        let paddingLeft = effectiveBorderLeftWidth + effectivePaddingLeft + insets.left
        let paddingTop = effectiveBorderTopWidth + effectivePaddingTop + insets.top
        let paddingRight = effectiveBorderRightWidth + effectivePaddingRight + insets.right
        let paddingBottom = effectiveBorderBottomWidth + effectivePaddingBottom + insets.bottom
        var childLeft = paddingLeft
        var childTop = paddingTop
        let childrenHeight = bottom - top - paddingBottom
        let childrenWidth = right - left - paddingRight
        var rowOrColumn = 0
        // A row or column past the measured ones reads `undefined` in NativeScript; 0 keeps the arithmetic finite.
        func length(_ index: Int) -> Double { index >= 0 && index < lengths.count ? lengths[index] : 0 }
        eachLayoutChild { child in
            var childHeight = Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            var childWidth = Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            let current = length(rowOrColumn)
            if isVertical {
                childWidth = current
                childHeight = effectiveItemHeight > 0 ? effectiveItemHeight : childHeight
                let isFirst = childTop == paddingTop
                if childTop + childHeight > childrenHeight && childLeft + childWidth <= childrenWidth {
                    childTop = paddingTop
                    if !isFirst { childLeft += current }
                    rowOrColumn += 1
                    childWidth = length(isFirst ? rowOrColumn - 1 : rowOrColumn)
                }
                if childLeft < childrenWidth && childTop < childrenHeight {
                    ViewHelper.layoutChild(self, child, childLeft, childTop, childLeft + childWidth, childTop + childHeight)
                }
                childTop += childHeight
            } else {
                childWidth = effectiveItemWidth > 0 ? effectiveItemWidth : childWidth
                childHeight = current
                let isFirst = childLeft == paddingLeft
                if childLeft + childWidth > childrenWidth && childTop + childHeight <= childrenHeight {
                    childLeft = paddingLeft
                    if !isFirst { childTop += current }
                    rowOrColumn += 1
                    childHeight = length(isFirst ? rowOrColumn - 1 : rowOrColumn)
                }
                if childLeft < childrenWidth && childTop < childrenHeight {
                    ViewHelper.layoutChild(self, child, childLeft, childTop, childLeft + childWidth, childTop + childHeight)
                }
                childLeft += childWidth
            }
        }
    }
}

/// `AbsoluteLayout` from layouts/absolute-layout (index.ios and absolute-layout-common).
open class AbsoluteLayout: LayoutBase {
    open override class var cssType: String { "AbsoluteLayout" }

    /// A child's `left` and `top` (`effectiveLeft`, `effectiveTop`): lengths, never percentages.
    static func effectiveLeft(_ child: View) -> Double { Length(child.applied["left"], default: .zero).toDevicePixels(auto: 0) }
    static func effectiveTop(_ child: View) -> Double { Length(child.applied["top"], default: .zero).toDevicePixels(auto: 0) }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        var measureWidth: Double = 0
        var measureHeight: Double = 0
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let childMeasureSpec = LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified)
        eachLayoutChild { child in
            let childSize = ViewHelper.measureChild(self, child, childMeasureSpec, childMeasureSpec)
            measureWidth = max(measureWidth, AbsoluteLayout.effectiveLeft(child) + childSize.width)
            measureHeight = max(measureHeight, AbsoluteLayout.effectiveTop(child) + childSize.height)
        }
        measureWidth += effectiveBorderLeftWidth + effectivePaddingLeft + effectivePaddingRight + effectiveBorderRightWidth
        measureHeight += effectiveBorderTopWidth + effectivePaddingTop + effectivePaddingBottom + effectiveBorderBottomWidth
        measureWidth = min(max(measureWidth, effectiveMinWidth), effectiveMaxWidth)
        measureHeight = min(max(measureHeight, effectiveMinHeight), effectiveMaxHeight)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = safeAreaInsetsPosition()
        eachLayoutChild { child in
            let childLeft = effectiveBorderLeftWidth + effectivePaddingLeft + AbsoluteLayout.effectiveLeft(child) + insets.left
            let childTop = effectiveBorderTopWidth + effectivePaddingTop + AbsoluteLayout.effectiveTop(child) + insets.top
            let childRight = childLeft + Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            let childBottom = childTop + Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            ViewHelper.layoutChild(self, child, childLeft, childTop, childRight, childBottom)
        }
    }
}

/// `DockLayout` from layouts/dock-layout (index.ios and dock-layout-common).
open class DockLayout: LayoutBase {
    open override class var cssType: String { "DockLayout" }

    var stretchLastChild = true

    open override func setProperty(_ name: String, _ value: Any?) {
        if name == "stretchLastChild" {
            stretchLastChild = toBool(value) ?? true
            requestLayout()
        } else {
            super.setProperty(name, value)
        }
    }

    static func getDock(_ child: View) -> String {
        let dock = (child.applied["dock"] as? String)?.lowercased() ?? "left"
        return ["left", "top", "right", "bottom"].contains(dock) ? dock : "left"
    }

    /// `eachLayoutChild` with LayoutBase's `isLast`: true only for the last child, and only when it is visible.
    private func eachLayoutChildWithLast(_ body: (View, Bool) -> Void) {
        let all = subViews
        for (i, child) in all.enumerated() where !child.isCollapsed { body(child, i == all.count - 1) }
    }

    /// `makeMeasureSpec` for an unbounded remaining length, which JavaScript's `& ~MODE_MASK` wraps to 0.
    private static func measureSpec(_ size: Double, _ mode: Int) -> Int {
        LayoutHelper.makeMeasureSpec(size >= 2_147_483_648 ? Double(jsInt32(jsRound(size)) & 0x3FFF_FFFF) : size, mode)
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        var measureWidth: Double = 0
        var measureHeight: Double = 0
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let horizontalPaddingsAndMargins = effectivePaddingLeft + effectivePaddingRight + effectiveBorderLeftWidth + effectiveBorderRightWidth
        let verticalPaddingsAndMargins = effectivePaddingTop + effectivePaddingBottom + effectiveBorderTopWidth + effectiveBorderBottomWidth
        var remainingWidth = widthMode == LayoutHelper.unspecified ? Double.greatestFiniteMagnitude : Double(width) - horizontalPaddingsAndMargins
        var remainingHeight = heightMode == LayoutHelper.unspecified ? Double.greatestFiniteMagnitude : Double(height) - verticalPaddingsAndMargins
        var tempHeight: Double = 0
        var tempWidth: Double = 0
        eachLayoutChildWithLast { child, last in
            let childWidthMeasureSpec: Int
            let childHeightMeasureSpec: Int
            if stretchLastChild && last {
                childWidthMeasureSpec = DockLayout.measureSpec(remainingWidth, widthMode)
                childHeightMeasureSpec = DockLayout.measureSpec(remainingHeight, heightMode)
            } else {
                childWidthMeasureSpec = DockLayout.measureSpec(remainingWidth, widthMode == LayoutHelper.exactly ? LayoutHelper.atMost : widthMode)
                childHeightMeasureSpec = DockLayout.measureSpec(remainingHeight, heightMode == LayoutHelper.exactly ? LayoutHelper.atMost : heightMode)
            }
            let childSize = ViewHelper.measureChild(self, child, childWidthMeasureSpec, childHeightMeasureSpec)
            switch DockLayout.getDock(child) {
            case "top", "bottom":
                remainingHeight = max(0, remainingHeight - childSize.height)
                tempHeight += childSize.height
                measureWidth = max(measureWidth, tempWidth + childSize.width)
                measureHeight = max(measureHeight, tempHeight)
            default:
                remainingWidth = max(0, remainingWidth - childSize.width)
                tempWidth += childSize.width
                measureWidth = max(measureWidth, tempWidth)
                measureHeight = max(measureHeight, tempHeight + childSize.height)
            }
        }
        measureWidth += horizontalPaddingsAndMargins
        measureHeight += verticalPaddingsAndMargins
        measureWidth = min(max(measureWidth, effectiveMinWidth), effectiveMaxWidth)
        measureHeight = min(max(measureHeight, effectiveMinHeight), effectiveMaxHeight)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = safeAreaInsetsPosition()
        let horizontalPaddingsAndMargins = effectivePaddingLeft + effectivePaddingRight + effectiveBorderLeftWidth + effectiveBorderRightWidth + insets.left + insets.right
        let verticalPaddingsAndMargins = effectivePaddingTop + effectivePaddingBottom + effectiveBorderTopWidth + effectiveBorderBottomWidth + insets.top + insets.bottom
        var childLeft = effectiveBorderLeftWidth + effectivePaddingLeft + insets.left
        var childTop = effectiveBorderTopWidth + effectivePaddingTop + insets.top
        var x = childLeft
        var y = childTop
        var remainingWidth = max(0, right - left - horizontalPaddingsAndMargins)
        var remainingHeight = max(0, bottom - top - verticalPaddingsAndMargins)
        eachLayoutChildWithLast { child, last in
            var childWidth = Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
            var childHeight = Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
            if last && stretchLastChild {
                ViewHelper.layoutChild(self, child, x, y, x + remainingWidth, y + remainingHeight)
                return
            }
            switch DockLayout.getDock(child) {
            case "top":
                childLeft = x
                childTop = y
                childWidth = remainingWidth
                y += childHeight
                remainingHeight = max(0, remainingHeight - childHeight)
            case "bottom":
                childLeft = x
                childTop = y + remainingHeight - childHeight
                childWidth = remainingWidth
                remainingHeight = max(0, remainingHeight - childHeight)
            case "right":
                childLeft = x + remainingWidth - childWidth
                childTop = y
                childHeight = remainingHeight
                remainingWidth = max(0, remainingWidth - childWidth)
            default:
                childLeft = x
                childTop = y
                childHeight = remainingHeight
                x += childWidth
                remainingWidth = max(0, remainingWidth - childWidth)
            }
            ViewHelper.layoutChild(self, child, childLeft, childTop, childLeft + childWidth, childTop + childHeight)
        }
    }
}

/// `RootLayout` from layouts/root-layout: a GridLayout as rendered from a
/// template. Its `open`/`close` overlay API is not ported.
open class RootLayout: GridLayout {
    open override class var cssType: String { "RootLayout" }
    let rootState = RootLayoutState()

    open override func initNativeView() {
        super.initNativeView()
        registerRootLayout(self)
    }
}
