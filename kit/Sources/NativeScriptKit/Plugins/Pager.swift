import UIKit

// @nstudio/nativescript-ui-pager's Pager (index.ios and common): a
// UICollectionView showing one template view per page. Static `PagerItem`
// children, circular mode, auto play and transformers are not implemented.

/// `UICellView` from index.ios: fills its cell and lays the template view out to its size.
final class PagerCellContentView: UIView {
    weak var view: View?

    override func layoutSubviews() {
        super.layoutSubviews()
        guard let view, let superview else { return }
        frame = superview.bounds
        ViewHelper.layoutChild(nil, view, 0, 0, LayoutHelper.toDevicePixels(Double(bounds.width)), LayoutHelper.toDevicePixels(Double(bounds.height)))
    }
}

/// `PagerCell` from index.ios: holds one template's view.
final class PagerCell: UICollectionViewCell {
    weak var pager: Pager?
    var content: ListContent?
    var index = 0
    var contentHost: PagerCellContentView?

    override func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        if newSuperview == nil, content != nil, let pager { pager.removeContainer(self) }
    }
}

/// `UICollectionViewFlowLinearLayoutImpl` from index.ios: a drag ends on the page its velocity reaches.
final class PagerFlowLayout: UICollectionViewFlowLayout {
    weak var owner: Pager?

    override func shouldInvalidateLayout(forBoundsChange newBounds: CGRect) -> Bool { true }

    override func initialLayoutAttributesForAppearingItem(at itemIndexPath: IndexPath) -> UICollectionViewLayoutAttributes? {
        let attributes = super.initialLayoutAttributesForAppearingItem(at: itemIndexPath)
        attributes?.alpha = 1
        return attributes
    }

    override func finalLayoutAttributesForDisappearingItem(at itemIndexPath: IndexPath) -> UICollectionViewLayoutAttributes? {
        let attributes = super.finalLayoutAttributesForDisappearingItem(at: itemIndexPath)
        attributes?.alpha = 1
        return attributes
    }

    override func targetContentOffset(forProposedContentOffset proposedContentOffset: CGPoint, withScrollingVelocity velocity: CGPoint) -> CGPoint {
        guard let collectionView, let owner else {
            return super.targetContentOffset(forProposedContentOffset: proposedContentOffset, withScrollingVelocity: velocity)
        }
        let size = owner.realItemSize
        let horizontal = scrollDirection == .horizontal
        let pageLength = horizontal ? size.width + Double(minimumInteritemSpacing) : size.height
        let offset = Double(horizontal ? collectionView.contentOffset.x : collectionView.contentOffset.y)
        let approximatePage = horizontal ? offset / pageLength : max(0, offset / pageLength)
        let v = Double(horizontal ? velocity.x : velocity.y)
        let currentPage = v == 0 ? jsRound(approximatePage) : v < 0 ? approximatePage.rounded(.down) : approximatePage.rounded(.up)
        let flickVelocity = v * 0.3
        let flickedPages = abs(jsRound(flickVelocity)) <= 1 ? 0 : jsRound(flickVelocity)
        let newPageIndex = currentPage + flickedPages
        owner.nativeIndexChange(min(max(owner.getPosition(newPageIndex), 0), Double(owner.childrenCount - 1)))
        if horizontal {
            return CGPoint(x: newPageIndex * pageLength - Double(collectionView.contentInset.left), y: Double(proposedContentOffset.y))
        }
        return CGPoint(x: Double(proposedContentOffset.x), y: newPageIndex * pageLength - Double(collectionView.contentInset.top))
    }
}

/// `PagerItem` from common: a static page.
open class PagerItem: GridLayout {}

/// `Pager` from index.ios and `PagerBase` from common.
open class Pager: View, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    open override class var cssType: String { "Pager" }
    open override class var overflowsSafeArea: Bool { true }
    open override class var announcedProperties: Set<String> { ["selectedIndex"] }

    private let layout = PagerFlowLayout()
    private var collectionView: UICollectionView? { nativeView as? UICollectionView }
    private var source: ListSource?
    private var templateKeys: [String] = ["default"]
    /// Cells and the template views in them (`mMap`), in the order they were prepared.
    private var cells: [PagerCell] = []
    private var preparingCell = false
    private var isInit = false
    private var isDataDirty = false
    private var itemsChangedBeforeLoad = false
    private var lastLayoutKey: String?
    /// `_effectiveItemWidth` / `_effectiveItemHeight`, in device pixels; nil until the first layout.
    private var effectiveItemWidth: Double?
    private var effectiveItemHeight: Double?
    private var lastEvent = 0
    /// `selectedIndex` as last set, before `selectedIndexProperty`'s coercion.
    private var requestedIndex: Double = -1
    private var coercedIndex: Double = -1
    private var reportingNativeIndex = false
    private var skipIndexSetNative = false
    /// Held weakly: the indicator holds the pager (`pagerView`).
    private weak var indicatorObject: AnyObject?

    public var disableAnimation = false
    public var loadMoreCount: Double = 1

    open override func createNativeView() -> UIView? {
        layout.owner = self
        layout.scrollDirection = .horizontal
        layout.minimumInteritemSpacing = 0
        let view = UICollectionView(frame: .zero, collectionViewLayout: layout)
        view.backgroundColor = .clear
        view.autoresizesSubviews = false
        view.autoresizingMask = []
        view.showsHorizontalScrollIndicator = false
        view.showsVerticalScrollIndicator = false
        view.decelerationRate = .fast
        view.register(PagerCell.self, forCellWithReuseIdentifier: "default")
        return view
    }

    open override func initNativeView() {
        super.initNativeView()
        guard let collectionView else { return }
        collectionView.dataSource = self
        collectionView.isScrollEnabled = !disableSwipe
        if orientation == "vertical" {
            layout.scrollDirection = .vertical
            collectionView.alwaysBounceVertical = true
            collectionView.alwaysBounceHorizontal = false
        } else {
            layout.scrollDirection = .horizontal
            collectionView.alwaysBounceHorizontal = true
            collectionView.alwaysBounceVertical = false
        }
        setNativeClipToBounds()
    }

    open override func setNativeClipToBounds() { nativeView?.clipsToBounds = true }

    /// Binds the items and the templates: `render` makes the view for a template key and a row.
    public func bind<Item>(items: @escaping () -> [Item], templates: [String] = ["default"], selector: ((Item, Double) -> String)? = nil,
                           render: ((String, ListRow<Item>) -> View)? = nil) {
        let source = ItemsSource<Item, Item>(rows: nil, selector: selector, render: render, header: nil)
        self.source = source
        templateKeys = templates
        for key in templates { collectionView?.register(PagerCell.self, forCellWithReuseIdentifier: key) }
        Owner.current?.onCleanup { [weak self] in self?.disposeCells() }
        Effect { [weak self] in
            source.update(sections: [], items: items())
            untrack { self?.itemsChanged() }
        }
    }

    private func itemsChanged() {
        if isLoaded { itemsSetNative() } else { itemsChangedBeforeLoad = true }
        requestLayout()
    }

    /// `itemsProperty.setNative` and `setObservableArrayInstance`.
    private func itemsSetNative() {
        let count = childrenCount
        if count > 0 { callIndicator { try jsCallMethod($0, "setCount", Double(count)) } }
        refresh()
        if toBool(applied["preserveIndexOnItemsChange"]) ?? false {
            if isLoaded { scrollToIndexAnimated(coercedIndex, false) }
        } else {
            coerceSelectedIndex()
        }
    }

    // MARK: Properties

    public var selectedIndex: Double {
        get { coercedIndex }
        set { set("selectedIndex", newValue) }
    }

    public var indicator: Any? { indicatorObject }

    public func setIndicator(_ indicator: Any?) {
        indicatorObject = jsFlat(indicator) as AnyObject?
    }

    var orientation: String { (applied["orientation"] as? String) == "vertical" ? "vertical" : "horizontal" }
    var disableSwipe: Bool { toBool(applied["disableSwipe"]) ?? false }
    private var perPage: Double { toDouble(applied["perPage"]) ?? 1 }

    var childrenCount: Int { source?.count(in: 0) ?? 0 }
    private var lastIndex: Int { childrenCount == 0 ? 0 : childrenCount - 1 }

    /// The selected index of a position in the collection view, and the reverse (`getPosition` / `getIndex`).
    func getPosition(_ index: Double) -> Double { index }
    func getIndex(_ index: Double) -> Double { index }

    private static func parseIndex(_ value: Any?) -> Double {
        if let s = value as? String { return Double(s.trimmingCharacters(in: .whitespaces)).map { $0.rounded(.towardZero) } ?? .nan }
        return (toDouble(value) ?? -1).rounded(.towardZero)
    }

    /// `selectedIndexProperty`'s coercion: -1 without items, otherwise within them.
    private func coerced(_ value: Double) -> Double {
        guard childrenCount > 0 else { return -1 }
        return min(max(value, 0), Double(childrenCount - 1))
    }

    private func announceIndex(_ value: Double, _ oldValue: Double) {
        guard hasListeners("selectedIndexChange") else { return }
        notify(JSObject([("eventName", "selectedIndexChange"), ("object", self), ("propertyName", "selectedIndex"), ("value", value), ("oldValue", oldValue)]))
    }

    /// `selectedIndexProperty.coerce(this)`.
    private func coerceSelectedIndex() {
        let next = coerced(requestedIndex), old = coercedIndex
        guard next != old else { return }
        coercedIndex = next
        if isLoaded { scrollToIndexAnimated(next, !disableAnimation) }
        announceIndex(next, old)
    }

    /// `selectedIndexProperty.nativeValueChange(this, value)`.
    func nativeIndexChange(_ value: Double) {
        let next = coerced(value), old = coercedIndex
        reportingNativeIndex = true
        set("selectedIndex", value)
        reportingNativeIndex = false
        requestedIndex = value
        guard next != old else { return }
        coercedIndex = next
        announceIndex(next, old)
    }

    open override func propertyValueChanged(_ name: String, _ value: Any?) {
        switch name {
        case "selectedIndex":
            guard !reportingNativeIndex else { return }
            requestedIndex = Pager.parseIndex(value)
            let next = coerced(requestedIndex), old = coercedIndex
            // A loaded pager's setter calls `setNative` only when the coerced value changes.
            skipIndexSetNative = isLoaded && next == old
            guard next != old else { return }
            coercedIndex = next
            announceIndex(next, old)
        case "orientation":
            refresh()
            requestLayout()
        case "spacing", "peaking":
            requestLayout()
        default:
            super.propertyValueChanged(name, value)
        }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "selectedIndex":
            let skip = skipIndexSetNative || reportingNativeIndex
            skipIndexSetNative = false
            if !skip, isLoaded { scrollToIndexAnimated(coercedIndex, !disableAnimation) }
        case "orientation":
            layout.scrollDirection = orientation == "horizontal" ? .horizontal : .vertical
        case "disableSwipe":
            collectionView?.isScrollEnabled = !(toBool(value) ?? false)
        case "contentInsetAdjustmentBehavior":
            collectionView?.contentInsetAdjustmentBehavior = Pager.insetAdjustment(value)
        case "spacing", "peaking", "perPage", "preserveIndexOnItemsChange":
            break
        default:
            super.setProperty(name, value)
        }
    }

    private static func insetAdjustment(_ value: Any?) -> UIScrollView.ContentInsetAdjustmentBehavior {
        switch value {
        case let s as String:
            switch s {
            case "always": return .always
            case "never": return .never
            case "scrollableAxes": return .scrollableAxes
            default: return .automatic
            }
        default:
            return UIScrollView.ContentInsetAdjustmentBehavior(rawValue: Int(toDouble(value) ?? 0)) ?? .automatic
        }
    }

    open override subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "setIndicator": return { [weak self] (args: [Any?]) throws -> Any? in self?.setIndicator(jsArg(args, 0)); return nil } as JSFunction
            case "indicator": return indicator
            case "selectedIndex": return coercedIndex
            case "refresh": return { [weak self] (_: [Any?]) throws -> Any? in self?.refresh(); return nil } as JSFunction
            case "scrollToIndexAnimated":
                return { [weak self] (args: [Any?]) throws -> Any? in
                    self?.scrollToIndexAnimated(toDouble(jsArg(args, 0)) ?? 0, jsTruthy(jsArg(args, 1)))
                    return nil
                } as JSFunction
            default: return super[jsKey: key]
            }
        }
        set {
            switch key {
            case "indicator": setIndicator(newValue)
            default: super[jsKey: key] = newValue
            }
        }
    }

    private func callIndicator(_ call: (Any) throws -> Any?) {
        guard let indicator = indicatorObject, jsTruthy(indicator) else { return }
        jsReport { _ = try call(indicator) }
    }

    // MARK: Scrolling

    public func scrollToIndexAnimated(_ index: Double, _ animate: Bool) {
        guard let collectionView else { return }
        let contentSize = collectionView.contentSize
        guard (orientation == "vertical" ? contentSize.height : contentSize.width) != 0, childrenCount > 0 else { return }
        let maxMinIndex = min(max(0, index), Double(childrenCount - 1))
        if !isLoaded { return nativeIndexChange(maxMinIndex) }
        // A page that is neither shown nor being navigated to keeps its offset.
        if let page, let frame = page.frame, frame.topPage !== page { return nativeIndexChange(maxMinIndex) }
        if numberOfItems > Int(maxMinIndex) {
            collectionView.setContentOffset(CGPoint(x: 1, y: 0), animated: animate)
            collectionView.scrollToItem(at: IndexPath(item: Int(getIndex(maxMinIndex)), section: 0),
                                        at: orientation == "vertical" ? .centeredVertically : .centeredHorizontally, animated: animate)
        }
        nativeIndexChange(maxMinIndex)
    }

    private func updateScrollPosition() {
        guard let collectionView else { return }
        guard (orientation == "vertical" ? collectionView.contentSize.height : collectionView.contentSize.width) != 0 else { return }
        scrollToIndexAnimated(coercedIndex, false)
    }

    private var layoutKey: String {
        "\(effectiveItemWidth.map { js($0) } ?? "undefined")_\(effectiveItemHeight.map { js($0) } ?? "undefined")"
    }

    public func refresh() {
        guard isLoaded, let collectionView else {
            isDataDirty = true
            return
        }
        isDataDirty = false
        lastLayoutKey = layoutKey
        collectionView.reloadData()
        collectionView.collectionViewLayout.invalidateLayout()
        updateScrollPosition()
        let count = childrenCount
        callIndicator { try jsCallMethod($0, "setCount", Double(count)) }
    }

    // MARK: Loading

    open override func onLoaded() {
        super.onLoaded()
        if itemsChangedBeforeLoad {
            itemsChangedBeforeLoad = false
            itemsSetNative()
        }
        if isDataDirty, effectiveItemWidth != nil, effectiveItemHeight != nil { refresh() }
        collectionView?.delegate = self
    }

    override func unload() {
        collectionView?.delegate = nil
        super.unload()
    }

    open override func disposeNativeView() {
        collectionView?.delegate = nil
        for cell in cells { removeContainer(cell) }
        super.disposeNativeView()
    }

    private func disposeCells() {
        for cell in cells { cell.content?.owner.dispose() }
    }

    // MARK: Children

    open override func eachChildView(_ body: (View) -> Void) {
        for cell in cells { if let view = cell.content?.view { body(view) } }
    }

    /// `_removeContainer`: a cell leaving the native tree takes its view out of the pager.
    func removeContainer(_ cell: PagerCell) {
        guard let view = cell.content?.view else { return }
        emit("itemDisposing", ItemEventPayload(index: Double(cell.index), item: nil, view: view))
        let preparing = preparingCell
        preparingCell = true
        if view.parent != nil { removeView(view) }
        preparingCell = preparing
        cells.removeAll { $0 === cell }
    }

    // MARK: Measure and layout

    private func convertToSize(_ value: Any?) -> Double {
        let spec = (orientation == "horizontal" ? currentWidthMeasureSpec : currentHeightMeasureSpec) ?? 0
        let converted: Double
        switch Length(value, default: .zero) {
        case .px(let v): converted = v
        case .dip(let v): converted = LayoutHelper.toDevicePixels(v)
        case .percent(let v): converted = Double(LayoutHelper.size(spec)) * v
        case .auto: converted = 0
        }
        return converted.isNaN ? 0 : converted
    }

    private var spacing: Double { LayoutHelper.toDeviceIndependentPixels(convertToSize(applied["spacing"])) }
    private var peaking: Double { LayoutHelper.toDeviceIndependentPixels(convertToSize(applied["peaking"])) }

    /// `_getSize`: a page's size in DIPs.
    var itemSize: (width: Double, height: Double) {
        var width = LayoutHelper.toDeviceIndependentPixels(effectiveItemWidth ?? .nan)
        var height = LayoutHelper.toDeviceIndependentPixels(effectiveItemHeight ?? .nan)
        if orientation == "vertical" {
            height = (height - (spacing * 2 + peaking * 2)) / perPage
        } else {
            width = (width - (spacing * 2 + peaking * 2)) / perPage
        }
        return (width.isNaN ? 0 : width, height.isNaN ? 0 : height)
    }

    /// `_getRealWidthHeight`: the page size paging steps by, in DIPs.
    var realItemSize: (width: Double, height: Double) {
        let gaps = perPage * 2 * spacing + peaking * 2
        return ((LayoutHelper.toDeviceIndependentPixels(effectiveItemWidth ?? .nan) - gaps) / perPage,
                (LayoutHelper.toDeviceIndependentPixels(effectiveItemHeight ?? .nan) - gaps) / perPage)
    }

    open override func requestLayout() {
        if !preparingCell { super.requestLayout() }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        for cell in cells {
            guard let view = cell.content?.view, let w = view.currentWidthMeasureSpec, let h = view.currentHeightMeasureSpec else { continue }
            ViewHelper.measureChild(self, view, w, h)
        }
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        super.onLayout(left, top, right, bottom)
        effectiveItemWidth = Double(measuredWidth) - effectivePaddingLeft - effectivePaddingRight
        var height = Double(measuredHeight) - effectivePaddingTop - effectivePaddingBottom
        if iosOverflowSafeAreaEnabled {
            let insets = safeAreaInsetsPosition()
            height += insets.top + insets.bottom
        }
        effectiveItemHeight = height
        guard let collectionView else { return }
        collectionView.collectionViewLayout.invalidateLayout()
        let size = itemSize
        let width = LayoutHelper.toDevicePixels(size.width), pageHeight = LayoutHelper.toDevicePixels(size.height)
        for cell in cells {
            if let view = cell.content?.view { ViewHelper.layoutChild(self, view, 0, 0, width, pageHeight) }
        }
        if lastLayoutKey != layoutKey { refresh() }
    }

    /// `_layoutCell`: the template view measured to exactly a page.
    private func layoutCell(_ view: View) {
        let size = itemSize
        ViewHelper.measureChild(self, view,
                                LayoutHelper.makeMeasureSpec(LayoutHelper.toDevicePixels(size.width), LayoutHelper.exactly),
                                LayoutHelper.makeMeasureSpec(LayoutHelper.toDevicePixels(size.height), LayoutHelper.exactly))
    }

    /// `_prepareCell`: the cell's template view shows the item, measured.
    private func prepareCell(_ cell: PagerCell, _ indexPath: IndexPath) {
        preparingCell = true
        defer { preparingCell = false }
        guard let source else { return }
        let index = indexPath.row
        cell.pager = self
        let content: ListContent
        if let existing = cell.content {
            content = existing
            content.show(indexPath)
        } else {
            content = source.makeContent(key: source.templateKey(at: indexPath), at: indexPath)
            cell.content = content
        }
        let view = content.view
        if !cells.contains(where: { $0 === cell }) { cells.append(cell) }
        emit("itemLoading", ItemEventPayload(index: Double(index), item: source.item(at: indexPath), view: view))
        if view.parent == nil {
            addView(view)
            if let nativeView = view.nativeView {
                if iosOverflowSafeArea {
                    let host = cell.contentHost ?? PagerCellContentView()
                    cell.contentHost = host
                    host.view = view
                    host.addSubview(nativeView)
                    cell.contentView.addSubview(host)
                } else {
                    cell.contentView.addSubview(nativeView)
                }
            }
        }
        layoutCell(view)
    }

    // MARK: UICollectionViewDataSource

    public func numberOfSections(in collectionView: UICollectionView) -> Int { 1 }

    /// None until loaded: a template view joins a loaded pager.
    public func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int { numberOfItems }

    private var numberOfItems: Int { isLoaded ? childrenCount : 0 }

    public func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let key = source?.templateKey(at: indexPath) ?? "default"
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: templateKeys.contains(key) ? key : "default", for: indexPath)
        guard let cell = cell as? PagerCell else { return cell }
        cell.index = indexPath.row
        let size = itemSize
        prepareCell(cell, indexPath)
        if let view = cell.content?.view {
            view.set("iosOverflowSafeArea", iosOverflowSafeArea)
            view.set("iosIgnoreSafeArea", iosIgnoreSafeArea)
            if view.isLayoutRequired {
                ViewHelper.layoutChild(self, view, 0, 0, LayoutHelper.toDevicePixels(size.width), LayoutHelper.toDevicePixels(size.height))
            }
        }
        return cell
    }

    // MARK: UICollectionViewDelegateFlowLayout

    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        let inset = CGFloat(spacing + peaking)
        return orientation == "vertical" ? UIEdgeInsets(top: inset, left: 0, bottom: inset, right: 0) : UIEdgeInsets(top: 0, left: inset, bottom: 0, right: inset)
    }

    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let size = itemSize
        return CGSize(width: size.width, height: size.height)
    }

    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        CGFloat(spacing)
    }

    public func collectionView(_ collectionView: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
        if !isInit {
            updateScrollPosition()
            collectionView.collectionViewLayout.invalidateLayout()
            isInit = true
        }
        if source != nil, indexPath.row == lastIndex - Int(loadMoreCount) { emit("loadMoreItems", nil) }
        if cell.preservesSuperviewLayoutMargins { cell.preservesSuperviewLayoutMargins = false }
        cell.layoutMargins = .zero
    }

    public func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
        guard lastEvent == 0 else { return }
        emit("swipeStart", nil)
        lastEvent = 1
    }

    public func scrollViewDidEndScrollingAnimation(_ scrollView: UIScrollView) {
        emit("swipe", nil)
    }

    public func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let vertical = orientation == "vertical"
        let offset = Double(vertical ? scrollView.contentOffset.y : scrollView.contentOffset.x)
        let total = Double(vertical ? scrollView.contentSize.height - scrollView.bounds.height : scrollView.contentSize.width - scrollView.bounds.width)
        let progress = offset / total * Double(childrenCount - 1)
        let index = jsRound(progress)
        if index.isFinite { callIndicator { try jsCallMethod($0, "setSelection", self.getPosition(index)) } }
        if hasListeners("scroll") {
            notify(JSObject([("eventName", "scroll"), ("object", self), ("selectedIndex", progress.rounded(.down)), ("currentPosition", progress),
                             ("scrollX", Double(scrollView.contentOffset.x)), ("scrollY", Double(scrollView.contentOffset.y))]))
        }
        if lastEvent == 1 { emit("swipeOver", nil) }
    }

    public func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {
        guard lastEvent == 1 else { return }
        emit("swipeEnd", nil)
        lastEvent = 0
    }
}
