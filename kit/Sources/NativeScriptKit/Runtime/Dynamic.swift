import Foundation

// JavaScript's object operations on values translated code holds untyped:
// what plugins written against loose types do with options bags, event
// payloads and the views they decorate.

/// Argument `index` of a dynamic call; a missing one is undefined.
@inline(__always)
public func jsArg(_ arguments: [Any?], _ index: Int) -> Any? {
    index < arguments.count ? arguments[index] : nil
}

/// `delete object[key]` in strict code: a property that cannot be deleted throws a TypeError.
@discardableResult
public func jsDelete(_ object: Any?, _ key: String) throws -> Bool {
    switch jsFlat(object) {
    case let o as JSObject:
        if !o.delete(key) { throw JSException(JSTypeError("Cannot delete property '\(key)' of #<Object>")) }
        return true
    case let d as JSDynamic where jsRestriction(d) >= 2 && d.jsKeys.contains(key):
        throw JSException(JSTypeError("Cannot delete property '\(key)' of #<Object>"))
    case let d as JSDeletable: return d.jsDeleteOwn(key)
    default: return true
    }
}

/// A property's slot when it is an accessor or its attributes are not all true.
struct JSPropertySlot {
    var get: ((Any?) throws -> Any?)?
    var set: ((Any?, Any?) throws -> Void)?
    var isAccessor = false
    var enumerable = true
    var writable = true
    var configurable = true

    var isPlain: Bool { !isAccessor && enumerable && writable && configurable }
}

/// A property descriptor as `Object.defineProperty` reads it.
public struct JSPropertyDescriptor {
    public var value: Any??
    public var get: ((Any?) throws -> Any?)?
    public var set: ((Any?, Any?) throws -> Void)?
    public var enumerable: Bool?
    public var writable: Bool?
    public var configurable: Bool?

    public init(value: Any?? = nil, get: ((Any?) throws -> Any?)? = nil, set: ((Any?, Any?) throws -> Void)? = nil, enumerable: Bool? = nil, writable: Bool? = nil, configurable: Bool? = nil) {
        self.value = value
        self.get = get
        self.set = set
        self.enumerable = enumerable
        self.writable = writable
        self.configurable = configurable
    }

    /// A descriptor object script wrote (`{ value, enumerable, get() {…} }`).
    public init(_ object: Any?) throws {
        guard let o = jsFlat(object) as? JSDynamic else { throw JSException(JSTypeError("Property description must be an object: \(jsToString(object))")) }
        let has = { (k: String) in jsHasKey(o, k) }
        if has("value") { value = .some(o[jsKey: "value"]) }
        if has("get"), let g = jsFlat(o[jsKey: "get"]) { let f = jsReceiving(g); get = { this in try f(this, []) } }
        if has("set"), let s = jsFlat(o[jsKey: "set"]) { let f = jsReceiving(s); set = { this, v in _ = try f(this, [v]) } }
        if has("enumerable") { enumerable = jsIsTruthy(o[jsKey: "enumerable"]) }
        if has("writable") { writable = jsIsTruthy(o[jsKey: "writable"]) }
        if has("configurable") { configurable = jsIsTruthy(o[jsKey: "configurable"]) }
    }
}

/// A function value called with a receiver: a method sees it as `this`.
private func jsReceiving(_ f: Any) -> (Any?, [Any?]) throws -> Any? {
    if let method = f as? JSMethod { return { this, args in try method(this, args) } }
    if let function = f as? JSFunction { return { _, args in try function(args) } }
    return { _, _ in throw JSException(JSTypeError("Getter must be a function: \(jsInspect(f))")) }
}

/// A function that reads `this`: a method of an untyped object literal.
public typealias JSMethod = (Any?, [Any?]) throws -> Any?

/// `object.method(args)` on an untyped object: a method sees the object as `this`.
@discardableResult
public func jsCallMethod(_ object: Any?, _ key: String, _ arguments: Any?...) throws -> Any? {
    try callMethod(object, key, arguments)
}

/// `object?.key(…)`: undefined when the object is undefined or null.
@discardableResult
public func jsCallMethodIfPresent(_ object: Any?, _ key: String, _ arguments: Any?...) throws -> Any? {
    jsIsNullish(object) ? nil : try callMethod(object, key, arguments)
}

/// `object.key(...args)` on an untyped object.
@discardableResult
public func jsCallMethod(_ object: Any?, _ key: String, spread arguments: [Any?]) throws -> Any? {
    try callMethod(object, key, arguments)
}

@discardableResult
public func jsCallMethodIfPresent(_ object: Any?, _ key: String, spread arguments: [Any?]) throws -> Any? {
    jsIsNullish(object) ? nil : try callMethod(object, key, arguments)
}

private func callMethod(_ object: Any?, _ key: String, _ arguments: [Any?]) throws -> Any? {
    // `f.call(thisArg, …)` and `f.apply(thisArg, args)` on a function value.
    if key == "call" || key == "apply", let f = jsFlat(object), f is JSMethod || f is JSFunction {
        let this = arguments.first ?? nil
        let rest = key == "call" ? Array(arguments.dropFirst()) : (jsFlat(arguments.count > 1 ? arguments[1] : nil) as? JSArrayProtocol)?.jsAnyElements ?? []
        if let method = f as? JSMethod { return try method(this, rest) }
        return try (f as! JSFunction)(rest)
    }
    // `f.bind(thisArg, …)`: a function of the rest of the arguments.
    if key == "bind", let f = jsFlat(object), f is JSMethod || f is JSFunction {
        let this = arguments.first ?? nil
        let bound = Array(arguments.dropFirst())
        if let method = f as? JSMethod { return { (rest: [Any?]) throws -> Any? in try method(this, bound + rest) } as JSFunction }
        let function = f as! JSFunction
        return { (rest: [Any?]) throws -> Any? in try function(bound + rest) } as JSFunction
    }
    // `cls.new()` of a native class object: an instance of its plain initializer, as `[cls new]`.
    if key == "new", arguments.isEmpty, let cls = jsFlat(object) as? NSObject.Type { return cls.init() }
    // A class's `toString()`: one the program declares as its source begins, any other as the
    // runtime prints a native one (`function WeakRef() { [native code] }`).
    if key == "toString", let cls = jsFlat(object) as? Any.Type {
        let name = String(describing: cls).components(separatedBy: "<")[0]
        return cls is JSStaticKeyed.Type ? "class \(name) { }" : "function \(name.replacingOccurrences(of: "JS", with: "", options: .anchored))() { [native code] }"
    }
    if let host = jsFlat(object) as? JSHostObject, let result = try host.jsInvoke(key, arguments) { return result }
    var f = try jsGet(object, key)
    // What every object inherits (`hasOwnProperty`), where the object has nothing of that name.
    if jsFlat(f) == nil, jsFlat(object) is JSDynamic, JSPrototypes.objectPrototype.has(key) { f = JSPrototypes.objectPrototype[key] }
    if let method = jsFlat(f) as? JSMethod { return try method(object, arguments) }
    if let function = jsFlat(f) as? JSFunction { return try function(arguments) }
    if let moot = jsFlat(f) as? JSMootValue { throw moot.unavailable() }
    throw JSException(JSTypeError("\(jsInspect(f)) is not a function"))
}

/// An object a native binding implements, as an engine's host objects are: a method call
/// reaches it by name, without the method first read as a function value.
public protocol JSHostObject: JSDynamic {
    /// The named method's result, or nil when the object has no method of that name.
    func jsInvoke(_ key: String, _ arguments: [Any?]) throws -> Any??
}

/// An object whose accessor properties print as `[Getter]`, `[Setter]` or `[Getter/Setter]`.
public protocol JSAccessorKeyed: AnyObject {
    func jsAccessorKind(_ key: String) -> String?
}

/// `Object.defineProperty(object, key, descriptor)`.
@discardableResult
public func jsDefineProperty(_ object: Any?, _ key: String, _ descriptor: Any?) throws -> Any? {
    let d = try JSPropertyDescriptor(descriptor)
    switch jsFlat(object) {
    case let o as JSObject: try o.defineProperty(key, d)
    case let expando as JSExpando:
        if expando.jsExpando == nil { expando.jsExpando = JSObject() }
        try expando.jsExpando!.defineProperty(key, d)
    case let dynamic as JSDynamic:
        if d.get != nil || d.set != nil { throw JSException(JSTypeError("Cannot define an accessor on a typed object: \(key)")) }
        if case .some(let v) = d.value { dynamic[jsKey: key] = v }
    default: throw JSException(JSTypeError("Object.defineProperty called on non-object"))
    }
    return object
}

/// `Object.getOwnPropertyDescriptor(object, key)`.
public func jsOwnPropertyDescriptor(_ object: Any?, _ key: String) -> Any? {
    switch jsFlat(object) {
    case let o as JSObject: return o.descriptor(key)
    case let dynamic as JSDynamic:
        guard dynamic.jsKeys.contains(key) else { return nil }
        let level = jsRestriction(dynamic)
        return JSObject([("value", dynamic[jsKey: key]), ("writable", level < 3), ("enumerable", true), ("configurable", level < 2)])
    default: return nil
    }
}

/// `Object.getOwnPropertyNames(value)`.
public func jsOwnPropertyNames(_ value: Any?) -> JSArray<String> {
    switch jsFlat(value) {
    case let o as JSObject: return JSArray(o.ownPropertyNames)
    case let array as JSArrayProtocol: return JSArray((0..<array.jsLength).map { String($0) } + ["length"])
    case let string as String: return JSArray((0..<string.utf16.count).map { String($0) } + ["length"])
    default: return JSArray(jsKeysOf(value))
    }
}

nonisolated(unsafe) private var jsRestricted: [ObjectIdentifier: JSRestriction] = [:]

/// How far `Object.preventExtensions`, `seal` or `freeze` closed an object other than a plain one.
private final class JSRestriction {
    weak var object: AnyObject?
    var level: Int
    init(_ object: AnyObject, _ level: Int) { self.object = object; self.level = level }
}

/// 0: open; 1: not extensible; 2: sealed; 3: frozen.
func jsRestriction(_ object: AnyObject) -> Int {
    guard let r = jsRestricted[ObjectIdentifier(object)], r.object === object else { return 0 }
    return r.level
}

private func jsRestrict(object v: Any?, level: Int) {
    switch jsFlat(v) {
    case let o as JSObject: o.restrict(sealed: level >= 2, frozen: level >= 3)
    case let v? where jsIsObject(v) && !(v is JSNull):
        let object = v as AnyObject
        jsRestricted[ObjectIdentifier(object)] = JSRestriction(object, max(level, jsRestriction(object)))
    default: break
    }
}

/// `Object.freeze(value)`.
@discardableResult
public func jsFreeze<T>(_ value: T) -> T {
    jsRestrict(object: value, level: 3)
    return value
}

/// `Object.seal(value)` and `Object.preventExtensions(value)`.
@discardableResult
public func jsRestrict<T>(_ value: T, sealed: Bool) -> T {
    jsRestrict(object: value, level: sealed ? 2 : 1)
    return value
}

private func jsLevel(_ value: Any?) -> Int? {
    switch jsFlat(value) {
    case let o as JSObject: return o.isFrozen ? 3 : o.isSealed ? 2 : o.extensible ? 0 : 1
    case let v? where jsIsObject(v) && !(v is JSNull): return jsRestriction(v as AnyObject)
    default: return nil
    }
}

/// `Object.isFrozen(value)`: primitives are.
public func jsIsFrozen(_ value: Any?) -> Bool { (jsLevel(value) ?? 3) == 3 }

/// `Object.isSealed(value)`.
public func jsIsSealed(_ value: Any?) -> Bool { (jsLevel(value) ?? 3) >= 2 }

/// `Object.isExtensible(value)`.
public func jsIsExtensible(_ value: Any?) -> Bool { (jsLevel(value) ?? 1) == 0 }

/// `Object.fromEntries(entries)`.
public func jsObjectFromEntries<S: Sequence, V>(_ entries: S) -> JSRecord<V> where S.Element == (String, V) {
    let record = JSRecord<V>()
    for (k, v) in entries { record[k] = v }
    return record
}

/// `Object.fromEntries(entries)` of untyped entries: each one's `0` the key, its `1` the value.
public func jsObjectFromEntries<S: Sequence>(_ entries: S) throws -> JSRecord<Any?> {
    let record = JSRecord<Any?>()
    for entry in entries {
        guard jsFlat(entry) != nil, !(jsFlat(entry) is JSNull) else { throw JSException(JSTypeError("Iterator value \(jsToString(entry)) is not an entry object")) }
        record[jsToString(try jsGet(entry, "0"))] = try jsGet(entry, "1")
    }
    return record
}

/// An object that can lose an own property (`delete o.x`).
public protocol JSDeletable: AnyObject {
    func jsDeleteOwn(_ key: String) -> Bool
}

/// `Object.assign(target, ...sources)`: each source's own enumerable keys written to the target in order.
@discardableResult
public func jsObjectAssign(_ target: Any?, _ sources: Any?...) throws -> Any? {
    for source in sources {
        guard let dynamic = jsFlat(source) as? JSDynamic else { continue }
        for key in dynamic.jsKeys { try jsSet(target, key, dynamic[jsKey: key]) }
    }
    return target
}

/// `{ ...source }` into an object literal being built: the source's own enumerable keys, in order.
public func jsObjectSpread(_ target: JSObject, _ source: Any?) {
    guard let dynamic = jsFlat(source) as? JSDynamic else { return }
    for key in dynamic.jsKeys { target[key] = dynamic[jsKey: key] }
    for key in (dynamic as? JSSymbolKeyed)?.jsSymbolKeys ?? [] { target[key] = dynamic[jsKey: key] }
}

/// `const { a, b, ...rest } = source`: the source's own enumerable properties but those the pattern names.
public func jsObjectRest(_ source: Any?, _ excluded: Set<String>) -> JSObject {
    let target = JSObject([])
    guard let dynamic = jsFlat(source) as? JSDynamic else { return target }
    for key in dynamic.jsKeys where !excluded.contains(key) { target[key] = dynamic[jsKey: key] }
    for key in (dynamic as? JSSymbolKeyed)?.jsSymbolKeys ?? [] where !excluded.contains(key) { target[key] = dynamic[jsKey: key] }
    return target
}

/// `Symbol(description)`: a property key no other code spells.
public func jsSymbol(_ description: String) -> String {
    jsSymbolCount += 1
    return "@@\(description)#\(jsSymbolCount)"
}
nonisolated(unsafe) private var jsSymbolCount = 0

/// `key in object`, for any dynamic value.
public func jsIn(_ key: String, _ object: Any?) -> Bool {
    switch jsFlat(object) {
    case let o as JSObject: return o.has(key)
    case let d as JSDynamic: return d.jsKeys.contains(key) || d[jsKey: key] != nil
    default: return false
    }
}

/// A tagged template's strings array; translated code makes one per call site.
public func jsTemplateObject(_ cooked: [String], raw: [String]) -> JSArray<String> {
    let strings = JSArray(cooked)
    jsTemplateRaws[ObjectIdentifier(strings)] = JSArray(raw)
    return strings
}

/// `strings.raw`.
public func jsTemplateRaw(_ strings: JSArray<String>) -> JSArray<String> {
    jsTemplateRaws[ObjectIdentifier(strings)] ?? strings
}
nonisolated(unsafe) private var jsTemplateRaws: [ObjectIdentifier: JSArray<String>] = [:]

/// The key order of an object literal with spreads (`{ ...a, b: 1 }`): each spread source's keys as it holds
/// them, then the literal's own, a key keeping its first position; integer keys first; only the `fields` it has.
public func jsLiteralKeyOrder(_ parts: [[String]], fields: [String]) -> [String] {
    var seen = Set<String>(), keys: [String] = []
    for key in parts.joined() where fields.contains(key) && seen.insert(key).inserted { keys.append(key) }
    let index = { (k: String) -> Bool in k.count <= 10 && (k == "0" || (k.first != "0" && k.allSatisfy(\.isNumber))) && (UInt64(k) ?? .max) < 4294967295 }
    return keys.filter(index).sorted { UInt64($0)! < UInt64($1)! } + keys.filter { !index($0) }
}
