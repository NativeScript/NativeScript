import Foundation

/// CSS selectors as styling/css-selector builds them from css-what's parse:
/// simple selectors, compound sequences, complex selectors grouped by
/// ancestor and child combinators, and `:not`, `:is`, `:where`.
class CSSSelector {
    enum Combinator: String { case descendant = " ", child = ">", adjacent = "+", sibling = "~" }

    var specificity = 0
    /// Depends on attributes or pseudo-classes, which change without a re-match.
    var dynamic = false
    var hasAdjacentCombinator = false
    var hasSiblingCombinator = false
    var combinator: Combinator?
    var isValid: Bool { true }

    func match(_ view: View) -> Bool { false }
    func mayMatch(_ view: View) -> Bool { match(view) }
    func trackChanges(_ view: View, _ changes: inout CSSChanges) {}
}

/// The attributes and pseudo-classes of a view that a match depends on.
struct CSSChanges {
    var entries: [(view: View, key: String)] = []
    mutating func add(_ view: View, _ key: String) {
        if !entries.contains(where: { $0.view === view && $0.key == key }) { entries.append((view, key)) }
    }
}

final class InvalidSelector: CSSSelector {
    override var isValid: Bool { false }
}

final class UniversalSelector: CSSSelector {
    override func match(_ view: View) -> Bool { true }
}

final class IdSelector: CSSSelector {
    let id: String
    init(_ id: String) { self.id = id; super.init(); specificity = 100 }
    override func match(_ view: View) -> Bool { view.cssId == id }
}

final class TypeSelector: CSSSelector {
    let cssType: String
    init(_ cssType: String) { self.cssType = cssType; super.init(); specificity = 1 }
    override func match(_ view: View) -> Bool { view.cssType.lowercased() == cssType }
}

final class ClassSelector: CSSSelector {
    let cssClass: String
    init(_ cssClass: String) { self.cssClass = cssClass; super.init(); specificity = 10 }
    override func match(_ view: View) -> Bool { view.cssClasses.contains(cssClass) }
}

final class AttributeSelector: CSSSelector {
    let attribute: String, test: String, value: String, ignoreCase: Bool

    init(_ attribute: String, _ test: String, _ value: String, _ ignoreCase: Bool) {
        self.attribute = attribute
        self.test = test
        self.value = ignoreCase ? value.lowercased() : value
        self.ignoreCase = ignoreCase
        super.init()
        specificity = 10
        dynamic = true
    }

    override func match(_ view: View) -> Bool {
        let raw = view.attributeValue(attribute)
        if test == "exists" { return raw != nil }
        if value.isEmpty { return false }
        var attr = jsString(raw)
        if ignoreCase { attr = attr.lowercased() }
        switch test {
        case "equals": return attr == value
        case "start": return attr.hasPrefix(value)
        case "end": return attr.hasSuffix(value)
        case "any": return attr.contains(value)
        case "element": return attr.split(separator: " ", omittingEmptySubsequences: false).contains { $0 == value }
        case "hyphen": return attr == value || attr.hasPrefix(value + "-")
        default: return false
        }
    }

    /// An attribute the view does not carry yet cannot be ruled out.
    override func mayMatch(_ view: View) -> Bool { true }
    override func trackChanges(_ view: View, _ changes: inout CSSChanges) { changes.add(view, attribute) }
}

class PseudoClassSelector: CSSSelector {
    let pseudoClass: String
    init(_ pseudoClass: String) { self.pseudoClass = pseudoClass; super.init(); specificity = 10; dynamic = true }
    override func match(_ view: View) -> Bool { view.pseudoClasses.contains(pseudoClass) }
    override func mayMatch(_ view: View) -> Bool { true }
    override func trackChanges(_ view: View, _ changes: inout CSSChanges) { changes.add(view, ":" + pseudoClass) }
}

/// `:not`, `:is`, `:where`: the specificity of the most specific argument
/// (`:where` none); an invalid argument empties a `:not` list and is skipped by the others.
final class FunctionalPseudoClassSelector: PseudoClassSelector {
    let selectors: [CSSSelector]

    init(_ name: String, _ arguments: [CSSSelector]) {
        var selectors: [CSSSelector] = []
        var highest = 0
        for selector in arguments {
            if !selector.isValid {
                if name == "not" { selectors = []; highest = 0; break }
                continue
            }
            highest = max(highest, selector.specificity)
            selectors.append(selector)
        }
        self.selectors = selectors
        super.init(name)
        specificity = name == "where" ? 0 : highest
        dynamic = selectors.contains { $0.dynamic }
        hasAdjacentCombinator = selectors.contains { $0.hasAdjacentCombinator }
        hasSiblingCombinator = selectors.contains { $0.hasSiblingCombinator }
    }

    override func match(_ view: View) -> Bool {
        pseudoClass == "not" ? !selectors.contains { $0.match(view) } : selectors.contains { $0.match(view) }
    }

    override func trackChanges(_ view: View, _ changes: inout CSSChanges) {
        for selector in selectors { selector.trackChanges(view, &changes) }
    }
}

final class SimpleSelectorSequence: CSSSelector {
    let selectors: [CSSSelector]

    init(_ selectors: [CSSSelector]) {
        self.selectors = selectors
        super.init()
        specificity = selectors.reduce(0) { $0 + $1.specificity }
        dynamic = selectors.contains { $0.dynamic }
        hasAdjacentCombinator = selectors.contains { $0.hasAdjacentCombinator }
        hasSiblingCombinator = selectors.contains { $0.hasSiblingCombinator }
    }

    override func match(_ view: View) -> Bool { selectors.allSatisfy { $0.match(view) } }
    override func mayMatch(_ view: View) -> Bool { selectors.allSatisfy { $0.mayMatch(view) } }
    override func trackChanges(_ view: View, _ changes: inout CSSChanges) {
        for selector in selectors { selector.trackChanges(view, &changes) }
    }
}

final class ComplexSelector: CSSSelector {
    /// Grouped by ancestor combinators, then by child combinators; a child
    /// group's entries are single selectors or runs joined by sibling combinators.
    private var groups: [[[CSSSelector]]] = []
    let selectors: [CSSSelector]

    init?(_ selectors: [CSSSelector]) {
        self.selectors = selectors
        super.init()
        var groups: [[[CSSSelector]]] = []
        for selector in selectors.reversed() {
            switch selector.combinator {
            case nil, .descendant: groups.append([[]])
            case .child: groups[groups.count - 1].append([])
            case .adjacent: hasAdjacentCombinator = true
            case .sibling: hasSiblingCombinator = true
            }
            specificity += selector.specificity
            if selector.dynamic { dynamic = true }
            if selector.hasAdjacentCombinator { hasAdjacentCombinator = true }
            if selector.hasSiblingCombinator { hasSiblingCombinator = true }
            let g = groups.count - 1
            groups[g][groups[g].count - 1].append(selector)
        }
        self.groups = groups
    }

    override func match(_ view: View) -> Bool {
        var node: View? = view
        for (i, group) in groups.enumerated() {
            if i == 0 {
                node = ComplexSelector.matchingNode(group, node!, strict: true)
                if node == nil { return false }
            } else {
                var ancestor = node!.parent
                var matched = false
                while let candidate = ancestor {
                    if let found = ComplexSelector.matchingNode(group, candidate, strict: true) {
                        node = found
                        matched = true
                        break
                    }
                    ancestor = candidate.parent
                }
                if !matched { return false }
            }
        }
        return true
    }

    override func mayMatch(_ view: View) -> Bool { false }

    override func trackChanges(_ view: View, _ changes: inout CSSChanges) {
        for selector in selectors { selector.trackChanges(view, &changes) }
    }

    /// `ChildGroup.getMatchingNode`: each step goes to the parent.
    private static func matchingNode(_ group: [[CSSSelector]], _ start: View, strict: Bool) -> View? {
        var node: View? = start
        for (i, entry) in group.enumerated() {
            if i != 0 { node = node?.parent }
            guard let current = node else { return nil }
            if !(entry.count > 1 ? siblingGroupMatches(entry, current, strict) : (strict ? entry[0].match(current) : entry[0].mayMatch(current))) {
                return nil
            }
        }
        return node
    }

    /// `SiblingGroup.match`: a general sibling combinator does not move the
    /// reference node for the selectors before it, as in NativeScript.
    private static func siblingGroupMatches(_ selectors: [CSSSelector], _ start: View, _ strict: Bool) -> Bool {
        var node: View? = start
        for (i, selector) in selectors.enumerated() {
            let test = { (v: View) in strict ? selector.match(v) : selector.mayMatch(v) }
            if i == 0 {
                guard let current = node, test(current) else { return false }
                continue
            }
            if selector.combinator == .adjacent {
                node = node.flatMap(View.previousSibling)
                guard let current = node, test(current) else { return false }
                continue
            }
            var matching = false
            if let current = node {
                for sibling in View.previousSiblings(current) where test(sibling) {
                    matching = true
                    break
                }
            }
            if !matching { return false }
        }
        return true
    }
}

// MARK: Parsing (css-what's subset, styling/css-selector `createSelector`)

enum SelectorParser {
    /// A selector as NativeScript builds it; anything it cannot use is an `InvalidSelector`.
    static func parse(_ text: String) -> CSSSelector {
        var scanner = Scanner(Array(text))
        guard let lists = scanner.selectorList(), let first = lists.first else { return InvalidSelector() }
        return build(first)
    }

    enum Token {
        case tag(String), universal
        case attribute(name: String, action: String, value: String, ignoreCase: Bool?)
        case pseudo(String, [[Token]]?)
        case pseudoElement
        case combinator(CSSSelector.Combinator?)
    }

    static func build(_ tokens: [Token]) -> CSSSelector {
        if tokens.isEmpty { return InvalidSelector() }
        if tokens.count == 1 { return simple(tokens[0]) }
        var sequences: [CSSSelector] = []
        var current: [Token] = []
        var combinators = 0
        for token in tokens {
            if case let .combinator(combinator) = token {
                guard let combinator else { return InvalidSelector() }
                let sequence = self.sequence(current)
                if !sequence.isValid { return sequence }
                sequence.combinator = combinator
                sequences.append(sequence)
                combinators += 1
                current = []
            } else {
                current.append(token)
            }
        }
        if combinators > 0 {
            if !current.isEmpty {
                let sequence = self.sequence(current)
                if !sequence.isValid { return sequence }
                sequences.append(sequence)
            }
            return ComplexSelector(sequences) ?? InvalidSelector()
        }
        return sequence(current)
    }

    private static func sequence(_ tokens: [Token]) -> CSSSelector {
        if tokens.isEmpty { return InvalidSelector() }
        if tokens.count == 1 { return simple(tokens[0]) }
        var selectors: [CSSSelector] = []
        for token in tokens {
            let selector = simple(token)
            if !selector.isValid { return selector }
            selectors.append(selector)
        }
        return SimpleSelectorSequence(selectors)
    }

    private static func simple(_ token: Token) -> CSSSelector {
        switch token {
        case let .attribute(name, action, value, ignoreCase):
            if name == "class" { return ClassSelector(value) }
            if name == "id" { return IdSelector(value) }
            return AttributeSelector(name, action, value, ignoreCase ?? false)
        case let .tag(name):
            var type = name
            if let dash = type.firstIndex(of: "-") { type.remove(at: dash) }
            return TypeSelector(type.lowercased())
        case let .pseudo(name, data):
            if ["is", "where", "not"].contains(name) {
                return FunctionalPseudoClassSelector(name, (data ?? []).map(build))
            }
            return PseudoClassSelector(name)
        case .universal:
            return UniversalSelector()
        case .pseudoElement, .combinator:
            return InvalidSelector()
        }
    }

    private struct Scanner {
        let chars: [Character]
        var i = 0

        init(_ chars: [Character]) { self.chars = chars }

        var atEnd: Bool { i >= chars.count }
        var peek: Character? { atEnd ? nil : chars[i] }

        mutating func skipWhitespace() { while let c = peek, c.isWhitespace { i += 1 } }

        /// A comma-separated list; nil when css-what would throw.
        mutating func selectorList(until terminator: Character? = nil) -> [[Token]]? {
            var lists: [[Token]] = []
            var tokens: [Token] = []
            skipWhitespace()
            func finalize() -> Bool {
                if case .combinator(.descendant)? = tokens.last { tokens.removeLast() }
                if tokens.isEmpty { return false }
                lists.append(tokens)
                return true
            }
            func traversal(_ combinator: CSSSelector.Combinator?) -> Bool {
                if case .combinator(.descendant)? = tokens.last {
                    tokens[tokens.count - 1] = .combinator(combinator)
                    return true
                }
                if case .combinator? = tokens.last { return false }
                if tokens.isEmpty { return false }
                tokens.append(.combinator(combinator))
                return true
            }
            while let c = peek {
                if let terminator, c == terminator { break }
                switch c {
                case _ where c.isWhitespace:
                    if case .combinator? = tokens.last {} else if !tokens.isEmpty { tokens.append(.combinator(.descendant)) }
                    skipWhitespace()
                case ">", "~", "+", "<":
                    let combinator: CSSSelector.Combinator? = c == ">" ? .child : c == "~" ? .sibling : c == "+" ? .adjacent : nil
                    if !traversal(combinator) { return nil }
                    i += 1
                    skipWhitespace()
                case ".":
                    i += 1
                    tokens.append(.attribute(name: "class", action: "element", value: name(), ignoreCase: nil))
                case "#":
                    i += 1
                    tokens.append(.attribute(name: "id", action: "equals", value: name(), ignoreCase: nil))
                case "[":
                    i += 1
                    guard let attribute = attribute() else { return nil }
                    tokens.append(attribute)
                case ":":
                    if i + 1 < chars.count && chars[i + 1] == ":" {
                        i += 2
                        _ = name()
                        if peek == "(" { _ = parenthesized() }
                        tokens.append(.pseudoElement)
                        continue
                    }
                    i += 1
                    let pseudo = name().lowercased()
                    if ["before", "after", "first-line", "first-letter"].contains(pseudo) {
                        tokens.append(.pseudoElement)
                        continue
                    }
                    var data: [[Token]]?
                    if peek == "(" {
                        if ["has", "not", "matches", "is", "where", "host", "host-context"].contains(pseudo) {
                            i += 1
                            guard let list = selectorList(until: ")"), peek == ")" else { return nil }
                            i += 1
                            data = list
                        } else {
                            _ = parenthesized()
                        }
                    }
                    tokens.append(.pseudo(pseudo, data))
                case ",":
                    if !finalize() { return nil }
                    tokens = []
                    i += 1
                    skipWhitespace()
                case "*":
                    i += 1
                    tokens.append(.universal)
                default:
                    let n = name()
                    if n.isEmpty { return finalize() ? lists : nil }
                    tokens.append(.tag(n))
                }
            }
            return finalize() ? lists : nil
        }

        /// css-what's `getName`: word characters, hyphens, escapes and non-ASCII.
        mutating func name() -> String {
            var result = ""
            while let c = peek {
                if c == "\\" && i + 1 < chars.count {
                    result.append(chars[i + 1])
                    i += 2
                } else if c.isLetter || c.isNumber || c == "_" || c == "-" || (c.unicodeScalars.first?.value ?? 0) >= 0xB0 {
                    result.append(c)
                    i += 1
                } else {
                    break
                }
            }
            return result
        }

        mutating func parenthesized() -> String {
            i += 1
            var depth = 1
            var result = ""
            while let c = peek {
                i += 1
                if c == "(" { depth += 1 }
                if c == ")" {
                    depth -= 1
                    if depth == 0 { break }
                }
                result.append(c)
            }
            return result
        }

        mutating func attribute() -> Token? {
            skipWhitespace()
            let attributeName = name()
            skipWhitespace()
            var action = "exists"
            let actions: [Character: String] = ["~": "element", "^": "start", "$": "end", "*": "any", "!": "not", "|": "hyphen"]
            if let c = peek, let a = actions[c] {
                guard i + 1 < chars.count, chars[i + 1] == "=" else { return nil }
                action = a
                i += 2
                skipWhitespace()
            } else if peek == "=" {
                action = "equals"
                i += 1
                skipWhitespace()
            }
            var value = ""
            var ignoreCase: Bool?
            if action != "exists" {
                if let quote = peek, quote == "\"" || quote == "'" {
                    i += 1
                    while let c = peek, c != quote {
                        if c == "\\" { i += 1 }
                        if let escaped = peek { value.append(escaped) }
                        i += 1
                    }
                    guard peek == quote else { return nil }
                    i += 1
                } else {
                    while let c = peek, !c.isWhitespace, c != "]" {
                        if c == "\\" { i += 1 }
                        if let escaped = peek { value.append(escaped) }
                        i += 1
                    }
                }
                skipWhitespace()
                switch peek?.lowercased() {
                case "i": ignoreCase = true; i += 1; skipWhitespace()
                case "s": ignoreCase = false; i += 1; skipWhitespace()
                default: break
                }
            }
            guard peek == "]" else { return nil }
            i += 1
            return .attribute(name: attributeName, action: action, value: value, ignoreCase: ignoreCase)
        }
    }
}

/// JavaScript's `value + ''` for an attribute selector.
private func jsString(_ value: Any?) -> String {
    switch value {
    case nil: return "undefined"
    case let s as String: return s
    case let d as Double: return js(d)
    case let i as Int: return String(i)
    case let b as Bool: return js(b)
    default: return toText(value) ?? ""
    }
}
