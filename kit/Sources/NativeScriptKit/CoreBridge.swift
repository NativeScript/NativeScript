import UIKit

// What compiled templates call (the code generator's vocabulary), over the
// classes compiled from @nativescript/core: children are added as
// nativescript-vue's renderer adds them, properties set as the XML builder
// sets them, errors reported as core reports what nothing catches.

/// The template children of a container: its static views and its regions, in template order.
final class TemplateChildren: RegionHost {
    private weak var owner: ViewBase?
    private var parts: [RegionPart] = []
    /// The views this template put in the container, in order.
    private var placed: [ViewBase] = []

    init(_ owner: ViewBase) { self.owner = owner }

    func add(_ view: ViewBase) {
        parts.append(.view(view))
        apply()
    }

    func addRegion(_ region: Region) -> Region {
        region.host = self
        parts.append(.region(region))
        if !region.views.isEmpty { apply() }
        return region
    }

    func regionChanged(_ region: Region) { apply() }

    /// The container's children made to match the template's.
    private func apply() {
        guard let owner else { return }
        let next: [ViewBase] = parts.flatMap(\.views)
        jsReport {
            if let layout = owner as? LayoutBase {
                let kept = Set(next.map(ObjectIdentifier.init))
                for old in placed where !kept.contains(ObjectIdentifier(old)) {
                    if let view = old as? View { try layout.removeChild(view) }
                }
                for (index, view) in next.compactMap({ $0 as? View }).enumerated() {
                    let at = layout.getChildIndex(view)
                    if at == Double(index) { continue }
                    if at >= 0 { try layout.removeChild(view) }
                    _ = try layout.insertChild(view, Double(index))
                }
            } else if let page = owner as? Page {
                if let bar = next.last(where: { $0 is ActionBar }) as? ActionBar, bar !== page.actionBar { page.actionBar = bar }
                let content = next.last { !($0 is ActionBar) } as? View
                if content !== page.content { page.content = content }
            } else if let content = owner as? ContentView {
                let shown = next.last as? View
                if shown !== content.content { content.content = shown }
            } else if let frame = owner as? Frame {
                // The first page is the one shown first; a view that is not a page is wrapped in one.
                if placed.isEmpty, let first = next.first {
                    let page: Page
                    if let p = first as? Page { page = p } else { page = try Page(); page.content = first as? View }
                    let entry = JSObject([("create", { (_: [Any?]) throws -> Any? in page } as JSFunction), ("animated", false)])
                    try frame.navigate(entry)
                }
            } else {
                for view in next where !placed.contains(where: { $0 === view }) {
                    _ = try jsCallMethod(owner, "_addChildFromBuilder", jsConstructorName(view), view)
                }
            }
        }
        placed = next
    }
}

private let templateChildrenKey = JSSymbol("NativeScriptKit:templateChildren")

extension ViewBase {
    var templateChildren: TemplateChildren {
        if let found = self[jsKey: templateChildrenKey.key] as? TemplateChildren { return found }
        let made = TemplateChildren(self)
        self[jsKey: templateChildrenKey.key] = made
        return made
    }

    /// A template's child, after those before it.
    public func kitAddChild(_ child: ViewBase) { templateChildren.add(child) }

    /// A template child naming a slot (`hostSlot`) the view has: set as that property, as the driver does.
    public func kitAddTemplateChild(_ child: ViewBase) {
        if let slot = child[jsKey: "hostSlot"] as? String, jsHasKey(self, slot) { kitSet(slot, child) } else { kitAddChild(child) }
    }

    /// A run of children an `if` or `for` owns, at this point in template order.
    public func kitAddRegion() -> Region { templateChildren.addRegion(Region(host: nil)) }

    /// A region made before its container mounts it, with what it already holds.
    @discardableResult
    public func kitAddRegion(_ region: Region) -> Region { templateChildren.addRegion(region) }

    /// An attribute's value: a string goes through the property's converter, as from XML.
    public func kitSet(_ name: String, _ value: Any?) {
        jsReport { try self.set(name, value) }
    }

    /// A listener for a template's event binding.
    public func kitOn(_ eventName: String, _ handler: @escaping (EventData) -> Void) {
        jsReport { try self.on(eventName, { handler($0) }) }
    }
}

extension EventData {
    /// What an event carries beyond its name and sender (`value`, `index`…), read by name.
    public var value: Any? { self[jsKey: "value"] }
}

/// `$navigateTo(Component)`: the topmost frame shows the view the template makes.
public func kitNavigate(animated: Bool = true, _ create: @escaping () -> View) {
    jsReport {
        guard let frame = Frame.topmost() else { return }
        try frame.navigate(JSObject([("create", { (_: [Any?]) throws -> Any? in create() } as JSFunction), ("animated", animated)]))
    }
}

/// `$navigateBack()`.
public func kitNavigateBack() {
    jsReport { _ = try Frame.goBack() }
}

/// The app: its CSS, then the root view the template makes, as `Application.run({ create })` starts it.
public enum NativeScriptApplication {
    public static func run(css: String, _ root: @escaping () -> View) {
        CoreModules.initialize()
        let app: iOSApplication = Core_application_application.Application
        jsReport {
            if !css.isEmpty { try app.addCss(css) }
            try app.run(JSObject([("create", { (_: [Any?]) throws -> Any? in root() } as JSFunction)]))
        }
    }
}
