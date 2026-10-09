import Foundation

// Modules of untyped JavaScript as a bundler links them: an ES module's bindings are
// Swift globals its importers read, evaluated once, after the modules it imports; a
// CommonJS module runs on its first `require`, which (like Node's) returns the exports
// as they stand when a cycle reaches the module again.

public final class JSScriptModule {
    public let id: String
    public let isESM: Bool
    private let body: (JSScriptModule) throws -> Void
    private let exportTable: ((JSScriptModule) -> [(String, () -> Any?)])?
    private var state = 0
    private var failure: Error?
    /// A CommonJS module's `module`.
    public let module: JSObject
    private var namespaceObject: JSObject?

    public init(_ id: String, esm: Bool, exports: ((JSScriptModule) -> [(String, () -> Any?)])? = nil, _ body: @escaping (JSScriptModule) throws -> Void) {
        self.id = id
        isESM = esm
        self.body = body
        exportTable = exports
        module = JSObject([("exports", JSObject()), ("id", id), ("loaded", false)])
    }

    /// Runs the module's code the first time; a module being evaluated (a cycle) returns at once.
    public func evaluate() throws {
        if state == 2 {
            if let failure { throw failure }
            return
        }
        if state == 1 { return }
        state = 1
        do {
            try body(self)
            state = 2
            module["loaded"] = true
        } catch {
            if isESM {
                state = 2
                failure = error
            } else {
                state = 0
            }
            throw error
        }
    }

    /// `module.exports`.
    public var exports: Any? {
        get { module["exports"] }
        set { module["exports"] = newValue }
    }

    /// An ES module's namespace object (`import * as ns`): a getter for each export, in key order.
    public var namespace: Any? {
        guard isESM else { return exports }
        if let namespaceObject { return namespaceObject }
        let ns = JSObject()
        ns.jsProto = jsNull
        for (key, read) in exportTable?(self) ?? [] {
            try? ns.defineProperty(key, JSPropertyDescriptor(get: { _ in read() }, enumerable: true, configurable: false))
        }
        try? ns.defineProperty(JSSymbol.toStringTag.key, JSPropertyDescriptor(value: .some("Module"), enumerable: false, writable: false, configurable: false))
        try? ns.defineProperty("__esModule", JSPropertyDescriptor(value: .some(true), enumerable: false, writable: false, configurable: false))
        ns.restrict(sealed: true, frozen: false)
        namespaceObject = ns
        return ns
    }

    /// The default an ES module imports from a CommonJS one: `exports.default` where the module says it was an ES module, else `module.exports`.
    public var interopDefault: Any? {
        if isESM { return exportTable?(self).first { $0.0 == "default" }?.1() }
        let e = exports
        if jsIsObjectValue(e), jsIsTruthy((try? jsGet(e, "__esModule")) ?? nil) { return (try? jsGet(e, "default")) ?? nil }
        return e
    }
}

/// `require(module)`: the module evaluated, then its exports (an ES module's namespace).
public func jsRequire(_ m: JSScriptModule) throws -> Any? {
    try m.evaluate()
    return m.isESM ? m.namespace : m.exports
}

/// `import(module)`: a promise of its namespace.
public func jsDynamicImport(_ m: JSScriptModule) -> Any? {
    do {
        try m.evaluate()
        return JSPromise<Any?>.resolve(m.namespace)
    } catch {
        return JSPromise<Any?>.reject(jsCaught(error))
    }
}

/// `require` read as a value: a function that loads nothing a compiled app does not link.
public func jsRequireFunction(_ from: String) -> Any? {
    JSFunctionObject("require", 1) { _, a in
        throw JSException(JSError("Cannot find module '\(jsToString(jsArg(a, 0)))' from '\(from)': a compiled app links only the modules required by name"))
    }
}

/// An expression that throws where it is evaluated (a module that failed to resolve, loaded at run time).
public func jsThrowing(_ message: String) throws -> Any? {
    throw JSException(JSError(message))
}

/// `c ? a : b`.
@inline(__always)
public func jsChoose(_ c: Bool, _ a: @autoclosure () throws -> Any?, _ b: @autoclosure () throws -> Any?) rethrows -> Any? {
    c ? try a() : try b()
}

/// A default parameter or destructuring default: used where the value is undefined.
@inline(__always)
public func jsDefault(_ value: Any?, _ fallback: @autoclosure () throws -> Any?) rethrows -> Any? {
    jsFlat(value) == nil ? try fallback() : value
}

/// A template literal's parts joined.
@inline(__always)
public func jsConcat(_ parts: [String]) -> String { parts.joined() }

/// Argument lists with spreads, joined.
@inline(__always)
public func jsConcatArguments(_ parts: [[Any?]]) -> [Any?] { Array(parts.joined()) }

/// `x++` on a global.
@discardableResult
public func jsGlobalStep(_ name: String, _ step: Double, postfix: Bool) throws -> Any? {
    var value = try jsGlobalRead(name)
    let result = jsStep(&value, step, postfix: postfix)
    jsGlobalWrite(name, value)
    return result
}

/// A regular expression literal: one the platform's engine cannot read throws a SyntaxError where it is evaluated.
public func jsRegExpLiteralChecked(_ source: String, _ flags: String) throws -> Any? {
    try JSRegExp(source, flags)
}

/// `{ __proto__: p }` in an object literal with other members.
public func jsSetPrototypeOfLiteral(_ object: JSObject, _ proto: Any?) throws {
    let p = jsFlat(proto)
    if p is JSNull || jsIsObjectValue(p) { try jsSetPrototypeOf(object, p) }
}

/// `const {} = value`: undefined and null cannot be destructured.
public func jsRequireObjectCoercibleValue(_ value: Any?) throws {
    if jsIsNullish(value) { throw JSException(JSTypeError("Cannot destructure '\(jsToString(value))' as it is \(jsFlat(value) == nil ? "undefined" : "null").")) }
}
