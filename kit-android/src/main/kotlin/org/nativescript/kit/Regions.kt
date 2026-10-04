package org.nativescript.kit

/**
 * A run of a container's children that a template's `if` or `for` owns.
 * The container keeps static children and regions in template order and
 * rebuilds its child list when a region changes (`RegionHost`).
 */
class Region(internal var host: RegionHost?) {
    var views: List<View> = emptyList()
        private set

    /** Set by `Choose` while it renders a branch: the branch's first `attach` replaces the old views. */
    internal var replacing = false

    fun set(views: List<View>) {
        replacing = false
        this.views = views
        host?.regionChanged(this)
    }

    /**
     * Puts a view of the content being rendered in place now, for frameworks
     * that insert views top-down; the render's result settles their order.
     */
    fun attach(view: View) {
        if (replacing) views = emptyList()
        replacing = false
        views = views + view
        host?.regionChanged(this)
    }
}

/** A container whose children include regions. */
interface RegionHost {
    fun regionChanged(region: Region)
}

/**
 * `v-if`/`v-else-if`/`v-else`, `@if`/`@else`, `{#if}`, `<Show>`, `cond && <X/>`:
 * the views of the branch `which` selects, rebuilt only when the selection changes.
 */
fun Choose(region: Region, which: () -> Int, render: (Int) -> List<View>) {
    var current: Int? = null
    var branch: Owner? = null
    Owner.current?.onCleanup { branch?.dispose() }
    Effect {
        val value = which()
        if (value == current) return@Effect
        current = value
        untrack {
            branch?.dispose()
            val owner = Owner(null)
            branch = owner
            region.replacing = true
            region.set(owner.run { render(value) })
        }
    }
}

fun If(region: Region, condition: () -> Boolean, then: () -> List<View>, otherwise: (() -> List<View>)? = null) {
    Choose(region, { if (condition()) 0 else 1 }) { if (it == 0) then() else otherwise?.invoke() ?: emptyList() }
}

/**
 * `v-for`, `@for`, `{#each}`, `<For>`, `.map()`: one set of views per item,
 * kept by key across changes, so a row that stays keeps its views and state.
 */
fun <Item> For(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (Item, Double) -> List<View>) {
    var rows = HashMap<String, Pair<List<View>, Owner>>()
    var order: List<String>? = null
    Owner.current?.onCleanup { for (row in rows.values) row.second.dispose() }
    Effect {
        val list = items()
        untrack {
            val next = HashMap<String, Pair<List<View>, Owner>>()
            val views = mutableListOf<View>()
            val keys = mutableListOf<String>()
            for ((index, item) in list.withIndex()) {
                var k = key(item, index.toDouble())
                // Duplicate keys still render, as the frameworks do in development.
                while (next.containsKey(k)) k += "\u0000"
                val row = rows.remove(k) ?: Owner(null).let { owner -> Pair(owner.run { render(item, index.toDouble()) }, owner) }
                next[k] = row
                keys.add(k)
                views.addAll(row.first)
            }
            for (removed in rows.values) removed.second.dispose()
            rows = next
            // A check that finds the same rows changes nothing (NgForOf's differ).
            if (Zone.enabled && keys == order) return@untrack
            order = keys
            region.set(views)
        }
    }
}
