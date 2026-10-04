package org.nativescript.kit

import java.lang.ref.WeakReference

// The parts of view-base and CssState that selectors read and that keep a
// view's match current: its id, attributes, pseudo-classes and siblings, and
// the subscriptions that re-run a match when one of them changes.

val View.cssId: String? get() = toText(applied["id"])

/** `node[attribute]`: the property's value, or its NativeScript default. */
fun View.attributeValue(name: String): Any? {
    applied[name]?.let { return it }
    return when (name) {
        "isEnabled", "isUserInteractionEnabled" -> true
        "visibility" -> "visible"
        "opacity", "scaleX", "scaleY", "rowSpan", "colSpan" -> 1.0
        "row", "col", "translateX", "translateY", "rotate", "rotateX", "rotateY" -> 0.0
        "originX", "originY" -> 0.5
        "text" -> if (this is TextBase) "" else null
        "checked" -> if (this is Switch) false else null
        "iosContentInsetAdjustmentBehavior" -> if (this is ScrollView) "never" else null
        else -> null
    }
}

/** `_onCssStateChange`: the view and its descendants match again. */
fun View.onCssStateChange() {
    if (isLoaded) applyCSS()
    eachChildView { it.onCssStateChange() }
}

/** `subscribeForDynamicUpdates`: re-run this view's state when a dependency changes. */
internal fun View.subscribe(changes: CSSChanges) {
    val next = changes.entries
    val same = next.size == cssSubscriptions.size && next.zip(cssSubscriptions).all { (a, b) -> a.first === b.first.get() && a.second == b.second }
    if (same) return
    unsubscribeFromDynamicUpdates()
    for ((node, key) in next) {
        cssSubscriptions.add(Pair(WeakReference(node), key))
        val wasObserved = node.cssDependents[key]?.isNotEmpty() ?: false
        node.cssDependents.getOrPut(key) { mutableListOf() }.add(WeakReference(this))
        if (!wasObserved && key.startsWith(":")) node.observePseudoClass(key.substring(1), true)
    }
}

internal fun View.unsubscribeFromDynamicUpdates() {
    for ((weakNode, key) in cssSubscriptions) {
        val node = weakNode.get() ?: continue
        node.cssDependents[key]?.removeAll { it.get() == null || it.get() === this }
        if (node.cssDependents[key]?.isEmpty() == true) {
            node.cssDependents.remove(key)
            if (key.startsWith(":")) node.observePseudoClass(key.substring(1), false)
            if ((key == ":focus" || key == ":blur") && node.cssDependents[":focus"] == null && node.cssDependents[":blur"] == null) {
                node.removeVisualState("focus")
                node.removeVisualState("blur")
            }
        }
    }
    cssSubscriptions.clear()
}

/** An attribute or pseudo-class changed: the views depending on it update. */
internal fun View.notifyCSSDependents(key: String) {
    val dependents = cssDependents[key] ?: return
    for (dependent in dependents.mapNotNull { it.get() }) {
        if (!dependent.isLoaded || dependent.isUpdatingDynamicState) continue
        dependent.isUpdatingDynamicState = true
        try {
            dependent.applyCSS()
        } finally {
            dependent.isUpdatingDynamicState = false
        }
    }
}

private val pseudoClassAliases = mapOf("highlighted" to listOf("active", "pressed"))

fun View.addPseudoClass(name: String) {
    for (pseudo in listOf(name) + (pseudoClassAliases[name] ?: emptyList())) {
        if (pseudoClasses.add(pseudo)) notifyCSSDependents(":$pseudo")
    }
}

fun View.deletePseudoClass(name: String) {
    for (pseudo in listOf(name) + (pseudoClassAliases[name] ?: emptyList())) {
        if (pseudoClasses.remove(pseudo)) notifyCSSDependents(":$pseudo")
    }
}

/** editable-text-base's focus handler, active while a selector depends on `:focus` or `:blur`. */
fun View.focusVisualState(focused: Boolean) {
    if (cssDependents[":focus"] == null && cssDependents[":blur"] == null) return
    addVisualState(if (focused) "focus" else "blur")
    removeVisualState(if (focused) "blur" else "focus")
}

fun View.addVisualState(state: String) {
    deletePseudoClass("normal")
    addPseudoClass(state)
}

fun View.removeVisualState(state: String) {
    deletePseudoClass(state)
    if (pseudoClasses.isEmpty()) addPseudoClass("normal")
}
