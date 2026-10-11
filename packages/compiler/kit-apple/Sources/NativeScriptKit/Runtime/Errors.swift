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

    /// Where the error was made: demangled frames when the app runs with `NS_KIT_STACK` (see `NativeStack`), else return addresses.
    private let nativeFrames: String? = NativeStack.capture()
    private let origin: [UInt] = NativeStack.enabled ? [] : NativeStack.returnAddresses()

    public init(_ message: String = "", cause: Any? = nil) {
        self.message = message
        self.cause = cause
        if NativeStack.logsErrors { print("error made: \(type(of: self)) \(message)\n\(nativeFrames ?? "")") }
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

    /// V8's `error.stack`: the header line and the frames the error was made in.
    open var stack: String {
        get { storedStack ?? "\(jsErrorString)\n\(nativeFrames ?? NativeStack.frames(origin))" }
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

/// What script meets on an OS older than an API it uses: the API's class is undefined there, and using it a TypeError.
public func jsUnavailable(_ version: Double) -> JSException {
    JSException(JSTypeError("This needs iOS \(jsNumberToString(version)) or newer"))
}

/// An untyped value where code declares `T` (`const p: Point = JSON.parse(s)`): the value as `T`,
/// or a TypeError where it is none, which JavaScript would let through until a member is missing.
@inline(__always)
public func jsChecked<T>(_ value: Any?, _ type: T.Type) throws -> T {
    if let same = value as? T { return same }
    if let cast: T = jsCast(value) { return cast }
    throw jsCastFailure(value, String(describing: T.self))
}

@inline(never)
public func jsCastFailure(_ value: Any?, _ type: String) -> JSException {
    JSException(JSTypeError("\(jsIsNullish(value) ? jsToString(value) : jsTypeof(value)) is not a \(type)"))
}

/// An untyped value where code declares an `Error` (`catch (e) { (e as Error).message }`,
/// `.catch((e: Error) => …)`): the error itself, or a view reading the thrown value's members.
public func jsErrorOf(_ value: Any?) -> JSError {
    if let error = jsFlat(value) as? JSError { return error }
    return JSThrownValue(value)
}

/// What was thrown or rejected that is no `Error`, seen as one: its members read as the value's own,
/// undefined where it has none.
public final class JSThrownValue: JSError {
    public let value: Any?

    init(_ value: Any?) {
        self.value = value
        super.init("")
        name = Self.read(value, "name")
        message = Self.read(value, "message")
    }

    private static func isObject(_ value: Any?) -> Bool { jsFlat(value).map(jsIsObject) ?? false }

    private static func read(_ value: Any?, _ key: String) -> String {
        let v = isObject(value) ? jsField(value, key) : nil
        return jsIsNullish(v) ? "undefined" : jsToString(v)
    }

    public override var stack: String {
        get { Self.read(value, "stack") }
        set { super.stack = newValue }
    }

    public override subscript(jsKey key: String) -> Any? {
        get { Self.isObject(value) ? jsField(value, key) : nil }
        set { if Self.isObject(value) { try? jsSet(value, key, newValue) } }
    }

    public override var jsKeys: [String] { Self.isObject(value) ? jsKeysOf(value) : [] }
}

/// A dynamic write (`obj[key] = v`, a binding's set) a typed field refused: the TypeError `jsSet` throws after the write.
nonisolated(unsafe) var jsRefusedWrite: JSTypeError?

public func jsRefuseSet(_ value: Any?, _ key: String, _ type: String) {
    jsRefusedWrite = JSTypeError("Cannot assign \(jsIsNullish(value) ? jsToString(value) : jsTypeof(value)) to '\(key)', a \(type)")
}

/// A truthy operand whose Swift type may still be optional (`a?.b` where TypeScript types `a` as present).
@inline(__always) public func jsPresent<T>(_ value: T) -> T { value }
@inline(__always) public func jsPresent<T>(_ value: T?) -> T { value! }

/// A JavaScript value from a call that may throw, reported like a handler's error; nil if it threw.
@discardableResult
public func jsReported<T>(_ body: () throws -> T) -> T? {
    do { return try body() } catch { jsReport { throw error }; return nil }
}

/// A native callback's result from a body that may throw: what it throws is reported as uncaught,
/// and the callback returns its type's neutral value (`jsNativeZero`), as NativeScript's runtime
/// returns from a delegate whose JavaScript threw.
public func jsReportedOrZero<T>(_ body: () throws -> T) -> T {
    do { return try body() } catch {
        jsReportUncaught(jsCaught(error))
        return jsNativeZero(T.self)
    }
}

/// Types whose neutral value is their empty one.
protocol JSEmptyConstructible { static var jsEmpty: Self { get } }
extension String: JSEmptyConstructible { static var jsEmpty: String { "" } }
extension Array: JSEmptyConstructible { static var jsEmpty: Array { [] } }
extension Dictionary: JSEmptyConstructible { static var jsEmpty: Dictionary { [:] } }
extension Set: JSEmptyConstructible { static var jsEmpty: Set { [] } }

/// A native type's neutral value: nil, zero bits for numbers, booleans, C structs and enums,
/// empty for strings and collections, a new instance of an Objective-C class.
public func jsNativeZero<T>(_ type: T.Type) -> T {
    if let none = (T.self as? JSOptionalProtocol.Type)?.jsNone as? T { return none }
    if let empty = (T.self as? JSEmptyConstructible.Type)?.jsEmpty as? T { return empty }
    if let cls = T.self as? NSObject.Type, let made = cls.init() as? T { return made }
    if _isPOD(T.self) {
        return withUnsafeTemporaryAllocation(of: T.self, capacity: 1) { buffer in
            UnsafeMutableRawPointer(buffer.baseAddress!).initializeMemory(as: UInt8.self, repeating: 0, count: MemoryLayout<T>.stride)
            return buffer.baseAddress!.pointee
        }
    }
    fatalError("\(T.self) has no neutral value to return where script threw")
}

/// A loop's items from an expression that may throw: none when it does, the error reported.
public func jsReportedItems<S: Sequence>(_ body: () throws -> S) -> [S.Element] {
    jsReported { Array(try body()) } ?? []
}

public func jsReportedItems<S: Sequence>(_ body: () throws -> S?) -> [S.Element] {
    guard let items = jsReported(body) ?? nil else { return [] }
    return Array(items)
}

/// A loop's items from an untyped value: an iterable's elements, none for undefined or null, as Angular's `@for` takes them.
public func jsItemsOf(_ value: Any?) throws -> [Any?] {
    if jsIsNullish(value) { return [] }
    let iterator = try jsIteratorOf(value)
    var items: [Any?] = []
    while try iterator.jsAdvance() { items.append(iterator.jsCurrent) }
    return items
}
