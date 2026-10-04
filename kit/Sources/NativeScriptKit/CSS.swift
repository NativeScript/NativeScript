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
        var animations: [KeyframeAnimationInfo]?
    }

    static var app = StyleSheet(rules: [])

    var rules: [Rule]
    /// `@keyframes` by name; a later block of the same name replaces an earlier one.
    var keyframes: [String: [KeyframeRule]] = [:]

    init(rules: [Rule]) { self.rules = rules }

    init(parsing css: String) {
        var rules: [Rule] = []
        var keyframes: [String: [KeyframeRule]] = [:]
        let text = css.replacingOccurrences(of: #"/\*[\s\S]*?\*/"#, with: "", options: .regularExpression)
        for (prelude, body) in StyleSheet.blocks(Substring(text)) {
            if prelude.hasPrefix("@keyframes") || prelude.hasPrefix("@-webkit-keyframes") {
                let name = prelude.split(separator: " ", maxSplits: 1).dropFirst().first.map { $0.trimmingCharacters(in: .whitespaces) } ?? ""
                keyframes[name] = StyleSheet.blocks(body).map { selector, declarations in
                    KeyframeRule(values: selector.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) },
                                 declarations: StyleSheet.declarations(declarations))
                }
                continue
            }
            // Other at-rules (@media, @supports) are outside the subset this kit implements.
            if prelude.hasPrefix("@") { continue }
            let selectors = prelude.split(separator: ",").compactMap { StyleSheet.parseSelector(String($0)) }
            guard !selectors.isEmpty else { continue }
            let declarations = StyleSheet.declarations(body)
            rules.append(Rule(selectors: selectors, declarations: declarations, order: rules.count,
                              animations: KeyframeAnimationInfo.fromDeclarations(declarations)))
        }
        self.rules = rules
        self.keyframes = keyframes
    }

    /// The top-level `prelude { body }` blocks of `text`, braces matched; statements such as `@import x;` are skipped.
    private static func blocks(_ text: Substring) -> [(String, Substring)] {
        var result: [(String, Substring)] = []
        var rest = text
        while let open = rest.firstIndex(of: "{") {
            if let semicolon = rest[..<open].lastIndex(of: ";") { rest = rest[rest.index(after: semicolon)...]; continue }
            let prelude = rest[..<open].trimmingCharacters(in: .whitespacesAndNewlines)
            var depth = 0
            var close: Substring.Index?
            for index in rest[open...].indices {
                if rest[index] == "{" { depth += 1 } else if rest[index] == "}" {
                    depth -= 1
                    if depth == 0 { close = index; break }
                }
            }
            guard let close else { break }
            result.append((prelude, rest[rest.index(after: open)..<close]))
            rest = rest[rest.index(after: close)...]
        }
        return result
    }

    private static func declarations(_ body: Substring) -> [(name: String, value: String)] {
        body.split(separator: ";").compactMap { declaration -> (String, String)? in
            guard let colon = declaration.firstIndex(of: ":") else { return nil }
            let name = declaration[..<colon].trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let value = declaration[declaration.index(after: colon)...].trimmingCharacters(in: .whitespacesAndNewlines)
            return name.isEmpty || value.isEmpty ? nil : (name, value)
        }
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
    /// `CssState.playKeyframeAnimations`: the matched rules' animations, in cascade order, with their keyframes.
    func keyframeAnimations(for view: View) -> [KeyframeAnimation] {
        let matched = rules.compactMap { rule -> (specificity: Int, order: Int, animations: [KeyframeAnimationInfo])? in
            guard let animations = rule.animations, let best = rule.selectors.filter({ $0.matches(view) }).map(\.specificity).max() else { return nil }
            return (best, rule.order, animations)
        }.sorted { $0.specificity != $1.specificity ? $0.specificity < $1.specificity : $0.order < $1.order }
        return matched.flatMap(\.animations).compactMap { info in
            KeyframeAnimation(info, keyframes[info.name].map(KeyframeInfo.parse))
        }
    }

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
    case "transform": return expandTransform(value)
    case "flex": return expandFlex(value)
    case "flexFlow": return expandFlexFlow(value)
    case "gap": return expandGap(value)
    default:
        return [(name, value)]
    }
}
