import UIKit

/// `UIViewControllerImpl` from page/index.ios: lays its page out against the
/// safe area on every layout pass and wires the page into its frame.
final class PageViewController: UIViewController {
    weak var owner: Page?
    private var runningLayout = 0
    private var didFirstLayout = false

    init(owner: Page) {
        self.owner = owner
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override func viewDidLoad() {
        super.viewDidLoad()
        extendedLayoutIncludesOpaqueBars = true
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        guard let owner else { return }
        if navigationController == nil, !owner.isLoaded, owner.parent == nil { owner.load() }
        if let frame = (navigationController as? FrameNavigationController)?.owner {
            if owner.parent == nil { frame.addView(owner) }
            frame.updateActionBar(owner)
        }
        owner.willAppear()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard let owner, let frame = (navigationController as? FrameNavigationController)?.owner else { return }
        frame.didShow(owner)
    }

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        guard runningLayout == 0, didFirstLayout, let owner else { return }
        runLayout { IOSHelper.layoutView(self, owner) }
    }

    override func viewDidLayoutSubviews() {
        runningLayout += 1
        super.viewDidLayoutSubviews()
        if let owner { IOSHelper.layoutView(self, owner) }
        runningLayout -= 1
        didFirstLayout = true
    }

    private func runLayout(_ body: () -> Void) {
        runningLayout += 1
        body()
        runningLayout -= 1
        didFirstLayout = true
    }
}

/// `Page` from page/index.ios: a view controller's root view with an action
/// bar (shown by the frame's navigation bar) and one content view.
open class Page: ContentView {
    open override class var cssType: String { "Page" }

    private(set) var controller: PageViewController!
    private(set) var actionBar: ActionBar?
    var owner: Owner?
    private var didStyleNavigationBar = false

    weak var frame: Frame? { parent as? Frame }

    open override func createNativeView() -> UIView? {
        let controller = PageViewController(owner: self)
        controller.view.backgroundColor = .systemBackground
        self.controller = controller
        viewController = controller
        return controller.view
    }

    open override func addChild(_ child: View) {
        if let bar = child as? ActionBar {
            actionBar = bar
            addView(bar)
        } else {
            setContent(child)
            // A view with its own controller (a TabView) is a child controller of the page's.
            if let childController = child.viewController { controller.addChild(childController) }
        }
    }

    open override func eachChildView(_ body: (View) -> Void) {
        if let actionBar { body(actionBar) }
        super.eachChildView(body)
    }

    func willAppear() {
        if !didStyleNavigationBar {
            didStyleNavigationBar = true
            actionBar?.applyNavigationBarStyle()
        }
        actionBar?.update()
    }

    func dispose() {
        owner?.dispose()
        owner = nil
    }

    /// The page keeps the frame its controller gives it.
    open override func layoutNativeView(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        guard let nativeView else { return }
        setNativeViewFrame(nativeView, nativeView.frame)
    }

    open override func modifyNativeViewFrame(_ nativeView: UIView, _ frame: CGRect) {}

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        let result = ViewHelper.measureChild(self, layoutView, widthMeasureSpec, heightMeasureSpec)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(max(result.width, effectiveMinWidth), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(max(result.height, effectiveMinHeight), height, heightMode, 0))
    }

    open override func onLayout(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {
        let insets = getSafeAreaInsets()
        ViewHelper.layoutChild(self, layoutView, insets.left, insets.top, right - insets.right, bottom - insets.bottom)
    }
}

/// `ActionBar` from action-bar/index.ios: the page's title and colors,
/// realized on the frame's UINavigationBar.
open class ActionBar: View {
    open override class var cssType: String { "ActionBar" }

    var title: String?
    let barItems = ActionBarItems()
    private var page: Page? { parent as? Page }

    private var navigationBar: UINavigationBar? {
        page?.frame?.controller.navigationBar
    }

    var isEmpty: Bool { (title ?? "").isEmpty && barItems.navigationButton == nil && barItems.items.isEmpty }

    open override func addChild(_ child: View) { addBarChild(child) }

    open override func eachChildView(_ body: (View) -> Void) {
        if let button = barItems.navigationButton { body(button) }
        for item in barItems.items { body(item) }
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "title":
            title = toText(value)
            guard let page else { return }
            page.frame?.updateActionBar(page)
            page.controller.navigationItem.title = title
        case "color":
            setColor(navigationBar, toColor(value))
        case "backgroundColor":
            setBackgroundColor(navigationBar, toColor(value))
            super.setProperty(name, value)
        default:
            super.setProperty(name, value)
        }
    }

    /// The bar's color and background setters run as the page loads, before `update`.
    func applyNavigationBarStyle() {
        guard let bar = navigationBar else { return }
        if let color = toColor(applied["color"]) { setColor(bar, color) }
        if let background = toColor(applied["backgroundColor"]) { setBackgroundColor(bar, background) }
    }

    open override func backgroundInternalChanged() {}

    func update() {
        guard let page, page.frame != nil, let controller = page.controller,
              let navController = controller.navigationController else { return }
        let navigationItem = controller.navigationItem
        let navigationBar = navController.navigationBar
        navigationItem.title = title
        navigationItem.titleView = nil
        if let index = navController.viewControllers.firstIndex(of: controller), index > 0 {
            navController.viewControllers[index - 1].navigationItem.backBarButtonItem = backBarButtonItem()
        }
        let image = backIndicatorImage
        let appearance = navigationBar.standardAppearance
        appearance.setBackIndicatorImage(image, transitionMaskImage: image)
        updateAppearance(navigationBar, appearance)
        updateBackButtonVisibility(navigationItem)
        populateMenuItems(navigationItem)
        setColor(navigationBar, toColor(applied["color"]))
        setBackgroundColor(navigationBar, toColor(applied["backgroundColor"]))
        let imageAppearance = navigationBar.standardAppearance
        imageAppearance.backgroundImage = nil
        updateAppearance(navigationBar, imageAppearance)
        let shadowAppearance = navigationBar.standardAppearance
        shadowAppearance.shadowColor = UINavigationBarAppearance().shadowColor
        updateAppearance(navigationBar, shadowAppearance)
        if #available(iOS 26, *) {
            navigationItem.largeTitleDisplayMode = .never
        } else {
            navigationItem.largeTitleDisplayMode = .automatic
        }
    }

    private func setColor(_ bar: UINavigationBar?, _ color: UIColor?) {
        guard let bar else { return }
        if let color {
            let attributes: [NSAttributedString.Key: Any] = [.foregroundColor: color]
            bar.standardAppearance.titleTextAttributes = attributes
            bar.titleTextAttributes = attributes
            bar.largeTitleTextAttributes = attributes
            bar.tintColor = color
        } else {
            bar.titleTextAttributes = nil
            bar.largeTitleTextAttributes = nil
            bar.tintColor = nil
        }
    }

    private func setBackgroundColor(_ bar: UINavigationBar?, _ color: UIColor?) {
        guard let bar else { return }
        let appearance = bar.standardAppearance
        appearance.backgroundColor = color
        updateAppearance(bar, appearance)
    }

    private func updateAppearance(_ bar: UINavigationBar, _ appearance: UINavigationBarAppearance) {
        bar.standardAppearance = appearance
        bar.compactAppearance = appearance
        bar.scrollEdgeAppearance = appearance
    }
}

/// `UINavigationControllerImpl` from frame/index.ios.
final class FrameNavigationController: UINavigationController {
    weak var owner: Frame?
    private let transitions = NavigationTransitions()

    override func viewDidLoad() {
        super.viewDidLoad()
        delegate = transitions
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if let owner, !owner.isLoaded, owner.parent == nil { owner.load() }
        owner?.loaded()
    }

    override var childForStatusBarStyle: UIViewController? { topViewController }
}

/// `UINavigationControllerDelegateImpl` from frame/index.ios: default navigations use UIKit's own animation.
/// Answering these keeps iOS 26's swipe back from starting anywhere in the page, as in core.
private final class NavigationTransitions: NSObject, UINavigationControllerDelegate {
    func navigationController(_ navigationController: UINavigationController, animationControllerFor operation: UINavigationController.Operation, from fromVC: UIViewController, to toVC: UIViewController) -> UIViewControllerAnimatedTransitioning? { nil }

    func navigationController(_ navigationController: UINavigationController, interactionControllerFor animationController: UIViewControllerAnimatedTransitioning) -> UIViewControllerInteractiveTransitioning? { nil }
}

/// `Frame` from frame/index.ios: a navigation stack of pages.
open class Frame: View {
    open override class var cssType: String { "Frame" }

    private static var stack: [Frame] = []
    /// The frame that navigation goes to: the most recently created one still shown.
    public static var topmost: Frame? { stack.last }

    /// `_pushInFrameStackRecursive`: a selected tab's frame receives navigation.
    static func bringToTop(_ frame: Frame) {
        stack.removeAll { $0 === frame }
        stack.append(frame)
    }

    /// The frames in a closed modal's tree stop receiving navigation.
    static func forget(_ root: View) {
        func contains(_ view: View) -> Bool {
            var current: View? = view
            while let candidate = current {
                if candidate === root { return true }
                current = candidate.parent
            }
            return false
        }
        stack.removeAll(where: contains)
    }

    let controller = FrameNavigationController()
    private var initialPage: Page?
    private(set) var currentPage: Page?
    /// The backstack and the current page, as the navigation controller shows them.
    private var pages: [Page] = []
    private var didShowInitialPage = false
    private var showNavigationBar: Bool?

    public override init() {
        super.init()
        Frame.stack.append(self)
    }

    open override func createNativeView() -> UIView? {
        controller.owner = self
        viewController = controller
        return controller.view
    }

    /// The first child is the page shown first; a non-page view is wrapped in one.
    open override func addChild(_ child: View) {
        guard initialPage == nil else { return }
        initialPage = Frame.page(for: child)
    }

    private static func page(for view: View) -> Page {
        if let page = view as? Page { return page }
        let page = Page()
        page.addChild(view)
        return page
    }

    func loaded() {
        guard !didShowInitialPage else { return }
        didShowInitialPage = true
        if let page = initialPage { navigateCore(page, animated: false) }
    }

    /// Pushes the page `create` returns. Effects created while building it end when it is popped.
    public func navigate(_ create: () -> View) {
        let owner = Owner(parent: nil)
        let page = Frame.page(for: owner.run(create))
        page.owner = owner
        navigateCore(page, animated: currentPage != nil)
    }

    private func navigateCore(_ page: Page, animated: Bool) {
        let viewController: UIViewController = page.controller
        if !animated {
            // Keeps UIKit from titling the next page's back button before the action bar sets it.
            viewController.navigationItem.backBarButtonItem = UIBarButtonItem(title: "", style: .plain, target: nil, action: nil)
        }
        if currentPage == nil && controller.viewControllers.isEmpty {
            updateActionBar(page, disableNavBarAnimation: true)
        }
        pages.append(page)
        controller.pushViewController(viewController, animated: animated)
    }

    func didShow(_ page: Page) {
        currentPage = page
        let shown = Set(controller.viewControllers.map(ObjectIdentifier.init))
        let popped = pages.filter { !shown.contains(ObjectIdentifier($0.controller)) }
        pages.removeAll { !shown.contains(ObjectIdentifier($0.controller)) }
        // A popped page's component scope ends with it.
        for page in popped {
            removeView(page)
            page.dispose()
        }
    }

    func updateActionBar(_ page: Page, disableNavBarAnimation: Bool = false) {
        let visible = controller.viewControllers.count > 1 || !(page.actionBar?.isEmpty ?? true)
        let needsPageLayout = showNavigationBar != visible
        showNavigationBar = visible
        controller.setNavigationBarHidden(!visible, animated: !disableNavBarAnimation)
        controller.navigationBar.isUserInteractionEnabled = true
        if needsPageLayout { page.requestLayout() }
    }

    open override func eachChildView(_ body: (View) -> Void) {
        if let currentPage { body(currentPage) }
    }

    open override func onMeasure(_ widthMeasureSpec: Int, _ heightMeasureSpec: Int) {
        let width = LayoutHelper.size(widthMeasureSpec), widthMode = LayoutHelper.mode(widthMeasureSpec)
        let height = LayoutHelper.size(heightMeasureSpec), heightMode = LayoutHelper.mode(heightMeasureSpec)
        setMeasuredDimension(
            ViewHelper.resolveSizeAndState(Double(width), width, widthMode, 0),
            ViewHelper.resolveSizeAndState(Double(height), height, heightMode, 0))
    }

    open override func layoutNativeView(_ left: Double, _ top: Double, _ right: Double, _ bottom: Double) {}
}
