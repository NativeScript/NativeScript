import Foundation
import NativeScriptKit
import CanvasNative

/// CanvasModule's WebGL and WebGL2.
enum WebGLPart: CanvasModulePart {
    static let classes: [String: JSConstructor] = [:]
    static let functions: Set<String> = ["createWebGLContext", "createWebGL2Context"]

    static func call(_ key: String, _ args: Args) throws -> Any?? {
        switch key {
        case "createWebGLContext": return .some(createContext(args, version: 1))
        case "createWebGL2Context": return .some(createContext(args, version: 2))
        default: return nil
        }
    }

    /// `createWebGLContext(options, context, …)` with six arguments wraps the canvas's `WebGLState`, passed
    /// as a BigInt; otherwise `(options, width, height, …)` makes a context without a window.
    private static func createContext(_ args: Args, version: Int32) -> Any? {
        let options = GLOptions(args[0])
        guard options.version == version else { return jsNull }
        let state: OpaquePointer?
        if args.count == 6 {
            state = OpaquePointer(bitPattern: Int(truncatingIfNeeded: args.pointer(1)))
        } else {
            state = canvas_native_webgl_create_no_window(webglCInt32(args.number(1)), webglCInt32(args.number(2)), options.version, options.alpha,
                                                         options.antialias, options.depth, options.failIfMajorPerformanceCaveat,
                                                         options.powerPreference, options.premultipliedAlpha, options.preserveDrawingBuffer,
                                                         options.stencil, options.desynchronized, options.xrCompatible, false)
        }
        guard let state else { return jsNull }
        return version == 2 ? WebGL2RenderingContextHost(state: state) : WebGLRenderingContextHost(state: state, webgl2: false)
    }
}

/// The context options, read as the C++ binding's `GLOptions::parseGLOptions` reads them.
private struct GLOptions {
    var version: Int32 = 0
    var alpha = true
    var antialias = true
    // Never read from the options, and `powerPreference` never set from them, as in the C++ binding.
    var depth = true
    var powerPreference: Int32 = 0
    var failIfMajorPerformanceCaveat = false
    var premultipliedAlpha = true
    var preserveDrawingBuffer = false
    var stencil = false
    var desynchronized = false
    var xrCompatible = false

    init(_ value: Any?) {
        guard webglIsObject(value) else { return }
        if let n = member(value, "version") as? Double, let v = Int32(exactly: n), !(n == 0 && n.sign == .minus) { version = v }
        func flag(_ key: String) -> Bool? { member(value, key) as? Bool }
        if let v = flag("alpha") { alpha = v }
        if let v = flag("antialias") { antialias = v }
        if let v = flag("failIfMajorPerformanceCaveat") { failIfMajorPerformanceCaveat = v }
        if let v = flag("premultipliedAlpha") { premultipliedAlpha = v }
        if let v = flag("preserveDrawingBuffer") { preserveDrawingBuffer = v }
        if let v = flag("stencil") { stencil = v }
        if let v = flag("desynchronized") { desynchronized = v }
        if let v = flag("xrCompatible") { xrCompatible = v }
    }
}
