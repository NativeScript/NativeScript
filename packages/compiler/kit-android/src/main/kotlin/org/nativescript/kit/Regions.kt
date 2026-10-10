package org.nativescript.kit

/**
 * A run of a container's children that a template's `if` or `for` owns.
 * The container keeps static children and regions in template order and
 * rebuilds its child list when a region changes (`RegionHost`). A row or
 * branch with an `if` or `for` of its own holds regions nested in this one.
 */
class Region(internal var host: RegionHost?) : RegionHost {
    private var parts: List<RegionPart> = emptyList()

    val views: List<View> get() = parts.flatMap { it.views }

    /** Set by `Choose` while it renders a branch: the branch's first `attach` replaces the old views. */
    internal var replacing = false

    fun set(views: List<View>) = setParts(views.map { RegionPart.Child(it) })

    internal fun setParts(parts: List<RegionPart>) {
        replacing = false
        this.parts = parts
        host?.regionChanged(this)
    }

    /**
     * Puts a view of the content being rendered in place now, for frameworks
     * that insert views top-down; the render's result settles their order.
     */
    fun attach(view: View) {
        if (replacing) parts = emptyList()
        replacing = false
        parts = parts + RegionPart.Child(view)
        host?.regionChanged(this)
    }

    /** A region nested in a row or branch of this one changed: so did this one. */
    override fun regionChanged(region: Region) {
        host?.regionChanged(this)
    }
}

internal sealed class RegionPart {
    abstract val views: List<View>

    class Child(val view: View) : RegionPart() {
        override val views: List<View> get() = listOf(view)
    }

    class Nested(val region: Region) : RegionPart() {
        override val views: List<View> get() = region.views
    }
}

/** The views of a row or branch that has an `if` or `for` of its own: its static views and nested regions, in template order. */
class RegionFragment(private val owner: Region) {
    internal val parts = mutableListOf<RegionPart>()

    fun addChild(view: View) {
        parts.add(RegionPart.Child(view))
    }

    fun addTemplateChild(view: View) = addChild(view)

    fun addRegion(): Region {
        val region = Region(owner)
        parts.add(RegionPart.Nested(region))
        return region
    }

    fun kitAddChild(view: View) = addChild(view)
    fun kitAddTemplateChild(view: View) = addTemplateChild(view)
    fun kitAddRegion(): Region = addRegion()

    /** Makes these views the owner region's content: a component whose template has no single root. */
    fun fill() = owner.setParts(parts.toList())
}

/** A container whose children include regions. */
interface RegionHost {
    fun regionChanged(region: Region)
}

/**
 * `v-if`/`v-else-if`/`v-else`, `@if`/`@else`, `{#if}`, `<Show>`, `cond && <X/>`:
 * the views of the branch `which` selects, rebuilt only when the selection changes.
 */
fun Choose(region: Region, which: () -> Int, render: (Int) -> List<View>) =
    chooseParts(region, which) { branch -> render(branch).map { RegionPart.Child(it) } }

fun ChooseFragment(region: Region, which: () -> Int, render: (Int) -> RegionFragment) =
    chooseParts(region, which) { branch -> render(branch).parts.toList() }

private fun chooseParts(region: Region, which: () -> Int, render: (Int) -> List<RegionPart>) {
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
            region.setParts(owner.run { render(value) })
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
fun <Item> For(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (Item, Double) -> List<View>) =
    forParts(region, items, key) { item, index -> render(item, index).map { RegionPart.Child(it) } }

/** `For` whose rows have an `if` or `for` of their own. */
fun <Item> ForFragment(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (Item, Double) -> RegionFragment) =
    forParts(region, items, key) { item, index -> render(item, index).parts.toList() }

private fun <Item> forParts(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (Item, Double) -> List<RegionPart>) {
    var rows = HashMap<String, Pair<List<RegionPart>, Owner>>()
    var order: List<String>? = null
    Owner.current?.onCleanup { for (row in rows.values) row.second.dispose() }
    Effect {
        val list = items()
        untrack {
            val next = HashMap<String, Pair<List<RegionPart>, Owner>>()
            val parts = mutableListOf<RegionPart>()
            val keys = mutableListOf<String>()
            for ((index, item) in list.withIndex()) {
                var k = key(item, index.toDouble())
                // Duplicate keys still render, as the frameworks do in development.
                while (next.containsKey(k)) k += "\u0000"
                val row = rows.remove(k) ?: Owner(null).let { owner -> Pair(owner.run { render(item, index.toDouble()) }, owner) }
                next[k] = row
                keys.add(k)
                parts.addAll(row.first)
            }
            for (removed in rows.values) removed.second.dispose()
            rows = next
            // A check that finds the same rows changes nothing (NgForOf's differ).
            if (Zone.enabled && keys == order) return@untrack
            order = keys
            region.setParts(parts)
        }
    }
}

/**
 * A keyed row whose item and index follow the list: a row kept by its key
 * renders the item now at that key, as a component re-rendered with new props does.
 */
class ForRow<Item> internal constructor(item: Item, index: Double) {
    val item = Signal(item) { a, b -> jsSameValue(a, b) }
    val index = Signal(index)
}

fun <Item> ForEach(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (ForRow<Item>) -> List<View>) =
    forEachParts(region, items, key) { row -> render(row).map { RegionPart.Child(it) } }

fun <Item> ForEachFragment(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (ForRow<Item>) -> RegionFragment) =
    forEachParts(region, items, key) { row -> render(row).parts.toList() }

private class ForEachEntry<Item>(val row: ForRow<Item>, val parts: List<RegionPart>, val owner: Owner)

private fun <Item> forEachParts(region: Region, items: () -> List<Item>, key: (Item, Double) -> String, render: (ForRow<Item>) -> List<RegionPart>) {
    var rows = HashMap<String, ForEachEntry<Item>>()
    var order: List<String>? = null
    Owner.current?.onCleanup { for (row in rows.values) row.owner.dispose() }
    Effect {
        val list = items()
        untrack {
            val next = HashMap<String, ForEachEntry<Item>>()
            val parts = mutableListOf<RegionPart>()
            val keys = mutableListOf<String>()
            for ((index, item) in list.withIndex()) {
                var k = key(item, index.toDouble())
                while (next.containsKey(k)) k += "\u0000"
                val kept = rows.remove(k)
                val entry = if (kept != null) {
                    kept.row.item.value = item
                    kept.row.index.value = index.toDouble()
                    kept
                } else {
                    val owner = Owner(null)
                    val row = ForRow(item, index.toDouble())
                    ForEachEntry(row, owner.run { render(row) }, owner)
                }
                next[k] = entry
                keys.add(k)
                parts.addAll(entry.parts)
            }
            for (removed in rows.values) removed.owner.dispose()
            rows = next
            if (Zone.enabled && keys == order) return@untrack
            order = keys
            region.setParts(parts)
        }
    }
}
