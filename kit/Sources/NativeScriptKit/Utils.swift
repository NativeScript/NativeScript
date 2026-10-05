import UIKit

/// `Utils` from @nativescript/core's utils (iOS): numbers are JavaScript's.
public enum Utils {
    /// `SDK_VERSION`: `parseFloat(UIDevice.currentDevice.systemVersion)`.
    public static var SDK_VERSION: Double { jsParseFloat(UIDevice.current.systemVersion) }

    public static func isRealDevice() -> Bool {
        ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] == nil
    }

    /// `dismissSoftInput()`: whatever is first responder resigns.
    public static func dismissKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }

    public static func dismissSoftInput(_ nativeView: UIView? = nil) {
        if let nativeView, !nativeView.isFirstResponder { return }
        dismissKeyboard()
    }

    public static func copyToClipboard(_ value: String) {
        UIPasteboard.general.string = value
    }

    /// `openUrl(location)`: opened when the app can open it, which it answers at once.
    @discardableResult
    public static func openUrl(_ location: String) -> Bool {
        guard let url = URL(string: location.trimmingCharacters(in: .whitespacesAndNewlines)), UIApplication.shared.canOpenURL(url) else { return false }
        UIApplication.shared.open(url)
        return true
    }

    /// `dispatchToMainThread(fn)`: on the main operation queue, after the current task.
    public static func dispatchToMainThread(_ fn: @escaping () -> Void) {
        OperationQueue.main.addOperation {
            fn()
            Microtasks.checkpoint()
        }
    }

    public static func isMainThread() -> Bool { Thread.isMainThread }

    /// `Utils.layout`: core's layout-helper, generated from core.
    public typealias layout = NativeScriptKit.layout

    public enum ios {
        /// The window NativeScript drives.
        public static func getWindow() -> UIWindow? { Appearance.window }

        /// The window's root controller, then whatever it presents, all the way up.
        public static func getRootViewController() -> UIViewController? {
            var controller = getWindow()?.rootViewController
            while let presented = controller?.presentedViewController { controller = presented }
            return controller
        }

        /// `getMainScreen()`: the window's screen, else the main screen.
        public static func getMainScreen() -> UIScreen { getWindow()?.screen ?? UIScreen.main }

        public static func getVisibleViewController(_ root: UIViewController?) -> UIViewController? {
            var controller = root
            while let presented = controller?.presentedViewController { controller = presented }
            return controller
        }

        public enum collections {
            public static func jsArrayToNSArray(_ array: JSArray<Any?>) -> [Any] { array.storage.compactMap { jsFlat($0) } }
            public static func nsArrayToJSArray(_ array: [Any]?) -> JSArray<Any?> { JSArray((array ?? []).map { $0 as Any? }) }
        }
    }
}

/// `booleanConverter` from core's view-base: the strings "true"/"false" in any case; anything else as it is.
public func booleanConverter(_ value: Any?) -> Bool {
    if let string = jsFlat(value) as? String { return string.lowercased() == "true" }
    return jsTruthy(value)
}

/// Whether the running OS is at least `version` (a class introduced later reads as undefined before it).
public func jsOSAtLeast(_ version: Double) -> Bool {
    let major = Int(version), minor = Int(((version - Double(major)) * 10).rounded())
    return ProcessInfo.processInfo.isOperatingSystemAtLeast(OperatingSystemVersion(majorVersion: major, minorVersion: minor, patchVersion: 0))
}
