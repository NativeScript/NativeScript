import Foundation

/// Any `JSMap`, for code that inspects values dynamically.
public protocol JSMapProtocol: AnyObject {
    var jsSize: Int { get }
    var jsAnyEntries: [(Any?, Any?)] { get }
    func jsAnyGet(_ key: Any?) -> Any?
    func jsAnyHas(_ key: Any?) -> Bool
    /// Throws a TypeError for a key or value the map's Swift types cannot hold.
    func jsAnySet(_ key: Any?, _ value: Any?) throws
    func jsAnyDelete(_ key: Any?) -> Bool
    func clear()
}

/// Any `JSSet`, for code that inspects values dynamically.
public protocol JSSetProtocol: AnyObject {
    var jsSize: Int { get }
    var jsAnyValues: [Any?] { get }
    func jsAnyHas(_ value: Any?) -> Bool
    /// Throws a TypeError for a value the set's Swift type cannot hold.
    func jsAnyAdd(_ value: Any?) throws
    func jsAnyDelete(_ value: Any?) -> Bool
    func clear()
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
open class JSMap<Key, Value>: Sequence, JSMapProtocol, JSReactiveConvertible, CustomStringConvertible {
    private var table = JSOrderedSlots<Key, Value>()
    public final var jsTracker: JSTracker?

    public init() {}

    /// `new Map(entries)` from `(key, value)` pairs.
    public convenience init<S: Sequence>(_ entries: S) where S.Element == (Key, Value) {
        self.init()
        for (key, value) in entries { set(key, value) }
    }

    @inline(__always) private func read(_ value: Value) -> Value {
        jsTracker != nil ? jsReactive(value) : value
    }

    public final func get(_ key: Key) -> Value? {
        jsTracker?.track()
        guard let position = table.find(JSCollectionKey.of(key)) else { return nil }
        return read(table.entry(at: position).value)
    }

    @discardableResult
    public final func set(_ key: Key, _ value: Value) -> JSMap<Key, Value> {
        let hashKey = JSCollectionKey.of(key)
        if let position = table.find(hashKey) {
            table.update(at: position, value)
        } else {
            table.append(hashKey, jsNormalizedKey(key), value)
        }
        jsTracker?.trigger()
        return self
    }

    public final func has(_ key: Key) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(key)) != nil
    }

    @discardableResult
    public final func delete(_ key: Key) -> Bool {
        guard table.remove(JSCollectionKey.of(key)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public final func clear() {
        guard table.live > 0 || !table.slots.isEmpty else { return }
        table.removeAll()
        jsTracker?.trigger()
    }

    public final var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    public final func forEach(_ body: (Value, Key) throws -> Void) rethrows {
        jsTracker?.track()
        let cursor = table.makeCursor()
        while let entry = table.next(cursor) { try body(read(entry.value), entry.key) }
    }

    public final func forEach(_ body: (Value, Key, JSMap<Key, Value>) throws -> Void) rethrows {
        try forEach { value, key in try body(value, key, self) }
    }

    public final func keys() -> JSIterator<Key> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            return self.table.next(cursor)?.key
        }
    }

    public final func values() -> JSIterator<Value> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return self.read(entry.value)
        }
    }

    public final func entries() -> JSIterator<(Key, Value)> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return (entry.key, self.read(entry.value))
        }
    }

    public final func makeIterator() -> JSIterator<(Key, Value)> { entries() }

    public final var jsSize: Int { Int(size) }

    public final var jsAnyEntries: [(Any?, Any?)] {
        jsTracker?.track()
        return table.entries.map { (jsFlat($0.key), jsFlat(read($0.value))) }
    }

    public final func jsAnyGet(_ key: Any?) -> Any? {
        jsTracker?.track()
        guard let position = table.find(JSCollectionKey.of(key)) else { return nil }
        return jsFlat(read(table.entry(at: position).value))
    }

    public final func jsAnyHas(_ key: Any?) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(key)) != nil
    }

    public final func jsAnySet(_ key: Any?, _ value: Any?) throws {
        guard let k = jsCast(key, to: Key.self), let v = jsCast(value, to: Value.self) else {
            throw JSException(JSTypeError("A Map of \(Key.self) to \(Value.self) cannot hold \(jsInspect(key)) → \(jsInspect(value))"))
        }
        set(k, v)
    }

    public final func jsAnyDelete(_ key: Any?) -> Bool {
        guard table.remove(JSCollectionKey.of(key)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public final func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }

    public final var description: String { jsInspect(self) }
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
open class JSSet<Element>: Sequence, JSSetProtocol, JSReactiveConvertible, CustomStringConvertible {
    private var table = JSOrderedSlots<Element, Void>()
    public final var jsTracker: JSTracker?

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
    public final func add(_ value: Element) -> JSSet<Element> {
        let hashKey = JSCollectionKey.of(value)
        if table.find(hashKey) == nil {
            table.append(hashKey, jsNormalizedKey(value), ())
            jsTracker?.trigger()
        }
        return self
    }

    public final func has(_ value: Element) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(value)) != nil
    }

    @discardableResult
    public final func delete(_ value: Element) -> Bool {
        guard table.remove(JSCollectionKey.of(value)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public final func clear() {
        guard table.live > 0 || !table.slots.isEmpty else { return }
        table.removeAll()
        jsTracker?.trigger()
    }

    public final var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    public final func forEach(_ body: (Element) throws -> Void) rethrows {
        jsTracker?.track()
        let cursor = table.makeCursor()
        while let entry = table.next(cursor) { try body(read(entry.key)) }
    }

    public final func forEach(_ body: (Element, Element) throws -> Void) rethrows {
        try forEach { value in try body(value, value) }
    }

    public final func values() -> JSIterator<Element> {
        jsTracker?.track()
        let cursor = table.makeCursor()
        return JSIterator { [self] in
            self.jsTracker?.track()
            guard let entry = self.table.next(cursor) else { return nil }
            return self.read(entry.key)
        }
    }

    public final func keys() -> JSIterator<Element> { values() }

    public final func entries() -> JSIterator<(Element, Element)> {
        let iterator = values()
        return JSIterator {
            guard let value = iterator.next() else { return nil }
            return (value, value)
        }
    }

    public final func makeIterator() -> JSIterator<Element> { values() }

    public final var jsSize: Int { Int(size) }

    public final var jsAnyValues: [Any?] {
        jsTracker?.track()
        return table.entries.map { jsFlat(read($0.key)) }
    }

    public final func jsAnyHas(_ value: Any?) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(value)) != nil
    }

    public final func jsAnyAdd(_ value: Any?) throws {
        guard let v = jsCast(value, to: Element.self) else {
            throw JSException(JSTypeError("A Set of \(Element.self) cannot hold \(jsInspect(value))"))
        }
        add(v)
    }

    public final func jsAnyDelete(_ value: Any?) -> Bool {
        guard table.remove(JSCollectionKey.of(value)) else { return false }
        jsTracker?.trigger()
        return true
    }

    public final func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }

    public final var description: String { jsInspect(self) }
}

/// A `Map`'s methods read by name from untyped code (`changeMap.forEach(fn)` where the map is `any`),
/// over its entries as JavaScript values; keys, values and entries as arrays.
func jsMapMethod(_ map: JSMapProtocol, _ key: String) -> JSMethod? {
    switch key {
    case "forEach":
        return { _, args in
            for (k, v) in map.jsAnyEntries { _ = try jsCall(jsArg(args, 0), v, k, map) }
            return nil
        }
    case "has": return { _, args in map.jsAnyHas(jsArg(args, 0)) }
    case "get": return { _, args in map.jsAnyGet(jsArg(args, 0)) }
    case "set": return { _, args in try map.jsAnySet(jsArg(args, 0), jsArg(args, 1)); return map }
    case "delete": return { _, args in map.jsAnyDelete(jsArg(args, 0)) }
    case "clear": return { _, _ in map.clear(); return nil }
    case "keys": return { _, _ in JSArray<Any?>(map.jsAnyEntries.map(\.0)) }
    case "values": return { _, _ in JSArray<Any?>(map.jsAnyEntries.map(\.1)) }
    case "entries": return { _, _ in JSArray<Any?>(map.jsAnyEntries.map { JSArray<Any?>([$0.0, $0.1]) as Any? }) }
    default: return nil
    }
}

/// A `Set`'s methods read by name from untyped code, as `jsMapMethod`'s.
func jsSetMethod(_ set: JSSetProtocol, _ key: String) -> JSMethod? {
    switch key {
    case "forEach":
        return { _, args in
            for v in set.jsAnyValues { _ = try jsCall(jsArg(args, 0), v, v, set) }
            return nil
        }
    case "has": return { _, args in set.jsAnyHas(jsArg(args, 0)) }
    case "add": return { _, args in try set.jsAnyAdd(jsArg(args, 0)); return set }
    case "delete": return { _, args in set.jsAnyDelete(jsArg(args, 0)) }
    case "clear": return { _, _ in set.clear(); return nil }
    case "keys", "values": return { _, _ in JSArray<Any?>(set.jsAnyValues) }
    case "entries": return { _, _ in JSArray<Any?>(set.jsAnyValues.map { JSArray<Any?>([$0, $0]) as Any? }) }
    default: return nil
    }
}
