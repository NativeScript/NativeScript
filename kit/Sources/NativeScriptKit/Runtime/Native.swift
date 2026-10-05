import Foundation
#if canImport(UIKit)
import UIKit
#endif

// Native objects read untyped: what NativeScript's runtime marshals for a
// property of an Objective-C object script holds as `any`. Objects are
// read and written by key (KVC) where the class answers to it; numbers,
// strings and the common geometry structs come back as JavaScript values.

/// An NSNumber (not a Swift number boxed in `Any`).
func jsIsNativeNumber(_ v: Any) -> Bool {
    guard let n = v as? NSNumber, String(describing: type(of: v)).hasPrefix("__NSCF") else { return false }
    return CFGetTypeID(n) != CFBooleanGetTypeID()
}

/// A CFBoolean NSNumber's value.
func jsNativeBoolean(_ v: Any) -> Bool? {
    guard let n = v as? NSNumber, String(describing: type(of: v)).hasPrefix("__NSCF"), CFGetTypeID(n) == CFBooleanGetTypeID() else { return nil }
    return n.boolValue
}

func jsNativeGet(_ object: NSObject, _ key: String) -> Any? {
    // Collections answer key-value coding for their elements, not themselves (`value(forKey: "count")` maps over an array).
    if let collection = jsCollectionMember(object, key) { return collection }
    if jsHasObjCProperty(type(of: object), key) { return jsFromNative(object.value(forKey: key)) }
    // A method: callable as JavaScript calls it, with no argument or one object.
    let none = NSSelectorFromString(key), one = NSSelectorFromString(key + ":")
    if object.responds(to: none) {
        return { (_: [Any?]) throws -> Any? in jsFromNative(object.perform(none)?.takeUnretainedValue()) } as JSFunction
    }
    if object.responds(to: one) {
        return { (args: [Any?]) throws -> Any? in jsFromNative(object.perform(one, with: jsToNative(jsArg(args, 0)))?.takeUnretainedValue()) } as JSFunction
    }
    return jsExpandos(object)?[key]
}

/// Properties script added to a native object, kept with the object (an associated object).
private func jsExpandos(_ object: NSObject, create: Bool = false) -> JSObject? {
    if let existing = objc_getAssociatedObject(object, &jsExpandoKey) as? JSObject { return existing }
    guard create else { return nil }
    let made = JSObject()
    objc_setAssociatedObject(object, &jsExpandoKey, made, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    return made
}
nonisolated(unsafe) private var jsExpandoKey: UInt8 = 0

/// Whether the class or one it extends declares an Objective-C property of that name.
func jsHasObjCProperty(_ cls: AnyClass, _ name: String) -> Bool {
    var c: AnyClass? = cls
    while let current = c {
        if class_getProperty(current, name) != nil { return true }
        c = class_getSuperclass(current)
    }
    return false
}

/// A native object read and written by a computed key (`view[property]`), as the runtime marshals its properties.
public struct JSNativeKeyed {
    let object: NSObject
    public init(_ object: NSObject) { self.object = object }
    public subscript(jsKey key: String) -> Any? {
        get { jsNativeGet(object, key) }
        nonmutating set { jsNativeSet(object, key, newValue) }
    }
}

/// A property script added to a native object, kept with the object; undefined on a missing object.
public func jsNativeExpando(_ object: NSObject?, _ key: String) -> Any? {
    guard let object else { return nil }
    return jsExpandos(object)?[key]
}

/// `object.key = value` for a property script adds to a native object.
public func jsSetNativeExpando(_ object: NSObject?, _ key: String, _ value: Any?) {
    guard let object else { return }
    jsExpandos(object, create: true)?[key] = value
}

/// `object.key = value` of a protocol's optional property, which Swift can't assign through the
/// protocol: the object's setter where it implements one, else nothing.
public func jsSetOptionalNativeProperty(_ object: Any?, _ key: String, _ value: Any?) {
    guard let object = jsFlat(object) as? NSObject, let first = key.first else { return }
    guard object.responds(to: NSSelectorFromString("set\(first.uppercased())\(key.dropFirst()):")) else { return }
    object.setValue(value, forKey: key)
}

/// The iOS runtime's `__collect()`: nothing to collect where reference counting frees objects.
public func __collect() {}

/// The iOS runtime's `__releaseNativeCounterpart(object)`: no script wrapper holds the object here.
public func __releaseNativeCounterpart(_ object: NSObject?) {}

/// A native-property decorator's getter: the native object's getter method if it has one, else the fallback.
public func jsNativePropertyGet(_ native: Any?, _ getter: String, fallback: Any?) -> Any? {
    guard let object = jsFlat(native) as? NSObject, object.responds(to: NSSelectorFromString(getter)) else { return fallback }
    return jsFromNative(object.perform(NSSelectorFromString(getter))?.takeUnretainedValue())
}

/// A native-property decorator's setter: the native setter `setFoo:` called with the value, by key.
public func jsNativePropertySet(_ native: Any?, _ setter: String, _ value: Any?) {
    guard let object = jsFlat(native) as? NSObject, setter.hasPrefix("set"), object.responds(to: NSSelectorFromString(setter + ":")) else { return }
    let key = setter.dropFirst(3).prefix(1).lowercased() + setter.dropFirst(4)
    object.setValue(jsToNative(value), forKey: key)
}

/// `a || b` on untyped values.
public func jsOr(_ a: Any?, _ b: Any?) -> Any? { jsTruthy(a) ? a : b }

func jsNativeSet(_ object: NSObject, _ key: String, _ value: Any?) {
    let setter = "set" + key.prefix(1).uppercased() + key.dropFirst() + ":"
    guard object.responds(to: NSSelectorFromString(setter)) else {
        jsExpandos(object, create: true)?[key] = value
        return
    }
    object.setValue(jsToNative(value), forKey: key)
}

/// A native value as script reads it.
public func jsFromNative(_ value: Any?) -> Any? {
    guard let v = value else { return nil }
    if let b = jsNativeBoolean(v) { return b }
    if jsIsNativeNumber(v), let n = v as? NSNumber { return n.doubleValue }
    if let s = v as? NSString { return s as String }
    if let d = v as? NSDate { return JSDate(d as Date) }
    #if canImport(UIKit)
    if let nsValue = v as? NSValue, !(v is NSNumber) {
        let type = String(cString: nsValue.objCType)
        if type.hasPrefix("{UIEdgeInsets") { let i = nsValue.uiEdgeInsetsValue; return JSObject([("top", Double(i.top)), ("left", Double(i.left)), ("bottom", Double(i.bottom)), ("right", Double(i.right))]) }
        if type.hasPrefix("{CGRect") { let r = nsValue.cgRectValue; return JSObject([("origin", JSObject([("x", Double(r.origin.x)), ("y", Double(r.origin.y))])), ("size", JSObject([("width", Double(r.width)), ("height", Double(r.height))]))]) }
        if type.hasPrefix("{CGSize") { let z = nsValue.cgSizeValue; return JSObject([("width", Double(z.width)), ("height", Double(z.height))]) }
        if type.hasPrefix("{CGPoint") { let p = nsValue.cgPointValue; return JSObject([("x", Double(p.x)), ("y", Double(p.y))]) }
    }
    #endif
    return v
}

/// A script Date as Foundation's, the same instant: what the runtime passes for one.
public func jsNativeDate(_ date: JSDate) -> Date { Date(timeIntervalSince1970: date.time / 1000) }

extension JSDate {
    public convenience init(_ date: Date) { self.init(date.timeIntervalSince1970 * 1000) }
}

public func jsToNative(_ value: Any?) -> Any? {
    switch jsFlat(value) {
    case nil, is JSNull: return nil
    case let d as Double: return NSNumber(value: d)
    case let b as Bool: return NSNumber(value: b)
    case let s as String: return s as NSString
    case let d as JSDate: return jsNativeDate(d) as NSDate
    case let a as JSArrayProtocol: return a.jsAnyElements.map { jsToNative($0) ?? NSNull() }
    case let v?: return v
    }
}

/// NSArray's and NSDictionary's members as NativeScript's runtime exposes them.
private func jsCollectionMember(_ object: NSObject, _ key: String) -> Any?? {
    if let array = object as? NSArray {
        switch key {
        case "count": return Double(array.count)
        case "firstObject": return jsFromNative(array.firstObject)
        case "lastObject": return jsFromNative(array.lastObject)
        case "objectAtIndex":
            return { (args: [Any?]) throws -> Any? in
                let i = Int(jsToNumber(jsArg(args, 0)))
                guard i >= 0, i < array.count else { throw JSException(JSRangeError("index \(i) beyond bounds")) }
                return jsFromNative(array.object(at: i))
            } as JSFunction
        default: return nil
        }
    }
    if let dictionary = object as? NSDictionary {
        switch key {
        case "count": return Double(dictionary.count)
        case "allKeys": return dictionary.allKeys as NSArray
        case "allValues": return dictionary.allValues as NSArray
        case "objectForKey", "valueForKey":
            return { (args: [Any?]) throws -> Any? in
                guard let k = jsToNative(jsArg(args, 0)) else { return nil }
                return jsFromNative(dictionary.object(forKey: k))
            } as JSFunction
        default: return nil
        }
    }
    return nil
}

/// `getClass(value)` from core's utils/types: the class name script sees for a value.
public func getClass(_ value: Any?) -> String {
    guard let v = jsFlat(value) else { return "undefined" }
    if v is JSNull { return "null" }
    // NSNumbers first: Swift's `is Bool` and `is Double` accept any NSNumber.
    if v is NSDecimalNumber { return "NSDecimalNumber" }
    if jsNativeBoolean(v) != nil { return "Boolean" }
    if jsIsNativeNumber(v) { return "Number" }
    switch v {
    case is String, is NSString: return "String"
    case is Bool: return "Boolean"
    case is Double, is NSNumber: return "Number"
    case is Date, is NSDate: return "Date"
    case is NSMutableArray: return "NSMutableArray"
    case is NSArray: return "NSArray"
    case is NSMutableDictionary: return "NSMutableDictionary"
    case is NSDictionary: return "NSDictionary"
    case is JSArrayProtocol: return "Array"
    case let o as NSObject: return String(describing: type(of: o))
    default: return (v as? JSDynamic)?.jsClassName ?? "Object"
    }
}

/// An untyped object where a native API takes a dictionary: each key's value
/// marshalled as the runtime does (numbers as NSNumber, arrays as NSArray).
public func jsToNativeDictionary(_ value: Any?) -> [AnyHashable: Any] {
    switch jsFlat(value) {
    case let dictionary as [AnyHashable: Any]: return dictionary
    case let dictionary as NSDictionary: return dictionary as? [AnyHashable: Any] ?? [:]
    case let object as JSDynamic:
        var out: [AnyHashable: Any] = [:]
        for key in object.jsKeys {
            let v = object[jsKey: key]
            if let nested = jsFlat(v) as? JSDynamic, !(nested is JSArrayProtocol) { out[key] = jsToNativeDictionary(nested) as NSDictionary }
            else if let native = jsToNative(v) { out[key] = native }
        }
        return out
    default: return [:]
    }
}

/// A dictionary Swift keys by a string-backed type (`[NSAttributedString.Key: Any]`): script's
/// object or a Foundation dictionary, its string keys as that type.
public func jsNativeKeyed<K: RawRepresentable & Hashable>(_ value: Any?, _: K.Type) -> [K: Any] where K.RawValue == String {
    var out: [K: Any] = [:]
    for (key, v) in jsToNativeDictionary(value) {
        if let typed = key as? K { out[typed] = v } else if let name = key as? String, let typed = K(rawValue: name) { out[typed] = v }
    }
    return out
}

/// An untyped value where Objective-C takes a nullable string: its string, nil for undefined or null.
public func jsNativeString(_ value: Any?) -> String? {
    jsIsNullish(value) ? nil : jsToString(value)
}

/// `array[i]` on a native array: undefined unless `i` is an index in range.
public func jsNativeElement<T>(_ array: [T]?, _ i: Double) -> Any? {
    guard let a = array, let k = Int(exactly: i), k >= 0, k < a.count else { return nil }
    return a[k]
}

/// A struct where Objective-C takes a pointer to one (`CGPathAddArc(path, transform, ...)`): a copy that
/// stays valid until the current autorelease pool drains, as the iOS runtime passes it. Undefined is null.
public func jsStructPointer<T>(_ value: Any?, _: T.Type) -> UnsafePointer<T>? {
    guard let v = jsFlat(value) as? T else { return nil }
    let held = JSStructCopy(v)
    _ = Unmanaged.passRetained(held).autorelease()
    return UnsafePointer(held.pointer)
}

private final class JSStructCopy<T>: NSObject {
    let pointer: UnsafeMutablePointer<T>
    init(_ value: T) {
        pointer = .allocate(capacity: 1)
        pointer.initialize(to: value)
    }
    deinit {
        pointer.deinitialize(count: 1)
        pointer.deallocate()
    }
}

/// The folder of the app's bundled script in the app bundle: what NativeScript's runtime gives it as `__dirname`.
public let jsAppDirectory: String = Bundle.main.bundlePath + "/app"

/// `import.meta` of the app's bundled script.
public let jsImportMeta: JSObject = JSObject([("dirname", jsAppDirectory), ("filename", jsAppDirectory + "/bundle.mjs"), ("url", "file://" + jsAppDirectory + "/bundle.mjs")])
