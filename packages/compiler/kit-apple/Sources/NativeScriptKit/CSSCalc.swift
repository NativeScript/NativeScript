import Foundation

/// `calc()` as @csstools/css-calc folds it for NativeScript: numbers, `px` and
/// `%` combine only with their own unit (and `*`, `/` by plain numbers); an
/// expression that does not resolve is left as written.
enum CSSCalc {
    static func evaluate(_ value: String) -> String {
        guard value.contains("calc(") else { return value }
        // `unset` and `infinity` inside calc() stand for 0 and a large number; `dip` is a plain number.
        let text = value.replacingOccurrences(of: #"([0-9]+(\.[0-9]+)?)dip\b"#, with: "$1", options: .regularExpression)
            .replacingOccurrences(of: "unset", with: "0").replacingOccurrences(of: "infinity", with: "999999")
        var result = ""
        var rest = Substring(text)
        while let start = rest.range(of: "calc(") {
            result += rest[..<start.lowerBound]
            var depth = 1
            var index = start.upperBound
            while index < rest.endIndex && depth > 0 {
                if rest[index] == "(" { depth += 1 } else if rest[index] == ")" { depth -= 1 }
                index = rest.index(after: index)
            }
            let expression = rest[start.upperBound..<rest.index(before: index)]
            var parser = Parser(Array(expression))
            if let quantity = parser.expression(), parser.atEnd {
                result += quantity.css
            } else {
                return value
            }
            rest = rest[index...]
        }
        return result + rest
    }

    struct Quantity {
        var value: Double
        var unit: String

        var css: String { js(value) + unit }
    }

    private struct Parser {
        let chars: [Character]
        var i = 0

        init(_ chars: [Character]) { self.chars = chars }

        var atEnd: Bool {
            var j = i
            while j < chars.count && chars[j].isWhitespace { j += 1 }
            return j >= chars.count
        }

        mutating func skip() { while i < chars.count && chars[i].isWhitespace { i += 1 } }

        mutating func expression() -> Quantity? {
            guard var left = term() else { return nil }
            while true {
                skip()
                guard i < chars.count, chars[i] == "+" || chars[i] == "-" else { return left }
                let op = chars[i]
                i += 1
                guard let right = term(), left.unit == right.unit else { return nil }
                left.value = op == "+" ? left.value + right.value : left.value - right.value
            }
        }

        mutating func term() -> Quantity? {
            guard var left = factor() else { return nil }
            while true {
                skip()
                guard i < chars.count, chars[i] == "*" || chars[i] == "/" else { return left }
                let op = chars[i]
                i += 1
                guard let right = factor() else { return nil }
                if op == "*" {
                    if left.unit.isEmpty { left = Quantity(value: left.value * right.value, unit: right.unit) }
                    else if right.unit.isEmpty { left.value *= right.value }
                    else { return nil }
                } else {
                    guard right.unit.isEmpty, right.value != 0 else { return nil }
                    left.value /= right.value
                }
            }
        }

        mutating func factor() -> Quantity? {
            skip()
            guard i < chars.count else { return nil }
            if chars[i] == "(" {
                i += 1
                guard let inner = expression() else { return nil }
                skip()
                guard i < chars.count, chars[i] == ")" else { return nil }
                i += 1
                return inner
            }
            if String(chars[i...].prefix(5)) == "calc(" {
                i += 4
                return factor()
            }
            var number = ""
            if chars[i] == "-" || chars[i] == "+" { number.append(chars[i]); i += 1 }
            while i < chars.count, chars[i].isNumber || chars[i] == "." { number.append(chars[i]); i += 1 }
            guard let value = Double(number) else { return nil }
            var unit = ""
            while i < chars.count, chars[i].isLetter || chars[i] == "%" { unit.append(chars[i]); i += 1 }
            guard unit.isEmpty || unit == "px" || unit == "%" else { return nil }
            return Quantity(value: value, unit: unit)
        }
    }
}
