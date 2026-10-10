import Foundation

/// A JavaScript function value that keeps what script reads of a function: its `name` and `length`
/// (a test runner telling `test(done)` from `test()`), its own properties (`fn.cache = …`) and an
/// identity, called with a receiver (`fn.apply(thisArg, args)`).
public final class JSFunctionObject: JSDynamic, CustomStringConvertible {
    public let name: String
    public let length: Int
    let body: JSMethod
    private var own: JSObject?

    public init(_ name: String, _ length: Int, _ body: @escaping JSMethod) {
        self.name = name
        self.length = length
        self.body = body
    }

    @discardableResult
    public func call(_ this: Any?, _ arguments: [Any?]) throws -> Any? { try body(this, arguments) }

    public subscript(jsKey key: String) -> Any? {
        get {
            if let own, own.has(key) { return own[key] }
            switch key {
            case "name": return name
            case "length": return Double(length)
            default: return nil
            }
        }
        set {
            // `name` and `length` are read-only: a write in sloppy code changes nothing.
            if key == "name" || key == "length" { return }
            if own == nil { own = JSObject() }
            own![key] = newValue
        }
    }

    public var jsKeys: [String] { own?.keys ?? [] }
    public var jsClassName: String? { nil }
    public var description: String { name.isEmpty ? "[Function (anonymous)]" : "[Function: \(name)]" }
}

/// A function value that ignores its receiver: what a function declaration or arrow evaluates to.
@inline(__always)
public func jsFunction(_ name: String, _ length: Int, _ body: @escaping JSFunction) -> JSFunctionObject {
    JSFunctionObject(name, length) { _, arguments in try body(arguments) }
}

/// A function value that reads its receiver: a method held as a value.
@inline(__always)
public func jsMethodFunction(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
    JSFunctionObject(name, length, body)
}

/// `f(...arguments)` with a receiver: any function value the runtime holds.
@discardableResult
public func jsInvoke(_ function: Any?, _ this: Any?, _ arguments: [Any?]) throws -> Any? {
    switch jsFlat(function) {
    case let f as JSFunctionObject: return try f.call(this, arguments)
    case let f as JSFunction: return try f(arguments)
    case let m as JSMethod: return try m(this, arguments)
    case let moot as JSMootValue: throw moot.unavailable()
    default: throw JSException(JSTypeError("\(jsInspect(function)) is not a function"))
    }
}

/// The elements `f.apply(this, list)` passes: an array's, an array-like's, none for undefined or null.
public func jsArgumentList(_ list: Any?) throws -> [Any?] {
    switch jsFlat(list) {
    case nil, is JSNull: return []
    case let array as JSArrayProtocol: return array.jsAnyElements
    case let v?:
        guard jsIsObject(v) else { throw JSException(JSTypeError("CreateListFromArrayLike called on non-object")) }
        let length = jsToNumber(try jsGet(v, "length"))
        let n = length.isFinite ? max(0, Int(length)) : 0
        return try (0..<n).map { try jsGet(v, String($0)) }
    }
}
