import Foundation

/// A run of a container's children that a template's `if` or `for` owns.
/// The container keeps static children and regions in template order and
/// rebuilds its child list when a region changes (`RegionHost`).
public final class Region {
    weak var host: RegionHost?
    public private(set) var views: [View] = []

    public init(host: RegionHost?) { self.host = host }

    public func set(_ views: [View]) {
        self.views = views
        host?.regionChanged(self)
    }
}

/// A container whose children include regions.
public protocol RegionHost: AnyObject {
    func regionChanged(_ region: Region)
}

/// `v-if`/`v-else-if`/`v-else`, `@if`/`@else`, `{#if}`, `<Show>`, `cond && <X/>`:
/// the views of the branch `which` selects, rebuilt only when the selection changes.
public func Choose(_ region: Region, _ which: @escaping () -> Int, render: @escaping (Int) -> [View]) {
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
            region.set(owner.run { render(value) })
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
