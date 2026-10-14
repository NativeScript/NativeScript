import Foundation

/// A JavaScript function value that keeps what script reads of a function: its `name` and `length`
/// (a test runner telling `test(done)` from `test()`), its own properties (`fn.cache = …`) and an
/// identity, called with a receiver (`fn.apply(thisArg, args)`).
public final class JSFunctionObject: JSDynamic, CustomStringConvertible {
    public let name: String
    public let length: Int
    let body: JSMethod
    private var own: JSObject?

    /// The closure key this object is registered under, when it boxes a typed closure (`jsBoxedFunction`).
    var identityKey: JSFunctionKey?
    /// The function this object is, to `===`, when not itself: a class's method, boxed from one receiver's method value.
    var identity: AnyObject?

    public init(_ name: String, _ length: Int, _ body: @escaping JSMethod) {
        self.name = name
        self.length = length
        self.body = body
    }

    deinit {
        if let identityKey { JSFunctionIdentity.forget(identityKey) }
    }

    @discardableResult
    public func call(_ this: Any?, _ arguments: [Any?]) throws -> Any? { try body(this, arguments) }

    private func ownProperties() -> JSObject {
        if let own { return own }
        let made = JSObject()
        own = made
        if let identityKey { JSFunctionIdentity.table[identityKey]?.kept = self }
        return made
    }

    /// `Object.defineProperty(fn, key, descriptor)`: an own property, an accessor's getter reading the function as `this`.
    func defineOwn(_ key: String, _ d: JSPropertyDescriptor) throws {
        if key == "name" || key == "length" { throw JSException(JSTypeError("Cannot redefine property: \(key)")) }
        try ownProperties().defineProperty(key, d)
    }

    public subscript(jsKey key: String) -> Any? {
        get {
            if let own, own.has(key) {
                do { return try own.get(key, receiver: self) } catch { jsReportUncaught(jsCaught(error)); return nil }
            }
            switch key {
            case "name": return name
            case "length": return Double(length)
            default: return nil
            }
        }
        set {
            // `name` and `length` are read-only: a write in sloppy code changes nothing.
            if key == "name" || key == "length" { return }
            let own = ownProperties()
            if let setter = own.setter(key) {
                do { try setter(self, newValue) } catch { jsReportUncaught(jsCaught(error)) }
                return
            }
            own[key] = newValue
        }
    }

    public var jsKeys: [String] { own?.keys ?? [] }
    func ownDescriptor(_ key: String) -> JSObject? { own?.descriptor(key) }
    public var jsClassName: String? { nil }
    public var description: String { name.isEmpty ? "[Function (anonymous)]" : "[Function: \(name)]" }
}

/// A function value that ignores its receiver: what a function declaration or arrow evaluates to.
@inline(__always)
public func jsFunction(_ name: String, _ length: Int, _ body: @escaping JSFunction) -> JSFunctionObject {
    JSFunctionObject(name, length) { _, arguments in try body(arguments) }
}

/// A function value that reads its receiver: a method held as a value.
@inline(__always)
public func jsMethodFunction(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
    JSFunctionObject(name, length, body)
}

/// `f(...arguments)` with a receiver: any function value the runtime holds.
@discardableResult
public func jsInvoke(_ function: Any?, _ this: Any?, _ arguments: [Any?]) throws -> Any? {
    switch jsFlat(function) {
    case let f as JSFunctionObject: return try f.call(this, arguments)
    case let f as JSFunction: return try f(arguments)
    case let m as JSMethod: return try m(this, arguments)
    case let moot as JSMootValue: throw moot.unavailable()
    default: throw JSException(JSTypeError("\(jsInspect(function)) is not a function"))
    }
}

/// The elements `f.apply(this, list)` passes: an array's, an array-like's, none for undefined or null.
public func jsArgumentList(_ list: Any?) throws -> [Any?] {
    switch jsFlat(list) {
    case nil, is JSNull: return []
    case let array as JSArrayProtocol: return array.jsAnyElements
    case let v?:
        guard jsIsObject(v) else { throw JSException(JSTypeError("CreateListFromArrayLike called on non-object")) }
        let length = jsToNumber(try jsGet(v, "length"))
        let n = length.isFinite ? max(0, jsClampedInt(length)) : 0
        return try (0..<n).map { try jsGet(v, String($0)) }
    }
}

// MARK: - Function identity
//
// A typed function value is a Swift closure, which has no identity of its own: every conversion
// (to `Any`, to a generic parameter, to another function type) wraps it in a new closure. Script
// compares function values (`off(handler)`, `removeEventListener`, `list.indexOf(fn)`), so each
// closure the translator makes from another records which function it stands for, here.

/// A closure's two words, code and context, read through a struct of one field of the closure's own
/// type (the translator emits one per function type). Read any other way (passed to a generic, to
/// `unsafeBitCast`), Swift first wraps the closure in a new thunk, whose words differ on each call.
public struct JSFunctionKey: Hashable {
    let code: UInt
    let context: UInt
}

@inline(__always)
public func jsFunctionKey<Cell>(_ cell: Cell) -> JSFunctionKey {
    withUnsafeBytes(of: cell) { b in
        let word = MemoryLayout<UInt>.size
        return JSFunctionKey(code: b.count >= word ? b.load(as: UInt.self) : 0, context: b.count >= 2 * word ? b.load(fromByteOffset: word, as: UInt.self) : 0)
    }
}

/// A closure made from another function value (an adapter of another type, a typed view of a
/// function object): it captures this alias, so the alias lives exactly as long as the closure and
/// its key cannot be reused by another closure meanwhile.
public final class JSFunctionAlias {
    enum Target {
        case key(JSFunctionKey)
        case object(AnyObject)
        case none
    }
    let target: Target
    var key: JSFunctionKey?

    /// A typed view of an untyped function value: the function object itself is the identity.
    public init(of source: Any?) {
        if let f = jsFlat(source) as? JSFunctionObject { target = .object(f.identity ?? f) } else { target = .none }
    }

    /// An adapter of a typed closure, which the adapter calls (and so keeps alive).
    public init<Cell>(cell: Cell) { target = .key(jsFunctionKey(cell)) }

    init(method: AnyObject) { target = .object(method) }

    deinit {
        if let key { JSFunctionIdentity.forget(key) }
    }
}

enum JSFunctionIdentity {
    /// What is known of a closure key: the function it stands for (an alias the closure captures) and
    /// the function object it is boxed as (which holds the closure). Either keeps the keyed closure
    /// alive, so a slot with a live holder never has a stale key.
    struct Slot {
        weak var alias: JSFunctionAlias?
        weak var box: JSFunctionObject?
        /// A box given its own properties: kept while the closure lives, which is as long as the box is, so boxing the function again finds them.
        var kept: JSFunctionObject?
    }
    enum Root {
        case key(JSFunctionKey)
        case object(AnyObject)

        static func == (a: Root, b: Root) -> Bool {
            switch (a, b) {
            case let (.key(x), .key(y)): return x == y
            case let (.object(x), .object(y)): return x === y
            default: return false
            }
        }
    }

    nonisolated(unsafe) static var table: [JSFunctionKey: Slot] = [:]

    static func forget(_ key: JSFunctionKey) {
        if let slot = table[key], slot.alias == nil, slot.box == nil { table[key] = nil }
    }

    /// The function a closure key stands for: an object (a function object, or a class's method), or
    /// the key itself for a closure made from nothing else.
    static func root(_ key: JSFunctionKey) -> Root {
        var k = key
        while let slot = table[k] {
            if let alias = slot.alias {
                switch alias.target {
                case .key(let next): k = next; continue
                case .object(let o): return .object(o)
                case .none: break
                }
            }
            if let box = slot.box { return .object(box.identity ?? box) }
            break
        }
        return .key(k)
    }
}

/// A typed closure given to script untyped: one function object per function, so that the same
/// closure boxed twice (or a closure made from a function object) is the same value to `===`.
public func jsBoxedFunction<Cell>(_ cell: Cell, _ make: () -> JSFunctionObject) -> JSFunctionObject {
    let key = jsFunctionKey(cell)
    if let box = JSFunctionIdentity.table[key]?.box { return box }
    let root = JSFunctionIdentity.root(key)
    if case .object(let o) = root, let box = o as? JSFunctionObject { return box }
    let box = make()
    // Kept under the key the closure stands for (an adapter's, the function it adapts), which the box keeps alive through it.
    let at: JSFunctionKey
    switch root {
    case .key(let k): at = k
    case .object(let o): at = key; box.identity = o
    }
    box.identityKey = at
    JSFunctionIdentity.table[at, default: .init()].box = box
    return box
}

/// Records that the closure in `cell` stands for the function `alias` names.
@inline(__always)
public func jsIdentified<Cell>(_ cell: Cell, _ alias: JSFunctionAlias) -> Cell {
    if case .none = alias.target { return cell }
    let key = jsFunctionKey(cell)
    alias.key = key
    JSFunctionIdentity.table[key] = .init(alias: alias)
    return cell
}

/// `f === g` on typed function values, each in its cell (nil for undefined).
public func jsSameFunction<A, B>(_ a: A?, _ b: B?) -> Bool {
    guard let a, let b else { return a == nil && b == nil }
    let x = jsFunctionKey(a), y = jsFunctionKey(b)
    return x == y || JSFunctionIdentity.root(x) == JSFunctionIdentity.root(y)
}

/// A method read as a value (`view.on('tap', this.onTap)`): one closure per receiver and method, which
/// is, to `===`, the one function of that class and method, as JavaScript's is the prototype's. The
/// closure calls the method on its receiver, held weakly (a JavaScript method value holds none), so
/// storing it on the receiver or in this cache keeps nothing alive. `make` captures the alias it is given.
public func jsMethodValue<Receiver: AnyObject, Cell>(_ receiver: Receiver, _ name: String, _ make: (Receiver, JSFunctionAlias) -> Cell) -> Cell {
    let key = JSMethodValues.Key(receiver: ObjectIdentifier(receiver), name: name, cell: ObjectIdentifier(Cell.self))
    if let entry = JSMethodValues.table[key], entry.receiver === receiver, let cell = entry.cell as? Cell { return cell }
    let alias = JSFunctionAlias(method: JSMethodValues.identity(type(of: receiver), name))
    let cell = jsIdentified(make(receiver, alias), alias)
    JSMethodValues.store(key, .init(receiver: receiver, cell: cell))
    return cell
}

/// What calling a method value does once its receiver is gone: what calling the method with an
/// undefined `this` does in JavaScript.
public func jsReleasedReceiver(_ name: String) -> JSException {
    JSException(JSTypeError("Cannot read properties of undefined (calling '\(name)')"))
}

enum JSMethodValues {
    struct Key: Hashable {
        let receiver: ObjectIdentifier
        let name: String
        let cell: ObjectIdentifier
    }
    struct Entry {
        weak var receiver: AnyObject?
        let cell: Any
    }
    nonisolated(unsafe) static var table: [Key: Entry] = [:]
    nonisolated(unsafe) private static var pruneAt = 64

    /// The function a class's method is, one object per class and name, kept for good as a prototype's methods are.
    final class Identity {}
    struct IdentityKey: Hashable {
        let type: ObjectIdentifier
        let name: String
    }
    nonisolated(unsafe) private static var identities: [IdentityKey: Identity] = [:]

    static func identity(_ type: AnyClass, _ name: String) -> Identity {
        let key = IdentityKey(type: ObjectIdentifier(type), name: name)
        if let found = identities[key] { return found }
        let made = Identity()
        identities[key] = made
        return made
    }

    static func store(_ key: Key, _ entry: Entry) {
        table[key] = entry
        guard table.count >= pruneAt else { return }
        table = table.filter { $0.value.receiver != nil }
        pruneAt = max(64, table.count * 2)
    }
}
