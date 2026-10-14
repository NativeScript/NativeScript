import Foundation

// MARK: - JSON.parse

/// `JSON.parse(text)`: objects become `JSObject` (key order kept), arrays `JSArray<Any?>`, numbers
/// `Double`, `null` `jsNull`. Invalid text throws a `JSSyntaxError` with V8's message.
/// Lone surrogates in `\u` escapes become U+FFFD, since a Swift `String` cannot hold them.
public func jsJSONParse(_ text: String) throws -> Any? {
    var text = text
    return try text.withUTF8 { bytes in
        var parser = JSJSONParser(bytes)
        return try parser.parse()
    }
}

/// `JSON.parse(text, reviver)`: the reviver sees each value after the values inside it, called on its holder with its key;
/// a value it gives undefined for is deleted. A reviver that is not a function is ignored.
public func jsJSONParse(_ text: String, reviver: Any?) throws -> Any? {
    let value = try jsJSONParse(text)
    guard let function = jsFlat(reviver), jsIsFunction(function) else { return value }
    let root = JSObject()
    root[""] = value
    return try jsJSONInternalize(root, "", reviver)
}

private func jsJSONInternalize(_ holder: Any, _ key: String, _ reviver: Any?) throws -> Any? {
    let value = try jsGet(holder, key)
    switch jsFlat(value) {
    case let array as JSArray<Any?>:
        for i in 0..<array.storage.count where i < array.storage.count {
            array.storage[i] = try jsJSONInternalize(array, String(i), reviver)
        }
    case let object as JSObject:
        for k in object.keys {
            let revived = try jsJSONInternalize(object, k, reviver)
            if jsFlat(revived) == nil { _ = object.delete(k) } else { object[k] = revived }
        }
    default: break
    }
    return try jsInvoke(reviver, holder, [key, value])
}

/// A single pass over the text's UTF-8 bytes, without recursion: the values of the containers still open
/// wait on one stack, and each container is built once, when it closes.
private struct JSJSONParser {
    private let bytes: UnsafeBufferPointer<UInt8>
    private var position = 0
    private var values: [Any?] = []
    private var keys: [String] = []
    private var open: [(isObject: Bool, values: Int, keys: Int)] = []
    /// A string's bytes once an escape means they are no longer a slice of the input.
    private var unescaped: [UInt8] = []

    init(_ bytes: UnsafeBufferPointer<UInt8>) { self.bytes = bytes }

    mutating func parse() throws -> Any? {
        var value: Any?
        parseValue: while true {
            skipWhitespace()
            guard position < bytes.count else { throw unexpected() }
            switch bytes[position] {
            case 0x22:
                value = try scanString()
            case 0x2D, 0x30...0x39:
                value = try scanNumber()
            case 0x74:
                try scanLiteral("true")
                value = true
            case 0x66:
                try scanLiteral("false")
                value = false
            case 0x6E:
                try scanLiteral("null")
                value = jsNull
            case 0x7B:
                position += 1
                skipWhitespace()
                if peek() == 0x7D {
                    position += 1
                    value = JSObject()
                } else {
                    open.append((true, values.count, keys.count))
                    keys.append(try scanPropertyKey(message: "Expected property name or '}'"))
                    continue parseValue
                }
            case 0x5B:
                position += 1
                skipWhitespace()
                if peek() == 0x5D {
                    position += 1
                    value = JSArray<Any?>()
                } else {
                    open.append((false, values.count, keys.count))
                    continue parseValue
                }
            default:
                throw unexpected()
            }
            while let container = open.last {
                values.append(value)
                skipWhitespace()
                if container.isObject {
                    if peek() == 0x2C {
                        position += 1
                        skipWhitespace()
                        keys.append(try scanPropertyKey(message: "Expected double-quoted property name"))
                        continue parseValue
                    }
                    guard peek() == 0x7D else { throw unexpected(message: "Expected ',' or '}' after property value") }
                    position += 1
                    value = JSObject(keys: keys[container.keys...], values: values[container.values...])
                    keys.removeSubrange(container.keys...)
                } else {
                    if peek() == 0x2C {
                        position += 1
                        continue parseValue
                    }
                    guard peek() == 0x5D else { throw unexpected(message: "Expected ',' or ']' after array element") }
                    position += 1
                    value = JSArray<Any?>(Array(values[container.values...]))
                }
                values.removeSubrange(container.values...)
                open.removeLast()
            }
            skipWhitespace()
            if position < bytes.count { throw JSJSONSyntax(bytes, position).error("Unexpected non-whitespace character after JSON") }
            return value
        }
    }

    @inline(__always) private func peek() -> UInt8? { position < bytes.count ? bytes[position] : nil }

    @inline(__always) private func digit(at index: Int) -> UInt8? {
        guard index < bytes.count else { return nil }
        let d = bytes[index] &- 0x30
        return d < 10 ? d : nil
    }

    private mutating func skipWhitespace() {
        while position < bytes.count {
            switch bytes[position] {
            case 0x20, 0x09, 0x0A, 0x0D: position += 1
            default: return
            }
        }
    }

    private mutating func scanPropertyKey(message: String) throws -> String {
        guard peek() == 0x22 else { throw unexpected(message: message) }
        let key = try scanString()
        skipWhitespace()
        guard peek() == 0x3A else { throw unexpected(message: "Expected ':' after property name") }
        position += 1
        return key
    }

    private mutating func scanLiteral(_ literal: StaticString) throws {
        for unit in UnsafeBufferPointer(start: literal.utf8Start, count: literal.utf8CodeUnitCount) {
            guard position < bytes.count, bytes[position] == unit else { throw unexpected() }
            position += 1
        }
    }

    /// Up to 19 significant digits accumulate exactly; with a power of ten within ±22 the result is then one
    /// correctly rounded multiplication or division (Clinger's fast path). Any other number is read by `Double(_:)`.
    private mutating func scanNumber() throws -> Double {
        let start = position
        let negative = bytes[position] == 0x2D
        if negative {
            position += 1
            guard digit(at: position) != nil else { throw error("No number after minus sign") }
        }
        var mantissa: UInt64 = 0
        var significant = 0
        var exponent = 0
        var exact = true
        if bytes[position] == 0x30 {
            position += 1
            if digit(at: position) != nil { throw unexpected() }
        } else {
            while let d = digit(at: position) {
                if significant < 19 { mantissa = mantissa &* 10 &+ UInt64(d); significant += 1 } else { exact = false }
                position += 1
            }
        }
        if peek() == 0x2E {
            position += 1
            guard digit(at: position) != nil else { throw error("Unterminated fractional number") }
            while let d = digit(at: position) {
                if significant < 19 {
                    mantissa = mantissa &* 10 &+ UInt64(d)
                    if mantissa != 0 { significant += 1 }
                    exponent -= 1
                } else {
                    exact = false
                }
                position += 1
            }
        }
        if peek() == 0x65 || peek() == 0x45 {
            position += 1
            if peek() == 0x2B || peek() == 0x2D { position += 1 }
            guard digit(at: position) != nil else { throw error("Exponent part is missing a number") }
            let minus = bytes[position - 1] == 0x2D
            var e = 0
            while let d = digit(at: position) {
                if e < 100_000 { e = e * 10 + Int(d) }
                position += 1
            }
            exponent += minus ? -e : e
        }
        if mantissa == 0 { return negative ? -0.0 : 0 }
        if exact, mantissa <= 1 << 53, (-22...22).contains(exponent) {
            let magnitude = exponent < 0 ? Double(mantissa) / jsPowersOfTen[-exponent] : Double(mantissa) * jsPowersOfTen[exponent]
            return negative ? -magnitude : magnitude
        }
        return Double(String(decoding: UnsafeBufferPointer(rebasing: bytes[start..<position]), as: UTF8.self)) ?? .nan
    }

    private mutating func scanString() throws -> String {
        position += 1
        let start = position
        while position < bytes.count {
            let c = bytes[position]
            if c == 0x22 {
                defer { position += 1 }
                return String(decoding: UnsafeBufferPointer(rebasing: bytes[start..<position]), as: UTF8.self)
            }
            if c == 0x5C { return try scanEscapedString(from: start) }
            if c < 0x20 { throw error("Bad control character in string literal") }
            position += 1
        }
        throw error("Unterminated string")
    }

    /// The rest of a string from its first escape, at `position`; its text so far starts at `start`.
    private mutating func scanEscapedString(from start: Int) throws -> String {
        unescaped.removeAll(keepingCapacity: true)
        var segmentStart = start
        /// A `\u` escape of a high surrogate, waiting for the low surrogate that completes it.
        var high: UInt32?
        func flushHigh() {
            if high != nil { unescaped.append(contentsOf: [0xEF, 0xBF, 0xBD]) }
            high = nil
        }
        while true {
            guard position < bytes.count else { throw error("Unterminated string") }
            let c = bytes[position]
            if c == 0x22 {
                if segmentStart < position { flushHigh() }
                unescaped.append(contentsOf: UnsafeBufferPointer(rebasing: bytes[segmentStart..<position]))
                flushHigh()
                position += 1
                return String(decoding: unescaped, as: UTF8.self)
            }
            if c < 0x20 { throw error("Bad control character in string literal") }
            if c != 0x5C {
                position += 1
                continue
            }
            if segmentStart < position { flushHigh() }
            unescaped.append(contentsOf: UnsafeBufferPointer(rebasing: bytes[segmentStart..<position]))
            position += 1
            guard position < bytes.count else { throw unexpected() }
            let escaped: UInt8
            switch bytes[position] {
            case 0x22: escaped = 0x22
            case 0x5C: escaped = 0x5C
            case 0x2F: escaped = 0x2F
            case 0x62: escaped = 0x08
            case 0x66: escaped = 0x0C
            case 0x6E: escaped = 0x0A
            case 0x72: escaped = 0x0D
            case 0x74: escaped = 0x09
            case 0x75:
                var code: UInt32 = 0
                for _ in 0..<4 {
                    position += 1
                    guard position < bytes.count else { throw error("Bad Unicode escape") }
                    let h = bytes[position]
                    let digit: UInt8
                    switch h {
                    case 0x30...0x39: digit = h - 0x30
                    case 0x61...0x66: digit = h - 0x61 + 10
                    case 0x41...0x46: digit = h - 0x41 + 10
                    default: throw error("Bad Unicode escape")
                    }
                    code = code << 4 | UInt32(digit)
                }
                position += 1
                segmentStart = position
                switch code {
                case 0xD800...0xDBFF:
                    flushHigh()
                    high = code
                case 0xDC00...0xDFFF:
                    if let h = high {
                        appendScalar(0x10000 + ((h - 0xD800) << 10) + (code - 0xDC00))
                        high = nil
                    } else {
                        appendScalar(0xFFFD)
                    }
                default:
                    flushHigh()
                    appendScalar(code)
                }
                continue
            default:
                throw error("Bad escaped character")
            }
            flushHigh()
            unescaped.append(escaped)
            position += 1
            segmentStart = position
        }
    }

    private mutating func appendScalar(_ v: UInt32) {
        switch v {
        case ..<0x80:
            unescaped.append(UInt8(v))
        case ..<0x800:
            unescaped.append(contentsOf: [UInt8(0xC0 | v >> 6), UInt8(0x80 | v & 0x3F)])
        case ..<0x10000:
            unescaped.append(contentsOf: [UInt8(0xE0 | v >> 12), UInt8(0x80 | v >> 6 & 0x3F), UInt8(0x80 | v & 0x3F)])
        default:
            unescaped.append(contentsOf: [UInt8(0xF0 | v >> 18), UInt8(0x80 | v >> 12 & 0x3F), UInt8(0x80 | v >> 6 & 0x3F), UInt8(0x80 | v & 0x3F)])
        }
    }

    private func error(_ message: String) -> JSException {
        JSJSONSyntax(bytes, position).error(message + " in JSON")
    }

    private func unexpected(message: String? = nil) -> JSException {
        JSJSONSyntax(bytes, position).unexpected(message: message)
    }
}

/// Exact powers of ten, for `JSJSONParser.scanNumber`'s fast path.
private let jsPowersOfTen: [Double] = [1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15, 1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22]

/// A syntax error's message, as V8 words it: positions, lines and columns count UTF-16 units, so the error path
/// alone converts the input.
private struct JSJSONSyntax {
    let source: [UInt16]
    let position: Int

    init(_ bytes: UnsafeBufferPointer<UInt8>, _ bytePosition: Int) {
        source = Array(String(decoding: bytes, as: UTF8.self).utf16)
        var units = 0
        for byte in bytes[..<bytePosition] where byte & 0xC0 != 0x80 { units += byte >= 0xF0 ? 2 : 1 }
        position = units
    }

    func error(_ message: String) -> JSException {
        JSException(JSSyntaxError("\(message) \(location())"))
    }

    private func location() -> String {
        var line = 1
        var lineStart = 0
        var i = 0
        while i < position {
            if source[i] == 0x0D && i < position - 1 && source[i + 1] == 0x0A { i += 1 }
            if source[i] == 0x0D || source[i] == 0x0A {
                line += 1
                lineStart = i + 1
            }
            i += 1
        }
        return "at position \(position) (line \(line) column \(1 + position - lineStart))"
    }

    /// V8's ReportUnexpectedToken: the input that is a special value's string form, then an explicit message,
    /// end of input, numbers and strings, then the offending character with some context.
    func unexpected(message: String?) -> JSException {
        let special = String(decoding: source, as: UTF16.self)
        if ["undefined", "NaN", "Infinity", "[object Object]"].contains(special) {
            return JSException(JSSyntaxError("\"\(special)\" is not valid JSON"))
        }
        if let message { return error(message + " in JSON") }
        guard position < source.count else { return JSException(JSSyntaxError("Unexpected end of JSON input")) }
        let c = source[position]
        if c == 0x2D || (c >= 0x30 && c <= 0x39) { return error("Unexpected number in JSON") }
        if c == 0x22 { return error("Unexpected string in JSON") }
        let token = String(decoding: [c], as: UTF16.self)
        let context = 10
        let text: String
        if source.count <= 2 * context + 1 {
            text = "\"\(String(decoding: source, as: UTF16.self))\""
        } else if position < context {
            text = "\"\(String(decoding: source[0..<position + context], as: UTF16.self))\"..."
        } else if position < source.count - context {
            text = "...\"\(String(decoding: source[(position - context)..<(position + context)], as: UTF16.self))\"..."
        } else {
            text = "...\"\(String(decoding: source[(position - context)...], as: UTF16.self))\""
        }
        return JSException(JSSyntaxError("Unexpected token '\(token)', \(text) is not valid JSON"))
    }
}

// MARK: - JSON.stringify

/// `JSON.stringify(value, null, indent)`; nil is JavaScript's `undefined` result. `indent` is a
/// number of spaces (at most 10) or a string (its first 10 characters). A cycle traps;
/// `jsJSONStringifyChecked` throws the TypeError instead.
public func jsJSONStringify(_ value: Any?, _ indent: Any? = nil, replacer: Any? = nil) -> String? {
    do {
        return try jsJSONStringifyChecked(value, indent, replacer: replacer)
    } catch {
        fatalError("\(jsToString(jsCaught(error)))")
    }
}

/// `JSON.stringify(value, replacer, indent)`, throwing a TypeError for circular structures. A function replacer is
/// called on each value's holder with its key; an array replacer lists the object keys kept.
public func jsJSONStringifyChecked(_ value: Any?, _ indent: Any? = nil, replacer: Any? = nil) throws -> String? {
    var gap = ""
    switch jsFlat(indent) {
    case let s as String:
        gap = String(decoding: Array(s.utf16.prefix(10)), as: UTF16.self)
    case let v?:
        if let n = jsNumeric(v) {
            let count = min(10, jsToIntegerOrInfinity(n))
            if count >= 1 { gap = String(repeating: " ", count: Int(count)) }
        }
    default:
        break
    }
    var writer = JSJSONWriter(gap: gap)
    switch jsFlat(replacer) {
    case let list as JSArrayProtocol:
        var keys: [String] = []
        for item in list.jsAnyElements {
            let key: String? = switch jsFlat(item) { case let s as String: s; case let d as Double: jsNumberToString(d); default: nil }
            if let key, !keys.contains(key) { keys.append(key) }
        }
        writer.allowed = keys
    case let f? where jsIsFunction(f): writer.replacer = f
    default: break
    }
    // The holder is only observable as a replacer's `this`.
    let holder: AnyObject? = writer.replacer == nil ? nil : JSObject(dictionaryLiteral: ("", value))
    guard try writer.property(holder, "", value) else { return nil }
    return writer.text
}

/// A value with its own `toJSON()`, which JSON.stringify serializes in its place.
public protocol JSToJSONConvertible: AnyObject {
    func jsToJSON(_ key: String) throws -> Any?
}

/// What JSON.stringify does with an instance of a class, found once per class: casts to the runtime's
/// protocols look up conformances, and a value cast to one only to fail costs as much as one that succeeds.
private enum JSJSONClassKind {
    case null, plainObject, numbers, strings, values, array, match, toJSON, date, function, other
    /// A dynamic object whose `toJSON` is looked up; an error's is not.
    case dynamic, error
}

/// SerializeJSONProperty over one output buffer of UTF-8.
private struct JSJSONWriter {
    private let gap: [UInt8]
    private let output = JSUTF8Buffer()
    private var depth = 0
    private var stack: [ObjectIdentifier] = []
    private var kinds: [ObjectIdentifier: JSJSONClassKind] = [:]
    var replacer: Any?
    var allowed: [String]?

    init(gap: String) { self.gap = Array(gap.utf8) }

    var text: String { output.string }

    /// `value`, the property `key` of `holder`, after its `toJSON` and the replacer; false, writing nothing, when
    /// it serializes to undefined.
    mutating func property(_ holder: AnyObject?, _ key: @autoclosure () -> String, _ value: Any?) throws -> Bool {
        var v = jsFlat(value)
        if let value = v, jsIsClassInstance(value) {
            let object = jsObjectReference(value)
            let kind = kind(of: object)
            switch kind {
            case .plainObject:
                let plain = unsafeDowncast(object, to: JSObject.self)
                if let f = jsFlat(plain["toJSON"]), jsIsFunction(f) {
                    v = try jsInvoke(f, plain, [key()])
                } else if replacer == nil {
                    try members(plain, plain.keys) { plain[$0] }
                    return true
                }
            case .dynamic:
                let dynamic = object as! JSDynamic
                if let f = jsFlat(dynamic[jsKey: "toJSON"]), jsIsFunction(f) {
                    v = try jsInvoke(f, dynamic, [key()])
                } else if replacer == nil {
                    try members(dynamic, dynamic.jsKeys) { dynamic[jsKey: $0] }
                    return true
                }
            case .toJSON: v = try (object as! JSToJSONConvertible).jsToJSON(key())
            case .date: v = unsafeDowncast(object, to: JSDate.self).toJSON() ?? jsNull
            default: if replacer == nil { return try write(object: object, kind) }
            }
        }
        if let replacer { v = try jsFlat(jsInvoke(replacer, holder, [key(), v])) }
        guard let v else { return false }
        return try write(v)
    }

    private mutating func kind(of object: AnyObject) -> JSJSONClassKind {
        let type = ObjectIdentifier(Swift.type(of: object))
        if let known = kinds[type] { return known }
        let kind: JSJSONClassKind = switch object {
        case is JSNull: .null
        case is JSObject: .plainObject
        case is JSToJSONConvertible: .toJSON
        case is JSArray<Double>: .numbers
        case is JSArray<String>: .strings
        case is JSArray<Any?>: .values
        case is JSArrayProtocol: .array
        case is JSMatch: .match
        case is JSDate: .date
        case let f where jsIsFunction(f): .function
        case is JSError: .error
        case is JSDynamic: .dynamic
        default: .other
        }
        kinds[type] = kind
        return kind
    }

    /// A value after `toJSON` and the replacer; false, writing nothing, when it serializes to undefined.
    private mutating func write(_ value: Any) throws -> Bool {
        if jsIsClassInstance(value) {
            let object = jsObjectReference(value)
            return try write(object: object, kind(of: object))
        }
        let output = self.output
        /// The value opened: its type tested against String's and Double's is a comparison of metadata,
        /// where a cast from `Any` is a call into the runtime.
        func scalar<T>(_ value: T) -> Bool {
            if T.self == String.self { output.appendJSONString(unsafeBitCast(value, to: String.self)) }
            else if T.self == Double.self { output.appendJSONNumber(unsafeBitCast(value, to: Double.self)) }
            else if T.self == Bool.self { output.append(unsafeBitCast(value, to: Bool.self) ? "true" : "false") }
            else { return false }
            return true
        }
        if _openExistential(value, do: scalar) { return true }
        if value is JSBigInt { throw JSException(JSTypeError("Do not know how to serialize a BigInt")) }
        if let n = jsNumeric(value) {
            output.appendJSONNumber(n)
        } else if jsIsFunction(value) {
            return false
        } else if jsIsTuple(value) {
            try array(nil, Mirror(reflecting: value).children.map { jsFlat($0.value) })
        } else {
            return try writeBridged(value)
        }
        return true
    }

    private mutating func write(object: AnyObject, _ kind: JSJSONClassKind) throws -> Bool {
        switch kind {
        case .null:
            output.append("null")
        case .plainObject:
            let plain = unsafeDowncast(object, to: JSObject.self)
            try members(plain, plain.keys) { plain[$0] }
        case .dynamic, .error:
            let dynamic = object as! JSDynamic
            try members(dynamic, dynamic.jsKeys) { dynamic[jsKey: $0] }
        case .numbers:
            let array = unsafeDowncast(object, to: JSArray<Double>.self)
            array.track()
            try elements(array, array.storage.count) { array.storage[$0] }
        case .strings:
            let array = unsafeDowncast(object, to: JSArray<String>.self)
            array.track()
            try elements(array, array.storage.count) { jsIsHoleString(array.storage[$0]) ? nil : array.storage[$0] }
        case .values where unsafeDowncast(object, to: JSArray<Any?>.self).jsTracker == nil:
            let array = unsafeDowncast(object, to: JSArray<Any?>.self)
            try elements(array, array.storage.count) { array.storage[$0] }
        case .match:
            let values = unsafeDowncast(object, to: JSMatch.self).values
            try elements(values, values.storage.count) { values.storage[$0] }
        case .values, .array:
            let array = object as! JSArrayProtocol
            let values = array.jsAnyElements
            try elements(array, values.count) { values[$0] }
        case .date:
            guard let iso = unsafeDowncast(object, to: JSDate.self).toJSON() else { output.append("null"); break }
            output.appendJSONString(iso)
        case .function:
            return false
        case .toJSON, .other:
            return try writeBridged(object)
        }
        return true
    }

    /// A value of a type outside the runtime's own: a Swift number of another width, an Objective-C string
    /// or number, a struct (an empty object).
    private mutating func writeBridged(_ value: Any) throws -> Bool {
        switch value {
        case let s as String: output.appendJSONString(s)
        case let b as Bool: output.append(b ? "true" : "false")
        case let n where jsNumeric(n) != nil: output.appendJSONNumber(jsNumeric(n)!)
        case let array as JSArrayProtocol:
            let values = array.jsAnyElements
            try elements(array, values.count) { values[$0] }
        case let dynamic as JSDynamic:
            try members(dynamic, dynamic.jsKeys) { dynamic[jsKey: $0] }
        default: output.append("{}")
        }
        return true
    }

    private mutating func enter(_ object: AnyObject?) throws {
        guard let object else { return }
        try jsCheckStack()
        let id = ObjectIdentifier(object)
        if stack.contains(id) { throw JSException(JSTypeError("Converting circular structure to JSON")) }
        stack.append(id)
    }

    private mutating func leave(_ object: AnyObject?) {
        if object != nil { stack.removeLast() }
    }

    private mutating func array(_ object: AnyObject?, _ values: [Any?]) throws {
        try elements(object, values.count) { values[$0] }
    }

    /// SerializeJSONArray: an element that serializes to undefined is `null`.
    private mutating func elements(_ object: AnyObject?, _ count: Int, _ element: (Int) -> Any?) throws {
        try enter(object)
        defer { leave(object) }
        guard count > 0 else { return output.append("[]") }
        output.append(0x5B)
        depth += 1
        for i in 0..<count {
            if i > 0 { output.append(0x2C) }
            newline()
            if try !property(object, String(i), element(i)) { output.append("null") }
        }
        depth -= 1
        newline()
        output.append(0x5D)
    }

    /// SerializeJSONObject: each key's value read as it is serialized; one that serializes to undefined is left out.
    private mutating func members(_ object: AnyObject, _ keys: [String], _ member: (String) -> Any?) throws {
        try enter(object)
        defer { leave(object) }
        output.append(0x7B)
        depth += 1
        var empty = true
        for key in allowed ?? keys {
            if allowed != nil, !keys.contains(key) { continue }
            let start = output.count
            if !empty { output.append(0x2C) }
            newline()
            output.appendJSONString(key)
            output.append(0x3A)
            if !gap.isEmpty { output.append(0x20) }
            if try property(object, key, member(key)) { empty = false } else { output.truncate(to: start) }
        }
        depth -= 1
        if !empty { newline() }
        output.append(0x7D)
    }

    @inline(__always) private func newline() {
        guard !gap.isEmpty else { return }
        output.append(0x0A)
        for _ in 0..<depth { gap.withUnsafeBufferPointer { output.append($0) } }
    }
}

/// A Swift class instance or an Objective-C object, read from the value's type metadata without a cast.
@inline(__always) private func jsIsClassInstance(_ value: Any) -> Bool {
    let kind = jsTypeKind(value)
    return kind == .swiftClass || kind == .objCClass
}

/// The object a value `jsIsClassInstance` holds, without the bridging `as AnyObject` would consider.
@inline(__always) private func jsObjectReference(_ value: Any) -> AnyObject {
    func reference<T>(_ object: T) -> AnyObject { unsafeBitCast(object, to: AnyObject.self) }
    return _openExistential(value, do: reference)
}

/// QuoteJSONString's escapes of `bytes`, UTF-8, appended to `output`: runs that need none are copied whole,
/// found eight bytes at a time.
private func jsJSONEscape(_ bytes: UnsafeBufferPointer<UInt8>, into output: JSUTF8Buffer) {
    guard let base = bytes.baseAddress else { return }
    var run = 0
    var index = 0
    while index < bytes.count {
        if index + 8 <= bytes.count, !jsNeedsEscape(UnsafeRawPointer(base + index).loadUnaligned(as: UInt64.self)) {
            index += 8
            continue
        }
        let c = base[index]
        index += 1
        guard c < 0x20 || c == 0x22 || c == 0x5C else { continue }
        output.append(UnsafeBufferPointer(start: base + run, count: index - 1 - run))
        output.append(0x5C)
        switch c {
        case 0x22, 0x5C: output.append(c)
        case 0x08: output.append(0x62)
        case 0x0C: output.append(0x66)
        case 0x0A: output.append(0x6E)
        case 0x0D: output.append(0x72)
        case 0x09: output.append(0x74)
        default:
            let hex: StaticString = "0123456789abcdef"
            output.append("u00")
            output.append(hex.utf8Start[Int(c >> 4)])
            output.append(hex.utf8Start[Int(c & 0xF)])
        }
        run = index
    }
    output.append(UnsafeBufferPointer(start: base + run, count: bytes.count - run))
}

/// Whether any of the eight bytes in `word` is below 0x20, a quote or a backslash (each test sets a byte's high bit).
@inline(__always) private func jsNeedsEscape(_ word: UInt64) -> Bool {
    let ones: UInt64 = 0x0101_0101_0101_0101, highs: UInt64 = 0x8080_8080_8080_8080
    func zeroByte(_ x: UInt64) -> UInt64 { (x &- ones) & ~x & highs }
    let control = (word &- ones &* 0x20) & ~word & highs
    return control | zeroByte(word ^ (ones &* 0x22)) | zeroByte(word ^ (ones &* 0x5C)) != 0
}

/// QuoteJSONString.
func jsJSONQuote(_ s: String) -> String {
    let output = JSUTF8Buffer(capacity: s.utf8.count + 2)
    output.appendJSONString(s)
    return output.string
}

extension JSUTF8Buffer {
    /// Number::toString. Integers below 2^53 are written digit by digit, and a number with at most three decimals
    /// is found as the integer of its hundredths (say) whose quotient is the same double: what parsing those digits
    /// would give, so that they are its shortest round-trip form. Other fractions take Swift's shortest digits,
    /// which JavaScript prints the same wherever neither uses an exponent.
    func appendJSONNumber(_ d: Double) {
        guard d.isFinite else { return append("null") }
        if d.rounded(.towardZero) == d {
            guard d.magnitude < 9_007_199_254_740_992 else { return append(jsNumberToString(d)) }
            append(integer: Int64(d))
            return
        }
        if d.magnitude < 1e9 {
            var scale = 10.0
            for decimals in 1...3 {
                let scaled = (d * scale).rounded()
                if scaled / scale == d {
                    append(decimal: Int64(scaled), decimals: decimals)
                    return
                }
                scale *= 10
            }
        }
        let digits = d.description
        append((digits.utf8.contains(0x65) ? jsNumberToString(d) : digits))
    }

    /// QuoteJSONString.
    func appendJSONString(_ s: String) {
        append(0x22)
        if s.utf8.withContiguousStorageIfAvailable({ jsJSONEscape($0, into: self) }) == nil {
            Array(s.utf8).withUnsafeBufferPointer { jsJSONEscape($0, into: self) }
        }
        append(0x22)
    }
}

/// UTF-8 text written a byte or a run at a time, into storage that doubles as it fills: an array would check
/// that its storage is unshared on every append.
private final class JSUTF8Buffer {
    private var base: UnsafeMutablePointer<UInt8>
    private var capacity: Int
    private(set) var count = 0

    init(capacity: Int = 256) {
        self.capacity = capacity
        base = .allocate(capacity: capacity)
    }

    deinit { base.deallocate() }

    var string: String { String(decoding: UnsafeBufferPointer(start: base, count: count), as: UTF8.self) }

    @inline(__always) func append(_ byte: UInt8) {
        if count == capacity { grow(to: count + 1) }
        base[count] = byte
        count += 1
    }

    @inline(__always) func append(_ bytes: UnsafeBufferPointer<UInt8>) {
        guard let source = bytes.baseAddress else { return }
        if count + bytes.count > capacity { grow(to: count + bytes.count) }
        (base + count).update(from: source, count: bytes.count)
        count += bytes.count
    }

    @inline(__always) func append(_ text: StaticString) {
        append(UnsafeBufferPointer(start: text.utf8Start, count: text.utf8CodeUnitCount))
    }

    func append(_ text: String) {
        var text = text
        text.withUTF8 { append($0) }
    }

    /// `n`'s decimal digits.
    func append(integer n: Int64) {
        append(decimal: n, decimals: 0)
    }

    /// `n` divided by 10^`decimals`, in JavaScript's form: no trailing zeros after the point, and a zero before it.
    func append(decimal n: Int64, decimals: Int) {
        if n < 0 { append(0x2D) }
        var magnitude = n.magnitude
        var digits = 0
        let start = count
        var fraction = decimals
        while fraction > 0, magnitude % 10 == 0 { magnitude /= 10; fraction -= 1 }
        repeat {
            if digits == fraction && fraction > 0 { append(0x2E) }
            append(UInt8(truncatingIfNeeded: 0x30 + magnitude % 10))
            magnitude /= 10
            digits += 1
        } while magnitude > 0 || digits <= fraction
        var written = UnsafeMutableBufferPointer(start: base + start, count: count - start)
        written.reverse()
    }

    func truncate(to n: Int) { count = n }

    @inline(never) private func grow(to needed: Int) {
        let larger = max(needed, capacity * 2)
        let moved = UnsafeMutablePointer<UInt8>.allocate(capacity: larger)
        moved.moveInitialize(from: base, count: count)
        base.deallocate()
        base = moved
        capacity = larger
    }
}
