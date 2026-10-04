import UIKit

/// What an event handler receives: `args.eventName`, `args.object`, `args.value`.
public struct EventData {
    public let eventName: String
    public let object: View
    public let value: Any?

    public init(eventName: String, object: View, value: Any?) {
        self.eventName = eventName
        self.object = object
        self.value = value
    }
}

/// `View` from @nativescript/core (view-base, view-common and view/index.ios):
/// properties, CSS, the measure/layout pass and the native view it drives.
open class View: NSObject {
    open class var cssType: String { "View" }
    /// Containers (layouts, content views) extend past the safe area: NativeScript's `ContainerView`.
    open class var overflowsSafeArea: Bool { false }

    var cssType: String { type(of: self).cssType }

    public internal(set) var nativeView: UIView?
    var viewController: UIViewController?
    public internal(set) weak var parent: View?

    public var className: String = "" {
        didSet {
            classes = Set(className.split(whereSeparator: { $0 == " " || $0 == "\t" || $0 == "\n" }).map(String.init))
            if isLoaded { onCssStateChange() }
        }
    }
    var classes: Set<String> = []
    /// Classes the application sets on its root view (`ns-root`, `ns-dark`).
    var rootClasses: Set<String> = [] {
        didSet { if isLoaded { onCssStateChange() } }
    }
    var cssClasses: Set<String> { rootClasses.isEmpty ? classes : classes.union(rootClasses) }
    var pseudoClasses: Set<String> = ["normal"]
    /// The views and keys (attribute names, `:pseudo-class`) this view's match depends on.
    var cssSubscriptions: [(node: Weak<View>, key: String)] = []
    /// The views whose match depends on a key of this one, with a count per key.
    var cssDependents: [String: [Weak<View>]] = [:]
    var isUpdatingDynamicState = false

    // A property's value: the local one (template attribute or binding) wins
    // over CSS, which wins over the parent's for inherited properties.
    private var locals: [String: Any] = [:]
    /// Values a CSS keyframe animation sets (`style['keyframe:<name>']`); they win over local ones.
    private var keyframeValues: [String: Any] = [:]
    private var keyframeAnimations: [KeyframeAnimation] = []
    private var cssValues: [String: Any] = [:]
    private var cssOrder: [String] = []
    var applied: [String: Any] = [:]

    static let inheritedProperties: Set<String> = [
        "color", "fontFamily", "fontSize", "fontStyle", "fontWeight", "textAlignment", "textTransform",
        "whiteSpace", "letterSpacing", "lineHeight", "tintColor", "iosOverflowSafeAreaEnabled", "iosIgnoreSafeArea",
    ]

    /// The names NativeScript registers as style (CSS) properties; every other name is a view property.
    static let styleProperties: Set<String> = [
        "accessibilityLanguage", "accessibilityLiveRegion", "accessibilityRole", "accessibilityState", "accessibilityStep", "accessible",
        "alignContent", "alignItems", "alignSelf", "androidContentInsetLeft", "androidContentInsetRight", "androidDynamicElevationOffset",
        "androidElevation", "androidSelectedTabHighlightColor", "androidStatusBarBackground", "backgroundColor", "backgroundImage",
        "backgroundInternal", "backgroundPosition", "backgroundRepeat", "backgroundSize", "borderBottomColor", "borderBottomLeftRadius",
        "borderBottomRightRadius", "borderBottomWidth", "borderLeftColor", "borderLeftWidth", "borderRightColor", "borderRightWidth",
        "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius", "borderTopWidth", "boxShadow", "clipPath", "color", "columnGap",
        "cornerShape", "direction", "flexDirection", "flexGrow", "flexShrink", "flexWrap", "flexWrapBefore", "fontFamily", "fontInternal",
        "fontScaleInternal", "fontSize", "fontStyle", "fontVariationSettings", "fontWeight", "height", "horizontalAlignment", "iconFontFamily",
        "iosAccessibilityAdjustsFontSize", "iosAccessibilityMaxFontScale", "iosAccessibilityMinFontScale", "justifyContent", "letterSpacing",
        "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "maxHeight", "maxLines", "maxWidth", "minHeight", "minWidth",
        "opacity", "order", "paddingBottom", "paddingInternal", "paddingLeft", "paddingRight", "paddingTop", "perspective", "placeholderColor",
        "rotate", "rotateX", "rotateY", "rowGap", "scaleX", "scaleY", "selectedBackgroundColor", "selectedTabTextColor", "selectedTextColor",
        "separatorColor", "statusBarStyle", "tabBackgroundColor", "tabTextColor", "tabTextFontSize", "textAlignment", "textDecoration",
        "textOverflow", "textShadow", "textStroke", "textTransform", "tintColor", "translateX", "translateY", "verticalAlignment",
        "visibility", "whiteSpace", "width", "zIndex",
        // `textWrap` sets the `whiteSpace` style property.
        "textWrap",
    ]

    /// NativeScript stores a view's values until it is loaded, then applies them
    /// once (`applyAllNativeSetters`): view properties, then style properties,
    /// each in the order a value was first set. CSS is matched at load.
    public private(set) var isLoaded = false
    private var pendingNames: [String] = []
    private var pendingSet: Set<String> = []
    /// A CSS re-match is one `_batchUpdate`: its values apply in the order they were set.
    private var isBatching = false

    private var handlers: [String: [(EventData) -> Void]] = [:]
    var gestureObservers: [GesturesObserver] = []

    // MARK: Layout state (ui/core/view/index.ios)

    private static let forceLayout = 1
    private static let measuredDimensionSet = 1 << 1
    private static let layoutRequired = 1 << 2
    private var privateFlags = View.layoutRequired | View.forceLayout

    var currentWidthMeasureSpec: Int?
    var currentHeightMeasureSpec: Int?
    private var measuredWidthAndState = 0
    private var measuredHeightAndState = 0
    private var oldLeft: Double?, oldTop: Double?, oldRight: Double?, oldBottom: Double?
    private var cachedFrame: CGRect?
    private var isLaidOut = false
    var isTransformed = false
    /// An animation's start sets model values while its presentation layer animates.
    var presentationLayerSuspensions = 0
    var isPresentationLayerUpdateSuspended: Bool { presentationLayerSuspensions > 0 || !isLoaded || isBatching }

    var styleWidth = Length.auto, styleHeight = Length.auto
    var styleMaxWidth = Length.auto, styleMaxHeight = Length.auto
    var styleMarginTop = Length.zero, styleMarginRight = Length.zero, styleMarginBottom = Length.zero, styleMarginLeft = Length.zero
    var horizontalAlignment = "stretch"
    var verticalAlignment = "stretch"
    var isCollapsed = false

    var effectiveWidth: Double = 0, effectiveHeight: Double = 0
    var effectiveMinWidth: Double = 0, effectiveMinHeight: Double = 0
    var effectiveMaxWidth = Double.infinity, effectiveMaxHeight = Double.infinity
    var effectiveMarginTop: Double = 0, effectiveMarginRight: Double = 0, effectiveMarginBottom: Double = 0, effectiveMarginLeft: Double = 0
    var effectiveBorderTopWidth: Double = 0, effectiveBorderRightWidth: Double = 0, effectiveBorderBottomWidth: Double = 0, effectiveBorderLeftWidth: Double = 0

    var defaultPaddingTop: Double = 0, defaultPaddingRight: Double = 0, defaultPaddingBottom: Double = 0, defaultPaddingLeft: Double = 0
    private var paddingTop: Double?, paddingRight: Double?, paddingBottom: Double?, paddingLeft: Double?
    var effectivePaddingTop: Double { paddingTop ?? defaultPaddingTop }
    var effectivePaddingRight: Double { paddingRight ?? defaultPaddingRight }
    var effectivePaddingBottom: Double { paddingBottom ?? defaultPaddingBottom }
    var effectivePaddingLeft: Double { paddingLeft ?? defaultPaddingLeft }

    var row = 0, col = 0, rowSpan = 1, colSpan = 1

    var background = Background()
    enum BackgroundState { case unset, invalid, drawn }
    private(set) var nativeBackgroundState = BackgroundState.unset
    private var defaultBackgroundColor: UIColor?

    public override init() {
        super.init()
        nativeView = createNativeView()
        defaultBackgroundColor = nativeView?.backgroundColor
        initNativeView()
    }

    open func createNativeView() -> UIView? { nil }
    open func initNativeView() {}

    // MARK: Children

    /// Adds a template child. Containers override; other views ignore children.
    open func addChild(_ child: View) {}

    open func eachChildView(_ body: (View) -> Void) {}

    func addView(_ child: View) {
        child.parent = self
        for name in View.inheritedProperties { child.refresh(name) }
        if isLoaded { child.load() }
    }

    func removeView(_ child: View) {
        child.unload()
        if child.parent === self { child.parent = nil }
    }

    // MARK: Loading (view-base onLoaded / onUnloaded)

    func load() {
        guard !isLoaded else { return }
        matchCSS()
        isLoaded = true
        let names = pendingNames
        pendingNames = []
        pendingSet = []
        for name in names where !View.styleProperties.contains(name) { setProperty(name, applied[name]) }
        for name in names where View.styleProperties.contains(name) { setProperty(name, applied[name]) }
        onLoaded()
        eachChildView { $0.load() }
    }

    func unload() {
        guard isLoaded else { return }
        unsubscribeFromDynamicUpdates()
        stopKeyframeAnimations()
        isLoaded = false
        eachChildView { $0.unload() }
    }

    open func onLoaded() {}

    /// Defers a name's application to the next load or batch end, at its first-set position.
    private func deferApplication(_ name: String) {
        if pendingSet.insert(name).inserted { pendingNames.append(name) }
    }

    // MARK: Properties

    /// Sets a local property value by its NativeScript name; nil unsets it.
    public func set(_ name: String, _ value: Any?) {
        for (longhand, v) in expandShorthand(name, value) where hasStyleAccessor(longhand) {
            if let v { locals[longhand] = v } else { locals.removeValue(forKey: longhand) }
            refresh(longhand)
        }
    }

    /// A template sets `view[name]`, which reaches a style property only through
    /// an accessor NativeScript defines on the view's class; without one the
    /// value lands on the JavaScript object and styles nothing.
    private func hasStyleAccessor(_ name: String) -> Bool {
        switch name {
        case "backgroundInternal", "clipPath", "cornerShape", "fontInternal", "fontScaleInternal", "iconFontFamily",
             "paddingInternal", "placeholderColor", "zIndex":
            return false
        case "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariationSettings", "textDecoration":
            return self is TextBase || self is Span || self is FormattedString
        case "letterSpacing", "lineHeight", "maxLines", "textAlignment", "textOverflow", "textShadow", "textStroke", "whiteSpace":
            return self is TextBase
        case "paddingTop", "paddingRight", "paddingBottom", "paddingLeft":
            return self is TextBase || self is LayoutBase
        case "alignContent", "alignItems", "flexDirection", "flexWrap", "justifyContent", "rowGap", "columnGap":
            return self is FlexboxLayout
        case "tintColor": return self is Image
        case "selectedBackgroundColor", "selectedTextColor": return self is SegmentedBar
        case "accessibilityStep": return self is Slider
        default: return true
        }
    }

    /// `CssState.updateDynamicState`: keyframe animations stop, the matched values
    /// are set (`setPropertyValues`: removed ones unset first, in their old order,
    /// then the matched ones in cascade order), and the matched animations play.
    private func matchCSS() {
        stopKeyframeAnimations()
        let match = StyleSheet.app.match(self)
        let next = match.values
        let removed = cssOrder.filter { name in !next.contains { $0.name == name } }
        cssValues = Dictionary(next.map { ($0.name, $0.value) }, uniquingKeysWith: { $1 })
        cssOrder = next.map(\.name)
        for name in removed { refresh(name) }
        for name in cssOrder { refresh(name) }
        keyframeAnimations = match.animations
        for animation in keyframeAnimations { animation.play(self) }
        subscribe(match.changes)
    }

    private func stopKeyframeAnimations() {
        guard !keyframeAnimations.isEmpty else { return }
        for animation in keyframeAnimations where animation.isPlaying { animation.cancel() }
        keyframeAnimations = []
        for name in ["rotate", "rotateX", "rotateY", "scaleX", "scaleY", "translateX", "translateY", "backgroundColor", "opacity"] {
            setKeyframe(name, nil)
        }
    }

    func applyCSS() {
        isBatching = true
        matchCSS()
        isBatching = false
        let names = pendingNames
        pendingNames = []
        pendingSet = []
        for name in names { setProperty(name, applied[name]) }
    }

    func setKeyframe(_ name: String, _ value: Any?) {
        if let value { keyframeValues[name] = value } else { keyframeValues.removeValue(forKey: name) }
        refresh(name)
    }

    func refresh(_ name: String) {
        var value: Any? = keyframeValues[name] ?? locals[name] ?? cssValues[name]
        if value == nil, View.inheritedProperties.contains(name) { value = parent?.applied[name] }
        let had = applied[name] != nil
        if !had && value == nil { return }
        if had && sameValue(value, applied[name]) { return }
        applied[name] = value
        propertyValueChanged(name, value)
        if isLoaded && !isBatching { setProperty(name, value) } else { deferApplication(name) }
        notifyCSSDependents(name)
        if View.inheritedProperties.contains(name) { eachChildView { $0.refresh(name) } }
    }

    /// The value a native control reports (user input): stored without being
    /// written back, then announced as `<name>Change`, NativeScript's `nativeValueChange`.
    func nativeValueChange(_ name: String, _ value: Any) {
        if sameValue(value, applied[name]) { return }
        locals[name] = value
        applied[name] = value
        propertyValueChanged(name, value)
        emit(name + "Change", value)
        notifyCSSDependents(name)
    }

    /// A property's `valueChanged`: runs when the value changes, loaded or not,
    /// unlike `setProperty` (the native setter), which waits for load.
    open func propertyValueChanged(_ name: String, _ value: Any?) {
        switch name {
        case "isEnabled":
            if toBool(value) ?? true { removeVisualState("disabled") } else { addVisualState("disabled") }
        case "id":
            onCssStateChange()
        case "checked" where self is Switch:
            if toBool(value) ?? false { addVisualState("checked") } else { removeVisualState("checked") }
        default:
            break
        }
    }

    /// Applies an effective value; subclasses handle their own names and pass the rest up.
    open func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "width": styleWidth = Length(value, default: .auto); requestLayout()
        case "height": styleHeight = Length(value, default: .auto); requestLayout()
        case "maxWidth": styleMaxWidth = Length(value, default: .auto); requestLayout()
        case "maxHeight": styleMaxHeight = Length(value, default: .auto); requestLayout()
        case "minWidth": effectiveMinWidth = Length(value, default: .zero).toDevicePixels(auto: 0); requestLayout()
        case "minHeight": effectiveMinHeight = Length(value, default: .zero).toDevicePixels(auto: 0); requestLayout()
        case "marginTop": styleMarginTop = Length(value, default: .zero); requestLayout()
        case "marginRight": styleMarginRight = Length(value, default: .zero); requestLayout()
        case "marginBottom": styleMarginBottom = Length(value, default: .zero); requestLayout()
        case "marginLeft": styleMarginLeft = Length(value, default: .zero); requestLayout()
        case "paddingTop", "paddingRight", "paddingBottom", "paddingLeft":
            let px = value.map { Length($0, default: .zero).toDevicePixels(auto: 0) }
            switch name {
            case "paddingTop": paddingTop = px
            case "paddingRight": paddingRight = px
            case "paddingBottom": paddingBottom = px
            default: paddingLeft = px
            }
            paddingChanged()
            requestLayout()
        case "horizontalAlignment":
            horizontalAlignment = (value as? String)?.trimmingCharacters(in: .whitespaces) ?? "stretch"
            requestLayout()
        case "verticalAlignment":
            let v = (value as? String)?.trimmingCharacters(in: .whitespaces).lowercased() ?? "stretch"
            verticalAlignment = v == "center" ? "middle" : v
            requestLayout()
        case "backgroundColor":
            background.color = toColor(value)
            backgroundInternalChanged()
        case "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth":
            let px = Length(value, default: .zero).toDevicePixels(auto: 0)
            switch name {
            case "borderTopWidth": effectiveBorderTopWidth = px; background.borderTopWidth = px
            case "borderRightWidth": effectiveBorderRightWidth = px; background.borderRightWidth = px
            case "borderBottomWidth": effectiveBorderBottomWidth = px; background.borderBottomWidth = px
            default: effectiveBorderLeftWidth = px; background.borderLeftWidth = px
            }
            borderWidthChanged()
            backgroundInternalChanged()
            requestLayout()
        case "borderTopColor": background.borderTopColor = toColor(value); backgroundInternalChanged()
        case "borderRightColor": background.borderRightColor = toColor(value); backgroundInternalChanged()
        case "borderBottomColor": background.borderBottomColor = toColor(value); backgroundInternalChanged()
        case "borderLeftColor": background.borderLeftColor = toColor(value); backgroundInternalChanged()
        case "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius":
            let px = Length(value, default: .zero).toDevicePixels(auto: 0)
            switch name {
            case "borderTopLeftRadius": background.borderTopLeftRadius = px
            case "borderTopRightRadius": background.borderTopRightRadius = px
            case "borderBottomRightRadius": background.borderBottomRightRadius = px
            default: background.borderBottomLeftRadius = px
            }
            backgroundInternalChanged()
            requestLayout()
        case "opacity":
            CATransaction.begin()
            CATransaction.setDisableActions(true)
            nativeView?.alpha = CGFloat(toDouble(value) ?? 1)
            CATransaction.setDisableActions(false)
            CATransaction.commit()
        case "visibility":
            let v = (value as? String)?.lowercased() ?? "visible"
            isCollapsed = v == "collapse" || v == "collapsed"
            nativeView?.isHidden = v != "visible"
            requestLayout()
        case "isEnabled":
            let enabled = toBool(value) ?? true
            if let control = nativeView as? UIControl { control.isEnabled = enabled } else { nativeView?.isUserInteractionEnabled = enabled }
        case "isUserInteractionEnabled":
            nativeView?.isUserInteractionEnabled = toBool(value) ?? true
        case "row": row = max(0, Int(toDouble(value) ?? 0)); (parent as? GridLayout)?.invalidate()
        case "col", "column": col = max(0, Int(toDouble(value) ?? 0)); (parent as? GridLayout)?.invalidate()
        case "rowSpan": rowSpan = max(1, Int(toDouble(value) ?? 1)); (parent as? GridLayout)?.invalidate()
        case "colSpan", "columnSpan": colSpan = max(1, Int(toDouble(value) ?? 1)); (parent as? GridLayout)?.invalidate()
        case "order", "flexGrow", "flexShrink", "alignSelf", "flexWrapBefore": (parent as? FlexboxLayout)?.requestLayout()
        case "left", "top": (parent as? AbsoluteLayout)?.requestLayout()
        case "dock": (parent as? DockLayout)?.requestLayout()
        case "translateX", "translateY", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "perspective": updateNativeTransform()
        case "originX", "originY": updateOriginPoint()
        case "zIndex": nativeView?.layer.zPosition = CGFloat(toDouble(value) ?? 0)
        default:
            break
        }
    }

    /// Padding changed: text views move it into native insets.
    open func paddingChanged() {}
    /// Border widths changed: text views move them into native insets.
    open func borderWidthChanged() {}

    var iosOverflowSafeArea: Bool { toBool(applied["iosOverflowSafeArea"]) ?? type(of: self).overflowsSafeArea }
    var iosOverflowSafeAreaEnabled: Bool { toBool(applied["iosOverflowSafeAreaEnabled"]) ?? true }
    var iosIgnoreSafeArea: Bool { toBool(applied["iosIgnoreSafeArea"]) ?? false }

    // MARK: Events

    /// Subscribes to an event: a gesture (`tap`, `pan`), or a property change such as `textChange`.
    public func on(_ event: String, _ handler: @escaping (EventData) -> Void) {
        handlers[event, default: []].append(handler)
        if event == "tap" { observeTap() } else { observeGesture(event) }
    }

    /// A tap is the tap gesture; controls with a tap event of their own override.
    open func observeTap() { observeGesture("tap") }

    func emit(_ event: String, _ value: Any?) {
        guard let list = handlers[event] else { return }
        let data = EventData(eventName: event, object: self, value: value)
        for handler in list { handler(data) }
    }

    // MARK: Measure and layout

    var isLayoutRequested: Bool { privateFlags & View.forceLayout != 0 }
    var isLayoutRequired: Bool { privateFlags & View.layoutRequired != 0 }
    var isLayoutValid: Bool { nativeView != nil && !isLayoutRequested }

    var measuredWidth: Int { measuredWidthAndState & LayoutHelper.measuredSizeMask }
    var measuredHeight: Int { measuredHeightAndState & LayoutHelper.measuredSizeMask }

    open func requestLayout() {
        privateFlags |= View.forceLayout
        parent?.requestLayout()
        nativeView?.setNeedsLayout()
        if let controller = viewController, controller.view !== nativeView { controller.view.setNeedsLayout() }
    }

    func measure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let specsChanged = setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec)
        guard nativeView != nil, isLayoutRequested || specsChanged else { return }
        privateFlags &= ~View.measuredDimensionSet
        onMeasure(widthMeasureSpec, heightMeasureSpec)
        privateFlags |= View.layoutRequired
    }

    func layout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double, setFrame: Bool = true) {
        let (boundsChanged, sizeChanged) = setCurrentLayoutBounds(left, top, right, bottom)
        if setFrame { layoutNativeView(left, top, right, bottom) }
        let needsLayout = boundsChanged || isLayoutRequired
        if needsLayout {
            // The native frame may have moved for the safe area; onLayout works from it.
            let position = nativeView.map { IOSHelper.getPositionFromFrame($0.frame) } ?? Position(left: left, top: top, right: right, bottom: bottom)
            onLayout(position.left, position.top, position.right, position.bottom)
            privateFlags &= ~View.layoutRequired
        }
        updateBackground(sizeChanged: sizeChanged, needsLayout: needsLayout)
        privateFlags &= ~View.forceLayout
    }

    func setMeasuredDimension(_ width: Int, _ height: Int) {
        measuredWidthAndState = width
        measuredHeightAndState = height
        privateFlags |= View.measuredDimensionSet
    }

    open func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        var nativeSize = CGSize.zero
        if let nativeView { nativeSize = LayoutHelper.measureNativeView(nativeView, width, widthMode, height, heightMode) }
        var measureWidth = max(Double(nativeSize.width), effectiveMinWidth)
        var measureHeight = max(Double(nativeSize.height), effectiveMinHeight)
        measureWidth = min(measureWidth, effectiveMaxWidth)
        measureHeight = min(measureHeight, effectiveMaxHeight)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(measureWidth, width, widthMode, 0),
            ViewHelper.resolveSizeAndState(measureHeight, height, heightMode, 0))
    }

    open func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {}

    @discardableResult
    func setCurrentMeasureSpecs(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) -> Bool {
        let changed = currentWidthMeasureSpec != widthMeasureSpec || currentHeightMeasureSpec != heightMeasureSpec
        currentWidthMeasureSpec = widthMeasureSpec
        currentHeightMeasureSpec = heightMeasureSpec
        return changed
    }

    private func setCurrentLayoutBounds(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) -> (Bool, Bool) {
        let boundsChanged = oldLeft != left || oldTop != top || oldRight != right || oldBottom != bottom
        var sizeChanged = true
        if let oldLeft, let oldTop, let oldRight, let oldBottom {
            sizeChanged = oldRight - oldLeft != right - left || oldBottom - oldTop != bottom - top
        }
        oldLeft = left; oldTop = top; oldRight = right; oldBottom = bottom
        return (boundsChanged, sizeChanged)
    }

    func updateEffectiveLayoutValues(_ parentWidth: Int, _ parentWidthMode: Int, _ parentHeight: Int, _ parentHeightMode: Int) {
        let availableWidth = parentWidthMode == LayoutHelper.unspecified ? -1 : Double(parentWidth)
        effectiveWidth = styleWidth.toDevicePixels(auto: -2, parentAvailable: availableWidth)
        effectiveMaxWidth = resolveEffectiveMax(styleMaxWidth, availableWidth)
        effectiveMarginLeft = styleMarginLeft.toDevicePixels(auto: 0, parentAvailable: availableWidth)
        effectiveMarginRight = styleMarginRight.toDevicePixels(auto: 0, parentAvailable: availableWidth)
        let availableHeight = parentHeightMode == LayoutHelper.unspecified ? -1 : Double(parentHeight)
        effectiveHeight = styleHeight.toDevicePixels(auto: -2, parentAvailable: availableHeight)
        effectiveMaxHeight = resolveEffectiveMax(styleMaxHeight, availableHeight)
        effectiveMarginTop = styleMarginTop.toDevicePixels(auto: 0, parentAvailable: availableHeight)
        effectiveMarginBottom = styleMarginBottom.toDevicePixels(auto: 0, parentAvailable: availableHeight)
    }

    private func resolveEffectiveMax(_ value: Length, _ available: Double) -> Double {
        if case .auto = value { return .infinity }
        if case .percent = value, available < 0 { return .infinity }
        let resolved = value.toDevicePixels(auto: .infinity, parentAvailable: available)
        return resolved < 0 ? .infinity : resolved
    }

    open func layoutNativeView(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        guard let nativeView else { return }
        setNativeViewFrame(nativeView, IOSHelper.getFrameFromPosition(Position(left: left, top: top, right: right, bottom: bottom)))
    }

    func setNativeViewFrame(_ nativeView: UIView, _ frame: CGRect) {
        let oldFrame = cachedFrame ?? nativeView.frame
        if oldFrame != frame {
            cachedFrame = frame
            modifyNativeViewFrame(nativeView, frame)
            isLaidOut = true
        } else if !isLaidOut {
            cachedFrame = frame
            isLaidOut = true
        }
    }

    func takeCachedFrame() -> CGRect? {
        defer { cachedFrame = nil }
        return cachedFrame
    }

    open func modifyNativeViewFrame(_ nativeView: UIView, _ frame: CGRect) {
        // A frame is only valid under the identity transform.
        let transform = isTransformed ? nativeView.layer.transform : nil
        if isTransformed { nativeView.layer.transform = CATransform3DIdentity }
        nativeView.frame = frame
        let adjustedFrame = applySafeAreaInsets(frame)
        if let adjustedFrame { nativeView.frame = adjustedFrame }
        if let transform { nativeView.layer.transform = transform }
        let boundsSize = (adjustedFrame ?? frame).size
        nativeView.bounds = CGRect(origin: nativeView.bounds.origin, size: boundsSize)
        nativeView.layoutIfNeeded()
    }

    func applySafeAreaInsets(_ frame: CGRect) -> CGRect? {
        if iosIgnoreSafeArea { return frame }
        if !iosOverflowSafeArea || !iosOverflowSafeAreaEnabled { return IOSHelper.shrinkToSafeArea(self, frame) }
        if nativeView?.window != nil { return IOSHelper.expandBeyondSafeArea(self, frame) }
        return nil
    }

    func getSafeAreaInsets() -> Position {
        var insets = Position(left: 0, top: 0, right: 0, bottom: 0)
        if iosIgnoreSafeArea || hasIOSManagedInsetAncestor { return insets }
        if let safe = nativeView?.safeAreaInsets {
            insets.left = LayoutHelper.round(LayoutHelper.toDevicePixels(safe.left))
            insets.top = LayoutHelper.round(LayoutHelper.toDevicePixels(safe.top))
            insets.right = LayoutHelper.round(LayoutHelper.toDevicePixels(safe.right))
            insets.bottom = LayoutHelper.round(LayoutHelper.toDevicePixels(safe.bottom))
        }
        return insets
    }

    /// An ancestor ScrollView that lets UIKit adjust content insets already applies the safe area.
    private var hasIOSManagedInsetAncestor: Bool {
        var p = parent
        while let view = p {
            if let scroll = view as? ScrollView, scroll.contentInsetAdjustmentBehavior != "never" { return true }
            p = view.parent
        }
        return false
    }

    func getLocationInWindow() -> CGPoint? {
        guard let nativeView, nativeView.window != nil else { return nil }
        return nativeView.convert(nativeView.bounds.origin, to: nil)
    }

    func layoutParent() {
        if let nativeView {
            let frame = nativeView.frame
            let left = LayoutHelper.toDevicePixels(frame.origin.x)
            let top = LayoutHelper.toDevicePixels(frame.origin.y)
            let width = LayoutHelper.toDevicePixels(frame.size.width)
            let height = LayoutHelper.toDevicePixels(frame.size.height)
            setLayoutFlags(left, top, width + left, height + top)
        }
        parent?.layoutParent()
    }

    private func setLayoutFlags(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let width = right - left, height = bottom - top
        setCurrentMeasureSpecs(LayoutHelper.makeMeasureSpec(width, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(height, LayoutHelper.exactly))
        privateFlags &= ~View.forceLayout
        setMeasuredDimension(Int(width), Int(height))
        let (boundsChanged, sizeChanged) = setCurrentLayoutBounds(left, top, right, bottom)
        updateBackground(sizeChanged: sizeChanged, needsLayout: boundsChanged)
        privateFlags &= ~View.layoutRequired
    }

    // MARK: Background (styling/background.ios)

    /// `backgroundInternalProperty.setNative`; controls that style themselves differently override.
    open func backgroundInternalChanged() {
        nativeBackgroundState = .invalid
        if isLayoutValid { redrawNativeBackground() }
    }

    private func updateBackground(sizeChanged: Bool, needsLayout: Bool) {
        if sizeChanged {
            let dependsOnSize = !background.hasUniformBorder || background.hasBorderRadius
            if nativeBackgroundState == .invalid || (nativeBackgroundState == .drawn && dependsOnSize) { redrawNativeBackground() }
        } else if nativeBackgroundState == .invalid {
            redrawNativeBackground()
        }
    }

    open func redrawNativeBackground() {
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        if let nativeView {
            if background == Background() {
                nativeView.backgroundColor = defaultBackgroundColor
            } else {
                createBackgroundUIColor { nativeView.backgroundColor = $0 }
                setNativeClipToBounds()
            }
        }
        CATransaction.setDisableActions(false)
        CATransaction.commit()
        nativeBackgroundState = .drawn
    }

    /// `ios.createBackgroundUIColor`: borders and radius go on the layer, the color to `apply`.
    func createBackgroundUIColor(_ apply: (UIColor?) -> Void) {
        guard let nativeView else { return }
        let layer = nativeView.layer
        layer.backgroundColor = nil
        let bg = background
        // Non-uniform borders are drawn by NativeScript with shape layers; this kit draws the top edge's values uniformly.
        layer.borderColor = bg.borderTopColor?.cgColor
        layer.borderWidth = CGFloat(LayoutHelper.toDeviceIndependentPixels(bg.borderTopWidth))
        let bounds = layer.bounds.size
        let radius = CGFloat(LayoutHelper.toDeviceIndependentPixels(bg.borderTopLeftRadius))
        layer.cornerRadius = min(min(bounds.width / 2, bounds.height / 2), radius)
        layer.cornerCurve = .circular
        apply(bg.color)
    }

    open func setNativeClipToBounds() {
        guard let nativeView else { return }
        nativeView.clipsToBounds = nativeView is UIScrollView || background.hasBorderWidth || background.hasBorderRadius
    }
}
