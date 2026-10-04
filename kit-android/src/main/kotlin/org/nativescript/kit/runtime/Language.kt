package org.nativescript.kit

import java.util.IdentityHashMap

/** A tagged template's strings array; translated code makes one per call site. */
fun jsTemplateObject(cooked: List<String>, raw: List<String>): JSArray<String> {
    val strings = JSArray(ArrayList(cooked))
    templateRaws[strings] = JSArray(ArrayList(raw))
    return strings
}

/** `strings.raw`. */
fun jsTemplateRaw(strings: JSArray<String>): JSArray<String> = templateRaws[strings] ?: strings

private val templateRaws = IdentityHashMap<JSArray<String>, JSArray<String>>()
