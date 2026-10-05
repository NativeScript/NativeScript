import Foundation

/// What core imports from npm packages that the kit implements instead.
public enum CorePackages {
    /// @csstools/css-calc's `calc(text)`: each `calc()` folded where it resolves.
    public static let calc: JSFunction = { args in CSSCalc.evaluate((jsFlat(args.first ?? nil) as? String) ?? "") }

    /// emoji-regex's module: a function giving a pattern that finds emoji. Unicode's emoji
    /// properties stand in for the package's generated pattern.
    public static let emojiRegex: JSFunction = { _ in
        try JSRegExp(#"\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}"#, "gu")
    }
}
