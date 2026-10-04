import Foundation

/// The app's stylesheet as NativeScript's style scope uses it: rulesets of
/// selectors (styling/css-selector), `@media` rules matched at query time,
/// and `@keyframes` by name.
struct StyleSheet {
    struct Rule {
        /// Each selector of the ruleset, with its position in source order.
        var selectors: [(selector: CSSSelector, pos: Int)]
        var declarations: [(name: String, value: String)]
        var animations: [KeyframeAnimationInfo]?
        /// Every enclosing `@media` query must match.
        var media: [String]
    }

    /// What a view's match yields: values in cascade order, animations, and
    /// the attributes and pseudo-classes it depends on.
    struct Match {
        var values: [(name: String, value: Any)] = []
        var animations: [KeyframeAnimation] = []
        var changes = CSSChanges()
    }

    static var app = StyleSheet(rules: [])

    var rules: [Rule]
    /// `@keyframes` by name; a later block of the same name replaces an earlier one.
    var keyframes: [String: [KeyframeRule]] = [:]
    private(set) var hasSiblingCombinators = false

    init(rules: [Rule]) { self.rules = rules }

    init(parsing css: String) {
        var rules: [Rule] = []
        var keyframes: [String: [KeyframeRule]] = [:]
        var position = 0
        func parse(_ text: Substring, _ media: [String]) {
            for (prelude, body) in StyleSheet.blocks(text) {
                if prelude.hasPrefix("@keyframes") || prelude.hasPrefix("@-webkit-keyframes") {
                    let name = prelude.split(separator: " ", maxSplits: 1).dropFirst().first.map { $0.trimmingCharacters(in: .whitespaces) } ?? ""
                    keyframes[name] = StyleSheet.blocks(body).map { selector, declarations in
                        KeyframeRule(values: selector.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) },
                                     declarations: StyleSheet.declarations(declarations))
                    }
                    continue
                }
                if prelude.hasPrefix("@media") {
                    parse(body, media + [prelude.dropFirst("@media".count).trimmingCharacters(in: .whitespaces)])
                    continue
                }
                if prelude.hasPrefix("@") { continue }
                var selectors: [(CSSSelector, Int)] = []
                for text in StyleSheet.splitSelectors(prelude) {
                    let selector = SelectorParser.parse(text)
                    guard selector.isValid else { continue }
                    selectors.append((selector, position))
                    position += 1
                }
                let declarations = StyleSheet.declarations(body)
                rules.append(Rule(selectors: selectors, declarations: declarations,
                                  animations: KeyframeAnimationInfo.fromDeclarations(declarations), media: media))
            }
        }
        let text = css.replacingOccurrences(of: #"/\*[\s\S]*?\*/"#, with: "", options: .regularExpression)
        parse(Substring(text), [])
        self.rules = rules
        self.keyframes = keyframes
        hasSiblingCombinators = rules.contains { $0.selectors.contains { $0.selector.hasAdjacentCombinator || $0.selector.hasSiblingCombinator } }
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

    /// A prelude's selectors: commas inside parentheses (`:is(a, b)`) do not split.
    private static func splitSelectors(_ prelude: String) -> [String] {
        var parts: [String] = []
        var current = ""
        var depth = 0
        for c in prelude {
            if c == "(" { depth += 1 } else if c == ")" { depth -= 1 }
            if c == "," && depth == 0 {
                parts.append(current.trimmingCharacters(in: .whitespacesAndNewlines))
                current = ""
            } else {
                current.append(c)
            }
        }
        parts.append(current.trimmingCharacters(in: .whitespacesAndNewlines))
        return parts.filter { !$0.isEmpty }
    }

    /// Declarations with names lowercased, except custom properties, and `!important` dropped.
    private static func declarations(_ body: Substring) -> [(name: String, value: String)] {
        body.split(separator: ";").compactMap { declaration -> (String, String)? in
            guard let colon = declaration.firstIndex(of: ":") else { return nil }
            var name = declaration[..<colon].trimmingCharacters(in: .whitespacesAndNewlines)
            if !name.hasPrefix("--") { name = name.lowercased() }
            var value = declaration[declaration.index(after: colon)...].trimmingCharacters(in: .whitespacesAndNewlines)
            if let important = value.range(of: #"\s*!important$"#, options: .regularExpression) { value.removeSubrange(important) }
            return name.isEmpty || value.isEmpty ? nil : (name, value)
        }
    }

    /// `matchSelectorCandidates` and `CssState.setPropertyValues`: matching
    /// selectors sorted by specificity, then source order; each applies its
    /// ruleset's declarations, a name keeping the position where it first appeared.
    func match(_ view: View) -> Match {
        var result = Match()
        var matched: [(specificity: Int, pos: Int, rule: Int)] = []
        var mediaResults: [String: Bool] = [:]
        for (index, rule) in rules.enumerated() {
            let mediaMatches = rule.media.allSatisfy { query in
                if let known = mediaResults[query] { return known }
                let matches = MediaQuery.matches(query)
                mediaResults[query] = matches
                return matches
            }
            if !mediaMatches { continue }
            for (selector, pos) in rule.selectors {
                if selector.dynamic { StyleSheet.track(selector, view, &result.changes) }
                if selector.match(view) { matched.append((selector.specificity, pos, index)) }
            }
        }
        matched.sort { $0.specificity != $1.specificity ? $0.specificity < $1.specificity : $0.pos < $1.pos }
        var position: [String: Int] = [:]
        for entry in matched {
            let rule = rules[entry.rule]
            for declaration in rule.declarations {
                let name = declaration.name.hasPrefix("--") ? declaration.name : propertyName(css: declaration.name)
                var longhands = expandShorthand(name, declaration.value)
                if isCssExpression(declaration.value), let names = StyleSheet.shorthandLonghands(name) {
                    longhands = names.map { ($0, PendingShorthand(shorthand: name, value: declaration.value)) }
                }
                for (longhand, value) in longhands {
                    guard let value else { continue }
                    if let index = position[longhand] {
                        result.values[index].value = value
                    } else {
                        position[longhand] = result.values.count
                        result.values.append((longhand, value))
                    }
                }
            }
            for info in rule.animations ?? [] {
                if let animation = KeyframeAnimation(info, keyframes[info.name].map(KeyframeInfo.parse)) { result.animations.append(animation) }
            }
        }
        return result
    }

    /// The longhands a shorthand sets, or nil for a property that is not one.
    static func shorthandLonghands(_ name: String) -> [String]? {
        let names = expandShorthand(name, "0").map(\.0)
        return names == [name] ? nil : names
    }

    /// The dependencies of a dynamic selector: a simple one on the view itself
    /// (when its static part may match); a complex one on the view, its
    /// ancestors and, with sibling combinators, their earlier siblings.
    private static func track(_ selector: CSSSelector, _ view: View, _ changes: inout CSSChanges) {
        guard let complex = selector as? ComplexSelector else {
            if selector.mayMatch(view) { selector.trackChanges(view, &changes) }
            return
        }
        var node: View? = view
        while let current = node {
            complex.trackChanges(current, &changes)
            if complex.hasAdjacentCombinator || complex.hasSiblingCombinator {
                for sibling in View.previousSiblings(current) { complex.trackChanges(sibling, &changes) }
            }
            node = current.parent
        }
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
