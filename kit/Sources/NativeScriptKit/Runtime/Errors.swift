import Foundation

/// What JavaScript `throw value` throws: any value, not only errors.
public struct JSException: Error, @unchecked Sendable, CustomStringConvertible {
    public let value: Any?
    public init(_ value: Any?) { self.value = value }
    public init(value: Any?) { self.value = value }
    public var description: String { "Uncaught " + jsToString(value) }
}

/// JavaScript `Error`. TypeScript classes extending `Error` subclass it and set `name` in their initializer.
open class JSError: JSDynamic, CustomStringConvertible {
    open var name: String = "Error"
    open var message: String
    open var cause: Any?
    private var storedStack: String?
    private var properties: JSObject?

    public init(_ message: String = "", cause: Any? = nil) {
        self.message = message
        self.cause = cause
    }

    /// `new Error(message)` with a message of any type: undefined is "", anything else its string form.
    public convenience init(message: Any?, cause: Any? = nil) {
        self.init(jsFlat(message) == nil ? "" : jsToString(message), cause: cause)
    }

    /// `"Name: message"`, as `String(error)` gives it.
    public var jsErrorString: String {
        if message.isEmpty { return name }
        if name.isEmpty { return message }
        return "\(name): \(message)"
    }

    /// V8's `error.stack`: the header line and a placeholder frame.
    open var stack: String {
        get { storedStack ?? "\(jsErrorString)\n    at <anonymous>" }
        set { storedStack = newValue }
    }

    open subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "name": return name
            case "message": return message
            case "stack": return stack
            case "cause": return cause
            default: return properties?[key]
            }
        }
        set {
            switch key {
            case "name": name = jsToString(newValue)
            case "message": message = jsToString(newValue)
            case "stack": stack = jsToString(newValue)
            case "cause": cause = newValue
            default:
                if properties == nil { properties = JSObject() }
                properties?[key] = newValue
            }
        }
    }

    open var jsKeys: [String] { properties?.keys ?? [] }
    open var jsClassName: String? { name }
    public var description: String { jsErrorString }
}

/// JavaScript `TypeError`.
open class JSTypeError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "TypeError"
    }
}

/// JavaScript `RangeError`.
open class JSRangeError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "RangeError"
    }
}

/// JavaScript `SyntaxError`.
open class JSSyntaxError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "SyntaxError"
    }
}

/// JavaScript `ReferenceError`.
open class JSReferenceError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "ReferenceError"
    }
}

/// JavaScript `AggregateError`.
open class JSAggregateError: JSError {
    public var errors: JSArray<Any?>

    public init(errors: JSArray<Any?>, _ message: String = "", cause: Any? = nil) {
        self.errors = errors
        super.init(message, cause: cause)
        name = "AggregateError"
    }

    open override subscript(jsKey key: String) -> Any? {
        get { key == "errors" ? errors : super[jsKey: key] }
        set {
            if key == "errors", let array = jsFlat(newValue) as? JSArray<Any?> {
                errors = array
            } else {
                super[jsKey: key] = newValue
            }
        }
    }
}

/// The JavaScript value a `catch` clause binds for a Swift error: the thrown value of a
/// `JSException`, and a `JSError` carrying the `localizedDescription` of any other error
/// (an `NSError` from an Objective-C API, say).
public func jsCaught(_ error: Error) -> Any? {
    if let exception = error as? JSException { return exception.value }
    return JSError(error.localizedDescription)
}

/// A member read from a receiver its type promised (`x!.name`, `items[i].name`): JavaScript's TypeError when it is missing.
@inline(__always)
public func jsUnwrap<T>(_ value: T?, _ key: String, null: Bool = false) throws -> T {
    guard let value else { throw JSException(JSTypeError("Cannot read properties of \(null ? "null" : "undefined") (reading '\(key)')")) }
    return value
}

/// A truthy operand whose Swift type may still be optional (`a?.b` where TypeScript types `a` as present).
@inline(__always) public func jsPresent<T>(_ value: T) -> T { value }
@inline(__always) public func jsPresent<T>(_ value: T?) -> T { value! }

/// A JavaScript value from a call that may throw, reported like a handler's error; nil if it threw.
@discardableResult
public func jsReported<T>(_ body: () throws -> T) -> T? {
    do { return try body() } catch { jsReport { throw error }; return nil }
}
