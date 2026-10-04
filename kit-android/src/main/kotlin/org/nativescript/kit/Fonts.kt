package org.nativescript.kit

import android.graphics.Typeface

/** `loadFontFromFile` from styling/font.android: `app/fonts/<family>.ttf` or `.otf` from the assets, null once a load has failed. */
internal object AppFonts {
    private val cache = HashMap<String, Typeface?>()

    fun load(family: String): Typeface? {
        if (cache.containsKey(family)) return cache[family]
        val assets = NativeScriptActivity.context.assets
        val files = assets.list("app/fonts") ?: emptyArray()
        val file = listOf("$family.ttf", "$family.otf").firstOrNull { it in files }
        val typeface = file?.let { runCatching { Typeface.createFromAsset(assets, "app/fonts/$it") }.getOrNull() }
        cache[family] = typeface
        return typeface
    }
}
