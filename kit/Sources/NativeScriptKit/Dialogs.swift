import UIKit

/// `Dialogs` from ui/dialogs (iOS): UIAlertControllers presented by the topmost presented controller.
public enum Dialogs {
    /// `isDialogOptions`: an object with a title or a message is options, anything else the message.
    private static func options(_ arg: Any?, _ defaults: [(String, Any?)]) -> JSDynamic {
        if let o = jsFlat(arg) as? JSDynamic, !(jsFlat(arg) is String), o[jsKey: "message"] != nil || o[jsKey: "title"] != nil { return o }
        return JSObject(defaults + [("message", jsToString(arg))])
    }

    private static func text(_ o: JSDynamic, _ key: String) -> String? { jsFlat(o[jsKey: key]) as? String }

    private static func addButtons(_ alert: UIAlertController, _ o: JSDynamic, _ callback: @escaping (Bool?) -> Void) {
        if let cancel = text(o, "cancelButtonText") { alert.addAction(UIAlertAction(title: cancel, style: .default) { _ in callback(false) }) }
        if let neutral = text(o, "neutralButtonText") { alert.addAction(UIAlertAction(title: neutral, style: .default) { _ in callback(nil) }) }
        if let ok = text(o, "okButtonText") {
            let action = UIAlertAction(title: ok, style: .default) { _ in callback(true) }
            alert.addAction(action)
            alert.preferredAction = action
        }
    }

    private static func show(_ alert: UIAlertController) {
        var controller = Appearance.window?.rootViewController
        while let presented = controller?.presentedViewController, !presented.isBeingDismissed { controller = presented }
        guard let controller else { return }
        if let popover = alert.popoverPresentationController {
            popover.sourceView = controller.view
            popover.sourceRect = CGRect(x: controller.view.bounds.width / 2, y: controller.view.bounds.height / 2, width: 1, height: 1)
            popover.permittedArrowDirections = []
        }
        controller.present(alert, animated: true)
    }

    private static func settle<T>(_ promise: JSResolvers<T>, _ value: T) {
        promise.resolve(value)
        Microtasks.checkpoint()
    }

    public static func alert(_ arg: Any?) -> JSPromise<Void> {
        let o = options(arg, [("title", "Alert"), ("okButtonText", "OK")])
        let (promise, resolvers) = JSPromise<Void>.pending()
        let alert = UIAlertController(title: text(o, "title"), message: text(o, "message"), preferredStyle: .alert)
        addButtons(alert, o) { _ in settle(resolvers, ()) }
        show(alert)
        return promise
    }

    public static func confirm(_ arg: Any?) -> JSPromise<Bool> {
        let o = options(arg, [("title", "Confirm"), ("okButtonText", "OK"), ("cancelButtonText", "Cancel")])
        let (promise, resolvers) = JSPromise<Bool>.pending()
        let alert = UIAlertController(title: text(o, "title"), message: text(o, "message"), preferredStyle: .alert)
        addButtons(alert, o) { result in settle(resolvers, result ?? false) }
        show(alert)
        return promise
    }

    public static func prompt(_ arg: Any?, _ defaultText: Any? = nil) -> JSPromise<PromptResult> {
        let o: JSDynamic
        if jsFlat(arg) is String {
            o = JSObject([("title", "Prompt"), ("okButtonText", "OK"), ("cancelButtonText", "Cancel"), ("inputType", "text"), ("message", arg), ("defaultText", jsFlat(defaultText) as? String)])
        } else {
            o = (jsFlat(arg) as? JSDynamic) ?? JSObject([])
        }
        let (promise, resolvers) = JSPromise<PromptResult>.pending()
        let alert = UIAlertController(title: text(o, "title"), message: text(o, "message"), preferredStyle: .alert)
        alert.addTextField { field in
            field.text = text(o, "defaultText") ?? ""
            let input = text(o, "inputType")
            field.isSecureTextEntry = input == "password"
            switch input {
            case "email": field.keyboardType = .emailAddress
            case "number": field.keyboardType = .numberPad
            case "decimal": field.keyboardType = .decimalPad
            case "phone": field.keyboardType = .phonePad
            default: break
            }
        }
        let field = alert.textFields!.first!
        switch text(o, "capitalizationType") {
        case "all": field.autocapitalizationType = .allCharacters
        case "sentences": field.autocapitalizationType = .sentences
        case "words": field.autocapitalizationType = .words
        default: field.autocapitalizationType = .none
        }
        addButtons(alert, o) { result in settle(resolvers, PromptResult(result: result ?? false, text: field.text ?? "")) }
        show(alert)
        return promise
    }
}

/// `PromptResult`: the button the prompt closed with, and its text.
public final class PromptResult: JSDynamic {
    public var result: Bool
    public var text: String
    init(result: Bool, text: String) { self.result = result; self.text = text }

    public subscript(jsKey key: String) -> Any? {
        get { key == "result" ? result : key == "text" ? text : nil }
        set {}
    }
    public var jsKeys: [String] { ["result", "text"] }
    public var jsClassName: String? { "Object" }
}
