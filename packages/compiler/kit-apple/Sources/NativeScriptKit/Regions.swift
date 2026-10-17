import Foundation

/// A run of a container's children that a template's `if` or `for` owns.
/// The container keeps static children and regions in template order and
/// rebuilds its child list when a region changes (`RegionHost`). A row or
/// branch with an `if` or `for` of its own holds regions nested in this one.
public final class Region: RegionHost {
    nonisolated deinit {}
    weak var host: RegionHost?
    private var parts: [RegionPart] = []

    public init(host: RegionHost?) { self.host = host }

    public var views: [ViewBase] { parts.flatMap(\.views) }

    /// Set by `Choose` while it renders a branch: the branch's first `attach` replaces the old views.
    var replacing = false

    public func set(_ views: [ViewBase]) {
        replacing = false
        parts = views.map { .view($0) }
        host?.regionChanged(self)
    }

    public func set(parts: [RegionPart]) {
        replacing = false
        self.parts = parts
        host?.regionChanged(self)
    }

    /// Puts a view of the content being rendered in place now, for frameworks
    /// that insert views top-down; the render's result settles their order.
    public func attach(_ view: ViewBase) {
        if replacing { parts = [] }
        replacing = false
        parts.append(.view(view))
        host?.regionChanged(self)
    }

    /// A region nested in a row or branch of this one changed: so did this one.
    public func regionChanged(_ region: Region) { host?.regionChanged(self) }
}

public enum RegionPart {
    case view(ViewBase)
    case region(Region)

    var views: [ViewBase] {
        switch self {
        case .view(let view): return [view]
        case .region(let region): return region.views
        }
    }
}

/// The views of a row or branch that has an `if` or `for` of its own: its static views and nested regions, in template order.
public final class RegionFragment {
    nonisolated deinit {}
    let owner: Region
    public var parts: [RegionPart] = []

    public init(_ owner: Region) { self.owner = owner }

    public func addChild(_ view: ViewBase) { parts.append(.view(view)) }
    public func addTemplateChild(_ view: ViewBase) { addChild(view) }

    public func addRegion() -> Region {
        let region = Region(host: owner)
        parts.append(.region(region))
        return region
    }
}

/// A container whose children include regions.
public protocol RegionHost: AnyObject {
    func regionChanged(_ region: Region)
}

/// A template site whose content failed to render: the error is reported as uncaught, as the frameworks' error
/// handlers report it, and the site shows nothing while the rest of the page renders. A failure that repeats (an
/// effect re-running, every row of a list) is reported once, until the site renders again.
public final class RenderReports {
    nonisolated deinit {}
    /// Where the template is (`Home (home.vue): v-if`), named in the reported error's stack.
    let site: String
    private var last: String?

    public init(_ site: String) { self.site = site }

    public func succeeded() { last = nil }

    public func failed(_ error: Error) {
        let value = jsCaught(error)
        let key = "\(type(of: value as Any)) \(jsToString(value))"
        if key == last { return }
        last = key
        if !site.isEmpty, let object = jsFlat(value) as? JSError {
            let frame = "    at \(site)"
            let stack = object.stack
            if !stack.contains(frame) {
                let lines = stack.split(separator: "\n", maxSplits: 1, omittingEmptySubsequences: false)
                object.stack = lines.count > 1 ? "\(lines[0])\n\(frame)\n\(lines[1])" : "\(stack)\n\(frame)"
            }
        }
        jsReportUncaught(value)
    }

    /// The content `render` makes in `owner`, or none when it throws; what it made before throwing goes with `owner`.
    func parts(_ owner: Owner, _ render: () throws -> [RegionPart]) -> [RegionPart]? {
        do {
            return try owner.run(render)
        } catch {
            owner.dispose()
            failed(error)
            return nil
        }
    }
}

/// `v-if`/`v-else-if`/`v-else`, `@if`/`@else`, `{#if}`, `<Show>`, `cond && <X/>`:
/// the views of the branch `which` selects, rebuilt only when the selection changes.
public func Choose(_ region: Region, _ which: @escaping () -> Int, site: String = "", render: @escaping (Int) throws -> [ViewBase]) {
    ChooseParts(region, which, site: site) { branch in try render(branch).map { .view($0) } }
}

public func ChooseFragment(_ region: Region, _ which: @escaping () -> Int, site: String = "", render: @escaping (Int) throws -> RegionFragment) {
    ChooseParts(region, which, site: site) { branch in try render(branch).parts }
}

private func ChooseParts(_ region: Region, _ which: @escaping () -> Int, site: String, render: @escaping (Int) throws -> [RegionPart]) {
    var current: Int?
    var branch: Owner?
    let reports = RenderReports(site)
    Owner.current?.onCleanup { branch?.dispose() }
    Effect {
        let value = which()
        if value == current { return }
        current = value
        untrack {
            branch?.dispose()
            let owner = Owner(parent: nil)
            branch = owner
            region.replacing = true
            // A branch that throws stays empty until the selection changes: the effect is not run again for it.
            let parts = reports.parts(owner) { try render(value) }
            if parts != nil { reports.succeeded() }
            region.set(parts: parts ?? [])
        }
    }
}

public func If(_ region: Region, _ condition: @escaping () -> Bool, then: @escaping () throws -> [ViewBase], else otherwise: (() throws -> [ViewBase])? = nil) {
    Choose(region, { condition() ? 0 : 1 }) { $0 == 0 ? try then() : (try otherwise?() ?? []) }
}

/// `v-for`, `@for`, `{#each}`, `<For>`, `.map()`: one set of views per item,
/// kept by key across changes, so a row that stays keeps its views and state.
public func For<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String = "", render: @escaping (Item, Double) throws -> [ViewBase]) {
    ForParts(region, items, key: key, site: site) { item, index in try render(item, index).map { .view($0) } }
}

/// `For` whose rows have an `if` or `for` of their own.
public func ForFragment<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String = "", render: @escaping (Item, Double) throws -> RegionFragment) {
    ForParts(region, items, key: key, site: site) { item, index in try render(item, index).parts }
}

private func ForParts<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String, render: @escaping (Item, Double) throws -> [RegionPart]) {
    var rows: [String: (parts: [RegionPart], owner: Owner)] = [:]
    var order: [String]?
    let reports = RenderReports(site)
    Owner.current?.onCleanup { for row in rows.values { row.owner.dispose() } }
    Effect {
        let list = items()
        untrack {
            var next: [String: (parts: [RegionPart], owner: Owner)] = [:]
            var parts: [RegionPart] = []
            var keys: [String] = []
            var failed = false
            for (index, item) in list.enumerated() {
                var k = key(item, Double(index))
                // Duplicate keys still render, as the frameworks do in development.
                while next[k] != nil { k += "\u{0}" }
                // A row that throws is kept empty under its key, so later updates do not render it again.
                let row = rows.removeValue(forKey: k) ?? {
                    let owner = Owner(parent: nil)
                    let made = reports.parts(owner) { try render(item, Double(index)) }
                    if made == nil { failed = true }
                    return (made ?? [], owner)
                }()
                next[k] = row
                keys.append(k)
                parts.append(contentsOf: row.parts)
            }
            if !failed { reports.succeeded() }
            for removed in rows.values { removed.owner.dispose() }
            rows = next
            // A check that finds the same rows changes nothing (NgForOf's differ).
            if Zone.enabled && keys == order { return }
            order = keys
            region.set(parts: parts)
        }
    }
}

/// A keyed row whose item and index follow the list: a row kept by its key
/// renders the item now at that key, as a component re-rendered with new props does.
public final class ForRow<Item> {
    nonisolated deinit {}
    public let item: Signal<Item>
    public let index: Signal<Double>

    init(_ item: Item, _ index: Double) {
        self.item = Signal(item, equals: { jsSameValue($0, $1) })
        self.index = Signal(index)
    }
}

public func ForEach<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String = "", render: @escaping (ForRow<Item>) throws -> [ViewBase]) {
    ForEachParts(region, items, key: key, site: site) { row in try render(row).map { .view($0) } }
}

public func ForEachFragment<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String = "", render: @escaping (ForRow<Item>) throws -> RegionFragment) {
    ForEachParts(region, items, key: key, site: site) { row in try render(row).parts }
}

private func ForEachParts<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, site: String, render: @escaping (ForRow<Item>) throws -> [RegionPart]) {
    var rows: [String: (row: ForRow<Item>, parts: [RegionPart], owner: Owner)] = [:]
    let reports = RenderReports(site)
    Owner.current?.onCleanup { for row in rows.values { row.owner.dispose() } }
    Effect {
        let list = items()
        untrack {
            var next: [String: (row: ForRow<Item>, parts: [RegionPart], owner: Owner)] = [:]
            var parts: [RegionPart] = []
            var failed = false
            for (index, item) in list.enumerated() {
                var k = key(item, Double(index))
                while next[k] != nil { k += "\u{0}" }
                let entry: (row: ForRow<Item>, parts: [RegionPart], owner: Owner)
                if let kept = rows.removeValue(forKey: k) {
                    kept.row.item.value = item
                    kept.row.index.value = Double(index)
                    entry = kept
                } else {
                    let owner = Owner(parent: nil)
                    let row = ForRow(item, Double(index))
                    let made = reports.parts(owner) { try render(row) }
                    if made == nil { failed = true }
                    entry = (row, made ?? [], owner)
                }
                next[k] = entry
                parts.append(contentsOf: entry.parts)
            }
            if !failed { reports.succeeded() }
            for removed in rows.values { removed.owner.dispose() }
            rows = next
            region.set(parts: parts)
        }
    }
}
