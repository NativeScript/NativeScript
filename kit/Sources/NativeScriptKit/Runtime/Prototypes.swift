import Foundation

/// `Cls.prototype` as script reaches it, for classes compiled in the kit generated from
/// core: the accessors and values `Object.defineProperty(Cls.prototype, …)` and
/// `Cls.prototype.x = v` put there, which instances of the class and of the classes
/// extending it read and write.
public enum JSPrototypes {
    private static var table: [ObjectIdentifier: JSObject] = [:]

    public static func of(_ cls: AnyClass) -> JSObject {
        if let p = table[ObjectIdentifier(cls)] { return p }
        let p = JSObject()
        table[ObjectIdentifier(cls)] = p
        return p
    }

    /// The nearest prototype in a class's chain that has the key.
    static func holder(_ cls: AnyClass, _ key: String) -> JSObject? {
        if table.isEmpty { return nil }
        var c: AnyClass? = cls
        while let k = c {
            if let p = table[ObjectIdentifier(k)], p.has(key) { return p }
            c = class_getSuperclass(k)
        }
        return nil
    }
}

/// An instance of a class generated from core: the properties script gives it beyond the
/// fields it declares (`this[key] = v`, symbol-keyed ones included), its methods named by
/// symbols (`[prop.setNative](value)`), and what its class's prototype defines.
public protocol JSExpando: JSDynamic, JSSymbolKeyed, JSDeletable {
    var jsExpando: JSObject? { get set }
    /// The method a class declares under the symbol whose key this is; the method takes its receiver as `this`.
    func jsSymbolMethod(_ key: String) -> JSMethod?
}

/// A key a class does not declare as a field: a symbol-named method, its prototype's property, or the instance's own.
public func jsExpandoGet(_ object: JSExpando, _ key: String) -> Any? {
    if jsIsSymbolKey(key), let method = object.jsSymbolMethod(key) { return method }
    if let p = JSPrototypes.holder(type(of: object), key) {
        do { return try p.get(key, receiver: object) } catch { jsReportUncaught(jsCaught(error)); return nil }
    }
    return object.jsExpando?[key] ?? nil
}

public func jsExpandoSet(_ object: JSExpando, _ key: String, _ value: Any?) {
    if let setter = JSPrototypes.holder(type(of: object), key)?.setter(key) {
        do { try setter(object, value) } catch { jsReportUncaught(jsCaught(error)) }
        return
    }
    if object.jsExpando == nil { object.jsExpando = JSObject() }
    object.jsExpando![key] = value
}

/// `key in object` for what the object does not declare as a field.
public func jsExpandoHas(_ object: JSExpando, _ key: String) -> Bool {
    if object.jsExpando?.has(key) == true { return true }
    if jsIsSymbolKey(key), object.jsSymbolMethod(key) != nil { return true }
    return JSPrototypes.holder(type(of: object), key) != nil
}
