import Foundation

// Values as translated TypeScript holds them: `any`/`unknown` is `Any?`, an empty
// `Any?` is `undefined`, `jsNull` is `null`, numbers are `Double`, objects are
// classes compared by identity.

/// JavaScript `null`.
public final class JSNull: Sendable, CustomStringConvertible {
    fileprivate init() {}
    public var description: String { "null" }
}

/// The JavaScript `null` value. `undefined` is `nil`.
public let jsNull = JSNull()

/// A JavaScript function value as dynamic code stores and calls it.
public typealias JSFunction = ([Any?]) throws -> Any?

/// An object whose properties dynamic code reaches by name (`o[key]`, JSON, `console.log`):
/// plain objects (`JSObject`) and the classes generated for TypeScript classes and interfaces.
/// A nil `jsClassName` prints as a plain object (`{ a: 1 }`), otherwise as `Name { a: 1 }`.
public protocol JSDynamic: AnyObject {
    subscript(jsKey key: String) -> Any? { get set }
    var jsKeys: [String] { get }
    var jsClassName: String? { get }
}

/// A class with its own `toString()`, which JavaScript's string conversion calls.
public protocol JSStringConvertible {
    func toString() throws -> String
}

// MARK: - Optionals inside Any

protocol JSOptionalProtocol {
    var jsFlattened: Any? { get }
    static var jsNone: Any { get }
}

extension Optional: JSOptionalProtocol {
    var jsFlattened: Any? {
        switch self {
        case .none: return nil
        case .some(let wrapped): return jsFlat(wrapped)
        }
    }

    static var jsNone: Any { Optional<Wrapped>.none as Any }
}

/// `value` with nested optionals collapsed: a generic `T?` holding nil, boxed in `Any?`, is undefined.
@inline(__always)
public func jsFlat(_ value: Any?) -> Any? {
    guard let value else { return nil }
    if let optional = value as? JSOptionalProtocol { return optional.jsFlattened }
    return value
}

/// `value` as `T`: undefined becomes nil for an optional `T`, and any value is `()` for `Void`.
public func jsCast<T>(_ value: Any?, to type: T.Type = T.self) -> T? {
    if T.self == Void.self { return (() as Any) as? T }
    guard let value = jsFlat(value) else {
        return (T.self as? JSOptionalProtocol.Type)?.jsNone as? T
    }
    if let same = value as? T { return same }
    // An untyped object where a typed one is expected (a generic `T` an interface stands for): read into it.
    if let convertible = T.self as? JSObjectConvertible.Type { return convertible.init(jsObject: value) as? T }
    return nil
}

/// A class for an object shape that reads an untyped object (`JSON.parse` output) into itself.
public protocol JSObjectConvertible: AnyObject {
    init(jsObject: Any?)
}

func jsIsUndefined<T>(_ value: T) -> Bool {
    guard T.self is JSOptionalProtocol.Type || T.self == Any.self else { return false }
    return jsFlat(value) == nil
}

func jsIsObject(_ value: Any) -> Bool { type(of: value) is AnyClass }

/// Whether `value` is a Swift closure (a JavaScript function).
func jsIsFunction(_ value: Any) -> Bool {
    if value is JSFunction { return true }
    let name = String(describing: type(of: value))
    guard name.first == "(" else { return false }
    var depth = 0
    var index = name.startIndex
    while index < name.endIndex {
        let c = name[index]
        if c == "(" || c == "<" || c == "[" { depth += 1 }
        if c == ")" || c == ">" || c == "]" {
            depth -= 1
            if depth == 0 { break }
        }
        index = name.index(after: index)
    }
    guard index < name.endIndex else { return false }
    let rest = name[name.index(after: index)...]
    return rest.hasPrefix(" -> ") || rest.hasPrefix(" throws") || rest.hasPrefix(" async")
}

@inline(__always)
func jsNumeric(_ value: Any) -> Double? {
    switch value {
    case let d as Double: return d
    case let i as Int: return Double(i)
    case let f as Float: return Double(f)
    case let i as Int32: return Double(i)
    case let i as UInt32: return Double(i)
    case let i as Int64: return Double(i)
    default: return nil
    }
}

// MARK: - Strings compared as JavaScript compares them

/// `a === b` for strings: equal code units (Swift's `==` also equates canonically equivalent strings).
@inline(__always)
public func jsStringEquals(_ a: String, _ b: String) -> Bool {
    a.utf8.count == b.utf8.count && a.utf8.elementsEqual(b.utf8)
}

/// `a < b` for strings: UTF-16 code unit order.
public func jsStringLess(_ a: String, _ b: String) -> Bool {
    a.utf16.lexicographicallyPrecedes(b.utf16)
}

/// A property or collection key hashed and compared by code units.
struct JSPropertyKey: Hashable {
    let string: String
    init(_ string: String) { self.string = string }

    static func == (a: JSPropertyKey, b: JSPropertyKey) -> Bool { jsStringEquals(a.string, b.string) }

    func hash(into hasher: inout Hasher) {
        let utf8 = string.utf8
        let hashed: Void? = utf8.withContiguousStorageIfAvailable { hasher.combine(bytes: UnsafeRawBufferPointer($0)) }
        if hashed == nil { for byte in utf8 { hasher.combine(byte) } }
        hasher.combine(utf8.count)
    }
}

/// The array index a property key names (`"0"`…`"4294967294"`), if it names one.
func jsArrayIndex(_ key: String) -> UInt32? {
    let utf8 = key.utf8
    guard let first = utf8.first, utf8.count <= 10, first >= 0x30, first <= 0x39 else { return nil }
    if first == 0x30 { return utf8.count == 1 ? 0 : nil }
    var n: UInt64 = 0
    for c in utf8 {
        guard c >= 0x30 && c <= 0x39 else { return nil }
        n = n * 10 + UInt64(c - 0x30)
    }
    return n < 4_294_967_295 ? UInt32(n) : nil
}

// MARK: - Plain objects

/// A plain JavaScript object. Own keys enumerate in JavaScript order: array-index keys
/// ascending, then the other keys in insertion order.
public final class JSObject: JSDynamic, JSSymbolKeyed, JSAccessorKeyed, JSReactiveConvertible, ExpressibleByDictionaryLiteral, CustomStringConvertible {
    private var storage: [JSPropertyKey: Any?] = [:]
    private var indexKeys: [UInt32] = []
    private var namedKeys: [String] = []
    /// Properties that are accessors or not plain writable, enumerable, configurable data.
    private var slots: [JSPropertyKey: JSPropertySlot] = [:]
    public private(set) var extensible = true
    public var jsTracker: JSTracker?

    public init() {}

    public init(dictionaryLiteral elements: (String, Any?)...) {
        for (key, value) in elements { define(key, value) }
    }

    public init(_ entries: [(String, Any?)]) {
        for (key, value) in entries { define(key, value) }
    }

    public subscript(key: String) -> Any? {
        get {
            if !slots.isEmpty, let getter = slots[JSPropertyKey(key)]?.get {
                do { return try getter(self) } catch { jsReportUncaught(jsCaught(error)); return nil }
            }
            guard let tracker = jsTracker else { return storage[JSPropertyKey(key)] ?? nil }
            tracker.track()
            return jsReactiveAny(storage[JSPropertyKey(key)] ?? nil)
        }
        set {
            if !slots.isEmpty || !extensible {
                do { try put(key, newValue) } catch { jsReportUncaught(jsCaught(error)) }
                return
            }
            guard let tracker = jsTracker else { define(key, newValue); return }
            let old = storage[JSPropertyKey(key)]
            define(key, newValue)
            if let old, jsSameValue(old, newValue) { return }
            tracker.trigger()
        }
    }

    /// A prototype's property read for an instance: a getter runs with the instance as `this`.
    func get(_ key: String, receiver: Any?) throws -> Any? {
        if let getter = slots[JSPropertyKey(key)]?.get { return try getter(receiver) }
        if slots[JSPropertyKey(key)]?.isAccessor == true { return nil }
        return storage[JSPropertyKey(key)] ?? nil
    }

    /// A prototype's setter for a key, nil when the key holds a value; an accessor without one throws as strict code does.
    func setter(_ key: String) -> ((Any?, Any?) throws -> Void)? {
        guard let slot = slots[JSPropertyKey(key)], slot.isAccessor else { return nil }
        return slot.set ?? { _, _ in throw JSException(JSTypeError("Cannot set property \(key) of #<Object> which has only a getter")) }
    }

    /// `object[key]`, running a getter.
    public func get(_ key: String) throws -> Any? {
        if !slots.isEmpty, let getter = slots[JSPropertyKey(key)]?.get { return try getter(self) }
        return self[key]
    }

    /// `object[key] = value` in strict code: a read-only property, a getter without a setter
    /// or a new key on an object that is not extensible throws a TypeError.
    public func put(_ key: String, _ value: Any?) throws {
        let k = JSPropertyKey(key)
        if let slot = slots[k] {
            if slot.isAccessor {
                guard let setter = slot.set else { throw JSException(JSTypeError("Cannot set property \(key) of #<Object> which has only a getter")) }
                return try setter(self, value)
            }
            if !slot.writable { throw JSException(JSTypeError("Cannot assign to read only property '\(key)' of object '#<Object>'")) }
        } else if !extensible && storage[k] == nil {
            throw JSException(JSTypeError("Cannot add property \(key), object is not extensible"))
        }
        guard let tracker = jsTracker else { define(key, value); return }
        let old = storage[k]
        define(key, value)
        if let old, jsSameValue(old, value) { return }
        tracker.trigger()
    }

    /// `Object.defineProperty(object, key, descriptor)`; attributes the descriptor leaves out are false for a new property.
    public func defineProperty(_ key: String, _ d: JSPropertyDescriptor) throws {
        let k = JSPropertyKey(key)
        let exists = storage[k] != nil
        var slot = slots[k] ?? JSPropertySlot(enumerable: exists, writable: exists, configurable: exists)
        if !exists && !extensible { throw JSException(JSTypeError("Cannot define property \(key), object is not extensible")) }
        if exists && !slot.configurable {
            let changes = d.get != nil || d.set != nil || d.configurable == true || (d.enumerable.map { $0 != slot.enumerable } ?? false)
                || (!slot.writable && (d.writable == true || (d.value.map { !jsSameValue($0, storage[k] ?? nil) } ?? false)))
            if changes { throw JSException(JSTypeError("Cannot redefine property: \(key)")) }
        }
        if d.get != nil || d.set != nil {
            slot.get = d.get
            slot.set = d.set
            slot.isAccessor = true
            slot.writable = false
        } else if d.value != nil || d.writable != nil {
            if slot.isAccessor { slot.get = nil; slot.set = nil; slot.isAccessor = false }
        }
        if let v = d.enumerable { slot.enumerable = v }
        if let v = d.writable { slot.writable = v }
        if let v = d.configurable { slot.configurable = v }
        define(key, slot.isAccessor ? nil as Any? : (d.value ?? (storage[k] ?? nil)))
        slots[k] = slot.isPlain ? nil : slot
        jsTracker?.trigger()
    }

    /// `Object.getOwnPropertyDescriptor(object, key)`.
    public func descriptor(_ key: String) -> JSObject? {
        let k = JSPropertyKey(key)
        guard storage[k] != nil else { return nil }
        let slot = slots[k] ?? JSPropertySlot()
        if slot.isAccessor {
            return JSObject([("get", slot.get.map { g in { (_: [Any?]) throws -> Any? in try g(self) } as JSFunction } as Any?), ("set", slot.set.map { s in { (a: [Any?]) throws -> Any? in try s(self, jsArg(a, 0)); return nil } as JSFunction } as Any?),
                             ("enumerable", slot.enumerable), ("configurable", slot.configurable)])
        }
        return JSObject([("value", storage[k] ?? nil), ("writable", slot.writable), ("enumerable", slot.enumerable), ("configurable", slot.configurable)])
    }

    /// `Object.freeze`, `Object.seal`, `Object.preventExtensions`.
    public func restrict(sealed: Bool, frozen: Bool) {
        extensible = false
        guard sealed || frozen else { return }
        for key in indexKeys.map({ String($0) }) + namedKeys {
            var slot = slots[JSPropertyKey(key)] ?? JSPropertySlot()
            slot.configurable = false
            if frozen && !slot.isAccessor { slot.writable = false }
            slots[JSPropertyKey(key)] = slot
        }
    }

    public var isSealed: Bool { !extensible && storage.keys.allSatisfy { !(slots[$0] ?? JSPropertySlot()).configurable } }
    public var isFrozen: Bool { !extensible && storage.keys.allSatisfy { let s = slots[$0] ?? JSPropertySlot(); return !s.configurable && (s.isAccessor || !s.writable) } }

    public func jsAccessorKind(_ key: String) -> String? {
        guard let slot = slots[JSPropertyKey(key)], slot.isAccessor else { return nil }
        return slot.get != nil && slot.set != nil ? "Getter/Setter" : slot.get != nil ? "Getter" : "Setter"
    }

    /// `Object.getOwnPropertyNames(object)`: string keys, enumerable or not.
    public var ownPropertyNames: [String] {
        indexKeys.map { String($0) } + namedKeys.filter { !jsIsSymbolKey($0) }
    }

    private func define(_ key: String, _ value: Any?) {
        if storage.updateValue(value, forKey: JSPropertyKey(key)) == nil {
            if let index = jsArrayIndex(key) {
                var low = 0, high = indexKeys.count
                while low < high {
                    let mid = (low + high) / 2
                    if indexKeys[mid] < index { low = mid + 1 } else { high = mid }
                }
                indexKeys.insert(index, at: low)
            } else {
                namedKeys.append(key)
            }
        }
    }

    /// `key in object` for own keys.
    public func has(_ key: String) -> Bool {
        jsTracker?.track()
        return storage[JSPropertyKey(key)] != nil
    }

    /// `delete object[key]`.
    @discardableResult
    public func delete(_ key: String) -> Bool {
        if let slot = slots[JSPropertyKey(key)], !slot.configurable { return false }
        slots[JSPropertyKey(key)] = nil
        guard storage.removeValue(forKey: JSPropertyKey(key)) != nil else { return true }
        if let index = jsArrayIndex(key) {
            indexKeys.removeAll { $0 == index }
        } else if let position = namedKeys.firstIndex(where: { jsStringEquals($0, key) }) {
            namedKeys.remove(at: position)
        }
        jsTracker?.trigger()
        return true
    }

    /// `Object.keys(object)` as a Swift array.
    public var keys: [String] {
        jsTracker?.track()
        let all = indexKeys.map { String($0) } + namedKeys.filter { !jsIsSymbolKey($0) }
        return slots.isEmpty ? all : all.filter { slots[JSPropertyKey($0)]?.enumerable ?? true }
    }

    public var jsSymbolKeys: [String] {
        jsTracker?.track()
        return namedKeys.filter(jsIsSymbolKey)
    }

    public subscript(jsKey key: String) -> Any? {
        get { self[key] }
        set { self[key] = newValue }
    }

    public var jsKeys: [String] { keys }
    public var jsClassName: String? { nil }

    public func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }

    public var description: String { jsInspect(self) }
}

// MARK: - Property access

/// `object[key]` / `object.key` on a dynamic value. Reading from undefined or null throws a TypeError.
public func jsGet(_ object: Any?, _ key: String) throws -> Any? {
    // A class itself (`cls.prototype`), before any cast a class object could wrongly pass as an instance.
    if let cls = jsFlat(object) as? AnyClass { return key == "prototype" ? JSPrototypes.of(cls) : nil }
    switch jsFlat(object) {
    case nil:
        throw JSException(JSTypeError("Cannot read properties of undefined (reading '\(key)')"))
    case is JSNull:
        throw JSException(JSTypeError("Cannot read properties of null (reading '\(key)')"))
    case let plain as JSObject:
        return try plain.get(key)
    case let dynamic as JSDynamic:
        return dynamic[jsKey: key]
    case let array as JSArrayProtocol:
        if key == "length" { return Double(array.jsLength) }
        if let index = jsArrayIndex(key) { return Int(index) < array.jsLength ? array.jsElement(at: Int(index)) : nil }
        return jsArrayMethod(array, key)
    case let string as String:
        if key == "length" { return Double(string.utf16.count) }
        if let index = jsArrayIndex(key) {
            let units = string.utf16
            guard Int(index) < units.count else { return nil }
            let unit = units[units.index(units.startIndex, offsetBy: Int(index))]
            return String(decoding: [unit], as: UTF16.self)
        }
        return jsStringMethod(string, key)
    case let match as JSMatch:
        if key == "length" { return match.length }
        if key == "index" { return match.index }
        if key == "input" { return match.input }
        if let index = jsArrayIndex(key) { return match.values.element(Double(index)) ?? nil }
        return nil
    case let map as JSMapProtocol:
        return key == "size" ? Double(map.jsSize) : nil
    case let set as JSSetProtocol:
        return key == "size" ? Double(set.jsSize) : nil
    case let native as NSObject:
        return jsNativeGet(native, key)
    default:
        return nil
    }
}

/// A function value that may be missing, about to be called: undefined is not a function.
public func jsCallee<F>(_ function: F?) throws -> F {
    guard let function else { throw JSException(JSTypeError("undefined is not a function")) }
    return function
}

/// `object[key] op= value` on a dynamic value: the member read once, then written with what
/// `update` makes of it. The new value.
@discardableResult
public func jsUpdate(_ object: Any?, _ key: String, _ update: (Any?) throws -> Any?) throws -> Any? {
    let value = try update(jsGet(object, key))
    try jsSet(object, key, value)
    return value
}

/// `object[key]++` and `object[key]--` on a dynamic value: the old value, as a number.
@discardableResult
public func jsPostUpdate(_ object: Any?, _ key: String, _ step: Double) throws -> Double {
    let old = jsToNumber(try jsGet(object, key))
    try jsSet(object, key, old + step)
    return old
}

/// `object[key] = value` on a dynamic value. Writing to undefined or null throws a TypeError;
/// writes to other primitives are ignored.
public func jsSet(_ object: Any?, _ key: String, _ value: Any?) throws {
    switch jsFlat(object) {
    case nil:
        throw JSException(JSTypeError("Cannot set properties of undefined (setting '\(key)')"))
    case is JSNull:
        throw JSException(JSTypeError("Cannot set properties of null (setting '\(key)')"))
    case let plain as JSObject:
        try plain.put(key, value)
    case let dynamic as JSDynamic:
        let level = jsRestriction(dynamic)
        if level > 0 {
            let exists = dynamic.jsKeys.contains(key)
            if !exists { throw JSException(JSTypeError("Cannot add property \(key), object is not extensible")) }
            if level == 3 { throw JSException(JSTypeError("Cannot assign to read only property '\(key)' of object '#<Object>'")) }
        }
        dynamic[jsKey: key] = value
    case let native as NSObject:
        jsNativeSet(native, key, value)
    case let array as JSArrayProtocol:
        if key == "length" {
            let length = jsToNumber(value)
            guard length >= 0, length <= 4_294_967_295, length == length.rounded(.towardZero) else {
                throw JSException(JSRangeError("Invalid array length"))
            }
            try array.jsSetLength(Int(length))
        } else if let index = jsArrayIndex(key) {
            try array.jsSetElement(value, at: Int(index))
        }
    default:
        break
    }
}

/// Calls a function stored in a dynamic value. Anything else throws a TypeError.
@discardableResult
public func jsCall(_ function: Any?, _ arguments: Any?...) throws -> Any? {
    try jsCall(function, spread: arguments)
}

/// `f(...args)` on an untyped value.
@discardableResult
public func jsCall(_ function: Any?, spread arguments: [Any?]) throws -> Any? {
    if let f = jsFlat(function) as? JSFunction { return try f(arguments) }
    if let method = jsFlat(function) as? JSMethod { return try method(nil, arguments) }
    if let moot = jsFlat(function) as? JSMootValue { throw moot.unavailable() }
    throw JSException(JSTypeError("\(jsInspect(function)) is not a function"))
}

/// `Object.keys(value)`.
public func jsObjectKeys(_ value: Any?) -> JSArray<String> {
    switch jsFlat(value) {
    case let dynamic as JSDynamic: return JSArray(dynamic.jsKeys)
    case let array as JSArrayProtocol: return JSArray((0..<array.jsLength).map { String($0) })
    case let string as String: return JSArray((0..<string.utf16.count).map { String($0) })
    default: return JSArray()
    }
}

/// `Object.values(value)`.
public func jsObjectValues(_ value: Any?) -> JSArray<Any?> {
    switch jsFlat(value) {
    case let dynamic as JSDynamic: return JSArray(dynamic.jsKeys.map { dynamic[jsKey: $0] })
    case let array as JSArrayProtocol: return JSArray(array.jsAnyElements)
    default: return JSArray()
    }
}

/// `Object.entries(value)`, each entry a `(key, value)` tuple.
public func jsObjectEntries(_ value: Any?) -> JSArray<(String, Any?)> {
    switch jsFlat(value) {
    case let dynamic as JSDynamic: return JSArray(dynamic.jsKeys.map { ($0, dynamic[jsKey: $0]) })
    case let array as JSArrayProtocol: return JSArray(array.jsAnyElements.enumerated().map { (String($0.offset), $0.element) })
    default: return JSArray()
    }
}

/// `Object.assign(target, ...sources)`.
@discardableResult
public func jsObjectAssign<T: JSDynamic>(_ target: T, _ sources: Any?...) -> T {
    for source in sources {
        switch jsFlat(source) {
        case let dynamic as JSDynamic:
            for key in dynamic.jsKeys { target[jsKey: key] = dynamic[jsKey: key] }
        case let array as JSArrayProtocol:
            for (i, v) in array.jsAnyElements.enumerated() { target[jsKey: String(i)] = v }
        default:
            break
        }
    }
    return target
}

// MARK: - Operators

/// `typeof value`.
public func jsTypeof(_ value: Any?) -> String {
    guard let v = jsFlat(value) else { return "undefined" }
    if let boolean = jsNativeBoolean(v) { _ = boolean; return "boolean" }
    if jsIsNativeNumber(v) { return "number" }
    switch v {
    case is String: return "string"
    case is Bool: return "boolean"
    case is JSNull: return "object"
    case is JSSymbol: return "symbol"
    case is JSBigInt: return "bigint"
    default:
        if jsNumeric(v) != nil { return "number" }
        return jsIsFunction(v) ? "function" : "object"
    }
}

/// `value === undefined || value === null`.
public func jsIsNullish(_ value: Any?) -> Bool {
    let v = jsFlat(value)
    return v == nil || v is JSNull
}

/// JavaScript truthiness: false for undefined, null, false, 0, -0, NaN and "".
public func jsIsTruthy(_ value: Any?) -> Bool {
    switch jsFlat(value) {
    case nil: return false
    case let b as Bool: return b
    case let d as Double: return d != 0 && !d.isNaN
    case let s as String: return !s.isEmpty
    case is JSNull: return false
    case let b as JSBigInt: return !b.isZero
    case let v?:
        if let n = jsNumeric(v) { return n != 0 && !n.isNaN }
        return true
    }
}

/// `a === b`: numbers by value (NaN unequal to itself, -0 equal to +0), strings by code units,
/// objects by identity. Closures cannot be compared in Swift and are never equal.
public func jsStrictEquals(_ a: Any?, _ b: Any?) -> Bool {
    let a = jsFlat(a), b = jsFlat(b)
    switch (a, b) {
    case (nil, nil): return true
    case (nil, _), (_, nil): return false
    case let (x as Double, y as Double): return x == y
    case let (x as String, y as String): return jsStringEquals(x, y)
    case let (x as Bool, y as Bool): return x == y
    case let (x as JSBigInt, y as JSBigInt): return x == y
    case let (x?, y?):
        if let m = jsNumeric(x), let n = jsNumeric(y) { return m == n }
        guard jsIsObject(x), jsIsObject(y) else { return false }
        return (x as AnyObject) === (y as AnyObject)
    }
}

/// SameValueZero (`includes`, `Map` and `Set` keys): `===` except NaN equals NaN.
public func jsSameValueZero(_ a: Any?, _ b: Any?) -> Bool {
    if let x = jsFlat(a).flatMap(jsNumeric), let y = jsFlat(b).flatMap(jsNumeric), x.isNaN && y.isNaN { return true }
    return jsStrictEquals(a, b)
}

/// SameValue (`Object.is`): `===` except NaN equals NaN and -0 differs from +0.
public func jsSameValue(_ a: Any?, _ b: Any?) -> Bool {
    if let x = jsFlat(a).flatMap(jsNumeric), let y = jsFlat(b).flatMap(jsNumeric) {
        if x.isNaN && y.isNaN { return true }
        return x == y && x.sign == y.sign
    }
    return jsStrictEquals(a, b)
}

/// `a == b`: null equals undefined; numbers, strings and booleans compare after conversion;
/// an object against a primitive compares through its string form.
public func jsLooseEquals(_ a: Any?, _ b: Any?) -> Bool {
    let a = jsFlat(a), b = jsFlat(b)
    let aNullish = a == nil || a is JSNull
    let bNullish = b == nil || b is JSNull
    if aNullish || bNullish { return aNullish && bNullish }
    guard let x = a, let y = b else { return false }
    if let big = x as? JSBigInt { return jsBigIntLooseEquals(big, y) }
    if let big = y as? JSBigInt { return jsBigIntLooseEquals(big, x) }
    if let m = jsNumeric(x), let n = jsNumeric(y) { return m == n }
    if let s = x as? String, let t = y as? String { return jsStringEquals(s, t) }
    if let p = x as? Bool, let q = y as? Bool { return p == q }
    if x is Bool { return jsLooseEquals(jsToNumber(x), y) }
    if y is Bool { return jsLooseEquals(x, jsToNumber(y)) }
    if let n = jsNumeric(x), let t = y as? String { return n == jsNumberFromString(t) }
    if let s = x as? String, let n = jsNumeric(y) { return jsNumberFromString(s) == n }
    let xPrimitive = x is String || jsNumeric(x) != nil
    let yPrimitive = y is String || jsNumeric(y) != nil
    if jsIsObject(x) && yPrimitive { return jsLooseEquals(jsToPrimitive(x), y) }
    if xPrimitive && jsIsObject(y) { return jsLooseEquals(x, jsToPrimitive(y)) }
    return jsStrictEquals(x, y)
}

/// ToPrimitive with the default hint: objects become their string form.
func jsToPrimitive(_ value: Any?) -> Any? {
    guard let v = jsFlat(value) else { return nil }
    switch v {
    case is String, is Bool, is JSNull, is JSSymbol, is JSBigInt: return v
    default:
        if let n = jsNumeric(v) { return n }
        if let user = jsUserPrimitive(v, "default") { return user }
        return jsToString(v)
    }
}

/// A `+` operand beside a string: ToString(ToPrimitive(value, default)).
public func jsToStringDefault(_ value: Any?) -> String { jsToString(jsToPrimitive(value)) }

/// `Number(value)` / unary `+`.
public func jsToNumber(_ value: Any?) -> Double {
    switch jsFlat(value) {
    case nil: return .nan
    case let d as Double: return d
    case let s as String: return jsNumberFromString(s)
    case let b as Bool: return b ? 1 : 0
    case is JSNull: return 0
    case let big as JSBigInt: return big.toDouble()
    case let v?:
        if let n = jsNumeric(v) { return n }
        if jsIsFunction(v) || v is JSSymbol { return .nan }
        if let user = jsUserPrimitive(v, "number") { return jsToNumber(user) }
        return jsNumberFromString(jsToString(v))
    }
}

enum JSJoinGuard {
    nonisolated(unsafe) static var active: [ObjectIdentifier] = []
}

/// `String(value)`: arrays join with ",", plain objects are "[object Object]", errors "Name: message".
public func jsToString(_ value: Any?) -> String {
    switch jsFlat(value) {
    case nil: return "undefined"
    case let s as String: return s
    case let d as Double: return jsNumberToString(d)
    case let b as Bool: return b ? "true" : "false"
    case is JSNull: return "null"
    case let v as JSToPrimitive: return jsToString(jsUserPrimitive(v, "string") ?? nil)
    // What a throwing toString() throws is not seen by a conversion that cannot throw: the default conversion.
    case let v as JSStringConvertible: return (try? v.toString()) ?? "[object Object]"
    case let symbol as JSSymbol: return symbol.toString()
    case let big as JSBigInt: return big.toString()
    case let tagged as JSToStringTag: return "[object \(tagged.jsToStringTag)]"
    case let error as JSError: return error.jsErrorString
    case let array as JSArrayProtocol: return array.jsJoin(",")
    case is JSMapProtocol: return "[object Map]"
    case is JSSetProtocol: return "[object Set]"
    case is JSThenable: return "[object Promise]"
    case let v?:
        if let n = jsNumeric(v) { return jsNumberToString(n) }
        if jsIsFunction(v) { return "function () { [native code] }" }
        if jsIsObject(v) { return "[object Object]" }
        return String(describing: v)
    }
}

/// `a + b`: string concatenation when either side is (or converts to) a string, else numeric addition.
public func jsAdd(_ a: Any?, _ b: Any?) -> Any? {
    let x = jsToPrimitive(a), y = jsToPrimitive(b)
    if x is String || y is String { return jsToString(x) + jsToString(y) }
    return jsToNumber(x) + jsToNumber(y)
}

extension JSArrayProtocol {
    func jsJoin(_ separator: String) -> String {
        let id = ObjectIdentifier(self)
        if JSJoinGuard.active.contains(id) { return "" }
        JSJoinGuard.active.append(id)
        defer { JSJoinGuard.active.removeLast() }
        var out = ""
        for (i, element) in jsAnyElements.enumerated() {
            if i > 0 { out += separator }
            if element == nil || element is JSNull { continue }
            out += jsToString(element)
        }
        return out
    }
}

/// `f?.(args)` on an untyped value: undefined when `f` is undefined or null.
@discardableResult
public func jsCallOptional(_ function: Any?, _ arguments: Any?...) throws -> Any? {
    try jsCallOptional(function, spread: arguments)
}

@discardableResult
public func jsCallOptional(_ function: Any?, spread arguments: [Any?]) throws -> Any? {
    if jsIsNullish(function) { return nil }
    return try jsCall(function, spread: arguments)
}

/// `globalThis` read as an object: the runtime's globals (`NativeScriptRuntime`, `com.tns`) are not
/// in a native app, so reading one gives undefined.
public let jsGlobalThis = JSObject([])

/// Lenient code: a value that may be undefined where its type says an object, read as
/// an optional where one is taken and unwrapped (JavaScript's TypeError if missing) elsewhere.
@inline(__always)
public func jsImplicit<T>(_ value: T?) -> T! { value }

/// `value.constructor.name`: the name of the class that made the value.
public func jsConstructorName(_ value: Any?) -> String {
    let v = jsFlat(value)
    if let dynamic = v as? JSDynamic, let name = dynamic.jsClassName { return name }
    switch v {
    case is String: return "String"
    case is Double: return "Number"
    case is Bool: return "Boolean"
    case nil: return ""
    default:
        let name = String(describing: type(of: v!))
        return name.split(separator: "__").first.map(String.init) ?? name
    }
}
