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
@usableFromInline
enum JSCollectionKey: Equatable {
    case undefined
    case null
    case bool(Bool)
    /// The number's bits, NaN as one pattern and -0 as +0.
    case number(UInt64)
    case string(String)
    case bigInt(String)
    case object(ObjectIdentifier)
    case unique(Int)

    nonisolated(unsafe) private static var uniqueCounter = 0

    @inlinable static func number(_ d: Double) -> JSCollectionKey {
        .number(d.isNaN ? Double.nan.bitPattern : (d == 0 ? 0 : d.bitPattern))
    }

    /// The key of a typed `String` or `Double` is made inline, without testing the value's type at run time.
    @inlinable static func of<K>(_ key: K) -> JSCollectionKey {
        if K.self == String.self { return .string(unsafeBitCast(key, to: String.self)) }
        if K.self == Double.self { return number(unsafeBitCast(key, to: Double.self)) }
        return of(any: key)
    }

    @usableFromInline static func of(any key: Any?) -> JSCollectionKey {
        let key = jsFlat(key)
        if let object = key, jsIsOpaqueObject(object) { return object is JSNull ? .null : .object(ObjectIdentifier(object as AnyObject)) }
        switch key {
        case nil: return .undefined
        case let s as String: return .string(s)
        case let d as Double: return number(d)
        case let b as Bool: return .bool(b)
        case is JSNull: return .null
        case let big as JSBigInt: return .bigInt(big.toString())
        case let v?:
            if let n = jsNumeric(v) { return number(n) }
            if jsIsObject(v) { return .object(ObjectIdentifier(v as AnyObject)) }
            uniqueCounter += 1
            return .unique(uniqueCounter)
        }
    }

    /// Folded to a word and mixed (the MurmurHash3 finalizer), for `JSOrderedSlots`' table: strings by their
    /// UTF-8 bytes (FNV-1a), as property keys are.
    @inlinable var hash: Int {
        switch self {
        case .undefined: return 0x5BD1_E995
        case .null: return 0x1B87_3593
        case .bool(let b): return b ? 0x27D4_EB2F : 0x1656_67B1
        case .number(let bits): return JSCollectionKey.mix(bits)
        case .string(let s): return JSCollectionKey.mix(JSCollectionKey.fold(s))
        case .bigInt(let s): return JSCollectionKey.mix(~JSCollectionKey.fold(s))
        case .object(let id): return JSCollectionKey.mix(UInt64(UInt(bitPattern: id)))
        case .unique(let n): return JSCollectionKey.mix(UInt64(bitPattern: Int64(n)) &+ 0x9E37_79B9)
        }
    }

    @inlinable static func mix(_ word: UInt64) -> Int {
        var x = word
        x ^= x >> 33
        x &*= 0xFF51_AFD7_ED55_8CCD
        x ^= x >> 33
        x &*= 0xC4CE_B9FE_1A85_EC53
        x ^= x >> 33
        return Int(truncatingIfNeeded: x)
    }

    @inlinable static func fold(_ s: String) -> UInt64 {
        var folded: UInt64 = 0xCBF2_9CE4_8422_2325
        let utf8 = s.utf8
        let done: Void? = utf8.withContiguousStorageIfAvailable { for byte in $0 { folded = (folded ^ UInt64(byte)) &* 0x100_0000_01B3 } }
        if done == nil { for byte in utf8 { folded = (folded ^ UInt64(byte)) &* 0x100_0000_01B3 } }
        return folded
    }

    /// Case by case, without the pair of keys a tuple pattern would copy.
    @inlinable static func == (a: JSCollectionKey, b: JSCollectionKey) -> Bool {
        switch a {
        case .number(let x): if case .number(let y) = b { return x == y }
        case .string(let x): if case .string(let y) = b { return jsStringEquals(x, y) }
        case .object(let x): if case .object(let y) = b { return x == y }
        case .undefined: if case .undefined = b { return true }
        case .null: if case .null = b { return true }
        case .bool(let x): if case .bool(let y) = b { return x == y }
        case .bigInt(let x): if case .bigInt(let y) = b { return jsStringEquals(x, y) }
        case .unique(let x): if case .unique(let y) = b { return x == y }
        }
        return false
    }
}

/// `-0` stored as a key becomes `+0`, as `Map.prototype.set` and `Set.prototype.add` do.
@inlinable func jsNormalizedKey<K>(_ key: K) -> K {
    if K.self == Double.self { return unsafeBitCast(key, to: Double.self) == 0 ? unsafeBitCast(0.0, to: K.self) : key }
    if K.self == String.self { return key }
    return jsNormalizedAnyKey(key)
}

@usableFromInline func jsNormalizedAnyKey<K>(_ key: K) -> K {
    if K.self == Any?.self, let d = jsFlat(key) as? Double, d == 0 { return Optional<Any>.some(0.0) as! K }
    return key
}

@usableFromInline
final class JSCollectionCursor {
    @usableFromInline var position = 0
    @usableFromInline var done = false
    @usableFromInline init() {}
}

@usableFromInline
struct JSWeakCursor {
    @usableFromInline weak var cursor: JSCollectionCursor?
    @usableFromInline init(cursor: JSCollectionCursor) { self.cursor = cursor }
}

/// Insertion-ordered slots with tombstones, found through an open-addressing table of their positions.
/// Iteration follows JavaScript when the collection changes underneath it: added entries are visited,
/// deleted ones not yet reached are skipped, and after `clear()` iteration resumes from the start of
/// whatever is added next.
///
/// Inlinable, with `JSMap` and `JSSet`: specialized in the app's module for its key and value types, a key
/// is made and hashed inline, which a Swift `Dictionary` of an enum key could not do. A class, so that the
/// collection reaches its arrays in place rather than through a copy of the struct holding them.
@usableFromInline
final class JSOrderedSlots<Key, Value> {
    @usableFromInline
    struct Entry {
        @usableFromInline let key: Key
        @usableFromInline var value: Value

        @inlinable init(key: Key, value: Value) {
            self.key = key
            self.value = value
        }
    }

    @usableFromInline var slots: [Entry?] = []
    /// Each slot's key and its hash, beside the slots: kept for the table's rebuilds, and so that a search passes
    /// over other keys by their hash and compares a key without reading its entry.
    @usableFromInline var keys: [JSCollectionKey] = []
    @usableFromInline var hashes: [Int] = []
    /// Positions in `slots` by hash, linearly probed: a power of two of them, at most three quarters used.
    @usableFromInline var table: [Int] = []
    @usableFromInline var live = 0
    @usableFromInline var cursors: [JSWeakCursor] = []

    @usableFromInline static var empty: Int { -1 }
    @usableFromInline static var removed: Int { -2 }

    @usableFromInline init() {}

    /// The table index holding `key`'s position, or nil.
    @inlinable func bucket(_ key: JSCollectionKey, _ hash: Int) -> Int? {
        guard !table.isEmpty else { return nil }
        let mask = table.count - 1
        var i = hash & mask
        while true {
            let position = table[i]
            if position == Self.empty { return nil }
            if position >= 0, hashes[position] == hash, keys[position] == key { return i }
            i = (i + 1) & mask
        }
    }

    @inlinable func find(_ key: JSCollectionKey) -> Int? { find(key, key.hash) }

    @inlinable func find(_ key: JSCollectionKey, _ hash: Int) -> Int? { bucket(key, hash).map { table[$0] } }

    @inlinable func entry(at position: Int) -> Entry { slots[position]! }

    @inlinable func update(at position: Int, _ value: Value) { slots[position]!.value = value }

    @inlinable func append(_ hashKey: JSCollectionKey, _ hash: Int, _ key: Key, _ value: Value) {
        compactIfNeeded()
        if (slots.count + 1) * 4 > table.count * 3 { rebuild(capacity: max(8, (live + 1) * 2)) }
        let mask = table.count - 1
        var i = hash & mask
        while table[i] >= 0 { i = (i + 1) & mask }
        table[i] = slots.count
        slots.append(Entry(key: key, value: value))
        keys.append(hashKey)
        hashes.append(hash)
        live += 1
    }

    @inlinable func remove(_ key: JSCollectionKey) -> Bool {
        guard let i = bucket(key, key.hash) else { return false }
        slots[table[i]] = nil
        table[i] = Self.removed
        live -= 1
        return true
    }

    @usableFromInline func removeAll() {
        slots.removeAll()
        keys.removeAll()
        hashes.removeAll()
        table.removeAll()
        live = 0
        for weak in cursors { weak.cursor?.position = 0 }
    }

    @usableFromInline func makeCursor() -> JSCollectionCursor {
        let cursor = JSCollectionCursor()
        if cursors.count >= 8 { cursors.removeAll { $0.cursor == nil } }
        cursors.append(JSWeakCursor(cursor: cursor))
        return cursor
    }

    @inlinable func next(_ cursor: JSCollectionCursor) -> Entry? {
        guard !cursor.done else { return nil }
        while cursor.position < slots.count {
            let slot = slots[cursor.position]
            cursor.position += 1
            if let slot { return slot }
        }
        cursor.done = true
        return nil
    }

    /// The table made anew for `capacity` entries, from the slots in place.
    @inlinable func rebuild(capacity: Int) {
        var size = 8
        while size * 3 < capacity * 4 { size *= 2 }
        table = Array(repeating: Self.empty, count: size)
        let mask = size - 1
        for position in slots.indices where slots[position] != nil {
            var i = hashes[position] & mask
            while table[i] >= 0 { i = (i + 1) & mask }
            table[i] = position
        }
    }

    /// Once most slots are tombstones, the live ones move down, and open cursors with them.
    @inlinable func compactIfNeeded() {
        guard slots.count >= 16, slots.count - live > live else { return }
        compact()
    }

    @inlinable func compact() {
        var remap = [Int](repeating: 0, count: slots.count + 1)
        var compacted: [Entry?] = []
        var compactedKeys: [JSCollectionKey] = []
        var compactedHashes: [Int] = []
        compacted.reserveCapacity(live * 2)
        compactedKeys.reserveCapacity(live * 2)
        compactedHashes.reserveCapacity(live * 2)
        for (position, slot) in slots.enumerated() {
            remap[position] = compacted.count
            if let slot {
                compacted.append(slot)
                compactedKeys.append(keys[position])
                compactedHashes.append(hashes[position])
            }
        }
        remap[slots.count] = compacted.count
        cursors.removeAll { $0.cursor == nil }
        for weak in cursors {
            if let cursor = weak.cursor { cursor.position = remap[min(cursor.position, slots.count)] }
        }
        slots = compacted
        keys = compactedKeys
        hashes = compactedHashes
        rebuild(capacity: max(8, live * 2))
    }

    @usableFromInline var entries: [Entry] { slots.compactMap { $0 } }
}

/// A JavaScript `Map`: insertion-ordered, reference semantics, SameValueZero keys.
open class JSMap<Key, Value>: Sequence, JSMapProtocol, JSReactiveConvertible, CustomStringConvertible {
    @usableFromInline final let table = JSOrderedSlots<Key, Value>()
    public final var jsTracker: JSTracker?

    public init() {}

    /// `new Map(entries)` from `(key, value)` pairs.
    public convenience init<S: Sequence>(_ entries: S) where S.Element == (Key, Value) {
        self.init()
        for (key, value) in entries { set(key, value) }
    }

    @inlinable @inline(__always) final func read(_ value: Value) -> Value {
        jsTracker != nil ? jsReactive(value) : value
    }

    @inlinable public final func get(_ key: Key) -> Value? {
        jsTracker?.track()
        guard let position = table.find(JSCollectionKey.of(key)) else { return nil }
        return read(table.entry(at: position).value)
    }

    @inlinable @discardableResult
    public final func set(_ key: Key, _ value: Value) -> JSMap<Key, Value> {
        let hashKey = JSCollectionKey.of(key)
        let hash = hashKey.hash
        if let position = table.find(hashKey, hash) {
            table.update(at: position, value)
        } else {
            table.append(hashKey, hash, jsNormalizedKey(key), value)
        }
        jsTracker?.trigger()
        return self
    }

    @inlinable public final func has(_ key: Key) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(key)) != nil
    }

    @inlinable @discardableResult
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

    @inlinable public final var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    @inlinable public final func forEach(_ body: (Value, Key) throws -> Void) rethrows {
        jsTracker?.track()
        let cursor = table.makeCursor()
        while let entry = table.next(cursor) { try body(read(entry.value), entry.key) }
    }

    @inlinable public final func forEach(_ body: (Value, Key, JSMap<Key, Value>) throws -> Void) rethrows {
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
    @usableFromInline final let table = JSOrderedSlots<Element, Void>()
    public final var jsTracker: JSTracker?

    public init() {}

    /// `new Set(iterable)`.
    public convenience init<S: Sequence>(_ values: S) where S.Element == Element {
        self.init()
        for value in values { add(value) }
    }

    @inlinable @inline(__always) final func read(_ value: Element) -> Element {
        jsTracker != nil ? jsReactive(value) : value
    }

    @inlinable @discardableResult
    public final func add(_ value: Element) -> JSSet<Element> {
        let hashKey = JSCollectionKey.of(value)
        let hash = hashKey.hash
        if table.find(hashKey, hash) == nil {
            table.append(hashKey, hash, jsNormalizedKey(value), ())
            jsTracker?.trigger()
        }
        return self
    }

    @inlinable public final func has(_ value: Element) -> Bool {
        jsTracker?.track()
        return table.find(JSCollectionKey.of(value)) != nil
    }

    @inlinable @discardableResult
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

    @inlinable public final var size: Double {
        jsTracker?.track()
        return Double(table.live)
    }

    @inlinable public final func forEach(_ body: (Element) throws -> Void) rethrows {
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
