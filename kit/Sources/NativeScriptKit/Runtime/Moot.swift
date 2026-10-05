import Foundation

/// What core reads from a module a compiled app has no use for (the XML builder, the
/// inspector, runtime module resolution): reading its members gives more of the same,
/// and calling or constructing one throws a TypeError naming it.
public final class JSMootValue: JSDynamic {
    let path: String

    init(_ path: String) { self.path = path }

    public subscript(jsKey key: String) -> Any? {
        get { JSMootValue("\(path).\(key)") }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { nil }

    func unavailable() -> JSException { JSException(JSTypeError("\(path) is not available in a compiled app")) }
}

public func jsMoot(_ name: String) -> Any? { JSMootValue(name) }

/// `new f(…)` on an untyped value.
public func jsConstruct(_ f: Any?, _ arguments: Any?...) throws -> Any? {
    try jsConstruct(f, spread: arguments)
}

/// `new f(...args)` on an untyped value.
public func jsConstruct(_ f: Any?, spread arguments: [Any?]) throws -> Any? {
    if let c = jsFlat(f) as? JSConstructor { return try c.make(arguments) }
    if let moot = jsFlat(f) as? JSMootValue { throw moot.unavailable() }
    throw JSException(JSTypeError("\(jsInspect(f)) is not a constructor"))
}

/// A class held as a value that script constructs (`new bag.PropertyBag()`).
public final class JSConstructor {
    let make: ([Any?]) throws -> Any?
    public init(_ make: @escaping ([Any?]) throws -> Any?) { self.make = make }
}
