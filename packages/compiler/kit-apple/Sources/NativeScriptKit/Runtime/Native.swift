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
    guard jsTypeKind(v) == .objCClass, let n = v as? NSNumber, jsIsCFNumber(n) else { return false }
    return CFGetTypeID(n) != CFBooleanGetTypeID()
}

/// A CFBoolean NSNumber's value.
func jsNativeBoolean(_ v: Any) -> Bool? {
    guard jsTypeKind(v) == .objCClass, let n = v as? NSNumber, jsIsCFNumber(n), CFGetTypeID(n) == CFBooleanGetTypeID() else { return nil }
    return n.boolValue
}

/// A number Core Foundation made (`__NSCFNumber`, `__NSCFBoolean`), not a Swift number bridged into one.
private func jsIsCFNumber(_ n: NSNumber) -> Bool {
    object_getClass(n).map { NSStringFromClass($0).hasPrefix("__NSCF") } ?? false
}

/// A number where native code takes a floating-point one, as the runtime marshals it: undefined is 0,
/// and Swift holds an undefined number as NaN.
@inline(__always) public func jsNativeNumber(_ value: Double) -> Double { value.isNaN ? 0 : value }

/// A number where native code takes an integer, as the runtime marshals it: NaN and the infinities are 0,
/// anything else truncated toward zero and clamped to the type's range.
public func jsNativeInteger<T: FixedWidthInteger>(_ value: Double, _: T.Type) -> T {
    guard value.isFinite else { return 0 }
    let truncated = value.rounded(.towardZero)
    if truncated <= Double(T.min) { return T.min }
    if truncated >= Double(T.max) { return T.max }
    return T(truncated)
}

/// Whether the OS is this iOS version or newer: `typeof NewClass` where the deployment target predates the class.
public func jsOSAtLeast(_ version: Double) -> Bool {
    let major = Int(version), minor = Int(((version - Double(major)) * 10).rounded())
    return ProcessInfo.processInfo.isOperatingSystemAtLeast(OperatingSystemVersion(majorVersion: major, minorVersion: minor, patchVersion: 0))
}

/// A number where native code takes an integer, from what script passes: a number, or a BigInt (a 64-bit handle).
public func jsNativeIntegerArgument<T: FixedWidthInteger>(_ value: Any?, _: T.Type) -> T {
    if let big = jsFlat(value) as? JSBigInt { return T.isSigned ? T(truncatingIfNeeded: big.int64) : T(truncatingIfNeeded: big.uint64) }
    return jsNativeInteger(jsToNumber(value), T.self)
}

/// What script passes where native code takes a value of this type, as the runtime marshals it.
public func jsNativeArgument<T>(_ value: Any?, _: T.Type) -> T { jsToNative(value) as! T }

/// An enum or option set from the number script passes: its raw value, a case the type does not list included.
public func jsNativeArgument<T: RawRepresentable>(_ value: Any?, _: T.Type) -> T where T.RawValue: FixedWidthInteger {
    if let v = jsFlat(value) as? T { return v }
    let raw = jsNativeIntegerArgument(value, T.RawValue.self)
    if let v = T(rawValue: raw) { return v }
    precondition(MemoryLayout<T>.size == MemoryLayout<T.RawValue>.size, "\(T.self) has no case \(raw)")
    return withUnsafeBytes(of: raw) { $0.load(as: T.self) }
}

/// A native result as script reads it.
public func jsNativeResult(_ value: Any?) -> Any? { jsFromNative(value) }

/// An enum or option set, a number to script.
public func jsNativeResult<T: RawRepresentable>(_ value: T) -> Any? where T.RawValue: FixedWidthInteger { Double(value.rawValue) }

public func jsNativeResult<T: RawRepresentable>(_ value: T?) -> Any? where T.RawValue: FixedWidthInteger { value.map { Double($0.rawValue) } }

/// The plugins' native members untyped script reaches, by name: the app's `__NativeDispatch`, generated from the
/// plugins' metadata. Each answers nil (or false) for an object or name it has nothing for.
public enum JSNativeDispatch {
    nonisolated(unsafe) public static var get: ((AnyObject, String) -> Any??)?
    nonisolated(unsafe) public static var set: ((AnyObject, String, Any?) -> Bool)?
    nonisolated(unsafe) public static var call: ((AnyObject, String, [Any?]) throws -> Any??)?
}

/// A native class script made with `Cls.extend(methods, { protocols })`: `new()` makes an instance answering from the methods.
public final class JSExtendedClass {
    let make: () -> NSObject
    public init(_ make: @escaping () -> NSObject) { self.make = make }
}

/// A method of the object an extended class was made with, called with the instance as `this`; undefined where it has none.
public func jsCallExtended(_ object: AnyObject, _ methods: Any?, _ key: String, _ arguments: [Any?]) throws -> Any? {
    switch jsFlat(try jsGet(methods, key)) {
    case let method as JSMethod: return try method(object, arguments)
    case let function as JSFunction: return try function(arguments)
    default: return nil
    }
}

/// `Cls.alloc()` on a class script holds untyped: the class, until an initializer (`initWithFrame`) makes the object.
public final class JSNativeAllocation {
    public let cls: AnyClass
    init(_ cls: AnyClass) { self.cls = cls }
}

/// A program's subclass of a native class: its own members by name, which Objective-C cannot see; nil for a name it does not declare.
public protocol JSNativeMembers: AnyObject {
    func jsMember(_ key: String) -> Any??
}

func jsNativeGet(_ object: NSObject, _ key: String) -> Any? {
    if let value = JSNativeDispatch.get?(object, key) { return value }
    // A function script set, which `jsNativeSet` keeps as script's own.
    if let own = jsExpandos(object), own.has(key) { return own[key] }
    if let own = object as? JSNativeMembers, let value = own.jsMember(key) { return value }
    // Collections answer key-value coding for their elements, not themselves (`value(forKey: "count")` maps over an array).
    if let collection = jsCollectionMember(object, key) { return collection }
    let absent = jsNativeAbsent(type(of: object), key)
    if !absent, jsHasObjCProperty(type(of: object), key) {
        // Key-value coding cannot box a Core Foundation object (`UIColor.CGColor`) and raises; the getter's message send gives it.
        if let getter = jsCFObjectGetter(type(of: object), key), object.responds(to: getter) {
            return object.perform(getter)?.takeUnretainedValue()
        }
        // Key-value coding raises where the getter is only forwarded; script's message send reaches it.
        guard let reader = jsGetterReceiver(object, key) else { return nil }
        return jsFromNative(reader.value(forKey: key))
    }
    // A method: callable as JavaScript calls it, with no argument or one object.
    let none = NSSelectorFromString(key), one = NSSelectorFromString(key + ":")
    // `perform` passes and gives objects: a number, enum or boolean (`imageWithRenderingMode:`) goes through `jsNativeMethod`, by its type.
    if object.responds(to: none), jsPerformable(type(of: object), none) {
        return { (_: [Any?]) throws -> Any? in jsFromNative(object.perform(none)?.takeUnretainedValue()) } as JSFunction
    }
    if object.responds(to: one), jsPerformable(type(of: object), one) {
        return { (args: [Any?]) throws -> Any? in jsFromNative(object.perform(one, with: jsToNative(jsArg(args, 0)))?.takeUnretainedValue()) } as JSFunction
    }
    if !absent {
        if let method = jsNativeMethod(object, key) { return method }
        jsNativeMarkAbsent(type(of: object), key)
    }
    return jsExpandos(object)?[key]
}

/// A key a class has neither an Objective-C property nor a script-named method for: a property script
/// sets on native objects, read before it is set (`view.outerShadowContainerLayer`). Looking it up again
/// walks every class's property list and selector table.
private struct JSNativeMemberKey: Hashable {
    let cls: ObjectIdentifier
    let key: String
}

nonisolated(unsafe) private var jsNativeAbsentKeys = Set<JSNativeMemberKey>()
private let jsNativeAbsentLock = NSLock()

private func jsNativeAbsent(_ cls: AnyClass, _ key: String) -> Bool {
    jsNativeAbsentLock.lock()
    defer { jsNativeAbsentLock.unlock() }
    return jsNativeAbsentKeys.contains(JSNativeMemberKey(cls: ObjectIdentifier(cls), key: key))
}

private func jsNativeMarkAbsent(_ cls: AnyClass, _ key: String) {
    jsNativeAbsentLock.lock()
    defer { jsNativeAbsentLock.unlock() }
    jsNativeAbsentKeys.insert(JSNativeMemberKey(cls: ObjectIdentifier(cls), key: key))
}

/// Whether a method takes and gives only objects (or nothing back), as `perform` assumes; one only forwarded has no types to tell.
private func jsPerformable(_ cls: AnyClass, _ selector: ObjectiveC.Selector) -> Bool {
    guard let method = class_getInstanceMethod(cls, selector) else { return true }
    let r = method_copyReturnType(method)
    defer { free(r) }
    guard ["@", "v", "#"].contains(String(cString: r).prefix(1)) else { return false }
    for i in 2..<method_getNumberOfArguments(method) {
        guard let p = method_copyArgumentType(method, i) else { return false }
        defer { free(p) }
        if !["@", "#"].contains(String(cString: p).prefix(1)) { return false }
    }
    return true
}

/// A method script names as the runtime does, its selector's parts joined
/// (`nativeScriptSetTextDecorationAndTransformTextDecorationLetterSpacingLineHeight`
/// for `nativeScriptSetTextDecorationAndTransform:textDecoration:letterSpacing:lineHeight:`),
/// callable with objects and numbers and giving an object, a number or nothing.
private func jsNativeMethod(_ object: NSObject, _ key: String) -> JSFunction? {
    #if arch(arm64) && canImport(UIKit)
    guard let selector = jsSelector(type(of: object), key), let method = class_getInstanceMethod(type(of: object), selector) else { return nil }
    let count = Int(method_getNumberOfArguments(method)) - 2
    let argumentTypes = (0..<count).map { i -> String in
        guard let p = method_copyArgumentType(method, UInt32(i + 2)) else { return "?" }
        defer { free(p) }
        return String(cString: p)
    }
    let fullReturnType: String = {
        let p = method_copyReturnType(method)
        defer { free(p) }
        return String(cString: p)
    }()
    let returnType = fullReturnType.first ?? "v"
    return { args in
        // Arm64 passes integers and pointers in x registers and floating point in v registers, each in order.
        var ints: [UInt] = [], doubles: [Double] = [], kept: [AnyObject] = []
        for (i, full) in argumentTypes.enumerated() {
            let value = jsArg(args, i)
            // Structs of floating point members (`CGPoint`, `CGRect`) travel in v registers, member by member.
            if full.hasPrefix("{CGPoint"), let p = jsNativeStruct(value, CGPoint.self) { doubles += [Double(p.x), Double(p.y)]; continue }
            if full.hasPrefix("{CGSize"), let z = jsNativeStruct(value, CGSize.self) { doubles += [Double(z.width), Double(z.height)]; continue }
            if full.hasPrefix("{CGRect"), let r = jsNativeStruct(value, CGRect.self) { doubles += [Double(r.origin.x), Double(r.origin.y), Double(r.width), Double(r.height)]; continue }
            let t = full.first ?? "?"
            switch t {
            case "@", "#":
                let native = jsToNative(value).map { $0 as AnyObject }
                if let native { kept.append(native) }
                ints.append(native.map { UInt(bitPattern: Unmanaged.passUnretained($0).toOpaque()) } ?? 0)
            case "d": doubles.append(jsToNumber(value))
            case "f": doubles.append(Double(bitPattern: UInt64(Float(jsToNumber(value)).bitPattern)))
            case "B", "c", "C": ints.append(jsTruthy(value) ? 1 : 0)
            case "q", "Q", "i", "I", "l", "L", "s", "S": ints.append(UInt(bitPattern: Int(jsToNumber(value))))
            default: throw JSException(JSTypeError("\(key): an argument of type \(t) is not supported"))
            }
        }
        guard ints.count <= 6, doubles.count <= 8 else { throw JSException(JSTypeError("\(key): too many arguments")) }
        while ints.count < 6 { ints.append(0) }
        while doubles.count < 8 { doubles.append(0) }
        let send = dlsym(UnsafeMutableRawPointer(bitPattern: -2), "objc_msgSend")!
        let receiver = UInt(bitPattern: Unmanaged.passUnretained(object).toOpaque())
        let sel = unsafeBitCast(selector, to: UInt.self)
        let result: Any?
        if fullReturnType.hasPrefix("{CGPoint") || fullReturnType.hasPrefix("{CGSize") || fullReturnType.hasPrefix("{CGRect") {
            typealias G = @convention(c) (UInt, UInt, UInt, UInt, UInt, UInt, UInt, UInt, Double, Double, Double, Double, Double, Double, Double, Double) -> CGRect
            let r = unsafeBitCast(send, to: G.self)(receiver, sel, ints[0], ints[1], ints[2], ints[3], ints[4], ints[5], doubles[0], doubles[1], doubles[2], doubles[3], doubles[4], doubles[5], doubles[6], doubles[7])
            // A smaller struct of doubles comes back in the first of the same registers.
            if fullReturnType.hasPrefix("{CGPoint") { result = jsFromNative(NSValue(cgPoint: r.origin)) }
            else if fullReturnType.hasPrefix("{CGSize") { result = jsFromNative(NSValue(cgSize: CGSize(width: r.origin.x, height: r.origin.y))) }
            else { result = jsFromNative(NSValue(cgRect: r)) }
            withExtendedLifetime(kept) {}
            return result
        }
        switch returnType {
        case "d", "f":
            typealias F = @convention(c) (UInt, UInt, UInt, UInt, UInt, UInt, UInt, UInt, Double, Double, Double, Double, Double, Double, Double, Double) -> Double
            let r = unsafeBitCast(send, to: F.self)(receiver, sel, ints[0], ints[1], ints[2], ints[3], ints[4], ints[5], doubles[0], doubles[1], doubles[2], doubles[3], doubles[4], doubles[5], doubles[6], doubles[7])
            result = returnType == "f" ? Double(Float(bitPattern: UInt32(truncatingIfNeeded: r.bitPattern))) : r
        default:
            typealias F = @convention(c) (UInt, UInt, UInt, UInt, UInt, UInt, UInt, UInt, Double, Double, Double, Double, Double, Double, Double, Double) -> UInt
            let r = unsafeBitCast(send, to: F.self)(receiver, sel, ints[0], ints[1], ints[2], ints[3], ints[4], ints[5], doubles[0], doubles[1], doubles[2], doubles[3], doubles[4], doubles[5], doubles[6], doubles[7])
            switch returnType {
            case "@": result = r == 0 ? nil : jsFromNative(Unmanaged<AnyObject>.fromOpaque(UnsafeRawPointer(bitPattern: r)!).takeUnretainedValue())
            case "B", "c", "C": result = (r & 0xff) != 0
            case "q", "i", "l", "s": result = Double(Int(bitPattern: r))
            case "Q", "I", "L", "S": result = Double(r)
            default: result = nil
            }
        }
        withExtendedLifetime(kept) {}
        return result
    }
    #else
    return nil
    #endif
}

nonisolated(unsafe) private var jsSelectors: [ObjectIdentifier: [String: ObjectiveC.Selector]] = [:]

/// The selector of the class or one it extends that script names `key`.
private func jsSelector(_ cls: AnyClass, _ key: String) -> ObjectiveC.Selector? {
    // Each class's own methods are listed once, and shared by every class extending it.
    var c: AnyClass? = cls
    while let current = c {
        let id = ObjectIdentifier(current)
        if jsSelectors[id] == nil {
            var names: [String: ObjectiveC.Selector] = [:]
            var count: UInt32 = 0
            if let list = class_copyMethodList(current, &count) {
                var bytes: [UInt8] = []
                for i in 0..<Int(count) {
                    let selector = method_getName(list[i])
                    // The selector's parts joined, each after the first capitalized: the bytes of its C name, without
                    // the strings a split and join of thousands of UIKit selectors would make.
                    bytes.removeAll(keepingCapacity: true)
                    var p = sel_getName(selector)
                    var partStart = false
                    while p.pointee != 0 {
                        let c = UInt8(bitPattern: p.pointee)
                        if c == UInt8(ascii: ":") { partStart = !bytes.isEmpty }
                        else if partStart { bytes.append(c >= 0x61 && c <= 0x7A ? c - 0x20 : c); partStart = false }
                        else { bytes.append(c) }
                        p += 1
                    }
                    if bytes.isEmpty { continue }
                    let name = String(decoding: bytes, as: UTF8.self)
                    if names[name] == nil { names[name] = selector }
                }
                free(list)
            }
            jsSelectors[id] = names
        }
        if let selector = jsSelectors[id]?[key] { return selector }
        c = class_getSuperclass(current)
    }
    return nil
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
/// The accessor an Objective-C property declares under a custom name (`G` getter or `S` setter attribute), if any.
private func jsCustomAccessor(_ cls: AnyClass, _ key: String, _ attribute: Character) -> String? {
    jsObjCPropertyAttributes(cls, key)?.split(separator: ",").first(where: { $0.first == attribute }).map { String($0.dropFirst()) }
}

/// The attributes of the Objective-C property a class or the nearest class it extends declares under a name,
/// looked up once per class and name: `class_getProperty` scans each class's property list by name.
func jsObjCPropertyAttributes(_ cls: AnyClass, _ name: String) -> String? {
    let id = JSClassKey(cls: ObjectIdentifier(cls), key: name)
    jsPropertyAttributesLock.lock()
    let known = jsPropertyAttributes[id]
    jsPropertyAttributesLock.unlock()
    if let known { return known }
    var found: String?
    var c: AnyClass? = cls
    while let current = c {
        if let property = class_getProperty(current, name), let attributes = property_getAttributes(property) {
            found = String(cString: attributes)
            break
        }
        c = class_getSuperclass(current)
    }
    jsPropertyAttributesLock.lock()
    jsPropertyAttributes[id] = .some(found)
    jsPropertyAttributesLock.unlock()
    return found
}

nonisolated(unsafe) private var jsPropertyAttributes: [JSClassKey: String?] = [:]
private let jsPropertyAttributesLock = NSLock()

/// The object whose class implements `selector`, following `forwardingTarget(for:)` as a
/// message send does (`UITextView`'s text input traits): what key-value coding can reach.
private func jsImplementer(_ object: NSObject, _ selector: ObjectiveC.Selector, depth: Int = 0) -> NSObject? {
    if class_getInstanceMethod(type(of: object), selector) != nil { return object }
    guard depth < 4, let target = object.forwardingTarget(for: selector) as? NSObject, target !== object else { return nil }
    return jsImplementer(target, selector, depth: depth + 1)
}

/// Where a property's getter is implemented, or nil. A getter the property's attributes do not name
/// (`active`, read by `isActive`) is found by key-value coding's names for it, as `value(forKey:)` finds it.
func jsGetterReceiver(_ object: NSObject, _ key: String) -> NSObject? {
    if let custom = jsCustomAccessor(type(of: object), key, "G") { return jsImplementer(object, NSSelectorFromString(custom)) }
    let capitalized = key.prefix(1).uppercased() + key.dropFirst()
    for name in ["get" + capitalized, key, "is" + capitalized] {
        if let receiver = jsImplementer(object, NSSelectorFromString(name)) { return receiver }
    }
    return nil
}

/// Where a property's setter is implemented, or nil.
func jsSetterReceiver(_ object: NSObject, _ key: String) -> NSObject? {
    let setter = jsCustomAccessor(type(of: object), key, "S") ?? "set" + key.prefix(1).uppercased() + key.dropFirst() + ":"
    return jsImplementer(object, NSSelectorFromString(setter))
}

/// The getter of a property whose type is a Core Foundation object (`@property CGColorRef CGColor`, encoded `T^{CGColor=}`).
func jsCFObjectGetter(_ cls: AnyClass, _ name: String) -> ObjectiveC.Selector? {
    guard let attributes = jsObjCPropertyAttributes(cls, name)?.split(separator: ","), attributes.first?.hasPrefix("T^{") == true else { return nil }
    let custom = attributes.first { $0.hasPrefix("G") }.map { String($0.dropFirst()) }
    return NSSelectorFromString(custom ?? name)
}

func jsHasObjCProperty(_ cls: AnyClass, _ name: String) -> Bool {
    jsObjCPropertyAttributes(cls, name) != nil
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
    guard let object = jsFlat(object).flatMap(jsAsNSObject), let first = key.first else { return }
    guard object.responds(to: NSSelectorFromString("set\(first.uppercased())\(key.dropFirst()):")) else { return }
    object.setValue(value, forKey: key)
}

/// The iOS runtime's `__collect()`: nothing to collect where reference counting frees objects.
public func __collect() {}

/// The iOS runtime's `__releaseNativeCounterpart(object)`: no script wrapper holds the object here.
public func __releaseNativeCounterpart(_ object: NSObject?) {}

/// A native-property decorator's getter: the native object's getter method if it has one, else the fallback.
public func jsNativePropertyGet(_ native: Any?, _ getter: String, fallback: Any?) -> Any? {
    guard let object = jsFlat(native).flatMap(jsAsNSObject), object.responds(to: NSSelectorFromString(getter)) else { return fallback }
    return jsFromNative(object.perform(NSSelectorFromString(getter))?.takeUnretainedValue())
}

/// A native-property decorator's setter: the native setter `setFoo:` called with the value, by key.
public func jsNativePropertySet(_ native: Any?, _ setter: String, _ value: Any?) {
    guard let object = jsFlat(native).flatMap(jsAsNSObject), setter.hasPrefix("set"), object.responds(to: NSSelectorFromString(setter + ":")) else { return }
    let key = setter.dropFirst(3).prefix(1).lowercased() + setter.dropFirst(4)
    object.setValue(jsToNative(value), forKey: key)
}

/// `a || b` on untyped values.
public func jsOr(_ a: Any?, _ b: Any?) -> Any? { jsTruthy(a) ? a : b }

func jsNativeSet(_ object: NSObject, _ key: String, _ value: Any?) {
    if JSNativeDispatch.set?(object, key, value) == true { return }
    // A block property the headers declare is set by the dispatch, of its block type; key-value coding
    // cannot make a block of a script function, and a property the headers do not declare is script's own.
    let function = jsFlat(value).map(jsIsFunction) ?? false
    // Key-value coding raises where the setter is only forwarded; script's message send reaches it.
    guard !function, let receiver = jsSetterReceiver(object, key) else {
        jsExpandos(object, create: true)?[key] = value
        return
    }
    receiver.setValue(jsToNative(value), forKey: key)
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

#if canImport(UIKit)
/// A geometry struct from what script holds for one: the struct itself, an NSValue, or the object `jsFromNative` makes of it.
public func jsNativeStruct<T>(_ value: Any?, _: T.Type) -> T? {
    guard let v = jsFlat(value) else { return nil }
    if let s = v as? T { return s }
    if let nsValue = v as? NSValue, !(v is NSNumber) {
        switch T.self {
        case is CGRect.Type: return nsValue.cgRectValue as? T
        case is CGSize.Type: return nsValue.cgSizeValue as? T
        case is CGPoint.Type: return nsValue.cgPointValue as? T
        case is UIEdgeInsets.Type: return nsValue.uiEdgeInsetsValue as? T
        default: return nil
        }
    }
    let n = { (o: Any?, k: String) -> CGFloat in CGFloat(jsToNumber((try? jsGet(o, k)) ?? nil)) }
    switch T.self {
    case is CGPoint.Type: return CGPoint(x: n(v, "x"), y: n(v, "y")) as? T
    case is CGSize.Type: return CGSize(width: n(v, "width"), height: n(v, "height")) as? T
    case is CGRect.Type:
        let origin = (try? jsGet(v, "origin")) ?? nil, size = (try? jsGet(v, "size")) ?? nil
        return CGRect(x: n(origin, "x"), y: n(origin, "y"), width: n(size, "width"), height: n(size, "height")) as? T
    case is UIEdgeInsets.Type: return UIEdgeInsets(top: n(v, "top"), left: n(v, "left"), bottom: n(v, "bottom"), right: n(v, "right")) as? T
    default: return nil
    }
}
#endif

/// A script Date as Foundation's, the same instant: what the runtime passes for one.
public func jsNativeDate(_ date: JSDate) -> Date { Date(timeIntervalSince1970: date.time / 1000) }

extension JSDate {
    public convenience init(_ date: Date) { self.init(date.timeIntervalSince1970 * 1000) }
}

public func jsToNative(_ value: Any?) -> Any? {
    let value = jsFlat(value)
    if let object = value, jsIsOpaqueObject(object), let native = jsAsNSObject(object), jsIsNativeOnly(native) { return native }
    switch value {
    case nil, is JSNull: return nil
    case let d as Double: return NSNumber(value: d)
    case let b as Bool: return NSNumber(value: b)
    case let s as String: return s as NSString
    case let d as JSDate: return jsNativeDate(d) as NSDate
    case let a as JSArrayProtocol: return a.jsAnyElements.map { jsToNative($0) ?? NSNull() }
    // A plain object (an object literal, whatever shape the translator gave it; no class of the program's),
    // as the runtime marshals it for an `id`: a dictionary of its own enumerable members.
    case let plain as JSDynamic where plain.jsClassName == nil:
        let dictionary = NSMutableDictionary()
        for key in plain.jsKeys { if let value = jsToNative(plain[jsKey: key]) { dictionary[key] = value } }
        return dictionary
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
/// marshalled as the runtime does (numbers as NSNumber, arrays as NSArray, objects as dictionaries, at any depth).
public func jsToNativeDictionary(_ value: Any?) -> [AnyHashable: Any] {
    switch jsFlat(value) {
    case let dictionary as [AnyHashable: Any]: return dictionary
    case let dictionary as NSDictionary: return dictionary as? [AnyHashable: Any] ?? [:]
    case let object as JSDynamic:
        var out: [AnyHashable: Any] = [:]
        for key in object.jsKeys { if let native = jsToNativeMember(object[jsKey: key]) { out[key] = native } }
        return out
    default: return [:]
    }
}

private func jsToNativeMember(_ value: Any?) -> Any? {
    switch jsFlat(value) {
    case let array as JSArrayProtocol: return array.jsAnyElements.map { jsToNativeMember($0) ?? NSNull() }
    case let object as JSDynamic: return jsToNativeDictionary(object) as NSDictionary
    default: return jsToNative(value)
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

/// An untyped value where Swift takes a Foundation Date: a script Date's instant, a native
/// date as it is, or a time in milliseconds as script's Date takes it; nil for anything else.
public func jsNativeDate(any value: Any?) -> Date? {
    switch jsFlat(value) {
    case let date as JSDate: return jsNativeDate(date)
    case let date as Date: return date
    case let date as NSDate: return date as Date
    case let time as Double: return Date(timeIntervalSince1970: time / 1000)
    default: return nil
    }
}
