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

    /// ui/builder's `Builder`, which a compiled app has no XML for: views from an entry's `create`.
    public static let builder = JSObject([("createViewFromEntry", { (args: [Any?]) throws -> Any? in
        let entry = args.first ?? nil
        guard !jsIsNullish(try jsGet(entry, "create")) else {
            throw JSException(value: JSError("Failed to load page XML file for module: \(jsToString(try jsGet(entry, "moduleName")))"))
        }
        let view = try jsCallMethod(entry, "create")
        if jsIsNullish(view) { throw JSException(value: JSError("Failed to create View with entry.create() function.")) }
        return view
    } as JSFunction)])
}
