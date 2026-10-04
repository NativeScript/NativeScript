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

public func jsToNative(_ value: Any?) -> Any? {
    switch jsFlat(value) {
    case nil, is JSNull: return nil
    case let d as Double: return NSNumber(value: d)
    case let b as Bool: return NSNumber(value: b)
    case let s as String: return s as NSString
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
