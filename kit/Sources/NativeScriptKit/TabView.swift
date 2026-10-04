import UIKit

/// `UITabBarControllerImpl` from tab-view/index.ios.
final class TabBarController: UITabBarController, UITabBarControllerDelegate {
    weak var owner: TabView?

    override func viewDidLoad() {
        super.viewDidLoad()
        extendedLayoutIncludesOpaqueBars = true
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        guard let owner else { return }
        if owner.parent == nil && !owner.isLoaded { owner.load() }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if let owner, owner.parent == nil, owner.isLoaded, presentedViewController == nil { owner.unload() }
    }

    func tabBarController(_ tabBarController: UITabBarController, shouldSelect viewController: UIViewController) -> Bool {
        tabBarController.selectedViewController !== viewController
    }

    /// `_onViewControllerShown`.
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        guard let owner, let index = tabBarController.viewControllers?.firstIndex(of: viewController) else { return }
        owner.select(index, fromUser: true)
    }
}

/// `TabViewItem`: a title, an icon and one view, loaded while its tab is selected.
open class TabViewItem: View {
    open override class var cssType: String { "TabViewItem" }

    private(set) var view: View?
    var controller: UIViewController?
    var title: String { toText(applied["title"]) ?? "" }
    var iconSource: String? { toText(applied["iconSource"]) }
    private var tabView: TabView? { parent as? TabView }

    /// The item's view, the first child it is given.
    open override func addChild(_ child: View) {
        guard view == nil else { return }
        view = child
        addView(child)
    }

    open override func eachChildView(_ body: (View) -> Void) {
        if let view { body(view) }
    }

    /// iOS loads only the selected item's view.
    open override func shouldLoad(_ child: View) -> Bool {
        guard let tabView, let index = tabView.items.firstIndex(where: { $0 === self }) else { return false }
        return index == tabView.selectedIndex
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "title", "iconSource", "textTransform": update()
        // Read when the tab view makes its tabs, as core reads `role`.
        case "role": break
        default: super.setProperty(name, value)
        }
    }

    /// `_update`: the item's tab (or, before iOS 18, its tab bar item) takes its title and icon.
    func update() {
        guard let tabView, let controller = tabView.tabBarController, let index = tabView.items.firstIndex(where: { $0 === self }) else { return }
        let title = transformedText(self.title, toText(applied["textTransform"]))
        if #available(iOS 18.0, *) {
            if let tab = controller.tab(forIdentifier: "\(index)") {
                tab.title = title
                tab.image = tabView.icon(for: self)
            }
        } else if let itemController = self.controller {
            let tabBarItem = UITabBarItem(title: title, image: tabView.icon(for: self), tag: index)
            TabViewItem.updateTitleAndIconPositions(self, tabBarItem)
            itemController.tabBarItem = tabBarItem
        }
    }

    /// `updateTitleAndIconPositions`: on a phone in portrait the icon sits above the title.
    static func updateTitleAndIconPositions(_ item: TabViewItem, _ tabBarItem: UITabBarItem) {
        let landscape = Appearance.orientation == "landscape"
        let iconAboveTitle = UIDevice.current.userInterfaceIdiom == .phone && !landscape
        if item.iconSource == nil {
            tabBarItem.titlePositionAdjustment = UIOffset(horizontal: 0, vertical: iconAboveTitle ? -20 : 0)
        }
        if item.title.isEmpty {
            tabBarItem.imageInsets = iconAboveTitle ? UIEdgeInsets(top: 6, left: 0, bottom: -6, right: 0) : .zero
        }
    }
}

/// `TabView` from tab-view/index.ios: a UITabBarController whose tabs show
/// their items' views; it fills the space it is given.
open class TabView: View {
    open override class var cssType: String { "TabView" }

    private(set) var items: [TabViewItem] = []
    var tabBarController: TabBarController? { viewController as? TabBarController }
    private var iconsCache: [String: UIImage] = [:]
    /// The index the app asked for, before it is coerced into the items' range.
    private var requestedIndex = -1
    private(set) var selectedIndex = -1

    open override func createNativeView() -> UIView? {
        let controller = TabBarController()
        controller.owner = self
        viewController = controller
        return controller.view
    }

    open override func addChild(_ child: View) {
        guard let item = child as? TabViewItem else { return }
        items.append(item)
        addView(item)
        // nativescript-vue sets `items` again for every item it inserts.
        set("items", items.map { ObjectIdentifier($0).hashValue })
        coerceSelectedIndex()
    }

    open override func eachChildView(_ body: (View) -> Void) {
        for item in items { body(item) }
    }

    open override func onLoaded() {
        tabBarController?.delegate = tabBarController
        if selectedIndex >= 0, selectedIndex < items.count, let frame = items[selectedIndex].view as? Frame { Frame.bringToTop(frame) }
    }

    open override func propertyValueChanged(_ name: String, _ value: Any?) {
        super.propertyValueChanged(name, value)
        if name == "selectedIndex" {
            requestedIndex = Int(toDouble(value) ?? -1)
            coerceSelectedIndex()
        }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "items": setViewControllers()
        case "selectedIndex": if selectedIndex > -1 { tabBarController?.selectedIndex = selectedIndex }
        case "tabTextColor", "selectedTabTextColor", "tabTextFontSize", "fontSize", "fontFamily", "fontWeight", "fontStyle":
            if name == "selectedTabTextColor" { tabBarController?.tabBar.tintColor = toColor(value) }
            updateTabBarColorsAndFonts()
        case "tabBackgroundColor":
            guard let tabBar = tabBarController?.tabBar else { return }
            let appearance = tabBar.standardAppearance
            appearance.configureWithDefaultBackground()
            appearance.backgroundColor = toColor(value)
            updateAppearance(tabBar, appearance)
        case "iosIconRenderingMode":
            iconsCache = [:]
            for item in items where item.iconSource != nil { item.update() }
        case "iosTabBarMinimizeBehavior":
            guard #available(iOS 26.0, *), let controller = tabBarController else { return }
            switch toText(value) {
            case "never": controller.tabBarMinimizeBehavior = .never
            case "onScrollDown": controller.tabBarMinimizeBehavior = .onScrollDown
            case "onScrollUp": controller.tabBarMinimizeBehavior = .onScrollUp
            default: controller.tabBarMinimizeBehavior = .automatic
            }
        case "iosBottomAccessory":
            applyBottomAccessory(value as? View)
        default:
            super.setProperty(name, value)
        }
    }

    /// `selectedIndexProperty.coerce` and its `valueChanged`: the old item's view unloads, the new one's loads.
    private func coerceSelectedIndex() {
        var value = requestedIndex
        if items.isEmpty {
            value = -1
        } else {
            value = min(max(value, 0), items.count - 1)
        }
        guard value != selectedIndex else { return }
        let old = selectedIndex
        selectedIndex = value
        if old >= 0, old < items.count { items[old].view?.unload() }
        if value >= 0, isLoaded {
            if let frame = items[value].view as? Frame { Frame.bringToTop(frame) }
            items[value].view?.load()
        }
        if isLoaded { setProperty("selectedIndex", Double(value)) }
        requestLayout()
        emit("selectedIndexChanged", nil)
    }

    /// The user selected a tab: the value comes from the native control.
    func select(_ index: Int, fromUser: Bool) {
        nativeValueChange("selectedIndex", Double(index))
    }

    /// The tab bar controller's view keeps the frame UIKit gives it.
    open override func layoutNativeView(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {}

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        setMeasuredDimension(ViewHelper.resolveSizeAndState(Double(width), width, widthMode, 0),
                             ViewHelper.resolveSizeAndState(Double(height), height, heightMode, 0))
    }

    /// `getViewController`: the view's own controller, else a layout controller hosting it.
    private func viewController(for item: TabViewItem) -> UIViewController? {
        guard let view = item.view else { return nil }
        if let own = view.viewController {
            item.controller = own
            return own
        }
        let controller = LayoutViewController(owner: view)
        if let nativeView = view.nativeView { controller.view.addSubview(nativeView) }
        view.viewController = controller
        item.controller = controller
        return controller
    }

    /// `setViewControllers`: UITabs on iOS 18 and later, tab bar items before.
    private func setViewControllers() {
        guard let controller = tabBarController else { return }
        guard #available(iOS 18.0, *) else { return setViewControllersWithItems(controller) }
        if items.isEmpty {
            controller.tabs = []
            return
        }
        var tabs: [UITab] = []
        var controllers: [UIViewController] = []
        for (index, item) in items.enumerated() {
            guard let itemController = viewController(for: item) else { continue }
            controllers.append(itemController)
            // `role: 'search'` is a UISearchTab, which iOS 26 sets apart from the other tabs.
            if toText(item.applied["role"]) == "search" {
                tabs.append(UISearchTab(title: item.title, image: icon(for: item), identifier: "\(index)") { _ in itemController })
            } else {
                tabs.append(UITab(title: item.title, image: icon(for: item), identifier: "\(index)") { _ in itemController })
            }
        }
        controller.tabs = tabs
        controller.viewControllers = controllers
        controller.customizableViewControllers = nil
    }

    private func setViewControllersWithItems(_ controller: TabBarController) {
        if items.isEmpty {
            controller.viewControllers = nil
            return
        }
        var controllers: [UIViewController] = []
        for (index, item) in items.enumerated() {
            guard let itemController = viewController(for: item) else { continue }
            let tabBarItem = UITabBarItem(title: item.title, image: icon(for: item), tag: index)
            TabViewItem.updateTitleAndIconPositions(item, tabBarItem)
            itemController.tabBarItem = tabBarItem
            controllers.append(itemController)
        }
        updateTabBarColorsAndFonts()
        controller.viewControllers = controllers
        controller.customizableViewControllers = nil
    }

    /// `_getIcon`: `sys://` symbols, `res://` assets and app files, cached by source.
    func icon(for item: TabViewItem) -> UIImage? {
        guard let source = item.iconSource else { return nil }
        if let cached = iconsCache[source] { return cached }
        let image: UIImage?
        if source.hasPrefix("sys://") {
            image = UIImage(systemName: String(source.dropFirst(6)))
        } else if source.hasPrefix("res://") {
            image = UIImage(named: String(source.dropFirst(6)))
        } else if source.hasPrefix("~/") {
            image = UIImage(contentsOfFile: Bundle.main.bundlePath + "/app/" + source.dropFirst(2))
        } else {
            image = UIImage(contentsOfFile: source)
        }
        let mode: UIImage.RenderingMode
        switch toText(applied["iosIconRenderingMode"]) {
        case "alwaysOriginal": mode = .alwaysOriginal
        case "alwaysTemplate": mode = .alwaysTemplate
        default: mode = .automatic
        }
        let rendered = image?.withRenderingMode(mode)
        if let rendered { iconsCache[source] = rendered }
        return rendered
    }

    /// `_updateIOSTabBarColorsAndFonts` with `getTitleAttributesForStates`.
    private func updateTabBarColorsAndFonts() {
        guard !items.isEmpty, let tabBar = tabBarController?.tabBar else { return }
        var font = Font()
        font.family = toText(applied["fontFamily"])
        font.size = toDouble(applied["fontSize"])
        font.weight = toText(applied["fontWeight"]) ?? "normal"
        font.style = toText(applied["fontStyle"]) ?? "normal"
        if let size = toDouble(applied["tabTextFontSize"]) { font.size = size }
        let nativeFont = font.uiFont(default: .systemFont(ofSize: UIFont.labelFontSize))
        var normal: [NSAttributedString.Key: Any] = [.font: nativeFont]
        var selected: [NSAttributedString.Key: Any] = [.font: nativeFont]
        if let color = toColor(applied["tabTextColor"]) { normal[.foregroundColor] = color }
        if let color = toColor(applied["selectedTabTextColor"]) { selected[.foregroundColor] = color }
        let appearance = tabBar.standardAppearance
        for item in [appearance.stackedLayoutAppearance, appearance.inlineLayoutAppearance, appearance.compactInlineLayoutAppearance] {
            item.normal.titleTextAttributes = normal
            item.selected.titleTextAttributes = selected
        }
        updateAppearance(tabBar, appearance)
    }

    private var bottomAccessoryView: View?

    /// `_applyBottomAccessory` (iOS 26): the view measured at the tab bar's width, at least 44 high, in a `UITabAccessory`.
    private func applyBottomAccessory(_ view: View?) {
        guard #available(iOS 26.0, *), let controller = tabBarController else { return }
        guard let view else {
            controller.setBottomAccessory(nil, animated: false)
            bottomAccessoryView?.unload()
            bottomAccessoryView = nil
            return
        }
        if !view.isLoaded { view.load() }
        guard let content = view.nativeView else { return }
        content.translatesAutoresizingMaskIntoConstraints = true
        var width = Double(controller.tabBar.frame.width > 0 ? controller.tabBar.frame.width : UIScreen.main.bounds.width)
        let insets = controller.tabBar.safeAreaInsets
        if insets.left + insets.right > 0 && Double(insets.left + insets.right) < width { width -= Double(insets.left + insets.right) }
        let widthPx = floor(LayoutHelper.toDevicePixels(width))
        view.measure(LayoutHelper.makeMeasureSpec(widthPx, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(0, LayoutHelper.unspecified))
        let height = max(44, LayoutHelper.toDeviceIndependentPixels(Double(view.measuredHeight)))
        let container = TabAccessoryContainer(owner: view)
        container.translatesAutoresizingMaskIntoConstraints = true
        container.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        container.clipsToBounds = true
        container.addSubview(content)
        let constraint = container.heightAnchor.constraint(equalToConstant: height)
        constraint.priority = UILayoutPriority(999)
        NSLayoutConstraint.activate([constraint])
        controller.setBottomAccessory(UITabAccessory(contentView: container), animated: false)
        controller.tabBar.setNeedsLayout()
        controller.tabBar.layoutIfNeeded()
        bottomAccessoryView = view
    }

    private func updateAppearance(_ tabBar: UITabBar, _ appearance: UITabBarAppearance) {
        tabBar.standardAppearance = appearance
        tabBar.scrollEdgeAppearance = appearance
    }
}

/// `NSTabAccessoryContainer`: lays the accessory's view out at its own bounds on every layout pass.
private final class TabAccessoryContainer: UIView {
    private weak var owner: View?

    init(owner: View) {
        self.owner = owner
        super.init(frame: .zero)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func traitCollectionDidChange(_ previous: UITraitCollection?) {
        super.traitCollectionDidChange(previous)
        guard let previous, traitCollection.horizontalSizeClass != previous.horizontalSizeClass else { return }
        invalidateIntrinsicContentSize()
        setNeedsLayout()
        layoutIfNeeded()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard let owner, let native = owner.nativeView else { return }
        native.frame = bounds
        let wp = floor(LayoutHelper.toDevicePixels(Double(bounds.width)))
        let hp = floor(LayoutHelper.toDevicePixels(Double(bounds.height)))
        owner.measure(LayoutHelper.makeMeasureSpec(wp, LayoutHelper.exactly), LayoutHelper.makeMeasureSpec(hp, LayoutHelper.exactly))
        owner.layout(0, 0, wp, hp)
    }
}
