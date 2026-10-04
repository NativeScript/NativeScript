import UIKit

/// `Application` from @nativescript/core (application/application.ios):
/// the running app's events, its window and its appearance, for script.
public enum Application {
    private static let events = Observable()

    public static var ios: iOSApplication { iOSApplication.shared }

    /// `run({ create })`: the app's root view from `create`; does not return.
    public static func run(_ entry: Any?) {
        let create = (jsFlat(entry) as? JSDynamic)?[jsKey: "create"]
        NativeScriptApplication.run(css: NativeScriptApplication.css) {
            (jsReported { try jsCall(create) } ?? nil) as? View ?? ContentView()
        }
    }

    public static func on(_ eventNames: String, _ callback: @escaping (EventData) throws -> Void, _ thisArg: Any? = nil, key: String? = nil) {
        events.on(eventNames, callback, thisArg, key: key)
    }

    public static func off(_ eventNames: String, _ callback: ((EventData) throws -> Void)? = nil, _ thisArg: Any? = nil, key: String? = nil) {
        events.off(eventNames, callback, thisArg, key: key)
    }

    public static func notify(_ data: Any?) { events.notify(data) }

    /// `setWindowContentResolver(resolver)`: content for windows other than the primary one, which this app has none of.
    public static func setWindowContentResolver(_ resolver: Any?) { windowContentResolver = resolver }
    static var windowContentResolver: Any?

    public static var primaryWindow: NativeWindow? { NativeWindow.primary }

    /// `systemAppearance()`: "light" or "dark".
    public static func systemAppearance() -> String? { Appearance.systemAppearance }

    public static func orientation() -> String { Appearance.orientation }

    public static func hasLaunched() -> Bool { Appearance.window != nil }

    static func appearanceChanged(_ value: String) {
        notify(JSObject([("eventName", "systemAppearanceChanged"), ("object", events), ("newValue", value)]))
    }
}

/// `Application.ios`: the iOS side of the application object.
public final class iOSApplication {
    static let shared = iOSApplication()

    public var window: UIWindow? { Appearance.window }
    public var rootController: UIViewController? { Appearance.window?.rootViewController }
    public var nativeApp: UIApplication { UIApplication.shared }
}

/// `NativeWindow` (core 9.1's multi-window model): the app's one window.
public final class NativeWindow: JSDynamic {
    static let primary = NativeWindow()

    public var ios: iOSApplication { iOSApplication.shared }

    public subscript(jsKey key: String) -> Any? {
        get { nil }
        set {}
    }
    public var jsKeys: [String] { [] }
    public var jsClassName: String? { "NativeWindow" }
}
