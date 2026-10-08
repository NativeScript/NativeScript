import Foundation

/// An object used as a dictionary (`Record<string, V>`, `{ [key: string]: V }`):
/// JavaScript's key order (integer-like keys ascending, then insertion order)
/// and reference semantics, which a Swift Dictionary has neither of.
public final class JSRecord<Value>: JSDynamic, JSReactiveConvertible, ExpressibleByDictionaryLiteral {
    public let object = JSObject()

    public init() {}

    public init(dictionaryLiteral elements: (String, Value)...) {
        for (key, value) in elements { object[key] = value }
    }

    public init(_ entries: [(String, Value)]) {
        for (key, value) in entries { object[key] = value }
    }

    public init(_ dictionary: [String: Value]) {
        for key in dictionary.keys.sorted() { object[key] = dictionary[key] }
    }

    public subscript(key: String) -> Value? {
        get { object[key] as? Value }
        set { if let newValue { object[key] = newValue } else { _ = object.delete(key) } }
    }

    @discardableResult public func delete(_ key: String) -> Bool { object.delete(key) }
    public func has(_ key: String) -> Bool { object.has(key) }

    public var keys: JSArray<String> { JSArray(object.jsKeys) }
    public var values: JSArray<Value> { JSArray(object.jsKeys.compactMap { object[$0] as? Value }) }
    public var entries: JSArray<(String, Value)> { JSArray(object.jsKeys.compactMap { k in (object[k] as? Value).map { (k, $0) } }) }

    public var jsKeys: [String] { object.jsKeys }
    public var jsClassName: String? { nil }
    public subscript(jsKey key: String) -> Any? {
        get { object[jsKey: key] }
        set { object[jsKey: key] = newValue }
    }

    public var jsTracker: JSTracker? {
        get { object.jsTracker }
        set { object.jsTracker = newValue }
    }

    public func jsMakeReactive() { object.jsMakeReactive() }
}
