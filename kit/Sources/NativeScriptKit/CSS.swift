import Foundation

/// The app's stylesheet: rules of type, class and compound selectors
/// (`Page`, `.row`, `Label.title`, `*`), ordered by specificity and then
/// source order, as NativeScript's style scope orders them.
struct StyleSheet {
    struct Selector {
        var type: String?
        var classes: [String]
        var specificity: Int

        func matches(_ view: View) -> Bool {
            if let type, type != "*", type.lowercased() != view.cssType.lowercased() { return false }
            return classes.allSatisfy(view.classes.contains)
        }
    }

    struct Rule {
        var selectors: [Selector]
        var declarations: [(name: String, value: String)]
        var order: Int
    }

    static var app = StyleSheet(rules: [])

    var rules: [Rule]

    init(rules: [Rule]) { self.rules = rules }

    init(parsing css: String) {
        var rules: [Rule] = []
        let text = css.replacingOccurrences(of: #"/\*[\s\S]*?\*/"#, with: "", options: .regularExpression)
        var rest = Substring(text)
        while let open = rest.firstIndex(of: "{") {
            let prelude = rest[..<open].trimmingCharacters(in: .whitespacesAndNewlines)
            guard let close = rest[open...].firstIndex(of: "}") else { break }
            let body = rest[rest.index(after: open)..<close]
            rest = rest[rest.index(after: close)...]
            // At-rules (@media, @keyframes) are outside the subset this kit implements.
            if prelude.hasPrefix("@") { continue }
            let selectors = prelude.split(separator: ",").compactMap { StyleSheet.parseSelector(String($0)) }
            guard !selectors.isEmpty else { continue }
            let declarations = body.split(separator: ";").compactMap { declaration -> (String, String)? in
                guard let colon = declaration.firstIndex(of: ":") else { return nil }
                let name = declaration[..<colon].trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
                let value = declaration[declaration.index(after: colon)...].trimmingCharacters(in: .whitespacesAndNewlines)
                return name.isEmpty || value.isEmpty ? nil : (name, value)
            }
            rules.append(Rule(selectors: selectors, declarations: declarations, order: rules.count))
        }
        self.rules = rules
    }

    /// A compound selector; descendant and child combinators are not supported
    /// and their rules never match.
    private static func parseSelector(_ text: String) -> Selector? {
        let s = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !s.isEmpty, !s.contains(where: { $0 == " " || $0 == ">" || $0 == "+" || $0 == "~" || $0 == "[" || $0 == ":" }) else { return nil }
        var parts = s.split(separator: ".", omittingEmptySubsequences: false).map(String.init)
        let type = parts.removeFirst()
        let classes = parts.filter { !$0.isEmpty }
        return Selector(type: type.isEmpty ? nil : type, classes: classes, specificity: (type.isEmpty || type == "*" ? 0 : 1) + classes.count * 100)
    }

    /// The declarations that apply to `view` as view property names, later
    /// values winning; each name keeps the position where it first appeared.
    func values(for view: View) -> [(name: String, value: Any)] {
        var matched: [(specificity: Int, order: Int, declarations: [(name: String, value: String)])] = []
        for rule in rules {
            let best = rule.selectors.filter { $0.matches(view) }.map(\.specificity).max()
            if let best { matched.append((best, rule.order, rule.declarations)) }
        }
        matched.sort { $0.specificity != $1.specificity ? $0.specificity < $1.specificity : $0.order < $1.order }
        var result: [(name: String, value: Any)] = []
        var position: [String: Int] = [:]
        for rule in matched {
            for declaration in rule.declarations {
                for (name, value) in expandShorthand(propertyName(css: declaration.name), declaration.value) {
                    guard let value else { continue }
                    if let index = position[name] {
                        result[index].value = value
                    } else {
                        position[name] = result.count
                        result.append((name, value))
                    }
                }
            }
        }
        return result
    }
}

/// A CSS property name as the view property it sets: `background-color` → `backgroundColor`.
func propertyName(css name: String) -> String {
    switch name {
    case "horizontal-align": return "horizontalAlignment"
    case "vertical-align": return "verticalAlignment"
    case "text-align": return "textAlignment"
    default: break
    }
    var result = ""
    var upper = false
    for c in name {
        if c == "-" { upper = true; continue }
        result.append(upper ? Character(c.uppercased()) : c)
        upper = false
    }
    return result
}

/// Shorthands expanded to the longhands NativeScript stores
/// (`margin`, `padding`, `border-width`, `border-color`, `border-radius`).
func expandShorthand(_ name: String, _ value: Any?) -> [(String, Any?)] {
    func sides(_ prefix: String, _ suffix: String) -> [(String, Any?)] {
        let names = ["Top", "Right", "Bottom", "Left"].map { prefix + $0 + suffix }
        guard let text = value as? String else { return names.map { ($0, value) } }
        let parts = text.split(whereSeparator: { $0 == " " || $0 == "," }).map(String.init)
        let (top, right, bottom, left): (String, String, String, String)
        switch parts.count {
        case 1: (top, right, bottom, left) = (parts[0], parts[0], parts[0], parts[0])
        case 2: (top, right, bottom, left) = (parts[0], parts[1], parts[0], parts[1])
        case 3: (top, right, bottom, left) = (parts[0], parts[1], parts[2], parts[1])
        case 4: (top, right, bottom, left) = (parts[0], parts[1], parts[2], parts[3])
        default: return []
        }
        return zip(names, [top, right, bottom, left]).map { ($0, $1) }
    }
    switch name {
    case "margin": return sides("margin", "")
    case "padding": return sides("padding", "")
    case "borderWidth": return sides("border", "Width")
    case "borderColor":
        // Colors such as rgb(0, 0, 0) contain separators; only a plain value repeats.
        if let text = value as? String, text.contains("(") { return ["Top", "Right", "Bottom", "Left"].map { ("border\($0)Color", text) } }
        return sides("border", "Color")
    case "borderRadius":
        let corners = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]
        guard let text = value as? String else { return corners.map { ($0, value) } }
        let parts = text.split(whereSeparator: { $0 == " " || $0 == "," }).map(String.init)
        let values: [String]
        switch parts.count {
        case 1: values = [parts[0], parts[0], parts[0], parts[0]]
        case 2: values = [parts[0], parts[1], parts[0], parts[1]]
        case 3: values = [parts[0], parts[1], parts[2], parts[1]]
        case 4: values = parts
        default: return []
        }
        return zip(corners, values).map { ($0, $1) }
    case "flex": return expandFlex(value)
    case "flexFlow": return expandFlexFlow(value)
    case "gap": return expandGap(value)
    default:
        return [(name, value)]
    }
}
