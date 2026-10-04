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
    guard object.responds(to: NSSelectorFromString(key)) else { return nil }
    return jsFromNative(object.value(forKey: key))
}

func jsNativeSet(_ object: NSObject, _ key: String, _ value: Any?) {
    let setter = "set" + key.prefix(1).uppercased() + key.dropFirst() + ":"
    guard object.responds(to: NSSelectorFromString(setter)) else { return }
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

func jsToNative(_ value: Any?) -> Any? {
    switch jsFlat(value) {
    case nil, is JSNull: return nil
    case let d as Double: return NSNumber(value: d)
    case let b as Bool: return NSNumber(value: b)
    case let s as String: return s as NSString
    case let a as JSArrayProtocol: return a.jsAnyElements.map { jsToNative($0) ?? NSNull() }
    case let v?: return v
    }
}
