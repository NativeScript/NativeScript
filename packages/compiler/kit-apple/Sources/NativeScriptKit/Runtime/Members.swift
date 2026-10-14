import Foundation

/// The accessor a property's registration (`textProperty.register(TextBase)`) defines on a class's prototype,
/// held by the class's native member of the property's name, which calls it without looking it up by name.
///
/// The member reads and writes by name instead (`jsExpandoGet`, `jsExpandoSet`), and so gets what script would,
/// wherever the accessor may not be what the prototype chain resolves the name to: before the registration has
/// defined it, and for good once script defines or deletes the name on the prototype of the class or of a class
/// extending it. Once script gives any instance an own property of the name, each instance's own is looked for first.
public final class JSTypedMember {
    let owner: AnyClass
    public let name: String
    private var getter: ((Any?) throws -> Any?)?
    private var setter: ((Any?, Any?) throws -> Void)?
    fileprivate var patched = false
    fileprivate var shadowable = false

    public init(_ owner: AnyClass, _ name: String) {
        self.owner = owner
        self.name = name
        JSTypedMembers.add(self)
    }

    @inline(__always)
    private func reachesAccessor(_ object: JSExpando) -> Bool {
        !shadowable || object.jsExpando?.has(name) != true
    }

    public func read(_ object: JSExpando) -> Any? {
        guard let getter, reachesAccessor(object) else { return jsExpandoGet(object, name) }
        do { return try getter(object) } catch { jsReportUncaught(jsCaught(error)); return nil }
    }

    public func write(_ object: JSExpando, _ value: Any?) {
        guard let setter, reachesAccessor(object) else { return jsExpandoSet(object, name, value) }
        do { try setter(object, value) } catch { jsReportUncaught(jsCaught(error)) }
    }

    /// What the registration defined: an accessor replaces both functions, as `JSObject.defineProperty` does;
    /// a value leaves none; a descriptor of attributes only keeps them.
    fileprivate func define(_ d: JSPropertyDescriptor) {
        if patched { return }
        if d.get != nil || d.set != nil {
            getter = d.get
            setter = d.set
        } else if d.value != nil || d.writable != nil {
            unbind()
        }
    }

    fileprivate func unbind() {
        getter = nil
        setter = nil
    }
}

/// The typed members of every class, and what script does at run time that a member has to give way to.
public enum JSTypedMembers {
    nonisolated(unsafe) private static var byName: [String: [JSTypedMember]] = [:]
    /// The classes on whose prototypes script defined or deleted each name outside a registration.
    nonisolated(unsafe) private static var patches: [String: [AnyClass]] = [:]
    /// The classes of instances given an own property of each name.
    nonisolated(unsafe) private static var shadowed: [String: [AnyClass]] = [:]
    nonisolated(unsafe) private static var registering: [JSTypedMember] = []
    private static let lock = NSLock()

    fileprivate static func add(_ member: JSTypedMember) {
        lock.lock(); defer { lock.unlock() }
        byName[member.name, default: []].append(member)
        if patches[member.name]?.contains(where: { extends($0, member.owner) }) == true { member.patched = true }
        if shadowed[member.name]?.contains(where: { extends($0, member.owner) }) == true { member.shadowable = true }
    }

    /// A registration of the members' property: what it defines on their class's prototype under their name is the accessor they call.
    public static func registering<T>(_ members: JSTypedMember..., run: () throws -> T) rethrows -> T {
        lock.lock()
        let outer = registering
        registering = outer + members
        lock.unlock()
        defer {
            lock.lock()
            registering = outer
            lock.unlock()
        }
        return try run()
    }

    /// `Object.defineProperty(Cls.prototype, key, d)`, or with no descriptor `delete Cls.prototype[key]`.
    static func prototypeChanged(_ cls: AnyClass, _ key: String, _ d: JSPropertyDescriptor?) {
        lock.lock(); defer { lock.unlock() }
        if let member = registering.first(where: { $0.owner === cls && $0.name == key }) {
            if let d { member.define(d) } else { member.unbind() }
            return
        }
        patches[key, default: []].append(cls)
        for member in byName[key] ?? [] where extends(cls, member.owner) {
            member.patched = true
            member.unbind()
        }
    }

    /// An instance given an own property under a key, which hides its class's member of that name.
    static func shadow(_ object: AnyObject, _ key: String) {
        let cls: AnyClass = type(of: object)
        lock.lock(); defer { lock.unlock() }
        if shadowed[key]?.contains(where: { $0 === cls }) == true { return }
        shadowed[key, default: []].append(cls)
        for member in byName[key] ?? [] where extends(cls, member.owner) { member.shadowable = true }
    }

    /// Whether `cls` is `base` or extends it.
    private static func extends(_ cls: AnyClass, _ base: AnyClass) -> Bool {
        var c: AnyClass? = cls
        while let k = c {
            if k === base { return true }
            c = class_getSuperclass(k)
        }
        return false
    }
}

/// What core's property system keeps on an instance under its symbols (`this[key]`, `defaultValueKey in this`): the
/// instance's own properties, read and written without the by-name lookups, as no class or prototype holds them.
extension JSExpando {
    public subscript(propertyStorage key: String) -> Any? {
        get { jsExpando?[key] ?? nil }
        set {
            if jsExpando == nil { jsExpando = JSObject() }
            jsExpando![key] = newValue
        }
    }

    public func jsHoldsPropertyStorage(_ key: String) -> Bool { jsExpando?.has(key) == true }

    @discardableResult
    public func jsDeletePropertyStorage(_ key: String) -> Bool { jsExpando?.delete(key) ?? true }
}

/// `object[key](…)` for a symbol classes declare methods under (`this[setNative](value)`).
@discardableResult
public func jsCallSymbolMethod(_ object: JSExpando, _ key: String, _ arguments: Any?...) throws -> Any? {
    try jsCallValue(jsExpandoGet(object, key), this: object, optional: false, arguments)
}

/// `if (n)` of a number, or of an optional chain ending in one (`info?.keyframes?.length`).
@inline(__always)
public func jsTruthy(number: Double?) -> Bool {
    guard let number else { return false }
    return number != 0 && !number.isNaN
}

/// `if (x)` of a value typed as a function or an object, which is truthy wherever it is there.
@inline(__always)
public func jsTruthy<T>(present value: T?) -> Bool { value != nil }

/// `if (this[setNative])`: a method is truthy with no look at what else the value might be.
@inline(__always)
public func jsTruthy(method value: Any?) -> Bool {
    guard let value else { return false }
    return jsTypeKind(value) == .function || jsIsTruthy(value)
}
