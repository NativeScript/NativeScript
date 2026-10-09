import Foundation

// The global object untyped JavaScript sees: ECMAScript's builtins as function objects over
// the runtime's own values (an array script makes is a `JSArray<Any?>`, a date a `JSDate`),
// so what script hands typed code, and typed code hands script, needs no conversion.

public enum JSScriptGlobal {
    /// `globalThis`.
    public static let object: JSObject = make()

    private static func make() -> JSObject {
        let g = JSObject()
        func put(_ name: String, _ value: Any?) {
            g[name] = value
            try? g.defineProperty(name, JSPropertyDescriptor(enumerable: false))
        }
        put("globalThis", g)
        put("global", g)
        put("self", g)
        put("window", g)
        put("undefined", nil)
        put("NaN", Double.nan)
        put("Infinity", Double.infinity)
        for (name, value) in builtins() { put(name, value) }
        let op = JSPrototypes.objectPrototype
        op["constructor"] = g["Object"]
        try? op.defineProperty("constructor", JSPropertyDescriptor(enumerable: false))
        return g
    }

    // MARK: Builtin constructors

    static func function(_ name: String, _ length: Int, _ body: @escaping JSMethod) -> JSFunctionObject {
        JSFunctionObject(name, length, kind: .builtin, body)
    }

    /// A builtin constructor: `call` for `F(…)`, `make` for `new F(…)`, `F.prototype` the runtime's prototype object of that name.
    static func constructor(_ name: String, _ length: Int, call: @escaping JSMethod, make: (([Any?], JSFunctionObject) throws -> Any?)?, statics: [(String, Any?)] = [], instance: ((Any?) -> Bool)? = nil) -> JSFunctionObject {
        let f = JSFunctionObject(name, length, kind: .builtin, call)
        if let make { f.constructBody = { target, args in try make(args, target) } }
        f.instanceCheck = instance
        let props = f.properties
        let proto = name == "Object" ? JSPrototypes.objectPrototype : JSPrototypes.builtin(name)
        props["prototype"] = proto
        try? props.defineProperty("prototype", JSPropertyDescriptor(enumerable: false, writable: false, configurable: false))
        proto["constructor"] = f
        try? proto.defineProperty("constructor", JSPropertyDescriptor(enumerable: false))
        for (key, value) in statics {
            props[key] = value
            try? props.defineProperty(key, JSPropertyDescriptor(enumerable: false))
        }
        return f
    }

    static func number(_ args: [Any?], _ i: Int) -> Double { jsToNumber(jsArg(args, i)) }
    static func optionalNumber(_ args: [Any?], _ i: Int) -> Double? { jsFlat(jsArg(args, i)) == nil ? nil : jsToNumber(jsArg(args, i)) }

    /// An instance of a subclass (`class E extends Error`): the error the runtime makes, with new.target's prototype.
    static func subclassed(_ target: JSFunctionObject, _ name: String) -> Bool { target.name != name || target.kind != .builtin }

    private static func builtins() -> [(String, Any?)] {
        var out: [(String, Any?)] = []
        let fn = { (name: String, length: Int, body: @escaping JSMethod) in out.append((name, function(name, length, body))) }

        // Object
        out.append(("Object", constructor("Object", 1, call: { _, a in jsToObject(jsArg(a, 0)) }, make: { a, target in
            if target.name != "Object" || target.kind != .builtin { let o = JSObject(); o.jsProto = jsPrototypeForNew(target); return o }
            return jsToObject(jsArg(a, 0))
        }, statics: [
            ("keys", function("keys", 1) { _, a in try jsRequireObjectCoercible(jsArg(a, 0)); return try jsScriptKeys(jsArg(a, 0)) }),
            ("values", function("values", 1) { _, a in JSArray<Any?>(try jsScriptOwnKeys(jsArg(a, 0), symbols: false, enumerableOnly: true).map { try jsGet(jsArg(a, 0), $0) }) }),
            ("entries", function("entries", 1) { _, a in JSArray<Any?>(try jsScriptOwnKeys(jsArg(a, 0), symbols: false, enumerableOnly: true).map { JSArray<Any?>([$0, try jsGet(jsArg(a, 0), $0)]) }) }),
            ("assign", function("assign", 2) { _, a in
                let target = jsArg(a, 0)
                for source in a.dropFirst() where !jsIsNullish(source) {
                    for key in try jsScriptOwnKeys(source, symbols: true, enumerableOnly: true) { try jsSet(target, key, try jsGet(source, key)) }
                }
                return target
            }),
            ("freeze", function("freeze", 1) { _, a in jsFreeze(jsArg(a, 0)) }),
            ("isFrozen", function("isFrozen", 1) { _, a in jsIsFrozen(jsArg(a, 0)) }),
            ("seal", function("seal", 1) { _, a in jsRestrict(jsArg(a, 0), sealed: true) }),
            ("isSealed", function("isSealed", 1) { _, a in jsIsSealed(jsArg(a, 0)) }),
            ("preventExtensions", function("preventExtensions", 1) { _, a in jsRestrict(jsArg(a, 0), sealed: false) }),
            ("isExtensible", function("isExtensible", 1) { _, a in jsIsExtensible(jsArg(a, 0)) }),
            ("create", function("create", 2) { _, a in try jsObjectCreate(jsArg(a, 0), jsArg(a, 1)) }),
            ("getPrototypeOf", function("getPrototypeOf", 1) { _, a in try jsGetPrototypeOf(jsArg(a, 0)) }),
            ("setPrototypeOf", function("setPrototypeOf", 2) { _, a in try jsSetPrototypeOf(jsArg(a, 0), jsArg(a, 1)) }),
            ("defineProperty", function("defineProperty", 3) { _, a in try jsDefineOwnProperty(jsArg(a, 0), jsArg(a, 1), jsArg(a, 2)) }),
            ("defineProperties", function("defineProperties", 2) { _, a in try jsDefineProperties(jsArg(a, 0), jsArg(a, 1)) }),
            ("getOwnPropertyNames", function("getOwnPropertyNames", 1) { _, a in JSArray<Any?>(try jsScriptOwnKeys(jsArg(a, 0), symbols: false, enumerableOnly: false).map { $0 }) }),
            ("getOwnPropertySymbols", function("getOwnPropertySymbols", 1) { _, a in
                JSArray<Any?>(try jsScriptOwnKeys(jsArg(a, 0), symbols: true, enumerableOnly: false).filter(jsIsSymbolKey).compactMap { JSSymbol.of(key: $0) })
            }),
            ("getOwnPropertyDescriptor", function("getOwnPropertyDescriptor", 2) { _, a in jsScriptOwnDescriptor(jsArg(a, 0), jsPropertyKey(jsArg(a, 1))) }),
            ("getOwnPropertyDescriptors", function("getOwnPropertyDescriptors", 1) { _, a in
                let o = JSObject()
                for k in try jsScriptOwnKeys(jsArg(a, 0), symbols: true, enumerableOnly: false) { o[k] = jsScriptOwnDescriptor(jsArg(a, 0), k) }
                return o
            }),
            ("fromEntries", function("fromEntries", 1) { _, a in
                let o = JSObject()
                for entry in try jsItemsOf(jsArg(a, 0)) { o[jsPropertyKey(try jsGetKey(entry, 0.0))] = try jsGetKey(entry, 1.0) }
                return o
            }),
            ("is", function("is", 2) { _, a in jsSameValue(jsArg(a, 0), jsArg(a, 1)) }),
            ("hasOwn", function("hasOwn", 2) { _, a in jsScriptHasOwn(jsArg(a, 0), jsPropertyKey(jsArg(a, 1))) }),
        ])))

        // Function
        out.append(("Function", constructor("Function", 1, call: { _, _ in throw JSException(JSEvalError("Code generation from strings is not available in a compiled app")) },
                                            make: { _, _ in throw JSException(JSEvalError("Code generation from strings is not available in a compiled app")) },
                                            instance: { v in jsFlat(v).map { jsIsFunction($0) } ?? false })))

        // Array
        out.append(("Array", constructor("Array", 1, call: { _, a in try jsNewArrayOf(a) }, make: { a, _ in try jsNewArrayOf(a) }, statics: [
            ("isArray", function("isArray", 1) { _, a in jsScriptIsArray(jsArg(a, 0)) }),
            ("from", function("from", 1) { _, a in
                let source = jsArg(a, 0), map = jsArg(a, 1)
                var items: [Any?]
                if jsIsNullish(source) { throw JSException(JSTypeError("\(jsToString(source)) is not iterable")) }
                if jsFlat(source) is String || jsFlat(source) is JSArrayProtocol || !jsIsNullish(try? jsGet(source, JSSymbol.iterator.key)) || jsFlat(source) is JSMapProtocol || jsFlat(source) is JSSetProtocol || jsFlat(source) is JSIterableValue {
                    items = try jsItemsOf(source)
                } else {
                    items = try jsArgumentList(source)
                }
                if !jsIsNullish(map) { items = try items.enumerated().map { try jsInvoke(map, jsArg(a, 2), [$0.element, Double($0.offset)]) } }
                return JSArray<Any?>(items)
            }),
            ("of", function("of", 0) { _, a in JSArray<Any?>(a) }),
        ], instance: { jsScriptIsArray($0) })))

        // String, Number, Boolean, Symbol, BigInt
        out.append(("String", constructor("String", 1, call: { _, a in
            if a.isEmpty { return "" }
            if let s = jsFlat(a[0]) as? JSSymbol { return s.toString() }
            return jsToString(a[0])
        }, make: { a, _ in a.isEmpty ? "" : jsToString(a[0]) }, statics: [
            ("fromCharCode", function("fromCharCode", 1) { _, a in String(decoding: a.map { UInt16(truncatingIfNeeded: Int(jsToUint32(jsToNumber($0)) & 0xFFFF)) }, as: UTF16.self) }),
            ("fromCodePoint", function("fromCodePoint", 1) { _, a in try jsFromCodePointList(a.map { jsToNumber($0) }) }),
            ("raw", function("raw", 1) { _, a in
                let strings = try jsGet(jsArg(a, 0), "raw")
                let parts = try jsArgumentList(strings).map { jsToString($0) }
                var out = ""
                for (i, p) in parts.enumerated() { out += p; if i + 1 < parts.count, i + 1 < a.count { out += jsToString(a[i + 1]) } }
                return out
            }),
        ], instance: { _ in false })))
        out.append(("Number", constructor("Number", 1, call: { _, a in a.isEmpty ? 0.0 : jsToNumberValue(a[0]) }, make: { a, _ in a.isEmpty ? 0.0 : jsToNumberValue(a[0]) }, statics: [
            ("isNaN", function("isNaN", 1) { _, a in (jsFlat(jsArg(a, 0)) as? Double)?.isNaN ?? false }),
            ("isFinite", function("isFinite", 1) { _, a in (jsFlat(jsArg(a, 0)) as? Double)?.isFinite ?? false }),
            ("isInteger", function("isInteger", 1) { _, a in (jsFlat(jsArg(a, 0)) as? Double).map(jsIsInteger) ?? false }),
            ("isSafeInteger", function("isSafeInteger", 1) { _, a in (jsFlat(jsArg(a, 0)) as? Double).map(jsIsSafeInteger) ?? false }),
            ("parseFloat", function("parseFloat", 1) { _, a in jsParseFloat(jsToString(jsArg(a, 0))) }),
            ("parseInt", function("parseInt", 2) { _, a in jsParseInt(jsToString(jsArg(a, 0)), optionalNumber(a, 1)) }),
            ("MAX_SAFE_INTEGER", 9007199254740991.0), ("MIN_SAFE_INTEGER", -9007199254740991.0), ("EPSILON", Double.ulpOfOne),
            ("MAX_VALUE", Double.greatestFiniteMagnitude), ("MIN_VALUE", Double.leastNonzeroMagnitude),
            ("POSITIVE_INFINITY", Double.infinity), ("NEGATIVE_INFINITY", -Double.infinity), ("NaN", Double.nan),
        ], instance: { _ in false })))
        out.append(("Boolean", constructor("Boolean", 1, call: { _, a in jsIsTruthy(jsArg(a, 0)) }, make: { a, _ in jsIsTruthy(jsArg(a, 0)) }, instance: { _ in false })))
        out.append(("Symbol", constructor("Symbol", 0, call: { _, a in JSSymbol(jsFlat(jsArg(a, 0)) == nil ? nil : jsToString(jsArg(a, 0))) },
                                          make: { _, _ in throw JSException(JSTypeError("Symbol is not a constructor")) }, statics: [
            ("for", function("for", 1) { _, a in JSSymbol.for(jsToString(jsArg(a, 0))) }),
            ("keyFor", function("keyFor", 1) { _, a in (jsFlat(jsArg(a, 0)) as? JSSymbol).flatMap { JSSymbol.keyFor($0) } }),
            ("iterator", JSSymbol.iterator), ("asyncIterator", JSSymbol.asyncIterator), ("toPrimitive", JSSymbol.toPrimitive),
            ("toStringTag", JSSymbol.toStringTag), ("hasInstance", JSSymbol.hasInstance),
            ("species", JSSymbol.for("Symbol.species")), ("isConcatSpreadable", JSSymbol.for("Symbol.isConcatSpreadable")),
            ("unscopables", JSSymbol.for("Symbol.unscopables")), ("match", JSSymbol.for("Symbol.match")),
        ], instance: { _ in false })))

        out.append(("BigInt", constructor("BigInt", 1, call: { _, a in try JSBigInt(convert: jsArg(a, 0)) }, make: { _, _ in throw JSException(JSTypeError("BigInt is not a constructor")) }, statics: [
            ("asIntN", function("asIntN", 2) { _, a in jsArg(a, 1) }), ("asUintN", function("asUintN", 2) { _, a in jsArg(a, 1) }),
        ], instance: { _ in false })))

        // Errors
        let errors: [(String, (String) -> JSError)] = [
            ("Error", { JSError($0) }), ("TypeError", { JSTypeError($0) }), ("RangeError", { JSRangeError($0) }),
            ("SyntaxError", { JSSyntaxError($0) }), ("ReferenceError", { JSReferenceError($0) }),
            ("EvalError", { JSEvalError($0) }), ("URIError", { JSURIError($0) }),
        ]
        for (name, make) in errors {
            let create = { (a: [Any?], target: JSFunctionObject?) throws -> Any? in
                let message = jsFlat(jsArg(a, 0)) == nil ? "" : jsToString(jsArg(a, 0))
                let cause = (jsFlat(jsArg(a, 1)) as? JSDynamic).flatMap { jsHasKey($0, "cause") ? $0[jsKey: "cause"] : nil }
                if let target, subclassed(target, name) {
                    let e = JSScriptError(message, cause: cause)
                    e.jsProto = jsPrototypeForNew(target)
                    if name != "Error" { e.inheritedName = name }
                    return e
                }
                let e = make(message)
                if let cause { e.cause = cause }
                return e
            }
            out.append((name, constructor(name, 1, call: { _, a in try create(a, nil) }, make: { a, t in try create(a, t) }, statics: name == "Error" ? [
                ("captureStackTrace", function("captureStackTrace", 2) { _, _ in nil }),
                ("stackTraceLimit", 10.0),
            ] : [], instance: { v in
                guard let e = jsFlat(v) as? JSError, !(e is JSScriptError) else { return false }
                return name == "Error" || e.name == name
            })))
        }

        // Math, JSON, Reflect
        out.append(("Math", mathObject()))
        out.append(("JSON", JSObject([
            ("parse", function("parse", 2) { _, a in
                let value = try jsJSONParse(jsToString(jsArg(a, 0)))
                guard let reviver = jsFlat(jsArg(a, 1)), jsIsFunction(reviver) else { return value }
                return try jsRevive(JSObject([("", value)]), "", reviver)
            }),
            ("stringify", function("stringify", 3) { _, a in try jsScriptStringify(jsArg(a, 0), jsArg(a, 1), jsArg(a, 2)) }),
        ])))
        out.append(("Reflect", reflectObject()))
        out.append(("Proxy", constructor("Proxy", 2, call: { _, _ in throw JSException(JSTypeError("Constructor Proxy requires 'new'")) }, make: { a, _ in
            guard jsIsObjectValue(jsArg(a, 0)), jsIsObjectValue(jsArg(a, 1)) else { throw JSException(JSTypeError("Cannot create proxy with a non-object as target or handler")) }
            return JSProxy(target: jsArg(a, 0), handler: jsArg(a, 1))
        }, statics: [("revocable", function("revocable", 2) { _, a in
            let p = JSProxy(target: jsArg(a, 0), handler: jsArg(a, 1))
            return JSObject([("proxy", p), ("revoke", function("", 0) { _, _ in p.revoked = true; return nil })])
        })])))

        // Collections, dates, regular expressions, promises
        out.append(("Map", constructor("Map", 0, call: { _, _ in throw JSException(JSTypeError("Constructor Map requires 'new'")) }, make: { a, target in
            let m: JSMap<Any?, Any?>
            if subclassed(target, "Map") { let sub = JSScriptMap(); sub.jsProto = jsPrototypeForNew(target); m = sub } else { m = JSMap<Any?, Any?>() }
            if !jsIsNullish(jsArg(a, 0)) { for entry in try jsItemsOf(jsArg(a, 0)) { m.set(try jsGetKey(entry, 0.0), try jsGetKey(entry, 1.0)) } }
            return m
        }, instance: { jsFlat($0) is JSMapProtocol })))
        out.append(("Set", constructor("Set", 0, call: { _, _ in throw JSException(JSTypeError("Constructor Set requires 'new'")) }, make: { a, target in
            let s: JSSet<Any?>
            if subclassed(target, "Set") { let sub = JSScriptSet(); sub.jsProto = jsPrototypeForNew(target); s = sub } else { s = JSSet<Any?>() }
            if !jsIsNullish(jsArg(a, 0)) { for v in try jsItemsOf(jsArg(a, 0)) { s.add(v) } }
            return s
        }, instance: { jsFlat($0) is JSSetProtocol })))
        out.append(("WeakMap", constructor("WeakMap", 0, call: { _, _ in throw JSException(JSTypeError("Constructor WeakMap requires 'new'")) }, make: { a, _ in
            let m = JSWeakMap<AnyObject, Any?>()
            if !jsIsNullish(jsArg(a, 0)) { for entry in try jsItemsOf(jsArg(a, 0)) { try jsInvokeMember(m, "set", [try jsGetKey(entry, 0.0), try jsGetKey(entry, 1.0)]) } }
            return m
        }, instance: { jsFlat($0) is JSWeakMap<AnyObject, Any?> })))
        out.append(("WeakSet", constructor("WeakSet", 0, call: { _, _ in throw JSException(JSTypeError("Constructor WeakSet requires 'new'")) }, make: { a, _ in
            let s = JSWeakSet<AnyObject>()
            if !jsIsNullish(jsArg(a, 0)) { for v in try jsItemsOf(jsArg(a, 0)) { try jsInvokeMember(s, "add", [v]) } }
            return s
        }, instance: { jsFlat($0) is JSWeakSet<AnyObject> })))
        out.append(("Date", constructor("Date", 7, call: { _, _ in JSDate().toString() }, make: { a, target in
            let date: JSDate
            switch a.count {
            case 0: date = JSDate()
            case 1:
                switch jsFlat(a[0]) {
                case let d as JSDate: date = JSDate(d.time)
                case let s as String: date = JSDate(s)
                default:
                    let p = jsToPrimitive(a[0])
                    date = p is String ? JSDate(p as! String) : JSDate(jsToNumber(p))
                }
            default: date = JSDate(number(a, 0), number(a, 1), a.count > 2 ? number(a, 2) : 1, a.count > 3 ? number(a, 3) : 0, a.count > 4 ? number(a, 4) : 0, a.count > 5 ? number(a, 5) : 0, a.count > 6 ? number(a, 6) : 0)
            }
            return date
        }, statics: [
            ("now", function("now", 0) { _, _ in JSDate.now() }),
            ("parse", function("parse", 1) { _, a in JSDate.parse(jsToString(jsArg(a, 0))) }),
            ("UTC", function("UTC", 7) { _, a in JSDate.UTC(number(a, 0), optionalNumber(a, 1) ?? 0, optionalNumber(a, 2) ?? 1, optionalNumber(a, 3) ?? 0, optionalNumber(a, 4) ?? 0, optionalNumber(a, 5) ?? 0, optionalNumber(a, 6) ?? 0) }),
        ], instance: { jsFlat($0) is JSDate })))
        out.append(("RegExp", constructor("RegExp", 2, call: { _, a in try JSRegExp.construct(jsArg(a, 0), jsArg(a, 1)) }, make: { a, _ in try JSRegExp.construct(jsArg(a, 0), jsArg(a, 1)) }, instance: { jsFlat($0) is JSRegExp })))
        out.append(("Promise", constructor("Promise", 1, call: { _, _ in throw JSException(JSTypeError("Promise constructor cannot be invoked without 'new'")) }, make: { a, _ in
            let executor = jsArg(a, 0)
            guard let e = jsFlat(executor), jsIsFunction(e) else { throw JSException(JSTypeError("Promise resolver \(jsToString(executor)) is not a function")) }
            return JSPromise<Any?> { (r: JSResolvers<Any?>) in
                let resolve = function("", 1) { _, v in r.resolve(jsArg(v, 0)); return nil }
                let reject = function("", 1) { _, v in r.reject(jsArg(v, 0)); return nil }
                do { try jsInvoke(e, nil, [resolve, reject]) } catch { r.reject(jsCaught(error)) }
            }
        }, statics: [
            ("resolve", function("resolve", 1) { _, a in jsFlat(jsArg(a, 0)) is JSThenable ? jsArg(a, 0) : JSPromise<Any?>.resolve(jsArg(a, 0)) }),
            ("reject", function("reject", 1) { _, a in JSPromise<Any?> { (r: JSResolvers<Any?>) in r.reject(jsArg(a, 0)) } }),
            ("all", function("all", 1) { _, a in jsPromiseAllCore(try jsItemsOf(jsArg(a, 0)).map(jsPromiseResolveAny)) { JSArray<Any?>($0) as Any? } }),
            ("allSettled", function("allSettled", 1) { _, a in jsPromiseAllSettledCore(try jsItemsOf(jsArg(a, 0)).map(jsPromiseResolveAny)) }),
            ("race", function("race", 1) { _, a in try jsCallMethod(JSPromise<Any?>.self, "race", jsArg(a, 0)) }),
            ("any", function("any", 1) { _, a in try jsCallMethod(JSPromise<Any?>.self, "any", jsArg(a, 0)) }),
        ], instance: { jsFlat($0) is JSThenable })))

        // Functions of the global object
        fn("eval", 1) { _, _ in throw JSException(JSEvalError("eval is not available in a compiled app")) }
        fn("parseInt", 2) { _, a in jsParseInt(jsToString(jsArg(a, 0)), optionalNumber(a, 1)) }
        fn("parseFloat", 1) { _, a in jsParseFloat(jsToString(jsArg(a, 0))) }
        fn("isNaN", 1) { _, a in jsToNumber(jsArg(a, 0)).isNaN }
        fn("isFinite", 1) { _, a in jsToNumber(jsArg(a, 0)).isFinite }
        fn("encodeURIComponent", 1) { _, a in jsEncodeURIComponent(jsToString(jsArg(a, 0))) }
        fn("decodeURIComponent", 1) { _, a in jsDecodeURIComponent(jsToString(jsArg(a, 0))) }
        fn("encodeURI", 1) { _, a in jsEncodeURI(jsToString(jsArg(a, 0))) }
        fn("decodeURI", 1) { _, a in jsDecodeURI(jsToString(jsArg(a, 0))) }
        fn("unescape", 1) { _, a in jsUnescape(jsToString(jsArg(a, 0))) }
        fn("setTimeout", 2) { _, a in
            let f = jsArg(a, 0), rest = Array(a.dropFirst(2))
            return jsSetTimeout({ jsReport { try jsInvoke(f, nil, rest) } }, optionalNumber(a, 1) ?? 0)
        }
        fn("setInterval", 2) { _, a in
            let f = jsArg(a, 0), rest = Array(a.dropFirst(2))
            return jsSetInterval({ jsReport { try jsInvoke(f, nil, rest) } }, optionalNumber(a, 1) ?? 0)
        }
        fn("setImmediate", 1) { _, a in
            let f = jsArg(a, 0), rest = Array(a.dropFirst(1))
            return jsSetTimeout({ jsReport { try jsInvoke(f, nil, rest) } }, 0)
        }
        fn("clearTimeout", 1) { _, a in jsClearTimeout(jsIsNullish(jsArg(a, 0)) ? nil : jsToNumber(jsArg(a, 0))); return nil }
        fn("clearInterval", 1) { _, a in jsClearInterval(jsIsNullish(jsArg(a, 0)) ? nil : jsToNumber(jsArg(a, 0))); return nil }
        fn("clearImmediate", 1) { _, a in jsClearTimeout(jsIsNullish(jsArg(a, 0)) ? nil : jsToNumber(jsArg(a, 0))); return nil }
        fn("queueMicrotask", 1) { _, a in
            let f = jsArg(a, 0)
            jsQueueMicrotask { jsReport { try jsInvoke(f, nil, []) } }
            return nil
        }
        out.append(("console", JSObject([
            ("log", function("log", 0) { _, a in jsLog(spread: a); return nil }),
            ("info", function("info", 0) { _, a in jsLog(spread: a); return nil }),
            ("debug", function("debug", 0) { _, a in jsLog(spread: a); return nil }),
            ("warn", function("warn", 0) { _, a in jsError(spread: a); return nil }),
            ("error", function("error", 0) { _, a in jsError(spread: a); return nil }),
            ("trace", function("trace", 0) { _, a in jsError(spread: a); return nil }),
        ])))
        // What bundlers define for a production build, which libraries branch on (`process.env.NODE_ENV !== 'production'`).
        out.append(("process", JSObject([("env", JSObject([("NODE_ENV", "production")])), ("browser", true), ("platform", "ios")])))
        out.append(("crypto", JSObject([
            ("getRandomValues", function("getRandomValues", 1) { _, a in try jsScriptRandomValues(jsArg(a, 0)) }),
            ("randomUUID", function("randomUUID", 0) { _, _ in UUID().uuidString.lowercased() }),
        ])))
        for (name, value) in typedArrayConstructors() { out.append((name, value)) }
        out.append(("URL", constructor("URL", 2, call: { _, _ in throw JSException(JSTypeError("Constructor URL requires 'new'")) }, make: { a, target in
            try jsMakeURL(jsToString(jsArg(a, 0)), jsFlat(jsArg(a, 1)) == nil ? nil : jsToString(jsArg(a, 1)), target)
        })))
        return out
    }

    // MARK: Builtin prototypes

    /// The methods of a builtin prototype (`Array.prototype.slice`), each forwarding to the runtime's
    /// method of that name on its receiver, as `Array.prototype.slice.call(arguments)` reaches it.
    static func populate(prototype p: JSObject, _ name: String) {
        func method(_ key: String, _ length: Int, _ body: @escaping JSMethod) {
            p[key] = JSFunctionObject(key, length, kind: .builtin, body)
            try? p.defineProperty(key, JSPropertyDescriptor(enumerable: false))
        }
        switch name {
        case "Function":
            method("call", 1) { this, a in try jsInvoke(this, jsArg(a, 0), Array(a.dropFirst())) }
            method("apply", 2) { this, a in try jsInvoke(this, jsArg(a, 0), try jsArgumentList(jsArg(a, 1))) }
            method("bind", 1) { this, a in
                let target = this, bound = jsArg(a, 0), args = Array(a.dropFirst())
                let name = "bound " + ((jsFlat(target) as? JSFunctionObject)?.name ?? "")
                let length = max(0, ((jsFlat(target) as? JSFunctionObject)?.length ?? 0) - args.count)
                let f = JSFunctionObject(name, length) { _, rest in try jsInvoke(target, bound, args + rest) }
                f.constructBody = { _, rest in try jsNew(target, args + rest) }
                return f
            }
            method("toString", 0) { this, _ in
                let fname = (jsFlat(this) as? JSFunctionObject)?.name ?? ""
                if let f = jsFlat(this) as? JSFunctionObject, f.kind == .classConstructor { return "class \(fname) { }" }
                return "function \(fname)() { [native code] }"
            }
        case "Array":
            func native(_ array: JSArrayProtocol, _ key: String) throws -> JSMethod {
                guard let m = jsArrayMethod(array, key) else { throw JSException(JSTypeError("Array.prototype.\(key) is not supported in a compiled app")) }
                return m
            }
            for key in ["push", "pop", "shift", "unshift", "splice", "reverse", "fill", "sort"] {
                method(key, 1) { this, a in
                    if let array = jsFlat(this) as? JSArrayProtocol { return try native(array, key)(this, a) }
                    return try jsGenericArrayMutation(this, key, a)
                }
            }
            for key in ["slice", "concat", "join", "indexOf", "lastIndexOf", "includes", "map", "filter", "forEach", "reduce", "reduceRight", "some", "every",
                        "find", "findIndex", "findLast", "findLastIndex", "flat", "flatMap", "keys", "values", "entries", "at", "toString"] {
                method(key, 1) { this, a in
                    let array: JSArrayProtocol
                    if let a = jsFlat(this) as? JSArrayProtocol { array = a } else { array = JSArray<Any?>(try jsArgumentList(this)) }
                    return try native(array, key)(array, a)
                }
            }
            p[JSSymbol.iterator.key] = p["values"]
        case "String":
            for key in ["charAt", "charCodeAt", "codePointAt", "at", "indexOf", "lastIndexOf", "includes", "startsWith", "endsWith", "slice", "substring", "substr",
                        "toLowerCase", "toUpperCase", "trim", "trimStart", "trimEnd", "padStart", "padEnd", "repeat",
                        "split", "replace", "replaceAll", "match", "matchAll", "search", "concat", "localeCompare", "toString", "valueOf"] {
                method(key, 1) { this, a in
                    if jsIsNullish(this) { throw JSException(JSTypeError("String.prototype.\(key) called on null or undefined")) }
                    guard let m = jsStringMethod(jsToString(this), key) else { throw JSException(JSTypeError("String.prototype.\(key) is not supported in a compiled app")) }
                    return try m(this, a)
                }
            }
            method(JSSymbol.iterator.key, 0) { this, _ in try jsIteratorOf(jsToString(this)) }
        case "Number":
            for key in ["toString", "toFixed", "toPrecision", "toExponential", "valueOf", "toLocaleString"] {
                method(key, 1) { this, a in
                    guard let n = jsFlat(this) as? Double, let m = jsNumberMethod(n, key) else { throw JSException(JSTypeError("Number.prototype.\(key) requires that 'this' be a Number")) }
                    return try m(this, a)
                }
            }
        case "Boolean":
            for key in ["toString", "valueOf"] {
                method(key, 0) { this, a in
                    guard let b = jsFlat(this) as? Bool, let m = jsBooleanMethod(b, key) else { throw JSException(JSTypeError("Boolean.prototype.\(key) requires that 'this' be a Boolean")) }
                    return try m(this, a)
                }
            }
        case "Symbol":
            method("toString", 0) { this, _ in (jsFlat(this) as? JSSymbol)?.toString() ?? "Symbol()" }
            method("valueOf", 0) { this, _ in this }
            p["description"] = nil
        case "Error":
            p["name"] = "Error"
            p["message"] = ""
            try? p.defineProperty("name", JSPropertyDescriptor(enumerable: false))
            try? p.defineProperty("message", JSPropertyDescriptor(enumerable: false))
            method("toString", 0) { this, _ in
                let n = try jsGet(this, "name"), m = try jsGet(this, "message")
                let ns = jsFlat(n) == nil ? "Error" : jsToString(n), ms = jsFlat(m) == nil ? "" : jsToString(m)
                return ns.isEmpty ? ms : ms.isEmpty ? ns : "\(ns): \(ms)"
            }
        case "Date":
            for key in jsDateMethodNames { method(key, 0) { this, a in try jsDateMethod(this, key, a) } }
            method(JSSymbol.toPrimitive.key, 1) { this, a in
                let hint = jsToString(jsArg(a, 0))
                return hint == "number" ? try jsDateMethod(this, "valueOf", []) : try jsDateMethod(this, "toString", [])
            }
        case "RegExp":
            method("exec", 1) { this, a in
                guard let re = jsFlat(this) as? JSRegExp else { throw JSException(JSTypeError("RegExp.prototype.exec called on incompatible receiver")) }
                return re.exec(jsToString(jsArg(a, 0))).map(jsMatchArray) ?? jsNull
            }
            method("test", 1) { this, a in
                guard let re = jsFlat(this) as? JSRegExp else { throw JSException(JSTypeError("RegExp.prototype.test called on incompatible receiver")) }
                return re.test(jsToString(jsArg(a, 0)))
            }
            method("toString", 0) { this, _ in (jsFlat(this) as? JSRegExp)?.toString() ?? "/(?:)/" }
        case "Map":
            for key in ["get", "set", "has", "delete", "clear", "forEach", "keys", "values", "entries"] {
                method(key, 1) { this, a in
                    guard let map = jsFlat(this) as? JSMapProtocol, let m = jsMapMethod(map, key) else { throw JSException(JSTypeError("Method Map.prototype.\(key) called on incompatible receiver")) }
                    return try m(this, a)
                }
            }
            p[JSSymbol.iterator.key] = p["entries"]
        case "Set":
            for key in ["add", "has", "delete", "clear", "forEach", "keys", "values", "entries"] {
                method(key, 1) { this, a in
                    guard let set = jsFlat(this) as? JSSetProtocol, let m = jsSetMethod(set, key) else { throw JSException(JSTypeError("Method Set.prototype.\(key) called on incompatible receiver")) }
                    return try m(this, a)
                }
            }
            p[JSSymbol.iterator.key] = p["values"]
        case "WeakMap", "WeakSet":
            for key in name == "WeakMap" ? ["get", "set", "has", "delete"] : ["add", "has", "delete"] {
                method(key, 1) { this, a in
                    guard let host = jsFlat(this) as? JSHostObject, let r = try host.jsInvoke(key, a) else { throw JSException(JSTypeError("Method \(name).prototype.\(key) called on incompatible receiver")) }
                    return r
                }
            }
        case "Promise":
            for key in ["then", "catch", "finally"] {
                method(key, 2) { this, a in
                    guard let t = jsFlat(this) as? JSThenable, let m = jsPromiseMember(t, key) else { throw JSException(JSTypeError("Method Promise.prototype.\(key) called on incompatible receiver")) }
                    return try jsInvoke(m, this, a)
                }
            }
        default:
            if name.hasSuffix("Error") {
                p["name"] = name
                p["message"] = ""
                try? p.defineProperty("name", JSPropertyDescriptor(enumerable: false))
                try? p.defineProperty("message", JSPropertyDescriptor(enumerable: false))
            }
        }
    }

    // MARK: Math

    private static func mathObject() -> JSObject {
        let m = JSObject()
        func one(_ name: String, _ f: @escaping (Double) -> Double) {
            m[name] = function(name, 1) { _, a in f(number(a, 0)) }
        }
        one("floor", Foundation.floor); one("ceil", Foundation.ceil); one("abs", Swift.abs); one("sqrt", Foundation.sqrt); one("cbrt", Foundation.cbrt)
        one("trunc", Foundation.trunc); one("sin", Foundation.sin); one("cos", Foundation.cos); one("tan", Foundation.tan); one("asin", Foundation.asin)
        one("acos", Foundation.acos); one("atan", Foundation.atan); one("exp", Foundation.exp); one("log", Foundation.log); one("log2", Foundation.log2)
        one("log10", Foundation.log10); one("log1p", Foundation.log1p); one("expm1", Foundation.expm1); one("sinh", Foundation.sinh); one("cosh", Foundation.cosh)
        one("tanh", Foundation.tanh); one("asinh", Foundation.asinh); one("acosh", Foundation.acosh); one("atanh", Foundation.atanh)
        one("sign", jsSign); one("round", jsRound); one("fround", jsFround); one("clz32", jsClz32)
        m["atan2"] = function("atan2", 2) { _, a in Foundation.atan2(number(a, 0), number(a, 1)) }
        m["pow"] = function("pow", 2) { _, a in jsPow(number(a, 0), number(a, 1)) }
        m["imul"] = function("imul", 2) { _, a in Double(jsToInt32(number(a, 0)) &* jsToInt32(number(a, 1))) }
        m["max"] = function("max", 2) { _, a in jsMathMax(values: a.map { jsToNumber($0) }) }
        m["min"] = function("min", 2) { _, a in jsMathMin(values: a.map { jsToNumber($0) }) }
        m["hypot"] = function("hypot", 2) { _, a in jsHypotList(a.map { jsToNumber($0) }) }
        m["random"] = function("random", 0) { _, _ in Double.random(in: 0..<1) }
        for (k, v) in [("PI", Double.pi), ("E", M_E), ("LN2", M_LN2), ("LN10", M_LN10), ("LOG2E", M_LOG2E), ("LOG10E", M_LOG10E), ("SQRT2", 2.0.squareRoot()), ("SQRT1_2", 0.5.squareRoot())] { m[k] = v }
        for k in m.keys { try? m.defineProperty(k, JSPropertyDescriptor(enumerable: false)) }
        m[JSSymbol.toStringTag.key] = "Math"
        return m
    }

    // MARK: Reflect

    private static func reflectObject() -> JSObject {
        JSObject([
            ("apply", function("apply", 3) { _, a in try jsInvoke(jsArg(a, 0), jsArg(a, 1), try jsArgumentList(jsArg(a, 2))) }),
            ("construct", function("construct", 2) { _, a in
                let args = try jsArgumentList(jsArg(a, 1))
                if let target = jsFlat(jsArg(a, 2)) as? JSFunctionObject, let f = jsFlat(jsArg(a, 0)) as? JSFunctionObject { return try f.construct(args, newTarget: target) }
                return try jsNew(jsArg(a, 0), args)
            }),
            ("defineProperty", function("defineProperty", 3) { _, a in (try? jsDefineOwnProperty(jsArg(a, 0), jsArg(a, 1), jsArg(a, 2))) != nil }),
            ("deleteProperty", function("deleteProperty", 2) { _, a in try jsDeleteKey(jsArg(a, 0), jsArg(a, 1), strict: false) }),
            ("get", function("get", 2) { _, a in
                let receiver = a.count > 2 ? a[2] : jsArg(a, 0)
                if a.count > 2, let o = jsFlat(jsArg(a, 0)) as? JSObject { return try jsProtoGet(o, jsPropertyKey(jsArg(a, 1)), receiver) }
                return try jsGetKey(jsArg(a, 0), jsArg(a, 1))
            }),
            ("set", function("set", 3) { _, a in (try? jsSetKey(jsArg(a, 0), jsArg(a, 1), jsArg(a, 2))) != nil }),
            ("has", function("has", 2) { _, a in try jsHasProperty(jsArg(a, 1), jsArg(a, 0)) }),
            ("ownKeys", function("ownKeys", 1) { _, a in
                JSArray<Any?>(try jsScriptOwnKeys(jsArg(a, 0), symbols: true, enumerableOnly: false).map { JSSymbol.of(key: $0) ?? $0 })
            }),
            ("getOwnPropertyDescriptor", function("getOwnPropertyDescriptor", 2) { _, a in jsScriptOwnDescriptor(jsArg(a, 0), jsPropertyKey(jsArg(a, 1))) }),
            ("getPrototypeOf", function("getPrototypeOf", 1) { _, a in try jsGetPrototypeOf(jsArg(a, 0)) }),
            ("setPrototypeOf", function("setPrototypeOf", 2) { _, a in (try? jsSetPrototypeOf(jsArg(a, 0), jsArg(a, 1))) != nil }),
            ("isExtensible", function("isExtensible", 1) { _, a in jsIsExtensible(jsArg(a, 0)) }),
            ("preventExtensions", function("preventExtensions", 1) { _, a in jsRestrict(jsArg(a, 0), sealed: false); return true }),
        ])
    }

    private static func typedArrayConstructors() -> [(String, Any?)] {
        let names = ["Uint8Array", "Int8Array", "Uint16Array", "Int16Array", "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "Uint8ClampedArray", "ArrayBuffer", "DataView"]
        return names.compactMap { name in
            guard let make = jsTypedArrayFactory(name) else { return nil }
            let statics: [(String, Any?)] = name == "ArrayBuffer" ? [("isView", function("isView", 1) { _, a in JSArrayBuffer.isView(jsArg(a, 0)) })]
                : name == "DataView" ? [] : [("BYTES_PER_ELEMENT", jsTypedArrayBytes(name) as Any?)]
            return (name, constructor(name, 3, call: { _, _ in throw JSException(JSTypeError("Constructor \(name) requires 'new'")) }, make: { a, _ in try make(a) }, statics: statics, instance: { v in jsFlat(v).map { String(describing: type(of: $0)).contains(name) } ?? false }))
        }
    }
}

/// `Object(value)`: objects as they are, a new object for undefined and null.
func jsToObject(_ value: Any?) -> Any? {
    jsIsNullish(value) ? JSObject() : value
}

func jsRequireObjectCoercible(_ value: Any?) throws {
    if jsIsNullish(value) { throw JSException(JSTypeError("Cannot convert undefined or null to object")) }
}

/// `Number(value)`, a BigInt converted too.
func jsToNumberValue(_ value: Any?) -> Double {
    if let big = jsFlat(value) as? JSBigInt { return big.toDouble() }
    return jsToNumber(value)
}

/// `new Array(…)` / `Array(…)`: one number is a length.
func jsNewArrayOf(_ args: [Any?]) throws -> JSArray<Any?> {
    if args.count == 1, let n = jsFlat(args[0]) as? Double {
        guard n >= 0, n <= 4_294_967_295, n == n.rounded(.towardZero) else { throw JSException(JSRangeError("Invalid array length")) }
        return JSArray<Any?>(Array(repeating: nil, count: Int(n)))
    }
    return JSArray<Any?>(args)
}

/// `Array.isArray(value)`: a proxy for an array is one.
public func jsScriptIsArray(_ value: Any?) -> Bool {
    if let p = jsFlat(value) as? JSProxy { return jsScriptIsArray(p.target) }
    return jsFlat(value) is JSArrayProtocol || jsFlat(value) is JSMatch
}

/// The own property keys of any object script holds: strings (array indexes first), then symbols.
public func jsScriptOwnKeys(_ value: Any?, symbols: Bool, enumerableOnly: Bool) throws -> [String] {
    var keys: [String]
    switch jsFlat(value) {
    case let o as JSObject: keys = enumerableOnly ? o.keys : o.ownPropertyNames
    case let f as JSFunctionObject:
        let props = f.properties
        keys = enumerableOnly ? props.keys : (f.hasOwn("length") ? ["length", "name"] : []) + props.ownPropertyNames
    case let p as JSProxy: return try p.ownKeys().filter { symbols || !jsIsSymbolKey($0) }
    case let array as JSArrayProtocol: keys = (0..<array.jsLength).map { String($0) } + (enumerableOnly ? [] : ["length"])
    case let s as String: keys = (0..<s.utf16.count).map { String($0) } + (enumerableOnly ? [] : ["length"])
    case nil, is JSNull: throw JSException(JSTypeError("Cannot convert undefined or null to object"))
    default: keys = jsKeysOf(value)
    }
    if symbols, let keyed = jsFlat(value) as? JSSymbolKeyed { keys += keyed.jsSymbolKeys }
    return keys
}

/// `Object.keys(value)` for any value script holds.
func jsScriptKeys(_ value: Any?) throws -> JSArray<Any?> {
    JSArray<Any?>(try jsScriptOwnKeys(value, symbols: false, enumerableOnly: true).map { $0 })
}

func jsScriptHasOwn(_ value: Any?, _ key: String) -> Bool {
    switch jsFlat(value) {
    case let f as JSFunctionObject: return f.hasOwn(key)
    case let p as JSProxy: return (try? p.getOwnPropertyDescriptor(key)).map { !jsIsNullish($0) } ?? false
    case let e as JSScriptError: return e.own.has(key) || ["message", "stack"].contains(key)
    default: return jsHasOwn(value, key)
    }
}

func jsScriptOwnDescriptor(_ value: Any?, _ key: String) -> Any? {
    switch jsFlat(value) {
    case let f as JSFunctionObject:
        if f.properties.has(key) { return f.properties.descriptor(key) }
        if f.hasOwn(key) { return JSObject([("value", key == "name" ? f.name : Double(f.length)), ("writable", false), ("enumerable", false), ("configurable", true)]) }
        return nil
    case let p as JSProxy: return (try? p.getOwnPropertyDescriptor(key)) ?? nil
    case let e as JSScriptError:
        if e.own.has(key) { return e.own.descriptor(key) }
        if key == "message" || key == "stack" { return JSObject([("value", e[jsKey: key]), ("writable", true), ("enumerable", false), ("configurable", true)]) }
        return nil
    case let array as JSArrayProtocol:
        if key == "length" { return JSObject([("value", Double(array.jsLength)), ("writable", true), ("enumerable", false), ("configurable", false)]) }
        if let i = jsArrayIndex(key), Int(i) < array.jsLength { return JSObject([("value", array.jsElement(at: Int(i))), ("writable", true), ("enumerable", true), ("configurable", true)]) }
        return nil
    default: return jsOwnPropertyDescriptor(value, key)
    }
}

/// `JSON.parse`'s reviver, called bottom-up with each holder as `this`.
func jsRevive(_ holder: Any?, _ key: String, _ reviver: Any) throws -> Any? {
    let value = try jsGet(holder, key)
    if let array = jsFlat(value) as? JSArrayProtocol {
        for i in 0..<array.jsLength {
            let v = try jsRevive(array, String(i), reviver)
            try array.jsSetElement(v, at: i)
        }
    } else if let o = jsFlat(value) as? JSObject {
        for k in o.keys {
            let v = try jsRevive(o, k, reviver)
            if v == nil { o.delete(k) } else { o[k] = v }
        }
    }
    return try jsInvoke(reviver, holder, [key, value])
}

/// `JSON.stringify(value, replacer, space)`, script's way: a replacer function or key list, `toJSON`, functions skipped.
public func jsScriptStringify(_ value: Any?, _ replacer: Any?, _ space: Any?) throws -> Any? {
    var indent = ""
    if let n = jsFlat(space) as? Double { indent = String(repeating: " ", count: max(0, min(10, Int(n)))) }
    else if let s = jsFlat(space) as? String { indent = String(s.prefix(10)) }
    let replacerFunction = jsFlat(replacer).flatMap { jsIsFunction($0) ? $0 : nil }
    let allowed: Set<String>? = (jsFlat(replacer) as? JSArrayProtocol).map { Set($0.jsAnyElements.map { jsToString($0) }) }
    var stack: [ObjectIdentifier] = []

    func quote(_ s: String) -> String { jsJSONQuote(s) }
    func serialize(_ holder: Any?, _ key: String, _ initial: Any?, _ gap: String) throws -> String? {
        var v = initial
        if jsIsObjectValue(v), let toJSON = jsFlat(try? jsGet(v, "toJSON")), jsIsFunction(toJSON) { v = try jsInvoke(toJSON, v, [key]) }
        else if let date = jsFlat(v) as? JSDate { v = date.toJSON() ?? jsNull }
        if let r = replacerFunction { v = try jsInvoke(r, holder, [key, v]) }
        switch jsFlat(v) {
        case nil: return nil
        case is JSNull: return "null"
        case let b as Bool: return b ? "true" : "false"
        case let s as String: return quote(s)
        case let d as Double: return d.isFinite ? jsNumberToString(d) : "null"
        case is JSSymbol: return nil
        case is JSBigInt: throw JSException(JSTypeError("Do not know how to serialize a BigInt"))
        case let x?:
            if jsIsFunction(x) { return nil }
            if let n = jsNumeric(x) { return n.isFinite ? jsNumberToString(n) : "null" }
            let id = ObjectIdentifier(x as AnyObject)
            if stack.contains(id) { throw JSException(JSTypeError("Converting circular structure to JSON")) }
            stack.append(id)
            defer { stack.removeLast() }
            let inner = gap + indent
            if jsScriptIsArray(x) {
                let items = try jsArgumentList(x)
                if items.isEmpty { return "[]" }
                var parts: [String] = []
                for (i, item) in items.enumerated() { parts.append(try serialize(x, String(i), item, inner) ?? "null") }
                return indent.isEmpty ? "[\(parts.joined(separator: ","))]" : "[\n\(inner)\(parts.joined(separator: ",\n\(inner)"))\n\(gap)]"
            }
            if let m = x as? JSMapProtocol { _ = m; return "{}" }
            if x is JSSetProtocol { return "{}" }
            var keys = try jsScriptOwnKeys(x, symbols: false, enumerableOnly: true)
            if let allowed { keys = keys.filter { allowed.contains($0) } }
            var parts: [String] = []
            for k in keys {
                guard let s = try serialize(x, k, try jsGet(x, k), inner) else { continue }
                parts.append(quote(k) + (indent.isEmpty ? ":" : ": ") + s)
            }
            if parts.isEmpty { return "{}" }
            return indent.isEmpty ? "{\(parts.joined(separator: ","))}" : "{\n\(inner)\(parts.joined(separator: ",\n\(inner)"))\n\(gap)}"
        }
    }
    return try serialize(JSObject([("", value)]), "", value, "")
}

/// A match as the array `exec` returns: its strings, with `index`, `input` and `groups`.
func jsMatchArray(_ m: JSMatch) -> Any? { m }

func jsHypotList(_ values: [Double]) -> Double {
    if values.contains(where: { $0.isInfinite }) { return .infinity }
    if values.contains(where: { $0.isNaN }) { return .nan }
    return values.reduce(0) { $0 + $1 * $1 }.squareRoot()
}

func jsFromCodePointList(_ points: [Double]) throws -> String {
    var out = ""
    for p in points {
        guard p >= 0, p <= 0x10FFFF, p == p.rounded(.towardZero), let scalar = Unicode.Scalar(UInt32(p)) else {
            if p >= 0xD800, p <= 0xDFFF { out += String(decoding: [UInt16(p)], as: UTF16.self); continue }
            throw JSException(JSRangeError("Invalid code point \(jsNumberToString(p))"))
        }
        out.unicodeScalars.append(scalar)
    }
    return out
}

/// `crypto.getRandomValues(typedArray)`: the array filled with random bytes.
func jsScriptRandomValues(_ value: Any?) throws -> Any? {
    guard let view = jsFlat(value) as? JSTypedArrayProtocol else { throw JSException(JSTypeError("The data argument must be an integer-type TypedArray")) }
    jsFillRandom(view)
    return value
}

/// `Array.prototype` methods that change their receiver, for array-likes (`Array.prototype.push.call(proxy, x)`), through its `length` and indexes.
func jsGenericArrayMutation(_ this: Any?, _ key: String, _ args: [Any?]) throws -> Any? {
    var length = Int(jsToLength(try jsGet(this, "length")))
    func get(_ i: Int) throws -> Any? { try jsGet(this, String(i)) }
    func set(_ i: Int, _ v: Any?) throws { try jsSet(this, String(i), v) }
    func remove(_ i: Int) throws { _ = try jsDeleteKey(this, Double(i), strict: false) }
    switch key {
    case "push":
        for v in args { try set(length, v); length += 1 }
        try jsSet(this, "length", Double(length))
        return Double(length)
    case "pop":
        guard length > 0 else { try jsSet(this, "length", 0.0); return nil }
        let v = try get(length - 1)
        try remove(length - 1)
        try jsSet(this, "length", Double(length - 1))
        return v
    case "shift", "unshift", "splice", "reverse", "fill", "sort":
        var items = try (0..<length).map(get)
        var result: Any? = nil
        switch key {
        case "shift": result = items.isEmpty ? nil : items.removeFirst()
        case "unshift": items.insert(contentsOf: args, at: 0); result = Double(items.count)
        case "reverse": items.reverse(); result = this
        default:
            let copy = JSArray<Any?>(items)
            result = try jsCallMethod(copy, key, spread: args)
            items = copy.storage
            if key != "splice" { result = this }
        }
        for (i, v) in items.enumerated() { try set(i, v) }
        if items.count < length { for i in items.count..<length { try remove(i) } }
        try jsSet(this, "length", Double(items.count))
        return result
    default:
        throw JSException(JSTypeError("Array.prototype.\(key) is not supported on this receiver"))
    }
}

// MARK: - Dates

let jsDateMethodNames = ["getTime", "valueOf", "getFullYear", "getMonth", "getDate", "getDay", "getHours", "getMinutes", "getSeconds", "getMilliseconds",
                         "getUTCFullYear", "getUTCMonth", "getUTCDate", "getUTCDay", "getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds",
                         "getTimezoneOffset", "getYear", "setTime", "setFullYear", "setMonth", "setDate", "setHours", "setMinutes", "setSeconds", "setMilliseconds",
                         "setUTCFullYear", "setUTCMonth", "setUTCDate", "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds",
                         "toISOString", "toJSON", "toString", "toDateString", "toTimeString", "toUTCString", "toGMTString", "toLocaleString", "toLocaleDateString", "toLocaleTimeString"]

/// A date's method by name, for untyped code (`date.getTime()` where `date` is `any`).
public func jsDateMethod(_ this: Any?, _ key: String, _ a: [Any?]) throws -> Any? {
    guard let d = jsFlat(this) as? JSDate else { throw JSException(JSTypeError("this is not a Date object.")) }
    let n = { (i: Int) -> Double? in a.count > i ? jsToNumber(a[i]) : nil }
    switch key {
    case "getTime", "valueOf": return d.getTime()
    case "getFullYear": return d.getFullYear()
    case "getYear": return d.getFullYear() - 1900
    case "getMonth": return d.getMonth()
    case "getDate": return d.getDate()
    case "getDay": return d.getDay()
    case "getHours": return d.getHours()
    case "getMinutes": return d.getMinutes()
    case "getSeconds": return d.getSeconds()
    case "getMilliseconds": return d.getMilliseconds()
    case "getUTCFullYear": return d.getUTCFullYear()
    case "getUTCMonth": return d.getUTCMonth()
    case "getUTCDate": return d.getUTCDate()
    case "getUTCDay": return d.getUTCDay()
    case "getUTCHours": return d.getUTCHours()
    case "getUTCMinutes": return d.getUTCMinutes()
    case "getUTCSeconds": return d.getUTCSeconds()
    case "getUTCMilliseconds": return d.getUTCMilliseconds()
    case "getTimezoneOffset": return d.getTimezoneOffset()
    case "setTime": return d.setTime(n(0) ?? .nan)
    case "setFullYear": return d.setFullYear(n(0) ?? .nan, n(1), n(2))
    case "setMonth": return d.setMonth(n(0) ?? .nan, n(1))
    case "setDate": return d.setDate(n(0) ?? .nan)
    case "setHours": return d.setHours(n(0) ?? .nan, n(1), n(2), n(3))
    case "setMinutes": return d.setMinutes(n(0) ?? .nan, n(1), n(2))
    case "setSeconds": return d.setSeconds(n(0) ?? .nan, n(1))
    case "setMilliseconds": return d.setMilliseconds(n(0) ?? .nan)
    case "setUTCFullYear", "setUTCMonth", "setUTCDate", "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds":
        let t = d.time
        var y = d.getUTCFullYear(), mo = d.getUTCMonth(), day = d.getUTCDate(), h = d.getUTCHours(), mi = d.getUTCMinutes(), s = d.getUTCSeconds(), ms = d.getUTCMilliseconds()
        if t.isNaN { y = .nan }
        switch key {
        case "setUTCFullYear": y = n(0) ?? .nan; if let v = n(1) { mo = v }; if let v = n(2) { day = v }
        case "setUTCMonth": mo = n(0) ?? .nan; if let v = n(1) { day = v }
        case "setUTCDate": day = n(0) ?? .nan
        case "setUTCHours": h = n(0) ?? .nan; if let v = n(1) { mi = v }; if let v = n(2) { s = v }; if let v = n(3) { ms = v }
        case "setUTCMinutes": mi = n(0) ?? .nan; if let v = n(1) { s = v }; if let v = n(2) { ms = v }
        case "setUTCSeconds": s = n(0) ?? .nan; if let v = n(1) { ms = v }
        default: ms = n(0) ?? .nan
        }
        return d.setTime(JSDate.UTC(y, mo, day, h, mi, s, ms))
    case "toISOString": return try d.toISOString()
    case "toJSON": return d.toJSON() ?? jsNull
    case "toString": return d.toString()
    case "toDateString": return d.toDateString()
    case "toTimeString": return d.toTimeString()
    case "toUTCString", "toGMTString": return d.toUTCString()
    case "toLocaleString": return try d.toLocaleString()
    case "toLocaleDateString": return d.toDateString()
    case "toLocaleTimeString": return d.toTimeString()
    default: return nil
    }
}

// MARK: - Proxy

/// `new Proxy(target, handler)`: every operation script performs on it reaches the handler's trap, or the target.
public final class JSProxy: JSDynamic, JSSymbolKeyed, JSDeletable {
    public let target: Any?
    let handler: Any?
    var revoked = false

    init(target: Any?, handler: Any?) {
        self.target = target
        self.handler = handler
    }

    private func trap(_ name: String) throws -> Any? {
        if revoked { throw JSException(JSTypeError("Cannot perform '\(name)' on a proxy that has been revoked")) }
        let t = try jsGet(handler, name)
        return jsIsNullish(t) ? nil : t
    }

    private func keyValue(_ key: String) -> Any? { JSSymbol.of(key: key) ?? key }

    func get(_ key: String, receiver: Any?) throws -> Any? {
        if let t = try trap("get") { return try jsInvoke(t, handler, [target, keyValue(key), receiver]) }
        return try jsGet(target, key)
    }

    func set(_ key: String, _ value: Any?) throws {
        if let t = try trap("set") {
            if !jsIsTruthy(try jsInvoke(t, handler, [target, keyValue(key), value, self])) { throw JSException(JSTypeError("'set' on proxy: trap returned falsish for property '\(jsKeyDescription(key))'")) }
            return
        }
        try jsSet(target, key, value)
    }

    func has(_ key: String) throws -> Bool {
        if let t = try trap("has") { return jsIsTruthy(try jsInvoke(t, handler, [target, keyValue(key)])) }
        return try jsHasProperty(key, target)
    }

    func deleteProperty(_ key: String) throws -> Bool {
        if let t = try trap("deleteProperty") { return jsIsTruthy(try jsInvoke(t, handler, [target, keyValue(key)])) }
        return try jsDeleteKey(target, key, strict: false)
    }

    func ownKeys() throws -> [String] {
        if let t = try trap("ownKeys") { return try jsArgumentList(try jsInvoke(t, handler, [target])).map { jsPropertyKey($0) } }
        return try jsScriptOwnKeys(target, symbols: true, enumerableOnly: false)
    }

    func getOwnPropertyDescriptor(_ key: String) throws -> Any? {
        if let t = try trap("getOwnPropertyDescriptor") { return try jsInvoke(t, handler, [target, keyValue(key)]) }
        return jsScriptOwnDescriptor(target, key)
    }

    func defineProperty(_ key: String, _ descriptor: Any?) throws {
        if let t = try trap("defineProperty") { _ = try jsInvoke(t, handler, [target, keyValue(key), descriptor]); return }
        try jsDefineOwnProperty(target, key, descriptor)
    }

    func getPrototypeOf() throws -> Any? {
        if let t = try trap("getPrototypeOf") { return try jsInvoke(t, handler, [target]) }
        return try jsGetPrototypeOf(target)
    }

    func setPrototypeOf(_ proto: Any?) throws {
        if let t = try trap("setPrototypeOf") { _ = try jsInvoke(t, handler, [target, proto]); return }
        try jsSetPrototypeOf(target, proto)
    }

    public subscript(jsKey key: String) -> Any? {
        get { (try? get(key, receiver: self)) ?? nil }
        set { try? set(key, newValue) }
    }

    /// The enumerable own string keys, as `Object.keys` and JSON read them.
    public var jsKeys: [String] {
        guard let keys = try? ownKeys() else { return [] }
        return keys.filter { key in
            if jsIsSymbolKey(key) { return false }
            guard let d = try? getOwnPropertyDescriptor(key), !jsIsNullish(d) else { return false }
            return jsIsTruthy((try? jsGet(d, "enumerable")) ?? nil)
        }
    }
    public var jsSymbolKeys: [String] { ((try? ownKeys()) ?? []).filter(jsIsSymbolKey) }
    public var jsClassName: String? { nil }
    public func jsDeleteOwn(_ key: String) -> Bool { (try? deleteProperty(key)) ?? false }
}

/// JavaScript `EvalError`.
open class JSEvalError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "EvalError"
    }
}

/// JavaScript `URIError`.
open class JSURIError: JSError {
    public override init(_ message: String = "", cause: Any? = nil) {
        super.init(message, cause: cause)
        name = "URIError"
    }
}

// MARK: - Typed arrays

/// `new Uint8Array(…)` and the others, from their arguments: a length, an array-like or iterable, or a buffer with an offset and length.
func jsTypedArrayFactory(_ name: String) -> (([Any?]) throws -> Any?)? {
    func typed<K: JSTypedArrayElement>(_ type: JSTypedArray<K>.Type) -> ([Any?]) throws -> Any? {
        return { a in
            if let buffer = jsFlat(jsArg(a, 0)) as? JSArrayBuffer, a.count > 1 {
                return try JSTypedArray<K>(buffer: buffer, jsFlat(a[1]) == nil ? nil : jsToNumber(a[1]), a.count > 2 && jsFlat(a[2]) != nil ? jsToNumber(a[2]) : nil)
            }
            if let v = jsFlat(jsArg(a, 0)), jsIsObjectValue(v), !(v is JSArrayProtocol), !(v is JSArrayBuffer), !(v is JSTypedArrayProtocol), !jsIsNullish(try? jsGet(v, JSSymbol.iterator.key)) {
                return try JSTypedArray<K>(try jsItemsOf(v))
            }
            return try JSTypedArray<K>.from(jsArg(a, 0))
        }
    }
    switch name {
    case "Uint8Array": return typed(JSUint8Array.self)
    case "Int8Array": return typed(JSInt8Array.self)
    case "Uint8ClampedArray": return typed(JSUint8ClampedArray.self)
    case "Uint16Array": return typed(JSUint16Array.self)
    case "Int16Array": return typed(JSInt16Array.self)
    case "Uint32Array": return typed(JSUint32Array.self)
    case "Int32Array": return typed(JSInt32Array.self)
    case "Float32Array": return typed(JSFloat32Array.self)
    case "Float64Array": return typed(JSFloat64Array.self)
    case "ArrayBuffer": return { a in try JSArrayBuffer(jsFlat(jsArg(a, 0)) == nil ? 0 : jsToNumber(jsArg(a, 0))) }
    case "DataView":
        return { a in
            guard let buffer = jsFlat(jsArg(a, 0)) as? JSArrayBuffer else { throw JSException(JSTypeError("First argument to DataView constructor must be an ArrayBuffer")) }
            return try JSDataView(buffer: buffer, a.count > 1 ? jsToNumber(a[1]) : nil, a.count > 2 && jsFlat(a[2]) != nil ? jsToNumber(a[2]) : nil)
        }
    default: return nil
    }
}

func jsTypedArrayBytes(_ name: String) -> Double? {
    switch name {
    case "Uint8Array", "Int8Array", "Uint8ClampedArray": return 1
    case "Uint16Array", "Int16Array": return 2
    case "Uint32Array", "Int32Array", "Float32Array": return 4
    case "Float64Array": return 8
    default: return nil
    }
}

/// Random bytes into a typed array's memory.
func jsFillRandom(_ view: JSTypedArrayProtocol) {
    let bytes = view.jsBytes
    guard let base = bytes.baseAddress, bytes.count > 0 else { return }
    if SecRandomCopyBytes(kSecRandomDefault, bytes.count, base) != errSecSuccess {
        for i in 0..<bytes.count { bytes[i] = UInt8.random(in: 0...255) }
    }
}

/// `new URL(input, base)`: the parsed parts as properties, as the WHATWG URL class reads them.
func jsMakeURL(_ input: String, _ base: String?, _ target: JSFunctionObject) throws -> Any? {
    let url: URL?
    if let base { url = URL(string: input, relativeTo: URL(string: base))?.absoluteURL } else { url = URL(string: input) }
    guard let u = url, let scheme = u.scheme, let parts = URLComponents(url: u, resolvingAgainstBaseURL: true) else { throw JSException(JSTypeError("Invalid URL: \(input)")) }
    let o = JSObject()
    o.jsProto = jsPrototypeForNew(target)
    let host = parts.percentEncodedHost ?? ""
    let port = parts.port.map { String($0) } ?? ""
    let path = parts.percentEncodedPath.isEmpty && host != "" ? "/" : parts.percentEncodedPath
    let search = parts.percentEncodedQuery.map { $0.isEmpty ? "" : "?" + $0 } ?? ""
    let hash = parts.percentEncodedFragment.map { $0.isEmpty ? "" : "#" + $0 } ?? ""
    let hostPort = port.isEmpty ? host : "\(host):\(port)"
    let auth = parts.percentEncodedUser.map { u in u + (parts.percentEncodedPassword.map { ":" + $0 } ?? "") + "@" } ?? ""
    let href = "\(scheme):" + (host.isEmpty && !["http", "https", "ftp", "ws", "wss", "file"].contains(scheme) ? "" : "//") + auth + hostPort + path + search + hash
    for (k, v) in [("href", href), ("protocol", scheme + ":"), ("host", hostPort), ("hostname", host), ("port", port), ("pathname", path),
                   ("search", search), ("hash", hash), ("origin", host.isEmpty ? "null" : "\(scheme)://\(hostPort)"),
                   ("username", parts.percentEncodedUser ?? ""), ("password", parts.percentEncodedPassword ?? "")] { o[k] = v }
    let toString = JSFunctionObject("toString", 0, kind: .method) { this, _ in try jsGet(this, "href") }
    o["toString"] = toString
    o["toJSON"] = toString
    try? o.defineProperty("toString", JSPropertyDescriptor(enumerable: false))
    try? o.defineProperty("toJSON", JSPropertyDescriptor(enumerable: false))
    return o
}
