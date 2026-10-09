import Foundation

/// What a plugin's mixin function (`applyMixins(View, [Extended], options)`) does to `Target.prototype`,
/// for the classes of the kit generated from core. A member the target's class chain has nowhere is put
/// on its prototype (`JSPrototypes`), as the function assigns it. One the chain has is wrapped at the
/// target's level, as the function's wrapper wraps `oldImpl`: a lookup that resolves at or above that
/// class runs the mixin's code and the class's own in the options' order, and one a subclass answers
/// with a member of its own does not, as in script. Lookups by key (core's `[prop.setNative]`, untyped
/// calls) resolve through `resolve`; the methods core calls directly run through `call`, from the
/// target's overrides of them.
public enum JSMixins {
    /// `applyMixins`'s order: the mixin's first and the original's result (no options), the original's first
    /// and the mixin's result (`after`), or the mixin's alone (`override`).
    public enum Order { case before, after, replace }

    nonisolated(unsafe) private static var wraps: [ObjectIdentifier: [String: [(Order, JSMethod)]]] = [:]

    /// A method the mixin gives a class that its chain has nowhere: its prototype's, which every instance reads;
    /// around one an earlier mixin put there (`applyMixins(View, [Base, Sub])`, both with the method), in the order.
    public static func add(_ cls: AnyClass, _ key: String, _ order: Order, _ method: @escaping JSMethod) {
        let prototype = JSPrototypes.of(cls)
        guard let old = jsFlat(prototype[key]) as? JSMethod else { prototype[key] = method; return }
        switch order {
        case .before: prototype[key] = { this, a in _ = try method(this, a); return try old(this, a) } as JSMethod
        case .after: prototype[key] = { this, a in _ = try old(this, a); return try method(this, a) } as JSMethod
        case .replace: prototype[key] = method
        }
    }

    /// An accessor the mixin gives a class (`Object.defineProperty(Target.prototype, name, descriptor)`).
    public static func accessor(_ cls: AnyClass, _ key: String, get: ((Any?) throws -> Any?)?, set: ((Any?, Any?) throws -> Void)?) {
        JSPrototypes.declare(cls, key, get: get, set: set)
    }

    /// A method the mixin gives a class under a key its chain may already answer (a symbol's, or one core calls directly).
    public static func wrap(_ cls: AnyClass, _ key: String, _ order: Order, _ method: @escaping JSMethod) {
        wraps[ObjectIdentifier(cls), default: [:]][key, default: []].append((order, method))
    }

    /// What a lookup of `key` that resolved to `found` gives at class `level`'s place in the chain: the mixins
    /// applied to that class around it, the last applied outermost; the mixin's method where nothing was found.
    public static func resolve(_ level: AnyClass, _ key: String, _ found: JSMethod?) -> JSMethod? {
        guard !wraps.isEmpty, let list = wraps[ObjectIdentifier(level)]?[key] else { return found }
        return list.reduce(found) { inner, entry in
            let (order, mixin) = entry
            guard let old = inner else { return mixin }
            switch order {
            case .before: return { this, a in _ = try mixin(this, a); return try old(this, a) }
            case .after: return { this, a in _ = try old(this, a); return try mixin(this, a) }
            case .replace: return mixin
            }
        }
    }

    /// A method core calls directly (`initNativeView`), from the target's override of it: the mixins applied to
    /// `level` around the class's own code, which is the override's original body or its superclass's.
    public static func call<R>(_ level: AnyClass, _ key: String, _ this: AnyObject, _ arguments: [Any?] = [], _ own: () throws -> R) throws -> R {
        guard !wraps.isEmpty, wraps[ObjectIdentifier(level)]?[key] != nil else { return try own() }
        return try withoutActuallyEscaping(own) { own in
            var kept: R?
            let original: JSMethod = { _, _ in let r = try own(); kept = r; return r as Any? }
            let result = try resolve(level, key, original)!(this, arguments)
            if R.self == Void.self { return () as! R }
            if let r = result as? R { return r }
            if let kept { return kept }
            throw JSException(JSTypeError("\(key) gave no value of the type core takes"))
        }
    }
}
