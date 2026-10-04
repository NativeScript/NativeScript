import UIKit

/// `Property` from @nativescript/core's ui/core/properties, for properties a
/// plugin registers: by name, on a view class and its subclasses. A local
/// value is stored like any view property; `valueChanged` runs on every
/// change, the converter on string values, and the class's native setter
/// (`[property.setNative]`, a `setProperty` case of the compiled class) when
/// the view is loaded, as core replays native setters.
public final class Property {
    public let name: String
    public let defaultValue: Any?
    let valueChanged: Any?
    let valueConverter: Any?
    let equalityComparer: Any?
    let affectsLayout: Bool

    public init(_ options: Any?) {
        let o = jsFlat(options) as? JSDynamic
        name = (o?[jsKey: "name"] as? String) ?? ""
        defaultValue = o?[jsKey: "defaultValue"]
        valueChanged = jsFlat(o?[jsKey: "valueChanged"])
        valueConverter = jsFlat(o?[jsKey: "valueConverter"])
        equalityComparer = jsFlat(o?[jsKey: "equalityComparer"])
        affectsLayout = jsTruthy(o?[jsKey: "affectsLayout"])
    }

    /// `property.register(Class)`: `cls` is the class itself (`Drawer.self`).
    public func register(_ cls: Any?) {
        guard let type = jsFlat(cls) as? AnyClass else { return }
        Property.registered[ObjectIdentifier(type), default: [:]][name] = self
        Property.lookup.removeAll()
    }

    /// `nativeValueChange(owner, value)`: a value the native side reports, stored without being written back.
    public func nativeValueChange(_ owner: Any?, _ value: Any?) {
        (jsFlat(owner) as? View)?.nativeValueChange(name, value)
    }

    func converted(_ value: Any?) -> Any? {
        guard valueConverter != nil, let string = jsFlat(value) as? String else { return value }
        return jsReported { try jsCall(valueConverter, string) } ?? nil
    }

    func same(_ old: Any?, _ new: Any?) -> Bool {
        if equalityComparer != nil { return jsTruthy(jsReported { try jsCall(equalityComparer, old, new) } ?? nil) }
        return jsStrictEquals(old, new)
    }

    func changed(_ target: View, _ old: Any?, _ new: Any?) {
        if affectsLayout { target.requestLayout() }
        if valueChanged != nil { jsReport { _ = try jsCall(valueChanged, target, old ?? defaultValue, new ?? defaultValue) } }
    }

    private static var registered: [ObjectIdentifier: [String: Property]] = [:]
    private static var lookup: [String: Property?] = [:]

    /// The property registered as `name` on `type` or a class it extends.
    static func registered(_ name: String, on type: AnyClass) -> Property? {
        let key = "\(ObjectIdentifier(type).hashValue):\(name)"
        if let found = lookup[key] { return found }
        var c: AnyClass? = type
        var found: Property?
        while let current = c, found == nil {
            found = registered[ObjectIdentifier(current)]?[name]
            c = class_getSuperclass(current)
        }
        lookup[key] = found
        return found
    }
}

/// `CSSType('Name')`: the type selector a compiled class answers to is in its `cssType` override.
public func CSSType(_ name: String) -> (Any?) -> Void { { _ in } }

/// A JavaScript value from a call that may throw, reported like a handler's error; nil if it threw.
@discardableResult
func jsReported<T>(_ body: () throws -> T) -> T? {
    do { return try body() } catch { jsReport { throw error }; return nil }
}
