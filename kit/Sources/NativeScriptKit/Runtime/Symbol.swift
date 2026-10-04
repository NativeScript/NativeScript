import Foundation

/// A JavaScript symbol: equal only to itself. As a property key it is `key`,
/// a string no JavaScript code spells, which `Object.keys`, `for…in` and JSON skip.
public final class JSSymbol: Hashable, CustomStringConvertible {
    public let jsDescription: String?
    public let key: String

    public init(_ description: String?) {
        jsDescription = description
        JSSymbol.count += 1
        key = "\u{0}@@\(JSSymbol.count)"
        JSSymbol.byKey[key] = self
    }

    nonisolated(unsafe) private static var count = 0
    nonisolated(unsafe) private static var byKey: [String: JSSymbol] = [:]
    nonisolated(unsafe) private static var registry: [String: JSSymbol] = [:]

    /// `Symbol.for(key)`: one symbol per key, program-wide.
    public static func `for`(_ key: String) -> JSSymbol {
        if let s = registry[key] { return s }
        let s = JSSymbol(key)
        registry[key] = s
        return s
    }

    /// `Symbol.keyFor(symbol)`: the key of a registered symbol.
    public static func keyFor(_ symbol: JSSymbol) -> String? {
        guard let d = symbol.jsDescription, registry[d] === symbol else { return nil }
        return d
    }

    public static let iterator = JSSymbol("Symbol.iterator")
    public static let asyncIterator = JSSymbol("Symbol.asyncIterator")
    public static let toPrimitive = JSSymbol("Symbol.toPrimitive")
    public static let toStringTag = JSSymbol("Symbol.toStringTag")
    public static let hasInstance = JSSymbol("Symbol.hasInstance")

    /// The symbol a property key stands for.
    public static func of(key: String) -> JSSymbol? {
        key.utf8.first == 0 ? byKey[key] : nil
    }

    public func toString() -> String { "Symbol(\(jsDescription ?? ""))" }
    public func valueOf() -> JSSymbol { self }
    public var description: String { toString() }

    public static func == (a: JSSymbol, b: JSSymbol) -> Bool { a === b }
    public func hash(into hasher: inout Hasher) { hasher.combine(ObjectIdentifier(self)) }
}

/// `Symbol(description)`.
public func jsSymbol(_ description: String?) -> JSSymbol { JSSymbol(description) }

/// Whether a property key is a symbol's.
@inline(__always)
public func jsIsSymbolKey(_ key: String) -> Bool { key.utf8.first == 0 }

/// An object with symbol-keyed properties, which print after its other keys.
public protocol JSSymbolKeyed: AnyObject {
    var jsSymbolKeys: [String] { get }
}

/// `[Symbol.toPrimitive](hint)` on a class.
public protocol JSToPrimitive: AnyObject {
    func jsToPrimitive(_ hint: String) throws -> Any?
}

/// `get [Symbol.toStringTag]()` on a class.
public protocol JSToStringTag: AnyObject {
    var jsToStringTag: String { get }
}

/// `Object.getOwnPropertySymbols(value)`.
public func jsOwnPropertySymbols(_ value: Any?) -> JSArray<JSSymbol> {
    guard let keyed = jsFlat(value) as? JSSymbolKeyed else { return JSArray() }
    return JSArray(keyed.jsSymbolKeys.compactMap(JSSymbol.of(key:)))
}

/// `Object.prototype.toString.call(value)`.
public func jsObjectToString(_ value: Any?) -> String {
    switch jsFlat(value) {
    case nil: return "[object Undefined]"
    case is JSNull: return "[object Null]"
    case let tagged as JSToStringTag: return "[object \(tagged.jsToStringTag)]"
    case is JSArrayProtocol: return "[object Array]"
    case is String: return "[object String]"
    case is Bool: return "[object Boolean]"
    case is JSError: return "[object Error]"
    case is JSDate: return "[object Date]"
    case is JSRegExp: return "[object RegExp]"
    case is JSMapProtocol: return "[object Map]"
    case is JSSetProtocol: return "[object Set]"
    case is JSThenable: return "[object Promise]"
    case is JSSymbol: return "[object Symbol]"
    case let v?:
        if jsNumeric(v) != nil { return "[object Number]" }
        if jsIsFunction(v) { return "[object Function]" }
        return "[object Object]"
    }
}

/// ToPrimitive(value, hint) for an object with `[Symbol.toPrimitive]`; nil for anything else.
func jsUserPrimitive(_ value: Any, _ hint: String) -> Any?? {
    guard let convertible = value as? JSToPrimitive else { return nil }
    do { return .some(try convertible.jsToPrimitive(hint)) } catch {
        jsReportUncaught(jsCaught(error))
        return .some(nil)
    }
}
