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
}

/// A JavaScript array: reference semantics, JavaScript method names, `Double` indexes and lengths.
///
/// Limits: a subscript read past the end traps (JavaScript gives `undefined`, which a non-optional
/// `Element` cannot hold; `at(_:)` returns nil instead), and growing the array past its end with
/// `length` or an index needs an optional `Element` to hold the empty slots.
public final class JSArray<Element>: JSArrayProtocol, JSReactiveConvertible, Sequence, ExpressibleByArrayLiteral, CustomStringConvertible {
    public var storage: [Element]
    public var jsTracker: JSTracker?

    public init() { storage = [] }
    public init(_ elements: [Element]) { storage = elements }
    public init(arrayLiteral elements: Element...) { storage = elements }

    @inline(__always) func track() { jsTracker?.track() }
    @inline(__always) func trigger() { jsTracker?.trigger() }

    @inline(__always) func read(_ index: Int) -> Element {
        if jsTracker != nil { return jsReactive(storage[index]) }
        return storage[index]
    }

    static var hole: Element? {
        (Element.self as? JSOptionalProtocol.Type).map { $0.jsNone as! Element }
    }

    private func outOfRange(_ index: Int) -> Never {
        fatalError("JSArray<\(Element.self)> index \(index) out of range (length \(storage.count))")
    }

    // MARK: Elements

    public var count: Int {
        track()
        return storage.count
    }

    public var isEmpty: Bool { count == 0 }

    /// The elements as a Swift array, read through the tracker.
    public var elements: [Element] {
        track()
        if jsTracker != nil { return storage.map { jsReactive($0) } }
        return storage
    }

    /// `array.length`. Setting it shorter truncates.
    public var length: Double {
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

    private func setLength(_ n: Int) {
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

    /// `a[i]` as JavaScript reads it: nil (undefined) unless `i` is an integer index in range.
    public func element(_ i: Double) -> Element? {
        guard let k = Int(exactly: i), k >= 0, k < count else { return nil }
        return self[k]
    }

    public subscript(i: Int) -> Element {
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

    public subscript(i: Double) -> Element {
        get { self[index(i)] }
        set { self[index(i)] = newValue }
    }

    private func index(_ d: Double) -> Int {
        guard d >= 0, d < 4_294_967_295, d == d.rounded(.towardZero) else {
            fatalError("JSArray<\(Element.self)> index \(jsNumberToString(d)) is not an array index (length \(storage.count))")
        }
        return Int(d)
    }

    /// `array.at(i)`: negative indexes count from the end; out of range is nil.
    public func at(_ i: Double) -> Element? {
        track()
        let relative = jsToIntegerOrInfinity(i)
        let k = relative >= 0 ? relative : Double(storage.count) + relative
        guard k >= 0 && k < Double(storage.count) else { return nil }
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

    public func makeIterator() -> Iterator { Iterator(array: self) }

    /// Visits the indexes below the length at the start; indexes the callback removed are skipped.
    @inline(__always)
    private func each(_ body: (Element, Int) throws -> Bool) rethrows {
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
    public func keys() -> JSIterator<Double> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return Double(i)
        }
    }

    /// `array.values()`.
    public func values() -> JSIterator<Element> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return self.read(i)
        }
    }

    /// `array.entries()`, each entry an `(index, value)` tuple.
    public func entries() -> JSIterator<(Double, Element)> {
        var i = 0
        return JSIterator { [self] in
            self.track()
            guard i < self.storage.count else { return nil }
            defer { i += 1 }
            return (Double(i), self.read(i))
        }
    }

    // MARK: Mutators

    @discardableResult
    public func push(_ items: Element...) -> Double {
        storage.append(contentsOf: items)
        trigger()
        return Double(storage.count)
    }

    public func pop() -> Element? {
        guard !storage.isEmpty else { return nil }
        let value = storage.removeLast()
        trigger()
        return jsTracker != nil ? jsReactive(value) : value
    }

    public func shift() -> Element? {
        guard !storage.isEmpty else { return nil }
        let value = storage.removeFirst()
        trigger()
        return jsTracker != nil ? jsReactive(value) : value
    }

    @discardableResult
    public func unshift(_ items: Element...) -> Double {
        storage.insert(contentsOf: items, at: 0)
        trigger()
        return Double(storage.count)
    }

    /// `array.splice(start, deleteCount, ...items)`. A nil `deleteCount` is an absent one (delete to
    /// the end); JavaScript's explicit `undefined` (delete nothing) must be passed as 0.
    @discardableResult
    public func splice(_ start: Double, _ deleteCount: Double? = nil, _ items: Element...) -> JSArray<Element> {
        splice(start, deleteCount, contentsOf: items)
    }

    /// `array.splice(start, deleteCount, ...items)` with the items spread from one array.
    @discardableResult
    public func splice(_ start: Double, _ deleteCount: Double?, contentsOf items: [Element]) -> JSArray<Element> {
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
    public func reverse() -> JSArray<Element> {
        storage.reverse()
        trigger()
        return self
    }

    /// `array.sort()`: in place and stable, by the string form of each element in UTF-16 code
    /// unit order, undefined elements last.
    @discardableResult
    public func sort() -> JSArray<Element> {
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
    /// and a NaN comparison result counts as 0.
    @discardableResult
    public func sort(_ compare: (Element, Element) throws -> Double) rethrows -> JSArray<Element> {
        var defined: [Element] = []
        var undefined: [Element] = []
        for element in storage {
            if jsIsUndefined(element) { undefined.append(element) } else { defined.append(element) }
        }
        try jsMergeSort(&defined) { try compare($0, $1) < 0 }
        storage = defined + undefined
        trigger()
        return self
    }

    /// `array.fill(value, start, end)`: in place, returns the array.
    @discardableResult
    public func fill(_ value: Element, _ start: Double = 0, _ end: Double? = nil) -> JSArray<Element> {
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
    public func slice(_ start: Double = 0, _ end: Double? = nil) -> JSArray<Element> {
        track()
        let length = storage.count
        let s = jsRelativeIndex(start, length)
        let e = end.map { jsRelativeIndex($0, length) } ?? length
        return s < e ? JSArray((s..<e).map(read)) : JSArray()
    }

    /// `array.concat(other, ...)` with array arguments, spread one level.
    public func concat(_ first: JSArray<Element>, _ rest: JSArray<Element>...) -> JSArray<Element> {
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
    public func concat(_ items: Element...) -> JSArray<Element> {
        concat(spread: items)
    }

    /// `array.concat(...items)`.
    public func concat(spread items: [Element]) -> JSArray<Element> {
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
    public func toReversed() -> JSArray<Element> {
        track()
        return JSArray(storage.reversed())
    }

    /// `array.toSorted()`.
    public func toSorted() -> JSArray<Element> { JSArray(elements).sort() }

    /// `array.toSorted(compare)`.
    public func toSorted(_ compare: (Element, Element) throws -> Double) rethrows -> JSArray<Element> {
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
    public func indexOf(_ value: Element, _ fromIndex: Double = 0) -> Double {
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
    public func lastIndexOf(_ value: Element, _ fromIndex: Double? = nil) -> Double {
        track()
        let length = storage.count
        guard length > 0 else { return -1 }
        let n = fromIndex.map(jsToIntegerOrInfinity) ?? Double(length - 1)
        if n == -.infinity { return -1 }
        var k = n >= 0 ? Int(Swift.min(n, Double(length - 1))) : Int(Double(length) + n)
        while k >= 0 {
            if JSArray.strictEquals(storage[k], value) { return Double(k) }
            k -= 1
        }
        return -1
    }

    /// `array.includes(value, fromIndex)` with SameValueZero (NaN is found).
    public func includes(_ value: Element, _ fromIndex: Double = 0) -> Bool {
        track()
        let length = storage.count
        var k = jsRelativeIndex(fromIndex, length)
        while k < length {
            if JSArray.sameValueZero(storage[k], value) { return true }
            k += 1
        }
        return false
    }

    public func find(_ predicate: (Element) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try each { v, _ in
            if try predicate(v) { found = v; return false }
            return true
        }
        return found
    }

    public func find(_ predicate: (Element, Double) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try each { v, i in
            if try predicate(v, Double(i)) { found = v; return false }
            return true
        }
        return found
    }

    public func find(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Element? {
        try find { v, i in try predicate(v, i, self) }
    }

    public func findIndex(_ predicate: (Element) throws -> Bool) rethrows -> Double {
        var found = -1
        try each { v, i in
            if try predicate(v) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public func findIndex(_ predicate: (Element, Double) throws -> Bool) rethrows -> Double {
        var found = -1
        try each { v, i in
            if try predicate(v, Double(i)) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public func findIndex(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Double {
        try findIndex { v, i in try predicate(v, i, self) }
    }

    public func findLast(_ predicate: (Element) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try eachReversed { v, _ in
            if try predicate(v) { found = v; return false }
            return true
        }
        return found
    }

    public func findLast(_ predicate: (Element, Double) throws -> Bool) rethrows -> Element? {
        var found: Element?
        try eachReversed { v, i in
            if try predicate(v, Double(i)) { found = v; return false }
            return true
        }
        return found
    }

    public func findLast(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Element? {
        try findLast { v, i in try predicate(v, i, self) }
    }

    public func findLastIndex(_ predicate: (Element) throws -> Bool) rethrows -> Double {
        var found = -1
        try eachReversed { v, i in
            if try predicate(v) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public func findLastIndex(_ predicate: (Element, Double) throws -> Bool) rethrows -> Double {
        var found = -1
        try eachReversed { v, i in
            if try predicate(v, Double(i)) { found = i; return false }
            return true
        }
        return Double(found)
    }

    public func findLastIndex(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Double {
        try findLastIndex { v, i in try predicate(v, i, self) }
    }

    public func some(_ predicate: (Element) throws -> Bool) rethrows -> Bool {
        var result = false
        try each { v, _ in
            if try predicate(v) { result = true; return false }
            return true
        }
        return result
    }

    public func some(_ predicate: (Element, Double) throws -> Bool) rethrows -> Bool {
        var result = false
        try each { v, i in
            if try predicate(v, Double(i)) { result = true; return false }
            return true
        }
        return result
    }

    public func some(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Bool {
        try some { v, i in try predicate(v, i, self) }
    }

    public func every(_ predicate: (Element) throws -> Bool) rethrows -> Bool {
        var result = true
        try each { v, _ in
            if try !predicate(v) { result = false; return false }
            return true
        }
        return result
    }

    public func every(_ predicate: (Element, Double) throws -> Bool) rethrows -> Bool {
        var result = true
        try each { v, i in
            if try !predicate(v, Double(i)) { result = false; return false }
            return true
        }
        return result
    }

    public func every(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> Bool {
        try every { v, i in try predicate(v, i, self) }
    }

    // MARK: Transforms

    public func forEach(_ body: (Element) throws -> Void) rethrows {
        try each { v, _ in
            try body(v)
            return true
        }
    }

    public func forEach(_ body: (Element, Double) throws -> Void) rethrows {
        try each { v, i in
            try body(v, Double(i))
            return true
        }
    }

    public func forEach(_ body: (Element, Double, JSArray<Element>) throws -> Void) rethrows {
        try each { v, i in
            try body(v, Double(i), self)
            return true
        }
    }

    public func map<U>(_ transform: (Element) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, _ in
            out.append(try transform(v))
            return true
        }
        return JSArray<U>(out)
    }

    public func map<U>(_ transform: (Element, Double) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, i in
            out.append(try transform(v, Double(i)))
            return true
        }
        return JSArray<U>(out)
    }

    public func map<U>(_ transform: (Element, Double, JSArray<Element>) throws -> U) rethrows -> JSArray<U> {
        var out: [U] = []
        out.reserveCapacity(storage.count)
        try each { v, i in
            out.append(try transform(v, Double(i), self))
            return true
        }
        return JSArray<U>(out)
    }

    public func filter(_ predicate: (Element) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, _ in
            if try predicate(v) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    public func filter(_ predicate: (Element, Double) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, i in
            if try predicate(v, Double(i)) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    public func filter(_ predicate: (Element, Double, JSArray<Element>) throws -> Bool) rethrows -> JSArray<Element> {
        var out: [Element] = []
        try each { v, i in
            if try predicate(v, Double(i), self) { out.append(v) }
            return true
        }
        return JSArray(out)
    }

    public func flatMap<U>(_ transform: (Element) throws -> JSArray<U>) rethrows -> JSArray<U> {
        var out: [U] = []
        try each { v, _ in
            out += try transform(v).elements
            return true
        }
        return JSArray<U>(out)
    }

    public func flatMap<U>(_ transform: (Element, Double) throws -> JSArray<U>) rethrows -> JSArray<U> {
        var out: [U] = []
        try each { v, i in
            out += try transform(v, Double(i)).elements
            return true
        }
        return JSArray<U>(out)
    }

    public func flatMap<U>(_ transform: (Element, Double, JSArray<Element>) throws -> JSArray<U>) rethrows -> JSArray<U> {
        try flatMap { v, i in try transform(v, i, self) }
    }

    /// `array.reduce(f, initial)`.
    public func reduce<U>(_ next: (U, Element) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try each { v, _ in
            accumulator = try next(accumulator, v)
            return true
        }
        return accumulator
    }

    public func reduce<U>(_ next: (U, Element, Double) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try each { v, i in
            accumulator = try next(accumulator, v, Double(i))
            return true
        }
        return accumulator
    }

    public func reduce<U>(_ next: (U, Element, Double, JSArray<Element>) throws -> U, _ initial: U) rethrows -> U {
        try reduce({ a, v, i in try next(a, v, i, self) }, initial)
    }

    /// `array.reduce(f)`: the first element is the initial value; an empty array throws a TypeError.
    public func reduce(_ next: (Element, Element) throws -> Element) throws -> Element {
        try reduce { a, v, _ in try next(a, v) }
    }

    public func reduce(_ next: (Element, Element, Double) throws -> Element) throws -> Element {
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

    public func reduce(_ next: (Element, Element, Double, JSArray<Element>) throws -> Element) throws -> Element {
        try reduce { a, v, i in try next(a, v, i, self) }
    }

    public func reduceRight<U>(_ next: (U, Element) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try eachReversed { v, _ in
            accumulator = try next(accumulator, v)
            return true
        }
        return accumulator
    }

    public func reduceRight<U>(_ next: (U, Element, Double) throws -> U, _ initial: U) rethrows -> U {
        var accumulator = initial
        try eachReversed { v, i in
            accumulator = try next(accumulator, v, Double(i))
            return true
        }
        return accumulator
    }

    public func reduceRight<U>(_ next: (U, Element, Double, JSArray<Element>) throws -> U, _ initial: U) rethrows -> U {
        try reduceRight({ a, v, i in try next(a, v, i, self) }, initial)
    }

    public func reduceRight(_ next: (Element, Element) throws -> Element) throws -> Element {
        try reduceRight { a, v, _ in try next(a, v) }
    }

    public func reduceRight(_ next: (Element, Element, Double) throws -> Element) throws -> Element {
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

    public func reduceRight(_ next: (Element, Element, Double, JSArray<Element>) throws -> Element) throws -> Element {
        try reduceRight { a, v, i in try next(a, v, i, self) }
    }

    // MARK: Strings

    /// `array.join(separator)`: elements in their string form, undefined and null as "".
    public func join(_ separator: String = ",") -> String {
        track()
        if Element.self == String.self { return (storage as! [String]).joined(separator: separator) }
        if Element.self == Double.self { return (storage as! [Double]).map(jsNumberToString).joined(separator: separator) }
        return jsJoin(separator)
    }

    public func toString() -> String { join() }

    public var description: String { jsInspect(self) }

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
        let n = Int(Swift.max(0, jsToIntegerOrInfinity(length)))
        var out: [Element] = []
        out.reserveCapacity(n)
        for i in 0..<n { out.append(try transform(Double(i))) }
        return JSArray(out)
    }

    /// `Array.of(...items)`.
    public static func of(_ items: Element...) -> JSArray<Element> { JSArray(items) }

    /// `Array.isArray(value)`.
    public static func isArray(_ value: Any?) -> Bool { jsFlat(value) is JSArrayProtocol }

    // MARK: JSArrayProtocol, JSReactiveConvertible

    public var jsLength: Int { count }

    public var jsAnyElements: [Any?] {
        track()
        return storage.indices.map { jsFlat(read($0)) }
    }

    public func jsElement(at index: Int) -> Any? {
        track()
        return index >= 0 && index < storage.count ? jsFlat(read(index)) : nil
    }

    public func jsSetElement(_ value: Any?, at index: Int) throws {
        guard let element: Element = jsCast(value) else {
            throw JSException(JSTypeError("Cannot store \(jsTypeof(value)) in an array of \(Element.self)"))
        }
        if index > storage.count && JSArray.hole == nil {
            throw JSException(JSRangeError("Index \(index) is past the end of an array of \(Element.self) (length \(storage.count))"))
        }
        self[index] = element
    }

    public func jsSetLength(_ length: Int) throws {
        if length > storage.count && JSArray.hole == nil {
            throw JSException(JSRangeError("Cannot grow an array of \(Element.self) from \(storage.count) to \(length)"))
        }
        setLength(length)
    }

    public func jsMakeReactive() {
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
func jsRelativeIndex(_ value: Double, _ length: Int) -> Int {
    let relative = jsToIntegerOrInfinity(value)
    if relative < 0 { return Int(max(Double(length) + relative, 0)) }
    return Int(min(relative, Double(length)))
}

/// A stable merge sort: `less(a, b)` says whether `a` must come before `b`; equal elements keep their order.
func jsMergeSort<T>(_ values: inout [T], _ less: (T, T) throws -> Bool) rethrows {
    let n = values.count
    guard n > 1 else { return }
    var source = values
    var target = values
    var width = 1
    while width < n {
        var start = 0
        while start < n {
            let middle = min(start + width, n)
            let end = min(start + 2 * width, n)
            var l = start, r = middle, k = start
            while l < middle && r < end {
                if try less(source[r], source[l]) {
                    target[k] = source[r]
                    r += 1
                } else {
                    target[k] = source[l]
                    l += 1
                }
                k += 1
            }
            while l < middle {
                target[k] = source[l]
                l += 1
                k += 1
            }
            while r < end {
                target[k] = source[r]
                r += 1
                k += 1
            }
            start += 2 * width
        }
        swap(&source, &target)
        width *= 2
    }
    values = source
}

/// An array's methods read by name from untyped code (`value.map(fn)` where `value` is `any`): the
/// common read-only ones, over the elements as JavaScript values; the results are untyped arrays.
func jsArrayMethod(_ array: JSArrayProtocol, _ key: String) -> JSMethod? {
    let each = { (callback: Any?, body: (Any?, Any?) throws -> Bool) throws in
        for (i, element) in array.jsAnyElements.enumerated() where try !body(element, try jsCall(callback, element, Double(i), array)) { return }
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
    case "forEach":
        return { _, args in try each(jsArg(args, 0)) { _, _ in true }; return nil }
    case "find":
        return { _, args in
            var found: Any? = nil
            try each(jsArg(args, 0)) { e, r in if jsTruthy(r) { found = e; return false }; return true }
            return found
        }
    case "some", "every":
        return { _, args in
            var result = key == "every"
            try each(jsArg(args, 0)) { _, r in
                if jsTruthy(r) == (key == "some") { result = key == "some"; return false }
                return true
            }
            return result
        }
    case "includes":
        return { _, args in array.jsAnyElements.contains { jsSameValueZero($0, jsArg(args, 0)) } }
    case "join":
        return { _, args in
            let separator = jsIsNullish(jsArg(args, 0)) ? "," : jsToString(jsArg(args, 0))
            return array.jsAnyElements.map { jsIsNullish($0) ? "" : jsToString($0) }.joined(separator: separator)
        }
    default:
        return nil
    }
}

/// `Array(...items)`: one number is a length, anything else the elements.
public func jsArrayConstruct(_ items: [Any?]) throws -> JSArray<Any?> {
    guard items.count == 1, let length = jsFlat(items[0]) as? Double else { return JSArray(items) }
    guard length >= 0, length <= 4_294_967_295, length == length.rounded(.towardZero) else { throw JSException(JSRangeError("Invalid array length")) }
    return JSArray(Array(repeating: nil, count: Int(length)))
}
