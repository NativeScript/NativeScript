package org.nativescript.kit

/** What core imports from npm packages a compiled app does not carry, as the kit gives it (modules.mts' counterparts). */
object CorePackages {
    /**
     * emoji-regex's module: a function giving a pattern that finds emoji. Unicode's emoji
     * properties stand in for the package's generated pattern, as in the iOS kit.
     */
    val emojiRegex: JSFunction = JSFunction { _ -> JSRegExp("\\p{Extended_Pictographic}|\\p{Emoji_Presentation}|\\p{Regional_Indicator}", "gu") }
}
