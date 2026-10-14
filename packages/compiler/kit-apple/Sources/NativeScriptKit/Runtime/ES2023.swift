import Foundation

// ES2023's arrays changed by copy (toSorted and toReversed are in Array.swift) and ES2024's grouping.

extension JSArray {
    /// `array.toSpliced(start, deleteCount, ...items)`: a copy with the splice made. A nil `deleteCount` is an absent
    /// one (to the end); JavaScript's explicit `undefined` (remove nothing) must be passed as 0.
    public func toSpliced(_ start: Double, _ deleteCount: Double? = nil, _ items: Element...) -> JSArray<Element> {
        toSpliced(start, deleteCount, contentsOf: items)
    }

    /// `array.toSpliced(start, deleteCount, ...items)` with the items spread from one array.
    public func toSpliced(_ start: Double, _ deleteCount: Double?, contentsOf items: [Element]) -> JSArray<Element> {
        let copy = JSArray(elements)
        copy.splice(start, deleteCount, contentsOf: items)
        return copy
    }

    /// `array.with(index, value)`: a copy with one element replaced; negative indexes count from the end.
    public func with(_ index: Double, _ value: Element) throws -> JSArray<Element> {
        var copy = elements
        let relative = jsToIntegerOrInfinity(index)
        let k = relative >= 0 ? relative : Double(copy.count) + relative
        guard k >= 0, k < Double(copy.count) else { throw JSException(JSRangeError("Invalid index : \(jsNumberToString(index))")) }
        copy[Int(k)] = value
        return JSArray(copy)
    }
}

/// `Object.groupBy(items, callback)`: the items under the property key the callback gives each, in JavaScript's key
/// order. Each group is a `JSArray<S.Element>` held as the record's `V`, which the result's type says: `JSRecord<JSArray<T>?>`
/// for TypeScript's `Partial<Record<K, T[]>>`, `JSRecord<Any?>` untyped.
public func jsObjectGroupBy<S: Sequence, K, V>(_ items: S, _ key: (S.Element, Double) throws -> K) rethrows -> JSRecord<V> {
    var groups: [String: JSArray<S.Element>] = [:]
    var order: [String] = []
    var index = 0.0
    for item in items {
        let name = jsToString(try key(item, index))
        index += 1
        if let group = groups[name] { group.push(item) } else { groups[name] = [item]; order.append(name) }
    }
    let record = JSRecord<V>()
    for name in order { record[name] = (groups[name]! as Any) as? V }
    return record
}

/// `Object.groupBy(items, callback)` with a callback taking only the item.
public func jsObjectGroupBy<S: Sequence, K, V>(_ items: S, _ key: (S.Element) throws -> K) rethrows -> JSRecord<V> {
    try jsObjectGroupBy(items) { item, _ in try key(item) }
}

/// `Object.groupBy(items, callback)` with a callback taking nothing.
public func jsObjectGroupBy<S: Sequence, K, V>(_ items: S, _ key: () throws -> K) rethrows -> JSRecord<V> {
    try jsObjectGroupBy(items) { (_: S.Element, _: Double) in try key() }
}

/// `Map.groupBy(items, callback)`: the items under the key the callback gives each, keys compared as a Map's are.
public func jsMapGroupBy<S: Sequence, K>(_ items: S, _ key: (S.Element, Double) throws -> K) rethrows -> JSMap<K, JSArray<S.Element>> {
    let groups = JSMap<K, JSArray<S.Element>>()
    var index = 0.0
    for item in items {
        let k = try key(item, index)
        index += 1
        if let group = groups.get(k) { group.push(item) } else { groups.set(k, [item]) }
    }
    return groups
}

/// `Map.groupBy(items, callback)` with a callback taking only the item.
public func jsMapGroupBy<S: Sequence, K>(_ items: S, _ key: (S.Element) throws -> K) rethrows -> JSMap<K, JSArray<S.Element>> {
    try jsMapGroupBy(items) { item, _ in try key(item) }
}

/// `Map.groupBy(items, callback)` with a callback taking nothing.
public func jsMapGroupBy<S: Sequence, K>(_ items: S, _ key: () throws -> K) rethrows -> JSMap<K, JSArray<S.Element>> {
    try jsMapGroupBy(items) { (_: S.Element, _: Double) in try key() }
}

/// `Promise.withResolvers()`'s object. `resolve` takes what TypeScript types it to (`T | PromiseLike<T>`): a value, or
/// a promise or thenable whose state the promise then follows.
public final class JSPromiseWithResolvers<T> {
    nonisolated deinit {}
    public let promise: JSPromise<T>
    public let resolve: (Any?) throws -> Void
    public let reject: (Any?) throws -> Void

    public init() {
        let (promise, resolvers) = JSPromise<T>.pending()
        self.promise = promise
        resolve = { value in
            if let other = jsFlat(value) as? JSPromise<T> {
                resolvers.resolve(promise: other)
            } else if let thenable = jsFlat(value) as? JSThenable {
                thenable.jsSubscribe({ result in
                    if let typed: T = jsCast(result) { resolvers.resolve(typed) } else { resolvers.reject(JSTypeError("A promise of \(T.self) was resolved with \(jsTypeof(result)) \(jsToString(result))")) }
                }, { resolvers.reject($0) })
            } else if let typed: T = jsCast(value) {
                resolvers.resolve(typed)
            } else {
                resolvers.reject(JSTypeError("A promise of \(T.self) was resolved with \(jsTypeof(value)) \(jsToString(value))"))
            }
        }
        reject = { resolvers.reject($0) }
    }
}
