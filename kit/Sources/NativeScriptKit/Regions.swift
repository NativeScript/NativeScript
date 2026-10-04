import Foundation

/// A run of a container's children that a template's `if` or `for` owns.
/// The container keeps static children and regions in template order and
/// rebuilds its child list when a region changes (`RegionHost`). A row or
/// branch with an `if` or `for` of its own holds regions nested in this one.
public final class Region: RegionHost {
    weak var host: RegionHost?
    private var parts: [RegionPart] = []

    public init(host: RegionHost?) { self.host = host }

    public var views: [View] { parts.flatMap(\.views) }

    public func set(_ views: [View]) {
        parts = views.map { .view($0) }
        host?.regionChanged(self)
    }

    func set(parts: [RegionPart]) {
        self.parts = parts
        host?.regionChanged(self)
    }

    /// A region nested in a row or branch of this one changed: so did this one.
    public func regionChanged(_ region: Region) { host?.regionChanged(self) }
}

enum RegionPart {
    case view(View)
    case region(Region)

    var views: [View] {
        switch self {
        case .view(let view): return [view]
        case .region(let region): return region.views
        }
    }
}

/// The views of a row or branch that has an `if` or `for` of its own: its static views and nested regions, in template order.
public final class RegionFragment {
    let owner: Region
    var parts: [RegionPart] = []

    public init(_ owner: Region) { self.owner = owner }

    public func addChild(_ view: View) { parts.append(.view(view)) }
    public func addTemplateChild(_ view: View) { addChild(view) }

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

/// `v-if`/`v-else-if`/`v-else`, `@if`/`@else`, `{#if}`, `<Show>`, `cond && <X/>`:
/// the views of the branch `which` selects, rebuilt only when the selection changes.
public func Choose(_ region: Region, _ which: @escaping () -> Int, render: @escaping (Int) -> [View]) {
    ChooseParts(region, which) { branch in render(branch).map { .view($0) } }
}

public func ChooseFragment(_ region: Region, _ which: @escaping () -> Int, render: @escaping (Int) -> RegionFragment) {
    ChooseParts(region, which) { branch in render(branch).parts }
}

private func ChooseParts(_ region: Region, _ which: @escaping () -> Int, render: @escaping (Int) -> [RegionPart]) {
    var current: Int?
    var branch: Owner?
    Owner.current?.onCleanup { branch?.dispose() }
    Effect {
        let value = which()
        if value == current { return }
        current = value
        untrack {
            branch?.dispose()
            let owner = Owner(parent: nil)
            branch = owner
            region.set(parts: owner.run { render(value) })
        }
    }
}

public func If(_ region: Region, _ condition: @escaping () -> Bool, then: @escaping () -> [View], else otherwise: (() -> [View])? = nil) {
    Choose(region, { condition() ? 0 : 1 }) { $0 == 0 ? then() : (otherwise?() ?? []) }
}

/// `v-for`, `@for`, `{#each}`, `<For>`, `.map()`: one set of views per item,
/// kept by key across changes, so a row that stays keeps its views and state.
public func For<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, render: @escaping (Item, Double) -> [View]) {
    var rows: [String: (views: [View], owner: Owner)] = [:]
    Owner.current?.onCleanup { for row in rows.values { row.owner.dispose() } }
    Effect {
        let list = items()
        untrack {
            var next: [String: (views: [View], owner: Owner)] = [:]
            var views: [View] = []
            for (index, item) in list.enumerated() {
                var k = key(item, Double(index))
                // Duplicate keys still render, as the frameworks do in development.
                while next[k] != nil { k += "\u{0}" }
                let row = rows.removeValue(forKey: k) ?? {
                    let owner = Owner(parent: nil)
                    return (owner.run { render(item, Double(index)) }, owner)
                }()
                next[k] = row
                views.append(contentsOf: row.views)
            }
            for removed in rows.values { removed.owner.dispose() }
            rows = next
            region.set(views)
        }
    }
}

/// A keyed row whose item and index follow the list: a row kept by its key
/// renders the item now at that key, as a component re-rendered with new props does.
public final class ForRow<Item> {
    public let item: Signal<Item>
    public let index: Signal<Double>

    init(_ item: Item, _ index: Double) {
        self.item = Signal(item, equals: { jsSameValue($0, $1) })
        self.index = Signal(index)
    }
}

public func ForEach<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, render: @escaping (ForRow<Item>) -> [View]) {
    ForEachParts(region, items, key: key) { row in render(row).map { .view($0) } }
}

public func ForEachFragment<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, render: @escaping (ForRow<Item>) -> RegionFragment) {
    ForEachParts(region, items, key: key) { row in render(row).parts }
}

private func ForEachParts<Item>(_ region: Region, _ items: @escaping () -> [Item], key: @escaping (Item, Double) -> String, render: @escaping (ForRow<Item>) -> [RegionPart]) {
    var rows: [String: (row: ForRow<Item>, parts: [RegionPart], owner: Owner)] = [:]
    Owner.current?.onCleanup { for row in rows.values { row.owner.dispose() } }
    Effect {
        let list = items()
        untrack {
            var next: [String: (row: ForRow<Item>, parts: [RegionPart], owner: Owner)] = [:]
            var parts: [RegionPart] = []
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
                    entry = (row, owner.run { render(row) }, owner)
                }
                next[k] = entry
                parts.append(contentsOf: entry.parts)
            }
            for removed in rows.values { removed.owner.dispose() }
            rows = next
            region.set(parts: parts)
        }
    }
}
