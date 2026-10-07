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
                    // At the end, added as nativescript-vue adds it: core then appends the native view, where an index
                    // would place it below the native view at that position (a border's, which is no child).
                    if Double(index) == layout.getChildrenCount() { try layout.addChild(view) } else { _ = try layout.insertChild(view, Double(index)) }
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

    /// A listener for a template's event binding. A list's `itemTap` carries the row's item context
    /// (`item`, `index`, `even`, `odd`), as nativescript-vue's ListView adds it.
    public func kitOn(_ eventName: String, _ handler: @escaping (EventData) -> Void) {
        let list = eventName == "itemTap" ? self as? ListView : nil
        jsReport {
            try self.on(eventName, { (data: EventData?) in
                guard let data else { return }
                if let list {
                    let index = jsToNumber(data[jsKey: "index"])
                    jsReport { data[jsKey: "item"] = try list._getDataItem(index) }
                    data[jsKey: "even"] = jsMod(index, 2) == 0
                    data[jsKey: "odd"] = jsMod(index, 2) != 0
                }
                handler(data)
            })
        }
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

/// The app: its stylesheet, which core loads as `app.css`, then the root view the template makes, as `Application.run({ create })` starts it.
public enum NativeScriptApplication {
    /// The app's stylesheet as its build parsed it, for an app whose own entry runs core's `Application.run`.
    public static var cssAST: String? {
        get { CorePackages.appCSSAST }
        set { CorePackages.appCSSAST = newValue; CorePackages.installModuleLoader() }
    }

    /// The app, its stylesheet given as the AST its NativeScript build ships (`css2json-loader`'s).
    public static func run(cssAST: String, _ root: @escaping () -> View) {
        CorePackages.appCSSAST = cssAST
        run(css: "", root)
    }

    public static func run(css: String, _ root: @escaping () -> View) {
        // Console output reaches a pipe (`simctl launch --console`, Xcode) line by line, as the JS runtime's does.
        setvbuf(stdout, nil, _IOLBF, 0)
        // Promise callbacks and reactive updates run after each batch of UIKit work (an event handler, a layout pass), as the JS runtime drains microtasks after native calls into script.
        JSEventLoop.installRunLoopObserver()
        CorePackages.appCSS = css
        CorePackages.installModuleLoader()
        CoreModules.initialize()
        let app: iOSApplication = Core_application_application.Application
        Probe.traceIfRequested()
        Probe.scheduleIfRequested()
        jsReport {
            try app.run(JSObject([("create", { (_: [Any?]) throws -> Any? in root() } as JSFunction)]))
        }
    }
}

// MARK: List templates

/// A row's item and index as its template's bindings read them. A recycled
/// cell keeps its views; writing the next item re-runs only its bindings.
public final class ListRow<Item> {
    public let item: Signal<Item>
    public let index: Signal<Double>

    init(_ item: Item, _ index: Double) {
        self.item = Signal(item)
        self.index = Signal(index)
    }
}

/// nativescript-vue's item context, what its `itemTemplateSelector` receives.
public struct ListItem<T> {
    public let item: T
    public let index: Double
    public let even: Bool
    public let odd: Bool

    public init(item: T, index: Double, even: Bool, odd: Bool) {
        self.item = item
        self.index = index
        self.even = even
        self.odd = odd
    }
}

private let listRowKey = JSSymbol("NativeScriptKit:listRow")
private let listTemplateKey = JSSymbol("NativeScriptKit:listTemplate")

extension ListView {
    /// A ListView's items and the templates that render them, as nativescript-vue
    /// gives them to core: `itemTemplates` naming each template, the selector
    /// choosing a row's template, and each row's view made on `itemLoading`, where
    /// a reused cell's view is kept when its template is the row's. Core's own
    /// `default` template comes before any template a list names, so a list's
    /// templates make no views of their own.
    public func bind<Item>(items: @escaping () -> [Item], templates: [String] = ["default"], selector: ((Item, Double) -> String)? = nil,
                           render: ((String, ListRow<Item>) -> View)? = nil) {
        var current: [Item] = []
        let listOwner = Owner.current
        if render != nil {
            kitSet("itemTemplates", JSArray<Any?>(templates.map { key in
                JSObject([("key", key), ("createView", { (_: [Any?]) throws -> Any? in nil } as JSFunction)]) as Any?
            }))
        }
        if let selector {
            kitSet("itemTemplateSelector", { (args: [Any?]) throws -> Any? in
                let index = jsToNumber(args.count > 1 ? args[1] : nil)
                guard index >= 0, Int(index) < current.count else { return templates.first }
                return selector(current[Int(index)], index)
            } as JSFunction)
        }
        kitOn("itemLoading") { data in
            let index = jsToNumber(data[jsKey: "index"])
            guard index >= 0, Int(index) < current.count else { return }
            let item = current[Int(index)]
            let key = selector?(item, index) ?? templates.first ?? "default"
            if let view = data[jsKey: "view"] as? ViewBase, let row = view[jsKey: listRowKey.key] as? ListRow<Item>,
               view[jsKey: listTemplateKey.key] as? String == key {
                row.item.value = item
                row.index.value = index
                return
            }
            guard let render else { return }
            let row = ListRow(item, index)
            // Each cell's bindings live as long as the list's.
            let view = Owner(parent: listOwner).run { render(key, row) }
            view[jsKey: listRowKey.key] = row
            view[jsKey: listTemplateKey.key] = key
            data[jsKey: "view"] = view
        }
        Effect { [weak self] in
            current = items()
            let list = JSArray<Any?>(current.map { $0 as Any? })
            untrack { self?.kitSet("items", list) }
        }
    }
}
