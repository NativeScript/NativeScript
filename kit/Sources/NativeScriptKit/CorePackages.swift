import Foundation

/// What core imports from npm packages that the kit implements instead.
public enum CorePackages {
    /// What core imports as `~/package.json`: the app's own.
    public static var appConfig: Any? = JSObject([])

    /// The app's package.json, set before core's modules run.
    public static func useAppConfig(_ json: String) {
        appConfig = (try? jsJSONParse(json)) ?? JSObject([])
    }

    /// @csstools/css-calc's `calc(text)`: each `calc()` folded where it resolves.
    public static let calc: JSFunction = { args in CSSCalc.evaluate((jsFlat(args.first ?? nil) as? String) ?? "") }

    /// emoji-regex's module: a function giving a pattern that finds emoji. Unicode's emoji
    /// properties stand in for the package's generated pattern.
    public static let emojiRegex: JSFunction = { _ in
        try JSRegExp(#"\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Regional_Indicator}"#, "gu")
    }

    /// module-name-resolver's `prepareAppForModuleResolver`, `clearResolverCache` and `_setResolver`:
    /// a compiled app resolves no module names at run time, so there is nothing to prepare or clear.
    public static let noModuleResolver: JSFunction = { _ in nil }

    /// module-name-resolver's `resolveModuleName(path, ext)`: a compiled app's modules are named as written.
    public static let resolveModuleName: JSFunction = { args in
        let path = jsToString(args.first ?? nil), ext = args.count > 1 ? jsToString(args[1]) : ""
        return ext.isEmpty || path.hasSuffix("." + ext) ? path : "\(path).\(ext)"
    }

    /// The app's stylesheet, which core loads as the module `app.css` (`global.loadModule`).
    static var appCSS = ""

    static func installModuleLoader() {
        let load: JSFunction = { args in
            let name = jsToString(args.first ?? nil)
            return name.split(separator: "/").last.map(String.init) == "app.css" ? CorePackages.appCSS : nil
        }
        _ = try? jsSet(jsGlobalThis, "loadModule", load)
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
