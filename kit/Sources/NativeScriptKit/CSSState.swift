import UIKit

struct Weak<T: AnyObject> {
    weak var value: T?
    init(_ value: T) { self.value = value }
}

/// The parts of view-base and CssState that selectors read and that keep a
/// view's match current: its id, attributes, pseudo-classes and siblings,
/// and the subscriptions that re-run a match when one of them changes.
extension View {
    var cssId: String? { toText(applied["id"]) }

    /// `node[attribute]`: the property's value, or its NativeScript default.
    func attributeValue(_ name: String) -> Any? {
        if let value = applied[name] { return value }
        switch name {
        case "isEnabled", "isUserInteractionEnabled": return true
        case "visibility": return "visible"
        case "opacity", "scaleX", "scaleY", "rowSpan", "colSpan": return 1.0
        case "row", "col", "translateX", "translateY", "rotate", "rotateX", "rotateY": return 0.0
        case "originX", "originY": return 0.5
        case "text": return self is TextBase ? "" : nil
        case "checked": return self is Switch ? false : nil
        default: return nil
        }
    }

    /// `getNodePreviousDirectSibling`: siblings exist only in a layout.
    static func previousSibling(_ view: View) -> View? {
        guard let parent = view.parent as? LayoutBase, let index = parent.subViews.firstIndex(where: { $0 === view }), index > 0 else { return nil }
        return parent.subViews[index - 1]
    }

    /// `eachNodePreviousGeneralSibling`: nearest first.
    static func previousSiblings(_ view: View) -> [View] {
        guard let parent = view.parent as? LayoutBase, let index = parent.subViews.firstIndex(where: { $0 === view }) else { return [] }
        return parent.subViews[..<index].reversed()
    }

    /// `_onCssStateChange`: the view and its descendants match again.
    func onCssStateChange() {
        if isLoaded { applyCSS() }
        eachChildView { $0.onCssStateChange() }
    }

    /// `subscribeForDynamicUpdates`: re-run this view's state when a dependency changes.
    func subscribe(_ changes: CSSChanges) {
        let next = changes.entries
        let same = next.count == cssSubscriptions.count && zip(next, cssSubscriptions).allSatisfy { $0.view === $1.node.value && $0.key == $1.key }
        if same { return }
        unsubscribeFromDynamicUpdates()
        for (node, key) in next {
            cssSubscriptions.append((Weak(node), key))
            let wasObserved = !(node.cssDependents[key]?.isEmpty ?? true)
            node.cssDependents[key, default: []].append(Weak(self))
            if !wasObserved, key.hasPrefix(":") { node.observePseudoClass(String(key.dropFirst()), true) }
        }
    }

    func unsubscribeFromDynamicUpdates() {
        for (weakNode, key) in cssSubscriptions {
            guard let node = weakNode.value else { continue }
            node.cssDependents[key]?.removeAll { $0.value == nil || $0.value === self }
            if node.cssDependents[key]?.isEmpty ?? false {
                node.cssDependents[key] = nil
                if key.hasPrefix(":") { node.observePseudoClass(String(key.dropFirst()), false) }
            }
        }
        cssSubscriptions = []
    }

    /// An attribute or pseudo-class changed: the views depending on it update.
    func notifyCSSDependents(_ key: String) {
        guard let dependents = cssDependents[key] else { return }
        for dependent in dependents.compactMap(\.value) where dependent.isLoaded && !dependent.isUpdatingDynamicState {
            dependent.isUpdatingDynamicState = true
            dependent.applyCSS()
            dependent.isUpdatingDynamicState = false
        }
    }

    /// `PseudoClassHandler`: a view starts tracking a native state once a selector depends on it.
    @objc open func observePseudoClass(_ name: String, _ on: Bool) {}

    // MARK: Pseudo-classes (view-base)

    private static let pseudoClassAliases = ["highlighted": ["active", "pressed"]]

    func addPseudoClass(_ name: String) {
        for pseudo in [name] + (View.pseudoClassAliases[name] ?? []) where !pseudoClasses.contains(pseudo) {
            pseudoClasses.insert(pseudo)
            notifyCSSDependents(":" + pseudo)
        }
    }

    func deletePseudoClass(_ name: String) {
        for pseudo in [name] + (View.pseudoClassAliases[name] ?? []) where pseudoClasses.contains(pseudo) {
            pseudoClasses.remove(pseudo)
            notifyCSSDependents(":" + pseudo)
        }
    }

    func addVisualState(_ state: String) {
        deletePseudoClass("normal")
        addPseudoClass(state)
    }

    func removeVisualState(_ state: String) {
        deletePseudoClass(state)
        if pseudoClasses.isEmpty { addPseudoClass("normal") }
    }
}
