import Foundation

// Classes held as values (`const C = TypeError`, `e.constructor`): instanceof against one, and the name script reads.

/// `value instanceof C` for a class held as a value: an instance of it or of a subclass. A value that is no class
/// (a function, which the runtime's built-in conversions are) gives false rather than JavaScript's TypeError for a
/// non-callable right-hand side.
public func jsInstanceOf(_ value: Any?, _ constructor: Any?) -> Bool {
    guard let c = jsFlat(constructor), jsIsClassObject(c), let cls = c as? AnyClass else { return false }
    guard let v = jsFlat(value), jsIsObject(v) else { return false }
    var current: AnyClass? = type(of: v as AnyObject)
    while let k = current {
        if k === cls { return true }
        current = class_getSuperclass(k)
    }
    return false
}

/// The runtime's error classes by the names script knows them by.
private let jsErrorClassNames: [ObjectIdentifier: String] = [
    ObjectIdentifier(JSError.self): "Error", ObjectIdentifier(JSTypeError.self): "TypeError", ObjectIdentifier(JSRangeError.self): "RangeError",
    ObjectIdentifier(JSSyntaxError.self): "SyntaxError", ObjectIdentifier(JSReferenceError.self): "ReferenceError", ObjectIdentifier(JSAggregateError.self): "AggregateError",
]

/// `C.name` of a class held as a value: a runtime error class by its JavaScript name, a program's class by its own
/// (without the `__file` suffix that tells apart classes several modules name alike).
public func jsClassValueName(_ cls: Any.Type) -> String {
    if let name = jsErrorClassNames[ObjectIdentifier(cls)] { return name }
    let name = String(describing: cls).components(separatedBy: "<")[0]
    return name.components(separatedBy: "__")[0]
}
