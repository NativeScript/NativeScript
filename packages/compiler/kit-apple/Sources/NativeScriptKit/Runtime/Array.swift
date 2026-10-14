import Foundation

/// Any `JSArray`, whatever its element type, for code that inspects values dynamically.
public protocol JSArrayProtocol: AnyObject {
    var jsLength: Int { get }
    /// The elements boxed as JavaScript values (nested optionals collapsed).
    var jsAnyElements: [Any?] { get }
    func jsElement(at index: Int) -> Any?
    /// `array[index] = value`; throws a TypeError when `value` is not an `Element`.
    func jsSetElement(_ value: Any?, at index: Int) throws
    func jsSetLength(_ length: Int) throws
    /// Replaces every element; throws a TypeError, changing nothing, when one is not an `Element`.
    func jsSetElements(_ values: [Any?]) throws
}

/// An empty slot of a `JSArray<Double>`: a signaling NaN, which arithmetic never produces (it gives a quiet NaN).
@inlinable public var jsHoleNumber: Double { Double(bitPattern: 0x7FF4_0000_0000_4E53) }
/// An empty slot of a `JSArray<String>`: noncharacters no text carries.
public let jsHoleString = String(String.UnicodeScalarView([Unicode.Scalar(0xFDD0)!, "\u{0}", Unicode.Scalar(0xFDD1)!]))

/// Whether `s` is `jsHoleString`; its UTF-8 length first, which a native string knows without comparing text.
@inlinable public func jsIsHoleString(_ s: String) -> Bool { s.utf8.count == 7 && s == jsHoleString }

/// A function type's rest parameter (`(...args) => void`): an array to Swift, marked so that a script
/// function called as that type takes the array's elements as its arguments.
public typealias JSRest<Element> = JSArray<Element>

/// A JavaScript array: reference semantics, JavaScript method names, `Double` indexes and lengths.
///
/// Limits: a subscript read past the end traps (JavaScript gives `undefined`, which a non-optional
/// `Element` cannot hold; `at(_:)` returns nil instead), and growing the array past its end with
/// `length` or an index needs an optional `Element`, a number or a string to hold the empty slots.
open class JSArray<Element>: JSArrayProtocol, JSReactiveConvertible, Sequence, ExpressibleByArrayLiteral, CustomStringConvertible {
    public final var storage: [Element]
    public final var jsTracker: JSTracker?
    /// Values written under keys that are no array index (`a[-1] = v`, `a[1.5] = v`).
    @usableFromInline final var jsNonIndexed: [Double: Element]?

    public init() { storage = [] }
    public init(_ elements: [Element]) { storage = elements }
    public required init(arrayLiteral elements: Element...) { storage = elements }

    @inlinable @inline(__always) final func track() { jsTracker?.track() }
    @inlinable @inline(__always) final func trigger() { jsTracker?.trigger() }

    @inlinable @inline(__always) final func read(_ index: Int) -> Element {
        if jsTracker != nil { return jsReactive(storage[index]) }
        return storage[index]
    }

    /// What an empty slot holds: undefined in an array of optionals; in an array of numbers or strings,
    /// a sentinel that reads undefined where the read may be (`element(_:)`, join, untyped reads).
    @usableFromInline static var hole: Element? {
        if Element.self == Double.self { return unsafeBitCast(jsHoleNumber, to: Element.self) }
        if Element.self == String.self { return unsafeBitCast(jsHoleString, to: Element.self) }
        return (Element.self as? JSOptionalProtocol.Type).map { $0.jsNone as! Element }
    }

    /// `JSArray<Double>` and `JSArray<String>` only: whether `e` is an empty slot's sentinel.
    @inlinable static func isHole(_ e: Element) -> Bool {
        if Element.self == Double.self { return unsafeBitCast(e, to: Double.self).bitPattern == jsHoleNumber.bitPattern }
        if Element.self == String.self { return jsIsHoleString(unsafeBitCast(e, to: String.self)) }
        return false
    }

    /// `new Array(n)`: n empty slots, where the element type has a way to hold them.
    public static func holes(_ n: Double) -> JSArray<Element> {
        let array = JSArray<Element>()
        array.length = n
        return array
    }

    @usableFromInline final func outOfRange(_ index: Int) -> Never {
        fatalError("JSArray<\(Element.self)> index \(index) out of range (length \(storage.count))")
    }

    // MARK: Elements

    @_optimize(speed) @inlinable public final var count: Int {
        track()
        return storage.count
    }

    @inlinable public final var isEmpty: Bool { count == 0 }

    /// The elements as a Swift array, read through the tracker.
    public final var elements: [Element] {
        track()
        if jsTracker != nil { return storage.map { jsReactive($0) } }
        return storage
    }

    /// `array.length`. Setting it shorter truncates.
    @_optimize(speed) @inlinable public final var length: Double {
        get {
            track()
            return Double(storage.count)
        }
        set {
            guard newValue >= 0, newValue <= 4_294_967_295, newValue == newValue.rounded(.towardZero) else {
                fatalError("RangeError: Invalid array length")
            }
            setLength(Int(newValue))
        }
    }

    @usableFromInline final func setLength(_ n: Int) {
        if n < storage.count {
            storage.removeLast(storage.count - n)
            trigger()
        } else if n > storage.count {
            guard let hole = JSArray.hole else {
                fatalError("JSArray<\(Element.self)>: length \(n) beyond \(storage.count) needs an optional Element for the empty slots")
            }
            storage.append(contentsOf: repeatElement(hole, count: n - storage.count))
            trigger()
        }
    }

    /// `a[i]` as JavaScript reads it: nil (undefined) unless `i` is an integer index in range of a slot that is not empty,
    /// or a key set outside the indexes (`a[-1] = v`).
    /// Inlinable: every typed element read goes through it, which the app's module then specializes.
    @_optimize(speed) @inlinable public final func element(_ i: Double) -> Element? {
        jsTracker?.track()
        guard let k = Int(exactly: i), k >= 0, k < storage.count else { return jsNonIndexed?[i + 0] }
        let e = jsTracker == nil ? storage[k] : jsReactive(storage[k])
        return JSArray.isHole(e) ? nil : e
    }

    // Inlinable, as the typed reads and writes below: the app's module specializes them for its element types.
    @_optimize(speed) @inlinable public final subscript(i: Int) -> Element {
        get {
            guard i >= 0 && i < storage.count else { outOfRange(i) }
            track()
            return read(i)
        }
        set {
            if i >= 0 && i < storage.count {
                storage[i] = newValue
            } else if i == storage.count {
                storage.append(newValue)
            } else if i > storage.count, let hole = JSArray.hole {
                storage.append(contentsOf: repeatElement(hole, count: i - storage.count))
                storage.append(newValue)
            } else {
                outOfRange(i)
            }
            trigger()
        }
    }

    @_optimize(speed) @inlinable public final subscript(i: Double) -> Element {
        get {
            guard let k = index(i) else {
                if let value = jsNonIndexed?[i + 0] ?? JSArray.hole { return value }
                fatalError("JSArray<\(Element.self)> has no element \(jsNumberToString(i))")
            }
            return self[k]
        }
        set {
            guard let k = index(i) else {
                if jsNonIndexed == nil { jsNonIndexed = [:] }
                jsNonIndexed![i + 0] = newValue
                return
            }
            self[k] = newValue
        }
    }

    @_optimize(speed) @inlinable final func index(_ d: Double) -> Int? {
        guard d >= 0, d < 4_294_967_295, d == d.rounded(.towardZero) else { return nil }
        return Int(d)
    }

    /// `array.at(i)`: negative indexes count from the end; out of range is nil.
    public final func at(_ i: Double) -> Element? {
        track()
        let relative = jsToIntegerOrInfinity(i)
        let k = relative >= 0 ? relative : Double(storage.count) + relative
        guard k >= 0 && k < Double(storage.count), !JSArray.isHole(storage[Int(k)]) else { return nil }
        return read(Int(k))
    }

    // MARK: Iteration

    /// An index-based iterator that re-reads the length each step, so elements pushed during
    /// `for…of` are visited, as JavaScript's array iterator does.
    public struct Iterator: IteratorProtocol {
        let array: JSArray<Element>
        var index = 0

        public mutating func next() -> Element? {
            array.track()
            guard index < array.storage.count else { return nil }
            defer { index += 1 }
            return array.read(index)
        }
    }

    public final func makeIterator() -> Iterator { Iterator(array: self) }

    /// Visits the indexes below the length at the start; indexes the callback removed are skipped.
    @_optimize(speed) @inlinable @inline(__always)
    final func each(_ body: (Element, Int) throws -> Bool) rethrows {
        track()
        let length = storage.count
        var k = 0
        while k < length {
            if k < storage.count, try !body(read(k), k) { return }
            k += 1
        }
    }

    @inline(__always)
    private func eachReversed(_ body: (Element, Int) throws -> Bool) rethrows {
        track()
        var k = storage.count - 1
        while k >= 0 {
            if k < storage.count, try !body(read(k), k) { return }
            k -= 1
        }
    }

    /// `array.keys()`.
    public final func keys() -> JSIterator<Double> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return Double(i)
        }
    }

    /// `array.values()`.
    public final func values() -> JSIterator<Element> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return self.read(i)
        }
    }

    /// `array.entries()`, each entry an `(index, value)` tuple.
    public final func entries() -> JSIterator<(Double, Element)> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return (Double(i), self.read(i))
        }
    }

    // MARK: Mutators

    @_optimize(speed) @inlinable @discardableResult
    public final func push(_ items: Element...) -> Double {
        storage.append(contentsOf: items)
        trigger()
        return Double(storage.count)
    }

    @_optimize(speed) @inlinable public final func pop() -> Element? {
        guard !storage.isEmpty else { return nil }
        let value = storage.removeLast()
        trigger()
        return jsTracker != nil ? jsReactive(value) : value
    }

    public final func shift() -> Element? {
        guard !storage.isEmpty else { return nil }
        let value = storage.removeFirst()
        trigger()
        return jsTracker != nil ? jsReactive(value) : value
    }

    @discardableResult
    public final func unshift(_ items: Element...) -> Double {
        storage.insert(contentsOf: items, at: 0)
        trigger()
        return Double(storage.count)
    }

    /// `array.splice(start, deleteCount, ...items)`. A nil `deleteCount` is an absent one (delete to
    /// the end); JavaScript's explicit `undefined` (delete nothing) must be passed as 0.
    @discardableResult
    public final func splice(_ start: Double, _ deleteCount: Double? = nil, _ items: Element...) -> JSArray<Element> {
        splice(start, deleteCount, contentsOf: items)
    }

    /// `array.splice(start, deleteCount, ...items)` with the items spread from one array.
    @discardableResult
    public final func splice(_ start: Double, _ deleteCount: Double?, contentsOf items: [Element]) -> JSArray<Element> {
        let length = storage.count
        let s = jsRelativeIndex(start, length)
        let count: Int
        if let deleteCount {
            count = Int(Swift.min(Swift.max(jsToIntegerOrInfinity(deleteCount), 0), Double(length - s)))
        } else {
            count = length - s
        }
        let removed = Array(storage[s..<s + count])
        storage.replaceSubrange(s..<s + count, with: items)
        if count > 0 || !items.isEmpty { trigger() }
        return JSArray(removed)
    }

    /// `array.reverse()`: in place, returns the array.
    @discardableResult
    public final func reverse() -> JSArray<Element> {
        storage.reverse()
        trigger()
        return self
    }

    /// `array.sort()`: in place and stable, by the string form of each element in UTF-16 code
    /// unit order, undefined elements last.
    @_optimize(speed) @discardableResult
    public final func sort() -> JSArray<Element> {
        var keyed: [(String, Element)] = []
        var undefined: [Element] = []
        for element in storage {
            if jsIsUndefined(element) { undefined.append(element) } else { keyed.append((jsSortKey(element), element)) }
        }
        jsMergeSort(&keyed) { jsStringLess($0.0, $1.0) }
        storage = keyed.map { $0.1 } + undefined
        trigger()
        return self
    }

    private func jsSortKey(_ element: Element) -> String {
        if let s = element as? String { return s }
        return jsToString(element)
    }

    /// `array.sort(compare)`: in place and stable; undefined elements go last without being compared,
    /// and a NaN comparison result counts as 0. The array is unchanged when `compare` throws.
    @_optimize(speed) @inlinable @discardableResult
    public final func sort(_ compare: (Element, Element) throws -> Double) rethrows -> JSArray<Element> {
        var defined: [Element]
        var undefined: [Element] = []
        if JSArray.canHoldUndefined {
            defined = []
            for element in storage {
                if JSArray.isUndefined(element) { undefined.append(element) } else { defined.append(element) }
            }
        } else {
            defined = storage
        }
        try jsMergeSort(&defined) { try compare($0, $1) < 0 }
        storage = undefined.isEmpty ? defined : defined + undefined
        trigger()
        return self
    }

    /// Whether an element can be undefined: an optional, or `Any`.
    @usableFromInline static var canHoldUndefined: Bool { Element.self is JSOptionalProtocol.Type || Element.self == Any.self }

    @usableFromInline static func isUndefined(_ element: Element) -> Bool { jsIsUndefined(element) }

    /// `array.fill(value, start, end)`: in place, returns the array.
    @discardableResult
    public final func fill(_ value: Element, _ start: Double = 0, _ end: Double? = nil) -> JSArray<Element> {
        let length = storage.count
        let s = jsRelativeIndex(start, length)
        let e = end.map { jsRelativeIndex($0, length) } ?? length
        if s < e {
            for i in s..<e { storage[i] = value }
            trigger()
        }
        return self
    }

    // MARK: Copies

    /// `array.slice(start, end)`.
    @_optimize(speed) @inlinable public final func slice(_ start: Double = 0, _ end: Double? = nil) -> JSArray<Element> {
        track()
        let length = storage.count
        let s = jsRelativeIndex(start, length)
        let e = end.map { jsRelativeIndex($0, length) } ?? length
        guard s < e else { return JSArray() }
        return JSArray(jsTracker == nil ? Array(storage[s..<e]) : (s..<e).map(read))
    }

    /// `array.concat(other, ...)` with array arguments, spread one level.
    public final func concat(_ first: JSArray<Element>, _ rest: JSArray<Element>...) -> JSArray<Element> {
        track()
        var out = storage
        for array in [first] + rest {
            array.track()
            out += array.storage
        }
        return JSArray(out)
    }

    /// `array.concat(item, ...)` with element arguments. In a `JSArray<Any?>` an argument that is
    /// itself an array is spread, as in JavaScript; mixing typed arrays and elements in one call
    /// takes two calls (`a.concat(b).concat(x)`).
    public final func concat(_ items: Element...) -> JSArray<Element> {
        concat(spread: items)
    }

    /// `array.concat(...items)`.
    public final func concat(spread items: [Element]) -> JSArray<Element> {
        track()
        var out = storage
        for item in items {
            if Element.self == Any?.self, let nested = jsFlat(item) as? JSArrayProtocol {
                out += nested.jsAnyElements.map { $0 as! Element }
            } else {
                out.append(item)
            }
        }
        return JSArray(out)
    }

    /// `array.toReversed()`.
    public final func toReversed() -> JSArray<Element> {
        track()
        return JSArray(storage.reversed())
    }

    /// `array.toSorted()`.
    public final func toSorted() -> JSArray<Element> { JSArray(elements).sort() }

    /// `array.toSorted(compare)`.
    public final func toSorted(_ compare: (Element, Element) throws -> Double) rethrows -> JSArray<Element> {
        try JSArray(elements).sort(compare)
    }

    // MARK: Search

    static func strictEquals(_ a: Element, _ b: Element) -> Bool {
        if Element.self == Double.self { return (a as! Double) == (b as! Double) }
        if Element.self == String.self { return jsStringEquals(a as! String, b as! String) }
        if Element.self == Bool.self { return (a as! Bool) == (b as! Bool) }
        return jsStrictEquals(a, b)
    }

    static func sameValueZero(_ a: Element, _ b: Element) -> Bool {
        if Element.self == Double.self {
            let x = a as! Double, y = b as! Double
            return x == y || (x.isNaN && y.isNaN)
        }
        if Element.self == String.self { return jsStringEquals(a as! String, b as! String) }
        return jsSameValueZero(a, b)
    }

    /// `array.indexOf(value, fromIndex)` with `===` (NaN is never found; objects by identity).
    public final func indexOf(_ value: Element, _ fromIndex: Double = 0) -> Double {
        track()
        let length = storage.count
        var k = jsRelativeIndex(fromIndex, length)
        while k < length {
            if JSArray.strictEquals(storage[k], value) { return Double(k) }
            k += 1
        }
        return -1
    }

    /// `array.lastIndexOf(value, fromIndex)` with `===`.
    public final func lastIndexOf(_ value: Element, _ fromIndex: Double? = nil) -> Double {
        track()
        let length = storage.count
        guard length > 0 else { return -1 }
        let n = fromIndex.map(jsToIntegerOrInfinity) ?? Double(length - 1)
        if n == -.infinity { return -1 }
        var k = n >= 0 ? Int(Swift.min(n, Double(length - 1))) : jsClampedInt(Double(length) + n)
        while k >= 0 {
            if JSArray.strictEquals(storage[k], value) { return Double(k) }
            k -= 1
        }
        return -1
    }

    /// `array.includes(value, fromIndex)` with SameValueZero (NaN is found).
    public final func includes(_ value: Element, _ fromIndex: Double = 0) -> Bool {
        track()
        let length = storage.count
        var k = jsRelativeIndex(fromIndex, length)
        while k < length {
            if JSArray.sameValueZero(storage[k], value) { return true }
            k += 1
        }
        return false
    }

    @_optimize(speed) @inlinable public final func find(_ predicate: (Element) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try each { v, _ in
            if try predicate(v) { found = v; return false }
            return true
        }
        return found
    }

    @_optimize(speed) public final func find(_ predicate: (Element, Double) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try each { v, i in
            if try predicate(v, Double(i)) { found = v; return false }
            return true
        }
        return found
    }

    @_optimize(speed) public final func find(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Element? {
        try find { v, i in try predicate(v, i, self) }
    }

    @_optimize(speed) @inlinable public final func findIndex(_ predicate: (Element) throws -> Bool) rethrows -> Double {
        var found = -1
        try each { v, i in
            if try predicate(v) { found = i; return false }
            return true
        }
        return Double(found)
    }

    @_optimize(speed) public final func findIndex(_ predicate: (Element, Double) throws -> Bool) rethrows -> Double {
        var found = -1
        try each { v, i in
            if try predicate(v, Double(i)) { found = i; return false }
            return true
        }
        return Double(found)
    }

    @_optimize(speed) public final func findIndex(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Double {
        try findIndex { v, i in try predicate(v, i, self) }
    }

    public final func findLast(_ predicate: (Element) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try eachReversed { v, _ in
            if try predicate(v) { found = v; return false }
            return true
        }
        return found
    }

    public final func findLast(_ predicate: (Element, Double) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try eachReversed { v, i in
            if try predicate(v, Double(i)) { found = v; return false }
            return true
        }
        return found
    }

    public final func findLast(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Element? {
        try findLast { v, i in try predicate(v, i, self) }
    }

    public final func findLastIndex(_ predicate: (Element) throws -> Bool) rethrows -> Double {
        var found = -1
        try eachReversed { v, i in
            if try predicate(v) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public final func findLastIndex(_ predicate: (Element, Double) throws -> Bool) rethrows -> Double {
        var found = -1
        try eachReversed { v, i in
            if try predicate(v, Double(i)) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public final func findLastIndex(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Double {
        try findLastIndex { v, i in try predicate(v, i, self) }
    }

    @_optimize(speed) @inlinable public final func some(_ predicate: (Element) throws -> Bool) rethrows -> Bool {
        var result = false
        try each { v, _ in
            if try predicate(v) { result = true; return false }
            return true
        }
        return result
    }

    @_optimize(speed) public final func some(_ predicate: (Element, Double) throws -> Bool) rethrows -> Bool {
        var result = false
        try each { v, i in
            if try predicate(v, Double(i)) { result = true; return false }
            return true
        }
        return result
    }

    @_optimize(speed) public final func some(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Bool {
        try some { v, i in try predicate(v, i, self) }
    }

    @_optimize(speed) @inlinable public final func every(_ predicate: (Element) throws -> Bool) rethrows -> Bool {
        var result = true
        try each { v, _ in
            if try !predicate(v) { result = false; return false }
            return true
        }
        return result
    }

    @_optimize(speed) public final func every(_ predicate: (Element, Double) throws -> Bool) rethrows -> Bool {
        var result = true
        try each { v, i in
            if try !predicate(v, Double(i)) { result = false; return false }
            return true
        }
        return result
    }

    @_optimize(speed) public final func every(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Bool {
        try every { v, i in try predicate(v, i, self) }
    }

    // MARK: Transforms

    @_optimize(speed) @inlinable public final func forEach(_ body: (Element) throws -> Void) rethrows {
        try each { v, _ in
            try body(v)
            return true
        }
    }

    @_optimize(speed) @inlinable public final func forEach(_ body: (Element, Double) throws -> Void) rethrows {
        try each { v, i in
            try body(v, Double(i))
            return true
        }
    }

    @_optimize(speed) @inlinable public final func forEach(_ body: (Element, Double, JSArray<Element>) throws -> Void) rethrows {
        try each { v, i in
            try body(v, Double(i), self)
            return true
        }
    }

    @_optimize(speed) @inlinable public final func map<U>(_ transform: (Element) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, _ in
            out.append(try transform(v))
            return true
        }
        return JSArray<U>(out)
    }

    @_optimize(speed) @inlinable public final func map<U>(_ transform: (Element, Double) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, i in
            out.append(try transform(v, Double(i)))
            return true
        }
        return JSArray<U>(out)
    }

    @_optimize(speed) @inlinable public final func map<U>(_ transform: (Element, Double, JSArray<Element>) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, i in
            out.append(try transform(v, Double(i), self))
            return true
        }
        return JSArray<U>(out)
    }

    @_optimize(speed) @inlinable public final func filter(_ predicate: (Element) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, _ in
            if try predicate(v) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    @_optimize(speed) @inlinable public final func filter(_ predicate: (Element, Double) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, i in
            if try predicate(v, Double(i)) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    @_optimize(speed) @inlinable public final func filter(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, i in
            if try predicate(v, Double(i), self) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    public final func flatMap<U>(_ transform: (Element) throws -> JSArray<U>) rethrows -> JSArray<U> {
        var out: [U] = []
        try each { v, _ in
            out += try transform(v).elements
            return true
        }
        return JSArray<U>(out)
    }

    public final func flatMap<U>(_ transform: (Element, Double) throws -> JSArray<U>) rethrows -> JSArray<U> {
        var out: [U] = []
        try each { v, i in
            out += try transform(v, Double(i)).elements
            return true
        }
        return JSArray<U>(out)
    }

    public final func flatMap<U>(_ transform: (Element, Double, JSArray<Element>) throws -> JSArray<U>) rethrows -> JSArray<U> {
        try flatMap { v, i in try transform(v, i, self) }
    }

    /// `array.reduce(f, initial)`.
    @_optimize(speed) @inlinable public final func reduce<U>(_ next: (U, Element) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try each { v, _ in
            accumulator = try next(accumulator, v)
            return true
        }
        return accumulator
    }

    @_optimize(speed) @inlinable public final func reduce<U>(_ next: (U, Element, Double) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try each { v, i in
            accumulator = try next(accumulator, v, Double(i))
            return true
        }
        return accumulator
    }

    @_optimize(speed) @inlinable public final func reduce<U>(_ next: (U, Element, Double, JSArray<Element>) throws -> U, _ initial: U) rethrows -> U {
        try reduce({ a, v, i in try next(a, v, i, self) }, initial)
    }

    /// `array.reduce(f)`: the first element is the initial value; an empty array throws a TypeError.
    @_optimize(speed) public final func reduce(_ next: (Element, Element) throws -> Element) throws -> Element {
        try reduce { a, v, _ in try next(a, v) }
    }

    @_optimize(speed) public final func reduce(_ next: (Element, Element, Double) throws -> Element) throws -> Element {
        track()
        let length = storage.count
        guard length > 0 else { throw JSException(JSTypeError("Reduce of empty array with no initial value")) }
        var accumulator = read(0)
        var k = 1
        while k < length {
            if k < storage.count { accumulator = try next(accumulator, read(k), Double(k)) }
            k += 1
        }
        return accumulator
    }

    @_optimize(speed) public final func reduce(_ next: (Element, Element, Double, JSArray<Element>) throws -> Element) throws -> Element {
        try reduce { a, v, i in try next(a, v, i, self) }
    }

    public final func reduceRight<U>(_ next: (U, Element) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try eachReversed { v, _ in
            accumulator = try next(accumulator, v)
            return true
        }
        return accumulator
    }

    public final func reduceRight<U>(_ next: (U, Element, Double) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try eachReversed { v, i in
            accumulator = try next(accumulator, v, Double(i))
            return true
        }
        return accumulator
    }

    public final func reduceRight<U>(_ next: (U, Element, Double, JSArray<Element>) throws -> U, _ initial: U) rethrows -> U {
        try reduceRight({ a, v, i in try next(a, v, i, self) }, initial)
    }

    public final func reduceRight(_ next: (Element, Element) throws -> Element) throws -> Element {
        try reduceRight { a, v, _ in try next(a, v) }
    }

    public final func reduceRight(_ next: (Element, Element, Double) throws -> Element) throws -> Element {
        track()
        guard !storage.isEmpty else { throw JSException(JSTypeError("Reduce of empty array with no initial value")) }
        var k = storage.count - 1
        var accumulator = read(k)
        k -= 1
        while k >= 0 {
            if k < storage.count { accumulator = try next(accumulator, read(k), Double(k)) }
            k -= 1
        }
        return accumulator
    }

    public final func reduceRight(_ next: (Element, Element, Double, JSArray<Element>) throws -> Element) throws -> Element {
        try reduceRight { a, v, i in try next(a, v, i, self) }
    }

    // MARK: Strings

    /// `array.join(separator)`: elements in their string form, undefined and null as "".
    public final func join(_ separator: String = ",") -> String {
        track()
        // Into one string sized up front: the strings mapped and joined made an array and grew the result.
        if Element.self == String.self {
            let strings = unsafeBitCast(storage, to: [String].self)
            var out = ""
            out.reserveCapacity(strings.reduce(separator.utf8.count * Swift.max(0, strings.count - 1)) { $0 + $1.utf8.count })
            for (i, s) in strings.enumerated() {
                if i > 0 { out += separator }
                if !jsIsHoleString(s) { out += s }
            }
            return out
        }
        if Element.self == Double.self { return unsafeBitCast(storage, to: [Double].self).map { $0.bitPattern == jsHoleNumber.bitPattern ? "" : jsNumberToString($0) }.joined(separator: separator) }
        return jsJoin(separator)
    }

    public final func toString() -> String { join() }

    public final var description: String { jsInspect(self) }

    // MARK: Statics

    /// `Array.from(iterable)`.
    public static func from<S: Sequence>(_ items: S) -> JSArray<Element> where S.Element == Element {
        JSArray(Array(items))
    }

    /// `Array.from(iterable, (value, index) => …)`.
    public static func from<S: Sequence>(_ items: S, _ transform: (S.Element, Double) throws -> Element) rethrows -> JSArray<Element> {
        var out: [Element] = []
        for (i, item) in items.enumerated() { out.append(try transform(item, Double(i))) }
        return JSArray(out)
    }

    /// `Array.from({ length }, (_, index) => …)`.
    public static func from(length: Double, _ transform: (Double) throws -> Element) rethrows -> JSArray<Element> {
        let n = jsClampedInt(Swift.max(0, jsToIntegerOrInfinity(length)))
        var out: [Element] = []
        out.reserveCapacity(n)
        for i in 0..<n { out.append(try transform(Double(i))) }
        return JSArray(out)
    }

    /// `Array.of(...items)`.
    public static func of(_ items: Element...) -> JSArray<Element> { JSArray(items) }

    /// `Array.isArray(value)`.
    public static func isArray(_ value: Any?) -> Bool {
        // JSArrayProtocol is class-bound: a value of any other kind is no array, without a conformance lookup for its type.
        guard let v = jsFlat(value), [.swiftClass, .objCClass].contains(jsTypeKind(v)) else { return false }
        return v is JSArrayProtocol
    }

    // MARK: JSArrayProtocol, JSReactiveConvertible

    public final var jsLength: Int { count }

    public final var jsAnyElements: [Any?] {
        track()
        return storage.indices.map { JSArray.isHole(storage[$0]) ? nil : jsFlat(read($0)) }
    }

    public final func jsElement(at index: Int) -> Any? {
        track()
        return index >= 0 && index < storage.count && !JSArray.isHole(storage[index]) ? jsFlat(read(index)) : nil
    }

    public final func jsSetElement(_ value: Any?, at index: Int) throws {
        guard let element: Element = jsCast(value) else {
            throw JSException(JSTypeError("Cannot store \(jsTypeof(value)) in an array of \(Element.self)"))
        }
        if index > storage.count && JSArray.hole == nil {
            throw JSException(JSRangeError("Index \(index) is past the end of an array of \(Element.self) (length \(storage.count))"))
        }
        self[index] = element
    }

    /// `array.length = n`: a RangeError where n is no valid length.
    public final func jsSetLength(checked length: Double) throws {
        guard length >= 0, length <= 4_294_967_295, length == length.rounded(.towardZero) else { throw JSException(JSRangeError("Invalid array length")) }
        try jsSetLength(Int(length))
    }

    public final func jsSetLength(_ length: Int) throws {
        if length > storage.count && JSArray.hole == nil {
            throw JSException(JSRangeError("Cannot grow an array of \(Element.self) from \(storage.count) to \(length)"))
        }
        setLength(length)
    }

    public final func jsSetElements(_ values: [Any?]) throws {
        var elements: [Element] = []
        elements.reserveCapacity(values.count)
        for value in values {
            guard let element: Element = jsCast(value) else {
                throw JSException(JSTypeError("Cannot store \(jsTypeof(value)) in an array of \(Element.self)"))
            }
            elements.append(element)
        }
        storage = elements
        trigger()
    }

    public final func jsMakeReactive() {
        if jsTracker == nil { jsTracker = JSTracker() }
    }
}

extension JSArray {
    /// `array.flat()` for an array of arrays.
    public func flat<T>() -> JSArray<T> where Element == JSArray<T> {
        var out: [T] = []
        each { v, _ in
            out += v.elements
            return true
        }
        return JSArray<T>(out)
    }
}

extension JSArray where Element == Any? {
    /// `array.flat(depth)` for dynamic arrays: nested arrays are spread `depth` levels.
    public func flat(_ depth: Double = 1) -> JSArray<Any?> {
        func spread(_ values: [Any?], _ depth: Double, into out: inout [Any?]) {
            for value in values {
                if depth >= 1, let nested = value as? JSArrayProtocol {
                    spread(nested.jsAnyElements, depth - 1, into: &out)
                } else {
                    out.append(value)
                }
            }
        }
        var out: [Any?] = []
        spread(jsAnyElements, jsToIntegerOrInfinity(depth), into: &out)
        return JSArray(out)
    }
}

/// A relative index (`slice`, `splice`, `fill`, `indexOf`): negative counts from the end, clamped to 0…length.
@usableFromInline func jsRelativeIndex(_ value: Double, _ length: Int) -> Int {
    let relative = jsToIntegerOrInfinity(value)
    if relative < 0 { return Int(max(Double(length) + relative, 0)) }
    return Int(min(relative, Double(length)))
}

/// A stable merge sort: `less(a, b)` says whether `a` must come before `b`; equal elements keep their order.
/// Runs of 16 are sorted by insertion first, and two runs already in order are copied without merging.
/// Inlinable: the app's module specializes it for its element type and comparator.
@_optimize(speed) @inlinable
func jsMergeSort<T>(_ values: inout [T], _ less: (T, T) throws -> Bool) rethrows {
    let n = values.count
    guard n > 1 else { return }
    let run = 16
    try values.withUnsafeMutableBufferPointer { a in
        var start = 0
        while start < n {
            let end = min(start + run, n)
            var i = start + 1
            while i < end {
                let x = a[i]
                var j = i
                while j > start, try less(x, a[j - 1]) {
                    a[j] = a[j - 1]
                    j -= 1
                }
                a[j] = x
                i += 1
            }
            start = end
        }
    }
    guard n > run else { return }
    var target = values
    var width = run
    while width < n {
        try values.withUnsafeBufferPointer { source in
            try target.withUnsafeMutableBufferPointer { merged in
                var start = 0
                while start < n {
                    let middle = min(start + width, n)
                    let end = min(start + 2 * width, n)
                    var ordered = middle >= end
                    if !ordered { ordered = try !less(source[middle], source[middle - 1]) }
                    if ordered {
                        for k in start..<end { merged[k] = source[k] }
                    } else {
                        var l = start, r = middle, k = start
                        while l < middle && r < end {
                            if try less(source[r], source[l]) {
                                merged[k] = source[r]
                                r += 1
                            } else {
                                merged[k] = source[l]
                                l += 1
                            }
                            k += 1
                        }
                        while l < middle {
                            merged[k] = source[l]
                            l += 1
                            k += 1
                        }
                        while r < end {
                            merged[k] = source[r]
                            r += 1
                            k += 1
                        }
                    }
                    start = end
                }
            }
        }
        swap(&values, &target)
        width *= 2
    }
}

/// An array's methods read by name from untyped code (`value.map(fn)` where `value` is `any`), over the
/// elements as JavaScript values. New arrays are untyped; the methods that change the array store into
/// its own element type, and throw a TypeError for a value it cannot hold.
func jsArrayMethod(_ array: JSArrayProtocol, _ key: String) -> JSMethod? {
    let each = { (callback: Any?, body: (Any?, Any?) throws -> Bool) throws in
        for (i, element) in array.jsAnyElements.enumerated() where try !body(element, try jsCall(callback, element, Double(i), array)) { return }
    }
    let number = { (args: [Any?], i: Int) -> Double? in jsIsNullish(jsArg(args, i)) ? nil : jsToNumber(jsArg(args, i)) }
    /// The position a relative index argument names, `fallback` when it is absent.
    let position = { (args: [Any?], i: Int, fallback: Int) -> Int in number(args, i).map { jsRelativeIndex($0, array.jsLength) } ?? fallback }
    let fold = { (args: [Any?], indices: [Int]) throws -> Any? in
        let elements = array.jsAnyElements
        var order = indices[...]
        var accumulator: Any?
        if args.count > 1 {
            accumulator = args[1]
        } else {
            guard let first = order.popFirst() else { throw JSException(JSTypeError("Reduce of empty array with no initial value")) }
            accumulator = elements[first]
        }
        for i in order { accumulator = try jsCall(jsArg(args, 0), accumulator, elements[i], Double(i), array) }
        return accumulator
    }
    let findLast = { (args: [Any?]) throws -> Int? in
        let elements = array.jsAnyElements
        return try elements.indices.reversed().first { jsTruthy(try jsCall(jsArg(args, 0), elements[$0], Double($0), array)) }
    }
    switch key {
    case "map":
        return { _, args in
            var out: [Any?] = []
            try each(jsArg(args, 0)) { _, r in out.append(r); return true }
            return JSArray<Any?>(out)
        }
    case "filter":
        return { _, args in
            var out: [Any?] = []
            try each(jsArg(args, 0)) { e, r in if jsTruthy(r) { out.append(e) }; return true }
            return JSArray<Any?>(out)
        }
    case "flatMap":
        return { _, args in
            var out: [Any?] = []
            try each(jsArg(args, 0)) { _, r in
                if let nested = r as? JSArrayProtocol { out += nested.jsAnyElements } else { out.append(r) }
                return true
            }
            return JSArray<Any?>(out)
        }
    case "forEach":
        return { _, args in try each(jsArg(args, 0)) { _, _ in true }; return nil }
    case "find", "findIndex":
        return { _, args in
            var found: Any? = nil, index = -1.0
            var i = 0.0
            try each(jsArg(args, 0)) { e, r in
                if jsTruthy(r) { found = e; index = i; return false }
                i += 1
                return true
            }
            return key == "find" ? found : index
        }
    case "findLast": return { _, args in try findLast(args).map { array.jsAnyElements[$0] } ?? nil }
    case "findLastIndex": return { _, args in Double(try findLast(args) ?? -1) }
    case "some", "every":
        return { _, args in
            var result = key == "every"
            try each(jsArg(args, 0)) { _, r in
                if jsTruthy(r) == (key == "some") { result = key == "some"; return false }
                return true
            }
            return result
        }
    case "reduce": return { _, args in try fold(args, Array(0..<array.jsLength)) }
    case "reduceRight": return { _, args in try fold(args, Array((0..<array.jsLength).reversed())) }
    case "includes":
        return { _, args in array.jsAnyElements[min(position(args, 1, 0), array.jsLength)...].contains { jsSameValueZero($0, jsArg(args, 0)) } }
    case "indexOf":
        return { _, args in
            let elements = array.jsAnyElements
            return Double((position(args, 1, 0)..<elements.count).first { jsStrictEquals(elements[$0], jsArg(args, 0)) } ?? -1)
        }
    case "lastIndexOf":
        return { _, args in
            let elements = array.jsAnyElements
            let from = args.count > 1 ? (number(args, 1) ?? 0) : Double(elements.count - 1)
            let last = from < 0 ? elements.count + Int(jsToIntegerOrInfinity(max(from, -Double(elements.count) - 1))) : min(Int(jsToIntegerOrInfinity(min(from, Double(elements.count)))), elements.count - 1)
            guard last >= 0 else { return -1.0 }
            return Double((0...last).reversed().first { jsStrictEquals(elements[$0], jsArg(args, 0)) } ?? -1)
        }
    case "at":
        return { _, args in
            let i = jsClampedInt(number(args, 0) ?? 0)
            return array.jsElement(at: i < 0 ? array.jsLength + i : i)
        }
    case "join", "toString":
        return { _, args in
            let separator = key == "toString" || jsIsNullish(jsArg(args, 0)) ? "," : jsToString(jsArg(args, 0))
            return array.jsAnyElements.map { jsIsNullish($0) || $0 is JSNull ? "" : jsToString($0) }.joined(separator: separator)
        }
    case "slice":
        return { _, args in
            let elements = array.jsAnyElements
            let from = position(args, 0, 0), to = position(args, 1, elements.count)
            return JSArray<Any?>(from < to ? Array(elements[from..<to]) : [])
        }
    case "concat":
        return { _, args in
            var out = array.jsAnyElements
            for item in args { if let nested = jsFlat(item) as? JSArrayProtocol { out += nested.jsAnyElements } else { out.append(item) } }
            return JSArray<Any?>(out)
        }
    case "keys", "values", "entries":
        // Live, as JavaScript's: an element pushed while iterating is reached.
        return { _, _ in
            var i = 0
            return JSIterator<Any?> {
                guard i < array.jsLength else { return nil }
                defer { i += 1 }
                return key == "keys" ? Double(i) : key == "values" ? array.jsElement(at: i) : JSArray<Any?>([Double(i), array.jsElement(at: i)])
            }
        }
    case "flat":
        return { _, args in JSArray<Any?>(array.jsAnyElements).flat(number(args, 0) ?? 1) }
    case "push":
        return { _, args in
            try array.jsSetElements(array.jsAnyElements + args)
            return Double(array.jsLength)
        }
    case "unshift":
        return { _, args in
            try array.jsSetElements(args + array.jsAnyElements)
            return Double(array.jsLength)
        }
    case "pop", "shift":
        return { _, _ in
            var elements = array.jsAnyElements
            guard !elements.isEmpty else { return nil }
            let removed = key == "pop" ? elements.removeLast() : elements.removeFirst()
            try array.jsSetElements(elements)
            return removed
        }
    case "splice":
        return { _, args in
            var elements = array.jsAnyElements
            let start = position(args, 0, 0)
            let count = args.isEmpty ? 0 : args.count == 1 ? elements.count - start : max(0, min(Int(jsToIntegerOrInfinity(number(args, 1) ?? 0)), elements.count - start))
            let removed = Array(elements[start..<start + count])
            elements.replaceSubrange(start..<start + count, with: args.dropFirst(2))
            try array.jsSetElements(elements)
            return JSArray<Any?>(removed)
        }
    case "reverse":
        return { _, _ in try array.jsSetElements(array.jsAnyElements.reversed()); return array }
    case "fill":
        return { _, args in
            var elements = array.jsAnyElements
            let from = position(args, 1, 0), to = position(args, 2, elements.count)
            if from < to { for i in from..<to { elements[i] = jsArg(args, 0) } }
            try array.jsSetElements(elements)
            return array
        }
    case "sort":
        return { _, args in
            let compare = jsArg(args, 0)
            var defined = array.jsAnyElements.filter { $0 != nil }
            let undefined = array.jsAnyElements.filter { $0 == nil }
            if jsIsNullish(compare) {
                var keyed = defined.map { (jsToString($0), $0) }
                jsMergeSort(&keyed) { jsStringLess($0.0, $1.0) }
                defined = keyed.map { $0.1 }
            } else {
                try jsMergeSort(&defined) { a, b in
                    let order = jsToNumber(try jsCall(compare, a, b))
                    return !order.isNaN && order < 0
                }
            }
            try array.jsSetElements(defined + undefined)
            return array
        }
    default:
        return nil
    }
}

/// `new Array(n)`'s length as a count: a RangeError where n is not an integer in 0…2³²−1.
public func jsArrayLength(_ length: Double) throws -> Int {
    guard length >= 0, length <= 4_294_967_295, length == length.rounded(.towardZero) else { throw JSException(JSRangeError("Invalid array length")) }
    return Int(length)
}

/// `Array(...items)`: one number is a length, anything else the elements.
public func jsArrayConstruct(_ items: [Any?]) throws -> JSArray<Any?> {
    guard items.count == 1, let length = jsFlat(items[0]) as? Double else { return JSArray(items) }
    return JSArray(Array(repeating: nil, count: try jsArrayLength(length)))
}

/// An array made with empty slots (`new Array(n)`) and filled by index, as the
/// element type it was declared with; a slot never written is a hole that type cannot hold.
public func jsFilled<T>(_ array: JSArray<T?>) -> JSArray<T> {
    JSArray(array.storage.enumerated().map { k, value in
        guard let value else { fatalError("JSArray<\(T.self)>: slot \(k) of \(array.storage.count) was never written") }
        return value
    })
}

/// `new Array(x)` of a value typed only at run time: `x` empty slots for a number (a
/// RangeError when it is no valid length), otherwise an array holding `x`.
public func jsNewArray(_ value: Any?) throws -> JSArray<Any?> {
    guard let length = jsFlat(value) as? Double else { return JSArray<Any?>([value]) }
    return JSArray<Any?>(Array(repeating: nil, count: try jsArrayLength(length)))
}
