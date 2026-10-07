import Foundation

/// The Swift frames an error was made in, as `error.stack` lines: on when the app runs with
/// `NS_KIT_STACK` or `NS_KIT_TRACE` set, so a compiled app's uncaught errors name the core
/// function (`View.requestLayout`) script would show in its stack. Off, errors stay cheap.
enum NativeStack {
    static let enabled: Bool = {
        let env = ProcessInfo.processInfo.environment
        return env["NS_KIT_STACK"] != nil || env["NS_KIT_TRACE"] != nil
    }()

    /// `    at <function>` lines for the frames above the runtime's own, nearest first.
    static func capture() -> String? {
        guard enabled else { return nil }
        let frames = Thread.callStackSymbols.dropFirst(2).compactMap { line -> String? in
            let fields = line.split(separator: " ", omittingEmptySubsequences: true)
            guard fields.count >= 4 else { return nil }
            let symbol = demangle(String(fields[3]))
            // The runtime's own frames (making the error, throwing it) say nothing about where.
            if symbol.hasPrefix("NativeScriptKit.JS") || symbol.contains("NativeStack") || symbol.hasPrefix("NativeScriptKit.js") { return nil }
            return "    at \(symbol)"
        }
        return frames.prefix(24).joined(separator: "\n")
    }

    private static func demangle(_ mangled: String) -> String {
        guard mangled.hasPrefix("$s") || mangled.hasPrefix("_$s") else { return mangled }
        return mangled.withCString { pointer in
            guard let out = swift_demangle(pointer, UInt(strlen(pointer)), nil, nil, 0) else { return mangled }
            defer { free(out) }
            return String(cString: out)
        }
    }
}

@_silgen_name("swift_demangle")
private func swift_demangle(_ mangled: UnsafePointer<CChar>?, _ length: UInt, _ output: UnsafeMutablePointer<CChar>?, _ outputSize: UnsafeMutablePointer<UInt>?, _ flags: UInt32) -> UnsafeMutablePointer<CChar>?
