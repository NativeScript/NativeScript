import Foundation

/// `Cls.prototype` as script reaches it, for classes compiled in the kit generated from
/// core: the accessors and values `Object.defineProperty(Cls.prototype, …)` and
/// `Cls.prototype.x = v` put there, which instances of the class and of the classes
/// extending it read and write, and the class's own accessors. Each class's prototype
/// is one object, chained to its superclass's and, at the root, to `Object.prototype`.
public enum JSPrototypes {
    nonisolated(unsafe) private static var table: [ObjectIdentifier: JSObject] = [:]
    /// The class of each prototype object, by the object's identity.
    nonisolated(unsafe) private static var owners: [ObjectIdentifier: AnyClass] = [:]
    /// Accessors a class declares, put on its prototype when the prototype is first made.
    nonisolated(unsafe) private static var declared: [ObjectIdentifier: [(String, JSPropertyDescriptor)]] = [:]
    nonisolated(unsafe) private static var builtins: [String: JSObject] = [:]

    /// `Object.prototype`, with the methods translated code calls on any object.
    public static let objectPrototype: JSObject = {
        let p = JSObject()
        let key = { (a: [Any?]) -> String in (jsFlat(jsArg(a, 0)) as? JSSymbol)?.key ?? jsToString(jsArg(a, 0)) }
        p["hasOwnProperty"] = { this, a in jsHasOwn(this, key(a)) } as JSMethod
        p["propertyIsEnumerable"] = { this, a in jsHasOwn(this, key(a)) && jsKeysOf(this).contains(key(a)) } as JSMethod
        p["isPrototypeOf"] = { this, a in
            var current = try? jsGetPrototypeOf(jsArg(a, 0))
            while let c = jsFlat(current), !(c is JSNull) {
                if let o = c as? JSObject, let t = jsFlat(this) as? JSObject, o === t { return true }
                current = try? jsGetPrototypeOf(c)
            }
            return false
        } as JSMethod
        p["toString"] = { this, _ in jsObjectToString(this) } as JSMethod
        p["valueOf"] = { this, _ in this } as JSMethod
        for k in ["hasOwnProperty", "propertyIsEnumerable", "isPrototypeOf", "toString", "valueOf"] {
            try? p.defineProperty(k, JSPropertyDescriptor(enumerable: false))
        }
        return p
    }()

    public static func of(_ cls: AnyClass) -> JSObject {
        let id = ObjectIdentifier(cls)
        if let p = table[id] { return p }
        let p = JSObject()
        table[id] = p
        owners[ObjectIdentifier(p)] = cls
        for (key, d) in declared[id] ?? [] { try? p.defineProperty(key, d) }
        return p
    }

    /// The accessors a class declares (`get text()`, `set text(v)`): its prototype's own properties.
    public static func declare(_ cls: AnyClass, _ accessors: [(String, ((Any?) throws -> Any?)?, ((Any?, Any?) throws -> Void)?)]) {
        let list = accessors.map { ($0.0, JSPropertyDescriptor(get: $0.1, set: $0.2, enumerable: false, configurable: true)) }
        declared[ObjectIdentifier(cls)] = list
        if let p = table[ObjectIdentifier(cls)] { for (key, d) in list { try? p.defineProperty(key, d) } }
    }

    /// The prototype a built-in kind of value has (`Array.prototype`), its own object.
    static func builtin(_ name: String) -> JSObject {
        if let p = builtins[name] { return p }
        let p = JSObject()
        builtins[name] = p
        return p
    }

    /// `Object.getPrototypeOf` of a plain object: a class's prototype leads to its superclass's.
    static func prototypeOf(object o: JSObject) -> Any? {
        if o === objectPrototype { return jsNull }
        if let cls = owners[ObjectIdentifier(o)], let superclass = class_getSuperclass(cls), !isRoot(superclass) { return of(superclass) }
        return objectPrototype
    }

    /// The class Swift's own root classes extend, which no script class corresponds to.
    private static func isRoot(_ cls: AnyClass) -> Bool { NSStringFromClass(cls) == "_TtCs12_SwiftObject" }

    /// The nearest prototype in a class's chain that has the key.
    static func holder(_ cls: AnyClass, _ key: String) -> JSObject? {
        if table.isEmpty && declared.isEmpty { return nil }
        var c: AnyClass? = cls
        while let k = c {
            let id = ObjectIdentifier(k)
            if let p = table[id] ?? (declared[id] != nil ? of(k) : nil), p.has(key) { return p }
            c = class_getSuperclass(k)
        }
        return nil
    }

    /// What an instance without a value of its own reads for a key: its prototype chain's.
    public static func value(_ cls: AnyClass, _ key: String, _ receiver: Any?) -> Any? {
        guard let p = holder(cls, key) else { return nil }
        do { return try p.get(key, receiver: receiver) } catch { jsReportUncaught(jsCaught(error)); return nil }
    }
}

/// `Object.getPrototypeOf(value)`.
public func jsGetPrototypeOf(_ value: Any?) throws -> Any? {
    guard let v = jsFlat(value), !(v is JSNull) else { throw JSException(JSTypeError("Cannot convert undefined or null to object")) }
    switch v {
    case let o as JSObject: return JSPrototypes.prototypeOf(object: o)
    case is AnyClass: return JSPrototypes.builtin("Function")
    case is JSArrayProtocol: return JSPrototypes.builtin("Array")
    case is String: return JSPrototypes.builtin("String")
    case is Double: return JSPrototypes.builtin("Number")
    case is Bool: return JSPrototypes.builtin("Boolean")
    case is JSMapProtocol: return JSPrototypes.builtin("Map")
    case is JSSetProtocol: return JSPrototypes.builtin("Set")
    case is JSSymbol: return JSPrototypes.builtin("Symbol")
    default:
        if jsIsFunction(v) { return JSPrototypes.builtin("Function") }
        if jsIsObject(v) { return JSPrototypes.of(type(of: v as AnyObject)) }
        return JSPrototypes.objectPrototype
    }
}

/// `Object.prototype.hasOwnProperty.call(object, key)`.
public func jsHasOwn(_ object: Any?, _ key: String) -> Bool {
    switch jsFlat(object) {
    case let o as JSObject: return o.has(key)
    case let e as JSExpando: return e.jsExpando?.has(key) == true || e.jsKeys.contains(key)
    case let d as JSDynamic: return d.jsKeys.contains(key)
    case let a as JSArrayProtocol: return key == "length" || jsArrayIndex(key).map { Int($0) < a.jsLength } ?? false
    case let s as String: return key == "length" || jsArrayIndex(key).map { Int($0) < s.utf16.count } ?? false
    default: return false
    }
}

/// `@decorator class Cls {}`: each decorator, the last first, is called with what the ones before it gave.
public func jsDecorate(_ cls: AnyClass, _ decorators: [Any?]) throws {
    var target: Any? = cls
    for d in decorators.reversed() {
        let result = try jsCall(d, target)
        if jsIsTruthy(result) { target = result }
    }
    guard let decorated = jsFlat(target) as? AnyClass, ObjectIdentifier(decorated) == ObjectIdentifier(cls) else {
        throw JSException(JSTypeError("A class decorator that replaces the class is not supported in a compiled app"))
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

/// A key a class does not declare as a field: a symbol-named method, the instance's own property, or its prototype's.
public func jsExpandoGet(_ object: JSExpando, _ key: String) -> Any? {
    if jsIsSymbolKey(key), let method = object.jsSymbolMethod(key) { return method }
    if let own = object.jsExpando, own.has(key) {
        do { return try own.get(key, receiver: object) } catch { jsReportUncaught(jsCaught(error)); return nil }
    }
    return JSPrototypes.value(type(of: object), key, object)
}

public func jsExpandoSet(_ object: JSExpando, _ key: String, _ value: Any?) {
    do {
        if let own = object.jsExpando, own.has(key) {
            if let setter = own.setter(key) { try setter(object, value) } else { try own.put(key, value) }
            return
        }
        if let setter = JSPrototypes.holder(type(of: object), key)?.setter(key) { return try setter(object, value) }
    } catch { jsReportUncaught(jsCaught(error)); return }
    if object.jsExpando == nil { object.jsExpando = JSObject() }
    object.jsExpando![key] = value
}

/// `key in object` for what the object does not declare as a field.
public func jsExpandoHas(_ object: JSExpando, _ key: String) -> Bool {
    if object.jsExpando?.has(key) == true { return true }
    if jsIsSymbolKey(key), object.jsSymbolMethod(key) != nil { return true }
    return JSPrototypes.holder(type(of: object), key) != nil
}

/// A property an object was given at run time (`Object.defineProperty(this, key, …)`), which hides its class's member of that name.
public func jsOwnProperty(_ object: Any?, _ key: String) -> Any?? {
    guard let own = (jsFlat(object) as? JSExpando)?.jsExpando, own.has(key) else { return nil }
    return .some(try? own.get(key, receiver: object))
}

/// A function value called as a method of `this`; `optional` is `?.()`, which an undefined or null function skips.
@discardableResult
public func jsCallValue(_ function: Any?, this: Any?, optional: Bool, _ arguments: [Any?]) throws -> Any? {
    if optional && jsIsNullish(function) { return nil }
    if let method = jsFlat(function) as? JSMethod { return try method(this, arguments) }
    return try jsCall(function, spread: arguments)
}

/// A method found on a prototype (`super[key]`), called with `this`; a TypeError where there is none.
@discardableResult
public func jsCallFound(_ method: JSMethod?, _ this: Any?, _ arguments: [Any?]) throws -> Any? {
    guard let method else { throw JSException(JSTypeError("method is not a function")) }
    return try method(this, arguments)
}
