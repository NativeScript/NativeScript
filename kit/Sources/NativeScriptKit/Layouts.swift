import UIKit

/// `CustomLayoutView`: a plain UIView that NativeScript measures and lays out.
open class CustomLayoutView: View {
    open override class var overflowsSafeArea: Bool { true }

    open override func createNativeView() -> UIView? {
        UIView(frame: UIScreen.main.bounds)
    }

    /// Measuring is the subclass's job; this one must not fall back to sizeThatFits.
    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {}

    func addNativeSubview(_ child: View, at index: Int? = nil) {
        guard let parentView = nativeView, let childView = child.nativeView else { return }
        insertNative(childView, into: parentView, at: index)
    }
}

/// `_addViewToNativeVisualTree`: at that index of the native subviews, or last.
/// `insertSubview(_:at:)` counts sublayers that are not views (a background
/// gradient), as core's `insertSubviewAtIndex` does.
func insertNative(_ childView: UIView, into parentView: UIView, at index: Int?) {
    guard let index, index < parentView.subviews.count else { return parentView.addSubview(childView) }
    if CorePatches.insertBelowSubview {
        if parentView.subviews[index] !== childView { parentView.insertSubview(childView, belowSubview: parentView.subviews[index]) }
    } else {
        parentView.insertSubview(childView, at: index)
    }
}

/// `LayoutBase`: children in template order, static ones and the runs that
/// `if`/`for` regions own.
open class LayoutBase: CustomLayoutView, RegionHost {
    private enum Entry {
        case view(View)
        case region(Region)
    }

    private var entries: [Entry] = []
    private(set) var subViews: [View] = []
    /// Defaults to true, but reaches the native view only when it is set or a background is drawn.
    var clipToBounds = true

    open override func addChild(_ child: View) {
        entries.append(.view(child))
        subViews.append(child)
        addView(child)
        addNativeSubview(child)
        registerLayoutChild(child)
        requestLayout()
    }

    /// A run of children owned by an `if` or `for`, at this point in template order.
    public func addRegion() -> Region {
        addRegion(Region(host: nil))
    }

    /// A region made before its container mounts it (Svelte's blocks), with what it already holds.
    @discardableResult
    public func addRegion(_ region: Region) -> Region {
        region.host = self
        entries.append(.region(region))
        if !region.views.isEmpty { rebuildChildren() }
        return region
    }

    public func regionChanged(_ region: Region) { rebuildChildren() }

    private func rebuildChildren() {
        let next = entries.flatMap { entry -> [View] in
            switch entry {
            case .view(let view): return [view]
            case .region(let region): return region.views
            }
        }
        let kept = Set(next.map(ObjectIdentifier.init))
        for child in subViews where !kept.contains(ObjectIdentifier(child)) {
            removeView(child)
            child.removeFromNativeVisualTree()
            unregisterLayoutChild(child)
        }
        let existing = Set(subViews.map(ObjectIdentifier.init))
        subViews = next
        for (index, child) in next.enumerated() {
            let added = !existing.contains(ObjectIdentifier(child))
            if added {
                addView(child)
                registerLayoutChild(child)
            }
            // A native view a plugin moved into another view (a keyboard accessory) stays there.
            guard let parentView = nativeView, let childView = child.nativeView, added || childView.superview === parentView else { continue }
            if index >= parentView.subviews.count || parentView.subviews[index] !== childView {
                insertNative(childView, into: parentView, at: index)
            }
        }
        requestLayout()
    }

    // MARK: Core's child API (layout-base-common)

    public func getChildrenCount() -> Double { Double(subViews.count) }

    public func getChildAt(_ index: Double) -> View? { Int(index) >= 0 && Int(index) < subViews.count ? subViews[Int(index)] : nil }

    public func getChildIndex(_ child: View) -> Double { Double(subViews.firstIndex { $0 === child } ?? -1) }

    /// `insertChild(child, atIndex)`: the child joins the children at that index, before any template region that follows.
    public func insertChild(_ child: View, _ atIndex: Double) {
        let index = max(0, Int(atIndex))
        var flat = 0
        var position = entries.count
        for (k, entry) in entries.enumerated() {
            let count: Int
            switch entry {
            case .view: count = 1
            case .region(let region): count = region.views.count
            }
            if flat + count > index || (flat == index && count == 0) { position = k; break }
            flat += count
        }
        if case .region(let region)? = entries.indices.contains(position) ? entries[position] : nil, flat < index, !region.views.isEmpty {
            position += 1
        }
        entries.insert(.view(child), at: position)
        let wasChild = subViews.contains { $0 === child }
        subViews.insert(child, at: min(index, subViews.count))
        if !wasChild {
            addView(child)
            registerLayoutChild(child)
        }
        if let parentView = nativeView, let childView = child.nativeView {
            insertNative(childView, into: parentView, at: index)
        }
        requestLayout()
    }

    public func removeChild(_ child: View) {
        guard let index = subViews.firstIndex(where: { $0 === child }) else { return }
        subViews.remove(at: index)
        entries.removeAll { if case .view(let v) = $0 { return v === child } else { return false } }
        removeView(child)
        child.removeFromNativeVisualTree()
        unregisterLayoutChild(child)
        requestLayout()
    }

    public func removeChildren() {
        for child in subViews { removeChild(child) }
    }

    func registerLayoutChild(_ child: View) {}
    func unregisterLayoutChild(_ child: View) {}

    open override func eachChildView(_ body: (View) -> Void) {
        for child in subViews { body(child) }
    }

    func eachLayoutChild(_ body: (View) -> Void) {
        for child in subViews where !child.isCollapsed { body(child) }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "clipToBounds":
            clipToBounds = toBool(value) ?? true
            setNativeClipToBounds()
        case "isPassThroughParentEnabled":
            nativeView?.setPassThroughParent(booleanConverter(value))
        default:
            super.setProperty(name, value)
        }
    }

    open override func setNativeClipToBounds() {
        if clipToBounds { nativeView?.clipsToBounds = true } else { super.setNativeClipToBounds() }
    }
}

/// `StackLayout` from layouts/stack-layout/index.ios.
open class StackLayout: LayoutBase {
    open override class var cssType: String { "StackLayout" }

    var orientation = "vertical"
    private var totalLength: Double = 0

    open override func setProperty(_ name: String, _ value: Any?) {
        if name == "orientation" {
            orientation = (value as? String) == "horizontal" ? "horizontal" : "vertical"
            requestLayout()
        } else {
            super.setProperty(name, value)
        }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        var measureWidth: Double = 0
        var measureHeight: Double = 0
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let isVertical = orientation == "vertical"
        let horizontalPaddingsAndMargins = effectivePaddingLeft + effectivePaddingRight + effectiveBorderLeftWidth + effectiveBorderRightWidth
        let verticalPaddingsAndMargins = effectivePaddingTop + effectivePaddingBottom + effectiveBorderTopWidth + effectiveBorderBottomWidth
        let mode = isVertical ? heightMode : widthMode
        let measureSpec: Int
        var remainingLength: Double
        if mode == LayoutHelper.unspecified {
            measureSpec = LayoutHelper.unspecified
            remainingLength = 0
        } else {
            measureSpec = LayoutHelper.atMost
            remainingLength = isVertical ? Double(height) - verticalPaddingsAndMargins : Double(width) - horizontalPaddingsAndMargins
        }
        let childMeasureSpec: Int
        if isVertical {
            let childWidth = max(0, widthMode == LayoutHelper.unspecified ? 0 : Double(width) - horizontalPaddingsAndMargins)
            childMeasureSpec = LayoutHelper.makeMeasureSpec(childWidth, widthMode)
        } else {
            let childHeight = max(0, heightMode == LayoutHelper.unspecified ? 0 : Double(height) - verticalPaddingsAndMargins)
            childMeasureSpec = LayoutHelper.makeMeasureSpec(childHeight, heightMode)
        }
        eachLayoutChild { child in
            if isVertical {
                let size = ViewHelper.measureChild(self, child, childMeasureSpec, LayoutHelper.makeMeasureSpec(remainingLength, measureSpec))
                measureWidth = max(measureWidth, size.width)
                measureHeight += size.height
                remainingLength = max(0, remainingLength - size.height)
            } else {
                let size = ViewHelper.measureChild(self, child, LayoutHelper.makeMeasureSpec(remainingLength, measureSpec), childMeasureSpec)
                measureHeight = max(measureHeight, size.height)
                measureWidth += size.width
                remainingLength = max(0, remainingLength - size.width)
            }
        }
        measureWidth += horizontalPaddingsAndMargins
        measureHeight += verticalPaddingsAndMargins
        measureWidth = min(max(measureWidth, effectiveMinWidth), effectiveMaxWidth)
        measureHeight = min(max(measureHeight, effectiveMinHeight), effectiveMaxHeight)
        totalLength = isVertical ? measureHeight : measureWidth
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = safeAreaInsetsPosition()
        let paddingLeft = effectiveBorderLeftWidth + effectivePaddingLeft + insets.left
        let paddingTop = effectiveBorderTopWidth + effectivePaddingTop + insets.top
        let paddingRight = effectiveBorderRightWidth + effectivePaddingRight + insets.right
        let paddingBottom = effectiveBorderBottomWidth + effectivePaddingBottom + insets.bottom
        if orientation == "vertical" {
            var childTop: Double
            switch verticalAlignment {
            case "middle": childTop = (bottom - top - totalLength) / 2 + paddingTop
            case "bottom": childTop = bottom - top - totalLength + paddingTop
            default: childTop = paddingTop
            }
            let childRight = right - left - paddingRight
            eachLayoutChild { child in
                let childHeight = Double(child.measuredHeight) + child.effectiveMarginTop + child.effectiveMarginBottom
                ViewHelper.layoutChild(self, child, paddingLeft, childTop, childRight, childTop + childHeight)
                childTop += childHeight
            }
        } else {
            var childLeft: Double
            switch horizontalAlignment {
            case "center": childLeft = (right - left - totalLength) / 2 + paddingLeft
            case "right", "end": childLeft = right - left - totalLength + paddingLeft
            default: childLeft = paddingLeft
            }
            let childBottom = bottom - top - paddingBottom
            eachLayoutChild { child in
                let childWidth = Double(child.measuredWidth) + child.effectiveMarginLeft + child.effectiveMarginRight
                ViewHelper.layoutChild(self, child, childLeft, paddingTop, childLeft + childWidth, childBottom)
                childLeft += childWidth
            }
        }
    }
}

/// `ContentView`: a single child, laid out over the whole of it.
open class ContentView: CustomLayoutView {
    open override class var cssType: String { "ContentView" }

    private var contentView: View?

    /// `view.content` from script; a page given content through it adopts it as through its template.
    public var content: View? {
        get { contentView }
        set { if let newValue { addChild(newValue) } else { setContent(nil) } }
    }

    var layoutView: View? { content }

    open override func addChild(_ child: View) {
        setContent(child)
    }

    func setContent(_ value: View?) {
        if let old = contentView {
            removeView(old)
            old.removeFromNativeVisualTree()
        }
        contentView = value
        if let value {
            addView(value)
            addNativeSubview(value)
        }
        requestLayout()
    }

    open override func eachChildView(_ body: (View) -> Void) {
        if let content { body(content) }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let result = ViewHelper.measureChild(self, layoutView, widthMeasureSpec, heightMeasureSpec)
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(max(result.width, effectiveMinWidth), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(max(result.height, effectiveMinHeight), height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        ViewHelper.layoutChild(self, layoutView, 0, 0, right - left, bottom - top)
    }
}

/// `ScrollView` from scroll-view/index.ios.
open class ScrollView: ContentView, UIScrollViewDelegate {
    open override class var cssType: String { "ScrollView" }

    var orientation = "vertical"
    var contentInsetAdjustmentBehavior = "never"
    private var contentMeasuredWidth: Double = 0
    private var contentMeasuredHeight: Double = 0

    open override func createNativeView() -> UIView? { UIScrollView() }

    private var scrollView: UIScrollView? { nativeView as? UIScrollView }

    open override func initNativeView() {
        updateScrollBarVisibility(true)
        setNativeClipToBounds()
        // UIKit defaults to automatic while NativeScript's property defaults to never.
        updateContentInsetAdjustmentBehavior()
        scrollView?.delegate = self
    }

    private func updateScrollBarVisibility(_ visible: Bool) {
        if orientation == "horizontal" { scrollView?.showsHorizontalScrollIndicator = visible } else { scrollView?.showsVerticalScrollIndicator = visible }
    }

    private func updateContentInsetAdjustmentBehavior() {
        switch contentInsetAdjustmentBehavior {
        case "automatic": scrollView?.contentInsetAdjustmentBehavior = .automatic
        case "scrollableAxes": scrollView?.contentInsetAdjustmentBehavior = .scrollableAxes
        case "always": scrollView?.contentInsetAdjustmentBehavior = .always
        default: scrollView?.contentInsetAdjustmentBehavior = .never
        }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "orientation":
            orientation = (value as? String) == "horizontal" ? "horizontal" : "vertical"
            requestLayout()
        case "scrollBarIndicatorVisible":
            updateScrollBarVisibility(toBool(value) ?? true)
        case "isScrollEnabled":
            scrollView?.isScrollEnabled = toBool(value) ?? true
        case "iosContentInsetAdjustmentBehavior":
            contentInsetAdjustmentBehavior = (value as? String) ?? "never"
            updateContentInsetAdjustmentBehavior()
        default:
            super.setProperty(name, value)
        }
    }

    open override func setNativeClipToBounds() {
        nativeView?.clipsToBounds = true
    }

    public func scrollViewDidScroll(_ scrollView: UIScrollView) {
        emit("scroll", Double(orientation == "horizontal" ? scrollView.contentOffset.x : scrollView.contentOffset.y))
    }

    public var horizontalOffset: Double { Double(scrollView?.contentOffset.x ?? 0) }
    public var verticalOffset: Double { Double(scrollView?.contentOffset.y ?? 0) }

    public var scrollableWidth: Double {
        guard let scrollView, orientation == "horizontal" else { return 0 }
        return max(0, Double(scrollView.contentSize.width - scrollView.bounds.size.width))
    }

    public var scrollableHeight: Double {
        guard let scrollView, orientation == "vertical" else { return 0 }
        return max(0, Double(scrollView.contentSize.height - scrollView.bounds.size.height))
    }

    private var isScrollEnabled: Bool { toBool(applied["isScrollEnabled"]) ?? true }

    public func scrollToVerticalOffset(_ value: Double, _ animated: Bool? = nil) {
        guard let scrollView, orientation == "vertical", isScrollEnabled else { return }
        guard CorePatches.clampedScrollOffsets else {
            let bounds = scrollView.bounds.size
            return scrollView.scrollRectToVisible(CGRect(x: 0, y: value, width: bounds.width, height: bounds.height), animated: animated ?? false)
        }
        let inset = scrollView.adjustedContentInset
        let lower = -Double(inset.top)
        let upper = max(lower, Double(scrollView.contentSize.height + inset.bottom - scrollView.bounds.size.height))
        scrollView.setContentOffset(CGPoint(x: scrollView.contentOffset.x, y: min(max(value, lower), upper)), animated: animated ?? false)
    }

    public func scrollToHorizontalOffset(_ value: Double, _ animated: Bool? = nil) {
        guard let scrollView, orientation == "horizontal", isScrollEnabled else { return }
        guard CorePatches.clampedScrollOffsets else {
            let bounds = scrollView.bounds.size
            return scrollView.scrollRectToVisible(CGRect(x: value, y: 0, width: bounds.width, height: bounds.height), animated: animated ?? false)
        }
        let inset = scrollView.adjustedContentInset
        let lower = -Double(inset.left)
        let upper = max(lower, Double(scrollView.contentSize.width + inset.right - scrollView.bounds.size.width))
        scrollView.setContentOffset(CGPoint(x: min(max(value, lower), upper), y: scrollView.contentOffset.y), animated: animated ?? false)
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        contentMeasuredWidth = effectiveMinWidth
        contentMeasuredHeight = effectiveMinHeight
        if let child = layoutView {
            let size = orientation == "vertical"
                ? ViewHelper.measureChild(self, child, widthMeasureSpec, LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified))
                : ViewHelper.measureChild(self, child, LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified), heightMeasureSpec)
            contentMeasuredWidth = max(size.width, effectiveMinWidth)
            contentMeasuredHeight = max(size.height, effectiveMinHeight)
        }
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(contentMeasuredWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(contentMeasuredHeight, height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        guard let scrollView else { return }
        let insets = contentInsetAdjustmentBehavior != "never" ? Position(left: 0, top: 0, right: 0, bottom: 0) : safeAreaInsetsPosition()
        var scrollWidth = right - left - insets.right - insets.left
        var scrollHeight = bottom - top - insets.bottom - insets.top
        var scrollInsetWidth = scrollWidth + insets.left + insets.right
        var scrollInsetHeight = scrollHeight + insets.top + insets.bottom
        if orientation == "horizontal" {
            scrollInsetWidth = max(contentMeasuredWidth + insets.left + insets.right, scrollInsetWidth)
            scrollWidth = max(contentMeasuredWidth, scrollWidth)
        } else {
            scrollInsetHeight = max(contentMeasuredHeight + insets.top + insets.bottom, scrollInsetHeight)
            scrollHeight = max(contentMeasuredHeight, scrollHeight)
        }
        scrollView.contentSize = CGSize(width: LayoutHelper.toDeviceIndependentPixels(scrollInsetWidth), height: LayoutHelper.toDeviceIndependentPixels(scrollInsetHeight))
        ViewHelper.layoutChild(self, layoutView, insets.left, insets.top, insets.left + scrollWidth, insets.top + scrollHeight)
    }
}
