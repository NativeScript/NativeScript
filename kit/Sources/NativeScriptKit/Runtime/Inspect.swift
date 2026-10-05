import Foundation

// Node's util.inspect with console.log's defaults (depth 2, breakLength 80, compact 3,
// maxArrayLength 100), following lib/internal/util/inspect.js function by function.

/// `util.inspect(value)`: what `console.log` prints for a non-string argument.
public func jsInspect(_ value: Any?) -> String {
    let context = JSInspectContext()
    return context.formatValue(value, 0)
}

/// `console.log(...)`: strings print raw, other values through `jsInspect`, separated by spaces;
/// a first string argument may hold `%s %d %i %f %j %o %O %c %%` placeholders.
public func jsLog(_ arguments: Any?...) {
    jsWriteStandardOutput(jsFormatLogLine(arguments) + "\n")
}

/// `console.error(...)`, to standard error.
public func jsError(_ arguments: Any?...) {
    jsWriteStandardError(jsFormatLogLine(arguments) + "\n")
}

/// `console.warn(...)`, to standard error.
public func jsWarn(_ arguments: Any?...) {
    jsWriteStandardError(jsFormatLogLine(arguments) + "\n")
}

/// `console.log(...values)`: the arguments spread from one array.
public func jsLog(spread arguments: [Any?]) {
    jsWriteStandardOutput(jsFormatLogLine(arguments) + "\n")
}

/// `console.error(...values)`.
public func jsError(spread arguments: [Any?]) {
    jsWriteStandardError(jsFormatLogLine(arguments) + "\n")
}

func jsWriteStandardOutput(_ text: String) {
    FileHandle.standardOutput.write(Data(text.utf8))
}

func jsWriteStandardError(_ text: String) {
    FileHandle.standardError.write(Data(text.utf8))
}

/// Node's `formatWithOptions`.
public func jsFormatLogLine(_ arguments: [Any?]) -> String {
    let args = arguments.map(jsFlat)
    guard let first = args.first else { return "" }
    var out = ""
    var index = 0
    var separator = ""
    if let format = first as? String {
        if args.count == 1 { return format }
        let units = Array(format.utf16)
        var lastPosition = 0
        var i = 0
        func slice(_ from: Int, _ to: Int) -> String { String(decoding: units[from..<to], as: UTF16.self) }
        while i < units.count - 1 {
            if units[i] == 0x25 {
                i += 1
                let next = units[i]
                if index + 1 != args.count {
                    var replacement: String?
                    switch next {
                    case 0x73:
                        index += 1
                        let argument = args[index]
                        if let n = argument.flatMap(jsNumeric) {
                            replacement = jsInspectNumber(n)
                        } else if let object = argument, jsIsObject(object), !(object is JSNull), !(object is JSError) {
                            let context = JSInspectContext()
                            context.depth = 0
                            replacement = context.formatValue(argument, 0)
                        } else {
                            replacement = jsToString(argument)
                        }
                    case 0x6A:
                        index += 1
                        replacement = jsJSONStringify(args[index]) ?? "undefined"
                    case 0x64:
                        index += 1
                        let argument = args[index]
                        replacement = argument is JSDynamic ? "NaN" : jsInspectNumber(jsToNumber(argument))
                    case 0x4F, 0x6F:
                        index += 1
                        replacement = jsInspect(args[index])
                    case 0x69:
                        index += 1
                        replacement = jsInspectNumber(jsParseInt(jsToString(args[index])))
                    case 0x66:
                        index += 1
                        replacement = jsInspectNumber(jsParseFloat(jsToString(args[index])))
                    case 0x63:
                        index += 1
                        replacement = ""
                    case 0x25:
                        out += slice(lastPosition, i)
                        lastPosition = i + 1
                        i += 1
                        continue
                    default:
                        i += 1
                        continue
                    }
                    if lastPosition != i - 1 { out += slice(lastPosition, i - 1) }
                    out += replacement ?? ""
                    lastPosition = i + 1
                } else if next == 0x25 {
                    out += slice(lastPosition, i)
                    lastPosition = i + 1
                }
            }
            i += 1
        }
        if lastPosition != 0 {
            index += 1
            separator = " "
            if lastPosition < units.count { out += slice(lastPosition, units.count) }
        }
    }
    while index < args.count {
        let value = args[index]
        out += separator
        if let s = value as? String { out += s } else { out += jsInspect(value) }
        separator = " "
        index += 1
    }
    return out
}

func jsInspectNumber(_ n: Double) -> String {
    n == 0 && n.sign == .minus ? "-0" : jsNumberToString(n)
}

/// Node's `strEscape`: single quotes unless the string contains one, escapes for control characters.
func jsInspectQuote(_ s: String) -> String {
    var quote: Unicode.Scalar = "'"
    if s.contains("'") {
        if !s.contains("\"") {
            quote = "\""
        } else if !s.contains("`") && !s.contains("${") {
            quote = "`"
        }
    }
    var out = String(quote)
    for scalar in s.unicodeScalars {
        let c = scalar.value
        if (quote == "'" && c == 0x27) || c == 0x5C || c < 0x20 || (c > 0x7E && c < 0xA0) {
            switch c {
            case 0x27: out += "\\'"
            case 0x5C: out += "\\\\"
            case 0x08: out += "\\b"
            case 0x09: out += "\\t"
            case 0x0A: out += "\\n"
            case 0x0C: out += "\\f"
            case 0x0D: out += "\\r"
            default:
                let hex = String(c, radix: 16, uppercase: true)
                out += "\\x" + (hex.count < 2 ? "0" : "") + hex
            }
        } else {
            out.unicodeScalars.append(scalar)
        }
    }
    out.unicodeScalars.append(quote)
    return out
}

private func jsIsIdentifierKey(_ key: String) -> Bool {
    guard let first = key.utf8.first else { return false }
    func isStart(_ c: UInt8) -> Bool { (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) || c == 0x5F }
    guard isStart(first) else { return false }
    return key.utf8.allSatisfy { isStart($0) || ($0 >= 0x30 && $0 <= 0x39) }
}

/// Node's `getStringWidth` without ICU: wide East Asian and emoji code points count 2,
/// combining marks and zero-width characters 0.
private func jsStringWidth(_ s: String) -> Int {
    var width = 0
    for scalar in s.unicodeScalars {
        let c = scalar.value
        if c < 0x7F {
            if c >= 0x20 { width += 1 }
            continue
        }
        switch c {
        case 0x300...0x36F, 0x200B...0x200F, 0x20D0...0x20FF, 0xFE00...0xFE0F, 0xFE20...0xFE2F, 0xE0100...0xE01EF:
            continue
        case 0x1100...0x115F, 0x2329, 0x232A, 0x2E80...0x3247, 0x3250...0x4DBF, 0x4E00...0xA4C6, 0xA960...0xA97C,
             0xAC00...0xD7A3, 0xF900...0xFAFF, 0xFE10...0xFE19, 0xFE30...0xFE6B, 0xFF01...0xFF60, 0xFFE0...0xFFE6,
             0x1B000...0x1B001, 0x1F200...0x1F251, 0x1F300...0x1F64F, 0x20000...0x3FFFD:
            width += 2
        default:
            width += 1
        }
    }
    return width
}

private enum JSExtrasType {
    case object, array
}

private final class JSInspectContext {
    var depth = 2
    let breakLength = 80
    let compact = 3
    let maxArrayLength = 100
    var indentationLvl = 0
    var currentDepth = 0
    var seen: [ObjectIdentifier] = []
    var circular: [ObjectIdentifier: Int] = [:]

    func formatValue(_ value: Any?, _ recurseTimes: Int) -> String {
        guard let v = jsFlat(value) else { return "undefined" }
        switch v {
        case let s as String: return jsInspectQuote(s)
        case let d as Double: return jsInspectNumber(d)
        case let b as Bool: return b ? "true" : "false"
        case is JSNull: return "null"
        case let d as JSDate: return d.time.isFinite ? ((try? d.toISOString()) ?? "Invalid Date") : "Invalid Date"
        case let r as JSRegExp: return r.toString()
        case let symbol as JSSymbol: return symbol.toString()
        case let big as JSBigInt: return big.toString() + "n"
        default: break
        }
        if let n = jsNumeric(v) { return jsInspectNumber(n) }
        if jsIsFunction(v) { return "[Function (anonymous)]" }
        if jsIsObject(v) {
            let id = ObjectIdentifier(v as AnyObject)
            if seen.contains(id) {
                let index: Int
                if let existing = circular[id] {
                    index = existing
                } else {
                    index = circular.count + 1
                    circular[id] = index
                }
                return "[Circular *\(index)]"
            }
        }
        return formatRaw(v, recurseTimes)
    }

    private func formatRaw(_ value: Any, _ recurseTimes: Int) -> String {
        var base = ""
        var braces = ("{", "}")
        var extrasType = JSExtrasType.object
        var formatter: (Int) -> [String] = { _ in [] }
        var keys: [String] = []
        var keyed: JSDynamic?
        let name: String

        if let array = value as? JSArrayProtocol {
            let elements = array.jsAnyElements
            if elements.isEmpty { return "[]" }
            name = "Array"
            braces = ("[", "]")
            extrasType = .array
            formatter = { self.formatList(elements, $0) }
        } else if let tuple = Mirror(reflecting: value) as Mirror?, tuple.displayStyle == .tuple {
            let elements = tuple.children.map { jsFlat($0.value) }
            if elements.isEmpty { return "[]" }
            name = "Array"
            braces = ("[", "]")
            extrasType = .array
            formatter = { self.formatList(elements, $0) }
        } else if let set = value as? JSSetProtocol {
            let values = set.jsAnyValues
            let prefix = "Set(\(values.count)) "
            if values.isEmpty { return prefix + "{}" }
            name = "Set"
            braces = (prefix + "{", "}")
            formatter = { self.formatSet(values, $0) }
        } else if let map = value as? JSMapProtocol {
            let entries = map.jsAnyEntries
            let prefix = "Map(\(entries.count)) "
            if entries.isEmpty { return prefix + "{}" }
            name = "Map"
            braces = (prefix + "{", "}")
            formatter = { self.formatMap(entries, $0) }
        } else if let promise = value as? JSThenable {
            name = "Promise"
            braces = ("Promise {", "}")
            formatter = { self.formatPromise(promise.jsPromiseState, $0) }
        } else if let error = value as? JSError {
            name = error.name
            keys = error.jsKeys
            keyed = error
            base = formatError(error)
            if keys.isEmpty { return base }
        } else if let weak = value as? JSDynamic & JSWeakCollection {
            return "\(weak.jsClassName ?? "") { <items unknown> }"
        } else if let dynamic = value as? JSDynamic {
            keys = dynamic.jsKeys + ((dynamic as? JSSymbolKeyed)?.jsSymbolKeys ?? [])
            keyed = dynamic
            if var className = dynamic.jsClassName {
                if let tag = (dynamic as? JSToStringTag)?.jsToStringTag, tag != className { className += " [\(tag)]" }
                name = className
                if keys.isEmpty { return "\(className) {}" }
                braces.0 = "\(className) {"
            } else {
                name = "Object"
                if keys.isEmpty { return "{}" }
            }
        } else if jsIsObject(value) {
            let className = String(describing: type(of: value))
            return "\(className) {}"
        } else {
            return String(describing: value)
        }

        if recurseTimes > depth { return "[\(name)]" }

        let level = recurseTimes + 1
        let id = jsIsObject(value) ? ObjectIdentifier(value as AnyObject) : nil
        if let id { seen.append(id) }
        currentDepth = level
        var output = formatter(level)
        if let keyed {
            let accessors = keyed as? JSAccessorKeyed
            for key in keys {
                if let kind = accessors?.jsAccessorKind(key) { output.append("\(jsIsIdentifierKey(key) ? key : jsInspectQuote(key)): [\(kind)]"); continue }
                output.append(formatProperty(key, keyed[jsKey: key], level))
            }
        }
        if id != nil { seen.removeLast() }

        if let id, let index = circular[id] {
            let reference = "<ref *\(index)>"
            base = base.isEmpty ? reference : "\(reference) \(base)"
        }
        return reduceToSingleString(output, base, braces, extrasType, level, value)
    }

    private func formatProperty(_ key: String, _ value: Any?, _ recurseTimes: Int) -> String {
        indentationLvl += 2
        let text = formatValue(value, recurseTimes)
        indentationLvl -= 2
        let name = key == "__proto__" ? "['__proto__']" : JSSymbol.of(key: key).map { $0.toString() } ?? (jsIsIdentifierKey(key) ? key : jsInspectQuote(key))
        return "\(name): \(text)"
    }

    private func remainingText(_ remaining: Int) -> String {
        "... \(remaining) more item\(remaining > 1 ? "s" : "")"
    }

    private func formatList(_ elements: [Any?], _ recurseTimes: Int) -> [String] {
        let count = min(maxArrayLength, elements.count)
        var output: [String] = []
        for i in 0..<count {
            indentationLvl += 2
            output.append(formatValue(elements[i], recurseTimes))
            indentationLvl -= 2
        }
        if elements.count > count { output.append(remainingText(elements.count - count)) }
        return output
    }

    private func formatSet(_ values: [Any?], _ recurseTimes: Int) -> [String] {
        let count = min(maxArrayLength, values.count)
        var output: [String] = []
        indentationLvl += 2
        for value in values.prefix(count) { output.append(formatValue(value, recurseTimes)) }
        if values.count > count { output.append(remainingText(values.count - count)) }
        indentationLvl -= 2
        return output
    }

    private func formatMap(_ entries: [(Any?, Any?)], _ recurseTimes: Int) -> [String] {
        let count = min(maxArrayLength, entries.count)
        var output: [String] = []
        indentationLvl += 2
        for (key, value) in entries.prefix(count) {
            output.append("\(formatValue(key, recurseTimes)) => \(formatValue(value, recurseTimes))")
        }
        if entries.count > count { output.append(remainingText(entries.count - count)) }
        indentationLvl -= 2
        return output
    }

    private func formatPromise(_ state: (state: JSPromiseState, value: Any?), _ recurseTimes: Int) -> [String] {
        switch state.state {
        case .pending:
            return ["<pending>"]
        case .fulfilled, .rejected:
            indentationLvl += 2
            let text = formatValue(state.value, recurseTimes)
            indentationLvl -= 2
            return [state.state == .rejected ? "<rejected> \(text)" : text]
        }
    }

    private func formatError(_ error: JSError) -> String {
        var stack = error.stack
        if !stack.contains("\n    at") { stack = "[\(stack)]" }
        if indentationLvl != 0 {
            stack = stack.replacingOccurrences(of: "\n", with: "\n" + String(repeating: " ", count: indentationLvl))
        }
        return stack
    }

    private func isBelowBreakLength(_ output: [String], _ start: Int, _ base: String) -> Bool {
        var totalLength = output.count + start
        if totalLength + output.count > breakLength { return false }
        for entry in output {
            totalLength += entry.utf16.count
            if totalLength > breakLength { return false }
        }
        return base.isEmpty || !base.contains("\n")
    }

    private func reduceToSingleString(_ output: [String], _ base: String, _ braces: (String, String),
                                      _ extrasType: JSExtrasType, _ recurseTimes: Int, _ value: Any) -> String {
        var output = output
        let entries = output.count
        if extrasType == .array && entries > 6 { output = groupArrayElements(output, value) }
        if currentDepth - recurseTimes < compact && entries == output.count {
            let start = output.count + indentationLvl + braces.0.utf16.count + base.utf16.count + 10
            if isBelowBreakLength(output, start, base) {
                let joined = output.joined(separator: ", ")
                if !joined.contains("\n") {
                    return (base.isEmpty ? "" : base + " ") + braces.0 + " " + joined + " " + braces.1
                }
            }
        }
        let indentation = "\n" + String(repeating: " ", count: indentationLvl)
        return (base.isEmpty ? "" : base + " ") + braces.0 + indentation + "  "
            + output.joined(separator: "," + indentation + "  ") + indentation + braces.1
    }

    private func groupArrayElements(_ output: [String], _ value: Any) -> [String] {
        var totalLength = 0
        var maxLength = 0
        var outputLength = output.count
        if maxArrayLength < output.count { outputLength -= 1 }
        let separatorSpace = 2
        var dataLen = [Int](repeating: 0, count: outputLength)
        for i in 0..<outputLength {
            let len = jsStringWidth(output[i])
            dataLen[i] = len
            totalLength += len + separatorSpace
            if maxLength < len { maxLength = len }
        }
        let actualMax = maxLength + separatorSpace
        guard actualMax * 3 + indentationLvl < breakLength,
              Double(totalLength) / Double(actualMax) > 5 || maxLength <= 6 else { return output }
        let approxCharHeights = 2.5
        let averageBias = (Double(actualMax) - Double(totalLength) / Double(output.count)).squareRoot()
        let biasedMax = max(Double(actualMax) - 3 - averageBias, 1)
        let columns = min(
            Int(jsRound((approxCharHeights * biasedMax * Double(outputLength)).squareRoot() / biasedMax)),
            (breakLength - indentationLvl) / actualMax,
            compact * 4,
            15
        )
        if columns <= 1 { return output }
        var maxLineLength: [Int] = []
        for i in 0..<columns {
            var lineLength = 0
            var j = i
            while j < output.count {
                if j < dataLen.count && dataLen[j] > lineLength { lineLength = dataLen[j] }
                j += columns
            }
            maxLineLength.append(lineLength + separatorSpace)
        }
        var padStart = true
        let elements: [Any?]
        if let array = value as? JSArrayProtocol {
            elements = array.jsAnyElements
        } else {
            elements = Mirror(reflecting: value).children.map { jsFlat($0.value) }
        }
        for i in 0..<output.count {
            let element: Any? = i < elements.count ? elements[i] : nil
            if element.flatMap(jsNumeric) == nil {
                padStart = false
                break
            }
        }
        func pad(_ s: String, _ width: Int, start: Bool) -> String {
            let missing = width - s.utf16.count
            guard missing > 0 else { return s }
            let fill = String(repeating: " ", count: missing)
            return start ? fill + s : s + fill
        }
        var grouped: [String] = []
        var i = 0
        while i < outputLength {
            let maxIndex = min(i + columns, outputLength)
            var line = ""
            var j = i
            while j < maxIndex - 1 {
                let padding = maxLineLength[j - i] + output[j].utf16.count - dataLen[j]
                line += pad(output[j] + ", ", padding, start: padStart)
                j += 1
            }
            if padStart {
                let padding = maxLineLength[j - i] + output[j].utf16.count - dataLen[j] - separatorSpace
                line += pad(output[j], padding, start: true)
            } else {
                line += output[j]
            }
            grouped.append(line)
            i += columns
        }
        if maxArrayLength < output.count { grouped.append(output[outputLength]) }
        return grouped
    }
}
