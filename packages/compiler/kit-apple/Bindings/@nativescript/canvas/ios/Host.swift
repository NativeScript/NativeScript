import Foundation
import NativeScriptKit

/// An object of the binding, as the engine's host objects behave to script: its methods are
/// answered by `invoke`, its properties by `get` and `set`; a method read as a value is a
/// function that calls it.
class CanvasHost: JSHostObject {
    /// The methods `invoke` answers, which reading a property of that name gives as a function.
    class var methods: Set<String> { [] }
    class var className: String? { nil }

    /// The property's value, or nil when the object has no property of that name.
    func get(_ key: String) -> Any?? { nil }
    /// Whether the object has a property of that name, which it set.
    func set(_ key: String, _ value: Any?) throws -> Bool { false }
    /// The method's result, or nil when the object has no method of that name.
    func invoke(_ key: String, _ args: Args) throws -> Any?? { nil }

    final func jsInvoke(_ key: String, _ arguments: [Any?]) throws -> Any?? {
        try invoke(key, Args(arguments))
    }

    var jsKeys: [String] { [] }
    var jsClassName: String? { Self.className }

    subscript(jsKey key: String) -> Any? {
        get {
            if let value = get(key) { return value }
            if Self.methods.contains(key) {
                return { [unowned self] (arguments: [Any?]) throws -> Any? in try self.invoke(key, Args(arguments)) ?? nil } as JSFunction
            }
            return nil
        }
        set { _ = try? set(key, newValue) }
    }
}

/// A call's arguments, read as the C++ binding reads `args[i]` (`NumberValue`, `Int32Value`,
/// `BooleanValue`, `IsString` …): a missing argument is undefined.
struct Args {
    let values: [Any?]
    init(_ values: [Any?]) { self.values = values }

    var count: Int { values.count }
    subscript(_ i: Int) -> Any? { i < values.count ? jsFlat(values[i]) : nil }

    func isUndefined(_ i: Int) -> Bool { self[i] == nil }
    func isNullish(_ i: Int) -> Bool { jsIsNullish(self[i]) }
    func isString(_ i: Int) -> Bool { self[i] is String }
    func isNumber(_ i: Int) -> Bool { self[i] is Double }
    func isBoolean(_ i: Int) -> Bool { self[i] is Bool }

    /// `NumberValue`: ToNumber, NaN for undefined.
    func number(_ i: Int) -> Double { jsToNumber(self[i]) }
    func float(_ i: Int) -> Float { Float(number(i)) }
    /// `Int32Value`: ToInt32.
    func int32(_ i: Int) -> Int32 { Int32(truncatingIfNeeded: toInt64Modulo(number(i))) }
    /// `Uint32Value`: ToUint32.
    func uint32(_ i: Int) -> UInt32 { UInt32(truncatingIfNeeded: toInt64Modulo(number(i))) }
    /// `BooleanValue`: ToBoolean.
    func bool(_ i: Int) -> Bool { jsIsTruthy(self[i]) }
    /// `ToString`.
    func string(_ i: Int) -> String { jsToString(self[i]) }
    /// A string argument as it is, nil for anything else.
    func stringIfString(_ i: Int) -> String? { self[i] as? String }
    /// A pointer passed as a BigInt or a number (`BigInt(ctx.toString())`).
    func pointer(_ i: Int) -> Int64 {
        switch self[i] {
        case let big as JSBigInt: return big.int64
        case let n as Double: return n.isFinite ? Int64(n) : 0
        case let s as String: return Int64(s) ?? 0
        default: return 0
        }
    }
    /// An object argument read by key, nil when it is not an object.
    func object(_ i: Int) -> JSDynamic? { self[i] as? JSDynamic }
    func host<T: CanvasHost>(_ i: Int, _: T.Type = T.self) -> T? { self[i] as? T }
    /// ArrayBuffer, typed array or DataView.
    func buffer(_ i: Int) -> JSBufferSource? { self[i] as? JSBufferSource }
    func array(_ i: Int) -> [Any?]? { (self[i] as? JSArrayProtocol)?.jsAnyElements }
    func function(_ i: Int) -> JSFunction? { self[i] as? JSFunction }
}

/// ToInt32 and ToUint32 before truncation: the number modulo 2^32, as a whole number.
private func toInt64Modulo(_ value: Double) -> Int64 {
    guard value.isFinite else { return 0 }
    return Int64(value.rounded(.towardZero).truncatingRemainder(dividingBy: 4_294_967_296))
}

/// A property of an untyped object: undefined when the value is not an object.
func member(_ object: Any?, _ key: String) -> Any? {
    guard let o = jsFlat(object), !(o is JSNull) else { return nil }
    return jsFlat((try? jsGet(o, key)) ?? nil)
}

/// A string the C API returns, which the caller owns and frees.
func ownedString(_ c: UnsafePointer<CChar>?, _ free: (UnsafeMutablePointer<CChar>?) -> Void) -> String? {
    guard let c else { return nil }
    defer { free(UnsafeMutablePointer(mutating: c)) }
    return String(cString: c)
}

func typeError(_ message: String) -> JSException { JSException(JSTypeError(message)) }
func rangeError(_ message: String) -> JSException { JSException(JSRangeError(message)) }
