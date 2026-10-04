import UIKit

/// css-mediaquery's `matchQuery` with the values media-query-list's
/// `checkIfMediaQueryMatches` passes: screen size in device pixels,
/// orientation and color scheme. An invalid query never matches.
enum MediaQuery {
    static func matches(_ query: String) -> Bool {
        let screen = UIScreen.main
        let width = Double(screen.bounds.width * screen.scale)
        let height = Double(screen.bounds.height * screen.scale)
        let values: [String: Any] = [
            "type": "screen",
            "width": width, "height": height, "device-width": width, "device-height": height,
            "orientation": Appearance.orientation,
            "prefers-color-scheme": Appearance.systemAppearance,
        ]
        guard let expressions = parse(query) else { return false }
        return expressions.contains { expression in
            let typeMatch = expression.type == "all" || expression.type == "screen"
            if (typeMatch && expression.inverse) || !(typeMatch || expression.inverse) { return false }
            let featuresMatch = expression.features.allSatisfy { feature in
                guard let value = values[feature.property] else { return false }
                switch feature.property {
                case "orientation", "prefers-color-scheme":
                    guard let text = value as? String else { return false }
                    return text.lowercased() == feature.value.lowercased()
                default:
                    guard let number = value as? Double else { return false }
                    guard ["width", "height", "device-width", "device-height"].contains(feature.property) else { return false }
                    let target = Length(feature.value, default: .zero).toDevicePixels(auto: 0)
                    switch feature.modifier {
                    case "min": return number >= target
                    case "max": return number <= target
                    default: return number == target
                    }
                }
            }
            return featuresMatch != expression.inverse
        }
    }

    private struct Expression {
        var inverse: Bool
        var type: String
        var features: [(modifier: String?, property: String, value: String)] = []
    }

    /// `parseQuery`; nil where it would throw.
    private static func parse(_ mediaQuery: String) -> [Expression]? {
        var result: [Expression] = []
        for raw in mediaQuery.split(separator: ",", omittingEmptySubsequences: false) {
            let query = raw.trimmingCharacters(in: .whitespaces)
            let pattern = #"^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$"#
            guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
                  let match = regex.firstMatch(in: query, range: NSRange(query.startIndex..., in: query)) else { return nil }
            func group(_ i: Int) -> String? { Range(match.range(at: i), in: query).map { String(query[$0]) } }
            let modifier = group(1), type = group(2)
            let knownTypes = ["all", "print", "screen"]
            var expression = Expression(inverse: modifier?.lowercased() == "not",
                                        type: type.map { knownTypes.contains($0.lowercased()) ? $0.lowercased() : "all" } ?? "all")
            let featureString = ((group(3) ?? "") + (group(4) ?? "")).trimmingCharacters(in: .whitespaces)
            if !featureString.isEmpty {
                let featureRegex = try! NSRegularExpression(pattern: #"\([^\)]+\)"#)
                let features = featureRegex.matches(in: featureString, range: NSRange(featureString.startIndex..., in: featureString))
                if features.isEmpty { return nil }
                let expressionRegex = try! NSRegularExpression(pattern: #"^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$"#)
                for feature in features {
                    let text = String(featureString[Range(feature.range, in: featureString)!])
                    guard let captures = expressionRegex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) else { return nil }
                    let name = String(text[Range(captures.range(at: 1), in: text)!]).lowercased()
                    let value = Range(captures.range(at: 2), in: text).map { String(text[$0]) } ?? ""
                    var modifier: String?
                    var property = name
                    if name.hasPrefix("min-") { modifier = "min"; property = String(name.dropFirst(4)) }
                    else if name.hasPrefix("max-") { modifier = "max"; property = String(name.dropFirst(4)) }
                    expression.features.append((modifier, property, value))
                }
            }
            result.append(expression)
        }
        return result
    }
}
