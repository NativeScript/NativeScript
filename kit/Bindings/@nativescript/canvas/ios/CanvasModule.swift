import Foundation
import NativeScriptKit
import CanvasNative

/// The plugin's binding, which the app installs before any of its modules runs.
public enum NSBinding_nativescript_canvas {
    public static func install() {
        jsGlobalThis[jsKey: "CanvasModule"] = CanvasModule()
    }
}

/// One area's share of `CanvasModule`: the classes script constructs from it
/// (`new global.CanvasModule.Path2D()`) and the functions it calls on it.
protocol CanvasModulePart {
    static var classes: [String: JSConstructor] { get }
    static var functions: Set<String> { get }
    /// The function's result, or nil when the part has no function of that name.
    static func call(_ key: String, _ args: Args) throws -> Any??
}

/// `global.CanvasModule`, as @nativescript/canvas's `CanvasJSIModule::install` makes it for the
/// engine: the same functions and classes, over the same C API (`canvas_native_*`).
final class CanvasModule: CanvasHost, JSConstructible {
    /// `new CanvasModule().install()`, which the plugin runs to install the engine's module: already installed.
    func jsConstruct(_ arguments: [Any?]) throws -> Any? { self }

    private static let parts: [CanvasModulePart.Type] = [Canvas2DPart.self, WebGPUPart.self, WebGLPart.self]
    private static let classes = parts.reduce(into: [String: JSConstructor]()) { all, part in all.merge(part.classes) { a, _ in a } }
    private static let functions = parts.reduce(into: Set<String>()) { all, part in all.formUnion(part.functions) }

    override class var methods: Set<String> { functions }
    override class var className: String? { nil }
    override var jsKeys: [String] { Self.classes.keys.sorted() + Self.functions.sorted() }

    override func get(_ key: String) -> Any?? {
        if let c = Self.classes[key] { return .some(c) }
        return nil
    }

    override func invoke(_ key: String, _ args: Args) throws -> Any?? {
        if key == "install" { return .some(nil) }
        for part in Self.parts { if let result = try part.call(key, args) { return result } }
        return nil
    }
}
