import Foundation

/// nativescript-vue's `$showModal` and `$closeModal` over core's own `showModal`: a
/// modal opens from the topmost open one (presenting from a view that already presents
/// fails on iOS), else from the application's root view, and closes the topmost.
public enum Modal {
    private final class Shown {
        let view: View
        let owner: Owner
        var resolved = false
        init(view: View, owner: Owner) { self.view = view; self.owner = owner }
    }

    private static var stack: [Shown] = []

    /// `$showModal(Component, options)`. Effects the component creates end when it closes.
    public static func show(fullscreen: Bool = false, animated: Bool = true, cancelable: Bool = true, stretched: Bool = false,
                            closeCallback: ((Any) -> Void)? = nil, _ create: () -> View) {
        show([("fullscreen", fullscreen), ("animated", animated), ("cancelable", cancelable), ("stretched", stretched)], closeCallback: closeCallback, create)
    }

    /// A modal opened with `showModal` options given as script gives them (a dialog's `nativeOptions`), over the defaults core's own take.
    public static func show(options: Any?, closeCallback: ((Any) -> Void)? = nil, _ create: () -> View) {
        var settings: [(String, Any?)] = [("fullscreen", false), ("animated", true), ("cancelable", true), ("stretched", false)]
        for key in jsKeysOf(options) where key != "context" && key != "closeCallback" {
            let value = (try? jsGet(options, key)) ?? nil
            if let at = settings.firstIndex(where: { $0.0 == key }) { settings[at].1 = value } else { settings.append((key, value)) }
        }
        show(settings, closeCallback: closeCallback, create)
    }

    private static func show(_ settings: [(String, Any?)], closeCallback: ((Any) -> Void)?, _ create: () -> View) {
        jsReport {
            guard let target = try stack.last?.view ?? Core_application_application.Application.getRootView() else { return }
            let owner = Owner(parent: nil)
            let view = owner.run(create)
            let shown = Shown(view: view, owner: owner)
            let close: JSFunction = { args in
                guard !shown.resolved else { return nil }
                shown.resolved = true
                stack.removeAll { $0 === shown }
                owner.dispose()
                closeCallback?((args.first ?? nil) as Any)
                return nil
            }
            let options = JSObject([("context", jsNull as Any?), ("closeCallback", close as Any?)] + settings)
            _ = try target.showModal(view, options)
            // Core refuses to present (the target presents already, or is not in a window) by tracing and returning.
            guard view._modalParent != nil else {
                owner.dispose()
                throw JSException(JSError("Could not show modal: \(jsConstructorName(target)) refused to present it."))
            }
            stack.append(shown)
        }
    }

    /// `$closeModal(result)`: the topmost modal, closed with what its close callback receives.
    public static func close(_ result: Any? = nil) {
        guard let shown = stack.last else { return }
        stack.removeLast()
        jsReport { try shown.view.closeModal(JSArray<Any?>([result])) }
    }
}
