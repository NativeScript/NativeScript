import Foundation

/// The Swift frames an error was made in, as `error.stack` lines: on when the app runs with
/// `NS_KIT_STACK` or `NS_KIT_TRACE` set, so a compiled app's uncaught errors name the core
/// function (`View.requestLayout`) script would show in its stack. Off, errors stay cheap.
enum NativeStack {
    static let enabled: Bool = {
        let env = ProcessInfo.processInfo.environment
        return env["NS_KIT_STACK"] != nil || env["NS_KIT_TRACE"] != nil || env["NS_KIT_ERRORS"] != nil
    }()

    /// `NS_KIT_ERRORS`: every error script makes is printed where it is made, caught or not
    /// (as a debugger's break on all exceptions), for failures core catches and only traces.
    static let logsErrors = ProcessInfo.processInfo.environment["NS_KIT_ERRORS"] != nil

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

    /// The return addresses an error is made at: recorded for every error (a frame-pointer walk, no symbol
    /// lookup) and formatted only when its `stack` is read.
    static func returnAddresses() -> [UInt] {
        var buffer = [UnsafeMutableRawPointer?](repeating: nil, count: 32)
        let count = Int(backtrace(&buffer, 32))
        return count > 1 ? buffer[1..<count].map { UInt(bitPattern: $0) } : []
    }

    /// `    at <symbol> (<image>+0x<offset>)` for each address. A store build has no symbol names; its offsets
    /// resolve with the archive's dSYM to the TypeScript lines the compiled code carries (#sourceLocation):
    /// `atos -o <App>.app.dSYM/Contents/Resources/DWARF/<App> -l 0x100000000 <0x100000000 + offset>`.
    static func frames(_ addresses: [UInt]) -> String {
        var lines: [String] = []
        for address in addresses {
            var info = Dl_info()
            guard let pointer = UnsafeRawPointer(bitPattern: address), dladdr(pointer, &info) != 0 else { continue }
            let image = info.dli_fname.map { URL(fileURLWithPath: String(cString: $0)).lastPathComponent } ?? "?"
            let offset = address - UInt(bitPattern: info.dli_fbase)
            let symbol = info.dli_sname.map { demangle(String(cString: $0)) }
            if let symbol, symbol.hasPrefix("NativeScriptKit.JS") || symbol.contains("NativeStack") { continue }
            lines.append("    at \(symbol ?? "<compiled>") (\(image)+0x\(String(offset, radix: 16)))")
        }
        return lines.isEmpty ? "    at <anonymous>" : lines.joined(separator: "\n")
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
