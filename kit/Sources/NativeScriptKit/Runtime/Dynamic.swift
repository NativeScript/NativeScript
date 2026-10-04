import Foundation

// JavaScript's object operations on values translated code holds untyped:
// what plugins written against loose types do with options bags, event
// payloads and the views they decorate.

/// Argument `index` of a dynamic call; a missing one is undefined.
@inline(__always)
public func jsArg(_ arguments: [Any?], _ index: Int) -> Any? {
    index < arguments.count ? arguments[index] : nil
}

/// `delete object[key]`.
@discardableResult
public func jsDelete(_ object: Any?, _ key: String) -> Bool {
    switch jsFlat(object) {
    case let o as JSObject: return o.delete(key)
    case let d as JSDeletable: return d.jsDelete(key)
    default: return true
    }
}

/// An object that can lose an own property (`delete o.x`).
public protocol JSDeletable: AnyObject {
    func jsDelete(_ key: String) -> Bool
}

/// `Object.assign(target, ...sources)`: each source's own enumerable keys written to the target in order.
@discardableResult
public func jsObjectAssign(_ target: Any?, _ sources: Any?...) throws -> Any? {
    for source in sources {
        guard let dynamic = jsFlat(source) as? JSDynamic else { continue }
        for key in dynamic.jsKeys { try jsSet(target, key, dynamic[jsKey: key]) }
    }
    return target
}

/// `{ ...source }` into an object literal being built: the source's own enumerable keys, in order.
public func jsObjectSpread(_ target: JSObject, _ source: Any?) {
    guard let dynamic = jsFlat(source) as? JSDynamic else { return }
    for key in dynamic.jsKeys { target[key] = dynamic[jsKey: key] }
    for key in (dynamic as? JSSymbolKeyed)?.jsSymbolKeys ?? [] { target[key] = dynamic[jsKey: key] }
}

/// `Symbol(description)`: a property key no other code spells.
public func jsSymbol(_ description: String) -> String {
    jsSymbolCount += 1
    return "@@\(description)#\(jsSymbolCount)"
}
nonisolated(unsafe) private var jsSymbolCount = 0

/// `key in object`, for any dynamic value.
public func jsIn(_ key: String, _ object: Any?) -> Bool {
    switch jsFlat(object) {
    case let o as JSObject: return o.has(key)
    case let d as JSDynamic: return d.jsKeys.contains(key) || d[jsKey: key] != nil
    default: return false
    }
}

/// A tagged template's strings array; translated code makes one per call site.
public func jsTemplateObject(_ cooked: [String], raw: [String]) -> JSArray<String> {
    let strings = JSArray(cooked)
    jsTemplateRaws[ObjectIdentifier(strings)] = JSArray(raw)
    return strings
}

/// `strings.raw`.
public func jsTemplateRaw(_ strings: JSArray<String>) -> JSArray<String> {
    jsTemplateRaws[ObjectIdentifier(strings)] ?? strings
}
nonisolated(unsafe) private var jsTemplateRaws: [ObjectIdentifier: JSArray<String>] = [:]
