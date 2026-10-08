package org.nativescript.kit

/** The key of an unkeyed `for` (Solid's `<For>`): the item itself, by reference for objects. */
fun jsKey(item: Any?): String = when (item) {
    null -> "null"
    is String -> item
    is Double -> js(item)
    is Boolean -> js(item)
    else -> "@" + System.identityHashCode(item)
}
