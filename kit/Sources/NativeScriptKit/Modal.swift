import UIKit

/// Modal views as view/index.ios and view-common present them, opened the way
/// nativescript-vue's `$showModal` does: from the topmost open modal, else the
/// application's root view.
public enum Modal {
    private final class Record {
        let view: View
        weak var parent: View?
        let owner: Owner
        let animated: Bool
        let closeCallback: ((Any) -> Void)?
        var closing = false

        init(view: View, parent: View, owner: Owner, animated: Bool, closeCallback: ((Any) -> Void)?) {
            self.view = view
            self.parent = parent
            self.owner = owner
            self.animated = animated
            self.closeCallback = closeCallback
        }
    }

    private static var stack: [Record] = []
    static weak var root: View?

    /// `showModal(view, options)`. Effects created while building the view end when it closes.
    public static func show(fullscreen: Bool = false, animated: Bool = true, cancelable: Bool = true, from parent: View? = nil,
                            closeCallback: ((Any) -> Void)? = nil, _ create: () -> View) {
        guard let target = parent ?? stack.last?.view ?? root,
              let parentController = viewControllerOwner(of: target)?.viewController else { return }
        // A controller presents one modal at a time, and only from the window.
        guard parentController.presentedViewController == nil, parentController.view.window != nil else { return }
        let owner = Owner(parent: nil)
        let view = owner.run(create)
        let controller: UIViewController
        if let own = view.viewController {
            controller = own
        } else {
            let layoutController = LayoutViewController(owner: view)
            if let nativeView = view.nativeView { layoutController.view.addSubview(nativeView) }
            view.viewController = layoutController
            controller = layoutController
        }
        var classes = Appearance.rootClasses(modal: true)
        classes.subtract(classes.filter { $0.hasPrefix("a11y-") })
        view.rootClasses = classes
        let record = Record(view: view, parent: target, owner: owner, animated: animated, closeCallback: closeCallback)
        stack.append(record)
        controller.modalPresentationStyle = fullscreen ? .fullScreen : .formSheet
        if cancelable {
            controller.presentationController?.delegate = DismissDelegate.shared
        } else {
            controller.isModalInPresentation = true
        }
        view.set("horizontalAlignment", "stretch")
        view.set("verticalAlignment", "stretch")
        parentController.present(controller, animated: animated)
    }

    /// `closeModal(result)` on the topmost modal: dismissed, then its close callback runs.
    public static func close(_ result: Any? = nil) {
        guard let record = stack.last, !record.closing else { return }
        record.closing = true
        stack.removeAll { $0 === record }
        let whenClosed = {
            record.closeCallback?(result as Any)
            Frame.forget(record.view)
            record.view.unload()
            record.owner.dispose()
        }
        guard let parentController = record.parent.flatMap(viewControllerOwner(of:))?.viewController,
              parentController.presentedViewController != nil else { return whenClosed() }
        parentController.dismiss(animated: record.animated, completion: whenClosed)
    }

    /// A modal the user swiped away closes without a result.
    fileprivate static func dismissedByUser(_ controller: UIViewController) {
        guard let record = stack.last(where: { $0.view.viewController === controller }) else { return }
        stack.removeAll { $0 === record }
        record.closeCallback?(Optional<Any>.none as Any)
        Frame.forget(record.view)
        record.view.unload()
        record.owner.dispose()
    }

    /// `IOSHelper.getParentWithViewController`.
    private static func viewControllerOwner(of view: View) -> View? {
        var current: View? = view
        while let candidate = current, candidate.viewController == nil { current = candidate.parent }
        return current
    }

    private final class DismissDelegate: NSObject, UIAdaptivePresentationControllerDelegate {
        static let shared = DismissDelegate()

        func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
            Modal.dismissedByUser(presentationController.presentedViewController)
        }
    }
}

extension View {
    /// `view.showModal(modalView, options)` from script: presented from this view.
    @discardableResult
    public func showModal(_ modal: Any?, _ options: Any? = nil) -> View! {
        guard let modal = modal as? View else { return nil }
        func option(_ key: String) -> Any? {
            guard let options else { return nil }
            return (try? jsGet(options, key)) ?? nil
        }
        let callback = option("closeCallback")
        Modal.show(fullscreen: toBool(option("fullscreen")) ?? false, animated: toBool(option("animated")) ?? true,
                   cancelable: toBool(option("cancelable")) ?? true, from: self,
                   closeCallback: callback.map { function in { result in _ = try? jsCall(function, result) } }) { modal }
        return modal
    }

    /// `view.closeModal(result)`: closes the topmost modal.
    public func closeModal(_ result: Any? = nil) { Modal.close(result) }
}
