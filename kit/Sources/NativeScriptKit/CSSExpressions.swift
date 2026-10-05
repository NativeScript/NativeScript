import Foundation

/// A shorthand whose value holds `var()` or `calc()`: each longhand waits for
/// the value to be evaluated against the view (`CssPendingSubstitution`).
struct PendingShorthand {
    let shorthand: String
    let value: String
}

func isCssExpression(_ value: Any) -> Bool {
    guard let text = value as? String else { return false }
    return text.contains("var(--") || text.contains("calc(")
}

extension View {
    /// `Style.getCssVariable`: this view's variables, then its ancestors'.
    func cssVariable(_ name: String) -> String? {
        scopedCssVariables[name] ?? parent?.cssVariable(name)
    }

    /// `evaluateCssExpressions`: variables substituted, then `calc()`; nil for `unset`.
    func evaluateCssExpressions(_ value: String) -> String? {
        let substituted = evaluateCssVariableExpression(value)
        if substituted == "unset" { return nil }
        return CSSCalc.evaluate(substituted)
    }

    /// `_evaluateCssVariableExpression`: the innermost `var()` first; a missing
    /// variable takes the first comma part of its evaluated fallback, else `unset`.
    func evaluateCssVariableExpression(_ value: String) -> String {
        guard value.contains("var(--") else { return value }
        var output = value.trimmingCharacters(in: .whitespaces)
        var last: String?
        while last != output {
            last = output
            guard let start = output.range(of: "var(", options: .backwards),
                  let end = output.range(of: ")", range: start.upperBound..<output.endIndex) else { continue }
            var parts = output[start.upperBound..<end.lowerBound].split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
            let name = parts.isEmpty ? "" : parts.removeFirst()
            var resolved = cssVariable(name)
            if resolved == nil && !parts.isEmpty {
                resolved = evaluateCssVariableExpression(parts.joined(separator: ", ")).split(separator: ",", omittingEmptySubsequences: false).first.map(String.init)
            }
            if resolved?.isEmpty ?? true { resolved = "unset" }
            output.replaceSubrange(start.lowerBound..<end.upperBound, with: resolved!)
        }
        return output
    }
}
