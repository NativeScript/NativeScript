import Foundation

/// NativeScript's `WeakRef`: `get()` (and the standard `deref()`) is the object while it lives.
public final class JSWeakRef<T: AnyObject>: JSHostObject, JSToStringTag {
    private weak var target: T?

    public init(_ target: T) { self.target = target }

    public func get() -> T? { target }
    public func deref() -> T? { target }
    public func clear() { target = nil }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    /// `ref.get()` where the reference is untyped (`let pair; pair.tagetRef.get()`).
    public func jsInvoke(_ key: String, _ arguments: [Any?]) throws -> Any?? {
        switch key {
        case "get", "deref": return .some(target)
        case "clear": target = nil; return .some(nil)
        default: return nil
        }
    }
    public var jsClassName: String? { "WeakRef" }
    public var jsToStringTag: String { "WeakRef" }
}

/// A `WeakMap` or `WeakSet`, whose contents cannot be listed.
protocol JSWeakCollection {}

private struct JSWeakEntry<Value> {
    weak var key: AnyObject?
    var value: Value
}

/// The identity of a weak collection's key; nil for a primitive, which cannot be one.
private func jsWeakKey(_ key: Any?) -> AnyObject? {
    guard let v = jsFlat(key), jsIsObject(v), !(v is JSNull), !(v is JSSymbol) else { return nil }
    return v as AnyObject
}

/// A JavaScript `WeakMap`: keys by identity, held weakly; an entry goes with its key.
public final class JSWeakMap<Key, Value>: JSDynamic, JSWeakCollection {
    private var table: [ObjectIdentifier: JSWeakEntry<Value>] = [:]

    public init() {}

    public convenience init<S: Sequence, K, V>(_ entries: S) throws where S.Element == (K, V) {
        self.init()
        for (k, v) in entries { try set(k as! Key, v as! Value) }
    }

    private func live(_ key: Key) -> (ObjectIdentifier, JSWeakEntry<Value>)? {
        guard let object = jsWeakKey(key) else { return nil }
        let id = ObjectIdentifier(object)
        guard let entry = table[id], entry.key === object else { return nil }
        return (id, entry)
    }

    public func get(_ key: Key) -> Value? { live(key)?.1.value }
    public func has(_ key: Key) -> Bool { live(key) != nil }

    @discardableResult
    public func set(_ key: Key, _ value: Value) throws -> JSWeakMap<Key, Value> {
        guard let object = jsWeakKey(key) else { throw JSException(JSTypeError("Invalid value used as weak map key")) }
        if table.count >= 32 && table.count.isMultiple(of: 32) { table = table.filter { $0.value.key != nil } }
        table[ObjectIdentifier(object)] = JSWeakEntry(key: object, value: value)
        return self
    }

    @discardableResult
    public func delete(_ key: Key) -> Bool {
        guard let (id, _) = live(key) else { return false }
        table[id] = nil
        return true
    }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "WeakMap" }
}

/// A JavaScript `WeakSet`: members by identity, held weakly.
public final class JSWeakSet<Element>: JSDynamic, JSWeakCollection {
    private let map = JSWeakMap<Element, Bool>()

    public init() {}

    public convenience init<S: Sequence>(_ values: S) throws {
        self.init()
        for v in values { try add(v as! Element) }
    }

    @discardableResult
    public func add(_ value: Element) throws -> JSWeakSet<Element> {
        guard jsWeakKey(value) != nil else { throw JSException(JSTypeError("Invalid value used in weak set")) }
        try map.set(value, true)
        return self
    }

    public func has(_ value: Element) -> Bool { map.has(value) }
    @discardableResult public func delete(_ value: Element) -> Bool { map.delete(value) }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "WeakSet" }
}

/// `new WeakRef(value)` of an untyped value: only an object can be held weakly.
public func jsWeakTarget(_ value: Any?) throws -> AnyObject {
    guard let v = jsFlat(value), type(of: v) is AnyClass else { throw JSException(JSTypeError("WeakRef: invalid target")) }
    return v as AnyObject
}
