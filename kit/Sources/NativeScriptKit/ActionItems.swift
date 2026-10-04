import UIKit

/// `ActionItem` from action-bar: a bar button item of the page's navigation
/// item, rebuilt with the whole bar whenever its text, icon or visibility changes.
open class ActionItem: View {
    /// ViewBase has no CSS type: no type selector matches an action item.
    open override class var cssType: String { "" }

    weak var actionBar: ActionBar?
    /// UIBarButtonItem does not retain its target.
    var tapHandler: BarItemTapHandler?

    open override func createNativeView() -> UIView? { nil }

    var text: String { toText(applied["text"]) ?? "" }
    var icon: String? { toText(applied["icon"]) }
    var isVisible: Bool { (applied["visibility"] as? String ?? "visible") == "visible" }
    /// `ios.position`: left unless set.
    var position: String { toText(applied["ios.position"]) ?? "left" }
    var systemIcon: Int? { applied["ios.systemIcon"].flatMap { toDouble($0) }.map { Int($0) } }

    open override func propertyValueChanged(_ name: String, _ value: Any?) {
        super.propertyValueChanged(name, value)
        switch name {
        case "text", "icon": actionBar?.update()
        case "visibility": visibilityChanged()
        default: break
        }
    }

    func visibilityChanged() { actionBar?.update() }

    /// Taps come from the bar button item's action, not a gesture recognizer.
    open override func observeTap() {}

    @objc func raiseTap() { emit("tap", nil) }
}

/// `NavigationButton`: the back button's title (on the previous page's
/// navigation item), its image and its visibility.
open class NavigationButton: ActionItem {
    weak var navigationItem: UINavigationItem?

    override func visibilityChanged() {
        navigationItem?.setHidesBackButton(!isVisible, animated: true)
    }
}

/// `TapBarItemHandlerImpl`.
final class BarItemTapHandler: NSObject {
    private weak var owner: ActionItem?

    init(owner: ActionItem) {
        self.owner = owner
    }

    @objc func tap(_ sender: Any?) { owner?.raiseTap() }
}

/// An action bar's navigation button and action items (`ActionItems`).
final class ActionBarItems {
    var navigationButton: NavigationButton?
    var items: [ActionItem] = []
}

extension ActionBar {
    /// `_addChildFromBuilder` as nativescript-vue's ActionBar inserts children.
    func addBarChild(_ child: View) {
        if let button = child as? NavigationButton {
            guard barItems.navigationButton !== button else { return }
            if let old = barItems.navigationButton {
                removeView(old)
                old.actionBar = nil
            }
            barItems.navigationButton = button
            button.actionBar = self
            addView(button)
            update()
        } else if let item = child as? ActionItem {
            barItems.items.append(item)
            item.actionBar = self
            addView(item)
            update()
        }
    }

    /// The previous page's back button: titled by the navigation button, if there is one.
    func backBarButtonItem() -> UIBarButtonItem? {
        guard let button = barItems.navigationButton else { return nil }
        let handler = BarItemTapHandler(owner: button)
        button.tapHandler = handler
        return UIBarButtonItem(title: button.text, style: .plain, target: handler, action: #selector(BarItemTapHandler.tap(_:)))
    }

    var backIndicatorImage: UIImage? {
        guard let button = barItems.navigationButton, button.isVisible, button.icon != nil else { return nil }
        return ActionBar.loadIcon(button)?.withRenderingMode(.alwaysOriginal)
    }

    func updateBackButtonVisibility(_ navigationItem: UINavigationItem) {
        guard let button = barItems.navigationButton else { return }
        button.navigationItem = navigationItem
        navigationItem.setHidesBackButton(!button.isVisible, animated: false)
    }

    /// `populateMenuItems`: left items in order; right items in reverse, the first item outermost.
    func populateMenuItems(_ navigationItem: UINavigationItem) {
        var left: [UIBarButtonItem] = []
        var right: [UIBarButtonItem] = []
        for item in barItems.items where item.isVisible {
            guard let barButtonItem = createBarButtonItem(item) else { continue }
            if item.position == "left" { left.append(barButtonItem) } else { right.insert(barButtonItem, at: 0) }
        }
        navigationItem.setLeftBarButtonItems(left, animated: false)
        navigationItem.setRightBarButtonItems(right, animated: false)
        if !left.isEmpty { navigationItem.leftItemsSupplementBackButton = true }
    }

    private func createBarButtonItem(_ item: ActionItem) -> UIBarButtonItem? {
        let handler = BarItemTapHandler(owner: item)
        item.tapHandler = handler
        let action = #selector(BarItemTapHandler.tap(_:))
        let barButtonItem: UIBarButtonItem?
        if let id = item.systemIcon, let system = UIBarButtonItem.SystemItem(rawValue: id) {
            barButtonItem = UIBarButtonItem(barButtonSystemItem: system, target: handler, action: action)
        } else if let icon = item.icon, !icon.isEmpty {
            barButtonItem = ActionBar.loadIcon(item).map {
                UIBarButtonItem(image: $0.withRenderingMode(iconRenderingMode), style: .plain, target: handler, action: action)
            }
        } else {
            barButtonItem = UIBarButtonItem(title: item.text, style: .plain, target: handler, action: action)
        }
        if let barButtonItem, !item.text.isEmpty {
            barButtonItem.isAccessibilityElement = true
            barButtonItem.accessibilityLabel = item.text
            barButtonItem.accessibilityTraits = .button
        }
        return barButtonItem
    }

    private var iconRenderingMode: UIImage.RenderingMode {
        toText(applied["iosIconRenderingMode"]) == "alwaysTemplate" ? .alwaysTemplate : .alwaysOriginal
    }

    /// `loadActionIcon` for `res://`, `sys://` and file paths.
    private static func loadIcon(_ item: ActionItem) -> UIImage? {
        guard let icon = item.icon else { return nil }
        if icon.hasPrefix("res://") {
            let name = String(icon.dropFirst(6))
            return UIImage(named: name) ?? UIImage(named: name + ".jpg")
        }
        if icon.hasPrefix("sys://") { return UIImage(systemName: String(icon.dropFirst(6))) }
        if icon.hasPrefix("~/") { return UIImage(contentsOfFile: Bundle.main.bundlePath + "/app/" + icon.dropFirst(2)) }
        if icon.hasPrefix("/") { return UIImage(contentsOfFile: icon) }
        return nil
    }
}
