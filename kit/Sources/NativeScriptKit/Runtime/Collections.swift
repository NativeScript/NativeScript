import Foundation

/// Any `JSMap`, for code that inspects values dynamically.
public protocol JSMapProtocol: AnyObject {
    var jsSize: Int { get }
    var jsAnyEntries: [(Any?, Any?)] { get }
}

/// Any `JSSet`, for code that inspects values dynamically.
public protocol JSSetProtocol: AnyObject {
    var jsSize: Int { get }
    var jsAnyValues: [Any?] { get }
}

/// A `Map`/`Set` key under SameValueZero: strings by code units, numbers by value with NaN equal
/// to NaN and -0 equal to +0, objects by identity. Closures and Swift structs never match another key.
enum JSCollectionKey: Hashable {
    case undefined
    case null
    case bool(Bool)
    case number(UInt64)
    case string(JSPropertyKey)
    case object(ObjectIdentifier)
    case unique(Int)

    nonisolated(unsafe) private static var uniqueCounter = 0

    static func number(_ d: Double) -> JSCollectionKey {
        .number(d.isNaN ? Double.nan.bitPattern : (d == 0 ? 0 : d.bitPattern))
    }

    static func of<K>(_ key: K) -> JSCollectionKey {
        if K.self == String.self { return .string(JSPropertyKey(key as! String)) }
        if K.self == Double.self { return number(key as! Double) }
        switch jsFlat(key) {
        case nil: return .undefined
        case let s as String: return .string(JSPropertyKey(s))
        case let d as Double: return number(d)
        case let b as Bool: return .bool(b)
        case is JSNull: return .null
        case let big as JSBigInt: return .string(JSPropertyKey("\u{0}n" + big.toString()))
        case let v?:
            if let n = jsNumeric(v) { return number(n) }
            if jsIsObject(v) { return .object(ObjectIdentifier(v as AnyObject)) }
            uniqueCounter += 1
            return .unique(uniqueCounter)
        }
    }
}

/// `-0` stored as a key becomes `+0`, as `Map.prototype.set` and `Set.prototype.add` do.
func jsNormalizedKey<K>(_ key: K) -> K {
    if K.self == Double.self, (key as! Double) == 0 { return 0.0 as! K }
    if K.self == Any?.self, let d = jsFlat(key) as? Double, d == 0 { return Optional<Any>.some(0.0) as! K }
    return key
}

final class JSCollectionCursor {
    var position = 0
    var done = false
}

struct JSWeakCursor {
    weak var cursor: JSCollectionCursor?
}

/// Insertion-ordered slots with tombstones. Iteration follows JavaScript when the collection
/// changes underneath it: added entries are visited, deleted ones not yet reached are skipped,
/// and after `clear()` iteration resumes from the start of whatever is added next.
struct JSOrderedSlots<Key, Value> {
    struct Entry {
        let hashKey: JSCollectionKey
        let key: Key
        var value: Value
    }

    private(set) var slots: [Entry?] = []
    private var index: [JSCollectionKey: Int] = [:]
    private(set) var live = 0
    private var cursors: [JSWeakCursor] = []

    func find(_ key: JSCollectionKey) -> Int? { index[key] }

    func entry(at position: Int) -> Entry { slots[position]! }

    mutating func update(at position: Int, _ value: Value) { slots[position]!.value = value }

    mutating func append(_ hashKey: JSCollectionKey, _ key: Key, _ value: Value) {
        compactIfNeeded()
        index[hashKey] = slots.count
        slots.append(Entry(hashKey: hashKey, key: key, value: value))
        live += 1
    }

    mutating func remove(_ hashKey: JSCollectionKey) -> Bool {
        guard let position = index.removeValue(forKey: hashKey) else { return false }
        slots[position] = nil
        live -= 1
        return true
    }

    mutating func removeAll() {
        slots.removeAll()
        index.removeAll()
        live = 0
        for weak in cursors { weak.cursor?.position = 0 }
    }

    mutating func makeCursor() -> JSCollectionCursor {
        let cursor = JSCollectionCursor()
        if cursors.count >= 8 { cursors.removeAll { $0.cursor == nil } }
        cursors.append(JSWeakCursor(cursor: cursor))
        return cursor
    }

    func next(_ cursor: JSCollectionCursor) -> Entry? {
        guard !cursor.done else { return nil }
        while cursor.position < slots.count {
            let slot = slots[cursor.position]
            cursor.position += 1
            if let slot { return slot }
        }
        cursor.done = true
        return nil
    }

    private mutating func compactIfNeeded() {
        guard slots.count >= 16, slots.count - live > live else { return }
        var remap = [Int](repeating: 0, count: slots.count + 1)
        var compacted: [Entry?] = []
        compacted.reserveCapacity(live * 2)
        for (position, slot) in slots.enumerated() {
            remap[position] = compacted.count
            if let slot { compacted.append(slot) }
        }
        remap[slots.count] = compacted.count
        cursors.removeAll { $0.cursor == nil }
        for weak in cursors {
            if let cursor = weak.cursor { cursor.position = remap[min(cursor.position, slots.count)] }
        }
        slots = compacted
        index.removeAll(keepingCapacity: true)
        for (position, slot) in slots.enumerated() { index[slot!.hashKey] = position }
    }

    var entries: [Entry] { slots.compactMap { $0 } }
}

/// A JavaScript `Map`: insertion-ordered, reference semantics, SameValueZero keys.
public final class JSMap<Key, Value>: Sequence, JSMapProtocol, JSReactiveConvertible, CustomStringConvertible {
    private var table = JSOrderedSlots<Key, Value>()
    public var jsTracker: JSTracker?

    public init() {}

    /// `new Map(entries)` from `(key, value)` pairs.
    public convenience init<S: Sequence>(_ entries: S) where S.Element == (Key, Value) {
        self.init()
        for (key, value) in entries { set(key, value) }
    }

    @inline(__always) private func read(_ value: Value) -> Value {
        jsTracker != nil ? jsReactive(value) : value
    }

    public func get(_ key: Key) -> Value? {
        jsTracker?.track()
        guard let position = table.find(JSCollectionKey.of(key)) else { return nil }
        return read(table.entry(at: position).value)
    }

    @discardableResult
    public func set(_ key: Key, _ value: Value) -> JSMap<Key, Value> {
        let hashKey = JSCollectionKey.of(key)
        if let position = table.find(hashKey) {
            table.update(at: position, value)
        } else {
            table.append(hashKey, jsNormalizedKey(key), value)
        }
        jsTracker?.trigger()
        return self
    }

    public func has(_ key: Key) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(key)) != nil
    }

    @discardableResult
    public func delete(_ key: Key) -> Bool {
        guard table.remove(JSCollectionKey.of(key)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public func clear() {
        guard table.live > 0 || !table.slots.isEmpty else { return }
        table.removeAll()
        jsTracker?.trigger()
    }

    public var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    public func forEach(_ body: (Value, Key) throws -> Void) rethrows {
        jsTracker?.track()
        let cursor = table.makeCursor()
        while let entry = table.next(cursor) { try body(read(entry.value), entry.key) }
    }

    public func forEach(_ body: (Value, Key, JSMap<Key, Value>) throws -> Void) rethrows {
        try forEach { value, key in try body(value, key, self) }
    }

    public func keys() -> JSIterator<Key> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            return self.table.next(cursor)?.key
        }
    }

    public func values() -> JSIterator<Value> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return self.read(entry.value)
        }
    }

    public func entries() -> JSIterator<(Key, Value)> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return (entry.key, self.read(entry.value))
        }
    }

    public func makeIterator() -> JSIterator<(Key, Value)> { entries() }

    public var jsSize: Int { Int(size) }

    public var jsAnyEntries: [(Any?, Any?)] {
        jsTracker?.track()
        return table.entries.map { (jsFlat($0.key), jsFlat(read($0.value))) }
    }

    public func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }

    public var description: String { jsInspect(self) }
}

extension JSMap where Key == Any?, Value == Any? {
    /// `new Map(array)` for a dynamic array of `[key, value]` arrays (`new Map(JSON.parse(text))`).
    public convenience init(pairs: Any?) throws {
        self.init()
        guard let list = jsFlat(pairs) as? JSArrayProtocol else {
            throw JSException(JSTypeError("\(jsInspect(pairs)) is not iterable"))
        }
        for item in list.jsAnyElements {
            guard let pair = item as? JSArrayProtocol else {
                throw JSException(JSTypeError("Iterator value \(jsToString(item)) is not an entry object"))
            }
            set(pair.jsElement(at: 0), pair.jsElement(at: 1))
        }
    }
}

/// A JavaScript `Set`: insertion-ordered, reference semantics, SameValueZero values.
public final class JSSet<Element>: Sequence, JSSetProtocol, JSReactiveConvertible, CustomStringConvertible {
    private var table = JSOrderedSlots<Element, Void>()
    public var jsTracker: JSTracker?

    public init() {}

    /// `new Set(iterable)`.
    public convenience init<S: Sequence>(_ values: S) where S.Element == Element {
        self.init()
        for value in values { add(value) }
    }

    @inline(__always) private func read(_ value: Element) -> Element {
        jsTracker != nil ? jsReactive(value) : value
    }

    @discardableResult
    public func add(_ value: Element) -> JSSet<Element> {
        let hashKey = JSCollectionKey.of(value)
        if table.find(hashKey) == nil {
            table.append(hashKey, jsNormalizedKey(value), ())
            jsTracker?.trigger()
        }
        return self
    }

    public func has(_ value: Element) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(value)) != nil
    }

    @discardableResult
    public func delete(_ value: Element) -> Bool {
        guard table.remove(JSCollectionKey.of(value)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public func clear() {
        guard table.live > 0 || !table.slots.isEmpty else { return }
        table.removeAll()
        jsTracker?.trigger()
    }

    public var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    public func forEach(_ body: (Element) throws -> Void) rethrows {
        jsTracker?.track()
        let cursor = table.makeCursor()
        while let entry = table.next(cursor) { try body(read(entry.key)) }
    }

    public func forEach(_ body: (Element, Element) throws -> Void) rethrows {
        try forEach { value in try body(value, value) }
    }

    public func values() -> JSIterator<Element> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return self.read(entry.key)
        }
    }

    public func keys() -> JSIterator<Element> { values() }

    public func entries() -> JSIterator<(Element, Element)> {
        let iterator = values()
        return JSIterator {
            guard let value = iterator.next() else { return nil }
            return (value, value)
        }
    }

    public func makeIterator() -> JSIterator<Element> { values() }

    public var jsSize: Int { Int(size) }

    public var jsAnyValues: [Any?] {
        jsTracker?.track()
        return table.entries.map { jsFlat(read($0.key)) }
    }

    public func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }

    public var description: String { jsInspect(self) }
}
