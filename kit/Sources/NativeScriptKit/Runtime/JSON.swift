import Foundation

// MARK: - JSON.parse

/// `JSON.parse(text)`: objects become `JSObject` (key order kept), arrays `JSArray<Any?>`, numbers
/// `Double`, `null` `jsNull`. Invalid text throws a `JSSyntaxError` with V8's message.
/// Lone surrogates in `\u` escapes become U+FFFD, since a Swift `String` cannot hold them.
public func jsJSONParse(_ text: String) throws -> Any? {
    var parser = JSJSONParser(Array(text.utf16))
    return try parser.parse()
}

private struct JSJSONParser {
    let source: [UInt16]
    var position = 0

    init(_ source: [UInt16]) { self.source = source }

    private enum Container {
        case array(JSArray<Any?>)
        case object(JSObject, key: String)
    }

    mutating func parse() throws -> Any? {
        let special = String(decoding: source, as: UTF16.self)
        if ["undefined", "NaN", "Infinity", "[object Object]"].contains(special) {
            throw JSException(JSSyntaxError("\"\(special)\" is not valid JSON"))
        }
        var stack: [Container] = []
        var value: Any?
        parseValue: while true {
            skipWhitespace()
            guard position < source.count else { throw unexpected() }
            switch source[position] {
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
                    let key = try scanPropertyKey(message: "Expected property name or '}'")
                    stack.append(.object(JSObject(), key: key))
                    continue parseValue
                }
            case 0x5B:
                position += 1
                skipWhitespace()
                if peek() == 0x5D {
                    position += 1
                    value = JSArray<Any?>()
                } else {
                    stack.append(.array(JSArray<Any?>()))
                    continue parseValue
                }
            default:
                throw unexpected()
            }
            while let top = stack.last {
                skipWhitespace()
                switch top {
                case .array(let array):
                    array.storage.append(value)
                    if peek() == 0x2C {
                        position += 1
                        continue parseValue
                    }
                    guard peek() == 0x5D else { throw unexpected(message: "Expected ',' or ']' after array element") }
                    position += 1
                    stack.removeLast()
                    value = array
                case .object(let object, let key):
                    object[key] = value
                    if peek() == 0x2C {
                        position += 1
                        skipWhitespace()
                        let next = try scanPropertyKey(message: "Expected double-quoted property name")
                        stack[stack.count - 1] = .object(object, key: next)
                        continue parseValue
                    }
                    guard peek() == 0x7D else { throw unexpected(message: "Expected ',' or '}' after property value") }
                    position += 1
                    stack.removeLast()
                    value = object
                }
            }
            skipWhitespace()
            if position < source.count { throw JSException(JSSyntaxError("Unexpected non-whitespace character after JSON \(location())")) }
            return value
        }
    }

    private func peek() -> UInt16? { position < source.count ? source[position] : nil }

    private mutating func skipWhitespace() {
        while position < source.count {
            switch source[position] {
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

    private mutating func scanLiteral(_ literal: String) throws {
        for unit in literal.utf16 {
            guard position < source.count else { throw unexpected() }
            guard source[position] == unit else { throw unexpected() }
            position += 1
        }
    }

    private mutating func scanNumber() throws -> Double {
        let start = position
        if source[position] == 0x2D {
            position += 1
            guard let c = peek(), c >= 0x30 && c <= 0x39 else { throw error("No number after minus sign") }
        }
        if source[position] == 0x30 {
            position += 1
            if let c = peek(), c >= 0x30 && c <= 0x39 { throw unexpected() }
        } else {
            while let c = peek(), c >= 0x30 && c <= 0x39 { position += 1 }
        }
        if peek() == 0x2E {
            position += 1
            guard let c = peek(), c >= 0x30 && c <= 0x39 else { throw error("Unterminated fractional number") }
            while let c = peek(), c >= 0x30 && c <= 0x39 { position += 1 }
        }
        if peek() == 0x65 || peek() == 0x45 {
            position += 1
            if peek() == 0x2B || peek() == 0x2D { position += 1 }
            guard let c = peek(), c >= 0x30 && c <= 0x39 else { throw error("Exponent part is missing a number") }
            while let c = peek(), c >= 0x30 && c <= 0x39 { position += 1 }
        }
        return Double(String(decoding: source[start..<position], as: UTF16.self)) ?? .nan
    }

    private mutating func scanString() throws -> String {
        position += 1
        var units: [UInt16] = []
        var segmentStart = position
        while true {
            guard position < source.count else { throw error("Unterminated string") }
            let c = source[position]
            if c == 0x22 {
                units += source[segmentStart..<position]
                position += 1
                return String(decoding: units, as: UTF16.self)
            }
            if c < 0x20 { throw error("Bad control character in string literal") }
            if c != 0x5C {
                position += 1
                continue
            }
            units += source[segmentStart..<position]
            position += 1
            guard position < source.count else { throw unexpected() }
            switch source[position] {
            case 0x22: units.append(0x22)
            case 0x5C: units.append(0x5C)
            case 0x2F: units.append(0x2F)
            case 0x62: units.append(0x08)
            case 0x66: units.append(0x0C)
            case 0x6E: units.append(0x0A)
            case 0x72: units.append(0x0D)
            case 0x74: units.append(0x09)
            case 0x75:
                var code: UInt16 = 0
                for _ in 0..<4 {
                    position += 1
                    guard position < source.count else { throw error("Bad Unicode escape") }
                    let h = source[position]
                    let digit: UInt16
                    switch h {
                    case 0x30...0x39: digit = h - 0x30
                    case 0x61...0x66: digit = h - 0x61 + 10
                    case 0x41...0x46: digit = h - 0x41 + 10
                    default: throw error("Bad Unicode escape")
                    }
                    code = code * 16 + digit
                }
                units.append(code)
            default:
                throw error("Bad escaped character")
            }
            position += 1
            segmentStart = position
        }
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

    private func error(_ message: String) -> JSException {
        JSException(JSSyntaxError("\(message) in JSON \(location())"))
    }

    /// V8's ReportUnexpectedToken: an explicit message wins, then end of input, numbers and
    /// strings, then the offending character with some context.
    private func unexpected(message: String? = nil) -> JSException {
        if let message { return error(message) }
        guard position < source.count else { return JSException(JSSyntaxError("Unexpected end of JSON input")) }
        let c = source[position]
        if c == 0x2D || (c >= 0x30 && c <= 0x39) { return error("Unexpected number") }
        if c == 0x22 { return error("Unexpected string") }
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
public func jsJSONStringify(_ value: Any?, _ indent: Any? = nil) -> String? {
    do {
        return try jsJSONStringifyChecked(value, indent)
    } catch {
        fatalError("\(jsToString(jsCaught(error)))")
    }
}

/// `JSON.stringify(value, null, indent)`, throwing a TypeError for circular structures.
public func jsJSONStringifyChecked(_ value: Any?, _ indent: Any? = nil) throws -> String? {
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
    return try writer.serialize(value, indent: "")
}

private struct JSJSONWriter {
    let gap: String
    var stack: [ObjectIdentifier] = []

    mutating func serialize(_ value: Any?, indent: String) throws -> String? {
        guard let v = jsFlat(value) else { return nil }
        switch v {
        case is JSNull: return "null"
        case let b as Bool: return b ? "true" : "false"
        case let s as String: return jsJSONQuote(s)
        case let d as Double: return d.isFinite ? jsNumberToString(d) : "null"
        case let date as JSDate: return date.toJSON().map(jsJSONQuote) ?? "null"
        case is JSBigInt: throw JSException(JSTypeError("Do not know how to serialize a BigInt"))
        default: break
        }
        if let n = jsNumeric(v) { return n.isFinite ? jsNumberToString(n) : "null" }
        if jsIsFunction(v) { return nil }
        if let array = v as? JSArrayProtocol {
            return try serializeArray(array, array.jsAnyElements, indent: indent)
        }
        if let dynamic = v as? JSDynamic {
            return try serializeObject(dynamic, dynamic.jsKeys.map { ($0, dynamic[jsKey: $0]) }, indent: indent)
        }
        let mirror = Mirror(reflecting: v)
        if mirror.displayStyle == .tuple {
            return try serializeArray(nil, mirror.children.map { jsFlat($0.value) }, indent: indent)
        }
        return "{}"
    }

    private mutating func enter(_ object: AnyObject?) throws {
        guard let object else { return }
        let id = ObjectIdentifier(object)
        if stack.contains(id) { throw JSException(JSTypeError("Converting circular structure to JSON")) }
        stack.append(id)
    }

    private mutating func leave(_ object: AnyObject?) {
        if object != nil { stack.removeLast() }
    }

    private mutating func serializeArray(_ object: AnyObject?, _ elements: [Any?], indent: String) throws -> String {
        try enter(object)
        defer { leave(object) }
        if elements.isEmpty { return "[]" }
        let inner = indent + gap
        var parts: [String] = []
        for element in elements { parts.append(try serialize(element, indent: inner) ?? "null") }
        if gap.isEmpty { return "[" + parts.joined(separator: ",") + "]" }
        return "[\n" + inner + parts.joined(separator: ",\n" + inner) + "\n" + indent + "]"
    }

    private mutating func serializeObject(_ object: AnyObject, _ entries: [(String, Any?)], indent: String) throws -> String {
        try enter(object)
        defer { leave(object) }
        let inner = indent + gap
        var parts: [String] = []
        for (key, value) in entries {
            guard let text = try serialize(value, indent: inner) else { continue }
            parts.append(jsJSONQuote(key) + (gap.isEmpty ? ":" : ": ") + text)
        }
        if parts.isEmpty { return "{}" }
        if gap.isEmpty { return "{" + parts.joined(separator: ",") + "}" }
        return "{\n" + inner + parts.joined(separator: ",\n" + inner) + "\n" + indent + "}"
    }
}

/// QuoteJSONString.
func jsJSONQuote(_ s: String) -> String {
    var out = "\""
    var plainStart = s.unicodeScalars.startIndex
    var index = plainStart
    let scalars = s.unicodeScalars
    while index < scalars.endIndex {
        let c = scalars[index].value
        let escape: String?
        switch c {
        case 0x22: escape = "\\\""
        case 0x5C: escape = "\\\\"
        case 0x08: escape = "\\b"
        case 0x0C: escape = "\\f"
        case 0x0A: escape = "\\n"
        case 0x0D: escape = "\\r"
        case 0x09: escape = "\\t"
        case 0..<0x20:
            let hex = String(c, radix: 16)
            escape = "\\u" + String(repeating: "0", count: 4 - hex.count) + hex
        default: escape = nil
        }
        if let escape {
            out.unicodeScalars.append(contentsOf: scalars[plainStart..<index])
            out += escape
            plainStart = scalars.index(after: index)
        }
        index = scalars.index(after: index)
    }
    out.unicodeScalars.append(contentsOf: scalars[plainStart..<scalars.endIndex])
    return out + "\""
}
