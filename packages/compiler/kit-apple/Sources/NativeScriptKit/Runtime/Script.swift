import Foundation

// JavaScript's object model for code compiled from untyped JavaScript (npm packages
// published without TypeScript): functions as objects, prototype chains, `this`,
// `new`, and the operators over values of any type. Every value is `Any?`, held as
// the rest of the runtime holds it (see Values.swift).

// MARK: - Functions

/// A JavaScript function value: callable with a receiver, constructible unless it is an
/// arrow function or a method, with its own properties (`fn.cache = …`), a `prototype`
/// and an identity.
public final class JSFunctionObject: JSDynamic, JSSymbolKeyed, JSDeletable, JSAccessorKeyed, CustomStringConvertible {
    public enum Kind { case normal, arrow, method, classConstructor, builtin }

    public let name: String
    public let length: Int
    public let kind: Kind
    let body: JSMethod
    /// `new F(…)` for a class or a builtin: given new.target and the arguments, the object made.
    var constructBody: ((JSFunctionObject, [Any?]) throws -> Any?)?
    /// A class's instance fields, set on each instance once its base has made it.
    public var fields: ((Any?) throws -> Void)?
    /// `x instanceof F` for a builtin whose instances are runtime values (`[] instanceof Array`).
    var instanceCheck: ((Any?) -> Bool)?
    /// The function's [[Prototype]]: nil is Function.prototype.
    public var jsProto: AnyObject?
    private var own: JSObject?
    private var removed: Set<String> = []

    public init(_ name: String, _ length: Int, kind: Kind = .normal, _ body: @escaping JSMethod) {
        self.name = name
        self.length = length
        self.kind = kind
        self.body = body
    }

    /// The function's own properties, `prototype` made on first use.
    var properties: JSObject {
        if let own { return own }
        let o = JSObject()
        own = o
        if kind == .normal || kind == .classConstructor {
            let p = JSObject()
            p["constructor"] = self
            try? p.defineProperty("constructor", JSPropertyDescriptor(enumerable: false))
            o["prototype"] = p
            try? o.defineProperty("prototype", JSPropertyDescriptor(enumerable: false))
        }
        return o
    }

    /// `F.prototype`, as `new F` gives its instances.
    public var prototypeObject: Any? { properties["prototype"] }

    @discardableResult
    public func call(_ this: Any?, _ arguments: [Any?]) throws -> Any? {
        if kind == .classConstructor { throw JSException(JSTypeError("Class constructor \(name) cannot be invoked without 'new'")) }
        return try body(this, arguments)
    }

    public func construct(_ arguments: [Any?], newTarget: JSFunctionObject? = nil) throws -> Any? {
        let target = newTarget ?? self
        if let make = constructBody { return try make(target, arguments) }
        guard kind == .normal else { throw JSException(JSTypeError("\(name.isEmpty ? "anonymous" : name) is not a constructor")) }
        let object = JSObject()
        object.jsProto = jsPrototypeForNew(target)
        let result = try body(object, arguments)
        return jsIsObjectValue(result) ? result : object
    }

    public subscript(jsKey key: String) -> Any? {
        get { (try? get(key, receiver: self)) ?? nil }
        set { try? put(key, newValue) }
    }

    func hasOwn(_ key: String) -> Bool {
        if properties.has(key) { return true }
        return (key == "name" || key == "length") && !removed.contains(key)
    }

    func get(_ key: String, receiver: Any?) throws -> Any? {
        let props = properties
        if props.has(key) { return try props.get(key, receiver: receiver) }
        if !removed.contains(key) {
            if key == "name" { return name }
            if key == "length" { return Double(length) }
        }
        return try jsProtoGet(jsProto ?? JSPrototypes.builtin("Function"), key, receiver)
    }

    func put(_ key: String, _ value: Any?) throws {
        let props = properties
        if !props.has(key), let setter = jsProtoSetter(jsProto ?? JSPrototypes.builtin("Function"), key) { return try setter(self, value) }
        // `name` and `length` are read-only: script writing them in sloppy code changes nothing.
        if (key == "name" || key == "length") && !removed.contains(key) && !props.has(key) { return }
        try props.put(key, value)
    }

    public func jsDeleteOwn(_ key: String) -> Bool {
        if key == "name" || key == "length" { removed.insert(key) }
        return properties.delete(key)
    }

    public func defineOwn(_ key: String, _ d: JSPropertyDescriptor) throws {
        if (key == "name" || key == "length") && !properties.has(key) {
            removed.insert(key)
            var d = d
            if d.value == nil && d.get == nil && d.set == nil { d.value = .some(key == "name" ? name : Double(length)) }
            if d.enumerable == nil { d.enumerable = false }
            try properties.defineProperty(key, d)
            return
        }
        try properties.defineProperty(key, d)
    }

    public var jsKeys: [String] { properties.keys }
    public var jsSymbolKeys: [String] { properties.jsSymbolKeys }
    public var jsClassName: String? { nil }
    public func jsAccessorKind(_ key: String) -> String? { properties.jsAccessorKind(key) }
    public var description: String { kind == .classConstructor ? "[class \(name)]" : "[Function: \(name.isEmpty ? "(anonymous)" : name)]" }
}

/// A function value: what a function expression, declaration or arrow evaluates to.
@inline(__always)
public func jsFunction(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
    JSFunctionObject(name, length, body)
}

@inline(__always)
public func jsArrow(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
    JSFunctionObject(name, length, kind: .arrow, body)
}

@inline(__always)
public func jsMethodFunction(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
    JSFunctionObject(name, length, kind: .method, body)
}

/// The prototype `new` gives an instance: new.target's `prototype` when it is an object, else Object.prototype.
func jsPrototypeForNew(_ target: JSFunctionObject) -> AnyObject? {
    let p = jsFlat(target.prototypeObject)
    return p.map { jsIsObjectValue($0) ? $0 as AnyObject : nil } ?? nil
}

/// Whether a value is an object (not a primitive, undefined or null).
public func jsIsObjectValue(_ value: Any?) -> Bool {
    guard let v = jsFlat(value) else { return false }
    switch v {
    case is String, is Double, is Bool, is JSNull, is JSSymbol, is JSBigInt: return false
    default: return jsNumeric(v) == nil
    }
}

/// `f(...arguments)` with a receiver: any function value the runtime holds.
@discardableResult
public func jsInvoke(_ function: Any?, _ this: Any?, _ arguments: [Any?], _ name: StaticString = "") throws -> Any? {
    switch jsFlat(function) {
    case let f as JSFunctionObject: return try f.call(this, arguments)
    case let f as JSFunction: return try f(arguments)
    case let m as JSMethod: return try m(this, arguments)
    case let moot as JSMootValue: throw moot.unavailable()
    default: throw JSException(JSTypeError("\(name.utf8CodeUnitCount > 0 ? "\(name)" : jsDescribeCallee(function)) is not a function"))
    }
}

/// `o.key(...arguments)`, `o[key](...)`: the method read from the object (or its prototype chain), called on it.
@discardableResult
public func jsInvokeMember(_ object: Any?, _ key: Any?, _ arguments: [Any?]) throws -> Any? {
    let k = jsPropertyKey(key)
    if let f = jsFlat(object) as? JSFunctionObject, !f.hasOwn(k) {
        switch k {
        case "call": return try f.call(jsArg(arguments, 0), Array(arguments.dropFirst()))
        case "apply": return try f.call(jsArg(arguments, 0), try jsArgumentList(jsArg(arguments, 1)))
        default: break
        }
    }
    if jsFlat(object) is JSObject || jsFlat(object) is JSFunctionObject || jsFlat(object) is JSScriptError || jsFlat(object) is JSProxy {
        let method = try jsGetKey(object, k)
        if jsIsNullish(method) { throw JSException(JSTypeError("\(jsDescribeMember(object, k)) is not a function")) }
        return try jsInvoke(method, object, arguments)
    }
    if jsIsNullish(object) { throw JSException(JSTypeError("Cannot read properties of \(jsFlat(object) == nil ? "undefined" : "null") (reading '\(jsKeyDescription(k))')")) }
    return try jsCallMethod(object, k, spread: arguments)
}

/// `o?.key(...)`: undefined when the object is undefined or null.
@discardableResult
public func jsInvokeMemberIfPresent(_ object: Any?, _ key: Any?, _ arguments: [Any?]) throws -> Any? {
    jsIsNullish(object) ? nil : try jsInvokeMember(object, key, arguments)
}

/// `f?.(...)`.
@discardableResult
public func jsInvokeIfPresent(_ function: Any?, _ this: Any?, _ arguments: [Any?]) throws -> Any? {
    jsIsNullish(function) ? nil : try jsInvoke(function, this, arguments)
}

/// `new F(...arguments)`.
public func jsNew(_ constructor: Any?, _ arguments: [Any?]) throws -> Any? {
    try jsConstruct(constructor, spread: arguments)
}

/// The elements `f.apply(this, list)` passes: an array's, an array-like's, none for undefined or null.
public func jsArgumentList(_ list: Any?) throws -> [Any?] {
    switch jsFlat(list) {
    case nil, is JSNull: return []
    case let array as JSArrayProtocol: return array.jsAnyElements
    case let match as JSMatch: return match.values.jsAnyElements
    case let v?:
        guard jsIsObjectValue(v) else { throw JSException(JSTypeError("CreateListFromArrayLike called on non-object")) }
        let n = Int(jsToLength(try jsGet(v, "length")))
        return try (0..<n).map { try jsGet(v, String($0)) }
    }
}

func jsDescribeCallee(_ value: Any?) -> String {
    switch jsFlat(value) {
    case nil: return "undefined"
    case is JSNull: return "null"
    case let s as String: return "\"\(s)\""
    default: return jsIsObjectValue(value) ? "object" : jsToString(value)
    }
}

func jsDescribeMember(_ object: Any?, _ key: String) -> String {
    let owner: String
    switch jsFlat(object) {
    case let f as JSFunctionObject: owner = f.name.isEmpty ? "function" : f.name
    default: owner = "object"
    }
    return "\(owner).\(jsKeyDescription(key))"
}

func jsKeyDescription(_ key: String) -> String {
    JSSymbol.of(key: key).map { $0.toString() } ?? key
}

/// `arguments`: the arguments a function was called with, as an array.
public func jsArgumentsObject(_ arguments: [Any?]) -> JSArray<Any?> { JSArray(arguments) }

/// A sloppy-mode function's `this`: undefined and null are the global object, primitives stay as they are.
public func jsSloppyThis(_ this: Any?) -> Any? {
    jsIsNullish(this) ? JSScriptGlobal.object : this
}

// MARK: - Property keys

/// A property key as the runtime keys properties: a symbol's key, a number's canonical string, a string as it is.
@inline(__always)
public func jsPropertyKey(_ key: Any?) -> String {
    switch jsFlat(key) {
    case let s as String: return s
    case let d as Double:
        if d >= 0, d < 4_294_967_295, d == d.rounded(.towardZero) { return String(Int(d)) }
        return jsNumberToString(d)
    case let symbol as JSSymbol: return symbol.key
    default: return jsToString(jsToPrimitive(key))
    }
}

/// `o[key]` for a key of any type.
public func jsGetKey(_ object: Any?, _ key: Any?) throws -> Any? {
    if let array = jsFlat(object) as? JSArrayProtocol, let d = jsFlat(key) as? Double, d >= 0, d == d.rounded(.towardZero) {
        let i = Int(d)
        return i < array.jsLength ? array.jsElement(at: i) : nil
    }
    return try jsGet(object, jsPropertyKey(key))
}

/// `o?.[key]`.
public func jsGetKeyIfPresent(_ object: Any?, _ key: Any?) throws -> Any? {
    jsIsNullish(object) ? nil : try jsGetKey(object, key)
}

/// `o[key] = value` as an expression: the value assigned.
@discardableResult
public func jsSetKey(_ object: Any?, _ key: Any?, _ value: Any?) throws -> Any? {
    if let array = jsFlat(object) as? JSArrayProtocol, let d = jsFlat(key) as? Double, d >= 0, d == d.rounded(.towardZero), d < 4_294_967_295 {
        try array.jsSetElement(value, at: Int(d))
        return value
    }
    try jsSet(object, jsPropertyKey(key), value)
    return value
}

/// `o[key] = value` in sloppy code: a write a strict one would throw for (a getter without a setter,
/// a read-only or non-extensible object) does nothing.
@discardableResult
public func jsSloppySetKey(_ object: Any?, _ key: Any?, _ value: Any?) throws -> Any? {
    do { return try jsSetKey(object, key, value) } catch let e as JSException {
        if let t = e.value as? JSTypeError, jsIsObjectValue(object), ["Cannot set property", "Cannot assign to read only", "Cannot add property"].contains(where: { t.message.hasPrefix($0) }) { return value }
        throw e
    }
}

/// `o[key] op= value`: the member read once, then written with what `update` makes of it.
@discardableResult
public func jsUpdateKey(_ object: Any?, _ key: Any?, _ update: (Any?) throws -> Any?) throws -> Any? {
    let k = jsPropertyKey(key)
    let value = try update(jsGet(object, k))
    try jsSet(object, k, value)
    return value
}

/// `o[key]++` and friends: the old value as a number when `postfix`, else the new one.
@discardableResult
public func jsStepKey(_ object: Any?, _ key: Any?, _ step: Double, postfix: Bool) throws -> Any? {
    let k = jsPropertyKey(key)
    let old = jsToNumeric(try jsGet(object, k))
    let new = jsStepNumeric(old, step)
    try jsSet(object, k, new)
    return postfix ? old : new
}

/// `x++` and friends on a variable.
@discardableResult
public func jsStep(_ variable: inout Any?, _ step: Double, postfix: Bool) -> Any? {
    let old = jsToNumeric(variable)
    let new = jsStepNumeric(old, step)
    variable = new
    return postfix ? old : new
}

func jsToNumeric(_ value: Any?) -> Any? {
    if let big = jsFlat(value) as? JSBigInt { return big }
    return jsToNumber(value)
}

func jsStepNumeric(_ value: Any?, _ step: Double) -> Any? {
    if let big = value as? JSBigInt { return step > 0 ? big + JSBigInt(1) : big - JSBigInt(1) }
    return (value as! Double) + step
}

/// `x = value` as an expression.
@discardableResult
@inline(__always)
public func jsAssign(_ variable: inout Any?, _ value: Any?) -> Any? {
    variable = value
    return value
}

/// `delete o[key]` in sloppy code: false where the property cannot be deleted.
@discardableResult
public func jsDeleteKey(_ object: Any?, _ key: Any?, strict: Bool) throws -> Bool {
    let k = jsPropertyKey(key)
    switch jsFlat(object) {
    case let f as JSFunctionObject: return f.jsDeleteOwn(k)
    case let p as JSProxy: return try p.deleteProperty(k)
    case let array as JSArrayProtocol:
        if let i = jsArrayIndex(k), Int(i) < array.jsLength {
            try? array.jsSetElement(nil, at: Int(i))
            return true
        }
        return k != "length"
    default:
        if strict { return try jsDelete(object, k) }
        return (try? jsDelete(object, k)) ?? false
    }
}

/// `key in object`, through the prototype chain.
public func jsHasProperty(_ key: Any?, _ object: Any?) throws -> Bool {
    guard jsIsObjectValue(object) else { throw JSException(JSTypeError("Cannot use 'in' operator to search for '\(jsKeyDescription(jsPropertyKey(key)))' in \(jsToString(object))")) }
    let k = jsPropertyKey(key)
    var current: Any? = jsFlat(object)
    while let c = jsFlat(current), !(c is JSNull) {
        switch c {
        case let o as JSObject: if o.has(k) { return true }
        case let f as JSFunctionObject: if f.hasOwn(k) { return true }
        case let p as JSProxy: return try p.has(k)
        case let array as JSArrayProtocol:
            if k == "length" || (jsArrayIndex(k).map { Int($0) < array.jsLength } ?? false) { return true }
            if jsArrayMethod(array, k) != nil { return true }
        default:
            if jsHasKey(c, k) || jsIn(k, c) { return true }
        }
        current = try jsGetPrototypeOf(c)
    }
    return false
}

// MARK: - Prototype chains

/// What a prototype chain gives for a key, getters run with `receiver` as `this`.
public func jsProtoGet(_ start: AnyObject, _ key: String, _ receiver: Any?) throws -> Any? {
    var p: AnyObject? = start
    while let o = p {
        switch o {
        case is JSNull: return nil
        case let obj as JSObject:
            if obj.has(key) { return try obj.get(key, receiver: receiver) }
            p = obj.jsProto ?? (obj === JSPrototypes.objectPrototype ? nil : JSPrototypes.objectPrototype)
        case let f as JSFunctionObject:
            if f.hasOwn(key) { return try f.get(key, receiver: receiver) }
            p = f.jsProto ?? JSPrototypes.builtin("Function")
        case let proxy as JSProxy:
            return try proxy.get(key, receiver: receiver)
        default:
            return try jsGet(o, key)
        }
    }
    return nil
}

/// The setter a prototype chain has for a key, or a throwing one for a read-only data property; nil where a write defines an own property.
func jsProtoSetter(_ start: AnyObject, _ key: String) -> ((Any?, Any?) throws -> Void)? {
    var p: AnyObject? = start
    while let o = p {
        switch o {
        case let obj as JSObject:
            if obj.has(key) { return obj.setter(key) }
            p = obj.jsProto ?? (obj === JSPrototypes.objectPrototype ? nil : JSPrototypes.objectPrototype)
        case let f as JSFunctionObject:
            if f.hasOwn(key) { return f.properties.setter(key) }
            p = f.jsProto ?? JSPrototypes.builtin("Function")
        default: return nil
        }
    }
    return nil
}

/// `Object.create(proto, properties)`.
public func jsObjectCreate(_ proto: Any?, _ properties: Any? = nil) throws -> JSObject {
    let p = jsFlat(proto)
    guard p is JSNull || jsIsObjectValue(p) else { throw JSException(JSTypeError("Object prototype may only be an Object or null: \(jsToString(proto))")) }
    let o = JSObject()
    o.jsProto = p as AnyObject?
    if !jsIsNullish(properties) { try jsDefineProperties(o, properties) }
    return o
}

/// `Object.defineProperties(object, map)`.
@discardableResult
public func jsDefineProperties(_ object: Any?, _ map: Any?) throws -> Any? {
    for key in jsKeysOf(jsFlat(map)) + ((jsFlat(map) as? JSSymbolKeyed)?.jsSymbolKeys ?? []) {
        try jsDefineOwnProperty(object, key, try jsGet(map, key))
    }
    return object
}

/// `Object.defineProperty(object, key, descriptor)` for any object script holds.
@discardableResult
public func jsDefineOwnProperty(_ object: Any?, _ key: Any?, _ descriptor: Any?) throws -> Any? {
    let k = jsPropertyKey(key)
    switch jsFlat(object) {
    case let f as JSFunctionObject: try f.defineOwn(k, try JSPropertyDescriptor(descriptor))
    case let p as JSProxy: try p.defineProperty(k, descriptor)
    case let e as JSScriptError: try e.own.defineProperty(k, try JSPropertyDescriptor(descriptor))
    case let array as JSArrayProtocol:
        let d = try JSPropertyDescriptor(descriptor)
        if let i = jsArrayIndex(k), case .some(let v) = d.value { try array.jsSetElement(v, at: Int(i)) }
    default: try jsDefineProperty(object, k, descriptor)
    }
    return object
}

/// `Object.setPrototypeOf(object, proto)`.
@discardableResult
public func jsSetPrototypeOf(_ object: Any?, _ proto: Any?) throws -> Any? {
    let p = jsFlat(proto)
    guard p is JSNull || jsIsObjectValue(p) else { throw JSException(JSTypeError("Object prototype may only be an Object or null: \(jsToString(proto))")) }
    switch jsFlat(object) {
    case let o as JSObject: o.jsProto = (p is JSNull) ? jsNull : (p as AnyObject?) === JSPrototypes.objectPrototype ? nil : p as AnyObject?
    case let f as JSFunctionObject: f.jsProto = p as AnyObject?
    case let e as JSScriptError: e.jsProto = p as AnyObject?
    case let proxy as JSProxy: try proxy.setPrototypeOf(p)
    default: break
    }
    return object
}

/// `value instanceof F`.
public func jsInstanceOf(_ value: Any?, _ constructor: Any?) throws -> Bool {
    switch jsFlat(constructor) {
    case let f as JSFunctionObject:
        if let custom = jsFlat(try jsGet(f, JSSymbol.hasInstance.key)) as? JSFunctionObject, custom.kind != .builtin { return jsTruthy(try custom.call(f, [value])) }
        if let check = f.instanceCheck, check(value) { return true }
        guard jsIsObjectValue(value) else { return false }
        guard let target = jsFlat(f.prototypeObject), jsIsObjectValue(target) else { throw JSException(JSTypeError("Function has non-object prototype '\(jsToString(f.prototypeObject))' in instanceof check")) }
        var current = try jsGetPrototypeOf(value)
        while let c = jsFlat(current), !(c is JSNull) {
            if (c as AnyObject) === (target as AnyObject) { return true }
            current = try jsGetPrototypeOf(c)
        }
        return false
    case let cls as AnyClass:
        guard let v = jsFlat(value), jsIsObjectValue(v) else { return false }
        var c: AnyClass? = type(of: v as AnyObject)
        while let k = c { if k == cls { return true }; c = class_getSuperclass(k) }
        return false
    default:
        throw JSException(JSTypeError("Right-hand side of 'instanceof' is not callable"))
    }
}

// MARK: - Classes

/// A class's constructor: `make` runs its body with new.target and the arguments, and gives the instance.
public func jsClass(_ name: String, _ length: Int, parent: Any?, hasParent: Bool, _ make: @escaping (JSFunctionObject, [Any?]) throws -> Any?) throws -> JSFunctionObject {
    let f = JSFunctionObject(name, length, kind: .classConstructor) { _, _ in nil }
    f.constructBody = make
    if hasParent {
        let p = jsFlat(parent)
        let prototype = f.properties["prototype"] as! JSObject
        if p is JSNull {
            prototype.jsProto = jsNull
        } else if let parentFunction = p as? JSFunctionObject {
            f.jsProto = parentFunction
            let parentPrototype = jsFlat(parentFunction.prototypeObject)
            prototype.jsProto = parentPrototype is JSNull ? jsNull : parentPrototype as AnyObject?
        } else if let constructor = p, jsIsFunction(constructor) {
            prototype.jsProto = nil
        } else {
            throw JSException(JSTypeError("Class extends value \(jsToString(parent)) is not a constructor or null"))
        }
    }
    return f
}

/// A base class's new instance: an object whose prototype is new.target's, its fields set.
public func jsClassInstance(_ cls: Any?, _ newTarget: JSFunctionObject) throws -> Any? {
    let o = JSObject()
    o.jsProto = jsPrototypeForNew(newTarget)
    try (jsFlat(cls) as? JSFunctionObject)?.fields?(o)
    return o
}

/// `super(...arguments)` in a derived class's constructor: the instance its base makes, with this class's fields set.
public func jsSuperConstruct(_ cls: Any?, _ newTarget: JSFunctionObject, _ arguments: [Any?]) throws -> Any? {
    guard let c = jsFlat(cls) as? JSFunctionObject, let parent = c.jsProto as? JSFunctionObject else { throw JSException(JSTypeError("Super constructor is not a constructor")) }
    let instance = try parent.construct(arguments, newTarget: newTarget)
    try c.fields?(instance)
    return instance
}

/// A class's instance fields, which `jsClassInstance` and `jsSuperConstruct` set on each instance.
public func jsSetFields(_ cls: Any?, _ fields: @escaping (Any?) throws -> Void) throws {
    (jsFlat(cls) as? JSFunctionObject)?.fields = fields
}

/// A class field: an own data property, defined rather than assigned (a setter on the prototype is not called).
public func jsDefineField(_ target: Any?, _ key: Any?, _ value: Any?) throws {
    try jsDefineOwnProperty(target, key, JSObject([("value", value), ("writable", true), ("enumerable", true), ("configurable", true)]))
}

/// What `new` gives for a constructor's `return value`: the value when it is an object, else the instance.
public func jsConstructorResult(_ value: Any?, _ this: Any?) -> Any? {
    jsIsObjectValue(value) ? value : this
}

/// `super.key` in a method whose home object is `home` (a class's prototype, or the class for a static method).
public func jsSuperGet(_ home: Any?, _ key: Any?, _ this: Any?) throws -> Any? {
    guard let proto = jsFlat(try jsGetPrototypeOf(home)), !(proto is JSNull) else { return nil }
    return try jsProtoGet(proto as AnyObject, jsPropertyKey(key), this)
}

/// `super.key(...arguments)`.
@discardableResult
public func jsSuperCall(_ home: Any?, _ key: Any?, _ this: Any?, _ arguments: [Any?]) throws -> Any? {
    try jsInvoke(try jsSuperGet(home, key, this), this, arguments)
}

/// A method, getter or setter put on a class's prototype or on the class: not enumerable.
public func jsDefineMethod(_ target: Any?, _ key: Any?, _ method: JSFunctionObject) throws {
    try jsDefineOwnProperty(target, key, JSObject([("value", method), ("writable", true), ("enumerable", false), ("configurable", true)]))
}

public func jsDefineAccessor(_ target: Any?, _ key: Any?, get: JSFunctionObject?, set: JSFunctionObject?, enumerable: Bool) throws {
    let k = jsPropertyKey(key)
    // A getter and a setter of one name defined apart (`get x() {}` then `set x(v) {}`) are one property.
    var getter: Any? = get, setter: Any? = set
    if let existing = jsFlat(jsOwnDescriptorObject(target, k)) as? JSObject {
        if get == nil { getter = existing["get"] }
        if set == nil { setter = existing["set"] }
    }
    try jsDefineOwnProperty(target, k, JSObject([("get", getter), ("set", setter), ("enumerable", enumerable), ("configurable", true)]))
}

func jsOwnDescriptorObject(_ object: Any?, _ key: String) -> Any? {
    switch jsFlat(object) {
    case let f as JSFunctionObject: return f.properties.descriptor(key)
    case let e as JSScriptError: return e.own.descriptor(key)
    default: return jsOwnPropertyDescriptor(object, key)
    }
}

/// An error a script class extending `Error` makes: a `JSError`, so the runtime reports and prints it as one, with the class's prototype.
public final class JSScriptError: JSError {
    public var jsProto: AnyObject?
    let own = JSObject()
    private var named = false
    /// The builtin's name an instance of a subclass of `TypeError` and the others reads where neither it nor its classes set one.
    var inheritedName: String?

    public override subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "message", "stack", "cause": return super[jsKey: key]
            case "name" where named: return super[jsKey: key]
            default:
                if own.has(key) { return (try? own.get(key, receiver: self)) ?? nil }
                if let p = jsProto { return (try? jsProtoGet(p, key, self)) ?? nil }
                return key == "name" ? (inheritedName ?? super[jsKey: key]) : nil
            }
        }
        set {
            switch key {
            case "message", "stack", "cause": super[jsKey: key] = newValue
            case "name": named = true; super[jsKey: key] = newValue
            default:
                if !own.has(key), let p = jsProto, let setter = jsProtoSetter(p, key) { try? setter(self, newValue); return }
                own[key] = newValue
            }
        }
    }

    /// `error[key]`, a getter's error thrown.
    func get(_ key: String) throws -> Any? {
        switch key {
        case "message", "stack", "cause": return super[jsKey: key]
        case "name" where named: return super[jsKey: key]
        default:
            if own.has(key) { return try own.get(key, receiver: self) }
            if let p = jsProto { return try jsProtoGet(p, key, self) }
            return key == "name" ? (inheritedName ?? super[jsKey: key]) : nil
        }
    }

    public override var name: String {
        get { named ? super.name : jsToString(self[jsKey: "name"]) }
        set { named = true; super.name = newValue }
    }

    public override var jsKeys: [String] { own.keys }
    public override var jsClassName: String? { jsToString(self[jsKey: "name"]) }
}

// MARK: - Operators

@inline(__always) public func jsSub(_ a: Any?, _ b: Any?) -> Any? { jsNumericOp(a, b, -) { $0 - $1 } }
@inline(__always) public func jsMul(_ a: Any?, _ b: Any?) -> Any? { jsNumericOp(a, b, *) { $0 * $1 } }
@inline(__always) public func jsDiv(_ a: Any?, _ b: Any?) throws -> Any? {
    if let x = a as? Double, let y = b as? Double { return x / y }
    if let x = jsFlat(a) as? JSBigInt, let y = jsFlat(b) as? JSBigInt { return try JSBigInt.divide(x, y) }
    return jsToNumber(a) / jsToNumber(b)
}
@inline(__always) public func jsRem(_ a: Any?, _ b: Any?) throws -> Any? {
    if let x = a as? Double, let y = b as? Double { return x.truncatingRemainder(dividingBy: y) }
    if let x = jsFlat(a) as? JSBigInt, let y = jsFlat(b) as? JSBigInt { return try JSBigInt.remainder(x, y) }
    return jsToNumber(a).truncatingRemainder(dividingBy: jsToNumber(b))
}
@inline(__always) public func jsExp(_ a: Any?, _ b: Any?) -> Any? { jsPow(jsToNumber(a), jsToNumber(b)) }

@inline(__always)
func jsNumericOp(_ a: Any?, _ b: Any?, _ op: (Double, Double) -> Double, _ big: (JSBigInt, JSBigInt) -> JSBigInt) -> Any? {
    if let x = a as? Double, let y = b as? Double { return op(x, y) }
    if let x = jsFlat(a) as? JSBigInt, let y = jsFlat(b) as? JSBigInt { return big(x, y) }
    return op(jsToNumber(a), jsToNumber(b))
}

@inline(__always) public func jsNeg(_ a: Any?) -> Any? {
    if let big = jsFlat(a) as? JSBigInt { return JSBigInt(0) - big }
    return -jsToNumber(a)
}
@inline(__always) public func jsPlus(_ a: Any?) -> Any? { jsToNumber(a) }
@inline(__always) public func jsNot(_ a: Any?) -> Bool { !jsIsTruthy(a) }
@inline(__always) public func jsBOr(_ a: Any?, _ b: Any?) -> Any? { jsBitOr(jsToNumber(a), jsToNumber(b)) }
@inline(__always) public func jsBAnd(_ a: Any?, _ b: Any?) -> Any? { jsBitAnd(jsToNumber(a), jsToNumber(b)) }
@inline(__always) public func jsBXor(_ a: Any?, _ b: Any?) -> Any? { jsBitXor(jsToNumber(a), jsToNumber(b)) }
@inline(__always) public func jsBNot(_ a: Any?) -> Any? { jsBitNot(jsToNumber(a)) }
@inline(__always) public func jsShl(_ a: Any?, _ b: Any?) -> Any? { jsShiftLeft(jsToNumber(a), jsToNumber(b)) }
@inline(__always) public func jsShr(_ a: Any?, _ b: Any?) -> Any? { jsShiftRight(jsToNumber(a), jsToNumber(b)) }
@inline(__always) public func jsUShr(_ a: Any?, _ b: Any?) -> Any? { jsShiftRightUnsigned(jsToNumber(a), jsToNumber(b)) }

@inline(__always) public func jsLT(_ a: Any?, _ b: Any?) -> Bool {
    if let x = a as? Double, let y = b as? Double { return x < y }
    return jsLessThan(a, b) == true
}
@inline(__always) public func jsGT(_ a: Any?, _ b: Any?) -> Bool {
    if let x = a as? Double, let y = b as? Double { return x > y }
    return jsLessThan(b, a) == true
}
@inline(__always) public func jsLE(_ a: Any?, _ b: Any?) -> Bool {
    if let x = a as? Double, let y = b as? Double { return x <= y }
    return jsLessThan(b, a) == false
}
@inline(__always) public func jsGE(_ a: Any?, _ b: Any?) -> Bool {
    if let x = a as? Double, let y = b as? Double { return x >= y }
    return jsLessThan(a, b) == false
}

/// `a && b`.
@inline(__always)
public func jsLogicalAnd(_ a: Any?, _ b: @autoclosure () throws -> Any?) rethrows -> Any? { jsIsTruthy(a) ? try b() : a }

/// `a || b`.
@inline(__always)
public func jsLogicalOr(_ a: Any?, _ b: @autoclosure () throws -> Any?) rethrows -> Any? { jsIsTruthy(a) ? a : try b() }

/// `a, b`: both evaluated, the last one's value.
@inline(__always)
public func jsComma(_ values: Any?...) -> Any? { values.last ?? nil }

/// `void x`.
@inline(__always)
public func jsVoid(_ value: Any?) -> Any? { nil }

/// `x ?? y` where `x` is the value of a script expression.
@inline(__always)
public func jsCoalesce(_ a: Any?, _ b: @autoclosure () throws -> Any?) rethrows -> Any? { jsIsNullish(a) ? try b() : a }

/// ToLength.
public func jsToLength(_ value: Any?) -> Double {
    let n = jsToIntegerOrInfinity(jsToNumber(value))
    return n <= 0 ? 0 : min(n, 9007199254740991)
}

/// A value as `Bool`, for a condition.
@inline(__always)
public func jsTest(_ value: Any?) -> Bool { jsIsTruthy(value) }

/// `throw value`.
public func jsThrow(_ value: Any?) -> JSException { JSException(value) }

/// The elements `...value` spreads into an array or argument list.
public func jsSpread(_ value: Any?) throws -> [Any?] {
    if let array = jsFlat(value) as? JSArrayProtocol { return array.jsAnyElements }
    if let match = jsFlat(value) as? JSMatch { return match.values.jsAnyElements }
    if jsIsNullish(value) { throw JSException(JSTypeError("\(jsToString(value)) is not iterable")) }
    return try jsItemsOf(value)
}

/// `[a, , b]`'s holes and `[...x]`'s spreads made into one array.
public func jsArrayLiteral(_ elements: [Any?]) -> JSArray<Any?> { JSArray(elements) }

/// An object literal's own data properties, in order (`__proto__: p` sets the prototype).
public func jsObjectLiteral(_ entries: [(String, Any?)]) -> JSObject {
    let o = JSObject()
    for (k, v) in entries {
        if k == "__proto__" {
            let p = jsFlat(v)
            if p is JSNull { o.jsProto = jsNull } else if jsIsObjectValue(p) { o.jsProto = p as AnyObject }
            continue
        }
        o[k] = v
    }
    return o
}

/// A template literal's substitution: ToString, which throws for a symbol.
public func jsTemplateString(_ value: Any?) throws -> String {
    if jsFlat(value) is JSSymbol { throw JSException(JSTypeError("Cannot convert a Symbol value to a string")) }
    if let s = jsFlat(value) as? String { return s }
    return jsToString(value)
}

/// `for (key in object)`: the enumerable string keys of the object and its prototype chain.
public func jsForInKeys(_ value: Any?) throws -> [String] {
    guard let v = jsFlat(value), !(v is JSNull) else { return [] }
    var keys: [String] = [], seen = Set<String>()
    var current: Any? = v
    var depth = 0
    while let c = jsFlat(current), !(c is JSNull), depth < 64 {
        let own: [String]
        switch c {
        case let o as JSObject: own = o.ownPropertyNames.filter { name in o.keys.contains(name) }
        case let s as String: own = (0..<s.utf16.count).map { String($0) }
        default: own = jsKeysOf(c)
        }
        for k in own where seen.insert(k).inserted { keys.append(k) }
        if c is String { break }
        current = try jsGetPrototypeOf(c)
        if let p = jsFlat(current) as? JSObject, p === JSPrototypes.objectPrototype { break }
        depth += 1
    }
    return keys
}

/// `for (x of iterable)`'s iterator.
public func jsForOfIterator(_ value: Any?) throws -> JSIterator<Any?> { try jsIteratorOf(value) }

/// The global object's property, for an identifier no scope declares: a ReferenceError where there is none.
public func jsGlobalRead(_ name: String) throws -> Any? {
    let g = JSScriptGlobal.object
    if g.has(name) { return try g.get(name) }
    // The global object is an object: it inherits Object.prototype's members (`toString`, `hasOwnProperty`).
    if JSPrototypes.objectPrototype.has(name) { return try JSPrototypes.objectPrototype.get(name, receiver: g) }
    // A native class by its Objective-C name (`NSURL`, `UIApplication`), as the iOS runtime's globals have them.
    if let cls = jsNativeClassGlobal(name) { return cls }
    throw JSException(JSReferenceError("\(name) is not defined"))
}

/// `typeof name` for an undeclared name: no ReferenceError.
public func jsGlobalLookup(_ name: String) -> Any? {
    if JSScriptGlobal.object.has(name) { return (try? JSScriptGlobal.object.get(name)) ?? nil }
    return jsNativeClassGlobal(name).map { $0 as Any }
}

/// A global naming a native class (`NSURL`, `UIApplication`): its two-letter prefix keeps web names (`Node`, `URL`) script tests for out.
func jsNativeClassGlobal(_ name: String) -> AnyClass? {
    let u = name.utf8.prefix(3).map { $0 }
    guard u.count == 3, (65...90).contains(u[0]), (65...90).contains(u[1]), (97...122).contains(u[2]) || (65...90).contains(u[2]) else { return nil }
    return NSClassFromString(name)
}

/// An assignment to an undeclared name: the global object's property.
@discardableResult
public func jsGlobalWrite(_ name: String, _ value: Any?) -> Any? {
    JSScriptGlobal.object[name] = value
    return value
}

// MARK: - Conversions

/// OrdinaryToPrimitive, after `[Symbol.toPrimitive]`: `valueOf` then `toString` (the other way round for a string hint).
public func jsOrdinaryToPrimitive(_ o: Any, _ hint: String) throws -> Any? {
    if let exotic = jsFlat(try jsGet(o, JSSymbol.toPrimitive.key)), jsIsFunction(exotic) {
        let r = try jsInvoke(exotic, o, [hint])
        if !jsIsObjectValue(r) { return r }
        throw JSException(JSTypeError("Cannot convert object to primitive value"))
    }
    for name in hint == "string" ? ["toString", "valueOf"] : ["valueOf", "toString"] {
        if let f = jsFlat(try jsGet(o, name)), jsIsFunction(f) {
            let r = try jsInvoke(f, o, [])
            if !jsIsObjectValue(r) { return r }
        }
    }
    throw JSException(JSTypeError("Cannot convert object to primitive value"))
}

extension JSObject: JSToPrimitive {
    public func jsToPrimitive(_ hint: String) throws -> Any? { try jsOrdinaryToPrimitive(self, hint) }
}

extension JSFunctionObject: JSToPrimitive {
    public func jsToPrimitive(_ hint: String) throws -> Any? { try jsOrdinaryToPrimitive(self, hint) }
}

extension JSScriptError: JSToPrimitive {
    public func jsToPrimitive(_ hint: String) throws -> Any? { try jsOrdinaryToPrimitive(self, hint) }
}

extension JSProxy: JSToPrimitive {
    public func jsToPrimitive(_ hint: String) throws -> Any? { try jsOrdinaryToPrimitive(self, hint) }
}

extension JSDate: JSToPrimitive {
    /// A date is a number only where a number is asked for (`+date`, `a < b`); `date + ''` is its string.
    public func jsToPrimitive(_ hint: String) throws -> Any? { hint == "number" ? time : toString() }
}

// MARK: - Weak collections, called by name from script

extension JSWeakMap: JSHostObject {
    public func jsInvoke(_ key: String, _ arguments: [Any?]) throws -> Any?? {
        let k = jsFlat(jsArg(arguments, 0))
        switch key {
        case "get": return .some((k as? Key).flatMap { get($0) }.map { $0 as Any? } ?? nil)
        case "has": return .some((k as? Key).map { has($0) } ?? false)
        case "delete": return .some((k as? Key).map { delete($0) } ?? false)
        case "set":
            guard let typed = k as? Key, jsIsObjectValue(k) else { throw JSException(JSTypeError("Invalid value used as weak map key")) }
            guard let value = jsArg(arguments, 1) as? Value ?? (Value.self == Any?.self ? (jsArg(arguments, 1) as Any? as! Value) : nil) else { throw JSException(JSTypeError("Invalid value for this WeakMap")) }
            try set(typed, value)
            return .some(self)
        default: return nil
        }
    }
}

extension JSWeakSet: JSHostObject {
    public func jsInvoke(_ key: String, _ arguments: [Any?]) throws -> Any?? {
        let v = jsFlat(jsArg(arguments, 0))
        switch key {
        case "has": return .some((v as? Element).map { has($0) } ?? false)
        case "delete": return .some((v as? Element).map { delete($0) } ?? false)
        case "add":
            guard let typed = v as? Element, jsIsObjectValue(v) else { throw JSException(JSTypeError("Invalid value used in weak set")) }
            try add(typed)
            return .some(self)
        default: return nil
        }
    }
}

// MARK: - Subclassed builtins

/// A protocol for the runtime's values a script class can extend (`class ReferenceSet extends Set`): the instance keeps new.target's prototype.
public protocol JSScriptInstance: AnyObject {
    var jsProto: AnyObject? { get set }
    var jsOwn: JSObject { get }
}

/// An instance of a script class extending `Set`.
public final class JSScriptSet: JSSet<Any?>, JSScriptInstance {
    public var jsProto: AnyObject?
    public let jsOwn = JSObject()
}

/// An instance of a script class extending `Map`.
public final class JSScriptMap: JSMap<Any?, Any?>, JSScriptInstance {
    public var jsProto: AnyObject?
    public let jsOwn = JSObject()
}

/// A subclass instance's own property or its class's member, where the builtin has none of that name.
func jsScriptInstanceGet(_ o: JSScriptInstance, _ key: String) throws -> Any? {
    if o.jsOwn.has(key) { return try o.jsOwn.get(key, receiver: o) }
    if let p = o.jsProto { return try jsProtoGet(p, key, o) }
    return nil
}

func jsScriptInstanceSet(_ o: JSScriptInstance, _ key: String, _ value: Any?) throws {
    if !o.jsOwn.has(key), let p = o.jsProto, let setter = jsProtoSetter(p, key) { return try setter(o, value) }
    try o.jsOwn.put(key, value)
}
