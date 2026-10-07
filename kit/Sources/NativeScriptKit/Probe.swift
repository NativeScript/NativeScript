import UIKit

/// What a running app's views are, as core holds them: set `NS_KIT_PROBE` in the
/// app's environment (`SIMCTL_CHILD_NS_KIT_PROBE=1 xcrun simctl launch --console …`)
/// and the view tree, each view's classes, matched selectors and resolved styles,
/// print once the first screen has settled. A seconds value delays it.
enum Probe {
    /// `NS_KIT_TRACE=Style,Layout` (or `All`): core's own trace of those categories, from launch.
    static func traceIfRequested() {
        guard let categories = ProcessInfo.processInfo.environment["NS_KIT_TRACE"] else { return }
        Trace.setCategories(categories == "All" ? Trace.categories.All : categories)
        Trace.enable()
    }

    static func scheduleIfRequested() {
        guard let value = ProcessInfo.processInfo.environment["NS_KIT_PROBE"] else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + (Double(value) ?? 3)) { dump() }
    }

    static func dump() {
        let app = Core_ui_styling_style_scope.self
        print("PROBE css: app selectors \(app.applicationCssSelectors?.length ?? -1), merged \(app.mergedApplicationCssSelectors?.length ?? -1)")
        guard let root = (try? Core_application_application.Application.getRootView()) ?? nil else { print("PROBE no root view"); return }
        visit(root, 0)
        if let view = firstMatched(root) { cascade(view) }
        print("PROBE end")
        fflush(stdout)
    }

    /// The first view a rule matches, of the class `NS_KIT_PROBE_CLASS` names when set.
    private static func firstMatched(_ view: ViewBase) -> ViewBase? {
        let wanted = ProcessInfo.processInfo.environment["NS_KIT_PROBE_CLASS"]
        if (view._cssState?._match?.selectors?.length ?? 0) > 0, wanted.map({ view.cssClasses?.has($0) == true }) ?? true { return view }
        var found: ViewBase?
        try? view.eachChild { child in if found == nil, let child { found = firstMatched(child) }; return found == nil }
        return found
    }

    /// Each step core takes from a matched rule to the view's style, for the first view a rule matches.
    private static func cascade(_ view: ViewBase) {
        print("PROBE cascade of \((try? view.typeName) ?? "?")")
        guard let style = view.style, let selectors = view._cssState?._match?.selectors else { return }
        for selector in selectors.elements {
            let declarations = (try? jsGet(selector, "ruleset")).flatMap { try? jsGet($0, "declarations") }
            print("PROBE   selector \(jsToString(selector)) declarations \(jsToString(declarations))")
            for declaration in (declarations as? JSArrayProtocol)?.jsAnyElements ?? [] {
                let property = jsToString((try? jsGet(declaration, "property")) ?? nil), value = (try? jsGet(declaration, "value")) ?? nil
                let has = jsHasKey(style, property)
                print("PROBE     \(property): \(jsToString(value)) in style=\(has)")
                do {
                    try jsSet(style, "css:\(property)", value)
                    print("PROBE       after css: write, style.\(property) = \(jsToString((try? jsGet(style, property)) ?? nil)), color \(jsToString(style.color)), fontSize \(style.fontSize)")
                } catch { print("PROBE       css: write threw \(jsToString(jsCaught(error)))") }
            }
        }
        let color = Core_ui_styling_style_properties.colorProperty!
        print("PROBE   colorProperty key \(color.key.key): stored \(jsToString((try? jsGet(style, color.key.key)) ?? nil)), source \(jsToString((try? jsGet(style, color.sourceKey.key)) ?? nil)), suspended \(jsToString((view as? View)?._suspendNativeUpdatesCount))")
    }

    private static func visit(_ view: ViewBase, _ depth: Int) {
        let pad = String(repeating: "  ", count: depth)
        let classes = view.cssClasses.map { Array($0).joined(separator: ".") } ?? ""
        let matched = view._cssState?._match?.selectors?.length ?? -1
        var line = "PROBE \(pad)\((try? view.typeName) ?? "?")\(classes.isEmpty ? "" : "." + classes) matched=\(matched)"
        if let state = view._cssState { line += " applied=[\(jsKeysOf(state._appliedPropertyValues).joined(separator: ","))] version=\(state._appliedSelectorsVersion)" }
        if let v = view as? View {
            let style = v.style!
            line += " bg=\(jsToString(style.backgroundColor)) color=\(jsToString(style.color)) font=\(jsToString(style.fontSize)) pad=\(jsToString(style.paddingTop))"
            if let native = v.nativeViewProtected as? UIView {
                line += " frame=\(native.frame)"
                if let recognizers = native.gestureRecognizers, !recognizers.isEmpty {
                    line += " gestures=[\(recognizers.map { "\(type(of: $0))\($0.isEnabled ? "" : " disabled")" }.joined(separator: ","))] interactive=\(native.isUserInteractionEnabled)"
                }
            }
        }
        print(line)
        try? view.eachChild { child in if let child { visit(child, depth + 1) }; return true }
    }
}
