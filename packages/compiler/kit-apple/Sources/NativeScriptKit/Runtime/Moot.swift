import Foundation

/// What core reads from a module a compiled app has no use for (the XML builder, the
/// inspector, runtime module resolution): reading its members gives more of the same,
/// and calling or constructing one throws a TypeError naming it.
public final class JSMootValue: JSDynamic {
    let path: String
    /// An app's own use of Android's globals (`android.os.Build`), which on iOS are not defined: reading a member
    /// throws the ReferenceError JavaScript does, and `typeof` is "undefined".
    let undeclared: Bool

    init(_ path: String, undeclared: Bool = false) {
        self.path = path
        self.undeclared = undeclared
    }

    public subscript(jsKey key: String) -> Any? {
        get { JSMootValue("\(path).\(key)") }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { nil }

    func unavailable() -> JSException {
        undeclared ? JSException(JSReferenceError("\(path) is not defined")) : JSException(JSTypeError("\(path) is not available in a compiled app"))
    }
}

public func jsMoot(_ name: String) -> Any? { JSMootValue(name) }

/// A global only Android declares, read by an app's own code on iOS.
public func jsUndeclared(_ name: String) -> Any? { JSMootValue(name, undeclared: true) }

/// `new f(…)` on an untyped value.
public func jsConstruct(_ f: Any?, _ arguments: Any?...) throws -> Any? {
    try jsConstruct(f, spread: arguments)
}

/// `new f(...args)` on an untyped value.
public func jsConstruct(_ f: Any?, spread arguments: [Any?]) throws -> Any? {
    if let c = jsFlat(f) as? JSConstructor { return try c.make(arguments) }
    if let c = jsFlat(f) as? JSConstructible { return try c.jsConstruct(arguments) }
    if let moot = jsFlat(f) as? JSMootValue { throw moot.unavailable() }
    throw JSException(JSTypeError("\(jsInspect(f)) is not a constructor"))
}

/// An object script constructs with `new` as a binding's engine object answers it (`new CanvasModule()`).
public protocol JSConstructible: AnyObject {
    func jsConstruct(_ arguments: [Any?]) throws -> Any?
}

/// A class held as a value that script constructs (`new bag.PropertyBag()`).
public final class JSConstructor {
    let make: ([Any?]) throws -> Any?
    public init(_ make: @escaping ([Any?]) throws -> Any?) { self.make = make }
}
