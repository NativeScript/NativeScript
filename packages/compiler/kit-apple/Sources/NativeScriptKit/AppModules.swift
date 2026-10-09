import Foundation

/// The app's modules by the names its bundle registers them under (`global.registerBundlerModules`): what core's
/// Builder and module-name resolver load XML, stylesheets and code-behind modules through.
public enum AppModules {
    private static var loaders: [String: () throws -> Any?] = [:]
    private static var names: [String] = []
    private static var loaded: [String: Any?] = [:]

    /// A module under each of its names; the first registration of a name wins, as the bundle's does.
    public static func register(_ moduleNames: [String], _ loader: @escaping () throws -> Any?) {
        for name in moduleNames where loaders[name] == nil {
            loaders[name] = loader
            names.append(name)
        }
    }

    /// An app source file under the names the bundle gives it: `main-page.xml`, `./main-page.xml`; a script module
    /// also as `main-page`, `./main-page` and `main-page.js`.
    public static func register(file: String, _ loader: @escaping () throws -> Any?) {
        var moduleNames = [file, "./" + file]
        if let dot = file.lastIndex(of: "."), [".ts", ".js"].contains(String(file[dot...])) {
            let base = String(file[..<dot])
            moduleNames = [base, "./" + base, base + ".js", "./" + base + ".js"]
        }
        register(moduleNames, loader)
    }

    static func load(_ name: String) throws -> Any? {
        if let value = loaded[name] { return value }
        guard let loader = loaders[name] else { return nil }
        let value = try loader()
        loaded[name] = value
        return value
    }

    static func install() {
        let load: JSFunction = { args in try AppModules.load(jsToString(args.first ?? nil)) }
        let exists: JSFunction = { args in AppModules.loaders[jsToString(args.first ?? nil)] != nil }
        let list: JSFunction = { _ in JSArray<Any?>(AppModules.names.map { $0 as Any? }) }
        let add: JSFunction = { args in
            let name = jsToString(args.first ?? nil), loader = args.count > 1 ? args[1] : nil
            AppModules.loaders[name] = { try jsCall(loader, name) }
            AppModules.loaded[name] = nil
            if !AppModules.names.contains(name) { AppModules.names.append(name) }
            return nil
        }
        _ = try? jsSet(jsGlobalThis, "loadModule", load)
        _ = try? jsSet(jsGlobalThis, "moduleExists", exists)
        _ = try? jsSet(jsGlobalThis, "getRegisteredModules", list)
        _ = try? jsSet(jsGlobalThis, "registerModule", add)
    }
}

/// The app's script modules' exports, by file (`main-page.ts`): what the compiled app registers before it runs.
public func __nsRegisterAppModules(_ modules: Any?) {
    guard let record = jsFlat(modules) as? JSObject else { return }
    for file in record.jsKeys {
        let exports = record[jsKey: file]
        AppModules.register(file: file) { exports }
    }
}

/// An app class as its module exports it to core's Builder, which makes components with `new Class()`.
public func __nsClass(_ make: @escaping () throws -> Any?) -> Any? {
    JSConstructor { _ in try make() }
}
